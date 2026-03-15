[Auth.js](https://nextjs.org/learn/dashboard-app/adding-authentication#what-is-authentication)

**教程的目的**：让 /dashboard 系列页面只有登录后才能访问，未登录用户自动重定向到登录页。
# 安装依赖

``` bash
npm install next-auth@beta    # 或 pnpm / yarn
# 或更新的写法（2026 年常见）
npm install authjs            # 但教程里还是用 next-auth@beta
```
# 创建 auth.config.ts(基础配置 + pages 重定向)

添加保护路由的逻辑。阻止用户在未登录的情况下访问仪表板页面。

``` ts
// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',           // 自定义登录页（不是默认的 /api/auth/signin）
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
	  // 双取反，还原逻辑；例如auth?.user为对象，!auth?.user = false；!!auth?.user = true
      const isLoggedIn = !!auth?.user;
      // startsWith方法用来判断当前字符串是否以给定字符串开头
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;           // → 会触发重定向到 signIn 页
      } else if (isLoggedIn) {
      // 已经登录过再次登录被重定向到 dashboard 页面
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
```

 pages.signIn：自定义登录页，告诉 Auth.js 当需要登录时跳转到` /login`  页面
 
callbacks.authorized：这是 **保护路由的核心逻辑**

- 每次请求进来，都会运行这个函数

- 判断用户是否已登录（!!auth?.user）

- 如果要去 /dashboard/* 但没登录 → 返回 false → Auth.js 自动重定向到 /login

- 如果已登录但去的是公开页（如 /）→ 自动跳到 dashboard（常见体验）

- 其他情况放行
--- 
## 为什么不配置providers

其根本原因在于 **Next.js 的运行环境限制**，也就是所谓的 **Edge Runtime（边缘运行时）** 兼容性问题。

### 1. 核心矛盾：中间件的限制

Next.js 的 **Middleware（中间件）** 运行在 Edge Runtime 中。为了保证极快的响应速度，这个环境非常精简，它**不支持**许多 Node.js 的原生模块和重量级库。

而在配置 `providers`（尤其是 `Credentials` 登录方式）时，你通常需要：

1. **引入 `bcrypt`**：用于校验加密密码。`bcrypt` 依赖于 Node.js 的 C++ 绑定，这在 Edge 环境下会直接导致报错。
    
2. **查询数据库**：引入数据库驱动（如 `postgres` 或 `prisma`）。很多传统的数据库驱动在 Edge 环境下也是不工作的。
    
---
### 2. 为什么 `auth.config.ts` 必须保持“干净”？

- **它的角色**：这个文件会被 `middleware.ts` 引用。
    
- **后果**：如果你在 `auth.config.ts` 里配置了 `providers` 并引入了 `bcrypt`，那么中间件在启动时就会尝试加载 `bcrypt`。
    
- **报错**：你会看到类似 `Error: Standard Node.js modules are not supported in the Edge Runtime` 的错误。
    

因此，我们将 `auth.config.ts` 作为一个**“纯净的配置文件”**，只写中间件能理解的逻辑（比如路由跳转规则），而不引入任何不兼容的库。

### 3. 为什么在 `auth.ts` 中配置？

- **它的角色**：它是身份验证的“完全体”。
    
- **运行环境**：它通常在标准的 **Node.js Runtime** 下运行（例如处理登录请求的 API 或 Server Actions）。
    
- **逻辑合并**：在 `auth.ts` 中，我们会这样做：
    
    ``` ts
    import NextAuth from 'next-auth';
    import { authConfig } from './auth.config'; // 引入基础配置
    import Credentials from 'next-auth/providers/credentials'; // 引入重量级组件
    
    export const { auth, signIn, signOut } = NextAuth({
      ...authConfig, // 展开基础配置
      providers: [
        Credentials({
          // 在这里写涉及数据库和 bcrypt 的复杂逻辑
          // 因为这里是 Node.js 环境，所以不会报错
        })
      ],
    });
    ```

--- 
## [callbacks](https://authjs.dev/reference/nextjs#callbacks)

### authConfig

`authConfig` 用于 **在身份验证流程的具体环节插入自定义逻辑。**

每当proxy拦截到一个请求时运行
#### 参数

 `auth` (Session 对象)

- **它是谁**：这是当前用户的会话数据。
    
- **来源**：NextAuth 解析 Cookie 后得到的。
    
- **状态**：
    
    - 未登录时：值为 `null`。
        
    - 已登录时：包含 `user` 信息（如 `email`, `name`）和 `expires`（过期时间）。
        
- **用途**：最核心的用途是判断“用户是谁”以及“是否合法”。
    

2. `request` (NextRequest 对象)

- **它是谁**：这是 Next.js 提供的原始请求对象。
    
- **关键子属性**：
    
    - **`nextUrl`**：最常用。包含 `pathname`（路径）、`searchParams`（查询参数）、`host`（域名）等。
        
    - **`cookies`**：你可以直接读取浏览器传来的所有 Cookie。
        
    - **`headers`**：获取请求头信息（例如用户的浏览器类型 User-Agent）。
        
    - **`ip`**：访问者的 IP 地址。
        
- **用途**：判断“用户想去哪”以及“请求来自哪里”。
    

 3. `data` (额外数据 - 较少用)

- **它是谁**：在某些特定流程中（如 OAuth），可能包含从 Provider 传回的原始数据。
    
- **用途**：作为补充信息，但在官方教程的 Dashboard 练习中通常用不到。
    

 4. `params` (路由参数)

- **它是谁**：如果你使用的是动态路由（例如 `/dashboard/[id]`），这里会包含解析出来的路径参数。
    
- **用途**：针对特定的资源 ID 进行精细化权限控制。

#### 返回值

 返回 `false`（拒绝访问）

- **含义**：告诉 NextAuth：“这个用户没有权限查看这个页面。”
    
- **后果**：用户会被**强制重定向**到他在 `pages` 属性中定义的登录页面（例如 `/login`）。
    
- **用途**：保护私有路由。这是最常用的功能，确保未登录用户无法看到 `/dashboard`。
    

 2. 返回 `true`（允许访问）

- **含义**：告诉 NextAuth：“没问题，让他过去。”
    
- **后果**：请求继续执行，用户成功看到他请求的页面。
    
- **用途**：
    
    - 用户已经登录，且正在访问受保护的页面。
        
    - 用户正在访问公开页面（如首页 `/` 或产品介绍页），不需要身份验证。
        
3. 返回 `Response` 对象（重定向）

- **含义**：告诉 NextAuth：“不要去他请求的地方，把他送到我指定的这个新地方。”
    
- **代码示例**：`return Response.redirect(new URL('/dashboard', nextUrl))`
    
- **用途**：**反向跳转**。
    
    - **场景**：如果用户**已经登录**了，但他又手欠去点 `/login` 页面，你可以通过返回一个 `Response.redirect` 把他弹回 `/dashboard`。这样可以避免用户重复登录，提升体验。
# 创建 auth.ts(核心配置文件 + 导出方法)

``` ts
// auth.ts   （放在根目录或 lib/ 下都行）
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
	    // credentials里是前端登录表单提交的数据。
      async authorize(credentials) {
        // 这里是你自己的登录逻辑
        // 通常去数据库查用户、比对密码
        // 返回用户对象 or null
        const user = await getUserFromDB(credentials.email, credentials.password);
        // 返回 null (登录失败)
        if (!user) return null;
        // 返回 user 对象 (登录成功)
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    // 你还可以加 Google、GitHub 等 provider
  ],
  // 可选：secret、session 策略（默认 jwt）、adapter 等
});
```

提供者：[Credentials](https://authjs.dev/getting-started/authentication/credentials#validating-credentials)

providers.Credentials：最灵活的“用户名/密码”方式

- authorize 函数决定“这个凭证能不能登录”

	- 当用户在登录页面点击“登录”按钮后，NextAuth 会把用户填写的账号密码交给这个函数

- 返回非 null → 登录成功，session 里就有 user 信息

## NextAuth

`NextAuth` 函数是整个身份验证系统的**大脑**。

它的核心作用是**生成一套工具集**。你把“配置说明书”（也就是 `authConfig`）喂给它，它就会根据你的配置，自动生成处理登录、登出、Session 校验的一系列“零件”。

### 参数

它接收一个**配置对象**作为参数（通常就是你在 `auth.config.ts` 里定义的那个对象，或者是扩展后的版本）。

主要参数包括：


- **`providers`**: 数组，定义你支持的登录方式（如 GitHub, Google 或 Credentials）。
    
- **`callbacks`**: 包含 `authorized`, `jwt`, `session` 等钩子函数。
    
- **`pages`**: 自定义登录、错误页面的路径。
    
- **`session`**: 设置如何存储 Session（默认是 JWT）。
    
- **`secret`**: 用于加密的随机字符串。

### 返回值

当你执行 `const { ... } = NextAuth(config)` 时，它会返回一个对象。在 Next.js 教程中，你会解构出以下几个最常用的“零件”：

`auth` (函数/对象)

- **用途**：在服务端获取当前的 Session。
    
- **场景**：在 **Server Components** 里调用 `const session = await auth()`，判断用户是否登录。
    
`signIn` (函数)

- **用途**：发起登录流程。
    
- **场景**：在 **Server Actions** 中调用，用户点击登录按钮后，触发认证逻辑。
    
`signOut` (函数)

- **用途**：注销登录。
    
- **场景**：点击“退出”按钮，清除用户的 Cookie 和 Session。
    
 `handlers` (对象)

- **用途**：包含 `GET` 和 `POST` 路由处理器。
    
- **场景**：在 App Router 的 API 路由中使用，负责处理来自 OAuth 提供商（如 Google）的回调请求。

## authorized













---
# 登录页面（/app/login/page.tsx）中使用 Server Action

