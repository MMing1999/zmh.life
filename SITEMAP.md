# zmh.life 网站地图 (Sitemap)

## 🏠 网站概览
**zmh.life** 是一个个人品牌网站，按照"知行合一"的理念构建，分为四大核心板块。

---

## 📊 网站结构图

```
zmh.life
├── 🏠 首页 (Home)
│   ├── / (根目录)
│   └── /@home/thanks/ (致谢页面)
│
├── 📚 知 (Knowing) - 知识认知与思考
│   ├── /zhi/ (总览页)
│   ├── /zhi/collection/ (收集 - 灵感碎片)
│   ├── /zhi/observation/ (观察 - 摄影作品)
│   │   ├── /zhi/observation/光影之路-008/
│   │   ├── /zhi/observation/城市观察-001/
│   │   ├── /zhi/observation/抽象构成-010/
│   │   ├── /zhi/observation/掌中世界-007/
│   │   ├── /zhi/observation/生活记录-002/
│   │   ├── /zhi/observation/瞬间捕捉-006/
│   │   ├── /zhi/observation/纹理之美-009/
│   │   ├── /zhi/observation/自然观察-003/
│   │   ├── /zhi/observation/色彩律动-005/
│   │   └── /zhi/observation/都市掠影-004/
│   ├── /zhi/writing/ (写作 - 技术分享)
│   │   ├── /zhi/writing/abstract-design/
│   │   ├── /zhi/writing/city-observation/
│   │   ├── /zhi/writing/color-rhythm-frontend/
│   │   ├── /zhi/writing/light-shadow-photography/
│   │   ├── /zhi/writing/urban-snapshot/
│   │   └── /zhi/writing/新建测试/
│   └── /zhi/reading/ (阅读 - 学习笔记)
│       ├── /zhi/reading/design-psychology/
│       ├── /zhi/reading/innovators-dilemma/
│       ├── /zhi/reading/javascript-advanced/
│       ├── /zhi/reading/lean-startup/
│       ├── /zhi/reading/thinking-fast-and-slow/
│       └── /zhi/reading/user-experience-elements/
│
├── 🚀 行 (Doing) - 行动创造与项目
│   ├── /xing/ (总览页)
│   ├── /xing/t-project/ (项目1)
│   ├── /xing/t-project-2/ (项目2)
│   ├── /xing/test2/ (测试项目)
│   ├── /xing/图片测试2/ (图片测试)
│   ├── /xing/图片测试3/ (图片测试)
│   ├── /xing/图片测试4/ (图片测试)
│   ├── /xing/大大大大大大/ (测试项目)
│   ├── /xing/屁股大大大/ (测试项目)
│   ├── /xing/屁股屁股/ (测试项目)
│   ├── /xing/按钮按钮/ (测试项目)
│   └── /xing/擦擦是擦拭擦擦擦/ (测试项目)
│
├── 🤝 合 (Combo) - 自我陈述与原则
│   └── /he/ (个人介绍页面)
│
├── 🎬 一 (One) - 年度记录与人生回顾
│   └── /yi/ (年度视频展示)
│
├── 📄 其他页面
│   ├── /404.html (404错误页面)
│   └── /misc/introduction-to-algorithms/ (算法导论)
│
└── 🎨 静态资源
    ├── /assets/Css/ (样式文件)
    ├── /assets/Fonts/ (字体文件)
    ├── /assets/Icons/ (图标文件)
    ├── /assets/images/ (图片资源)
    └── /assets/Pics/ (图片资源)
```

---

## 🗺️ 详细页面说明

### 🏠 首页 (Home)
- **URL**: `/`
- **功能**: 网站入口，提供四大板块导航
- **内容**: 简洁的欢迎页面，引导用户进入各个板块

### 📚 知 (Knowing) - 知识认知板块
- **总览页**: `/zhi/`
  - 展示四个子模块：收集、观察、写作、阅读
  - 动态显示最新文章和分类内容

- **收集 (Collection)**: `/zhi/collection/`
  - 灵感收集与问题记录
  - 瀑布流卡片布局

- **观察 (Observation)**: `/zhi/observation/`
  - 摄影作品展示
  - 左右布局：文字标题 + 封面图片网格
  - 包含10个摄影作品详情页

- **写作 (Writing)**: `/zhi/writing/`
  - 技术文章和个人反思
  - 文章列表和详情页
  - 包含6篇技术文章

- **阅读 (Reading)**: `/zhi/reading/`
  - 读书笔记与思考启发
  - 书籍封面卡片展示
  - 包含6篇阅读笔记

### 🚀 行 (Doing) - 行动创造板块
- **总览页**: `/xing/`
  - 项目作品集展示
  - 分类筛选：设计、艺术、开发、产品、创业
  - 搜索功能
  - 包含12个测试项目

### 🤝 合 (Combo) - 自我陈述板块
- **个人介绍**: `/he/`
  - 个人宣言和自我介绍
  - 履历与能力展示
  - 性格特点和人生原则
  - 联系方式和合作信息

### 🎬 一 (One) - 年度记录板块
- **年度视频**: `/yi/`
  - 年度视频作品展示
  - 支持B站视频嵌入
  - 滚动切换不同年份视频
  - 包含2021-2025年视频

### 📄 特殊页面
- **404页面**: `/404.html`
  - 友好的错误提示页面
  - 提供导航选项和推荐内容

- **致谢页面**: `/@home/thanks/`
  - 感谢页面

---

## 🎨 技术架构

### 构建工具
- **Eleventy (11ty)**: 静态网站生成器
- **Nunjucks**: 模板引擎
- **Markdown**: 内容编写

### 页面布局
- **base.njk**: 基础布局模板
- **observation.njk**: 观察页面专用布局
- **reading.njk**: 阅读页面专用布局
- **writing.njk**: 写作页面专用布局
- **project.njk**: 项目页面布局
- **yi.njk**: 年度视频页面布局

### 样式系统
- **模块化CSS**: 每个板块独立的样式文件
- **响应式设计**: 适配移动端和桌面端
- **自定义字体**: fusion-pixel-12px-monospaced-zh_hans.otf

### 内容管理
- **Markdown文件**: 内容存储在 `src/entries/` 目录
- **自动路由**: 基于文件结构自动生成URL
- **分类系统**: 支持标签和分类筛选

---

## 📊 内容统计

### 文章数量
- **观察文章**: 10篇
- **写作文章**: 6篇  
- **阅读笔记**: 6篇
- **项目展示**: 12个

### 资源文件
- **图片资源**: 100+ 张
- **样式文件**: 9个
- **图标文件**: 13个
- **字体文件**: 1个

---

## 🌐 访问地址

### 本地开发
- **主服务器**: `http://localhost:8082`
- **404页面**: `http://localhost:8082/404.html`

### 主要页面链接
- 首页: `http://localhost:8082/`
- 知: `http://localhost:8082/zhi/`
- 行: `http://localhost:8082/xing/`
- 合: `http://localhost:8082/he/`
- 一: `http://localhost:8082/yi/`

---

## 📝 更新日志

### 最新更新
- ✅ 创建404错误页面
- ✅ 优化服务器配置
- ✅ 整理项目结构

### 待完善功能
- 🔄 完善内容管理系统
- 🔄 优化移动端体验
- 🔄 添加搜索功能
- 🔄 集成Notion API

---

*最后更新: 2025年1月*
