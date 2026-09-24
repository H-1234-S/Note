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

## implements

`implements` 是 **TypeScript** 中的一个关键字，用于表示一个类**实现**了某个接口（interface）。

核心作用是**强制约束类的结构**，让编译器帮你检查这个类是否满足接口的要求。

``` ts
interface Animal {
  name: string;
  speak(): void;
}

class Dog implements Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak() {
    console.log('Woof!');
  }
}
```

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

# 控制器

控制器负责处理传入的**请求**并将**响应**发送回客户端。

`@Controller()` 装饰器，它是定义一个基本控制器的**必需**装饰器。

`@Controller()` 中传入路径参数，表示请求的路径
## 路由

Nest 提供了用于所有标准 HTTP 方法的装饰器：

`@Get()`、`@Post()`、`@Put()`、`@Delete()`、`@Patch()`、`@Options()`、`@Head()` 

`@QueryMethod()`（它对应 `QUERY` 方法，并且为了避免和 `@Query()` 参数装饰器冲突而这样命名）。

`@All()` 定义了一个可以处理所有这些方法的端点。
## 请求

当在方法处理器中注入 `@Res()` 或 `@Response()` 时，该处理器将进入 **特定库模式**，并且你需要自行管理响应。

在这种情况下，你必须通过调用 `response` 对象（例如 `res.json(...)` 或 `res.send(...)`）来发出某种响应，否则 HTTP 服务器将会挂起。

> `@Res({ passthrough: true })` 装饰器中将 `passthrough` 选项设置为 `true`。

``` js
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

> 要利用 `express` 的类型定义（如上面 `request: Request` 参数示例所示），请确保安装 `@types/express` 包。

|                           |                                     |
| ------------------------- | ----------------------------------- |
| `@Request(), @Req()`      | `req`                               |
| `@Response(), @Res()`*    | `res`                               |
| `@Next()`                 | `next`                              |
| `@Session()`              | `req.session`                       |
| `@Param(key?: string)`    | `req.params` / `req.params[key]`    |
| `@Body(key?: string)`     | `req.body` / `req.body[key]`        |
| `@Query(key?: string)`    | `req.query` / `req.query[key]`      |
| `@Headers(name?: string)` | `req.headers` / `req.headers[name]` |
| `@Ip()`                   | `req.ip`                            |
| `@HostParam()`            | `req.hosts`                         |

`@Body()`、`@Query()`、`@Param()` 和 `@RawBody()` 也可以接收一个包含 `schema` 和 `pipes` 的选项对象。

这样就可以直接把 [标准 Schema](https://standardschema.dev/) 兼容的 schema 附加到路由参数上，包括使用 Zod 等包创建的 schema。

``` js
@Post()
create(@Body({ schema: createCatSchema }) createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}

@Get(':id')
findOne(@Param('id', { schema: z.coerce.number().int().positive() }) id: number) {
  return this.catsService.findOne(id);
}
```

## 状态码

响应的默认**状态码**始终是**200**，POST 请求除外，默认状态码为**201**。可以通过在处理程序级别使用 `@HttpCode(...)` 更改。

``` js
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

对于对应情况产生不同的状态码，可以通过使用特定于库的 **response**（通过 `@Res()` 注入）对象更改。

## 路由冲突和解决顺序

Nest 会按声明顺序注册路由。

在对顺序敏感的适配器上(默认的 Express 适配器)这意味着一个参数化路由可能会悄悄地覆盖一个更具体的路由：

``` js
@Controller('users')
export class UsersController {
  @Get(':id')
  findOne() {}

  @Get('me') // never reached: `:id` matches "me" first
  findMe() {}
}
```


> **`routeResolutionStrategy`** 控制注册顺序。

将它设置为 `'specificity'` 会先注册最具体的路由——字面段优先于参数段，参数段优先于通配符——所以无论声明顺序如何都能正常工作：

```typescript
const app = await NestFactory.create(AppModule, {
  routeResolutionStrategy: 'specificity',
});
```

默认是 `'declaration'`，会保留之前的行为。

# 提供器

提供者是 Nest 中的一个核心概念。

许多基础的 Nest 类，如服务、仓库、工厂和辅助工具，都可以被视为提供者。

> 提供者的核心思想是它可以*作为依赖被**注入***，从而允许对象之间形成各种关系。

## 依赖注入




# 模块

模块是使用 `@Module()` 装饰器注解的类。

`@Module()` 装饰器接受一个对象，该对象包含描述模块的属性：

