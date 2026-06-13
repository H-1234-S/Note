# Change: ep2-02-project-list-detail-api

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-02-project-list-detail-api` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~500 LOC） |
| **预估工期** | 1.5 天 |
| **前置 Change** | `ep2-01-project-create-api`（project service 基础 + project router 骨架） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |

---

## Goal

实现 `project.list`（分页+按状态筛选）和 `project.getById`（含关联 GenerationJob、StoryboardVersion、Scene 详情）两个 tRPC query 端点，为 Dashboard 和项目详情页提供数据。

---

## Scope

### ✅ 包含内容

1. **数据访问层 `project.repo.ts`（新建）**
   - `findProjectsPaginated()`：cursor-based 分页查询，仅返回当前用户的项目
   - `findProjectDetailById()`：查询 Project + 最近一次 GenerationJob + 当前 StoryboardVersion（含 Scene 列表）
   - 使用 Prisma `select` 精确控制字段返回，避免全表扫描

2. **业务层 `project.service.ts`（追加）**
   - `listProjects()`：调用 repo 分页查询，对业务调用方暴露标准化接口
   - `getProjectById()`：调用 repo 查询 → 权限校验（owner 或 admin）→ 返回详情
   - 新增错误类：`ProjectNotFoundError` / `ProjectAccessDeniedError`

3. **tRPC Router `project.ts`（追加）**
   - `project.list` query：`protectedProcedure`，Zod 入参校验（cursor、pageSize、status）
   - `project.getById` query：`protectedProcedure`，Zod 入参校验（projectId）
   - 错误映射：业务错误 → `TRPCError`（`NOT_FOUND` / `FORBIDDEN`）

4. **测试**
   - `project.repo` 单元测试（mock prisma）
   - `project.service` 追加测试（list / getById 业务逻辑 + 权限校验）
   - `project.router` 追加 tRPC 集成测试（createCaller）

### ❌ 不包含内容

- ❌ 前端 Dashboard 页面（`ep2-03`）
- ❌ 前端项目详情页（`ep2-04`）
- ❌ 删除/取消/重试 API（`ep2-05`）
- ❌ Asset 签名 URL 返回（`ep4-04` 才实现）
- ❌ Scene 静态预览图 URL（依赖 `ep5-07` renderStill）
- ❌ 全文搜索、模糊搜索
- ❌ admin 查看所有用户项目的特殊行为（admin 也按 userId 隔离列表；仅 getById 可跨用户查看）

---

## Files Likely Affected

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/lib/db/repositories/project.repo.ts` | **新建** | 项目查询的数据访问层，封装 Prisma select |
| `src/lib/db/repositories/__tests__/project.repo.test.ts` | **新建** | repo 层单元测试（mock Prisma） |
| `src/server/services/project.service.ts` | **修改** | 追加 `listProjects`、`getProjectById`、`ProjectNotFoundError`、`ProjectAccessDeniedError` |
| `src/server/routers/project.ts` | **修改** | 追加 `list`、`getById` query 端点 + Zod schema |
| `src/server/services/__tests__/project.service.test.ts` | **修改** | 追加 list/getById 业务逻辑 + 权限测试 |
| `src/server/routers/__tests__/project.router.test.ts` | **修改** | 追加 list/getById 集成测试 |

**预计新增文件：1 个，修改文件：5 个**

---

## Dependencies

```
ep2-01 (已完成)
├── project.service.ts（createProject + 错误类已存在）
├── project.ts router（createAndGenerate mutation 已注册）
├── _app.ts（projectRouter 已注册 + createCaller 已导出）
├── Prisma Schema（Project / GenerationJob / StoryboardVersion / Scene 表已建立）
└── tRPC context（ctx.userId / ctx.isAdmin 可用）
```

**前置 Change：`ep2-01-project-create-api`**（project router + service 骨架已就绪）

---

## Pre-flight Checklist（实现前确认）

在开始写业务代码之前，必须确认以下基线依赖就绪：

