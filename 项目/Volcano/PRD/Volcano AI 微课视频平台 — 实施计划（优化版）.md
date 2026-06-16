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

### Phase 2: AI 生成链路

#### Change: `ai-01-storyboard-types`

**目标**：定义 Storyboard 类型系统

**Scope**：
- TypeScript 类型定义
- Zod Schema 校验
- JSON Schema 导出（供 LLM 使用）

**Files**：
```
src/lib/storyboard/types.ts (新建)
src/lib/storyboard/schema.ts (新建)
src/lib/storyboard/validation.ts (新建)
```

**Acceptance Criteria**：
- [ ] 类型覆盖 7 种 scene type
- [ ] Zod 校验可正确捕获错误
- [ ] JSON Schema 可用于 LLM Prompt

**Estimated Size**: M (~600 LOC)
**Estimated Time**: 2 天
**Priority**: P0

---

#### Change: `ai-02-llm-provider`

**目标**：实现 LLM Provider 抽象和 DeepSeek 集成

**Scope**：
- Provider 接口定义
- OpenAI-compatible 基类
- DeepSeek 适配器
- Storyboard 生成逻辑
- JSON repair 机制

**Files**：
```
src/lib/providers/interfaces.ts (新建)
src/lib/providers/llm/openai-compatible.ts (新建)
src/lib/providers/llm/deepseek.ts (新建)
src/lib/storyboard/repair.ts (新建)
```

**Acceptance Criteria**：
- [ ] 可成功调用 DeepSeek API
- [ ] 返回符合 Schema 的 Storyboard
- [ ] JSON repair 可修复常见错误

**Estimated Size**: L (~900 LOC)
**Estimated Time**: 3 天
**Priority**: P0

---

#### Change: `ai-03-inngest-storyboard`

**目标**：实现 Storyboard 生成 Inngest function

**Scope**：
- Inngest function `video/generate-storyboard`
- 调用 LLM Provider
- 校验和修复逻辑
- 保存 StoryboardVersion + Scene
- 更新 Project status

**Files**：
```
src/inngest/functions/generate-storyboard.ts (新建)
src/inngest/functions/index.ts (修改：注册 function)
src/server/services/storyboard.service.ts (新建)
```

**Acceptance Criteria**：
- [ ] 项目创建后自动触发生成
- [ ] Storyboard 成功保存到数据库
- [ ] Scene 表正确拆分
- [ ] Project status 正确流转

**Estimated Size**: L (~800 LOC)
**Estimated Time**: 3 天
**Priority**: P0

---

### Phase 3: TTS 音频生成

#### Change: `tts-01-provider-interface`

**目标**：实现 TTS Provider 抽象和 MiniMax 集成

**Scope**：
- TTS Provider 接口
- MiniMax 适配器
- 语音列表查询
- 音频合成

**Files**：
```
src/lib/providers/tts/minimax.ts (新建)
src/lib/providers/tts/mock.ts (新建：测试用)
```

**Acceptance Criteria**：
- [ ] 可获取 MiniMax 语音列表
- [ ] 可成功生成音频
- [ ] 返回 audioBuffer + durationMs + captions

**Estimated Size**: M (~600 LOC)
**Estimated Time**: 2 天
**Priority**: P0

---

#### Change: `tts-02-r2-storage`

**目标**：实现 R2 存储完整功能

**Scope**：
- 替换现有存根实现
- `uploadToR2`: Buffer 上传
- `getSignedUrl`: 生成签名 URL
- `deleteFromR2`: 删除对象

**Files**：
```
src/lib/r2.ts (修改：替换存根)
src/lib/storage/cloudflare-r2.ts (新建：Provider 实现)
```

**Acceptance Criteria**：
- [ ] 可成功上传文件到 R2
- [ ] 签名 URL 可访问
- [ ] 删除功能正常

**Estimated Size**: M (~500 LOC)
**Estimated Time**: 2 天
**Priority**: P0

---

#### Change: `tts-03-inngest-audio`

**目标**：实现音频生成 Inngest function

**Scope**：
- Inngest function `video/generate-audio`
- 逐 scene 生成 TTS 音频
- 音频去重（textHash）
- 上传 R2
- 创建 Asset 记录
- 回填 Scene.audioAssetId

**Files**：
```
src/inngest/functions/generate-audio.ts (新建)
src/server/services/audio.service.ts (新建)
src/lib/db/repositories/asset.repo.ts (新建)
```

**Acceptance Criteria**：
- [ ] 所有 scene 成功生成音频
- [ ] 相同文本复用音频
- [ ] Asset 记录正确
- [ ] Scene 回填 durationSec

