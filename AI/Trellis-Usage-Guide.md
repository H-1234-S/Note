# Trellis 使用指南

## 一、Trellis 是什么？

Trellis 是一个 **AI 编程工程框架**，专为解决一个核心问题而设计：

> "AI 写代码很快，但每次会话都从零开始 — 它不记得你的项目规范、编码习惯、团队要求。"

简单来说，Trellis 让 AI 编程助手（如 Claude、Cursor、Codex 等）能够"记住"你的项目标准，并在多次会话之间保持一致性。

### 通俗类比

想象你雇了一个临时工程师，他很聪明、写代码很快，但每次上班都失忆了：
- 不记得团队的代码风格
- 不知道上次讨论的架构决策
- 忘记了项目的测试规范
- 每次都要重新解释一遍需求

Trellis 就像给这个工程师配了一本"项目手册"，里面记录了：
- **规范（Specs）**：团队的编码标准、架构约定
- **任务（Tasks）**：需求文档、实现笔记
- **记忆（Memory）**：之前会话发生了什么

这样，AI 助手每次工作时都能自动加载这些上下文，按照你的标准写代码。

## 二、Trellis 解决什么问题？

### 传统 AI 编程的痛点

1. **每次会话都要重新解释规范**
   - "记得用 TypeScript 严格模式"
   - "别忘了加单元测试"
   - "遵循我们的命名规范"
   
2. **缺乏项目记忆**
   - 上次讨论的架构决策没有沉淀
   - 踩过的坑下次还会踩
   - 代码风格不一致

3. **单一文件配置的局限**
   - 传统方式用 `.cursorrules` 或 `AGENTS.md` 把所有规范塞进一个文件
   - 文件越来越臃肿，难以维护
   - 无法根据当前任务加载相关规范

### Trellis 的解决方案

1. **自动注入规范**：根据当前任务自动加载相关的规范文件
2. **任务驱动工作流**：每个任务都有清晰的需求文档和上下文
3. **项目记忆系统**：通过工作日志保持会话之间的连续性
4. **团队协作**：规范文件版本控制，团队共享标准
5. **跨平台支持**：支持 14 个 AI 编程平台（Claude、Cursor、Codex 等）

## 三、适用场景与不适用场景

### ✅ 适合使用 Trellis 的场景

1. **中大型项目**：代码库较大，有明确的架构和规范
2. **团队协作**：多人协作，需要统一编码标准
3. **长期维护**：项目会持续开发，需要保持一致性
4. **复杂需求**：需要 AI 理解业务逻辑和架构约定
5. **多次迭代**：同一功能需要多次调整和优化

### ❌ 不适合使用 Trellis 的场景

1. **一次性脚本**：简单的临时脚本，不需要维护
2. **学习练习**：个人学习项目，频繁重写
3. **极简项目**：项目很小，规范很简单
4. **纯探索阶段**：还在验证想法，架构未定型


## 四、前置条件与安装

### 系统要求

- **Node.js**：版本 ≥18
- **Python**：版本 ≥3.9（可选，用于某些脚本）
- **Git**：项目必须是 Git 仓库

### 安装步骤

#### 1. 全局安装 Trellis CLI

```bash
npm install -g @mindfoldhq/trellis@latest
```

#### 2. 在项目中初始化 Trellis

进入你的项目目录（必须是 Git 仓库），执行：

```bash
# 基础初始化
trellis init -u your-name

# 指定特定平台（可选）
trellis init --cursor --opencode --codex -u your-name
```

**参数说明：**
- `-u your-name`：你的用户名，用于记录工作日志
- `--cursor`、`--codex` 等：为特定 AI 平台生成配置文件

#### 3. 验证安装

初始化完成后，项目中会生成 `.trellis/` 目录：

```
.trellis/
├── config.yaml          # 配置文件
├── workflow.md          # 工作流文档
├── spec/                # 规范目录
├── tasks/               # 任务目录
└── workspace/           # 工作区（个人日志）
```


## 五、核心概念与目录结构

### 1. Specs（规范）

**位置**：`.trellis/spec/`

**作用**：存储项目的编码规范、架构约定、最佳实践。

**特点**：
- 这些文件会被自动注入到 AI 会话中
- 根据当前任务相关性选择性加载
- 版本控制，团队共享

**典型内容**：
- 代码风格指南
- 架构设计原则
- API 设计规范
- 测试要求
- 错误处理规范

