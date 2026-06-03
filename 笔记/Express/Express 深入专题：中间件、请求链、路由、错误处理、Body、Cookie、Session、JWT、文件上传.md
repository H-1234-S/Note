## Express 深入专题：中间件、请求链、路由、错误处理、Body、Cookie、Session、JWT、文件上传

> 适用版本：Express 5.x。本文假设你已经知道如何创建一个最小 Express 应用，重点放在“为什么这样写”和“请求在框架内部如何流动”。

## 1. 总览：Express 的核心模型

Express 最核心的抽象不是 MVC，也不是 REST，而是“请求处理栈”。

每个请求进入 Express 后，会沿着一组按注册顺序排列的 layer 依次尝试匹配：

```text
request
  -> app-level middleware
  -> router mount path
  -> router-level middleware
  -> route middleware
  -> route handler
  -> response
```

如果中途发生错误：

```text
request
  -> middleware
  -> throw error / next(error)
  -> skip normal handlers
  -> error-handling middleware
  -> error response
```

Express 的很多 API，本质都是往这个栈里添加 layer：

```js
app.use(logger);
app.use(express.json());
app.get('/users/:id', auth, getUser);
app.use(errorHandler);
```

可以把它们理解成：

```text
Layer 1: 所有请求先经过 logger
Layer 2: 所有 JSON 请求尝试解析 body
Layer 3: GET /users/:id 经过 auth，再经过 getUser
Layer 4: 如果有错误，进入 errorHandler
```

## 2. 中间件 Middleware

### 2.1 中间件是什么

中间件是一个函数，它可以访问：

- `req`：请求对象。
- `res`：响应对象。
- `next`：把控制权交给下一个处理器的函数。

普通中间件签名：

```js
function middleware(req, res, next) {
  next();
}
```

错误处理中间件签名：

```js
function errorMiddleware(err, req, res, next) {
  res.status(500).json({ message: err.message });
}
```

中间件可以做 4 件事：

- 执行任意逻辑，例如日志、鉴权、统计耗时。
- 修改 `req` 或 `res`，例如挂载 `req.user`。
- 结束响应，例如 `res.status(401).json(...)`。
- 调用 `next()` 继续请求链。

最重要的一条规则：

```text
如果当前中间件没有结束响应，就必须调用 next()。
```

否则请求会一直挂起，客户端最终超时。

### 2.2 `app.use([path], ...middlewares)`

```js
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use('/admin', (req, res, next) => {
  console.log('admin area');
  next();
});
```

API 说明：

- `path`
  - 可选。
  - 不传时，匹配所有请求。
  - 传 `'/admin'` 时，匹配以 `/admin` 开头的请求。
  - `app.use('/admin', middleware)` 不是只匹配 `/admin`，也匹配 `/admin/users`。
- `middlewares`
  - 一个或多个中间件函数。
  - 也可以是数组。
- 返回值
  - 返回 `app`，可链式调用。
- 作用
  - 注册应用级中间件。

注意 `app.use` 通常不关心 HTTP 方法：

```js
app.use('/api', middleware);
```

这会匹配：

```text
GET /api/users
POST /api/users
PATCH /api/users/1
DELETE /api/users/1
```

### 2.3 `next()`、`next(error)`、`next('route')`、`next('router')`

#### `next()`

```js
app.use((req, res, next) => {
  req.startedAt = Date.now();
  next();
});
```

- 参数：无。
- 返回值：一般不使用。
- 作用：继续执行下一个匹配的中间件或路由处理函数。

#### `next(error)`

```js
app.use((req, res, next) => {
  if (!req.get('Authorization')) {
    return next(new Error('Missing Authorization header'));
  }

  next();
});
```

- 参数：错误对象或错误值。
- 返回值：一般不使用。
- 作用：跳过普通中间件和普通路由，进入错误处理中间件。

#### `next('route')`

```js
app.get(
  '/users/:id',
  (req, res, next) => {
    if (req.params.id === 'me') {
      return next('route');
    }

    next();
  },
  (req, res) => {
    res.json({ type: 'normal user', id: req.params.id });
  },
);

app.get('/users/me', (req, res) => {
  res.json({ type: 'current user' });
});
```

- 参数：字符串 `'route'`。
- 作用：跳过当前 route 上剩余的 handler，继续寻找下一个匹配路由。
- 限制：只对 `app.METHOD()` 或 `router.METHOD()` 注册的中间件生效。

#### `next('router')`

```js
const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
  if (!req.get('X-Admin')) {
    return next('router');
  }

  next();
});

adminRouter.get('/stats', (req, res) => {
  res.json({ users: 100 });
});

app.use('/admin', adminRouter, (req, res) => {
  res.status(401).json({ message: 'Admin required' });
});
```

- 参数：字符串 `'router'`。
- 作用：跳出当前 router，回到挂载它的外层处理链。
- 常见用途：整组路由的前置鉴权失败后，交给外层统一返回。

