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

#### 动态路由参数


``` ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest,
	// { params }: { params: Promise<{ id: string }> } 这里参数的类型只能是string
    { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params

    return NextResponse.json({ message: `${id}` })

}
```

REST client测试:

``` http
POST http://localhost:3000/api/home/123141 HTTP/1.1
```

--- 
# 渲染方式

## 1.CSR、SSR、SSG、Hydration

### 1. CSR (Client-Side Rendering) - 客户端渲染

这是最传统的 React 应用（如 `create-react-app`）的渲染方式。

- **过程**：服务器只给浏览器发一个几乎空白的 HTML（只有一个 `<div id="root"></div>`）和一大堆 JS 文件。浏览器下载并执行 JS，然后在客户端生成 DOM 节点。
    
- **优点**：页面切换快（SPA 体验），减轻服务器负担。
    
- **缺点**：**SEO 极差**（爬虫看到的是空白页），**首屏加载慢**（白屏时间长，因为要等 JS 下载完）。
    
- **比喻**：你买了一套宜家家具，商家只给了你一堆零件和说明书，你自己回家拼装。
    

---

### 2. SSR (Server-Side Rendering) - 服务端渲染

这是 Next.js 最出名的特性之一。

渲染流程：

**服务器端 (Server Side)**

- **接收请求**：浏览器发起 HTTP 请求。
    
- **数据预取 (Data Fetching)**：服务器内部调用 API 或直接查数据库。
    
- **渲染 HTML (Render to String)**：React 将组件树转换成纯 HTML 字符串。
    
- **响应流 (Response)**：将 HTML 发送给浏览器。
    

**浏览器端 (Client Side)** —— 分为两个关键时刻

- **时刻 A：FCP (First Contentful Paint)**
    
    - 浏览器解析 HTML 并绘制 UI。
        
    - **状态**：用户**看到了**内容，但点击按钮没反应（因为 JS 还没运行）。
        
- **时刻 B：TTI (Time to Interactive)**
    
    - 浏览器下载、解析并执行 JS 文件。
        
    - **执行 Hydration (水合)**：React 扫描现有的 DOM 节点，绑定事件监听器，同步内部状态。
        
    - **状态**：页面**激活**，用户可以进行交互。

---

### 3. SSG (Static Site Generation) - 静态网站生成

这是 Next.js 性能最高的方式。

- **过程**：在**执行打包命令（Build Time）**时，就把所有可能的页面都生成好 HTML 文件。用户请求时，服务器直接把现成的文件扔过去（通常配合 CDN）。
    
- **优点**：速度快到极致，服务器压力最小，SEO 极佳。
    
- **缺点**：数据不具备实时性。如果数据变了，通常需要重新 Build。
    
- **比喻**：你去超市买罐头，它是早就生产好摆在那里的，你拿走就能吃。
	

---

### 4.Hydration - 水合

HTML他是静态的，需要通过JS才能变成动态的，不然HTML是没有任何交互效果的，当JS下载完成在赋予HTML**交互效果**的阶段称之为`水合`。

以Next.js水合为例(详细版本):

**服务端操作:**

- Next.js 服务器接收到用户请求。
	
- 服务器执行 React 组件代码，获取数据（比如从 API 接口请求文章列表）。
	
- 服务器将 React 组件渲染成静态 HTML 字符串（包含了文章列表的所有内容）。
	
- 服务器将这个 HTML 字符串返回给浏览器。
	

**客户端操作:**

- 浏览器接收到 HTML，立即解析并展示给用户（此时用户能看到文章列表，但点击 “查看详情” 按钮没有反应）
	
- 浏览器开始下载页面所需的 JS 文件（包括 React 核心库、组件代码等）
	
- JS 下载完成后，React 会执行 ReactDOM.hydrateRoot() 方法（在 React 18+ 中）
	
- hydrateRoot() 会对比浏览器中的真实 DOM 和 React 组件的虚拟 DOM：
	
    - 如果结构一致，React 会给真实 DOM 绑定事件监听器。
		
    - 如果发现差异（比如服务器和客户端数据不一致），React 会发出警告，并以客户端渲染的结果为准。
		
- 水合完成后，页面变成可交互的动态页面（用户可以点击按钮、滚动加载更多内容等）
	

