## Convex 完全指南（Next.js 版）

> 面向 Next.js App Router + TypeScript 技术栈。本文基于 Convex 官方最新文档整理，更新时间：2026-05-21。

## 0. 学习路线

Convex 不是“一个数据库 SDK”，而是一套把数据库、后端函数、实时同步、文件存储、任务调度、搜索和鉴权连接起来的全栈后端平台。

建议按这个顺序学习：

1. 先理解 Convex 的架构：前端不直接查数据库，而是调用后端函数。
2. 学会 Schema、表、文档、ID、索引。
3. 学会三类核心函数：Query、Mutation、Action。
4. 在 Next.js 中接入 `ConvexProvider`、`useQuery`、`useMutation`。
5. 理解实时订阅、缓存、乐观更新和运行流程。
6. 学会 App Router 下的 SSR：`preloadQuery`、`usePreloadedQuery`、`fetchQuery`。
7. 继续学习 Auth、文件存储、全文搜索、向量搜索、HTTP Actions、调度任务和部署。

---
## 1. Convex 是什么

Convex 是一个 TypeScript-first 的后端平台。你在项目的 `convex/` 目录里写后端函数，Convex CLI 会把这些函数同步到 Convex deployment。前端通过自动生成的 `api` 对象调用这些函数。

传统 Next.js 全栈项目常见结构：

```text
Client Component
  -> Route Handler / Server Action / tRPC / REST
  -> ORM
  -> PostgreSQL / MySQL / MongoDB
  -> 手写缓存、实时推送、鉴权和后台任务
```

Convex 项目结构：

```text
Client Component / Server Component / Route Handler
  -> Convex generated API reference
  -> Convex query / mutation / action
  -> Convex database / storage / scheduler / search
  -> 自动类型安全、事务、实时订阅
```

Convex 的核心价值：

| 能力 | 说明 |
| --- | --- |
| 后端函数 | 用 TypeScript 写 `query`、`mutation`、`action`，不需要单独搭 Express/Nest 服务 |
| 实时数据 | `useQuery` 默认是 reactive subscription，数据变化后客户端自动更新 |
| 数据库 | 文档关系型数据库，支持 Schema、索引、事务、分页、全文搜索、向量搜索 |
| 类型安全 | `npx convex dev` 自动生成 `convex/_generated/api` 和 `dataModel` 类型 |
| Next.js 集成 | 支持 Client Components、Server Components、Server Actions、Route Handlers |
| 后端能力 | 文件存储、HTTP Actions、定时任务、内部函数、鉴权、环境变量 |

官方文档把 Convex 函数分为三类：Queries 读数据并可缓存/订阅，Mutations 写数据并在事务中运行，Actions 用于调用外部 API 或执行副作用。

### 1.1 工作原理图

其实调用 `use` 就是向服务端发送请求

```
初次加载:
  useQuery → Convex Server → Database → 返回数据 → 组件渲染

数据变更:
  useMutation → Convex Server → Database事务处理 → WebSocket推送 → 所有订阅组件自动更新

实时订阅:
  useQuery → 建立 WebSocket 连接 → 数据变化时推送更新 → 组件自动重渲染
```

**架构：**
```
浏览器 React
   ↓
useQuery / useMutation
   ↓
Convex Client SDK
   ↓
WebSocket
   ↓
Convex Cloud Runtime
   ↓
你的 query/mutation/action
   ↓
Convex Database
   ↓
实时推送结果回浏览器
```

其实这么理解还是片面的，`convex` 还做了 `Optimistic UX` + `Subscription Cache`

**例如调用 `useQuery`：**
```
React 执行 useQuery

Convex SDK 会先到浏览器里缓存查找有没有这个 query 的缓存结果，如果有就拿来用，所以感觉是同步的

同时，后台通过 WebSocket 请求 Convex Cloud，这里是异步的，执行完函数后返回结果

收到服务器返回的结果后，cache.set 并且通知 React Render
```

其实`useQuery`不是`Promise API`，而是`subscribe API`，React hook管理异步过程，`subscribe API`为了持续监听
``` js
const data = subscribe(remoteSource)
```

---
### 1.2 convex运行流程

前端调用 `api.xxx.xxx` 本身不是执行函数，它是一个 **函数引用（function reference）**。

当把它传给 `useQuery / useMutation / useAction` 时，Convex Client SDK 会向 Convex Server 发请求

然后在服务器端执行对应的 server function。

传统开发：
```
React 前端
↓
请求 Express API
↓
Node.js 服务
↓
MongoDB / PostgreSQL
```

convex开发：
```
React 前端
↓
调用 Convex 函数
↓
Convex Cloud
↓
内置数据库
↓
自动实时同步前端
```

---

## 2. 架构与运行流程

### 2.1 核心组件

