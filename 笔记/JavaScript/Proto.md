# 为什么需要原型？

在 JavaScript 中，如果我们通过构造函数创建对象，每次实例化都会为新对象分配内存。

``` js
function Player(name) {
  this.name = name;
  this.eat = function() {
    console.log(this.name + " is eating...");
  };
}

const p1 = new Player("Alice");
const p2 = new Player("Bob");

console.log(p1.eat === p2.eat); // false
```

**问题点：** 这里的 `eat` 方法在每个实例中都占据了一份独立的内存。如果有 1000 个 `Player`，就会有 1000 个一模一样的 `eat` 函数。

**解决方案：** 把公共的方法抽离出来，让所有实例**共享**。这就是原型的初衷。

---

# 核心概念拆解

在 JavaScript 中，理解原型链只需记住三条核心规则：

### 1. 显式原型 `prototype`

**只有函数**（严格来说是构造函数）才拥有 `prototype` 属性。它指向一个对象，这个对象包含了所有实例共享的属性和方法。

### 2. 隐式原型 `__proto__`

**所有对象**（包括函数）都有一个 `__proto__` 属性。它指向创建该对象的构造函数的 `prototype`。

> 注意：在生产环境中建议使用 `Object.getPrototypeOf()` 获取，`__proto__` 主要是浏览器厂商实现的非标准属性，但它对理解概念非常有帮助。

### 3. 构造函数 `constructor`

原型对象默认有一个 `constructor` 属性，指向它关联的构造函数。

原型也有 constructor 属性，指向该原型的函数

---

# 代码实战与验证

让我们用刚才的 `Player` 改写代码：

``` js
function Player(name) {
  this.name = name;
}

// 在原型上定义共享方法
Player.prototype.eat = function() {
  console.log(this.name + " is eating...");
};

const p1 = new Player("Alice");
const p2 = new Player("Bob");

// 1. 验证共享性
console.log(p1.eat === p2.eat); // true

// 2. 验证三角关系
console.log(p1.__proto__ === Player.prototype); // true
console.log(Player.prototype.constructor === Player); // true

// 3. 顺着链条向上找
console.log(Player.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null (到达终点)
```

---

# 什么是原型链？

当你访问一个对象的属性时，JavaScript 引擎会执行以下搜索算法：

1. 先在**对象自身**找。找到了，返回。
    
2. 找不到，就去对象的 `__proto__`（即**构造函数的 prototype**）里找。
    
3. 如果还找不到，就去**原型的原型**里找（比如 `Object.prototype`）。
    
4. 一直找到 `null` 为止。
    

这种由 `__proto__` 一层层连接起来的链路，就叫**原型链**。

### 知识点补全：

- **Object.prototype 是所有对象的“祖先”**：它的 `__proto__` 是 `null`。
    
- **函数也是对象**：既然是对象，函数也有 `__proto__`。`Function.__proto__ === Function.prototype`，这是一个有趣的闭环。
    
- **属性遮蔽（Shadowing）**：如果实例和原型有同名属性，实例属性会“遮蔽”原型属性。
    

---

