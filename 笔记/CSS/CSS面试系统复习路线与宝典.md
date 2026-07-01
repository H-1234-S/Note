# CSS 面试系统复习路线与宝典

面向目标：一线互联网大厂前端开发岗位。  
学习原则：不是背 API，而是建立“CSS 规则如何被浏览器理解、计算、布局、绘制、合成”的完整心智模型。  
主线：CSS 语法与规则 -> 盒模型 -> 布局 -> 定位 -> 层叠 -> 渲染流水线 -> 动画 -> 响应式 -> 现代 CSS -> 性能 -> 工程化 -> 浏览器底层。

---

## 0. 复习总路线

1. 先理解 CSS 在浏览器中的位置：HTML 生成 DOM，CSS 生成 CSSOM，二者合成 Render Tree，再进入 Style、Layout、Paint、Composite。
2. 再掌握规则系统：选择器、层叠、继承、优先级、初始值、计算值、使用值、实际值。
3. 然后掌握布局系统：盒模型、格式化上下文、正常流、浮动、定位、Flex、Grid。
4. 接着理解视觉系统：层叠上下文、绘制顺序、合成层、动画、GPU 加速。
5. 最后进入真实工程：响应式、工程化、性能优化、框架结合、浏览器 Style Invalidations。

面试回答方法：

1. 先给结论。
2. 再解释浏览器过程。
3. 对比替代方案。
4. 说性能影响。
5. 给真实业务例子。
6. 补充易错点和边界条件。

---

# 1. CSS 基础：规则、CSSOM、层叠与选择器

## 1.1 学习目标

学完本章你应该能够：

- 解释 CSS 从下载、解析到参与渲染的完整流程。
- 区分 CSSOM、DOM、Render Tree 的职责。
- 熟练计算选择器权重，并理解 Cascade、Inheritance、Initial、unset、revert。
- 从浏览器匹配选择器的角度解释为什么复杂选择器会影响 Style Calculation。
- 面试中能把“样式为什么生效/不生效”讲清楚，而不是只说“优先级问题”。

## 1.2 核心知识

### 是什么

CSS 是一套声明式样式规则。浏览器会把 CSS 文本解析成 CSSOM，即 CSS Object Model。CSSOM 不是页面最终显示结果，而是“样式规则树”。浏览器还需要把 DOM 节点与 CSS 规则匹配，计算每个元素最终样式，生成可用于布局和绘制的 Render Tree。

CSS 样式最终值大致经历：

- specified value：声明值，例如 `width: 50%`。
- computed value：计算值，例如继承、变量、相对单位初步计算后的值。
- used value：布局阶段可用的值，例如百分比宽度基于包含块算出具体像素。
- actual value：经过设备、字体、最小值限制后真正使用的值。

### 为什么这样设计

CSS 的核心设计思想是“声明式 + 层叠 + 继承”。浏览器面对的是大量来源不同的样式：用户代理样式、用户样式、作者样式、内联样式、动画、过渡、重要声明。层叠机制提供了一套确定性规则，使同一个元素的同一个属性最终能得到唯一结果。

### 怎么实现

CSS 加载流程：

1. HTML 解析器遇到外部样式表 `<link rel="stylesheet">`。
2. 发起网络请求。
3. CSS 解析器把字节流解码、词法分析、语法分析，生成 CSSOM。
4. DOM 与 CSSOM 合成 Render Tree。
5. 进入 Style Calculation、Layout、Paint、Composite。

CSS 通常会阻塞渲染，因为浏览器必须知道元素样式才能进行首屏布局和绘制。但 CSS 不一定阻塞 DOM 解析。JavaScript 可能被 CSS 间接阻塞，因为脚本执行时可能读取样式或布局信息，浏览器需要先保证 CSSOM 可用。

### 原理

浏览器匹配选择器通常是从右向左。比如 `.card .title span`，浏览器会先找所有 `span`，再向祖先检查是否有 `.title` 和 `.card`。这样做的原因是右侧 key selector 能快速缩小候选元素集合。如果从左到右，`.card` 可能匹配很多祖先，需要遍历大量后代，成本更不可控。

选择器权重：

- 内联样式：`1,0,0,0`
- ID：`0,1,0,0`
- 类、属性、伪类：`0,0,1,0`
- 元素、伪元素：`0,0,0,1`
- 通配符、组合符不增加权重。
- `:where()` 权重为 0。
- `:is()`、`:not()`、`:has()` 的权重取参数中最高者。

层叠判断顺序：

1. 来源与重要性：UA、用户、作者、`!important`、动画、过渡。
2. 层叠层 `@layer` 顺序。
3. 选择器权重。
4. 书写顺序，后声明覆盖前声明。

继承：

- 可继承属性主要是文本相关属性，如 `color`、`font-family`、`line-height`。
- 盒模型、布局属性通常不继承，如 `margin`、`padding`、`display`。

关键字：

- `initial`：恢复到 CSS 规范定义的初始值。
- `inherit`：强制继承父元素计算值。
- `unset`：可继承属性等同 `inherit`，不可继承属性等同 `initial`。
- `revert`：回滚到上一个样式来源的值，例如作者样式回滚到用户或 UA 样式。
- `revert-layer`：回滚到上一个层叠层。

### 面试考法

面试官常用“为什么我的样式不生效”“为什么选择器从右向左匹配”“CSS 会不会阻塞渲染”来判断你是否理解浏览器底层流程。好的回答不要停在优先级，而要讲到 CSSOM、Style Calculation、规则匹配、层叠来源和性能影响。

### 实际应用

在大型后台系统中，经常出现组件库样式、业务样式、主题样式互相覆盖。推荐用低权重基础样式加 `@layer` 或 CSS Modules 管理边界，而不是堆叠 ID、深层选择器和 `!important`。这样能降低后续维护成本，也减少样式失控。

### 易错点

- 误以为 CSS 选择器匹配是从左到右。现代浏览器核心匹配思路通常从右向左。
- 误以为 `inherit` 是默认行为。实际上只有部分属性默认继承。
- 误以为 `initial` 等于浏览器默认样式。`initial` 是规范初始值，不一定等于 UA 样式。
- 误以为 `!important` 永远最大。过渡声明、来源层级、用户重要样式等也会影响结果。

## 1.3 高频面试题

1. CSSOM 是什么？和 DOM 有什么区别？
   - 为什么问：考察你是否理解 CSS 参与渲染的形态。
   - 考察点：CSS 解析、规则树、Render Tree。
   - 分层回答：CSS 文本 -> CSSOM；DOM 描述结构；二者结合生成渲染树。
   - 追问：CSSOM 会阻塞什么？
   - 加分：说到脚本读取样式时会触发样式计算。

2. CSS 加载会阻塞页面渲染吗？
   - 为什么问：考察关键渲染路径。
   - 回答：外部 CSS 通常阻塞首次渲染，因为布局和绘制依赖样式；不一定阻塞 DOM 解析；会阻塞依赖样式的 JS 执行。
   - 加分：提到 critical CSS、media 属性、preload。

3. 选择器为什么从右向左匹配？
   - 为什么问：考察选择器性能与浏览器实现。
   - 回答：右侧 key selector 能先缩小候选集合，再向祖先验证组合关系。
   - 追问：如何优化？
   - 加分：强调现代浏览器已高度优化，业务中更重要的是降低复杂性和 invalidation 范围。

4. `initial`、`unset`、`revert` 有什么区别？
   - 为什么问：考察层叠和继承。
   - 回答：分别是规范初始值、按是否继承二选一、回滚到上一个来源。
   - 加分：举 `display: initial` 可能变成 `inline` 的例子。

5. `:is()` 和 `:where()` 的权重区别？
   - 为什么问：考察现代 CSS。
   - 回答：`:is()` 取参数最高权重，`:where()` 始终为 0。
   - 加分：说明 `:where()` 适合写可覆盖的基础样式。

6. 内联样式一定比外部样式优先吗？
   - 回答：普通作者外部样式不如内联；但外部样式加 `!important` 可以覆盖普通内联样式，内联 `!important` 又更高。

7. 伪类和伪元素区别？
   - 回答：伪类描述元素状态或关系，伪元素创建元素的某个可样式化部分。

8. 为什么不推荐滥用 ID 选择器？
   - 回答：权重过高，复用性差，覆盖困难；大型项目会造成样式债务。

## 1.4 常见陷阱

- 陷阱：认为选择器越短性能一定越好。
  - 为什么错：现代浏览器对选择器匹配有缓存和索引，绝大多数业务瓶颈不是选择器长度，而是频繁 DOM 变更导致大范围 Style Invalidations。
  - 正解：写低复杂度、低耦合、低权重选择器，减少无谓祖先依赖。

- 陷阱：用 `* { box-sizing: border-box }` 后以为所有盒模型问题消失。
  - 正解：它只改变尺寸计算，不影响 margin 合并、BFC、包含块、格式化上下文。

## 1.5 实战案例

问题：组件库按钮样式被业务页面覆盖，导致同一个按钮在不同页面颜色不同。

定位：

1. DevTools Computed 查看最终样式。
2. Styles 面板观察哪条规则覆盖。
3. 检查来源、权重、`@layer`、加载顺序。

优化：

- 组件库用稳定类名和低权重结构。
- 业务侧用主题变量覆盖，而不是深层选择器。
- 引入 CSS Modules 或 `@layer reset, base, components, utilities, overrides`。

为什么这么优化：让覆盖关系从“偶然的加载顺序和权重大战”变成“可设计的层叠顺序”。

## 1.6 和其它知识的联系

- HTML：DOM 结构决定选择器匹配和继承路径。
- JavaScript：读写样式可能触发 Style/Layout。
- React/Vue：组件样式隔离、动态 class、CSS Modules 都依赖层叠理解。
- 性能优化：复杂选择器本身不是唯一问题，Style Invalidations 更关键。
- 工程化：BEM、Atomic CSS、CSS-in-JS 都是在管理层叠和作用域。

