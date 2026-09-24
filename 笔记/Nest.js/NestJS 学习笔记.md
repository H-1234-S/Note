# Class

## private

``` ts
export class UserService { 
	constructor( 
		private prisma: PrismaService, 
		private mailer: MailService 
		) {} 
}
```

`private` 是 `typescript` 提供的一个语法糖，**相当于：**

``` ts
class UserService {
  // 声明一个私有成员属性
  private prisma: PrismaService;

  // 作为构造函数参数接收值
  constructor(prisma: PrismaService) {
    // 自动赋值给 this.prisma
    this.prisma = prisma;
  }
}
```

> `private` 关键字**省掉了声明 + 赋值两步**

## 类型限定

> `Class` 为什么可以作为类型限定？

**TypeScript 里的 `class` 同时可以是“值”和“类型”**；并且**运行时不会被擦除**。

# 控制反转

`IoC(Inversion of Control)` **控制反转**是一种**设计原则**

> **核心思想：** **把“创建和管理依赖对象”的控制权，从类自己手里交出去**，交给外部（通常是一个容器/框架）。

## 依赖注入

`DI(Dependency Injection)` 是**控制反转思想**的一种常见**实现方式**；把类需要的依赖，从外部传进去，而不是类自己创建。

## 示例讲解

``` ts
class EmailService {
  send(email: string, message: string) {
    console.log(`发送邮件给 ${email}: ${message}`)
  }
}

class UserService {
  private emailService: EmailService

  constructor() {
    this.emailService = new EmailService()
  }

  register(email: string) {
    console.log("用户注册成功")

    this.emailService.send(
      email,
      "欢迎注册"
    )
  }
}

// 使用
const userService = new UserService()

userService.register("test@example.com")
```

如果更改 `EmailService` 通常也需要更改 `UserService`；如果后续不想发邮件了，发送短信还需要更改 `EmailService`

因为 `UserService` 和 `EmailService` 是强耦合的

> 更改一下：不让 `UserService` 自己创建 `EmailService`

``` ts
class UserService {
  constructor(
    private emailService: EmailService
  ) {}

  register(email: string) {
    console.log("用户注册成功")

    this.emailService.send(
      email,
      "欢迎注册"
    )
  }
}

// 外部创建
const emailService = new EmailService()

const userService = new UserService(emailService)

userService.register("test@example.com")
```

其实这就**依赖注入**：`EmailService` 依赖在外部创建并且注入到 `UserService`

**控制反转：** `UserService` 不再负责创建依赖，控制权从内部转到外部
# 装饰器

装饰器是**一种在不修改原代码的前提下，给类、方法、属性、参数"附加功能"的语法**。

> 装饰器本质是一个**函数**，它接收被装饰的目标，对它进行包装、修改或添加元数据，然后返回（或就地修改）。

``` js
function decorator(value, context) {
}
```

`value` 被装饰的东西；`context` 关于这个东西的上下文

> **示例：**

``` ts
const Logs = (value: Function, context: ClassMethodDecoratorContext) => {
  console.log(value, context);
};

class UserService {
  constructor() {}
  
  @Logs
  get(name: string) {
    console.log("get");
  }
}

// [Function: get] {
//   kind: 'method',
//   name: 'get',
//   metadata: [Object: null prototype] {},
//   addInitializer: [Function: addInitializer],
//   static: false,
//   private: false,
//   access: { has: [Function (anonymous)], get: [Function (anonymous)] }
// }
```

## 示例讲解

为 `greet` 方法添加一个日志功能

``` ts
// loggedMethod 是一个装饰器
function loggedMethod<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >,
) {
  const methodName = String(context.name);
  
  // 返回一个新的函数来替换原方法
  return function (this: This, ...args: Args): Return {
    console.log(`[LOG] 进入方法: ${methodName}`);
    const result = target.call(this, ...args); // 执行原方法
    console.log(`[LOG] 退出方法: ${methodName}`);
    return result;
  };
}
  
class Greeter {
  @loggedMethod
  greet(name: string) {
    console.log(`Hello, ${name}!`);
    return "done";
  }
}
  
const g = new Greeter();
g.greet("World");

// 输出
// [LOG] 进入方法: greet
// Hello, World!
// [LOG] 退出方法: gree
```

这样在不改变原函数逻辑，使用装饰器添加了日志功能。
## 执行时机

装饰器**不是在方法被调用时执行**，而是在**类定义被求值时执行一次**。也就是创建类时，装饰器已经执行完。

``` ts
class Greeter {
  @loggedMethod
  greet(name: string) { ... }
}

// 等价于
class Greeter {
  greet(name: string) { ... }
}

// 装饰器被调用，返回值被用来"覆盖"原来的 greet
const newGreet = loggedMethod(Greeter.prototype.greet, { kind: "method", name: "greet", ... });

// 如果返回了东西，就用返回值替换原来的方法
Greeter.prototype.greet = newGreet;   // ← 替换就发生在这里
```

对于**方法装饰器**，如果 `return` 一个新函数，则用新函数替代原方法；如果**没有返回值**，则装饰器只做副作用

> 因此之后的每次调用 `g.greet()` 都是执行的新函数

## This 指向

``` ts
function loggedMethod(target, context) {
  // 这里的 this 是什么？—— 装饰器函数自身的 this
  
  return function (this: any, ...args) {
  
    // 这里的 this 是什么？—— 方法被调用时的 this（调用者）
    const result = target.call(this, ...args);
  };
}
```

- **装饰器函数体内的 `this`**：指的是装饰器**执行那一刻**的调用环境。
    
- **返回的包装函数体内的 `this`**：指的是**将来方法被调用时**的调用者（比如 `g.greet()` 里的 `g`）。



## 装饰器工厂

装饰器工厂，就是**返回装饰器的函数**；为了解决装饰器无法传参数；本质上利用的函数柯里化。

``` ts
function logged(prefix: string) {          // ← 外层：接收自定义参数
  return function (target, context) {       // ← 内层：真正的装饰器
    return function (this: any, ...args) {
      console.log(`[${prefix}] 进入`);
      return target.call(this, ...args);
    };
  };
}

// 使用
class Greeter {
  @logged("GREET")
  greet() {}

  @logged("BYE")
  bye() {}
}
```

> **执行顺序：**

``` js
// 第 1 步：类定义时，调用工厂函数，拿到装饰器
const decorator = logged("GREET");   // ← 外层函数执行，prefix = "GREET"

// 第 2 步：类定义时，立刻用这个装饰器装饰方法
const newGreet = decorator(Greeter.prototype.greet, { kind: "method", name: "greet" });
Greeter.prototype.greet = newGreet;
```

# Nest CLI

`nest g resource [name]` 

`nest generate service --no-spec`

`nest generate controller --no-spec`



