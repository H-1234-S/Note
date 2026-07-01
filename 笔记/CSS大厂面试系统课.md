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
| padding 16px                 |
|  +------------------------+  |
|  | 图片                   |  |
|  +------------------------+  |
|  旗舰手机                    |
|  限时优惠，立减 500 元        |
|  +----------+                |
|  | 立即购买 |                |
|  +----------+                |
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

`top/left` 改变布局位置，可能触发 Layout；`transform` 改变的是视觉变换，通常不影响文档流和兄弟元素布局，可以在合成阶段完成，所以更适合动画。

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
