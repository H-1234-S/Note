# Volcano AI 微课视频平台 - 工程实施计划

**基于 PRD**: `PRD_AI文本转PPT微课视频平台.md` v1.0.5  
**生成时间**: 2026-06-13  
**拆分原则**: 每个 Change 独立开发、独立测试、独立 Merge、独立回滚

---

## 1. Epic Tree

```
Volcano 平台
├── Epic 1: 基础工程搭建 (P0)
│   ├── Feature 1.1: 项目脚手架
│   ├── Feature 1.2: 数据库模型
│   └── Feature 1.3: 开发环境配置
│
├── Epic 2: 用户认证与权限 (P0)
│   ├── Feature 2.1: Better-auth 集成
│   └── Feature 2.2: 权限中间件
│
├── Epic 3: Provider 抽象层 (P0)
│   ├── Feature 3.1: Provider 接口定义
│   ├── Feature 3.2: LLM Provider
│   ├── Feature 3.3: TTS Provider
│   ├── Feature 3.4: Storage Provider
│   └── Feature 3.5: Render Provider
│
├── Epic 4: 项目管理基础 (P0)
│   ├── Feature 4.1: 项目 CRUD API
│   ├── Feature 4.2: 资产管理 API
│   └── Feature 4.3: Dashboard 页面
│
├── Epic 5: Storyboard 生成 (P0)
│   ├── Feature 5.1: Storyboard Schema
│   ├── Feature 5.2: LLM 分镜生成
│   └── Feature 5.3: JSON 校验与修复
│
├── Epic 6: TTS 音频生成 (P0)
│   ├── Feature 6.1: 音频生成流程
│   ├── Feature 6.2: 音频复用机制
│   └── Feature 6.3: 字幕生成
│
├── Epic 7: 渲染流程 (P0)
│   ├── Feature 7.1: Timeline 计算
│   ├── Feature 7.2: Remotion Worker 搭建
│   ├── Feature 7.3: PPT 模板实现
│   └── Feature 7.4: 视频渲染与上传
│
├── Epic 8: 前端交互 (P0)
│   ├── Feature 8.1: 创建页面
│   ├── Feature 8.2: 进度页面
│   ├── Feature 8.3: 分镜预览页面
│   └── Feature 8.4: 视频结果页面
│
├── Epic 9: 任务编排 (P0)
│   ├── Feature 9.1: Inngest 集成
│   ├── Feature 9.2: Job 状态机
│   └── Feature 9.3: 重试与取消
│
└── Epic 10: 可观测性 (P1)
    ├── Feature 10.1: 日志系统
    ├── Feature 10.2: 用量记录
    └── Feature 10.3: 监控埋点
```

---

## 2. Feature Breakdown

### Epic 1: 基础工程搭建

#### Feature 1.1: 项目脚手架

**目标**: 建立 Next.js 全栈项目基础结构

**涉及模块**:
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `/app`
- `/lib`

**依赖**: 无

**风险**: 
- 依赖版本冲突
- TypeScript 配置不当导致类型错误

**推荐实施顺序**: 1

---

#### Feature 1.2: 数据库模型

**目标**: 定义完整 Prisma Schema 和数据库迁移

**涉及模块**:
- `/prisma/schema.prisma`
- `/prisma/migrations`

**依赖**: Feature 1.1

**风险**:
- 数据模型设计不合理导致后续重构成本高
- 索引缺失影响查询性能

**推荐实施顺序**: 2

---

#### Feature 1.3: 开发环境配置

**目标**: 配置环境变量、R2、Inngest endpoint

**涉及模块**:
- `.env.example`
- `/lib/env.ts`
- `/lib/r2.ts`

**依赖**: Feature 1.1

**风险**:
- 环境变量泄露
- R2 凭据配置错误

**推荐实施顺序**: 3

---

### Epic 2: 用户认证与权限

#### Feature 2.1: Better-auth 集成

**目标**: 接入 better-auth，实现用户登录态

**涉及模块**:
- `/lib/auth.ts`
- `/app/api/auth/[...all]/route.ts`

**依赖**: Feature 1.2

**风险**:
- Session 存储策略不当
- 登录态失效处理不完善

**推荐实施顺序**: 4

---

#### Feature 2.2: 权限中间件

**目标**: tRPC context 注入 userId、管理员判断

**涉及模块**:
- `/server/trpc.ts`
- `/lib/permissions.ts`

**依赖**: Feature 2.1

**风险**:
- 权限绕过漏洞
- 管理员邮箱白名单维护不便

**推荐实施顺序**: 5

---

### Epic 3: Provider 抽象层

#### Feature 3.1: Provider 接口定义

**目标**: 定义 LLM、TTS、Storage、Render 统一接口

**涉及模块**:
- `/lib/providers/types.ts`
- `/lib/providers/registry.ts`

**依赖**: Feature 1.1

**风险**:
- 接口设计过度抽象或不足
- 后续扩展时接口不兼容

**推荐实施顺序**: 6

---

#### Feature 3.2: LLM Provider

