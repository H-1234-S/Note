
> 本指南基于 TypeScript 5.x/6.x 最新特性编写，适合从初学者到进阶开发者。

---
## 初阶：类型基础

### 1. 基本类型

TypeScript 继承并强化了 JavaScript 的基本类型。

```ts
// 原始类型
let name: string = "Alice";
let age: number = 25;
let active: boolean = true;

// 数组
let nums: number[] = [1, 2, 3];
let names: Array<string> = ["a", "b"];

// null 与 undefined
let n: null = null;
let u: undefined = undefined;

// void（通常用于函数无返回值）
function log(): void {
  console.log("done");
}

// never（永不返回）
function fail(): never {
  throw new Error("error");
}

// unknown（类型未知，需类型检查后使用）
let unknownVal: unknown = Math.random() > 0.5 ? "string" : 123;
if (typeof unknownVal === "string") {
  console.log(unknownVal.toUpperCase());
}

// 任意类型 any（绕过类型检查，不推荐）
let anything: any = 42;
anything = "string"; // 允许
```

### 2. 任意值（any vs unknown）

| 类型 | 特点 |
|------|------|
| `any` | 绕过所有类型检查，可自由赋值 |
| `unknown` | 需类型守卫（type guard）后才能使用，更安全 |

### 3. 类型推断

TypeScript 能自动推断变量类型，无需显式标注。

```ts
// 推断为 string
let msg = "hello"; // let msg: string

// 推断为 number[]
let list = [1, 2, 3]; // let list: number[]

// 推断为 () => number
let add = (a: number, b: number) => a + b;

// 函数返回值推断
function getDefault() { return 42; }
// 返回值类型推断为 number
```

### 4. 接口（Interfaces）

接口定义对象的结构。

```ts
interface User {
  id: number;
  name: string;
  email?: string;           // 可选属性
  readonly createdAt: Date; // 只读属性
}

const user: User = {
  id: 1,
  name: "Alice",
  createdAt: new Date(),
};
// user.createdAt = new Date(); // 错误！只读不可修改
```

### 5. 类型别名（Type Aliases）

类型别名给类型起别名，便于复用。

```ts
type ID = number | string;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// 使用
let userId: ID = "abc123";
const origin: Point = { x: 0, y: 0 };
```

### 6. Interface vs Type Alias

| 特性 | Interface | Type Alias |
|------|-----------|------------|
| 定义对象结构 | ✅ | ✅ |
| 定义原始类型/联合类型 | ❌ | ✅ |
| 可被 implements | ✅ | ❌ |
| 可被 extends | ✅（可多继承） | ✅（交叉类型） |
| 声明合并（同名自动合并） | ✅ | ❌ |

```ts
// 接口可多继承
interface A { a: number; }
interface B { b: string; }
interface C extends A, B { c: boolean; }

// 类型别名用交叉类型实现相同效果
type C2 = A & B & { c: boolean };
```

---

## 中阶：类型高级特性

### 7. 联合类型（Union Types）

一个值可以是多种类型之一。

```ts
let id: number | string;
id = 1;
id = "one";

// 函数参数联合类型
function greet(name: string | null) {
  if (name === null) {
    console.log("Hello, stranger!");
  } else {
    console.log(`Hello, ${name}!`);
  }
}
```

### 8. 交叉类型（Intersection Types）

将多个类型合并为一个。

```ts
interface Person { name: string; age: number; }
interface Employee { company: string; position: string; }

type EmployeePerson = Person & Employee;

const ep: EmployeePerson = {
  name: "Alice",
  age: 30,
  company: "TechCorp",
  position: "Engineer",
};
```

### 9. 类型断言（Type Assertions）

强制将某类型视为指定类型。

```ts
// 两种语法（推荐 as 语法）
let val: unknown = "hello";

// 方案一：as 语法
let len: number = (val as string).length;

// 方案二：尖括号语法
let len2: number = (<string>val).length;

// 非空断言（确定值不为 null/undefined）
let name: string | null = getName();
console.log(name!.toUpperCase()); // 跳过 null 检查
```

### 10. 泛型（Generics）基础

泛型让类型像函数参数一样工作。

```ts
// 泛型函数
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
firstElement([1, 2, 3]); // number | undefined
firstElement(["a", "b"]); // string | undefined

// 泛型接口
interface Container<T> {
  value: T;
  getValue(): T;
}

// 泛型约束
function getProperty<Obj, Key extends keyof Obj>(obj: Obj, key: Key): Obj[Key] {
  return obj[key];
}
const user = { name: "Alice", age: 25 };
getProperty(user, "name"); // string
```

### 11. 常用工具类型（Utility Types）

TypeScript 内置的常用工具类型：

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