## 1.7 本章知识导图

- CSS 基础
  - CSS 加载
    - 下载
    - 解析
    - CSSOM
    - 阻塞渲染
  - 层叠
    - 来源
    - `@layer`
    - 权重
    - 顺序
  - 继承
    - 默认继承
    - `inherit`
    - `initial`
    - `unset`
    - `revert`
  - 选择器
    - 从右向左匹配
    - 伪类
    - 伪元素
    - 现代伪类

## 1.8 渐进式面试题

基础：

1. CSSOM 是什么？推荐思路：CSS 文本解析后的对象模型，参与 Render Tree 构建。
2. CSS 优先级怎么算？推荐思路：来源、层、权重、顺序。
3. 哪些属性默认继承？推荐思路：文本类多继承，布局类多不继承。

中等：

4. CSS 会阻塞 JS 吗？推荐思路：JS 可能读取样式，浏览器需保证 CSSOM。
5. `:where()` 为什么适合基础样式？推荐思路：权重为 0，易覆盖。
6. 如何设计一套可维护的全局样式？推荐思路：reset/base/components/utilities/overrides。

困难：

7. 浏览器如何做 Style Invalidations？推荐思路：DOM/class/属性变化会标记受影响节点，局部或全局重算。
8. 为什么现代浏览器里选择器性能一般不是最大瓶颈？推荐思路：索引、缓存、实际瓶颈多是布局和绘制。
9. 如何排查线上样式污染？推荐思路：Computed、来源链路、加载顺序、作用域、工程化隔离。

---

# 2. 盒模型、Margin、BFC

## 2.1 学习目标

- 掌握标准盒模型、IE 盒模型和 `box-sizing` 的差异。
- 理解 margin 合并的规则与原因。
- 深入理解 BFC 是什么、为什么存在、如何触发、业务中怎么用。
- 能从 Layout 阶段解释盒模型如何影响页面几何计算。

## 2.2 核心知识

### 是什么

CSS 盒模型把每个元素看作矩形盒子，由 content、padding、border、margin 组成。标准盒模型中 `width` 指 content 宽度；IE 盒模型中 `width` 包含 content、padding、border。`box-sizing: border-box` 可以让声明宽度包含 padding 和 border。

### 为什么

浏览器布局本质是在计算每个盒子的几何信息：宽高、位置、边距、边框、滚动区域。盒模型把视觉区域与布局间距拆开，使不同属性影响不同阶段：

- `width/height` 影响 Layout。
- `padding/border` 影响盒子尺寸，通常触发 Layout。
- `margin` 影响盒子外部空间，通常触发 Layout。
- `outline` 不占布局空间，通常只影响 Paint。

### BFC 是什么

BFC，即 Block Formatting Context，块级格式化上下文。它是一块独立的布局区域，内部块级盒子按规则垂直排列，内部浮动参与高度计算，外部元素不会影响内部布局。

常见触发条件：

- 根元素。
- `float` 不为 `none`。
- `position: absolute/fixed`。
- `display: flow-root`。
- `overflow` 不为 `visible/clip` 的常见情况。
- `display: inline-block`、表格相关、Flex/Grid item 等。
- `contain: layout/paint/content`。

### 为什么会产生 BFC

BFC 是浏览器为“块布局隔离”设计的机制。早期 CSS 需要同时支持普通流、浮动、清除浮动、外边距合并。如果所有元素都在一个全局布局上下文中互相影响，布局计算会非常混乱。BFC 相当于给某些区域建立独立布局边界：内部浮动不能跑到外面，外部浮动也不能侵入内部，margin 合并受到边界限制。

### 浏览器内部怎么实现

在 Layout 阶段，浏览器会为不同盒子创建布局对象。遇到 BFC 根时，会创建独立的 block formatting context。布局算法在该上下文中计算子块的垂直位置、margin 合并、浮动避让和高度包裹。BFC 边界让浏览器可以局部计算，减少跨区域相互影响。

### Margin 合并

会合并的典型场景：

- 相邻兄弟块级元素上下 margin 合并。
- 父元素和第一个/最后一个子元素 margin 在没有 border、padding、inline content、height、min-height 等阻隔时合并。
- 空块自身上下 margin 合并。

不会合并的情况：

- Flex/Grid 容器内的项目 margin 不合并。
- BFC 边界隔开。
- 有 border、padding、inline content、overflow 等阻隔。
- 绝对定位、浮动元素通常不参与普通块流 margin 合并。

### 面试考法

面试官会问“清除浮动有哪些方式”“为什么 overflow hidden 可以清浮动”“BFC 有什么作用”。希望你说出这不是魔法，而是创建了新的格式化上下文，使内部浮动参与该上下文高度计算。

### 实际应用

- 清除浮动：`.clearfix::after { content: ""; display: block; clear: both; }` 或父元素 `display: flow-root`。
- 防止 margin 穿透：父元素加 `padding-top: 1px`、border、`overflow: hidden` 或 `display: flow-root`。
- 两栏布局避开浮动：左侧 float，右侧 BFC。

### 易错点

- `outline` 不占空间，不参与盒模型尺寸计算。
- `overflow: hidden` 清浮动会裁剪内容，现代更推荐 `display: flow-root`。
- BFC 不是“脱离文档流”，它是布局上下文。
- margin 合并只发生在块格式化上下文中的垂直方向。

## 2.3 高频面试题

1. 标准盒模型和 IE 盒模型区别？
   - 考察：尺寸计算。
   - 回答：标准 `width=content`，IE `width=content+padding+border`。
   - 加分：业务中组件宽度稳定常用 `border-box`。

2. `box-sizing: border-box` 为什么常用于全局？
   - 考察：布局稳定性。
   - 回答：添加 padding/border 不会撑破声明宽度。
   - 追问：是否影响 margin？不影响。

3. margin 合并有哪些规则？
   - 考察：正常流块布局。
   - 回答：兄弟、父子、空块；只在垂直方向；BFC 可阻断。

4. BFC 是什么？
   - 考察：格式化上下文。
   - 回答：独立块级布局区域，内部布局与外部隔离。

5. 为什么 BFC 能清除浮动？
   - 回答：BFC 计算高度时会包含内部浮动元素。
   - 加分：推荐 `display: flow-root`。

6. `overflow: hidden` 有什么副作用？
   - 回答：会裁剪溢出内容，影响 sticky、阴影、下拉浮层等。

7. Flex item 的 margin 会合并吗？
   - 回答：不会，Flex 布局不使用块格式化上下文的 margin 合并规则。

8. `border-box` 会不会改变元素实际占据空间？
   - 回答：会改变 width 的解释方式，但 margin 仍在盒子外部。

## 2.4 常见陷阱

- 陷阱：父元素高度塌陷就是因为子元素脱离文档流。
  - 正解：浮动元素脱离普通流，但仍影响浮动布局；父元素普通流高度不包含浮动，所以看起来塌陷。

- 陷阱：BFC 可以解决所有布局问题。
  - 正解：BFC 解决的是块布局隔离、浮动、margin 合并等问题；现代复杂布局优先 Flex/Grid。

## 2.5 实战案例

问题：卡片列表中图片浮动后，卡片背景高度为 0。

定位：

1. DevTools 查看父元素高度。
2. 确认子元素 `float: left/right`。
3. 检查父元素是否创建 BFC 或 clearfix。

优化：

```css
.card {
  display: flow-root;
}
```

原因：`flow-root` 明确创建 BFC，无裁剪副作用，比 `overflow: hidden` 更语义化。

## 2.6 和其它知识的联系

- 浏览器渲染：盒模型主要影响 Layout。
- Flex/Grid：替代大量传统 float/BFC 布局方案。
- 性能：频繁修改盒模型尺寸会触发布局。
- React/Vue：组件容器尺寸变化会影响子组件布局和重渲染后的布局计算。

## 2.7 本章知识导图

- 盒模型
  - content
  - padding
  - border
  - margin
  - outline
- `box-sizing`
  - content-box
  - border-box
- Margin 合并
  - 兄弟
  - 父子
  - 空块
- BFC
  - 触发条件
  - 清浮动
  - 阻止 margin 合并
  - 浮动避让

## 2.8 渐进式面试题

基础：

1. `box-sizing` 有哪些值？推荐思路：content-box、border-box。
2. padding 会影响元素尺寸吗？推荐思路：看盒模型类型。
3. outline 和 border 区别？推荐思路：是否占布局空间。

中等：

4. margin 合并怎么解决？推荐思路：BFC、padding、border、改变布局模式。
5. `overflow: hidden` 为什么能清浮动？推荐思路：创建 BFC。
6. 为什么 `flow-root` 更适合清浮动？推荐思路：语义明确，无裁剪副作用。

困难：

7. 从 Layout 算法解释 BFC 的作用。推荐思路：独立上下文，内部块流、浮动、高度计算。
8. 如何排查复杂页面高度塌陷？推荐思路：查看 formatting context、float、position、display。
9. BFC 和 stacking context 有什么不同？推荐思路：一个管布局，一个管绘制层叠。

---

# 3. 布局：Normal Flow、Float、Flex、Grid、Multi-column

## 3.1 学习目标

- 理解块、行内、行内块、浮动和定位在正常流中的行为。
- 掌握 Flex 和 Grid 的布局算法核心。
- 能回答 Flex 与 Grid 如何选择。
- 能把布局方案与浏览器 Layout 阶段关联起来。

## 3.2 核心知识

### 是什么

CSS 布局决定元素盒子在页面中的几何位置。常见布局模型：

- Normal Flow：块级盒垂直排列，行内盒在行盒中水平排列。
- Float：让元素浮动到一侧，文本环绕，早期常被用于多列布局。
- Position：相对、绝对、固定、粘性定位。
- Flex：一维布局，按主轴分配空间。
- Grid：二维布局，按行列网格分配空间。
- Multi-column：文本多列排版。

