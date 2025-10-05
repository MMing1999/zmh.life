#!/bin/bash

# 快速切换Decap CMS配置脚本

case "$1" in
  "local")
    echo "切换到本地开发配置..."
    cp src/admin/config.local.yml src/admin/config.yml
    echo "✅ 已切换到本地开发模式"
    echo "现在可以访问 http://localhost:8080/admin/ 使用本地后端"
    ;;
  "production")
    echo "切换到生产环境配置..."
    cp src/admin/config.yml src/admin/config.yml.backup
    # 这里需要手动更新site_url为实际域名
    echo "⚠️  请手动更新 config.yml 中的 site_url 为你的实际域名"
    echo "✅ 已切换到生产环境模式"
    ;;
  *)
    echo "用法: $0 {local|production}"
    echo ""
    echo "local      - 切换到本地开发配置"
    echo "production - 切换到生产环境配置"
    ;;
esac
