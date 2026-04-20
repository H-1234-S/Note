# 1. 基础类型

## 1.1 概述

TypeScript 是 JavaScript 的超集，提供了类型系统和其他高级特性。本文档将带你从零开始掌握 TypeScript。

## 1.2 布尔值、数值、字符串

```typescript
// 布尔值
let isDone: boolean = false;

// 数值（支持二进制、八进制、十六进制）
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;

// 字符串
let name: string = "TypeScript";
let template: string = `Hello, ${name}`;
```

## 1.3 数组

```typescript
// 两种定义方式
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];

// 元组 - 固定长度和类型的数组
let tuple: [string, number];
tuple = ["hello", 10];  // OK
tuple = [10, "hello"];  // Error
```

## 1.4 枚举

```typescript
enum Color {
  Red,    // 默认从0开始
  Green,
  Blue
}
let c: Color = Color.Green;

// 也可以手动指定值
enum Status {
  Success = 200,
  NotFound = 404,
  Error = 500
}

// 字符串枚举
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}
```

## 1.5 Any 和 Unknown

```typescript
// any - 任意类型，绕过类型检查
let notSure: any = 4;
notSure = "maybe a string";
notSure.ifItExists();  // OK，可能在运行时存在

// unknown - 安全的任意类型
let uncertain: unknown = 4;
if (typeof uncertain === "number") {
  let num: number = uncertain;  // 需要类型守卫才能使用
}
```

## 1.6 Void、Null、Undefined、Never

```typescript
// void - 没有返回值
function warnUser(): void {
  console.log("Warning!");
}

// null 和 undefined
let n: null = null;
let u: undefined = undefined;

// never - 从不返回的函数
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## 1.7 Symbol

```typescript
let sym1: symbol = Symbol("key");
let sym2: symbol = Symbol("key");
sym1 === sym2;  // false，每个Symbol都是唯一的
```

## 1.8 BigInt

```typescript
// 处理大整数
let big: bigint = 100n;
let bigger: bigint = BigInt(100);
```

## 1.9 类型推断

TypeScript 会自动推断类型：

```typescript
let implicitString = "Hello";  // 推断为 string
implicitString = 123;  // Error

let implicitNumber = 42;  // 推断为 number
```

## 1.10 类型断言

```typescript
// 尖括号语法
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

// as 语法（推荐）
let strLength2: number = (someValue as string).length;

// 非空断言
function liveDangerously(x?: number | null) {
  console.log(x!.toFixed(10));
}
```

## 1.11 练习题

```typescript
// 1. 定义一个表示人物的结构，包含姓名（字符串）、年龄（数字）、身高（数字，可选）
// 2. 创建一个枚举表示星期几
// 3. 写一个返回never的函数
```

---

# 2. 接口与类型

## 2.1 接口基础

### 2.1.1 定义接口

```typescript
interface Person {
  name: string;
  age: number;
  // 可选属性
  email?: string;
  // 只读属性
  readonly id: number;
}

let user: Person = {
  name: "张三",
  age: 25,
  id: 1
};
user.id = 2;  // Error: 只读属性不可修改
```

### 2.1.2 可选属性

```typescript
interface Config {
  color?: string;
  width?: number;
  height?: number;
}

function createConfig(cfg: Config): { color: string; area: number } {
  return {
    color: cfg.color || "blue",
    area: (cfg.width || 100) * (cfg.height || 100)
  };
}
```

### 2.1.3 只读属性

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

let point: Point = { x: 10, y: 20 };
point.x = 5;  // Error
```

## 2.2 类型别名

### 2.2.1 基本用法

```typescript
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;

function getName(n: NameOrResolver): string {
  if (typeof n === "string") {
    return n;
  }
  return n();
}
```

### 2.2.2 接口 vs 类型别名

| 特性 | interface | type |
|------|-----------|------|
| 定义形状 | ✅ | ✅ |
| 扩展 | extends | 交叉类型 & |
| 声明合并 | ✅ | ❌ |
| 计算属性 | ❌ | ✅ |

```typescript
// interface 扩展
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// type 交叉
type Animal = {
  name: string;
};
type Dog = Animal & {
  breed: string;
};
```

## 2.3 属性修饰符

### 2.3.1 索引签名

```typescript
interface StringMap {
  [key: string]: string;
}

let map: StringMap = {
  key1: "value1",
  key2: "value2"
};
```

### 2.3.2 函数属性

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function(source: string, sub: string) {
  return source.search(sub) !== -1;
};
```

### 2.3.3 可索引类型

```typescript
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Alice"];
let first: string = myArray[0];
```

## 2.4 接口继承

```typescript
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, PenStroke {
  sideLength: number;
}

let square = {} as Square;
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5;
```

## 2.5 接口实现

```typescript
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();

  setTime(d: Date): void {
    this.currentTime = d;
  }

  constructor(h: number, m: number) {}
}
```

## 2.6 混合类型

```typescript
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  let counter = (function(start: number) {
    return start.toString();
  }) as Counter;
  counter.interval = 123;
  counter.reset = function() {};
  return counter;
}

let c = getCounter();
c(10);
c.reset();
```

## 2.7 练习题

```typescript
// 1. 创建一个接口表示汽车，包含品牌、型号（可选）、年费
// 2. 创建一个类型别名表示点的坐标
// 3. 实现一个对象包含字符串索引和数值索引
```

---

# 3. 函数

## 3.1 函数类型

### 3.1.1 基本函数声明

```typescript
// 函数声明
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
let myAdd: (x: number, y: number) => number = function(x, y) {
  return x + y;
};
```

### 3.1.2 接口定义函数

```typescript
interface MathFunc {
  (x: number, y: number): number;
}

let multiply: MathFunc = function(a, b) {
  return a * b;
};
```

## 3.2 可选参数和默认参数

### 3.2.1 可选参数

```typescript
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

