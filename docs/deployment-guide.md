# 小说推荐系统部署指南

## 目录

1. [环境准备](#环境准备)
2. [后端部署](#后端部署)
3. [前端部署](#前端部署)
4. [生产环境配置](#生产环境配置)
5. [监控与维护](#监控与维护)
6. [常见问题](#常见问题)

---

## 环境准备

### 系统要求

**后端：**
- Python 3.11+
- Django 4.2
- Django REST Framework 3.14
- 数据库：SQLite（开发）/ MySQL 8.0+（生产）
- Redis（可选，用于缓存和Session）

**前端：**
- Node.js 18+
- npm 9+
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）

### 服务器配置推荐

**开发环境：**
- CPU: 2核
- RAM: 4GB
- Disk: 20GB

**生产环境（小型）：**
- CPU: 4核
- RAM: 8GB
- Disk: 100GB SSD

**生产环境（中大型）：**
- CPU: 8核+
- RAM: 16GB+
- Disk: 200GB+ SSD

---

## 后端部署

### 1. 环境配置

```bash
# 创建项目目录
mkdir -p /opt/novel-recommendation
cd /opt/novel-recommendation

# 克隆代码（如使用Git）
git clone <repository-url> .

# 创建Python虚拟环境
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# 安装依赖
cd backend
pip install -r requirements.txt
```

### 2. 数据库配置

#### SQLite（开发环境，默认）
```bash
# 执行数据库迁移
python manage.py migrate

# 导入测试数据（可选）
sqlite3 db.sqlite3 < sql/novels_data.sql
```

#### MySQL（生产环境）

**安装MySQL客户端：**
```bash
pip install mysqlclient
```

**数据库配置（`backend/server/settings.py`）：**
```python
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'novel_recommendation'),
        'USER': os.getenv('DB_USER', 'novel_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'your-password'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}
```

**创建数据库：**
```sql
CREATE DATABASE novel_recommendation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'novel_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON novel_recommendation.* TO 'novel_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 环境变量配置

创建 `.env` 文件：
```bash
cd backend
vim .env
```

**示例配置：**
```bash
# Django Core
DJANGO_SECRET_KEY=your-secret-key-here  # 生产环境必须修改!
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=mysql://user:password@localhost:3306/novel_recommendation
# 或
DB_NAME=novel_recommendation
DB_USER=novel_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306

# JWT
JWT_ACCESS_HOURS=24
JWT_SECRET_KEY=your-jwt-secret-key  # 生产环境必须修改!

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend.com

# Email（用于发送验证码）
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis（可选）
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
```

**生成Django密钥：**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. 数据库迁移

```bash
# 收集静态文件
python manage.py collectstatic --noinput

# 执行数据库迁移
python manage.py migrate

# 创建超级管理员（可选）
python manage.py createsuperuser
```

### 5. 生产服务器启动

#### 方案A：使用Gunicorn（推荐）

**安装Gunicorn：**
```bash
pip install gunicorn
```

**创建Gunicorn配置文件（`gunicorn_config.py`）：**
```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"  # 使用gevent提高并发
worker_connections = 1000
keepalive = 5
timeout = 30

# Logging
loglevel = "info"
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Performance
preload_app = True
max_requests = 1000
max_requests_jitter = 50
```

**启动服务：**
```bash
gunicorn -c gunicorn_config.py server.wsgi:application
```

**创建Systemd服务：**
```bash
sudo vim /etc/systemd/system/novel-backend.service
```

```ini
[Unit]
Description=Novel Recommendation Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/novel-recommendation/backend
ExecStart=/opt/novel-recommendation/venv/bin/gunicorn -c gunicorn_config.py server.wsgi:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl start novel-backend
sudo systemctl enable novel-backend

# 查看状态
sudo systemctl status novel-backend
```

#### 方案B：使用uWSGI

**安装uWSGI：**
```bash
pip install uwsgi
```

**创建配置（`uwsgi.ini`）：**
```ini
[uwsgi]
chdir = /opt/novel-recommendation/backend
module = server.wsgi:application

master = true
processes = 4
threads = 2

socket = /tmp/novel-backend.sock
chmod-socket = 666
vacuum = true

pidfile = /tmp/novel-backend.pid
daemonize = /var/log/uwsgi/novel-backend.log

# Performance
harakiri = 30
harakiri-verbose = true
max-requests = 5000
max-requests-delta = 500
```

**启动服务：**
```bash
uwsgi --ini uwsgi.ini
```

---

## 前端部署

### 1. 构建生产版本

```bash
cd frontend

# 安装依赖
npm install

# 运行测试（可选）
npm test

# 构建生产版本
npm run build
```

**输出目录：** `frontend/dist/`

### 2. 配置环境变量

创建 `.env.production`：
```bash
# API服务器地址（无需协议和路径）
VITE_API_BASE_URL=https://api.your-domain.com

# 如果前端和后端同域（Nginx反向代理），留空即可
# VITE_API_BASE_URL=
```

### 3. 部署到Nginx

**安装Nginx：**
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

**配置Nginx（`/etc/nginx/sites-available/novel-frontend`）：**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    root /opt/novel-recommendation/frontend/dist;
    index index.html;

    # 前端路由支持（React Router）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理（如果前后端同域）
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

**启用配置：**
```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/novel-frontend /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. 部署到CDN（推荐）

**构建并上传：**
```bash
# 构建（指定base）
npm run build -- --base=/

# 上传到OSS/COS
# 示例：腾讯云COS
npm install -g cos-nodejs-sdk-v5
coscmd upload -r dist/ /
```

**配置CDN：**
1. 源站设置为Nginx服务器或OSS/COS
2. 配置缓存规则：
   - HTML: 不缓存
   - JS/CSS/图片: 缓存30天
3. 配置HTTPS
4. 启用Gzip/Brotli压缩

---

## 生产环境配置

### HTTPS配置

**使用Let's Encrypt（免费SSL证书）：**

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

**Nginx HTTPS配置：**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 其余配置...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 安全加固

**Django安全设置（`settings.py`）：**
```python
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
```

**Nginx安全配置：**
```nginx
# 限制请求频率（防止暴力破解）
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /core/auth/login/ {
    limit_req zone=login;
    # ...
}

# 隐藏Nginx版本信息
server_tokens off;

# 限制大文件上传
client_max_body_size 10M;

# 安全响应头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 性能调优

**Gunicorn性能配置：**
```python
# gunicorn_config.py
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 1000
keepalive = 5
timeout = 30
max_requests = 1000
preload_app = True
```

**数据库连接池：**
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        # ...
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES',
                              innodb_strict_mode=1",
        },
        'CONN_MAX_AGE': 600,  # 连接池
    }
}
```

**Nginx缓存：**
```nginx
# 代理缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404 1m;
    # ...
}
```

---

## 监控与维护

### 日志管理

**Django日志配置：**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/novel.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

**日志轮转：**
```bash
sudo vim /etc/logrotate.d/novel

/var/log/django/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload gunicorn
    endscript
}
```

### 监控指标

**关键指标：**
- API响应时间（P95, P99）
- 错误率（5xx, 4xx）
- 服务器负载（CPU, 内存, 磁盘）
- 数据库慢查询
- 活跃用户量

**使用Prometheus + Grafana：**
```python
# 安装django-prometheus
pip install django-prometheus

# settings.py
INSTALLED_APPS += ['django_prometheus']
MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    # ... other middleware
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

# urls.py
urlpatterns = [
    path('', include('django_prometheus.urls')),
    # ...
]
```

### 备份策略

**数据库备份：**
```bash
# 创建备份脚本（backup_db.sh）
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u novel_user -p'password' novel_recommendation > /backup/db_backup_$DATE.sql
gzip /backup/db_backup_$DATE.sql

# 删除7天前的备份
find /backup/ -name "db_backup_*.sql.gz" -mtime +7 -delete
```

**静态文件备份：**
```bash
# 备份上传的文件
rsync -avz /opt/novel-recommendation/backend/media/ /backup/media/
```

**代码备份：**
```bash
# Git仓库应定期推送到远程
# 或创建代码打包备份
```

### 更新部署

**代码更新：**
```bash
cd /opt/novel-recommendation
git pull origin main

# 后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart novel-backend

# 前端
cd ../frontend
npm install
npm run build
# 如果使用Nginx，重新加载配置
sudo nginx -s reload
```

---

## 常见问题

### 1. 数据库连接失败

**症状：** Django启动时报`OperationalError`

**解决方案：**
```bash
# 检查MySQL服务
sudo systemctl status mysql

# 检查数据库配置
python manage.py shell
from django.conf import settings
print(settings.DATABASES)

# 测试连接
mysql -u novel_user -p -h localhost novel_recommendation
```

### 2. 静态文件404

**症状：** CSS/JS文件无法加载

**解决方案：**
```bash
# 收集静态文件
python manage.py collectstatic

# 检查Nginx配置
sudo nginx -t

# 检查文件权限
ls -la /opt/novel-recommendation/backend/static/
```

### 3. CORS错误

**症状：** 浏览器报CORS policy错误

**解决方案：**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-frontend.com",
]

# 或允许所有（不推荐）
# CORS_ALLOW_ALL_ORIGINS = True
```

### 4. 权限不足

**症状：** 文件读写权限错误

**解决方案：**
```bash
# 设置目录权限
sudo chown -R www-data:www-data /opt/novel-recommendation
sudo chmod -R 755 /opt/novel-recommendation

# 日志目录
sudo mkdir -p /var/log/django /var/log/gunicorn
sudo chown www-data:www-data /var/log/django /var/log/gunicorn
```

### 5. 内存泄漏

**症状：** 内存持续增长

**解决方案：**
```bash
# 查看内存使用
top -p $(pgrep gunicorn)

# 重启服务（临时）
sudo systemctl restart novel-backend

# 检查代码中的内存泄漏
# 使用tracemalloc或memory_profiler
```

### 6. 502 Bad Gateway

**症状：** Nginx报502错误

**解决方案：**
```bash
# 检查后端服务
sudo systemctl status novel-backend

# 查看错误日志
sudo tail -f /var/log/gunicorn/error.log

# 检查socket文件
ls -la /tmp/novel-backend.sock

# 重启服务
sudo systemctl restart novel-backend
```

---

## 性能基准

### 预期性能（4核8G服务器）

| 指标 | 数值 |
|-----|------|
| API响应时间(P95) | < 200ms |
| 登录接口 | < 500ms |
| 并发用户数 | 1000+ |
| 数据库QPS | 2000+ |
| 内存使用 | < 2GB |
| CPU使用 | < 50% |

### 压力测试

**使用Locust：**
```python
# locustfile.py
from locust import HttpUser, task, between

class NovelUser(HttpUser):
    wait_time = between(1, 3)

    @task(10)
    def login(self):
        self.client.post("/core/auth/login/", json={
            "credential": "test@example.com",
            "password": "test123"
        })

    @task(5)
    def register(self):
        self.client.post("/core/auth/register/", json={
            "username": "testuser",
            "displayName": "Test User",
            "email": "test@example.com",
            "code": "123456",
            "password": "test123",
            "confirmPassword": "test123"
        })
```

**运行测试：**
```bash
pip install locust
locust -f locustfile.py --host=http://localhost:8000
```

---

## 联系我们

**开发团队：**
- 问题反馈：https://github.com/your-repo/issues
- 技术支持：support@example.com

**在线文档：**
- API文档：https://your-domain.com/api/docs
- 用户手册：https://your-domain.com/docs

---

**最后更新：** 2026-01-18
**版本：** v1.0
**维护者：** 开发团队
