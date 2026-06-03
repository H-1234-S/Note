## NestJS 学习指南

> 基于 NestJS 11 系列整理；截至 2026-05-21 查询，`@nestjs/core` 的 npm latest 为 `11.1.6`。  
> 参考资料以官方文档为主：  
> - https://nestjs.com/
> - https://docs.nestjs.com/
> - https://docs.nestjs.com/controllers
> - https://docs.nestjs.com/components
> - https://docs.nestjs.com/modules
> - https://docs.nestjs.com/faq/request-lifecycle

## 1. NestJS 是什么

NestJS 是一个用于构建 Node.js 服务端应用的框架。它默认使用 TypeScript，吸收了 Angular 的模块化、装饰器、依赖注入等设计，同时可以运行在 Express 或 Fastify 之上。

你可以把 NestJS 理解成：

- Express/Fastify 负责底层 HTTP 能力。
- NestJS 负责组织代码结构、依赖注入、生命周期、模块边界、请求处理管道。
- TypeScript 负责类型约束和工程可维护性。

适合使用 NestJS 的场景：

- REST API 后端。
- GraphQL API。
- WebSocket 实时应用。
- 微服务、消息队列、事件驱动系统。
- 企业级业务系统、BFF、后台管理系统后端。

不一定适合的场景：

- 极小型脚本或一次性服务。
- 对启动速度和运行时抽象层极端敏感的轻量接口。
- 团队完全不使用 TypeScript，且不愿接受装饰器和 DI 思维。

## 2. 学习前置知识

建议先具备以下基础：

- JavaScript ES2015+：类、模块、Promise、async/await。
- TypeScript：类型、接口、泛型、装饰器基础。
- Node.js：npm、模块系统、环境变量、HTTP 基础。
- HTTP：请求方法、状态码、请求头、路径参数、查询参数、请求体。
- 后端基础：MVC、分层架构、数据库、认证授权。

装饰器示意：

```ts
function LogClass(target: Function) {
  console.log(target.name);
}

@LogClass
class UserService {}
```

NestJS 大量使用装饰器给类、方法、参数附加元数据，框架运行时会读取这些元数据，生成路由映射、依赖关系和执行流程。

## 3. 快速开始

安装 CLI：

```bash
npm i -g @nestjs/cli
```

创建项目：

```bash
nest new hello-nest
```

启动开发服务：

```bash
cd hello-nest
npm run start:dev
```

常用 CLI：

```bash
nest g module users
nest g controller users
nest g service users
nest g resource users
```

`nest g resource users` 会交互式生成一个比较完整的 CRUD 资源，适合初学者观察 NestJS 如何组织模块、控制器、服务、DTO 和测试文件。

典型目录：

```txt
src/
  main.ts
  app.module.ts
  app.controller.ts
  app.service.ts
```

最小启动入口：

```ts
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

根模块：

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

启动时发生了什么：

1. `NestFactory.create(AppModule)` 创建 Nest 应用实例。
2. Nest 从 `AppModule` 开始扫描模块元数据。
3. 解析 `imports`，构建模块依赖图。
4. 收集 `controllers`，建立路由映射。
5. 收集 `providers`，交给 IoC 容器管理。
6. 初始化生命周期钩子。
7. 绑定到底层 HTTP 适配器，默认是 Express。
8. `listen()` 开始接收请求。

## 4. NestJS 的核心架构

NestJS 最核心的三个构件：

- Module：模块，组织边界。
- Controller：控制器，接收请求并返回响应。
- Provider：提供者，通常是 Service，承载业务逻辑并可被注入。

一个简单特性模块通常长这样：

```txt
src/users/
  dto/
    create-user.dto.ts
    update-user.dto.ts
  entities/
    user.entity.ts
  users.controller.ts
  users.service.ts
  users.module.ts
```

请求调用链：

```txt
HTTP Request
  -> Middleware
  -> Guard
  -> Interceptor before
  -> Pipe
  -> Controller method
  -> Service / Repository / External API
  -> Interceptor after
  -> Exception Filter if error
  -> HTTP Response
```

模块依赖图：

```txt
AppModule
  imports UsersModule
  imports AuthModule
  imports ConfigModule

UsersModule
  controllers UsersController
  providers UsersService
  exports UsersService

