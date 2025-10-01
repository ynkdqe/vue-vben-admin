# Blue-Green Deployment Script

Script `deploy-blue-green.sh` thực hiện deployment zero-downtime cho ứng dụng HRMS Vue Vben.

## 🎯 Cách hoạt động

### Blue-Green Strategy
- **Blue**: Container hiện tại đang serve traffic
- **Green**: Container mới được deploy
- **Switch**: Nginx upstream chuyển từ Blue → Green
- **Cleanup**: Container cũ bị xóa sau khi deploy thành công

### Ports Configuration
- **Blue Port**: 8205 (có thể override qua `BLUE_PORT`)
- **Green Port**: 8206 (có thể override qua `GREEN_PORT`) 
- **Public Port**: 8080 (nginx proxy, override qua `PUBLIC_PORT`)

## 🚀 Sử dụng

### Syntax:
```bash
./deploy-blue-green.sh IMAGE [SERVICE_NAME] [CONTAINER_PORT] [HEALTH_PATH]
```

### Examples:

```bash
# Deploy mặc định
./deploy-blue-green.sh hrms-app:latest

# Deploy với custom service name
./deploy-blue-green.sh hrms-app:v1.2.3 my-hrms

# Deploy với custom ports
BLUE_PORT=9001 GREEN_PORT=9002 PUBLIC_PORT=80 \
./deploy-blue-green.sh hrms-app:latest hrms-app 8080 /health
```

## 📋 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BLUE_PORT` | 8205 | Host port cho Blue container |
| `GREEN_PORT` | 8206 | Host port cho Green container |
| `PUBLIC_PORT` | 8080 | Nginx public port |
| `GHCR_USER` | - | GitHub Container Registry username |
| `GHCR_TOKEN` | - | GitHub Container Registry token |

## 🔧 VPS Requirements

### 1. Dependencies (auto-install):
- Docker
- Nginx
- curl
- ss/netstat

### 2. Permissions:
- Script cần sudo access hoặc user trong docker group
- Nginx config write permission

## 📁 Files Created

```bash
# Nginx configuration
/etc/nginx/conf.d/hrms-app.upstream.conf  # Upstream định nghĩa
/etc/nginx/conf.d/hrms-app.conf           # Site configuration

# Runtime state
/var/run/hrms-app-active                  # Active color tracking
```

## 🌐 Nginx Configuration

Script tự động tạo nginx config với:

### Features:
- **SPA Support**: Handle Vue Router routes
- **Security Headers**: XSS, CSRF protection
- **Gzip Compression**: Tối ưu bandwidth
- **Static Caching**: Cache assets 1 year
- **Health Checks**: `/health` và `/health-status-internal`
- **API Proxy**: Route `/api/*` requests

### Example Config:
```nginx
upstream hrms-app_upstream {
    server 127.0.0.1:8205;  # Dynamic blue/green
    keepalive 32;
}

server {
    listen 8080;
    server_name _;
    
    location / {
        proxy_pass http://hrms-app_upstream;
        # ... headers và caching
    }
}
```

## 🔍 Health Checks

### Default Health Check:
- **Endpoint**: `/health` 
- **Timeout**: 80 seconds (40 retries × 2s)
- **Fallback**: Check homepage contains `<!DOCTYPE html`

### Custom Health Check:
```bash
# Disable health check
./deploy-blue-green.sh hrms-app:latest hrms-app 8080 none

# Custom health endpoint  
./deploy-blue-green.sh hrms-app:latest hrms-app 8080 /api/health
```

## 🔄 Deployment Flow

1. **Pull Image**: Download từ registry
2. **Detect Active**: Xác định Blue/Green nào đang active
3. **Deploy New**: Start container mới trên port available
4. **Health Check**: Verify container healthy
5. **Update Nginx**: Switch upstream destination
6. **Network Switch**: Update Docker network alias
7. **Cleanup**: Remove old container
8. **Verify**: Final health check

## 🛠 Troubleshooting

### Common Issues:

**Port conflicts:**
```bash
# Check port usage
ss -ltn | grep :820[56]
netstat -tln | grep :820[56]
```

**Container logs:**
```bash
# View logs if health check fails
docker logs hrms-app-blue
docker logs hrms-app-green
```

**Nginx config:**
```bash
# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

**Manual rollback:**
```bash
# Switch back to previous container
docker network connect --alias hrms-app-service hrms-app-net hrms-app-blue
```

## 🚀 Integration với GitHub Actions

Workflow sẽ:
1. Build Docker image trong CI
2. Upload image + script lên VPS
3. Execute blue-green deployment
4. Verify deployment success

### Environment Secrets:
- `VPS_HOST`: IP address của VPS
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: Private SSH key content

## 📊 Monitoring

### Health endpoints:
- `http://your-domain:8080/health` - App health
- `http://your-domain:8080/health-status-internal` - Nginx health

### Active container check:
```bash
cat /var/run/hrms-app-active  # blue | green
docker ps | grep hrms-app     # Running containers
```
