# 1. 提示词

## 1.1 Codex 实现 PRD

```

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

