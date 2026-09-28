## NestJS 面试八股整理

> 目标：不把 NestJS 记成装饰器 API 清单，而是沿着“应用启动时如何建立对象图、请求到来后如何经过管线、最终如何落到 Express/Fastify”这条主线，理解它为什么这样设计、哪里有边界、面试时如何讲到原理层。

## 目录

1. NestJS 全景：在 Node.js 与 Express/Fastify 之上的抽象
2. 装饰器、元数据与模块扫描：Nest 如何“读懂”代码
3. Module 与 DI 容器：依赖如何被解析和实例化
4. 请求生命周期：从 HTTP 到 Controller 方法
5. Middleware、Guard、Pipe、Interceptor、Filter：职责与执行顺序
6. Interceptor 与 RxJS：Nest 如何实现 AOP 式环绕能力
7. Provider 作用域、动态模块与全局模块：复杂依赖的边界
8. Express/Fastify、CommonJS/ESM 与适配器：Nest 并没有替你消除底层差异
9. 异常、配置、测试与生产可靠性
10. 一次完整请求的复盘与面试回答框架

---

## 0. 知识地图与推荐顺序

NestJS 的核心不是“给 Express 加了装饰器”，而是提供了一套**模块化、依赖注入、声明式请求管线和可测试的应用架构**。它把业务代码组织成元数据，再在启动阶段扫描元数据、建立模块图和 provider 实例，最后把控制器方法注册为底层 HTTP 路由。

```text
Controller / Provider / Module 装饰器
              │
TypeScript 编译产物 + reflect-metadata
              │
DependenciesScanner：扫描模块、控制器、provider、路由元数据
              │
Container / Injector：建立模块图、解析 token、实例化对象
              │
RoutesResolver / RouterExplorer：把 Controller 方法绑定到 HTTP adapter
              │
Express 或 Fastify：真正监听端口、解析请求、发送响应
              │
Node.js HTTP / TCP / Event Loop
```

推荐依赖顺序：

1. 先理解 Nest 是架构层，Express/Fastify 才是 HTTP 执行层。
2. 再理解装饰器和 metadata，否则会误以为 `@Injectable()` 本身完成了依赖注入。
3. 再理解 Module 与 DI，因为 Controller、Guard、Interceptor 本质上都依赖容器管理。
4. 最后学习请求生命周期和 RxJS，才能解释“为什么某个 Guard 没执行”“为什么 Interceptor 可以改响应”。

---

## 1. NestJS 全景：在 Node.js 与 Express/Fastify 之上的抽象

### 1.1 核心概念：是什么 / 为什么

**NestJS 是运行在 Node.js 之上的应用框架**。它默认提供模块系统、DI 容器、装饰器式路由、Middleware、Guard、Pipe、Interceptor、Exception Filter，以及 HTTP、WebSocket、Microservices 等统一的组织方式。

它通常使用 Express 或 Fastify 作为 HTTP adapter：

- Nest 负责**应用结构、依赖关系、请求管线和生命周期**；
- Express/Fastify 负责**HTTP server、路由匹配、request/response 对象和底层 middleware**；
- Node.js 负责**事件循环、socket、HTTP 解析、网络 I/O**。

Nest 解决的主要痛点不是“让一个接口更容易写”，而是大型 Node.js 项目中的：

- 全局变量和手动 `new` 导致的依赖难管理；
- 路由、鉴权、参数校验、异常处理散落在 middleware 中；
- 模块边界不清晰，业务代码难测试；
- 多人协作时缺少统一的应用架构；
- Express 的自由度很高，但约束和可发现性不足。

### 1.2 Nest 与 Express 的关系

```ts
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Controller('users')
class UserController {
  @Get(':id')
  findOne() {
    return { id: 1 };
  }
}

@Module({ controllers: [UserController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

这段代码不是让 `@Get()` 直接监听端口。启动时 Nest 会读取 `@Controller`、`@Get`、`@Module` 写入的 metadata，再把 `UserController.findOne` 包装成 handler，最终调用 Express/Fastify 的 `get('/users/:id', handler)`。

### 1.3 底层启动流程

```text
NestFactory.create(AppModule)
  → 创建 NestApplicationContext / NestApplication
  → 创建 NestContainer 与 ModuleCompiler
  → DependenciesScanner 扫描 AppModule
  → 递归发现 imports、controllers、providers、exports
  → InstanceLoader + Injector 实例化 provider/controller
  → RoutesResolver / RouterExplorer 扫描控制器路由
  → 将 handler 注册到底层 HTTP adapter
  → app.listen() 调用 Express/Fastify 的 listen
