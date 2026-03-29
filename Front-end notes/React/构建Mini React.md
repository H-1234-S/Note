
# 简易实现

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
    
    Object.keys(element)
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