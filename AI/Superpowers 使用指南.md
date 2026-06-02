## Superpowers 使用指南

> 适用对象：想用 Claude Code、Codex、Cursor、Gemini CLI、OpenCode、GitHub Copilot CLI 等 AI 编程助手进行更稳定工程开发的人。
>
> 本文以 `obra/superpowers` 为准。它不是一个传统编程框架，而是一套给编码代理使用的 skills 工作流和软件开发方法论。

## 0. 快速认识

Superpowers 的核心目标是：让 AI 编程助手不要一上来就写代码，而是按工程流程工作。

它把常见开发过程拆成一组可组合的 skill：

- `brainstorming`：先澄清需求、比较方案、形成设计文档。
- `writing-plans`：把设计拆成可执行计划，每一步都有文件、代码、验证方式。
- `test-driven-development`：按 RED-GREEN-REFACTOR 写测试、实现、重构。
- `systematic-debugging`：按证据定位根因，而不是猜修。
- `requesting-code-review` / `receiving-code-review`：任务之间做代码审查和反馈处理。
- `using-git-worktrees`：用独立分支/工作树隔离开发任务。
- `subagent-driven-development` / `executing-plans`：按计划执行，多任务时可并行或分批。
- `finishing-a-development-branch`：收尾、验证、合并、PR 或保留分支。
- `verification-before-completion`：完成前验证结果是真的成立。
- `writing-skills` / `using-superpowers`：学习和扩展 Superpowers 本身。

官方 README 把它描述为 “complete software development methodology for your coding agents”，也就是给编码代理使用的一整套开发方法。参考：

- <https://github.com/obra/superpowers>
- <https://obra-superpowers.mintlify.app/installation/codex>

## 1. 它解决了什么问题

### 1.1 普通 AI 编程助手常见问题

在没有约束的情况下，AI 编程助手容易出现这些行为：

- 需求还没问清楚就直接改代码。
- 没有设计文档，后续上下文一长就偏离目标。
- 先写实现，再补测试，甚至不测。
- Debug 靠猜，改一处破一处。
- 多文件、多模块任务缺少阶段性 review。
- 完成时只说 “应该可以”，没有证据。

### 1.2 Superpowers 的解决方式

Superpowers 用 skill 把 “应该怎么开发” 变成编码代理会主动遵守的流程：

- 需求不清楚时，先进入 `brainstorming`。
- 设计确认后，再进入 `writing-plans`。
- 实现时，优先用 `test-driven-development`。
- 遇到 bug，用 `systematic-debugging`。
- 每个阶段用 review 和 verification 做质量闸门。

一句话理解：

```text
普通提示词：告诉 AI 你想要什么。
Superpowers：告诉 AI 它应该怎样工作。
```

## 2. 适合和不适合的场景

### 2.1 适合

- 新功能开发：登录、支付、搜索、导入导出、后台配置等。
- 复杂重构：拆模块、迁移框架、统一数据模型。
- Bug 修复：尤其是原因不明、复现不稳定、影响面不清楚的问题。
- 测试补强：给已有代码补单测、集成测试、边界测试。
- 长任务：需要多步执行、阶段 review、不能只靠一次 prompt 的工作。
- 团队协作：需要设计文档、计划文档、审查记录的项目。

### 2.2 不适合

- 一句话级别的小问题，例如 “这个正则什么意思”。
- 只想快速生成一段一次性脚本。
- 你已经有非常成熟的内部 agent workflow，并且不想被外部流程约束。
- 对 token、上下文消耗极其敏感的微任务。

## 3. 工作流

- **头脑风暴（Brainstorming）：** 在写代码前，AI 会主动退一步，向你抛出核心问题、分析技术架构和利弊（Trade-offs），直到你确认了设计文档，它才会进行下一步。
    
- **Git 工作树隔离（Git Worktrees）：** 自动创建一个干净的 Git 隔离工作空间（分支），不污染你的主分支。
    
