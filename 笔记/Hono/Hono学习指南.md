## Hono 学习指南

> 适用时间：2026-05-21  
> 参考版本：Hono v4.12.x 最新文档体系。实际创建项目时建议使用 `npm create hono@latest` 和 `npm i hono@latest`，以 npm 当前最新发布为准。

## 目录

1. Hono 是什么
2. Hono 适合解决什么问题
3. 最小项目与运行方式
4. Hono 的核心架构
5. 一次请求在 Hono 中如何流动
6. Hono App API
7. 路由系统
8. Context 上下文对象
9. HonoRequest 请求对象
10. 响应 API
11. 中间件系统
12. 错误处理与 404
13. 参数、Body 与验证
14. Cookie、Header 与安全
15. TypeScript 类型系统
16. Hono RPC 类型安全客户端
17. Helper 与常用内置能力
18. 多运行时与适配器
19. 测试、调试与开发体验
20. 项目结构建议
21. 从 Express 迁移到 Hono
22. 实战：一个完整 Todo API
23. 学习路线
24. 常见问题
25. 参考资料

## 1. Hono 是什么

Hono 是一个轻量、快速、基于 Web Standards 的 Web 框架。它的 API 很像 Express，但底层更贴近现代运行时的标准模型：`Request`、`Response`、`fetch`、`Headers`、`URL`、`ReadableStream` 等。

官方对 Hono 的几个关键词是：

- Fast：路由器很快，尤其是 `RegExpRouter`。
- Lightweight：核心包体积小，并且零依赖。
- Multi-runtime：同一套业务代码可以运行在 Cloudflare Workers、Deno、Bun、Node.js、Vercel、AWS Lambda 等环境。
- Batteries Included：内置常用中间件、Helper 和 TypeScript 友好能力。
- Web Standards：用标准 Web API 表达 HTTP 服务，而不是绑定到某一个服务器实现。

最小 Hono 程序如下：

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

这段代码的核心只有三件事：

- `new Hono()` 创建应用实例。
- `app.get('/', handler)` 注册一个 GET 路由。
- handler 返回一个 `Response`，这里通过 `c.text()` 快速生成文本响应。

## 2. Hono 适合解决什么问题

Hono 可以理解为“现代 Web API 的极简骨架”。它很适合：

- 构建 REST API。
- 构建运行在 Edge Runtime 的接口服务。
- 作为 Next.js、Astro、Vite、Cloudflare Pages 等全栈项目的 API 层。
- 构建代理、网关、Webhook 服务。
- 构建 BFF，也就是前端专用后端。
- 构建轻量 SSR 页面。
- 构建类型安全的前后端 RPC 调用。

如果你熟悉 Express，Hono 的入门成本很低：

```ts
// Express 风格
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id })
})

// Hono 风格
app.get('/users/:id', (c) => {
  return c.json({ id: c.req.param('id') })
})
```

差异在于：

- Express handler 操作 `req` 和 `res`。
- Hono handler 操作 `Context`，并最终返回 `Response`。
- Hono 更强调标准 `Request` 和 `Response`。

## 3. 最小项目与运行方式

### 3.1 使用官方脚手架

推荐使用官方脚手架：

```bash
npm create hono@latest my-app
cd my-app
npm install
npm run dev
```

创建时可以选择不同模板，例如：

- `nodejs`
- `cloudflare-workers`
- `bun`
- `deno`
- `vercel`
- `nextjs`
- `aws-lambda`

如果你目前主要学习后端 API，建议先选 `nodejs`，因为本地调试最直接。

### 3.2 Node.js 版本要求

Hono 的 Node.js 适配器依赖现代 Web API。官方 Node.js 指南说明：

- Node.js 18 需要 `18.14.1+`
- Node.js 19 需要 `19.7.0+`
- Node.js 20 需要 `20.0.0+`

学习时建议直接使用 Node.js 20 或 22。

### 3.3 Node.js 入口示例

Node.js 环境需要使用 `@hono/node-server`：

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Node.js!')
})

serve({
  fetch: app.fetch,
  port: 3000,
})
```

注意这里不是 `app.listen()`。Hono 的核心入口是 `app.fetch`，Node.js 适配器负责把 Node 的 HTTP 请求转换成标准 `Request`，再交给 `app.fetch`。

## 4. Hono 的核心架构

Hono 可以拆成五层理解：

```txt
客户端
  |
  v
运行时适配器：Node.js / Bun / Deno / Cloudflare Workers / Lambda
  |
  v
标准 Request
  |
  v
Hono App：路由匹配 + 中间件组合 + Context 创建
  |
  v
Handler 返回标准 Response
  |
  v
运行时把 Response 发回客户端
```

### 4.1 App

`Hono` 实例是应用对象。它负责：

- 注册路由。
- 注册中间件。
- 匹配请求路径和方法。
- 调度 handler。
- 处理 404 和错误。
- 暴露 `fetch()` 入口。

```ts
const app = new Hono()
```

### 4.2 Router

Router 负责把请求路径映射到对应 handler。Hono 默认使用 `SmartRouter`，它会选择合适的路由实现。你也可以显式指定路由器：

```ts
import { Hono } from 'hono'
import { RegExpRouter } from 'hono/router/reg-exp-router'

