
tRPC（TypeScript Remote Procedure Call）是一个 TypeScript 优先的 RPC 框架

允许前端直接调用后端函数并获得端到端的类型安全，无需编写 API 文档或生成代码。

---
## 1. tRPC 简介

### 1.1 什么是 tRPC？

tRPC 是一个允许你在 TypeScript 前端和后端之间进行类型安全通信的框架。它消除了 API 契约、代码生成和模式验证的需要。

### 1.2 核心特点

| 特点 | 描述 |
|------|------|
| **类型安全** | 前后端共享 TypeScript 类型，编译时即可发现错误 |
| **无需代码生成** | 不需要生成 OpenAPI 规范或 Protractor 文件 |
| **零配置** | 自动推断类型，无需额外类型声明 |
| **高性能** | 基于 HTTP/2 或 WebSocket，轻量级传输 |
| **开发者友好** | 提供 IDE 自动补全和实时类型检查 |

### 1.3 工作原理

```
前端调用函数 → tRPC 传输 → 服务端路由 → 执行逻辑 → 返回结果 → 前端获得类型提示
```

tRPC 使用 Zod 进行运行时验证，使用 TypeScript 的类型推断确保编译时安全。

---

## 2. 核心概念

### 2.1 App Router（应用路由器）

tRPC v10+ 引入了 `AppRouter`，这是定义后端 API 的核心方式：

```typescript
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const appRouter = t.router({
  // 在这里定义 procedures
});

export type AppRouter = typeof appRouter;
```

### 2.2 Procedure（过程）

Procedure 是 tRPC 中的基本构建块，类似于 API 端点。有三种类型：

#### 2.2.1 Query（查询）

用于读取数据的 procedure，类似 GET 请求：

```typescript
const appRouter = t.router({
  // 无参数的 query
  getUser: t.procedure.query(async () => {
    return { id: 1, name: 'Alice' };
  }),

  // 带参数的 query（使用 Zod 进行输入验证）
  getUserById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return { id: input.id, name: 'Alice' };
    }),
});
```

#### 2.2.2 Mutation（变更）

用于修改数据的 procedure，类似 POST/PUT/DELETE 请求：

```typescript
const appRouter = t.router({
  createUser: t.procedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      // 创建用户的逻辑
      const user = await db.user.create({ data: input });
      return user;
    }),
});
```

#### 2.2.3 Subscription（订阅）

用于实时通信，基于 WebSocket：

```typescript
const appRouter = t.router({
  onMessage: t.procedure.subscription(async ({ ctx }) => {
    return new IterableIterator((push) => {
      const unsubscribe = ctx.pubsub.subscribe('messages', (data) => {
        push(data);
      });
      return unsubscribe;
    });
  }),
});
```

### 2.3 Context（上下文）

Context 是传递给每个 procedure 的共享数据，通常包含认证信息、数据库连接等：

```typescript
import { initTRPC } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    user: req.headers.authorization ? getUser(req) : null,
  };
};

const t = initTRPC.context<typeof createContext>().create();
```

### 2.4 Middleware（中间件）

中间件是在 procedure 执行前/后运行的逻辑：

```typescript
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user, // 扩大 ctx 类型
    },
  });
});

const protectedProcedure = t.procedure.use(isAuthenticated);
```

---

## 3. 环境搭建

### 3.1 基础项目结构

```
my-trpc-app/
├── src/
│   ├── server/
│   │   ├── index.ts      # 服务端入口
│   │   ├── router.ts     # 路由定义
│   │   └── context.ts    # 上下文配置
│   ├── client/
│   │   ├── index.ts      # 客户端配置
│   │   └── App.tsx       # React 组件
│   └── utils/
│       └── trpc.ts       # tRPC 客户端工具
├── package.json
└── tsconfig.json
```

### 3.2 安装依赖

```bash
# 基础依赖
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query

# Zod（用于输入验证）
npm install zod

# 可选：适配器
npm install @trpc/server/adapters/express  # Express
npm install @trpc/server/adapters/fastify  # Fastify
npm install @trpc/server/adapters/lambda   # AWS Lambda
```

### 3.3 package.json 配置