- **制定拆分计划（Writing Plans）：** 将任务拆解为无数个“2-5分钟即可完成”的原子化小任务。
    
- **子智能体驱动开发（Subagent-Driven Development）：** 这是它最强的地方。针对每一个小任务，AI 会生成一个**全新的、干净的子 AI 智能体**去执行，完成后立刻销毁。这完美解决了长对话中 AI 性能退化、出错累积的问题。
    
- **测试驱动开发（TDD）：** 强制执行 `红 -> 绿 -> 重构` 流程。AI 必须**先写一个失败的测试（红）**，然后写出刚巧通过测试的代码（绿），最后重构。如果 AI 没写测试就敢写业务代码，Superpowers 的规则会强制把它的代码**无情删掉**重新来过。
    
- **代码评审（Code Review）：** 任务完成后，由另一个扮演 Reviewer 的子 AI 对代码质量和边缘情况进行双重检查。
    
- **分支合并与清理（Finishing Branch）：** 所有测试通过后，自动运行测试集，并帮你合并代码或提交 PR。

## 4. 基本指令和操作

Superpowers 的重点不是 “命令行工具”，而是 “skill 被触发后，代理按流程工作”。不同 harness 的触发方式不同：

- Claude Code / 部分插件环境：可能支持 slash command 或显式 skill 名。
- Codex：更偏 native skill discovery，通常通过任务描述自动触发，也可以直接说 “使用某个 skill”。
- Cursor / Gemini / OpenCode：依环境支持插件、扩展或 skill 发现。

因此，最稳妥的用法是用自然语言明确指定 skill。

### 4.1 `using-superpowers`

作用：让代理说明当前 Superpowers 能力、skill 使用方式和可用工作流。

常用提示：

```text
请使用 using-superpowers skill，告诉我当前可以怎样使用 Superpowers。
```

适合：

- 刚安装后验证。
- 不确定当前环境是否加载成功。
- 想看当前 agent 能识别哪些 skill。

### 4.2 `brainstorming`

作用：在写代码前澄清需求、提出方案、识别风险、生成设计文档。

常用提示：

```text
请使用 brainstorming skill，和我一起设计一个本地待办事项 CLI。要求支持新增、列表、完成任务，并把数据存到 JSON 文件。
```

参数不是传统 CLI 参数，而是你给 agent 的需求上下文。建议包含：

- 目标用户。
- 必须支持的功能。
- 不需要支持的功能。
- 技术栈限制。
- 数据存储方式。
- 测试要求。
- 已知风险。

示例：

```text
请使用 brainstorming skill 设计一个 React 组件库文档站。
约束：
- 使用 Vite + React + TypeScript
- 不接入后端
- 首页直接展示组件浏览器，不做营销落地页
- 需要支持暗色模式
- 先不要写代码，只产出设计方案
```

### 4.3 `writing-plans`

作用：把已确认的设计拆成可执行任务。好的计划应该包含：

- 每个任务的目标。
- 要修改或创建的文件。
- 测试先写什么。
- 实现代码大致长什么样。
- 验证命令。
- 完成标准。

常用提示：

```text
请使用 writing-plans skill，基于刚才确认的设计写一个实现计划。计划要按 TDD 拆分，每一步都说明要改哪些文件和如何验证。
```

适合：

- 复杂功能开始前。
- 你想让 agent 可控地执行，而不是自由发挥。
- 需要把计划交给另一个 agent 或人来执行。

### 4.4 `test-driven-development`

作用：强制按 RED-GREEN-REFACTOR 循环实现。

循环含义：

- RED：先写失败测试，并确认它确实失败。
- GREEN：写最少实现，让测试通过。
- REFACTOR：在测试保护下整理代码。

常用提示：

```text
请使用 test-driven-development skill 实现计划中的第 1 个任务。先写失败测试，运行确认失败，再写实现，最后运行测试确认通过。
```

