
# 原生挂载DOM

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
// 下一工作单元
let nextUnitOfWork = null

function WorkLoop(deadline) {
    let shouldYield = false

	// 下一个工作单元存在 并且 不应该让步 则进入循环
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1
    }

	// 预约下一帧浏览器空闲时间
	// 这样循环起来
    requestIdleCallback(WorkLoop)
}

requestIdleCallback(WorkLoop)

// 执行工作单元
function performUnitOfWork(nextUnitOfWork) {

}
```

`requestIdleCallback()` 方法插入一个函数，这个函数将在浏览器空闲时期被调用，也就是**在浏览器每一帧的空闲时间去执行任务**（[官方文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)）。 
	
- `requestIdleCallback()` 同时也给插入的函数提供一个参数 `deadline对象` 
	
- `deadline对象`里的 `timeRemaining()` 方法返回**距离下一次屏幕刷新**还有多少毫秒

`deadline.timeRemaining() < 1`  检查当前这一帧是否还剩下超过 1 毫秒的时间。

如果时间不够了，JS 必须停止执行，把控制权还给浏览器，让浏览器去处理绘图或用户点击。

# Fiber

## Fiber 的含义

- **作为架构：** Fiber 让 React 拥有了**暂停、分段和恢复**工作的能力。它把同步的渲染变成了可中断的异步任务。

- **作为数据结构：** React 为每一个元素创建了一个 **Fiber 节点**，也就是对**虚拟DOM** 的升级。这些节点之间通过三种关系连接：
		
	- **child**: 指向第一个子节点。
	    
	- **sibling**: 指向下一个兄弟节点。
	    
	- **parent**: 指向父节点。
	
- **作为动态的工作单元：** 每一个 Fiber 节点就是一个 `unitOfWork`（工作单元）。处理一个 Fiber 节点时，React 会完成两件事：

	- 把元素渲染成真实的 DOM 节点（或者更新它）。
    
	- 为子元素创建新的 Fiber 节点。

## 处理一个 Fiber 节点

- **创建真实DOM（如果没有）**
	
	如果当前的 Fiber 节点还没有对应的真实 DOM 节点，React 会根据 `fiber.type` 创建它，并且挂载到父节点上。
	
	- 如果是 `TEXT_ELEMENT`，创建文本节点。
    
	- 如果是普通标签（如 `div`），创建对应的元素。

- **将子元素转化 Fiber 结构**
	
	React 会遍历当前元素的 `children`，并为每一个子元素创建一个新的 Fiber 节点
	
	- **第一个子元素**：会被设为当前 Fiber 的 `child`。
	
	- **后续子元素**：会被设为前一个子元素的 `sibling`（兄弟）。
	
	- **父子绑定**：所有这些新生成的子 Fiber 都会有一个 `parent` 指向当前的 Fiber。

- **寻找下一个工作单元**
	
	处理完当前节点后，React 遵循 **“深度优先搜索”** 的顺序 决定下一个要处理谁。
	
	- 如果有 `child` 节点，则下一个任务处理 子节点
	
	- 如果没有子节点，就找自己的 `sibling` ，也就是兄弟节点
	
	- 如果既没子节点也没兄弟节点，就回到父节点（`parent`），查看父节点有没有兄弟。
	
	- **以此类推**，直到回到根节点

## 代码实现

**Fiber对象代码示例**

JSX：`<div id="foo"><h1>Hello</h1></div>`

``` js
// 这是一个 div 的 Fiber 节点
const fiber = {
  type: "div",
  props: {
    id: "foo",
    children: [ /* 原始虚拟 DOM 子节点 */ ],
  },
  
  // 关系指针
  child: { /* 指向 h1 的 Fiber */ },
  sibling: null, // div 没有兄弟，所以是 null
  parent: { /* 指向父级 Fiber，比如 root */ },

  // 真实 DOM 引用
  dom: <div id="foo"></div>, 
};
```

**创建真实DOM节点**

``` js
function createDom(fiber) {
	const dom =
		fiber.type == "TEXT_ELEMENT"
		? document.createTextNode("")
		: document.createElement(fiber.type)
	
	const isProperty = key => key !== "children"
	
	Object.keys(fiber.props)
	.filter(isProperty)
	.forEach(name => {
		dom[name] = fiber.props[name]
	})
	
	return dom
}
```

**将nextUnitOfWork设置为Fiber树的根节点**

``` js
function render(element, container) {
	nextUnitOfWork = {
		dom: container,
		props: {
			children: [element],
		},
	}
}
```

**挂载DOM节点**

``` js
function performUnitOfWork(fiber) {
	// 如果DOM节点没创建，则创建DOM节点
	if(!fiber.dom) {
		fiber.dom = createDom(fiber)
	}
	
	// 判断是否有父节点，如果存在则将DOM节点挂载到父节点
	if(fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom)
	}
	
	// 创建子元素的Fiber
	
	// 寻找下一个工作单元
}
```

**创建子元素的Fiber**

``` js
const elements = fiber.props.children
let index = 0
let prevSibling = null
	
