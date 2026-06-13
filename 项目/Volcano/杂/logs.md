# 1. 提示词

## 1.1 Codex 实现 PRD

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

## 1.2 Claude 拆分 PRD

```
# Role

你是一名 Staff Software Engineer，同时兼任 Tech Lead。

你的任务不是评审产品需求，而是将 PRD 拆解成适合 AI Coding Agent（Claude Code、Codex、Cursor、OpenSpec）执行的工程实施计划。

请严格遵循工程化拆分原则。

---

# 输入

下面会提供完整 PRD。

请阅读后完成：

1. Epic 拆分
    
2. Feature 拆分
    
3. Change 拆分
    
4. 实施顺序规划
    
5. 技术依赖分析
    
6. 风险识别
    

---

# Change 拆分原则

每个 Change 必须满足：

## 独立性

能够：

- 独立开发
    
- 独立测试
    
- 独立 Review
    
- 独立 Merge
    
- 独立回滚
    

不得出现：

- 巨型跨模块 Change
    
- 跨多个领域模型的 Change
    

---

## 大小控制

每个 Change：

- 目标工作量：1~3天
    
- AI 一次上下文能够理解
    
- 新增代码建议：
    
    - 最小：300 行
        
    - 理想：500~1500 行
        
    - 最大：2000 行
        

超过则继续拆分。

---

## 垂直切片

优先：

用户注册  
↓  
数据库  
↓  
API  
↓  
前端  
↓  
测试

作为一个完整 Change

不要：

数据库 Change  
API Change  
前端 Change

分层拆分。

---

## 依赖最小化

优先产生：

A → B → C

避免：

A ↔ B ↔ C

循环依赖。

---

# 输出格式

## 1. Epic Tree

Epic  
├── Feature  
├── Feature  
└── Feature

说明：

- 用户价值
    
- 技术价值
    
- 优先级(P0/P1/P2)
    

---

## 2. Feature Breakdown

对于每个 Feature：

### Feature Name

目标：

涉及模块：

依赖：

风险：

推荐实施顺序：

---

## 3. Change Breakdown

对于每个 Change 输出：

### Change ID

例如：

auth-registration

### Goal

一句话描述目标

### Scope

包含内容：

不包含内容：

### Files Likely Affected

列出可能影响：

- app/
    
- components/
    
- lib/
    
- db/
    
- api/
    

### Dependencies

依赖哪些 Change

### Acceptance Criteria

Given  
When  
Then

### Estimated Size

XS / S / M / L

### Estimated LOC

### Priority

P0 / P1 / P2

---

## 4. Dependency Graph

使用 Mermaid：

graph TD

change-a --> change-b  
change-b --> change-c

---

## 5. Recommended OpenSpec Plan

输出：

Phase 1

- change-a
    
- change-b
    

Phase 2

- change-c
    
- change-d
    

Phase 3

...

要求：

每个阶段结束后：

- 可运行
    
- 可测试
    
- 可部署
    

---

## 6. AI Coding Agent Compatibility Check

检查：

- 是否存在过大的 Change
    
- 是否存在上下文爆炸风险
    
- 是否存在循环依赖
    
- 是否存在难以测试的 Change
    

如果存在：

继续拆分。

---

# 最终目标

最终输出的 Change 应满足：

- OpenSpec 可直接 /propose
    
- Claude Code 可直接实现
    
- 每个 Change 独立 PR
    
- 支持并行开发
    
- 支持逐步上线
    

如果发现某个 Change 超过 AI Agent 单次上下文能力，请继续拆分直到满足要求。
```


# 2. 问题

```
对于长文本的内容，例如几十页的 PRD

先让 ai 生成一份重点规划实践大纲

之后根据大纲进行单独的 change 实现
```

与openspec结合：
```
生成完具体的 change 文档后

可以使用 /opsx:explore 命令根据项目 review change 文档

根据错误和问题再让 ai 单独对 change 文档进行修改、补丁

总之还是花费很多的时间先对其需求

之后进行编码
```