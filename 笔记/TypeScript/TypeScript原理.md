
# 1. TS 生命周期

一次 `tsc` 检查大致经历：

1. 读取 `tsconfig.json`。
2. 根据 `include`、`exclude`、`files` 建立源文件列表(过程中已经生成 AST)。
3. Binder 建立符号表：把变量、函数、类型、模块绑定成 symbol。
4. Checker 做类型检查：推断、收窄、泛型实例化、兼容性判断。
5. Transformer / Emitter 输出 JS、`.d.ts`、source map。
## 1.1 读取 tsconfig.json 文件

ts 执行，也就是编译文件时，先去查找 `tsconfig.json `入口文件

先读取配置，也就是**得到**要编译谁？不编译谁？要怎么编译？

```
tsc
│
├─ 读取 tsconfig
│
├─ 得到 CompilerOptions
│
├─ 得到 include/exclude
│
├─ 处理 extends
│
└─ 得到 ParsedCommandLine
```

此时内存中得到：

``` js
ParsedCommandLine {
  options: {...},
  include: ["src/**/*"],
  exclude: ["tests"],
  fileNames: []
}
```

也就是编译哪些文件、不编译哪些文件、用什么规则编译
## 1.2 建立 SourceFile 列表

> 根据 `include/exclude/files` 建立 `SourceFile` 列表，也就是拿到**具体文件名和文件内容**

**获取规则：**
	1. 如果存在 `files`，则只编译 `files` 中指出的文件，不扫描整个目录
	2. 如果不存在 `files`，那么先查找 `include` 中的文件
	3. 查找完之后，再过滤掉 `exclude` 中的文件

> 之后创建 `SourceFile` 列表

一个 ts 文件对应一个 SourceFile，什么是 `SourceFile` 文件？

``` js
const name = "Tom";

// 对应的 sourceFile 文件

SourceFile {
    fileName: "index.ts",
    text: 'const name = "Tom";',
    statements: [...]
}
```

> 此时，`createSourceFile` 时候，`AST` 已经基本生成了，`SourceFile` 本身就是 `AST` 根节点

``` js
const name = "Tom";

/* 对应的 AST
SourceFile
│
└── VariableStatement
      │
      └── VariableDeclaration
              │
              ├── Identifier(name)
              └── StringLiteral("Tom")
*/
```

### 1.2.1 创建 Program 对象

`Program` 是由 TypeScript `CompilerHost` 创建的一个**包含所有源文件（SourceFile）以及编译配置（CompilerOptions）的集合体**

它不仅仅是一个文件列表，它还代表了一个**编译上下文（Compilation Context）**，后续所有操作都是基于 Program 来实现

``` js
// Binder：
program.getSourceFiles()
// Checker：
program.getTypeChecker()
// Emitter：
program.emit()
```

> 在 TypeScript 中，Program 要求被视为**不可变的**，它代表了某一刻时的代码状态，如果代码变动，ts 会创建新的 Program 对象

## 1.3 Binder 建立符号表

该阶段就是让 **`TypeScript` 编译器**真正理解代码

**例如：**
``` js
const name = "Tom";

console.log(name);
```
**AST：**
```
SourceFile
│
├── VariableDeclaration
│      └── Identifier(name)
│
└── CallExpression
       └── Identifier(name)
```

因为 AST 只是语法的表示结构

它只知道上面定义了一个name，下面调用了一个name，但是不知道它们是不是同一个name，同时也不知道调用的name是**变量**还是**函数**

> 因此编译器需要有一个阶段来回答每个**名字**是什么含义，将声明和调用关联

Binder 做的是：
```
扫描代码里的名字
	↓
判断这些名字在哪里声明
	↓
把名字放到正确作用域
	↓
建立“名字 → 声明”的绑定关系
```

例如：
``` js
const name = "Tom";
```

Binder 会创建：
``` js
Symbol {
    name: "name",
    flags: Variable
}
```

其实就是在当下作用域中为 name 声明了一个唯一标签，以后**可以通过作用域链**查找到的所有 name 都指向它

然后通过作用域链查找变量

例如：
``` js
console.log(name);

/*
Identifier(name)
*/
```

查作用域：
``` js
scope["name"]
// 找到
Symbol(name)
// 然后建立关联
```

## 1.4 Checker 阶段

**例如：**
``` js
const age = 18;

function add(a: number, b: number) {
  return a + b;
}

add(age, 2);
```