const app = new Hono({
  router: new RegExpRouter(),
})
```

通常不需要手动设置，除非你在做性能调优或非常明确地知道目标运行时。

### 4.3 Context

每个请求都会创建一个 `Context`，通常用 `c` 表示：

```ts
app.get('/hello', (c) => {
  return c.text('Hello')
})
```

`Context` 包含：

- 当前请求：`c.req`
- 响应构造方法：`c.text()`、`c.json()`、`c.html()`、`c.body()`
- 响应状态与 Header：`c.status()`、`c.header()`
- 环境变量和运行时绑定：`c.env`
- 请求级变量：`c.set()`、`c.get()`、`c.var`

### 4.4 Middleware

中间件在 handler 前后执行。它可以：

- 读取请求。
- 提前返回响应。
- 调用 `await next()` 进入下一个中间件或 handler。
- 在 `await next()` 之后修改响应。

这就是常说的洋葱模型。

### 4.5 Adapter

Hono 核心使用标准 `fetch` 模型，不直接绑定 Node.js 的 `http.Server`。不同运行时通过 adapter 接入：

- Node.js：`@hono/node-server`
- Cloudflare Workers：直接 `export default app`
- Bun：直接 `export default app` 或配置 `fetch: app.fetch`
- AWS Lambda：使用对应 Lambda adapter

## 5. 一次请求在 Hono 中如何流动

下面用一个带中间件的例子说明运行流程：

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use(logger())

app.use(async (c, next) => {
  const start = performance.now()
  await next()
  const end = performance.now()
  c.header('X-Response-Time', `${end - start}ms`)
})

app.get('/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})

export default app
```

访问 `GET /users/123` 时：

1. 运行时收到 HTTP 请求。
2. adapter 转成标准 `Request`。
3. 请求进入 `app.fetch(request, env, event)`。
4. Hono 创建当前请求的 `Context`。
5. Router 匹配到 `GET /users/:id`。
6. 依注册顺序执行中间件：
   - `logger()` 开始。
   - 响应时间中间件记录开始时间。
   - handler 读取 `id` 并返回 JSON。
   - 响应时间中间件在 `await next()` 后追加 Header。
   - `logger()` 记录响应。
7. 返回标准 `Response`。
8. adapter 把 `Response` 写回客户端。

可以把它想成：

```txt
Request
  -> middleware 1 before
    -> middleware 2 before
      -> handler
    <- middleware 2 after
  <- middleware 1 after
Response
```

## 6. Hono App API

Hono 实例常用方法如下：

| API | 作用 |
| --- | --- |
| `app.get(path, ...handlers)` | 注册 GET 路由 |
| `app.post(path, ...handlers)` | 注册 POST 路由 |
| `app.put(path, ...handlers)` | 注册 PUT 路由 |
| `app.patch(path, ...handlers)` | 注册 PATCH 路由 |
| `app.delete(path, ...handlers)` | 注册 DELETE 路由 |
| `app.all(path, ...handlers)` | 匹配任意 HTTP 方法 |
| `app.on(method, path, ...handlers)` | 更灵活地注册方法和路径 |
| `app.use(path?, middleware)` | 注册中间件 |
| `app.route(path, app)` | 挂载另一个 Hono app |
| `app.basePath(path)` | 设置基础路径 |
| `app.notFound(handler)` | 自定义 404 |
| `app.onError(handler)` | 自定义错误处理 |
| `app.mount(path, handler)` | 挂载其他框架或 fetch handler |
| `app.fetch(request, env, event)` | Hono 应用入口 |
| `app.request(path, options?)` | 测试时发起内部请求 |

### 6.1 HTTP 方法

```ts
app.get('/posts', (c) => c.text('List posts'))
app.post('/posts', (c) => c.text('Create post', 201))
app.put('/posts/:id', (c) => c.text(`Update ${c.req.param('id')}`))
app.delete('/posts/:id', (c) => c.text(`Delete ${c.req.param('id')}`))
```

### 6.2 app.on()

当你需要一个 handler 同时匹配多个方法或多个路径时，可以用 `app.on()`：

```ts
app.on(['GET', 'POST'], ['/ping', '/health'], (c) => {
  return c.json({
    ok: true,
    method: c.req.method,
    path: c.req.path,
  })
})
```

### 6.3 app.route()

`route()` 用于模块化组织路由：

```ts
import { Hono } from 'hono'

const books = new Hono()

books.get('/', (c) => c.json([{ id: '1', title: 'Hono Guide' }]))
books.get('/:id', (c) => c.json({ id: c.req.param('id') }))
books.post('/', (c) => c.json({ ok: true }, 201))

const app = new Hono()

app.route('/books', books)
```

最终路径是：

- `GET /books`
- `GET /books/:id`
- `POST /books`

### 6.4 basePath()

```ts
const api = new Hono().basePath('/api')

api.get('/health', (c) => c.json({ ok: true }))
```

最终路径是 `GET /api/health`。

### 6.5 strict 模式

Hono 默认 `strict: true`，会区分 `/hello` 和 `/hello/`：

```ts
const app = new Hono({
  strict: false,
})
```

设置为 `false` 后，尾部斜杠差异会被弱化。

