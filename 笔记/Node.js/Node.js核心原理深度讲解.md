## Node.js 核心原理深度讲解

> 本文深入解释 V8、libuv、Event Loop、非阻塞 I/O、Stream、Buffer、process、文件系统、TCP 和 HTTP。  
> 参考 Node.js 官方文档与 libuv 官方文档：  
> - <https://nodejs.org/api/>  
> - <https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/>  
> - <https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/>  
> - <https://docs.libuv.org/en/v1.x/design.html>

## 1. 先建立一张总图

Node.js 不是“只有一个 JS 引擎”。它更像一个组合运行时：

```text
你的 JavaScript 代码
  |
  | import fs/http/net/stream/process
  v
Node.js 标准库 JS 层
  |
  | internal bindings
  v
Node.js C++ 层
  |
  | 调用 V8 / libuv / OpenSSL / zlib / c-ares / nghttp2 等
  v
操作系统
  |
  | 文件、网络、进程、线程、定时器、DNS、加密能力
  v
硬件资源
```

几个关键词的分工：

- V8：执行 JavaScript，管理调用栈、堆内存、垃圾回收、JIT 编译。
- libuv：提供事件循环、跨平台异步 I/O、线程池、TCP/UDP、文件系统、子进程等底层能力。
- Event Loop：调度异步任务的完成回调，让单个 JS 主线程可以处理大量并发 I/O。
- Node.js 标准库：把底层能力包装成 JS API，例如 `fs`、`http`、`net`、`stream`。
- 操作系统：真正执行文件读写、网络收发、进程调度等事情。

一句话理解：

```text
V8 负责“跑 JS”，libuv 负责“等 I/O”，Node.js 负责“把两者粘起来并暴露 API”。
```

## 2. V8：JavaScript 是怎么被执行的

V8 是 Google 开源的 JavaScript 引擎，Chrome 和 Node.js 都使用它。V8 本身不认识 `fs.readFile()`、`http.createServer()` 这些 Node.js API。它只负责 JavaScript 语言层面的事情。

V8 主要负责：

- 解析 JavaScript 源码。
- 生成抽象语法树 AST。
- 编译为字节码。
- 执行字节码。
- 对热点代码做 JIT 优化。
- 管理堆内存。
- 执行垃圾回收。
- 提供调用栈和异常机制。

### 2.1 一段 JS 的执行流程

```text
源码
  |
  v
词法分析 / 语法分析
  |
  v
AST
  |
  v
Ignition 解释器生成字节码
  |
  v
执行字节码
  |
  v
热点代码进入 TurboFan 优化编译器
  |
  v
优化后的机器码
```

你不用记住每个内部组件名，但要理解这个核心事实：

```text
JavaScript 不是简单逐行解释执行。现代 V8 会解释、收集类型反馈、优化热点代码，也可能在假设失效时反优化。
```

### 2.2 调用栈

V8 执行同步 JS 时依赖调用栈。

```js
function c() {
  console.log('c');
}

function b() {
  c();
}

function a() {
  b();
}

a();
```

调用栈变化：

```text
push a
push b
push c
执行 console.log
pop c
pop b
pop a
```

如果递归太深：

```js
function loop() {
  loop();
}

loop();
```

会报：

```text
RangeError: Maximum call stack size exceeded
```

这说明同步函数调用不是无限的，调用栈有上限。

### 2.3 堆内存与垃圾回收

对象、数组、函数闭包等通常分配在堆上。

```js
function createUser() {
  return {
    name: 'Alice',
    profile: {
      age: 20
    }
  };
}

const user = createUser();
```

只要对象仍然可达，V8 就不会回收它。不可达对象会在未来某次 GC 中被回收。

内存泄漏通常不是“GC 不工作”，而是你的代码仍然保留了引用。

```js
const cache = new Map();

export function handleRequest(req) {
  cache.set(req.id, req);
}
```

如果 `cache` 永远不删除旧请求，请求对象就一直可达，GC 不能回收。

### 2.4 V8 不负责 I/O

