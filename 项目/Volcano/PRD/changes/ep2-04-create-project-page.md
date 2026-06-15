# Change Specification: ep2-04-create-project-page

## 文档信息

| 项目 | 内容 |
|------|------|
| Change ID | ep2-04-create-project-page |
| Change Type | FEATURE |
| 版本 | v1.0.0 |
| 创建时间 | 2026-06-15 |
| 关联 Epic | Epic 2: 项目管理与 Dashboard |
| 关联 Feature | F2.2: 创建项目页面 |
| 优先级 | P0 |
| 预估工期 | 1.5-2 天 |
| 目标代码库 | `E:\A\Ai\convert documents to videos` |

---

## 1. Change Overview

### Change ID
ep2-04-create-project-page

### Change Type
FEATURE

### Goal
实现创建项目页面：文本输入 + 参数配置 + 前端校验 + 提交跳转，完成 Phase 1 用户完整体验闭环。

### User Value
用户可通过直观的表单界面创建视频项目，配置生成参数，并实时看到字数统计和校验提示，提交后自动跳转到进度页面。

### Business Value
建立完整的"创建 → 查看 Dashboard"用户体验闭环，验证产品核心价值假设，为后续 AI 生成链路提供稳定的入口。

### Related Epic
Epic 2: 项目管理与 Dashboard

### Related Feature
F2.2: 创建项目页面

### Priority
P0

---

## 2. Scope Definition

### Included（本 Change 必须实现）

1. **创建页面路由** `/create`
   - 替换 Next.js 默认首页为创建页面（或重定向到 `/create`）
   - 使用 `(protected)` 路由组，需要登录态

2. **文本输入区域**
   - 大尺寸 Textarea（多行文本框）
   - 实时字数统计（当前字数 / 最大字数）
   - 字数限制提示（3000-5000 字）
   - Placeholder 示例文本

3. **参数配置面板**
   - 目标对象选择（学生/自学者/老师/教研人员）
   - 难度选择（初级/中级/高级）
   - 视频比例选择（16:9 横屏 / 9:16 竖屏）
   - 目标时长选择（1-3 分钟 / 3-5 分钟 / 5-10 分钟）
   - 语音选择（从 Mock 列表加载，显示语音名称）

4. **前端校验**
   - 空文本校验（提交时阻止）
   - 字数超限校验（实时提示 + 提交阻止）
   - 字数不足校验（< 100 字提示）
   - 所有参数必选校验

5. **提交逻辑**
   - 调用 `project.createAndGenerate` tRPC mutation
   - Loading 状态（禁用表单 + 显示 Spinner）
   - 防重复提交（提交中禁用按钮）
   - 成功后跳转 `/projects/[id]/progress`
   - 失败后显示错误提示（Toast 或 Alert）

6. **语音列表加载**
   - 从 Mock 数据加载（暂不调用真实 API）
   - 显示语音名称和 providerId

### Excluded（本 Change 不实现）

1. **实际 TTS voice list API**（Epic 4 实现）
2. **首页重设计**（保持简单重定向或占位）
3. **富文本编辑器**（仅纯文本）
4. **文件上传**（仅粘贴文本）
5. **草稿保存**（提交后才创建 Project）
6. **高级参数配置**（水印、字幕样式等）
7. **模板预览**（Epic 5 后实现）

### Out Of Scope（明确禁止扩展）

1. **分镜编辑**（第一版不做）
2. **批量创建**（第一版不做）
3. **导入 DOCX/PDF**（第一版不做）
4. **AI 优化建议**（第一版不做）

---

## 3. Technical Design Refinement

### 涉及模块

- `src/app/page.tsx`：首页（修改为重定向或占位）
- `src/app/(protected)/create/`：创建页面（新建）
- `src/components/project/`：表单组件（新建）
- `src/server/routers/project.ts`：已有 API（调用）

### 涉及领域模型

- **Project**：创建后的项目实体
- **GenerationJob**：生成任务实体
- **User**：当前登录用户（从 Session 获取）

### 数据流

```mermaid
flowchart TD
    A[用户输入文本和参数] --> B[前端校验]
    B -->|校验失败| C[显示错误提示]
    B -->|校验通过| D[启用提交按钮]
    D --> E[用户点击生成]
    E --> F[调用 project.createAndGenerate]
    F --> G{API 响应}
    G -->|成功| H[获取 projectId]
    H --> I[跳转 /projects/projectId/progress]
    G -->|失败| J[显示错误 Toast]
    J --> K[用户可重试]
```