## 7. 路由系统

### 7.1 静态路由

```ts
app.get('/about', (c) => c.text('About'))
```

### 7.2 路径参数

```ts
app.get('/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})
```

多个参数：

```ts
app.get('/users/:userId/posts/:postId', (c) => {
  const { userId, postId } = c.req.param()
  return c.json({ userId, postId })
})
```

### 7.3 通配符

```ts
app.get('/assets/*', (c) => {
  return c.text(`asset path: ${c.req.path}`)
})
```

### 7.4 app.all()

```ts
app.all('/echo-method', (c) => {
  return c.text(`method: ${c.req.method}`)
})
```

### 7.5 链式路由

```ts
app
  .get('/endpoint', (c) => c.text('GET /endpoint'))
  .post('/endpoint', (c) => c.text('POST /endpoint'))
  .delete('/endpoint', (c) => c.text('DELETE /endpoint'))
```

### 7.6 路由注册顺序

Hono 的中间件和 handler 按注册顺序执行。一般建议：

```ts
app.use('*', logger())
app.use('/api/*', cors())

app.get('/api/users', listUsers)
app.post('/api/users', createUser)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))
```

全局中间件放前面，具体路由放中间，兜底处理放后面。

## 8. Context 上下文对象

`Context` 是 Hono 最重要的对象。它每个请求一份，请求结束后销毁。

### 8.1 读取请求

```ts
app.get('/hello', (c) => {
  const userAgent = c.req.header('User-Agent')
  return c.text(`UA: ${userAgent}`)
})
```

### 8.2 设置状态码

```ts
app.post('/posts', (c) => {
  c.status(201)
  return c.json({ message: 'created' })
})
```

也可以直接写在响应方法里：

```ts
app.post('/posts', (c) => {
  return c.json({ message: 'created' }, 201)
})
```

### 8.3 设置响应 Header

```ts
app.get('/download', (c) => {
  c.header('X-App-Version', '1.0.0')
  return c.text('file content')
})
```

### 8.4 请求级变量 set/get

`c.set()` 和 `c.get()` 适合在中间件与 handler 间传递当前请求内的数据：

```ts
type Env = {
  Variables: {
    user: {
      id: string
      name: string
    }
  }
}

const app = new Hono<Env>()

app.use('/me/*', async (c, next) => {
  c.set('user', {
    id: 'u_1',
    name: 'Ada',
  })
  await next()
})

app.get('/me/profile', (c) => {
  const user = c.get('user')
  return c.json(user)
})
```

### 8.5 c.var

`c.var` 是读取变量的便捷方式：

```ts
app.get('/me/profile', (c) => {
  return c.json({
    user: c.var.user,
  })
})
```

### 8.6 c.env

`c.env` 用于访问运行时环境绑定。Cloudflare Workers 中常见：

```ts
type Env = {
  Bindings: {
    DB: D1Database
    API_TOKEN: string
  }
}

const app = new Hono<Env>()

app.get('/config', (c) => {
  return c.json({
    hasToken: Boolean(c.env.API_TOKEN),
  })
})
```

在 Node.js 适配器里，也可以通过绑定访问 Node 原生请求对象，具体取决于 adapter 提供的类型。

## 9. HonoRequest 请求对象

`c.req` 是 `HonoRequest`，它包装了标准 `Request`，并提供更方便的 API。

### 9.1 param()

```ts
app.get('/posts/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})
```

一次性取全部参数：

```ts
app.get('/posts/:postId/comments/:commentId', (c) => {
  const { postId, commentId } = c.req.param()
  return c.json({ postId, commentId })
})
```

### 9.2 query()

```ts
app.get('/search', (c) => {
  const keyword = c.req.query('q')
  const page = c.req.query('page') ?? '1'
  return c.json({ keyword, page })
})
```

一次性取全部 query：

```ts
app.get('/search', (c) => {
  const query = c.req.query()
  return c.json(query)
})
```

### 9.3 queries()

适合处理重复 query，例如 `/search?tag=ts&tag=hono`：

```ts
app.get('/search', (c) => {
  const tags = c.req.queries('tag') ?? []
  return c.json({ tags })
})
```

### 9.4 header()

```ts
app.get('/ua', (c) => {
  return c.json({
    userAgent: c.req.header('User-Agent'),
  })
})
```

注意：`c.req.header()` 不传参数时，返回对象中的 key 是小写。如果要读取指定大小写 Header，推荐传入 Header 名称：

```ts
const traceId = c.req.header('X-Trace-Id')
```

### 9.5 json()

```ts
app.post('/posts', async (c) => {
  const body = await c.req.json<{
    title: string
    content: string
  }>()

  return c.json({
    id: crypto.randomUUID(),
    ...body,
  })
})
```

### 9.6 text()

```ts
app.post('/webhook/raw', async (c) => {
  const raw = await c.req.text()
  return c.text(`received ${raw.length} chars`)
})
```

### 9.7 parseBody()

`parseBody()` 用于解析 `multipart/form-data` 或 `application/x-www-form-urlencoded`：

```ts
app.post('/profile', async (c) => {
  const body = await c.req.parseBody()
  const name = body['name']
  const avatar = body['avatar']

  return c.json({
    name,
    hasAvatar: avatar instanceof File,
  })
})
```

