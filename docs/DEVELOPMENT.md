# zmh.life 项目开发说明

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

- `src/` - 源代码目录
- `dist/` - 构建输出目录
- `src/entries/` - 内容文件（Markdown）
- `src/assets/` - 静态资源（图片、CSS、字体）
- `postEditor/` - 内容编辑器工具

## 🏗️ 详细项目架构

### 📁 项目根目录结构

```
/Users/zhangminghua/My_Projects/zmh.life/
├── 📄 配置文件
│   ├── package.json              # 主项目依赖配置
│   ├── package-lock.json          # 依赖锁定文件
│   ├── notion-scheduler.js        # Notion数据同步调度器
│   └── switch-config.sh          # 配置切换脚本
│
├── 📚 文档文件
│   ├── README.md                 # 项目说明文档
│   ├── DEPLOYMENT.md             # 部署指南
│   ├── ENV_SETUP.md              # 环境变量配置说明
│   └── PROJECT_NOTES.md          # 项目笔记
│
├── 🏗️ 核心源码目录
│   └── src/                      # Eleventy静态网站源码
│
├── 🛠️ 工具和插件
│   ├── plugins/                  # 插件目录
│   ├── postEditor/               # 内容编辑器工具
│   └── setup-editor.sh           # 编辑器安装脚本
│
└── 🌐 部署配置
    └── public/                   # 公共部署文件
```

### 🏗️ 核心源码结构 (src/)

```
src/
├── 📄 页面模板
│   ├── index.njk                 # 首页模板
│   ├── he.njk                    # 合(Combo)页面模板
│   ├── xing.njk                  # 行(Doing)页面模板
│   ├── yi.njk                    # 一(One)页面模板
│   └── zhi.njk                   # 知(Knowing)页面模板
│
├── 📝 内容数据
│   ├── _data/
│   │   └── notion.js             # Notion API数据源
│   └── entries/                  # Markdown内容文件
│       ├── entries.11tydata.js    # 内容配置
│       ├── he/                   # 合板块内容
│       ├── xing/                  # 行板块内容
│       ├── yi/                   # 一板块内容
│       ├── zhi/                  # 知板块内容
│       └── *.md                  # 各种测试和项目文件
│
├── 🎨 静态资源
│   └── assets/
│       ├── Css/                  # 样式文件
│       │   ├── project.css       # 项目样式
│       │   ├── xing.css          # 行板块样式
│       │   ├── zhi.css           # 知板块样式
│       │   └── site.css          # 全局样式
│       ├── Fonts/                # 字体文件
│       │   └── fusion-pixel-12px-monospaced-zh_hans.otf
│       ├── Icons/                # 图标文件
│       │   ├── wechat-qr.png/svg
│       │   ├── X.svg
│       │   ├── YouTube.svg
│       │   ├── 公众号.svg
│       │   ├── 哔哩哔哩.svg
│       │   └── 微信.svg
│       └── Pics/                 # 图片资源
│           ├── Ellipse 1.png
│           ├── Frame12.png
│           ├── 首页.png
│           ├── he/               # 合板块图片
│           ├── xing/             # 行板块图片(15个文件)
│           ├── yi/               # 一板块图片
│           └── zhi/              # 知板块图片(5个文件)
│
├── 🧩 布局模板
│   └── _includes/
│       └── layouts/
│           ├── base.njk          # 基础布局
│           ├── base_backup.njk   # 基础布局备份
│           └── project.njk       # 项目布局
│
└── 📋 板块页面
    └── zhi/                      # 知板块子页面
        ├── collection.njk        # 收集页面
        ├── observation.njk       # 观察页面
        ├── reading.njk          # 阅读页面
        └── writing.njk           # 写作页面
```

### 🛠️ 内容编辑器 (postEditor/)

