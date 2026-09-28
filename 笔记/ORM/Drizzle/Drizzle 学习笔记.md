## Drizzle 学习笔记

> 基于 Drizzle ORM 1.x / `@rc` 主线整理，示例使用 PostgreSQL + `node-postgres`（`pg`）+ TypeScript。Drizzle 不是“把 SQL 藏起来”的 ORM：表结构用 TypeScript 声明，查询 API 与 SQL 的 `SELECT`、`JOIN`、`WHERE` 一一对应；需要复杂 SQL 时可以安全地嵌入 SQL 片段。本文关系查询使用 1.x 的 Relational Queries v2 `defineRelations()`，不要照抄旧版 `relations(table, ...)` 写法。

---

## 1. Drizzle 是什么

### 1.1 为什么已经会写 SQL 还要用 Drizzle？

直接写 SQL 很灵活，但表名、列名、联表条件和返回结构通常没有 TypeScript 校验。字段改名后，错误往往要到运行时才发现；把用户输入拼进字符串还会造成 SQL 注入风险。

Drizzle ORM 是面向 TypeScript 的轻量、SQL-like ORM。它直接使用数据库驱动，表定义本身就是 TypeScript 源码；查询时根据表和列对象推导类型，并生成参数化 SQL。

| 问题 | Drizzle 的做法 |
| --- | --- |
| SQL 字段拼错、重命名后漏改 | 表与列是 TypeScript 对象，编译期可检查 |
| 类型和数据库结构不同步 | 用同一份 TypeScript Schema 生成迁移和推导类型 |
| ORM 表达不了复杂查询 | 保留 SQL 风格查询构造器与 `sql` 模板标签 |
| 手写迁移容易遗漏 | Drizzle Kit 从 Schema 差异生成 SQL 迁移 |
| 接入已有数据库成本高 | `drizzle-kit pull` 反向生成 Schema |

### 1.2 它由哪些部分组成？

```text
src/db/schema.ts  ->  Drizzle Kit  ->  drizzle/*.sql  ->  PostgreSQL
        |                                      ^
        v                                      |
src/db/index.ts  ->  Drizzle ORM + pg  --------+
        |
        v
TypeScript 业务代码
```

| 组件 | 作用 |
| --- | --- |
| Drizzle ORM | 运行时查询构造器、关系查询、事务与类型推导 |
| Drizzle Schema | 用 `pgTable` 等 TypeScript API 声明表、列、约束与索引 |
| Drizzle Kit | CLI：生成/执行迁移、推送 Schema、反向拉取、Studio |
| 数据库驱动 | 真正建立连接和执行 SQL；本章主线是 `pg` |
| Drizzle Studio | 本地启动的可视化数据库浏览器 |

### 1.3 Drizzle 能解决什么、不能替代什么？

适合：TypeScript 服务端、希望保留 SQL 可见性、CRUD 与复杂查询并存、需要迁移文件进入 Git 的项目。它支持 PostgreSQL、MySQL、SQLite、MSSQL 等多种方言和对应驱动。

需要谨慎：如果团队几乎不使用 TypeScript，类型收益会下降；如果团队对 SQL、索引和事务完全陌生，Drizzle 不会替你修复不合理的数据模型或慢查询。它降低样板代码，不替代数据库基础知识。

### 1.4 与 Prisma 的关键差别是什么？

| 维度 | Drizzle | Prisma |
| --- | --- | --- |
| Schema | TypeScript | Prisma DSL |
| 查询心智模型 | 接近 SQL | 模型方法与对象条件 |
| SQL 可控性 | 很高，可组合 `sql` | 大多数 CRUD 抽象，复杂场景用 Raw SQL |
| 运行时 | 基于所选 JS 驱动 | Prisma Client / Adapter 架构 |
| 适合偏好 | 想看懂和控制 SQL | 想用更高层 CRUD API |

> 重点：Drizzle 的“类型安全”来自 TypeScript Schema 与查询构造器，不表示数据库会自动阻止所有业务错误。唯一性、外键、检查约束和事务，仍应由数据库与业务代码共同保证。

---

## 2. 初始化一个 PostgreSQL 项目

### 2.1 要安装哪些包？

问题：Drizzle 为什么不只安装一个包？因为 ORM 与实际网络连接解耦；你要明确选择数据库驱动。

