---
title: "如何为博客配置 Giscus 评论系统"
date: 2025-01-06T10:00:00+08:00
draft: false
description: "详细介绍如何为 Hugo 博客配置基于 GitHub Discussions 的 Giscus 评论系统"
categories: ["教程"]
tags: ["Hugo", "Giscus", "博客搭建", "评论系统"]
series: ["博客搭建"]
series_order: 2
comments: true
---

## 为什么选择 Giscus？

在为博客选择评论系统时，我们有多个选择：Disqus、Valine、Waline、Twikoo 等。但我最终选择了 **Giscus**，原因如下：

### Giscus 的优势

- **完全免费**：无需数据库，无需服务器
- **数据自主**：所有评论存储在你的 GitHub 仓库中
- **隐私友好**：不追踪用户，符合 GDPR
- **功能强大**：支持 Markdown、LaTeX、代码高亮
- **自动主题**：完美适配深色/浅色模式
- **多语言**：支持中文等 20+ 语言

### 适用场景

- ✅ 技术博客
- ✅ 文档网站
- ✅ 开源项目文档
- ✅ 个人知识库

---

## 配置步骤总览

配置 Giscus 主要分为 5 个步骤：

1. **准备 GitHub 仓库**（确保公开并启用 Discussions）
2. **安装 Giscus App**
3. **获取配置参数**
4. **更新 Hugo 配置**
5. **测试评论功能**

---

## 第一步：准备 GitHub 仓库

### 1.1 确认仓库为公开状态

Giscus 依赖 GitHub API，因此仓库必须是 Public 的。

```bash
# 如果你的仓库是 Private 的，需要改为 Public
# Settings → General → Danger Zone → Change visibility
```

### 1.2 启用 Discussions 功能

1. 进入仓库的 **Settings** 页面
2. 滚动到 **Features** 部分
3. 勾选 **Discussions** 复选框
4. 确认启用