| 检查项 | 状态 | 验证方式 |
|--------|------|---------|
| project router 已注册 | ✅ | `_app.ts` 中 `project: projectRouter` |
| createCaller 已导出 | ✅ | `_app.ts` 导出 `createCaller` |
| Prisma client 可生成 | ✅ | `npx prisma generate` 通过 |
| vitest 已安装 | ✅ | ep2-01 Step 0 已完成 |
| `src/lib/db/repositories/` 目录 | ❌ 不存在 | 本 Change 新建 |
| `src/lib/db/client.ts` 导出 prisma | ✅ | `export { prisma }` |
| existing ep2-01 tests pass | 待验证 | `npm test` 通过 |

---

## Technical Design

### 0. 整体设计原则

本 Change 引入了一个新的分层模式——**数据访问层（repository）**，与 ep2-01 直接在 service 中内联 Prisma 的方式不同。

**原因：**
- ep2-01 的 `createProject` 是复杂的交互式事务（advisory lock → 额度 → 并发 → 写入），逻辑紧密耦合，内联 Prisma 是最可读的选择
- ep2-02 的 `listProjects` / `getProjectById` 是纯查询，涉及多表关联和 select 字段控制，适合抽到 repo 层
- `project.repo.ts` 封装 Prisma select 对象和类型转换，保持 service 层清爽
- 两个模式共存于同一个 service 文件，各自解决各自的问题

**后续演进：** 当 `quota.service.ts` 在 `ep7-02` 迁至 UsageRecord 时，可考虑同时将 `checkDailyQuota` 的 Prisma 查询也下沉到 repo。

### 1. 分页策略：Cursor-based

```
GET project.list?cursor=<lastId>&pageSize=12&status=completed
```

**为什么用 cursor 而非 offset：**
- offset 分页在数据变动时会出现"跳过重复"或"漏掉数据"的问题
- cursor 分页天然稳定：游标是上一页最后一条记录的 ID，下一页从该 ID 之后开始
- Prisma 原生支持 cursor pagination（`cursor: { id: lastId }, skip: 1`）

**实现细节：**
```typescript
// 多取一条判断 hasMore
const rows = await prisma.project.findMany({
  where: { userId, ...(status ? { status } : {}) },
  orderBy: { createdAt: "desc" },
  take: pageSize + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  select: LIST_SELECT,
});

const hasMore = rows.length > pageSize;
const items = (hasMore ? rows.slice(0, pageSize) : rows).map(toListItem);

return {
  items,
  nextCursor: hasMore ? items[items.length - 1].id : null,
  total, // 并行 count 查询
};
```

**cursor 字段选择：** 使用 `id`（主键，有唯一索引）。Prisma 要求 cursor 必须是唯一字段。`orderBy: { createdAt: "desc" }` 配合 `cursor: { id }` + `skip: 1` 是标准用法——id 作为唯一键满足 cursor 要求，排序由 createdAt 驱动。

**并行查询：** `findMany` 和 `count` 用 `Promise.all` 并行执行，减少延迟。

### 2. API 契约

#### 2.1 `project.list`

```
POST /api/trpc/project.list
Headers: Cookie (better-auth session)

Request Body:
{
  "cursor"?: string,      // 上一页最后一项的 id，首页不传
  "pageSize"?: number,    // 1-50，默认 12
  "status"?: string       // 按 project.status 筛选，不传则全部
}

Response 200:
{
  "items": [
    {
      "id": "cuid...",
      "title": "深入理解Transformer架构",
      "status": "completed",
      "aspectRatio": "16:9",
      "targetDurationSec": 120,
      "createdAt": "2026-06-13T08:00:00.000Z",
      "updatedAt": "2026-06-13T08:05:00.000Z",
      "currentJob": {                          // 最近一次 GenerationJob
        "id": "cuid...",
        "jobType": "storyboard",
        "status": "completed"
      } | null
    }
  ],
  "nextCursor": "cuid...",   // 下一页游标，null 表示已到末尾
  "total": 42                 // 符合条件的总数
}
```

**分页语义：**
- 游标 `cursor` 是上一页最后一项的 `id`，前端拿到 `nextCursor` 后作为下一页的 `cursor` 传入
- `total` 是当前筛选条件下的全部项目数，用于前端展示"共 N 个"
- 空列表返回 `{ items: [], nextCursor: null, total: 0 }`

