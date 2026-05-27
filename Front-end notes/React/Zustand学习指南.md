# Zustand 学习指南（基于 Zustand v5）

> 适合人群：已经会 React Hooks，想系统学习 Zustand，并把它用于真实项目的人。
>
> 版本说明：本文按 Zustand v5 体系整理。根据 npm / GitHub 发布信息，Zustand 目前最新稳定版本为 `5.0.13`（2026-05-05）。建议以官方文档和仓库为最终准绳：
>
> - 官方文档：https://zustand.docs.pmnd.rs/
> - GitHub 仓库：https://github.com/pmndrs/zustand
> - npm 包：https://www.npmjs.com/package/zustand

---

## 目录

1. Zustand 是什么
2. 安装与第一个 Store
3. 核心 API：`create`、`set`、`get`、selector
4. Zustand 的运行流程与核心架构
5. 状态更新、派生数据与异步 action
6. 渲染优化：selector、浅比较、稳定引用
7. Store 设计：action 写在哪里、如何拆分模块
8. 中间件：`persist`、`devtools`、`immer`、`subscribeWithSelector`、`redux`、`combine`
9. Vanilla Store：脱离 React 使用 Zustand
10. React Context + Zustand：动态 store 与局部 store
11. TypeScript 使用指南
12. SSR、Next.js 与 React Server Components 注意点
13. 常见项目架构示例
14. 调试、测试与最佳实践
15. 常见坑与排查清单

---

## 1. Zustand 是什么

Zustand 是一个轻量级状态管理库，由 pmndrs 团队维护。它的目标是用很少的代码提供一个可订阅、可组合、可扩展的状态容器。

你可以把 Zustand 理解成：

```txt
一个在 React 外部创建的 store
        +
React 组件通过 hook 订阅 store 的某一部分状态
        +
状态变化时，只通知真正依赖该状态的组件重新渲染
```

它适合管理这些状态：

- 多个组件共享的 UI 状态，例如弹窗、主题、侧边栏、筛选条件。
- 客户端业务状态，例如购物车、用户偏好、草稿、播放队列。
- 不适合完全放在服务端缓存里的前端状态。
- 需要跨组件、跨路由访问，但又不想层层传 props 的状态。

它不一定适合替代这些东西：

- 服务端数据缓存：优先考虑 TanStack Query、SWR、RTK Query。
- 单个组件内部状态：继续用 `useState`、`useReducer`。
- URL 状态：优先放进 query string、path、hash。
- 表单字段状态：复杂表单优先考虑 React Hook Form。

---

## 2. 安装与第一个 Store

### 2.1 安装

```bash
npm install zustand
```

如果你使用 pnpm：

```bash
pnpm add zustand
```

如果你使用 yarn：

```bash
yarn add zustand
```

### 2.2 创建一个计数器 Store

```tsx
// stores/useCounterStore.ts
import { create } from 'zustand'

type CounterState = {
  count: number
  increase: () => void
  decrease: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

在组件中使用：

```tsx
import { useCounterStore } from './stores/useCounterStore'

export function Counter() {
  const count = useCounterStore((state) => state.count)
  const increase = useCounterStore((state) => state.increase)
  const decrease = useCounterStore((state) => state.decrease)

  return (
    <div>
      <p>{count}</p>
      <button onClick={decrease}>-</button>
      <button onClick={increase}>+</button>
    </div>
  )
}
```

最核心的写法只有两步：

```tsx
const useStore = create((set, get, store) => ({
  // state
  // actions
}))

const value = useStore((state) => state.value)
```

### 2.3 Zustand 和 Redux / Context 的差异

| 对比项 | Zustand | Redux Toolkit | React Context |
| --- | --- | --- | --- |
| Provider | 默认不需要 | 需要 | 需要 |
| 模板代码 | 很少 | 中等 | 少，但容易散 |
| 更新方式 | `set` 更新 store | reducer + action | Provider value 更新 |
| 订阅粒度 | selector 精准订阅 | selector 精准订阅 | 默认按 Context value 通知 |
| 中间件 | 可选 | 标准化较强 | 自己实现 |
| 适合场景 | 中小型到大型客户端状态 | 复杂、规范化强的业务状态 | 主题、语言、依赖注入 |

Zustand 默认不需要 Provider，因为 store 通常创建在 JS 模块作用域中：

```tsx
// import 到哪里，拿到的都是同一个 useUserStore
export const useUserStore = create(...)
```

这意味着它天然是模块级单例。这个特性很方便，但在 SSR 和“每个组件实例需要独立 store”的场景下要格外小心，后面会专门讲。

---

## 3. 核心 API

### 3.1 `create`

`create` 是 React 里最常用的入口。

```tsx
import { create } from 'zustand'

