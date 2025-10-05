#!/bin/bash

# 部署脚本：将dev分支的构建产物推送到web分支
# 使用方法：./deploy-to-web.sh

set -e

echo "🚀 开始部署到web分支..."

# 确保在项目根目录
cd "$(dirname "$0")"

# 检查当前分支
current_branch=$(git branch --show-current)
echo "📍 当前分支: $current_branch"

# 构建项目
echo "🔨 构建项目..."
npm run build

# 切换到web分支
echo "🔄 切换到web分支..."
git checkout -B web

# 删除web分支的所有文件（除了.git和.github）
echo "🧹 清理web分支文件..."
find . -maxdepth 1 -not -name '.git' -not -name '.github' -not -name '.' -exec rm -rf {} +

# 复制构建产物
echo "📦 复制构建产物..."
cp -r dist/* .

# 添加所有文件
git add .

# 检查是否有变更
if git diff --staged --quiet; then
  echo "ℹ️  没有变更需要部署"
else
  # 提交变更
  commit_message="Deploy: $(date '+%Y-%m-%d %H:%M:%S') - Auto-deploy from $current_branch"
  git commit -m "$commit_message"
  
  # 推送到web分支
  echo "📤 推送到web分支..."
  git push origin web --force
  
  echo "✅ 部署完成！"
  echo "🌐 GitHub Pages: https://mming1999.github.io/zmh.life/"
fi

# 切换回原分支
git checkout $current_branch

echo "🎉 部署流程完成！"