这点非常重要：

```js
import { readFile } from 'node:fs/promises';

const text = await readFile('./a.txt', 'utf8');
```

V8 不会亲自去硬盘读文件。真实流程更接近：

```text
V8 执行 JS
  |
  v
调用 Node.js 的 fs API
  |
  v
Node.js C++ binding
  |
  v
libuv 把文件任务交给线程池
  |
  v
操作系统执行文件读取
  |
  v
完成后通知事件循环
  |
  v
V8 执行 Promise 后续回调
```

## 3. libuv：Node.js 异步能力的底座

libuv 是一个 C 语言跨平台库。它最初为 Node.js 开发，目标是把不同操作系统的异步 I/O 能力统一包装。

libuv 提供：

- 事件循环。
- TCP/UDP 网络。
- 非阻塞 socket。
- 定时器。
- 异步文件系统。
- DNS。
- 子进程。
- 信号。
- 线程池。

### 3.1 为什么需要 libuv

不同系统的异步 I/O 接口不一样：

```text
Linux: epoll
macOS / BSD: kqueue
Windows: IOCP
Solaris: event ports
```

如果 Node.js 直接面对这些系统 API，跨平台会非常复杂。libuv 做了一层统一抽象：

```text
Node.js
  |
  v
libuv
  |
  +-- Linux epoll
  +-- macOS kqueue
  +-- Windows IOCP
  +-- 其他系统机制
```

所以同一段 Node.js 代码可以在 Windows、macOS、Linux 上运行。

### 3.2 libuv 的两种异步来源

很多人误以为“Node.js 所有异步任务都在线程池里执行”。这是不准确的。

Node.js 异步任务大致分两类：

```text
网络 I/O
  通常使用操作系统的非阻塞 socket + I/O 多路复用
  不需要为每个连接占用一个线程

文件系统、部分 DNS、部分 crypto、zlib
  很多情况下使用 libuv 线程池
  因为文件系统在不少平台上没有统一好用的真正异步接口
```

默认 libuv 线程池大小通常是 4，可以通过环境变量调整：

```bash
UV_THREADPOOL_SIZE=8 node app.js
```

适合受线程池影响的任务：

- `fs` 部分异步 API。
- `crypto.pbkdf2()`、`crypto.scrypt()`。
- `zlib` 压缩解压。
- 部分 DNS 查询。

不适合认为“线程池越大越好”。线程过多会增加上下文切换和内存开销。

### 3.3 libuv 与 V8 的关系

```text
V8:
  我只执行 JS。

libuv:
  我只管理事件循环、I/O 和系统任务。

Node.js:
  我负责让 JS 代码能调用底层 I/O，并在 I/O 完成后把回调交回给 V8 执行。
```

## 4. Event Loop：异步回调是怎么被调度的

Event Loop 是 Node.js 的心脏。它让 Node.js 能够在一个主 JS 线程上处理大量并发 I/O。

核心思想：

```text
不要阻塞等待 I/O。
把 I/O 发出去。
等 I/O 完成后，把回调放到合适的队列。
事件循环不断取出可执行回调，让 V8 执行。
```

### 4.1 Node.js 事件循环阶段

经典阶段：

```text
timers
  执行 setTimeout / setInterval 到期回调

pending callbacks
  执行部分系统操作延迟到下一轮的回调

idle, prepare
  Node.js 内部使用

poll
  等待和处理 I/O 事件

check
  执行 setImmediate 回调

close callbacks
  执行 socket close 等关闭回调
```

简化图：

```text
┌───────────────┐
│ timers        │
└───────┬───────┘
        v
┌───────────────┐
│ pending       │
└───────┬───────┘
        v
┌───────────────┐
│ poll          │  等 I/O、处理 I/O
└───────┬───────┘
        v
┌───────────────┐
│ check         │  setImmediate
└───────┬───────┘
        v
┌───────────────┐
│ close         │
└───────────────┘
```

### 4.2 微任务：Promise 和 process.nextTick

除了事件循环阶段，还有微任务队列：

