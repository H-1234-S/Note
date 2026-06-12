
# 1. TS 生命周期

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

> 根据 `include/exclude/files` 建立 `SourceFile` 列表，也就是拿到**具体文件名**

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