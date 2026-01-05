# PWA Icons

请在此目录放置以下尺寸的图标文件：

- icon-72.png (72x72)
- icon-96.png (96x96)
- icon-128.png (128x128)
- icon-144.png (144x144)
- icon-152.png (152x152)
- icon-192.png (192x192)
- icon-384.png (384x384)
- icon-512.png (512x512)

## 生成图标工具

1. **在线工具**
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

2. **命令行工具**
   ```bash
   # 使用 ImageMagick
   convert icon-512.png -resize 72x72 icon-72.png
   convert icon-512.png -resize 96x96 icon-96.png
   # ... 以此类推
   ```

3. **设计工具**
   - Figma
   - Adobe Photoshop
   - GIMP

## 注意事项

- 使用 PNG 格式
- 建议使用圆角或透明背景
- 保持图标简洁，易识别
- 文件大小控制在 100KB 以内
