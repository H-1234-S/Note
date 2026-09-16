# 模块化
## Common.js

### require

引入自己编写的文件

``` js
require('./test.js')
```

引入第三方模块

``` js
const md5 = require('md5')
```

引入 node.js 内置的模块

``` js
const http = require('node:http')
```

引入 c++ 扩展模块

引入 json 文件

``` js
const data = require('./data.json')
```

### module.exports

## ESModule

### import

函数式 `import` 返回的是一个 `Promise`
### export

导出有两种方式，一种是默认导出，一种是普通导出；默认导出可以和普通导出共存，但是一个文件中只能有一个默认导出

## Common.js和ESModule区别

- Cjs是基于运行时的同步加载，esm是基于编译时的异步加载
- Cjs是可以修改值的，esm值并且不可修改（可读的）
- Cjs不可以tree shaking，esm支持tree shaking
- commonjs中顶层的this指向这个模块本身，而ES6中顶层this指向undefined
# 全局变量

在 `browser` 环境下，全局变量可以使用 `var` 定义，会自动挂载到 `window` 下

在 `node` 环境下，全局变量挂载到 `global` 下，任何模块都可以访问到

`globalThis` API 会自动**检测当前的运行环境**，然后**返回对应的全局变量**

# Path API

## basename

`path.basename` 返回给定路径的最后一部分

``` node
const path = require("node:path");

console.log(path.basename("E:\\A\\Note\\AI\\jo.js"));

console.log(path.basename("/a/note/ai/jo.js"));
// all output jo.js
```

在 `windows` 中，默认是使用 `\` 作为分隔符；但是也兼容了 `/` 作为分隔符

> 但是 `posix` 是处理不了 `\`

``` node
const path = require("node:path");

// 在 windows 环境下模拟 posix 处理路径
console.log(path.posix.basename("E:\\A\\Note\\AI\\jo.js"));
// output E:\\A\\Note\\AI\\jo.js
```

## dirname

`path.dirname` 返回除了**最后一部分**的**前面全部内容**；与 `basename` 互补

``` node
const path = require("node:path");

console.log(path.dirname("E:\\A\\Note\\AI\\jo.js"));
```

## extname

`path.extname` 返回带 `.` 的后缀名；例如返回 `.html`

``` node
const path = require("node:path");

console.log(path.extname("E:\\A\\Note\\AI\\jo.js"));
```

> **注意：** 如果没有点返回空值；如果有多个点返回最后一个

## join

`path.join` 用于拼接路径

``` node
const path = require("node:path");

console.log(path.join("/a", "/b", "/c", "../"));
// output \a\b\
```

## resolve

`path.resolve` 用于解析路径

``` node
const path = require("node:path");

// 如果只有相对路径，则返回基于当前工作目录的绝对路径
console.log(path.resolve("./index.html");
// 输入内容同上
console.log(path.resolve(__dirname,"./index.html"));
```

## parse

`path.parse` 将路径解析为一个对象

``` node
const path = require("node:path");

console.log(path.parse("/home/abort/users/jo.js"));
```

> **返回值**

``` js
{
  // 根目录
  root: '/',
  // 文件所在路径
  dir: '/home/abort/users',
  // 文件名 + 后缀名
  base: 'jo.js',
  // 后缀名
  ext: '.js',
  // 文件名
  name: 'jo'
}
```

## format

`path.format` 用于将 `path.parse` 的对象转化为路径

## sep

`path.sep` 是一个变量，**用于跨平台**；根据不同的操作系统返回不同的分隔符

`windows` 返回的是 `\`；`posix` 返回的是 `/`

## posix

`posix（Portable Operating System Interface of UNIX）` 表示**可移植操作系统接口**，也就是定义了一套标准

遵守这套标准的操作系统有(unix,like unix,linux,macOs,windows wsl)

为什么要定义这套标准，比如在Linux系统启动一个进程需要调用 `fork` 函数,在 `windows` 启动一个进程需要调用 `creatprocess` 函数

这样就会有问题，比如我在 `linux` 写好了代码，需要移植到 `windows` 发现函数不统一，`posix` 标准的出现就是为了解决这个问题。

> **注意**

在 Windows 系统中，路径使用反斜杠（`\`）作为路径分隔符；这与 POSIX 系统使用的正斜杠（`/`）是不同的。