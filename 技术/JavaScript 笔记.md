# 异步迭代

异步迭代（Async Iteration）是 ES2018 引入的语法，用来**遍历异步产生的一系列值**。它是同步迭代（`for...of`）的异步版本。

> **同步迭代 `for...of`**

数据**已经在那里**，可以立刻一个个取：

``` js
const arr = [1, 2, 3];
for (const x of arr) {
  console.log(x);   // 1, 2, 3
}
```

它要求对象实现 **`Symbol.iterator`** 方法，返回一个迭代器，迭代器的 `next()` 返回 `{ value, done }`。

> **异步迭代 `for await...of`**

数据**要等一段时间才产生**，每次取都要等：

``` node
for await (const x of asyncSource) {
  console.log(x);
}
```

它要求对象实现 **`Symbol.asyncIterator`** 方法，返回一个**异步迭代器**，其 `next()` 返回一个 **Promise**，resolve 成 `{ value, done }`。