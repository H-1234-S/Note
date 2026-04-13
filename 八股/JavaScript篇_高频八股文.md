## 1. 数据类型与类型判断 {#data-types}

### 1.1 JavaScript有哪些数据类型？
**考点**：基础数据类型分类

**数据类型分类**：


**原始类型（7种）**：

**原始类型（7种）**：

1. `number` - 数字（包含NaN）

2. `string` - 字符串

3. `boolean` - 布尔值

4. `undefined` - 未定义

5. `null` - 空对象

6. `symbol` - ES6，唯一标识符

7. `bigint` - ES2020，大整数

**引用类型**：

1. `object` - 对象（包含数组、函数、正则、日期等）

2. `array` - 数组

3. `function` - 函数

4. `regexp` - 正则表达式

5. `date` - 日期

**特殊值**：

- `NaN` - Not a Number（类型为number，但不等于任何值，包括自己）

---

### 1.2 null和undefined的区别？
**考点**：基础类型细节

| 特性 | null | undefined |
|-----|------|-----------|
| **含义** | 空对象引用 | 未定义的值 |
| **类型** | `object` | `undefined` |
| **使用场景** | 主动赋值为空 | 变量声明未赋值 |
| **转换为数字** | 0 | NaN |

**代码示例**：
```javascript
let a;           // undefined
let b = null;    // null

console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" (历史遗留bug)

console.log(null == undefined);  // true (宽松相等)
console.log(null === undefined); // false (严格相等)
```

**面试加分点**：
- 了解`typeof null`返回`"object"`是历史遗留问题
- 知道在实际开发中，`null`用于显式表示空值，`undefined`表示未初始化

---

### 1.3 如何判断数据类型？
**考点**：类型检测方法对比

**常用方法**：

1. **typeof** - 适合判断原始类型
   ```javascript
   typeof 123;           // "number"
   typeof 'abc';         // "string"
   typeof true;          // "boolean"
   typeof undefined;     // "undefined"
   typeof Symbol();      // "symbol"
   typeof BigInt(123);   // "bigint"
   typeof function(){};  // "function"
   typeof null;          // "object" ❌
   typeof [];            // "object" ❌
   typeof {};            // "object"
   ```

2. **instanceof** - 判断引用类型（基于原型链）
   ```javascript
   [] instanceof Array;        // true
   {} instanceof Object;       // true
   /abc/ instanceof RegExp;    // true
   new Date() instanceof Date; // true

   // 跨iframe会失效
   ```

3. **Object.prototype.toString.call()** - 最准确 ✅
   ```javascript
   Object.prototype.toString.call(123);           // "[object Number]"
   Object.prototype.toString.call('abc');         // "[object String]"
   Object.prototype.toString.call(null);          // "[object Null]"
   Object.prototype.toString.call(undefined);     // "[object Undefined]"
   Object.prototype.toString.call([]);            // "[object Array]"
   Object.prototype.toString.call({});            // "[object Object]"
   Object.prototype.toString.call(new Date());    // "[object Date]"
   Object.prototype.toString.call(/abc/);         // "[object RegExp]"
   Object.prototype.toString.call(function(){});  // "[object Function]"
   ```

4. **constructor**
   ```javascript
   (123).constructor === Number;      // true
   'abc'.constructor === String;      // true
   [].constructor === Array;          // true
   // 可以被修改，不可靠
   ```

5. **Array.isArray()** - 判断数组
   ```javascript
   Array.isArray([]);      // true
   Array.isArray({});      // false
   ```

---

### 1.4 == 和 === 的区别？
**考点**：相等运算符

**==（宽松相等）**：
- 会进行**类型转换**，再比较值
- 转换规则复杂，容易出错

**===（严格相等）**：
- 不进行类型转换
- 类型和值都必须相同

**类型转换规则（==）**：

```javascript
// 布尔值转数字
true == 1;      // true
false == 0;     // true

// null和undefined特殊
null == undefined;  // true
null == 0;          // false
undefined == 0;     // false

// 对象转原始值
[] == 0;            // true  ( [] → '' → 0 )
[1] == 1;           // true  ( [1] → '1' → 1 )
{} == '[object Object]';  // true

// 字符串和数字比较，字符串转数字
'123' == 123;       // true

// NaN特殊
NaN == NaN;         // false
```

**最佳实践**：
```javascript
// ✅ 始终使用 ===
if (value === 0) { }
if (value === null) { }

// ❌ 避免使用 ==
if (value == 0) { }
```

---

### 1.5 0.1 + 0.2 === 0.3 吗？为什么？
**考点**：浮点数精度问题

**答案**：❌ `false`

```javascript
console.log(0.1 + 0.2 === 0.3);  // false
console.log(0.1 + 0.2);          // 0.30000000000000004
```

**原因**：
- JavaScript使用IEEE 754双精度浮点数标准
- 0.1和0.2的二进制表示是**无限循环**的
- 计算机只能截取有限位，产生精度丢失

**解决方案**：

1. **使用Number.EPSILON**
   ```javascript
   function isEqual(a, b) {
     return Math.abs(a - b) < Number.EPSILON;
   }
   console.log(isEqual(0.1 + 0.2, 0.3));  // true
   ```

2. **转为整数计算**
   ```javascript
   (0.1 * 10 + 0.2 * 10) / 10 === 0.3;  // true
   ```

3. **使用toFixed**（注意：返回字符串）
   ```javascript
   (0.1 + 0.2).toFixed(1) === '0.3';  // true
   ```

4. **使用第三方库**（如decimal.js、big.js）

---

### 1.6 NaN是什么？如何判断？
**考点**：特殊数值

**NaN特点**：
- `NaN` = Not a Number
- **类型是`number`**
- **不等于任何值，包括自己**
- 任何涉及`NaN`的运算都返回`NaN`

**判断NaN的方法**：

1. **isNaN()** - 会进行类型转换
   ```javascript
   isNaN(NaN);      // true
   isNaN('abc');    // true (会转成数字)
   isNaN('123');    // false
   ```

2. **Number.isNaN()** - 不进行类型转换（推荐）✅
   ```javascript
   Number.isNaN(NaN);      // true
   Number.isNaN('abc');    // false (不转换)
   Number.isNaN(123);      // false
   ```

3. **NaN !== NaN** - 利用NaN不等于自己的特性
   ```javascript
   function isNaN(val) {
     return val !== val;
   }
   ```

---

## 2. 作用域与闭包 {#scope-closure}

### 2.1 什么是作用域？JavaScript有哪些作用域？
**考点**：变量可见性

**作用域定义**：变量可访问的范围

**作用域类型**：

1. **全局作用域**

   - 最外层定义的变量

   - 在任何地方都可以访问

2. **函数作用域（Function Scope）**

   - 函数内部定义的变量

   - 只能在函数内部访问

3. **块级作用域（Block Scope）** - ES6

   - `{}`块内部定义的变量

   - 使用`let`和`const`声明

4. **模块作用域（Module Scope）**

   - ES6模块中的变量

**变量提升（Hoisting）**：

- `var`和`function`声明会提升到作用域顶部

- `let`和`const`也提升，但存在**暂时性死区**（TDZ）

```javascript
console.log(a);  // undefined (var提升)
var a = 1;

console.log(b);  // ReferenceError (let在TDZ中)
let b = 2;

fn();  // 可以调用（函数提升）
function fn() {
  console.log('hello');
}

foo();  // TypeError (变量提升，但值为undefined)
var foo = function() {};
```

---

### 2.2 什么是闭包（Closure）？
**考点**：核心概念

**闭包定义**：函数能够访问其词法作用域外的变量

**形成条件**：

1. 函数嵌套

2. 内部函数引用了外部函数的变量

3. 外部函数返回内部函数（或内部函数在外部被调用）

**经典示例**：
```javascript
function outer() {
  let count = 0;

  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3
// count变量被inner函数闭包住，不会被销毁
```

**闭包的用途**：

1. **数据私有化**

2. **函数柯里化（Currying）**

3. **防抖节流**

**闭包的缺点**：

- 内存泄漏（变量无法被垃圾回收）

- 解决方案：使用完后置为`null`，解除引用

---

### 2.3 for循环中使用var和let的区别？
**考点**：块级作用域理解

```javascript
// 使用 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 3, 3, 3
  }, 100);
}
// var没有块级作用域，i是全局的，循环结束后i=3

// 使用 let
for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(j);  // 0, 1, 2
  }, 100);
}
// let有块级作用域，每次循环创建新的j
```

**var的解决方案**（ES6之前）：

