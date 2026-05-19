## 1. 基础类型与类型系统
### 1.1 TypeScript有哪些基础数据类型？

**考点**：TypeScript类型系统基础

**基础类型**：

| 类型 | 示例 | 说明 |
|-----|------|-----|
| `number` | `let age: number = 25` | 数字类型 |
| `string` | `let name: string = 'Tom'` | 字符串类型 |
| `boolean` | `let isActive: boolean = true` | 布尔类型 |
| `null` | `let n: null = null` | 空值 |
| `undefined` | `let u: undefined = undefined` | 未定义 |
| `symbol` | `let sym: symbol = Symbol('id')` | 唯一标识符 |
| `bigint` | `let big: bigint = 100n` | 大整数 |

**字面量类型**：

```typescript
type Direction = 'north' | 'south' | 'east' | 'west'
type HttpStatus = 200 | 404 | 500
```

**特殊类型**：

- `any` - 任意类型，绕过类型检查
- `unknown` - 未知类型，比any更安全
- `void` - 空返回值
- `never` - 从不返回（抛异常/死循环）
- `object` - 非原始类型

---

### 1.2 TypeScript中any、unknown、never的区别？

**考点**：特殊类型语义理解

| 类型 | 特点 | 使用场景 |
|-----|------|---------|
| `any` | 绕过所有类型检查，可以赋值给任意类型 | 逐步迁移JS项目到老TS代码 |
| `unknown` | 未知类型，只能赋值给any和unknown，必须进行类型检查 | 处理来自API的外部数据 |
| `never` | 不可能存在的值的类型，无法赋值给任何类型 | 条件类型、类型收窄 |

**示例**：

```typescript
// any - 没有任何类型检查
let a: any = 'string'
a.toFixed() // 不报错，运行时错误

// unknown - 需要类型检查
let u: unknown = 'string'
if (typeof u === 'number') {
  u.toFixed() // 安全，必须检查
}

// never - 用于类型收窄
function handleError(err: string | Error): never {
  throw err // 函数从不返回
}
```

---

### 1.3 TypeScript中type和interface的区别？

**考点**：类型定义方式对比

| 特性 | type | interface |
|-----|------|----------|
| 定义对象类型 | ✅ | ✅ |
| 定义函数类型 | ✅ | ✅ |
| 定义元组类型 | ✅ | ✅ |
| 定义联合类型 | ✅ | ❌ |
| 定义交叉类型 | ✅ | ❌ |
| 声明合并（扩展） | ❌ | ✅ |
| 计算属性 | ✅ | ❌ |
| 可默认设置可选属性 | ✅ (?:) | ✅ (?:) |

**示例**：

```typescript
// type - 适合定义联合类型、交叉类型、元组
type ID = string | number
type Point = [number, number]
type Func = (x: number) => void

// interface - 适合定义对象结构，支持声明合并
interface User {
  name: string
  age: number
}
interface User {
  email: string // 合并，User现在有两个属性
}

// 交叉类型
type Admin = User & { privileges: string[] }
```

**何时选择**：
- 对象结构用 `interface`
- 联合类型/元组/条件类型用 `type`

---

### 1.4 什么是类型断言？有哪些方式？

**考点**：类型强制转换的理解

**方式一：as语法（推荐）**：

```typescript
let value: unknown = 'hello'
let len: number = (value as string).length
```

**方式二：尖括号语法**：

```typescript
let value: unknown = 'hello'
let len: number = (<string>value).length
```

**双重断言（尽量避免）**：

```typescript
// 尽量避免：从字面量类型 'hello' 断言为 number
let len = ('hello' as unknown as number).toFixed()
```

**非空断言**：

```typescript
let name: string | null = getName()
console.log(name!.toUpperCase()) // 确定name不为null
```

---

## 2. 接口与类型别名
### 2.1 接口的继承和交叉类型有什么区别？

**考点**：类型组合方式

**接口继承（extends）**：

```typescript
interface Animal {
  name: string
}
interface Dog extends Animal {
  breed: string
}
// Dog拥有 name 和 breed 两个属性
```

