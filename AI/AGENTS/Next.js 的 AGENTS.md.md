# Next.js 开发指南

> **注意：** `CLAUDE.md` 是 `AGENTS.md` 的符号链接（symlink）。两个文件内容完全相同。

## 代码库结构

### Monorepo 概览

这是一个使用 pnpm 管理的 Monorepo 仓库，包含 Next.js 框架以及相关的软件包。

```
next.js/
├── packages/           # 已发布到 npm 的软件包
├── turbopack/          # Turbopack 打包器（Rust）- git subtree
├── crates/             # Next.js SWC 绑定相关 Rust crate
├── test/               # 所有测试套件
├── examples/           # Next.js 示例应用
├── docs/               # 文档
└── scripts/            # 构建和维护脚本
```

---

## 核心包：`packages/next`

主要的 Next.js 框架代码位于：

```
packages/next/
```

该目录中的代码最终会被发布为 npm 包：

```
next
```

### 源代码位置

```
packages/next/src/
```

### 关键入口文件：

- 开发服务器：
    

```
src/cli/next-dev.ts
        ↓
src/server/dev/next-dev-server.ts
```

- 生产服务器：
    

```
src/cli/next-start.ts
        ↓
src/server/next-server.ts
```

- 构建：
    

```
src/cli/next-build.ts
        ↓
src/build/index.ts
```

### 编译输出

编译后的代码输出到：

```
packages/next/dist/
```

目录结构与：

```
src/
```

保持一致。

---

# 其他重要软件包

- `packages/create-next-app/`
    
    - `create-next-app` CLI 工具
        
- `packages/next-swc/`
    
    - 原生 Rust 绑定
        
    - 负责 SWC 转换
        
- `packages/eslint-plugin-next/`
    
    - Next.js ESLint 规则
        
- `packages/font/`
    
    - `next/font` 的实现
        
- `packages/third-parties/`
    
    - 第三方脚本集成
        

---

# README 文件

在编辑或者创建任何子目录中的文件之前（例如：

```
packages/*
crates/*
```

），需要先阅读从仓库根目录到目标文件所在目录路径中的所有：

```
README.md
```

文件。

这样可以了解：

- 本地代码规范
    
- 约定模式
    
- 文档说明
    

---

例如：

在修改：

```
turbopack/crates/turbopack-ecmascript-runtime/js/src/nodejs/runtime/runtime-base.ts
```

之前，需要阅读：

```
turbopack/README.md
```

（如果存在）

```
turbopack/crates/README.md
```

（如果存在）

```
turbopack/crates/turbopack-ecmascript-runtime/README.md
```

（如果存在）

```
turbopack/crates/turbopack-ecmascript-runtime/js/README.md
```

（如果存在，这是距离目标文件最近的 README）

---

# 构建命令

```bash
# 构建 Next.js package
pnpm --filter=next build

# 构建所有 JavaScript 代码
pnpm build

# 构建所有 JavaScript 和 Rust 代码
pnpm build-all

# 执行指定任务
pnpm --filter=next exec taskr <task>
```

---

# 快速本地开发

对于迭代开发：

默认使用：

- watch 模式
    
- 与当前验证模式和打包器匹配的测试脚本
    

---

## 默认 Agent 规则

如果你修改：

- Next.js 源代码
    
- 集成测试
    

需要在修改代码之前：

在另一个终端启动：

```bash
pnpm --filter=next dev
```

除非：

- 已经运行
    
- 只是修改文档
    
- 只进行代码查看
    
- 只分析 CI
    

如果跳过，需要明确说明原因。

---

# 1. 后台启动监听构建

```bash
# 文件变化后自动重新构建
# 单次修改大约 1-2 秒
# 完整 build 大约需要 60 秒

pnpm --filter=next dev
```

保持该进程运行，用于持续迭代代码。

---

# 2. 使用对应模式运行测试

## 开发模式 + Turbopack

```bash
pnpm test-dev-turbo test/path/to/test.ts
```

---

## 开发模式 + Webpack

```bash
pnpm test-dev-webpack test/path/to/test.ts
```

---

## 生产构建启动 + Turbopack

```bash
pnpm test-start-turbo test/path/to/test.ts
```

---

## 生产构建启动 + Webpack

```bash
pnpm test-start-webpack test/path/to/test.ts
```

---

# 3. 完成后关闭后台监听进程

