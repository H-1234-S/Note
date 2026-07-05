# CSS 常用类名基础笔记

这份笔记只用来快速回顾：**常见 CSS 类名通常叫什么、用来做什么、会产生什么效果**。

类名本身不是 CSS 内置语法，而是开发者给 HTML 元素起的名字。真正产生效果的是 CSS 里对这个类名写的样式。

```html
<button class="btn btn-primary">提交</button>
```

```css
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}

.btn-primary {
  color: #fff;
  background: #1677ff;
}
```

上面表示：

- `.btn`：基础按钮样式。
- `.btn-primary`：主要按钮样式。
- 一个元素可以同时拥有多个类名。

---

# 1. 页面容器类

页面容器类通常用来控制页面宽度、居中、内边距和整体布局。

## `.container`

用途：页面主容器，让内容居中，并限制最大宽度。

效果：内容不会铺满整个屏幕，常用于首页、详情页、文章页。

```html
<div class="container">
  <h1>文章标题</h1>
  <p>这里是文章内容。</p>
</div>
```

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
```

结构示意：

```txt
浏览器宽度
|------------------------------------------------|
        |------------------------------|
        |          container           |
        |------------------------------|
```

## `.wrapper`

用途：包裹一块区域，常用于页面某个模块的外层。

效果：可以统一控制模块的宽度、背景、边距。

```html
<section class="wrapper">
  <h2>热门商品</h2>
  <div>商品列表</div>
</section>
```

```css
.wrapper {
  padding: 40px 0;
  background: #f5f7fa;
}
```

## `.main`

用途：页面主要内容区域。

效果：语义清晰，常和 `.header`、`.sidebar`、`.footer` 搭配。

```html
<main class="main">
  <h1>主内容</h1>
</main>
```

```css
.main {
  min-height: 600px;
  padding: 24px;
}
```

## `.section`

用途：页面中的一个内容区块。

效果：给每个大模块统一上下间距。

```html
<section class="section">
  <h2>服务介绍</h2>
  <p>这里展示服务内容。</p>
</section>
```

```css
.section {
  padding: 48px 0;
}
```

---

# 2. 布局类

布局类用来控制元素排列方式，最常见的是 Flex 布局。

## `.flex`

用途：让子元素横向排列。

效果：子元素默认从左到右排成一行。

```html
<div class="flex">
  <div>左侧</div>
  <div>右侧</div>
</div>
```

```css
.flex {
  display: flex;
}
```

```txt
普通块级元素：
[左侧]
[右侧]

使用 flex：
[左侧] [右侧]
```

## `.flex-center`

用途：让内容水平垂直居中。

效果：常用于图标按钮、空状态、弹窗内容居中。

```html
<div class="flex-center">
  居中内容
</div>
```

```css
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## `.justify-between`

用途：让子元素两端对齐。

效果：常用于标题栏、导航栏、卡片头部。

```html
<div class="flex justify-between">
  <span>订单信息</span>
  <button>更多</button>
</div>
```

```css
.justify-between {
  justify-content: space-between;
}
```

```txt
[订单信息]                         [更多]
```

## `.align-center`

用途：让 Flex 子元素在交叉轴上居中。

效果：横向布局中通常表现为垂直居中。

```html
<div class="flex align-center">
  <img src="avatar.png" alt="头像">
  <span>用户名</span>
</div>
```

```css
.align-center {
  align-items: center;
}
```

## `.grid`

用途：创建网格布局。

效果：适合商品列表、图片墙、后台卡片列表。

```html
<div class="grid">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

## `.row`

用途：表示一行内容。

效果：通常配合 `.col` 使用。

```html
<div class="row">
  <div class="col">左列</div>
  <div class="col">右列</div>