#### 2.2 `project.getById`

```
POST /api/trpc/project.getById
Headers: Cookie (better-auth session)

Request Body:
{
  "projectId": "cuid..."   // 必填
}

Response 200:
{
  "id": "cuid...",
  "userId": "user_cuid...",
  "title": "深入理解Transformer架构",
  "sourceText": "Transformer是一种基于自注意力机制的...(完整原文)",
  "status": "storyboard_ready",
  "audienceRole": "student",
  "audienceLevel": "intermediate",
  "aspectRatio": "16:9",
  "targetDurationSec": 120,
  "voiceProvider": "minimax",
  "voiceId": "male-qn-qingse",
  "errorCode": null,
  "errorMessage": null,
  "createdAt": "2026-06-13T08:00:00.000Z",
  "updatedAt": "2026-06-13T08:03:00.000Z",
  "currentJob": {
    "id": "cuid...",
    "jobType": "storyboard",
    "status": "completed",
    "aiProvider": "deepseek",
    "aiModel": "deepseek-chat",
    "errorCode": null,
    "errorMessage": null,
    "startedAt": "2026-06-13T08:00:05.000Z",
    "completedAt": "2026-06-13T08:02:30.000Z",
    "createdAt": "2026-06-13T08:00:00.000Z"
  },
  "currentStoryboardVersion": {               // null 如果尚未生成
    "id": "cuid...",
    "versionNumber": 1,
    "totalDurationSec": 115.5,
    "scenes": [
      {
        "id": "cuid...",
        "order": 1,
        "narrationText": "Transformer架构彻底改变了...",
        "visualDescription": "Transformer模型架构图...",
        "emotionalTone": "专业严谨",
        "animationPreset": "fadeIn",
        "durationSec": 15.2,
        "startTimeSec": 0,
        "audioAssetId": "asset_cuid...",
        "imageAssetId": null
      }
    ]
  }
}
```

**`currentJob` 说明：**
- 取 `generationJobs` 中 `createdAt` 最新的一条
- 若项目刚创建、尚未执行任何 Job，为 `null`
- 后续 retry（`ep2-05`）会创建新 GenerationJob，`currentJob` 始终指向最新的一条

**`currentStoryboardVersion` 说明：**
- 通过 `Project.currentStoryboardVersionId` 外键关联
- 若 Storyboard 尚未生成，为 `null`
- Scene 按 `order` 升序排列

#### 2.3 错误响应

| 场景 | TRPCError code | message 格式 | HTTP 状态 |
|------|---------------|-------------|----------|
| 未登录 | `UNAUTHORIZED` | `Not authenticated` | 401 |
| 参数校验失败 | `BAD_REQUEST` | Zod issue（tRPC 自动处理） | 400 |
| 项目不存在 | `NOT_FOUND` | `[PROJECT_NOT_FOUND] 项目不存在 \| projectId: <id>` | 404 |
| 无权访问 | `FORBIDDEN` | `[PROJECT_ACCESS_DENIED] 无权访问该项目 \| projectId: <id>` | 403 |
| 内部错误 | `INTERNAL_SERVER_ERROR` | `<error.message>` | 500 |

### 3. 权限模型

| 端点 | 普通用户 | Admin |
|------|---------|-------|
| `project.list` | 仅返回自己的项目 | 仅返回自己的项目（与普通用户一致） |
| `project.getById` | 仅可查看自己的项目 | 可查看任意用户的项目（用于排查和支持） |

**设计理由：**
- `list` 的筛选维度是 `userId`，admin 不应在 Dashboard 看到全站用户的项目（无此需求）
- `getById` 放开 admin 权限，因为后续支持场景中 admin 可能需要排查特定项目的问题

### 4. Prisma Select 设计

**核心原则：精确 select，不 `include: { _all: true }`。**

#### 4.1 列表查询 select

```typescript
const LIST_SELECT = {
  id: true,
  title: true,
  status: true,
  aspectRatio: true,
  targetDurationSec: true,
  createdAt: true,
  updatedAt: true,
  generationJobs: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      jobType: true,
      status: true,
    },
  },
} satisfies Prisma.ProjectSelect;
```

