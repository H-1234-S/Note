## 一、Zustand 简介

Zustand 是一个轻量级、快速、可扩展的状态管理解决方案，基于简化的 Flux 原则。

它具有友好的 Hooks API，无需像 Redux 那样包裹 Provider。

**核心特点：**
- 轻量级（压缩后约 1.5KB）
- 无需 Provider 包裹
- 支持 TypeScript
- 内置中间件系统
- 解决 zombie child、React concurrency 等问题

**对比 Redux：**

| 特性 | Zustand | Redux |
|------|---------|-------|
| 体积 | ~1.5KB | ~7KB |
| 配置 | 无需配置 | 需要配置 store |
| Boilerplate | 极少 | 较多 |
| Provider | 不需要 | 必须 |
| 中间件 | 可选 | 必须使用 |

---

## 二、基础使用

### 1. 安装

```bash
npm install zustand
# 或
yarn add zustand
# 或
pnpm add zustand
```

### 2. 创建 Store

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  // 状态
  bears: 0,
  user: { name: '张三', age: 25 },

  // 操作方法
  increasePopulation: () => set((state) => ({
    bears: state.bears + 1
  })),

  removeAllBears: () => set({ bears: 0 }),

  // 直接设置
  setUser: (user) => set({ user }),
}))
```

### 3. 组件中使用

```jsx
function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>Add Bear</button>
}
```

---

## 三、核心概念

### 1. set 函数

`set` 用于更新状态，有两种写法：

```javascript
// 直接覆盖
set({ count: 42 })

// 基于原状态更新（函数式）
set((state) => ({ count: state.count + 1 }))
```

### 2. get 函数

`get` 用于在 action 中访问其他状态：

```javascript
const useStore = create((set, get) => ({
  firstName: 'John',
  lastName: 'Doe',

  // 在 action 中访问其他状态
  fullName: () => `${get().firstName} ${get().lastName}`,

  // 在 action 中调用其他 action
  reset: () => {
    const { clearData } = get()
    clearData()
    set({ firstName: '', lastName: '' })
  },

  clearData: () => set({ /* ... */ })
}))
```

### 3. Selector 选择器

**为什么要用 selector？**

避免不必要的重渲染，只订阅需要的状态：

```jsx
// ❌ 不好：任何状态变化都会触发重渲染
const { name, age } = useStore()

// ✅ 好：只在这两个值变化时才重渲染
const name = useStore((state) => state.name)
const age = useStore((state) => state.age)

// ✅ 使用解构赋值（效果相同）
const { name, age } = useStore((state) => ({
  name: state.name,
  age: state.age
}))
```

### 4. shallow 比较函数

当需要选择多个状态时，使用 `shallow` 避免对象引用问题：

```jsx
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

// ❌ 不好：对象引用总是新的，导致重渲染
const { name, age } = useStore((state) => ({
  name: state.name,
  age: state.age
}))

// ✅ 好：shallow 比较每个属性
const { name, age } = useStore(
  (state) => ({ name: state.name, age: state.age }),
  shallow
)
```

---

## 四、中间件

### 1. persist - 持久化存储

将状态保存到 localStorage/sessionStorage：

```javascript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      bears: 0,
      increasePopulation: () => set((state) => ({
        bears: state.bears + 1
      })),
    }),
    {
      name: 'bear-storage',        // storage 的 key 名
      storage: createJSONStorage(() => localStorage),  // 默认 localStorage
      // storage: createJSONStorage(() => sessionStorage),  // 可选 sessionStorage
      // storage: createJSONStorage(() => indexedDB),  // 大型数据
    }
  )
)
```

**partialize - 选择性持久化：**

```javascript
const useStore = create(
  persist(
    (set) => ({
      bears: 0,
      username: '',
      theme: 'dark',
    }),
    {
      name: 'app-storage',
      // 只持久化部分字段
      partialize: (state) => ({
        username: state.username,
        theme: state.theme,
        // 排除 bears
      }),
    }
  )
)
```

**版本迁移：**

```javascript
const useStore = create(
  persist(
    (set) => ({
      count: 0,
      newField: '',
    }),
    {
      name: 'storage',
      version: 1,  // 版本号
      // 迁移函数
      migrate: (persistedState, version) => {
        if (version === 0) {
          // 从 v0 迁移到 v1
          return {
            ...persistedState,
            newField: persistedState.oldField || '',
            version: 1,
          }
        }
        return persistedState
      },
    }
  )
)
```

### 2. devtools - Redux 开发工具集成

```javascript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      bears: 0,
      increase: () => set((state) => ({ bears: state.bears + 1 })),
    }),
    {
      name: 'Bear Store',  // DevTools 中的名称
      // 生产环境禁用
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
)
```

**多 Store 监控：**

```javascript
const useStore1 = create(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'Store1' }
  )
)
```

### 3. immer - 不可变状态更新

处理深层嵌套状态：

```javascript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    user: {
      name: '张三',
      address: {
        city: '北京',
        zip: '100000'
      }
    },

    // 直接修改，无需展开运算符
    updateCity: (city) => set((state) => {
      state.user.address.city = city
    }),

    // 添加数组元素
    addHobby: (hobby) => set((state) => {
      if (!state.user.hobbies) {
        state.user.hobbies = []
      }
      state.user.hobbies.push(hobby)
    }),
  }))
)
```

### 4. subscribeWithSelector - 订阅选择器

```javascript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
  }))
)

