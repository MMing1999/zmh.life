# 摄影观察类文章布局模板

## 概述

`observation.njk` 是专门为摄影观察类文章设计的布局模板，在编辑器中显示为"摄影"选项。

## 模板特性

- **封面图片**：竖向 4:3 比例，适合摄影作品展示
- **编辑器名称**：摄影
- **模板文件**：`layouts/observation.njk`
- **样式文件**：`assets/Css/observation.css`

## 必需字段

### 基础信息
- `title`: 文章标题
- `date`: 发布日期
- `type: "observation"`: 文章类型
- `section: "zhi"`: 所属板块
- `collection: "zhi-observation"`: 集合标签

### 内容字段
- `coverImage`: 封面图片路径（竖向 4:3 比例）
- `summary`: 文章简介
- `field`: 摄影领域（如：城市摄影、人像摄影等）
- `tags`: 标签数组
- `categories`: 分类数组

### 样式字段
- `pageCSS: "/assets/Css/observation.css"`: 指定样式文件

## 可选字段

### 拍摄信息
- `location`: 拍摄地点
- `equipment`: 设备列表（数组或字符串）
- `technique`: 拍摄技法
- `inspiration`: 创作灵感

## 示例 Front Matter

```yaml
---
title: "城市观察 - 001"
date: 2024-12-06
tags: ["observation", "城市", "摄影"]
collection: "zhi-observation"
type: "observation"
section: "zhi"
coverImage: "src/assets/Pics/zhi-observation/城市观察-001-cover.jpg"
summary: "记录着我在城市中的所见所闻，用镜头捕捉生活的瞬间。"
field: "城市摄影"
categories: ["observation", "photography"]
location: "上海市中心"
equipment: ["iPhone 15 Pro", "Sony A7R4"]
technique: "街头摄影"
inspiration: "城市是一个巨大的有机体，每天都在发生着变化。"
pageCSS: "/assets/Css/observation.css"
---
```

## 布局结构

1. **封面图片**：竖向 4:3 比例
2. **标题**：文章标题
3. **简介**：文章摘要
4. **元信息**：
   - 发布时间
   - 领域
   - 标签
   - 分类
5. **可选信息**：
   - 拍摄地点
   - 设备
   - 拍摄技法
   - 创作灵感
6. **正文内容**：Markdown 渲染
7. **返回链接**：返回观察列表页

## 编辑器使用

在编辑器中：
1. 选择"摄影"布局
2. 填写必需字段
3. 根据需要填写可选字段
4. 上传竖向 4:3 比例的封面图片
5. 编写正文内容

## 样式特点

- 封面图片采用竖向 4:3 比例，突出摄影作品
- 元信息采用网格布局，信息清晰
- 响应式设计，适配各种设备
- 与项目布局保持一致的视觉风格
