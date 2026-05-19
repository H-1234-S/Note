## tRPC 学习指南

> 基于 tRPC 11.x 主线整理。tRPC 的核心价值是“后端定义一次 API，前端自动获得完整 TypeScript 类型”。它不是 REST 的文档生成器，也不是 GraphQL 的 Schema 语言，而是 TypeScript 项目内部的类型安全 RPC 层。

---

## 1. tRPC 是什么

tRPC，全称 TypeScript Remote Procedure Call。它让前端像调用本地函数一样调用服务端 Procedure，同时把输入、输出、错误类型从服务端路由自动推导到客户端。

### 1.1 它解决的问题

| 传统 API 痛点 | tRPC 的做法 |
| --- | --- |
| 前后端接口类型容易不同步 | 从服务端 Router 推导客户端类型 |
| REST 路径、方法、请求体要手动约定 | 用 Procedure 表达 Query / Mutation / Subscription |
| OpenAPI / GraphQL 需要额外 Schema 或代码生成 | 直接使用 TypeScript 类型推导 |
| 输入校验散落在业务代码里 | `.input(zodSchema)` 在 Procedure 入口校验 |
| 客户端缓存、请求状态重复封装 | 与 TanStack Query 深度集成 |

### 1.2 适合与不适合

适合：

- 前后端都在 TypeScript 项目中。
- Next.js、React、Node.js 全栈应用。
- 中小型团队想快速获得端到端类型安全。
- 和 Prisma、Zod、TanStack Query 一起构建业务系统。

不适合：

- 公开 API 需要被多语言客户端消费。
- 后端不是 TypeScript。
- 需要强协议治理、跨团队 API 契约、独立 SDK 发布。
- API 必须天然支持 GraphQL 式字段选择。

### 1.3 和 REST / GraphQL 的区别

| 维度 | tRPC | REST | GraphQL |
| --- | --- | --- | --- |
| 契约来源 | TypeScript Router | URL + 文档 | GraphQL Schema |
| 类型同步 | 自动推导 | 手动或代码生成 | 代码生成常见 |
| 学习成本 | 低，主要是 TS | 低 | 中高 |
| 跨语言 | 弱 | 强 | 强 |
| 缓存语义 | 依赖 TanStack Query / HTTP | HTTP 原生友好 | 依赖客户端 |
| 适合 | TS 全栈内部 API | 通用 Web API | 多端复杂查询 |

---

## 2. 核心架构

```text
React Component
    |
    | useQuery / useMutation
    v
tRPC Client
    |
    | link: httpBatchLink / httpLink / wsLink
    v
HTTP endpoint / WebSocket
    |
    v
tRPC Adapter
    |
    v
AppRouter -> Procedure -> Context -> Business logic -> Database
```

### 2.1 核心概念

| 概念 | 说明 |
| --- | --- |
| `initTRPC` | 创建 tRPC 基础工具 |
| Router | 一组 Procedure 的集合，可嵌套、可合并 |
| Procedure | 一个可被客户端调用的服务端函数 |
| Query | 读取数据的 Procedure |
| Mutation | 修改数据的 Procedure |
| Subscription | 实时数据订阅 Procedure |
| Context | 每次请求共享的服务端上下文，如用户、数据库、请求头 |
| Middleware | Procedure 执行前后的横切逻辑，如认证、日志、权限 |
| Link | 客户端传输层，如批量 HTTP、WebSocket、日志 |
| Transformer | 序列化器，如 `superjson` 支持 Date / Map / Set |
| Caller | 服务端直接调用 Router 的方式，常用于 RSC、测试、内部任务 |

### 2.2 Procedure 的三种类型

```typescript
const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { text: `hello ${input.name}` }
    }),

  createPost: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({ data: input })
    }),
})
```

- Query：读取，不应该产生业务副作用。
- Mutation：创建、更新、删除、提交动作。
- Subscription：实时推送，通常基于 WebSocket 或 async iterable。

---

## 3. 安装与项目结构

### 3.1 基础安装

```bash
npm install @trpc/server @trpc/client zod
```

React 经典 hooks 路线：

```bash
npm install @trpc/react-query @tanstack/react-query
```

tRPC v11 推荐的 TanStack Query 集成路线：

```bash
npm install @trpc/tanstack-react-query @tanstack/react-query
```

常用增强：

```bash
npm install superjson
```

### 3.2 推荐目录

```text
src/
├─ server/
│  ├─ context.ts
│  ├─ trpc.ts
│  └─ routers/
│     ├─ _app.ts
│     ├─ user.ts
│     └─ post.ts
├─ trpc/
│  ├─ client.tsx
│  ├─ query-client.ts
│  └─ server.tsx
├─ lib/
│  └─ prisma.ts
└─ app/ 或 pages/
```

