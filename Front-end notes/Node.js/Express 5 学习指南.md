# Express 5 学习指南

> 版本基准：截至 2026-05-21，npm registry 中 `express` 的 `latest` 为 `5.2.1`。Express 5.x 官方文档要求 Node.js 18 或更高版本。

## 1. Express 是什么

Express 是 Node.js 生态中最经典的 Web 框架之一。它本身不负责数据库、模板规范、项目分层、权限系统，而是提供一组很薄但很稳定的 HTTP 抽象：

- 创建 HTTP 应用：`const app = express()`
- 注册中间件：`app.use(...)`
- 定义路由：`app.get('/users/:id', handler)`
- 读取请求：`req.params`、`req.query`、`req.body`
- 发送响应：`res.status(201).json(data)`
- 组合子路由：`express.Router()`
- 统一处理错误：错误处理中间件 `(err, req, res, next) => {}`

可以把 Express 理解成一条“请求处理流水线”：请求进来后，依次经过匹配到的中间件和路由处理函数，最终由某个处理函数结束响应，或者把错误交给错误处理中间件。

## 2. 最小可运行示例

安装：

```bash
npm init -y
npm install express
```

如果项目使用 ESM：

```json
{
  "type": "module",
  "scripts": {
    "dev": "node src/app.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

`src/app.js`：

```js
import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello Express 5');
});

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Server is running at http://localhost:${port}`);
});
```

核心 API 说明：

- `express()`
  - 参数：无。
  - 返回值：一个 Express application 实例，常命名为 `app`。
  - 作用：用于注册中间件、路由、配置项，并启动 HTTP 服务。
- `app.get(path, ...handlers)`
  - `path`：路由路径，例如 `'/'`、`'/users/:id'`。
  - `handlers`：一个或多个处理函数，形如 `(req, res, next) => {}`。
  - 返回值：`app` 本身，因此可以链式调用。
  - 作用：注册处理 GET 请求的路由。
- `res.send(body)`
  - `body`：字符串、对象、Buffer 等。
  - 返回值：`res` 响应对象。
  - 作用：发送响应并结束本次请求。
- `app.listen(port, callback)`
  - `port`：端口号。
  - `callback`：服务监听成功或失败后的回调。Express 5 中，如果监听发生错误，错误会作为参数传入回调。
  - 返回值：Node.js 的 `http.Server` 实例。
  - 作用：启动 HTTP 服务。

## 3. 一次请求的运行流程

下面是一个典型请求在 Express 中的流动方式：

```text
客户端请求
  -> Node.js http.Server
  -> Express app
  -> 全局中间件 app.use(...)
  -> 路由级中间件 router.use(...)
  -> 具体路由 app.get/app.post/router.METHOD
  -> handler 调用 res.send/res.json/res.end 结束响应
  -> 如果抛错或 next(err)，进入错误处理中间件
```

关键点：

- Express 按注册顺序执行中间件和路由。
- 普通中间件签名是 `(req, res, next)`。
- 错误处理中间件签名是 `(err, req, res, next)`。
- 调用 `next()` 表示把控制权交给下一个匹配项。
- 调用 `res.send()`、`res.json()`、`res.end()` 通常表示响应结束。
- Express 5 中，`async` handler 抛出的错误或 rejected promise 会自动进入错误处理中间件。

示例：

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/users/:id', async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});
```

## 4. 路由系统

### 4.1 HTTP 方法路由

```js
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Ada' }]);
});

app.post('/users', (req, res) => {
  res.status(201).json({ id: 2, ...req.body });
});

app.put('/users/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/users/:id', (req, res) => {
  res.status(204).end();
});
```

API 说明：

- `app.METHOD(path, ...handlers)`
  - `METHOD` 是小写 HTTP 方法，例如 `get`、`post`、`put`、`patch`、`delete`。
  - `path` 可以是字符串路径、路径数组或正则路径。
  - `handlers` 可以有多个，按顺序执行。
  - 返回值：`app`。
  - 作用：注册某个 HTTP 方法对应的路由。

### 4.2 路由参数

```js
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.json({
    userId: req.params.userId,
    bookId: req.params.bookId,
  });
});
```

`req.params`：

- 类型：对象。
- 来源：路径中的命名参数。
- 示例：请求 `/users/42/books/7` 时，`req.params` 为 `{ userId: '42', bookId: '7' }`。
- 注意：参数默认是字符串，需要数值时自行转换。

