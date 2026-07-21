# CSS 常用属性基础笔记

这份笔记用于回顾 **CSS 常用属性名**，重点看：

- 属性名是什么
- 控制什么效果
- 常见属性值有哪些
- 代码怎么写

---

# 1. CSS 基本写法

CSS 的核心格式：

```css
选择器 {
  属性名: 属性值;
}
```

示例：

```css
.box {
  width: 200px;
  height: 100px;
  background-color: skyblue;
}
```

含义：

| 属性名 | 作用 |
| --- | --- |
| `width` | 控制宽度 |
| `height` | 控制高度 |
| `background-color` | 控制背景颜色 |

---

# 2. 宽高属性

宽高属性用于控制盒子的尺寸。

## `width`

作用：设置元素宽度。

```css
.box {
  width: 300px;
}
```

常见值：

```css
width: 300px;
width: 50%;
width: 100%;
width: auto;
```

## `height`

作用：设置元素高度。

```css
.box {
  height: 200px;
}
```

常见值：

```css
height: 200px;
height: 100%;
height: 100vh;
height: auto;
```

## `min-width` / `max-width`

作用：限制最小宽度和最大宽度。

```css
.container {
  min-width: 320px;
  max-width: 1200px;
}
```

常见场景：页面内容居中但不无限变宽。

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
}
```

## `min-height` / `max-height`

作用：限制最小高度和最大高度。

```css
.page {
  min-height: 100vh;
}
```

---

# 3. 内外边距属性

## `margin`

作用：控制元素外部距离。

```css
.box {
  margin: 20px;
}
```

常见写法：

```css
margin: 20px;              /* 上右下左都是 20px */
margin: 10px 20px;         /* 上下 10px，左右 20px */
margin: 10px 20px 30px;    /* 上 10px，左右 20px，下 30px */
margin: 10px 20px 30px 40px; /* 上右下左 */
```

单独方向：

```css
margin-top: 20px;
margin-right: 20px;
margin-bottom: 20px;
margin-left: 20px;
```

常见技巧：块级元素水平居中。

```css
.container {
  width: 1000px;
  margin: 0 auto;
}
```

## `padding`

作用：控制元素内部距离。

```css
.box {
  padding: 20px;
}
```

单独方向：

```css
padding-top: 20px;
padding-right: 20px;
padding-bottom: 20px;
padding-left: 20px;
```

区别：

```txt
margin  = 元素外面的距离
padding = 元素里面内容和边框之间的距离
```

---

# 4. 边框属性

边框相关属性用于控制元素的边线、圆角、轮廓。

## `border`

作用：设置边框。

```css
.box {
  border: 1px solid #333;
}
```

完整含义：

```css
border: 边框宽度 边框样式 边框颜色;
```

常见边框样式：

```css
border: 1px solid black;   /* 实线 */
border: 1px dashed black;  /* 虚线 */
border: 1px dotted black;  /* 点线 */
border: none;              /* 无边框 */
```

## `border-width`

作用：控制边框粗细。

```css
.box {
  border-width: 2px;
}
```

## `border-style`

作用：控制边框样式。

```css
.box {
  border-style: solid;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `solid` | 实线 |
| `dashed` | 虚线 |
| `dotted` | 点线 |
| `none` | 无边框 |

## `border-color`

作用：控制边框颜色。

```css
.box {
  border-color: red;
}
```

## 单独控制某一边边框

```css
.box {
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
}
```

常见场景：列表分割线。

```css
.list-item {
  border-bottom: 1px solid #eee;
}
```

## `border-radius`

作用：控制圆角。

```css
.box {
  border-radius: 8px;
}
```

圆形头像：

```css
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
```

---

# 5. 盒模型属性

## `box-sizing`

作用：控制宽高计算方式。

```css
.box {
  box-sizing: border-box;
}
```

常见值：

| 值 | 含义 |
| --- | --- |
| `content-box` | 默认值，`width` 只包含内容 |
| `border-box` | `width` 包含内容、padding、border |

推荐全局写法：

```css
* {
  box-sizing: border-box;
}
```

示意：

```txt
content-box:
width = content
实际宽度 = content + padding + border

border-box:
width = content + padding + border
实际宽度 = width
```

---

# 6. 背景属性

## `background-color`

作用：设置背景颜色。

```css
.box {
  background-color: #f5f5f5;
}
```

## `background-image`

作用：设置背景图片。

```css
.banner {
  background-image: url("./banner.jpg");
}
```

## `background-size`

作用：控制背景图片尺寸。

```css
.banner {
  background-size: cover;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `cover` | 图片铺满容器，可能被裁剪 |
| `contain` | 图片完整显示，可能留空 |
| `100% 100%` | 拉伸铺满 |

## `background-position`

作用：控制背景图片位置。

```css
.banner {
  background-position: center;
}
```

## `background-repeat`

作用：控制背景是否重复。

```css
.banner {
  background-repeat: no-repeat;
}
```

---

# 7. 字体和文本属性

## `font-size`

作用：控制文字大小。

```css
.title {
  font-size: 24px;
}
```

## `font-weight`

作用：控制文字粗细。

```css
.title {
  font-weight: 700;
}
```

常见值：

```css
font-weight: normal;
font-weight: bold;
font-weight: 400;
font-weight: 700;
```

## `font-family`

作用：设置字体。

```css
body {
  font-family: Arial, "Microsoft YaHei", sans-serif;
}
```

## `color`

作用：设置文字颜色。

```css
.text {
  color: #333;
}
```

## `text-align`

作用：设置文本水平对齐。

```css
.text {
  text-align: center;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `left` | 左对齐 |
| `center` | 居中 |
| `right` | 右对齐 |

## `line-height`

作用：设置行高。

```css
.text {
  line-height: 1.8;
}
```

常见场景：让多行文字更易读。

## `text-decoration`

作用：设置文本装饰线。

```css
a {
  text-decoration: none;
}
```

常见值：

```css
text-decoration: none;
text-decoration: underline;
text-decoration: line-through;
```

## `white-space`

作用：控制空白和换行。

```css
.text {
  white-space: nowrap;
}
```

## `text-overflow`

作用：控制文本溢出显示方式。

单行省略号常用组合：

```css
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

## `font-style`

作用：设置字体样式。

```css
.text {
  font-style: italic;
}
```

## `text-indent`

作用：设置首行缩进。

```css
.p {
  text-indent: 2em;
}
```

## `letter-spacing` / `word-spacing`

作用：控制字间距和词间距。

```css
.title {
  letter-spacing: 1px;
}
```

## `word-break` / `overflow-wrap`

作用：控制长单词或长英文是否换行。

```css
.text {
  word-break: break-all;
  overflow-wrap: break-word;
}
```

## `vertical-align`

作用：控制行内元素、图片、表单控件的垂直对齐。

```css
img {
  vertical-align: middle;
}
```

## `list-style`

作用：控制列表样式。

```css
ul {
  list-style: none;
}
```

常见值：

```css
list-style: none;
list-style: disc;
list-style: decimal;
```

---

# 8. 显示方式属性

## `display`

作用：控制元素显示类型。

```css
.box {
  display: block;
}
```

常见值：

| 值              | 效果               |
| -------------- | ---------------- |
| `block`        | 块级元素，独占一行        |
| `inline`       | 行内元素，不独占一行，宽高不生效 |
| `inline-block` | 行内块，不独占一行，宽高生效   |
| `none`         | 隐藏元素，不占位置        |
| `flex`         | 开启 Flex 布局       |
| `grid`         | 开启 Grid 布局       |

示意：

```txt
block:
[元素1]
[元素2]

inline / inline-block:
[元素1][元素2]
```

## `visibility`

作用：控制元素是否可见。

```css
.box {
  visibility: hidden;
}
```

区别：

```txt
display: none       不显示，不占位置
visibility: hidden  不显示，但占位置
```

## `opacity`

作用：控制透明度。

```css
.box {
  opacity: 0.5;
}
```

常见值：

```css
opacity: 1;   /* 完全不透明 */
opacity: 0.5; /* 半透明 */
opacity: 0;   /* 完全透明，但仍占位置 */
```

---

# 9. Flex 布局属性

Flex 用于一维布局，适合横向或纵向排列。

开启 Flex：

```css
.parent {
  display: flex;
}
```

HTML 示例：

```html
<div class="parent">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

## 父元素属性

这些属性写在 Flex 容器上。

### `flex-direction`

作用：控制主轴方向。

```css
.parent {
  display: flex;
  flex-direction: row;
}
```

常见值：

| 值                | 效果          |
| ---------------- | ----------- |
| `row`            | 横向，从左到右，默认值 |
| `row-reverse`    | 横向，从右到左     |
| `column`         | 纵向，从上到下     |
| `column-reverse` | 纵向，从下到上     |

```txt
row:
[1] [2] [3]

column:
[1]
[2]
[3]
```

### `justify-content`

作用：控制主轴方向上的对齐方式。

```css
.parent {
  display: flex;
  justify-content: center;
}
```

常见值：

| 值               | 效果         |
| --------------- | ---------- |
| `flex-start`    | 靠主轴起点      |
| `flex-end`      | 靠主轴终点      |
| `center`        | 居中         |
| `space-between` | 两端对齐，中间平均分 |
| `space-around`  | 每个元素两侧都有间距 |
| `space-evenly`  | 所有间距完全相等   |

示意：

```txt
flex-start:
[1][2][3]---------

center:
----[1][2][3]----

space-between:
[1]-----[2]-----[3]
```

### `align-items`

作用：控制交叉轴方向上的对齐方式。

```css
.parent {
  display: flex;
  align-items: center;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `stretch` | 拉伸，默认值 |
| `flex-start` | 靠交叉轴起点 |
| `flex-end` | 靠交叉轴终点 |
| `center` | 居中 |
| `baseline` | 按文字基线对齐 |

最常用居中写法：

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### `flex-wrap`

作用：控制子元素是否换行。

```css
.parent {
  display: flex;
  flex-wrap: wrap;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `nowrap` | 不换行，默认值 |
| `wrap` | 换行 |
| `wrap-reverse` | 反向换行 |

### `gap`

作用：控制 Flex 子元素之间的间距。

```css
.parent {
  display: flex;
  gap: 16px;
}
```

比给每个子元素写 `margin-right` 更简单。

## 子元素属性

这些属性写在 Flex 子项上。

### `flex`

作用：控制子元素如何分配剩余空间；`flex:1` 是 `flex-grow:1` `flex-shrink:1` `flex-basis:0%` 缩写

```css
.item {
  flex: 1;
}
```

常见用法：

```css
flex: 1;      /* 平均分配空间 */
flex: none;   /* 不伸缩 */
```

示例：三列等宽。

```css
.parent {
  display: flex;
  gap: 16px;
}

.item {
  flex: 1;
}
```

### `flex-grow`

作用：控制是否放大。

```css
.item {
  flex-grow: 1;
}
```

### `flex-shrink`

作用：控制空间不够时是否缩小；`flex-shrink:1` 表示可以缩小

```css
.item {
  flex-shrink: 0;
}
```

### `flex-basis`

作用：设置子元素在主轴上的初始大小。

```css
.item {
  flex-basis: 200px;
}
```

### `align-self`

作用：单独控制某一个子元素在交叉轴上的对齐方式。

```css
.item-special {
  align-self: flex-end;
}
```

---

# 10. Grid 布局属性

Grid 用于二维布局，适合同时控制行和列。

开启 Grid：

```css
.grid {
  display: grid;
}
```

## `grid-template-columns`

作用：设置列。

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
}
```

常见写法：

```css
grid-template-columns: repeat(3, 1fr);
grid-template-columns: 200px auto;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

## `grid-template-rows`

作用：设置行。

```css
.grid {
  display: grid;
  grid-template-rows: 80px 1fr 60px;
}
```

## `grid-template-areas`

作用：用名字划分网格区域。

```css
.grid {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.header {
  grid-area: header;
}
```

## `gap`

作用：设置网格间距。

```css
.grid {
  display: grid;
  gap: 16px;
}
```

也可以单独设置行间距和列间距：

```css
.grid {
  row-gap: 16px;
  column-gap: 24px;
}
```

## `grid-auto-flow`

作用：控制没有手动指定位置的项目如何自动排列。

```css
.grid {
  grid-auto-flow: row;
}
```

常见值：

```css
grid-auto-flow: row;
grid-auto-flow: column;
grid-auto-flow: dense;
```

## `grid-auto-columns` / `grid-auto-rows`

作用：设置自动生成的列或行的尺寸。

```css
.grid {
  grid-auto-rows: 120px;
}
```

## `justify-items` / `align-items`

作用：控制每个网格项目在自己格子里的对齐方式。

```css
.grid {
  justify-items: center;
  align-items: center;
}
```

常见值：

```css
justify-items: start;
justify-items: center;
justify-items: end;
justify-items: stretch;
```

## `place-items`

作用：`align-items` 和 `justify-items` 的简写。

```css
.grid {
  place-items: center;
}
```

## `justify-content` / `align-content`

作用：当网格整体小于容器时，控制整个网格在容器里的对齐。

```css
.grid {
  justify-content: center;
  align-content: center;
}
```

常见值：

```css
justify-content: start;
justify-content: center;
justify-content: end;
justify-content: space-between;
justify-content: space-around;
justify-content: space-evenly;
```

## Grid 子元素属性

下面这些属性写在每一个 Grid item 上。

### `grid-column`

作用：控制某个元素占几列。

```css
.item {
  grid-column: span 2;
}
```

### `grid-row`

作用：控制某个元素占几行。

```css
.item {
  grid-row: span 2;
}
```

常见写法：

```css
grid-row: 1 / 3;
grid-row: span 2;
```

### `grid-area`

作用：设置某个元素放到指定区域，也可以作为行列位置的简写。

```css
.header {
  grid-area: header;
}
```

位置简写：

```css
.item {
  grid-area: 1 / 1 / 3 / 3;
}
```

含义：

```txt
grid-area: 行开始 / 列开始 / 行结束 / 列结束;
```

### `justify-self` / `align-self`

作用：单独控制某一个 Grid item 在自己格子里的对齐。

```css
.item {
  justify-self: end;
  align-self: center;
}
```

常见值：

```css
justify-self: start;
justify-self: center;
justify-self: end;
justify-self: stretch;
```

### `place-self`

作用：`align-self` 和 `justify-self` 的简写。

```css
.item {
  place-self: center;
}
```

---

# 11. 定位属性

## `position`

作用：控制元素定位方式。

```css
.box {
  position: relative;
}
```

常见值：

| 值          | 效果              |
| ---------- | --------------- |
| `static`   | 默认值，不定位         |
| `relative` | 相对定位，不脱离文档流     |
| `absolute` | 绝对定位，脱离文档流      |
| `fixed`    | 固定定位，相对浏览器窗口    |
| `sticky`   | 粘性定位，滚动到指定位置后固定 |

## `top` / `right` / `bottom` / `left`

作用：配合定位属性移动元素。

```css
.badge {
  position: absolute;
  top: 0;
  right: 0;
}
```

常见角标写法：

```css
.card {
  position: relative;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

## `z-index`

作用：控制层级。

```css
.modal {
  position: fixed;
  z-index: 1000;
}
```

注意：`z-index` 通常要配合 `position` 才明显生效。

---

# 12. 溢出属性

## `overflow`

作用：控制内容超出容器后的表现。

```css
.box {
  overflow: hidden;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `visible` | 默认值，超出也显示 |
| `hidden` | 超出隐藏 |
| `scroll` | 始终显示滚动条 |
| `auto` | 超出时显示滚动条 |

## `overflow-x` / `overflow-y`

作用：单独控制横向和纵向溢出。

```css
.table-wrapper {
  overflow-x: auto;
}
```

常见场景：移动端表格横向滚动。

---

# 13. 阴影属性

## `box-shadow`

作用：设置盒子阴影。

```css
.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
```

格式：

```css
box-shadow: 水平偏移 垂直偏移 模糊半径 阴影颜色;
```

## `text-shadow`

作用：设置文字阴影。

```css
.title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

# 14. 过渡和动画属性

## `transition`

作用：让样式变化更平滑。

```css
.btn {
  background-color: #1677ff;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #0958d9;
}
```

格式：

```css
transition: 属性名 持续时间 运动曲线 延迟时间;
```

常见写法：

```css
transition: all 0.3s;
transition: transform 0.3s ease;
transition: opacity 0.2s;
```

## `transform`

作用：变形，不影响普通文档流。

```css
.card:hover {
  transform: translateY(-4px);
}
```

常见值：

```css
transform: translateX(20px);
transform: translateY(-20px);
transform: scale(1.1);
transform: rotate(45deg);
```

## `animation`

作用：绑定关键帧动画。

```css
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

# 15. 鼠标和交互属性

## `cursor`

作用：设置鼠标样式。

```css
.btn {
  cursor: pointer;
}
```

常见值：

| 值 | 效果 |
| --- | --- |
| `default` | 默认鼠标 |
| `pointer` | 小手，表示可点击 |
| `not-allowed` | 禁止 |
| `move` | 可移动 |
| `text` | 文本选择 |

## `pointer-events`

作用：控制元素是否响应鼠标事件。

```css
.disabled {
  pointer-events: none;
}
```

常用于禁用按钮或遮罩层穿透。

---

# 16. 伪类选择器

伪类不是属性，但非常常用，用来表示元素状态。

## `:hover`

作用：鼠标移入时生效。

```css
.btn:hover {
  background-color: #0958d9;
}
```

## `:focus`

作用：元素获得焦点时生效。

```css
.input:focus {
  border-color: #1677ff;
}
```

## `:active`

作用：鼠标按下时生效。

```css
.btn:active {
  transform: scale(0.98);
}
```

## `:first-child`

作用：选择第一个子元素。

```css
.list-item:first-child {
  color: red;
}
```

## `:last-child`

作用：选择最后一个子元素。

```css
.list-item:last-child {
  border-bottom: none;
}
```

## `:nth-child()`

作用：选择第几个子元素。

```css
.list-item:nth-child(2) {
  color: blue;
}
```

隔行变色：

```css
.table-row:nth-child(even) {
  background-color: #f5f5f5;
}
```

---

# 17. 伪元素选择器

伪元素用于创建或选择元素的一部分。

## `::before`

作用：在元素内容前插入内容。

```css
.title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 16px;
  margin-right: 8px;
  background-color: #1677ff;
}
```

## `::after`

作用：在元素内容后插入内容。

```css
.link::after {
  content: ">";
  margin-left: 4px;
}
```

注意：`::before` 和 `::after` 必须写 `content` 才会显示。

---

# 18. 常用完整示例

下面代码可以直接保存为 `.html` 文件运行。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 属性基础示例</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      background-color: #f5f7fa;
      color: #1f2937;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .card-list {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .card {
      flex: 1;
      min-width: 240px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .card-title {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 700;
    }

    .card-text {
      margin: 0;
      line-height: 1.8;
      color: #6b7280;
    }

    .btn {
      margin-top: 16px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      color: #fff;
      background-color: #1677ff;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn:hover {
      background-color: #0958d9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card-list">
      <div class="card">
        <h2 class="card-title">边框属性</h2>
        <p class="card-text">border 控制边框，border-radius 控制圆角。</p>
        <button class="btn">查看</button>
      </div>

      <div class="card">
        <h2 class="card-title">Flex 布局</h2>
        <p class="card-text">display: flex 可以让子元素横向或纵向排列。</p>
        <button class="btn">查看</button>
      </div>

      <div class="card">
        <h2 class="card-title">过渡效果</h2>
        <p class="card-text">transition 可以让 hover 效果更平滑。</p>
        <button class="btn">查看</button>
      </div>
    </div>
  </div>
</body>
</html>
```

---

# 19. 快速复习表

| 知识点 | 常用属性名 |
| --- | --- |
| 宽高 | `width`、`height`、`min-width`、`max-width`、`min-height`、`max-height` |
| 外边距 | `margin`、`margin-top`、`margin-right`、`margin-bottom`、`margin-left` |
| 内边距 | `padding`、`padding-top`、`padding-right`、`padding-bottom`、`padding-left` |
| 边框 | `border`、`border-width`、`border-style`、`border-color`、`border-radius` |
| 盒模型 | `box-sizing` |
| 背景 | `background-color`、`background-image`、`background-size`、`background-position`、`background-repeat` |
| 字体 | `font-size`、`font-weight`、`font-family` |
| 文本 | `color`、`text-align`、`line-height`、`text-decoration`、`white-space`、`text-overflow`、`font-style`、`text-indent`、`letter-spacing`、`word-break`、`overflow-wrap`、`vertical-align`、`list-style` |
| 显示 | `display`、`visibility`、`opacity` |
| Flex 父元素 | `flex-direction`、`justify-content`、`align-items`、`flex-wrap`、`gap` |
| Flex 子元素 | `flex`、`flex-grow`、`flex-shrink`、`flex-basis`、`align-self` |
| Grid | `grid-template-columns`、`grid-template-rows`、`grid-template-areas`、`grid-auto-flow`、`grid-auto-columns`、`grid-auto-rows`、`justify-items`、`align-items`、`place-items`、`justify-content`、`align-content`、`grid-column`、`grid-row`、`grid-area`、`justify-self`、`align-self`、`place-self`、`gap` |
| 定位 | `position`、`top`、`right`、`bottom`、`left`、`z-index` |
| 溢出 | `overflow`、`overflow-x`、`overflow-y` |
| 阴影 | `box-shadow`、`text-shadow` |
| 动画 | `transition`、`transform`、`animation` |
| 鼠标 | `cursor`、`pointer-events` |
| 表格 | `table-layout`、`border-collapse`、`border-spacing` |
| 其他常用 | `outline`、`resize`、`user-select`、`aspect-ratio`、`object-fit`、`container-type`、`container-name` |
| 响应式/动画 | `@media`、`@container`、`@keyframes` |

---

# 20. 其他常用属性

## `outline`

作用：设置轮廓线，常用于焦点态。

```css
.input:focus {
  outline: 2px solid #1677ff;
}
```

## `resize`

作用：控制文本域是否可拖拽缩放。

```css
textarea {
  resize: vertical;
}
```

常见值：

```css
resize: none;
resize: both;
resize: horizontal;
resize: vertical;
```

## `user-select`

作用：控制文本是否可选中。

```css
.no-select {
  user-select: none;
}
```

## `aspect-ratio`

作用：设置宽高比。

```css
.thumb {
  aspect-ratio: 16 / 9;
}
```

## `object-fit`

作用：控制图片或视频在固定容器里的显示方式。

```css
.cover {
  width: 240px;
  height: 160px;
  object-fit: cover;
}
```

常见值：

```css
object-fit: fill;
object-fit: contain;
object-fit: cover;
object-fit: none;
object-fit: scale-down;
```

## `table-layout`

作用：控制表格布局方式。

```css
table {
  table-layout: fixed;
}
```

## `border-collapse`

作用：控制表格边框是否合并。

```css
table {
  border-collapse: collapse;
}
```

## `border-spacing`

作用：控制表格单元格间距。

```css
table {
  border-spacing: 8px;
}
```

---

# 21. 媒体查询 `@media`

作用：根据屏幕宽度、设备特性、显示条件应用不同样式。

## 基本写法

```css
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}
```

## 常见断点

```css
@media (max-width: 1200px) { }
@media (max-width: 992px) { }
@media (max-width: 768px) { }
@media (max-width: 576px) { }
```

## 常见条件

```css
@media screen and (max-width: 768px) { }
@media print { }
@media (orientation: landscape) { }
@media (prefers-color-scheme: dark) { }
@media (hover: hover) { }
```

## 常见写法示例

```css
.container {
  width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0 16px;
  }
}
```

---

# 22. 容器查询 `@container`

作用：根据容器本身的尺寸变化应用不同样式。

## 基本写法

```css
.card-list {
  container-type: inline-size;
}

@container (max-width: 600px) {
  .card {
    flex-direction: column;
  }
}
```

## 常用属性

```css
container-type: inline-size;
container-type: size;
container-name: card;
```

## 常见容器单位

| 单位 | 含义 |
| --- | --- |
| `cqw` | 容器宽度的 1% |
| `cqh` | 容器高度的 1% |
| `cqi` | 容器内联轴的 1% |
| `cqb` | 容器块轴的 1% |
| `cqmin` | 容器较小边的 1% |
| `cqmax` | 容器较大边的 1% |

---

# 23. 关键帧动画 `@keyframes`

作用：定义动画过程，配合 `animation` 使用。

## 基本写法

```css
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## 关键帧写法

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 常用 `animation` 属性

| 属性 | 作用 |
| --- | --- |
| `animation-name` | 动画名称 |
| `animation-duration` | 动画持续时间 |
| `animation-timing-function` | 动画速度曲线 |
| `animation-delay` | 动画延迟时间 |
| `animation-iteration-count` | 播放次数 |
| `animation-direction` | 播放方向 |
| `animation-fill-mode` | 动画结束后的状态 |
| `animation-play-state` | 播放或暂停 |

常见写法：

```css
.box {
  animation: fadeIn 0.4s ease forwards;
}
```

---

# 24. 重点属性值与效果速查

这一章专门用来背属性值。复习时重点看：**属性名、属性值、最终效果**。

---

## 24.1 尺寸单位

| 单位 | 含义 | 示例 | 常见场景 |
| --- | --- | --- | --- |
| `px` | 像素，固定单位 | `width: 200px;` | 边框、间距、按钮高度 |
| `%` | 相对父元素 | `width: 50%;` | 宽度自适应 |
| `em` | 相对当前元素字体大小 | `padding: 1em;` | 跟随字号变化 |
| `rem` | 相对根元素字体大小 | `font-size: 1rem;` | 移动端、统一字号 |
| `vw` | 视口宽度的百分比 | `width: 100vw;` | 全屏宽度 |
| `vh` | 视口高度的百分比 | `height: 100vh;` | 登录页、首屏 |
| `vmin` | 视口较小边的百分比 | `width: 50vmin;` | 等比适配 |
| `vmax` | 视口较大边的百分比 | `width: 50vmax;` | 少量场景 |
| `auto` | 浏览器自动计算 | `width: auto;` | 默认宽高、自动外边距 |

---

## 24.2 `display` 的值和效果

| 属性值 | 效果 |
| --- | --- |
| `block` | 块级元素，独占一行，可以设置宽高 |
| `inline` | 行内元素，不独占一行，设置宽高通常无效 |
| `inline-block` | 行内块，不独占一行，可以设置宽高 |
| `none` | 隐藏元素，不显示，也不占位置 |
| `flex` | 开启 Flex 布局，子元素按主轴排列 |
| `inline-flex` | 行内 Flex 容器，不独占一行 |
| `grid` | 开启 Grid 网格布局 |
| `inline-grid` | 行内 Grid 容器 |
| `table` | 让元素表现得像表格 |

---

## 24.3 `position` 的值和效果

| 属性值 | 是否脱离文档流 | 参照对象 | 效果 |
| --- | --- | --- | --- |
| `static` | 否 | 正常文档流 | 默认值，不能用 `top/right/bottom/left` 调整 |
| `relative` | 否 | 自己原来的位置 | 相对自身移动，原位置仍占着 |
| `absolute` | 是 | 最近的定位祖先 | 常用于角标、弹层内部定位 |
| `fixed` | 是 | 浏览器视口 | 常用于返回顶部、固定导航、弹窗遮罩 |
| `sticky` | 否/类似固定 | 滚动容器 | 滚动到指定位置后吸顶或固定 |

---

## 24.4 `float` 和 `clear`

| 属性 | 属性值 | 效果 |
| --- | --- | --- |
| `float` | `left` | 元素向左浮动 |
| `float` | `right` | 元素向右浮动 |
| `float` | `none` | 不浮动，默认值 |
| `clear` | `left` | 不允许左侧有浮动元素 |
| `clear` | `right` | 不允许右侧有浮动元素 |
| `clear` | `both` | 左右两侧都不允许有浮动元素 |

---

## 24.5 `box-sizing`

| 属性值 | 效果 |
| --- | --- |
| `content-box` | 默认值，`width` 只包含内容区 |
| `border-box` | `width` 包含内容、`padding`、`border` |

---

## 24.6 边框属性值

### `border-style`

| 属性值 | 效果 |
| --- | --- |
| `none` | 无边框 |
| `solid` | 实线 |
| `dashed` | 虚线 |
| `dotted` | 点线 |
| `double` | 双实线 |

### `border-radius`

| 写法 | 效果 |
| --- | --- |
| `border-radius: 4px;` | 四个角都是 4px 圆角 |
| `border-radius: 50%;` | 常用于正方形变圆形 |
| `border-radius: 999px;` | 常用于胶囊按钮 |

---

## 24.7 背景属性值

### `background-size`

| 属性值 | 效果 |
| --- | --- |
| `auto` | 图片原始尺寸 |
| `cover` | 铺满容器，图片可能被裁剪 |
| `contain` | 完整显示图片，容器可能留白 |
| `100% 100%` | 强行拉伸铺满，可能变形 |

### `background-position`

| 属性值 | 效果 |
| --- | --- |
| `left top` | 左上角 |
| `center` | 居中 |
| `right bottom` | 右下角 |

### `background-repeat`

| 属性值 | 效果 |
| --- | --- |
| `repeat` | 默认值 |
| `no-repeat` | 不重复 |
| `repeat-x` | 只横向重复 |
| `repeat-y` | 只纵向重复 |

---

## 24.8 文本属性值

### `font-weight`

| 属性值 | 效果 |
| --- | --- |
| `normal` / `400` | 正常粗细 |
| `bold` / `700` | 加粗 |

### `text-align`

| 属性值 | 效果 |
| --- | --- |
| `left` | 左对齐 |
| `center` | 居中 |
| `right` | 右对齐 |
| `justify` | 两端对齐 |

### `text-decoration`

| 属性值 | 效果 |
| --- | --- |
| `none` | 无装饰线 |
| `underline` | 下划线 |
| `line-through` | 删除线 |
| `overline` | 上划线 |

### `white-space`

| 属性值 | 效果 |
| --- | --- |
| `normal` | 默认，空白合并，自动换行 |
| `nowrap` | 不换行 |
| `pre` | 保留空白和换行 |
| `pre-wrap` | 保留空白和换行，同时允许自动换行 |

### `text-overflow`

| 属性值 | 效果 |
| --- | --- |
| `clip` | 直接裁剪 |
| `ellipsis` | 超出显示省略号 |

---

## 24.9 `overflow`

| 属性值 | 效果 |
| --- | --- |
| `visible` | 默认值，超出内容仍然显示 |
| `hidden` | 超出部分隐藏 |
| `scroll` | 始终显示滚动条 |
| `auto` | 超出时才显示滚动条 |

---

## 24.10 Flex 父元素属性值

### `flex-direction`

| 属性值 | 主轴方向 | 效果 |
| --- | --- | --- |
| `row` | 水平，从左到右 | 默认值，横向排列 |
| `row-reverse` | 水平，从右到左 | 横向反向排列 |
| `column` | 垂直，从上到下 | 纵向排列 |
| `column-reverse` | 垂直，从下到上 | 纵向反向排列 |

### `justify-content`

| 属性值 | 效果 |
| --- | --- |
| `flex-start` | 靠主轴起点 |
| `flex-end` | 靠主轴终点 |
| `center` | 主轴居中 |
| `space-between` | 两端贴边，中间间距平均 |
| `space-around` | 每个元素左右都有间距 |
| `space-evenly` | 所有间距完全相等 |

### `align-items`

| 属性值 | 效果 |
| --- | --- |
| `stretch` | 默认值，子元素在交叉轴方向拉伸 |
| `flex-start` | 靠交叉轴起点 |
| `flex-end` | 靠交叉轴终点 |
| `center` | 交叉轴居中 |
| `baseline` | 按文字基线对齐 |

### `flex-wrap`

| 属性值 | 效果 |
| --- | --- |
| `nowrap` | 不换行，默认值 |
| `wrap` | 空间不够时换行 |
| `wrap-reverse` | 反向换行 |

---

## 24.11 Flex 子元素属性值

### `flex`

| 写法 | 效果 |
| --- | --- |
| `flex: 1;` | 平均分配剩余空间 |
| `flex: none;` | 不放大、不缩小 |
| `flex: 0 0 200px;` | 不放大、不缩小，基础宽度 200px |

### `flex-grow`

| 属性值 | 效果 |
| --- | --- |
| `0` | 不放大 |
| `1` | 参与分配剩余空间 |

### `flex-shrink`

| 属性值 | 效果 |
| --- | --- |
| `1` | 允许缩小 |
| `0` | 不允许缩小 |

### `flex-basis`

| 属性值 | 效果 |
| --- | --- |
| `auto` | 自动计算 |
| `200px` | 初始主轴尺寸为 200px |
| `50%` | 初始主轴尺寸为父容器的一半 |

### `align-self`

| 属性值 | 效果 |
| --- | --- |
| `auto` | 继承父元素的 `align-items` |
| `flex-start` | 单独靠交叉轴起点 |
| `flex-end` | 单独靠交叉轴终点 |
| `center` | 单独交叉轴居中 |
| `stretch` | 单独拉伸 |

---

## 24.12 Grid 常用属性值

### 容器

| 属性 | 常见值 |
| --- | --- |
| `grid-template-columns` | `100px 200px`、`1fr 1fr 1fr`、`repeat(3, 1fr)`、`repeat(auto-fit, minmax(200px, 1fr))` |
| `grid-template-rows` | `80px 1fr 60px` |
| `grid-template-areas` | `"header header"`、`"sidebar main"` |
| `grid-auto-flow` | `row`、`column`、`dense` |
| `grid-auto-columns` / `grid-auto-rows` | `120px`、`1fr` |
| `justify-items` / `align-items` | `start`、`center`、`end`、`stretch` |
| `place-items` | `center` |
| `justify-content` / `align-content` | `start`、`center`、`end`、`space-between`、`space-around`、`space-evenly` |

### 子元素

| 属性 | 常见值 |
| --- | --- |
| `grid-column` | `span 2`、`1 / 3` |
| `grid-row` | `span 2`、`1 / 3` |
| `grid-area` | `header`、`1 / 1 / 3 / 3` |
| `justify-self` / `align-self` | `start`、`center`、`end`、`stretch` |
| `place-self` | `center` |

---

## 24.13 对齐属性值

| 属性 | 常见值 |
| --- | --- |
| `justify-content` | `start`、`center`、`end`、`space-between` |
| `align-items` | `start`、`center`、`end`、`stretch` |
| `place-items` | `center` |

---

## 24.14 `object-fit`

| 属性值 | 效果 |
| --- | --- |
| `fill` | 拉伸填满，可能变形 |
| `contain` | 完整显示，可能留白 |
| `cover` | 填满容器，可能裁剪 |
| `none` | 保持原始尺寸 |
| `scale-down` | 在 `none` 和 `contain` 中选择较小效果 |

---

## 24.15 `transform`

| 函数 | 效果 |
| --- | --- |
| `translateX(20px)` | 沿 X 轴移动 |
| `translateY(-20px)` | 沿 Y 轴移动 |
| `translate(20px, 10px)` | 同时移动 |
| `scale(1.2)` | 放大 |
| `rotate(45deg)` | 旋转 |
| `skew(10deg)` | 倾斜 |

---

## 24.16 `transition`

| 部分 | 示例 |
| --- | --- |
| 属性名 | `all`、`opacity`、`transform` |
| 持续时间 | `0.3s`、`300ms` |
| 运动曲线 | `linear`、`ease`、`ease-in`、`ease-out` |
| 延迟时间 | `0.2s` |

---

## 24.17 `cursor`

| 属性值 | 效果 |
| --- | --- |
| `default` | 默认箭头 |
| `pointer` | 小手 |
| `text` | 文本选择光标 |
| `move` | 移动光标 |
| `not-allowed` | 禁止操作 |
| `wait` | 等待 |
| `grab` | 可抓取 |
| `zoom-in` | 放大 |

---

## 24.18 常见隐藏方式对比

| 写法 | 是否可见 | 是否占位置 | 是否能点击 |
| --- | --- | --- | --- |
| `display: none;` | 否 | 否 | 否 |
| `visibility: hidden;` | 否 | 是 | 否 |
| `opacity: 0;` | 否 | 是 | 通常还能点击 |