</div>
```

```css
.row {
  display: flex;
  gap: 16px;
}
```

## `.col`

用途：表示一列内容。

效果：在 `.row` 中平均分配宽度。

```css
.col {
  flex: 1;
}
```

---

# 3. 文本类

文本类用来控制文字大小、颜色、粗细、对齐和省略。

## `.title`

用途：标题文字。

效果：字体更大、更粗。

```html
<h2 class="title">商品标题</h2>
```

```css
.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}
```

## `.subtitle`

用途：副标题。

效果：比标题小，通常颜色更浅。

```html
<p class="subtitle">这是补充说明文字</p>
```

```css
.subtitle {
  font-size: 16px;
  color: #6b7280;
}
```

## `.text`

用途：普通正文。

效果：设置基础字号和行高。

```html
<p class="text">这是一段正文内容。</p>
```

```css
.text {
  font-size: 14px;
  line-height: 1.8;
  color: #374151;
}
```

## `.text-muted`

用途：弱化文字。

效果：颜色变浅，常用于备注、时间、说明。

```html
<span class="text-muted">2026-07-05</span>
```

```css
.text-muted {
  color: #9ca3af;
}
```

## `.text-center`

用途：文字居中。

效果：文本水平居中。

```html
<p class="text-center">暂无数据</p>
```

```css
.text-center {
  text-align: center;
}
```

## `.text-right`

用途：文字右对齐。

效果：常用于价格、金额、表格数字。

```html
<td class="text-right">￥199.00</td>
```

```css
.text-right {
  text-align: right;
}
```

## `.ellipsis`

用途：单行文本超出后显示省略号。

效果：文本太长时显示 `...`。

```html
<p class="ellipsis">这是一段非常非常长的商品标题，超出后会省略</p>
```

```css
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

---

# 4. 按钮类

按钮类通常分为基础按钮、主要按钮、次要按钮、危险按钮、禁用按钮。

## `.btn`

用途：基础按钮类。

效果：清除默认边框，设置内边距、圆角、鼠标样式。

```html
<button class="btn">普通按钮</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
```

## `.btn-primary`

用途：主要操作按钮。

效果：通常是蓝色或品牌色，用于提交、确认、保存。

```html
<button class="btn btn-primary">保存</button>
```

```css
.btn-primary {
  color: #fff;
  background: #1677ff;
}
```

## `.btn-secondary`

用途：次要按钮。

效果：视觉弱于主要按钮，常用于取消、返回。

```html
<button class="btn btn-secondary">取消</button>
```

```css
.btn-secondary {
  color: #374151;
  background: #f3f4f6;
  border-color: #d1d5db;
}
```

## `.btn-danger`

用途：危险操作按钮。

效果：通常是红色，用于删除、移除、清空。

```html
<button class="btn btn-danger">删除</button>
```

```css
.btn-danger {
  color: #fff;
  background: #ef4444;
}
```

## `.btn-block`

用途：块级按钮。

效果：按钮宽度占满父容器。

```html
<button class="btn btn-primary btn-block">登录</button>
```

```css
.btn-block {
  width: 100%;
}
```

## `.disabled`

用途：禁用状态。

效果：颜色变浅，鼠标不能点击。

```html
<button class="btn btn-primary disabled">提交中</button>
```

```css
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

# 5. 卡片类

卡片类常用于商品卡片、文章卡片、后台统计卡片。

## `.card`

用途：卡片容器。

效果：有背景、边框、圆角、阴影。

```html
<div class="card">
  <h3>用户数量</h3>
  <p>1280</p>
</div>
```

```css
.card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

## `.card-header`

用途：卡片头部。

效果：放标题、操作按钮。

```html
<div class="card">
  <div class="card-header">
    <h3>订单信息</h3>
    <button>刷新</button>
  </div>
</div>
```

```css
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
```

## `.card-body`

用途：卡片主体内容。

效果：放主要数据、列表、表单。

```html
<div class="card-body">
  <p>这里是卡片主体内容。</p>
</div>
```

```css
.card-body {
  font-size: 14px;
  color: #374151;
}
```

## `.card-footer`

用途：卡片底部。

效果：常放按钮、说明、链接。

```html
<div class="card-footer">
  <button class="btn btn-primary">查看详情</button>
</div>
```

```css
.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
```

---

# 6. 表单类

表单类用于输入框、标签、错误提示、表单项布局。

## `.form`

用途：表单整体容器。

效果：统一控制表单宽度和间距。

```html
<form class="form">
  <input class="input" placeholder="请输入用户名">
</form>
```

```css
.form {
  max-width: 400px;
}
```

## `.form-item`

用途：一个表单项。

效果：每个输入区域之间有间距。

```html
<div class="form-item">
  <label class="label">用户名</label>
  <input class="input">
</div>
```

```css
.form-item {
  margin-bottom: 16px;
}
```

## `.label`

用途：输入框标题。