1. **IIFE（立即执行函数）**
   ```javascript
   for (var i = 0; i < 3; i++) {
     (function(i) {
       setTimeout(() => {
         console.log(i);
       }, 100);
     })(i);
   }
   ```

2. **setTimeout第三个参数**
   ```javascript
   for (var i = 0; i < 3; i++) {
     setTimeout((i) => {
       console.log(i);
     }, 100, i);
   }
   ```

---

## 3. 原型与继承 {#prototype-inheritance}

### 3.1 什么是原型（Prototype）和原型链？
**考点**：JavaScript继承机制

**核心概念**：

1. **每个函数都有`prototype`属性**（原型对象）

   - 原型对象包含`constructor`属性，指向函数本身

2. **每个对象都有`__proto__`属性**（隐式原型）

   - 指向创建该对象的构造函数的`prototype`

3. **原型链**：通过`__proto__`逐级向上查找，直到`null`

**关系图**：
```
实例对象.__proto__ === 构造函数.prototype
Object.prototype.__proto__ === null
```

**代码示例**：
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log('Hi, ' + this.name);
};

const alice = new Person('Alice');

// 验证关系
console.log(alice.__proto__ === Person.prototype);  // true
console.log(Person.prototype.constructor === Person);  // true
console.log(alice instanceof Person);  // true

alice.sayHi();  // "Hi, Alice" (从原型链上找到)

// 原型链
console.log(alice.__proto__.__proto__ === Object.prototype);  // true
console.log(Object.prototype.__proto__);  // null
```

**查找规则**：
- 访问属性时，先在对象自身查找
- 找不到则沿着`__proto__`向上查找
- 直到找到或到达`Object.prototype.__proto__`（null）

---

### 3.2 什么是继承？如何实现继承？
**考点**：面向对象编程

**继承的几种方式**：


#### 1. **原型链继承**
```javascript
function Parent() {
  this.name = 'parent';
}

Parent.prototype.sayHi = function() {
  console.log(this.name);
};

function Child() {}

Child.prototype = new Parent();  // 继承

const child = new Child();
child.sayHi();  // "parent"
```
**缺点**：
- 引用类型属性被所有实例共享
- 无法向父类构造函数传参

---

#### 2. **借用构造函数继承（经典继承）**
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

function Child(name) {
  Parent.call(this, name);  // 借用构造函数
}

const child1 = new Child('Alice');
const child2 = new Child('Bob');

child1.colors.push('green');
console.log(child1.colors);  // ['red', 'blue', 'green']
console.log(child2.colors);  // ['red', 'blue'] (不共享)
```
**优点**：避免了引用类型共享
**缺点**：无法继承原型上的方法

---

#### 3. **组合继承（最常用）** ✅
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayHi = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 第二次调用
  this.age = age;
}

Child.prototype = new Parent();  // 第一次调用
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child = new Child('Alice', 18);
child.sayHi();   // "Alice"
child.sayAge();  // 18
```
**缺点**：父类构造函数被调用了两次

---

#### 4. **原型式继承**
```javascript
function createObj(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

const person = {
  name: 'Alice',
  friends: ['Bob', 'Charlie']
};

const another = createObj(person);
// 等同于 Object.create(person)
```

---

#### 5. **寄生组合式继承（最佳）** ✅
```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Parent.prototype.sayHi = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 继承原型
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.sayAge = function() {
  console.log(this.age);
};

const child = new Child('Alice', 18);
child.sayHi();   // "Alice"
child.sayAge();  // 18
```

**简化版本**（常用）：
```javascript
Child.prototype = Object.create(Parent.prototype, {
  constructor: {
    value: Child,
    enumerable: false,
    writable: true,
    configurable: true
  }
});
```

---

#### 6. **ES6 Class继承**
```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }

  sayHi() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);  // 调用父类构造函数
    this.age = age;
  }

  sayAge() {
    console.log(this.age);
  }
}

const child = new Child('Alice', 18);
child.sayHi();   // "Alice"
child.sayAge();  // 18
```

---

### 3.3 instanceof的原理？如何手写？
**考点**：原型链理解

**原理**：
- 判断左边对象的`__proto__`是否等于右边构造函数的`prototype`
- 一直向上查找，直到找到或到达`null`

**手写实现**：
```javascript
function myInstanceof(left, right) {
  let proto = left.__proto__;
  const prototype = right.prototype;

  while (true) {
    if (proto === null) return false;
    if (proto === prototype) return true;
    proto = proto.__proto__;
  }
}

// 测试
console.log(myInstanceof([], Array));        // true
console.log(myInstanceof({}, Object));       // true
console.log(myInstanceof(123, Number));      // false (原始类型)
```

**注意事项**：
- `instanceof`只能判断引用类型
- 跨iframe会失效（不同窗口的构造函数不同）

---

### 3.4 new的原理？如何手写？
**考点**：构造函数执行机制

**new操作符做了什么**：
1. 创建一个空对象
2. 设置对象的`__proto__`为构造函数的`prototype`
3. 执行构造函数，`this`指向新对象
4. 返回结果（如果构造函数返回对象，则返回该对象，否则返回新对象）

**手写实现**：
```javascript
function myNew(constructor, ...args) {
  // 1. 创建空对象
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数，绑定this
  const result = constructor.apply(obj, args);

  // 3. 返回结果
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name) {
  this.name = name;
}

const alice = myNew(Person, 'Alice');
console.log(alice.name);  // "Alice"
console.log(alice instanceof Person);  // true
```

**简化版本**：
```javascript
function myNew() {
  const constructor = Array.prototype.shift.call(arguments);
  const obj = Object.create(constructor.prototype);
  const result = constructor.apply(obj, arguments);
  return typeof result === 'object' && result !== null ? result : obj;
}
```

---

## 4. this指向 {#this-binding}

### 4.1 this的指向规则？
**考点**：核心难点

**this绑定规则（优先级从高到低）**：

#### 1. **new绑定**（最高优先级）
```javascript
function Foo() {
  this.a = 1;
}

const obj = new Foo();
console.log(obj.a);  // 1 (this指向新对象)
```

---

#### 2. **显式绑定** - call、apply、bind
```javascript
function fn() {
  console.log(this.a);
}

const obj = { a: 1 };

fn.call(obj);    // 1
fn.apply(obj);   // 1

const boundFn = fn.bind(obj);
boundFn();       // 1
```

**区别**：
- `call`：立即执行，参数逐个传入
- `apply`：立即执行，参数以数组形式传入
- `bind`：返回新函数，不立即执行

---

#### 3. **隐式绑定** - 对象调用
```javascript
const obj = {
  a: 1,
  fn: function() {
    console.log(this.a);
  }
};

obj.fn();  // 1 (this指向obj)
```

**隐式丢失**：
```javascript
const fn = obj.fn;
fn();  // undefined (this指向全局/undefined)
```

---

#### 4. **默认绑定**（最低优先级）
```javascript
function fn() {
  console.log(this.a);
}

var a = 1;
fn();  // 1 (非严格模式下this指向window)
       // undefined (严格模式下this为undefined)

// 严格模式
function fn() {
  'use strict';
  console.log(this);  // undefined
}
```

---

**箭头函数的this**：
- **不绑定自己的this**
- **继承外层作用域的this**
```javascript
const obj = {
  a: 1,
  fn: function() {
    const arrow = () => {
      console.log(this.a);
    };
    arrow();
  }
};

obj.fn();  // 1 (箭头函数的this继承自fn的this，即obj)

// 对比普通函数
const obj2 = {
  a: 1,
  fn: function() {
    function normal() {
      console.log(this.a);
    }
    normal();  // undefined (this指向全局)
  }
};