**示例结构**：
```
.trellis/spec/
├── guides/                    # 通用指南
│   ├── code-reuse-thinking.md
│   └── cross-layer-thinking.md
├── backend/                   # 后端规范
│   ├── api-design.md
│   └── database-patterns.md
└── frontend/                  # 前端规范
    ├── component-structure.md
    └── state-management.md
```

### 2. Tasks（任务）

**位置**：`.trellis/tasks/`

**作用**：每个开发任务一个目录，包含需求文档、实现笔记、上下文。

**命名规则**：`MM-DD-描述性名称`（如 `05-10-user-auth-feature`）

**典型任务目录结构**：
```
.trellis/tasks/05-10-user-auth-feature/
├── prd.md                # 产品需求文档
├── research/             # 调研笔记
├── implement.jsonl       # 实现阶段的上下文配置
├── check.jsonl           # 检查阶段的上下文配置
└── notes.md              # 实现过程的笔记
```

**生命周期**：
- 创建任务 → 启动任务 → 实现 → 验证 → 完成 → 归档到 `archive/`

### 3. Workspace（工作区）

**位置**：`.trellis/workspace/`

**作用**：存储个人工作日志，记录每次会话的内容。

**特点**：
- 个人私有，不提交到团队代码库
- 自动记录，无需手动维护
- 日志按行数自动分割（默认 2000 行）

**典型内容**：
```
.trellis/workspace/
└── your-name/
    ├── journal-001.md
    ├── journal-002.md
    └── journal-003.md
```

### 4. Config（配置）

**位置**：`.trellis/config.yaml`

**作用**：项目级配置，控制 Trellis 的行为。

**关键配置项**：

```yaml
# 会话记录
session_commit_message: "chore: record journal"  # 日志提交信息
max_journal_lines: 2000                          # 日志文件最大行数

# 任务生命周期钩子
hooks:
  after_create: "echo 'Task created'"
  after_start: "echo 'Task started'"
  after_finish: "echo 'Task finished'"
  after_archive: "echo 'Task archived'"

# Monorepo 支持
packages:
  - path: packages/backend
    type: backend
  - path: packages/frontend
    type: frontend
default_package: backend

# Codex 配置
codex:
  dispatch_mode: "sub-agent"  # 或 "inline"
```


## 六、Trellis 的工作流

Trellis 采用 **四阶段工作流**，每个阶段有明确的职责和产物。

### 阶段 1：Plan（规划）

**目标**：明确需求，创建任务目录和需求文档。

**关键动作**：
1. 创建任务目录（如 `.trellis/tasks/06-07-new-feature/`）
2. 使用 `trellis-brainstorm` 技能与 AI 探讨需求
3. 可选：进行技术调研，记录到 `research/` 目录
4. 配置上下文文件：`implement.jsonl` 和 `check.jsonl`
5. 生成 `prd.md`（产品需求文档）
6. 激活任务：`task.py start`

**产物**：
- 清晰的 PRD 文档
- 相关规范的索引（哪些 spec 文件与此任务相关）
- 技术调研笔记（如果需要）

**工作流状态标记**：`[workflow-state:planning]`

---

### 阶段 2：Execute（执行）

**目标**：编写代码，完成功能实现。

**关键动作**：
1. AI 调用 `trellis-implement` 技能（或子代理）
2. 自动加载 `implement.jsonl` 中指定的规范文件
3. 编写代码，遵循项目规范
4. 调用 `trellis-check` 进行验证
5. 运行 lint、类型检查、测试

**产物**：
- 工作树中的代码更改（尚未提交）
- 通过所有检查的代码

**工作流状态标记**：`[workflow-state:implementing]`

**注意**：
- 此阶段的代码更改还在工作树中，没有提交
- 可以多次迭代：编写 → 检查 → 修复 → 再检查

---

### 阶段 3：Verify（验证）

**目标**：确保代码质量，对照规范和测试进行最终验证。

**关键动作**：
1. 运行 `trellis-check` 进行完整检查
2. 对比代码与 spec 文件的一致性
3. 运行完整的测试套件
4. 如果发现问题，返回执行阶段修复
5. 可选：使用 `trellis-break-loop` 记录调试经验

**产物**：
- 验证通过的代码
- 调试笔记（如果有）

**工作流状态标记**：`[workflow-state:verifying]`

---

### 阶段 4：Finish（收尾）

**目标**：提交代码，更新规范，归档任务。

**关键动作**：
1. 最终验证（再次运行 `trellis-check`）
2. 可选：使用 `trellis-update-spec` 更新规范文件
3. AI 起草批量提交计划
4. 用户确认后执行提交
5. 使用 `/trellis:finish-work` 归档任务
6. 记录会话到工作日志

