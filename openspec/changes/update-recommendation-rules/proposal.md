# Change: Update recommendation algorithm rules

## Why
当前推荐已具备基础能力，但缺少明确的推荐算法规则与权重定义，导致实现和评估难以一致。

## What Changes
- 明确个性化推荐的混合策略与权重（协同过滤 0.6、内容推荐 0.4）并规定冷启动回退为热门推荐。
- 明确行为信号权重：收藏与评分按 8:2 组合，并将阅读历史作为隐式反馈信号。
- 明确热门推荐的加权排序规则：收藏数/阅读量/评分占比 50%/30%/20%。
- 更新 recommendations 规格及对应测试计划。

## Impact
- Affected specs: recommendations
- Affected code: backend/recommendations/*、backend/interactions/*（ReadHistory 参与）、相关测试