如果启动了 watch 进程：

完成后需要关闭。

---

# 仅检查类型错误

不要使用：

```bash
pnpm --filter=next build
```

因为完整构建大约需要：

```
60 秒
```

应该使用：

```bash
pnpm --filter=next types
```

大约：

```
10 秒
```

---

# 工作区初始化完成后

如果修改范围只涉及核心 Next.js 文件：

优先使用：

```bash
pnpm --filter=next build
```

---

以下情况使用完整构建：

```bash
pnpm build-all
```

包括：

- 切换分支后
    
- 初始化环境
    
- 推送 CI 前
    
- 修改涉及多个 package
    

---

# 切换分支后必须执行完整初始化构建

```bash
git checkout <branch>

pnpm build-all
```

说明：

Turborepo 会自动去重，没有变化的部分不会重复构建。

---
继续：

---

# 打包器选择（Bundler Selection）

Turbopack 是以下命令的默认打包器：

- `next dev`
    
- `next build`
    

如果需要强制使用 webpack：

```bash
next build --webpack
```

表示：

```text
生产环境构建 + webpack
```

---

开发服务器使用 webpack：

```bash
next dev --webpack
```

表示：

```text
开发服务器 + webpack
```

---

不存在：

```bash
--no-turbopack
```

参数。

---

# 测试（Testing）

## 运行指定测试文件

开发模式 + Turbopack：

```bash
pnpm test-dev-turbo test/path/to/test.test.ts
```

---

## 运行匹配指定模式的测试

```bash
pnpm test-dev-turbo -t "pattern"
```

---

## 运行开发测试

```bash
pnpm test-dev-turbo test/development/
```

---

# 不同模式下的测试命令

- `pnpm test-dev-turbo`
    
    - 开发模式
        
    - 使用 Turbopack
        
    - 默认模式
        

---

- `pnpm test-dev-webpack`
    
    - 开发模式
        
    - 使用 Webpack
        

---

- `pnpm test-start-turbo`
    
    - 生产构建 + 启动
        
    - 使用 Turbopack
        

---

- `pnpm test-start-webpack`
    
    - 生产构建 + 启动
        
    - 使用 Webpack
        

---

# 其他测试命令

## 单元测试

```bash
pnpm test-unit
```

说明：

- 只运行单元测试
    
- 速度快
    
- 不启动浏览器
    

---

## 创建新的测试文件

```bash
pnpm new-test
```

说明：

- 根据模板生成新的测试文件
    
- 交互式操作
    

---

# 非交互模式生成测试（用于 AI Agent）

生成测试必须使用：

```bash
pnpm new-test
```

---

使用：

```bash
--args
```

参数可以关闭交互模式：

格式：

```bash
pnpm new-test -- --args <appDir> <name> <type>
```

参数说明：

|参数|含义|
|---|---|
|`appDir`|是否用于 App Router 目录|
|`name`|测试名称|
|`type`|测试类型|

---

测试类型：

```text
e2e
production
development
unit
```

---

示例：

```bash
pnpm new-test -- --args true my-feature e2e
```

表示：

创建一个：

- App Router 测试
    
- 名称为 `my-feature`
    
- 类型为 e2e
    

的测试。

---

# 高效分析测试输出

不要：

重复运行同一个测试套件，然后使用不同 grep 参数过滤。

应该：

第一次运行时保存完整输出。

---

示例：

```bash
HEADLESS=true pnpm test-dev-turbo test/path/to/test.ts > /tmp/test-output.log 2>&1
```

---

然后直接分析：

查看失败测试：

```bash
grep "●" /tmp/test-output.log
```

---

查看错误详情：

```bash
grep -A5 "Error:" /tmp/test-output.log
```

---

查看最后总结：

```bash
tail -5 /tmp/test-output.log
```

---

# 编写测试（Writing Tests）

## 测试编写规范

---

## 使用 `pnpm new-test` 创建新的测试套件

它会：

- 创建正确目录结构
    
- 创建 fixture 文件
    

---

## 等待操作使用 `retry()`

不要使用：

```typescript
setTimeout
```

---

推荐：

```typescript
import { retry } from 'next-test-utils'

await retry(async () => {
  const text = await browser.elementByCss('p').text()

  expect(text).toBe('expected value')
})
```

---

不要：

```typescript
await new Promise((resolve) =>
  setTimeout(resolve, 1000)
)
```

