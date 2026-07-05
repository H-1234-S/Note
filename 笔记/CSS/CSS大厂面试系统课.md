# CSS 大厂面试系统课

> 学习方式：一次只学一个知识点。你回复“继续”，再进入下一节；你回复“复习”，先提问帮你回忆，再补薄弱点。

---

# 第 1 节：CSS 工作原理

## 第一部分：这个知识解决什么问题

CSS 解决的不是“给页面加颜色”这么简单的问题，而是：

1. HTML 只描述内容结构，不应该把视觉样式写死在结构里。
2. 同一份内容在不同设备、状态、主题、尺寸下，需要有不同表现。
3. 浏览器需要一套规则，把“作者写的样式”转换成“屏幕上每个像素怎么画”。

可以把 CSS 理解成浏览器布局系统的输入语言：

```txt
HTML 内容结构
    +
CSS 样式规则
    +
浏览器默认样式
    +
用户环境：屏幕宽度、字体、缩放、系统主题
    ↓
浏览器计算样式、布局、绘制、合成
    ↓
最终页面
```

面试里问 CSS 工作原理，本质是在考你是否知道：

- CSS 不是“属性堆砌”，而是一套层叠、继承、布局、绘制系统。
- 浏览器不是直接照着 CSS 画，而是经过 CSSOM、Render Tree、Layout、Paint、Composite。
- 很多 CSS 问题，例如 `z-index` 不生效、`height: 100%` 不生效、样式被覆盖，本质都来自这套机制。

---

## 第二部分：完整知识体系

### 1. CSS 从代码到页面经历什么

浏览器拿到 HTML 和 CSS 后，大致会经历：

```txt
HTML
 ↓ 解析
DOM Tree

CSS
 ↓ 解析
CSSOM Tree

DOM Tree + CSSOM Tree
 ↓ 结合可见节点与最终样式
Render Tree
 ↓
Layout：计算盒子大小和位置
 ↓
Paint：把文字、背景、边框、阴影等画出来
 ↓
Composite：把不同图层合成到屏幕
```

图示：

```txt
+----------------+        +----------------+
| HTML 文档       |        | CSS 样式表      |
+----------------+        +----------------+
        |                         |
        v                         v
+----------------+        +----------------+
| DOM Tree        |        | CSSOM Tree      |
+----------------+        +----------------+
        \                         /
         \                       /
          v                     v
           +-------------------+
           | Render Tree        |
           +-------------------+
                    |
                    v
           +-------------------+
           | Layout 布局        |
           +-------------------+
                    |
                    v
           +-------------------+
           | Paint 绘制         |
           +-------------------+
                    |
                    v
           +-------------------+
           | Composite 合成     |
           +-------------------+
```

### 2. DOM、CSSOM、Render Tree 的区别

DOM Tree 关心“页面有什么”：

```html
<body>
  <h1>商品详情</h1>
  <button>购买</button>
</body>
```

```txt
body
├── h1
└── button
```

CSSOM Tree 关心“每个选择器声明了什么样式”：

```css
h1 {
  font-size: 24px;
}

button {
  display: inline-block;
  padding: 8px 12px;
}
```

Render Tree 关心“哪些节点真正参与渲染，以及最终样式是什么”：

```txt
Render Tree
├── h1：display:block; font-size:24px; ...
└── button：display:inline-block; padding:8px 12px; ...
```

注意：

- `display: none` 的元素不会进入 Render Tree；后续 layout、paint 不会计算它
- `visibility: hidden` 的元素会进入 Render Tree，后续 layout 占位置，只是 paint 阶段不绘制。
- `opacity: 0` 的元素也占位置，layout、paint 阶段都参与，但是是透明的、不显示，甚至还能响应事件，除非额外设置 `pointer-events`。

这就是为什么三者表现不同：

```txt
display:none
DOM 有，Render Tree 没有，不占位

visibility:hidden
DOM 有，Render Tree 有，占位，不显示

opacity:0
DOM 有，Render Tree 有，占位，透明
```

### 3. CSS 的核心机制：层叠、继承、格式化上下文

CSS 工作原理至少要抓住三条主线：

```txt
CSS
├── Cascading：层叠
│   ├── 来源：浏览器样式、用户样式、作者样式
│   ├── 优先级：选择器权重
│   ├── 顺序：后写覆盖先写
│   └── !important：特殊优先级
│
├── Inheritance：继承
│   ├── font、color 等默认可继承
│   ├── width、margin、padding 等默认不可继承
│   └── inherit、initial、unset、revert 控制继承行为
│
└── Formatting Context：格式化上下文
    ├── BFC：块级格式化上下文
    ├── IFC：行内格式化上下文
    ├── FFC：Flex 格式化上下文
    └── GFC：Grid 格式化上下文
```

现在不用急着把这些都背下来，只要先知道：

CSS 的最终效果不是某个属性单独决定的，而是选择器、层叠、继承、盒模型、布局上下文共同决定的。

---

## 第三部分：常用“工作原理相关”概念

这一节不是某一个属性，所以不按“所有 CSS 属性”展开，而是整理 CSS 工作链路里最常被问的概念。

### 1. 样式来源

作用：决定一条样式从哪里来。

常见来源：

```txt
浏览器默认样式 User Agent Stylesheet
用户样式 User Stylesheet
开发者样式 Author Stylesheet
内联样式 style=""
!important 声明
```

默认效果：

- 即使你没写 CSS，`h1` 也会变大、`body` 有默认 `margin: 8px`，这是浏览器默认样式。

业务场景：

- 项目初始化常写 `* { box-sizing: border-box; }` 或清除 `body margin`，就是在覆盖浏览器默认样式。

面试常问：

- “为什么没写 CSS，页面也有样式？”
- “CSS reset 和 normalize.css 的区别是什么？”

容易混淆：

- 浏览器默认样式不是继承来的，是 User Agent Stylesheet。
- CSS reset 不是必须，但大型项目通常会统一基础样式。

### 2. 层叠 Cascading

作用：当多条规则命中同一个元素、同一个属性时，决定谁生效。

最终判断顺序简化版：

```txt
重要性：!important
  ↓
来源：作者样式、用户样式、浏览器样式
  ↓
选择器优先级
  ↓
代码书写顺序
```

浏览器最终效果：

```css
.btn {
  color: red;
}

.primary {
  color: blue;
}
```

```html
<button class="btn primary">按钮</button>
```

如果两个选择器优先级一样，后出现的规则生效，文字是蓝色。

业务场景：

- 组件库样式覆盖。
- 页面局部样式覆盖全局样式。
- Tailwind、CSS Modules、Sass 中处理样式冲突。

面试常问：

- “CSS 优先级怎么算？”
- “为什么后写的样式没有覆盖前面的？”

容易混淆：

- 后写覆盖先写，只在优先级相同或更高时成立。
- `!important` 不是无敌，它也有来源、层级和顺序问题。

### 3. 继承 Inheritance

作用：让某些文本相关样式自动从父元素传给子元素，减少重复声明。

常见默认继承属性：

```txt
color
font-family
font-size
font-weight
line-height
text-align
visibility
cursor
```

常见默认不继承属性：

```txt
width
height
margin
padding
border
background
display
position
overflow
```

默认值：

- 每个 CSS 属性都有自己的初始值。
- 如果属性可继承，未指定时通常取父元素的计算值。
- 如果属性不可继承，未指定时取属性自己的初始值。

业务场景：

```css
body {
  font-family: system-ui, sans-serif;
  color: #222;
}
```

这样全站文字默认使用统一字体和颜色。

面试常问：

- “哪些 CSS 属性可以继承？”
- “`inherit`、`initial`、`unset` 有什么区别？”

容易混淆：

- `background` 默认不继承，但父元素背景会在视觉上透出来。
- 子元素看起来有父元素背景，不代表它继承了背景。

### 4. 计算值、使用值、实际值

作用：解释浏览器如何把你写的 CSS 转成最终可布局的值。

例子：

```css
.box {
  width: 50%;
  font-size: 2em;
}
```

浏览器不会永远拿着 `50%` 和 `2em` 去布局，它会根据上下文计算：

```txt
指定值 specified value：你写的 50%、2em
计算值 computed value：经过继承、相对单位处理后的值
使用值 used value：布局时真正使用的 px 尺寸
实际值 actual value：受设备、字体、取整影响后的最终值
```

业务场景：

- `width: 100%` 为什么会撑破父容器？
- `em` 到底相对谁？
- `height: 100%` 为什么没效果？

面试常问：

- “CSS 值的计算过程是什么？”
- “百分比宽高分别相对谁？”

容易混淆：

- `em` 用在 `font-size` 上，相对父元素字体大小。
- `em` 用在其他属性上，通常相对自身计算后的字体大小。
- `rem` 相对根元素 `html` 的字体大小。

### 5. 渲染阶段

作用：解释页面变化为什么有的贵、有的便宜。

```txt
Layout/Reflow：重新计算位置和尺寸
Paint/Repaint：重新绘制像素
Composite：合成图层
```

性能成本通常是：

```txt
Layout > Paint > Composite
```

常见触发：

```txt
修改 width/height/margin/top/left
可能触发布局

修改 color/background/box-shadow
通常触发绘制

修改 transform/opacity
通常只触发合成
```

业务场景：

- 动画优先用 `transform` 和 `opacity`。
- 拖拽、滚动、弹层动画要避免频繁改 `top/left`。

