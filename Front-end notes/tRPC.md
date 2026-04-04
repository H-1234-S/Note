# 基础用法
## 1. 核心概念：什么是 tRPC？

在传统的 REST 或 GraphQL 中，前后端是“松散耦合”的。而 tRPC 利用了 TypeScript 的 `inference`（推导）特性，直接将后端的类型传递给前端。

### 核心三要素：

1. **Router**: 定义你的 API 路由（类似 Express 的路由）。
    
2. **Procedure**: 具体的 API 接口（Query 用于读，Mutation 用于写）。
    
3. **Context**: 共享的数据（如数据库连接、用户信息）。

### 术语

| **术语**        | **通俗理解**                                |
| ------------- | --------------------------------------- |
| **Procedure** | **接口**。每一个具体的 API 接口都叫一个 Procedure。     |
| **Query**     | **查**。用于获取数据的接口（对应 GET）。                |
| **Mutation**  | **改**。用于修改、删除数据的接口（对应 POST/PUT/DELETE）。 |
| **Input**     | **入参**。通过 Zod 定义前端必须传什么。                |

---

## 2. 第一步：初始化后端 Server

我们先从后端开始。你需要定义一个 `router` 和一个 `publicProcedure`。

``` TS
// server.ts
import { initTRPC } from '@trpc/server';

// 1. 初始化 tRPC
const t = initTRPC.create();

// 2. 定义路由器
export const appRouter = t.router({
  // 定义一个查询接口：getUser
  getUser: t.procedure
    .input((val: unknown) => {
      if (typeof val === 'string') return val;
      throw new Error('Invalid input');
    })
    .query((opts) => {
      const { input } = opts; // 这里的 input 类型会被推导为 string
      // 返回给前的数据
      return { id: input, name: 'Alex', role: 'Engineer' };
    }),
});

// 3. 导出后端的类型定义（这是关键！）
export type AppRouter = typeof appRouter;
```

> **资深建议：** 注意 `export type AppRouter`。我们只导出**类型**，不导出后端逻辑，这样前端就不会包含任何后端代码。

---

## 3. 第二步：前端 Client 的接入

在前端，我们只需要导入刚才定义的 `AppRouter` 类型。

``` TS
// client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server'; // 仅导入类型

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      // 后端服务的地址
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// 调用时会有完全的类型补全
const user = await trpc.getUser.query('123');
console.log(user.name); // 自动识别为 string
```

---

## 4. 深入知识点：Input Validation (输入校验)

手动写 `if` 判断输入类型太累了。在生产环境中，我们通常配合 **Zod** 使用，它能提供极其强大的运行前校验。

``` ts
import { z } from 'zod';

const appRouter = t.router({
  createUser: t.procedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // input 现在是 { name: string, email: string }
      return { success: true, user: input };
    }),
});
```

---

## 5. 核心进阶：Context & Middleware (上下文与中间件)

在真实的业务中，我们需要处理身份验证。你可以通过 `Middleware` 来拦截请求。

``` ts
// 1. 创建 Context（包含用户信息）
export const createContext = async (opts: any) => {
  const authHeader = opts.req.headers.authorization;
  return { user: authHeader === 'secret-token' ? { id: 1 } : null };
};

// 2. 创建中间件检查是否登录
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new Error('UNAUTHORIZED');
  }
  return next({
    ctx: { user: ctx.user }, // 这里的 ctx 会覆盖之后的流程
  });
});

// 3. 创建受保护的 Procedure
const protectedProcedure = t.procedure.use(isAuthed);

export const appRouter = t.router({
  getSecretData: protectedProcedure.query(() => {
    return "这是只有登录后才能看的数据";
  }),
});
```

---

## 6. 在 React/Next.js 中的实战

tRPC 最常见的用法是配合 `@tanstack/react-query`。它会给你提供诸如 `useQuery` 的 Hooks，并自动处理 Loading 和 Error 状态。

``` ts
// components/UserView.tsx
import { trpc } from '../utils/trpc';

export function UserView() {
  // 这里的 data 类型是自动推导的，无需泛型说明
  const userQuery = trpc.getUser.useQuery('123');

  if (userQuery.isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{userQuery.data?.name}</h1>
    </div>
  );
}
```

---

# 进阶用法

## 1. 路由模块化：Router Merging

当项目变大时，把所有接口写在一个 `appRouter` 里是不可持续的。我们需要像拆分 Express Router 一样拆分 tRPC 路由。

