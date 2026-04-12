# 前端面试 - Next.js篇

## 📌 目录
<details>
<summary>点击展开目录</summary>

- [1. Next.js基础概念](#1-nextjs基础概念)
- [2. 渲染模式与策略](#2-渲染模式与策略)
- [3. App Router核心概念](#3-app-router核心概念)
- [4. Pages Router](#4-pages-router)
- [5. 数据获取与缓存](#5-数据获取与缓存)
- [6. 路由系统](#6-路由系统)
- [7. Server Actions](#7-server-actions)
- [8. Middleware与proxy](#8-middleware与proxy)
- [9. API Routes](#9-api-routes)
- [10. 性能优化](#10-性能优化)
- [11. Next.js 14/15/16新特性](#11-nextjs-141516新特性)
- [12. 常见面试题](#12-常见面试题)

</details>

---

## 1. Next.js基础概念

### 1.1 Next.js是什么？有什么特点？
**考点**：Next.js基础认知

**Next.js定义**：
- Vercel开发的React全栈框架
- 支持服务端渲染（SSR）、静态生成（SSG）、增量静态再生成（ISR）
- 内置文件系统路由、API Routes、图像优化等功能

**核心特点**：

1. **多种渲染模式**
   - SSR（服务端渲染）
   - SSG（静态站点生成）
   - ISR（增量静态再生成）
   - CSR（客户端渲染）

2. **文件系统路由**
   - 基于文件结构的路由系统
   - 动态路由参数支持
   - 路由分组和嵌套

3. **API Routes**
   - 可创建API端点
   - 支持RESTful风格
   - 可作为BFF层

4. **开箱即用的优化**
   - 图片优化（next/image）
   - 字体优化（next/font）
   - 脚本加载优化（next/script）

**代码示例**：
```jsx
// pages/index.js (Pages Router)
export default function Home() {
  return <h1>Hello Next.js</h1>;
}

// app/page.tsx (App Router)
export default function Page() {
  return <h1>Hello Next.js 13+</h1>;
}
```

---

### 1.2 Next.js和React的区别？
**考点**：框架对比理解

| 特性 | React | Next.js |
|-----|-------|---------|
| **核心定位** | UI库，专注视图层 | React全栈框架 |
| **渲染方式** | 纯客户端渲染（CSR） | SSR/SSG/ISR/CSR皆可 |
| **路由系统** | 需搭配react-router | 内置文件系统路由 |
| **SEO支持** | 需要额外配置 | 天生SEO友好 |
| **API支持** | 无内置API | 内置API Routes |
| **首屏性能** | 需要水合（hydrate） | 可预渲染 |
| **配置复杂度** | 更灵活但需自行配置 | 约定大于配置 |

**核心思想差异**：
- React：客户端UI库，专注于构建 SPA
- Next.js：基于React的全栈方案，提供服务端渲染能力和API层

---

### 1.3 App Router vs Pages Router 区别？
**考点**：Next.js路由架构

| 特性 | App Router | Pages Router |
|-----|------------|--------------|
| **推出版本** | Next.js 13+ | Next.js 最初引入 |
| **目录结构** | `app/` 目录 | `pages/` 目录 |
| **组件模型** | React Server Components | 客户端组件为主 |
| **布局系统** | 嵌套布局（layout.tsx） | 自定义\_app.js |
| **数据获取** | async组件 + fetch | getServerSideProps等 |
| **路由分组** | 通过文件夹（） | 通过\_前缀 |
| **默认状态** | 服务端组件 | 客户端渲染 |
| **缓存策略** | 基于fetch的缓存 | 基于getStaticProps等 |

**选择建议**：
- 新项目：推荐使用 App Router（React Server Components）
- 迁移项目：可逐步从 Pages Router 迁移到 App Router

---

## 2. 渲染模式与策略

### 2.1 什么是SSR（服务端渲染）？
**考点**：SSR核心概念

**SSR定义**：
- 在服务器端生成完整的HTML页面
- 服务器返回已渲染的HTML，浏览器直接展示

**工作流程**：
```
1. 用户请求页面
2. 服务器执行React组件，生成HTML
3. 返回完整HTML给浏览器
4. 浏览器展示内容（无需等待JS下载）
5. JS下载完成后进行"水合"（hydrate）
```

**实现方式（App Router）**：
```tsx
// app/page.tsx - 默认就是SSR（服务端组件）
export default async function Page() {
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  return <div>{data.name}</div>;
}
```

**实现方式（Pages Router）**：
```jsx
// pages/index.js
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data }, // 将数据传递给组件
  };
}

export default function Home({ data }) {
  return <div>{data.name}</div>;
}
```

**适用场景**：
- 需要SEO的页面（商品详情、博客文章）
- 实时性要求高的页面（股票行情、新闻）
- 个性化内容展示

---

### 2.2 什么是SSG（静态站点生成）？
**考点**：SSG核心概念

**SSG定义**：
- 在构建时（build time）生成静态HTML文件
- 构建完成后，页面是预渲染的静态文件

**工作流程**：
```
1. 运行 npm run build
2. Next.js 预渲染所有页面为静态HTML
3. 生成的HTML保存在 .next/ 目录
4. 用户请求时直接返回静态文件（CDN友好）
```

**实现方式（App Router）**：
```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }) {
  // params.slug 可用于数据获取
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}

// 标记为静态生成（默认行为，除非使用动态路由）
export const dynamic = 'force-static';
```

**实现方式（Pages Router）**：
```jsx
// pages/blog/[id].js
export async function getStaticProps({ params }) {
  const post = await getPost(params.id);

  return {
    props: { post },
    revalidate: 60, // ISR：60秒后重新生成
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => ({
      params: { id: post.id },
    })),
    fallback: 'blocking', // 或 true / false
  };
}
```

**适用场景**：
- 内容不频繁变化的页面（文档、博客）
- 营销页面、落地页
- 需要CDN加速的全球化应用

---

### 2.3 什么是ISR（增量静态再生成）？
**考点**：ISR核心概念

**ISR定义**：
- 结合SSG和SSR的优点
- 页面静态生成，但可以在运行时重新验证更新

**工作流程**：
```
1. 首次访问：SSG生成静态页面
2. 后续请求：返回缓存的静态页面
3. 过期后：触发后台重新生成
4. 生成完成：更新缓存
```

**实现方式（App Router）**：
```tsx
// app/blog/[slug]/page.tsx
export default async function Page({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, {
    next: { revalidate: 60 }, // 60秒后重新验证
  }).then(r => r.json());

  return <article>{post.content}</article>;
}
```

**实现方式（Pages Router）**：
```jsx
export async function getStaticProps() {
  const data = await fetchData();

  return {
    props: { data },
    revalidate: 60, // ISR：60秒重新生成
  };
}
```

**revalidate 选项**：
- `0`：不重新验证（永不过期，需要触发）
- `60`：60秒后重新验证
- `false`：禁用ISR（等效于0）

**适用场景**：
- 内容频繁变化但不需要实时的页面（电商商品页）
- 博客、新闻类网站
- 需要保持高性能同时兼顾内容更新的场景

---

### 2.4 什么是CSR（客户端渲染）？
**考点**：CSR核心概念

**CSR定义**：
- 服务器只返回空HTML shell
- 实际的DOM渲染完全在浏览器端通过JavaScript完成

**实现方式（App Router）**：
```tsx
'use client'; // 标记为客户端组件

import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data ? data.name : 'Loading...'}</div>;
}
```

**实现方式（Pages Router）**：
```jsx
import { useState, useEffect } from 'react';

export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data ? data.name : 'Loading...'}</div>;
}
```

**适用场景**：
- 需要实时更新的数据（聊天、监控）
- 用户特定内容的页面（个人仪表盘）
- SEO要求不高的后台系统

---

### 2.5 什么是 PPR（Partial Prerendering）？
**考点**：PPR核心概念

**定义**：
- Next.js 14 引入的渲染策略
- 静态外壳 + 动态内容的混合渲染模式
- 结合 SSG 的速度和 SSR 的灵活性

**工作原理**：
```
请求 → 静态HTML外壳（快速）→ 流式发送动态内容
```

**实现方式**：
```tsx
import { Suspense } from 'react';

// 静态外壳（build时预渲染）
export default function Page() {
  return (
    <div>
      <header>静态头部</header>
      {/* 动态内容 - Suspense包裹 */}
      <Suspense fallback={<Skeleton />}>
        <UserComments />
      </Suspense>
      <footer>静态底部</footer>
    </div>
  );
}

// 动态组件（运行时渲染）
async function UserComments() {
  const comments = await fetchComments(); // 耗时操作
  return comments.map(c => <Comment key={c.id} {...c} />);
}
```

---

## 3. App Router核心概念

### 3.1 服务端组件 vs 客户端组件
**考点**：RSC核心原理
**考点**：RSC核心原理

**RSC定义**：
- React 18引入的新特性
- 组件默认在服务器端渲染
- 可以直接访问服务器资源（数据库、文件系统）

**服务端组件 vs 客户端组件**：

| 特性 | 服务端组件 | 客户端组件 |
|-----|-----------|-----------|
| **执行环境** | 服务器 | 浏览器 |
| **访问资源** | 数据库、文件系统 | 浏览器API |
| **交互能力** | 无（无事件监听） | 有（useState等） |
| **产物** | 仅JSX（不打包到bundle） | JS bundle |
| **水合** | 不需要 | 需要 |

**使用示例**：
```tsx
// app/page.tsx - 服务端组件（默认）
// 可以直接访问数据库，无需API
import { db } from './lib/db';

export default async function Page() {
  const users = await db.query('SELECT * FROM users');

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// app/dashboard/page.tsx
'use client'; // 客户端组件

import { useState } from 'react';

export default function Dashboard() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

---

### 3.2 layout.tsx 和 page.tsx 的关系？
**考点**：App Router布局系统

**layout.tsx**：
- 定义共享布局
- 包裹子路由
- 保持状态不重新渲染

**page.tsx**：
- 对应具体路由的页面
- 是layout的子组件

**嵌套示例**：
```
app/
├── layout.tsx          // 根布局（全局布局）
├── page.tsx            // 首页 (/)
├── about/
│   ├── page.tsx        // 关于页 (/about)
│   └── layout.tsx      // 关于页专属布局
└── blog/
    ├── layout.tsx       // 博客布局
    ├── page.tsx        // 博客列表 (/blog)
    └── [slug]/
        └── page.tsx    // 博客详情 (/blog/:slug)
```

**代码示例**：
```tsx
// app/layout.tsx - 根布局
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>全局导航</header>
        <main>{children}</main>
        <footer>全局页脚</footer>
      </body>
    </html>
  );
}

// app/blog/layout.tsx - 博客布局
export default function BlogLayout({ children }) {
  return (
    <aside>
      <nav>博客导航</nav>
      <article>{children}</article>
    </aside>
  );
}
```

---

### 3.3 metadata 如何配置？
**考点**：SEO优化

**配置方式**：
```tsx
// app/page.tsx - 静态metadata
export const metadata = {
  title: '首页标题',
  description: '首页描述',
  keywords: ['关键词1', '关键词2'],
};

export default function Page() {
  return <h1>Hello</h1>;
}

// app/[slug]/page.tsx - 动态metadata
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.thumbnail],
    },
  };
}

export default function Page({ params }) {
  return <article>{/* ... */}</article>;
}
```

**常见配置项**：
- `title`：页面标题
- `description`：页面描述
- `keywords`：关键词（部分搜索引擎支持）
- `openGraph`：社交分享配置
- `twitter`：Twitter分享配置
- `robots`：搜索引擎爬虫配置

---

### 2.6 Next.js 16 的 "use cache" 指令？
**考点**：Cache Components核心概念

**定义**：
- Next.js 16 引入的 `"use cache"` 指令
- 显式缓存函数/组件的返回结果
- 编译器自动生成缓存键

**基本用法**：
```tsx
// 启用 Cache Components
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

```tsx
// app/components/ProductList.tsx
// 使用 "use cache" 缓存产品列表
'use cache';

export async function getCachedProducts() {
  const products = await fetchProductsFromDB();
  return products;
}

// 缓存带参数
'use cache';
export async function getProductById(id: string) {
  const product = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return product;
}
```

**与 revalidate 配合**：
```tsx
'use cache';
// 设置缓存时间
export const revalidate = 3600; // 1小时

export async function getCachedProducts() {
  const products = await fetchProductsFromDB();
  return products;
}
```

**优势**：
- 显式缓存，代码可读性更好
- 默认动态行为，避免隐式缓存陷阱
- 编译器优化，生成最优缓存键

---

## 4. Pages Router

### 4.1 getServerSideProps 如何使用？
**考点**：SSR数据获取

**基本用法**：
```jsx
export async function getServerSideProps(context) {
  const { params, req, res, query } = context;

  // req: 请求对象
  // res: 响应对象
  // params: 路由参数
  // query: 查询参数

  const response = await fetch(`https://api.example.com/data`);
  const data = await response.json();

  if (!data) {
    return {
      notFound: true, // 返回404页面
    };
  }

  return {
    props: { data }, // 传递给组件
  };
}

export default function Page({ data }) {
  return <div>{data.name}</div>;
}
```

**重定向**：
```jsx
export async function getServerSideProps(context) {
  const user = await getUser(context.params.id);

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false, // 临时重定向
      },
    };
  }

  return {
    props: { user },
  };
}
```

---

### 4.2 getStaticProps 和 getStaticPaths 如何配合？
**考点**：SSG数据获取

**getStaticProps** - 获取页面数据：
```jsx
export async function getStaticProps(context) {
  const { params } = context;

  const post = await getPost(params.slug);

  return {
    props: { post },
    revalidate: 60, // ISR：60秒后重新生成
  };
}
```

**getStaticPaths** - 定义静态路径：
```jsx
export async function getStaticPaths() {
  const posts = await getAllPosts();

  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: 'blocking', // 或 true / false
  };
}
```

**fallback 选项**：
| 值 | 说明 |
|----|------|
| `false` | 未匹配的路径返回404 |
| `true` | 未匹配的路径先生成页面（不阻塞），后续请求返回缓存 |
| `'blocking'` | 未匹配的路径在服务器端生成页面（阻塞），完成后缓存 |

---

## 5. 数据获取与缓存

### 5.1 App Router 数据获取方式？
**考点**：App Router数据获取模式

**服务端组件直接获取**：
```tsx
// 方式1：直接使用async/await
export default async function Page() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return <div>{data.name}</div>;
}