### 4.3 查询字符串

```js
app.get('/search', (req, res) => {
  const { keyword = '', page = '1' } = req.query;

  res.json({
    keyword,
    page: Number(page),
  });
});
```

`req.query`：

- 类型：对象。
- 来源：URL 的查询字符串，例如 `/search?keyword=node&page=2`。
- 作用：读取筛选、排序、分页等非路径资源标识信息。

### 4.4 Express 5 路径匹配变化

Express 5 使用了新的路径匹配规则，旧教程中的部分写法需要调整：

```js
// Express 5：通配符必须命名
app.get('/*splat', (req, res) => {
  res.json({ splat: req.params.splat });
});

// 如果要连根路径 / 也匹配，使用：
app.get('/{*splat}', (req, res) => {
  res.send('matched');
});

// Express 5：可选部分使用花括号
app.get('/:file{.:ext}', (req, res) => {
  res.json(req.params);
});
```

## 5. 中间件

中间件是 Express 的核心。它可以读取请求、修改请求对象、提前结束响应、继续交给后续处理器，或把错误传给错误处理中间件。

```js
function auth(req, res, next) {
  const token = req.get('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  req.user = { id: 1, role: 'admin' };
  next();
}

app.get('/admin', auth, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}` });
});
```

API 说明：

- `app.use([path], ...middlewares)`
  - `path`：可选。省略时匹配所有路径；传入 `'/api'` 时，只匹配该前缀下的请求。
  - `middlewares`：一个或多个中间件函数。
  - 返回值：`app`。
  - 作用：注册应用级中间件。
- `next()`
  - 参数：无时进入下一个普通中间件或路由。
  - `next(err)`：跳过普通处理器，进入错误处理中间件。
  - 返回值：无实际业务返回值。
  - 作用：显式转交控制权。

常见中间件类型：

- 日志：记录请求方法、路径、耗时。
- 解析请求体：`express.json()`、`express.urlencoded()`。
- 静态资源：`express.static()`。
- 鉴权：校验登录态、JWT、session。
- 参数校验：检查 body、query、params。
- 错误处理：统一返回错误格式。

## 6. 请求体解析

默认情况下，Express 不会自动解析 JSON 请求体。你需要注册解析中间件。

```js
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/articles', (req, res) => {
  res.status(201).json({
    title: req.body.title,
    content: req.body.content,
  });
});
```

API 说明：

- `express.json([options])`
  - `options.limit`：限制请求体大小，例如 `'100kb'`、`'1mb'`。
  - `options.type`：指定要解析的 Content-Type，默认是 JSON 类型。
  - 返回值：中间件函数。
  - 作用：解析 JSON 请求体，并把结果放到 `req.body`。
- `express.urlencoded([options])`
  - `options.extended`：是否使用更强的嵌套对象解析能力。Express 5 默认是 `false`。
  - `options.limit`：请求体大小限制。
  - 返回值：中间件函数。
  - 作用：解析 HTML form 表单提交的 `application/x-www-form-urlencoded` 数据。
- `req.body`
  - 类型：通常是对象，也可能是字符串、Buffer，取决于解析中间件。
  - 注意：Express 5 中，如果没有解析请求体，`req.body` 是 `undefined`，不是 `{}`。

生产项目建议：

```js
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
```

## 7. Response 常用 API

### 7.1 `res.status(code)`

```js
res.status(404).json({ message: 'User not found' });
```

- `code`：HTTP 状态码，Express 5 要求是合法整数状态码。
- 返回值：`res`。
- 作用：设置响应状态码，不会单独结束响应，通常链式调用 `send` 或 `json`。

### 7.2 `res.json(body)`

```js
res.json({ id: 1, name: 'Ada' });
```

- `body`：会被序列化为 JSON 的值。
- 返回值：`res`。
- 作用：设置 JSON 响应头并发送 JSON 数据。

### 7.3 `res.send(body)`

```js
res.send('<h1>Hello</h1>');
```

- `body`：字符串、Buffer、对象、数组等。
- 返回值：`res`。
- 作用：发送响应。对象和数组通常会被作为 JSON 发送，但 API 语义上更通用。

### 7.4 `res.sendStatus(code)`

```js
res.sendStatus(204);
```

- `code`：HTTP 状态码。
- 返回值：`res`。
- 作用：设置状态码，并发送对应状态文本作为响应体。`204` 这类无内容状态不会发送 body。

### 7.5 `res.redirect([status], path)`

```js
res.redirect(302, '/login');
```

- `status`：可选，默认 `302`。
- `path`：跳转地址，可以是站内路径或完整 URL。
- 返回值：`res`。
- 作用：返回重定向响应。

### 7.6 `res.set(field, value)`

```js
res.set('Cache-Control', 'no-store');
res.json({ ok: true });
```

- `field`：响应头名称，或一个对象。
- `value`：响应头值。
- 返回值：`res`。
- 作用：设置响应头。

## 8. Request 常用 API

```js
app.get('/reports/:id', (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    id: req.params.id,
    query: req.query,
    userAgent: req.get('User-Agent'),
    acceptsJson: req.accepts('json'),
    ip: req.ip,
  });
});
```

常用属性：

- `req.params`：路径参数对象。
- `req.query`：查询字符串对象。
- `req.body`：请求体解析结果。
- `req.method`：HTTP 方法。
- `req.path`：不含 query 的路径。
- `req.originalUrl`：原始请求 URL。
- `req.ip`：客户端 IP，代理场景下需要正确配置 `trust proxy`。

常用方法：

- `req.get(field)`
  - `field`：请求头名称。
  - 返回值：请求头值，找不到时通常是 `undefined`。
  - 作用：读取请求头。
- `req.accepts(types)`
  - `types`：一个类型、多个类型参数或数组，例如 `'json'`、`['html', 'json']`。
  - 返回值：最佳匹配的类型；不匹配时返回 `false`。
  - 作用：基于 `Accept` 请求头做内容协商。
- `req.is(type)`
  - `type`：内容类型，例如 `'json'`、`'text/*'`。
  - 返回值：匹配的类型字符串或 `false`。
  - 作用：判断请求体的 Content-Type。

## 9. Router 模块化路由

当项目变大后，不应把所有路由写在一个文件里。`express.Router()` 用于创建子路由模块。

`src/routes/users.js`：

```js
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Ada' }]);
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Ada' });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 2, ...req.body });
});

