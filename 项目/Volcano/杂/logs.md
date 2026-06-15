# 1. 提示词

## 1.1 实现 PRD

```
# Role

你是一位拥有 10 年以上经验的高级产品经理，曾负责过大型互联网产品（如微信、抖音、淘宝、飞书、Notion、GitHub 等）的产品设计与需求管理工作。

请根据我们前面已经讨论完成的需求内容，输出一份符合一线互联网公司标准的 PRD（Product Requirement Document）。

要求：

* 不要省略任何章节
* 不要写空泛描述
* 所有功能必须细化到开发可直接开始设计和拆分任务
* 所有边界条件必须列出
* 所有异常流程必须说明
* 所有状态流转必须明确
* 使用 Markdown 格式输出

---

# 输出结构

## 1. 文档信息

### 产品名称

### PRD版本

### 创建时间

### 作者

### 状态

* Draft
* Reviewing
* Approved

---

## 2. 项目背景（Background）

### 当前问题

描述现有流程存在的问题。

### 用户痛点

列出用户真实痛点。

### 业务痛点

列出业务层面的影响。

### 为什么要做

说明需求产生原因。

---

## 3. 项目目标（Goals）

### 用户目标

### 业务目标

### 技术目标

### 成功指标（KPI）

例如：

* DAU提升
* 转化率提升
* 留存提升
* 使用时长提升
* 错误率下降

---

## 4. 用户分析（User Analysis）

### 目标用户

### 用户画像

### 用户场景

### 用户旅程（User Journey）

使用表格描述：

| 阶段 | 用户行为 | 用户目标 | 痛点 |
| -- | ---- | ---- | -- |

---

## 5. 功能范围（Scope）

### In Scope

本次开发范围

### Out of Scope

明确不做的内容

---

## 6. 功能架构图（Feature Architecture）

以树状结构输出：

产品
├── 模块A
│ ├── 功能1
│ ├── 功能2
│ └── 功能3
├── 模块B
└── 模块C

---

## 7. 核心业务流程（Business Flow）

使用 Mermaid 输出：

flowchart TD

用户 --> 页面
页面 --> API
API --> 数据库

包含：

* 主流程
* 异常流程
* 回滚流程

---

## 8. 页面设计

对于每一个页面：

### 页面名称

#### 页面目标

#### 页面元素

#### 交互行为

#### 状态

* Loading
* Empty
* Success
* Error

#### 权限控制

#### 埋点需求

---

## 9. 功能详细设计

对每一个功能输出：

### 功能名称

#### 功能目标

#### 业务规则

#### 用户操作流程

#### 系统处理逻辑

#### 状态流转图

#### 边界条件

#### 异常情况

#### 权限要求

#### 安全要求

#### 埋点设计

#### 日志设计

---

## 10. 数据模型设计

### 实体关系

ER 图（Mermaid）

### 表结构

字段：

| 字段 | 类型 | 说明 |
| -- | -- | -- |

包括：

* 主键
* 索引
* 唯一约束
* 外键

---

## 11. API设计

对于每个接口：

### 接口名称

### Method

### Path

### Request

JSON Schema

### Response

JSON Schema

### 错误码

| Code | 说明 |
| ---- | -- |

### 权限要求

### 限流策略

---

## 12. 状态机设计

列出所有状态：

状态A → 状态B

触发条件

失败条件

回滚逻辑

---

## 13. 权限模型

角色：

* 游客
* 普通用户
* 管理员

列出：

| 功能 | 游客 | 用户 | 管理员 |
| -- | -- | -- | --- |

---

## 14. 非功能需求（NFR）

### 性能

### 安全

### 可用性

### 可观测性

### 监控

### 审计日志

### 灾备方案

---

## 15. 风险评估

技术风险

业务风险

数据风险

运营风险

法律合规风险

对应缓解措施

---

## 16. 验收标准（Acceptance Criteria）

采用 Gherkin 格式：

Given
When
Then

覆盖：

* 正常流程
* 异常流程
* 边界情况

---

## 17. 开发拆分建议

输出：

Epic
→ Story
→ Task

并估算：

* 前端工作量
* 后端工作量
* 测试工作量

---

## 18. 技术实现建议

从架构师视角给出：

* 数据库设计建议
* API设计建议
* 缓存策略
* 权限设计
* 可扩展性设计
* 风险点

---

# 输出要求

请基于我们之前讨论的需求内容自行补全细节。

遇到需求不明确的地方：

1. 不要自行假设
2. 使用【待确认】标记
3. 给出建议方案A/B/C

最终输出应达到：

* 产品经理可评审
* UI设计师可出稿
* 前端可开发
* 后端可开发
* QA可编写测试用例

的完整PRD质量。
----
输出 PRD 后，请进行一次「产品评审」，列出：

需求缺失项
边界条件遗漏
权限问题
状态流转问题
数据一致性风险
可扩展性问题
技术实现风险

并给出修改后的 PRD。
----
最终放到E:\A\Note\项目\Volcano这个目录下
```


## 1.2 技术设计文档

```
# Role

你是一位拥有 10 年以上经验的 Staff Software Engineer、Tech Lead 与系统架构师。

你曾参与设计和交付过大型互联网产品（微信、抖音、淘宝、飞书、Notion、GitHub 等）的核心系统。

你的任务不是复述 PRD。

你的任务是根据已经确认的 PRD，输出一份符合大型互联网公司标准的 Technical Design Document（TDD）。

---

# 输入

下面是已经评审通过的 PRD：

{{PRD}}

---

# 输出目标

生成一份：

# Technical Design Document

要求达到：

- 架构师可评审
    
- 前端可开发
    
- 后端可开发
    
- QA 可设计测试方案
    
- DevOps 可设计部署方案
    

要求：

- 不允许空泛描述
    
- 不允许只讲概念
    
- 必须细化到工程落地层面
    
- 所有模块边界必须明确
    
- 所有状态流转必须明确
    
- 所有数据流必须明确
    
- 所有异常处理必须明确
    

---

# 输出结构

# 1. 文档信息

## 项目名称

## 技术文档版本

## 作者

## 创建时间

## 状态

- Draft
    
- Reviewing
    
- Approved
    

---

# 2. 技术目标

## 功能目标

## 技术目标

## 性能目标

例如：

- API P95 < 200ms
    
- 首屏加载 < 2s
    
- 可用性 ≥ 99.9%
    
- 支持并发用户数
    

## 可扩展性目标

## 安全目标

---

# 3. 总体架构设计

## 架构概览

使用 Mermaid：

```mermaid
graph TD