const useStore = create((set, get, store) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))
```

它接收一个 `stateCreator` 函数：

```ts
(set, get, store) => initialState
```

三个参数分别是：

| 参数 | 作用 |
| --- | --- |
| `set` | 修改状态，并通知订阅者 |
| `get` | 获取当前完整状态 |
| `store` | 底层 store API，包含 `setState`、`getState`、`subscribe`、`getInitialState` |

`create` 返回的是一个 React Hook，同时这个 Hook 上也挂了 store API：

```tsx
useStore.getState()
useStore.setState({ count: 10 })
useStore.subscribe((state) => {
  console.log(state)
})
useStore.getInitialState()
```

### 3.2 `set`

`set` 用来更新状态。它有两种常见写法。

写法一：传对象，适合不依赖旧状态的更新。

```tsx
set({ count: 0 })
```

写法二：传函数，适合依赖旧状态的更新。

```tsx
set((state) => ({ count: state.count + 1 }))
```

Zustand 默认会对返回对象做一层浅合并：

```tsx
const useStore = create(() => ({
  count: 0,
  name: 'Zustand',
}))

useStore.setState({ count: 1 })
// 结果：{ count: 1, name: 'Zustand' }
```

如果想整体替换 state，可以给 `set` 的第二个参数传 `true`：

```tsx
set({ count: 0 }, true)
```

注意：整体替换会删除原来的其他字段，包括 action。

```tsx
const useStore = create((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  clearEverything: () => set({ count: 0 }, true),
}))

// clearEverything 后，increase 也会被删掉
```

所以业务中很少直接整体替换，除非你明确知道自己在做什么。

### 3.3 `get`

`get` 用来在 action 内读取当前状态。

```tsx
type CartState = {
  items: { id: string; price: number; count: number }[]
  addItem: (id: string, price: number) => void
  totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (id, price) => {
    const items = get().items
    const existing = items.find((item) => item.id === id)

    if (existing) {
      set({
        items: items.map((item) =>
          item.id === id ? { ...item, count: item.count + 1 } : item,
        ),
      })
      return
    }

    set({ items: [...items, { id, price, count: 1 }] })
  },
  totalPrice: () =>
    get().items.reduce((sum, item) => sum + item.price * item.count, 0),
}))
```

`get` 适合在 action 内做逻辑判断，但组件里通常使用 selector：

```tsx
const items = useCartStore((state) => state.items)
```

不要在组件渲染中频繁调用：

```tsx
// 不推荐：它不会建立 React 订阅关系
const items = useCartStore.getState().items
```

### 3.4 selector

selector 决定组件订阅哪一部分状态。

```tsx
const count = useCounterStore((state) => state.count)
```

当 store 更新时，Zustand 会重新执行 selector，并比较新旧 selector 结果。如果结果变化，组件才重新渲染。

推荐写法：

```tsx
const userName = useUserStore((state) => state.user.name)
const logout = useUserStore((state) => state.logout)
```

不推荐在组件里直接拿整个 state：

```tsx
const state = useUserStore()
```

这样组件会订阅整个 store，任何字段变化都可能让它重新渲染。

---

## 4. Zustand 的运行流程与核心架构

### 4.1 一句话理解架构

Zustand 的核心是一个外部 store，它维护：

- 当前状态 `state`
- 订阅者集合 `listeners`
- 更新状态的方法 `setState`
- 读取状态的方法 `getState`
- 注册订阅的方法 `subscribe`

React 层只是通过 hook 把组件和外部 store 连接起来。

### 4.2 简化版源码模型

下面不是 Zustand 源码，只是用于理解运行机制的简化模型：

```ts
type Listener<T> = (state: T, prevState: T) => void

function createStore<T>(createState: (set: any, get: any) => T) {
  let state: T
  const listeners = new Set<Listener<T>>()

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextPartial =
      typeof partial === 'function' ? partial(state) : partial

    const nextState = {
      ...state,
      ...nextPartial,
    }

    if (Object.is(nextState, state)) return

    const prevState = state
    state = nextState

    listeners.forEach((listener) => {
      listener(state, prevState)
    })
  }

  const getState = () => state

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  state = createState(setState, getState)

  return {
    setState,
    getState,
    subscribe,
  }
}
```

真实 Zustand 会处理更多边界情况，并且 React 绑定层会使用 `useSyncExternalStore` 这类机制来保证外部 store 与 React 并发渲染模型正确协作。

### 4.3 运行流程

```txt
create(stateCreator)
  |
  |-- 执行 stateCreator(set, get, store)
  |-- 得到初始 state + actions
  |-- 创建 store API
  |
返回 useStore hook

组件调用 useStore(selector)
  |
  |-- 读取当前 state
  |-- 执行 selector 得到 selectedValue
  |-- 建立订阅
  |
用户触发 action
  |
  |-- action 调用 set
  |-- Zustand 计算 nextState
  |-- 更新内部 state
  |-- 通知 listeners
  |
React 绑定层重新执行 selector
  |
  |-- selectedValue 变化：组件重新渲染
  |-- selectedValue 未变化：组件不重新渲染
```

### 4.4 为什么 Zustand 通常比 Context 更精准

Context 常见写法：

```tsx
<UserContext.Provider value={{ user, setUser }}>
  {children}
