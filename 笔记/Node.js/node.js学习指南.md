## Node.js 学习指南

> 基于 Node.js 官方文档整理。当前时间：2026-05-21。  
> 最新 Current：Node.js v26.2.0；最新 LTS：Node.js v24.15.0。学习新能力可以关注 v26，生产项目通常优先选择 LTS。  
> 官方参考：<https://nodejs.org/en/about/previous-releases>、<https://nodejs.org/api/>

## 0. 你应该怎样学习 Node.js

Node.js 不是一门新语言，而是一个让 JavaScript 运行在服务端、命令行、构建工具、桌面工具和边缘环境中的运行时。

建议学习顺序：

1. 先理解运行时：V8、libuv、事件循环、线程池、模块系统。
2. 再掌握核心 API：`fs`、`path`、`url`、`events`、`stream`、`http`、`crypto`、`process`。
3. 接着学工程化：npm、package.json、ESM/CommonJS、环境变量、脚本、测试、调试。
4. 然后做服务端：HTTP 服务、路由、错误处理、中间件、数据库、认证、安全。
5. 最后补高级主题：性能、Worker Threads、Child Process、集群、部署、可观测性。

## 1. Node.js 是什么

Node.js 是一个基于 V8 JavaScript 引擎的运行时。它把浏览器中的 JavaScript 执行能力带到了操作系统层面，并额外提供了访问文件系统、网络、进程、加密、流、子进程等能力的标准库。

浏览器 JavaScript 主要能做：

```js
document.querySelector('button').addEventListener('click', () => {
  console.log('clicked');
});
```

Node.js JavaScript 可以做：

```js
import { readFile } from 'node:fs/promises';

const content = await readFile('./README.md', 'utf8');
console.log(content);
```

Node.js 的典型使用场景：

- Web API 服务：REST、GraphQL、RPC。
- 前端工程工具：Vite、Webpack、ESLint、TypeScript、Next.js。
- 命令行工具：脚手架、自动化脚本、代码生成器。
- 实时服务：聊天、推送、协作编辑。
- BFF 层：聚合多个后端服务并面向前端输出接口。
- 数据处理：流式读写、日志处理、任务调度。

## 2. 版本选择与安装

Node.js 发布线分为 Current 和 LTS。

- Current：最新功能最先进入这里，适合学习、尝鲜、库作者验证兼容性。
- LTS：长期支持版本，适合生产项目、团队项目和企业项目。

建议：

- 学习：安装最新 LTS，也可以额外安装 Current 体验新 API。
- 生产：优先使用 LTS。
- 多项目：使用版本管理工具，例如 `nvm`、`fnm`、`volta`。

检查版本：

```bash
node -v
npm -v
```

运行一段代码：

```bash
node -e "console.log(process.version)"
```

进入 REPL：

```bash
node
```

REPL 中可以直接试验：

```js
1 + 2
process.cwd()
```

## 3. 第一个 Node.js 程序

创建 `hello.mjs`：

```js
const name = process.argv[2] ?? 'Node.js';

console.log(`Hello, ${name}!`);
console.log('当前工作目录:', process.cwd());
console.log('Node 版本:', process.version);
```

运行：

```bash
node hello.mjs Alice
```

核心点：

- `process.argv`：命令行参数数组。
- `process.cwd()`：当前命令执行目录。
- `process.version`：当前 Node.js 版本。
- `.mjs`：明确表示当前文件使用 ESM 模块系统。

## 4. Node.js 运行架构

Node.js 主要由这些部分组成：

```text
JavaScript 代码
    |
    v
V8 引擎：解析、编译、执行 JS
    |
    v
Node.js C++ Binding：把 JS API 连接到系统能力
    |
    v
libuv：事件循环、异步 I/O、线程池、跨平台抽象
    |
    v
操作系统：文件、网络、进程、线程、DNS、定时器
```

关键组件：

- V8：Google 开源 JavaScript 引擎，负责执行 JS。
- libuv：跨平台异步 I/O 库，负责事件循环、线程池、TCP、文件系统等。
- C++ bindings：连接 JavaScript API 和底层 C/C++ 能力。
- Node.js 标准库：`fs`、`http`、`stream`、`crypto` 等模块。

一段 Node.js 程序的大致运行流程：

```text
1. Shell 执行 node app.js
2. Node 初始化进程、V8、libuv、环境变量和模块加载器
3. 加载入口文件 app.js
4. 执行顶层同步代码
5. 遇到异步任务时交给系统、libuv 或线程池
6. 同步代码执行完毕后，事件循环继续调度异步回调
7. 没有活跃任务时，进程退出
```

示例：

