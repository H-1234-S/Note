# TDD 生成任务接力文档 - 第二轮（第 11-15 章）

## 📋 任务概述

**任务**：为 Volcano AI 微课视频生成平台生成 TDD 第 11-15 章（支撑章节）

**当前状态**：✅ 已完成第 1-10 章（2200+ 行），需要继续完成第 11-15 章

**目标**：完成第 11-15 章的技术设计文档

---

## 📂 文件路径

### 输入文件
- **主 TDD 文件**：`E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md`（已包含第 1-10 章）
- **PRD 原文**：`E:\A\Note\项目\Volcano\PRD\PRD_AI文本转PPT微课视频平台.md`（2300+ 行，v1.0.6）
- **Remotion 补充规格**：`E:\A\Note\项目\Volcano\Changes\PRD_Remotion集成补充规格说明书.md`（2090 行，v1.0.0）
- **第一轮交接文档**：`E:\A\Note\项目\Volcano\CONTEXT_交接文档.md`（详细背景信息）

### 输出文件
- **第二轮输出**：`E:\A\Ai\convert documents to videos\TDD_第11-15章.md`（新建文件）
- **最终追加到**：`E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md`

---

## ✅ 已完成内容（第 1-10 章）

### 第 1-5 章（架构与流程）
- ✅ 第 1 章：文档信息
- ✅ 第 2 章：技术目标
- ✅ 第 3 章：总体架构设计
- ✅ 第 4 章：核心业务流程设计
- ✅ 第 5 章：数据流设计

### 第 6-10 章（核心设计，刚完成）
- ✅ 第 6 章：数据模型设计（10 张表 + ER 图，详细程度 90%）
- ✅ 第 7 章：API 设计（10 个接口完整定义，详细程度 90%）
- ✅ 第 8 章：状态机设计（完整状态流转图，详细程度 90%）
- ✅ 第 9 章：权限模型（角色 + 权限矩阵 + 额度控制，详细程度 70%）
- ✅ 第 10 章：缓存设计（前端 + 后端 + 应用层缓存，详细程度 70%）

---

## 🎯 待完成内容（第 11-15 章）

### 章节详细程度要求

#### ⭐ 支撑章节（详细程度 50%）

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

---

## 📌 关键技术决策（必须体现）

从 PRD 和 Remotion 补充规格中提取的关键技术决策：

1. **技术栈**：
   - Next.js App Router + tRPC + Prisma + PostgreSQL
   - Inngest 任务编排
   - Cloudflare R2 存储
   - better-auth 认证
   - Remotion 视频渲染（项目内集成）

2. **Provider 抽象**：
   - LLM Provider（DeepSeek via OpenAI-compatible）
   - TTS Provider（首个为 MiniMax）
   - Storage Provider（Cloudflare R2）
   - Render Provider（Remotion Worker）

3. **Remotion 集成方式**：
   - Monorepo 包结构（apps/web, apps/render-worker, packages/remotion-video）
   - Worker 独立进程执行渲染
   - 模板注册表管理 scene type → template 映射
   - LLM 只输出 Storyboard JSON，不输出 Remotion/React 代码

4. **安全边界**（重要，第 12 章必须包含）：
   - LLM 不得输出可执行代码
   - Worker 仅内网访问，需 Internal Token
   - R2 私有存储，签名 URL 访问
   - 音频 URL 仅允许本平台 R2

5. **部署架构**（第 14 章重点）：
   - Next.js Web 部署在 Vercel 或自建服务器
   - Remotion Worker 独立 Docker 容器
   - PostgreSQL + Redis
   - Cloudflare R2
   - Inngest Cloud 或 Self-hosted

---

## 📝 第 11-15 章生成指令

请阅读本接力文档，然后生成第 11-15 章的技术设计文档。

### 步骤 1：创建新文件

```bash
# 创建第 11-15 章文件
E:\A\Ai\convert documents to videos\TDD_第11-15章.md
```

### 步骤 2：生成内容

按照第 11-15 章的结构要求生成内容，详细程度 50%。

### 步骤 3：追加到主文件

生成完成后，将内容追加到主 TDD 文件：

```bash
cat 'E:\A\Ai\convert documents to videos\TDD_第11-15章.md' >> 'E:\A\Note\项目\Volcano\Changes\TDD_AI文本转PPT微课视频平台.md'
```

---

**接力文档生成时间**：2026-06-14

**状态**：等待下一个 Claude 接力

