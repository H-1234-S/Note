## 零、前置储备知识（地基）

在学习 `class` 之前，请确保你已经掌握了以下两点，否则你会觉得 `class` 只是在死记硬背：

1. **构造函数 (Constructor Function)**：理解如何用 `function` 和 `new` 关键字创建对象。
    
2. **原型与原型链 (Prototype)**：理解方法是如何挂载在 `prototype` 上以实现内存共享的。
    
---

## 第一阶段：什么是 Class？（从旧到新）

在 ES6 之前，我们实现一个“类”是这样的：


``` js
function Plane(color) {
  this.color = color;
}
Plane.prototype.fly = function() {
  console.log("Flying in the sky...");
};
```

而在 ES6 中，同样的逻辑变成了：

``` js
class Plane {
  // 构造器：实例化时自动调用
  constructor(color) {
    this.color = color; // 实例属性
  }

  // 原型方法：所有实例共享
  fly() {
    console.log(`${this.color} plane is flying...`);
  }
}

const myPlane = new Plane("White");
myPlane.fly(); 
```

**核心点：**

- `class` 必须通过 `new` 调用，直接调用会报错。
    
- `class` 内部默认开启**严格模式**。
	

---

## 第二阶段：核心语法点（进阶必备）

### 1. 静态属性与方法 (Static)

这些属性和方法属于类本身，而不属于某个具体的实例。通常用于“工具函数”。


``` js
class MathTool {
  static PI = 3.14159; // 静态属性

  static sum(a, b) {   // 静态方法
    return a + b;
  }
}

console.log(MathTool.PI); // 3.14159
// const tool = new MathTool(); tool.sum() 会报错
```

### 2. 私有属性 (#)

这是近年来（ES2020）正式引入的特性，用于真正实现封装。

``` js
class BankAccount {
  #balance = 0; // 私有属性，外部无法访问

  deposit(amount) {
    this.#balance += amount;
  }

  checkBalance() {
    return this.#balance;
  }
}
```

---

## 第三阶段：继承 (Inheritance) —— 核心中的核心

这是 `class` 最强大的地方：通过 `extends` 和 `super` 轻松实现继承。


``` js
class Animal {
  constructor(name) {
    this.name = name;
  }
  eat() {
    console.log(`${this.name} is eating.`);
  }
}

// Dog 继承 Animal
class Dog extends Animal {
  constructor(name, breed) {
    // 必须先调用 super()，才能使用 this
    super(name); 
    this.breed = breed;
  }

  bark() {
    console.log("Woof! Woof!");
  }

  // 重写父类方法
  eat() {
    super.eat(); // 调用父类的 eat
    console.log("And looking for bones.");
  }
}

const myDog = new Dog("Buddy", "Golden Retriever");
myDog.eat();
```

**关键细节：**

- **`super`**：在子类构造函数中，它代表父类构造函数；在普通方法中，它可以调用父类的原型方法。
    

---

## 第四阶段：Getter 与 Setter（拦截器）

闭包可以保护数据，`class` 提供的 `get` 和 `set` 关键字则能让我们在读写属性时进行逻辑校验。


``` js
class Person {
  constructor(age) {
    this._age = age;
  }

  get age() {
    return `This person is ${this._age} years old.`;
  }

  set age(value) {
    if (value < 0) throw new Error("Age cannot be negative!");
    this._age = value;
  }
}
```

---

## 工程师的实战总结

1. **语法糖本质**：`typeof Plane` 的结果依然是 `"function"`。`class` 只是让原型继承的写法更符合主流面向对象语言的习惯。
    
2. **提升（Hoisting）**：与 `function` 不同，`class` **不会**被提升，必须先定义后使用。
    
3. **内存性能**：在 `class` 块中定义的方法（如 `fly()`）会自动挂载到原型上，而不会在每个实例中重复创建。
    

