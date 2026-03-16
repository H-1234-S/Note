# Prisma
## 一、 Prisma 是什么？有什么用？

**Prisma** 是一个现代化的 **ORM（对象关系映射）**。

- **传统方式**：你需要手写原始 SQL 语句（如 `SELECT * FROM users WHERE id = 1`）来操作数据库，这容易出错且没有代码提示。
    
- **使用 Prisma**：你只需要像操作普通的 JavaScript 对象一样操作数据库（如 `prisma.user.findUnique(...)`）。
    

**核心用途：**

1. **类型安全**：它会自动根据你的数据库结构生成 TypeScript 类型。如果你写错了字段名，代码会直接报红，而不是等程序运行时才崩溃。
    
2. **自动化建表**：你只需要在代码里定义模型，它会自动帮你把表在数据库里建好。
    
3. **可视化管理**：自带一个名为 **Prisma Studio** 的后台，让你像用 Excel 一样直接修改数据库数据。
    

---

## 二、 `schema.prisma` 文件是什么？有什么用？

这个文件是整个 Prisma 项目的**心脏**。

- **它是什么**：它是你定义数据库配置和数据模型（表结构）的唯一来源。
    
- **有什么用**：
    
    - **配置数据源**：告诉 Prisma 你用的是 PostgreSQL、MySQL 还是其他数据库，以及数据库的地址。
        
    - **定义模型（Model）**：描述你的表长什么样（有哪些列、什么类型、主键是谁、表与表之间怎么关联）。
        
    - **生成代码**：Prisma 会读取这个文件，为你生成定制化的 `Prisma Client` 代码。
	

---

## 三、 怎么用?

结合你正在做的 **Resonance** 项目，典型的用法如下：

### 1. 定义模型 (在 `schema.prisma` 中)

你会写下类似这样的代码：

``` Code snippet
// 定义一个语音模型
model Voice {
  id        String   @id @default(cuid())
  name      String
  url       String
  variant   VoiceVariant // 使用你截图里定义的那个枚举
  createdAt DateTime @default(now())
}
```

### 2. 同步到数据库 (迁移)

在终端运行：

``` Bash
npx prisma migrate dev --name init_voice_table
```

这行命令会让 Prisma 跑去你的 PostgreSQL 数据库里把 `Voice` 这张表建出来。

### 3. 在代码中调用

现在你可以在你的 Next.js 服务端组件里直接用了：

``` TypeScript
import { db } from "@/lib/db"; // 假设你封装了 prisma 实例

const voices = await db.voice.findMany({
  where: { variant: "SYSTEM" }
});
```

--- 
# Prisma Client

Prisma Client是一个根据定义的 `schema.prisma` 文件，**自动生成的**类型安全（Type-safe）的查询库。

- **自动生成**：它不是一个写死的包。当你运行 `npx prisma generate` 时，它会读取你的模型（比如你刚写的 `Voice` 和 `Generation`），专门为你生成一套独一无二的代码。
    
- **类型安全**：因为它知道你的表里有哪些字段，所以当你敲代码时，编辑器会精准地告诉你哪些字段可以用，哪些是必填的。
## 核心语法

### 1. 查询 (Read)

``` TypeScript
// 获取所有系统语音
const voices = await db.voice.findMany({
  where: { variant: "SYSTEM" },
  orderBy: { createdAt: "desc" }
});

// 获取单条记录及其关联数据 (使用 include)
const voiceWithGenerations = await db.voice.findUnique({
  where: { id: "voice_id_123" },
  include: { generations: true } // 这里的 generations 对应 schema 中的关系字段
});
```
### 2. 写入 (Create)

``` TypeScript
await db.generation.create({
  data: {
    text: "Hello World",
    voiceId: "voice_123",
    orgId: "org_abc",
    temperature: 0.7,
    // ...其他必填字段
  }
});
```
### 3. 更新与删除 (Update & Delete)

``` TypeScript
// 更新
await db.voice.update({
  where: { id: "123" },
  data: { name: "New Name" }
});

// 删除
await db.voice.delete({ where: { id: "123" } });
```

## 字段属性

模型：

``` 
model 名字 { 
  字段名 类型 属性 
}
```

| **属性**           | **作用**           | **例子**                               |
| ---------------- | ---------------- | ------------------------------------ |
| **`@id`**        | 声明主键（唯一标识）       | `id String @id`                      |
| **`@default()`** | 设置默认值            | `createdAt DateTime @default(now())` |
| **`@unique`**    | 确保该字段值全表唯一       | `email String @unique`               |
| **`?`**          | 声明该字段为“可选”（允许为空） | `description String?`                |
| **`@updatedAt`** | 自动记录最后一次修改时间     | `updatedAt DateTime @updatedAt`      |
| **`@map()`**     | 数据库字段名与代码字段名映射   | `userId String @map("user_id")`      |