- Promise microtask。
- `queueMicrotask()`。
- `process.nextTick()`。

一般理解：

```text
当前同步代码执行完
  |
  v
先处理 nextTick 队列
  |
  v
再处理 Promise 微任务队列
  |
  v
进入或继续事件循环阶段
```

实验：

```js
console.log('sync');

setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});
```

常见输出：

```text
sync
nextTick
promise
timeout 或 immediate
immediate 或 timeout
```

`setTimeout(..., 0)` 和 `setImmediate()` 在主模块中谁先执行并不总是直觉上固定，受进入事件循环时机影响。但在 I/O 回调里，`setImmediate()` 通常先于 `setTimeout(..., 0)`。

```js
import { readFile } from 'node:fs';

readFile(import.meta.filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
```

在 I/O 回调中常见输出：

```text
immediate
timeout
```

### 4.3 为什么 nextTick 要谨慎

`process.nextTick()` 会在事件循环继续前执行。如果递归塞 nextTick，可能饿死 I/O。

```js
function loop() {
  process.nextTick(loop);
}

loop();

setTimeout(() => {
  console.log('永远很难执行到');
}, 1000);
```

这段代码会让事件循环没有机会进入 timers 和 poll 阶段。实际项目中不要滥用 `nextTick`。

## 5. 非阻塞 I/O：到底“不阻塞”了谁

非阻塞 I/O 容易被误解。它不是说“操作不耗时”，也不是说“没有线程参与”，更不是说“CPU 不工作”。

准确理解：

```text
非阻塞 I/O 指 JS 主线程不会停在原地等待 I/O 完成。
```

### 5.1 阻塞版本

```js
import { readFileSync } from 'node:fs';

console.log('A');
const text = readFileSync('./large.txt', 'utf8');
console.log(text.length);
console.log('B');
```

流程：

```text
执行 A
同步读取文件，JS 主线程等待
读取完成
输出长度
执行 B
```

在文件读取期间，主线程不能处理别的 JS 回调。

### 5.2 非阻塞版本

```js
import { readFile } from 'node:fs/promises';

console.log('A');

const promise = readFile('./large.txt', 'utf8');

console.log('B');

const text = await promise;
console.log(text.length);
```

流程：

```text
执行 A
发起文件读取任务
不等待，继续执行 B
当前 async 函数在 await 处暂停
文件读取完成后，Promise 恢复执行
输出长度
```

注意：文件仍然要读，磁盘仍然要工作。只是 JS 主线程没有一直卡在那儿。

### 5.3 网络 I/O 为什么特别适合 Node.js

网络请求的大部分时间都在等待：

```text
客户端发请求
  |
网络传输等待
  |
服务器处理
  |
网络传输等待
  |
客户端收到响应
```

等待期间 CPU 不应该空转，也不应该占着主线程。Node.js 可以把大量 socket 注册给操作系统，等某个 socket 可读或可写时再回来处理。

传统“一连接一线程”模型：

```text
10000 个连接 -> 可能需要大量线程 -> 内存和上下文切换成本高
```

Node.js 事件驱动模型：

```text
10000 个连接 -> 注册到事件循环/OS 多路复用 -> 少量线程处理大量等待型连接
```

这就是 Node.js 擅长高并发 I/O 的原因。

### 5.4 非阻塞不等于不会阻塞

这段代码会阻塞：

```js
const start = Date.now();

while (Date.now() - start < 5000) {
  // CPU 忙等 5 秒
}

console.log('done');
```

这不是 I/O，而是 CPU 长时间占用主线程。事件循环无法调度其他回调。

同样危险的操作：

- 超大 JSON.parse。
- 超大数组排序。
- 复杂正则回溯。
- 同步压缩。
- 同步加密。
- 大量同步文件操作。

## 6. Buffer：二进制数据的容器

JavaScript 原生字符串适合文本，不适合直接表达网络包、图片、文件块、加密摘要这类二进制数据。Node.js 用 `Buffer` 处理字节。

### 6.1 Buffer 是什么