```
postEditor/
├── 📄 配置文件
│   ├── package.json              # 编辑器依赖配置
│   ├── package-lock.json         # 依赖锁定文件
│   └── README.md                 # 编辑器说明
│
├── 🖥️ 服务器文件
│   ├── server.js                 # Express服务器
│   └── switch-mode.js            # 模式切换
│
├── 🌐 前端文件
│   ├── public/
│   │   ├── index.html            # 编辑器页面
│   │   └── styles.css            # 编辑器样式
│   └── pics/
│       └── Rectangle 98.png      # 编辑器图片
│
├── 📝 脚本工具
│   └── scripts/
│       ├── fetch-notion-data-real.js    # Notion数据获取
│       ├── fetch-notion-data.js         # Notion数据获取(简化版)
│       └── update-notion-data.sh        # 数据更新脚本
│
├── 📊 数据文件
│   └── src/
│       └── _data/
│           ├── notion-ideas.js   # Notion想法数据
│           └── notion-questions.js # Notion问题数据
│
├── 🔧 工具文件
│   ├── font/                     # 字体文件
│   ├── uploads/                  # 上传文件目录
│   └── install-editor.sh         # 安装脚本
```

### 🔌 插件目录 (plugins/)

```
plugins/
├── 📄 配置文件
│   ├── config.json               # 插件配置
│   └── README.md                 # 插件说明
│
├── 📥 下载脚本
│   └── download-editor.sh        # 编辑器下载脚本
│
└── 📝 Toast UI编辑器
    └── toast-ui-editor/
        ├── README.md
        └── dist/
            ├── toastui-editor.css
            └── toastui-editor.js
```

### 🌐 部署配置 (public/)

```
public/
└── _redirects                    # Netlify重定向规则
```

## 🛠️ 技术栈

- **Eleventy** - 静态网站生成器
- **GitHub Pages** - 预览部署平台
- **Vercel** - 正式部署平台
- **Node.js** - 后端服务支持

## 📊 技术栈分析

### 🏗️ 主项目技术栈
- **Eleventy 3.1.2** - 静态网站生成器
- **Eleventy Image 4.0.2** - 图片处理插件
- **Eleventy RSS 2.0.4** - RSS订阅插件
- **Notion Client 5.1.0** - Notion API集成
- **Markdown-it 14.1.0** - Markdown解析器
- **Node-cron 4.2.1** - 定时任务调度

### 🛠️ 编辑器技术栈
- **Express 4.18.2** - Web服务器框架
- **Toast UI Editor 3.2.2** - 富文本编辑器
- **Multer 1.4.5** - 文件上传处理
- **Sharp 0.32.0** - 图片处理
- **Simple-git 3.19.1** - Git操作
- **CORS 2.8.5** - 跨域资源共享

## 🎯 项目特点

### ✅ 已实现功能
1. **多板块架构** - 知、行、合、一四大核心板块
2. **内容管理** - Markdown内容文件 + Notion API集成
3. **富文本编辑** - Toast UI编辑器支持
4. **图片处理** - Sharp图片优化和压缩
5. **自动化部署** - 支持GitHub Pages和Vercel
6. **定时同步** - Notion数据自动同步

### 🔄 开发工作流
1. **内容创作** - 使用postEditor进行内容编辑
2. **本地开发** - `npm run dev` 启动开发服务器
3. **构建部署** - `npm run build` 生成静态文件
4. **数据同步** - `npm run notion-sync` 同步Notion数据

### 📁 文件组织原则
- **模块化设计** - 按功能板块组织文件
- **资源分离** - 图片、样式、脚本分别管理
- **配置集中** - 所有配置文件在根目录
- **工具独立** - 编辑器作为独立工具模块

## 🔧 环境变量配置

项目使用环境变量管理敏感信息，请参考 [环境变量配置说明](./ENV_SETUP.md)。

## 📝 开发规范

### 分支命名规范
- `feature/功能名称` - 新功能开发
- `bugfix/问题描述` - 问题修复
- `hotfix/紧急修复` - 紧急修复

### 提交信息规范
- `feat: 新功能`
- `fix: 问题修复`
- `docs: 文档更新`
- `style: 代码格式调整`
- `refactor: 代码重构`
- `test: 测试相关`
- `chore: 构建过程或辅助工具的变动`

## 🔗 相关链接

- [📋 项目设计说明](./DESIGN.md)
- [🔧 环境变量配置](./ENV_SETUP.md)
- [🚀 部署指南](./DEPLOYMENT.md)
- [在线预览](https://MMing1999.github.io/zmh.life) (GitHub Pages)
- [正式网站](https://zmh.life) (Vercel)
