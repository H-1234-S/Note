# TDD 生成任务交接文档

## 📋 任务概述

**任务**：为 Volcano AI 微课视频生成平台生成完整的技术设计文档（TDD）

**当前状态**：已完成前 5 章（450 行），需要继续完成第 6-20 章

# 输出要求

遇到信息缺失：

不要自行假设。

使用：

【待确认】

标记。

同时给出：

方案A  
方案B  
方案C

最终输出达到：

- Tech Lead可评审
    
- Architect可评审
    
- Backend可开发
    
- Frontend可开发
    
- QA可测试
    
- DevOps可部署
    

质量标准。

---

## 🎯 用户工作流程理解（重要）

用户采用四阶段文档细化流程：

```
1. PRD (产品需求文档)
   └─ 目标：解释"做什么"和"为什么做"
   └─ 状态：✅ 已完成（2300+ 行）
   └─ 位置：E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md

2. TDD (技术设计文档) ← 当前阶段
   └─ 目标：解释"怎么设计"和"系统怎么配合"
   └─ 状态：🟡 进行中（已完成 5/20 章）
   └─ 位置：E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md

3. 实施计划 (Implementation Plan) ← 下一阶段
   └─ 目标：解释"先做什么、后做什么、怎么交付"
   └─ 依赖：需要完整的 TDD 作为输入
   └─ 提取内容：模块依赖、Epic 拆分、工作量估算、风险点

4. Change 文档 (AI 执行指令) ← 最终阶段
   └─ 目标：给 AI 的具体执行指令
   └─ 依赖：需要 TDD + 实施计划
   └─ 提取内容：表结构、API 定义、业务规则、状态机代码
```

**关键理解**：
- TDD 是承上启下的核心文档
- TDD 必须完整（20 章结构），但不需要每章都极度详细
- TDD 的详细程度要为"实施计划"和"Change 文档"生成提供足够输入

---

## 📚 输入文件（更新）

### 核心输入文件
- **PRD 原文**：`E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md`（2300+ 行）
- **PRD 版本**：v1.0.6（已评审通过）
- **Remotion 补充规格**：`E:\A\Note\项目\Volcano\Changes\PRD_Remotion集成补充规格说明书.md`（2090 行，v1.0.0）

### Remotion 补充规格说明书关键内容

该文档是对主 PRD 中 Remotion 集成部分的全面深化，必须在生成 TDD 时参考。

**核心章节（1-13 章）：**

1. **Remotion 项目架构与代码组织**
   - Monorepo 包结构（详细目录树）
   - 包依赖关系（严格单向）
   - 6 条边界规则（B-001 到 B-006）

2. **Remotion 模板体系详细设计**
   - 模板注册表机制
   - 8 个模板详细规格（TitleSlide、ConceptCard、BulletList、ProcessFlow、Comparison、Timeline、Summary、EndingSlide）
   - 每个模板包含：布局结构、字号、背景、入场动效、边界条件
   - 动效预设库（8 种预设：fadeIn、slideUp、scaleIn、typewriter 等）

3. **Remotion Composition 与 Storyboard 映射机制**
   - MicroCourseVideo 核心 Composition 完整代码
   - calculateMetadata 动态计算视频时长
   - Storyboard → Composition Props 转换逻辑

4. **Remotion Worker 详细设计**
   - Worker 架构图
   - Worker HTTP API 定义（POST /internal/render、GET /health、GET /status）
   - Worker 渲染核心流程（14 步）
   - Worker 配置常量
   - Worker Dockerfile
   - Worker 健康检查与自愈（6 项检查）
   - Worker 多实例部署策略

5. **Remotion 渲染管线详细设计**
   - 渲染触发流程（从 Inngest Step 到 Worker 完成，8 步）
   - renderMedia 参数配置表（17 个参数详细说明）
   - 渲染超时策略（按视频时长分级）
   - 缩略图生成（renderStill）

