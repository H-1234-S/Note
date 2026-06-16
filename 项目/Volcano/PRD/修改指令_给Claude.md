# 实施计划文档修改指令

## 📋 任务概述

你需要基于`实施计划审查报告.md`和`实施计划_修改补充.md`，修改`Volcano AI 微课视频平台 — 实施计划.md`文档。

## 🎯 修改目标

修复 P0 和 P1 级问题，使文档完全符合 Engineering Implementation Plan 模板要求。

---

## 📍 文件位置

工作目录：`E:\A\Note\项目\Volcano\PRD\`

相关文件：
1. `Volcano AI 微课视频平台 — 实施计划.md` - 原文档（需要修改）
2. `实施计划审查报告.md` - 审查报告（参考）
3. `实施计划_修改补充.md` - 补充内容（直接使用）

---

## ✅ 具体修改步骤

### Step 1: 删除第1章的重复内容

**操作：** 删除原文档第15-36行的"🎯 核心优化原则"章节

**原因：** 这部分内容与后续章节重复，审查报告指出文档结构混乱

**检查点：**
- ✅ 删除后，文档直接从"## 0. 项目当前状态"开始
- ✅ 章节编号连续

---

### Step 2: 插入第3章 Feature Breakdown

**位置：** 在原文档第2章"Epic Tree"之后（约第990行之后）

**内容来源：** `实施计划_修改补充.md` 的"## 3. Feature Breakdown"章节

**操作步骤：**
1. 找到原文档中的"## 2. Epic Tree"章节结束位置
2. 在其后插入新的"## 3. Feature Breakdown"章节
3. 复制补充文档中的完整 Feature Breakdown 内容（Epic 2-4 的所有 Features）

**检查点：**
- ✅ 新章节编号为"## 3. Feature Breakdown"
- ✅ 包含至少 7 个 Features（F2.1-F2.4, F3.1-F3.2, F4.1）
- ✅ 每个 Feature 包含：Goal、User Value、Technical Scope、Dependencies、Risks、Recommended Order

---

### Step 3: 插入垂直切片原则的例外说明

**位置：** 在原文档第4章"Change Breakdown"之前（在新的第3章之后）

**内容来源：** `实施计划_修改补充.md` 的"## 垂直切片原则的例外说明"章节

**操作步骤：**
1. 找到第4章"Change Breakdown"的开始位置
2. 在其前插入"## 垂直切片原则的例外说明"章节
3. 复制补充文档中的完整说明内容

**检查点：**
- ✅ 包含背景、例外理由、缓解措施、交付节奏、总结
- ✅ 说明了为什么采用"水平切片"策略

---

### Step 4: 全局替换 Change 名称

**操作：** 使用补充文档中的"Change 命名对照表"进行全局替换

**重要提示：**
- 使用"查找和替换"功能，确保替换所有出现的位置
- 包括：Change 标题、Dependencies 引用、Dependency Graph、Release Plan 等所有位置

**替换列表（Phase 1-6）：**

```
# Phase 1
api-01-project-crud → project-lifecycle-api
api-02-quota-validation → project-quota-control
api-03-project-actions → project-advanced-actions

# Phase 2
ai-01-storyboard-types → content-storyboard-schema
ai-02-llm-provider → content-llm-integration
ai-03-inngest-storyboard → content-storyboard-generation

# Phase 3
tts-01-provider-interface → asset-tts-provider
tts-02-r2-storage → asset-storage-service
tts-03-inngest-audio → asset-audio-generation
tts-04-asset-signed-url-api → asset-access-control

# Phase 4
remotion-01-foundation → render-foundation-setup
remotion-02-templates → render-ppt-templates
remotion-03-worker → render-worker-service
remotion-04-integration → render-video-composition

# Phase 5
ui-01-generate-tab-integration → project-create-ui
ui-02-history-tab-integration → project-dashboard-ui
ui-03-progress-view → project-progress-tracking
ui-04-video-result → project-result-display

# Phase 6
ops-01-error-handling → system-error-handling
ops-02-logging → system-logging
ops-03-monitoring → system-monitoring
```

**检查点：**
- ✅ 在 Chapter 1（优化后的实施策略）中替换
- ✅ 在 Chapter 2（详细 Change Breakdown）中替换
- ✅ 在 Chapter 4（Change Breakdown）中替换
- ✅ 在 Chapter 5（Dependency Graph Mermaid 图）中替换
- ✅ 在 Chapter 7（Release Plan）中替换
- ✅ 在 Chapter 12（OpenSpec Mapping）中替换
- ✅ 使用 Grep 工具搜索旧命名，确认没有遗漏

---

### Step 5: 为关键 Changes 补充 Business Context

**操作：** 在第4章的关键 Changes 中添加 Business Context 章节

**需要添加的 Changes：**
1. project-lifecycle-api
2. content-storyboard-generation
3. asset-audio-generation
4. render-video-composition

**内容来源：** `实施计划_修改补充.md` 的"Business Context 补充"章节

**插入位置：** 在每个 Change 的 "Change ID" 之后、"Goal" 之前

**格式：**
```markdown
#### Change: `project-lifecycle-api`

**Change ID**: project-lifecycle-api
**Change Type**: FEATURE

