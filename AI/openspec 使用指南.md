## OpenSpec 使用指南

> 适用版本：根据 Fission-AI/OpenSpec 官方仓库截至 2026-06-02 的文档整理。
> 官方仓库：https://github.com/Fission-AI/OpenSpec

## 0. 见解

因为随着项目的变大，用prompt很难让ai把所有的边界、上下文、规范理解完整

**SDD 规格驱动开发**：也就是在开始写代码前先想清楚

**TDD 测试驱动开发**：要求在写代码前先写测试用例

**实现思路：**

- **SDD 阶段**： AI 通过 `openspec` 明确了：我们要写一个处理高并发扣库存的接口，边界是不允许超卖。
    
- **TDD 阶段（AI 写测试）**： AI 根据 Spec，先把并发、负数库存、超时等**测试用例全写出来**（此时运行全红）。
    
- **编码阶段（AI 写实现）**：你让 AI 去写业务代码，直到把刚刚那些测试**全部跑通变绿**。

---

openspec 就是让开发前先明确需求、规范，相当于生成一份完整的 PRD ，再进行开发

## 1. OpenSpec 是什么

OpenSpec 是一个面向 AI 编程助手的规格驱动开发工具。它解决的问题很朴素：不要只靠聊天记录让 AI 猜需求，而是先把“为什么做、做什么、怎么做、分几步做”落到项目里的规格文档，再让 AI 按文档实现。

它的核心思想是：

- 先对齐需求，再写代码。
- 每个变更都有独立目录，里面保存提案、规格、设计和任务。
- 规格不是一次性文档，开发中可以随时回头修正。
- 支持已有项目，不只适合新项目。
- 可以和 Codex、Claude Code、Cursor、Windsurf 等 AI 编程工具配合使用。

最常见的完整流程是：

```text
/opsx:propose -> /opsx:apply -> /opsx:sync -> /opsx:archive
```

如果启用扩展工作流，也可以使用更细粒度的流程：

```text
/opsx:new -> /opsx:ff 或 /opsx:continue -> /opsx:apply -> /opsx:verify -> /opsx:archive
```

## 2. 安装与初始化

### 2.1 环境要求

OpenSpec 要求 Node.js 20.19.0 或更高版本。

检查 Node 版本：

```bash
node --version
```

### 2.2 安装

推荐用 npm 全局安装：

```bash
npm install -g @fission-ai/openspec@latest
```

也可以使用其他包管理器：

```bash
pnpm add -g @fission-ai/openspec@latest
yarn global add @fission-ai/openspec@latest
bun add -g @fission-ai/openspec@latest
```

验证安装：

```bash
openspec --version
```

### 2.3 初始化项目

进入你的项目目录：

```bash
cd your-project
openspec init
```

初始化后，OpenSpec 会创建项目内的规格目录，并为你选择的 AI 工具生成对应的指令或技能文件。

如果想指定目录：

```bash
openspec init path/to/project
```

如果想非交互式指定 AI 工具：

```bash
openspec init --tools codex
openspec init --tools claude,cursor
openspec init --tools all
openspec init --tools none
```

## 3. 初始化后会生成什么

典型结构如下：

```text
openspec/
├── specs/
│   └── <domain>/
│       └── spec.md
├── changes/
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/
│           └── <domain>/
│               └── spec.md
└── config.yaml
```

两个最重要的目录：

- `openspec/specs/`：当前系统行为的“事实来源”。这里描述项目现在已经具备的能力。
- `openspec/changes/`：正在计划或实现的变更。每个变更一个文件夹。

一个变更通常包含四类文档：

- `proposal.md`：为什么要做、目标是什么、范围是什么。
- `specs/`：增量规格，描述需求如何变化。
- `design.md`：技术方案、架构选择、关键取舍。
- `tasks.md`：实现清单，AI 会按任务逐项完成并打勾。

### 运行之后

```
openspec/
├── specs/
├── changes/
│   ├── add-dark-mode/
│   └── archive/
```

archive 就是一个历史的变更仓库

## 4. 核心概念：Delta Specs

OpenSpec 的规格不是简单写一篇 PRD，而是通过增量规格说明“相对于当前系统，要新增、修改、删除什么”。

常见格式：

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST require a second factor during login.

#### Scenario: OTP required
- GIVEN a user with 2FA enabled
- WHEN the user submits valid credentials
- THEN an OTP challenge is presented

