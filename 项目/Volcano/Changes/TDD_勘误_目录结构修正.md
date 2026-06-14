# TDD 勘误 - 目录结构修正

## 📋 勘误信息

- **文档**：`TDD_AI文本转PPT微课视频平台.md` v1.0.0
- **章节**：第 11-15 章（一致性设计、安全设计、可观测性设计、部署架构、非功能需求）
- **勘误日期**：2026-06-14
- **发现人**：用户反馈

---

## ❌ 错误内容

在第 11-15 章的代码示例中，使用了 **Monorepo Turborepo 结构**：

```
apps/web/server/api/routers/
apps/web/server/services/
apps/web/server/inngest/
apps/web/lib/
```

---

## ✅ 正确内容

实际项目是 **Next.js 全栈标准结构**，应使用：

```
src/server/api/routers/
src/server/services/
src/server/inngest/
src/lib/
```

---

## 📝 需要修正的代码示例位置

### 第 11 章：一致性设计

**错误路径**：
- `apps/web/server/api/routers/project.router.ts`
- `apps/web/server/inngest/functions/generate-storyboard.ts`
- `apps/web/server/inngest/functions/generate-audio.ts`
- `apps/web/server/inngest/functions/trigger-render.ts`
- `apps/web/server/init/outbox-publisher.ts`

**正确路径**：
- `src/server/api/routers/project.router.ts`
- `src/server/inngest/functions/generate-storyboard.ts`
- `src/server/inngest/functions/generate-audio.ts`
- `src/server/inngest/functions/trigger-render.ts`
- `src/server/init/outbox-publisher.ts`

---

### 第 12 章：安全设计

**错误路径**：
- `apps/web/server/api/trpc.ts`
- `apps/web/server/api/routers/project.router.ts`
- `apps/web/server/api/middleware/rate-limit.ts`
- `apps/web/lib/auth.ts`
- `apps/web/next.config.js`
- `apps/web/lib/crypto.ts`
- `apps/web/server/api/middleware/audit-log.ts`

**正确路径**：
- `src/server/api/trpc.ts`
- `src/server/api/routers/project.router.ts`
- `src/server/api/middleware/rate-limit.ts`
- `src/lib/auth.ts`
- `next.config.js`（根目录）
- `src/lib/crypto.ts`
- `src/server/api/middleware/audit-log.ts`

---

### 第 13 章：可观测性设计

**错误路径**：
- `apps/web/lib/logger.ts`
- `apps/web/lib/metrics.ts`
- `apps/web/app/api/metrics/route.ts`
- `apps/web/lib/tracing.ts`

**正确路径**：
- `src/lib/logger.ts`
- `src/lib/metrics.ts`
- `src/app/api/metrics/route.ts`
- `src/lib/tracing.ts`

---

## 🔧 修正建议

### 对于开发团队

在实际开发时，请将所有代码示例中的路径替换为 Next.js 标准结构：

| 错误前缀 | 正确前缀 |
|---------|---------|
| `apps/web/server/` | `src/server/` |
| `apps/web/lib/` | `src/lib/` |
| `apps/web/app/` | `src/app/` |
| `apps/web/next.config.js` | `next.config.js`（根目录） |

### 项目结构示意

**Next.js 全栈标准结构**（实际项目）：

```
volcano/
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── (dashboard)/
│   │   └── api/
│   │       ├── trpc/[trpc]/      # tRPC API 路由
│   │       └── metrics/route.ts  # Prometheus 指标端点
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/          # tRPC routers
│   │   │   ├── trpc.ts           # tRPC 配置
│   │   │   └── middleware/       # tRPC 中间件
│   │   ├── services/             # 业务逻辑层
│   │   ├── inngest/              # Inngest 任务函数
│   │   ├── providers/            # Provider 适配器
│   │   └── init/                 # 初始化脚本
│   ├── lib/                      # 工具函数
│   │   ├── auth.ts
│   │   ├── crypto.ts
│   │   ├── logger.ts
│   │   ├── metrics.ts
│   │   └── tracing.ts
│   └── components/               # React 组件
├── prisma/
│   └── schema.prisma
├── next.config.js
├── package.json
└── tsconfig.json
```

**Monorepo Turborepo 结构**（PRD 中描述，但实际未采用）：

```
volcano/
├── apps/
│   ├── web/                      # Next.js 应用
│   │   ├── app/
│   │   ├── server/
│   │   └── lib/
│   └── render-worker/            # Remotion Worker
├── packages/
│   ├── storyboard/
│   └── remotion-video/
└── turbo.json
```

---

## 📌 关键说明

1. **PRD 和 Remotion 补充规格说明书中描述的是理想的 Monorepo 结构**，用于多应用、多包管理。

2. **实际项目采用 Next.js 单应用全栈结构**，更适合第一版 MVP 开发。

3. **TDD 第 11-15 章中的代码示例路径需要根据实际项目结构调整**。

4. **核心逻辑和设计思路不变**，仅路径需要修正。

---

## ✅ 后续行动

- [ ] 将此勘误文档同步给开发团队
- [ ] 在实际开发中使用正确的 `src/` 路径
- [ ] 如后续升级为 Monorepo，可参考 PRD 中的 `apps/web/` 结构

---

**勘误人**：Tech Lead  
**确认人**：用户反馈  
**状态**：已记录，待实施时注意
