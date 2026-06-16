# Volcano AI 微课视频平台 — 实施计划（优化版）

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 实施计划 (Implementation Plan) - 优化版 |
| 关联 PRD | `PRD_AI文本转PPT微课视频平台.md` v1.0.6 |
| 版本 | v2.0.0 |
| 更新时间 | 2026-06-16 |
| 目标受众 | AI Coding Agent (Claude Code / Codex / OpenSpec) |
| 代码库 | `E:\A\Ai\convert documents to videos` |
| 优化重点 | 基于现有项目结构，保持 UI 不变，聚焦后端实现 |

---

## 🎯 核心优化原则

### 1. **保持现有 UI 架构**
- ✅ 保留 `MainApp.tsx` 的 Tab 架构（Generate / History / Subscribe）
- ✅ 保留现有所有 UI 组件（AppNavbar, GenerateTab, HistoryTab 等）
- ✅ 保留现有路由结构（`/` 首页认证分流）
- 🔧 仅需完善后端 API 和数据集成

### 2. **单仓库结构优化**
- 当前为单 Next.js 应用，非 monorepo
- Remotion 集成在 `src/remotion/` 目录
- 避免引入复杂的 workspace 配置
- 保持简单的目录结构

### 3. **渐进式实现**
- 优先完成 API 层（tRPC routers）
- 然后集成到现有 UI 组件
- 最后补充 Inngest 异步任务

---

## 0. 项目当前状态（2026-06-16）

### 0.1 已完成工作

**✅ 认证系统**
- better-auth 完整集成
- 6 个认证页面：login, signup, verify-email, forgot-password, reset-password
- Session 管理已集成到 tRPC context

**✅ UI 组件库**
- 完整的 shadcn/ui 组件库
- 自定义组件：
  - `MainApp.tsx`: Tab 切换主架构 ⭐
  - `GenerateTab.tsx`: 创建项目表单 UI ⭐
  - `HistoryTab.tsx`: 项目列表 UI ⭐
  - `AppNavbar.tsx`: 顶部导航
  - `UserMenu.tsx`: 用户菜单
  - `EmptyState.tsx` / `ErrorState.tsx`: 状态组件
  - `VideoCardSkeleton.tsx`: 加载骨架

**✅ 数据库**
- Prisma schema 完整（12 张表）
- User, Session, Account（better-auth）
- Project, StoryboardVersion, Scene
- Asset, GenerationJob, RenderJob
- JobEvent, UsageRecord

**⚠️ 待完善部分**
- tRPC API 实现（现有 `project.ts` 为空壳）
- R2 存储客户端（存根）
- Inngest functions（框架已配置，无 functions）
- Remotion 模板体系（存根）

### 0.2 现有 UI 架构（需保持）

```
/ (首页)
├── 未登录 → LandingHero
└── 已登录 → MainApp
    ├── AppNavbar (顶部导航)
    └── Tab Content
        ├── GenerateTab (创建项目) ⭐ 已有 UI
        ├── HistoryTab (项目列表) ⭐ 已有 UI
        └── SubscribeTab (订阅)
```

**关键发现**：
- ✅ UI 结构完整，不需要新建页面
- ✅ Tab 切换逻辑已实现
- 🔧 需要：实现后端 API + 数据集成

### 0.3 技术栈确认

| 技术 | 版本 | 状态 |
|------|------|------|
| Next.js | 16.2.7 | ✅ |
| React | 19.2.4 | ✅ |
| Prisma | 7.8.0 | ✅ |
| tRPC | 11.17.0 | ✅ |
| TanStack Query | 5.101.0 | ✅ |
| Remotion | 4.0.476 | ⚠️ 存根 |
| Inngest | 4.5.1 | ⚠️ 存根 |
| better-auth | 1.6.14 | ✅ |

---

## 1. 优化后的实施策略

### Phase 1: 后端 API 实现（优先级最高）

**目标**：实现 tRPC API，让现有 UI 可以调用

**Changes**：
1. **api-01-project-crud** (3-4 天)
   - 实现 `project.create`
   - 实现 `project.list`
   - 实现 `project.getById`
   - 实现 `project.delete`
   - 集成到现有 `GenerateTab` 和 `HistoryTab`

2. **api-02-quota-validation** (1-2 天)
   - 实现额度检查
   - 实现并发限制
   - 集成到 create API

3. **api-03-project-actions** (2-3 天)
   - 实现 cancel/retry 逻辑
   - 集成到 HistoryTab 操作按钮

### Phase 2: AI 生成链路（核心功能）

**目标**：实现 Storyboard 生成

