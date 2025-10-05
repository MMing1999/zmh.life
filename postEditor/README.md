# ZMH Portfolio Editor - Web Version

一个简单易用的本地网页版项目管理工具，用于管理zmh.life项目内容。

## 🚀 快速开始

### 1. 安装依赖
```bash
cd /Users/zhangminghua/My_Projects/Mywebsite/postEditor
npm install
```

### 2. 启动服务
```bash
npm start
```

### 3. 访问应用
打开浏览器访问: http://localhost:3000

## ✨ 功能特性

### 📝 创建项目
- 选择项目类型（zhi/xing/he/yi）
- 填写项目标题和简介
- 自动生成markdown文件和frontmatter
- 智能保存到对应目录

### 🖼️ 图片上传
- 拖拽或点击上传图片
- 自动压缩和格式转换
- 智能保存到对应Section目录
- 生成Eleventy短代码和Markdown代码

### 📋 项目管理
- 查看所有项目列表
- 按日期排序显示
- 一键删除项目
- 显示项目详细信息

### 🚀 部署发布
- 一键提交所有更改
- 自动推送到GitHub
- 支持main/master分支
- 实时部署状态显示

## 🎯 使用流程

1. **启动应用**: `npm start`
2. **创建项目**: 选择类型 → 填写信息 → 创建
3. **上传图片**: 选择类型 → 上传图片 → 获取代码
4. **管理项目**: 查看列表 → 编辑或删除
5. **部署发布**: 一键推送到GitHub

## 📁 目录结构

```
postEditor/
├── server.js              # 后端服务器
├── package.json           # 项目配置
├── public/
│   └── index.html         # 前端页面
└── uploads/               # 临时上传目录
```

## 🔧 配置说明

- **项目路径**: `/Users/zhangminghua/My_Projects/Mywebsite/website`
- **端口**: 3000
- **图片处理**: 自动压缩为JPEG格式，质量85%
- **文件命名**: 基于项目标题生成slug

## 🎨 界面特色

- 现代化渐变背景设计
- 响应式布局适配
- 直观的标签页导航
- 美观的卡片式选择界面
- 实时状态反馈

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **前端**: 原生HTML/CSS/JavaScript
- **图片处理**: Sharp
- **Git操作**: simple-git
- **文件操作**: fs-extra

## 📝 注意事项

1. 确保website目录是Git仓库
2. 图片会自动压缩，原始文件会被删除
3. 项目文件会自动保存到对应的Section目录
4. 部署功能需要GitHub仓库权限

## 🚀 开发模式

```bash
npm run dev  # 使用nodemon自动重启
```

---

**享受简单高效的项目管理体验！** 🎉

