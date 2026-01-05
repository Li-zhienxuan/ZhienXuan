/**
 * 天气与 IP 定位小部件
 *
 * 功能：
 * - 获取访客 IP 地址
 * - 根据IP定位城市
 * - 获取当前位置的实时天气
 * - 支持多IP服务回退
 * - 支持浏览器地理定位备用
 *
 * 使用方法：
 * 1. 在 HTML 中添加容器元素：
 *    <div id="weather-widget" class="weather-widget">
 *      <div class="weather-top">
 *        <div class="weather-icon" id="weather-icon">🌤️</div>
 *        <div>
 *          <div class="weather-location" id="weather-location">正在获取位置…</div>
 *          <div class="weather-note" id="visitor-ip">IP: —</div>
 *        </div>
 *      </div>
 *      <div>
 *        <div>当前： <span class="weather-temp" id="weather-temp">--°C</span></div>
 *        <div class="weather-note" id="weather-desc">—</div>
 *      </div>
 *    </div>
 *
 * 2. 引入此 JS 文件：
 *    <script src="/function/weather-widget.js"></script>
 */

(function() {
    'use strict';

    // 检查必要的 DOM 元素是否存在
    const ipEl = document.getElementById('visitor-ip');
    const locEl = document.getElementById('weather-location');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');

    // 如果所有元素都不存在，不执行初始化
    if (!ipEl && !locEl && !tempEl && !descEl && !iconEl) {
        console.log('Weather Widget: 未找到必要的 DOM 元素，跳过初始化');
        return;
    }

    /**
     * 超时 Promise 工具
     * @param {number} ms - 超时毫秒数
     * @returns {Promise}
     */
    const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

    /**
     * 带超时的 JSON 请求
     * @param {string} url - API 地址
     * @param {number} ms - 超时时间（毫秒）
     * @returns {Promise<Object>}
     */
    const fetchJSON = (url, ms = 6000) => Promise.race([
        fetch(url).then(r => r.ok ? r.json() : Promise.reject(r)),
        timeout(ms)
    ]);

    /**
     * 天气代码转中文描述
     * @param {number} code - WMO 天气代码
     * @returns {string}
     */
    function weatherCodeToText(code) {
        if (code === 0) return '晴朗';
        if (code <= 3) return '多云';
        if (code === 45 || code === 48) return '雾';
        if (code >= 51 && code <= 67) return '小雨';
        if (code >= 71 && code <= 77) return '小雪';
        if (code >= 80 && code <= 82) return '阵雨';
        if (code >= 95) return '雷暴';
        return '多变';
    }

    /**
     * 天气代码转 Emoji 图标
     * @param {number} code - WMO 天气代码
     * @returns {string}
     */
    function weatherCodeToEmoji(code) {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code === 45 || code === 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 82) return '🌦️';
        if (code >= 95) return '⚡';
        return '🌤️';
    }

    /**
     * 获取 IP 数据（多服务回退）
     * @returns {Promise<Object|null>}
     */
    async function getIpData() {
        const services = [
            'https://ipapi.co/json/',
            'https://ipwho.is/json/'
        ];

        for (const url of services) {
            try {
                const d = await fetchJSON(url, 6000);
                if (d && (d.ip || d.success === true || d.ip_address)) {
                    console.log(`Weather Widget: IP 数据获取成功 (${url})`);
                    return d;
                }
            } catch (e) {
                console.warn(`Weather Widget: ${url} 请求失败，尝试下一个服务`);
            }
        }
        console.warn('Weather Widget: 所有 IP 服务均失败');
        return null;
    }

    /**
     * 通过浏览器地理定位获取坐标
     * @returns {Promise<Object|null>}
     */
    async function getCoordsViaGeolocation() {
        if (!navigator.geolocation) {
            console.warn('Weather Widget: 浏览器不支持地理定位');
            return null;
        }

        return new Promise((resolve) => {
            const done = (pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            });
            const fail = () => {
                console.warn('Weather Widget: 地理定位失败');
                resolve(null);
            };
            navigator.geolocation.getCurrentPosition(done, fail, {
                maximumAge: 600000,
                timeout: 8000
            });
        });
    }

    /**
     * 初始化天气小部件
     */
    async function init() {
        try {
            // 1. 获取 IP 数据
            const data = await getIpData();
            let lat = null, lon = null;

            if (data) {
                // 显示 IP 地址
                const ip = data.ip || data.ip_address || '—';
                if (ipEl) ipEl.textContent = `IP: ${ip}`;

                // 显示位置信息
                const city = data.city || '';
                const region = data.region || data.regionName || '';
                const country = data.country_name || data.country || data.countryCode || '';
                if (locEl) {
                    locEl.textContent = [city, region, country].filter(Boolean).join(' · ') || '未知位置';
                }

                // 提取坐标
                lat = data.latitude ?? data.lat;
                lon = data.longitude ?? data.lon;
            } else {
                if (ipEl) ipEl.textContent = 'IP: 无法获取';
                if (locEl) locEl.textContent = '尝试定位中…';
            }

            // 2. 如果没有坐标，尝试浏览器定位
            if (lat == null || lon == null) {
                const geo = await getCoordsViaGeolocation();
                if (geo) {
                    lat = geo.latitude;
                    lon = geo.longitude;
                    if (locEl && (!locEl.textContent || locEl.textContent === '尝试定位中…')) {
                        locEl.textContent = '通过浏览器定位';
                    }
                }
            }

            // 3. 获取天气数据
            if (lat != null && lon != null) {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true&timezone=auto`;

                try {
                    const w = await fetchJSON(url, 7000);
                    const cw = w.current_weather || {};
                    const temp = cw.temperature;
                    const code = cw.weathercode;
                    const wind = cw.windspeed;

                    if (tempEl) tempEl.textContent = (temp != null) ? `${Number(temp).toFixed(1)}°C` : '--°C';
                    if (descEl) descEl.textContent = `${weatherCodeToText(code)} · 风 ${wind ?? '--'} km/h`;
                    if (iconEl) iconEl.textContent = weatherCodeToEmoji(code);

                    console.log('Weather Widget: 天气数据更新成功');
                } catch (e) {
                    console.error('Weather Widget: 天气 API 请求失败', e);
                    if (descEl) descEl.textContent = '天气服务不可用';
                }
            } else {
                if (descEl) descEl.textContent = '无法获取经纬度';
                if (tempEl) tempEl.textContent = '--°C';
                if (iconEl) iconEl.textContent = '—';
            }
        } catch (e) {
            console.error('Weather Widget: 初始化失败', e);
            if (ipEl) ipEl.textContent = 'IP: 无法获取';
            if (locEl) locEl.textContent = '未知位置';
            if (descEl) descEl.textContent = '天气服务不可用';
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 导出到全局（可选）
    window.WeatherWidget = {
        init,
        refresh: init,
        weatherCodeToText,
        weatherCodeToEmoji
    };

    console.log('Weather Widget: 已加载');
})();
