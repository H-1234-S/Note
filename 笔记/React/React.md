# React

* **React 组件的核心特性**：**每个组件实例都有自己的独立状态**。

## React渲染条件

* props发生变化
* state发生变化
* context对象的provide的value引用发生变化
****
## React基础

### jsx语法

* JSX 必须返回单个父元素
  * 或者用` <> </>`包着
* JSX元素必须正确闭合
* JSX 属性使用 camelCase 编写（例如 className 代替 class）。

### 样式

#### 内联样式

~~~jsx
// 写法一
import React from 'react'

const StyledCard = () => {
  const titleStyle = {
    backgroundColor: 'lightblue',
    color: 'darkblue',
    padding: '20px',
    border: '10px solid #ccc'
  }
  
  return (
    <div>
      {/*注意一个大括号*/}
      <h1 style={titleStyle}>Hello Worled!</h1>
    </div>
  )
}

export default StyledCard

// 写法二
import React from 'react'

const StyledCard = () => {
  const titleStyle = {
    backgroundColor: 'lightblue',
    color: 'darkblue',
    padding: '20px',
    border: '10px solid #ccc'
  }
  
  return (
    <div>
      {/*注意两个大括号*/}
      <h1 style={{backgroundColor: 'lightblue',color: 'darkblue',padding: '20px',border: '10px solid #ccc'}}>Hello Worled!</h1>
    </div>
  )
}

export default StyledCard

~~~

#### 引用外部css文件

* 全局引用时注意类名
  * 不要用标签，因为会默认修改所有标签样式，用className= '类名'

### 表单

* value={name} 是 React 中的"受控组件"语法

~~~javascript
<input type="text" value={name} onChange={e => setName(e.target.value)} />
// 用户输入 → 触发 onChange → 更新 name 状态 → 重新渲染 → 显示新值
// 用户输入 "苹果"：
1. 输入 "苹" → onChange 触发 → setName('苹') → name = '苹'
2. 组件重新渲染 → value={name} → value="苹"
3. 输入框显示 "苹"
~~~

- `value={name}` 让输入框显示 `name` 状态
- `onChange` 更新 `name` 状态
- 提交表单时，`name` 状态的值就是用户输入的内容
- 清空表单时，只需 `setName('')`，输入框会自动清空

~~~javascript
import React, { useState } from 'react'

const ShoppingList = () => {
  // 名称hook
  const [name, setName] = useState('')
  // 数量hook
  const [count, setCount] = useState('')
  // 展示hook
  const [items, setItems] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !count) return;

    // 存储发生改变后的数据
    const newItem = {
      name,
      count: parseInt(count)
    }


    setItems(prev => [...prev, newItem])
    // 清空表单
    setName('')
    setCount('')
  }

  return (
    <div>
      <h1>购物清单</h1>
      <form onSubmit={handleSubmit}>
        {/**value={name} 是 React 中的"受控组件"（Controlled Component）语法 */}
        <input type="text"
          value={name}
          placeholder='商品名称'
          onChange={e => setName(e.target.value)}
        />
        <input type="number"
          value={count}
          placeholder='商品数量'
          onChange={e => setCount(e.target.value)}
        />
        <button type='submit'>提交</button>
      </form>
      <ul>
        {
          items.map((item, index) => (
            <li key={index}>商品名称：{item.name} - 数量: {item.count}</li>
          ))
        }
      </ul>
    </div>
  )
}

export default ShoppingList
~~~



### 事件

* 在父组件定义状态，子组件可以同步更新状态

~~~javascript
import React, { useState } from 'react'
import ExampleOne from '../components/ExampleOne'
import ExampleTwo from '../components/ExampleTwo'

const App = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ExampleOne count={count} setCount={setCount} />
      <ExampleTwo count={count} setCount={setCount} />
    </div>
  )
}

export default App
// 子组件
import React from 'react'

const ExampleOne = ({ count, setCount }) => {
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}

export default ExampleOne
// 子组件
import React from 'react'

const ExampleTwo = ({ count, setCount }) => {
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  )
}

export default ExampleTwo
~~~

# 组件

## 认识组件

### 全局组件

* 无需引入组件，可以在整个应用任意位置直接使用

#### 案例

* 手动挂载 React 消息提示组件系统

main.tsx引入

~~~ typescript
import '../components/Message/index.tsx'
~~~

App.tsx引入

~~~typescript
<button onClick={() => window.onShow()}>确认</button>
~~~

Message/index.tsx引入

~~~ typescript
import ReactDom from 'react-dom/client'
import './index.css'

const Message = () => {
    return (
        <div>
            提示组件
        </div>
    )
}

interface Itesm {
    messageContainer: HTMLDivElement
    root: ReactDom.Root
}
const queue: Itesm[] = []
window.onShow = () => {
    // document.createElement 创建一个DOM元素
    // console.log(messageContainer) 输出：<div></div>
    const messageContainer = document.createElement('div')
    // 添加类
    messageContainer.className = 'message'
    messageContainer.style.top = `${queue.length * 50}px`
    // 将messageContainer插入到body节点中
    document.body.appendChild(messageContainer)
    // 将DOM元素关联message组件
    // ReactDom.createRoot将messageContainer注册成React根组件
    const root = ReactDom.createRoot(messageContainer)
    // 将react组件渲染到指定的DOM容器中
    root.render(<Message />) //渲染组件

    queue.push({
        messageContainer,
        root
    })

    //2秒后移除
    setTimeout(() => {
        const item = queue.find(item => item.messageContainer === messageContainer)!
        item.root.unmount() //卸载组件
        document.body.removeChild(item.messageContainer) // 删除指定的DOM容器
        // queue.indexOf(item) 在数组中查找指定元素的索引
        queue.splice(queue.indexOf(item), 1)
    }, 2000)
}

// 声明扩充
// window 上没有这个方法 要进行声明扩充
declare global {
    interface Window {
        onShow: () => void
    }
}


export default Message
~~~

Message/index.css引入

~~~css
.message {
    width: 160px;
    height: 30px;
    position: fixed;
    top: 10px;
    left:50%;
    margin-left: -80px;
    background: #fff;
    border: 1px solid #ccc;
    text-align: center;
    line-height: 30px;
    border-radius: 5px;
}
~~~

## 组件通信

### 父子组件通信

#### 传递Props

* Props是一个对象，子组件函数第一个参数

#### 定义默认值

* 将属性变为可选的这儿使用`title`举例 `title?: string`

* 然后将props进行解构，定义默认值 `{title = '默认标题'}`

  ```typescript
  import React from "react"
  interface Props {
      title?: string
      id: number
      obj: {
          a: number
          b: number
      }
      arr: number[]
      cb: (a: number, b: number) => number
      empty: null
      element: JSX.Element
  }

  const Test:React.FC<Props> = ({title = '默认标题'}) => {
      return <div>Test</div>
  }

  export default Test
  ```

#### Props.children

* 表示组件开始和结束标签之间的内容

~~~typescript
import React from "react"
interface Props {
    children: React.ReactNode //手动声明children
}
/*
* React.ReactNode
* 是 React 中用于表示 可以渲染的任何内容 的 TypeScript 类型。
*/
const Test: React.FC<Props> = (props) => {
    return <div>{props.children}</div>
}

export default Test
~~~

#### 子组件向父组件传值

* 父组件传递`函数`过去,其本质就是调用函数的回调

~~~typescript
import Test from "./components/Test"
function App() {
  const fn = (params:string) => {
    console.log('子组件触发了 父组件的事件',params)
  }
  return (
    <>
      <Test callback={fn}></Test>
    </>
  )
}
~~~

* 子组件接受函数，并且在对应的事件调用函数，回调参数回去

~~~ typescript
import React from "react"
interface Props {
    callback: (params: string) => void
    children?: React.ReactNode
}

const Test: React.FC<Props> = (props) => {
    return <div>
        <button onClick={() => props.callback('我见过龙')}>派发事件</button>
    </div>
}

export default Test
~~~

### 兄弟组件通信

* 定义两个组件放到一起作为兄弟组件，其原理就是`发布订阅`设计模式
  * 一种消息传递模式，**发送者（发布者）** 和 **接收者（订阅者）** 不直接通信，而是通过 **消息中心（事件总线）** 来中介。

#### 发布订阅设计模式实现

* 四种方法 once、on、emit、off
* 订阅中心，利用map结构保存创建的订阅

~~~typescript
interface I {
    events:Map<String,Function[]>
    once:(event:String,callback:Function) => void
    on:(event:String,Callback:Function) => void
    emit:(event:string,...args:any[]) => void
    off:(event:String,callback:Function) => void
}

