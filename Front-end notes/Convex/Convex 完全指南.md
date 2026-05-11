## 1. 简介与核心概念

### 1.1 什么是 Convex

Convex 是一个 **TypeScript 后端即服务（Backend as a Service）平台**，让开发者无需关心复杂的后端基础设施，就能快速构建实时同步的全栈应用。

它解决了三个核心问题：

| 问题     | 解决方案                               |
| ------ | ---------------------------------- |
| 实时数据同步 | WebSocket 自动推送数据变更到所有客户端           |
| 后端逻辑管理 | 用 TypeScript 编写服务器端函数，无需独立 API 服务器 |
| 数据库操作  | 内置关系型数据库，支持 ACID 事务                |

本地写的 Convex 后端代码，即 `convex/projects.ts` 里的函数，会被 **部署（同步）到 Convex Cloud**，无需写nestjs、express，convex全包了。

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

### 1.4 convex运行流程

前端调用 `api.xxx.xxx` 本身不是执行函数，它是一个 **函数引用（function reference）**。

当把它传给 `useQuery / useMutation / useAction` 时，Convex Client SDK 会向 Convex Server 发请求

然后在服务器端执行对应的 server function。

---

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

### 3.2 defineSchema 完整用法

`defineSchema` 是 Convex 数据库结构的核心，用于定义应用程序的所有数据表。

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// 基础用法
export default defineSchema({
  // 在这里定义所有表...
});
```

#### schemaOptions 配置

```typescript
// convex/schema.ts
import { defineSchema } from "convex/server";

export default defineSchema({
  // 表定义...
}, {
  // Schema 配置选项（可选）
  schemaValidator: {
    // 验证器配置
  },
});
```

### 3.3 defineTable 完整用法

`defineTable` 用于定义单个数据表的结构。

#### 基础语法

```typescript
defineTable(fields: {
  fieldName: FieldType,
  // ...更多字段
})
```

#### 完整示例

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==================== 用户表 ====================
  users: defineTable({
    // 必填字段
    name: v.string(),                    // 用户名
    email: v.string(),                   // 邮箱

    // 带验证的字段
    age: v.number(),                     // 年龄
    avatar: v.optional(v.string()),     // 头像（可选）
    bio: v.union(v.string(), v.null()), // 个人简介（字符串或null）

    // 枚举字段
    role: v.union(
      v.literal("admin"),
      v.literal("user"),
      v.literal("guest")
    ),

    // 关联字段
    profileId: v.optional(v.id("profiles")),

    // 元数据
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // 单字段索引
    .index("by_email", ["email"])
    // 多字段索引
    .index("by_role", ["role"])
    // 复合索引
    .index("by_role_created", ["role", "createdAt"])
    // 搜索索引（字符串前缀查询）
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["role"],
    }),
});
```

#### defineTable 方法链

```typescript
defineTable(fields)
  .index("indexName", ["field1", "field2"])           // 添加索引
  .searchIndex("searchName", options)                 // 添加搜索索引
  .validator(validatorFunction)                        // 自定义验证器
```

### 3.4 字段类型详解

#### 基础类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `v.string()` | 字符串 | `"hello"` |
| `v.number()` | 数字（整数或浮点） | `42`, `3.14` |
| `v.boolean()` | 布尔值 | `true` / `false` |
| `v.bytes()` | 二进制数据 | `ArrayBuffer` |

#### 可选与可空

| 类型                     | 说明           | 示例                              |
| ---------------------- | ------------ | ------------------------------- |
| `v.optional(T)`        | 可选值（字段可以不存在） | `v.optional(v.string())`        |
| `v.union(T, v.null())` | 值可以为 null    | `v.union(v.string(), v.null())` |

#### 高级类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `v.id("table")` | 指向其他表的 ID | `v.id("users")` |
| `v.array(T)` | 数组 | `v.array(v.string())` |
| `v.object({})` | 嵌套对象 | `v.object({ x: v.number(), y: v.number() })` |
| `v.map(K, V)` | Map 对象 | `v.map(v.string(), v.number())` |
| `v.set(T)` | Set 集合 | `v.set(v.string())` |