**Changes**：
1. **ai-01-storyboard-types** (2 天)
   - 定义 TypeScript 类型
   - 定义 Zod Schema
   - 生成 JSON Schema

2. **ai-02-llm-provider** (3 天)
   - DeepSeek Provider 实现
   - OpenAI-compatible 适配器
   - Storyboard 生成逻辑

3. **ai-03-inngest-storyboard** (3 天)
   - Inngest function `generate-storyboard`
   - 校验和修复逻辑
   - 保存 StoryboardVersion + Scene

### Phase 3: TTS 音频生成

**目标**：生成高质量语音

**Changes**：
1. **tts-01-provider-interface** (2 天)
   - TTS Provider 抽象
   - MiniMax 适配器

2. **tts-02-r2-storage** (2 天)
   - 实现 R2 上传/下载
   - 实现签名 URL

3. **tts-03-inngest-audio** (4 天)
   - Inngest function `generate-audio`
   - 音频去重
   - Asset 管理

### Phase 4: Remotion 视频渲染

**目标**：生成最终 MP4 视频

**Changes**：
1. **remotion-01-foundation** (2 天)
   - 项目结构
   - 模板注册表
   - 基础组件

2. **remotion-02-templates** (6-8 天)
   - 8 套 PPT 模板
   - 动效预设
   - 字幕组件

3. **remotion-03-worker** (4-5 天)
   - Worker 架构
   - 渲染引擎
   - Docker 化

4. **remotion-04-integration** (3 天)
   - Inngest function `trigger-render`
   - 时间轴计算
   - 结果回写

### Phase 5: 前端完善（基于现有 UI）

**目标**：完善用户体验

**Changes**：
1. **ui-01-generate-tab-integration** (2 天)
   - 集成 create API
   - 表单校验
   - 提交反馈

2. **ui-02-history-tab-integration** (2 天)
   - 集成 list API
   - 状态筛选
   - 操作按钮

3. **ui-03-progress-view** (3 天)
   - 新增进度查看模态框或侧边栏
   - 轮询状态更新
   - 取消/重试

4. **ui-04-video-result** (2 天)
   - 视频播放
   - 下载功能
   - 分享（可选）

### Phase 6: 运营与可观测性

**Changes**：
1. **ops-01-error-handling** (2 天)
2. **ops-02-logging** (2 天)
3. **ops-03-monitoring** (2 天)

---

## 2. 详细 Change Breakdown（优化版）

### Phase 1: 后端 API 实现

#### Change: `api-01-project-crud`

**目标**：实现项目 CRUD API，集成到现有 UI

**Scope**：
- tRPC router `src/trpc/routers/project.ts` 完整实现
- `project.create`: 创建项目 + 发送 Inngest 事件
- `project.list`: 分页列表 + 状态筛选
- `project.getById`: 项目详情 + 关联数据
- `project.delete`: 软删除 + 资源清理
- Service 层 `src/server/services/project.service.ts`
- Repository 层 `src/lib/db/repositories/project.repo.ts`

**集成点**：
- `GenerateTab.tsx`: 调用 `project.create`
- `HistoryTab.tsx`: 调用 `project.list`

**Files**：
```
src/trpc/routers/project.ts (完善现有文件)
src/server/services/project.service.ts (新建)
src/lib/db/repositories/project.repo.ts (新建)
src/components/main-app/GenerateTab.tsx (修改：集成 API)
src/components/main-app/HistoryTab.tsx (修改：集成 API)
```

**Acceptance Criteria**：
- [ ] GenerateTab 可成功创建项目
- [ ] HistoryTab 可显示项目列表
- [ ] 列表支持状态筛选（全部/生成中/已完成/失败）
- [ ] 项目卡片显示正确信息

**Estimated Size**: L (~1200 LOC)
**Estimated Time**: 3-4 天
**Priority**: P0

---

#### Change: `api-02-quota-validation`

**目标**：实现额度检查和并发限制

**Scope**：
- `src/server/services/quota.service.ts`
- 每日免费额度：1 次/用户/天
- 并发限制：1 个运行中任务/用户
- 集成到 `project.create` API

**Files**：
```
src/server/services/quota.service.ts (新建)
src/lib/db/repositories/usage-record.repo.ts (新建)
src/trpc/routers/project.ts (修改：添加额度检查)
```

**Acceptance Criteria**：
- [ ] 用户超额时提交失败
- [ ] 显示友好错误提示
- [ ] 并发任务限制生效

**Estimated Size**: M (~500 LOC)
**Estimated Time**: 1-2 天
**Priority**: P0

---

// __CONTINUE_HERE__