### 为什么 Flex 能成为现代布局

传统布局需要依赖 float、inline-block、负 margin、百分比宽度等技巧，很难处理垂直居中、等高列、自适应空间分配、顺序调整。Flex 把常见 UI 布局抽象为“容器 + 项目 + 主轴/交叉轴”，使空间分配、对齐和伸缩成为浏览器内置算法。

### Flex 布局算法简化版

1. 确定主轴和交叉轴。
2. 生成 flex items，处理 `display: none` 等。
3. 确定每个 item 的 flex base size，来源可能是 `flex-basis`、`width/height`、内容尺寸。
4. 按 `flex-wrap` 分行。
5. 计算每行剩余空间。
6. 若有正空间，按 `flex-grow` 分配。
7. 若空间不足，按 `flex-shrink * flex base size` 收缩。
8. 应用 min/max 限制，必要时重新分配。
9. 处理主轴对齐 `justify-content`。
10. 处理交叉轴尺寸和 `align-items/align-content`。

性能影响：Flex 布局需要计算项目尺寸、内容贡献和伸缩比例，复杂嵌套 Flex 在频繁尺寸变化时会增加 Layout 成本。

### Grid 布局算法简化版

1. 解析显式网格：`grid-template-rows/columns`。
2. 放置显式定位项目。
3. 自动放置未定位项目。
4. 计算 track sizing：固定尺寸、百分比、`fr`、`minmax()`、内容尺寸。
5. 分配剩余空间。
6. 处理对齐和溢出。

Grid 强在二维布局。`fr` 不是简单百分比，它代表剩余空间分配单位，并受到内容最小尺寸影响。

### Flex 与 Grid 如何选择

- 一维排列、组件内部布局、导航、按钮组、表单行：优先 Flex。
- 二维页面结构、看板、图片墙、复杂仪表盘：优先 Grid。
- 不确定换行后的二维对齐：Grid 更适合。
- 内容驱动的一行或一列：Flex 更轻。

### 面试考法

面试官常问 `flex: 1` 是什么、为什么子元素不收缩、Grid 和 Flex 区别、如何实现圣杯布局。核心不是背属性，而是讲空间分配算法。

### 实际应用

- 后台管理系统：侧边栏 + 主区域，用 Grid 管整体，Flex 管工具栏。
- 商品卡片：卡片内标题、价格、按钮用 Flex，列表容器用 Grid。
- IM 聊天：消息列表主轴滚动，输入区固定，整体可用 Flex column。

### 易错点

- `flex: 1` 等价常见理解是 `flex: 1 1 0%`，不是单纯 `flex-grow: 1`。
- Flex item 默认 `min-width: auto`，内容可能撑破容器，需要 `min-width: 0`。
- `justify-content` 管主轴，`align-items` 管交叉轴，但轴方向会被 `flex-direction` 改变。
- Grid 的 `fr` 受最小内容尺寸影响，不是绝对均分。

## 3.3 高频面试题

1. Flex 布局原理是什么？
   - 考察：主轴空间分配。
   - 回答：flex base size、剩余空间、grow/shrink、对齐。
   - 加分：提 min-width:auto 陷阱。

2. `flex: 1` 代表什么？
   - 回答：通常展开为 `flex-grow:1; flex-shrink:1; flex-basis:0%`。
   - 追问：和 `flex:auto` 区别？`auto` 基于自身尺寸参与分配。

3. Flex 和 Grid 区别？
   - 回答：Flex 一维，Grid 二维；Flex 内容驱动，Grid 容器网格更强。

4. 如何实现水平垂直居中？
   - 回答：Flex/Grid/absolute+transform；说明适用场景和副作用。

5. 为什么 Flex 子元素文字会撑开容器？
   - 回答：Flex item 默认最小宽度为内容最小宽度，设置 `min-width:0`。

6. `inline-block` 有什么问题？
   - 回答：HTML 空白间隙、基线对齐、垂直对齐复杂。

7. Float 的原始设计用途是什么？
   - 回答：图文环绕，不是现代页面主布局。

8. Grid 中 `auto-fit` 和 `auto-fill` 区别？
   - 回答：`auto-fill` 保留空轨道，`auto-fit` 折叠空轨道。

## 3.4 常见陷阱

- 陷阱：Flex 可以完全替代 Grid。
  - 正解：Flex 是一维算法，Grid 是二维算法；二维对齐、跨行跨列优先 Grid。

- 陷阱：`fr` 等于百分比。
  - 正解：`fr` 分配剩余空间，且受 min-content、max-content 约束。

## 3.5 实战案例

问题：后台表格页顶部搜索栏，输入框在小屏下把按钮挤出屏幕。

定位：

1. 搜索栏使用 Flex。
2. 输入框内容较长。
3. Flex item 默认 `min-width: auto`。

优化：

```css
.search-input {
  flex: 1 1 240px;
  min-width: 0;
}
```

为什么：允许输入框在空间不足时真正收缩，避免布局溢出。

## 3.6 和其它知识的联系

- 盒模型：Flex/Grid 分配的是盒子的可用空间。
- 响应式：Grid 与 `minmax()`、`auto-fit` 能减少媒体查询。
- 性能：复杂嵌套布局在尺寸变化时增加 Layout 成本。
- React/Vue：组件树变化会触发布局重新计算。

## 3.7 本章知识导图

- 布局模型
  - Normal Flow
    - block
    - inline
    - inline-block
  - Float
  - Flex
    - 主轴
    - 交叉轴
    - grow
    - shrink
    - basis
  - Grid
    - tracks
    - areas
    - fr
    - auto-placement
  - Multi-column

## 3.8 渐进式面试题

基础：

1. block、inline、inline-block 区别？推荐思路：是否独占行、能否设宽高、行盒参与。
2. Flex 常用属性有哪些？推荐思路：容器属性和项目属性分开。
3. Grid 常用属性有哪些？推荐思路：template、gap、area、auto-flow。

中等：

4. `flex-basis` 和 `width` 谁优先？推荐思路：主轴上 `flex-basis` 优先，auto 时参考 width。
5. 如何实现自适应卡片列表？推荐思路：Grid + repeat(auto-fit, minmax())。
6. 多列等高布局怎么做？推荐思路：Flex/Grid，不再依赖假等高。

困难：

7. 讲一下 Flex 收缩算法。推荐思路：按 shrink * base size 分配负空间，再受 min/max 约束。
8. Grid track sizing 如何理解？推荐思路：固定、内容贡献、fr、minmax、剩余空间。
9. 如何设计复杂 dashboard 布局？推荐思路：Grid 管全局，Flex 管局部。

---

# 4. 定位：Containing Block、Offset、Transform

## 4.1 学习目标

- 掌握 relative、absolute、fixed、sticky 的定位规则。
- 理解 containing block 如何决定定位参考系。
- 解释 transform 为什么会影响 absolute/fixed。
- 能处理真实业务中的浮层、吸顶、弹窗、滚动容器定位问题。

## 4.2 核心知识

### 是什么

定位让元素偏离或增强正常流布局：

- `relative`：元素仍占据原位置，视觉上相对自身偏移。
- `absolute`：脱离普通流，相对 containing block 定位。
- `fixed`：相对视口定位，但会受某些祖先影响。
- `sticky`：在正常流和固定定位之间切换，依赖滚动容器。

### 为什么需要 containing block

绝对定位必须有参考坐标系。CSS 用 containing block 定义“百分比、offset、定位坐标的参照矩形”。这比简单“相对父元素”更准确，因为不同属性会创建不同参考系。

### containing block 规则

- 普通块元素的百分比宽度通常相对父级内容盒。
- `absolute` 相对最近的非 `static` 定位祖先的 padding box；如果没有则相对初始包含块。
- `fixed` 通常相对 viewport。
- 如果祖先有 `transform`、`filter`、`perspective`、某些 `contain`、`will-change` 等，可能为 absolute/fixed 创建 containing block。

### transform 为什么影响 fixed

`transform` 会创建新的坐标空间和 stacking context。浏览器为了正确合成变换后的子树，会把该元素作为包含块。于是内部 `position: fixed` 不再固定于视口，而是固定在 transform 祖先的坐标空间内。这在实现 GPU 合成和矩阵变换时更一致。

### sticky 原理

`sticky` 元素先按正常流布局，占据空间。当滚动容器滚动到指定阈值时，元素在滚动容器范围内表现得像 fixed。它不会脱离自己的滚动边界，父容器结束时 sticky 也会停止。

sticky 生效条件：

- 必须设置 `top/right/bottom/left` 之一。
- 祖先滚动容器和高度要明确。
- 祖先 `overflow` 可能改变 sticky 的滚动参照。

### 面试考法

常问“absolute 相对谁定位”“fixed 为什么失效”“sticky 为什么不生效”。面试官想看你是否理解定位参考系，而不是死记父元素。

### 实际应用

- 弹窗浮层：推荐渲染到 body 或 portal，避免被 transform/overflow 祖先限制。
- 吸顶导航：用 sticky，但要检查滚动容器。
- Tooltip：要考虑 containing block、滚动、缩放和碰撞检测。

### 易错点

- `relative` 偏移后原位置仍保留。
- `absolute` 不是一定相对父元素，而是相对最近定位祖先或特殊包含块。
- `fixed` 可能被 transform 祖先“困住”。
- sticky 不生效常因祖先 overflow 或没有阈值。

## 4.3 高频面试题

1. absolute 相对谁定位？
   - 回答：最近的非 static 定位祖先，或由 transform 等创建的 containing block。
   - 加分：提 padding box 和初始包含块。

2. relative 和 absolute 区别？
   - 回答：relative 保留普通流位置，absolute 脱离普通流。

3. fixed 为什么在某些容器内不固定视口？
   - 回答：transform/filter/perspective 等祖先创建 containing block。

4. sticky 为什么不生效？
   - 回答：未设置 top、滚动容器错误、祖先 overflow、父容器高度不足。

