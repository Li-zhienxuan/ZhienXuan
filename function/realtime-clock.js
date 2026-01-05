/**
 * 实时时间显示小部件
 *
 * 功能：
 * - 实时显示当前时间（年-月-日 星期X 时:分:秒）
 * - 自动每秒更新
 * - 中文格式化
 *
 * 使用方法：
 * 1. 在 HTML 中添加容器：
 *    <span id="current-time"></span>
 *
 * 2. 引入此 JS 文件：
 *    <script src="/function/realtime-clock.js"></script>
 */

(function() {
    'use strict';

    // 检查必要的 DOM 元素是否存在
    const el = document.getElementById('current-time');

    if (!el) {
        console.log('Real-time Clock: 未找到 #current-time 元素，跳过初始化');
        return;
    }

    /**
     * 格式化数字，补零
     * @param {number} n - 数字
     * @returns {string} 补零后的字符串
     */
    const pad = n => String(n).padStart(2, '0');

    /**
     * 星期数组
     */
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    /**
     * 更新时间显示
     */
    function render() {
        const d = new Date();
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const weekday = weekdays[d.getDay()];
        const hour = pad(d.getHours());
        const minute = pad(d.getMinutes());
        const second = pad(d.getSeconds());

        el.textContent = `${year}-${month}-${day} ${weekday} ${hour}:${minute}:${second}`;
    }

    // 立即渲染一次
    render();

    // 每秒更新
    setInterval(render, 1000);

    // 导出到全局（可选）
    window.RealTimeClock = {
        refresh: render
    };

    console.log('Real-time Clock: 已加载');
})();
