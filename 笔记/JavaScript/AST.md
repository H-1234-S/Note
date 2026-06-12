# 1. 什么是 AST 

AST 全称 Abstract Syntax Tree(抽象语法树)

**例如：**
``` js
const a = 1 + 2

/*
VariableDeclaration
├── Identifier(a)
└── BinaryExpression(+)
    ├── Literal(1)
    └── Literal(2)
```

