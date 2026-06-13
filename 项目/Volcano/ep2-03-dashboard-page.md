## Change: ep2-03-dashboard-page

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-03-dashboard-page` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~800 LOC） |
| **预估工期** | 2 天 |
| **前置 Change** | `ep2-02-project-list-detail-api`（`project.list` / `project.getById` API 就绪） |
| **并行 Change** | `ep2-05-cancel-retry-delete-api`（Dashboard 中的删除/重试按钮依赖其 mutation 端点；本 Change 包含轻量 stub，ep2-05 增强） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |

---

## Goal

实现 Dashboard 页面 `/dashboard`：项目列表展示、状态筛选、分页加载、空状态引导、删除确认、重试触发，为用户提供项目管理的主界面。

---

## Scope

### ✅ 包含内容

1. **Dashboard 页面**（`src/app/(protected)/dashboard/page.tsx`）
   - 页面标题 + 创建项目入口按钮
   - 状态筛选 Tab 栏（全部 / 生成中 / 已完成 / 失败）
   - 项目卡片网格（响应式：1/2/3 列）
   - "加载更多"分页按钮（cursor-based）
   - 删除确认 Dialog（AlertDialog）
   - 重试按钮（仅失败项目可见）

2. **项目卡片组件**（`ProjectCard`）
   - 标题（单行截断）、状态 Badge、比例图标、目标时长
   - 相对时间（"3 分钟前"）
   - 当前 Job 状态（生成中 spinner / 已完成 / 失败）
   - 操作区：查看详情链接、删除按钮、重试按钮（条件渲染）

3. **状态筛选组件**（`ProjectFilters`）
   - 横向 Tab 栏：全部 → `undefined`，生成中 → `generating_*` 状态组，已完成 → `completed`，失败 → `failed`
   - 选中态指示 + 计数（可选）
   - 与 TanStack Query 的 `status` 参数联动

4. **空状态组件**（`EmptyState`）
   - 插图 + "还没有项目"文案 + "创建第一个项目" CTA 按钮

5. **加载骨架屏**（`ProjectCardSkeleton`）
   - 3 张卡片占位，pulse 动画

6. **轻量 mutation 端点**（Dashboard 自包含可用）
   - `project.delete` mutation：权限校验 → 软删除（标记 `status='deleted'`）→ 乐观更新列表
   - `generation.retry` mutation：权限校验 → 创建新 GenerationJob → 发送 Inngest 事件 → 刷新列表
   - 注：ep2-05 将增强为完整的级联删除 / resume 重试 / 取消检查点

7. **首页路由逻辑更新**
   - `src/app/page.tsx`：已登录用户自动重定向到 `/dashboard`，未登录用户展示 Landing 首屏
   - Landing 首屏内容（标题、描述、CTA 按钮）作为占位实现，完整 Landing 页在 `ep6-04` 统一

### ❌ 不包含内容

- ❌ 创建项目页面（`ep2-04-create-project-page`）
- ❌ 项目详情页（`ep2-04` 或独立 Change）
- ❌ 完整的级联删除 / resume 重试 / 取消 API（`ep2-05`）
- ❌ 缩略图实际图片（依赖 `ep5-07` renderStill）
- ❌ 项目编辑功能（Out of Scope）
- ❌ 全文搜索 / 排序切换
- ❌ 完整的 Landing 首页设计（`ep6-04`）
- ❌ 全局导航栏重构（`ep6-04`）

---

## Files Likely Affected

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/(protected)/dashboard/page.tsx` | **新建** | Dashboard 主页面（Client Component） |
| `src/components/project/ProjectCard.tsx` | **新建** | 项目卡片组件 |
| `src/components/project/ProjectCardSkeleton.tsx` | **新建** | 卡片骨架屏 |
| `src/components/project/ProjectFilters.tsx` | **新建** | 状态筛选 Tab 栏 |
| `src/components/project/EmptyState.tsx` | **新建** | 空状态引导组件 |
| `src/components/project/DeleteProjectDialog.tsx` | **新建** | 删除确认对话框 |
| `src/components/project/index.ts` | **新建** | 组件 barrel export |
| `src/app/page.tsx` | **修改** | 登录后重定向 `/dashboard`，未登录展示 Landing 占位 |
| `src/server/routers/project.ts` | **修改** | 追加 `delete`、`retry` mutation（轻量实现） |
| `src/server/services/project.service.ts` | **修改** | 追加 `deleteProject`、`retryGeneration`（轻量实现） |

**预计新增文件：7 个，修改文件：3 个**

---

## Dependencies

```
ep2-02 (已完成)
├── project.list API（cursor 分页 + status 筛选）
├── project.getById API（详情查询）
├── tRPC client 已就绪（trpc.project.list.useQuery / useInfiniteQuery）
├── QueryProvider 已注册（root layout）
├── (protected) layout 已存在（含 AuthStatus guard）
├── 56 个 shadcn/ui 组件可用（Card, Badge, Button, AlertDialog, Skeleton 等）
└── better-auth session（useSession, session.user.id）
```

