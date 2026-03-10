# Next.js 路由基础
## App Router

- Next.js 采用基于文件系统的路由机制，只需创建文件和文件夹，框架就会自动生成对应的路由结构。

- 在 Next.js 中，app 目录下的每个文件夹都代表一个路由段（route segment），并直接映射到 URL 路径
### page

- app目录下每个文件夹都应该有page.tsx/page.jsx文件，作为当前路由的页面
### layout与template

- **布局嵌套**：支持多层布局嵌套，构建复杂的页面结构
	
- **状态管理**：布局会在页面切换时保持状态，而模板会重新渲染
	
- **根布局**：app/layout.tsx 是必须存在的根布局文件
	
- **渲染顺序**：当layout与template同时存在时，渲染顺序为 layout → template → page
#### 相同点

- layout与template可以看作多个页面共享的ui，例如导航栏、侧边栏、底部等；并把文件夹下的page作为children渲染
#### 不同点

| **特性**   | **Layout (布局)**                          | **Template (模板)**                                 |
| -------- | ---------------------------------------- | ------------------------------------------------- |
| **渲染频率** | **只渲染一次**。在子路由间切换时，Layout 不会重新挂载（Mount）。 | **每次切换都会重新渲染**。每次导航到使用该模板的页面时，都会创建一个新实例。          |
| **状态保持** | **保持状态**。例如：输入框里的文字、展开的菜单状态在跳转时不会消失。     | **重置状态**。每次跳转，组件内的 `useState`、动画等都会重新初始化。         |
| **生命周期** | 不会触发 `useEffect` 的重新执行。                  | 每次跳转都会重新触发 `useEffect`。                           |
| **典型用途** | 导航栏、侧边栏、搜索框（跨页面共享且不需要重置的 UI）。            | 页面切换动画（如 CSS 过渡）、依赖页面挂载的统计脚本（如 Google Analytics）。 |
### loading

- Next.js的loading是借助了`Suspense`实现的
	
- 触发异步自动跳转到loading页面，页面结束后自动跳转
### error

- Next.js的error是借助了`Error Boundary`实现的。
	
- 'use client' **错误组件必须是客户端组件**
### not-found

- Next.js 默认会生成一个404页面，但我们可能自定义404页面，只需要在app目录下创建一个not-found.tsx文件即可
## 路由跳转

### Link组件

- `<Link>`是一个内置组件，在a标签的基础上扩展了功能，并且还能用来实现预获取(prefetch)，以及保持滚动位置(scroll)等。
	
- 携带的参数在url路径可见
#### 基本用法

``` ts
import Link from "next/link" //引入Link组件
export default function Home() {
    return (
        <div>
            <Link href="/about">跳转About页面</Link>
            <Link href={{pathname: "/about", query: {name: "张三"}}}>跳转About并且传入参数</Link>
            // prefetch预获取意思是：在生产环境下，这个Link组件出现在可视区域时，后台自动加载所对应的资源
            <Link href="/page" prefetch={true}>预获取page页面</Link>
            <Link href="/xm" scroll={true}>保持滚动位置</Link>
            <Link href="/daman" replace={true}>替换当前页面</Link>
        </div>
    )
}
```
### useRouter Hook

- useRouter 可以在代码中根据逻辑跳转页面
#### 基本用法
``` ts
'use client'
import { useRouter } from "next/navigation"
export default function Page() {
    const router = useRouter()
    return (
        <>
        <button onClick={() => router.push("/page")}>跳转page页面</button>
        <button onClick={() => router.replace("/page")}>替换当前页面</button>
        <button onClick={() => router.back()}>返回上一页</button>
        <button onClick={() => router.forward()}>跳转下一页</button>
        // 
        <button onClick={() => router.refresh()}>刷新当前页面</button>
        <button onClick={() => router.prefetch("/about")}>预获取about页面</button>
        </>
    )
}
```

|**方法**|**语法**|**行为描述**|**历史堆栈变化**|**典型使用场景**|
|---|---|---|---|---|
|**`push`**|`router.push('/path')`|**新增**一个历史记录并跳转。|栈长度 +1|普通页面导航（如：点击查看详情）。|
|**`replace`**|`router.replace('/path')`|**替换**当前历史记录并跳转。|栈长度不变|登录重定向、表单提交后防止回退。|
|**`back`**|`router.back()`|返回到**上一个**页面。|栈指针后移|点击“返回”按钮。|
|**`forward`**|`router.forward()`|前进到**下一个**页面。|栈指针前移|点击“前进”按钮（需先执行过 back）。|
|**`refresh`**|`router.refresh()`|**刷新数据**，不丢失 React 状态。|无变化|提交数据后同步服务器最新状态。|
|**`prefetch`**|`router.prefetch('/path')`|**预加载**目标页面的代码和数据。|无变化|在用户点击按钮前提前下载资源。|
### redirect 函数

- redirect 函数可以用于服务端组件/客户端组件中跳转页面，例如根据用户权限跳转不同的页面。
	
- **在Next.js中 redirect的状态是：307临时重定向，permanentRedirect状态是：308永久重定向**