## MODIFIED Requirements

### Requirement: Session Timeout
The system SHALL expire sessions after 30 minutes of inactivity.

## REMOVED Requirements

### Requirement: Remember Me
Deprecated in favor of 2FA.
```

归档时，OpenSpec 会把这些增量合并到 `openspec/specs/`：

- `ADDED`：追加到主规格。
- `MODIFIED`：替换已有需求。
- `REMOVED`：从主规格中删除。
- 部分命令也支持 `RENAMED` 一类的解析，用于更复杂的规格合并。

## 5. 两种使用模式

### 5.1 默认快速模式：core profile

新安装默认是 `core`，包含：

```text
/opsx:propose
/opsx:explore
/opsx:apply
/opsx:sync
/opsx:archive
```

适合大多数个人项目和日常功能开发。

推荐流程：

```text
/opsx:explore      可选，先讨论和调查
/opsx:propose      创建变更与规划文档
/opsx:apply        实现任务
/opsx:sync         可选，合并规格
/opsx:archive      完成并归档
```

### 5.2 扩展模式：更细粒度控制

如果你希望分步骤创建文档、逐个审阅，可以启用扩展指令：

```bash
openspec config profile
openspec update
```

扩展指令包括：

```text
/opsx:new
/opsx:continue
/opsx:ff
/opsx:verify
/opsx:bulk-archive
/opsx:onboard
```

适合复杂需求、团队协作、并行变更，或者你想学习完整流程时使用。

## 6. AI 斜杠指令详解

这些命令是在 AI 编程助手的聊天界面中输入的，不是在终端里输入。

### 6.1 `/opsx:explore`

> 也就是说当一开始想法不是很清楚可以使用该命令去跟ai进行讨论

用途：在正式创建变更前，和 AI 一起探索需求、调查代码、比较方案。

语法：

```text
/opsx:explore [topic]
```

适合场景：

- 你还不知道怎么设计。
- 你想让 AI 先读代码再给方案。
- 需求有多种实现路径，需要比较。

示例：

```text
/opsx:explore 如何给后台管理系统增加权限控制？
```

它不会创建 OpenSpec 文档，只是帮助你把想法变清楚。想法成熟后，再进入 `/opsx:propose`。

### 6.2 `/opsx:propose`

用途：创建一个变更，并一次性生成规划所需文档。

语法：

```text
/opsx:propose [change-name-or-description]
```

示例：

```text
/opsx:propose add-dark-mode
/opsx:propose 给登录页增加验证码
```

它通常会创建：

```text
openspec/changes/add-dark-mode/
├── proposal.md
├── design.md
├── tasks.md
└── specs/
```

使用建议：

- 小功能、明确需求，直接用它。
- 需求描述可以是英文 kebab-case，也可以是自然语言。
- 生成后先读一遍 `proposal.md`、`specs/`、`design.md`、`tasks.md`，确认 AI 没理解偏。

### 6.3 `/opsx:apply`

用途：让 AI 按 `tasks.md` 实现代码。

语法：

```text
/opsx:apply [change-name]
```

示例：

```text
/opsx:apply
/opsx:apply add-dark-mode
```

它会：

- 读取 `tasks.md`。
- 找到未完成的任务。
- 修改代码、创建文件、运行测试。
- 把完成项从 `[ ]` 改成 `[x]`。

使用建议：

- 如果同时有多个变更，最好显式写变更名。
- 中途被打断也没关系，再次 `/opsx:apply change-name` 可以从未完成任务继续。
- 实现过程中如果发现设计不合理，可以先修改文档再继续。

### 6.4 `/opsx:sync`

用途：把某个变更里的增量规格合并到主规格 `openspec/specs/`。

语法：

```text
/opsx:sync [change-name]
```

适合场景：

- 长期变更还没归档，但希望主规格先更新。
- 多个并行变更依赖同一份最新规格。
- 想在归档前单独审查规格合并结果。

注意：`/opsx:sync` 不会归档变更，变更仍然留在 `openspec/changes/`。

大多数快速变更可以不手动执行它，因为 `/opsx:archive` 会在需要时提示同步。

### 6.5 `/opsx:archive`

用途：完成变更，合并规格，并把变更移动到归档目录。

语法：

```text
/opsx:archive [change-name]
```

它会：

- 检查文档是否完整。
- 检查 `tasks.md` 是否完成，未完成时会警告。
- 提示是否同步增量规格。
- 把变更移动到：

```text
openspec/changes/archive/YYYY-MM-DD-<change-name>/
```

建议归档前先确认：

- 代码已经实现。
- 测试已通过。
- `tasks.md` 已全部勾选。
- `specs/` 描述和实际行为一致。

### 6.6 `/opsx:new`

用途：只创建变更骨架，不立即生成全部文档。

语法：

```text
/opsx:new [change-name] [--schema <schema-name>]
```

示例：

```text
/opsx:new add-billing-api
/opsx:new refactor-auth --schema spec-driven
```

它通常只创建：

```text
openspec/changes/<change-name>/
└── .openspec.yaml
```

适合你想一步一步推进复杂需求时使用。

### 6.7 `/opsx:continue`

用途：根据依赖关系创建下一个可创建的文档。

语法：

```text
/opsx:continue [change-name]
```

它会读取当前已有文档，判断下一步该创建什么。例如：

```text
proposal 已完成
specs 已就绪
design 已就绪
tasks 仍被阻塞，因为需要 specs
```

适合场景：

- 复杂功能，需要每一步都审阅。
- 想先反复打磨 `proposal.md`，再生成规格。
- 想让设计和任务严格依赖前面的文档。

### 6.8 `/opsx:ff`

用途：fast-forward，一次性把所有规划文档创建完。

语法：

```text
/opsx:ff [change-name]
```

典型流程：

```text
/opsx:new add-search
/opsx:ff
/opsx:apply
```

适合需求比较明确的小到中型功能。

### 6.9 `/opsx:verify`

用途：验证实现是否符合 OpenSpec 文档。

语法：

```text
/opsx:verify [change-name]
```

它主要检查三类问题：

- Completeness：任务是否都完成，需求是否都实现，场景是否覆盖。
- Correctness：实现是否符合规格意图，边界情况是否处理。
- Coherence：设计文档中的决策是否反映到代码里，命名和结构是否一致。

它不会强制阻止归档，但会把问题分成：

- `CRITICAL`
- `WARNING`
- `SUGGESTION`

建议在 `/opsx:archive` 前执行。

### 6.10 `/opsx:bulk-archive`

用途：一次归档多个已完成变更。

语法：

```text
/opsx:bulk-archive [change-names...]
```

适合场景：

- 你同时做了多个并行变更。
- 多个变更都完成了，想统一合并规格。
- 多个变更修改了同一规格目录，需要 AI 辅助判断合并顺序和冲突。

### 6.11 `/opsx:onboard`

用途：让 AI 用你的真实代码库带你走一遍完整 OpenSpec 流程。

语法：

```text
/opsx:onboard
```

它会：

- 扫描代码库。
- 找一个小而安全的改进机会。
- 创建实际变更。
- 生成提案、规格、设计和任务。
- 实现、验证、归档。
- 解释每一步。

如果你第一次使用 OpenSpec，并且已经启用扩展模式，这是很好的入门指令。

## 7. 终端 CLI 命令详解

这些命令在终端运行，主要用于安装、配置、查看、校验、归档和调试。

### 7.1 查看列表

查看活跃变更：

```bash
openspec list
```

查看所有主规格：

```bash
openspec list --specs
```

JSON 输出，适合脚本或 AI 工具：

```bash
openspec list --json
```

排序：

```bash
openspec list --sort recent
openspec list --sort name
```

### 7.2 查看详情

交互式选择查看：

```bash
openspec show
```

查看某个变更：

```bash
openspec show add-dark-mode
```

查看某个规格：

```bash
openspec show auth --type spec
```

输出 JSON：

```bash
openspec show add-dark-mode --json
```

常见选项：

- `--type change`：按变更查看。
- `--type spec`：按规格查看。
- `--deltas-only`：只看增量规格，JSON 模式下使用。
- `--requirements`：只看需求，JSON 模式下使用。
- `--no-scenarios`：不显示场景，JSON 模式下使用。

### 7.3 校验规格

校验某个变更：

```bash
openspec validate add-dark-mode
```

校验全部：

```bash
openspec validate --all
```

只校验变更：

```bash
openspec validate --changes
```

只校验主规格：

```bash
openspec validate --specs
```

严格模式：

```bash
openspec validate --all --strict
```

JSON 输出：

```bash
openspec validate --all --json
```

并发校验：

```bash
openspec validate --all --concurrency 12
```

### 7.4 交互式仪表盘

```bash
openspec view
```

它会打开一个终端内仪表盘，用于浏览规格和变更。

### 7.5 终端归档

除了 `/opsx:archive`，也可以在终端归档：

```bash
openspec archive add-dark-mode
```

跳过确认：

```bash
openspec archive add-dark-mode --yes
```

文档、CI、工具配置等不影响产品规格的变更，可以跳过规格更新：

```bash
openspec archive update-ci-config --skip-specs
```

跳过校验：

```bash
openspec archive add-dark-mode --no-validate
```

不建议日常跳过校验，除非你很确定当前状态。

### 7.6 查看变更状态

```bash
openspec status
openspec status --change add-dark-mode
openspec status --change add-dark-mode --json
```

它会显示哪些文档已经完成，哪些文档还被依赖阻塞。

### 7.7 获取 AI 指令上下文

```bash
openspec instructions --change add-dark-mode
openspec instructions design --change add-dark-mode
openspec instructions apply --change add-dark-mode
openspec instructions design --change add-dark-mode --json
```

这类命令主要给 AI 或脚本使用，用于获取下一步文档模板、依赖文档内容和实现说明。

### 7.8 查看模板和 schema

查看当前 schema 的模板来源：

```bash
openspec templates
openspec templates --schema spec-driven
openspec templates --json
```

查看可用 schema：

```bash
openspec schemas
openspec schemas --json
```

### 7.9 创建变更骨架

终端也能创建 repo-local change：

```bash
openspec new change add-billing-api
```

常用选项：

```bash
openspec new change add-billing-api --description "Add billing API"
openspec new change add-billing-api --goal "Support paid plans"
openspec new change add-billing-api --areas "api,billing"
openspec new change add-billing-api --schema spec-driven
openspec new change add-billing-api --json
```

更新变更元数据：

```bash
openspec set change add-billing-api --json
```

## 8. 配置命令

查看配置文件路径：

```bash
openspec config path
```

列出当前配置：

```bash
openspec config list
```

读取某项配置：

```bash
openspec config get telemetry.enabled
```

设置配置：

```bash
openspec config set telemetry.enabled false
openspec config set user.name "Your Name" --string
```

删除配置：

```bash
openspec config unset user.name
```

编辑配置：

```bash
openspec config edit
```

重置配置：

```bash
openspec config reset --all --yes
```

配置工作流 profile：

```bash
openspec config profile
```

快速切回 core：

```bash
openspec config profile core
```

修改 profile 后，要在项目里刷新 AI 指令：

```bash
openspec update
```

## 9. 自定义 Schema

OpenSpec 的 artifact 流程由 schema 驱动。默认 schema 通常是：

```text
proposal -> specs -> design -> tasks
```

### 9.1 创建项目本地 schema

```bash
openspec schema init research-first
```

指定 artifacts：

```bash
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

