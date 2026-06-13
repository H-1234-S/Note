# Volcano AI 微课视频平台 - 工程实施计划总览

**基于 PRD**: `PRD_AI文本转PPT微课视频平台.md` v1.0.5  
**生成时间**: 2026-06-13  
**拆分原则**: 每个 Change 独立开发、独立测试、独立 Merge、独立回滚

---

## 项目目标

将 PRD 拆解为适合 AI Coding Agent（Claude Code、Cursor、OpenSpec）执行的工程实施计划。

---

## Epic 总览

```
Volcano 平台（10 个 Epic，33 个 Feature）
├── Epic 1: 基础工程搭建 (P0) - 3 Features
├── Epic 2: 用户认证与权限 (P0) - 2 Features  
├── Epic 3: Provider 抽象层 (P0) - 5 Features
├── Epic 4: 项目管理基础 (P0) - 3 Features
├── Epic 5: Storyboard 生成 (P0) - 3 Features
├── Epic 6: TTS 音频生成 (P0) - 3 Features
├── Epic 7: 渲染流程 (P0) - 4 Features
├── Epic 8: 前端交互 (P0) - 4 Features
├── Epic 9: 任务编排 (P0) - 3 Features
└── Epic 10: 可观测性 (P1) - 3 Features
```

---

## 实施顺序建议

### Phase 1: 基础设施（Week 1-2）
- Epic 1: 基础工程搭建
- Epic 2: 用户认证与权限
- Epic 3: Provider 抽象层

### Phase 2: 核心生成流程（Week 3-5）
- Epic 4: 项目管理基础
- Epic 5: Storyboard 生成
- Epic 6: TTS 音频生成
- Epic 9: 任务编排

### Phase 3: 渲染与前端（Week 6-8）
- Epic 7: 渲染流程
- Epic 8: 前端交互

### Phase 4: 可观测性（Week 9）
- Epic 10: 可观测性

---

## Change 文件索引

详细的 Change 拆分按 Epic 组织在以下文件中：

- `01_EPIC_基础工程搭建.md` - Epic 1 的所有 Changes
- `02_EPIC_用户认证与权限.md` - Epic 2 的所有 Changes
- `03_EPIC_Provider抽象层.md` - Epic 3 的所有 Changes
- `04_EPIC_项目管理基础.md` - Epic 4 的所有 Changes
- `05_EPIC_Storyboard生成.md` - Epic 5 的所有 Changes
- `06_EPIC_TTS音频生成.md` - Epic 6 的所有 Changes
- `07_EPIC_渲染流程.md` - Epic 7 的所有 Changes
- `08_EPIC_前端交互.md` - Epic 8 的所有 Changes
- `09_EPIC_任务编排.md` - Epic 9 的所有 Changes
- `10_EPIC_可观测性.md` - Epic 10 的所有 Changes

---

## 技术栈

- **前端**: Next.js 14+, React, TypeScript, TailwindCSS
- **状态管理**: TanStack Query, Zustand
- **API**: tRPC
- **认证**: better-auth
- **数据库**: PostgreSQL + Prisma
- **任务编排**: Inngest
- **存储**: Cloudflare R2
- **渲染**: Remotion
- **LLM**: DeepSeek (OpenAI-compatible)
- **TTS**: MiniMax

---

## 关键指标

- 首次生成成功率 >= 85%
- 生成任务可恢复率 >= 95%
- 3分钟视频端到端生成 P75 <= 8分钟
- 用户完成转化率 >= 40%

---

## 风险提示

1. **LLM JSON 输出稳定性** - 需要 Schema 校验 + repair
2. **TTS 音频时长准确性** - 音画同步关键
3. **Remotion Worker 环境** - 中文字体、FFmpeg 依赖
4. **R2 签名 URL 过期** - 影响渲染资源拉取
5. **成本控制** - 需要从第一天记录 UsageRecord

---

## 下一步

请按照 Epic 顺序阅读各个 Change 文件，每个 Change 包含：
- Goal（目标）
- Scope（范围）
- Files Likely Affected（影响文件）
- Dependencies（依赖）
- Acceptance Criteria（验收标准）
- Estimated Size（工作量）
- Priority（优先级）