buildName("John");        // OK
buildName("John", "Doe");  // OK
buildName("John", "Doe", "Sr.");  // Error: 参数过多
```

### 3.2.2 默认参数

```typescript
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

greet("World");          // Hello, World!
greet("World", "Hi");     // Hi, World!
```

### 3.2.3 剩余参数

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4, 5);  // 15
```

## 3.3 this 类型

### 3.3.1 this 在函数中

```typescript
interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ["hearts", "spades", "clubs", "diamonds"],
  cards: Array(52),
  createCardPicker() {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);
      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  }
};
```

### 3.3.2 显式 this 参数

```typescript
function f(this: void) {
  console.log("this is void");
}
```

## 3.4 重载

```typescript
// 方法重载
function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string {
  if (typeof x === "number") {
    return Number(x.toString().split("").reverse().join(""));
  }
  return x.split("").reverse().join("");
}

reverse(123);     // 321
reverse("hello"); // "olleh"
```

## 3.5 泛型函数

```typescript
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("hello");
identity(42);  // 类型推断为 number
```

## 3.6 构造函数

```typescript
class GenericClass<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

interface GenericConstructor<T> {
  new(value: T): GenericClass<T>;
}

function create<T>(ctor: GenericConstructor<T>, value: T): GenericClass<T> {
  return new ctor(value);
}

create(GenericClass, 42);
```

## 3.7 参数属性

```typescript
class Animal {
  constructor(
    public name: string,
    private age: number,
    protected breed: string
  ) {}
}

// 等价于
class AnimalEquivalent {
  public name: string;
  private age: number;
  protected breed: string;

  constructor(name: string, age: number, breed: string) {
    this.name = name;
    this.age = age;
    this.breed = breed;
  }
}
```

## 3.8 练习题

```typescript
// 1. 写一个函数，接受名字和可选的问候语，返回问候语字符串
// 2. 写一个重载函数，处理 string 和 number 类型的数组翻转
// 3. 创建一个泛型函数，用于获取数组的第一个和最后一个元素
```

---

# 4. 泛型

## 4.1 泛型基础

### 4.1.1 什么是泛型

泛型允许你创建可重用的组件，支持多种类型而非单一类型。

```typescript
// 不使用泛型 - 需要 any
function identity(arg: any): any {
  return arg;
}

// 使用泛型
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello");
let output2 = identity(42);  // 类型推断
```

### 4.1.2 泛型变量

```typescript
function loggingIdentity<T>(arg: T): T {
  console.log(arg.length);  // Error: T 不一定有 length
  return arg;
}

function loggingIdentity<T>(arg: T[]): T[] {
  console.log(arg.length);
  return arg;
}
```

## 4.2 泛型类型

### 4.2.1 泛型函数类型

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let myIdentity: <T>(arg: T) => T = identity;
let myIdentity2: <U>(arg: U) => U = identity;
```

### 4.2.2 泛型接口

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T;
  specialProperty: T;
}

function fn<T>(arg: T): T {
  return arg;
}

let identityFn: GenericIdentityFn<number> = fn as GenericIdentityFn<number>;
identityFn.specialProperty = 123;
```

### 4.2.3 泛型类

```typescript
class GenericNumber<T> {
  zeroValue!: T;
  add!: (x: T, y: T) => T;
}

let numeric = new GenericNumber<number>();
numeric.zeroValue = 0;
numeric.add = (x, y) => x + y;
```

## 4.3 泛型约束

### 4.3.1 使用 extends 约束

```typescript
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity("hello");    // OK
loggingIdentity([1, 2, 3]);   // OK
loggingIdentity(123);         // Error: number 没有 length
```

### 4.3.2 多重约束

```typescript
interface Serializable {
  serialize(): string;
}

function process<T extends Serializable & Lengthwise>(item: T): void {
  console.log(item.serialize(), item.length);
}
```

### 4.3.3 使用 keyof 约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person = { name: "John", age: 30 };
getProperty(person, "name");  // string
getProperty(person, "age");   // number
getProperty(person, "email"); // Error: 不存在此属性
```

## 4.4 泛型默认类型

```typescript
interface Container<T = string> {
  value: T;
}

let c1: Container = { value: "hello" };  // value 是 string
let c2: Container<number> = { value: 123 };  // value 是 number
```

## 4.5 条件类型

### 4.5.1 基本用法

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
```

### 4.5.2 分布条件类型

```typescript
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type S1 = Flatten<string[]>;  // string
type S2 = Flatten<number>;     // number
```

### 4.5.3 推断类型

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function f1(): string { return "hello"; }
function f2(): number { return 42; }

type R1 = ReturnType<typeof f1>;  // string
type R2 = ReturnType<typeof f2>;  // number
```

## 4.6 映射类型

### 4.6.1 基本映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
```

### 4.6.2 内置工具类型

```typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
type TodoInfo = Omit<Todo, "completed">;
type RequiredTodo = Required<Todo>;
type PartialTodo = Partial<Todo>;
type ReadonlyTodo = Readonly<Todo>;
```

## 4.7 泛型参数默认值

```typescript
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

let arr1 = createArray(3, "x");  // string[]
let arr2 = createArray(3, 100);  // number[]
let arr3 = createArray(3);        // string[] (使用默认值)
```

## 4.8 泛型别名

```typescript
type Pair<T, U> = {
  first: T;
  second: U;
};

type StringOrNumber<T> = T extends string ? string : number;

type LinkedList<T> = T & { next: LinkedList<T> | null };
```

## 4.9 练习题

```typescript
// 1. 写一个泛型函数，返回数组中的最大值
// 2. 创建一个泛型接口表示键值对
// 3. 用泛型实现一个简单的 Promise 类型包装器
// 4. 使用映射类型将接口的所有属性变为只读
```

---

# 5. 枚举

## 5.1 数字枚举

### 5.1.1 基本用法

```typescript
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

let dir: Direction = Direction.Up;
console.log(Direction.Up);    // 0
console.log(Direction[0]);     // "Up" (反向映射)
```

