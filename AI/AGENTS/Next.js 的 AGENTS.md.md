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

（下一部分继续：**PR 状态分析技巧、GitHub Pull Requests、Issue、核心目录、开发技巧**）