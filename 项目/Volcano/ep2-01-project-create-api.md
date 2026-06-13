# Change: ep2-01-project-create-api

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-01-project-create-api` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~700 LOC，含 migration + 测试基础设施） |
| **预估工期** | 2 天 |
| **前置 Change** | 无（Epic 1 基线已就绪） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |

---

## Goal

实现 `project.createAndGenerate` tRPC mutation：接收用户输入的文本和配置参数，校验后创建 Project + GenerationJob 记录，发送 Inngest 事件触发后续生成流水线。

---

## Scope

### ✅ 包含内容

1. **Prisma Migration（Schema 修改）**
   - `Project.status` 默认值：`draft` → `queued`（与流水线入口状态一致）
   - `GenerationJob` 新增 `requestId` 字段（`String? @unique`，幂等键）

2. **测试基础设施搭建（Step 0）**
   - 安装 `vitest` + `@vitest/coverage-v8`（devDependencies）
   - 创建 `vitest.config.ts`
   - 添加 `"test": "vitest run"` 和 `"test:watch": "vitest"` 到 package.json scripts
   - 创建 `src/server/services/` 和 `src/server/services/__tests__/` 目录

3. **`project.createAndGenerate` tRPC mutation**（`protectedProcedure`）
   - Zod 输入校验（sourceText 长度、aspectRatio 枚举、voice 参数等）
   - 调用 `quota.service.checkDailyQuota()` 检查用户每日额度
   - 并发限制检查（同一用户同时只能有 1 个 active 生成任务）
   - `requestId` 幂等检查（基于 `GenerationJob.requestId` 唯一索引）
   - 调用 `project.service.createProject()` 在带锁事务中创建 Project + GenerationJob
   - 发送 Inngest 事件 `video/generate.requested`（事务外，失败有补偿策略）
   - 返回 `{ projectId, jobId }`

4. **`project.service.ts` 业务层**
   - `createProject(input, userId)`：在单个 Prisma 交互式事务中创建 Project + GenerationJob
   - 事务内使用 PostgreSQL advisory lock（`pg_advisory_xact_lock`）防 TOCTOU 竞态
   - 生成默认 project title（取 sourceText 前 50 字符）
   - Project 初始状态：`queued`（Schema 默认值同步修改）
   - GenerationJob 初始状态：`pending`，jobType: `storyboard`

5. **`quota.service.ts` 额度服务（初版）**
   - `checkDailyQuota(userId)`：查询用户当日 GenerationJob 数
   - 默认每日免费额度：1 次/用户（常量 `DAILY_FREE_QUOTA = 1`，可配置）
   - Admin 用户跳过额度检查
   - 返回 `QuotaCheckResult`（含 allowed/used/limit/resetsAt）

6. **Inngest 事件发送**
   - 定义事件类型常量 `EVENT_VIDEO_GENERATE_REQUESTED = "video/generate.requested"`
   - `sendGenerateRequested()` 辅助函数
   - 发送失败补偿策略（见"关键设计决策"）

7. **tRPC Router 注册**
   - 在 `_app.ts` 中注册 `projectRouter`

8. **测试**
   - `quota.service` 单元测试（mock prisma）
   - `project.service` 单元测试（mock prisma + inngest）
   - `project.createAndGenerate` tRPC 集成测试（使用 `createCaller`，mock 外部依赖）

### ❌ 不包含内容

- ❌ 实际的 Inngest function 实现（`ep3-04` 才实现 generate-storyboard）
- ❌ 项目列表/详情 API（`ep2-02`）
- ❌ 前端创建页面（`ep2-04`）
- ❌ 删除/取消/重试 API（`ep2-05`）
- ❌ R2 上传（Epic 4）
- ❌ TTS 语音列表（Epic 4）
- ❌ UsageRecord 写入（仅检查，消费逻辑在 `ep7-02` 完成）
- ❌ 完整的错误码体系（`ep7-01`，本 Change 使用嵌入 TRPCError 的简单字符串）
- ❌ stuck project 定时扫描（在 `ep7-03` 中作为取消/重试机制的补充实现）

---

## Files Likely Affected

| 文件 | 操作 | 说明 |
|------|------|------|
| `prisma/schema.prisma` | **修改** | `Project.status` default `"draft"` → `"queued"`；`GenerationJob` 新增 `requestId` |
| `prisma/migrations/` | **自动生成** | Prisma migrate 生成的迁移文件 |
| `package.json` | **修改** | devDependencies 添加 vitest；scripts 添加 test |
| `vitest.config.ts` | **新建** | Vitest 配置文件 |
| `src/server/services/` | **新建目录** | 业务服务层目录 |
| `src/server/services/__tests__/` | **新建目录** | 测试目录 |
| `src/server/services/quota.service.ts` | **新建** | 每日额度检查逻辑 |
| `src/server/services/project.service.ts` | **新建** | Project 创建业务逻辑（含 advisory lock） |
| `src/server/routers/project.ts` | **新建** | tRPC project router，含 `createAndGenerate` mutation |
| `src/inngest/client.ts` | **修改** | 添加事件类型常量 + sendEvent 辅助函数 |
| `src/server/routers/_app.ts` | **修改** | 注册 projectRouter |
| `src/server/services/__tests__/quota.service.test.ts` | **新建** | 额度服务单元测试 |
| `src/server/services/__tests__/project.service.test.ts` | **新建** | 项目服务单元测试 |
| `src/server/routers/__tests__/project.router.test.ts` | **新建** | tRPC 集成测试（createCaller） |

**预计新增文件：9 个，修改文件：4 个**

---

## Dependencies

```
Epic 1 (基线)
├── DB Schema: Project, GenerationJob 表已存在（prisma/schema.prisma）
├── tRPC: protectedProcedure 已就绪（src/server/trpc.ts）
├── tRPC Route Handler: /api/trpc/[trpc]/route.ts ✅ 已存在
├── Context: session + userId + isAdmin 可用（src/server/context.ts）
├── Inngest Client: inngest 实例已创建（src/inngest/client.ts）
├── Inngest Route Handler: /api/inngest/route.ts ✅ 已存在
├── Prisma: prisma client 已配置（src/lib/prisma.ts）
└── Package Manager: pnpm（通过 pnpm-workspace 或默认）
```

**前置 Change：无**（Epic 1 已完成且 tRPC + Inngest route handler 均已就绪）

---

## Pre-flight Checklist（实现前确认）

在开始写业务代码之前，必须确认以下基线依赖就绪：

| 检查项 | 状态 | 验证方式 |
|--------|------|---------|
| tRPC route handler | ✅ 已就绪 | `src/app/api/trpc/[trpc]/route.ts` 存在，导出 GET/POST |
| Inngest route handler | ✅ 已就绪 | `src/app/api/inngest/route.ts` 存在，导出 GET/POST |
| Prisma client 可生成 | 待验证 | `npx prisma generate` |
| `src/server/services/` 目录 | ❌ 不存在 | 本 Change Step 0 创建 |
| vitest 已安装 | ❌ 未安装 | `devDependencies` 中无 vitest |
| Zod 版本 | v4.4.3 | `zod@^4.4.3`，需确认 v4 API |

---

## Technical Design

### 0. 类型定义（TypeScript Types）

以下类型在本 Change 中定义和使用，放在对应模块文件中导出：

```typescript
// === src/server/services/quota.service.ts ===
export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: Date;       // 当日 23:59:59.999
}

