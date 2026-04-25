# Web API 全面指南

> 本文档按使用频率排序，常用 API 在前，便于快速查阅。每个 API 都配有详细的代码示例和用法解释。

---

## 目录

### 高频使用（日常开发）
1. [DOM API](#1-dom-api)
2. [事件 API](#2-事件-api)
3. [网络请求](#3-网络请求)
4. [存储 API](#4-存储-api)
5. [URL 与 URLSearchParams](#5-url-与-urlsearchparams)
6. [BOM 浏览器对象模型](#6-bom-浏览器对象模型)
7. [定时器与异步](#7-定时器与异步)
8. [表单与剪贴板](#8-表单与剪贴板)

### 中频使用（特定场景）
9. [Canvas 绘图](#9-canvas-绘图)
10. [IntersectionObserver](#10-intersectionobserver)
11. [地理位置与设备传感器](#11-地理位置与设备传感器)
12. [MutationObserver](#12-mutationobserver)
13. [IndexedDB 数据库](#13-indexeddb-数据库)
14. [音视频 API](#14-音视频-api)
15. [拖拽 API](#15-拖拽-api)

### 专业级（高级应用）
16. [WebSocket 实时通信](#16-websocket-实时通信)
17. [Server-Sent Events](#17-server-sent-events)
18. [BroadcastChannel](#18-broadcastchannel)
19. [Web Worker](#19-web-worker)
20. [Performance 性能监控](#20-performance-性能监控)
21. [requestIdleCallback](#21-requestidlecallback)
22. [Visual Viewport](#22-visual-viewport)
23. [Pointer Lock](#23-pointer-lock)

---

## 1. DOM API

DOM（Document Object Model）是将 HTML/XML 文档当作树形结构操作的接口，是网页开发的基础。

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

// 获取 body
document.body

// 获取 html
document.documentElement
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

// 插入到参考元素之后
function insertAfter(newEl, referenceEl) {
  return referenceEl.insertAdjacentElement('afterend', newEl)
}

// 高级插入（可插入文本或HTML）
element.insertAdjacentHTML('beforeend', '<span>插入的HTML</span>')
// 位置选项: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'

// 创建文档片段（批量插入，性能优化）
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  fragment.appendChild(document.createElement('div'))
}
container.appendChild(fragment)  // 一次性插入，只触发一次回流
```

### 1.3 删除与替换元素

```javascript
// 删除元素
element.remove()

// 删除子元素
parent.removeChild(child)

// 替换元素
parent.replaceChild(newEl, oldEl)

// 清空元素
element.innerHTML = ''
// 或
while (element.firstChild) {
  element.removeChild(element.firstChild)
}
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

// classList 操作（推荐）
element.classList.add('active')
element.classList.remove('active')
element.classList.toggle('active')
element.classList.contains('active')
element.classList.replace('old', 'new')
element.classList.item(0)  // 获取第一个类名
```

### 1.5 操作元素样式

```javascript
// 行内样式
element.style.color = 'red'
element.style.backgroundColor = '#fff'
element.style.cssText = 'color: red; background: blue'  // 批量设置

// 获取计算后的样式（只读）
const styles = window.getComputedStyle(element)
const color = styles.color
const width = styles.width

// 批量读取
const { width, height, margin } = window.getComputedStyle(element)

// 获取伪元素样式
const beforeStyle = window.getComputedStyle(element, '::before')
```

### 1.6 操作元素内容

```javascript
// 操作文本（安全，自动转义）
element.textContent = '纯文本内容'
const text = element.textContent

// 操作 HTML（有 XSS 风险，谨慎使用）
element.innerHTML = '<strong>HTML</strong>内容'
const html = element.innerHTML

// 操作纯文本（与 textContent 类似但返回 HTMLElement）
element.innerText = '文本'

// 获取/设置表单值
input.value = '默认值'
const val = input.value

// 富文本编辑
element.contentEditable = 'true'
element.isContentEditable  // true/false
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

// 滚动到视口
element.scrollIntoView()
element.scrollIntoView({ behavior: 'smooth', block: 'center' })

// 获取元素尺寸（content + padding + border）
const offsetWidth = element.offsetWidth
const offsetHeight = element.offsetHeight

// 获取元素尺寸（content + padding）
const clientWidth = element.clientWidth
const clientHeight = element.clientHeight

// 获取元素相对于定位祖先的位置
const offsetTop = element.offsetTop
const offsetLeft = element.offsetLeft
const parent = element.offsetParent  // 定位祖先元素

// 获取滚动尺寸
element.scrollWidth   // 内容宽度
element.scrollHeight  // 内容高度
element.scrollTop     // 垂直滚动位置
element.scrollLeft    // 水平滚动位置
```

### 1.8 元素节点操作

```javascript
// 节点类型
element.nodeType  // 1=Element, 3=Text, 9=Document
node.nodeName     // 'DIV', 'SPAN'

// 父子兄弟关系
element.parentNode
element.parentElement
element.children       // 子元素集合
element.childNodes     // 子节点集合（包含文本节点）
element.firstChild
element.lastChild
element.firstElementChild
element.lastElementChild
element.nextSibling     // 下一个兄弟节点
element.previousSibling // 上一个兄弟节点
element.nextElementSibling
element.previousElementSibling

// 特性方法
element.closest('.selector')  // 向上查找匹配元素
element.contains(child)        // 是否包含某元素
element.matches('.selector')   // 是否匹配选择器

// 复制元素
const clone = element.cloneNode(true)  // 深拷贝（包含子元素）
const clone = element.cloneNode(false) // 浅拷贝（仅自身）
```

---

## 2. 事件 API

事件是用户交互和页面状态变化的核心机制。

### 2.1 绑定事件

```javascript
// DOM0 事件（直接赋值）
element.onclick = function(e) {
  console.log('clicked')
}

// 移除 DOM0 事件
element.onclick = null

// DOM2 事件（addEventListener）
element.addEventListener('click', handler, false)
// 第三个参数：false = 冒泡阶段，true = 捕获阶段

// 移除事件（需要相同函数引用）
element.removeEventListener('click', handler)

// 只执行一次
element.addEventListener('click', handler, { once: true })

// passive（提升滚动性能）
element.addEventListener('touchstart', handler, { passive: true })

// signal（用于 AbortController）
const controller = new AbortController()
element.addEventListener('click', handler, { signal: controller.signal })
controller.abort()  // 移除所有该 signal 的监听器

// 同一个处理函数，重复添加只会执行一次
function handler() { console.log('一次') }
element.addEventListener('click', handler)
element.addEventListener('click', handler)  // 不会执行两次
```

### 2.2 事件对象

```javascript
element.addEventListener('click', function(event) {
  // ===== 基本属性 =====
  event.type              // 'click'
  event.target            // 触发事件的最内层元素
  event.currentTarget     // 绑定事件的元素（等于 this）
  event.bubbles           // 是否冒泡
  event.cancelable        // 是否可取消
  event.timeStamp         // 事件发生时间戳

  // ===== 阻止默认行为 =====
  event.preventDefault()  // 阻止默认行为（如链接跳转、表单提交）
  event.defaultPrevented  // 是否已阻止默认行为

  // ===== 阻止传播 =====
  event.stopPropagation()  // 阻止冒泡
  event.stopImmediatePropagation()  // 阻止冒泡和其他同级的监听器

  // ===== 事件阶段 =====
  // 1 = 捕获阶段, 2 = 目标阶段, 3 = 冒泡阶段
  event.eventPhase

  // ===== 鼠标/键盘位置 =====
  event.clientX           // 相对于视口 X
  event.clientY           // 相对于视口 Y
  event.pageX             // 相对于文档 X
  event.pageY             // 相对于文档 Y
  event.screenX           // 相对于屏幕 X
  event.screenY           // 相对于屏幕 Y

  // ===== 键盘修饰键 =====
  event.key               // 'a', 'ArrowUp', 'Enter'
  event.code              // 'KeyA', 'ArrowUp', 'Enter'
  event.altKey            // 是否按住 Alt
  event.ctrlKey           // 是否按住 Ctrl
  event.shiftKey          // 是否按住 Shift
  event.metaKey           // 是否按住 Meta (Cmd/Win)

  // ===== 鼠标按钮 =====
  event.button            // 0=左, 1=中, 2=右
  event.buttons           // 按下的按钮掩码
  event.relatedTarget     // 相关元素（如 mouseout 的目标）

  // ===== 触摸 =====
  event.touches           // 当前触摸点
  event.changedTouches    // 刚结束的触摸点
  event.targetTouches     // 目标元素上的触摸点
})
```

### 2.3 事件委托

```javascript
// 原理：把事件绑定到父元素，通过 event.target 判断触发元素
parent.addEventListener('click', function(e) {
  // 使用 closest 向上查找（推荐）
  const item = e.target.closest('.item')
  if (item) {
    console.log('点击了 item:', item)
  }

  // 或使用 matches 判断
  if (e.target.matches('.item')) {
    console.log('点击了 item:', e.target)
  }
})

// 优势：
// 1. 减少事件绑定数量
// 2. 支持动态添加的元素
// 3. 内存占用更低
```

### 2.4 自定义事件

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

// 旧式方法（已废弃，不推荐）
// const event = document.createEvent('Event')
// event.initEvent('myEvent', true, true)
```

### 2.5 常见事件类型

```javascript
// ===== 鼠标事件 =====
'click'           // 点击
'dblclick'        // 双击
'contextmenu'     // 右键菜单
'mousedown'       // 鼠标按下
'mouseup'         // 鼠标抬起
'mousemove'       // 鼠标移动
'mouseenter'      // 进入（不冒泡）
'mouseleave'      // 离开（不冒泡）
'mouseover'       // 进入（冒泡）
'mouseout'        // 离开（冒泡）

// ===== 键盘事件 =====
'keydown'         // 按下
'keyup'           // 抬起
// 'keypress' 已废弃，不建议使用

// ===== 表单事件 =====
'submit'          // 表单提交
'reset'           // 表单重置
'focus'           // 获取焦点
'blur'            // 失去焦点
'input'           // 输入时触发（实时）
'change'          // 值变化且失焦后
'search'          // 搜索框搜索
'invalid'         // 表单元素验证失败

// ===== 文档/窗口事件 =====
'DOMContentLoaded' // DOM 加载完成
'load'             // 资源加载完成
'unload'           // 页面关闭（不推荐）
'beforeunload'     // 页面即将关闭（可阻止）
'pageshow'         // 页面显示
'pagehide'         // 页面隐藏
'scroll'           // 滚动
'resize'           // 窗口大小变化

// ===== 触摸事件 =====
'touchstart'       // 触摸开始
'touchmove'        // 触摸移动
'touchend'         // 触摸结束
'touchcancel'      // 触摸取消

// ===== 过渡与动画 =====
'transitionend'    // 过渡结束
'animationstart'   // 动画开始
'animationend'     // 动画结束
'animationiteration' // 动画迭代

// ===== 剪贴板事件 =====
'copy'             // 复制
'cut'              // 剪切
'paste'            // 粘贴

// ===== 拖拽事件 =====
'dragstart'        // 拖拽开始
'drag'             // 拖拽中
'dragend'          // 拖拽结束
'dragenter'        // 进入放置区
'dragover'         // 在放置区上方移动
'dragleave'        // 离开放置区
'drop'             // 放置
```

### 2.6 表单事件详解

```javascript
// input 事件（实时，每次输入都触发）
input.addEventListener('input', function() {
  console.log(this.value)
})

// change 事件（失焦或选择后触发）
input.addEventListener('change', function() {
  console.log(this.value)
})

// invalid 事件（验证失败时触发）
input.addEventListener('invalid', function(e) {
  e.preventDefault()  // 阻止默认提示
  console.log(this.validationMessage)
})

// form 事件
form.addEventListener('submit', function(e) {
  e.preventDefault()
  if (this.checkValidity()) {
    // 提交表单
  }
})

// 检查表单是否有效
form.checkValidity()    // boolean
form.reportValidity()   // 显示浏览器提示

// 获取表单数据
const formData = new FormData(form)
const data = Object.fromEntries(formData)
```

---

## 3. 网络请求

### 3.1 Fetch API

```javascript
// ===== 基础 GET 请求 =====
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))

// ===== async/await 写法 =====
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

// ===== POST 请求 =====
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ name: 'John', age: 30 })
})

// ===== 发送 FormData =====
const formData = new FormData()
formData.append('name', 'John')
formData.append('file', fileInput.files[0])

fetch('/upload', {
  method: 'POST',
  body: formData  // 不需要手动设置 Content-Type
})

// ===== 发送请求时携带 Cookie =====
fetch('https://api.example.com/data', {
  credentials: 'include'  // 允许携带跨域 Cookie
})

// ===== 请求超时 =====
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  return Promise.race([
    fetch(url, { ...options, signal: controller.signal }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}
```

### 3.2 响应对象

```javascript
async function handleResponse(response) {
  // 状态码
  console.log(response.status)       // 200
  console.log(response.ok)           // true (200-299)
  console.log(response.statusText)   // 'OK'

  // 响应头
  response.headers.get('Content-Type')
  [...response.headers.entries()]

  // 解析响应体
  response.json()         // 解析 JSON
  response.text()         // 解析文本
  response.formData()     // 解析 FormData
  response.blob()         // 解析二进制（文件、图片）
  response.arrayBuffer()  // 解析 ArrayBuffer

  // 克隆响应（需要多次读取时）
  const clone = response.clone()
}
```

### 3.3 中断请求

```javascript
const controller = new AbortController()
const { signal } = controller

fetch(url, { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求被中断')
    }
  })

// 3秒后中断
setTimeout(() => controller.abort(), 3000)

// AbortController 可同时中断多个请求
controller.abort()
```

### 3.4 上传与下载

```javascript
// ===== 上传文件 =====
const input = document.querySelector('input[type="file"]')
const file = input.files[0]

const formData = new FormData()
formData.append('file', file)

fetch('/upload', {
  method: 'POST',
  body: formData,
  onUploadProgress: (e) => {
    // 注意：Fetch 不支持原生进度事件
    // 如需进度条，使用 XMLHttpRequest
  }
})

// ===== XMLHttpRequest 上传（带进度）=====
const xhr = new XMLHttpRequest()
xhr.open('POST', '/upload')

xhr.upload.onprogress = (e) => {
  const percent = (e.loaded / e.total) * 100
  console.log(`上传进度: ${percent.toFixed(2)}%`)
}

xhr.onload = () => {
  if (xhr.status === 200) {
    console.log('上传成功')
  }
}

xhr.send(formData)

// ===== 下载文件 =====
async function downloadFile(url, filename) {
  const response = await fetch(url)
  const blob = await response.blob()

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  URL.revokeObjectURL(link.href)
}
```

### 3.5 XMLHttpRequest（老旧但仍有用）

```javascript
const xhr = new XMLHttpRequest()
xhr.open('GET', 'https://api.example.com/data', true)  // async=true

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(JSON.parse(xhr.responseText))
  }
}

xhr.onerror = function() {
  console.error('请求失败')
}

xhr.send()

// 中断
xhr.abort()

// 设置请求头
xhr.setRequestHeader('Content-Type', 'application/json')
```

---

## 4. 存储 API

### 4.1 localStorage

```javascript
// 存储（仅支持字符串）
localStorage.setItem('name', 'John')
localStorage.setItem('age', '30')
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }))

// 读取
localStorage.getItem('name')           // 'John'
localStorage.getItem('age')            // '30'
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
})

// 特点：永久存储，同源共享，容量约 5-10MB
```

### 4.2 sessionStorage

```javascript
// 用法同 localStorage
sessionStorage.setItem('token', 'abc123')
sessionStorage.getItem('token')
sessionStorage.removeItem('token')
sessionStorage.clear()

// 区别：会话结束时清除（标签页关闭即清除）
// 特点：仅当前标签页有效，不跨标签页共享
```

### 4.3 IndexedDB（大型数据库）

```javascript
// ===== 打开数据库 =====
const request = indexedDB.open('MyDatabase', 1)

// 版本升级（数据库创建或升级时触发）
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
  console.log('数据库打开成功')
}

request.onerror = function(e) {
  console.error('数据库错误')
}
```

### 4.4 IndexedDB 常用操作

```javascript
// 添加数据
function addData(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.add(data)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 查询数据
function getData(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 查询所有
function getAllData(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 删除数据
function deleteData(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// 更新数据
function updateData(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(data)  // put 会覆盖，add 会报错
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 游标查询
function cursorQuery(db, storeName, callback) {
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

## 5. URL 与 URLSearchParams

### 5.1 创建 URL 对象

```javascript
// 方式1：使用完整 URL
const url = new URL('https://example.com:8080/path?name=John#section')

// 方式2：相对于基础 URL
const base = new URL('/path', 'https://example.com')  // https://example.com/path

// 方式3：使用当前页面地址
const currentUrl = new URL(window.location.href)
```

### 5.2 URL 对象属性

```javascript
const url = new URL('https://john:pass@example.com:8080/path/name?id=123#section')

url.href        // 'https://john:pass@example.com:8080/path/name?id=123#section'
url.protocol    // 'https:'
url.host        // 'example.com:8080'
url.hostname    // 'example.com'
url.port        // '8080'
url.username    // 'john'
url.password    // 'pass'
url.pathname    // '/path/name'
url.search       // '?id=123'
url.hash        // '#section'
url.origin      // 'https://example.com:8080'（只读）
```

### 5.3 URLSearchParams 操作

```javascript
const url = new URL('https://example.com/search?id=123&name=John')
const params = url.searchParams

// 添加参数
url.searchParams.append('category', 'book')  // ?id=123&name=John&category=book

// 设置参数（覆盖已有）
url.searchParams.set('id', '456')

// 删除参数
url.searchParams.delete('name')

// 获取参数
params.get('id')       // '456'
params.getAll('id')    // ['456']（同名多值）
params.has('name')     // false

// 遍历
for (const [key, value] of params) {
  console.log(`${key} = ${value}`)
}
[...params.keys()]      // ['id', 'category']
[...params.values()]    // ['456', 'book']
[...params.entries()]   // [['id', '456'], ['category', 'book']]

// 排序
params.sort()  // 按键排序

// 自动编码
url.searchParams.set('name', '张三')
url.href  // 'https://example.com/search?id=456&name=%E5%BC%A0%E4%B8%89'
```

### 5.4 URL 编解码

```javascript
// URLSearchParams 会自动编解码
const params = new URLSearchParams()
params.set('name', '张三&李四')
params.toString()  // 'name=%E5%BC%A0%E4%B8%89%26%E6%9D%8E%E5%9B%9B'

// 手动编解码
encodeURIComponent('张三')       // '%E5%BC%A0%E4%B8%89'
decodeURIComponent('%E5%BC%A0%E4%B8%89')  // '张三'

// 注意区别
// encodeURI 不会编码：A-Z a-z 0-9 - _ . ! ~ * ' ( )
// encodeURIComponent 会编码所有非字母数字字符
```

### 5.5 实用工具函数

```javascript
// 解析 URL 参数为对象
function parseURLParams(url) {
  return Object.fromEntries(new URL(url).searchParams)
}

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

// 验证 URL
function isValidURL(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// 提取域名
function extractDomain(url) {
  return new URL(url).hostname
}
```

---

## 6. BOM 浏览器对象模型

BOM（Browser Object Model）提供与浏览器交互的接口。

### 6.1 window 对象

```javascript
// ===== 尺寸 =====
window.innerWidth    // 视口宽度（不含工具栏、地址栏）
window.innerHeight   // 视口高度
window.outerWidth    // 浏览器窗口宽度
window.outerHeight   // 浏览器窗口高度
window.devicePixelRatio  // 设备像素比

// ===== 滚动 =====
window.scrollX       // 水平滚动距离
window.scrollY       // 垂直滚动距离
window.pageXOffset   // 同上（别名）
window.pageYOffset   // 同上（别名）

window.scrollTo(x, y)
window.scrollTo({ top: 100, left: 0, behavior: 'smooth' })
window.scrollBy(0, 100)  // 相对滚动

// ===== 窗口操作 =====
window.open('https://example.com', '_blank', 'width=500,height=400')
window.close()
window.print()  // 打印

// ===== 框架 =====
window.frames     // 所有 iframe
window.parent     // 父窗口
window.top        // 顶级窗口
window.self       // 当前窗口

// ===== 对话框 =====
window.alert('消息')
window.confirm('确定吗？')  // 返回 true/false
window.prompt('输入内容：', '默认值')  // 返回输入或 null

// ===== 计时器 =====
window.setTimeout(fn, 1000)
window.setInterval(fn, 1000)
window.requestAnimationFrame(fn)  // 动画帧
window.cancelAnimationFrame(id)
window.requestIdleCallback(fn)    // 空闲时执行

// ===== 安全属性 =====
window.name       // 窗口名称
window.closed      // 窗口是否关闭
```

### 6.2 navigator 对象（浏览器信息）

```javascript
navigator.userAgent      // 用户代理字符串
navigator.platform       // 平台
navigator.language       // 'zh-CN'
navigator.languages      // ['zh-CN', 'zh', 'en']
navigator.onLine         // 是否在线
navigator.cookieEnabled  // Cookie 是否启用
navigator.hardwareConcurrency  // CPU 核心数
navigator.deviceMemory    // 设备内存（GB，Chrome 专有）
navigator.connection      // 网络连接信息（Chrome）

// ===== 检测设备 =====
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent)
}

// ===== 检测服务 =====
navigator.serviceWorker  // ServiceWorker 容器
navigator.geolocation   // 地理位置
navigator.mediaDevices  // 媒体设备
navigator.clipboard     // 剪贴板
navigator.storage       // 存储管理器
```

### 6.3 location 对象（URL 信息）

```javascript
// ===== URL 各部分 =====
location.href      // 完整 URL
location.protocol // 'https:'
location.host     // 'example.com:8080'
location.hostname // 'example.com'
location.port     // '8080'
location.pathname // '/path/to/page'
location.search   // '?id=1'
location.hash     // '#section'

// ===== 操作 URL =====
location.assign('https://example.com')     // 导航（可后退）
location.replace('https://example.com')    // 导航（不可后退）
location.reload()                          // 刷新
location.reload(true)                      // 强制从服务器刷新

// ===== 解析参数 =====
const params = new URLSearchParams(location.search)
params.get('id')

// ===== 修改 URL（不刷新页面）=====
history.pushState({ data: 'test' }, '', '/new-url')
history.replaceState({ data: 'test' }, '', '/new-url')
```

### 6.4 history 对象（历史记录）

```javascript
// ===== 导航 =====
history.back()      // 后退
history.forward()   // 前进
history.go(-1)      // 相对移动

// ===== 状态 =====
history.length      // 历史记录数量
history.state       // 当前 state 对象

// ===== HTML5 History API =====
history.pushState(state, title, url)   // 添加记录
history.replaceState(state, title, url) // 替换当前记录

// ===== 监听 popstate（浏览器前进后退）=====
window.addEventListener('popstate', (e) => {
  console.log('state:', e.state)
  console.log('当前路径:', location.pathname)
})

// 注意：pushState/replaceState 不触发 popstate
```

### 6.5 screen 对象（屏幕信息）

```javascript
screen.width         // 屏幕宽度
screen.height        // 屏幕高度
screen.availWidth    // 可用宽度（排除任务栏）
screen.availHeight   // 可用高度
screen.colorDepth    // 颜色深度
screen.pixelDepth    // 像素深度
screen.orientation   // 屏幕方向
```

---

## 7. 定时器与异步

### 7.1 setTimeout 与 setInterval

```javascript
// setTimeout：延迟执行一次
const timerId = setTimeout(() => {
  console.log('1秒后执行')
}, 1000)

// 取消
clearTimeout(timerId)

// setInterval：重复执行
const intervalId = setInterval(() => {
  console.log('每1秒执行')
}, 1000)

// 取消
clearInterval(intervalId)

// 实际应用：防抖
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

### 7.2 requestAnimationFrame

```javascript
// 动画循环
function animate() {
  // 更新动画状态
  updateAnimation()

  // 绘制
  draw()

  // 下一帧
  requestAnimationFrame(animate)
}

const animId = requestAnimationFrame(animate)

// 取消
cancelAnimationFrame(animId)

// 配合时间计算动画
let lastTime = 0
function animate(timestamp) {
  const delta = timestamp - lastTime
  lastTime = timestamp

  // 根据 delta 移动（保证不同刷新率下速度一致）
  position += speed * delta / 1000

  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)
```

### 7.3 requestIdleCallback

```javascript
// 在浏览器空闲时执行低优先级任务
requestIdleCallback((deadline) => {
  console.log('剩余时间:', deadline.timeRemaining(), 'ms')
  console.log('是否超时:', deadline.didTimeout)

  // 执行任务
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift())
  }
}, { timeout: 2000 })  // 2秒后强制执行

// 取消
const callbackId = requestIdleCallback(handler)
cancelIdleCallback(callbackId)

// 任务调度器
class TaskScheduler {
  constructor() { this.tasks = [] }

  addTask(task, priority = 0) {
    this.tasks.push({ task, priority })
    this.tasks.sort((a, b) => a.priority - b.priority)
    this.schedule()
  }

  schedule() {
    requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 0 && this.tasks.length > 0) {
        this.tasks.shift().task()
      }
      if (this.tasks.length > 0) this.schedule()
    })
  }
}
```

### 7.4 Promise 辅助函数

```javascript
// ===== 延迟 =====
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ===== 超时 =====
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ])

// ===== 重试 =====
async function retry(fn, times = 3, delayMs = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === times - 1) throw e
      await delay(delayMs)
    }
  }
}

// ===== 串行执行 =====
async function series(promises) {
  const results = []
  for (const fn of promises) {
    results.push(await fn())
  }
  return results
}

// ===== 并行执行 =====
async function parallel(promises) {
  return Promise.all(promises)
}

// ===== 限制并发 =====
async function limitedParallel(tasks, limit) {
  const results = []
  const executing = []

  for (const task of tasks) {
    const promise = Promise.resolve().then(() => task())
    results.push(promise)

    if (limit <= tasks.length) {
      const clean = promise.then(() => executing.splice(executing.indexOf(clean), 1))
      executing.push(clean)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(results)
}
```

### 7.5 常用工具函数

```javascript
// ===== 深拷贝 =====
const clone = structuredClone(obj)  // 原生支持循环引用

// 或手动实现
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (hash.has(obj)) return hash.get(obj)

  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)

  const cloned = Array.isArray(obj) ? [] : {}
  hash.set(obj, cloned)

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key], hash)
    }
  }
  return cloned
}

// ===== 类型判断 =====
function getType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

// ===== 格式化时间 =====
function formatDate(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const fmtMap = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0')
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, k => fmtMap[k])
}
```

---

## 8. 表单与剪贴板

### 8.1 FormData API

```javascript
// ===== 从表单创建 =====
const form = document.querySelector('form')
const formData = new FormData(form)

// ===== 空 FormData =====
const formData = new FormData()
formData.append('name', 'John')
formData.append('age', 30)
formData.append('tags', 'js')
formData.append('tags', 'css')  // 同名多值

// ===== 操作 =====
formData.get('name')        // 'John'
formData.getAll('tags')     // ['js', 'css']
formData.has('name')        // true
formData.set('name', 'Jane')  // 覆盖
formData.delete('age')

// ===== 遍历 =====
for (const [key, value] of formData) {
  console.log(`${key}: ${value}`)
}
[...formData.keys()]
[...formData.values()]
[...formData.entries()]

// ===== 文件 =====
formData.append('avatar', fileInput.files[0])
formData.append('files', fileInput.files[0])
formData.append('files', fileInput.files[1])

// ===== 提交表单 =====
fetch('/api/submit', {
  method: 'POST',
  body: formData  // 自动设置 Content-Type 为 multipart/form-data
})
```

### 8.2 剪贴板 API

```javascript
// ===== 复制文本 =====
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// ===== 读取文本 =====
async function readFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    console.log('剪贴板内容:', text)
  } catch (err) {
    console.error('读取失败:', err)
  }
}

// ===== 复制图片 =====
async function copyImage(imageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = imageElement.naturalWidth
  canvas.height = imageElement.naturalHeight
  canvas.getContext('2d').drawImage(imageElement, 0, 0)

  canvas.toBlob(async (blob) => {
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
  })
}

// ===== 兼容写法 =====
function copyToClipboardFallback(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;opacity:0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
```

### 8.3 文件选择

```html
<input type="file" id="fileInput">
<input type="file" multiple id="multiFile">
<input type="file" accept="image/*" id="imageInput">
<input type="file" accept="video/*" id="videoInput">
<input type="file" accept="audio/*" id="audioInput">
<input type="file" accept=".pdf,.doc,.docx" id="docInput">
```

```javascript
const fileInput = document.getElementById('fileInput')

fileInput.addEventListener('change', function() {
  const file = this.files[0]
  if (!file) return

  console.log('文件名:', file.name)
  console.log('文件大小:', file.size, 'bytes')
  console.log('文件类型:', file.type)
  console.log('最后修改:', new Date(file.lastModified))

  // ===== 读取文件内容 =====

  // 文本
  const reader1 = new FileReader()
  reader1.onload = (e) => console.log('文本:', e.target.result)
  reader1.readAsText(file)

  // DataURL（图片预览）
  const reader2 = new FileReader()
  reader2.onload = (e) => {
    const img = document.createElement('img')
    img.src = e.target.result
    document.body.appendChild(img)
  }
  reader2.readAsDataURL(file)

  // ArrayBuffer
  const reader3 = new FileReader()
  reader3.onload = (e) => console.log('二进制:', e.target.result)
  reader3.readAsArrayBuffer(file)
})
```

### 8.4 文件下载

```javascript
// 方式1：从 URL 下载
function downloadFromURL(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// 方式2：从 Blob 下载
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  downloadFromURL(url, filename)
  URL.revokeObjectURL(url)
}

// 方式3：下载文本
function downloadText(text, filename, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType })
  downloadBlob(blob, filename)
}

// 方式4：下载 JSON
function downloadJSON(obj, filename) {
  downloadText(JSON.stringify(obj, null, 2), filename, 'application/json')
}

// 方式5：下载 CSV
function downloadCSV(data, filename) {
  const csv = data.map(row => row.join(',')).join('\n')
  downloadText(csv, filename)
}
```

---

## 9. Canvas 绘图

### 9.1 基础用法

```javascript
const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')  // '2d' 或 'webgl'

canvas.width = 800
canvas.height = 600
```

### 9.2 绘制图形

```javascript
// 矩形
ctx.fillStyle = 'red'
ctx.fillRect(10, 10, 100, 100)       // 填充矩形

ctx.strokeStyle = 'blue'
ctx.strokeRect(120, 10, 100, 100)    // 描边矩形

ctx.clearRect(0, 0, canvas.width, canvas.height)  // 清除

// 圆形
ctx.beginPath()
ctx.arc(200, 200, 50, 0, Math.PI * 2)
ctx.fill()
ctx.stroke()

// 直线
ctx.beginPath()
ctx.moveTo(0, 0)
ctx.lineTo(100, 100)
ctx.lineTo(200, 50)
ctx.closePath()  // 闭合路径
ctx.stroke()

// 弧线
ctx.beginPath()
ctx.arc(100, 100, 50, 0, Math.PI)  // 半圆
ctx.stroke()

// 贝塞尔曲线
ctx.beginPath()
ctx.moveTo(0, 0)
ctx.quadraticCurveTo(100, 50, 200, 0)  // 二次
ctx.bezierCurveTo(100, 50, 150, 100, 200, 100)  // 三次
ctx.stroke()
```

### 9.3 样式设置

```javascript
// 颜色
ctx.fillStyle = '#ff0000'
ctx.fillStyle = 'rgb(255, 0, 0)'
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'

// 线宽
ctx.lineWidth = 2

// 线帽
ctx.lineCap = 'butt'   // 默认
ctx.lineCap = 'round'  // 圆角
ctx.lineCap = 'square'  // 方角

// 线段连接
ctx.lineJoin = 'miter'  // 尖角（默认）
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
const radial = ctx.createRadialGradient(100, 100, 0, 100, 100, 50)
radial.addColorStop(0, 'yellow')
radial.addColorStop(1, 'transparent')
ctx.fillStyle = radial
ctx.fillRect(0, 0, 200, 200)

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
ctx.shadowBlur = 10
ctx.shadowOffsetX = 5
ctx.shadowOffsetY = 5

// 裁剪
ctx.save()
ctx.clip(path)
ctx.fill()
ctx.restore()
```

### 9.4 文字绘制

```javascript
ctx.font = '24px Arial'
ctx.fillText('Hello', 50, 50)
ctx.strokeText('Hello', 50, 100)

// 对齐
ctx.textAlign = 'left'    // left, right, center, start, end
ctx.textBaseline = 'top'   // top, middle, bottom, alphabetic, hanging

// 测量
const metrics = ctx.measureText('Hello')
console.log(metrics.width)

// 文字换行
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
```

### 9.5 图片处理

```javascript
const img = new Image()
img.src = 'image.png'
img.onload = () => {
  // 原尺寸
  ctx.drawImage(img, 0, 0)

  // 指定尺寸
  ctx.drawImage(img, 0, 0, 200, 150)

  // 裁剪后绘制
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

// 获取图片数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

// 设置图片数据
ctx.putImageData(imageData, 0, 0)

// 像素操作
const data = imageData.data
for (let i = 0; i < data.length; i += 4) {
  data[i]     // Red
  data[i + 1] // Green
  data[i + 2] // Blue
  data[i + 3] // Alpha
}
```

### 9.6 图像变换

```javascript
ctx.save()  // 保存状态

ctx.translate(50, 50)   // 平移
ctx.rotate(Math.PI / 4) // 旋转（弧度）
ctx.scale(2, 2)         // 缩放

ctx.restore()  // 恢复状态

// 矩阵变换
ctx.transform(1, 0, 0, 1, 50, 50)  // 平移
ctx.setTransform(1, 0, 0, 1, 0, 0)  // 重置矩阵

// 全局合成
ctx.globalCompositeOperation = 'source-over'  // 默认
// 可选：'source-atop', 'source-in', 'source-out',
//       'destination-over', 'destination-atop', 等
```

### 9.7 动画基础

```javascript
let x = 0
let speed = 5

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 更新
  x += speed
  if (x > canvas.width) x = 0

  // 绘制
  ctx.beginPath()
  ctx.arc(x, 100, 20, 0, Math.PI * 2)
  ctx.fill()

  requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
```

---

## 10. IntersectionObserver

IntersectionObserver 用于检测元素进入/离开视口，是懒加载和无限滚动的基础。

### 10.1 基础用法

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('进入视口:', entry.target)
    } else {
      console.log('离开视口:', entry.target)
    }
  })
}, {
  root: null,             // 观察视口，null 为 viewport
  rootMargin: '0px',     // root 的外边距
  threshold: [0, 0.5, 1]  // 相交比例阈值
})

observer.observe(element)
observer.unobserve(element)
observer.disconnect()
```

### 10.2 Entry 对象

```javascript
entries.forEach(entry => {
  entry.target              // 目标元素
  entry.isIntersecting      // 是否在视口中
  entry.intersectionRatio   // 相交比例（0-1）
  entry.intersectionRect    // 相交区域
  entry.boundingClientRect  // 目标区域
  entry.rootBounds          // root 区域
  entry.time                // 时间戳
})
```

### 10.3 懒加载图片

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      img.removeAttribute('data-src')
      observer.unobserve(img)
    }
  })
}, { rootMargin: '50px' })

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img))
```

### 10.4 无限滚动

```javascript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreData().then(hasMore => {
      if (!hasMore) observer.disconnect()
    })
  }
}, { rootMargin: '100px' })

observer.observe(document.getElementById('sentinel'))
```

---

## 11. 地理位置与设备传感器

### 11.1 地理位置 API

```javascript
if ('geolocation' in navigator) {
  // 获取当前位置
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const accuracy = position.coords.accuracy
      const altitude = position.coords.altitude
      const speed = position.coords.speed
      const heading = position.coords.heading
      console.log(`纬度: ${latitude}, 经度: ${longitude}`)
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED: console.log('用户拒绝')
        case error.POSITION_UNAVAILABLE: console.log('位置不可用')
        case error.TIMEOUT: console.log('请求超时')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )

  // 持续监听位置
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log(position.coords.latitude, position.coords.longitude)
    }
  )

  // 停止监听
  navigator.geolocation.clearWatch(watchId)
}
```

### 11.2 摇一摇检测

```javascript
if ('DeviceMotionEvent' in window) {
  // iOS 13+ 需要请求权限
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    async function request() {
      const response = await DeviceMotionEvent.requestPermission()
      if (response === 'granted') {
        window.addEventListener('devicemotion', handleMotion)
      }
    }
  } else {
    window.addEventListener('devicemotion', handleMotion)
  }
}

let lastX, lastY, lastZ, lastTime = Date.now()

function handleMotion(event) {
  const { x, y, z } = event.accelerationIncludingGravity
  const now = Date.now()
  const diff = now - lastTime

  if (diff > 100) {
    const speed = Math.abs(x - lastX + y - lastY + z - lastZ) / diff * 10000
    if (speed > 25) console.log('摇一摇 detected!')
    lastX = x; lastY = y; lastZ = z; lastTime = now
  }
}
```

### 11.3 Vibration API

```javascript
if ('vibrate' in navigator) {
  navigator.vibrate(200)                    // 振动 200ms
  navigator.vibrate([100, 50, 200])        // 振动-暂停-振动
  navigator.vibrate(0)                     // 停止振动
}
```

### 11.4 电池状态

```javascript
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery()

  battery.level             // 电量（0-1）
  battery.charging          // 是否在充电
  battery.chargingTime      // 充满时间（秒）
  battery.dischargingTime   // 剩余时间（秒）

  battery.addEventListener('levelchange', () => {
    console.log(`电量: ${battery.level * 100}%`)
  })

  battery.addEventListener('chargingchange', () => {
    console.log(battery.charging ? '充电中' : '未充电')
  })
}
```

---

## 12. MutationObserver

MutationObserver 用于观测 DOM 变化，可替代废弃的 `DOMNodeInserted` 等事件。

### 12.1 创建观察者

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('类型:', mutation.type)
    console.log('元素:', mutation.target)
    if (mutation.type === 'attributes') {
      console.log('属性:', mutation.attributeName, mutation.oldValue)
    }
  })
})

const config = {
  childList: true,           // 观察子节点变化
  subtree: true,             // 观察所有后代
  attributes: true,          // 观察属性变化
  attributeOldValue: true,   // 记录属性旧值
  attributeFilter: ['class', 'data-*'],  // 只观察特定属性
  characterData: true,        // 观察文本变化
  characterDataOldValue: true // 记录旧文本
}

observer.observe(element, config)
observer.disconnect()
observer.takeRecords()  // 获取待处理的记录
```

### 12.2 常见使用场景

```javascript
// 检测元素是否被添加到 DOM
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.matches('.dynamic')) {
        console.log('动态元素已添加:', node)
      }
    })
  })
})

// 观察样式变化
const styleObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      const el = mutation.target
      if (el.classList.contains('active')) {
        console.log('元素被激活')
      }
    }
  })
})
styleObserver.observe(element, { attributes: true, attributeFilter: ['class'] })
```

---

## 13. IndexedDB 数据库

### 13.1 打开数据库

```javascript
const request = indexedDB.open('MyDatabase', 1)