**产物**：
- 干净的 Git 提交
- 更新的规范文件（如果有新的最佳实践）
- 归档的任务目录（移到 `archive/`）
- 工作日志记录

**工作流状态标记**：`[workflow-state:finishing]`


## 七、与 AI 平台的关系

Trellis 不是替代品，而是增强层。它支持 14 个 AI 编程平台：

| 平台 | 配置文件 | 说明 |
|------|---------|------|
| Claude Code | `.claude/` | Anthropic 官方 CLI |
| Cursor | `.cursor/` | AI 代码编辑器 |
| Codex | `.codex/` | 多模型 AI 平台 |
| OpenCode | `.opencode/` | 开源 AI 编程工具 |
| Pi | `.pi/` | 其他 AI 助手 |

**工作原理**：
- Trellis 初始化时，根据你选择的平台生成对应的配置文件
- 每个平台的配置文件中会引用 `.trellis/` 中的规范和工作流
- AI 助手读取这些配置，自动加载项目上下文


## 八、常用命令

### CLI 命令

```bash
# 初始化
trellis init -u your-name                    # 基础初始化
trellis init --cursor --codex -u your-name   # 指定平台

# 查看版本
trellis --version

# 查看帮助
trellis --help
```

### AI 技能命令（在 AI 会话中使用）

这些命令通过 `.agents/skills/` 目录中的技能定义，在 AI 会话中调用：

```bash
/trellis-start          # 开始新工作
/trellis-before-dev     # 开发前检查
/trellis-brainstorm     # 头脑风暴，明确需求
/trellis-implement      # 实现功能
/trellis-check          # 验证代码
/trellis-continue       # 继续中断的工作
/trellis-break-loop     # 记录调试经验
/trellis-update-spec    # 更新规范
/trellis-finish-work    # 完成工作
```

### Python 辅助脚本

在任务目录中可能会看到 `task.py` 脚本：

```bash
python task.py start      # 启动任务
python task.py finish     # 完成任务
python task.py archive    # 归档任务
```


## 九、实战示例：从零到上手

假设我们要添加一个"用户登录"功能。

### 步骤 1：初始化项目

```bash
cd my-project
trellis init -u zhangsan --cursor
```

### 步骤 2：与 AI 开始对话

在 Claude Code 或 Cursor 中，输入：

```
我需要添加用户登录功能，包括邮箱密码登录和 JWT token 验证。
```

### 步骤 3：AI 调用 trellis-brainstorm

AI 会自动：
1. 创建任务目录：`.trellis/tasks/06-07-user-login/`
2. 与你讨论需求细节
3. 生成 `prd.md` 文档

### 步骤 4：AI 实现功能

AI 调用 `trellis-implement` 技能：

1. 自动加载相关规范（如 `.trellis/spec/backend/api-design.md`）
2. 编写登录接口代码
3. 编写测试用例
4. 调用 `trellis-check` 验证

### 步骤 5：你审查代码

查看 AI 的实现，提出修改意见：

```
密码加密强度不够，请使用 bcrypt 并增加 salt rounds 到 12。
```

AI 会根据反馈调整，再次运行检查。

### 步骤 6：完成任务

当你满意后，告诉 AI：

```
/trellis-finish-work
```

AI 会：
1. 提交代码到 Git
2. 询问是否需要更新规范（如果这次实现有新的最佳实践）
3. 归档任务目录
4. 记录会话到你的工作日志

### 步骤 7：下次继续

几天后，你需要添加"忘记密码"功能，AI 会：
- 读取上次的工作日志
- 了解已有的登录架构
- 遵循相同的规范
- 保持代码风格一致


## 十、团队协作 vs 个人使用

### 团队使用

**提交到 Git 的内容**：
- `.trellis/spec/`：团队共享的规范
- `.trellis/tasks/`：任务目录（可选择性提交）
- `.trellis/config.yaml`：项目配置
- `.trellis/workflow.md`：工作流文档

**不提交的内容**：
- `.trellis/workspace/`：个人工作日志

**团队协作流程**：
1. 团队成员共同维护 spec 文件
2. 每次更新规范，像代码一样 Code Review
3. 新人加入时，AI 自动读取团队规范
4. 保持团队代码风格一致

### 个人使用

**简化配置**：
- 规范文件可以更随意
- 工作日志只给自己看
- 可以快速迭代规范

**优势**：
- 跨项目复用自己的规范模板
- 积累个人最佳实践
- 长期项目维护更轻松


