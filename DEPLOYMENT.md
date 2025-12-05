# 部署选项

## CloudBase 静态托管

### 准备工作

1. 注册腾讯云账号并开通 CloudBase 服务
2. 创建一个静态网站托管环境
3. 获取环境 ID、SecretId 和 SecretKey

### 部署方式

#### 方法一：使用 GitHub Actions 自动部署（推荐）

1. 在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：
   - `SECRET_ID`: 你的腾讯云 SecretId
   - `SECRET_KEY`: 你的腾讯云 SecretKey
   - `ENV_ID`: 你的 CloudBase 环境 ID

2. 推送代码到 master 分支，GitHub Actions 会自动部署

#### 方法二：手动部署

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
   npm run deploy:cloudbase
   ```

## Cloudflare Pages

### 准备工作

1. 注册或登录 [Cloudflare账户](https://dash.cloudflare.com/)
2. 访问 [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?account-pages=%7B%22id%22:%22new%22%7D)

### 部署方式

#### 方法一：通过 GitHub 集成自动部署（推荐）

1. 点击 "Create a project" -> "Connect to Git"
2. 连接你的 GitHub 账户并选择此仓库
3. 配置构建设置：
   - Production branch: `master`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 点击 "Save and Deploy"

> 注意：如果在 Cloudflare Pages 界面中没有看到 Framework preset 选项，请直接手动填写 Build command 和 Build output directory。

#### 方法二：使用 Wrangler CLI 手动部署

1. 安装 Wrangler：
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare：
   ```bash
   wrangler login
   ```

3. 部署应用：
   ```bash
   npm run deploy:cloudflare
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
- 静态资源会自动部署到相应平台的根路径
- 部署后可通过平台提供的域名访问网站