6. **字幕渲染系统**
   - 字幕数据模型（CaptionSegment）
   - 字幕组件实现（CaptionOverlay 完整代码）
   - 字幕行为规则（10 条：C-001 到 C-010）

7. **中文字体方案**
   - 字体选择（Noto Sans SC Bold/Regular/Light）
   - 字体加载实现（loadChineseFonts 完整代码）
   - 字体加载时机与降级策略
   - 字体版权合规（SIL Open Font License 1.1）

8. **Remotion 版本与兼容性管理**
   - 版本锁定策略（精确版本，不使用 ^）
   - 版本升级检查清单（8 项）
   - Storyboard schemaVersion 兼容矩阵

9. **Remotion 特有的错误处理**
   - RENDER_* 错误码详细清单（13 个错误码，含用户提示、可重试、重试策略）
   - Worker 错误处理流程图
   - onProgress 进度上报实现

10. **前置 Storyboard 校验增强（针对 Remotion 渲染）**
    - validateForRemotionRender() 完整代码
    - 8 条校验规则

11. **分镜静态预览实现（Remotion 组件复用）**
    - ScenePreview Composition
    - 前端预览调用方式（方案 A 和方案 B）

12. **Remotion 渲染性能优化**
    - 渲染性能基准表（按时长和分辨率）
    - 8 项优化措施
    - 启动性能（冷启动）时间表

13. **异常边界与回滚流程（Remotion 特定）**
    - 渲染中断恢复（4 个中断点）
    - 取消渲染流程
    - Worker 崩溃恢复（4 种场景）

**重要补充章节：**

14. **License 合规方案**
    - Remotion License 评估（5 个维度）
    - 合规行动项（5 项，含优先级和责任人）
    - License Key 配置代码

15. **Remotion 特定安全要求**
    - 7 条安全边界规则（S-001 到 S-007）
    - Worker 网络安全架构图

16. **Remotion 相关验收标准（AC）**
    - 正常流程验收（5 个 AC）
    - 异常流程验收（5 个 AC）
    - 性能验收（3 个 AC）
    - 兼容性验收（2 个 AC）

17. **开发拆分建议（Remotion 相关部分更新）**
    - Epic 5 详细拆分（24 个 Story/Task）
    - 工作量估算：前端 13 人日 + 后端 14 人日 + 测试 3 人日 = 30 人日

18-20. **配置清单、Storyboard Schema 完整定义、变更记录**

### 如何使用 Remotion 补充规格

在生成 TDD 时，必须从 Remotion 补充规格中提取和优化以下内容：

#### 在第 6 章（数据模型设计）中：
- 参考第 19 章的 Storyboard Schema 完整定义
- 包含 SceneVisual 的 8 种类型定义
- 包含 CaptionSegment 模型

#### 在第 7 章（API 设计）中：
- 参考第 4.2 节的 Worker HTTP API 定义
- POST /internal/render 完整 Request/Response Schema
- GET /health、GET /status 接口定义

#### 在第 8 章（状态机设计）中：
- 参考第 5.1 节的渲染触发流程（8 步状态流转）
- 参考第 9.2 节的 Worker 错误处理流程图

#### 在第 12 章（安全设计）中：
- 参考第 15 章的 7 条安全边界规则
- 参考 Worker 网络安全架构图

#### 在第 14 章（部署架构）中：
- 参考第 4.5 节的 Worker Dockerfile
- 参考第 4.6 节的健康检查策略
- 参考第 4.7 节的多实例部署

#### 在第 16 章（风险评估）中：
- 参考第 14 章的 Remotion License 合规风险
- 参考第 12 章的渲染性能风险

#### 在第 17 章（测试策略）中：
- 参考第 16 章的 15 个验收标准（AC）

#### 在第 18 章（开发实施计划）中：
- 参考第 17 章的 Epic 5 详细拆分（24 个 Task）
- 更新 Epic 5 的工作量估算为 30 人日

### 关键技术决策（必须体现在 TDD 中）