多个同名字段或文件可以使用 `[]` 后缀：

```ts
const body = await c.req.parseBody()
const files = body['files[]']
```

### 9.8 raw

如果你需要底层标准 `Request`：

```ts
app.post('/raw', async (c) => {
  const request = c.req.raw
  return c.json({
    method: request.method,
    url: request.url,
  })
})
```

## 10. 响应 API

Hono handler 最终需要返回 `Response`。

### 10.1 text()

```ts
app.get('/plain', (c) => {
  return c.text('hello')
})
```

### 10.2 json()

```ts
app.get('/api/user', (c) => {
  return c.json({
    id: 1,
    name: 'Ada',
  })
})
```

带状态码：

```ts
return c.json({ error: 'Unauthorized' }, 401)
```

### 10.3 html()

```ts
app.get('/page', (c) => {
  return c.html('<h1>Hello Hono</h1>')
})
```

也可以配合 JSX：

```tsx
const Layout = (props: { title: string; children: unknown }) => {
  return (
    <html>
      <head>
        <title>{props.title}</title>
      </head>
      <body>{props.children}</body>
    </html>
  )
}

app.get('/home', (c) => {
  return c.html(
    <Layout title="Home">
      <h1>Home</h1>
    </Layout>
  )
})
```

JSX 配置会因运行时和构建工具不同而不同。学习 API 时先掌握 `c.html()` 即可。

### 10.4 body()

```ts
app.get('/custom', (c) => {
  return c.body('custom body', 200, {
    'Content-Type': 'text/plain',
    'X-From': 'Hono',
  })
})
```

### 10.5 redirect()

```ts
app.get('/old', (c) => {
  return c.redirect('/new')
})

app.get('/permanent-old', (c) => {
  return c.redirect('/new', 301)
})
```

### 10.6 原生 Response

你也可以直接返回标准 `Response`：

```ts
app.get('/native', () => {
  return new Response('Native Response', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
})
```

这也是 Hono 能跨运行时的关键，因为 `Response` 是 Web 标准。

## 11. 中间件系统

### 11.1 中间件是什么

在 Hono 中：

- Handler：返回 `Response`，真正响应请求。
- Middleware：可以在 handler 前后执行逻辑，通常调用 `await next()`。

中间件可以：

- 记录日志。
- 设置 CORS。
- 鉴权。
- 限流。
- 注入数据库连接。
- 捕获性能指标。
- 修改响应 Header。

### 11.2 最小中间件

```ts
app.use(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.path}`)
  await next()
})
```

### 11.3 洋葱模型

```ts
app.use(async (_c, next) => {
  console.log('middleware 1 start')
  await next()
  console.log('middleware 1 end')
})

app.use(async (_c, next) => {
  console.log('middleware 2 start')
  await next()
  console.log('middleware 2 end')
})

app.get('/', (c) => {
  console.log('handler')
  return c.text('Hello')
})
```

访问 `/` 时输出：

```txt
middleware 1 start
middleware 2 start
handler
middleware 2 end
middleware 1 end
```

### 11.4 提前返回

中间件可以不调用 `next()`，直接返回响应：

```ts
app.use('/admin/*', async (c, next) => {
  const token = c.req.header('Authorization')

  if (token !== 'Bearer secret') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
})
```

### 11.5 修改响应

```ts
app.use(async (c, next) => {
  await next()
  c.header('X-Powered-By', 'Hono')
})
```

### 11.6 createMiddleware()

将中间件拆成独立文件时，推荐使用 `createMiddleware()`，这样类型更清楚：

```ts
import { createMiddleware } from 'hono/factory'

export const requestTime = createMiddleware(async (c, next) => {
  const start = performance.now()
  await next()
  const end = performance.now()
  c.header('X-Response-Time', `${end - start}ms`)
})
```

使用：

```ts
app.use(requestTime)
```

### 11.7 带类型的中间件

```ts
import { createMiddleware } from 'hono/factory'

type User = {
  id: string
  name: string
}

const auth = createMiddleware<{
  Variables: {
    user: User
  }
}>(async (c, next) => {
  c.set('user', {
    id: 'u_1',
    name: 'Ada',
  })
  await next()
})

const app = new Hono()

app.get('/me', auth, (c) => {
  return c.json(c.var.user)
})
```

### 11.8 常用内置中间件

Hono 内置了很多常用中间件：

| 中间件 | 导入路径 | 作用 |
| --- | --- | --- |
| `logger` | `hono/logger` | 请求日志 |
| `cors` | `hono/cors` | CORS |
| `basicAuth` | `hono/basic-auth` | Basic Auth |
| `bearerAuth` | `hono/bearer-auth` | Bearer Token Auth |
| `jwt` | `hono/jwt` | JWT 校验 |
| `secureHeaders` | `hono/secure-headers` | 安全响应头 |
| `etag` | `hono/etag` | ETag 缓存协商 |
| `compress` | `hono/compress` | 响应压缩 |
| `bodyLimit` | `hono/body-limit` | 限制请求体大小 |
| `prettyJSON` | `hono/pretty-json` | 格式化 JSON |
| `requestId` | `hono/request-id` | 请求 ID |
| `timeout` | `hono/timeout` | 超时控制 |
| `trailingSlash` | `hono/trailing-slash` | 尾部斜杠处理 |

示例：

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()

app.use(logger())
app.use(secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)
```