会创建：

```text
openspec/schemas/<name>/
├── schema.yaml
└── templates/
    ├── proposal.md
    ├── specs.md
    ├── design.md
    └── tasks.md
```

### 9.2 复制内置 schema 进行定制

```bash
openspec schema fork spec-driven my-workflow
```

### 9.3 校验 schema

```bash
openspec schema validate my-workflow
openspec schema validate
```

### 9.4 查看 schema 来源

```bash
openspec schema which spec-driven
openspec schema which --all
```

schema 优先级：

1. 项目级：`openspec/schemas/<name>/`
2. 用户级：用户数据目录中的 schemas
3. 包内置 schema

## 10. Workspace、Context Store 与 Initiative

这部分适合更大规模的项目或团队协作。初学时可以先跳过。

### 10.1 Workspace

Workspace 用于组织多个 repo 或文件夹，让 OpenSpec 在更大的上下文里工作。

常见命令：

```bash
openspec workspace setup
openspec workspace list
openspec workspace link
openspec workspace relink
openspec workspace doctor
openspec workspace update
```

用途：

- 多仓库项目。
- 一个产品由多个服务组成。
- 希望 AI 能看到跨项目上下文。

### 10.2 Context Store

Context store 是本地注册的持久共享上下文目录，通常可以是 Git 管理的文件夹。