面试常问：

- “重排和重绘的区别？”
- “为什么 transform 动画性能更好？”

容易混淆：

- `position: absolute` 不代表完全没有布局成本。
- `transform` 不影响普通文档流布局，但会影响视觉位置和合成。

---

## 第四部分：画图解释

### 1. 从源码到屏幕

```txt
你写的代码

<div class="card">商品</div>

.card {
  width: 200px;
  padding: 16px;
}

        |
        v

+-----------------------------+
| DOM：有一个 div.card         |
+-----------------------------+
        |
        v
+-----------------------------+
| CSSOM：.card 的样式规则      |
+-----------------------------+
        |
        v
+-----------------------------+
| Render Tree：可见节点 + 样式 |
+-----------------------------+
        |
        v
+-----------------------------+
| Layout：x/y/width/height     |
+-----------------------------+
        |
        v
+-----------------------------+
| Paint：背景、文字、边框       |
+-----------------------------+
        |
        v
+-----------------------------+
| Composite：合成到屏幕         |
+-----------------------------+
```

### 2. 三种“隐藏”的区别

```txt
原始布局：

+---------+ +---------+ +---------+
| A       | | B       | | C       |
+---------+ +---------+ +---------+

B 设置 display:none：

+---------+ +---------+
| A       | | C       |
+---------+ +---------+

B 设置 visibility:hidden：

+---------+ +---------+ +---------+
| A       | |         | | C       |
+---------+ +---------+ +---------+

B 设置 opacity:0：

+---------+ +---------+ +---------+
| A       | |透明但存在| | C       |
+---------+ +---------+ +---------+
```

### 3. 样式冲突如何裁决

```txt
同一个元素：

<button class="btn primary" style="color: green">提交</button>

命中的规则：

button       { color: black; }
.btn         { color: red;   }
.primary     { color: blue;  }
style=""     { color: green; }

裁决过程：

内联样式 style="" 权重更高
        ↓
最终 color: green
```

---

## 第五部分：浏览器底层原理

浏览器渲染 CSS 时，不是“一边读一边画完整页面”，而是先构建结构，再计算样式，再布局绘制。

### 1. CSSOM 为什么重要

CSS 会阻塞渲染，因为浏览器必须知道最终样式，才能构建 Render Tree。

比如：

```css
.hidden {
  display: none;
}
```

浏览器只有解析 CSS 后才知道这个元素是否参与渲染。

所以首屏性能里经常会关注：

- CSS 文件是否过大。
- 关键 CSS 是否内联。
- 非关键 CSS 是否延后加载。

### 2. 为什么 DOM 和 Render Tree 不一样

DOM 代表文档结构，Render Tree 代表渲染结构。

不会进入 Render Tree 的常见节点：

```txt
display:none 的元素
head、meta、script 等非可视节点
```

会进入 Render Tree 但不一定可见：

```txt
visibility:hidden
opacity:0
元素在视口外
被 overflow 裁剪
被其他元素覆盖
```

### 3. 为什么改一个样式可能影响整个页面

如果你修改一个元素的尺寸：

```css
.sidebar {
  width: 300px;
}
```

它可能影响兄弟元素、父元素、后续元素的位置，于是浏览器要重新布局。

```txt
改 sidebar 宽度
    ↓
main 可用宽度变化
    ↓
main 内文本换行变化
    ↓
main 高度变化
    ↓
footer 位置变化
```

这就是 Reflow，也叫 Layout。

### 4. 为什么 transform 通常更适合动画

`transform: translateX(100px)` 改的是元素视觉变换，不改变它在文档流中的原始占位。

只是在 Composite 阶段，合并图层的时候把已经画好的图层移动 

```txt
Layout 里的位置：还在原处
视觉合成的位置：被移动了
```

所以它通常不需要重新计算兄弟元素布局，只需要合成层处理，动画更流畅。

---

## 第六部分：真实业务案例

### 案例：商品卡片为什么会这样渲染

HTML：

```html
<article class="product-card">
  <img src="phone.png" alt="手机">
  <h3>旗舰手机</h3>
  <p>限时优惠，立减 500 元</p>
  <button>立即购买</button>
</article>
```

CSS：

```css
.product-card {
  width: 240px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.product-card h3 {
  font-size: 18px;
}

.product-card p {
  color: #666;
}
```

浏览器做了什么：

```txt
1. 解析 HTML，生成 DOM
2. 解析 CSS，生成 CSSOM
3. 匹配 .product-card、h3、p 等规则
4. 生成 Render Tree
5. 计算卡片宽度、padding、边框、内部元素位置
6. 绘制图片、文字、边框、圆角
7. 合成到页面
```

页面结构大概是：

```txt
+------------------------------+
| padding 16px                
|  +------------------------+ 
|  | 图片                   | 
|  +------------------------+ 
|  旗舰手机                   
|  限时优惠，立减 500 元       
|  +----------+               
|  | 立即购买 |               
|  +----------+               
+------------------------------+
```

你之后遇到“卡片宽度不对”“文字继承颜色”“按钮样式被覆盖”“图片撑破容器”，都可以回到这条链路排查：

```txt
选择器是否命中？
优先级是否被覆盖？
属性是否继承？
盒模型如何计算？
布局上下文是什么？
是否触发溢出、裁剪、层叠？
```

---

## 第七部分：面试高频问题

### 1. CSS 从加载到渲染经历了什么？

回答：

浏览器解析 HTML 生成 DOM，解析 CSS 生成 CSSOM，然后把 DOM 和 CSSOM 合成 Render Tree。Render Tree 只包含需要渲染的节点和最终样式。之后浏览器进行 Layout 计算盒子的位置和尺寸，再 Paint 绘制文字、背景、边框等，最后 Composite 合成图层显示到屏幕。

面试官为什么问：

他想判断你是否理解 CSS 和浏览器渲染流程，而不是只会写属性。

### 2. DOM 和 Render Tree 有什么区别？

回答：

DOM 是文档结构树，包含页面节点；Render Tree 是渲染树，只包含可渲染节点以及最终计算样式。比如 `display:none` 的元素在 DOM 中存在，但不会进入 Render Tree。

面试官为什么问：

这是很多隐藏、性能、布局问题的基础。

### 3. display:none、visibility:hidden、opacity:0 区别？

回答：

`display:none` 不参与布局，不占位置；`visibility:hidden` 参与布局，占位置，但不可见；`opacity:0` 参与布局，占位置，只是透明，通常仍可能响应事件。

面试官为什么问：

这题看似简单，其实在考 Render Tree、布局、绘制、事件命中。

### 4. 什么是重排和重绘？

回答：

重排是重新计算元素几何信息，例如位置和尺寸；重绘是几何信息不变，但重新绘制视觉样式，例如颜色和背景。重排通常会带来重绘，成本一般高于单纯重绘。

面试官为什么问：

他想看你是否有性能意识，尤其是动画、滚动、复杂列表优化。

### 5. 为什么 transform 动画比 top/left 更流畅？

回答：

`top/left` 改变布局位置，可能触发 Layout；

`transform` 不会改变元素在文档流中的布局信息，不会导致重排、重绘；只是在合成阶段对图层进行视觉变换，因此通常无需重新布局和重绘，动画性能更好。

因为 `transform` 改变的是元素的视觉位置，而不是几何布局（x、y、width、height），浏览器只需要移动已经绘制好的图层即可，不需要重新计算布局和重新绘制内容

面试官为什么问：

这是 CSS 性能和浏览器合成机制的高频入口题。

---

## 第八部分：容易踩坑

### 坑 1：以为写了 CSS 就一定生效

真实原因可能是：

```txt
选择器没命中
属性拼错
被更高优先级覆盖
被后面的规则覆盖
属性不适用于当前 display 类型
父级或上下文限制了效果
```

排查顺序：

```txt
DevTools 选中元素
    ↓
看 Styles 面板规则是否出现
    ↓
看属性是否被划掉
    ↓
看 Computed 面板最终值
    ↓
看 Layout 面板盒模型
```

### 坑 2：以为 opacity:0 等于 display:none

`opacity:0` 只是透明，它仍然：

- 占据布局空间。
- 可能响应点击。
- 可能覆盖下面的元素。
- 可能创建新的 stacking context。

### 坑 3：以为 CSS 只影响视觉，不影响性能

这些属性变化可能让页面很卡：

```txt
width
height
margin
padding
top
left
font-size
```

因为它们可能触发布局变化。

动画优先考虑：

```txt
transform
opacity
```

### 坑 4：看到 Computed 是最终值，但不知道它怎么来的

DevTools 的 Computed 面板只是告诉你最终结果。你还需要回到 Styles 面板看：

```txt
哪条规则命中？
哪条规则被覆盖？
值是否来自继承？
值是否来自浏览器默认样式？
```

---

## 第九部分：知识关联

```txt
CSS 工作原理
├── 选择器
│   └── 决定规则能否命中元素
│
├── 优先级
│   └── 决定多条规则冲突时谁赢
│
├── 继承
│   └── 决定子元素是否拿到父元素样式
│
├── display
│   ├── block：进入块级布局
│   ├── inline：进入行内布局
│   ├── flex：创建 Flex Formatting Context
│   └── grid：创建 Grid Formatting Context
│
├── 盒模型
│   └── Layout 阶段计算尺寸的基础
│
├── position
│   └── 和 containing block、层叠上下文有关
│
├── z-index
│   └── 和 stacking context 有关
│
└── 性能
    ├── Reflow/Layout
    ├── Repaint/Paint
    └── Composite
```