效果：提示用户这个输入框要填什么。

```css
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #374151;
}
```

## `.input`

用途：输入框基础样式。

效果：统一高度、边框、内边距。

```html
<input class="input" placeholder="请输入手机号">
```

```css
.input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
}
```

## `.input:focus`

用途：输入框聚焦状态。

效果：点击输入框时边框变成高亮色。

```css
.input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12);
}
```

## `.error`

用途：错误提示文字。

效果：显示为红色。

```html
<p class="error">手机号格式不正确</p>
```

```css
.error {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}
```

---

# 7. 导航类

导航类用于顶部导航、菜单、侧边栏。

## `.navbar`

用途：顶部导航栏。

效果：横向排列 logo 和菜单。

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <div class="nav-menu">
    <a class="nav-link" href="#">首页</a>
    <a class="nav-link" href="#">订单</a>
  </div>
</nav>
```

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
}
```

## `.logo`

用途：网站或系统标识。

效果：通常字体更粗、更醒目。

```css
.logo {
  font-size: 20px;
  font-weight: 700;
}
```

## `.nav-menu`

用途：导航菜单容器。

效果：让多个导航项横向排列。

```css
.nav-menu {
  display: flex;
  gap: 20px;
}
```

## `.nav-link`

用途：导航链接。

效果：设置链接颜色，去掉下划线。

```css
.nav-link {
  color: #374151;
  text-decoration: none;
}
```

## `.active`

用途：当前激活项。

效果：高亮当前页面或当前选中的菜单。

```html
<a class="nav-link active" href="#">首页</a>
```

```css
.active {
  color: #1677ff;
  font-weight: 600;
}
```

---

# 8. 列表类

列表类用于文章列表、商品列表、消息列表。

## `.list`

用途：列表容器。

效果：去掉默认列表样式。

```html
<ul class="list">
  <li class="list-item">消息 1</li>
  <li class="list-item">消息 2</li>
</ul>
```

```css
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
```

## `.list-item`

用途：列表中的每一项。

效果：控制每一项的间距和分割线。

```css
.list-item {
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}
```

## `.media`

用途：左图右文布局。

效果：常用于评论、消息、商品简略信息。

```html
<div class="media">
  <img class="avatar" src="avatar.png" alt="头像">
  <div class="media-body">
    <h4>用户名</h4>
    <p>评论内容</p>
  </div>
</div>
```

```css
.media {
  display: flex;
  gap: 12px;
}

.media-body {
  flex: 1;
}
```

## `.avatar`

用途：头像。

效果：固定大小，圆形显示。

```css
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
```

---

# 9. 状态类

状态类通常表示元素当前的业务状态。

## `.is-active`

用途：激活状态。

效果：表示当前选中。

```html
<button class="tab is-active">全部</button>
```

```css
.is-active {
  color: #1677ff;
  border-color: #1677ff;
}
```

## `.is-disabled`

用途：禁用状态。

效果：元素变灰，不能点击。

```html
<button class="btn is-disabled">不可点击</button>
```