class Emitter implements I {
    events:Map<String,Function[]>
    constructor () {
        this.events = new Map()
    }
    once (event:String,callback:Function) {
        // 只能触发一次的逻辑
        // 定义一个函数
        // 通过on先订阅，触发后立马回收
        const callbackfn = (...args:any[]) => {
            callback(...args)
            // 执行完后回收
            this.off(event,callbackfn)
        }
        this.on(event,callbackfn)
    }
    // 订阅事件
    // 只是将所有订阅事件存到events中
    on (event:String,callback:Function) {
        // 进行判断有无event事件
        // 如果有，将函数存到event事件数组中
        if(this.events.has(event)){
            const callbacklist = this.events.get(event)
            callbacklist && callbacklist.push(callback)	// 多次订阅
        }else {
            // 将事件添加到订阅中心
            // 函数放在数组里，确保一个事件可以多次订阅
            this.events.set(event,[callback])
        }
    }
    // 派发事件
    // ...args:any[] 剩余参数
    emit (event:string,...args:any[]) {
        const callbacklist = this.events.get(event)
        // 触发事件
        callbacklist!.forEach(callback => callback(...args))
    }
    // 删除事件
    off (event:String,callback:Function) {
        // 根据event找到对应的callback
        const callbacklist = this.events.get(event)
        // 过滤
        if(callbacklist) {
            callbacklist.splice(callbacklist.indexOf(callback),1)
        }
        /**
         * const callbacklist = this.events.get(event)
         * const newlist = callbacklist.filter(fn => fn !== callback)
         * this.events.set(event,newlist)
         */
    }
}

const bus = new Emitter()
const fn = (b:boolean,n:number) => {
    console.log('触发事件A',b,n)
}
// 订阅
bus.on('abs',fn)

// 删除
bus.off('abs',fn)

bus.once('abs',fn)

// 发布/触发
bus.emit('abs',false,1)
~~~

##### 发布订阅模式的三大核心组件：

| 组件                     | 你的实现               | 说明         |
| ------------------------ | ---------------------- | ------------ |
| **发布者（Publisher）**  | `bus.emit()` 的调用者  | 触发事件     |
| **订阅者（Subscriber）** | `bus.on()` 的调用者    | 注册回调     |
| **事件通道（Channel）**  | `this.events` Map 结构 | 管理订阅关系 |

##### 核心流程

```typescript
// 1. 创建事件总线（中介）
const bus = new Emitter()  // 事件总线实例

// 2. 订阅者注册（不知道谁会发布）
bus.on('abs', fn)  // "当abs事件发生时，请调用fn"

// 3. 发布者发布（不知道谁会接收）  
bus.emit('abs', false, 1)  // "abs事件发生了，传递参数false和1"

// 4. 事件总线协调（中介工作）
// - 查找 'abs' 的所有订阅者
// - 依次调用他们的回调函数
```

#### 发布订阅设计模式思想

* 事件总线
* 发布者
* 订阅者

#### 发布订阅设计模式特征

* 解耦合​

#### 案例

Card/index.tsx

~~~ typescript
const App = () => {
    // 利用发布订阅模式进行兄弟组件通信

    const event = new Event('on-card') // 创建事件
    const clickCard = () => {
        event.params = { name: '我见过龙' } // 向事件对象添加自定义数据
        window.dispatchEvent(event) //派发事件
    }
    return (
        <div>
            <button onClick={clickCard}>Card</button>
        </div>
    )
}

declare global {
    interface Event {
        params: any
    }
}

export default App
~~~

CardCopy/index.tsx

~~~typescript
const App = () => {
  //接受参数
  window.addEventListener('on-card', (e) => { //订阅事件
    console.log(e.params, '触发了')
  })
  return (
    <div>
      CardCopy
    </div>
  )
}

export default App
~~~

## 受控组件

* 受控组件一般是指表单元素，表单的数据由React的 State 管理，更新数据时，需要手动调用setState()方法，更新数据。
* 使用受控组件可以使表单数据和组件状态同步

~~~typescript
import React, { useState } from 'react';

const App: React.FC = () => {
  const [value, setValue] = useState('')
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  return (
    <>
      <input type="text" value={value} onChange={handleChange} />
      <div>{value}</div>
    </>
  );
}

export default App;
~~~

### 非受控组件

* 非受控组件指的是该表单元素不受React的State管理，表单的数据由DOM管理。通过useRef()来获取表单元素的值。
* 但是组件不会重新渲染

~~~typescript
import React, { useRef } from 'react';
const App: React.FC = () => {
    // const value = '小满'
    let value 
    const inputRef = useRef<HTMLInputElement>(null)
    const handleChange = () => {
        console.log(inputRef.current?.value)
        value = inputRef.current?.value
    }
    return (
        <>
            <input type="text" onChange={handleChange} defaultValue={value} ref={inputRef} />
            <div>{value}</div>
        </>
    );
}

export default App;
~~~

## 异步组件

* `Suspense` 是一种异步渲染机制，其核心理念是在组件加载或数据获取过程中，先展示一个占位符（loading state），从而实现更自然流畅的用户界面更新体验。

### 语法

~~~ react
import React, { Suspense } from 'react'

<Suspense fallback={<加载提示组件 />}>
  {/* 懒加载的组件 */}
  <LazyComponent />
</Suspense>
~~~

* `children`：真正的 UI 渲染内容。如果 `children` 在渲染中被挂起，Suspense 边界将会渲染 `fallback`。
* `fallback`：真正的 UI 未渲染完成时代替其渲染的备用 UI，它可以是任何有效的 React 节点。后备方案通常是一个轻量的占位符，例如表示加载中的图标或者骨架屏。当 `children` 被挂起时，Suspense 将自动切换至渲染 `fallback`；当数据准备好时，又会自动切换至渲染 `children`。如果 `fallback` 在渲染中被挂起，那么将自动激活最近的 Suspense 边界。

## 高阶组件

* 高阶组件是一个**函数**，它接收一个组件作为参数，返回一个**新的包装组件**。

### 语法

~~~typescript
// 高阶组件的基本模式
const withEnhancement = (WrappedComponent: React.ComponentType) => {
  // 返回一个新组件
  return (props: any) => {
    // 可以在这里添加逻辑
    return <WrappedComponent {...props} />
  }
}

// 使用
const EnhancedComponent = withEnhancement(OriginalComponent)
~~~
















# Hook


## useState

* **调用set函数时，组件会被重新渲染**
  * 利用useRef
  * 将变量定义放在组件外


* 给组件添加**状态。**

  * 如果不添加状态，组件的值不会重新渲染的
  * 这时候需要用到更新状态的hook

 ~~~typescript
    function MyButton() {
      let count: number = 0
      function handleClick() {
        console.log(count)
        return count++
      }

      return (
        <button onClick={handleClick}>
          Clicked {count} times
        </button>
      )
    }

    export default function App() {
      return (
        <>
          <MyButton />
        </>
      )
    }
 ~~~


