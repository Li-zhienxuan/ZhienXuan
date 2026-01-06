# Giscus 评论系统配置完整指南

## 什么是 Giscus？

Giscus 是一个基于 GitHub Discussions 的评论系统，它具有以下优势：
- ✅ 完全免费，无需数据库
- ✅ 支持 Markdown 和 LaTeX
- ✅ 自动深色/浅色主题切换
- ✅ 多语言支持
- ✅ 基于隐私保护（无追踪）

---

## 第一步：准备 GitHub 仓库

### 1.1 确保仓库是公开的
你的博客仓库必须是 **Public**（公开）的，因为 Giscus 需要访问 GitHub API。

### 1.2 启用 Discussions
1. 进入你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单找到 **General**
4. 滚动到 "Features" 部分
5. 勾选 ✅ **Discussions**

---

## 第二步：安装 Giscus App

1. 访问：https://github.com/apps/giscus
2. 点击 **Install**
3. 选择你要安装的仓库（例如：`Li-zhienxuan/blog.zhienxuan.com`）
4. 点击 **Install** 完成安装

---

## 第三步：获取配置参数

### 3.1 访问配置页面
打开：https://giscus.app/zh-CN

### 3.2 填写仓库信息
在配置页面填写：

- **仓库**：`Li-zhienxuan/blog.zhienxuan.com`（替换为你的仓库）
- **页面 ↔️ discussions 映射关系**：选择 `pathname`（推荐）
- **Discussion 分类**：选择 `Announcements` 或创建新分类
- **主题**：选择 `preferred_color_scheme`（自动跟随系统）

### 3.3 复制生成的配置
页面会生成类似以下的内容：

```html
<script src="https://giscus.app/client.js"
        data-repo="Li-zhienxuan/blog.zhienxuan.com"
        data-repo-id="R_kgDONXXXXX"
        data-category="Announcements"
        data-category-id="DIC_kwDONXXXXX4XXXX"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

**重点：记住以下 4 个参数**（在 HTML 中查找）：
- `data-repo`：仓库全名
- `data-repo-id`：仓库 ID
- `data-category`：分类名称
- `data-category-id`：分类 ID

---

## 第四步：更新 config.toml

编辑你的 `config.toml` 文件，将获取的参数填入：

```toml
# Giscus 评论系统配置
[params.giscus]
  repo = "Li-zhienxuan/blog.zhienxuan.com"          # 你的仓库全名
  repoId = "R_kgDONXXXXX"                          # 从上面获取的仓库 ID
  category = "Announcements"                        # Discussion 分类
  categoryId = "DIC_kwDONXXXXX4XXXX"                # 从上面获取的分类 ID
  theme = "preferred_color_scheme"                  # 主题：自动跟随系统
  mapping = "pathname"                              # 映射方式
  reactionsEnabled = 1                              # 启用表情反应
  emitMetadata = 0                                  # 不发送元数据
```

### 参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `repo` | `username/repo` | GitHub 仓库全名 |
| `repoId` | `R_kg...` | 仓库的唯一标识符 |
| `category` | `Announcements` | Discussions 分类名称 |
| `categoryId` | `DIC_kw...` | 分类的唯一标识符 |
| `theme` | `preferred_color_scheme` | 主题选项 |
| `mapping` | `pathname` | 页面与评论的映射方式 |
| `reactionsEnabled` | `1` | 是否启用表情反应（1=启用，0=禁用） |
| `emitMetadata` | `0` | 是否发送元数据 |

---

## 第五步：在文章中启用评论

### 方法 1：全局启用（推荐）

在 `config.toml` 中已设置：
```toml
[params]
  comments = true  # 全局启用评论
