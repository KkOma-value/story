from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, Iterable, Optional, Tuple

import xlrd

try:
    import win32com.client  # type: ignore
except Exception:
    win32com = None
DEFAULT_XLS = "(全部)20年5月至24年5月2日天榜双榜数据、首日收藏6000(或2000v)，以及近2个月综合数据前500、v收排行前500的作品数据(4).xls"


def _norm_text(v: Any) -> str:
    if v is None:
        return ""
    return str(v).strip()


def _norm_key(text: str) -> str:
    text = _norm_text(text)
    text = re.sub(r"\s+", " ", text)
    return text.lower()


def _to_int(v: Any) -> Optional[int]:
    if v is None:
        return None
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int,)):
        return int(v)
    if isinstance(v, float):
        if v != v:  # NaN
            return None
        return int(v)
    s = _norm_text(v)
    if not s or s in {"-", "未统计", "未上"}:
        return None
    try:
        if re.fullmatch(r"-?\d+", s):
            return int(s)
        return int(float(s))
    except Exception:
        return None


def _to_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, (int, float)):
        if isinstance(v, float) and v != v:
            return None
        return float(v)
    s = _norm_text(v)
    if not s or s in {"-", "未统计", "未上"}:
        return None
    try:
        return float(s)
    except Exception:
        return None


def _iso_dt(v: Any) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.replace(microsecond=0).isoformat(sep=" ")
    if isinstance(v, date):
        return datetime(v.year, v.month, v.day).isoformat(sep=" ")
    s = _norm_text(v)
    if not s:
        return None
    # Best-effort: let MySQL parse common formats.
    return s


def _merge_pref(old: Any, new: Any) -> Any:
    if old is None or _norm_text(old) == "":
        return new
    if new is None or _norm_text(new) == "":
        return old
    return old


@dataclass
class BookAgg:
    source_book_id: int

    title: str = ""
    author: str = ""
    category: str = ""  # primary category
    subcategory: str = ""

    favorites_count: int = 0
    views_proxy: int = 0
    word_count: int = 0

    source_url: str = ""

    first_day_v: Optional[int] = None
    first_day_favorites: Optional[int] = None
    first_day_flowers: Optional[int] = None
    first_day_reward: Optional[int] = None
    first_day_rating: Optional[int] = None
    first_day_reviews: Optional[int] = None
    first_day_words_k: Optional[float] = None

    created_at: Optional[str] = None
    first榜_date: Optional[str] = None
    last榜_date: Optional[str] = None

    best_rank: Optional[int] = None
    worst_rank: Optional[int] = None
    total_times: Optional[int] = None

    in_xls: bool = False



def _xls_row_map(header: Iterable[str]) -> Dict[str, int]:
    cleaned = [_norm_text(h).replace("\n", "").replace(" ", "") for h in header]
    return {name: i for i, name in enumerate(cleaned)}


def _xls_get(row: list[Any], idx_map: Dict[str, int], key: str) -> Any:
    i = idx_map.get(key)
    if i is None or i >= len(row):
        return None
    return row[i]


def _xls_get_hyperlink(sh: xlrd.sheet.Sheet, row_idx: int, col_idx: int) -> Optional[str]:
    try:
        link = sh.hyperlink_map.get((row_idx, col_idx))
    except Exception:
        return None
    if not link:
        return None

    url = getattr(link, "url", None)
    if url:
        return str(url).strip()
    url_or_path = getattr(link, "url_or_path", None)
    if url_or_path:
        return str(url_or_path).strip()
    return None