```text
Next.js App
  app/layout.tsx
  app/ConvexClientProvider.tsx
  app/page.tsx

Convex Client SDK
  ConvexReactClient
  useQuery / useMutation / useAction
  preloadQuery / fetchQuery / fetchMutation / fetchAction

Convex Deployment
  convex/schema.ts
  convex/tasks.ts
  convex/http.ts
  convex/crons.ts
  convex/_generated/*

Convex Platform
  database
  storage
  scheduler
  search indexes
  logs/dashboard
```

### 2.2 前端调用不是直接执行函数

```ts
import { api } from "@/convex/_generated/api";

api.tasks.list;
```

`api.tasks.list` 是一个 function reference，不是函数本体。它描述“要调用 Convex deployment 上的哪个后端函数”。

真正发起调用的是：

```tsx
const tasks = useQuery(api.tasks.list, { status: "open" });
const createTask = useMutation(api.tasks.create);
await createTask({ text: "Learn Convex" });
```

### 2.3 `useQuery` 的运行流程

```text
组件渲染
  -> useQuery(api.tasks.list, args)
  -> ConvexReactClient 注册订阅
  -> WebSocket/RPC 发送到 Convex deployment
  -> 执行 convex/tasks.ts 中的 list query
  -> 读取数据库
  -> 返回结果给客户端缓存
  -> React 重新渲染

之后数据库发生相关变化
  -> Convex 重新计算受影响 query
  -> 推送新结果
  -> 客户端缓存更新
  -> React 自动重新渲染
```

重要理解：`useQuery` 不是一次性的 `Promise` fetch，而是一个持续订阅的数据源。它的返回值有三种常见状态：

```tsx
const tasks = useQuery(api.tasks.list, {});

if (tasks === undefined) {
  return <div>Loading...</div>;
}

return <TaskList tasks={tasks} />;
```

| 返回值 | 含义 |
| --- | --- |
| `undefined` | query 还在加载，或被 `"skip"` 跳过 |
| `null` | 后端明确返回 `null` |
| 其他值 | 后端 query 的实际返回值 |

### 2.4 `mutation` 的运行流程

```text
用户点击按钮
  -> useMutation 返回的函数被调用
  -> Convex 按客户端顺序执行 mutation
  -> mutation 在数据库事务中读取/写入
  -> 成功后返回结果
  -> 所有依赖受影响数据的 queries 自动更新
```

Mutation 是事务性的。适合放业务不变量，比如“余额不能为负”“同一个 slug 不能重复”“只有作者能删除文章”。

### 2.5 `action` 的运行流程

```text
用户或 mutation 触发 action
  -> action 可调用 fetch / OpenAI / Stripe / Resend
  -> action 不能直接读写 db
  -> 通过 ctx.runQuery / ctx.runMutation 访问 Convex 数据
```

Action 适合外部副作用，例如：

- 调 OpenAI 生成摘要
- 调 Stripe 创建 checkout session
- 调 Resend 发邮件
- 拉取第三方 API 数据
- 使用 Node.js 运行时的 npm 包

---

## 3. 在 Next.js 中快速开始

### 3.1 创建项目

```bash
npx create-next-app@latest my-convex-app
cd my-convex-app
npm install convex
npx convex dev
```

也可以直接使用官方模板：

```bash
npm create convex@latest -- -t nextjs
npm create convex@latest -- -t nextjs-clerk
```

`npx convex dev` 会做几件事：

1. 登录或创建 Convex 项目。
2. 创建/关联 dev deployment。
3. 生成 `.env.local` 中的 `NEXT_PUBLIC_CONVEX_URL`。
4. 监听 `convex/` 目录变化并同步到后端。
5. 生成 `convex/_generated/api.ts`、`server.ts`、`dataModel.ts`。

### 3.2 推荐目录结构

```text
my-convex-app/
├─ app/
│  ├─ ConvexClientProvider.tsx
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ tasks/
│     ├─ page.tsx
│     └─ TasksClient.tsx
├─ convex/
│  ├─ _generated/
│  ├─ schema.ts
│  ├─ tasks.ts
│  ├─ users.ts
│  ├─ files.ts
│  ├─ http.ts
│  └─ crons.ts
├─ .env.local
└─ package.json
```

### 3.3 App Router Provider

`app/layout.tsx` 默认是 Server Component，而 `ConvexReactClient` 必须在 Client Component 中创建，所以需要单独包一层。

```tsx
// app/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

---

## 4. Schema、表和数据类型

### 4.1 基础 Schema

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  tasks: defineTable({
    text: v.string(),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
    ownerId: v.id("users"),
    priority: v.optional(v.number()),
    dueAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_due", ["dueAt"]),
});
```

每条文档都有两个系统字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | `Id<"table">` | 文档 ID |
| `_creationTime` | `number` | 创建时间戳，毫秒 |

### 4.2 常用验证器

```ts
v.string();
v.number();
v.int64();
v.float64();
v.boolean();
v.null();
v.id("users");
v.array(v.string());
v.object({ x: v.number(), y: v.number() });
v.record(v.string(), v.number());
v.optional(v.string());
v.union(v.literal("admin"), v.literal("user"));
v.any();
```

注意：

