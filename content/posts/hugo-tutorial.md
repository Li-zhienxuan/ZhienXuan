---
title: "如何使用 Hugo 搭建个人博客"
date: 2025-01-05T19:00:00+08:00
draft: false
description: "详细介绍 Hugo 的安装、配置和使用方法"
categories: ["教程"]
tags: ["Hugo", "博客", "静态站点"]
series: ["博客搭建"]
series_order: 2
---

## Hugo 简介

Hugo 是一个用 Go 语言编写的静态站点生成器，具有以下特点：

- ⚡ 构建速度极快（<1秒）
- 📦 单一二进制文件
- 🔧 配置简单
- 🎨 主题生态丰富

## 安装 Hugo

### macOS
```bash
brew install hugo
```

### Linux
```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.140.0/hugo_extended_0.140.0_linux-amd64.deb
sudo dpkg -i hugo_extended_0.140.0_linux-amd64.deb
```

### Windows
```powershell
choco install hugo-extended
```

## 创建新站点

```bash
# 创建新站点
hugo new site my-blog

# 进入目录
cd my-blog

# 添加主题
git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod

# 复制配置
cp themes/PaperMod/exampleSite/config.toml config.toml
```

## 创建新文章

```bash
# 创建文章
hugo new posts/my-article.md

# 启动开发服务器
hugo server -D

# 访问 http://localhost:1313
```

## 构建静态站点

```bash
# 构建
hugo --minify

# 输出在 public/ 目录
```

## 部署

将 `public/` 目录上传到任何静态托管服务：
- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel

## 总结

Hugo 是构建个人博客的最佳选择之一，简单快速！

---

**Happy Blogging!** 🎉
