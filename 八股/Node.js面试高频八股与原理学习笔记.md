# Node.js 大厂面试高频八股 + 原理学习笔记

> 目标：用「一次请求在机器上如何完成」这条主线理解 Node.js。面试时能说清定义，更能回答**为什么这样设计、在什么情况下失效、如何验证与取舍**。

## 0. 知识地图与推荐顺序

Node.js 不是“JavaScript 的服务端版本”，而是一个把 V8、C/C++ 绑定、libuv 和操作系统能力组装在一起的运行时。最有用的心智模型如下：

```text
业务代码 / Express · Koa · Nest
          │
 JavaScript API（fs / net / http / stream / process）
          │  N-API、内建模块绑定
Node.js Runtime ── V8（执行 JS、GC、JIT、微任务）
          │
 libuv（事件循环、跨平台 I/O、线程池）
          │
OS（epoll/kqueue/IOCP、文件系统、TCP/IP、调度器）
          │
网卡、磁盘、DNS、远端服务
```

### 学习路线（按依赖关系）

1. **运行时全景**：主线程究竟在跑什么；V8、Node、libuv、OS 各自负责什么。
2. **事件循环与任务排序**：同步代码、`nextTick`、Promise 微任务、timer、I/O 回调如何交错。
3. **异步 I/O 与线程池**：网络 I/O 为什么通常不占线程；文件、DNS、加密为什么会占线程池。
4. **二进制数据与流**：Buffer 为什么存在；背压如何让慢消费者不压垮内存。
5. **网络协议栈**：TCP 建连/关闭、Socket；HTTP 解析、keep-alive、HTTPS/TLS。
6. **模块与进程模型**：CJS/ESM 加载、缓存与循环依赖；`process`、Worker、Cluster 的边界。
7. **可靠性**：异常、Promise rejection、取消、超时、优雅退出、可观测性。
8. **性能与内存**：V8 堆、GC、泄漏定位、CPU/事件循环/线程池三类瓶颈。
9. **框架解构**：Express 中间件链、Koa 洋葱模型、Nest DI/管线如何落到原生 HTTP。

建议每章都做一件事：运行示例、用 `node --trace-gc` / `--inspect` 或压测观察，再回答末尾面试题。不要一开始钻源码；先建立跨层流程，再按问题下潜。

---

# 第一章：Node.js Runtime —— 一段 JS 如何变成系统调用

## 1.1 是什么

Node.js 是基于 V8 的 JavaScript 运行时，不是浏览器，也不是只有 V8。它提供模块加载、标准库、事件循环、异步 I/O、进程控制等宿主能力。JS 的语法与对象语义主要由 V8 执行；`fs.readFile`、网络监听等能力由 Node 的 C++ 绑定和 libuv 接到操作系统。

## 1.2 为什么是这个组合

服务器大量时间在等待磁盘、网络、数据库，而不是算 CPU。若每条连接都分配一个阻塞线程，线程栈、上下文切换和同步成本会迅速扩大。Node 选择：

- 用**一个 JS 事件循环线程**编排大量等待中的连接；
- 将可由 OS 通知完成的 I/O 注册为事件；
- 将不能良好异步化的工作交给有限的 libuv 工作线程；
- 让同一语言覆盖浏览器与服务端，提高全栈协作效率。

这不等于 Node 是“单线程服务器”：JS 回调默认在单一主线程串行执行，但内核、libuv 线程池、子进程、Worker Threads 都可并行。

## 1.3 启动与执行流程

```text
node app.js
  → 初始化 V8 Isolate（独立 JS 堆/GC）与 Context（全局环境）
  → 初始化 Node 内建模块、process、libuv loop
  → 加载入口模块并执行顶层同步代码
  → 顶层调用注册 timer / I/O watcher / server listener
  → 同步栈清空后，反复驱动 libuv event loop
  → 事件完成：进入 JS 回调；回调中继续注册异步工作
  → 没有活跃 handle/request 时，进程自然退出
```

`setTimeout`、监听中的 server、未完成的 `fs` 请求都会让事件循环保持存活；单纯一个未被任何活跃任务引用的 Promise 不会。

## 1.4 V8、Node、libuv 的职责边界

| 层 | 核心职责 | 典型例子 |
| --- | --- | --- |
| V8 | 解析/解释/JIT JS、对象堆、GC、Promise 微任务队列 | `Promise.then`、对象分配 |
| Node C++ 层 | JS API、模块系统、C++ 绑定、错误对象/回调桥接 | `require('fs')` |
| libuv | event loop、跨平台 socket watcher、timer、工作队列/线程池 | `uv_poll_t`、`uv_fs_*` |
| OS | socket、页缓存、协议栈、文件系统、线程调度、I/O 多路复用 | Linux epoll、Windows IOCP |