``` ts
import { redirect,permanentRedirect } from "next/navigation"
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
##### 临时重定向 (307)

- **本质**：告诉搜索引擎和浏览器，当前的跳转只是暂时的，例如双11期间，点击首页会自动跳转到活动界面，活动结束后依旧还是首页。
    
- **SEO**：搜索引擎会继续抓取旧地址，旧地址的搜索排名保持不变。
    
- **为什么是 307 而不是 302？** * 307 保证了重定向时 **请求方法（GET/POST）不变**。如果用户 POST 了一个表单，307 重定向后依然是 POST。
### permanentRedirect 函数

- permanentRedirect 跟上面的redirect的区别是：permanentRedirect是永久重定向，而redirect是临时重定向。
	
- **在Next.js中 permanentRedirect的状态是：308永久重定向**

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
##### 永久重定向 (308)

- **本质**：告诉搜索引擎和浏览器，旧地址已经作废，请以后直接访问新地址。
    
- **SEO**：极其重要！它会将旧地址积攒的“搜索权重”转移到新地址。
    
- **缓存特性**：一旦浏览器收到 308，它会把这个映射存在本地。下次用户输入旧网址，浏览器**不会请求服务器**，直接在本地跳转到新网址。
## 动态路由

- **动态路由（Dynamic Routes）** 是指 URL 中的某一部分不是固定的字符，而是一个**变量（参数）**。
	
- **编写一个模板文件，它可以根据 URL 中传入的不同参数，渲染出不同的内容。** 例如：商品详情页面，根据不同商品的id渲染不同的内容
### 基本用法

- 使用动态路由只需要在**文件夹名**加上**方括号`[]`**即可，例如`[id]`,`[params]`等，名字可以自定义。
### 全捕获路由

|**文件夹命名**|**路由类型**|**访问 URL**|**params 的结果**|**解释**|
|---|---|---|---|---|
|`/[id]`|**基础动态路由**|`/123`|`{ id: '123' }`|**只能匹配一级**。访问 `/123/456` 会报 404。|
|**`/[...id]`**|**全捕获路由**|`/123/456/789`|`{ id: ['123', '456', '789'] }`|**匹配多级**。结果是一个**字符串数组**。|
### 可选全捕获路由

- 可选全捕获路由指的是，我们可能会有这个路由参数，也可能会没有这个路由参数。

- 例如`/shop/123`，也可能是`/shop`

|**文件夹命名**|**路由类型**|**访问 /docs (根)**|**访问 /docs/a/b**|**params 结果示例**|
|---|---|---|---|---|
|**`[id]`**|基础动态|**404**|**404** (只匹配一级)|`{ id: 'a' }`|
|**`[...id]`**|全捕获|**404**|匹配成功 ✅|`{ id: ['a', 'b'] }`|
|**`[[...id]]`**|**可选全捕获**|**匹配成功 ✅**|匹配成功 ✅|`{ id: ['a', 'b'] }` 或 `{}`|
#### 为什么需要 `[[...id]]`？

它的存在是为了解决 **“同一个文件既要当首页，又要当详情页”** 的场景。

##### 场景举例：电商分类筛选页

假设你有一个商品列表页：

1. 用户访问 `/shop`：显示所有商品。
    
2. 用户访问 `/shop/clothes`：显示衣服。
    
3. 用户访问 `/shop/clothes/men/shoes`：显示男装鞋子。

如果你使用 `[[...slug]]`，你只需要创建一个文件：`app/shop/[[...slug]]/page.tsx`。







# Hook

- 在next.js中，只有客户端组件才可以使用hook
## usePathname

- 用于获取跳转后页面的url路径

## useSearchParams

- 用于获取`Link组件`传递的参数
### 基本语法

``` ts
import Link from 'next/link

<Link href={{pathname:'',query:{id:1}}} />
```

``` ts
'use client'

import { useSearchParams } from 'next/navigation'

const searchParams = useSearchParams()；
const id = searchParams.get('id')
```
### 返回值

- `useSearchParams`  返回一个只读的 `URLSearchParams` 实例
### 核心方法

- **`get(key)`**: 获取指定键的第一个值。这是最常用的。
    
    - 例如：`searchParams.get('id')`
        
- **`getAll(key)`**: 如果一个键对应多个值（如 `?tags=red&tags=blue`），它会返回一个数组。
    
- **`has(key)`**: 检查 URL 中是否存在某个参数，返回布尔值。
    
- **`keys()` / `values()` / `entries()`**: 用于遍历所有的参数。
## useParams

- 用于获取**动态路由参数**
#### 基本语法

``` ts
'use client'

import { useParams } from 'next/navigation'

export default function PostClientComponent() {
  const params = useParams()

  // 假设当前路径是 /shop/electronics/iphone
  // 对应的文件夹是 /shop/[category]/[item]
  
  console.log(params) // 输出: { category: 'electronics', item: 'iphone' }

  return (
    <div className="p-4 border rounded">
      <h3>当前分类：{params.category}</h3>
      <p>正在查看：{params.item}</p>
    </div>
  )
}
```
#### 返回值

- `useParams` 返回一个包含当前路由所有动态参数的**对象**。
	
- **URL 示例**：`/blog/123`
    
- **文件夹结构**：`app/blog/[id]/page.tsx`
    
- **返回值**：`{ id: '123' }`