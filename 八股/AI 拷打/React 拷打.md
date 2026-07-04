# 同步组件和异步组件

> 同步组件执行时不会暂停，也就是不会 await 等待数据返回的组件，而是直接返回 JSX

> 异步组件指的是组件被 async 标记并且进行异步操作的组件，可以 await 等待数据，之后再返回 JSX

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

但是对于 Client Components 组件，不可以使用 async 声明组件；因为 React 在客户端要求组件必须同步返回 JSX

原因：
1. React 希望组件是纯函数，可以重复、中断、暂停、放弃 Render，而不会产生任何后果；
2. Fiber 是同步计算遍历组件树的，如果有一个组件暂停，那么下面所有组件都会被卡住
3. 


# 首屏加载慢怎么优化

# 渲染时卡顿怎么排查