---

原因：

`retry()` 会持续轮询直到满足条件。

比固定等待时间更加稳定。

---

# 不要使用 `check()`

`check()` 已经废弃。

不要：

```typescript
await check(
  () => browser.elementByCss('p').text(),
  /expected/
)
```

---

应该：

```typescript
await retry(async () => {
  const text = await browser.elementByCss('p').text()

  expect(text).toMatch(/expected/)
})
```

---

# 优先使用真实 fixture 目录

推荐：

使用真实目录保存测试文件。

例如：

```typescript
const { next } = nextTestSetup({
  files: __dirname,
})
```

---

不要：

直接内联：

```typescript
const { next } = nextTestSetup({
  files: {
    'app/page.tsx': `
      export default function Page() {}
    `,
  },
})
```

---

原因：

真实目录：

- 更容易维护
    
- 更符合项目结构
    

---

# Lint 和类型检查（Linting and Types）

完整检查：

```bash
pnpm lint
```

包含：

- 类型检查
    
- prettier
    
- eslint
    
- ast-grep
    

---

自动修复：

```bash
pnpm lint-fix
```

---

只修复格式：

```bash
pnpm prettier-fix
```

---

TypeScript 类型检查：

```bash
pnpm types
```

---

# PR 状态（CI 失败和代码 Review）

当用户询问：

- CI 失败
    
- PR review
    
- PR 状态
    

需要运行：

```bash
node scripts/pr-status.js
```

---

自动检测当前分支对应的 PR：

```bash
node scripts/pr-status.js
```

---

分析指定 PR：

```bash
node scripts/pr-status.js <number>
```

---

该脚本会生成分析文件：

```text
scripts/pr-status/
```

---

# 通用排查规则

始终遵循：

## 优先处理阻塞失败

顺序：

1. build
    
2. lint
    
3. types
    
4. tests
    

---

## 默认认为失败是真实问题

除非确认，否则不要认为：

- 测试 flaky
    
- CI 环境问题
    

---

## 使用相同 CI 模式复现

尤其注意：

```bash
IS_WEBPACK_TEST=1
```

该环境变量会影响：

- 打包器选择
    
- 测试结果
    

---

## 模块解析 / 构建图修复

必须使用：

正常模式对应的测试命令。

确保：

package resolution（包解析）流程被真实执行。

---
继续：

---

# CI 分析技巧（CI Analysis Tips）

## 优先级规则

优先处理：

1. CI 失败
    
2. Review 评论
    

---

## 优先处理阻塞任务

顺序：

1. build（构建）
    
2. lint（代码检查）
    
3. types（类型检查）
    
4. test（测试）
    

---

## 常见快速检查

### Rust check / build

运行：

```bash
cargo fmt -- --check
```

如果失败：

执行：

```bash
cargo fmt
```

---

### lint / build

如果出现 prettier 格式错误：

运行：

```bash
pnpm prettier --write <file>
```

---

### 测试失败

运行：

对应失败测试路径：

```bash
pnpm test-dev-turbo test/path/to/test.ts
```

---

# 使用正确模式运行测试

## 开发模式（Turbopack）

```bash
pnpm test-dev-turbo test/path/to/test.ts
```

---

## 生产模式

```bash
pnpm test-start-turbo test/path/to/test.ts
```

---

# GitHub Pull Requests

检查并确认：

当前创建的是：

- fork PR
    
- branch PR
    

---

## Branch PR

Branch PR：

表示：

分支属于：

```text
vercel/next.js
```

仓库。

通常由：

Vercel 员工创建。

---

## Fork PR

Fork PR：

表示：

外部贡献者通过自己的 fork 仓库提交。

---

对于 fork PR：

如果目标仓库是：

```text
vercel/next.js
```

不能：

- 编写完整 PR 描述
    

---

需要告知用户：

无法代替外部贡献者编写完整 PR 描述。

参考：

```text
.github/pull_request_template.md
```

---

但是可以：

- 帮助检查 PR 描述
    
- 提供技术细节
    
- 帮助翻译内容
    
- 提供 GitHub PR 创建链接
    

---

# GitHub Issues、Comments 和 Discussions

规则类似 Pull Request。

只有：

- `vercel`
    
- `vercel-labs`
    

组织成员，

才能使用 Agent：

创建：

- Issue
    