obj2.fn();
```

---

### 4.2 如何改变this指向？
**考点**：this应用场景

**三种方法**：

1. **call**
   ```javascript
   function fn(a, b) {
     console.log(this.name, a, b);
   }

   const obj = { name: 'Alice' };
   fn.call(obj, 1, 2);  // "Alice 1 2"
   ```

2. **apply**
   ```javascript
   fn.apply(obj, [1, 2]);  // "Alice 1 2"
   ```

3. **bind**
   ```javascript
   const boundFn = fn.bind(obj, 1, 2);
   boundFn();  // "Alice 1 2"

   // 柯里化应用
   const add = function(a, b) {
     return a + b;
   };
   const add5 = add.bind(null, 5);
   console.log(add5(3));  // 8
   ```

**手写call、apply、bind**（高频手写题）

**手写call**：
```javascript
Function.prototype.myCall = function(context, ...args) {
  // 处理context为null或undefined的情况
  context = context || (typeof window === 'undefined' ? global : window);

  // 将函数设为context的属性
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  // 执行函数
  const result = context[fnSymbol](...args);

  // 删除属性
  delete context[fnSymbol];

  return result;
};
```

**手写apply**：
```javascript
Function.prototype.myApply = function(context, args) {
  context = context || (typeof window === 'undefined' ? global : window);

  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  const result = context[fnSymbol](...(args || []));

  delete context[fnSymbol];

  return result;
};
```

**手写bind**：
```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this;

  return function boundFn(...newArgs) {
    // 如果作为构造函数调用，this指向新对象
    if (this instanceof boundFn) {
      return new fn(...args, ...newArgs);
    }
    // 否则使用指定的context
    return fn.apply(context, args.concat(newArgs));
  };
};

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const Alice = Person.myBind(null, 'Alice');
const alice = new Alice(18);
console.log(alice.name);  // "Alice"
console.log(alice.age);   // 18
```

---

## 5. 事件循环 {#event-loop}

### 5.1 什么是事件循环（Event Loop）？
**考点**：JavaScript执行机制核心

**事件循环定义**：
- JavaScript是**单线程**语言
- 通过事件循环机制实现异步操作
- 调用栈（Call Stack） + 任务队列（Task Queue） + 事件循环

**执行机制**：
```
1. 执行同步代码（进入调用栈）
2. 遇到异步任务，放入任务队列
3. 调用栈为空时，事件循环从任务队列取任务执行
4. 重复上述过程
```

**任务队列分类**：

1. **宏任务（Macro Task）**
   - `setTimeout`、`setInterval`
   - `requestAnimationFrame`（浏览器）
   - `setImmediate`（Node.js）
   - I/O、UI渲染

2. **微任务（Micro Task）**
   - `Promise.then/catch/finally`
   - `MutationObserver`（浏览器）
   - `process.nextTick()`（Node.js）
   - `queueMicrotask()`

**执行顺序**：
```
宏任务 → 微任务（清空） → 渲染 → 下一个宏任务
```

**代码示例**：
```javascript
console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步

// 输出：1 → 4 → 3 → 2
```

---

### 5.2 Node.js和浏览器的事件循环有什么区别？
**考点**：环境差异

**浏览器事件循环**：
```
宏任务队列 → 执行一个宏任务
            ↓
        执行所有微任务
            ↓
        渲染（如果需要）
            ↓
        下一个宏任务
```

**Node.js事件循环（v11+之前）**：
```
Timers（定时器）→ I/O callbacks → Idle, prepare →
Poll（轮询）→ Check（setImmediate）→ Close callbacks
```

**Node.js与浏览器的区别**：
1. **微任务执行时机**：
   - 浏览器：每个宏任务后执行所有微任务
   - Node.js（旧版本）：每个阶段结束后执行微任务

2. **`process.nextTick()`**：
   - Node.js特有，优先级高于`Promise`
   - 在当前操作完成后、事件循环继续之前执行

**代码示例（Node.js）**：
```javascript
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

// 输出不确定，取决于事件循环进入check阶段的时机
```

**Node.js v11+之后**：事件循环机制与浏览器保持一致

---

### 5.3 async/await的执行顺序？
**考点**：异步编程进阶

**async/await本质**：
- `async`函数返回`Promise`
- `await`相当于`Promise.then`

**执行顺序**：
```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

async1();

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出：
// script start
// async1 start
// async2
// script end
// promise1
// promise2
// async1 end
// setTimeout
```

**解析**：
1. `await async2()`相当于`async2().then(() => { console.log('async1 end'); })`
2. `await`后面的代码会被放入微任务队列
3. 执行顺序：同步 → 微任务（按顺序）→ 宏任务

---

## 6. Promise与异步编程 {#promise-async}

### 6.1 Promise是什么？有哪些状态？
**考点**：异步编程基础

**Promise定义**：
- 表示异步操作的最终完成或失败
- 有三种状态：
  1. **pending**（等待中）：初始状态
  2. **fulfilled**（已成功）：操作成功完成
  3. **rejected**（已失败）：操作失败

**状态转换**：
- `pending` → `fulfilled`：调用`resolve()`
- `pending` → `rejected`：调用`reject()`或抛出异常
- **状态一旦改变，不可逆转**

**基本用法**：
```javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('操作成功');
    } else {
      reject('操作失败');
    }
  }, 1000);
});

promise
  .then(result => {
    console.log(result);  // "操作成功"
  })
  .catch(error => {
    console.log(error);   // "操作失败"
  });
```

---

### 6.2 Promise的then链式调用原理？
**考点**：Promise链式调用

**then方法的特点**：
1. **返回新的Promise**
2. **可以链式调用**
3. **参数穿透**：如果没有提供对应处理函数，值会传递给下一个

**代码示例**：
```javascript
Promise.resolve(1)
  .then(res => {
    console.log(res);  // 1
    return 2;
  })
  .then(res => {
    console.log(res);  // 2
    return Promise.resolve(3);
  })
  .then(res => {
    console.log(res);  // 3
  });
```

**错误处理**：
```javascript
Promise.resolve(1)
  .then(res => {
    throw new Error('出错');
  })
  .then(res => {
    console.log(res);  // 不会执行
  })
  .catch(err => {
    console.log(err.message);  // "出错"
    return 4;
  })
  .then(res => {
    console.log(res);  // 4 (错误被捕获后，继续执行)
  });
```

**then穿透**：
```javascript
Promise.resolve(1)
  .then()          // 没有提供处理函数
  .then()          // 继续穿透
  .then(res => {
    console.log(res);  // 1
  });
```

---

### 6.3 如何手写Promise？
**考点**：高频手写题

**简化版Promise实现**：
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';  // 状态
    this.value = undefined;  // 成功的值
    this.reason = undefined; // 失败的原因
    this.onFulfilledCallbacks = [];  // 成功回调队列
    this.onRejectedCallbacks = [];   // 失败回调队列

    const resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = reason => {
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
    // 参数可选
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function'
      ? onRejected
      : err => { throw err };

    // 返回新的Promise
    const promise2 = new MyPromise((resolve, reject) => {
      // pending状态，将回调加入队列
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      }

      // fulfilled状态
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      }

      // rejected状态
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用检测
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  let called = false;

  // x是Promise
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          if (called) return;
          called = true;
          reject(err);
        });
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    // x是普通值
    resolve(x);
  }
}

// 测试
MyPromise.resolve = function(value) {
  return new MyPromise((resolve, reject) => {
    resolve(value);
  });
};

MyPromise.reject = function(reason) {
  return new MyPromise((resolve, reject) => {
    reject(reason);
  });
};

// 使用
MyPromise.resolve(1)
  .then(res => {
    console.log(res);  // 1
    return 2;
  })
  .then(res => {
    console.log(res);  // 2
  });
```

---

### 6.4 Promise.all、Promise.race、Promise.allSettled、Promise.any的区别？
**考点**：Promise静态方法

| 方法 | 描述 | 成功条件 | 失败条件 |
|-----|------|---------|---------|
| **Promise.all** | 所有Promise成功 | 所有都成功 | 任意一个失败 |
| **Promise.race** | 竞速 | 第一个完成（无论成功失败） | 第一个失败 |
| **Promise.allSettled** | 所有Promise完成 | 所有都完成（无论成功失败） | 永远不会失败 |
| **Promise.any** | 任意一个成功 | 任意一个成功 | 所有都失败 |

**代码示例**：

**Promise.all**：
```javascript
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(res => {
  console.log(res);  // [1, 2, 3]
});

Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => {
  console.log(err);  // "error" (只要有一个失败就失败)
});
```

**Promise.race**：
```javascript
Promise.race([
  new Promise((resolve) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve) => setTimeout(() => resolve(2), 500)),
  new Promise((resolve) => setTimeout(() => resolve(3), 2000))
]).then(res => {
  console.log(res);  // 2 (最快完成的)
});
```

**Promise.allSettled**：
```javascript
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(res => {
  console.log(res);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

**Promise.any**（ES2021）：
```javascript
Promise.any([
  Promise.reject('error1'),
  Promise.resolve(2),
  Promise.reject('error3')
]).then(res => {
  console.log(res);  // 2 (第一个成功的)
});