后面所有 CSS 知识，都可以挂到这棵树上。

---

## 第十部分：总结

本节最重要的不是背概念，而是建立一条主线：

```txt
CSS 代码不是直接变成页面

CSS
├── 先被解析成 CSSOM
├── 再和 DOM 合成 Render Tree
├── 再进入 Layout 计算位置尺寸
├── 再 Paint 绘制视觉效果
└── 最后 Composite 合成到屏幕
```

脑图：

```txt
CSS 工作原理
├── 输入
│   ├── HTML
│   ├── CSS
│   └── 浏览器默认样式
│
├── 核心规则
│   ├── 层叠
│   ├── 继承
│   ├── 优先级
│   └── 格式化上下文
│
├── 渲染流程
│   ├── DOM
│   ├── CSSOM
│   ├── Render Tree
│   ├── Layout
│   ├── Paint
│   └── Composite
│
├── 常见现象
│   ├── 样式覆盖
│   ├── 元素隐藏
│   ├── 布局变化
│   └── 动画性能
│
└── 后续关联
    ├── 选择器
    ├── 优先级
    ├── display
    ├── 盒模型
    ├── Flex/Grid
    ├── Position
    └── 浏览器渲染原理
```

---

## 练习题

### 练习 1：布局题

有三个按钮 A、B、C 横向排列。现在给 B 设置不同隐藏方式：

```css
.b {
  display: none;
}
```

然后分别改成：

```css
.b {
  visibility: hidden;
}
```

```css
.b {
  opacity: 0;
}
```

请你说明三种情况下 A、B、C 的位置、可见性、是否可能响应点击。

### 练习 2：分析题

下面代码最终文字是什么颜色？为什么？

```html
<p class="text primary" style="color: green;">Hello CSS</p>
```

```css
p {
  color: black;
}

.text {
  color: red;
}

.primary {
  color: blue;
}
```

### 练习 3：面试题

请用自己的话回答：

```txt
CSS 从加载到渲染，浏览器大致经历了哪些步骤？
```

要求不要背模板，尽量说出 DOM、CSSOM、Render Tree、Layout、Paint、Composite 的关系。

---

本节结束。你回复“继续”，我再进入第 2 节：CSS 选择器。你回复“复习”，我会先提问帮你回忆这一节，再针对薄弱点讲解。

---

# 第 2 节：CSS 选择器

## 第一部分：这个知识解决什么问题

CSS 选择器解决的问题是：

```txt
页面里有很多元素
    ↓
我到底要把这条样式应用到哪些元素上？
```

HTML 是结构：

```html
<div class="card">
  <h3 class="title">商品标题</h3>
  <p class="desc">商品描述</p>
  <button class="btn primary">购买</button>
</div>
```

CSS 需要一种“定位元素”的语言：

```css
.card .title {
  font-size: 18px;
}

.btn.primary {
  background: #1677ff;
}
```

所以选择器本质不是“语法糖”，而是 CSS 系统里的查询语言：

```txt
选择器 = 从 DOM 树中匹配元素的规则
```

业务开发里，选择器决定了：

- 样式能不能命中。
- 样式影响范围大不大。
- 样式是否容易被覆盖。
- 组件样式是否会污染外部。
- 代码是否容易阅读和维护。

面试里问选择器，不只是问你会不会写 `.box > p`，而是在考：

- 你是否理解 DOM 树关系。
- 你是否理解匹配规则。
- 你是否知道复杂选择器的性能和维护成本。
- 你是否能解释 `:is()`、`:where()`、`:has()` 这类现代选择器的设计意义。

---

## 第二部分：完整知识体系

选择器体系可以分成 7 类：

```txt
CSS 选择器
├── 基础选择器
│   ├── 通配选择器 *
│   ├── 类型选择器 div
│   ├── 类选择器 .card
│   ├── ID 选择器 #app
│   └── 属性选择器 [type="text"]
│
├── 组合选择器
│   ├── 后代选择器 A B
│   ├── 子代选择器 A > B
│   ├── 相邻兄弟选择器 A + B
│   └── 通用兄弟选择器 A ~ B
│
├── 分组选择器
│   └── A, B, C
│
├── 伪类选择器
│   ├── :hover
│   ├── :focus
│   ├── :checked
│   ├── :disabled
│   ├── :first-child
│   ├── :nth-child()
│   ├── :not()
│   ├── :is()
│   ├── :where()
│   └── :has()
│
├── 伪元素选择器
│   ├── ::before
│   ├── ::after
│   ├── ::first-line
│   ├── ::first-letter
│   ├── ::selection
│   └── ::placeholder
│
├── 作用域和层级相关
│   ├── :root
│   ├── :scope
│   └── @scope
│
└── 工程化选择器策略
    ├── BEM
    ├── CSS Modules
    ├── scoped CSS
    ├── utility class
    └── CSS-in-JS
```

### 1. 浏览器如何理解选择器

选择器写法看起来是从左到右：

```css
.card .title span {
  color: red;
}
```

人类读法：

```txt
找到 .card 里面的 .title 里面的 span
```

但浏览器匹配时，通常会从右往左找：

```txt
先找所有 span
    ↓
判断它的祖先里有没有 .title
    ↓
再判断 .title 的祖先里有没有 .card
```

为什么？

因为最终要决定“某个元素是否应用这条规则”。从目标元素出发向祖先验证，通常更高效。

图示：

```txt
.card .title span

DOM:

div.card
└── h3.title
    └── span

匹配方向：

span  →  h3.title  →  div.card
  ^          ^             ^
目标       父/祖先        祖先
```

### 2. 选择器设计的核心：命中范围

选择器太宽：

```css
button {
  color: red;
}
```

可能全站按钮都变红。

选择器太深：

```css
.page .content .left .list .item .title span {
  color: red;
}
```

结构稍微一改，样式就失效。

好的业务选择器通常是：

```css
.product-card__title {
  font-size: 16px;
}

.product-card__buy-button {
  width: 100%;
}
```

也就是：

```txt
范围足够明确
结构依赖不要过深
语义和组件边界清楚
```

---

## 第三部分：所有常用属性和选择器

严格说，选择器不是 CSS 属性；它是样式规则的“前半部分”。这一节按常用选择器逐个整理。

### 1. 通配选择器 `*`

作用：

匹配所有元素。

写法：

```css
* {
  box-sizing: border-box;
}
```

可选形式：

```css
*          /* 所有元素 */
.card *   /* .card 里面所有后代元素 */
```

默认值：

选择器本身没有默认值，但 `*` 的匹配范围默认是所有元素。

浏览器最终效果：

所有匹配元素都会应用声明。

常见使用场景：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

面试容易问：

`* { margin: 0; padding: 0; }` 有什么问题？

参考回答：

它会影响所有元素，包括表单、列表、标题等，可能破坏浏览器默认可用性。大型项目更常用 normalize 或更精细的 reset。

容易混淆：

`*` 不会直接选中伪元素，所以常见 reset 会额外写 `*::before`、`*::after`。

### 2. 类型选择器 `div`、`p`、`button`

作用：

根据 HTML 标签名匹配元素。

写法：

```css
p {
  line-height: 1.6;
}
```

可选值：

任意 HTML/SVG 标签名，例如：

```txt
div
span
button
input
svg
path
```

默认效果：

匹配页面中所有该标签元素。

业务场景：

- 设置文章内容区默认排版。
- 设置 `button` 的基础样式。

```css
.article p {
  margin-bottom: 12px;
}
```

面试容易问：

为什么组件样式里不建议大量使用裸标签选择器？

回答：

裸标签选择器影响范围大，容易误伤组件内部或外部同名元素。业务组件更推荐类选择器表达边界。

容易混淆：

```css
.article p
```

不是只选直接子元素 `p`，而是选 `.article` 里面任意层级的 `p`。

### 3. 类选择器 `.class`

作用：

根据元素的 `class` 匹配。

写法：

```css
.card {
  padding: 16px;
}
```

可选形式：

```css
.card
.card.active
button.primary
```

默认效果：

匹配所有包含该 class 的元素。

业务场景：

类选择器是业务 CSS 的主力，因为它：

- 语义清晰。
- 复用方便。
- 优先级适中。
- 比 ID 更适合组件化。

```css
.user-card {
  display: flex;
  gap: 12px;
}
```

面试容易问：

为什么业务开发更推荐 class，而不是 ID 或标签？

回答：

class 可复用、优先级适中、表达组件语义，既不会像标签选择器那样范围过大，也不会像 ID 那样优先级过高导致难覆盖。

容易混淆：

```css
.btn.primary
```

表示同一个元素同时有 `btn` 和 `primary` 两个类：

```html
<button class="btn primary">按钮</button>
```

不是 `.btn` 里面的 `.primary`。后代选择器中间必须有空格：

```css
.btn .primary
```

### 4. ID 选择器 `#id`

作用：

根据元素的 `id` 匹配。

写法：

```css
#app {
  min-height: 100vh;
}
```

可选形式：

```css
#app
div#app
```

默认效果：

匹配指定 ID 的元素。HTML 规范里，同一个页面中 ID 应该唯一。

业务场景：