5. offset 百分比相对什么？
   - 回答：取决于属性和 containing block；定位 offset 参考包含块尺寸。

6. 弹窗为什么被裁剪？
   - 回答：祖先 overflow 或 stacking context 限制；可用 portal。

7. `transform: translate(-50%, -50%)` 中百分比相对谁？
   - 回答：相对元素自身尺寸。

8. fixed 和 sticky 的区别？
   - 回答：fixed 脱离流固定视口；sticky 占位，受滚动容器边界限制。

## 4.4 常见陷阱

- 陷阱：给弹窗 `z-index: 99999` 就能解决所有覆盖问题。
  - 正解：如果被 overflow 裁剪或处于低层叠上下文，z-index 再大也无效。

- 陷阱：sticky 总是相对 viewport。
  - 正解：sticky 相对最近滚动容器。

## 4.5 实战案例

问题：移动端页面底部客服按钮使用 fixed，但在一个加了 `transform: translateZ(0)` 的容器内滚动。

定位：

1. DevTools 找到 fixed 元素。
2. 向上查找 transform/filter/contain。
3. 发现页面根容器为优化动画加了 transform。

优化：

- 将 fixed 元素移动到 body 下。
- 或取消祖先 transform。
- React 中使用 Portal。

为什么：脱离被 transform 祖先创建的 containing block。

## 4.6 和其它知识的联系

- 层叠上下文：transform 同时影响定位与层叠。
- 动画：transform 动画性能好，但可能改变 fixed 行为。
- React/Vue：Modal/Popover 通常用 Portal/Teleport。
- 性能：top/left 动画会触发 Layout，transform 通常走 Composite。

## 4.7 本章知识导图

- 定位
  - static
  - relative
  - absolute
  - fixed
  - sticky
- containing block
  - 定位祖先
  - transform
  - filter
  - contain
- offset
  - top
  - right
  - bottom
  - left
- 业务场景
  - 弹窗
  - 吸顶
  - Tooltip

## 4.8 渐进式面试题

基础：

1. 四种 position 区别？推荐思路：是否脱离文档流、参考系、是否占位。
2. absolute 元素会影响父元素高度吗？推荐思路：不会参与普通流高度。
3. fixed 默认相对谁？推荐思路：viewport，但有例外。

中等：

4. transform 如何影响 fixed？推荐思路：创建 containing block 和新坐标空间。
5. sticky 失效怎么排查？推荐思路：阈值、滚动容器、overflow、高度。
6. tooltip 定位要考虑什么？推荐思路：参考元素、滚动、缩放、overflow、层叠。

困难：

7. 如何设计通用浮层系统？推荐思路：Portal、定位引擎、碰撞检测、层级管理。
8. fixed 在移动端有哪些坑？推荐思路：键盘、visual viewport、transform、滚动容器。
9. top/left 和 transform 位移动画有什么差异？推荐思路：Layout vs Composite。

---

# 5. 层叠上下文、z-index、合成层

## 5.1 学习目标

- 理解 stacking context 和 z-index 的真正作用范围。
- 掌握层叠顺序。
- 能解释 z-index 不生效的原因。
- 区分层叠上下文与 GPU 合成层。

## 5.2 核心知识

### 是什么

层叠上下文是一个独立的三维绘制上下文。内部元素按自己的层叠规则排序，整个上下文作为一个整体参与父上下文排序。

常见创建条件：

- 根元素。
- `position` 非 static 且 `z-index` 非 auto。
- `position: fixed/sticky`。
- Flex/Grid item 且 `z-index` 非 auto。
- `opacity < 1`。
- `transform` 非 none。
- `filter`、`perspective`、`clip-path`、`mix-blend-mode` 等。
- `isolation: isolate`。
- `contain: paint/layout`。
- `will-change` 指向会创建层叠上下文的属性。

### 层叠顺序

简化顺序：

1. 当前 stacking context 的背景和边框。
2. 负 z-index 子层叠上下文。
3. 普通流块级元素。
4. 浮动元素。
5. 行内元素。
6. z-index auto 或 0 的定位元素。
7. 正 z-index 子层叠上下文。

### 为什么 z-index 不生效

常见原因：

- 元素不是定位元素，旧理解中 `z-index` 对普通元素无效；现代 Flex/Grid item 是例外。
- 被父级 stacking context 限制，子元素 z-index 再高也越不过父级所在层。
- 祖先有 `opacity`、`transform` 等创建了新的上下文。
- 被 `overflow` 裁剪，和 z-index 无关。

### GPU 合成层

合成层是浏览器渲染优化概念，不等同于层叠上下文。浏览器可能把某些元素提升为单独图层，在 Composite 阶段由合成线程/GPU 组合。

可能触发合成层：

- 3D transform。
- `will-change: transform`。
- video/canvas。
- fixed/sticky。
- opacity/transform 动画。

合成层的优点是 transform/opacity 动画可避免 Layout/Paint；缺点是占用显存，过多会造成内存压力和合成开销。

## 5.3 高频面试题

1. 什么是层叠上下文？
   - 回答：独立绘制排序上下文，内部排序后整体参与外部排序。
   - 加分：说明它不是合成层。

2. z-index 为什么不生效？
   - 回答：定位条件、父层叠上下文限制、overflow 裁剪、上下文顺序。

3. opacity 会创建层叠上下文吗？
   - 回答：小于 1 会，因为需要整体透明度混合。

4. transform 会带来哪些影响？
   - 回答：创建层叠上下文、包含块、可能合成层、改变坐标系统。

5. 合成层越多越好吗？
   - 回答：不是，过多占显存、增加合成成本。

6. `isolation: isolate` 有什么用？
   - 回答：主动创建隔离上下文，控制混合和层叠边界。

7. Flex item 上 z-index 生效吗？
   - 回答：Flex/Grid item 即使不是定位元素，z-index 非 auto 也可创建层叠上下文。

8. 如何排查遮挡问题？
   - 回答：DevTools Layers、Computed、查 stacking context、overflow。

## 5.4 常见陷阱

- 陷阱：把 z-index 设置成无限大。
  - 正解：z-index 只在同一层叠上下文或父子上下文规则中比较。

- 陷阱：认为 transform 只是视觉变换。
  - 正解：它还会影响层叠、定位参考系、合成。

## 5.5 实战案例

问题：下拉菜单设置 `z-index: 9999` 仍被表格遮住。

定位：

1. 查看菜单祖先有 `transform`。
2. 表格外层另有层叠上下文且父级 z-index 更高。
3. 菜单被困在较低父上下文内。

优化：

- 下拉菜单 Portal 到 body。
- 建立统一 z-index token：dropdown、modal、toast、tooltip。
- 避免无意义 transform 创建上下文。

## 5.6 和其它知识的联系

- 定位：z-index 常与 position 一起使用。
- 动画：transform/opacity 动画改变层叠和合成。
- 性能：合成层能优化动画，但不能滥用。
- 工程化：设计系统需要统一层级规范。

## 5.7 本章知识导图

- 层叠上下文
  - 创建条件
  - 绘制顺序
  - z-index 范围
- z-index 问题
  - 非同上下文
  - overflow
  - transform
  - opacity
- 合成层
  - GPU
  - transform
  - opacity
  - will-change

## 5.8 渐进式面试题

基础：

1. z-index 默认值是什么？推荐思路：auto。
2. 哪些属性创建层叠上下文？推荐思路：position+z-index、opacity、transform 等。
3. z-index 可以为负吗？推荐思路：可以，但受上下文背景边框等顺序影响。

中等：

4. opacity 为什么创建上下文？推荐思路：整体透明度混合。
5. transform 对页面有什么副作用？推荐思路：上下文、包含块、合成。
6. 如何设计弹窗层级？推荐思路：统一 token、Portal、层级管理器。

困难：

7. 层叠上下文和合成层区别？推荐思路：绘制排序 vs 渲染优化。
8. 如何用 DevTools 排查图层问题？推荐思路：Layers、Paint flashing、Computed。
9. 合成层过多有什么问题？推荐思路：显存、上传纹理、合成开销。

---

# 6. 浏览器渲染：DOM、CSSOM、Render Tree、Layout、Paint、Composite

## 6.1 学习目标

- 掌握浏览器关键渲染路径。
- 区分 Reflow、Repaint、Composite。
- 能判断 CSS 属性变更会触发哪个阶段。
- 能把性能优化落到可执行策略。

## 6.2 核心知识

### 渲染流水线

1. Parse HTML -> DOM。
2. Parse CSS -> CSSOM。
3. Style Calculation：匹配规则、层叠、继承、计算样式。
4. Render Tree/Layout Tree：过滤不可见节点，建立布局对象。
5. Layout：计算几何位置和尺寸。
6. Paint：生成绘制指令，如文字、背景、边框、阴影。
7. Raster：栅格化为位图。
8. Composite：合成多个图层，输出到屏幕。

### Reflow/Layout

当元素几何信息变化，浏览器需要重新布局。典型属性：

- `width`、`height`
- `margin`、`padding`
- `border-width`
- `display`
- `position`、`top/left`
- `font-size`、`line-height`
- DOM 增删、内容变化

### Repaint/Paint

不改变布局但改变视觉绘制，需要重绘。典型属性：

- `color`
- `background`
- `box-shadow`
- `border-color`
- `visibility`

### Composite

只改变合成属性，通常可跳过 Layout 和 Paint。典型属性：

- `transform`
- `opacity`

注意：能否只走 Composite 取决于元素是否在合成层、浏览器优化、属性组合和上下文。

### 强制同步布局

JS 写入样式后立刻读取布局信息，如 `offsetWidth`、`getBoundingClientRect()`、`getComputedStyle()` 某些属性，会迫使浏览器提前完成样式和布局计算，这叫 layout thrashing。

### 面试考法