--- 

## [2.RSC(React Server Components) - 服务器组件](https://nextjs.org/docs/app/getting-started/server-and-client-components)

RSC(服务器组件)是React19`正式引入`的一种新的组件类型，它可以在服务器端渲染，也可以在客户端渲染。

像传统的`SSR`他是在服务器提前把页面渲染好，然后返回给浏览器，然后进行水合，`CSR`则是在客户端渲染，而`RSC`则是吸取两方优势，分为`服务器组件`和`客户端组件`。

**RSC**其代码永远不会发送到浏览器，仅将**渲染后的 UI 描述 RSC Payload（非 HTML，而是一种特殊的流式数据）传给客户端。**

RSC在服务端进行渲染，生成RSC Payload发送给客户端

### 产生原因

- 传统 React 应用是客户端渲染（CSR）或服务器端渲染（SSR）的混合。

- 在 SSR 中，服务器生成 HTML 并发送给客户端，然后客户端加载 JavaScript 代码并“水合”（hydrate）页面，使页面变得可交互。

这带来了几个问题：

- 所有组件都必须发送到客户端：即使某些组件只用于展示，没有交互，它们的 JavaScript 代码仍然需要被下载、解析和执行。

- 数据获取瀑布：客户端组件通常需要在挂载后获取数据，导致多次往返，延长页面加载时间。

- SEO 与性能权衡：虽然 SSR 能改善首屏内容，但水合过程仍可能阻塞交互。

因此：

- RSC 的目标是允许开发者将组件分为两类：服务器组件和客户端组件，从而优化这些方面。

### 优点

- 将组件拆分成客户端组件和服务器组件，可以有效的减少`bundle`体积，因为`服务器组件`已经在服务器渲染好了，所以没必要打入`bundle`中,也就是说服务器组件所依赖的包都不会打进去，大大减少了`bundle`体积。
    
- 局部水合，像传统的SSR同构模式, 所有的页面都要在客户端进行水合，而`RSC`将组件拆分出来，只会把客户端组件进行水合，避免了全量水合带来的性能损耗。
    
- 流式加载，我们的HTML页面本来就支持流式加载，所以服务器组件可以边渲染边返回，提高了FCP(首次内容绘制)性能。

### 工作原理





--- 

## 3.服务端组件(Server Components)

### 定义

- 在服务器上运行的 React 组件，默认情况下所有组件都是服务器组件，除非显式标记为客户端组件。

### 特性

- 不能使用状态（useState）、副作用（useEffect）、事件监听器等客户端特性。

- 可以直接访问后端资源（数据库、文件系统、API 等），无需额外 API 路由。

-  渲染结果以特殊格式（RSC Payload）序列化并发送给客户端，不包含任何 JavaScript 代码。

-  支持异步组件（async/await），可以直接 await 数据。

### 优点

- 安全性: 我们在服务端组件中访问一些API秘钥，令牌等其他机密，不会暴露给客户端。
	
- 体积: 因为服务端组件在服务器渲染，所以不会被打包到客户端，所以体积更小。
	
- 全栈：可以在服务端组件访问数据库，文件系统等其他API，实现全栈开发。
	
- FCP(首次内容绘制): 因为服务端组件是流式传输，所以边渲染边返回，提高了FCP(首次内容绘制)性能。
	


--- 

## 4.客户端组件(Client Components)

声明客户端组件需要在文件的顶部编写 `'use client'` 声明这是客户端组件，但是注意客户端组件会在服务端进行一次`预渲染`，所以访问`document` `window` 等API需要在`useEffect`中访问。

一旦文件被标记为客户端组件，**它的所有导入项和子组件都会被视为客户端包的一部分**。

**客户端组件不能嵌套服务端组件，但服务端组件可以嵌套客户端组件**

### 特性

- 拥有完整的 React 功能（状态、效果、事件处理、浏览器 API）。

- 可以在服务器上预渲染（SSR）生成 HTML，但 JavaScript 代码仍会发送到客户端进行水合。
  
- 不能直接访问服务器端资源。
  
- 何时使用：用于交互式 UI、状态管理、使用浏览器 API 的组件。

### 预渲染

