## Change: ep2-03-dashboard-page

## 元信息

| 属性 | 内容 |
|------|------|
| **Change ID** | `ep2-03-dashboard-page` |
| **所属 Epic** | Epic 2: 项目管理与 Dashboard |
| **优先级** | P0 |
| **预估规模** | M（~750 LOC） |
| **预估工期** | 2 天 |
| **前置 Change** | `ep2-02-project-list-detail-api`（`project.list` / `project.getById` API 就绪） |
| **并行 Change** | `ep2-05-cancel-retry-delete-api`（本 Change 含轻量 delete/retry stub；ep2-05 增强为完整级联/resume 逻辑） |
| **目标代码库** | `E:\A\Ai\convert documents to videos` |

---

## Goal

实现**首页双模式**——未登录展示 Landing 首屏（Aceternity WavyBackground），登录后展示三 Tab 极简主页（生成视频 / 历史记录 / 订阅升级），并集成 Aceternity FocusCards 展示历史视频截图。

---

## Scope

### ✅ 包含内容

1. **Landing 首屏**（未登录状态）
   - Aceternity UI `WavyBackground` 全屏波浪背景
   - 右上角登录 / 注册按钮
   - 极简设计，无其他元素

2. **Main App 导航栏**（登录后状态）
   - 顶部居中三 Tab：`生成视频` / `历史记录` / `订阅升级`
   - 顶部右侧用户中心按钮（头像 + 下拉菜单）
   - 当前激活 Tab 高亮指示

3. **Tab 1：生成视频**
   - 屏幕正中文本框（Textarea）
   - 文本框右下角"生成"按钮
   - 提交 → 调 `project.createAndGenerate` → **成功后自动切换到"历史记录"Tab**（用户立即看到生成中的项目卡片，验证提交已生效）
   - 防重复提交（`isPending` 时按钮 disabled + spinner）

4. **Tab 2：历史记录**
   - 使用 Aceternity UI `FocusCards` 组件展示所有有效项目（排除 `deleted` 状态）
   - 每张卡片 = 视频截图（当前阶段用占位图）+ hover 显示标题
   - 已完成的卡片：显示彩色占位图 + 标题 overlay
   - 生成中的卡片：显示彩色占位图 + 标题 overlay + 底部状态标签（"生成中…"）
   - 失败的卡片：显示红色调占位图 + 底部重试按钮
   - 点击卡片 → 跳转视频播放页 `/projects/[id]/play`
   - 数据源：`project.list` API，**不传 `status` 参数**（拉取全部，客户端过滤 `deleted`）
   - 自动轮询（`refetchInterval: 10_000`）——追踪生成中→已完成的转变
   - 空状态："还没有生成视频，快去创建第一个吧" + CTA

5. **Tab 3：订阅升级**
   - 简单占位页面（标题 + 几个定价卡片，纯 UI）
   - 无实际支付逻辑

6. **首页路由分流**
   - `src/app/page.tsx`：根据 `useSession()` 状态分流
   - `isPending` → 全屏 Loading（防止闪屏）
   - 未登录 → Landing 首屏
   - 已登录 → Main App（三 Tab）

7. **轻量 mutation 端点**
   - `project.delete` mutation：权限校验 + 软删除
   - `generation.retry` mutation：权限校验 + 重建 Job + 发送 Inngest 事件
   - 注：ep2-05 增强为完整级联删除 / resume 重试 / 取消检查点

8. **视频播放占位页**
   - `src/app/(protected)/projects/[id]/play/page.tsx`：极简 stub
   - 显示项目标题 + "视频播放功能即将推出"

### ❌ 不包含内容

- ❌ 完整 Landing 页（Footer、Feature 区、动画）→ `ep6-04`
- ❌ 实际视频播放器（`ep6-03`）
- ❌ 创建项目独立页面（已融入"生成视频"Tab）→ `ep2-04` 精简或取消
- ❌ 视频截图真实图片（依赖 `ep5-07` renderStill）
- ❌ 项目详情页（`ep2-04` 或独立 Change）
- ❌ 完整级联删除 / resume 重试 / 取消 API（`ep2-05`）
- ❌ 实际支付 / 订阅逻辑
- ❌ 全文搜索
- ❌ 全局导航栏重构（`ep6-04`）

---