* 首先，[`useState`](https://react.dev/reference/react/useState)从 React 导入：

 ~~~typescript
  import { useState } from 'react';
 ~~~

### 语法

~~~javascript
const [count, setCount] = useState(0)
~~~

* count更新后的数据，count初始化是useState里的参数
* setCount更新函数，函数没有返回值

### 注意

当调用 `setTheme('dark')` 时：

1. **不立即更新**：`setTheme` 不返回新值，它只是**告诉 React**："下次渲染时，请把 theme 更新为 'dark'"
2. **异步处理**：React 将更新请求加入队列
3. **重新渲染**：React 安排一次新的渲染
4. **新值诞生**：在重新渲染时，`useState` **返回**新的值

### 传递基本数据类型

~~~typescript
import { useState } from 'react'
function MyButton() {
  //count当前状态值
  //setCount更新函数
  // count = 0
  const [count, setCount] = useState(0);
  //点击事件函数
  function handleClick() {
    // 更改状态时，调用该函数setCount()并将新值传递给它
    setCount(count + 1);
    // 相当于黑盒
    // react里封装好的
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  )
}

export default function App() {
  return (
    <>
      <h1>Counters that update separately</h1>
      {/*如果多次渲染同一个组件，每次渲染都会获得各自的状态。 */}
      <MyButton />
      <MyButton />
    </>
  )
}
~~~

### 传递数组

* 在React中你需要将数组视为**只读**的，**不可以直接修改原数组**
* 因为页面不会重新渲染原数组，只会渲染新数组

~~~typescript
function MyButton() {
  const [arr, setArr] = useState([1, 2, 3, 4, 5])
  //点击事件函数
  function handleClick() {
    //注意：不可以修改原数组
    //需求：点击后在2与3之间添加2.5
    setArr([
      ...arr.slice(0, 2),	//返回 1，2	执行逻辑：先运行arr.slice(0,3)再展开
      2.5,
      ...arr.slice(2)
    ])
  }

  return (
    <button onClick={handleClick}>
      Clicked {arr} times
    </button>
  )
}
~~~

### 对象

* useState可以接受一个函数，可以在函数里面编写逻辑，初始化值
* **注意：这个函数只会执行一次**
* 函数必须要**返回值**

~~~typescript
function MyButton() {
  const [obj, setobj] = useState(() => {
    // 可以在函数内执行一些逻辑
    const date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    return {
      date,
      name: 'HU',
      age: 18
    }
  })
  // 点击事件函数
  function handleClick() {
    // setobj要传递新对象
    // 若要修改某一个属性值，可展开对象，后跟需要修改的内容覆盖
    setobj({
      ...obj,
      name: 'hu'
    })
    //setObject(Object.assign({}, obj, { age: 26 })) 第二种写法
  }

  return (
    <>
      <div>日期：{obj.date}</div>
      <div>姓名：{obj.name}</div>
      <div>年龄：{obj.age}</div>
      <button onClick={handleClick}>
        更改
      </button>
    </>
  )
}
~~~

### useState更新机制

* useState **set函数是异步更新**的

* 当调用 `set函数` 时，React 不会立即更新 `index`，而是：
  * 将更新加入一个**队列**
  * 在下一次渲染时**批量处理所有更新**

* 当我们多次以相同的操作更新状态时，React 会进行比较，如果值相同，则会屏蔽后续的更新行为。自带`防抖`的功能，防止频繁的更新。

  * 函数式更新

    * **基于前一个状态计算新状态时**

    * **在闭包中使用状态时**

    * **多次连续更新同一状态时**

~~~typescript
function App() {
    console.log('组件渲染');
    let [index, setIndex] = useState(0);  // index = 0
    
    const handlerClick = () => {
        // 三个更新被加入队列
        setIndex((index) => index + 1);  // index = 0 → 返回 1
        setIndex((index) => index + 1);  // index = 1 → 返回 2  
        setIndex((index) => index + 1);  // index = 2 → 返回 3
        
        
        // ❌ 错误写法：三次都基于当前的 index（0）
         setIndex(index + 1);  // 0 + 1 = 1
         setIndex(index + 1);  // 0 + 1 = 1
         setIndex(index + 1);  // 0 + 1 = 1
         // 最终结果：index = 1
        
        // 此时 index 还是 0（还未重新渲染）
        console.log(index);  // 输出: 0
    };
    return (...);
}
            
// index => index + 1 将接收 0 作为待定状态，并返回 1 作为下一个状态。
// index => index + 1 将接收 1 作为待定状态，并返回 2 作为下一个状态。
// index => index + 1 将接收 2 作为待定状态，并返回 3 作为下一个状态。

~~~

## useReducer

* ​`useReducer` 是 React 提供的 **状态管理 Hook**，尤其适合 **状态逻辑复杂或者多个状态值相互依赖** 的场景。

### 语法

~~~typescript
const [state, dispatch] = useReducer(reducer, initialArg, init?)
~~~

### 参数

* `reducer` 是一个处理函数，用于更新状态。 reducer 里面包含了两个参数，第一个参数是 `state`，第二个参数是 `action`。`reducer` 会返回一个新的 `state`(新对象)。

~~~typescript
Function Reducer (oldState,action) { 
return newState
}
~~~

* `initialArg` 是 `state` 的初始值。可以是任意类型（对象、数组、原始值等）
* `init` 是一个可选的函数，用于初始化 `state`，**只执行一次**，如果编写了init函数，则默认值使用init函数的返回值，否则使用`initialArg`。

~~~ typescript
//函数内可以对初始值处理一些逻辑
Const initFn = () => {
return {count:2}
}
~~~

### 返回值

* 当前的 state。初次渲染时，它是 init(initialArg) 或 initialArg （如果没有 init 函数）
* dispatch 函数。用于更新 state 并触发组件的重新渲染。
  * dispatch 函数里可以传递参数，参数传递给reducer函数里的action


### 案例

~~~typescript
import { useReducer } from "react";

export default function App() {
  const initData = [
    { name: '小满(只)', price: 100, count: 1, id: 1, isEdit: false },
    { name: '中满(只)', price: 200, count: 1, id: 2, isEdit: false },
    { name: '大满(只)', price: 300, count: 1, id: 3, isEdit: false }
  ]
  type State = typeof initData
  // interface
   // initialArg 是 state 的初始值
  const reducer = (state: State, action: { type: 'add' | 'sub', id: number }) => {
    const item = state.find(item => item.id === action.id)!
    // 处理逻辑
    switch (action.type) {
      case 'add':
        item.count++
        return [...state]
      case 'sub':
        item.count--
        return [...state]
      default:
        return state
    }
  }
  // 所以：
 // 1. 你点击按钮 → dispatch(action)
 // 2. reducer(state, action) 被调用
 //    将data传递给state
 // 3. reducer 返回新状态 → newState
 // 4. React 的 setState(newState) → 更新 data
 // 5. data 变成 newState
  // reducer返回的新对象值 传递给了data
  let [data, dispatch] = useReducer(reducer, initData)
  return (
    <>
      <table cellPadding={0} cellSpacing={0} width={800} border={1}>
        <thead>
          <tr>
            <th>物品</th>
            <th>价格</th>
            <th>数量</th>
            <th>总价</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map(item => {
              return <tr key={item.id}>
                <td align="center">{item.name}</td>
                <td align="center">{item.price}</td>
                <td align="center">
                  <button onClick={() => dispatch({ type: 'add', id: item.id })}>+</button>
                  {item.count}
                  <button onClick={() => dispatch({ type: 'sub', id: item.id })}>-</button>
                </td>
                <td align="center">{item.price * item.count}</td>
                <td align="center">
                  <button>修改</button>
                  <button>删除</button>
                </td>
              </tr>
            })
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}></td>
            <td align='center'>总价：{data.reduce((a, b) => a + b.price * b.count, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </>
  )
}
~~~

## useImmer

`useImmer` 是基于 [immer](https://immerjs.github.io/immer/) 库实现的一个 React Hook，它让你可以像**修改可变数据一样来修改不可变数据**。

useImmer 用以解决嵌套状态更新的问题

对于嵌套对象，不可以直接使用展开运算符进行操作，因为展开运算符相当于浅拷贝，对于里层对象复制的还是引用

安装useImmer库

~~~npm
npm install immer use-immer
~~~

immer 是一个不可变的数据结构库，完全符合 React 的不可变性原则。
### 语法

~~~typescript
const [user, setUser] = useImmer(state)
// setUser处理函数
setUser( draft => {
    // 处理逻辑
})
~~~

### 案例

#### 处理嵌套对象


* useImmer里的参数是user的初始值

~~~typescript
import { useImmer } from 'use-immer'

interface User {
  name: string
  age: number
  profile: {
    avatar: string
    bio: string
    preferences: {
      theme: 'light' | 'dark'
      notifications: boolean
    }
  }
}

export default function UserProfile() {
  const [user, setUser] = useImmer<User>({
    name: '大满zs',
    age: 25,
    profile: {
      avatar: '/avatar.jpg',
      bio: '前端开发者',
      preferences: {
        theme: 'light',
        notifications: true
      }
    }
  })
	
	/*
	setUser({
		...user,
		
		profile:{
			...user.profile
			
			preferences:{
				...user.profile.preferences
				
				theme:dark
			}
		}
	})
	*/
	
  {/*useImmer使得可以直接修改不可变数据*/}
  {/*draft.profile.preferences.theme = 'dark' 直接修改的是user中的数据*/}
  
  const updateTheme = () => {
    setUser(draft => {
      draft.profile.preferences.theme = 'dark'
    })
  }

  const updateBio = (newBio: string) => {
    setUser(draft => {
        {/*draft相当于user*/}
      draft.profile.bio = newBio
    })
  }

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>年龄: {user.age}</p>
      <p>个人简介: {user.profile.bio}</p>
      <p>主题: {user.profile.preferences.theme}</p>

      <button onClick={updateTheme}>切换主题</button>
      <button onClick={() => updateBio('热爱编程的开发者')}>
        更新简介
      </button>
    </div>
  )
}
~~~

#### 处理数组

* 数组操作变得异常简单，所有**原生数组方法都可以直接使用**

~~~typescript
import { useImmer } from 'use-immer'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useImmer<Todo[]>([])

  const addTodo = (text: string) => {
    setTodos(draft => {
      draft.push({
        id: Date.now(),
        text,
        completed: false
      })
    })
  }

  const toggleTodo = (id: number) => {
    setTodos(draft => {
      const todo = draft.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
      }
    })
  }

  const removeTodo = (id: number) => {
    setTodos(draft => {
      const index = draft.findIndex(t => t.id === id)
      if (index > -1) {
        draft.splice(index, 1)
      }
    })
  }

  const clearCompleted = () => {
    setTodos(draft => {
      return draft.filter(todo => !todo.completed)
    })
  }

  return (
    <div className="todo-list">
      <h2>待办事项 ({todos.length})</h2>
      
      <div className="add-todo">
        <input 
          type="text" 
          placeholder="添加新待办..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              addTodo(e.currentTarget.value.trim())
              e.currentTarget.value = ''
            }
          }}
        />
      </div>

      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => removeTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>

      {todos.some(t => t.completed) && (
        <button onClick={clearCompleted}>清除已完成</button>
      )}
    </div>
  )
}
~~~

#### 处理基本数据类型

* useImmer与useState用法一致

### useImmerReducer 使用

* `useImmerReducer` 结合了 `useReducer` 和 immer 的优势，让 reducer 函数更加简洁
* 可以直接修改原数据，不用返回新对象或者新数组

