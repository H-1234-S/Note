--- 
# 路由系统
## App Router

- Next.js 采用基于文件系统的路由机制，只需创建文件和文件夹，框架就会自动生成对应的路由结构。

- 在 Next.js 中，app 目录下的每个文件夹都代表一个路由段（route segment），并直接映射到 URL 路径
### page

- app目录下每个文件夹都应该有page.tsx/page.jsx文件，作为当前路由的页面
### layout与template

- **布局嵌套**：支持多层布局嵌套，构建复杂的页面结构
	
- **状态管理**：布局会在页面切换时保持状态，而模板会重新渲染
	
- **根布局**：app/layout.tsx 是必须存在的根布局文件
	
- **渲染顺序**：当layout与template同时存在时，渲染顺序为 layout → template → page
#### 相同点

- layout与template可以看作多个页面共享的ui，例如导航栏、侧边栏、底部等；并把文件夹下的page作为children渲染
#### 不同点

| **特性**   | **Layout (布局)**                          | **Template (模板)**                                 |
| -------- | ---------------------------------------- | ------------------------------------------------- |
| **渲染频率** | **只渲染一次**。在子路由间切换时，Layout 不会重新挂载（Mount）。 | **每次切换都会重新渲染**。每次导航到使用该模板的页面时，都会创建一个新实例。          |
| **状态保持** | **保持状态**。例如：输入框里的文字、展开的菜单状态在跳转时不会消失。     | **重置状态**。每次跳转，组件内的 `useState`、动画等都会重新初始化。         |
| **生命周期** | 不会触发 `useEffect` 的重新执行。                  | 每次跳转都会重新触发 `useEffect`。                           |
| **典型用途** | 导航栏、侧边栏、搜索框（跨页面共享且不需要重置的 UI）。            | 页面切换动画（如 CSS 过渡）、依赖页面挂载的统计脚本（如 Google Analytics）。 |
### loading

- Next.js的loading是借助了`Suspense`实现的
	
- 触发异步自动跳转到loading页面，页面结束后自动跳转
### error

- Next.js的error是借助了`Error Boundary`实现的。
	
- 'use client' **错误组件必须是客户端组件**
### not-found

- Next.js 默认会生成一个404页面，但我们可能自定义404页面，只需要在app目录下创建一个not-found.tsx文件即可

--- 
## 路由跳转

### Link组件

- `<Link>`是一个内置组件，在a标签的基础上扩展了功能，并且还能用来实现预获取(prefetch)，以及保持滚动位置(scroll)等。
	
- 携带的参数在url路径可见
#### 基本用法

``` ts
import Link from "next/link" //引入Link组件
export default function Home() {
    return (
        <div>
            <Link href="/about">跳转About页面</Link>
            <Link href={{pathname: "/about", query: {name: "张三"}}}>跳转About并且传入参数</Link>
            // prefetch预获取意思是：在生产环境下，该Link组件出现在可视区域时，后台自动加载所对应的资源  默认开启
            <Link href="/page" prefetch={true}>预获取page页面</Link>
            <Link href="/xm" scroll={true}>保持滚动位置</Link>
            <Link href="/daman" replace={true}>替换当前页面</Link>
        </div>
    )
}
```
### useRouter Hook

- useRouter 可以在代码中根据逻辑跳转页面
#### 基本用法

``` ts
'use client'
import { useRouter } from "next/navigation"
export default function Page() {
    const router = useRouter()
    return (
        <>
        <button onClick={() => router.push("/page")}>跳转page页面</button>
        <button onClick={() => router.replace("/page")}>替换当前页面</button>
        <button onClick={() => router.back()}>返回上一页</button>
        <button onClick={() => router.forward()}>跳转下一页</button>
        <button onClick={() => router.refresh()}>刷新当前页面</button>
        <button onClick={() => router.prefetch("/about")}>预获取about页面</button>
        </>
    )
}
```

