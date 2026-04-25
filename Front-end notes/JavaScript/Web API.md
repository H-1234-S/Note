# Web API 全面指南

> 本文档按循循渐进的方式整理常用的 Web API，每个 API 都配有详细的代码示例和用法解释。

---

## 目录

1. [URL API](#1-url-api)
2. [URLSearchParams API](#2-urlsearchparams-api)
3. [DOM API](#3-dom-api)
4. [BOM 浏览器对象模型](#4-bom-浏览器对象模型)
5. [事件 API](#5-事件-api)
6. [Fetch 与网络请求](#6-fetch-与网络请求)
7. [存储 API](#7-存储-api)
8. [Canvas 绘图 API](#8-canvas-绘图-api)
9. [拖拽 API](#9-拖拽-api)
10. [地理位置 API](#10-地理位置-api)
11. [音视频 API](#11-音视频-api)
12. [剪贴板与文件 API](#12-剪贴板与文件-api)
13. [通知与摇一摇](#13-通知与摇一摇)
14. [Web Worker](#14-web-worker)
15. [常用工具函数](#15-常用工具函数)
16. [FormData API](#16-formdata-api)
17. [IntersectionObserver API](#17-intersectionobserver-api)
18. [MutationObserver API](#18-mutationobserver-api)
19. [BroadcastChannel API](#19-broadcastchannel-api)
20. [WebSocket API](#20-websocket-api)
21. [Server-Sent Events (SSE)](#21-server-sent-events-sse)
22. [Performance API](#22-performance-api)
23. [requestIdleCallback API](#23-requestidlecallback-api)
24. [Visual Viewport API](#24-visual-viewport-api)
25. [Pointer Lock API](#25-pointer-lock-api)

---

## 1. URL API

URL（Uniform Resource Locator）是用于解析和操作 URL 的接口，比 `location` 对象更强大。

### 1.1 创建 URL 对象

```javascript
// 方式1：使用完整 URL
const url = new URL('https://example.com:8080/path/name?id=123&name=John#section')

// 方式2：相对于基础 URL
const base = new URL('/path', 'https://example.com')  // https://example.com/path

// 方式3：使用当前页面地址
const currentUrl = new URL(window.location.href)
```

### 1.2 URL 对象属性

```javascript
const url = new URL('https://john:password@example.com:8080/path/name?id=123&name=John#section')

// 完整 URL
url.href        // 'https://john:password@example.com:8080/path/name?id=123&name=John#section'

// 协议（包含冒号）
url.protocol    // 'https:'

// 主机名（包含端口）
url.host        // 'example.com:8080'

// 仅主机名
url.hostname    // 'example.com'

// 端口号
url.port        // '8080'

// 用户名
url.username    // 'john'

// 密码
url.password    // 'password'

// 路径
url.pathname    // '/path/name'

// 查询字符串（包含问号）
url.search       // '?id=123&name=John'

// 锚点（包含井号）
url.hash        // '#section'

// 来源（只读，格式：协议//用户名:密码@主机名:端口）
url.origin      // 'https://example.com:8080'
```

### 1.3 操作 URL 参数

```javascript
const url = new URL('https://example.com/search?id=123&name=John')

// 获取 URLSearchParams 对象
const params = url.searchParams

// 添加参数
url.searchParams.append('category', 'book')  // ?id=123&name=John&category=book

// 设置参数（如果已存在则覆盖）
url.searchParams.set('id', '456')  // ?id=456&name=John&category=book

// 删除参数
url.searchParams.delete('name')  // ?id=456&category=book

// 获取单个参数值
url.searchParams.get('id')       // '456'

// 获取所有参数值（同名参数有多个值时）
url.searchParams.getAll('id')    // ['456']

// 检查参数是否存在
url.searchParams.has('name')     // false

// 获取参数个数
url.searchParams.length          // 2

// 获取所有参数键值对
[...url.searchParams.entries()]  // [['id', '456'], ['category', 'book']]

// 获取所有参数名
[...url.searchParams.keys()]      // ['id', 'category']

// 获取所有参数值
[...url.searchParams.values()]    // ['456', 'book']

// 排序参数键（常用于缓存）
url.searchParams.sort()
// 结果：?category=book&id=456

// 遍历参数
url.searchParams.forEach((value, key) => {
  console.log(`${key} = ${value}`)
})
```

### 1.4 URL 编解码

```javascript
const url = new URL('https://example.com/path')

// 设置查询参数（自动编码）
url.searchParams.set('name', '张三')
url.searchParams.set('query', 'hello world')
console.log(url.href)
// https://example.com/path?name=%E5%BC%A0%E4%B8%89&query=hello%20world

// 获取参数（自动解码）
url.searchParams.get('name')  // '张三'

// 手动编码
encodeURIComponent('张三')      // '%E5%BC%A0%E4%B8%89'
decodeURIComponent('%E5%BC%A0%E4%B8%89')  // '张三'

// 注意：encodeURI 不会编码以下字符
// A-Z a-z 0-9 - _ . ! ~ * ' ( )
// encodeURIComponent 会编码所有非字母数字字符
```

### 1.5 URL 对象方法

```javascript
const url = new URL('https://example.com/path')

// 解析相对路径
console.log(url.resolve('/new-path'))  // 'https://example.com/new-path'
console.log(url.resolve('./other'))    // 'https://example.com/other'
console.log(url.resolve('../parent'))  // 'https://example.com/parent'

// 解析 URL（类似 <a> 标签的 href 解析）
const base = new URL('https://example.com/a/b/')
console.log(new URL('c', base).href)   // 'https://example.com/a/c'
console.log(new URL('./c', base).href) // 'https://example.com/a/c'
console.log(new URL('/c', base).href)  // 'https://example.com/c'

// 转换为字符串（隐式调用）
console.log(url.toString())  // 'https://example.com/path'

// 转换为 JSON
console.log(url.toJSON())     // 'https://example.com/path'
```

### 1.6 实用工具函数

```javascript
// 解析 URL 参数为对象
function parseURLParams(url) {
  const params = new URL(url).searchParams
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}
parseURLParams('https://example.com?id=1&name=John')
// { id: '1', name: 'John' }

// 构建带参数的 URL
function buildURL(base, params) {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v))
    } else {
      url.searchParams.set(key, value)
    }
  })
  return url.href
}
buildURL('https://example.com', { id: 1, tags: ['a', 'b'] })
// 'https://example.com?id=1&tags=a&tags=b'

// 检测 URL 是否有效
function isValidURL(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}
isValidURL('https://example.com')  // true
isValidURL('not-a-url')            // false

// 提取域名
function extractDomain(url) {
  return new URL(url).hostname
}
extractDomain('https://www.example.com/path')
// 'www.example.com'
```

---

## 2. URLSearchParams API

URLSearchParams 是专门用于处理 URL 查询字符串的 API。

### 2.1 创建方式

```javascript
// 方式1：从字符串创建
const params1 = new URLSearchParams('id=123&name=John&name=Jane')
// name 参数有多个值：['John', 'Jane']

// 方式2：从对象创建（使用 & 分隔）
const params2 = new URLSearchParams({
  id: '123',
  name: 'John'
})
// 自动编码：'id=123&name=John'

// 方式3：使用已有的 searchParams
const url = new URL('https://example.com?id=123')
const params3 = url.searchParams

// 方式4：从键值对数组创建
const params4 = new URLSearchParams([
  ['id', '1'],
  ['name', 'John']
])
```

### 2.2 查询方法

```javascript
const params = new URLSearchParams('id=123&name=John&name=Jane&age=25')

// 获取第一个匹配的值
params.get('name')      // 'John'

// 获取所有匹配的值
params.getAll('name')   // ['John', 'Jane']

// 检查键是否存在
params.has('id')        // true
params.has('city')      // false

// 获取参数个数
params.size             // 3（注意：size 是属性不是方法）
```

### 2.3 修改方法

```javascript
const params = new URLSearchParams('id=123&name=John')

// 添加参数（追加到末尾）
params.append('city', 'Beijing')
// 'id=123&name=John&city=Beijing'

// 添加参数（插入到开头）
params.prepend('lang', 'zh')
// 'lang=zh&id=123&name=John&city=Beijing'

// 设置参数（不存在则添加，存在则覆盖第一个）
params.set('id', '456')
// 'lang=zh&id=456&name=John&city=Beijing'

// 设置同名参数（会覆盖所有）
params.set('city', 'Shanghai')
params.set('city', 'Guangzhou')
// 'lang=zh&id=456&name=John&city=Guangzhou'

// 删除参数
params.delete('lang')
// 'id=456&name=John&city=Guangzhou'

// 清空所有参数
params.toString()  // ''
```

### 2.4 遍历方法

```javascript
const params = new URLSearchParams('id=123&name=John&city=Beijing')

// for...of 遍历（键值对）
for (const [key, value] of params) {
  console.log(`${key}: ${value}`)
}
// id: 123
// name: John
// city: Beijing

// keys()
for (const key of params.keys()) {
  console.log(key)
}
// id
// name
// city

// values()
for (const value of params.values()) {
  console.log(value)
}
// 123
// John
// Beijing

// entries()
for (const [key, value] of params.entries()) {
  console.log(`${key} = ${value}`)
}

// forEach
params.forEach((value, key) => {
  console.log(`${key} -> ${value}`)
})
```

### 2.5 排序与迭代

```javascript
const params = new URLSearchParams('z=3&a=1&m=2')

// 排序（按字母顺序）
params.sort()
// params.toString() => 'a=1&m=2&z=3'

// Symbol.iterator（默认迭代器）
const [firstKey, firstValue] = params
console.log(firstKey, firstValue)  // 'z' '3'

// 转换为普通对象
function paramsToObject(params) {
  const obj = {}
  for (const [key, value] of params) {
    obj[key] = value
  }
  return obj
}

// 转换回字符串
params.toString()  // 'z=3&a=1&m=2'
```

### 2.6 构造 URL

```javascript
// 从 params 构造带参数的 URL
function buildURLWithParams(baseURL, params) {
  const url = new URL(baseURL)
  params.forEach((value, key) => {
    url.searchParams.append(key, value)
  })
  return url.href
}

// 完整示例
const base = 'https://api.example.com/endpoint'
const params = new URLSearchParams({
  api_key: 'abc123',
  limit: 10,
  offset: 0
})
buildURLWithParams(base, params)
// 'https://api.example.com/endpoint?api_key=abc123&limit=10&offset=0'

// 处理数组参数
function buildURLWithArrayParams(baseURL, key, values) {
  const url = new URL(baseURL)
  values.forEach(value => {
    url.searchParams.append(key, value)
  })
  return url.href
}
buildURLWithArrayParams('https://example.com', 'tags', ['js', 'css', 'html'])
// 'https://example.com?tags=js&tags=css&tags=html'
```

### 2.7 与 FormData 配合

```javascript
// 从表单创建 URLSearchParams
const form = document.querySelector('form')
const params = new URLSearchParams(new FormData(form))

// 从 URLSearchParams 创建查询字符串
const params = new URLSearchParams('id=123&name=John')
params.toString()  // 'id=123&name=John'

// 编码注意事项
const params = new URLSearchParams()
params.set('name', '张三&李四')  // 自动编码特殊字符
params.toString()  // 'name=%E5%BC%A0%E4%B8%89%26%E6%9D%8E%E5%9B%9B'
```

---

## 3. DOM API

DOM（Document Object Model）是将 HTML/XML 文档当作树形结构操作的接口。

### 1.1 获取元素

```javascript
// 通过 ID 获取（返回单个元素）
const el = document.getElementById('app')

// 通过类名获取（返回类数组对象）
const els = document.getElementsByClassName('item')

// 通过标签名获取
const tags = document.getElementsByTagName('div')

// 通过 CSS 选择器获取（返回第一个匹配）
const query = document.querySelector('.container .item')

// 通过 CSS 选择器获取（返回所有匹配）
const queries = document.querySelectorAll('.container .item')
```

### 1.2 创建与插入元素

```javascript
// 创建元素
const div = document.createElement('div')
div.textContent = 'Hello World'
div.className = 'item'

// 插入到父元素末尾
parent.appendChild(div)

// 插入到父元素开头
parent.prepend(div)

// 插入到参考元素之前
parent.insertBefore(div, referenceEl)

// 插入到参考元素之后（原生方法，需要自己实现）
function insertAfter(newEl, referenceEl) {
  return referenceEl.insertAdjacentElement('afterend', newEl)
}

// 高级插入（可插入文本或HTML）
element.insertAdjacentHTML('beforeend', '<span>插入的HTML</span>')
// 位置选项: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
```

### 1.3 删除与替换元素

```javascript
// 删除元素
element.remove()

// 删除子元素
parent.removeChild(child)

// 替换元素
parent.replaceChild(newEl, oldEl)
```

### 1.4 操作元素属性

```javascript
// 获取属性
element.getAttribute('data-id')

// 设置属性
element.setAttribute('data-id', '123')

// 移除属性
element.removeAttribute('disabled')

// 检查属性
element.hasAttribute('disabled')

// 直接操作 DOM 属性
element.id = 'myId'
element.className = 'active'
element.classList.add('active')
element.classList.remove('active')
element.classList.toggle('active')
element.classList.contains('active')
```

### 1.5 操作元素样式

```javascript
// 行内样式
element.style.color = 'red'
element.style.backgroundColor = '#fff'

// 获取计算后的样式（只读）
const styles = window.getComputedStyle(element)
const color = styles.color

// 添加/移除 CSS 类
element.classList.add('hidden')
element.classList.remove('hidden')
element.classList.toggle('hidden')
```

### 1.6 操作元素内容

```javascript
// 操作文本（安全，自动转义）
element.textContent = '纯文本内容'

// 操作 HTML（可能有 XSS 风险，谨慎使用）
element.innerHTML = '<strong>HTML</strong>内容'

// 获取/设置表单值
input.value = '默认值'
```

### 1.7 获取元素尺寸与位置

```javascript
// 获取元素相对于视口的位置
const rect = element.getBoundingClientRect()
// rect = { top, left, right, bottom, width, height, x, y }

// 相对于文档
const rect = element.getBoundingClientRect()
const top = rect.top + window.pageYOffset
const left = rect.left + window.pageXOffset

// 获取元素尺寸（content + padding + border）
const offsetWidth = element.offsetWidth
const offsetHeight = element.offsetHeight

// 获取元素尺寸（仅 content）
const clientWidth = element.clientWidth
const clientHeight = element.clientHeight

// 获取元素相对于定位祖先的位置
const offsetTop = element.offsetTop
const offsetLeft = element.offsetLeft
```

---

## 4. BOM 浏览器对象模型

BOM（Browser Object Model）提供与浏览器交互的接口。

### 2.1 window 对象

```javascript
// 窗口尺寸
window.innerWidth   // 视口宽度
window.innerHeight  // 视口高度
window.outerWidth   // 浏览器窗口宽度
window.outerHeight  // 浏览器窗口高度

// 滚动
window.scrollTo(x, y)              // 滚动到指定位置
window.scrollTo({ top: 100, behavior: 'smooth' }) // 平滑滚动
window.scrollBy(0, 100)            // 相对滚动

// 打开/关闭窗口
window.open('https://example.com', '_blank', 'width=500,height=400')
window.close()

// 操作框架
window.frames        // 获取所有 iframe
window.parent        // 父窗口
window.top           // 顶级窗口
```

### 2.2 navigator 对象（浏览器信息）

```javascript
// 用户代理字符串
navigator.userAgent

// 平台
navigator.platform

// 语言
navigator.language   // 'zh-CN'
navigator.languages  // ['zh-CN', 'zh', 'en']

// 是否在线
navigator.onLine

// 是否启用了 Cookie
navigator.cookieEnabled

// 硬件并发数（CPU 核心数）
navigator.hardwareConcurrency

// 内存（仅 Chrome）
navigator.deviceMemory

// 插件信息
navigator.plugins

// 示例：检测移动设备
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
```

### 2.3 location 对象（URL 信息）

```javascript
// URL 各部分
location.href        // 完整 URL
location.protocol    // 'https:'
location.host        // 'example.com:8080'
location.hostname    // 'example.com'
location.port        // '8080'
location.pathname    // '/path/to/page'
location.search      // '?id=1&name=John'
location.hash        // '#section'

// 操作 URL
location.assign('https://example.com')    // 导航（可后退）
location.replace('https://example.com')   // 导航（不可后退）
location.reload()                          // 刷新
location.reload(true)                     // 强制从服务器刷新

// 解析 URL 参数
const params = new URLSearchParams(location.search)
params.get('id')  // '1'
params.getAll('id') // ['1', '2']
```

### 2.4 history 对象（历史记录）

```javascript
// 导航
history.back()     // 后退
history.forward()  // 前进
history.go(-1)     // 相对移动

// 当前状态
history.length     // 历史记录数量
history.state       // 当前 state 对象

// HTML5 History API（无刷新导航）
history.pushState({ data: 'test' }, 'Title', '/new-url')  // 添加记录
history.replaceState({ data: 'test' }, 'Title', '/new-url') // 替换当前记录

// 监听 popstate 事件（浏览器前进后退时触发）
window.addEventListener('popstate', (e) => {
  console.log('state:', e.state)
  console.log('当前路径:', location.pathname)
})
```

### 2.5 screen 对象（屏幕信息）

```javascript
screen.width        // 屏幕宽度
screen.height       // 屏幕高度
screen.availWidth   // 可用宽度（排除任务栏）
screen.availHeight  // 可用高度
screen.colorDepth   // 颜色深度
screen.pixelDepth   // 像素深度
```

---

## 5. 事件 API

### 3.1 绑定事件

```javascript
// DOM0 事件（直接赋值）
element.onclick = function(e) {
  console.log('clicked')
}

// DOM2 事件（addEventListener，可添加多个同类型监听器）
element.addEventListener('click', handler, false)
// 第三个参数：false = 冒泡阶段，true = 捕获阶段

// 移除事件
element.removeEventListener('click', handler)

// 只执行一次
element.addEventListener('click', handler, { once: true })

//  passive（提升滚动性能）
element.addEventListener('touchstart', handler, { passive: true })
```

### 3.2 事件对象

```javascript
element.addEventListener('click', function(event) {
  // 事件类型
  event.type  // 'click'

  // 事件目标
  event.target     // 触发事件的最内层元素
  event.currentTarget // 绑定事件的元素（等于 this）

  // 阻止默认行为
  event.preventDefault()

  // 阻止冒泡
  event.stopPropagation()

  // 立即阻止冒泡（包含同级的其他监听器）
  event.stopImmediatePropagation()

  // 事件阶段（1=捕获，2=目标，3=冒泡）
  event.eventPhase

  // 是否冒泡
  event.bubbles

  // 是否可以取消
  event.cancelable

  // 时间戳
  event.timeStamp

  // 鼠标位置（相对于视口）
  event.clientX
  event.clientY

  // 鼠标位置（相对于文档）
  event.pageX
  event.pageY

  // 鼠标位置（相对于屏幕）
  event.screenX
  event.screenY

  // 键盘按键
  event.key       // 'a' / 'ArrowUp' / 'Enter'
  event.code      // 'KeyA' / 'ArrowUp' / 'Enter'
  event.altKey
  event.ctrlKey
  event.shiftKey
  event.metaKey
})
```

### 3.3 事件委托

```javascript
// 原理：把事件绑定到父元素，通过 event.target 判断触发元素
parent.addEventListener('click', function(e) {
  // 使用 matches 或 closest 判断
  if (e.target.matches('.item')) {
    console.log('点击了 item:', e.target)
  }

  // 或使用 closest 向上查找
  const item = e.target.closest('.item')
  if (item) {
    console.log('点击了 item 或其子元素')
  }
})

// 优势：1. 减少事件绑定数量 2. 支持动态元素
```

### 3.4 自定义事件

```javascript
// 创建自定义事件
const event = new CustomEvent('myEvent', {
  detail: { message: 'Hello' },  // 传递数据
  bubbles: true,                  // 是否冒泡
  cancelable: true               // 是否可取消
})

// 派发事件
element.dispatchEvent(event)

// 监听自定义事件
element.addEventListener('myEvent', function(e) {
  console.log(e.detail.message)  // 'Hello'
})

// ⚠️ 以下方式已废弃（2009年起），请勿在新代码中使用
// const event = document.createEvent('Event')
// event.initEvent('myEvent', true, true)
// element.dispatchEvent(event)
// 应使用 CustomEvent 替代
```

### 3.5 常见事件类型

```javascript
// 鼠标事件
'click'          // 点击
'dblclick'       // 双击
'contextmenu'    // 右键菜单
'mouseenter'     // 进入（不冒泡）
'mouseleave'     // 离开（不冒泡）
'mouseover'      // 进入（冒泡）
'mouseout'       // 离开（冒泡）
'mousemove'      // 移动
'mousedown'      // 按下
'mouseup'        // 抬起

// 键盘事件
'keydown'        // 按下
'keyup'          // 抬起
'keypress'       // 字符键（已废弃）

// 表单事件
'submit'         // 表单提交
'reset'          // 表单重置
'focus'          // 获取焦点
'blur'           // 失去焦点
'input'          // 输入（实时）
'change'         // 变化（失焦后）
'search'         // 搜索（搜索框）

// 文档事件
'DOMContentLoaded'  // DOM 加载完成
'load'            // 资源加载完成
'unload'          // 页面关闭
'beforeunload'    // 页面即将关闭
'scroll'          // 滚动
'resize'          // 窗口大小变化

// 触摸事件（移动端）
'touchstart'      // 触摸开始
'touchmove'       // 触摸移动
'touchend'        // 触摸结束
'touchcancel'     // 触摸取消

// 过渡与动画
'transitionend'   // 过渡结束
'animationend'    // 动画结束
'animationiteration' // 动画迭代
```

### 3.6 表单事件详解

```javascript
// input 事件（实时）
input.addEventListener('input', function(e) {
  console.log(this.value)  // 当前输入值
})

// change 事件（失焦或选择后）
input.addEventListener('change', function(e) {
  console.log(this.value)  // 变化后的值
})

// submit 事件
form.addEventListener('submit', function(e) {
  e.preventDefault()  // 阻止默认提交
  const formData = new FormData(this)
  console.log([...formData.entries()])
})

// 验证事件
input.addEventListener('invalid', function(e) {
  e.preventDefault()  // 阻止默认提示
  console.log(this.validationMessage)
})

// 检查表单是否有效
form.checkValidity()  // boolean
form.reportValidity()  // 显示浏览器提示
```

---

## 6. Fetch 与网络请求

### 4.1 基础用法

```javascript
// GET 请求
fetch('https://api.example.com/data')
  .then(response => response.json())  // 解析 JSON
  .then(data => console.log(data))
  .catch(error => console.error(error))

// async/await 写法
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
```

### 4.2 请求配置

```javascript
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ name: 'John', age: 30 })
})
```

### 4.3 响应对象

```javascript
async function handleResponse(response) {
  // 状态码
  console.log(response.status)  // 200
  console.log(response.ok)      // true (200-299)

  // 响应头
  console.log(response.headers.get('Content-Type'))
  console.log([...response.headers.entries()])

  // 解析响应体
  response.json()      // 解析 JSON
  response.text()      // 解析文本
  response.formData()  // 解析 FormData
  response.blob()      // 解析二进制（文件、图片）
  response.arrayBuffer() // 解析 ArrayBuffer

  // 克隆响应（如果需要多次读取）
  const clone = response.clone()
}
```

### 4.4 上传文件

```javascript
// 单文件上传
const input = document.querySelector('input[type="file"]')
const file = input.files[0]

const formData = new FormData()
formData.append('file', file)

fetch('/upload', {
  method: 'POST',
  body: formData
})

// 多文件上传
const files = input.files
const formData = new FormData()
for (let i = 0; i < files.length; i++) {
  formData.append('files[]', files[i])
}

// 携带额外字段
formData.append('name', 'John')
formData.append('age', 30)
```

### 4.5 下载文件

```javascript
// 下载大文件
async function downloadFile(url, filename) {
  const response = await fetch(url)
  const blob = await response.blob()

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  // 释放 URL
  URL.revokeObjectURL(link.href)
}
```

### 4.6 中断请求

```javascript
const controller = new AbortController()
const signal = controller.signal

fetch(url, { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被中断')
    }
  })

// 3秒后中断
setTimeout(() => controller.abort(), 3000)
```

### 4.7 跨域请求

```javascript
// CORS 跨域（需要服务器设置 Access-Control-Allow-Origin）
fetch('https://api.example.com/data', {
  credentials: 'include'  // 携带 Cookie
})

// JSONP（老旧方式，仅 GET）
function jsonp(url, callback) {
  const callbackName = 'jsonpCallback'
  window[callbackName] = function(data) {
    callback(data)
    delete window[callbackName]
    document.body.removeChild(script)
  }

  const script = document.createElement('script')
  script.src = `${url}?callback=${callbackName}`
  document.body.appendChild(script)
}
```

### 4.8 XMLHttpRequest（老旧但仍有用）

```javascript
const xhr = new XMLHttpRequest()
xhr.open('GET', 'https://api.example.com/data', true)

xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log(JSON.parse(xhr.responseText))
  }
}

xhr.onerror = function() {
  console.error('请求失败')
}

// 上传进度
xhr.upload.onprogress = function(e) {
  const percent = (e.loaded / e.total) * 100
  console.log(`上传进度: ${percent}%`)
}

xhr.send()

// 中断
xhr.abort()
```

---

## 7. 存储 API

### 5.1 localStorage

```javascript
// 存储（只支持字符串）
localStorage.setItem('name', 'John')
localStorage.setItem('age', '30')
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }))

// 读取
localStorage.getItem('name')        // 'John'
localStorage.getItem('age')         // '30'
JSON.parse(localStorage.getItem('user'))

// 删除
localStorage.removeItem('name')

// 清空
localStorage.clear()

// 遍历
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  const value = localStorage.getItem(key)
  console.log(`${key}: ${value}`)
}

// 监听变化（其他标签页修改时触发）
window.addEventListener('storage', function(e) {
  console.log('key:', e.key)
  console.log('oldValue:', e.oldValue)
  console.log('newValue:', e.newValue)
  console.log('url:', e.url)
})

// 特点：永久存储，同源共享，容量约 5MB
```

### 5.2 sessionStorage

```javascript
// 用法同 localStorage
sessionStorage.setItem('token', 'abc123')
sessionStorage.getItem('token')

// 区别：会话结束时清除（标签页关闭即清除）
// 特点：仅当前标签页有效，不跨标签页共享
```

### 5.3 IndexedDB（大型数据库）

```javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1)

// 版本升级回调
request.onupgradeneeded = function(e) {
  const db = e.target.result

  // 创建对象存储（类似表）
  if (!db.objectStoreNames.contains('users')) {
    const store = db.createObjectStore('users', { keyPath: 'id' })
    store.createIndex('name', 'name', { unique: false })
    store.createIndex('email', 'email', { unique: true })
  }
}

request.onsuccess = function(e) {
  const db = e.target.result

  // 添加数据
  const tx = db.transaction('users', 'readwrite')
  const store = tx.objectStore('users')
  store.add({ id: 1, name: 'John', email: 'john@example.com' })
  store.add({ id: 2, name: 'Jane', email: 'jane@example.com' })

  tx.oncomplete = function() {
    console.log('添加完成')
    db.close()
  }
}

request.onerror = function(e) {
  console.error('数据库错误')
}
```

### 5.4 IndexedDB 常用操作

```javascript
// 打开数据库封装
function openDB(dbName, version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version)
    request.onsuccess = e => resolve(e.target.result)
    request.onerror = e => reject(e.target.error)
    request.onupgradeneeded = e => {
      // 可以在此处处理版本升级
    }
  })
}

// 添加数据
async function addData(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.add(data)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 查询数据
async function getData(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 查询所有数据
async function getAllData(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 删除数据
async function deleteData(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 游标查询
async function cursorQuery(db, storeName, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.openCursor()

    request.onsuccess = function(e) {
      const cursor = e.target.result
      if (cursor) {
        callback(cursor.value, cursor)
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })
}
```

---

## 8. Canvas 绘图 API

### 6.1 基础用法

```javascript
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')  // 2d 或 'webgl'

// 设置画布尺寸
canvas.width = 800
canvas.height = 600
```

### 6.2 绘制图形

```javascript
// 矩形
ctx.fillStyle = 'red'
ctx.fillRect(10, 10, 100, 100)  // 填充矩形

ctx.strokeStyle = 'blue'
ctx.strokeRect(120, 10, 100, 100)  // 描边矩形

ctx.clearRect(0, 0, canvas.width, canvas.height)  // 清除画布

// 圆形
ctx.beginPath()
ctx.arc(200, 200, 50, 0, Math.PI * 2)  // 圆心x, y, 半径, 起始角度, 结束角度
ctx.fill()
ctx.stroke()

// 直线
ctx.beginPath()
ctx.moveTo(0, 0)      // 起点
ctx.lineTo(100, 100)  // 终点
ctx.lineTo(200, 50)
ctx.closePath()       // 闭合路径
ctx.stroke()

// 三角形
ctx.beginPath()
ctx.moveTo(100, 100)
ctx.lineTo(150, 150)
ctx.lineTo(100, 200)
ctx.closePath()
ctx.fill()
```

### 6.3 样式设置

```javascript
// 颜色
ctx.fillStyle = '#ff0000'
ctx.fillStyle = 'rgb(255, 0, 0)'
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'

// 线宽
ctx.lineWidth = 2

// 线帽
ctx.lineCap = 'butt'  // 默认
ctx.lineCap = 'round' // 圆角
ctx.lineCap = 'square' // 方角

// 线段连接
ctx.lineJoin = 'miter'  // 默认，尖角
ctx.lineJoin = 'round'  // 圆角
ctx.lineJoin = 'bevel'  // 斜角

// 透明度
ctx.globalAlpha = 0.5

// 渐变
const gradient = ctx.createLinearGradient(0, 0, 200, 0)
gradient.addColorStop(0, 'red')
gradient.addColorStop(1, 'blue')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, 200, 100)

// 径向渐变
const radialGradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100)
radialGradient.addColorStop(0, 'yellow')
radialGradient.addColorStop(1, 'transparent')
ctx.fillStyle = radialGradient
ctx.fillRect(0, 0, 200, 200)

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
ctx.shadowBlur = 10
ctx.shadowOffsetX = 5
ctx.shadowOffsetY = 5
```

### 6.4 文字绘制

```javascript
ctx.font = '24px Arial'
ctx.fillText('Hello Canvas', 50, 50)
ctx.strokeText('Hello Canvas', 50, 100)

// 文字对齐
ctx.textAlign = 'left'    // left, right, center, start, end
ctx.textBaseline = 'top'   // top, middle, bottom, alphabetic, hanging

// 测量文字宽度
const metrics = ctx.measureText('Hello')
console.log(metrics.width)
```

### 6.5 图片处理

```javascript
const img = new Image()
img.src = 'image.png'
img.onload = function() {
  // 绘制图片
  ctx.drawImage(img, 0, 0)  // 原尺寸
  ctx.drawImage(img, 0, 0, 200, 150)  // 指定尺寸
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)  // 裁剪后绘制
}

// 从 img 标签获取
const img = document.querySelector('img')
ctx.drawImage(img, 0, 0)
```

### 6.6 图像变换

```javascript
// 平移
ctx.translate(50, 50)

// 旋转（弧度）
ctx.rotate(Math.PI / 4)

// 缩放
ctx.scale(2, 2)

// 保存状态
ctx.save()  // 入栈

// 恢复状态
ctx.restore()  // 出栈

// 变换矩阵
ctx.transform(1, 0, 0, 1, 50, 50)  // 平移
ctx.setTransform(1, 0, 0, 1, 0, 0)  // 重置矩阵
```

### 6.7 动画基础

```javascript
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 更新位置
  x += speed

  // 绘制
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // 循环
  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
```

---

## 9. 拖拽 API

### 7.1 原生拖拽

```html
<div id="draggable" draggable="true">可拖拽元素</div>
<div id="dropzone">放置区域</div>
```

```javascript
const draggable = document.getElementById('draggable')
const dropzone = document.getElementById('dropzone')

// 拖拽开始
draggable.addEventListener('dragstart', function(e) {
  e.dataTransfer.setData('text/plain', '数据')
  e.dataTransfer.effectAllowed = 'move'  // 允许的操作
})

// 拖拽中（源元素）
draggable.addEventListener('drag', function(e) {
  console.log('拖拽中')
})

// 拖拽结束（源元素）
draggable.addEventListener('dragend', function(e) {
  console.log('拖拽结束')
})

// 进入放置区域
dropzone.addEventListener('dragenter', function(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  this.style.background = 'lightblue'
})

// 在放置区域上方移动
dropzone.addEventListener('dragover', function(e) {
  e.preventDefault()  // 阻止默认行为，允许放置
  e.dataTransfer.dropEffect = 'move'
})

// 离开放置区域
dropzone.addEventListener('dragleave', function(e) {
  this.style.background = ''
})

// 放置
dropzone.addEventListener('drop', function(e) {
  e.preventDefault()
  const data = e.dataTransfer.getData('text/plain')
  console.log('放置的数据:', data)
  this.style.background = ''
})
```

### 7.2 dataTransfer 对象

```javascript
// 设置数据
e.dataTransfer.setData('text/plain', '文本数据')
e.dataTransfer.setData('text/html', '<strong>HTML</strong>')
e.dataTransfer.setData('application/json', JSON.stringify({ a: 1 }))

// 获取数据
e.dataTransfer.getData('text/plain')

// 拖拽效果
e.dataTransfer.effectAllowed = 'copy'      // 仅复制
e.dataTransfer.effectAllowed = 'move'      // 仅移动
e.dataTransfer.effectAllowed = 'copyMove'  // 复制或移动
e.dataTransfer.effectAllowed = 'link'      // 链接
e.dataTransfer.effectAllowed = 'all'       // 全部

// 拖拽时显示的自定义图片
const img = new Image()
img.src = 'drag-image.png'
e.dataTransfer.setDragImage(img, 10, 10)

// 文件拖拽
dropzone.addEventListener('drop', function(e) {
  e.preventDefault()
  const files = e.dataTransfer.files
  for (let i = 0; i < files.length; i++) {
    console.log(files[i].name, files[i].size, files[i].type)
  }
})
```

---

## 10. 地理位置 API

### 8.1 获取位置

```javascript
// 检查支持
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    // 成功回调
    function(position) {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = position.coords.accuracy  // 精度（米）
      const altitude = position.coords.altitude  // 海拔
      const speed = position.coords.speed        // 速度
      const heading = position.coords.heading    // 朝向

      console.log(`纬度: ${lat}, 经度: ${lng}`)
      console.log(`精度: ${accuracy}米`)
    },
    // 错误回调
    function(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('用户拒绝获取位置')
          break
        case error.POSITION_UNAVAILABLE:
          console.log('位置不可用')
          break
        case error.TIMEOUT:
          console.log('请求超时')
          break
      }
    },
    // 配置
    {
      enableHighAccuracy: true,  // 高精度模式
      timeout: 5000,            // 超时时间（毫秒）
      maximumAge: 0             // 缓存时间（0=不用缓存）
    }
  )
}
```

### 8.2 持续监听位置

```javascript
const watchId = navigator.geolocation.watchPosition(
  function(position) {
    console.log(`位置更新: ${position.coords.latitude}, ${position.coords.longitude}`)
  },
  function(error) {
    console.error(error.message)
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
)

// 停止监听
navigator.geolocation.clearWatch(watchId)
```

---

## 11. 音视频 API

### 9.1 HTMLAudioElement / HTMLVideoElement

```html
<audio id="myAudio" src="audio.mp3"></audio>
<video id="myVideo" src="video.mp4"></video>
```

```javascript
const audio = document.getElementById('myAudio')
const video = document.getElementById('myVideo')

// 播放控制
audio.play()
audio.pause()
audio.load()  // 重新加载

// 音量（0-1）
audio.volume = 0.5
audio.muted = true  // 静音

// 播放速率
audio.playbackRate = 1.5  // 1.5倍速

// 播放位置
audio.currentTime = 30  // 跳到30秒
audio.duration        // 总时长
audio.currentTime     // 当前播放位置

// 是否暂停/结束
audio.paused
audio.ended

// 循环
audio.loop = true
```

### 9.2 视频属性

```javascript
video.width = 800
video.height = 600
video.poster = 'thumbnail.jpg'  // 封面图
video.controls = true          // 显示控制条
video.autoplay = true          // 自动播放
video.loop = true              // 循环
video.muted = true             // 静音

// 全屏
video.requestFullscreen()

// 画布截图
const canvas = document.createElement('canvas')
canvas.width = video.videoWidth
canvas.height = video.videoHeight
canvas.getContext('2d').drawImage(video, 0, 0)
const image = canvas.toDataURL('image/png')
```

### 9.3 事件监听

```javascript
// 加载完成
audio.addEventListener('loadedmetadata', function() {
  console.log('总时长:', this.duration)
})

// 可以播放
audio.addEventListener('canplay', function() {
  console.log('可以播放了')
})

// 播放中
audio.addEventListener('timeupdate', function() {
  console.log('当前时间:', this.currentTime)
})

// 播放结束
audio.addEventListener('ended', function() {
  console.log('播放结束')
})

// 进度
audio.addEventListener('progress', function() {
  console.log('缓冲:', this.buffered)
})

// 播放出错
audio.addEventListener('error', function() {
  console.error('播放错误')
})
```

### 9.4 MediaDevices API（摄像头/麦克风）

```javascript
// 获取媒体设备
async function getMediaDevices() {
  // 请求权限
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,           // 启用摄像头
    audio: true            // 启用麦克风
  })

  // 预览
  const video = document.querySelector('video')
  video.srcObject = stream
  video.play()

  return stream
}

// 获取设备列表
async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const cameras = devices.filter(d => d.kind === 'videoinput')
  const microphones = devices.filter(d => d.kind === 'audioinput')
  console.log('摄像头:', cameras)
  console.log('麦克风:', microphones)
}

// 约束条件
async function advancedMedia() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'  // 前置摄像头
    },
    audio: {
      echoCancellation: true,  // 回声消除
      noiseSuppression: true  // 降噪
    }
  })
}

// 录制
async function recordScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  })

  const recorder = new MediaRecorder(stream)
  const chunks = []

  recorder.ondataavailable = function(e) {
    chunks.push(e.data)
  }

  recorder.onstop = function() {
    const blob = new Blob(chunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    // 下载或播放
  }

  recorder.start()

  // 停止录制
  setTimeout(() => recorder.stop(), 10000)
}

// 停止所有轨道
function stopStream(stream) {
  stream.getTracks().forEach(track => track.stop())
}
```

---

## 12. 剪贴板与文件 API

### 10.1 剪贴板 API

```javascript
// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 读取剪贴板（需要用户授权）
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    console.log('剪贴板内容:', text)
  } catch (err) {
    console.error('读取失败:', err)
  }
}

// 复制图片
async function copyImage(imageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = imageElement.naturalWidth
  canvas.height = imageElement.naturalHeight
  canvas.getContext('2d').drawImage(imageElement, 0, 0)

  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      console.log('图片已复制')
    } catch (err) {
      console.error('复制失败:', err)
    }
  })
}
```

### 10.2 文件选择

```html
<input type="file" id="fileInput">
<input type="file" id="multiFileInput" multiple>
<input type="file" id="imageInput" accept="image/*">
<input type="file" id="videoInput" accept="video/*">
<input type="file" id="audioInput" accept="audio/*">
```

```javascript
const fileInput = document.getElementById('fileInput')

fileInput.addEventListener('change', function() {
  const file = this.files[0]

  if (file) {
    console.log('文件名:', file.name)
    console.log('文件大小:', file.size, '字节')
    console.log('文件类型:', file.type)
    console.log('最后修改:', new Date(file.lastModified))
  }
})

// 读取文件内容
fileInput.addEventListener('change', function() {
  const file = this.files[0]
  if (!file) return

  // 文本
  const reader1 = new FileReader()
  reader1.onload = function(e) {
    console.log('文本内容:', e.target.result)
  }
  reader1.readAsText(file)

  // DataURL（图片预览）
  const reader2 = new FileReader()
  reader2.onload = function(e) {
    const img = document.createElement('img')
    img.src = e.target.result
    document.body.appendChild(img)
  }
  reader2.readAsDataURL(file)

  // ArrayBuffer（二进制处理）
  const reader3 = new FileReader()
  reader3.onload = function(e) {
    console.log('二进制:', e.target.result)
  }
  reader3.readAsArrayBuffer(file)
})
```

### 10.3 拖拽上传文件

```html
<div id="dropzone">拖拽文件到此处</div>
```

```javascript
const dropzone = document.getElementById('dropzone')

dropzone.addEventListener('dragover', function(e) {
  e.preventDefault()
  this.style.borderColor = 'blue'
})

dropzone.addEventListener('dragleave', function(e) {
  this.style.borderColor = '#ccc'
})

dropzone.addEventListener('drop', function(e) {
  e.preventDefault()
  this.style.borderColor = '#ccc'

  const files = e.dataTransfer.files
  handleFiles(files)
})

function handleFiles(files) {
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      // 图片文件处理
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      document.body.appendChild(img)
    }

    // 上传到服务器
    const formData = new FormData()
    formData.append('file', file)

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
  }
}
```

### 10.4 下载文件

```javascript
// 方式1：直接下载
function download(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// 方式2：下载 Blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 方式3：下载文本
function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' })
  downloadBlob(blob, filename)
}

// 方式4：下载 CSV
function downloadCSV(data, filename) {
  const csv = data.map(row => row.join(',')).join('\n')
  downloadText(csv, filename)
}

// 方式5：下载 JSON
function downloadJSON(obj, filename) {
  const json = JSON.stringify(obj, null, 2)
  downloadText(json, filename)
}
```

---

## 13. 通知与摇一摇

### 11.1 Notification API

```javascript
// 检查支持
if ('Notification' in window) {
  console.log('支持通知')
}

// 请求权限
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  console.log('权限状态:', permission)  // 'granted', 'denied', 'default'
}

// 发送通知
function showNotification() {
  if (Notification.permission === 'granted') {
    const notification = new Notification('标题', {
      body: '这是通知内容',
      icon: 'icon.png',
      tag: 'unique-id',  // 相同 tag 会替换旧通知
      requireInteraction: false,  // 保持显示直到用户关闭
      silent: false  // 不播放声音
    })

    // 点击通知
    notification.onclick = function() {
      window.focus()
      notification.close()
    }

    // 关闭通知
    setTimeout(() => notification.close(), 5000)
  }
}

// Service Worker 通知（后台通知）
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('标题', {
    body: '内容',
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: 'https://example.com' }
  })
})
```

### 11.2 DeviceMotionEvent（摇一摇）

```javascript
// 检查支持
if ('DeviceMotionEvent' in window) {
  // iOS 13+ 需要请求权限
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    async function requestPermission() {
      const response = await DeviceMotionEvent.requestPermission()
      if (response === 'granted') {
        window.addEventListener('devicemotion', handleMotion)
      }
    }
  } else {
    window.addEventListener('devicemotion', handleMotion)
  }
}

let lastX, lastY, lastZ
let lastTime = Date.now()

function handleMotion(event) {
  const acceleration = event.accelerationIncludingGravity
  const currentTime = Date.now()
  const timeDiff = currentTime - lastTime

  if (timeDiff > 100) {
    const x = acceleration.x
    const y = acceleration.y
    const z = acceleration.z

    const speed = Math.abs(x - lastX + y - lastY + z - lastZ) / timeDiff * 10000

    if (speed > 25) {
      console.log('摇一摇 detected!')
      // 触发相应动作
    }

    lastX = x
    lastY = y
    lastZ = z
    lastTime = currentTime
  }
}
```

### 11.3 Vibration API（振动）

```javascript
// 检查支持
if ('vibrate' in navigator) {
  // 振动 200ms
  navigator.vibrate(200)

  // 振动模式：振动 100ms，暂停 50ms，振动 200ms
  navigator.vibrate([100, 50, 200])

  // 停止振动
  navigator.vibrate(0)
}
```

---

## 14. Web Worker

Web Worker 允许在后台线程运行脚本，不阻塞 UI。

### 12.1 创建 Worker

```javascript
// main.js
const worker = new Worker('worker.js')

// 发送消息到 Worker
worker.postMessage({ type: 'calc', data: 100 })

// 接收 Worker 消息
worker.onmessage = function(e) {
  console.log('Worker 返回:', e.data)
}

// 错误处理
worker.onerror = function(e) {
  console.error('Worker 错误:', e.message)
}

// 终止 Worker
worker.terminate()
```

### 12.2 Worker 脚本

```javascript
// worker.js
self.onmessage = function(e) {
  const { type, data } = e.data

  if (type === 'calc') {
    // 耗时计算
    let result = 0
    for (let i = 0; i < data * 1000000; i++) {
      result += i
    }

    // 发送结果
    self.postMessage({ result })
  }
}

// 也可以使用 importScripts 加载脚本
// importScripts('helper.js')
```

### 12.3 专用 Worker 与共享 Worker

```javascript
// 专用 Worker（只被一个脚本使用）
const worker = new Worker('worker.js')

// 共享 Worker（可以被多个脚本访问）
const sharedWorker = new SharedWorker('shared-worker.js')

sharedWorker.port.onmessage = function(e) {
  console.log('共享 Worker 消息:', e.data)
}

sharedWorker.port.postMessage('Hello')
```

### 12.4 Worker 应用场景

```javascript
// 场景1：大数据处理
// main.js
const worker = new Worker('data-processor.js')
worker.postMessage({ array: largeArray })
worker.onmessage = function(e) {
  console.log('处理结果:', e.data)
}

// 场景2：图片处理
// main.js
const worker = new Worker('image-processor.js')
worker.postMessage({ imageData: imageData }, [imageData.buffer])
worker.onmessage = function(e) {
  ctx.putImageData(e.data, 0, 0)
}

// 场景3：文件解析
// main.js
const worker = new Worker('csv-parser.js')
worker.postMessage({ file: file })
worker.onmessage = function(e) {
  console.log('解析的行数:', e.data.length)
}
```

---

## 15. 常用工具函数

### 13.1 防抖（Debounce）

```javascript
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 使用
const debouncedSearch = debounce(function(query) {
  console.log('搜索:', query)
}, 300)

input.addEventListener('input', e => debouncedSearch(e.target.value))
```

### 13.2 节流（Throttle）

```javascript
function throttle(fn, interval) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 使用
const throttledScroll = throttle(function() {
  console.log('滚动位置:', window.scrollY)
}, 200)

window.addEventListener('scroll', throttledScroll)
```

### 13.3 深拷贝

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 基础类型直接返回
  if (obj === null || typeof obj !== 'object') return obj

  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj)

  // 处理 Date
  if (obj instanceof Date) return new Date(obj)

  // 处理 RegExp
  if (obj instanceof RegExp) return new RegExp(obj)

  // 处理数组
  if (Array.isArray(obj)) {
    const arr = []
    hash.set(obj, arr)
    obj.forEach((item, i) => {
      arr[i] = deepClone(item, hash)
    })
    return arr
  }

  // 处理普通对象
  const cloned = {}
  hash.set(obj, cloned)
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key], hash)
    }
  }
  return cloned
}

// 现代方法（有一定限制）
const clone = structuredClone(obj)  // 原生支持循环引用
```

### 13.4 类型判断

```javascript
function getType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

// 使用
getType(123)        // 'number'
getType('abc')      // 'string'
getType(true)       // 'boolean'
getType({})         // 'object'
getType([])         // 'array'
getType(function(){}) // 'function'
getType(new Date()) // 'date'
getType(/regex/)    // 'regexp'
getType(Symbol())   // 'symbol'
getType(BigInt(1))  // 'bigint'
```

### 13.5 URL 参数解析

```javascript
// 方法1：URLSearchParams
function parseQuery(url) {
  const search = new URL(url).search
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

// 方法2：手动解析
function parseQuery(url) {
  const query = url.split('?')[1] || ''
  return query.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    acc[decodeURIComponent(key)] = decodeURIComponent(value || '')
    return acc
  }, {})
}

// 序列化
function stringifyQuery(params) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}
```

### 13.6 格式化时间

```javascript
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

// 使用
formatDate(new Date(), 'YYYY-MM-DD')           // '2024-01-15'
formatDate('2024-01-15', 'YYYY年MM月DD日')      // '2024年01月15日'
```

### 13.7 节流滚动到加载更多

```javascript
function lazyLoad(callback) {
  const throttled = throttle(function() {
    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop + windowHeight >= documentHeight - 100) {
      callback()
    }
  }, 300)

  window.addEventListener('scroll', throttled)
}

// 使用
lazyLoad(function() {
  console.log('触底加载')
  loadMoreData()
})
```

### 13.8 图片懒加载

```javascript
function lazyLoadImages(selector = 'img[data-src]') {
  const images = document.querySelectorAll(selector)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px'  // 提前 50px 加载
  })

  images.forEach(img => observer.observe(img))
}

// HTML
// <img data-src="real-image.jpg" src="placeholder.jpg" alt="">
```

### 13.9 检测元素是否在视口内

```javascript
function isInViewport(element, partially = false) {
  const rect = element.getBoundingClientRect()

  if (partially) {
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

// IntersectionObserver 方式
function observeVisibility(element, callback) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      callback(entry.isIntersecting, entry)
    })
  })

  observer.observe(element)
  return observer
}
```

### 13.10 复制到剪贴板（兼容）

```javascript
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }

  // 兼容旧浏览器（已废弃，但仍有使用场景）
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}
```

---

## 16. FormData API

FormData 是用于处理表单数据的 API，常与 Fetch API 配合使用。

### 14.1 创建 FormData

```javascript
// 方式1：从表单创建
const form = document.querySelector('form')
const formData = new FormData(form)

// 方式2：空 FormData
const formData = new FormData()

// 方式3：从已有数据创建
const formData = new FormData()
formData.append('name', 'John')
formData.append('age', 30)
```

### 14.2 操作数据

```javascript
const formData = new FormData()

// 添加字段
formData.append('name', 'John')
formData.append('age', 30)

// 添加多个值（同名参数）
formData.append('tags', 'js')
formData.append('tags', 'css')

// 设置字段（覆盖已有值）
formData.set('name', 'Jane')  // 替换 'John'

// 获取单个值
formData.get('name')   // 'Jane'

// 获取所有值
formData.getAll('tags') // ['js', 'css']

// 检查字段是否存在
formData.has('name')    // true

// 删除字段
formData.delete('age')

// 遍历所有字段
for (const [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`)
}

// 遍历所有键
for (const key of formData.keys()) {
  console.log(key)
}

// 遍历所有值
for (const value of formData.values()) {
  console.log(value)
}
```

### 14.3 文件处理

```javascript
const formData = new FormData()
const fileInput = document.querySelector('input[type="file"]')

// 添加单个文件
formData.append('avatar', fileInput.files[0])

// 添加多个文件
for (let i = 0; i < fileInput.files.length; i++) {
  formData.append('files[]', fileInput.files[i])
}

// 创建文件切片（用于断点续传）
function sliceFile(file, chunkSize = 1024 * 1024) {  // 1MB per chunk
  const chunks = []
  let start = 0
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size)
    chunks.push(file.slice(start, end))
    start = end
  }
  return chunks
}
```

### 14.4 发送 FormData

```javascript
// 与 Fetch 配合
async function submitForm(formData) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData  // 不需要设置 Content-Type，Fetch 会自动设置
  })
  return response.json()
}

// 模拟表单提交（multipart/form-data）
const form = document.querySelector('form')
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(form)
  // 处理提交...
})
```

---

## 17. IntersectionObserver API

IntersectionObserver 用于检测元素进入/离开视口，是懒加载和无限滚动的基础。

### 15.1 基础用法

```javascript
// 创建观察者
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口:', entry.target)
    } else {
      console.log('元素离开视口:', entry.target)
    }
  })
}, {
  root: null,              // 观察视口，null 表示 viewport
  rootMargin: '0px',      //  root 的外边距
  threshold: [0, 0.5, 1]  // 触发时机：0%, 50%, 100%
})

// 观察元素
observer.observe(document.querySelector('.target'))

// 停止观察
observer.unobserve(element)

// 断开所有观察
observer.disconnect()
```

### 15.2 懒加载图片

```javascript
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px'  // 提前 50px 加载
  })

  images.forEach(img => observer.observe(img))
}

// HTML: <img data-src="real-image.jpg" src="placeholder.jpg" alt="">
```

### 15.3 无限滚动

```javascript
async function infiniteScroll() {
  const sentinel = document.querySelector('#sentinel')

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      const data = await fetchMoreData()
      renderItems(data)

      if (data.hasMore) {
        observer.observe(sentinel)
      } else {
        observer.disconnect()
      }
    }
  })

  observer.observe(sentinel)
}
```

### 15.4 Entry 对象属性

```javascript
observer.observe(element)

observer.callback = (entries) => {
  entries.forEach(entry => {
    // 目标元素
    entry.target

    // 是否在视口中
    entry.isIntersecting

    // 相交比例（0-1）
    entry.intersectionRatio

    // 相交区域信息
    entry.intersectionRect

    // 目标区域信息
    entry.boundingClientRect

    // 根区域信息
    entry.rootBounds
  })
}
```

---

## 18. MutationObserver API

MutationObserver 用于观测 DOM 变化，可以替代废弃的 `DOMNodeInserted` 等事件。

### 16.1 创建观察者

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('变化类型:', mutation.type)
    console.log('变化的元素:', mutation.target)
    console.log('变化内容:', mutation.attributeName, mutation.oldValue)
  })
})

// 配置观察选项
const config = {
  childList: true,      // 观察子节点变化
  subtree: true,        // 观察所有后代
  attributes: true,    // 观察属性变化
  attributeOldValue: true,  // 记录属性旧值
  attributeFilter: ['class', 'data-*'],  // 只观察特定属性
  characterData: true,  // 观察文本内容变化
  characterDataOldValue: true  // 记录旧文本
}

// 开始观察
observer.observe(document.querySelector('#app'), config)

// 停止观察
observer.disconnect()

// 获取所有待处理的观察记录
observer.takeRecords()
```

### 16.2 常见使用场景

```javascript
// 场景1：检测元素是否被添加到 DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.matches('.dynamic-element')) {
        console.log('动态元素已添加:', node)
      }
    })
  })
})

