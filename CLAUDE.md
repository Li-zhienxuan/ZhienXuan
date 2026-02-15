# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个使用 **Hugo**（静态站点生成器）和 **PaperMod** 主题构建的个人技术博客，部署于 Cloudflare Pages。

**核心技术栈：**
- Hugo v0.146.0+（需要 extended 版本）
- PaperMod 主题（通过 git submodule 位于 `themes/PaperMod`）
- Twikoo 评论系统（MongoDB 后端）
- Fuse.js 本地搜索（无外部依赖）
- 部署在 Cloudflare Pages

## 常用开发命令

### 启动开发服务器
```bash
# 启动开发服务器（包含草稿文章）
hugo server -D

# 服务器运行在 http://localhost:1313
```

### 构建项目
```bash
# 使用构建脚本（清理并构建）
./build.sh

# 直接使用 Hugo 命令
hugo --minify

# 输出目录：public/
```

### 创建新内容
```bash
# 创建新文章（使用 archetypes/posts.md 模板）
hugo new posts/my-article.md
```

### 测试
```bash
# 本地测试（显示草稿和未来日期的文章）
hugo server -D -F

# 构建无压缩版本用于调试
hugo
```

## 项目结构

```
content/
├── posts/           # 博客文章（Markdown 文件，包含 front matter）
├── about.md         # 关于页面
└── friends.md       # 友链页面
layouts/
└── partials/        # 自定义模板覆盖
assets/
└── css/extended/    # 自定义 CSS（custom.css）
static/              # 静态文件（图片、manifest.json、robots.txt）
archetypes/          # `hugo new` 命令的内容模板
themes/PaperMod/     # PaperMod 主题（git submodule）
config.toml          # 主配置文件
vercel.json          # 构建环境变量
```

## 关键：Hugo 日期格式要求

**这是最常见的构建错误来源。** Hugo 要求 front matter 中的日期必须使用 **严格的 ISO 8601 格式**：

✅ **正确格式：**
```yaml
date: 2026-02-14T00:05:40+08:00
date: 2026-02-14
date: 2026-02-14T00:05:40Z
```

❌ **错误格式（会导致构建失败）：**
```yaml
date: 2026年02月14日 00:05:40    # 不支持中文字符
date: Feb 14, 2026                # 不支持本地化字符串
```

**Front matter 示例：**
```markdown
---
title: "文章标题"
date: 2026-02-14T18:00:00+08:00
draft: false
description: "文章描述"
categories: ["技术"]
tags: ["标签1", "标签2"]
series: ["系列名称"]
series_order: 1
---
```

## 配置文件说明

- **config.toml**：主站点配置（标题、主题参数、菜单、分析工具）
  - 评论系统：`[params.twikoo]` MongoDB 连接配置
  - 搜索功能：`[params.fuseOpts]` 本地搜索配置
  - 分析工具：`[params.analytics.google]` 和 `[params.analytics.baidu]`

- **vercel.json**：Cloudflare Pages 构建配置
  - 设置 `HUGO_VERSION` 和 `HUGO_EXTENDED` 环境变量

- **archetypes/posts.md**：新文章模板（定义默认 front matter）

## 主题自定义

项目通过 git submodule 使用 PaperMod 主题。自定义方式：
- `layouts/partials/` - 覆盖主题部分模板
- `assets/css/extended/custom.css` - 自定义样式
- `config.toml` - 主题参数配置

**主题位置：** `themes/PaperMod/`（submodule - 使用 `git submodule update --remote --merge` 更新）

## 部署（Cloudflare Pages）

构建配置：
- **构建命令：** `hugo --minify`
- **构建输出目录：** `public`
- **环境变量：** `HUGO_VERSION = 0.146.0`

推送到 main 分支后站点会自动部署。

## 常见问题与解决方案

### 构建错误："date front matter field is not a parsable date"
- **原因：** 日期字段包含非 ISO 格式（如中文字符）
- **解决：** 使用 ISO 8601 格式：`YYYY-MM-DDTHH:MM:SS+TZ:HH`

### 主题未加载
- **原因：** PaperMod submodule 未初始化
- **解决：** `git submodule update --init --recursive`

### 图片无法显示
- 将图片放置在 `static/images/` 目录
- 使用绝对路径引用：`/images/filename.jpg`
- 或使用页面资源：`content/posts/post-name/filename.jpg`

## Front Matter 参考字段

创建或编辑文章时，确保包含以下必需字段：
- `title`：文章标题
- `date`：ISO 8601 格式（见上文）
- `draft`：`true` 或 `false`
- `description`：用于 meta 标签的简短描述
- `categories`：数组，如 `["技术"]`
- `tags`：数组，如 `["编程", "开发"]`
- `series`：可选的系列名称
- `series_order`：可选的系列内排序
