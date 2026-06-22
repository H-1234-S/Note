## 1. 简介与安装

### 1.1 什么是 Tailwind CSS

Tailwind CSS 是一个功能性（utility-first）CSS 框架，它提供了一系列底层 CSS 类名，让你可以直接在 HTML 中组合构建自定义设计，而无需编写自定义 CSS。

**特点：**

- **utility-first**：通过组合小型工具类来构建复杂界面
- **原子化**：每个类名只做一件事
- **响应式**：内置断点系统
- **状态变体**：支持 hover、focus 等状态
- **JIT 编译器**：按需生成 CSS
- **Oxide 引擎**（v4）：Rust 编写的全新构建引擎，性能提升高达 100x

### 1.2 安装方式（v4 推荐）

**Vite 项目（推荐）：**

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss()],
}
```

```css
/* src/index.css */
@import "tailwindcss";
```

**传统项目：**

```bash
npm install -D tailwindcss
```

```css
/* src/index.css */
@import "tailwindcss";
```

### 1.3 安装方式（v3 传统方式）

```html
<!-- CDN 引入（仅用于开发） -->
<script src="https://cdn.tailwindcss.com"></script>
```

```bash
# 通过 npm 安装
npm install -D tailwindcss postcss autoprefixer

# 初始化配置文件
npx tailwindcss init -p
```

### 1.4 基础配置（v3 版本）

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.5 v4 新配置方式（CSS-first）

v4 移除了 `tailwind.config.js`，改用 CSS 配置：

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* 自定义颜色 */
  --color-primary: #1da1f2;
  --color-secondary: #f7f9fa;

  /* 自定义间距 */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  /* 自定义字体 */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;

  /* 自定义动画 */
  --animate-spin-slow: spin 3s linear infinite;
}
```

### 1.6 v4 新增指令

| 指令 | 作用 |
|------|------|
| `@import "tailwindcss"` | 引入 Tailwind（替代旧的 @tailwind 指令） |
| `@theme { }` | 定义自定义主题变量 |
| `@utility` | 定义自定义工具类 |
| `@source` | 显式指定内容源路径 |

---

## 2. 核心概念

### 2.1 工具类（Utility Classes）

每个类名都是一个小功能，如：
- `p-4` = `padding: 1rem;`
- `text-center` = `text-align: center;`
- `bg-blue-500` = `background-color: #3b82f6;`

### 2.2 预设设计系统

Tailwind 内置了一套精心设计的设计系统：

| 概念 | 说明 |
|------|------|
| **颜色** | 50-900 的色阶，如 `blue-500` |
| **间距** | 0-96 的数字，如 `px-4`、`mt-2` |
| **字体** | 10-900 的字重，如 `font-bold` |
| **圆角** | `rounded`、`rounded-lg`、`rounded-full` |

### 2.3 响应式变体

使用前缀：`sm:`、`md:`、`lg:`、`xl:`、`2xl:`

### 2.4 状态变体

如 `hover:`、`focus:`、`active:` 等

---

## 3. 基础语法

### 3.1 类名结构

```
[属性缩写]-[值]
```

| 前缀 | 作用 |
|------|------|
| `p` | padding |
| `m` | margin |
| `w` | width |
| `h` | height |
| `bg` | background |
| `text` | 文字 |
| `flex` | 弹性盒 |

### 3.2 快捷前缀

| 前缀 | 等同于 | 示例 |
|------|--------|------|
| `t` | top | `mt` = margin-top |
| `b` | bottom | `mb` = margin-bottom |
| `l` | left | `ml` = margin-left |
| `r` | right | `mr` = margin-right |
| `x` | horizontal (left+right) | `mx-auto` |
| `y` | vertical (top+bottom) | `py-4` |

---

## 4. 常用类名详解

### 4.1 间距（Spacing）

#### 4.1.1 外边距 (Margin)

| 类名 | 作用 |
|------|------|
| `m-0` | margin: 0 |
| `m-1` | margin: 0.25rem (4px) |
| `m-2` | margin: 0.5rem (8px) |
| `m-4` | margin: 1rem (16px) |
| `m-auto` | margin: auto |
| `mx-auto` | 水平居中（margin-left: auto; margin-right: auto） |
| `my-auto` | 垂直居中 |
| `-m-2` | 负外边距（margin: -0.5rem） |
| `mt-4` | margin-top: 1rem |
| `mr-2` | margin-right: 0.5rem |
| `mb-4` | margin-bottom: 1rem |
| `ml-2` | margin-left: 0.5rem |

**空格数值对照：**
- `0` = 0px
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `5` = 20px
- `6` = 24px
- `8` = 32px
- `10` = 40px
- `12` = 48px
- `16` = 64px
- `20` = 80px
- `24` = 96px

#### 4.1.2 内边距 (Padding)

| 类名 | 作用 |
|------|------|
| `p-0` | padding: 0 |
| `p-1` | padding: 0.25rem |
| `p-2` | padding: 0.5rem |
| `p-4` | padding: 1rem |
| `px-4` | padding-left + padding-right: 1rem |
| `py-2` | padding-top + padding-bottom: 0.5rem |
| `pt-4` | padding-top: 1rem |
| `pr-2` | padding-right: 0.5rem |
| `pb-4` | padding-bottom: 1rem |
| `pl-2` | padding-left: 0.5rem |

---

### 4.2 盒模型 (Box Model)

| 类名 | 作用 |
|------|------|
| `box-border` | box-sizing: border-box |
| `box-content` | box-sizing: content-box |
| `block` | display: block |
| `inline-block` | display: inline-block |
| `inline` | display: inline |
| `hidden` | display: none |
| `overflow-auto` | overflow: auto |
| `overflow-hidden` | overflow: hidden |
| `overflow-scroll` | overflow: scroll |
| `overflow-visible` | overflow: visible |

---

### 4.3 尺寸 (Sizing)

#### 4.3.1 宽度 (Width)

| 类名 | 作用 |
|------|------|
| `w-0` | width: 0 |
| `w-1` | width: 0.25rem |
| `w-2` | width: 0.5rem |
| `w-4` | width: 1rem |
| `w-8` | width: 2rem |
| `w-12` | width: 3rem |
| `w-16` | width: 4rem |
| `w-20` | width: 5rem |
| `w-24` | width: 6rem |
| `w-32` | width: 8rem |
| `w-40` | width: 10rem |
| `w-48` | width: 12rem |
| `w-64` | width: 16rem |
| `w-auto` | width: auto |
| `w-px` | width: 1px |
| `w-0.5` | width: 0.125rem |
| `w-full` | width: 100% |
| `w-screen` | width: 100vw |
| `w-min` | width: min-content |
| `w-max` | width: max-content |
| `w-fit` | width: fit-content |

#### 4.3.2 高度 (Height)