~~~typescript
import { useReducer } from "react";

export default function App() {
  const initData = [
    { name: '小满(只)', price: 100, count: 1, id: 1, isEdit: false },
    { name: '中满(只)', price: 200, count: 1, id: 2, isEdit: false },
    { name: '大满(只)', price: 300, count: 1, id: 3, isEdit: false }
  ]
  type State = typeof initData
  // interface
   // initialArg 是 state 的初始值
  const reducer = (state: State, action: { type: 'add' | 'sub', id: number }) => {
    const item = state.find(item => item.id === action.id)!
    // 处理逻辑
    switch (action.type) {
      case 'add':
        item.count++
        break
      case 'sub':
        item.count--
        break
      default:
        return state
    }
  }
  let [data, dispatch] = useImmerReducer(reducer, initData)
  return (
    <>
      <table cellPadding={0} cellSpacing={0} width={800} border={1}>
        <thead>
          <tr>
            <th>物品</th>
            <th>价格</th>
            <th>数量</th>
            <th>总价</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map(item => {
              return <tr key={item.id}>
                <td align="center">{item.name}</td>
                <td align="center">{item.price}</td>
                <td align="center">
                  <button onClick={() => dispatch({ type: 'add', id: item.id })}>+</button>
                  {item.count}
                  <button onClick={() => dispatch({ type: 'sub', id: item.id })}>-</button>
                </td>
                <td align="center">{item.price * item.count}</td>
                <td align="center">
                  <button>修改</button>
                  <button>删除</button>
                </td>
              </tr>
            })
          }
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}></td>
            <td align='center'>总价：{data.reduce((a, b) => a + b.price * b.count, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </>
  )
}
~~~

## useSyncExternalStore

* 用于从外部存储（例如状态管理库、浏览器 API 等）获取状态并在组件中同步显示
* 它是为并发特性（如并发渲染、选择性水合）设计的，能安全地读取可变外部数据源。

### 语法

~~~javascript
const res = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
~~~

* res ：返回当前数据源的**最新快照值**
* subscribe：用来订阅数据源的变化，接收一个回调函数，在数据源更新时调用该回调函数。
* getSnapshot：获取当前数据源的快照（当前状态）。
* getServerSnapshot：用于服务端渲染

#### subscribe参数

* 订阅函数，接收一个回调函数并返回一个取消订阅的函数

~~~javascript
subscribe: (callback) => unsubscribe
~~~

~~~javascript
const subscribe = (callback) => {
  // 订阅外部数据源的变化
  externalStore.subscribe(callback);
  // 返回清理函数
  return () => externalStore.unsubscribe(callback);
};
~~~

#### getSnapshot参数

* **获取快照函数**，返回当前数据源的快照值

```javascript
const getSnapshot = () => {
  // 返回当前时刻的数据
  return externalStore.getState();
};
```

##### 注意事项

* 如果 `getSnapshot` 返回值不同于上一次，React 会重新渲染组件。
* 如果总是返回一个不同的值，会进入到一个无限循环，并产生这个报错。

### 订阅浏览器api案例

~~~typescript
// 用于订阅浏览器localStorage 数据
// 组件在 localStorage 数据发生变化时，自动更新同步
import { useSyncExternalStore } from "react"

export const useStorage = (key: string, initialvalue: any) => {
  // 订阅函数
  const subscribe = (callback: () => void) => {
    // 订阅浏览器api
    window.addEventListener('storage', callback)
    // callback黑盒
    // callback 是一个由 React 管理的函数
    // 它的作用是通知 React 外部存储已变化，需要重新获取数据并更新组件。
    return () => {
      // 取消订阅
      window.removeEventListener('storage', callback)
    }
  }
  const getSnapshot = () => {
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : initialvalue
  }

  const res = useSyncExternalStore(subscribe, getSnapshot)
  // a. React 创建 callback = () => { /* 更新逻辑 */ }
  // b. React 调用 subscribe(callback) → window.addEventListener('storage', callback)
  // c. React 调用 getSnapshot() 获取初始值
  // d. 将返回值赋值给 res

  const updateStorage = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
    // 手动触发storage事件，调用callback函数，更新视图
    window.dispatchEvent(new StorageEvent('storage'))
  }

  return [res, updateStorage]
}
// 类似与useState
// const [count, setcount] = useStorage('count', 1)
~~~

## useEffect

* 用于在函数组件中执行副作用操作

* **副作用（Side Effects）** 是指那些与组件渲染结果无关的操作
  * 数据获取（API 调用）
  * 手动操作 DOM
  * 订阅事件
  * 设置定时器
  * 日志记录
  * 操作第三方库

### 语法

~~~typescript
useEffect(setup, dependencies?)
~~~

* setup：处理 Effect 的函数。setup 函数选择性返回一个 **清理（cleanup）** 函数。当组件被添加到 DOM 的时候，React 将运行 setup 函数。`在每次依赖项变更重新渲染后，React 将首先使用旧值运行 cleanup 函数（如果你提供了该函数），然后使用新值运行 setup 函数。`在组件从 DOM 中移除后，React 将最后一次运行 cleanup 函数。
* dependencies(可选)：setup中使用到的响应式值列表(props、state等)。必须以数组形式编写如[dep1, dep2]。不传则每次重渲染都执行Effect。

### 执行时机

* 每次渲染时都执行

~~~javascript
useEffect(() => {
  console.log('每次渲染后都会执行');
});
// 没有依赖数组
~~~

* 仅在挂载时执行一次

~~~javascript
useEffect(() => {
  console.log('只在组件挂载时执行一次');
  
  return () => {
    console.log('只在组件卸载时执行清理');
  };
}, []); // 空依赖数组
~~~

* 依赖变化时执行

~~~javascript
useEffect(() => {
  console.log('当 count 变化时执行');
  document.title = `Count: ${count}`;
}, [count]); // 依赖数组中包含 count
~~~

* 组件卸载时执行清理函数
  * 组件在页面中由**存在变为不存在状态**
* `useEffect`的副作用函数可以返回一个清理函数，当组件卸载时，`useEffect`的副作用函数就会执行清理函数。

~~~typescript
import { useEffect, useState } from "react"
// 子组件
const Child = (props: { name: string }) => {
   useEffect(() => {
      console.log('render', props.name)
      // 返回一个清理函数
      return () => {
         console.log('unmount', props.name)
      }
   }, [props.name])
   return <div>Child:{props.name}</div>
}
const App = () => {
   const [show, setShow] = useState(true)
   const [name, setName] = useState('')
   return (
      <div id='data'>
         <div>
            <h3>父组件</h3>
            <input value={name} onChange={e => setName(e.target.value)} />
            <button onClick={() => setShow(!show)}>显示/隐藏</button>
         </div>
         <hr />
         <h3>子组件</h3>
         {show && <Child name={name} />}
      </div>
   )
}

export default App
~~~

### 注意事项

* **异步操作**：`useEffect` 的回调函数不能是 async 函数，但可以在内部定义 async 函数
* `useEffect` 期望其回调函数返回 **清理函数** 或 **不返回任何值**（`undefined`）。
  而 `async` 函数总是返回一个 `Promise` 对象，这与 `useEffect` 的期望不符。

~~~javascript
useEffect(() => {
  async function fetchData() {
    const data = await api.get();
    setData(data);
  }
  fetchData();
}, []);
~~~

## useLayoutEffect

* `useLayoutEffect` 是 React 中的一个 Hook，用于在`浏览器重新绘制屏幕之前触发`。与 useEffect 类似。

### 语法

~~~typescript
useLayoutEffect(() => {
  // 副作用代码
  return () => {
    // 清理代码
  }
}, [dependencies]);
~~~

### 参数

- setup：Effect处理函数,可以返回一个清理函数。组件挂载时执行setup,依赖项更新时先执行cleanup再执行setup,组件卸载时执行cleanup。
- dependencies(可选)：setup中使用到的响应式值列表(props、state等)。必须以数组形式编写如[dep1, dep2]。不传则每次重渲染都执行Effect。

### 区别(useLayoutEffect/useEffect)

* useLayoutEffect是同步执行的，会阻塞DOM渲染

| 区别    | useLayoutEffect     | useEffect           |
| ----- | ------------------- | ------------------- |
| 执行时机  | 浏览器完成布局和绘制`之前`执行副作用 | 浏览器完成布局和绘制`之后`执行副作用 |
| 执行方式  | 同步执行                | 异步执行                |
| DOM渲染 | 阻塞DOM渲染             | 不阻塞DOM渲染            |


### 案例

* 记录滚动位置，页面刷新不跳转
* 通过将top值记录在url实现

~~~typescript
import React, { useLayoutEffect } from 'react'