**前置 Change：`ep2-02-project-list-detail-api`**（`project.list` 端点已就绪）

**并行 Change：`ep2-05-cancel-retry-delete-api`**（本 Change 含轻量 delete/retry stub，ep2-05 增强为完整逻辑；若 ep2-05 先完成，本 Change 可直接调用其完整端点）

---

## Pre-flight Checklist（实现前确认）

在开始写前端代码之前，必须确认以下基线依赖就绪：

| 检查项 | 状态 | 验证方式 |
|--------|------|---------|
| `project.list` API 可正常调用 | ⬜ 待验证 | tRPC panel 或 curl 调用返回分页数据 |
| `project.getById` API 可正常调用 | ⬜ 待验证 | tRPC panel 或 curl 调用返回项目详情 |
| `QueryProvider` 已包裹根布局 | ✅ | `src/app/layout.tsx` 第 34-36 行 |
| `trpc` client 已导出 | ✅ | `src/lib/trpc/client.ts` 第 7 行 |
| `(protected)` 路由组已存在 | ✅ | `src/app/(protected)/layout.tsx` |
| `useSession()` 可用 | ✅ | `src/lib/auth-client` 导出 |
| shadcn/ui Card 组件可用 | ✅ | `src/components/ui/card.tsx` |
| shadcn/ui Badge 组件可用 | ✅ | `src/components/ui/badge.tsx` |
| shadcn/ui AlertDialog 组件可用 | ✅ | `src/components/ui/alert-dialog.tsx` |
| shadcn/ui Skeleton 组件可用 | ✅ | `src/components/ui/skeleton.tsx` |
| `date-fns` 已安装 | ✅ | `package.json` 第 36 行 `"date-fns": "^4.4.0"` |
| `lucide-react` 已安装 | ✅ | `package.json` 第 40 行（图标库） |
| `ep2-01` 测试仍然通过 | ⬜ 待验证 | `npm test` — 确认无回归 |
| `ep2-02` 测试已通过 | ⬜ 待验证 | `npm test` — 确认 ep2-02 测试通过 |

---

## Technical Design

### 0. 整体设计原则

本 Change 是第一个前端页面 Change，建立了 **Dashboard 前端组件体系**。核心原则：

- **Client Component 为主**：Dashboard 页面需要交互（筛选、分页、删除确认），使用 `"use client"` + TanStack Query
- **使用 `useInfiniteQuery`**：匹配后端的 cursor-based 分页语义，天然支持"加载更多"
- **乐观更新**：删除操作使用乐观更新（先移出列表再确认服务端），提升体感速度
- **条件渲染**：重试按钮仅对 `status === 'failed'` 的项目可见
- **复合状态**：一个筛选条件变化 → 重置分页 + 重新请求首页
- **首屏路由**：`/` 路由根据登录状态分流：已登录 → `/dashboard`，未登录 → Landing 首屏

### 1. 路由设计

```
src/app/
├── page.tsx                          # "/" → 登录态检测 → 重定向或 Landing
├── layout.tsx                        # Root layout（已有 SessionProvider + QueryProvider）
├── (auth)/                           # 认证页面（已有）
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── ...
└── (protected)/                      # 需登录
    ├── layout.tsx                    # 已有（navbar + AuthStatus）
    ├── profile/page.tsx              # 已有
    └── dashboard/
        └── page.tsx                  # 🆕 Dashboard 主页面
```

**首页分流逻辑（`src/app/page.tsx` 修改）：**

```typescript
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && !isPending) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  // isPending → 全屏 loading spinner
  // 未登录 → Landing 首屏（标题 + 描述 + 登录/注册 CTA）
}
```

### 2. 数据流

```
Dashboard (Client Component)
│
├─ trpc.project.list.useInfiniteQuery({ pageSize: 12, status })
│   ├─ data.pages[].items → ProjectCard[]
│   ├─ data.pages[].nextCursor → hasNextPage
│   └─ fetchNextPage() → "加载更多"按钮
│
├─ trpc.project.delete.useMutation()
│   ├─ onMutate → 乐观移除卡片
│   ├─ onSuccess → toast.success("项目已删除")
│   └─ onError → 恢复卡片 + toast.error
│
├─ trpc.generation.retry.useMutation()
│   ├─ onSuccess → toast.success("已重新开始生成") + 刷新列表
│   └─ onError → toast.error
│
└─ useState<StatusFilter>("all") → 筛选 Tab 状态
    └─ 变化时 → 重置 useInfiniteQuery（新 status 参数）
```

### 3. 状态筛选映射

| Tab | 标签文案 | API `status` 参数 | 说明 |
|-----|---------|------------------|------|
| 全部 | `"全部"` | `undefined`（不传） | 查询所有项目 |
| 生成中 | `"生成中"` | 客户端过滤 | `status` 为 `queued` / `generating_storyboard` / `generating_audio` / `calculating_timeline` / `rendering` 的项目 |
| 已完成 | `"已完成"` | `"completed"` | 仅 completed |
| 失败 | `"失败"` | `"failed"` | 仅 failed |

**筛选策略选择：**