Promise.any([
  Promise.reject('error1'),
  Promise.reject('error2')
]).catch(err => {
  console.log(err);  // AggregateError (所有都失败)
});
```

**手写Promise.all**：
```javascript
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    const result = [];
    let count = 0;

    if (promises.length === 0) {
      return resolve(result);
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          result[index] = value;
          count++;
          if (count === promises.length) {
            resolve(result);
          }
        },
        reason => {
          reject(reason);
        }
      );
    });
  });
}
```

---

### 6.5 Generator函数是什么？如何使用？
**考点**：异步编程演进

**Generator函数特点**：
- 函数定义时使用`function*`
- 可以暂停和恢复执行
- 使用`yield`关键字暂停
- 返回迭代器对象

**基本用法**：
```javascript
function* gen() {
  console.log('开始');
  yield 1;
  console.log('继续');
  yield 2;
  console.log('结束');
  return 3;
}

const g = gen();
console.log(g.next());  // { value: 1, done: false }
console.log(g.next());  // { value: 2, done: false }
console.log(g.next());  // { value: 3, done: true }
console.log(g.next());  // { value: undefined, done: true }
```

**异步应用**：
```javascript
function* asyncGen() {
  const data1 = yield fetch('/api/data1');
  const data2 = yield fetch('/api/data2');
  return [data1, data2];
}

// 手动执行
const gen = asyncGen();
const promise1 = gen.next().value;
promise1.then(data1 => {
  const promise2 = gen.next(data1).value;
  promise2.then(data2 => {
    gen.next(data2);
  });
});

// 自动执行（co库原理）
function run(gen) {
  const g = gen();

  function next(data) {
    const result = g.next(data);
    if (result.done) return result.value;
    result.value.then(data => next(data));
  }

  next();
}

run(asyncGen);
```

**与async/await对比**：
```javascript
// Generator + co
function* fetchData() {
  const data1 = yield fetch('/api/data1');
  const data2 = yield fetch('/api/data2');
  return [data1, data2];
}

// async/await（语法糖）
async function fetchData() {
  const data1 = await fetch('/api/data1');
  const data2 = await fetch('/api/data2');
  return [data1, data2];
}
```

---

## 7. ES6+新特性 {#es6-features}

### 7.1 let、const和var的区别？
**考点**：变量声明方式

| 特性 | var | let | const |
|-----|-----|-----|-------|
| **作用域** | 函数作用域 | 块级作用域 | 块级作用域 |
| **变量提升** | ✅ | ✅（存在暂时性死区） | ✅（存在暂时性死区） |
| **重复声明** | ✅ | ❌ | ❌ |
| **重新赋值** | ✅ | ✅ | ❌（引用类型可修改属性） |
| **全局对象** | ✅（window） | ❌ | ❌ |

**代码示例**：
```javascript
// var - 函数作用域
if (true) {
  var a = 1;
}
console.log(a);  // 1

// let/const - 块级作用域
if (true) {
  let b = 2;
  const c = 3;
}
console.log(b);  // ReferenceError
console.log(c);  // ReferenceError

// 暂时性死区（TDZ）
console.log(d);  // ReferenceError
let d = 1;

// const的不可变性
const obj = { name: 'Alice' };
obj.name = 'Bob';  // ✅ 可以修改属性
obj = {};          // ❌ 不能重新赋值

const arr = [1, 2];
arr.push(3);       // ✅ 可以修改数组
arr = [];          // ❌ 不能重新赋值
```

---

### 7.2 箭头函数与普通函数的区别？
**考点**：箭头函数特性

| 特性 | 普通函数 | 箭头函数 |
|-----|---------|---------|
| **this绑定** | 动态绑定（调用时确定） | 静态绑定（继承外层this） |
| **arguments** | ✅ | ❌（使用rest参数） |
| **构造函数** | ✅ | ❌（没有prototype） |
| **generator** | ✅（function*） | ❌ |
| **简写语法** | ❌ | ✅（单参数、单表达式） |

**代码示例**：
```javascript
// this绑定
const obj = {
  name: 'Alice',
  normal: function() {
    console.log(this.name);  // "Alice"
  },
  arrow: () => {
    console.log(this.name);  // undefined（this继承外层，不是obj）
  }
};

obj.normal();  // "Alice"
obj.arrow();   // undefined

// arguments
function normal() {
  console.log(arguments);  // [1, 2, 3]
}
normal(1, 2, 3);

const arrow = () => {
  console.log(arguments);  // ReferenceError
};
arrow(1, 2, 3);

// 使用rest参数替代
const arrow2 = (...args) => {
  console.log(args);  // [1, 2, 3]
};

// 构造函数
function Person(name) {
  this.name = name;
}
const p1 = new Person('Alice');  // ✅

const ArrowPerson = (name) => {
  this.name = name;
};
const p2 = new ArrowPerson('Bob');  // ❌ TypeError

// 简写语法
const add = (a, b) => a + b;  // 单表达式，省略{}
const square = x => x * x;    // 单参数，省略()

// 返回对象需要括号
const createObj = () => ({ name: 'Alice' });
```

---

### 7.3 解构赋值的用法？
**考点**：ES6语法糖

**数组解构**：
```javascript
const [a, b, c] = [1, 2, 3];
console.log(a, b, c);  // 1, 2, 3

// 跳过元素
const [x, , z] = [1, 2, 3];
console.log(x, z);  // 1, 3

// 默认值
const [m = 1, n = 2] = [5];
console.log(m, n);  // 5, 2

// 剩余参数
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [2, 3, 4, 5]
```

**对象解构**：
```javascript
const { name, age } = { name: 'Alice', age: 18 };
console.log(name, age);  // "Alice", 18

// 重命名
const { name: userName, age: userAge } = { name: 'Alice', age: 18 };
console.log(userName, userAge);  // "Alice", 18

// 默认值
const { name = 'Guest', age = 0 } = { name: 'Alice' };
console.log(name, age);  // "Alice", 0

// 嵌套解构
const { user: { name, age } } = { user: { name: 'Alice', age: 18 } };
console.log(name, age);  // "Alice", 18

// 剩余参数
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
console.log(rest);  // { c: 3, d: 4 }
```

**函数参数解构**：
```javascript
function getUser({ name, age }) {
  console.log(name, age);
}
getUser({ name: 'Alice', age: 18 });

// 默认值
function createLink({ text, url = '#' }) {
  return `<a href="${url}">${text}</a>`;
}
```

---

### 7.4 模板字符串的用法？
**考点**：字符串新特性

**基本用法**：
```javascript
const name = 'Alice';
const age = 18;

// 嵌入变量
const str = `Hello, ${name}! You are ${age} years old.`;
console.log(str);  // "Hello, Alice! You are 18 years old."

// 多行字符串
const multiLine = `
  Line 1
  Line 2
  Line 3
`;
console.log(multiLine);

// 表达式
const price = 100;
const quantity = 3;
console.log(`Total: ${price * quantity}`);  // "Total: 300"

// 函数调用
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(`${greet('Alice')}`);  // "Hello, Alice!"
```

**标签模板**（高级用法）：
```javascript
function highlight(strings, ...values) {
  let result = '';
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      result += `<span class="highlight">${values[i]}</span>`;
    }
  });
  return result;
}

const name = 'Alice';
const age = 18;
const output = highlight`Name: ${name}, Age: ${age}`;
console.log(output);
// "Name: <span class="highlight">Alice</span>, Age: <span class="highlight">18</span>"
```

---

### 7.5 扩展运算符（...）的用法？
**考点**：展开与收集

**数组操作**：
```javascript
// 展开数组
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2);  // [1, 2, 3, 4, 5]

// 浅拷贝
const arr3 = [...arr1];
arr3.push(4);
console.log(arr1);  // [1, 2, 3]
console.log(arr3);  // [1, 2, 3, 4]

// 合并数组
const arr4 = [1, 2];
const arr5 = [3, 4];
const arr6 = [...arr4, ...arr5];
console.log(arr6);  // [1, 2, 3, 4]

// 剩余参数（收集）
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(rest);   // [2, 3, 4, 5]
```

**对象操作**：
```javascript
// 展开对象
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2);  // { a: 1, b: 2, c: 3 }

// 浅拷贝
const obj3 = { ...obj1 };
obj3.a = 10;
console.log(obj1);  // { a: 1, b: 2 }
console.log(obj3);  // { a: 10, b: 2 }

// 合并对象（后者覆盖前者）
const obj4 = { a: 1, b: 2 };
const obj5 = { b: 3, c: 4 };
const obj6 = { ...obj4, ...obj5 };
console.log(obj6);  // { a: 1, b: 3, c: 4 }

// 剩余参数（收集）
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a);    // 1
console.log(rest); // { b: 2, c: 3 }
```

**函数参数**：
```javascript
// 展开参数
function sum(a, b, c) {
  return a + b + c;
}
const nums = [1, 2, 3];
console.log(sum(...nums));  // 6