### 2.4 中间件的执行顺序

```js
app.use((req, res, next) => {
  console.log('A');
  next();
});

app.get('/hello', (req, res, next) => {
  console.log('B');
  next();
});

app.get('/hello', (req, res) => {
  console.log('C');
  res.send('hello');
});
```

请求：

```text
GET /hello
```

输出：

```text
A
B
C
```

如果 B 中直接响应：

```js
app.get('/hello', (req, res) => {
  console.log('B');
  res.send('stopped');
});
```

那么后面的 C 不会执行。

### 2.5 洋葱模型：为什么响应后还能执行代码

```js
app.use(async (req, res, next) => {
  const startedAt = Date.now();

  await next();

  console.log(`cost: ${Date.now() - startedAt}ms`);
});
```

上面这种 Koa 风格在 Express 里并不成立，因为 Express 的 `next()` 不是 Promise 风格的“等待下游完成”。Express 中更常见的写法是监听响应事件：

```js
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });

  next();
});
```

`res.on('finish')`：

- 参数：事件名 `'finish'` 和回调函数。
- 返回值：`res` 事件发射器本身。
- 作用：响应已经交给底层系统发送后触发，适合记录日志、耗时、状态码。

## 3. 请求链 Request Chain

### 3.1 请求链的组成

一个请求链可以包含：

- 全局中间件：日志、body parser、cookie parser。
- 前缀中间件：`app.use('/api', ...)`。
- router 中间件：`router.use(...)`。
- 路由级中间件：`router.get('/users', auth, validate, handler)`。
- 错误处理中间件。

示例：

```js
app.use(requestId);
app.use(logger);
app.use(express.json());
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);
```

请求 `POST /api/users` 的链路：

```text
requestId
  -> logger
  -> express.json
  -> apiRouter
  -> apiRouter 内部匹配 POST /users
  -> route middlewares
  -> route handler
  -> response
```

### 3.2 `req.baseUrl`、`req.path`、`req.originalUrl`

当使用 router 时，这三个属性非常重要。

```js
const router = express.Router();

router.get('/users/:id', (req, res) => {
  res.json({
    baseUrl: req.baseUrl,
    path: req.path,
    originalUrl: req.originalUrl,
  });
});

app.use('/api/v1', router);
```

请求：

```text
GET /api/v1/users/1?debug=true
```

结果：

```json
{
  "baseUrl": "/api/v1",
  "path": "/users/1",
  "originalUrl": "/api/v1/users/1?debug=true"
}
```

API 说明：

- `req.baseUrl`
  - 类型：字符串。
  - 作用：当前 router 被挂载的路径。
- `req.path`
  - 类型：字符串。
  - 作用：不包含 query 的当前路径。
- `req.originalUrl`
  - 类型：字符串。
  - 作用：客户端请求的原始 URL，包含挂载路径和 query。

### 3.3 什么时候应该结束响应

结束响应的常见 API：

```js
res.send('ok');
res.json({ ok: true });
res.end();
res.redirect('/login');
res.sendStatus(204);
```

重要原则：

```text
同一个请求只能发送一次响应。
```

错误示例：

```js
app.get('/bad', (req, res, next) => {
  res.json({ ok: true });
  next();
});

app.get('/bad', (req, res) => {
  res.json({ message: 'second response' });
});
```

这会导致常见错误：

```text
Cannot set headers after they are sent to the client
```

如果你已经响应了，就不要继续 `next()`，除非你非常明确后续中间件不会再改响应。

### 3.4 `res.headersSent`

```js
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ message: 'Internal Server Error' });
});
```

API 说明：

- `res.headersSent`
  - 类型：布尔值。
  - 作用：判断响应头是否已经发送。
  - 常见用途：错误处理中，如果响应已经开始发送，就交给 Express 默认错误处理器或外层处理。

## 4. 路由 Routing

### 4.1 路由的本质

路由负责把：

```text
HTTP 方法 + URL 路径
```

映射到：

```text
一个或多个 handler
```

示例：

```js
app.get('/users/:id', auth, validateUserId, getUserById);
```

这个路由表示：

```text
当请求方法是 GET 且路径匹配 /users/:id 时，
按顺序执行 auth -> validateUserId -> getUserById。
```

### 4.2 `app.METHOD(path, ...handlers)`

```js
app.get('/users', listUsers);
app.post('/users', createUser);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
```

API 说明：

- `METHOD`
  - HTTP 方法的小写形式，例如 `get`、`post`、`put`、`patch`、`delete`。
- `path`
  - 路由路径。
  - 可以包含命名参数，例如 `'/users/:id'`。
  - Express 5 中路径语法比旧版本更严格。
- `handlers`
  - 一个或多个普通中间件或路由处理函数。
  - 每个 handler 的签名通常是 `(req, res, next)`。