request.onupgradeneeded = (e) => {
  const db = e.target.result
  if (!db.objectStoreNames.contains('users')) {
    const store = db.createObjectStore('users', { keyPath: 'id' })
    store.createIndex('name', 'name', { unique: false })
    store.createIndex('email', 'email', { unique: true })
  }
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' })
  }
}

request.onsuccess = (e) => {
  const db = e.target.result
  console.log('数据库就绪')
}
request.onerror = (e) => console.error('数据库错误')
```

### 13.2 事务操作

```javascript
// 增删改查统一封装
function operateDB(db, storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const request = operation(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 使用示例
async function demo(db) {
  // 添加
  await operateDB(db, 'users', 'readwrite', store =>
    store.add({ id: 1, name: 'John', email: 'john@example.com' })
  )

  // 查询
  const user = await operateDB(db, 'users', 'readonly', store =>
    store.get(1)
  )

  // 查询所有
  const all = await operateDB(db, 'users', 'readonly', store =>
    store.getAll()
  )

  // 索引查询
  const byName = await operateDB(db, 'users', 'readonly', store =>
    store.index('name').get('John')
  )

  // 更新
  await operateDB(db, 'users', 'readwrite', store =>
    store.put({ id: 1, name: 'John', email: 'john@new.com' })
  )

  // 删除
  await operateDB(db, 'users', 'readwrite', store =>
    store.delete(1)
  )

  // 清空
  await operateDB(db, 'users', 'readwrite', store =>
    store.clear()
  )
}
```

---

## 14. 音视频 API

### 14.1 基础播放控制

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
audio.currentTime = 30    // 跳到30秒
audio.duration            // 总时长
audio.currentTime         // 当前播放位置

// 状态
audio.paused
audio.ended
audio.loop = true
```

### 14.2 视频属性与方法

```javascript
video.width = 800
video.height = 600
video.poster = 'thumbnail.jpg'  // 封面图
video.controls = true
video.autoplay = true
video.muted = true

// 全屏
video.requestFullscreen()

// 截图
const canvas = document.createElement('canvas')
canvas.width = video.videoWidth
canvas.height = video.videoHeight
canvas.getContext('2d').drawImage(video, 0, 0)
const image = canvas.toDataURL('image/png')
```

### 14.3 事件监听

```javascript
audio.addEventListener('loadedmetadata', () => {
  console.log('总时长:', audio.duration)
})
audio.addEventListener('canplay', () => console.log('可以播放'))
audio.addEventListener('timeupdate', () => {
  console.log('当前时间:', audio.currentTime)
})
audio.addEventListener('ended', () => console.log('播放结束'))
audio.addEventListener('progress', () => {
  console.log('缓冲:', audio.buffered)
})
audio.addEventListener('error', () => {
  console.error('播放错误')
})
```

### 14.4 MediaDevices API

```javascript
// 获取媒体流
async function getMedia() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })
  video.srcObject = stream
  await video.play()
  return stream
}

// 约束条件
async function advancedMedia() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'  // 'environment' 为后置
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true
    }
  })
}

// 获取设备列表
async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const cameras = devices.filter(d => d.kind === 'videoinput')
  const mics = devices.filter(d => d.kind === 'audioinput')
  const speakers = devices.filter(d => d.kind === 'audiooutput')
}

// 屏幕录制
async function recordScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
  const chunks = []

  recorder.ondataavailable = e => chunks.push(e.data)
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    // 下载或播放
  }

  recorder.start()
  setTimeout(() => recorder.stop(), 10000)
}

// 停止流
function stopStream(stream) {
  stream.getTracks().forEach(track => track.stop())
}
```

---

## 15. 拖拽 API

### 15.1 原生拖拽

```html
<div id="draggable" draggable="true">可拖拽元素</div>
<div id="dropzone">放置区域</div>
```

```javascript
const draggable = document.getElementById('draggable')
const dropzone = document.getElementById('dropzone')

// 拖拽开始
draggable.addEventListener('dragstart', e => {
  e.dataTransfer.setData('text/plain', '数据')
  e.dataTransfer.effectAllowed = 'move'
})

// 拖拽中（源元素）
draggable.addEventListener('drag', () => {})

// 拖拽结束（源元素）
draggable.addEventListener('dragend', () => {})

// 进入放置区
dropzone.addEventListener('dragenter', e => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
})

// 在放置区上方
dropzone.addEventListener('dragover', e => {
  e.preventDefault()
})

// 离开放置区
dropzone.addEventListener('dragleave', () => {})

// 放置
dropzone.addEventListener('drop', e => {
  e.preventDefault()
  const data = e.dataTransfer.getData('text/plain')
  console.log('数据:', data)
})
```

### 15.2 dataTransfer 对象

```javascript
e.dataTransfer.setData('text/plain', '文本')
e.dataTransfer.setData('text/html', '<strong>HTML</strong>')
e.dataTransfer.setData('application/json', JSON.stringify({ a: 1 }))

e.dataTransfer.getData('text/plain')

e.dataTransfer.effectAllowed = 'copy'     // 仅复制
e.dataTransfer.effectAllowed = 'move'     // 仅移动
e.dataTransfer.effectAllowed = 'copyMove' // 复制或移动

// 自定义拖拽图片
const img = new Image()
img.src = 'drag-image.png'
e.dataTransfer.setDragImage(img, 10, 10)

// 文件拖拽
dropzone.addEventListener('drop', e => {
  const files = e.dataTransfer.files
  files.forEach(f => console.log(f.name, f.size, f.type))
})
```

---

## 16. WebSocket 实时通信

### 16.1 建立连接

```javascript
const ws = new WebSocket('wss://example.com/ws')

ws.readyState  // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED

ws.onopen = () => {
  console.log('连接已建立')
  ws.send('Hello Server')
}

ws.onmessage = (event) => {
  const data = event.data
  console.log('收到:', data)
}

ws.onerror = (error) => console.error('错误:', error)

ws.onclose = (event) => {
  console.log('关闭:', event.code, event.reason)
}
```

### 16.2 发送与接收

```javascript
// 发送文本
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }))

// 发送二进制
const buffer = new ArrayBuffer(8)
ws.send(buffer)

// 接收不同类型
ws.onmessage = (event) => {
  if (event.data instanceof Blob) {
    console.log('Blob:', event.data.size)
  } else if (event.data instanceof ArrayBuffer) {
    console.log('ArrayBuffer')
  } else {
    console.log('Text:', event.data)
  }
}
```

### 16.3 断线重连

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.reconnectDelay = options.reconnectDelay || 1000
    this.maxReconnectDelay = options.maxReconnectDelay || 30000
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('已连接')
      this.reconnectDelay = 1000
    }

    this.ws.onclose = () => {
      console.log('断开，准备重连...')
      setTimeout(() => {
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.maxReconnectDelay
        )
        this.connect()
      }, this.reconnectDelay)
    }

    this.ws.onmessage = (e) => this.onmessage?.(e)
    this.ws.onerror = (e) => this.onerror?.(e)
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  close() {
    this.ws.close()
  }
}
```

---

## 17. Server-Sent Events

SSE 允许服务器向浏览器推送数据，是单向实时通信的轻量方案。

### 17.1 基础用法

```javascript
const eventSource = new EventSource('/api/stream')