// 订阅特定状态变化
const unsubscribe = useStore.subscribe(
  (state) => state.count,
  (count, previousCount) => {
    console.log(`count changed from ${previousCount} to ${count}`)
    if (count > 10) {
      console.log('Reached 10!')
    }
  }
)

// 取消订阅
unsubscribe()
```

### 5. 中间件组合顺序

中间件有固定的组合顺序：

```javascript
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  devtools(                            // 1. devtools 最外层
    persist(                           // 2. persist
      subscribeWithSelector(           // 3. subscribeWithSelector
        immer((set, get) => ({          // 4. immer 最内层
          // store 内容
        }))
      )
    )
  )
)
```

---

## 五、TypeScript 支持

### 1. 类型化 Store

```typescript
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: () => void
  reset: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}))
```

### 2. 类型化 Middleware

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface PersistedState {
  name: string
}

const useStore = create<PersistedState>()(
  persist(
    (set) => ({
      name: '张三',
    }),
    {
      name: 'storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### 3. 类型推断的 Action

```typescript
interface StoreState {
  // 状态
  count: number
  // 操作
  inc: () => void
  dec: () => void
  setCount: (count: number) => void
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
  setCount: (count: number) => set({ count }),
}))
```

---

## 六、切片模式 (Slices Pattern)

将大 store 拆分成多个 slice，便于维护：

### 1. 创建切片

```javascript
// store/slices/counterSlice.js
const createCounterSlice = (set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
})

export default createCounterSlice
```

```javascript
// store/slices/userSlice.js
const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
})

export default createUserSlice
```

### 2. 组合切片

```javascript
// store/index.js
import { create } from 'zustand'
import { createCounterSlice } from './slices/counterSlice'
import { createUserSlice } from './slices/userSlice'

const useStore = create((set, get) => ({
  ...createCounterSlice(set, get),
  ...createUserSlice(set, get),
}))

export default useStore
```

### 3. TypeScript 切片

```typescript
// store/slices/counterSlice.ts
import { StateCreator } from 'zustand'

interface CounterSlice {
  count: number
  increment: () => void
}

const createCounterSlice: StateCreator<StoreState, [], [], CounterSlice> =
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  })

export { createCounterSlice, type CounterSlice }
```

```typescript
// store/index.ts
import { create } from 'zustand'
import { createCounterSlice, type CounterSlice } from './slices/counterSlice'
import { createUserSlice, type UserSlice } from './slices/userSlice'

interface StoreState extends CounterSlice, UserSlice {}

const useStore = create<StoreState>()((set, get) => ({
  ...createCounterSlice(set, get),
  ...createUserSlice(set, get),
}))
```

---

## 七、在组件外使用 Store

Zustand 的 store 不依赖 React，可以在任何地方使用：

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}))

// 在 API 服务中使用
export const fetchUserData = async () => {
  const token = useStore.getState().token
  const response = await fetch('/api/user', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.json()
}

// 在路由守卫中使用
export const requireAuth = () => {
  if (!useStore.getState().token) {
    redirect('/login')
  }
}
```

**API 概览：**

```javascript
const store = useStore

// 获取当前状态
store.getState()

// 更新状态
store.setState({ count: 42 })

// 订阅状态变化
const unsubscribe = store.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log(count, prevCount)
)

// 清除订阅
unsubscribe()

// 销毁 store
store.destroy()
```

---

## 八、Computed State (计算状态)

Zustand 本身不提供 computed，但可以用选择器实现：

### 1. 基础计算