```bash
pnpm add drizzle-orm@rc pg dotenv
pnpm add -D drizzle-kit@rc tsx @types/pg typescript
```

| 包 | 用途 |
| --- | --- |
| `drizzle-orm` | 查询、Schema、事务等运行时 API |
| `pg` | PostgreSQL 的 Node.js 驱动与连接池 |
| `drizzle-kit` | 迁移、反向工程、Studio 等 CLI |
| `dotenv` | 开发时加载 `.env` |
| `tsx` | 直接执行 TypeScript 的脚本，例如 seed |

> 官方 1.x 文档当前以 `@rc` 作为主线安装标签。团队上线时应锁定已验证版本，升级前阅读迁移说明；不要不加评估地把所有依赖升级到最新。

### 2.2 推荐目录长什么样？

```text
my-drizzle-app/
├─ drizzle/                 # 生成并提交到 Git 的 SQL 迁移与 meta
├─ src/
│  ├─ db/
│  │  ├─ schema.ts          # 表、列、约束
│  │  ├─ relations.ts       # 关系查询定义（RQB v2）
│  │  └─ index.ts           # 连接池与 db 实例
│  └─ index.ts
├─ .env                     # 不提交密码
├─ drizzle.config.ts        # Drizzle Kit 配置
├─ package.json
└─ tsconfig.json
```

### 2.3 如何安全地配置连接？

`.env`：

```env
DATABASE_URL="postgresql://app_user:password@localhost:5432/drizzle_demo"
```

`.gitignore`：

```gitignore
.env
node_modules
```

问题：为什么既要 `.env`，又要在生产环境配置变量？`.env` 只适合本机开发；部署时应使用宿主机、云平台或密钥管理服务注入 `DATABASE_URL`，绝不能把真实密码提交进仓库。

### 2.4 `drizzle.config.ts` 有什么用？

它只供 Drizzle Kit CLI 使用，告诉它从哪里读取 Schema、把迁移输出到哪里、以哪个数据库连接做 `push`、`migrate`、`pull` 等操作。

```typescript
// drizzle.config.ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

> 重点：`drizzle.config.ts` 不会自动创建应用运行时的 `db`。CLI 配置与服务运行时连接是两件事，后者将在下一章创建。

### 2.5 常用命令应该怎样配置？

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:pull": "drizzle-kit pull",
    "db:check": "drizzle-kit check",
    "db:studio": "drizzle-kit studio"
  }
}
```

| 命令 | 解决的问题 | 是否改变数据库 |
| --- | --- | --- |
| `generate` | 把 Schema 差异变成可审查的 SQL 迁移 | 否 |
| `migrate` | 按迁移记录将变更应用到数据库 | 是 |
| `push` | 快速将当前 Schema 直接同步到数据库 | 是 |
| `pull` | 从已有数据库反向生成 Drizzle Schema | 不改表结构 |
| `check` | 检查生成迁移间的冲突/竞态 | 否 |
| `studio` | 打开本地数据库可视化工具 | 不改表结构 |

---

## 3. 创建数据库连接与第一条查询

### 3.1 为什么要显式使用连接池？

每个请求都新建 TCP 数据库连接，会产生认证与握手开销，并可能用尽 PostgreSQL 的连接数。`pg.Pool` 复用连接；应用关闭时再统一释放连接池。

```typescript
// src/db/index.ts
import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 云数据库常需要 SSL；本地 PostgreSQL 通常不需要。
  // ssl: { rejectUnauthorized: false },
})

export const db = drizzle({ client: pool })

export async function closeDatabase() {
  await pool.end()
}
```

### 3.2 如何确认连接真的可用？

```typescript
// src/index.ts
import { sql } from 'drizzle-orm'
import { closeDatabase, db } from './db'

async function main() {
  const result = await db.execute(sql`select 1 as ok`)
  console.log(result.rows) // [{ ok: 1 }]
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(closeDatabase)
```

运行：

```bash
pnpm tsx src/index.ts
```

这里的 `sql\`...\`` 是 Drizzle 的 SQL 模板标签。接下来会看到它如何自动参数化变量；不要改用字符串拼接。

### 3.3 Web 框架中也要每次关闭连接池吗？

不需要。长驻服务（NestJS、Express、Fastify、Next.js Node runtime）应在进程生命周期内复用一个 `Pool`/`db` 单例，在优雅退出钩子中调用 `pool.end()`；每个 HTTP 请求结束时关闭会抵消连接池的意义。一次性脚本、测试则应在 `finally` 关闭。