export default router;
```

`src/app.js`：

```js
import express from 'express';
import usersRouter from './routes/users.js';

const app = express();

app.use(express.json());
app.use('/users', usersRouter);
```

API 说明：

- `express.Router([options])`
  - `options.caseSensitive`：是否区分大小写路径。
  - `options.mergeParams`：是否从父路由保留 `req.params`。
  - `options.strict`：是否严格区分尾部斜杠。
  - 返回值：router 实例。
  - 作用：创建可挂载的模块化路由容器。
- `router.get/post/put/delete(path, ...handlers)`
  - 参数与 `app.METHOD` 类似。
  - 返回值：`router`。
  - 作用：在子路由上注册路由。
- `router.use([path], ...middlewares)`
  - 参数与 `app.use` 类似。
  - 返回值：`router`。
  - 作用：注册路由级中间件。

## 10. 错误处理

Express 的错误处理中间件必须有 4 个参数：

```js
app.use((err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});
```

Express 5 的重要变化：异步 handler 中抛出的错误会自动进入错误处理中间件。

```js
app.get('/users/:id', async (req, res) => {
  const user = await getUserById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  res.json(user);
});
```

API 和流程说明：

- `throw error`：在同步或 async handler 中抛出错误。
- `next(error)`：手动把错误传给错误处理中间件。
- 错误处理中间件返回值：通常不依赖返回值，而是通过 `res` 结束响应。
- 注册位置：错误处理中间件通常放在所有路由之后。

建议定义一个 HTTP 错误工具：

```js
export function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
```

使用：

```js
app.get('/users/:id', async (req, res) => {
  const user = await getUserById(req.params.id);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.json(user);
});
```

## 11. 静态资源

```js
app.use('/assets', express.static('public'));
```

API 说明：

- `express.static(root, [options])`
  - `root`：静态资源目录。
  - `options.maxAge`：缓存时间。
  - `options.index`：默认首页文件，默认通常是 `index.html`。
  - `options.dotfiles`：如何处理点文件。Express 5 中 dotfiles 默认更安全，通常是忽略。
  - 返回值：中间件函数。
  - 作用：把本地目录映射为可访问的静态资源路径。

示例：

```text
public/logo.png
```

访问：

```text
GET /assets/logo.png
```

如果需要公开 `.well-known`：

```js
app.use(
  '/.well-known',
  express.static('public/.well-known', { dotfiles: 'allow' }),
);
app.use(express.static('public'));
```

## 12. 配置与环境变量

Express 自身提供 `app.set` / `app.get(name)` 维护应用配置。

```js
app.set('trust proxy', true);
app.set('json spaces', 2);

