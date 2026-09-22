# Class

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

## 类装饰器

## 属性装饰器

## 方法装饰器

## 参数装饰器

## 装饰器工厂