### 状态流转

```mermaid
stateDiagram-v2
    [*] --> Idle: 页面加载
    Idle --> Editing: 用户输入
    Editing --> Validating: 实时校验
    Validating --> Invalid: 校验失败
    Validating --> Valid: 校验通过
    Invalid --> Editing: 修正输入
    Valid --> Submitting: 点击生成
    Submitting --> Success: API 成功
    Submitting --> Error: API 失败
    Success --> [*]: 跳转进度页
    Error --> Valid: 重试
```

---

## 4. Impact Analysis

| Area | Impact | 说明 |
|------|--------|------|
| Database | ✗ | 不直接操作数据库，通过 API 创建 |
| API | ✓ | 调用 `project.createAndGenerate` mutation |
| Frontend | ✓ | 新增 `/create` 页面 + 2 个组件，修改首页 |
| Cache | ✗ | 无缓存需求 |
| Queue | ✗ | 不直接操作 Inngest |
| Storage | ✗ | 不直接操作 R2 |
| Logging | ✗ | 使用前端 console（开发环境） |
| Monitoring | ✗ | 无监控埋点（Phase 6 实现） |
| Tests | ✓ | 新增组件单元测试 + E2E 测试 |
| Docs | ✗ | 无需文档变更 |

---

## 5. File Planning

### New Files

```
src/app/(protected)/create/
  └── page.tsx                          # 创建页面主入口
src/components/project/
  ├── CreateForm.tsx                    # 表单容器组件
  ├── ConfigPanel.tsx                   # 参数配置面板
  └── __tests__/
      ├── CreateForm.test.tsx           # 单元测试
      └── ConfigPanel.test.tsx          # 单元测试
```

### Modified Files

```
src/app/page.tsx                        # 修改首页（重定向或占位）
```

### Deleted Files

无

### Directory Impact

```
src/app/
  ├── page.tsx                          # 修改：重定向到 /create
  └── (protected)/
      └── create/
          └── page.tsx                  # 新增：创建页面

src/components/
  └── project/
      ├── CreateForm.tsx                # 新增
      ├── ConfigPanel.tsx               # 新增
      └── __tests__/                    # 新增
```

---

## 6. Implementation Tasks

### Task 1: 修改首页为重定向

**目标**：将 `src/app/page.tsx` 修改为重定向到 `/create`

**实施步骤**：
1. 读取 `src/app/page.tsx`
2. 保留必要的认证检查（如果有）
3. 使用 Next.js `redirect()` 函数跳转到 `/dashboard` 或 `/create`
4. 保留基础 SEO 元数据

**完成标准**：
- [ ] 访问 `/` 自动跳转到 `/create`（已登录）或 `/sign-in`（未登录）
- [ ] 无 console 错误

**预估时间**：30 分钟

---

### Task 2: 创建参数配置面板组件

**目标**：实现 `ConfigPanel.tsx`，包含 5 个参数配置项

**实施步骤**：
1. 创建 `src/components/project/ConfigPanel.tsx`
2. 使用 shadcn/ui 的 `Select` 和 `RadioGroup` 组件
3. 定义参数类型（基于 tRPC 输入 Schema）
4. 实现受控组件（通过 props 接收 value 和 onChange）
5. 添加参数说明和 Tooltip（可选）

**完成标准**：
- [ ] 5 个参数均可选择
- [ ] 选中状态正确显示
- [ ] onChange 回调正常触发
- [ ] 无 TypeScript 错误

**预估时间**：1.5 小时

---

### Task 3: 创建表单容器组件

**目标**：实现 `CreateForm.tsx`，集成文本输入和参数配置

**实施步骤**：
1. 创建 `src/components/project/CreateForm.tsx`
2. 使用 `react-hook-form` + Zod 校验
3. 定义表单 Schema（与 tRPC 输入一致）
4. 集成 Textarea（字数统计）
5. 集成 ConfigPanel
6. 实现提交逻辑（调用 tRPC mutation）
7. 添加 Loading 状态和错误提示

**完成标准**：
- [ ] 表单校验正常（空文本、超字数）
- [ ] 提交成功后跳转
- [ ] 提交失败显示错误
- [ ] Loading 期间禁用表单
- [ ] 无重复提交

**预估时间**：3 小时

