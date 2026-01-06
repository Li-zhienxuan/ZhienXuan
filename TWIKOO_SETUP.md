# Twikoo 评论系统部署完整指南

## 为什么选择 Twikoo？

### Twikoo vs Giscus 对比

| 特性 | Giscus | Twikoo |
|------|--------|--------|
| **国内访问速度** | ⭐⭐ 慢（依赖GitHub） | ⭐⭐⭐⭐⭐ 快 |
| **需要外网** | ✅ 是 | ❌ 否 |
| **加载时间** | 3-10秒 | < 1秒 |
| **稳定性** | 不稳定 | 非常稳定 |
| **托管地点** | 国外 | 国内/你自己选择 |
| **部署难度** | 简单 | 简单 |
| **管理后台** | ❌ 无（在GitHub管理） | ✅ 有独立后台 |
| **登录方式** | 仅 GitHub | 多种（QQ/微信/GitHub等） |
| **适合人群** | 技术博客、开发者 | 所有类型的博客 |

### Twikoo 的优势

- ✅ **部署超简单**：5分钟搞定，一行配置代码
- ✅ **完全免费**：腾讯云/Vercel 免费额度足够用
- ✅ **国内访问快**：不用担心被墙，加载速度快
- ✅ **功能齐全**：
  - 邮件通知
  - 评论管理后台
  - 表情包支持（B站表情、小黄脸等）
  - 图片上传
  - 评论点赞
  - Markdown 支持
  - 代码高亮
  - 数学公式
- ✅ **界面美观**：自动适配暗色模式
- ✅ **数据自主**：评论数据存储在自己的云服务中
- ✅ **隐私友好**：不追踪用户

---

## 部署方式总览

Twikoo 支持多种部署方式，根据你的需求选择：

### 推荐方案对比

| 部署方式 | 推荐度 | 速度 | 成本 | 难度 | 适合地区 |
|---------|--------|------|------|------|---------|
| **Vercel** | ⭐⭐⭐⭐⭐ | 快 | 免费 | 简单 | 全球 |
| **腾讯云 CloudBase** | ⭐⭐⭐⭐⭐ | 最快 | 免费 | 简单 | 中国大陆 |
| **Cloudflare Workers** | ⭐⭐⭐⭐ | 快 | 免费 | 中等 | 全球 |
| **自建服务器** | ⭐⭐⭐ | 取决于服务器 | 付费 | 中等 | 自定义 |

---

## 方案一：使用 Vercel 部署（推荐 - 全球访问快）

### 第一步：一键部署