</UserContext.Provider>
```

如果 `value` 对象变化，消费该 Context 的组件都会收到通知。即使某个组件只用到了 `user.name`，也可能因为其他字段变化而重新渲染。

Zustand 常见写法：

```tsx
const userName = useUserStore((state) => state.user.name)
```

组件订阅的是 selector 结果。只要 `user.name` 没变，这个组件就不需要更新。

---

## 5. 状态更新、派生数据与异步 action

### 5.1 更新对象

Zustand 只会浅合并第一层。嵌套对象需要自己展开。

```tsx
type ProfileState = {
  profile: {
    name: string
    address: {
      city: string
    }
  }
  updateCity: (city: string) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: {
    name: 'Ada',
    address: {
      city: 'Shanghai',
    },
  },
  updateCity: (city) =>
    set((state) => ({
      profile: {
        ...state.profile,
        address: {
          ...state.profile.address,
          city,
        },
      },
    })),
}))
```

如果嵌套很深，可以考虑：

- 降低状态嵌套层级。
- 使用 `immer` 中间件。
- 把复杂状态拆成更小的 store 或 slice。

### 5.2 更新数组

```tsx
type Todo = {
  id: string
  title: string
  done: boolean
}

type TodoState = {
  todos: Todo[]
  addTodo: (title: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  addTodo: (title) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: crypto.randomUUID(), title, done: false },
      ],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}))
```

### 5.3 派生数据放在哪里

派生数据有三种常见放法。

方式一：组件 selector 中计算。

```tsx
const completedCount = useTodoStore(
  (state) => state.todos.filter((todo) => todo.done).length,
)
```

适合简单计算。

方式二：封装自定义 hook。

```tsx
export function useCompletedTodos() {
  return useTodoStore((state) => state.todos.filter((todo) => todo.done))
}
```

适合多个组件复用。

方式三：用 action / getter 函数。

```tsx
type TodoState = {
  todos: Todo[]
  getCompletedCount: () => number
}

const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  getCompletedCount: () => get().todos.filter((todo) => todo.done).length,
}))
```

注意：如果组件这样写：

```tsx
const getCompletedCount = useTodoStore((state) => state.getCompletedCount)
const count = getCompletedCount()
```

组件实际订阅的是函数引用，不是 `todos`。如果 `todos` 变化但函数引用不变，组件不会因为 `count` 变化自动重新渲染。组件里要响应派生值变化，优先用 selector 直接订阅依赖字段。

推荐：

```tsx
const completedCount = useTodoStore(
  (state) => state.todos.filter((todo) => todo.done).length,
)
```

### 5.4 异步 action

Zustand 不限制异步写法。你可以直接在 action 里使用 `async / await`。

```tsx
type User = {
  id: string
  name: string
}