## 十一、进阶配置

### 1. 自定义规范文件

在 `.trellis/spec/` 中创建新文件：

```markdown
<!-- .trellis/spec/backend/error-handling.md -->
# 错误处理规范

## 统一错误格式

所有 API 错误必须返回以下格式：

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在",
    "details": {}
  }
}
```

## 错误分类

- 4xx：客户端错误
- 5xx：服务器错误

## 日志记录

所有错误必须记录到日志系统，包含：
- 错误堆栈
- 请求上下文
- 用户 ID（如果有）
```

### 2. 配置任务钩子

在 `.trellis/config.yaml` 中：

```yaml
hooks:
  after_create: "node scripts/notify-team.js create"
  after_start: "echo 'Task started at $(date)' >> task-log.txt"
  after_finish: "node scripts/notify-team.js finish"
  after_archive: "node scripts/cleanup.js"
```

### 3. Monorepo 支持

如果你的项目是 monorepo：

```yaml
packages:
  - path: packages/backend
    type: backend
  - path: packages/frontend
    type: frontend
  - path: packages/shared
    type: shared

default_package: backend
```

然后创建任务时可以指定包：

```bash
trellis create-task --package backend auth-feature
```

### 4. 调整子代理模式

默认情况下，Trellis 使用子代理模式（sub-agent）来实现和检查代码。如果你希望主 AI 直接编辑代码：

```yaml
codex:
  dispatch_mode: "inline"
```

**两种模式对比**：

| 模式 | 优点 | 缺点 |
|------|------|------|
| sub-agent | 隔离性好，上下文清晰 | 需要等待子代理完成 |
| inline | 响应快，交互直接 | 主会话上下文可能混乱 |


## 十二、常见问题与排错

### Q1：初始化后 AI 没有加载规范？

**可能原因**：
- AI 平台配置文件没有正确引用 `.trellis/workflow.md`
- 规范文件路径错误

**解决方法**：
1. 检查 `.claude/CLAUDE.md` 或 `.cursor/rules` 是否包含 Trellis 引用
2. 手动告诉 AI："请阅读 .trellis/workflow.md"

### Q2：任务目录创建失败？

**可能原因**：
- 不在 Git 仓库中
- 权限不足

**解决方法**：
```bash
# 确认是 Git 仓库
git status

# 如果不是，初始化
git init
git add .
git commit -m "Initial commit"

# 然后再运行 trellis init
trellis init -u your-name
```

### Q3：工作日志文件太大？

**解决方法**：
调整 `.trellis/config.yaml`：

```yaml
max_journal_lines: 1000  # 降低行数限制
```

### Q4：AI 不遵循规范？

**可能原因**：
- 规范文件没有在 `implement.jsonl` 或 `check.jsonl` 中引用
- 规范描述不够明确

**解决方法**：
1. 检查任务目录中的 `implement.jsonl`：
```json
{
  "specs": [
    ".trellis/spec/backend/api-design.md",
    ".trellis/spec/guides/code-reuse-thinking.md"
  ]
}
```

2. 规范要具体，有示例：

❌ **不好的规范**：
```markdown
代码要清晰易读。
```

✅ **好的规范**：
```markdown
## 函数命名

- 使用动词开头：`getUserById`, `createOrder`
- 布尔值用 `is/has/should` 前缀：`isValid`, `hasPermission`

示例：
```typescript
// ✅ 正确
function getUserById(id: string): User { ... }

// ❌ 错误
function user(id: string): User { ... }
```
```

### Q5：如何在现有项目中引入 Trellis？

**步骤**：
1. 先在小功能上试用
2. 逐步添加规范文件
3. 团队培训，统一认知
4. 迭代优化规范

**建议的迁移路径**：
- 第一周：只用 tasks，不写 specs
- 第二周：添加 1-2 个核心 spec 文件
- 第三周：扩展 specs，覆盖主要模块
- 第四周：团队全面采用


## 十三、最佳实践

### 1. 规范文件的编写

**原则**：
- **具体胜于抽象**：用示例代替抽象描述
- **分层组织**：按模块、层级拆分规范文件
- **持续更新**：发现新的最佳实践及时补充

**示例结构**：
```
.trellis/spec/
├── guides/              # 通用思维指南
│   └── code-reuse.md
├── backend/
│   ├── api.md          # API 设计
│   ├── database.md     # 数据库规范
│   └── testing.md      # 测试规范
└── frontend/
    ├── components.md   # 组件规范
    └── state.md        # 状态管理
