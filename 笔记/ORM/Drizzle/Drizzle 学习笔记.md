# 基础知识

## 安装包

``` shell
pnpm add drizzle-orm@rc pg dotenv
pnpm add -D drizzle-kit@rc tsx @types/pg
```

## 环境变量

``` text
DATABASE_URL=
```
## 设置配置文件

> `drizzle.config.ts`

``` ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## 命令

``` json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
```

`db:generate`：生成迁移文件；根据编写的 TypeScript Schema 文件，**生成标准的 SQL 迁移文件**，而不会直接改动数据库。

`db:migrate`：应用迁移文件；**将 `generate` 生成的 SQL 迁移文件实际执行到数据库里**。

`db:push`：直接推送模式（仅推荐开发环境）；会**跳过生成 SQL 文件的步骤**，直接将当前的 Schema 与数据库结构进行同步。

`db:studio`：启动可视化数据库管理工具