type UserState = {
  user: User | null
  loading: boolean
  error: string | null
  fetchUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null })

    try {
      const response = await fetch(`/api/users/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const user = (await response.json()) as User
      set({ user, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      })
    }
  },
}))
```

组件：

```tsx
function UserPanel({ id }: { id: string }) {
  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)
  const error = useUserStore((state) => state.error)
  const fetchUser = useUserStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser(id)
  }, [fetchUser, id])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!user) return null

  return <p>{user.name}</p>
}
```

建议：服务端数据缓存优先交给 TanStack Query / SWR；Zustand 更适合保存“客户端状态”。如果用 Zustand 请求服务端数据，要自己处理缓存、失效、重试、竞态等问题。

---

## 6. 渲染优化

### 6.1 基本原则：订阅越小越好

不推荐：

```tsx
const { count, name } = useStore()
```

这会订阅整个 store。

推荐：

```tsx
const count = useStore((state) => state.count)
const name = useStore((state) => state.name)
```

### 6.2 selector 返回对象时的问题

下面的写法看起来很方便：

```tsx
const value = useStore((state) => ({
  count: state.count,
  name: state.name,
}))
```

但每次 selector 执行都会创建一个新对象：

```ts
{ count: 1, name: 'Ada' } !== { count: 1, name: 'Ada' }
```

结果是：即使字段值没变，也可能因为引用不同导致重新渲染。

### 6.3 `useShallow`

Zustand v5 推荐使用 `useShallow` 来处理 selector 返回对象或数组时的浅比较。

```tsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useUserStore = create(() => ({
  name: 'Ada',
  age: 30,
  city: 'Shanghai',
}))

function UserInfo() {
  const { name, age } = useUserStore(
    useShallow((state) => ({
      name: state.name,
      age: state.age,
    })),
  )

  return (
    <div>
      {name} - {age}
    </div>
  )
}
```

数组也可以：

```tsx
const [name, age] = useUserStore(
  useShallow((state) => [state.name, state.age]),
)
```

### 6.4 `createWithEqualityFn`

如果你希望在 hook 调用时继续传自定义 equality function，可以使用 `createWithEqualityFn`。

```tsx
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/vanilla/shallow'

type State = {
  name: string
  age: number
}

const useUserStore = createWithEqualityFn<State>()(
  () => ({
    name: 'Ada',
    age: 30,
  }),
  shallow,
)

function UserInfo() {
  const user = useUserStore((state) => ({
    name: state.name,
    age: state.age,
  }))

  return <div>{user.name}</div>
}
```

注意：`zustand/traditional` 依赖 `use-sync-external-store` 的传统 shim。如果项目确实需要这种 equality function 风格，再使用它。

### 6.5 避免在 selector 里返回不稳定引用

不推荐：

```tsx
const sortedTodos = useTodoStore((state) =>
  [...state.todos].sort((a, b) => a.title.localeCompare(b.title)),
)
```

这每次都会返回新数组。可以改成：

```tsx
const todos = useTodoStore((state) => state.todos)

const sortedTodos = useMemo(
  () => [...todos].sort((a, b) => a.title.localeCompare(b.title)),
  [todos],
)
```

或者配合 `useShallow`，但复杂计算更建议放到 `useMemo`。

---

## 7. Store 设计

### 7.1 state 和 action 放在一起

Zustand 很常见的风格是把状态和修改状态的方法放在同一个 store 中。

```tsx
type AuthState = {
  token: string | null
  user: { id: string; name: string } | null
  login: (token: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: async (token) => {
    const response = await fetch('/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const user = await response.json()
    set({ token, user })
  },
  logout: () => {
    set({ token: null, user: null })
  },
}))
```

优点：

- 组件不需要知道状态如何被修改。
- 业务逻辑集中在 store action 中。
- 更容易复用和测试。

### 7.2 action 命名建议

推荐使用业务含义明确的 action：

```tsx
addTodo(title)
toggleTodo(id)
clearCompleted()
login(credentials)
logout()
openModal(name)
closeModal()
```

少用过于底层的 action：

```tsx
setTodos(todos)
setUser(user)
setModalState(state)
```

不是不能用，而是业务越复杂，底层 setter 越容易让状态变化失去约束。

### 7.3 单 store 还是多 store

小项目可以从单 store 开始：

```txt
useAppStore
```

中大型项目更推荐按领域拆分：

```txt
stores/
  useAuthStore.ts
  useCartStore.ts
  useThemeStore.ts
  useTodoStore.ts
```

拆分原则：

- 变化原因相同的状态放一起。
- 生命周期相同的状态放一起。
- 频繁一起读写的状态放一起。
- 没有业务关系的状态不要硬塞到同一个 store。

### 7.4 Slice 模式

当一个 store 变大时，可以用 slice 模式拆分。

```tsx
import { create, type StateCreator } from 'zustand'

type BearSlice = {
  bears: number
  addBear: () => void
}

type FishSlice = {
  fishes: number
  addFish: () => void
}

type StoreState = BearSlice & FishSlice

const createBearSlice: StateCreator<
  StoreState,
  [],
  [],
  BearSlice
> = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
})

const createFishSlice: StateCreator<
  StoreState,
  [],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
})

export const useBoundStore = create<StoreState>()((...args) => ({
  ...createBearSlice(...args),
  ...createFishSlice(...args),
}))
```

适合：

- 一个业务域内状态较多。
- 多个 slice 之间确实需要共享 `get` / `set`。
- 不想拆成多个独立 store。

不适合：

- 只是两个完全无关的领域。直接拆多个 store 更清晰。

---

## 8. 中间件

Zustand 中间件本质上是包裹 `stateCreator`，增强 store 创建过程或 store API。

常见形式：

```tsx
create(
  middlewareA(
    middlewareB((set, get, store) => ({
      // state and actions
    })),
  ),
)
```

TypeScript 中推荐柯里化写法：

```tsx
create<State>()(
  middleware((set, get) => ({
    // state and actions
  })),
)
```

### 8.1 `persist`：持久化状态

`persist` 可以把 store 的部分状态保存到 storage，默认通常用于 `localStorage`。

```tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeState = {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    },
  ),
)
```

刷新页面后，`theme` 会从 storage 恢复。

### 8.1.1 只持久化部分字段：`partialize`

```tsx
type AuthState = {
  token: string | null
  user: { id: string; name: string } | null
  login: (token: string, user: AuthState['user']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    },
  ),
)
```

上面只保存 `token`，不保存 `user`。

### 8.1.2 版本迁移：`version` 和 `migrate`

当持久化结构变化时，可以写迁移逻辑。

```tsx
type SettingsState = {
  theme: 'light' | 'dark'
  fontSize: number
  setFontSize: (fontSize: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'settings-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (version === 1) {
          return {
            ...(persistedState as object),
            fontSize: 16,
          }
        }

        return persistedState as SettingsState
      },
    },
  ),
)
```

### 8.1.3 自定义 storage

保存到 `sessionStorage`：

```tsx
import { createJSONStorage, persist } from 'zustand/middleware'

export const useStore = create<State>()(
  persist(
    (set) => ({
      // ...
    }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
```

### 8.1.4 hydration

`persist` 从 storage 恢复状态的过程叫 hydration。SSR 或异步 storage 场景下，需要注意初始 UI 与恢复后状态可能不一致。

你可以使用 `onRehydrateStorage` 观察恢复过程：

```tsx
const useStore = create<State>()(
  persist(
    (set) => ({
      ready: false,
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => {
        console.log('hydration starts')

        return (state, error) => {
          if (error) {
            console.error('hydration failed', error)
          } else {
            console.log('hydration finished', state)
          }
        }
      },
    },
  ),
)
```

### 8.2 `devtools`：连接 Redux DevTools

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type CounterState = {
  count: number
  increase: () => void
}

export const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increase: () =>
        set(
          (state) => ({ count: state.count + 1 }),
          false,
          'counter/increase',
        ),
    }),
    {
      name: 'CounterStore',
    },
  ),
)
```

第三个参数是 action 名称，方便在 Redux DevTools 中查看。

```tsx
set(partial, replace, actionName)
```

建议在较复杂项目中开启 `devtools`，尤其是需要追踪状态变化路径时。

### 8.3 `immer`：用可变写法更新不可变状态

安装：

```bash
npm install immer
```

使用：

```tsx
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type Todo = {
  id: string
  title: string
  done: boolean
}