1. **Remotion 角色定位**：项目内集成，作为视频模板与动效引擎，不是外接黑盒服务
2. **Worker 独立性**：渲染执行由独立 Worker 进程/服务承载，避免阻塞 Next.js API
3. **模板注册表**：通过注册表管理 scene type → template component 映射
4. **LLM 输出限制**：LLM 只输出 Storyboard JSON，不输出 Remotion/React/JSX 代码
5. **字幕系统**：支持句级字幕，通过 CaptionOverlay 组件实现
6. **中文字体**：使用 Noto Sans SC，Docker 镜像预装
7. **版本兼容**：Storyboard schemaVersion 与 Remotion 模板版本兼容矩阵
8. **错误处理**：13 个 RENDER_* 错误码，含用户友好提示和重试策略
9. **性能基准**：3 分钟视频渲染 P75 ≤ 8 分钟
10. **License 合规**：MVP 期可用免费评估，商业化前需购买 Company License

---

## ✅ 已完成内容（第 1-5 章，450 行）

### 第 1 章：文档信息
- 项目名称：Volcano AI 微课视频生成平台
- 技术文档版本：v1.0.0
- 状态：Draft
- 基于 PRD v1.0.6

### 第 2 章：技术目标
- ✅ 6 大功能目标
- ✅ 6 大技术目标
- ✅ 8 项性能指标表格（创建项目 API P95 ≤ 800ms，3 分钟视频生成 P75 ≤ 8 分钟等）
- ✅ 5 项可扩展性目标
- ✅ 6 项安全目标

### 第 3 章：总体架构设计
- ✅ 架构概览 Mermaid 图（Frontend → Backend → Database → Providers → Worker）
- ✅ 模块划分表格（10 个模块：职责、输入、输出）
- ✅ 模块依赖关系说明（10 条调用关系，同步/异步标注）

### 第 4 章：核心业务流程设计
- ✅ 主流程 Mermaid 图（45+ 节点）：用户提交 → 创建项目 → Inngest 4 个 Step → 完成
  - Step 1: 生成 Storyboard（LLM + Schema 校验 + repair）
  - Step 2: 生成音频（逐 scene TTS + 上传 R2 + 复用检查）
  - Step 3: 计算时间轴（timeline calculator）
  - Step 4: 渲染视频（Remotion Worker + 上传 MP4）
- ✅ 异常流程：失败重试（Mermaid 图，Inngest 重试策略）
- ✅ 异常流程：用户取消任务（软取消机制 Mermaid 图）
- ✅ 回滚流程：resume 重试（智能恢复 Mermaid 图）

### 第 5 章：数据流设计
- ✅ Data Flow Diagram（Mermaid 图）
- ✅ 用户请求数据流示例：创建项目（9 步详解）
- ✅ 异步生成数据流示例：生成 Storyboard（10 步详解）

---

## 🎯 待完成内容（第 6-20 章）

### 章节详细程度分级（重要）

#### ⭐⭐⭐ 核心章节（详细程度 90%）
这些章节是实施计划和 Change 文档的关键输入，必须详细：

**第 6 章：数据模型设计**
- ER 图（Mermaid erDiagram）
- 10 张表完整设计：User, Project, StoryboardVersion, Scene, Asset, GenerationJob, RenderJob, JobEvent, UsageRecord, AuditLog
- 每张表包含：
  - 表用途说明
  - 字段设计表格（字段名、类型、Nullable、默认值、说明）
  - 索引设计（主键、唯一索引、复合索引）
  - 外键关系
  - 枚举类型定义（如 ProjectStatus, JobStatus, SceneType）

**第 7 章：API 设计**
- tRPC Router 结构
- 6+ 个核心接口完整定义：
  1. `project.createAndGenerate` - 创建并生成
  2. `project.list` - 项目列表
  3. `project.getById` - 项目详情
  4. `generation.cancel` - 取消任务
  5. `generation.retry` - 重试任务
  6. `asset.getSignedUrl` - 获取签名 URL
  7. `provider.listTtsVoices` - 获取 TTS 语音列表
  8. 内部 API：`/internal/render` - Remotion Worker 渲染
