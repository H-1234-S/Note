# TypeScript 完全指南

## 目录

1. [基础类型](./01-基础类型.md) - 布尔值、字符串、数字、数组、元组、枚举等
2. [接口与类型](./02-接口与类型.md) - 接口、类型别名、属性修饰符
3. [函数](./03-函数.md) - 函数类型、可选参数、重载、泛型函数
4. [泛型](./04-泛型.md) - 泛型约束、泛型类型、条件类型、映射类型
5. [枚举](./05-枚举.md) - 数字枚举、字符串枚举、常量枚举
6. [装饰器](./06-装饰器.md) - 类装饰器、方法装饰器、属性装饰器
7. [高级类型](./07-高级类型.md) - 联合类型、交叉类型、类型守卫
8. [模块系统](./08-模块系统.md) - 导入导出、动态导入、模块声明
9. [命名空间与声明合并](./09-命名空间与声明合并.md) - 命名空间、声明合并、混入
10. [实用技巧与最佳实践](./10-实用技巧与最佳实践.md) - 工具类型、设计模式
11. [工程化与配置](./11-工程化与配置.md) - tsconfig、工程结构、构建集成
12. [练习答案](./12-练习答案.md) - 各章节练习题答案

## 学习路线

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

### 基本配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## 推荐学习资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
