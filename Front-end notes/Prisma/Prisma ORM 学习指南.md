## 1. Prisma 简介

### 1.1 什么是 Prisma

Prisma 是一个现代化的 **开源 ORM (对象关系映射)** 工具，用于 Node.js 和 TypeScript。它提供了一种类型安全的方式来访问数据库。

**官网**: https://www.prisma.io

**GitHub**: https://github.com/prisma/prisma

### 1.2 Prisma 的组成

```
┌─────────────────────────────────────────────────────┐
│                    Prisma 工具栈                     │
├─────────────────────────────────────────────────────┤
│  Prisma CLI      │ 命令行工具,管理数据库迁移和生成      │
├─────────────────────────────────────────────────────┤
│  Prisma Client   │ 类型安全的数据库客户端              │
├─────────────────────────────────────────────────────┤
│  Prisma Studio   │ 数据库可视化管理界面                │
└─────────────────────────────────────────────────────┘
```

### 1.3 支持的数据库

| 数据库 | 状态 |
|--------|------|
| PostgreSQL | 稳定 |
| MySQL | 稳定 |
| SQLite | 稳定 |
| MongoDB | 预览 |
| SQL Server | 预览 |
| CockroachDB | 预览 |

### 1.4 Prisma vs 其他 ORM

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    特性       │   Prisma    │    TypeORM   │    Drizzle   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│   类型安全    │    ✅        │    ⚠️        │    ✅       │
│   学习曲线    │    平滑      │    陡峭      │    平滑        │
│   迁移系统    │    内置      │    内置      │    内置        │
│   查询性能    │    良好      │    良好      │    优秀        │
│   Studio     │    ✅        │    ❌        │    ❌       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 2. 核心概念

### 2.1 三驾马车

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Schema.prisma│◄──►│   Prisma    │◄──►│  Database   │
│  定义数据模型 │    │   Client   │    │   数据库     │
└─────────────┘    └─────────────┘    └─────────────┘
```

1. **Prisma Schema** - 定义数据模型和数据库连接

2. **Prisma Client** - 自动生成的类型安全客户端

3. **Database** - 实际的数据库

### 2.2 工作流程

```
1. 编写 schema.prisma
        ↓
2. 运行 prisma generate (生成 Client)
        ↓
3. 使用 Client 查询数据库
        ↓
4. 运行 prisma db push / migrate 同步数据库
```

---

## 3. 安装与配置

### 3.1 初始化项目

```bash
# 创建项目
mkdir my-prisma-project

cd my-prisma-project

npm init -y

# 安装 Prisma CLI (开发依赖)
npm install prisma --save-dev

# 安装 Prisma Client
npm install @prisma/client
```

### 3.2 初始化 Prisma

```bash
# 初始化,创建 prisma/schema.prisma
npx prisma init
```

### 3.3 配置数据库连接

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // 或 mysql, sqlite, mongodb 等
  url      = env("DATABASE_URL")
}
```

### 3.4 环境变量

```env
# .env 文件
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

---

## 4. 数据模型定义

### 4.1 基本字段类型

```prisma
model User {
  id        String   @id @default(uuid())      // 字符串主键
  id        Int      @id @default(autoincrement()) // 整数主键
  name      String                           // 必填字符串
  email     String?                          // 可选字符串
  age       Int?                             // 可选整数
  balance   Decimal @db.Decimal(10, 2)       // 精确小数
  createdAt DateTime @default(now())        // 默认时间戳
  updatedAt DateTime @updatedAt              // 自动更新时间戳
  isActive  Boolean @default(true)           // 布尔默认值
  bio       String? @db.VarChar(500)         // MySQL VarChar
}
```

### 4.2 字段修饰符

| 修饰符               | 说明      | 示例                                   |
| ----------------- | ------- | ------------------------------------ |
| `?`               | 可选字段    | `name String?`                       |
| `[]`              | 数组字段    | `tags String[]`                      |
| `@default()`      | 默认值     | `@default(true)`                     |
| `@id`             | 主键      | `id String @id`                      |
| `@unique`         | 唯一约束    | `email String @unique`               |
| `@updatedAt`      | 自动更新    | `updatedAt DateTime @updatedAt`      |
| `@default(now())` | 默认当前时间  | `createdAt DateTime @default(now())` |
| `@db.X`           | 数据库特定类型 | `@db.VarChar(255)`                   |

### 4.3 标量类型映射

| Prisma | PostgreSQL | MySQL | SQLite |
|--------|------------|-------|--------|
| String | text | varchar(191) | text |
| Int | integer | int | integer |
| BigInt | bigint | bigint | integer |
| Float | double precision | double | real |
| Boolean | boolean | tinyint(1) | integer |
| DateTime | timestamp(3) | datetime(3) | datetime |
| Json | jsonb | json | text |
| Decimal | decimal(65,30) | decimal(65,30) | text |

---

## 5. 关系处理

### 5.1 一对多 (One-to-Many)

```prisma
// 用户和文章 - 一个用户有多篇文章
model User {
  id    String  @id @default(uuid())
  name  String
  posts Post[]  // 关系字段:一个用户有多篇帖子
}

