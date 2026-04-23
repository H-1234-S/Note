
---

## 1. 简介与核心概念

### 1.1 什么是 TanStack Query

TanStack Query（前身 React Query）是一个强大的**异步状态管理库**，专注于管理服务端状态（Server State）。它解决了三个核心问题：

| 问题 | 解决方案 |
|------|----------|
| 缓存管理 | 自动缓存请求结果，支持多种缓存策略 |
| 后台更新 | 数据过期时后台自动重新获取 |
| 状态同步 | 管理加载/错误/成功状态 |

### 1.2 关键术语

```typescript
// 核心概念解释
Query           // 一个异步数据请求，包含 queryKey 和 queryFn
Query Client    // 整个缓存存储的管理器
Query Cache     // 存储所有 query 结果的缓存区
Query Observer  // 订阅 query 状态变化的观察者
Invalidation   // 使缓存失效，触发重新获取
Stale          // 数据是否过期（需要重新获取）
```

### 1.3 工作原理图

```
初次请求:
  useQuery → Query Cache(无数据) → queryFn() → 加载状态 → 返回 data

后续请求:
  useQuery → Query Cache(有数据) → 立即返回缓存数据 → 后台重新获取 → 更新状态
```

---

## 2. 快速开始

### 2.1 安装

```bash
npm add @tanstack/react-query
# 或
yarn add @tanstack/react-query
# 或
pnpm add @tanstack/react-query
```

### 2.2 基础配置

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 全局默认配置
      staleTime: 1000 * 60 * 5,  // 5分钟内数据被视为新鲜
      gcTime: 1000 * 60 * 10,    // 10分钟后垃圾回收（之前是 cacheTime）
      retry: 2,                   // 失败重试次数
    },
  },
})

// App.tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}
```

### 2.3 第一个 Query

```typescript
import { useQuery } from '@tanstack/react-query'

interface Todo {
  id: number
  title: string
  completed: boolean
}

// 定义 API 函数
const fetchTodos = async (): Promise<Todo[]> => {
  const response = await fetch('/api/todos')
  if (!response.ok) throw new Error('Failed to fetch todos')
  return response.json()
}

