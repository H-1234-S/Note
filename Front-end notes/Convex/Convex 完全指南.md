## 1. 简介与核心概念

### 1.1 什么是 Convex

Convex 是一个 **TypeScript 后端即服务（Backend as a Service）平台**，让开发者无需关心复杂的后端基础设施，就能快速构建实时同步的全栈应用。

它解决了三个核心问题：

| 问题     | 解决方案                               |
| ------ | ---------------------------------- |
| 实时数据同步 | WebSocket 自动推送数据变更到所有客户端           |
| 后端逻辑管理 | 用 TypeScript 编写服务器端函数，无需独立 API 服务器 |
| 数据库操作  | 内置关系型数据库，支持 ACID 事务                |

**官网**: https://convex.dev

### 1.2 关键术语

```typescript
// 核心概念解释
Schema          // 数据库结构定义
Table           // 数据表，类似传统数据库表
Query           // 只读查询函数，可订阅实时更新
Mutation        // 写操作函数，用于修改数据
Function        // 服务器端函数，可包含业务逻辑
Subscription    // 数据订阅，实时接收更新
httpAction      // HTTP 请求处理器
```

### 1.3 工作原理图

```
初次加载:
  useQuery → Convex Server → Database → 返回数据 → 组件渲染

数据变更:
  useMutation → Convex Server → Database事务处理 → WebSocket推送 → 所有订阅组件自动更新

实时订阅:
  useQuery → 建立 WebSocket 连接 → 数据变化时推送更新 → 组件自动重渲染
```

---

## 2. 快速开始

### 2.1 安装

```bash
# 使用官方脚手架创建项目
npm create convex

# 或手动安装
npm install convex
```

### 2.2 项目结构

```
my-app/
├── convex/                    # 后端代码目录
│   ├── _generated/            # 自动生成的类型文件
│   │   └── api.ts            # 生成的 API 入口
│   ├── schema.ts             # 数据库 Schema 定义
│   ├── functions.ts          # 服务器函数（Query/Mutation）
│   └── convex.json           # 配置文件
├── src/                      # 前端代码（React/Vue等）
│   ├── App.tsx
│   └── main.tsx
├── convex.config.ts          # Convex 配置文件
└── package.json
```

### 2.3 基础配置

```typescript
// convex.config.ts
import { defineApp } from "convex/server";

export default defineApp({
  functions: {
    // 函数入口点配置
  },
});
```

```typescript
// src/main.tsx (React)
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

---

## 3. 数据库 Schema

### 3.1 定义 Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 定义 users 表
  users: defineTable({
    name: v.string(),             // 用户名字段
    email: v.string(),            // 邮箱字段
    createdAt: v.number(),        // 创建时间戳
  }).index("by_email", ["email"]), // 索引：按邮箱查询

  // 定义 posts 表
  posts: defineTable({
    title: v.string(),            // 文章标题
    content: v.string(),         // 文章内容
    authorId: v.id("users"),     // 关联 users 表的外键
    likes: v.number(),           // 点赞数
    createdAt: v.number(),       // 创建时间戳
  })
    .index("by_author", ["authorId"])  // 索引：按作者查询
    .index("by_created", ["createdAt"]), // 索引：按时间排序

  // 定义 comments 表
  comments: defineTable({
    postId: v.id("posts"),       // 关联 posts 表
    authorId: v.id("users"),     // 关联 users 表
    content: v.string(),         // 评论内容
    createdAt: v.number(),       // 创建时间戳
  })
    .index("by_post", ["postId"])  // 索引：按文章查询评论
    .index("by_author", ["authorId"]),
});
```

### 3.2 字段类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `v.string()` | 字符串 | `"hello"` |
| `v.number()` | 数字 | `42`, `3.14` |
| `v.boolean()` | 布尔值 | `true` |
| `v.id("table")` | 关联其他表的 ID | `"abc123..."` |
| `v.optional()` | 可选值 | `v.optional(v.string())` |
| `v.array()` | 数组 | `v.array(v.string())` |
| `v.object()` | 对象 | `v.object({ name: v.string() })` |
| `v.null()` | null 值 | `null` |

### 3.3 索引的作用

索引用于加速查询，类似于传统数据库的索引：