type TodoState = {
  todos: Todo[]
  toggleTodo: (id: string) => void
}

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((item) => item.id === id)

        if (todo) {
          todo.done = !todo.done
        }
      }),
  })),
)
```

写起来像直接修改，实际由 Immer 生成不可变更新。

适合：

- 嵌套对象较深。
- 数组对象更新频繁。
- 团队熟悉 Immer。

不适合：

- 状态结构本来就很扁平。
- 追求最少依赖。

### 8.4 `subscribeWithSelector`：精细订阅

普通 `subscribe` 默认监听整个 state。

`subscribeWithSelector` 让你在 React 组件外也能按 selector 订阅。

```tsx
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type PositionState = {
  x: number
  y: number
  setPosition: (x: number, y: number) => void
}

const usePositionStore = create<PositionState>()(
  subscribeWithSelector((set) => ({
    x: 0,
    y: 0,
    setPosition: (x, y) => set({ x, y }),
  })),
)

const unsubscribe = usePositionStore.subscribe(
  (state) => state.x,
  (x, previousX) => {
    console.log('x changed', previousX, '->', x)
  },
)

unsubscribe()
```

适合：

- 与非 React 系统集成，例如 WebSocket、Canvas、地图 SDK。
- 想监听某个字段变化并执行副作用。
- 写 store 层测试或调试工具。

### 8.5 `redux`：使用 reducer 风格

如果团队习惯 Redux reducer，可以使用 `redux` 中间件。

```tsx
import { create } from 'zustand'
import { redux } from 'zustand/middleware'

type CounterState = {
  count: number
}

type CounterAction =
  | { type: 'counter/increase' }
  | { type: 'counter/add'; payload: number }

const reducer = (
  state: CounterState,
  action: CounterAction,
): CounterState => {
  switch (action.type) {
    case 'counter/increase':
      return { count: state.count + 1 }
    case 'counter/add':
      return { count: state.count + action.payload }
    default:
      return state
  }
}

const useCounterStore = create(redux(reducer, { count: 0 }))

useCounterStore.dispatch({ type: 'counter/increase' })
```

多数 Zustand 项目不需要 `redux` 中间件。除非你想迁移老 Redux 逻辑，或者非常需要 reducer 约束。

### 8.6 `combine`：合并初始 state 与 action creator

`combine` 可以把初始状态和 action creator 分开写。

```tsx
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const useCounterStore = create(
  combine({ count: 0 }, (set) => ({
    increase: () => set((state) => ({ count: state.count + 1 })),
  })),
)
```

这种写法类型推断比较舒服，但要理解它也是创建同一个 store。

### 8.7 中间件组合顺序

常见组合：

```tsx
export const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // state and actions
      })),
      {
        name: 'app-storage',
      },
    ),
    {
      name: 'AppStore',
    },
  ),
)
```

经验建议：

- `devtools` 通常放在外层，方便记录最终状态变化。
- `persist` 包裹需要持久化的 store。
- `immer` 包裹具体更新逻辑。
- 复杂组合先保证类型通过，再补充抽象。

---

## 9. Vanilla Store：脱离 React 使用 Zustand

Zustand 的核心并不依赖 React。`createStore` 可以创建 vanilla store。

```ts
import { createStore } from 'zustand/vanilla'

type CounterState = {
  count: number
  increase: () => void
}

export const counterStore = createStore<CounterState>()((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}))
```

使用 store API：

```ts
counterStore.getState().count
counterStore.getState().increase()

const unsubscribe = counterStore.subscribe((state, prevState) => {
  console.log(prevState.count, state.count)
})

unsubscribe()
```

在 React 中绑定 vanilla store：

```tsx
import { useStore } from 'zustand'
import { counterStore } from './counterStore'

export function Counter() {
  const count = useStore(counterStore, (state) => state.count)
  const increase = useStore(counterStore, (state) => state.increase)

  return <button onClick={increase}>{count}</button>
}
```

适合场景：

- store 要被 React 之外的代码使用。
- 多框架共享状态。
- WebSocket、Web Worker、Canvas、音视频播放器等非 React 系统。
- 想创建多个 store 实例。

---

## 10. React Context + Zustand

Zustand 默认是模块单例，但有些场景需要“每个页面 / 每个组件实例拥有自己的 store”。

例如：

- 同一个页面有多个独立编辑器。
- 每个 tab 拥有自己的本地状态。
- SSR 中需要每个请求隔离 store。

这时可以用 `createStore` + React Context。

```tsx
import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'

type CounterState = {
  count: number
  increase: () => void
}

function createCounterStore(initialCount = 0) {
  return createStore<CounterState>()((set) => ({
    count: initialCount,
    increase: () => set((state) => ({ count: state.count + 1 })),
  }))
}

const CounterStoreContext = createContext<StoreApi<CounterState> | null>(null)