创建：

```bash
openspec context-store setup team-context
openspec context-store setup team-context --path /repos/team-context --no-init-git
```

注册已有目录：

```bash
openspec context-store register /repos/team-context --id team-context
```

查看：

```bash
openspec context-store list
openspec context-store doctor team-context
```

取消注册但不删文件：

```bash
openspec context-store unregister team-context
```

删除注册和本地目录：

```bash
openspec context-store remove team-context --yes
```

### 10.3 Initiative

Initiative 是 context store 里的共享计划上下文。它可以把多个 repo-local change 关联到同一个更大的目标。

创建：

```bash
openspec initiative create billing-launch \
  --store team-context \
  --title "Billing Launch" \
  --summary "Launch paid plans and billing workflows"
```

查看：

```bash
openspec initiative list
openspec initiative show billing-launch
openspec initiative show team-context/billing-launch
```

把 repo-local change 关联到 initiative：

```bash
openspec new change add-billing-api --initiative billing-launch --store team-context
openspec set change add-billing-api --initiative team-context/billing-launch
```

## 11. Shell 补全与反馈

安装命令补全：

```bash
openspec completion install
openspec completion install powershell
openspec completion install bash
openspec completion install zsh
openspec completion install fish
```

生成补全脚本：

```bash
openspec completion generate bash
```

