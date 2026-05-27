# 技术栈

Shadcn/ui、Tailwind css、React、Next.js、Convex、Inngest、AgentKit、Webcontainer、xterm.js、Sentry、CodeMirror、Firecrawl、Clerk、AI SDK、AI Element、Vercel

---
# 需求分析

## 需求一：Login and registration Feature

**登录注册功能**调用的是 `Clerk` 的 `SignInButton` 和 `SignUpButton` 组件，组件自动处理登录注册功能。

`Convex` 本身并没有身份验证功能，可以通过集成 `Clerk Auth` 服务进行身份验证，这是[官方文档](https://docs.convex.dev/auth/clerk#nextjs)

**整个流程是：**
- 用户通过 `Clerk` 组件输入账号密码登录
- `Clerk` 在前端生成一个加密的 **JWT Token**
- Convex 客户端（`ConvexProviderWithClerk`）会自动把这个 Token 塞进每一次对 Convex 后端的请求里
- **Convex 后端**收到请求后，通过配置好的公钥自动验证 Token 是否合法
- 如果合法，在 Convex 写的数据库操作函数里就能直接读取到 `ctx.auth.currentIdentity()`

## 需求二：File Manager Feature

新建文件/文件夹、重命名文件/文件夹、删除文件/文件夹、一键合上所有文件夹

`index` 获取 `root` 文件，通过遍历渲染所有 `root` 文件，也就是 `tree` 组件

对于每一个 `tree` 组件，如果是**文件**则正常渲染，如果是**文件夹**则通过递归渲染文件夹

对于**右键触发**使用 `Shadcn/ui` 的 `Context Menu` 组件，该组件自动监控右键触发事件，展示弹窗

**注意：**

## 需求三：Code Editor Feature

## 需求四：Conversation Feature


