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

## 


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

# crypto

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

