# tRPC 入门示例项目

一个简单的 tRPC 入门示例，演示前后端类型安全通信。

## 功能特性

- **Query**: 获取欢迎信息、用户列表、用户详情
- **Mutation**: 创建用户、更新用户、删除用户
- **中间件**: 管理员权限控制
- **类型安全**: 端到端 TypeScript 类型推导

## 项目结构

```
tRPC-demo/
├── src/
│   ├── server/
│   │   ├── index.ts    # 服务端入口、Router 定义
│   │   └── trpc.ts     # tRPC 客户端创建（共享类型）
│   └── client/
│       ├── main.tsx    # React 应用入口
│       ├── trpc.ts     # tRPC React Hooks
│       └── styles.css  # 样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 1. 安装依赖

```bash
cd tRPC-demo
npm install
```

### 2. 启动服务端

```bash
npm run dev
```

服务运行在 `http://localhost:4000`，tRPC 端点为 `/trpc`。

### 3. 启动客户端

```bash
# 新开一个终端
npm run client
```

前端运行在 `http://localhost:3000`。

## API 端点

| 端点 | 类型 | 描述 |
|------|------|------|
| `greeting` | Query | 获取欢迎信息 |
| `getUsers` | Query | 获取所有用户 |
| `getUserById` | Query | 根据 ID 获取用户 |
| `createUser` | Mutation | 创建新用户 |
| `updateUser` | Mutation | 更新用户 |
| `deleteUser` | Mutation | 删除用户 |
| `getSecretData` | Query | 管理员专属（需要权限） |

## 技术栈

- **服务端**: Express + tRPC Server + Zod
- **客户端**: React + tRPC React Query + TanStack Query
- **构建工具**: Vite + TypeScript
