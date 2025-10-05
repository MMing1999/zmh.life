#!/bin/bash

echo "🚀 开始下载 Toast UI Editor..."

# 进入others目录
cd "$(dirname "$0")"

# 创建toast-ui-editor目录
mkdir -p toast-ui-editor/dist

echo "📁 创建目录结构完成"

# 方法1: 克隆完整仓库（推荐）
echo "📥 克隆完整仓库..."
if [ -d "toast-ui-editor/.git" ]; then
    echo "🔄 仓库已存在，更新中..."
    cd toast-ui-editor
    git pull origin master
    cd ..
else
    echo "📥 首次克隆仓库..."
    git clone https://github.com/nhn/tui.editor.git toast-ui-editor
fi

echo "✅ 仓库克隆完成"

# 方法2: 如果克隆失败，直接下载dist文件
if [ ! -f "toast-ui-editor/dist/toastui-editor.css" ]; then
    echo "📥 下载CSS文件..."
    curl -L -o toast-ui-editor/dist/toastui-editor.css https://uicdn.toast.com/editor/latest/toastui-editor.min.css
    
    echo "📥 下载JavaScript文件..."
    curl -L -o toast-ui-editor/dist/toastui-editor.js https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js
    
    echo "✅ 文件下载完成"
fi

# 检查文件是否存在
if [ -f "toast-ui-editor/dist/toastui-editor.css" ] && [ -f "toast-ui-editor/dist/toastui-editor.js" ]; then
    echo "🎉 Toast UI Editor 下载成功！"
    echo "📁 文件位置:"
    echo "   - CSS: toast-ui-editor/dist/toastui-editor.css"
    echo "   - JS:  toast-ui-editor/dist/toastui-editor.js"
    echo ""
    echo "🔄 现在可以运行切换脚本:"
    echo "   cd ../postEditor"
    echo "   node switch-mode.js local"
else
    echo "❌ 下载失败，请检查网络连接"
    exit 1
fi

