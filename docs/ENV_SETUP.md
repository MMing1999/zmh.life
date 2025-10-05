# 🔧 环境变量配置指南

## 📋 必需的环境变量

### Notion API 配置
- `NOTION_API_TOKEN`: Notion API Token
- `IDEAS_DATABASE_ID`: 想法数据库ID  
- `QUESTIONS_DATABASE_ID`: 问题数据库ID

## 🏠 本地开发环境

### 1. 创建环境变量文件
```bash
# 复制示例文件
cp .env.example .env.local

# 编辑文件，填入真实值
nano .env.local
```

### 2. 获取 Notion API Token
1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "New integration"
3. 填写名称和选择工作区
4. 复制生成的 API Token（以 `ntn_` 开头）

### 3. 获取数据库 ID
1. 打开 Notion 数据库页面
2. 从 URL 中提取数据库 ID
   - URL 格式：`https://notion.so/your-workspace/DATABASE_ID?v=...`
   - 数据库 ID 是 32 位十六进制字符串

### 4. 配置数据库权限
1. 在 Notion 数据库中点击右上角 "Share"
2. 点击 "Invite" 并选择你创建的 Integration
3. 确保 Integration 有 "Read" 权限

### 5. 测试配置
```bash
# 启动开发服务器
npm run dev

# 或构建项目
npm run build
```

## ☁️ CI/CD 环境

### GitHub Actions
在仓库设置中配置 Secrets：
1. 进入仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Repository secrets：
   - `NOTION_API_TOKEN`: 你的 Notion API Token
   - `IDEAS_DATABASE_ID`: 想法数据库 ID
   - `QUESTIONS_DATABASE_ID`: 问题数据库 ID

### Vercel 部署
1. 进入 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：
   - `NOTION_API_TOKEN`: 你的 Notion API Token
   - `IDEAS_DATABASE_ID`: 想法数据库 ID
   - `QUESTIONS_DATABASE_ID`: 问题数据库 ID

## 🔍 故障排除

### 常见错误

#### 1. API Token 无效 (401 Unauthorized)
```
Notion API error: 401 Unauthorized
Response: {"object":"error","status":401,"code":"unauthorized","message":"API token is invalid."}
```
**解决方案：**
- 检查 API Token 是否正确复制
- 确认 Token 以 `ntn_` 开头
- 验证 Token 是否已过期

#### 2. 数据库 ID 无效 (404 Not Found)
```
Notion API error: 404 Not Found
Response: {"object":"error","status":404,"code":"object_not_found","message":"Could not find database with ID: xxx"}
```
**解决方案：**
- 检查数据库 ID 是否正确
- 确认数据库 URL 中的 ID 部分
- 验证数据库是否存在于正确的工作区

#### 3. 权限不足 (403 Forbidden)
```
Notion API error: 403 Forbidden
Response: {"object":"error","status":403,"code":"restricted_resource","message":"The integration does not have access to the requested resource."}
```
**解决方案：**
- 在 Notion 数据库中邀请 Integration
- 确保 Integration 有 "Read" 权限
- 检查数据库是否在正确的工作区

### 调试技巧

#### 1. 检查环境变量
```bash
# 检查环境变量是否正确加载
node -e "console.log(process.env.NOTION_API_TOKEN ? 'Token loaded' : 'Token missing')"
```

#### 2. 测试 API 连接
```bash
# 使用 curl 测试 API
curl -X POST 'https://api.notion.com/v1/databases/YOUR_DATABASE_ID/query' \
  -H 'Authorization: Bearer <REDACTED>' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
  -d '{}'
```

#### 3. 查看详细日志
```bash
# 构建时查看详细日志
npm run build 2>&1 | grep -E "(API|Token|Error)"
```

## 📝 环境变量模板

### .env.local (本地开发)
```bash
# Notion API 配置
NOTION_API_TOKEN=ntn_your_actual_token_here
IDEAS_DATABASE_ID=your_actual_ideas_database_id
QUESTIONS_DATABASE_ID=your_actual_questions_database_id

# 其他配置
NODE_ENV=development
PORT=8080
```

### GitHub Actions Secrets
```
NOTION_API_TOKEN: ntn_your_actual_token_here
IDEAS_DATABASE_ID: your_actual_ideas_database_id  
QUESTIONS_DATABASE_ID: your_actual_questions_database_id
```

### Vercel Environment Variables
```
NOTION_API_TOKEN: ntn_your_actual_token_here
IDEAS_DATABASE_ID: your_actual_ideas_database_id
QUESTIONS_DATABASE_ID: your_actual_questions_database_id
```

## ⚠️ 安全注意事项

1. **永远不要**将 `.env.local` 文件提交到 Git
2. **永远不要**在代码中硬编码 API Token
3. **定期轮换** API Token
4. **限制权限**：只给 Integration 必要的权限
5. **监控使用**：定期检查 API 使用情况