- 应用挂载点：`#root`、`#app`。
- 页面锚点。
- 少量全局容器。

面试容易问：

为什么不建议用 ID 写组件样式？

回答：

ID 优先级高，不易覆盖；同时 ID 理论上唯一，不适合复用组件。

容易混淆：

ID 唯一是 HTML 规范约束，不代表浏览器遇到重复 ID 就完全不能匹配。重复 ID 会让 JS 查询、锚点、样式维护都变得混乱。

### 5. 属性选择器 `[attr]`

作用：

根据元素属性匹配。

常用写法：

```css
[disabled] {
  cursor: not-allowed;
}

input[type="text"] {
  border: 1px solid #ddd;
}
```

可选值：

```css
[attr]              /* 有这个属性 */
[attr="value"]      /* 属性值等于 value */
[attr~="value"]     /* 空格分隔列表中包含 value */
[attr|="zh"]        /* 等于 zh 或以 zh- 开头 */
[attr^="https"]     /* 以 https 开头 */
[attr$=".png"]      /* 以 .png 结尾 */
[attr*="sale"]      /* 包含 sale */
[attr="value" i]    /* 忽略大小写匹配 */
```

默认效果：

匹配符合属性条件的元素。

业务场景：

```css
input[aria-invalid="true"] {
  border-color: #e5484d;
}

a[target="_blank"]::after {
  content: "↗";
}
```

面试容易问：

属性选择器适合什么场景？

回答：

适合根据状态属性、语义属性、表单类型、可访问性属性选择元素，尤其是 `disabled`、`checked`、`aria-*`、`data-*`。

容易混淆：

`[class="btn"]` 只匹配 class 属性值完全等于 `btn` 的元素，不等同于 `.btn`。如果元素是：

```html
<button class="btn primary"></button>
```

`.btn` 能匹配，`[class="btn"]` 不能匹配。

### 6. 后代选择器 `A B`

作用：

选择 A 元素内部任意层级的 B 元素。

写法：

```css
.card .title {
  font-weight: 600;
}
```

默认效果：

只要 B 的祖先中有 A，就匹配。

图示：

```txt
.card .title

div.card
├── h3.title       选中
└── div
    └── p.title    也选中
```

业务场景：

- 限制文章区域内的元素样式。
- 给组件内部子元素加样式。

面试容易问：

后代选择器和子代选择器区别？

回答：

后代选择器匹配任意层级；子代选择器只匹配直接子元素。

容易混淆：

后代选择器范围可能比你想象的大，尤其在嵌套组件里容易误伤。

### 7. 子代选择器 `A > B`

作用：

只选择 A 的直接子元素 B。

写法：

```css
.menu > .menu-item {
  padding: 8px 12px;
}
```

默认效果：

只匹配父子关系，不匹配隔代。

图示：

```txt
.menu > .item

ul.menu
├── li.item         选中
└── li
    └── span.item   不选中
```

业务场景：

- 导航菜单。
- 列表项。
- 避免样式影响嵌套子组件。

面试容易问：

什么时候用 `>`？

回答：

当你只想约束当前组件的直接结构，避免影响更深层嵌套元素时。

容易混淆：

`A > B` 依赖 DOM 层级，HTML 结构一变就可能失效。

### 8. 相邻兄弟选择器 `A + B`

作用：

选择紧跟在 A 后面的第一个兄弟 B。

写法：

```css
label + input {
  margin-top: 4px;
}
```

默认效果：

只匹配紧挨着的下一个兄弟元素。

图示：

```txt
h2 + p

h2
p     选中
p     不选中
```

业务场景：

- 标题后第一段特殊样式。
- 表单 label 后的 input。
- 相邻块之间加间距。

面试容易问：

`+` 和 `~` 区别？

回答：

`+` 只匹配紧邻的下一个兄弟；`~` 匹配后面所有符合条件的兄弟。

容易混淆：

只能选后面的兄弟，不能选前面的兄弟。以前 CSS 没有父选择器和前向选择能力，现代 `:has()` 可以解决一部分问题。

### 9. 通用兄弟选择器 `A ~ B`

作用：

选择 A 后面所有同级的 B。

写法：

```css
h2 ~ p {
  color: #666;
}
```

默认效果：

匹配 A 之后的所有兄弟 B，不要求紧邻。

图示：

```txt
h2 ~ p

h2
div   不选中
p     选中
p     选中
```

业务场景：

- 某个开关选中后，影响后续面板。
- 标题后面的内容统一样式。

面试容易问：

纯 CSS 如何用 checkbox 控制面板显示？

```css
.toggle:checked ~ .panel {
  display: block;
}
```

容易混淆：

`~` 也只能选后面的兄弟，不能倒着选。

### 10. 分组选择器 `A, B`

作用：

多个选择器共享同一组声明。

写法：

```css
h1,
h2,
h3 {
  font-weight: 600;
}
```

默认效果：

分别匹配每个选择器命中的元素。

业务场景：

- 统一标题样式。
- reset。
- 多个状态共享样式。

面试容易问：

分组选择器里的某个选择器无效会怎样？

现代选择器列表里，如果普通选择器列表包含浏览器完全不认识的选择器，可能导致整条规则失效。`:is()`、`:where()` 的容错选择器列表可以改善这类问题。

容易混淆：

逗号是分组，不是层级关系。

### 11. 伪类选择器 `:hover`、`:focus` 等

作用：

匹配元素的某种状态、位置或关系。

常用状态伪类：

```css
a:hover
input:focus
input:checked
button:disabled
input:required
input:invalid
```

默认效果：

当元素处于指定状态时匹配。

业务场景：

```css
.btn:hover {
  background: #0958d9;
}

.field:focus {
  border-color: #1677ff;
}
```

面试容易问：

`:focus` 和 `:focus-visible` 区别？

回答：

`:focus` 只要元素获得焦点就匹配；`:focus-visible` 更偏向键盘导航等需要可见焦点提示的场景，能减少鼠标点击时出现不必要的焦点样式。

容易混淆：

移动端没有稳定的 hover 心智，不能把关键交互只依赖 `:hover`。

### 12. 结构伪类 `:first-child`、`:nth-child()`

作用：

根据元素在兄弟节点中的位置匹配。

常用写法：

```css
li:first-child
li:last-child
li:nth-child(2)
li:nth-child(odd)
li:nth-child(even)
li:nth-child(3n)
li:nth-child(3n + 1)
```

默认效果：

匹配符合兄弟顺序的元素。

图示：

```txt
li:nth-child(odd)

1  2  3  4  5
□  □  □  □  □
↑     ↑     ↑
选中  选中  选中
```

业务场景：

- 表格斑马纹。
- 网格中每隔几个元素加样式。
- 列表首尾去掉边距或边框。

```css
.table-row:nth-child(even) {
  background: #f7f8fa;
}

.list-item:last-child {
  border-bottom: none;
}
```

面试容易问：

`:nth-child()` 和 `:nth-of-type()` 区别？

回答：

`:nth-child()` 看的是所有兄弟中的位置，同时要求元素本身匹配前面的选择器；`:nth-of-type()` 看的是同标签类型兄弟中的位置。

容易混淆：

```css
p:first-child
```

不是“第一个 p”，而是“这个 p 必须是父元素的第一个子元素”。

### 13. 否定伪类 `:not()`

作用：

排除某些元素。

写法：

```css
.btn:not(.disabled) {
  cursor: pointer;
}
```

默认效果：

匹配 `.btn` 中不符合 `.disabled` 的元素。

业务场景：

```css
.nav-item:not(:last-child) {
  margin-right: 16px;
}
```

面试容易问：

`:not()` 会不会影响优先级？

回答：

`:not()` 本身不额外增加伪类权重，里面参数的选择器会参与优先级计算。

容易混淆：

`:not(.a, .b)` 是现代写法，旧浏览器兼容性要注意。

### 14. 匹配伪类 `:is()`

作用：

把多个选择器合并，减少重复。

写法：

```css
.article :is(h1, h2, h3) {
  line-height: 1.3;
}
```

等价于：

```css
.article h1,
.article h2,
.article h3 {
  line-height: 1.3;
}
```

默认效果：

匹配参数列表中任意一个选择器。

业务场景：

- 文章内容排版。
- 复杂组件中多个元素共享样式。

面试容易问：

`:is()` 的优先级怎么算？

回答：

`:is()` 的优先级取参数列表中优先级最高的那个选择器。

容易混淆：

`:is()` 是压缩选择器重复，不是降低优先级。要降低优先级用 `:where()`。

### 15. 零权重伪类 `:where()`

作用：

像 `:is()` 一样合并选择器，但自身和参数都不增加优先级。

写法：

```css
:where(.article h1, .article h2, .article h3) {
  margin: 0;
}
```

默认效果：

匹配参数列表中任意选择器，但选择器权重为 0。

业务场景：

- 写基础样式。
- 写组件库默认样式，方便业务覆盖。

面试容易问：

`:is()` 和 `:where()` 区别？

回答：

匹配能力相似，但优先级不同。`:is()` 取参数里最高优先级；`:where()` 永远是 0 权重。

容易混淆：

`:where()` 不是“不生效”，而是很容易被其他样式覆盖。

### 16. 关系伪类 `:has()`

作用：

根据元素内部或后续关系是否存在某个匹配项，选择当前元素。它常被称为“父选择器”的能力，但其实更准确地说是关系选择器。

写法：