```json
{
  "name": "my-trpc-app",
  "scripts": {
    "dev": "tsx watch src/server/index.ts",
    "build": "tsc",
    "start": "node dist/server/index.js"
  },
  "dependencies": {
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@tanstack/react-query": "^5.17.0",
    "zod": "^3.22.0",
    "express": "^4.18.0",
    "superjson": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/express": "^4.17.0"
  }
}
```

---

## 4. 基础用法

### 4.1 创建服务端

```typescript
// src/server/index.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';

// 初始化 tRPC
const t = initTRPC.create();

// 创建 context
export const createContext = () => ({});

// 定义 router
export const appRouter = t.router({
  // Query 示例
  greeting: t.procedure.query(() => 'Hello from tRPC!'),

  // 带输入验证的 Query
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return { id: input.id, name: 'Alice' };
    }),

  // Mutation 示例
  createUser: t.procedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(({ input }) => {
      const user = { id: Math.random(), ...input };
      return user;
    }),
});

// 导出类型供前端使用
export type AppRouter = typeof appRouter;
```

### 4.2 创建 Express 适配器

```typescript
// src/server/index.ts 继续
import express from 'express';

const app = express();

app.use(express.json());

// 创建 tRPC 路由处理器
const tRPCHandler = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use('/trpc', tRPCHandler);

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
```

### 4.3 创建客户端

```typescript
// src/client/index.ts
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../server';

export const trpc = createTRPCReact<AppRouter>();
```

### 4.4 在 React 中使用

```typescript
// src/client/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, httpBatchLink } from './client';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4000/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserList />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function UserList() {
  const { data, isLoading } = trpc.getUser.useQuery({ id: 1 });

  if (isLoading) return <div>Loading...</div>;

  return <div>{data?.name}</div>;
}
```

---

## 5. 进阶用法

### 5.1 嵌套路由

```typescript
// 路由可以嵌套，形成模块化结构
const userRouter = t.router({
  getById: t.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => ({ id: input.id, name: 'Alice' })),

  create: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => ({ id: 1, ...input })),
});

const appRouter = t.router({
  user: userRouter,
  post: t.router({
    getAll: t.procedure.query(() => []),
    getById: t.procedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => ({ id: input.id, title: 'Post Title' })),
  }),
});

// 前端调用
trpc.user.getById.useQuery({ id: 1 });
trpc.post.getById.useQuery({ id: 1 });
```

### 5.2 使用 superjson 序列化

tRPC 默认使用 JSON 序列化，但不支持 Date、Map、Set 等类型。使用 `superjson` 可以解决：

```typescript
// 服务端
import superjson from 'superjson';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create({
  transformer: superjson,
});

// 客户端
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { httpBatchLink } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
});
```

### 5.3 分页处理

```typescript
const appRouter = t.router({
  getPosts: t.procedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().nullish(), // 用于游标分页
    }))
    .query(async ({ input }) => {
      const limit = input.limit;
      const cursor = input.cursor;

      const posts = await db.post.findMany({
        take: limit + 1, // 多取一条判断是否有更多
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: 'asc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return { posts, nextCursor };
    }),
});
```

### 5.4 文件上传

tRPC 本身不支持文件上传，但可以配合其他方案：

```typescript
// 使用 base64 编码（适合小文件）
const appRouter = t.router({
  uploadFile: t.procedure
    .input(z.object({
      name: z.string(),
      data: z.string(), // base64 编码
    }))
    .mutation(({ input }) => {
      // 处理文件
      return { url: `/uploads/${input.name}` };
    }),
});
```

---

## 6. 客户端应用

### 6.1 React Query 集成

tRPC 深度集成 React Query，保留了其所有功能：

```typescript
// useQuery
const { data, isLoading, error, refetch } = trpc.getUser.useQuery(
  { id: 1 },
  { staleTime: 5000 }
);

// useMutation
const createUser = trpc.createUser.useMutation({
  onSuccess: (data) => {
    queryClient.invalidateQueries(['user']); // 刷新缓存
  },
  onError: (error) => {
    console.error(error.message);
  },
});

// 调用 mutation
createUser.mutate({ name: 'Bob', email: 'bob@example.com' });

// 乐观更新
const updateUser = trpc.updateUser.useMutation({
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['user', newData.id]);
    const previous = queryClient.getQueryData(['user', newData.id]);
    queryClient.setQueryData(['user', newData.id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['user', newData.id], context.previous);
  },
});
```