## 12. 错误处理与 404

### 12.1 自定义 404

```ts
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      path: c.req.path,
    },
    404
  )
})
```

### 12.2 自定义错误处理

```ts
app.onError((err, c) => {
  console.error(err)

  return c.json(
    {
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Unknown error',
    },
    500
  )
})
```

### 12.3 抛出 HTTPException

```ts
import { HTTPException } from 'hono/http-exception'

app.get('/private', (c) => {
  const token = c.req.header('Authorization')

  if (!token) {
    throw new HTTPException(401, {
      message: 'Missing token',
    })
  }

  return c.text('ok')
})
```

统一处理：

```ts
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  return c.json({ error: 'Internal Server Error' }, 500)
})
```

## 13. 参数、Body 与验证

### 13.1 为什么需要验证

`c.req.json<T>()` 中的 `T` 只是 TypeScript 编译期提示，不会在运行时校验输入。真实接口必须做运行时验证。

错误示例：

```ts
app.post('/posts', async (c) => {
  const body = await c.req.json<{
    title: string
  }>()

  // 如果客户端传 { title: 123 }，运行时不会自动报错
  return c.json({ title: body.title })
})
```

### 13.2 Hono 内置 validator()

```ts
import { validator } from 'hono/validator'

app.post(
  '/posts',
  validator('json', (value, c) => {
    const title = value['title']

    if (typeof title !== 'string' || title.length === 0) {
      return c.json({ error: 'title is required' }, 400)
    }

    return {
      title,
    }
  }),
  (c) => {
    const body = c.req.valid('json')
    return c.json(
      {
        id: crypto.randomUUID(),
        title: body.title,
      },
      201
    )
  }
)
```

`validator()` 第一个参数表示验证目标：

- `json`
- `form`
- `query`
- `header`
- `cookie`
- `param`

### 13.3 使用 Zod

官方文档推荐结合第三方验证库。Hono 常见搭配是 `zod` 和 `@hono/zod-validator`：

```bash
npm i zod @hono/zod-validator
```

```ts
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

app.post('/posts', zValidator('json', createPostSchema), (c) => {
  const body = c.req.valid('json')

  return c.json(
    {
      id: crypto.randomUUID(),
      ...body,
    },
    201
  )
})
```

### 13.4 验证 query

query 本质上都是字符串。需要数字时用 Zod 转换：

```ts
const listPostsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

app.get('/posts', zValidator('query', listPostsQuery), (c) => {
  const query = c.req.valid('query')

  return c.json({
    page: query.page,
    pageSize: query.pageSize,
  })
})
```

### 13.5 验证 param

```ts
const postParam = z.object({
  id: z.string().uuid(),
})

app.get('/posts/:id', zValidator('param', postParam), (c) => {
  const { id } = c.req.valid('param')
  return c.json({ id })
})
```

## 14. Cookie、Header 与安全

### 14.1 Cookie Helper

```ts
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

app.get('/login', (c) => {
  setCookie(c, 'session', 'session-value', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return c.json({ ok: true })
})

app.get('/me', (c) => {
  const session = getCookie(c, 'session')
  return c.json({ session })
})

app.post('/logout', (c) => {
  deleteCookie(c, 'session')
  return c.json({ ok: true })
})
```

### 14.2 CORS

```ts
import { cors } from 'hono/cors'

app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
```

### 14.3 Basic Auth

```ts
import { basicAuth } from 'hono/basic-auth'

app.use(
  '/admin/*',
  basicAuth({
    username: 'admin',
    password: 'secret',
  })
)
```

### 14.4 Bearer Auth

```ts
import { bearerAuth } from 'hono/bearer-auth'

app.use(
  '/api/private/*',
  bearerAuth({
    token: 'my-secret-token',
  })
)
```

### 14.5 Secure Headers

```ts
import { secureHeaders } from 'hono/secure-headers'

app.use(secureHeaders())
```

生产项目建议至少配置：

- CORS 白名单。
- 认证中间件。
- 请求体大小限制。
- 安全响应头。
- 请求 ID 和日志。

## 15. TypeScript 类型系统

Hono 的类型能力主要体现在三处：

- 路由参数的类型提示。
- `Bindings` 和 `Variables`。
- RPC 客户端类型推导。

### 15.1 Bindings

`Bindings` 表示运行时注入的环境绑定：

```ts
type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}

const app = new Hono<Env>()

app.get('/env', (c) => {
  return c.json({
    hasDb: Boolean(c.env.DATABASE_URL),
  })
})
```

### 15.2 Variables

`Variables` 表示当前请求中间件注入的数据：

```ts
type Env = {
  Variables: {
    requestId: string
  }
}

const app = new Hono<Env>()

app.use(async (c, next) => {
  c.set('requestId', crypto.randomUUID())
  await next()
})

app.get('/', (c) => {
  return c.json({
    requestId: c.var.requestId,
  })
})
```

### 15.3 链式写法增强类型推导