原则：

- `server/trpc.ts` 只放 tRPC 初始化、公共 procedure、中间件。
- `server/context.ts` 只负责构造请求上下文。
- `server/routers` 按业务域拆分。
- 客户端只导入 `AppRouter` 类型，不导入服务端运行时代码。

---

## 4. 服务端基础

### 4.1 Context

```typescript
// src/server/context.ts
import { prisma } from '@/lib/prisma'

export async function createContext(opts: { headers: Headers }) {
  const authorization = opts.headers.get('authorization')
  const user = authorization
    ? await getUserFromToken(authorization)
    : null

  return {
    prisma,
    user,
    headers: opts.headers,
  }
}

async function getUserFromToken(token: string) {
  return { id: 'user_1', role: 'USER' as const }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

Context 是服务端能力的入口。数据库连接、登录用户、租户信息、请求头都应该从这里传给 Procedure。

### 4.2 tRPC 初始化

```typescript
// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
```

### 4.3 子路由

```typescript
// src/server/routers/post.ts
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const postRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
      })

      const hasMore = posts.length > input.limit
      const items = hasMore ? posts.slice(0, input.limit) : posts

      return {
        items,
        nextCursor: hasMore ? items.at(-1)!.id : null,
      }
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      content: z.string().max(5000).optional(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      })
    }),
})
```

### 4.4 App Router

```typescript
// src/server/routers/_app.ts
import { router } from '../trpc'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = router({
  post: postRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter
```

客户端调用路径会变成：

```typescript
trpc.post.list
trpc.post.create
trpc.user.profile
```

---

## 5. 输入、输出与验证

### 5.1 输入验证

```typescript
const updateProfile = protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(50),
    bio: z.string().max(200).optional(),
  }))
  .mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: input,
    })
  })
```

`.input()` 的作用：

- 运行时校验外部输入。
- 把 `input` 推导成安全类型。
- 校验失败时自动返回 tRPC 格式错误。

### 5.2 输出验证

```typescript
const userSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
})

const profile = protectedProcedure
  .output(userSummarySchema)
  .query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.user.id },
      select: { id: true, name: true },
    })
  })
```

`.output()` 不是必需，但适合：

- API 边界非常重要。
- 需要避免泄露字段。
- 想让返回结构成为显式契约。

### 5.3 复用 Schema

```typescript
// src/server/schemas/post.ts
import { z } from 'zod'

export const createPostInput = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(5000).optional(),
})

export type CreatePostInput = z.infer<typeof createPostInput>
```

```typescript
create: protectedProcedure
  .input(createPostInput)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.post.create({ data: input })
  })
```

---

## 6. HTTP 适配器

### 6.1 Next.js App Router

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createContext } from '@/server/context'
import { appRouter } from '@/server/routers/_app'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ headers: req.headers }),
  })

export { handler as GET, handler as POST }
```

### 6.2 Express

```typescript
// src/server/index.ts
import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from './routers/_app'
import { createContext } from './context'

const app = express()

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) =>
      createContext({ headers: new Headers(req.headers as HeadersInit) }),
  }),
)

app.listen(4000)
```

### 6.3 Standalone Server

```typescript
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { appRouter } from './routers/_app'
import { createContext } from './context'

const server = createHTTPServer({
  router: appRouter,
  createContext: ({ req }) =>
    createContext({ headers: new Headers(req.headers as HeadersInit) }),
})

server.listen(4000)
```

---

## 7. 客户端路线一：经典 React Hooks

这是很多 tRPC 项目仍在使用的写法，来自 `@trpc/react-query`。

### 7.1 创建客户端工具

```typescript
// src/trpc/react.tsx
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

export function createTrpcClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: '/api/trpc',
        headers() {
          return {
            authorization: localStorage.getItem('token') ?? '',
          }
        },
      }),
    ],
  })
}
```

### 7.2 Provider

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { createTrpcClient, trpc } from './react'

export function TRPCProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => createTrpcClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

### 7.3 使用 Query

```tsx
'use client'

import { trpc } from '@/trpc/react'

export function PostList() {
  const posts = trpc.post.list.useQuery({ limit: 20 })

  if (posts.isLoading) return <p>加载中...</p>
  if (posts.error) return <p>{posts.error.message}</p>

  return (
    <ul>
      {posts.data?.items.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 7.4 使用 Mutation

```tsx
'use client'