不要这样说：

```text
先把功能写完，最后帮我补测试。
```

更好的说法：

```text
请严格按 TDD：先测试，再实现。每完成一个小任务都运行对应测试。
```

### 4.5 `systematic-debugging`

作用：遇到 bug 时按证据找根因。

常用提示：

```text
请使用 systematic-debugging skill 调查这个问题：运行 npm test 时，完成任务功能偶尔失败。先复现，再定位根因，不要直接猜修。
```

建议提供：

- 报错信息。
- 复现步骤。
- 最近改动。
- 期望行为。
- 实际行为。

### 4.6 `requesting-code-review`

作用：在继续下一阶段前审查当前改动。

常用提示：

```text
请使用 requesting-code-review skill 审查当前改动，优先找 bug、需求偏差、测试缺口和可维护性问题。
```

适合：

- 每完成一个计划阶段。
- 合并前。
- agent 自己写了较大代码后。

### 4.7 `receiving-code-review`

作用：处理 review 反馈，不是泛泛道歉，而是逐条修复、验证、解释。

常用提示：

```text
请使用 receiving-code-review skill 处理以下 review 反馈，并逐条说明修复结果：
1. xxx
2. xxx
```

### 4.8 `verification-before-completion`

作用：收尾前验证结果，不让 “看起来完成了” 冒充完成。

常用提示：

```text
请使用 verification-before-completion skill。运行必要的测试和手动检查，确认这个功能真的完成。
```

验证一般包括：

- 单元测试。
- 集成测试。
- 构建。
- lint。
- 手动运行示例。
- 截图或输出检查。

### 4.9 `using-git-worktrees`

作用：为新任务创建独立工作区和分支，避免污染主工作区。

常用提示：

```text
请使用 using-git-worktrees skill，为这个功能创建独立工作树和分支，然后确认测试基线是干净的。
```

适合：

- 同时推进多个功能。
- 需要避免当前目录已有未提交改动被覆盖。
- 想让 agent 在隔离分支上试错。

### 4.10 `executing-plans`

作用：按计划执行任务，通常适合没有 subagent 的环境。

常用提示：

```text
请使用 executing-plans skill 执行 docs/superpowers/plans/todo-cli-plan.md。每完成一批任务后停下来汇报。
```

### 4.11 `subagent-driven-development`

作用：如果环境支持 subagent，用多个新上下文执行计划，并进行两阶段 review。

常用提示：

```text
请使用 subagent-driven-development skill 执行这个计划。每个任务使用独立 subagent，完成后做规格符合性 review 和代码质量 review。
```

适合：

- 多模块功能。
- 可并行任务。
- 需要长时间自动推进的开发。

### 4.12 `finishing-a-development-branch`

作用：开发分支完成后收尾。

常用提示：

```text
请使用 finishing-a-development-branch skill 完成当前开发分支：运行验证，汇总改动，并给出 merge、PR、保留或丢弃的选项。
```

### 4.13 `writing-skills`

作用：创建自己的 skill，让 agent 学会团队或项目专属流程。

常用提示：

```text
请使用 writing-skills skill，帮我创建一个用于审查 React 组件可访问性的自定义 skill。
```

一个最小 skill 示例：

```markdown
---
name: react-a11y-review
description: Use when reviewing React component accessibility, including labels, keyboard operation, focus states, and ARIA usage
---

# React A11y Review

When reviewing a React component:

1. Check interactive elements are reachable by keyboard.
2. Check visible labels or accessible names exist.
3. Check focus states are visible.
4. Avoid unnecessary ARIA when semantic HTML is enough.
5. Report findings by severity with file and line references.
```

## 5. 第一个示例项目：Todo CLI

这个练习的目标不是手写一个复杂项目，而是学习如何让 Superpowers 带着你从需求到验证完整走一遍。