// 场景2：响应样式变化
const styleObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      const element = mutation.target
      if (element.classList.contains('active')) {
        console.log('元素被激活')
      }
    }
  })
})

// 场景3：检测内容变化
const contentObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'characterData') {
      console.log('内容从"', mutation.oldValue, '"变为"', mutation.target.textContent, '"')
    }
  })
})
```

---

## 19. BroadcastChannel API

BroadcastChannel 用于同源下不同标签页、窗口、iframe 之间的通信。

### 17.1 基本用法

```javascript
// 创建频道
const channel = new BroadcastChannel('my-channel')

// 发送消息
channel.postMessage({ type: 'update', data: 'Hello from tab 1' })

// 接收消息
channel.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// 关闭频道
channel.close()
```

### 17.2 实际应用

```javascript
// tab1.js
const channel = new BroadcastChannel('user-sync')

// 用户登录时发送消息
function login(user) {
  localStorage.setItem('user', JSON.stringify(user))
  channel.postMessage({ type: 'login', user })
}

// 监听其他标签页的登录
channel.onmessage = (event) => {
  if (event.data.type === 'login') {
    console.log('用户在另一个标签页登录:', event.data.user)
    updateUI(event.data.user)
  }
}

// tab2.js（类似逻辑）
const channel = new BroadcastChannel('user-sync')
channel.onmessage = (event) => {
  if (event.data.type === 'login') {
    location.reload()  // 同步登录状态
  }
}
```

---

## 20. WebSocket API

WebSocket 提供了浏览器与服务器之间的双向通信，比 HTTP 轮询更高效。

### 18.1 建立连接

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('wss://example.com/ws')

// 连接状态
ws.readyState  // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED

// 连接打开
ws.onopen = () => {
  console.log('连接已建立')
  ws.send('Hello Server')
}

// 接收消息
ws.onmessage = (event) => {
  const data = event.data
  console.log('收到消息:', data)
}

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error)
}

// 连接关闭
ws.onclose = (event) => {
  console.log('连接关闭:', event.code, event.reason)
}
```