1. **生成初始 HTML**： React 会尝试在服务端执行一遍客户端组件。虽然它不能执行 `useEffect` 或处理点击事件，但它能运行组件的主体函数，获取**渲染出的 DOM 结构。**
    
    - **内容包括**：静态文本、标签结构（`div`, `button`, `span`）、初始状态下的数据。
        
    - **不包括**：事件监听器、由 `useEffect` 触发的二次渲染内容、浏览器特有的 API 结果（如 `window.innerWidth`）。
        
2. **生成序列化指令 (Instruction)**： 服务器还会发送一段特殊的 JSON 数据（通常在 Next.js 的 Payload 中），告诉浏览器：“这里有一个客户端组件，它需要的 JS 文件在某某路径，它的初始 Props 是这些。”

### 预渲染产生的问题

 **无法直接访问浏览器 API**

如果你在组件顶层直接写 `window.localStorage`，预渲染阶段（在 Node.js 环境）会直接报错。

- **解决方案**：将其放入 `useEffect` 中，因为 `useEffect` 只会在浏览器端水合后执行，不会在预渲染阶段执行。
    

**水合不一致 (Hydration Mismatch)**

如果你的预渲染 HTML 里写的是 `<div>上午好</div>`（服务端时间），但浏览器水合时发现应该是 `<div>下午好</div>`（客户端时间），React 就会报错，因为它发现“骨架”对不上了。

## 5.渲染流程

### 首次页面加载

当用户直接访问一个页面时（如输入网址或刷新），Next.js 会执行完整的服务端渲染（SSR）流程：

所有组件（包括服务端组件和客户端组件）都在服务器上执行：

- 服务端组件：直接运行，可能获取数据，生成 React 元素。
  
- 客户端组件：同样在服务器上运行一次（但不执行 useEffect 等客户端代码），生成 React 元素。
  
生成完整 HTML：服务器将整个组件树渲染成静态 HTML 字符串，作为响应发送给浏览器。这样浏览器能立即显示内容，无需等待 JavaScript。

同时生成 RSC Payload：除了 HTML，服务器还会生成一个特殊的 RSC Payload（通常嵌入在 HTML 的 script标签中）。这个 Payload 是一个紧凑的数据结构，描述了组件树的结构、服务端组件的渲染结果、以及客户端组件的位置和 props。

发送客户端组件 JavaScript：浏览器还会下载所有客户端组件的 JavaScript 代码（通过脚本标签）。

所以首次加载返回给浏览器的实际上是：

- 完整的 HTML（由所有组件共同渲染）

- RSC Payload（用于后续水合和导航）

- 客户端组件的 JavaScript 代码

浏览器拿到 HTML 后立即显示内容，然后 React 使用 RSC Payload 和 JavaScript 进行水合，使客户端组件变得可交互。

### 后续客户端导航

当用户在应用内通过link跳转或使用路由导航时，Next.js 不会重新请求整个 HTML，而是只向服务器请求新的 RSC Payload：

- 服务器重新执行对应页面的组件，生成新的 RSC Payload。

- 浏览器收到 Payload 后，React 会根据它更新 DOM，而无需重新加载页面或下载重复的 JavaScript。

- 在这个过程中，没有新的 HTML 被返回，只有 RSC Payload。
--- 
## [6.缓存组件(Cache Components)](https://nextjs.org/docs/app/getting-started/cache-components)

缓存组件允许您在单个路由中**混合静态、缓存和动态内容**，从而兼具静态网站的速度和动态渲染的灵活性。