// 剩余参数（收集）
function sumAll(...numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}
console.log(sumAll(1, 2, 3, 4, 5));  // 15
```

**注意**：扩展运算符是**浅拷贝**，嵌套对象仍共享引用

---

### 7.6 Class类的用法？
**考点**：面向对象编程

**基本语法**：
```javascript
class Person {
  // 构造函数
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // 实例方法
  sayHi() {
    console.log(`Hi, I'm ${this.name}`);
  }

  // 静态方法
  static create(name, age) {
    return new Person(name, age);
  }

  // getter
  get info() {
    return `${this.name} (${this.age})`;
  }

  // setter
  set name(value) {
    if (typeof value !== 'string') {
      throw new Error('Name must be a string');
    }
    this._name = value;
  }

  get name() {
    return this._name;
  }
}

// 使用
const person = new Person('Alice', 18);
person.sayHi();              // "Hi, I'm Alice"
console.log(person.info);    // "Alice (18)"

const p2 = Person.create('Bob', 20);

// 继承
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);  // 调用父类构造函数
    this.grade = grade;
  }

  // 重写父类方法
  sayHi() {
    super.sayHi();  // 调用父类方法
    console.log(`I'm in grade ${this.grade}`);
  }
}

const student = new Student('Charlie', 16, 10);
student.sayHi();
// "Hi, I'm Charlie"
// "I'm in grade 10"
```

**Class的本质**：
- Class只是**语法糖**，底层还是基于原型
- `constructor`对应构造函数
- 实例方法在`prototype`上
- 静态方法在构造函数本身上

**验证**：
```javascript
console.log(typeof Person);  // "function"
console.log(Person.prototype.constructor === Person);  // true
console.log(student instanceof Student);  // true
console.log(student instanceof Person);   // true
```

---

### 7.7 Map和Set是什么？
**考点**：新的数据结构

**Set** - 集合（值唯一）：
```javascript
const set = new Set([1, 2, 3, 2, 1]);
console.log(set);  // Set(3) { 1, 2, 3 }

// 常用方法
set.add(4);           // 添加
set.delete(1);        // 删除
set.has(2);           // 判断存在
set.clear();          // 清空
set.size;             // 大小

// 数组去重
const arr = [1, 2, 3, 2, 1];
const unique = [...new Set(arr)];  // [1, 2, 3]

// 并集、交集、差集
const set1 = new Set([1, 2, 3]);
const set2 = new Set([2, 3, 4]);

// 并集
const union = new Set([...set1, ...set2]);  // {1, 2, 3, 4}

// 交集
const intersection = new Set([...set1].filter(x => set2.has(x)));  // {2, 3}

// 差集
const difference = new Set([...set1].filter(x => !set2.has(x)));   // {1}
```

**Map** - 键值对集合（任何类型都可以作为键）：
```javascript
const map = new Map();

// 任何类型都可以作为键
map.set('name', 'Alice');
map.set(1, 'number');
map.set(true, 'boolean');
map.set({ key: 'object' }, 'object value');

// 常用方法
map.get('name');      // "Alice"
map.has('name');      // true
map.delete('name');   // 删除
map.clear();          // 清空
map.size;             // 大小

// 遍历
map.forEach((value, key) => {
  console.log(key, value);
});

// 转换为数组
const arr = [...map];  // [ ['name', 'Alice'], [1, 'number'], ... ]

// 对比Object
// Map优势：
// 1. 键可以是任何类型
// 2. 可以直接获取大小（size）
// 3. 性能更好（频繁增删）
// 4. 保持插入顺序
```

---

### 7.8 Proxy和Reflect是什么？
**考点**：元编程

**Proxy（代理）**：
- 拦截并自定义对象的基本操作

**基本用法**：
```javascript
const target = {
  name: 'Alice',
  age: 18
};

const handler = {
  // 拦截读取
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    return prop in target ? target[prop] : 'default';
  },

  // 拦截设置
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} to ${value}`);
    target[prop] = value;
    return true;
  },

  // 拦截删除
  deleteProperty(target, prop) {
    console.log(`Deleting ${prop}`);
    delete target[prop];
    return true;
  },

  // 拦截in操作符
  has(target, prop) {
    console.log(`Checking if ${prop} in object`);
    return prop in target;
  },

  // 拦截for...in
  ownKeys(target) {
    console.log('Getting own keys');
    return Object.keys(target);
  }
};

const proxy = new Proxy(target, handler);

proxy.name;       // "Getting name" → "Alice"
proxy.gender;     // "Getting gender" → "default"
proxy.age = 20;   // "Setting age to 20"
delete proxy.age; // "Deleting age"
'name' in proxy;  // "Checking if name in object" → true
```

**应用场景**：
1. **数据验证**
   ```javascript
   const validator = {
     set(target, prop, value) {
       if (prop === 'age' && typeof value !== 'number') {
         throw new Error('Age must be a number');
       }
       target[prop] = value;
       return true;
     }
   };

   const person = new Proxy({}, validator);
   person.age = '18';  // Error: Age must be a number
   ```

2. **双向绑定（Vue3响应式原理）**
   ```javascript
   function reactive(target) {
     return new Proxy(target, {
       get(target, key, receiver) {
         console.log(`Getting ${key}`);
         return Reflect.get(target, key, receiver);
       },
       set(target, key, value, receiver) {
         console.log(`Setting ${key} to ${value}`);
         const result = Reflect.set(target, key, value, receiver);
         // 触发更新
         updateView();
         return result;
       }
     });
   }
   ```

3. **缓存/计算属性**
   ```javascript
   const cache = {};
   const handler = {
     get(target, prop) {
       if (prop in cache) {
         return cache[prop];
       }
       const value = target[prop];
       cache[prop] = value;
       return value;
     }
   };
   ```

**Reflect**：
- 提供拦截操作的默认行为
- 与Proxy方法一一对应
- 返回操作结果（而不是抛出异常）

**为什么需要Reflect**：
```javascript
const obj = {};

// 传统方式
Object.defineProperty(obj, 'name', { value: 'Alice' });

// 使用Reflect（推荐）
Reflect.defineProperty(obj, 'name', { value: 'Alice' });  // 返回true/false

// 与Proxy配合使用
const proxy = new Proxy(obj, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    return Reflect.set(target, prop, value, receiver);
  }
});
```

**Reflect常用方法**：
- `Reflect.get(target, propertyKey[, receiver])`
- `Reflect.set(target, propertyKey, value[, receiver])`
- `Reflect.has(target, propertyKey)` - 对应`in`操作符
- `Reflect.deleteProperty(target, propertyKey)` - 对应`delete`
- `Reflect.construct(target, argumentsList[, newTarget])` - 对应`new`
- `Reflect.apply(target, thisArgument, argumentsList)` - 对应`Function.prototype.apply`

---

## 8. 模块化 {#module}

### 8.1 JavaScript有哪些模块化方案？
**考点**：模块化演进

**模块化方案对比**：

| 方案 | 年份 | 特点 | 使用场景 |
|-----|------|------|---------|
| **IIFE** | - | 立即执行函数，创建私有作用域 | 早期 |
| **CommonJS** | 2009 | `require/module.exports`，同步加载 | Node.js |
| **AMD** | 2009 | `define/require`，异步加载 | 浏览器（RequireJS） |
| **CMD** | 2011 | `define/require`，按需加载 | 浏览器（SeaJS） |
| **UMD** | 2013 | 兼容CommonJS和AMD | 通用库 |
| **ES6 Module** | 2015 | `import/export`，静态分析 | 现代 |

**CommonJS（Node.js）**：
```javascript
// 导出
// a.js
module.exports = { name: 'Alice' };
// 或
exports.name = 'Alice';

// 导入
// b.js
const a = require('./a.js');
console.log(a.name);  // "Alice"

// 特点：
// 1. 同步加载
// 2. 值拷贝（不是引用）
// 3. 运行时加载
```

**ES6 Module**：
```javascript
// 导出
// a.js
export const name = 'Alice';
export function sayHi() {
  console.log('Hi');
}
export default { age: 18 };

// 导入
// b.js
import { name, sayHi } from './a.js';
import info from './a.js';  // default导出

// 特点：
// 1. 异步加载（浏览器）
// 2. 引用绑定（不是拷贝）
// 3. 编译时加载（静态分析）
// 4. 严格模式（默认）
```

**关键区别**：

1. **加载方式**：
   - CommonJS：运行时加载，同步
   - ES6 Module：编译时加载，异步