```css
.field:has(input:focus) {
  border-color: #1677ff;
}

.card:has(.error) {
  border-color: #e5484d;
}
```

默认效果：

如果 `.field` 里面有聚焦的 input，就匹配 `.field`。

图示：

```txt
.field:has(input:focus)

div.field             选中
└── input:focus
```

业务场景：

- 表单项内部 input 聚焦时，高亮外层容器。
- 卡片内部有错误状态时，高亮卡片。
- 根据是否有图片、按钮调整布局。

面试容易问：

`:has()` 为什么重要？

回答：

过去 CSS 主要从父到子、从前到后匹配，很难根据子元素状态影响父元素。`:has()` 让很多以前需要 JS 加 class 的交互可以用 CSS 表达。

容易混淆：

`:has()` 很强，但不要滥用在大范围复杂选择器上。它会增加匹配关系的复杂度，也可能让样式依赖 DOM 结构过重。

### 17. 伪元素 `::before`、`::after`

作用：

创建元素的某个虚拟部分，用于装饰或插入生成内容。

写法：

```css
.tag::before {
  content: "#";
}
```

可选值：

常见伪元素：

```css
::before
::after
::first-line
::first-letter
::selection
::placeholder
::marker
```

默认效果：

`::before` 和 `::after` 必须设置 `content` 才会生成。

业务场景：

- 必填星号。
- 分隔符。
- 装饰线。
- 自定义 placeholder 样式。

面试容易问：

伪类和伪元素区别？

回答：

伪类匹配元素的状态或关系，例如 `:hover`；伪元素匹配或创建元素的一部分，例如 `::before`、`::first-line`。

容易混淆：

`::before` 不是 DOM 节点，JS 不能像普通元素一样直接选中它。

---

## 第四部分：画图解释

### 1. 后代和子代

```txt
HTML:

div.card
├── h3.title
└── div.body
    └── h3.title

.card .title

div.card
├── h3.title       选中
└── div.body
    └── h3.title   选中

.card > .title

div.card
├── h3.title       选中
└── div.body
    └── h3.title   不选中
```

### 2. 相邻兄弟和通用兄弟

```txt
HTML:

h2
p.intro
div.ad
p.content
p.content

h2 + p

h2
p.intro     选中
div.ad      不选中
p.content   不选中
p.content   不选中

h2 ~ p

h2
p.intro     选中
div.ad      不选中
p.content   选中
p.content   选中
```

### 3. `:nth-child()`

```txt
li:nth-child(3n + 1)

序号： 1   2   3   4   5   6   7
元素： □   □   □   □   □   □   □
      ↑           ↑           ↑
     选中        选中        选中

公式：3n + 1
n=0 → 1
n=1 → 4
n=2 → 7
```

### 4. `:has()`

```txt
想选中“内部有错误的表单项”

div.form-item
├── label
└── input.error

.form-item:has(.error)

匹配结果：

+---------------------------+
| form-item 被选中           |
|  label                    |
|  input.error              |
+---------------------------+
```

---

## 第五部分：浏览器底层原理

### 1. 选择器匹配发生在什么时候

CSS 被解析成 CSSOM 后，浏览器需要把 CSS 规则应用到 DOM 元素上，得到每个元素的最终样式。

```txt
DOM 元素
    +
CSS 规则列表
    ↓
选择器匹配
    ↓
得到该元素命中的声明
    ↓
层叠、继承、计算
    ↓
Computed Style
```

### 2. 为什么浏览器常从右往左匹配

假设：

```css
.app .page .list .item span {
  color: red;
}
```

如果从左往右：

```txt
找 .app
再找 .page
再找 .list
再找 .item
再找 span
```

中间可能产生大量候选节点。

从右往左：

```txt
先找 span
再验证祖先链是否满足 .item → .list → .page → .app
```

这更符合“判断当前元素是否命中规则”的工作方式。

所以选择器右侧部分叫关键选择器：

```css
.app .page .list .item span
                         ^^^^
                         关键选择器
```

### 3. 选择器性能要不要极度关注

现代浏览器选择器匹配已经很快。业务开发中，选择器性能通常不是第一瓶颈。

真正更值得关注的是：

- 选择器是否过深，导致维护困难。
- 是否使用全局选择器污染组件。
- 是否让样式依赖脆弱 DOM 结构。
- 是否导致优先级越来越高，后续难覆盖。

也就是说：

```txt
大多数业务场景：
可维护性 > 微小选择器性能差异
```

### 4. 选择器和优先级的关系

选择器不仅决定“选谁”，还决定“谁更强”。

```css
.btn {
  color: red;
}

button.btn {
  color: blue;
}
```

第二条更具体，优先级更高。

下一节会专门讲优先级；现在先记住：

```txt
选择器越具体，通常越难覆盖。
```

这也是为什么大型项目要控制选择器复杂度。

---

## 第六部分：真实业务案例

### 案例 1：导航栏

HTML：

```html
<nav class="nav">
  <a class="nav__item nav__item--active" href="/">首页</a>
  <a class="nav__item" href="/products">商品</a>
  <a class="nav__item" href="/orders">订单</a>
</nav>
```

CSS：

```css
.nav {
  display: flex;
  gap: 16px;
}

.nav__item {
  color: #333;
  text-decoration: none;
}

.nav__item:hover {
  color: #1677ff;
}

.nav__item--active {
  color: #1677ff;
  font-weight: 600;
}
```

为什么这样写：

- `.nav` 表达组件根节点。
- `.nav__item` 表达组件内部元素。
- `.nav__item--active` 表达状态。
- 避免写成 `.nav a`，因为未来导航里可能出现按钮、图标、下拉组件。

### 案例 2：表单项聚焦高亮

HTML：

```html
<div class="form-item">
  <label>手机号</label>
  <input type="tel">
</div>
```

CSS：

```css
.form-item {
  border: 1px solid #dcdfe6;
}

.form-item:has(input:focus) {
  border-color: #1677ff;
}
```

以前可能要用 JS：

```js
input.addEventListener('focus', () => {
  item.classList.add('is-focus');
});
```

现在部分场景可以用 `:has()` 表达。

### 案例 3：评论列表最后一项去掉分割线

HTML：

```html
<ul class="comment-list">
  <li class="comment-item">评论 A</li>
  <li class="comment-item">评论 B</li>
  <li class="comment-item">评论 C</li>
</ul>
```

CSS：

```css
.comment-item {
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}
```

这是结构伪类的典型业务用途。

---

## 第七部分：面试高频问题

### 1. CSS 选择器有哪些？

回答：

常见选择器包括通配选择器、标签选择器、类选择器、ID 选择器、属性选择器、后代选择器、子代选择器、兄弟选择器、分组选择器、伪类选择器和伪元素选择器。现代 CSS 还包括 `:is()`、`:where()`、`:has()` 等关系和匹配能力更强的选择器。

面试官为什么问：

先看基础是否完整，再看你是否了解现代 CSS。

### 2. 后代选择器和子代选择器区别？

回答：

`A B` 匹配 A 内部任意层级的 B；`A > B` 只匹配 A 的直接子元素 B。前者范围更大，后者结构约束更强。

面试官为什么问：

这题考 DOM 树关系，也考你写组件样式时是否会控制影响范围。

### 3. `.btn.primary` 和 `.btn .primary` 区别？

回答：

`.btn.primary` 匹配同一个元素同时拥有 `btn` 和 `primary` 两个 class；`.btn .primary` 匹配 `.btn` 后代中的 `.primary` 元素。

面试官为什么问：

这是 CSS 选择器阅读能力的基础题，业务里非常常见。

### 4. 伪类和伪元素区别？

回答：

伪类描述元素状态、位置或关系，例如 `:hover`、`:first-child`；伪元素描述或创建元素的一部分，例如 `::before`、`::after`、`::first-line`。

面试官为什么问：

看你是否理解它们的语义，而不是只记冒号数量。

### 5. `:nth-child()` 和 `:nth-of-type()` 区别？

回答：

`:nth-child()` 按所有兄弟元素排序，再判断当前元素是否匹配；`:nth-of-type()` 只在同标签类型兄弟中排序。

面试官为什么问：

这是列表、表格、动态内容样式里非常容易写错的点。

### 6. `:is()` 和 `:where()` 区别？

回答：

两者都能把多个选择器合并，区别在优先级。`:is()` 的优先级取参数中最高的选择器，`:where()` 的优先级永远是 0，适合写容易被覆盖的基础样式。

面试官为什么问：

现代 CSS 题，能区分只是“听过”和真正理解。

### 7. `:has()` 能解决什么问题？

回答：

`:has()` 可以根据子元素、后代元素或相邻关系来匹配当前元素，让 CSS 具备一定“向上选择”或“关系判断”能力。比如外层表单项根据内部 input 的 focus 或 error 状态改变样式。

面试官为什么问：

看你是否了解现代 CSS 能力，以及是否知道过去需要 JS 的一部分场景现在可以用 CSS 实现。

---

## 第八部分：容易踩坑

### 坑 1：`.a.b` 和 `.a .b` 写混

```css
.a.b {
  color: red;
}
```

匹配：

```html
<div class="a b"></div>
```

```css
.a .b {
  color: red;
}
```

匹配：

```html
<div class="a">
  <div class="b"></div>
</div>
```

一个空格，语义完全不同。

### 坑 2：`:first-child` 当成“第一个某类元素”