|**方法**|**语法**|**行为描述**|**历史堆栈变化**|**典型使用场景**|
|---|---|---|---|---|
|**`push`**|`router.push('/path')`|**新增**一个历史记录并跳转。|栈长度 +1|普通页面导航（如：点击查看详情）。|
|**`replace`**|`router.replace('/path')`|**替换**当前历史记录并跳转。|栈长度不变|登录重定向、表单提交后防止回退。|
|**`back`**|`router.back()`|返回到**上一个**页面。|栈指针后移|点击“返回”按钮。|
|**`forward`**|`router.forward()`|前进到**下一个**页面。|栈指针前移|点击“前进”按钮（需先执行过 back）。|
|**`refresh`**|`router.refresh()`|**刷新数据**，不丢失 React 状态。|无变化|提交数据后同步服务器最新状态。|
|**`prefetch`**|`router.prefetch('/path')`|**预加载**目标页面的代码和数据。|无变化|在用户点击按钮前提前下载资源。|

#### 通过 `useRouter` 携带参数

``` ts
"use client";

import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();

  const handleNavigation = () => {
    // 1. 使用查询参数 (Query Params)
    router.push('/dashboard?user=123&role=admin');

    // 2. 使用动态路由参数 (Dynamic Segments)
    // 假设你有 app/blog/[slug]/page.js 这样的结构
    const slug = 'hello-world';
    router.push(`/blog/${slug}`);
  };

  return <button onClick={handleNavigation}>跳转</button>;
}
```

### redirect 函数

- redirect 函数用于服务端跳转
	
- 原理：当它被调用时，它会抛出一个内部错误，Next.js 会捕获这个错误并告诉浏览器：“别加载这个页面了，直接去另一个 URL”。
	
- **在Next.js中 redirect的状态是：307临时重定向，permanentRedirect状态是：308永久重定向**

``` ts
// app/profile/page.js (Server Component)
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    // 如果没登录，直接在服务端拦截并跳转
    redirect('/login');
  }

  return <div>用户信息</div>;
}
```
##### 临时重定向 (307)

- **本质**：告诉搜索引擎和浏览器，当前的跳转只是暂时的，例如双11期间，点击首页会自动跳转到活动界面，活动结束后依旧还是首页。
    
- **SEO**：搜索引擎会继续抓取旧地址，旧地址的搜索排名保持不变。
    
- **为什么是 307 而不是 302？** * 307 保证了重定向时 **请求方法（GET/POST）不变**。如果用户 POST 了一个表单，307 重定向后依然是 POST。
### permanentRedirect 函数

- permanentRedirect 跟上面的redirect的区别是：permanentRedirect是永久重定向，而redirect是临时重定向。
	
- **在Next.js中 permanentRedirect的状态是：308永久重定向**

``` ts
//用法跟redirect一样，只是状态码不同
import { permanentRedirect } from "next/navigation"
export default async function Page() {
   const checkLogin = await checkLogin()
   if (!checkLogin) {
    permanentRedirect("/login")
   }
}
```
##### 永久重定向 (308)

- **本质**：告诉搜索引擎和浏览器，旧地址已经作废，请以后直接访问新地址。
    
- **SEO**：极其重要！它会将旧地址积攒的“搜索权重”转移到新地址。
    
- **缓存特性**：一旦浏览器收到 308，它会把这个映射存在本地。下次用户输入旧网址，浏览器**不会请求服务器**，直接在本地跳转到新网址。
---
## 动态路由

- **动态路由（Dynamic Routes）** 是指 URL 中的某一部分不是固定的字符，而是一个**变量（参数）**。
	
- **编写一个模板文件，它可以根据 URL 中传入的不同参数，渲染出不同的内容。** 例如：商品详情页面，根据不同商品的id渲染不同的内容
### 基本用法

- 使用动态路由只需要在**文件夹名**加上**方括号`[]`**即可，例如`[id]`,`[params]`等，名字可以自定义。
	
- 在**服务端组件**中，Next.js 会自动将 `params` 作为 props 传递给页面。

``` js
// app/blog/[slug]/page.js

export default async function Page({ params }) {
  // 注意：在最新版本的 Next.js 中，params 是一个 Promise，建议 await 它
  const { slug } = await params; 

  return <h1>正在阅读文章：{slug}</h1>;
}
```

- **客户端组件中**，需要在页面顶部加 `"use client"`，需要使用 `useParams` Hook。

``` js
"use client";

import { useParams } from 'next/navigation';

export default function BlogClientPage() {
  const params = useParams();
  
  // 如果路径是 /blog/123，那么 params.slug 就是 "123"
  return <div>客户端渲染的文章 ID: {params.slug}</div>;
}
```
### 全捕获路由

