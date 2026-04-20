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
# 组件
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

## OrganizationSwitcher


## UserButton




--- 
# 包

``` bash
npm install @prisma/adapter—pg @prisma/client @t3-oss/env-nextjs pg
```

## 是什么？
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
    
## 如何协同工作？

当你执行一个查询时，链路如下：

1. **`@t3-oss/env-nextjs`**：确保你的数据库连接字符串（`DATABASE_URL`）是存在且格式正确的。
    
2. **`@prisma/client`**：提供代码提示，让你写出 `prisma.audio.create(...)`。
    
3. **`@prisma/adapter-pg`**：作为中转站，将 Prisma 的指令传给底层的 `pg` 驱动。
    
4. **`pg`**：通过网络把指令发给你的 **PostgreSQL** 数据库并取回数据。

---
# 开发环境

``` bash
npm install --save-dev prisma @types/pg dotenv tsx
```
## 是什么？

### **`prisma` (Prisma CLI)**

- **是什么**：Prisma 的命令行工具。
    
- **有什么用**：这是你与数据库交互的“控制台”。你不需要去数据库后台写 SQL，而是通过它来执行 `npx prisma db push`（同步模型到数据库）或 `npx prisma studio`（在浏览器里像看 Excel 一样查看和编辑数据）。
    
- **为什么是 `--save-dev`**：因为它主要在开发阶段用来管理表结构，项目部署后运行的是生成的 Client，不需要 CLI 核心包。
    
### **`@types/pg`**

- **是什么**：`pg` (PostgreSQL 驱动) 的 TypeScript 类型定义文件。
    
- **有什么用**：为你之前安装的 `pg` 包提供代码补全和类型检查。
    
- **结合你的情况**：你简历里写了“熟悉 TypeScript 语法”，安装这个包能确保你在操作数据库连接时，编辑器不会报红线，并且能自动提示连接参数（如 host, port 等）。
    
### **`dotenv`**

- **是什么**：环境变量加载器。
    
- **有什么用**：它能将 `.env` 文件中的配置加载到 Node.js 的 `process.env` 中。虽然 Next.js 自带环境变量支持，但在运行一些独立的脚本（比如数据库迁移脚本）时，仍然需要 `dotenv` 来确保程序能读到数据库地址。
    
### **`tsx`**

- **是什么**：**T**ype**S**cript **E**xecute，一个极速的 TS 运行运行时。
    
- **有什么用**：它让你能够像运行原生 JS 一样直接运行 `.ts` 文件（例如：`npx tsx ./scripts/seed.ts`）。
    
- **结合你的项目**：在 `resonance` 这类项目中，通常需要写一个“种子脚本”来初始化数据库数据，`tsx` 让你不需要先编译成 JS 就能直接跑脚本，开发体验极佳。

## 如何协同工作？

- **`dotenv`** 负责把你的数据库账号密码从 `.env` 读出来。
    
- **`prisma`** 拿到地址后，去数据库里建表。
    
- **`tsx`** 运行你写的初始化脚本，往建好的表里塞入一些测试数据。
    
- **`@types/pg`** 确保你在写这些脚本时，代码提示非常准确。

---

# schema.prisma

这一部分代码定义了 Resonance 项目的核心数据结构，即**声音（Voice）**和**生成的音频（Generation）**。

在 Prisma 中，这不仅仅是建表，它还定义了两者之间的**一对多（One-to-Many）关系**：一个声音可以被用来生成多次音频。

## Code

``` 
model Voice {
  id String @id @default(cuid())

  orgId String?

  name        String
  description String?
  category    VoiceCategory @default(GENERAL)
  language    String        @default("en-US")
  variant     VoiceVariant
  r2ObjectKey String?

  generations Generation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([variant])
  @@index([orgId])
}

model Generation {
  id String @id @default(cuid())

  orgId String

  voiceId String?
  voice   Voice?  @relation(fields: [voiceId], references: [id], onDelete: SetNull)

  text              String
  voiceName         String
  r2ObjectKey       String?
  temperature       Float
  topP              Float
  topK              Int
  repetitionPenalty Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orgId])
  @@index([voiceId])
}
```

--- 
## Voice

这个表存储的是可用的“声音”，包括系统内置的和用户自己上传克隆的。

- **`id`**: 主键。使用 `cuid()` 生成一个长字符串 ID（比自增数字 ID 更安全，适合分布式系统）。
    
- **`orgId`**: 组织 ID（可选）。如果为空，通常代表是系统全局声音；如果有值，代表是某个特定团队/组织专属的声音。
    
- **`name`**: 声音的名字（如 "Alice", "News Reader"）。
    
- **`description`**: 声音的详细描述（可选）。
    
- **`category`**: 声音所属的类别。使用了你之前定义的 `VoiceCategory` 枚举，默认值为 `GENERAL`。
    
- **`language`**: 声音支持的语言，默认是 `en-US`。
    
- **`variant`**: 声音的类型（系统或自定义）。使用了 `VoiceVariant` 枚举。
    
- **`r2ObjectKey`**: 存储在 Cloudflare R2（云存储）中的文件路径。对于自定义克隆的声音，需要这个 Key 来找到原始音频样本。
    