eventSource.onmessage = (event) => {
  console.log('消息:', event.data)
}

eventSource.addEventListener('update', (event) => {
  console.log('更新:', JSON.parse(event.data))
})

eventSource.onerror = () => {
  console.error('SSE 错误')
  eventSource.close()
}
```

### 17.2 后端格式

```javascript
// text/event-stream 格式

// 简单消息
// data: Hello

// 多行数据
// data: Line 1
// data: Line 2

// JSON
// data: {"message": "Hello"}

// 命名事件
// event: update
// data: {"count": 1}

// ID 和重连
// id: 1
// data: Message 1
```

---

## 18. BroadcastChannel

BroadcastChannel 用于同源下不同标签页、窗口、iframe 之间的通信。

### 18.1 基本用法

```javascript
const channel = new BroadcastChannel('my-channel')

channel.postMessage({ type: 'update', data: 'Hello' })

channel.onmessage = (event) => {
  console.log('收到:', event.data)
}

channel.close()
```

### 18.2 跨标签页同步

```javascript
// tab1.js - 用户登录
const channel = new BroadcastChannel('user-sync')
function login(user) {
  localStorage.setItem('user', JSON.stringify(user))
  channel.postMessage({ type: 'login', user })
}

// tab2.js - 监听登录
const channel = new BroadcastChannel('user-sync')
channel.onmessage = (event) => {
  if (event.data.type === 'login') {
    location.reload()
  }
}
```

---

## 19. Web Worker

Web Worker 允许在后台线程运行脚本，不阻塞 UI。

### 19.1 创建 Worker

```javascript
// main.js
const worker = new Worker('worker.js')

