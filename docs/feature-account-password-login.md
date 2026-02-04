# 账号密码登录系统功能文档
> 功能状态：✅ 已完成 | 文档版本：1.0 | 最后更新：2026-01-18

## 功能概述

实现了完整的账号密码登录系统，支持账号名或邮箱登录，包含邮箱验证码注册和密码重置功能。

**核心特性：**
- 支持账号名或邮箱作为登录凭证
- 邮箱验证码注册流程
- 密码重置功能（邮箱验证码验证）
- JWT Token认证（24小时有效期）
- 前后端分离架构，统一的API接口

---

## 技术架构

### 技术栈

**前端：**
- React 18 + TypeScript + Vite
- Ant Design 5.x（UI组件库）
- React Router 6（路由管理）
- Axios（HTTP客户端）
- MobX/Context（状态管理）

**后端：**
- Django 4.2 + Django REST Framework
- JWT认证（djangorestframework-simplejwt）
- SQLite（开发）/ MySQL（生产）
- Python 3.11+

### 核心功能模块

```
frontend/
├── src/
│   ├── api/              # API客户端
│   │   ├── auth.ts       # 认证相关接口
│   │   ├── real.ts       # 真实API实现
│   │   └── mock.ts       # Mock API实现
│   ├── pages/
│   │   ├── LoginPage.tsx         # 登录页面
│   │   ├── RegisterPage.tsx      # 注册页面
│   │   └── ResetPasswordPage.tsx # 密码重置页面
│   ├── hooks/
│   │   └── useAuth.tsx   # 认证状态管理
│   └── router/
│       └── index.tsx     # 路由配置

backend/
├── users/
│   ├── models.py         # 自定义User模型
│   ├── api_auth.py       # 登录注册API
│   └── api_me.py         # 个人信息API
├── novels/               # 小说模块
├── interactions/         # 用户互动模块
└── recommendations/      # 推荐模块
```

---

## 功能详情

### 1. 登录功能

#### 登录流程
```mermaid
graph TD
    A[用户输入账号/邮箱和密码] --> B[前端表单验证]
    B --> C{验证通过?}
    C --否--> D[显示错误信息]
    C --是--> E[调用登录API]
    E --> F{账号存在且密码正确?}
    F --否--> G[返回401错误]
    G --> H[显示登录失败]
    F --是--> I[生成JWT Token]
    I --> J[返回Token和用户信息]
    J --> K[前端存储Token]
    K --> L[跳转到首页]
```

#### API接口

**POST** `/core/auth/login`

请求体：
```typescript
{
  "credential": "username_or_email",  // 账号名或邮箱
  "password": "user_password"         // 密码
}
```

响应成功（200）：
```typescript
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-uuid",
      "username": "用户名",
      "displayName": "显示名",
      "email": "user@example.com",
      "role": "user",
      "avatarUrl": null,
      "bio": null
    }
  }
}
```

响应失败（401）：
```typescript
{
  "success": false,
  "message": "账号/邮箱或密码错误",
  "data": null
}
```

#### 前端实现

**LoginPage.tsx** - `/frontend/src/pages/LoginPage.tsx`

核心逻辑：
- 表单字段：账号/邮箱、密码
- 支持账号名或邮箱登录（后端自动识别）
- 表单验证：必填字段、密码长度
- 错误处理：显示后端返回的错误消息
- 记住我功能：存储登录信息到localStorage

**关键代码片段：**
```typescript
const handleLogin = async (values: { credential: string; password: string }) => {
  try {
    const { token, user } = await api.login(values);
    saveAuth(token, user);
    message.success('登录成功');
    navigate(from || '/');
  } catch (err) {
    message.error(err.message);
  }
};
```

---

### 2. 注册功能

#### 注册流程
```mermaid
graph TD
    A[访问注册页面] --> B[填写注册表单]
    B --> C[发送验证码]
    C --> D{发送成功?}
    D --否--> E[显示错误]
    D --是--> F[输入验证码]
    F --> G[提交注册]
    G --> H[验证所有信息]
    H --> I{验证通过?}
    I --否--> J[显示错误]
    I --是--> K[创建用户]
    K --> L[返回成功]
    L --> M[跳转到登录页]
```