model Post {
  id       String @id @default(uuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String // 外键
}
```

### 5.2 一对一 (One-to-One)

```prisma
model User {
  id        String  @id @default(uuid())
  name      String
  profile   Profile? // 一对一关系
}

model Profile {
  id     String @id @default(uuid())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique // 一对一需要唯一外键
}
```

### 5.3 多对多 (Many-to-Many)

**隐式多对多 (Prisma 自动管理中间表)**

```prisma
model Post {
  id    String   @id @default(uuid())
  title String
  tags  Tag[]
}

model Tag {
  id    String  @id @default(uuid())
  name  String  @unique
  posts Post[]
}
```

**显式多对多 (手动管理)**

```prisma
model Post {
  id       String         @id @default(uuid())
  title    String
  postTags PostTag[]
}

model Tag {
  id       String    @id @default(uuid())
  name     String    @unique
  postTags PostTag[]
}

model PostTag {
  post   Post   @relation(fields: [postId], references: [id])
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id])
  tagId  String

  @@id([postId, tagId]) // 复合主键
}
```

### 5.4 自引用关系

```prisma
// 评论可以回复其他评论
model Comment {
  id        String    @id @default(uuid())
  content   String
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
}
```

### 5.5 关系字段修饰符

```prisma
model User {
  posts Post[] // 无修饰符:一对多
  // posts Post? // ? : 必选关系(每篇帖子必须有一个作者)
  // posts Post! // ! : 非空关系
}
```

---

## 6. Prisma Client 查询

### 6.1 初始化 Client

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
```

### 6.2 基本 CRUD

```typescript
import prisma from './lib/prisma'

// ============ CREATE (创建) ============

// 创建单条记录
const user = await prisma.user.create({
  data: {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25
  }
})

// 批量创建
const users = await prisma.user.createMany({
  data: [
    { name: '张三', email: 'zhangsan@example.com' },
    { name: '李四', email: 'lisi@example.com' }
  ]
})

// ============ READ (读取) ============

// 查询单条
const user = await prisma.user.findUnique({
  where: { id: 1 }  // 或 { email: 'zhangsan@example.com' }
})

// 查询多条
const users = await prisma.user.findMany({
  where: { age: { gte: 18 } },  // age >= 18
  orderBy: { createdAt: 'desc' },
  take: 10,  // 限制10条
  skip: 0    // 跳过0条
})

// 条件查询
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: { contains: '张' } },      // 包含"张"
      { email: { endsWith: '@example.com' } }  // 以@example.com结尾
    ],
    age: { in: [18, 20, 25] }  // IN 查询
  }
})

// ============ UPDATE (更新) ============

// 更新单条
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: '新名字' }
})

// 批量更新
await prisma.user.updateMany({
  where: { age: { lt: 18 } },
  data: { isActive: false }
})

// ============ DELETE (删除) ============

// 删除单条
await prisma.user.delete({ where: { id: 1 } })

// 批量删除
await prisma.user.deleteMany({ where: { isActive: false } })
```

### 6.3 关系查询

```typescript
// 包含关联数据 (JOIN)
const users = await prisma.user.findMany({
  include: {
    posts: true  // 包含用户的所有文章
  }
})

// 只查询关系数据
const posts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      select: { title: true }
    }
  }
})

// 嵌套写入 (创建用户时同时创建文章)
const user = await prisma.user.create({
  data: {
    name: '张三',
    posts: {
      create: { title: '我的第一篇文章' }
    }
  }
})
```

### 6.4 聚合查询

```typescript
// 计数
const count = await prisma.user.count({ where: { age: { gte: 18 } } })

// 分组计数
const result = await prisma.post.groupBy({
  by: ['published'],
  _count: { id: true }
})

// 聚合
const result = await prisma.user.aggregate({
  _avg: { age: true },
  _sum: { age: true },
  _min: { age: true },
  _max: { age: true }
})
```

