#!/bin/bash

# Hugo 博客构建脚本

set -e

echo "🏗️  开始构建 Hugo 博客..."
echo "📝 构建时间: $(date)"
echo ""

# 检查 Hugo 是否安装
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo 未安装！"
    exit 1
fi

# 显示 Hugo 版本
echo "✅ Hugo 版本: $(hugo version)"
echo ""

# 清理之前的构建
if [ -d "public" ]; then
    echo "🧹 清理之前的构建..."
    rm -rf public
fi

# 构建
echo "🔨 构建中..."
hugo --minify

# 检查构建结果
if [ -d "public" ]; then
    echo ""
    echo "✅ 构建成功！"
    echo "📦 输出目录: $(pwd)/public"
    echo ""
    echo "📊 构建统计:"
    echo "  - 文件数量: $(find public -type f | wc -l)"
    echo "  - 总大小: $(du -sh public | cut -f1)"
    echo ""
    echo "🚀 准备部署到 Cloudflare Pages!"
    echo ""
else
    echo ""
    echo "❌ 构建失败！"
    exit 1
fi
