
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

## 11. 常见问题

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
