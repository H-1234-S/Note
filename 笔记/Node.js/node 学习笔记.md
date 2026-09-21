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

`process.memoryUsage()` 用于获取 **Node.js 进程当前的内存使用情况**，返回一个包含多个字段的对象。

用于排查内存泄漏、优化性能时最常用的工具之一。

``` node
console.log(process.memoryUsage());
// {
//   rss: 30801920,
//   heapTotal: 5472256,
//   heapUsed: 3290440,
//   external: 1092712,
//   arrayBuffers: 10508
// }
```

| 字段             | 含义                                                                    |
| -------------- | --------------------------------------------------------------------- |
| `rss`          | Resident Set Size，进程实际占用的**物理内存**总量（包括代码、堆、栈、C++ 对象等）                 |
| `heapTotal`    | V8 已申请的**堆内存总量**（已分配给 JS 堆的大小）                                        |
| `heapUsed`     | V8 堆中**实际使用**的内存量（真正存活的 JS 对象）                                        |
| `external`     | 绑定到 V8 的 **C++ 对象**占用的内存（如 Buffer、原生模块）                               |
| `arrayBuffers` | 所有 `ArrayBuffer` 和 `SharedArrayBuffer` 占用的内存（Buffer 底层也是 ArrayBuffer） |

## exit

`process.exit()` 用于**退出一个进程**

``` node
setTimeout(() => {
  console.log("end");
}, 5000);

// 监听进程退出事件
process.on("exit", () => {
  console.log("exit");
});
  
setTimeout(() => {
  process.exit();
}, 2000);
```
## kill

`process.kill` **杀死一个进程**；需要接收一个 `pid`，也就是档进程 `id`

``` node
setTimeout(() => {
  console.log("end");
}, 5000);
  
setTimeout(() => {
  process.kill(process.pid);
}, 2000);
```

> kill 和 exit 区别

exit 作用是**立即终止当前 Node.js 进程**

kill 实际功能是向指定 PID 的进程**发送一个信号**；目标进程收到信号后不一定真的会“死”
## env

`process.env` 用于**读取操作系统所有的环境变量**，也可以修改和查询环境变量。

> **注意：** 修改并不会真正影响操作系统的变量，而是只在当前线程生效，线程结束便释放。

# child_process api

## exec

`exec` 用于执行 `shell` 命令；返回一个完整的 `buffer`，`buffer` 的大小是 `200k`，如果超出会报错

``` node
child_process.exec(command, [options], callback)
```

> **示例：**

``` node
 exec('node -v',(err,stdout,stderr)=>{
    if(err){
        return  err
    }
    console.log(stdout.toString())
 })
```

> **options** 配置项

- **`cwd`** `<string>`：子进程的当前工作目录。
    
- **`env`** `<Object>`：环境变量键值对。
    
- **`encoding`** `<string>`：默认为 `'utf8'`。若设为 `'buffer'`，则 `stdout`/`stderr` 为 Buffer 对象。
    
- **`shell`** `<boolean> | <string>`：用于执行命令的 shell。设为 `true` 时使用系统默认 shell（UNIX 上为 `/bin/sh`，Windows 上为 `process.env.ComSpec`）；也可传入字符串指定自定义 shell。默认值为 `false`（不启用 shell）。详见 Shell Requirements 与 Default Windows Shell。
    
- **`timeout`** `<number>`：默认为 `0`。
    
- **`maxBuffer`** `<number>`：stdout 或 stderr 允许的最大字节数。默认为 `1024 * 1024`（1 MB）。如果超过限制，则子进程会被终止。查看警告：maxBuffer and Unicode。
    
- **`killSignal`** `<string> | <integer>`：默认为 `'SIGTERM'`。
    
- **`uid`** `<number>`：设置该进程的用户标识。（详见 setuid(2)）
    
- **`gid`** `<number>`：设置该进程的组标识。（详见 setgid(2)）
## execSync

`execSync` 也是用于执行命令，是同步执行的。

如果要执行单次`shell`命令 `execSync` 方便一些，`options` 同上

``` node
const nodeVersion  = execSync('node -v')
console.log(nodeVersion.toString("utf-8"))

execSync("mkdir test");
```

使用 `exec` 可以打开一些软件，例如：谷歌

> **示例：**

``` node
execSync("start chrome http://www.baidu.com --incognito")
```
## spawn

`spawn` 用于执行一些**实时获取的信息**，因为 `spawn` 返回的是**流**，**边执行边返回**，`exec` 是返回一个完整的 `buffer`。

`spawn` 在执行完成后会抛出 `close` 事件监听，并返回状态码，通过状态码可以知道子进程是否顺利执行。

`exec` 只能通过返回的 `buffer` 去识别完成状态，识别起来较为麻烦

``` node
const { stdout } = spawn("netstat", [], {});

//返回的数据用data事件接受
stdout.on("data", (steram) => {
  console.log(steram.toString());
});
  
stdout.on("close", () => {
  console.log("end");
});
```

> **数组用于接收参数**
## spawnSync

`spawn` 的同步版本

## execFile

`xecFile` 适合**执行可执行文件**，例如执行一个 `node` 脚本，或者 `shell` 文件。`windows` 可以编写 `cmd` 脚本，`posix` 可以编写 `shell` 脚本

``` node
execFile(
  path.resolve(__dirname, "../", "demo.cmd"),
  { shell: true },
  (err, stdout) => {
    console.log(stdout.toString());
  },
);
```

> **node.js 出于安全考虑，不再允许 `execFile` 直接执行 `.cmd` 批处理文件，除非显式启用 shell**

## fork

`fork` 用于执行 `javascript` 模块；适用于**大量的计算**，或者容易阻塞主进程操作的一些代码

``` node
// 用于执行 js 模块
const testProcess = fork("../test.js");
  
// testProcess.send("主进程");
  
testProcess.on("message", (response) => {
  console.log(response);
});
```

> **test.js** 文件

``` node
process.on("message", (message) => {
  console.log(message);
});

process.send("我是子进程");
```

`fork` 底层使用的是 `IPC` 通道进行通讯的，`IPC` 是基于 `libuv` 实现的

