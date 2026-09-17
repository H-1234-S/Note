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

# path api

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

# os api

## platform

`os.platform` 返回当前编译 `node` 时的平台

值为 `aix`、`darwin`、`freebsd`、`linux`、`openbsd`、`sunos`、以及 `win32`

> 示例：根据不同的操作系统运行 shell 命令打开浏览器

``` node
// exec 用于执行 shell 命令
const { exec } = require('child_process'); 
const os = require('os');

const platform = os.platform();

const open = (url) => {
  if (platform === "win32") {
    exec(`start ${url}`);
  } else if (platform === "darwin") {
    exec(`open ${url}`);
  }
};

open("www.github.com");
```
## release

`os.release` 返回操作系统的发行版本号

## type

`os.type()` 也是返回当前所处的**操作系统的类型**

在 Linux 上返回 `'Linux'`，在 macOS 上返回 `'Darwin'`，在 Windows 上返回 `'Windows_NT'`
## version

`os.version()` 是一个用于获取**操作系统版本信息**的方法。

## homedir

`os.homedir()` **获取用户主目录**

``` node
const os = require('os');

console.log(os.homedir());
// Linux: /home/alice
// macOS: /Users/alice
// Windows: C:\Users\alice
```

> 示例：读取用户配置文件

``` node
const os = require('os');
const path = require('path');
const fs = require('fs');

const configPath = path.join(os.homedir(), '.myapprc');

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('配置:', config);
} else {
  console.log('未找到配置文件:', configPath);
}
```
## tmpdir

`os.tmpdir()` 获取系统临时目录；也就是 `temp` 目录
## cups

`os.cpus()` 获取CPU的线程以及详细信息

``` json
{
    model: '13th Gen Intel(R) Core(TM) i9-13900HX',
    speed: 2419,
    times: { user: 191015, nice: 0, sys: 159828, idle: 3395093, irq: 6609 }
  }
```

- `model`: 表示CPU的型号信息，其中 "13th Gen Intel(R) Core(TM) i9-13900HX" 是一种具体的型号描述。
    
- `speed`: 表示CPU的时钟速度，以MHz或GHz为单位。在这种情况下，速度为 2926 MHz 或 2.926 GHz。
    
- `times`: 是一个包含CPU使用时间的对象，其中包含以下属性：
    
    - `user`: 表示CPU被用户程序使用的时间（以毫秒为单位）。
    - `nice`: 表示CPU被优先级较低的用户程序使用的时间（以毫秒为单位）。
    - `sys`: 表示CPU被系统内核使用的时间（以毫秒为单位）。
    - `idle`: 表示CPU处于空闲状态的时间（以毫秒为单位）。
    - `irq`: 表示CPU被硬件中断处理程序使用的时间（以毫秒为单位）。

## networkInterfaces

`os.networkInterfaces` 获取用户的网路信息

## arch

`os.arch()` 获取 cpu 的一个架构

---
# process api

`process` 是 `Nodejs` **操作当前进程**和**控制当前进程**的 `API`，并且是挂载到 `globalThis` 下面的全局 `API`。

## arch

`process.arch` 作用同 `os.arch()` ，获取 cpu 的一个架构

## platform

`process.platform` 作用同 `os.platform`，返回当前编译 `node` 时的平台

## argv

`process.argv` 获取执行进程后面的**参数**，返回是一个数组

``` node
// PS E:\A\练习\nodejs\api> node process.js --version --open
console.log(process.argv);
// output
[
  'E:\\A\\NodeJs\\node.exe',
  'E:\\A\\练习\\nodejs\\api\\process.js',
  '--version',
  '--open'
]
```

第一项是编译脚本的程序；第二项是脚本所在的目录；第三项及以后项是执行进程后面的参数
## cwd

`process.cwd()` 获取当前的工作目录

`__dirname` 不能在 ESModule 模式下使用，`process.cwd()` 可以

## memoryUsage

`process.memoryUsage()` 用于获取 **Node.js 进程当前的内存使用情况**，返回一个包含多个字段的对象。它是排查内存泄漏、优化性能时最常用的工具之一。组

``` node
console.log(process.memoryUsage());

{ 
	rss: 30932992, // 常驻集大小 这是进程当前占用的物理内存量，不包括共享内存和页面缓存。它反映了进程实际占用的物理内存大小 
	heapTotal: 6438912, //堆区总大小 这是 V8 引擎为 JavaScript 对象分配的内存量。它包括了已用和未用的堆内存 
	heapUsed: 5678624, //已用堆大小 
	external: 423221, //外部内存使用量 这部分内存不是由 Node.js 进程直接分配的，而是由其他 C/C++ 对象或系统分配
	arrayBuffers: 17606 //是用于处理二进制数据的对象类型，它使用了 JavaScript 中的 ArrayBuffer 接口。这个属性显示了当前进程中 ArrayBuffers 的数量
}
```