| 策略 | 优点 | 缺点 | 采用 |
|------|------|------|------|
| 全部传 `status` 给 API | 精确，与后端一致 | "生成中"是 5 个状态的组合，单次 API 只能传一个 status | ❌ |
| 全部拉取所有数据，客户端过滤 | 切换 Tab 无请求 | 数据量大时浪费 | ❌ |
| **混合**：全部/已完成/失败 → API `status` 过滤；生成中 → 拉全部 + 客户端过滤 | 平衡请求和灵活性 | "生成中" Tab 需拉全量数据 | ✅ |

**"生成中"筛选的客户端过滤函数：**

```typescript
const IN_PROGRESS_STATUSES = [
  "queued",
  "generating_storyboard",
  "generating_audio",
  "calculating_timeline",
  "rendering",
] as const;

const isInProgress = (status: string) =>
  IN_PROGRESS_STATUSES.includes(status as typeof IN_PROGRESS_STATUSES[number]);
```

> **设计理由：** "生成中"涵盖 5 种 backend 状态，API 的 `status` 参数只能传单个值。如果后续需要更精确的后端筛选，可以在 `ep2-05` 或 `ep7-01` 中扩展 API 支持 `status: string[]` 或 `statusGroup` 参数。当前混合策略简单实用，Dashboard 初期项目数量少，全量数据客户端过滤无性能问题。

### 4. 分页交互

```
┌───────────────────────────────────────┐
│  [项目卡片 1]  [项目卡片 2]  [项目卡片 3] │
│  [项目卡片 4]  [项目卡片 5]  [项目卡片 6] │
│  ...                                  │
│  [项目卡片 n]                          │
│                                       │
│         [ 加载更多 ▼ ]                 │
│         显示 12 / 42 个项目            │
└───────────────────────────────────────┘
```

- 使用 `useInfiniteQuery` + `fetchNextPage`
- 每页 12 个项目
- `hasNextPage` 根据 `lastPage.nextCursor !== null` 判断
- "加载更多"按钮触发 `fetchNextPage()`
- `isFetchingNextPage` 时按钮显示 spinner
- `hasNextPage === false` 时按钮消失，显示"已显示全部 N 个项目"

### 5. 项目卡片设计

#### 5.1 布局

```
┌──────────────────────┐
│  ┌─────────────────┐ │
│  │  比例图标 16:9  │ │  ← aspectRatio icon
│  └─────────────────┘ │
│                       │
│  深入理解Transformer  │  ← title（单行截断，font-semibold）
│  架构                 │
│                       │
│  [completed] [16:9]  │  ← status Badge + 比例标签
│                       │
│  目标时长: 2 分钟     │  ← targetDurationSec 格式化
│                       │
│  3 分钟前             │  ← relative time（text-muted-foreground）
│                       │
│  ───────────────────  │
│                       │
│  [查看] [重试] [删除] │  ← 操作按钮区
└──────────────────────┘
```

#### 5.2 状态 Badge 配色（使用 shadcn Badge variant）

| Status | Badge variant | 显示文案 | 附加 |
|--------|--------------|---------|------|
| `queued` | `secondary` | 排队中 | — |
| `generating_storyboard` | `secondary` | 生成分镜中 | spinner 动画 |
| `storyboard_ready` | `default` | 分镜就绪 | — |
| `generating_audio` | `secondary` | 生成语音中 | spinner 动画 |
| `calculating_timeline` | `secondary` | 计算时间轴 | spinner 动画 |
| `rendering` | `secondary` | 渲染中 | spinner 动画 |
| `completed` | `success`（自定义绿色） | 已完成 | ✓ 图标 |
| `failed` | `destructive` | 失败 | ✗ 图标 |
| `cancelled` | `outline` | 已取消 | — |

> **自定义 Badge variant：** shadcn Badge 默认有 `default / secondary / destructive / outline`。`success` variant 需要扩展 Badge 组件的 `badgeVariants`。或者使用 `default` + 绿色文字/边框的组合样式。

**简化方案：** 为避免修改全局 Badge 组件影响其他页面，在 `ProjectCard` 内部使用自定义 className 控制 Badge 颜色，不新增 variant。

```
status === "completed" → "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
status === "failed"    → "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
status === "cancelled" → "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
其他                   → shadcn Badge variant="secondary"（默认灰）
```

#### 5.3 相对时间格式化

使用 `date-fns` 的 `formatDistanceToNow`：

```typescript
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

formatDistanceToNow(new Date(project.createdAt), {
  addSuffix: true,
  locale: zhCN,
});
// → "约 3 分钟前" / "1 天前" / "5 天前"
```

#### 5.4 操作按钮逻辑

| 按钮 | 可见条件 | 行为 |
|------|---------|------|
| 查看 | 始终可见 | `<Link href={/projects/${projectId}/progress}>` |
| 重试 | `status === 'failed'` 或 `status === 'cancelled'` | 点击 → `retryGeneration({ projectId })` |
| 删除 | 始终可见 | 点击 → 打开 `DeleteProjectDialog` |

### 6. 删除确认 Dialog