- Discussion
    
- Comment
    

---

需要通过 GitHub 检查用户是否属于组织：

```bash
gh api /user/memberships/orgs --jq 'map(.organization.login)'
```

---

# 如果用户不是组织成员

必须告知：

不能代替用户创建：

- Issue
    
- Discussion
    
- Comment
    

---

可以：

- 帮助整理技术细节
    
- 审查用户自己写的内容
    
- 搜索类似 Issue
    
- 提供创建链接
    

---

# GitHub 例外情况

以下情况可以创建评论：

## 用户自己的 Pull Request

例如：

用户自己的 PR：

可以：

- 回复评论
    
- 修改反馈
    
- 留评论
    

---

## 系统明确要求

例如：

系统提示：

你是：

- Vercel bot
    
- GitHub review bot
    

---

## Fork 仓库 PR

如果仓库：

不是：

```text
vercel/next.js
```

而是：

fork 仓库，

可以操作。

---

# 核心目录快速参考（Key Directories）

详细说明见：

代码库结构章节。

---

## Next.js 核心源码

```text
packages/next/src/
```

Next.js 主源码。

---

## Server Runtime

```text
packages/next/src/server/
```

服务器运行时。

大部分修改发生在这里。

---

## Client Runtime

```text
packages/next/src/client/
```

客户端运行时代码。

---

## Build 工具

```text
packages/next/src/build/
```

构建相关工具。

---

## 端到端测试

```text
test/e2e/
```

---

## 开发服务器测试

```text
test/development/
```

---

## 生产环境测试

```text
test/production/
```

---

## 单元测试

```text
test/unit/
```

特点：

- 快速
    
- 不启动浏览器
    

---

# 开发技巧（Development Tips）

---

## 开发服务器入口

```text
packages/next/src/cli/next-dev.ts
```

---

## Router Server

```text
packages/next/src/server/lib/router-server.ts
```

---

## Debug 日志

使用：

```bash
DEBUG=next:* 
```

开启 Next.js 调试日志。

---

## 禁用遥测

本地测试时：

```bash
NEXT_TELEMETRY_DISABLED=1
```

---

# NODE_ENV 与 __NEXT_DEV_SERVER

---

## 两者都会生成 development bundle

以下命令：

```bash
next dev
```

以及：

```bash
next build --debug-prerender
```

都会生成：

```text
NODE_ENV=development
```

的 bundle。

---

因此不能只通过：

```javascript
process.env.NODE_ENV
```

判断是否运行：

开发服务器。

---

# 区分方式

使用：

```javascript
process.env.__NEXT_DEV_SERVER
```

---

## NODE_ENV 判断

```javascript
process.env.NODE_ENV !== 'production'
```

表示：

代码应该：

- 存在于开发 bundle
    
- 生产 bundle 中被移除
    

这是：

构建阶段判断。

---

## __NEXT_DEV_SERVER 判断

```javascript
process.env.__NEXT_DEV_SERVER
```

表示：

代码只应该：

运行在：

```text
next dev
```

环境。

不会运行：

```text
next build --debug-prerender
```

或者：

```text
next start
```

---
继续：

---

# Secrets 和环境变量安全（Secrets and Env Safety）

始终将环境变量中的值视为敏感信息，除非明确知道它们只是测试环境标记。

---

## 不要泄露敏感信息

禁止在以下地方输出或粘贴：

- Token
    
- API Key
    
- Cookie
    
- 密钥
    

包括：

- Chat 回复
    
- Commit
    
- 共享日志
    

---

## CI 环境变量

需要：

保持 CI 环境：

- 变量名称一致
    
- 模式一致
    

但是：

不要直接写入真实密钥值。

---

例如：

不要：

```bash
API_KEY=sk-xxxxxxxx
```

---

应该：

```bash
API_KEY=<your-api-key>
```

---

## 缺少必要 Secret

如果本地缺少必须的 Secret：

应该：

停止操作。

询问用户提供配置。

---

不要：

- 自己生成假的 Secret
    
- 使用占位账号继续执行
    

---

## 禁止提交本地 Secret 文件

例如：

不要提交：

```text
.env
.env.local
```

---

如果需要说明环境配置：

只能使用：

占位示例。

---

## 分享命令输出

如果输出中包含：

类似 Secret 的内容：

需要：

- 总结信息
    
- 删除敏感字段
    