| 类名 | 作用 |
|------|------|
| `h-0` | height: 0 |
| `h-1` | height: 0.25rem |
| `h-4` | height: 1rem |
| `h-8` | height: 2rem |
| `h-16` | height: 4rem |
| `h-32` | height: 8rem |
| `h-auto` | height: auto |
| `h-px` | height: 1px |
| `h-full` | height: 100% |
| `h-screen` | height: 100vh |
| `h-min` | height: min-content |
| `h-max` | height: max-content |

#### 4.3.3 最小/最大尺寸

| 类名 | 作用 |
|------|------|
| `min-w-0` | min-width: 0 |
| `min-w-full` | min-width: 100% |
| `min-w-min` | min-width: min-content |
| `min-w-max` | min-width: max-content |
| `max-w-xs` | max-width: 20rem |
| `max-w-sm` | max-width: 24rem |
| `max-w-md` | max-width: 28rem |
| `max-w-lg` | max-width: 32rem |
| `max-w-xl` | max-width: 36rem |
| `max-w-2xl` | max-width: 42rem |
| `max-w-full` | max-width: 100% |
| `max-w-screen-sm` | max-width: 640px |
| `max-w-screen-md` | max-width: 768px |
| `max-w-screen-lg` | max-width: 1024px |
| `min-h-0` | min-height: 0 |
| `min-h-full` | min-height: 100% |
| `min-h-screen` | min-height: 100vh |

---

### 4.4 颜色 (Colors)

#### 4.4.1 文字颜色 (Text Color)

| 类名 | 作用 |
|------|------|
| `text-transparent` | color: transparent |
| `text-current` | color: currentColor |
| `text-black` | color: #000 |
| `text-white` | color: #fff |
| `text-gray-50` | color: #f9fafb |
| `text-gray-100` | color: #f3f4f6 |
| `text-gray-200` | color: #e5e7eb |
| `text-gray-300` | color: #d1d5db |
| `text-gray-400` | color: #9ca3af |
| `text-gray-500` | color: #6b7280 |
| `text-gray-600` | color: #4b5563 |
| `text-gray-700` | color: #374151 |
| `text-gray-800` | color: #1f2937 |
| `text-gray-900` | color: #111827 |

**其他色系：** `red`、`orange`、`amber`、`yellow`、`lime`、`green`、`emerald`、`teal`、`cyan`、`sky`、`blue`、`indigo`、`violet`、`purple`、`fuchsia`、`pink`、`rose`

#### 4.4.2 背景颜色 (Background Color)

| 类名 | 作用 |
|------|------|
| `bg-transparent` | background-color: transparent |
| `bg-current` | background-color: currentColor |
| `bg-black` | background-color: #000 |
| `bg-white` | background-color: #fff |
| `bg-gray-500` | background-color: #6b7280 |
| `bg-blue-500` | background-color: #3b82f6 |
| `bg-red-500` | background-color: #ef4444 |
| `bg-green-500` | background-color: #22c55e |

---

### 4.5 字体 (Typography)

#### 4.5.1 字体大小

| 类名 | 作用 |
|------|------|
| `text-xs` | font-size: 0.75rem (12px) |
| `text-sm` | font-size: 0.875rem (14px) |
| `text-base` | font-size: 1rem (16px) |
| `text-lg` | font-size: 1.125rem (18px) |
| `text-xl` | font-size: 1.25rem (20px) |
| `text-2xl` | font-size: 1.5rem (24px) |
| `text-3xl` | font-size: 1.875rem (30px) |
| `text-4xl` | font-size: 2.25rem (36px) |
| `text-5xl` | font-size: 3rem (48px) |
| `text-6xl` | font-size: 3.75rem (60px) |
| `text-7xl` | font-size: 4.5rem (72px) |
| `text-8xl` | font-size: 6rem (96px) |
| `text-9xl` | font-size: 8rem (128px) |

#### 4.5.2 字体粗细

| 类名 | 作用 |
|------|------|
| `font-thin` | font-weight: 100 |
| `font-extralight` | font-weight: 200 |
| `font-light` | font-weight: 300 |
| `font-normal` | font-weight: 400 |
| `font-medium` | font-weight: 500 |
| `font-semibold` | font-weight: 600 |
| `font-bold` | font-weight: 700 |
| `font-extrabold` | font-weight: 800 |
| `font-black` | font-weight: 900 |

#### 4.5.3 字体样式

| 类名 | 作用 |
|------|------|
| `italic` | font-style: italic |
| `not-italic` | font-style: normal |
| `font-mono` | font-family: ui-monospace |
| `font-sans` | font-family: ui-sans-serif |
| `font-serif` | font-family: ui-serif |

#### 4.5.4 文字对齐

| 类名 | 作用 |
|------|------|
| `text-left` | text-align: left |
| `text-center` | text-align: center |
| `text-right` | text-align: right |
| `text-justify` | text-align: justify |
| `text-start` | text-align: start |
| `text-end` | text-align: end |

#### 4.5.5 行高

| 类名 | 作用 |
|------|------|
| `leading-none` | line-height: 1 |
| `leading-tight` | line-height: 1.25 |
| `leading-snug` | line-height: 1.375 |
| `leading-normal` | line-height: 1.5 |
| `leading-relaxed` | line-height: 1.625 |
| `leading-loose` | line-height: 2 |
| `leading-3` | line-height: .75rem |
| `leading-4` | line-height: 1rem |
| `leading-5` | line-height: 1.25rem |
| `leading-6` | line-height: 1.5rem |
| `leading-7` | line-height: 1.75rem |
| `leading-8` | line-height: 2rem |
| `leading-9` | line-height: 2.25rem |
| `leading-10` | line-height: 2.5rem |

#### 4.5.6 字母间距

| 类名 | 作用 |
|------|------|
| `tracking-tighter` | letter-spacing: -0.05em |
| `tracking-tight` | letter-spacing: -0.025em |
| `tracking-normal` | letter-spacing: 0 |
| `tracking-wide` | letter-spacing: 0.025em |
| `tracking-wider` | letter-spacing: 0.05em |
| `tracking-widest` | letter-spacing: 0.1em |

#### 4.5.7 文字装饰

| 类名 | 作用 |
|------|------|
| `underline` | text-decoration: underline |
| `overline` | text-decoration: overline |
| `line-through` | text-decoration: line-through |
| `no-underline` | text-decoration: none |

#### 4.5.8 文字换行

| 类名 | 作用 |
|------|------|
| `whitespace-normal` | white-space: normal |
| `whitespace-nowrap` | white-space: nowrap |
| `whitespace-pre` | white-space: pre |
| `whitespace-pre-line` | white-space: pre-line |
| `whitespace-pre-wrap` | white-space: pre-wrap |
| `break-normal` | word-break: normal |
| `break-words` | word-break: break-word |
| `break-all` | word-break: break-all |
| `truncate` | overflow: hidden + text-overflow: ellipsis + white-space: nowrap |