- 返回值
  - `app`。
- 作用
  - 注册特定 HTTP 方法的路由。

### 4.3 `app.all(path, ...handlers)`

```js
app.all('/secret', requireAuth);

app.get('/secret', (req, res) => {
  res.json({ message: 'read secret' });
});

app.post('/secret', (req, res) => {
  res.json({ message: 'write secret' });
});
```

API 说明：

- `path`：路径。
- `handlers`：一个或多个处理函数。
- 返回值：`app`。
- 作用：匹配所有 HTTP 方法。
- 常见用途：给某个路径统一加鉴权、日志或开关控制。

### 4.4 `app.route(path)`

```js
app
  .route('/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
```

API 说明：

- `path`：共享的路由路径。
- 返回值：Route 实例。
- 作用：把同一路径的多个 HTTP 方法聚合在一起。

适合：

- 同一个资源详情路径。
- 让 REST 资源更集中。

不适合：

- 路由特别多、controller 很复杂的模块。那时用 `Router` 更清晰。

### 4.5 `express.Router([options])`

```js
const router = express.Router({
  caseSensitive: false,
  mergeParams: true,
  strict: false,
});
```

API 说明：

- `caseSensitive`
  - 类型：布尔值。
  - 作用：是否区分路径大小写。
- `mergeParams`
  - 类型：布尔值。
  - 作用：是否保留父 router 的 `req.params`。
- `strict`
  - 类型：布尔值。
  - 作用：是否严格区分尾部斜杠。
- 返回值
  - Router 实例。
- 作用
  - 创建一个可挂载、可组合的子路由容器。

### 4.6 嵌套路由和 `mergeParams`

```js
const commentsRouter = express.Router({ mergeParams: true });

commentsRouter.get('/', (req, res) => {
  res.json({
    articleId: req.params.articleId,
    comments: [],
  });
});

app.use('/articles/:articleId/comments', commentsRouter);
```

如果没有 `mergeParams: true`，`commentsRouter` 内部可能拿不到父路径上的 `articleId`。

适用场景：

```text
/users/:userId/posts
/articles/:articleId/comments
/teams/:teamId/members
```

### 4.7 `router.param(name, callback)`

```js
router.param('userId', async (req, res, next, value) => {
  const user = await findUserById(value);

  if (!user) {
    return next(createHttpError(404, 'User not found'));
  }

  req.user = user;
  next();
});

router.get('/users/:userId', (req, res) => {
  res.json(req.user);
});
```

API 说明：

- `name`
  - 路由参数名，例如 `'userId'`。
- `callback`
  - 签名：`(req, res, next, value, name)`。
  - `value` 是参数值。
  - `name` 是参数名。
- 返回值
  - `router`。
- 作用
  - 当路由匹配到该参数时，预处理参数。

适合：

- 根据 id 预加载资源。
- 校验 id 格式。
- 给 `req` 挂载资源。

谨慎点：

- 不要在 `router.param` 里做过重逻辑。
- 如果多个路由都需要同一资源，`router.param` 很方便。
- 如果只有一个路由需要，普通中间件更直观。

## 5. 错误处理 Error Handling

### 5.1 Express 中错误的来源

常见错误来源：

- 同步代码 `throw`。
- async handler 中 `throw`。
- Promise reject。
- 手动 `next(error)`。
- body parser 解析失败。
- 文件上传中间件报错。
- 数据库、网络、权限、参数校验等业务错误。

Express 5 的重点：async handler 中抛出的错误会自动进入错误处理中间件。

```js
app.get('/users/:id', async (req, res) => {
  const user = await getUser(req.params.id);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.json(user);
});
```

不需要再包一层：

