# Monorepo

`Monorepo` 架构就是将多个项目/应用/包放在同一个 Git 仓库中。

核心价值：**统一管理**

> **用途：** 前后端共享代码

``` ts
// packages/types
export interface User {
  id: string
  name: string
  age: number
}
```

然后：`apps/web` 和 `apps/api` 共享一份代码

## pnpm-workspace.yaml

> pnpm 怎么知道哪些目录属于这个 Monorepo？

``` yaml
packages:
  - "apps/*"
  - "packages/*"
```

> 告诉 pnpm：`apps` 和 `packages` 下面的这些目录，都属于当前 Workspace。

## package.json

为什么每个目录还需要 package.json？

**apps/api/package.json**
``` json
{
  "name": "@novabase/api",
  "dependencies": {
    "@novabase/types": "workspace:*"
  }
}
```

**packages/types/package.json**

``` json
{
  "name": "@novabase/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts"
}
```

本地依赖，是 Workspace 最核心的作用之一。

## workspace:*

依赖的是**当前 Monorepo 中的本地 workspace package**。

而不是去 npm 源下载远程的包。