```

> 源码分析：不同 Nest 版本内部类的细节可能变化，但面试应抓住稳定职责：`NestFactory` 负责启动，`DependenciesScanner` 负责发现依赖和元数据，`Container` 保存模块，`Injector` 解析并创建实例，`RouterExplorer`/`RoutesResolver` 负责路由映射。

### 1.4 常见误区 ⚠️

- **Nest 不是替代 Node.js event loop 的运行时。** Controller 中执行 CPU 密集同步计算，仍然会阻塞所有请求。
- **Nest 不是只能跑 Express。** 通过 adapter 可以运行在 Fastify 上，但底层 request/response API 和 middleware 细节会有差异。
- **`async` 不代表自动并发。** 一个 handler 中连续 `await` 仍然是串行等待；并发需要明确使用 `Promise.all`，同时控制下游压力。
- **Nest 的抽象不是越多越好。** 直接依赖 Express/Fastify 的能力会降低可移植性，应该把 adapter-specific 代码限制在边界层。

### 1.5 面试典型问法 + 简洁回答

**问：NestJS 和 Express 是什么关系？**

答：Nest 是应用架构层，提供模块、DI 和声明式请求管线；Express 是 Nest 可选的 HTTP adapter，负责真正的 HTTP 请求解析、路由注册和响应发送。Nest 最终仍然落到 Node.js 的事件循环和底层 HTTP 能力。

**问：NestJS 为什么适合大型项目？**

答：它用 Module 和 DI 约束依赖边界，用 Guard/Pipe/Interceptor/Filter 把横切逻辑结构化，并提供统一的生命周期和测试替换点，降低多人协作和长期维护成本。

可能被追问：Fastify adapter 的收益和兼容性代价是什么？Nest 启动扫描发生在什么时候？Controller 方法最终如何成为 Express handler？

---

## 2. 装饰器、元数据与模块扫描：Nest 如何“读懂”代码

### 2.1 装饰器本身做什么

装饰器通常不是运行时代理，也不会自动执行依赖注入。Nest 的装饰器主要做两件事：

1. 给 class、method、parameter 附加**结构化 metadata**；
2. 返回或修改目标 class/method，使框架可以在启动阶段发现它。

例如 `@Controller('users')` 可以记录 controller 的 path；`@Get(':id')` 可以记录 method 的 HTTP method 和 path；`@Module({...})` 可以记录 imports、providers、controllers、exports。

### 2.2 TypeScript metadata 与 `reflect-metadata`

当配置如下：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

TypeScript 会为部分类型信息生成类似下面的调用：

```ts
__metadata('design:paramtypes', [UserService])
```

在运行时，`reflect-metadata` 提供 `Reflect.defineMetadata`、`Reflect.getMetadata` 等 API，使框架可以读取这些信息：

```ts
import 'reflect-metadata';

class UserService {}

class UserController {
  constructor(public readonly service: UserService) {}
}

// 这里的 metadata 由编译器结合装饰器生成，示意读取方式：
const paramTypes = Reflect.getMetadata(
  'design:paramtypes',
  UserController,
);

console.log(paramTypes[0] === UserService); // true
```

**重要限制：TypeScript 运行时类型信息并不完整。** `string`、`number` 等可能只得到构造函数；interface、type alias、union、泛型通常会丢失，运行时不存在对应的 JavaScript constructor。因此 Nest 遇到接口型依赖时需要显式 token：`@Inject('USER_REPOSITORY')`。

### 2.3 reflect-metadata 的存储模型

可以把 metadata 抽象为：

```text
target object / constructor
  └── [[Metadata]]: Map<propertyKey | undefined, Map<metadataKey, value>>
```

`Reflect.defineMetadata(key, value, target, propertyKey?)` 写入目标的 metadata；`Reflect.getMetadata` 会沿 prototype chain 查找，而 `getOwnMetadata` 只查当前对象。Nest 自己定义了很多 metadata key，并通过统一的 `Reflector` 或内部 helper 读取。

> 源码分析：`reflect-metadata` 不是“保存 TypeScript 类型系统”的数据库，它只是给 JavaScript 对象提供 metadata 读写协议。真正的类型值来自 TypeScript 编译时生成的 `design:paramtypes` 等信息；Nest 的路由和模块信息则主要来自 Nest 装饰器主动写入的 metadata。

### 2.4 从模块扫描到路由发现

```text
AppModule
  → 读取 @Module metadata
  → 注册 imports / providers / controllers / exports
  → 对每个 import 递归扫描
  → 对每个 controller 读取 controller path
  → 读取 prototype 上的方法 metadata
  → 合并 HTTP method + controller path + method path
  → 创建代理 handler 并交给 adapter 注册
