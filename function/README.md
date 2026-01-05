# 功能模块

这个目录包含可复用的功能模块。

## 实时时钟小部件

一个轻量级的实时时间显示小部件。

### 功能特性

- ✅ 实时显示当前时间（每秒更新）
- ✅ 中文格式化
- ✅ 完全零依赖
- ✅ 自动启动

### 文件说明

- `realtime-clock.js` - 实时时钟功能脚本
- `weather-widget.js` - 天气小部件脚本
- `weather-widget.css` - 天气小部件样式
- `README.md` - 文档和使用指南

### 快速开始

#### 实时时钟

1. 在 HTML 中添加容器：
```html
<span id="current-time"></span>
```

2. 在 `</body>` 前引入脚本：
```html
<script src="/function/realtime-clock.js"></script>
```

#### 天气小部件

详见下方文档。

## 天气小部件

一个轻量级的天气和 IP 定位小部件。

### 功能特性

- ✅ 自动获取访客 IP 地址
- ✅ 根据 IP 定位城市信息
- ✅ 获取实时天气数据
- ✅ 多 IP 服务自动回退
- ✅ 支持浏览器地理定位备用
- ✅ 完全零依赖
- ✅ 响应式设计
- ✅ 深色模式支持

### 快速开始

#### 1. 在 HTML 中添加容器

```html
<div id="weather-widget" class="weather-widget">
    <div class="weather-top">
        <div class="weather-icon" id="weather-icon">🌤️</div>
        <div>
            <div class="weather-location" id="weather-location">正在获取位置…</div>
            <div class="weather-note" id="visitor-ip">IP: —</div>
        </div>
    </div>
    <div>
        <div>当前： <span class="weather-temp" id="weather-temp">--°C</span></div>
        <div class="weather-note" id="weather-desc">—</div>
    </div>
</div>
```

#### 2. 引入 CSS（在 `<head>` 中）

```html
<link rel="stylesheet" href="/function/weather-widget.css">
```

#### 3. 引入 JS（在 `</body>` 前）

```html
<script src="/function/weather-widget.js"></script>
```

### API 依赖

此小部件使用以下免费 API：

- **IP 定位**: ipapi.co 或 ipwho.is（自动回退）
- **天气数据**: Open-Meteo API（无需 API 密钥）

### 自定义配置

可以通过修改 HTML 元素的 `id` 来自定义显示：

- `visitor-ip` - 显示 IP 地址
- `weather-location` - 显示位置信息
- `weather-temp` - 显示温度
- `weather-desc` - 显示天气描述
- `weather-icon` - 显示天气图标

### JavaScript API

如果需要手动触发刷新：

```javascript
// 刷新天气数据
window.WeatherWidget.refresh();

// 获取天气描述
const text = window.WeatherWidget.weatherCodeToText(0); // "晴朗"

// 获取天气图标
const emoji = window.WeatherWidget.weatherCodeToEmoji(0); // "☀️"

// 刷新时钟
window.RealTimeClock.refresh();
```

### 浏览器兼容性

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- 移动浏览器

### 隐私说明

这些小部件会：
- 向外部 API 发送请求以获取 IP 和天气数据
- 可能请求浏览器地理定位权限（仅在 IP 定位失败时）

不会：
- 存储任何用户数据
- 使用 Cookie
- 跟踪用户行为
