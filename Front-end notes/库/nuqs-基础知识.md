# nuqs 基础知识

> nuqs (Next.js URL Query State) - React 类型安全的 URL 状态管理库

## 特性

- **类型安全** - 端到端的 TypeScript 类型支持
- **通用** - 支持 Next.js、React SPA、Remix、React Router、TanStack Router
- **简单** - 类似 `React.useState` 的 API，与 URL 同步
- **内置解析器** - 支持常见数据类型的解析和序列化
- **体积小** - 仅 6KB gzipped
- **零依赖** - 纯 TypeScript 实现

## 安装

```bash
npm install nuqs
# 或
pnpm add nuqs
# 或
yarn add nuqs
```

## 快速开始

### 最简单的示例

```tsx
'use client'

import { useQueryState } from 'nuqs'

export function Demo() {
  const [name, setName] = useQueryState('name')

  return (
    <input
      value={name || ''}
      onChange={e => setName(e.target.value)}
    />
  )
}
```

## 基础用法

### useQueryState

`useQueryState` 是 nuqs 的核心 hook，替代 `React.useState`，将状态同步到 URL：

```tsx
'use client'

import { useQueryState } from 'nuqs'

export function Demo() {
  const [name, setName] = useQueryState('name')

  return (
    <>
      <input value={name || ''} onChange={e => setName(e.target.value)} />
      <button onClick={() => setName(null)}>Clear</button>
      <p>Hello, {name || 'anonymous visitor'}!</p>
    </>
  )
}
```

**返回值说明：**

| URL | name 值 | 说明 |
|---|---|---|
| `/` | `null` | 无 name 参数 |
| `/?name=` | `''` | 空字符串 |
| `/?name=foo` | `'foo'` | 正常值 |

**设置 `null` 会从 URL 中移除该参数。**

### 默认值

当 URL 中没有对应参数时，默认返回 `null`。可以使用默认值避免空值处理：

```tsx
// 方式1：通过 defaultValue 选项
const [search] = useQueryState('search', { defaultValue: '' })
//      ^? string

// 方式2：通过解析器的 withDefault 方法
const [count] = useQueryState('count', parseAsInteger.withDefault(0))
//      ^? number
```

注意：

- 默认值仅存在于 React 状态中，**不会自动写入 URL**

- 设置值为 `null` 会清除 URL 参数，并返回默认值

## 内置解析器

当状态类型不是字符串时，需要使用解析器将 URL 参数转换为对应类型：

### 导入解析器

```tsx
import {
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsTimestamp,
  parseAsIsoDateTime,
  parseAsIsoDate,
  parseAsJson,
  parseAsArrayOf,
  parseAsNativeArrayOf,
  parseAsStringLiteral,
  parseAsNumberLiteral,
  parseAsIndex
} from 'nuqs'
```

### 数字类型

```tsx
// 整数
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
//      ^? number

// 浮点数（经纬度等）
const [lat, setLat] = useQueryState('lat', parseAsFloat.withDefault(0))
//      ^? number

// 分页索引（内部 0 索引，URL 显示 +1）
const [pageIndex, setPageIndex] = useQueryState(
  'page',
  parseAsIndex.withDefault(0)
)
```

### 布尔类型

```tsx
const [darkMode, setDarkMode] = useQueryState(
  'dark',
  parseAsBoolean.withDefault(false)
)
```

### 字符串字面量

用于类型安全的枚举值：

```tsx
const sortOrder = parseAsStringLiteral(['asc', 'desc'] as const)

const [order, setOrder] = useQueryState('order', sortOrder.withDefault('asc'))
//      ^? 'asc' | 'desc'

// 数字字面量
const pageSize = parseAsNumberLiteral([10, 20, 50] as const)
const [size, setSize] = useQueryState('size', pageSize.withDefault(10))
```

### 日期时间

```tsx
// 时间戳（毫秒 Unix 时间）
const [timestamp, setTimestamp] = useQueryState('ts', parseAsTimestamp)

// ISO 8601 日期时间
const [dateTime, setDateTime] = useQueryState('dt', parseAsIsoDateTime)

// ISO 8601 日期
const [date, setDate] = useQueryState('date', parseAsIsoDate)
```

### 数组类型

```tsx
// 使用逗号分隔的数组
const [tags, setTags] = useQueryState(
  'tags',
  parseAsArrayOf(parseAsString)
)
// URL: ?tags=a,b,c

// 原生数组格式（重复键）
const [ids, setIds] = useQueryState(
  'id',
  parseAsNativeArrayOf(parseAsInteger).withDefault([])
)
// URL: ?id=1&id=2&id=3
```

