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
    postTags: r.many.postTags(),
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
