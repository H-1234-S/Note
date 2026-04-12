# 前端面试 - React篇

## 📌 目录
<details>
<summary>点击展开目录</summary>

- [1. React基础概念](#react基础概念)
- [2. React核心原理](#react核心原理)
- [3. 组件与生命周期](#组件与生命周期)
- [4. Hooks进阶](#hooks进阶)
- [5. 状态管理与通信](#状态管理与通信)
- [6. 性能优化](#性能优化)
- [7. React 18新特性](#react-18新特性)
- [8. React 19新特性](#react-19新特性)
- [9. 常见面试题](#常见面试题)
- [10. 手写代码](#手写代码)

</details>

---

## 1. React基础概念

### 1.1 React是什么？有什么特点？
**考点**：React基础认知

**React定义**：
- Facebook开发的用于构建用户界面的JavaScript库
- 专注于视图层（View层）
- 采用组件化开发模式

**核心特点**：

1. **虚拟DOM（Virtual DOM）**
   - 用JavaScript对象模拟真实DOM
   - 通过Diff算法最小化更新真实DOM
   - 提升渲染性能

2. **组件化**
   - 函数组件和类组件
   - 组件可复用、可组合
   - 单向数据流

3. **JSX**
   - JavaScript的语法扩展
   - 可以在JS中写HTML-like语法
   - 编译后变为createElement调用

4. **单向数据流**
   - 数据从父组件流向子组件（props）
   - 子组件不能直接修改props
   - 状态提升到公共祖先

**代码示例**：
```jsx
import React from 'react';

// 函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// JSX编译后
// React.createElement('h1', { props }, 'Hello, ', props.name);
```

---

### 1.2 React和Vue的区别？
**考点**：框架对比理解

| 特性 | React | Vue |
|-----|-------|-----|
| **核心定位** | UI库，专注视图 | 渐进式框架 |
| **模板语法** | JSX（JavaScript扩展） | 单文件组件（HTML模板） |
| **数据绑定** | 单向数据流 | 双向绑定（v-model） |
| **状态管理** | Props/Context/Redux | Vuex/Pinia |
| **更新机制** | 虚拟DOM + Diff | 虚拟DOM + Diff |
| **灵活性** | 更灵活（需要自己做选择） | 更上手简单（约定大于配置） |
| **生态** | 需要搭配其他库 | 官方提供路由、状态管理等 |
| **类型支持** | TypeScript支持好 | TypeScript支持好 |

**核心思想差异**：
- React：All in JavaScript，函数式编程思想
- Vue：模板语法，响应式数据绑定

---

### 1.3 虚拟DOM是什么？如何工作的？
**考点**：虚拟DOM核心原理

**虚拟DOM定义**：
- 用普通JavaScript对象描述真实DOM结构
- 是真实DOM的轻量级拷贝

**为什么需要虚拟DOM**：
1. 直接操作真实DOM开销大（重排、重绘）
2. 跨平台能力（SSR、Native等）
3. 方便实现一致性检查

**工作流程**：
```
1. 状态变化 → 创建新的虚拟DOM树
2. Diff算法 → 对比新旧虚拟DOM
3. 最小更新 → 只更新变化的部分到真实DOM
```

**简化Diff算法**：
1. 同层级节点比较（不会跨层比较）
2. 元素类型不同 → 替换整个节点
3. 元素类型相同 → 只更新属性
4. 列表项通过key区分（优化列表更新）

**代码示例**：
```javascript
// 虚拟DOM结构
const vdom = {
  type: 'div',
  props: { className: 'container' },
  children: [
    {
      type: 'h1',
      props: {},
      children: 'Hello'
    },
    {
      type: 'button',
      props: { onClick: () => {} },
      children: 'Click'
    }
  ]
};

// 编译成真实DOM
function createDOM(vdom) {
  const { type, props, children } = vdom;

  // 创建元素
  const element = document.createElement(type);

  // 设置属性
  Object.keys(props).forEach(key => {
    if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), props[key]);
    } else {
      element.setAttribute(key, props[key]);
    }
  });

  // 递归子节点
  children.forEach(child => {
    const childElement = typeof child === 'string'
      ? document.createTextNode(child)
      : createDOM(child);
    element.appendChild(childElement);
  });

  return element;
}
```

---

### 1.4 JSX是什么？有什么限制？
**考点**：JSX语法理解

**JSX定义**：
- JavaScript的语法扩展
- 让你可以在JS中写HTML-like代码
- 编译后变成`React.createElement()`调用

**JSX编译示例**：
```jsx
// JSX
const element = <h1 className="title">Hello, {name}!</h1>;

// 编译后
const element = React.createElement('h1', {
  className: 'title'
}, 'Hello, ', name, '!');
```

**JSX规则**：
1. **className代替class**（class是JavaScript保留字）
2. **htmlFor代替for**（for是JavaScript保留字）
3. **驼峰命名**（onClick、onChange等事件）
4. **单标签必须闭合**（`<img />`、`<input />`）
5. **必须有一个根元素**（或使用Fragment）
6. **{}中只能是表达式**，不能是语句

**Fragment使用**：
```jsx
// 需要Fragment包裹
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
}
```

---

### 1.5 元素和组件的区别？
**考点**：基础概念辨析

**React元素**：
- 不可变对象
- 描述真实DOM或组件
- `React.createElement()`的返回值
- 比作"虚拟DOM的最小单位"

```jsx
// 这是元素
const element = <h1>Hello</h1>;

// 元素是不可变的
element.props.children = 'World'; // ❌ 不要这样做
```

**React组件**：
- 可复用、独立的功能单元
- 接受props，返回元素
- 可以是函数或class

```jsx
// 函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 使用组件（会创建组件实例）
const element = <Welcome name="Alice" />;
```

**区别**：
| 特性 | 元素 | 组件 |
|-----|------|------|
| **本质** | 普通对象 | 函数或class |
| **可变性** | 不可变 | 可变（有自己的state） |
| **创建** | React.createElement | 函数调用/class new |
| **更新** | 重新创建 | 调用render或setState |

---

## 2. React核心原理

### 2.1 React的更新机制是怎样的？
**考点**：React核心渲染原理

**更新触发方式**：
1. `setState()`（类组件）
2. `useState()`的更新函数（函数组件）
3. `props`变化
4. `forceUpdate()`（类组件）

**更新流程（类组件）**：
```
setState() → 批量更新 → 组件更新 → render() → Diff → 更新DOM
```

**React 18前的 batching（自动批量）**：
- 只有React事件处理中的setState会批量更新
- 异步代码（setTimeout、Promise.then）中的setState不会批量

```javascript
// React 18前的问题
setTimeout(() => {
  this.setState({ count: this.state.count + 1 }); // 触发更新
  console.log(this.state.count); // 可能是旧值
}, 0);

// React 18后：所有setState都会自动批处理
```

**React 18后的自动批处理**：
```javascript
setTimeout(() => {
  setCount(c => c + 1); // 不触发更新
  setName('Alice');     // 合并为一次更新
  console.log('inside'); // 先执行
}, 0);
// 异步任务结束后才触发一次更新
```

---

### 2.2 setState是同步还是异步的？
**考点**：setState本质理解

**回答**：在React控制范围内是**异步**的，在React控制范围外是**同步**的

**React 18前的行为**：

```javascript
// React事件中 - 异步，批量更新
class Counter extends React.Component {
  handleClick = () => {
    this.setState({ count: 1 });
    console.log(this.state.count); // 0（旧值）
  };
}

// setTimeout/Promise中 - 同步，立即更新
class Counter extends React.Component {
  componentDidMount() {
    setTimeout(() => {
      this.setState({ count: 1 });
      console.log(this.state.count); // 1（新值）
    }, 0);
  }
}
```

**React 18后**：所有场景都是异步批处理

```javascript
// React 18后 - 统一行为
setTimeout(() => {
  this.setState({ count: 1 });
  console.log(this.state.count); // 0（异步）
}, 0);
```

**为什么setState是异步的**：
1. 避免频繁渲染，提升性能
2. 批量更新，合并多次setState

**如何获取最新值**：
```javascript
// 方法1：使用回调函数
this.setState((state) => ({ count: state.count + 1 }), () => {
  console.log(this.state.count); // 最新值
});

// 方法2：componentDidUpdate中获取

// 方法3：使用useState的函数式更新
setCount(prev => prev + 1); // 基于前一个状态计算
```

---

### 2.3 什么是Fiber架构？
**考点**：React 16+核心架构

**Fiber解决的问题**：
- React 15及以前：更新是同步的，一旦开始不能中断
- 大列表更新时，可能造成页面卡顿
- 无法优先级处理更新

**Fiber核心思想**：
1. **可中断** - 把渲染工作拆成小单元，可以暂停、恢复
2. **优先级** - 用户交互优先，背景更新可以延迟
3. **增量渲染** - 不需要一次性完成所有更新

**Fiber结构**：
```javascript
{
  // 标识符
  type: 'div', // 或函数组件
  key: null,

  // DOM相关
  stateNode: null, // 真实DOM节点

  // 链表结构
  child: null,      // 第一个子节点
  sibling: null,    // 下一个兄弟节点
  return: null,     // 父节点

  // 更新相关
  pendingProps: {}, // 新的props
  memoizedProps: {}, // 旧的props
  memoizedState: {}, // 旧的state

  // 优先级（不同任务有不同优先级）
  lanes: 0,
  childLanes: 0,
}
```

**两种工作阶段**：
1. **render阶段（可中断）**
   - 计算需要更新的内容
   - 构建Fiber树
   - 可以暂停和恢复

2. **commit阶段（不可中断）**
   - 应用更新到DOM
   - 必须一次性完成
   - 调用生命周期、hooks

---

### 2.4 React的Diff算法是怎样的？
**考点**：虚拟DOM核心算法

**Diff策略**：
1. **同层对比** - 只比较同一层级的节点，不跨层级比较
2. **不同类型节点** - 类型不同，直接替换
3. **同类型节点** - 类型相同，只更新属性
4. **列表对比** - 通过key标识节点

**对比规则**：
```
1. 不同类型的元素 → 卸载旧元素，挂载新元素
   <div> → <span> → 完全替换，删除重建

2. 同类型元素 → 只更新变化的属性
   <div className="before"> → <div className="after"> → 只更新className

3. 列表元素 → 通过key区分
   [1,2,3] → [1,3] → 通过key识别移动/删除/新增
```

**key的作用**：
```jsx
// 列表渲染必须加key
// 好的key：唯一、稳定
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// 不好的key：使用index
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// 使用index作为key可能导致的问题：
// [A,B,C] → [A,C] 删除B
// index: 0→A, 1→C (错误：C被当成B更新)
// id: A→A, C→C (正确)
```

**优化建议**：
1. 列表项使用唯一ID作为key
2. 避免使用index作为key（列表不变时可以）
3. 不要在render中对列表项使用随机值

---

### 2.5 React的事件机制是怎样的？
**考点**：合成事件系统

**合成事件（SyntheticEvent）**：
- React封装的跨浏览器事件对象
- 兼容所有浏览器
- 提供统一的API

**事件绑定原理**：
1. 所有事件挂在根容器上（root）
2. 事件触发时，通过事件冒泡找到对应组件
3. 触发组件上的事件处理函数

```jsx
// React 17之前
document.addEventListener('click', ...); // 挂在document上

// React 17之后
root.addEventListener('click', ...); // 挂在React根容器上
```

**事件分类**：
- 焦点事件：`onFocus`、`onBlur`
- 表单事件：`onChange`、`onSubmit`、`onInput`
- 鼠标事件：`onClick`、`onMouseEnter`
- 触摸事件：`onTouchStart`、`onTouchMove`
- 键盘事件：`onKeyDown`、`onKeyUp`
- 拖拽事件：`onDrag`、`onDrop`

**事件处理函数的this**：
```jsx
// 类组件中 - 需要bind或箭头函数
class App extends React.Component {
  handleClick() {
    console.log(this); // ❌ undefined（需要bind）
  }

  handleClick = () => {
    console.log(this); // ✅ 箭头函数，自动绑定
  }

  render() {
    return <button onClick={this.handleClick}>点击</button>;
  }
}
```

**事件参数e的问题**：
```jsx
// event是合成事件，跨浏览器兼容
function handleClick(e) {
  console.log(e.target);      // 真实DOM元素
  console.log(e.currentTarget); // 绑定事件的元素
  console.log(e.nativeEvent);  // 原生事件对象
  console.log(e.preventDefault());  // 阻止默认行为
  console.log(e.stopPropagation()); // 阻止冒泡

  // ⚠️ 异步访问需要persist()
  setTimeout(() => {
    console.log(e.target); // ❌ null（已被回收）
  }, 0);

  // 解决方案
  const handleClick = (e) => {
    e.persist(); // 保留引用
    setTimeout(() => {
      console.log(e.target); // ✅
    }, 0);
  };
}
```

---

## 3. 组件与生命周期

### 3.1 类组件和函数组件的区别？
**考点**：组件类型理解

| 特性 | 类组件 | 函数组件 |
|-----|--------|---------|
| **定义方式** | class继承React.Component | 普通函数 |
| **状态管理** | this.state + setState | useState |
| **生命周期** | 完整生命周期方法 | useEffect模拟 |
| **this指向** | 需要bind处理 | 无this问题 |
| **渲染逻辑** | render方法返回JSX | 函数直接返回JSX |
| **性能** | 每次调用创建新实例 | 每次渲染重新执行 |
| **Hooks支持** | ❌ 不支持 | ✅ 支持 |

**类组件**：
```jsx
class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div onClick={this.handleClick}>
        Hello, {this.props.name}
      </div>
    );
  }
}
```

**函数组件**：
```jsx
function Welcome({ name }) {
  return <div>Hello, {name}</div>;
}

// 或箭头函数
const Welcome = ({ name }) => <div>Hello, {name}</div>;
```

**现代React推荐**：
- 函数组件 + Hooks是现代React的标准
- 类组件正在被逐步淘汰
- 新项目应使用函数组件

---

### 3.2 React的生命周期有哪些？
**考点**：类组件生命周期（正在被Hooks替代，但仍是高频考点）

**挂载阶段（Mounting）**：
```
constructor → static getDerivedStateFromProps → render → componentDidMount
```

1. **constructor(props)**
   - 初始化state
   - 绑定事件处理函数
   - 不要调用setState

2. **render()**
   - 返回JSX
   - 纯函数，不应修改组件状态

3. **componentDidMount()**
   - 组件挂载后调用
   - 进行DOM操作、发起网络请求、设置订阅

**更新阶段（Updating）**：
```
props变化 → static getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate
state变化 → shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate
```

4. **static getDerivedStateFromProps(props, state)**
   - 从props派生state（很少用）
   - 返回新state对象或null

5. **shouldComponentUpdate(nextProps, nextState)**
   - 性能优化
   - 返回false可以阻止更新
   - 不要在此调用setState

6. **getSnapshotBeforeUpdate(prevProps, prevState)**
   - DOM更新前获取快照
   - 返回值传给componentDidUpdate

7. **componentDidUpdate(prevProps, prevState, snapshot)**
   - 组件更新后调用
   - 进行DOM操作
   - 必须在条件语句中调用setState

**卸载阶段（Unmounting）**：
```
componentWillUnmount
```

8. **componentWillUnmount()**
   - 组件卸载前调用
   - 清理定时器、取消订阅、解绑事件

**错误处理（Error Handling）**：
```
getDerivedStateFromError → componentDidCatch
```

9. **static getDerivedStateFromError(error)**
   - 子组件出错时调用
   - 返回新state显示降级UI

10. **componentDidCatch(error, info)**
    - 记录错误信息
    - 副作用操作

**生命周期图示**：
```
        ┌─────────────────────────────────────────────────┐
        │                   挂载阶段                        │
        └─────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
  constructor                             componentDidMount
        │                                           │
        └───────────────────┬───────────────────────┘
                            ▼
        ┌─────────────────────────────────────────────────┐
        │                   更新阶段                        │
        └─────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  props变化                              state变化
        │                                       │
        └───────────────┬───────────────────────┘
                        ▼
        ┌───────────────────────────────────────────┐
        │      static getDerivedStateFromProps      │
        └───────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────────┐
        │         shouldComponentUpdate             │
        │         (返回true继续，false停止)           │
        └───────────────────────────────────────────┘
                        │
                        ▼
                     render
                        │
                        ▼
        ┌───────────────────────────────────────────┐
        │         getSnapshotBeforeUpdate           │
        │         (DOM更新前获取快照)                │
        └───────────────────────────────────────────┘
                        │
                        ▼
                  componentDidUpdate
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
        ┌───────────────────────────────────────────┐
        │               卸载阶段                      │
        └───────────────────────────────────────────┘
                        │
                        ▼
             componentWillUnmount
```

---

### 3.3 组件通信方式有哪些？
**考点**：组件间数据传递

**1. Props（父→子）**：
```jsx
// 父组件
<ChildComponent name="Alice" age={18} />

// 子组件
function ChildComponent({ name, age }) {
  return <div>{name}, {age}</div>;
}
```

**2. 回调函数（子→父）**：
```jsx
// 父组件
function Parent() {
  const handleChildData = (data) => {
    console.log('来自子组件:', data);
  };
  return <Child onData={handleChildData} />;
}

// 子组件
function Child({ onData }) {
  return <button onClick={() => onData('some data')}>发送</button>;
}
```

**3. Context（跨层级）**：
```jsx
// 创建Context
const ThemeContext = React.createContext('light');

// Provider
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Consumer
function Toolbar() {
  return (
    <ThemeContext.Consumer>
      {theme => <div theme={theme}>Toolbar</div>}
    </ThemeContext.Consumer>
  );
}

// 或使用useContext
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div theme={theme}>Toolbar</div>;
}
```

**4. 发布订阅模式**：
```jsx
// 事件总线
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    (this.events[event] || (this.events[event] = [])).push(callback);
  }

  emit(event, ...args) {
    this.events[event]?.forEach(cb => cb(...args));
  }
}

export const eventBus = new EventBus();
```

**5. 全局状态管理（Redux/Zustand）**：
```jsx
// Redux示例
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; }
  }
});

export const { increment } = counterSlice.actions;
export const store = configureStore({ reducer: counterSlice.reducer });

// 组件中使用
function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(increment())}>
      Count: {count}
    </button>
  );
}
```

**6. URL参数（路由）**：
```jsx
// React Router
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  return <div>User ID: {id}</div>;
}
```

**通信方式对比**：
| 方式 | 适用场景 | 复杂度 |
|-----|---------|-------|
| Props | 父子通信 | 简单 |
| 回调 | 子→父通信 | 简单 |
| Context | 跨层级通信 | 中等 |
| 发布订阅 | 任意组件通信 | 中等 |
| 状态管理 | 全局状态 | 复杂 |
| URL | 页面间传参 | 简单 |

---

### 3.4 如何理解单向数据流？
**考点**：React核心设计思想

**单向数据流定义**：
- 数据只能从父组件流向子组件
- 子组件不能直接修改父组件传来的props
- 数据变化必须通过"向上通知"的方式

**数据流动示意**：
```
父组件 state
    │
    │ props
    ▼
子组件 props
    │
    │ props + 回调
    ▼
孙组件 props
```

**具体示例**：
```jsx
// 父组件管理状态
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      {/* 通过props传递数据和修改方法 */}
      <Child count={count} onIncrement={() => setCount(count + 1)} />
    </div>
  );
}

// 子组件使用props，不能直接修改
function Child({ count, onIncrement }) {
  return (
    <div>
      <p>Child: {count}</p>
      {/* 通过回调通知父组件修改 */}
      <button onClick={onIncrement}>增加</button>
    </div>
  );
}
```

**为什么单向数据流**：
1. **可追踪** - 数据变化路径清晰，易于调试
2. **可预测** - 状态变化有固定模式，容易理解
3. **易维护** - 数据源单一，修改不会混乱

**对比Vue的双向绑定**：
- Vue：数据变化会自动更新视图，视图变化也会更新数据
- React：必须显式调用setState来更新数据

---

## 4. Hooks进阶

### 4.1 useState的使用规则？
**考点**：Hooks基本用法

**基本用法**：
```jsx
const [state, setState] = useState(initialValue);

// setState的两种形式
setState(newValue);                    // 直接赋值
setState(prevState => newState);        // 函数形式（推荐，用于依赖前一个状态）
```

**函数式更新**：
```jsx
const [count, setCount] = useState(0);

// ❌ 不推荐：依赖外部状态
setCount(count + 1);
setCount(count + 1); // 可能有问题

// ✅ 推荐：函数式更新
setCount(prev => prev + 1);
setCount(prev => prev + 1); // 正确累加
```

**复杂状态（对象）**：
```jsx
const [user, setUser] = useState({ name: '', age: 0 });

// ⚠️ 对象需要展开合并
setUser({ ...user, name: 'Alice' });

// ✅ 或使用useReducer管理复杂状态
```

**初始化函数**（开销大的计算）：
```jsx
// 每次渲染都会执行 ❌
const [data, setData] = useState(expensiveCalculation(props));

// 只在初始化时执行一次 ✅
const [data, setData] = useState(() => expensiveCalculation(props));
```

**Hooks使用规则**：
1. **只在顶层调用** - 不要在循环、条件、嵌套函数中调用
2. **只在React函数中调用** - 函数组件、Custom Hook

**原因**：
- Hooks通过链表实现，顺序很重要
- 条件或循环会导致顺序不一致

```jsx
// ❌ 错误示例
function Component({ show }) {
  if (show) {
    const [name, setName] = useState(''); // 可能不执行
  }
  const [age, setAge] = useState(0); // 顺序改变，state错乱
}

// ✅ 正确示例
function Component({ show }) {
  const [name, setName] = useState(''); // 始终调用
  const [age, setAge] = useState(0);

  if (show) {
    // 条件逻辑放在hook内部
  }
}
```

---

### 4.2 useEffect的使用和清理？
**考点**：Hooks核心理解

**基本用法**：
```jsx
useEffect(() => {
  // 副作用逻辑

  return () => {
    // 清理函数
  };
}, [dependencies]);
```

**执行时机**：
- **没有依赖**：每次渲染后执行
- **空数组[]**：只在挂载时执行（类似componentDidMount）
- **有依赖[deps]**：依赖变化时执行

**常见使用场景**：

**1. 模拟componentDidMount（只执行一次）**：
```jsx
useEffect(() => {
  console.log('挂载完成');
  // API调用、订阅等
}, []);
```

**2. 模拟componentDidUpdate（依赖变化时）**：
```jsx
useEffect(() => {
  console.log('count变化了:', count);
}, [count]);
```

**3. 模拟componentWillUnmount（清理）**：
```jsx
useEffect(() => {
  const subscription = dataSource.subscribe();

  return () => {
    // 清理：取消订阅、清除定时器等
    subscription.unsubscribe();
  };
}, []);
```

**4. 异步请求**：
```jsx
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();

    // 防止在组件卸载后设置状态
    if (!cancelled) {
      setUser(data);
    }
  }

  fetchData();

  return () => {
    cancelled = true;
  };
}, [userId]);
```

**常见错误**：
```jsx
// ❌ 常见错误：在useEffect中直接使用async
useEffect(async () => {
  const data = await fetchAPI();
  setData(data);
}, []);

// ✅ 正确做法：定义async函数再调用
useEffect(() => {
  async function fetchData() {
    const data = await fetchAPI();
    setData(data);
  }

  fetchData();
}, []);
```

**依赖数组注意事项**：
```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  console.log(count);
}, [count]); // ✅ 正确：只依赖count

// ❌ 常见错误：依赖数组漏写
useEffect(() => {
  console.log(count);
}, []); // count变了不会重新执行

// ❌ 常见错误：依赖不必要的值
useEffect(() => {
  console.log(count);
}, [count, name]); // count和name变化都会触发
```

---

### 4.3 useMemo和useCallback的区别？
**考点**：性能优化Hooks

**useMemo** - 缓存**值**
```jsx
const memoizedValue = useMemo(() => {
  //  expensiveCalculation
  return computeExpensiveValue(a, b);
}, [a, b]);
```

**useCallback** - 缓存**函数引用**
```jsx
const memoizedCallback = useCallback(() => {
  return doSomething(a, b);
}, [a, b]);
```

**等价关系**：
```jsx
// 这两段代码是等价的
useCallback(fn, deps)
useMemo(() => fn, deps)
```

**使用场景**：

**1. 避免不必要的计算**：
```jsx
function ExpensiveList({ data, filter }) {
  // 只有data或filter变化时才重新计算
  const filteredData = useMemo(() => {
    console.log('计算过滤');
    return data.filter(item => item.name.includes(filter));
  }, [data, filter]);

  return <List items={filteredData} />;
}
```

**2. 避免子组件不必要的渲染**：
```jsx
function Parent({ id }) {
  const [count, setCount] = useState(0);

  // 每次渲染都创建新函数 ❌
  const handleClick = () => console.log('click');

  // 缓存函数引用 ✅
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  // 依赖id的函数
  const fetchData = useCallback(() => {
    fetch(`/api/user/${id}`);
  }, [id]);

  return (
    <>
      <Child onClick={handleClick} />
      <DataFetcher onFetch={fetchData} />
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </>
  );
}
```

**3. 配合React.memo使用**：
```jsx
const Child = React.memo(({ name, onClick }) => {
  console.log('Child渲染');
  return <button onClick={onClick}>{name}</button>;
});

// 不使用useCallback时
// 父组件count变化，Child会不必要的渲染（因为onClick每次都是新函数）

// 使用useCallback后
// 只有onClick变化时Child才渲染
const handleClick = useCallback(() => {
  doSomething();
}, []);

<Child name="Alice" onClick={handleClick} />
```

**过度使用的陷阱**：
```jsx
// ❌ 过度使用：没有性能问题的地方也用
const value = useMemo(() => x + y, [x, y]); // 普通加法不需要缓存

// ✅ 正确：确实有性能问题时才用
const expensiveValue = useMemo(() => expensiveCalculation(data), [data]);
```

---

### 4.4 useRef的使用场景？
**考点**：Hooks进阶

**基本用法**：
```jsx
const ref = useRef(initialValue);

// 访问
ref.current // 获取值

// 修改
ref.current = newValue
```

**场景1：存储不需要触发渲染的值**：
```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return <div>{count}</div>;
}
```

**场景2：访问DOM元素**：
```jsx
function InputFocus() {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus(); // 直接操作DOM
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>聚焦</button>
    </div>
  );
}
```

**场景3：保存上一个props/state值**：
```jsx
function UpdateLogger({ value }) {
  const prevValueRef = useRef();

  useEffect(() => {
    prevValueRef.current = value;
  });

  return (
    <div>
      <p>当前: {value}</p>
      <p>上次: {prevValueRef.current}</p>
    </div>
  );
}
```

**场景4：强制更新组件**：
```jsx
function ForceUpdate() {
  const [, forceUpdate] = useState({});

  return (
    <button onClick={() => forceUpdate({})}>
      强制更新
    </button>
  );
}
```

**ref和state的区别**：
| 特性 | useRef | useState |
|-----|--------|----------|
| 更新是否触发渲染 | ❌ 否 | ✅ 是 |
| 适合存储 | 计时器ID、DOM引用 | UI相关状态 |
| 后续渲染值 | 保持 | 更新 |

---

### 4.5 useReducer是什么？什么时候用？
**考点**：复杂状态管理

**基本用法**：
```jsx
const [state, dispatch] = useReducer(reducer, initialState);

// reducer函数
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}
```

**useState vs useReducer**：
| 场景 | 推荐 |
|-----|------|
| 简单状态（数值、字符串） | useState |
| 复杂状态（多个相关值、对象） | useReducer |
| 状态变化逻辑简单 | useState |
| 状态变化逻辑复杂（多个action） | useReducer |
| 需要调试状态变化 | useReducer |

**计数器示例对比**：
```jsx
// useState版本
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}

// useReducer版本
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
```

**复杂表单示例**：
```jsx
function Form() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '',
    email: '',
    errors: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(state)) {
      submitForm(state);
    } else {
      dispatch({ type: 'SET_ERRORS', payload: { name: '必填' } });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.name}
        onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
      />
      {/* ... */}
    </form>
  );
}
```

---

### 4.6 自定义Hooks是什么？如何使用？
**考点**：Hooks组合复用

**自定义Hook规则**：
1. 函数名以`use`开头
2. 内部可以使用其他Hooks
3. 用于复用有状态的逻辑

**常见自定义Hooks示例**：

**1. useLocalStorage**：
```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', '');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

**2. useFetch**：
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();

        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  return <div>{data.name}</div>;
}
```

**3. useDebounce**：
```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**4. usePrevious**：
```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div>
      <p>当前: {count}</p>
      <p>上次: {previousCount}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

---

## 5. 状态管理与通信

### 5.1 Redux的核心概念？
**考点**：状态管理基础

**Redux三原则**：
1. **单一数据源** - 整个应用只有一个store
2. **State只读** - 不能直接修改state，要通过action
3. **纯函数修改** - reducer必须是纯函数

**核心概念**：

1. **Store** - 存储状态的容器
   ```javascript
   import { createStore } from 'redux';
   const store = createStore(rootReducer);
   ```

2. **Action** - 描述"发生了什么"
   ```javascript
   const action = {
     type: 'ADD_TODO',
     payload: { text: 'Learn Redux' }
   };
   ```

3. **Reducer** - 根据action计算新状态
   ```javascript
   function todoReducer(state = [], action) {
     switch (action.type) {
       case 'ADD_TODO':
         return [...state, action.payload];
       default:
         return state;
     }
   }
   ```

4. **Dispatch** - 触发action
   ```javascript
   store.dispatch({ type: 'ADD_TODO', payload: { text: 'Learn Redux' } });
   ```

**数据流**：
```
用户交互 → dispatch(action) → reducer处理 → 返回新state → 通知订阅者
```

**React-Redux使用**：
```jsx
import { Provider, useSelector, useDispatch } from 'react-redux';

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

function Counter() {
  const count = useSelector(state => state.counter.count);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  );
}
```

---

### 5.2 Redux Toolkit是什么？解决了什么问题？
**考点**：Redux现代用法

**解决的问题**：
1. **样板代码过多** - 每个action都要写type、payload
2. **复杂store配置** - 需要combineReducers、thunk等中间件
3. **immutable更新** - 容易写错

**RTK核心API**：

**1. configureStore** - 简化store配置
```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

**2. createSlice** - 自动生成action和reducer
```javascript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // ✅ 可以直接修改（Immer）
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

**3. createAsyncThunk** - 处理异步逻辑
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { entities: [], loading: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.entities.push(action.payload);
        state.loading = 'idle';
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload;
      });
  },
});
```

---

### 5.3 Context API的使用和注意事项？
**考点**：React内置状态传递

**基本用法**：
```jsx
// 1. 创建Context
const ThemeContext = React.createContext('light');

// 2. Provider提供值
function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Main />
    </ThemeContext.Provider>
  );
}

// 3. Consumer或useContext消费
function Button() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button className={theme} onClick={() => setTheme('light')}>
      Switch Theme
    </button>
  );
}
```

**多个Context**：
```jsx
// 分别提供
<AuthContext.Provider value={auth}>
  <ThemeContext.Provider value={theme}>
    <Content />
  </ThemeContext.Provider>
</AuthContext.Provider>

// 或合并
const AppContext = React.createContext({});
<AppContext.Provider value={{ auth, theme }}>
```

**注意事项**：
1. **Context会引起不必要的重渲染**
   ```jsx
   // ❌ 问题：Provider每次渲染都创建新对象
   <Context.Provider value={{ obj: { a: 1 } }}>

   // ✅ 解决：使用useMemo缓存
   const value = useMemo(() => ({ obj: { a: 1 } }), []);
   <Context.Provider value={value}>
   ```

2. **适合存储"全局"但"不常变"的数据**
   - 主题、语言、用户信息
   - 不适合存储频繁变化的数据（表单输入等）

3. **无法精确订阅某个属性**
   - 任何context变化都会触发重渲染

**useContext注意事项**：
```jsx
function ThemeButton() {
  // ❌ 错误：在回调中调用useContext
  const button = useContext(ThemeContext).button;

  // ✅ 正确：解构出需要的值
  const { button } = useContext(ThemeContext);

  return <button className={button.className}>Click</button>;
}
```

---

## 6. 性能优化

### 6.1 React性能优化手段有哪些？
**考点**：性能优化实践

**1. 避免不必要的渲染**：

```jsx
// 类组件：shouldComponentUpdate
classoptimizedComponent extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== this.props.value;
  }
}

