# Convex 完整教程

## 什么是 Convex？

Convex 是一个 **TypeScript 后端即服务（Backend as a Service）平台**，让开发者无需关心复杂的后端基础设施，就能快速构建实时同步的全栈应用。

**官网**: https://convex.dev

### Convex 的核心特点

- **实时数据库** - 支持实时数据同步和订阅
- **TypeScript 原生** - 前后端都用 TypeScript 编写
- **内置身份验证** - 提供 80+ OAuth 集成
- **Serverless 架构** - 无需管理服务器
- **ACID 事务** - 默认提供事务支持
- **React 集成** - 提供专门的 React Hooks

---

## 快速开始

### 1. 安装

```bash
npm create convex
```

或手动安装：

```bash
npm install convex
```

### 2. 项目结构

```
my-app/
├── convex/           # 后端代码目录
│   ├── schema.ts     # 数据库Schema定义
│   ├── functions/    # 服务器函数
│   └── convex.json   # 配置文件
├── src/              # 前端代码（React/Vue等）
└── convex.config.ts  # Convex配置文件
```

---

## 数据库操作

### 定义 Schema

Convex 使用 `defineSchema` 来定义数据库结构：

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 定义 users 表
  users: defineTable({
    name: v.string(),           // 用户名
    email: v.string(),          // 邮箱
    createdAt: v.number(),     // 创建时间戳
  }).index("by_email", ["email"]),  // 索引

  // 定义 posts 表
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),   // 关联 users 表
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_author", ["authorId"]),
});
```

**属性说明**:
- `v.string()` - 字符串类型
- `v.number()` - 数字类型
- `v.boolean()` - 布尔类型
- `v.id("tableName")` - 关联其他表的ID
- `v.optional()` - 可选值
- `.index("name", ["field"])` - 创建索引用于查询

### 查询数据 (Query)

使用 `query` 定义只读的数据查询函数：

```typescript
// convex/functions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// 获取所有用户
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// 根据ID获取单个用户
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// 条件查询 - 获取用户的所有文章
export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();
  },
});
```

**Query 方法说明**:
- `ctx.db.query("tableName")` - 获取表查询构建器
- `.collect()` - 执行查询返回所有匹配结果
- `.first()` - 返回第一条匹配的记录
- `.withIndex("indexName")` - 使用索引加速查询
- `.filter()` - 过滤条件
- `.order("desc" | "asc")` - 排序

### 写入数据 (Mutation)

使用 `mutation` 定义修改数据的函数：

```typescript
// convex/functions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// 创建新用户
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
    });
    return userId;
  },
});

// 创建文章
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      likes: 0,
      createdAt: Date.now(),
    });
    return postId;
  },
});

// 更新文章点赞数
export const likePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
      });
    }
  },
});

// 删除文章
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
  },
});
```

**Mutation 方法说明**:
- `ctx.db.insert("table", data)` - 插入新记录，返回ID
- `ctx.db.patch(id, data)` - 部分更新记录
- `ctx.db.replace(id, data)` - 替换整个记录
- `ctx.db.delete(id)` - 删除记录
- `ctx.db.get(id)` - 根据ID获取单条记录

---

## React 集成

### 设置 Provider

```tsx
// src/App.tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient("https://your-project.convex.cloud");

function App({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

export default App;
```

### 使用 useQuery 订阅数据

```tsx
// src/components/UserList.tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function UserList() {
  // 订阅用户列表 - 数据实时同步
  const users = useQuery(api.functions.listUsers);

  if (users === undefined) {
    return <div>加载中...</div>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user._id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

**useQuery 说明**:
- 第一个参数是后端函数路径，如 `api.functions.listUsers`
- 自动订阅数据变化，数据更新时组件自动重新渲染
- 返回 `undefined` 表示加载中
- 当后端函数需要参数时，传入对象如 `{ userId: "xxx" }`

### 使用 useMutation 执行操作

```tsx
// src/components/CreatePost.tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function CreatePost({ authorId }: { authorId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 获取mutation函数
  const createPost = useMutation(api.functions.createPost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 调用mutation
    await createPost({
      title,
      content,
      authorId,
    });

    // 清空表单
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="内容"
      />
      <button type="submit">发布</button>
    </form>
  );
}
```

**useMutation 说明**:
- 返回的函数调用时返回 Promise
- 自动处理错误和加载状态
- mutation 成功后，相关联的 useQuery 会自动更新

---

## 命名查询 (Named Queries)

可以为查询定义名称，方便前端订阅：

```typescript
// convex/functions.ts
export const recentPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("posts")
      .order("desc")
      .first(limit);
  },
});
```

```tsx
// 前端使用
const posts = useQuery(api.functions.recentPosts, { limit: 5 });
```

---

## HTTP Actions

可以创建处理 HTTP 请求的函数：

```typescript
// convex/http.ts
import { httpAction } from "./_generated/server";

export const handleWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();

  // 处理 webhook 逻辑
  console.log("Received webhook:", body);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## 身份验证

Convex 提供内置身份验证：

```typescript
// convex/auth.ts
import { mutation } from "./_generated/server";
import { ConvexHttpClient } from "convex/browser";

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 创建用户逻辑
    return await ctx.auth.createUser(args.email, args.password);
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.auth.signInWithPassword(args.email, args.password);
  },
});
```

---

## 部署

### 1. 登录 Convex

```bash
npx convex dev
```

### 2. 部署到生产环境

```bash
npx convex deploy
```

部署后，你的应用可以在 `https://your-project.convex.cloud` 访问。

---

## 总结

| 功能 | 方法 |
|------|------|
| **查询** | `useQuery(api.functions.xxx)` |
| **变更** | `useMutation(api.functions.xxx)` |
| **定义查询** | `query({ handler })` |
| **定义变更** | `mutation({ handler })` |
| **读取数据** | `ctx.db.get(id)` |
| **插入数据** | `ctx.db.insert("table", data)` |
| **更新数据** | `ctx.db.patch(id, data)` |
| **删除数据** | `ctx.db.delete(id)` |

---

## 参考链接

- 官方文档: https://docs.convex.dev
- 官网: https://convex.dev
- GitHub: https://github.com/get-convex