```js
// Express 4 常见写法，Express 5 中多数场景不再需要
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### 5.2 错误处理中间件

```js
app.use((err, req, res, next) => {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
});
```

API 说明：

- `err`
  - 错误对象。
  - 可以包含 `message`、`status`、`code`、`details` 等字段。
- `req`
  - 当前请求对象。
- `res`
  - 当前响应对象。
- `next`
  - 可以继续把错误交给下一个错误处理中间件。
- 返回值
  - 通常不依赖返回值，而是通过 `res` 结束响应。
- 作用
  - 统一处理错误响应。

注册位置：

```js
app.use(routes);
app.use(notFound);
app.use(errorHandler);
```

错误处理中间件通常放在所有普通路由之后。

### 5.3 404 不是“错误处理中间件”自动接住的

如果没有任何路由匹配，请求会走到链尾。你需要显式添加 404 中间件：

```js
app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'));
});
```

或者直接响应：

```js
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
```

区别：

- 直接响应：简单。
- `next(404 error)`：所有错误都走统一格式。

### 5.4 推荐错误对象结构

```js
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function createHttpError(status, message, details) {
  return new HttpError(status, message, details);
}
```

统一错误响应：

```js
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status) ? err.status : 500;

  res.status(status).json({
    message: status >= 500 ? 'Internal Server Error' : err.message,
    details: status >= 500 ? undefined : err.details,
  });
});
```

为什么生产环境不直接返回 `err.stack`：

- 栈信息可能暴露文件路径。
- 可能暴露内部模块、数据库字段、业务规则。
- 对客户端没有稳定契约。

### 5.5 错误分类

建议把错误分为：

- 客户端错误：`400`、`401`、`403`、`404`、`409`、`422`。
- 服务端错误：`500`、`502`、`503`。
- 预期业务错误：邮箱重复、权限不足、资源不存在。
- 非预期错误：数据库断开、代码 bug、第三方服务异常。

示例：

```js
app.post('/users', async (req, res) => {
  const exists = await userService.existsByEmail(req.body.email);

  if (exists) {
    throw createHttpError(409, 'Email already exists');
  }

  const user = await userService.create(req.body);
  res.status(201).json(user);
});
```

## 6. Body Parser

### 6.1 为什么需要 body parser

HTTP 请求体本质上是字节流。Express 不会凭空知道它是 JSON、表单、文本还是二进制。

你必须根据 `Content-Type` 选择解析器：

```text
application/json                  -> express.json()
application/x-www-form-urlencoded -> express.urlencoded()
text/plain                        -> express.text()
application/octet-stream          -> express.raw()
multipart/form-data               -> multer / busboy 等
```

### 6.2 `express.json([options])`

```js
app.use(express.json({ limit: '1mb' }));
```

API 说明：

- `options`
  - `limit`：请求体大小限制，例如 `'100kb'`、`'1mb'`。
  - `type`：匹配哪些 Content-Type，默认匹配 JSON。
  - `strict`：是否只接受数组和对象，默认通常为 `true`。
  - `reviver`：传给 `JSON.parse` 的 reviver。
  - `verify`：在解析前访问原始 buffer 的函数。
- 返回值
  - 中间件函数。
- 作用
  - 解析 JSON 请求体，把解析结果放到 `req.body`。

示例：

```js
app.post('/json', express.json({ limit: '1mb' }), (req, res) => {
  res.json({
    body: req.body,
  });
});
```

请求：

```http
POST /json
Content-Type: application/json

{"name":"Ada"}
```

结果：

```json
{
  "body": {
    "name": "Ada"
  }
}
```

如果没有匹配的 `Content-Type`，`req.body` 不会被这个中间件解析。

### 6.3 `express.urlencoded([options])`

```js
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
```

API 说明：

- `extended`
  - `false`：使用较简单的 querystring 风格解析。
  - `true`：允许更复杂的嵌套对象结构。
  - Express 5 默认是 `false`。
- `limit`
  - 请求体大小限制。
- `type`
  - 匹配的 Content-Type，默认处理 `application/x-www-form-urlencoded`。
- 返回值
  - 中间件函数。
- 作用
  - 解析 HTML 表单提交的数据，把结果放到 `req.body`。

示例：

```js
app.post('/login', express.urlencoded({ extended: false }), (req, res) => {
  res.json({
    username: req.body.username,
  });
});
```

表单请求体：

```text
username=ada&password=123456
```

解析后：

```js
req.body = {
  username: 'ada',
  password: '123456',
};
```

### 6.4 `express.raw([options])`

```js
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const rawBody = req.body;
    res.sendStatus(204);
  },
);
```

API 说明：

- `type`
  - 要解析的 Content-Type。
- `limit`
  - 大小限制。
- 返回值
  - 中间件函数。
- 作用
  - 把请求体解析为 Buffer。

适合：

- 第三方 webhook 签名校验。
- 需要原始 body 的接口。

注意：如果先用了 `express.json()`，原始 body 可能已经被消费，后面的 `express.raw()` 就拿不到了。body 流通常只能读一次。

### 6.5 body parser 顺序很重要

错误示例：

```js
app.post('/users', createUser);
app.use(express.json());
```

`createUser` 中读不到 `req.body`，因为 body parser 注册在路由后面。

正确示例：

```js
app.use(express.json());
app.post('/users', createUser);
```

### 6.6 body parser 和文件上传

`express.json()` 和 `express.urlencoded()` 不处理 `multipart/form-data`。

前端如果使用：

```js
const formData = new FormData();
formData.append('avatar', file);
formData.append('name', 'Ada');
```

后端应该使用 `multer` 这类 multipart 解析中间件，而不是 `express.json()`。

## 7. Cookie

### 7.1 Cookie 是什么

Cookie 是浏览器自动保存并随请求发送的小段数据。

服务端响应：

```http
Set-Cookie: sid=abc123; HttpOnly; Path=/; SameSite=Lax
```

浏览器之后请求同站接口时会自动带上：

```http
Cookie: sid=abc123
```

Cookie 常用于：

- session id。
- refresh token。
- 轻量偏好设置。
- CSRF token 的一部分。

不适合：

- 保存大量数据。
- 保存敏感明文数据。
- 保存会频繁变化的大对象。

### 7.2 `res.cookie(name, value, [options])`

```js
app.post('/login', (req, res) => {
  res.cookie('sid', 'abc123', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60,
  });

  res.json({ ok: true });
});
```

API 说明：

- `name`
  - Cookie 名称。
- `value`
  - Cookie 值。
  - 可以是字符串，也可以是对象；对象会被序列化。
- `options`
  - `httpOnly`：浏览器 JS 不能通过 `document.cookie` 读取。
  - `secure`：只通过 HTTPS 发送。
  - `sameSite`：限制跨站发送，常见值 `'lax'`、`'strict'`、`'none'`。
  - `maxAge`：相对过期时间，单位毫秒。
  - `expires`：绝对过期时间。
  - `path`：Cookie 生效路径。
  - `domain`：Cookie 生效域名。
  - `signed`：是否签名，需要 cookie-parser secret。
- 返回值
  - `res`。
- 作用
  - 设置 `Set-Cookie` 响应头。

### 7.3 `res.clearCookie(name, [options])`

```js
app.post('/logout', (req, res) => {
  res.clearCookie('sid', {
    path: '/',
  });

  res.sendStatus(204);
});
```

API 说明：

- `name`：要清除的 Cookie 名称。
- `options`：需要和设置 Cookie 时的 `path`、`domain` 等关键选项保持一致。
- 返回值：`res`。
- 作用：让浏览器删除 Cookie。

### 7.4 `cookie-parser`

安装：

```bash
npm install cookie-parser
```

使用：

```js
import cookieParser from 'cookie-parser';