### JSON 类型

使用 Zod 或其他支持 Standard Schema 的库进行验证：

```tsx
import { parseAsJson } from 'nuqs'
import { z } from 'zod'

const schema = z.object({
  pkg: z.string(),
  version: z.number()
})

const [data, setData] = useQueryState('data', parseAsJson(schema))

// 设置值
setData({ pkg: 'nuqs', version: 2 })
// URL: ?data=%7B%22pkg%22%3A%22nuqs%22%2C%22version%22%3A2%7D
```

也支持 Yup、Joi 等验证库：

```tsx
import { parseAsJson } from 'nuqs'
import { object, string, number } from 'yup'

const schema = object({
  name: string().required(),
  age: number().required()
})

const [user, setUser] = useQueryState('user', parseAsJson(schema.validateSync))
```

## 多个查询参数

### useQueryStates

管理多个相关联的查询参数：

```tsx
import { useQueryStates, parseAsFloat } from 'nuqs'

const [coords, setCoords] = useQueryStates({
  lat: parseAsFloat.withDefault(45.18),
  lng: parseAsFloat.withDefault(5.72)
})

// 同时设置多个
setCoords({ lat: 48.85, lng: 2.35 })

// 部分更新
setCoords({ lat: 48.85 })

// 清除所有
setCoords(null)
```

### URL 键重映射

使用短键名优化 URL：

```tsx
const [{ latitude, longitude }, setCoords] = useQueryStates(
  {
    latitude: parseAsFloat,
    longitude: parseAsFloat
  },
  {
    // URL 键映射
    urlKeys: {
      latitude: 'lat',
      longitude: 'lng'
    }
  }
)

// URL 显示: ?lat=45.18&lng=5.72
// 状态变量: { latitude: 45.18, longitude: 5.72 }
```

## 框架适配器

nuqs 需要通过适配器包装应用以提供路由功能。

### Next.js App Router

```tsx
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode } from 'react'

export default function Layout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

### Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
    </NuqsAdapter>
  )
}
```

### React SPA (Vite)

```tsx
// main.tsx
import { NuqsAdapter } from 'nuqs/adapters/react'

createRoot(document.getElementById('root')!).render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>
)
```

### Remix

```tsx
// app/root.tsx
import { NuqsAdapter } from 'nuqs/adapters/remix'

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}
```

### React Router v7

```tsx
// app/root.tsx
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { Outlet } from 'react-router'

export default function App() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}
```

### TanStack Router

```tsx
// routes/__root.tsx
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
})
```

## 选项配置

### history - 历史记录

控制浏览器历史栈行为：

```tsx
// 默认：替换当前历史记录（类似 git squash）
useQueryState('key', { history: 'replace' })

// 追加新历史记录（支持浏览器后退按钮）
useQueryState('key', { history: 'push' })
```

### shallow - 服务端同步

控制是否通知服务端重新渲染：

```tsx
// 默认：浅更新，不触发服务端请求
useQueryState('key', { shallow: true })

// 触发服务端重新渲染（RSC/loader）
useQueryState('key', { shallow: false })
```

在 Next.js App Router 中，`shallow: false` 会更新 `searchParams` 并触发 RSC 重新渲染。

### scroll - 滚动

控制是否滚动到页面顶部：

```tsx
// 默认：不滚动
useQueryState('key', { scroll: false })

// 滚动到顶部
useQueryState('key', { scroll: true })
```

### clearOnDefault - 默认值清除

设置值为默认值时是否清除 URL 参数：

```tsx
// 默认：true - 设为默认值时清除参数
useQueryState('page', parseAsInteger.withDefault(1))

// 设为 false 时保留参数
useQueryState('page', parseAsInteger.withDefault(1).withOptions({
  clearOnDefault: false
}))
```

### 限流更新

高频率更新（如输入框、滑块）需要限流：

```tsx
import { useQueryState, parseAsString, throttle, debounce } from 'nuqs'

// 节流：立即发送，之后定期批量发送
useQueryState('key', {
  limitUrlUpdates: throttle(100)  // 100ms
})

// 防抖：等待最后一次操作后发送
useQueryState('key', {
  limitUrlUpdates: debounce(500)  // 500ms
})
```

在搜索框中使用防抖：

```tsx
function SearchInput() {
  const [search, setSearch] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      shallow: false
    })
  )

  return (
    <input
      value={search}
      onChange={e => {
        // 输入时防抖
        setSearch(e.target.value, {
          limitUrlUpdates: debounce(500)
        })
      }}
      onKeyDown={e => {
        // 回车时立即发送
        if (e.key === 'Enter') {
          setSearch(e.target.value)
        }
      }}
    />
  )
}
```