- **`generations`**: **关系字段**。它不在数据库里存实际数据，而是告诉 Prisma：一个 Voice 对应多个 Generation。
    
- **`createdAt` / `updatedAt`**: 记录创建时间和最后一次修改时间（自动更新）。
    
- **`@@index`**: 数据库索引。针对 `variant` 和 `orgId` 建立索引，能极大加快你按照“系统声音”或“某组织的声音”进行查询的速度。
    

---

## Generation

这个表记录了每一次“文本转语音”的具体操作。

- **`id`**: 每次生成的唯一任务 ID。
    
- **`orgId`**: 属于哪个组织的操作，用于权限隔离。
    
- **`voiceId`**: 关联的 Voice 表的 ID。
    
- **`voice`**: **关系映射**。
    
    - `fields: [voiceId]`: 本表的 `voiceId` 对应 `Voice` 表的 `id`。
        
    - `onDelete: SetNull`: 如果原始声音被删除了，这笔生成记录保留，但 `voiceId` 设为 Null（防止数据丢失）。
        
- **`text`**: 用户输入的原始文本（要转成语音的内容）。
    
- **`voiceName`**: 冗余字段。记录生成时的声音名字。即便 Voice 表被删了，这里也能看到当时用的是哪个名字。
    
- **`r2ObjectKey`**: 生成后的音频文件存放在 Cloudflare R2 的路径。前端通过这个 Key 找到音频并播放。
    
- **`temperature`, `topP`, `topK`, `repetitionPenalty`**: **AI 模型参数**。
    
    - 这些是控制声音生成特性的参数（如随机性、语调起伏）。把它们存下来是为了方便以后“复现”完全一样的声音效果。
        
- **`createdAt` / `updatedAt`**: 记录生成时间。



|**命令**|**针对的对象**|**作用**|
|---|---|---|
|**`npx prisma generate`**|**你的代码 (Code)**|更新代码提示，生成 Client。**不影响**数据库。|
|**`npx prisma migrate dev`**|**数据库 (Database)**|真正去修改数据库里的表结构。|

---
# db.ts

``` ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
```

## [驱动适配器](https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers#driver-adapters)

Prisma Client 可以通过 **驱动程序适配器** 使用 **JavaScript 数据库驱动程序**连接到数据库并执行查询。

适配器充当 Prisma Client 和 JavaScript 数据库驱动程序之间的 _翻译器_ 。
### [使用驱动适配器](https://www.prisma.io/docs/orm/core-concepts/supported-databases/postgresql#using-driver-adapters)

程序连接数据库：
``` ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

**`PrismaPg`**: 这是 Prisma 官方提供的 **PostgreSQL 适配器**。

#### 初始化适配器 

``` TypeScript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
```

这一步是在配置 **“连接方式”**。

- **接收的参数**：一个包含 `connectionString` 的对象。
    
    - **`connectionString`**: 数据库的“完整地址”。它通常长这样：`postgresql://用户名:密码@主机地址:端口号/数据库名`。
        
    - **`process.env.DATABASE_URL`**: 这是一个安全实践。我们不直接把密码写在代码里，而是从 `.env` 环境变量文件中读取。
        
- **作用**：创建了一个适配器实例。它负责处理底层的网络协议、连接池（Pooling）以及如何把数据发给 PostgreSQL。
    
#### 实例化客户端 

``` TypeScript
const prisma = new PrismaClient({ adapter });
```

这一步是真正创建 **“操作手”**。

- **接收的参数**：一个配置对象，其中最重要的属性就是 `adapter`。
    
    - **`adapter`**: 就是我们在上一行创建的那个适配器。
        
- **作用**：将“操作逻辑”（Prisma Client）与“物理连接”（Adapter）捆绑在一起。
    
    - **不传 adapter 会怎样？** Prisma 会尝试使用默认的内置驱动。
        
    - **为什么要传？** 在 Next.js 这种现代架构中，手动传入适配器可以让你更灵活地控制数据库连接，特别是在处理 Serverless 环境（如 Vercel）或边缘计算时，性能和稳定性更好。
        
#### 数据是如何流动的？

当你以后在代码里写 `prisma.user.findMany()` 时，内部发生了以下链式反应：

1. **`PrismaClient`**：收到指令，验证语法是否正确（是否有类型错误）。
    
2. **`adapter`**：接过指令，把 TypeScript 转换成 SQL 语句。
    
3. **`connectionString`**：适配器沿着这个地址，把 SQL 寄信给 PostgreSQL 数据库。
    
4. **数据库**：回信，数据顺着原路返回。

--- 
# [shadcn侧边栏](https://ui.shadcn.com/docs/components/radix/sidebar#structure)


``` ts
isActive={ item.url ? item.url === "/" ? pathname === "/" : pathname.startsWith(item.url): false }
```

首先判断这个菜单项是否有定义 `url`

如果存在链接，判断这个链接是不是根目录 `/`。
	
- 解决 **“首页永远高亮”** 的问题
	
`pathname === "/"` **精确匹配**。只有当当前页面刚好就是首页 `/` 时，首页按钮才激活。

