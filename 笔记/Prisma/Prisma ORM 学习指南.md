## Prisma ORM 学习指南

> 基于 Prisma ORM 7.x 主线整理。Prisma 7 和 Prisma 6 以前最大的差异是：默认生成器改为 `prisma-client`、生成路径必须显式配置、环境变量不再自动从 `.env` 注入到 Schema、数据库连接建议通过 `prisma.config.ts` 和 driver adapter 管理。学习时请优先按本文的新写法实践。

---

## 1. Prisma 是什么

Prisma 是 TypeScript / Node.js 生态中的现代 ORM。它把数据库表结构声明在 `schema.prisma` 中，再根据 Schema 生成类型安全的 Prisma Client。你在业务代码里调用 `prisma.user.findMany()` 之类的 API 时，编辑器可以根据数据库模型自动推导字段、参数和返回值类型。

### 1.1 Prisma 解决的问题

| 问题 | Prisma 的做法 |
| --- | --- |
| 手写 SQL 容易拼错字段 | 根据 Schema 生成类型安全 Client |
| 数据库结构和代码类型不同步 | 修改 Schema 后运行迁移和生成 Client |
| 关系查询写起来繁琐 | 用 `include`、`select`、嵌套写入描述关系 |
| 数据库变更难追踪 | `prisma migrate` 生成可提交的迁移文件 |
| 数据库调试不直观 | `prisma studio` 提供可视化界面 |

### 1.2 Prisma 的核心组件

```text
schema.prisma  ->  Prisma CLI / Migrate  ->  Database
      |
      v
Prisma Client  ->  TypeScript application
```

| 组件 | 作用 |
| --- | --- |
| Prisma Schema | 用 DSL 声明数据源、生成器、模型、关系、索引、约束 |
| Prisma CLI | 执行 `init`、`generate`、`migrate`、`db pull`、`studio` 等命令 |
| Prisma Client | 由 Schema 生成的类型安全数据库访问层 |
| Prisma Migrate | 把 Schema 变化转换为 SQL 迁移 |
| Prisma Studio | 浏览器中的数据库数据管理工具 |
| Driver Adapter | Prisma Client 和 JS 数据库驱动之间的适配层，Prisma 7 的主线连接方式 |

### 1.3 适合与不适合

适合：

- TypeScript 项目，希望端到端类型安全。
- CRUD、后台管理、SaaS、内容系统、业务系统。
- 团队希望用声明式 Schema 管理数据库演进。
- Next.js、tRPC、Express、Fastify 等 Node 服务。

需要谨慎：

- 需要大量手写复杂 SQL、窗口函数、数据库特定优化的场景。
- 数据模型变化非常频繁但没有迁移纪律的团队。
- 非 TypeScript 项目，Prisma 的类型优势会被削弱。

---

## 2. Prisma 7 项目初始化

### 2.1 安装依赖

以 PostgreSQL 为例：

```bash
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

常见数据库对应依赖：

| 数据库 | Adapter | JS 驱动 |
| --- | --- | --- |
| PostgreSQL / CockroachDB | `@prisma/adapter-pg` | `pg` |
| MySQL | `@prisma/adapter-mysql` | `mysql2` |
| MariaDB | `@prisma/adapter-mariadb` | `mariadb` |
| SQLite | `@prisma/adapter-better-sqlite3` | `better-sqlite3` |
| Microsoft SQL Server | `@prisma/adapter-mssql` | `mssql` |
| D1 / LibSQL / Neon / PlanetScale | 使用对应 Prisma 官方 adapter | 对应平台驱动 |

> MongoDB 在 Prisma 7 初期不是主线支持目标，学习关系型数据库时建议先用 PostgreSQL 或 SQLite。

### 2.2 初始化

```bash
npx prisma init
```

典型目录：

```text
my-app/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  └─ generated/
│     └─ prisma/
├─ prisma.config.ts
├─ .env
└─ package.json
```

### 2.3 Prisma 7 的 Schema 基础配置

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

重点：

- `provider = "prisma-client"` 是 Prisma 7 的推荐生成器。
- `output` 必须显式配置，避免生成物隐藏在 `node_modules`。
- `datasource` 中通常不再写 `url = env("DATABASE_URL")`，连接信息放在 `prisma.config.ts`。

### 2.4 `prisma.config.ts`

```typescript
// prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