### 全局默认配置

在适配器上设置全局默认选项：

```tsx
import { NuqsAdapter, throttle } from 'nuqs'

<NuqsAdapter
  defaultOptions={{
    shallow: false,
    scroll: true,
    clearOnDefault: false,
    limitUrlUpdates: throttle(250)
  }}
>
  {children}
</NuqsAdapter>
```

### Transitions

配合 `useTransition` 获取加载状态：

```tsx
'use client'

import React from 'react'
import { useQueryState, parseAsString } from 'nuqs'

function ClientComponent() {
  const [isLoading, startTransition] = React.useTransition()

  const [query, setQuery] = useQueryState(
    'query',
    parseAsString.withOptions({
      startTransition,
      shallow: false
    })
  )

  if (isLoading) return <div>Loading...</div>

  return <div>{query}</div>
}
```

## 服务端使用

### createSearchParamsCache

在 Next.js App Router 的服务端组件中使用：

```tsx
import { getQueryState } from 'nuqs/server'
import {
  parseAsString,
  parseAsInteger
} from 'nuqs/server'

export default function Page({ searchParams }) {
  const parsed = getQueryState(searchParams, {
    query: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1)
  })

  // parsed.query - 类型为 string
  // parsed.page - 类型为 number

  return <Component query={parsed.query} page={parsed.page} />
}
```

**注意**：服务端必须从 `nuqs/server` 导入解析器。

## 常见用法示例

### 分页组件

```tsx
'use client'

import { useQueryState, parseAsInteger } from 'nuqs'

function Pagination() {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1)
  )

  return (
    <div>
      <button
        onClick={() => setPage(p => (p ?? 1) - 1)}
        disabled={page <= 1}
      >
        上一页
      </button>
      <span>第 {page} 页</span>
      <button onClick={() => setPage(p => (p ?? 1) + 1)}>
        下一页
      </button>
    </div>
  )
}
```

### 筛选面板

```tsx
'use client'

import {
  useQueryStates,
  parseAsStringLiteral,
  parseAsBoolean
} from 'nuqs'

const statusFilter = parseAsStringLiteral(['all', 'active', 'completed'] as const)
const showArchived = parseAsBoolean.withDefault(false)

function Filters() {
  const [filters, setFilters] = useQueryStates({
    status: statusFilter.withDefault('all'),
    archived: showArchived
  })

  return (
    <div>
      <select
        value={filters.status}
        onChange={e => setFilters({ status: e.target.value })}
      >
        <option value="all">全部</option>
        <option value="active">进行中</option>
        <option value="completed">已完成</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={filters.archived}
          onChange={e => setFilters({ archived: e.target.checked })}
        />
        显示归档
      </label>
    </div>
  )
}
```

### 排序控制

```tsx
'use client'

import {
  useQueryStates,
  parseAsStringLiteral
} from 'nuqs'

const sortOrder = parseAsStringLiteral(['asc', 'desc'] as const)
const sortBy = parseAsStringLiteral(['date', 'name', 'price'] as const)

function SortControl() {
  const [sort, setSort] = useQueryStates({
    order: sortOrder.withDefault('desc'),
    sortBy: sortBy.withDefault('date')
  })

  return (
    <div>
      <button
        onClick={() =>
          setSort({
            order: sort.order === 'asc' ? 'desc' : 'asc'
          })
        }
      >
        {sort.order === 'asc' ? '↑' : '↓'}
      </button>

      <select
        value={sort.sortBy}
        onChange={e => setSort({ sortBy: e.target.value })}
      >
        <option value="date">日期</option>
        <option value="name">名称</option>
        <option value="price">价格</option>
      </select>
    </div>
  )
}
```

## 使用场景

适合将 UI 状态放入 URL：
- **过滤条件** - 状态筛选、分类选择
- **搜索查询** - 搜索框输入
- **排序** - 排序方式和方向
- **分页** - 当前页码
- **面板切换** - 标签页、折叠面板
- **用户偏好** - 主题、语言等

## 注意事项

- **URL 长度** - 限制约 2000 字符
- **安全性** - URL 参数对用户可见，不适合敏感数据
- **history** - 谨慎使用 `history: 'push'`，以免影响用户体验

## 参考链接

- 官方文档：https://nuqs.dev
- GitHub：https://github.com/47ng/nuqs
- 在线演示：https://nuqs.dev/playground