### 5.1.2 手动赋值

```typescript
enum Status {
  None = 0,
  Success = 200,
  Accepted = 202,
  Error = 500
}

enum Order {
  First = 1,
  Second = 2,
  Third = 3
}
```

### 5.1.3 计算值

```typescript
enum FileAccess {
  None,
  Read = 1 << 1,   // 2
  Write = 1 << 2,  // 4
  ReadWrite = Read | Write  // 6
}
```

## 5.2 字符串枚举

```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

function move(direction: Direction): void {
  console.log(direction);
}

move(Direction.Up);  // "UP"
```

## 5.3 异构枚举（混合）

```typescript
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES"
}
```

## 5.4 常量枚举

```typescript
const enum Enum {
  A = 1,
  B = A * 2
}

// 编译后直接内联，节省性能
// console.log(Enum.A);
console.log(1);  // 直接替换为字面量
```

## 5.5 枚举成员类型

```typescript
enum E {
  Foo,
  Bar
}

function f(x: E) {
  if (x !== E.Foo && x !== E.Bar) {
    throw new Error("Bad argument");
  }
}
```

## 5.6 联合枚举

```typescript
enum ShapeKind {
  Circle,
  Square
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  side: number;
}

function area(s: Circle | Square): number {
  if (s.kind === ShapeKind.Circle) {
    return Math.PI * s.radius ** 2;
  }
  return s.side ** 2;
}
```

## 5.7 枚举运行时

```typescript
enum E {
  X,
  Y,
  Z
}

function f(obj: { X: number }) {
  return obj.X;
}

f(E);  // E.X 是数字，可以访问
```

## 5.8 外部枚举

```typescript
declare enum Enum {
  A = 1,
  B,
  C = 2
}

// 用于声明已存在的枚举，不生成运行时代码
```

## 5.9 实践建议

```typescript
// 建议：使用 const 枚举提升性能
const enum Priority {
  Low,
  Normal,
  High,
  Critical
}

// 建议：使用联合类型替代简单枚举
type Direction = "up" | "down" | "left" | "right";

function move(dir: Direction): void {
  // ...
}

move("up");  // OK
move("invalid");  // Error
```

## 5.10 练习题

```typescript
// 1. 创建一个枚举表示HTTP状态码（200, 404, 500）
// 2. 创建一个字符串枚举表示 RGB 颜色
// 3. 使用 const enum 实现权限位掩码
```

---

# 6. 装饰器

## 6.1 概述

装饰器是一种特殊类型的声明，能够修改类、方法、属性或参数的行为。需要启用 `experimentalDecorators` 编译选项。

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 6.2 类装饰器

### 6.2.1 基本用法

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
```

### 6.2.2 带参数的装饰器

```typescript
function color(value: string) {
  return function(constructor: Function) {
    constructor.prototype.color = value;
  };
}

@color("blue")
class MyClass {
  name = "MyClass";
}

console.log((new MyClass() as any).color);  // "blue"
```

## 6.3 方法装饰器

```typescript
function readonly(target: any, key: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Person {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  @readonly
  greet(): string {
    return `Hello, ${this.name}`;
  }
}

let p = new Person("John");
// p.greet = () => {};  // Error: 无法修改只读方法
```

## 6.4 属性装饰器

```typescript
function format(formatString: string) {
  return function(target: any, propertyKey: string) {
    let value = target[propertyKey];
    const getter = () => value;
    const setter = (val: string) => {
      value = formatString.replace("%s", val);
    };
    Object.defineProperty(target, propertyKey, { getter, setter });
  };
}

class Greeter {
  @format("Hello, %s!")
  name: string = "World";
}

let g = new Greeter();
console.log(g.name);  // "Hello, World!"
```

## 6.5 参数装饰器

```typescript
function required(target: any, key: string, index: number) {
  console.log(`${key} 参数 ${index} 是必需的`);
}

class Person {
  private name: string;

  constructor(
    @required name: string,
    @required age: number
  ) {
    this.name = name;
  }
}
```

## 6.6 装饰器工厂

```typescript
function f(prefix: string) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
      console.log(`${prefix}: 调用方法前`);
      const result = original.apply(this, args);
      console.log(`${prefix}: 调用方法后`);
      return result;
    };
    return descriptor;
  };
}

class Calculator {
  @f("Calculator")
  add(a: number, b: number): number {
    return a + b;
  }
}
```

## 6.7 方法装饰器示例

### 6.7.1 自动缓存装饰器

```typescript
function memoize(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  const cache = new Map();

  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return descriptor;
}

class MathService {
  @memoize
  expensiveCalculation(n: number): number {
    console.log("计算中...");
    return n * n;
  }
}
```

### 6.7.2 防抖装饰器

```typescript
function debounce(wait: number) {
  return function(
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    let timeout: any;
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => original.apply(this, args), wait);
    };

    return descriptor;
  };
}

class SearchComponent {
  @debounce(300)
  search(query: string): void {
    console.log(`搜索: ${query}`);
  }
}
```

## 6.8 类装饰器示例

### 6.8.1 简单依赖注入

```typescript
const Injector: Map<string, any> = new Map();

function Injectable(token?: string) {
  return function(constructor: Function) {
    const tokenName = token || constructor.name;
    Injector.set(tokenName, new constructor());
  };
}

@Injectable()
class UserService {
  getUsers() {
    return ["Alice", "Bob"];
  }
}

@Injectable()
class Logger {
  log(msg: string) {
    console.log(`[LOG]: ${msg}`);
  }
}

// 获取服务
const userService = Injector.get("UserService") as UserService;
console.log(userService.getUsers());
```

## 6.9 装饰器组合

```typescript
function first() {
  console.log("first(): factory evaluated");
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    console.log("second(): called");
  };
}

class Example {
  @first()
  @second()
  method() {}
}

// 输出顺序：
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