## 1.5 容易误解

- **“Node 异步，所以不会阻塞”错误。** 同步 JS、同步 `fs`、巨量 JSON 序列化、正则灾难性回溯都会阻塞主线程，期间所有连接的 JS 回调都不能执行。
- **“V8 就是 Node”错误。** V8 没有 `fs`、HTTP server 和 `process`；浏览器 API 也不是 V8 自带。
- **“Node 只能用一个 CPU 核”不完整。** 单个 JS event loop 通常只能有效跑一个核，但可用 cluster、多进程或 Workers 横向利用多核。

## 1.6 面试快速答

**问：Node.js 的单线程体现在哪里？**

答：默认一个 Isolate 上的 JS 执行和回调是单线程串行的，避免了共享 JS 状态的锁竞争；I/O 等待由内核事件机制处理，文件/部分 DNS/加密等工作可在线程池运行。因此不能在主线程做长 CPU 计算。

**追问：`setTimeout` 的回调是谁执行的？**

计时由 libuv 管理；到期后回调被安排回事件循环，最终仍由 JS 主线程执行，并非计时线程直接运行 JS。

---

# 第二章：Event Loop —— 回调为何不是“立刻”执行

## 2.1 核心：执行栈、队列与一次 tick

同步代码先完整执行。异步 API 只负责注册未来工作；完成后回调才有资格在 event loop 的合适阶段执行。Node 的 loop 通常可理解为：

```text
timers → pending callbacks → idle/prepare → poll(I/O) → check → close callbacks
             每次从 JS 回调返回时：先清空 nextTick 队列，再清空 Promise 微任务队列
```

- **timers**：执行已到期的 `setTimeout` / `setInterval`；它表示“不早于该时间”，不是精确时钟。
- **poll**：取出多数 I/O 回调；空闲时可能在此阻塞等待 I/O。
- **check**：`setImmediate` 回调。
- **close callbacks**：如 socket 的 `'close'`。
- `process.nextTick` 是 Node 特有的高优先级队列；Promise 的 `.then`/`queueMicrotask` 是 V8 微任务。

### 观察顺序

```js
const fs = require('node:fs');

setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('I/O timeout'), 0);
  setImmediate(() => console.log('I/O immediate'));
});
```

稳定部分是 `sync → nextTick → promise`。顶层 `timeout` 与 `immediate` 的先后不应作为业务假设，受启动时机影响；在 I/O 回调中，`I/O immediate` 通常先于下一轮 timers 的 `I/O timeout`，因为当前轮先经过 poll 再到 check。

## 2.2 为什么 `nextTick` 要谨慎

它设计给“当前操作结束后、让 I/O 有机会发生前”的兼容性与 API 时序需求。例如确保回调永远异步，避免 Zalgo（同一 API 有时同步有时异步）：

```js
function getCached(key, cb) {
  if (cache.has(key)) return process.nextTick(cb, null, cache.get(key));
  load(key, cb);
}
```

但递归排入 `nextTick` 会一直抢在 I/O 前执行，造成 I/O 饥饿：

```js
function bad() { process.nextTick(bad); }
bad(); // event loop 无法到 poll
```

大量可延后工作可考虑 `setImmediate`，将控制权还给 poll。

## 2.3 “微任务在何时清空”为什么重要

浏览器通常在一个宏任务结束后清空微任务；Node 除此之外还在 JS 回调边界处理 `nextTick` 与微任务。因此一个 I/O 回调中创建的 Promise 不必等到下一轮 I/O。顺序优先级可记成：**当前同步栈 > nextTick > Promise 微任务 > 进入下一事件循环阶段**。

Node 版本会优化 event loop 的具体 timer 行为，面试不要死背阶段细枝末节；不变的原理是：回调不能打断当前 JS 栈，微任务在回到事件循环前被耗尽，高优先级队列滥用会饿死 I/O。

## 2.4 面试快速答

**问：`setImmediate` 和 `setTimeout(fn, 0)` 有何区别？**

答：前者进入 check 阶段，后者进入 timers 且至少等到阈值到期；顶层顺序不保证。在 I/O 回调内注册时，当前 poll 后会到 check，所以 `setImmediate` 常先执行。它们都不是立即执行。

**追问：为什么 Promise 通常比 timer 早？**

Promise reaction 是 V8 微任务，当前 JS 回调返回后就在进入下一个 loop 阶段前清空；timer 要等 timers 阶段且到期。

---

# 第三章：异步 I/O 与 libuv Thread Pool