app.use(cookieParser('keyboard cat'));

app.get('/profile', (req, res) => {
  res.json({
    cookies: req.cookies,
    signedCookies: req.signedCookies,
  });
});
```

API 说明：

- `cookieParser([secret], [options])`
  - `secret`：可选，用于解析签名 Cookie。
  - `options`：传给底层 cookie 解析逻辑。
  - 返回值：中间件函数。
  - 作用：解析请求头中的 Cookie，填充 `req.cookies` 和 `req.signedCookies`。
- `req.cookies`
  - 普通 Cookie 对象。
- `req.signedCookies`
  - 签名 Cookie 对象。

签名 Cookie 示例：

```js
app.get('/set-theme', (req, res) => {
  res.cookie('theme', 'dark', {
    signed: true,
    httpOnly: true,
  });

  res.sendStatus(204);
});
```

签名 Cookie 的意义：

- 可以检测客户端是否篡改值。
- 不是加密，客户端仍可能看到值。
- 不要把敏感明文只靠签名 Cookie 保存。

## 8. Session

### 8.1 Session 解决什么问题

HTTP 是无状态的。Session 的目标是让服务端识别“这几次请求来自同一个已登录用户”。

典型流程：

```text
1. 用户登录，POST /login
2. 服务端校验账号密码
3. 服务端创建 session 数据，例如 { userId: 1 }
4. 服务端把 session id 写入 Cookie
5. 浏览器后续请求自动带上 session id
6. 服务端用 session id 找回 session 数据
```

### 8.2 `express-session`

安装：

```bash
npm install express-session
```

使用：

```js
import session from 'express-session';

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    },
  }),
);
```

API 说明：

- `session(options)`
  - 返回值：session 中间件。
  - 作用：读取 session cookie，加载或创建 `req.session`。
- `options.name`
  - Cookie 名称，默认通常是 `connect.sid`。
- `options.secret`
  - 用于签名 session id cookie。
  - 生产环境必须使用高强度随机字符串，并通过环境变量注入。
- `options.resave`
  - 是否每次请求都强制保存 session。
  - 通常设为 `false`。
- `options.saveUninitialized`
  - 是否保存未修改的新 session。
  - 登录系统通常设为 `false`，避免给所有访客创建空 session。
- `options.cookie`
  - 控制 session id cookie 的属性。
- `options.store`
  - session 存储。
  - 默认 MemoryStore 不能用于生产环境。

登录示例：

```js
app.post('/login', express.json(), async (req, res) => {
  const user = await verifyUser(req.body.username, req.body.password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ ok: true });
});
```

鉴权中间件：

```js
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
}

app.get('/me', requireLogin, async (req, res) => {
  const user = await findUserById(req.session.userId);
  res.json(user);
});
```

登出：

```js
app.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie('sid');
    res.sendStatus(204);
  });
});
```

### 8.3 Session 存在哪里

`express-session` 的 session 数据不是存在 Cookie 里。Cookie 里通常只有 session id，真正的数据存在服务端 store 中。

```text
Browser Cookie:
  sid=s%3Aabc123...

Server Store:
  abc123 -> { userId: 1, role: "admin" }