## 6.10 反射元数据

需要安装 `reflect-metadata`：

```bash
npm install reflect-metadata
```

```typescript
import "reflect-metadata";

function inspectTypes(types: any[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const methodSignature = types;
    console.log(`${key} 参数类型:`, methodSignature);
    return descriptor;
  };
}

class UserService {
  @inspectTypes([String, Number])
  createUser(name: string, age: number): string {
    return `Created user ${name}, age ${age}`;
  }
}
```

## 6.11 练习题

```typescript
// 1. 创建一个日志装饰器，记录方法调用的参数和返回值
// 2. 创建一个性能监控装饰器，测量方法执行时间
// 3. 创建一个验证装饰器，检查方法参数是否满足条件
```

---

# 7. 高级类型

## 7.1 联合类型与交叉类型

### 7.1.1 联合类型

```typescript
type StringOrNumber = string | number;

function printId(id: StringOrNumber): void {
  // 类型守卫
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```

### 7.1.2 交叉类型

```typescript
interface ErrorHandling {
  success: boolean;
  error?: { message: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

type ArtworksResponse = ErrorHandling & ArtworksData;

let response: ArtworksResponse = {
  success: true,
  artworks: [{ title: "Mona Lisa" }]
};
```

## 7.2 类型守卫

### 7.2.1 typeof 类型守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'`);
}
```

### 7.2.2 in 操作符

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}
```

### 7.2.3 instanceof

```typescript
class Fish {
  swim(): void {
    console.log("Swimming");
  }
}

class Bird {
  fly(): void {
    console.log("Flying");
  }
}

function move2(animal: Fish | Bird) {
  if (animal instanceof Fish) {
    animal.swim();
  } else {
    animal.fly();
  }
}
```

### 7.2.4 自定义类型守卫

```typescript
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow();
  } else {
    animal.bark();
  }
}
```

## 7.3 可辨识联合

```typescript
interface Square {
  kind: "square";
  size: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(s: Shape): number {
  switch (s.kind) {
    case "square":
      return s.size * s.size;
    case "rectangle":
      return s.width * s.height;
    case "circle":
      return Math.PI * s.radius * s.radius;
  }
}
```

## 7.4 null 和 undefined

### 7.4.1 启用严格空检查

```typescript
function f(x: string | null): string {
  if (x === null) {
    return "default";
  }
  return x;
}

// 非空断言
function f2(x: string | undefined) {
  return x!.length;
}
```

### 7.4.2 类型保护函数

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function getSmallPet(): Fish | Bird {
  return { swim: () => {} };
}

let pet = getSmallPet();
if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

## 7.5 类型别名

```typescript
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;

function getName(n: NameOrResolver): Name {
  if (typeof n === "string") {
    return n;
  }
  return n();
}

// 泛型类型别名
type Container<T> = { value: T };
type Pair<T> = { first: T; second: T };
```

## 7.6 映射类型

### 7.6.1 基本映射

```typescript
type Keys = "firstName" | "lastName";
type Flags = { [K in Keys]: boolean };
// 等价于
// { firstName: boolean; lastName: boolean }
```

### 7.6.2 完整示例

```typescript
type OptionsFlags<T> = {
  [K in keyof T]: boolean;
};

type FeatureFlags = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<FeatureFlags>;
// { darkMode: boolean; newUserProfile: boolean }
```

### 7.6.3 修改修饰符

```typescript
// 移除 readonly
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface Point {
  readonly x: number;
  readonly y: number;
}

type MutablePoint = Mutable<Point>;
// { x: number; y: number }

// 移除 optional
type Concrete<T> = {
  [P in keyof T]-?: T[P];
};
```

## 7.7 递归类型

```typescript
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface JSONSibling {
  [key: string]: JSONValue;
}

// 树形结构
interface TreeNode {
  value: string;
  children: TreeNode[];
}
```

## 7.8 条件类型

### 7.8.1 基本条件类型

```typescript
type ExtractPromise<T> = T extends Promise<infer U> ? U : T;

type A = ExtractPromise<Promise<string>>;  // string
type B = ExtractPromise<number>;           // number
```

### 7.8.2 分布条件类型

```typescript
type ToArray<T> = T extends any ? T[] : never;

type StrArr = ToArray<string>;       // string[]
type NumArr = ToArray<number>;       // number[]
type AllArr = ToArray<string | number>;  // string[] | number[]
```

### 7.8.3 实际应用

```typescript
// 获取函数参数类型
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type Args = Parameters<(x: number, y: string) => void>;  // [number, string]

// 获取构造函数参数
type ConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never;

type CtorArgs = ConstructorParameters<new (x: number, y: string) => object>;
// [number, string]
```

## 7.9 字面量类型

```typescript
// 字符串字面量
type Easing = "ease-in" | "ease-out" | "ease-in-out";

function animate(options: { easing: Easing }) {}

animate({ easing: "ease-in" });

// 数字字面量
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

// 模板字面量
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs}_id` | `${FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

## 7.10 模块类型扩展

```typescript
// 扩展现有类型
interface String {
  padLeft(width: number, char?: string): string;
}

"hello".padLeft(10, "0");

// 扩展全局类型
declare global {
  interface Array<T> {
    shuffle(): T[];
  }
}