**目标**: 实现 OpenAI-compatible LLM Provider，接入 DeepSeek

**涉及模块**:
- `/lib/providers/llm/openai-compatible.ts`
- `/lib/providers/llm/deepseek.ts`

**依赖**: Feature 3.1

**风险**:
- DeepSeek API 稳定性
- JSON 输出格式不稳定

**推荐实施顺序**: 7

---

#### Feature 3.3: TTS Provider

**目标**: 实现 TTS Provider 抽象，接入 MiniMax

**涉及模块**:
- `/lib/providers/tts/types.ts`
- `/lib/providers/tts/minimax.ts`

**依赖**: Feature 3.1

**风险**:
- 音频时长解析失败
- 字幕时间戳对齐问题

**推荐实施顺序**: 8

---

#### Feature 3.4: Storage Provider

**目标**: 实现 Cloudflare R2 存储

**涉及模块**:
- `/lib/providers/storage/r2.ts`

**依赖**: Feature 3.1, Feature 1.3

**风险**:
- 签名 URL 过期
- 上传失败但无法回滚

**推荐实施顺序**: 9

---

#### Feature 3.5: Render Provider

**目标**: 定义 Remotion Worker 渲染接口

**涉及模块**:
- `/lib/providers/render/remotion.ts`

**依赖**: Feature 3.1

**风险**:
- Worker 通信失败
- 渲染超时处理

**推荐实施顺序**: 10

---

### Epic 4: 项目管理基础

#### Feature 4.1: 项目 CRUD API

**目标**: 实现项目创建、列表、详情、删除 tRPC API

**涉及模块**:
- `/server/routers/project.ts`
- `/lib/db/project.ts`

**依赖**: Feature 1.2, Feature 2.2

**风险**:
- 并发限制未生效
- 用户额度判断错误

**推荐实施顺序**: 11

---

#### Feature 4.2: 资产管理 API

**目标**: 实现 Asset CRUD、签名 URL 生成

**涉及模块**:
- `/server/routers/asset.ts`
- `/lib/db/asset.ts`

**依赖**: Feature 3.4, Feature 4.1

**风险**:
- 权限校验缺失导致资源泄露
- 孤儿文件堆积

**推荐实施顺序**: 12

---

#### Feature 4.3: Dashboard 页面

**目标**: 实现项目列表前端页面

**涉及模块**:
- `/app/dashboard/page.tsx`
- `/components/project-card.tsx`

**依赖**: Feature 4.1

**风险**:
- 分页性能问题
- 状态刷新不及时

**推荐实施顺序**: 13

---

### Epic 5: Storyboard 生成

#### Feature 5.1: Storyboard Schema

**目标**: 定义 Storyboard TypeScript 类型和 Zod Schema

**涉及模块**:
- `/lib/storyboard/schema.ts`
- `/lib/storyboard/types.ts`

**依赖**: Feature 1.1

**风险**:
- Schema 过于严格或宽松
- 后续扩展 scene type 需要迁移

**推荐实施顺序**: 14

---

#### Feature 5.2: LLM 分镜生成

**目标**: 调用 LLM 生成 Storyboard JSON

**涉及模块**:
- `/lib/storyboard/generator.ts`
- `/lib/prompts/storyboard.ts`

**依赖**: Feature 3.2, Feature 5.1

**风险**:
- Prompt 质量影响输出稳定性
- Token 消耗超预期

**推荐实施顺序**: 15

---

#### Feature 5.3: JSON 校验与修复

**目标**: 实现 Schema 校验和自动修复

**涉及模块**:
- `/lib/storyboard/validator.ts`
- `/lib/storyboard/repairer.ts`

**依赖**: Feature 5.1, Feature 5.2

**风险**:
- 修复逻辑可能引入新错误
- 修复失败率高

**推荐实施顺序**: 16

---

### Epic 6: TTS 音频生成

#### Feature 6.1: 音频生成流程

**目标**: 逐 scene 调用 TTS、上传 R2、保存 Asset

**涉及模块**:
- `/lib/tts/generator.ts`
- `/lib/audio/analyzer.ts`

**依赖**: Feature 3.3, Feature 3.4, Feature 4.2

**风险**:
- 音频时长解析失败
- 批量生成时 TTS 限流

**推荐实施顺序**: 17

---

#### Feature 6.2: 音频复用机制

**目标**: 实现 textHash 缓存，避免重复生成

**涉及模块**:
- `/lib/tts/cache.ts`
- `/lib/db/asset-query.ts`

**依赖**: Feature 6.1

**风险**:
- Hash 碰撞
- 缓存失效策略不当

**推荐实施顺序**: 18

---

#### Feature 6.3: 字幕生成

**目标**: 生成句子级字幕 JSON

**涉及模块**:
- `/lib/captions/generator.ts`
- `/lib/captions/types.ts`

**依赖**: Feature 6.1

**风险**:
- 字幕时间戳与音频不同步
- 长句断句不合理

**推荐实施顺序**: 19

---

### Epic 7: 渲染流程

#### Feature 7.1: Timeline 计算

**目标**: 根据音频时长计算 timeline