// 组件中使用
function Todos() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {(error as Error).message}</div>

  return (
    <ul>
      {data?.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

---

## 3. useQuery 详解

### 3.1 返回值详解

```typescript
const {
  // 数据相关
  data: TData | undefined,          // 查询结果数据
  dataUpdatedAt: number,           // 数据更新时间戳
  error: TError | null,            // 错误对象

  // 状态相关
  status: 'loading' | 'error' | 'success' | 'pending',
  fetchStatus: 'fetching' | 'paused' | 'idle',
  isLoading: boolean,              // 首次加载中（无缓存数据）
  isFetching: boolean,             // 任何形式的获取中（包括后台刷新）
  isError: boolean,                // 是否出错
  isSuccess: boolean,              // 是否成功
  isStale: boolean,                // 数据是否过期

  // 操作方法
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>,
} = useQuery(options)
```

### 3.2 queryKey 的重要性

queryKey 是 TanStack Query 的核心，它用于：
- 唯一标识一个 query
- 缓存管理
- 批量失效

```typescript
// 简单 key
useQuery({ queryKey: ['todos'], ... })

// 带参数的 key - 数组形式
useQuery({ queryKey: ['todo', 5], ... })           // 获取 id=5 的 todo
useQuery({ queryKey: ['todo', { id: 5 }], ... })   // 对象形式（更推荐）

// 层级结构 - 便于批量失效
useQuery({ queryKey: ['users'], ... })                    // 所有用户
useQuery({ queryKey: ['users', 'detail', 5], ... })       // id=5 的用户详情
useQuery({ queryKey: ['users', 'list', { page: 1 }], ... }) // 第1页用户列表
```

### 3.3 常用配置选项

```typescript
interface UseQueryOptions {
  // 必需
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,

  // 执行控制
  enabled?: boolean,                 // 条件执行，默认为 true
  refetchOnWindowFocus?: boolean,    // 窗口聚焦时重新获取
  refetchOnMount?: boolean | 'always',
  refetchOnReconnect?: boolean | 'always',

  // 时间配置
  staleTime?: number,                 // 数据新鲜时间（ms）
  gcTime?: number,                   // 垃圾回收时间（ms），默认 5 分钟
  refetchInterval?: number,          // 定时刷新间隔（ms）
  refetchIntervalInBackground?: boolean, // 标签页隐藏时是否继续刷新

  // 重试配置
  retry?: boolean | number | (failureCount: number, error: TError) => boolean,
  retryDelay?: number | (failureCount: number) => number,

  // 数据转换
  select?: (data: TData) => TSelected,

  // 其他
  placeholderData?: TData | (previousData: TData | undefined) => TData,
  initialData?: TData | () => TData,
}
```

### 3.4 enabled - 条件执行

```typescript
// 只有当 userId 存在时才执行查询
function UserProfile({ userId }: { userId: number | null }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,  // userId 为 null 时不会执行
  })
}
```

### 3.5 select - 数据转换

```typescript
// 只获取已完成的任务
const { data: completedTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.filter(t => t.completed),
})

// 计算总数
const { data: todoCount } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.length,
})
```

### 3.6 多个 Query 并行请求

```typescript
// 方式一：分别调用
const todosQuery = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
const postsQuery = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })

// 方式二：使用 Promise.all（推荐，失败一个全部失败）
const { data: results } = useQuery({
  queryKey: ['both'],
  queryFn: async () => {
    const [todos, posts] = await Promise.all([fetchTodos(), fetchPosts()])
    return { todos, posts }
  },
})

// 方式三：使用 useQueries（独立并行）
const results = useQueries({
  queries: [
    { queryKey: ['todos'], queryFn: fetchTodos },
    { queryKey: ['posts'], queryFn: fetchPosts },
    { queryKey: ['comments'], queryFn: fetchComments },
  ],
})
```

---

## 4. useMutation 详解

### 4.1 基础用法

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateTodoRequest {
  title: string
}

const useCreateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTodo: CreateTodoRequest) => {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      })
      if (!response.ok) throw new Error('Failed to create todo')
      return response.json()
    },
    onSuccess: () => {
      // 创建成功后使 todos 缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

// 组件中使用
function CreateTodoForm() {
  const createTodo = useCreateTodo()

  const handleSubmit = (title: string) => {
    createTodo.mutate({ title })
  }

  return (
    <>
      <button
        onClick={() => handleSubmit('New Todo')}
        disabled={createTodo.isPending}
      >
        {createTodo.isPending ? 'Creating...' : 'Create Todo'}
      </button>
      {createTodo.isError && (
        <div>Error: {createTodo.error?.message}</div>
      )}
    </>
  )
}
```

### 4.2 mutationFn 的类型

```typescript
// 基本类型
mutationFn: (variables: TVariables) => Promise<TData>

// 使用泛型指定类型
const mutation = useMutation<TData, TError, TVariables>({
  mutationFn: async (variables) => {
    // implementation
  },
})
```

### 4.3 useMutation 返回值

```typescript
const {
  mutate: (variables, { onSuccess, onSettled, onError }) => void,
  mutateAsync: (variables) => Promise<TData>,  // 返回 Promise

  // 状态
  isPending: boolean,
  isSuccess: boolean,
  isError: boolean,
  isIdle: boolean,

  // 数据
  data: TData | undefined,
  error: TError | null,

  // 重置
  reset: () => void,
} = useMutation(options)
```

### 4.4 mutate vs mutateAsync

```typescript
// mutate - 不返回 Promise
const mutation = useMutation({ mutationFn: updateTodo })

mutation.mutate(newTodo)
// 适用于 fire-and-forget 场景

// mutateAsync - 返回 Promise，可等待
const mutation = useMutation({ mutationFn: updateTodo })

try {
  const result = await mutation.mutateAsync(newTodo)
  console.log('Updated:', result)
} catch (error) {
  console.error('Failed:', error)
}

// 适用于后续操作需要用到返回值
```

### 4.5 回调函数详解

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  // onMutate 在 mutationFn 之前调用，用于乐观更新
  onMutate: async (newTodo) => {
    // 取消所有正在进行的 todos 查询
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 保存当前数据，用于错误回滚
    const previousTodos = queryClient.getQueryData(['todos'])

    // 乐观更新：立即更新缓存
    queryClient.setQueryData(['todos'], (old) => [
      ...old!,
      { ...newTodo, id: Date.now() },
    ])

    // 返回上下文，用于错误恢复
    return { previousTodos }
  },
  // onError 在 mutationFn 失败时调用
  onError: (error, newTodo, context) => {
    // 回滚到之前的数据
    queryClient.setQueryData(['todos'], context?.previousTodos)
  },
  // onSettled 在 mutationFn 完成时调用（无论成功或失败）
  onSettled: () => {
    // 确保数据同步
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### 4.6 乐观更新完整示例

```typescript
interface Todo {
  id: number
  title: string
  completed: boolean
}

const useToggleTodo = () => {
  const queryClient = useQueryClient()

  return useMutation<Todo, Error, number>({
    mutationFn: async (todoId: number) => {
      const response = await fetch(`/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to toggle todo')
      return response.json()
    },
    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        )
      )

      return { previousTodos }
    },
    onError: (_err, _todoId, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

---

## 5. QueryClient API

### 5.1 核心方法

```typescript
const queryClient = new QueryClient()

// 获取缓存数据
queryClient.getQueryData<TData>(queryKey)

// 设置缓存数据
queryClient.setQueryData<TData>(queryKey, data)

// 设置数据，支持 updater 函数
queryClient.setQueryData<TData>(queryKey, (old) => newData)

// 删除单个 query 缓存
queryClient.removeQueries({ queryKey: ['todos'] })

// 重置 query（回到 loading 状态）
queryClient.resetQueries({ queryKey: ['todos'] })

// 使缓存失效，触发重新获取
queryClient.invalidateQueries({ queryKey: ['todos'] })

// 静默刷新（不使缓存失效）
queryClient.refetchQueries({ queryKey: ['todos'] })

// 预获取数据
await queryClient.prefetchQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})
```

### 5.2 批量操作

```typescript
// 使多个 query 失效
await queryClient.invalidateQueries({
  queryKey: ['todos'],  // todos 和其所有子级都会被失效
})

// 使用 predicate 精确匹配
await queryClient.invalidateQueries({
  queryKey: ['todos'],
  predicate: (query) => {
    return query.queryKey[0] === 'todos' &&
           query.queryKey[1] === 'detail'
  },
})

// 获取所有匹配的 query
const todos = queryClient.getQueriesData({ queryKey: ['todos'] })
```

### 5.3 QueryCache 监听

```typescript
const queryCache = queryClient.getQueryCache()

// 监听 query 变化
const unsubscribe = queryCache.subscribe((event) => {
  console.log('Query event:', event)
  // event: { type: 'added' | 'updated' | 'removed', query }
})

// 清理监听
unsubscribe()
```

### 5.4 完整配置示例

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据新鲜时间：5分钟内不会重新获取
      staleTime: 1000 * 60 * 5,

      // 垃圾回收时间：10分钟后清除未使用的缓存
      gcTime: 1000 * 60 * 10,

      // 窗口聚焦时重新获取
      refetchOnWindowFocus: true,

      // 失败重试次数
      retry: 3,

      // 重试延迟：指数退避
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // mutation 默认配置
      retry: 0,
    },
  },
})
```

---

## 6. 缓存与失效机制

### 6.1 生命周期

```
Query 执行流程:

1. created (创建)
   ↓
2. fetching (获取中) ←→ queryFn 执行
   ↓
3. fresh (新鲜数据)
   ↓ (staleTime 过期)
4. stale (过期数据)
   ↓ (再次获取或 invalidate)
5. destroyed (gcTime 后被垃圾回收)
```

### 6.2 staleTime vs gcTime

```typescript
// staleTime: 数据新鲜期，期间不会发起新的请求
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 1000 * 60 * 5,  // 5分钟内不会重新获取
})

// gcTime: 缓存存活时间，无任何订阅后开始计时
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  gcTime: 1000 * 60 * 30,  // 30分钟后清除缓存
})
```

### 6.3 缓存失效策略

```typescript
// 精确失效单个 query
queryClient.invalidateQueries({ queryKey: ['todo', 5] })

// 失效整个命名空间（包括子级）
queryClient.invalidateQueries({ queryKey: ['todos'] })

// 使用 queryKey 前缀匹配
queryClient.invalidateQueries({
  queryKey: ['users'],
  exact: false,  // 默认为 false，匹配所有以 'users' 开头的 query
})
```

### 6.4 持久化缓存

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 天
})
```

---

## 7. 高级特性

### 7.1 依赖查询 (Dependent Queries)

```typescript
// 只有当 userId 存在时才执行
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId!),
  enabled: !!userId,
})