**Estimated Size**: L (~900 LOC)
**Estimated Time**: 4 天
**Priority**: P0

---

### Phase 4: Remotion 视频渲染

#### Change: `remotion-01-foundation`

**目标**：建立 Remotion 项目结构

**Scope**：
- 扩展 `src/remotion/` 目录
- 模板注册表
- 共享组件（SlideBackground, LogoWatermark）
- 主题常量
- 字体加载

**Files**：
```
src/remotion/templates/registry.ts (新建)
src/remotion/components/SlideBackground.tsx (新建)
src/remotion/components/LogoWatermark.tsx (新建)
src/remotion/styles/theme.ts (新建)
src/remotion/fonts.ts (新建)
src/remotion/Root.tsx (修改)
public/fonts/ (添加字体文件)
```

**Acceptance Criteria**：
- [ ] `npx remotion studio` 可启动
- [ ] 字体加载无报错
- [ ] 可预览空 Composition

**Estimated Size**: M (~700 LOC)
**Estimated Time**: 2 天
**Priority**: P0

---

#### Change: `remotion-02-templates`

**目标**：实现 8 套 PPT 模板

**Scope**：
- TitleSlide: 标题页
- EndingSlide: 结束页
- ConceptCard: 概念卡片
- BulletList: 列表（支持分页）
- ProcessFlow: 流程图
- Comparison: 对比
- Timeline: 时间线
- Summary: 总结
- 8 种动效预设
- CaptionOverlay 字幕组件

**Files**：
```
src/remotion/templates/TitleSlide.tsx (新建)
src/remotion/templates/EndingSlide.tsx (新建)
src/remotion/templates/ConceptCard.tsx (新建)
src/remotion/templates/BulletList.tsx (新建)
src/remotion/templates/ProcessFlow.tsx (新建)
src/remotion/templates/Comparison.tsx (新建)
src/remotion/templates/Timeline.tsx (新建)
src/remotion/templates/Summary.tsx (新建)
src/remotion/animations/presets.ts (新建)
src/remotion/components/CaptionOverlay.tsx (新建)
```

**Acceptance Criteria**：
- [ ] 8 个模板可在 Remotion Studio 预览
- [ ] 动效流畅
- [ ] 字幕显示正确

**Estimated Size**: XL (~2000 LOC)
**Estimated Time**: 6-8 天
**Priority**: P0

---

#### Change: `remotion-03-worker`

**目标**：创建 Remotion Worker 独立服务

**Scope**：
- Worker 项目结构（不使用 monorepo，保持简单）
- HTTP Server (Fastify)
- 渲染引擎（bundle + renderMedia）
- 健康检查
- Docker 化

**Files**：
```
render-worker/package.json (新建)
render-worker/src/index.ts (新建)
render-worker/src/server.ts (新建)
render-worker/src/renderer.ts (新建)
render-worker/Dockerfile (新建)
docker-compose.yml (新建或修改)
```

**Acceptance Criteria**：
- [ ] Worker 可独立启动
- [ ] 可接收渲染请求
- [ ] Docker 镜像构建成功
- [ ] 中文字体正常

**Estimated Size**: L (~1200 LOC)
**Estimated Time**: 4-5 天
**Priority**: P0

---

#### Change: `remotion-04-integration`

**目标**：集成 Remotion 到完整生成链路

**Scope**：
- 时间轴计算器
- Inngest function `calculate-timeline`
- Inngest function `trigger-render`
- MicroCourseVideo Composition
- 渲染触发和回调

**Files**：
```
src/server/services/timeline.service.ts (新建)
src/inngest/functions/calculate-timeline.ts (新建)
src/inngest/functions/trigger-render.ts (新建)
src/server/services/render.service.ts (新建)
src/remotion/compositions/MicroCourseVideo.tsx (新建)
```

**Acceptance Criteria**：
- [ ] 时间轴计算正确
- [ ] 可触发 Worker 渲染
- [ ] 渲染结果上传 R2
- [ ] Project status 更新为 completed

**Estimated Size**: L (~900 LOC)
**Estimated Time**: 3 天
**Priority**: P0

---

### Phase 5: 前端完善

#### Change: `ui-01-generate-tab-integration`

**目标**：完善 GenerateTab，集成 API

**Scope**：
- 集成 `project.create` API
- 表单校验（Zod + react-hook-form）
- 提交 loading 状态
- 成功后切换到 History Tab
- 错误处理和提示

**Files**：
```
src/components/main-app/GenerateTab.tsx (修改)
src/lib/validation/project.ts (新建：表单校验)
```

**Acceptance Criteria**：
- [ ] 表单校验工作正常
- [ ] 提交成功后显示 toast
- [ ] 自动切换到 History Tab
- [ ] 错误提示友好