// === src/server/routers/project.ts ===
import { z } from "zod";

// 输入 schema 和导出类型
export const createProjectInputSchema = z.object({
  sourceText: z.string()
    .min(1, "请输入文本内容")
    .max(5000, "文本长度不能超过 5000 字"),
  audienceRole: z.enum(["student", "teacher", "professional"]).optional(),
  audienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  targetDurationSec: z.union([
    z.literal(60), z.literal(120), z.literal(180), z.literal(300)
  ]).optional(),
  voiceProvider: z.string().optional(),
  voiceId: z.string().optional(),
  requestId: z.string().uuid("无效的请求 ID"),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// === src/inngest/client.ts ===
export interface GenerateRequestedEvent {
  name: typeof EVENTS.VIDEO_GENERATE_REQUESTED;
  data: {
    projectId: string;
    userId: string;
    jobId: string;
  };
}

// === src/server/services/project.service.ts ===
export interface CreateProjectResult {
  project: {
    id: string;
    status: string;
    title: string;
  };
  job: {
    id: string;
    status: string;
    jobType: string;
  };
}
```

### 1. Prisma Schema 修改（Migration）

#### 1.1 `Project.status` 默认值

```
// 修改前:
status  String  @default("draft")

// 修改后:
status  String  @default("queued")
```

**理由**：`draft` 表示用户正在编辑草稿，但 `createAndGenerate` 是用户提交后的入口——此时 Project 已经进入生成队列，"draft" 语义错误。`queued` 准确描述了"已提交、等待 Inngest 消费"的状态。PRD 中状态机也是 `draft → queued → generating_storyboard → ...`，但当前产品没有"保存草稿"功能（第一版直接从创建页提交），所以跳过 draft 直接从 queued 开始。

#### 1.2 `GenerationJob` 新增 `requestId` 字段

```prisma
model GenerationJob {
  // ... 现有字段 ...
  requestId  String?  @unique   // ← 新增：客户端幂等键
  // ...
}
```

**理由**：见下方"幂等检查"设计。放在 GenerationJob 而非 Project 因为：
- GenerationJob 是实际"生成动作"的记录载体
- `@unique` 约束提供数据库级别的幂等保证
- 后续 retry 场景（`ep2-05`）创建新 GenerationJob 时也会携带新的 requestId

### 2. API 契约

```
POST /api/trpc/project.createAndGenerate
Headers: Cookie (better-auth session)

Request Body:
{
  "sourceText": string,        // 必填，1-5000 字符
  "audienceRole"?: "student" | "teacher" | "professional",
  "audienceLevel"?: "beginner" | "intermediate" | "advanced",
  "aspectRatio"?: "16:9" | "9:16" | "1:1",    // 默认 16:9
  "targetDurationSec"?: 60 | 120 | 180 | 300,
  "voiceProvider"?: string,
  "voiceId"?: string,
  "requestId": string          // 必填：UUID v4，幂等键
}

Response 200:
{
  "projectId": string,
  "jobId": string
}
```

#### 错误响应（通过 tRPC 的 TRPCError 传递）

tRPC 的 `TRPCError` 序列化格式为 `{ code: TRPC_ERROR_CODE, message: string }`。
tRPC 内置 `code` 枚举值有限（`BAD_REQUEST` / `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` /
`TIMEOUT` / `CONFLICT` / `TOO_MANY_REQUESTS` / `INTERNAL_SERVER_ERROR` 等）。
**本 Change 的业务错误码嵌入 TRPCError 的 `message` 字段**，前端解析时按约定格式提取。
完整错误码体系（含独立 `code` 字段）将在 `ep7-01` 中统一标准化。

| 场景 | TRPCError code | message 格式 | HTTP 状态 |
|------|---------------|-------------|----------|
| 参数校验失败 | `BAD_REQUEST` | Zod issue[] （由 tRPC 自动处理） | 400 |
| 额度超限 | `TOO_MANY_REQUESTS` | `[QUOTA_EXCEEDED] 今日免费额度已用完，请明天再试 \| resetsAt: <ISO>` | 429 |
| 并发限制 | `TOO_MANY_REQUESTS` | `[CONCURRENT_LIMIT] 您有一个生成任务正在进行中` | 429 |
| 幂等冲突 | `CONFLICT` | `[DUPLICATE_REQUEST] 重复请求 \| existingProjectId: <id>` | 409 |
| 未登录 | `UNAUTHORIZED` | `Not authenticated`（protectedProcedure 自动处理） | 401 |
| 内部错误 | `INTERNAL_SERVER_ERROR` | `生成请求失败，请重试` | 500 |

> **ep7-01 升级路径**：`ep7-01` 将引入统一 `AppError` 类和 tRPC `errorFormatter`，
> 届时重构本 Change 的错误处理为 `throw new AppError(ErrorCode.QUOTA_EXCEEDED)`。
> 当前先使用上述简化格式，API 响应结构在 ep7-01 前后对前端透明。

### 3. TOCTOU 竞态防护：PostgreSQL Advisory Lock

**问题**：并发检查和额度检查如果放在事务外部，两个并发请求可能同时通过检查。

**方案**：使用 PostgreSQL 会话级 advisory lock（`pg_advisory_xact_lock`），锁 key = hash(userId)。
事务提交时自动释放锁（`_xact` 后缀保证）。

```typescript
// project.service.ts
import { prisma } from "@/lib/db";

async function createProject(
  input: CreateProjectInput,
  userId: string
): Promise<CreateProjectResult> {
  return prisma.$transaction(async (tx) => {
    // Step 1: 获取用户级 advisory lock（防 TOCTOU）
    // 使用 userId 的数值 hash 作为锁 ID
    const lockId = hashUserId(userId);
    await tx.$queryRawUnsafe(
      `SELECT pg_advisory_xact_lock(${lockId})`
    );

    // Step 2: 在锁内重新检查并发限制
    const activeStatuses = [
      "queued", "generating_storyboard", "storyboard_ready",
      "generating_audio", "calculating_timeline", "rendering"
    ];
    const activeCount = await tx.project.count({
      where: { userId, status: { in: activeStatuses } },
    });
    if (activeCount > 0) {
      throw new ConcurrentLimitError();
    }

    // Step 3: 创建 Project + GenerationJob（幂等检查由 @unique 约束保证）
    // ...创建逻辑（见下方）

    return { project, job };
  });
}

// 将 userId 转为 pg_advisory_lock 可用的 bigint
function hashUserId(userId: string): number {
  // 简单 hash：取前 8 个字符的 charCode 累加
  // PostgreSQL advisory lock 接受 bigint (64-bit signed)
  let hash = 0;
  for (let i = 0; i < Math.min(userId.length, 12); i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
```

> **为什么选择 advisory lock 而非 `SELECT ... FOR UPDATE`：**
> 并发限制检查的是多个 Project 行（count），不是更新某一行。
> `FOR UPDATE` 无法阻止新行插入。Advisory lock 在应用层精确控制锁范围（per userId）。

> **锁粒度说明**：每个 userId 一把锁，不同用户之间不互斥。同一用户的两个并发请求串行化，
> 第二个请求在锁释放后执行 `activeCount` 检查时会发现已有 active 项目并返回错误。

### 4. 幂等检查：`requestId` 唯一约束

**方案**：`GenerationJob.requestId` 字段 + `@unique` 约束。

```typescript
// project.service.ts - 事务内
try {
  const job = await tx.generationJob.create({
    data: {
      userId,
      projectId: project.id,
      jobType: "storyboard",
      status: "pending",
      aiProvider: "deepseek",
      requestId: input.requestId,    // ← 幂等键
      inputParams: JSON.stringify({...}),
    },
  });
} catch (error) {
  // Prisma 唯一约束冲突 → P2002
  if (isPrismaUniqueConstraintError(error)) {
    // 查找已存在的 job → 返回已有 projectId
    const existing = await tx.generationJob.findUnique({
      where: { requestId: input.requestId },
    });
    throw new DuplicateRequestError(existing.projectId);
  }
  throw error;
}
```

**为什么放在 GenerationJob 而非 Project：**
- 一个 Project 可能经历多次重试（多个 GenerationJob），每次重试携带新的 requestId
- Project 的 requestId 语义不清晰（是"创建请求"还是"最新操作请求"？）
- GenerationJob 天然承载"本次操作"的语义
- `@unique` 约束提供数据库级强保证，无竞态窗口

> **关于 doc 中提到的 JSON 字段搜索方案**：已废弃。JSON 字段查询在 Prisma 中效率低且
> 无法利用索引。`@unique` 约束方案是确定的、高性能的、数据库级别的解决方案。

### 5. Prisma 事务伪代码（最终版）

```typescript
// project.service.ts
async function createProject(
  input: CreateProjectInput,
  userId: string
): Promise<CreateProjectResult> {
  return prisma.$transaction(async (tx) => {
    // 1. Advisory lock (防 TOCTOU)
    const lockId = hashUserId(userId);
    await tx.$queryRawUnsafe(`SELECT pg_advisory_xact_lock(${lockId})`);

    // 2. 锁内并发检查
    const activeStatuses = [
      "queued", "generating_storyboard", "storyboard_ready",
      "generating_audio", "calculating_timeline", "rendering"
    ];
    const activeCount = await tx.project.count({
      where: { userId, status: { in: activeStatuses } },
    });
    if (activeCount > 0) {
      throw new ConcurrentLimitError(userId);
    }

    // 3. 创建 Project (status 用 Schema default "queued"，不显式传)
    const project = await tx.project.create({
      data: {
        userId,
        title: input.sourceText.slice(0, 50)
          + (input.sourceText.length > 50 ? "..." : ""),
        sourceText: input.sourceText,
        audienceRole: input.audienceRole,
        audienceLevel: input.audienceLevel,
        aspectRatio: input.aspectRatio ?? "16:9",
        targetDurationSec: input.targetDurationSec,
        voiceProvider: input.voiceProvider,
        voiceId: input.voiceId,
      },
    });

    // 4. 创建 GenerationJob（requestId @unique 保证幂等）
    let job;
    try {
      job = await tx.generationJob.create({
        data: {
          userId,
          projectId: project.id,
          jobType: "storyboard",
          status: "pending",
          aiProvider: "deepseek",
          requestId: input.requestId,
          inputParams: JSON.stringify({
            sourceText: input.sourceText,
            audienceRole: input.audienceRole,
            audienceLevel: input.audienceLevel,
            aspectRatio: input.aspectRatio,
            targetDurationSec: input.targetDurationSec,
          }),
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        // 幂等冲突：找到已有的 job
        const existing = await tx.generationJob.findUnique({
          where: { requestId: input.requestId },
        });
        throw new DuplicateRequestError(existing!.projectId);
      }
      throw error; // 其他错误向上传播
    }

    return { project, job };
  });
}
```

### 6. 额度检查伪代码

```typescript
// quota.service.ts

/** 每日免费额度上限（可后续从配置/DB 读取） */
export const DAILY_FREE_QUOTA = 1;

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  resetsAt: Date;
}

export async function checkDailyQuota(userId: string): Promise<QuotaCheckResult> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 查询今日已提交的生成任务数（storyboard 类型 = 每个项目的主入口 job）
  const todayCount = await prisma.generationJob.count({
    where: {
      userId,
      jobType: "storyboard",
      createdAt: { gte: todayStart, lte: todayEnd },
      status: { not: "cancelled" },  // 已取消的不计入
    },
  });

  return {
    allowed: todayCount < DAILY_FREE_QUOTA,
    used: todayCount,
    limit: DAILY_FREE_QUOTA,
    resetsAt: todayEnd,
  };
}
```

> **设计决策**：额度检查基于 `GenerationJob` 表而非 `UsageRecord` 表。
> `UsageRecord` 的完善写入在 `ep7-02` 才实现。两阶段方案：
> - **当前**：基于 GenerationJob 计数。创建时即写入，无需额外写入逻辑。
> - **ep7-02 升级**：基于 UsageRecord 重构内部实现。`checkDailyQuota()` 签名不变（API 契约稳定）。
> - **语义差异**：GenerationJob 计数反映"提交次数"，UsageRecord 反映"实际消费次数"。
>   对第一版免费用户而言二者等价（每次提交都会进入生成流水线）。

### 7. tRPC Router（完整实现）

```typescript
// src/server/routers/project.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { checkDailyQuota } from "@/server/services/quota.service";
import { createProject, DuplicateRequestError, ConcurrentLimitError }
  from "@/server/services/project.service";
import { sendGenerateRequested } from "@/inngest/client";

export const createProjectInputSchema = z.object({
  sourceText: z.string()
    .min(1, "请输入文本内容")
    .max(5000, "文本长度不能超过 5000 字"),
  audienceRole: z.enum(["student", "teacher", "professional"]).optional(),
  audienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  targetDurationSec: z.union([
    z.literal(60), z.literal(120), z.literal(180), z.literal(300)
  ]).optional(),
  voiceProvider: z.string().optional(),
  voiceId: z.string().optional(),
  requestId: z.string().uuid("无效的请求 ID"),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const projectRouter = router({
  createAndGenerate: protectedProcedure
    .input(createProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      // ---- Phase 1: 事务前检查（轻量，无需锁） ----

      // Admin 跳过额度检查
      if (!ctx.isAdmin) {
        const quota = await checkDailyQuota(ctx.userId);
        if (!quota.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `[QUOTA_EXCEEDED] 今日免费额度已用完，请明天再试`
              + ` | resetsAt: ${quota.resetsAt.toISOString()}`,
          });
        }
      }

      // ---- Phase 2: 事务内（advisory lock + 创建） ----

      let result;
      try {
        result = await createProject(input, ctx.userId);
      } catch (error) {
        if (error instanceof DuplicateRequestError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `[DUPLICATE_REQUEST] 重复请求`
              + ` | existingProjectId: ${error.projectId}`,
          });
        }
        if (error instanceof ConcurrentLimitError) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "[CONCURRENT_LIMIT] 您有一个生成任务正在进行中，请等待完成",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "生成请求失败，请重试",
          cause: error,
        });
      }

      // ---- Phase 3: 事务外（Inngest 发送，失败有补偿策略） ----

      try {
        await sendGenerateRequested({
          projectId: result.project.id,
          userId: ctx.userId,
          jobId: result.job.id,
        });
      } catch (inngestError) {
        // 事务已提交，Project 为 queued 状态
        // 补偿策略：
        //   1. 记录错误日志（Sentry 接入后自动捕获）
        //   2. Project 保持 queued，不改为 error（等待 ep7-03 的 sweep 机制）
        //   3. 开发环境：仅 warn，Inngest 可能未启动
        console.error(
          `[CRITICAL] Failed to send Inngest event for project=${result.project.id}`,
          inngestError instanceof Error ? inngestError.message : inngestError
        );
        if (process.env.NODE_ENV === "production") {
          // 生产环境：这个错误需要告警
          // TODO(ep7-04): 接入 Sentry 后替换为 Sentry.captureException
        }
        // 不向上抛错误——前端仍收到创建成功的响应
      }

      return {
        projectId: result.project.id,
        jobId: result.job.id,
      };
    }),
});
```

### 8. Inngest 发送失败补偿策略

**场景**：事务提交成功（Project=queued, Job=pending），但 `inngest.send()` 失败。

**后果**：Project 永远卡在 `queued` 状态，不会被处理。

**当前缓解**：
- Inngest send 放在事务之后，保证 DB 先落地
- 失败不阻塞 API 响应（用户仍收到成功）
- 记录 `console.error` 日志

**ep7-03 补偿机制**（不在本 Change 实现）：
- 定时 sweep function（Inngest cron `*/5 * * * *`）扫描 `queued` 状态超过 1 分钟的 Project
- 对 stuck project 重新发送 Inngest 事件
- 如果超过 10 分钟仍 stuck → 标记 `failed`

**前端侧**：
- 进度页（`ep6-01`）轮询 project 状态，如果长时间 `queued` 则展示"排队中"提示
- 不对此场景做特殊处理（Inngest 发送失败概率极低）

### 9. Inngest 事件发送

```typescript
// src/inngest/client.ts - 追加部分