- 每个接口包含：
  - Method（Query/Mutation）
  - Request Schema（Zod/JSON Schema）
  - Response Schema
  - 错误码表格
  - 幂等策略
  - 限流策略
  - 超时策略
  - 权限要求

**第 8 章：状态机设计**
- ProjectStatus 状态流转 Mermaid 图
- 状态流转表格（当前状态、触发条件、下一状态、失败处理、回滚逻辑）
- JobStatus 状态流转表格
- 各状态的进入条件、离开条件、超时处理、失败处理

**第 18 章：开发实施计划**
- Epic 分解表格（Epic 名称、Story 数、预估工作量、依赖关系）
- 至少 7 个 Epic：
  1. 基础工程（Next.js + tRPC + Prisma）
  2. 项目管理（Dashboard + Create）
  3. Storyboard 生成
  4. TTS 与 Asset 管理
  5. Remotion 渲染
  6. 前端页面（Progress + Preview + Result）
  7. 可观测性
- 关键 Task 列表

#### ⭐⭐ 重要章节（详细程度 70%）

**第 9 章：权限模型**
- 角色定义（游客、普通用户、管理员）
- 权限矩阵表格（功能 × 角色）
- 数据权限说明
- 管理员判断逻辑（ADMIN_EMAILS 环境变量）

**第 10 章：缓存设计**
- 前端缓存表格（TanStack Query：staleTime、cacheTime、轮询策略）
- 后端缓存表格（Redis：TTL、失效条件）
- 更新策略

**第 16 章：风险评估**
- 风险评估表格（风险类型、风险描述、影响、概率、缓解措施）
- 至少包含：
  - 技术风险（LLM JSON 不稳定、TTS 时长不准、Remotion 部署复杂、R2 URL 过期）
  - 业务风险（效果不符预期、成本不可控）
  - 数据风险（中间状态不一致）
  - 运营风险（失败原因不透明）
  - 合规风险（侵权内容、Remotion license）

#### ⭐ 支撑章节（详细程度 50%）
以表格、列表、要点为主，不展开长篇论述：

**第 11 章：一致性设计**
- 数据一致性等级表格
- 幂等设计列表（4 个场景）
- 补偿机制列表（4 个场景）

**第 12 章：安全设计**
- Authentication 要点
- Authorization 要点
- Rate Limit 表格
- CSRF/XSS/SQL Injection 防护要点
- 敏感数据加密要点
- 审计日志要点

**第 13 章：可观测性设计**
- 日志格式示例（JSON 结构）
- 关键日志点列表
- Metrics 指标表格（指标名、类型、说明）
- Tracing 结构示例
- Alert 规则表格

**第 14 章：部署架构**
- 环境划分表格（Local/Dev/Staging/Production）
- 技术栈部署表格（组件、部署方式、实例数、资源配置）
- CI/CD 流程简图（Mermaid）
- 回滚方案要点

**第 15 章：非功能需求（NFR）**
- 性能指标表格
- 可用性指标表格
- 可扩展性要点
- 可维护性要点

**第 17 章：测试策略**
- Unit Test 要点
- Integration Test 要点
- E2E Test 关键流程列表
- Load Test 场景列表

**第 19 章：架构评审**
- 当前设计优势列表
- 潜在问题表格（问题、影响、建议方案）
- 扩展性建议列表

**第 20 章：总结**
- 完成内容 Checklist
- 下一步行动列表
- 文档版本和状态

---

## 📝 PRD 核心信息摘要

### 项目定位
AI 文本转 PPT 微课视频平台，面向学生和老师

### 核心技术栈
- **前端**：Next.js App Router + tRPC + TanStack Query + Zustand
- **后端**：Next.js API + Prisma + PostgreSQL
- **认证**：better-auth（session-based）
- **任务队列**：Inngest
- **存储**：Cloudflare R2
- **LLM**：DeepSeek（通过 OpenAI-compatible Provider）
- **TTS**：通用 Provider 抽象，首个默认为 MiniMax
- **视频渲染**：项目内集成 Remotion，Worker 独立执行