```

示例：

```ts
@Controller('users')
class UserController {
  @Get()
  list() {}

  @Get(':id')
  detail() {}
}
```

最终会得到类似：

```text
GET /users       → UserController.list
GET /users/:id   → UserController.detail
```

### 2.5 常见误区 ⚠️

- **`@Injectable()` 不会立刻创建实例。** 它主要是标记 class 可被 Nest 容器发现/管理，并配合 metadata 让依赖解析更可靠；实例通常在应用初始化阶段由 Injector 创建。
- **`emitDecoratorMetadata` 不能推断 interface。** 接口编译后消失，必须使用显式 token。
- **装饰器执行时不等于应用启动时。** 装饰器函数通常在模块被 JavaScript 加载、class 定义时执行；Nest 的扫描和实例化发生在 `NestFactory.create` 的启动流程中。
- **metadata 不是全局变量。** 它挂在 target 和可选 property key 上；同名 key 在不同 class 上互不冲突，但继承读取会受到 prototype chain 影响。

### 2.6 面试典型问法 + 简洁回答

**问：Nest 是如何通过 TypeScript 类型实现依赖注入的？**

答：TypeScript 配合 `emitDecoratorMetadata` 为带装饰器的 class 生成 `design:paramtypes` metadata，Nest 在启动扫描时通过 `Reflect.getMetadata` 读取构造函数参数类型，再把这些类型作为 DI token 去容器中找实例。interface 等类型运行时不存在，所以要用 `@Inject` 提供显式 token。

**问：`@Injectable()` 到底做了什么？**

答：它是一个可注入 provider 的声明/标记，不是 `new`，也不等于已经完成注入；真正的实例创建和构造函数参数解析由 Nest 的 Container/Injector 在启动或首次需要时完成。

可能被追问：`getMetadata` 和 `getOwnMetadata` 的区别是什么？循环依赖为什么会影响 metadata 和实例化？Stage 3 decorators 与 Nest 传统 decorators 的兼容性边界是什么？

---

## 3. Module 与 DI 容器：依赖如何被解析和实例化

### 3.1 为什么需要 DI

手动依赖：

```ts
class UserController {
  private readonly service = new UserService(new UserRepository());
}
```

会把创建逻辑、具体实现和业务逻辑绑死，导致：

- 难以替换 mock；
- 配置、连接池等共享资源生命周期失控；
- 依赖关系隐藏在 class 内部；
- 循环依赖和模块边界难以发现。

**DI 的核心思想是控制反转**：class 声明自己需要什么，容器负责决定实例从哪里来、何时创建、是否复用和如何销毁。

### 3.2 Module 是依赖图的边界

```ts
@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
class UserModule {}
```

- `providers`：这个 module 可以创建/管理的 provider；
- `controllers`：由这个 module 管理的 controller；
- `exports`：允许其他 module 使用的公开 provider；
- `imports`：引入其他 module 暴露的 provider。

可以把 module 理解成**带有可见性规则的容器节点**，而不是单纯的文件夹。

### 3.3 token、provider 与实例化

Nest 的 provider 不只是一种 class：

```ts
const USER_REPOSITORY = Symbol('USER_REPOSITORY');

const userRepositoryProvider = {
  provide: USER_REPOSITORY,
  useFactory: (config: ConfigService) => {
    return new UserRepository(config.get('DATABASE_URL'));
  },
  inject: [ConfigService],
};

const aliasProvider = {
  provide: 'READ_REPOSITORY',
  useExisting: USER_REPOSITORY,
};
```

常见形式：

- `useClass`：token 映射到 class；
- `useValue`：token 映射到已存在对象；
- `useFactory`：调用工厂函数创建；
- `useExisting`：复用另一个 token 的实例。

### 3.4 依赖解析的简化流程

```text
解析 UserController
  → 读取 design:paramtypes / @Inject token
  → 得到 UserService token
  → 在当前 module 查找 provider
  → 当前没有则沿 imports 查找已 export 的 provider
  → provider 未实例化：递归解析其依赖
  → 按 scope 创建实例并缓存
  → 注入到 UserController 构造函数