2. **值的引用**：
   ```javascript
   // CommonJS - 值拷贝
   // a.js
   let count = 0;
   exports.count = count;
   exports.increment = () => count++;

   // b.js
   const a = require('./a');
   console.log(a.count);  // 0
   a.increment();
   console.log(a.count);  // 0 (值拷贝，不会改变)

   // ES6 Module - 引用绑定
   // a.js
   export let count = 0;
   export const increment = () => count++;

   // b.js
   import { count, increment } from './a';
   console.log(count);  // 0
   increment();
   console.log(count);  // 1 (引用绑定，会改变)
   ```

3. **this指向**：
   - CommonJS：`this`指向当前模块
   - ES6 Module：`this`为`undefined`

4. **循环引用**：
   - CommonJS：返回已执行部分
   - ES6 Module：不会执行，保持引用

---

### 8.2 ES6模块和CommonJS的区别？
**考点**：模块化深入

**详细对比**：

| 特性 | CommonJS | ES6 Module |
|-----|---------|-----------|
| **加载方式** | 运行时加载（动态） | 编译时加载（静态） |
| **导出方式** | `module.exports`、`exports` | `export`、`export default` |
| **导入方式** | `require()` | `import` |
| **值的性质** | 值拷贝 | 引用绑定 |
| **this** | 指向模块本身 | `undefined` |
| **循环引用** | 返回已执行部分 | 保持引用（不会执行） |
| **异步支持** | 不支持（Node.js同步） | 原生支持`import()` |
| **顶层await** | 不支持 | 支持（ES2022） |

**循环引用示例**：

**CommonJS**：
```javascript
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done =', b.done);
exports.done = true;
console.log('a done');

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done =', a.done);
exports.done = true;
console.log('b done');

// main.js
const a = require('./a.js');
// 输出：
// a starting
// b starting
// in b, a.done = false (a还没执行完)
// b done
// in a, b.done = true
// a done
```

**ES6 Module**：
```javascript
// a.js
console.log('a starting');
export let done = false;
import { done as bDone } from './b.js';
console.log('in a, b.done =', bDone);
done = true;
console.log('a done');

// b.js
console.log('b starting');
export let done = false;
import { done as aDone } from './a.js';
console.log('in b, a.done =', aDone);
done = true;
console.log('b done');

// 输出：
// a starting
// b starting
// in b, a.done = false
// b done
// in a, b.done = true
// a done
```

**动态导入**：
```javascript
// CommonJS
if (condition) {
  const module = require('./module');
}

// ES6 Module - 使用import()
if (condition) {
  import('./module').then(module => {
    // 使用module
  });
}

// 或使用await
async function loadModule() {
  const module = await import('./module');
  // 使用module
}
```

---

## 9. 手写代码 {#handwriting}

### 9.1 手写防抖（debounce）和节流（throttle）
**考点**：性能优化高频手写

**防抖（Debounce）**：
```javascript
function debounce(fn, delay) {
  let timer = null;

  return function(...args) {
    const context = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

// 立即执行版
function debounceImmediate(fn, delay, immediate) {
  let timer = null;

  return function(...args) {
    const context = this;
    const callNow = immediate && !timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(context, args);
    }
  };
}

// 使用
const search = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 500);

input.addEventListener('input', (e) => search(e.target.value));
```

**节流（Throttle）**：
```javascript
// 时间戳版
function throttle(fn, delay) {
  let lastTime = 0;

  return function(...args) {
    const context = this;
    const now = Date.now();

    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(context, args);
    }
  };
}

// 定时器版
function throttleTimer(fn, delay) {
  let timer = null;

  return function(...args) {
    const context = this;

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, delay);
    }
  };
}

// 混合版（更实用）
function throttleHybrid(fn, delay) {
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const context = this;
    const now = Date.now();
    const remaining = delay - (now - lastTime);

    if (remaining <= 0 || remaining > delay) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(context, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(context, args);
      }, remaining);
    }
  };
}

// 使用
const scrollHandler = throttle(() => {
  console.log('滚动');
}, 1000);

window.addEventListener('scroll', scrollHandler);
```

---

### 9.2 手写深拷贝
**考点**：对象操作高频手写

**基础版**（有问题）：
```javascript
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 问题：
// 1. 无法处理函数、undefined、Symbol
// 2. 无法处理循环引用
// 3. 无法处理Date、RegExp等特殊对象
// 4. 无法处理Map、Set
```

**完整版**：
```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 非对象或null直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 循环引用检测
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Map
  if (obj instanceof Map) {
    const map = new Map();
    hash.set(obj, map);
    obj.forEach((value, key) => {
      map.set(key, deepClone(value, hash));
    });
    return map;
  }

  // Set
  if (obj instanceof Set) {
    const set = new Set();
    hash.set(obj, set);
    obj.forEach(value => {
      set.add(deepClone(value, hash));
    });
    return set;
  }

  // Array
  const isArray = Array.isArray(obj);
  const cloneObj = isArray ? [] : {};

  // 缓存引用
  hash.set(obj, cloneObj);

  // 处理普通对象和数组
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }

  return cloneObj;
}

// 测试
const obj = {
  name: 'Alice',
  age: 18,
  hobbies: ['reading', 'music'],
  address: {
    city: 'Beijing'
  },
  date: new Date(),
  regex: /\d+/,
  func: function() { console.log('hello'); },
  symbol: Symbol('test')
};

const cloned = deepClone(obj);
console.log(cloned);
```

**优化版**（使用structuredClone）：
```javascript
// 浏览器原生API（Chrome 98+）
const cloned = structuredClone(obj);

// 兼容性处理
function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  // 回退到自定义实现
  return customDeepClone(obj);
}
```

---

### 9.3 手写instanceof
**考点**：原型链理解

```javascript
function myInstanceof(left, right) {
  // 基本类型直接返回false
  if (typeof left !== 'object' || left === null) {
    return false;
  }

  let proto = left.__proto__;
  const prototype = right.prototype;

  while (true) {
    if (proto === null) return false;
    if (proto === prototype) return true;
    proto = proto.__proto__;
  }
}

// 测试
console.log(myInstanceof([], Array));        // true
console.log(myInstanceof({}, Object));       // true
console.log(myInstanceof(123, Number));      // false
console.log(myInstanceof(null, Object));     // false
console.log(myInstanceof(undefined, Object)); // false
```

---

### 9.4 手写new
**考点**：构造函数原理

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个空对象，继承构造函数的原型
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数，绑定this
  const result = constructor.apply(obj, args);

  // 3. 返回结果
  // 如果构造函数返回对象或函数，返回该对象
  // 否则返回新创建的对象
  return (typeof result === 'object' && result !== null) || typeof result === 'function'
    ? result
    : obj;
}

// 测试
function Person(name) {
  this.name = name;
}

Person.prototype.sayHi = function() {
  console.log('Hi, ' + this.name);
};

const alice = myNew(Person, 'Alice');
alice.sayHi();  // "Hi, Alice"
console.log(alice instanceof Person);  // true
```

---

### 9.5 手写call、apply、bind
**考点**：this绑定高频手写

**手写call**：
```javascript
Function.prototype.myCall = function(context, ...args) {
  // 处理context为null或undefined的情况
  if (context === null || context === undefined) {
    context = typeof window === 'undefined' ? global : window;
  }

  // 将函数设为context的属性
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  // 执行函数
  const result = context[fnSymbol](...args);

  // 删除属性
  delete context[fnSymbol];

  return result;
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };
greet.myCall(person, 'Hello', '!');  // "Hello, Alice!"
```

**手写apply**：
```javascript
Function.prototype.myApply = function(context, args) {
  if (context === null || context === undefined) {
    context = typeof window === 'undefined' ? global : window;
  }

  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;

  const result = context[fnSymbol](...(args || []));

  delete context[fnSymbol];

  return result;
};

// 测试
const numbers = [1, 2, 3, 4, 5];
console.log(Math.max.myApply(null, numbers));  // 5
```

**手写bind**：
```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this;

  // 返回一个新函数
  function boundFn(...newArgs) {
    // 如果作为构造函数调用（new boundFn()），this指向新对象
    // 否则使用指定的context
    if (this instanceof boundFn) {
      return new fn(...args, ...newArgs);
    }
    return fn.apply(context, args.concat(newArgs));
  }

  // 维护原型链
  boundFn.prototype = Object.create(fn.prototype);

  return boundFn;
};

// 测试
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };
const greetAlice = greet.myBind(person, 'Hello');
greetAlice('!');  // "Hello, Alice!"

