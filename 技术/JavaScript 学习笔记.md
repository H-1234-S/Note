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

> **示例**

`request` 就是一个**可读流**。数据是**一块一块（chunk）异步到达**，用 `for await...of`，每次循环会**等下一个 chunk 到达**再继续

``` js
for await (const chunk of request) {
  chunks.push(chunk);   // 每来一块就处理一块
}
// 循环结束时，说明流已经结束
```

> **模拟原理实现**

``` js
const asyncSource = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        if (i >= 3) return { value: undefined, done: true };
        await new Promise(r => setTimeout(r, 500)); // 模拟异步等待
        return { value: i++, done: false };
      }
    };
  }
};

// 只能在 async 函数里用
async function main() {
  for await (const x of asyncSource) {
    console.log(x);   // 每隔 500ms 输出 0, 1, 2
  }
}
main();
```