常问“哪些 CSS 会导致重排重绘”“为什么 transform 性能好”“如何优化动画卡顿”。高质量回答要用流水线解释。

## 6.3 高频面试题

1. 浏览器从输入 HTML 到页面显示经历什么？
   - 回答：DOM、CSSOM、Style、Layout、Paint、Composite。
   - 加分：提主线程、合成线程。

2. Reflow 和 Repaint 区别？
   - 回答：Reflow 计算几何，Repaint 更新像素绘制；Reflow 通常伴随 Paint。

3. 哪些属性触发重排？
   - 回答：影响布局几何的属性。

4. transform 为什么性能好？
   - 回答：通常只改变合成阶段，不重新计算布局和绘制。

5. 什么是强制同步布局？
   - 回答：写样式后读布局，浏览器被迫刷新队列。

6. `display:none` 和 `visibility:hidden` 性能区别？
   - 回答：前者移出布局树触发 Layout，后者保留布局只影响绘制/可见性。

7. `content-visibility` 有什么用？
   - 回答：跳过屏外内容布局和绘制，改善长页面性能。

8. 如何定位渲染性能问题？
   - 回答：Performance、Rendering 面板、Layout/Paint 记录、FPS。

## 6.4 常见陷阱

- 陷阱：所有 transform 都一定 GPU 加速。
  - 正解：浏览器可能提升合成层，但不是规范保证。

- 陷阱：重绘一定比重排便宜。
  - 正解：多数情况下重排更重，但复杂阴影、滤镜、大面积重绘也很昂贵。

## 6.5 实战案例

问题：拖拽列表时卡顿。

定位：

1. Performance 录制发现大量 Layout。
2. 拖拽中每帧修改 `top/left`。
3. 同时读取 `offsetHeight`。

优化：

- 拖拽位移改为 `transform: translate3d(...)`。
- 读写 DOM 分离，用 `requestAnimationFrame` 批处理。
- 被拖拽项提升合成层，谨慎使用 `will-change`。

## 6.6 和其它知识的联系

- 动画：选择 Composite 友好属性。
- 响应式：视口变化会触发大范围 Layout。
- 工程化：代码规范可避免频繁 layout thrashing。
- React/Vue：批量更新减少 DOM 写入，但读布局仍需谨慎。

## 6.7 本章知识导图

- 渲染流程
  - DOM
  - CSSOM
  - Style
  - Layout
  - Paint
  - Raster
  - Composite
- 性能类型
  - Reflow
  - Repaint
  - Composite
- 工具
  - Performance
  - Layers
  - Rendering

## 6.8 渐进式面试题

基础：

1. DOM 和 Render Tree 区别？推荐思路：结构树 vs 可渲染布局树。
2. `display:none` 会进入 Render Tree 吗？推荐思路：不会。
3. `opacity:0` 会占位吗？推荐思路：占位，仍可参与命中测试需注意。

中等：

4. 如何减少重排？推荐思路：批量读写、脱离文档流、transform。
5. 为什么读 offsetWidth 可能慢？推荐思路：触发同步布局。
6. 如何判断动画是否只走合成？推荐思路：Performance/Layers。

困难：

7. 讲一下浏览器关键渲染路径优化。推荐思路：减少阻塞资源、critical CSS、延迟非关键 CSS。
8. Style Calculation 为什么会变慢？推荐思路：规则数量、DOM 规模、invalidation 范围。
9. 长列表为什么卡？推荐思路：DOM 数量、Layout/Paint 成本、虚拟列表、content-visibility。

---

# 7. 动画：Transition、Animation、Transform、Opacity

## 7.1 学习目标

- 掌握 transition 和 animation 的适用场景。
- 理解 transform/opacity 性能优势。
- 能设计低卡顿的动效。
- 能解释 GPU 加速和 will-change 的边界。

## 7.2 核心知识

### 是什么

- `transition`：状态变化之间的过渡，适合 hover、展开收起、主题切换。
- `animation`：基于 keyframes 的时间轴动画，适合循环、复杂阶段动画。
- `transform`：对元素进行位移、缩放、旋转、倾斜，不影响普通流布局。
- `opacity`：透明度变化，常可在合成阶段完成。

### 为什么 transform 性能最好

`top/left/width/height` 会改变布局几何，触发 Layout。`box-shadow/filter` 可能触发昂贵 Paint。`transform/opacity` 通常只改变合成层的矩阵或透明度，浏览器可以在 Composite 阶段完成，主线程压力更小。

### GPU 加速

GPU 擅长纹理合成、矩阵变换、透明度混合。浏览器把某些元素栅格化成图层纹理后，后续 transform/opacity 变化只需要合成纹理。但图层提升不是免费的：纹理占显存，大图层会增加上传和合成成本。

### will-change

`will-change` 提前告诉浏览器某属性即将变化，浏览器可能提前创建合成层或做缓存。适合短时间、确定会发生的动画。不要全局滥用。

### 面试考法

面试官会问“为什么动画卡”“怎么优化轮播/拖拽/弹窗动画”。回答应包含属性选择、图层、主线程、合成线程、DevTools 验证。

## 7.3 高频面试题

1. transition 和 animation 区别？
   - 回答：transition 依赖状态变化，animation 有独立 keyframes 时间轴。

2. transform 为什么不影响文档流？
   - 回答：它是绘制/合成阶段的视觉变换，不改变 Layout 计算结果。

3. opacity 动画一定不会重绘吗？
   - 回答：通常可合成，但取决于图层和浏览器实现。

4. will-change 怎么用？
   - 回答：动画前短暂添加，结束后移除。

5. 如何实现展开收起动画？
   - 回答：不能直接从 height:auto 过渡到数值；可用 max-height、transform scale、JS 测量。

6. requestAnimationFrame 的作用？
   - 回答：在浏览器下一帧前执行动画更新，与刷新节奏同步。

7. CSS 动画和 JS 动画区别？
   - 回答：CSS 简单声明式，浏览器优化好；JS 控制强，容易引发布局抖动。

8. 滤镜动画为什么卡？
   - 回答：filter 常需要重绘或昂贵像素处理。

## 7.4 常见陷阱

- 陷阱：给所有动画元素加 `will-change`。
  - 正解：会造成过多合成层和显存压力。

- 陷阱：用 `height:auto` 做 transition。
  - 正解：auto 不是可插值数值，需替代方案。

## 7.5 实战案例

问题：移动端抽屉菜单滑出卡顿。

定位：

1. 原实现改变 `left`。
2. 每帧触发布局。
3. 菜单含阴影，大面积重绘。

优化：

```css
.drawer {
  transform: translateX(100%);
  transition: transform 240ms ease;
}

.drawer[data-open="true"] {
  transform: translateX(0);
}
```

必要时动画前添加 `will-change: transform`，结束后移除。

## 7.6 和其它知识的联系

- 渲染流程：动画属性决定 Layout/Paint/Composite。
- 层叠上下文：transform/opacity 可能创建上下文。
- React/Vue：动画状态由 class 驱动更利于浏览器优化。
- 性能：rAF、批量读写、减少大面积重绘。

## 7.7 本章知识导图

- 动画
  - transition
  - animation
  - keyframes
  - timing-function
- 高性能属性
  - transform
  - opacity
- 优化
  - will-change
  - rAF
  - 合成层

## 7.8 渐进式面试题

基础：

1. transition 必须满足什么条件？推荐思路：属性值变化且可插值。
2. animation 如何循环？推荐思路：iteration-count。
3. transform 有哪些函数？推荐思路：translate、scale、rotate、skew。

中等：

4. 为什么 transform 不影响周围元素？推荐思路：不参与 Layout。
5. 如何做列表进入动画？推荐思路：transform+opacity，避免 top。
6. 如何避免动画结束后图层占用？推荐思路：移除 will-change。

困难：

7. CSS 动画是否一定比 JS 快？推荐思路：看属性、主线程、控制复杂度。
8. 如何分析动画卡顿？推荐思路：Performance、FPS、Layers、Paint flashing。
9. 大图 transform 动画可能有什么问题？推荐思路：显存、纹理上传、合成成本。

---

# 8. 响应式：Viewport、Media Query、rem、vw、Container Query

## 8.1 学习目标

- 掌握移动端 viewport 与适配方案。
- 理解 rem、vw、vh、媒体查询、容器查询的适用场景。
- 能设计真实业务中的响应式布局策略。

## 8.2 核心知识

### 是什么

响应式设计让页面适配不同屏幕、窗口、容器和输入设备。核心工具：

- viewport meta。
- Media Query。
- 百分比、Flex、Grid。
- `rem`、`em`、`vw`、`vh`。
- `clamp()`。
- Container Query。

### Viewport

移动端常见：

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

它让布局视口宽度等于设备 CSS 像素宽度，避免页面按桌面宽度缩放。

### rem、vw、vh

- `rem` 相对根元素字体大小，适合整体缩放体系。
- `em` 相对当前或父级字体，适合组件内部相对尺寸。
- `vw/vh` 相对视口，适合全屏、流式尺寸。
- 移动端传统 `100vh` 受地址栏影响，现代可用 `svh/lvh/dvh`。

### Media Query

媒体查询基于视口或设备特征。常见断点不应只按设备型号，而应按内容何时需要改变布局来设置。

### Container Query

容器查询基于组件容器尺寸，而不是视口。它解决了组件复用问题：同一个卡片在侧栏和主区域中可以根据自身容器宽度改变布局。

```css
.card-list {
  container-type: inline-size;
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 160px 1fr;
  }
}
```

### 面试考法

常问移动端 1px、适配方案、rem 和 vw 区别、媒体查询和容器查询区别。要结合业务场景回答。

## 8.3 高频面试题

1. viewport meta 有什么作用？
   - 回答：控制布局视口宽度和缩放。

2. rem 和 em 区别？
   - 回答：rem 相对根字号，em 相对当前上下文。

3. vw 适配有什么问题？
   - 回答：极大/极小屏可能失控，需 clamp 限制。