# util api

## promisify

`util.promisify` 用于将遵循 Node.js 回调风格的函数转换为返回 Promise 的函数。

Node.js 的传统回调风格是 `(err, result) => {}`：

``` node
const { promisify } = require("node:util");
const { exec } = require("child_process");
  
// exec("node -v", (error, stdout) => {
//   if (error) {
//     return error;
//   }
//   console.log(stdout.toString());
// });
  
const execPromise = promisify(exec);
  
execPromise("node -v")
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.log("err", err);
  });
// res { stdout: 'v24.12.0\r\n', stderr: '' }
```

> **promisify实现**

``` node
// 接收一个function,返回一个function
// new function return promise
const myPromisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, ...values) => {
        if (err) {
          reject(err);
        }
  
        if (values && values.length > 1) {
          const obj = {};
  
          for (let key in values) {
            obj[key] = values[key];
          }
          resolve(obj);
        } else {
          resolve(values);
        }
      });
    });
  };
};
```

## callbackify

`callbackify` 把一个返回 `Promise` 的 `async` 函数转换成遵循 Node.js 回调风格 `(err, result)` 的函数。

``` node
const fn = (status) => {
  if (status === 1) {
    return Promise.resolve("success");
  }
  return Promise.reject("error");
};
  
const callback = callbackify(fn);
  
callback(1, (error, value) => {
  console.log(error, value);
});
```

## format

`util.format` 的核心作用是**把各种类型的值拼接成一个格式化的字符串**

``` node
const util = require('util');

// %s 替换为字符串
util.format('你好 %s，欢迎回来', '张三');
// 输出: '你好 张三，欢迎回来'

// %d 替换为数字
util.format('你的年龄是 %d 岁', 25);
// 输出: '你的年龄是 25 岁'

// 多个占位符按顺序替换
util.format('%s 的得分是 %d', '李四', 95);
// 输出: '李四 的得分是 95'
```