---

### 4.6 边框 (Borders)

#### 4.6.1 边框宽度

| 类名 | 作用 |
|------|------|
| `border` | border-width: 1px |
| `border-0` | border-width: 0 |
| `border-2` | border-width: 2px |
| `border-4` | border-width: 4px |
| `border-8` | border-width: 8px |

#### 4.6.2 边框颜色

| 类名 | 作用 |
|------|------|
| `border-transparent` | border-color: transparent |
| `border-current` | border-color: currentColor |
| `border-black` | border-color: #000 |
| `border-white` | border-color: #fff |
| `border-gray-500` | border-color: #6b7280 |
| `border-blue-500` | border-color: #3b82f6 |

#### 4.6.3 边框样式

| 类名 | 作用 |
|------|------|
| `border-solid` | border-style: solid |
| `border-dashed` | border-style: dashed |
| `border-dotted` | border-style: dotted |
| `border-double` | border-style: double |
| `border-hidden` | border-style: hidden |
| `border-none` | border-style: none |

#### 4.6.4 圆角

| 类名 | 作用 |
|------|------|
| `rounded-none` | border-radius: 0 |
| `rounded-sm` | border-radius: 0.125rem |
| `rounded` | border-radius: 0.25rem |
| `rounded-md` | border-radius: 0.375rem |
| `rounded-lg` | border-radius: 0.5rem |
| `rounded-xl` | border-radius: 0.75rem |
| `rounded-2xl` | border-radius: 1rem |
| `rounded-3xl` | border-radius: 1.5rem |
| `rounded-full` | border-radius: 9999px |

#### 4.6.5 分方向圆角

| 类名 | 作用 |
|------|------|
| `rounded-t-none` | border-top-left-radius: 0; border-top-right-radius: 0 |
| `rounded-r-none` | border-top-right-radius: 0; border-bottom-right-radius: 0 |
| `rounded-b-none` | border-bottom-left-radius: 0; border-bottom-right-radius: 0 |
| `rounded-l-none` | border-top-left-radius: 0; border-bottom-left-radius: 0 |
| `rounded-t-sm` | border-top-left-radius: 0.125rem; border-top-right-radius: 0.125rem |
| `rounded-t` | border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem |
| `rounded-t-lg` | border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem |

---

### 4.7 阴影 (Shadows)

| 类名 | 作用 |
|------|------|
| `shadow-sm` | box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) |
| `shadow` | box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) |
| `shadow-md` | 中等阴影 |
| `shadow-lg` | 大阴影 |
| `shadow-xl` | 更大阴影 |
| `shadow-2xl` | 极大阴影 |
| `shadow-none` | box-shadow: none |
| `shadow-inner` | box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05) |

---

### 4.8 Flexbox 布局

#### 4.8.1 父容器属性

| 类名                  | 解释        | 作用                             |
| ------------------- | --------- | ------------------------------ |
| `flex`              | 块级弹性盒     | display: flex                  |
| `inline-flex`       | 行内弹性盒     | display: inline-flex           |
| `flex-row`          | 水平排列（默认）  | flex-direction: row            |
| `flex-row-reverse`  | 水平反向排列    | flex-direction: row-reverse    |
| `flex-col`          | 垂直排列      | flex-direction: column         |
| `flex-col-reverse`  | 垂直反向排列    | flex-direction: column-reverse |
| `flex-wrap`         | 允许换行      | flex-wrap: wrap                |
| `flex-wrap-reverse` | 允许换行且反向   | flex-wrap: wrap-reverse        |
| `flex-nowrap`       | 不允许换行（默认） | flex-wrap: nowrap              |

#### 4.8.2 主轴对齐 (justify-content)

| 类名 | 解释 | 作用 |
|------|------|------|
| `justify-start` | 左对齐 | justify-content: flex-start |
| `justify-end` | 右对齐 | justify-content: flex-end |
| `justify-center` | 居中对齐 | justify-content: center |
| `justify-between` | 两端对齐（项目间间距相等） | justify-content: space-between |
| `justify-around` | 项目两侧间距相等 | justify-content: space-around |
| `justify-evenly` | 项目间距完全相等 | justify-content: space-evenly |

#### 4.8.3 交叉轴对齐 (align-items)

| 类名 | 解释 | 作用 |
|------|------|------|
| `items-start` | 交叉轴起点对齐 | align-items: flex-start |
| `items-end` | 交叉轴终点对齐 | align-items: flex-end |
| `items-center` | 交叉轴居中对齐 | align-items: center |
| `items-baseline` | 项目基线对齐 | align-items: baseline |
| `items-stretch` | 项目拉伸填充（默认） | align-items: stretch |

#### 4.8.4 多行对齐 (align-content)

| 类名 | 解释 | 作用 |
|------|------|------|
| `content-start` | 行聚拢在交叉轴起点 | align-content: flex-start |
| `content-end` | 行聚拢在交叉轴终点 | align-content: flex-end |
| `content-center` | 行聚拢在交叉轴居中 | align-content: center |
| `content-between` | 行两端对齐 | align-content: space-between |
| `content-around` | 行两侧间距相等 | align-content: space-around |
| `content-evenly` | 行间距完全相等 | align-content: space-evenly |

#### 4.8.5 子元素属性

| 类名 | 解释 | 作用 |
|------|------|------|
| `flex-1` | 项目占满剩余空间（扩展=1 收缩=0 基准=0） | flex: 1 1 0% |
| `flex-auto` | 项目占满剩余空间（扩展=1 收缩=1 基准=auto） | flex: 1 1 auto |
| `flex-initial` | 项目不扩展但可收缩（扩展=0 收缩=1 基准=auto） | flex: 0 1 auto |
| `flex-none` | 项目不扩展不收缩 | flex: none |
| `flex-grow` | 项目可扩展 | flex-grow: 1 |
| `flex-shrink` | 项目可收缩 | flex-shrink: 1 |
| `flex-grow-0` | 项目不可扩展 | flex-grow: 0 |
| `flex-shrink-0` | 项目不可收缩 | flex-shrink: 0 |

#### 4.8.6 单独对齐 (align-self)

| 类名 | 解释 | 作用 |
|------|------|------|
| `self-auto` | 继承父容器 align-items（默认） | align-self: auto |
| `self-start` | 在交叉轴起点对齐 | align-self: flex-start |
| `self-end` | 在交叉轴终点对齐 | align-self: flex-end |
| `self-center` | 在交叉轴居中对齐 | align-self: center |
| `self-stretch` | 拉伸填充交叉轴 | align-self: stretch |
| `self-baseline` | 按基线对齐 | align-self: baseline |

#### 4.8.7 排序