缓存组件是一项可选功能。可以通过在 Next 配置文件中设置`cacheComponents`为`true`来启用。有关更多详细信息，请参阅[“启用缓存组件” 。](https://nextjs.org/docs/app/getting-started/cache-components#enabling-cache-components)

- 静态内容: 构建(`npm run build`)时进行预渲染，例如 `「本地文件」「模块导入」「纯计算」（无网络请求、无用户相关数据）`,会被直接编译成`HTML`瞬间加载、立即响应。
    
- 动态内容：用户发起请求时才开始渲染的内容，依赖 “实时数据” 或 “用户个性化信息”，每次请求都可能生成不同结果，不会被缓存。例如`「实时数据源」（如实时接口、数据库实时查询）或「用户请求上下文」（如 Cookie、请求头、URL 参数）`。
    
- 缓存内容：缓存内容的本质就是缓存动态数据，缓存之后会被纳入`静态外壳(Static Shell)`,静态外壳就类似于`毛坯房`，会提前把结构搭建好，后续在通过(流式传输)填充里面的动态内容。

#### PPR(**Partial Prerendering**)-部分预渲染

原理：生成了一个**静态外壳**，让用户能瞬间看到导航和布局(静态数据)，而那些慢速的动态接口被隔离在 `Suspense` 占位符中通过 **HTTP 流** 传输。

##### 静态外壳 (Static Shell)

在**构建阶段 (Build Time)**，Next.js 会渲染组件树。

- 如果组件不依赖请求数据（如 `cookies`、`headers`）或网络资源，其输出会被直接打包进**静态外壳**。
	
- 对于动态内容，HTML 里会存一个特殊的标记（或 Loading 骨架屏），相当于占位符，告诉浏览器：“这里待会儿会有内容流进来”，将占位符存进**静态外壳**。
    
- **产物**：初始加载所需的 **HTML** 和用于客户端导航的 **RSC Payload**。
    
##### 预渲染的优势

- **即时加载**：无论用户是通过 URL 直接进入还是从站内跳转，浏览器都能立即收到已经渲染好的内容。
    
- **减少服务器负担**：大部分 UI 已经是静态的，不需要在每个请求时重新计算。
	
### 对于动态内容

如果一个组件在构建阶段无法完成渲染（例如：需要获取实时用户信息或查询实时数据库），Next.js 要求开发者必须进行**显式处理**。
##### 使用 `<Suspense>`（推迟渲染）

- **逻辑**：将该组件标记为“动态子树”，推迟到**请求时间 (Request Time)** 渲染。
    
- **表现**：静态外壳先发送，动态内容位置显示 `fallback`（如骨架屏），数据准备好后再“流式”注入。
    
- **代码示例**：
    ``` ts
    <Suspense fallback={<Skeleton />}>
      <DynamicComponent /> {/* 请求时才加载 */}
    </Suspense>
    ```

##### `use cache` 指令（强制缓存）

- **逻辑**：这是 React 19 引入的指令。它告诉框架：“虽然这个函数/组件有获取数据的行为，但我希望你**在构建时**就执行它并缓存结果。”
    
- **表现**：该组件的结果会被包含在**静态外壳**中，不再在请求时动态获取。
    
- **代码示例**：
    ``` ts
    // 定义在函数或组件顶部
    import { cacheLife } from 'next/cache'
    async function getRecommendations() {
      "use cache"; 
      cacheLife("hours") //使用预设参数
      //cacheLife({stale: 30, revalidate: 1, expire: 1}) //使用自定义参数
      return await db.query(...);
    }
    ```

### 混合渲染

Next.js 允许在同一个路由（页面）中灵活组合不同的内容形态：

|**内容类型**|**实现方式**|**渲染时机**|**典型场景**|
|---|---|---|---|
|**纯静态内容**|默认组件|构建阶段 (Build)|导航栏、页脚、静态文章|
|**已缓存组件**|`use cache`|构建阶段 (Build)|推荐商品列表、非实时的配置|
|**动态交互内容**|`<Suspense>`|请求阶段 (Stream)|个人资料、购物车、实时评论|

### 传统渲染与PPR

#### 未启用缓存组件 (`cacheComponents: false`)

只要页面中没有显式的“动态信号”，Next.js 默认将其视为**静态（Static）**。一旦检测到动态操作，整个页面都会变成**动态（Dynamic）**。

例如：

- 即便有 `fetch`，构建后数据也会被“定格”，刷新不改变。

因为：

- Next.js 的“数据缓存”机制，Next.js 对原生 `fetch` 进行了扩展。默认情况下，`fetch` 请求被视为 **`force-cache`（强制缓存）**。

##### 退出缓存的四种方案

Next.js 通过识别特定的“动态信号”来决定是否开启实时渲染。如果代码中没有出现以下内容，页面就会被视为静态：

| **方案**          | **代码实现**                                    | **颗粒度**    |
| --------------- | ------------------------------------------- | ---------- |
| **重新验证**        | `export const revalidate = 5`               | 路由级 (时间驱动) |
| **强制动态**        | `export const dynamic = 'force-dynamic'`    | 路由级 (全页动态) |
| **禁用 fetch 缓存** | `fetch(url, { cache: 'no-store' })`         | 请求级        |
| **动态 API 调用**   | 使用 `cookies()`, `headers()`, `connection()` | 自动识别       |

#### 启用缓存组件 (`cacheComponents: true`)

##### 运作机制

- **静态外壳**：包含所有非阻塞的 HTML（如 `<h1>Home</h1>`）。
    
- **动态空位**：通过 `<Suspense>` 标记。由于启用了缓存组件，`Suspense` 内部的 `fetch` 不再需要配置 `force-dynamic`，系统自动将其视为动态流传输。
	
- **强制缓存**：通过 `use cache` 指令，让组件在构建时预先请求并缓存结果
	

--- 
# 缓存策略

## 1. 请求记忆化 (Request Memoization)

- **层级**：服务器端（组件树级）。
    
- **原理**：在同一个渲染请求周期内，如果你在不同的组件里调用了同一个 `fetch`（**相同的 URL 和参数**），Next.js 只会真正发送**一次**网络请求。
    
- **存活时间**：仅在一次服务器请求期间有效，渲染完即销毁。
    
- **目的**：让你在组件树中自由地 `fetch` 数据，不必担心重复请求。
    

---

## 2. 数据缓存 (Data Cache)

- **层级**：服务器端（跨请求/持久化）。
    
- **原理**：这是 Next.js 对原生 `fetch` 的扩展。它会将获取到的数据存在服务器的磁盘或内存中。
    
- **存活时间**：持久存在，除非你手动设置 `revalidate`（重新校验）或使用 `{cache:no-store}`。
    
- **配置方式**：
    
    - `fetch(url, { next: { revalidate: 3600 } })`：每小时更新一次。
        
    - `fetch(url, { cache: 'force-cache' })`：永久缓存（默认行为）。
        

---

## 3. 全路由缓存 (Full Route Cache)

- **层级**：服务器端（构建时/重新校验时）。
    
- **原理**：在构建（build）时，Next.js 会自动将**静态路由**渲染成 HTML 和 RSC Payload 并存储。
    
- **触发条件**：路由必须是静态的。如果你使用了 `cookies()`、`headers()` 或非缓存的 `fetch`，这一层就会失效。
    
- **目的**：减少服务器计算压力，实现类似静态网站的瞬间响应。
    

---

## 4. 路由器缓存 (Router Cache)

- **层级**：**客户端 (浏览器)**。
    
- **原理**：当你使用 `<Link>` 导航时，Next.js 会在浏览器内存中缓存已经访问过或“预取 (Prefetch)”到的页面片段（RSC Payload）。
    
- **表现**：当你点击“后退”或“前进”时，页面是瞬间切换的，甚至不需要再次请求服务器。
    
- **存活时间**：会话级（刷新页面即消失），静态内容缓存 5 分钟，动态内容 30 秒。

---
# 内置组件

## [1.Image组件](https://nextjs.org/docs/app/api-reference/components/image)

Next.js Image 组件扩展了 HTML`<img>`元素，实现了自动图像优化。相比于原生的 `<img>` 标签，它自带了懒加载、占位图和尺寸优化等功能。

### 1.优势

- 尺寸优化：支持使用现代化图片格式，如`webp`，`avif`，`apng`等,并自动根据设备提供正确的尺寸。
	
- 视觉稳定性：防止图片加载时发生布局偏移，具体参考[CLS](https://web.dev/articles/cls?hl=zh-cn)
	
- 懒加载：在图片进入视口才会加载，使用浏览器原生懒加载，并可选择添加模糊显示占位符。
	
- 灵活性：可按需调整图像大小，即使是存储在远程服务器上的图像也可以调整。
	

``` ts
import Image from 'next/image'
 
export default function Page() {
  return (
    <Image
      src="/profile.png"
      width={500}
      height={500}
      alt="Picture of the author"
    />
  )
}
```
### 2.引入

#### 1.src本地引入

Next.js建议我们把图片放在根目录下的`public`文件夹中，然后使用`/`开头访问。

``` ts
import Image from "next/image"
export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <Image
                src="/1.png"
                width={100}
                height={100}
                alt="1"
            />
        </div>
    )
}
```

#### 2.import静态引入

使用静态`import`引入图片，**无需填写宽度和高度**，Next.js会自动确定图片的尺寸。

``` ts
import Image from "next/image"
import test from '@/public/1.png'
export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <Image
                src={test}
                alt="1"
            />
        </div>
    )
}
```

#### 3.远程图片引入

``` ts
import Image from "next/image"
export default async function Home() {
    const len = 20;
    return (
        <div>
            <h1>Home</h1>
            {Array.from({ length: len }).map((_, index) => (
                <Image
                    key={index}
                    src={`https://eo-img.521799.xyz/i/pc/img${index + 1}.webp`}
                    alt="1"
                    width={192}
                    height={108}
                />
            ))}
        </div>
    )
}
```

当我们直接使用远程图片引入的时候Next.js会报错，因为Next.js默认**只允许加载本地图片**，如果需要加载远程图片，需要配置`next.config.js`文件。

``` ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https', // 协议
        hostname: 'eo-img.521799.xyz', // 主机名
        pathname: '/i/pc/**', // 路径
        port: '', // 端口
      },
    ],
  },
};
```

### 3.适配

#### 1. 响应式适配

`sizes` 是响应式图片优化中最重要的属性。它告诉浏览器：在特定的屏幕宽度下，这张图片实际占据的页面宽度是多少。

``` ts
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

