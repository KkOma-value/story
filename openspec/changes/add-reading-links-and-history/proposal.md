# Change: Add external reading links and history capture

## Why
Readers expect the “开始修炼” action to open the real book page from the source Excel, and the history page should reflect that action for logged-in users.

## What Changes
- Add a novel external reading link sourced from the Excel “链接” column and aligned by book name (and author as a tie-breaker).
- Update novel detail “开始修炼” to open the external link in a new tab.
- Record a read-history entry when an authenticated user clicks “开始修炼”, and surface it in the history page.
- Keep unauthenticated users blocked from “藏书/足迹” routes (already enforced by route guards).

## Impact
- Affected specs: catalog, interactions, users
- Affected code: backend novel model/serializers/import, history APIs, frontend novel detail and history integration
- Data source: Excel file at D:\JavaCode\story\(全部)20年5月至24年5月2日天榜双榜数据、首日收藏6000(或2000v)，以及近2个月综合数据前500、v收排行前500的作品数据(4)