export const EVENTS = {
  /** 用户提交生成请求，触发整个流水线 */
  VIDEO_GENERATE_REQUESTED: "video/generate.requested",
} as const;

export interface GenerateRequestedEvent {
  name: typeof EVENTS.VIDEO_GENERATE_REQUESTED;
  data: {
    projectId: string;
    userId: string;
    jobId: string;
  };
}

/** 发送视频生成请求事件。返回 void，失败时不抛异常（由调用方处理）。 */
export async function sendGenerateRequested(
  params: GenerateRequestedEvent["data"]
): Promise<void> {
  await inngest.send({
    name: EVENTS.VIDEO_GENERATE_REQUESTED,
    data: params,
  });
}
```

> **Inngest v4 API 确认**：`inngest.send({ name, data })` 是 Inngest v4.5.1 的标准 API。
> 参考：https://www.inngest.com/docs/ts/sending-events

### 10. Zod v4 注意事项

项目使用 `zod@^4.4.3`。本 Change 使用的 API 在 v4 中的兼容性：

| 使用的 API | v3 写法 | v4 写法 | 风险 |
|-----------|---------|---------|------|
| `z.string()` | ✅ | ✅ | 无变化 |
| `.min()` / `.max()` | ✅ | ✅ | 无变化 |
| `.uuid()` | ✅ | ✅ | 无变化 |
| `z.enum([...])` | ✅ | ✅ | 无变化 |
| `.default()` | ✅ | ✅ | 无变化 |
| `.optional()` | ✅ | ✅ | 无变化 |
| `z.union([...])` | ✅ | ✅ | 无变化 |
| `z.literal()` | ✅ | ✅ | 无变化 |
| `z.infer<>` | ✅ | ✅ | 无变化 |

**结论**：本 Change 使用的所有 Zod API 在 v4 中与 v3 行为一致。如在实现中遇到差异，
查阅 `node_modules/zod/README.md`。

---

## Implementation Steps

### Step 0: 基础设施准备（前置条件） 🔴 必须先完成

| 任务 | 说明 | 验证 |
|------|------|------|
| 0.1 安装 vitest | `pnpm add -D vitest @vitest/coverage-v8` | `npx vitest --version` |
| 0.2 创建 `vitest.config.ts` | 配置 tsconfig 路径别名映射 | `npx vitest run` 不报配置错误 |
| 0.3 添加 test scripts | `"test": "vitest run"`, `"test:watch": "vitest"` | `pnpm test` 可执行（无测试时通过） |
| 0.4 创建目录结构 | `mkdir -p src/server/services/__tests__`<br>`mkdir -p src/server/routers/__tests__` | 目录存在 |
| 0.5 Prisma Schema 修改 | 见 Step 0.5 详细说明 | `npx prisma migrate dev` 成功 |
| 0.6 验证基础链路 | `pnpm dev` 启动，确认 Auth + tRPC + Inngest route 正常 | 登录页可访问 |

**`vitest.config.ts` 模板：**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

> **注意**：如果项目使用 `tsconfig.json` 的 `paths`，vitest 需要对应的 alias 配置。
> `@/` → `./src` 别名必须在 vitest.config.ts 中显式声明。

### Step 0.5: Prisma Schema 修改 + Migration

修改 `prisma/schema.prisma`：

```diff
model Project {
  // ... 其他字段不变 ...

- status  String  @default("draft")
+ status  String  @default("queued")
  // draft, queued, generating_storyboard, storyboard_ready,
  // generating_audio, calculating_timeline, rendering, completed, failed, cancelled

  // ... 其他字段不变 ...
}