// 方式2：使用数据库SDK（直接访问数据库）
import { db } from '@/lib/db';

export default async function Page() {
  const users = await db.select().from(usersTable);
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**指定缓存策略**：
```tsx
export default async function Page() {
  // 默认：force-cache（缓存优先）
  const cachedData = await fetch('https://api.example.com/data');

  // 每次都重新获取
  const freshData = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  });

  // 10秒后过期
  const timedData = await fetch('https://api.example.com/data', {
    next: { revalidate: 10 },
  });

  return <div>{/* ... */}</div>;
}
```

**缓存标签（Cache Tags）**：
```tsx
// 设置缓存标签
export default async function Page() {
  await fetch('https://api.example.com/data', {
    next: { tags: ['products'] },
  });
}

// 基于标签重新验证
import { revalidateTag } from 'next/cache';

revalidateTag('products');
```

**Next.js 16 的缓存策略**：
```tsx
// Next.js 16 推荐使用 cacheComponents 模式
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};
```

---

### 5.2 Next.js 的缓存机制是怎样的？
**考点**：缓存机制

**缓存层级**：
| 缓存类型 | 说明 |
|---------|------|
| **fetch缓存** | 通过 fetch 的 cache 选项控制 |
| **Data Cache** | 服务端数据缓存，按 fetch 请求键值存储 |
| **Full Route Cache** | 预渲染的完整页面（静态页面） |
| **Router Cache** | 客户端路由缓存，存储预取链接 |
| **Asset Cache** | 静态文件（JS、CSS、图片） |

**缓存失效方式**：
| 方式 | 说明 |
|-----|------|
| `revalidatePath()` | 按路径失效缓存 |
| `revalidateTag()` | 按标签失效缓存（需指定 cacheLife） |
| `updateTag()` | Server Actions专用，立即失效并读取新数据 |
| `refresh()` | Server Actions专用，刷新未缓存数据 |

**示例**：
```tsx
import { revalidatePath, revalidateTag } from 'next/cache';

// 失效整个路径下的缓存
revalidatePath('/blog');
revalidatePath('/blog/[slug]', 'page');

// 按标签失效
revalidateTag('posts', 'max');

// 在 Server Action 中使用 updateTag
import { updateTag } from 'next/cache';
updateTag(`user-${userId}`);
```

---

### 5.3 如何处理数据请求错误？

**App Router 错误处理**：
```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // 触发not-found.tsx
  }

  return <article>{post.content}</article>;
}

// error.tsx - 错误边界
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// not-found.tsx - 404页面
export default function NotFound() {
  return <h1>Page not found</h1>;
}
```

**Pages Router 错误处理**：
```jsx
// pages/404.js
export default function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

// _error.js - 错误页面
function Error({ statusCode }) {
  return (
    <div>
      <h1>Error {statusCode}</h1>
      {statusCode === 404 && <p>Page not found</p>}
      {statusCode === 500 && <p>Server error</p>}
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
```

---

### 5.4 Streaming 和 Suspense 是什么？
**考点**：Streaming核心概念

**定义**：
- Streaming 允许将页面内容分块传输给浏览器
- 首屏内容先展示，耗时内容（如数据库查询）后加载
- 通过 React Suspense 实现

**实现方式（App Router）**：
```tsx
import { Suspense } from 'react';

// 加载组件
function LoadingComponent() {
  return <div>Loading...</div>;
}

// 耗时操作的数据获取
async function ExpensiveComponent() {
  const data = await fetchExpensiveData(); // 耗时操作
  return <div>{data}</div>;
}

// 页面中使用
export default function Page() {
  return (
    <div>
      <h1>立即显示的内容</h1>
      <Suspense fallback={<LoadingComponent />}>
        <ExpensiveComponent />
      </Suspense>
    </div>
  );
}
```

**loading.tsx 特殊文件**：
```tsx
// app/blog/loading.tsx
// 整个路由段加载时的加载状态
export default function Loading() {
  return <div>Loading blog posts...</div>;
}

// app/blog/[slug]/loading.tsx
// 动态路由的加载状态
export default function Loading() {
  return <div>Loading post...</div>;
}
```

**优势**：
- 提升首屏加载速度（FCP）
- 减少 TTFB (Time To First Byte)
- 用户体验更好，不需要等待所有数据加载完成

---

## 6. 路由系统

### 6.1 如何定义动态路由？
**考点**：动态路由

**App Router 动态路由**：
```tsx
// app/blog/[slug]/page.tsx
// 访问 /blog/nextjs-guide

export default async function Page({ params }) {
  // params = { slug: 'nextjs-guide' }
  return <div>Post: {params.slug}</div>;
}
```

**App Router 多层动态路由**：
```tsx
// app/blog/[category]/[slug]/page.tsx
// 访问 /blog/react/nextjs-guide

export default async function Page({ params }) {
  // params = { category: 'react', slug: 'nextjs-guide' }
  return <div>{params.category} - {params.slug}</div>;
}
```

**Pages Router 动态路由**：
```jsx
// pages/blog/[slug].js
// 访问 /blog/nextjs-guide

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'nextjs-guide' } }],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}

export default function BlogPost({ post }) {
  return <div>{post.title}</div>;
}
```

---

### 6.2 路由分组有什么用？
**考点**：App Router高级路由

**路由分组**（用括号包裹的文件夹）：
```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx    // /about
│   ├── contact/
│   │   └── page.tsx    // /contact
│   └── layout.tsx      // 营销布局
└── (shop)/
    ├── products/
    │   └── page.tsx    // /products
    └── cart/
        └── page.tsx    // /cart
```

**特点**：
- URL 不包含分组文件夹名
- 可以为不同组设置不同布局
- 用于组织代码结构，不影响URL

---

### 6.3 parallel routes 和 intercepting routes 是什么？
**考点**：高级路由模式

**Parallel Routes（并行路由）**：
- 同一布局中同时渲染多个页面
- 使用 `@folder` 语法

```tsx
// app/@feed/page.tsx   - Feed内容
// app/@sidebar/page.tsx - 侧边栏
// app/layout.tsx

export default function Layout({ feed, sidebar }) {
  return (
    <div>
      <nav>{sidebar}</nav>
      <main>{feed}</main>
    </div>
  );
}

// 使用插槽
export default function Layout({
  children,
  feed,
  sidebar,
}: {
  children: React.ReactNode;
  feed: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      <nav>{sidebar}</nav>
      <main>{feed}</main>
      {children}
    </div>
  );
}
```

**Intercepting Routes（拦截路由）**：
- 从另一个路由"拦截"导航
- 用于Modal等场景

```tsx
// app/@modal/(.)photo/[id]/page.tsx
// 拦截 /photo/[id] 导航，显示为Modal

// 访问 /photo/1 时：
// - 如果是直接访问 → 显示完整页面
// - 如果是弹窗打开 → 显示Modal内容
```

**适用场景**：
- Photo Gallery（点击图片打开Modal）
- 通知面板
- 购物车侧边栏

---

## 7. Server Actions

### 7.1 什么是 Server Actions？
**考点**：Server Actions核心概念

**定义**：
- 在服务端执行的异步函数
- 可以从客户端组件调用（像调用普通函数一样）
- 自动处理CSRF保护
- 支持乐观更新（optimistic updates）

**工作原理**：
```
1. 客户端调用 Server Action
2. 通过 POST 请求发送到服务器
3. 服务器执行操作（数据库访问等）
4. 返回结果给客户端
5. 可选：调用 revalidatePath 或 revalidateTag 重新验证缓存
```

**基本用法**：
```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  // 直接操作数据库
  const post = await db.insert(postsTable).values({
    title,
    content,
    createdAt: new Date(),
  }).returning();

  // 重新验证缓存
  revalidatePath('/blog');
  revalidateTag('posts');

  return post;
}
```

**客户端调用**：
```tsx
// app/blog/new/page.tsx
'use client';

import { createPost } from '@/app/actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" type="text" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

---

### 7.2 Server Actions 的进阶用法？
**考点**：Server Actions高级特性

**乐观更新**：
```tsx
'use client';

import { updateItem } from '@/app/actions';
import { useOptimistic } from 'react';

export function TodoList({ items }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem) => [...state, { ...newItem, pending: true }]
  );

  async function handleSubmit(formData: FormData) {
    const item = { id: Date.now(), text: formData.get('text') };
    addOptimisticItem(item);
    await updateItem(item);
  }

  return (
    <form action={handleSubmit}>
      <input name="text" />
      <button type="submit">Add</button>
      {optimisticItems.map(item => (
        <div key={item.id} style={{ opacity: item.pending ? 0.5 : 1 }}>
          {item.text}
        </div>
      ))}
    </form>
  );
}
```

**错误处理与重置**：
```tsx
'use server';
import { redirect } from 'next/navigation';

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title');

  if (!title) {
    return { error: 'Title is required' };
  }

  await db.insert(postsTable).values({ title });
  redirect('/blog'); // 重定向
}
```

**useActionState Hook**：
```tsx
'use client';