// 函数组件：React.memo
const MemoizedComponent = React.memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});

// 更精细的对比
const MemoizedComponent = React.memo(
  MyComponent,
  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value;
  }
);
```

**2. 使用useMemo/useCallback**：
```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // 缓存计算结果
  const expensiveValue = useMemo(() => {
    return heavyCalculation(count);
  }, [count]);

  // 缓存回调函数
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);

  return <Child onClick={handleClick} value={expensiveValue} />;
}
```

**3. 列表渲染优化**：
```jsx
// ✅ 使用key
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// ✅ 组件拆分
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

function ListItem({ item }) {
  // 只有这个item变化才渲染
  return <li>{item.name}</li>;
}
```

**4. 懒加载**：
```jsx
// 组件懒加载
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// 图片懒加载
<img loading="lazy" src={src} />
```

**5. 合理拆分组件**：
```jsx
// ❌ 一个大组件
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div>
      <NameInput value={name} onChange={setName} />
      <EmailInput value={email} onChange={setEmail} />
    </div>
  );
}

// ✅ 拆分独立组件（减少渲染范围）
function NameInput({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

**6. 使用Fragment减少DOM层级**：
```jsx
// ❌ 多余的div包裹
return (
  <div>
    {items.map(item => (
      <div key={item.id}>
        <span>{item.name}</span>
        <span>{item.desc}</span>
      </div>
    ))}
  </div>
);

// ✅ 使用Fragment
return (
  <>
    {items.map(item => (
      <Fragment key={item.id}>
        <span>{item.name}</span>
        <span>{item.desc}</span>
      </Fragment>
    ))}
  </>
);
```

---

### 6.2 React.memo和PureComponent的区别？
**考点**：性能优化组件对比

| 特性 | React.memo | PureComponent |
|-----|------------|----------------|
| **组件类型** | 函数组件 | 类组件 |
| **比较方式** | 浅比较props | 浅比较props和state |
| **默认比较** | 全部props | 全部props和state |
| **自定义比较** | 支持第二个参数 | 需要重写shouldComponentUpdate |

**React.memo**：
```jsx
// 基本用法（函数组件）
const MyComponent = React.memo(function MyComponent({ name, age }) {
  return <div>{name}, {age}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ name, age }) {
    return <div>{name}, {age}</div>;
  },
  (prevProps, nextProps) => {
    // 返回true表示不需要重新渲染
    return prevProps.name === nextProps.name;
  }
);
```

**PureComponent**：
```jsx
// 类组件
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.name}, {this.props.age}</div>;
  }
}
```

**注意事项**：
1. 都是**浅比较**
2. 对象/数组属性可能造成问题
   ```jsx
   // ❌ 问题：每次渲染都是新对象
   <MemoizedComponent style={{ color: 'red' }} />

   // ✅ 解决：使用useMemo或外部定义
   const style = useMemo(() => ({ color: 'red' }), []);
   <MemoizedComponent style={style} />
   ```

---

### 6.3 如何排查React性能问题？
**考点**：性能调试能力

**React DevTools Profiler**：
1. 打开Chrome DevTools → Components → Profiler
2. 记录渲染过程
3. 查看哪些组件渲染了、耗时多久

**React DevTools - Components**：
- 查看组件props、state
- 高亮更新时重新渲染的组件

**console.log调试**：
```jsx
// 在render中添加日志
function MyComponent({ data }) {
  console.log('MyComponent渲染', data);
  return <div>{data}</div>;
}

// 使用useEffect观察副作用
useEffect(() => {
  console.log('count变化了:', count);
}, [count]);
```

**性能指标**：
```jsx
// 使用React Profiler API
<Profiler id="Navigation" onRender={onRenderCallback}>
  <Navigation />
</Profiler>

function onRenderCallback(
  id, // 组件id
  phase, // 'mount' | 'update'
  actualDuration, // 实际渲染时间
  baseDuration, // 估算渲染时间
  startTime, // 开始时间
  commitTime, // 提交时间
) {
  console.log(`${id} ${phase}:`, {
    actualDuration,
    baseDuration,
  });
}
```

**常见性能陷阱**：
1. 每次渲染创建新对象/数组/函数
2. 列表没有key或key不正确
3. 过度使用Context
4. 不必要的重渲染

---

## 7. React 18新特性

### 7.1 React 18有哪些新特性？
**考点**：React最新版本特性

**1. 自动批处理（Automatic Batching）**：
```jsx
// React 17前：需要手动处理
// React 18后：所有setState自动批处理

setTimeout(() => {
  setCount(c => c + 1);
  setName('Alice'); // 这两个setState会合并为一次渲染
}, 0);
```

**2. Concurrent Rendering（并发渲染）**：
- 新的并发模式
- 可中断的渲染
- 更好的用户体验

**3. useTransition**：
```jsx
import { useTransition } from 'react';

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 标记为非紧急更新
    startTransition(() => {
      setQuery(e.target.value);
    });
  };

  // isPending可以显示loading状态
  return (
    <div>
      <input onChange={handleChange} />
      {isPending ? <Loading /> : <Results query={query} />}
    </div>
  );
}
```

**4. useDeferredValue**：
```jsx
import { useDeferredValue } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // 可以在deferredQuery变化时显示旧数据
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Results query={deferredQuery} />
    </div>
  );
}
```

**5. Suspense for Data Fetching**：
```jsx
// 新的Suspense能力
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Profile />
    </Suspense>
  );
}
```

**6. 新的Root API**：
```jsx
// React 17
import ReactDOM from 'react-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

**7. 新的Hooks**：
- `useId` - 生成唯一ID
- `useSyncExternalStore` - 外部store订阅
- `useInsertionEffect` - CSS-in-JS库使用

---

### 7.2 什么是Concurrent Mode？
**考点**：React并发渲染

**解决的问题**：
1. **可中断渲染** - 大列表渲染不会阻塞主线程
2. **优先级调度** - 用户交互优先，响应更快
3. **可暂停/恢复** - 可以在渲染过程中中断

**与同步模式的区别**：
```
同步模式：
[开始渲染] → [完成渲染] → [可以交互]
     │
     └────────────────── (渲染期间无法响应用户)

并发模式：
[开始渲染] → [用户点击] → [暂停渲染] → [处理点击] → [恢复渲染]
     │
     └──────────────────────────────────────── (响应用户更快)
```

**实际应用**：
```jsx
// useTransition - 标记非紧急更新
function App() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // 这个更新会被标记为可中断的
    startTransition(() => {
      setQuery(input.value);
    });
  }
}