model GenerationJob {
  // ... 现有字段 ...

+ requestId  String?  @unique   // 客户端幂等键

  // ... 现有字段 ...
}
```

执行 migration：
```bash
npx prisma migrate dev --name add_request_id_and_fix_status_default
```

### Step 1: quota.service.ts + 单元测试

- 创建 `src/server/services/quota.service.ts`
- 实现 `checkDailyQuota(userId)` + `DAILY_FREE_QUOTA` 常量
- 实现 admin 豁免（quota service 不判断 admin，由 router 层在调用前判断。或者接受 `isAdmin` 参数）
- 编写 `src/server/services/__tests__/quota.service.test.ts`

### Step 2: project.service.ts + 单元测试

- 创建 `src/server/services/project.service.ts`
- 实现 `createProject(input, userId)`（含 advisory lock + 并发检查 + 幂等 @unique）
- 实现 `DuplicateRequestError` / `ConcurrentLimitError` 自定义错误类
- 实现 `hashUserId()` 辅助函数
- 编写 `src/server/services/__tests__/project.service.test.ts`

### Step 3: Inngest 事件辅助

- 修改 `src/inngest/client.ts`：添加 `EVENTS` 常量 + `sendGenerateRequested()` + 类型导出

### Step 4: project.router.ts + 注册

- 创建 `src/server/routers/project.ts`：实现完整 mutation
- 修改 `src/server/routers/_app.ts`：注册 projectRouter

### Step 5: tRPC 集成测试

- 创建 `src/server/routers/__tests__/project.router.test.ts`
- 使用 tRPC `createCaller` 直接调用 procedure（无需 HTTP server）
- Mock prisma + Inngest send

```typescript
// tRPC 集成测试模板
import { createCaller } from "@/server/trpc";  // 需要导出 createCaller
// ...