import { useActionState } from 'react';
import { createPost } from '@/app/actions';

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## 8. Middleware与proxy

### 8.1 Middleware 是什么？如何使用？
**考点**：Middleware核心概念

**定义**：
- 在请求到达服务器后、渲染页面之前执行的代码
- 可以修改请求和响应
- 用于认证、日志、重定向等

**工作流程**：
```
请求 → Middleware → 路由匹配 → 页面渲染 → 响应
```

**基本用法**：
```tsx
// middleware.ts (Next.js 15)
/ import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取请求路径
  const path = request.nextUrl.pathname;

  // 检查认证
  const isAuthenticated = request.cookies.has('auth-token');

  // 保护路由
  if (path.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 添加响应头
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');

  return response;
}

// 配置匹配的路径
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

**重定向**：
```tsx
export function middleware(request: NextRequest) {
  // HTTP 跳转
  if (request.nextUrl.pathname === '/old-page') {
    return NextResponse.redirect(new URL('/new-page', request.url));
  }

  // 永久重定向 (301)
  return NextResponse.redirect(
    new URL('/new-page', request.url),
    301
  );
}
```

**改写（Rewrite）**：
```tsx
export function middleware(request: NextRequest) {
  // 改写路径，内部跳转到另一个API
  if (request.nextUrl.pathname.startsWith('/api-docs')) {
    return NextResponse.rewrite(
      new URL('https://docs.example.com/nextjs', request.url)
    );
  }
}
```

---

### 8.2 Next.js 16 的 proxy.ts 是什么？
**考点**：proxy.ts核心概念

**定义**：
- 取代 middleware.ts，明确应用网络边界
- 运行在 Node.js 运行时（不再是 Edge）
- 更清晰的命名和职责划分

**迁移方式**：
| middleware.ts | proxy.ts |
|--------------|----------|
| 文件名 | `middleware.ts` → `proxy.ts` |
| 导出函数 | `middleware` → `proxy` |
| 运行时 | Edge Runtime | Node.js Runtime |

**基本用法**：
```tsx
// proxy.ts (Next.js 16)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // 认证检查
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
```

**注意**：middleware.ts 仍可用于 Edge runtime 场景，但已弃用，将在未来版本移除。

---

## 9. API Routes

### 9.1 如何创建API Routes？
**考点**：API Routes基础

**App Router API Routes**：
```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.select().from(usersTable);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newUser = await db.insert(usersTable).values(body).returning();

  return NextResponse.json(newUser, { status: 201 });
}
```

**Pages Router API Routes**：
```jsx
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ name: 'John' });
  } else if (req.method === 'POST') {
    const body = req.body;
    res.status(201).json({ id: 1, ...body });
  }
}
```

---

### 9.2 如何处理动态API路由？
**考点**：动态API路由

**App Router**：
```tsx
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser(params.id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const updated = await updateUser(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await deleteUser(params.id);
  return NextResponse.json({ success: true }, { status: 204 });
}
```

---

## 10. 性能优化

### 10.1 next/image 相比普通 img 有什么优势？
**考点**：图像优化

**优势**：
1. **自动优化格式** - WebP/AVIF
2. **响应式图片** - 自动生成多尺寸
3. **懒加载** - 默认懒加载
4. **防止布局偏移** - 自动设置宽高
5. **模糊占位符** - 支持blurDataURL

**使用示例**：
```tsx
import Image from 'next/image';

export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={800}
      height={600}
      priority // 优先加载
      placeholder="blur" // 模糊占位
      blurDataURL="data:image/jpeg;base64,..." // base64模糊图
    />
  );
}
```

**sizes 属性**：
```tsx
<Image
  src="/image.jpg"
  alt="Responsive"
  fill // 填充父容器
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