## 3.1 以 `fs.readFile` 为例的完整链路

```js
import { readFile } from 'node:fs/promises';
const text = await readFile('./config.json', 'utf8');
```

```text
JS 调用 fs/promises
 → Node C++ binding 创建 FS request
 → libuv 将阻塞文件操作排到 work queue
 → 某个工作线程执行 open/read/close（OS 可能命中页缓存）
 → 线程把“已完成”投递给 event loop
 → 主线程执行完成回调，兑现 Promise
 → await 的后续作为微任务恢复执行
```

这里“异步”是调用方不等待，不意味着物理磁盘一定异步；Unix 上普通文件并不像 socket 那样可被 epoll 普遍通知完成，因此 libuv 用工作线程把阻塞隔离出去。

## 3.2 哪些走内核事件，哪些占线程池

| 常见工作 | 主要机制 | 是否会挤占 libuv 默认线程池 |
| --- | --- | --- |
| TCP/HTTP socket 收发 | OS 非阻塞 socket + epoll/kqueue/IOCP | 通常否 |
| timer | event loop 时间管理 | 否 |
| `fs` 异步 API | libuv work queue | 是 |
| `crypto.pbkdf2`、部分 zlib | libuv work queue | 是 |
| `dns.lookup` | 通常调用系统 resolver | 是 |
| `dns.resolve` | c-ares 异步 DNS | 通常否 |

默认线程池大小通常为 4，且**整个进程共享**。可在进程启动前设 `UV_THREADPOOL_SIZE`（有上限，且不是“越大越好”）。一个重 PBKDF2 批次可能让无关的 `fs` 和 `dns.lookup` 也排队。

```js
// 必须在加载会触发相关工作前、最好由 shell 环境设置
process.env.UV_THREADPOOL_SIZE = '8';
```

生产中先用指标确认线程池排队才调参；CPU 已饱和时扩大池只会增加竞争。CPU 密集型业务宜 Worker Threads 或独立服务。

## 3.3 I/O 多路复用为何能支撑高并发

以 Linux 为例：Node 将多个非阻塞 socket 的“可读/可写/错误”兴趣注册到 epoll。一个线程在 `epoll_wait` 处睡眠；任一 socket 就绪，内核返回事件列表。主线程对每个就绪 socket 做尽可能少的读写，再继续循环。它不是同时执行多个 JS 回调，而是用一个等待点管理很多连接。

“就绪”不等于“完整业务消息到达”：TCP 是字节流，`data` 事件可能是半个 HTTP body，也可能合并多个片段，协议解析器必须分帧。

## 3.4 同步 API 的危险

```js
// 请求处理器内绝不能这样做：所有请求都会等待
const body = fs.readFileSync(file);
```

同步 API 可用于启动期读取少量配置（尚未接客），不要用于运行中热路径。

## 3.5 面试快速答

**问：异步 `fs` 会不会阻塞 Node？**

答：不会阻塞 JS event loop，但通常会占 libuv 工作线程；池满后新的文件、部分 DNS、crypto 任务会排队，表现为延迟上升。同步 fs 则直接阻塞 JS 主线程。

**追问：为何网络 I/O 通常不占四个线程？**

答：socket 可设为非阻塞并由 OS 的 I/O 多路复用报告就绪，一个 loop 可等待众多 socket；普通文件在跨平台上不适合用同样的就绪通知，libuv 才以线程池统一封装。

---

# 第四章：Buffer 与 Stream —— 性能和内存的交汇点

## 4.1 Buffer：是什么、为什么

网络包、文件和加密算法处理的是字节，不是 JS UTF-16 字符串。`Buffer` 是 Node 提供的 `Uint8Array` 子类，代表固定长度的二进制内存，适合在 JS 与 native I/O 间传递字节。

```js
const b = Buffer.from('中', 'utf8'); // <Buffer e4 b8 ad>，3 个 UTF-8 字节
console.log(b.length);              // 3，不是字符串字符数
console.log(b.toString('utf8'));    // 中
```

`Buffer.alloc(n)` 会清零，适合安全/确定性需求；`Buffer.allocUnsafe(n)` 可能拿到旧内存内容，性能较好但必须在读取前完整覆写，不能直接暴露给外部。

### 常见陷阱：slice/view 并不总是复制

`buf.subarray()`（以及 Node Buffer 的 `slice()`）通常创建对同一块底层内存的视图；修改一方会影响另一方。需要独立数据时用 `Buffer.from(view)`。这可减少拷贝，也可能让一个很小的切片意外长期引用一整块大 Buffer。

## 4.2 Stream：把“全量数据”改成“逐块传输”