- Convex value 不支持把 JavaScript `undefined` 作为存储值或函数返回值。
- 可选字段用 `v.optional(...)`。
- 可空字段用 `v.union(v.string(), v.null())`。
- `ctx.db.patch(id, { field: undefined })` 表示删除该字段。

### 4.3 生成的 TypeScript 类型

```ts
// convex/tasks.ts
import type { Doc, Id } from "./_generated/dataModel";

type Task = Doc<"tasks">;
type TaskId = Id<"tasks">;
type UserId = Id<"users">;
```

| 类型 | 用途 |
| --- | --- |
| `Doc<"tasks">` | 一条 `tasks` 文档的完整类型 |
| `Id<"tasks">` | `tasks` 表文档 ID 类型 |
| `v.id("tasks")` | 运行时参数验证器 |

---

## 5. Query：读数据

### 5.1 基础 Query

```ts
// convex/tasks.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
    ),
  },
  handler: async (ctx, args) => {
    if (args.status === undefined) {
      return await ctx.db.query("tasks").order("desc").collect();
    }

    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();
  },
});
```

上面能工作，但不推荐对大表使用 `.filter()` 全表扫描。真实项目应该用索引。

### 5.2 使用索引查询

```ts
export const listByOwnerAndStatus = query({
  args: {
    ownerId: v.id("users"),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_owner_status", (q) =>
        q.eq("ownerId", args.ownerId).eq("status", args.status),
      )
      .order("desc")
      .collect();
  },
});
```

索引字段顺序非常重要。`["ownerId", "status"]` 适合：

```ts
q.eq("ownerId", ownerId);
q.eq("ownerId", ownerId).eq("status", status);
```

不适合只查：

```ts
q.eq("status", status);
```

如果常按 `status` 查，就单独建 `.index("by_status", ["status"])`。

### 5.3 常用数据库读取 API

```ts
await ctx.db.get(taskId);

await ctx.db.query("tasks").collect();
await ctx.db.query("tasks").take(20);
await ctx.db.query("tasks").first();
await ctx.db.query("tasks").unique();

await ctx.db
  .query("tasks")
  .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
  .order("desc")
  .collect();
```

| API | 说明 |
| --- | --- |
| `get(id)` | 按 ID 获取一条文档 |
| `query(table)` | 查询某张表 |
| `withIndex(name, fn)` | 使用指定索引 |
| `filter(fn)` | 对候选结果逐条过滤，不等于数据库索引 |
| `order("asc" | "desc")` | 按当前索引顺序排序 |
| `collect()` | 取所有结果，小心数据量 |
| `take(n)` | 取前 n 条 |
| `first()` | 取第一条或 `null` |
| `unique()` | 期望最多一条，否则报错 |

### 5.4 Query 的设计原则

1. Query 只能读数据，不应该写数据库。
2. Query 是确定性的，不要在 query 中调用外部 API。
3. Query 会被缓存并实时订阅，所以返回值越小越好。
4. 大表查询优先设计索引，少用 `.filter()` 扫描。
5. 多个客户端订阅同一个 query 时，Convex 可以复用缓存结果。

---

## 6. Mutation：写数据

### 6.1 创建文档

```ts
// convex/tasks.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    text: v.string(),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      ownerId: args.ownerId,
      status: "todo",
    });

    return taskId;
  },
});
```

### 6.2 更新、替换、删除

```ts
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status,
    });
  },
});

export const replaceTask = mutation({
  args: {
    taskId: v.id("tasks"),
    text: v.string(),
    ownerId: v.id("users"),
    status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    await ctx.db.replace(args.taskId, {
      text: args.text,
      ownerId: args.ownerId,
      status: args.status,
    });
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
```

| API | 说明 |
| --- | --- |
| `ctx.db.insert(table, doc)` | 插入文档，返回新 ID |
| `ctx.db.patch(id, partial)` | 局部更新 |
| `ctx.db.replace(id, doc)` | 整条替换 |
| `ctx.db.delete(id)` | 删除文档 |

### 6.3 事务与业务规则

Mutation 在事务中执行。下面的例子里，读取积分、检查余额、扣减和增加积分要么全部成功，要么全部失败。

```ts
export const transferCredits = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("amount must be positive");
    }

    const from = await ctx.db.get(args.fromUserId);
    const to = await ctx.db.get(args.toUserId);

    if (!from || !to) {
      throw new Error("user not found");
    }

    if ((from.credits ?? 0) < args.amount) {
      throw new Error("not enough credits");
    }

    await ctx.db.patch(args.fromUserId, {
      credits: from.credits - args.amount,
    });

    await ctx.db.patch(args.toUserId, {
      credits: to.credits + args.amount,
    });
  },
});
```

### 6.4 Mutation 的设计原则

1. 写操作都放在 mutation，不要让客户端拼业务规则。
2. 校验权限、校验状态、校验唯一性都应该在 mutation 中做。
3. Mutation 可以读取数据库，所以可以先查再写。
4. 不要在 mutation 中调用外部 API；外部副作用放 action。