| `providers`   | 由 Nest 注入器实例化的提供者，并且至少可以在此模块中共享                                         |
| ------------- | ----------------------------------------------------------------------- |
| `controllers` | 此模块中定义的必须实例化的一组控制器                                                      |
| `imports`     | 导入模块的列表，这些模块导出在此模块中所需的提供者                                               |
| `exports`     | `providers` 的子集，由此模块提供，并且应在导入此模块的其他模块中可用。你可以使用提供者本身或仅使用其令牌（`provide` 值） |
## 共享模块

在 Nest 中，模块默认是**单例**的，因此可以轻松地在多个模块之间共享任何提供者的同一实例。

每个模块自动都是一个**共享模块**。一旦创建，它可以被任何模块重用。

> **假设**想在多个其他模块之间共享一个 `CatsService` 的实例：

首先需要通过将 `CatsService` 提供者添加到模块的 `exports` 数组中来**导出**它

``` js
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

任何导入 `CatsModule` 的模块都可以访问 `CatsService`，并且与导入它的所有其他模块共享同一个实例。

> **注意：**

在每个需要 `CatsService` 的模块中直接注册它，也可以工作，但这会导致每个模块获得其自己的 `CatsService` 实例。

这可能会增加内存使用，因为会创建多个相同服务的实例，而且如果服务维护任何内部状态，也可能导致意外行为，例如状态不一致。

通过将 `CatsService` 封装在一个模块中，比如 `CatsModule`，并导出它，我们可以确保所有导入 `CatsModule` 的模块都复用相同的 `CatsService` 实例。

这不仅减少了内存消耗，还带来了更可预测的行为，因为所有模块共享同一个实例，从而更容易管理共享状态或资源。

## 全局模块

当想提供一组应该开箱即用、在任何地方都可用的提供者（例如，助手、数据库连接等）时

可以使用 `@Global()` 装饰器将模块设置为 **全局** 模块。

``` js
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

`@Global()` 装饰器使模块具有全局作用域。全局模块应**只注册一次**，通常由根模块或核心模块注册。

在上述示例中，`CatsService` 提供者将无处不在，而希望注入该服务的模块无需在其 imports 数组中导入 `CatsModule`

# 管道

在 NestJS 中，**管道（Pipe）是一个实现了 `PipeTransform` 接口的类**

它作用于路由处理函数接收参数之前，用来**对传入的参数进行转换（transform）或校验（validate）**。

管道位于请求和控制器之间；请求进来，数据先过管道处理，再交给控制器。

> 管道的作用：

1. **转换（Transformation）**：把输入数据变成期望的类型或格式。比如把字符串 `"123"` 转成数字 `123`。
    
2. **校验（Validation）**：检查数据是否合法，不合法就抛出异常，直接拦截请求。
    

如果校验失败或转换出错，管道会抛出异常，NestJS 的异常层会返回相应的错误响应（通常是 400 Bad Request），控制器方法根本不会执行。

``` ts
// 1. 参数级：只作用于某个参数
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}

// 2. 控制器级：作用于该控制器的所有路由
@UsePipes(ValidationPipe)
@Controller('users')
export class UsersController {}

// 3. 全局级：作用于整个应用
app.useGlobalPipes(new ValidationPipe());
```

## 显示转换

|管道|作用|
|---|---|
|`ParseIntPipe`|把参数转成整数，失败抛 400|
|`ParseFloatPipe`|转成浮点数|
|`ParseBoolPipe`|转成布尔值|
|`ParseArrayPipe`|转成数组|
|`ParseUUIDPipe`|校验是否为 UUID|
|`ParseEnumPipe`|校验是否为某个枚举值|
|`DefaultValuePipe`|参数为空时提供默认值|
|`ValidationPipe`|结合 class-validator 做 DTO 校验（最常用）|

可以使用 `ParseIntPipe` 或 `ParseBoolPipe` 显式地转换值（注意不需要 `ParseStringPipe`，因为如前所述，每个路径参数和查询参数默认都是以 `string` 的形式通过网络传递的）。

``` ts
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}
```

> 也可以使用**隐式转换：**

`ValidationPipe` 如何根据预期类型隐式转换查询和路径参数。此功能需要启用自动转换。
## 类验证器