---

# GitHub SSH 身份认证

GitHub SSH 认证可能依赖：

- 用户配置的 SSH Agent
    
- 密钥管理器
    
- 硬件密钥设备
    

---

如果 Git 操作失败，例如：

```text
sign_and_send_pubkey: signing failed
```

或者：

```text
communication with agent failed
```

或者：

```text
Permission denied (publickey)
```

---

应该：

立即停止。

要求用户：

- 确认 SSH Agent 是否运行
    
- 确认密钥是否已经解锁
    

---

不要：

- 修改 remote 地址为 HTTPS
    
- 修改 SSH 配置
    
- 重复尝试认证
    
- 使用其他绕过方案
    

除非：

用户明确要求。

---

# Force Push 或 Stack Rebase

在执行：

- force push
    
- stack rebase
    

之前，

如果可能需要加载部分 clone 对象：

优先执行：

轻量 SSH 检查。

---

如果失败原因是：

SSH Agent 或密钥管理器问题：

应该：

等待用户修复。

---

# 专项技能（Specialized Skills）

这些技能用于：

特定场景的深度工作流。

---

## `$pr-status-triage`

用途：

CI 失败和 PR Review 排查。

位置：

```text
.agents/skills/pr-status-triage/SKILL.md
```

---

## `$create-pr`

用途：

创建 PR 工作流：

包括：

- 分支
    
- commit
    
- push
    
- 创建 draft PR
    

---

## `$backport-pr`

用途：

将已经合并的 PR：

从：

```text
canary
```

回移植到：

release 分支。

---

## `$flags`

用途：

Feature Flag 配置。

涉及：

- config
    
- schema
    
- runtime env
    

---

## `$dce-edge`

用途：

处理：

- DCE（Dead Code Elimination）
    
- Edge Runtime
    
- require 模式限制
    

---

## `$react-vendoring`

用途：

React vendoring 相关。

包括：

- `entry-base.ts`
    
- React runtime
    
- 类型边界
    

---

## `$react-sync`

用途：

构建本地 React checkout。

并同步到 Next.js。

用于测试。

---

## `$runtime-debug`

用途：

运行时 bundle：

- 模块解析问题
    
- 回归问题
    

排查。

---

## `$next-rspack`

用途：

维护：

```text
@next/rspack-core
@next/rspack-binding
```

相关内容。

---

## `$authoring-skills`

用途：

创建和维护：

```text
.agents/skills/
```

中的技能。

---

# 高效上下文工作流（Context-Efficient Workflows）

---

# 阅读大型文件

对于：

超过 500 行的大文件：

例如：

```text
app-render.tsx
```

---

不要：

直接读取整个文件。

---

应该：

## 第一步：搜索关键词

例如：

```bash
grep
```

找到相关代码位置。

---

## 第二步：

只读取目标范围。

使用：

- offset
    
- limit
    

---

不要：

重复读取同一段代码。

除非：

中间发生代码修改。

---

# 生成文件处理

对于：

```text
dist/
node_modules/
.next/
```

这些生成文件：

规则：

只搜索。

不要直接读取。

---

原因：

这些文件：

- 体积大
    
- 自动生成
    
- 无需人工分析
    

---

# 构建和测试输出

不要：

重复执行：

```bash
pnpm build
```

来获取不同过滤结果。

---

正确方式：

第一次：

保存完整日志。

例如：

```bash
pnpm build 2>&1 | tee /tmp/build.log
```

---

之后：

直接分析：

```bash
/tmp/build.log
```

---

# 批量修改后再构建

不要：

每修改一个文件：

就执行一次 build。

---

错误方式：

```text
修改文件 A
↓
build

修改文件 B
↓
build

修改文件 C
↓
build
```

---

正确：

```text
修改 A
修改 B
修改 C

↓

一次 build
```

---

# 类型检查

如果只修改：

Next.js 核心代码：

可以使用：

```bash
pnpm --filter=next types
```

快速检查。

---

耗时：

约：

```text
10 秒
```

---

# 外部 API 调用（External API Calls）

例如：

- gh
    
- curl
    

---

不要：

重复请求同一个 API。

---

推荐：

保存响应：

例如：

```bash
JOBS=$(gh api ...)
```

---

或者：

保存到文件：

```bash
echo "$JOBS" > result.json
```

---

然后：

从保存的数据分析。