**字段选择说明：**
- `title`：Dashboard 卡片标题
- `status`：状态 Badge 颜色和文案
- `aspectRatio`：卡片上可能显示比例图标
- `targetDurationSec`：卡片上显示目标时长
- `createdAt` / `updatedAt`：排序和"x 分钟前"文案
- `generationJobs[0]`：最新 Job 的状态（用于判断"生成中"/"已完成"等）
- **不返回** `sourceText`（列表不需要原文全文，省带宽）

#### 4.2 详情查询 select

```typescript
const DETAIL_SELECT = {
  id: true,
  userId: true,       // ← 权限校验必需
  title: true,
  sourceText: true,   // ← 详情展示全文
  status: true,
  audienceRole: true,
  audienceLevel: true,
  aspectRatio: true,
  targetDurationSec: true,
  voiceProvider: true,
  voiceId: true,
  errorCode: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
  generationJobs: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true, jobType: true, status: true,
      aiProvider: true, aiModel: true,
      errorCode: true, errorMessage: true,
      startedAt: true, completedAt: true, createdAt: true,
    },
  },
  currentStoryboardVersion: {
    select: {
      id: true, versionNumber: true, totalDurationSec: true,
      scenes: {
        orderBy: { order: "asc" as const },
        select: {
          id: true, order: true,
          narrationText: true, visualDescription: true,
          emotionalTone: true, animationPreset: true,
          durationSec: true, startTimeSec: true,
          audioAssetId: true, imageAssetId: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;
```

**权限字段：** `userId` 是 `DETAIL_SELECT` 中唯一不在响应中直接暴露给前端的字段——仅用于服务端 `project.userId !== ctx.userId && !ctx.isAdmin` 权限校验，校验通过后不在返回体中包含 `userId`。

> **关于 `satisfies Prisma.ProjectSelect`：** TypeScript 4.9+ 的 `satisfies` 运算符会在编译时校验对象字面量是否满足 `Prisma.ProjectSelect` 类型，但不改变其推断类型。这意味着 `Prisma.ProjectGetPayload<{ select: typeof LIST_SELECT }>` 能正确推导出返回行的类型。

### 5. 目录结构

```
src/lib/db/repositories/
└── project.repo.ts          ← 本 Change 新建

src/lib/db/
├── client.ts                ← 已有（export prisma）
├── errors.ts                ← 已有
├── index.ts                 ← 已有
└── transaction.ts           ← 已有
```

`repositories/` 是 `src/lib/db/` 下的新子目录，遵循"数据访问收敛在 `db/` 下"的组织原则。

### 6. 类型定义

```typescript
// === src/lib/db/repositories/project.repo.ts ===

export interface ListProjectsOptions {
  cursor?: string;
  pageSize?: number;    // 默认 12，最大 50
  status?: string;
}

export interface ProjectListItem {
  id: string;
  title: string;
  status: string;
  aspectRatio: string;
  targetDurationSec: number | null;
  createdAt: Date;
  updatedAt: Date;
  currentJob: {
    id: string;
    jobType: string;
    status: string;
  } | null;
}

export interface ProjectListResult {
  items: ProjectListItem[];
  nextCursor: string | null;
  total: number;
}

export interface ProjectDetailResult {
  id: string;
  userId: string;              // ← 仅服务端权限判断使用，不返回给前端
  title: string;
  sourceText: string;
  status: string;
  audienceRole: string | null;
  audienceLevel: string | null;
  aspectRatio: string;
  targetDurationSec: number | null;
  voiceProvider: string | null;
  voiceId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentJob: ProjectDetailJob | null;
  currentStoryboardVersion: ProjectDetailStoryboard | null;
}

export interface ProjectDetailJob {
  id: string;
  jobType: string;
  status: string;
  aiProvider: string;
  aiModel: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface ProjectDetailScene {
  id: string;
  order: number;
  narrationText: string;
  visualDescription: string;
  emotionalTone: string | null;
  animationPreset: string | null;
  durationSec: number | null;
  startTimeSec: number | null;
  audioAssetId: string | null;
  imageAssetId: string | null;
}

export interface ProjectDetailStoryboard {
  id: string;
  versionNumber: number;
  totalDurationSec: number | null;
  scenes: ProjectDetailScene[];
}

// === src/server/services/project.service.ts（追加） ===

export class ProjectNotFoundError extends Error {
  public readonly code = "PROJECT_NOT_FOUND";
  constructor(public readonly projectId: string) { ... }
}

export class ProjectAccessDeniedError extends Error {
  public readonly code = "PROJECT_ACCESS_DENIED";
  constructor(public readonly projectId: string) { ... }
}

// === src/server/routers/project.ts（追加） ===

// Zod input schema
export const listProjectsInputSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z.number().int().min(1).max(50).default(12),
  status: z.string().max(50).optional(),
});

export const getProjectByIdInputSchema = z.object({
  projectId: z.string().min(1, "projectId 不能为空"),
});
```