我们将创建一个 Node.js Todo CLI：

- `todo add "任务"`：新增任务。
- `todo list`：列出任务。
- `todo done <id>`：完成任务。
- 数据存到本地 `todos.json`。
- 用 Vitest 写测试。

### 5.1 创建目录

```powershell
mkdir superpowers-todo-cli
cd superpowers-todo-cli
git init
npm init -y
npm install -D vitest
```

编辑 `package.json`：

```json
{
  "name": "superpowers-todo-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "todo": "./src/cli.js"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "latest"
  }
}
```

### 5.2 用 `brainstorming` 形成设计

在你的 AI 编程助手里输入：

```text
请使用 brainstorming skill，帮我设计一个 Node.js Todo CLI。
功能：
- todo add "任务"
- todo list
- todo done <id>
- 数据保存到 todos.json
- 使用 Vitest 做测试
约束：
- 先不要写代码
- 只做本地 CLI，不需要服务器
- 代码要简单，适合初学者阅读
```

你应该得到类似设计结论：

```text
模块划分：
- src/store.js：读取和写入 JSON 数据
- src/todo.js：业务逻辑，新增、列表、完成
- src/cli.js：解析命令行参数并输出文本
- test/todo.test.js：业务逻辑测试

数据结构：
{
  "nextId": 2,
  "items": [
    { "id": 1, "text": "学习 Superpowers", "done": false }
  ]
}
```

确认设计后再继续。

### 5.3 用 `writing-plans` 写计划

输入：

```text
请使用 writing-plans skill，基于刚才的 Todo CLI 设计写一个 TDD 实现计划。
每个任务都要包含：
- 要创建或修改的文件
- 先写哪个测试
- 实现哪段逻辑
- 运行什么命令验证
```

一个合理计划应类似：

```text
任务 1：实现内存级 todo 业务逻辑
- 创建 src/todo.js
- 创建 test/todo.test.js
- 先测 addTodo 能新增任务
- npm test

任务 2：实现 doneTodo 和 listTodos
- 扩展 test/todo.test.js
- 扩展 src/todo.js
- npm test

任务 3：实现 JSON store
- 创建 src/store.js
- 创建 test/store.test.js
- npm test

任务 4：实现 CLI
- 创建 src/cli.js
- 手动运行 node src/cli.js add "学习 Superpowers"
- npm test
```

### 5.4 完整示例代码

如果你想先自己练习，可以让 agent 按 TDD 一步步写。下面是最终参考实现。

创建 `src/todo.js`：

```js
export function createState() {
  return {
    nextId: 1,
    items: []
  };
}

export function addTodo(state, text) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("Todo text is required");
  }

  const item = {
    id: state.nextId,
    text: trimmed,
    done: false
  };

  return {
    nextId: state.nextId + 1,
    items: [...state.items, item]
  };
}

export function listTodos(state) {
  return state.items;
}

export function doneTodo(state, id) {
  const numericId = Number(id);
  let found = false;

  const items = state.items.map((item) => {
    if (item.id !== numericId) {
      return item;
    }

    found = true;
    return { ...item, done: true };
  });

  if (!found) {
    throw new Error(`Todo ${id} was not found`);
  }

  return {
    ...state,
    items
  };
}
```

创建 `src/store.js`：

```js
import { readFile, writeFile } from "node:fs/promises";
import { createState } from "./todo.js";

export async function loadState(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return createState();
    }

    throw error;
  }
}

export async function saveState(filePath, state) {
  const content = JSON.stringify(state, null, 2);
  await writeFile(filePath, `${content}\n`, "utf8");
}
```

创建 `src/cli.js`：