// useDeferredValue - 延迟值
function Typeahead() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // deferredQuery变化不会阻塞输入
  return <Results query={deferredQuery} />;
}
```

---

## 8. React 19新特性

### 8.1 React 19有哪些主要新特性？
**考点**：React 19核心变化

**React 19 于 2024年12月正式发布**

**1. React Compiler（原React Forget）**：
- 自动将组件转换为符合编译时规则的代码
- 不再需要手动useMemo、useCallback
- 显著提升性能，减少重新渲染

```jsx
// React 19 Compiler 自动优化
function ProductPage({ product, addToCart }) {
  return (
    <div>
      <ProductDetails product={product} />
      <button onClick={() => addToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
}
// React Compiler 自动添加 memoization
```

**2. Actions（操作）**：
- 简化表单和异步操作
- 自动处理pending状态、错误处理、乐观更新

**useActionState**：
```jsx
import { useActionState } from 'react';

async function submitForm(prevState, formData) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
  });
  return await response.json();
}

function Form() {
  const [state, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**useFormStatus**：
```jsx
import { useFormStatus } from 'react';

function SubmitButton() {
  const { pending, method, action, data } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

function Form() {
  return (
    <form action={async (formData) => {
      await fetch('/api/submit', { method: 'POST', body: formData });
    }}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

**3. use() Hook**：
- 可以在Hooks中使用Promise和Context
- 支持条件调用（不再是顶层调用）

```jsx
import { use, Suspense } from 'react';

// 使用Promise
function UserProfile({ userPromise }) {
  const user = use(userPromise); // 类似await，但不会阻塞渲染

  return <div>{user.name}</div>;
}

// 使用Context
function ThemeProvider({ theme, children }) {
  const context = use(ThemeContext);
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// 条件调用（React 19新增）
function Comments({ commentsPromise, showComments }) {
  // ✅ use()允许条件调用
  const comments = showComments ? use(commentsPromise) : null;

  return (
    <div>
      <h1>Comments</h1>
      {comments && <CommentList comments={comments} />}
    </div>
  );
}
```

**4. Server Components（服务端组件）**：
- 组件默认在服务端渲染
- 减少客户端JavaScript体积
- 直接访问服务端资源（数据库、文件系统）

```jsx
// Server Component - 默认在服务端渲染
async function UserList() {
  // 直接访问数据库，不需要API
  const users = await db.query('SELECT * FROM users');

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Client Component - 需要交互
'use client'; // 标记为客户端组件
function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

**5. 改进的ref处理**：
- ref可以作为prop直接传递
- 不再需要forwardRef（但仍支持）

```jsx
// React 18 - 需要forwardRef
const Button = React.forwardRef((props, ref) => {
  return <button ref={ref}>{props.children}</button>;
});

// React 19 - ref作为普通prop
function Button({ ref, children }) {
  return <button ref={ref}>{children}</button>;
}
// 或直接使用
function Button({ children }) {
  return <button>{children}</button>;
}

// ref通过props传递
<Button ref={buttonRef}>Click</Button>
```

**6. 新的Meta标签API**：
```jsx
function ProductPage() {
  return (
    <>
      <title>Product Name</title>
      <meta name="description" content="Product description" />
      <link rel="canonical" href="https://example.com/product" />
      <html lang="en" />
      <body>
        <ProductDetails />
      </body>
    </>
  );
}
```

**7. 样式表支持**：
```jsx
function Component() {
  return (
    <>
      <style>{`
        .button {
          background: blue;
        }
      `}</style>
      <button className="button">Click</button>
    </>
  );
}

// 样式优先级自动处理
function CSSInJS() {
  return (
    <>
      <link rel="stylesheet" href="base.css" precedence="default" />
      <link rel="stylesheet" href="theme.css" precedence="high" />
      <div className="theme">Themed Content</div>
    </>
  );
}
```

**8. 资源预加载API**：
```jsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

function App() {
  return (
    <>
      {/* 预加载DNS */}
      <link rel="dns-prefetch" href="https://api.example.com" />
      {/* 预连接 */}
      <link rel="preconnect" href="https://cdn.example.com" />
      {/* 预加载资源 */}
      <link rel="preload" href="/fonts/custom.woff2" as="font" />
      {/* 预初始化脚本 */}
      <script dangerouslySetInnerHTML={{ __html: `
        __INITIAL_STATE__ = ${JSON.stringify(data)};
      `}} />
    </>
  );
}
```

**9. 改进的错误处理**：
```jsx
// ErrorBoundary支持更多场景
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // React 19提供更详细的错误信息
    console.log('Error:', error);
    console.log('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;
    }
    return this.props.children;
  }
}
```

**10. Web Components支持**：
```jsx
function WebComponentWrapper() {
  return (
    <custom-element
      prop1="value"
      onEvent={() => console.log('event')}
    />
  );
}
```

---

### 8.2 React 19和React 18的区别？
**考点**：版本对比理解

| 特性 | React 18 | React 19 |
|-----|----------|----------|
| **编译器** | 无 | React Compiler（自动优化） |
| **表单处理** | 手动处理 | Actions（useActionState、useFormStatus） |
| **Promise处理** | 需要useEffect+state | use() Hook直接使用 |
| **ref处理** | 需要forwardRef | ref作为普通prop |
| **Server Components** | 实验性 | 正式支持 |
| **条件Hooks** | ❌ 不允许 | ✅ 允许（use()） |
| **错误处理** | 基础 | 改进的组件栈信息 |

**迁移建议**：
1. **逐步升级** - 先升级到React 18确保兼容
2. **移除forwardRef** - 改用ref作为prop
3. **采用Actions** - 简化表单处理
4. **安装React Compiler** - 自动性能优化

---

### 8.3 React Compiler是什么？如何使用？
**考点**：React 19核心编译器

**React Compiler（原名React Forget）**：
- 自动为组件添加memoization
- 确保组件符合规则（纯函数、不 mutate state）
- 编译时优化，减少运行时开销

**解决的问题**：
```jsx
// 之前：需要手动优化
function ProductList({ products, filter }) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  const handleClick = useCallback((id) => {
    dispatch({ type: 'SELECT', id });
  }, []);

  return (
    <ul>
      {filteredProducts.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onClick={handleClick}
        />
      ))}
    </ul>
  );
}

// React Compiler：自动优化
function ProductList({ products, filter }) {
  const filteredProducts = products.filter(p => p.category === filter);

  return (
    <ul>
      {filteredProducts.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onClick={() => dispatch({ type: 'SELECT', id: product.id })}
        />
      ))}
    </ul>
  );
}
```

**使用条件**：
```jsx
// 编译器只优化"合规"的组件
// 合规组件的特点：
// 1. 不直接修改state（通过setState）
// 2. 不修改props或外部变量
// 3. 组件是纯函数

// 违规示例（会导致编译错误）
function BadComponent({ items }) {
  const [count, setCount] = useState(0);

  // ❌ 直接修改外部变量
  window.count = count;

  // ❌ 直接修改props
  items.push('new');

  return <div>{count}</div>;
}
```

**配置**：
```bash
# 安装
npm install @babel/plugin-react-compiler

# babel.config.js
module.exports = {
  plugins: [
    ['@babel/plugin-react-compiler', {
      // 启用严格模式
      runtime: 'automatic',
    }],
  ],
};
```

---

## 9. 常见面试题

### 9.1 React中的key有什么作用？
**考点**：列表渲染核心

**key的作用**：
1. **标识列表项** - 帮助React识别哪些元素变化了
2. **优化Diff** - 避免不必要的DOM操作
3. **维持组件状态** - 正确的key避免状态错乱

**使用原则**：
1. **唯一性** - 同一列表中key不能重复
2. **稳定性** - key在多次渲染间应该保持稳定
3. **优先使用ID** - 比index更可靠

**错误示例**：
```jsx
// ❌ 使用index可能导致问题
{items.map((item, index) => (
  <ListItem key={index} item={item} />
))}

// 问题场景：
// 初始: [A, B, C] → keys: [0, 1, 2]
// 删除A: [B, C]   → keys: [0, 1] → B和C被当作新元素
```

**正确示例**：
```jsx
// ✅ 使用唯一ID
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// ✅ 使用组合key
{items.map(item => (
  <ListItem key={`${item.id}-${item.version}`} item={item} />
))}
```

**特殊场景**：
```jsx
// 可以使用index的情况：
// 1. 列表是静态的，不会变化
// 2. 列表不会重新排序
// 3. 列表项不会被删除或新增
const StaticList = () => (
  <ul>
    {['a', 'b', 'c'].map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
```

---

### 9.2 为什么虚拟DOM能提升性能？
**考点**：虚拟DOM核心原理

**直接操作DOM的问题**：
1. **开销大** - DOM操作涉及重排、重绘
2. **跨平台难** - 直接绑定特定平台
3. **难以追踪** - 手动操作DOM，状态不可预测

**虚拟DOM的优势**：
1. **批量操作** - 多次DOM变化合并为一次
2. **跨平台** - 同一套虚拟DOM可以渲染到不同平台
3. **可追踪** - 状态变化 → 虚拟DOM变化 → DOM变化

**性能对比**：
```javascript
// 直接操作DOM（可能每次都触发重排）
function update() {
  div1.style.color = 'red';
  div2.style.color = 'blue';
  div3.style.color = 'green';
}

// 虚拟DOM
// 1. 生成新的虚拟DOM树
// 2. Diff对比
// 3. 批量应用变化到真实DOM
```

**什么时候虚拟DOM反而慢**：
1. **大量静态内容** - 不需要diff
2. **简单界面** - 虚拟DOM开销大于收益
3. **极致性能要求** - 可以直接操作DOM

---

### 9.3 React中的受控组件和非受控组件？
**考点**：表单处理方式

**受控组件（Controlled Component）**：
- 表单数据由React state管理
- value由props传入
- 状态变化通过onChange事件

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 数据流：用户输入 → onChange → setState → 组件重新渲染 → input显示新value
```

**非受控组件（Uncontrolled Component）**：
- 表单数据由DOM本身管理
- 使用ref获取DOM元素的值
- 不需要双向绑定

```jsx
function UncontrolledInput() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    console.log(inputRef.current.value); // 直接获取DOM值
  };

  return (
    <div>
      <input ref={inputRef} defaultValue="hello" />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

**对比**：
| 特性 | 受控组件 | 非受控组件 |
|-----|---------|-----------|
| **数据管理** | React state | DOM自身 |
| **获取值** | 通过state | 通过ref |
| **实时验证** | 方便 | 需要手动 |
| **适合场景** | 需要实时处理输入 | 简单表单、文件上传 |

**实际建议**：
- 大多数情况使用受控组件
- 非受控组件适合：文件上传、第三方表单库集成

---

### 9.4 如何理解React的"约定大于配置"？
**考点**：React设计思想

**约定vs配置**：
- **配置** - 需要显式声明（Vuex mutation types、Redux action types）
- **约定** - 有默认的命名和结构（React Hooks规则、文件组织）

**React的"约定"示例**：
1. **组件名大写** - `<MyComponent />`
2. **use前缀** - `useState`、`useEffect`
3. **文件组织约定** - components/、hooks/、utils/
4. **Hooks使用规则** - 顶层调用、只在React函数中

**与Vue对比**：
```jsx
// React - 约定驱动
function useAuth() {
  const [user, setUser] = useState(null);
  // 自定义hook，约定用use开头
  return { user };
}

// Vue - 配置驱动（更明显）
// store
const store = createStore({
  state: { user: null },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    }
  }
});
```

**约定的优势**：
1. **上手更快** - 有统一模式
2. **代码一致性** - 团队协作更顺畅
3. **维护成本低** - 容易理解他人代码

---

### 9.5 React的未来发展趋势？
**考点**：技术视野

**当前趋势**：
1. **Server Components** - 服务端渲染组件
   - 减少客户端JavaScript体积
   - 数据获取更简单

2. **Concurrent Mode完善** - 并发模式
   - useTransition/useDeferredValue普及
   - 自动批处理成为默认

3. **ReactForget** - 自动记忆化
   - 不需要手动useMemo/useCallback
   - 编译器自动优化

4. **更好的DevTools** - 开发工具改进

5. **Suspense增强** - 数据获取的Suspense

**学习建议**：
1. 深入理解Hooks和函数组件
2. 掌握React 18新特性
3. 了解Server Components概念
4. 关注React团队博客和RFC

---

## 10. 手写代码

### 10.1 手写useState
**考点**：Hooks原理实现

```javascript
let hookIndex = 0; // 全局hook索引
const allStates = []; // 存储所有state

function useState(initialState) {
  const currentIndex = hookIndex;

  // 初始化state
  if (allStates[currentIndex] === undefined) {
    allStates[currentIndex] = typeof initialState === 'function'
      ? initialState()
      : initialState;
  }

  // 获取当前state和setState
  const state = allStates[currentIndex];

  const setState = (newState) => {
    // 支持函数式更新
    const nextState = typeof newState === 'function'
      ? newState(allStates[currentIndex])
      : newState;

    // 只有值变化才更新
    if (nextState !== allStates[currentIndex]) {
      allStates[currentIndex] = nextState;

      // 触发重新渲染
      render();
    }
  };

  // 移动到下一个hook
  hookIndex++;

  return [state, setState];
}

// 简化版render
function render() {
  hookIndex = 0; // 每次渲染重置索引
  // ReactDOM.render(...) 实际渲染逻辑
}
```

---

### 10.2 手写useEffect
**考点**：副作用管理原理

```javascript
let effectIndex = 0;
const effects = []; // 存储所有effect
const cleanups = []; // 存储所有cleanup函数

function useEffect(effect, deps) {
  const currentIndex = effectIndex;

  // 获取上一次的effect和cleanup
  const prevEffect = effects[currentIndex];
  const prevCleanup = cleanups[currentIndex];

  // 判断是否需要执行
  if (prevEffect) {
    const prevDeps = prevEffect.deps;

    // 检查依赖是否变化
    const hasChanged = deps
      ? !prevDeps || deps.some((dep, i) => dep !== prevDeps[i])
      : true;

    if (hasChanged) {
      // 执行cleanup
      if (prevCleanup) {
        prevCleanup();
      }

      // 执行effect，保存cleanup函数
      cleanups[currentIndex] = effect();
    }
  } else {
    // 首次渲染，执行effect
    cleanups[currentIndex] = effect();
  }

  // 保存effect信息
  effects[currentIndex] = { effect, deps };

  // 移动到下一个effect
  effectIndex++;
}

// cleanup执行时机示例
function Component() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('interval');
    }, 1000);

    // 返回cleanup函数
    return () => clearInterval(timer);
  }, []);

  // 组件卸载时自动执行cleanup
}
```

---

### 10.3 手写useMemo/useCallback
**考点**：记忆化原理

```javascript
// 存储上一次的计算结果和依赖
let memoIndex = 0;
const memoValues = []; // { value, deps }

function useMemo(factory, deps) {
  const currentIndex = memoIndex;
  const prevMemo = memoValues[currentIndex];

  if (prevMemo) {
    const [prevValue, prevDeps] = [prevMemo.value, prevMemo.deps];

    // 依赖没变，返回缓存
    if (deps && deps.every((dep, i) => dep === prevDeps[i])) {
      memoIndex++;
      return prevValue;
    }
  }

  // 依赖变了，重新计算
  const newValue = factory();
  memoValues[currentIndex] = { value: newValue, deps };

  memoIndex++;
  return newValue;
}

// useCallback就是useMemo的语法糖
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

// render时重置索引
function render() {
  memoIndex = 0;
}
```

---

### 10.4 手写React.memo
**考点**：高阶组件原理

```javascript
function memo(Component, compare) {
  // 返回一个新组件
  return function MemoizedComponent(props) {
    // 1. 获取上一次的props
    const prevProps = useRef(null);

    // 2. 判断是否需要渲染
    let shouldRender = true;

    if (prevProps.current) {
      // 有上一次的props，进行比较
      if (compare) {
        // 自定义比较函数
        shouldRender = !compare(prevProps.current, props);
      } else {
        // 默认浅比较
        shouldRender = !shallowEqual(prevProps.current, props);
      }
    }

    // 3. 渲染或复用
    if (shouldRender) {
      prevProps.current = props;
      return <Component {...props} />;
    }

    // 不渲染，返回上一次的渲染结果
    return prevProps.current_rendered;
  };
}

// 浅比较辅助函数
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}
```

---

### 10.5 手写简易Redux
**考点**：状态管理原理

```javascript
// createStore - 创建store
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];

  // 获取状态
  function getState() {
    return state;
  }

  // 订阅
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  // 派发action
  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  }

  return { getState, subscribe, dispatch };
}

// combineReducers - 合并reducers
function combineReducers(reducers) {
  return function combinedReducer(state = {}, action) {
    const nextState = {};

    for (const key in reducers) {
      const reducer = reducers[key];
      const prevStateForKey = state[key];
      const nextStateForKey = reducer(prevStateForKey, action);
      nextState[key] = nextStateForKey;
    }

    return nextState;
  };
}

// 使用示例
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

const store = createStore(counterReducer);

store.subscribe(() => {
  console.log('状态变化:', store.getState());
});

store.dispatch({ type: 'INCREMENT' }); // { count: 1 }
store.dispatch({ type: 'INCREMENT' }); // { count: 2 }
store.dispatch({ type: 'DECREMENT' }); // { count: 1 }
```

---

### 10.6 手写高阶组件（HOC）
**考点**：组件模式

```javascript
// 高阶组件是接收组件并返回新组件的函数

// 示例：withLoading
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>加载中...</div>;
    }
    return <Component {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

// <UserListWithLoading isLoading={true} users={[]} />
// <UserListWithLoading isLoading={false} users={[...]} />

// 示例：withAuthentication
function withAuthentication(Component) {
  return function AuthenticatedComponent({ isAuthenticated, ...props }) {
    if (!isAuthenticated) {
      return <LoginPrompt />;
    }
    return <Component {...props} />;
  };
}

// 示例：withExtraProps - 添加额外props
function withExtraProps(Component) {
  return function EnhancedComponent(props) {
    return (
      <Component
        {...props}
        extraProp="额外属性"
        onSpecialEvent={() => console.log('特殊事件')}
      />
    );
  };
}

// 链式调用
const EnhancedComponent = withLoading(
  withAuthentication(
    withExtraProps(BaseComponent)
  )
);
```

---

### 10.7 手写Render Props
**考点**：组件复用模式

```javascript
// Render Props：组件接受一个函数类型的prop，在内部调用这个函数来渲染内容

// 示例：MouseTracker - 追踪鼠标位置
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (e) => {
    this.setState({
      x: e.clientX,
      y: e.clientY
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {/* 使用render prop */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

// 使用方式1：render prop
<MouseTracker render={({ x, y }) => (
  <h1>鼠标位置: {x}, {y}</h1>
)} />

// 使用方式2：children prop
<MouseTracker>
  {({ x, y }) => (
    <h1>鼠标位置: {x}, {y}</h1>
  )}
</MouseTracker>

// children版本实现
class MouseTracker extends React.Component {
  // ...

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.children(this.state)}
      </div>
    );
  }
}

// Hooks版本的替代
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// 使用
function App() {
  const position = useMousePosition();
  return <h1>鼠标位置: {position.x}, {position.y}</h1>;
}
```

---

### 10.8 手写Compound Components
**考点**：高级组件模式

```javascript
// 复合组件：多个组件协作完成一个功能，共享隐式状态

// 示例：Accordion手风琴
function Accordion({ children, defaultOpen = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultOpen);

  const context = { activeIndex, setActiveIndex };

  return (
    <AccordionContext.Provider value={context}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// 创建Context
const AccordionContext = React.createContext({});

function AccordionItem({ children, index }) {
  const { activeIndex, setActiveIndex } = useContext(AccordionContext);
  const isOpen = activeIndex === index;

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
}

function AccordionHeader({ children, index }) {
  const { setActiveIndex } = useContext(AccordionContext);

  return (
    <div
      className="accordion-header"
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </div>
  );
}

function AccordionContent({ children, index }) {
  const { activeIndex } = useContext(AccordionContext);

  if (activeIndex !== index) return null;

  return <div className="accordion-content">{children}</div>;
}

// 添加静态属性方便使用
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Content = AccordionContent;

// 使用
<Accordion defaultOpen={0}>
  <Accordion.Item>
    <Accordion.Header index={0}>第一项</Accordion.Header>
    <Accordion.Content index={0}>第一项内容</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header index={1}>第二项</Accordion.Header>
    <Accordion.Content index={1}>第二项内容</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

---

## 📚 推荐学习资料

1. **官方文档**
   - [React官方文档](https://react.dev/)
   - [React Hooks API Reference](https://react.dev/reference/react)
   - [React Beta文档](https://beta.reactjs.org/)

2. **书籍**
   - 《深入React技术栈》
   - 《React设计原理》
   - 《React状态管理与同构实战》

3. **进阶资源**
   - [React Fiber架构解析](https://github.com/acdlite/react-fiber-architecture)
   - [React团队博客](https://react.dev/blog)
   - [React RFCs](https://github.com/reactjs/rfcs)

---

## 🎯 面试准备建议

**必会概念**：
1. ✅ 虚拟DOM和Diff算法
2. ✅ setState同步/异步问题
3. ✅ React 18自动批处理
4. ✅ Fiber架构基本原理
5. ✅ Hooks使用规则和原理
6. ✅ useEffect cleanup时机
7. ✅ React.memo vs PureComponent
8. ✅ 组件通信方式

**必写代码**：
1. ✅ useState实现
2. ✅ useEffect实现
3. ✅ useMemo/useCallback实现
4. ✅ React.memo实现
5. ✅ 简易Redux实现
6. ✅ 高阶组件实现

**进阶问题**：
1. ✅ Concurrent Mode理解
2. ✅ Server Components概念
3. ✅ Redux Toolkit优势
4. ✅ 性能优化方案

---

**最后提醒**：理解原理 > 死记硬背！多写组件，多看源码，加深理解。