```

示例：

```ts
const PAYMENT = Symbol('PAYMENT');

interface PaymentPort {
  charge(amount: number): Promise<void>;
}

@Injectable()
class OrderService {
  constructor(
    @Inject(PAYMENT) private readonly payment: PaymentPort,
  ) {}

  pay() {
    return this.payment.charge(100);
  }
}
```

这里 interface 只用于 TypeScript 类型检查，真正的运行时 token 是 `PAYMENT`。

> 源码分析：Nest 的 Injector 可以看成“带 module 可见性和作用域缓存的递归构造器”。它不是简单的 `Map<Token, Instance>`：需要处理 provider 定义、依赖图、forward reference、request/transient scope、模块导出边界和生命周期 hook。

### 3.5 循环依赖

```text
AService → BService → AService
```

循环依赖通常说明边界设计有问题，但某些场景需要延迟引用：

```ts
@Injectable()
class AService {
  constructor(
    @Inject(forwardRef(() => BService))
    private readonly b: BService,
  ) {}
}
```

`forwardRef` 的本质是把“现在就求值的 class 引用”变成“之后再解析的 thunk”，解决模块加载顺序或 token 尚未完成初始化的问题；它不等于消除了业务层循环，也不保证所有初始化顺序问题都自动解决。

### 3.6 常见误区 ⚠️

- **`providers` 和 `exports` 不是一回事。** provider 在 module 内可用，只有 export 后才可能被导入方使用。
- **同一个 class 不一定全局只有一个实例。** 默认通常在 module 容器上下文中复用；不同 module 重复声明同一个 provider，可能得到不同实例。
- **DI 不是服务定位器的借口。** 到处 `moduleRef.get()` 会隐藏依赖，削弱构造函数注入带来的可读性和可测试性。
- **`forwardRef` 不是架构修复。** 高频使用通常意味着模块职责耦合，应优先抽取共享抽象或事件边界。

### 3.7 面试典型问法 + 简洁回答

**问：Nest DI 容器如何工作？**

答：启动时扫描 Module 元数据建立模块图；每个 provider 以 token 注册。实例化 controller/provider 时，Injector 读取构造参数的 metadata 或显式 `@Inject` token，递归解析依赖，按作用域缓存或创建实例，再注入构造函数。Module 的 imports/exports 决定 token 的可见范围。

**问：为什么 interface 不能直接注入？**

答：interface 只存在于 TypeScript 编译期，运行时没有 constructor 作为 token；需要用 string、Symbol 或 abstract class 作为运行时 token，并通过 `@Inject` 或 provider 配置绑定实现。

可能被追问：单例、request-scoped、transient 的性能代价是什么？如何替换 provider 做测试？动态 module 如何携带配置？

---

## 4. 请求生命周期：从 HTTP 到 Controller 方法

### 4.1 完整顺序

典型 HTTP 请求可以按下面顺序理解：

```text
Node HTTP server
  → Express/Fastify middleware
  → Nest middleware
  → Guards
  → Interceptors：进入前
  → Pipes：参数转换/校验
  → Controller method
  → Interceptors：返回后（Observable stream）
  → Exception Filters（出现未处理异常时接管）
  → adapter 发送 response
```

更精确地说，**Filter 不是普通的“最后一步”**：它只在异常传播到它的作用域时执行；异常可能在 Guard、Pipe、Controller 或 Interceptor 中产生。Middleware 也不属于 Nest execution context，它先于 Guard，且无法直接读取 Nest 的 handler/class metadata。

### 4.2 Middleware：底层请求链

```ts
@Injectable()
class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.headers['x-request-id'] ??= crypto.randomUUID();
    next();
  }
}

@Module({})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');
  }
}
```

它接近 Express 的 `(req, res, next)` 模型；在 Fastify 下会受 adapter 兼容层和原生 API 差异影响。

### 4.3 Guard：是否允许进入 handler

```ts
@Injectable()
class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return Boolean(req.user);
  }
}
```

Guard 的设计重点是：它知道当前执行上下文和目标 handler，可以读取 route metadata，例如公开接口、角色、权限。Middleware 只知道 request/response，不知道 Nest 的 controller 方法语义。

### 4.4 Pipe：参数边界上的转换与校验

```ts
class CreateUserDto {
  name!: string;
}