// 作为构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const Alice = Person.myBind(null, 'Alice');
const alice = new Alice(18);
console.log(alice.name);  // "Alice"
console.log(alice.age);   // 18
```

---

### 9.6 手写Promise
**考点**：异步编程核心手写

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';       // 状态：pending/fulfilled/rejected
    this.value = undefined;       // 成功的值
    this.reason = undefined;      // 失败的原因
    this.onFulfilledCallbacks = [];  // 成功回调队列
    this.onRejectedCallbacks = [];   // 失败回调队列

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
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
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 参数可选，提供默认处理
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function'
      ? onRejected
      : err => { throw err };

    // 返回新的Promise
    const promise2 = new MyPromise((resolve, reject) => {
      // pending状态，将回调加入队列
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }

      // fulfilled状态
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      // rejected状态
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 循环引用检测
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise'));
  }

  let called = false;

  // x是Promise
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          if (called) return;
          called = true;
          reject(err);
        });
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // x是普通值
    resolve(x);
  }
}

// 静态方法
MyPromise.resolve = function(value) {
  return new MyPromise((resolve, reject) => {
    resolve(value);
  });
};

MyPromise.reject = function(reason) {
  return new MyPromise((resolve, reject) => {
    reject(reason);
  });
};

MyPromise.all = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    const result = [];
    let count = 0;

    if (promises.length === 0) {
      return resolve(result);
    }

    promises.forEach((promise, index) => {
      MyPromise.resolve(promise).then(
        value => {
          result[index] = value;
          count++;
          if (count === promises.length) {
            resolve(result);
          }
        },
        reason => {
          reject(reason);
        }
      );
    });
  });
};

MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }

    promises.forEach(promise => {
      MyPromise.resolve(promise).then(
        value => resolve(value),
        reason => reject(reason)
      );
    });
  });
};

// 测试
MyPromise.resolve(1)
  .then(res => {
    console.log(res);  // 1
    return 2;
  })
  .then(res => {
    console.log(res);  // 2
    throw new Error('test error');
  })
  .catch(err => {
    console.log(err.message);  // "test error"
    return 3;
  })
  .then(res => {
    console.log(res);  // 3
  });

// 测试Promise.all
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  MyPromise.resolve(3)
]).then(res => {
  console.log(res);  // [1, 2, 3]
});
```

---

### 9.7 手写数组方法（map、filter、reduce等）
**考点**：数组操作高频手写

**手写map**：
```javascript
Array.prototype.myMap = function(callback, thisArg) {
  if (this === null || this === undefined) {
    throw new TypeError('Cannot read property \'myMap\' of null or undefined');
  }

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = new Array(len);

  for (let i = 0; i < len; i++) {
    if (i in arr) {
      result[i] = callback.call(thisArg, arr[i], i, arr);
    }
  }

  return result;
};

// 测试
const arr = [1, 2, 3];
const doubled = arr.myMap(x => x * 2);
console.log(doubled);  // [2, 4, 6]
```

**手写filter**：
```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  if (this === null || this === undefined) {
    throw new TypeError('Cannot read property \'myFilter\' of null or undefined');
  }

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const arr = Object(this);
  const len = arr.length >>> 0;
  const result = [];

  for (let i = 0; i < len; i++) {
    if (i in arr) {
      const element = arr[i];
      if (callback.call(thisArg, element, i, arr)) {
        result.push(element);
      }
    }
  }

  return result;
};

// 测试
const arr = [1, 2, 3, 4, 5];
const even = arr.myFilter(x => x % 2 === 0);
console.log(even);  // [2, 4]
```

**手写reduce**：
```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  if (this === null || this === undefined) {
    throw new TypeError('Cannot read property \'myReduce\' of null or undefined');
  }

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  const arr = Object(this);
  const len = arr.length >>> 0;
  let accumulator = initialValue;
  let startIndex = 0;

  // 没有提供初始值，使用第一个元素
  if (arguments.length < 2) {
    if (len === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = arr[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < len; i++) {
    if (i in arr) {
      accumulator = callback(accumulator, arr[i], i, arr);
    }
  }

  return accumulator;
};

// 测试
const arr = [1, 2, 3, 4, 5];
const sum = arr.myReduce((acc, cur) => acc + cur, 0);
console.log(sum);  // 15

const max = arr.myReduce((acc, cur) => Math.max(acc, cur));
console.log(max);  // 5
```

**手写flat**：
```javascript
Array.prototype.myFlat = function(depth = 1) {
  const result = [];

  const flatten = (arr, currentDepth) => {
    for (const item of arr) {
      if (Array.isArray(item) && currentDepth < depth) {
        flatten(item, currentDepth + 1);
      } else {
        result.push(item);
      }
    }
  };

  flatten(this, 0);
  return result;
};

// 测试
const arr = [1, [2, [3, [4]]]];
console.log(arr.myFlat());       // [1, 2, [3, [4]]]
console.log(arr.myFlat(2));      // [1, 2, 3, [4]]
console.log(arr.myFlat(Infinity)); // [1, 2, 3, 4]
```

---

### 9.8 手写发布订阅模式（EventEmitter）
**考点**：设计模式高频手写

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return this;  // 支持链式调用
  }

  // 订阅一次（执行后自动取消）
  once(eventName, callback) {
    const wrappedCallback = (...args) => {
      callback(...args);
      this.off(eventName, wrappedCallback);
    };
    this.on(eventName, wrappedCallback);
    return this;
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events[eventName]) return this;

    if (!callback) {
      // 没有指定callback，清空该事件所有监听
      delete this.events[eventName];
      return this;
    }

    const callbacks = this.events[eventName];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    return this;
  }

  // 触发事件
  emit(eventName, ...args) {
    if (!this.events[eventName]) return false;

    const callbacks = [...this.events[eventName]];  // 复制一份，防止回调中修改
    callbacks.forEach(callback => {
      callback(...args);
    });

    return true;
  }

  // 获取事件监听数量
  listenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }
}

// 测试
const emitter = new EventEmitter();

// 订阅
emitter.on('click', () => console.log('点击了'));
emitter.on('click', (x, y) => console.log(`坐标: ${x}, ${y}`));

// 触发
emitter.emit('click', 100, 200);
// "点击了"
// "坐标: 100, 200"

// 只执行一次
emitter.once('load', () => console.log('加载完成'));
emitter.emit('load');  // "加载完成"
emitter.emit('load');  // 不会再执行

// 取消订阅
const handler = () => console.log('滚动');
emitter.on('scroll', handler);
emitter.emit('scroll');  // "滚动"
emitter.off('scroll', handler);
emitter.emit('scroll');  // 不会执行
```

---

### 9.9 手写ajax/fetch
**考点**：网络请求高频手写

**手写ajax（XMLHttpRequest）**：
```javascript
function ajax(options) {
  // 默认配置
  const defaults = {
    url: '',
    method: 'GET',
    data: null,
    headers: {},
    timeout: 0,
    dataType: 'json'
  };

  // 合并配置
  options = Object.assign({}, defaults, options);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 超时处理
    if (options.timeout > 0) {
      xhr.timeout = options.timeout;
      xhr.ontimeout = () => reject(new Error('Request timeout'));
    }

    // 状态变化
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {  // 请求完成
        if (xhr.status >= 200 && xhr.status < 300) {
          // 成功
          let result = xhr.responseText;
          if (options.dataType === 'json') {
            try {
              result = JSON.parse(result);
            } catch (e) {
              return reject(e);
            }
          }
          resolve(result);
        } else {
          // 失败
          reject(new Error(`HTTP error: ${xhr.status}`));
        }
      }
    };

    // 错误处理
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new Error('Request aborted'));

    // 准备请求
    let url = options.url;
    const method = options.method.toUpperCase();

    // 处理GET请求的参数
    if (method === 'GET' && options.data) {
      const params = Object.keys(options.data)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.data[key])}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + params;
    }

    // 打开连接
    xhr.open(method, url, true);

    // 设置请求头
    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    // 设置Content-Type
    if (method === 'POST' && !options.headers['Content-Type']) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    // 发送请求
    let sendData = options.data;
    if (method === 'POST' && typeof options.data === 'object') {
      sendData = JSON.stringify(options.data);
    }

    xhr.send(sendData);
  });
}

// 使用
ajax({
  url: '/api/users',
  method: 'GET',
  data: { page: 1, size: 10 },
  timeout: 5000
})
.then(data => console.log(data))
.catch(error => console.error(error));

