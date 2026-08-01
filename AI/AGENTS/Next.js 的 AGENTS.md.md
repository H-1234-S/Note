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

（未完，下一部分继续从 **Bundler Selection（打包器选择）** 开始）