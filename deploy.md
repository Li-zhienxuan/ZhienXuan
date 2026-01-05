# 部署文档 📦

本文档详细介绍如何将 Hugo 博客部署到 Cloudflare Pages。

## 🚀 Cloudflare Pages 部署

### 步骤 1: 推送代码到 GitHub

如果还没有推送到 GitHub：

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Hugo blog with PaperMod theme"

# 设置主分支
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/yourusername/yourrepo.git

# 推送到 GitHub
git push -u origin main
```

### 步骤 2: 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单中选择 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**

### 步骤 3: 授权 GitHub

1. 点击 **Connect GitHub** 按钮
2. 如果是第一次使用，需要授权 Cloudflare 访问你的 GitHub
3. 选择你的博客仓库
4. 点击 **Begin setup**

### 步骤 4: 配置构建设置

在 **Build settings** 部分填写：

```
Build command: hugo --minify
Build output directory: public
Root directory: / (留空或填写 /)
```

### 步骤 5: 设置环境变量

在 **Environment variables** 部分添加：

```
HUGO_VERSION = 0.140.0
HUGO_ENABLEGITINFO = true
```

### 步骤 6: 部署

1. 点击 **Save and Deploy**
2. Cloudflare Pages 将自动构建和部署
3. 等待构建完成（通常 1-2 分钟）
4. 部署成功后会得到一个 `.pages.dev` 域名

示例: `https://your-project.pages.dev`

### 步骤 7: 配置自定义域名

#### 添加域名

1. 在项目设置中选择 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `blog.yourdomain.com`）
4. 点击 **Continue**

#### 配置 DNS

Cloudflare 会自动配置 DNS。如果域名不在 Cloudflare，需要手动添加：

```
Type: CNAME
Name: blog
Target: your-project.pages.dev
Proxy: ✓ (启用 Cloudflare 代理)
```

#### 验证域名

1. 等待 DNS 生效（通常几分钟到 48 小时）
2. Cloudflare 会自动颁发 SSL 证书
3. 证书状态变为 **Active** 后即可使用

### 步骤 8: 启用 HTTP/3

在 Cloudflare CDN 设置中：

1. 进入 **Network** 页面
2. 启用 **HTTP/3 (QUIC)**
3. 启用 **0-RTT Connection Resumption**

### 步骤 9: 配置缓存

在 Pages 设置中：

1. 进入 **Settings** → **Cache**
2. 设置：
   - **Cache Level**: Standard
   - **Browser Cache TTL**: Respect Existing Headers
   - **Enable Auto Minify**: ✓ (JavaScript, CSS, HTML)

## 🔄 CI/CD 自动化

每次推送到 `main` 分支时，Cloudflare Pages 会自动构建和部署。

### 预览部署

每个 Pull Request 都会创建一个预览部署，方便在合并前查看效果。

### 自定义部署分支

可以设置多个分支自动部署：

1. 进入 **Settings** → **Production branches**
2. 添加需要自动部署的分支
3. 选择部署类型（Production / Preview）

## 🔧 高级配置

### 自定义 404 页面

创建 `layouts/404.html`:

```html
{{ define "main" }}
<main class="main">
  <h1>404 - 页面未找到</h1>
  <p>抱歉，您访问的页面不存在。</p>
  <a href="/">返回首页</a>
</main>
{{ end }}
```

### 重定向规则

创建 `public/_redirects` 文件：

```
# 旧文章重定向到新文章
/old-post.html /new-post.html 301

# 分类重定向
/category/old-name /category/new-name 301
```

### 添加环境变量

除了 `HUGO_VERSION`，还可以添加：

```bash
# Hugo 配置
HUGO_BASEURL=https://yourdomain.com
HUGO_ENV=production

# 自定义变量
MY_CUSTOM_VAR=value
```

## 📊 监控和分析

### Cloudflare Web Analytics

1. 进入 **Analytics** → **Web Analytics**
2. 启用 Web Analytics
3. 复制 JavaScript 代码
4. 添加到 `layouts/partials/extend_head.html`

### Google Analytics

