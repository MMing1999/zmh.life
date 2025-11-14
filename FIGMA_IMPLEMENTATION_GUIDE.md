# Figma 生命阶段图实现指南

## 概述

已成功将 Figma 设计（node-id: 859:27711）集成到生命阶段图组件中。实现了基于 Figma 设计规范的动态渲染系统。

## 实现方案

### 1. 设计规范提取 ✅

从 Figma 提取了以下设计规范：

- **字体**: `Fusion_Pixel_12px_Monospaced_zh_hans` (使用 `monospace` 作为替代)
- **尺寸**: 
  - 标题: 16px
  - 年份/年龄/事件: 12px
- **颜色**:
  - 黑色: `#000000`
  - 红色（"现在"标记）: `#c41616`
  - 灰色（编辑提示）: `#acacac`
- **布局**:
  - 时间点宽度: 72px
  - 时间轴 Y 位置: 122px
  - 生命阶段标签 Y 位置: 40px
  - 垂直间距: 6px

### 2. SVG 资源 ✅

已下载 Figma 中的 SVG 资源到：
- `src/assets/images/life-stage/line-vertical.svg`
- `src/assets/images/life-stage/arrow-horizontal.svg`
- `src/assets/images/life-stage/line-event.svg`

> **注意**: 当前使用 Canvas 绘制，SVG 资源已保存但未直接使用。如需使用 SVG，可考虑切换到 HTML/CSS 渲染方案。

### 3. 代码实现 ✅

#### 主要改进

1. **设计规范集成**
   - 在 `LifeStageRenderer` 类中添加了 `design` 配置对象
   - 所有尺寸、颜色、字体都基于 Figma 设计规范

2. **布局优化**
   - 时间点间距从 100px 调整为 72px（匹配 Figma）
   - 时间轴位置调整为 122px
   - 添加了生命阶段标签显示（顶部 40px）

3. **事件显示**
   - 支持显示多个事件
   - 第一个事件可标注"（重大事件）"
   - 兼容现有数据格式：`{ age: 0, year: 1995, events: ["诞生"] }`

4. **编辑模式**
   - 无事件时显示 "+" 号（灰色）
   - 显示提示文字："编辑时，就显示一个加号"

5. **"现在"标记**
   - 红色竖线，贯穿整个画布
   - 文字旋转 90 度显示

## 数据格式

### 重大事件数据格式

```javascript
majorEvents: [
  {
    age: 0,           // 年龄（必需）
    year: 1995,       // 年份（可选）
    events: ["诞生"]  // 事件列表（必需）
  },
  {
    age: 5,
    year: 2000,
    events: ["上学", "第一次考试"],
    isMajor: true     // 可选：标记为重大事件
  }
]
```

## 使用方法

### 基本使用

生命阶段图会自动根据以下数据渲染：

1. **出生日期** (`birthDate`)
2. **当前日期** (自动使用 `new Date()`)
3. **重大事件** (`majorEvents`)
4. **编辑模式** (`isEditMode`)

### 编辑模式

在编辑模式下：
- 没有事件的时间点会显示 "+" 号
- 提示用户可以添加事件

### 自定义设计

如需调整设计，修改 `LifeStageRenderer` 类中的 `design` 对象：

```javascript
this.design = {
  yearWidth: 72,        // 时间点宽度
  timelineY: 122,       // 时间轴 Y 位置
  stageLabelY: 40,     // 生命阶段标签 Y 位置
  dotSize: 10,         // 黑色小方块尺寸
  gap: 6,              // 垂直间距
  fontSize: { ... },   // 字体大小
  colors: { ... },     // 颜色配置
  fontFamily: 'monospace' // 字体
};
```

## 下一步优化建议

### 1. 字体支持
- 如果项目中有 `Fusion_Pixel_12px_Monospaced_zh_hans` 字体，可以替换 `monospace`
- 或者使用 Web Font 加载该字体

### 2. SVG 集成
- 考虑使用 HTML/CSS + SVG 渲染，直接使用下载的 SVG 资源
- 或者将 SVG 转换为 Canvas 绘制代码

### 3. 交互功能
- 点击时间点添加/编辑事件
- 拖拽调整事件顺序
- 删除事件功能

### 4. 响应式设计
- 根据屏幕宽度调整时间点间距
- 移动端优化显示

### 5. 性能优化
- 大量时间点时使用虚拟滚动
- Canvas 渲染优化

## 文件清单

- ✅ `src/assets/js/life-countdown.js` - 主逻辑文件（已更新）
- ✅ `src/assets/images/life-stage/` - SVG 资源目录
- ✅ `FIGMA_DESIGN_SPEC.md` - 设计规范文档
- ✅ `FIGMA_IMPLEMENTATION_GUIDE.md` - 本文件

## 测试建议

1. **基本渲染测试**
   - 检查时间轴是否正确显示
   - 检查年份和年龄是否正确
   - 检查"现在"标记位置是否正确

2. **事件显示测试**
   - 测试单个事件显示
   - 测试多个事件显示
   - 测试"（重大事件）"标注

3. **编辑模式测试**
   - 切换到编辑模式
   - 检查 "+" 号是否显示
   - 检查提示文字是否正确

4. **数据兼容性测试**
   - 测试空数据
   - 测试不同格式的事件数据
   - 测试大量时间点

## 总结

✅ **已完成**:
- Figma 设计规范提取
- SVG 资源下载
- 基于 Figma 设计的渲染器实现
- 动态数据绑定
- 编辑模式支持

⏳ **待优化**:
- 字体替换（如果可用）
- SVG 直接使用（可选）
- 交互功能增强
- 响应式优化

现在生命阶段图已经基于 Figma 设计实现，可以根据用户数据动态生成，并支持编辑模式！