```js
import { readFile } from 'node:fs';

console.log('A');

readFile('./package.json', 'utf8', (error, data) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log('C', data.length);
});

console.log('B');
```

输出顺序通常是：

```text
A
B
C 1234
```

原因：文件读取是异步任务，回调会在当前同步代码执行完之后，由事件循环在合适阶段调度。

## 5. 事件循环与异步模型

Node.js 适合 I/O 密集型任务，因为它不会为每个请求都创建一个新线程去阻塞等待 I/O，而是把等待交给操作系统、libuv 或线程池，主线程继续执行其他任务。

### 5.1 调用栈、任务队列和事件循环

```js
console.log('sync 1');

setTimeout(() => {
  console.log('timer');
}, 0);

Promise.resolve().then(() => {
  console.log('microtask');
});

console.log('sync 2');
```

常见输出：

```text
sync 1
sync 2
microtask
timer
```

理解：

- 同步代码先进调用栈，立即执行。
- Promise 回调进入微任务队列。
- `setTimeout` 回调进入定时器相关阶段。
- 当前调用栈清空后，优先处理微任务，然后进入事件循环阶段。

### 5.2 常见异步写法

回调：

```js
import { readFile } from 'node:fs';

readFile('./config.json', 'utf8', (error, text) => {
  if (error) {
    console.error('读取失败:', error.message);
    return;
  }
  console.log(JSON.parse(text));
});
```

Promise：

```js
import { readFile } from 'node:fs/promises';

readFile('./config.json', 'utf8')
  .then(JSON.parse)
  .then(console.log)
  .catch((error) => console.error(error.message));
```

`async/await`：

```js
import { readFile } from 'node:fs/promises';

try {
  const text = await readFile('./config.json', 'utf8');
  const config = JSON.parse(text);
  console.log(config);
} catch (error) {
  console.error('读取失败:', error.message);
}
```

现代 Node.js 项目优先使用 `async/await`，但仍然要能读懂回调风格，因为大量底层 API 和历史代码仍然存在。

## 6. 模块系统：ESM 与 CommonJS

Node.js 同时支持两套模块系统：

- CommonJS：Node.js 最早的模块系统，使用 `require()` 和 `module.exports`。
- ESM：ECMAScript 标准模块，使用 `import` 和 `export`。

官方建议新项目优先使用 ESM，尤其是前端全栈、现代工具链和 TypeScript 项目。

### 6.1 ESM

`math.mjs`：

```js
export function add(a, b) {
  return a + b;
}

export const PI = 3.1415926;
```

`index.mjs`：

```js
import { add, PI } from './math.mjs';

console.log(add(1, 2));
console.log(PI);
```

也可以在 `package.json` 中声明：

```json
{
  "type": "module"
}
```

这样 `.js` 文件会默认按 ESM 解析。

### 6.2 CommonJS

`math.cjs`：

```js
function add(a, b) {
  return a + b;
}

module.exports = { add };
```

`index.cjs`：

```js
const { add } = require('./math.cjs');

console.log(add(1, 2));
```

### 6.3 `node:` 前缀

导入 Node.js 内置模块时，推荐使用 `node:` 前缀：

```js
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
```

好处：

- 明确这是 Node.js 内置模块。
- 避免和第三方包或本地文件重名。
- 对新内置模块尤其重要，例如 `node:test`、`node:sqlite` 只能通过 `node:` 形式使用。

### 6.4 模块解析流程

当你写：

```js
import lodash from 'lodash';
import { add } from './math.js';
import { readFile } from 'node:fs/promises';
```

Node.js 会按不同规则解析：

- `node:fs/promises`：直接解析为内置模块。
- `./math.js`：相对路径，按文件路径解析。
- `lodash`：裸模块标识符，从 `node_modules` 和包的 `package.json` 解析。

## 7. package.json 与 npm

`package.json` 是 Node.js 项目的元数据和脚本入口。

初始化：

```bash
npm init -y
```

示例：

```json
{
  "name": "node-learning",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "test": "node --test"
  },
  "dependencies": {
    "express": "^5.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

字段说明：

- `name`：包名。
- `version`：语义化版本号。
- `type`：模块类型，`module` 表示 `.js` 默认使用 ESM。
- `scripts`：常用命令。
- `dependencies`：生产依赖。
- `devDependencies`：开发依赖。
- `exports`：包对外暴露入口。
- `engines`：声明支持的 Node.js 版本。

常用命令：

```bash
npm install lodash
npm install -D eslint
npm uninstall lodash
npm run start
npm test
```

## 8. 核心 API：process

`process` 代表当前 Node.js 进程。

```js
console.log(process.pid);
console.log(process.platform);
console.log(process.arch);
console.log(process.cwd());
console.log(process.env.NODE_ENV);
console.log(process.argv);
```

读取环境变量：

```js
const port = Number(process.env.PORT ?? 3000);
console.log(`server will listen on ${port}`);
```

优雅退出：

```js
process.on('SIGINT', () => {
  console.log('收到 Ctrl+C，准备退出');
  process.exit(0);
});
```

异常事件：

```js
process.on('uncaughtException', (error) => {
  console.error('未捕获异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理 Promise 拒绝:', reason);
  process.exit(1);
});
```

生产中不要依赖这两个事件“吞掉错误”，它们更适合做最后日志记录和进程退出。真正的错误处理应该发生在业务边界。

## 9. 核心 API：path 与 url

`path` 用于处理文件路径。

```js
import path from 'node:path';