|占位符|作用|说明|
|---|---|---|
|`%s`|字符串|转换所有值（BigInt、Object 除外），Object 会用 `util.inspect()` 检查[](https://beta.docs.nodejs.org/util/format)|
|`%d`|数字|转换为数字（BigInt、Symbol 除外）[](https://beta.docs.nodejs.org/util/format)|
|`%i`|整数|用 `parseInt(value, 10)` 转换[](https://beta.docs.nodejs.org/util/format)|
|`%f`|浮点数|用 `parseFloat(value)` 转换[](https://beta.docs.nodejs.org/util/format)|
|`%j`|JSON|如果参数包含循环引用，会替换为 `[Circular]`[](https://beta.docs.nodejs.org/util/format)|
|`%o`|对象|用 `util.inspect()` 显示对象，包含不可枚举属性[](https://beta.docs.nodejs.org/util/format)|
|`%O`|对象|用 `util.inspect()` 显示对象，**不包含**不可枚举属性[](https://beta.docs.nodejs.org/util/format)|
|`%%`|百分号|输出一个 `%`，不消耗参数|
# fs api

在 Node.js 中，`fs` 模块是文件系统模块（File System module）的缩写，它提供了与文件系统进行交互的各种功能。

> fs 的多种策略

- fs 支持同步和异步两种模式，增加了`Sync`，fs就会采用同步的方式运行代码，会阻塞下面的代码，不加 Sync 就是异步的模式不会阻塞。
    
- fs 新增了 promise 版本，只需要在引入包后面增加 /promise 即可，fs 便可支持 promise 回调。
    
- fs 返回的是一个 buffer 二进制数据，每两个十六进制数字表示一个字节
    

## readFile

`fs.readFile` 读取文件内容

``` node
const fs = require('fs');

fs.readFile('/path/to/file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data); // 文件内容
});
```

> 参数说明：

- **第一个参数**：文件路径。
    
- **第二个参数**：编码方式。**如果不传这个参数，得到的是 `Buffer`（二进制数据），而不是可读的字符串
    
- **第三个参数**：回调函数，遵循“错误优先”风格，第一个参数是 `err`，第二个是 `data`。

> 现在更推荐使用 `fs/promises` 或 `util.promisify` 来配合 `async/await

``` node
const { readFile } = require('fs/promises');

async function main() {
  try {
    const data = await readFile('/path/to/file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

//--------------------

const newFn = promisify(fs.readFile);

newFn("../index.txt")
  .then((resolve) => {
    console.log(resolve.toString());
  })
  .catch((error) => {
    console.log(error);
  });
```

## createReadStream

`fs.createReadStream` 是 Node.js 中**流式读取文件**的方法。

它和 `readFile` 最大的区别是：

- `readFile` 一次性把整个文件读进内存

- 而 `createReadStream` 是**一块一块（chunk）地读**，每次只把一部分数据放进内存。

``` node
const fs = require('fs');

const stream = fs.createReadStream('/path/to/file.txt', 'utf8');

stream.on('data', (chunk) => {
  console.log('收到一块数据:', chunk);
});

stream.on('end', () => {
  console.log('读取完成');
});

stream.on('error', (err) => {
  console.error('出错了:', err);
});
```

## mkdir

`fs.mkdir` 创建文件夹；如果开启 `recursive` 可以递归创建多个文件夹

``` node
fs.mkdir("../node/demo/users", { recursive: true }, () => {});
```

> **注意：** 最后一个参数要传递一个函数
## rm

`fs.rm` 删除文件夹；如果开启 `recursive` 可以递归删除多个文件夹

``` node
fs.rm("../node", { recursive: true }, () => {});
```

> `rm` 的常用选项：

- **`recursive: true`**：递归删除目录及其内容（删目录时必须加，否则报错）。
    
- **`force: true`**：路径不存在时**不报错**（类似 `rm -f`）。

## renameSync

`fs.renameSync` 用于将文件重命名

``` node
const fs = require('node:fs')

fs.renameSync('./test.txt','./test2.txt')
```

## watch

`fs.watch` 用于侦听一个文件是否发生变化；返回监听的事件如 `change` ，和监听的内容 `filename`

``` node
fs.watch('./test2.txt',(event,filename)=>{
    
    console.log(event,filename)
})
// change test2.txt
```

## writeFileSync

`fs.writeFileSync` 用于写入文件；第一个参数是文件路径、第二个是写入内容、第三个是配置项

``` node
fs.writeFileSync("../index.txt", "append", {
  flag: "a",  // 不带参数会直接覆盖旧内容
});
```

`fs.writeFile` 用法同 `fs.writeFileSync`；都没有返回值

## appendFileSync

`fs.appendFileSync` 用于追加添加

``` node
fs.appendFileSync("../index.txt", "append");
```

## createWriteStream

`fs.createWriteStream` 适用于大文件写入；**创建一个写入管道**，写入完成后记得关闭

``` node
const fs = require('node:fs')

let verse = [
    '待到秋来九月八',
    '我花开后百花杀',
    '冲天香阵透长安',
    '满城尽带黄金甲'
]

let writeStream = fs.createWriteStream('index.txt')

verse.forEach(item => {
    writeStream.write(item + '\n')
})

writeStream.end()  // 关闭管道

writeStream.on('finish',()=>{
    console.log('写入完成')
})
```

## linkSync

`fs.linkSync` 硬链接；两个文件共享一块内存空间；删除一个另一个不影响使用

``` node
fs.linkSync("../index.txt", "../index2.txt");
```
## symLinkSync

`fs.symlinkSync` 软链接；软链接需要管理员权限才可以运行。

``` node
fs.symlinkSync("../index.txt", "../index2.txt");
```

创建一个独立文件，**内容是一个路径**，指向目标文件；如果目标文件删了会报错

> 相当于一个**路牌**，指向目的地，目的地拆了但是路牌还在；类似于 windows 快捷方式

## existsSync

`fs.existsSync()` 判断路径是否存在

``` node
const fs = require('node:fs')

fs.existsSync("./demo")
```

> **注意：**

只能**判断路径是否存在**，不能判断是 `file` 还是 `folder`
## statsSync

`fs.statSync` 用来**同步获取一个路径的详细信息（元数据）**

它不读文件内容，只读"文件的属性"：类型、大小、权限、时间戳等。返回一个 `fs.Stats` 对象。

``` node
const fs = require('fs');

const stat = fs.statSync('./test.txt');

console.log(stat);
// Stats {
//   dev: 16777220,
//   mode: 33188,
//   nlink: 1,
//   uid: 501,
//   gid: 20,
//   rdev: 0,
//   blksize: 4096,
//   ino: 12345678,
//   size: 1024,
//   blocks: 8,
//   atimeMs: 1690000000000,
//   mtimeMs: 1690000000000,
//   ctimeMs: 1690000000000,
//   birthtimeMs: 1690000000000,
//   atime: 2023-07-22T...,
//   mtime: 2023-07-22T...,
//   ctime: 2023-07-22T...,
//   birthtime: 2023-07-22T...,
// }
```

> **注意：**

`statSync` 和 `existsSync` 最大的区别是：**路径不存在时，`statSync` 直接抛异常**，而不是返回 false。

因此需要用 `try/catch` 包裹起来

> `Stats` 对象上有一组 `isXxx()` 方法，用来判断**文件类型**：

``` node
const stat = fs.statSync('./something');

stat.isFile();            // 普通文件
stat.isDirectory();       // 目录
stat.isSymbolicLink();    // 软链接（注意：statSync 会追踪链接，通常返回 false）
stat.isFIFO();            // 命名管道（FIFO）
stat.isSocket();          // Unix socket
stat.isBlockDevice();     // 块设备
stat.isCharacterDevice(); // 字符设备
```

---
## 注意

``` node
fs.readFile(
  "../index.txt",
  {
    encoding: "utf-8",
    flag: "r",
  },
  (err, dataStr) => {
    if (err) throw err;
    console.log("fs");
  },
);
  
// 在本轮事件循环结束后执行
setImmediate(() => {
  console.log("setImmediate");
});
```

> 为什么先走 setImmediate 呢，而不是 fs？

Node.js 读取文件的时候是使用 libuv 进行调度的

而 setImmediate 是由 V8 进行调度的

文件读取完成后 libuv 才会将 fs 的结果推入 V8 的队列

# crypto api

`crypto` 是 Node.js 内置的**加密模块**，提供哈希、加密解密、签名验签、随机数等能力。

| 能力    | 代表 API                                | 用途           |
| ----- | ------------------------------------- | ------------ |
| 哈希/摘要 | `createHash`                          | 校验完整性、指纹     |
| HMAC  | `createHmac`                          | 带密钥的哈希，防篡改   |
| 对称加密  | `createCipheriv` / `createDecipheriv` | 加解密数据（AES 等） |
| 非对称加密 | `publicEncrypt` / `privateDecrypt`    | 公钥加密、私钥解密    |
| 签名/验签 | `sign` / `verify`                     | 证明身份、防伪造     |
| 随机数   | `randomBytes` / `randomUUID`          | 生成密钥、token、盐 |
| 密钥派生  | `pbkdf2` / `scrypt` / `hkdf`          | 从密码派生密钥      |

## 对称加密

加密和解密用**同一个密钥**，速度快，适合加密大量数据。

`crypto.createCipheriv()` 接收三个参数；第一个是加密算法、第二个是 key、第三个是 iv

``` node
const crypto = require('crypto');

const key = crypto.randomBytes(32);   // AES-256 需要 32 字节密钥
const iv = crypto.randomBytes(16);    // 初始向量，16 字节

function encrypt(text) {
  // 创建加密实例，使用 AES-256-CBC 算法，提供密钥和初始化向量
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const enc = encrypt('机密内容');
console.log(enc);
console.log(decrypt(enc)); // '机密内容'
```

`crypto.createCipheriv()` 返回的 `cipher` 是一个**加密器对象**

> 它有两个核心方法：

- **`cipher.update(data, 输入编码, 输出编码)`**：加密**一部分**数据，返回这部分的密文。
    
- **`cipher.final(输出编码)`**：**结束加密**，返回**最后残留的那部分密文**。

> 为什么需要 final？

分组加密算法（如 AES）是按**固定大小的块（block）** 处理的，AES 的块大小是 **16 字节**。

当 `update` 的数据长度不是 16 的整数倍时：

- `update` 会先处理能凑成完整块的部分；
    
- **最后不足一块的残留数据，会一直留在 cipher 内部**，等 `final` 来处理。
    

`final` 做的事：

1. 对残留数据做**填充（padding）**，补成完整的块（CBC 模式默认用 PKCS#7 填充）；
    
2. 加密最后这一块；
    
3. 返回这部分密文，并标记加密结束。

``` node
encrypted += cipher.final('hex');
```

意思是：**把最后残留的那部分密文取出来（以 hex 字符串形式），拼接到前面的结果上**。
## 非对称加密

非对称加密，生成两个密钥；用公钥去加密，私钥去解密

``` node
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
  
const result = crypto.publicEncrypt(publicKey, Buffer.from("xiaomanzs"));
  
console.log(result.toString("hex"));
  
const decipher = crypto.privateDecrypt(privateKey, Buffer.from(result));
  
console.log(decipher.toString());
```

`crypto.generateKeyPairSync()` 生成公钥和私钥

`crypto.publicEncrypt()` 根据公钥去加密

`crypto.privateDecrypt()` 根据私钥去解密

## 哈希函数

``` node
const crypto = require('node:crypto');

// 要计算哈希的数据
let text = '123456';

// 创建哈希对象，并使用 MD5 算法
const hash = crypto.createHash('md5');

// 更新哈希对象的数据
hash.update(text);

// 计算哈希值，并以十六进制字符串形式输出
const hashValue = hash.digest('hex');

console.log('Text:', text);
console.log('Hash:', hashValue);
```

> 哈希函数具有以下特点：

1. 固定长度输出：不论输入数据的大小，哈希函数的输出长度是固定的。例如，常见的哈希函数如 MD5 和 SHA-256 生成的哈希值长度分别为 128 位和 256 位。
2. 不可逆性：哈希函数是单向的，意味着从哈希值推导出原始输入数据是非常困难的，几乎不可能。即使输入数据发生微小的变化，其哈希值也会完全不同。
3. 唯一性：哈希函数应该具有较低的碰撞概率，即不同的输入数据生成相同的哈希值的可能性应该非常小。这有助于确保哈希值能够唯一地标识输入数据。

> 使用场景

1. 我们可以避免密码明文传输，使用 md5 加密或者 sha256
2. 验证文件完整性。读取文件内容生成 md5 如果前端上传的 md5 和后端的读取文件内部的 md5 匹配说明文件是完整的

# zlib api

`zlib` 是 Node.js 内置的**压缩/解压模块**，底层基于 zlib 库，提供数据压缩、解压、流式处理等能力。

支持**压缩/解压缩**、**流式压缩/流式解压缩**

> **流式处理的价值：**

**内存效率**：1GB 文件压缩，`gzipSync` 要占约 1GB 内存；流式处理始终只占几十 KB。

**边读边压边传**：在 HTTP 服务里，可以一边读文件一边压缩一边发给客户端，不用等整个文件压完。

> 其实用 `cpu` 换**带宽**
## gzip

> **一次性压缩：**

``` node
const zlib = require('zlib');

zlib.gzip('hello world', (err, compressed) => {
  if (err) throw err;
  console.log(compressed.length);

  zlib.gunzip(compressed, (err, decompressed) => {
    if (err) throw err;
    console.log(decompressed.toString()); // 'hello world'
  });
});
// 也可以使用 util 中的 promisify 转一下使用
```

> **流式压缩：**

``` node
const zlib = require("node:zlib");
const fs = require("node:fs");
  
const readStream = fs.createReadStream("../index.txt");
const writeStream = fs.createWriteStream("../index.txt.gz");
readStream.pipe(zlib.createGzip()).pipe(writeStream);
```

> **流式解压缩：**

``` node
const readStream = fs.createReadStream("../index.txt.gz");
const writeStream = fs.createWriteStream("../index2.txt");
readStream.pipe(zlib.createGunzip()).pipe(writeStream);
```

## deflate

> **流式压缩：**

``` node
const readStream = fs.createReadStream("../index.txt");
const writeStream = fs.createWriteStream("../index.txt.deflate");
readStream.pipe(zlib.createDeflate()).pipe(writeStream);
```

> **流式解压缩：**

``` node
const readStream = fs.createReadStream("../index.txt.deflate");
const writeStream = fs.createWriteStream("../index3.txt");
readStream.pipe(zlib.createInflate()).pipe(writeStream);
```

## gzip 和 deflate 区别

1. **压缩算法**：Gzip 使用的就是 Deflate 压缩算法，而 Deflate 本身由 LZ77 算法和哈夫曼编码组成。LZ77 负责把重复出现的字符串替换成引用，哈夫曼编码再根据字符出现频率，用较短的编码表示高频字符，从而进一步压缩数据。所以**哈夫曼编码是 Deflate 的固有组成部分，不是 Gzip 额外叠加的一层**。
    
2. **格式与算法**：Gzip 和 zlib 都是**容器格式**，它们内部的压缩主体都是 Deflate。三者的核心压缩数据完全相同，区别只在头尾：
    
    - Gzip = gzip 头 + Deflate 数据 + CRC32 校验尾
        
    - zlib = zlib 头 + Deflate 数据 + Adler-32 校验尾
        
    - raw deflate = 裸的 Deflate 数据，没有头尾
        
3. **压缩效率**：由于压缩算法相同，Gzip 和 Deflate 的压缩率**基本一致**，差异仅来自头尾开销（gzip 头比 zlib 头略大一点），并不存在"Gzip 因为多用了哈夫曼所以压缩率更高"这回事。真正影响压缩率的是**压缩级别**（0–9），级别越高压缩率越好。
    
4. **压缩速度**：Gzip 和 Deflate 的计算量也基本一样，因为核心都是同一套 Deflate 算法。Gzip 只是多了一步 CRC32 校验计算，开销很小，不构成明显的速度差异。同样，速度主要取决于**压缩级别**，而不是格式。
    
5. **应用场景**：
    
    - **Gzip**：常用于 `.gz` 文件、HTTP 响应的 `Content-Encoding: gzip`，是 Web 传输中最常见的压缩格式。
        
    - **zlib / Deflate**：常用于需要和其他系统或协议对接的场景，比如 HTTP 的 `Content-Encoding: deflate`、PNG 图片内部、部分网络协议。
        
    - **raw deflate**：用于自定义格式、需要极致省空间的场景。

## http请求压缩

HTTP 请求压缩，指的是在客户端和服务器之间传输数据时，对**请求体**或**响应体**进行压缩，以减少网络传输量、加快速度。

``` node
const text = "Hushaoqiong".repeat(1000);

const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader("Content-Encoding", "deflate");
  // response.setHeader("Content-Encoding", "gzip");
  
  response.setHeader("Content-type", "text/plan;charset=utf-8");
  const result = zlib.deflateSync(text);
  // const result = zlib.gzipSync(text);
  response.end(result);
});
  
server.listen(port, hostname, () => {
  execSync(`start http://${hostname}:${port}/`);
});
```

# http api

HTTP 模块是 Node.js 的核心模块之一，它提供了创建 HTTP 服务器和客户端的能力。

**创建 Web 服务器：** 你可以使用 "http" 模块创建一个 HTTP 服务器，用于提供 Web 应用程序或网站。通过监听特定的端口，服务器可以接收客户端的请求，并生成响应。你可以处理不同的路由、请求方法和参数，实现自定义的业务逻辑。
 
**构建 RESTful API：** "http" 模块使得构建 RESTful API 变得简单。你可以使用 HTTP 请求方法（如 GET、POST、PUT、DELETE 等）和路径来定义 API 的不同端点。通过解析请求参数、验证身份和权限，以及生成相应的 JSON 或其他数据格式，你可以构建强大的 API 服务。

**代理服务器：** "http" 模块还可以用于创建代理服务器，用于转发客户端的请求到其他服务器。代理服务器可以用于负载均衡、缓存、安全过滤或跨域请求等场景。通过在代理服务器上添加逻辑，你可以对请求和响应进行修改、记录或过滤。

**文件服务器：** "http" 模块可以用于创建一个简单的文件服务器，用于提供静态文件（如 HTML、CSS、JavaScript、图像等）。通过读取文件并将其作为响应发送给客户端，你可以轻松地构建一个基本的文件服务器。

## 创建 HTTP 服务器

``` node
const http = require('http');

// 创建服务器
const server = http.createServer((req, res) => {
    // req: 请求对象 (IncomingMessage)
    // res: 响应对象 (ServerResponse)
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

// 监听端口
server.listen(3000, '127.0.0.1', () => {
    console.log('服务器运行在 http://127.0.0.1:3000/');
});
```

## 请求对象 request

``` node
const server = http.createServer((req, res) => {
    // 请求方法
    console.log(req.method);      // GET, POST, PUT, DELETE 等
    
    // 请求 URL
    console.log(req.url);         // /path?query=value
    
    // HTTP 版本
    console.log(req.httpVersion); // 1.1
    
    // 请求头
    console.log(req.headers);     // { host: 'localhost:3000', ... }
    console.log(req.headers['user-agent']);
    
    // 请求体数据（流式）
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        console.log('请求体:', body);
        res.end('收到数据');
    });
});
```

## 响应对象 response

``` node
const server = http.createServer((req, res) => {
    // 设置状态码
    res.statusCode = 200;
    // 或使用 res.writeHead()
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Custom-Header', 'value');
    
    // 一次性设置状态码和响应头
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value'
    });
    
    // 写入响应体（可多次）
    res.write('Hello ');
    res.write('World');
    
    // 结束响应
    res.end('!');
    
    // 响应事件
    res.on('finish', () => {
        console.log('响应已发送');
    });
});
```

## 服务器事件

``` node
const server = http.createServer();

// 新连接建立
server.on('connection', (socket) => {
    console.log('新连接建立');
});

// 收到请求
server.on('request', (req, res) => {
    res.end('Hello');
});

// 客户端错误
server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// 服务器关闭
server.on('close', () => {
    console.log('服务器已关闭');
});

// 监听配置
server.listen(3000, () => {
    console.log('监听中');
});

// 超时设置
server.setTimeout(60000); // 60秒超时
server.timeout = 30000;   // 30秒超时
```

## 处理不同的 HTTP 请求方法

``` node
const http = require("node:http");

const prot = 3000;
const hostname = "127.0.0.1";
  
const server = http.createServer((request, response) => {
  response.setHeader("content-type", "application/json");
  
  // 用标准的 URL 解析，不使用 node 的 url 模块
  const { pathname, query } = new URL(
    request.url,
    `http://${request.headers.host}`,
  );
  
  if (request.method === "GET") {
    console.log("GET");
  
    if (pathname === "/login/user") {
      console.log("/login/user");
    } else {
      response.statusCode = 404;
      response.end("path not found");
    }
  } else if (request.method === "POST") {
    response.statusCode = 200;
    console.log("POST");
  
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
    });
  
    request.on("end", () => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(data);
    });
  } else {
    response.statusCode(405);
    response.end("method not allowed");
  }
});
  
server.listen(prot, hostname, () => {
  console.log("HTTP Server 已启动");
});

server.on("request", () => {
  console.log("收到请求");
});
  
server.on("close", () => {
  console.log("请求已关闭");
});
```

使用 `request.method` 区分是哪种请求，根据不同的请求方法执行对应的逻辑

使用 `new URL` 解析路径和参数，根据不同的路径执行不同的逻辑

## 反向代理

> **proxy.config.js**

``` node
module.exports = {
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",  // 转发的地址
        changeOrigin: true,  // 是否有跨域
      },
    },
  },
};
```

> **proxy.js**

``` node
const http = require("node:http");
const fs = require("node:fs");
const { createProxyMiddleware } = require("http-proxy-middleware");

const hostname = "127.0.0.1";
const port = 3000;
  
const html = fs.readFileSync("../index.html");
  
const proxyConfig = require("../proxy.config");
  
const server = http.createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  const proxyList = Object.keys(proxyConfig.server.proxy);
  
  if (proxyList.includes(pathname)) {
    const proxy = createProxyMiddleware(proxyConfig.server.proxy[pathname]);
    proxy(request, response);
    return;
  }
  
  response.writeHead(200, {
    "Content-Type": "text/html",
  });
  response.end(html);
});
  