**交叉类型（&）**：

```typescript
interface Animal {
  name: string
}
interface Swimmer {
  depth: number
}
type Duck = Animal & Swimmer
// Duck拥有 name 和 depth 两个属性
```

**关键区别**：

| 特性 | extends | & |
|-----|--------|---|
| 同名字段的冲突处理 | 编译错误 | 交叉结果（never如果是冲突的基础类型） |
| 声明合并 | 支持 | 不支持 |
| 多重继承 | 可以 | 可以（嵌套使用） |

**同名字段冲突示例**：

```typescript
interface A {
  prop: string
}
interface B {
  prop: number
}
// interface C extends A, B {} // 错误：类型不兼容
type D = A & B // prop: string & number = never（如果A、B的prop是不兼容的）
```

---

### 2.2 可选属性和只读属性有什么区别？

**考点**：属性修饰符理解

**可选属性（?）**：

```typescript
interface Config {
  host?: string  // 可以不存在
  port?: number  // 可以是undefined
}
```

**只读属性（readonly）**：

```typescript
interface User {
  readonly id: number  // 创建后不可修改
  name: string
}
const user: User = { id: 1, name: 'Tom' }
user.id = 2 // 错误：只读属性不可修改
user.name = 'Jerry' // 正常
```

**注意**：`readonly` 只保证引用不可变，内部属性仍可变：

```typescript
interface Arr {
  readonly items: number[]
}
const arr: Arr = { items: [1, 2, 3] }
arr.items.push(4) // 正常，数组本身可变
arr.items = [5, 6] // 错误：引用不可变
```

---

### 2.3 函数类型如何定义？

**考点**：函数类型表达

**方式一：接口形式**：

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean
}
const mySearch: SearchFunc = function(src, sub) {
  return src.includes(sub)
}
```

**方式二：类型别名**：

```typescript
type SearchFunc = (source: string, subString: string) => boolean
```

**方式三：直接定义**：

```typescript
const mySearch: (source: string, subString: string) => boolean =
  function(src, sub) {
    return src.includes(sub)
  }
```

---

## 3. 泛型 

### 3.1 什么是泛型？为什么要用泛型？

**考点**：泛型基础概念

**为什么需要泛型**：

```typescript
// 不用泛型：只能用any，丢失类型信息
function identity(arg: any): any {
  return arg
}
const result = identity('hello')
// result是any，需要手动断言

// 使用泛型：保留类型信息
function identity<T>(arg: T): T {
  return arg
}
const result = identity('hello')
// result自动推断为string
```

**泛型的本质**：类型变量，延迟指定具体类型

---

### 3.2 泛型约束是什么？

**考点**：泛型的类型安全

**场景：访问泛型参数的属性**：

```typescript
// 错误：T不一定有length属性
function logLength<T>(arg: T): number {
  return arg.length // 报错
}

// 正确：使用泛型约束
function logLength<T extends { length: number }>(arg: T): number {
  return arg.length
}
logLength('hello') // 5
logLength([1, 2, 3]) // 3
logLength({ length: 10 }) // 10
```

**使用keyof约束**：

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: 'Tom', age: 25 }
const name = getProperty(user, 'name') // string
const age = getProperty(user, 'age') // number
// getProperty(user, 'email') // 错误：email不在user中
```

---

### 3.3 泛型接口和泛型类如何使用？

**考点**：泛型在实际类型中的应用

**泛型接口**：

```typescript
interface Container<T> {
  value: T
  getValue(): T
}
const numContainer: Container<number> = {
  value: 42,
  getValue() { return this.value }
}
```

**泛型类**：

```typescript
class Box<T> {
  private content: T
  constructor(value: T) {
    this.content = value
  }
  get(): T {
    return this.content
  }
}
const box = new Box<string>('hello')
const content: string = box.get()
```

**泛型默认值**：

```typescript
interface Response<T = any> {
  data: T
  status: number
}
```

---

### 3.4 什么是条件类型？

**考点**：高级类型操作

**基本语法**：