// 但当前 trpc.ts 没有 createCaller，需要在 Step 5 补充导出：
// export const createCaller = t.createCallerFactory(appRouter);
```

> **注意**：`src/server/trpc.ts` 当前只有 `router` / `publicProcedure` / `protectedProcedure` /
> `adminProcedure`。Step 5 需要在 `trpc.ts` 或测试辅助中创建 caller 工厂。
> 如果改不动 trpc.ts（影响面广），可在测试文件中直接构造 context mock：
>
> ```typescript
> const caller = t.createCaller(appRouter);
> const result = await caller.project.createAndGenerate(
>   input,
>   { ctx: { userId: "test-user", session: mockSession, ... } }
> );
> ```

### Step 6: 集成验证

- `pnpm dev` + `pnpm inngest` 启动
- 用 tRPC panel 或 curl 测试完整链路
- 验证：DB 中 Project(status=queued) + GenerationJob(status=pending)
- 验证：Inngest Dev UI 中可见 `video/generate.requested` 事件
- 验证：重复 requestId → 409 响应
- 验证：第 2 次请求 → 429 QUOTA_EXCEEDED

---

## Acceptance Criteria

### AC1: 正常创建
**Given** 用户已登录，额度未用完，无活跃任务
**When** 调用 `project.createAndGenerate` 传入合法的 `sourceText`（500字）、`aspectRatio=16:9`、`requestId=<uuid>`
**Then**
- 返回 `{ projectId, jobId }`
- DB 中 Project 记录：userId 正确、sourceText 完整保存、status=`queued`（Schema default）
- DB 中 GenerationJob 记录：jobType=`storyboard`、status=`pending`、`requestId` 填充且唯一
- Inngest Dev UI 收到 `video/generate.requested` 事件

### AC2: 空文本拒绝
**Given** 用户已登录
**When** 调用 `createAndGenerate` 传入 `sourceText=""` 
**Then** tRPC 返回 `BAD_REQUEST`（Zod 校验自动拦截）

### AC3: 超长文本拒绝
**Given** 用户已登录
**When** 调用传入 5001 字符的 sourceText
**Then** tRPC 返回 `BAD_REQUEST`

### AC4: 额度超限
**Given** 用户（非 admin）今日已创建 1 个生成项目
**When** 再次调用 `createAndGenerate`
**Then** 返回 `TOO_MANY_REQUESTS`，message 前缀 `[QUOTA_EXCEEDED]`，含 `resetsAt`

### AC5: admin 无限额
**Given** admin 用户今日已创建 1 个生成项目
**When** 再次调用 `createAndGenerate`
**Then** 正常创建成功（不检查额度）

### AC6: 并发限制
**Given** 用户有一个 project 状态为 `generating_storyboard`
**When** 再次调用 `createAndGenerate`
**Then** 返回 `TOO_MANY_REQUESTS`，message 前缀 `[CONCURRENT_LIMIT]`

### AC7: 幂等保护（数据库级）
**Given** 用户创建项目成功（requestId=`X`）
**When** 用相同的 `requestId=X` 再次调用
**Then** 返回 `CONFLICT`，message 前缀 `[DUPLICATE_REQUEST]`，含 `existingProjectId`

### AC8: 未登录拒绝
**Given** 无 session cookie
**When** 调用 `createAndGenerate`
**Then** 返回 `UNAUTHORIZED`（由 `protectedProcedure` 框架级拦截，**非本 Change 新增逻辑**）

### AC9: 无效 aspectRatio 拒绝
**Given** 用户已登录
**When** 调用传入 `aspectRatio="4:3"`（不在枚举中）
**Then** tRPC 返回 `BAD_REQUEST`

### AC10: Inngest 发送失败不阻塞创建
**Given** Inngest 服务不可达
**When** 调用 `createAndGenerate`
**Then** 仍返回 200 成功（projectId + jobId），console 中有错误日志，Project 状态为 `queued`

### AC11: Advisory lock 防并发竞态
**Given** 同一用户的两个请求几乎同时到达
**When** 两个请求都进入 `createProject` 事务
**Then** 第一个成功创建，第二个因 advisory lock 串行化后检查到 activeCount>0 返回 CONCURRENT_LIMIT

---

## Key Design Decisions

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | **Project 初始状态** | `queued`（修改 Schema default） | `draft` 表示编辑中，`queued` 准确描述已提交等待 Inngest 消费 |
| 2 | **幂等键存储** | `GenerationJob.requestId` + `@unique` | 数据库级强保证，无竞态；放在 GenerationJob 因语义更匹配（每个操作一个 requestId） |
| 3 | **TOCTOU 防护** | PostgreSQL `pg_advisory_xact_lock(userId)` | 事务内串行化同用户请求，事务提交自动释放；比 `FOR UPDATE` 更适合"阻止新行插入"场景 |
| 4 | **额度检查数据源** | `GenerationJob` 计数（当前），后续迁至 `UsageRecord` | UsageRecord 写入未实现（ep7-02），GenerationJob 即时可用；API 契约不变 |
| 5 | **Inngest 发送失败** | 不阻塞 API 响应 + console.error 日志 | 事务已提交无法回滚；Project 保持 queued 等待 ep7-03 sweep 补偿 |
| 6 | **错误码格式** | 嵌入 TRPCError message（`[CODE] message`） | 先简化实现；完整错误码体系在 ep7-01 统一标准化，届时重构为 `AppError` 类 |
| 7 | **并发限制上限** | 1 个 active/用户 | PRD v1.0.2 明确要求 |
| 8 | **初始 jobType** | `storyboard` | 整个流水线的第一步 |
| 9 | **title 生成** | 取 sourceText 前 50 字符 + "..." | 简单规则，后续可被 Storyboard 生成覆盖 |
| 10 | **测试框架** | vitest（本 Change 安装） | 项目原本无测试框架，vitest 是当前 Next.js 生态首选 |

---

## Existing Code Integration Points

| 集成点 | 文件 | 状态 | 使用方式 |
|--------|------|------|---------|
| Prisma client | `src/lib/prisma.ts` | ✅ | `import prisma from "@/lib/prisma"` |
| tRPC procedures | `src/server/trpc.ts` | ✅ | `protectedProcedure`, `router` |
| tRPC route handler | `src/app/api/trpc/[trpc]/route.ts` | ✅ | 已注册 GET/POST，无需修改 |
| Context session | `src/server/context.ts` | ✅ | `ctx.userId`, `ctx.session`, `ctx.isAdmin` |
| Inngest client | `src/inngest/client.ts` | ✅ 需修改 | `inngest.send()` |
| Inngest route handler | `src/app/api/inngest/route.ts` | ✅ | `serve({ client: inngest, functions })` |
| Zod | `package.json` `zod@^4.4.3` | ✅ | v4 API（与 v3 在所用 API 上兼容） |

---

## Test Strategy

### A. 单元测试（vitest，mock 外部依赖）

```
src/server/services/__tests__/quota.service.test.ts
├── returns allowed=true, used=0 when no jobs today
├── returns allowed=false, used=1 when at daily limit
├── ignores cancelled jobs in count
├── returns correct resetsAt (end of today)
└── correctly counts across midnight boundary