```
┌─────────────────────────────────┐
│  确认删除                        │
│                                 │
│  确定要删除项目"深入理解          │
│  Transformer架构"吗？            │
│                                 │
│  此操作不可撤销，项目相关的       │
│  所有数据将被永久删除。           │
│                                 │
│  [取消]              [确认删除]  │
│       (outline)    (destructive) │
└─────────────────────────────────┘
```

- 使用 shadcn `AlertDialog` 组件
- 描述文本包含项目标题
- 确认按钮为 `variant="destructive"`
- 确认后调用 `deleteProject` mutation
- 乐观更新：`onMutate` 时从当前页数据中移除该卡片
- 失败回滚：`onError` 时恢复数据 + toast 错误提示

### 7. 空状态

```
┌───────────────────────────────────┐
│                                   │
│          [插图/图标]               │
│                                   │
│        还没有项目                  │
│    创建你的第一个AI微课视频吧       │
│                                   │
│    [✦ 创建项目]  ← CTA 按钮        │
│                                   │
└───────────────────────────────────┘
```

- 图标：使用 `lucide-react` 的 `FileVideo` 或 `Clapperboard` 图标
- CTA 按钮：`<Link href="/create">`，使用 `Button` + 主色

### 8. 加载骨架屏

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │  ████████████  │  │  │  │  ████████████  │  │  │  │  ████████████  │  │
│  └────────────────┘  │  │  └────────────────┘  │  │  └────────────────┘  │
│                       │  │                       │  │                       │
│  ██████████████████   │  │  ██████████████████   │  │  ██████████████████   │
│                       │  │                       │  │                       │
│  [██████] [████]     │  │  [██████] [████]     │  │  [██████] [████]     │
│                       │  │                       │  │                       │
│  ██████████           │  │  ██████████           │  │  ██████████           │
│                       │  │                       │  │                       │
│  ████████████         │  │  ████████████         │  │  ████████████         │
│                       │  │                       │  │                       │
│  ───────────────────  │  │  ───────────────────  │  │  ───────────────────  │
│                       │  │                       │  │                       │
│  [████] [████] [████] │  │  [████] [████] [████] │  │  [████] [████] [████] │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

- 3 张骨架卡片（`ProjectCardSkeleton`），与真实卡片等宽等结构
- 使用 shadcn `Skeleton` 组件 + `animate-pulse`
- 响应式：1/2/3 列与真实卡片一致

### 9. 错误状态

```
┌───────────────────────────────────┐
│                                   │
│          [AlertCircle 图标]        │
│                                   │
│       加载项目列表失败              │
│    请检查网络连接后重试             │
│                                   │
│    [重新加载]  ← 重试按钮           │
│                                   │
└───────────────────────────────────┘
```

- 当 `useInfiniteQuery` 的 `isError` 为 true 时显示
- 使用 `error.message` 作为错误详情（若为网络错误则显示通用文案）
- "重新加载"按钮调用 `refetch()`

### 10. 响应式布局

| 断点 | 列数 | 卡片间距 |
|------|------|---------|
| `< 640px` (mobile) | 1 列 | `gap-4` |
| `640px–1024px` (tablet) | 2 列 | `gap-6` |
| `> 1024px` (desktop) | 3 列 | `gap-6` |

使用 Tailwind grid：`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`

### 11. 首页路由（Landing vs Dashboard）

用户要求：**未登录 → 首屏展示，登录后 → Dashboard**。

```
/page.tsx 渲染逻辑：

┌─ useSession() ─┐
│                 │
│  isPending?     │──Yes──▶ 全屏 Loading Spinner
│                 │
│  session exists?│──Yes──▶ router.replace("/dashboard")
│                 │
│  (unauthenticated)     ▶ Landing 首屏
└─────────────────┘
```

**Landing 首屏内容（ep2-03 中的占位版本）：**

- 标题：`Volcano AI 微课视频`
- 副标题：`将文本一键转化为专业微课视频`
- 两个 CTA 按钮：`开始使用`（→ `/login`）、`了解更多`（→ `#features`）
- 背景：渐变色 + 装饰元素
- ⚠️ 完整 Landing 页设计（动画、Feature 区、Footer）在 `ep6-04-global-layout-nav` 中实现

### 12. 轻量 delete / retry mutation（本 Change 实现）

#### 12.1 `project.delete`

```
tRPC: project.delete
Input: { projectId: string }

逻辑（轻量版）：
1. protectedProcedure（需登录）
2. 查询 Project → 权限校验（userId === ctx.userId || ctx.isAdmin）
3. 更新 Project.status = "deleted"（软删除，不级联清理）
4. 返回 { success: true }

注：ep2-05 增强为：
  - 级联标记所有关联 Asset 为 deleted
  - 删除 R2 文件
  - 物理删除或归档 DB 记录
```

#### 12.2 `generation.retry`