### 核心业务流程
1. 用户提交 AI 回答文本（50-5000 字）
2. LLM 生成结构化 Storyboard JSON（7 种 scene type）
3. 逐 scene 调用 TTS 生成音频（支持复用）
4. 计算 timeline（fps=30，音频 duration + buffer）
5. Remotion Worker 渲染 MP4（16:9/9:16/1:1）
6. 上传 R2，用户下载

### 关键约束
- 同一用户并发生成数：1
- 免费用户输入字数：3000-5000（默认 5000）
- 免费额度刷新：每日
- 管理员来源：环境变量 ADMIN_EMAILS 白名单
- 第一版不做：分镜编辑、管理员后台、公开分享

### 核心数据模型
- **Project**：项目主表（status: 9 个状态）
- **StoryboardVersion**：分镜版本快照（支持版本化）
- **Scene**：分镜场景（7 种类型：title, concept, bullet_list, process, comparison, timeline, summary）
- **Asset**：资源统一管理（audio/video/thumbnail/storyboard_json，支持生命周期管理）
- **GenerationJob**：生成任务（idempotencyKey 幂等）
- **RenderJob**：渲染任务（renderConfigHash 幂等）

### 核心状态机
**ProjectStatus**：
```
draft → queued → generating_storyboard → storyboard_ready 
→ generating_audio → calculating_timeline → rendering → completed
                                                      ↓
                                                   failed
                                                      ↓
                                                  cancelled
```

**JobStatus**：
```
pending → running → succeeded
              ↓
          retrying → failed
              ↓
       cancel_requested → cancelled
```

### 性能目标
- 创建项目 API P95 ≤ 800ms
- 项目详情查询 P95 ≤ 500ms
- 3 分钟视频生成 P75 ≤ 8 分钟
- 首次生成成功率 ≥ 85%
- 任务可恢复率 ≥ 95%

---

## 🛠️ 技术实现关键点

### Provider 抽象（重要）
四层 Provider 接口，不直接依赖厂商 SDK：

1. **LLM Provider**
   - `generateStoryboard()`：文本 → Storyboard JSON
   - `repairStoryboardJson()`：修复非法 JSON
   - 默认实现：DeepSeek via OpenAI-compatible

2. **TTS Provider**
   - `listVoices()`：获取语音列表
   - `synthesize()`：文本 → 音频 + duration + captions
   - 默认实现：MiniMax（同步 HTTP T2A，支持句级/词级时间戳）

3. **Storage Provider**
   - `upload()`：上传文件到 R2
   - `getSignedUrl()`：生成签名 URL（有效期 10 分钟）
   - 默认实现：Cloudflare R2

4. **Render Provider**
   - `render()`：Storyboard → MP4 + 缩略图
   - 默认实现：Remotion Worker（内部 HTTP API + token）

### Remotion 集成方式（重要）
- **角色**：项目内视频模板与动效引擎，不是外接黑盒服务
- **位置**：建议 monorepo 结构，`packages/remotion-video`
- **内容**：Composition、模板组件、动效预设、字幕组件、模板注册表
- **渲染执行**：独立 Worker 进程/服务（避免阻塞 Next.js API）
- **模板管理**：通过模板注册表映射 scene type → Composition 组件
- **版本控制**：RenderJob 记录 `remotionTemplateVersion` 用于问题追溯

### Inngest 任务编排（重要）
- **事件**：`video/generate.requested`
- **Step 结构**：
  - Step 1: generateStoryboard（LLM + 校验 + repair）
  - Step 2: generateAudio（逐 scene TTS，可并行）
  - Step 3: calculateTimeline（计算 startFrame 和 durationFrames）
  - Step 4: renderVideo（调用 Worker + 上传 R2）