## Files Likely Affected

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/page.tsx` | **修改** | 替换脚手架 → 登陆态分流（Landing / MainApp） |
| `src/components/landing/LandingHero.tsx` | **新建** | WavyBackground + 登录/注册按钮 |
| `src/components/main-app/AppNavbar.tsx` | **新建** | 三 Tab 导航 |
| `src/components/main-app/UserMenu.tsx` | **新建** | 用户头像 + DropdownMenu（个人中心/退出登录） |
| `src/components/main-app/GenerateTab.tsx` | **新建** | 文本输入 + 生成按钮 |
| `src/components/main-app/HistoryTab.tsx` | **新建** | FocusCards + 状态区分 + 空/错/骨架 |
| `src/components/main-app/HistoryCardActions.tsx` | **新建** | 卡片 hover 操作层（播放/重试/删除） |
| `src/components/main-app/SubscribeTab.tsx` | **新建** | 订阅页占位 |
| `src/components/main-app/VideoCardSkeleton.tsx` | **新建** | FocusCards 加载骨架 |
| `src/components/main-app/EmptyState.tsx` | **新建** | 通用空状态组件 |
| `src/components/main-app/ErrorState.tsx` | **新建** | 通用错误状态组件 |
| `src/app/(protected)/projects/[id]/play/page.tsx` | **新建** | 视频播放占位页（含项目信息 + 删除/重试入口） |
| `src/server/routers/project.ts` | **修改** | 追加 `delete`、`retry` mutation |
| `src/server/services/project.service.ts` | **修改** | 追加 `deleteProject`、`retryGeneration` |

**预计新增文件：11 个，修改文件：3 个**

---

## Dependencies

```
ep2-02 (已完成)
├── project.list API（cursor 分页 + status 筛选）
├── project.getById API（详情查询）
├── project.createAndGenerate API（ep2-01，创建项目）
├── tRPC client 已就绪（trpc.*.useQuery / useMutation）
├── QueryProvider 已注册（root layout）
├── (protected) layout 已存在
├── WavyBackground 组件（src/components/ui/wavy-background.tsx）✅
├── FocusCards 组件（src/components/ui/focus-cards.tsx）✅
├── simplex-noise 已安装 ✅
└── better-auth session（useSession）✅
```

**前置 Change：`ep2-02-project-list-detail-api`**

> **`project.list` API status 参数确认：** ep2-02 的 `status` 入参定义为 `z.enum(VALID_PROJECT_STATUSES).optional()`，支持单个枚举值（`"completed"`、`"failed"` 等）或不传（返回全部）。本 Change 中 HistoryTab **不传 `status`**，拉取用户全部项目后客户端过滤 `deleted`——与 API 契约完全一致，无需修改后端。

**并行 Change：`ep2-05-cancel-retry-delete-api`**（接口契约见 Key Design Decisions #14）

---

## Pre-flight Checklist

| 检查项 | 状态 | 验证方式 |
|--------|------|---------|
| `project.list` API 正常 | ⬜ 待验证 | tRPC panel 调用返回分页数据 |
| `project.createAndGenerate` API 正常 | ⬜ 待验证 | tRPC panel |
| `WavyBackground` 组件可用 | ✅ | `src/components/ui/wavy-background.tsx` |
| `FocusCards` 组件可用 | ✅ | `src/components/ui/focus-cards.tsx` |
| `simplex-noise` 依赖已安装 | ✅ | `package.json` `"simplex-noise": "^4.0.3"` |
| `QueryProvider` 已包裹根布局 | ✅ | `src/app/layout.tsx` |
| `useSession()` 可用 | ✅ | `src/lib/auth-client` |
| `lucide-react` 已安装 | ✅ | `package.json` |
| shadcn Skeleton 组件 | ⬜ 待确认 | `src/components/ui/skeleton.tsx` — 不存在则 `npx shadcn@latest add skeleton` |
| ep2-01 + ep2-02 测试通过 | ⬜ 待验证 | `npm test` |

---

## Technical Design

### 0. 整体设计原则

- **极简至上**：Landing 只放背景 + 按钮，主页只放文本框 + 导航，无冗余装饰
- **单页路由**：`/` 根据登录态条件渲染，不产生 301/302 重定向闪烁
- **认证态优先**：`isPending` 阶段阻塞渲染，避免 Landing → MainApp 闪屏
- **Aceternity UI 原生使用**：`WavyBackground` 和 `FocusCards` 直接用，不封装
- **Tab 状态**：客户端 `useState`，不写入 URL（v1 不需要 bookmark 特定 Tab）

### 1. 路由设计

```
src/app/
├── page.tsx                         # "/" → 全部逻辑在此
├── layout.tsx                       # Root layout（已有 QueryProvider + SessionProvider）
├── (auth)/                          # 认证页面（已有，不变）
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── ...
└── (protected)/
    ├── layout.tsx                   # 已有
    ├── profile/page.tsx             # 已有
    └── projects/
        └── [id]/
            └── play/
                └── page.tsx         # 🆕 视频播放占位
```

**`/` 路由是唯一入口**：不单独创建 `/dashboard` 路由。登录后的主页就是 `/` 的已登录态渲染。

### 2. 首页分流逻辑（含闪屏防护）

```typescript
// src/app/page.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { LandingHero } from "@/components/landing/LandingHero";
import { MainApp } from "@/components/main-app/MainApp";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();

  // 【闪屏防护】isPending 期间全屏 loading，不渲染任何内容
  // 避免以下两种闪屏：
  //   1. session 缓存恢复时：Landing 闪现 → MainApp
  //   2. session 过期时：MainApp 闪现 → Landing
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (session) {
    return <MainApp />;
  }

  return <LandingHero />;
}
```

### 3. Landing 首屏

```
┌──────────────────────────────────────────┐
│                               [登录] [注册]│  ← 右上角按钮
│                                          │
│                                          │
│          ~ ~ ~ 波浪动画背景 ~ ~ ~         │
│          (WavyBackground canvas)         │
│                                          │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

**实现要点：**

```typescript
// src/components/landing/LandingHero.tsx
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <WavyBackground
      backgroundFill="black"
      blur={10}
      speed="fast"
    >
      {/* 右上角按钮区 */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
        <Link href="/login">
          <Button variant="outline" size="sm">登录</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">注册</Button>
        </Link>
      </div>
    </WavyBackground>
  );
}
```

**极简原则：**
- 不放大标题（标题由 app metadata 的 `<title>` 承担）
- 不放副标题 / 描述 / CTA
- 不放"了解更多"按钮（避免 `#features` 锚点指向不存在区块的问题）
- 仅波浪背景 + 登录/注册按钮
- 用户通过浏览器标签页标题识别站点

### 4. Main App 导航栏

```
┌──────────────────────────────────────────────────┐
│                                                  │
│     [生成视频]   [历史记录]   [订阅升级]    [👤]  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│              (当前 Tab 内容区)                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**布局方案：**

```typescript
// src/components/main-app/AppNavbar.tsx
export function AppNavbar({ activeTab, onTabChange, ... }: Props) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b bg-background/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 max-w-5xl mx-auto">
        {/* 左侧占位 — 保持三个 Tab 居中 */}
        <div className="w-20" />

        {/* 居中导航 */}
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition-colors",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 右侧用户中心 */}
        <div className="w-20 flex justify-end">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