Array.prototype.shuffle = function() {
  const arr = [...this];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
```

## 7.11 练习题

```typescript
// 1. 创建一个类型工具，取出数组中的元素类型
// 2. 实现一个 DeepPartial 工具类型
// 3. 创建一个条件类型，判断类型是否为 never
```

---

# 8. 模块系统

## 8.1 导出

### 8.1.1 导出声明

```typescript
// 导出变量
export const PI = 3.14;
export const E = 2.71;

// 导出函数
export function add(a: number, b: number): number {
  return a + b;
}

// 导出接口
export interface Point {
  x: number;
  y: number;
}

// 导出类型别名
export type Color = "red" | "green" | "blue";
```

### 8.1.2 导出多个

```typescript
function max<T>(arr: T[]): T {
  return arr.reduce((a, b) => (a > b ? a : b));
}

function min<T>(arr: T[]): T {
  return arr.reduce((a, b) => (a < b ? a : b));
}

export { max, min };
```

### 8.1.3 重命名导出

```typescript
interface A {
  x: number;
}

interface B {
  y: string;
}

export { A as TypeA, B as TypeB };
```

### 8.1.4 默认导出

```typescript
// 默认导出（每个文件只能有一个）
export default class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// 或者
const calculator = new Calculator();
export default calculator;
```

## 8.2 导入

### 8.2.1 基本导入

```typescript
import { Point } from "./types";
import { add } from "./math";

let p: Point = { x: 0, y: 0 };
let sum = add(1, 2);
```

### 8.2.2 重命名导入

```typescript
import { Point as P } from "./types";

let p: P = { x: 0, y: 0 };
```

### 8.2.3 导入模块全体

```typescript
import * as MathUtils from "./math";

MathUtils.add(1, 2);
MathUtils.max([1, 2, 3]);
```

### 8.2.4 默认导入

```typescript
import Calculator from "./Calculator";

let calc = new Calculator();
```

### 8.2.5 副作用导入

```typescript
// 只执行模块，不导入任何绑定
import "./polyfills";
```

## 8.3 重新导出

```typescript
// 从其他模块导出
export { Point } from "./types";
export { add, multiply } from "./math";

// 重新导出并重命名
export { Point as GeoPoint } from "./types";

// 整个模块重导出
export * from "./types";
export * from "./math";
```

## 8.4 模块类型

### 8.4.1 esModuleInterop

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

```typescript
import fs from "fs";  // 不需要 require('fs')
```

### 8.4.2 AMD / CommonJS / UMD / System / ES2015

```typescript
// CommonJS 导出
export = {
  name: "MyModule",
  value: 42
};

// 导入 CommonJS 模块
import myModule = require("./myModule");
```

## 8.5 动态导入

```typescript
// 懒加载模块
async function loadModule() {
  const { add } = await import("./math");
  return add(1, 2);
}

// 条件导入
async function loadFeature(flag: boolean) {
  if (flag) {
    const { FeatureA } = await import("./features/featureA");
    return new FeatureA();
  } else {
    const { FeatureB } = await import("./features/featureB");
    return new FeatureB();
  }
}
```

## 8.6 模块声明

### 8.6.1 声明全局模块

```typescript
// globals.d.ts
declare module "my-library" {
  export function doSomething(): void;
  export const VERSION: string;
}

// 使用
import { doSomething } from "my-library";
doSomething();
```

### 8.6.2 声明模块扩展

```typescript
// express扩展
declare module "express" {
  interface Application {
    foo(): void;
  }
}
```

## 8.7 namespace（已废弃）

```typescript
// Math.ts
namespace Math {
  export function add(a: number, b: number): number {
    return a + b;
  }
}

// 使用
/// <reference path="Math.ts" />
Math.add(1, 2);
```

推荐使用 ES 模块替代。

## 8.8 路径映射

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"]
    }
  }
}
```

```typescript
import Button from "@/components/Button";
```

## 8.9 练习题

```typescript
// 1. 创建两个模块，一个导出数学工具函数，一个导出字符串工具函数
// 2. 实现一个模块的默认导出和命名导出
// 3. 使用动态导入实现按需加载
```

---

# 9. 命名空间与声明合并

## 9.1 命名空间

### 9.1.1 基本用法

命名空间用于组织代码，避免全局污染。

```typescript
// Validation.ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegex = /^[A-Za-z]+$/;
  const numberRegex = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return lettersRegex.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string): boolean {
      return s.length === 5 && numberRegex.test(s);
    }
  }
}

// 使用
let validator = new Validation.LettersOnlyValidator();
validator.isAcceptable("hello");  // true
```

### 9.1.2 多文件命名空间

```typescript
// strings.ts
namespace Strings {
  export function padLeft(s: string, length: number): string {
    return s.padStart(length);
  }
}

// concat.ts
/// <reference path="strings.ts" />
namespace Strings {
  export function concat(a: string, b: string): string {
    return a + b;
  }
}

// 使用
Strings.padLeft("hello", 10);
Strings.concat("hello", "world");
```

## 9.2 声明合并

### 9.2.1 接口合并

```typescript
interface Cloner {
  clone(animal: Animal): Animal;
}

interface Cloner {
  clone(animal: Sheep): Sheep;
}

// 合并后
interface Cloner {
  clone(animal: Animal | Sheep): Animal | Sheep;
}
```

### 9.2.2 命名空间合并

```typescript
namespace Animal {
  export class Dog {}
}

namespace Animal {
  export class Cat {}
}

// 合并后
namespace Animal {
  export class Dog {}
  export class Cat {}
}
```

### 9.2.3 类与命名空间合并

```typescript
class Album {
  label: string = "Album";
}

namespace Album {
  export const genre = "Pop";
}

let album = new Album();
album.label;      // "Album"
Album.genre;       // "Pop"
```

### 9.2.4 函数与命名空间合并

```typescript
function buildMessage(name: string) {
  return `Hello, ${name}`;
}

namespace buildMessage {
  export const version = "1.0";
}

buildMessage("World");  // 函数
buildMessage.version;  // "1.0"
```

### 9.2.5 枚举与命名空间合并

```typescript
enum Color {
  Red = 1,
  Green = 2
}

namespace Color {
  export function mix(color1: Color, color2: Color): string {
    return `Mixing ${color1} and ${color2}`;
  }
}

Color.mix(Color.Red, Color.Green);  // "Mixing 1 and 2"
```

## 9.3 模块扩展

### 9.3.1 扩展现有模块

```typescript
// moment.d.ts
import moment from "moment";

declare module "moment" {
  interface Moment {
    startOfWeek(): Moment;
    endOfWeek(): Moment;
  }
}
```

### 9.3.2 扩展现有类

```typescript
class Person {
  name: string;
}

namespace Person {
  export let species: string = "Human";
}

Person.species;  // "Human"
```

## 9.4 混入 (Mixins)

```typescript
// 目标类
class Point {
  x: number = 0;
  y: number = 0;
}

// Mixin A
function Timestamped<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    timestamp = Date.now();
  };
}

// Mixin B
function Serializable<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    serialize() {
      return JSON.stringify(this);
    }
  };
}

// 应用混入
const SerializablePoint = Serializable(Timestamped(Point));
let p = new SerializablePoint();
p.x = 10;
p.y = 20;
console.log(p.serialize());
```

## 9.5 注意事项

```typescript
// ❌ 错误：不能合并两个具有不同值的命名空间成员
namespace A {
  export const x = 1;
}
namespace A {
  export const x = 2;  // Error: 重复标识符
}

// ❌ 错误：类不能合并命名空间和类
class C {}
namespace C {}  // Error
```

## 9.6 练习题

```typescript
// 1. 创建一个命名空间包含多个几何计算函数
// 2. 使用声明合并且类与命名空间合并创建一个带静态属性的类
// 3. 实现一个简单的 Mixin，添加日志功能
```

---

# 10. 实用技巧与最佳实践

## 10.1 类型工具

### 10.1.1 内置工具类型

```typescript
// Partial - 将所有属性变为可选
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type PartialTodo = Partial<Todo>;
// { title?: string; description?: string; completed?: boolean }

// Required - 将所有属性变为必需
type RequiredTodo = Required<Todo>;

// Pick - 选取指定属性
type TodoPreview = Pick<Todo, "title" | "completed">;

// Omit - 排除指定属性
type TodoInfo = Omit<Todo, "completed">;

// Record - 创建键值对类型
type PageInfo = Record<string, number>;
// { [key: string]: number }

// Exclude - 排除类型
type T0 = Exclude<"a" | "b" | "c", "a" | "b">;  // "c"
type T1 = Exclude<number | string, string>;  // number

// Extract - 提取类型
type T2 = Extract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"

// NonNullable - 排除 null 和 undefined
type T3 = NonNullable<string | null | undefined>;  // string

// ReturnType - 获取函数返回类型
type T4 = ReturnType<() => string>;  // string
type T5 = ReturnType<(x: number) => Promise<string>>;  // Promise<string>

// Parameters - 获取函数参数类型
type T6 = Parameters<() => void>;  // []
type T7 = Parameters<(x: string, y: number) => void>;  // [string, number]
```

### 10.1.2 自定义工具类型

```typescript
// DeepPartial - 深可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface User {
  name: string;
  address: {
    city: string;
    zip: string;
  };
}

type PartialUser = DeepPartial<User>;

// DeepReadonly - 深只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// DeepRequired - 深必需
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
```

## 10.2 常用模式

### 10.2.1 可辨识联合

```typescript
type Action =
  | { type: "increment"; payload: number }
  | { type: "decrement"; payload: number }
  | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment":
      return state + action.payload;
    case "decrement":
      return state - action.payload;
    case "reset":
      return 0;
  }
}
```

### 10.2.2 Builder 模式

```typescript
class QueryBuilder<T extends {} = {}> {
  private params: Partial<T> = {};

  set<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T> {
    this.params[key] = value;
    return this;
  }

  build(): T {
    return { ...this.params } as T;
  }
}

interface QueryParams {
  where?: string;
  limit?: number;
  offset?: number;
}

const query = new QueryBuilder<QueryParams>()
  .set("where", "status = 'active'")
  .set("limit", 10)
  .build();
```

### 10.2.3 Result 类型

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, value: a / b };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### 10.2.4 Option 类型

