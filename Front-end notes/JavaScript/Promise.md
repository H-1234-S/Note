# Promise 是什么？

在没有 Promise 之前，我们处理异步依赖全靠回调函数嵌套，代码像个向右倒的“金字塔”。

`Promise` 的字面意思是“承诺”。它代表了一个**现在未知，但未来会得到结果**的值。

## 三种状态（不可逆）

一个 Promise 必然处于以下三种状态之一：

- **Pending（待定）**：初始状态，既没有成功，也没有失败。
    
- **Fulfilled（已兑现/成功）**：操作成功完成。
    
- **Rejected（已拒绝/失败）**：操作失败。
    

> **核心规则：** 状态一旦从 Pending 变为 Fulfilled 或 Rejected，就**再也无法改变**。

---

# 基本用法 

## 1. 构造一个 Promise


``` js
const myPromise = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("操作成功！"); // 将状态变为 Fulfilled
    } else {
      reject("出错了...");  // 将状态变为 Rejected
    }
  }, 1000);
});
```

## 2. 消费 Promise

通过 `.then()`、`.catch()` 和 `.finally()` 来处理结果：

``` js
myPromise
  .then(data => {
    console.log(data); // "操作成功！"
    return "下一步";    // then 会返回一个新的 Promise，支持链式调用
  })
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    console.log("无论成功失败都会执行，常用于关闭 Loading");
  });
```

---

# 静态方法

在实际工程中，我们经常需要处理多个异步任务：

- **`Promise.all([p1, p2])`**：全部成功才返回结果数组；只要有一个失败，立即返回失败。
    
- **`Promise.race([p1, p2])`**：谁跑得快（状态先改变），就返回谁的结果。
    
- **`Promise.allSettled([p1, p2])`**：等待所有任务结束，无论成功还是失败，返回每个任务的状态。
    
- **`Promise.any([p1, p2])`**：只要有一个成功就返回；全部失败才报错（ES2021）。
    

---

# 手写核心 Promise


``` js
class MyPromise {
  constructor(executor) {
    this.state = 'pending'; // 初始状态
    this.value = undefined; // 成功的值
    this.reason = undefined; // 失败的原因
    this.onResolvedCallbacks = []; // 存放成功的回调
    this.onRejectedCallbacks = []; // 存放失败的回调

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 依次执行异步收集的回调
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    // 简单起见，这里假设 then 返回一个简单的结果
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }
    if (this.state === 'rejected') {
      onRejected(this.reason);
    }
    // 如果是异步的（pending状态），先订阅
    if (this.state === 'pending') {
      this.onResolvedCallbacks.push(() => onFulfilled(this.value));
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }
}
```

---

## 1. 为什么要有 `state`？

Promise 的本质是一个**状态机**。

- **设计意图**：异步操作需要一个“进度条”。`pending` 是进行中，`fulfilled` 是成功，`rejected` 是失败。
    
- **关键约束**：状态一旦改变就不可逆。


``` js
// 为什么要写这一步？
if (this.state === 'pending') { 
    // 只有 pending 状态下才允许改变状态
    // 防止 resolve 了之后又去调用 reject
}
```

---

## 2. 为什么需要 `onResolvedCallbacks` 数组？

这是很多初学者最困惑的地方：**为什么要用数组存起来，而不是直接执行？**

- **场景还原**：如果你在 Promise 里写了一个 `setTimeout`，执行到 `then` 的时候，异步操作还没完成，此时状态还是 `pending`。
    
- **设计意图**：我们不能立即执行回调，得先把它“记在小本本上”（存入数组）。
    
- **为什么是数组？**：因为同一个 Promise 实例可以多次调用 `.then`。如果是数组，我们就能按顺序触发所有的回调。
    


``` js
// 当你在 pending 时调用 .then
if (this.state === 'pending') {
    this.onResolvedCallbacks.push(() => onFulfilled(this.value));
}
```

---

## 3. 为什么要用箭头函数定义 `resolve` / `reject` ?

你观察到你的代码里是用 `const resolve = (value) => { ... }` 了吗？

- **设计意图**：`executor` 是用户传进来的。如果用户在外部直接调用 `resolve()`，普通函数的 `this` 指向会丢失（指向全局或 undefined）。
    
- **解决方案**：箭头函数不绑定 `this`，它会捕获定义时所处环境的 `this`（即当前的 `MyPromise` 实例）。这样无论用户怎么调用，`this.state` 都能准确找到实例。
    

---

## 4. 为什么要用 `try...catch` 包裹 `executor`

- **设计意图**：用户传的代码是不可控的。如果用户在 Promise 内部写了非法代码（比如 `console.log(a)` 且 `a` 未定义），我们需要把这个“程序崩溃”优雅地转化为“Promise 失败”。

``` js
try {
    executor(resolve, reject);
} catch (error) { // 这里的参数名字要和 catch 后面一致
    reject(error);
}
```

---

## 5. 你的代码中需要优化的“资深细节”

为了让你的 Promise 更接近原生，我们需要修正几个逻辑小瑕疵：

### A. 参数校验（值穿透）

原生的 `.then` 允许不传参数。如果你不传，结果应该一直传下去。

``` js
onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
```

### B. 链式调用（最重要的进阶）

原生的 `then` 返回的是一个**全新的 Promise**，这样才能实现 `p.then().then()`。你目前的实现返回的是 `undefined`，无法链式调用。

### C. 异步执行（微任务）

原生的 `then` 里的回调是**异步**执行的（微任务）。即使用户立即调用了 `resolve`，`.then` 里的代码也会在同步代码执行完后再跑。你可以用 `queueMicrotask` 或 `setTimeout` 来模拟。

---

## 修改后的进阶逻辑预览

``` js
then(onFulfilled, onRejected) {
    // 1. 完善参数校验
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e };

    // 2. 为了支持链式调用，返回一个新的 MyPromise
    return new MyPromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
            // 模拟异步执行
            setTimeout(() => {
                try {
                    let x = onFulfilled(this.value);
                    resolve(x); // 把上一个 then 的返回值传给下一个
                } catch (e) { reject(e); }
            });
        }
        // ... pending 和 rejected 同理
    });
}
```

---

# 手写 Promise.all

``` ts
MyPromise.all = function(promises) {
  return new Promise((resolve, reject) => {
    let result = [];
    let count = 0;
    
    promises.forEach((p, index) => {
      // 包装成 Promise 处理非 Promise 值
      Promise.resolve(p).then(res => {
        result[index] = res; // 保证结果顺序
        count++;
        if (count === promises.length) {
          resolve(result);
        }
      }, err => {
        reject(err); // 只要有一个失败，直接 reject
      });
    });
  });
};
```

---

# 总结

1. **微任务机制**：Promise 的回调属于**微任务（Microtask）**，它会在当前宏任务（如 script 整体代码）执行完后、页面渲染前立即执行。
    
2. **错误捕获**：永远记得在链条最后加一个 `.catch()`，否则未捕获的错误可能会导致程序静默失败。
    
3. **配合 Async/Await**：这是目前最优雅的异步写法，它是 Promise 的语法糖，让异步代码读起来像同步代码。
    