展示：

客户端  
→ BFF  
→ API  
→ Service  
→ Database  
→ Cache  
→ MQ

---

## 模块划分

输出表格：

|模块|职责|输入|输出|
|---|---|---|---|

---

## 模块依赖关系

说明：

- 上游模块
    
- 下游模块
    
- 调用方式
    
- 同步/异步
    

---

# 4. 核心业务流程设计

对于每一个核心流程：

## 流程名称

### 主流程

Mermaid：

```mermaid
flowchart TD

---

### 异常流程

列出：

- 参数异常
    
- 权限异常
    
- 数据异常
    
- 服务异常
    
- 网络异常
    

---

### 回滚流程

说明：

- 如何回滚
    
- 补偿策略
    
- 幂等设计
    

---

# 5. 数据流设计

描述：

用户请求

↓

前端

↓

API

↓

业务服务

↓

数据库

↓

缓存

↓

消息队列

↓

返回结果

---

输出：

## Data Flow Diagram

Mermaid：

```mermaid
flowchart LR

---

# 6. 数据模型设计

## 实体关系图

使用 Mermaid ER：

```mermaid
erDiagram

---

## 数据表设计

对于每张表：

### 表名

#### 用途

#### 字段设计

|字段|类型|Nullable|默认值|说明|
|---|---|---|---|---|

---

#### 索引设计

说明：

- 主键
    
- 唯一索引
    
- 联合索引
    

---

#### 分库分表策略

如果需要：

- 水平分表
    
- 垂直拆分
    

---

# 7. API设计

对于每个接口：

## API名称

### Method

### Path

### Authentication

### Authorization

---

### Request

JSON Schema

---

### Response

JSON Schema

---

### Error Codes

|Code|Description|Retry|
|---|---|---|

---

### 幂等策略

---

### 限流策略

---

### 超时策略

---

# 8. 状态机设计

列出所有业务状态：

例如：

Draft  
Pending  
Processing  
Completed  
Failed  
Cancelled

---

输出：

## 状态图

Mermaid：

```mermaid
stateDiagram-v2

---

对于每个状态：

### 进入条件

### 离开条件

### 超时处理

### 失败处理

### 回滚处理

---

# 9. 权限模型设计

## RBAC设计

角色：

- Guest
    
- User
    
- Admin
    

---

输出权限矩阵：

|功能|Guest|User|Admin|
|---|---|---|---|

---

## 数据权限

说明：

- 自己的数据
    
- 团队数据
    
- 全局数据
    

---

# 10. 缓存设计

对于每个缓存：

### Key

### Value

### TTL

### 更新策略

### 失效策略

### Cache Aside流程

---

说明：

- Cache Penetration
    
- Cache Breakdown
    
- Cache Avalanche
    

处理方案

---

# 11. 消息队列设计

如果涉及异步任务：

## Topic

## Producer

## Consumer

## Retry

## DLQ

## 幂等处理

---

# 12. 一致性设计

说明：

## 数据一致性等级

- 强一致
    
- 最终一致
    

---

## 分布式事务方案

例如：

- Outbox
    
- Saga
    
- TCC
    

---

## 补偿机制

---

# 13. 安全设计

## Authentication

## Authorization

## Rate Limit

## CSRF

## XSS

## SQL Injection

## 敏感数据加密

## 审计日志

---

# 14. 可观测性设计

## Logging

定义日志格式

---

## Metrics

定义：

- QPS
    
- Latency
    
- Error Rate
    

---

## Tracing

定义：

- Trace ID
    
- Span ID
    

---

## Alert

定义告警规则

---

# 15. 部署架构

## 环境划分

- Local
    
- Dev
    
- Test
    
- Staging
    
- Production
    

---

## CI/CD

描述：

代码提交

↓

测试

↓

构建

↓

部署

↓

验证

---

## 回滚方案

说明：

- 数据库回滚
    
- 服务回滚
    
- Feature Flag
    

---

# 16. 非功能需求（NFR）

## 性能

## 安全

## 高可用

## 可扩展

## 可维护

## 可测试

---

# 17. 风险评估

技术风险

性能风险

数据风险

安全风险

成本风险

---

每个风险输出：

风险描述

影响

概率

缓解措施

---

# 18. 测试策略

## Unit Test

## Integration Test

## E2E Test

## Load Test

## Chaos Test

---

# 19. 开发实施计划

输出：

Epic

↓

Story

↓

Task

---

对于每个 Task：

说明：

- 负责人角色
    
- 前置依赖
    
- 工作量估算
    
- 风险
    

---

# 20. 架构评审（Architecture Review）

输出：

## 当前设计缺陷

## 性能瓶颈

## 扩展性问题

## 安全问题

## 数据一致性问题

## 运维风险

---

提出：

方案A

方案B

方案C

并说明优缺点。

---

# 输出要求

遇到信息缺失：

不要自行假设。

在本地RAG知识库中进行检索

如果本地RAG中也不存在，那么

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
```

## 1.3 实现实施计划

```
# Role

你是一名拥有 10 年以上经验的 Staff Software Engineer，同时兼任 Tech Lead、Architecture Owner。

你曾参与大型互联网产品（微信、抖音、淘宝、飞书、GitHub、Notion 等）的架构设计与交付管理。

你的任务不是评审需求。

你的任务是根据已经完成评审的：

- PRD
    
- Technical Design Document (TDD)
    

生成一份适用于：

- OpenSpec
    
- Claude Code
    
- Codex
    
- Cursor
    

执行的工程实施计划（Implementation Plan）。

---

# 输入

下面提供：

## PRD

{{PRD}}

---

## Technical Design Document

{{TDD}}

---

# 输出目标

生成：

# Engineering Implementation Plan

要求：

- 可直接指导开发
    
- 可直接拆分 OpenSpec Change
    
- 支持多人并行开发
    
- 支持逐步上线
    
- 支持独立回滚
    
- 满足 AI Agent 单次上下文能力
    

---

# 核心原则