Nest 与 [class-validator](https://github.com/typestack/class-validator) 库配合良好。这个库允许使用基于装饰器的验证。

```bash
npm i --save class-validator class-transformer
```

>  为 `CreateTodoDto` 类添加装饰器

``` ts
// create-todo.dto.ts
import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateTodoDto {
  @IsInt()
  id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsBoolean()
  isCompleted: boolean;
}
```
## 参数

`ValidationPipe()` 可以接收一个配置对象

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    // todo
  }),
);
```

`disableErrorMessages: true` 禁用详细错误；详细的错误消息不会显示在响应正文中。

`whitelist: true` 过滤掉不应被方法处理器接收的属性。

> `transform: true` 自动将有效载荷转换为根据其 DTO 类类型的对象。

``` ts
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

默认情况下，每个路径参数和查询参数都会作为 `string` 通过网络传输。

在方法签名中将 `id` 类型指定为 `number`。因此，`ValidationPipe` 会尝试自动将字符串标识符转换为数字。
# 中间件

中间件是一个在路由处理器**之前**被调用的函数。

中间件函数可以访问[请求](https://express.nodejs.cn/en/4x/api.html#req)和[响应](https://express.nodejs.cn/en/4x/api.html#res)对象，以及应用请求-响应周期中的`next()`中间件函数。

> 中间件函数可以执行以下任务：

- 执行任何代码。
- 修改请求和响应对象。
- 结束请求-响应周期。
- 调用堆栈中的下一个中间件函数。
- 如果当前的中间件函数没有结束请求-响应周期，它必须调用`next()`将控制权传递给下一个中间件函数。否则，请求将会挂起。
## 声明中间件

可以通过函数或带有 `@Injectable()` 装饰器的类来实现自定义的 Nest 中间件。

类应实现 `NestMiddleware` 接口，而函数没有任何特殊要求。

``` ts
// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TodoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('middleware');
    console.log(req, res);
    next();
  }
}
```

## 应用中间件

包含中间件的模块必须实现 `NestModule` 接口。

``` ts
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TodoController } from './todo.controller.js';
import { TodoService } from './todo.service.js';

@Module({
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Logger).forRoutes('todo');
    // forRoutes({ path: 'todo', method: RequestMethod.GET });
    // forRoutes(TodoController) 控制器
  }
}
```

在配置中间件时向 `forRoutes()` 方法传递包含路由 `path` 和请求 `method` 的对象

`forRoutes()` 方法可以接受一个字符串、多个字符串、一个 `RouteInfo` 对象、一个**控制器类**，甚至多个控制器类。

> 如果

## 排除路由

使用 `exclude()` 方法

`exclude()` 方法可以接受单个字符串、多个字符串，或一个 `RouteInfo` 对象来标识需要排除的路由。

``` ts
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}',
  )
  .forRoutes(CatsController);
```

## 全局中间件

全局中间件只能使用**函数式中间件**；使用 `app.use()`注册

``` ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};
```

> **应用：**

``` ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```

# API 文档

```bash
pnpm add @nestjs/swagger
```

打开 `main.ts` 文件，并使用 `SwaggerModule` 类初始化 Swagger：

``` ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

工厂方法 `SwaggerModule.createDocument()` 专门用于在请求时生成 Swagger 文档。

这种方法有助于节省一些初始化时间，生成的文档是符合 [OpenAPI 文档](https://swagger.io/specification/#openapi-document) 规范的可序列化对象。

> 访问地址 `http://localhost:3000/api` 即可看到生成的 api 文档

## 命令行插件

> **注意：** 文件名**必须**包含以下后缀之一：`['.dto.ts', '.entity.ts']`（例如，`create-user.dto.ts`），才能被插件分析。

``` json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger"]  // 添加该行
  }
}
```

> Nest 的 Swagger CLI 插件**不支持项目路径带中文**，中文路径会触发模块找不到报错。

> 在 DTO 中使用 [映射类型实用工具](https://nest.nodejs.cn/openapi/mapped-types)（如 `PartialType`）时，应从 `@nestjs/swagger` 导入它们，而不是从 `@nestjs/mapped-types` 导入，以便插件能够识别模式。

## Swagger JSON 文件

要生成并下载 Swagger JSON 文件，请导航到 `http://localhost:3000/api-json`（假设你的 Swagger 文档位于 `http://localhost:3000/api` 下）。

也可以使用 `@nestjs/swagger` 的 setup 方法在你选择的路由上公开它，如下所示：

```typescript

SwaggerModule.setup('swagger', app, documentFactory, {
  jsonDocumentUrl: 'swagger/json',
});
```

`http://localhost:3000/swagger/json`