AuthModule
  imports UsersModule
  providers AuthService
```

关键思想：

- Controller 不直接写复杂业务。
- Service 承担业务逻辑。
- Repository 或 ORM 层承担数据访问。
- Module 控制可见性，只有 `exports` 出去的 provider 才能被其他模块使用。
- DI 容器负责创建和复用对象。

## 5. Controller：请求入口

Controller 负责处理请求和响应。

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('keyword') keyword?: string) {
    return this.usersService.findAll(keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
```

常用装饰器：

| 装饰器 | 作用 |
| --- | --- |
| `@Controller('users')` | 定义控制器路由前缀 |
| `@Get()` | 定义 GET 路由 |
| `@Post()` | 定义 POST 路由 |
| `@Patch()` | 定义 PATCH 路由 |
| `@Delete()` | 定义 DELETE 路由 |
| `@Param()` | 获取路径参数 |
| `@Query()` | 获取查询参数 |
| `@Body()` | 获取请求体 |
| `@Headers()` | 获取请求头 |
| `@Req()` | 获取底层 request |
| `@Res()` | 获取底层 response |
| `@HttpCode()` | 指定响应状态码 |
| `@Header()` | 指定响应头 |

推荐写法：

```ts
@Post()
@HttpCode(201)
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

谨慎使用 `@Res()`：

```ts
@Get('raw')
raw(@Res() res: Response) {
  return res.status(200).json({ ok: true });
}
```

使用 `@Res()` 后，你通常会接管响应流程，部分 Nest 特性，如拦截器响应转换、自动序列化、`@HttpCode()` 等可能不会按标准方式工作。只有在文件下载、流式响应、特殊 header 控制时再使用。

## 6. Provider 与 Service：业务逻辑层

Provider 是可以被 Nest DI 容器管理和注入的类、值、工厂或别名。最常见的 provider 是 service。

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type User = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  findAll(keyword?: string) {
    if (!keyword) return this.users;
    return this.users.filter((user) => user.name.includes(keyword));
  }

  findOne(id: number) {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  create(dto: CreateUserDto) {
    const user = {
      id: this.nextId++,
      ...dto,
    };

    this.users.push(user);
    return user;
  }

  update(id: number, dto: UpdateUserDto) {
    const user = this.findOne(id);
    Object.assign(user, dto);
    return user;
  }

  remove(id: number) {
    const user = this.findOne(id);
    this.users = this.users.filter((item) => item.id !== user.id);
    return { deleted: true };
  }
}
```

构造函数注入：

```ts
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
}
```

Nest 根据构造函数参数类型解析依赖。`UsersService` 必须在当前模块的 `providers` 中，或者由导入模块 `exports` 出来。

### 自定义 Provider

类 Provider：

```ts
{
  provide: UsersService,
  useClass: UsersService,
}
```

值 Provider：

```ts
export const JWT_OPTIONS = 'JWT_OPTIONS';

{
  provide: JWT_OPTIONS,
  useValue: {
    secret: 'dev-secret',
    expiresIn: '1h',
  },
}
```

注入值：

```ts
import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from './tokens';

@Injectable()
export class TokenService {
  constructor(
    @Inject(JWT_OPTIONS)
    private readonly options: { secret: string; expiresIn: string },
  ) {}
}
```

工厂 Provider：

```ts
{
  provide: 'DATABASE_CONNECTION',
  useFactory: async (configService: ConfigService) => {
    return createConnection({
      url: configService.get<string>('DATABASE_URL'),
    });
  },
  inject: [ConfigService],
}
```

别名 Provider：

```ts
{
  provide: 'USER_REPOSITORY',
  useExisting: UsersRepository,
}
```

Provider 作用域：

| 作用域 | 含义 | 使用建议 |
| --- | --- | --- |
| 默认 singleton | 应用生命周期内通常一个实例 | 大多数 service 使用这个 |
| request | 每个请求一个实例 | 需要请求级状态时使用，成本更高 |
| transient | 每次注入创建新实例 | 少数工具类或上下文隔离场景 |

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {}
```

## 7. Module：组织边界与依赖可见性

模块用于组织代码，定义组件之间的可见范围。

```ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

`@Module()` 元数据：

