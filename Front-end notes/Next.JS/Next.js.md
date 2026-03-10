这份文档已经针对 **Obsidian** 和 **Typora** 等 Markdown 编辑器进行了排版优化，增加了视觉层级、警告提示（Callouts）以及核心概念的补充，确保内容既适合快速查阅，也适合深入学习。

---

# 📘 Next.js 15+ 路由基础全家桶 (App Router)

## 1. 核心路由机制

Next.js 采用**基于文件系统**的路由。`app` 目录下的每个文件夹代表一个 **路由段 (Route Segment)**，直接映射到 URL 路径。

- **`page.tsx`**: 路由的叶子节点，定义该路径最终渲染的 UI。
    
- **`not-found.tsx`**: 自定义 404 页面。
    

---

## 2. 布局与模板 (Layout vs Template)

### 2.1 渲染顺序

当两者同时存在时，嵌套顺序为：`Layout` → `Template` → `ErrorBoundary` → `Suspense` → `Page`。

### 2.2 核心区别对比

|**特性**|**Layout (布局)**|**Template (模板)**|
|---|---|---|
|**挂载频率**|**只渲染一次**。子路由切换时不重新挂载。|**每次导航都重新渲染**。创建一个新实例。|
|**状态保持**|**保持状态**。如输入框文字、滚动位置。|**重置状态**。`useState`、动画等会重新初始化。|
|**生命周期**|不会重新触发 `useEffect`。|每次跳转都会重新触发 `useEffect`。|
|**典型用途**|导航栏、侧边栏、搜索框。|页面切换动画、依赖挂载的统计脚本（GA）。|

---

## 3. 特殊功能组件

### 3.1 Loading (加载中)

- **机制**：基于 React `Suspense` 实现。
    
- **行为**：在异步数据请求时自动显示 `loading.tsx` 内容，完成后自动切回 `page`。
    

### 3.2 Error (错误处理)

- **机制**：基于 React `Error Boundary` 实现。
    
- **限制**：必须是 **客户端组件** (`'use client'`)。
    

---

## 4. 路由跳转

### 4.1 `<Link>` 组件

推荐的导航方式。在 `<a>` 标签基础上扩展了增强功能。

TypeScript

```
import Link from "next/link"

export default function Home() {
    return (
        <nav>
            {/* 1. 基本跳转 */}
            <Link href="/about">关于我们</Link>
            
            {/* 2. 对象传参 (URL 变为: /about?name=张三) */}
            <Link href={{ pathname: "/about", query: { name: "张三" } }}>带参跳转</Link>
            
            {/* 3. 性能优化 */}
            <Link href="/page" prefetch={true}>手动预获取资源</Link>
            
            {/* 4. 行为控制 */}
            <Link href="/settings" scroll={false}>跳转但不改变滚动位置</Link>
            <Link href="/login" replace={true}>替换当前历史记录</Link>
        </nav>
    )
}
```

### 4.2 `useRouter` Hook (Client Side)

用于处理需要逻辑判断后再跳转的场景。

|**方法**|**语法**|**行为描述**|**堆栈变化**|
|---|---|---|---|
|**`push`**|`router.push(url)`|跳转到新页面|`+1`|
|**`replace`**|`router.replace(url)`|替换当前记录|不变|
|**`back`**|`router.back()`|返回上一页|指针后移|
|**`forward`**|`router.forward()`|前进下一页|指针前移|
|**`refresh`**|`router.refresh()`|**刷新数据**，保留 React 状态|无|
|**`prefetch`**|`router.prefetch(url)`|提前加载目标页面资源|无|

---

## 5. 重定向 (Server Side)

## redirect 函数

redirect 函数可以用于服务端组件/客户端组件中跳转页面，例如根据用户权限跳转不同的页面。

**在Next.js中 redirect的状态是：307临时重定向**

``` ts
import { redirect } from "next/navigation"
export default async function Page() {
   const checkLogin = await checkLogin()
   //如果用户未登录，则跳转到登录页面
   if (!checkLogin) {
    redirect("/login")
   }
   return (
    <div>
        <h1>Page</h1>
    </div>
   )
}
```

## permanentRedirect 函数

permanentRedirect 跟上面的redirect的区别是：permanentRedirect是永久重定向，而redirect是临时重定向。

**在Next.js中 permanentRedirect的状态是：308永久重定向**

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

### permanentRedirect / redirect 参数说明

这两个函数都接受以下参数：

- `path`：字符串类型，表示重定向的目标 URL（支持相对路径和绝对路径）
- `type`：可选参数，值为 `replace` 或 `push`，用于控制重定向的行为

**关于 `type` 参数的默认行为：**

- 在 **Server Actions** 中：默认使用 `push`，会将新页面添加到浏览器历史记录
- 在 **其他场景** 中：默认使用 `replace`，会替换当前的浏览器历史记录

你可以通过显式指定 `type` 参数来覆盖默认行为。

> ⚠️ **注意**：`type` 参数在服务端组件中无效，仅在客户端组件和 Server Actions 中生效。
---

## 6. 路由钩子 (Navigation Hooks)

在 Next.js 中，这些钩子只能在 **客户端组件** (`'use client'`) 中使用。

### 6.1 `usePathname()`

获取当前的 URL 路径名（不含参数）。

- 示例：访问 `/dashboard?id=1` -> 返回 `/dashboard`
    

### 6.2 `useSearchParams()`

返回一个只读的 `URLSearchParams` 实例。

TypeScript

```
'use client'
import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
    const searchParams = useSearchParams()
    
    // 常用方法：
    const id = searchParams.get('id')         // 获取单个值
    const tags = searchParams.getAll('tags')  // 获取数组 (如 ?tags=a&tags=b)
    const hasId = searchParams.has('id')      // 检查键是否存在
    
    return <div>ID: {id}</div>
}
```

---

## 💡 进阶避境指南 (Obsidian 必记)

> [!CAUTION] **1. 导入路径错误**
> 
> 必须从 `next/navigation` 导入 `useRouter`。从 `next/router` 导入会报错（那是旧版 Pages Router 的）。

> [!WARNING] **2. Redirect 异常**
> 
> `redirect()` 的原理是抛出错误。**不要**将其放在 `try...catch` 块中，否则跳转会被捕获从而失效。

> [!TIP] **3. 如何在服务端获取参数？**
> 
> `useSearchParams` 仅限客户端。在 **服务端组件 (Server Page)** 中，请直接从 `props` 中获取：
> 
> TypeScript
> 
> ```
> export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
>    const id = searchParams.id
>    // ...
> }
> ```