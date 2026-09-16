# package.json

运行 `npm init` 命令生成 `package.json`

`dependencies` 可以理解为生成环境依赖；`devDependencies` 可以理解为开发环境的依赖

`npm config list` 命令可以查看 `npm` 的配置项，包括源、代理、位置

# npm install 原理

## 运行 npm install 发生了什么？

安装依赖，默认采用**扁平化的安装方式**。

依赖的排序顺序：`.` 排在最前面，随后是 `@` 系列，再之后才是按首字母排序。