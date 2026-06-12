# 1. 什么是 AST 

AST 全称 Abstract Syntax Tree(抽象语法树)

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

当前写的代码，是以**人**为主体理解的代码

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

这三种在人看来是格式不同，但是对于编译器来说