console.log(app.get('trust proxy'));
```

API 说明：

- `app.set(name, value)`
  - `name`：配置项名称。
  - `value`：配置值。
  - 返回值：`app`。
  - 作用：设置应用配置。
- `app.get(name)`
  - `name`：配置项名称。
  - 返回值：配置值。
  - 作用：读取应用配置。

真实项目里，端口、数据库地址、密钥通常来自环境变量：

```js
const port = Number(process.env.PORT || 3000);
```

## 13. 推荐项目结构

适合学习和中小型 API 项目的结构：

```text
src/
  app.js
  server.js
  routes/
    users.routes.js
  controllers/
    users.controller.js
  services/
    users.service.js
  middlewares/
    error.middleware.js
    auth.middleware.js
  utils/
    http-error.js
```

职责划分：

- `app.js`：创建 app，注册中间件和路由。
- `server.js`：读取端口，启动监听。
- `routes`：声明 URL 和 HTTP 方法。
- `controllers`：处理 `req` 和 `res`，负责 HTTP 层。
- `services`：业务逻辑，不依赖 Express。
- `middlewares`：通用请求处理逻辑。
- `utils`：工具函数。

示例：

```js
// controllers/users.controller.js
import { listUsers } from '../services/users.service.js';

export async function getUsers(req, res) {
  const users = await listUsers();
  res.json(users);
}
```

```js
// routes/users.routes.js
import express from 'express';
import { getUsers } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', getUsers);

export default router;
```

## 14. REST API 设计入门

以用户资源为例：

```text
GET    /users        查询列表
GET    /users/:id    查询详情
POST   /users        创建用户
PATCH  /users/:id    局部更新用户
DELETE /users/:id    删除用户
```

状态码建议：

- `200 OK`：查询或普通成功。
- `201 Created`：创建成功。
- `204 No Content`：删除成功且无响应体。
- `400 Bad Request`：请求参数格式错误。
- `401 Unauthorized`：未登录或 token 无效。
- `403 Forbidden`：已登录但无权限。
- `404 Not Found`：资源不存在。
- `409 Conflict`：资源冲突，例如邮箱已存在。
- `500 Internal Server Error`：服务端未预期错误。

## 15. 参数校验

Express 不内置校验库。推荐把校验做成中间件，常见选择有 Zod、Joi、Valibot 等。

不用库的最小示例：

```js
function validateCreateUser(req, res, next) {
  const { name, email } = req.body || {};

  if (typeof name !== 'string' || name.length < 2) {
    return res.status(400).json({ message: 'name is invalid' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'email is invalid' });
  }

  next();
}

app.post('/users', validateCreateUser, (req, res) => {
  res.status(201).json(req.body);
});
```

真实项目建议：

- `params`、`query`、`body` 分开校验。
- controller 只处理已校验的数据。
- 错误响应格式保持统一。

## 16. 认证与授权

Express 不规定认证方案。常见做法：

- Cookie + Session：适合传统网页。
- JWT Bearer Token：适合前后端分离 API。
- OAuth/OIDC：适合第三方登录和企业身份系统。

简单 Bearer Token 示例：

```js
function requireAuth(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authorization.slice('Bearer '.length);

  if (token !== 'dev-token') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = { id: 1, role: 'admin' };
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

app.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ ok: true });
});
```

## 17. 安全要点

学习阶段至少养成这些习惯：

- 限制 body 大小：`express.json({ limit: '1mb' })`。
- 不把原始错误堆栈返回给客户端。
- 对所有外部输入做校验。
- 使用 HTTPS，由反向代理或部署平台处理 TLS。
- 配置 `trust proxy` 前确认自己在可信代理后面。
- 静态资源不要暴露项目根目录。
- 生产环境使用安全响应头库，例如 `helmet`。
- 跨域用 `cors` 明确允许的 origin，不要随手全开放生产接口。

## 18. 性能与部署

Express 应用通常部署在：

- Node.js 进程管理器：PM2、systemd、Docker。
- 平台：Render、Railway、Fly.io、Vercel Serverless Functions、AWS、阿里云等。
- 反向代理：Nginx、Caddy、云负载均衡。

生产建议：

```js
app.set('trust proxy', 1);
app.disable('x-powered-by');
```

说明：

- `trust proxy`：让 Express 正确理解代理转发后的协议、IP 等信息。
- `app.disable('x-powered-by')`：关闭默认的 `X-Powered-By` 响应头。

健康检查：

```js
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