@Controller('users')
class UserController {
  @Post()
  create(@Body(new ValidationPipe({ transform: true })) dto: CreateUserDto) {
    return dto;
  }
}
```

Pipe 运行在调用 controller 方法之前，可以把字符串参数转换为 number、校验 DTO，并在失败时抛出异常。它解决的是“外部不可信数据如何进入业务层”的边界问题。

### 4.5 常见误区 ⚠️

- **Guard 不是 Middleware 的增强版。** Guard 有 `ExecutionContext` 和 handler metadata，适合认证/授权；Middleware 适合通用请求预处理、日志、跨框架接入。
- **Pipe 不只是校验器。** 它可以转换参数；但 DTO 类型声明本身不会在运行时自动校验，必须配合实际 validator/pipe。
- **Interceptor 不一定先于 Guard。** Guard 负责是否放行，典型生命周期中 Guard 先执行；Interceptor 的“前置逻辑”包在 handler 调用外层。
- **异常 Filter 不会捕获所有任意异步错误。** 必须让异常进入 Nest 管理的执行链；脱离请求上下文的后台任务需要独立错误处理和日志策略。

### 4.6 面试典型问法 + 简洁回答

**问：Middleware、Guard、Pipe 的区别是什么？**

答：Middleware 面向底层 request/response 链，适合通用预处理；Guard 面向“是否允许执行当前 handler”，可读取 ExecutionContext 和 metadata，适合认证授权；Pipe 位于 handler 调用前，负责参数转换和校验。三者的抽象层次和职责不同，不能只按执行先后区分。

**问：Nest 请求生命周期怎么走？**

答：请求先经过底层和 Nest middleware，再经过 Guard；放行后进入 Interceptor 的前置逻辑，Pipe 转换校验参数，执行 Controller；返回值沿 Interceptor 的 Observable 链返回，未处理异常则交给匹配范围内的 Exception Filter。

可能被追问：全局 Guard 如何注入依赖？为什么 `APP_GUARD` 与 `app.useGlobalGuards(new ...)` 有差异？参数级 Pipe 与全局 Pipe 的合并顺序是什么？

---

## 5. Interceptor 与 RxJS：Nest 如何实现 AOP 式环绕能力

### 5.1 Interceptor 是什么 / 为什么

Interceptor 类似 AOP 中的 **around advice**：它可以在 handler 前执行逻辑，也可以包裹 handler 返回的异步结果，在返回后统一修改、记录、缓存或计时。

```ts
@Injectable()
class TimingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => console.log(`cost=${Date.now() - start}ms`)),
    );
  }
}
```

### 5.2 Observable 的订阅时机

`next.handle()` 通常返回一个 Observable，代表后续 handler 的结果。Interceptor 返回 Observable，并通过 `pipe` 组合操作符：

```ts
return next.handle().pipe(
  map(data => ({ data })),
  catchError(err => {
    // 可以记录、转换或重新抛出异常
    return throwError(() => err);
  }),
  finalize(() => console.log('request finished')),
);
```

关键点：**Observable 默认是惰性的**。创建 `next.handle()` 的链条不一定立即执行 handler；Nest 的执行器在后续订阅这个 Observable 时，handler 结果才沿链路被消费。对于普通 `Promise` 返回值，Nest 会将其适配为可观察结果。

可以把它理解成：

```text
Interceptor A
  → next.handle() 得到 Observable
    → Interceptor B
      → Pipe + Controller 产生结果
    ← B 的 operators 处理结果
  ← A 的 operators 处理结果