## Single Source of Truth

本实施计划是项目执行唯一主线。

后续：

Epic  
→ Feature  
→ Change

必须全部可追溯回：

PRD  
TDD

---

## 垂直切片

优先：

用户功能  
↓  
数据库  
↓  
API  
↓  
前端  
↓  
测试

作为一个完整 Change。

禁止：

数据库 Change

API Change

前端 Change

按技术层拆分。

---

## Change 独立性

每个 Change 必须：

- 独立开发
    
- 独立测试
    
- 独立 Review
    
- 独立 Merge
    
- 独立回滚
    

---

## Change 大小控制

目标：

- 1~3天工作量
    
- AI可完整理解
    

建议：

XS：<300 LOC

S：300~800 LOC

M：800~1500 LOC

L：1500~2000 LOC

超过必须继续拆分。

---

# 输出结构

# 1. Architecture Baseline

识别系统基础能力。

输出：

## Domains

例如：

- Auth
    
- User
    
- Billing
    
- Workspace
    

---

## Bounded Contexts

说明：

- 领域边界
    
- 模块边界
    
- 数据边界
    

---

## Shared Infrastructure

列出：

- Database
    
- Cache
    
- Queue
    
- Storage
    
- Auth
    
- Logging
    
- Monitoring
    

---

## Foundational Changes

必须最先完成的基建能力：

例如：

- foundation-auth
    
- foundation-error-handling
    
- foundation-observability
    
- foundation-storage
    

说明：

为什么必须优先完成。

---

# 2. Epic Tree

输出：

Epic  
├── Feature  
├── Feature  
└── Feature

对于每个 Epic：

## User Value

## Business Value

## Technical Value

## Priority

P0 / P1 / P2

---

# 3. Feature Breakdown

对于每个 Feature：

## Feature Name

### Goal

### User Value

### Technical Scope

### Dependencies

### Risks

### Recommended Order

---

# 4. Change Breakdown

对于每个 Change：

## Change ID

格式：

domain-feature

例如：

auth-registration

workspace-member-invite

billing-subscription

---

## Change Type

枚举：

FOUNDATION

FEATURE

INTEGRATION

MIGRATION

REFACTOR

---

## Goal

一句话描述。

---

## Business Context

解决什么问题。

---

## Scope

包含：

不包含：

---

## Dependencies

依赖哪些 Change。

---

## Impact Analysis

输出：

Database

API

Frontend

Background Jobs

Cache

Queue

Storage

Monitoring

Logging

Tests

Docs

标记：

✓

✗

---

## Files Likely Affected

列出可能影响目录：

app/

components/

api/

db/

lib/

hooks/

services/

tests/

docs/

---

## Acceptance Criteria

采用：

Given

When

Then

---

## Rollback Strategy

说明：

如何回滚。

---

## Estimated Size

XS

S

M

L

---

## Estimated LOC

---

## Priority

P0

P1

P2

---

# 5. Dependency Graph

使用 Mermaid：

graph TD

change-a --> change-b

change-b --> change-c

change-c --> change-d

---

识别：

- 强依赖
    
- 弱依赖
    
- 循环依赖
    

如果发现循环依赖：

继续拆分直到消除。

---

# 6. Milestone Plan

输出：

## M0 Architecture Ready

完成：

- foundation changes
    

交付结果：

系统可启动。

---

## M1 MVP

完成：

核心用户流程。

交付结果：

用户可完成主流程。

---

## M2 Beta

完成：

增强能力。

交付结果：

内部测试。

---

## M3 GA

完成：

全部能力。

交付结果：

正式上线。

---

# 7. Release Plan

输出：

Phase 1

- change-a
    
- change-b
    

---

Phase 2

- change-c
    
- change-d
    

---

Phase 3

- ...
    

---

要求：

每个阶段结束后：

- 可运行
    
- 可测试
    
- 可部署
    
- 可回滚
    

---

# 8. OpenSpec Mapping

对于每个 Change：

输出：

## OpenSpec Change Name

例如：

auth-registration

---

## Proposed Specs

specs/auth/registration.md

---

## Proposed Design

changes/auth-registration/design.md

---

## Proposed Tasks

changes/auth-registration/tasks.md

---

## Related Epic

---

## Related Feature

---

# 9. AI Coding Agent Compatibility Check

检查：

## Context Explosion Risk

是否超出 AI 上下文能力。

---

## Oversized Change

是否超过推荐规模。

---

## Circular Dependency

是否存在循环依赖。

---

## Testing Difficulty

是否难以测试。

---

## Rollback Difficulty

是否难以回滚。

---

对于所有问题：

必须给出进一步拆分方案。

---

# 10. Final Review

从 Tech Lead 视角输出：

## Architecture Risk

## Delivery Risk

## Dependency Risk

## Scalability Risk

## Security Risk

## Operational Risk

---

给出：

方案A

方案B

方案C

并说明：

优点

缺点

适用场景

---

# 输出要求

遇到信息缺失：

不要自行假设。

使用：

【待确认】

标记。

同时提供：

方案A

方案B

方案C

最终输出质量要求：

- Tech Lead 可评审
    
- Architect 可评审
    
- OpenSpec 可执行
    
- Codex 可直接实现
    
- Claude Code 可直接实现
    
- 支持多人并行开发
    
- 支持分阶段上线
    
- 支持逐步交付
    
- 支持独立回滚
```

## 1.4 change生成

```
# Role

你是一名 Staff Software Engineer，同时兼任 Tech Lead。

你正在执行已经批准的：

- PRD
    
- Technical Design Document（TDD）
    
- Engineering Implementation Plan（EIP）
    

你的任务：

不是重新分析需求。

不是重新设计架构。

而是根据 Implementation Plan 中指定的 Change，生成可直接执行的工程变更规范（Change Specification）。

该规范将直接用于：

- OpenSpec Change
    
- Claude Code
    
- Codex
    
- Cursor
    

实施开发。

---

# 输入

## PRD

{{PRD}}

---

## Technical Design Document

{{TDD}}

---

## Engineering Implementation Plan

{{IMPLEMENTATION_PLAN}}

---

## Current Change

{{CHANGE_ID}}

例如：

auth-registration

workspace-member-invite

billing-subscription

---

# Change 生成原则

## 单一职责

