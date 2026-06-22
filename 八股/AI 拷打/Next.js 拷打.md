# **Next.js App Router 里，Route Handler、Server Action、Server Component 取数据，这三种服务端逻辑分别适合什么场景？**

请你重点比较：

- 调用方式
- 鉴权位置
- 缓存/重新验证怎么处理
- 错误怎么返回给前端
- 哪些场景不适合用 Server Action

Route Handler、Server Action、Server Component 取数据这三种服务端逻辑适用场景是不同

Route Handler 是传统的 RESTful API，负责标准的 HTTP 通信

Server Component 主要适用于页面初始化时候的数据拉取

Server Action 采用 RPC 机制，负责用户**交互式**的**写操作**，例如表单提交时的 action
## 调用方式

Route Handle 传统的**RESTful API**。通过显式声明 `app/api/route.ts`，暴露标准的 HTTP 端点（GET, POST, PUT, DELETE）。前端或其他客户端必须通过 `fetch` 或 `axios` 显式请求。

Server Action 采用 RPC 机制。意思是在客户端中就像一个本地的异步函数，但是是 next.js 自动处理了请求，不需要手动 Fetch

Server Component 不需要手动调用，在 next.js 渲染时会执行 Server Component 中的异步代码，比如从数据库取信息（`await db.query()`），将渲染后的 UI 描述（RSC payload）发送给客户端

## 鉴权位置

Route Handle 在 Handle 函数顶部进行鉴权，未通过时返回标准的 HTTP 状态码（如 401）。

``` ts
// app/api/data/route.ts
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}
```

**Server Action**: **必须在 Action 函数体内部的最顶部进行鉴权**。

``` js
// actions.ts
'use server'
export async function updatePost(id: string, data: any) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized');

  await db.update(id, data);
}
```

Server Component 通常在 Layout 中进行鉴权，没有权限则重定向到登录页面（`redirect('/login')`）

``` ts
// app/dashboard/page.tsx
export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/login'); // 页面重定向
  const data = await fetchDashboardData();
  return <RenderData data={data} />;
}
```

## 缓存/重新验证