- **重试策略**：指数退避，最多 3 次
- **幂等设计**：GenerationJob.idempotencyKey
- **取消机制**：软取消，每个 Step 开始前检查 Project.status

### 音频复用机制（重要）
- **复用键**：`textHash + voiceProvider + voiceId + speed`
- **查询**：通过 Asset 表 checksum 索引
- **逻辑**：生成音频前先查询，存在则复用，不存在则调用 TTS

### Timeline 计算（重要）
- **fps**：固定 30
- **公式**：`scene.durationFrames = Math.ceil((durationMs + enterBuffer + exitBuffer) / 1000 * 30)`
- **Buffer**：默认 enterBuffer=300ms, exitBuffer=400ms
- **累加**：`scene.startFrame = 前一个 scene 的 startFrame + durationFrames`
- **校验**：所有 scene 必须有 durationMs，否则任务失败

---

## 🎨 TDD 生成规范

### 文档结构
```markdown
# Technical Design Document - Volcano AI 微课视频生成平台

## 1. 文档信息
## 2. 技术目标
## 3. 总体架构设计
## 4. 核心业务流程设计
## 5. 数据流设计
## 6. 数据模型设计         ← 从这里继续
## 7. API 设计
...
## 20. 总结
```

### 格式要求
1. **标题层级**：使用 `##` 二级标题（章节）、`###` 三级标题（小节）、`####` 四级标题（细节）
2. **表格**：所有结构化数据使用 Markdown 表格
3. **流程图**：使用 Mermaid（flowchart TD / stateDiagram-v2 / erDiagram）
4. **代码示例**：使用代码块标注语言（```typescript, ```json）
5. **列表**：有序列表用 `1.`，无序列表用 `-`
6. **强调**：重要概念使用 `**粗体**`

### 写作风格
- **专业但简洁**：Tech Lead 和架构师的语气
- **结构化**：表格优先，文字说明为辅
- **可执行**：后端可根据表结构建表，前端可根据 API 定义开发
- **有依据**：设计决策要说明原因（如"为什么用 Redis 缓存？"→"TTS 语音列表变更频率低"）

### 章节模板（参考）

#### 数据表设计模板
```markdown
#### 表名

**用途**：简短描述

**字段设计**：

| 字段 | 类型 | Nullable | 默认值 | 说明 |
|------|------|----------|--------|------|
| id | String(CUID) | No | - | 主键 |
| ... | ... | ... | ... | ... |

**索引设计**：
- 主键：`id`
- 唯一索引：`xxx_unique (field1, field2)`
- 复合索引：`xxx_idx (field1, field2 DESC)`

**外键**：
- `fieldName` → TableName(id) ON DELETE CASCADE

**枚举类型**（如有）：
\```typescript
enum EnumName {
  value1  // 说明
  value2  // 说明
}
\```
```

#### API 接口设计模板
```markdown
### 接口名称：xxx

**Method**: Query / Mutation

**Path**: `router.method`

**Request Schema**:
\```typescript
{
  field: z.string().min(1),
  ...
}
\```

**Response Schema**:
\```typescript
{
  field: type;
  ...
}
\```

**错误码**：
| Code | 说明 | 是否可重试 |
|------|------|------------|
| XXX_ERROR | ... | 是/否 |

**幂等策略**：...

**限流策略**：...

**超时策略**：...

**权限要求**：...
```

---

## ⚠️ 注意事项

### 1. 文件写入策略
- **不要一次性写入超过 50 行**：会触发传输层截断
- **使用分块写入**：Write 第一块，然后多次 Edit 追加
- **或使用 Bash**：通过 `cat >>` 追加内容

### 2. Mermaid 图限制
- **节点数量**：建议 ≤ 50 个节点
- **复杂流程**：拆分为多个子图
- **测试语法**：确保 Mermaid 语法正确

### 3. 与 PRD 一致性
- 所有设计决策必须基于 PRD v1.0.6
- 不要自行添加 PRD 中标注为 "Out of Scope" 的功能
- 遇到 PRD 中【待确认】的内容，给出方案 A/B/C