worker.postMessage({ type: 'calc', data: 100 })

worker.onmessage = (e) => console.log('结果:', e.data)

worker.onerror = (e) => console.error('错误:', e.message)

worker.terminate()
```

### 19.2 Worker 脚本

```javascript
// worker.js
self.onmessage = (e) => {
  const { type, data } = e.data

  if (type === 'calc') {
    let result = 0
    for (let i = 0; i < data * 1000000; i++) {
      result += i
    }
    self.postMessage({ result })
  }
}

// importScripts('helper.js')
```

### 19.3 共享 Worker

```javascript
const sharedWorker = new SharedWorker('shared-worker.js')

sharedWorker.port.onmessage = (e) => {
  console.log('共享 Worker:', e.data)
}

sharedWorker.port.postMessage('Hello')
```

---

## 20. Performance 性能监控

### 20.1 基础用法

```javascript
const perf = window.performance

console.log('页面加载时间:', perf.timing.loadEventEnd - perf.timing.navigationStart)
console.log('DNS 解析:', perf.timing.domainLookupEnd - perf.timing.domainLookupStart)
console.log('TCP 连接:', perf.timing.connectEnd - perf.timing.connectStart)
console.log('DOM 解析:', perf.timing.domContentLoadedEventEnd - perf.timing.domLoading)
```

### 20.2 PerformanceObserver

```javascript
// 观察性能条目
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.name, entry.duration)
  })
})