```typescript
T extends U ? X : Y
// 如果T可以赋值给U，则类型为X，否则为Y
```

**示例**：

```typescript
type IsString<T> = T extends string ? true : false
type A = IsString<string> // true
type B = IsString<number> // false

// 提取元素类型
type ElementType<T> = T extends Array<infer U> ? U : never
type C = ElementType<string[]> // string
type D = ElementType<number[]> // number
```

**distributive条件类型**：

```typescript
type ToArray<T> = T extends any ? T[] : never
type E = ToArray<string | number> // string[] | number[]
```

---

### 3.5 infer关键字的作用？

**考点**：类型推断

**用于从类型中提取子类型**：

```typescript
// 提取函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type A = ReturnType<() => string> // string
type B = ReturnType<() => Promise<number>> // Promise<number>

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never
type C = Parameters<(name: string, age: number) => void> // [string, number]

// 提取构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never
```

---

## 4. 装饰器
### 4.1 装饰器是什么？有哪些类型？

**考点**：装饰器基础（需开启experimentalDecorators）

**装饰器本质**：一种特殊函数，可以在不修改原类的情况下扩展功能

**装饰器类型**：

| 类型 | 语法 | 作用 |
|-----|------|-----|
| 类装饰器 | `@decorator` | 监视、修改或替换类定义 |
| 方法装饰器 | `@decorator` | 监视、修改或替换方法 |
| 访问器装饰器 | `@decorator` | 监视、修改或替换访问器 |
| 属性装饰器 | `@decorator` | 监视、修改或替换属性 |
| 参数装饰器 | `@decorator` | 监视、修改或替换参数 |

**示例**：

```typescript
// 类装饰器
function sealed(target: Function) {
  Object.seal(target)
  Object.seal(target.prototype)
}

@sealed
class MyClass {
  name: string
}

// 方法装饰器
function readonly(target: any, key: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false
  return descriptor
}

class Person {
  @readonly
  greet() { return 'Hello' }
}
```

---

### 4.2 装饰器执行顺序是什么？

**考点**：装饰器求值顺序

**规律**：

1. **从上到下**求值（编译时）
2. **从下到上**执行（运行时）

```typescript
function f(target: any) { console.log('f(): evaluated') }
function g(target: any) { console.log('g(): evaluated') }
function h(target: any) { console.log('h(): evaluated') }

class MyClass {
  @f
  @g
  @h
  method() {}
}

// 输出顺序：
// f(): evaluated
// g(): evaluated
// h(): evaluated
// h(): called
// g(): called
// f(): called
```

---

## 5. 类型守卫与类型缩小 

### 5.1 什么是类型守卫？有哪些类型？

**考点**：运行时类型检查

**类型守卫**：在条件语句中缩小类型范围的技术

**常见类型守卫**：

| 类型 | 示例 |
|-----|------|
| typeof | `typeof x === 'string'` |
| instanceof | `x instanceof Array` |
| in | `'name' in user` |
| 平等检查 | `x !== null` |
| 自定义守卫 | `function isString(x: unknown): x is string` |

---

### 5.2 自定义类型守卫如何使用？

**考点**：类型守卫实现

```typescript
interface Cat {
  meow(): void
}
interface Dog {
  bark(): void
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined
}

function speak(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow() // TypeScript知道是Cat
  } else {
    animal.bark() // TypeScript知道是Dog
  }
}
```

**与boolean返回值的区别**：

```typescript
// 返回boolean：无法帮助类型收窄
function isCatBool(animal: Cat | Dog): boolean {
  return (animal as Cat).meow !== undefined
}

// 返回类型谓词（x is T）：可以类型收窄
function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined
}
```

---

### 5.3 typeof的类型守卫有什么限制？

**考点**：typeof的局限性

**typeof只支持以下类型**：

```typescript
typeof 'string'  // 'string'
typeof 123       // 'number'
typeof true      // 'boolean'
typeof undefined // 'undefined'
typeof Symbol()  // 'symbol'
typeof BigInt(0) // 'bigint'
typeof function  // 'function'
typeof null     // 'object'  ⚠️ 是个bug
typeof []        // 'object'  ⚠️ 无法区分数组和对象
```