#### API接口

**POST** `/core/auth/send-code`
- 发送邮箱验证码

请求体：
```typescript
{
  "email": "user@example.com"
}
```

**POST** `/core/auth/register`
- 注册用户

请求体：
```typescript
{
  "username": "用户名",
  "displayName": "显示名",
  "email": "user@example.com",
  "code": "123456",          // 邮箱验证码
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### 前端实现

**RegisterPage.tsx** - `/frontend/src/pages/RegisterPage.tsx`

核心特性：
- 多步骤表单（发送验证码 → 填写注册信息）
- 表单验证：
  - 账号名：必填、唯一性
  - 邮箱：必填、格式验证、唯一性
  - 密码：必填、6位以上
  - 确认密码：与密码一致
- 验证码倒计时（60秒）
- 错误处理和提示

---

### 3. 密码重置功能

#### 密码重置流程
```mermaid
graph TD
    A[访问重置密码页] --> B[输入注册邮箱]
    B --> C[发送验证码]
    C --> D{发送成功?}
    D --否--> E[显示错误]
    D --是--> F[进入第二步]
    F --> G[输入验证码和新密码]
    G --> H[提交重置]
    H --> I{验证成功?}
    I --否--> J[显示错误]
    I --是--> K[更新密码]
    K --> L[返回成功]
    L --> M[跳转到登录页]