一个 Change 只解决一个问题。

禁止：

- 多个用户价值混合
    
- 多个领域混合
    
- 多个核心流程混合
    

---

## 独立交付

必须满足：

- 独立开发
    
- 独立测试
    
- 独立 Review
    
- 独立 Merge
    
- 独立回滚
    

---

## 垂直切片

优先：

数据库

↓

API

↓

前端

↓

测试

作为一个完整 Change。

禁止：

数据库 Change

API Change

前端 Change

拆成多个层级 Change。

---

## AI Context Safety

Change 必须控制在：

- 1~3天工作量
    
- AI一次上下文可理解
    

如果超出：

继续拆分。

---

# 输出结构

# 1. Change Overview

## Change ID

例如：

auth-registration

---

## Change Type

枚举：

FOUNDATION

FEATURE

INTEGRATION

MIGRATION

REFACTOR

---

## Goal

一句话说明目标。

---

## User Value

用户获得什么能力。

---

## Business Value

业务获得什么收益。

---

## Related Epic

---

## Related Feature

---

## Priority

P0

P1

P2

---

# 2. Scope Definition

## Included

本 Change 必须实现：

- xxx
    
- xxx
    
- xxx
    

---

## Excluded

本 Change 不实现：

- xxx
    
- xxx
    
- xxx
    

---

## Out Of Scope

明确禁止扩展：

- xxx
    
- xxx
    

---

# 3. Technical Design Refinement

基于 TDD。

说明：

## 涉及模块

---

## 涉及领域模型

---

## 数据流

Mermaid：

```mermaid
flowchart TD

---

## 状态流转

Mermaid：

```mermaid
stateDiagram-v2

---

# 4. Impact Analysis

分析影响范围：

|Area|Impact|
|---|---|
|Database|✓/✗|
|API|✓/✗|
|Frontend|✓/✗|
|Cache|✓/✗|
|Queue|✓/✗|
|Storage|✓/✗|
|Logging|✓/✗|
|Monitoring|✓/✗|
|Tests|✓/✗|
|Docs|✓/✗|

---

# 5. File Planning

列出可能修改：

## New Files

---

## Modified Files

---

## Deleted Files

---

## Directory Impact

app/

components/

lib/

db/

api/

hooks/

tests/

docs/

---

# 6. Implementation Tasks

拆解为：

## Task 1

目标：

实施步骤：

完成标准：

---

## Task 2

目标：

实施步骤：

完成标准：

---

## Task N

---

要求：

每个 Task：

- ≤ 4小时
    
- 可独立验证
    
- 可独立提交
    

---

# 7. Dependencies

## Upstream Changes

依赖：

- change-a
    
- change-b
    

---

## Downstream Changes

被依赖：

- change-c
    
- change-d
    

---

## Blocking Risks

说明阻塞因素。

---

# 8. Acceptance Criteria

采用：

Given

When

Then

格式。

覆盖：

## Happy Path

---

## Error Path

---

## Edge Cases

---

## Permission Cases

---

## Retry Cases

---

# 9. Test Plan

## Unit Test

需要覆盖：

---

## Integration Test

需要覆盖：

---

## E2E Test

需要覆盖：

---

## Regression Test

需要覆盖：

---

# 10. Rollback Plan

说明：

## Code Rollback

---

## Data Rollback

---

## Config Rollback

---

## Feature Flag Rollback

---

# 11. OpenSpec Output

生成：

## change.md

变更目标。

---

## design.md

实现方案。

---

## tasks.md

任务列表。

---

要求：

符合 OpenSpec 标准结构。

---

# 12. AI Implementation Readiness Check

检查：

## Scope Too Large

是否超出 AI 单次能力。

---

## Hidden Dependencies

是否存在隐藏依赖。

---

## Context Explosion

是否存在上下文爆炸风险。

---

## Testing Gap

是否存在测试缺口。

---

## Rollback Risk

是否难以回滚。

---

如果发现问题：

继续拆分。

直到满足：

- OpenSpec 可直接创建 Change
    
- Claude Code 可直接实现
    
- Codex 可直接实现
    
- 单独 PR 可交付
    
- 单独上线可回滚
```

## 1.5 结构化摘要

### 1.5.1 PRD Summary

```
# Role

你是一位高级产品经理。

请将下面完整 PRD 压缩为 AI Coding Agent 可消费的需求摘要。

要求：

- 保留全部需求事实
    
- 删除背景描述
    
- 删除营销内容
    
- 删除重复内容
    
- 删除讨论过程
    

只保留：

1. 核心目标
    
2. 用户价值
    
3. 功能范围
    
4. 用户流程
    
5. 状态机
    
6. 权限模型
    
7. 验收标准
    
8. 边界条件
    

输出格式：

# Project Summary

## Goals

## In Scope

## Out Scope

## User Flows

## State Machines

## Permission Model

## Acceptance Criteria

## Edge Cases

长度控制：

原文 10~20%
```

### 1.5.2 TDD Summary

```
# Role

你是一位 Staff Engineer。

请将完整 TDD 压缩成 AI Agent 技术摘要。

要求：

删除：

- 设计讨论
    
- 备选方案
    
- 历史决策
    

保留：

1. 系统架构
    
2. 核心模块
    
3. 数据模型
    
4. API Contract
    
5. 状态流转
    
6. 权限模型
    
7. 缓存策略
    
8. 依赖关系
    
9. 风险点
    

输出格式：

# Technical Summary

## Architecture

## Modules

## Domain Models

## APIs

## State Machines

## Permissions

## Cache Strategy

## Dependencies

## Risks

长度控制：

原文 10~20%
```

# 2. AI Coding

## 2.1 目前流程

```
对于长文本的内容，例如几十页的 PRD

先让 ai 生成一份重点规划实践大纲

之后根据大纲进行单独的 change 实现
```

与openspec结合：
```
生成完具体的 change 文档后

可以使用 /opsx:explore 命令 根据 目前项目 review change 文档

根据错误和问题再让 ai 单独对 change 文档进行修改、补丁

总之还是花费很多的时间先对其需求

之后再进行编码，还是对齐需求
```

存在的问题：
```
我现在的流程是

把我的想法跟ai讨论，生成一篇PRD

然后跟据PRD进行大纲生成

