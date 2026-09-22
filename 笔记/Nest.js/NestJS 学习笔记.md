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



