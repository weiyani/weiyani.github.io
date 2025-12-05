# 部署到 CloudBase 静态托管

## 准备工作

1. 注册腾讯云账号并开通 CloudBase 服务
2. 创建一个静态网站托管环境
3. 获取环境 ID、SecretId 和 SecretKey

## 部署方式

### 方法一：使用 GitHub Actions 自动部署（推荐）

1. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：
   - `SECRET_ID`: 你的腾讯云 SecretId
   - `SECRET_KEY`: 你的腾讯云 SecretKey
   - `ENV_ID`: 你的 CloudBase 环境 ID

2. 推送代码到 master 分支，GitHub Actions 会自动部署

### 方法二：手动部署

1. 安装 CloudBase CLI：
   ```bash
   npm install -g @cloudbase/cli
   ```

2. 登录 CloudBase：
   ```bash
   cloudbase login
   ```

3. 部署应用：
   ```bash
   npm run deploy
   ```

## 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 注意事项

- 确保 `vite.config.ts` 中的 `base` 配置正确
- 静态资源会自动部署到 CloudBase 的根路径
- 部署后可通过 CloudBase 提供的域名访问网站