| 类名 | 解释 | 作用 |
|------|------|------|
| `order-1` | 排序为第1位 | order: 1 |
| `order-2` | 排序为第2位 | order: 2 |
| `order-first` | 排在最前面 | order: -9999 |
| `order-last` | 排在最后面 | order: 9999 |
| `order-none` | 按文档顺序（默认） | order: 0 |

---

### 4.9 Grid 布局

#### 4.9.1 父容器

| 类名 | 解释 | 作用 |
|------|------|------|
| `grid` | 块级网格容器 | display: grid |
| `inline-grid` | 行内网格容器 | display: inline-grid |
| `grid-cols-1` | 1列网格 | grid-template-columns: repeat(1, minmax(0, 1fr)) |
| `grid-cols-2` | 2列网格 | grid-template-columns: repeat(2, minmax(0, 1fr)) |
| `grid-cols-3` | 3列网格 | grid-template-columns: repeat(3, minmax(0, 1fr)) |
| `grid-cols-4` | 4列网格 | grid-template-columns: repeat(4, minmax(0, 1fr)) |
| `grid-cols-5` | 5列网格 | grid-template-columns: repeat(5, minmax(0, 1fr)) |
| `grid-cols-6` | 6列网格 | grid-template-columns: repeat(6, minmax(0, 1fr)) |
| `grid-cols-7` | 7列网格 | grid-template-columns: repeat(7, minmax(0, 1fr)) |
| `grid-cols-8` | 8列网格 | grid-template-columns: repeat(8, minmax(0, 1fr)) |
| `grid-cols-9` | 9列网格 | grid-template-columns: repeat(9, minmax(0, 1fr)) |
| `grid-cols-10` | 10列网格 | grid-template-columns: repeat(10, minmax(0, 1fr)) |
| `grid-cols-11` | 11列网格 | grid-template-columns: repeat(11, minmax(0, 1fr)) |
| `grid-cols-12` | 12列网格 | grid-template-columns: repeat(12, minmax(0, 1fr)) |
| `grid-cols-none` | 不定义列轨道 | grid-template-columns: none |
| `grid-rows-1` | 1行网格 | grid-template-rows: repeat(1, minmax(0, 1fr)) |
| `grid-rows-none` | 不定义行轨道 | grid-template-rows: none |

#### 4.9.2 网格间隙

| 类名 | 解释 | 作用 |
|------|------|------|
| `gap-0` | 无间隙 | gap: 0 |
| `gap-1` | 间隙 4px | gap: 0.25rem |
| `gap-2` | 间隙 8px | gap: 0.5rem |
| `gap-3` | 间隙 12px | gap: 0.75rem |
| `gap-4` | 间隙 16px | gap: 1rem |
| `gap-5` | 间隙 20px | gap: 1.25rem |
| `gap-6` | 间隙 24px | gap: 1.5rem |
| `gap-8` | 间隙 32px | gap: 2rem |
| `gap-10` | 间隙 40px | gap: 2.5rem |
| `gap-12` | 间隙 48px | gap: 3rem |
| `gap-16` | 间隙 64px | gap: 4rem |
| `gap-px` | 间隙 1px | gap: 1px |
| `gap-x-4` | 水平间隙 16px | column-gap: 1rem |
| `gap-y-4` | 垂直间隙 16px | row-gap: 1rem |

#### 4.9.3 子元素跨越

| 类名 | 解释 | 作用 |
|------|------|------|
| `col-auto` | 自动列 | grid-column: auto |
| `col-span-1` | 跨越1列 | grid-column: span 1 / span 1 |
| `col-span-2` | 跨越2列 | grid-column: span 2 / span 2 |
| `col-span-3` | 跨越3列 | grid-column: span 3 / span 3 |
| `col-span-4` | 跨越4列 | grid-column: span 4 / span 4 |
| `col-span-5` | 跨越5列 | grid-column: span 5 / span 5 |
| `col-span-6` | 跨越6列 | grid-column: span 6 / span 6 |
| `col-span-full` | 跨越全部列 | grid-column: 1 / -1 |
| `col-start-1` | 从第1列开始 | grid-column-start: 1 |
| `col-start-2` | 从第2列开始 | grid-column-start: 2 |
| `col-start-3` | 从第3列开始 | grid-column-start: 3 |
| `col-start-auto` | 自动定位 | grid-column-start: auto |
| `col-end-1` | 结束于第1列 | grid-column-end: 1 |
| `col-end-auto` | 自动结束 | grid-column-end: auto |
| `row-auto` | 自动行 | grid-row: auto |
| `row-span-1` | 跨越1行 | grid-row: span 1 / span 1 |
| `row-span-2` | 跨越2行 | grid-row: span 2 / span 2 |
| `row-span-3` | 跨越3行 | grid-row: span 3 / span 3 |
| `row-span-full` | 跨越全部行 | grid-row: 1 / -1 |

---

### 4.10 定位 (Positioning)

| 类名         | 作用                 |
| ---------- | ------------------ |
| `static`   | position: static   |
| `fixed`    | position: fixed    |
| `absolute` | position: absolute |
| `relative` | position: relative |
| `sticky`   | position: sticky   |

#### 4.10.1 定位偏移

| 类名           | 作用                                                           |
| ------------ | ------------------------------------------------------------ |
| `inset-0`    | top: 0; right: 0; bottom: 0; left: 0                         |
| `inset-1`    | top: 0.25rem; right: 0.25rem; bottom: 0.25rem; left: 0.25rem |
| `inset-2`    | top: 0.5rem; right: 0.5rem; bottom: 0.5rem; left: 0.5rem     |
| `inset-4`    | top: 1rem; right: 1rem; bottom: 1rem; left: 1rem             |
| `inset-auto` | top: auto; right: auto; bottom: auto; left: auto             |
| `inset-full` | top: 100%; right: 100%; bottom: 100%; left: 100%             |
| `inset-px`   | top: 1px; right: 1px; bottom: 1px; left: 1px                 |
| `-inset-1`   | 负值偏移                                                         |
| `top-0`      | top: 0                                                       |
| `top-1`      | top: 0.25rem                                                 |
| `top-2`      | top: 0.5rem                                                  |
| `top-4`      | top: 1rem                                                    |
| `top-auto`   | top: auto                                                    |
| `top-1/2`    | top: 50%                                                     |
| `top-full`   | top: 100%                                                    |
| `right-0`    | right: 0                                                     |
| `bottom-0`   | bottom: 0                                                    |
| `left-0`     | left: 0                                                      |
| `left-1/2`   | left: 50%                                                    |

#### 4.10.2 Z-Index

| 类名 | 作用 |
|------|------|
| `z-0` | z-index: 0 |
| `z-10` | z-index: 10 |
| `z-20` | z-index: 20 |
| `z-30` | z-index: 30 |
| `z-40` | z-index: 40 |
| `z-50` | z-index: 50 |
| `z-auto` | z-index: auto |
| `z-full` | z-index: 9999 |

