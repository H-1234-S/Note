# Supavolt

Supavolt 是一套面向 Web 应用开发的 **Backend-as-a-Service（BaaS）** 平台。开发者通过控制台创建组织与项目后，即可获得隔离的 PostgreSQL 模式空间、可视化表结构管理、自动生成的 REST 数据接口、SQL 编辑器、基于 PostgreSQL 通知与 WebSocket 的实时订阅、对象存储，以及面向终端用户的项目级认证能力；同时提供官方 JavaScript SDK，便于在前端或 Node 环境中集成。

本项目采用 **pnpm monorepo** 组织代码，前后端分离、类型与常量跨包共享，适合作为全栈工程实践与毕业设计载体。

## 功能概览

| 模块 | 说明 |
| --- | --- |
| 平台账号 | 邮箱注册/登录、JWT + HttpOnly Cookie、Google/GitHub OAuth |
| 组织与成员 | 多租户组织、角色（admin / developer）、邮件邀请 |
| 项目 | 每项目独立 PostgreSQL Schema、`anon` / `service_role` 项目密钥 |
| 表编辑器 | 可视化建表、增删列，支持常见 PostgreSQL 列类型与外键 |
| 数据 API | 基于项目密钥的 REST 接口，支持筛选、排序、分页等查询参数 |
| SQL 编辑器 | Monaco 编辑器、执行历史，拦截高危语句 |
| Realtime | 表级触发器 + `pg_notify`，经 Socket.IO 推送到客户端 |
| Storage | 存储桶（公开/私有），文件托管于 UploadThing |
| 项目 Auth | 终端用户注册/登录、Magic Link、项目级 OAuth 配置 |
| JavaScript SDK | `@supavolt/supavolt-js`：db / auth / storage / realtime 客户端 |

## 技术栈

- **Monorepo**：pnpm workspace
- **前端**：Next.js 16、React 19、Tailwind CSS 4、Radix UI、TanStack Table、Monaco Editor
- **后端**：NestJS 11、class-validator、Socket.IO
- **数据库**：PostgreSQL、Drizzle ORM / Drizzle Kit 迁移
- **其他**：Resend（邮件）、UploadThing（对象存储）、bcrypt、JWT

## 仓库结构

```
supavolt/
├── apps/
│   ├── api/          # NestJS 后端，全局前缀 /api
│   └── web/          # Next.js 管理控制台与用户界面
├── packages/
│   ├── constants/    # 跨应用常量（角色、Cookie 键、列类型等）
│   ├── types/        # 共享 TypeScript 类型定义
│   └── supavolt-js/  # 官方 JavaScript 客户端库
├── package.json      # 根脚本：并行启动 api + web
└── pnpm-workspace.yaml
```

## 环境要求

- Node.js 20+
- pnpm 9+
- 可访问的 PostgreSQL 实例（本地或 Neon 等托管服务）
- （可选）Resend、UploadThing、Google/GitHub OAuth 凭据

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在 `apps/api` 下创建 `.env`（变量名以代码中 `ConfigService` 引用为准），典型配置包括：

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | 平台元数据与项目 Schema 共用的 PostgreSQL 连接串 |
| `REALTIME_DATABASE_URL` | （可选）Realtime 监听连接，默认可与 `DATABASE_URL` 相同 |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | 平台用户 JWT |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | 令牌有效期 |
| `PROJECT_JWT_SECRET` | 项目 anon / service_role 密钥签名 |
| `INVITE_SECRET` | 组织邀请链接令牌 |
| `API_URL` | 对外 API 根地址（如 `http://localhost:3000/api`） |
| `WEB_URL` | 前端地址（如 `http://localhost:3001`），用于 CORS 与 OAuth 回调跳转 |
| `PORT` | API 端口，默认 `3000` |
| `RESEND_API_KEY` | 邀请与 Magic Link 邮件 |
| `GOOGLE_*` / `GITHUB_*` | 平台 OAuth（可选） |
| UploadThing 相关 | 对象存储（按 UploadThing 文档配置） |

在 `apps/web` 下创建 `.env.local`，例如：

| 变量 | 用途 |
| --- | --- |
| `API_URL` | 服务端请求后端（如 `http://localhost:3000/api`） |
| `NEXT_PUBLIC_API_URL` | 浏览器端 API 地址 |
| `NEXT_PUBLIC_WEB_URL` | 浏览器端站点地址 |
| `JWT_ACCESS_SECRET` | 与后端一致，用于 Edge/中间件校验 Cookie 中的 access token |

### 3. 数据库迁移

```bash
pnpm --filter api run db:migrate
# 或开发阶段：pnpm --filter api run db:push
```

### 4. 启动开发服务

```bash
# 根目录：同时启动 API（:3000）与 Web（:3001）
pnpm dev

# 或分别启动
pnpm dev:api
pnpm dev:web
```

- 控制台：<http://localhost:3001>
- API：<http://localhost:3000/api>

## 主要 API 与路由说明

- **平台认证**：`/api/auth/*`（注册、登录、刷新、OAuth、邀请接受等）
- **组织 / 项目 / 成员**：`/api/orgs/*`（需平台 JWT）
- **表编辑器、SQL、Storage、项目 Auth 配置**：`/api/orgs/:orgSlug/projects/:projectSlug/*`
- **项目 REST 数据面**：`/api/projects/:projectSlug/rest/:table`（请求头携带项目 API Key）
- **Realtime**：WebSocket（Socket.IO），连接时校验项目密钥

Web 控制台路由示例：

- `/dashboard` — 工作台
- `/organizations` — 组织列表与创建
- `/organizations/[slug]/projects` — 项目列表
- `/organizations/[slug]/[projectSlug]/database` — 表编辑器
- `/organizations/[slug]/[projectSlug]/sql` — SQL 编辑器
- `/organizations/[slug]/[projectSlug]/api` — 自动 API 文档
- `/organizations/[slug]/[projectSlug]/realtime` — Realtime 调试
- `/organizations/[slug]/[projectSlug]/storage` — 存储桶与文件
- `/organizations/[slug]/[projectSlug]/auth/*` — 项目终端用户认证配置

## JavaScript SDK

包路径：`packages/supavolt-js`。

```typescript
import { createClient } from '@supavolt/supavolt-js';

const supavolt = createClient(projectUrl, anonKey);

const { data } = await supavolt.from('posts').select('*').limit(10);
```

SDK 提供链式查询构建器、Auth、Storage 与 Realtime 订阅；可在 `packages/supavolt-js/demo` 中查看演示页面。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 并行启动 api + web |
| `pnpm --filter api run build` | 编译 NestJS |
| `pnpm --filter web run build` | 构建 Next.js |
| `pnpm --filter api run test` | API 单元测试 |
| `pnpm --filter api run db:studio` | Drizzle Studio |

## 架构要点

1. **多租户**：平台库表存储用户、组织、项目元数据；每个项目创建独立 PostgreSQL Schema，实现逻辑隔离。
2. **双密钥模型**：`anon` 密钥只读 REST；写操作需 `service_role` 密钥，降低前端泄露风险。
3. **Realtime**：在业务表上安装触发器，通过 `pg_notify` 发布变更，后端订阅后经 Socket.IO 广播。
4. **类型共享**：`@supavolt/types` 与 `@supavolt/constants` 保证前后端与 SDK 契约一致。

## 许可证

各子包许可证见对应 `package.json`；平台 API 当前为 `UNLICENSED`（私有项目）。

## 相关文档

- [NestJS 文档](https://docs.nestjs.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