**解决方案：使用断言函数或库函数**：

```typescript
function isArray(arr: unknown): arr is any[] {
  return Array.isArray(arr)
}
```

---

## 6. 模块与命名空间

### 6.1 TypeScript的模块系统是怎样的？

**考点**：ES模块与TS模块

**导出方式**：

```typescript
// 命名导出
export const name = 'Tom'
export function greet() {}

// 默认导出
export default class MyClass {}

// 重新导出
export { name as aliasName }
export * from './other'
```

**导入方式**：

```typescript
import { name, greet } from './module'
import MyClass from './module'
import * as all from './module'
import './style.css' // 导入CSS（某些构建工具支持）
```

---

### 6.2 declare关键字的作用？

**考点**：类型声明

**用于声明类型而不实现**：

```typescript
// 声明全局变量
declare const MY_GLOBAL: string

// 声明全局函数
declare function myFunc(arg: number): void

// 声明模块
declare module 'my-module' {
  export function doSomething(): void
}

// 声明文件
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
    }
  }
}

// 声明类型（通常用于.d.ts文件）
declare type MyCallback = (error: Error | null) => void
```

---

### 6.3 如何避免模块间的循环依赖？

**考点**：循环依赖处理

**问题**：

```typescript
// a.ts
import { b } from './b'
export const a = 'a'

// b.ts
import { a } from './a' // 可能获取到undefined
export const b = 'b'
```

**解决方案**：

1. **延迟导入**（改用函数内导入）：

```typescript
// b.ts
export const b = 'b'
export function useA() {
  const { a } = require('./a') // 运行时加载
}
```

2. **重新设计架构**：避免A依赖B、B依赖A的结构

3. **提取公共模块**：将共享类型放到单独的C模块

---

## 7. 高级类型 

### 7.1 什么是映射类型？

**考点**：类型转换

**基本映射**：

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
type Partial<T> = {
  [P in keyof T]?: T[P]
}
type Required<T> = {
  [P in keyof T]-?: T[P] // -? 移除可选
}
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

**示例**：

```typescript
interface User {
  name: string
  age: number
}
type ReadonlyUser = Readonly<User>
// { readonly name: string; readonly age: number }

type PartialUser = Partial<User>
// { name?: string; age?: number }
```

---

### 7.2 同态类型和非同态类型的区别？

**考点**：映射类型本质

**同态类型**：作用于对象的属性，保留原始类型的结构

```typescript
type Partial<T> = { [P in keyof T]?: T[P] } // 同态
// 编译器会保留readonly等属性修饰
```

**非同态类型**：不依赖于输入类型，创建全新类型

```typescript
type Mutable<T> = { [P in keyof T]: T[P] } // 非同态
// 返回的类型与T无关，创建新的对象结构
```

---

### 7.3 Utility Types有哪些？各自的作用？

**考点**：内置工具类型

| 类型 | 作用 | 示例 |
|-----|------|-----|
| `Partial<T>` | 所有属性可选 | `Partial<User>` |
| `Required<T>` | 所有属性必选 | `Required<User>` |
| `Readonly<T>` | 所有属性只读 | `Readonly<User>` |
| `Pick<T, K>` | 选取部分属性 | `Pick<User, 'name' \| 'age'>` |
| `Omit<T, K>` | 排除部分属性 | `Omit<User, 'password'>` |
| `Record<K, V>` | 创建键值对类型 | `Record<string, number>` |
| `Exclude<T, U>` | 排除联合类型 | `Exclude<string \| number, string>` |
| `Extract<T, U>` | 提取联合类型 | `Extract<string \| number, string>` |
| `NonNullable<T>` | 排除null/undefined | `NonNullable<string \| null>` |
| `ReturnType<T>` | 获取函数返回类型 | `ReturnType<() => string>` |
| `Parameters<T>` | 获取函数参数类型 | `Parameters<() => void>` |
| `InstanceType<T>` | 获取构造函数实例类型 | `InstanceType<typeof MyClass>` |