### 18.2 发送与接收

```javascript
// 发送消息
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }))

// 发送二进制数据
const buffer = new ArrayBuffer(8)
ws.send(buffer)

// 接收不同类型数据
ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    console.log('收到 Blob:', event.data.size, 'bytes')
  } else if (event.data instanceof ArrayBuffer) {
    console.log('收到 ArrayBuffer')
  } else {
    console.log('收到文本:', event.data)
  }
}
```

### 18.3 断线重连

```javascript
class ReconnectingWebSocket {
  constructor(url) {
    this.url = url
    this.reconnectInterval = 1000
    this.maxReconnectInterval = 30000
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('连接建立')
      this.reconnectInterval = 1000
    }

    this.ws.onclose = () => {
      console.log('连接断开，准备重连...')
      setTimeout(() => this.connect(), this.reconnectInterval)
      this.reconnectInterval = Math.min(this.reconnectInterval * 2, this.maxReconnectInterval)
    }

    this.ws.onmessage = (e) => this.onmessage(e)
    this.ws.onerror = (e) => this.onerror(e)
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }
}
```

---

## 21. Server-Sent Events (SSE)

SSE 允许服务器向浏览器推送数据，是单向实时通信的轻量方案。

### 19.1 基础用法

```javascript
// 创建 EventSource
const eventSource = new EventSource('/api/stream')

// 监听默认消息
eventSource.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// 监听自定义事件
eventSource.addEventListener('update', (event) => {
  console.log('收到更新:', JSON.parse(event.data))
})

// 连接关闭
eventSource.close()
```