---

### Task 4: 创建页面路由

**目标**：实现 `/create` 页面，集成表单组件

**实施步骤**：
1. 创建 `src/app/(protected)/create/page.tsx`
2. 集成 `CreateForm` 组件
3. 添加页面标题和说明
4. 添加面包屑（如果已有 Layout）
5. 设置页面元数据（title, description）

**完成标准**：
- [ ] 页面可访问（需登录）
- [ ] 表单正常显示
- [ ] 页面样式符合 Dashboard 风格
- [ ] 响应式布局正常

**预估时间**：1 小时

---

### Task 5: 编写单元测试

**目标**：为 `CreateForm` 和 `ConfigPanel` 编写单元测试

**实施步骤**：
1. 创建测试文件
2. 测试 ConfigPanel 参数选择
3. 测试 CreateForm 校验逻辑
4. Mock tRPC mutation
5. 测试提交成功和失败场景

**完成标准**：
- [ ] ConfigPanel 测试覆盖率 > 80%
- [ ] CreateForm 测试覆盖率 > 70%
- [ ] 所有测试通过

**预估时间**：2 小时

---

### Task 6: E2E 测试（可选）

**目标**：编写创建项目的端到端测试

**实施步骤**：
1. 使用 Playwright 编写 E2E 测试
2. 测试完整流程：登录 → 创建 → 提交 → 跳转
3. 测试校验提示
4. 测试错误处理

**完成标准**：
- [ ] E2E 测试通过
- [ ] 覆盖关键用户路径

**预估时间**：1.5 小时（可放到 Phase 5）

---

## 7. Dependencies

### Upstream Changes（依赖）

- **ep2-01-project-create-api** ✅ 已完成
  - 需要 `project.createAndGenerate` mutation
  - 需要输入 Schema 定义

### Downstream Changes（被依赖）

- **ep6-01-progress-page**
  - 创建成功后跳转到进度页
  - 进度页需要接收 `projectId` 参数

- **ep6-04-global-layout-nav**
  - 导航栏需要"创建"入口链接

### Blocking Risks

无阻塞风险。ep2-01 已完成，API 可用。

---

## 8. Acceptance Criteria

### Happy Path

**Given** 用户已登录并进入 `/create` 页面  
**When** 用户粘贴 1000 字文本，选择全部参数，点击"生成视频"  
**Then** 
- 字数统计显示 `1000 / 5000`
- 提交按钮可点击
- API 调用成功
- 自动跳转到 `/projects/{projectId}/progress`

---

**Given** 用户已登录  
**When** 用户直接访问 `/`  
**Then** 自动重定向到 `/create`（或 `/dashboard`）

### Error Path

**Given** 用户在 `/create` 页面  
**When** 用户未输入任何文本，点击"生成视频"  
**Then** 
- 提交按钮禁用（或点击后显示错误）
- 显示"请输入文本内容"提示

---

**Given** 用户输入 6000 字文本  
**When** 用户继续输入  
**Then** 
- 字数统计显示 `6000 / 5000`（红色）
- 提示"字数超限，请精简内容"
- 提交按钮禁用

---

**Given** 用户填写完整表单并提交  
**When** API 返回错误（如额度不足）  
**Then** 
- 显示错误 Toast："生成额度不足，请明天再试"
- 表单恢复可编辑状态
- 用户可修改后重试

### Edge Cases

**Given** 用户输入 50 字短文本  
**When** 提交  
**Then** 
- 显示警告提示："文本过短（< 100 字），生成效果可能不佳"
- 仍可提交（仅警告，不阻止）

---

**Given** 用户在提交过程中刷新页面  
**When** 返回 `/create`  
**Then** 
- 表单内容清空（不保存草稿）
- 用户需重新填写

---

**Given** 用户选择"9:16 竖屏"  
**When** 查看参数配置  
**Then** 显示"适合移动端观看"提示

### Permission Cases

**Given** 用户未登录  
**When** 访问 `/create`  
**Then** 自动跳转到 `/sign-in`（由 `(protected)` 路由组控制）

---

**Given** 用户今日额度已用完  
**When** 提交创建请求  
**Then** API 返回 429，前端显示"今日额度已用完，明日刷新"

### Retry Cases

**Given** 用户提交时网络中断  
**When** API 调用失败  
**Then** 
- 显示"网络错误，请重试"
- 用户点击"重试"按钮可再次提交
- 表单内容保留

