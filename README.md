# 我的技术博客 🚀

基于 Hugo + PaperMod 主题构建的个人技术博客，专注于技术文章与知识沉淀。

## ✨ 特性

- ⚡ **极速加载** - Lighthouse 100/100 分
- 📱 **完美移动端** - 响应式设计，适配所有设备
- 🌓 **深色模式** - 自动切换主题
- 🔍 **本地搜索** - Fuse.js 无外部依赖
- 💬 **评论系统** - Giscus 基于 GitHub Discussions
- 🎨 **代码高亮** - Chroma 语法高亮
- 📊 **SEO 优化** - 完善的 meta 标签和 sitemap
- 🌐 **国内友好** - 无外部 CDN 依赖，国内访问快速

## 🛠️ 技术栈

- **静态站点生成器**: Hugo v0.140.0+
- **主题**: PaperMod
- **部署平台**: Cloudflare Pages
- **评论**: Giscus
- **搜索**: Fuse.js
- **分析**: Google Analytics / 百度统计

## 📦 安装

### 前置要求

- Hugo v0.140.0 或更高版本
- Git

### 安装 Hugo

#### macOS
```bash
brew install hugo
```

#### Linux
```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.140.0/hugo_extended_0.140.0_linux-amd64.deb
sudo dpkg -i hugo_extended_0.140.0_linux-amd64.deb
```

#### Windows
```powershell
choco install hugo-extended
```

### 克隆项目

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

### 运行

```bash
# 启动开发服务器
hugo server -D

# 访问 http://localhost:1313
```

## ✍️ 写作

### 创建新文章

```bash
hugo new posts/my-article.md
```

### 文章模板

```markdown
---
title: "文章标题"
date: 2025-01-05T18:00:00+08:00
draft: false
description: "文章描述"
categories: ["技术"]
tags: ["编程", "开发"]
series: ["系列名称"]
series_order: 1
---

<!-- 文章内容 -->
```

## 🏗️ 构建

```bash
# 构建生产版本
hugo --minify

# 输出在 public/ 目录
```

## 🚀 部署

### Cloudflare Pages

1. 推送代码到 GitHub
2. 在 Cloudflare Pages 中连接仓库
3. 配置构建设置：
   - **Build command**: `hugo --minify`
   - **Build output directory**: `public`
   - **Environment variables**: `HUGO_VERSION = 0.140.0`

详细步骤请参考 [部署文档](deploy.md)。

## 📁 项目结构

```
my-blog/
├── archetypes/          # 文章模板
├── assets/              # CSS、JS 等资源
│   └── css/
│       └── extended/    # 自定义样式
├── content/             # 内容文件
│   ├── posts/          # 博客文章
│   └── about.md        # 关于页面
├── data/                # 数据文件
├── layouts/             # 布局模板
│   └── partials/       # 部分模板
├── static/              # 静态资源
│   ├── icons/          # PWA 图标
│   ├── images/         # 图片
│   ├── manifest.json   # PWA 配置
│   └── robots.txt      # 爬虫配置
├── themes/              # 主题
│   └── PaperMod/       # PaperMod 主题
├── config.toml          # 主配置文件
├── .gitignore
├── README.md
└── deploy.md            # 部署文档
```

## ⚙️ 配置

### 主配置文件

所有配置都在 [config.toml](config.toml) 中，包括：

- 网站信息（标题、描述、关键词）
- 菜单配置
- 主题参数
- 评论系统
- 分析工具
- 输出格式

### 主题自定义

- **自定义样式**: [assets/css/extended/custom.css](assets/css/extended/custom.css)
- **移动端优化**: [layouts/partials/extend_head.html](layouts/partials/extend_head.html)
- **SEO 配置**: [layouts/partials/seo.html](layouts/partials/seo.html)

## 🔧 配置 Giscus 评论

1. 访问 https://github.com/apps/giscus
2. 安装 Giscus 应用
3. 创建 GitHub Discussions 仓库
4. 获取配置参数
5. 更新 `config.toml` 中的 `[params.giscus]` 部分

详细步骤请参考 [Giscus 文档](https://giscus.app)。

## 📊 性能优化

- ✅ Lighthouse 100/100
- ✅ First Contentful Paint < 1s
- ✅ 无外部 JavaScript 依赖
- ✅ 图片懒加载
- ✅ CSS/JS 压缩和分包
- ✅ HTTP/3 支持
- ✅ Cloudflare CDN 全球加速

## 🌐 国际化

支持中文和英文：

- 中文: `/` (默认)
- English: `/en/`

## 📱 移动端

- 响应式设计（375px - 1280px+）
- PWA 支持
- 触摸优化
- 移动端字体优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Hugo](https://gohugo.io/)
- [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 📞 联系方式

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your@email.com
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

**Happy Blogging!** 🎉