const App = () => {
  const scrollHandler = (e: React.UIEvent<HTMLDivElement>) => {
    // 滚动事件触发 拿到当前滚动的位置
    const scrollTop = e.currentTarget.scrollTop;
    // 修改当前页面的 URL，但不会刷新页面。
    window.history.replaceState({}, '', `?top=${scrollTop}`)
  }
  // 同步渲染
  useLayoutEffect(() => {
    const div = document.getElementById('container') as HTMLDivElement
    // window.location.search 得到的是问号 ? 及其后面的所有内容
    // split('=') 将字符串在 = 处分割成数组
    const top = window.location.search.split('=')[1]
    div.scrollTop = Number(top)
  })


  return (
    <div>
      <div>App</div>
      <div onScroll={scrollHandler} id='container' style={{ height: '500px', overflow: 'auto' }}>
        {
          Array.from({ length: 500 }, (_, index) => {
            return <div key={index}>{index + 1}</div>
          })
        }
      </div>
    </div>
  )
}

export default App
~~~

## useTransition

`useTransition` 是一个让你可以在后台渲染部分 UI 的 React Hook。

但其实是为了解决“大体积渲染导致页面卡顿、掉帧”**的问题。

它引入了**并发渲染（Concurrent Rendering），将渲染分为**高优先级**和**低优先级**，让高优先级先响应，低优先级后响应并且**可中断**

### 语法

~~~typescript
const [isPending, startTransition] = useTransition()
~~~
### 返回值

* `isPending`(boolean)，告诉你是否存在待处理的 transition。
* `startTransition`(function) 函数，你可以使用此方法将状态更新标记为 transition。(低优先级)

### 问题

主要用于解决像**搜索框实时联动**这种`用户交互必须立即响应，但是后续渲染比较重`的场景

例如：
``` ts
function Search() {
  const [keyword, setKeyword] = useState("");
  const [isPending, startTransition] = useTransition()
  const [list, setList] = useState(bigData);

  function handleChange(e) {
    const value = e.target.value;

    setKeyword(value);
    
	startTransition(() => {
		setList(
	      bigData.filter(item =>
	        item.includes(value)
	      )
	    );	
	})
  }

  return (
    <>
      <input
        value={keyword}
        onChange={handleChange}
      />

      <HugeList list={list} />
    </>
  );
}
```

如果不加 `startTransition` ，用户在表单输入，ste 函数更新会导致组件重新渲染，同时子组件 HugeList 也重新渲染，但是如果子组件有一万条数据，会有很明显的卡顿，可能也会造成表单不响应

问题在于**更新优先级**是不一样的，表单可以立即更新，但是搜索结果可以慢一点更新



**防抖（debounce）、节流（throttle）解决的是“事件触发太频繁”的问题。** 不会降低渲染次数

**startTransition 解决的是“渲染太重导致界面卡顿”的问题。**

---
## useDeferredValue

* **延迟某些状态的更新，直到主渲染任务完成。** 这对于高频更新的内容（如输入框、滚动等）非常有用，可以让 UI 更加流畅，避免由于频繁更新而导致的性能问题。

### 语法

~~~typescript
const deferredValue = useDeferredValue(value)
~~~

### 参数

* value: 延迟更新的值(支持任意类型)

### 返回值

* deferredValue: 延迟更新的值,在初始渲染期间，返回的延迟值将与value的值相同

### 注意事项

当 `useDeferredValue` 接收到与之前不同的值（使用 Object.is 进行比较）时，除了当前渲染（此时它仍然使用旧值），它还会安排一个后台重新渲染。这个后台重新渲染是可以被中断的，如果 value 有新的更新，React 会从头开始重新启动后台渲染。举个例子，如果用户在输入框中的输入速度比接收延迟值的图表重新渲染的速度快，那么图表只会在用户停止输入后重新渲染。

### 案例

~~~typescript
import { useState, useDeferredValue } from 'react'
import { Input, List } from 'antd'
import { faker } from '@faker-js/faker/locale/zh_CN';
/**
 * useDeferredValue
 * deferredQuery设置为低优先级
 * 页面先输入响应
 * 搜索响应延后执行
 */
interface Item {
  id: number
  name: string
  address: string
}
export const DeferredValue = () => {
  const [val, setVal] = useState('')
  const [list] = useState<Item[]>(() => {
    // Array.from 循环一万次创建数组
    // { length: 10000 } 创建一个长度一万的空数组
    // (_, index) 映射函数，对每个元素进行处理
    // 循环处理函数，它会遍历数组的每个位置，对每个元素进行转换。
    return Array.from({ length: 10000 }, (_, index) => ({
      'id': index + 1,  // 自增 ID
      'name': faker.number.int({ min: 10000, max: 99999 }).toString(), // 数字转为字符串
      'address': faker.location.county() + faker.location.city(), // 更完整的地址
    }));
  })
  // val先响应，deferredQuery后响应
  const deferredQuery = useDeferredValue(val)
  const isStale = deferredQuery !== val // 检查是否为延迟状态
  const findItem = () => {
    console.log(deferredQuery, '---', val)
    //过滤列表，仅在 deferredQuery 更新时触发
    return list.filter(item => item.name.toString().includes(deferredQuery))
  }
  return (
    <div>
      <Input value={val} onChange={(e) => setVal(e.target.value)} />
      <List style={{ opacity: isStale ? '0.2' : '1', transition: 'all 1s' }} renderItem={(item) => <List.Item>
        <List.Item.Meta title={item.name} description={item.address} />
      </List.Item>} dataSource={findItem()}> {/**dataSource={findItem()} 用于接收findItem函数传递的新数组 */}
      </List>
    </div>
  )
}

export default DeferredValue
~~~

## useRef

* 当你在React中需要`处理DOM元素`或需要在组件渲染之间保持`持久性数据`时，便可以使用useRef。

### 语法

~~~typescript
import { useRef } from 'react';
const refValue = useRef(initialValue)
~~~

### 参数

* initialValue：ref 对象的 current 属性的初始值。可以是任意类型的值。这个参数在首次渲染后被忽略。

### 返回值

* useRef返回一个ref对象，对象的current属性指向传入的初始值。 `{current:xxxx}`

### 通过Ref操作DOM节点

* 改变 ref.current 属性时，React 不会重新渲染组件。React 不知道它何时会发生改变，因为 ref 是一个普通的 JavaScript 对象。

* 除了 初始化 外不要在渲染期间写入或者读取 ref.current，否则会使组件行为变得不可预测。

~~~typescript
import { useRef } from "react"
function App() {
  //首先，声明一个 初始值 为 null 的 ref 对象
  let refDiv = useRef(null)
  const heandleClick = () => {
    //当 React 创建 DOM 节点并将其渲染到屏幕时，React 将会把 DOM 节点设置为 ref 对象的 current 属性
    console.log(refDiv.current)
  }
  return (
    <>
      {/*然后将 ref 对象作为 ref 属性传递给想要操作的 DOM 节点的 JSX*/}
      <div ref={refDiv}>dom元素</div>
      <button onClick={heandleClick}>获取dom元素</button>
    </>
  )
}
export default App
~~~

* 如果将ref对象传递给多个DOM节点，只获取最后一个DOM节点

### 数据存储

* 调用useState返回的**set函数**时，会造成组件的重新渲染

* 组件在重新渲染的时候，**useRef的值不会被重新初始化，** 同时改变`useRef`的值也不会触发组件的重新渲染

~~~typescript
import React, { useLayoutEffect, useRef, useState } from 'react';

function App() {
   console.log('render')
   // useRef 组件渲染时 
   let timer = useRef< | null >(null)
   let [count, setCount] = useState(0)
   const handleClick = () => {
      timer.current = setInterval(() => {
         setCount(count => count + 1)
      }, 300)
   };
   const handleEnd = () => {
      console.log(timer);
      if (timer.current) {
         clearInterval(timer.current)
         timer.current = null
      }
   };
   return (
      <div>
         <button onClick={handleClick}>开始计数</button>
         <button onClick={handleEnd}>结束计数</button>
         <div>{count}</div>
      </div>
   );
}

export default App;
~~~

**核心特征：**

1. `useRef` 返回的对象在组件的**整个生命周期内保持不变**。
    
2. 修改 `ref.current` **绝不会触发组件的重新**

## useImperativeHandle

* 可以在**子组件内部**暴露给父组件`句柄`，那么说人话就是，父组件可以调用子组件的方法，或者访问子组件的属性。

### 语法

~~~typescript
useImperativeHandle(ref, createHandle, dependencies?)
                    
useImperativeHandle(ref, ()=>{
    return {
        // 暴露给父组件的方法或属性
    }
}, [deps])
~~~

### 参数

* ref: 父组件传递的ref对象
* createHandle: 回调函数，返回一个对象，**对象的属性就是子组件暴露给父组件的方法或属性**
* deps?:[可选] 依赖项，当依赖项发生变化时，会重新调用createHandle函数，类似于`useEffect`的依赖项

### 执行时机

* 同useEffect

### 案例

* 通过useRef 访问和操作子组件内部的状态和方法
  * <Child ref={childRef}></Child>   将ref传递给子组件
* useImperativeHandle将子组件的方法、属性暴露出去

~~~typescript
import { useState,useImperativeHandle,useRef } from "react"
interface ChildRef {
   name: string
   count: number
   addCount: () => void
   subCount: () => void
}

