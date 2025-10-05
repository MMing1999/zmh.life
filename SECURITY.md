# 🔒 安全配置说明

## 环境变量管理

### ✅ 已完成的配置

1. **`.gitignore`** - 已添加环境变量忽略规则
   - `.env` - 忽略所有环境变量文件
   - `.env.*` - 忽略所有环境变量变体
   - `!.env.example` - 但保留示例文件

2. **`.env.example`** - 创建了示例环境变量文件
   - 包含所有必需的变量名
   - 不包含真实值，安全可提交

3. **`.env.local`** - 本地开发环境变量文件
   - 包含真实的API密钥和配置
   - 已被`.gitignore`忽略，不会提交到仓库

4. **Eleventy配置** - 已配置自动加载环境变量
   - 在`.eleventy.js`顶部添加了`require('dotenv').config()`
   - 自动从`.env.local`加载环境变量

5. **代码安全** - 移除了硬编码密钥
   - `src/_data/notion.js`中的API密钥已改为从环境变量读取
   - 不再有硬编码的敏感信息

## 🚀 使用方法

### 开发环境
1. 复制`.env.example`为`.env.local`
2. 在`.env.local`中填入真实的API密钥
3. 运行`npm run dev`或`npm run build`

### 生产环境
1. 在部署平台（Vercel/GitHub Actions）中设置环境变量
2. 确保`NOTION_API_KEY`等敏感信息通过环境变量传递
3. 不要将`.env.local`文件提交到仓库

## 🔍 安全检查清单

- [x] `.gitignore`包含环境变量忽略规则
- [x] `.env.example`文件存在且不包含真实密钥
- [x] `.env.local`文件存在且被忽略
- [x] 代码中无硬编码密钥
- [x] Eleventy正确加载环境变量
- [x] 构建过程正常工作

## ⚠️ 注意事项

1. **永远不要**将`.env.local`文件提交到Git
2. **永远不要**在代码中硬编码API密钥
3. **定期检查**是否有新的敏感信息被意外提交
4. **使用**`git status`检查是否有未跟踪的环境变量文件

## 🛠️ 故障排除

### 如果构建失败
1. 检查`.env.local`文件是否存在
2. 检查环境变量名称是否正确
3. 检查API密钥是否有效

### 如果API调用失败
1. 检查Notion API密钥是否正确
2. 检查数据库ID是否正确
3. 检查数据库权限设置


为服务「<服务名>」完成以下接入（不要硬编码密钥）：
1) 在 .env.example 增加示例键名：
   <SERVICE>_API_KEY=
   <SERVICE>_BASE_URL=   # 如有

2) 在 ENV_SETUP.md 中新增「<服务名> 接入说明」：
   - 本地：.env.local 如何配置
   - CI：GitHub Secrets 键名
   - 线上：Vercel Environment Variables 键名
   - 使用范围：仅服务端/构建期，前端需走 /api 代理

3) 在 /api/ 下创建 proxy（如需要），命名 api/<service>-proxy.js：
   - 读取 process.env
   - 验证必要变量存在
   - 只转发允许的字段，过滤危险参数
   - 返回统一错误格式

4) 若为构建期数据源，新增 src/_data/<service>.js：
   - 从 process.env 读取
   - 发请求拿到数据，失败抛出详细错误（含 status/text）
   - 导出 JSON 给模板使用

5) 更新 README 里的「环境变量清单」和「数据来源说明」。