---

### 4.11 显示 (Display)

| 类名 | 作用 |
|------|------|
| `hidden` | display: none |
| `block` | display: block |
| `inline-block` | display: inline-block |
| `inline` | display: inline |
| `flex` | display: flex |
| `inline-flex` | display: inline-flex |
| `grid` | display: grid |
| `inline-grid` | display: inline-grid |
| `table` | display: table |
| `inline-table` | display: inline-table |
| `table-caption` | display: table-caption |
| `table-cell` | display: table-cell |
| `table-column` | display: table-column |
| `table-column-group` | display: table-column-group |
| `table-footer-group` | display: table-footer-group |
| `table-header-group` | display: table-header-group |
| `table-row-group` | display: table-row-group |
| `table-row` | display: table-row |
| `flow-root` | display: flow-root |
| `contents` | display: contents |
| `list-item` | display: list-item |

---

### 4.12 浮动

| 类名 | 作用 |
|------|------|
| `float-right` | float: right |
| `float-left` | float: left |
| `float-none` | float: none |
| `clearfix` | 清除浮动（::after 伪元素） |

---

### 4.13 指针事件

| 类名 | 作用 |
|------|------|
| `pointer-events-none` | pointer-events: none |
| `pointer-events-auto` | pointer-events: auto |

---

### 4.14 用户选择

| 类名 | 作用 |
|------|------|
| `select-none` | user-select: none |
| `select-text` | user-select: text |
| `select-all` | user-select: all |
| `select-auto` | user-select: auto |

---

### 4.15 滚动行为

| 类名 | 作用 |
|------|------|
| `scroll-auto` | scroll-behavior: auto |
| `scroll-smooth` | scroll-behavior: smooth |

---

### 4.16 列表

| 类名 | 作用 |
|------|------|
| `list-none` | list-style-type: none |
| `list-disc` | list-style-type: disc |
| `list-decimal` | list-style-type: decimal |
| `list-inside` | padding-left: 1em (列表标记在里面) |
| `list-outside` | padding-left: 0 (列表标记在外面) |

---

### 4.17 动画 (Animation)

#### 4.17.1 过渡动画

| 类名 | 作用 |
|------|------|
| `transition-none` | transition: none |
| `transition-all` | transition: all (所有属性) |
| `transition` | transition: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform |
| `transition-colors` | transition: background-color, border-color, color, fill, stroke |
| `transition-opacity` | transition: opacity |
| `transition-shadow` | transition: box-shadow |
| `transition-transform` | transition: transform |

#### 4.17.2 动画时长

| 类名 | 作用 |
|------|------|
| `duration-0` | transition-duration: 0s |
| `duration-75` | transition-duration: 75ms |
| `duration-100` | transition-duration: 100ms |
| `duration-150` | transition-duration: 150ms |
| `duration-200` | transition-duration: 200ms |
| `duration-300` | transition-duration: 300ms |
| `duration-500` | transition-duration: 500ms |
| `duration-700` | transition-duration: 700ms |
| `duration-1000` | transition-duration: 1000ms |

#### 4.17.3 缓动函数

| 类名 | 作用 |
|------|------|
| `ease-linear` | transition-timing-function: linear |
| `ease-in` | transition-timing-function: cubic-bezier(0.4, 0, 1, 1) |
| `ease-out` | transition-timing-function: cubic-bezier(0, 0, 0.2, 1) |
| `ease-in-out` | transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) |

#### 4.17.4 延迟

| 类名 | 作用 |
|------|------|
| `delay-0` | transition-delay: 0s |
| `delay-75` | transition-delay: 75ms |
| `delay-100` | transition-delay: 100ms |
| `delay-150` | transition-delay: 150ms |
| `delay-200` | transition-delay: 200ms |
| `delay-300` | transition-delay: 300ms |
| `delay-500` | transition-delay: 500ms |
| `delay-700` | transition-delay: 700ms |
| `delay-1000` | transition-delay: 1000ms |

#### 4.17.5 关键帧动画

| 类名 | 作用 |
|------|------|
| `animate-none` | animation: none |
| `animate-spin` | animation: spin 1s linear infinite |
| `animate-ping` | animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite |
| `animate-pulse` | animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite |
| `animate-bounce` | animation: bounce 1s infinite |

---

### 4.18 变形 (Transform)

| 类名 | 作用 |
|------|------|
| `transform` | transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) |
| `transform-gpu` | 使用 GPU 加速 |
| `transform-none` | transform: none |

#### 4.18.1 缩放

| 类名 | 作用 |
|------|------|
| `scale-0` | transform: scale(0) |
| `scale-50` | transform: scale(0.5) |
| `scale-75` | transform: scale(0.75) |
| `scale-90` | transform: scale(0.9) |
| `scale-95` | transform: scale(0.95) |
| `scale-100` | transform: scale(1) |
| `scale-105` | transform: scale(1.05) |
| `scale-110` | transform: scale(1.1) |
| `scale-125` | transform: scale(1.25) |
| `scale-150` | transform: scale(1.5) |
| `scale-x-0` | transform: scaleX(0) |
| `scale-y-0` | transform: scaleY(0) |

#### 4.18.2 旋转

| 类名 | 作用 |
|------|------|
| `rotate-0` | transform: rotate(0deg) |
| `rotate-1` | transform: rotate(1deg) |
| `rotate-2` | transform: rotate(2deg) |
| `rotate-3` | transform: rotate(3deg) |
| `rotate-6` | transform: rotate(6deg) |
| `rotate-12` | transform: rotate(12deg) |
| `rotate-45` | transform: rotate(45deg) |
| `rotate-90` | transform: rotate(90deg) |
| `rotate-180` | transform: rotate(180deg) |
| `-rotate-45` | transform: rotate(-45deg) |
| `-rotate-90` | transform: rotate(-90deg) |

#### 4.18.3 平移

| 类名 | 作用 |
|------|------|
| `translate-x-0` | transform: translateX(0) |
| `translate-x-1` | transform: translateX(0.25rem) |
| `translate-x-2` | transform: translateX(0.5rem) |
| `translate-x-4` | transform: translateX(1rem) |
| `translate-x-1/2` | transform: translateX(50%) |
| `translate-x-full` | transform: translateX(100%) |
| `-translate-x-1` | transform: translateX(-0.25rem) |
| `-translate-x-1/2` | transform: translateX(-50%) |
| `translate-y-0` | transform: translateY(0) |
| `translate-y-1` | transform: translateY(0.25rem) |
| `translate-y-2` | transform: translateY(0.5rem) |
| `translate-y-4` | transform: translateY(1rem) |
| `translate-y-full` | transform: translateY(100%) |

