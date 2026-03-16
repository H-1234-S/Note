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
### 返回值

`clerkMiddleware()` 的返回值是一个标准的 **Next.js Proxy Handler**。

- **内部逻辑**：它返回一个异步函数，该函数接收 `NextRequest` 并返回 `NextResponse`。
    
- **执行结果**：
    
    - 如果验证通过且没有重定向逻辑，它会返回 `NextResponse.next()`，让请求继续到达你的页面或 API。
        
    - 如果调用了 `auth().protect()` 且用户未登录，它会自动返回一个重定向到登录页面的响应。
        
    - 它还会向请求头中注入 `Auth` 状态，以便你在 Server Components 中通过 `auth()` 钩子获取用户信息。
## auth()函数