| 字段 | 作用 |
| --- | --- |
| `imports` | 导入其他模块暴露出来的能力 |
| `controllers` | 当前模块拥有的 HTTP 控制器 |
| `providers` | 当前模块注册的 provider |
| `exports` | 暴露给其他模块使用的 provider 或 module |

其他模块使用 `UsersService`：

```ts
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
```

如果 `UsersModule` 没有 `exports: [UsersService]`，`AuthModule` 就不能注入 `UsersService`。

### 共享模块

共享模块用于导出通用能力：

```ts
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class SharedModule {}
```

### 全局模块

```ts
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
```

全局模块只需导入一次，之后其他模块可直接注入其导出的 provider。不要滥用全局模块，否则模块依赖关系会变得隐蔽。

### 动态模块

动态模块用于让模块在导入时接收配置。

```ts
import { DynamicModule, Module } from '@nestjs/common';

export interface LoggerModuleOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
}

export const LOGGER_OPTIONS = 'LOGGER_OPTIONS';

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_OPTIONS,
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
```

使用：

```ts
@Module({
  imports: [
    LoggerModule.forRoot({
      level: 'info',
    }),
  ],
})
export class AppModule {}
```

命名习惯：

- `register()`：当前导入模块私有配置。
- `forRoot()`：应用级配置，通常只配置一次。
- `forFeature()`：为某个特性模块注册局部能力，例如 ORM 的实体或模型。

## 8. DTO、Pipe 与参数校验

DTO 是 Data Transfer Object，用来描述请求或响应的数据形状。

安装校验依赖：

```bash
npm i class-validator class-transformer
```

DTO：

```ts
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 20)
  name: string;

  @IsEmail()
  email: string;
}
```

全局启用校验：

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
```

配置解释：

| 选项 | 作用 |
| --- | --- |
| `whitelist` | 自动移除 DTO 未声明的字段 |
| `forbidNonWhitelisted` | 出现多余字段时报错 |
| `transform` | 自动把普通对象转换为 DTO 实例，也可转换参数类型 |

路径参数转换：

```ts
import { ParseIntPipe } from '@nestjs/common';

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```

常用内置 Pipe：

- `ValidationPipe`
- `ParseIntPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `DefaultValuePipe`

自定义 Pipe：

```ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException(`${metadata.data ?? 'value'} is empty`);
    }

    return trimmed;
  }
}
```

使用：

```ts
@Get()
findAll(@Query('keyword', TrimPipe) keyword: string) {
  return this.usersService.findAll(keyword);
}
```

## 9. Middleware：中间件

Middleware 运行在路由处理之前，适合做日志、简单鉴权、请求 ID、原始 body 处理等。

函数式中间件：

```ts
import { NextFunction, Request, Response } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
```

类中间件：

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
```

注册：

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

Middleware 与 Guard 的区别：

- Middleware 更接近底层 HTTP，用于通用请求预处理。
- Guard 更懂 Nest 上下文，用于判断某个 handler 是否允许执行。

## 10. Guard：认证与授权

Guard 决定请求是否可以继续执行。

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (token !== 'dev-token') {
      throw new UnauthorizedException();
    }

    return true;
  }
}
```

使用：

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  @Get()
  findMe() {
    return { id: 1, name: 'Ada' };
  }
}
```

基于角色的授权：

```ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.includes(user?.role);
  }
}
```

```ts
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
remove(@Param('id') id: string) {
  return this.usersService.remove(Number(id));
}
```

Guard 执行顺序：全局 Guard -> 控制器 Guard -> 方法 Guard。

## 11. Interceptor：拦截器

Interceptor 可以在 handler 前后执行逻辑，也可以修改返回值或异常。它类似 AOP。

日志拦截器：

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const cost = Date.now() - startedAt;
        console.log(`${request.method} ${request.url} ${cost}ms`);
      }),
    );
  }
}
```

响应包装：

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { data: T; success: true }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: T; success: true }> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
```

全局注册：

```ts
app.useGlobalInterceptors(new TransformInterceptor());
```

如果拦截器需要依赖注入，推荐用 `APP_INTERCEPTOR`：

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

## 12. Exception Filter：异常处理

Nest 内置异常层会处理未捕获异常。业务中通常直接抛出内置 HTTP 异常：

```ts
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