### 10.2 next/script 如何优化脚本加载？
**考点**：脚本优化

**加载策略**：
| 策略 | 说明 | 使用场景 |
|-----|------|---------|
| `afterInteractive` | 页面加载后执行（默认） | 分析工具、聊天Widget |
| `beforeInteractive` | 页面交互前加载 | 关键脚本 |
| `lazyOnload` | 所有加载完成后 | 非关键脚本 |
| `worker` | Web Worker中运行 | 第三方脚本 |

**使用示例**：
```tsx
import Script from 'next/script';

export default function Page() {
  return (
    <>
      <h1>My Page</h1>

      {/* Google Analytics - 页面加载后执行 */}
      <Script
        src="https://googletagmanager.com/gtag/js?id=GA_ID"
        strategy="afterInteractive"
        onLoad={() => {
          // 加载完成后的回调
        }}
      />

      {/* 关键脚本 - 优先加载 */}
      <Script
        src="/critical.js"
        strategy="beforeInteractive"
      />

      {/* 第三方Widget - 懒加载 */}
      <Script
        src="/chat-widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
```

---

### 10.3 next/font 如何优化字体？
**考点**：字体优化

**使用示例**：
```tsx
import { Inter } from 'next/font/google';

// 加载Google字体
const inter = Inter({ subsets: ['latin'] });

// 或使用本地字体
// import localFont from 'next/font/local';

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**优势**：
- 自动下载字体文件到本地
- 无需额外网络请求到Google
- 自动设置 `font-display: swap`
- 预加载关键字体文件

---

### 10.4 如何进行代码分割和懒加载？
**考点**：性能优化

**React 懒加载**：
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: true, // 是否在服务端渲染
});

export default function Page() {
  return (
    <div>
      <h1>Main Content</h1>
      <HeavyComponent />
    </div>
  );
}
```

