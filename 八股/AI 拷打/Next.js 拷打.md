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

Route Handle 通过 GET 请求在默认情况下是会被缓存的，也就是静态路由。如果不想被缓存可以转为动态路由（例如使用 `cookies()`、`headers()`，或设置 `export const dynamic = 'force-dynamic'`）。

Server Component 里的数据获取（fetch）和页面渲染结果会自动接入 Next.js 的两层缓存：Data Cache 和 Full Route Cache。使用 `fetch` 时默认会缓存，直到通过 `revalidatePath` 或 `revalidateTag` 显式清除。

``` ts
// 执行时，/posts 对应的缓存失效，包括 Data cache 和 full router cache
revalidatePath('/posts')
//---------------------------
// 给fetch打标签，执行时，所有使用了该标签的 fetch请求 缓存全失效
await fetch(url, {
  next: {
    tags: ['posts']
  }
})

revalidateTag('posts')
```

Server Action 设计上是不缓存的，因为 Server Action 本质是副作用，也就是**写操作**（例如修改数据库、删除数据）。相反，Action 常常是**清除缓存这个操作的触发者**。当你在 Action 里调用 `revalidatePath('/dashboard')` 时，Next.js 会在当前 Action 请求的响应中，顺便把更新后的页面数据（RSC Payload）一起带回前端，实现页面的**无刷新感知更新**。

``` ts
'use server'

export async function createPost(formData) {
  await db.post.create(...)

  revalidatePath('/posts')
}
/*
用户触发时 -> 修改数据并清除 /posts 页面缓存（Data cache和full router cache）

之后 /posts 页面数据重新渲染 -> 生成新的RSC Payload -> 随响应一起返回 -> React直接更新UI
*/
```