---

## 7. Action：外部 API 和副作用

### 7.1 基础 Action

```ts
// convex/ai.ts
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const summarizeTask = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.example.com/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: args.text }),
    });

    const { summary } = await response.json();

    await ctx.runMutation(internal.ai.saveSummary, {
      text: args.text,
      summary,
    });

    return summary as string;
  },
});

export const saveSummary = internalMutation({
  args: {
    text: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("summaries", args);
  },
});
```

Action 的上下文不包含 `ctx.db`。如果需要读写数据库，用：

```ts
await ctx.runQuery(internal.someModule.someQuery, args);
await ctx.runMutation(internal.someModule.someMutation, args);
await ctx.runAction(internal.someModule.someAction, args);
```

### 7.2 Node.js 运行时

默认 Convex runtime 更轻量。如果需要 Node.js API 或某些 npm 包，在文件顶部加：

```ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import sharp from "sharp";

export const resizeImage = action({
  args: { bytes: v.bytes() },
  handler: async (_ctx, args) => {
    return await sharp(Buffer.from(args.bytes)).resize(300).png().toBuffer();
  },
});
```

注意：带 `"use node"` 的文件里不要再定义普通 query/mutation。

### 7.3 Action 的设计原则

1. 外部 API、邮件、支付、LLM、爬取数据放 action。
2. 需要持久化结果时，让 action 调 mutation。
3. Action 有副作用，失败后 Convex 不会像 mutation 一样自动安全重试。
4. 如果必须保证业务状态，先用 mutation 记录任务状态，再调 action。

---

## 8. 在 Client Component 中使用 Convex

### 8.1 查询列表

```tsx
// app/tasks/TasksClient.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TasksClient() {
  const tasks = useQuery(api.tasks.list, {});

  if (tasks === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.text}</li>
      ))}
    </ul>
  );
}
```

### 8.2 创建数据

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function CreateTaskForm({ ownerId }: { ownerId: Id<"users"> }) {
  const [text, setText] = useState("");
  const createTask = useMutation(api.tasks.create);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;

    await createTask({ text, ownerId });
    setText("");
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <button type="submit">Create</button>
    </form>
  );
}
```

`useMutation(api.tasks.create)` 返回的是一个可调用函数。它本身没有 `isPending`、`error` 这些属性。如果需要 pending 状态，用 React state 或 `useTransition`。

```tsx
const [isPending, startTransition] = useTransition();

function submit() {
  startTransition(async () => {
    await createTask({ text, ownerId });
  });
}
```

### 8.3 条件查询

```tsx
const tasks = useQuery(
  api.tasks.listByOwnerAndStatus,
  ownerId === null ? "skip" : { ownerId, status: "todo" },
);
```

传 `"skip"` 表示暂时不执行 query。

### 8.4 乐观更新

```tsx
const updateStatus = useMutation(api.tasks.updateStatus).withOptimisticUpdate(
  (localStore, args) => {
    const current = localStore.getQuery(api.tasks.list, {});
    if (current === undefined) return;

    localStore.setQuery(
      api.tasks.list,
      {},
      current.map((task) =>
        task._id === args.taskId ? { ...task, status: args.status } : task,
      ),
    );
  },
);
```

乐观更新改的是客户端本地 query 缓存：

| API | 说明 |
| --- | --- |
| `localStore.getQuery(api.fn, args)` | 读取某个 query 当前缓存 |
| `localStore.setQuery(api.fn, args, value)` | 写入某个 query 的本地缓存 |

如果 mutation 失败，Convex 会回滚乐观更新。

其实useQuery订阅的是convex在浏览器维护的缓存，

```
Server DB
    ↓
同步到客户端缓存
    ↓