### 6.2 多个 tRPC 客户端

```typescript
// 创建多个客户端实例
export const trpcAdmin = createTRPCReact<AdminRouter>();
export const trpcPublic = createTRPCReact<PublicRouter>();

// 使用
<trpcAdmin.Provider client={adminClient} queryClient={adminQueryClient}>
  <AdminPanel />
</trpcAdmin.Provider>
```

### 6.3 SSR（服务端渲染）

```typescript
// _app.tsx (Next.js Pages Router)
import { withTRPC } from '@trpc/next';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withTRPC({
  config: () => ({
    url: '/api/trpc',
  }),
})(MyApp);
```

```typescript
// app/layout.tsx (Next.js App Router)
'use client';
import { trpc } from './client';
import { headers } from 'next/headers';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4000/trpc',
          headers() {
            return {
              headers: Object.fromEntries(headers().entries()),
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

## 7. 中间件与上下文

### 7.1 完整的 Context 创建

```typescript
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { getServerSession } from './auth'; // 假设的认证函数

export interface Context {
  user: { id: string; name: string } | null;
  req: express.Request;
  res: express.Response;
}

export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const user = await getServerSession(req);

  return {
    user,
    req,
    res,
  };
};

const t = initTRPC.context<Context>().create();
```

### 7.2 链式中间件

```typescript
// 日志中间件
const logger = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  console.log(`${type} ${path} took ${duration}ms`);
  return result;
});

// 错误处理中间件
const errorHandler = t.middleware(async ({ error, next }) => {
  if (error instanceof TRPCError) {
    console.error(`tRPC Error: ${error.message}`);
  }
  return next();
});

// 使用中间件
const t2 = initTRPC.create({
  middleware: [logger, errorHandler],
});
```

### 7.3 受保护的 Procedure

```typescript
// 创建受保护的 procedure
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// 使用
const appRouter = t.router({
  getSecretData: protectedProcedure.query(({ ctx }) => {
    return { secret: 'This is protected data', user: ctx.user.name };
  }),
});
```

---

## 8. 错误处理

### 8.1 TRPCError

```typescript
import { TRPCError } from '@trpc/server';

const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with id ${input.id} not found`,
        });
      }

      return user;
    }),
});
```

### 8.2 错误代码

| 代码 | HTTP 对应 | 用途 |
|------|----------|------|
| `OK` | 200 | 成功 |
| `BAD_REQUEST` | 400 | 错误的请求 |
| `UNAUTHORIZED` | 401 | 未认证 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `TIMEOUT` | 408 | 请求超时 |
| `CONFLICT` | 409 | 资源冲突 |
| `INTERNAL_SERVER_ERROR` | 500 | 服务器内部错误 |

### 8.3 客户端错误处理

```typescript
function UserComponent({ id }: { id: number }) {
  const { data, error, isError } = trpc.getUser.useQuery({ id });

  if (isError) {
    return (
      <div>
        <h2>Error: {error.message}</h2>
        <p>Code: {error.code}</p>
        {error.data?.zodError && (
          <pre>{JSON.stringify(error.data.zodError, null, 2)}</pre>
        )}
      </div>
    );
  }

  return <div>{data?.name}</div>;
}
```

### 8.4 自定义错误格式化

```typescript
import { initTRPC } from '@trpc/server';

const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        message: error.message,
        code: error.code,
      },
    };
  },
});
```

---

## 9. 认证与授权

### 9.1 基于 Session 的认证

```typescript
// context.ts
export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const session = await getSession(req);

  return {
    user: session?.user ?? null,
  };
};

// router.ts
const userRouter = t.router({
  profile: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
```

### 9.2 基于 JWT 的认证

```typescript
// middleware.ts
const isAuthenticated = t.middleware(({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return next({
      ctx: {
        user: decoded as { id: string; role: string },
      },
    });
  } catch {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
});
```