Hono 的 `.use()`、`.get()` 等方法会返回新的 Hono 类型。大型项目里，为了保持 RPC 类型推导，常见写法是把路由保存成变量：

```ts
const route = app
  .get('/posts', (c) => c.json([{ id: '1', title: 'Hello' }]))
  .post('/posts', (c) => c.json({ id: '2' }, 201))

export type AppType = typeof route
```

或者导出完整 app：

```ts
export type AppType = typeof app
```

## 16. Hono RPC 类型安全客户端

Hono RPC 允许客户端直接复用服务端路由类型，不需要单独写 OpenAPI 或手写 fetch 类型。

### 16.1 服务端

```ts
// server.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

const route = app.post(
  '/posts',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    })
  ),
  (c) => {
    const body = c.req.valid('json')

    return c.json(
      {
        id: crypto.randomUUID(),
        ...body,
      },
      201
    )
  }
)

export type AppType = typeof route
export default app
```

### 16.2 客户端

```ts
// client.ts
import { hc } from 'hono/client'
import type { AppType } from './server'

const client = hc<AppType>('http://localhost:3000')

const res = await client.posts.$post({
  json: {
    title: 'Learn Hono',
    content: 'Hono RPC is type-safe.',
  },
})

const data = await res.json()
```

此时客户端会知道：

- `/posts` 有 `$post` 方法。
- body 需要 `title` 和 `content`。
- 响应 JSON 的结构来自服务端 `c.json()`。

### 16.3 带状态码的响应类型

```ts
const route = app.get('/posts/:id', (c) => {
  const id = c.req.param('id')

  if (id !== '1') {
    return c.json({ error: 'not found' }, 404)
  }

  return c.json({ id: '1', title: 'Hono' }, 200)
})
```

客户端可以根据状态码缩小类型：

```ts
const res = await client.posts[':id'].$get({
  param: {
    id: '2',
  },
})

if (res.status === 404) {
  const data = await res.json()
  console.log(data.error)
}
```

### 16.4 InferRequestType 与 InferResponseType

```ts
import type { InferRequestType, InferResponseType } from 'hono/client'

const $post = client.posts.$post

type CreatePostRequest = InferRequestType<typeof $post>['json']
type CreatePostResponse = InferResponseType<typeof $post>
```

### 16.5 RPC 的注意点

- `tsconfig.json` 建议开启 `"strict": true`。
- 大型项目不要把所有路由塞进一个巨大类型里，可以按模块拆分。
- 客户端类型来自服务端源码，所以 monorepo 体验最好。
- 全局 `app.onError()` 的响应类型不会自动推导为每个 RPC 路由的响应类型。

## 17. Helper 与常用内置能力

Hono 的 Helper 不是中间件，它们是可以在 handler 或工具函数中调用的辅助函数。

常见 Helper：

| Helper | 作用 |
| --- | --- |
| Cookie | 读写 Cookie |
| html | 安全拼接 HTML |
| JWT | 签发与验证 JWT |
| Streaming | 流式响应 |
| Testing | 测试辅助 |
| WebSocket | WebSocket 辅助 |
| Dev | 开发期查看路由和路由器 |
| Route | 获取当前 route 信息 |
| SSG | 静态站点生成 |

### 17.1 html Helper

```ts
import { html } from 'hono/html'

app.get('/', (c) => {
  const title = 'Hono'

  return c.html(html`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <h1>Hello ${title}</h1>
      </body>
    </html>
  `)
})
```

### 17.2 Dev Helper

```ts
import { showRoutes, getRouterName } from 'hono/dev'

console.log(getRouterName(app))

showRoutes(app, {
  verbose: true,
})
```

控制台会显示已注册路由，适合本地开发排查。

### 17.3 Streaming

```ts
import { streamText } from 'hono/streaming'

app.get('/stream', (c) => {
  return streamText(c, async (stream) => {
    await stream.write('hello\n')
    await stream.sleep(1000)
    await stream.write('hono\n')
  })
})
```

流式响应常用于：

- AI 输出。
- SSE。
- 大文件或长任务进度。

## 18. 多运行时与适配器

Hono 的业务代码大多数时候可以跨运行时复用，但入口文件、静态文件、WebSocket 等能力通常和运行时有关。

### 18.1 Cloudflare Workers

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Workers'))

export default app
```

Workers 天然使用 `fetch` 入口，所以最简洁。

### 18.2 Node.js

```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Node'))

serve({
  fetch: app.fetch,
  port: 3000,
})
```

### 18.3 Bun

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Bun'))

export default {
  port: 3000,
  fetch: app.fetch,
}
```

### 18.4 静态文件

Node.js 静态文件要使用 Node 适配器提供的 `serveStatic`：

```ts
import { serveStatic } from '@hono/node-server/serve-static'

app.use('/static/*', serveStatic({ root: './' }))
```

如果路径要稳定，建议使用 `import.meta.url`：

```ts
import { fileURLToPath } from 'node:url'
import { serveStatic } from '@hono/node-server/serve-static'

app.use(
  '/static/*',
  serveStatic({
    root: fileURLToPath(new URL('./', import.meta.url)),
  })
)
```

### 18.5 WebSocket

WebSocket 是运行时相关能力。Cloudflare Workers 示例：