1. **访问 Twikoo 部署页面**

   点击这个按钮：
   [![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository=https://github.com/twikoojs/twikoo)

   或者手动访问：https://vercel.com/new/clone?repository=https://github.com/twikoojs/twikoo

2. **登录 Vercel**
   - 可以使用 GitHub、GitLab、Bitbucket 或 Email 登录
   - 推荐使用 GitHub 登录

3. **配置项目**
   - `Project Name`: 随便填，比如 `twikoo-myblog`
   - `Framework Preset`: 选择 "Other"
   - `Root Directory`: 保持默认 `.`
   - 点击 "Deploy" 按钮

4. **等待部署完成**
   - 大约需要 1-2 分钟
   - 部署成功后，你会得到一个 URL：
     ```
     https://twikoo-myblog.vercel.app
     ```
   - **保存这个 URL**，后面配置时会用到

### 第二步：配置环境变量（可选）

如果你想配置邮件通知等功能：

1. 在 Vercel 项目中，进入 `Settings` → `Environment Variables`
2. 添加以下环境变量：

```bash
# MongoDB 连接字符串（如果使用免费版，可以不填）
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/twikoo

# 邮件通知配置（可选）
SMTP_SERVICE=gmail  # 或 qq、163 等
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=true

# 管理员密码（必填）
TWIKOO_ADMIN_PASSWORD=your-strong-password
```

3. 重新部署项目
   - 在 `Deployments` 标签页
   - 点击最新的部署右侧的 "..." → "Redeploy"

### 第三步：获取访问地址

部署成功后，你会得到类似这样的地址：
```
https://twikoo-myblog.vercel.app
```

**这就是你的 `envId`**，记下来！

---

## 方案二：使用腾讯云 CloudBase 部署（国内访问最快）

### 第一步：创建腾讯云账号

1. 访问 https://console.cloud.tencent.com/tcb
2. 注册/登录腾讯云账号
3. 实名认证（需要身份证）

### 第二步：创建云开发环境

1. 点击 "新建环境"
2. 填写环境信息：
   - **环境名称**：比如 `twikoo-myblog`
   - **计费方式**：选择 "按量付费"（免费额度足够用）
   - **环境地域**：选择离你最近的区域（如 "广州"）
3. 点击 "新建"，等待环境创建完成（约 1-2 分钟）

### 第三步：部署 Twikoo

1. 进入刚创建的环境
2. 左侧菜单选择 "云函数"
3. 点击 "新建函数"
4. 选择 "函数模板"
5. 搜索并选择 "Twikoo"
6. 点击 "下一步"，然后点击 "部署"
7. 等待部署完成

### 第四步：获取访问地址

1. 在云函数列表中，点击 "twikoo" 函数
2. 点击 "函数配置"
3. 找到 "访问路径"
4. 复制这个 URL，格式类似：
   ```
   https://twikoo-xxx.service.tcloudbase.com
   ```

**这就是你的 `envId`**！

### 第五步：配置安全规则（可选）

在 "安全配置" 中可以设置：
- 防刷评论
- 敏感词过滤
- IP 白名单

---

## 方案三：使用 Cloudflare Workers 部署（完全免费）

### 前提条件

- 需要 Cloudflare 账号（免费）
- 需要绑定自定义域名

### 第一步：部署到 Cloudflare Workers

1. 访问 https://dash.cloudflare.com/sign-up
2. 注册并登录 Cloudflare

3. 安装 Wrangler CLI
   ```bash
   npm install -g wrangler
   ```

4. 登录 Cloudflare
   ```bash
   wrangler login
   ```

5. 部署 Twikoo
   ```bash
   git clone https://github.com/twikoojs/twikoo.git
   cd twikoo
   npm install
   npm run build
   wrangler deploy
   ```

6. 获取访问地址
   ```
   https://twikoo.your-subdomain.workers.dev
   ```

---

## 方案四：Docker 部署（自建服务器）

如果你有自己的服务器：

```bash
docker run -d --name twikoo \
  -e TWIKOO_ADMIN_PASSWORD=your-password \
  -p 8080:8080 \
  imaegoo/twikoo:latest
```

访问地址：`http://your-server-ip:8080`

---

## 在 Hugo 中配置 Twikoo

### 第一步：更新 config.toml

编辑你的 `config.toml` 文件：

```toml
# 全局启用评论
[params]
  comments = true

# Twikoo 配置
[params.twikoo]
  envId = "https://twikoo-myblog.vercel.app"  # 替换为你的 Twikoo 服务地址
  region = ""                                 # 留空即可（除非使用腾讯云特定区域）
  lang = "zh-CN"                              # 语言：中文
```

### 第二步：创建评论组件

在你的 Hugo 项目中创建文件：
`layouts/partials/comments.html`

```html
{{ if .Site.Params.comments }}
<div id="tcomment"></div>
<script src="https://cdn.staticfile.org/twikoo/1.6.41/twikoo.all.min.js"></script>
<script>
  twikoo.init({
    envId: '{{ .Site.Params.twikoo.envId }}',
    el: '#tcomment',
    lang: '{{ .Site.Params.twikoo.lang | default "zh-CN" }}',
    onCommentLoaded: function () {
      console.log('Twikoo 评论加载完成');
      // 可以在这里添加自定义逻辑
    }
  })
</script>

<style>
  /* Twikoo 容器样式 */
  #tcomment {
    background-color: var(--theme-bg);
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  /* 暗色模式适配 */
  .dark #tcomment {
    background-color: var(--entry-bg);
  }

  /* 评论输入框样式 */
  .tk-input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--theme-bg);
    color: var(--text-color);
  }

  /* 提交按钮样式 */
  .tk-submit {
    background-color: var(--primary-color);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .tk-submit:hover {
    opacity: 0.9;
  }
</style>
{{ end }}
```

### 第三步：确认 PaperMod 主题集成

PaperMod 主题已经内置了评论系统支持，你只需要：

1. 确认 `layouts/partials/comments.html` 文件存在（上面已创建）
2. PaperMod 会自动在文章底部加载这个文件

### 第四步：在文章中启用评论

在文章的 Front Matter 中添加：

```yaml
---
title: "文章标题"
date: 2025-01-06T10:00:00+08:00
draft: false
comments: true  # 启用评论
---
```

或者在 `config.toml` 中全局启用（已配置）：

```toml
[params]
  comments = true  # 所有文章默认启用评论
```

---

## 测试评论功能

### 本地测试

```bash
# 启动 Hugo 服务器
hugo server -D

# 访问
http://localhost:1313
```

打开任意文章，滚动到底部，你应该能看到 Twikoo 评论框。

### 发布测试

1. 提交代码到 GitHub
2. Cloudflare Pages 自动部署
3. 访问线上站点，测试评论功能

### 首次配置

**第一次访问评论系统时**：

1. 点击评论框中的 "登录"
2. 输入你设置的密码（环境变量中的 `TWIKOO_ADMIN_PASSWORD`）
3. 进入管理后台
4. 可以配置：
   - 邮件通知
   - 敏感词过滤
   - 评论审核
   - 数据导出

---

## 高级配置

### 1. 配置邮件通知

在 Vercel 环境变量中添加：

```bash
# 使用 QQ 邮箱
SMTP_SERVICE=qq
SMTP_USER=your-email@qq.com
SMTP_PASSWORD=your-qq-mail-authorization-code

# 或使用 Gmail
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### 2. 配置图片上传

Twikoo 支持多种图床：

```javascript
twikoo.init({
  envId: 'your-env-id',
  onCommentLoaded: function () {
    // 配置图床
    twikoo.getComment().then(res => {
      console.log(res);
    });
  }
})
```

### 3. 自定义样式

```css
/* 修改主题色 */
.tk-submit {
  background-color: #409EFF !important;
}

/* 修改字体大小 */
.tk-comment {
  font-size: 16px;
}

/* 修改头像大小 */
.tk-avatar {
  width: 50px;
  height: 50px;
}
```

### 4. 配置暗色模式

Twikoo 会自动适配暗色模式，确保你的主题有正确的 CSS 变量：

```css
:root {
  --theme-bg: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
}

.dark {
  --theme-bg: #1e1e1e;
  --text-color: #f0f0f0;
  --border-color: #444444;
}
```

---

## 常见问题

### ❌ 评论框不显示？

**检查清单**：

1. `envId` 是否正确？
2. 网络是否正常？
3. 浏览器控制台是否有错误？
4. 文章中 `comments: true` 是否设置？

**解决方法**：

```javascript
// 在浏览器控制台运行
console.log(document.getElementById('tcomment'));
```

### ❌ 无法发表评论？

**可能原因**：

- 未配置管理员密码
- 网络连接问题
- Twikoo 服务未启动

**解决方法**：

1. 检查 Vercel 部署状态
2. 查看环境变量是否配置
3. 检查浏览器控制台错误信息

### ❌ 想要迁移旧评论？

如果你之前使用的是其他评论系统：

**从 Giscus 迁移**：
1. 导出 GitHub Discussions 数据
2. 使用 Twikoo 管理后台导入

**从 Disqus 迁移**：
1. 导出 Disqus XML
2. 使用转换工具转换为 Twikoo 格式
3. 通过管理后台导入

### ❌ 如何备份数据？

**方法一：通过管理后台**
1. 登录 Twikoo 管理后台
2. 点击 "数据管理"
3. 点击 "导出" 按钮
4. 选择导出格式（JSON/CSV）

**方法二：直接访问数据库**
```bash
# 如果使用 MongoDB
mongodump --uri="your-mongodb-uri" --out=./backup
```

---

## 最佳实践

### 1. 设置评论规范

在评论区上方显示你的评论规范：

```markdown
## 欢迎留言

- 请文明发言，遵守社区规范
- 支持 Markdown 格式
- 可以插入表情包
- 管理员保留删除不当评论的权利
```

### 2. 定期维护

- 每周审核评论
- 回复读者评论
- 清理垃圾评论
- 定期备份数据

### 3. 配置通知

- 邮件通知：及时收到新评论提醒
- 微信通知：通过 Server酱实现
- Telegram 通知：使用 Telegram Bot

---

## 数据管理

### 访问管理后台

1. 在评论区点击 "登录"
2. 输入管理员密码
3. 进入管理界面

### 管理功能

- ✅ 查看所有评论
- ✅ 删除/恢复评论
- ✅ 标记垃圾评论
- ✅ 设置敏感词
- ✅ 查看统计数据
- ✅ 导出数据

---

## 性能优化

### 1. 使用国内 CDN

```html
<script src="https://cdn.staticfile.org/twikoo/1.6.41/twikoo.all.min.js"></script>
```

或者使用 unpkg：

```html
<script src="https://unpkg.com/twikoo@1.6.41/dist/twikoo.all.min.js"></script>
```

### 2. 延迟加载

```javascript
// 只在滚动到评论区时才加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadTwikoo();
      observer.disconnect();
    }
  });
});