observer.observe({ entryTypes: ['paint', 'resource', 'navigation'] })

// 首次内容绘制
const paintObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime, 'ms')
    }
  })
})
paintObserver.observe({ type: 'paint', buffered: true })

// 长任务
const longTaskObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(task => {
    console.warn('长任务:', task.duration, 'ms')
  })
})
longTaskObserver.observe({ type: 'longtask', buffered: true })

// 资源加载
const resourceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('资源:', entry.name)
    console.log('  请求耗时:', entry.duration, 'ms')
    console.log('  DNS:', entry.domainLookupEnd - entry.domainLookupStart, 'ms')
    console.log('  TTFB:', entry.responseStart - entry.requestStart, 'ms')
  })
})
resourceObserver.observe({ type: 'resource', buffered: true })
```

---

## 21. requestIdleCallback

```javascript
// 基础用法
requestIdleCallback((deadline) => {
  console.log('剩余时间:', deadline.timeRemaining())
  console.log('是否超时:', deadline.didTimeout)

  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift())
  }
}, { timeout: 2000 })

// 取消
const id = requestIdleCallback(handler)
cancelIdleCallback(id)
```

---

## 22. Visual Viewport

Visual Viewport API 用于处理移动端缩放场景。

### 22.1 基础属性

```javascript
const vp = window.visualViewport