```typescript
type Option<T> = Some<T> | None;

class Some<T> {
  constructor(public value: T) {}
  isSome(): this is Some<T> { return true; }
  isNone(): this is None { return false; }
}

class None {
  static readonly instance = new None();
  isSome(): this is Some<never> { return false; }
  isNone(): this is None { return true; }
}

function find<T>(arr: T[], predicate: (item: T) => boolean): Option<T> {
  const found = arr.find(predicate);
  return found !== undefined ? new Some(found) : None.instance;
}

const result = find([1, 2, 3], x => x > 2);
if (result.isSome()) {
  console.log(result.value);  // 3
}
```

## 10.3 类型守卫技巧

### 10.3.1 typeof

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}
```

### 10.3.2 instanceof

```typescript
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

### 10.3.3 in

```typescript
interface A {
  a: string;
}

interface B {
  b: number;
}

function process(x: A | B) {
  if ("a" in x) {
    console.log(x.a);
  } else {
    console.log(x.b);
  }
}
```

### 10.3.4 自定义类型守卫

```typescript
interface Fish {
  swim(): void;
  fin: number;
}

interface Bird {
  fly(): void;
  wingSpan: number;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function getSmallPet(): Fish | Bird {
  return { swim: () => {}, fin: 2 };
}

const pet = getSmallPet();
if (isFish(pet)) {
  pet.swim();
}
```

### 10.3.5 可辨识联合

```typescript
interface SuccessState {
  status: "success";
  data: string;
}

interface ErrorState {
  status: "error";
  message: string;
}

type State = SuccessState | ErrorState;

function handleState(state: State) {
  if (state.status === "success") {
    console.log(state.data);
  } else {
    console.error(state.message);
  }
}
```

## 10.4 常见问题解决

### 10.4.1 处理第三方库类型

```typescript
// 方法1: 安装 @types
// npm install @types/lodash

// 方法2: 声明模块
declare module "my-lib" {
  export function doSomething(): void;
}

// 方法3: 扩展现有模块
declare module "express" {
  interface Application {
    enableStrict(): void;
  }
}
```

### 10.4.2 处理 JSON 类型