```typescript
// 定义索引后可以使用 withIndex
.withIndex("by_email", (q) => q.eq("email", "user@example.com"))

// 内置字段索引
"_id"      // 主键索引，自动创建
"_creationTime"  // 创建时间索引，自动创建
```

---

## 4. Query 函数详解

### 4.1 基础 Query

Query 是只读的服务器端函数，用于从数据库读取数据：

```typescript
// convex/functions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// 获取所有用户
export const listUsers = query({
  args: {},  // 无参数
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// 获取单个用户
export const getUser = query({
  args: { userId: v.id("users") },  // 定义参数类型
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
```

### 4.2 Query args 参数说明

```typescript
// 无参数
args: {}

// 单个参数
args: { userId: v.id("users") }

// 多个参数
args: {
  postId: v.id("posts"),
  limit: v.optional(v.number()),  // 可选参数
}

// 数组参数
args: { ids: v.array(v.id("users")) }
```

### 4.3 Query 返回值详解

```typescript
// ctx.db.query() 返回 QueryBuilder，支持以下方法：

// 执行查询
.collect()    // 返回所有匹配记录数组
.first()      // 返回第一条记录
.unique()     // 返回唯一记录（用于唯一索引查询）

// 过滤条件
.filter((q) => q.eq("field", value))  // 等于
.filter((q) => q.gt("field", value))   // 大于
.filter((q) => q.ge("field", value))  // 大于等于
.filter((q) => q.lt("field", value))  // 小于
.filter((q) => q.le("field", value))  // 小于等于

// 排序
.order("asc")   // 升序
.order("desc")  // 降序

// 使用索引
.withIndex("index_name", (q) => q.eq("field", value))
```

### 4.4 完整查询示例

```typescript
// convex/functions.ts

// 条件查询 - 获取用户的所有文章
export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();
  },
});

// 分页查询
export const getPostsPaginated = query({
  args: {
    skip: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .skip(args.skip)
      .take(args.limit)
      .collect();
  },
});

// 关联查询 - 获取文章及其作者信息
export const getPostsWithAuthors = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();

    // 遍历获取每个文章的作者
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );

    return postsWithAuthors;
  },
});

// 统计查询
export const getPostCount = query({
  args: { authorId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("posts");
    if (args.authorId) {
      q = q.withIndex("by_author", (q) => q.eq("authorId", args.authorId));
    }
    const posts = await q.collect();
    return posts.length;
  },
});
```

---

## 5. Mutation 函数详解

### 5.1 基础 Mutation

Mutation 用于修改数据库中的数据：

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
    return userId;  // 返回新记录的 ID
  },
});
```

### 5.2 Mutation 方法说明

```typescript
// ctx.db 方法

// 插入记录
ctx.db.insert("table_name", {
  field1: value1,
  field2: value2,
})  // 返回新记录 ID

// 获取记录
ctx.db.get(id)  // 返回记录或 null

// 部分更新
ctx.db.patch(id, {
  field1: newValue1,
})  // 只更新指定字段

// 替换更新
ctx.db.replace(id, {
  field1: newValue1,
  field2: newValue2,
})  // 替换整个记录

// 删除记录
ctx.db.delete(id)  // 无返回值
```

### 5.3 完整 Mutation 示例

```typescript
// convex/functions.ts

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

// 更新文章
export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { postId, ...updates } = args;
    // 过滤掉 undefined 值
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(postId, filteredUpdates);
  },
});

// 点赞文章
export const likePost = mutation({
  args: { postId: v.id("posts") },
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
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    // 先删除该文章的所有评论
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // 再删除文章本身
    await ctx.db.delete(args.postId);
  },
});