---

## 9. Test Plan

### Unit Test

**需要覆盖**：

1. **ConfigPanel 组件**
   - 每个参数选择后 onChange 触发
   - 默认值显示正确
   - 受控组件逻辑正常

2. **CreateForm 组件**
   - 字数统计正确（0字 / 1000字 / 5000字 / 6000字）
   - 空文本校验
   - 超字数校验
   - 必选参数校验
   - 提交 Loading 状态
   - Mock tRPC mutation 成功/失败

### Integration Test

**需要覆盖**：

1. **tRPC mutation 调用**
   - 传入正确参数格式
   - 接收 projectId 并跳转
   - 错误处理正确

2. **路由保护**
   - 未登录访问 `/create` 跳转到登录页

### E2E Test

**需要覆盖**：

1. **完整创建流程**
   - 登录 → 访问 `/create` → 填写表单 → 提交 → 跳转进度页

2. **校验提示**
   - 空文本提交被阻止
   - 超字数提示显示

3. **错误处理**
   - 网络错误重试
   - 额度不足提示

### Regression Test

**需要覆盖**：

- Dashboard 页面不受影响
- 认证系统正常工作
- 现有 API 不受影响

---

## 10. Rollback Plan

### Code Rollback

**步骤**：
1. 恢复首页：`git checkout src/app/page.tsx` 恢复为脚手架
2. 删除创建页：删除 `src/app/(protected)/create/` 目录
3. 删除组件：删除 `CreateForm.tsx` 和 `ConfigPanel.tsx`
4. 提交回滚 commit 并部署

**预计回滚时间**：< 5 分钟

**风险**：低（纯前端，不影响后端和数据库）

### Data Rollback

无需数据回滚（不修改数据库 Schema）

### Config Rollback

无需配置回滚

### Feature Flag Rollback

第一版不使用 Feature Flag，直接部署

---

## 11. OpenSpec Output

### change.md

**变更目标**：实现创建项目页面，用户可输入文本和配置参数，提交后创建项目并跳转进度页。

**变更范围**：
- 新增 `/create` 页面路由
- 新增 CreateForm 和 ConfigPanel 组件
- 修改首页为重定向

**验收标准**：
- 用户可填写表单并提交
- 校验提示正确显示
- 提交成功后跳转进度页

### design.md

**实现方案**：

1. **技术选型**
   - 表单管理：react-hook-form + Zod
   - UI 组件：shadcn/ui
   - API 调用：tRPC + TanStack Query
   - 路由：Next.js App Router

2. **组件结构**
   ```
   CreatePage
     └── CreateForm
           ├── Textarea（文本输入）
           ├── CharCounter（字数统计）
           ├── ConfigPanel（参数配置）
           │     ├── TargetAudienceSelect
           │     ├── DifficultySelect
           │     ├── AspectRatioSelect
           │     ├── DurationSelect
           │     └── VoiceSelect
           └── SubmitButton
   ```

3. **数据流**
   - 用户输入 → react-hook-form state
   - 提交 → tRPC mutation → API
   - 成功 → router.push('/projects/{id}/progress')
   - 失败 → Toast 错误提示

### tasks.md

1. 修改首页为重定向（30 分钟）
2. 创建 ConfigPanel 组件（1.5 小时）
3. 创建 CreateForm 组件（3 小时）
4. 创建页面路由（1 小时）
5. 编写单元测试（2 小时）
6. E2E 测试（可选，1.5 小时）

**总计**：8-9.5 小时（1-1.5 天）

---

## 12. AI Implementation Readiness Check

### Scope Too Large

✅ **通过**：1-1.5 天工作量，AI 单次可完成。

**文件数量**：5 个新文件 + 1 个修改文件  
**预估 LOC**：~700 LOC  
**复杂度**：中等（标准表单组件）

### Hidden Dependencies

✅ **无隐藏依赖**

**显式依赖**：
- ep2-01 project.createAndGenerate API（已完成）
- shadcn/ui 组件库（已安装）
- react-hook-form（需安装）
- tRPC client（已配置）

**无隐藏依赖**：
- 不依赖未实现的 TTS API（使用 Mock）
- 不依赖进度页（可先跳转占位页）

### Context Explosion

✅ **通过**：上下文可控

**组件层级**：2 层（Page → Form → Panel）  
**单个组件 LOC**：< 200 LOC  
**状态管理**：react-hook-form（局部状态）

