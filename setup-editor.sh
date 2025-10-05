#!/bin/bash

echo "🚀 设置 Toast UI Editor 本地/远程切换环境"
echo ""

# 检查是否在正确的目录
if [ ! -d "postEditor" ]; then
    echo "❌ 请在 Mywebsite 项目根目录运行此脚本"
    exit 1
fi

echo "📁 创建目录结构..."
mkdir -p plugins/toast-ui-editor/dist

echo "📥 下载 Toast UI Editor..."
cd plugins
chmod +x download-editor.sh
./download-editor.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🔄 切换到本地模式..."
    cd ../postEditor
    node switch-mode.js local
    
    echo ""
    echo "🎉 设置完成！"
    echo ""
    echo "📋 使用说明:"
    echo "  启动服务器: npm start"
    echo "  切换模式:   node switch-mode.js [local|remote|status]"
    echo "  查看状态:   node switch-mode.js status"
    echo ""
    echo "🌐 访问地址: http://localhost:3000"
else
    echo "❌ 下载失败，请检查网络连接"
    exit 1
fi

