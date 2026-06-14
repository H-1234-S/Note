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

## 1.4 change生cheng
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
产品PRD
        ↓
技术设计文档
        ↓
Epic（实施计划）
        ↓
Change 01
Change 02
Change 03
...
        ↓
PR / Code Review
        ↓
测试验证
```