useQuery订阅缓存
```

**withOptimisticUpdate执行流程：**
- 调用 `mutate(args)`

- Convex 先执行你在 `withOptimisticUpdate((localStore, args) => ...)` 里写的函数。这个函数拿到的是当前客户端里“已加载的查询结果视图”`localStore`，你可以用 `getQuery` 读某个 query 的当前值，用 `setQuery` 直接改它；这些 query 结果要当成不可变数据处理

- 因为 `useQuery` 订阅的是 Convex 客户端缓存，所以一旦 `setQuery` 改了缓存，界面会立即重新渲染。

- 与此同时，真正的 mutation 在服务端执行。

- 如果 mutation 成功，客户端会收到新的真实查询结果，乐观补丁被撤销，UI 以服务端结果为准。

- 如果 mutation 失败，mutation 的 promise 会 reject，同时这次乐观更新会被回滚。
---

## 9. Next.js Server Rendering

Convex 和 Next.js App Router 的关键判断：

| 位置                            | 推荐 API                                         | 是否实时                  |
| ----------------------------- | ---------------------------------------------- | --------------------- |
| Client Component              | `useQuery`                                     | 是                     |
| Client Component 写入           | `useMutation` / `useAction`                    | mutation 后触发实时更新      |
| Server Component 预加载后保持实时     | `preloadQuery` + `usePreloadedQuery`           | 首屏有数据，hydration 后继续实时 |
| Server Component 只读渲染         | `fetchQuery`                                   | 否                     |
| Server Action / Route Handler | `fetchQuery` / `fetchMutation` / `fetchAction` | 否                     |

### 9.1 预加载数据并保持实时

```tsx
// app/tasks/page.tsx
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const preloadedTasks = await preloadQuery(api.tasks.list, {});

  return <TasksClient preloadedTasks={preloadedTasks} />;
}
```

```tsx
// app/tasks/TasksClient.tsx
"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TasksClient({
  preloadedTasks,
}: {
  preloadedTasks: Preloaded<typeof api.tasks.list>;
}) {
  const tasks = usePreloadedQuery(preloadedTasks);

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.text}</li>
      ))}
    </ul>
  );
}
```

`preloadQuery` 的特点：

- 在 Server Component 中先拿到数据，首屏不必显示 loading。
- 传给 Client Component 后用 `usePreloadedQuery` 接管。
- hydration 后仍然保持 Convex 实时订阅。
- 默认使用 `cache: "no-store"`，因此使用它的 Server Component 不适合静态渲染。

### 9.2 Server Component 只读获取

```tsx
// app/tasks/static-page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function StaticTasksPage() {
  const tasks = await fetchQuery(api.tasks.list, {});

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.text}</li>
      ))}
    </ul>
  );
}
```

`fetchQuery` 适合：

- SEO 内容渲染
- 非实时页面
- Route Handler 中读取 Convex
- Server Action 中读取 Convex

不适合：

- 希望数据库变化后页面自动更新
- 高频交互组件

### 9.3 Server Action 中调用 Mutation

```ts
// app/tasks/actions.ts
"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function createTaskAction(formData: FormData) {
  const text = String(formData.get("text") ?? "");
  const ownerId = String(formData.get("ownerId")) as Id<"users">;

  if (!text.trim()) {
    throw new Error("text is required");
  }

  await fetchMutation(api.tasks.create, {
    text,
    ownerId,
  });
}
```

实战建议：如果是表单提交后仍要实时更新 UI，通常 Client Component + `useMutation` 更自然。Server Actions 更适合渐进增强、SEO 表单或服务端独有逻辑。

### 9.4 Route Handler 中调用 Convex

```ts
// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET() {
  const tasks = await fetchQuery(api.tasks.list, {});
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const taskId = await fetchMutation(api.tasks.create, body);
  return NextResponse.json({ taskId }, { status: 201 });
}
```

---

## 10. 索引、分页和查询性能

### 10.1 普通索引

```ts
tasks: defineTable({
  text: v.string(),
  ownerId: v.id("users"),
  status: v.union(v.literal("todo"), v.literal("doing"), v.literal("done")),
  dueAt: v.optional(v.number()),
})
  .index("by_owner", ["ownerId"])
  .index("by_owner_status", ["ownerId", "status"])
  .index("by_owner_due", ["ownerId", "dueAt"]);
```

查询：

```ts
await ctx.db
  .query("tasks")
  .withIndex("by_owner_due", (q) =>
    q.eq("ownerId", ownerId).gte("dueAt", Date.now()),
  )
  .take(20);
```

### 10.2 内置索引

Convex 自动维护 `_creationTime` 顺序。没有指定索引时，默认使用按创建时间排序的索引。

```ts
await ctx.db.query("tasks").order("desc").take(20);
```

### 10.3 分页查询

后端：

```ts
// convex/tasks.ts
import { paginationOptsValidator } from "convex/server";