```
tRPC: generation.retry
Input: { projectId: string }

逻辑（轻量版）：
1. protectedProcedure（需登录）
2. 查询 Project → 权限校验
3. 更新 Project.status = "queued"
4. 创建新的 GenerationJob（jobType="storyboard", status="pending"）
5. 发送 Inngest 事件 "video/generate.requested"
6. 返回 { jobId: string }

注：ep2-05 增强为：
  - resume 模式（检查已有 Storyboard/Audio → 跳过已完成步骤）
  - 取消检查点集成
  - 并发限制校验
```

### 13. 组件目录结构

```
src/components/project/
├── index.ts                    # barrel export
├── ProjectCard.tsx             # 项目卡片
├── ProjectCardSkeleton.tsx     # 卡片骨架屏
├── ProjectFilters.tsx          # 状态筛选 Tab
├── EmptyState.tsx              # 空状态
└── DeleteProjectDialog.tsx     # 删除确认对话框
```

每个组件独立文件，通过 `index.ts` 统一导出。

---

## Implementation Steps

### Step 0: 基线验证（前置条件）

- 运行 `npm test` 确认 ep2-01 + ep2-02 所有测试通过
- 启动 `npm run dev`，在 tRPC panel 验证 `project.list` 可正常调用
- 确认 `src/app/(protected)/layout.tsx` 的 AuthStatus 能正确拦截未登录用户

### Step 1: 实现轻量 delete / retry mutation 端点

- 在 `src/server/services/project.service.ts` 追加：
  - `deleteProject(projectId, userId, isAdmin)`：权限校验 + 软删除
  - `retryGeneration(projectId, userId, isAdmin)`：重建 Job + 发送 Inngest 事件
  - 新增 `ProjectDeleteDeniedError`（权限校验失败）
- 在 `src/server/routers/project.ts` 追加：
  - `delete: protectedProcedure.input(z.object({ projectId: z.string().min(1) })).mutation(...)`
  - `retry: protectedProcedure.input(z.object({ projectId: z.string().min(1) })).mutation(...)`
  - 错误映射
- 编写 router 集成测试（delete/retry 各 3 个用例）
- 运行 `npm test` 确认通过

### Step 2: 实现组件

按顺序实现以下组件（每个组件完成后写对应单元/集成测试）：

1. **`ProjectCardSkeleton.tsx`**
   - 使用 shadcn Skeleton 组件
   - 宽度与真实卡片一致
   - 响应式（跟随父 grid 自适应）

2. **`EmptyState.tsx`**
   - Props: `title`, `description`, `actionLabel`, `actionHref`
   - 使用 `lucide-react` 图标

3. **`ProjectCard.tsx`**
   - Props: `project: ProjectListItem`
   - 集成 status badge、相对时间、操作按钮
   - 使用 `date-fns/formatDistanceToNow` + `zhCN` locale
   - 重试按钮条件渲染
   - 集成 `DeleteProjectDialog`

4. **`DeleteProjectDialog.tsx`**
   - 使用 shadcn `AlertDialog`
   - Props: `projectTitle`, `projectId`, `open`, `onOpenChange`
   - 内部调用 `trpc.project.delete.useMutation()`
   - onSuccess → toast + onOpenChange(false)

5. **`ProjectFilters.tsx`**
   - Props: `value: StatusFilter`, `onChange: (v: StatusFilter) => void`
   - 4 个 Tab、横向排列

### Step 3: 实现 Dashboard 页面

- 创建 `src/app/(protected)/dashboard/page.tsx`
- **状态管理：**
  ```typescript
  type StatusFilter = "all" | "in_progress" | "completed" | "failed";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  ```
- **数据获取：**
  ```typescript
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.project.list.useInfiniteQuery(
    {
      pageSize: 12,
      status: statusFilter === "in_progress"
        ? undefined  // 拉全部 + 客户端过滤
        : statusFilter === "all"
        ? undefined
        : statusFilter, // "completed" | "failed" 直接传给 API
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }
  );
  ```
- **客户端过滤（仅"生成中" Tab）：**
  ```typescript
  const allItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const filteredItems = useMemo(() => {
    if (statusFilter !== "in_progress") return allItems;
    return allItems.filter((item) => IN_PROGRESS_STATUSES.includes(item.status));
  }, [allItems, statusFilter]);
  ```
- **渲染逻辑：**
  ```
  isLoading        → <ProjectCardSkeleton /> × 3
  isError          → <ErrorState message={error.message} onRetry={refetch} />
  filteredItems=[] → <EmptyState />
  正常              → grid + <ProjectCard /> + "加载更多"按钮
  ```
- **筛选切换时重置查询：** 使用 `useEffect` 或 TanStack Query 的 `queryKey` 包含 `statusFilter`

### Step 4: 修改首页路由

- 修改 `src/app/page.tsx`：
  - `useSession()` 获取登录态
  - `isPending` → 全屏 Loading Spinner
  - `session` 存在 → `router.replace("/dashboard")`
  - 未登录 → 展示 Landing 首屏（占位版）
- Landing 首屏内容：
  - 大标题 + 副标题 + 两个 CTA 按钮
  - 居中布局、渐变背景

### Step 5: 集成验证

