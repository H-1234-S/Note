# Proxy

## clerkMiddleware()函数

`clerkMiddleware()` 是 Clerk 为 Next.js 提供的代理函数，主要用于**拦截请求**、**验证会话状态**以及**控制路由访问权限**。

``` ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // 忽略 Next.js 内部文件和静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 始终为 API 路由运行
    '/(api|trpc)(.*)',
  ],
};
```
### 参数

`clerkMiddleware` 接收一个可选的**异步**的**回调函数**，该函数有两个参数：

1. **`auth`**: 一个包含当前用户权限信息的对象（如 `userId`, `orgId`, `protect()` 方法）。
    
2. **`req`**: 原生的 `NextRequest` 对象，用于判断当前访问的 URL。

``` ts
export default clerkMiddleware((auth, req) => {
  // 1. 定义公共路由（不需要登录也能访问）
  const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

  // 2. 如果不是公共路由，则强制要求登录
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});
```
#### 函数的参数哪里来的？

``` ts
export default clerkMiddleware(async (auth, req) => { ... })
```

实际上是你向 Clerk 定义了一个“规则”。当用户访问你的网站时：

1. **Next.js** 抓住了这个请求。
    
2. **Clerk 的内部代码** 先运行，它去检查请求里的 Cookie 和 Header，把复杂的加密信息解密。
    
3. **Clerk 调用你的函数**：它把解析好的工具（`auth`）和原始请求（`req`）作为参数塞进你的函数里。
### 返回值

`clerkMiddleware()` 的返回值是一个标准的 **Next.js Proxy Handler**。

- **内部逻辑**：它返回一个异步函数，该函数接收 `NextRequest` 并返回 `NextResponse`。
    
- **执行结果**：
    
    - 如果验证通过且没有重定向逻辑，它会返回 `NextResponse.next()`，让请求继续到达你的页面或 API。
        
    - 如果调用了 `auth().protect()` 且用户未登录，它会自动返回一个重定向到登录页面的响应。
        
    - 它还会向请求头中注入 `Auth` 状态，以便你在 Server Components 中通过 `auth()` 钩子获取用户信息。
## auth()函数

该auth函数是proxy代理里**异步函数的参数**；不是需要导入的auth函数
### 作用

调用 `await auth()` 可以拿到当前请求的实时快照：

- **`userId`**: 用户 ID（未登录则为 `null`）。
    
- **`orgId`**: 用户当前激活的组织 ID。
    
- **`sessionClaims`**: JWT 的载荷（可以包含自定义的用户元数据）。

调用 `auth().protect()`进行路由保护。

- 如果用户没登录，它会直接打断请求，重定向到登录页。
    
- 它可以接收权限参数：`auth().protect({ role: 'org:admin' })`。

``` ts
export default clerkMiddleware(async (auth, req) => {
  // 1. 判断当前路径属性
  if (isPublicRoute(req)) return; // 公共路由直接放行

  // 2. 这里的 auth 是参数！
  // 场景：如果用户登录了但没选组织，且当前不是在选组织页面，就强制他去选组织
  const { userId, orgId } = await auth();

  if (userId && !orgId && !isOrgSelectionRoute(req)) {
    // 构造一个重定向到组织选择页面的 URL
    const orgSelection = new URL("/org-selection", req.url);
    return NextResponse.redirect(orgSelection);
  }

  // 3. 场景：如果是私有路由且没登录，protect 会处理重定向
  auth().protect();
});
```

--- 

# Page
## [OrganizationList](https://clerk.com/docs/nextjs/reference/components/organization/organization-list)

当 `<OrganizationList />` 组件加载时，它会携带配置的环境变量 向 Clerk 的服务器发送请求。

Clerk 会检查该 Instance 的配置：

- 如果你的后台关闭了组织功能，API 会返回错误或不显示相关 UI

- 如果你开启了，API 才会返回正常的组织创建/选择列表。

``` ts
import { OrganizationList } from "@clerk/nextjs";

export default function OrgSelectionPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <OrganizationList
                hidePersonal
                afterCreateOrganizationUrl="/"
                afterSelectOrganizationUrl="/"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-lg",
                    },
                }}
            />
        </div>
    );
};
```

### [属性](https://clerk.com/docs/nextjs/reference/components/organization/organization-list#properties)

`<OrganizationList />` 组件接受以下属性，所有属性均为 **可选** ：