// Partial<T> — 将所有属性变为可选
type PartialUser = Partial<User>;
// 等价于 { id?: number; name?: string; email?: string; }

// Required<T> — 将所有属性变为必需
type RequiredUser = Required<PartialUser>;

// Pick<T, K> — 从 T 中选取部分属性
type UserPreview = Pick<User, "id" | "name">;
// 等价于 { id: number; name: string; }

// Omit<T, K> — 从 T 中排除部分属性
type UserWithoutEmail = Omit<User, "email">;
// 等价于 { id: number; name: string; }

// Record<K, V> — 构建键值对类型
type Role = "admin" | "editor" | "viewer";
type Permission = Record<Role, boolean>;
// 等价于 { admin: boolean; editor: boolean; viewer: boolean; }

// Exclude<T, U> — 从 T 中排除可分配给 U 的类型
type A = string | number | boolean;
type B = Exclude<A, boolean>; // string | number

// Extract<T, U> — 从 T 中提取可分配给 U 的类型
type C = Extract<A, boolean>; // boolean

// NonNullable<T> — 去除 null 和 undefined
type D = NonNullable<string | null | undefined>; // string

// ReturnType<T> — 获取函数返回值类型
function getUser() { return { name: "Alice" }; }
type UserReturn = ReturnType<typeof getUser>; // { name: string }

// Parameters<T> — 获取函数参数类型元组
function updateUser(id: number, name: string) {}
type UpdateParams = Parameters<typeof updateUser>; // [number, string]
```

---

## 进阶：类型体操

### 12. 类型守卫（Type Guards）

在运行时 narrowing 类型。

```ts
// typeof 类型守卫
function padLeft(val: string | number) {
  if (typeof val === "string") {
    return val.padStart(4, "0"); // val 在此为 string
  }
  return val.toFixed(2); // val 在此为 number
}

// in 操作符守卫
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function speak(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark(); // animal 为 Dog
  } else {
    animal.meow(); // animal 为 Cat
  }
}

// 自定义类型守卫
function isString(val: unknown): val is string {
  return typeof val === "string";
}

// instanceof 守卫
class Rabbit { hop() { } }
class Frog { jump() { } }

function move(animal: Rabbit | Frog) {
  if (animal instanceof Rabbit) {
    animal.hop();
  } else {
    animal.jump();
  }
}
```

### 13. 装饰器（Decorators）

> 装饰器为实验性功能，需在 `tsconfig.json` 中开启 `"experimentalDecorators": true`。

```ts
// 类装饰器
function sealed(target: Function) {
  Object.seal(target);
  Object.seal(target.prototype);
}

@sealed
class BugReport {
  title: string;
  constructor(t: string) { this.title = t; }
}

// 方法装饰器
function readonly(
  target: object,
  key: string,
  descriptor: PropertyDescriptor
) {
  descriptor.writable = false;
  return descriptor;
}

class Circle {
  radius: number;

  @readonly
  getArea() { return Math.PI * this.radius ** 2; }
}

// 属性装饰器
function format(target: object, key: string) {
  let val = target[key];
  const getter = () => val;
  const setter = (v: string) => { val = v.trim(); };
  Object.defineProperty(target, key, { get: getter, set: setter });
}

class User {
  @format
  name: string = "";
}
```

### 14. infer 关键字

在条件类型中推断类型。

```ts
// 推断数组元素的类型
type ElementOf<T> = T extends Array<infer E> ? E : never;
type Num = ElementOf<number[]>>; // number
type Str = ElementOf<string[]>;  // string

// 推断函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R = ReturnType<() => User>; // User

// 推断函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type P = Parameters<typeof updateUser>; // [number, string]

// 链式推断（多个 infer）
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
```

### 15. 条件类型（Conditional Types）

基于条件选择类型。

```ts
// 基本语法：T extends U ? X : Y
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"

// 分配律（union 会分发处理每个成员）
type IsStringUnion<T> = T extends string ? true : false;
type C = IsStringUnion<string | number>; // false | false = false
// 注意：string 匹配 true，其余匹配 false → false

// 配合泛型约束
type NonNullable<T> = T extends null | undefined ? never : T;
type D = NonNullable<string | null | undefined>; // string

// 过滤联合类型成员
type Diff<T, U> = T extends U ? never : T;
type E = Diff<"a" | "b" | "c", "a">; // "b" | "c"

// 条件类型结合 infer
type Awaited<T> = T extends Promise<infer V> ? V : T;
type F = Awaited<Promise<string>>; // string
type G = Awaited<number>; // number
```

### 16. 类型体操入门

利用条件类型、infer、映射类型做复杂类型运算。

```ts
// DeepReadonly — 深层只读
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type ReadonlyUser = DeepReadonly<{ name: string; addr: { city: string } }>>;
// { readonly name: string; readonly addr: { readonly city: string } }