export function CounterStoreProvider({
  initialCount,
  children,
}: PropsWithChildren<{ initialCount?: number }>) {
  const storeRef = useRef<StoreApi<CounterState> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createCounterStore(initialCount)
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

export function useCounterStore<T>(selector: (state: CounterState) => T) {
  const store = useContext(CounterStoreContext)

  if (!store) {
    throw new Error('useCounterStore must be used inside CounterStoreProvider')
  }

  return useStore(store, selector)
}
```

使用：

```tsx
function Counter() {
  const count = useCounterStore((state) => state.count)
  const increase = useCounterStore((state) => state.increase)

  return <button onClick={increase}>{count}</button>
}

export function Page() {
  return (
    <>
      <CounterStoreProvider initialCount={1}>
        <Counter />
      </CounterStoreProvider>

      <CounterStoreProvider initialCount={10}>
        <Counter />
      </CounterStoreProvider>
    </>
  )
}
```

两个 Counter 拥有彼此独立的 store。

---

## 11. TypeScript 使用指南

### 11.1 基础类型写法

推荐写法：

```tsx
type BearState = {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

为什么是 `create<State>()(...)`？

这是 Zustand 在 TypeScript 下常见的柯里化写法，能让状态类型和中间件类型推断更稳定。

### 11.2 action 参数类型

```tsx
type TodoState = {
  addTodo: (input: { title: string; priority?: 'low' | 'normal' | 'high' }) => void
}
```

组件调用时会自动获得类型提示：

```tsx
addTodo({ title: 'Learn Zustand', priority: 'high' })
```

### 11.3 selector hook 封装

当 store 很大时，可以封装业务 hook。

```tsx
export const useTodos = () => useTodoStore((state) => state.todos)
export const useTodoActions = () =>
  useTodoStore(
    useShallow((state) => ({
      addTodo: state.addTodo,
      toggleTodo: state.toggleTodo,
      removeTodo: state.removeTodo,
    })),
  )
```

组件：

```tsx
function TodoList() {
  const todos = useTodos()
  const { toggleTodo, removeTodo } = useTodoActions()

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <button onClick={() => toggleTodo(todo.id)}>{todo.title}</button>
          <button onClick={() => removeTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
```

### 11.4 中间件类型

中间件组合时优先使用柯里化：

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type State = {
  count: number
  increase: () => void
}

export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increase: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        name: 'counter-storage',
      },
    ),
    {
      name: 'CounterStore',
    },
  ),
)
```

### 11.5 `StateCreator` 类型

slice 模式下常用 `StateCreator`。

```tsx
import type { StateCreator } from 'zustand'

type UserSlice = {
  user: { id: string; name: string } | null
  setUser: (user: UserSlice['user']) => void
}

type SettingsSlice = {
  theme: 'light' | 'dark'
  setTheme: (theme: SettingsSlice['theme']) => void
}

type AppState = UserSlice & SettingsSlice

const createUserSlice: StateCreator<AppState, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
})

const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (
  set,
) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
})

export const useAppStore = create<AppState>()((...args) => ({
  ...createUserSlice(...args),
  ...createSettingsSlice(...args),
}))
```

---

## 12. SSR、Next.js 与 React Server Components

### 12.1 模块单例带来的问题

Zustand 常见写法是：

```tsx
export const useStore = create(...)
```

在纯客户端应用里，这很方便。但在 SSR 中，模块级单例可能导致请求之间共享状态。

错误理解：

```txt
每个用户访问页面都会自动拥有独立 store
```

实际风险：

```txt
服务器进程中，模块可能被复用
如果把请求相关状态写进模块单例 store
就可能发生跨请求污染
```

### 12.2 SSR 推荐原则

- 不要在服务端模块单例 store 中保存用户请求相关数据。
- 每个请求需要独立状态时，使用 store factory。
- 客户端 hydration 前后，初始状态要一致。
- 使用 `persist` 时注意 storage 只存在于浏览器环境。
- 不要在 React Server Components 中读写 Zustand store。

### 12.3 Next.js App Router 常见结构

思路：用 factory 创建 store，再通过 Provider 在客户端组件中提供。

```tsx
// stores/counterStore.ts
import { createStore } from 'zustand/vanilla'

export type CounterState = {
  count: number
  increase: () => void
}

export function createCounterStore(initialCount = 0) {
  return createStore<CounterState>()((set) => ({
    count: initialCount,
    increase: () => set((state) => ({ count: state.count + 1 })),
  }))
}
```

```tsx
// providers/counter-store-provider.tsx
'use client'

import {
  createContext,
  useContext,
  useRef,
  type PropsWithChildren,
} from 'react'
import { useStore } from 'zustand'
import type { StoreApi } from 'zustand/vanilla'
import {
  createCounterStore,
  type CounterState,
} from '../stores/counterStore'

const CounterStoreContext = createContext<StoreApi<CounterState> | null>(null)

export function CounterStoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<StoreApi<CounterState> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createCounterStore()
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