### 9.3 基于角色的授权

```typescript
// 角色检查中间件
const hasRole = (roles: string[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({ ctx });
  });

const adminProcedure = t.procedure.use(hasRole(['admin']));

// 使用
const appRouter = t.router({
  adminDashboard: adminProcedure.query(() => {
    return { secret: 'Admin data' };
  }),
});
```

---

## 10. 最佳实践

### 10.1 项目结构

```
src/
├── server/
│   ├── index.ts           # 服务端入口
│   ├── router/
│   │   ├── index.ts       # 合并所有子路由
│   │   ├── user.ts        # 用户相关路由
│   │   ├── post.ts        # 文章相关路由
│   │   └── _app.ts        # App 级别路由（health check 等）
│   ├── context.ts         # Context 创建
│   └── trpc.ts            # tRPC 初始化
├── client/
│   ├── utils/
│   │   └── trpc.ts        # 客户端 tRPC 配置
│   └── ...
├── shared/
│   └── types.ts           # 共享类型（如果需要）
└── utils/
    └── zod.ts             # Zod schemas（可选集中管理）
```

### 10.2 命名约定

```typescript
// 使用一致的命名
const appRouter = t.router({
  // Query: 使用驼峰式名词（单数或复数）
  getUser: t.procedure.query(...),
  getPosts: t.procedure.query(...),

  // Mutation: 使用动词前缀
  createUser: t.procedure.mutation(...),
  updateUser: t.procedure.mutation(...),
  deleteUser: t.procedure.mutation(...),
});
```

### 10.3 输入验证

```typescript
// 始终验证输入，不要信任客户端数据
const createUser = t.procedure
  .input(
    z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      age: z.number().min(0).max(150).optional(),
      role: z.enum(['user', 'admin']).default('user'),
    })
  )
  .mutation(...);
```

### 10.4 性能优化

```typescript
// 1. 使用 httpBatchLink 而非单链接
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
      maxBatchSize: 10, // 限制批量大小
    }),
  ],
});

// 2. 设置适当的 staleTime
const { data } = trpc.getUser.useQuery({ id: 1 }, {
  staleTime: 60 * 1000, // 1 分钟
  gcTime: 5 * 60 * 1000, // 5 分钟（之前是 cacheTime）
});

// 3. 使用筛选字段减少数据传输
const { data } = trpc.getUser.useQuery({ id: 1 }, {
  select: (user) => ({ id: user.id, name: user.name }),
});
```

### 10.5 类型导出

```typescript
// 始终导出 AppRouter 类型供前端使用
export type AppRouter = typeof appRouter;

// 在 client/utils/trpc.ts 中导入
import type { AppRouter } from '../../server';
export const trpc = createTRPCReact<AppRouter>();
```

---

## 11. Next.js App Router 集成

本节介绍如何在 Next.js 13+ 的 App Router 中集成 tRPC，实现服务端渲染（SSR）和客户端 hydration。

### 11.1 推荐的文件结构

```
.
├── src
│   ├── app
│   │   ├── api
│   │   │   └── trpc
│   │   │       └── [trpc]
│   │   │           └── route.ts      # tRPC HTTP 处理器
│   │   ├── layout.tsx                # 根布局 - 挂载 TRPCReactProvider
│   │   └── page.tsx                  # 服务端组件
│   ├── trpc
│   │   ├── init.ts                   # tRPC 服务端初始化 & 上下文
│   │   ├── routers
│   │   │   ├── _app.ts               # 主应用路由
│   │   │   ├── post.ts               # 子路由示例
│   │   │   └── [...]
│   │   ├── client.tsx                # 客户端 hooks 和 provider
│   │   ├── query-client.ts           # 共享 QueryClient 工厂
│   │   └── server.tsx                # 服务端 caller
│   └── [...]
└── [...]
```

### 11.2 安装依赖

```bash
# 安装 tRPC 和相关依赖
npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query@latest zod

# 安装客户端/服务端专用的虚拟包
npm install client-only server-only

# 可选：安装 superjson 用于序列化 Date 等类型
npm install superjson

# 可选：AI 编程辅助
npx @tanstack/intent@latest install
```