### 19.2 后端格式

```javascript
// text/event-stream 格式
// 每个事件以 'data:' 开头

// 简单消息
// data: Hello

// 多行数据
// data: Line 1
// data: Line 2

// JSON 数据
// data: {"message": "Hello"}

// 命名事件
// event: update
// data: {"count": 1}

// ID 和重连
// id: 1
// data: Message 1
//
// id: 2
// data: Message 2

// 注释（保持连接）
// : This is a comment
```

### 19.3 完整示例

```javascript
// 前端
const eventSource = new EventSource('/api/notifications')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  showNotification(data.title, data.body)
}

eventSource.onerror = () => {
  console.error('SSE 连接错误')
  eventSource.close()
  // 可以在这里实现重连逻辑
}

// 后端（Node.js 示例）
// app.get('/api/stream', (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream')
//   res.setHeader('Cache-Control', 'no-cache')
//   res.setHeader('Connection', 'keep-alive')
//
//   const interval = setInterval(() => {
//     res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`)
//   }, 1000)
//
//   req.on('close', () => {
//     clearInterval(interval)
//   })
// })
```

---

## 22. Performance API

Performance API 提供了访问页面性能相关信息的接口。

### 20.1 基础用法

```javascript
// 获取性能数据
const performance = window.performance

// 关键时间点
performance.navigation.type        // 导航类型：0=初访, 1=刷新, 2=后退
performance.navigation.redirectCount  // 重定向次数