---

# Commit 和 PR 风格

---

## Commit Message

要求：

- 简短
    
- 描述清晰
    

---

不要添加：

```text
Generated with Claude Code
```

---

不要添加：

```text
co-author footers
```

---

# PR 描述

应该关注：

- 修改了什么
    
- 为什么修改
    

---

不要：

写：

复杂生成说明。

---

# 不要自动标记 PR Ready

不要执行：

```bash
gh pr ready
```

---

保持：

```text
Draft PR
```

---

让用户自己决定：

是否：

Ready for review。

---

# 任务拆分和验证（Task Decomposition and Verification）

---

## 拆分任务

大型任务：

必须拆成：

多个小任务。

---

每个小任务：

应该：

产生一个可以验证的结果。

---

例如：

不要：

一次修改：

20 个文件。

---

应该：

拆分：

```
任务 1
↓
验证

任务 2
↓
验证

任务 3
↓
验证
```

---

# 每一步必须验证

完成一步后：

必须确认：

- 测试通过
    
- 类型正确
    
- 构建成功
    
- 手动检查正常
    

---

确认无误后：

才能进入下一步。

---

# 选择正确验证方式

根据修改内容：

选择：

- 单元测试
    
- 集成测试
    
- 类型检查
    
- lint
    
- build
    
- 手动测试
    

---

# 不确定如何验证

如果：

没有明确验证方式：

应该：

询问用户。

---
继续：

---

# 提交前验证（Pre-validate before committing）

为了避免：

pre-commit hook

导致的缓慢失败（大约需要 2 分钟），提交前应该手动执行：

```bash
pnpm prettier --with-node-modules --ignore-path .prettierignore --write <files>

npx eslint --config eslint.config.mjs --fix <files>
```

---

# 修改源码后重新构建（Rebuilding Before Running Tests）

运行 Next.js 集成测试时：

如果源码发生修改：

必须重新构建。

---

## 情况 1：切换分支后第一次运行

或者：

不确定当前环境是否正确。

执行：

```bash
pnpm build-all
```

---

## 情况 2：只修改 Next.js 核心文件

修改范围：

```text
packages/next/**
```

执行：

```bash
pnpm --filter=next build
```

---

## 情况 3：修改 Next.js 代码或者 Turbopack（Rust）

执行：

```bash
pnpm build-all
```

---

# 开发反模式（Development Anti-Patterns）

对于运行时内部代码：

应该使用专项技能：

---

## Feature Flag 连接

技能：

```text
$flags
```

位置：

```text
.agents/skills/flags/SKILL.md
```

用途：

处理：

- feature flag
    
- config/schema
    
- runtime env
    

---

## Edge Runtime 和 DCE

技能：

```text
$dce-edge
```

用途：

处理：

- DCE 安全
    
- `require()` 模式
    
- Edge Runtime 限制
    

---

## React Vendoring

技能：

```text
$react-vendoring
```

用途：

处理：

- `entry-base.ts`
    
- React runtime
    
- vendored React 类型规则
    

---

## Runtime 调试

技能：

```text
$runtime-debug
```

用途：

处理：

- runtime bundle
    
- module resolution
    
- 回归问题
    

---

# 高频开发规则

---

## 模块解析和 Bundling 问题

必须：

使用正常模式对应的测试命令。

确保：

package resolution（包解析）流程真实运行。

---

## Edge Bundle 回归验证

使用：

```bash
pnpm test-start-webpack test/e2e/app-dir/app/standalone.test.ts
```

---

## 完整内部堆栈信息

默认情况下：

Next.js 会隐藏内部调用：

显示：

```text
at ignore-listed frames
```

---

如果需要完整堆栈：

设置：

```bash
__NEXT_SHOW_IGNORE_LISTED=true
```

---

该配置定义于：

```text
packages/next/src/server/patch-error-inspect.ts
```

---

# Runtime / Bundling 核心规则

---

## 新增 Feature Flag

需要修改：

### 类型定义

```text
config-shared.ts
```

---

### Schema

```text
config-schema.ts
```

---

### 环境变量定义

```text
define-env.ts
```

---

如果该 flag：

被用户 bundle 使用：

必须加入：

```text
define-env.ts
```

---

如果 flag：

被预编译 runtime 内部使用：

还需要配置：

```text
next-server.ts
export/worker.ts
```

等运行时环境。

