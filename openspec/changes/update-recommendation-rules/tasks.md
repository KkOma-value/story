## 1. Implementation
- [x] 1.1 更新 recommendations 的变更规格，补充算法规则与权重
- [x] 1.2 调整离线协同过滤输入，纳入阅读历史并应用行为信号权重（收藏/评分 8:2）
- [x] 1.3 统一个性化推荐混合权重（CF 0.6 / Content 0.4），冷启动回退热门
- [x] 1.4 更新热门推荐排序公式（收藏/阅读/评分 50%/30%/20%）
- [x] 1.5 新增或更新后端测试（个性化权重、冷启动、热门排序）

## 2. Validation
- [x] 2.1 python manage.py test recommendations
- [ ] 2.2 python manage.py test interactions（登录返回 data=None 导致失败）
