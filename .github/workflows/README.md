# GitHub Actions Workflows

Dự án này sử dụng 2 workflows GitHub Actions được tối ưu hóa:

## 1. Main CI/CD (`main.yml`)

**Trigger**: Push và Pull Request vào `main`, `develop`, `feature/*`

### Jobs:

#### 🧪 Test & Lint
- Chạy unit tests với Vitest
- ESLint code quality check  
- TypeScript type checking
- Chạy trên Ubuntu (có thể mở rộng Windows/macOS)

#### 🏗️ Build
- Build ứng dụng web-antd (HRMS)
- Upload artifacts để deploy
- Chỉ chạy sau khi test & lint pass

#### 🚀 Deploy
- **Trigger**: Chỉ khi push vào `main` branch
- Build Docker image với tag SHA + latest
- Deploy lên VPS (cần cấu hình thêm)
- Sử dụng GitHub Environment `production`

#### ✅ CI Success
- Job kiểm tra tổng thể status
- Fail nếu bất kỳ job nào fail

### Cách sử dụng:

```bash
# Develop: Push code sẽ chạy test + lint + build
git push origin feature/my-feature

# Production: Push vào main sẽ deploy
git push origin main
```

## 2. Security & Maintenance (`maintenance.yml`)

**Trigger**: 
- Schedule: Chủ nhật hàng tuần lúc 1:00 AM (GMT+7)
- Manual: `workflow_dispatch`

### Jobs:

#### 🔒 Security Scan
- GitHub CodeQL analysis
- Quét lỗ hổng bảo mật trong JavaScript/TypeScript
- Timeout: 6 hours

#### 📦 Dependency Review  
- Check vulnerabilities trong dependencies
- Audit packages với `pnpm audit`
- Hiển thị outdated packages

#### 🧹 Cleanup Stale
- Tự động đóng issues/PRs không hoạt động
- **Stale**: 60 ngày không có activity
- **Close**: 7 ngày sau khi mark stale
- Exempt các label: `bug`, `enhancement`, `good first issue`

### Manual trigger:

```bash
# Vào GitHub > Actions > Security & Maintenance > Run workflow
```

## 🔧 Setup Requirements

### Secrets cần thiết:
- `GITHUB_TOKEN`: Tự động có sẵn
- Các secrets deploy (nếu cần):
  - VPS connection info
  - Docker registry credentials

### Environments:
- `production`: Cho deploy job (optional approval)

## 📊 Monitoring

- **CI Status**: Check tại GitHub Actions tab
- **Security**: GitHub Security tab cho CodeQL results  
- **Dependencies**: Dependabot alerts tự động

## 🎯 So sánh với setup cũ:

| Cũ | Mới |
|---|---|
| 13 workflows riêng biệt | 2 workflows tập trung |
| Phức tạp, khó maintain | Đơn giản, dễ hiểu |
| Chạy song song nhiều jobs | Hiệu quả resource hơn |
| Setup cho multiple apps | Tối ưu cho HRMS app |

## 🚀 Next Steps

1. **Cấu hình VPS deployment** trong `main.yml`
2. **Setup Docker registry** (nếu cần)
3. **Add notification** (Slack/Discord) cho deploy status
4. **Monitor performance** và tối ưu thêm nếu cần
