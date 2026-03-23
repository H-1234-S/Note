# Prisma
## Prisma 是什么？有什么用？

**Prisma** 是一个现代化的 **ORM（对象关系映射）**。

- **传统方式**：你需要手写原始 SQL 语句（如 `SELECT * FROM users WHERE id = 1`）来操作数据库，这容易出错且没有代码提示。
    
- **使用 Prisma**：你只需要像操作普通的 JavaScript 对象一样操作数据库（如 `prisma.user.findUnique(...)`）。
    

**核心用途：**

1. **类型安全**：它会自动根据你的数据库结构生成 TypeScript 类型。如果你写错了字段名，代码会直接报红，而不是等程序运行时才崩溃。
    
2. **自动化建表**：你只需要在代码里定义模型，它会自动帮你把表在数据库里建好。
    
3. **可视化管理**：自带一个名为 **Prisma Studio** 的后台，让你像用 Excel 一样直接修改数据库数据。
    

---

## `schema.prisma` 文件是什么？有什么用？

这个文件是整个 Prisma 项目的**心脏**。

- **它是什么**：它是你定义数据库配置和数据模型（表结构）的唯一来源。
    
- **有什么用**：
    
    - **配置数据源**：告诉 Prisma 你用的是 PostgreSQL、MySQL 还是其他数据库，以及数据库的地址。
        
    - **定义模型（Model）**：描述你的表长什么样（有哪些列、什么类型、主键是谁、表与表之间怎么关联）。
        
    - **生成代码**：Prisma 会读取这个文件，为你生成定制化的 `Prisma Client` 代码。
	

---

## 怎么用?

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

## 开发环境搭建

``` bash
# 1. 安装 CLI 和类型定义
npm install prisma @types/pg --save-dev

# 2. 安装运行时的核心包
npm install @prisma/client @prisma/adapter-pg pg

# 3. 初始化（如果你还没做过）
npx prisma init
```

每个包的作用如下：

- **`prisma`** - Prisma 命令行工具，用于运行 `prisma init`、`prisma migrate` 和 `prisma generate 等命令`

- **`@prisma/client`** - 用于查询数据库的 Prisma Client 库

- **`@prisma/adapter-pg`** - 连接 Prisma Client 到数据库的 [`node-postgres` 驱动适配器](https://www.prisma.io/docs/orm/core-concepts/supported-databases/postgresql#using-driver-adapters)

- **`pg`** - node-postgres 数据库驱动

- **`@types/pg`** - TypeScript 的 node-postgres 类型定义

- **`dotenv`** - 从你的 `.env` 文件加载环境变量

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

### 字段级属性（以 `@` 开头）

这些属性作用于**单个字段**：

- **`@id`**
    
    - **作用**：声明该字段为主键（Primary Key）。
        
    - **意义**：数据库中每一行记录的唯一标识符，不允许重复，也不允许为空。
        
- **`@default(...)`**
    
    - **作用**：设置字段的默认值。
        
    - **具体用法**：
        
        - `@default(cuid())`：自动生成一个抗碰撞的唯一字符串 ID。
            
        - `@default(now())`：在创建记录时自动填入当前时间。
            
        - `@default(GENERAL)`：针对枚举类型，如果没有传值，默认设为 `GENERAL`。
            
- **`@updatedAt`**
    
    - **作用**：自动维护时间戳。
        
    - **意义**：每当你更新这条记录时，数据库会自动将该字段改为当前时间。非常适合用来记录“最后修改时间”。
        
- **`@relation(...)`**
    
    - **作用**：定义表与表之间的关系。
        
    - **关键参数**：
        
        - `fields: [voiceId]`：本表中的 `voiceId` 是外键。
            
        - `references: [id]`：关联到 `Voice` 表的 `id` 字段。
            
        - `onDelete: SetNull`：级联策略。如果关联的 `Voice` 被删除了，本条生成记录不删除，但 `voiceId` 会变成 `null`。
            

---

### 模型级属性（以 `@@` 开头）

这些属性作用于**整个模型/表**：

- **`@@index([...])`**
    
    - **作用**：在数据库中创建索引（Index）。
        
    - **意义**：
        
        - **加速查询**：当你运行 `where: { orgId: "..." }` 时，如果有索引，数据库会像翻书目录一样飞快定位，而不需要全表扫描。
            
        - **Resonance 场景**：项目中频繁按照 `orgId`（组织隔离）和 `variant`（区分系统/自定义声音）进行查询，所以这两个地方加索引是标准的性能优化。
            

---

### 类型修饰符（虽然不是属性，但很关键）

- **`?` (如 `String?` 或 `Voice?`)**
    
    - **作用**：标记字段为**可选/可为空 (Nullable)**。
        
    - **意义**：如果不带 `?`，Prisma 会强制要求你在创建数据时提供该值。例如 `r2ObjectKey String?`，意味着音频文件可能还在生成中，暂时没有存储路径。
        

---

### 字段类型（Types）

你代码里用到的类型也决定了数据库底层的存储结构：

|**类型**|**对应数据库 (PostgreSQL)**|**作用**|
|---|---|---|
|**`String`**|`text`|存储文本、ID、URL 等。|
|**`Float`**|`double precision`|存储带小数点的数字（如 AI 参数 `temperature`）。|
|**`Int`**|`integer`|存储整数（如 `topK`）。|
|**`DateTime`**|`timestamp`|存储精确的时间。|
|**`VoiceVariant`**|`enum`|你自定义的枚举类型，只允许存预设的值。|

---

# Prisma studio