|**文件夹命名**|**路由类型**|**访问 URL**|**params 的结果**|**解释**|
|---|---|---|---|---|
|`/[id]`|**基础动态路由**|`/123`|`{ id: '123' }`|**只能匹配一级**。访问 `/123/456` 会报 404。|
|**`/[...id]`**|**全捕获路由**|`/123/456/789`|`{ id: ['123', '456', '789'] }`|**匹配多级**。结果是一个**字符串数组**。|
### 可选全捕获路由

- 可选全捕获路由指的是，我们可能会有这个路由参数，也可能会没有这个路由参数。

- 例如`/shop/123`，也可能是`/shop`

|**文件夹命名**|**路由类型**|**访问 /docs (根)**|**访问 /docs/a/b**|**params 结果示例**|
|---|---|---|---|---|
|**`[id]`**|基础动态|**404**|**404** (只匹配一级)|`{ id: 'a' }`|
|**`[...id]`**|全捕获|**404**|匹配成功 ✅|`{ id: ['a', 'b'] }`|
|**`[[...id]]`**|**可选全捕获**|**匹配成功 ✅**|匹配成功 ✅|`{ id: ['a', 'b'] }` 或 `{}`|
#### 为什么需要 `[[...id]]`？

它的存在是为了解决 **“同一个文件既要当首页，又要当详情页”** 的场景。

##### 场景举例：电商分类筛选页

假设你有一个商品列表页：

1. 用户访问 `/shop`：显示所有商品。
    
2. 用户访问 `/shop/clothes`：显示衣服。
    
3. 用户访问 `/shop/clothes/men/shoes`：显示男装鞋子。

如果你使用 `[[...slug]]`，你只需要创建一个文件：`app/shop/[[...slug]]/page.tsx`。

---
## 平行路由

- 平行路由指的是在**同一个布局 (Layout)** 中，**同时且独立地**显示多个页面
### 基本用法

- 通过 **`@` 文件夹** 命名约定来定义。这些文件夹被称为“插槽”。插槽**不会**影响 URL 路径。
	
	- 例如，文件结构如下：
		
		- `app/dashboard/@analytics/page.tsx`
		    
		- `app/dashboard/@team/page.tsx`
		    
		- `app/dashboard/layout.tsx`
		    
		- `app/dashboard/page.tsx`
		
    - 此时，访问 `/dashboard` 时，`layout.tsx` 会同时接收到 `analytics` 和 `team` 作为 **Props**。
	
- 在 `layout.tsx` 中，可以像使用普通的 React Props 一样渲染这些插槽

### 优势与特点

- **独立的状态与加载**： 每个插槽可以拥有自己的 `loading.tsx` 和 `error.tsx`。如果 `@analytics` 加载很慢，主页面和 `@team` 依然可以先显示出来。
    
- **条件渲染**： 你可以根据用户角色（如管理员 vs 普通用户）在 Layout 中决定渲染哪个插槽。
    
- **支持 URL 导航 (子路由)**： 插槽内部也可以有自己的文件夹。例如访问 `/dashboard/settings`，`@analytics` 可以显示 `/@analytics/settings/page.tsx` 的内容，而其他插槽保持不变。
### default.tsx

- `default.tsx` 的存在是为了解决**硬导航时的匹配逻辑问题**。
	
- 当 Next.js 在当前 URL 下找不到某个插槽（Slot）的具体页面时，用来渲染一个默认的占位 UI，防止页面报错或显示 404。
	
- 例如：当你直接刷新 URL `http://localhost:3000/dashboard/settings` 时：
	
	-  浏览器是“从零开始”构建页面的。Next.js 必须为**每一个插槽**（`children`、`@analytics`、`@team`）在 `/settings` 路径下找到对应的内容。
	    
	-  **问题**：如果你的 `@team` 文件夹里没有 `settings` 文件夹，也没有 `page.tsx`，Next.js 就不知道该画什么。
	    
	- **结果**：如果没有 `default.tsx` 救场，Next.js 会认为这是一个无效路由，直接报 **404**。
### 软导航 vs 硬导航

#### 软导航 (Soft Navigation)

当你使用 Next.js 的 `<Link>` 组件或 `router.push()` 跳转时，触发的是软导航。

