## Change: ep2-01-project-create-api

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-01-project-create-api` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~600 LOC） |
| **预估工期** | 1.5 天 |
| **前置 Change** | 无（Epic 1 基线已就绪） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |

---

## Goal

实现 `project.createAndGenerate` tRPC mutation：接收用户输入的文本和配置参数，校验后创建 Project + GenerationJob 记录，发送 Inngest 事件触发后续生成流水线。

---

## Scope

### ✅ 包含内容

1. **`project.createAndGenerate` tRPC mutation**（`protectedProcedure`）
   - Zod 输入校验（sourceText 长度、aspectRatio 枚举、voice 参数等）
   - 调用 `project.service.createProject()` 创建 Project + 初始 GenerationJob
   - 调用 `quota.service.checkDailyQuota()` 检查用户每日额度
   - 并发限制检查（同一用户同时只能有 1 个 active 生成任务）
   - `requestId` 幂等检查（前端生成 UUID，防止重复提交）
   - 发送 Inngest 事件 `video/generate.requested`
   - 返回 `{ projectId, jobId }`

2. **`project.service.ts` 业务层**
   - `createProject(input)`：在单个 Prisma 事务中创建 Project + GenerationJob
   - 生成默认 project title（取 sourceText 前 50 字符）
   - Project 初始状态：`queued`
   - GenerationJob 初始状态：`pending`，jobType: `storyboard`

3. **`quota.service.ts` 额度服务（初版）**
   - `checkDailyQuota(userId)`：查询用户当日 UsageRecord（resourceType=video_generation）
   - 默认每日免费额度：1 次/用户（常量 `DAILY_FREE_QUOTA = 1`）
   - Admin 用户跳过额度检查
   - 返回 `{ allowed: boolean, used: number, limit: number, resetsAt: Date }`

4. **Inngest 事件发送**
   - 定义事件类型常量 `EVENT_VIDEO_GENERATE_REQUESTED = "video/generate.requested"`
   - 在 `inngest/client.ts` 中导出 `sendGenerateRequested` 辅助函数
   - 事件 payload：`{ projectId, userId, jobId }`

5. **tRPC Router 注册**
   - 在 `_app.ts` 中注册 `projectRouter`

6. **单元测试**
   - `project.service.createProject` 单元测试（Mock Prisma + Inngest）
   - `quota.service.checkDailyQuota` 单元测试（额度未用完 / 已用完 / admin）

### ❌ 不包含内容

- ❌ 实际的 Inngest function 实现（`ep3-04` 才实现 generate-storyboard）
- ❌ 项目列表/详情 API（`ep2-02`）
- ❌ 前端创建页面（`ep2-04`）
- ❌ 删除/取消/重试 API（`ep2-05`）
- ❌ R2 上传（Epic 4）
- ❌ TTS 语音列表（Epic 4）
- ❌ UsageRecord 写入（仅检查，消费在 `ep7-02` 完成）
- ❌ 完整的错误码体系（`ep7-01`，本 Change 使用简单字符串错误码）

---

## Files Likely Affected

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/server/routers/project.ts` | **新建** | tRPC project router，含 `createAndGenerate` mutation |
| `src/server/services/project.service.ts` | **新建** | Project 创建业务逻辑 |
| `src/server/services/quota.service.ts` | **新建** | 每日额度检查逻辑 |
| `src/inngest/client.ts` | **修改** | 添加事件类型常量和 sendEvent 辅助函数 |
| `src/server/routers/_app.ts` | **修改** | 注册 projectRouter |
| `src/server/services/__tests__/project.service.test.ts` | **新建** | 单元测试 |
| `src/server/services/__tests__/quota.service.test.ts` | **新建** | 单元测试 |

**预计新增文件：5 个，修改文件：2 个**

---

## Dependencies