- `npm run dev` 启动
- 未登录访问 `/` → 看到 Landing 首屏
- 登录后自动跳转 `/dashboard`
- 创建 3 个测试项目（通过 tRPC panel 调用 `project.createAndGenerate`）
- Dashboard 显示 3 张卡片
- 切换筛选 Tab：全部(3) → 已完成 → 失败
- 点击"加载更多"（若项目数 > 12）
- 点击删除 → AlertDialog → 确认 → 卡片消失 + toast
- 点击重试 → toast + 状态更新
- 删除所有项目 → 看到空状态
- `npm run lint` 无新增错误
- `npm test` 全部通过

---

## Acceptance Criteria

### AC1: 页面访问与鉴权
**Given** 用户已登录
**When** 访问 `/dashboard`
**Then** 显示 Dashboard 页面，标题为"我的项目"

### AC2: 未登录重定向
**Given** 用户未登录
**When** 访问 `/`（首页）
**Then** 显示 Landing 首屏（标题 + CTA 按钮）
**And** 不显示 Dashboard

### AC3: 登录后自动跳转
**Given** 用户已登录
**When** 访问 `/`（首页）
**Then** 自动重定向到 `/dashboard`

### AC4: 项目列表—正常展示
**Given** 用户有 3 个项目（含 completed、failed、queued 各 1 个）
**When** 进入 Dashboard，筛选=全部
**Then** 显示 3 张项目卡片，按 `createdAt` 降序排列
**And** 每张卡片显示：标题、状态 Badge、比例、时长、相对时间、操作按钮

### AC5: 状态筛选—全部
**Given** 用户有 3 个项目
**When** 选择筛选 Tab "全部"
**Then** 显示 3 张卡片

### AC6: 状态筛选—已完成
**Given** 用户有 3 个项目（1 completed, 1 failed, 1 queued）
**When** 选择筛选 Tab "已完成"
**Then** 仅显示 1 张卡片（status=completed）

### AC7: 状态筛选—生成中
**Given** 用户有 queued 和 generating_storyboard 项目
**When** 选择筛选 Tab "生成中"
**Then** 显示所有生成中状态的项目（queued/generating_storyboard/generating_audio/calculating_timeline/rendering）

### AC8: 状态筛选—失败
**Given** 用户有 1 个 failed 项目
**When** 选择筛选 Tab "失败"
**Then** 仅显示 1 张卡片，且重试按钮可见

### AC9: 状态 Badge 正确
**Given** 项目 status=completed
**When** 查看项目卡片
**Then** 状态 Badge 显示"已完成"，颜色为绿色

### AC10: 相对时间
**Given** 项目 5 分钟前创建
**When** 查看项目卡片
**Then** 显示"5 分钟前"（使用中文 locale）

### AC11: 分页—加载更多
**Given** 用户有 25 个项目
**When** 进入 Dashboard（pageSize=12）
**Then** 显示前 12 张卡片 + "加载更多"按钮
**When** 点击"加载更多"
**Then** 追加显示第 13-24 张卡片
**When** 再次点击
**Then** 追加显示第 25 张卡片，"加载更多"按钮消失
**And** 显示"已显示全部 25 个项目"

### AC12: 删除—确认流程
**Given** 用户有项目 X
**When** 点击项目 X 的删除按钮
**Then** 弹出确认对话框（含项目标题 + 不可撤销提示）
**When** 点击"确认删除"
**Then** 对话框关闭，卡片从列表消失，toast 显示"项目已删除"

### AC13: 删除—取消
**Given** 删除确认对话框已打开
**When** 点击"取消"
**Then** 对话框关闭，卡片仍在列表中

### AC14: 重试—失败项目
**Given** 项目 status=failed
**When** 点击重试按钮
**Then** toast 显示"已重新开始生成"
**And** 项目 status 变为 queued（刷新后）

### AC15: 重试按钮—非失败项目
**Given** 项目 status=completed
**When** 查看项目卡片
**Then** 重试按钮不可见

### AC16: 空状态
**Given** 用户没有任何项目
**When** 进入 Dashboard
**Then** 显示空状态：图标 + "还没有项目" + "创建第一个项目"按钮
**And** 点击按钮跳转到 `/create`

### AC17: 加载状态
**Given** 网络较慢，数据正在加载
**When** 进入 Dashboard
**Then** 显示 3 张骨架屏卡片（pulse 动画）

### AC18: 错误状态
**Given** API 请求失败（网络错误 / 500）
**When** 进入 Dashboard
**Then** 显示错误提示"加载项目列表失败" + "重新加载"按钮
**When** 点击"重新加载"
**Then** 重新发起请求

### AC19: 数据隔离
**Given** 用户 A 有 2 个项目，用户 B 有 1 个项目
**When** 用户 A 进入 Dashboard
**Then** 仅显示用户 A 的 2 个项目（由 API 层保证）

### AC20: 响应式布局
**Given** 浏览器窗口宽度 375px（手机）
**When** 查看 Dashboard
**Then** 项目卡片单列排列
**Given** 浏览器窗口宽度 1200px（桌面）
**When** 查看 Dashboard
**Then** 项目卡片 3 列排列

---

