# GitHub Pages 自动部署配置

## 🎯 目标
当推送到 `dev` 分支时，自动构建并发布到 `web` 分支，GitHub Pages 以 `web` 分支为源提供预览网址。

## 📁 分支结构
- `main`: 稳定版本，用于生产环境
- `dev`: 开发分支，用于日常开发
- `web`: GitHub Pages 预览分支，自动从 `dev` 更新

## 🚀 部署方式

### 1. 自动部署（推荐）
推送到 `dev` 分支时，GitHub Actions 会自动：
1. 检出代码
2. 设置 Node.js 20 环境
3. 安装依赖 (`npm ci`)
4. 构建项目 (`npm run build`)
5. 使用 `peaceiris/actions-gh-pages` 发布到 `web` 分支
6. GitHub Pages 自动更新预览

### 2. 手动部署
```bash
# 方法1：使用npm脚本
npm run deploy:preview

# 方法2：直接运行脚本
./deploy-to-web.sh
```

## ⚙️ 配置步骤

### 1. 设置 GitHub Pages
1. 进入仓库设置 → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `web` / `/ (root)`
4. 点击 **Save** 保存设置

![GitHub Pages 设置示例](https://docs.github.com/assets/cb-11473/mw-1440/images/help/pages/select-source.webp)

### 2. 设置环境变量（必需）
**重要**：需要在 GitHub Secrets 中配置 Notion API 密钥：

1. 进入仓库设置 → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 Secrets：
   - `NOTION_API_TOKEN`: 你的 Notion API Token
   - `IDEAS_DATABASE_ID`: 想法数据库 ID
   - `QUESTIONS_DATABASE_ID`: 问题数据库 ID

![GitHub Secrets 设置示例](https://docs.github.com/assets/cb-11473/mw-1440/images/help/settings/actions-secrets-repository-list.webp)

### 3. 测试部署
```bash
# 切换到dev分支
git checkout dev

# 做一些修改
echo "测试修改" >> test.txt

# 提交并推送
git add .
git commit -m "test: 测试自动部署"
git push origin dev
```

## 🚀 Vercel 生产环境部署

### 1. 项目配置
项目已配置 `vercel.json` 文件：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 2. 环境变量配置
在 Vercel 控制台中设置环境变量：

#### Production 环境
1. 进入 Vercel 项目设置
2. 点击 **Environment Variables**
3. 添加以下变量：
   - `NOTION_API_TOKEN`: 你的 Notion API Token
   - `IDEAS_DATABASE_ID`: 想法数据库 ID
   - `QUESTIONS_DATABASE_ID`: 问题数据库 ID

#### Preview 环境
1. 在同一个 Environment Variables 页面
2. 确保 Production 和 Preview 都勾选
3. 点击 **Save** 保存配置

![Vercel 环境变量设置示例](https://vercel.com/docs/concepts/projects/environment-variables)

### 3. 部署验证
部署完成后，验证以下功能：

#### 检查构建是否成功
1. 访问 Vercel 项目 Dashboard
2. 查看最新部署状态
3. 确认构建日志无错误

#### 验证 Notion 数据获取
1. 访问网站首页
2. 检查"知 / Collection"页面是否显示 Notion 数据
3. 查看浏览器控制台是否有错误

#### 测试 API 代理
```bash
# 测试 API 代理端点
curl https://your-domain.vercel.app/api/notion-proxy?type=ideas&page_size=5

# 预期响应格式
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 5,
    "page_size": 5,
    "type": "ideas"
  }
}
```

### 4. 自定义域名配置
1. 在 Vercel 项目设置中点击 **Domains**
2. 添加你的自定义域名（如 `zmh.life`）
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动配置

---

## 🌐 访问地址
部署完成后，可通过以下地址访问：
- **GitHub Pages 预览**: https://mming1999.github.io/zmh.life/
- **Vercel 生产环境**: https://zmh.life
- **本地开发**: http://localhost:8080

## 📝 工作流程
1. 在 `dev` 分支开发
2. 推送代码到 `dev` 分支
3. GitHub Actions 自动触发 (`.github/workflows/deploy-web.yml`)
4. 构建项目并发布到 `web` 分支
5. GitHub Pages 自动更新预览

## 🔧 故障排除

### 常见问题

#### 1. GitHub Actions 失败
- 检查 Actions 日志：仓库 → Actions 标签
- 确认 Secrets 配置正确
- 验证构建脚本是否正常

#### 2. GitHub Pages 不更新
- 检查 Pages 设置：Source 是否为 `web` 分支
- 确认 `web` 分支存在且有内容
- 等待几分钟让 Pages 更新

#### 3. 构建失败
- 检查 Node.js 版本兼容性
- 确认所有依赖都已安装
- 验证环境变量是否正确传递

### 调试命令
```bash
# 本地测试构建
npm run build

# 检查环境变量
node -e "console.log(process.env.NOTION_API_TOKEN ? 'Token loaded' : 'Token missing')"

# 查看构建产物
ls -la dist/
```

## 📊 部署状态
- ✅ GitHub Actions 工作流：`.github/workflows/deploy-web.yml`
- ✅ 使用 `peaceiris/actions-gh-pages@v3`
- ✅ Node.js 20 环境
- ✅ 自动环境变量注入
- ✅ 强制孤立分支 (`force_orphan: true`)