```javascript
const useStore = create((set) => ({
  items: [],
  taxRate: 0.1,

  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
}))

// 在组件中计算
function Cart() {
  const items = useStore((state) => state.items)
  const taxRate = useStore((state) => state.taxRate)

  // 计算总价
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return <div>Total: {total}</div>
}
```

### 2. 使用 zustand-computed-state 库

```bash
npm install zustand-computed-state
```

```javascript
import { create } from 'zustand'
import { computed } from 'zustand-computed-state'

const useStore = create(
  computed(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
    }),
    (state) => ({
      total: state.items.reduce((sum, item) => sum + item.price, 0),
      itemCount: state.items.length,
    })
  )
)
```

---

## 九、Context 集成

创建 Context Store：

```javascript
import { createContext, useContext } from 'react'
import { create } from 'zustand'
import { createContextStore } from 'zustand/context'

const { Provider, useStore } = createContextStore(() => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

export { Provider }
export const useCounterStore = useStore
```

---

## 十、性能优化

### 1. 选择性订阅

```jsx
// ❌ 不好：整个 store 变化都触发重渲染
const { a, b, c } = useStore()

// ✅ 好：只订阅需要的状态
const a = useStore((s) => s.a)
const b = useStore((s) => s.b)
```

### 2. 分离 Actions

```javascript
// ❌ 不好：actions 放在 state 中，每次都创建新引用
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
}))

// ✅ 好：使用分离的 actions 对象
const { increment, decrement } = useStore.getState()

// ✅ 或者使用 vanilla store
import { createStore } from 'zustand/vanilla'

const store = createStore((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}))

export { store, increment, decrement } from './store'
```

### 3. 避免对象字面量

```jsx
// ❌ 每次都创建新对象
const { x, y } = useStore((s) => ({ x: s.x, y: s.y }))

// ✅ 使用 shallow 或分开订阅
const x = useStore((s) => s.x)
const y = useStore((s) => s.y)
```

---

## 十一、常见问题

### 1. 异步操作

```javascript
const useStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      set({ users: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 调用其他 action
  fetchAndSetUser: async (userId) => {
    const { fetchUsers } = get()
    await fetchUsers()
    // ...
  },
}))
```

### 2. 深层嵌套更新

```javascript
// 使用 immer
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  immer((set) => ({
    deeply: { nested: { state: { value: 0 } } },

    updateValue: (value) => set((state) => {
      state.deeply.nested.state.value = value
    }),
  }))
)
```

### 3. 重置 store

```javascript
const initialState = {
  count: 0,
  user: null,
}

const useStore = create((set) => ({
  ...initialState,
  reset: () => set(initialState),
}))
```

---

## 十二、zustand/vanilla

如果不需要 React Hooks，可以使用 vanilla 版本：

```javascript
import { createStore } from 'zustand/vanilla'

const store = createStore((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

// 订阅
const unsub = store.subscribe(
  (state) => state.count,
  (count, prev) => console.log(count)
)

// 获取状态
store.getState().count

// 更新
store.getState().inc()

// 销毁
store.destroy()
```

适用于非 React 环境或自定义 Hooks 封装。

---

## 十三、目录结构建议

```
src/
├── store/
│   ├── index.ts              # 主 store，组合所有 slices
│   ├── slices/
│   │   ├── counterSlice.ts
│   │   ├── userSlice.ts
│   │   └── uiSlice.ts
│   └── types.ts              # 共享类型
├── components/
│   ├── Counter.tsx
│   └── User.tsx
```

---

## 十四、Zustand vs Redux vs Jotai vs Recoil

| 特性 | Zustand | Redux | Jotai | Recoil |
|------|---------|-------|-------|--------|
| 体积 | ~1.5KB | ~7KB | ~3KB | ~5KB |
| API 风格 | Hooks | Hooks + TS | Atoms | Selectors |
| 学习曲线 | 低 | 中 | 低 | 中 |
| Boilerplate | 少 | 多 | 少 | 中 |
| DevTools | 支持 | 支持 | 支持 | 支持 |
| 状态范式 | Flux | Flux | Atomic | Atomic |
| SSR 支持 | 好 | 好 | 好 | 一般 |

---

## 相关资源

- 官网：https://zustand.docs.pmnd.rs
- GitHub：https://github.com/pmndrs/zustand
- 在线 Demo：https://zustand-demo.pmnd.rs

---

> 以上就是 Zustand 的完整知识整理，涵盖了从基础到高级的各个方面。Zustand 以其简洁的 API 和强大的功能，已成为 React 状态管理的优秀选择，特别适合中小型项目和需要快速迭代的场景。
