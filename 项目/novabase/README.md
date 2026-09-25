# Monorepo

`Monorepo` 架构就是将多个项目/应用/包放在同一个 Git 仓库中。

> pnpm 怎么知道哪些目录属于这个 Monorepo？
## pnpm-workspace.yaml

``` yaml
packages:
  - "apps/*"
  - "packages/*"
```