throw new BadRequestException('Invalid input');
throw new ForbiddenException('No permission');
throw new NotFoundException('User not found');
```

常用异常：

- `BadRequestException`：400。
- `UnauthorizedException`：401。
- `ForbiddenException`：403。
- `NotFoundException`：404。
- `ConflictException`：409。
- `UnprocessableEntityException`：422。
- `InternalServerErrorException`：500。

自定义异常过滤器：

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      error: body,
    });
  }
}
```

注册：

```ts
app.useGlobalFilters(new HttpExceptionFilter());
```

如果过滤器需要注入服务，也推荐用 provider 形式：

```ts
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

## 13. 请求运行流程详解

一次 HTTP 请求的典型执行顺序：

1. 收到底层平台请求，Express 或 Fastify 接管。
2. 执行全局中间件。
3. 执行模块或路由中间件。
4. 匹配 Controller 和 route handler。
5. 执行全局 Guard。
6. 执行控制器级 Guard。
7. 执行方法级 Guard。
8. 执行全局 Interceptor 的前置逻辑。
9. 执行控制器级 Interceptor 的前置逻辑。
10. 执行方法级 Interceptor 的前置逻辑。
11. 执行 Pipe，转换和校验参数。
12. 执行 Controller 方法。
13. Controller 调用 Service。
14. Service 调用 Repository、数据库、缓存、消息队列或外部 API。
15. 返回结果，依次经过 Interceptor 的后置逻辑。
16. 如果过程中抛出异常，进入 Exception Filter。
17. 生成 HTTP 响应。

简图：

```txt
request
  -> middleware
  -> guards
  -> interceptors before
  -> pipes
  -> controller
  -> service
  -> interceptors after
  -> filters if error
  -> response
```

注意 Pipe 的位置：Pipe 是在 Guard 通过之后、Controller 方法执行之前，针对方法参数运行。

## 14. 生命周期

Nest 应用本身和其中的模块、provider、controller 都由 Nest 管理生命周期。

常用生命周期钩子：

| 钩子 | 触发时机 |
| --- | --- |
| `onModuleInit()` | 当前模块依赖初始化完成后 |
| `onApplicationBootstrap()` | 全部模块初始化后，应用开始监听前 |
| `onModuleDestroy()` | 收到关闭信号后 |
| `beforeApplicationShutdown()` | 应用关闭前 |
| `onApplicationShutdown()` | 应用关闭时 |

示例：

```ts
import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy
{
  async onModuleInit() {
    await this.connect();
  }

  onApplicationBootstrap() {
    console.log('Application is ready');
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {}

  private async disconnect() {}
}
```

启用关闭钩子：

```ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();
await app.listen(3000);
```

常见用途：

- 初始化数据库连接。
- 启动定时任务。
- 加载配置或缓存。
- 关闭数据库连接、队列连接、文件句柄。
- 在容器化部署中响应 `SIGTERM`。

## 15. 配置管理

安装：

```bash
npm i @nestjs/config
```

使用：

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppModule {}
```

读取配置：

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getPort() {
    return this.configService.get<number>('PORT', 3000);
  }
}
```

命名空间配置：

```ts
// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  poolSize: Number(process.env.DATABASE_POOL_SIZE ?? 10),
}));
```

```ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig],
});
```

读取：

```ts
const url = this.configService.get<string>('database.url');
```

配置校验可以用 Joi 或自定义函数。生产项目建议启动时验证关键环境变量，否则错误会延迟到运行时才暴露。

## 16. 数据库集成

NestJS 不强制绑定 ORM。常见选择：

- Prisma：类型友好，现代项目常用。
- TypeORM：Nest 生态经典方案。
- MikroORM：Data Mapper 风格。
- Mongoose：MongoDB 常用。

### Prisma 示例

安装：

```bash
npm i prisma @prisma/client
npx prisma init
```

创建 PrismaService：

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

模块：

```ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Service 使用：

```ts
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }
}
```

### TypeORM 示例

安装：

```bash
npm i @nestjs/typeorm typeorm pg
```

注册：

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: false,
    }),
  ],
})
export class AppModule {}
```

实体：

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

特性模块：

```ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