export const paginated = query({
  args: {
    ownerId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

前端：

```tsx
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function PaginatedTasks({ ownerId }: { ownerId: Id<"users"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.tasks.paginated,
    { ownerId },
    { initialNumItems: 20 },
  );

  return (
    <>
      {results.map((task) => (
        <div key={task._id}>{task.text}</div>
      ))}
      <button disabled={status !== "CanLoadMore"} onClick={() => loadMore(20)}>
        Load more
      </button>
    </>
  );
}
```

### 10.4 性能经验

1. `collect()` 适合小结果集，列表页优先 `take()` 或分页。
2. 大表查询要从访问模式反推索引。
3. `.filter()` 是候选集过滤，不是索引本身。
4. 复合索引遵守从左到右匹配原则。
5. 删除索引前确认没有函数继续使用它；部署时移除 schema 中的索引会删除后端索引。

---

## 11. 全文搜索与向量搜索

### 11.1 全文搜索

Schema：

```ts
posts: defineTable({
  title: v.string(),
  body: v.string(),
  published: v.boolean(),
  authorId: v.id("users"),
}).searchIndex("search_body", {
  searchField: "body",
  filterFields: ["published", "authorId"],
});
```

Query：

```ts
export const searchPosts = query({
  args: {
    q: v.string(),
    authorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withSearchIndex("search_body", (q) => {
        const builder = q.search("body", args.q).eq("published", true);
        return args.authorId === undefined
          ? builder
          : builder.eq("authorId", args.authorId);
      })
      .take(20);
  },
});
```

全文搜索特点：

- 自动 reactive。
- 支持分页。
- 搜索结果按相关性排序。
- 尽量把过滤条件放到 `withSearchIndex` 里，而不是后续 `.filter()`。

### 11.2 向量搜索

Schema：

```ts
documents: defineTable({
  title: v.string(),
  content: v.string(),
  embedding: v.array(v.float64()),
  ownerId: v.id("users"),
}).vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["ownerId"],
});
```

Action：

```ts
export const searchSimilar = action({
  args: {
    ownerId: v.id("users"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("documents", "by_embedding", {
      vector: args.embedding,
      limit: 10,
      filter: (q) => q.eq("ownerId", args.ownerId),
    });

    return results;
  },
});
```

注意：向量搜索只能在 action 中执行。常见做法是 action 做向量检索，再通过 internal query/mutation 读取或保存结果。

---

## 12. 鉴权

### 12.1 推荐方案

Convex 通过 OpenID Connect / JWT 验证客户端身份。Next.js 项目常见选择：

| 方案 | 适用场景 |
| --- | --- |
| Clerk | Next.js 生态最顺滑，推荐优先学习 |
| Auth0 | 企业/成熟身份平台 |
| WorkOS AuthKit | B2B、组织、企业登录 |
| Convex Auth | 直接在 Convex 中实现登录，目前仍偏 beta/实验性质 |
| Custom Auth | 自己提供 OIDC/JWT |

### 12.2 Clerk + Convex

Convex 后端配置：

```ts
// convex/auth.config.ts
import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

Next.js Provider：

```tsx
// app/ConvexClientProvider.tsx
"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

后端读取身份：

```ts
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});
```

权限校验：

```ts
export const createPrivateTask = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user === null) {
      throw new Error("User profile not found");
    }

    return await ctx.db.insert("tasks", {
      text: args.text,
      status: "todo",
      ownerId: user._id,
    });
  },
});
```

### 12.3 Auth 设计原则

1. 任何敏感 query/mutation/action 都在服务端用 `ctx.auth.getUserIdentity()` 校验。
2. 不要相信客户端传入的 `userId`。
3. 通常用 auth provider 的 subject/tokenIdentifier 关联 Convex `users` 表。
4. Clerk webhook 可以同步用户资料，但核心权限仍以 token identity 为准。

---

## 13. 文件存储

### 13.1 上传流程

客户端直传 Convex Storage 通常分三步：

```text
1. mutation 生成 upload URL
2. 浏览器 POST 文件到 upload URL，拿到 storageId
3. mutation 把 storageId 写入业务表
```

后端：

```ts
// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatar = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      avatarStorageId: args.storageId,
    });
  },
});

// 生成一个可以公开访问的完整 URL，可以供前端展示
export const getAvatarUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

前端：

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function AvatarUploader({ userId }: { userId: Id<"users"> }) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatar = useMutation(api.files.saveAvatar);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadUrl = await generateUploadUrl({});

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { storageId } = (await response.json()) as {
      storageId: Id<"_storage">;
    };

    await saveAvatar({ userId, storageId });
  }

  return <input type="file" accept="image/*" onChange={onChange} />;
}
```

### 13.2 Action 中存文件

```ts
export const fetchAndStoreImage = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    const blob = await response.blob();
    const storageId = await ctx.storage.store(blob);
    return storageId;
  },
});
```

### 13.3 获取文件

**格式转化：**
``` js
const response = await ky.get(file.storageUrl);
// 把响应体读成 ArrayBuffer（原始字节）
// 在 Node 里转成 Buffer
const buffer = Buffer.from(await response.arrayBuffer());
// 把字节编成 base64 文本
content = buffer.toString("base64");
```
把网络上下载下来的图片/文件（原始二进制），转换成一段可以放在 JSON 里传输的纯文本（Base64）

第一步：`response.arrayBuffer()`

- **在干嘛：** 把网络请求的响应体，变成 `ArrayBuffer`（也就是“纯粹的原始字节内存”）
    
- **为什么：** 因为网络传输过来的文件（比如一张 PNG 图片、一个 PDF）都是一堆 `0` 和 `1` 的二进制。`response.arrayBuffer()` 是现代浏览器和 Node.js 通用的、标准的接收二进制数据的方式。
    

第二步：`Buffer.from(...)`

- **在干嘛：** 把通用的 `ArrayBuffer` 包装成 Node.js 特有的 `Buffer` 对象。
    
- **为什么：** `ArrayBuffer` 自己没有操作数据的能力。虽然在浏览器里我们一般用 `Uint8Array`，但在 **Node.js** 的世界里，`Buffer` 身上自带了极其丰富的工具方法（比如转码、拼接）
    

第三步：`buffer.toString("base64")`

- **在干嘛：** 把这堆二进制字节，翻译成 **Base64** 编码的**纯文本字符串**。
    
- **为什么：** **这是最关键的一步。** 如果你要把这个文件再次发送给别的地方（比如存入数据库，或者作为一个 API 接口的 JSON 响应体返回给前端），**JSON 格式是没办法直接塞进二进制的**。JSON 只认识文本、数字、布尔值。
    
    Base64 就像是一种“密码本”，它可以把任何二进制文件（哪怕是复杂的音视频），强行翻译成由 `A-Z, a-z, 0-9, +, /` 组成的纯文本。

---

## 14. HTTP Actions

HTTP Actions 适合接 webhook、对外暴露自定义 HTTP endpoint、文件上传回调等。

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();

    await ctx.runMutation(internal.billing.recordWebhook, {
      body,
      receivedAt: Date.now(),
    });

    return new Response("ok", { status: 200 });
  }),
});

