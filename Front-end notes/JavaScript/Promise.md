# 初识 Promise —— 异步的“承诺”

在没有 Promise 之前，我们处理异步依赖全靠回调函数嵌套，代码像个向右倒的“金字塔”。

`Promise` 的字面意思是“承诺”。它代表了一个**现在未知，但未来会得到结果**的值。

## 三种状态（不可逆）

一个 Promise 必然处于以下三种状态之一：

- **Pending（待定）**：初始状态，既没有成功，也没有失败。
    
- **Fulfilled（已兑现/成功）**：操作成功完成。
    
- **Rejected（已拒绝/失败）**：操作失败。
    

> **核心规则：** 状态一旦从 Pending 变为 Fulfilled 或 Rejected，就**再也无法改变**。

---

# 基本用法 —— 链式调用

### 1. 构造一个 Promise


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

### 2. 消费 Promise

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

# 进阶——静态方法

在实际工程中，我们经常需要处理多个异步任务：

- **`Promise.all([p1, p2])`**：全部成功才返回结果数组；只要有一个失败，立即返回失败。
    
- **`Promise.race([p1, p2])`**：谁跑得快（状态先改变），就返回谁的结果。
    
- **`Promise.allSettled([p1, p2])`**：等待所有任务结束，无论成功还是失败，返回每个任务的状态。
    
- **`Promise.any([p1, p2])`**：只要有一个成功就返回；全部失败才报错（ES2021）。
    

---

# 终极挑战 —— 手写实现

理解 Promise 的最好方式就是亲手实现它。我们要实现符合 **Promise/A+ 规范** 的核心逻辑。

### 1. 手写核心 Promise (简易版)

为了清晰直观，我们实现最核心的状态转换和 `.then` 逻辑。

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

### 2. 手写 Promise.all

这是大厂面试的高频考点。核心逻辑：**计数器**。

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
    