```ts
import { upgradeWebSocket } from 'hono/cloudflare-workers'

app.get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage(event, ws) {
        ws.send(`echo: ${event.data}`)
      },
    }
  })
)
```

学习时要记住：HTTP 路由大多跨运行时，静态文件、WebSocket、原生 socket、部署配置通常不跨运行时。

## 19. 测试、调试与开发体验

### 19.1 app.request()

Hono 自带 `app.request()`，非常适合测试：

```ts
import { describe, expect, it } from 'vitest'
import app from './index'

describe('GET /', () => {
  it('returns hello', async () => {
    const res = await app.request('/')

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })
})
```

POST 测试：

```ts
it('creates post', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Hono',
      content: 'Guide',
    }),
  })

  expect(res.status).toBe(201)
  expect(await res.json()).toMatchObject({
    title: 'Hono',
  })
})
```

### 19.2 showRoutes()

```ts
import { showRoutes } from 'hono/dev'

showRoutes(app, {
  verbose: true,
})
```

### 19.3 请求 ID

```ts
import { requestId } from 'hono/request-id'

app.use('*', requestId())

app.get('/', (c) => {
  return c.json({
    requestId: c.get('requestId'),
  })
})
```

### 19.4 日志

```ts
import { logger } from 'hono/logger'

app.use(logger())
```

生产环境通常会接入更完整的日志系统，但学习和本地开发时 `logger()` 已经很够用。

## 20. 项目结构建议

小项目可以这样：

```txt
src/
  index.ts
```

中型 API 项目建议：

```txt
src/
  index.ts
  app.ts
  routes/
    users.ts
    posts.ts
  middlewares/
    auth.ts
    request-time.ts
  schemas/
    post.ts
  services/
    post-service.ts
  db/
    client.ts
```

### 20.1 app.ts

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { postsRoute } from './routes/posts'
import { usersRoute } from './routes/users'

export const app = new Hono()

app.use(logger())

app.route('/users', usersRoute)
app.route('/posts', postsRoute)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export type AppType = typeof app
```

### 20.2 index.ts

Node.js：

```ts
import { serve } from '@hono/node-server'
import { app } from './app'

serve({
  fetch: app.fetch,
  port: 3000,
})
```

Cloudflare Workers：

```ts
import { app } from './app'

export default app
```

### 20.3 routes/posts.ts

```ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const postsRoute = new Hono()

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

postsRoute.get('/', (c) => {
  return c.json([
    {
      id: '1',
      title: 'First Post',
    },
  ])
})

postsRoute.post('/', zValidator('json', createPostSchema), (c) => {
  const body = c.req.valid('json')

  return c.json(
    {
      id: crypto.randomUUID(),
      ...body,
    },
    201
  )
})
```

## 21. 从 Express 迁移到 Hono

### 21.1 请求和响应模型不同

Express：

```ts
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id })
})
```

Hono：

```ts
app.get('/users/:id', (c) => {
  return c.json({ id: c.req.param('id') })
})
```

### 21.2 中间件模型相似但返回值不同

Express：

```ts
app.use((req, res, next) => {
  console.log(req.method)
  next()
})
```

Hono：

```ts
app.use(async (c, next) => {
  console.log(c.req.method)
  await next()
})
```

### 21.3 Body 解析不同

Express 通常需要：

```ts
app.use(express.json())
```

Hono 可以直接：

```ts
const body = await c.req.json()
```

但真实项目仍建议用 validator 或 Zod 做运行时校验。

### 21.4 响应方式不同

Express 是操作 `res`：

```ts
res.status(201).json(data)
```

Hono 是返回 `Response`：

```ts
return c.json(data, 201)
```

## 22. 实战：一个完整 Todo API

下面是一个包含路由、验证、中间件、错误处理和测试友好结构的 Todo API。

### 22.1 app.ts

```ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

const todos = new Map<string, Todo>()

const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
})

const updateTodoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
})

const idParamSchema = z.object({
  id: z.string().min(1),
})

export const app = new Hono()

app.use(logger())
app.use(secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:5173',
  })
)

app.get('/health', (c) => {
  return c.json({
    ok: true,
    time: new Date().toISOString(),
  })
})

app.get('/api/todos', (c) => {
  return c.json({
    items: Array.from(todos.values()),
  })
})

app.post('/api/todos', zValidator('json', createTodoSchema), (c) => {
  const body = c.req.valid('json')

  const todo: Todo = {
    id: crypto.randomUUID(),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  todos.set(todo.id, todo)

  return c.json(todo, 201)
})

app.get('/api/todos/:id', zValidator('param', idParamSchema), (c) => {
  const { id } = c.req.valid('param')
  const todo = todos.get(id)

  if (!todo) {
    throw new HTTPException(404, {
      message: 'Todo not found',
    })
  }

  return c.json(todo)
})

app.patch(
  '/api/todos/:id',
  zValidator('param', idParamSchema),
  zValidator('json', updateTodoSchema),
  (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const todo = todos.get(id)

    if (!todo) {
      throw new HTTPException(404, {
        message: 'Todo not found',
      })
    }

    const nextTodo = {
      ...todo,
      ...body,
    }

    todos.set(id, nextTodo)

    return c.json(nextTodo)
  }
)

app.delete('/api/todos/:id', zValidator('param', idParamSchema), (c) => {
  const { id } = c.req.valid('param')
  const existed = todos.delete(id)

  if (!existed) {
    throw new HTTPException(404, {
      message: 'Todo not found',
    })
  }

  return c.body(null, 204)
})

app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      path: c.req.path,
    },
    404
  )
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
      },
      err.status
    )
  }

  console.error(err)

  return c.json(
    {
      error: 'Internal Server Error',
    },
    500
  )
})