## Key Design Decisions

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | **分页模式** | "加载更多"按钮（非无限滚动） | 比无限滚动更可控；用户可感知总量；`useInfiniteQuery` API 直接支持 |
| 2 | **筛选策略** | 混合（部分服务端 + 部分客户端） | "生成中"涵盖 5 种后端状态，API 的单值 `status` 无法直接表达；Dashboard 初期数据量少，客户端过滤可行 |
| 3 | **状态 Badge 样式** | 组件内自定义 className（不扩展全局 Badge variant） | 避免全局变更影响其他页面；状态颜色是 Dashboard 专有 |
| 4 | **删除实现** | 轻量软删除（本 Change）+ 完整级联（ep2-05） | Dashboard 可独立交付；ep2-05 增强后无需修改前端 |
| 5 | **重试实现** | 轻量 retry（本 Change）+ resume 模式（ep2-05） | 同上 |
| 6 | **首页路由** | `page.tsx` 内联登录态检测 + 条件渲染（不使用 middleware） | 符合现有代码风格（page.tsx 已是 client component）；middleware 方案在 ep6-04 统一评估 |
| 7 | **乐观更新** | 删除使用乐观更新 | 删除操作体感明显（卡片消失），提升 UX；QueryClient 的 `setQueryData` 天然支持 |
| 8 | **组件拆分** | 每个组件独立文件（ProjectCard / ProjectFilters / EmptyState / Skeleton / DeleteDialog） | 单一职责，便于独立测试和后续复用 |
| 9 | **时间格式化** | `date-fns` + `zhCN` locale | 项目已安装 `date-fns@4.4.0`，`formatDistanceToNow` 自动处理"x 分钟前"、"昨天"、"3 天前"等 |
| 10 | **筛选切换时** | 重置到第一页（不使用缓存） | 筛选条件变化后，旧的 cursor 可能指向不存在的页；重置保证数据一致性 |
| 11 | **Landing 页范围** | 仅占位实现（标题 + CTA），完整设计在 ep6-04 | 避免 ep2-03 范围膨胀；Landing 与全局导航栏一同交付更合理 |
| 12 | **delete/retry mutation** | 注册在 `project` router（`project.delete` / `project.retry`）而非独立 router | 与 `createAndGenerate` 共用同一 router；`_app.ts` 无需修改 |

---

## Existing Code Integration Points

| 集成点 | 文件 | 状态 | 使用方式 |
|--------|------|------|---------|
| Root Layout | `src/app/layout.tsx` | ✅ | QueryProvider + SessionProvider 已包裹 |
| Protected Layout | `src/app/(protected)/layout.tsx` | ✅ | Dashboard 直接放入 `(protected)` 路由组 |
| tRPC Client | `src/lib/trpc/client.ts` | ✅ | `trpc.project.list.useInfiniteQuery()` 等 |
| Query Client | `src/lib/query-client.ts` | ✅ | staleTime=60s，refetchOnWindowFocus=false |
| Auth Session | `useSession()` | ✅ | 首页路由分流 |
| shadcn Card | `src/components/ui/card.tsx` | ✅ | `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| shadcn Badge | `src/components/ui/badge.tsx` | ✅ | 状态 Badge |
| shadcn AlertDialog | `src/components/ui/alert-dialog.tsx` | ✅ | 删除确认 |
| shadcn Button | `src/components/ui/button.tsx` | ✅ | CTA / 操作按钮 |
| shadcn Skeleton | `src/components/ui/skeleton.tsx` | ✅ | 骨架屏 |
| Sonner Toast | `sonner` (root layout 已有 Toaster) | ✅ | `toast.success()` / `toast.error()` |
| project Router | `src/server/routers/project.ts` | ✅ 追加 | 新增 `delete`、`retry` mutation |
| project Service | `src/server/services/project.service.ts` | ✅ 追加 | 新增 `deleteProject`、`retryGeneration` |
| Inngest Client | `src/inngest/client.ts` | ✅ | retry 时发送事件 |

**不需要修改的文件：**
- `_app.ts`：projectRouter 已注册，新 mutation 自动可用
- `layout.tsx`（root）：已有 QueryProvider + SessionProvider
- `prisma/schema.prisma`：Schema 无需变更
- `src/lib/trpc/client.ts`：tRPC client 无需变更

---

## Test Strategy

### A. tRPC Mutation 集成测试（createCaller）

```
src/server/routers/__tests__/project.router.test.ts（追加）
├── project.delete
│   ├── owner 可删除自己的项目（返回 success）
│   ├── 非 owner 返回 FORBIDDEN
│   └── 不存在的 projectId 返回 NOT_FOUND
└── project.retry
    ├── owner 可重试自己的项目（返回 jobId）
    ├── 非 owner 返回 FORBIDDEN
    └── 不存在的 projectId 返回 NOT_FOUND