import { trpc } from '@/trpc/react'

export function CreatePostForm() {
  const utils = trpc.useUtils()

  const createPost = trpc.post.create.useMutation({
    onSuccess() {
      utils.post.list.invalidate()
    },
  })

  return (
    <button
      onClick={() =>
        createPost.mutate({
          title: '新文章',
          content: '正文',
        })
      }
      disabled={createPost.isPending}
    >
      创建
    </button>
  )
}
```

---

## 8. 客户端路线二：tRPC v11 TanStack Query 集成

`@trpc/tanstack-react-query` 更贴近 TanStack Query v5 的 `queryOptions` / `mutationOptions` 风格，适合 Next.js App Router、RSC prefetch、hydration。

### 8.1 QueryClient

```typescript
// src/trpc/query-client.ts
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}
```

### 8.2 Client Provider

```tsx
// src/trpc/client.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import superjson from 'superjson'
import type { AppRouter } from '@/server/routers/_app'
import { makeQueryClient } from './query-client'

export const { TRPCProvider, useTRPC } =
  createTRPCContext<AppRouter>()

let browserQueryClient: ReturnType<typeof makeQueryClient>

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }

  return browserQueryClient
}

function getUrl() {
  if (typeof window !== 'undefined') return '/api/trpc'
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/trpc`
  return 'http://localhost:3000/api/trpc'
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
```

### 8.3 客户端组件调用

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

export function PostList() {
  const trpc = useTRPC()
  const posts = useQuery(trpc.post.list.queryOptions({ limit: 20 }))

  if (posts.isPending) return <p>加载中...</p>
  if (posts.error) return <p>{posts.error.message}</p>

  return (
    <ul>
      {posts.data.items.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 8.4 Mutation

```tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'

export function CreatePostButton() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createPost = useMutation(
    trpc.post.create.mutationOptions({
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: trpc.post.list.queryKey(),
        })
      },
    }),
  )

  return (
    <button
      onClick={() => createPost.mutate({ title: '新文章' })}
      disabled={createPost.isPending}
    >
      创建
    </button>
  )
}
```

---

## 9. Next.js App Router 与 RSC

### 9.1 根布局挂载 Provider

```tsx
// src/app/layout.tsx
import { TRPCReactProvider } from '@/trpc/client'

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <TRPCReactProvider>{props.children}</TRPCReactProvider>
      </body>
    </html>
  )
}
```

### 9.2 服务端 tRPC Options Proxy

```tsx
// src/trpc/server.tsx
import 'server-only'

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'
import { createContext } from '@/server/context'
import { appRouter } from '@/server/routers/_app'
import { createCallerFactory } from '@/server/trpc'
import { makeQueryClient } from './query-client'

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: async () => createContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
})

const createCaller = createCallerFactory(appRouter)

export const caller = createCaller(async () =>
  createContext({ headers: await headers() }),
)
```

### 9.3 服务端预取 + 客户端水合

```tsx
// src/app/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient, trpc } from '@/trpc/server'
import { PostList } from './post-list'

export default function Page() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.post.list.queryOptions({ limit: 20 }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  )
}
```

### 9.4 服务端直接调用

```tsx
// src/app/profile/page.tsx
import { caller } from '@/trpc/server'

export default async function ProfilePage() {
  const profile = await caller.user.profile()

  return <pre>{JSON.stringify(profile, null, 2)}</pre>
}
```

直接 caller 适合服务端组件、后台任务、测试；它不会自动进入客户端 Query Cache。想让客户端复用数据时，使用 `prefetchQuery + HydrationBoundary`。

---

## 10. Link、Transformer 与请求控制

### 10.1 `httpBatchLink`

```typescript
httpBatchLink({
  url: '/api/trpc',
  maxURLLength: 2083,
  headers() {
    return {
      authorization: getToken(),
    }
  },
})
```

`httpBatchLink` 会把同一轮事件循环内的多个请求合并成一个 HTTP 请求，减少网络开销。

### 10.2 `httpLink`

```typescript
httpLink({
  url: '/api/trpc',
})
```

每个 Procedure 一个 HTTP 请求。适合不想批处理、服务端对批处理不友好的场景。

### 10.3 `loggerLink`

```typescript
import { httpBatchLink, loggerLink } from '@trpc/client'

links: [
  loggerLink({
    enabled: (opts) =>
      process.env.NODE_ENV === 'development' ||
      (opts.direction === 'down' && opts.result instanceof Error),
  }),
  httpBatchLink({ url: '/api/trpc' }),
]
```

### 10.4 `splitLink`

```typescript
import { httpBatchLink, splitLink, wsLink, createWSClient } from '@trpc/client'

const wsClient = createWSClient({
  url: 'ws://localhost:3001',
})

links: [
  splitLink({
    condition(op) {
      return op.type === 'subscription'
    },
    true: wsLink({ client: wsClient }),
    false: httpBatchLink({ url: '/api/trpc' }),
  }),
]
```

### 10.5 `superjson`

服务端和客户端必须同时配置：

```typescript
// server
const t = initTRPC.context<Context>().create({
  transformer: superjson,
})
```

```typescript
// client
httpBatchLink({
  transformer: superjson,
  url: '/api/trpc',
})
```

用于安全传输 `Date`、`Map`、`Set`、`BigInt` 等普通 JSON 不擅长的值。

---

## 11. 认证与授权

### 11.1 认证放在 Context

```typescript
export async function createContext(opts: { headers: Headers }) {
  const token = opts.headers.get('authorization')?.replace('Bearer ', '')
  const user = token ? await verifyToken(token) : null

  return { user, prisma }
}
```

### 11.2 权限放在 Middleware

```typescript
const enforceAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next({ ctx })
})

export const adminProcedure = t.procedure.use(enforceAdmin)
```

### 11.3 按资源授权

```typescript
const updatePost = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(1),
  }))
  .mutation(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: { id: input.id },
      select: { authorId: true },
    })

    if (!post) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    if (post.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    return ctx.prisma.post.update({
      where: { id: input.id },
      data: { title: input.title },
    })
  })
```

---

## 12. 错误处理

### 12.1 服务端抛出 TRPCError

```typescript
import { TRPCError } from '@trpc/server'

const getById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: { id: input.id },
    })

    if (!post) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '文章不存在',
      })
    }

    return post
  })
```

### 12.2 常见错误码

| tRPC code | HTTP | 场景 |
| --- | --- | --- |
| `BAD_REQUEST` | 400 | 输入错误 |
| `UNAUTHORIZED` | 401 | 未登录 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `METHOD_NOT_SUPPORTED` | 405 | HTTP 方法不支持 |
| `TIMEOUT` | 408 | 超时 |
| `CONFLICT` | 409 | 状态冲突、唯一约束冲突 |
| `PRECONDITION_FAILED` | 412 | 前置条件失败 |
| `PAYLOAD_TOO_LARGE` | 413 | 请求体过大 |
| `INTERNAL_SERVER_ERROR` | 500 | 未预期错误 |

### 12.3 自定义错误格式

```typescript
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})
```

客户端：

```tsx
const post = trpc.post.getById.useQuery({ id })

if (post.error?.data?.code === 'NOT_FOUND') {
  return <p>文章不存在</p>
}
```

---

## 13. 缓存、失效与乐观更新

### 13.1 经典 hooks 失效缓存

```typescript
const utils = trpc.useUtils()

const createPost = trpc.post.create.useMutation({
  onSuccess() {
    utils.post.list.invalidate()
  },
})
```

### 13.2 TanStack Query 风格失效缓存

```typescript
const trpc = useTRPC()
const queryClient = useQueryClient()

const mutation = useMutation(
  trpc.post.create.mutationOptions({
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: trpc.post.list.queryKey(),
      })
    },
  }),
)
```

### 13.3 乐观更新

```typescript
const updateTitle = trpc.post.updateTitle.useMutation({
  async onMutate(input) {
    await utils.post.byId.cancel({ id: input.id })

    const previous = utils.post.byId.getData({ id: input.id })

    utils.post.byId.setData({ id: input.id }, (old) =>
      old ? { ...old, title: input.title } : old,
    )

    return { previous }
  },
  onError(_error, input, context) {
    utils.post.byId.setData({ id: input.id }, context?.previous)
  },
  onSettled(_data, _error, input) {
    utils.post.byId.invalidate({ id: input.id })
  },
})
```

---

## 14. Subscription

Subscription 用于实时消息、通知、进度流。服务端可以返回 async iterable。

```typescript
import { observable } from '@trpc/server/observable'

const messageRouter = router({
  onMessage: protectedProcedure.subscription(({ ctx }) => {
    return observable<{ text: string; from: string }>((emit) => {
      const unsubscribe = messageBus.on(ctx.user.id, (message) => {
        emit.next(message)
      })

      return () => {
        unsubscribe()
      }
    })
  }),
})
```

客户端通常配合 `wsLink` 或支持 subscription 的传输方式。普通 CRUD 项目可以先跳过，等真正需要实时能力再引入。

---

## 15. 测试

### 15.1 使用 Caller 测试 Router

```typescript
import { describe, expect, it } from 'vitest'
import { appRouter } from '@/server/routers/_app'

describe('post router', () => {
  it('lists posts', async () => {
    const caller = appRouter.createCaller({
      prisma: testPrisma,
      user: null,
      headers: new Headers(),
    })

    const result = await caller.post.list({ limit: 10 })

    expect(result.items).toEqual(expect.any(Array))
  })
})
```

### 15.2 测试建议

- Procedure 的输入边界用 Zod 测试覆盖。
- 认证中间件测试未登录、普通用户、管理员。
- 数据库逻辑用测试数据库，不要 mock 掉 Prisma 的所有行为。
- 对复杂 Router 使用 caller，比走 HTTP 更快。

---

## 16. 和 Prisma 的典型组合

### 16.1 架构分层

```text
Client Component
  -> tRPC client
  -> tRPC router / procedure
  -> service
  -> Prisma Client
  -> database
```

### 16.2 Router 调 Service

```typescript
// src/server/services/post.service.ts
import type { PrismaClient } from '@/generated/prisma/client'

export function createPostService(prisma: PrismaClient) {
  return {
    list(limit: number) {
      return prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
    },
  }
}
```

```typescript
// src/server/routers/post.ts
export const postRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(({ ctx, input }) => {
      return createPostService(ctx.prisma).list(input.limit)
    }),
})
```

简单项目可以直接在 Procedure 使用 Prisma；业务规则变复杂后再抽 Service。

---

## 17. 最佳实践清单

- Router 按业务域拆，不要把所有接口塞进 `_app.ts`。
- 每个外部输入都用 `.input()` 校验。
- 认证信息在 Context 解析，权限规则在 Middleware 或 Service 判断。
- 不在客户端导入服务端实现，只导入 `AppRouter` 类型。
- Prisma 只在服务端使用，前端通过 tRPC 调用。
- 返回给前端的数据用 `select` 控制字段，避免泄露敏感信息。
- Query 不做写操作，Mutation 不伪装成查询。
- 客户端缓存更新优先用 invalidate；交互要求高时再做乐观更新。
- Next.js App Router 中，RSC 预取用 `queryOptions + HydrationBoundary`。
- 公共开放 API 需要给外部用户使用时，优先考虑 REST/OpenAPI 或 GraphQL。

---

## 18. 学习路线

1. 理解 Router、Procedure、Context、Middleware、Link。
2. 用 standalone 或 Express 写一个最小服务端。
3. 加 Zod 输入校验，掌握 Query / Mutation。
4. 接入 React 客户端，练习 `useQuery`、`useMutation`、缓存失效。
5. 加 Prisma，把数据库访问放进 Context。
6. 加认证中间件，拆 `publicProcedure`、`protectedProcedure`、`adminProcedure`。
7. 学 Next.js App Router 集成、RSC prefetch、Hydration。
8. 学错误格式化、日志、测试、Subscription。

---

## 19. 常见问题

### Q1：tRPC 需要代码生成吗？

不需要。客户端从服务端导出的 `AppRouter` 类型中推导 API 类型。

### Q2：tRPC 可以给非 TypeScript 客户端用吗？

技术上可以通过 HTTP 调用，但体验会差很多。面向外部多语言客户端时，REST/OpenAPI 或 GraphQL 更合适。

### Q3：为什么还要 Zod？TypeScript 不是已经有类型了吗？

TypeScript 只在编译期存在，用户请求进来时是运行时数据。Zod 负责运行时校验。

### Q4：Query 和 Mutation 的区别只是名字吗？

不是。Query 面向读取并由 TanStack Query 缓存；Mutation 面向写入和副作用。混用会让缓存和语义都变乱。

### Q5：经典 `@trpc/react-query` 和新 `@trpc/tanstack-react-query` 选哪个？

新项目，尤其是 Next.js App Router，优先考虑 `@trpc/tanstack-react-query`。已有项目使用经典 hooks 没问题，迁移可以逐步做。

---

## 20. 官方参考

- [tRPC 官方文档](https://trpc.io/docs)
- [Routers](https://trpc.io/docs/server/routers)
- [Procedures](https://trpc.io/docs/server/procedures)
- [Context](https://trpc.io/docs/server/context)
- [React Query 集成](https://trpc.io/docs/client/react)
- [TanStack React Query 集成](https://trpc.io/docs/client/tanstack-react-query)
- [Next.js App Router 示例](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [Error Handling](https://trpc.io/docs/server/error-handling)

---

*更新时间：2026-05-19*