---

### 7.4 如何自定义一个Omit实现？

**考点**：工具类型实现

```typescript
// Omit = Pick + Exclude
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// 使用
interface User {
  name: string
  age: number
  password: string
}
type UserWithoutPassword = MyOmit<User, 'password'>
// { name: string; age: number }
```

---

## 8. 编译配置与工具链

### 8.1 tsconfig.json的主要配置项有哪些？

**考点**：TypeScript编译器配置

**重要配置项**：

| 配置项 | 说明 | 常见值 |
|-------|------|-------|
| `target` | 编译目标ES版本 | `"ES5"`, `"ES6"`, `"ES2020"` |
| `module` | 模块系统 | `"commonjs"`, `"ESNext"`, `"AMD"` |
| `strict` | 严格模式 | `true` / `false` |
| `strictNullChecks` | 空值检查 | `true` / `false` |
| `noImplicitAny` | 不允许隐式any | `true` / `false` |
| `strictPropertyInitialization` | 属性必须初始化 | `true` / `false` |
| `outDir` | 输出目录 | `"./dist"` |
| `rootDir` | 源码目录 | `"./src"` |
| `declaration` | 生成.d.ts文件 | `true` / `false` |
| `sourceMap` | 生成sourceMap | `true` / `false` |
| `esModuleInterop` | ES模块互操作 | `true` / `false` |
| `skipLibCheck` | 跳过库检查 | `true` / `false` |

---

### 8.2 strict模式包含哪些检查？

**考点**：严格类型检查

**strict: true 包含**：

1. `strictNullChecks` - 不允许null/undefined赋值给其他类型
2. `noImplicitAny` - 不允许隐式any类型
3. `strictStrict` - 禁止this的类型为any
4. `strictPropertyInitialization` - 类属性必须初始化

**示例**：

```typescript
// strictNullChecks
function greet(name: string) {
  // name.toUpperCase() // 错误：string可能为null/undefined
  console.log(name.toUpperCase()) // 正确：参数已声明为string
}

// noImplicitAny
function log(x) { // 错误：参数x需要类型注解
  console.log(x)
}
```

---

### 8.3 TypeScript中如何处理类型声明文件？

**考点**：.d.ts文件理解

**类型声明文件（.d.ts）**：为JavaScript库提供类型信息

```typescript
// my-lib.d.ts
declare module 'my-lib' {
  export function doSomething(): void
  export const VERSION: string
}
```

**三斜线指令**（较少使用）：

```typescript
/// <reference types="node" />
/// <reference path="./other.d.ts" />
```

**最佳实践**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true // 跳过第三方库的类型检查，加快编译
  }
}
```

---

### 8.4 TypeScript的类型推断规则？

**考点**：TS类型推断机制

**变量推断**：

```typescript
let x = 3      // number
let y = [0, 1] // number[]
let z = [true] // boolean[] // 数组字面量会被推断为联合类型
```

**函数推断**：

```typescript
// 返回类型推断
function add(a: number, b: number) {
  return a + b // 推断返回number
}

// 上下文推断
window.onclick = function(event: MouseEvent) {
  // event类型由onclick的类型推断
}
```

**最佳通用类型推断**：

```typescript
let arr = [0, 'hello'] // (string | number)[]
```

---

### 8.5 如何处理TypeScript和JavaScript混合项目？

**考点**：渐进迁移策略

**步骤**：

1. 安装TypeScript：`npm install -D typescript @types/node`
2. 初始化：`npx tsc --init`
3. 配置 `allowJs: true`，`checkJs: false`
4. 逐步将.js文件重命名为.ts
5. 逐步开启strict模式

**配置示例**：

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

---

## 附录：高频手写代码题

### 实现一个简易版Pick

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

### 实现一个简易版Partial

```typescript
type MyPartial<T> = {
  [P in keyof T]?: T[P]
}
```

### 实现一个简易版Required

```typescript
type MyRequired<T> = {
  [P in keyof T]-?: T[P]
}
```

### 实现一个简易版Exclude

```typescript
type MyExclude<T, U> = T extends U ? never : T
```

### 实现一个简易版Extract

```typescript
type MyExtract<T, U> = T extends U ? T : never
```

### 实现一个简易版Omit

```typescript
type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P]
}
```

### 实现一个简易版Record

```typescript
type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}
```

### 实现一个简易版ReturnType

```typescript
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never
```

### 实现一个简易版InstanceType

```typescript
type MyInstanceType<T extends new (...args: any) => any> =
  T extends new (...args: any) => infer R ? R : never