- **机制**：Next.js 只通过 JavaScript 抓取新页面所需的**差异化数据**，并更新 URL，而不会重新加载整个网页。
    
- **状态保持**：因为页面没刷新，React 的状态（如 `useState`、全局 Store）都会被**保留**。
    
- **布局持久化**：如果两个页面共享同一个 `layout.tsx`，该布局**不会重新渲染**，只有中间的内容部分会变化。
#### 硬导航 (Hard Navigation)

当你按下 **F5 刷新**、在地址栏输入 URL 后回车，或者点击传统的 `<a>` 标签时，触发的是硬导航。

- **机制**：浏览器会彻底放弃当前页面的所有资源，重新向服务器发送请求，下载完整的 HTML、JS 和 CSS。
    
- **状态丢失**：所有的 React 状态和内存变量都会被**全部重置**。
    
- **性能**：由于需要完整重载，速度比软导航慢，且会出现短暂白屏。
---
## 路由组

- **路由组 (Route Groups)** 是一种特殊的文件夹结构，它允许你将路由逻辑进行分组，而**不影响 URL 的路径结构**。
### 用法

- **文件夹名称必须包裹在圆括号内**，例如 `(auth)` 或 `(dashboard)`。

如果你想让不同的页面完全彻底地拥有不同的 HTML 结构（比如去掉 `<html>` 或 `<body>` 里的某些全局脚本），你可以删除 `app/layout.tsx`，并在不同的路由组里创建各自的 `layout.tsx`。

- **注意**：每个根布局都必须包含 `<html>` 和 `<body>` 标签。
### 特性

- **URL 隐身**：圆括号里的文件夹名称不会出现在浏览器的地址栏中。
	
	- 路径：`app/(auth)/login/page.tsx` $\rightarrow$ URL: `/login` (没有 `/auth`)
	    
	- 路径：`app/(marketing)/about/page.tsx` $\rightarrow$ URL: `/about`
	
- **组织代码**：纯粹为了让开发者更好地分类文件（如把所有登录相关的逻辑放在一起）。
---
## [Route Handler](https://nextjs.org/docs/app/getting-started/route-handlers#route-handlers)

### 支持的 HTTP 方法[](https://nextjs.org/docs/app/getting-started/route-handlers#supported-http-methods)

