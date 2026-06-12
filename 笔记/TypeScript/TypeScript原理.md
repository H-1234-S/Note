
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

但**还不知道**age类型是什么，add返回什么，a、b参数是否合法

> Checker 遍历AST，计算每个节点的Type，检查是否兼容，报错