src/server/services/__tests__/project.service.test.ts
├── creates project with status=queued (from Schema default)
├── creates generationJob with jobType=storyboard, status=pending
├── sets requestId on generationJob correctly
├── uses transaction (atomic: both or neither created)
├── truncates title >50 chars with "..."
├── throws ConcurrentLimitError when active project exists
├── throws DuplicateRequestError on requestId unique violation
└── handles optional fields (null/undefined → omitted)
```

### B. tRPC 集成测试（createCaller）

```
src/server/routers/__tests__/project.router.test.ts
├── returns projectId + jobId on valid input
├── throws BAD_REQUEST on empty sourceText (Zod validation)
├── throws TOO_MANY_REQUESTS on quota exceeded
├── throws CONFLICT on duplicate requestId
├── admin bypasses quota check (success)
└── sends Inngest event with correct payload
```

### C. 手动集成验证

```bash
# 启动开发环境
pnpm dev          # Next.js dev server
pnpm inngest      # Inngest dev server

# curl 测试（需要先获取 session cookie）
# 1. 登录获取 cookie
# 2. 调用 API
curl -X POST http://localhost:3000/api/trpc/project.createAndGenerate \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"sourceText": "测试文本内容", "aspectRatio": "16:9", "requestId": "<uuid>"}'