``` ts
// server/routers/user.ts
export const userRouter = t.router({
  getById: t.procedure.input(z.string()).query(({ input }) => { ... }),
  updateProfile: t.procedure.input(z.object({ name: z.string() })).mutation(({ input }) => { ... }),
});

// server/routers/post.ts
export const postRouter = t.router({
  list: t.procedure.query(() => { ... }),
});

// server/trpc.ts (主入口)
export const appRouter = t.router({
  user: userRouter, // 嵌套路由
  post: postRouter,
});

// 前端调用时会变成：trpc.user.getById.useQuery('123')
```

---

## 2. 错误处理与自定义错误 (Error Handling)

在生产环境中，你不能只返回 500 错误。tRPC 允许你抛出带有特定 HTTP 状态码的错误，并能被前端精准捕获。

``` TS
import { TRPCError } from '@trpc/server';

const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '你还没有登录，请先登录',
      cause: 'Token expired', // 可选：内部调试原因
    });
  }
  return next();
});
```

**前端捕获：**

``` TS
const mutation = trpc.user.update.useMutation({
  onError: (err) => {
    if (err.data?.code === 'UNAUTHORIZED') {
      alert(err.message);
    }
  },
});
```

---

## 3. Server-Side Helpers (预取数据)

在 Next.js 等框架中，为了 SEO 或减少首屏白屏，我们通常需要在服务器端预取数据。`createServerSideHelpers` 允许你在服务端直接“跑” tRPC 逻辑，而不需要发起真正的 HTTP 请求。

``` TS
// pages/posts/[id].tsx (Next.js 示例)
export async function getStaticProps(opts) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson, // 后面会讲
  });

  const id = opts.params.id;
  // 预取数据并注入缓存
  await helpers.post.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}
```

---

## 4. 数据转换器：SuperJSON

标准的 JSON 不支持 `Date`, `Map`, `Set` 或 `BigInt`。如果你从数据库查出一个 `createdAt` 字段（Date 类型），JSON 会把它转成字符串。tRPC 配合 `superjson` 可以完美解决这个问题。

``` TS
// server.ts
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson, // 开启超级转换
});

// 此时后端返回：{ time: new Date() }
// 前端收到的也是真正的 Date 对象，而不是 string！
```

---

## 5. 性能利器：Batching & Suspense

tRPC 默认支持 **Batching（请求合并）**。如果你在一个组件里同时调用了三个 `useQuery`，tRPC 会自动把它们合并成**一个** HTTP 请求发送给后端，极大地减少了网络开销。

此外，你还可以开启 **Suspense** 模式，让代码更具声明性：

``` TS
// 开启后，不再需要判断 isLoading
const [data] = trpc.user.getProfile.useSuspenseQuery();

return <div>{data.name}</div>; 
// 父组件用 <Suspense fallback={<Loading />}> 包裹即可
```

---

## 6. 拦截器与元数据 (Interceptors & Meta)

有时候你想给某些接口打标签（例如：`log: true`），或者统计接口耗时。

``` TS
// 定义 Meta 类型
interface Meta {
  logDescription?: string;
}

const t = initTRPC.meta<Meta>().create();

const logMiddleware = t.middleware(async ({ next, meta, path }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  
  if (meta?.logDescription) {
    console.log(`[${path}] ${meta.logDescription} took ${durationMs}ms`);
  }
  return result;
});

export const appRouter = t.router({
  slowQuery: t.procedure
    .meta({ logDescription: '这是一个很慢的查询' })
    .use(logMiddleware)
    .query(() => { ... }),
});
```

---

# 案例

构建一个 **“企业级任务管理系统 (Task Flow)”** 的后端核心

这个案例将涵盖：**路由模块化、Zod 深度校验、权限中间件、SuperJSON、以及错误处理**。

---

## 1. 架构设计思路

我们采用 **模块化路由 (Nested Routers)** 架构。这种设计模拟了大型项目的真实结构：

- **`context.ts`**: 统一处理认证逻辑，将用户信息注入请求生命周期。
    
- **`trpc.ts`**: 初始化 tRPC，定义通用的 `publicProcedure` 和 `protectedProcedure`。
    
- **`routers/`**: 按业务维度拆分，保持单一职责原则 (SRP)。
    
- **`index.ts`**: 合并路由，导出类型。
    

---

## 2. 代码实现

### 步骤 A：定义 Context (上下文)

这是进阶开发的第一步，决定了你的 API 如何识别“我是谁”。