### 本章工程师审查

- 已区分 CLI 配置和运行时连接，避免“配置了 Kit 但业务没有 `db`”的常见误解。
- 使用 `Pool` 与进程级实例，未在请求处理函数中创建连接池。
- 密码只出现在环境变量示例中，生产 SSL 是否开启需按供应商要求配置，不能机械复制 `rejectUnauthorized: false`。
- 首条 SQL 使用 `sql` 模板标签而非拼接字符串，后续安全章节会说明边界。

---

## 4. 用 TypeScript 设计数据模型

### 4.1 一张表如何同时成为数据库定义和类型来源？

问题：既想让数据库有约束，又不想手写两遍 interface，怎么做？把表声明为唯一事实来源（source of truth）。例如下面的 `users` 同时决定迁移 SQL、插入类型和查询结果类型。

```typescript
// src/db/schema.ts
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['user', 'admin'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    name: text('name'),
    age: integer('age'),
    role: roleEnum('role').notNull().default('user'),
    isActive: boolean('is_active').notNull().default(true),
    balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('0'),
    preferences: jsonb('preferences').$type<{ theme?: 'light' | 'dark' }>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_created_at_idx').on(table.createdAt),
  ],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### 4.2 常用列类型该怎么选？

| PostgreSQL / Drizzle 列 | 适用问题 | 注意 |
| --- | --- | --- |
| `uuid().defaultRandom()` | 不想暴露连续自增 ID、分布式生成 ID | PostgreSQL 需要具备生成 UUID 的能力 |
| `integer()` / `bigint()` | 年龄、计数、金额最小单位 | `bigint` 的 JS 返回类型要按驱动配置确认 |
| `text()` / `varchar()` | 普通字符串 | `varchar` 的长度不是业务校验的替代品 |
| `numeric(precision, scale)` | 金额、精确小数 | `pg` 常以字符串返回，避免 JS 浮点误差 |
| `boolean()` | 开关状态 | 用 `.notNull().default(...)` 定义明确默认值 |
| `timestamp(..., { withTimezone: true })` | 绝对时间点 | 服务端统一使用 UTC，展示层再转换时区 |
| `jsonb()` | 低频变动的扩展属性 | 高频筛选字段通常应独立成列并建立索引 |

### 4.3 `.notNull()`、`.default()` 和 `$inferInsert` 有何关系？

```typescript
const draft: NewUser = {
  email: 'zhangsan@example.com',
  name: '张三',
  // id、role、isActive、balance、createdAt、updatedAt 都可省略：由数据库默认值提供。
}
```

- `.notNull()`：数据库禁止 `NULL`；它不等于“插入时必填”。
- `.default(...)` / `.defaultNow()`：由数据库默认值补齐，因此插入类型中通常可选。
- 没有默认值且 `.notNull()` 的列：在 `$inferInsert` 中必须提供。
- `$inferSelect` 描述从数据库读出的行；`$inferInsert` 描述可插入的数据。不要把查询结果类型直接用作创建 DTO。

### 4.4 数据库默认值能自动更新 `updatedAt` 吗？

不能。`defaultNow()` 只在 `INSERT` 时生效；PostgreSQL 没有通用的列级 “on update now” 语法。要么每次更新时显式设置，要么写数据库 trigger。

```typescript
import { eq } from 'drizzle-orm'

await db
  .update(users)
  .set({ name: '张三丰', updatedAt: new Date() })
  .where(eq(users.id, userId))