![启用 Discussions](https://docs.github.com/assets/cb-31174/images/help/repository/repo-discussions-checkbox.webp)

---

## 第二步：安装 Giscus 应用

访问 [Giscus App 安装页面](https://github.com/apps/giscus)，点击 **Install** 按钮。

选择你要安装的仓库（比如你的博客源码仓库），完成安装。

---

## 第三步：获取配置参数

打开 [Giscus 配置向导](https://giscus.app/zh-CN)，填写以下信息：

### 3.1 仓库信息

```
仓库：Li-zhienxuan/blog.zhienxuan.com
```

### 3.2 页面 ↔️ discussions 映射

推荐选择 `pathname`，这样每个 URL 路径对应一个独立的讨论串。

| 映射方式 | 说明 | 推荐度 |
|---------|------|--------|
| `pathname` | 基于路径 | ⭐⭐⭐⭐⭐ |
| `url` | 基于完整 URL | ⭐⭐⭐⭐ |
| `title` | 基于标题 | ⭐⭐⭐ |

### 3.3 Discussion 分类

选择 `Announcements` 或创建自定义分类（如 `Comments`）。

### 3.4 主题设置

- `preferred_color_scheme`：跟随系统（推荐）
- `light`：浅色主题
- `dark`：深色主题

### 3.5 复制生成的配置

配置完成后，你会看到类似这样的代码：

```html
<script src="https://giscus.app/client.js"
        data-repo="Li-zhienxuan/blog.zhienxuan.com"
        data-repo-id="R_kgDONXXXXX"
        data-category="Announcements"
        data-category-id="DIC_kwDONXXXXX4XXXX"
        data-mapping="pathname"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

**重点记住这 4 个参数**：
- `data-repo`：`Li-zhienxuan/blog.zhienxuan.com`
- `data-repo-id`：`R_kgDONXXXXX`
- `data-category`：`Announcements`
- `data-category-id`：`DIC_kwDONXXXXX4XXXX`

---

## 第四步：配置 Hugo

编辑你的 `config.toml` 文件：

```toml
# 全局启用评论
[params]
  comments = true

# Giscus 配置
[params.giscus]
  repo = "Li-zhienxuan/blog.zhienxuan.com"
  repoId = "R_kgDONXXXXX"
  category = "Announcements"
  categoryId = "DIC_kwDONXXXXX4XXXX"
  theme = "preferred_color_scheme"
  mapping = "pathname"
  reactionsEnabled = 1
  emitMetadata = 0
```

### PaperMod 主题集成

如果你使用的是 PaperMod 主题，它已经内置了 Giscus 支持，无需额外配置模板文件。

---

## 第五步：测试评论功能

### 5.1 本地测试

```bash
# 启动 Hugo 开发服务器
hugo server -D

# 访问 http://localhost:1313
```

打开任意文章，滚动到底部，你应该能看到评论框。

### 5.2 发布测试

1. 提交代码到 GitHub
2. Cloudflare Pages 自动部署
3. 访问线上站点，测试评论功能

### 5.3 验证 Discussions

回到 GitHub 仓库的 Discussions 页面，你会看到每篇文章对应的讨论串。

---

## 高级用法

### 在特定文章中禁用评论

在文章的 Front Matter 中设置：

```yaml
---
title: "关于我"
comments: false  # 禁用评论
---
```

### 自定义评论样式

创建 `layouts/partials/comments.html`：

```html
<style>
  .giscus-frame {
    border-radius: 8px;
    margin-top: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
```

### 多语言博客配置

如果你的博客支持多语言，可以为每种语言配置不同的 Discussion 分类：

```toml
[languages.zh]
  [languages.zh.params.giscus]
    category = "中文评论"

[languages.en]
  [languages.en.params.giscus]
    category = "English Comments"
```

---

## 常见问题

### ❌ 评论框不显示

**检查清单：**

1. 仓库是否为公开状态？
2. Discussions 功能是否已启用？
3. Giscus App 是否已安装？
4. `repoId` 和 `categoryId` 是否正确？
5. 浏览器控制台是否有错误？

**调试方法：**

```javascript
// 在浏览器控制台运行
console.log(document.querySelector('script[src*="giscus"]'));
```

### ❌ 评论无法提交

**可能原因：**

- 未登录 GitHub 账号
- 网络连接问题
- CORS 配置问题

**解决方法：**

确保已登录 GitHub，并且仓库的 Discussions 功能正常工作。

### ❌ 想迁移旧评论

如果你之前使用的是其他评论系统（如 Disqus），可以：

1. 导出旧评论数据
2. 使用 GitHub API 批量创建 Discussions
3. 迁移评论内容

---

## 最佳实践

### 1. 设置评论规范

在评论区上方显示你的评论规范：

```markdown
## 评论规范

- 保持友善和尊重
- 避免垃圾内容和广告
- 支持 Markdown 格式
- 可以使用 LaTeX 公式
```

### 2. 定期维护 Discussions

- 回复读者评论
- 标记重要讨论
- 整理重复问题

### 3. 备份数据

虽然 Giscus 的数据存储在 GitHub 上已经很安全，但定期备份仍然是个好习惯：

```bash
# 使用 GitHub CLI 导出 Discussions
gh repo view --json discussions
```

---

## 总结

Giscus 是一个优秀的评论系统解决方案，特别适合技术博客。它免费、强大、易用，而且完全基于 GitHub，无需额外的服务器和数据库。

**配置要点回顾：**

- ✅ 公开仓库 + 启用 Discussions
- ✅ 安装 Giscus App
- ✅ 获取 4 个关键参数（repo、repoId、category、categoryId）
- ✅ 更新 config.toml
- ✅ 测试评论功能

**下一步：**

- 在你的博客上配置 Giscus
- 在评论区留下第一条评论
- 与你的读者互动交流！

---

## 参考链接

- [Giscus 官方文档](https://github.com/giscus/giscus)
- [Giscus 配置向导](https://giscus.app)
- [PaperMod 主题文档](https://github.com/adityatelange/hugo-PaperMod/wiki/Features#comments)
- [GitHub Discussions 文档](https://docs.github.com/en/discussions)

---

💬 **欢迎在评论区分享你的配置经验或提出问题！**