流有 Readable、Writable、Duplex、Transform 四类。核心价值不是事件 API，而是**有界缓存 + 背压（backpressure）**：生产者比消费者快时暂停生产，防止内存无限堆积。

```js
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

await pipeline(
  createReadStream('large.zip'),
  createWriteStream('backup.zip'),
); // 自动传递 error，结束时 resolve；比手写 pipe 更可靠
```

## 4.3 背压的执行流程

```text
Readable 推送 chunk
 → Writable.write(chunk)
 → 内部缓冲 < highWaterMark：返回 true，继续写
 → 缓冲达到阈值：返回 false
 → 上游 pause，不再无限读
 → 下游实际写入完成、缓冲降下去，发出 drain
 → 上游 resume
```

`highWaterMark` 是缓冲阈值而非严格单块大小；对象模式按对象计数，字节模式按字节计。背压降低峰值内存，但不能让慢磁盘/慢客户端变快。

手写时必须尊重 `write()` 的返回值：

```js
for await (const chunk of source) {
  if (!destination.write(chunk)) {
    await new Promise(resolve => destination.once('drain', resolve));
  }
}
destination.end();
```

HTTP 响应 `res` 也是 Writable。向慢客户端持续 `res.write` 而忽略 `false`，是 Node 服务内存上涨的经典原因。

## 4.4 `pipe`、`pipeline` 与错误

`readable.pipe(writable)` 会建立数据和基本背压传递，但复杂链中错误、销毁与资源关闭容易遗漏。`pipeline` 将一条管道视为整体：任一环错误时销毁相关流并以 reject/callback 交付错误，推荐用于生产文件/压缩/代理链路。

## 4.5 面试快速答

**问：为什么大文件不能用 `readFile` 后 `res.end`？**

答：它会把完整文件放进内存，多个并发请求会放大峰值，并且忽略客户端消费速率。读流→响应流按 chunk 传输，利用背压把在途数据限制在阈值附近。

**追问：Buffer 与 Stream 关系？**

答：Buffer 是一个二进制数据块；字节流通常产出和消费一系列 Buffer。Stream 解决块的生命周期、排队、背压、结束和错误传播。

---

# 第五章：fs —— 文件系统不只是读写 API

## 5.1 原子性与竞态

“先 `access` 判断存在，再 `writeFile`”是 TOCTOU（check 与 use 之间状态被其他进程改变）竞态。直接执行目标操作并处理 `ENOENT`、`EEXIST` 等错误更可靠。

写入关键配置可采用：写临时文件 → `fsync`（视持久性需求）→ 同目录 `rename` 替换。许多文件系统中同文件系统、同目录的 rename 是原子可见切换；跨文件系统则不保证。不要把 `writeFile` 当作事务或断电持久性保证。

## 5.2 文件描述符与资源释放

每次 `open` 都消耗 OS 文件描述符；泄漏后会出现 `EMFILE`。尽量使用带自动关闭语义的 API/流，或在 `finally` 中关闭：

```js
import { open } from 'node:fs/promises';
const handle = await open('data.txt', 'r');
try {
  const buf = Buffer.alloc(1024);
  await handle.read(buf, 0, buf.length, 0);
} finally {
  await handle.close();
}
```

## 5.3 `fs.watch` 的边界

它是对各 OS 通知机制的封装，事件可能合并、丢失或只给文件名；编辑器的“原子保存”常表现为替换 inode。开发热更新可用，审计/精确同步不能只依赖它，需要定期扫描或更强的日志机制。

---

# 第六章：TCP、Socket、HTTP 与 HTTPS

## 6.1 TCP：可靠字节流，而不是消息队列

TCP 三次握手建立双方初始序号与收发能力；四次挥手允许两个方向独立关闭。它提供有序、可靠的**字节流**，不保留应用层消息边界。

```js
import net from 'node:net';
const server = net.createServer(socket => {
  socket.on('data', chunk => console.log(chunk)); // 可能半条或多条协议消息
});
server.listen(9000);
```

应用协议必须定义 framing，例如固定头中携带 length、换行分隔，或使用 HTTP 自身的 Content-Length/chunked 编码。把一次 `data` 当成一次完整 JSON 是高频 bug。

### TCP 相关高频点

- **粘包/拆包不是 TCP 出错**，而是应用把流误当消息。
- **流控**由接收窗口避免压垮接收端；**拥塞控制**根据网络状况限速，二者不同。
- `TIME_WAIT` 常出现在主动关闭方，用于处理网络中延迟报文并确保对方收到最终确认；盲目调内核参数不是首选，优先复用连接、正确关闭。
- keep-alive 有两层：TCP keepalive 是内核探测死连接；HTTP keep-alive 是复用同一 TCP 连接，语义/配置不同。