### 11.3 创建 tRPC 初始化文件

首先创建 `trpc/init.ts`，这是 tRPC 服务端的入口点：

```typescript
// trpc/init.ts
import { initTRPC } from '@trpc/server';

/**
 * 创建上下文函数
 * 接收 headers 参数，以便在 RSC 服务端 caller 和 API 路由处理器中复用
 * 这里可以添加认证、数据库连接等逻辑
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // 示例：从 header 中获取用户信息（实际项目中需要真实认证逻辑）
  // const user = await auth(opts.headers);
  
  // 返回上下文对象，供所有 procedure 使用
  return { userId: 'user_123' };
};

// 使用 initTRPC 创建 tRPC 实例
// 避免直接导出整个 t 对象，因为可读性较差
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * 数据转换器配置
     * @see https://trpc.io/docs/server/data-transformers
     * 如需使用 superjson，设置为: transformer: superjson
     */
    // transformer: superjson,
  });

// 导出基础工具函数
export const createTRPCRouter = t.router;      // 创建路由器的辅助函数
export const createCallerFactory = t.createCallerFactory;  // 创建 caller 的工厂
export const baseProcedure = t.procedure;       // 基础 procedure
```

### 11.4 创建应用路由

创建 `trpc/routers/_app.ts`，定义你的 API 端点：

```typescript
// trpc/routers/_app.ts
import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';

/**
 * 主应用路由器
 * 所有的 API 端点都在这里定义
 */
export const appRouter = createTRPCRouter({
  // 定义一个 hello 查询接口
  hello: baseProcedure
    // 使用 Zod 进行输入验证 - 确保输入是字符串
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      // opts.input 包含经过验证的输入参数
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

// 导出 AppRouter 类型，供前端使用以获得完整的类型提示
export type AppRouter = typeof appRouter;
```

### 11.5 创建 API 路由处理器

在 Next.js App Router 中，使用 fetch 适配器来处理 tRPC 请求：

```typescript
// app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from './trpc/init';
import { appRouter } from './trpc/routers/_app';

/**
 * tRPC 请求处理函数
 * App Router 使用 fetch 适配器（而非 Next.js 特定适配器）
 * 因为 App Router 基于 Web 标准的 Request 和 Response 对象
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',    // API 端点前缀
    req,                       // 请求对象
    router: appRouter,         // 你的 tRPC 路由器
    createContext: () =>       // 创建上下文的函数
      createTRPCContext({ headers: req.headers }),
  });

// 导出 GET 和 POST 方法处理器
export { handler as GET, handler as POST };
```

### 11.6 创建 Query Client 工厂

创建 `trpc/query-client.ts`，用于在服务端和客户端创建 QueryClient 实例：

```typescript
// trpc/query-client.ts
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';

/**
 * 创建 QueryClient 实例的工厂函数
 * 在服务端和客户端调用方式不同
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // 查询的默认配置
      queries: {
        // 设置 staleTime 避免客户端立即重新获取数据
        staleTime: 30 * 1000, // 30 秒
      },
      // 服务端渲染时的数据脱水配置
      dehydrate: {
        // 如果使用 superjson，启用序列化: serializeData: superjson.serialize,
        
        // 决定哪些查询需要脱水
        // 除了默认的 pending 状态，还包含正在进行的查询
        // 这样可以在服务端组件中 prefetch，传递给客户端组件
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      // 客户端数据水合配置
      hydrate: {
        // 如果使用 superjson: deserializeData: superjson.deserialize,
      },
    },
  });
}
```

### 11.7 创建 tRPC 客户端 Provider

创建 `trpc/client.tsx`，这是客户端组件使用 tRPC 的入口点：