**Estimated Size**: M (~400 LOC)
**Estimated Time**: 2 天
**Priority**: P1

---

#### Change: `ui-02-history-tab-integration`

**目标**：完善 HistoryTab，集成 API

**Scope**：
- 集成 `project.list` API
- TanStack Query 数据获取
- 状态筛选
- 分页或无限加载
- 操作按钮（查看详情、取消、重试、删除）

**Files**：
```
src/components/main-app/HistoryTab.tsx (修改)
src/components/main-app/HistoryCardActions.tsx (修改)
```

**Acceptance Criteria**：
- [ ] 列表显示正确
- [ ] 筛选功能正常
- [ ] 操作按钮可用

**Estimated Size**: M (~500 LOC)
**Estimated Time**: 2 天
**Priority**: P1

---

#### Change: `ui-03-progress-view`

**目标**：添加生成进度查看功能

**Scope**：
- 进度查看 Dialog 或侧边栏
- 6 阶段进度条
- 实时轮询（TanStack Query）
- 取消和重试按钮

**Files**：
```
src/components/main-app/ProgressDialog.tsx (新建)
src/components/main-app/ProgressStepper.tsx (新建)
src/components/main-app/HistoryTab.tsx (修改：添加进度查看入口)
```

**Acceptance Criteria**：
- [ ] 可查看生成进度
- [ ] 进度条实时更新
- [ ] 可取消生成中的任务

**Estimated Size**: M (~600 LOC)
**Estimated Time**: 3 天
**Priority**: P1

---

#### Change: `ui-04-video-result`

**目标**：添加视频结果查看和下载

**Scope**：
- 视频结果 Dialog
- 视频播放器
- 下载 MP4 按钮
- 下载字幕按钮
- 重新生成按钮

**Files**：
```
src/components/main-app/VideoResultDialog.tsx (新建)
src/components/main-app/VideoPlayer.tsx (新建)
src/trpc/routers/asset.ts (新建：签名 URL API)
```

**Acceptance Criteria**：
- [ ] 视频可播放
- [ ] 下载功能正常
- [ ] 签名 URL 有效

**Estimated Size**: M (~500 LOC)
**Estimated Time**: 2 天
**Priority**: P1

---

### Phase 6: 运营与可观测性

#### Change: `ops-01-error-handling`

**目标**：完善错误处理体系

**Scope**：
- 错误码定义
- 错误消息映射（中文）
- tRPC 错误处理中间件
- 前端错误边界

**Files**：
```
src/lib/errors/codes.ts (新建)
src/lib/errors/messages.ts (新建)
src/lib/errors/handler.ts (新建)
src/app/error.tsx (新建)
```

**Estimated Size**: S (~300 LOC)
**Estimated Time**: 2 天
**Priority**: P1

---

#### Change: `ops-02-logging`

**目标**：实现日志记录

**Scope**：
- JobEvent 日志
- 关键操作审计
- Sentry 接入（可选）

**Files**：
```
src/server/services/job-event.service.ts (新建)
src/lib/logger.ts (新建)
```

**Estimated Size**: M (~500 LOC)
**Estimated Time**: 2 天
**Priority**: P1

---

#### Change: `ops-03-monitoring`

**目标**：添加监控和告警

**Scope**：
- Inngest Dashboard 配置
- 关键指标埋点
- 错误率监控

**Files**：
```
src/lib/analytics.ts (新建)
```

**Estimated Size**: S (~300 LOC)
**Estimated Time**: 2 天
**Priority**: P2

---

## 3. 实施时间线（基于现有项目）

### Week 1-2: 后端 API（核心优先）

| 天 | Change | 输出 |
|----|--------|------|
| 1-4 | api-01-project-crud | 项目 CRUD API 完成，UI 可调用 |
| 5-6 | api-02-quota-validation | 额度控制生效 |
| 7-9 | api-03-project-actions | 取消/重试功能完成 |

**里程碑 M1**：用户可创建项目，查看列表，执行基本操作

---

### Week 3-4: AI 生成链路

| 天 | Change | 输出 |
|----|--------|------|
| 1-2 | ai-01-storyboard-types | 类型系统完成 |
| 3-5 | ai-02-llm-provider | DeepSeek 集成完成 |
| 6-8 | ai-03-inngest-storyboard | Storyboard 自动生成 |

**里程碑 M2**：系统可自动生成 Storyboard

---

### Week 5-6: TTS 音频

| 天 | Change | 输出 |
|----|--------|------|
| 1-2 | tts-01-provider-interface | MiniMax TTS 集成 |
| 3-4 | tts-02-r2-storage | R2 存储完成 |
| 5-8 | tts-03-inngest-audio | 音频自动生成 |