```
Epic 1 (基线)
├── DB Schema: Project, GenerationJob, UsageRecord 表已存在（prisma/schema.prisma）
├── tRPC: protectedProcedure 已就绪（src/server/trpc.ts）
├── Context: session + userId + isAdmin 可用（src/server/context.ts）
├── Inngest Client: inngest 实例已创建（src/inngest/client.ts）
└── Prisma: prisma client 已配置（src/lib/prisma.ts）
```

**前置 Change：无**（Epic 1 已完成）

---

## Technical Design

### 1. API 契约

```
POST /api/trpc/project.createAndGenerate
Headers: Cookie (better-auth session)

Request Body:
{
  "sourceText": string,        // 必填，1-5000 字符
  "audienceRole": string?,     // 可选：student/teacher/professional
  "audienceLevel": string?,    // 可选：beginner/intermediate/advanced
  "aspectRatio": "16:9" | "9:16" | "1:1",  // 默认 16:9
  "targetDurationSec": number?, // 可选：60/120/180/300
  "voiceProvider": string?,    // 可选：minimax
  "voiceId": string?,          // 可选
  "requestId": string          // 必填：UUID v4，幂等键
}

Response 200:
{
  "projectId": string,  // cuid
  "jobId": string       // cuid
}

Response 409 (幂等冲突):
{
  "code": "DUPLICATE_REQUEST",
  "message": "重复请求",
  "existingProjectId": string
}

Response 429 (额度超限):
{
  "code": "QUOTA_EXCEEDED",
  "message": "今日免费额度已用完，请明天再试",
  "resetsAt": string  // ISO 8601
}

Response 429 (并发限制):
{
  "code": "CONCURRENT_LIMIT",
  "message": "您有一个生成任务正在进行中，请等待完成"
}

Response 400 (参数校验失败):
{
  "code": "VALIDATION_ERROR",
  "message": string,
  "details": ZodError[]
}
```

### 2. Prisma 事务伪代码

```typescript
// project.service.ts
async function createProject(input: CreateProjectInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. 创建 Project
    const project = await tx.project.create({
      data: {
        userId,
        title: input.sourceText.slice(0, 50) + (input.sourceText.length > 50 ? "..." : ""),
        sourceText: input.sourceText,
        status: "queued",
        audienceRole: input.audienceRole,
        audienceLevel: input.audienceLevel,
        aspectRatio: input.aspectRatio ?? "16:9",
        targetDurationSec: input.targetDurationSec,
        voiceProvider: input.voiceProvider,
        voiceId: input.voiceId,
      },
    });

    // 2. 创建初始 GenerationJob（jobType=storyboard）
    const job = await tx.generationJob.create({
      data: {
        userId,
        projectId: project.id,
        jobType: "storyboard",
        status: "pending",
        aiProvider: "deepseek",
        inputParams: JSON.stringify({
          sourceText: input.sourceText,
          audienceRole: input.audienceRole,
          audienceLevel: input.audienceLevel,
          aspectRatio: input.aspectRatio,
          targetDurationSec: input.targetDurationSec,
        }),
      },
    });

    return { project, job };
  });
}
```

### 3. 额度检查伪代码