```

生产环境不要使用默认 MemoryStore，因为：

- 进程重启后 session 丢失。
- 多实例部署时无法共享。
- 内存无限增长风险。

生产常用 store：

- Redis。
- 数据库。
- 专门的 session store。

### 8.4 `cookie-session`

`cookie-session` 和 `express-session` 的核心区别：

```text
express-session:
  Cookie 只存 session id
  session 数据存在服务端

cookie-session:
  session 数据直接存在客户端 Cookie 中
```

适合 `cookie-session` 的场景：

- session 数据很小。
- 只存非敏感或已签名可校验的数据。
- 不需要服务端主动吊销单个 session。

不适合：

- 存大量数据。
- 存敏感明文。
- 需要服务端立即踢下线。

## 9. JWT

### 9.1 JWT 是什么

JWT 是一种令牌格式，通常长这样：

```text
header.payload.signature
```

三部分含义：

- `header`：算法和 token 类型。
- `payload`：声明，例如用户 id、角色、过期时间。
- `signature`：签名，用来验证 token 是否被篡改。

JWT 默认是编码和签名，不是加密。不要把密码、身份证号、私密信息放进 payload。

### 9.2 Session 和 JWT 的区别

Session：

```text
客户端保存 session id
服务端保存登录状态
服务端可以随时删除 session
```

JWT：

```text
客户端保存 token
服务端验证签名和过期时间
服务端默认不保存登录状态
```

JWT 优点：

- 无状态，适合多服务共享认证。
- 不依赖中心 session store。
- 移动端和跨域 API 使用方便。

JWT 缺点：

- 签发后，在过期前默认很难单独撤销。
- payload 会暴露给客户端。
- 密钥泄露影响很大。
- 刷新、吊销、黑名单会带来额外复杂度。

### 9.3 `jsonwebtoken`

安装：

```bash
npm install jsonwebtoken
```

签发 token：

```js
import jwt from 'jsonwebtoken';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
      issuer: 'my-api',
      audience: 'my-web',
    },
  );
}
```

`jwt.sign(payload, secretOrPrivateKey, [options, callback])`：

- `payload`
  - 对象、Buffer 或字符串。
  - 常见对象字段：`sub`、`role`。
  - 标准声明如 `exp`、`iat` 通常由 options 或库自动处理。
- `secretOrPrivateKey`
  - HMAC 密钥，或 RSA/ECDSA 私钥。
- `options`
  - `expiresIn`：过期时间，例如 `'15m'`、`'7d'`。
  - `issuer`：签发者。
  - `audience`：接收方。
  - `algorithm`：签名算法。
- `callback`
  - 可选。传入时使用异步回调风格。
- 返回值
  - 同步调用时返回 token 字符串。
  - 异步调用时通过 callback 返回。
- 作用
  - 创建 JWT。

验证 token：

```js
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'my-api',
    audience: 'my-web',
  });
}
```

`jwt.verify(token, secretOrPublicKey, [options, callback])`：

- `token`
  - JWT 字符串。
- `secretOrPublicKey`
  - HMAC 密钥，或 RSA/ECDSA 公钥。
- `options`
  - `issuer`：要求 token 的 issuer 匹配。
  - `audience`：要求 token 的 audience 匹配。
  - `algorithms`：允许的算法列表，建议显式配置。
- 返回值
  - 同步调用时返回 decoded payload。
  - token 无效或过期时抛错。
  - 异步调用时通过 callback 返回。
- 作用
  - 校验签名、过期时间和声明。

### 9.4 Express JWT 鉴权中间件

```js
import jwt from 'jsonwebtoken';

function requireJwt(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'my-api',
      audience: 'my-web',
      algorithms: ['HS256'],
    });

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
}

app.get('/me', requireJwt, (req, res) => {
  res.json({ user: req.user });
});
```

请求：

```http
GET /me
Authorization: Bearer <token>
```

### 9.5 JWT 放在哪里

常见选择：

#### Authorization Header

```http
Authorization: Bearer <token>
```

优点：

- 适合 API。
- 不自动跨站发送，CSRF 风险较低。
- 移动端、CLI、服务间调用友好。

缺点：

- 前端如果存 localStorage，容易受 XSS 影响。
- 页面刷新后的持久化要自己处理。

#### HttpOnly Cookie

```js
res.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
});
```

优点：

- JS 读不到，降低 token 被 XSS 直接盗取的风险。
- 浏览器自动携带。

缺点：

- 会涉及 CSRF 防护。
- 跨站请求需要正确配置 `SameSite=None; Secure` 和 CORS credentials。

### 9.6 Access Token + Refresh Token

更完整的登录模型：

```text
Access Token:
  短期，例如 15 分钟
  用于访问 API

Refresh Token:
  长期，例如 7 天或 30 天
  用于换新的 Access Token
  建议可轮换、可吊销、服务端保存哈希