```

这就是典型的洋葱模型/环绕调用模型。

> 源码分析：Nest 的 `InterceptorsConsumer` 会按顺序组合拦截器，并构造 `CallHandler`。每个 interceptor 调用 `next.handle()` 才会把控制权传给下一层；如果不调用它，就可以短路请求，例如缓存命中直接返回 `of(cachedValue)`。最终返回值由框架订阅并写入 response。

### 5.3 与普通 middleware 的差异

- Middleware 更早、更接近 Express/Fastify，适合修改 request、挂载 trace id。
- Interceptor 知道 `ExecutionContext` 和 handler，能统一处理 controller 返回值和异常流。
- Middleware 主要是 callback `next()`；Interceptor 是可组合的 Observable/Promise 管线，能统一处理“返回之后”的逻辑。

### 5.4 常见误区 ⚠️

- **只写 `next.handle()` 不等于“执行完成”。** 要理解真正的执行发生在订阅阶段；操作符链的副作用也取决于是否订阅。
- **Interceptor 不是万能的响应拦截器。** 使用底层 `res.send()` 手动响应时，Nest 的返回值处理链可能不再按预期工作。
- **`catchError` 中吞掉异常会改变异常语义。** 返回一个普通值会让请求变成成功响应；要继续失败应重新 `throwError`。
- **缓存不能只按 URL 粗暴处理。** 必须考虑用户身份、query、body、权限和失效策略。

### 5.5 面试典型问法 + 简洁回答

**问：Nest Interceptor 为什么能在 Controller 执行前后都做事情？**

答：它采用类似 AOP around advice 的模型，`intercept` 先执行前置逻辑，再调用 `next.handle()` 取得后续 handler 的 Observable，通过 RxJS `map/tap/finalize/catchError` 等操作符处理结果，因此形成进入和返回的环绕链。

**问：`next.handle()` 和 Observable 的订阅有什么关系？**

答：`next.handle()` 返回代表后续执行的 Observable，Observable 通常是惰性的；Nest 在执行链末端订阅它，handler 结果才被消费。Interceptor 可以通过不调用 `next.handle()` 短路，也可以通过 operators 改写结果或异常。

可能被追问：多个 Interceptor 的前后顺序如何嵌套？如何实现缓存、超时、重试？`lastValueFrom` 使用不当会有什么问题？

---

## 6. Provider 作用域、动态模块与全局模块

### 6.1 作用域的设计取舍

常见 provider scope：

- **singleton**：应用生命周期内复用，适合无请求状态的 service、连接池、配置对象；
- **request-scoped**：每个请求创建上下文实例，适合请求级用户信息、trace state；
- **transient**：每次被注入时创建新实例，适合需要完全隔离状态的对象。

```ts
@Injectable({ scope: Scope.REQUEST })
class RequestContext {
  readonly createdAt = Date.now();
}
```

request scope 的代价是依赖链传播：一个 request-scoped service 被 singleton controller 间接依赖，相关对象可能也需要按请求解析，增加创建、查找和 GC 压力。不要把 request scope 当作“方便存全局请求变量”的默认方案。

### 6.2 动态 Module

动态 module 用代码生成 module metadata，适合把配置和基础设施封装成可复用模块：

```ts
@Module({})
class DatabaseModule {
  static forRoot(url: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        { provide: 'DB_URL', useValue: url },
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }
}
```

设计动机是把“模块定义”和“模块实例配置”分开：模块提供能力，`forRoot`/`forFeature` 注入本次应用或业务域的配置。

### 6.3 `@Global()` 的坑

`@Global()` 使模块导出的 provider 在其他模块中无需重复 imports 即可访问，但它会降低依赖的显式性：读一个 module 的代码时，看不出某个 token 来自哪里，也容易造成 token 冲突和测试隔离困难。

```ts
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}
```

适合全局基础设施，如配置、日志、指标；不适合把所有业务 service 都放成 global。

### 6.4 常见误区 ⚠️

- **singleton 不是“永远安全”。** 单例 service 中保存用户请求状态会造成串请求、并发污染和内存泄漏。
- **request scope 不是免费上下文。** 它增加实例创建和依赖解析成本，高并发下需要压测。
- **动态 module 不是普通 class 工厂的语法糖。** 它必须正确返回 `module/providers/exports/imports` 等 metadata，才能被 Nest 扫描。
- **`@Global()` 不等于自动导出所有 provider。** 只有 exports 中声明的 provider 对外可用。

### 6.5 面试典型问法 + 简洁回答

**问：Nest provider 默认是什么生命周期？request scope 有什么代价？**

答：默认通常是 singleton，在容器上下文中复用。request scope 为每个请求创建上下文实例，适合请求级状态，但会增加实例化、依赖链传播和 GC 成本，因此应谨慎使用，不能用它掩盖不合理的状态管理。

**问：`@Global()` 有什么问题？**

答：它减少显式 imports，但也隐藏依赖、增加 token 冲突和测试隔离风险。应只用于真正横切的基础设施，业务模块仍应通过 imports/exports 明确依赖关系。

可能被追问：异步动态 module 如何加载远程配置？如何区分 `forRoot` 与 `forFeature`？如何设计多租户 request context？

---

## 7. Express/Fastify、CommonJS/ESM 与适配器

### 7.1 HTTP adapter 的意义

Nest 通过 `HttpAdapter` 抽象常用能力，使上层 controller 不必直接依赖 Express。但这种抽象有边界：

- `@Req()`、`@Res()` 拿到的对象仍取决于 adapter；
- Express middleware 和 Fastify plugin 不能无条件互换；
- 文件上传、静态文件、压缩、错误对象、reply API 可能不同；
- 直接调用 `res.status().json()` 会让代码绑定 Express 风格。

```ts
// 可移植性更好的方式：返回值交给 Nest 处理
@Get()
list() {
  return this.service.list();
}