提交反馈，需要安装并登录 GitHub CLI：

```bash
openspec feedback "Add support for custom artifact types" \
  --body "Detailed description here."
```

## 12. 环境变量

关闭遥测：

```bash
OPENSPEC_TELEMETRY=0
DO_NOT_TRACK=1
```

设置校验并发：

```bash
OPENSPEC_CONCURRENCY=12
```

设置编辑器：

```bash
EDITOR=code
VISUAL=code
```

禁用颜色输出：

```bash
NO_COLOR=1
```

在 PowerShell 中可写成：

```powershell
$env:OPENSPEC_TELEMETRY = "0"
$env:DO_NOT_TRACK = "1"
$env:OPENSPEC_CONCURRENCY = "12"
```

## 13. 初学者推荐练习路线

### 第一步：安装并初始化

```bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
openspec list
```

目标：确认 OpenSpec 能运行，项目里出现 `openspec/` 目录。

### 第二步：做一个小功能

在 AI 助手里输入：

```text
/opsx:propose add-dark-mode
```

然后打开这些文件阅读：

```text
openspec/changes/add-dark-mode/proposal.md
openspec/changes/add-dark-mode/specs/
openspec/changes/add-dark-mode/design.md
openspec/changes/add-dark-mode/tasks.md
```

确认没问题后：

```text
/opsx:apply add-dark-mode
```

### 第三步：检查结果

终端里运行：

```bash
openspec validate add-dark-mode
openspec show add-dark-mode
```

如果启用了扩展工作流，也可以在 AI 里运行：

```text
/opsx:verify add-dark-mode
```

### 第四步：归档

```text
/opsx:archive add-dark-mode
```

或终端：

```bash
openspec archive add-dark-mode
```

归档后检查：

```bash
openspec list
openspec list --specs
```

### 第五步：尝试扩展模式

```bash
openspec config profile
openspec update
```

然后在 AI 里练习：

```text
/opsx:new add-search
/opsx:continue add-search
/opsx:continue add-search
/opsx:ff add-search
/opsx:apply add-search
/opsx:verify add-search
/opsx:archive add-search
```

## 14. 实战工作流建议

### 小功能

```text
/opsx:propose add-user-avatar
/opsx:apply add-user-avatar
/opsx:archive add-user-avatar
```

### 需求不清楚

```text
/opsx:explore 用户登录失败率偏高，应该怎么排查和优化？
/opsx:propose improve-login-errors
/opsx:apply improve-login-errors
/opsx:archive improve-login-errors
```

### 复杂功能

```text
/opsx:new add-billing-system
/opsx:continue add-billing-system
```

审阅并修改 `proposal.md` 后：

```text
/opsx:continue add-billing-system
```

审阅规格和设计后：

```text
/opsx:continue add-billing-system
/opsx:apply add-billing-system
/opsx:verify add-billing-system
/opsx:archive add-billing-system
```

### 多个并行变更

```text
/opsx:apply add-dark-mode
/opsx:apply fix-login-redirect
/opsx:bulk-archive
```