**禁用SSR的懒加载**：
```tsx
const NoSSRComponent = dynamic(() => import('./NoSSRComponent'), {
  ssr: false,
});
```

**自定义加载时机**：
```tsx
const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

---

## 11. Next.js 14/15/16新特性

### 11.1 Next.js 16 有哪些新特性？
**考点**：Next.js 16 (2025年10月发布)

**主要新特性**：

1. **Cache Components**
   - 新的缓存模型，基于 Partial Prerendering (PPR)
   - 使用 `"use cache"` 指令缓存页面、组件和函数
   - 缓存完全可选，默认所有动态代码在请求时执行
   - 完成 PPR 故事，静态页面可以局部动态渲染

```tsx
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

2. **Next.js Devtools MCP**
   - Model Context Protocol 集成
   - AI辅助调试，提供应用上下文洞察
   - 统一日志：浏览器和服务器日志无需切换上下文
   - 自动错误访问：详细堆栈跟踪无需手动复制

3. **proxy.ts（formerly middleware.ts）**
   - 替换 middleware.ts，明确应用网络边界
   - 运行在 Node.js 运行时
   - 迁移方式：将 `middleware.ts` 重命名为 `proxy.ts`，导出函数改为 `proxy`

```tsx
// proxy.ts
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}
```

4. **Logging Improvements**
   - 开发请求日志扩展，显示时间花费
   - Compile：路由和编译
   - Render：运行代码和React渲染
   - 构建步骤显示每个步骤的耗时