```js
#!/usr/bin/env node

import { resolve } from "node:path";
import { addTodo, doneTodo, listTodos } from "./todo.js";
import { loadState, saveState } from "./store.js";

const dataFile = resolve(process.cwd(), "todos.json");

function printHelp() {
  console.log("Usage:");
  console.log('  todo add "task text"');
  console.log("  todo list");
  console.log("  todo done <id>");
}

function formatTodo(item) {
  const mark = item.done ? "x" : " ";
  return `${item.id}. [${mark}] ${item.text}`;
}

export async function run(argv) {
  const [command, ...args] = argv;
  const state = await loadState(dataFile);

  if (command === "add") {
    const text = args.join(" ");
    const nextState = addTodo(state, text);
    await saveState(dataFile, nextState);
    console.log("Added todo.");
    return;
  }

  if (command === "list") {
    const items = listTodos(state);
    if (items.length === 0) {
      console.log("No todos yet.");
      return;
    }

    console.log(items.map(formatTodo).join("\n"));
    return;
  }

  if (command === "done") {
    const [id] = args;
    const nextState = doneTodo(state, id);
    await saveState(dataFile, nextState);
    console.log(`Completed todo ${id}.`);
    return;
  }

  printHelp();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
```

创建 `test/todo.test.js`：

```js
import { describe, expect, it } from "vitest";
import { addTodo, createState, doneTodo, listTodos } from "../src/todo.js";

describe("todo business logic", () => {
  it("adds a todo", () => {
    const state = addTodo(createState(), "Learn Superpowers");

    expect(state.items).toEqual([
      { id: 1, text: "Learn Superpowers", done: false }
    ]);
    expect(state.nextId).toBe(2);
  });

  it("rejects empty todo text", () => {
    expect(() => addTodo(createState(), "   ")).toThrow("Todo text is required");
  });

  it("lists todos", () => {
    const state = addTodo(createState(), "Write tests");

    expect(listTodos(state)).toHaveLength(1);
  });

  it("marks a todo as done", () => {
    const state = addTodo(createState(), "Run tests");
    const nextState = doneTodo(state, 1);

    expect(nextState.items[0].done).toBe(true);
  });

  it("throws when completing a missing todo", () => {
    expect(() => doneTodo(createState(), 99)).toThrow("Todo 99 was not found");
  });
});
```

创建 `test/store.test.js`：

```js
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { addTodo, createState } from "../src/todo.js";
import { loadState, saveState } from "../src/store.js";

let tempDir;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

async function tempFile() {
  tempDir = await mkdtemp(join(tmpdir(), "todo-cli-"));
  return join(tempDir, "todos.json");
}

describe("todo store", () => {
  it("loads an empty state when the file does not exist", async () => {
    const filePath = await tempFile();

    await expect(loadState(filePath)).resolves.toEqual(createState());
  });

  it("saves state as JSON", async () => {
    const filePath = await tempFile();
    const state = addTodo(createState(), "Persist me");

    await saveState(filePath, state);

    const content = await readFile(filePath, "utf8");
    expect(JSON.parse(content)).toEqual(state);
  });
});
```

运行测试：

```powershell
npm test
```

手动运行：

```powershell
node src/cli.js list
node src/cli.js add "学习 Superpowers"
node src/cli.js add "写第一个 TDD 示例"
node src/cli.js list
node src/cli.js done 1
node src/cli.js list
```

预期输出类似：

```text
No todos yet.
Added todo.
Added todo.
1. [ ] 学习 Superpowers
2. [ ] 写第一个 TDD 示例
Completed todo 1.
1. [x] 学习 Superpowers
2. [ ] 写第一个 TDD 示例
```

### 5.5 用 Superpowers 执行这个项目的推荐提示词

你可以不直接复制上面的代码，而是让 agent 通过 Superpowers 完整实现：

```text
请使用 brainstorming skill，设计这个 Todo CLI。先不要写代码。
```

确认设计后：

```text
请使用 writing-plans skill，把设计转成 TDD 实现计划。
```

确认计划后：

```text
请使用 test-driven-development skill 执行计划中的任务 1。必须先写失败测试并运行确认失败。
```