---

### 4.19 不透明度

| 类名 | 作用 |
|------|------|
| `opacity-0` | opacity: 0 |
| `opacity-5` | opacity: 0.05 |
| `opacity-10` | opacity: 0.1 |
| `opacity-15` | opacity: 0.15 |
| `opacity-20` | opacity: 0.2 |
| `opacity-25` | opacity: 0.25 |
| `opacity-30` | opacity: 0.3 |
| `opacity-35` | opacity: 0.35 |
| `opacity-40` | opacity: 0.4 |
| `opacity-45` | opacity: 0.45 |
| `opacity-50` | opacity: 0.5 |
| `opacity-55` | opacity: 0.55 |
| `opacity-60` | opacity: 0.6 |
| `opacity-65` | opacity: 0.65 |
| `opacity-70` | opacity: 0.7 |
| `opacity-75` | opacity: 0.75 |
| `opacity-80` | opacity: 0.8 |
| `opacity-85` | opacity: 0.85 |
| `opacity-90` | opacity: 0.9 |
| `opacity-95` | opacity: 0.95 |
| `opacity-100` | opacity: 1 |

---

### 4.20 轮廓

| 类名 | 作用 |
|------|------|
| `outline-none` | outline: 2px solid transparent; outline-offset: 2px |
| `outline` | outline-width: 2px |
| `outline-0` | outline-width: 0 |
| `outline-1` | outline-width: 1px |
| `outline-2` | outline-width: 2px |
| `outline-4` | outline-width: 4px |
| `outline-offset-0` | outline-offset: 0 |
| `outline-offset-1` | outline-offset: 1px |
| `outline-offset-2` | outline-offset: 2px |
| `outline-offset-4` | outline-offset: 4px |
| `outline-offset-8` | outline-offset: 8px |

---

### 4.21 滤镜效果

| 类名 | 作用 |
|------|------|
| `blur-0` | filter: blur(0) |
| `blur-none` | filter: blur(0) |
| `blur-sm` | filter: blur(4px) |
| `blur` | filter: blur(8px) |
| `blur-md` | filter: blur(12px) |
| `blur-lg` | filter: blur(16px) |
| `blur-xl` | filter: blur(24px) |
| `blur-2xl` | filter: blur(40px) |
| `blur-3xl` | filter: blur(64px) |
| `brightness-0` | filter: brightness(0) |
| `brightness-50` | filter: brightness(0.5) |
| `brightness-75` | filter: brightness(0.75) |
| `brightness-90` | filter: brightness(0.9) |
| `brightness-100` | filter: brightness(1) |
| `brightness-110` | filter: brightness(1.1) |
| `brightness-125` | filter: brightness(1.25) |
| `brightness-150` | filter: brightness(1.5) |
| `brightness-200` | filter: brightness(2) |
| `contrast-0` | filter: contrast(0) |
| `contrast-50` | filter: contrast(0.5) |
| `contrast-100` | filter: contrast(1) |
| `contrast-150` | filter: contrast(1.5) |
| `contrast-200` | filter: contrast(2) |
| `grayscale-0` | filter: grayscale(0) |
| `grayscale` | filter: grayscale(1) |
| `sepia-0` | filter: sepia(0) |
| `sepia` | filter: sepia(1) |
| `saturate-0` | filter: saturate(0) |
| `saturate-50` | filter: saturate(0.5) |
| `saturate-100` | filter: saturate(1) |
| `saturate-150` | filter: saturate(1.5) |
| `saturate-200` | filter: saturate(2) |
| `hue-rotate-0` | filter: hue-rotate(0deg) |
| `hue-rotate-15` | filter: hue-rotate(15deg) |
| `hue-rotate-30` | filter: hue-rotate(30deg) |
| `hue-rotate-60` | filter: hue-rotate(60deg) |
| `hue-rotate-90` | filter: hue-rotate(90deg) |
| `hue-rotate-180` | filter: hue-rotate(180deg) |
| `-hue-rotate-180` | filter: hue-rotate(-180deg) |

---

### 4.22 混合模式

| 类名 | 作用 |
|------|------|
| `mix-blend-normal` | mix-blend-mode: normal |
| `mix-blend-multiply` | mix-blend-mode: multiply |
| `mix-blend-screen` | mix-blend-mode: screen |
| `mix-blend-overlay` | mix-blend-mode: overlay |
| `mix-blend-darken` | mix-blend-mode: darken |
| `mix-blend-lighten` | mix-blend-mode: lighten |
| `mix-blend-color-dodge` | mix-blend-mode: color-dodge |
| `mix-blend-color-burn` | mix-blend-mode: color-burn |
| `mix-blend-hard-light` | mix-blend-mode: hard-light |
| `mix-blend-soft-light` | mix-blend-mode: soft-light |
| `mix-blend-difference` | mix-blend-mode: difference |
| `mix-blend-exclusion` | mix-blend-mode: exclusion |
| `mix-blend-hue` | mix-blend-mode: hue |
| `mix-blend-saturation` | mix-blend-mode: saturation |
| `mix-blend-color` | mix-blend-mode: color |
| `mix-blend-luminosity` | mix-blend-mode: luminosity |

---

### 4.23 背景样式

#### 4.23.1 背景位置

| 类名 | 作用 |
|------|------|
| `bg-bottom` | background-position: bottom |
| `bg-center` | background-position: center |
| `bg-left` | background-position: left |
| `bg-left-bottom` | background-position: left bottom |
| `bg-left-top` | background-position: left top |
| `bg-right` | background-position: right |
| `bg-right-bottom` | background-position: right bottom |
| `bg-right-top` | background-position: right top |
| `bg-top` | background-position: top |

#### 4.23.2 背景尺寸

| 类名 | 作用 |
|------|------|
| `bg-auto` | background-size: auto |
| `bg-cover` | background-size: cover |
| `bg-contain` | background-size: contain |

#### 4.23.3 背景重复

| 类名 | 作用 |
|------|------|
| `bg-repeat` | background-repeat: repeat |
| `bg-no-repeat` | background-repeat: no-repeat |
| `bg-repeat-x` | background-repeat: repeat-x |
| `bg-repeat-y` | background-repeat: repeat-y |
| `bg-repeat-round` | background-repeat: round |
| `bg-repeat-space` | background-repeat: space |

#### 4.23.4 背景固定

| 类名 | 作用 |
|------|------|
| `bg-fixed` | background-attachment: fixed |
| `bg-local` | background-attachment: local |
| `bg-scroll` | background-attachment: scroll |

---

### 4.24 渐变

