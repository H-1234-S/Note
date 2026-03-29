
# 实现思路

``` js
const element = {
    type:'h1',
    props:{
        title:'foo',
        children:'hello'
    }
}

const root = document.getElementById('root')

const node = document.createElement(element.type)
node['title'] = element.props.title
const text = document.createTextNode('')
text['nodeValue'] = element.props.children

node.appendChild(text)
root.appendChild(node)
```

# JSX代码编译

``` jsx
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
```

通过`Babel` 等编译工具 将JSX代码编译为 JS

``` js
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b", null)
);
```
# 创建createElement函数

创建一个 `element` 对象，也就是虚拟DOM

接收三个参数：`type` 、`props` 、`...children`

``` js
function createElement(type,props,...children) {
	return {
		type,
		props:{
			...props,
			children
		}
	}
}

function createTextNode(text) {
	return {
		type:'TEXT_ELEMENT',
		props:{
			nodeValue:text,
			children:[]
		}
	}
}

const Didact = {
	createElement,
	createTextNode,
}

const element = (
	<div id="foo">
		<a>bar</a>
		<b />
	</div>
)

const element = Didact.createElement(
	"div",
	{ id: "foo" },
	Didact.createElement("a", null, "bar"),
	Didact.createElement("b")
)
```

对于children中**非对象元素**，也就是数字或字符串等基本数据类型，创建一个新类型 `TEXT_ELEMENT` ,包裹在元素内

这样可以使children中都是**对象类型**，都具有相同的结构 `type` `children`，后续进行递归处理

虚拟 DOM 的核心是 **递归渲染**。

``` js
function createElement(type,props,...children) {
	return {
		type,
		porps:{
			...props,
			children:children.map(child => {
				typeof child === 'object' ? child : createTextNode(child)
			})
		}
	}
}
```

# 创建render函数

将创建的虚拟DOM添加到真实DOM中；只考虑添加，不考虑更新和删除

接收两个参数：`element` `container`

``` js
function render(element, container) {
    const dom =
        element.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(element.type)
            
    const isProperty = key => key !== 'children'
    
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(item => dom[item] = element.props[item])

    element.props.children.map(child => {
        render(child, dom)
    })
    container.appendChild(dom)
}
```

实现虚拟DOM添加到真实DOM

``` js
function render(element,container) {
	const dom = document.createElement(element.type)
	
	container.appendChild(dom)
}
```

对文本节点和普通节点进行判断

递归处理children中的子节点

``` js
function render(element,container) {
	const dom = 
		element.type === 'TEXT_ELEMENT'
		? document.createTextNode('')
		: document.createElement(element.type)
		
	element.props.children.forEach(child => {
		render(child,dom)
	})
	container.appendChild(dom)
}
```

将虚拟DOM中的属性挂载到真实DOM中

``` js
function render(element,container) {
	const dom = 
		element.type === 'TEXT_ELEMENT'
		? document.createTextNode('')
		: document.createElement(element.type)
		
	const isFilter = key => key !== 'children'
	
	Object.keys(element).filter(isFilter).forEach(name => dom[name] = element.props[name])
		
	element.props.children.forEach(child => {
		render(child,dom)
	})
	container.appendChild(dom)
}
```

# 目前复盘

## 为什么需要 `createElement`？

- **语法糖的终点**：JSX 只是语法糖，Babel 会将其编译为 `createElement` 的调用，也就是参数。
    
- **创建虚拟 DOM**：它不直接创建真实 DOM，而是返回一个轻量级的 JS 对象（包含 `type` 和 `props`），便于后续的 Diff 算法和跨平台处理。
    
## `TEXT_ELEMENT` 的标准化处理

- **问题**：`children` 数组中可能混入字符串或数字。
    
- **对策**：将非对象元素包装成 `type: "TEXT_ELEMENT"` 的特殊对象。
    
- **目的**：**统一数据结构**。让所有子节点都拥有相同的格式（`type` / `props` / `children`），从而简化 `render` 函数中的递归逻辑。
    
## 属性挂载的细节

- **遍历目标**：应遍历 `element.props` 而非 `element` 本身。
    
- **属性过滤**：必须通过 `filter` 排除 `children` 属性，因为它不是普通的 HTML 属性，而是需要递归渲染的子节点。
    
- **特殊命名**：在 JS 中操作 DOM 属性时，使用 `className` 而非 `class`，因为 `class` 是 JavaScript 的保留关键字。
    
##  `render` 函数的递归逻辑

- **双重分支**：
    
    - 若是 `TEXT_ELEMENT`：使用 `document.createTextNode("")`。
        
    - 若是普通标签：使用 `document.createElement(element.type)`。
        
- **接力棒机制**：
    
    - 在 `render(child, dom)` 递归调用中，当前的 `dom` 节点会作为下一个子节点的 `container`。
        
    - 通过 `container.appendChild(dom)`，每一层节点都能准确地挂载到其父节点上，最终构建出完整的 DOM 树。

--- 

# 并发模式

主流浏览器刷新频率为 60Hz，即每（1000ms / 60Hz）16.6ms 浏览器刷新一次。

JS 可以操作 DOM，但因为`GUI渲染线程` 与 `JS线程` 是互斥的。所以**JS 脚本执行**和**浏览器布局、绘制**不能同时执行。

在每 16.6ms 时间内，需要完成如下工作：

```
JS脚本执行 -----  样式布局 ----- 样式绘制
```

之前的`render` 函数一旦进行递归就无法停止，因此如果JS执行时间过长，页面就会卡顿、掉帧

>**如何解决？**

在浏览器每一帧的时间中，预留一些时间给 JS 线程，`React`利用这部分时间更新组件（在[源码](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/src/forks/SchedulerHostConfig.default.js#L119)中，预留的初始时间是 5ms）。

当预留的时间不够用时，`React`将线程控制权交还给浏览器使其有时间渲染 UI，`React`则等待下一帧时间到来继续被中断的工作。

>也就是将**同步更新变为可中断的异步更新**

**Work Loop：**

``` js
let nextUnitOfWork = null

function WorkLoop(deadline) {
    let shouldYield = false

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1
    }

    requestIdleCallback(WorkLoop)
}

requestIdleCallback(WorkLoop)

function performUnitOfWork(nextUnitOfWork) {

}
```

`requestIdleCallback` 方法插入一个函数，这个函数将在浏览器空闲时期被调用，也就是**在浏览器每一帧的空闲时间去执行任务**（[官方文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)）。 