```

#### API接口

**POST** `/core/auth/reset-password/send-code`
- 发送重置密码验证码

请求体：
```typescript
{
  "email": "user@example.com"
}
```

**POST** `/core/auth/reset-password`
- 重置密码

```typescript
{
  "email": "user@example.com",
  "code": "123456",          // 邮箱验证码
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### 前端实现

**ResetPasswordPage.tsx** - `/frontend/src/pages/ResetPasswordPage.tsx`

核心特性：
- 两步流程：
  1. 输入邮箱并发送验证码
  2. 输入验证码和新密码
- 步骤指示器显示当前进度
- 表单验证和错误处理
- 成功后自动跳转登录页

---

### 4. 认证状态管理

#### JWT Token机制

**Token结构：**
```typescript
// JWT Payload 示例
{
  "token_type": "access",
  "exp": 1640000000,      // 24小时后过期
  "iat": 1639913600,
  "jti": "...",
  "user_id": "user-uuid"
}
```

**Token存储：**
- 前端：localStorage（key: `token`）
- 后端：无状态（不存储session）

**Token使用：**
```typescript
// 请求头格式
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 前端认证管理

**useAuth.ts** - `/frontend/src/hooks/useAuth.ts`

功能：
- 提供认证状态（useAuth hook）
- Token和用户信息的存储/读取
- 自动同步localStorage变化
- 登出功能

**Axios拦截器：**
```typescript
// 自动添加Token到请求头
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 401错误处理
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuth();
      message.error('请先登录');
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
```

---

## 数据库设计

### 用户模型（User）

```python
class User(AbstractUser):
    # 使用email作为唯一标识
    email = models.EmailField(_('email address'), unique=True)

    # 用户名可重复，用于显示
    username = models.CharField(_('username'), max_length=150, blank=True)

    # 显示名称（必填）
    display_name = models.CharField(_('display name'), max_length=150, blank=False)

    # 用户角色
    role = models.CharField(_('role'), max_length=20, choices=UserRole.choices, default=UserRole.USER)

    # 邮箱验证状态
    email_verified = models.BooleanField(_('email verified'), default=False)

    # 软删除
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    # JWT相关
    jwt_secret = models.UUIDField(default=uuid.uuid4, editable=False)

    USERNAME_FIELD = 'email'  # 使用邮箱登录
    REQUIRED_FIELDS = ['display_name']  # 必填字段
```

### 邮箱验证码表（EmailVerificationCode）

```python
class EmailVerificationCode(models.Model):
    email = models.EmailField(_('email address'))
    code = models.CharField(_('verification code'), max_length=6)
    purpose = models.CharField(_('purpose'), max_length=20)  # register / reset_password
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        # 复合索引：邮箱 + 用途
        indexes = [
            models.Index(fields=['email', 'purpose']),
        ]
```

---

## 安全设计

### 密码安全
- 密码加密：bcrypt哈希算法
- 密码强度：最少6位字符
- 密码传输：HTTPS加密

### 认证安全
- JWT密钥：随机生成的UUID（每个用户不同）
- Token过期：24小时（可配置）
- Refresh Token：未实现（短期Token + 刷新机制）

### 验证码安全
- 验证码长度：6位数字
- 有效期：15分钟
- 发送限制：60秒内只能发送一次
- 用途限制：验证码只能用于指定用途（注册/重置密码）

### 访问控制
- 未登录用户：只能访问公共页面（首页、分类、排行榜、小说详情）
- 登录用户：可以访问个人功能（书架、历史记录、收藏、评论）
- 管理员：额外访问后台管理功能

---

## 性能优化

### 前端优化
- API请求缓存：使用SWR或React Query
- 组件懒加载：路由级别代码分割
- 图片优化：封面图懒加载、压缩

### 后端优化
- 数据库索引：邮箱、用户名唯一索引
- 查询优化：N+1问题处理（select_related/prefetch_related）
- 缓存：热门小说、推荐列表缓存（Redis）

### 监控指标
- API响应时间：P95 < 500ms
- 登录成功率：> 99%
- 错误率：< 0.1%

---

## 开发配置

### 前端环境变量

`.env.development`
```bash
# API模式：mock | real
VITE_API_MODE=mock
```

`.env.production`
```bash
# 生产环境API地址
VITE_API_BASE_URL=https://api.example.com
```

### 后端环境变量

`.env`
```bash
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# JWT
JWT_ACCESS_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 部署指南

### 前端部署

1. 构建生产版本：
```bash
cd frontend
npm install
npm run build
```

2. 生成输出：`dist/`目录
3. 部署到静态服务器（Nginx/Apache/COS/S3）

### 后端部署

1. 安装依赖：
```bash
cd backend
pip install -r requirements.txt
```

2. 数据库迁移：
```bash
python manage.py migrate
```

3. 收集静态文件：
```bash
python manage.py collectstatic
```

4. 启动服务（生产）：
```bash
# 使用Gunicorn
pip install gunicorn
gunicorn server.wsgi:application --bind 0.0.0.0:8000
```

5. 配置Nginx反向代理

---

## 测试指南

### 单元测试

**前端：**
```bash
cd frontend
npm test
```

**后端：**
```bash
cd backend
python manage.py test
```

### 集成测试

参考：[测试场景文档](../frontend/docs/test-scenarios-account-login.md)

### 性能测试

使用JMeter或Locust模拟并发访问：
- 登录接口：1000并发用户
- 注册接口：500并发用户
- 重置密码接口：500并发用户

---

## 未来改进

### 短期（1-3个月）
1. 实现Refresh Token机制
2. 添加社交登录（微信、QQ、GitHub）
3. 实现双因素认证（2FA）
4. 添加IP白名单/黑名单

### 中期（3-6个月）
1. 实现单点登录（SSO）
2. 添加登录历史记录
3. 实现设备管理
4. 添加安全日志审计

### 长期（6个月+）
1. 微服务架构拆分
2. OAuth2.0/OIDC支持
3. 生物认证集成
4. AI驱动的异常检测

---

## 参考文档

- [Django REST Framework文档](https://www.django-rest-framework.org/)
- [JWT认证指南](https://jwt.io/introduction)
- [React最佳实践](https://react.dev/learn)
- [测试场景](./test-scenarios-account-login.md)
- [部署指南](./deployment-guide.md)

---

**文档维护：** 开发团队
**最后更新：** 2026-01-18
**版本：** 1.0