#### 生成的类型 (dataModel)

```typescript
// convex/functions.ts
import { Id, Doc } from "../convex/_generated/dataModel";

// Id<"table_name"> - 表示某个表的 ID 类型
type UserId = Id<"users">;
type PostId = Id<"posts">;

// Doc<"table_name"> - 表示某个表的完整文档类型
type UserDoc = Doc<"users">;
type PostDoc = Doc<"posts">;

// 在 Query/Mutation 中的用法
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    return await ctx.db.get(args.userId);
  },
});

export const listPosts = query({
  args: {},
  handler: async (ctx): Promise<Doc<"posts">[]> => {
    return await ctx.db.query("posts").collect();
  },
});

// 使用 Id 类型进行数据库操作
export const createPost = mutation({
  args: {
    title: v.string(),
    authorId: v.id("users"),  // 使用 v.id() 定义参数
  },
  handler: async (ctx, args): Promise<Id<"posts">> => {
    return await ctx.db.insert("posts", {
      title: args.title,
      authorId: args.authorId,  // args.authorId 类型为 Id<"users">
    });
  },
});
```

**类型对比：**

| 类型 | 来源 | 用途 |
|------|------|------|
| `Id<"table">` | `dataModel` | TypeScript 类型，描述表的主键 ID |
| `v.id("table")` | `convex/values` | 运行时验证器，验证参数是否为有效 ID |
| `Doc<"table">` | `dataModel` | TypeScript 类型，描述表的完整文档结构 |

#### 字面量与联合

```typescript
// 字面量类型
v.literal("admin")                    // 只能是 "admin"
v.literal(1)                          // 只能是 1
v.literal(true)                       // 只能是 true

// 联合类型
v.union(
  v.string(),
  v.number()
)

// 枚举（推荐方式）
v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("completed")
)
```

### 3.5 索引详解

**索引**可以理解为**数据库额外维护的一张表**，这样查 `ownerId` 时不用扫描全表。

``` ts
.index("by_owner", ["ownerId"])

// 创建一个名字叫 by_owner 的索引，按 ownerId 字段建立查询通道。
```

#### 索引类型

```typescript
// 普通索引 - 加速等值查询
.index("by_email", ["email"])

// 复合索引 - 加速多字段查询
.index("by_user_date", ["authorId", "createdAt"])

// 搜索索引 - 加速全文搜索
.searchIndex("search_title", {
  searchField: "title",
  filterFields: ["authorId", "isPublished"],
})
```

#### 使用索引

##### withIndex 基本用法

```typescript
// 在 Query 函数中使用索引
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

##### 比较操作符

```typescript
// eq - 等于
q.eq("field", value)

// gt - 大于
q.gt("field", value)

// gte - 大于等于
q.gte("field", value)

// lt - 小于
q.lt("field", value)

// lte - 小于等于
q.lte("field", value)

// ne - 不等于
q.ne("field", value)
```

##### 完整查询示例

```typescript
// convex/functions.ts

// 1. 基本等值查询
export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();  // 返回唯一结果
  },
});

// 2. 范围查询
export const getRecentPosts = query({
  args: { daysAgo: v.number() },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.daysAgo * 24 * 60 * 60 * 1000;
    return await ctx.db
      .query("posts")
      .withIndex("by_created", (q) => q.gte("_creationTime", cutoffTime))
      .order("desc")
      .collect();
  },
});

// 3. 复合索引查询（多字段）
export const getUserPublishedPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author_published", (q) =>
        q.eq("authorId", args.userId).eq("published", true)
      )
      .order("desc")
      .collect();
  },
});

// 4. 复合索引+范围查询
export const getUserPostsInDateRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author_created", (q) =>
        q
          .eq("authorId", args.userId)
          .gte("createdAt", args.startDate)
          .lte("createdAt", args.endDate)
      )
      .order("desc")
      .collect();
  },
});