```typescript
// trpc/client.tsx
'use client'; // 确保可以从服务端组件挂载 Provider

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

// 创建 tRPC 上下文和 Provider
// 导出 useTRPC hook 供客户端组件使用
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// 浏览器端的 QueryClient 实例（单例）
let browserQueryClient: QueryClient;

/**
 * 获取 QueryClient 的函数
 * 服务端：每次创建新的 client
 * 浏览器：复用已存在的 client（避免 React suspend 时重新创建）
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端环境：始终创建新的 query client
    return makeQueryClient();
  } else {
    // 浏览器环境：如果没有 client 则创建一个
    // 重要：避免在初始渲染时 React suspend 后重新创建 client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * 获取 API 基础 URL 的函数
 * 根据环境返回正确的 URL
 */
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return ''; // 浏览器环境
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel 生产环境
    return 'http://localhost:3000'; // 本地开发环境
  })();
  return `${base}/api/trpc`;
}

/**
 * TRPCReactProvider 组件
 * 需要在根布局中挂载，为整个应用提供 tRPC 功能
 */
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // 注意：如果上方没有 Suspense boundary，避免使用 useState
  // 因为 React 会在初始渲染时丢弃 client
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          // 如果使用 superjson: transformer: superjson,
          url: getUrl(),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

然后在根布局中挂载 Provider：

```typescript
// app/layout.tsx
import { TRPCReactProvider } from '~/trpc/client';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 挂载 tRPC Provider，使子组件可以使用 tRPC hooks */}
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
```

### 11.8 创建服务端 Caller

创建 `trpc/server.tsx`，用于在服务端组件中调用 tRPC：

```typescript
// trpc/server.tsx
import 'server-only'; // 确保此文件不能被客户端导入

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

/**
 * 使用 React cache 缓存 QueryClient
 * 确保在同一请求中返回相同的 client
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * 创建 tRPC 服务端代理
 * 可以在服务端组件中直接调用，类似于客户端 hooks
 */
export const trpc = createTRPCOptionsProxy({
  // 异步创建上下文的函数
  ctx: async () =>
    createTRPCContext({
      headers: await headers(),
    }),
  router: appRouter,
  queryClient: getQueryClient,
});

// 如果你的路由器在独立服务器上，可以使用 client 代替：
// createTRPCOptionsProxy({
//   client: createTRPCClient({ links: [httpLink({ url: '...' })] }),
//   queryClient: getQueryClient,
// });
```

### 11.9 在服务端组件中 Prefetch 数据

在服务端组件中预获取数据，然后传递给客户端组件（Hydration）：

```typescript
// app/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '~/trpc/server';
import { ClientGreeting } from './client-greeting';

export default async function Home() {
  // 获取 QueryClient 实例
  const queryClient = getQueryClient();
  
  // 预获取查询数据（在服务端执行）
  void queryClient.prefetchQuery(
    trpc.hello.queryOptions({
      text: 'world',
    })
  );

  return (
    // HydrationBoundary 将服务端数据脱水后传递给客户端
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientGreeting />
    </HydrationBoundary>
  );
}
```

### 11.10 在客户端组件中使用数据

在客户端组件中直接使用 hooks 获取数据：

```typescript
// app/client-greeting.tsx
'use client'; // hooks 只能在客户端组件中使用

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/client';

export function ClientGreeting() {
  const trpc = useTRPC();
  
  // 使用 useQuery hook 获取数据
  // 数据会从 Hydration 后的状态恢复，无需再次请求
  const greeting = useQuery(trpc.hello.queryOptions({ text: 'world' }));

  if (!greeting.data) return <div>Loading...</div>;
  
  return <div>{greeting.data.greeting}</div>;
}
```

### 11.11 简化版：使用辅助函数

为了简化代码，可以创建辅助函数：

```typescript
// trpc/server.tsx 中添加

import type { TRPCQueryOptions } from '@tanstack/react-query';

/**
 * HydrateClient 组件
 * 简化服务端数据传递给客户端的包装组件
 */
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

/**
 * 预获取查询数据的辅助函数
 * 支持普通查询和无限查询
 */
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // 无限查询
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    // 普通查询
    void queryClient.prefetchQuery(queryOptions);
  }
}
```

使用简化版本：

```typescript
// app/page.tsx 简化版
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { ClientGreeting } from './client-greeting';

