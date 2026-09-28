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