const file = path.join(process.cwd(), 'data', 'users.json');

console.log(file);
console.log(path.basename(file));
console.log(path.dirname(file));
console.log(path.extname(file));
```

ESM 中没有 CommonJS 的 `__dirname` 和 `__filename`，可以这样得到：

```js
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename);
console.log(__dirname);
```

`URL` 用于解析和构造 URL：

```js
const url = new URL('https://example.com/users?page=2&limit=10');

console.log(url.protocol);
console.log(url.hostname);
console.log(url.pathname);
console.log(url.searchParams.get('page'));
```

## 10. 核心 API：fs 文件系统

优先使用 `node:fs/promises`。

读取文件：

```js
import { readFile } from 'node:fs/promises';

const text = await readFile('./data.txt', 'utf8');
console.log(text);
```

写入文件：

```js
import { writeFile } from 'node:fs/promises';

await writeFile('./message.txt', 'Hello Node.js\n', 'utf8');
```

追加文件：

```js
import { appendFile } from 'node:fs/promises';

await appendFile('./app.log', `[${new Date().toISOString()}] started\n`);
```

判断文件是否存在：

```js
import { access } from 'node:fs/promises';

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

console.log(await exists('./package.json'));
```

创建目录：

```js
import { mkdir } from 'node:fs/promises';

await mkdir('./logs/app', { recursive: true });
```

读取目录：

```js
import { readdir } from 'node:fs/promises';

const entries = await readdir('./', { withFileTypes: true });

for (const entry of entries) {
  console.log(entry.isDirectory() ? 'dir ' : 'file', entry.name);
}
```

## 11. 核心 API：Buffer

JavaScript 字符串适合处理文本，`Buffer` 适合处理二进制数据，例如图片、文件块、网络包、加密数据。

```js
const buffer = Buffer.from('你好 Node.js', 'utf8');

console.log(buffer);
console.log(buffer.length);
console.log(buffer.toString('utf8'));
```

Base64：

```js
const text = 'hello';
const encoded = Buffer.from(text).toString('base64');
const decoded = Buffer.from(encoded, 'base64').toString('utf8');

console.log(encoded);
console.log(decoded);
```

注意：

- `Buffer.length` 是字节长度，不是字符长度。
- 中文、emoji 等字符通常占多个字节。

## 12. 核心 API：events

`EventEmitter` 是 Node.js 很多模块的基础，例如 HTTP 请求、流、进程事件。

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('user:created', (user) => {
  console.log('发送欢迎邮件:', user.email);
});

bus.emit('user:created', {
  id: 1,
  email: 'alice@example.com'
});
```

只监听一次：

```js
bus.once('ready', () => {
  console.log('只执行一次');
});
```

错误事件：

```js
bus.on('error', (error) => {
  console.error('事件错误:', error.message);
});

bus.emit('error', new Error('something failed'));
```

如果 `EventEmitter` 发出 `error` 事件但没有监听器，进程会抛出异常。

## 13. 核心 API：stream 流

流用于分块处理数据。它可以避免一次性把大文件、大响应、大请求全部加载进内存。

常见流类型：

- Readable：可读流，例如文件读取、HTTP 请求体。
- Writable：可写流，例如文件写入、HTTP 响应体。
- Duplex：双工流，既可读又可写，例如 TCP socket。
- Transform：转换流，例如压缩、加密、格式转换。

### 13.1 复制大文件

```js
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

await pipeline(
  createReadStream('./big-file.zip'),
  createWriteStream('./big-file-copy.zip')
);

console.log('复制完成');
```

`pipeline` 会自动处理背压和错误，是现代 Node.js 中连接流的推荐方式。

### 13.2 Transform 流

```js
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  }
});

await pipeline(
  createReadStream('./input.txt'),
  upper,
  createWriteStream('./output.txt')
);
```

### 13.3 背压是什么

背压是指下游处理速度慢于上游生产速度时，需要通知上游放慢速度。

如果没有背压：

