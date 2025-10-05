# 🌐 zmh.life — 个人网站开发指南

> 快速回顾项目协作流程、常用提示词与问题排查  
> 一看就能上手，无需翻旧记录。

---

## 🔗 相关链接

- 🧱 **GitHub 仓库**：<https://github.com/MMing1999/zmh.life>  
- 🧩 **预览环境**（GitHub Pages）：<https://MMing1999.github.io/zmh.life>  
- 🚀 **正式网站**（Vercel 部署）：<https://zmh.life>

---

## 🧭 项目协作工作流

> **分支规则：**  
> `main` 为正式版本 · `dev` 为开发版本 · `web` 为预览部署分支

### 🪜 流程说明

0) 预备检查（10 秒）

git status         # 工作区是否干净？
git branch         # 当前在哪个分支？

1) 同步开发基线（基于 dev 开新分支）

git checkout dev
git fetch origin --prune
git pull --ff-only

2) 新建功能分支（把名字替换成你的功能名）

BR=feature/your-feature-slug
git checkout -b $BR
git push -u origin $BR   # 绑定远程，方便备份与协作

3) 开发 & 本地提交（小步提交，语义化信息）

（反复进行）

git add -A
git commit -m "feat(scope): 做了什么（动词开头，简洁）"
git push

4) 合并回 dev（触发 GitHub Pages 预览到 web）

git checkout dev
git pull --ff-only
git merge --no-ff $BR
git push

> **自动部署**：推送 dev 分支后，GitHub Actions 会自动：
> - 构建项目 (`npm run build`)
> - 发布到 `web` 分支
> - GitHub Pages 自动更新预览

5) 发布到正式（合并 dev → main，Vercel 自动上线）
git checkout main
git pull --ff-only
git merge --no-ff dev
git push

6) 清理分支（保持仓库干净）
git branch -d $BR
git push origin --delete $BR


---

## 💡 常用提示词（Prompts）

### 🤖 给 ChatGPT 的
1. 「帮我写一个简洁的 commit 信息，概括我刚才的修改」  
2. 「帮我检查 Eleventy 的构建配置有没有问题」  
3. 「帮我写一份适用于 Vercel 的 vercel.json 配置」  

### 💻 给 Cursor 的
1. 「优化当前文件结构，让页面加载更快」  
2. 「添加一个新的页面模板 example.html」  
3. 「调试 Eleventy 构建报错：无法找到模板变量」  

---

## 🧰 常见问题自检清单

### 1. Git 仓库问题
**问题**：`fatal: not a git repository`  
**原因**：当前路径不是 Git 仓库  
**解决方法**：检查是否在项目根目录；若无 .git，执行 `git init`

### 2. 分支不存在
**问题**：`src refspec dev does not match any`  
**原因**：本地无该分支  
**解决方法**：执行 `git checkout -b dev origin/dev` 或 `git push -u origin dev`

### 3. GitHub Pages 不更新
**问题**：GitHub Pages 不更新  
**原因**：Actions 推送失败或分支设置错误  
**解决方法**：检查 `.github/workflows/deploy-web.yml` 与 Pages 设置

### 4. Vercel 显示空白页
**问题**：Vercel 显示空白页  
**原因**：构建输出目录错误  
**解决方法**：在设置中确认 Output Directory 指向 `_site` 或 `dist`

### 5. 文件没同步
**问题**：文件没同步  
**原因**：忘记 `git add` 或分支未切换  
**解决方法**：执行 `git status` 检查当前分支与提交状态

### 6. 合并冲突
**问题**：出现 Merge Conflict  
**原因**：dev 和 main 同时修改同一文件  
**解决方法**：手动合并冲突部分 → `git add` → `git commit`

---

## 🚀 部署配置

### GitHub Pages 设置
1. 进入仓库设置 → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `web` / `/ (root)`
4. 保存设置

### GitHub Secrets 配置
需要在仓库设置中添加以下 Secrets：
- `NOTION_API_TOKEN`: Notion API Token
- `IDEAS_DATABASE_ID`: 想法数据库 ID
- `QUESTIONS_DATABASE_ID`: 问题数据库 ID

### 自动部署流程
```
dev 推送 → GitHub Actions → 构建项目 → 发布到 web 分支 → GitHub Pages 更新
main 推送 → Vercel → 构建项目 → 部署到生产环境
```

### API 代理使用
前端可以通过以下方式安全地获取 Notion 数据：

```javascript
// 获取所有数据
const response = await fetch('/api/notion-proxy?type=all&page_size=10');
const data = await response.json();

// 获取想法数据
const ideas = await fetch('/api/notion-proxy?type=ideas&page_size=5');

// 获取问题数据
const questions = await fetch('/api/notion-proxy?type=questions&page_size=5');
```

**API 参数说明：**
- `type`: 数据类型 (`all` | `ideas` | `questions`)
- `page_size`: 返回数量 (最大 50)

详细配置说明请参考：[部署配置文档](docs/DEPLOYMENT.md)

---

## 🪄 日常命令备忘

```bash
# 安装依赖
npm install

# 本地开发服务器
npm run dev

# 构建静态文件
npm run build

# 清理项目缓存
npm run clean
```

---

## 📚 项目文档

- [📋 项目设计说明](./docs/DESIGN.md) - 网站定位、架构、页面结构
- [🛠️ 项目开发说明](./docs/DEVELOPMENT.md) - 技术栈、开发规范、项目架构
- [🔧 环境变量配置](./docs/ENV_SETUP.md) - API密钥配置
- [🚀 部署指南](./docs/DEPLOYMENT.md) - 部署流程说明

---

## 📖 项目简介

**zmh.life** 是我的个人网站项目，以「知行合一」为核心理念，  
分为四大板块：

- **知 (Knowing)** — 思考与认知  
- **行 (Doing)** — 行动与项目  
- **合 (Combo)** — 价值观与方法论  
- **一 (One)** — 年度记录与人生回顾  

---

_作者：Zhang Minghua (Max Zeno)_  
_最后更新：2025年10月_