Repository 注入：

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }
}
```

## 17. 认证与授权

常见认证流程：

1. 用户提交账号密码。
2. 服务端验证用户。
3. 生成 JWT。
4. 客户端请求时携带 `Authorization: Bearer <token>`。
5. Guard 验证 token，并把 user 挂到 request。
6. Controller 或 Service 使用当前用户信息。

安装：

```bash
npm i @nestjs/jwt passport passport-jwt
npm i -D @types/passport-jwt
```

JWT 模块：

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

生成 token：

```ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(user: { id: number; email: string; role: string }) {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  }
}
```

自定义 JWT Guard：

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: { headers: Record<string, string> }) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

生产注意：

- 密码必须 hash，例如 bcrypt 或 argon2。
- JWT secret 必须来自环境变量或密钥管理系统。
- access token 设置较短过期时间。
- refresh token 需要可撤销机制。
- 权限逻辑不要只放前端。

## 18. 文件上传

Nest 的文件上传通常基于 Multer。

```bash
npm i -D @types/multer
```

单文件上传：

```ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
```

多文件上传：

```ts
@Post('upload-many')
@UseInterceptors(FilesInterceptor('files', 10))
uploadMany(@UploadedFiles() files: Express.Multer.File[]) {
  return files.map((file) => file.originalname);
}
```

生产建议：

- 限制文件大小。
- 校验 MIME 类型和扩展名。
- 不要信任原始文件名。
- 上传到对象存储，如 S3、OSS、COS。
- 对用户可访问文件使用独立静态域名或签名 URL。

## 19. Swagger / OpenAPI

安装：

```bash
npm i @nestjs/swagger swagger-ui-express
```

启用：

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Users API')
  .setDescription('User management API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

DTO 文档：

```ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ada' })
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;
}
```

Controller 文档：

```ts
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get user list' })
  findAll() {
    return this.usersService.findAll();
  }
}
```

## 20. 日志

Nest 内置 `Logger`：

```ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  findAll() {
    this.logger.log('Finding users');
    return [];
  }
}
```

启动时指定日志级别：

```ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug'],
});
```

生产项目常用 pino 或 winston，并把 request id、user id、trace id 放入日志上下文。

## 21. 缓存

安装：

```bash
npm i @nestjs/cache-manager cache-manager
```

注册：

```ts
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60_000,
      max: 100,
    }),
  ],
})
export class AppModule {}
```

使用缓存拦截器：

```ts
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, UseInterceptors } from '@nestjs/common';

@Controller('stats')
@UseInterceptors(CacheInterceptor)
export class StatsController {
  @Get()
  getStats() {
    return expensiveQuery();
  }
}
```

手动缓存：

```ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async findOne(id: number) {
    const key = `users:${id}`;
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const user = await this.loadUser(id);
    await this.cache.set(key, user, 60_000);
    return user;
  }

  private async loadUser(id: number) {
    return { id, name: 'Ada' };
  }
}
```

缓存适合：

- 读多写少的数据。
- 计算成本高的数据。
- 第三方 API 响应。

缓存不适合：

- 强一致性数据。
- 权限高度敏感且难以隔离的数据。
- 频繁变化且无明确失效策略的数据。

## 22. 定时任务

安装：

```bash
npm i @nestjs/schedule
```

注册：

```ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class AppModule {}
```

使用：

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.log('Runs every minute');
  }

  @Interval(10_000)
  handleInterval() {
    this.logger.log('Runs every 10 seconds');
  }

  @Timeout(5_000)
  handleTimeout() {
    this.logger.log('Runs once after 5 seconds');
  }
}
```

分布式部署时注意：

- 多实例会重复执行同一个定时任务。
- 需要分布式锁、队列、Leader 选举或单独 worker 服务。

## 23. 队列

常见方案是 BullMQ。

```bash
npm i @nestjs/bullmq bullmq ioredis
```

注册：

```ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'emails',
    }),
  ],
})
export class AppModule {}
```

生产任务：

```ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EmailsService {
  constructor(@InjectQueue('emails') private readonly emailsQueue: Queue) {}

  async sendWelcomeEmail(userId: number) {
    await this.emailsQueue.add('welcome', { userId });
  }
}
```

消费任务：

```ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('emails')
export class EmailsProcessor extends WorkerHost {
  async process(job: Job<{ userId: number }>) {
    if (job.name === 'welcome') {
      await this.sendWelcome(job.data.userId);
    }
  }

  private async sendWelcome(userId: number) {}
}
```

队列适合：