export default http;
```

对应 URL 一般是：

```text
https://<deployment>.convex.site/stripe/webhook
```

注意：HTTP Actions 使用 `convex/http.ts` 中的 `httpRouter()` 显式配置路由，不是默认 `/http/functionName`。

---

## 15. 调度任务与 Cron

### 15.1 动态调度

Mutation 中调度一个内部 action：

```ts
import { internal } from "./_generated/api";

export const createReminder = mutation({
  args: {
    taskId: v.id("tasks"),
    remindAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAt(args.remindAt, internal.reminders.send, {
      taskId: args.taskId,
    });
  },
});
```

也可以延迟执行：

```ts
await ctx.scheduler.runAfter(60_000, internal.reminders.send, {
  taskId,
});
```

### 15.2 静态 Cron

```ts
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "cleanup old notifications",
  { hourUTC: 2, minuteUTC: 0 },
  internal.notifications.cleanup,
);

export default crons;
```

---

## 16. 内部函数与模块组织

### 16.1 Public vs Internal

```ts
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
```

| 类型 | 谁能调用 |
| --- | --- |
| `query` / `mutation` / `action` | 客户端、Next.js 服务端、其他后端函数 |
| `internalQuery` / `internalMutation` / `internalAction` | 只能被 Convex 后端函数调用 |

内部函数适合封装危险能力：

```ts
export const deleteUserHard = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});
```

### 16.2 推荐模块划分

```text
convex/
├─ schema.ts
├─ users.ts        # 用户资料、当前用户
├─ tasks.ts        # 业务 CRUD
├─ files.ts        # 上传和文件 URL
├─ search.ts       # 全文/向量搜索
├─ ai.ts           # LLM actions
├─ http.ts         # webhook routes
├─ crons.ts        # 定时任务
└─ lib/
   ├─ auth.ts      # requireUser 等 helper
   └─ validators.ts
```

Helper 示例：

```ts
// convex/lib/auth.ts
import type { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  return identity;
}
```

---

## 17. 部署与环境变量

### 17.1 开发

```bash
npx convex dev
npm run dev
```

一般开两个终端：

```text
Terminal 1: npx convex dev
Terminal 2: npm run dev
```

### 17.2 生产部署

```bash
npx convex deploy
```

Next.js 部署到 Vercel 时需要配置：

```text
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

如果使用 Clerk/Auth0，还需要配置对应的 public/secret env，以及 Convex dashboard 或 deployment env 中的 auth 配置变量。

### 17.3 Convex 环境变量

Action 中读取第三方 API key：

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

在 Convex dashboard 或 CLI 中设置环境变量。不要把 secret 放到 `NEXT_PUBLIC_*`。

---

## 18. 常见模式：Todo 应用完整最小例子

### 18.1 Schema

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }).index("by_completed", ["completed"]),
});
```

### 18.2 后端函数

```ts
// convex/todos.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("todos").order("desc").collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (todo === null) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### 18.3 前端组件

```tsx
// app/page.tsx
import { TodoApp } from "./TodoApp";

export default function Page() {
  return <TodoApp />;
}
```