| 类名 | 作用 |
|------|------|
| `bg-gradient-to-t` | background-image: linear-gradient(to top, ...) |
| `bg-gradient-to-tr` | background-image: linear-gradient(to top right, ...) |
| `bg-gradient-to-r` | background-image: linear-gradient(to right, ...) |
| `bg-gradient-to-br` | background-image: linear-gradient(to bottom right, ...) |
| `bg-gradient-to-b` | background-image: linear-gradient(to bottom, ...) |
| `bg-gradient-to-bl` | background-image: linear-gradient(to bottom left, ...) |
| `bg-gradient-to-l` | background-image: linear-gradient(to left, ...) |
| `bg-gradient-to-tl` | background-image: linear-gradient(to top left, ...) |

**使用示例：**
```html
<div class="bg-gradient-to-r from-blue-500 to-green-500">
  从蓝色渐变到绿色
</div>
<div class="bg-gradient-to-r from-yellow-200 via-red-500 to-blue-500">
  三色渐变
</div>
```

---

### 4.25 边框样式

#### 4.25.1 分割边框

| 类名 | 作用 |
|------|------|
| `divide-x` | border-x-width: 1px |
| `divide-x-0` | border-x-width: 0 |
| `divide-x-2` | border-x-width: 2px |
| `divide-x-4` | border-x-width: 4px |
| `divide-x-8` | border-x-width: 8px |
| `divide-y` | border-y-width: 1px |
| `divide-y-0` | border-y-width: 0 |
| `divide-y-2` | border-y-width: 2px |
| `divide-y-4` | border-y-width: 4px |
| `divide-y-8` | border-y-width: 8px |
| `divide-solid` | border-style: solid |
| `divide-dashed` | border-style: dashed |
| `divide-dotted` | border-style: dotted |
| `divide-transparent` | border-color: transparent |
| `divide-current` | border-color: currentColor |
| `divide-black` | border-color: #000 |
| `divide-white` | border-color: #fff |
| `divide-gray-500` | border-color: #6b7280 |

---

### 4.26 环 (Ring)

| 类名 | 作用 |
|------|------|
| `ring-0` | --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000 |
| `ring-1` | box-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color) |
| `ring-2` | box-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) |
| `ring-4` | box-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color) |
| `ring-8` | box-shadow: var(--tw-ring-inset) 0 0 0 calc(8px + var(--tw-ring-offset-width)) var(--tw-ring-color) |
| `ring` | box-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color) |
| `ring-inset` | --tw-ring-inset: inset |
| `ring-transparent` | --tw-ring-color: transparent |
| `ring-current` | --tw-ring-color: currentColor |
| `ring-black` | --tw-ring-color: #000 |
| `ring-white` | --tw-ring-color: #fff |
| `ring-gray-500` | --tw-ring-color: #6b7280 |
| `ring-offset-0` | --tw-ring-offset-width: 0px |
| `ring-offset-1` | --tw-ring-offset-width: 1px |
| `ring-offset-2` | --tw-ring-offset-width: 2px |
| `ring-offset-4` | --tw-ring-offset-width: 4px |
| `ring-offset-8` | --tw-ring-offset-width: 8px |

---

### 4.27 占位符

| 类名 | 作用 |
|------|------|
| `placeholder-transparent` | ::placeholder { color: transparent } |
| `placeholder-current` | ::placeholder { color: currentColor } |
| `placeholder-black` | ::placeholder { color: #000 } |
| `placeholder-white` | ::placeholder { color: #fff } |
| `placeholder-gray-500` | ::placeholder { color: #6b7280 } |

---

## 5. 响应式设计

### 5.1 断点前缀

| 前缀 | 最小宽度 | 说明 |
|------|----------|------|
| `sm:` | 640px | 小屏幕（如大手机） |
| `md:` | 768px | 中等屏幕（如平板） |
| `lg:` | 1024px | 大屏幕（如小笔记本） |
| `xl:` | 1280px | 超大屏幕（如桌面） |
| `2xl:` | 1536px | 2倍大屏幕（如大桌面） |

### 5.2 使用方式

```html
<!-- 基础宽度100%，中等及以上屏幕50%，大屏幕33% -->
<div class="w-full md:w-1/2 lg:w-1/3">
  响应式内容
</div>

<!-- 基础蓝色，hover时变红，大屏幕hover变绿 -->
<button class="bg-blue-500 hover:bg-red-500 lg:hover:bg-green-500">
  按钮
</button>
```

### 5.3 响应式示例

| 场景 | 类名组合 |
|------|----------|
| 移动端堆叠，桌面并排 | `flex-col md:flex-row` |
| 移动端隐藏，桌面显示 | `hidden md:block` |
| 移动端单列，平板双列，桌面四列 | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |

---

## 6. 状态变体

### 6.1 常用状态

| 前缀 | 作用 | 示例 |
|------|------|------|
| `hover:` | 鼠标悬停 | `hover:bg-blue-600` |
| `focus:` | 获得焦点 | `focus:outline-none` |
| `active:` | 激活状态 | `active:bg-blue-700` |
| `disabled:` | 禁用状态 | `disabled:opacity-50` |
| `group-hover:` | 组内元素悬停 | 父元素 hover 时触发 |
| `focus-within:` | 子元素获得焦点 | 父元素包含 focus 子元素时 |
| `focus-visible:` | 键盘焦点可见 | 仅键盘导航时触发 |
| `motion-safe:` | 运动安全 | prefers-reduced-motion: no-preference |
| `motion-reduce:` | 运动减少 | prefers-reduced-motion: reduce |

### 6.2 伪类变体

| 前缀 | 作用 |
|------|------|
| `first:` | 第一个子元素 |
| `last:` | 最后一个子元素 |
| `only:` | 唯一子元素 |
| `odd:` | 奇数子元素 |
| `even:` | 偶数子元素 |
| `first-of-type:` | 同类型第一个 |
| `last-of-type:` | 同类型最后一个 |
| `only-of-type:` | 同类型唯一 |
| `empty:` | 空元素 |
| `visited:` | 访问过的链接 |
| `checked:` | 选中的复选框/单选 |
| `default:` | 默认值 |
| `indeterminate:` | 不确定状态 |
| `placeholder-shown:` | 占位符显示时 |
| `read-only:` | 只读状态 |

### 6.3 使用示例

```html
<!-- 悬停效果 -->
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2">
  按钮
</button>

<!-- 第一个子元素特殊样式 -->
<li class="text-red-500 first:text-green-500">
  第一项特殊颜色
</li>

<!-- 组悬停 -->
<div class="group">
  <div class="bg-gray-100 group-hover:bg-gray-200">
    悬停时背景变深
  </div>
</div>

<!-- 禁用状态 -->
<input class="disabled:opacity-50 disabled:cursor-not-allowed" />
```

### 6.4 dark: 暗色模式

| 前缀 | 作用 |
|------|------|
| `dark:` | 暗色模式下的样式 |

**v3 配置方式：**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 或 'media'
}
```

**v4 配置方式：**

```css
/* src/index.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

**使用示例：**

```html
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-black dark:text-white">标题</h1>
</div>

<!-- 需要在 HTML 标签上添加 dark 类 -->
<html class="dark">
  ...
</html>
```

---

## 7. 自定义配置

### 7.1 v4 CSS-first 配置（推荐）

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* 自定义颜色 */
  --color-primary: #1da1f2;
  --color-secondary: #f7f9fa;

  /* 自定义间距 */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;

  /* 自定义字体 */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;

  /* 自定义动画 */
  --animate-spin-slow: spin 3s linear infinite;

  /* 自定义圆角 */
  --radius-*.****: 1rem;

  /* 自定义阴影 */
  --shadow-*: ...;
}
```

### 7.2 v4 自定义工具类

```css
@utility btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: 0.5rem;
}
```

使用：`<button class="btn">按钮</button>`

### 7.3 v4 自定义变体

```css
@custom-variant dark (&:where(.dark, .dark *));

