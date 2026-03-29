
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

# 创建createElement函数

这个函数的作用是：创建一个 `element` 对象

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

const element = (
	<div>
		<a> bar </a>
		<br />
	</div>
)

const element = {
	type:'div'
	props:{
		children
	}
}


```