```text
读取速度 > 写入速度 -> 内存堆积 -> 内存暴涨 -> 进程崩溃
```

使用 `pipeline` 可以让 Node.js 自动协调读取和写入速度。

## 14. 核心 API：http

Node.js 内置 `node:http` 可以直接创建 HTTP 服务。

```js
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET' && req.url === '/health') {
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
```

请求对象 `req`：

- `req.method`：HTTP 方法。
- `req.url`：请求路径和查询字符串。
- `req.headers`：请求头。
- `req` 本身也是可读流，可读取请求体。

响应对象 `res`：

- `res.statusCode`：状态码。
- `res.setHeader(name, value)`：设置响应头。
- `res.write(chunk)`：写入响应数据。
- `res.end(data)`：结束响应。

### 14.1 解析 URL 和查询参数

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/search') {
    const keyword = url.searchParams.get('q') ?? '';
    res.end(JSON.stringify({ keyword }));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(3000);
```

### 14.2 读取 JSON 请求体

```js
async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(text);
}
```

使用：

```js
import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/users') {
      const body = await readJson(req);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.statusCode = 201;
      res.end(JSON.stringify({ id: randomUUID(), ...body }));
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(3000);
```

实际项目通常使用 Express、Fastify、Hono、NestJS 等框架，因为它们提供路由、中间件、参数校验、错误处理等能力。

## 15. Fetch、Web API 与现代 Node.js

现代 Node.js 内置了很多浏览器同源的 Web API，例如 `fetch`、`URL`、`AbortController`、`Blob`、`FormData`、Web Streams。

发送请求：

```js
const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();
console.log(data);
```

超时控制：

```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);

try {
  const response = await fetch('https://example.com', {
    signal: controller.signal
  });
  console.log(response.status);
} finally {
  clearTimeout(timeout);
}
```

## 16. crypto 加密与随机数

生成 UUID：

```js
import { randomUUID } from 'node:crypto';

console.log(randomUUID());
```

哈希：

```js
import { createHash } from 'node:crypto';

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

console.log(sha256('hello'));
```

生成安全随机字符串：

```js
import { randomBytes } from 'node:crypto';

const token = randomBytes(32).toString('hex');
console.log(token);
```

密码存储不要直接使用 SHA-256。应使用专门的密码哈希算法，例如 `bcrypt`、`scrypt`、`argon2`。Node.js 内置 `scrypt`：

```js
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const derivedKey = await scryptAsync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}
```

## 17. util 常用工具

`promisify` 可以把 Node 风格回调函数转换成 Promise。

```js
import { readFile } from 'node:fs';
import { promisify } from 'node:util';

const readFileAsync = promisify(readFile);

const text = await readFileAsync('./package.json', 'utf8');
console.log(text);
```

现代项目里，很多核心 API 已经提供 Promise 版本，例如 `node:fs/promises`。`promisify` 更多用于兼容旧 API 或第三方回调库。

格式化对象：

```js
import { inspect } from 'node:util';

const user = { id: 1, profile: { name: 'Alice' } };