**涉及模块**:
- `/lib/timeline/calculator.ts`

**依赖**: Feature 6.1

**风险**:
- 帧数计算精度问题
- Buffer 时间不合理

**推荐实施顺序**: 20

---

#### Feature 7.2: Remotion Worker 搭建

**目标**: 搭建独立 Remotion Worker 服务

**涉及模块**:
- `/worker/` (新项目)
- `Dockerfile`

**依赖**: Feature 3.5

**风险**:
- Docker 部署环境差异
- 中文字体缺失

**推荐实施顺序**: 21

---

#### Feature 7.3: PPT 模板实现

**目标**: 实现 6-8 个 scene type 的 Remotion 模板

**涉及模块**:
- `/worker/templates/title.tsx`
- `/worker/templates/concept.tsx`
- `/worker/templates/bullet-list.tsx`
- ... (其他模板)

**依赖**: Feature 7.2

**风险**:
- 模板动画性能问题
- 文字溢出处理

**推荐实施顺序**: 22

---

#### Feature 7.4: 视频渲染与上传

**目标**: 完整渲染流程，生成 MP4 和缩略图

**涉及模块**:
- `/worker/render.ts`
- `/worker/upload.ts`

**依赖**: Feature 7.2, Feature 7.3

**风险**:
- 渲染超时
- 大文件上传失败

**推荐实施顺序**: 23

---

### Epic 8: 前端交互

#### Feature 8.1: 创建页面

**目标**: 实现输入文本、配置参数、提交生成

**涉及模块**:
- `/app/create/page.tsx`
- `/components/text-input.tsx`
- `/components/config-form.tsx`

**依赖**: Feature 4.1

**风险**:
- 表单验证不严格
- 提交按钮防重复点击

**推荐实施顺序**: 24

---

#### Feature 8.2: 进度页面

**目标**: 实时展示生成进度

**涉及模块**:
- `/app/projects/[id]/progress/page.tsx`
- `/components/progress-bar.tsx`

**依赖**: Feature 4.1, Feature 9.2

**风险**:
- 轮询频率过高
- 进度展示不准确

**推荐实施顺序**: 25

---

#### Feature 8.3: 分镜预览页面

**目标**: 展示 Storyboard scenes

**涉及模块**:
- `/app/projects/[id]/storyboard/page.tsx`
- `/components/scene-preview.tsx`

**依赖**: Feature 5.1, Feature 4.1

**风险**:
- 预览渲染性能问题
- 音频播放器兼容性

**推荐实施顺序**: 26

---

#### Feature 8.4: 视频结果页面

**目标**: 播放、下载视频

**涉及模块**:
- `/app/projects/[id]/result/page.tsx`
- `/components/video-player.tsx`

**依赖**: Feature 4.2, Feature 7.4

**风险**:
- 签名 URL 过期
- 视频加载慢

**推荐实施顺序**: 27

---

### Epic 9: 任务编排

#### Feature 9.1: Inngest 集成

**目标**: 配置 Inngest client 和 endpoint

**涉及模块**:
- `/lib/inngest.ts`
- `/app/api/inngest/route.ts`

**依赖**: Feature 1.3

**风险**:
- 事件丢失
- Webhook 签名验证失败

**推荐实施顺序**: 28

---

#### Feature 9.2: Job 状态机

**目标**: 实现 GenerationJob 和 RenderJob 状态流转

**涉及模块**:
- `/lib/jobs/state-machine.ts`
- `/lib/db/job.ts`

**依赖**: Feature 1.2, Feature 9.1

**风险**:
- 状态不一致
- 并发状态更新冲突

**推荐实施顺序**: 29

---

#### Feature 9.3: 重试与取消

**目标**: 实现软取消和 resume 重试

**涉及模块**:
- `/lib/jobs/retry.ts`
- `/lib/jobs/cancel.ts`

**依赖**: Feature 9.2

**风险**:
- 取消不生效
- 重试重复消耗资源

**推荐实施顺序**: 30

---

### Epic 10: 可观测性

#### Feature 10.1: 日志系统

**目标**: 实现 JobEvent、错误日志

**涉及模块**:
- `/lib/logging/job-event.ts`
- `/lib/logging/error-handler.ts`

**依赖**: Feature 1.2

**风险**:
- 日志量过大
- 敏感信息泄露

**推荐实施顺序**: 31

---

#### Feature 10.2: 用量记录

**目标**: 记录 LLM、TTS、渲染用量

**涉及模块**:
- `/lib/usage/recorder.ts`
- `/lib/db/usage.ts`

**依赖**: Feature 1.2

**风险**:
- 用量统计不准确
- 影响主流程性能

**推荐实施顺序**: 32

---

#### Feature 10.3: 监控埋点

**目标**: 关键操作埋点

**涉及模块**:
- `/lib/analytics/tracker.ts`

**依赖**: Feature 1.1

**风险**:
- 埋点遗漏
- 第三方服务依赖

**推荐实施顺序**: 33

---

## 3. Change Breakdown

接下来我将详细拆解每个 Feature 的具体 Change...