```

---

> **面试技巧**：TypeScript八股文的核心在于理解类型系统的设计理念，多动手实践类型推导，遇到面试题时先分析意图再给出解答。

---

## 大厂面试强化：高频追问与全栈补齐

### 1. 大厂常问追问清单

**类型系统本质**：
- TypeScript 是结构类型系统，两个类型是否兼容主要看成员结构，而不是声明名称。
- 类型只存在于编译期，运行时不会自动校验接口数据，所以服务端返回值仍需要 zod、valibot、io-ts 或手写校验。
- 类型收窄依赖控制流分析，`if`、`switch`、`return`、`throw` 都会影响后续类型。

**any、unknown、never**：
- `any` 会关闭类型检查，适合迁移期兜底，但会污染下游类型。
- `unknown` 是安全的未知类型，使用前必须收窄。
- `never` 表示不会出现的值，常用于穷尽检查、不可达分支、条件类型过滤。

**type 与 interface**：
- `interface` 可声明合并，适合对象形状和对外扩展 API。
- `type` 表达能力更强，适合联合类型、条件类型、映射类型、元组组合。
- 项目约定比绝对优劣更重要：组件 Props、领域模型、工具类型可以分别采用一致风格。

**泛型追问**：
- 泛型不是“任意类型”，而是把类型作为参数传入，让输入输出关系保持一致。
- `T extends U` 在泛型约束中表示 T 至少满足 U 的结构；在条件类型中表示分支判断。
- 条件类型遇到裸类型参数会触发分布式条件类型，例如 `T extends U ? X : Y` 会对联合类型逐项分发。

**协变、逆变、双变**：
- 返回值类型通常协变：可以返回更具体的类型。
- 函数参数在 `strictFunctionTypes` 下更接近逆变：接收更宽的参数更安全。
- 方法参数历史上存在双变兼容，面试中可说明这是 TypeScript 为生态兼容做的取舍。

### 2. 前端/全栈工程师需要补齐的 TypeScript 能力

**React/Next 类型建模**：
```typescript
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`)
}
```

面试重点：用可辨识联合类型表达异步状态，避免 `data?: T`、`error?: Error` 这类互斥关系不清的类型。

**接口契约与运行时校验**：
- 前端类型不能替代接口校验，接口数据来自网络、数据库、缓存或用户输入时，都属于不可信输入。
- 全栈项目建议从 schema 出发生成类型，例如 OpenAPI、GraphQL Code Generator、Prisma、tRPC、zod schema。
- DTO、Domain Model、View Model 不要混成一个类型；后端字段变更不应直接击穿前端展示层。

**类型安全的工具函数**：
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}
```

**tsconfig 实战必会**：
- `strict` 建议开启，新增项目不要关闭。
- `noUncheckedIndexedAccess` 可以减少数组、对象索引访问的空值风险。
- `exactOptionalPropertyTypes` 会让可选属性语义更精确，适合高质量库或中大型项目。
- `paths` 只影响 TypeScript 解析，运行时和构建工具也要配置 alias。

### 3. 类型体操高频补充

```typescript
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

type MyNonNullable<T> = T extends null | undefined ? never : T

type MyParameters<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P : never

type MyAwaited<T> =
  T extends null | undefined
    ? T
    : T extends PromiseLike<infer U>
      ? MyAwaited<U>
      : T
```

回答类型体操题时，先说“我要拆 key、拆 union，还是拆函数参数/返回值”，再选择 `keyof`、映射类型、条件类型、`infer`。