```css
.item:first-child {
  color: red;
}
```

意思不是“第一个 `.item`”，而是：

```txt
这个元素是 .item
并且它是父元素的第一个子元素
```

如果结构是：

```html
<div>
  <h3>标题</h3>
  <p class="item">第一段</p>
</div>
```

这个 `p.item` 不是 first-child，因为第一个子元素是 `h3`。

### 坑 3：选择器写太深

```css
.page .main .section .list .item .info .title {
  color: red;
}
```

问题：

- 结构依赖太强。
- 优先级越来越高。
- 复用困难。
- 后续覆盖困难。

更推荐：

```css
.product-title {
  color: red;
}
```

或者在 BEM 里：

```css
.product-card__title {
  color: red;
}
```

### 坑 4：滥用 ID 选择器

```css
#submitButton {
  color: red;
}
```

后续想覆盖：

```css
.btn {
  color: blue;
}
```

可能覆盖不了，因为 ID 优先级更高。

大型项目中，组件样式尽量用 class，ID 留给挂载点、锚点、少量全局结构。

### 坑 5：把 `:hover` 当成所有设备都可靠

PC 鼠标有 hover，移动端触摸没有稳定 hover 行为。

如果关键信息只在 hover 时出现，移动端用户可能无法操作。

---

## 第九部分：知识关联

```txt
选择器
├── DOM Tree
│   ├── 父子关系 → A > B
│   ├── 祖先后代 → A B
│   └── 兄弟关系 → A + B / A ~ B
│
├── 状态
│   ├── :hover
│   ├── :focus
│   ├── :checked
│   └── :disabled
│
├── 结构
│   ├── :first-child
│   ├── :last-child
│   ├── :nth-child()
│   └── :nth-of-type()
│
├── 生成内容
│   ├── ::before
│   └── ::after
│
├── 优先级
│   ├── ID
│   ├── class/属性/伪类
│   └── 标签/伪元素
│
└── 工程化
    ├── BEM
    ├── CSS Modules
    ├── scoped CSS
    └── utility class
```

选择器是后面“优先级”的入口，也是你阅读别人 CSS 的第一步：

```txt
先看选择器选中了谁
再看声明写了什么
最后看有没有被覆盖
```

---

## 第十部分：总结

选择器的本质：

```txt
选择器 = 在 DOM 树中定位元素的规则
```

本节脑图：

```txt
CSS 选择器
├── 基础
│   ├── *
│   ├── div
│   ├── .class
│   ├── #id
│   └── [attr=value]
│
├── 关系
│   ├── A B：后代
│   ├── A > B：子代
│   ├── A + B：相邻兄弟
│   └── A ~ B：后续兄弟
│
├── 状态伪类
│   ├── :hover
│   ├── :focus
│   ├── :checked
│   └── :disabled
│
├── 结构伪类
│   ├── :first-child
│   ├── :last-child
│   ├── :nth-child()
│   └── :nth-of-type()
│
├── 现代伪类
│   ├── :not()
│   ├── :is()
│   ├── :where()
│   └── :has()
│
├── 伪元素
│   ├── ::before
│   ├── ::after
│   ├── ::placeholder
│   └── ::selection
│
└── 工程实践
    ├── class 为主
    ├── 少用 ID 写样式
    ├── 避免选择器过深
    ├── 控制影响范围
    └── 让样式跟组件边界一致
```

核心记忆：

```txt
.a.b      同一个元素同时有 a 和 b
.a .b     a 里面的 b
.a > .b   a 的直接子元素 b
.a + .b   a 后面紧挨着的 b
.a ~ .b   a 后面所有同级 b
```

---

## 练习题

### 练习 1：选择器阅读题

下面选择器分别选中什么？

```css
.card.active
.card .active
.menu > .item
h2 + p
h2 ~ p
input[type="checkbox"]:checked
.form-item:has(input:focus)
```

### 练习 2：业务改造题

下面选择器有什么问题？请改成更适合组件维护的写法。

```css
.page .content .left .product-list .item .info .title {
  font-size: 16px;
}
```

### 练习 3：结构伪类题

下面 HTML 中，哪些元素会被选中？

```html
<div class="box">
  <h3>标题</h3>
  <p class="text">第一段</p>
  <p class="text">第二段</p>
</div>
```

```css
.text:first-child {
  color: red;
}

.text:nth-child(2) {
  color: blue;
}
```

### 练习 4：面试题

请用自己的话回答：

```txt
:is()、:where()、:has() 分别解决什么问题？
```

---

本节结束。你回复“继续”，我再进入第 3 节：优先级。你回复“复习”，我会先通过提问帮你回忆选择器，再讲解薄弱点。

---

# 第 3 节：优先级

## 第一部分：这个知识解决什么问题

CSS 优先级解决的问题是：

```txt
同一个元素
同一个 CSS 属性
被多条规则同时声明
    ↓
浏览器到底听谁的？
```

例子：

```html
<button class="btn primary" id="submit">提交</button>
```

```css
button {
  color: black;
}

.btn {
  color: red;
}

.primary {
  color: blue;
}

#submit {
  color: green;
}
```

最终文字是绿色。为什么？

不是因为 `#submit` 写在最后，而是因为 ID 选择器优先级更高。

优先级是 CSS 里非常核心的“冲突裁决机制”。你写业务页面时，几乎每天都会遇到：

- 为什么我的样式没生效？
- 为什么组件库样式覆盖不了？
- 为什么后写的 CSS 没有赢？
- 为什么加了 `!important` 才生效？
- 为什么 Tailwind 类名顺序有时候不像我想的那样？

这些问题都绕不开优先级。

---

## 第二部分：完整知识体系

CSS 冲突裁决不是只看“选择器权重”，完整顺序是：

```txt
1. 样式来源和重要性
2. 层叠层 @layer
3. 选择器优先级 specificity
4. 作用域接近度 scoping proximity
5. 书写顺序 source order
```

在常规业务里，最常用的简化模型是：

```txt
!important
    ↓
内联样式 style=""
    ↓
ID 选择器
    ↓
类 / 属性 / 伪类选择器
    ↓
标签 / 伪元素选择器
    ↓
通配选择器 / 继承样式
    ↓
同权重时后写覆盖先写
```

但高级面试不能只背这个，因为真实 CSS 还有：

- 浏览器默认样式。
- 用户样式。
- 作者样式。
- 动画样式。
- 过渡样式。
- `@layer`。
- `:is()`、`:not()`、`:has()` 的参数权重。
- `:where()` 零权重。
- 继承样式和直接命中样式的区别。

### 1. 什么是 specificity

Specificity 通常用四段表示：

```txt
(a, b, c, d)

a: 内联样式 style=""
b: ID 选择器数量
c: 类选择器、属性选择器、伪类选择器数量
d: 标签选择器、伪元素选择器数量
```

例如：

```css
style=""             -> (1, 0, 0, 0)
#app                 -> (0, 1, 0, 0)
.card                -> (0, 0, 1, 0)
[disabled]           -> (0, 0, 1, 0)
:hover               -> (0, 0, 1, 0)
button               -> (0, 0, 0, 1)
::before             -> (0, 0, 0, 1)
*                    -> (0, 0, 0, 0)
```

比较方式不是十进制加法，而是从左到右逐级比较：

```txt
(0, 1, 0, 0) > (0, 0, 999, 999)
```

也就是说，一个 ID 选择器通常大于很多 class 选择器堆叠。

### 2. 优先级不是“分数相加”

错误理解：

```txt
10 个 class = 1 个 ID
```

正确理解：

```txt
ID 这一位比 class 这一位更高
先比较 ID 数量
ID 多的赢
ID 一样再比较 class/属性/伪类数量
```

图示：

```txt
#app
(0,1,0,0)

.a.b.c.d.e.f.g.h.i.j
(0,0,10,0)

比较：
b 位：1 > 0
所以 #app 赢
```

### 3. 继承来的样式优先级很低

```html
<div class="parent">
  <p>文字</p>
</div>
```

```css
.parent {
  color: red;
}

p {
  color: blue;
}
```

`p` 最终是蓝色。

因为 `.parent` 的 `color: red` 是继承给 `p` 的，而 `p { color: blue; }` 是直接命中 `p` 的样式。

```txt
直接命中元素的声明 > 继承来的声明
```

这点非常容易被忽略。

---

## 第三部分：所有常用优先级规则

这一节仍然不是单一 CSS 属性，而是 CSS 冲突规则。我们按常用规则逐个整理。

### 1. 浏览器默认样式 User Agent Stylesheet

作用：

即使你不写 CSS，浏览器也给元素默认样式。

例子：

```txt
body 默认 margin: 8px
h1 默认 font-size 较大
ul 默认有 padding-left
a 默认蓝色并带下划线
```

默认值：

由浏览器默认样式表提供，不同浏览器可能略有差异。

最终效果：

作者样式通常可以覆盖浏览器默认样式。

业务场景：

```css
body {
  margin: 0;
}

button {
  font: inherit;
}
```

面试容易问：

为什么没写 CSS，`h1` 也很大？

回答：

因为浏览器有 User Agent Stylesheet。

容易混淆：

浏览器默认样式不是继承，也不是 HTML 标签自带魔法，而是浏览器提供的默认 CSS。

### 2. 作者样式 Author Stylesheet

作用：

开发者写的 CSS，是业务中最主要的样式来源。