/* 使用 */
<div class="dark:bg-gray-900">...</div>
```

### 7.4 v4 使用任意值

```html
<!-- 任意值语法：方括号内直接写 CSS 值 -->
<div class="w-[calc(100%-1rem)]">自定义宽度</div>
<div class="text-[#1da1f2]">自定义颜色</div>
<div class="grid-cols-[1fr,2fr,1fr]">自定义网格列</div>
<div class="top-[calc(100%-2rem)]">自定义位置</div>
```

### 7.5 v3 传统配置方式

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        primary: '#1da1f2',
        secondary: '#f7f9fa',
      },
      // 自定义间距
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // 自定义字体
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      // 自定义动画
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
}
```

### 7.6 添加插件

**v4 方式：**

```bash
npm install @tailwindcss/forms @tailwindcss/typography
```

```css
/* src/index.css */
@import "tailwindcss";
@import "@tailwindcss/forms";
@import "@tailwindcss/typography";
```

**v3 方式：**

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## 8. 高级技巧

### 8.1 组件化 (Components)

```css
/* 使用 @apply 提取为组件类 */
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
}
```

### 8.2 层叠 (Layers)

```css
@layer base {
  h1 { @apply text-2xl font-bold; }
  h2 { @apply text-xl font-semibold; }
}

@layer components {
  .card { @apply bg-white rounded-xl shadow-lg p-6; }
}

@layer utilities {
  .filter-noise { filter: url(#noise-filter); }
}
```

### 8.3 v4 新增：容器查询 (Container Queries)

无需依赖屏幕大小，基于容器自身尺寸来响应式设计：

```html
<div class="@container">
  <div class="@md:w-1/2 @lg:w-1/3">
    容器查询响应式内容
  </div>
</div>
```

配置容器尺寸：

```css
@theme {
  --container-sm: 320px;
  --container-md: 768px;
  --container-lg: 1024px;
}
```

### 8.4 v4 新增：3D 变换

直接在 HTML 中实现 3D 空间变换：

| 类名 | 作用 |
|------|------|
| `rotate-y-45` | rotateY(45deg) |
| `rotate-y-90` | rotateY(90deg) |
| `rotate-x-45` | rotateX(45deg) |
| `perspective-1000` | perspective(1000px) |
| `preserve-3d` | transform-style: preserve-3d |
| `backface-hidden` | backface-visibility: hidden |

### 8.5 v4 新增：扩展渐变 API

支持径向渐变和锥形渐变：

```html
<!-- 线性渐变 -->
<div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
  渐变背景
</div>
```

### 8.6 v4 新增：@starting-style 变体

创建进入和退出过渡效果，无需 JavaScript：

```html
<div class="opacity-0 transition-opacity duration-300 hover:opacity-100 starting-opacity-0">
  悬停显示
</div>
```

### 8.7 v4 新增：not-* 变体

为不匹配的元素添加样式：

```html
<div class="not-hover:text-gray-500">非悬停时灰色</div>
<div class="not-focus:outline-none">非聚焦时无轮廓</div>
```

### 8.8 v4 RTL 支持

v4 自动支持 RTL（从右到左）布局，自动转换类名：

```html
<div dir="rtl" class="pl-4">RTL 布局自动转换</div>
```

### 8.9 v4 :has() 伪类支持

基于子元素状态应用样式：

```html
<div class="has-checked:bg-blue-100">
  <input type="checkbox" />
</div>
```

### 8.10 多值属性

```html
<!-- 支持一个类设置多个值 -->
<div class="grid grid-cols-2 gap-4">
  <div class="p-4 mx-auto max-w-md"></div>
</div>
```

### 8.11 条件类名

```html
<!-- React/Vue 中使用 -->
<button className={`px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`}>
  按钮
</button>

<!-- 或使用 clsx 库 -->
<button className={clsx('px-4 py-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-500')}>
  按钮
</button>
```

### 8.12 常见布局模板

```html
<!-- 水平垂直居中 -->
<div class="flex items-center justify-center h-screen">
  <div>居中内容</div>
</div>

<!-- Sticky 头部 -->
<div class="sticky top-0 z-50">固定头部</div>

<!-- 响应式导航 -->
<nav class="flex flex-col md:flex-row md:justify-between">
  <div>Logo</div>
  <div class="flex space-x-4">
    <a href="#">链接</a>
    <a href="#">链接</a>
  </div>
</nav>

<!-- 响应式卡片网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white rounded-lg shadow p-4">卡片1</div>
  <div class="bg-white rounded-lg shadow p-4">卡片2</div>
  <div class="bg-white rounded-lg shadow p-4">卡片3</div>
</div>
```

---

## 附录

### 常用速查表

#### 布局
- `flex` / `grid` - 弹性/网格布局
- `block` / `inline-block` / `hidden` - 显示/隐藏

#### 间距
- `m-4` / `p-4` - 外边距/内边距 1rem
- `mx-auto` - 水平居中
- `space-x-4` - 子元素水平间距

#### 尺寸
- `w-full` / `h-full` - 100% 宽/高
- `w-screen` / `h-screen` - 100vw/100vh

#### 文字
- `text-center` / `text-right` - 文字对齐
- `font-bold` / `text-xl` - 字重/字号
- `text-gray-500` - 文字颜色

#### 颜色
- `bg-blue-500` - 背景颜色
- `text-white` - 文字颜色
- `border-gray-300` - 边框颜色

#### 效果
- `shadow-lg` - 阴影
- `rounded-lg` - 圆角
- `opacity-50` - 透明度

#### 状态
- `hover:bg-blue-600` - 悬停
- `focus:ring-2` - 聚焦
- `disabled:opacity-50` - 禁用

#### 响应式
- `md:w-1/2` - 中屏50%宽度
- `lg:grid-cols-3` - 大屏3列

---

*文档整理完成，祝学习愉快！*