### 4. 技术选型约束
- **数据库**：PostgreSQL（不是 MySQL）
- **ORM**：Prisma（不是 TypeORM）
- **认证**：better-auth（不是 NextAuth）
- **任务队列**：Inngest（不是 BullMQ）
- **存储**：Cloudflare R2（不是 AWS S3）
- **前端状态**：Zustand（不是 Redux）
- **API**：tRPC（不是 REST）

---

## 📤 交付标准

### 最终文件
- **文件名**：`TDD_AI文本转PPT微课视频平台_完整版.md`
- **位置**：`E:\A\Ai\convert documents to videos\`
- **行数**：1200-1500 行
- **章节**：完整 20 章

### 质量标准
- ✅ 结构完整：所有 20 章都有内容（不能有空章节）
- ✅ 核心详细：第 6/7/8/18 章必须详细到可直接开发
- ✅ 表格规范：字段对齐，类型准确
- ✅ 流程图清晰：Mermaid 语法正确，逻辑完整
- ✅ 一致性：与 PRD 和已完成的 5 章保持一致

### 验收 Checklist
- [ ] 第 6 章有 10 张表的完整设计
- [ ] 第 7 章有 6+ 个接口的完整定义
- [ ] 第 8 章有 ProjectStatus 和 JobStatus 状态流转图
- [ ] 第 18 章有 7 个 Epic 的拆分和工作量估算
- [ ] 所有表格格式正确，Mermaid 图可渲染
- [ ] 文档可直接作为实施计划的输入

---

## 🚀 执行策略（重要更新）

### 迭代式生成策略

**不要一次性生成所有章节**！采用分批迭代优化的方式：

#### 第一轮：生成第 6-10 章（核心设计章节）
```
1. 读取已完成的 TDD：E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md
2. 读取 PRD：E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md
3. 读取 Remotion 补充规格：E:\A\Note\项目\Volcano\Changes\PRD_Remotion集成补充规格说明书.md
4. 创建新文件：E:\A\Ai\convert documents to videos\TDD_第6-10章.md
5. 生成第 6-10 章内容
6. 用户评审和反馈
```

**第 6-10 章内容：**
- 第 6 章：数据模型设计（详细程度 90%）
- 第 7 章：API 设计（详细程度 90%）
- 第 8 章：状态机设计（详细程度 90%）
- 第 9 章：权限模型（详细程度 70%）
- 第 10 章：缓存设计（详细程度 70%）

#### 第二轮：生成第 11-15 章（支撑章节）
```
1. 基于第一轮的反馈优化
2. 创建文件：E:\A\Ai\convert documents to videos\TDD_第11-15章.md
3. 生成第 11-15 章内容
4. 用户评审和反馈
```

**第 11-15 章内容：**
- 第 11 章：一致性设计（详细程度 50%）
- 第 12 章：安全设计（详细程度 50%）
- 第 13 章：可观测性设计（详细程度 50%）
- 第 14 章：部署架构（详细程度 50%）
- 第 15 章：非功能需求（详细程度 50%）

#### 第三轮：生成第 16-20 章（评估与计划章节）
```
1. 基于前两轮的反馈整合
2. 创建文件：E:\A\Ai\convert documents to videos\TDD_第16-20章.md
3. 生成第 16-20 章内容
4. 最终整合所有章节
```

**第 16-20 章内容：**
- 第 16 章：风险评估（详细程度 70%）
- 第 17 章：测试策略（详细程度 50%）
- 第 18 章：开发实施计划（详细程度 70%）
- 第 19 章：架构评审（详细程度 50%）
- 第 20 章：总结（详细程度 50%）

### 为什么采用迭代式？

1. **避免上下文溢出**：一次性生成 1500 行容易超出 token 限制
2. **质量优先**：每轮可以根据反馈调整和优化
3. **降低重做成本**：如果某个章节需要大改，不影响其他已完成章节
4. **符合用户工作流**：用户强调"不断优化、迭代的过程"

## 📂 文件路径（更新）

### 输入文件
- **PRD 原文**：`E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md`（2300+ 行）
- **PRD 版本**：v1.0.6（已评审通过）
- **Remotion 补充规格**：`E:\A\Note\项目\Volcano\Changes\PRD_Remotion集成补充规格说明书.md`（2090 行，v1.0.0）

### 输出文件（迭代式）
- **已完成部分**：`E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md`（450 行，第 1-5 章）
- **第一轮输出**：`E:\A\Ai\convert documents to videos\TDD_第6-10章.md`（第 6-10 章）
- **第二轮输出**：`E:\A\Ai\convert documents to videos\TDD_第11-15章.md`（第 11-15 章）
- **第三轮输出**：`E:\A\Ai\convert documents to videos\TDD_第16-20章.md`（第 16-20 章）
- **最终整合**：`E:\A\Ai\convert documents to videos\TDD_AI文本转PPT微课视频平台_完整版.md`（所有章节整合）

### 当前工作目录
- `E:\A\Ai\convert documents to videos`

---

## 💬 给下一个 Claude 的启动指令

### 第一轮启动（生成第 6-10 章）

```
请根据 CONTEXT_交接文档.md 开始第一轮 TDD 生成。