### 7. Zod v4 兼容性

本 Change 使用的 Zod API：

| API | v3 | v4 | 备注 |
|-----|-----|-----|------|
| `z.string()` | ✅ | ✅ | |
| `.min()` / `.max()` | ✅ | ✅ | |
| `.optional()` | ✅ | ✅ | |
| `.default()` | ✅ | ✅ | |
| `z.number().int()` | ✅ | ✅ | |
| `z.object({})` | ✅ | ✅ | |

全部 API 在 v4 中无变化，与 ep2-01 一致。

---

## Implementation Steps

### Step 1: 创建 `project.repo.ts` + 类型定义

- 创建 `src/lib/db/repositories/` 目录
- 创建 `src/lib/db/repositories/project.repo.ts`
- 定义所有输出类型接口（`ProjectListItem`, `ProjectListResult`, `ProjectDetailResult` 等）
- 实现 `LIST_SELECT` 和 `DETAIL_SELECT` 常量（`satisfies Prisma.ProjectSelect`）
- 实现 `toListItem()` 和 `toDetailResult()` 转换函数
- 实现 `findProjectsPaginated(userId, options)`：cursor 分页 + 并行 count
- 实现 `findProjectDetailById(projectId)`：`findUnique` + select

### Step 2: 追加 `project.service.ts`

- 新增 `ProjectNotFoundError` 和 `ProjectAccessDeniedError` 错误类（遵循 ep2-01 的模式：`extends Error` + `code` 属性）
- 实现 `listProjects(userId, options)`：直接委托 repo（当前无额外业务逻辑）
- 实现 `getProjectById(projectId, userId, isAdmin)`：
  - 调用 `findProjectDetailById`
  - `null` → `throw ProjectNotFoundError`
  - `project.userId !== userId && !isAdmin` → `throw ProjectAccessDeniedError`
  - 通过则返回

### Step 3: 追加 `project.router.ts`

- 新增 `listProjectsInputSchema` 和 `getProjectByIdInputSchema`
- 新增 `list: protectedProcedure.input(listProjectsInputSchema).query(...)`
- 新增 `getById: protectedProcedure.input(getProjectByIdInputSchema).query(...)`
- 错误映射：`ProjectNotFoundError` → `NOT_FOUND`，`ProjectAccessDeniedError` → `FORBIDDEN`

### Step 4: 编写测试

**4.1 `project.repo.test.ts`（新建）**

```
src/lib/db/repositories/__tests__/project.repo.test.ts
├── findProjectsPaginated
│   ├── 返回用户的项目列表（按 createdAt desc）
│   ├── 首页正确返回 items + nextCursor + total
│   ├── 末页 nextCursor 为 null
│   ├── 空结果返回 items=[], nextCursor=null, total=0
│   ├── status 筛选正确过滤
│   ├── pageSize 限制正确（默认 12，最大 50，最小 1）
│   └── cursor 分页：传入 cursor 后 skip 已返回项
└── findProjectDetailById
    ├── 存在时返回完整详情（含 currentJob + scenes）
    ├── 不存在的 projectId 返回 null
    └── 无 storyboard 时 currentStoryboardVersion 为 null
```

**4.2 `project.service.test.ts`（追加）**