```tsx
// app/TodoApp.tsx
"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TodoApp() {
  const todos = useQuery(api.todos.list, {});
  const createTodo = useMutation(api.todos.create);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.remove);
  const [text, setText] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    await createTodo({ text });
    setText("");
  }

  if (todos === undefined) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <form onSubmit={onSubmit}>
        <input value={text} onChange={(event) => setText(event.target.value)} />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo({ id: todo._id })}
              />
              {todo.text}
            </label>
            <button onClick={() => removeTodo({ id: todo._id })}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

---

## 19. Convex vs 常见方案

| 对比项 | Convex | Prisma + PostgreSQL | Supabase | Firebase |
| --- | --- | --- | --- | --- |
| 后端 API | TypeScript functions | 自己写 API | SQL/RPC/Edge Functions | SDK/Cloud Functions |
| 实时 | 默认 reactive queries | 自己实现或加服务 | 支持 realtime | 支持 realtime |
| 类型安全 | 端到端生成 | ORM 层强 | 需要额外生成 | 相对弱 |
| 事务 | Mutation 默认事务 | 数据库事务 | PostgreSQL 事务 | 依产品而定 |
| 查询方式 | 函数 + 索引 | SQL/ORM | SQL/PostgREST | NoSQL 查询 |
| 适合 | 实时协作、AI app、快速全栈 | 复杂 SQL、强关系报表 | SQL-first BaaS | 移动端/简单实时 |

Convex 最适合：

- Next.js + React 实时应用
- Dashboard、协作工具、聊天、任务系统
- 希望少写 API 层和缓存层的产品
- AI 应用：任务队列、文件、向量搜索、LLM actions

不一定最适合：

- 极复杂 SQL 分析报表
- 已有大量 PostgreSQL 存储过程/SQL 资产
- 必须完全自控底层数据库调优的系统

---

## 20. 排错清单

### 20.1 `api.xxx` 找不到

解决：

```bash
npx convex dev
```

确认后端函数是 named export：

```ts
export const list = query({ ... });
```

### 20.2 `NEXT_PUBLIC_CONVEX_URL` 缺失

检查 `.env.local`：

```text
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

重启 Next.js dev server。

### 20.3 Query 一直 loading

检查：

1. 是否包了 `ConvexClientProvider`。
2. `api` 引用是否正确。
3. `args` 是否通过 validator。
4. 浏览器控制台是否有鉴权或网络错误。
5. `npx convex dev` 是否正在运行。

### 20.4 Schema 验证失败

典型原因：

- 字段缺失但 schema 中不是 `v.optional`。
- 把字符串当成 `v.id("table")`，但 ID 属于另一张表。
- 返回或存储了 `undefined`。
- `v.id("users")` 和真实表名不匹配。

### 20.5 数据不实时

确认你使用的是：

```tsx
useQuery(api.module.fn, args);
```

而不是：

```ts
fetchQuery(api.module.fn, args);
```

`fetchQuery` 是一次性服务端读取，不会保持实时订阅。

---

## 21. API 速查

### 21.1 后端函数

```ts
query({ args, handler });
mutation({ args, handler });
action({ args, handler });

internalQuery({ args, handler });
internalMutation({ args, handler });
internalAction({ args, handler });
```

### 21.2 React Client

```tsx
useQuery(api.tasks.list, {});
useMutation(api.tasks.create);
useAction(api.ai.summarizeTask);
usePaginatedQuery(api.tasks.paginated, args, { initialNumItems: 20 });
usePreloadedQuery(preloaded);
```

### 21.3 Next.js Server

```ts
preloadQuery(api.tasks.list, {});
fetchQuery(api.tasks.list, {});
fetchMutation(api.tasks.create, args);
fetchAction(api.ai.summarizeTask, args);
```

### 21.4 数据库

```ts
ctx.db.get(id);
ctx.db.query("tasks");
ctx.db.insert("tasks", doc);
ctx.db.patch(id, partial);
ctx.db.replace(id, doc);
ctx.db.delete(id);
```

### 21.5 Storage

```ts
ctx.storage.generateUploadUrl();
ctx.storage.getUrl(storageId);
ctx.storage.delete(storageId);
ctx.storage.getMetadata(storageId);

// actions only
ctx.storage.get(storageId);
ctx.storage.store(blob);
```

### 21.6 Scheduler

```ts
ctx.scheduler.runAfter(delayMs, internal.module.fn, args);
ctx.scheduler.runAt(timestampMs, internal.module.fn, args);
```

---

## 22. 推荐学习练习

1. Todo：Schema + Query + Mutation + `useQuery` + `useMutation`。
2. 多用户任务：Clerk Auth + `ctx.auth.getUserIdentity()` + `users` 表。
3. 文件上传：头像上传 + `storageId` + `ctx.storage.getUrl()`。
4. 搜索：给 posts 加全文搜索。
5. SSR：用 `preloadQuery` 改造列表首屏。
6. AI：用 action 调 LLM，结果通过 internal mutation 写入数据库。
7. 后台任务：用户创建任务后 `runAt` 定时提醒。
8. Webhook：用 HTTP Action 接 Stripe/Clerk webhook。

---

## 23. 参考资料

- Convex Functions: https://docs.convex.dev/functions
- Convex Next.js App Router: https://docs.convex.dev/client/nextjs/app-router
- Convex Next.js Server Rendering: https://docs.convex.dev/client/nextjs/app-router/server-rendering
- Convex Database: https://docs.convex.dev/database
- Convex Indexes: https://docs.convex.dev/database/reading-data/indexes
- Convex Data Types: https://docs.convex.dev/database/types
- Convex Authentication: https://docs.convex.dev/auth
- Convex Clerk Integration: https://docs.convex.dev/auth/clerk
- Convex File Storage: https://docs.convex.dev/file-storage
- Convex Full Text Search: https://docs.convex.dev/search/text-search
- Convex Vector Search: https://docs.convex.dev/search/vector-search
- Convex Scheduled Functions: https://docs.convex.dev/scheduling/scheduled-functions