export function useCounterStore<T>(selector: (state: CounterState) => T) {
  const store = useContext(CounterStoreContext)

  if (!store) {
    throw new Error('Missing CounterStoreProvider')
  }

  return useStore(store, selector)
}
```

### 12.4 Persist 与 hydration 不一致

如果服务端渲染出来是浅色主题，但客户端从 localStorage 恢复成深色主题，就可能出现 hydration mismatch 或闪烁。

常见处理方式：

- 主题这类强依赖首屏的状态，可以优先用 cookie 在服务端确定。
- 客户端持久化状态可以等 mounted 后再渲染依赖 UI。
- 使用 `persist` 的 hydration 回调控制加载状态。

---

## 13. 常见项目架构示例

### 13.1 小型项目

```txt
src/
  stores/
    useAppStore.ts
  components/
    Counter.tsx
```

`useAppStore.ts`：

```tsx
import { create } from 'zustand'

type AppState = {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
```

### 13.2 中型项目

```txt
src/
  stores/
    auth.store.ts
    cart.store.ts
    theme.store.ts
  features/
    cart/
      CartButton.tsx
      CartDrawer.tsx
```

每个领域一个 store：

```tsx
// stores/cart.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.id === item.id,
          )

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem,
              ),
            }
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)
```

### 13.3 大型项目

```txt
src/
  features/
    auth/
      auth.store.ts
      auth.selectors.ts
      auth.api.ts
      components/
    cart/
      cart.store.ts
      cart.selectors.ts
      cart.types.ts
      components/
  shared/
    stores/
      theme.store.ts
```

可以把 selector 单独放出来：

```tsx
// features/cart/cart.selectors.ts
import { useShallow } from 'zustand/react/shallow'
import { useCartStore } from './cart.store'

export function useCartItems() {
  return useCartStore((state) => state.items)
}

export function useCartTotalPrice() {
  return useCartStore((state) =>
    state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
  )
}

export function useCartActions() {
  return useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      removeItem: state.removeItem,
      clearCart: state.clearCart,
    })),
  )
}
```

组件只消费业务 hook：

```tsx
function CartSummary() {
  const totalPrice = useCartTotalPrice()
  const { clearCart } = useCartActions()

  return (
    <section>
      <p>Total: {totalPrice}</p>
      <button onClick={clearCart}>Clear</button>
    </section>
  )
}
```

---

## 14. 调试、测试与最佳实践

### 14.1 调试方式

最简单的调试：

```tsx
console.log(useStore.getState())
```

订阅状态变化：

```tsx
const unsubscribe = useStore.subscribe((state, prevState) => {
  console.log('prev', prevState)
  console.log('next', state)
})
```

配合 `devtools`：

```tsx
const useStore = create<State>()(
  devtools((set) => ({
    // ...
  })),
)
```

### 14.2 测试 action

因为 Zustand store 可以脱离组件调用，所以测试 action 很直接。

```tsx
import { describe, expect, it, beforeEach } from 'vitest'
import { useCounterStore } from './useCounterStore'

beforeEach(() => {
  useCounterStore.setState({
    count: 0,
  })
})

describe('useCounterStore', () => {
  it('increases count', () => {
    useCounterStore.getState().increase()

    expect(useCounterStore.getState().count).toBe(1)
  })
})
```

如果测试之间需要完全重置，可以保存初始状态：

```tsx
const initialState = useCounterStore.getInitialState()

beforeEach(() => {
  useCounterStore.setState(initialState, true)
})
```

### 14.3 最佳实践清单

- 组件中用 selector 精准订阅，不要随手 `useStore()`。
- action 尽量表达业务行为，而不是暴露大量底层 setter。
- store 状态保持可序列化，尤其是需要 `persist` 或 `devtools` 时。
- 深层嵌套状态谨慎设计，必要时使用 `immer`。
- 服务端数据缓存优先使用专业请求缓存库。
- SSR 场景避免请求级数据进入模块单例 store。
- `persist` 只保存必要字段，用 `partialize` 控制范围。
- selector 返回对象 / 数组时，考虑 `useShallow`。
- 大型项目用业务 hook 包装 selector，降低组件对 store 结构的耦合。
- store 不要成为所有东西的垃圾桶。局部状态仍然应该留在组件内。

---

## 15. 常见坑与排查清单

### 15.1 为什么组件没有重新渲染

可能原因：

1. 组件没有通过 selector 订阅真正变化的字段。
2. 你直接调用了 `useStore.getState()`，没有建立 React 订阅。
3. 你在原地修改对象，引用没变。
4. selector 返回的是稳定函数，而不是变化的数据。

错误示例：

```tsx
const count = useCounterStore.getState().count
```

正确：

```tsx
const count = useCounterStore((state) => state.count)
```

### 15.2 为什么组件频繁重新渲染

可能原因：

1. 订阅了整个 store。
2. selector 每次返回新对象或新数组。
3. store 中多个无关状态混在一起，组件订阅范围过大。

优化：

```tsx
const value = useStore(
  useShallow((state) => ({
    a: state.a,
    b: state.b,
  })),
)
```

或者拆开订阅：

```tsx
const a = useStore((state) => state.a)
const b = useStore((state) => state.b)
```

### 15.3 为什么持久化后 action 丢了

如果你使用了 `set(nextState, true)` 整体替换，可能把 action 函数也替换掉。

```tsx
set({ count: 0 }, true)
```

一般改成浅合并：

```tsx
set({ count: 0 })
```

### 15.4 为什么 localStorage 中存了不该存的数据

使用 `partialize`：

```tsx
persist(
  (set) => ({
    token: null,
    user: null,
    temporaryDraft: '',
  }),
  {
    name: 'auth',
    partialize: (state) => ({
      token: state.token,
    }),
  },
)
```

### 15.5 为什么 SSR 出现 hydration 问题

常见原因：

- 服务端初始状态和客户端恢复状态不同。
- `persist` 从浏览器 storage 恢复后改变了首屏 UI。
- 在服务端访问了 `window` / `localStorage`。

处理方向：

- 首屏关键状态使用 cookie 或服务端数据注入。
- 客户端状态等待 mounted 后再渲染依赖 UI。
- 使用 store factory 避免请求间共享状态。

---

## 16. 从 0 到 1 的推荐学习路线

### 阶段一：能用

掌握：

- `create`
- `set`
- selector
- action
- 异步 action

练习：

- 计数器
- Todo List
- 主题切换
- 简单购物车

### 阶段二：用好

掌握：

- selector 渲染机制
- `useShallow`
- `persist`
- `devtools`
- TypeScript 类型写法

练习：

- 持久化购物车
- 登录 token 持久化
- 多组件共享筛选状态

### 阶段三：工程化

掌握：

- store 拆分
- slice 模式
- vanilla store
- Context + store factory
- SSR / Next.js 限制
- 测试 action

练习：

- 多 tab 独立编辑器状态
- Next.js 页面级 store
- 带中间件组合的业务 store

---

## 17. 完整示例：Todo + Persist + Devtools + useShallow

```tsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { devtools, persist } from 'zustand/middleware'