// 绑定 adapter 的方式：需要明确知道自己在使用哪套 API
@Get('raw')
raw(@Res() res: Response) {
  return res.status(200).json({ ok: true });
}
```

### 7.2 Express/Fastify middleware 与 Nest pipeline 的关系

Express middleware 是链式 callback；Fastify 更强调 encapsulation、plugin 和 hook。Nest 将自己的 middleware/Guard/Interceptor 等抽象映射到 adapter，但不会把两者的语义完全抹平。选择 Fastify 时，应检查第三方 Express middleware 是否兼容，而不是只看基准压测数字。

### 7.3 CommonJS/ESM 对 Nest 的影响

Nest 的装饰器、反射和 DI 都依赖“运行时能拿到 class/value”。模块系统改变的是这些值如何加载：

- CommonJS 使用 `require`、`module.exports`，加载过程同步且有 `require.cache`；
- ESM 使用静态 `import`、live bindings、异步模块图和不同的循环依赖时序；
- 混用时可能出现 default export、路径扩展名、interop 和初始化顺序问题；
- 循环 import 不等同于 Nest provider 循环依赖，前者发生在模块加载阶段，后者发生在 DI 图解析阶段。

### 7.4 常见误区 ⚠️

- **Fastify 一定比 Express 快，所以无脑切换。** 实际吞吐取决于 middleware、序列化、数据库和业务逻辑；生态兼容性也是成本。
- **使用 `@Res()` 仍会自动处理返回值。** 一旦接管原生 response，通常要自己发送响应，可能绕过 Nest 的标准响应流程。
- **CJS/ESM 循环依赖和 DI 循环依赖是同一件事。** 它们处于不同层次，排查方式也不同。

### 7.5 面试典型问法 + 简洁回答

**问：Nest 如何兼容 Express 和 Fastify？**

答：Nest 将常见 HTTP 操作抽象到 adapter，并分别提供 Express/Fastify adapter；上层控制器尽量只使用 Nest 抽象。但原生 request/response、middleware/plugin 和第三方生态仍有差异，所以不能认为二者完全可替换。

**问：CJS/ESM 循环依赖与 Nest 循环依赖有什么区别？**

答：CJS/ESM 循环依赖发生在 JavaScript 模块加载和导出绑定阶段；Nest 循环依赖发生在 provider/module 的 DI 解析阶段。可以同时存在，也应分别从模块导入和容器 token 图两个层次排查。

可能被追问：为什么 ESM 下某些装饰器/metadata 配置会失效？如何减少 `@Res()` 带来的 adapter 耦合？Fastify 的 encapsulation 对 Nest module 有什么类比和差异？

---

## 8. 异常、配置、测试与生产可靠性

### 8.1 Exception Filter 与错误边界

```ts
@Catch(DomainError)
class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(400).json({
      code: error.code,
      message: error.message,
    });
  }
}
```

Filter 的职责是把异常转换成边界协议，例如 HTTP status 和 error body；不要在每个 service 中直接构造 HTTP response，否则领域层会被传输层污染。

### 8.2 配置与启动失败

配置应在启动时校验，而不是第一次请求时才发现环境变量缺失：

```ts
const configuration = () => ({
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
});
```

更可靠的做法是把配置解析、类型转换和必填项校验集中到 ConfigModule，启动失败要快速暴露，避免服务以半可用状态接流量。

### 8.3 测试中的 DI 替换

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useValue: fakeRepository },
  ],
}).compile();

const service = moduleRef.get(UserService);
```

DI 的价值在这里体现得很直接：测试不需要连接真实数据库，只要替换 token。单元测试关注 provider 行为，e2e 测试再验证 adapter、路由、pipe 和真实依赖的组合。

### 8.4 常见误区 ⚠️