``` ts
// server/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext(opts: CreateNextContextOptions) {
  // 模拟从 Header 中获取 Token 并验证用户
  const token = opts.req.headers.authorization;
  const user = token === 'admin-secret' ? { id: 'u1', name: 'Admin', role: 'ADMIN' } : null;

  return {
    user,
    db: {}, // 这里可以挂载你的 Prisma 或 Drizzle 实例
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

### 步骤 B：初始化与中间件 (The Core)

这里体现了如何将基础的 `procedure` 扩展为带有权限控制的组件。

``` ts
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';

// 使用 superjson 处理 Date 等复杂类型
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// 进阶：权限校验中间件
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: '只有登录用户才能操作' 
    });
  }
  return next({
    ctx: { user: ctx.user }, // 这里的 ctx 会被后续 procedure 继承且类型收窄
  });
});

// 导出受保护的 Procedure，前端调用时会自动要求权限
export const protectedProcedure = t.procedure.use(isAuthed);
```

### 步骤 C：业务路由 (Task Router)

结合 **Zod** 进行严谨的输入校验。

``` ts
// server/routers/task.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const taskRouter = router({
  // 1. 公开查询：获取任务列表
  list: publicProcedure
    .input(z.object({ filter: z.string().optional() }))
    .query(({ input }) => {
      return [
        { id: 1, title: '学习 tRPC 进阶', createdAt: new Date() },
      ];
    }),

  // 2. 受限操作：创建任务（必须登录）
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(5, "标题至少5个字符"),
      priority: z.enum(['LOW', 'HIGH'])
    }))
    .mutation(async ({ input, ctx }) => {
      // ctx.user 在这里是保证存在的，这就是 middleware 的威力
      console.log(`用户 ${ctx.user.name} 正在创建任务`);
      
      return {
        id: Math.random(),
        ...input,
        ownerId: ctx.user.id
      };
    }),
});
```

### 步骤 D：合并导出 (Root Router)

``` ts
// server/index.ts
import { router } from './trpc';
import { taskRouter } from './routers/task';

export const appRouter = router({
  task: taskRouter, // 挂载子路由
});

export type AppRouter = typeof appRouter;
```

---

## 3. 为什么这样设计？（架构优势）

1. **类型隐式传递 (Type Inference)**:
    
    前端在调用 `trpc.task.create.useMutation()` 时，输入参数必须符合 `z.object` 定义的结构，返回结果中的 `createdAt` 会自动被解析为 `Date` 对象。如果你改了后端字段名，前端会在编译时立刻报错。
    
2. **Procedure 组合**:
    
    我们没有在每个接口里写 `if (!user)`，而是通过 `protectedProcedure` 统一管理。这种逻辑复用是大型项目保持代码整洁的关键。
    
3. **SuperJSON 的必要性**:
    
    在任务系统中，日期（CreatedAt）和金额（BigInt）很常见。通过在初始化时注入 `superjson`，我们消除了前端频繁手动 `new Date(string)` 的痛苦。
    

---

## 4. 前端调用示例 (React)

``` ts
function TaskApp() {
  const utils = trpc.useContext();
  
  // 自动推导类型，甚至不需要看 API 文档
  const { data: tasks } = trpc.task.list.useQuery({ filter: 'urgent' });

  const mutation = trpc.task.create.useMutation({
    onSuccess: () => {
      // 进阶技巧：操作成功后，让列表缓存失效，触发自动刷新
      utils.task.list.invalidate();
    },
    onError: (err) => alert(err.message)
  });

  return (
    <button onClick={() => mutation.mutate({ title: '新任务', priority: 'HIGH' })}>
      添加任务
    </button>
  );
}
```

---

# 全链路类型安全

## 1. 架构总览：数据流转

在这个架构中，Prisma 负责**数据库 Schema**，tRPC 负责**类型路由**。

- **Schema (Prisma)**: 定义数据库结构。
    
- **Client (Prisma)**: 自动生成操作数据库的类型化函数。
    
- **Context (tRPC)**: 将 Prisma 实例注入到每一个 API 请求中。
    

---

## 2. 步骤一：Prisma 初始化与模型定义

首先，我们需要定义数据模型。假设我们继续开发之前的“任务管理系统”。

``` ts
// prisma/schema.prisma

