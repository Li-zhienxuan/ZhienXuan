# 评论系统配置指南 📝

本博客支持多种评论系统，推荐使用 **Giscus**（基于 GitHub Discussions）。

## 🌟 推荐方案：Giscus

### 优点
- ✅ 免费
- ✅ 基于 GitHub Discussions，数据完全掌控
- ✅ 支持 Markdown
- ✅ 支持 LaTeX 数学公式
- ✅ 支持代码高亮
- ✅ 支持表情反应
- ✅ 无需额外服务器
- ✅ 国内可访问（如果 GitHub 可访问）

### 配置步骤

#### 1. 安装 Giscus 应用

1. 访问 https://github.com/apps/giscus
2. 点击 **Install** 安装应用
3. 选择Only select repositories（仅选择的仓库）
4. 选择你的博客仓库（如 `yourusername/blog`）
5. 点击 **Install**

#### 2. 启用仓库 Discussions

1. 进入你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 滚动到 **Features** 部分
4. 勾选 **Discussions**
5. 点击 **Set up discussions**

#### 3. 获取配置参数

访问 https://giscus.app 填写以下信息：

- **仓库**: `yourusername/blog`（你的博客仓库）
- **Page ↔️ Discussions mappings**: `pathname`（推荐）
- **Discussion category**: `Announcements`（公告）
- **Features**: 根据需要选择
  - ☑️ Enable main comment below the post
  - ☑️ Enable lazy loading
- **Theme**: `preferred_color_scheme`（自动切换）
- **Language**: `zh-CN`（中文）

#### 4. 复制配置参数

在 **Enable giscus on your website** 部分，你会看到类似这样的配置：

```html
<script src="https://giscus.app/client.js"
        data-repo="yourusername/blog"
        data-repo-id="R_kgDO..."
        data-category="Announcements"
        data-category-id="DIC_kwDO..."
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

记下这些参数：
- `data-repo`: 仓库名
- `data-repo-id`: 仓库 ID
- `data-category`: 分类名称
- `data-category-id`: 分类 ID

#### 5. 更新博客配置

编辑 `config.toml` 文件：

```toml
[params.giscus]
  repo = "yourusername/blog"
  repoId = "R_kgDO..."
  category = "Announcements"
  categoryId = "DIC_kwDO..."
  theme = "preferred_color_scheme"
  mapping = "pathname"
  reactionsEnabled = 1
  emitMetadata = 0
```

替换成你自己的参数即可。

#### 6. 启用评论功能

确保 `config.toml` 中已启用评论：

```toml
[params]
  comments = true
```

#### 7. 重启博客

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
./start.sh
```

#### 8. 验证评论功能

访问任意文章页面，底部应该显示评论框。

### 测试评论

1. 访问你的任意文章
2. 滚动到页面底部
3. 使用 GitHub 账号登录
4. 发表第一条测试评论

## 🔄 备选方案：Waline

如果 GitHub 在国内访问不稳定，可以使用 **Waline**。

### 优点
- ✅ 国内访问速度快
- ✅ 支持多种数据库（LeanCloud、MySQL、MongoDB 等）
- ✅ 支持 Markdown
- ✅ 支持图片上传
- ✅ 支持 emoji
- ✅ 支持微信通知
- ✅ 中文开发

### 部署步骤（简化版）

#### 1. 部署 Waline 服务

最简单的方式是使用 **Vercel + LeanCloud**：

1. 访问 https://waline.js.org/guide/get-start/
2. 点击 **Deploy with Vercel**
3. 配置环境变量：
   - `LEANCloud_id`: 你的 LeanCloud App ID
   - `LEANCloud_key`: 你的 LeanCloud App Key
   - `LEANCloud_masterKey`: 你的 LeanCloud Master Key
4. 部署后获得服务地址（如 `https://your-waline.vercel.app`）

#### 2. 配置博客

安装 Waline 客户端：

```bash
npm install @waline/client
```

或者在 `layouts/partials/comments.html` 中添加：

```html
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v2/dist/waline.css" />
<div id="waline"></div>
<script type="module">
  import { init } from 'https://unpkg.com/@waline/client@v2/dist/waline.mjs';

  init({
    el: '#waline',
    serverURL: 'https://your-waline.vercel.app',
    lang: 'zh-CN',
  });
</script>
```

## 📊 其他评论系统

### Gitalk
- 基于 GitHub Issues
- 配置相对复杂
- 访问 https://github.com/gitalk/gitalk

### Utterances
- 类似 Giscus，但功能较少
- 访问 https://utteranc.es/

### Twikoo
- 国内开发
- 基于腾讯云开发
- 访问 https://twikoo.js.org/

## 🔧 配置文件位置

评论配置在 `config.toml` 的 `[params]` 部分：

```toml
[params]
  comments = true  # 全局启用评论

  # Giscus 配置
  [params.giscus]
    repo = "yourusername/yourrepo"
    repoId = "your-repo-id"
    category = "Announcements"
    categoryId = "your-category-id"
    theme = "preferred_color_scheme"
    mapping = "pathname"
    reactionsEnabled = 1
    emitMetadata = 0
```

## 🎨 评论样式自定义

PaperMod 主题会自动渲染评论，无需额外配置。如果需要自定义样式，可以在 `assets/css/extended/custom.css` 中添加：

```css
/* Giscus 评论样式优化 */
.giscus-frame {
  border-radius: 8px;
}

/* 调整评论容器宽度 */
@media (max-width: 768px) {
  .giscus-frame {
    width: 100%;
  }
}
```

## 📝 注意事项

1. **仓库必须为公开仓库**（Public），否则游客无法查看评论
2. **首次加载评论可能较慢**，因为需要从 GitHub 加载
3. **国内访问速度**：取决于 GitHub 的访问速度
4. **数据存储**：评论存储在 GitHub Discussions 中，完全归你所有

## 🚀 快速开始

总结：最快的方式是使用 **Giscus**

1. 安装应用：https://github.com/apps/giscus
2. 启用仓库 Discussions
3. 访问 https://giscus.app 获取配置
4. 更新 `config.toml`
5. 完成！

---

**需要帮助？**

- Giscus 文档：https://giscus.app
- Giscus GitHub：https://github.com/giscus/giscus
- PaperMod 文档：https://github.com/adityatelange/hugo-PaperMod

**Happy Commenting!** 💬
