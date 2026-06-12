# 1. 什么是 AST 

AST 全称 Abstract Syntax Tree(抽象语法树)，是**源码**的一种树状表示结构，用来将一维的**字符串**转化为有层次、包含语义的树状结构，也就是**让计算机真正读懂代码**

AST 只是一种语法的表示结构，不能运行、不能知道动态的值

**例如：**
``` js
const a = 1 + 2
```

**生成 AST ：**
```
VariableDeclaration
├── Identifier(a)
└── BinaryExpression(+)
    ├── Literal(1)
    └── Literal(2)
```

# 2. 为什么需要 AST

对于计算机来说，源码就是一段**字符串**，如果直接读字符串会有很多歧义，比如： `{}` 在 js 中可以表示一个对象，也可以表示一个函数体

AST 是源代码语法结构的一种**树状表示**。它把一维的“字符串代码”，转换成了有层次的、包含语义的“多维树状结构”

``` js
const a=1+2

const a = 1 + 2

const
a
=
1
+
2
```

虽然三种结构不同，但生成一样的 AST
```
VariableDeclaration
├── Identifier(a)
└── BinaryExpression(+)
    ├── Literal(1)
    └── Literal(2)
```