```js
const buffer = Buffer.from('Node.js', 'utf8');

console.log(buffer);
console.log(buffer.length);
console.log(buffer.toString('utf8'));
```

输出类似：

```text
<Buffer 4e 6f 64 65 2e 6a 73>
7
Node.js
```

`Buffer.length` 是字节数。

```js
const text = '你好';
const buffer = Buffer.from(text, 'utf8');

console.log(text.length);
console.log(buffer.length);
```

可能输出：

```text
2
6
```

因为一个中文字符在 UTF-8 中通常占 3 个字节。

### 6.2 Buffer 与编码

同一段字节，用不同编码解释会得到不同结果。

```js
const buffer = Buffer.from([0xe4, 0xbd, 0xa0]);

console.log(buffer.toString('utf8'));
console.log(buffer.toString('hex'));
console.log(buffer.toString('base64'));
```

常见编码：

- `utf8`：文本。
- `hex`：十六进制，常用于哈希、调试。
- `base64`：把二进制变成可传输文本，常用于图片、token。

### 6.3 Buffer 与内存

`Buffer.alloc()` 会初始化内存：

```js
const safe = Buffer.alloc(10);
console.log(safe);
```

`Buffer.allocUnsafe()` 可能更快，但内容未初始化：

```js
const unsafe = Buffer.allocUnsafe(10);
console.log(unsafe);
```

除非非常确定性能需求和覆盖写入逻辑，否则优先使用 `Buffer.alloc()`。

## 7. Stream：流式处理的核心

Stream 是 Node.js 最重要的抽象之一。文件、网络、HTTP 请求、HTTP 响应、压缩、加密都大量使用流。

### 7.1 为什么需要 Stream

假设一个文件 5GB：

```js
import { readFile } from 'node:fs/promises';

const data = await readFile('./big.log');
```

这会尝试把整个文件读入内存。更好的方式是分块处理：

```js
import { createReadStream } from 'node:fs';

const stream = createReadStream('./big.log', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024
});

for await (const chunk of stream) {
  console.log('chunk size:', chunk.length);
}
```

Stream 的核心价值：

```text
边读边处理，边处理边写出，不把全部数据放进内存。
```

### 7.2 四种流

```text
Readable
  数据来源，例如 fs.createReadStream、HTTP 请求体

Writable
  数据去处，例如 fs.createWriteStream、HTTP 响应体

Duplex
  既能读也能写，例如 TCP socket

Transform
  读入数据，转换后写出，例如 gzip、加密、大小写转换
```

### 7.3 pipeline

不要手动用一堆 `.pipe()` 忽略错误，推荐使用 `pipeline`。

```js
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('./access.log'),
  createGzip(),
  createWriteStream('./access.log.gz')
);
```

流程：

```text
文件读取流 -> gzip 转换流 -> 文件写入流
```

`pipeline` 的好处：

- 自动转发错误。
- 自动处理关闭。
- 支持 Promise。
- 处理背压。

### 7.4 背压

背压是理解 Stream 的关键。

```text
Readable 生产数据太快
Writable 消费数据太慢
如果不控制速度，内存会越积越多
```

Node.js 用 `highWaterMark` 和 `.write()` 返回值协调速度。

手动理解：

```js
const canContinue = writable.write(chunk);

if (!canContinue) {
  await once(writable, 'drain');
}
```

真实项目优先用 `pipeline`，它会帮你处理这些细节。

### 7.5 HTTP 请求和响应也是流

```js
import { createServer } from 'node:http';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    await pipeline(req, createWriteStream('./upload.bin'));
    res.end('uploaded');
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
}).listen(3000);
```

`req` 是 Readable，`res` 是 Writable。

## 8. process：当前进程的控制面板

`process` 是 Node.js 暴露的全局对象，代表当前操作系统进程。

### 8.1 进程信息

```js
console.log(process.pid);
console.log(process.ppid);
console.log(process.platform);
console.log(process.arch);
console.log(process.version);
console.log(process.versions);
console.log(process.cwd());
```

