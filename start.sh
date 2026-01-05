#!/bin/bash

# Hugo 博客启动脚本

set -e

echo "🚀 启动 Hugo 开发服务器..."
echo "📝 创建日期: $(date)"
echo ""

# 检查 Hugo 是否安装
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo 未安装！"
    echo ""
    echo "请先安装 Hugo:"
    echo "  macOS: brew install hugo"
    echo "  Linux: https://github.com/gohugoio/hugo/releases"
    echo "  Windows: choco install hugo-extended"
    exit 1
fi

# 显示 Hugo 版本
echo "✅ Hugo 版本: $(hugo version)"
echo ""

# 检查主题是否存在
if [ ! -d "themes/PaperMod" ]; then
    echo "⚠️  PaperMod 主题未找到，正在安装..."
    git clone --depth 1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
    echo "✅ 主题安装完成！"
    echo ""
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 访问地址: http://localhost:1313"
echo "💡 按 Ctrl+C 停止服务器"
echo ""
echo "================================================"
echo ""

hugo server -D --bind 0.0.0.0