- `afterCreateOrganizationUrl` 创建新组织后导航到的完整 URL 或路径。
    
- `afterSelectOrganizationUrl`选择组织后要导航到的完整 URL 或路径。默认值为 `undefined`。
    
- `afterSelectPersonalUrl`选择 个人账户  后要导航到的完整 URL 或路径。默认值为 `undefined`。
    
- `appearance`可选的对象，用于样式化你的组件。仅会影响 [Clerk 组件](https://clerk.com/docs/nextjs/reference/components/overview)，而不会影响 [账户门户](https://clerk.com/docs/guides/account-portal/overview) 页面。
    
- `fallback?` 组件挂载时可选的元素。
    
    `ReactNode`
    
- `hidePersonal`
    
    `boolean`
    
    一个布尔值，用于控制 ``<OrganizationList />`` 是否会在组织列表中包含用户的 个人账户 。将其设置为 ``true`` 将隐藏个人账户选项，用户将只能在不同组织之间切换。默认值为 ``false``。
    
- `skipInvitationScreen`
    
    `boolean | undefined`
    
    一个布尔值，用于控制创建组织后发送邀请的界面是否隐藏。当 ``undefined`` 时，如果最大允许成员数等于 1，Clerk 将自动隐藏该界面。默认值为 ``false``。

# 包

``` bash
npm install @prisma/adapter—pg @prisma/client @t3-oss/env-nextjs pg
```

### 1. `@prisma/client` & `pg` (核心驱动层)

- **`pg` (node-postgres)**:
    
    - **是什么**：它是 Node.js 环境下连接 PostgreSQL 数据库最基础、最底层的驱动程序。
        
    - **作用**：负责与数据库进行实际的 TCP 通信、处理 SQL 查询请求和返回原始数据。你可以把它理解为“底层的翻译官”，让 JavaScript 能够听懂 PostgreSQL 的语言。
        
- **`@prisma/client`**:
    
    - **是什么**：这是 Prisma 的核心，一个自动生成的、**强类型**的数据库查询构建器（ORM）。
        
    - **作用**：你不需要写原始的 `SELECT * FROM ...` 语句，而是直接调用 `prisma.user.findMany()`。它会根据你的数据库模型自动提供 TypeScript 类型补全，极大减少了拼写错误和运行时错误。
        
### 2. `@prisma/adapter-pg` (适配层)

- **是什么**：这是 Prisma 官方提供的“适配器”，用于将 Prisma 连接到特定的数据库驱动（在这里是 `pg`）。
    
- **为什么需要它**：
    
    - 在传统的 Node.js 环境中，Prisma 默认使用自己的二进制引擎。
        
    - 但在 **Serverless** 或 **Edge 运行时**（如 Vercel Edge Functions）中，直接使用二进制引擎可能会有兼容性问题。
        
    - 使用适配器可以让 Prisma 借用 `pg` 驱动的力量来处理连接池和通信，从而在各种托管环境下更稳定地运行。
        
### 3. `@t3-oss/env-nextjs` (工程化方案)

- **是什么**：这是一个专门为 Next.js 设计的环境变量校验库，由 T3 Stack 团队开源。
    
- **有什么用**：
    
    - **防患于未然**：很多时候我们忘记在 `.env` 里写 `DATABASE_URL`，导致程序运行时崩溃。
        
    - **类型安全**：它强迫你在一个配置文件中定义所有环境变量（如 API Key, DB URL），并使用 **Zod** 进行校验。
        
    - **自动补全**：定义好后，你在代码里输入 `env.DATABASE_URL` 时会有完整的 TS 代码提示。
        
- **实际场景**：如果你的数据库密码填错了，或者少填了一个变量，项目在**编译阶段**（build）就会直接报错报错并告诉你哪里少了，而不是等到用户访问网站时才报错。
    
### 4.总结：它们是如何协同工作的？

当你执行一个查询时，链路如下：

1. **`@t3-oss/env-nextjs`**：确保你的数据库连接字符串（`DATABASE_URL`）是存在且格式正确的。
    
2. **`@prisma/client`**：提供代码提示，让你写出 `prisma.audio.create(...)`。
    
3. **`@prisma/adapter-pg`**：作为中转站，将 Prisma 的指令传给底层的 `pg` 驱动。
    
4. **`pg`**：通过网络把指令发给你的 **PostgreSQL** 数据库并取回数据。