来源包括：

```txt
外部 CSS 文件
style 标签
内联 style 属性
组件库注入样式
CSS-in-JS 运行时插入样式
```

默认效果：

同等情况下，作者样式覆盖浏览器默认样式。

业务场景：

项目中的普通 CSS、Sass、Less、CSS Modules、Tailwind 都属于作者样式。

面试容易问：

外链 CSS 和 style 标签谁优先？

回答：

如果来源和优先级相同，后出现的规则覆盖先出现的规则。

容易混淆：

不是 style 标签天然比外链 CSS 高，而是看最终在文档中的顺序和优先级。

### 3. 内联样式 `style=""`

作用：

直接写在元素上的样式。

写法：

```html
<div style="color: red;">文字</div>
```

优先级：

```txt
(1, 0, 0, 0)
```

最终效果：

通常高于普通选择器。

业务场景：

- React 动态样式。
- 计算型样式，例如拖拽位置、动态宽度。
- 第三方组件临时注入样式。

面试容易问：

如何覆盖内联样式？

回答：

普通选择器通常覆盖不了内联样式。可以通过更高层级的 `!important` 覆盖，或避免使用内联样式，把动态状态转成 class。

容易混淆：

内联样式不是 ID 选择器，它单独占 specificity 的最高位。

### 4. ID 选择器

作用：

匹配指定 ID 的元素，同时带来很高优先级。

写法：

```css
#app {
  color: red;
}
```

优先级：

```txt
(0, 1, 0, 0)
```

业务场景：

- 应用根节点。
- 页面锚点。
- 少数全局容器。

面试容易问：

为什么不建议用 ID 写组件样式？

回答：

ID 优先级过高，不利于复用和覆盖；组件通常需要多实例复用，class 更合适。

容易混淆：

ID 的高优先级不代表一定赢过 `!important` 或内联 `!important`。

### 5. 类、属性、伪类选择器

作用：

业务开发最常用的一组选择器。

写法：

```css
.btn {}
[disabled] {}
:hover {}
```

优先级：

```txt
(0, 0, 1, 0)
```

多个会叠加在同一位：

```css
.btn.primary:hover {
  color: red;
}
```

权重：

```txt
.btn       -> c + 1
.primary   -> c + 1
:hover     -> c + 1
总计       -> (0, 0, 3, 0)
```

业务场景：

```css
.button.button--primary:hover {
  background: #0958d9;
}
```

面试容易问：

属性选择器和类选择器优先级一样吗？

回答：

一样，都在 class 这一档。

容易混淆：

`:not()`、`:is()`、`:has()` 自身不按普通伪类简单算，它们的参数会影响优先级。

### 6. 标签和伪元素选择器

作用：

按标签或元素的一部分匹配。

写法：

```css
button {}
p {}
::before {}
```

优先级：

```txt
(0, 0, 0, 1)
```

业务场景：

- reset。
- 文章内容排版。
- 组件内部简单结构。

面试容易问：

伪元素优先级怎么算？

回答：

伪元素和标签选择器在同一档。

容易混淆：

`:before` 是旧写法，现代推荐 `::before`，用于区分伪类和伪元素。

### 7. 通配选择器和组合符

作用：

辅助匹配结构。

写法：

```css
* {}
.card > .title {}
.title + .desc {}
```

优先级：

```txt
*、>、+、~、空格本身不增加优先级
```

例子：

```css
.card > .title {}
```

权重：

```txt
.card  -> (0,0,1,0)
.title -> (0,0,1,0)
>      -> 不加
总计   -> (0,0,2,0)
```

业务场景：

用于控制组件内部结构。

面试容易问：

后代选择器的空格会增加权重吗？

回答：

不会。组合符只表达关系，不增加优先级。

### 8. `!important`

作用：

提升某条声明的重要性。

写法：

```css
.btn {
  color: red !important;
}
```

最终效果：

同一来源和层级中，important 声明优先于普通声明。

业务场景：

- 覆盖第三方库强样式。
- 工具类中强制生效。
- 紧急修复。

面试容易问：

`!important` 是不是最高优先级？

回答：

不是简单的“最高”。它改变的是声明的重要性。不同来源、层叠层、动画和过渡也会影响最终结果。普通业务里它通常能覆盖大多数普通声明，但滥用会让样式系统难维护。

容易混淆：

`!important` 是加在声明上的，不是加在选择器上的：

```css
.btn !important { }       /* 错 */
.btn { color: red !important; }  /* 对 */
```

### 9. `:is()`、`:not()`、`:has()` 的优先级

作用：

这几个伪类的参数选择器会参与权重计算。

规则：

```txt
:is()   取参数中最高优先级
:not()  取参数中最高优先级
:has()  取参数中最高优先级
```

例子：

```css
:is(.card, #app) {
  color: red;
}
```

权重取 `#app` 的优先级：

```txt
(0,1,0,0)
```

业务场景：

减少重复选择器。

面试容易问：

`:is(.a, #b)` 优先级是多少？

回答：

取参数里最高的 `#b`，所以是 ID 级别。

容易混淆：

很多人以为 `:is()` 自己只是一个伪类，所以只算 `(0,0,1,0)`，这是错的。

### 10. `:where()` 零优先级

作用：

匹配能力类似 `:is()`，但优先级永远为 0。

写法：

```css
:where(.article h1, .article h2) {
  margin: 0;
}
```

优先级：

```txt
(0,0,0,0)
```

业务场景：

- reset。
- 组件库基础样式。
- 希望非常容易被覆盖的默认样式。

面试容易问：

为什么组件库喜欢用 `:where()`？

回答：

因为它可以写出有明确匹配范围但权重很低的样式，方便业务方覆盖。

容易混淆：

`:where(#app .title)` 即使参数里有 ID，整体仍然是 0 权重。

### 11. 书写顺序

作用：

当来源、重要性、层级、优先级都一样时，后写的规则生效。

例子：

```css
.btn {
  color: red;
}

.btn {
  color: blue;
}
```

最终是蓝色。

业务场景：

- 样式文件引入顺序。
- CSS-in-JS 插入顺序。
- Tailwind 工具类生成顺序。

面试容易问：

为什么 class 写在 HTML 后面的没有生效？

例如：

```html
<div class="text-red text-blue"></div>
```

回答：

HTML 中 class 属性的书写顺序通常不决定 CSS 胜负。真正决定的是 CSS 规则生成后的顺序和优先级。

容易混淆：

```html
class="a b"
```

不是 `b` 一定覆盖 `a`。要看 CSS 里 `.a` 和 `.b` 谁后出现。

---

## 第四部分：画图解释

### 1. specificity 四位比较

```txt
(a, b, c, d)

a: inline style
b: #id
c: .class / [attr] / :pseudo-class
d: tag / ::pseudo-element
```

图示：

```txt
style=""         (1,0,0,0)
#app             (0,1,0,0)
.card.active     (0,0,2,0)
button::before   (0,0,0,2)
*                (0,0,0,0)
```

比较：

```txt
(0,1,0,0)
   |
   v
先看 b 位，1 比 0 大

(0,0,100,0)
      |
      v
class 再多，也不会进到 b 位
```

### 2. 为什么后写不一定赢

```css
#submit {
  color: red;
}

.btn {
  color: blue;
}
```

```txt
#submit  -> (0,1,0,0)
.btn     -> (0,0,1,0)

虽然 .btn 后写
但 #submit 权重更高
最终 red
```

### 3. 继承和直接命中

```html
<div class="parent">
  <p>文字</p>
</div>
```

```css
.parent {
  color: red;
}

p {
  color: blue;
}
```

图示：

```txt
div.parent
color:red
   |
   | 继承
   v
p
color:red from parent
color:blue direct matched

直接命中赢
最终 blue
```

### 4. `:where()` 的低权重

```css
:where(.card .title) {
  color: red;
}

.title {
  color: blue;
}
```

```txt
:where(.card .title) -> (0,0,0,0)
.title               -> (0,0,1,0)

最终 blue
```

---

## 第五部分：浏览器底层原理

浏览器计算最终样式时，会对每个元素做类似这样的流程：

```txt
1. 找到所有命中该元素的 CSS 规则
2. 展开 shorthand 属性
3. 按来源、重要性、@layer、优先级、顺序排序
4. 对每个属性选出最终声明
5. 处理继承和默认值
6. 计算相对单位和关键字
7. 生成 computed style
```

### 1. 为什么优先级是属性级别的

看这个例子：

```css
.btn {
  color: red;
  background: white;
}

.primary {
  color: blue;
}
```

```html
<button class="btn primary">提交</button>
```

最终：

```txt
color: blue
background: white
```

不是整条 `.primary` 规则覆盖整条 `.btn` 规则，而是对每个属性分别裁决。

```txt
color 有冲突 → 比优先级和顺序
background 没冲突 → 保留 .btn 的声明
```

### 2. 为什么 shorthand 会带来覆盖问题

```css
.box {
  margin-top: 20px;
}

.box {
  margin: 0;
}
```

`margin: 0` 是简写，会展开成：

```css
margin-top: 0;
margin-right: 0;
margin-bottom: 0;
margin-left: 0;
```

所以它会覆盖前面的 `margin-top: 20px`。

浏览器内部会把很多简写属性展开成具体长属性参与计算。

### 3. 为什么 DevTools 里有些样式被划掉

被划掉说明：