```typescript
// 安全解析 JSON
function safeParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

interface User {
  name: string;
  age: number;
}

const user = safeParse<User>('{"name":"John","age":30}');
```

### 10.4.3 类型断言模式

```typescript
// 类型断言函数
function assertIsDefined<T>(val: T, msg?: string): asserts val is NonNullable<T> {
  if (val === null || val === undefined) {
    throw new Error(msg ?? "Value is not defined");
  }
}

function process(name?: string) {
  assertIsDefined(name, "Name is required");
  console.log(name.toUpperCase());  // name 现在是 string 类型
}
```

## 10.5 配置建议

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 10.6 练习题

```typescript
// 1. 实现一个 DeepMerge 工具类型
// 2. 创建一个类型安全的 EventEmitter
// 3. 实现一个 Either monad
// 4. 使用 discriminated union 实现一个状态机
```

---

# 11. 工程化与配置

## 11.1 tsconfig.json 详解

### 11.1.1 基本配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 11.1.2 编译选项详解

```json
{
  "compilerOptions": {
    // 语言和环境
    "target": "ES2020",                    // 编译目标版本
    "module": "ESNext",                   // 模块系统
    "lib": ["ES2020", "DOM"],             // 包含的库类型定义
    "jsx": "react-jsx",                    // JSX 模式
    "moduleResolution": "node",            // 模块解析策略

    // 严格模式
    "strict": true,                        // 启用所有严格检查
    "noImplicitAny": true,                 // 不允许隐式 any
    "strictNullChecks": true,             // 严格的空检查
    "strictFunctionTypes": true,          // 严格的函数类型检查

    // 输出控制
    "outDir": "./dist",                    // 输出目录
    "outFile": "./bundle.js",             // 输出为单个文件
    "declaration": true,                   // 生成 .d.ts 文件
    "declarationDir": "./types",          // .d.ts 输出目录
    "sourceMap": true,                    // 生成 source map
    "removeComments": true,               // 删除注释

    // 代码检查
    "noUnusedLocals": true,               // 检查未使用的局部变量
    "noUnusedParameters": true,            // 检查未使用的参数
    "noImplicitReturns": true,            // 检查隐式返回值
    "noFallthroughCasesInSwitch": true,   // switch 必须包含 default

    // 其他
    "esModuleInterop": true,               // ES 模块互操作
    "allowSyntheticDefaultImports": true, // 允许合成默认导入
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,                 // 跳过库类型检查
    "resolveJsonModule": true              // 允许导入 json 模块
  }
}
```

## 11.2 项目结构

### 11.2.1 推荐目录结构

```
my-project/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   │   ├── index.ts
│   │   └── api.ts
│   └── index.ts
├── tests/
├── dist/
├── package.json
├── tsconfig.json
└── .gitignore
```

### 11.2.2 TypeScript 路径别名配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

配合 webpack 或 vite 使用：

```typescript
// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
    },
  },
});
```

## 11.3 编译检查

### 11.3.1 监视模式

```bash
# 监视文件变化自动编译
tsc --watch

# 或在 tsconfig.json 中
{
  "watchOptions": {
    "excludeFiles": ["**/node_modules/**"]
  }
}
```

### 11.3.2 项目引用

```json
// tsconfig.json (根目录)
{
  "files": [],
  "references": [
    { "path": "./shared" },
    { "path": "./utils" }
  ]
}

// shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "../dist/shared"
  },
  "include": ["src/**/*"]
}
```

## 11.4 类型定义

### 11.4.1 声明文件

```typescript
// globals.d.ts
declare const VERSION: string;
declare function greet(name: string): string;

interface Window {
  ga: (command: string, ...args: any[]) => void;
}

// 使用
window.ga("send", "pageview");
```

### 11.4.2 模块声明

```typescript
// modules.d.ts
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "my-custom-package" {
  export interface Config {
    name: string;
    version: string;
  }
  export function init(config: Config): void;
}
```

## 11.5 第三方库集成

### 11.5.1 安装类型定义

```bash
# 查找 @types 包
npm search @types/lodash

# 安装
npm install --save-dev @types/node
npm install --save-dev @types/react
npm install --save-dev @types/jest
```

### 11.5.2 自定义类型

```typescript
// types/react-redux.d.ts
import "redux";
import "react-redux";

declare module "redux" {
  export interface Dispatch<S> {
    <A extends redux.Action>(action: A): A;
  }
}
```

## 11.6 构建集成

### 11.6.1 Babel + TypeScript

```json
// babel.config.json
{
  "presets": [
    "@babel/preset-typescript",
    ["@babel/preset-env", { "targets": "defaults" }]
  ]
}
```

### 11.6.2 Webpack

```javascript
// webpack.config.js
module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
```

### 11.6.3 Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

## 11.7 代码检查

### 11.7.1 ESLint 配置

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 11.7.2 Prettier 配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

## 11.8 测试集成

### 11.8.1 Jest 配置

```json
// jest.config.json
{
  "preset": "ts-jest",
  "testEnvironment": "jsdom",
  "roots": ["<rootDir>/src"],
  "testMatch": ["**/__tests__/**/*.test.ts"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

### 11.8.2 Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
```

## 11.9 发布

### 11.9.1 发布类型定义

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc"
  }
}
```

### 11.9.2 自动生成声明

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": false
  }
}
```

---

# 12. 练习答案

## 12.1 第一章：基础类型

```typescript
// 1. 定义一个表示人物的结构
interface Person {
  name: string;
  age: number;
  height?: number;  // 可选
}

let person: Person = {
  name: "张三",
  age: 25,
  height: 175
};

// 2. 创建一个枚举表示星期几
enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

// 3. 写一个返回never的函数
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## 12.2 第二章：接口与类型

```typescript
// 1. 创建汽车接口
interface Car {
  brand: string;
  model?: string;  // 可选
  year: number;
}