这些信息用于：

- 日志定位。
- 环境差异判断。
- 诊断运行时版本。
- 生成进程健康信息。

### 8.2 argv 与 env

```js
console.log(process.argv);
console.log(process.env.NODE_ENV);
```

命令：

```bash
NODE_ENV=production node app.js --port 3000
```

`process.argv` 包含命令行参数，`process.env` 包含环境变量。

### 8.3 stdin、stdout、stderr

```js
process.stdout.write('正常输出\n');
process.stderr.write('错误输出\n');
```

这三个对象本质上也是流：

- `process.stdin`：Readable。
- `process.stdout`：Writable。
- `process.stderr`：Writable。

实现一个简单 echo：

```js
process.stdin.setEncoding('utf8');

for await (const chunk of process.stdin) {
  process.stdout.write(`你输入了: ${chunk}`);
}
```

### 8.4 退出码

```js
process.exitCode = 1;
```

一般优先设置 `exitCode`，让进程自然退出。`process.exit()` 会立刻退出，可能导致异步日志或未完成写入丢失。

### 8.5 信号与优雅退出

```js
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM，开始清理');
  await closeDatabase();
  process.exit(0);
});
```

常见信号：

- `SIGINT`：通常来自 Ctrl+C。
- `SIGTERM`：常用于容器、进程管理器请求进程结束。

生产服务收到信号后应：

1. 停止接收新请求。
2. 等待正在处理的请求完成。
3. 关闭数据库、队列、文件句柄。
4. 退出进程。

## 9. 文件系统 fs：为什么文件 I/O 特殊

Node.js 文件系统 API 分三类：

```text
同步 API
  readFileSync / writeFileSync

回调 API
  readFile / writeFile

Promise API
  fs/promises
```

现代业务代码优先使用 `node:fs/promises`。

### 9.1 同步文件读取

```js
import { readFileSync } from 'node:fs';

const config = readFileSync('./config.json', 'utf8');
```

适用场景：

- 程序启动阶段读取少量配置。
- CLI 短脚本。
- 构建脚本。

不适合：

- Web 服务请求处理路径。
- 高频逻辑。

### 9.2 异步文件读取

```js
import { readFile } from 'node:fs/promises';

const config = await readFile('./config.json', 'utf8');
```

文件系统异步 API 在很多情况下会走 libuv 线程池。也就是说：

```text
JS 主线程不等文件读取
libuv 在线程池里执行或协调文件任务
完成后把结果交回事件循环
```

### 9.3 文件描述符

更底层的文件操作会涉及 file descriptor。

```js
import { open } from 'node:fs/promises';

const file = await open('./data.txt', 'r');

try {
  const buffer = Buffer.alloc(16);
  const result = await file.read(buffer, 0, buffer.length, 0);
  console.log(result.bytesRead);
  console.log(buffer.toString('utf8', 0, result.bytesRead));
} finally {
  await file.close();
}
```

文件描述符是操作系统用来标识打开文件的数字句柄。打开后一定要关闭，否则可能造成资源泄漏。

### 9.4 监听文件变化

```js
import { watch } from 'node:fs';

const watcher = watch('./config.json', (eventType, filename) => {
  console.log(eventType, filename);
});

process.on('SIGINT', () => {
  watcher.close();
});
```

文件监听在不同操作系统上语义不完全一致。生产中做复杂监听通常使用更成熟的库或构建工具内部能力。

## 10. TCP：HTTP 下面的传输层

HTTP 是应用层协议，TCP 是传输层协议。Node.js 的 `node:net` 模块可以直接创建 TCP 服务。

### 10.1 TCP 的核心特点

TCP 提供：

- 面向连接。
- 可靠传输。
- 有序字节流。
- 流量控制。
- 拥塞控制。

注意“字节流”这个词。TCP 不保留消息边界。

```text
客户端 write("hello")
客户端 write("world")

服务端可能收到：
  "helloworld"
也可能收到：
  "hel"
  "loworld"
```

所以应用层协议必须自己定义消息边界，例如：