`.env` 示例：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
```

### 2.5 生成 Prisma Client

```bash
npx prisma generate
```

Prisma 7 推荐从自定义输出路径导入：

```typescript
import { PrismaClient } from '@/generated/prisma/client'
```

如果你的项目没有 `@` 路径别名，也可以使用相对路径：

```typescript
import { PrismaClient } from '../generated/prisma/client'
```

---

## 3. Prisma Client 初始化

### 3.1 PostgreSQL 单例写法

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

为什么要单例：

- Next.js / Vite / tsx watch 在开发热更新时会重复加载模块。
- 每次 `new PrismaClient()` 都可能创建连接资源。
- 全局缓存可以避免开发环境连接数快速耗尽。

### 3.2 SQLite 示例

```bash
npm install @prisma/adapter-better-sqlite3 better-sqlite3
```

```typescript
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSQLite3({
  url: 'file:./dev.db',
})

export const prisma = new PrismaClient({ adapter })
```

### 3.3 日志与调试

```typescript
export const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
})
```

生产环境通常只保留 `warn` 和 `error`。

---

## 4. 数据模型设计

### 4.1 一个完整模型

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

### 4.2 常用标量类型

| Prisma 类型 | 用途 |
| --- | --- |
| `String` | 文本、UUID、CUID |
| `Int` / `BigInt` | 整数、大整数 |
| `Float` | 浮点数 |
| `Decimal` | 金额、精确小数 |
| `Boolean` | 布尔值 |
| `DateTime` | 日期时间 |
| `Json` | JSON 字段 |
| `Bytes` | 二进制 |

### 4.3 字段修饰符

```prisma
model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  title       String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  tags        String[]
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([title])
}
```

| 语法 | 含义 |
| --- | --- |
| `?` | 可空字段 |
| `[]` | 列表字段，支持情况取决于数据库 |
| `@id` | 主键 |
| `@unique` | 唯一约束 |
| `@default(...)` | 默认值 |
| `@updatedAt` | 更新时自动刷新 |
| `@db.Decimal(10, 2)` | 数据库原生类型 |
| `@map("column_name")` | 映射数据库列名 |
| `@@map("table_name")` | 映射数据库表名 |
| `@@index([...])` | 普通索引 |
| `@@unique([...])` | 复合唯一约束 |
| `@@id([...])` | 复合主键 |

### 4.4 主键选择

```prisma
model AutoUser {
  id Int @id @default(autoincrement())
}

model PublicUser {
  id String @id @default(cuid())
}

model ExternalUser {
  id String @id @default(uuid())
}
```

建议：

- 后台内部系统：`Int autoincrement()` 简单高效。
- 公共 URL、分布式系统：`cuid()` 或 `uuid()` 更安全。
- 不要把自增 ID 直接暴露给敏感资源 URL。

---

## 5. 关系建模

### 5.1 一对多

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String

  @@index([authorId])
}
```

查询：

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'a@example.com' },
  include: {
    posts: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
})
```

### 5.2 一对一

```prisma
model User {
  id      String   @id @default(cuid())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique
}
```

一对一的外键侧通常要加 `@unique`。

### 5.3 隐式多对多

```prisma
model Post {
  id    String @id @default(cuid())
  title String
  tags  Tag[]
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}
```

适合中间表没有额外字段的场景。

### 5.4 显式多对多

```prisma
model Post {
  id       String    @id @default(cuid())
  title    String
  postTags PostTag[]
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  postTags PostTag[]
}