// 批量操作示例
export const createPostWithInitialComment = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    commentContent: v.string(),
  },
  handler: async (ctx, args) => {
    // 创建文章
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      likes: 0,
      createdAt: Date.now(),
    });

    // 创建初始评论
    await ctx.db.insert("comments", {
      postId,
      authorId: args.authorId,
      content: args.commentContent,
      createdAt: Date.now(),
    });

    return postId;
  },
});
```

---

## 6. React 集成

### 6.1 ConvexProvider 设置

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

### 6.2 useQuery 详解

```tsx
// src/components/UserList.tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// 无参数查询
function UserList() {
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

// 带参数查询
function UserProfile({ userId }: { userId: string }) {
  const user = useQuery(api.functions.getUser, { userId });

  if (user === undefined) {
    return <div>加载中...</div>;
  }

  if (user === null) {
    return <div>用户不存在</div>;
  }

  return <div>{user.name}</div>;
}

// 可选参数查询
function PostCount({ authorId }: { authorId: string | null }) {
  const count = useQuery(api.functions.getPostCount, {
    authorId: authorId ?? undefined,
  });

  return <div>文章数: {count ?? 0}</div>;
}
```

### 6.3 useQuery 返回值详解

```typescript
const result = useQuery(api.functions.getUser, { userId: "xxx" });

// result 的类型和值：
undefined      // 加载中
null           // 查询成功但无数据
{ ... }        // 查询到的数据
```

### 6.4 useMutation 详解

```tsx
// src/components/CreatePost.tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function CreatePost({ authorId }: { authorId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 获取 mutation 函数
  const createPost = useMutation(api.functions.createPost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 调用 mutation
    const postId = await createPost({
      title,
      content,
      authorId,
    });

    console.log("创建的文章 ID:", postId);
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

### 6.5 useMutation 返回值

```typescript
const mutation = useMutation(api.functions.createPost);

// 返回值：
mutation()           // 调用函数，返回 Promise
mutation.isPending   // 是否执行中
mutation.error       // 错误对象
```

### 6.6 乐观更新示例

```tsx
// src/components/Post.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function Post({ postId }: { postId: string }) {
  const post = useQuery(api.functions.getPost, { postId });
  const likePost = useMutation(api.functions.likePost);

  if (post === undefined) {
    return <div>加载中...</div>;
  }

  const handleLike = () => {
    // 乐观更新：立即更新 UI
    likePost({ postId });
  };

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <button onClick={handleLike}>
        👍 {post.likes}
      </button>
    </div>
  );
}
```

---

## 7. 命名查询 (Named Queries)

### 7.1 定义命名查询

```typescript
// convex/functions.ts

// 带默认参数的命名查询
export const recentPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("posts")
      .order("desc")
      .take(limit);
  },
});

// 搜索查询
export const searchPosts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allPosts = await ctx.db.query("posts").collect();

    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});
```

### 7.2 使用命名查询

```tsx
// src/components/Feed.tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function Feed() {
  // 使用命名查询
  const posts = useQuery(api.functions.recentPosts, { limit: 5 });
  const searchResults = useQuery(api.functions.searchPosts, {
    searchTerm: "hello",
  });

  return (
    <div>
      <h2>最新文章</h2>
      {posts?.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
```

---

## 8. HTTP Actions

### 8.1 定义 HTTP Action

```typescript
// convex/http.ts
import { httpAction } from "./_generated/server";

export const handleWebhook = httpAction(async (ctx, request) => {
  const body = await request.json();

  // 处理 webhook
  console.log("Received webhook:", body);

  // 可以写入数据库
  await ctx.db.insert("webhookLogs", {
    payload: body,
    receivedAt: Date.now(),
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

export const handleFileUpload = httpAction(async (ctx, request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // 处理文件上传逻辑

  return new Response(JSON.stringify({ filename: file.name }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 8.2 路由配置

HTTP Action 默认路由为 `/http/[functionName]`，如 `/http/handleWebhook`。

---

## 9. 身份验证

### 9.1 内置认证

```typescript
// convex/auth.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 使用 Convex 内置认证
    return await ctx.auth.createUser({
      email: args.email,
      password: args.password,
    });
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    });
  },
});

export const signOut = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.signOut();
  },
});
```

### 9.2 获取当前用户

```typescript
// convex/functions.ts

// 获取当前认证用户
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    // 查找用户信息
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    return user;
  },
});
```

### 9.3 认证中间件

```typescript
// 保护需要认证的 mutation
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("请先登录");
    }

    // 查找用户
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("用户不存在");
    }

    return await ctx.db.insert("posts", {
      ...args,
      authorId: user._id,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});