### 6.5 分页查询

```typescript
// 基于游标的分页 (推荐)
const page1 = await prisma.post.findMany({
  take: 10,
  cursor: { id: lastId },
  skip: 1
})

// 基于偏移的分页
const page = await prisma.post.findMany({
  take: 10,
  skip: (pageNumber - 1) * 10
})
```

### 6.6 过滤条件操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `equals` | 等于 | `email: { equals: 'test@example.com' }` |
| `not` | 不等于 | `age: { not: 18 }` |
| `in` | 在列表中 | `name: { in: ['张三', '李四'] }` |
| `notIn` | 不在列表中 | `age: { notIn: [18, 20] }` |
| `lt` | 小于 | `age: { lt: 18 }` |
| `lte` | 小于等于 | `age: { lte: 18 }` |
| `gt` | 大于 | `age: { gt: 18 }` |
| `gte` | 大于等于 | `age: { gte: 18 }` |
| `contains` | 包含 | `name: { contains: '张' }` |
| `startsWith` | 以...开头 | `email: { startsWith: 'admin' }` |
| `endsWith` | 以...结尾 | `email: { endsWith: '@example.com' }` |
| `AND` | 逻辑与 | `AND: [{ age: { gte: 18 } }, { isActive: true }]` |
| `OR` | 逻辑或 | `OR: [{ name: '张三' }, { name: '李四' }]` |
| `NOT` | 逻辑非 | `NOT: [{ age: { lt: 18 } }]` |

---

## 7. 迁移系统

### 7.1 迁移命令

```bash
# 创建迁移 (开发环境推荐)
npx prisma migrate dev --name add_user_table

# 创建迁移 (生产环境)
npx prisma migrate deploy

# 重置数据库 (危险!)
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status

# 移除迁移文件但不删除数据库
npx prisma migrate resolve --rolled-back add_user_table
```

### 7.2 db push (开发快速同步)

```bash
# 直接同步 schema 到数据库 (不创建迁移文件,用于开发)
npx prisma db push

# 生产环境
npx prisma db push --accept-data-loss
```

### 7.3 迁移文件结构

```
prisma/
├── migrations/
│   └── 20240101000000_add_user_table/
│       ├── migration.sql
│       └── README.md
└── schema.prisma
```

---

## 8. 高级特性

### 8.1 事务

```typescript
// 方式1: 使用 $transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: '张三', email: 'zhangsan@example.com' }
  })
  await tx.post.create({
    data: { title: '第一篇文章', authorId: user.id }
  })
  return user
})

// 方式2: 交互式事务 (支持回滚点)
const result = await prisma.$transaction(async (tx) => {
  // 业务逻辑
  throw new Error('回滚')  // 自动回滚所有操作
}, {
  maxWait: 5000,    // 最大等待时间
  timeout: 10000    // 事务超时
})
```

### 8.2 原始 SQL 查询

```typescript
// 原始 SELECT
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE age > ${18}
`

// 原始 INSERT
await prisma.$executeRaw`
  INSERT INTO users (name, email) VALUES ('张三', 'zhangsan@example.com')
`

// 安全的原始查询 (防止 SQL 注入)
const users = await prisma.$queryRawUnsafe(
  'SELECT * FROM users WHERE age > $1',
  [18]
)
```

### 8.3 软删除

```typescript
model User {
  id        String   @id @default(uuid())
  name      String
  deletedAt DateTime?  // 软删除字段

  @@ignore  // 迁移时忽略,但 Client 可用
}

// 查询时自动过滤已删除
prisma.user.findMany({
  where: { deletedAt: null }
})
```

### 8.4 原始字段和计算字段

```typescript
model User {
  id        String @id @default(uuid())
  fullName  String @map("full_name")  // 数据库字段名
  email     String @unique

  @@map("users")  // 数据库表名
}

// 使用 raw 查询获取计算字段
const result = await prisma.$queryRaw`
  SELECT id, full_name as "fullName", age, age * 2 as "doubleAge"
  FROM users
`
```

### 8.5 错误处理

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

try {
  await prisma.user.create({ data: { email: 'duplicate@example.com' } })
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      console.log('唯一约束冲突:', error.meta)
    }
    if (error.code === 'P2025') {
      console.log('记录不存在')
    }
  }
}
```

### 8.6 常见错误码

