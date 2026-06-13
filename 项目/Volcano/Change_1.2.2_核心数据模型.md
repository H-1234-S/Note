# Change 1.2.2: 定义核心数据模型（详细版）

**Change ID**: `define-core-schema`

**Goal**: 定义 Project、StoryboardVersion、Scene、Asset、GenerationJob、RenderJob、JobEvent、UsageRecord 等核心表

**Scope**:
- 包含: 8 个核心业务表的完整定义（字段、关系、索引、约束）
- 包含: 集成现有 better-auth 表（User、Session、Account、Verification）
- 不包含: 审计日志表（后续添加）

---

## 完整 Prisma Schema

基于 PRD 第 10 节和现有 better-auth schema：

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Better-auth 表（已存在）
// ============================================

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // 关系
  sessions      Session[]
  accounts      Account[]
  projects      Project[]
  assets        Asset[]
  generationJobs GenerationJob[]
  usageRecords  UsageRecord[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
```

// ============================================
// 业务核心表（新增）
// ============================================

// 项目表
model Project {
  id                          String    @id @default(cuid())
  userId                      String
  title                       String
  sourceText                  String    @db.Text
  status                      String    // draft/queued/generating_storyboard/storyboard_ready/generating_audio/calculating_timeline/rendering/completed/failed/cancelled
  audienceRole                String    // student/teacher
  audienceLevel               String?
  aspectRatio                 String    // 16:9, 9:16, 1:1
  targetDurationSec           Int
  voiceProvider               String
  voiceId                     String
  currentStoryboardVersionId  String?
  finalVideoAssetId           String?
  thumbnailAssetId            String?
  errorCode                   String?
  errorMessage                String?
  createdAt                   DateTime  @default(now())
  updatedAt                   DateTime  @updatedAt

  // 关系
  user                User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  storyboardVersions  StoryboardVersion[]
  scenes              Scene[]
  assets              Asset[]
  generationJobs      GenerationJob[]
  renderJobs          RenderJob[]
  jobEvents           JobEvent[]

  @@index([userId, createdAt])
  @@index([status])
  @@map("project")
}

// 分镜版本表
model StoryboardVersion {
  id                String   @id @default(cuid())
  projectId         String
  version           Int
  schemaVersion     String
  status            String   // draft/valid/rendered
  storyboardJson    Json
  storyboardAssetId String?
  totalFrames       Int?
  totalDurationMs   Int?
  contentHash       String
  createdAt         DateTime @default(now())

  // 关系
  project           Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  scenes            Scene[]
  renderJobs        RenderJob[]

  @@unique([projectId, version])
  @@index([projectId, createdAt])
  @@map("storyboard_version")
}

// Scene 表
model Scene {
  id                   String   @id @default(cuid())
  projectId            String
  storyboardVersionId  String
  sceneKey             String
  order                Int
  type                 String   // title/concept/bullet_list/process/comparison/timeline/summary
  title                String?
  voiceoverText        String   @db.Text
  visualJson           Json
  animationJson        Json
  audioAssetId         String?
  durationMs           Int?
  startFrame           Int?
  durationFrames       Int?
  captionsJson         Json?
  createdAt            DateTime @default(now())

  // 关系
  project              Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  storyboardVersion    StoryboardVersion @relation(fields: [storyboardVersionId], references: [id], onDelete: Cascade)

  @@unique([storyboardVersionId, sceneKey])
  @@unique([storyboardVersionId, order])
  @@index([projectId])
  @@map("scene")
}

// 资产表
model Asset {
  id          String   @id @default(cuid())
  userId      String
  projectId   String?
  type        String   // source_text/audio/caption/image/thumbnail/video/storyboard_json
  provider    String   // r2
  bucket      String
  key         String   @unique
  url         String?
  contentType String
  sizeBytes   Int?
  durationMs  Int?
  width       Int?
  height      Int?
  checksum    String?
  metadata    Json?
  createdAt   DateTime @default(now())

  // 关系
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  @@index([userId, type])
  @@index([projectId, type])
  @@index([checksum])
  @@map("asset")
}

// 生成任务表
model GenerationJob {
  id              String    @id @default(cuid())
  projectId       String
  userId          String
  status          String    // pending/running/succeeded/failed/retrying/cancelled
  currentStep     String?
  inngestRunId    String?
  idempotencyKey  String    @unique
  attempt         Int       @default(1)
  errorCode       String?
  errorMessage    String?
  startedAt       DateTime?
  finishedAt      DateTime?
  createdAt       DateTime  @default(now())

  // 关系
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobEvents       JobEvent[]

  @@index([projectId, status])
  @@index([userId])
  @@map("generation_job")
}

// 渲染任务表
model RenderJob {
  id                  String    @id @default(cuid())
  projectId           String
  storyboardVersionId String
  status              String    // queued/rendering/uploading/succeeded/failed
  renderConfigHash    String
  outputAssetId       String?
  thumbnailAssetId    String?
  workerId            String?
  attempt             Int       @default(1)
  errorCode           String?
  errorMessage        String?
  startedAt           DateTime?
  finishedAt          DateTime?
  createdAt           DateTime  @default(now())

  // 关系
  project             Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  storyboardVersion   StoryboardVersion @relation(fields: [storyboardVersionId], references: [id], onDelete: Cascade)
  jobEvents           JobEvent[]

  @@unique([storyboardVersionId, renderConfigHash])
  @@index([projectId])
  @@map("render_job")
}

// 任务事件日志表
model JobEvent {
  id              String   @id @default(cuid())
  projectId       String
  jobId           String
  jobType         String   // generation/render
  level           String   // info/warn/error
  event           String
  message         String?
  metadata        Json?
  createdAt       DateTime @default(now())

  // 关系
  project         Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  generationJob   GenerationJob? @relation(fields: [jobId], references: [id], onDelete: Cascade)
  renderJob       RenderJob?     @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([jobId])
  @@index([createdAt])
  @@map("job_event")
}

// 用量记录表
model UsageRecord {
  id           String   @id @default(cuid())
  userId       String
  projectId    String?
  provider     String   // llm/tts/remotion/r2
  metric       String   // tokens/chars/render_ms/bytes
  quantity     Int
  unit         String   // token/char/ms/byte
  costEstimate Decimal? @db.Decimal(10, 4)
  metadata     Json?
  createdAt    DateTime @default(now())

  // 关系
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([projectId])
  @@map("usage_record")
}
```

---

## 实施步骤

### 1. 更新 schema.prisma
将上述完整 schema 复制到 `prisma/schema.prisma`

### 2. 创建迁移
```bash
npx prisma migrate dev --name init_core_tables
```

### 3. 生成 Prisma Client
```bash
npx prisma generate
```

### 4. 验证表结构
```bash
npx prisma studio
```

---

## 关键设计说明

### 索引策略
- **高频查询字段**: userId, projectId, status, createdAt
- **唯一约束**: email, token, key, idempotencyKey
- **复合索引**: `[userId, createdAt]` 用于用户项目列表排序

### 关系说明
- **User → Project**: 一对多，用户可以有多个项目
- **Project → StoryboardVersion**: 一对多，项目有多个分镜版本
- **StoryboardVersion → Scene**: 一对多，分镜版本包含多个场景
- **Project → Asset**: 一对多，项目有多个资产
- **Project → GenerationJob**: 一对多，项目有多个生成任务
- **Project → RenderJob**: 一对多，项目有多个渲染任务

### 删除策略
- **Cascade**: User 删除时级联删除所有关联数据
- **SetNull**: Project 删除时 Asset.projectId 设为 null（保留孤儿文件）

---

## Acceptance Criteria

- Given Prisma schema 已更新
- When 执行 `npx prisma migrate dev`
- Then 所有 12 个表创建成功（4 个 auth + 8 个业务）
- Then 所有索引和约束生效
- Then 运行 `npx prisma studio` 可以看到所有表
- Then TypeScript 类型自动生成在 `src/generated/prisma`

**Estimated Size**: M
**Estimated LOC**: 800
**Priority**: P0