export default async function Home() {
  // 简化版预获取
  prefetch(trpc.hello.queryOptions({ text: 'world' }));

  return (
    <HydrateClient>
      <ClientGreeting />
    </HydrateClient>
  );
}
```

### 11.12 使用 Suspense 处理加载状态

可以使用 Suspense 和 Error Boundary 来处理加载和错误状态：

```typescript
// app/page.tsx - 服务端组件
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ClientGreeting } from './client-greeting';

export default async function Home() {
  prefetch(trpc.hello.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>出错了</div>}>
        <Suspense fallback={<div>加载中...</div>}>
          <ClientGreeting />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
```

```typescript
// app/client-greeting.tsx - 使用 useSuspenseQuery
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/client';

export function ClientGreeting() {
  const trpc = useTRPC();
  
  // useSuspenseQuery 会等待数据加载完成
  // 不需要处理 loading 状态
  const { data } = useSuspenseQuery(trpc.hello.queryOptions());

  return <div>{data.greeting}</div>;
}
```

### 11.13 在服务端组件中直接获取数据

如果需要在服务端组件中直接访问数据（不通过 hydration），可以使用 caller：

```typescript
// trpc/server.tsx 中添加 caller
import { headers } from 'next/headers';
import { createTRPCContext } from './init';
import { appRouter } from './routers/_app';

// ... 现有代码 ...

/**
 * 创建 caller
 * 可以直接在服务端组件中调用，无需 hydration
 * 注意：这种方法不会在客户端缓存中存储数据
 */
export const caller = appRouter.createCaller(async () =>
  createTRPCContext({ headers: await headers() })
);
```

```typescript
// app/page.tsx - 直接调用
import { caller } from '~/trpc/server';

export default async function Home() {
  // 直接调用，返回实际数据（不是 Promise）
  const greeting = await caller.hello({ text: 'world' });
  
  return <div>{greeting.greeting}</div>;
}
```

如果既想在服务端使用数据，又想传递给客户端，可以使用 `fetchQuery`：

```typescript
// app/page.tsx
import { getQueryClient, HydrateClient, trpc } from '~/trpc/server';
import { ClientGreeting } from './client-greeting';

export default async function Home() {
  const queryClient = getQueryClient();
  
  // fetchQuery 会在服务端执行查询并返回数据
  // 同时也会将数据存入 hydration 状态传给客户端
  const greeting = await queryClient.fetchQuery(trpc.hello.queryOptions());
  
  // 在服务端可以使用数据
  console.log(greeting.greeting);

  return (
    <HydrateClient>
      <ClientGreeting />
    </HydrateClient>
  );
}
```

---

## 12. 常见问题

### 11.1 tRPC 与 GraphQL 相比有何优势？

| 方面 | tRPC | GraphQL |
|------|------|---------|
| 类型系统 | 原生 TypeScript | 需要额外 schema |
| 学习曲线 | 低（纯 TypeScript） | 中等（GraphQL 语法） |
| 生态系统 | 较小 | 成熟（Apollo, Relay） |
| 工具支持 | 有限 | 丰富（GraphiQL 等） |
| 实时通信 | 需要 WebSocket | 原生支持 Subscription |

### 11.2 tRPC 能用于微服务吗？

可以，但需要额外配置：

- 使用多个 tRPC 服务器

- 通过服务网关转发

- 或考虑使用 tRPC Proxy 项目

### 11.3 如何处理 CORS？

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
  cors: false, // 已通过 cors 中间件处理
}));
```

### 11.4 如何调试 tRPC？

```typescript
// 开启调试日志
const t = initTRPC.create({
  logger: {
    log: ({ path, type, next }) => {
      console.log('Calling:', path, type);
      return next();
    },
  },
});
```

### 11.5 tRPC 支持哪些框架？

- **后端**: Express, Fastify, AWS Lambda, Azure Functions, Next.js API Routes, NestJS

- **前端**: React, React Native, SolidJS, Svelte, Vue

- **传输**: HTTP, WebSocket, Streaming

---

## 参考资源

- [tRPC 官方文档](https://trpc.io/docs)
- [tRPC GitHub 仓库](https://github.com/trpc/trpc)
- [tRPC Discord 社区](https://trpc.io/discord)

---

*文档更新时间: 2026-04-19*