**含义**：

- 当屏幕 $\le 768px$ 时，图片占满全屏宽度 ($100vw$)。
    
- 当屏幕 $\le 1200px$ 时，图片占半屏宽度 ($50vw$)。
    
- 其他情况（桌面端），图片占三等分宽度 ($33vw$)。

#### 2.自定义断点

可以使用`deviceSizes`和`imageSizes`属性来进行自定义断点。

`imageSizes`用于生成小图片尺寸例如(缩略图，头像等)，而`deviceSizes`用于生成大图片尺寸例如(横幅图、背景图、全屏展示图)。

``` ts
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```



### 5.属性
#### 必需属性

|属性|类型|示例|说明|
|---|---|---|---|
|src|String|`src="/profile.png"`|图片源路径，支持本地路径或远程 URL|
|alt|String|`alt="Picture of the author"`|图片替代文本，用于无障碍访问和 SEO|

#### 尺寸相关

|属性|类型|示例|说明|
|---|---|---|---|
|width|Integer (px)|`width={500}`|图片宽度，静态导入时可选|
|height|Integer (px)|`height={500}`|图片高度，静态导入时可选|
|fill|Boolean|`fill={true}`|填充父容器，替代 width 和 height|
|sizes|String|`sizes="(max-width: 768px) 100vw"`|响应式图片尺寸|