每完成一个任务：

```text
请使用 requesting-code-review skill 审查当前改动。
```

全部完成后：

```text
请使用 verification-before-completion skill，运行测试和手动 CLI 示例，确认项目完成。
```

## 6. 高级用法

### 6.1 把 Superpowers 和项目规范结合

在项目根目录放 `AGENTS.md`、`CLAUDE.md`、`.cursorrules` 或你所用工具支持的项目指令，写清楚团队约束。

示例 `AGENTS.md`：

```markdown
# Project Instructions

## Development Workflow

- Use Superpowers skills for non-trivial work.
- Start new features with brainstorming before implementation.
- Convert approved designs into writing-plans.
- Use TDD for business logic.
- Run `npm test` and `npm run build` before declaring completion.

## Code Style

- Use TypeScript for application code.
- Keep functions small and testable.
- Prefer explicit errors over silent failure.
- Do not add new dependencies without explaining why.
```

### 6.2 为不同任务选择 skill

| 任务 | 推荐 skill |
| --- | --- |
| 需求模糊的新功能 | `brainstorming` |
| 已有设计，需要落地 | `writing-plans` |
| 实现业务逻辑 | `test-driven-development` |
| 线上 bug / 难复现 bug | `systematic-debugging` |
| 大任务分批执行 | `executing-plans` |
| 多任务并行 | `subagent-driven-development` |
| 合并前质量检查 | `requesting-code-review` |
| 处理审查意见 | `receiving-code-review` |
| 最终确认 | `verification-before-completion` |
| 多分支隔离开发 | `using-git-worktrees` |
| 写团队自定义流程 | `writing-skills` |

### 6.3 推荐项目结构

Superpowers 相关文档可以放在 `docs/superpowers/`：

```text
project-root/
  AGENTS.md
  docs/
    superpowers/
      specs/
        2026-06-02-todo-cli-design.md
      plans/
        2026-06-02-todo-cli-plan.md
      reviews/
        2026-06-02-todo-cli-review.md
  src/
  test/
```

好处：

- 设计、计划、review 记录可以提交到 Git。
- 后续 agent 读项目时能快速恢复上下文。
- 人类 reviewer 可以检查 “设计是否真的被实现”。

### 6.4 提示词最佳实践

少说：

```text
帮我做一个登录功能。
```

多说：

```text
请使用 brainstorming skill 设计登录功能。
背景：
- 前端是 React + TypeScript
- 后端已有 POST /api/login
- 登录成功后保存 access token
- 失败时显示错误
约束：
- 不新增状态管理库
- 先不要写代码
- 需要考虑测试方案和安全风险
```

少说：

```text
修一下这个 bug。
```

多说：

```text
请使用 systematic-debugging skill 调查这个 bug。
复现步骤：
1. 打开订单列表
2. 搜索订单号 A123
3. 清空搜索框
实际结果：列表为空
期望结果：恢复全部订单
请先复现并定位根因，不要直接改代码。
```

### 6.5 控制范围和节奏

Superpowers 很适合大任务，但你仍然要给边界：

```text
只实现用户管理的列表和搜索，不做新增、编辑、删除。
```

```text
每完成一个计划任务后暂停，等我确认再继续。
```

```text
不要改动认证模块，除非你能证明必须修改。
```

```text
如果需要新增依赖，先说明理由并等待确认。
```

### 6.6 与 Git 的配合

推荐流程：

```bash
git status
git checkout -b feature/todo-cli
```

然后让 agent：

```text
请使用 using-git-worktrees skill 或按当前分支继续。执行前先检查 git status，避免覆盖未提交改动。
```

每个小任务后：

```bash
npm test
git status
git diff
git add src test package.json
git commit -m "Add todo business logic"
```

### 6.7 自定义 skill

如果团队有固定 review 规则，可以创建自己的 skill。

目录示例：