```txt
这条声明命中了元素
但在最终层叠裁决中输了
```

常见原因：

- 优先级低。
- 书写顺序早。
- 被 `!important` 覆盖。
- shorthand/longhand 互相覆盖。
- 属性无效或值非法。

---

## 第六部分：真实业务案例

### 案例 1：覆盖组件库按钮样式

组件库 CSS：

```css
.ant-btn-primary {
  background: #1677ff;
  color: #fff;
}
```

你的业务 CSS：

```css
.danger {
  background: #e5484d;
}
```

HTML：

```html
<button class="ant-btn-primary danger">删除</button>
```

如果 `.danger` 在 CSS 里后加载，并且权重同为 class 级别：

```txt
.ant-btn-primary -> (0,0,1,0)
.danger          -> (0,0,1,0)
```

后写的 `.danger` 生效。

如果组件库写得更具体：

```css
.ant-btn.ant-btn-primary {
  background: #1677ff;
}
```

权重：

```txt
(0,0,2,0)
```

你的 `.danger` 可能覆盖不了。可以写：

```css
.ant-btn.danger {
  background: #e5484d;
}
```

但工程上更好的方式通常是使用组件库提供的 token、theme、className API，而不是无限堆优先级。

### 案例 2：为什么 Tailwind class 顺序不一定按 HTML 顺序

```html
<div class="text-red-500 text-blue-500">文字</div>
```

很多人以为最后的 `text-blue-500` 一定赢。

实际上最终取决于 Tailwind 生成 CSS 的规则顺序，而不是 HTML class 字符串顺序。

```txt
HTML class 顺序
    不等于
CSS 规则出现顺序
```

这就是为什么 Tailwind 有冲突合并工具，例如 `tailwind-merge`，用来处理同组工具类冲突。

### 案例 3：文章区基础样式容易被覆盖

组件库可以这样写基础样式：

```css
:where(.article h1) {
  font-size: 28px;
  margin-bottom: 16px;
}
```

业务方要覆盖：

```css
.article-title {
  font-size: 32px;
}
```

因为 `:where()` 是 0 权重，业务 class 很容易覆盖。

这是一种“刻意降低优先级”的设计。

---

## 第七部分：面试高频问题

### 1. CSS 优先级怎么算？

回答：

常用 specificity 可以看成四位：内联样式、ID、类/属性/伪类、标签/伪元素。比较时从高位到低位逐级比较，不是简单加分。除此之外还要考虑样式来源、`!important`、`@layer` 和书写顺序。

面试官为什么问：

这是判断你能否排查样式覆盖问题的基础。

### 2. 后写的样式一定覆盖先写的吗？

回答：

不一定。只有在来源、重要性、层级、优先级都相同的情况下，后写才覆盖先写。如果前面的选择器优先级更高，后写也不一定赢。

面试官为什么问：

看你是否只记住“后写覆盖先写”这个半截规则。

### 3. `!important` 是最高优先级吗？

回答：

不能简单说最高。`!important` 提升的是某条声明的重要性，在普通作者样式里通常能覆盖普通声明，但仍要考虑来源、层叠层、同为 important 时的优先级和顺序等规则。工程上不建议滥用。

面试官为什么问：

看你是否理解层叠规则，而不是遇事就加 important。

### 4. 内联样式怎么覆盖？

回答：

普通外部选择器一般覆盖不了内联样式。可以用带 `!important` 的作者样式覆盖普通内联样式，或者更推荐从设计上避免内联写死，把状态转成 class、CSS 变量或组件 API。

面试官为什么问：

这是组件库、React 动态样式、第三方插件样式冲突的常见问题。

### 5. `:where()` 为什么权重是 0？

回答：

`:where()` 的设计目的就是让开发者能写出有范围约束但容易被覆盖的选择器。它的参数不参与优先级，整体权重为 0，适合 reset、组件库默认样式等场景。

面试官为什么问：

这是现代 CSS 和工程化 CSS 设计意识的结合题。

### 6. 继承来的样式和直接命中的样式谁优先？

回答：

直接命中的样式优先于继承来的样式。即使父元素选择器权重更高，只要子元素有直接命中的声明，通常子元素自己的声明会生效。

面试官为什么问：

这题容易把“父选择器权重”和“继承机制”混在一起。

---

## 第八部分：容易踩坑

### 坑 1：以为 class 写在 HTML 后面就更强

```html
<div class="red blue"></div>
```

最终颜色不由 `red`、`blue` 在 HTML 里的顺序决定，而由 CSS 规则决定：

```css
.blue {
  color: blue;
}

.red {
  color: red;
}
```

最终是红色，因为 `.red` 规则后出现。

### 坑 2：选择器越写越重

一开始：

```css
.title {
  color: red;
}
```

覆盖不了后：

```css
.page .card .title {
  color: blue;
}
```

再覆盖不了：

```css
body .page .content .card .title {
  color: green;
}
```

最后只能：

```css
.title {
  color: purple !important;
}
```

这就是优先级失控。

更好的工程策略：

- 组件样式用 class 控制。
- 避免 ID。
- 避免过深选择器。
- 组件库样式用 token/API 覆盖。
- 基础样式用 `:where()` 降低权重。

### 坑 3：忽略 shorthand 覆盖 longhand

```css
.box {
  border-color: red;
}

.box {
  border: 1px solid blue;
}
```

最终 `border-color` 是蓝色，因为 `border` 简写包含了颜色。

### 坑 4：被浏览器默认样式影响

你写：

```css
button {
  color: inherit;
}
```

但按钮还有默认边框、背景、字体、padding。因为浏览器默认样式里按钮本来就有一堆样式。

大型项目常会统一处理：

```css
button,
input,
textarea,
select {
  font: inherit;
}
```

### 坑 5：`!important` 让后续维护变难

加了：

```css
.modal {
  z-index: 9999 !important;
}
```

后续另一个弹层想覆盖，只能更 important 或更换架构。

`!important` 应该像应急工具，不应该是日常布局方法。

---

## 第九部分：知识关联

```txt
优先级
├── 选择器
│   ├── ID
│   ├── class
│   ├── 属性
│   ├── 伪类
│   ├── 标签
│   └── 伪元素
│
├── 层叠 Cascading
│   ├── 来源
│   ├── 重要性
│   ├── @layer
│   ├── specificity
│   └── source order
│
├── 继承
│   ├── inherited value
│   └── direct matched value
│
├── 工程化
│   ├── CSS Modules
│   ├── BEM
│   ├── Tailwind
│   ├── CSS-in-JS
│   └── 组件库主题系统
│
└── 调试
    ├── DevTools Styles
    ├── Computed
    ├── 被划掉的声明
    └── CSS 文件加载顺序
```

你读别人 CSS 时，可以按这个顺序判断：

```txt
1. 这条规则有没有命中元素？
2. 这个属性有没有被其他声明覆盖？
3. 覆盖它的是 important、权重还是顺序？
4. 这个值是不是继承来的？
5. 有没有 shorthand 覆盖 longhand？
```

---

## 第十部分：总结

优先级的核心：

```txt
CSS 不是后写一定赢
而是先按层叠规则裁决
最后同级才看书写顺序
```

脑图：

```txt
CSS 优先级
├── 样式来源
│   ├── 浏览器默认样式
│   ├── 用户样式
│   └── 作者样式
│
├── 重要性
│   ├── 普通声明
│   └── !important
│
├── specificity
│   ├── inline style  (1,0,0,0)
│   ├── #id           (0,1,0,0)
│   ├── .class        (0,0,1,0)
│   ├── [attr]        (0,0,1,0)
│   ├── :hover        (0,0,1,0)
│   ├── tag           (0,0,0,1)
│   └── ::before      (0,0,0,1)
│
├── 特殊选择器
│   ├── :is()   取参数最高权重
│   ├── :not()  取参数最高权重
│   ├── :has()  取参数最高权重
│   └── :where() 永远 0 权重
│
├── 顺序
│   └── 同级后写覆盖先写
│
└── 工程建议
    ├── class 为主
    ├── 少用 ID
    ├── 少用 !important
    ├── 避免深层选择器
    ├── 基础样式可用 :where()
    └── 优先用组件库主题/API 覆盖
```

一句话记忆：

```txt
先看来源和 important，再看权重，最后同级看顺序。
```

---

## 练习题

### 练习 1：计算优先级

请写出下面选择器的优先级：

```css
.btn
#app .btn
button.btn:hover
.card > .title::before
:is(.a, #b)
:where(#app .title)
```

### 练习 2：判断最终颜色

```html
<p id="intro" class="text primary" style="color: green;">Hello</p>
```

```css
p {
  color: black;
}

.text {
  color: red;
}

.primary {
  color: blue;
}

#intro {
  color: purple;
}
```

最终颜色是什么？为什么？

### 练习 3：继承题

```html
<div class="parent">
  <p class="child">文字</p>
</div>
```

```css
.parent {
  color: red;
}

p {
  color: blue;
}
```

最终 `p` 是什么颜色？为什么不是看 `.parent` 和 `p` 谁权重更高？

### 练习 4：面试题

请用自己的话回答：

```txt
为什么大型项目里要控制选择器优先级？你会怎么避免优先级失控？
```

---

本节结束。你回复“继续”，我再进入第 4 节：继承。你回复“复习”，我会先通过提问帮你回忆优先级，再讲解薄弱点。