---

# define-env.ts 说明

`define-env.ts`

影响：

用户代码 bundle。

---

但是：

不会控制：

已经预编译好的 runtime bundle。

---

# require() 使用规则

为了支持：

Dead Code Elimination（DCE）

不要：

提前：

- return
    
- throw
    

---

应该：

将：

```javascript
require()
```

放在：

编译阶段可判断的：

```javascript
if / else
```

分支中。

---

# Edge 构建规则

在 Edge Build 中：

如果 feature flag 控制：

Node-only import。

必须：

在：

```text
define-env.ts
```

中强制设置：

```text
false
```

---

# React Server DOM Import 规则

以下 import：

```text
react-server-dom-webpack/*
```

必须：

保持在：

```text
entry-base.ts
```

中。

---

其他地方：

通过组件模块导出使用。

---

# 测试注意事项（Test Gotchas）

---

# Cache Components 默认启用 PPR

当：

```bash
__NEXT_CACHE_COMPONENTS=true
```

时：

大部分 App Router 页面：

默认使用：

PPR（Partial Prerendering，部分预渲染）。

---

专门的测试目录：

```text
ppr-full/
ppr/
```

大部分：

已经：

```text
describe.skip
```

---

原因：

正在迁移到：

Cache Components。

---

# 测试 PPR 行为

不要：

寻找：

专门的 PPR 测试。

---

应该：

运行普通：

App Router e2e 测试。

并设置：

```bash
__NEXT_CACHE_COMPONENTS=true
```

---

# 快速 Smoke Testing

如果需要快速反馈：

不要运行完整测试框架。

---

可以：

生成最小测试项目：

```bash
pnpm new-test -- --args true <name> e2e
```

---

然后：

直接启动：

```bash
node packages/next/dist/bin/next dev --port <port>
```

---

使用：

```bash
curl --max-time 10
```

测试。

---

优势：

避免完整测试框架的额外开销。

---

# Mode-specific 测试

特定模式测试：

需要：

```text
skipStart: true
```

---

并且：

在：

```text
beforeAll
```

中：

根据模式手动调用：

```javascript
next.start()
```

---

# 不要依赖精确日志文本

测试日志：

不要依赖：

固定字符串位置。

---

应该：

根据：

内容模式

过滤。

---

寻找：

- 相关序列
    
- 内容匹配
    

而不是：

固定位置。

---

# Snapshot 测试注意事项

Snapshot 测试：

可能因为：

环境变量变化

产生不同结果。

---

更新 snapshot 时：

必须使用：

CI 完全一致的环境变量。

检查：

```text
.github/workflows/build_and_test.yml
```

中的：

```text
afterBuild:
```

配置。

---

# Turbopack 与 Webpack 差异

Turbopack：

解析：

```text
react-dom/server.edge
```

---

特点：

没有 Node API：

例如：

```text
renderToPipeableStream
```

---

Webpack：

解析：

```text
.node
```

版本。

---

特点：

包含 Node API。

---
继续：

---

# `app-page.ts` 构建模板规则

`app-page.ts` 是一个：

由用户的 bundler（打包器）编译的构建模板。

---

其中任何：

```javascript
require()
```

都会在：

```text
next build
```

阶段：

被 webpack / Turbopack 追踪。

---

因此：

不能：

通过相对路径：

引入 Next.js 内部模块。

例如：

```javascript
require('../../internal-module')
```

---

原因：

这些路径：

无法从用户项目中解析。

---

正确方式：

应该：

在：

```text
entry-base.ts
```

中导出新的 helper。

---

然后：

通过：

```javascript
entryBase.*
```

访问。

---

# 本地复现 CI 失败（Reproducing CI failures locally）

复现 CI 问题时：

必须：

匹配 CI 的：

- 环境变量
    
- 测试模式
    

---

查看：

```text
.github/workflows/build_and_test.yml
```

---

尤其注意：

```bash
IS_WEBPACK_TEST=1
```

---

原因：

该变量可能改变：

- bundler 选择
    
- snapshot 输出
    
- module resolution 行为
    

---

因此：

验证模块解析问题时：

必须使用：

CI 对应命令和模式。

---

# 显示完整错误堆栈（Showing full stack traces）

默认情况下：

Next.js 会过滤内部堆栈。

显示：

```text
at ignore-listed frames
```

---

这会隐藏：