任务：生成第 6-10 章（核心设计章节）

输入文件：
1. E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md（已完成 1-5 章）
2. E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md（主 PRD）
3. E:\A\Note\项目\Volcano\Changes\PRD_Remotion集成补充规格说明书.md（Remotion 详细规格）

输出文件：
E:\A\Ai\convert documents to videos\TDD_第6-10章.md

章节要求：
- 第 6 章：数据模型设计（详细程度 90%，10 张表 + ER 图）
- 第 7 章：API 设计（详细程度 90%，8 个接口完整定义）
- 第 8 章：状态机设计（详细程度 90%，完整状态流转图）
- 第 9 章：权限模型（详细程度 70%，权限矩阵）
- 第 10 章：缓存设计（详细程度 70%，缓存策略表）

重点：从 Remotion 补充规格中提取和优化相关内容，不要重复堆砌文字。
```

### 第二轮启动（生成第 11-15 章）

```
请根据 CONTEXT_交接文档.md 和第一轮反馈，开始第二轮 TDD 生成。

任务：生成第 11-15 章（支撑章节）

输入文件：
1. E:\A\Ai\convert documents to videos\TDD_第6-10章.md（第一轮成果）
2. 其他输入文件同第一轮

输出文件：
E:\A\Ai\convert documents to videos\TDD_第11-15章.md

章节要求：
- 第 11 章：一致性设计（详细程度 50%）
- 第 12 章：安全设计（详细程度 50%）
- 第 13 章：可观测性设计（详细程度 50%）
- 第 14 章：部署架构（详细程度 50%）
- 第 15 章：非功能需求（详细程度 50%）
```

### 第三轮启动（生成第 16-20 章）

```
请根据 CONTEXT_交接文档.md 和前两轮反馈，开始第三轮 TDD 生成。

任务：生成第 16-20 章（评估与计划章节）

输入文件：
1. E:\A\Ai\convert documents to videos\TDD_第6-10章.md
2. E:\A\Ai\convert documents to videos\TDD_第11-15章.md
3. 其他输入文件同前两轮

输出文件：
E:\A\Ai\convert documents to videos\TDD_第16-20章.md

章节要求：
- 第 16 章：风险评估（详细程度 70%，风险矩阵）
- 第 17 章：测试策略（详细程度 50%）
- 第 18 章：开发实施计划（详细程度 70%，Epic 拆分）
- 第 19 章：架构评审（详细程度 50%）
- 第 20 章：总结（详细程度 50%）

重点：第 18 章的 Epic 5 必须参考 Remotion 补充规格第 17 章，包含 24 个 Task。
```

---