```typescript
// quota.service.ts
const DAILY_FREE_QUOTA = 1; // 可配置

async function checkDailyQuota(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 查询今日已用量（通过 GenerationJob 表计算，不依赖 UsageRecord）
  // 因为 UsageRecord 由后续 Change 完善，此处先查询 GenerationJob
  const todayCount = await prisma.generationJob.count({
    where: {
      userId,
      jobType: "storyboard",  // 每个项目的主要入口 job
      createdAt: { gte: todayStart, lte: todayEnd },
      status: { not: "cancelled" },  // 取消的不计
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

> **设计决策说明**：额度检查基于 `GenerationJob` 表而非 `UsageRecord` 表，因为：
> 1. `UsageRecord` 的完善写入在 `ep7-02` 才实现
> 2. `GenerationJob` 在 create 时即写入，可以立即反映当日用量
> 3. 后续 `ep7-02` 可重构为基于 UsageRecord，但 API 契约不变

### 4. 幂等检查伪代码

```typescript
// project.router.ts - createAndGenerate mutation
.input(z.object({
  // ...
  requestId: z.string().uuid(),
}))
.mutation(async ({ ctx, input }) => {
  // 幂等检查：通过 metadata 字段或单独查询
  // 方案：在 GenerationJob 的 inputParams JSON 中存储 requestId
  const existing = await prisma.generationJob.findFirst({
    where: {
      userId: ctx.userId,
      // 在 inputParams JSON 中搜索 requestId
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing && isRecent(existing.createdAt, 5 * 60 * 1000)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "重复请求",
      // 携带已有 projectId
    });
  }

  // 正常流程...
});
```

> **简化方案**：为避免 Prisma JSON 查询复杂性，在 Project 表增加 `requestId` 字段不是好的选择（需改 migration）。
> **最终方案**：利用 `GenerationJob.inputParams` JSON 字段存储 `requestId`，幂等检查时反序列化比对。
> 如果 ArNode 认为 JSON 字段查询过于复杂，可简化为：仅在内存层做简单去重（基于 userId + 时间窗口）。

### 5. 并发限制伪代码

```typescript
const activeStatuses = ["queued", "generating_storyboard", "storyboard_ready",
  "generating_audio", "calculating_timeline", "rendering"];

const activeCount = await prisma.project.count({
  where: {
    userId: ctx.userId,
    status: { in: activeStatuses },
  },
});

if (activeCount > 0) {
  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: "您有一个生成任务正在进行中，请等待完成",
  });
}
```

### 6. Inngest 事件发送

```typescript
// src/inngest/client.ts - 追加
export const EVENTS = {
  VIDEO_GENERATE_REQUESTED: "video/generate.requested",
} as const;

export async function sendGenerateRequested(params: {
  projectId: string;
  userId: string;
  jobId: string;
}) {
  await inngest.send({
    name: EVENTS.VIDEO_GENERATE_REQUESTED,
    data: params,
  });
}
```

### 7. tRPC Router 结构

```typescript
// src/server/routers/project.ts
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
// ...

const createInputSchema = z.object({
  sourceText: z.string()
    .min(1, "请输入文本内容")
    .max(5000, "文本长度不能超过 5000 字"),
  audienceRole: z.enum(["student", "teacher", "professional"]).optional(),
  audienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  targetDurationSec: z.number().int()
    .refine(v => [60, 120, 180, 300].includes(v), "不支持的时长选项")
    .optional(),
  voiceProvider: z.string().optional(),
  voiceId: z.string().optional(),
  requestId: z.string().uuid("无效的请求 ID"),
});