`pathname.startsWith(item.url)` **前缀匹配**。只要当前的路径是以这个菜单项的链接开头的，就激活。
	
- 比如你的菜单项是 `/projects`，当你进入子页面 `/projects/123` 或 `/projects/settings` 时，父级菜单依然保持高亮，


--- 

# 语音识别

## encodeURIComponent()

将字符串中的**某些特殊字符**替换为十六进制的转义序列，以确保这些字符在 URL 中传输时不会被误解为控制符号。

转义除了如下所示外的所有字符：

``` ts
不转义的字符：
    A-Z a-z 0-9 - _ . ! ~ * ' ( )
```

用于编码参数：

``` ts
const baseUrl = "https://example.com/search";
const query = "前端开发 & React"; // 含有特殊字符 &

// 错误写法：直接拼接
const badUrl = baseUrl + "?q=" + query; 
// 结果: https://example.com/search?q=前端开发 & React (解析器会以为 & 后面是另一个参数)

// 正确写法：使用 encodeURIComponent
const goodUrl = baseUrl + "?q=" + encodeURIComponent(query);
// 结果: https://example.com/search?q=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%20%26%20React
```
## encodeURI()

用于对完整的 **URI进行编码。它会将某些字符替换为十六进制转义序列，但它**会跳过 **那些在 URL 中具有特定含义的保留字符**。

``` ts
const myUrl = "https://example.com/搜索?q=前端";
console.log(encodeURIComponent(myUrl)); 
// 输出: https%3A%2F%2Fexample.com%2F%E6%90%9C%E7%B4%A2%3Fq%3D%E5%89%8D%E7%AB%AF
// (由于 : / ? 全被转义了，浏览器无法识别这是一个网址)
```

使用 `encodeURI()` 处理整个网址：

``` ts
const myUrl = "https://example.com/搜索?q=前端 开发";
const safeUrl = encodeURI(myUrl);

console.log(safeUrl);
// 输出: https://example.com/%E6%90%9C%E7%B4%A2?q=%E5%89%8D%E7%AB%AF%20%E5%BC%80%E5%8F%91
// (中文和空格被编码了，但 : / ? & = 等结构字符完好无损)
```
# Git

``` bash
# 创建并切换到一个新分支
git checkout -b <分支名>

# 将所有修改过的文件添加到暂存区
git add .  

# 将暂存区的修改正式保存到本地仓库的历史记录中
git commit -m "提交信息"

# 将本地的分支推送到远程仓库
git push -u origin <分支名>

# 切换回main分支
git checkout main

# 同步main最新的变化
git pull origin main
```

---

# TanStack Form

**context**

use-app-form.tsx

``` ts
"use client";

import {
  createFormHookContexts,
  createFormHook,
} from "@tanstack/react-form";

// 创建 React Context 容器
export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} = createFormHookContexts();

export const {
  useAppForm,
  useTypedAppFormContext,
} = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});
```

让深层嵌套的子组件直接从context中拿值，不需要传prop
## 使用

**父组件初始化**：

``` ts
function ParentForm() {
  const form = useAppForm({
    defaultValues: { email: "" },
    onSubmit: (val) => console.log(val),
  });

  return (
    // form.AppForm 内部自动处理了 <formContext.Provider value={form}>
    <form.AppForm>
      <h1>注册表单</h1>
      {/* 这里的子组件可以是任意深度的，不需要传 form prop */}
      <DeepNestedInput /> 
    </form.AppForm>
  );
}
```

**子组件调用**：使用生成的 `useTypedAppFormContext`。

``` ts
function DeepNestedInput() {
  // 这里的 form 直接从 Context 拿，类型极其精准
  const form = useTypedAppFormContext();

  return (
    <form.Field
      name="email"
      children={(field) => (
        <input 
          value={field.state.value} 
          onChange={(e) => field.handleChange(e.target.value)} 
        />
      )}
    />
  );
}
```

## ?? 空值合并运算符
# sliders.ts配置文件

 [chatterbox](https://github.com/resemble-ai/chatterbox)

# Tabs

``` ts
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppWindowIcon, CodeIcon } from "lucide-react";

export default function Tabspage() {
    const tabTriggerClassName =
        "flex-1 h-full gap-2 bg-transparent rounded-none border-x-0 border-t-0 border-b-px border-b-transparent shadow-none data-[state=active]:border-b-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none";

    return (
        <div className="hidden w-105 min-h-0 flex-col border-l lg:flex">
            <Tabs defaultValue="setting" className="flex h-full min-h-0 flex-col gap-y-0">
                <TabsList className="w-full bg-transparent rounded-none border-b h-12 group-data-[orientation=horizontal]/tabs:h-12 p-0">
                    <TabsTrigger value="setting" className={tabTriggerClassName}><AppWindowIcon />预览</TabsTrigger>
                    <TabsTrigger value="code" className={tabTriggerClassName}><CodeIcon />代码</TabsTrigger>
                </TabsList>
                <TabsContent value="setting" className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"><h1>appWindow page</h1></TabsContent>
            </Tabs>

        </div>
    )
}
```

