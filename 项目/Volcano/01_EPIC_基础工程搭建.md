# Epic 1: 基础工程搭建（详细版）

**优先级**: P0  
**预计工作量**: 5 人日  
**Feature 数量**: 3

**技术栈决策（来自 PRD）**:
- ✅ Next.js 14+ (App Router)
- ✅ TypeScript (Strict Mode)
- ✅ tRPC (类型安全 API)
- ✅ TanStack Query (数据获取)
- ✅ Prisma + PostgreSQL (数据库)
- ✅ better-auth (认证)
- ✅ Cloudflare R2 (存储)
- ✅ Inngest (任务编排)

---

## Feature 1.1: 项目脚手架

### Change 1.1.1: 初始化 Next.js 项目

**Change ID**: `setup-nextjs-base`

**Goal**: 创建 Next.js 14+ 项目，配置 TypeScript、TailwindCSS

**Scope**:
- 包含: 初始化 Next.js、安装核心依赖、配置 TypeScript、TailwindCSS、ESLint、Prettier
- 不包含: 业务代码、数据库配置、第三方服务集成

**Implementation Details**:

#### 1. 初始化项目
```bash
npx create-next-app@latest volcano-platform --typescript --tailwind --app --eslint
cd volcano-platform
```

选项：
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ✅ `src/` directory
- ❌ Turbopack (可选)

#### 2. 核心依赖
```json
// package.json 需要的依赖
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

#### 3. TypeScript 配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**Files Likely Affected**:
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.ts`
- `.eslintrc.json`
- `/app/layout.tsx`
- `/app/page.tsx`

**Dependencies**: 无

**Acceptance Criteria**:
- Given 执行 `npm create next-app@latest`
- When 选择 TypeScript、TailwindCSS、App Router
- Then 项目可以成功启动 `npm run dev`
- Then 访问 http://localhost:3000 显示 Next.js 欢迎页
- Then `npm run build` 构建成功，无 TypeScript 错误

**Estimated Size**: XS
**Estimated LOC**: 300
**Priority**: P0

---

### Change 1.1.2: 配置项目结构

**Change ID**: `setup-project-structure`

**Goal**: 建立标准目录结构

**Scope**:
- 包含: 创建 `/lib`、`/components`、`/server`、`/types` 目录
- 不包含: 具体业务模块

**Implementation Details**:

创建以下目录结构：
```
/
├── app/                    # Next.js App Router
├── components/             # React 组件
│   ├── ui/                 # 基础 UI 组件
│   ├── layout/             # 布局组件
│   └── ...
├── lib/                    # 工具函数和配置
│   ├── utils.ts
│   ├── env.ts
│   └── ...
├── server/                 # 服务端代码
│   ├── routers/            # tRPC routers
│   ├── trpc.ts
│   └── context.ts
├── types/                  # TypeScript 类型定义
│   └── index.ts
├── prisma/                 # Prisma schema
│   └── schema.prisma
└── public/                 # 静态资源
```

**Files Likely Affected**:
- `/lib/` (新建)
- `/components/` (新建)
- `/server/` (新建)
- `/types/` (新建)
- 各目录下的 README.md

**Dependencies**: `setup-nextjs-base`

**Acceptance Criteria**:
- Given 项目已初始化
- When 创建标准目录结构
- Then 所有目录都存在
- Then 每个目录包含 README.md 说明用途

**Estimated Size**: XS
**Estimated LOC**: 100
**Priority**: P0

---

### Change 1.1.3: 配置 tRPC

**Change ID**: `setup-trpc`

**Goal**: 集成 tRPC 用于类型安全的 API

**Scope**:
- 包含: 安装 tRPC、配置 server、client、API route
- 不包含: 具体业务 router

**Implementation Details**:

#### 1. 安装依赖
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

#### 2. 创建 tRPC Server
```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

#### 3. 创建 App Router
```typescript
// server/routers/_app.ts
import { router } from '../trpc';

export const appRouter = router({
  // 业务 routers 将在后续添加
});

export type AppRouter = typeof appRouter;
```

#### 4. 创建 API Route
```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```

#### 5. 创建客户端
```typescript
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

**Files Likely Affected**:
- `/server/trpc.ts`
- `/server/context.ts`
- `/server/routers/_app.ts`
- `/lib/trpc/client.ts`
- `/app/api/trpc/[trpc]/route.ts`

**Dependencies**: `setup-project-structure`

**Acceptance Criteria**:
- Given tRPC 已安装
- When 创建测试 router 返回 `{ message: "Hello" }`
- Then 客户端可以成功调用并获得类型提示
- Then 访问 `/api/trpc/hello` 返回正确响应

**Estimated Size**: S
**Estimated LOC**: 500
**Priority**: P0

---

### Change 1.1.4: 配置 TanStack Query

**Change ID**: `setup-tanstack-query`

**Goal**: 集成 TanStack Query 用于数据获取和缓存

**Scope**:
- 包含: 安装 @tanstack/react-query、配置 QueryClient、Provider
- 不包含: 具体业务查询

**Implementation Details**:

#### 1. 创建 QueryClient
```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分钟
      refetchOnWindowFocus: false,
    },
  },
});
```

#### 2. 创建 Provider
```typescript
// components/providers/query-provider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { trpc } from '@/lib/trpc/client';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

#### 3. 在 Layout 中使用
```typescript
// app/layout.tsx
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

**Files Likely Affected**:
- `/lib/query-client.ts`
- `/components/providers/query-provider.tsx`
- `/app/layout.tsx`

**Dependencies**: `setup-trpc`

**Acceptance Criteria**:
- Given TanStack Query 已安装
- When 在 layout 中添加 QueryClientProvider
- Then React Query DevTools 在开发环境可用
- Then tRPC hooks 可以正常使用（如 `trpc.hello.useQuery()`）

**Estimated Size**: XS
**Estimated LOC**: 200
**Priority**: P0

---

## Feature 1.2: 数据库模型

### Change 1.2.1: 安装配置 Prisma

**Change ID**: `setup-prisma`

**Goal**: 安装 Prisma 并配置数据库连接

**Scope**:
- 包含: 安装 Prisma、初始化、配置 PostgreSQL 连接
- 不包含: 具体表定义

**Implementation Details**:

#### 1. 安装依赖
```bash
npm install @prisma/client
npm install -D prisma
```

#### 2. 初始化 Prisma
```bash
npx prisma init
```

这会创建：
- `prisma/schema.prisma`
- `.env` 文件（包含 DATABASE_URL）

#### 3. 配置 schema.prisma
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 4. 创建 Prisma Client 单例
```typescript
// lib/prisma.ts
import { PrismaClient } from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```