- 邮件、短信、通知。
- 图片、视频处理。
- 需要重试的外部 API 调用。
- 延迟任务。
- 削峰填谷。

## 24. WebSocket

安装：

```bash
npm i @nestjs/websockets @nestjs/platform-socket.io
```

Gateway：

```ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() body: { room: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(body.room).emit('message', {
      clientId: client.id,
      text: body.text,
    });
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    return { joined: room };
  }
}
```

Gateway 也可以使用 pipe、guard、interceptor、filter。认证通常在握手阶段解析 token。

## 25. GraphQL

安装 Apollo 方案：

```bash
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

注册：

```ts
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
})
export class AppModule {}
```

ObjectType：

```ts
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;
}
```

Resolver：

```ts
import { Args, Int, Query, Resolver } from '@nestjs/graphql';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users() {
    return this.usersService.findAll();
  }

  @Query(() => User)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }
}
```

GraphQL 与 REST 的主要差异：

- REST 以资源 URL 为中心。
- GraphQL 以 schema 和字段查询为中心。
- GraphQL 需要重点处理 N+1 查询，常用 DataLoader。

## 26. 微服务

Nest 微服务使用非 HTTP 的传输层通信，支持 TCP、Redis、NATS、MQTT、RabbitMQ、Kafka、gRPC 等。

TCP 微服务：

```ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 8877,
      },
    },
  );

  await app.listen();
}

bootstrap();
```

消息处理：

```ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  sum(@Payload() data: number[]) {
    return data.reduce((total, item) => total + item, 0);
  }
}
```

客户端：

```ts
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

const client: ClientProxy = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: {
    host: '127.0.0.1',
    port: 8877,
  },
});

const result$ = client.send<number>({ cmd: 'sum' }, [1, 2, 3]);
```

微服务设计注意：

- 明确同步调用和异步事件的区别。
- 给消息定义稳定契约。
- 处理超时、重试、幂等、死信队列。
- 不要为了微服务而微服务，模块化单体通常是更稳的起点。

## 27. 测试

Nest 默认使用 Jest。

Service 单元测试：

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get(UsersService);
  });

  it('creates user', () => {
    const user = service.create({
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(user.id).toBe(1);
  });
});
```

Mock 依赖：

```ts
const prismaMock = {
  user: {
    findMany: jest.fn(),
  },
};

const module = await Test.createTestingModule({
  providers: [
    UsersService,
    {
      provide: PrismaService,
      useValue: prismaMock,
    },
  ],
}).compile();
```

E2E 测试：

```ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect([]);
  });
});
```

测试分层建议：

- Service：单元测试，覆盖业务规则。
- Controller：少量测试，确认参数和返回。
- E2E：覆盖关键链路，如注册、登录、支付回调。
- 数据库相关：使用测试数据库或 Testcontainers。

## 28. 项目结构建议

中小型项目：

```txt
src/
  main.ts
  app.module.ts
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
  config/
  database/
  modules/
    users/
      dto/
      users.controller.ts
      users.service.ts
      users.module.ts
    auth/
      dto/
      auth.controller.ts
      auth.service.ts
      auth.module.ts
```

大型项目可以按领域拆：

```txt
src/
  bootstrap/
  shared/
  infrastructure/
    database/
    cache/
    queue/
  domains/
    users/
      application/
      domain/
      infrastructure/
      interfaces/
    billing/
    orders/
```

分层原则：

- `interfaces` 或 `controllers`：处理传输层协议。
- `application`：编排用例。
- `domain`：核心业务规则。
- `infrastructure`：数据库、缓存、外部 API。
- `shared/common`：真正跨领域复用的东西。

不要一开始就过度设计。多数项目从按 feature module 拆分最舒服，复杂度上来后再演进。

## 29. 常见工程配置

### CORS

```ts
app.enableCors({
  origin: ['http://localhost:5173', 'https://example.com'],
  credentials: true,
});
```

### 全局前缀

```ts
app.setGlobalPrefix('api');
```

接口路径会变成 `/api/users`。

### 版本控制

```ts
import { VersioningType } from '@nestjs/common';

app.enableVersioning({
  type: VersioningType.URI,
});
```

```ts
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {}
```

路径：`/v1/users`。

### 静态资源

```bash
npm i @nestjs/serve-static
```

```ts
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
})
export class AppModule {}
```