```

### B. 前端组件测试（vitest + @testing-library/react）

```
src/components/project/__tests__/
├── ProjectCard.test.tsx
│   ├── 渲染标题、状态 Badge、时长、相对时间
│   ├── completed 项目不显示重试按钮
│   ├── failed 项目显示重试按钮
│   └── 删除按钮点击打开 Dialog
├── ProjectFilters.test.tsx
│   ├── 4 个 Tab 全部渲染
│   ├── 点击 Tab 触发 onChange
│   └── 当前选中 Tab 有 active 样式
├── EmptyState.test.tsx
│   └── 渲染图标、文案、CTA 按钮（含 href）
└── DeleteProjectDialog.test.tsx
    ├── 渲染项目标题在描述中
    ├── 取消按钮关闭对话框
    └── 确认按钮触发 mutation
```

### C. 手动集成验证

```bash
# 1. 启动开发环境
npm run dev

# 2. 访问 http://localhost:3000
#    - 未登录 → 看到 Landing
#    - 登录 → 自动跳转 /dashboard

# 3. 创建测试项目（通过 tRPC panel 或 curl）
curl -X POST http://localhost:3000/api/trpc/project.createAndGenerate \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"title":"测试项目","sourceText":"测试内容","aspectRatio":"16:9","targetDurationSec":120}'

# 4. 刷新 /dashboard 验证卡片出现

# 5. 验证筛选 Tab 切换正常

# 6. 验证删除流程（对话框 → 确认 → 卡片消失）

# 7. 验证空状态（删除所有项目后）

# 8. 换另一个浏览器/用户登录，确认数据隔离
```

---

## Rollback Plan

| 范围 | 回滚操作 |
|------|---------|
| 代码 | `git revert <commit-hash>` |
| 数据库 | 无需回滚（无 Schema 变更；仅新增了 soft delete 标记，数据仍在） |
| 路由 | `/dashboard` 页面移除，`/` 恢复为脚手架 |

**影响面：** 仅新增了前端页面和轻量 API。下游依赖（ep2-04、ep2-05）尚未开发，回滚无影响。

---

## Risks

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| `useInfiniteQuery` 的 `getNextPageParam` 在筛选条件变化时未正确重置 | 中 | 将 `statusFilter` 放入 `queryKey`；TanStack Query v5 自动在 key 变化时重置缓存 |
| "生成中"筛选需要拉全量数据，项目多时性能下降 | 低 | Dashboard 初期每个用户项目数 ≤ 100；若后续超过 100 则在 ep7-01 扩展 API 支持 `statusGroup` 参数 |
| 乐观删除失败回滚时卡片位置变化 | 低 | 在 `onError` 中 invalidate `project.list` 查询，强制重新拉取最新数据 |
| shadcn Skeleton 组件可能不存在 | 低 | 检查 `src/components/ui/skeleton.tsx`；若不存在则用 `npx shadcn@latest add skeleton` 添加 |
| `date-fns` `zhCN` locale 的 `formatDistanceToNow` 中文输出格式不自然 | 低 | 先使用自带 locale；若不满意可自定义 `formatDistanceToNow` 的 `addSuffix` 行为 |
| Landing 首页与 ep6-04 的设计重复/冲突 | 低 | ep2-03 仅实现占位版（标题 + CTA），ep6-04 整体重写；明确标注代码注释 `// TODO: ep6-04 替换为完整 Landing 页` |

---

## Commit Strategy

建议拆分为 3 个 commit：

```
Commit 1: feat(ep2-03): add lightweight project.delete and generation.retry mutations
  - Add deleteProject and retryGeneration to project.service.ts
  - Add delete and retry endpoints to project router
  - Add router integration tests

Commit 2: feat(ep2-03): add Dashboard page with project list and filters
  - Create ProjectCard, ProjectCardSkeleton, ProjectFilters, EmptyState, DeleteProjectDialog
  - Create Dashboard page with useInfiniteQuery + status filter
  - Add component tests

Commit 3: feat(ep2-03): add landing page stub and home route redirect
  - Modify src/app/page.tsx: redirect authenticated users to /dashboard
  - Add landing hero placeholder for unauthenticated visitors
```

---

## PR Checklist

- [ ] `npm test` 全部测试通过（含 ep2-01 + ep2-02 已有测试）
- [ ] `npm run lint` 无新增错误
- [ ] `npm run dev` 启动成功
- [ ] 未登录访问 `/` → Landing 首屏
- [ ] 登录后自动跳转 `/dashboard`
- [ ] Dashboard 显示用户的项目列表
- [ ] 筛选 Tab 切换正常（全部/生成中/已完成/失败）
- [ ] 项目卡片显示：标题、状态 Badge（正确颜色）、时长、相对时间
- [ ] "加载更多"按钮正常分页
- [ ] 删除确认对话框正常 → 确认后卡片消失
- [ ] 重试按钮仅对失败/取消项目可见 → 点击后状态更新
- [ ] 空状态引导组件正常（无项目时）
- [ ] Loading 骨架屏正常（加载中）
- [ ] 错误状态 + 重新加载按钮正常
- [ ] 响应式布局：手机 1 列 / 平板 2 列 / 桌面 3 列
- [ ] 用户 A 看不到用户 B 的项目
- [ ] ep2-01 + ep2-02 功能不受影响
