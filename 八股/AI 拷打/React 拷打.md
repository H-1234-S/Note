# 同步组件和异步组件

> 同步组件执行时不会暂停，也就是不会 await 等待数据返回的组件，而是直接返回 JSX

> 异步组件指的是组件被 async 标记并且进行异步操作的组件，可以 await 等待数据，之后再返回 JSX

异步组件执行流程：
```
在 render 阶段，执行异步组件，得到的是 pending 状态的 Promise

需要等待 Promise.resolve，得到 JSX 再进行 reconcile、commit、paint
```

与同步组件最大的区别在于：**组件函数会因为 `await` 暂停执行，React 需要等待 Promise 完成后才能拿到 JSX**。

# 首屏加载慢怎么优化

# 渲染时卡顿怎么排查