```css
.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## `.is-loading`

用途：加载状态。

效果：表示正在请求数据或提交中。

```html
<button class="btn btn-primary is-loading">提交中...</button>
```

```css
.is-loading {
  opacity: 0.7;
  cursor: wait;
}
```

## `.is-success`

用途：成功状态。

效果：通常显示绿色。

```html
<span class="badge is-success">成功</span>
```

```css
.is-success {
  color: #16a34a;
  background: #dcfce7;
}
```

## `.is-error`

用途：错误状态。

效果：通常显示红色。

```html
<span class="badge is-error">失败</span>
```

```css
.is-error {
  color: #dc2626;
  background: #fee2e2;
}
```

## `.is-warning`

用途：警告状态。

效果：通常显示黄色或橙色。

```html
<span class="badge is-warning">待处理</span>
```

```css
.is-warning {
  color: #b45309;
  background: #fef3c7;
}
```

---

# 10. 标签和徽章类

标签类用于展示状态、分类、数量。

## `.tag`

用途：普通标签。

效果：小块背景，展示分类。

```html
<span class="tag">前端</span>
```

```css
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
}
```

## `.badge`

用途：徽章。

效果：展示状态或数量。

```html
<span class="badge">99+</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 12px;
  background: #ef4444;
  color: #fff;
}
```

---

# 11. 间距工具类

工具类通常只做一件事，比如控制 margin、padding、显示隐藏。

## `.mt-16`

用途：上外边距 16px。

效果：让元素和上方内容拉开距离。

```html
<div class="mt-16">距离上方 16px</div>
```

```css
.mt-16 {
  margin-top: 16px;
}
```

## `.mb-16`

用途：下外边距 16px。

```css
.mb-16 {
  margin-bottom: 16px;
}
```

## `.ml-8`

用途：左外边距 8px。

```css
.ml-8 {
  margin-left: 8px;
}
```

## `.mr-8`

用途：右外边距 8px。

```css
.mr-8 {
  margin-right: 8px;
}
```

## `.p-16`

用途：四个方向内边距 16px。

```css
.p-16 {
  padding: 16px;
}
```

## `.px-16`

用途：左右内边距 16px。

```css
.px-16 {
  padding-left: 16px;
  padding-right: 16px;
}
```

## `.py-16`

用途：上下内边距 16px。

```css
.py-16 {
  padding-top: 16px;
  padding-bottom: 16px;
}
```

命名规律：

```txt
m  = margin
p  = padding
t  = top
r  = right
b  = bottom
l  = left
x  = left + right
y  = top + bottom
```

---

# 12. 显示隐藏类

## `.hidden`

用途：隐藏元素。

效果：元素不显示，也不占位置。

```html
<div class="hidden">看不见</div>
```

```css
.hidden {
  display: none;
}
```

## `.invisible`

用途：让元素不可见。

效果：元素看不见，但仍然占位置。

```css
.invisible {
  visibility: hidden;
}
```

## `.block`

用途：变成块级元素。

效果：独占一行，可以设置宽高。

```css
.block {
  display: block;
}
```

## `.inline-block`

用途：变成行内块元素。

效果：不独占一行，又可以设置宽高。

```css
.inline-block {
  display: inline-block;
}
```

---

# 13. 定位类

## `.relative`

用途：相对定位。

效果：常作为绝对定位子元素的参考容器。

```html
<div class="relative">
  <span class="absolute">角标</span>
</div>
```

```css
.relative {
  position: relative;
}
```

## `.absolute`

用途：绝对定位。

效果：脱离普通文档流，可以精确放到某个位置。

```css
.absolute {
  position: absolute;
  top: 0;
  right: 0;
}
```

## `.fixed`

用途：固定定位。

效果：固定在浏览器窗口某个位置。

```html
<button class="fixed">返回顶部</button>
```

```css
.fixed {
  position: fixed;
  right: 24px;
  bottom: 24px;
}
```

## `.sticky`

用途：粘性定位。

效果：滚动到指定位置后吸顶。

```css
.sticky {
  position: sticky;
  top: 0;
}
```

---

# 14. 尺寸类

## `.w-full`

用途：宽度占满父元素。

```css
.w-full {
  width: 100%;
}
```

## `.h-full`

用途：高度占满父元素。

```css
.h-full {
  height: 100%;
}
```

## `.min-h-screen`

用途：最小高度等于屏幕高度。

效果：常用于登录页、空状态页。

```css
.min-h-screen {
  min-height: 100vh;
}
```

---

# 15. 颜色类

## `.text-primary`

用途：主要文字颜色。

```css
.text-primary {
  color: #1677ff;
}
```

## `.text-danger`

用途：危险、错误文字颜色。

```css
.text-danger {
  color: #ef4444;
}
```

## `.bg-primary`

用途：主要背景色。

```css
.bg-primary {
  background: #1677ff;
}
```

## `.bg-light`

用途：浅色背景。

```css
.bg-light {
  background: #f5f7fa;
}
```

---

# 16. 常见组合示例

下面是一个可以直接运行的小示例，把上面的类名组合起来使用。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 类名示例</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      color: #1f2937;
    }

    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 24px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
    }

    .logo {
      font-size: 20px;
      font-weight: 700;
    }

    .nav-menu {
      display: flex;
      gap: 20px;
    }

    .nav-link {
      color: #374151;
      text-decoration: none;
    }

    .active {
      color: #1677ff;
      font-weight: 600;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .card {
      padding: 20px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }

    .text-muted {
      color: #9ca3af;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: 1px solid transparent;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }

    .btn-primary {
      color: #fff;
      background: #1677ff;
    }

    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #f3f4f6;
      color: #374151;
    }

    .mt-16 {
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">Admin</div>
    <div class="nav-menu">
      <a class="nav-link active" href="#">首页</a>
      <a class="nav-link" href="#">订单</a>
      <a class="nav-link" href="#">用户</a>
    </div>
  </nav>

  <div class="container">
    <div class="grid">
      <div class="card">
        <div class="card-header">
          <h3 class="title">销售额</h3>
          <span class="tag">今日</span>
        </div>
        <p class="text-muted">￥12,800</p>
        <button class="btn btn-primary mt-16">查看详情</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="title">订单数</h3>
          <span class="tag">本周</span>
        </div>
        <p class="text-muted">356 单</p>
        <button class="btn btn-primary mt-16">查看详情</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="title">新增用户</h3>
          <span class="tag">本月</span>
        </div>
        <p class="text-muted">1,024 人</p>
        <button class="btn btn-primary mt-16">查看详情</button>
      </div>
    </div>
  </div>
</body>
</html>
```

