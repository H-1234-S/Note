# 基础知识

## 安装包

``` shell
pnpm add drizzle-orm@rc pg dotenv @nestjs/drizzle @nestjs/config
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

## 注册数据库

``` ts
import { Module } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
	    isGlobal: true,
    }),
    DrizzleModule.forRoot({
      drizzle,
      connection: process.env.DATABASE_URL!,
    }),
  ],
})
export class AppModule {}
```

## 使用

模块被注册后，可以使用 `@InjectDrizzle()` 装饰器在项目的任何地方注入数据库功能，而无需导入任何其他模块。

``` ts
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AppService {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase,
  ) {}
}
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