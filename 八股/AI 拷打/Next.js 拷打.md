# **Next.js App Router 里，Route Handler、Server Action、Server Component 取数据，这三种服务端逻辑分别适合什么场景？**

请你重点比较：

- 调用方式
- 鉴权位置
- 缓存/重新验证怎么处理
- 错误怎么返回给前端
- 哪些场景不适合用 Server Action

Route Handler、Server Action、Server Component 取数据这三种服务端逻辑适用场景是不同

Route Handler 是 Next 提供的一种 HTTP 请求处理机制

Server Component 主要适用于页面初始化时候的数据拉取

Server Action 采用 RPC 机制，负责用户**交互式**的**写操作**，例如表单提交时的 action
## 调用方式

Route Handle 是 Next 提供的一种 HTTP 请求处理机制。通过显式声明 `app/api/route.ts`，暴露标准的 HTTP 端点（GET, POST, PUT, DELETE）。前端或其他客户端必须通过 `fetch` 或 `axios` 显式请求。

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

Server Component 通常在 Layout 中进行鉴权，没有权限则重定向到登录页面（`redirect('/login')`）；其次也需要在具体的数据查询处进行校验

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

## 错误处理

**Route Handler**: 遵循标准的 Web 规范。通过 `NextResponse.json({ error: 'msg' }, { status: 400 })` 返回，前端通过解析 HTTP 状态码和 Body 来处理错误。

**Server Component**: 如果在渲染时抛出错误，它会触发 Next.js 的 **Error Boundary** 机制。页面会直接降级展示同级或上级的 `error.js` 组件。

**Server Action:** 不要直接 `throw new Error`（这会导致控制台报错或触发全局 Error Boundary），而是**返回一个包含错误信息的普通对象**。
	如果在 Action 中 `throw new Error()`，通常会被前端的 `useActionState`或 `try...catch` 捕获。

## 哪些场景不适合用 Server Action？

1. 请求数据不适用；因为 Server Action 底层一定是 POST 请求
2. 高频触发也不适用；每次触发 Server Action 都会产生一次完整的网络往返
3. 对外开放的 API 和第三方回调；Server Action 的请求是由 Next.js 内部完成的，并且依赖 Next.js 特定的请求头
4. 精准的文件上传进度；虽然 Server Action 支持 `FormData` 上传文件，但它目前很难原生做到精准的“上传进度条”感知。

---

# 在 Server Component 里调用 `fetch` 时，`cache: "force-cache"`、`cache: "no-store"`、`next: { revalidate: 60 }` 分别是什么意思？它们和路由的静态/动态渲染有什么关系？

`force-cache`：优先使用 Next 的 Data Cache，构建时或首次请求时缓存结果，后续复用。fetch 默认就是这个配置。

`no-store`：不进入 Data Cache，每次请求都重新获取；通常会让使用它的 route 变成动态渲染，因为结果依赖每次请求。

`next: { revalidate: 60 }`：不是“60 秒之后立刻重新运行”，而是缓存最多认为新鲜 60 秒。超过 60 秒后的下一次请求会触发重新验证

其实要看整体情况，虽然默认情况下是`cache: "force-cache"`，是静态路由，但是还要看有没有`cookies()`、`headers()`、`export const dynamic = 'force-dynamic'`动态因素

---
# Next.js 鉴权安全

## 在 App Router 里，如果你在 `layout.tsx` 做了鉴权，没有登录就 `redirect("/sign-in")`，是不是就能保证该路由下所有数据接口都安全？为什么？请结合 Server Component、Route Handler、Server Action 分别说明。

`layout.tsx` 里没有登录就`redirect("/sign-in")`，这只是在ui层做了鉴权，但是Next中有三种服务端获取数据逻辑，数据获取时也应该做鉴权，一个项目要良好的运行，路由要是受保护的

Server Component 

Route Handler 是 Next.js 提供的一种**底层的 HTTP 请求处理机制**，显示定义API路径，暴露标准的 HTTP 请求端点，它是公开的API，意味着谁都可以请求，因此一定要做路由保护进行鉴权，不然就会导致数据泄露

Server Action 是Next一个新特性，可以让客户端触发服务端逻辑，处理交互式的写入操作，本质就是一个 POST 请求，只不过采用了 RPC 机制，既然是请求就可以被构造，因此也需要鉴权