| 错误码 | 说明 |
|--------|------|
| P2001 | 找不到记录 |
| P2002 | 唯一约束冲突 |
| P2003 | 外键约束失败 |
| P2025 | 记录不存在 (findUnique/findFirst) |
| P2009 | 查询验证失败 |
| P2011 | 必填字段为空 |
| P2012 | 缺少必填字段 |

### 8.7 连接管理

```typescript
// 全局单例模式
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 断开连接
await prisma.$disconnect()

// 健康检查
const isConnected = await prisma.$connect()
```

### 8.8 中间件

```typescript
prisma.$use(async (params, next) => {
  console.log('查询:', params.model, params.action)
  const result = await next(params)
  console.log('结果:', result)
  return result
})
```

---

## 9. 实战项目结构

### 9.1 推荐的目录结构

```
my-project/
├── prisma/
│   ├── schema.prisma      # 数据模型定义
│   ├── migrations/        # 迁移文件
│   └── seed.ts           # 数据库种子数据
├── src/
│   ├── lib/
│   │   └── prisma.ts     # Prisma Client 单例
│   ├── repositories/     # 数据访问层
│   │   └── userRepository.ts
│   ├── services/         # 业务逻辑层
│   │   └── userService.ts
│   ├── routes/           # API 路由
│   │   └── user.ts
│   └── index.ts          # 入口文件
├── .env
└── package.json
```

### 9.2 完整示例

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error']  // 日志级别
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

```typescript
// src/repositories/userRepository.ts
import { prisma } from '../lib/prisma'
import { User, Prisma } from '@prisma/client'

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }

  async findAll(params: {
    skip?: number
    take?: number
    where?: Prisma.UserWhereInput
  }): Promise<User[]> {
    return prisma.user.findMany(params)
  }
}

export const userRepository = new UserRepository()
```

```typescript
// src/services/userService.ts
import { userRepository } from '../repositories/userRepository'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

export class UserService {
  async createUser(data: { name: string; email: string; age?: number }) {
    try {
      const existingUser = await userRepository.findByEmail(data.email)
      if (existingUser) {
        throw new Error('该邮箱已被注册')
      }
      return await userRepository.create(data)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('该邮箱已被注册')
      }
      throw error
    }
  }
}

export const userService = new UserService()
```

### 9.3 Prisma Studio

```bash
# 启动 Prisma Studio
npx prisma studio

# 在指定端口
npx prisma studio --port 5555
```

---

## 10. 常见问题

### Q1: Prisma Client 每次都要实例化吗?

**A**: 推荐使用单例模式,避免连接池耗尽。

```typescript
// 错误
const prisma = new PrismaClient()

// 推荐
const prisma = new PrismaClient()
export default prisma
```

### Q2: 如何处理时区问题?

**A**: Prisma 默认使用 UTC,可在 schema 中配置。

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Q3: 如何查看生成的 SQL?

**A**: 开启日志。

```typescript
const prisma = new PrismaClient({
  log: ['query']
})
```

### Q4: 生产环境使用哪个命令?

**A**: 使用 `prisma migrate deploy`。

```bash
# 生产环境
npx prisma migrate deploy
npx prisma generate
```

### Q5: 如何优化查询性能?

**A**:
1. 使用 `select` 限制返回字段
2. 使用游标分页代替偏移分页
3. 添加数据库索引
4. 使用 `include` 时注意 N+1 问题

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique  // 自动添加索引
}
```

### Q6: Prisma 支持原生 SQL 吗?

**A**: 支持。

```typescript
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
```

### Q7: 如何做数据验证?

**A**: 结合 Zod 使用。

```typescript
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

const validated = UserSchema.parse(userInput)
await prisma.user.create({ data: validated })
```

---

## 学习路径推荐

```
第一阶段: 入门 (1-2天)
  ├── 安装配置 Prisma
  ├── 定义简单数据模型
  └── 掌握基本 CRUD

第二阶段: 进阶 (3-5天)
  ├── 关系模型 (一对多、一对一、多对多)
  ├── 复杂查询 (过滤、排序、分页)
  └── 迁移系统

第三阶段: 高级 (5-7天)
  ├── 事务处理
  ├── 原始 SQL
  ├── 性能优化
  └── 错误处理

第四阶段: 实战 (持续)
  ├── 构建完整项目
  ├── 集成到现有项目
  └── 深入源码理解
```

---

## 参考资源

- 官方文档: https://www.prisma.io/docs
- GitHub: https://github.com/prisma/prisma
- Prisma Studio: https://github.com/prisma/studio
- 示例项目: https://github.com/prisma/prisma-examples

---

*文档整理时间: 2026-04-19*