# 3. 检查 Inngest UI http://localhost:8288
# 4. 检查 DB
# npx prisma studio
```

---

## Rollback Plan

| 范围 | 回滚操作 |
|------|---------|
| Prisma migration | `npx prisma migrate dev --name rollback_ep2_01`（手写回滚 SQL：Project.status default 改回 `"draft"`，删除 GenerationJob.requestId 列） |
| 代码 | `git revert <commit-hash>` |
| vitest 依赖 | 如果后续 Change 不需要可移除（但建议保留作为项目测试基础设施） |

**影响面**：如果已有其他代码依赖 `Project.status` 默认值为 `"draft"`，回滚后需一并检查。当前 Epic 2 之前无业务代码依赖此默认值。

---

## Risks

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| `pg_advisory_xact_lock` 不兼容 | 低 | PostgreSQL 标准功能，所有版本支持。如 pgBouncer 事务模式不支持，降级为简单串行（accept low-probability race） |
| Prisma `$queryRawUnsafe` SQL 注入 | 低 | `lockId` 由 `hashUserId()` 纯函数生成，无用户输入进入 SQL |
| Zod v4 行为变化 | 低 | 已逐 API 确认 v3↔v4 兼容性；如遇差异查阅 `node_modules/zod/README.md` |
| `requestId` unique 约束与已有数据冲突 | 无 | 当前数据库无 GenerationJob 数据（空表），migration 不会冲突 |
| vitest 与 Next.js 路径别名不兼容 | 低 | `vitest.config.ts` 显式配置 alias，与 tsconfig paths 一致 |
| `createCaller` 在 tRPC v11 中的导出方式 | 低 | tRPC v11 需要 `t.createCallerFactory(router)`，与 v10 不同；Step 5 中按 v11 文档实现 |

---

## Commit Strategy

建议拆分为 3-4 个 commit（每个独立可 review）：

```
Commit 1: chore(ep2-01): add vitest and test infrastructure
  - pnpm add -D vitest @vitest/coverage-v8
  - Create vitest.config.ts
  - Add test scripts to package.json
  - Create src/server/services/ and __tests__/ directories