## 6.2 HTTP：在 TCP 字节流之上定义消息

Node 的 `http.createServer` 在 `net.Server` 之上：接收字节 → 原生 HTTP parser 解析请求行/headers/body → 产生 `IncomingMessage`（Readable）和 `ServerResponse`（Writable）→ 应用写响应 → 序列化为 HTTP 字节交给 socket。

```js
import http from 'node:http';
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  res.writeHead(404).end();
});
server.listen(3000);
```

HTTP/1.1 默认可持久连接，避免反复握手；但同一连接上的响应顺序约束可能造成队头阻塞。HTTP/2 在单 TCP 连接内多路复用 stream，缓解应用层 HOL，但 TCP 丢包仍可能阻塞连接中其他 stream；HTTP/3 基于 QUIC/UDP 进一步改变该层取舍。

### HTTP server 应有的资源边界

- 设置请求头/请求体/空闲连接超时与大小限制，抵御慢速请求和内存耗尽。
- 不信任 `Content-Length`、`Host`、转发头；反向代理后需明确 `trust proxy` 策略。
- 响应前判断 `req.aborted` / 响应 close，客户端取消后停止昂贵工作（可配合 `AbortSignal`）。

## 6.3 HTTPS/TLS 做了什么

HTTPS = HTTP over TLS。握手阶段协商协议/密码套件，服务端用证书证明身份；密钥交换得到会话密钥，之后 HTTP 数据用对称加密和完整性校验保护。证书的核心是客户端验证：域名匹配、有效期、信任链到本地信任的 CA；只“加密”但跳过证书验证会失去抗中间人能力。

TLS 握手和加解密有 CPU 成本；连接复用、会话恢复、CDN/反向代理终止 TLS 是常见优化。不要在 Node 中设置 `rejectUnauthorized: false` 来“修复”证书问题。

## 6.4 outbound HTTP：超时、连接池、取消

一次“超时”至少可能包括 DNS、建连、TLS、首字节、整体响应体几个阶段。`fetch` 没有魔法默认业务超时，应显式取消：

```js
const response = await fetch('https://api.example.com/data', {
  signal: AbortSignal.timeout(3_000),
});
```

高频短请求应复用 keep-alive 连接（Node 内置 fetch 基于 undici，有连接池语义），避免端口耗尽和握手成本；重试必须只对幂等或带幂等键的请求，并使用指数退避+jitter，不能把下游故障放大为重试风暴。

## 6.5 面试快速答

**问：HTTP 为什么能跑在 TCP 上？如何知道 body 结束？**

答：TCP 只给有序字节，HTTP 规定文本/二进制格式和边界。HTTP/1.1 body 可由 `Content-Length` 定长、`Transfer-Encoding: chunked` 分块，或在特定情形以连接关闭界定；Node parser 据此把字节流还原成请求流。

**追问：HTTPS 防了什么，没防什么？**

答：正确验证证书时，它提供传输中的机密性、完整性和服务端认证；不能自动防 XSS、被盗的服务端私钥、业务越权或已被信任端点的恶意行为。

---

# 第七章：模块系统 —— CommonJS 与 ESM 的运行语义

## 7.1 CommonJS（CJS）

`require` 是运行时、同步的加载模型。Node 会解析路径、查找文件/目录、读取并包装模块，大意相当于：

```js
(function (exports, require, module, __filename, __dirname) {
  // 原模块内容
});
```

首次执行结果按解析后的绝对路径缓存在 `require.cache`；后续 `require` 返回相同的 `module.exports` 引用。因此模块顶层副作用通常只发生一次，也意味着可变导出是共享状态。

循环依赖时，Node 为了打破递归会先把尚未执行完的 `exports` 放进缓存，另一方拿到的可能是不完整对象。解决方式是减少循环、延迟访问，或抽取共同依赖；不要依赖某个偶然加载顺序。

## 7.2 ESM

ESM 的 `import/export` 是静态声明：先构建、链接模块图，再执行；绑定是 live binding（导出变量更新后导入方看到更新），不是 CJS 那种导出对象快照语义。ESM 支持顶层 `await`，其模块图求值会异步。

```js
// config.mjs
export let mode = 'dev';
export const setMode = v => { mode = v; };
// use.mjs：mode 是对导出绑定的只读视图
import { mode, setMode } from './config.mjs';
setMode('prod'); console.log(mode); // prod
```

互操作是现实成本：ESM 可通过 `createRequire` 加载 CJS；CJS 不能同步 `require()` 一般 ESM，常使用 `import()`。项目应尽早统一模块边界，不要因临时兼容混用所有扩展名与 `package.json` 的 `type`。