```
（在现有 describe block 后追加）
├── listProjects
│   ├── 返回用户的项目列表
│   └── 委托 repo 层（参数透传验证）
└── getProjectById
    ├── owner 可查看自己的项目
    ├── admin 可查看他人的项目
    ├── 非 owner 非 admin 抛 ProjectAccessDeniedError
    └── 项目不存在抛 ProjectNotFoundError
```

**4.3 `project.router.test.ts`（追加）**

```
（在现有 describe block 后追加）
├── project.list
│   ├── 未认证返回 UNAUTHORIZED
│   ├── 正常返回分页列表
│   ├── 空列表返回空 items
│   ├── status 筛选正确传递
│   └── 无效 pageSize（>50）返回 BAD_REQUEST
└── project.getById
    ├── 未认证返回 UNAUTHORIZED
    ├── owner 可查看自己的项目
    ├── 非 owner 返回 FORBIDDEN
    ├── admin 可查看他人项目返回 200
    └── 不存在的 projectId 返回 NOT_FOUND
```

### Step 5: 集成验证

- `npm test` 全部通过
- `npm run lint` 无新增错误
- `npm run dev` 启动后 tRPC panel 可见 `project.list` 和 `project.getById`
- `project.createAndGenerate` 创建项目 → `project.list` 可见新项目
- `project.getById` 返回创建的项目详情
- 不同用户之间数据隔离验证

---

## Acceptance Criteria

### AC1: 列表—正常查询
**Given** 用户 A 有 3 个项目（2 个 completed，1 个 failed）
**When** 调用 `project.list` 不传筛选参数
**Then**
- 返回 `items.length = 3`，按 `createdAt` 降序排列
- 每项含 `id, title, status, aspectRatio, currentJob`
- `total = 3`，`nextCursor` 为第 3 项的 id（如果 pageSize=12 则 nextCursor=null）

### AC2: 列表—status 筛选
**Given** 用户 A 有 3 个项目（2 completed，1 failed）
**When** 调用 `project.list({ status: "failed" })`
**Then** 返回 `items.length = 1`，`total = 1`，该项 status=`failed`

### AC3: 列表—分页
**Given** 用户 A 有 25 个项目
**When** 调用 `project.list({ pageSize: 10 })` 获取首页
**Then** `items.length = 10`，`nextCursor` 为第 10 项的 id
**When** 用 `nextCursor` 作为 `cursor` 调用第二页
**Then** `items.length = 10`，`nextCursor` 为第 20 项的 id
**When** 第三页
**Then** `items.length = 5`，`nextCursor = null`

### AC4: 列表—空列表
**Given** 用户 B 没有任何项目
**When** 调用 `project.list`
**Then** `items = []`，`nextCursor = null`，`total = 0`

### AC5: 列表—数据隔离
**Given** 用户 A 有 2 个项目，用户 B 有 1 个项目
**When** 用户 A 调用 `project.list`
**Then** 返回 2 项，不包含用户 B 的项目

### AC6: 列表—pageSize 边界
**Given** 请求 `pageSize=100`（超过上限 50）
**When** 调用 `project.list`
**Then** tRPC 自动返回 `BAD_REQUEST`（Zod max(50) 校验拦截）

### AC7: 详情—owner 查询
**Given** 用户 A 拥有项目 X（含 StoryboardVersion + 3 个 Scene）
**When** 用户 A 调用 `project.getById({ projectId: X })`
**Then** 返回完整详情，含 currentJob + currentStoryboardVersion + scenes[3]

### AC8: 详情—admin 跨用户查询
**Given** 用户 B 拥有项目 Y，admin 用户调用
**When** `project.getById({ projectId: Y })`
**Then** 返回项目 Y 的完整详情（admin 可跨用户查看）

### AC9: 详情—非 owner 拒绝
**Given** 用户 A 拥有项目 X，用户 B（非 admin）调用
**When** `project.getById({ projectId: X })`
**Then** 返回 `FORBIDDEN`，message 含 `[PROJECT_ACCESS_DENIED]`