// 时间数据
const timing = performance.timing
console.log('页面加载时间:', timing.loadEventEnd - timing.navigationStart)
console.log('DNS 解析:', timing.domainLookupEnd - timing.domainLookupStart)
console.log('TCP 连接:', timing.connectEnd - timing.connectStart)
console.log('首字节时间:', timing.responseStart - timing.requestStart)
console.log('DOM 解析:', timing.domContentLoadedEventEnd - timing.domLoading)
```

### 20.2 PerformanceObserver

```javascript
// 观察性能条目
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.name, entry.duration)
  })
})

// 观察所有指标
observer.observe({ entryTypes: ['paint', 'longtask', 'resource', 'navigation'] })

// 观察首次内容绘制 (FCP)
const paintObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      console.log('首次内容绘制:', entry.startTime, 'ms')
    }
  })
})
paintObserver.observe({ type: 'paint', buffered: true })

// 观察长任务
const longTaskObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(task => {
    console.warn('长任务:', task.duration, 'ms')
  })
})
longTaskObserver.observe({ type: 'longtask', buffered: true })
```

### 20.3 资源加载性能

```javascript
const resourceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('资源:', entry.name)
    console.log('  类型:', entry.initiatorType)
    console.log('  请求耗时:', entry.duration, 'ms')
    console.log('  DNS:', entry.domainLookupEnd - entry.domainLookupStart, 'ms')
    console.log('  TCP:', entry.connectEnd - entry.connectStart, 'ms')
    console.log('  TTFB:', entry.responseStart - entry.requestStart, 'ms')
    console.log('  下载:', entry.responseEnd - entry.responseStart, 'ms')
  })
})
resourceObserver.observe({ type: 'resource', buffered: true })
```

---

## 23. requestIdleCallback API

requestIdleCallback 允许在浏览器空闲时执行低优先级任务，避免阻塞主线程。

### 21.1 基础用法

```javascript
// 在空闲时执行任务
requestIdleCallback((deadline) => {
  console.log('剩余时间:', deadline.timeRemaining(), 'ms')
  console.log('是否超时:', deadline.didTimeout)

  // 执行耗时任务
  doHeavyWork()
})