### Fastify 适配器

```bash
npm i @nestjs/platform-fastify
```

```ts
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
```

Express 生态更广，Fastify 性能更强。项目初期用默认 Express 通常足够。

## 30. API 设计建议

REST 示例：

```txt
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

分页：

```ts
export class PageQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
```

统一分页返回：

```ts
type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

状态码建议：

- 查询成功：200。
- 创建成功：201。
- 删除成功但无响应体：204。
- 参数错误：400。
- 未登录：401。
- 无权限：403。
- 资源不存在：404。
- 冲突，例如邮箱重复：409。
- 业务校验失败：422。

## 31. 安全

常用安全措施：

- 使用 Helmet 设置安全响应头。
- 限制 CORS 来源。
- 使用 ValidationPipe 严格校验输入。
- 密码 hash，不存明文。
- API 鉴权和授权都在服务端执行。
- 限流防爆破。
- 日志不要输出密码、token、身份证号等敏感信息。
- SQL 使用 ORM 参数化查询，避免拼接字符串。
- 文件上传限制大小和类型。

Helmet：

```bash
npm i helmet
```

```ts
import helmet from 'helmet';

app.use(helmet());
```

限流：

```bash
npm i @nestjs/throttler
```

```ts
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

## 32. 性能与可观测性

性能关注点：

- 避免 request scoped provider 滥用。
- 数据库查询加索引。
- 避免 N+1 查询。
- 大列表必须分页。
- 文件上传和下载使用流。
- CPU 密集任务放 worker 或队列。
- 缓存热点数据。

可观测性关注点：

- 结构化日志。
- request id / trace id。
- 错误监控，如 Sentry。
- 指标监控，如 Prometheus。
- 健康检查。

健康检查：

```bash
npm i @nestjs/terminus
```

```ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
```

## 33. 部署

构建：

```bash
npm run build
```

生产启动：

```bash
node dist/main.js
```

Dockerfile 示例：

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

生产配置建议：

- 使用 `NODE_ENV=production`。
- 环境变量不要写死在镜像中。
- 开启 shutdown hook，优雅关闭。
- 数据库迁移作为独立步骤执行。
- 使用进程管理或容器编排重启失败实例。
- 日志输出到 stdout/stderr，由平台采集。

## 34. 常见错误

### Nest can't resolve dependencies

原因通常是 provider 没有注册，或者没有从模块导出。

检查：

- 当前模块 `providers` 是否包含该 provider。
- 如果来自其他模块，其他模块是否 `exports` 了它。
- 当前模块是否 `imports` 了其他模块。
- 是否存在循环依赖。

### 循环依赖

模块循环：

```ts
@Module({
  imports: [forwardRef(() => AuthModule)],
})
export class UsersModule {}
```

Provider 循环：

```ts
constructor(
  @Inject(forwardRef(() => UsersService))
  private readonly usersService: UsersService,
) {}
```

更好的办法是重新划分职责，抽取第三个服务或模块，减少互相知道。

### DTO 校验不生效

检查：

- 是否安装 `class-validator` 和 `class-transformer`。
- 是否启用了 `ValidationPipe`。
- DTO 是否是 class，而不是 interface。
- DTO 属性是否添加了校验装饰器。
- 请求体字段名是否正确。

### `@Param('id')` 还是 string

HTTP 参数天然是字符串。使用 `ParseIntPipe` 或全局 `transform`。

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}
```

### 使用 `@Res()` 后拦截器不生效

你接管了响应对象。除非确实需要底层 response，否则返回普通对象即可。

## 35. 学习路线

第一阶段：入门

1. 创建 Nest 项目。
2. 理解 `main.ts` 和 `AppModule`。
3. 写一个 `UsersController`。
4. 写一个 `UsersService`。
5. 理解 Controller 调 Service。
6. 用 DTO 和 ValidationPipe 校验请求体。

练习：

- 实现用户 CRUD。
- 用数组模拟数据库。
- 所有路径参数使用 `ParseIntPipe`。
- 创建失败时抛 `BadRequestException`。

第二阶段：核心机制

1. 理解 Module 的 `imports/providers/controllers/exports`。
2. 写共享模块。
3. 写自定义 provider。
4. 写 Guard 做登录校验。
5. 写 Interceptor 做统一响应。
6. 写 Exception Filter 做统一错误格式。
7. 理解请求生命周期。

