## 零、前置储备知识（地基）

在进入事件循环之前，你必须先明确以下三个核心概念：

1. **单线程（Single Thread）**：JavaScript 的主线程只有一个，就像只有一个厨师的厨房，一次只能炒一锅菜。
    
2. **调用栈（Call Stack）**：一种后进先出（LIFO）的数据结构，用来记录函数调用的位置。
    
3. **非阻塞 I/O**：当遇到耗时任务（如网络请求、定时器）时，JS 不会等它完成，而是交给浏览器其他模块处理，主线程继续跑后面的代码。
    

---

## 第一阶段：什么是 Event Loop？（定义与角色）

**Event Loop** 是 JavaScript 引擎的一种执行机制。它的任务非常简单：**监控调用栈，并决定什么时候把回调函数放入栈中执行。**

### 核心角色：

- **堆（Heap）**：存放对象等复杂数据。
    
- **栈（Stack）**：存放同步任务。
    
- **任务队列（Task Queue）**：存放待处理的异步任务回调。
    

---

## 第二阶段：微任务 vs 宏任务（最易混淆点）

异步任务并不是平等的，它们被分为两类：

### 1. 宏任务 (Macrotask)

由宿主环境（浏览器/Node.js）发起的任务：

- `script` (整体代码)
    
- `setTimeout` / `setInterval`
    
- `setImmediate` (Node.js)
    
- I/O、UI 交互事件
    

### 2. 微任务 (Microtask)

由 JavaScript 引擎自身发起的任务：

- `Promise.then / .catch / .finally`
    
- `MutationObserver`
    
- `process.nextTick` (Node.js)
    

---

## 第三阶段：Event Loop 的运行流程（核心算法）

事件循环的每一轮（Tick）遵循以下严格顺序：

1. **执行一个宏任务**（最开始是整体 script 代码）。
    
2. **执行过程中**如果遇到微任务，放入“微任务队列”；遇到宏任务，放入“宏任务队列”。
    
3. **当前宏任务执行完**，立即**清空微任务队列**（依次执行完所有微任务）。
    
4. **如有必要，渲染 UI**。
    
5. **开启下一轮循环**，从宏任务队列中取出一个执行。
    

> **金句总结：** 一个宏任务 -> 清空所有微任务 -> 渲染 -> 下一个宏任务。

---

## 第四阶段：代码实战验证

请预测以下代码的输出顺序：

``` js
console.log('1'); // 同步

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步

// 输出顺序：1 -> 4 -> 3 -> 2
```

**解析：**

1. 执行同步代码 `1` 和 `4`。
    
2. 此时微任务队列有 `3`，宏任务队列有 `2`。
    
3. 同步任务（当前的宏任务）结束，清空微任务队列，打印 `3`。
    
4. 开启下一轮循环，执行宏任务 `2`。
    

---

## 第五阶段：模拟 Event Loop 逻辑（手写伪代码）

虽然 Event Loop 是 C++ 在底层实现的，但我们可以用 JS 逻辑来模拟它的运行：

``` js
class EventLoopSimulator {
  constructor() {
    this.macroTasks = []; // 宏任务队列
    this.microTasks = []; // 微任务队列
    this.isRuntimeRunning = true;
  }

  // 模拟运行
  async run() {
    while (this.isRuntimeRunning) {
      // 1. 执行一个宏任务
      if (this.macroTasks.length > 0) {
        const curTask = this.macroTasks.shift();
        curTask();
      }

      // 2. 核心：立即清空所有微任务
      while (this.microTasks.length > 0) {
        const curMicroTask = this.microTasks.shift();
        curMicroTask();
      }

      // 3. 模拟 UI 渲染（每轮循环后尝试渲染）
      this.renderUI();

      // 如果队列都空了，停止模拟
      if (this.macroTasks.length === 0 && this.microTasks.length === 0) {
        this.isRuntimeRunning = false;
      }
    }
  }

  renderUI() {
    // 实际浏览器会在这里判断是否需要重绘
  }

  addMacroTask(fn) { this.macroTasks.push(fn); }
  addMicroTask(fn) { this.microTasks.push(fn); }
}

// 使用模拟器
const loop = new EventLoopSimulator();
loop.addMacroTask(() => console.log('宏任务 1'));
loop.addMicroTask(() => console.log('微任务 1'));
loop.addMicroTask(() => console.log('微任务 2'));
loop.run(); 
// 输出：宏任务 1 -> 微任务 1 -> 微任务 2
```

---

## 资深工程师的避坑指南

1. **不要在微任务里递归调用微任务**：因为微任务队列必须清空后才会进行下一轮循环或渲染，如果你无限增加微任务，会导致页面彻底卡死（UI 无法渲染）。
    
2. **`await` 之后的代码是什么？**：`await` 后面的代码相当于 `Promise.then` 里的内容，即它也是微任务。
    
3. **计算密集型任务**：如果你有大量计算，不要放在主线程，建议使用 **Web Worker**，否则会阻塞 Event Loop，导致用户点击无效。
    