// 带超时
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
    processNextTask()
  }
}, { timeout: 2000 })  // 2秒后强制执行
```

### 21.2 实际应用

```javascript
// 任务调度器
class TaskScheduler {
  constructor() {
    this.tasks = []
  }

  addTask(task, priority = 0) {
    this.tasks.push({ task, priority })
    this.tasks.sort((a, b) => a.priority - b.priority)
    this.schedule()
  }

  schedule() {
    requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 0 && this.tasks.length > 0) {
        const { task } = this.tasks.shift()
        task()
      }

      if (this.tasks.length > 0) {
        this.schedule()
      }
    })
  }
}

// 使用示例
const scheduler = new TaskScheduler()

// 高优先级
scheduler.addTask(() => updateUI(), 0)

// 低优先级（可延迟）
scheduler.addTask(() => analytics.send(), 10)
scheduler.addTask(() => prefetchImages(), 10)
```

### 21.3 取消回调

```javascript
const callbackId = requestIdleCallback((deadline) => {
  // 任务...
})

// 取消
cancelIdleCallback(callbackId)
```

---

## 24. Visual Viewport API

Visual Viewport API 提供了虚拟视口的概念，用于处理移动端缩放场景。

### 22.1 基础属性

```javascript
const visualViewport = window.visualViewport