**Business Context**: 
[从补充文档复制相应内容]

**Goal**: 
[原有内容保持不变]
```

**检查点：**
- ✅ 4 个关键 Changes 都添加了 Business Context
- ✅ Business Context 回答了"解决什么问题"和"用户价值"

---

### Step 6: 更新 Dependency Graph (Mermaid)

**位置：** 原文档第5章或附近的 Mermaid 图

**操作：** 替换 Mermaid 图中的所有 Change 名称

**提示：**
- 使用 Step 4 的替换列表
- 在 Mermaid 代码块中全局替换
- 注意保持图的结构和依赖关系不变

**检查点：**
- ✅ Mermaid 图中所有节点名称已更新
- ✅ 依赖箭头关系保持不变
- ✅ Mermaid 语法正确（可以渲染）

---

### Step 7: 更新版本号和变更记录

**位置：** 文档末尾的"变更记录"章节

**操作：** 添加新的版本记录

**新增内容：**
```markdown
| v2.1.0 | 2026-06-16 | P0/P1 修复：1) 新增第3章 Feature Breakdown；2) 新增垂直切片原则例外说明；3) 全局重命名 Changes（domain-feature 格式）；4) 为关键 Changes 补充 Business Context；5) 更新 Dependency Graph |
```

**同时更新文档信息表：**
```markdown
| 版本 | v2.1.0 |
| 更新时间 | 2026-06-16 |
```

**检查点：**
- ✅ 版本号更新为 v2.1.0
- ✅ 变更记录添加完整
- ✅ 更新时间为 2026-06-16

---

## 🔍 最终检查清单

修改完成后，请逐项检查：

### 文档结构
- [ ] 删除了第1章"🎯 核心优化原则"的重复内容
- [ ] 新增了第3章"Feature Breakdown"
- [ ] 新增了"垂直切片原则的例外说明"（在第4章之前）
- [ ] 章节编号连续（0, 1, 2, 3, ..., 14）

### 内容完整性
- [ ] 第3章包含至少 7 个 Features（Epic 2-4）
- [ ] 每个 Feature 都有 6 个必需字段
- [ ] 垂直切片例外说明包含：背景、理由、缓解措施、交付节奏
- [ ] 4 个关键 Changes 都添加了 Business Context

### 命名规范
- [ ] 所有 Changes 都使用新的 domain-feature 命名
- [ ] Dependency Graph (Mermaid) 中的节点名称已更新
- [ ] Dependencies 字段引用新的 Change 名称
- [ ] Release Plan 引用新的 Change 名称
- [ ] 使用 Grep 搜索，确认没有遗漏旧命名

### 版本控制
- [ ] 版本号更新为 v2.1.0
- [ ] 变更记录添加完整
- [ ] 更新时间为 2026-06-16

---

## 💡 执行建议

### 推荐的执行顺序

1. **先做简单的**：Step 1（删除）和 Step 7（版本更新）
2. **再做插入**：Step 2（Feature Breakdown）和 Step 3（例外说明）
3. **最后做替换**：Step 4（全局替换）和 Step 6（Mermaid 图）
4. **补充细节**：Step 5（Business Context）

### 注意事项

1. **分步执行，逐步验证**
   - 每完成一个 Step，使用 Read 工具验证修改结果
   - 确认无误后再进入下一步

2. **使用 Grep 工具查找**
   - 在全局替换前，先用 Grep 搜索旧命名，了解有多少处需要替换
   - 替换后再用 Grep 确认，确保没有遗漏

3. **保持原有格式**
   - 插入新内容时，保持与原文档相同的 Markdown 格式
   - 注意缩进、空行、标题级别

4. **备份原文档**（可选）
   - 如果担心修改出错，可以先备份原文档
   - 或者使用 Git 管理，方便回滚

---

## 📊 预期结果

修改完成后，文档应该：

1. ✅ 完全符合 Engineering Implementation Plan 模板要求
2. ✅ 符合度从 75% 提升到 95%+
3. ✅ 通过审查报告的所有 P0 和 P1 检查项
4. ✅ 可以直接提交给 Tech Lead 和 Architect 评审
5. ✅ AI Coding Agent 可以直接执行

---

## 🆘 遇到问题怎么办

### 如果找不到插入位置
- 使用 Grep 工具搜索关键词，例如 "## 2. Epic Tree" 或 "## 4. Change Breakdown"
- 使用 Read 工具的 offset 和 limit 参数，逐段查看文档

### 如果全局替换出错
- 先用 Grep 搜索，确认匹配的位置和数量
- 使用 Edit 工具逐个替换，而不是一次性全部替换
- 替换后用 Grep 确认

### 如果 Mermaid 图出错
- 检查节点名称中的特殊字符（如 `-`）
- 确保箭头语法正确（`-->`）
- 可以使用在线 Mermaid 编辑器验证语法

---

## 📞 联系支持

如果遇到无法解决的问题，请：

1. 记录当前执行到哪一步
2. 记录遇到的具体错误信息
3. 使用 Read 工具截取相关文档片段
4. 向用户反馈

---

**任务创建时间**: 2026-06-16  
**预计完成时间**: 30-60 分钟  
**难度等级**: 中等（需要细心和耐心）

---

祝你顺利完成任务！🚀