# Plugins - 第三方依赖库

这个目录用于存放项目中使用的第三方库的本地版本。

## 目录结构

```
plugins/
├── toast-ui-editor/          # Toast UI Editor 本地版本
│   ├── css/                  # CSS 文件
│   ├── js/                   # JavaScript 文件
│   ├── dist/                 # 完整的dist目录
│   └── README.md             # 使用说明
├── README.md                 # 本文件
└── config.json               # 配置文件
```

## Toast UI Editor 信息

- **GitHub仓库**: https://github.com/nhn/tui.editor.git
- **最新版本**: 3.2.2 (Feb 24, 2023)
- **许可证**: MIT
- **功能**: Markdown WYSIWYG Editor, GFM Standard + Chart & UML Extensible

## 使用方式

### 本地模式
- 引用 `plugins/toast-ui-editor/dist/` 中的文件
- 完全离线工作

### 线上模式  
- 引用 GitHub 仓库中的文件
- 需要网络连接

## 切换方式

通过修改 `postEditor/public/index.html` 中的引用路径：

```html
<!-- 本地模式 -->
<link rel="stylesheet" href="/plugins/toast-ui-editor/dist/toastui-editor.css" />
<script src="/plugins/toast-ui-editor/dist/toastui-editor.js"></script>

<!-- 线上模式 -->
<link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" />
<script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
```

## 下载命令

```bash
# 克隆完整仓库
git clone https://github.com/nhn/tui.editor.git toast-ui-editor

# 或者只下载dist文件
curl -o toast-ui-editor/dist/toastui-editor.css https://uicdn.toast.com/editor/latest/toastui-editor.min.css
curl -o toast-ui-editor/dist/toastui-editor.js https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js
```