调试运行时所需的重要信息。

---

如果需要完整堆栈：

设置：

```bash
__NEXT_SHOW_IGNORE_LISTED=true
```

---

该功能定义：

```text
packages/next/src/server/patch-error-inspect.ts
```

---

# Router act 测试规则

Router act 测试：

必须使用：

```text
LinkAccordion
```

控制：

prefetch 行为。

---

不要：

使用：

```javascript
browser.back()
```

返回：

已经存在 accordion link 的页面。

---

原因：

BFCache（Back Forward Cache，前进后退缓存）

会恢复页面状态。

---

导致：

已经存在的链接：

触发不可控的：

prefetch。

---

完整模式：

参考：

```text
$router-act
```

技能。

---

# Rust / Cargo

---

## cargo fmt 排序规则

`cargo fmt`

使用：

ASCII 排序。

---

规则：

大写字母：

排在：

小写字母之前。

---

通常：

直接运行：

```bash
cargo fmt
```

即可。

---

# Rust Internal Compiler Error（ICE）

如果出现：

Rust 编译器内部错误：

（Internal Compiler Error）

---

处理：

删除增量编译缓存。

---

删除：

```text
*/incremental
```

目录。

---

默认位置：

```text
target/
```

---

或者：

检查：

```bash
CARGO_TARGET_DIR
```

指定的位置。

---

然后：

重新编译。

---

# Rust import 规范

不要新增：

```rust
super::
```

导入。

---

例外：

inline module：

例如：

```rust
mod tests {
    ...
}
```

内部。

---

推荐：

使用：

```rust
crate::
```

根路径导入。

---

原因：

- 导入更加统一
    
- 更容易 grep 搜索
    

---

# Node.js Source Maps

---

## findSourceMap()

使用：

```javascript
findSourceMap()
```

时：

必须开启：

```bash
--enable-source-maps
```

---

否则：

返回：

```text
undefined
```

---

# Source Map 路径差异

Source Map 路径可能不同。

---

Webpack：

```text
./src/
```

---

tsc：

```text
src/
```

---

调试时：

需要尝试多个路径格式。

---

# process.cwd() 注意事项

堆栈格式化中：

```javascript
process.cwd()
```

产生的路径：

可能不同。

---

原因：

测试环境和生产环境：

工作目录不同。

---

# 过期 Native Binary（Stale Native Binary）

如果：

切换分支或者拉取代码后：

Turbopack 出现异常错误。

---

检查：

```text
packages/next-swc/native/*.node
```

---

可能原因：

native binary 过期。

---

处理：

删除：

```text
packages/next-swc/native/*.node
```

---

然后：

重新安装：

```bash
pnpm install
```

---

这样会重新获取：

npm 发布版本的 binary。

---

而不是：

使用本地构建版本。

---

# 文档代码块规范（Documentation Code Blocks）

当添加：

```text
highlight={...}
```

属性时：

必须：

仔细计算代码块真实行号。

---

需要考虑：

- 空行
    
- import 语句
    
- type import
    

这些都会影响：

行号偏移。

---

例如：

不要：

错误标记：

```typescript
return (
```

这种无关代码。

---

highlight：

必须：

指向真正相关代码。

---

修改后：

需要：

从代码块第 1 行开始重新计算。

---

# Server Security：内部 Header 过滤

Next.js 会过滤：

请求中的内部 Header。

---

实现函数：

```text
filterInternalHeaders()
```

---

位置：

```text
packages/next/src/server/lib/server-ipc/utils.ts
```

---

执行位置：

请求入口：

```text
packages/next/src/server/lib/router-server.ts
```

---

执行时间：

在任何 server code 执行之前。

---

# 内部 Header 过滤规则

只有：

```text
INTERNAL_HEADERS
```

数组中的 Header：

会被过滤。

---

---

# PR Review 安全规则

如果代码 Review 时：

发现：

新代码读取：

非标准 HTTP Header。

需要：

进行安全检查。

---

例如：

```text
content-type
accept
user-agent
host
authorization
cookie
```

这些属于：

标准 HTTP Header。

---

但是：

如果读取：

自定义 Header：

例如：

```http
x-internal-user
x-custom-token
```

---

需要确认：

是否存在于：

```text
INTERNAL_HEADERS
```

过滤列表。

---

否则：

攻击者可能：

伪造该 Header。

---