```

> 重点：应用层显式更新适用于所有经由应用的写操作；若还会有后台脚本、BI 或其他服务直接写库，考虑用 PostgreSQL trigger 作为最终保障。

---

## 5. 关系建模：外键与关系查询不是一回事

### 5.1 一对多要写什么？

问题：`posts.authorId` 写了以后，为什么还要定义 relations？因为外键负责数据库完整性，`defineRelations` 负责 Drizzle 关系查询的对象导航；两者职责不同，通常都要有。

```typescript
// 追加到 src/db/schema.ts
import { primaryKey } from 'drizzle-orm/pg-core'

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    published: boolean('published').notNull().default(false),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('posts_author_created_at_idx').on(table.authorId, table.createdAt)],
)
```

后续联表统计会使用评论表：

```typescript
export const comments = pgTable(
  'comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('comments_post_id_idx').on(table.postId)],
)
```

`onDelete: 'cascade'` 表示删除用户时由数据库删除其文章。它适合“文章绝不脱离作者存在”的模型；审计数据、订单等通常不应贸然级联删除，可能更适合 `restrict`、`set null` 或软删除。

### 5.2 一对一如何保证真的是“一”？

```typescript
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bio: text('bio'),
  },
  (table) => [uniqueIndex('profiles_user_id_unique').on(table.userId)],
)
```

只有外键仍是一对多；外键列上的唯一约束才让每个用户最多对应一条 profile。

### 5.3 多对多为什么必须有中间表？

关系型数据库没有“数组外键”。当文章可有多个标签、标签可属于多篇文章时，显式中间表能存储关联本身的创建时间、排序或权限等信息。

```typescript
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
})

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId], name: 'post_tags_pk' }),
    index('post_tags_tag_id_idx').on(table.tagId),
  ],
)
```

复合主键阻止重复的 `(postId, tagId)` 关联，`tagId` 单列索引优化“一个标签有哪些文章”的反向查询。

### 5.4 Relational Queries v2 应怎样定义？

```typescript
// src/db/relations.ts
import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts(),
    profile: r.one.profiles({ from: r.users.id, to: r.profiles.userId }),
  },
  posts: {
    author: r.one.users({ from: r.posts.authorId, to: r.users.id }),
    comments: r.many.comments(),
    postTags: r.many.postTags(),
  },
  comments: {
    post: r.one.posts({ from: r.comments.postId, to: r.posts.id }),
  },
  tags: {
    postTags: r.many.postTags(),
  },
  postTags: {
    post: r.one.posts({ from: r.postTags.postId, to: r.posts.id }),
    tag: r.one.tags({ from: r.postTags.tagId, to: r.tags.id }),
  },
}))
```

随后将关系提供给 `db`：

```typescript
// src/db/index.ts：在第 3 章代码的基础上补充
import { relations } from './relations'

export const db = drizzle({ client: pool, relations })
```

> 重点：不要将 Drizzle 的软关系（relations）误当成数据库外键。前者帮助查询，后者才会阻止无效 `author_id` 写入。生产模型应以数据库约束为准。

### 本章工程师审查

- 每个被高频过滤、排序或关联的字段均从实际访问方向考虑索引；没有把索引当作“越多越好”的装饰。
- `numeric` 的返回值和时区语义已明确，避免金额浮点与本地时间两个高频事故点。
- 一对一包含唯一约束，多对多包含显式中间表与复合主键，关系基数与数据库约束一致。
- 使用 `defineRelations()`、`from`、`to` 的 RQB v2 API；未混用已移除的 RQB v1 API。

---

## 6. CRUD：把常见业务操作翻译成 SQL

以下示例假定已从 `src/db/schema.ts` 导入 `users`、`posts`，并从 `src/db/index.ts` 导入 `db`。

### 6.1 如何创建并只返回需要的字段？

PostgreSQL 支持 `returning()`；如果不写它，`insert` 的结果不等于新行对象。

```typescript
const [user] = await db
  .insert(users)
  .values({
    email: 'zhangsan@example.com',
    name: '张三',
  })
  .returning({
    id: users.id,
    email: users.email,
    createdAt: users.createdAt,
  })
```

批量插入只需传数组：

```typescript
await db.insert(users).values([
  { email: 'a@example.com', name: 'A' },
  { email: 'b@example.com', name: 'B' },
])
```

### 6.2 如何按条件读取，而不是把整张表搬回应用？

```typescript
import { and, desc, eq, gte, ilike } from 'drizzle-orm'

const activeAdults = await db
  .select({
    id: users.id,
    email: users.email,
    name: users.name,
  })
  .from(users)
  .where(and(
    eq(users.isActive, true),
    gte(users.age, 18),
    ilike(users.name, '%张%'),
  ))
  .orderBy(desc(users.createdAt))
  .limit(20)
```

`select({ ... })` 是白名单投影：它减少传输，也避免把 `passwordHash`、内部备注等敏感列意外返回给 API。

### 6.3 更新和删除为什么必须有 `where`？

```typescript
const [updated] = await db
  .update(users)
  .set({ name: '张三丰', updatedAt: new Date() })
  .where(eq(users.email, 'zhangsan@example.com'))
  .returning({ id: users.id, name: users.name })