5. **Turbopack（稳定版）**
   - 开发环境默认 bundler
   - 2-5x 更快的产品构建
   - 最高 10x 更快的 Fast Refresh
   - 超过 50% 的开发会话和 20% 的生产构建已在使用

```tsx
// next.config.ts
const nextConfig = {
  turbopack: {}, // 默认启用
};
```

6. **Turbopack File System Caching（Beta）**
   - 开发环境文件系统缓存
   - 编译产物存储在磁盘，显著加快大型项目启动和编译时间

```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};
```

7. **React Compiler Support（稳定版）**
   - 内置 React Compiler 1.0 支持
   - 自动 memoization，减少不必要的重渲染
   - 配置从 experimental 升级到稳定

```tsx
// next.config.ts
const nextConfig = {
  reactCompiler: true,
};

// npm install babel-plugin-react-compiler@latest
```

8. **Build Adapters API（Alpha）**
   - 创建自定义适配器，钩入构建过程
   - 部署平台和自定义构建集成可修改 Next.js 配置或处理构建输出

9. **Enhanced Routing（增强路由）**
   - **Layout deduplication**：共享布局只下载一次，50个产品链接场景从50次下载变为1次
   - **Incremental prefetching**：只预取缓存中不存在的部分
   - 链接离开视口时取消请求
   - 悬停或重新进入视口时优先预取
   - 数据失效时重新预取