export const projectRouter = router({
  createAndGenerate: protectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }) => {
      // 1. 额度检查（admin 跳过）
      // 2. 并发检查
      // 3. 幂等检查
      // 4. 调用 project.service.createProject()
      // 5. 发送 Inngest 事件
      // 6. 返回 { projectId, jobId }
    }),
});
```

---

## Implementation Steps

按以下顺序逐步实现（每步提交一个 commit）：

### Step 1: quota.service.ts（基础，无依赖）
- 创建 `src/server/services/quota.service.ts`
- 实现 `checkDailyQuota(userId: string)` 和 admin 豁免逻辑
- 导出 `DAILY_FREE_QUOTA` 常量
- 编写单元测试

### Step 2: project.service.ts
- 创建 `src/server/services/project.service.ts`
- 实现 `createProject(input, userId)`（Prisma 事务）
- 编写单元测试

### Step 3: Inngest 事件辅助
- 修改 `src/inngest/client.ts`
- 添加事件类型常量
- 添加 `sendGenerateRequested()` 函数

### Step 4: project.router.ts + 注册
- 创建 `src/server/routers/project.ts`
- 实现完整的 `createAndGenerate` mutation
- 修改 `src/server/routers/_app.ts` 注册 router

### Step 5: 集成验证
- 启动 `next dev` + `inngest dev`
- 用 tRPC playground 或 curl 测试完整链路
- 验证 DB 写入 + Inngest 事件可见

---

## Acceptance Criteria

### AC1: 正常创建
**Given** 用户已登录，额度未用完，无活跃任务
**When** 调用 `project.createAndGenerate` 传入合法的 `sourceText`（500字）、`aspectRatio=16:9`、`requestId=<uuid>`
**Then**
- 返回 `{ projectId, jobId }`
- Project 记录：userId 正确、sourceText 完整保存、status=`queued`
- GenerationJob 记录：jobType=`storyboard`、status=`pending`、aiProvider=`deepseek`
- Inngest 收到 `video/generate.requested` 事件，payload 含 projectId + userId + jobId

### AC2: 空文本拒绝
**Given** 用户已登录
**When** 调用 `createAndGenerate` 传入 `sourceText=""` 
**Then** 返回 400 校验错误，提示"请输入文本内容"

### AC3: 超长文本拒绝
**Given** 用户已登录
**When** 调用 `createAndGenerate` 传入 5001 字符的 sourceText
**Then** 返回 400 校验错误，提示"文本长度不能超过 5000 字"

### AC4: 额度超限
**Given** 用户今日已创建 1 个生成项目
**When** 再次调用 `createAndGenerate`
**Then** 返回 429 `QUOTA_EXCEEDED`，提示"今日免费额度已用完"，携带 `resetsAt` 字段

### AC5: admin 无限额
**Given** admin 用户今日已创建 1 个生成项目
**When** 再次调用 `createAndGenerate`
**Then** 正常创建成功，不检查额度

### AC6: 并发限制
**Given** 用户有一个 project 状态为 `generating_storyboard`
**When** 再次调用 `createAndGenerate`
**Then** 返回 429 `CONCURRENT_LIMIT`，提示"您有一个生成任务正在进行中"

### AC7: 幂等保护
**Given** 用户刚在 5 分钟内使用相同 `requestId` 创建过项目
**When** 用相同 `requestId` 再次调用
**Then** 返回 409 `DUPLICATE_REQUEST`，携带已存在的 projectId

### AC8: 未登录拒绝
**Given** 用户未登录（无 session cookie）
**When** 调用 `createAndGenerate`
**Then** 返回 401 UNAUTHORIZED（由 `protectedProcedure` 自动处理）

### AC9: 无效 aspectRatio 拒绝
**Given** 用户已登录
**When** 调用 `createAndGenerate` 传入 `aspectRatio="4:3"`（不在枚举中）
**Then** 返回 400 校验错误

---

## Key Design Decisions

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | 额度检查数据源 | 基于 `GenerationJob` 计数 | `UsageRecord` 尚未完善写入逻辑（ep7-02），GenerationJob 在 create 时立即反映用量 |
| 2 | 幂等实现 | `requestId` 存入 `GenerationJob.inputParams` JSON | 避免改 DB schema。若复杂可降级为内存窗口去重 |
| 3 | 初始 jobType | `storyboard` | 整个流水线的第一步就是 Storyboard 生成 |
| 4 | Project 状态初始值 | `queued` | 与 Schema 定义一致，表示已入队等待 Inngest 处理 |
| 5 | title 生成 | 取 sourceText 前 50 字符 | 简单规则，后续可由用户编辑或 AI 生成 |
| 6 | 并发限制 | 同一用户最多 1 个 active | PRD 明确要求（v1.0.2） |

---

## Existing Code Integration Points

| 集成点 | 文件 | 使用方式 |
|--------|------|---------|
| Prisma client | `src/lib/prisma.ts` | `import prisma from "@/lib/prisma"` |
| tRPC procedures | `src/server/trpc.ts` | `protectedProcedure`, `router` |
| Context session | `src/server/context.ts` | `ctx.userId`, `ctx.session`, `ctx.isAdmin` |
| Inngest client | `src/inngest/client.ts` | `inngest.send()` |
| Zod validation | package.json `zod@^4.4.3` | Zod v4 API（注意与 v3 的差异） |

### ⚠️ Zod v4 注意事项

本项目使用 Zod v4（`^4.4.3`）。关键 API 变化：
- `z.enum()` 在 v4 中使用方式相同
- `z.string().uuid()` 可用
- `.default()` 行为与 v3 一致
- 如果遇到 API 差异，优先查阅 `node_modules/zod/README.md`

---

## Test Strategy

### 单元测试（vitest）

```
src/server/services/__tests__/quota.service.test.ts
├── returns allowed=true when no jobs today
├── returns allowed=false when at daily limit
├── ignores cancelled jobs
├── admin always returns allowed=true
└── returns correct resetsAt (end of today)