const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => { 
   const [count, setCount] = useState(0)
   // useImperativeHandle将子组件方法、属性暴露给父组件
   useImperativeHandle(ref, () => {
      return {
         name: 'child',
         // 对状态暴露
         count,
         addCount: () => setCount(count + 1),
         subCount: () => setCount(count - 1)
      }
   })
   return <div>
      <h3>我是子组件</h3>
      <div>count:{count}</div>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
   </div>
}
// childRef.current指向的是子组件暴露的对象
function App() {
    // <ChildRef>对返回值限定
   const childRef = useRef<ChildRef>(null)
   const showRefInfo = () => {
      console.log(childRef.current)
   }
   return (
      <div>
         <h2>我是父组件</h2>
         <button onClick={showRefInfo}>获取子组件信息</button>
         <button onClick={() => childRef.current?.addCount()}>操作子组件+1</button>
         <button onClick={() => childRef.current?.subCount()}>操作子组件-1</button>
         <hr />
         {/* ref 的作用是让父组件能够直接访问和操作子组件内部的状态和方法 */}
         <Child ref={childRef}></Child>
      </div>
   );
}

export default App;
~~~

## useContext

* useContext 提供了一个无需为每层组件手动添加 props，就能**在组件树间进行数据传递**的方法。设计的目的就是解决组件树间数据传递的问题。

### 语法

* createContext创建了一个context对象
  * createContext接收一个默认值，这个值在没有Provider时候生效
  * 当Provider存在时候，value中的值和createContext的默认值类型应该一致
* context对象的Provider属性
  * 是一个 React 组件
  * 接受 `value` 属性，可以是任何类型的值
  * 所有子组件都可以访问这个值
  * 当 `value` 改变时，所有使用该 Context 的组件都会重新渲染

~~~typescript
// React.createContex创建一个context对象
// React.createContext传递要传递的数据
const MyThemeContext = React.createContext({theme: 'light'}); // 创建一个上下文
function App () {
   return (
       {/*context对象的Provider是一个组件*/}
      <MyThemeContext.Provider value={{theme: 'light'}}>
         <MyComponent />
       // MyComponent所有的子组件都可以使用useContext接收theme属性
      </MyThemeContext.Provider>
   )
}
function MyComponent() {
    const themeContext = useContext(MyThemeContext); // 使用上下文
    return (<div>{themeContext.theme}</div>);
}
~~~

### 参数

-  context：是 createContext 创建出来的对象，他不保持信息，他是信息的载体。声明了可以从组件获取或者给组件提供信息。
### 返回值

* **返回的是当前组件树中最近的上层 MyThemeContext.Provider 传递的 value 值。这个值是只读的**，虽然 JavaScript 层面可以修改它，但**修改不会触发组件重新渲染**。React 推荐将其视为不可变数据。当 Provider 的 `value` 发生变化时，所有使用该 Context 的组件都会自动重新渲染。

### 案例

~~~typescript
import React, { useContext, useState,createContext } from 'react';
// {} as ThemeContextType为空对象添加类型断言
// <ThemeContextType>为返回值限定
const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
interface ThemeContextType {
   theme: string;
   setTheme: (theme: string) => void;
}

const Child = () => {
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         child
      </div>
   </div>
}

const Parent = () => {
   const themeContext = useContext(ThemeContext);
   const styles = {
      backgroundColor: themeContext.theme === 'light' ? 'white' : 'black',
      border: '1px solid red',
      width: 100 + 'px',
      height: 100 + 'px',
      color: themeContext.theme === 'light' ? 'black' : 'white'
   }
   return <div>
      <div style={styles}>
         Parent
      </div>
      <Child />
   </div>
}
function App() {
   const [theme, setTheme] = useState('light');
   return (
      <div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>切换主题</button>
         <ThemeContext.Provider value={{ theme, setTheme }}>
            <Parent />
         </ThemeContext.Provider>
      </div>
   )
}
export default App;
~~~

## useMemo

* `useMemo` 是 React 提供的一个性能优化 Hook。它的主要功能是**避免在每次渲染时执行复杂的计算和对象重建。** 通过记忆上一次的计算结果，仅当依赖项变化时才会重新计算，提高了性能

### 语法

~~~typescript
const cachedValue = useMemo(calculateValue, dependencies)

const memoizedValue = useMemo(() => {
  // 计算逻辑
  return computedValue;
}, [dependency1, dependency2, ...]);
~~~

### 参数

* `calculateValue`：要缓存计算值的函数。它应该是一个没有任何参数的**纯函数**，并且可以返回任意类型。React 将会在首次渲染时调用该函数；在之后的渲染中，如果 `dependencies` 没有发生变化，React 将直接返回相同值。否则，将会再次调用 `calculateValue` 并返回最新结果，然后缓存该结果以便下次重复使用。
* `dependencies`：所有在 `calculateValue` 函数中使用的响应式变量组成的数组。响应式变量包括 props、state 和所有你直接在组件中定义的变量和函数。

### 返回值

* 在初次渲染时，`useMemo` 返回不带参数调用 `calculateValue` 的结果。
* 在接下来的渲染中，如果依赖项没有发生改变，它将返回上次缓存的值；否则将再次调用 `calculateValue`，并返回最新结果。

### 案例

~~~typescript
import { useMemo, useState } from 'react';

function App() {
    // 状态声明
   const [search, setSearch] = useState('');
   const [goods, setGoods] = useState([
      { id: 1, name: '苹果', price: 10, count: 1 },
      { id: 2, name: '香蕉', price: 20, count: 1 },
      { id: 3, name: '橘子', price: 30, count: 1 },
   ]);
   // 数量增加逻辑
   const handleAdd = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
   }
   // 数量减少逻辑
   const handleSub = (id: number) => {
      setGoods(goods.map(item => item.id === id ? { ...item, count: item.count - 1 } : item));
   }
   // useMemo 
   // 依赖goods
   /**
    * 为什么要用useMemo？
    * input表单调用set函数 会使整个组件重新渲染
    * 但input表单的set函数跟goods状态无关联
    * goods状态没有发生改变，没必要渲染，造成了性能浪费
    * 使用useMemo可以依赖goods，仅当goods发生改变时，重新逻辑处理，如果没有发生改变，直接返回上一次值
    */
   const total = useMemo(() => {
      console.log('total');
      return  goods.reduce((total, item) => total + item.price * item.count, 0)
   }, [goods]);
   return (
      <div>
         <h1>父组件</h1>
         <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
         <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
               <tr>
                  <th>商品名称</th>
                  <th>商品价格</th>
                  <th>商品数量</th>
               </tr>
            </thead>
            <tbody>
               {goods.map(item => <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price * item.count}</td>
                  <td>
                     <button onClick={() => handleAdd(item.id)}>+</button>
                     <span>{item.count}</span>
                     <button onClick={() => handleSub(item.id)}>-</button>
                  </td>
               </tr>)}
            </tbody>
         </table>
         <h2>总价：{total}</h2>
      </div>
   );
}

export default App;
~~~

### 与React.memo区别

* **useMemo**：缓存**计算结果值**（值/对象/数组）
* **React.memo**：缓存**组件渲染结果**（组件）

## useCallback

useCallback解决的是：当函数作为 props 传给被 `React.memo` 包裹的子组件，或者作为 effect 依赖时，保持引用稳定，避免不必要更新

* 在React中，函数组件的重新渲染会导致组件内的函数被销毁后重新创建，这可能会导致性能问题，因为函数的地址发生变化，会导致useEffect和React.memo引用不稳定。

### 语法

~~~typescript
const cachedFn = useCallback(fn, dependencies)

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
~~~

### 参数

* `fn`：想要缓存的函数。此函数可以接受任何参数并且返回任何值。在初次渲染时，React 将把函数返回给你（而不是调用它！）。当进行下一次渲染时，如果 `dependencies` 相比于上一次渲染时没有改变，那么 React 将会返回相同的函数。否则，React 将返回在最新一次渲染中传入的函数，并且将其缓存以便之后使用。React 不会调用此函数，而是返回此函数。你可以自己决定何时调用以及是否调用。
* `dependencies`：有关是否更新 `fn` 的所有响应式值的一个列表。响应式值包括 props、state，和所有在你组件内部直接声明的变量和函数。

### 返回值

* 在初次渲染时，`useCallback` 返回你已经传入的 `fn` 函数
* 在之后的渲染中, 如果依赖没有改变，`useCallback` 返回上一次渲染中缓存的 `fn` 函数；否则返回这一次渲染传入的 `fn`。
  * 简而言之，`useCallback` 在多次渲染中缓存一个函数，直至这个函数的依赖发生改变。

### 案例

~~~typescript
import React, { useCallback, useState } from 'react'

/**
 * 使用React.memo后，props没有发生变化，但子组件被重新渲染了
 * 为什么？
 * 因为定义在父组件的函数被重新创建和销毁
 * 而该函数作为参数传递给子组件的props
 * 导致函数的内存地址发生变化(虽然逻辑没有发生变化)，但react认为props发生变化了，使子组件重新渲染
 * 
 * useCallback 缓存函数
 * 如果依赖没有发生变化，则useCallback返回上一次缓存的函数
 */
