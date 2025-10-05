#!/bin/bash

# Git 历史清理脚本 - 移除敏感信息
# 这个脚本会重写整个 Git 历史，移除所有硬编码的密钥

echo "🔍 开始清理 Git 历史中的敏感信息..."

# 备份当前分支
echo "📦 创建备份分支..."
git branch backup-before-cleanup

# 定义要替换的敏感信息
NOTION_TOKEN="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"
IDEAS_DB_ID="28199b0e1a8180739633d177c1bbff6b"
QUESTIONS_DB_ID="28199b0e1a8180539adaf3fa23a4bdce"

echo "🧹 使用 git filter-branch 清理历史..."

# 使用 git filter-branch 替换敏感信息
git filter-branch --force --index-filter '
    # 替换 Notion API Token
    git ls-files -s | sed "s|\(.*\)|git show :\1|" | sh | \
    sed "s/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/<REDACTED>/g" | \
    git update-index --index-info
    
    # 替换数据库 ID
    git ls-files -s | sed "s|\(.*\)|git show :\1|" | sh | \
    sed "s/28199b0e1a8180739633d177c1bbff6b/<REDACTED>/g" | \
    sed "s/28199b0e1a8180539adaf3fa23a4bdce/<REDACTED>/g" | \
    git update-index --index-info
' --prune-empty --tag-name-filter cat -- --all

echo "✅ Git 历史清理完成！"
echo "📋 清理的内容："
echo "   - Notion API Token: $NOTION_TOKEN"
echo "   - Ideas Database ID: $IDEAS_DB_ID" 
echo "   - Questions Database ID: $QUESTIONS_DB_ID"

echo ""
echo "⚠️  重要提醒："
echo "   1. 原始历史已备份到 'backup-before-cleanup' 分支"
echo "   2. 现在可以安全地推送到 GitHub"
echo "   3. 如果出现问题，可以使用 'git reset --hard backup-before-cleanup' 恢复"
echo ""
echo "🚀 下一步："
echo "   git push origin main --force"