// 只有当 user 加载完成后才获取 posts
const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user!.id),
  enabled: !!user,
})
```

### 7.2 分页与无限滚动

```typescript
// 分页 Query
const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts({ page: pageParam, limit: 10 }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0,
})

// 渲染分页数据
const allPosts = data?.pages.flatMap(page => page.data) ?? []
```

### 7.3 初始数据 (Initial Data)

```typescript
// 静态初始数据
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  initialData: [{ id: 0, title: 'Loading...', completed: false }],
})

// 动态初始数据
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  initialData: () => {
    // 可以从 localStorage 或其他缓存读取
    return getLocalTodos()
  },
})

// placeholderData 保持旧数据
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  placeholderData: (previousData) => previousData,
})
```

### 7.4 取消请求

```typescript
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: async ({ signal }) => {
    const response = await fetch('/api/todos', { signal })
    return response.json()
  },
})

// 在组件外取消
const queryClient.cancelQueries({ queryKey: ['todos'] })
```

### 7.5 调度器 (Scheduler)

```typescript
// 自定义并发数
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  // 同一时间最多 2 个并发查询
  networkMode: 'offlineFirst',
})

// 全局调度配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 网络模式: 'online' | 'offlineFirst' | 'always'
      networkMode: 'offlineFirst',
    },
  },
})
```

### 7.6 错误边界与重试

```typescript
// 自定义重试逻辑
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: (failureCount, error) => {
    // 只在网络错误时重试，4xx 错误不重试
    if (error.status >= 400 && error.status < 500) {
      return false
    }
    return failureCount < 3
  },
  retryDelay: (failureCount) => {
    // 指数退避: 1s, 2s, 4s
    return Math.min(1000 * 2 ** failureCount, 30000)
  },
})
```

---

## 8. 开发工具

### 8.1 安装 Devtools

```bash
npm add @tanstack/react-query-devtools
```

### 8.2 基础使用

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {/* 默认显示在右下角 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 8.3 面板模式

```typescript
// 嵌入到自定义面板中
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