server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
```

> **index.js**

``` node
const http = require("node:http");
  
const hostname = "127.0.0.1";
const port = 3001;
  
const server = http.createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  if (pathname === "/api") {
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
  
    response.end("proxy success");
  }
});
  
server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});
  
server.on("request", () => {
  console.log("port 3001 收到请求");
});
```

`http-proxy-middleware` 的核心作用，是**为 Node.js 服务器提供一个简洁的代理中间件**，让你能用几行配置就把特定路径的请求转发到另一台服务器上

## 动静分离

动静分离是一种在 Web 服务器架构中常用的优化技术，旨在提高网站的性能和可伸缩性。

它基于一个简单的原则：将动态生成的内容（如动态网页、API请求）与静态资源（如HTML、CSS、JavaScript、图像文件）**分开处理和分发**。

``` node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import mime from "mime";
  
const port = 3000;
const hostname = "127.0.0.1";
  
const server = http.createServer((request, response) => {
  const { url, method } = request;
  
  if (method === "GET" && url.startsWith("/static")) {
    const startsPath = path.join(process.cwd(), url);
    const type = mime.getType(startsPath);
  
    fs.readFile(startsPath, (error, data) => {
      if (error) {
        response.statusCode = 404;
        response.end("not found");
        return;
      }
  
      response.writeHead(200, {
        "content-type": type,
        "cache-control": "public,max-age=3600",
      });

      response.end(data);
    });
  } else if (method === "GET" || method === "POST") {
    // TODO
  }
});
  