- 以下 [HTTP 方法](https://developer.mozilla.org/docs/Web/HTTP/Methods)  受支持： `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, 和 `OPTIONS`。如果调用不受支持的方法，Next.js 将返回一个 `405 Method Not Allowed` 响应。

### 扩展的 `NextRequest` 和 `NextResponse` API[](https://nextjs.org/docs/app/getting-started/route-handlers#extended-nextrequest-and-nextresponse-apis)

- 除了支持原生的 [Request](https://developer.mozilla.org/docs/Web/API/Request) 和 [Response](https://developer.mozilla.org/docs/Web/API/Response) API，Next.js 通过 [`NextRequest`](https://nextjs.org/docs/app/api-reference/functions/next-request) 和 [`NextResponse`](https://nextjs.org/docs/app/api-reference/functions/next-response) 扩展它们，以提供方便的高级用例辅助工具。

### [router.ts](https://nextjs.org/docs/app/api-reference/file-conventions/route)

#### http方法

``` ts
export async function GET(request: Request) {}
 
export async function HEAD(request: Request) {}
 
export async function POST(request: Request) {}
 
export async function PUT(request: Request) {}
 
export async function DELETE(request: Request) {}
 
export async function PATCH(request: Request) {}
 
// If `OPTIONS` is not defined, Next.js will automatically implement `OPTIONS` and set the appropriate Response `Allow` header depending on the other methods defined in the Route Handler.
export async function OPTIONS(request: Request) {}
```

#### 参数

##### `request` (可选)[](https://nextjs.org/docs/app/api-reference/file-conventions/route#request-optional)

`request` 对象是一个 [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) 对象，它是 Web [Request](https://developer.mozilla.org/docs/Web/API/Request) API 的扩展。 `NextRequest` 让你对传入的请求有更精细的控制，包括轻松访问 `cookies` 和一个扩展的、解析的 URL 对象 `nextUrl`。

``` ts
import type { NextRequest } from 'next/server' 

export async function GET(request: NextRequest) {  const url = request.nextUrl}
```

##### `context` (可选)[](https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional)

- `context`是Route Handler的第二个参数，**是一个对象**

- **`params`**: context里的一个属性，一个解析为包含当前路由的[动态路由参数](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)的**对象**的 Promise。

app/dashboard/[team]/route.ts

``` ts
export async function GET(

    request: Request,

    { params }: { params: Promise<{ team: string }> }) {

    const { team } = await params

}
```

#### 定义GET请求

``` ts
import { NextRequest,NextResponse } from "next/server";

export default function GET( request:NextRequest ) {

    const query = request.nextUrl.searchParams

    console.log(query.get('id'))

    return NextResponse

}
```

REST client测试:

``` http
GET http://localhost:3000/api/user?id=123 HTTP/1.1
```
##### nextUrl的属性 #nextUrl

原生的 `request.url` 只是一个简单的**字符串**（例如 `"/api/search?q=js&page=1"`）。 如果你用原生字符串，你需要手动用正则或者 `new URL()` 去解析它，非常麻烦。

`request.nextUrl` 直接给你提供了一个**解析好的对象**，你可以直接点出你想要的部分：

- **`pathname`**: 获取路径（例如 `/api/search`）。
    
- **`searchParams`**: 获取问号后面的参数（例如 `q=js`）。
		
	- `request.nextUrl.searchParams` 返回的正是一个标准的 **`URLSearchParams`** 实例对象。
	    
- **`origin`**: 获取域名部分（例如 `https://localhost:3000`）。

#### 定义POST请求

``` ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {

  try {

    // 1. 解析请求体 (必须 await)

    const body = await request.json();

    // 2. 解构数据

    const { username, email } = body;

    // 3. 模拟逻辑处理（如存入数据库）

    console.log(`正在创建用户: ${username}, 邮箱: ${email}`);

    // 4. 返回成功响应，通常使用 201 状态码表示“已创建”

    return NextResponse.json(

      { message: "用户创建成功", data: body },

      { status: 201 }

    );

  } catch (error) {

    // 5. 错误处理（如 JSON 格式错误）

    return NextResponse.json(

      { error: "无效的请求数据" },

      { status: 400 }

    );

  }

}
```

REST client测试:

``` http
POST http://localhost:3000/api/home HTTP/1.1

# 设置请求头；告诉服务器接收什么类型的参数
Content-Type: application/json 

{

    "username":"HU",

    "email":"123@email"

}
```




---
# Hook

- 在next.js中，只有客户端组件才可以使用hook
## usePathname

- 用于获取跳转后页面的url路径

## useSearchParams

- 用于获取`url`传递的参数
### 基本语法

``` ts
import Link from 'next/link

<Link href={{pathname:'',query:{id:1}}} />
```

``` ts
'use client'

import { useSearchParams } from 'next/navigation'

const searchParams = useSearchParams()；
const id = searchParams.get('id')
```
### 返回值

- `useSearchParams`  返回一个只读的 `URLSearchParams` 实例
### 核心方法

- **`get(key)`**: 获取指定键的第一个值。这是最常用的。
    
    - 例如：`searchParams.get('id')`
        
- **`getAll(key)`**: 如果一个键对应多个值（如 `?tags=red&tags=blue`），它会返回一个字符串数组。
    
- **`has(key)`**: 检查 URL 中是否存在某个参数，返回布尔值。
    
- **`keys()` / `values()` / `entries()`**: 用于遍历所有的参数。
## useParams

- 用于获取**动态路由参数**
#### 基本语法

``` ts
'use client'

import { useParams } from 'next/navigation'

export default function PostClientComponent() {
  const params = useParams()

  // 假设当前路径是 /shop/electronics/iphone
  // 对应的文件夹是 /shop/[category]/[item]
  
  console.log(params) // 输出: { category: 'electronics', item: 'iphone' }

  return (
    <div className="p-4 border rounded">
      <h3>当前分类：{params.category}</h3>
      <p>正在查看：{params.item}</p>
    </div>
  )
}
```
#### 返回值

- `useParams` 返回一个包含当前路由所有动态参数的**对象**。
	
- **URL 示例**：`/blog/123`
    
- **文件夹结构**：`app/blog/[id]/page.tsx`
    
- **返回值**：`{ id: '123' }`