### AC10: 详情—项目不存在
**Given** 项目 ID `nonexistent-id` 在数据库中不存在
**When** 调用 `project.getById({ projectId: "nonexistent-id" })`
**Then** 返回 `NOT_FOUND`，message 含 `[PROJECT_NOT_FOUND]`

### AC11: 详情—无 Storyboard
**Given** 用户创建了项目但 Storyboard 尚未生成
**When** 调用 `project.getById`
**Then** `currentStoryboardVersion = null`，`currentJob` 存在（storyboard job）

### AC12: 列表和详情不阻塞 createAndGenerate
**Given** ep2-01 的所有 AC 仍然通过
**When** 运行 ep2-01 的全部测试
**Then** 全部通过（本 Change 只追加，不修改已有 behavior）

---

## Key Design Decisions

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | **分页方式** | cursor-based（游标为 `Project.id`） | 比 offset 更稳定，Prisma 原生支持 |
| 2 | **数据访问层** | 新建 `project.repo.ts` | 列表/详情是纯查询，适合抽到 repo；ep2-01 的事务逻辑保持内联 |
| 3 | **权限：list** | 按 userId 过滤，admin 不特殊 | Dashboard 不需要 admin 看全站数据 |
| 4 | **权限：getById** | owner 或 admin 可查看 | admin 需要排查特定项目问题 |
| 5 | **currentJob 定义** | generationJobs 中 createdAt 最新的一条 | 后续 retry 会创建新 Job，始终取最新的 |
| 6 | **Select 粒度** | 列表只取 9 个字段 + currentJob{3}；详情全取 | 列表不返回 sourceText（省带宽） |
| 7 | **Prisma 查询并行** | `Promise.all([findMany, count])` | 减少一次网络往返 |
| 8 | **userId 返回处理** | repo 层返回 userId，service 层校验后不传前端 | userId 仅用于权限判断，前端不需要 |
| 9 | **repo 函数签名** | 接受 userId 参数而非 ctx，不导入 prisma 全局单例 | 与 `checkDailyQuota(tx, userId)` 风格一致；便于单元测试 mock |
| 10 | **错误码格式** | 沿用 ep2-01 模式：`[CODE] message \| key=value` | 与 ep2-01 一致，ep7-01 统一升级 |

---

## Existing Code Integration Points

| 集成点 | 文件 | 状态 | 使用方式 |
|--------|------|------|---------|
| Prisma client | `src/lib/db/client.ts` | ✅ | repo 层 `import { prisma }` |
| tRPC procedures | `src/server/trpc.ts` | ✅ | `protectedProcedure` |
| tRPC router 注册 | `src/server/routers/_app.ts` | ✅ | projectRouter 已注册，无需修改 |
| Context session | `src/server/context.ts` | ✅ | `ctx.userId`, `ctx.isAdmin` |
| project.service 现有代码 | `src/server/services/project.service.ts` | ✅ | 追加新函数，不修改已有逻辑 |

**不需要修改的文件：**
- `_app.ts`：projectRouter 已在 ep2-01 注册，新端点自动可用
- `trpc.ts`：procedure 类型无需变更
- `context.ts`：context 结构无需变更
- `prisma/schema.prisma`：Schema 无需变更（所有表已就绪）

---

## Test Strategy

### A. 单元测试（vitest，mock Prisma）

```
src/lib/db/repositories/__tests__/project.repo.test.ts
├── findProjectsPaginated
│   ├── 正常分页：返回 items + nextCursor + total
│   ├── 末页：nextCursor = null
│   ├── 空列表：items=[], total=0
│   ├── status 筛选正确过滤
│   ├── pageSize 边界（1 / 50 / 超限被截断）
│   └── cursor 跳过已返回项（验证 skip: 1）
└── findProjectDetailById
    ├── 返回完整详情（含嵌套 currentJob + scenes）
    ├── 无 storyboard 时 currentStoryboardVersion = null
    └── 不存在的 ID 返回 null
```

### B. Service 层测试（mock repo）

```
src/server/services/__tests__/project.service.test.ts（追加）
├── listProjects
│   ├── 正确委托 repo.findProjectsPaginated
│   └── 参数原样透传（userId + options）
└── getProjectById
    ├── owner 可查看（project.userId === userId）
    ├── admin 可查看他人项目
    ├── 非 owner/非 admin → ProjectAccessDeniedError
    └── 不存在 → ProjectNotFoundError
```