**编译器内存中：**
```
Program
│
├── AST
│
├── Symbol(age)
│
├── Symbol(add)
│
├── Symbol(a)
│
└── Symbol(b)
```

当前**已经知道**了age是变量，add是函数，a、b是参数

但**还不知道**age类型是什么，add返回什么、返回值类型是什么，a、b参数是否合法，

> Checker 遍历AST，计算每个节点的Type，检查是否兼容，报错

### 1.4.1 类型推导

类型推导就是：**在没有显式写类型的地方，Checker 根据代码上下文计算出类型**

例如：

``` ts
const age = 18;
let count = 18;
const user = {
  name: "Tom",
  age: 18,
};
```

Checker 会得到：

``` ts
const age: 18
let count: number
const user: {
  name: string;
  age: number;
}
```

为什么 `const age` 是 `18`，而 `let count` 是 `number`？

因为：

- `const` 变量不能重新赋值，所以可以推断成更窄的字面量类型 `18`
- `let` 变量后续可能被改成其他 number，所以会拓宽成 `number`
- 对象属性默认可变，所以 `name: "Tom"` 会拓宽成 `name: string`

如果希望对象属性也保持最窄类型，需要使用 `as const`：

``` ts
const user = {
  name: "Tom",
  age: 18,
} as const;

/*
type:
{
  readonly name: "Tom";
  readonly age: 18;
}
*/
```

### 1.4.2 Type 与 Symbol 的区别

`Symbol` 回答的是：**这个名字是谁？在哪里声明？**

`Type` 回答的是：**这个表达式或声明的类型是什么？**

例如：

``` ts
const age = 18;

age.toFixed();
```

编译器内部大概是：

``` text
Identifier(age)
  ↓
找到 Symbol(age)
  ↓
通过 Symbol 的声明计算 Type
  ↓
Type = number literal 18
  ↓
检查 18 是否有 toFixed 方法
```

再看一个函数：

``` ts
function add(a: number, b: number) {
  return a + b;
}
```

Binder 产生：

``` text
Symbol(add)
Symbol(a)
Symbol(b)
```

Checker 计算：

``` ts
type add = (a: number, b: number) => number
type a = number
type b = number
type return = number
```

所以可以简单理解：

``` text
AST    = 代码长什么样
Symbol = 名字指向谁
Type   = 这个东西是什么类型
```

### 1.4.3 上下文类型

TypeScript 不只会从右边推导左边，也会从左边反过来约束右边，这叫**上下文类型**

``` ts
const handler: (event: MouseEvent) => void = (event) => {
  event.preventDefault();
};
```

虽然箭头函数参数 `event` 没有显式标注，但是左边已经说明了函数类型，所以 Checker 会把 `event` 推断成 `MouseEvent`

React 中也很常见：

``` tsx
<button
  onClick={(event) => {
    event.currentTarget.disabled = true;
  }}
>
  Save
</button>
```

`event` 的类型来自 `button` 的 `onClick` 属性定义

### 1.4.4 类型兼容性

TypeScript 的类型系统主要是**结构类型系统**，不是名义类型系统

也就是说：它关心对象**长什么样**，而不是对象**叫什么名字**

``` ts
type User = {
  id: string;
  name: string;
};

type Person = {
  id: string;
  name: string;
};

const user: User = {
  id: "1",
  name: "Tom",
};

const person: Person = user; // 可以
```

因为 `User` 和 `Person` 的结构一样，所以兼容

如果属性更多，也可能兼容：

``` ts
type User = {
  id: string;
  name: string;
};

const admin = {
  id: "1",
  name: "Tom",
  role: "admin",
};

const user: User = admin; // 可以
```

原因是：`admin` 至少拥有 `User` 需要的属性

但对象字面量直接赋值时会触发额外属性检查：

``` ts
const user: User = {
  id: "1",
  name: "Tom",
  role: "admin", // 报错
};
```

这是 TypeScript 为了避免拼错属性而额外做的一层检查

### 1.4.5 控制流分析与类型收窄

Checker 会根据 `if`、`switch`、`return`、`throw` 等控制流改变变量在某个分支中的类型

``` ts
function print(value: string | number) {
  if (typeof value === "string") {
    value.toUpperCase();
    return;
  }

  value.toFixed(2);
}
```

在第一个分支中：

``` text
value: string | number
  ↓ typeof value === "string"
value: string
```

因为 `string` 分支已经 `return`，所以后面的代码中：

``` text
value: number
```

更复杂一点：