observer.observe(document.getElementById('tcomment'));
```

### 3. 缓存策略

Twikoo 会自动缓存评论数据，无需额外配置。

---

## 安全建议

### 1. 设置管理员密码

```bash
TWIKOO_ADMIN_PASSWORD=your-strong-password
```

### 2. 启用评论审核

在管理后台开启 "评论需审核" 选项。

### 3. 配置敏感词

在管理后台添加敏感词列表，自动过滤不当内容。

### 4. 防刷评论

在管理后台开启 "防刷评论" 功能，设置评论频率限制。

---

## 总结

### Twikoo vs Giscus：最终选择

| 项目 | Twikoo | Giscus |
|------|--------|--------|
| **国内访问** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **加载速度** | < 1秒 | 3-10秒 |
| **稳定性** | 非常稳定 | 不稳定 |
| **管理后台** | ✅ 有 | ❌ 无 |
| **登录方式** | 多种 | 仅 GitHub |
| **免费额度** | 充足 | 无限制 |
| **部署难度** | 简单 | 简单 |

**推荐选择 Twikoo，如果**：
- ✅ 你的读者主要在国内
- ✅ 需要快速加载
- ✅ 需要管理后台
- ✅ 需要多种登录方式

**继续使用 Giscus，如果**：
- ✅ 纯技术博客
- ✅ 读者都是开发者
- ✅ 不想维护任何服务

---

## 相关链接

- [Twikoo 官方文档](https://twikoo.js.org/)
- [Twikoo GitHub](https://github.com/twikoojs/twikoo)
- [Twikoo 在线演示](https://twikoo.js.org/demo.html)
- [Vercel 部署教程](https://vercel.com/docs)
- [腾讯云 CloudBase 文档](https://docs.cloudbase.net/)

---

## 完成！

现在你的博客已经配置好 Twikoo 评论系统了！🎉

**配置要点回顾**：

1. ✅ 在 Vercel/腾讯云部署 Twikoo 服务
2. ✅ 获取 `envId`（你的 Twikoo 服务地址）
3. ✅ 更新 Hugo `config.toml`
4. ✅ 创建 `layouts/partials/comments.html`
5. ✅ 测试评论功能

**下一步**：

- 在你的博客上测试评论功能
- 在评论区留下第一条评论
- 与你的读者互动交流！

祝你使用愉快！