const Child = React.memo(({ user, callback }: { user: { name: string; age: number }, callback: () => void }) => {
   console.log('Render Child')
   const styles = {
      color: 'red',
      fontSize: '20px',
   }
   return <div style={styles}>
      <div>{user.name}</div>
      <div>{user.age}</div>
      <button onClick={callback}>callback</button>
   </div>
})

const App: React.FC = () => {
   const [search, setSearch] = useState('')
   const [user, setUser] = useState({
      name: 'John',
      age: 20
   })
   // 仅当依赖发生变化时执行
   const childCallback = useCallback(() => {
      console.log('callback 执行了')
   },[])
   return <>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} />
      <Child callback={childCallback} user={user} />
   </>;
};

export default App;
~~~

### 总结

* useCallback并不是为了阻止函数的重新创建，而是通过依赖项来决定是否返回新的函数或旧的函数，从而在依赖项不变的情况下确保函数的地址不变。


## useDebugValue

* `useDebugValue` 是一个专为开发者调试自定义 Hook 而设计的 React Hook。它允许你在 React 开发者工具中为自定义 Hook 添加自定义的调试值。

### 语法

~~~typescript
useDebugValue(value, format?)
~~~

### 参数

- `value`：你想在 React 开发工具中显示的值。可以是任何类型。
- **可选** `format`：它接受一个格式化函数。当组件被检查时，React 开发工具将用 `value` 作为参数来调用格式化函数，然后显示返回的格式化值（可以是任何类型）。如果不指定格式化函数，则会显示 `value`。

### 案例

* 实现一个 `useCookie` Hook 来展示 `useDebugValue` 的实际应用。这个 Hook 提供了完整的 cookie 操作功能，并通过 `useDebugValue` 来增强调试体验。

~~~typescript
import React, { useState, useDebugValue } from 'react';

