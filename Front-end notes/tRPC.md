# 基础用法
## 1. 核心概念：什么是 tRPC？

在传统的 REST 或 GraphQL 中，前后端是“松散耦合”的。而 tRPC 利用了 TypeScript 的 `inference`（推导）特性，直接将后端的类型传递给前端。

### 核心三要素：

1. **Router**: 定义你的 API 路由（类似 Express 的路由）。
    
2. **Procedure**: 具体的 API 接口（Query 用于读，Mutation 用于写）。
    
3. **Context**: 共享的数据（如数据库连接、用户信息）。
    

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

