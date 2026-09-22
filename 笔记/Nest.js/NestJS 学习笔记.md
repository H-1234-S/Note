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

DI 是**控制反转思想**的一种常见**实现方式**；把类需要的依赖，从外部传进去，而不是类自己创建