练习：

- 实现 `AuthGuard`。
- 实现 `RolesGuard`。
- 实现 `TransformInterceptor`。
- 实现 `HttpExceptionFilter`。

第三阶段：工程能力

1. 接入 ConfigModule。
2. 接入 Prisma 或 TypeORM。
3. 实现 JWT 登录。
4. 接入 Swagger。
5. 写单元测试和 E2E 测试。
6. 加入日志、限流、健康检查。

练习：

- 用户注册和登录。
- JWT 保护 `/profile`。
- 管理员才能删除用户。
- Swagger 展示 API。
- E2E 测试覆盖注册和登录。

第四阶段：进阶应用

1. 队列和定时任务。
2. WebSocket。
3. GraphQL。
4. 微服务。
5. 分布式部署和可观测性。
6. 领域建模和架构演进。

练习：

- 注册成功后投递欢迎邮件任务。
- 用 WebSocket 实现聊天室。
- 用 GraphQL 实现用户查询。
- 拆分一个 TCP 微服务做计算任务。

## 36. 一个完整的小例子

目标：实现一个内存版文章 API。

目录：

```txt
src/articles/
  dto/create-article.dto.ts
  dto/update-article.dto.ts
  articles.controller.ts
  articles.service.ts
  articles.module.ts
```

DTO：

```ts
// src/articles/dto/create-article.dto.ts
import { IsString, Length } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @Length(2, 80)
  title: string;

  @IsString()
  @Length(1, 5000)
  content: string;
}
```

```ts
// src/articles/dto/update-article.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
```

Service：

```ts
// src/articles/articles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

type Article = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

@Injectable()
export class ArticlesService {
  private articles: Article[] = [];
  private nextId = 1;

  findAll() {
    return this.articles;
  }

  findOne(id: number) {
    const article = this.articles.find((item) => item.id === id);

    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }

    return article;
  }

  create(dto: CreateArticleDto) {
    const article: Article = {
      id: this.nextId++,
      ...dto,
      createdAt: new Date(),
    };

    this.articles.push(article);
    return article;
  }

  update(id: number, dto: UpdateArticleDto) {
    const article = this.findOne(id);
    Object.assign(article, dto);
    return article;
  }

  remove(id: number) {
    const article = this.findOne(id);
    this.articles = this.articles.filter((item) => item.id !== article.id);
    return { deleted: true };
  }
}
```

Controller：

```ts
// src/articles/articles.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
```

Module：

```ts
// src/articles/articles.module.ts
import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
```

接入根模块：

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [ArticlesModule],
})
export class AppModule {}
```

全局校验：

```ts
// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
```

测试请求：

```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"NestJS 入门\",\"content\":\"第一篇文章\"}"

curl http://localhost:3000/articles
curl http://localhost:3000/articles/1
```

这个例子串起了 NestJS 最重要的入门链路：

```txt
Module 注册 Controller 和 Service
Controller 接收请求
DTO 描述输入
Pipe 校验和转换输入
Service 执行业务
异常由 Nest 自动转换为 HTTP 响应
```

## 37. NestJS 心智模型总结

学习 NestJS 时，抓住这几句话：

- Module 是边界，决定哪些东西属于一起，哪些东西可以暴露出去。
- Controller 是入口，负责把 HTTP 请求变成方法调用。
- Service 是业务，负责规则、流程和数据操作。
- Provider 是可注入对象，Nest DI 容器负责创建和装配。
- Pipe 处理输入，Guard 判断能不能进，Interceptor 包裹执行过程，Filter 处理错误。
- 生命周期钩子用于初始化和关闭资源。
- Nest 的价值不只是写接口，而是给大型后端应用提供稳定的组织方式。

建议你真正掌握 NestJS 的方式不是背 API，而是围绕一个业务例子反复扩展：

1. 先写 CRUD。
2. 加 DTO 校验。
3. 加统一异常和响应。
4. 加 JWT 登录。
5. 接数据库。
6. 写测试。
7. 加缓存、队列、定时任务。
8. 最后再看 GraphQL、WebSocket、微服务。

这样学，NestJS 的抽象会从“装饰器很多”慢慢变成“每个层次都有明确职责”。