src/server/services/__tests__/project.service.test.ts
├── creates project with correct fields
├── creates generationJob with storyboard type
├── uses transaction (atomic: both or neither)
├── truncates title correctly (>50 chars)
└── handles optional fields (null/undefined)
```

### Mock 策略

- `prisma` → `vi.mock("@/lib/prisma")` 配合 `mockDeep<PrismaClient>()`
- `inngest.send` → `vi.mock("@/inngest/client")` 的 `sendGenerateRequested`
- 不需要 mock 数据库连接

### 集成测试（手动）

启动开发环境后：
```bash
# 1. 注册/登录获取 session
# 2. 用 curl 或 tRPC panel 调用 createAndGenerate
# 3. 验证 DB 写入
# 4. 验证 Inngest UI 可见事件
```

---

## Rollback Plan

由于无前置 Change 依赖，回滚方案简单：
- Git revert 本 Change 的 commit
- 不需要 DB migration 回滚（无 schema 变更）
- 不影响现有 Auth 和 tRPC 框架

---

## Risks

| 风险 | 级别 | 缓解 |
|------|------|------|
| Zod v4 API 文档不完善 | 低 | Zod v4 与 v3 在所用 API 上高度兼容；遇到问题查阅源码 |
| Prisma 事务在测试中 mock 困难 | 低 | 使用 `prisma.$transaction` 的交互式事务模式，mock 时 mock 回调执行 |
| Inngest 事件在本地未配置时发送失败 | 低 | 在 catch 中 warn 而非 throw，开发环境容错 |

---

## Commit Message Template

```
feat(ep2-01): implement project.createAndGenerate API

- Add project router with createAndGenerate protected mutation
- Add project service with Prisma transaction for Project + GenerationJob creation
- Add quota service with daily free tier check (1/day/user, admin bypass)
- Add Inngest event helper for video/generate.requested
- Add concurrent generation limit (1 active per user)
- Add requestId idempotency check (5-min window)
- Add unit tests for project service and quota service

Refs: IMPLEMENTATION_PLAN.md#ep2-01
```

---

## PR Checklist

- [ ] `project.createAndGenerate` mutation 可在 tRPC panel 中调用成功
- [ ] 传入空 sourceText 返回 400 校验错误
- [ ] 额度用完时返回 429 QUOTA_EXCEEDED
- [ ] admin 不额度限制
- [ ] 并发 active 任务时返回 429 CONCURRENT_LIMIT
- [ ] 5 分钟内相同 requestId 返回 409 DUPLICATE_REQUEST
- [ ] Project 和 GenerationJob 在事务中同时创建（不会单独出现）
- [ ] Inngest 事件 `video/generate.requested` 可见
- [ ] 单元测试全部通过
- [ ] 无 lint 错误
- [ ] 不影响现有 Auth 和 tRPC 正常功能