```

所有文章默认都会显示评论系统。

### 方法 2：单篇文章启用

在文章的 Front Matter 中添加：

```yaml
---
title: "文章标题"
date: 2025-01-06
comments: true  # 启用评论
---
```

### 方法 3：单篇文章禁用

如果某篇文章不想显示评论：

```yaml
---
title: "关于我"
date: 2025-01-06
comments: false  # 禁用评论
---
```

---

## 第六步：测试评论系统

### 6.1 本地测试
运行 Hugo 服务器：
```bash
hugo server -D
```

访问任意文章页面，检查底部是否显示评论框。

### 6.2 发布测试
1. 提交代码到 GitHub
2. 部署到 Cloudflare Pages
3. 访问线上站点，打开一篇文章
4. 在评论区写下第一条测试评论

### 6.3 验证 Discussions
1. 进入你的 GitHub 仓库
2. 点击 **Discussions** 标签
3. 你会看到自动创建的讨论
4. 测试评论会显示在这里

---

## 常见问题

### ❌ 评论框不显示？

**检查清单：**
- [ ] 仓库是公开的吗？
- [ ] Discussions 功能已启用吗？
- [ ] Giscus App 已安装了吗？
- [ ] `repoId` 和 `categoryId` 是否正确？
- [ ] 文章中 `comments: true` 是否设置？

**调试方法：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误信息
3. 检查 Network 标签，看是否有 API 请求失败

### ❌ 评论无法提交？

**可能原因：**
- 未登录 GitHub 账号
- 仓库权限问题
- 网络连接问题

**解决方法：**
- 确保已登录 GitHub
- 检查 Giscus App 是否正确安装
- 尝试刷新页面

### ❌ 主题颜色不对？

**检查配置：**
```toml
theme = "preferred_color_scheme"  # 自动跟随系统
```

可选的主题值：
- `light`：浅色主题
- `dark`：深色主题
- `preferred_color_scheme`：跟随系统
- `transparent_dark`：透明深色主题
- `dark_dimmed`：暗淡深色主题

### ❌ 想要自定义样式？

在你的自定义 CSS 文件中添加：
```css
/* 自定义容器样式 */
.giscus-frame {
  border-radius: 8px;
  margin-top: 2rem;
}

/* 自定义加载动画 */
.giscus-frame::before {
  content: "加载评论中...";
}
```

---

## 高级配置

### 限制评论语言

如果你想只显示特定语言的评论：

```toml
[params.giscus]
  lang = "zh-CN"  # 强制使用中文界面
```

### 调整评论框位置

```toml
[params.giscus]
  inputPosition = "top"     # 输入框在顶部
  # inputPosition = "bottom" # 输入框在底部（默认）
```

### 启用严格模式

确保评论只在完全匹配的页面显示：

```toml
[params.giscus]
  lazyLoading = true  # 延迟加载评论
```

---

## 备份与导出

由于 Giscus 基于GitHub Discussions，所有评论都存储在你的仓库中，天然具有备份功能。

**导出评论数据：**
1. 进入仓库的 Discussions
2. 使用 GitHub API 导出数据
3. 或者手动复制重要评论

---

## 迁移指南

### 从其他评论系统迁移

**从 Disqus 迁移：**
1. 使用 Disqus 导出工具
2. 转换格式为 Giscus 可用格式
3. 通过 GitHub API 导入

**从 Valine/Waline 迁移：**
1. 导出 LeanCloud 数据
2. 转换为 GitHub Discussions 格式
3. 批量创建 Discussions

---

## 相关链接

- 🔧 [Giscus 官方文档](https://github.com/giscus/giscus)
- ⚙️ [Giscus 配置页面](https://giscus.app)
- 📖 [PaperMod 主题文档](https://github.com/adityatelange/hugo-PaperMod/wiki)
- 💬 [GitHub Discussions 文档](https://docs.github.com/en/discussions)

---

## 完成！

现在你的博客已经配置好评论系统了！🎉

读者可以：
- 使用 GitHub 账号登录评论
- 使用 Markdown 格式
- 添加 LaTeX 数学公式
- 表情反应
- 收到回复通知

开始与你的读者互动吧！