```

### 2. 任务管理

**命名规范**：
- 使用日期前缀：`MM-DD-功能描述`
- 保持简短：`06-07-user-auth`，而不是 `06-07-implement-user-authentication-with-jwt`

**PRD 编写**：
- 背景：为什么要做这个功能
- 目标：要达到什么效果
- 范围：做什么，不做什么
- 验收标准：如何判断完成

### 3. 工作日志

**建议**：
- 不要手动编辑日志，让 Trellis 自动记录
- 定期归档旧日志（如超过 3 个月）
- 添加到 `.gitignore`，避免冲突

### 4. 团队协作

**规范评审**：
- 规范文件更改要 Code Review
- 重大规范变更要团队讨论
- 保持规范的版本历史

**沟通机制**：
- 定期分享优秀的任务案例
- 收集团队反馈，优化规范
- 新人入职时，讲解 Trellis 使用方法


## 十四、常见误区

### 误区 1：规范文件越多越好

**错误观念**：写很多细节规范，覆盖所有可能的情况。

**正确做法**：
- 只写核心规范
- 从实际问题出发
- 规范要"够用"就好，不要过度设计

### 误区 2：所有任务都用 Trellis

**错误观念**：哪怕是修改一个 typo，也要创建任务目录。

**正确做法**：
- 小改动直接修改，不用 Trellis
- 复杂功能才走完整流程
- 根据项目实际情况灵活调整

### 误区 3：完全依赖 AI

**错误观念**：有了 Trellis，AI 就能完全理解项目，不需要人工干预。

**正确做法**：
- AI 是辅助，不是替代
- 关键决策仍需人工判断
- 代码质量需要人工审查

### 误区 4：不更新规范

**错误观念**：一次性写好规范，之后不再修改。

**正确做法**：
- 规范是活文档，需要迭代
- 发现新的最佳实践要及时补充
- 过时的规范要及时删除


## 十五、与其他工具的对比

### Trellis vs .cursorrules

| 特性 | Trellis | .cursorrules |
|------|---------|--------------|
| 规范组织 | 多文件，分层 | 单文件 |
| 任务管理 | 内置任务系统 | 无 |
| 跨会话记忆 | 工作日志 | 无 |
| 团队协作 | 版本控制 | 版本控制 |
| 平台支持 | 14 个平台 | 仅 Cursor |

### Trellis vs AGENTS.md

| 特性 | Trellis | AGENTS.md |
|------|---------|-----------|
| 结构化 | 高度结构化 | 自由文本 |
| 工作流 | 四阶段流程 | 无固定流程 |
| 上下文加载 | 按需加载 | 全量加载 |
| 学习曲线 | 稍高 | 低 |


## 十六、资源与社区

### 官方资源

- **官网**：https://docs.trytrellis.app/
- **GitHub**：https://github.com/mindfold-ai/Trellis
- **Discord**：https://discord.com/invite/tWcCZ3aRHc

### 许可证

Trellis 采用 **AGPL-3.0** 许可证：
- 开源免费
- 商业使用需遵守 AGPL 条款
- 修改后需开源

### 贡献指南

如果你想贡献代码：
1. Fork 仓库
2. 创建功能分支
3. 运行 `pnpm install && pnpm build`
4. 通过 `pnpm lint` 和 `pnpm typecheck`
5. 提交 PR

**Commit 规范**：
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
refactor: 代码重构
test: 测试相关
chore: 构建/工具链
```


## 十七、总结

### Trellis 的核心价值

1. **持久化项目上下文**：AI 不再"失忆"
2. **结构化工作流**：从规划到完成的完整流程
3. **团队协作友好**：规范版本控制，共享最佳实践
4. **跨平台兼容**：不绑定特定 AI 工具

### 何时使用 Trellis

- ✅ 项目有明确的架构和规范
- ✅ 团队协作，需要统一标准
- ✅ 长期维护的项目
- ✅ 复杂业务逻辑

### 从小处开始

如果你是第一次接触 Trellis：
1. 先在个人小项目试用
2. 只写 1-2 个核心规范文件
3. 体验完整的四阶段工作流
4. 根据实际效果决定是否推广到团队

### 关键原则

- **规范要具体**：有示例，可执行
- **任务要清晰**：明确目标和验收标准
- **工作流要遵守**：不要跳过验证阶段
- **持续迭代**：规范和流程都需要优化

---

**祝你使用 Trellis 愉快！有问题可以查阅官方文档或加入 Discord 社区。**