- 固定长度。
- 分隔符。
- length prefix。
- HTTP 的 Content-Length / chunked。

### 10.2 TCP Echo Server

```js
import { createServer } from 'node:net';

const server = createServer((socket) => {
  console.log('client connected', socket.remoteAddress, socket.remotePort);

  socket.setEncoding('utf8');

  socket.on('data', (chunk) => {
    console.log('received:', chunk);
    socket.write(`echo: ${chunk}`);
  });

  socket.on('end', () => {
    console.log('client disconnected');
  });

  socket.on('error', (error) => {
    console.error('socket error:', error.message);
  });
});

server.listen(4000, () => {
  console.log('TCP server listening on 4000');
});
```

测试：

```bash
telnet localhost 4000
```

或：

```bash
nc localhost 4000
```

### 10.3 socket 是 Duplex Stream

TCP socket 既能读，也能写：

```text
socket readable side  <- 接收对端数据
socket writable side  -> 发送数据给对端
```

所以它是 Duplex Stream。

### 10.4 TCP 与非阻塞 I/O

Node.js 不会为每个 socket 创建一个 JS 线程。它把 socket 设置为非阻塞，并交给系统多路复用机制：

```text
多个 socket
  |
  v
OS poller(epoll/kqueue/IOCP)
  |
  v
哪个 socket 可读/可写，通知 libuv
  |
  v
事件循环调度 JS 回调
```

这就是 Node.js 能处理大量长连接的基础。

## 11. HTTP：基于 TCP 的应用层协议

HTTP 在 Node.js 中由 `node:http` 模块实现。HTTP 服务的底层仍然依赖 TCP socket，但 Node.js 帮你解析请求行、请求头、请求体，并提供 `req` 和 `res` 对象。

### 11.1 HTTP 请求结构

一个原始 HTTP 请求大概长这样：

```http
POST /users?active=true HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 16

{"name":"Alice"}
```

组成：

- 请求行：方法、路径、协议版本。
- 请求头：元信息。
- 空行：分隔头和体。
- 请求体：可选。

### 11.2 Node.js HTTP Server

```js
import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  console.log(req.method);
  console.log(url.pathname);
  console.log(req.headers);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000);
```

`req` 是 `http.IncomingMessage`，本质是 Readable Stream。  
`res` 是 `http.ServerResponse`，本质是 Writable Stream。

### 11.3 请求体为什么要异步读取

请求头可能先到，请求体可能分多块到达。不能假设一次就拿到完整 body。

```js
async function readBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
```

JSON 解析：

```js
async function readJson(req) {
  const buffer = await readBody(req);
  return JSON.parse(buffer.toString('utf8') || '{}');
}
```

### 11.4 响应也是流

```js
res.write('hello ');
res.write('world');
res.end();
```

下载大文件：

```js
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { pipeline } from 'node:stream/promises';

createServer(async (req, res) => {
  if (req.url === '/download') {
    res.setHeader('Content-Type', 'application/octet-stream');
    await pipeline(createReadStream('./big.zip'), res);
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
}).listen(3000);
```

这不会把整个 `big.zip` 一次性读入内存。

### 11.5 Keep-Alive

HTTP/1.1 默认支持连接复用。一个 TCP 连接可以承载多个 HTTP 请求，减少反复建立连接的成本。

```text
TCP connect
  request 1 -> response 1
  request 2 -> response 2
  request 3 -> response 3
TCP close
```

服务端要正确处理：

- 请求超时。
- 空闲连接超时。
- 最大请求头大小。
- body 大小限制。
- 慢请求攻击。

### 11.6 HTTP 到业务代码的完整流程

```text
客户端发起 HTTP 请求
  |
  v
TCP 包到达操作系统
  |
  v
socket 变为可读
  |
  v
libuv poll 阶段收到 I/O 事件
  |
  v
Node.js HTTP parser 解析请求
  |
  v
触发 request 回调，生成 req/res
  |
  v
你的 JS 代码处理路由和业务
  |
  v
res.write / res.end 写响应
  |
  v
Node.js 写入 socket
  |
  v
TCP 发回客户端
```