// 5. 分页查询
export const getUserPostsPaginated = query({
  args: {
    userId: v.id("users"),
    limit: v.number(),
    cursor: v.optional(v.string()),  // 用于下一页的游标
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc");

    // 如果有 cursor，从该位置继续
    if (args.cursor) {
      queryBuilder = queryBuilder.cursor(args.cursor);
    }

    const posts = await queryBuilder.take(args.limit + 1);  // 多取一条判断是否有下一页

    const hasNextPage = posts.length > args.limit;
    const result = hasNextPage ? posts.slice(0, -1) : posts;
    const nextCursor = hasNextPage ? result[result.length - 1]._id : null;

    return { posts: result, nextCursor };
  },
});

// 6. 获取单条记录
export const getLatestPost = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .first();
  },
});
```

##### 使用搜索索引

```typescript
// 使用搜索索引进行全文搜索
export const searchPosts = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.term)
      )
      .collect();
  },
});

// 搜索索引 + 过滤条件
export const searchPublishedPosts = query({
  args: { term: v.string(), authorId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) => {
        let builder = q.search("title", args.term);
        if (args.authorId) {
          builder = builder.filter((q) =>
            q.eq("authorId", args.authorId!)
          );
        }
        return builder;
      })
      .collect();
  },
});
```

##### 不使用索引的查询

```typescript
// 直接查询表（无索引）
export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});

// 手动过滤（性能较差，不推荐）
export const getPostsSlow = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const allPosts = await ctx.db.query("posts").collect();
    return allPosts.filter((post) => post.authorId === args.authorId);
  },
});
```

#### 内置索引

```typescript
// _id - 主键，自动可用
ctx.db.get(id)

// _creationTime - 创建时间，自动索引
ctx.db.query("posts").order("desc")  // 默认按创建时间排序
```

### 3.6 完整 Schema 示例

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ==================== 用户表 ====================
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("user"),
      v.literal("guest")
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ==================== 文章表 ====================
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    slug: v.string(),                    // URL 友好的话题
    authorId: v.id("users"),
    published: v.boolean(),
    tags: v.array(v.string()),          // 标签数组
    metadata: v.object({                // 嵌套元数据
      views: v.number(),
      shares: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published"])
    .index("by_author_published", ["authorId", "published"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published"],
    }),

  // ==================== 评论表 ====================
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),  // 父评论（回复）
    likes: v.number(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),

  // ==================== 标签表 ====================
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),
});
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


``` ts
// ctx.db.get()

// 获取单条数据最快、最简单的方式。

// 输入：必须是一个唯一的 Id

// 输出：直接返回那个文档对象 (Doc)，如果 ID 不存在则返回 null

// 获取：ID 已经包含了表信息 
await ctx.db.get(args.userId);

// OR 可指定表名
await ctx.db.get("projects", args.id);
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

// 通过 ID 获取单条记录
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    // user 类型为 Doc<"users">，包含所有字段
    return user;
  },
});