server.listen(port, hostname, () => {
  console.log(`start server http://${hostname}:${port}`);
});
```

> 为什么实现动静分离：

1. **性能优化**：将静态资源与动态内容分离可以提高网站的加载速度。由于静态资源往往是不变的，可以使用缓存机制将其存储在CDN（内容分发网络）或浏览器缓存中，从而减少网络请求和数据传输的开销。

2. **负载均衡**：通过将动态请求分发到不同的服务器或服务上，可以平衡服务器的负载，提高整个系统的可伸缩性和容错性。

3. **安全性**：将动态请求与静态资源分开处理可以提高系统的安全性。静态资源通常是公开可访问的，而动态请求可能涉及敏感数据或需要特定的身份验证和授权。通过将静态资源与动态内容分离，可以更好地管理访问控制和安全策略。

> 实现动静分离的方法：

- 使用反向代理服务器（如Nginx、Apache）将静态请求和动态请求转发到不同的后端服务器或服务。

- 将静态资源部署到 CDN 上，通过 CDN 分发静态资源，减轻源服务器的负载。

- 使用专门的静态文件服务器（如Amazon S3、Google Cloud Storage）存储和提供静态资源，而将动态请求交给应用服务器处理。

# url api

Node.js 中的 `url` 模块，核心作用就是：

> **解析 URL、构造 URL、修改 URL，以及处理 URL 的查询参数。**

Node 的 `url` 模块实际上提供了两套 API。现在开发 Node.js，**重点学习 `URL` 和 `URLSearchParams`**

``` node
const myUrl = new URL(
  "https://www.example.com:8080/user/profile?id=1001&name=zhangsan#info",
);