4. 100vh 在移动端有什么坑？
   - 回答：浏览器地址栏变化导致高度不准确，可用 dvh/svh/lvh。

5. Media Query 和 Container Query 区别？
   - 回答：前者看视口，后者看容器。

6. 如何做移动端 1px 边框？
   - 回答：transform scale、伪元素、border-image、使用物理像素适配。

7. 响应式图片怎么做？
   - 回答：`srcset`、`sizes`、picture、CSS object-fit。

8. 断点如何设计？
   - 回答：以内容和布局断裂点为依据，而不是死记设备。

## 8.4 常见陷阱

- 陷阱：全站所有尺寸都用 vw。
  - 正解：文本、间距、容器需要 min/max/clamp 控制可读性。

- 陷阱：只用媒体查询做组件响应式。
  - 正解：组件复用场景更适合容器查询。

## 8.5 实战案例

问题：仪表盘卡片在 1440px 页面正常，但放到侧栏后内容挤压。

定位：组件只按 viewport 断点变化，不知道自身容器变窄。

优化：给卡片父容器启用 `container-type: inline-size`，组件内部使用 `@container`。

原因：组件响应应由可用空间决定，而不是全局窗口宽度。

## 8.6 和其它知识的联系

- Flex/Grid：响应式布局核心。
- 性能：视口变化会触发 Layout；容器查询也会参与样式计算。
- 设计系统：断点、间距、字号 token。
- 移动端：viewport、DPR、安全区 `env(safe-area-inset-*)`。

## 8.7 本章知识导图

- 响应式
  - viewport
  - media query
  - rem/em
  - vw/vh/dvh
  - clamp
  - container query
  - responsive image

## 8.8 渐进式面试题

基础：

1. 什么是 CSS 像素？推荐思路：逻辑像素，与 DPR 区分。
2. rem 适合什么？推荐思路：整体比例缩放。
3. 媒体查询怎么写？推荐思路：min-width 移动优先。

中等：

4. 如何设计移动端适配？推荐思路：viewport、流式布局、rem/vw、断点。
5. 解释 `clamp(16px, 2vw, 24px)`。推荐思路：最小、理想、最大。
6. 容器查询解决什么问题？推荐思路：组件上下文自适应。

困难：

7. 移动端键盘弹出影响布局怎么处理？推荐思路：visual viewport、dvh、输入区策略。
8. 如何构建设计系统断点？推荐思路：内容驱动、token 化、组件级响应。
9. 响应式和性能有什么冲突？推荐思路：大范围 Layout、图片资源、隐藏 DOM。

---

# 9. 现代 CSS：变量、函数、现代选择器、@layer、@scope、Nesting、Subgrid

## 9.1 学习目标

- 掌握现代 CSS 能力与工程价值。
- 理解变量、函数、层叠层、作用域如何降低复杂度。
- 能回答现代 CSS 如何替代部分预处理器和 JS 逻辑。

## 9.2 核心知识

### CSS Variables

CSS 自定义属性以 `--name` 定义，用 `var()` 使用。它们参与层叠和继承，运行时可变，适合主题、设计 token。

```css
:root {
  --color-primary: #1677ff;
}

.button {
  color: var(--color-primary);
}
```

浏览器会在计算值阶段解析变量。变量无效时可用 fallback：`var(--x, 12px)`。

### calc、clamp、min、max

- `calc()` 做单位混合计算。
- `clamp(min, preferred, max)` 控制响应式范围。
- `min()` 和 `max()` 做边界选择。

### aspect-ratio

定义盒子的宽高比，减少 padding hack，常用于图片、视频、卡片骨架屏。

### 现代选择器

- `:is()`：简化选择器，权重取参数最高值。
- `:where()`：权重为 0，适合基础样式。
- `:has()`：父级或关系选择，能根据子元素状态选择祖先。

`:has()` 会影响样式失效范围，浏览器已做优化，但仍应避免过度复杂的全局关系选择器。

### @layer

`@layer` 定义层叠层，让样式覆盖顺序显式化。

```css
@layer reset, base, components, utilities;

@layer base {
  body { margin: 0; }
}
```

同等条件下，后声明的 layer 优先级更高。它能减少 `!important` 和权重战争。

### @scope

`@scope` 用于限制选择器作用域，降低样式污染。它表达的是“这段规则只在某个范围内生效”。

### CSS Nesting

原生 CSS 嵌套减少重复父选择器，但不应深层嵌套，否则权重和可维护性变差。

### Container Query 与 Subgrid

- Container Query：组件按容器适配。
- Subgrid：子网格继承父网格轨道，适合表单、卡片、复杂排版对齐。

## 9.3 高频面试题

1. CSS 变量和 Sass 变量区别？
   - 回答：CSS 变量运行时存在、参与层叠继承；Sass 变量编译期替换。

2. `var()` fallback 什么时候生效？
   - 回答：变量未定义或无效时。

3. `:has()` 有什么应用？
   - 回答：父选择、表单状态、卡片含图样式。

4. `@layer` 解决什么问题？
   - 回答：显式管理层叠顺序，降低权重冲突。

5. `:is()` 和 `:where()` 区别？
   - 回答：权重不同。

6. aspect-ratio 如何参与布局？
   - 回答：在一个维度确定时推导另一维度，参与 Layout。

7. CSS Nesting 有什么风险？
   - 回答：深层嵌套造成高耦合和高权重。

8. Subgrid 适合什么？
   - 回答：嵌套内容需要与父网格线对齐。

## 9.4 常见陷阱

- 陷阱：CSS 变量等同 Sass 变量。
  - 正解：CSS 变量是运行时级别，可以被 JS 修改、被媒体查询和层叠影响。

- 陷阱：`:has()` 可以随意写复杂全局选择器。
  - 正解：要注意匹配范围和样式失效成本。

## 9.5 实战案例

问题：暗黑模式需要动态切换，旧方案是 JS 给每个组件传 theme prop。

优化：

```css
:root {
  --bg: #ffffff;
  --fg: #1f2328;
}

[data-theme="dark"] {
  --bg: #0d1117;
  --fg: #e6edf3;
}

.panel {
  background: var(--bg);
  color: var(--fg);
}
```

原因：主题变化变成样式层面的变量重计算，组件无需关心主题传递。

## 9.6 和其它知识的联系

- 工程化：变量成为 design token 的运行时载体。
- React/Vue：通过根节点 data attribute 切换主题。
- 性能：变量变更会触发受影响元素 Style Calculation。
- 响应式：clamp、container query 减少 JS 测量。

## 9.7 本章知识导图

- 现代 CSS
  - Variables
  - calc/min/max/clamp
  - aspect-ratio
  - :is/:where/:has
  - @layer
  - @scope
  - nesting
  - container query
  - subgrid

## 9.8 渐进式面试题

基础：

1. CSS 变量怎么定义和使用？推荐思路：`--x` 与 `var()`。
2. `calc()` 能混合单位吗？推荐思路：可以，计算值阶段处理。
3. `aspect-ratio` 用在哪？推荐思路：媒体比例、卡片占位。

中等：

4. 如何用 CSS 实现主题切换？推荐思路：变量 + data-theme。
5. `@layer` 和选择器权重谁先？推荐思路：层叠层在权重比较前。
6. `:has()` 能否替代 JS？推荐思路：部分状态选择可以，但业务逻辑不行。

困难：

7. CSS 变量变化会触发哪些渲染阶段？推荐思路：看变量影响属性，可能 Style/Layout/Paint。
8. 如何设计现代 CSS 架构？推荐思路：layer + token + modules + utilities。
9. 容器查询会带来循环依赖吗？推荐思路：浏览器限制查询影响，避免查询导致容器尺寸自我循环。

---

# 10. CSS 性能优化

## 10.1 学习目标

- 掌握关键渲染路径优化。
- 能判断 CSS 文件、选择器、动画、布局对性能的影响。
- 理解 `contain`、`content-visibility`、`will-change` 的作用和风险。

## 10.2 核心知识

### 关键渲染路径

首屏渲染依赖 HTML、关键 CSS、字体、关键 JS。CSS 是渲染阻塞资源，优化重点：

- 内联 critical CSS。
- 延迟非关键 CSS。
- 避免过大的全局 CSS。
- 代码分割和按路由加载。
- 减少未使用 CSS。

### 减少重排

- 批量 DOM 读写。
- 避免循环中读写布局。
- 用 transform 替代 top/left。
- 对复杂区域使用布局隔离。
- 虚拟列表减少 DOM 数量。

### 减少重绘

- 避免大面积阴影、滤镜、渐变动画。
- 控制 repaint 区域。
- 使用合适图层隔离动画区域。

### 选择器性能

现代浏览器选择器匹配很快，但仍应：

- 避免深层后代选择器。
- 避免全局复杂 `:has()`。
- 减少依赖祖先状态的大范围选择器。
- 保持低权重和明确作用域。

### will-change

短期提示浏览器做优化。滥用会导致图层过多。

### contain

`contain` 告诉浏览器元素内部与外部在某些方面隔离：

- `contain: layout`：布局隔离。
- `contain: paint`：绘制隔离。
- `contain: size`：尺寸不依赖内容。
- `contain: content`：layout + paint + style。

它可以缩小 Layout/Paint 影响范围，但可能改变布局行为。

### content-visibility

`content-visibility: auto` 允许浏览器跳过屏外内容的布局和绘制。常配合 `contain-intrinsic-size` 预留空间，避免滚动跳动。

## 10.3 高频面试题

1. CSS 为什么会阻塞首屏渲染？
   - 回答：Render Tree 和布局依赖 CSSOM。

2. 如何优化 CSS 首屏性能？
   - 回答：critical CSS、拆分、预加载、删除 unused CSS。

3. 选择器性能如何优化？
   - 回答：降低复杂度和失效范围，避免深层全局关系选择器。