model PostTag {
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId     String
  createdAt DateTime @default(now())

  @@id([postId, tagId])
  @@index([tagId])
}
```

适合中间表需要 `createdAt`、排序、权限、状态等额外字段。

### 5.5 自引用关系

```prisma
model Comment {
  id        String    @id @default(cuid())
  content   String
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")

  @@index([parentId])
}
```

---

## 6. Prisma Client CRUD

示例模型：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  age       Int?
  isActive  Boolean  @default(true)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())

  @@index([authorId])
}
```

### 6.1 Create

```typescript
const user = await prisma.user.create({
  data: {
    email: 'zhangsan@example.com',
    name: '张三',
    posts: {
      create: [
        { title: '第一篇文章', published: true },
        { title: '草稿' },
      ],
    },
  },
  include: { posts: true },
})
```

批量创建：

```typescript
await prisma.user.createMany({
  data: [
    { email: 'a@example.com', name: 'A' },
    { email: 'b@example.com', name: 'B' },
  ],
  skipDuplicates: true,
})
```

### 6.2 Read

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'zhangsan@example.com' },
})

const firstActiveUser = await prisma.user.findFirst({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' },
})

const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    OR: [
      { name: { contains: '张' } },
      { email: { endsWith: '@example.com' } },
    ],
  },
  select: {
    id: true,
    email: true,
    posts: {
      select: { id: true, title: true },
      where: { published: true },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
})
```

`select` 和 `include` 的区别：

- `select`：只返回指定字段，适合减少数据传输。
- `include`：返回模型默认字段，同时带上关系数据。
- 同一层通常不要混用 `select` 和 `include`，需要精确结构时优先用 `select`。

### 6.3 Update

```typescript
const updated = await prisma.user.update({
  where: { email: 'zhangsan@example.com' },
  data: {
    name: '张三丰',
    age: { increment: 1 },
  },
})
```

批量更新：

```typescript
await prisma.user.updateMany({
  where: { isActive: false },
  data: { name: null },
})
```

Upsert：

```typescript
const user = await prisma.user.upsert({
  where: { email: 'new@example.com' },
  create: { email: 'new@example.com', name: 'New User' },
  update: { name: 'Updated User' },
})
```

### 6.4 Delete

```typescript
await prisma.post.delete({
  where: { id: 'post_1' },
})

await prisma.post.deleteMany({
  where: { published: false },
})
```

删除是否级联取决于关系上的 `onDelete` 和数据库约束。

### 6.5 常用过滤操作符

| 操作符 | 示例 |
| --- | --- |
| `equals` | `{ email: { equals: 'a@example.com' } }` |
| `not` | `{ age: { not: 18 } }` |
| `in` / `notIn` | `{ role: { in: ['USER', 'ADMIN'] } }` |
| `lt` / `lte` / `gt` / `gte` | `{ age: { gte: 18 } }` |
| `contains` | `{ name: { contains: '张' } }` |
| `startsWith` / `endsWith` | `{ email: { endsWith: '@example.com' } }` |
| `AND` / `OR` / `NOT` | `{ OR: [{ age: null }, { age: { gte: 18 } }] }` |
| 关系过滤 `some` | `{ posts: { some: { published: true } } }` |
| 关系过滤 `every` | `{ posts: { every: { published: true } } }` |
| 关系过滤 `none` | `{ posts: { none: { published: true } } }` |

---

## 7. 分页、排序、聚合

### 7.1 Offset 分页

```typescript
const page = 2
const pageSize = 20

const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
})
```

适合后台小数据列表；页数越深性能越差。

### 7.2 Cursor 分页

```typescript
const items = await prisma.post.findMany({
  take: 21,
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
  orderBy: { id: 'asc' },
})