```text
~/.agents/skills/company-api-review/SKILL.md
```

内容：

```markdown
---
name: company-api-review
description: Use when reviewing backend API changes for company conventions, including auth, validation, logging, and error response shape
---

# Company API Review

Review API changes in this order:

1. Authentication and authorization.
2. Input validation.
3. Error response shape.
4. Logging and observability.
5. Backward compatibility.
6. Tests for success, failure, and edge cases.

Report findings by severity. Include file and line references.
```

使用：

```text
请使用 company-api-review skill 审查当前 API 改动。
```

## 7. 实际应用场景

### 7.1 新功能：后台用户搜索

提示：

```text
请使用 brainstorming skill 设计后台用户搜索功能。
要求：
- 支持按姓名、邮箱、状态搜索
- 前端 React + TypeScript
- 后端已有 /api/users
- 需要 URL query 同步
- 需要测试
先不要写代码。
```

后续：

```text
请使用 writing-plans skill 生成实现计划。
```

```text
请使用 test-driven-development skill 执行第 1 个任务。
```

### 7.2 Bug 修复：表单提交两次

提示：

```text
请使用 systematic-debugging skill 调查表单提交两次的问题。
复现：
1. 输入合法数据
2. 快速双击提交按钮
实际：后端收到两个请求
期望：只提交一次
请先定位根因，并提出最小修复方案。
```

可能输出：

```text
根因：提交按钮没有 pending 状态保护。
修复：提交开始后禁用按钮，并在 finally 恢复。
测试：模拟连续点击，断言 API 只调用一次。
```

### 7.3 重构：拆分巨型组件

提示：

```text
请使用 brainstorming skill，设计如何重构 OrderPage.tsx。
目标：
- 拆出筛选栏、表格、分页、状态标签
- 不改变现有行为
- 保留现有测试
- 每一步都可独立验证
```

然后：

```text
请使用 writing-plans skill，把重构拆成小步骤。每一步必须说明如何验证没有行为变化。
```

### 7.4 代码审查：合并前检查

提示：

```text
请使用 requesting-code-review skill 审查当前分支。
重点：
- 是否符合设计文档
- 是否有未覆盖边界情况
- 是否引入竞态条件
- 是否有不必要依赖
- 测试是否足够
```

### 7.5 项目收尾

提示：

```text
请使用 finishing-a-development-branch skill 收尾当前功能。
请运行测试、构建，汇总改动，列出风险，并给出下一步选项。
```

## 8. 与openspec结合

openspec 负责的是做什么？

superpowers 负责的是如何做？

```
请严格按照 Superpowers 规范 开始执行开发。

目标是完成 `xxx/specs/tasks.md`
```

所以一般是让openspec去完善需求，让superpowers去执行

### 主要使用了superpowers哪些功能？

子智能体驱动开发
 -  主智能体理解完需求之后，它不会亲自下场写代码
 -  会调用子智能体去完成需求


测试驱动开发
 - superpowers 会先实现一个失败的测试用例，再实现一个恰好通过的测试用例

微型计划与任务追踪

Git 工作树隔离

系统化调试

## 9. 一页速查

### 9.1 安装验证

```text
Tell me about your superpowers.
```

### 9.2 新功能

```text
请使用 brainstorming skill 设计这个功能。先不要写代码。
```

```text
请使用 writing-plans skill，把设计转成 TDD 实现计划。
```

```text
请使用 test-driven-development skill 执行计划第 1 个任务。
```

### 9.3 Debug

```text
请使用 systematic-debugging skill 调查这个问题。先复现，再定位根因，不要直接猜修。
```

### 9.4 Review

```text
请使用 requesting-code-review skill 审查当前改动。
```

```text
请使用 receiving-code-review skill 处理这些 review 反馈。
```

### 9.5 完成前验证

```text
请使用 verification-before-completion skill，运行必要测试和手动检查，确认真的完成。
```