// 批量获取（结合 Promise.all）
export const getPostsWithAuthors = query({
  args: { postIds: v.array(v.id("posts")) },
  handler: async (ctx, args) => {
    const posts = await Promise.all(
      args.postIds.map((id) => ctx.db.get(id))
    );
    // 过滤掉不存在的记录
    return posts.filter((post): post is Doc<"posts"> => post !== null);
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
ctx.db.get('project',id)  // 返回记录或 null

// 部分更新
ctx.db.patch('project',id, {
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

`useQuery` 监听的是convex在浏览器里的查询结果的缓存

`useQuery` 察觉到缓存变了，立即触发 React 组件重绘。

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

### 6.6 乐观更新

#### 基础乐观更新

简单的乐观更新直接调用 mutation，UI 会自动等待服务器响应后更新：

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

#### withOptimisticUpdate 精细化控制

`withOptimisticUpdate` 通过链式调用来自定义乐观更新行为，在 mutation 执行前立即更新本地缓存：

```tsx
// 链式调用 withOptimisticUpdate
const createProject = useMutation(api.projects.create)
  .withOptimisticUpdate((localStore, args) => {
    // localStore.getQuery 获取当前查询数据
    const projects = localStore.getQuery(api.projects.list);

    // localStore.setQuery 设置更新后的数据
    localStore.setQuery(api.projects.list, {}, [
      ...projects,
      {
        _id: "temp-id",  // 临时 ID，服务器会返回真实 ID
        name: args.name,
      }
    ]);
  });
```

#### localStore API

`localStore` 表示本地缓存数据库

方法：
```typescript
// 获取某个查询的当前数据
localStore.getQuery(queryFunction, args)

// 设置某个查询的本地数据
localStore.setQuery(queryFunction, args, newData)

// 清除所有乐观更新（回滚）
localStore.rollback()
```

`getQuery` 和 `setQuery` 是对**Convex 客户端在浏览器内存中的实时查询缓存**进行操作。

**自动回滚机制**：

- **如果服务器成功**：服务器返回的真实数据会写入缓存，替换掉你的乐观更新数据。因为数据一致，UI 不会发生跳变。
    
- **如果服务器失败**：Convex 会自动丢弃你刚才用 `set` 做的修改，并将缓存回滚到服务器之前的状态。UI 会自动“弹回”到原始值。

#### 完整示例：创建项目

```tsx
// src/components/ProjectList.tsx
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function ProjectList() {
  const projects = useQuery(api.projects.list);

  // 创建项目并乐观更新列表
  const createProject = useMutation(api.projects.create)
    .withOptimisticUpdate((localStore, args) => {
      const existingProjects = localStore.getQuery(api.projects.list, {});
      localStore.setQuery(api.projects.list, {}, [
        ...existingProjects,
        {
          _id: `temp-${Date.now()}`,  // 临时 ID
          name: args.name,
          description: args.description,
          createdAt: Date.now(),
        }
      ]);
    });

  const handleCreate = async (name: string, description: string) => {
    await createProject({ name, description });
    // 服务器响应后，列表会自动更新为真实数据
  };

  if (projects === undefined) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      {projects.map((project) => (
        <div key={project._id}>{project.name}</div>
      ))}
    </div>
  );
}
```

#### 完整示例：删除项目

```tsx
const deleteProject = useMutation(api.projects.remove)
  .withOptimisticUpdate((localStore, args) => {
    const projects = localStore.getQuery(api.projects.list, {});
    // 过滤掉被删除的项目
    localStore.setQuery(api.projects.list, {}, projects.filter(
      (p) => p._id !== args.projectId
    ));
  });
```

#### 完整示例：点赞计数

```tsx
const likePost = useMutation(api.posts.like)
  .withOptimisticUpdate((localStore, args) => {
    // 直接修改单条记录的字段
    const posts = localStore.getQuery(api.posts.list, {});
    const updatedPosts = posts.map((post) => {
      if (post._id === args.postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    });
    localStore.setQuery(api.posts.list, {}, updatedPosts);
  });
```

#### 配合 useOptimistic 实现复杂乐观更新

当需要管理多个并发的乐观更新时，可以配合 `useOptimistic` 使用：

```tsx
import { useMutation, useQuery, useOptimistic } from "convex/react";
import { api } from "../convex/_generated/api";

function PostComments({ postId }: { postId: string }) {
  const comments = useQuery(api.comments.list, { postId });

  // 使用 useOptimistic 管理乐观更新队列
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => {
      return [newComment, ...state];
    }
  );

  const addComment = useMutation(api.comments.create)
    .withOptimisticUpdate((localStore, args) => {
      addOptimisticComment({
        _id: `temp-${Date.now()}`,
        postId,
        content: args.content,
        createdAt: Date.now(),
      });
    });

  return (
    <div>
      {optimisticComments?.map((comment) => (
        <div key={comment._id}>{comment.content}</div>
      ))}
    </div>
  );
}
```

#### 最佳实践

| 场景 | 推荐方式 |
|------|---------|
| 简单点赞/计数 | 直接 mutation（自动乐观更新）|
| 添加到列表 | `withOptimisticUpdate` + `localStore.setQuery` |
| 从列表移除 | `withOptimisticUpdate` + `filter` |
| 修改单条记录 | `withOptimisticUpdate` + `map` |
| 多个并发更新 | `useOptimistic` + `withOptimisticUpdate` |

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