def _parse_hyperlink_formula(formula: str) -> Optional[str]:
    if not formula:
        return None
    if "HYPERLINK" not in formula.upper():
        return None
    match = re.search(r"HYPERLINK\(\s*\"([^\"]+)\"", formula, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    match = re.search(r"HYPERLINK\(\s*'([^']+)'", formula, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def _load_com_hyperlinks(xls_path: Path) -> Dict[Tuple[str, int, int], str]:
    if not win32com:
        return {}

    links: Dict[Tuple[str, int, int], str] = {}
    excel = None
    workbook = None
    try:
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False
        workbook = excel.Workbooks.Open(str(xls_path), ReadOnly=True)

        for sheet in workbook.Worksheets:
            sheet_name = sheet.Name
            used_range = sheet.UsedRange
            rows = used_range.Rows.Count
            cols = used_range.Columns.Count

            header = [str(sheet.Cells(1, c).Value).replace("\n", "").replace(" ", "") for c in range(1, cols + 1)]
            if "链接" not in header:
                continue
            link_col = header.index("链接") + 1

            for r in range(2, rows + 1):
                cell = sheet.Cells(r, link_col)
                try:
                    if cell.Hyperlinks.Count > 0:
                        hl = cell.Hyperlinks(1)
                        address = hl.Address or ""
                        if address:
                            links[(sheet_name, r - 1, link_col - 1)] = str(address).strip()
                            continue
                except Exception:
                    continue

                try:
                    formula = cell.Formula
                except Exception:
                    formula = ""
                parsed = _parse_hyperlink_formula(str(formula or ""))
                if parsed:
                    links[(sheet_name, r - 1, link_col - 1)] = parsed
    except Exception:
        return links
    finally:
        if workbook is not None:
            workbook.Close(False)
        if excel is not None:
            excel.Quit()

    return links


def _xls_date(v: Any, book: xlrd.book.Book) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.replace(microsecond=0).isoformat(sep=" ")
    if isinstance(v, (int, float)):
        # Excel date serial
        try:
            dt = xlrd.xldate_as_datetime(v, book.datemode)
            return dt.replace(microsecond=0).isoformat(sep=" ")
        except Exception:
            return None
    s = _norm_text(v)
    return s or None


def read_xls(path: Path) -> Tuple[Dict[int, BookAgg], Dict[Tuple[str, str], int]]:
    book = xlrd.open_workbook(str(path), on_demand=True, formatting_info=True)
    com_links = _load_com_hyperlinks(path)

    by_id: Dict[int, BookAgg] = {}
    name_author_to_id: Dict[Tuple[str, str], int] = {}
    name_author_count: Dict[Tuple[str, str], int] = {}
    name_author_to_link: Dict[Tuple[str, str], str] = {}

    for sheet_name in book.sheet_names():
        sh = book.sheet_by_name(sheet_name)
        if sh.nrows <= 1:
            continue

        header_raw = sh.row_values(0)
        idx_map = _xls_row_map(header_raw)

        # normalize known keys (remove spaces/newlines)
        key_book_id = "书号"
        key_title = "书名"
        key_author = "作者"
        key_cat1 = "一级分类"
        key_cat2 = "二级分类"
        key_link = "链接"

        for r in range(1, sh.nrows):
            row = sh.row_values(r)
            book_id = _to_int(_xls_get(row, idx_map, key_book_id))
            title = _norm_text(_xls_get(row, idx_map, key_title))
            author = _norm_text(_xls_get(row, idx_map, key_author))
            link = _norm_text(_xls_get(row, idx_map, key_link))
            link_idx = idx_map.get(key_link)
            if link_idx is not None:
                hyperlink = _xls_get_hyperlink(sh, r, link_idx)
                if not hyperlink:
                    try:
                        formula = sh.cell_formula(r, link_idx)
                    except Exception:
                        formula = None
                    hyperlink = _parse_hyperlink_formula(formula or "")
                if not hyperlink and com_links:
                    hyperlink = com_links.get((sheet_name, r, link_idx))
                if hyperlink:
                    link = hyperlink

            if title and author and link:
                k = (_norm_key(title), _norm_key(author))
                if k not in name_author_to_link:
                    name_author_to_link[k] = link

            if not book_id:
                continue

            agg = by_id.get(book_id)
            if not agg:
                agg = BookAgg(source_book_id=book_id)
                by_id[book_id] = agg

            agg.in_xls = True
            if title:
                agg.title = _merge_pref(agg.title, title)
            if author:
                agg.author = _merge_pref(agg.author, author)
            if link:
                agg.source_url = _merge_pref(agg.source_url, link)

            cat1 = _norm_text(_xls_get(row, idx_map, key_cat1))
            cat2 = _norm_text(_xls_get(row, idx_map, key_cat2))
            if cat1:
                agg.category = _merge_pref(agg.category, cat1)
            if cat2:
                agg.subcategory = _merge_pref(agg.subcategory, cat2)

            # metrics (best-effort across different sheets)
            read_count = _to_int(_xls_get(row, idx_map, "阅读"))
            if read_count is not None:
                agg.views_proxy = max(agg.views_proxy, read_count)

            first_day_v = _to_int(_xls_get(row, idx_map, "首日v收"))
            if first_day_v is not None:
                agg.first_day_v = max(agg.first_day_v or 0, first_day_v)

            fd_fav = _to_int(_xls_get(row, idx_map, "首日收藏"))
            if fd_fav is not None:
                agg.first_day_favorites = max(agg.first_day_favorites or 0, fd_fav)

            word_count = _to_int(_xls_get(row, idx_map, "字数"))
            if word_count is not None:
                agg.word_count = max(agg.word_count, word_count)

            fd_flowers = _to_int(_xls_get(row, idx_map, "首日鲜花"))
            if fd_flowers is not None:
                agg.first_day_flowers = max(agg.first_day_flowers or 0, fd_flowers)

            fd_reward = _to_int(_xls_get(row, idx_map, "首日打赏"))
            if fd_reward is not None:
                agg.first_day_reward = max(agg.first_day_reward or 0, fd_reward)

            fd_rating = _to_int(_xls_get(row, idx_map, "首日评价"))
            if fd_rating is not None:
                agg.first_day_rating = max(agg.first_day_rating or 0, fd_rating)

            fd_reviews = _to_int(_xls_get(row, idx_map, "首日书评数"))
            if fd_reviews is None:
                fd_reviews = _to_int(_xls_get(row, idx_map, "书评"))
            if fd_reviews is not None:
                agg.first_day_reviews = max(agg.first_day_reviews or 0, fd_reviews)

            fd_words_k = _to_float(_xls_get(row, idx_map, "首日字数(千)"))
            if fd_words_k is not None:
                agg.first_day_words_k = max(agg.first_day_words_k or 0.0, fd_words_k)

            best_rank = _to_int(_xls_get(row, idx_map, "最好名次(双榜)"))
            if best_rank is not None:
                agg.best_rank = min(agg.best_rank, best_rank) if agg.best_rank is not None else best_rank

            worst_rank = _to_int(_xls_get(row, idx_map, "最差名次(双榜)"))
            if worst_rank is not None:
                agg.worst_rank = max(agg.worst_rank or 0, worst_rank)

            total_times = _to_int(_xls_get(row, idx_map, "总次数(双榜)"))
            if total_times is None:
                total_times = _to_int(_xls_get(row, idx_map, "上榜次数(双榜)"))
            if total_times is not None:
                agg.total_times = max(agg.total_times or 0, total_times)

            created_at = _xls_date(_xls_get(row, idx_map, "入库时间"), book)
            if created_at:
                agg.created_at = _merge_pref(agg.created_at, created_at)

            first_date = _xls_date(_xls_get(row, idx_map, "首次上榜日期(双榜)"), book)
            if first_date:
                agg.first榜_date = _merge_pref(agg.first榜_date, first_date)

            last_date = _xls_date(_xls_get(row, idx_map, "末次上榜日期(双榜)"), book)
            if last_date:
                agg.last榜_date = _merge_pref(agg.last榜_date, last_date)

            if title and author:
                k = (_norm_key(title), _norm_key(author))
                name_author_count[k] = name_author_count.get(k, 0) + 1
                # only assign later if unique

    for (t, a), cnt in name_author_count.items():
        if cnt == 1:
            # find the id by scanning by_id
            # (O(n)) but dataset is small enough (~6k)
            for book_id, agg in by_id.items():
                if _norm_key(agg.title) == t and _norm_key(agg.author) == a:
                    name_author_to_id[(t, a)] = book_id
                    break

    for (t, a), link in name_author_to_link.items():
        book_id = name_author_to_id.get((t, a))
        if not book_id:
            continue
        agg = by_id.get(book_id)
        if agg and not _norm_text(agg.source_url):
            agg.source_url = link

    book.release_resources()
    return by_id, name_author_to_id


def build_records(xls_by_id: Dict[int, BookAgg]) -> list[Dict[str, Any]]:
    records: list[Dict[str, Any]] = []
    for book_id, agg in sorted(xls_by_id.items(), key=lambda kv: kv[0]):
        # derive intro (must be non-empty for Django; also useful for MySQL search)
        intro_parts = []
        if agg.category:
            intro_parts.append(f"分类:{agg.category}")
        if agg.subcategory:
            intro_parts.append(f"二级:{agg.subcategory}")
        if agg.favorites_count:
            intro_parts.append(f"收藏数:{agg.favorites_count}")
        if agg.word_count:
            intro_parts.append(f"字数:{agg.word_count}")
        if agg.first_day_v is not None:
            intro_parts.append(f"首日v收:{agg.first_day_v}")
        intro_parts.append("来源:excel")
        intro = "；".join(intro_parts) or "来源:excel"

        tags_obj = {
            "sourceBookId": agg.source_book_id,
            "inXls": agg.in_xls,
        }
        if agg.created_at:
            tags_obj["xlsCreatedAt"] = agg.created_at
        if agg.first榜_date:
            tags_obj["firstRankDate"] = agg.first榜_date
        if agg.last榜_date:
            tags_obj["lastRankDate"] = agg.last榜_date

        tags_json = json.dumps(tags_obj, ensure_ascii=False, separators=(",", ":"))

        # favorites_count fallback when a better metric is unavailable
        favorites_count = agg.favorites_count
        if favorites_count <= 0 and agg.first_day_favorites:
            favorites_count = agg.first_day_favorites

        updated_at = None

        records.append(
            {
                "source_book_id": agg.source_book_id,
                "title": agg.title,
                "author": agg.author,
                "category": agg.category,
                "subcategory": agg.subcategory,
                "source_url": agg.source_url,
                "intro": intro,
                "tags_json": tags_json,
                "favorites_count": favorites_count,
                "views_proxy": agg.views_proxy,
                "word_count": agg.word_count,
                "status": "published",
                "updated_at": updated_at,
                "first_day_v": agg.first_day_v,
                "first_day_favorites": agg.first_day_favorites,
                "first_day_flowers": agg.first_day_flowers,
                "first_day_reward": agg.first_day_reward,
                "first_day_rating": agg.first_day_rating,
                "first_day_reviews": agg.first_day_reviews,
                "first_day_words_k": agg.first_day_words_k,
                "best_rank": agg.best_rank,
                "worst_rank": agg.worst_rank,
                "total_times": agg.total_times,
            }
        )

    return records


def write_csv(out_path: Path, records: list[Dict[str, Any]]) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)

    columns = [
        "source_book_id",
        "title",
        "author",
        "category",
        "subcategory",
        "source_url",
        "intro",
        "tags_json",
        "favorites_count",
        "views_proxy",
        "word_count",
        "status",
        "updated_at",
        "first_day_v",
        "first_day_favorites",
        "first_day_flowers",
        "first_day_reward",
        "first_day_rating",
        "first_day_reviews",
        "first_day_words_k",
        "best_rank",
        "worst_rank",
        "total_times",
    ]

    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore", quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for row in records:
            writer.writerow({k: ("" if row.get(k) is None else row.get(k)) for k in columns})


def main() -> int:
    ap = argparse.ArgumentParser(description="Preprocess the legacy .xls data and output a MySQL-importable CSV keyed by source book id (书号).")
    ap.add_argument("--root", default=str(Path(__file__).resolve().parents[2]), help="Repo root (defaults to workspace root).")
    ap.add_argument("--xls", default=DEFAULT_XLS, help="XLS filename under root.")
    ap.add_argument("--out", default=str(Path(__file__).with_name("novels_mysql.csv")), help="Output CSV path.")

    args = ap.parse_args()

    root = Path(args.root)
    xls_path = root / args.xls
    out_path = Path(args.out)

    if not xls_path.exists():
        raise SystemExit(f"XLS not found: {xls_path}")

    print("Reading XLS...")
    xls_by_id, xls_name_map = read_xls(xls_path)
    print(f"XLS books: {len(xls_by_id)}")
    print(f"XLS unique (title,author) keys: {len(xls_name_map)}")

    records = build_records(xls_by_id)

    write_csv(out_path, records)
    print(f"Wrote CSV: {out_path} (rows={len(records)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