function CustomDevtoolsPanel() {
  return (
    <div style={{ height: 500 }}>
      <ReactQueryDevtoolsPanel />
    </div>
  )
}
```

### 8.4 Devtools 配置

```typescript
<ReactQueryDevtools
  initialIsOpen={false}
  panelProps={{
    // 面板配置
  }}
  toggleButtonProps={{
    // 切换按钮配置
  }}
  style={{
    // 自定义样式
  }}
/>
```

---

## 9. 最佳实践

### 9.1 Query Key 命名规范

```typescript
// 推荐：使用描述性、层级化的 key
['users', 'list', { page: 1, limit: 10 }]
['users', 'detail', userId]
['posts', 'comments', postId]

// 避免：过于简单或重复的 key
['data']
['getUsers']
```

### 9.2 错误处理模式

```typescript
function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    // 错误分类处理
    retry: (failureCount, error) => {
      if (error.status === 401) return false  // 不重试认证错误
      if (error.status === 404) return false  // 不重试 404
      return failureCount < 3
    },
    // 错误状态 UI
    error: (error) => <ErrorComponent error={error} />,
  })
}
```

### 9.3 自定义 Hook 封装

```typescript
// hooks/useTodos.ts
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data } = await api.get('/todos')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newTodo: CreateTodoInput) => api.post('/todos', newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.delete(`/todos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

### 9.4 性能优化

```typescript
// 1. 使用 select 减少不必要的渲染
const { data: todoCount } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.length,  // 只返回数量，不返回完整数组
})

// 2. 设置合适的 staleTime 减少请求
useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  staleTime: Infinity,  // 配置数据基本不变
})

// 3. 禁用不需要的后台刷新
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})
```

### 9.5 TypeScript 最佳实践

```typescript
// 1. 完整类型定义
interface Todo {
  id: number
  title: string
  completed: boolean
}

interface TodosResponse {
  data: Todo[]
  total: number
}

// 2. 使用泛型
const { data } = useQuery<TodosResponse, Error>({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})

// 3. mutation 类型
interface CreateTodoInput {
  title: string
}

const mutation = useMutation<Todo, Error, CreateTodoInput>({
  mutationFn: (input) => createTodo(input),
})
```

---

## 附录：常见问题

### Q: staleTime 和 cacheTime 的区别？

| 属性 | 旧名称 | 说明 |
|------|--------|------|
| staleTime | - | 数据被认为"新鲜"的时间，期间不会发起新请求 |
| gcTime | cacheTime | 缓存被垃圾回收的时间（无任何订阅后计时） |

### Q: isLoading 和 isFetching 的区别？

- `isLoading`: 首次加载中，无任何缓存数据
- `isFetching`: 任何形式的获取中，包括后台刷新

### Q: 如何处理乐观更新失败？

使用 `onMutate` 返回上下文，在 `onError` 中恢复：

```typescript
onMutate: async (newTodo) => {
  const previous = queryClient.getQueryData(['todos'])
  queryClient.setQueryData(['todos'], (old) => [...old!, newTodo])
  return { previous }
},
onError: (_err, _newTodo, context) => {
  queryClient.setQueryData(['todos'], context?.previous)
},
```

---

> 文档版本: TanStack Query v5
>
> 最后更新: 2026-04-21