// 视口位置（相对于布局视口）
visualViewport.offsetLeft     // 左侧偏移
visualViewport.offsetTop      // 顶部偏移

// 视口尺寸
visualViewport.width          // 宽度
visualViewport.height         // 高度

// 缩放比例
visualViewport.scale          // 当前缩放比例

// 布局视口的尺寸（不变）
visualViewport.layoutViewportWidth
visualViewport.layoutViewportHeight
```

### 22.2 事件监听

```javascript
// 监听视口变化
visualViewport.addEventListener('resize', () => {
  console.log('视口大小:', visualViewport.width, 'x', visualViewport.height)
  console.log('缩放比例:', visualViewport.scale)
})

visualViewport.addEventListener('scroll', () => {
  console.log('视口位置:', visualViewport.offsetLeft, visualViewport.offsetTop)
})
```

### 22.3 固定定位与缩放

```javascript
// 解决移动端 fixed 定位与键盘弹出问题
const fixedElement = document.querySelector('.fixed-footer')

function updateFixedPosition() {
  // 使用 visualViewport 而非 window
  const viewport = window.visualViewport
  fixedElement.style.bottom = `${viewport.height - viewport.offsetTop - viewport.offsetTop}px`
}

visualViewport.addEventListener('resize', updateFixedPosition)
visualViewport.addEventListener('scroll', updateFixedPosition)
```

---

## 25. Pointer Lock API

Pointer Lock API 用于锁定鼠标光标，适用于需要无限鼠标移动的场景（如 3D 游戏）。

### 23.1 基础用法

```javascript
const canvas = document.querySelector('canvas')