10. **Improved Caching APIs**
    - **revalidateTag()**（更新）：现在需要第二个参数 `cacheLife` profile

```tsx
import { revalidateTag } from 'next/cache';

// ✅ 使用内置 cacheLife profile
revalidateTag('blog-posts', 'max');
revalidateTag('news-feed', 'hours');
revalidateTag('products', { expire: 3600 });
```

    - **updateTag()**（新）：Server Actions 专用，提供 read-your-writes 语义

```tsx
'use server';
import { updateTag } from 'next/cache';

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);
  // 失效并立即读取新数据
  updateTag(`user-${userId}`);
}
```

    - **refresh()**（新）：Server Actions 专用，仅刷新未缓存的数据

```tsx
'use server';
import { refresh } from 'next/cache';

export async function markNotificationAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId);
  // 刷新未缓存的动态数据（如通知计数）
  refresh();
}
```

11. **React 19.2 支持**
    - View Transitions：动画化 Transition 或导航中的元素更新
    - useEffectEvent：从 Effects 提取非响应式逻辑
    - `<Activity/>`：渲染"后台活动"，用 display:none 隐藏 UI 同时保持状态和清理 Effects

---

### 11.2 Next.js 14 有哪些新特性？
**考点**：Next.js 14

**主要新特性**：

1. **Server Actions（稳定版）**
   - 在服务端直接执行数据库操作
   - 简化表单处理和mutation

```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');

  await db.insert(postsTable).values({ title });

  revalidatePath('/blog');
}

// app/blog/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" type="text" />
      <button type="submit">Create</button>
    </form>
  );
}
```

2. **Turbopack（Beta）**
   - 新的打包工具
   - 比Webpack快10倍

3. **Partial Prerendering（预览版）**
   - 静态外壳 + 动态内容
   - 保持静态性能的同时支持动态内容

---

### 11.3 Next.js 15 有哪些新特性？
**考点**：Next.js 15

**主要新特性**：

1. **Turbopack 稳定版**
   - 生产环境支持
   - 显著的构建速度提升

2. **React 19 支持**
   - 完整支持 React 19 新特性
   - 改进的 `use()` hook

3. **缓存策略调整**
   - `fetch` 请求默认不缓存（`cache: no-store`）
   - 更加可预测的数据获取行为

4. **改进的错误处理**
   - 更好的错误消息
   - 更清晰的调试信息

5. **自托管改进**
   - 更好的容器化支持
   - 改进的构建输出

---

### 11.4 Next.js 16 Breaking Changes（破坏性更新）
**考点**：Next.js 16 重大变更

**版本要求变更**：
| 要求 | 变更 |
|-----|------|
| Node.js | 最低 20.9.0（不再是 18） |
| TypeScript | 最低 5.1.0 |
| 浏览器 | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ |

**已移除的功能**：
| 移除 | 替代 |
|-----|------|
| AMP support | - |
| `next lint` | 使用 Biome 或 ESLint 直接 |
| `appIsrStatus`, `buildActivity` | - |
| `serverRuntimeConfig`, `publicRuntimeConfig` | 使用环境变量 |
| `experimental.turbopack` | 移到顶层 `turbopack` |
| `experimental.dynamicIO` | 重命名为 `cacheComponents` |
| `experimental.ppr` | Cache Components 编程模型 |
| `unstable_rootParams()` | 替代 API 开发中 |

**行为变更**：
| 变更 | 新行为 |
|-----|-------|
| 默认 bundler | Turbopack（可用 `--webpack` 退出） |
| `images.minimumCacheTTL` | 默认从 60s 改为 4 小时 |
| `images.imageSizes` | 默认移除 16 |
| `images.qualities` | 默认从 [1..100] 改为 [75] |
| `images.dangerouslyAllowLocalIP` | 默认禁用 |
| `images.maximumRedirects` | 默认限制 3 个重定向 |
| Parallel routes | 所有插槽需要显式 `default.js` |
| `revalidateTag()` | 现在需要第二个 `cacheLife` 参数 |

---

## 12. 常见面试题

### 12.1 Next.js 的渲染方式有哪些？如何选择？
**答案要点**：
- SSR：服务端渲染，适合SEO和实时性页面
- SSG：静态生成，适合内容固定的页面，性能最优
- ISR：增量静态再生成，平衡性能和内容更新
- CSR：客户端渲染，适合个性化、交互性强的页面
- 选择依据：SEO需求、内容更新频率、实时性要求

---

### 12.2 App Router 和 Pages Router 有什么区别？
**答案要点**：
- 架构：App Router基于React Server Components，Pages Router基于客户端渲染
- 默认行为：App Router默认服务端渲染，Pages Router默认客户端渲染
- 布局系统：App Router用layout.tsx，Pages Router用_app.js
- 数据获取：App Router用async组件，Pages Router用getServerSideProps等
- 建议：新项目使用App Router

---