---

# 17. 快速复习表

| 类名 | 常见作用 |
| --- | --- |
| `.container` | 页面内容居中，限制最大宽度 |
| `.wrapper` | 模块外层包裹容器 |
| `.main` | 页面主体区域 |
| `.section` | 页面区块 |
| `.flex` | 开启 Flex 布局 |
| `.flex-center` | 水平垂直居中 |
| `.justify-between` | 两端对齐 |
| `.align-center` | 垂直居中 |
| `.grid` | 开启 Grid 网格布局 |
| `.row` | 行布局 |
| `.col` | 列布局 |
| `.title` | 标题文字 |
| `.subtitle` | 副标题文字 |
| `.text` | 普通正文 |
| `.text-muted` | 弱化文字 |
| `.text-center` | 文字居中 |
| `.ellipsis` | 单行省略号 |
| `.btn` | 基础按钮 |
| `.btn-primary` | 主要按钮 |
| `.btn-secondary` | 次要按钮 |
| `.btn-danger` | 危险按钮 |
| `.card` | 卡片容器 |
| `.card-header` | 卡片头部 |
| `.card-body` | 卡片主体 |
| `.card-footer` | 卡片底部 |
| `.form` | 表单容器 |
| `.form-item` | 表单项 |
| `.label` | 表单标签 |
| `.input` | 输入框 |
| `.error` | 错误提示 |
| `.navbar` | 导航栏 |
| `.nav-menu` | 导航菜单 |
| `.nav-link` | 导航链接 |
| `.active` | 激活状态 |
| `.list` | 列表容器 |
| `.list-item` | 列表项 |
| `.avatar` | 头像 |
| `.tag` | 标签 |
| `.badge` | 徽章 |
| `.hidden` | 隐藏且不占位 |
| `.invisible` | 隐藏但占位 |
| `.relative` | 相对定位 |
| `.absolute` | 绝对定位 |
| `.fixed` | 固定定位 |
| `.sticky` | 粘性定位 |
| `.w-full` | 宽度 100% |
| `.h-full` | 高度 100% |
| `.min-h-screen` | 最小高度等于屏幕高度 |

---

# 18. 小练习

## 练习 1

如果想让一个按钮变成“主要按钮”，通常会写哪两个类名？

```html
<button class="______ ______">保存</button>
```

参考答案：

```html
<button class="btn btn-primary">保存</button>
```

## 练习 2

如果想让一个盒子里面的内容水平垂直居中，可以使用哪个类名？

参考答案：

```html
<div class="flex-center">内容</div>
```

## 练习 3

如果想让文字超出一行后显示省略号，可以使用哪个类名？

参考答案：

```html
<p class="ellipsis">很长很长的文字</p>
```

## 练习 4

下面代码中，`.card-header` 一般有什么作用？

```html
<div class="card-header">
  <h3>订单信息</h3>
  <button>更多</button>
</div>
```

参考答案：

`.card-header` 表示卡片头部，通常用来放标题和操作按钮，并经常配合 Flex 做两端对齐。

## 练习 5

`.hidden` 和 `.invisible` 有什么区别？

参考答案：

- `.hidden` 常用 `display: none`，元素不显示，也不占位置。
- `.invisible` 常用 `visibility: hidden`，元素不显示，但仍然占位置。