const deleted = await db
  .delete(posts)
  .where(eq(posts.id, postId))
  .returning({ id: posts.id })
```

没有 `.where(...)` 的 `update` / `delete` 是全表操作。类型系统无法判断“你是不是忘了条件”，因此应将写操作封装在语义明确的函数中，并在测试中覆盖它。

### 6.4 “不存在则创建、存在则更新”怎样写？

PostgreSQL 用唯一约束做冲突仲裁，避免“先查后插”在并发下产生竞态。

```typescript
const [user] = await db
  .insert(users)
  .values({ email: 'zhangsan@example.com', name: '张三' })
  .onConflictDoUpdate({
    target: users.email,
    set: { name: '张三', updatedAt: new Date() },
  })
  .returning()
```

`target` 必须对应实际唯一约束或唯一索引。对于“只想忽略重复导入”，使用 `.onConflictDoNothing()`。

### 6.5 过滤条件怎样组合？

| 目标 | API 示例 |
| --- | --- |
| 相等 / 不等 | `eq(users.role, 'admin')` / `ne(...)` |
| 范围 | `gt`、`gte`、`lt`、`lte` |
| 多个候选值 | `inArray(users.id, ids)` |
| 空值判断 | `isNull(users.deletedAt)` |
| 模糊查询（PostgreSQL） | `ilike(users.name, '%关键字%')` |
| 逻辑组合 | `and(...)`、`or(...)`、`not(...)` |

> 重点：`ilike` 的前导 `%` 往往无法使用普通 B-tree 索引。搜索量上来后，应评估 `pg_trgm`、全文检索或专用搜索服务，而不是只给该列加一个普通索引。

### 本章工程师审查

- 插入、更新、删除示例都明确处理了 PostgreSQL 的 `returning()` 语义。
- Upsert 依赖真实唯一约束，避免并发下“先查询再插入”的错误实现。
- 读取示例只投影所需字段，写入示例都带条件；全表写入风险已明确说明。
- 对模糊搜索的索引局限作出提示，避免把 ORM API 当成性能保证。

---

## 7. 联表、关系查询、分页与聚合

### 7.1 什么时候用 `join`，什么时候用关系查询？

问题：想得到“文章及作者名”，是 `with` 还是 `join`？

- 需要扁平结果、聚合、精确控制 SQL 时，用 `join`。
- 需要按对象嵌套读取关系时，用 Relational Queries v2 的 `db.query`。

`join` 示例：

```typescript
import { desc, eq } from 'drizzle-orm'

const rows = await db
  .select({
    postId: posts.id,
    title: posts.title,
    authorName: users.name,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt))
```

`innerJoin` 会排除找不到作者的行；如果外键允许为空或要保留左表全部记录，用 `leftJoin`，右表字段的类型也会相应变为可空。

### 7.2 怎样得到嵌套对象而不手工分组？

前提是第 5 章已将 `relations` 传入 `drizzle()`：

```typescript
const usersWithPosts = await db.query.users.findMany({
  columns: {
    id: true,
    email: true,
    name: true,
  },
  with: {
    posts: {
      columns: { id: true, title: true, createdAt: true },
      where: (posts, { eq }) => eq(posts.published, true),
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 10,
    },
  },
})
```

关系查询减少了应用层的拼装工作，但不是逃避理解 SQL 的理由。对大列表的深层嵌套，要检查生成 SQL、返回大小和索引，而不是默认它一定比 join 更快。

### 7.3 Offset 分页有什么陷阱？

后台页码列表常用 offset：

```typescript
const page = 2
const pageSize = 20

const pageRows = await db
  .select()
  .from(posts)
  .orderBy(desc(posts.createdAt), desc(posts.id))
  .limit(pageSize)
  .offset((page - 1) * pageSize)
```

它简单，但页数很深时数据库仍要跳过前面大量行；数据在翻页期间新增/删除时也可能重复或漏项。

### 7.4 时间线为什么更适合游标分页？

游标必须与稳定排序一致。下面以唯一 UUID `id` 升序为例，适合追加型数据；生产时间线更常以 `(createdAt, id)` 这样的复合游标排序，并建立同顺序的复合索引。

```typescript
import { asc, gt } from 'drizzle-orm'