vp.offsetLeft      // 左侧偏移
vp.offsetTop       // 顶部偏移
vp.width           // 视口宽度
vp.height          // 视口高度
vp.scale           // 缩放比例
```

### 22.2 事件监听

```javascript
vp.addEventListener('resize', () => {
  console.log('视口:', vp.width, 'x', vp.height)
})

vp.addEventListener('scroll', () => {
  console.log('位置:', vp.offsetLeft, vp.offsetTop)
})
```

### 22.3 固定定位与键盘

```javascript
const fixedEl = document.querySelector('.fixed-footer')

function updatePosition() {
  const vp = window.visualViewport
  fixedEl.style.bottom = `${vp.height - vp.offsetTop - vp.offsetTop}px`
}

vp.addEventListener('resize', updatePosition)
vp.addEventListener('scroll', updatePosition)
```

---

## 23. Pointer Lock

Pointer Lock API 用于锁定鼠标光标，适用于 3D 游戏等需要无限鼠标移动的场景。

### 23.1 基础用法

```javascript
const canvas = document.querySelector('canvas')

canvas.addEventListener('click', () => {
  canvas.requestPointerLock()
})

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    console.log('已锁定')
  } else {
    console.log('已解锁')
  }
})

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas) {
    console.log('移动:', e.movementX, e.movementY)
  }
})

