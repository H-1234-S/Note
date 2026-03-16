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