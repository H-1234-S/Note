# 同步组件和异步组件

> 同步组件执行时不会暂停，也就是不会 await 等待数据返回之后再返回 JSX，而是直接返回 JSX

> 异步组件指的函数组件可以被 async 标记，可以 await 暂停组件执行，返回 pending 状态的 Promise，resolve 之后再返回 JSX

异步组件执行流程：
```
在 render 阶段，执行异步组件，得到的是 pending 状态的 Promise

需要等待 Promise.resolve，得到 JSX 再进行 reconcile、commit、paint
```

与同步组件最大的区别在于：**异步组件函数会因为 `await` 暂停执行，React 需要等待 Promise 完成后才能拿到 JSX**。

---
## Server Components 组件

对于 Server Components 组件，可以使用 async 声明组件；因为 Server Components 组件运行在服务端，本来就是调接口，查数据库，返回HTML，不需要立刻更新 DOM

## Client Components 组件

但是对于 Client Components 组件，不可以使用 async 声明组件；因为 React 在**客户端**要求组件必须同步返回 JSX，也就是不能卡住后续阶段执行。

原因：
1. React 希望组件是纯函数，在 Render 阶段可以重复、中断、暂停、放弃，而不会产生任何后果；
2. Fiber 是同步计算遍历组件树的，如果有一个组件暂停，那么下面所有组件都会被卡住
3. 对于 Commit 后续阶段也会被卡住，因为 Fiber 阶段工作没有结束

其实还是 React 不知道何时 Promise 结束，什么时候 Promise.resolve；因为 Promise.resolve **浏览器**是在异步操作完成后，调用 Promise 的 `resolve()`，不受 React 调度器控制。

但是现在可以用 Suspense 包裹，在 Fiber 计算过程中，执行组件发现得到的是 pending 状态的 Promise，不会等组件数据返回，而是去渲染 Suspense 提供的 fallback。(虽然可以使用 Suspense 包裹组件，被 async 包裹的组件也可以展示，但是控制台还会报错)

---

> 客户端使用 async、await

可以在**事件处理函数**中使用；这是因为这个函数 React 不会调用，其实就是普通的 JS 函数，浏览器调用
``` js
"use client";

export default function Page() {
    async function handleClick() {
        const res = await fetch("/api/user");
        const data = await res.json();

        console.log(data);
    }

    return (
        <button onClick={handleClick}>
            获取数据
        </button>
    );
}
```

也可以在useEffect使用
``` js
useEffect(() => {
    (async () => {
        const res = await fetch("/api/user");
        const data = await res.json();

        setData(data);
    })();
}, []);
```

# 首屏加载慢怎么优化

从浏览器输入 URL 到页面展示有很多阶段，优化思路可以是围绕着**每一阶段进行**的，也可以单独**针对问题**进行优化

## 网络阶段

> DNS 查询可以使用 DNS 预解析，link 的 dns-prefetch

``` js
<link rel="dns-prefetch" href="xxx">
```

> CND 内容分发网络

可以将静态资源提前缓存到距离用户较近的边缘节点

## 渲染阶段

> CSS

CSS 不会阻塞 DOM 解析，但会阻塞渲染；还会间接阻塞 JS 执行

减少 CSS 大小，删除无关的 CSS；使用 `PurgeCSS` 进行 CSS 删除

> JS

代码分割，不要全部将内容塞到一个 JS 中，可以分为几个 JS 文件，按需加载。

`Tree Shaking` 进行优化，删除无用的 JS 内容，减少 Boundle 大小

`defer / async` 不阻塞 HTML 解析 DOM

## 图片优化

图片大小压缩，可以使用 `WebP` 格式

非首屏图片进行懒加载

## React / Next.js 优化

React 最大的问题是 Hydration，意思是即使某些**页面/组件**不需要交互，它们的 JS 也会发送给前端进行水合，这就导致有很多无关紧要的 JS 被发送给前端

可以使用 `Server Component` 服务端渲染，将一些组件按照需求和策略改为服务端渲染；对于一些异步操作，客户端可以使用 `Suspense`

## 缓存优化

合理使用浏览器缓存

HTTP 缓存指的是**浏览器的一套缓存机制**


# 渲染时卡顿怎么排查

# React 19 新特性