```

简化流程：

```text
POST /login
  -> 返回 access token
  -> 设置 refresh token cookie

GET /me
  -> Authorization: Bearer access token

POST /refresh
  -> 浏览器带 refresh cookie
  -> 服务端校验 refresh token
  -> 签发新的 access token

POST /logout
  -> 服务端吊销 refresh token
  -> 清除 refresh cookie
```

## 10. 文件上传

### 10.1 文件上传为什么特殊

JSON body 是一段完整文本，而文件上传通常使用：

```http
Content-Type: multipart/form-data; boundary=...
```

multipart 请求体由多个 part 组成：

```text
part 1: 普通字段 name=Ada
part 2: 文件字段 avatar=<binary>
```

Express 内置 body parser 不处理 multipart，需要第三方中间件。常用的是 `multer`。

### 10.2 `multer`

安装：

```bash
npm install multer
```

最小示例：

```js
import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
});

app.post('/avatar', upload.single('avatar'), (req, res) => {
  res.json({
    file: req.file,
    body: req.body,
  });
});
```

前端：

```html
<form action="/avatar" method="post" enctype="multipart/form-data">
  <input type="text" name="name" />
  <input type="file" name="avatar" />
  <button type="submit">Upload</button>
</form>
```

### 10.3 `multer(options)`

```js
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed'));
    }

    callback(null, true);
  },
});
```

API 说明：

- `storage`
  - 文件存储策略。
  - 常见值：`multer.diskStorage(...)` 或 `multer.memoryStorage()`。
- `dest`
  - 简化写法，指定上传目录。
  - 使用 `dest` 时，multer 会自动创建基础磁盘存储行为。
- `limits`
  - 限制文件大小、字段数量等。
  - 常用：`fileSize`。
- `fileFilter`
  - 签名：`(req, file, callback)`。
  - 作用：决定是否接受文件。
- 返回值
  - upload 中间件构造器对象。

### 10.4 `upload.single(fieldname)`

```js
app.post('/avatar', upload.single('avatar'), (req, res) => {
  res.json({
    filename: req.file.filename,
    originalname: req.file.originalname,
  });
});
```

API 说明：

- `fieldname`
  - 表单中文件字段名。
- 返回值
  - Express 中间件函数。
- 作用
  - 接收单个文件。
  - 文件信息放在 `req.file`。
  - 普通字段放在 `req.body`。

`req.file` 常见字段：

- `fieldname`：表单字段名。
- `originalname`：用户上传时的原始文件名。
- `encoding`：编码。
- `mimetype`：MIME 类型。
- `size`：文件大小。
- `destination`：磁盘目标目录。
- `filename`：保存后的文件名。
- `path`：保存路径。
- `buffer`：内存存储时的 Buffer。

### 10.5 `upload.array(fieldname, [maxCount])`

```js
app.post('/photos', upload.array('photos', 6), (req, res) => {
  res.json({
    count: req.files.length,
  });
});
```

API 说明：

- `fieldname`
  - 文件字段名。
- `maxCount`
  - 最大文件数量。
- 返回值
  - Express 中间件函数。
- 作用
  - 接收同一个字段名下的多个文件。
  - 文件数组放在 `req.files`。

### 10.6 `upload.fields(fields)`

```js
app.post(
  '/profile',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 8 },
  ]),
  (req, res) => {
    res.json({
      avatar: req.files.avatar?.[0],
      gallery: req.files.gallery || [],
    });
  },
);
```

API 说明：

- `fields`
  - 数组，每项包含 `name` 和可选 `maxCount`。
- 返回值
  - Express 中间件函数。
- 作用
  - 接收多个不同字段名的文件。
  - `req.files` 是按字段名分组的对象。

### 10.7 `multer.diskStorage(options)`

```js
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'uploads/');
  },
  filename(req, file, callback) {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID();
    callback(null, `${name}${ext}`);
  },
});
```

API 说明：

- `destination(req, file, callback)`
  - 决定保存目录。
  - `callback(error, destination)`。
- `filename(req, file, callback)`
  - 决定保存文件名。
  - `callback(error, filename)`。
- 返回值
  - storage engine。
- 作用
  - 自定义磁盘保存位置和文件名。

不要直接信任 `file.originalname` 作为保存路径，否则可能出现文件名冲突或路径安全问题。

### 10.8 `multer.memoryStorage()`

```js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
  },
});