// 请求锁定
canvas.addEventListener('click', () => {
  canvas.requestPointerLock()
})

// 监听锁定状态
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    console.log('已锁定')
  } else {
    console.log('已解锁')
  }
})

// 监听鼠标移动
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas) {
    console.log('移动:', e.movementX, e.movementY)
    // 更新相机/角色旋转
    camera.rotation.y -= e.movementX * 0.002
    camera.rotation.x -= e.movementY * 0.002
  }
})

// 手动解锁
document.exitPointerLock()
```

### 23.2 锁定变化事件

```javascript
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    console.log('锁定元素:', document.pointerLockElement)
  } else {
    console.log('已解锁，退出原因:', document.pointerLockElement)
  }
})

document.addEventListener('pointerlockerror', (e) => {
  console.error('Pointer Lock 错误:', e)
})
```

---

## 附录：浏览器兼容性与注意事项

### 常用 API 兼容性速查

| API | 兼容性 | 备注 |
|-----|--------|------|
| getBoundingClientRect | IE9+ |  |
| querySelector/querySelectorAll | IE9+ |  |
| classList | IE10+ |  |
| localStorage | IE9+ | 需 try-catch 包裹 |
| sessionStorage | IE9+ |  |
| IndexedDB | IE11+ | 需前缀 |
| Canvas | IE9+ |  |
| Fetch | IE11+ | 需 polyfill |
| Promise | IE11+ | 需 polyfill |
| IntersectionObserver | IE11+ | 需 polyfill |
| Clipboard API | IE11+ | 需 HTTPS |
| Notification | Chrome/Safari | 需用户授权 |
| Service Worker | IE11+ | 需 polyfill |
| BroadcastChannel | Chrome56+, Firefox78+, Safari15.4+ | 不支持 IE/旧版 Edge |
| WebSocket | IE10+ |  |
| SSE | IE11+ (需 polyfill) | 现代浏览器原生支持 |
| Performance API | IE11+ | timing 部分 |
| requestIdleCallback | Chrome47+, Safari14.1+ | 需 polyfill |
| Visual Viewport API | Chrome61+, Safari13.1+ | 不支持 Firefox |
| Pointer Lock API | Chrome37+, Safari10.1+ |  |
| MutationObserver | IE11+ |  |
| FormData | IE10+ (部分) | IE9 不支持 |
| URL/URLSearchParams | IE12+ | 需 polyfill |

### 安全注意事项

1. **XSS 防护**：使用 `textContent` 而非 `innerHTML` 处理用户输入
2. **CSRF 防护**：请求时携带 Token 或使用 SameSite Cookie
3. **内容安全策略**：通过 CSP 头限制资源加载
4. **安全上下文**：部分 API（摄像头、麦克风、剪贴板）需要 HTTPS
5. **敏感操作**：Clipboard、Location 等 API 会触发用户提示

### 性能优化建议

1. 使用 `requestAnimationFrame` 而非 `setInterval` 做动画
2. 使用 `DocumentFragment` 批量插入 DOM
3. 使用 `IntersectionObserver` 而非 scroll 事件做懒加载
4. 使用 `will-change` 提示浏览器优化
5. 合理使用 `节流` 和 `防抖`
6. 大数据处理考虑使用 Web Worker
7. 使用 `requestIdleCallback` 处理非关键任务
8. 使用 `PerformanceObserver` 监控性能指标

### 2026 年现代 Web API 新增特性

以下 API 在近年得到广泛支持，可放心使用：

```javascript
// structuredClone - 原生深拷贝（支持循环引用）
const clone = structuredClone(original)

// IntersectionObserver - 现代懒加载标准
new IntersectionObserver(callback, { rootMargin: '50px' })

// ResizeObserver - 观测元素尺寸变化
new ResizeObserver(callback).observe(element)

// Navigation API - 替代 history API（Chrome 102+）
navigation.currentEntry.url
navigation.navigate('/new-url')

// View Transitions API - 页面过渡动画（Chrome 111+）
document.startViewTransition(() => updateDOM())

// Popover API - 原生弹出框（Chrome 114+）
element.showPopover()
element.hidePopover()

//scroll-driven animations - 滚动驱动动画（Chrome 115+）
// CSS: animation-timeline: scroll()
```

---

