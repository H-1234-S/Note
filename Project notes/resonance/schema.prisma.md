这一部分代码定义了 Resonance 项目的核心数据结构，即**声音（Voice）**和**生成的音频（Generation）**。

在 Prisma 中，这不仅仅是建表，它还定义了两者之间的**一对多（One-to-Many）关系**：一个声音可以被用来生成多次音频。

---
# Code

``` 
model Voice {
  id String @id @default(cuid())

  orgId String?

  name        String
  description String?
  category    VoiceCategory @default(GENERAL)
  language    String        @default("en-US")
  variant     VoiceVariant
  r2ObjectKey String?

  generations Generation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([variant])
  @@index([orgId])
}

model Generation {
  id String @id @default(cuid())

  orgId String

  voiceId String?
  voice   Voice?  @relation(fields: [voiceId], references: [id], onDelete: SetNull)

  text              String
  voiceName         String
  r2ObjectKey       String?
  temperature       Float
  topP              Float
  topK              Int
  repetitionPenalty Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orgId])
  @@index([voiceId])
}
```

--- 
# Voice

这个表存储的是可用的“声音”，包括系统内置的和用户自己上传克隆的。

- **`id`**: 主键。使用 `cuid()` 生成一个长字符串 ID（比自增数字 ID 更安全，适合分布式系统）。
    
- **`orgId`**: 组织 ID（可选）。如果为空，通常代表是系统全局声音；如果有值，代表是某个特定团队/组织专属的声音。
    
- **`name`**: 声音的名字（如 "Alice", "News Reader"）。
    
- **`description`**: 声音的详细描述（可选）。
    
- **`category`**: 声音所属的类别。使用了你之前定义的 `VoiceCategory` 枚举，默认值为 `GENERAL`。
    
- **`language`**: 声音支持的语言，默认是 `en-US`。
    
- **`variant`**: 声音的类型（系统或自定义）。使用了 `VoiceVariant` 枚举。
    
- **`r2ObjectKey`**: 存储在 Cloudflare R2（云存储）中的文件路径。对于自定义克隆的声音，需要这个 Key 来找到原始音频样本。
    
- **`generations`**: **关系字段**。它不在数据库里存实际数据，而是告诉 Prisma：一个 Voice 对应多个 Generation。
    
- **`createdAt` / `updatedAt`**: 记录创建时间和最后一次修改时间（自动更新）。
    
- **`@@index`**: 数据库索引。针对 `variant` 和 `orgId` 建立索引，能极大加快你按照“系统声音”或“某组织的声音”进行查询的速度。
    

---

# Generation

这个表记录了每一次“文本转语音”的具体操作。

- **`id`**: 每次生成的唯一任务 ID。
    
- **`orgId`**: 属于哪个组织的操作，用于权限隔离。
    
- **`voiceId`**: 关联的 Voice 表的 ID。
    
- **`voice`**: **关系映射**。
    
    - `fields: [voiceId]`: 本表的 `voiceId` 对应 `Voice` 表的 `id`。
        
    - `onDelete: SetNull`: 如果原始声音被删除了，这笔生成记录保留，但 `voiceId` 设为 Null（防止数据丢失）。
        
- **`text`**: 用户输入的原始文本（要转成语音的内容）。
    
- **`voiceName`**: 冗余字段。记录生成时的声音名字。即便 Voice 表被删了，这里也能看到当时用的是哪个名字。
    
- **`r2ObjectKey`**: 生成后的音频文件存放在 Cloudflare R2 的路径。前端通过这个 Key 找到音频并播放。
    
- **`temperature`, `topP`, `topK`, `repetitionPenalty`**: **AI 模型参数**。
    
    - 这些是控制声音生成特性的参数（如随机性、语调起伏）。把它们存下来是为了方便以后“复现”完全一样的声音效果。
        
- **`createdAt` / `updatedAt`**: 记录生成时间。