- **把所有错误都返回 200。** 这会破坏客户端重试、监控和网关语义。
- **在 Filter 里泄漏 stack/SQL/secret。** 外部错误协议和内部日志信息应分离。
- **只测 controller 不测 provider 边界。** controller 测试通过不代表 DI、数据库、配置和异常转换正确。
- **优雅退出只关闭 HTTP server。** 还要处理数据库连接、消息消费者、定时任务和未完成请求，避免新请求进入后依赖已关闭。

### 8.5 面试典型问法 + 简洁回答

**问：为什么要用 Exception Filter，而不是每个接口 try/catch？**

答：Filter 提供统一的异常边界，把领域错误映射成 HTTP/消息协议，减少重复代码并保持业务层与传输层解耦；局部 try/catch 只适合需要恢复或补充上下文的场景。

**问：Nest 的 DI 如何帮助测试？**

答：业务依赖通过 token 注入，测试模块可以用 `useValue/useClass/useFactory` 替换真实实现，从而隔离数据库、HTTP 客户端等外部系统；再用 e2e 测试验证完整请求管线。

可能被追问：如何设计统一错误码？如何区分业务异常和系统异常？如何实现 shutdown timeout 和 readiness/liveness？

---

## 9. 一次完整请求的复盘与面试回答框架

### 9.1 示例链路

```ts
@Controller('orders')
@UseGuards(AuthGuard)
@UseInterceptors(TimingInterceptor)
class OrderController {
  @Post()
  create(@Body(new ValidationPipe({ transform: true })) dto: CreateOrderDto) {
    return this.orders.create(dto);
  }
}
```

一次 `POST /orders` 可以这样解释：

```text
1. Node HTTP server 接收 socket 数据，Express/Fastify 解析 HTTP
2. adapter 执行底层 middleware，Nest middleware 继续处理
3. AuthGuard 通过 ExecutionContext 读取 request 并决定是否放行
4. TimingInterceptor 建立 Observable 环绕链
5. ValidationPipe 转换并校验 body
6. Controller 调用通过 DI 注入的 OrderService
7. Promise/Observable 结果回到 Interceptor，记录耗时/转换响应
8. 若抛出异常，异常沿链传播到匹配的 Exception Filter
9. adapter 序列化结果并写回 socket
```

### 9.2 一段可直接复述的高质量面试答案

> NestJS 的核心是启动期元数据扫描加运行期请求管线。TypeScript 装饰器和 `reflect-metadata` 记录 module、controller、route 以及构造函数参数信息；`DependenciesScanner` 递归建立模块图，DI 容器按 token、imports/exports 和 scope 解析 provider，并由 Injector 创建实例。随后 Nest 把 controller 方法包装成 handler，注册到底层 Express/Fastify adapter。请求进入后先经过 middleware，再由 Guard 决定是否放行，Pipe 负责参数转换校验，Interceptor 通过 RxJS Observable 形成 AOP 式环绕链，Controller 执行结果或异常最后交给响应处理或 Exception Filter。Nest 提供的是架构和执行模型，真正的网络 I/O 仍然由 Node.js 与 adapter 完成。

### 9.3 面试官最想听到的层次

- 只说“Nest 是基于装饰器的 Node 框架”：说明停留在 API 层。
- 能说“有 DI、Guard、Interceptor”：说明知道组件名称，但还不够。
- 能说明“装饰器写 metadata → 启动扫描 → 容器建立依赖图 → adapter 注册路由 → 请求按管线执行”：说明理解运行机制。
- 能进一步指出 interface 在运行时消失、scope 有性能代价、Filter 是异常边界、Fastify 不是完全兼容 Express：说明有工程判断。

### 9.4 最终复习清单

- 能画出 Nest 启动和请求两条流程。
- 能解释 `@Injectable()`、`@Inject()`、`@Global()`、`forwardRef()` 的真实作用和边界。
- 能说明 `emitDecoratorMetadata` 为什么不能提供 interface/generic 的运行时信息。
- 能区分 Middleware、Guard、Pipe、Interceptor、Filter 的职责和执行位置。
- 能解释 Interceptor 为什么依赖 Observable，以及订阅时机为什么重要。
- 能把 Nest 的 DI、AOP、Express/Fastify middleware 和 Node event loop 串成一条链。
- 能在回答中主动提到可测试性、模块边界、作用域性能和 adapter 耦合，而不是只背 API。