**里程碑 M3**：系统可生成音频并上传 R2

---

### Week 7-10: Remotion 渲染

| 天 | Change | 输出 |
|----|--------|------|
| 1-2 | remotion-01-foundation | Remotion 基础完成 |
| 3-10 | remotion-02-templates | 8 套模板完成 |
| 11-15 | remotion-03-worker | Worker 服务完成 |
| 16-18 | remotion-04-integration | 完整渲染链路 |

**里程碑 M4**：系统可生成完整视频

---

### Week 11-12: 前端完善

| 天 | Change | 输出 |
|----|--------|------|
| 1-2 | ui-01-generate-tab-integration | 创建表单完善 |
| 3-4 | ui-02-history-tab-integration | 列表功能完善 |
| 5-7 | ui-03-progress-view | 进度查看完成 |
| 8-9 | ui-04-video-result | 视频播放完成 |

**里程碑 M5**：完整用户体验

---

### Week 13-14: 运营完善

| 天 | Change | 输出 |
|----|--------|------|
| 1-2 | ops-01-error-handling | 错误处理完善 |
| 3-4 | ops-02-logging | 日志系统完成 |
| 5-6 | ops-03-monitoring | 监控配置完成 |

**里程碑 M6**：生产就绪

---

## 4. 关键优化点说明

### 4.1 UI 保持不变

**原实施计划问题**：
- ❌ 计划新建 `/dashboard`, `/create`, `/projects/[id]` 等多个页面
- ❌ 与现有 UI 架构不匹配

**优化方案**：
- ✅ 保留现有 Tab 架构
- ✅ 在 Tab 内集成功能
- ✅ 使用 Dialog/Drawer 展示详情

### 4.2 单仓库结构

**原实施计划问题**：
- ❌ 建议使用 monorepo
- ❌ 增加项目复杂度

**优化方案**：
- ✅ 保持单 Next.js 应用
- ✅ Remotion 集成在 `src/remotion/`
- ✅ Worker 作为独立项目（但不用 workspace）

### 4.3 渐进式交付

**优化方案**：
- ✅ 优先实现 API，UI 可立即调用
- ✅ 每个 Phase 结束都可部署
- ✅ 用户体验逐步完善

---

## 5. 风险与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 现有 UI 需要大改 | 🟢 低 | 已确认 UI 架构合适，仅需集成 |
| DeepSeek JSON 不稳定 | 🟡 中 | JSON repair + 重试机制 |
| Remotion Worker 部署复杂 | 🔴 高 | Docker 化 + 提前测试 |
| 中文字体问题 | 🔴 高 | 预装字体 + 验证渲染 |

---

## 6. 成功标准

### 技术标准
- [ ] 所有 API 有单元测试
- [ ] 生成成功率 ≥ 85%
- [ ] 3 分钟视频生成耗时 ≤ 8 分钟
- [ ] UI 响应时间 ≤ 500ms

### 用户体验标准
- [ ] 用户可完成"创建→查看进度→播放视频"完整流程
- [ ] 错误提示友好
- [ ] 无明显 bug

### 交付标准
- [ ] 代码有完整注释
- [ ] 关键逻辑有测试
- [ ] 文档齐全

---

## 7. 下一步行动

### 🎯 立即开始（本周）

**推荐**: `api-01-project-crud`

**理由**：
- 现有 UI 已就绪，等待 API
- 实现后用户立即可用
- 是所有后续功能的基础

**验收标准**：
- [ ] GenerateTab 可成功创建项目
- [ ] HistoryTab 可显示项目列表
- [ ] 状态筛选功能正常

---

## 8. 总结

### 优化亮点

1. **保持 UI 不变** ⭐⭐⭐
   - 尊重现有设计
   - 减少重复工作
   - 加快交付速度

2. **单仓库简化** ⭐⭐
   - 降低项目复杂度
   - 易于维护
   - 符合团队规模

3. **渐进式交付** ⭐⭐⭐
   - 每个 Phase 可独立部署
   - 风险可控
   - 用户价值持续交付

### 预计总工期

- **原计划**: ~50 天（10 周）
- **优化后**: ~70 天（14 周）
- **原因**: 保持了更完整的功能覆盖，但降低了返工风险

### 团队配置建议

- 1 名 Full-stack Lead（API + UI 集成）
- 1 名 Remotion 专家（模板 + Worker）
- 1 名 Backend Engineer（AI 链路 + Inngest）

---

## 变更记录

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v2.0.0 | 2026-06-16 | 基于现有项目优化：保持 UI 不变，聚焦后端实现，单仓库结构，渐进式交付 |