1. 在 [Google Analytics](https://analytics.google.com/) 创建账号
2. 获取跟踪 ID（如 `G-XXXXXXXXXX`）
3. 更新 `config.toml`:

```toml
[params.analytics.google]
  SiteVerificationTag = "G-XXXXXXXXXX"
```

### 百度统计

1. 在 [百度统计](https://tongji.baidu.com/) 注册
2. 获取统计代码 ID
3. 更新 `config.toml`:

```toml
[params.analytics.baidu]
  SiteVerificationTag = "your-baidu-id"
```

## 🌐 域名 DNS 配置

### 根域名（如 yourdomain.com）

```
Type: CNAME
Name: @
Target: your-project.pages.dev
Proxy: ✓ (橙色云朵)
```

### 子域名（如 blog.yourdomain.com）

```
Type: CNAME
Name: blog
Target: your-project.pages.dev
Proxy: ✓ (橙色云朵)
```

### DNS 检查

使用以下工具检查 DNS 配置：

- https://dnschecker.org/
- https://www.whatsmydns.net/
- 本地命令: `nslookup blog.yourdomain.com`

## 🔍 故障排查

### 构建失败

#### 检查 Hugo 版本

确保环境变量中的 `HUGO_VERSION` 与本地版本一致。

```bash
hugo version
```

#### 查看构建日志

在 Cloudflare Pages 的部署页面查看详细错误信息。

#### 本地测试

在推送前本地测试构建：

```bash
hugo --minify
```

### 域名无法访问

#### 检查 DNS 配置

使用 DNS 检查工具确认 DNS 已正确配置。

#### 检查 Cloudflare 代理状态

确保 DNS 记录的代理状态为橙色云朵（已启用）。

#### DNS 传播时间

DNS 更改可能需要几分钟到 48 小时全球生效。

#### 清除本地 DNS 缓存

```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemd-resolve --flush-caches
```

### 评论不显示

#### 检查 Giscus 配置

确保 `config.toml` 中的 Giscus 参数正确。

#### 确保仓库启用 Discussions

在 GitHub 仓库设置中启用 Discussions 功能。

#### 检查仓库权限

确保仓库为公开仓库（Public）。

### HTTPS 证书问题

Cloudflare 会自动颁发证书。如果出现问题：

1. 进入 **SSL/TLS** → **Edge Certificates**
2. 确保 **Always Use HTTPS** 已启用
3. 检查证书状态

### 性能优化

#### 启用 Brotli 压缩

在 **Network** → **Optimization** 中启用：

- Brotli
- Auto Minify (JavaScript, CSS, HTML)

#### 配置缓存规则

在 **Cache Rules** 中添加规则：

```
If URL pattern matches: *.css, *.js, *.png, *.jpg, *.webp
Then:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

## 🔐 安全配置

### 启用 HSTS

在 **SSL/TLS** → **Edge Certificates** 中：

- 启用 **HTTP Strict Transport Security (HSTS)**
- 设置 **Max-Age**: 6 months

### 防止攻击

在 **Security** → **Settings** 中：

- **Security Level**: High
- **Bot Fight Mode**: On
- **Challenge Passage**: 30 minutes

## 📈 性能监控

### Cloudflare 速度测试

使用 Cloudflare 的工具：

1. **Analytics** → **Performance**
2. 查看全球访问速度
3. 识别慢速地区

### 第三方工具

- Google PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/
- WebPageTest: https://www.webpagetest.org/

### Lighthouse 测试

在 Chrome DevTools 中：

1. 打开 Lighthouse 标签
2. 选择 **Mobile** 和 **Desktop**
3. 点击 **Analyze page load**
4. 目标分数 ≥ 90

## 💡 最佳实践

1. **定期更新**: 定期更新 Hugo 和主题
2. **备份数据**: 使用 Git 版本控制
3. **监控构建**: 关注构建状态
4. **优化图片**: 使用 WebP 格式和懒加载
5. **压缩资源**: 启用 `--minify` 标志
6. **CDN 缓存**: 合理配置缓存策略

## 🆘 获取帮助

- Cloudflare Pages 文档: https://developers.cloudflare.com/pages/
- Hugo 文档: https://gohugo.io/documentation/
- PaperMod 主题: https://github.com/adityatelange/hugo-PaperMod
- Cloudflare 社区: https://community.cloudflare.com/

---

**部署成功后，享受您的极速博客吧！** 🎉