### Testing Gap

✅ **测试完整**

**单元测试**：ConfigPanel + CreateForm  
**集成测试**：tRPC mutation 调用  
**E2E 测试**：完整创建流程（可延后）

### Rollback Risk

✅ **回滚简单**

**风险评估**：低  
**回滚方式**：删除目录 + 恢复首页  
**回滚时间**：< 5 分钟  
**数据影响**：无（不修改数据库）

---

## 13. 实施建议

### OpenSpec 可直接创建 Change

✅ **推荐使用 OpenSpec**

```bash
cd E:\A\Ai\convert documents to videos
npx openspec propose ep2-04-create-project-page
```

### Claude Code 可直接实现

✅ **推荐使用 Claude Code**

**执行命令**：
```bash
claude code implement ep2-04-create-project-page
```

**提示词模板**：
```
请实现 ep2-04-create-project-page Change：

1. 创建 /create 页面，包含文本输入和参数配置
2. 使用 react-hook-form + Zod 校验
3. 调用 project.createAndGenerate tRPC mutation
4. 提交成功后跳转 /projects/[id]/progress
5. 添加单元测试

参考规范：E:\A\Note\项目\Volcano\PRD\changes\ep2-04-create-project-page.md
```

### Codex 可直接实现

✅ **推荐使用 Codex**

**工作流**：
1. 加载规范文件
2. 生成组件代码
3. 生成测试代码
4. 提交 PR

### 单独 PR 可交付

✅ **独立 PR**

**PR 标题**：`feat(ep2-04): implement create project page`

**PR 描述**：
```markdown
## Change

ep2-04-create-project-page

## 功能

- 新增 `/create` 页面
- 文本输入 + 参数配置
- 前端校验 + 提交跳转

## 测试

- [x] 单元测试通过
- [x] 手动测试通过
- [ ] E2E 测试（可延后）

## Checklist

- [x] 代码符合规范
- [x] 无 TypeScript 错误
- [x] 无 ESLint 警告
- [x] 提交前测试通过
```

### 单独上线可回滚

✅ **独立上线**

**部署方式**：Vercel 自动部署  
**回滚方式**：Vercel Dashboard 回退  
**回滚时间**：< 2 分钟  
**影响范围**：仅创建页面（不影响 Dashboard）

---

## 14. 注意事项

### 关键风险点

1. **字数限制不一致**
   - 前端限制：3000-5000 字
   - 后端限制：需确认与 API Schema 一致
   - **缓解**：从 tRPC Schema 导入常量

2. **语音列表 Mock 数据**
   - 第一版使用硬编码 Mock
   - Epic 4 后替换为真实 API
   - **缓解**：抽象为 hook，便于后续替换

3. **进度页未实现**
   - 提交后跳转目标页可能不存在
   - **缓解**：先跳转到占位页或 Dashboard

### 开发建议

1. **复用现有组件**
   - 使用 shadcn/ui 的 `Form`、`Select`、`Textarea`
   - 参考 Dashboard 页面样式

2. **参数配置顺序**
   - 按重要性排序：目标对象 > 难度 > 比例 > 时长 > 语音
   - 提供默认值减少决策负担

3. **错误提示文案**
   - 友好且可操作："字数超限，请精简内容"
   - 避免技术术语："API 调用失败" → "网络错误，请重试"

4. **响应式布局**
   - 移动端：单列布局
   - 桌面端：文本输入占 2/3，参数配置占 1/3

---

## 15. 验收检查清单

### 功能验收

- [ ] `/create` 页面可访问且需登录
- [ ] 文本输入框正常工作
- [ ] 字数统计实时更新
- [ ] 5 个参数均可选择
- [ ] 空文本提交被阻止
- [ ] 超字数提交被阻止
- [ ] 提交成功后跳转进度页
- [ ] 提交失败显示错误提示
- [ ] Loading 状态正确显示
- [ ] 无重复提交

### 技术验收

- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
- [ ] 单元测试通过
- [ ] 集成测试通过（可选）
- [ ] 响应式布局正常
- [ ] 无 console 错误

### 用户体验验收

- [ ] 表单填写流畅
- [ ] 校验提示清晰
- [ ] 错误提示友好
- [ ] 提交反馈及时
- [ ] 页面加载快速

---

## 变更记录

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0.0 | 2026-06-15 | 创建 Change Specification |