console.log(myUrl);

/*
URL {
  href: 'https://www.example.com:8080/user/profile?id=1001&name=zhangsan#info',
  origin: 'https://www.example.com:8080',
  protocol: 'https:',
  username: '',
  password: '',
  host: 'www.example.com:8080',
  hostname: 'www.example.com',
  port: '8080',
  pathname: '/user/profile',
  search: '?id=1001&name=zhangsan',
  searchParams: URLSearchParams { 'id' => '1001', 'name' => 'zhangsan' },
  hash: '#info'
}
*/
```

> **注意：**

`searchParams` 是一个标准的 `URLSearchParams` 对象

## fileURLToPath

`fileURLToPath` 是 Node.js `node:url` 模块提供的一个工具函数，作用是**把 `file://` 协议的 URL 转换成操作系统本地路径**。

因为 `import.meta.url` 返回的是 **URL**，但很多 API（`fs.readFileSync`、`path.join` 等）需要的是**本地路径字符串**；因此可以调函数转一下

> **示例：**

``` node
import { fileURLToPath } from "node:url";
import path from "node:path";
  
console.log(import.meta);
/*
{
  dirname: 'E:\\A\\练习\\nodejs',
  filename: 'E:\\A\\练习\\nodejs\\m.mjs',
  main: true,
  resolve: [Function: resolve],
  url: 'file:///E:/A/%E7%BB%83%E4%B9%A0/nodejs/m.mjs'
}
*/
  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  
console.log(__filename);
console.log(__dirname);
```

因为 ESM 中没有 `__filename` 和 `__dirname` 


# express

Express是一个流行的 Node.js Web应用程序框架，用于构建灵活且可扩展的Web应用程序和API。

它是基于Node.js的HTTP模块而创建的，简化了处理HTTP请求、响应和中间件的过程。

## 基本使用

`GET` 请求使用 `request.query` 获取查询参数；如果是动态参数使用 `request.params` 获取

`POST` 请求使用 `request.body` 获取参数；`JSON` 格式的参数要使用 `express.json()` 中间件解析

``` node
import express from "express";

const app = express();

app.use(express.json());

const port = 3000;

app.get("/get", (request, response) => {
  console.log(request.query);
  response.send("get");
});

app.post("/post", (request, response) => {
  console.log(request.body);
  response.send("post");
});

//如果是动态参数用 params 
app.get('/:id', (req, res) => { 
  console.log(req.params) res.send('get id') 
});

app.listen(port, (error) => {
  if (error) {
    throw error;
  }
  
  console.log(`http://localhost:${port}`);
});
```

## 模块化

`Express` 支持将路由模块化，使得应用程序可以根据不同的功能或模块**进行分组**。

在模块中使用 `express.Router()` 声明 `router` ；在 `app` 中使用 `use` 注册一下 

``` node
import express from "express";
import User from "./src/user.js";
import List from "./src/list.js";