4. will-change 的副作用？
   - 回答：显存、合成层过多、生命周期管理。

5. contain 有什么用？
   - 回答：隔离布局/绘制/尺寸，减少影响范围。

6. content-visibility 适合什么？
   - 回答：长页面、列表、屏外模块懒渲染。

7. CSS 动画如何优化？
   - 回答：transform/opacity、减少重绘、避免布局属性、控制图层。

8. 字体加载会影响 CSS 性能吗？
   - 回答：会影响文本渲染、布局和 CLS；可用 font-display。

## 10.4 常见陷阱

- 陷阱：只关注选择器，不关注布局和绘制。
  - 正解：真实瓶颈常在 Layout、Paint、图片、字体、JS 同步布局。

- 陷阱：content-visibility 等于虚拟列表。
  - 正解：它跳过渲染工作，但 DOM 仍存在；超大列表仍需虚拟化。

## 10.5 实战案例

问题：营销页首屏白屏时间长。

定位：

1. Coverage 发现 CSS 体积大且未使用比例高。
2. Network 显示 CSS 阻塞渲染。
3. Performance 首屏前等待 CSSOM。

优化：

- 抽取首屏 critical CSS 内联。
- 非首屏组件样式按路由/组件拆分。
- 删除历史未使用样式。
- 字体加 `font-display: swap`。

## 10.6 和其它知识的联系

- 浏览器渲染：所有优化都要落到 Style/Layout/Paint/Composite。
- 工程化：构建工具做 CSS 分包、压缩、tree shaking。
- React/Vue：组件级样式懒加载。
- 动画：高频交互优先合成属性。

## 10.7 本章知识导图

- CSS 性能
  - 加载
    - critical CSS
    - code splitting
    - preload
  - 运行时
    - Style
    - Layout
    - Paint
    - Composite
  - 优化属性
    - will-change
    - contain
    - content-visibility

## 10.8 渐进式面试题

基础：

1. CSS 压缩有什么用？推荐思路：减少传输体积。
2. 什么是 unused CSS？推荐思路：当前页面未使用规则。
3. 哪些动画属性性能好？推荐思路：transform、opacity。

中等：

4. 如何优化首屏 CSS？推荐思路：关键 CSS、异步非关键 CSS、拆包。
5. 如何避免 layout thrashing？推荐思路：读写分离、rAF。
6. contain 会改变什么？推荐思路：隔离带来行为变化。

困难：

7. content-visibility 和虚拟列表如何取舍？推荐思路：DOM 数量、交互复杂度、SEO。
8. 如何做大型项目 CSS 性能治理？推荐思路：规范、构建分析、监控、DevTools。
9. CSS 变量主题切换如何评估性能？推荐思路：影响范围、属性类型、Style 重算。

---

# 11. CSS 工程化：BEM、Modules、Sass、PostCSS、Tailwind、CSS-in-JS、Atomic CSS

## 11.1 学习目标

- 理解 CSS 工程化解决的问题：作用域、复用、主题、性能、协作。
- 能比较不同方案优缺点。
- 回答为什么现代项目越来越少写传统全局 CSS。

## 11.2 核心知识

### 为什么需要工程化

CSS 默认全局作用域、层叠开放、无模块边界。小项目灵活，大项目容易出现：

- 命名冲突。
- 样式污染。
- 权重膨胀。
- 未使用 CSS 难清理。
- 主题和设计 token 难统一。
- 组件迁移成本高。

### BEM

命名规范：Block、Element、Modifier。

```css
.card {}
.card__title {}
.card--active {}
```

优点：无工具依赖，可读性强。缺点：类名冗长，靠人约束。

### Sass/Less

预处理器提供变量、嵌套、mixin、函数。现在部分能力被原生 CSS 替代，但 Sass 的组织和函数能力仍有价值。

### PostCSS

CSS 转换平台。常用于 Autoprefixer、现代语法降级、px 转 rem、lint。

### CSS Modules

构建时把 class 转成局部唯一名，实现组件级作用域。

优点：隔离强、贴近 CSS。缺点：动态主题、全局覆盖要设计 escape hatch。

### Tailwind CSS 与 Atomic CSS

Atomic CSS 把样式拆成单一职责工具类，例如 `flex`、`items-center`、`mt-4`。优点：

- 减少命名成本。
- 样式随用随生成。
- 约束设计 token。
- 删除组件后样式随 JSX/模板消失。

缺点：

- class 较长。
- 需要团队规范。
- 复杂状态和语义抽象需要组件封装。

### CSS-in-JS

在 JS 中写 CSS，常见于 React 生态。优点：组件状态与样式耦合方便、动态样式强、作用域明确。缺点：运行时成本、SSR 复杂度、调试与缓存策略需要关注。现代趋势有编译时 CSS-in-JS 和零运行时方案。

### 为什么现代项目越来越少写传统 CSS

不是 CSS 不重要，而是传统全局 CSS 的协作成本高。现代项目更倾向：

- 组件化作用域：CSS Modules、Scoped CSS。
- 原子化：Tailwind、Atomic CSS。
- Token 化：CSS Variables。
- 构建期治理：PostCSS、lint、tree shaking。

## 11.3 高频面试题

1. BEM 解决什么问题？
   - 回答：命名和结构约束，降低全局冲突。

2. CSS Modules 原理？
   - 回答：构建时生成唯一 class 映射。

3. Sass 变量和 CSS 变量区别？
   - 回答：编译期 vs 运行时。

4. PostCSS 是什么？
   - 回答：CSS AST 转换工具平台。

5. Tailwind 优缺点？
   - 回答：效率、约束、体积优化；可读性和 class 管理挑战。

6. CSS-in-JS 的问题？
   - 回答：运行时、SSR、样式注入顺序、缓存。

7. Scoped CSS 如何实现？
   - 回答：给选择器和 DOM 加属性标记，如 Vue scoped。

8. 如何做主题系统？
   - 回答：design token + CSS variables + 构建产物 + 运行时切换。

## 11.4 常见陷阱

- 陷阱：Tailwind 就是不写 CSS。
  - 正解：它把 CSS 约束为 token 化工具类，仍需理解 CSS 原理。

- 陷阱：CSS Modules 彻底消灭全局问题。
  - 正解：全局 reset、第三方组件、Portal、主题变量仍需全局策略。

## 11.5 实战案例

问题：大型 React 项目多团队协作，样式互相污染。

方案：

- 全局只保留 reset、base、tokens。
- 组件样式使用 CSS Modules。
- 通用间距和颜色使用设计 token。
- 高复用布局工具类引入 Atomic CSS。
- `@layer` 管理 reset/base/components/utilities/overrides。

为什么：把“全局开放世界”收敛成“有限全局 + 组件局部 + 工具类”。

## 11.6 和其它知识的联系

- CSS 基础：工程化本质是在管理层叠、权重、作用域。
- React/Vue：组件化决定样式组织方式。
- 性能：按路由拆分 CSS、删除 unused CSS。
- 现代 CSS：变量、layer、scope 正在补齐原生工程能力。

## 11.7 本章知识导图

- CSS 工程化
  - BEM
  - Sass/Less
  - PostCSS
  - CSS Modules
  - Scoped CSS
  - Tailwind
  - Atomic CSS
  - CSS-in-JS
  - Design Token

## 11.8 渐进式面试题

基础：

1. 为什么 CSS 需要命名规范？推荐思路：全局作用域和冲突。
2. Sass 有什么能力？推荐思路：变量、嵌套、mixin、函数。
3. Autoprefixer 做什么？推荐思路：自动补浏览器前缀。

中等：

4. CSS Modules 如何处理动态 class？推荐思路：import 映射、classnames。
5. Tailwind 如何控制产物体积？推荐思路：扫描模板按需生成。
6. CSS-in-JS 如何处理 SSR？推荐思路：服务端收集样式并注入。

困难：

7. 如何设计企业级 CSS 架构？推荐思路：token、layer、scope、模块化、lint、构建分析。
8. 原子化 CSS 和组件 CSS 如何共存？推荐思路：工具类处理布局间距，组件 CSS 处理复杂样式。
9. 样式注入顺序问题怎么解决？推荐思路：layer、统一入口、SSR 顺序、优先级约束。

---

# 12. 浏览器底层：CSS 解析、Rule Tree、Style Calculation、Invalidations、缓存

## 12.1 学习目标

- 从浏览器实现角度理解 CSS。
- 掌握 Style Calculation、Rule Matching、Style Invalidations。
- 解释为什么修改 class 通常比频繁修改内联 style 更推荐。
- 能把底层机制转化为工程实践。

## 12.2 核心知识

### 浏览器如何解析 CSS

CSS 解析器把样式文本转为 token，再构建规则对象。浏览器会容错：遇到未知属性或无效声明通常跳过该声明，而不是中断整张样式表。这是 CSS 能长期演进的重要设计。

解析后的规则包含：

- selector。
- declarations。
- media/supports/layer/scope 条件。
- 来源位置。

### Rule Tree

不同浏览器实现不同，经典模型中会把匹配到的规则组合成可复用结构。核心思想是：大量 DOM 节点可能共享相同或相似样式规则，浏览器会通过缓存和共享减少重复计算。

不要在面试中死称所有现代浏览器都有某个具体 Rule Tree 实现。更稳妥的说法是：浏览器会维护 CSS 规则数据结构，并对规则匹配和计算样式做缓存、共享和失效优化。

### Style Calculation

Style Calculation 做的事情：

1. 找出元素匹配的 CSS 规则。
2. 按来源、layer、权重、顺序完成 cascade。
3. 处理继承。
4. 解析变量。
5. 把相对值转为 computed value。
6. 生成 computed style。

### Style Invalidations

当 DOM 或样式发生变化时，浏览器不会总是全量重算。它会标记受影响节点：

- 修改 class：根据选择器依赖判断哪些节点受影响。
- 修改 id/attribute：影响依赖这些选择器的规则。
- 修改 DOM 结构：可能影响子代、兄弟、`:nth-child`、`:has()` 等关系选择器。
- 修改继承属性：可能影响整个子树。