app.post('/avatar', upload.single('avatar'), async (req, res) => {
  await uploadToObjectStorage(req.file.buffer, {
    contentType: req.file.mimetype,
  });

  res.sendStatus(204);
});
```

API 说明：

- 参数：无。
- 返回值：storage engine。
- 作用：把文件保存在内存 Buffer 中，而不是写入磁盘。

适合：

- 上传到 S3、OSS、R2 等对象存储。
- 文件较小，并且立刻转存。

风险：

- 大文件会占用 Node.js 进程内存。
- 必须设置 `limits.fileSize`。

### 10.9 文件上传安全

最低限度建议：

- 限制文件大小。
- 限制文件数量。
- 校验 MIME 类型。
- 不要信任原始文件名。
- 保存为随机文件名。
- 上传目录不要直接执行脚本。
- 如果公开访问上传文件，最好走对象存储或静态资源服务。
- 图片类上传最好重新编码或使用安全的图片处理库清洗元数据。

示例：

```js
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    if (!allowedTypes.has(file.mimetype)) {
      return callback(createHttpError(400, 'Unsupported file type'));
    }

    callback(null, true);
  },
});
```

### 10.10 Multer 错误处理

```js
import multer from 'multer';

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
      code: err.code,
    });
  }

  next(err);
});
```

常见错误：

- `LIMIT_FILE_SIZE`：文件太大。
- `LIMIT_FILE_COUNT`：文件数量太多。
- `LIMIT_UNEXPECTED_FILE`：出现未声明的文件字段。

## 11. 组合示例：登录、JWT、Session、上传头像

这个例子展示典型请求链：

```text
request
  -> requestId
  -> logger
  -> cookieParser
  -> express.json
  -> routes
  -> notFound
  -> errorHandler
```

```js
import crypto from 'node:crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const app = express();

function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function requestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
}

function logger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    console.log(req.id, req.method, req.originalUrl, res.statusCode, `${Date.now() - startedAt}ms`);
  });

  next();
}

function requireJwt(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Missing bearer token'));
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'my-api',
      audience: 'my-web',
    });

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    next(createHttpError(401, 'Invalid or expired token'));
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(createHttpError(400, 'Unsupported file type'));
    }

    callback(null, true);
  },
});

app.use(requestId);
app.use(logger);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.post('/login', (req, res) => {
  const user = {
    id: 1,
    role: 'admin',
  };

  const accessToken = jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
      issuer: 'my-api',
      audience: 'my-web',
    },
  );

  res.json({ accessToken });
});

app.get('/me', requireJwt, (req, res) => {
  res.json({ user: req.user });
});

app.post('/me/avatar', requireJwt, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'avatar is required');
  }

  res.status(201).json({
    userId: req.user.id,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      requestId: req.id,
      message: err.message,
      code: err.code,
    });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;

  res.status(status).json({
    requestId: req.id,
    message: status >= 500 ? 'Internal Server Error' : err.message,
    details: status >= 500 ? undefined : err.details,
  });
});
```

## 12. 推荐学习顺序

1. 先手写日志中间件，理解 `next()`。
2. 再写鉴权中间件，理解“提前结束响应”。
3. 然后写错误处理中间件，理解 `throw`、`next(error)` 和注册顺序。
4. 接着拆 `Router`，理解 `baseUrl`、`path`、`originalUrl`。
5. 再深入 body parser，理解 Content-Type 和请求体只能读一次。
6. 然后学 Cookie 和 Session，理解“浏览器自动带 Cookie”。
7. 再学 JWT，比较它和 Session 的状态管理差异。
8. 最后学文件上传，因为 multipart、文件流、安全限制都更容易出坑。

## 13. 常见坑速查

- `req.body` 是 `undefined`：没有注册 body parser，或注册顺序在路由之后，或 Content-Type 不匹配。
- `req.cookies` 是 `undefined`：没有注册 `cookie-parser`。
- Session 每次都变：Cookie 没保存、跨域 credentials 没配、secret 不稳定、浏览器拒绝第三方 Cookie。
- 前端 FormData 后端拿不到：不能用 `express.json()` 解析 multipart，要用 `multer`。
- 文件字段一直 undefined：`upload.single('avatar')` 的字段名必须和前端 `formData.append('avatar', file)` 一致。
- 报 `Cannot set headers after they are sent`：同一个请求发送了多次响应，或响应后还继续 `next()` 到会响应的 handler。
- async 抛错没被处理：确认使用 Express 5；错误处理中间件必须有四个参数。
- 生产环境 session 丢失：用了默认 MemoryStore，或者多实例没有共享 store。
- JWT 被篡改还能用：没有 verify，只 decode；或算法、密钥配置不严格。

## 14. 参考资料

- Express 5 Using middleware: https://expressjs.com/en/5x/guide/using-middleware/
- Express 5 API Reference: https://expressjs.com/en/5x/api/
- Express Error Handling: https://expressjs.com/en/guide/error-handling/
- Express cookie-parser middleware: https://expressjs.com/en/resources/middleware/cookie-parser/
- express-session npm: https://www.npmjs.com/package/express-session
- cookie-session npm: https://www.npmjs.com/package/cookie-session
- jsonwebtoken npm: https://www.npmjs.com/package/jsonwebtoken
- multer npm: https://www.npmjs.com/package/multer