### 12.3 Next.js 如何实现SEO优化？
**答案要点**：
- 使用App Router的metadata API或Pages Router的Head组件
- 利用SSR/SSG实现服务端渲染，提升爬虫抓取
- 使用next/image优化图片，添加alt属性
- 生成sitemap.xml和robots.txt
- 使用结构化数据（JSON-LD）
- 设置合理的meta标签（title、description、keywords）

---

### 12.4 什么是 Server Actions？如何使用？
**答案要点**：
- 在服务端执行的异步函数
- 可以从客户端组件调用
- 简化表单处理和数据mutation
- 自动处理CSRF保护
- 支持乐观更新

---

### 12.5 Next.js 的缓存机制是怎样的？
**答案要点**：
- **fetch缓存**：通过 `cache` 选项控制
- **revalidate**：基于时间的缓存失效
- **revalidateTag**：基于标签的缓存失效
- **Router缓存**：客户端对路由的缓存
- **Full Route Cache**：完整的预渲染路由缓存
- **Data Cache**：服务端数据缓存

---

### 12.6 Turbopack 相比 Webpack 有什么优势？
**答案要点**：
- 构建速度提升10倍
- 更好的增量编译
- 原生支持Rust
- 更少的内存占用
- 改进的日志和错误提示

---

### 12.7 如何部署 Next.js 应用？
**答案要点**：
- **Vercel**（官方推荐）：一键部署，自动配置
- **自托管**：使用Node.js服务器或Docker
- **静态导出**：`output: 'export'` 生成纯静态文件
- **Serverless**：部署到AWS Lambda、Vercel Edge等
- 部署时注意环境变量、构建命令、输出目录配置

---

### 12.8 Next.js 16 有哪些重大更新？
**答案要点**：
- **Cache Components**：新的缓存编程模型，使用 `"use cache"` 指令
- **proxy.ts**：取代 middleware.ts，明确网络边界
- **Turbopack 稳定版**：成为默认 bundler，2-5x 构建加速
- **React Compiler**：内置支持，自动 memoization
- **增强路由**：Layout deduplication 和 Incremental prefetching
- **新缓存 API**：`updateTag()` 和 `refresh()` Server Actions 专用
- **Breaking Changes**：Node.js 20.9+、并行路由需 default.js 等

---

### 12.9 什么是 Cache Components？和之前的缓存有什么区别？
**答案要点**：
- 之前的 App Router：隐式缓存，需要理解 fetch 缓存语义
- Cache Components：显式缓存，完全可选
- 默认行为：所有动态代码在请求时执行
- 使用 `"use cache"` 指令标记需要缓存的函数/组件
- 完成 Partial Prerendering (PPR) 故事：静态外壳 + 局部动态

---

### 12.10 proxy.ts 和 middleware.ts 有什么区别？
**答案要点**：
- **名称变更**：`middleware.ts` → `proxy.ts`
- **运行时明确**：proxy.ts 运行在 Node.js 运行时
- **逻辑不变**：导出的函数从 `middleware` 改名为 `proxy`
- **原因**：更清晰的命名，明确网络边界
- **兼容性**：middleware.ts 仍可用于 Edge runtime，但已弃用

---

### 12.11 revalidatePath 和 revalidateTag 有什么区别？
**答案要点**：
- **revalidatePath**：重新验证特定路径下的所有缓存
  - 适合页面级别的缓存失效
  - 例如：`revalidatePath('/blog')` 会失效 `/blog` 下所有页面的缓存
- **revalidateTag**：重新验证特定标签关联的所有缓存
  - 适合跨多个页面的相关数据
  - 例如：`revalidateTag('products')` 失效所有标记为 'products' 的 fetch 缓存
- **使用场景**：
  - 数据变更影响单一页面 → 用 revalidatePath
  - 数据变更影响多个页面（如同一个组件被多个页面使用）→ 用 revalidateTag

---

### 12.12 什么是 Streaming？适合什么场景？
**答案要点**：
- Streaming 允许分块传输页面内容
- 首屏快速加载，耗时操作后加载
- 通过 React Suspense 实现
- **适用场景**：
  - 数据获取耗时的页面
  - 需要良好首屏体验的页面
  - 长列表、评论等次要内容

---

### 12.13 Next.js 如何优化 Core Web Vitals？
**答案要点**：
- **LCP (Largest Contentful Paint)**：
  - 使用 `next/image` 的 `priority` 属性优化首屏图片
  - 使用 SSG/SSR 预渲染首屏内容
  - 优化字体加载（`next/font`）
- **FID/INP (Interaction to Next Paint)**：
  - 减少客户端 JavaScript
  - 使用 React Compiler 自动优化重渲染
  - 代码分割，按需加载
- **CLS (Cumulative Layout Shift)**：
  - 为图片指定宽高或使用 `fill` 属性
  - 使用 `next/font` 优化字体加载
  - 避免动态插入内容

---

### 12.14 Parallel Routes 和 Intercepting Routes 有什么区别？
**答案要点**：
- **Parallel Routes（@slot）**：
  - 同一布局中同时渲染多个页面
  - 用于如 Instagram 的照片+点赞+评论同时展示
  - 使用 `@folder` 语法
- **Intercepting Routes**：
  - 从另一个路由"拦截"导航显示
  - 用于如点击图片打开 Modal 而不是跳转页面
  - 使用 `(.)folder` 语法
- **组合使用**：可以实现 Instagram 照片流点击后模态框打开的效果
