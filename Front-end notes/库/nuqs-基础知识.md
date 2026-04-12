# nuqs 基础知识

> nuqs (Next.js URL Query State) - React 类型安全的 URL 状态管理库

## 特性

- **类型安全** - 端到端的 TypeScript 类型支持
- **通用** - 支持 Next.js、React SPA、Remix、React Router、TanStack Router
- **简单** - 类似 `React.useState` 的 API，与 URL 同步
- **内置解析器** - 支持常见数据类型的解析和序列化
- **体积小** - 仅 6KB gzipped

## 安装

```bash
npm install nuqs
# 或
pnpm add nuqs
# 或
yarn add nuqs
```

## 基础用法

### useQueryState

替代 `React.useState`，将状态同步到 URL：

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

返回值：
| URL | name 值 | 说明 |
|---|---|---|
| `/` | `null` | 无 name 参数 |
| `/?name=` | `''` | 空字符串 |
| `/?name=foo` | `'foo'` | 正常值 |

设置 `null` 会从 URL 中移除该参数。

### 默认值

```tsx
// 方式1：通过 defaultValue 选项
const [search] = useQueryState('search', { defaultValue: '' })

// 方式2：通过解析器的 withDefault 方法
const [count] = useQueryState('count', parseAsInteger.withDefault(0))
```

注意：默认值不会自动写入 URL，除非显式设置。

## 内置解析器

当状态类型不是字符串时，需要使用解析器：

```tsx
import {
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsTimestamp,
  parseAsIsoDateTime,
  parseAsJson,
  parseAsArrayOf,
  parseAsNativeArrayOf,
  parseAsStringLiteral,
  parseAsNumberLiteral
} from 'nuqs'
```

### 数字

```tsx
// 整数
const [page] = useQueryState('page', parseAsInteger.withDefault(1))

// 浮点数
const [lat] = useQueryState('lat', parseAsFloat.withDefault(0))

// 分页索引（+1 偏移）
const [pageIndex] = useQueryState('page', parseAsIndex.withDefault(0))
```

### 布尔

```tsx
const [darkMode] = useQueryState('dark', parseAsBoolean.withDefault(false))
```

### 字符串字面量

```tsx
const sortOrder = parseAsStringLiteral(['asc', 'desc'] as const)
const [order] = useQueryState('order', sortOrder.withDefault('asc'))
```

### 日期

```tsx
// 时间戳（毫秒）
const [timestamp] = useQueryState('ts', parseAsTimestamp)

// ISO 8601 日期时间
const [dateTime] = useQueryState('dt', parseAsIsoDateTime)

// ISO 8601 日期
const [date] = useQueryState('date', parseAsIsoDate)
```

### 数组

```tsx
// 使用分隔符的数组
const [ids] = useQueryState('ids', parseAsArrayOf(parseAsInteger))

// 原生数组格式（?id=1&id=2&id=3）
const [ids] = useQueryState(
  'id',
  parseAsNativeArrayOf(parseAsInteger).withDefault([])
)
```

### JSON

```tsx
import { parseAsJson } from 'nuqs'
import { z } from 'zod'

const schema = z.object({
  pkg: z.string(),
  version: z.number()
})

const [data] = useQueryState('data', parseAsJson(schema))
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

// 设置全部
setCoords({ lat: 48.85, lng: 2.35 })

// 设置部分
setCoords({ lat: 48.85 })

// 清除所有
setCoords(null)
```

### URL 键重映射

使用短 URL 键：

```tsx
const [{ latitude, longitude }, setCoords] = useQueryStates(
  {
    latitude: parseAsFloat,
    longitude: parseAsFloat
  },
  {
    urlKeys: {
      latitude: 'lat',
      longitude: 'lng'
    }
  }
)
```

## 选项

### history

控制历史记录行为：

```tsx
// 默认：替换当前历史记录
useQueryState('key', { history: 'replace' })

// 追加新历史记录（允许使用浏览器后退按钮）
useQueryState('key', { history: 'push' })
```

### shallow

控制是否通知服务端重新渲染：

```tsx
// 默认：浅更新，不触发服务端渲染
useQueryState('key', { shallow: true })

// 触发服务端重新渲染（RSC）
useQueryState('key', { shallow: false })
```

### clearOnDefault

设置值为默认值时是否清除 URL 参数：

```tsx
// 默认：true - 设为默认值时清除参数
useQueryState('page', parseAsInteger.withDefault(1))

// 设为 false 时会保留参数
useQueryState('page', parseAsInteger.withDefault(1).withOptions({
  clearOnDefault: false
}))
```

## 服务端使用

在 Next.js App Router 中服务端组件使用：

```tsx
import { getQueryState } from 'nuqs/server'

// 在 Server Component 中
export default function Page({ searchParams }) {
  const parsed = getQueryState(searchParams, {
    query: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1)
  })

  return <Compoent initialQuery={parsed.query} />
}
```

服务端使用 `nuqs/server` 导入解析器。

## 框架适配器

### Next.js App Router

```tsx
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function Layout({ children }) {
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
// app/_app.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

export default function App({ Component, pageProps }) {
  return (
    <NuqsAdapter>
      <Component {...pageProps} />
    </NuqsAdapter>
  )
}
```

### React Router v7

```tsx
// app/routes.ts
import { NuqsReactRouterAdapter } from 'nuqs/adapters/react-router-v7'

export default function Router() {
  return (
    <NuqsReactRouterAdapter>
      {/* routes */}
    </NuqsReactRouterAdapter>
  )
}
```

### 自定义路由

创建自定义适配器需要实现 `useRouter` 和 `useSearchParams` 两个 hook。

## 使用场景

适合将 UI 状态放入 URL：
- 过滤条件
- 搜索查询
- 排序
- 分页
- 面板切换
- 用户偏好设置

## 注意事项

- URL 有长度限制（约 2000 字符）
- 不适合存放敏感数据（URL 可见）
- 避免过度使用

## 参考链接

- 官方文档：https://nuqs.dev
- GitHub：https://github.com/47ng/nuqs