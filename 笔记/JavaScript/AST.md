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