while (index < elements.length) {
	const element = elements[index]
	
	const newFiber = {
		type: element.type,
		props: element.props,
		parent: fiber,
		dom: null,
	}
}
```

**然后将创建的子元素的 fiber 添加到 fiber 树中，根据它是否是第一个子节点，将其设置为子节点或兄弟节点。**

``` js
while (index < elements.length) {
	const element = elements[index]
	
	const newFiber = {
		type: element.type,
		props: element.props,
		parent: fiber,
		dom: null,
	}
	
	if(index === 0) {
		fiber.child = newFiber
	} else {
		prevSibling.sibling = newFiber
	}
	
	prevSibling = newFiber
	index++
}
```

**寻找下一个工作单元**

首先寻找子节点，然后是兄弟节点，然后是叔节点，以此类推。

``` js
if (fiber.child) {
	return fiber.child
}

let nextFiber = fiber

while (nextFiber) {
	
	if (nextFiber.sibling) {
		return nextFiber.sibling
	}
	
	nextFiber = nextFiber.parent
}
```

**完整代码**

``` js
function createDom(fiber) {
    const dom =
        fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type)

    const isProperty = key => key !== 'children'

    Object.keys(fiber.props).filter(isProperty)
        .forEach(name => dom[name] = fiber.props[name])

    return dom
}

function render(element,container) {
    nextUnitOfWork = {
        dom:container,
        props:{
            children:[element]
        }
    }
}

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

function performUnitOfWork(fiber) {

    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    if(fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // 创建子元素的fiber
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while(index < elements.length) {
        const element = elements[index]
        const newFiber = {
            type:element.type,
            props:element.props,
            parent:fiber,
            dom:null
        }

        if(index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }

    // 寻找下一unitOfWork,直到寻找到根fiber
    if(fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) {
            return nextFiber.sibling
        }

        nextFiber = nextFiber.parent
    }
}
```

# 目前复盘

## 为什么需要 Fiber？

- **解决卡顿**：传统的递归 `render` 一旦开始就无法停止，会长时间占用主线程。
    
- **可中断渲染**：Fiber 将渲染任务拆分为小的工作单元，允许浏览器在每一帧的空闲时间处理任务。
    
- **优先级调度**：让高优先级任务（如用户输入）优先执行，避免页面掉帧。
    

## Fiber 的数据结构 

Fiber 节点通过三个核心指针将树形结构转化为**线性链表**，支持了“走到哪停到哪”的能力：

- **`child`**：指向第一个子节点。
    
- **`sibling`**：指向下一个兄弟节点。
    
- **`parent`**：指向父节点。
    

##  工作循环 (Work Loop) 原理 

利用 `requestIdleCallback` 监听浏览器的空闲状态：

- **`deadline.timeRemaining()`**：检查当前帧还剩多少时间。
    
- **让步机制 (Yield)**：如果剩余时间不足（通常小于 1ms），则停止循环，预约下一帧继续工作。
    

## performUnitOfWork 的核心逻辑 

每个工作单元的处理包含三个固定步骤：

1. **创建 DOM**：如果当前 Fiber 没有 DOM，则根据 `type` 创建它。
    
2. **构建 Fiber 链表**：遍历 `children`，通过 `index === 0` 判断设为 `child`，其余设为前一个节点的 `sibling`。
    
3. **寻找下一个任务**：按照 **“子节点 -> 兄弟节点 -> 叔叔节点”** 的深度优先搜索（DFS）顺序回溯。

---
# 渲染和提交

每次处理一个元素时，都在向 DOM 添加一个新的节点。但是浏览器可能会在我们渲染整个树形结构之前中断我们的工作。

在这种情况下，用户会看到一个不完整的 UI。

---

**跟踪fiber tree的根**

``` js
let wipRoot = null
let nextUnitOfWork = null

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        }
    }

    nextUnitOfWork = wipRoot
}
```

`nextUnitOfWork` 相当于一个在fiber tree中**不断移动的指针**，当所有任务处理完成后，`nextUnitOfWork` 最终会被赋值为null

如果没有 `wipRoot` 记录fiber tree的顶端，处理完 `unitOfWork` 后，会找不到内存中的fiber tree

---

**提交fiber tree到DOM**

``` js
function WorkLoop(deadline) {
    let shouldYield = false

    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

        shouldYield = deadline.timeRemaining() < 1
    }

	// 完成所有工作后 提交
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(WorkLoop)
}

requestIdleCallback(WorkLoop)

function commitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
	
	// 挂载到parent container 中
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}
```

`commit` 阶段不可中断，由 `commitRoot` 触发。

一旦所有 Fiber 都处理完了（`!nextUnitOfWork`），React 会一次性把所有 DOM 节点挂载到真实的页面中。

---
# 调和

处理更新和删除节点

比较在 `render` 函数中接收到的元素与最后提交到 DOM 的 fiber 树。

---

**保存对“最后提交到 DOM 的 fiber 树”的引用**

``` js
function commitRoot() {

    commitWork(wipRoot.child)
    
    currentRoot = wipRoot
    
    wipRoot = null
}
```

**添加了 `alternate` 属性，即在上一个提交阶段提交到 DOM 的 fiber。**

``` js
function render(element, container) {

    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    
    nextUnitOfWork = wipRoot
}
```

**从 `performUnitOfWork` 中提取创建新 fibers 的代码** 

``` js
function reconcileChildren(wipFiber, elements) {
    let index = 0
    let prevSibling = null

    while (index < elements.length) {
        const element = elements[index]
        
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: wipFiber,
            dom: null,
        }

        if (index === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}
```