复杂关系选择器会扩大 invalidation 范围。

### 浏览器如何缓存 Style

可能的优化方向：

- 相同规则匹配结果复用。
- 兄弟节点共享 computed style。
- 规则哈希和选择器索引。
- 局部 invalidation。
- 延迟计算直到真正需要。

### 为什么修改 class 比修改 style 更推荐

修改 class：

- 样式逻辑集中在 CSS 中，可被浏览器规则匹配和缓存机制优化。
- 多个属性变化可以通过一个 class 切换表达。
- 更利于复用、主题、媒体查询、伪类和工程化管理。

修改内联 style：

- 权重高，覆盖困难。
- 每次写入具体属性可能触发对应 Style/Layout/Paint。
- 多属性动态拼接容易造成维护和性能问题。

但不是绝对不能用 style。对于高度动态、来自运行时计算的值，例如拖拽坐标、虚拟列表偏移、CSS 变量注入，内联 style 是合理的。更推荐把动态值写成 CSS 变量，再由 class 规则消费。

示例：

```css
.item {
  transform: translateY(var(--offset));
}
```

```html
<div class="item" style="--offset: 120px"></div>
```

### 面试考法

面试官会用“改 class 和改 style 哪个好”“CSS 选择器性能”“浏览器如何避免全量重算样式”考察底层理解。好的回答要避免绝对化，并给出场景边界。

## 12.3 高频面试题

1. 浏览器如何解析 CSS？
   - 回答：tokenize、parse、生成规则对象/CSSOM，容错跳过无效声明。

2. Style Calculation 做什么？
   - 回答：匹配规则、层叠、继承、变量、计算值。

3. 什么是 Style Invalidations？
   - 回答：样式依赖变化后标记受影响节点重新计算。

4. 修改 class 和 style 哪个好？
   - 回答：通常 class 更可维护且利于批量状态表达；动态数值 style 合理。

5. 为什么继承属性变化影响大？
   - 回答：可能影响整个子树 computed style。

6. `:has()` 为什么可能影响性能？
   - 回答：关系选择可能让子节点变化影响祖先匹配。

7. 浏览器会缓存样式吗？
   - 回答：会做规则匹配、computed style 共享、局部失效等优化，但实现因浏览器不同。

8. 内联 style 有什么问题？
   - 回答：高权重、难覆盖、难复用、工程化差。

## 12.4 常见陷阱

- 陷阱：浏览器每次 DOM 变化都全量重新计算所有样式。
  - 正解：现代浏览器有 invalidation 和缓存机制，会尽量局部化。

- 陷阱：永远不能用内联 style。
  - 正解：动态数值、CSS 变量、虚拟列表位置等场景可用。

## 12.5 实战案例

问题：表格选中行时通过 JS 给每个单元格写入多个 style，滚动卡顿。

定位：

1. 大量 DOM style 写入。
2. 每次选中触发大范围 Style 和 Paint。
3. 内联样式覆盖主题样式，维护困难。

优化：

```css
.row[data-selected="true"] {
  --row-bg: #e6f4ff;
}

.cell {
  background: var(--row-bg, transparent);
}
```

JS 只切换 `data-selected` 或 class。原因：状态表达集中，浏览器可按属性选择器和变量影响范围重算，工程上更可控。

## 12.6 和其它知识的联系

- CSS 基础：层叠和继承是 Style Calculation 的核心。
- 性能：Style Invalidations 决定样式重算范围。
- 工程化：class、token、变量使样式更可缓存和治理。
- React/Vue：动态 class 比大对象 style 更适合表达状态。

## 12.7 本章知识导图

- 浏览器底层
  - CSS Parser
  - CSSOM
  - Rule Matching
  - Cascade
  - Computed Style
  - Style Invalidations
  - Style Cache
  - class vs style

## 12.8 渐进式面试题

基础：

1. CSS 解析遇到未知属性怎么办？推荐思路：跳过无效声明，继续解析。
2. computed value 和 used value 区别？推荐思路：计算值 vs 布局后使用值。
3. CSS 变量何时解析？推荐思路：计算值阶段结合层叠继承。

中等：

4. 修改 class 会发生什么？推荐思路：标记 invalidation、重新匹配相关规则。
5. 修改继承属性为什么影响子树？推荐思路：子元素 computed style 依赖父值。
6. 浏览器如何减少样式计算？推荐思路：缓存、共享、局部失效。

困难：

7. 从底层解释为什么深层选择器不利于维护和性能。推荐思路：祖先依赖、失效范围、耦合。
8. 如何评估 `:has()` 的使用风险？推荐思路：范围、频率、DOM 规模、DevTools 验证。
9. class、data attribute、CSS variable、inline style 如何取舍？推荐思路：状态、语义、动态值、权重、性能。

---

# 13. 总复习：大厂 CSS 面试回答框架

## 13.1 遇到“是什么”问题

模板：

1. 定义概念。
2. 说明它在 CSS/浏览器中的位置。
3. 给一个简单例子。
4. 补充边界条件。

示例：BFC 是块级格式化上下文，是 Layout 阶段的一种独立布局区域。它让内部块盒按规则排列，并隔离浮动和 margin 合并影响。常见触发方式是 `display: flow-root`、`overflow` 非 visible、浮动、绝对定位等。

## 13.2 遇到“为什么”问题

模板：

1. 先说设计目标。
2. 再说浏览器实现需要。
3. 对比没有该机制会怎样。
4. 说业务收益。

示例：为什么有层叠？因为 CSS 有多个来源和大量规则，需要确定同一元素同一属性的唯一值。层叠通过来源、layer、权重、顺序建立稳定规则，避免浏览器和开发者无法判断最终样式。

## 13.3 遇到“性能”问题

模板：

1. 判断影响 Style、Layout、Paint、Composite 哪个阶段。
2. 说明触发原因。
3. 给优化方案。
4. 给验证工具。

示例：`top` 动画会改变布局位置，可能触发 Layout；`transform` 改变合成矩阵，通常可走 Composite。优化时用 Performance 面板和 Layers 验证。

## 13.4 遇到“方案选择”问题

模板：

1. 先给推荐方案。
2. 说明适用场景。
3. 对比其他方案。
4. 说明副作用。

示例：一维组件布局用 Flex，二维页面布局用 Grid。Flex 更适合主轴空间分配，Grid 更适合行列同时控制。复杂 dashboard 用 Grid 管整体，内部工具条用 Flex。

## 13.5 CSS 高频必背清单

- CSSOM 与关键渲染路径。
- Cascade、Inheritance、Specificity、`@layer`。
- 选择器从右向左匹配。
- 盒模型与 `box-sizing`。
- margin 合并与 BFC。
- Flex 算法：basis、grow、shrink、min-width:auto。
- Grid 算法：track sizing、fr、auto-placement。
- containing block 与 transform 影响 fixed。
- stacking context 与 z-index 失效。
- Reflow、Repaint、Composite。
- transform/opacity 动画。
- viewport、rem、vw、container query。
- CSS Variables、`:is()`、`:where()`、`:has()`。
- `contain`、`content-visibility`、`will-change`。
- CSS Modules、Tailwind、CSS-in-JS。
- Style Invalidations 与 class/style 取舍。

## 13.6 最终模拟面试题

1. 请从浏览器渲染流程解释 CSS 如何生效。
2. CSS 选择器为什么通常从右向左匹配？
3. BFC 是什么？为什么能清除浮动？
4. margin 合并的本质是什么？如何避免？
5. Flex 的 grow 和 shrink 算法怎么理解？
6. 为什么 Flex item 经常需要 `min-width: 0`？
7. Grid 的 `fr` 和百分比有什么区别？
8. absolute、fixed、sticky 分别相对什么定位？
9. transform 为什么会影响 fixed？
10. z-index 为什么不生效？如何系统排查？
11. stacking context 和合成层有什么区别？
12. 哪些 CSS 属性触发 Layout、Paint、Composite？
13. 为什么 transform 动画性能更好？
14. will-change 怎么用？为什么不能滥用？
15. rem、vw、媒体查询、容器查询怎么选？
16. CSS 变量和 Sass 变量有什么区别？
17. `@layer` 解决什么工程问题？
18. `:has()` 的能力和风险是什么？
19. CSS Modules、Tailwind、CSS-in-JS 如何取舍？
20. 从浏览器底层解释为什么修改 class 通常比修改 style 更推荐。

## 13.7 建议复习节奏

第一轮，7 天建立框架：

- Day 1：CSS 基础、层叠、选择器。
- Day 2：盒模型、BFC。
- Day 3：Flex、Grid、定位。
- Day 4：层叠上下文、渲染流程。
- Day 5：动画、响应式。
- Day 6：现代 CSS、性能优化。
- Day 7：工程化、浏览器底层、模拟面试。

第二轮，7 天查漏补缺：

- 每天挑 15 道题口述。
- 每个知识点都强制说出 Style/Layout/Paint/Composite 影响。
- 用 DevTools 复现实验：BFC、z-index、transform fixed、Layout thrashing。

第三轮，面试前 3 天：

- 背核心结论。
- 练习分层回答。
- 准备 3 个真实项目案例：布局问题、动画性能、样式工程化。

---

## 14. 附录：属性变更与渲染阶段速查

通常触发 Layout：

- `display`
- `width/height`
- `min/max-width/height`
- `margin/padding`
- `border-width`
- `position/top/right/bottom/left`
- `font-size/line-height`
- DOM 内容变化

通常触发 Paint：

- `color`
- `background`
- `border-color`
- `box-shadow`
- `text-shadow`
- `visibility`

通常可走 Composite：

- `transform`
- `opacity`

注意：这是经验分类，不是绝对规则。最终要以浏览器实现、元素是否成层、上下文和 DevTools 结果为准。