#### 优化相关

|属性|类型|示例|说明|
|---|---|---|---|
|quality|Integer (1-100)|`quality={80}`|图片压缩质量，默认为 75|
|loader|Function|`loader={imageLoader}`|自定义图片加载器函数|
|unoptimized|Boolean|`unoptimized={true}`|禁用图片优化，使用原图|

#### 加载相关

|属性|类型|示例|说明|
|---|---|---|---|
|loading|String|`loading="lazy"`|加载策略，“lazy” 或 “eager”|
|preload|Boolean|`preload={true}`|是否预加载，用于 LCP 元素|
|placeholder|String|`placeholder="blur"`|占位符类型，“blur” 或 “empty”|
|blurDataURL|String|`blurDataURL="data:image/jpeg..."`|模糊占位符的 Data URL|

#### 事件回调

|属性|类型|示例|说明|
|---|---|---|---|
|onLoad|Function|`onLoad={e => done()}`|图片加载完成时的回调|
|onError|Function|`onError={e => fail()}`|图片加载失败时的回调|

#### 其他属性

|属性|类型|示例|说明|
|---|---|---|---|
|style|Object|`style={{objectFit: "contain"}}`|内联样式对象|
|overrideSrc|String|`overrideSrc="/seo.png"`|覆盖 src，用于 SEO 优化|
|decoding|String|`decoding="async"`|解码方式，“async”/“sync”/“auto”|





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