const app = express();

app.use(express.json());

// 模块化
// 带上前缀，防止重名
app.use("/user", User);
app.use("/list", List);

const port = 3000;

app.get("/get", (request, response) => {
  console.log(request.query);
  response.send("get");
});

app.post("/post", (request, response) => {
  console.log(request.body);
  response.send("post");
});

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`http://localhost:${port}`);
});
```

> `/src/user.js`

``` node
import express from "express";

const router = express.Router();

router.use(express.json());

router.get("/login", (request, response) => {
  response.send("登录成功");
});

router.post("/register", (request, response) => {
  console.log(request.body);
  response.send("注册成功");
});

export default router;
```

> `/src/list.js`

``` node
import express from "express";

const router = express.Router();

router.get("/data", (request, response) => {
  response.send([
    {
      name: "han",
      age: 18,
    },
    {
      name: "jo",
      age: 21,
    },
  ]);
});

export default router;
```

> `express.http`

``` http
GET http://localhost:3000/list/data HTTP/1.1

POST http://localhost:3000/user/register HTTP/1.1
Content-Type: application/json

{
    "name":"jo",
    "id":123
}
```

## 中间件

`Express` 有一个庞大的中间件生态系统，开发人员可以使用各种中间件来扩展和增强应用程序的功能。

例如：身份验证、会话管理、日志记录、静态文件服务等。

> 中间件位于请求和最终路由处理函数之间。可以对请求和响应进行修改、执行额外的逻辑或者执行其他任务。

中间件函数接收三个参数：`req`（请求对象）、`res`（响应对象）和`next`（下一个中间件函数）。

通过调用`next()`方法，中间件可以将控制权传递给下一个中间件函数。

如果中间件不调用`next()`方法，请求将被中止，不会继续传递给下一个中间件或路由处理函数

> 示例：实现一个日志中间件

``` node
import log4js from "log4js";

// 配置 log4js
log4js.configure({
  appenders: {
    out: {
      type: "stdout", // 输出到控制台
      layout: {
        type: "colored", // 使用带颜色的布局
      },
    },
    file: {
      type: "file", // 输出到文件
      filename: "./logs/server.log", // 指定日志文件路径和名称
    },
  },
  categories: {
    default: {
      appenders: ["out", "file"], // 使用 out 和 file 输出器
      level: "debug", // 设置日志级别为 debug
    },
  },
});
  
// 获取 logger
const logger = log4js.getLogger("default");
  
// 日志中间件
const loggerMiddleware = (req, res, next) => {
  logger.debug(`${req.method} ${req.url}`); // 记录请求方法和URL
  next();
};
  
export default loggerMiddleware;
```

## 防盗链

防盗链（Hotlinking）是指在网页或其他网络资源中，通过直接链接到其他网站上的图片、视频或其他媒体文件，从而显示在自己的网页上。

> 使用 Referrer 检查：

``` node
import express from "express";
import { execSync } from "child_process";

const whiteList = ["localhost"];

const preventHotLinking = (request, response, next) => {
  const referer = request.get("referer");

  if (referer) {
    const { hostname } = new URL(referer);
  
    if (!whiteList.includes(hostname)) {
      response.statusCode = 404;
      response.send("无权访问");
      return;
    }
  }
  
  next();
};
  
const app = express();
  
app.use(preventHotLinking);
  
app.use(express.static("static"));
  
const port = 3000;
  
app.listen(port, () => {
  execSync(`start http://localhost:${port}`);
});
```

> 防盗链的判断策略：

- **没有 referer**：通常是用户在地址栏直接访问、或从 HTTPS 页面跳转到 HTTP 页面（浏览器不发送 Referer）。一般应当**放行**。
    
- **有 referer 但不在白名单**：拒绝。

# cors

**跨域资源共享**（Cross-Origin Resource Sharing，CORS）是一种机制，用于在浏览器中实现跨域请求访问资源的权限控制。

当一个网页通过 XMLHttpRequest 或 Fetch API 发起跨域请求时，浏览器会根据同源策略（Same-Origin Policy）进行限制。

同源策略要求请求的源（协议、域名和端口）必须与资源的源相同，否则请求会被浏览器拒绝。

> 其实请求已经到浏览器了，只是浏览器禁止 JS 去读取；服务器设置一下白名单即可解决。

## 响应头

`ccess-Control-Allow-Origin`（必填）；指定允许访问该资源的外域 URI。

``` node
Access-Control-Allow-Origin: "https://example.com"
Access-Control-Allow-Origin: *          // 允许所有源（但不能携带凭证）
```

> 注意：如果需要携带 Cookie，不能用 `*`，必须指定具体域名。

 `Access-Control-Allow-Methods`（预检请求必填）；指定允许的 HTTP 方法。

``` node
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

`Access-Control-Allow-Headers`（预检请求必填）；指定允许的请求头字段。