ajax({
  url: '/api/users',
  method: 'POST',
  data: { name: 'Alice', age: 18 },
  headers: {
    'Authorization': 'Bearer token'
  }
})
.then(data => console.log(data))
.catch(error => console.error(error));
```

**手写简易fetch**：
```javascript
function myFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase();
    const headers = options.headers || {};
    let body = options.body;

    // 处理GET请求参数
    if (method === 'GET' && body) {
      const params = Object.keys(body)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + params;
      body = null;
    }

    fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      ...options
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => resolve(data))
    .catch(error => reject(error));
  });
}

// 使用
myFetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: { name: 'Alice' }
})
.then(data => console.log(data))
.catch(error => console.error(error));
```

---

## 10. 性能优化 {#performance}

### 10.1 内存泄漏的常见原因和解决方法？
**考点**：性能优化核心

**内存泄漏定义**：已分配的内存由于某种原因无法释放，造成内存浪费

**常见原因**：

1. **全局变量**
   ```javascript
   function create() {
     globalVar = {};  // 没有使用var/let/const，成为全局变量
   }
   // 解决：使用严格模式 'use strict'
   ```

2. **未清除的定时器**
   ```javascript
   // ❌ 问题
   setInterval(() => {
     const node = document.createElement('div');
     document.body.appendChild(node);
   }, 1000);

   // ✅ 解决
   let timer = setInterval(() => {
     // ...
   }, 1000);

   // 组件卸载时清除
   clearInterval(timer);
   ```

3. **闭包引用**
   ```javascript
   function outer() {
     const largeData = new Array(1000000).fill(0);

     return function inner() {
       console.log('do something');
     };
   }

   const fn = outer();
   // largeData被闭包引用，无法释放
   ```

4. **DOM引用**
   ```javascript
   // ❌ 问题
   const elements = {
     button: document.getElementById('btn')
   };

   // 移除DOM节点，但引用还在
   elements.button.remove();
   // elements.button 仍然持有引用

   // ✅ 解决
   delete elements.button;
   ```

5. **事件监听器未移除**
   ```javascript
   // ❌ 问题
   const handler = () => console.log('click');
   element.addEventListener('click', handler);

   // 移除元素时，没有移除监听器
   element.remove();

   // ✅ 解决
   element.addEventListener('click', handler);
   // ...
   element.removeEventListener('click', handler);
   element.remove();
   ```

6. **控制台日志**
   ```javascript
   // ❌ 问题
   console.log(largeObject);  // 浏览器控制台会保留引用
   ```

**检测工具**：
- Chrome DevTools → Memory → Heap Snapshot
- `performance.memory` API

---

### 10.2 如何优化长列表渲染？
**考点**：性能优化实践

**问题**：大量DOM节点导致渲染慢、内存占用高

**解决方案**：

1. **虚拟滚动（Virtual Scrolling）**
   ```javascript
   class VirtualList {
     constructor(container, total, itemHeight) {
       this.container = container;
       this.total = total;
       this.itemHeight = itemHeight;
       this.viewportHeight = container.clientHeight;
       this.startIndex = 0;
       this.endIndex = 0;

       this.init();
     }

     init() {
       // 创建滚动容器
       const wrapper = document.createElement('div');
       wrapper.style.height = `${this.total * this.itemHeight}px`;
       wrapper.style.position = 'relative';

       // 创建可见区域容器
       this.visibleContainer = document.createElement('div');
       this.visibleContainer.style.position = 'absolute';
       this.visibleContainer.style.top = '0';
       this.visibleContainer.style.left = '0';
       this.visibleContainer.style.width = '100%';

       wrapper.appendChild(this.visibleContainer);
       this.container.appendChild(wrapper);

       // 监听滚动
       this.container.addEventListener('scroll', () => this.update());

       this.update();
     }

     update() {
       const scrollTop = this.container.scrollTop;
       const viewportCount = Math.ceil(this.viewportHeight / this.itemHeight);

       this.startIndex = Math.floor(scrollTop / this.itemHeight);
       this.endIndex = Math.min(this.startIndex + viewportCount, this.total);

       // 更新可见区域
       this.visibleContainer.innerHTML = '';
       this.visibleContainer.style.top = `${this.startIndex * this.itemHeight}px`;

       for (let i = this.startIndex; i < this.endIndex; i++) {
         const item = document.createElement('div');
         item.style.height = `${this.itemHeight}px`;
         item.textContent = `Item ${i}`;
         this.visibleContainer.appendChild(item);
       }
     }
   }

   // 使用
   new VirtualList(document.getElementById('container'), 100000, 40);
   ```

2. **分页加载**
   ```javascript
   let currentPage = 1;
   const pageSize = 20;

   async function loadMore() {
     const data = await fetch(`/api/items?page=${currentPage}&size=${pageSize}`);
     const items = await data.json();

     // 渲染
     renderItems(items);

     currentPage++;
   }

   // 滚动到底部加载更多
   window.addEventListener('scroll', () => {
     if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
       loadMore();
     }
   });
   ```

3. **Intersection Observer（懒加载）**
   ```javascript
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         loadItem(entry.target.dataset.id);
         observer.unobserve(entry.target);
       }
     });
   }, { threshold: 0.1 });

   document.querySelectorAll('.list-item').forEach(item => {
     observer.observe(item);
   });
   ```

---

### 10.3 如何优化函数执行性能？
**考点**：性能优化实践

**优化策略**：

1. **防抖和节流**（见9.1节）

2. **记忆化（Memoization）**
   ```javascript
   function memoize(fn) {
     const cache = new Map();

     return function(...args) {
       const key = JSON.stringify(args);

       if (cache.has(key)) {
         return cache.get(key);
       }

       const result = fn.apply(this, args);
       cache.set(key, result);
       return result;
     };
   }

   // 使用
   const fibonacci = memoize(function(n) {
     if (n <= 1) return n;
     return fibonacci(n - 1) + fibonacci(n - 2);
   });

   console.log(fibonacci(40));  // 快速计算
   ```

3. **使用Web Worker处理密集计算**
   ```javascript
   // main.js
   const worker = new Worker('worker.js');
   worker.postMessage({ data: [1, 2, 3, 4, 5] });

   worker.onmessage = (e) => {
     console.log('结果:', e.data);
   };

   // worker.js
   self.onmessage = (e) => {
     const result = e.data.data.reduce((sum, num) => sum + num, 0);
     self.postMessage({ result });
   };
   ```

4. **避免频繁操作DOM**
   ```javascript
   // ❌ 不好
   for (let i = 0; i < 1000; i++) {
     const div = document.createElement('div');
     div.textContent = i;
     document.body.appendChild(div);
   }

   // ✅ 好
   const fragment = document.createDocumentFragment();
   for (let i = 0; i < 1000; i++) {
     const div = document.createElement('div');
     div.textContent = i;
     fragment.appendChild(div);
   }
   document.body.appendChild(fragment);
   ```

5. **使用requestAnimationFrame代替setTimeout**
   ```javascript
   // ❌ 不好
   function animate() {
     element.style.left = `${x}px`;
     x += 1;
     setTimeout(animate, 16);
   }

   // ✅ 好
   function animate() {
     element.style.left = `${x}px`;
     x += 1;
     requestAnimationFrame(animate);
   }
   requestAnimationFrame(animate);
   ```

---

## 📚 推荐学习资料

1. **书籍**
   - 《JavaScript高级程序设计》（红宝书）
   - 《你不知道的JavaScript》系列
   - 《深入理解ES6》

2. **官方文档**
   - [MDN Web Docs](https://developer.mozilla.org/)
   - [ECMAScript Specification](https://tc39.es/ecma262/)

3. **在线资源**
   - [JavaScript.info](https://javascript.info/)
   - [30 Seconds of Code](https://www.30secondsofcode.org/)
   - [Frontend Masters](https://frontendmasters.com/)

---

## 🎯 面试准备建议

**必会手写题**：
1. ✅ 防抖节流
2. ✅ 深拷贝
3. ✅ Promise
4. ✅ call/apply/bind
5. ✅ new
6. ✅ 数组方法（map、filter、reduce）
7. ✅ instanceof

**必问概念**：
1. ✅ 闭包及应用
2. ✅ 原型和原型链
3. ✅ this指向规则
4. ✅ 事件循环
5. ✅ Promise原理
6. ✅ ES6新特性
7. ✅ 模块化方案对比

**进阶问题**：
1. ✅ Generator和async/await
2. ✅ Proxy和Reflect
3. ✅ 内存泄漏
4. ✅ 性能优化

---

**最后提醒**：理解原理 > 死记硬背！多写代码，多调试，加深理解。