console.log(inspect(user, { depth: null, colors: true }));
```

## 18. 错误处理

Node.js 常见错误来源：

- 同步异常：`throw new Error()`。
- Promise reject：`Promise.reject()` 或 async 函数抛错。
- 回调错误：Node 风格 `(error, result) => {}`。
- EventEmitter `error` 事件。
- 流错误。

推荐风格：

```js
async function main() {
  const user = await getUser();
  await sendEmail(user.email);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

HTTP 服务中的错误边界：

```js
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  if (req.url === '/boom') {
    throw new Error('业务失败');
  }

  sendJson(res, 200, { ok: true });
}

const server = createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
});
```

不要把内部错误完整暴露给用户。日志里可以记录详细错误，响应里返回稳定、有限的信息。

## 19. 命令行工具开发

`cli.mjs`：

```js
#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const [, , file] = process.argv;

if (!file) {
  console.error('Usage: node cli.mjs <file>');
  process.exit(1);
}

const text = await readFile(file, 'utf8');
const lines = text.split('\n').length;

console.log(`${file}: ${lines} lines`);
```

在类 Unix 系统可执行：

```bash
chmod +x cli.mjs
./cli.mjs README.md
```

发布 CLI 时可以在 `package.json` 配置：

```json
{
  "bin": {
    "count-lines": "./cli.mjs"
  }
}
```

## 20. 环境变量与配置

Node.js v20.6.0 起支持 `--env-file` 读取环境变量文件，现代版本可直接使用。

`.env`：

```text
PORT=3000
DATABASE_URL=file:./dev.db
```

启动：

```bash
node --env-file=.env app.mjs
```

代码：

```js
const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

console.log(config);
```

配置建议：

- 不要把密钥提交到 Git。
- 配置读取集中在一个模块中。
- 启动时校验必填配置。
- 区分开发、测试、生产环境。

## 21. 测试：node:test

Node.js 内置测试运行器 `node:test`，可以不安装 Jest/Vitest 就写测试。

`math.js`：

```js
export function add(a, b) {
  return a + b;
}
```

`math.test.js`：

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from './math.js';

test('add returns sum of two numbers', () => {
  assert.equal(add(1, 2), 3);
});
```

运行：

```bash
node --test
```

子测试：

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('array methods', async (t) => {
  await t.test('map', () => {
    assert.deepEqual([1, 2].map((n) => n * 2), [2, 4]);
  });

  await t.test('filter', () => {
    assert.deepEqual([1, 2, 3].filter((n) => n > 1), [2, 3]);
  });
});
```

Mock：

```js
import test from 'node:test';
import assert from 'node:assert/strict';

test('mock function', (t) => {
  const fn = t.mock.fn((name) => `hi ${name}`);

  assert.equal(fn('Alice'), 'hi Alice');
  assert.equal(fn.mock.callCount(), 1);
});
```

覆盖率：

```bash
node --test --experimental-test-coverage
```

Node.js v26 的测试运行器还支持随机化测试顺序：

```bash
node --test --test-randomize
node --test --test-random-seed=12345
```

这可以帮助发现依赖执行顺序的脆弱测试。

## 22. 调试与诊断

### 22.1 console

```js
console.log('普通日志');
console.error('错误日志');
console.time('task');
await new Promise((resolve) => setTimeout(resolve, 100));
console.timeEnd('task');
```

### 22.2 Inspector

启动调试：

```bash
node --inspect app.js
```

首行断点：

```bash
node --inspect-brk app.js
```

然后用 Chrome 打开：

```text
chrome://inspect
```

### 22.3 性能计时

```js
import { performance } from 'node:perf_hooks';

const start = performance.now();

await doSomething();

const end = performance.now();
console.log(`耗时: ${(end - start).toFixed(2)}ms`);
```

### 22.4 进程报告

Node.js 可以生成诊断报告，帮助排查崩溃、死锁、性能问题。

```bash
node --report-uncaught-exception app.js
```

## 23. Worker Threads

Node.js 主线程适合处理 I/O，不适合长时间 CPU 密集型任务。如果主线程做大量计算，会阻塞事件循环。

错误示例：

```js
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(45));
```

这会让进程在计算期间无法及时处理其他请求。

使用 Worker Threads：

`worker.mjs`：

```js
import { parentPort, workerData } from 'node:worker_threads';

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData.n);
parentPort.postMessage(result);
```

`main.mjs`：

```js
import { Worker } from 'node:worker_threads';

function runFibonacci(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
      workerData: { n }
    });

    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

console.log(await runFibonacci(45));
```

适合 Worker Threads 的任务：

- 图片处理。
- 加密压缩。
- 大量 JSON/CSV 解析。
- 复杂计算。
- 机器学习推理。

不适合：

- 普通数据库查询。
- HTTP 请求。
- 文件读取。

这些 I/O 任务本来就可以异步执行。

## 24. Child Process

`child_process` 用于启动外部命令或其他进程。

执行简单命令：

```js
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const { stdout } = await execFileAsync('node', ['-v']);
console.log(stdout);
```

启动长时间运行进程：

```js
import { spawn } from 'node:child_process';

const child = spawn('node', ['server.js'], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`child exited: ${code}`);
});
```

安全建议：

- 优先使用 `execFile`，避免 shell 注入。
- 不要把用户输入直接拼到 shell 命令中。
- 如果必须使用 `exec`，要严格校验和转义参数。

## 25. Cluster

Node.js 单个进程默认只运行一个主 JavaScript 线程。多核机器上，可以用多进程提升吞吐。

现代部署中，更常见的是用容器、进程管理器或平台层做多实例，例如 PM2、Docker、Kubernetes、systemd。`cluster` 仍然值得了解，因为它解释了 Node.js 横向扩展的基本思路。

简化示例：

```js
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { createServer } from 'node:http';

if (cluster.isPrimary) {
  const count = availableParallelism();

  for (let i = 0; i < count; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  createServer((req, res) => {
    res.end(`handled by ${process.pid}`);
  }).listen(3000);
}
```

## 26. SQLite：node:sqlite

Node.js 新版本提供内置 `node:sqlite` 模块。根据官方 v26 文档，它目前是 Release Candidate 状态，适合学习和谨慎试用；生产选型仍要结合稳定性要求评估。

基础示例：

```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
insert.run('Alice');
insert.run('Bob');

const users = db.prepare('SELECT id, name FROM users').all();
console.log(users);

db.close();
```

注意：

- `DatabaseSync` 是同步 API，简单直接，但在 Web 服务高并发路径中要谨慎。
- SQLite 适合本地、小型服务、嵌入式数据、测试环境。
- 大型多人写入、高并发事务场景通常选择 PostgreSQL、MySQL 等服务型数据库。

## 27. Permission Model 权限模型

Node.js 权限模型用于限制进程对文件系统、网络、子进程、Worker、原生插件等资源的访问。官方文档把它描述为“安全带”式机制：它可以防止可信代码误操作，但不能作为抵御恶意代码的完整安全边界。

开启权限模型：

```bash
node --permission app.js
```

允许读取指定文件：

```bash
node --permission --allow-fs-read=./config.json app.js
```

允许网络访问：

```bash
node --permission --allow-net app.js
```

运行时检查权限：

```js
if (process.permission?.has('fs.read', './config.json')) {
  console.log('可以读取配置文件');
}
```

使用建议：

- 在 CLI 工具、自动化脚本、插件系统中很有价值。
- 不要把它当成沙箱或恶意代码隔离方案。
- 生产部署前要测试依赖是否需要文件、网络、Worker、子进程等权限。

## 28. TypeScript 与 Node.js

Node.js v22+ 开始逐步支持直接运行部分 TypeScript 语法，现代版本文档中也包含 TypeScript 相关章节。但在实际工程中，TypeScript 项目通常仍然使用 `tsc`、`tsx`、`ts-node`、Vite、Next.js 或构建工具链。

推荐学习路线：

1. 先掌握 Node.js 的 ESM、异步、核心 API。
2. 再使用 TypeScript 给配置、请求、响应、数据库模型加类型。
3. 最后理解构建输出、模块格式和类型声明文件。

简单项目结构：

```text
project
  package.json
  tsconfig.json
  src
    index.ts
```

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`package.json`：

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## 29. Web 服务工程结构

小型原生 HTTP 项目可以这样组织：

```text
src
  index.js
  config.js
  router.js
  controllers
    user-controller.js
  services
    user-service.js
  repositories
    user-repository.js
  utils
    send-json.js
```

职责划分：

- `index.js`：启动服务、绑定端口、注册全局错误处理。
- `config.js`：读取和校验配置。
- `router.js`：根据 method/path 分发请求。
- controller：处理 HTTP 入参、响应。
- service：业务逻辑。
- repository：数据访问。
- utils：通用工具。

### 29.1 一个最小分层示例

`utils/send-json.js`：

```js
export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}
```

`services/user-service.js`：

```js
import { randomUUID } from 'node:crypto';

const users = new Map();

export function createUser(input) {
  if (!input.name) {
    const error = new Error('name is required');
    error.statusCode = 400;
    throw error;
  }

  const user = {
    id: randomUUID(),
    name: input.name
  };

  users.set(user.id, user);
  return user;
}

export function listUsers() {
  return Array.from(users.values());
}
```

`router.js`：

```js
import { createUser, listUsers } from './services/user-service.js';
import { sendJson } from './utils/send-json.js';

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/users') {
    sendJson(res, 200, { data: listUsers() });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/users') {
    const body = await readJson(req);
    const user = createUser(body);
    sendJson(res, 201, { data: user });
    return;
  }

  sendJson(res, 404, { error: 'Not Found' });
}
```

`index.js`：

```js
import { createServer } from 'node:http';
import { router } from './router.js';
import { sendJson } from './utils/send-json.js';

const server = createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode ?? 500, {
      error: error.statusCode ? error.message : 'Internal Server Error'
    });
  }
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
```

## 30. Express/Fastify 生态定位

原生 `node:http` 适合理解底层，但真实业务通常使用框架。

Express：

- 生态大。
- 中间件丰富。
- 写法简单。
- 适合快速开发和传统 API。

Fastify：

- 性能好。
- Schema 和插件体系清晰。
- 更适合对吞吐、类型、结构有要求的服务。

Express 示例：

```js
import { randomUUID } from 'node:crypto';
import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/users', (req, res) => {
  res.status(201).json({
    id: randomUUID(),
    ...req.body
  });
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
```

Fastify 示例：

```js
import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { ok: true };
});

app.post('/users', async (request, reply) => {
  return reply.code(201).send({
    id: randomUUID(),
    ...request.body
  });
});

await app.listen({ port: 3000 });
```

## 31. 安全基础

Node.js 服务常见安全点：

- 输入校验：永远不要相信客户端输入。
- SQL 注入：使用参数化查询，不拼接 SQL。
- 命令注入：不要拼接 shell 命令。
- XSS：输出到 HTML 前转义。
- CSRF：浏览器 cookie 鉴权时需要防护。
- CORS：只允许必要来源。
- 密钥管理：不要提交 `.env`、token、私钥。
- 依赖安全：定期升级依赖，关注审计结果。
- 限流：防止暴力请求和资源耗尽。
- 日志脱敏：不要记录密码、token、身份证号等敏感信息。

参数化查询示意：

```js
const statement = db.prepare('SELECT id, name FROM users WHERE email = ?');
const user = statement.get(email);
```

错误示例：

```js
const sql = `SELECT * FROM users WHERE email = '${email}'`;
```

如果 `email` 来自用户输入，这种写法可能导致 SQL 注入。

## 32. 性能优化

Node.js 性能问题常见来源：

- CPU 密集任务阻塞事件循环。
- 大文件一次性读入内存。
- 未处理背压。
- JSON 序列化/反序列化过大。
- 数据库查询慢。
- 日志过多或同步写日志。
- 依赖初始化太重。
- 内存泄漏。

### 32.1 观察事件循环延迟

```js
import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  console.log({
    mean: histogram.mean / 1e6,
    max: histogram.max / 1e6
  });
  histogram.reset();
}, 5000);
```

### 32.2 避免阻塞主线程

不推荐：

```js
import { readFileSync } from 'node:fs';

const data = readFileSync('./large.json', 'utf8');
```

服务请求路径中更推荐：

```js
import { readFile } from 'node:fs/promises';

const data = await readFile('./large.json', 'utf8');
```

### 32.3 内存泄漏排查方向

- 全局 Map/Array 持续增长。
- 定时器未清理。
- EventEmitter 监听器重复注册。
- 缓存没有淘汰策略。
- 请求对象、响应对象被意外长期引用。

监听器数量警告通常说明你可能重复注册了事件：

```js
emitter.on('data', handler);
```

如果这段代码在每个请求中执行，但没有移除监听器，就可能泄漏。

## 33. 部署与生产运行

生产服务需要考虑：

- 环境变量。
- 日志。
- 进程守护。
- 健康检查。
- 优雅停机。
- 反向代理。
- HTTPS/TLS。
- 监控告警。
- 依赖锁定。
- Node.js 版本锁定。

### 33.1 优雅停机

```js
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.end('ok');
});

server.listen(3000);

async function shutdown(signal) {
  console.log(`收到 ${signal}，停止接收新请求`);

  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.log('服务已关闭');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

### 33.2 Dockerfile 示例

```Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/index.js"]
```

说明：

- 生产镜像优先选择 LTS，例如 Node.js 24 LTS。
- 使用 `npm ci` 保证按 lockfile 安装。
- `--omit=dev` 不安装开发依赖。
- 容器内不要硬编码密钥，通过环境变量注入。

## 34. 常见项目脚本

```json
{
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test",
    "test:coverage": "node --test --experimental-test-coverage",
    "lint": "eslint ."
  }
}
```

`node --watch` 可以在文件变化时自动重启进程，适合开发阶段。

## 35. 学习路线图

### 第一阶段：基础运行

目标：能写和运行脚本。

要掌握：

- `node` 命令。
- `npm init`。
- ESM 和 CommonJS。
- `process.argv`。
- `fs/promises`。
- `path`。

练习：

1. 写一个统计文件行数的 CLI。
2. 写一个批量重命名文件脚本。
3. 写一个读取 JSON 配置并输出摘要的脚本。

### 第二阶段：异步和核心 API

目标：理解 Node.js 为什么适合 I/O。

要掌握：

- 事件循环。
- Promise 和 async/await。
- EventEmitter。
- Stream。
- Buffer。
- HTTP。

练习：

1. 写一个文件复制工具，使用 `pipeline`。
2. 写一个日志切分工具。
3. 用原生 `http` 写一个 JSON API。

### 第三阶段：工程化

目标：能维护一个可测试的小项目。

要掌握：

- `package.json`。
- npm scripts。
- 环境变量。
- `node:test`。
- 调试。
- 错误处理。

练习：

1. 给工具函数写单元测试。
2. 给 HTTP API 写测试。
3. 为项目添加 `start`、`dev`、`test` 脚本。

### 第四阶段：服务端开发

目标：能开发真实 API 服务。

要掌握：

- Express 或 Fastify。
- 路由。
- 中间件。
- 参数校验。
- 数据库。
- 认证授权。
- 日志和错误处理。

练习：

1. 写一个 Todo API。
2. 加入 SQLite 或 PostgreSQL。
3. 加入登录、JWT、权限判断。
4. 写 API 测试。

### 第五阶段：高级能力

目标：能处理性能、部署和复杂运行问题。

要掌握：

- Worker Threads。
- Child Process。
- 性能分析。
- 内存泄漏排查。
- 权限模型。
- Docker 部署。
- 监控和日志。

练习：

1. 把 CPU 密集任务移到 Worker。
2. 给服务加优雅停机。
3. 用 Docker 部署一个 API。
4. 模拟并排查内存泄漏。

## 36. 推荐实践清单

- 新项目优先使用 ESM：`"type": "module"`。
- 导入内置模块使用 `node:` 前缀。
- 文件 API 优先使用 `node:fs/promises`。
- 大文件处理优先使用 Stream 和 `pipeline`。
- 顶层入口使用 `main().catch(...)` 捕获错误。
- Web 服务中不要在请求路径使用大量同步 I/O。
- CPU 密集任务使用 Worker Threads 或独立服务。
- 命令执行优先使用 `execFile`，避免 shell 注入。
- 配置集中读取并在启动时校验。
- 测试优先覆盖纯函数、业务规则和关键 API。
- 生产环境使用 LTS 版本。
- 依赖版本用 lockfile 固定。
- 日志不要输出敏感信息。

## 37. 一个综合小项目：Todo API

目标：用原生 Node.js 写一个内存版 Todo API。

功能：

- `GET /todos`：获取列表。
- `POST /todos`：创建 Todo。
- `PATCH /todos/:id`：更新完成状态。
- `DELETE /todos/:id`：删除 Todo。

`src/index.js`：

```js
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const todos = new Map();

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function matchTodo(url) {
  const match = url.pathname.match(/^\/todos\/([^/]+)$/);
  return match?.[1];
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/todos') {
      sendJson(res, 200, { data: Array.from(todos.values()) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/todos') {
      const body = await readJson(req);

      if (!body.title) {
        sendJson(res, 400, { error: 'title is required' });
        return;
      }

      const todo = {
        id: randomUUID(),
        title: body.title,
        completed: false,
        createdAt: new Date().toISOString()
      };

      todos.set(todo.id, todo);
      sendJson(res, 201, { data: todo });
      return;
    }

    const id = matchTodo(url);

    if (req.method === 'PATCH' && id) {
      const todo = todos.get(id);

      if (!todo) {
        sendJson(res, 404, { error: 'Todo not found' });
        return;
      }

      const body = await readJson(req);
      const updated = {
        ...todo,
        completed: Boolean(body.completed)
      };

      todos.set(id, updated);
      sendJson(res, 200, { data: updated });
      return;
    }

    if (req.method === 'DELETE' && id) {
      const deleted = todos.delete(id);
      if (deleted) {
        res.statusCode = 204;
        res.end();
      } else {
        sendJson(res, 404, { error: 'Todo not found' });
      }
      return;
    }

    sendJson(res, 404, { error: 'Not Found' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(3000, () => {
  console.log('Todo API listening on http://localhost:3000');
});
```

测试请求：

```bash
curl http://localhost:3000/todos

curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Node.js\"}"
```

这个项目能串起：

- HTTP 服务。
- URL 解析。
- JSON 请求体解析。
- Map 内存存储。
- UUID。
- 错误处理。
- REST 风格接口。

## 38. 继续深入的官方文档入口

- 总文档：<https://nodejs.org/api/>
- 发布计划：<https://nodejs.org/en/about/previous-releases>
- 模块系统：<https://nodejs.org/api/modules.html>、<https://nodejs.org/api/esm.html>
- 包与 package.json：<https://nodejs.org/api/packages.html>
- 文件系统：<https://nodejs.org/api/fs.html>
- 流：<https://nodejs.org/api/stream.html>
- HTTP：<https://nodejs.org/api/http.html>
- 测试运行器：<https://nodejs.org/api/test.html>
- 权限模型：<https://nodejs.org/api/permissions.html>
- SQLite：<https://nodejs.org/api/sqlite.html>
- Worker Threads：<https://nodejs.org/api/worker_threads.html>
- Child Process：<https://nodejs.org/api/child_process.html>

## 39. 最后给你的学习建议

学 Node.js 不要只背 API。真正重要的是理解这几个问题：

1. 一段 JS 代码为什么能访问文件和网络？
2. 异步任务什么时候执行，为什么不会立刻返回结果？
3. 什么任务会阻塞事件循环？
4. 大文件为什么要用流？
5. ESM、CommonJS、package.json 如何影响模块加载？
6. 一个请求从进入 HTTP 服务到返回响应，中间经过哪些层？
7. 生产环境中的日志、错误、配置、退出、部署如何处理？

如果你能用自己的话回答这些问题，并独立写出一个带测试、错误处理、配置和数据库的小 API 服务，就已经真正入门 Node.js 了。