// 2. 创建点坐标类型别名
type Point = {
  x: number;
  y: number;
};

// 3. 实现对象包含字符串索引和数值索引
interface HybridIndex {
  [key: string]: string | number;
  [index: number]: string;
}

let hybrid: HybridIndex = {
  name: "test",
  0: "zero",
  1: "one"
};
```

## 12.3 第三章：函数

```typescript
// 1. 可选问候语函数
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// 2. 重载函数翻转
function reverse(x: string): string;
function reverse(x: number[]): number[];
function reverse(x: string | number[]): string | number[] {
  if (typeof x === "string") {
    return x.split("").reverse().join("");
  }
  return x.slice().reverse();
}

// 3. 泛型获取首尾元素
function getFirstAndLast<T>(arr: T[]): [T, T] | [undefined, undefined] {
  if (arr.length === 0) return [undefined, undefined];
  return [arr[0], arr[arr.length - 1]];
}
```

## 12.4 第四章：泛型

```typescript
// 1. 泛型求最大值
function max<T>(arr: T[], compare: (a: T, b: T) => number): T {
  return arr.reduce((prev, curr) =>
    compare(prev, curr) > 0 ? prev : curr
  );
}

// 使用
max([3, 1, 4, 1, 5], (a, b) => a - b);  // 5

// 2. 键值对泛型接口
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

// 3. Promise 包装器
type PromiseType<T> = T extends Promise<infer U> ? U : T;

type A = PromiseType<Promise<string>>;  // string
type B = PromiseType<Promise<number>>;  // number

// 4. 将接口属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## 12.5 第五章：枚举

```typescript
// 1. HTTP 状态码枚举
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  Error = 500
}

// 2. RGB 字符串枚举
enum RGBColor {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

// 3. 权限位掩码
const enum Permission {
  Read = 1 << 0,   // 1
  Write = 1 << 1,  // 2
  Execute = 1 << 2 // 4
}

let userPermissions = Permission.Read | Permission.Write;
```

## 12.6 第六章：装饰器

```typescript
// 1. 日志装饰器
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`${key} 调用参数:`, args);
    const result = original.apply(this, args);
    console.log(`${key} 返回值:`, result);
    return result;
  };
  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 2. 性能监控装饰器
function measure(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    const end = performance.now();
    console.log(`${key} 执行时间: ${end - start}ms`);
    return result;
  };
  return descriptor;
}

// 3. 验证装饰器
function validate(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    if (args[0] === null || args[0] === undefined) {
      throw new Error("参数不能为空");
    }
    return original.apply(this, args);
  };
  return descriptor;
}
```

## 12.7 第七章：高级类型

```typescript
// 1. 取出数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;

type A = ElementType<string[]>;  // string
type B = ElementType<number[]>;  // number

// 2. DeepPartial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 3. 判断是否为 never
type IsNever<T> = [T] extends [never] ? true : false;

type A = IsNever<never>;  // true
type B = IsNever<string>; // false
```

## 12.8 第八章：模块系统

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

// index.ts
export { add, multiply } from "./math";
export { capitalize, reverse } from "./string";

// 默认导出
export default class Config {
  static apiUrl = "https://api.example.com";
}

// 动态导入
async function loadMath() {
  const { add } = await import("./math");
  return add(1, 2);
}
```

## 12.9 第九章：命名空间与声明合并

```typescript
// 1. 几何计算命名空间
namespace Geometry {
  export interface Point {
    x: number;
    y: number;
  }

  export function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  export function area(radius: number): number {
    return Math.PI * radius ** 2;
  }
}

// 2. 类与命名空间合并
class Product {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

namespace Product {
  export let category = "General";
}

Product.category;  // "General"

// 3. 日志 Mixin
function LoggingMixin<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    log(message: string) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  };
}
```

## 12.10 第十章：实用技巧与最佳实践

```typescript
// 1. DeepMerge
type DeepMerge<T, U> = {
  [P in keyof T | keyof U]: P extends keyof T & keyof U
    ? T[P] extends object
      ? U[P] extends object
        ? DeepMerge<T[P], U[P]>
        : T[P]
      : U[P]
    : P extends keyof T
    ? T[P]
    : P extends keyof U
    ? U[P]
    : never;
};

// 2. 类型安全的 EventEmitter
type EventMap = Record<string, any>;

class TypedEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: ((data: T[K]) => void)[] } = {};

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return this;
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners[event]?.forEach(listener => listener(data));
  }
}

// 3. Either monad
type Either<L, A> = Left<L, A> | Right<L, A>;

class Left<L, A> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L, A> { return true; }
  isRight(): this is Right<L, A> { return false; }
}

class Right<L, A> {
  constructor(public readonly value: A) {}
  isLeft(): this is Left<L, A> { return false; }
  isRight(): this is Right<L, A> { return true; }
}

// 4. 状态机
type TrafficLightState =
  | { state: "red"; timeLeft: number }
  | { state: "yellow"; timeLeft: number }
  | { state: "green"; timeLeft: number };

function transition(state: TrafficLightState): TrafficLightState {
  switch (state.state) {
    case "red":
      return { state: "green", timeLeft: 60 };
    case "green":
      return { state: "yellow", timeLeft: 5 };
    case "yellow":
      return { state: "red", timeLeft: 60 };
  }
}
```

---

# 学习路线

```
基础 → 进阶 → 实战

1. 基础类型 → 2. 接口与类型 → 3. 函数
     ↓
4. 泛型 → 5. 枚举
     ↓
6. 装饰器 → 7. 高级类型
     ↓
8. 模块系统 → 9. 命名空间
     ↓
10. 实用技巧 → 11. 工程化
```

## 快速开始

### 安装 TypeScript

```bash
npm install -g typescript
tsc --version
```

### 编译代码

```bash
# 初始化 tsconfig
tsc --init

# 编译所有 .ts 文件
tsc

# 监视模式
tsc --watch
```

## 推荐学习资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
