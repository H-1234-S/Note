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
## 路由导航

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

## Hook

- 在next.js中，只有客户端组件才可以使用hook
### usePathname

- 用于获取跳转后页面的url路径

### useSearchParams

- 用于获取`Link组件`传递的参数
#### 语法

``` ts
import Link from 'next/link

<Link href={{pathname:'',query:{id:1}}} />
```

``` ts
import { useSearchParams } from 'next/navigation'

const searchParams = useSearchParams()；
const id = searchParams.get('id')
```
#### 返回值

- `useSearchParams`  返回一个只读的 `URLSearchParams` 实例
#### 核心方法

- **`get(key)`**: 获取指定键的第一个值。这是最常用的。
    
    - 例如：`searchParams.get('id')`
        
- **`getAll(key)`**: 如果一个键对应多个值（如 `?tags=red&tags=blue`），它会返回一个数组。
    
- **`has(key)`**: 检查 URL 中是否存在某个参数，返回布尔值。
    
- **`keys()` / `values()` / `entries()`**: 用于遍历所有的参数。