Commit 2: feat(ep2-01): add requestId to GenerationJob + fix Project status default
  - Modify prisma/schema.prisma (Project.status default → "queued")
  - Add GenerationJob.requestId String? @unique
  - Generate Prisma migration

Commit 3: feat(ep2-01): implement quota.service and project.service
  - Add quota.service.ts with checkDailyQuota()
  - Add project.service.ts with createProject() + advisory lock
  - Add unit tests for both services

Commit 4: feat(ep2-01): implement project.createAndGenerate tRPC mutation
  - Add project.router.ts with createAndGenerate mutation
  - Add Inngest event helper to client.ts
  - Register projectRouter in _app.ts
  - Add tRPC integration tests
```

---

## PR Checklist

- [ ] `npx prisma migrate dev` 成功，无 pending migration
- [ ] `pnpm test` 全部测试通过（含单元测试 + 集成测试）
- [ ] `pnpm lint` 无新增错误
- [ ] `pnpm dev` 启动成功，Auth 系统正常工作
- [ ] `project.createAndGenerate` 在 tRPC panel 中可见且可调用
- [ ] 传入空 sourceText → 400 BAD_REQUEST
- [ ] 额度用完 → 429 QUOTA_EXCEEDED
- [ ] admin 不额度限制 → 200 成功
- [ ] 重复 requestId → 409 DUPLICATE_REQUEST
- [ ] 并发 active 任务 → 429 CONCURRENT_LIMIT
- [ ] Inngest Dev UI 可见 `video/generate.requested` 事件
- [ ] Project + GenerationJob 在 DB 中同时存在（事务原子性验证）
- [ ] 现有功能（Auth + tRPC）不受影响