// DeepPartial — 深层可选
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Union 转 Intersection
type UnionToIntersection<U> =
  (U extends U ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type II = UnionToIntersection<{ a: number } | { b: string }>;
// { a: number } & { b: string }

// 字符串模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">; // "onClick"
type HoverEvent = EventName<"hover">; // "onHover"

// 递归类型（简化版 DeepRequired）
type DeepRequired<T> = T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T;
```

---

## 实战配置

### 17. tsconfig.json 重要字段解析

```json
{
  // 编译目标 JavaScript 版本
  "target": "ES2022",

  // 模块系统（Node.js 用 commonjs，React/Next.js 用 ESNext）
  "module": "ESNext",

  // 编译库（运行时 API 的类型定义来源）
  "lib": ["ES2022", "DOM", "DOM.Iterable"],

  // JSX 支持（React 项目用 react-jsx，Next.js 相同）
  "jsx": "react-jsx",

  // 严格模式（推荐始终开启）
  "strict": true,

  // 严格空值检查
  "strictNullChecks": true,

  // 装饰器支持
  "experimentalDecorators": true,

  // 允许导入 JSON 模块
  "resolveJsonModule": true,

  // 路径别名配置（需配合打包工具）
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"]
  },

  // 输出目录
  "outDir": "./dist",

  // 源码目录
  "rootDir": "./src",

  // 源码映射（便于调试）
  "sourceMap": true,

  // 增量编译
  "incremental": true,

  // 降级配置（按需兼容旧环境）
  "downlevelIteration": true
}
```

### 18. React / Next.js 最佳实践

#### 18.1 Props 类型定义

```tsx
// React FC 类型
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

// 函数组件类型（带泛型 Props）
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

// 推荐写法（显式 Props）
const Button2 = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

#### 18.2 useState 类型

```tsx
// 自动推断
const [count, setCount] = useState(0); // number

// 显式泛型
const [user, setUser] = useState<User | null>(null);

// 函数式更新（count 推断为 number）
setCount(prev => prev + 1);

// 复杂状态
const [items, setItems] = useState<Array<{ id: number; text: string }>>([]);
```

#### 18.3 useRef 类型

```tsx
// 可变 ref（DOM 或普通值）
const timerRef = useRef<number | null>(null);

// 只读 ref（用于 render 中的值）
const countRef = useRef(0); // const countRef: MutableRef<number>
```

#### 18.4 Next.js App Router 类型

```tsx
// Server Component（默认，无需 "use client"）
async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.getUser(id);
  return <div>{user.name}</div>;
}

// Client Component
"use client";
const Counter = ({ initial }: { initial: number }) => {
  const [count, setCount] = useState(initial);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};
```

#### 18.5 通用工具类型封装

```tsx
// Next.js 的 API Response 类型
type ApiResponse<T> = {
  data: T;
  error: null | string;
  status: number;
};

// React Query / SWR 常用 Response
type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

#### 18.6 最佳实践总结

| 实践 | 说明 |
|------|------|
| 始终开启 `strict: true` | 捕获潜在类型错误 |
| 优先使用 `interface` 定义 API 数据结构 | 可扩展，支持声明合并 |
| 组件 Props 使用 `type` 别名 | 适合联合类型、交叉类型 |
| 善用工具类型 `Partial`/`Pick`/`Omit` | 减少重复类型定义 |
| useState 显式泛型 | 当初始值为 `null` 或复杂对象时必须 |
| 使用 `unknown` 替代 `any` | 强制做类型检查再使用 |
| 配置路径别名 `@/*` | 简化导入路径，提高可维护性 |

---

## 附录：版本特性速查

| 版本 | 关键新特性 |
|------|------------|
| 5.0 | `const` 类型参数、装饰器标准化（`v2`）、`NoInfer` 工具类型 |
| 5.1 | 显式类型注解别名、`as` 类型断言改进 |
| 5.2 | `Symbol` 方法支持、`using` 资源管理 |
| 5.3 | `await using` 异步资源管理、模板字符串类型改进 |
| 5.4 | `NoInfer` 泛型改进、保留推断类型 |
| 5.5 | 改进的类型推断、JSDoc `@import` 标签 |
| 6.0 | 性能优化、改进的 `import` 类型导出检查、更好的正则表达式类型支持 |

---

> 本指南旨在帮助你由浅入深掌握 TypeScript。建议按目录顺序学习，每节代码示例均可在 [TypeScript Playground](https://www.typescriptlang.org/play) 中直接运行验证。