## 12. 把所有概念串起来：一次文件下载请求

代码：

```js
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { pipeline } from 'node:stream/promises';

createServer(async (req, res) => {
  if (req.url !== '/file') {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  await pipeline(createReadStream('./video.mp4'), res);
}).listen(3000);
```

运行流程：

```text
1. V8 执行 createServer 代码。
2. Node.js 通过 libuv 创建 TCP server socket。
3. 客户端连接，socket 可读。
4. libuv 在 poll 阶段拿到网络事件。
5. Node.js 解析 HTTP 请求，调用你的 request handler。
6. 你的代码创建文件 ReadStream。
7. 文件读取任务由 fs/stream/libuv 协作完成。
8. 每读到一块 Buffer，就写入 HTTP response。
9. response 底层写入 TCP socket。
10. 如果客户端接收慢，Stream 背压让读取速度降下来。
11. 文件读完，res 结束，HTTP 响应完成。
```

这段代码背后同时涉及：

- V8：执行 JS 回调。
- libuv：事件循环、网络 I/O、文件 I/O。
- Event Loop：调度请求、文件、写入完成回调。
- Buffer：承载文件块。
- Stream：分块读取和写出。
- TCP：传输字节流。
- HTTP：定义请求响应语义。
- process：承载整个服务进程。

## 13. 常见误区

### 13.1 Node.js 是单线程的？

更准确：

```text
Node.js 默认用一个主线程执行 JavaScript。
但 Node.js 进程内部还有 libuv 线程池、V8 后台线程、系统线程等。
```

所以“单线程”只适合描述 JS 执行模型，不适合描述整个进程。

### 13.2 异步就是多线程？

不一定。

网络 I/O 通常依赖操作系统非阻塞能力和事件通知，不是每个请求一个线程。  
文件 I/O、crypto、zlib 等部分任务可能走 libuv 线程池。

### 13.3 await 会阻塞线程？

`await` 会暂停当前 async 函数后续执行，但不会阻塞整个 JS 主线程。

```js
await readFile('./a.txt');
```

在等待文件时，事件循环仍然可以处理其他回调。

### 13.4 Stream 一定比 readFile 快？

不一定。小文件用 `readFile` 更简单，性能也足够。Stream 的主要价值是：

- 控制内存。
- 支持边读边处理。
- 支持背压。
- 支持长连接和大数据。

### 13.5 Buffer 是字符串？

不是。Buffer 是字节数组。字符串是按编码解释后的文本。

## 14. 建议你亲手做的实验

### 实验 1：阻塞事件循环

```js
setInterval(() => {
  console.log('tick', Date.now());
}, 1000);

const start = Date.now();
while (Date.now() - start < 5000) {}
```

观察 `tick` 会被延迟。

### 实验 2：异步文件不阻塞主线程

```js
import { readFile } from 'node:fs/promises';

setInterval(() => {
  console.log('tick');
}, 1000);

await readFile('./big-file.bin');
console.log('file done');
```

读取期间 `tick` 仍然可能继续输出。

### 实验 3：Stream 控制内存

分别用 `readFile` 和 `createReadStream` 读取大文件，对比内存。

```js
setInterval(() => {
  console.log(process.memoryUsage().rss / 1024 / 1024, 'MB');
}, 1000);
```

### 实验 4：TCP 没有消息边界

客户端连续写多次：

```js
socket.write('hello');
socket.write('world');
```

服务端观察 `data` 事件收到的 chunk，理解 TCP 是字节流。

## 15. 最后用一句话总结

Node.js 的本质不是“JavaScript 很快”，而是：

```text
用 V8 快速执行 JS，用 libuv 高效等待 I/O，用事件循环调度回调，用 Stream 和 Buffer 处理数据流，用 TCP/HTTP 承接网络通信。
```

真正深入理解 Node.js，就是理解这几层如何协作，以及什么情况下你会不小心阻塞这条协作链。