```

**移动端处理（三 Tab）：**

3 个 Tab 在 375px 手机上不会溢出（每个约 70-80px，总计 ≈240px + 左右占位）。如果未来多于 3 个 Tab，使用 `overflow-x: auto` 横向滚动。当前版本无需处理。

**`UserMenu` 组件**（内联在 AppNavbar 或独立文件）：
- 使用 shadcn `DropdownMenu`
- 触发按钮：`Avatar`（头像 fallback 取 `session.user.name?.[0]`）
- 菜单项：个人中心（→ `/profile`）、退出登录

### 5. Tab 1：生成视频

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│         ┌──────────────────────┐         │
│         │                      │         │
│         │  粘贴文本或链接...    │         │
│         │                      │         │
│         │                      │         │
│         │              [生成 ✦]│         │
│         └──────────────────────┘         │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

**实现要点：**

```typescript
// src/components/main-app/GenerateTab.tsx
export function GenerateTab() {
  const [text, setText] = useState("");
  const utils = trpc.useUtils();
  
  const createMutation = trpc.project.createAndGenerate.useMutation({
    onSuccess: (data) => {
      setText(""); // 清空输入
      toast.success("项目创建成功，正在生成中…");
      onTabChange("history"); // 切换到历史记录 Tab，用户立即可见生成中的项目卡片
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 【防重复提交】mutation 进行中时按钮 disabled
  const isPending = createMutation.isPending;

  const handleSubmit = () => {
    if (!text.trim() || isPending) return;
    createMutation.mutate({
      title: text.slice(0, 50),
      sourceText: text,
      aspectRatio: "16:9",
      targetDurationSec: 120,
      audienceRole: "student",
      audienceLevel: "intermediate",
      voiceProvider: "minimax",
      voiceId: "male-qn-qingse",
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="relative w-full max-w-2xl">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="粘贴文本或链接..."
          className="min-h-[200px] resize-none pr-16 pb-12"
          disabled={isPending}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !text.trim()}
          className="absolute bottom-3 right-3"
        >
          {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          生成
        </Button>
      </div>
    </div>
  );
}
```

**配置项简化（v1 硬编码）：**
- `aspectRatio`: 固定 `"16:9"`
- `targetDurationSec`: 固定 `120`
- `audienceRole` / `audienceLevel`: 固定 `"student"` / `"intermediate"`
- `voiceProvider` / `voiceId`: 固定 `"minimax"` / `"male-qn-qingse"`
- 配置面板（参数调节）→ `ep2-04` 或后续迭代

**移动端适配注意：** `pb-12` 预留了按钮高度的底部空间，但输入长文本时最后可见行仍可能与按钮重叠（浏览器滚动到末尾后，最后一行在 `absolute` 按钮上方）。解决：TextBox 额外增加 `pr-20`（右侧留白），避免文字延伸到按钮正下方。实现时在 375px 设备上实测，确认按钮不遮挡文字。

### 6. Tab 2：历史记录

```
┌──────────────────────────────────────────┐
│                                          │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│   │ 截图 1   │ │ 截图 2   │ │ 截图 3   │   │
│   │         │ │         │ │         │   │
│   │ 项目A   │ │ 项目B   │ │ 项目C   │   │
│   └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│   (hover 时其他卡片 blur，当前卡片       │
│    显示标题 overlay)                     │
│                                          │
└──────────────────────────────────────────┘
```

**数据获取：**

```typescript
// src/components/main-app/HistoryTab.tsx
export function HistoryTab() {
  const { data, isLoading, isError, error, refetch } =
    trpc.project.list.useQuery(
      {
        pageSize: 50,       // 历史记录一次性加载足够多
        // 不传 status：拉取用户全部项目，客户端过滤 deleted
      },
      {
        // 【轮询策略】每 10 秒刷新，追踪生成中→已完成的转变
        refetchInterval: 10_000,
      }
    );

  // 客户端过滤：排除 deleted 状态
  const items = useMemo(
    () => (data?.items ?? []).filter(item => item.status !== "deleted"),
    [data]
  );

  // ...
}
```

**轮询的价值：** 不传 `status` 过滤时，生成中的项目立即可见（用户提交后切到历史 Tab 能立刻看到卡片）。10 秒轮询持续拉取最新列表，当项目从 `queued` → `generating_storyboard` → … → `completed` 的每一次状态变化都会被捕捉，卡片的状态标签和颜色实时更新。

**图片占位策略（renderStill 尚未实现）：**

在 `ep5-07` renderStill 就绪之前，视频截图使用纯色渐变占位：

```typescript
function getPlaceholderSrc(title: string): string {
  // 根据标题 hash 生成稳定的渐变色
  // 实际实现：返回 data-uri SVG gradient 或用 CSS background
  // 方案：使用 canvas 生成 → toDataURL，或直接用 CSS linear-gradient inline style
}
```

**简化方案**：直接给 FocusCards 的 `src` 传入一个纯色 SVG data URI：

```typescript
const PLACEHOLDER_COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#14b8a6"];

function getPlaceholderSrc(index: number): string {
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  // 200×300 纯色 SVG，适配不同屏幕
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="${color}" width="400" height="300"/>
      <text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">🎬</text>
    </svg>`
  )}`;
}
```

> ⚠️ 当 `ep5-07` renderStill 实现后，将 `src` 替换为 `asset.getSignedUrl({ assetId: scene.imageAssetId })`。
>
> **`data:image/svg+xml` 兼容性验证：** SVG data URI 在所有现代浏览器中均可作为 `<img src>` 渲染，不存在跨域限制。FocusCards 内部的 `<img>` 标签直接加载 data URI，无需 CSP 额外配置。实现时在 Chrome/Firefox/Safari 各验证一次即可。

#### 6.1 卡片状态区分

不同 `status` 的卡片在视觉上需要区分，让用户一眼判断项目进度：

| 状态组 | status 值 | 占位图颜色 | 卡片附加元素 |
|--------|----------|-----------|------------|
| 已完成 | `completed` | 彩色（按 index 循环） | 底部"已完成"绿色标签 |
| 生成中 | `queued`, `generating_*`, `calculating_*`, `rendering` | 蓝紫色调（`#6366f1`） | 底部"生成中…"标签 + 脉冲动画 |
| 分镜就绪 | `storyboard_ready` | 紫色调（`#8b5cf6`） | 底部"分镜就绪"标签 |
| 失败 | `failed` | 红色调（`#f43f5e`） | 底部"生成失败"红色标签 + 重试按钮 |
| 已取消 | `cancelled` | 灰色调（`#6b7280`） | 底部"已取消"灰色标签 |

**实现方式：** 每个 FocusCard 外层包裹 `<div className="relative group">`，底部标签和操作按钮通过 `absolute bottom-0 inset-x-0` 定位在卡片下方。

#### 6.2 卡片操作（HistoryCardActions）

卡片上的操作用以消费 `project.delete` 和 `project.retry` mutation：

```
┌──────────────────┐
│                  │
│   [视频截图]     │  ← FocusCards 原生渲染
│                  │
│   项目标题       │  ← FocusCards hover overlay
│                  │
├──────────────────┤
│ ▶ 播放  🗑 删除  │  ← HistoryCardActions（始终可见，卡片底部）
│         🔄 重试  │  ← 仅 failed/cancelled 状态显示
└──────────────────┘
```

**操作栏组件（`HistoryCardActions`）：**

```typescript
// src/components/main-app/HistoryCardActions.tsx
interface Props {
  projectId: string;
  status: string;
  onPlay: () => void;
}

export function HistoryCardActions({ projectId, status, onPlay }: Props) {
  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => toast.success("项目已删除"),
    onError: (err) => toast.error(err.message),
  });
  const retryMutation = trpc.project.retry.useMutation({
    onSuccess: () => toast.success("已重新开始生成"),
    onError: (err) => toast.error(err.message),
  });
  const canRetry = status === "failed" || status === "cancelled";

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs">
      <button onClick={onPlay}>▶ 播放</button>
      {canRetry && (
        <button onClick={() => retryMutation.mutate({ projectId })}>
          🔄 重试
        </button>
      )}
      <button
        onClick={() => deleteMutation.mutate({ projectId })}
        className="text-muted-foreground hover:text-destructive"
      >
        🗑 删除
      </button>
    </div>
  );
}
```

> **防重复点击：** mutation 进行中时按钮自动 disabled（TanStack Query 的 `isPending` 状态驱动）。

**空状态修正：**

空状态中 `data?.items.length` 需要改为过滤后的 `items.length`：

```typescript
if (!isLoading && items.length === 0) {
  return (
    <EmptyState
      icon={<Clapperboard className="h-16 w-16 text-muted-foreground/30" />}
      title="还没有生成视频"
      description="快去创建第一个AI微课视频吧"
      actionLabel="开始生成"
      onAction={() => onTabChange("generate")}  // 切到生成 Tab
    />
  );
}
```

### 7. Tab 3：订阅升级

```
┌──────────────────────────────────────────┐
│                                          │
│           选择适合你的方案                │
│                                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐│
│   │  免费版   │ │  专业版   │ │  企业版   ││
│   │          │ │          │ │          ││
│   │ ¥0/月   │ │ ¥29/月  │ │ ¥99/月  ││
│   │ 1次/天  │ │ 10次/天 │ │ 无限    ││
│   │          │ │          │ │          ││
│   │ [当前]   │ │ [升级]   │ │ [联系]   ││
│   └──────────┘ └──────────┘ └──────────┘│
│                                          │
│          (纯展示，无支付逻辑)             │
│                                          │
└──────────────────────────────────────────┘
```

**实现：** 纯静态 UI，三张定价卡片（使用 shadcn Card），免费版硬编码标记为"当前方案"。不接入任何支付 SDK，不从 session/subscription 表读取真实订阅状态——当前版本所有用户均视为免费用户。

### 8. 数据流总结

```
page.tsx
├─ useSession()
│   ├─ isPending → Loader2
│   ├─ !session → LandingHero
│   │   └─ WavyBackground (canvas animation)
│   │       └─ 登录/注册 Link
│   └─ session → MainApp
│       ├─ AppNavbar (useState tab)
│       ├─ Tab "generate" → GenerateTab
│       │   └─ trpc.project.createAndGenerate.useMutation()
│       ├─ Tab "history" → HistoryTab
│       │   ├─ trpc.project.list.useQuery({ pageSize: 50 })  // 不传 status，客户端过滤 deleted
│       │   ├─ refetchInterval: 10_000 (追踪生成中→已完成)
│       │   ├─ FocusCards (cards = items → {title, src})
│       │   ├─ isLoading → VideoCardSkeleton
│       │   ├─ isError → ErrorState
│       │   └─ empty → EmptyState
│       └─ Tab "subscribe" → SubscribeTab
│           └─ 静态定价卡片
```

### 9. 加载 / 空 / 错误状态矩阵

| 状态 | Landing 首屏 | 生成 Tab | 历史 Tab | 订阅 Tab |
|------|-------------|---------|---------|---------|
| 首次加载 | —（canvas 渲染即展示） | —（无数据请求） | 3 张 FocusCards 骨架占位 | —（纯静态） |
| 请求中（切换后） | — | — | 保留旧数据 + 顶部 spinner（不闪白） | — |
| mutation 中 | — | 按钮 disabled + spinner | — | — |
| 空数据 | — | — | EmptyState | — |
| 错误 | — | toast 提示 | ErrorState + 重试按钮 | — |

**关键区分——"首次加载"与"切换后加载"：**
- **首次进入历史 Tab**：`isLoading=true`，显示骨架屏
- **从其他 Tab 切回历史 Tab**（数据可能已过期）：TanStack Query 自动使用缓存先展示旧数据 + 顶部 spinner 指示 fetching
- **避免闪白**：不使用 `isLoading` 清空数据再渲染，而是"stale-while-revalidate"模式

### 10. 响应式布局

| 断点 | Landing | 导航栏 | 生成 Tab 文本框 | FocusCards |
|------|---------|--------|----------------|-----------|
| `< 640px` | 全屏波浪 + 右上按钮 | 三 Tab + 用户图标 | `max-w-full` | 1 列 |
| `640-1024px` | 同上 | 同上 | `max-w-xl` | 2 列 |
| `> 1024px` | 同上 | 同上 | `max-w-2xl` | 3 列 |

**移动端导航栏验证：**
- 3 个 Tab（生成视频/历史记录/订阅升级）≈ 240px + 用户图标 40px = 280px < 375px
- 不需要横向滚动
- 若后续添加第 4 个 Tab → 使用 `overflow-x: auto` + `flex-shrink-0` + `scrollbar-hide`

### 11. 轻量 delete / retry mutation

> **ep2-05 接口契约**：本 Change 与 ep2-05 共享相同的 mutation 签名。ep2-05 保证向后兼容——输入/输出类型不变，仅增强内部逻辑（级联删除、resume 重试、取消检查点）。

**`project.delete`：**

| 项目 | 说明 |
|------|------|
| tRPC 路径 | `project.delete` |
| Input | `{ projectId: string }` |
| Output | `{ success: true }` |
| 权限 | owner 或 admin |
| 本 Change 逻辑 | 权限校验 → `update Project.status = "deleted"` |
| ep2-05 增强 | 级联标记 Asset deleted → 删除 R2 文件 → 物理删除 |

**`project.retry`：**

| 项目 | 说明 |
|------|------|
| tRPC 路径 | `project.retry` |
| Input | `{ projectId: string }` |
| Output | `{ jobId: string }` |
| 权限 | owner 或 admin |
| 本 Change 逻辑 | 权限校验 → `update status="queued"` → 创建 GenerationJob → 发送 Inngest 事件 |
| ep2-05 增强 | resume 模式（跳过已完成步骤）→ 取消检查点集成 → 并发限制 |

### 12. 键盘无障碍（a11y）

| 元素 | 实现方式 |
|------|---------|
| 导航 Tab | `<button>` + `onClick`，天然支持 Tab/Enter |
| Tab 切换 | 不实现箭头键切换（3 个 Tab，Tab 键直达即可） |
| 生成按钮 | `<Button disabled>`，防重复 |
| FocusCards | 每个卡片是 `<div>`，不可 Tab 聚焦（点击由 Link 包裹层处理） |
| 视频截图可点击 | 卡片外层包裹 `<Link>` → Tab 键可达 + Enter 跳转 |
| AlertDialog | shadcn 默认按 WAI-ARIA 实现（焦点锁定、Escape 关闭） |

### 13. date-fns 中文 locale 验证

`date-fns@4.4.0` + `zhCN` locale 的 `formatDistanceToNow` 输出验证：

| 时间差 | 预期输出 | 实际需验证 |
|--------|---------|-----------|
| < 30 秒 | "不到 1 分钟前" | `formatDistanceToNow` 默认输出 "less than a minute ago" → zhCN 后待确认 |
| 5 分钟前 | "5 分钟前" | ✅ 大概率正确 |
| 1 小时前 | "约 1 小时前" | 待验证 |
| 昨天 | "1 天前" | 待验证 |
| 7 天前 | "7 天前" | 待验证 |

**实现时验证步骤：**
1. 在 HistoryTab 中打印 `formatDistanceToNow(subDays(new Date(), 1), { addSuffix: true, locale: zhCN })` 到 console
2. 如果输出不自然（如"大约 1 分钟前"太冗长），使用自定义格式化函数替换
3. 本 Change 中历史记录 Tab 使用相对时间显示项目创建时间

---

## Implementation Steps

### Step 0: 基线验证

- `npm test` — 确认 ep2-01 + ep2-02 测试全部通过
- `npm run dev` — 确认 WavyBackground 和 FocusCards 组件无 import 报错
- 若 `skeleton.tsx` 不存在 → `npx shadcn@latest add skeleton`
- 确认 `useSession()` 在 `page.tsx` 中可正常调用

### Step 1: 轻量 mutation 端点 + 首页路由

- 在 `project.service.ts` 追加 `deleteProject`、`retryGeneration`（轻量版）
- 在 `project.ts` router 追加 `delete`、`retry` mutation + Zod schema
- 编写 router 集成测试（delete + retry 各 3 个用例）
- 修改 `src/app/page.tsx`：`isPending` → Loader / `session` → MainApp / `!session` → LandingHero
- `npm test` 确认通过

### Step 2: Landing 首屏 + MainApp 骨架

- 创建 `LandingHero.tsx`：WavyBackground + 登录/注册按钮
- 创建 `AppNavbar.tsx`：三 Tab + UserMenu
- 创建 `MainApp.tsx`（或内联在 page.tsx）：组合 AppNavbar + 条件渲染各 Tab
- 验证：未登录 → Landing，登录 → 三 Tab 可切换（内容区先空）

### Step 3: 三个 Tab 内容

- 创建 `GenerateTab.tsx`：Textarea + 提交按钮 + 防重复
- 创建 `HistoryTab.tsx`：`project.list.useQuery` + FocusCards + 空状态 + 骨架 + 轮询
- 创建 `SubscribeTab.tsx`：三张定价卡片
- 创建 `EmptyState.tsx`、`ErrorState.tsx`、`VideoCardSkeleton.tsx`

### Step 4: 视频播放占位页

- 创建 `src/app/(protected)/projects/[id]/play/page.tsx`
- 显示项目标题 + "即将推出"提示
- 使用 `project.getById.useQuery({ projectId })` 获取标题

### Step 5: 集成验证

- `npm run dev` 启动
- 未登录 → Landing 波浪背景 + 右上登录/注册
- 登录 → MainApp（默认"生成视频"Tab）
- 输入文本 → 点生成 → loading → 项目创建成功
- 切到"历史记录"Tab → 看到刚创建的项目（若已完成）/ 空状态（若未完成）
- 切换到"订阅"Tab → 三张定价卡
- `npm run lint` 无新增错误
- `npm test` 全部通过

---

## Acceptance Criteria

### AC1: Landing 首屏
**Given** 用户未登录
**When** 访问 `/`
**Then** 全屏 WavyBackground 波浪动画背景
**And** 右上角显示"登录"和"注册"两个按钮
**And** 无标题、副标题、CTA 等其他元素

### AC2: 闪屏防护
**Given** 用户有有效 session 缓存
**When** 访问 `/`（session 正在恢复中，`isPending=true`）
**Then** 全屏 Loading spinner
**And** 不闪现 Landing 再切换到 MainApp

### AC3: 登录后主页
**Given** 用户已登录
**When** 访问 `/`
**Then** 显示 MainApp（三 Tab 导航栏 + 内容区）
**And** 默认激活"生成视频"Tab

### AC4: 导航栏
**Given** 用户已登录
**When** 查看 MainApp
**Then** 顶部居中显示三个 Tab：`生成视频` / `历史记录` / `订阅升级`
**And** 顶部右侧显示用户头像按钮
**And** 当前激活 Tab 有高亮样式

### AC5: Tab 切换
**Given** 用户在"生成视频"Tab
**When** 点击"历史记录"Tab
**Then** 内容区切换到历史记录
**And** "历史记录"Tab 高亮，"生成视频"Tab 恢复默认

### AC6: 用户中心菜单
**Given** 用户已登录
**When** 点击右上角用户头像
**Then** 弹出下拉菜单，含"个人中心"和"退出登录"

### AC7: 生成视频—提交
**Given** 用户在"生成视频"Tab，输入了文本（≥1 字符）
**When** 点击"生成"按钮
**Then** 按钮变为 loading 状态（spinner + disabled）
**And** 调用 `project.createAndGenerate` API
**And** 成功后 toast 提示"项目创建成功，正在生成中…"
**And** 输入框清空 + **自动切换到"历史记录"Tab**
**And** 历史记录 Tab 中出现刚创建的项目卡片（状态为 queued，带"生成中…"标签）

### AC8: 生成视频—空文本
**Given** "生成视频"Tab 中文本框为空
**When** 查看"生成"按钮
**Then** 按钮 disabled

### AC9: 生成视频—防重复
**Given** 生成请求正在进行中
**When** 用户尝试再次点击"生成"
**Then** 按钮保持 disabled，不发送第二个请求

### AC10: 历史记录—展示
**Given** 用户有 3 个已完成项目
**When** 切换到"历史记录"Tab
**Then** 使用 FocusCards 组件展示 3 张卡片
**And** 每张卡片显示彩色占位图
**And** hover 卡片时显示项目标题 overlay

### AC11: 历史记录—点击跳转
**Given** 用户在历史记录 Tab，有已完成项目
**When** 点击某张卡片
**Then** 跳转到 `/projects/[id]/play` 视频播放页

### AC12: 历史记录—空状态
**Given** 用户没有任何有效项目（所有项目均为 deleted 或无项目）
**When** 切换到"历史记录"Tab
**Then** 显示空状态：图标 + "还没有生成视频" + "开始生成"按钮
**When** 点击"开始生成"
**Then** 切换到"生成视频"Tab

### AC13: 历史记录—加载骨架
**Given** 用户首次进入历史记录 Tab，数据加载中
**When** 查看页面
**Then** 显示 3 张骨架卡片（pulse 动画）

### AC14: 历史记录—错误状态
**Given** API 请求失败
**When** 查看历史记录 Tab
**Then** 显示"加载失败"提示 + "重新加载"按钮

### AC15: 历史记录—自动轮询
**Given** 用户有一个 `queued` 状态的项目
**When** 在历史记录 Tab 等待 10 秒
**Then** 自动重新请求（`refetchInterval: 10_000`）
**And** 若项目变为 `completed`，卡片自动出现

### AC16: 订阅页
**Given** 用户切换到"订阅升级"Tab
**Then** 显示三张定价卡片（免费版 / 专业版 / 企业版）
**And** 免费版标记"当前方案"
**And** 按钮均为静态展示（无实际支付交互）

### AC17: 视频播放占位
**Given** 用户点击历史记录中的卡片
**When** 跳转到 `/projects/[id]/play`
**Then** 显示项目标题 + "视频播放功能即将推出"

### AC18: 数据隔离
**Given** 用户 A 有 2 个项目
**When** 用户 B 登录后查看历史记录
**Then** 不显示用户 A 的项目

---

## Key Design Decisions

| # | 决策点 | 决策 | 理由 |
|---|--------|------|------|
| 1 | **路由结构** | `/` 单路由 + 条件渲染（非 `/dashboard` 子路由） | 避免 302 重定向闪烁；用户感知"一个首页，两种面貌" |
| 2 | **闪屏防护** | `isPending` 阶段渲染 Loader，不渲染任何内容 | 防止 session 缓存恢复时 Landing→MainApp 闪屏，以及 session 过期时 MainApp→Landing 闪屏 |
| 3 | **Landing 内容** | 仅 WavyBackground + 登录/注册按钮 | 极简；后续 ep6-04 可在此基础上扩展标题/Feature 区/Footer |
| 4 | **导航栏布局** | 居中三 Tab + 右侧用户中心（flex + 左侧占位） | 纯 CSS 居中比 `position: absolute` 更健壮 |
| 5 | **Tab 状态** | `useState`，不写入 URL search params | v1 不需要 bookmark 特定 Tab；后续若需要可改 `useSearchParams` |
| 6 | **生成 Tab 配置** | v1 全部硬编码（16:9 / 120s / minimax），无配置面板 | 极简优先；配置面板在 `ep2-04` 或后续迭代中作为可选功能添加 |
| 7 | **历史记录数据源** | `project.list({ pageSize: 50 })`（不传 status，客户端过滤 deleted） | 一次性加载所有非 deleted 项目（含生成中/失败等）；轮询追踪正在生成的项目；后续若有大量历史项目可加分页 |
| 8 | **轮询策略** | `refetchInterval: 10_000`（全局），不管 Tab 是否激活 | 10 秒间隔对服务器压力小（每个用户约 0.1 QPS）；TanStack Query 在 Tab 不可见时也会轮询（简单方案） |
| 9 | **视频截图占位** | 纯色 SVG data URI（按 index 选不同颜色） | 无外部依赖，渲染即展示；renderStill 就绪后替换为 `asset.getSignedUrl` |
| 10 | **FocusCards 使用** | 直接传 `cards={items.map(toFocusCard)}`，不封装 | 保持 Aceternity UI 原始 API，便于后续升级 |
| 11 | **"了解更多"去掉** | Landing 无此按钮 | 避免 `#features` 锚点指向不存在区块；若需要，ep6-04 统一添加 |
| 12 | **delete/retry 契约** | 两 Change 共享相同 mutation 签名；ep2-05 保证向后兼容 | 一方先合并不影响另一方；合并后自动获得增强逻辑 |
| 13 | **移动端导航** | 3 Tab 不溢出（≈240px < 375px），无需横向滚动 | 若未来 >3 Tab → `overflow-x: auto` + `scrollbar-hide` |
| 14 | **订阅页范围** | 纯 UI 占位，无支付逻辑 | 避免范围膨胀；支付/订阅体系需独立规划和 PRD |
| 15 | **生成按钮位置** | 文本框右下角内部（`absolute bottom-3 right-3`） | 紧凑、直觉；符合用户描述的"文本框右下角" |
| 16 | **"当前方案"标记** | 硬编码免费版为"当前方案"，不从 DB 读取 | v1 无订阅系统，所有用户均为免费用户；后续接入支付后改为动态读取 |
| 17 | **移动端 Textarea** | `pr-20` 右侧留白，防止文字延伸到按钮下方 | 按钮在 `absolute right-3`，长文本末行需留白避免遮挡 |
| 18 | **delete/retry UI 入口** | 每张历史卡片底部显示操作栏（HistoryCardActions），非 hover 隐藏 | 始终可见降低发现成本；mutation `isPending` 自然防重复点击 |
| 19 | **删除确认** | 直接删除（无 AlertDialog 二次确认），失败 tost 提示 | 极简优先；卡片底部操作栏空间有限，二次弹窗增加步骤。若后续用户反馈误删，ep2-05 加 AlertDialog |

---

## Existing Code Integration Points

| 集成点 | 文件 | 状态 | 使用方式 |
|--------|------|------|---------|
| Root Layout | `src/app/layout.tsx` | ✅ | QueryProvider + SessionProvider 已包裹 |
| tRPC Client | `src/lib/trpc/client.ts` | ✅ | `trpc.project.*.useQuery/useMutation` |
| WavyBackground | `src/components/ui/wavy-background.tsx` | ✅ | 直接 import，props: `backgroundFill`, `blur`, `speed` |
| FocusCards | `src/components/ui/focus-cards.tsx` | ✅ | 直接 import，props: `cards: {title, src}[]` |
| Auth Session | `useSession()` from `@/lib/auth-client` | ✅ | 首页路由分流 |
| shadcn Button | `src/components/ui/button.tsx` | ✅ | 登录/注册/生成按钮 |
| shadcn Textarea | `src/components/ui/textarea.tsx` | ✅ | 生成 Tab 输入框 |
| shadcn Avatar | `src/components/ui/avatar.tsx` | ✅ | 用户头像 |
| shadcn DropdownMenu | `src/components/ui/dropdown-menu.tsx` | ✅ | 用户菜单 |
| shadcn Card | `src/components/ui/card.tsx` | ✅ | 订阅定价卡片 |
| shadcn Skeleton | `src/components/ui/skeleton.tsx` | ⬜ 待确认 | 加载骨架 |
| Sonner Toast | `sonner`（root layout 已有 Toaster） | ✅ | `toast.success/error` |
| project Router | `src/server/routers/project.ts` | ✅ 追加 | 新增 `delete`、`retry` mutation |

**不需要修改的文件：**
- `_app.ts`：projectRouter 已注册
- `layout.tsx`（root）：已有 QueryProvider + SessionProvider
- `(protected)/layout.tsx`：MainApp 自带导航栏，不依赖该 layout（页面是 `/` 而非 `/(protected)/`）

---

## Test Strategy

### A. tRPC Mutation 集成测试

```
src/server/routers/__tests__/project.router.test.ts（追加）
├── project.delete
│   ├── owner 删除 → 200 + success
│   ├── 非 owner → FORBIDDEN
│   └── 不存在 ID → NOT_FOUND
└── project.retry
    ├── owner 重试 → 200 + jobId
    ├── 非 owner → FORBIDDEN
    └── 不存在 ID → NOT_FOUND
```

### B. 前端组件测试

```
src/components/__tests__/
├── LandingHero.test.tsx
│   └── 渲染登录/注册 Link（含 href）
├── AppNavbar.test.tsx
│   ├── 三 Tab 全部渲染
│   ├── 点击 Tab 触发 onChange
│   └── 用户菜单可打开
├── GenerateTab.test.tsx
│   ├── 空文本时按钮 disabled
│   ├── 输入后按钮 enabled
│   └── 提交后按钮 loading + disabled
├── HistoryTab.test.tsx
│   ├── 正常渲染 FocusCards
│   ├── 空列表 → EmptyState
│   └── 加载中 → 骨架
├── EmptyState.test.tsx
│   └── 渲染图标 + 文案 + 按钮
└── ErrorState.test.tsx
    └── 渲染错误信息 + 重试按钮
```

### C. 手动集成验证

```bash
npm run dev

# 1. 未登录 → 验证 Landing 波浪背景
# 2. 登录 → 验证 MainApp 三 Tab
# 3. 生成视频 Tab → 输入文本 → 提交
# 4. 历史记录 Tab → 看到刚创建的项目（或等待完成）
# 5. 订阅 Tab → 三张定价卡
# 6. 手机模拟器 (375px) → 验证响应式
# 7. 快速登录/登出 → 验证无闪屏
```

---

## Rollback Plan

| 范围 | 回滚操作 |
|------|---------|
| 代码 | `git revert <commit-hash>` |
| 数据库 | 无需回滚（无 Schema 变更） |

**影响面：** 仅 `/` 路由和轻量 API。下游尚未开发。

---

## Risks

| 风险 | 级别 | 缓解措施 |
|------|------|---------|
| `WavyBackground` 在 Safari 上 canvas 模糊 | 低 | 组件已内置 Safari 检测 + `filter: blur()` 回退；实现后在 Safari 实测 |
| `FocusCards` 使用 `<img>` 而非 Next.js `<Image>` | 低 | Aceternity 原生写法；图片为 data URI 或 R2 URL，不需要 Next.js 优化；若需优化则外层包裹 `<Image>` |
| `refetchInterval: 10_000` 对服务器压力 | 低 | 每个活跃用户 0.1 QPS；100 并发用户 = 10 QPS，完全可接受 |
| **闪屏**：session 缓存恢复时间不可控 | 低 | `isPending` 阻塞渲染避免闪屏；`isPending` 通常在 better-auth 中少于 500ms |
| **防重复**：仅靠按钮 disabled 不够（键盘 Enter 快速触发） | 低 | `useMutation.isPending` + 按钮 `disabled` + Textarea `disabled` 三重保护 |
| **FocusCards 空 src 时 `<img>` 显示破损图标** | 低 | 始终传入占位 data URI，保证 `src` 非空 |

---

## 审查反馈处理清单（来源：ep2-03 初稿审查）

| # | 问题 | 处理方式 |
|---|------|---------|
| 1 | 移动端筛选 Tab 溢出 | ✅ **已解决** — 新设计仅 3 个 Tab，不溢出；若未来 >3 Tab → `overflow-x: auto` |
| 2 | "生成中"项目自动刷新策略 | ✅ **已解决** — `refetchInterval: 10_000`，全 Tab 统一轮询（见 KDD #8） |
| 3 | ErrorState 组件缺失 | ✅ **已解决** — 加入组件目录 + Test Strategy |
| 4 | 筛选 Tab 计数悬而未决 | ✅ **已解决** — v1 不做计数；3 个 Tab 是固定标签，不需要动态 count |
| 5 | Dashboard 首次加载闪屏 | ✅ **已解决** — `isPending` 全屏 Loader 阻塞渲染（见 Section 2） |
| 6 | 乐观删除并发保护 | ✅ **保留** — delete mutation 在本 Change 中不涉及乐观更新（历史 Tab 无删除按钮）；若后续需乐观删除则加 `useRef` 防抖 |
| 7 | "查看"按钮 404 | ✅ **已解决** — FocusCards 点击 → `/projects/[id]/play` 占位页（非 404） |
| 8 | `#features` 锚点 | ✅ **已解决** — 移除"了解更多"按钮 |
| 9 | 缩略图视觉 | ✅ **已解决** — 纯色 SVG data URI 占位（见 Section 6） |
| 10 | 加载状态切换时机 | ✅ **已解决** — 明确区分"首次加载"和"切换后加载"（见 Section 9 表格） |
| 11 | 空/错状态测试缺失 | ✅ **已解决** — 补充 `EmptyState.test.tsx` + `ErrorState.test.tsx` |
| 12 | 键盘无障碍（a11y） | ✅ **已解决** — 新增 Section 12 |
| 13 | date-fns 中文输出验证 | ✅ **已解决** — 新增 Section 13（验证表 + 实施时验证步骤） |
| 14 | ep2-05 接口契约 | ✅ **已解决** — 定义 mutation 签名为共享契约（见 Section 11 表格） |
| — | — | — |

### 第二轮审查（2026-06-13）

| # | 问题 | 处理方式 |
|---|------|---------|
| 1 | HistoryTab 数据源矛盾（只查 completed，轮询无意义） | ✅ **已解决** — 不传 `status`，客户端过滤 `deleted`；生成中项目立即可见，轮询追踪状态变化 |
| 2 | GenerateTab onSuccess 行为未定义 | ✅ **已解决** — 成功后 toast + 清空输入 + 自动切到"历史记录"Tab；更新 AC7 |
| 3 | delete/retry mutation 无 UI 消费者 | ✅ **已解决** — 新增 `HistoryCardActions` 组件，每张卡片底部显示操作栏（播放/重试/删除）；新增 KDD #18-19 |
| 4 | UserMenu 文件归属不明确 | ✅ **已解决** — 在 Files Likely Affected 中新增 `UserMenu.tsx` 独立文件 |
| 5 | `project.list` API status 参数确认 | ✅ **已解决** — 在 Dependencies 节新增确认块：`z.enum(...).optional()`，不传=全部，与 API 一致 |
| 6 | 生成中项目的 FocusCards 视觉区分 | ✅ **已解决** — 新增 Section 6.1 表格：蓝紫色占位图 + "生成中…"标签 + 脉冲动画 |
| 7 | 移动端 Textarea 按钮重叠 | ✅ **已解决** — 移动端适配注意中要求 `pr-20` 右侧留白 + 375px 实测；新增 KDD #17 |
| 8 | FocusCards `data:image/svg+xml` 兼容性 | ✅ **已解决** — 在图片占位策略末尾补充验证说明：SVG data URI 无跨域限制，Chrome/Firefox/Safari 各验证一次 |
| 9 | "当前方案"硬编码逻辑 | ✅ **已解决** — SubscribeTab 实现描述中明确"硬编码，不从 DB 读取"；新增 KDD #16 |

---

## Commit Strategy

```
Commit 1: feat(ep2-03): add lightweight project.delete and generation.retry mutations
  - Add deleteProject/retryGeneration to project.service
  - Add delete/retry endpoints to project router
  - Add router integration tests
  - Define mutation contract for ep2-05 compatibility

Commit 2: feat(ep2-03): add landing page with WavyBackground and main app shell
  - Replace page.tsx with auth-gated Landing/MainApp router
  - Add LandingHero (WavyBackground + auth buttons)
  - Add AppNavbar (3-tab nav + user menu)
  - Add flash prevention with isPending gate

Commit 3: feat(ep2-03): add Generate, History, Subscribe tabs with FocusCards
  - Add GenerateTab (textarea + submit + anti-double-click)
  - Add HistoryTab (FocusCards + polling + skeleton + empty/error states)
  - Add SubscribeTab (pricing cards placeholder)
  - Add /projects/[id]/play stub page
  - Add component tests
```

---

## PR Checklist

- [ ] `npm test` 全部通过（含 ep2-01 + ep2-02）
- [ ] `npm run lint` 无新增错误
- [ ] `npm run dev` 启动成功
- [ ] 未登录 → Landing 波浪背景 + 登录/注册按钮
- [ ] `isPending` 期间 → Loader（无闪屏）
- [ ] 登录后 → MainApp（默认"生成视频"Tab）
- [ ] 三 Tab 切换正常（生成视频/历史记录/订阅升级）
- [ ] 用户中心下拉菜单正常
- [ ] 生成 Tab：空文本按钮 disabled，输入后 enabled，提交后 loading
- [ ] 历史 Tab：已完成项目以 FocusCards 展示，点击跳转播放页
- [ ] 历史 Tab：生成中项目在 10 秒轮询后状态更新
- [ ] 历史 Tab：空项目 → 空状态引导
- [ ] 历史 Tab：加载中 → 骨架屏
- [ ] 订阅 Tab：三张定价卡正常展示
- [ ] `/projects/[id]/play` 占位页正常
- [ ] 移动端 (375px) 响应式正常
- [ ] 用户 A 看不到用户 B 的项目
