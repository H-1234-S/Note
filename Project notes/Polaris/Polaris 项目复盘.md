# 技术栈

Shadcn/ui、Tailwind css、React、Next.js、Convex、Inngest、AgentKit、Webcontainer、xterm.js、Sentry、CodeMirror、Firecrawl、Clerk、AI SDK、AI Element、Vercel

---
# 需求分析

## 需求一：登录注册功能

**登录注册功能**调用的是 `Clerk` 的 `SignInButton` 和 `SignUpButton` 组件，组件自动处理登录注册功能。

`Convex` 本身并没有身份验证功能，可以通过集成 `Clerk Auth` 服务进行身份验证