document.exitPointerLock()
```

---

## 附录：浏览器兼容性

### 常用 API 兼容性

| API | 兼容性 | 备注 |
|-----|--------|------|
| querySelector/querySelectorAll | IE9+ | |
| classList | IE10+ | |
| localStorage/sessionStorage | IE9+ | 需 try-catch |
| IndexedDB | IE11+ | |
| Canvas | IE9+ | |
| Fetch | IE11+ | 需 polyfill |
| Promise | IE11+ | 需 polyfill |
| IntersectionObserver | IE11+ | 需 polyfill |
| Clipboard API | IE11+ | 需 HTTPS |
| BroadcastChannel | Chrome56+ | 不支持 IE |
| WebSocket | IE10+ | |
| SSE | IE11+ | 需 polyfill |
| Performance API | IE11+ | timing 部分 |
| requestIdleCallback | Chrome47+ | 需 polyfill |
| Visual Viewport | Chrome61+ | 不支持 Firefox |
| Pointer Lock | Chrome37+ | |
| MutationObserver | IE11+ | |
| FormData | IE10+ | |
| URL/URLSearchParams | IE12+ | 需 polyfill |

### 安全注意事项

1. **XSS 防护**：使用 `textContent` 而非 `innerHTML` 处理用户输入
2. **CSRF 防护**：请求时携带 Token 或使用 SameSite Cookie
3. **安全上下文**：部分 API（摄像头、麦克风、剪贴板）需要 HTTPS
4. **敏感操作**：Clipboard、Location 等 API 会触发用户提示

### 性能优化建议

1. 使用 `requestAnimationFrame` 而非 `setInterval` 做动画
2. 使用 `DocumentFragment` 批量插入 DOM
3. 使用 `IntersectionObserver` 而非 scroll 事件做懒加载
4. 合理使用 `节流` 和 `防抖`
5. 大数据处理考虑使用 Web Worker
6. 使用 `requestIdleCallback` 处理非关键任务
7. 使用 `PerformanceObserver` 监控性能指标
8. 使用 `will-change` 提示浏览器优化

### 2026 年现代 Web API

```javascript
// structuredClone - 原生深拷贝
const clone = structuredClone(original)

// ResizeObserver - 观测元素尺寸
new ResizeObserver(callback).observe(element)

// Navigation API - 替代 history（Chrome 102+）
navigation.currentEntry.url
navigation.navigate('/new-url')

// View Transitions API - 页面过渡（Chrome 111+）
document.startViewTransition(() => updateDOM())

// Popover API - 原生弹出框（Chrome 114+）
element.showPopover()
element.hidePopover()

// scroll-driven animations - 滚动驱动动画（Chrome 115+）
// CSS: animation-timeline: scroll()
```

---