### C. tRPC 集成测试（createCaller）

```
src/server/routers/__tests__/project.router.test.ts（追加）
├── project.list
│   ├── 未认证 → UNAUTHORIZED
│   ├── 正常查询 → 200 + ListResult
│   ├── pageSize > 50 → BAD_REQUEST
│   └── 空列表 → items=[], total=0
└── project.getById
    ├── 未认证 → UNAUTHORIZED
    ├── owner → 200 + DetailResult
    ├── admin → 200（跨用户）
    ├── 非 owner → FORBIDDEN
    ├── 不存在 → NOT_FOUND
    └── projectId 为空字符串 → BAD_REQUEST
```

### D. 手动集成验证

```bash
# 1. 启动开发环境
npm run dev

# 2. 创建测试项目（用 ep2-01 的 createAndGenerate）
# 3. 验证 list
curl -X POST http://localhost:3000/api/trpc/project.list \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{}'

# 4. 验证 getById
curl -X POST http://localhost:3000/api/trpc/project.getById \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"projectId": "<project-id>"}'

# 5. 验证权限隔离（换另一个用户登录，确认看不到第一个用户的项目）
```

---

## Rollback Plan

| 范围 | 回滚操作 |
|------|---------|
| 代码 | `git revert <commit-hash>` |
| 数据库 | 无需回滚（无 Schema 变更） |

**影响面：** 仅新增了 query 端点。下游前端（`ep2-03`、`ep2-04`）尚未开发，回滚无影响。

---

## Risks

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| `satisfies Prisma.ProjectSelect` 在 Prisma 7 中类型推断异常 | 低 | TypeScript 4.9+ 原生支持 `satisfies`；若不兼容降级为显式类型标注 |
| `Promise.all([findMany, count])` 在高并发下表数据变动导致 count 与实际 items 不匹配 | 低 | 这是所有非事务读的天然性质，Dashboard 不需要精确一致性 |
| cursor 分页在数据删除时"漏项" | 低 | cursor 基于 id（不变），删除不会导致 cursor 失效；新增数据不影响当前页光标 |
| `userId` 泄露到前端响应 | 低 | service 层 `getProjectById` 返回 `ProjectDetailResult`（类型定义不含 userId），编译时保证 |
| 测试 mock 复杂度高（repo + service + router 三层） | 低 | repo 层独立 mock Prisma；service 层 mock repo；router 层 mock service；各层独立 |

---

## Commit Strategy

建议拆分为 3 个 commit：

```
Commit 1: feat(ep2-02): add project repo with list and detail queries
  - Create src/lib/db/repositories/project.repo.ts
  - Add LIST_SELECT / DETAIL_SELECT with satisfies Prisma.ProjectSelect
  - Implement findProjectsPaginated and findProjectDetailById
  - Add repo unit tests

Commit 2: feat(ep2-02): add listProjects and getProjectById to project.service
  - Add ProjectNotFoundError / ProjectAccessDeniedError
  - Implement listProjects and getProjectById with permission checks
  - Add service unit tests

Commit 3: feat(ep2-02): add project.list and project.getById tRPC endpoints
  - Add listProjectsInputSchema / getProjectByIdInputSchema
  - Add list and getById query procedures to projectRouter
  - Add tRPC integration tests
```

---

## PR Checklist

- [ ] `npm test` 全部测试通过（含 ep2-01 已有测试）
- [ ] `npm run lint` 无新增错误
- [ ] `npm run dev` 启动成功
- [ ] `project.list` 在 tRPC panel 中可见且可调用
- [ ] `project.getById` 在 tRPC panel 中可见且可调用
- [ ] 用户 A 的列表不包含用户 B 的项目
- [ ] 非 owner 调用 getById → FORBIDDEN
- [ ] admin 可查看他人项目
- [ ] 不存在项目 → NOT_FOUND
- [ ] pageSize 超限 → BAD_REQUEST
- [ ] ep2-01 功能（createAndGenerate）不受影响