## 7.3 面试快速答

**问：CJS 与 ESM 最关键差异？**

答：CJS 在运行时同步执行 `require`，导出本质是对象值且有缓存；ESM 的依赖可静态分析，先链接后执行，导出是 live binding，并能异步求值。它影响 tree-shaking、循环依赖观察到的值和加载时机。

---

# 第八章：Process、Worker Threads 与 Cluster

## 8.1 三种并行单元的选择

| 机制 | 内存/Isolate | 通信 | 适用场景 |
| --- | --- | --- | --- |
| 主 event loop | 一个进程一个主 JS 线程 | 无 | I/O 编排、短逻辑 |
| `worker_threads` | 每 Worker 独立 V8 Isolate，可共享 SAB | `postMessage` / Transfer / SharedArrayBuffer | CPU 密集计算、图像/加密 |
| `child_process` | 独立进程和内存 | IPC/stdio/socket | 强隔离、运行外部命令 |
| `cluster` | 多个 Node 进程 | 主进程调度连接/IPC | 多核扩展 HTTP（部署层常用多副本替代） |

## 8.2 Worker Threads 的真实成本与通信

Worker 不是把任意函数“扔到后台”就免费：创建 Isolate 有启动/内存成本，消息默认结构化克隆也有复制成本。对可转移的 `ArrayBuffer` 可 transfer ownership，避免复制，但发送后原线程不再能使用该 buffer；`SharedArrayBuffer` 可共享内存，但必须通过 Atomics 处理同步，否则会引入竞态。

```js
// main.mjs
import { Worker } from 'node:worker_threads';
const worker = new Worker(new URL('./cpu-worker.mjs', import.meta.url));
worker.postMessage({ n: 42 });
worker.once('message', result => console.log(result));
worker.once('error', console.error);
```

生产中通常建 Worker pool：限制队列、复用 worker、超时/取消和错误后重建。单次小任务往返 Worker 往往不如本地执行快。

## 8.3 Cluster 与负载均衡

Cluster 创建多个进程，各有自己的 event loop 与堆，以利用多核。它们**不共享 JS 内存**；session、WebSocket 路由、缓存都必须外置（Redis/数据库）或采用 sticky session。现代容器部署中，常由 Kubernetes/进程管理器启动多个单进程副本并由 LB 分流；Cluster 仍是理解 Node 多进程模型的面试高频点，但不是唯一部署答案。

## 8.4 `process` 与优雅退出

收到 `SIGTERM` 时，停止接收新连接，等待在途请求完成，设置超时兜底，关闭数据库/队列，再退出：

```js
let shuttingDown = false;
process.on('SIGTERM', () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(err => process.exit(err ? 1 : 0)); // 不再接受新连接
  setTimeout(() => process.exit(1), 10_000).unref();
});
```

实际还需针对 keep-alive 空闲连接、WebSocket、任务消费者和 readiness probe 设计；`server.close()` 不会替你终止所有业务资源。

## 8.5 面试快速答

**问：CPU 密集任务为什么要 Worker，而不是 Promise？**

答：Promise 只改变后续回调的调度，不把同步计算迁到另一个线程；耗时循环仍占主 JS 线程。Worker 有独立事件循环和 Isolate，可真正并行，但需承担通信和池化成本。

---

# 第九章：错误处理、取消与可靠性

## 9.1 错误的四个入口

1. 同步 throw：用 `try/catch` 捕获。
2. Promise rejection：`await` 周围 `try/catch`，或链尾 `.catch`。
3. EventEmitter / Stream：监听 `'error'`，否则可能成为未处理异常。
4. 回调风格：第一个参数 `err`；不能在异步回调外层的同步 `try/catch` 捕获。

```js
try {
  await pipeline(source, transform, destination);
} catch (err) {
  logger.error({ err }, 'stream pipeline failed');
  // 转换为可控的 HTTP/任务失败语义
}
```

`uncaughtException` 与 `unhandledRejection` 适合记录、触发退出流程，不适合“吞掉后继续服务”：进程可能已经处于部分更新、资源不一致的未知状态。交给 supervisor 重启，才是更可靠的边界。

## 9.2 超时和取消是资源管理

Promise 没有内建取消；“不再 await”不会停止底层 fetch、DB 操作或 timer。应把 `AbortSignal` 沿调用链传下去，在底层关闭 socket、停止 stream/任务：