const useCookie = (name: string, initialValue: string = '') => {
    // 获取指定名称的 cookie 值
   const getCookie = () => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`)) 
      return match ? match[2] : initialValue
   }
   const [cookie, setCookie] = useState(getCookie())
   // 更新或创建新的 cookie
   const updateCookie = (value: string, options?: any) => {
      document.cookie = `${name}=${value};${options}`
      setCookie(value)
   }
   // 删除指定的 cookie
   const deleteCookie = () => {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
      setCookie(initialValue)
   }
   // 在 React DevTools 中显示自定义 Hook 的调试信息
   useDebugValue(cookie, (value) => {
      return `cookie: ${value}`
   })
   return [cookie, updateCookie, deleteCookie] as const // 设置为元组类型
   // 没有 as const：返回的是数组，类型是 (string | Function)[]
   // 有 as const：返回的是元组，类型是 [string, Function, Function]  自定义名
   // 这样 TypeScript 知道每个位置的准确类型
}

const App: React.FC = () => {
   const [cookie, updateCookie, deleteCookie] = useCookie('key', 'value')
   return (
      <div>
         <div>{cookie}</div>
         <button onClick={() => { updateCookie('update-value') }}>设置cookie</button>
         <button onClick={() => { deleteCookie() }}>删除cookie</button>
      </div>
   );
}

export default App;
~~~

## useId

* useId 是 React 18 新增的一个 Hook，**用于生成稳定的唯一标识符**，主要用于解决 SSR 场景下的 ID 不一致问题，或者需要为组件生成唯一 ID 的场景。

### 语法

~~~ ts
const id = useId()
// 返回值: :r0: 多次调用值递增
~~~

* 无参数
* 返回值：唯一标识符 例如`:r0:`

### 案例

* 表单元素，**label 需要和 input 绑定**，如果使用 id 属性，需要手动生成唯一 ID，使用 useId 可以自动生成唯一 ID，这就非常方便。

~~~ ts
export const App = () => {
  const id = useId()
  return <>
  <label htmlFor={id}>Name</label>
  <input id={id} type="text" />
  </>
}
~~~

* **无障碍交互唯一Id**
* `aria-describedby` 是一个 **ARIA** 属性，用于为元素提供额外的描述性文本。它通过引用其他元素的 ID 来关联描述内容，帮助屏幕阅读器为用户提供更详细的信息。
* 当视障用户使用屏幕阅读器浏览网页时：
  1. 读到输入框时会先读出输入框的标签
  2. 然后会读出通过 `aria-describedby` 关联的描述文本
  3. 用户就能知道这个输入框需要输入什么内容，有什么要求

~~~ ts
export const App = () => {
  const id = useId()
  return (
    <div>
      <input 
        type="text" 
        aria-describedby={id} 
      />
      <p id={id}>
        请输入有效的电子邮件地址，例如：xiaoman@example.com
      </p>
    </div>
  )
}
~~~
## useActionState

`useActionState` 是一个 React Hook，它允许你使用 [Actions](https://react.dev/reference/react/useTransition#functions-called-in-starttransition-are-called-actions) 来更新带有副作用的 state。

### 1.Action是什么

**Action** 指的是一个特定的**异步函数**，它专门用于处理数据提交并返回处理结果。

- **输入 (Payload)**：通常是表单数据（`FormData`）或普通参数。
    
- **副作用 (Side Effects)**：函数内部会执行诸如请求 API、写入数据库、清除缓存等操作。
    
- **输出 (Result)**：执行完后，它会返回一个新的 **State**（比如错误消息、成功提示或新数据）。

Action 实际上就是传给 `useActionState` 的那个函数。例如：

``` ts
// 1. 这就是一个标准的 Action 函数
// 它接收两个参数：上一次的状态 (prevState) 和 传入的数据 (formData)
async function updateUsernameAction(prevState: any, formData: FormData) {
  const name = formData.get("username");
  
  if (name === "admin") {
    return { error: "用户名已存在", status: "fail" }; // 返回新 State
  }
  
  // 模拟数据库操作
  await db.update(name);
  
  return { error: null, status: "success" }; // 返回新 State
}

// 2. 在组件中使用
const [state, formAction, isPending] = useActionState(updateUsernameAction, { error: null });
```

### 2.语法

``` ts
const [state, dispatchAction, isPending] = useActionState(reducerAction, initialState, permalink?);
```

### 3.参数

- `reducerAction`: 触发 Action 时调用的函数。调用时，它接收前一个状态（最初是你提供的 `initialState`，然后是其前一个返回值）作为第一个参数，接着是传递给 `dispatchAction` 的 `actionPayload`。

- `initialState`: 你希望状态初始时的值。在 `dispatchAction` 第一次被调用后，React 会忽略这个参数。

- **可选** `permalink`: 表单提交后跳转的URL路径。
	
    - 用于带有 [React Server Components](https://react.dev/reference/rsc/server-components) 且具有渐进增强功能的页面。
	
    - 如果 `reducerAction` 是一个 [服务器函数](https://react.dev/reference/rsc/server-functions) ，并且表单在 JavaScript 打包文件加载之前提交，浏览器将导航到指定的永久链接 URL，而不是当前页面的 URL。

### 4.返回值

`useActionState` 返回一个包含正好三个值的数组：

1. 当前状态。在第一次渲染时，它将匹配你传递的 `initialState`。在 `dispatchAction` 被调用后，它将匹配由 `reducerAction` 返回的值

2. 一个你可以在 [Actions](https://react.dev/reference/react/useTransition#functions-called-in-starttransition-are-called-actions) 内部调用的 dispatchAction 函数。丢给form表单的函数

3. 一个 `isPending` 标志，用来告诉你这个 Hook 的已派发 Actions 是否还有待处理。

### 5.reducerAction

#### 参数

- `previousState`: 最后的状态。最初它等于 `initialState`。在第一次调用 `dispatchAction` 后，它等于返回的最后一个状态。
    
- **可选** `actionPayload`: 传递给 `dispatchAction` 的参数。它可以任何类型的值。类似于 `useReducer` 的约定，它通常是一个带有 `type` 属性的对象，用于标识它，并且可选地包含其他带有额外信息的属性。

#### 返回

`reducerAction` 返回新的状态，并触发一个使用该状态的组件的重新渲染。

#### 注意

- `reducerAction` 的返回类型必须与 `initialState` 的类型相匹配。如果 TypeScript 推断出不匹配，您可能需要显式地标注您的状态类型。


--- 
# API

## memo

* `React.memo` 对props进行浅比较，仅当 props 发生变化时才会重新渲染,，否则跳过该次渲染

### 语法

* memo是一个函数，用于包裹组件

~~~typescript
import React, { memo } from 'react';
const MyComponent = React.memo(({ prop1, prop2 }) => {
  // 组件逻辑
});
const App = () => {
  return <MyComponent prop1="value1" prop2="value2" />;
};
~~~

### 案例

~~~typescript
import React, { useMemo, useState } from 'react';
interface User {
   name: string;
   age: number;
   email: string;
}
interface CardProps {
   user: User;
}
const Card = React.memo(function ({ user }: CardProps) {
   console.log('Card render');
   const styles = {
      backgroundColor: 'lightblue',
      padding: '20px',
      borderRadius: '10px',
      margin: '10px'
   }
   return <div style={styles}>
      <h1>{user.name}</h1>
      <p>{user.age}</p>
      <p>{user.email}</p>
   </div>
})
function App() {
   const [users, setUsers] = useState<User>({
      name: '张三',
      age: 18,
      email: 'zhangsan@example.com'
   });
   const [search, setSearch] = useState('');
   return (
      <div>
         <h1>父组件</h1>
         <input value={search} onChange={(e) => setSearch(e.target.value)} />
         <div>
            <button onClick={() => setUsers({
               name: '李四',
               age: Math.random() * 100,
               email: 'lisi@example.com'
            })}>更新user</button>
         </div>
         <Card user={users} />
      </div>
   );
}

export default App;

/*
表单发生变化时，也就是调用setSearch改变state，但是与Card内容无关，但是Card组件也会重新渲染
*/
~~~

### 总结

1. **使用场景**：
   - 当子组件接收的 props 不经常变化时
   - 当组件重新渲染的开销较大时
   - 当需要避免不必要的渲染时
2. **优点**：
   - 通过记忆化避免不必要的重新渲染
   - 提高应用性能
   - 减少资源消耗
3. **注意事项**：
   - 不要过度使用，只在确实需要优化的组件上使用
   - 对于简单的组件，使用 `memo` 的开销可能比重新渲染还大
   - 如果 props 经常变化， `memo` 的效果会大打折扣


## createRoot

* `createRoot` 允许在浏览器的 DOM 节点中创建根节点以显示 React 组件。

### 语法

~~~ typescript
// 基础语法
const root = createRoot(domNode, options?)

// 应用
import { createRoot } from 'react-dom/client';
const domNode = document.getElementById('root');
const root = createRoot(domNode);
                        
root.render(<App />);
~~~

### 参数

* `domNode`：一个 [DOM 元素](https://developer.mozilla.org/zh-CN/docs/Web/API/Element)。React 将为这个 DOM 元素创建一个根节点然后允许你在这个根节点上调用函数(调用组件)，比如 `render` 来显示渲染的 React 内容。

### 返回值

* `createRoot` 返回一个带有两个方法的的对象，这两个方法是：[`render`](https://zh-hans.react.dev/reference/react-dom/client/createRoot#root-render) 和 [`unmount`](https://zh-hans.react.dev/reference/react-dom/client/createRoot#root-unmount)。

#### render

* 调用 `root.render` 以将一段 JSX/TSX（“React 节点”）在 React 的根节点中渲染为 DOM 节点并显示。

~~~ typescript
root.render(<App />);
~~~

* React 将会在 `根节点` 中显示 `<App />` 组件，并且控制组件中的 DOM。

##### 参数

* `reactNode`：一个你想要显示的 **React 节点**。它总是一段 JSX，就像 `<App />`，也总是可以传递一个 [`createElement()`](https://zh-hans.react.dev/reference/react/createElement) 构造的 React 元素、一个字符串、一个数字、`null` 或者 `undefined`。

###### 注意

* 首次调用 `root.render` 时，React 会先清空根节点中所有已经存在的 HTML，然后才会渲染 React 组件。
  * 推荐使用空容器调用`root.render`

#### unmount

* 调用 `root.unmount` 以销毁 React 根节点中的一个已经渲染的树。


## lazy

* `lazy` 能够让你在组件第一次被渲染之前延迟加载组件的代码。
* 使用时才引入，按需加载

### 语法

~~~typescript
const SomeComponent = lazy(load)

import React, { Suspense,lazy } from 'react';
// React.lazy() 是 React 16.6 引入的代码分割（Code Splitting）功能，用于延迟加载组件。
// 传统方式是：头部引入时直接导入
// lazy是：使用时才导入，按需加载
const AsyncComponent = lazy(() => import('../components/Async'))
const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<div>loading...</div>}>
        <AsyncComponent />
      </Suspense>
    </>
  );
}

export default App;
~~~

### 参数

* `load`: 一个返回 [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 或另一个 **thenable**（具有 `then` 方法的类 Promise 对象）的函数。
* import()的返回值是一个promise对象

### 返回值

* `lazy` 返回一个 React 组件，你可以在 fiber 树中渲染。当懒加载组件的代码仍在加载时，尝试渲染它将会处于 *暂停* 状态。使用 [`<Suspense>`](https://zh-hans.react.dev/reference/react/Suspense) 可以在其加载时显示一个正在加载的提示。

## createPortal

* `createPortal` 允许你将 JSX 作为 children 渲染至 DOM 的不同部分。

### 语法

~~~typescript
import { createPortal } from 'react-dom';

<div>
  <SomeComponent />
  {createPortal(children, domNode, key?)}
</div>
   
<div>
  <p>这个子节点被放置在父节点 div 中。</p>
  {createPortal(
    <p>这个子节点被放置在 document body 中。</p>,
    document.body
  )}
</div>
~~~

### 参数

* `children`：React 可以渲染的任何内容，如 JSX 片段（`<div />` 或 `<SomeComponent />` 等等）、[Fragment](https://zh-hans.react.dev/reference/react/Fragment)（`<>...</>`）、字符串或数字，以及这些内容构成的数组。
* `domNode`：某个已经存在的 DOM 节点，例如由 `document.getElementById()` 返回的节点。在更新过程中传递不同的 DOM 节点将导致 portal 内容被重建。
* key?：可选，用于唯一标识要渲染的组件

### 返回值

* `createPortal` 返回一个可以包含在 JSX 中或从 React 组件中返回的 React 节点。如果 React 在渲染输出中遇见它，它将把提供的 `children` 放入提供的 `domNode` 中。

### 案例

* 可以解决`position:relative`不稳定问题(绝对定位是以父元素的相对定位为基准)
* 可以解决`position: fixed`不稳定问题，在默认的情况下是根据浏览器视口进行定位的，但是如果父级设置了`transform、perspective、filter 或 backdrop-filter` 属性非 none 时，他就会相对于父级进行定位，

# CSS方案

## css modules

* React是一个单页面应用，最终会把所有的组件打包到一个html文件中，这样容易造成css类名混淆(组件A用了组件B的类名)，所以需要一种方式来解决css的样式冲突问题，也就是把每个组件的样式做成单独的作用域，实现样式隔离，而[css modules](https://message163.github.io/react-docs/react/css/css-modules.html#%E5%A6%82%E4%BD%95%E5%9C%A8vite%E4%B8%AD%E4%BD%BF%E7%94%A8css-modules)就是一种解决方案，但是我们需要借助一些工具来实现，比如`webpack`，`postcss`，`css-loader`，`vite`等。

### 维持类名

* 在样式文件中的某些样式，不希望被编译成css modules，可以设置为`global`，例如：

~~~typescript
//在使用的时候，就可以直接使用原始的类名 button
import styles from './index.module.scss';
const App: React.FC = () => {
  return (
    <>
      <div className={styles.app}>
        <button className='button'>按钮</button>
      </div>
    </>
  );
}
~~~

~~~scss
.app{
    background: red;
    width: 200px;
    height: 200px;
    :global(.button){
        background: blue;
        width: 100px;
        height: 100px;
    }
}
~~~

## css in js

* `css-in-js` 是将 CSS 代码 跟 JS 代码 混合在一起，通过 JS 来动态的生成 CSS 样式，但是这样的话与我们的认知是背道而驰的，正常应该是 CSS JS HTML 分离的，但是由于 CSS 缺乏作用域，所以形成了 `css-in-js` 这种写法，注意 `css-in-js` 并不是一种技术，而是一种思想。

### styled-components

~~~ bash
npm install styled-components
~~~

#### 语法

~~~typescript
import styled from 'styled-components';

const Button = styled.HTML标签`样式`
~~~

* 把props变为函数的参数进行传递，接收参数primary

~~~typescript
import styled from 'styled-components';
const Button = styled.button<{primary?: boolean}>`
   ${props => props.primary ? 'background: #6160F2;' : 'background: red;'};
   padding: 10px 20px;
   border-radius: 5px;
   color: white;
   cursor: pointer;
   margin: 10px;
   &:hover {
     color: black;
   }
`;
// primary参数
<Button primary>按钮</Button>
~~~

* `primary` 参数是 **props（属性）**，它允许你根据不同的条件来动态改变按钮的样式。

#### 继承

* 实现样式的复用，styled变成了函数，函数的参数是要继承的组件

~~~typescript
const ErrorButton = styled(Button)``// 反引号不能省略，即使内容为空

<ErrorButton>按钮</ErrorButton>
~~~

#### 属性

* 通过 `attrs` 来给组件添加属性

~~~typescript
interface DivComponentProps {
  defaultValue: string;
}
const InputComponent = styled.input.attrs<DivComponentProps>((props) => ({
  type: 'text',
  defaultValue: props.defaultValue,
}))`
 border:1px solid blue;
 margin:20px;
`
~~~

* arrtrs的参数可以是一个回调函数，回调函数的参数可以是props	




