export type AppType = typeof app
```

### 22.2 index.ts

```ts
import { serve } from '@hono/node-server'
import { app } from './app'

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server is running on http://localhost:3000')
```

### 22.3 测试请求

```bash
curl http://localhost:3000/health
```

创建 Todo：

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Hono\"}"
```

查询 Todo：

```bash
curl http://localhost:3000/api/todos
```

更新 Todo：

```bash
curl -X PATCH http://localhost:3000/api/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d "{\"completed\":true}"
```

删除 Todo：

```bash
curl -X DELETE http://localhost:3000/api/todos/TODO_ID
```

### 22.4 这个实战覆盖了什么

- `Hono` 应用实例。
- 路由注册。
- 参数读取。
- JSON body 解析。
- Zod 验证。
- 中间件。
- CORS。
- 安全 Header。
- HTTPException。
- 自定义 404。
- 自定义错误处理。
- 类型导出 `AppType`。

## 23. 学习路线

建议按下面顺序学习：

1. 最小 Hello World：理解 `new Hono()`、`app.get()`、`c.text()`。
2. 路由：掌握静态路由、动态参数、query、分组路由。
3. 请求与响应：掌握 `c.req`、`c.json()`、`c.html()`、原生 `Response`。
4. 中间件：理解 `await next()` 和洋葱模型。
5. 错误处理：掌握 `app.notFound()`、`app.onError()`、`HTTPException`。
6. 验证：掌握 `validator()` 和 `@hono/zod-validator`。
7. TypeScript：掌握 `Bindings`、`Variables`、`c.var`。
8. RPC：掌握 `hc<AppType>()`。
9. 多运行时：理解 Node.js adapter 与 Cloudflare Workers 入口差异。
10. 实战项目：做一个带鉴权、数据库、测试的 API。

## 24. 常见问题

### 24.1 Hono 和 Express 最大区别是什么

Express 围绕 Node.js 的 `req/res` 设计。Hono 围绕 Web Standards 的 `Request/Response/fetch` 设计。因此 Hono 更容易跨运行时，也更适合 Edge。

### 24.2 Hono 需要 body-parser 吗

通常不需要。你可以直接使用：

```ts
await c.req.json()
await c.req.text()
await c.req.parseBody()
```

但这只是解析，不是验证。真实项目仍需要 validator。

### 24.3 Hono 能连数据库吗

可以。数据库连接不属于 Hono 核心能力。你可以使用 Prisma、Drizzle、Kysely、原生驱动等。推荐把数据库实例通过模块、`c.env` 或中间件注入。

```ts
app.use(async (c, next) => {
  c.set('db', db)
  await next()
})
```

### 24.4 Hono 适合大型项目吗

适合，但需要你自己设计模块结构。Hono 核心小，不像 NestJS 那样强制分层。大型项目建议：

- 路由按领域拆分。
- schema 单独管理。
- service 处理业务逻辑。
- 中间件集中管理。
- 使用 RPC 时按模块拆分类型。

### 24.5 Hono RPC 可以替代 tRPC 吗

在很多轻量场景可以。Hono RPC 的优势是你写普通 HTTP 路由，客户端通过类型推导获得类型安全。tRPC 更强调过程调用模型和更完整的客户端生态。选择时看团队偏好：

- 想保留 REST 风格：Hono RPC 很舒服。
- 想要完整 RPC 框架生态：tRPC 仍然强。

### 24.6 什么时候不该用 Hono

如果你需要一个强约束、强 DI、强模块化、内置大量企业级结构的框架，NestJS 可能更合适。如果只是 Node.js 传统服务，团队已经深度使用 Express，也可以继续用 Express。Hono 的优势在轻量、跨运行时、类型体验和 Web Standards。

## 25. 参考资料

- Hono 官网首页：https://hono.dev/
- Hono Getting Started：https://hono.dev/docs/getting-started/basic
- Hono Node.js 指南：https://hono.dev/docs/getting-started/nodejs
- Hono API 总览：https://hono.dev/docs/api
- Hono App API：https://hono.dev/docs/api/hono
- Hono Routing：https://hono.dev/docs/api/routing
- Hono Context：https://hono.dev/docs/api/context
- Hono Request：https://hono.dev/docs/api/request
- Hono Middleware 概念：https://hono.dev/docs/concepts/middleware
- Hono Middleware 指南：https://hono.dev/docs/guides/middleware
- Hono Validation：https://hono.dev/docs/guides/validation
- Hono RPC：https://hono.dev/docs/guides/rpc
- Hono Helpers：https://hono.dev/docs/guides/helpers
- Hono Dev Helper：https://hono.dev/docs/helpers/dev

