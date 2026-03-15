**教程的目的**：让 /dashboard 系列页面只有登录后才能访问，未登录用户自动重定向到登录页。
# 安装依赖

``` bash
npm install next-auth@beta    # 或 pnpm / yarn
# 或更新的写法（2026 年常见）
npm install authjs            # 但教程里还是用 next-auth@beta
```
# 创建 auth.config.ts

``` ts
// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',           // 自定义登录页（不是默认的 /api/auth/signin）
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;           // → 会触发重定向到 signIn 页
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
```

 pages.signIn：自定义登录页，告诉 Auth.js 当需要登录时跳转到` /login`  页面
## [callbacks](https://authjs.dev/reference/nextjs#callbacks)

### authConfig

`authConfig` 用于 **在身份验证流程的具体环节插入自定义逻辑。**