```

---

## 10. 实时订阅

### 10.1 自动实时更新

Convex 的核心特性是实时数据同步。使用 `useQuery` 时，会自动建立 WebSocket 连接：

```tsx
// 数据变更会自动推送到所有订阅的客户端
function PostList() {
  // 当数据库中 posts 表发生变化时，组件会自动更新
  const posts = useQuery(api.functions.listPosts);

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post._id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 10.2 离线支持

```tsx
// 配置离线支持
const convex = new ConvexReactClient("https://your-project.convex.cloud", {
  // 离线时可使用的功能
  offlineStorage: {
    posts: {
      type: "cache",
      maxSize: 100,
    },
  },
});
```

---

## 11. 部署

### 11.1 开发环境

```bash
# 启动开发服务器
npx convex dev

# 这会：
# 1. 启动 Convex 后端服务
# 2. 打开 Convex 控制台 (http://localhost:5170)
# 3. 监听代码变更并自动部署
```

### 11.2 生产部署

```bash
# 部署到生产环境
npx convex deploy

# 部署后应用可通过 https://your-project.convex.cloud 访问
```

### 11.3 环境变量

```typescript
// convex.config.ts
export default defineApp({
  // 生产环境 URL
  url: process.env.CONVEX_DEPLOYMENT ?? "https://your-project.convex.cloud",
});
```

---

## 12. API 总结

### 12.1 Schema 定义

```typescript
defineSchema({})           // 定义数据库结构
defineTable({})             // 定义数据表
.index("name", ["field"])   // 创建索引
```

### 12.2 Query 函数

```typescript
// 后端
query({ args: {}, handler: async (ctx, args) => {} })

// 前端
useQuery(api.functions.xxx)                        // 无参数
useQuery(api.functions.xxx, { arg: value })       // 带参数
```

### 12.3 Mutation 函数

```typescript
// 后端
mutation({ args: {}, handler: async (ctx, args) => {} })

// 前端
const mutation = useMutation(api.functions.xxx)
mutation({ arg: value })    // 调用
mutation.isPending          // 加载状态
```

### 12.4 数据库操作

| 操作 | 方法 |
|------|------|
| 查询表 | `ctx.db.query("table")` |
| 获取单条 | `ctx.db.get(id)` |
| 插入 | `ctx.db.insert("table", data)` |
| 部分更新 | `ctx.db.patch(id, data)` |
| 替换 | `ctx.db.replace(id, data)` |
| 删除 | `ctx.db.delete(id)` |

---

## 13. 常见问题

### Q: Convex 和 Firebase/Supabase 有什么区别？

| 特性 | Convex | Firebase | Supabase |
|------|--------|----------|----------|
| 数据库类型 | 关系型 | NoSQL | PostgreSQL |
| 类型安全 | 原生 TypeScript | 需要额外配置 | PostgreSQL 类型 |
| 实时同步 | WebSocket 原生支持 | 原生支持 | PostgreSQL 实时 |
| 定价 | 免费额度大 | 按操作计费 | 按用量计费 |

### Q: 如何处理并发写入？

Convex 内置 ACID 事务支持：

```typescript
export const transferCredits = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Convex 自动处理并发冲突
    const fromUser = await ctx.db.get(args.fromUserId);
    const toUser = await ctx.db.get(args.toUserId);

    if (!fromUser || !toUser) {
      throw new Error("用户不存在");
    }

    if (fromUser.credits < args.amount) {
      throw new Error("余额不足");
    }

    await ctx.db.patch(args.fromUserId, {
      credits: fromUser.credits - args.amount,
    });

    await ctx.db.patch(args.toUserId, {
      credits: toUser.credits + args.amount,
    });
  },
});
```

### Q: 如何调试 Convex 函数？

```typescript
// 在 handler 中使用 console.log
export const debugFunction = query({
  args: {},
  handler: async (ctx) => {
    console.log("Debug:", ctx.db.query("users").collect());
    return [];
  },
});

// 在 Convex 控制台查看日志
// 访问 http://localhost:5170
```

---

## 参考链接

- 官方文档: https://docs.convex.dev
- 官网: https://convex.dev
- GitHub: https://github.com/get-convex
- React 集成: https://docs.convex.dev/client/react