datasource db {
  provider = "postgresql" // 或 sqlite, mysql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 定义任务模型
model Task {
  id        String   @id @default(cuid())
  title     String
  content   String?
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 关联用户
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model User {
  id    String @id @default(cuid())
  name  String
  tasks Task[]
}
```

---

## 3. 步骤二：单例模式实例化 Prisma

在开发环境下，Next.js 的热重载会导致创建多个数据库连接。我们需要一个单例模式。

``` ts
// server/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

---

## 4. 步骤三：将 Prisma 注入 tRPC Context

这是最关键的工程实践：**不要在每个 Router 里 import db**。通过 Context 注入，可以方便后续做单元测试（Mocking）。

``` ts
// server/context.ts
import { db } from './db';

export const createContext = async (opts: any) => {
  const session = await getSession(opts.req); // 假设这是你的鉴权逻辑
  
  return {
    db, // 将 prisma 实例注入上下文
    user: session?.user ?? null,
  };
};
```

---

## 5. 步骤四：在 Procedure 中调用 Prisma

现在，你可以在 `query` 或 `mutation` 中享受极度舒适的代码补全了。

``` ts
// server/routers/task.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const taskRouter = router({
  // 获取当前用户的所有任务
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    // 这里的 ctx.db 就是 Prisma 实例
    // 这里的返回值会自动推导出 Prisma 生成的 Task 类型
    return await ctx.db.task.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // 创建任务
  createTask: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.task.create({
        data: {
          title: input.title,
          content: input.content,
          userId: ctx.user.id, // 关联当前登录用户
        },
      });
    }),
});
```

---

## 6. 进阶 Tip：利用 Prisma 的自动生成类型

tRPC 的类型推导虽然强大，但有时前端组件需要显式声明一个 Task 的类型。你可以直接使用 Prisma 生成的类型：

``` ts
// frontend/components/TaskItem.tsx
import type { Task } from '@prisma/client';

interface Props {
  task: Task; // 直接使用后端生成的数据库模型类型
}

export const TaskItem = ({ task }: Props) => {
  return <div>{task.title} - {task.createdAt.toLocaleDateString()}</div>;
};
```

---

## 7. 资深工程师的总结

### 为什么这是最佳实践？

1. **唯一事实来源 (Single Source of Truth)**: 只要修改了 `schema.prisma` 并运行 `npx prisma generate`，从数据库层到 tRPC API 层，再到前端 UI 层，类型会自动同步。
    
2. **安全性**: 通过 tRPC 的 `input` (Zod) 校验前端输入，再通过 `protectedProcedure` 拦截非法访问，最后通过 Prisma 操作数据库，形成了一个封闭的安全环。
    
3. **性能**: Prisma 的查询引擎经过高度优化，配合 tRPC 的 Batching，可以有效减少数据库连接压力。
    

# 补充

## createTRPCRouter

### 1. 基础用法：定义简单接口

这是最常见的用法，直接在对象中定义 `query`（查询）和 `mutation`（变更）。

``` ts
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  // 获取用户：使用 query (GET)
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `你好, ${input.name}!`;
    }),

  // 创建用户：使用 mutation (POST/PUT/DELETE)
  create: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      // 这里通常会写数据库操作，比如 db.user.create(...)
      return { success: true, email: input.email };
    }),
});
```

---

### 2. 嵌套用法：构建 API 树

随着项目变大，你不可能把所有接口写在一个路由里。`createTRPCRouter` 允许你将小的路由组合成一个大的 `appRouter`。

``` ts
// src/server/api/root.ts
import { createTRPCRouter } from "./trpc";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  post: postRouter, // 访问路径: trpc.post.getAll
  user: userRouter, // 访问路径: trpc.user.getById
});

export type AppRouter = typeof appRouter;
```

---

### 3. 权限控制用法：配合中间件

你可以定义不同类型的 `procedure`，并将它们放在同一个 Router 中。比如只有登录用户能访问的接口。

``` ts
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const secretRouter = createTRPCRouter({
  // 任何人都能看
  stats: publicProcedure.query(() => {
    return { views: 100 };
  }),

  // 只有登录用户（通过 Clerk/NextAuth 校验）能看
  getBillingInfo: protectedProcedure.query(({ ctx }) => {
    // ctx.auth 中包含了用户信息
    return { balance: 99.9, userId: ctx.auth.userId };
  }),
});
```

---

### 4. 动态上下文（Context）用法

`createTRPCRouter` 处理的逻辑可以访问 `ctx`（上下文）。这允许你在 Router 内部直接操作数据库连接、Session 信息等。

``` ts
export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // 假设你在 createContext 中注入了 prisma 实例
    return await ctx.db.todo.findMany();
  }),
});
```

---

### 5. 命名空间深化（深层嵌套）

如果你有非常复杂的业务逻辑，可以继续向下嵌套，形成多层命名空间。

``` ts
export const adminRouter = createTRPCRouter({
  system: createTRPCRouter({
    logs: publicProcedure.query(() => ["log1", "log2"]),
    health: publicProcedure.query(() => "ok"),
  }),
  settings: createTRPCRouter({
    updateTheme: publicProcedure.mutation(() => "done"),
  }),
});

// 前端调用方式: trpc.admin.system.logs.useQuery()
```

---
## inferRouterOutputs

作用是：**把后端的逻辑实现，直接转换成前端可以使用的 TypeScript 类型。**

例如：在传统的开发中，如果在前端写一个 `VoiceCard` 组件，你可能需要手动定义一个 `interface`：

``` ts
interface Voice {
  id: string;
  name: string;
  // ... 万一后端 Prisma 模型改了字段名，这里就会报错或者运行出错
}
```

**这样写的缺点**：后端改了，前端得手动跟着改。一旦漏掉，就是线上 Bug。

**使用 `inferRouterOutputs` 的优点**：它是**活的**。只要后端的 Prisma 模型或 tRPC 路由逻辑变了，这个 `TTSVoiceItem` 类型会**瞬间自动同步**，不需要你改一行前端代码。

---

### 1. 基础用法：获取整个路由表的输出类型

这是最宏观的用法。它会生成一个对象，其结构与你的 `appRouter` 完全一致，但每个节点对应的是该接口的**返回类型**。

``` ts
// 1. 在后端导出类型
export type AppRouter = typeof appRouter;

// 2. 在前端提取类型
import { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

type RouterOutput = inferRouterOutputs<AppRouter>;

// 举例：你可以直接通过点语法找到某个接口的返回类型
type GetAllVoicesOutput = RouterOutput['voices']['getAll']; 
```

---

### 2. 核心用法：提取数组中的单项类型 (`[number]`)

这是你在 Resonance 项目中最常用的场景。当 `getAll` 返回一个数组时，你的子组件（如 `VoiceCard`）只需要其中一个元素的类型。

``` ts
// 假设 getAll 返回 { custom: Voice[], system: Voice[] }
export type VoiceItem = inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number];

// 代码举例：在子组件中使用
interface Props {
  data: VoiceItem;
}

export function VoiceCard({ data }: Props) {
  return <div>{data.name}</div>; // 这里会有完美的类型补全
}
```

---

### 3. 提取分页或复杂对象的子字段

如果你的后端返回的是带分页的数据结构（如 `{ items: T[], nextCursor: string }`），你可以精准定位到数据主体。

``` ts
// 定义后端路由
// .query(() => { return { items: [...], total: 100 } })

// 前端提取
type ProjectList = inferRouterOutputs<AppRouter>["project"]["list"]["items"];
type SingleProject = ProjectList[number];
```

---

### 4. 配合 `useQuery` 的 `select` 转换类型

有时候前端会用 `select` 对后端数据做二次加工。此时，`inferRouterOutputs` 依然可以作为基础，帮你定义加工后的类型。

``` ts
const { data } = trpc.voices.getAll.useQuery(undefined, {
  select: (data) => data.custom.map(v => v.name), // 只想要名字数组
});

// 此时 data 的类型会自动推断为 string[]
// 但如果你想手动定义这个转换后的类型：
type VoiceNames = inferRouterOutputs<AppRouter>["voices"]["getAll"]["custom"][number]["name"][];
```

---

### 5. 跨文件共享类型的最佳实践

在资深工程师的工程实践中，我们通常会建立一个专门的 `types.ts` 文件，集中存放这些推断出来的类型，避免在每个组件里重复写长长的路径。

``` ts
// src/types/trpc.ts
import { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>; // 顺便把输入参数类型也提出来

// 统一导出业务类型
export type VoiceDetail = RouterOutput['voices']['getOne'];
export type CreateVoiceInput = RouterInput['voices']['create'];
```

---

| **维度**   | **手动写 interface Voice** | **使用 inferRouterOutputs**    |
| -------- | ----------------------- | ---------------------------- |
| **同步效率** | 后端改了，前端得手动改，容易忘         | **瞬时自动同步**，一行代码都不用动          |
| **准确性**  | 可能存在拼写错误或类型偏差           | **绝对准确**，它就是后端代码的映射          |
| **重构压力** | 修改数据库字段名时，搜索替换很痛苦       | 修改字段名后，前端报错会精准定位到组件          |
| **开发体验** | 需要在前后端反复跳转确认字段          | **丝滑的 IDE 补全**，甚至不需要看 API 文档 |