之后根据大纲进行单独的chage变更生成

本质应该是不断细化，而不是回到了抽象
```
## 2.2 可以优化的点

大厂的开发流程本质上是**不断细化，而不是不断重新解释需求**

```
生成产品 PRD 是解释要做什么和为什么做

根据PRD生成技术设计文档 是解释要怎么设计，系统怎么配合

根据PRD和技术设计文档生成实施计划 是先做什么，后做什么，怎么交付

根据PRD和技术设计文档和实施计划生成change 就是给ai单独完成的文档

本质是不断细化的过程
```

```
Volcano AI 微课视频生成平台技术设计文档评审

  ---
  📊 评审概要

  文档版本: v1.0.0
  评审日期: 2026-06-15
  评审人: Staff Engineer & System Architect
  评审范围: 全文档 20 章节，4529 行

  ---
  ⭐ 整体评价

  优点

  ✅ 架构设计清晰：模块边界明确，依赖关系清晰，符合大型互联网公司标准
  ✅ 数据模型完整：10 张表设计合理，索引策略清晰，外键约束完整
  ✅ 状态机设计严谨：ProjectStatus 和 JobStatus 流转规则明确，覆盖异常场景
  ✅ 一致性设计深入：幂等、补偿、Outbox Pattern 考虑周全
  ✅ 可观测性完善：日志、指标、追踪、告警设计完整
  ✅ 风险评估全面：技术、性能、数据、安全、成本五大维度覆盖

  待改进

  ⚠️ 部分设计缺少实现细节：某些关键流程需要补充伪代码
  ⚠️ 性能指标缺少压测依据：目标值需要验证可行性
  ⚠️ 边界条件处理不完整：某些异常场景缺少明确处理方案

  ---
  🔴 严重问题（必须修复）

  1. Inngest 事件可靠性保障不完整

  问题位置: 第 11.4 章一致性设计

  问题描述:
  文档提到了 Outbox Pattern + 定时修复的双保险机制，但实现细节存在漏洞：

  // 当前设计（第 11.4.2 章节）
  setInterval(async () => {
    const events = await db.outboxEvent.findMany({
      where: { status: 'Pending' },
    });

    for (const event of events) {
      try {
        await inngest.send({
          name: event.eventName,
          data: event.payload,
        });

        await db.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'Sent', sentAt: new Date() },
        });
      } catch (error) {
        console.error(`Failed to send outbox event ${event.id}:`, error);
      }
    }
  }, 5000);

  严重问题:
  2. 缺少事务保护: inngest.send() 成功但 outboxEvent.update() 失败会导致事件重复发送
  3. 缺少重试上限: 永久失败的事件会无限重试，占用资源
  4. 错误处理不完善: 仅 console.error 无法触发告警

  解决方案:

  方案 A（推荐）: 增加重试计数 + 死信队列

  // 1. OutboxEvent 表增加字段
  model OutboxEvent {
    // ... 现有字段
    retryCount    Int      @default(0)
    maxRetries    Int      @default(3)
    lastError     String?
    status        Enum     // Pending / Sent / Failed / DeadLetter
  }

  // 2. 改进轮询逻辑
  setInterval(async () => {
    const events = await db.outboxEvent.findMany({
      where: {
        status: 'Pending',
        retryCount: { lt: db.raw('maxRetries') },
      },
    });

    for (const event of events) {
      try {
        await inngest.send({
          name: event.eventName,
          data: event.payload,
        });

        // 原子更新
        await db.outboxEvent.update({
          where: {
            id: event.id,
            status: 'Pending',  // 乐观锁
          },
          data: {
            status: 'Sent',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        const newRetryCount = event.retryCount + 1;
        const newStatus = newRetryCount >= event.maxRetries ? 'DeadLetter' : 'Pending';

        await db.outboxEvent.update({
          where: { id: event.id },
          data: {
            retryCount: newRetryCount,
            status: newStatus,
            lastError: error.message,
          },
        });

        // 告警
        if (newStatus === 'DeadLetter') {
          await alertService.send({
            level: 'critical',
            message: `Outbox event ${event.id} moved to dead letter queue`,
          });
        }
      }
    }
  }, 5000);

  方案 B: 使用 Inngest 自带的 Outbox 插件（如存在）

  方案 C: 迁移到专业的消息队列（Kafka/RabbitMQ）

  建议: 第一版采用方案 A，预留方案 C 的迁移路径。

  ---
  5. 并发控制的 Advisory Lock 实现存在死锁风险

  问题位置: 第 11.2.2 章幂等实现示例 + EP2-01 Change 文档

  问题描述:
  当前设计使用 pg_advisory_xact_lock(hashUserId(userId))
  来序列化同一用户的并发请求，但存在以下问题：

  6. Hash 冲突风险: hashUserId() 的哈希算法未定义，可能导致不同用户被映射到同一个锁 ID
  7. 锁超时未定义: PostgreSQL advisory lock 默认无超时，可能导致长时间阻塞
  8. 锁粒度过粗: 用户级锁会阻塞该用户的所有操作（包括查询项目列表）

  解决方案:

  【待确认】: hashUserId() 的具体实现算法

  方案 A（推荐）: 使用 CRC32 + 模运算，确保冲突率 < 0.1%

  // src/server/utils/lock.ts
  import crc32 from 'crc-32';

  export function hashUserId(userId: string): bigint {
    // CRC32 生成 32 位整数
    const hash = crc32.str(userId);
    // 映射到 PostgreSQL bigint 范围的正数空间（避免负数）
    return BigInt(Math.abs(hash)) + 1000000n;  // 偏移避免与系统锁冲突
  }

  方案 B: 使用 Redis 分布式锁替代 advisory lock

  // 优点：跨实例、支持超时、更灵活
  // 缺点：引入 Redis 依赖、需处理 Redis 不可用场景
  const lock = await redlock.acquire([`user:${userId}:create`], 5000);
  try {
    // ... 创建项目逻辑
  } finally {
    await lock.release();
  }

  方案 C: 锁粒度降低到"创建项目"操作级别

  // 仅锁住"创建项目"操作，不影响其他操作
  await tx.$executeRawUnsafe(
    `SELECT pg_advisory_xact_lock($1::bigint)`,
    hashUserId(userId) + hashString('create_project'),  // 组合键
  );

  建议: 采用方案 A + 方案 C 组合，并在文档中明确：
  - Hash 算法：CRC32
  - 锁超时策略：statement_timeout 设置为 10 秒
  - 监控指标：lock_wait_time > 3s 触发告警

  ---
  3. TTS 音频复用的 checksum 计算逻辑不完整

  问题位置: 第 6.2.5 章 Asset 表设计

  问题描述:
  文档提到音频复用通过 checksum 字段查询，计算规则为：
  SHA256(textHash + voiceProvider + voiceId + speed)

  但存在以下问题：

  4. speed 参数未在 Scene 表中定义: Scene 表和 Storyboard Schema 均未包含 speed 字段
  5. textHash 的哈希算法未定义: 是 SHA256 还是其他？
  6. 大小写敏感性未说明: "你好" 和 "你好 " （末尾空格）是否视为相同？
  7. 标点符号归一化: "你好！" 和 "你好!" （中英文标点）是否视为相同？

  解决方案:

  【待确认】: TTS API 是否支持 speed 参数？PRD 中未提及

  方案 A（推荐）: 如果不支持 speed，从 checksum 中移除

  // src/server/utils/audio-checksum.ts
  export function calculateAudioChecksum(params: {
    text: string;
    voiceProvider: string;
    voiceId: string;
  }): string {
    // 1. 文本归一化
    const normalizedText = params.text
      .trim()                          // 去除首尾空格
      .replace(/\s+/g, ' ')            // 多个空格合并为一个
      .replace(/[!！]/g, '!')          // 中英文标点归一化
      .replace(/[?？]/g, '?')
      .replace(/[,，]/g, ',')
      .replace(/[。.]/g, '.');

    // 2. 组合参数
    const combined = `${normalizedText}|${params.voiceProvider}|${params.voiceId}`;

    // 3. SHA256 计算
    return crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
  }

  方案 B: Scene 表增加 speed 字段（需要同步更新 Storyboard Schema）

  建议: 采用方案 A，并在 TDD 第 6.2.5 章节补充完整的 checksum 计算伪代码。

  ---
  🟡 重要问题（强烈建议修复）

  8. 性能目标缺少压测依据

  问题位置: 第 2 章技术目标

  问题描述:
  文档定义了以下性能目标：

  ┌────────────────────┬───────────┐
  │        指标        │  目标值   │
  ├────────────────────┼───────────┤
  │ 3 分钟视频生成 P75 │ ≤ 10 分钟 │
  ├────────────────────┼───────────┤
  │ 3 分钟视频生成 P95 │ ≤ 15 分钟 │
  └────────────────────┴───────────┘

  但未说明：
  9. LLM 生成 Storyboard 耗时: DeepSeek API 响应时间未知
  10. TTS 批量调用耗时: 并发 5 个 Scene 的真实耗时未验证
  11. Remotion 渲染耗时: 3 分钟视频在目标机器配置下的实际耗时未测试

  建议:
  12. 补充附录章节：A.1 性能基准测试结果
  13. 提供各环节的预估耗时拆解：

  假设 3 分钟视频包含 10 个 Scene：
  - LLM 生成 Storyboard: 30s - 60s（P95）
  - TTS 批量生成（10 scenes，并发 5）: 2 * (10/5) * 5s = 20s - 40s
  - Timeline 计算: 1s
  - Remotion 渲染: 180s / 30fps = 5400 frames，预估 5-8 分钟（P95）
  - R2 上传: 30s - 60s（50MB 视频）
  总计: 6.5 - 11 分钟（P95）

  结论: 目标 15 分钟可达成，但需要验证 Remotion 渲染性能

  3. 如果无法提前压测，标注为 【待压测验证】

  ---
  4. Remotion Worker 架构缺少故障隔离设计

  问题位置: 第 3 章总体架构设计 + 第 14 章部署架构

  问题描述:
  文档提到"独立 Worker 承载渲染"，但未说明：

  5. Worker 崩溃后如何恢复: 渲染进行到一半 OOM，Project 状态如何处理？
  6. Worker 队列管理: 多个用户同时渲染，如何排队？
  7. Worker 横向扩展: 如何动态增加 Worker 实例？

  建议:

  补充第 14.3 章节：Remotion Worker 部署方案

  方案 A（第一版推荐）: 单实例 Worker + 任务队列

  架构:
  Next.js Web (Port 3000)
    ↓ HTTP POST /render
  Remotion Worker (Port 4000, 单实例)
    ├─ 任务队列（内存队列，最大 10 个）
    └─ 渲染进程（Node.js + Puppeteer）

  故障处理:
  - Worker 崩溃 → Docker 自动重启 → 重新从 Inngest 拉取任务
  - 渲染超时（> 15 分钟）→ Inngest 自动重试

  限制:
  - 同时渲染 1 个视频（避免 OOM）
  - 队列满时返回 503，Inngest 延迟重试

  方案 B（未来扩展）: 多实例 Worker + Redis 队列

  架构:
  Next.js Web → Redis Bull Queue ← Worker 1, 2, 3...

  优势:
  - 支持横向扩展
  - 任务持久化
  - 优先级队列

  复杂度:
  - 引入 Redis 依赖
  - 需要 Worker 注册发现机制

  建议: 文档中明确第一版使用方案 A，预留方案 B 的迁移路径。

  ---
  6. 数据库索引策略缺少查询模式分析

  问题位置: 第 6.2 章核心表设计

  问题描述:
  虽然每张表都定义了索引，但未说明：

  7. 索引选择依据: 为什么选择 userId_createdAt_idx 而不是 userId_status_idx？
  8. 复合索引顺序: 为什么 (userId, createdAt DESC) 而不是 (createdAt DESC, userId)？
  9. 缺少慢查询分析: 未来可能的慢查询场景是什么？

  建议:

  补充第 6.2 章节：索引设计原则

  ## 6.2.X 索引设计原则

  ### 查询模式分析

  **Project 表的主要查询**:
  10. 查询用户的项目列表（分页）:
     ```sql
     SELECT * FROM Project
     WHERE userId = ? AND status IN (?)
     ORDER BY createdAt DESC
     LIMIT 12 OFFSET ?;
     → 索引: userId_createdAt_idx (userId, createdAt DESC)

  11. 管理员查询所有项目（按状态筛选）:
  SELECT * FROM Project
  WHERE status = ?
  ORDER BY createdAt DESC
  LIMIT 12;
  12. → 索引: status_createdAt_idx (status, createdAt DESC)
  13. 查询单个项目详情:
  SELECT * FROM Project WHERE id = ?;
  14. → 主键索引自动覆盖

  索引选择依据

  ┌──────────────────────┬──────────────┬──────┬────────┬───────────────────────────┐
  │         索引         │   查询模式   │ 基数 │ 选择性 │         是否必需          │
  ├──────────────────────┼──────────────┼──────┼────────┼───────────────────────────┤
  │ userId_createdAt_idx │ 用户项目列表 │ 高   │ 高     │ ✅ 必需                   │
  ├──────────────────────┼──────────────┼──────┼────────┼───────────────────────────┤
  │ status_idx           │ 按状态筛选   │ 低   │ 中     │ ⚠️                        │
  │                      │              │      │        │ 可选（管理员查询频率低）  │
  ├──────────────────────┼──────────────┼──────┼────────┼───────────────────────────┤
  │ status_createdAt_idx │ 管理员列表   │ 中   │ 中     │ 【待确认】是否需要？      │
  └──────────────────────┴──────────────┴──────┴────────┴───────────────────────────┘

  索引维护成本

  - 写入放大: 每次 INSERT/UPDATE 需要更新 3-4 个索引
  - 存储成本: 预估 100 万项目时，索引总大小 ~500MB
  - 建议: 定期执行 REINDEX 优化索引碎片

  **【待确认】**: 管理员查询频率？如果 < 1% 流量，可以移除 `status_idx`

  ---

  ### 7. API 限流策略缺少突发流量处理

  **问题位置**: 第 7.2 章 API 设计

  **问题描述**:
  文档定义了限流策略：
  - 创建项目 API: 10 次/分钟
  - 查询项目列表: 50 次/分钟

  但未说明：
  1. **突发流量处理**: 用户短时间内点击 10 次"生成"按钮，前端如何防抖？
  2. **限流粒度**: 按 IP 限流还是按 userId 限流？
  3. **限流响应**: 返回 `429 Too Many Requests` 后，前端如何提示？

  **建议**:

  补充第 7.2 章节：**限流策略详细说明**

  ```markdown
  ## 7.2.X 限流策略

  ### 限流粒度

  | API | 限流键 | 限流值 | 窗口 | 超限响应 |
  |-----|--------|--------|------|---------|
  | `project.createAndGenerate` | `userId` | 10 次 | 1 分钟 | `RATE_LIMIT_EXCEEDED` +
  `retryAfter: 60s` |
  | `project.list` | `userId` | 50 次 | 1 分钟 | `RATE_LIMIT_EXCEEDED` |
  | 所有 API | `ip` | 100 次 | 1 分钟 | 防 DDoS |

  ### 限流算法

  使用 **Sliding Window Counter** 算法（Redis 实现）:

  ```typescript
  import { RateLimiterRedis } from 'rate-limiter-flexible';

  const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    points: 10,           // 允许 10 次请求
    duration: 60,         // 60 秒窗口
    blockDuration: 60,    // 超限后阻塞 60 秒
  });

  // 中间件
  export const rateLimitMiddleware = async (ctx) => {
    try {
      await rateLimiter.consume(ctx.session.user.id);
    } catch (error) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `超出限流，请 ${error.msBeforeNext / 1000} 秒后重试`,
      });
    }
  };

  前端防抖

  // 创建项目按钮
  <Button
    onClick={debounce(handleCreate, 1000)}  // 1 秒防抖
    disabled={isCreating || isRateLimited}
  >
    生成视频
  </Button>

  ---

  ## 🟢 次要问题（建议优化）

  ### 8. Storyboard Schema 版本化策略不完整

  **问题位置**: 第 2 章技术目标 + 第 6.2.3 章 StoryboardVersion 表

  **问题描述**:
  文档提到"支持 schema 升级，旧版本仍可渲染"，但未说明：

  4. **Schema 版本号格式**: `1.0` 还是 `v1`？
  5. **向后兼容策略**: 新增字段如何处理旧版本数据？
  6. **版本迁移流程**: 如何批量升级旧版本 Storyboard？

  **建议**:

  补充附录章节：**A.2 Storyboard Schema 版本管理**

  ```markdown
  ## A.2 Storyboard Schema 版本管理

  ### 版本号格式

  遵循 **Semantic Versioning**:
  - `1.0`: 初始版本
  - `1.1`: 新增可选字段（向后兼容）
  - `2.0`: 破坏性变更（不兼容）

  ### 向后兼容策略

  **示例：v1.0 → v1.1 新增 `scene.animationPreset` 字段**

  ```typescript
  // Remotion 模板需兼容两个版本
  function TitleSlide({ scene }: { scene: SceneV1_0 | SceneV1_1 }) {
    const animation = scene.animationPreset ?? 'fadeIn';  // 默认值兼容 v1.0
    return <Sequence>{/* ... */}</Sequence>;
  }

  破坏性变更处理

  示例：v1.0 → v2.0 scene.visual 结构变更

  需要提供迁移脚本:
  // scripts/migrate-storyboard-v2.ts
  async function migrate() {
    const v1Storyboards = await db.storyboardVersion.findMany({
      where: { schemaVersion: '1.0' },
    });

    for (const sb of v1Storyboards) {
      const v2Json = convertV1ToV2(sb.storyboardJson);
      await db.storyboardVersion.create({
        data: {
          projectId: sb.projectId,
          version: sb.version + 1,
          schemaVersion: '2.0',
          storyboardJson: v2Json,
        },
      });
    }
  }

  【待确认】: 是否需要在线迁移还是离线批量迁移？

  ---

  ### 9. 错误码体系缺少统一标准

  **问题位置**: 第 7.2 章 API 设计 + EP2-01 Change 文档

  **问题描述**:
  当前错误码分散在各个 API 定义中，格式不统一：
  - 有的用 `QUOTA_EXCEEDED`
  - 有的用 `[CONCURRENT_LIMIT]` 前缀

  **建议**:

  补充第 12.X 章节：**错误码设计规范**

  ```markdown
  ## 12.X 错误码设计规范

  ### 错误码格式

  <DOMAIN><ERROR_TYPE><DETAIL>

  示例:
  - `PROJECT_QUOTA_EXCEEDED`: 项目额度超限
  - `PROJECT_CONCURRENT_LIMIT_EXCEEDED`: 并发限制超限
  - `TTS_PROVIDER_UNAVAILABLE`: TTS 服务不可用
  - `RENDER_TIMEOUT`: 渲染超时

  ### 错误响应结构

  ```typescript
  interface AppError {
    code: string;              // 错误码
    message: string;           // 用户可读消息（中文）
    details?: Record<string, any>;  // 扩展信息
    retryable: boolean;        // 是否可重试
    retryAfter?: number;       // 重试等待时间（秒）
  }

  错误码清单

  ┌───────────────────────────────────┬─────────┬─────────────┬────────────────────┐
  │              错误码               │  HTTP   │    说明     │       可重试       │
  │                                   │ Status  │             │                    │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ AUTH_UNAUTHORIZED                 │ 401     │ 未登录      │ ❌                 │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ AUTH_FORBIDDEN                    │ 403     │ 无权限      │ ❌                 │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ PROJECT_NOT_FOUND                 │ 404     │ 项目不存在  │ ❌                 │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ PROJECT_QUOTA_EXCEEDED            │ 429     │ 超出额度    │ ❌                 │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ PROJECT_CONCURRENT_LIMIT_EXCEEDED │ 429     │ 并发超限    │ ✅ (60s 后)        │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ PROVIDER_LLM_UNAVAILABLE          │ 503     │ LLM         │ ✅ (指数退避)      │
  │                                   │         │ 服务不可用  │                    │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ PROVIDER_TTS_RATE_LIMIT           │ 429     │ TTS 限流    │ ✅ (按 API 返回的  │
  │                                   │         │             │ Retry-After)       │
  ├───────────────────────────────────┼─────────┼─────────────┼────────────────────┤
  │ RENDER_TIMEOUT                    │ 504     │ 渲染超时    │ ✅ (Inngest        │
  │                                   │         │             │ 自动重试)          │
  └───────────────────────────────────┴─────────┴─────────────┴────────────────────┘

  ---

  ### 10. 测试覆盖率目标缺少实现路径

  **问题位置**: 第 17 章测试策略

  **问题描述**:
  文档定义了测试覆盖率目标：
  - Unit Tests: ≥ 70%
  - Integration Tests: ≥ 50%

  但未说明：
  1. **覆盖率统计工具**: 使用 Jest Coverage 还是其他？
  2. **覆盖率 CI 检查**: 如何在 CI 中强制执行？
  3. **豁免规则**: 哪些代码可以豁免覆盖（如自动生成的 Prisma Client）？

  **建议**:

  补充第 17.6 章节：**测试覆盖率实施方案**

  ```markdown
  ## 17.6 测试覆盖率实施方案

  ### 覆盖率统计工具

  使用 **Vitest Coverage** (基于 c8):

  ```json
  // vitest.config.ts
  export default defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          '**/*.d.ts',
          '**/*.config.ts',
          '**/prisma/generated/**',  // Prisma Client 自动生成代码
          '**/.next/**',
        ],
        thresholds: {
          global: {
            statements: 70,
            branches: 65,
            functions: 70,
            lines: 70,
          },
        },
      },
    },
  });

  CI 检查

  # .github/workflows/test.yml
  - name: Run tests with coverage
    run: pnpm test:coverage

  - name: Check coverage thresholds
    run: |
      if [ $(jq '.total.statements.pct' coverage/coverage-summary.json) -lt 70 ]; then
        echo "Coverage below 70%"
        exit 1
      fi

  覆盖率监控

  集成 Codecov 或 Coveralls，在 PR 中展示覆盖率变化。

  ---

  ## ✅ 架构决策记录（ADR）建议

  文档中存在多处"方案 A / B / C"的设计决策，但未明确最终选择和理由。建议补充 **第 21
  章：架构决策记录（ADR）**：

  ```markdown
  ## 21. 架构决策记录（Architecture Decision Records）

  ### ADR-001: Inngest 事件可靠性保障

  **状态**: 已决策
  **决策日期**: 2026-06-14
  **决策人**: Tech Lead

  **上下文**:
  Inngest 事件发送可能因网络异常失败，导致项目卡在 queued 状态。

  **备选方案**:
  - 方案 A: Outbox Pattern + 定时重试
  - 方案 B: 监控 + 人工介入
  - 方案 C: 使用 Kafka 替代 Inngest

  **决策**: 采用方案 A

  **理由**:
  - 保证最终一致性
  - 实现成本低
  - 无需人工介入

  **后果**:
  - 需要实现 OutboxEvent 表
  - 需要定时任务扫描
  - 事件可能重复发送（需幂等）

  ---

  ### ADR-002: 音频复用策略

  **状态**: 已决策
  **决策日期**: 2026-06-14

  **决策**: 通过 checksum (SHA256) 查询已有音频复用

  **理由**:
  - 降低 TTS 成本
  - 减少生成时间

  **权衡**:
  - 需要额外的查询开销
  - 可能出现 checksum 冲突（概率极低）

  ---

  （后续补充其他 ADR...）

  ---
  📋 待确认清单

  以下问题需要在实施前明确：

  ┌─────┬──────────────────────────────┬───────────┬────────┬──────────────────────┐
  │  #  │             问题             │   章节    │ 优先级 │       建议方案       │
  ├─────┼──────────────────────────────┼───────────┼────────┼──────────────────────┤
  │ 1   │ TTS API 是否支持 speed       │ 6.2.5     │ 高     │ 查阅 MiniMax API     │
  │     │ 参数？                       │           │        │ 文档                 │
  ├─────┼──────────────────────────────┼───────────┼────────┼──────────────────────┤
  │ 2   │ DeepSeek API 平均响应时间？  │ 2         │ 高     │ 压测验证             │
  │     │                              │ 性能目标  │        │                      │
  ├─────┼──────────────────────────────┼───────────┼────────┼──────────────────────┤
  │     │                              │           │        │                      │
  └─────┴──────────────────────────────┴───────────┴────────┴──────────────────────┘
```