``` node
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

`Access-Control-Allow-Credentials`（可选）；是否允许发送 Cookie 等凭证。

``` node
Access-Control-Allow-Credentials: true
```

使用时 `Allow-Origin` 必须是具体域名，前端 `xhr.withCredentials = true`。

`Access-Control-Max-Age`（可选）；预检请求结果的缓存时间（秒），减少 OPTIONS 请求。

``` node
Access-Control-Max-Age: 86400
```

`Access-Control-Expose-Headers`（可选）；允许前端 JS 访问的响应头（默认只能拿到 6 个基础头）。

``` node
Access-Control-Expose-Headers: Content-Length, X-Custom-Header
```

## 预检请求

预检请求就是浏览器在发送**真正的跨域请求之前**，先自动发一个 `OPTIONS` 请求去"问"服务器：_"我接下来想用 XX 方法、带 XX 头访问你，你允许吗？"_ 服务器同意了，浏览器才发真正的请求。**预检请求的主要目的是确保跨域请求的安全性。**

> 发送**预检请求**条件：

- 自定义请求方法：当使用**非简单请求方法**（Simple Request Methods）时，例如 PUT、DELETE、CONNECT、OPTIONS、TRACE、PATCH 等，浏览器会发送预检请求。简单请求方法：`GET`、`HEAD`、`POST`。

- 自定义**请求头**部字段：当请求包含自定义的头部字段时，浏览器会发送预检请求。自定义头部字段是指不属于简单请求头部字段列表的字段，例如 Content-Type 为 application/json、Authorization 等。

	* `application/x-www-form-urlencoded`
    
	- `multipart/form-data`
    
	- `text/plain`

- 带凭证的请求：当请求需要在跨域环境下发送和接收凭证（例如包含 cookies、HTTP 认证等凭证信息）时，浏览器会发送预检请求。

# events

Node.js 核心 API 都是采用异步事件驱动架构

Nodejs 事件模型采用了**发布订阅设计模式**

``` node
const EventEmitter = require('events');

const event = new EventEmitter()
//监听test
event.on('test',(data)=>{
    console.log(data)
})

event.emit('test','xmxmxmxmx') //派发事件
```

监听的消息数量默认是 10 个

``` node
const EventEmitter = require('events');

const event = new EventEmitter()

event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})
event.on('test', (data) => {
    console.log(data)
})

event.on('test', (data) => {
    console.log(data)
})
event.on('test',(data)=>{
    console.log(data)
})
event.on('test',(data)=>{
    console.log(data)
})

event.emit('test', 'xmxmxmxmx')

```

setMaxListeners 传入数量，用于解除限制

```node
event.setMaxListeners(20)
```

# sse

`SSE` 是服务端单向推送技术；允许服务器主动向客户端发送事件数据。

> **注意：** **EventSource 只能发 GET 请求，且无法自定义请求头**

``` node
const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.url === "/sse") {
    // 1. 关键响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",      // 必须是这个
      "Cache-Control": "no-cache",              // 禁止缓存
      "Connection": "keep-alive",               // 保持长连接
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
    });

    // 2. 立刻先发一条，确认连接建立
    res.write("data: connected\n\n");

    // 3. 定时推送消息
    let count = 0;
    const timer = setInterval(() => {
      count++;
      // 格式：data: 内容 \n\n
      res.write(`data: 消息 ${count}，时间 ${Date.now()}\n\n`);

      if (count >= 10) {
        clearInterval(timer);
        res.end();
      }
    }, 1000);

    // 4. 客户端断开时清理
    req.on("close", () => {
      clearInterval(timer);
      console.log("客户端断开连接");
    });
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("start http://127.0.0.1:3000");
});
```

> **SSE 数据格式：** 

1. 每行以 `data:` 开头，后面跟内容
    
2. **结尾必须有两个换行符 `\n\n`**（一个空行表示"一条消息结束"）

> **自定义事件名：**

``` node
response.write("event: test\n");  // 自定义事件名
response.write("data: " + new Date().getTime() + "\n\n");

//---------
// 前端监听即可
const sse = new EventSource("http://localhost:3000/sse");
      sse.addEventListener("test", (event) => {
        console.log(event.data);
      });
```

# libuv

> **是什么？**

`libuv` 是一个**跨平台**的 **C 语言异步 I/O 库**，**用非阻塞的方式处理大量并发 I/O**，同时保持跨平台。

> **异步 I/O：**

- libuv 实现了 Node.js 的`事件循环机制`，负责管理事件的调度和执行。

	- 事件循环是 Node.js 的核心机制，它使得 Node.js 能够以非阻塞的方式处理大量并发操作。

- 异步 I/O 操作：libuv 提供了一组异步 I/O 的 API，用于处理文件、网络和其他 I/O 操作。

> **跨平台：**

因为不同操作系统的异步 I/O 机制完全不同：

- **Unix/Linux/Mac**：使用 **libev**（基于 `epoll`/`kqueue` 等）
    
- **Windows**：使用 **IOCP**（I/O Completion Ports），这与 Unix 的机制截然不同
    

如果 Node.js 直接调用这些系统 API，代码里将充满 `#ifdef _WIN32` 之类的平台判断，维护成本极高。

libuv 作为“平台抽象层”，**把所有平台差异封装在库内部**，对外暴露一套统一的 API（如 `uv_tcp_t`、`uv_fs_read`）。

## 事件循环


> 事件循环的执行阶段：

```text
┌───────────────────────────┐
│           timers          │
└─────────────┬─────────────┘
              │
              v
   ┌───────────────────────────┐
┌─>│     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤           timers          │
   └───────────────────────────┘
```

每个阶段都有一个 **FIFO 回调队列**，Node 会执行该队列里的回调，直到队列空或达到系统限制，然后进入下一阶段。

### timers 阶段

处理 `setTimeout()` 和 `setInterval()` 的回调。

> **注意：** `setTimeout(fn, 0)` 并不是立即执行，而是**最早在下一轮 timers 阶段**执行。

### pending callbacks 阶段

处理上一轮循环中被**推迟**的系统级回调。

例如：TCP 连接错误。这些回调通常不是用户直接注册的，而是底层 I/O 操作完成后，操作系统报告的错误信息。

### idle, prepare 阶段

Node.js **内部使用**，和 `pending callbacks` 一样，无需关心。

### poll 阶段

`poll` 轮询阶段，用于处理 I/O 相关回调。例如：文件的读写、网络请求数据的到达、新连接建立。

> **这个阶段的行为分两种情况**：

**情况 A：poll 队列不为空**

- 依次同步执行队列里的回调，直到队列清空或达到系统上限。
    

**情况 B：poll 队列为空**

- 检查有没有 `setImmediate()` 待执行：
    
    - **有** → 结束 poll 阶段，进入 `check` 阶段
        
    - **没有** → 检查有没有到期的 timers：
        
        - **有** → 回到 `timers` 阶段
            
        - **没有** → **阻塞在这里等待**，直到有新的 I/O 事件到来

### check 阶段



---