const hasMore = items.length > 20
const pageItems = hasMore ? items.slice(0, 20) : items
const nextCursor = hasMore ? pageItems.at(-1)!.id : null
```

适合无限滚动、时间线、公开列表。

### 7.3 聚合

```typescript
const result = await prisma.user.aggregate({
  where: { isActive: true },
  _count: { id: true },
  _avg: { age: true },
  _min: { age: true },
  _max: { age: true },
})
```

### 7.4 分组

```typescript
const stats = await prisma.post.groupBy({
  by: ['published'],
  _count: { id: true },
  orderBy: { published: 'desc' },
})
```

---

## 8. 迁移系统

### 8.1 开发环境

```bash
npx prisma migrate dev --name init
```

它会：

- 比较 `schema.prisma` 和迁移历史。
- 生成 SQL 文件到 `prisma/migrations`。
- 应用迁移到开发数据库。
- 生成新的 Prisma Client。

### 8.2 生产环境

```bash
npx prisma migrate deploy
npx prisma generate
```

生产环境不要使用 `migrate dev`，因为它面向交互式开发，并可能触发重置提示。

### 8.3 快速同步：`db push`

```bash
npx prisma db push
```

`db push` 直接把 Schema 推到数据库，不生成迁移文件。适合原型阶段、测试数据库、临时 Demo；正式项目应尽快切回 `migrate dev`。

### 8.4 从现有数据库生成 Schema

```bash
npx prisma db pull
npx prisma generate
```

适合接入遗留数据库。生成后建议整理命名、补充关系、索引、枚举和映射。

### 8.5 Seed

```typescript
// prisma/seed.ts
import { prisma } from '../src/lib/prisma'

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: { email: 'admin@example.com', name: 'Admin' },
    update: {},
  })
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
```

`package.json`：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

运行：

```bash
npx prisma db seed
```

---

## 9. 事务与并发

### 9.1 批量事务

```typescript
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: userId } }),
  prisma.user.delete({ where: { id: userId } }),
])
```

适合多个相互独立的 Prisma 操作。

### 9.2 交互式事务

```typescript
const order = await prisma.$transaction(async (tx) => {
  const product = await tx.product.findUniqueOrThrow({
    where: { id: productId },
  })

  if (product.stock <= 0) {
    throw new Error('库存不足')
  }

  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: 1 } },
  })

  return tx.order.create({
    data: {
      productId,
      userId,
      quantity: 1,
    },
  })
}, {
  maxWait: 5000,
  timeout: 10000,
})
```

注意：

- 事务里不要执行慢网络请求。
- 事务范围越短越好。
- 出错抛异常会自动回滚。

---

## 10. 原始 SQL

### 10.1 安全查询

```typescript
const users = await prisma.$queryRaw<
  { id: string; email: string }[]
>`SELECT id, email FROM users WHERE email LIKE ${'%@example.com'}`
```

模板字符串形式会参数化插值，避免 SQL 注入。

### 10.2 执行 SQL

```typescript
await prisma.$executeRaw`
  UPDATE users SET "updatedAt" = NOW() WHERE "isActive" = false
`
```

### 10.3 Unsafe 只用于受控场景

```typescript
const table = 'users'
const rows = await prisma.$queryRawUnsafe(`SELECT * FROM ${table}`)
```

`$queryRawUnsafe` 不能接收用户输入拼接出来的 SQL。

---

## 11. 错误处理

```typescript
import { Prisma } from '@/generated/prisma/client'

try {
  await prisma.user.create({
    data: { email: 'taken@example.com' },
  })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('唯一约束冲突')
    }
    if (error.code === 'P2025') {
      throw new Error('记录不存在')
    }
  }

  throw error
}
```

常见错误码：

| 错误码 | 含义 |
| --- | --- |
| `P2002` | 唯一约束冲突 |
| `P2003` | 外键约束失败 |
| `P2011` | 必填字段为 null |
| `P2025` | 需要的记录不存在 |

---

## 12. 架构实践

### 12.1 推荐目录

```text
src/
├─ generated/
│  └─ prisma/
├─ lib/
│  └─ prisma.ts
├─ repositories/
│  └─ user.repository.ts
├─ services/
│  └─ user.service.ts
├─ server/
│  └─ routers/
└─ validators/
   └─ user.schema.ts