const limit = 20
const rows = await db
  .select()
  .from(posts)
  .where(cursor ? gt(posts.id, cursor) : undefined)
  .orderBy(asc(posts.id))
  .limit(limit + 1)

const hasMore = rows.length > limit
const items = hasMore ? rows.slice(0, limit) : rows
const nextCursor = hasMore ? items.at(-1)!.id : null
```

> 重点：不能只按 `createdAt` 做游标，因为多个行可能同一时间戳。排序字段组合必须唯一且有确定顺序。

### 7.5 计数和分组如何保持类型正确？

PostgreSQL 的 `count()` 常以字符串返回，显式映射为 number，避免 API 返回值混乱。

```typescript
import { count, desc, eq } from 'drizzle-orm'

const [{ total }] = await db
  .select({ total: count().mapWith(Number) })
  .from(posts)
  .where(eq(posts.published, true))

const byAuthor = await db
  .select({
    authorId: posts.authorId,
    postCount: count(posts.id).mapWith(Number),
  })
  .from(posts)
  .groupBy(posts.authorId)
  .orderBy(desc(count(posts.id)))
```

### 本章工程师审查

- 明确区分扁平 join 与嵌套关系查询，关系 API 的前置配置已说明。
- Offset 示例给出稳定次级排序；游标示例的条件、排序与下一游标保持一致。
- 聚合结果显式处理 `count` 的驱动返回类型，未假设它一定是 JavaScript number。

---

## 8. 迁移：怎样让数据库变更可审查、可部署？

### 8.1 为什么不要只用 `push`？

`push` 很适合原型与本地测试：它直接把当前 Schema 同步到数据库。但它没有留下团队可审查、可复现的正式变更历史。生产项目的主线应是：改 Schema → 生成 SQL 迁移 → 审查 SQL → 提交 Git → 部署时执行迁移。

```bash
# 1. 修改 src/db/schema.ts 后生成迁移
pnpm db:generate

# 2. 审查 drizzle/*.sql，确认数据迁移与锁风险
# 3. 本地应用
pnpm db:migrate
```

生成目录通常包含 SQL 文件与 `meta` 快照；二者都应提交。不要手工删除历史快照来“重来”，已被其他环境应用的迁移记录必须保留。

### 8.2 开发、测试、生产分别如何使用？

| 环境 | 推荐策略 |
| --- | --- |
| 原型 / 临时本地库 | `db:push`，快速迭代 |
| 团队开发 | `generate` → 审查 → `migrate` |
| CI | 在空数据库执行全部迁移；运行 `db:check` |
| 生产 | 只运行已经提交和审查过的 `db:migrate` |

问题：Schema 改了但迁移已经生成，能直接改旧 SQL 吗？若迁移从未分享、从未在任何环境应用，可以整理；一旦进入共享环境，应新建一条后续迁移，保证所有环境沿同一历史前进。

### 8.3 破坏性变更怎样做才不会丢数据？

“把 `name` 改为非空”不能只改 `.notNull()`：旧数据可能存在 `NULL`。应使用 expand / migrate / contract 的分阶段策略。

```text
阶段 1：新增可空列或兼容代码，同时双写
阶段 2：回填历史数据，验证无 NULL / 无异常
阶段 3：添加 NOT NULL、切换读取
阶段 4：确认没有旧版本服务后再删除旧列
```

对大表的索引、列类型变更尤其要在预发估算锁表和执行时间；ORM 能生成 DDL，不会消除 PostgreSQL DDL 的运行风险。

### 8.4 如何接入已有数据库？

```bash
pnpm db:pull
```

`pull` 会检查数据库并生成/更新 Schema。首次接入后应人工审查命名、外键、枚举、索引和自定义类型，再决定如何将现有结构纳入迁移基线。它不是“运行一次后永远不用审查”的代码生成器。

### 8.5 `studio` 是否可以当生产管理后台？

```bash
pnpm db:studio
```

Studio 默认在本机启动代理（官方文档默认 `127.0.0.1:4983`），适合开发排查。不要把它直接暴露到公网，也不要用共享生产凭据随意编辑线上数据。

### 本章工程师审查

- 明确生产迁移使用已审查 SQL，而不是运行时 `push`。
- 覆盖了迁移历史不可改写、CI 验证和大表 DDL 锁风险。
- 对破坏性变更提供分阶段路径，避免 Schema 语句正确但线上数据不兼容。

---

## 9. 事务与并发：如何确保多步写入要么全成、要么全败？

### 9.1 转账为什么不能拆成两次独立更新？

两条独立 SQL 之间发生异常，会出现“扣款成功、入账失败”。把它们放进 `db.transaction`：回调正常结束时提交，抛错时回滚。

```typescript
import { eq, sql } from 'drizzle-orm'