``` ts
type State =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function render(state: State) {
  switch (state.status) {
    case "loading":
      return "加载中";
    case "success":
      return state.data;
    case "error":
      return state.error.message;
  }
}
```

`status` 是可辨识字段，Checker 会通过它判断当前分支中 `state` 具体是哪一种对象

### 1.4.6 泛型实例化

泛型本质上是：**把类型当参数传入，再得到一个具体类型**

``` ts
function identity<T>(value: T): T {
  return value;
}

const a = identity("hello");
const b = identity(123);
```

Checker 会分别实例化：

``` ts
identity<string>("hello") -> string
identity<number>(123)    -> number
```

泛型推断通常来自参数：

``` ts
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user = {
  id: "1",
  name: "Tom",
};

const name = getProperty(user, "name");
```

推导过程：

``` text
object 参数传入 user
  ↓
T = { id: string; name: string }

key 参数传入 "name"
  ↓
K = "name"

返回值 T[K]
  ↓
T["name"]
  ↓
string
```

如果泛型带约束：

``` ts
function getLength<T extends { length: number }>(value: T) {
  return value.length;
}
```

`extends` 的意思不是继承类，而是要求传入的类型**至少满足某种结构**

## 1.5 Transformer / Emitter 阶段

Checker 检查完成后，如果没有开启 `noEmit`，TypeScript 会进入输出阶段

输出阶段主要做三件事：

1. 擦除类型语法
2. 根据 `target`、`module` 等配置转换部分语法
3. 输出 `.js`、`.d.ts`、`.map`

例如：

``` ts
type User = {
  name: string;
};

function greet(user: User): string {
  return `hello ${user.name}`;
}
```

输出 JS：

``` js
function greet(user) {
  return `hello ${user.name}`;
}
```

可以看到：

- `type User` 被删除
- 参数类型 `: User` 被删除
- 返回值类型 `: string` 被删除
- 运行时代码保留

### 1.5.1 类型擦除

TypeScript 类型大部分只存在于开发期，编译后会被擦除

会被擦除的例子：

``` ts
type ID = string | number;
interface User {
  id: ID;
}

const user: User = {
  id: "1",
};
```

输出后大致只剩：

``` js
const user = {
  id: "1",
};
```

所以 TypeScript 不会帮你做运行时类型校验

``` ts
type User = {
  id: string;
  name: string;
};

const data = await response.json() as User;
```

这里的 `as User` 只是告诉 Checker “把它当成 User”，并不会检查接口数据是不是真的有 `id` 和 `name`

### 1.5.2 会产生运行时代码的 TS 语法

并不是所有 TypeScript 语法都会被完全擦除，有些语法会产生运行时代码

例如 `enum`：

``` ts
enum Direction {
  Up,
  Down,
}
```

会输出类似：

``` js
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
```

再如参数属性：

``` ts
class UserService {
  constructor(private readonly baseUrl: string) {}
}
```

会输出属性赋值代码：

``` js
class UserService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
}
```

所以要区分：

``` text
纯类型语法：type、interface、类型注解、泛型参数
运行时语法：enum、namespace、参数属性、装饰器、类字段转换
```

### 1.5.3 declaration 输出

如果开启：

``` json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

TypeScript 会额外输出 `.d.ts` 文件

例如：

``` ts
export function add(a: number, b: number) {
  return a + b;
}
```

输出声明文件：

``` ts
export declare function add(a: number, b: number): number;
```

`.d.ts` 的作用是：**只描述类型，不包含实现**

第三方库能被 TS 识别，通常就是因为它自带 `.d.ts`，或者安装了对应的 `@types/xxx`

# 2. 模块解析

当代码中出现：

``` ts
import { add } from "./math";
import React from "react";
```

TypeScript 需要回答两个问题：

1. 这个模块文件在哪里？
2. 这个模块导出了哪些类型和值？

对于相对路径：

``` ts
import { add } from "./math";
```

会按配置尝试查找：

``` text
./math.ts
./math.tsx
./math.d.ts
./math/package.json
./math/index.ts
./math/index.d.ts
```

对于包名：

``` ts
import React from "react";
```

会去 `node_modules/react`，结合 `package.json` 中的 `types`、`typings`、`exports` 等字段找类型入口

### 2.1 paths 只影响类型检查

``` json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

这告诉 TypeScript：

``` ts
import { Button } from "@/components/Button";
```

类型检查时可以解析到：

``` text
src/components/Button
```

但注意：`paths` 默认不会改变运行时解析

也就是说，打包器或运行环境也要配置同样的别名，否则 TS 检查通过，运行时仍然可能找不到模块