优雅关闭：

```js
const server = app.listen(port, onListen);

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
```

## 19. 测试 Express API

常用组合：测试框架 + `supertest`。

```bash
npm install -D vitest supertest
```

`src/app.js` 不直接监听端口：

```js
import express from 'express';

export const app = express();

app.use(express.json());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});
```

测试：

```js
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('GET /healthz', () => {
  it('returns ok', async () => {
    const response = await request(app).get('/healthz');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

为什么 `app.js` 和 `server.js` 分开：

- 测试时直接传入 `app`，不需要真的占用端口。
- 部署时由 `server.js` 负责监听端口。

## 20. 从零到项目的学习路线

第一阶段：能跑起来

- 安装 Express。
- 写 `GET /`。
- 理解 `app.listen`。
- 用浏览器或 curl 请求接口。

第二阶段：掌握请求和响应

- 路由参数：`req.params`。
- 查询字符串：`req.query`。
- JSON body：`express.json()` + `req.body`。
- 响应：`res.status()`、`res.json()`、`res.send()`。

第三阶段：理解中间件

- 写日志中间件。
- 写鉴权中间件。
- 写参数校验中间件。
- 理解 `next()` 和 `next(err)`。

第四阶段：项目分层

- 用 `Router` 拆路由。
- controller 处理 HTTP。
- service 处理业务。
- error middleware 统一错误。

第五阶段：工程化

- 加入测试。
- 加入环境变量。
- 加入安全中间件。
- 加入日志、健康检查、优雅关闭。

第六阶段：连接真实数据

- 接入数据库。
- 实现 CRUD。
- 处理分页、筛选、排序。
- 处理认证授权。

## 21. 完整示例：一个小型用户 API

```js
import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3000);

let users = [
  { id: 1, name: 'Ada', email: 'ada@example.com' },
];

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateUser(req, res, next) {
  const { name, email } = req.body || {};

  if (typeof name !== 'string' || name.trim().length < 2) {
    throw createHttpError(400, 'name is invalid');
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw createHttpError(400, 'email is invalid');
  }

  next();
}

app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.json(user);
});

app.post('/users', validateUser, (req, res) => {
  const user = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
  };

  users.push(user);

  res.status(201).json(user);
});

app.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((item) => item.id === id);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (typeof req.body.name === 'string') {
    user.name = req.body.name;
  }

  if (typeof req.body.email === 'string') {
    user.email = req.body.email;
  }

  res.json(user);
});

app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const beforeLength = users.length;

  users = users.filter((item) => item.id !== id);

  if (users.length === beforeLength) {
    throw createHttpError(404, 'User not found');
  }

  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Server is running at http://localhost:${port}`);
});
```

这个示例串起来了：

- `express()` 创建 app。
- `express.json()` 解析 JSON body。
- `app.get/post/patch/delete` 定义 REST API。
- `req.params` 读取路径参数。
- `req.body` 读取请求体。
- `res.status().json()` 发送结构化响应。
- 普通中间件做校验。
- 404 中间件处理未匹配路由。
- 错误处理中间件统一错误响应。

## 22. Express 5 学习时要特别记住的变化

- Express 5 需要 Node.js 18+。
- async 路由或中间件里抛错，可以自动进入错误处理中间件。
- 通配符路由必须命名，例如 `/*splat`，不是 `/*`。
- 可选路径部分使用花括号，例如 `/:file{.:ext}`。
- `express.urlencoded()` 的 `extended` 默认是 `false`。
- 未解析请求体时，`req.body` 是 `undefined`。
- `express.static` 对 dotfiles 的默认行为更安全，公开 `.well-known` 需要显式配置。
- `app.listen` 的回调在监听错误时会收到 `error` 参数。

## 23. 官方参考资料

- Express 5 API Reference: https://expressjs.com/en/5x/api/
- Express Routing Guide: https://expressjs.com/en/guide/routing/
- Express Using Middleware: https://expressjs.com/en/guide/using-middleware/
- Express Error Handling: https://expressjs.com/en/guide/error-handling/
- Express 5 Migration Guide: https://expressjs.com/en/guide/migrating-5/
- npm express latest metadata: https://registry.npmjs.org/express/latest