```js
async function loadProfile(id, { signal }) {
  const res = await fetch(`https://example.test/users/${id}`, { signal });
  return res.json();
}
```

在 HTTP 入站请求断开时中止下游请求，避免“用户已走、服务器还占着连接和 CPU”。超时要有分层预算：上游总 deadline 大于各下游阶段的合理预算，而不是每层各等 5 秒导致尾延迟叠加。

## 9.3 HTTP 错误边界

错误中间件必须在响应尚未写出时设置状态码；headers 已发送后只能结束/销毁连接。区分可预期的 4xx（参数、权限、冲突）与 5xx（依赖失败、bug），日志带请求 ID、错误栈、依赖耗时，不要把内部栈和密钥回显给客户端。

---

# 第十章：V8 内存、GC 与性能诊断

## 10.1 V8 堆不是全部内存

`process.memoryUsage()` 中：

- `heapUsed`：活跃 JS 对象使用的 V8 堆；
- `heapTotal`：已向 V8 堆申请的容量；
- `external` / `arrayBuffers`：Buffer、原生绑定等堆外关联内存；
- `rss`：进程驻留物理内存，包含 V8、代码、栈、原生库等。

因此“heap 很稳但 RSS 涨”不必然不是泄漏，可能是 Buffer、native 内存、分配器保留的页；反过来只盯 RSS 也无法定位 JS 对象引用链。

## 10.2 分代 GC 为什么有效

多数对象朝生夕死。V8 将堆大体分为 young generation 与 old generation：新对象先在新生代，使用复制/Scavenge 快速回收；存活多次后晋升老生代，老生代回收更昂贵，可能有增量/并发标记以减少长停顿。GC 不等于“内存立刻还给 OS”，空闲堆容量可留作后续分配。

降低 GC 压力的真正方法通常是：减少不必要对象/字符串/Buffer 分配，使用流限制在途数据，限制缓存且有 TTL/容量，避免把请求上下文、闭包或 listener 意外长期保留。

## 10.3 常见泄漏模式

```js
// 每次请求注册一次全局 listener，从不移除
app.get('/', (req, res) => {
  process.on('message', () => {});
  res.end('ok');
});
```

还包括无限 `Map` 缓存、未清理 timer、全局数组累积请求数据、未消费/未销毁 stream、连接/句柄泄漏。`MaxListenersExceededWarning` 是值得调查的预警，不是通过 `setMaxListeners(0)` 消掉即可。

## 10.4 先分类，后优化

| 现象 | 常见根因 | 首选手段 |
| --- | --- | --- |
| 所有请求卡顿、CPU 高 | 同步 CPU、长 GC、JSON/正则 | CPU profile、事件循环延迟 |
| 延迟高但主 CPU 不高 | 下游慢、线程池排队、连接池耗尽 | tracing、线程池/连接指标 |
| RSS 或 heap 持续爬升 | 缓存/引用/Buffer/句柄泄漏 | heap snapshot、资源监控 |
| p99 高、均值正常 | GC、排队、重试风暴、慢客户端 | histogram、负载模型 |

内置 `perf_hooks.monitorEventLoopDelay()` 可观测事件循环延迟；`node --inspect` 连接 DevTools 取 heap snapshot / CPU profile；`node --trace-gc` 用于验证 GC 假设。压测必须区分 CPU、网络和下游瓶颈，不能只看 QPS。

## 10.5 面试快速答

**问：怎么定位 Node 内存泄漏？**

答：先用 RSS、heapUsed、external 和句柄数判断类别，并在相同负载下确认持续增长；对 JS 堆取多个 heap snapshot 比较 retained size 与引用路径，重点查全局缓存、listener、timer、闭包。若 heap 稳而 RSS/external 涨，则检查 Buffer、stream、native/连接资源，不要只看 GC。

---

# 第十一章：Express、Koa、Nest 的底层原理

## 11.1 三者共同的地基

最终都是 Node 原生 HTTP server 的请求回调。框架的价值是将 `(req, res)` 周围的路由、参数解析、中间件、依赖注入、错误处理标准化；它们不能绕开 Node event loop，也不能把 CPU 密集业务自动变快。

## 11.2 Express：线性中间件栈

Express 维护按注册顺序排列的 Layer。请求到达后依次匹配 path/method，调用 `(req, res, next)`；只有调用 `next()` 才向后推进。错误中间件以四参 `(err, req, res, next)` 识别。

```js
app.use((req, res, next) => { req.start = performance.now(); next(); });
app.get('/users/:id', handler);
app.use((err, req, res, next) => res.status(500).json({ error: 'internal' }));
```

原因是简单、兼容 Connect 生态；代价是“返回阶段”必须由回调或包装实现，忘调 `next()` 会挂起，请求异步错误的传递需要符合所用 Express 版本/封装约定。

## 11.3 Koa：洋葱模型与 `async` 组合

Koa 中间件形如 `async (ctx, next) => { before; await next(); after; }`。框架通过 compose 把数组递归组合：进入时依次执行 before，到路由后开始栈式返回，依次执行 after。

```js
app.use(async (ctx, next) => {
  const t = Date.now();
  try { await next(); }
  catch (err) { ctx.status = err.status || 500; ctx.body = 'Internal Error'; }
  finally { console.log(Date.now() - t); }
});
```

它特别适合事务、统一错误处理、响应时间统计等需要包裹后续链路的横切逻辑。常见误区是未 `await next()`：下游可能并发执行，洋葱顺序被破坏。Koa 的 `ctx` 是对 Node req/res 的高层封装，不是摆脱底层流。

## 11.4 Nest：模块、DI 与请求管线

Nest 主要提供架构层抽象。启动时扫描 decorators 元数据，构建 Module 图和依赖注入容器；Controller 路由最终由 HTTP adapter（默认常用 Express，也可 Fastify）注册到底层 server。一次请求典型经过：

```text
middleware → guards（能否访问） → interceptors(before)
→ pipes（校验/转换参数） → controller → service/DI dependencies
→ interceptors(after) → exception filters
```

Guard 与 Pipe 的差别不只是顺序：Guard 决定授权是否可进入处理器；Pipe 将输入转成符合业务类型/规则的值。Singleton provider 跨请求共享，保存请求状态会产生并发串数据；需要请求级状态才用 request-scoped provider，但会增加实例创建与 DI 成本。

## 11.5 面试快速答

**问：Koa 洋葱模型如何实现？**

答：将中间件数组 compose 成递归 `dispatch(i)`，每层先执行 `await next()` 前逻辑，`next` 调用下一层并返回 Promise，最内层完成后 Promise 链反向 resolve，所以外层能在 `await` 后统一处理响应、耗时和错误。

**追问：Nest 和 Express 的关系？**

答：Nest 是更高层的模块化/DI/装饰器框架，可运行在 Express 或 Fastify adapter 上；Express 负责底层 HTTP 路由/中间件执行，Nest 负责把声明式 Controller/provider 编译为这些底层注册与调用链。

---

# 第十二章：把知识串成一次请求

以“客户端上传文件，Node 转发到对象存储”为例：

```text
1. TCP socket 就绪，OS 通知 libuv；event loop 进入 poll。
2. Node HTTP parser 从字节流解析 headers，暴露 req Readable。
3. Express/Koa/Nest 运行中间件、鉴权、参数校验。
4. 不应把全量 body 聚成 Buffer；将 req 通过 pipeline 流式传给 outbound HTTP Writable。
5. 对象存储慢时，目标 write() 返回 false，背压暂停读取客户端，限制内存。
6. DNS/连接/TLS/响应各有 deadline；客户端断开时 AbortSignal 取消上游。
7. 请求结束写 res；keep-alive socket 继续等待下一 HTTP 请求。
8. 若转码是 CPU 密集任务，交给有界 Worker pool，不在 handler 内同步计算。
9. 日志/tracing 记录 request ID、耗时、错误；SIGTERM 时停止接新请求，排空在途流。
```

这条链同时回答了最常见的“Node 为什么快、何时不快、如何避免内存爆、为什么 stream、为什么 Worker、如何优雅退出”。

---

# 面试收束：高频追问清单

1. Node 的“单线程”与“高并发”是否矛盾？讲清 JS 主线程、I/O 多路复用、线程池。
2. `nextTick`、Promise、`setImmediate`、`setTimeout(0)` 的调度边界和饥饿风险是什么？
3. `fs`、DNS、crypto 与 TCP 网络 I/O 是否都走 libuv 四线程池？为什么？
4. 为什么 TCP 会粘包/拆包，HTTP 如何分帧？
5. Buffer 为什么是外部/二进制内存，Stream 背压如何工作？
6. CJS 缓存、循环依赖与 ESM live binding 分别意味着什么？
7. Promise 为什么不能解决 CPU 阻塞，Worker/Cluster 各什么时候用？
8. Node 内存指标怎么读，如何由现象定位泄漏？
9. 异常、超时、取消、优雅下线如何组成可靠性边界？
10. Koa 洋葱、Express `next`、Nest DI 管线如何映射到原生 HTTP？

## 建议的复习输出

每个主题用自己的话输出四句话：**机制是什么 → 为什么需要它 → 一次实际执行路径 → 一个边界/误区**。能把“`fs.readFile` 为何不阻塞 JS 却仍会变慢”和“慢客户端为何会导致内存上涨”讲透，通常已超出只背标准答案的层次。