type Todo = {
  id: string
  title: string
  done: boolean
}

type TodoState = {
  todos: Todo[]
  addTodo: (title: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  clearCompleted: () => void
}

export const useTodoStore = create<TodoState>()(
  devtools(
    persist(
      (set) => ({
        todos: [],
        addTodo: (title) =>
          set(
            (state) => ({
              todos: [
                ...state.todos,
                {
                  id: crypto.randomUUID(),
                  title,
                  done: false,
                },
              ],
            }),
            false,
            'todo/addTodo',
          ),
        toggleTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo,
              ),
            }),
            false,
            'todo/toggleTodo',
          ),
        removeTodo: (id) =>
          set(
            (state) => ({
              todos: state.todos.filter((todo) => todo.id !== id),
            }),
            false,
            'todo/removeTodo',
          ),
        clearCompleted: () =>
          set(
            (state) => ({
              todos: state.todos.filter((todo) => !todo.done),
            }),
            false,
            'todo/clearCompleted',
          ),
      }),
      {
        name: 'todo-storage',
        partialize: (state) => ({
          todos: state.todos,
        }),
      },
    ),
    {
      name: 'TodoStore',
    },
  ),
)

export function useTodos() {
  return useTodoStore((state) => state.todos)
}

export function useTodoStats() {
  return useTodoStore(
    useShallow((state) => {
      const total = state.todos.length
      const completed = state.todos.filter((todo) => todo.done).length

      return {
        total,
        completed,
        active: total - completed,
      }
    }),
  )
}

export function useTodoActions() {
  return useTodoStore(
    useShallow((state) => ({
      addTodo: state.addTodo,
      toggleTodo: state.toggleTodo,
      removeTodo: state.removeTodo,
      clearCompleted: state.clearCompleted,
    })),
  )
}
```

组件：

```tsx
import { FormEvent, useState } from 'react'
import { useTodoActions, useTodos, useTodoStats } from './todo.store'

export function TodoApp() {
  const [title, setTitle] = useState('')
  const todos = useTodos()
  const stats = useTodoStats()
  const { addTodo, toggleTodo, removeTodo, clearCompleted } = useTodoActions()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) return

    addTodo(title.trim())
    setTitle('')
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      <p>
        Total: {stats.total}, Active: {stats.active}, Completed:{' '}
        {stats.completed}
      </p>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              {todo.title}
            </label>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={clearCompleted}>Clear completed</button>
    </section>
  )
}
```

这个示例串起了 Zustand 的工程常用组合：

- `create<State>()(...)`：TypeScript 推荐写法。
- `persist`：保存 todos。
- `partialize`：控制持久化范围。
- `devtools`：记录 action。
- selector hook：组件不直接依赖 store 内部结构。
- `useShallow`：减少对象 selector 导致的无效渲染。

---

## 18. 总结

Zustand 的心智模型可以压缩成三句话：

1. `create` 创建外部 store，store 里同时放 state 和 action。
2. React 组件通过 `useStore(selector)` 订阅状态片段。
3. action 调用 `set` 更新状态，Zustand 通知订阅者，selector 结果变化的组件才重新渲染。

学习 Zustand 时，最重要的不是背 API，而是理解这几个核心问题：

- 状态应该放本地、URL、服务端缓存，还是 Zustand？
- 组件到底订阅了哪些字段？
- action 是否表达了明确的业务行为？
- store 是否被设计成可维护的业务模块？
- SSR / 持久化 / 中间件是否改变了状态生命周期？

掌握这些之后，Zustand 会是一个非常顺手的 React 状态管理工具：代码少、模型清晰、扩展成本低。
