# tRPC 在 Next.js 项目中的实践指南

本文档基于实际项目代码，整理 tRPC 的核心知识点和用法。

## 目录

1. [架构概述](#架构概述)
2. [核心概念](#核心概念)
3. [服务端配置](#服务端配置)
4. [客户端配置](#客户端配置)
5. [路由器与 Procedure](#路由器与-procedure)
6. [SSR 数据预加载](#ssr-数据预加载)
7. [类型安全](#类型安全)
8. [数据流动过程](#数据流动过程)

---

## 架构概述

```
┌─────────────────────────────────────────────────────────────────┐
│                         请求流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  客户端组件 ──useSuspenseQuery──→ tRPC Client ──HTTP────────→  │
│       ↑                                    │                     │
│       │                              httpBatchLink              │
│       │                                    ↓                     │
│  React Query ────────────────────→  /api/trpc 端点              │
│  缓存管理                              │                          │
│       ↑                                ↓                          │
│  HydrateClient ←─dehydrate─ QueryClient (服务端预加载)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心概念

### 1. Procedure（过程）

tRPC 中的基本单元，相当于 API 端点。分为三种类型：

| 类型 | 用途 | 示例 |
|------|------|------|
| `query` | 读取数据 | 获取列表、详情 |
| `mutation` | 修改数据 | 创建、更新、删除 |
| `subscription` | 实时数据 | WebSocket（本项目未使用） |

### 2. Router（路由器）

组合多个 Procedure 的容器，类似于 Express 的路由。

### 3. Middleware（中间件）

在 Procedure 执行前进行验证，如身份认证、组织权限检查。

---

## 服务端配置

### 文件结构

```
src/trpc/
├── init.ts           # 初始化配置、Procedure 定义
├── client.tsx        # 客户端 Provider
├── server.tsx        # 服务端工具
├── query-client.ts   # TanStack Query 客户端
└── routers/
    ├── _app.ts       # 根路由器
    └── voices.ts     # Voices 路由器
```

### 初始化配置 (`init.ts`)

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from "superjson";

// 1. 创建 tRPC 实例，配置 superjson 转换器
// 作用：解决 Date、Map、Set 等特殊类型的序列化问题
const t = initTRPC.create({
  transformer: superjson,
});

// 2. 导出路由器创建器
export const createTRPCRouter = t.router;

// 3. 基础 Procedure（不包含中间件）
export const baseProcedure = t.procedure;

// 4. 认证 Procedure - 验证用户登录
export const authProcedure = t.procedure.use(async ({ next }) => {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { userId } });
});

// 5. 组织 Procedure - 验证用户属于某个组织
export const orgProcedure = t.procedure.use(async ({ next }) => {
  const { userId, orgId } = await auth();
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!orgId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Organization required" });
  }
  return next({ ctx: { userId, orgId } });
});
```

**关键点：**
- `transformer: superjson` 自动处理复杂数据类型的序列化
- 中间件通过 `t.procedure.use()` 创建
- `ctx` 用于传递上下文数据（如 userId、orgId）

---

## 客户端配置

### Provider 设置 (`client.tsx`)

```typescript
'use client';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';

// 1. 创建 Context 和 Hook
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// 2. 创建 tRPC 客户端，使用 httpBatchLink 批量发送请求
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: '/api/trpc',  // API 端点
    }),
  ],
});

// 3. 包装成 React Provider
export function TRPCReactProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

### 在布局中使用 (`layout.tsx`)

```typescript
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        {children}
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
```

---

## 路由器与 Procedure

### 根路由器 (`_app.ts`)

```typescript
import { createTRPCRouter } from '../init';
import { voicesRouter } from './voices';

// 组合所有子路由器
export const appRouter = createTRPCRouter({
  voices: voicesRouter,
});

// 导出类型供前端使用
export type AppRouter = typeof appRouter;
```

### Voices 路由器 (`voices.ts`)

```typescript
import { z } from "zod";
import { createTRPCRouter, orgProcedure } from "../init";

// 1. Query - 获取数据
getAll: orgProcedure
  .input(
    z.object({
      query: z.string().trim().optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    // ctx 包含 userId 和 orgId（来自中间件）
    // input 是客户端传入的参数
    
    const voices = await prisma.voice.findMany({
      where: {
        orgId: ctx.orgId,  // 数据隔离
      },
    });
    return voices;
  }),

// 2. Mutation - 修改数据
delete: orgProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await prisma.voice.delete({
      where: { id: input.id },
    });
    return { success: true };
  }),
```

---

## SSR 数据预加载

### 服务端预加载 (`server.tsx`)

```typescript
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// 1. 创建服务端代理对象
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// 2. 预加载数据
export function prefetch(queryOptions) {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(queryOptions);
}

// 3. 脱水组件 - 将服务端数据注入客户端
export function HydrateClient({ children }) {
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
```

### 页面中使用 (`page.tsx`)

```typescript
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export default async function Page() {
  // 1. 预加载数据
  prefetch(trpc.voices.getAll.queryOptions());

  // 2. 脱水注入客户端
  return (
    <HydrateClient>
      <ClientComponent />
    </HydrateClient>
  );
}
```

### 客户端读取 (`text-to-speech-view.tsx`)

```typescript
'use client';

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function TextToSpeechView() {
  const trpc = useTRPC();
  
  // 直接读取缓存，无需额外请求
  const { data } = useSuspenseQuery(trpc.voices.getAll.queryOptions());
  
  return <div>{data.custom.length} 个自定义音色</div>;
}
```

---

## 类型安全

### 前后端类型共享

```typescript
// 1. 后端导出路由器类型
export type AppRouter = typeof appRouter;

// 2. 客户端导入类型
import type { AppRouter } from "@/trpc/routers/_app";

// 3. 推断输入输出类型
import type { inferRouterOutputs } from "@trpc/server";

type GetAllOutput = inferRouterOutputs<AppRouter>["voices"]["getAll"];
// 结果: { custom: Voice[], system: Voice[] }
```

### Zod 输入验证

```typescript
// 使用 Zod 定义输入 schema
.input(
  z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    query: z.string().trim().optional(),
  })
)
```

---

## 数据流动过程

### 查询流程

```
1. 客户端 (useSuspenseQuery)
      ↓
2. tRPC Client (useTRPC)
      ↓
3. httpBatchLink → POST /api/trpc/voices.getAll
      ↓
4. fetchRequestHandler (API 路由)
      ↓
5. orgProcedure (中间件验证)
      ↓
6. voicesRouter.getAll (业务逻辑)
      ↓
7. Prisma (数据库查询)
      ↓
8. 返回数据 → superjson 序列化
      ↓
9. 客户端 superjson 反序列化
      ↓
10. React Query 缓存更新
```

### SSR 预加载流程

```
1. 服务器组件调用 prefetch()
      ↓
2. getQueryClient() 创建 QueryClient
      ↓
3. trpc.voices.getAll.queryOptions() 生成配置
      ↓
4. queryClient.prefetchQuery() 执行查询
      ↓
5. HydrateClient 组件
      ↓
6. dehydrate() 提取缓存数据
      ↓
7. superjson.serialize() 序列化为 JSON
      ↓
8. HTML 注入到页面
      ↓
9. 客户端加载，hydrate 反序列化
      ↓
10. useSuspenseQuery 直接读取缓存
```

---

## 常见用法

### 查询数据

```typescript
const trpc = useTRPC();
const { data } = useSuspenseQuery(trpc.voices.getAll.queryOptions());
```

### 带参数查询

```typescript
const { data } = useSuspenseQuery(
  trpc.voices.getAll.queryOptions({ query: searchQuery })
);
```

### 调用 Mutation

```typescript
const trpc = useTRPC();
const utils = trpc.useUtils();

const deleteVoice = trpc.voices.delete.useMutation({
  onSuccess: () => {
    utils.voices.getAll.invalidate();  // 刷新列表
  },
});

// 调用
deleteVoice.mutate({ id: "xxx" });
```

### 错误处理

```typescript
try {
  await trpc.voices.delete.mutateAsync({ id: "xxx" });
} catch (error) {
  if (error.code === "NOT_FOUND") {
    // 处理未找到
  }
}
```

---

## 总结

本项目使用的 tRPC 核心特性：

1. **类型安全** - 前后端类型自动共享
2. **中间件** - orgProcedure 实现组织级数据隔离
3. **SSR 支持** - prefetch + HydrateClient 实现零客户端加载
4. **superjson** - 自动处理复杂数据类型
5. **TanStack Query 集成** - 完善的缓存和状态管理