await db.transaction(async (tx) => {
  const [from] = await tx
    .select({ balance: users.balance })
    .from(users)
    .where(eq(users.id, fromUserId))
    .for('update')

  if (!from || Number(from.balance) < amount) {
    throw new Error('余额不足或账户不存在')
  }

  await tx
    .update(users)
    .set({ balance: sql`${users.balance} - ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, fromUserId))

  await tx
    .update(users)
    .set({ balance: sql`${users.balance} + ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, toUserId))
})
```

这里 `for('update')` 锁住被读取的付款账户，避免两个并发请求都根据同一个旧余额判断“余额充足”。实际金额应使用最小货币单位整数或精确 Decimal 策略，示例的 `Number` 仅用于说明流程。

### 9.2 嵌套事务会怎样？

Drizzle 的嵌套 `tx.transaction(...)` 使用 savepoint。内层失败可回滚到保存点，外层仍能决定是否继续；不要把它误认为独立数据库事务。

```typescript
await db.transaction(async (tx) => {
  await tx.insert(posts).values({ title: '事务文章', authorId: userId })

  await tx.transaction(async (tx2) => {
    await tx2.insert(tags).values({ name: 'drizzle' })
  })
})
```

### 9.3 事务中最重要的性能原则是什么？

- 不要在事务中调用第三方 HTTP、发送邮件、上传文件或等待用户输入。
- 先校验输入，再尽可能短地执行数据库读写。
- 并发竞争业务要用数据库条件更新、唯一约束、锁或合适的隔离级别，而不只靠内存变量。
- 捕获错误后不要吞掉；要么重新抛出使其回滚，要么明确处理。

### 本章工程师审查

- 转账操作被包在同一事务中，并展示行锁以应对读-判定-写竞争。
- 金额精度和长事务风险已说明，未把示例误导为可直接用于金融系统的完整方案。
- 嵌套事务准确描述为 savepoint，不夸大其隔离性。

---

## 10. 原始 SQL：如何保持能力与安全？

### 10.1 `sql` 模板标签为什么比字符串拼接安全？

插值的普通值会被参数化：

```typescript
import { sql } from 'drizzle-orm'

const domain = '%@example.com'
const result = await db.execute(
  sql`select id, email from ${users} where ${users.email} ilike ${domain}`,
)
```

Drizzle 会把表/列对象作为标识符处理，把 `domain` 作为参数传给驱动；用户输入不会变成 SQL 语法的一部分。

### 10.2 什么时候应该使用 `sql.raw()`？

几乎只在 SQL 片段完全由开发者固定控制时。下面是错误示例：

```typescript
// ❌ 绝不能这样做：sortFromUser 可能注入 SQL
const unsafe = sql.raw(`order by ${sortFromUser}`)
```

正确办法是把外部输入映射到固定的列对象与排序函数：

```typescript
import { asc, desc } from 'drizzle-orm'

const orderBy = sortFromUser === 'oldest'
  ? asc(posts.createdAt)
  : desc(posts.createdAt)

const safeRows = await db.select().from(posts).orderBy(orderBy)
```

### 10.3 能否将 SQL 片段嵌入查询构造器？

可以。这正是 Drizzle 适合复杂场景的原因：

```typescript
const rows = await db
  .select({
    id: posts.id,
    title: posts.title,
    commentCount: sql<number>`count(${comments.id})`.mapWith(Number),
  })
  .from(posts)
  .leftJoin(comments, eq(comments.postId, posts.id))
  .groupBy(posts.id)
```

原则很简单：值用参数化插值；标识符使用 Schema 对象；只有受控常量才可能使用 `sql.raw`。原始 SQL 不是失败方案，而是要接受和测试的数据库代码。

### 本章工程师审查

- 明确区分值参数、表/列标识符和危险的 raw 字符串。
- 动态排序采用白名单映射，不让客户端控制 SQL 结构。
- 聚合 SQL 片段仍复用列对象，类型映射也已显式处理。