```

### 12.2 Repository 层

```typescript
// src/repositories/user.repository.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  },
}
```

### 12.3 Service 层

```typescript
// src/services/user.service.ts
import { userRepository } from '@/repositories/user.repository'

export async function registerUser(input: {
  email: string
  name?: string
}) {
  const existing = await userRepository.findByEmail(input.email)

  if (existing) {
    throw new Error('该邮箱已注册')
  }

  return userRepository.create(input)
}
```

原则：

- Prisma Client 负责数据访问，不要把所有业务规则塞进路由。
- Service 处理业务规则，Repository 封装可复用查询。
- 简单项目可以省略 Repository，但不要省略输入验证和错误处理。

---

## 13. 性能与安全

### 13.1 少拿字段

```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
})
```

不要把 `passwordHash`、内部备注等敏感字段直接 `include` 给前端。

### 13.2 给查询条件加索引

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([authorId, createdAt])
  @@index([published, createdAt])
}
```

### 13.3 避免 N+1

```typescript
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
})
```

在 GraphQL / tRPC 场景中，优先批量查询、关系查询，或使用 dataloader 模式。

### 13.4 软删除

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  deletedAt DateTime?

  @@index([deletedAt])
}
```

```typescript
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() },
})

const activeUsers = await prisma.user.findMany({
  where: { deletedAt: null },
})
```

不要用 `@@ignore` 实现软删除；`@@ignore` 是让 Prisma Client 忽略整个模型。

---

## 14. 和 tRPC / Next.js 集成

### 14.1 tRPC Context 注入 Prisma

```typescript
// src/server/context.ts
import { prisma } from '@/lib/prisma'

export async function createContext() {
  return {
    prisma,
    user: null,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

```typescript
// src/server/trpc.ts
import { initTRPC } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
```

```typescript
// src/server/routers/user.ts
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: { id: true, email: true, name: true },
    })
  }),

  create: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1).optional(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({ data: input })
    }),
})
```

---

## 15. 学习路线

1. 先用 SQLite 或本地 PostgreSQL 跑通 `init -> schema -> migrate -> generate -> CRUD`。
2. 学会模型字段、索引、唯一约束和表字段映射。
3. 重点练一对多、一对一、多对多、自引用关系。
4. 熟悉 `select`、`include`、过滤、排序、分页、聚合。
5. 掌握迁移纪律：开发用 `migrate dev`，生产用 `migrate deploy`。
6. 学事务、错误处理、原始 SQL、性能优化。
7. 在 Next.js / tRPC 中把 Prisma 放进服务端 Context，而不是从客户端直接访问。

---

## 16. 常见问题

### Q1：修改 Schema 后为什么 TS 没有新字段提示？

运行：

```bash
npx prisma generate
```

如果改了数据库结构，还需要：

```bash
npx prisma migrate dev --name change_name
```

### Q2：开发环境连接数暴涨怎么办？

使用全局单例 Prisma Client。Next.js 开发热更新时尤其重要。

### Q3：什么时候用 `db push`？

原型、Demo、测试数据库可以用。正式项目要用迁移文件记录数据库结构演进。

### Q4：Prisma 可以完全替代 SQL 吗？

不能。Prisma 覆盖绝大多数业务 CRUD，但复杂报表、性能关键查询、数据库特定能力仍可能需要 `$queryRaw`。

### Q5：要不要在前端导入 Prisma Client？

不要。Prisma Client 只能在服务端使用。前端应通过 API、tRPC、Server Action 等方式访问数据。

---

## 17. 官方参考

- [Prisma ORM 文档](https://www.prisma.io/docs/orm)
- [Prisma Client API](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma 7 升级指南](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)

---

*更新时间：2026-05-19*