## 15. 常见问题

### Q1：什么时候用 `/opsx:propose`，什么时候用 `/opsx:new`？

需求明确，用 `/opsx:propose`。

需求复杂、想逐步审阅文档，用 `/opsx:new` 加 `/opsx:continue`。

### Q2：什么时候用 `/opsx:ff`，什么时候用 `/opsx:continue`？

能一次讲清楚完整范围，用 `/opsx:ff`。

还在边想边做，用 `/opsx:continue`。

### Q3：`/opsx:sync` 必须手动执行吗？

通常不用。`/opsx:archive` 会在需要时提示同步。只有长期变更、并行变更、或者你想提前审查规格合并时，才手动 `/opsx:sync`。

### Q4：OpenSpec 会替我写业务代码吗？

OpenSpec 本身主要管理规格和工作流。真正写代码的是 AI 编程助手，OpenSpec 给 AI 提供结构化上下文和任务清单。

### Q5：OpenSpec 适合已有项目吗？

适合。它的理念强调 brownfield，也就是可以在已有项目中逐步引入，不必重建项目。

### Q6：规格文档写错了怎么办？

直接改。OpenSpec 的工作流不是瀑布模型，开发中可以回头修正 proposal、specs、design、tasks。

### Q7：归档后还能看历史吗？

可以。归档后的变更会保存在：

```text
openspec/changes/archive/
```

### Q8：可以跳过规格更新吗？

可以。对于纯工具、CI、文档类变更，终端归档时可用：

```bash
openspec archive update-ci-config --skip-specs
```

## 16. 最佳实践

- 一个变更只做一件相对清晰的事。
- 变更名使用 kebab-case，例如 `add-dark-mode`、`fix-login-redirect`。
- 实现前先读一遍生成的文档，尤其是 `tasks.md` 和 `specs/`。
- 复杂需求优先用 `/opsx:explore`，不要一上来就实现。
- 并行变更要显式写 change name，避免 AI 选错上下文。
- 归档前运行 `openspec validate`，扩展模式下再运行 `/opsx:verify`。
- 长期项目要让 `openspec/specs/` 保持可信，不要把它当废弃文档。
- 规格描述尽量写可验证场景，使用 GIVEN / WHEN / THEN。
- 如果实现偏离设计，要么改代码，要么同步更新 `design.md`。
- 不影响产品行为的变更，可以 `--skip-specs`，避免污染业务规格。

## 17. 一页速查

### AI 斜杠指令

| 指令 | 用途 |
| --- | --- |
| `/opsx:explore` | 探索问题、调查代码、比较方案 |
| `/opsx:propose` | 快速创建变更和规划文档 |
| `/opsx:apply` | 按任务实现代码 |
| `/opsx:sync` | 将增量规格合并到主规格 |
| `/opsx:archive` | 完成并归档变更 |
| `/opsx:new` | 创建变更骨架 |
| `/opsx:continue` | 创建下一个规划文档 |
| `/opsx:ff` | 一次性创建全部规划文档 |
| `/opsx:verify` | 验证实现和文档是否一致 |
| `/opsx:bulk-archive` | 批量归档多个变更 |
| `/opsx:onboard` | 交互式完整教程 |

### 终端命令

| 命令 | 用途 |
| --- | --- |
| `openspec init` | 初始化项目 |
| `openspec update` | 刷新项目内 AI 指令/技能 |
| `openspec list` | 查看活跃变更 |
| `openspec list --specs` | 查看主规格 |
| `openspec show` | 查看变更或规格详情 |
| `openspec validate` | 校验规格结构 |
| `openspec view` | 打开交互式仪表盘 |
| `openspec archive` | 终端归档变更 |
| `openspec status` | 查看 artifact 完成状态 |
| `openspec instructions` | 获取 AI 生成 artifact 或实现所需说明 |
| `openspec templates` | 查看模板路径 |
| `openspec schemas` | 查看可用 schema |
| `openspec schema init` | 创建自定义 schema |
| `openspec config profile` | 配置工作流 profile |
| `openspec completion install` | 安装 shell 补全 |

## 18. 参考资料

- OpenSpec GitHub 仓库：https://github.com/Fission-AI/OpenSpec
- Getting Started：https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md
- Commands：https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md
- CLI：https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md
- Workflows：https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md
- Installation：https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md
- Supported Tools：https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md