# 3. 增量编译与 watch 模式

在开发环境中，TypeScript 不会每次都从零开始

`tsc --watch` 或编辑器语言服务会维护一个项目状态：

``` text
文件内容
  ↓
SourceFile
  ↓
Program
  ↓
TypeChecker
  ↓
Diagnostics
```

当某个文件变化：

``` text
修改一个文件
  ↓
重新解析受影响的 SourceFile
  ↓
复用没变的 SourceFile / Symbol / Type 信息
  ↓
重新检查受影响的依赖图
  ↓
更新错误和智能提示
```

开启增量编译：

``` json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

TypeScript 会把上一次构建信息写入 `.tsbuildinfo`，下次构建可以复用

大型项目中常配合项目引用：

``` json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/web" }
  ]
}
```

命令：

``` bash
tsc -b
tsc -b --watch
```

`-b` 是 build mode，会按引用关系先构建被依赖的项目

# 4. Language Service

平时编辑器里的智能提示、跳转定义、重命名、自动导入，并不是简单运行一次 `tsc`

它主要依赖 TypeScript 的 Language Service

``` text
VS Code
  ↓
tsserver
  ↓
Language Service
  ↓
Program / TypeChecker
  ↓
补全、诊断、跳转、重构
```

例如你写：

``` ts
user.
```

编辑器能提示 `id`、`name`，是因为 Language Service 调用 Checker 计算了 `user` 当前表达式的类型

重命名变量时：

``` text
找到当前 Identifier
  ↓
通过 Binder 得到 Symbol
  ↓
找到所有引用同一个 Symbol 的位置
  ↓
批量修改
```

所以 Binder 不只服务编译，也服务编辑器能力

# 5. 常见错误来自哪个阶段

### 5.1 Parser 错误

语法写错：

``` ts
const name =
```

此类错误来自 Parser，因为代码连 AST 都无法完整生成

### 5.2 Binder 错误

重复声明、作用域冲突等问题通常和 Binder 有关：

``` ts
let name = "Tom";
let name = "Jerry";
```

Binder 会发现同一个作用域中出现了重复声明

### 5.3 Checker 错误

绝大多数类型错误来自 Checker：

``` ts
function add(a: number, b: number) {
  return a + b;
}

add("1", 2);
```

Checker 会判断：

``` text
实参 "1" 的类型是 string
形参 a 的类型是 number
string 不能赋值给 number
```

### 5.4 Module Resolution 错误

模块找不到：

``` ts
import { foo } from "@/foo";
```

常见原因：

- `paths` 没配置
- `baseUrl` 不对
- 包没有类型声明
- `moduleResolution` 与项目运行方式不匹配
- 打包器配置和 tsconfig 配置不一致

# 6. TypeScript 原理总览图

``` text
tsconfig.json
  ↓
parseJsonConfigFileContent
  ↓
ParsedCommandLine
  ↓
CompilerHost
  ↓
Program
  ├─ SourceFile(AST)
  ├─ CompilerOptions
  └─ TypeChecker
       ↓
Parser
  ↓
Binder
  ├─ Scope
  └─ Symbol Table
       ↓
Checker
  ├─ Type Inference
  ├─ Control Flow Analysis
  ├─ Generic Instantiation
  ├─ Assignability
  └─ Diagnostics
       ↓
Transformer / Emitter
  ├─ JavaScript
  ├─ .d.ts
  └─ source map
```

一句话总结：

``` text
Parser 让编译器看懂代码结构
Binder 让编译器知道名字指向谁
Checker 让编译器知道类型是否正确
Emitter 把类型擦掉并输出运行时代码
Language Service 把这些能力提供给编辑器
```

# 7. 学习 TypeScript 原理时的关键结论

1. TypeScript 的类型系统主要发生在开发期，编译后大部分类型都会消失
2. AST 只表示代码结构，不表示语义
3. Binder 负责把名字和声明绑定起来
4. Checker 负责类型推导、类型收窄、泛型实例化和兼容性检查
5. `Symbol` 表示“声明身份”，`Type` 表示“类型信息”
6. TypeScript 是结构类型系统，兼容性主要看结构是否满足
7. `as` 只是类型断言，不是运行时类型转换
8. `paths` 只解决 TypeScript 如何找类型，不自动解决运行时如何找模块
9. `noEmit` 只检查不输出，常用于 Vite、Next、Webpack 等工具链
10. 编辑器智能提示本质上也是复用 Program、Binder、Checker 和 Language Service
