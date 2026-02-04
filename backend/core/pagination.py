from __future__ import annotations

from dataclasses import dataclass

from django.core.paginator import EmptyPage, Paginator


@dataclass(frozen=True)
class PageResult:
    items: list
    total: int
    page: int
    page_size: int


def paginate_queryset(queryset, *, page: int, page_size: int):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    paginator = Paginator(queryset, page_size)
    try:
        page_obj = paginator.page(page)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages if paginator.num_pages else 1)

    return PageResult(
        items=list(page_obj.object_list),
        total=paginator.count,
        page=page_obj.number,
        page_size=page_size,
    )
