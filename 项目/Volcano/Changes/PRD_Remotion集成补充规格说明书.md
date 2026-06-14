## Volcano AI 微课视频平台 — Remotion 集成补充规格说明书

## 文档信息

| 项目 | 内容 |
| -- | -- |
| 文档名称 | Remotion 集成补充规格说明书 |
| 关联 PRD | PRD_AI文本转PPT微课视频平台.md v1.0.6 |
| 版本 | v1.0.0 |
| 创建时间 | 2026-06-13 |
| 状态 | Draft |
| 说明 | 本文档是对主 PRD 中 Remotion 相关章节的全面深化补充，所有内容必须与主 PRD 保持一致，如有冲突以本文档为准（本文档为 Remotion 集成的权威规格） |

---

## 1. Remotion 项目架构与代码组织

### 1.1 Monorepo 包结构（详细）

```
volcano/
├── apps/
│   ├── web/                          # Next.js App Router 全栈应用
│   │   ├── app/
│   │   │   ├── (dashboard)/          # Dashboard、Create、Progress、Preview、Result 页面
│   │   │   └── api/
│   │   │       └── trpc/[trpc]/      # tRPC API 路由
│   │   ├── server/
│   │   │   ├── api/routers/          # tRPC routers
│   │   │   ├── services/             # 业务逻辑层
│   │   │   │   ├── storyboard.service.ts
│   │   │   │   ├── tts.service.ts
│   │   │   │   ├── timeline.service.ts
│   │   │   │   ├── render.service.ts
│   │   │   │   └── asset.service.ts
│   │   │   ├── inngest/
│   │   │   │   └── functions/        # Inngest step functions
│   │   │   │       ├── generate-storyboard.ts
│   │   │   │       ├── generate-audio.ts
│   │   │   │       ├── calculate-timeline.ts
│   │   │   │       └── trigger-render.ts
│   │   │   └── providers/            # Provider 适配器实例化
│   │   └── remotion-preview/         # Remotion Studio 预览入口（开发时用）
│   │       └── Root.tsx              # registerRoot() 注册所有 Composition
│   │
│   └── render-worker/                # Remotion 渲染 Worker 独立进程
│       ├── src/
│       │   ├── index.ts              # Worker 入口：HTTP server + renderMedia 调用
│       │   ├── server.ts             # Express/Fastify HTTP server，接收 /internal/render 请求
│       │   ├── renderer.ts           # 核心渲染逻辑：bundle + getCompositions + renderMedia
│       │   ├── bundle-cache.ts       # Webpack bundle 缓存管理
│       │   ├── font-loader.ts        # 启动时预加载中文字体
│       │   ├── resource-cleaner.ts   # 渲染完成后清理临时文件
│       │   ├── health.ts             # 健康检查端点 /health
│       │   └── config.ts             # Worker 配置：并发数、超时、端口、chromium 路径
│       ├── Dockerfile                # Worker Docker 镜像
│       ├── fonts/                    # 中文字体文件目录
│       │   ├── NotoSansSC-Regular.otf
│       │   ├── NotoSansSC-Bold.otf
│       │   └── NotoSansSC-Light.otf
│       └── package.json
│
├── packages/
│   ├── storyboard/                   # Storyboard 协议层（LLM ↔ TTS ↔ Remotion ↔ 前端 的公共语言）
│   │   ├── src/
│   │   │   ├── types.ts              # Storyboard、Scene、VisualBlock、AnimationPreset 等类型定义
│   │   │   ├── schema.ts             # Zod Schema（校验 + 生成 JSON Schema 给 LLM function calling）
│   │   │   ├── timeline.ts           # timeline 计算器：duration → frames，buffer 叠加
│   │   │   ├── validation.ts         # Storyboard 业务校验（scene 数量、type 合法性等）
│   │   │   ├── defaults.ts           # 默认 buffer、fps 等常量
│   │   │   └── examples/             # Storyboard JSON 示例（供 LLM prompt 使用）
│   │   └── package.json
│   │
│   ├── remotion-video/               # Remotion 视频模板、组件、动效（Remotion package）
│   │   ├── src/
│   │   │   ├── Root.tsx              # Remotion Root：注册所有 Composition + calculateMetadata
│   │   │   ├── compositions/
│   │   │   │   ├── MicroCourseVideo.tsx  # 微课视频主 Composition：编排 scene 序列与字幕
│   │   │   │   └── ScenePreview.tsx      # 分镜静态预览 Composition（前端预览用）
│   │   │   ├── templates/            # 6-8 个 PPT 微课模板
│   │   │   │   ├── registry.ts       # 模板注册表：scene type → template component 映射
│   │   │   │   ├── TitleSlide.tsx    # 标题页模板
│   │   │   │   ├── ConceptCard.tsx   # 概念卡片模板
│   │   │   │   ├── BulletList.tsx    # 要点列表模板
│   │   │   │   ├── ProcessFlow.tsx   # 流程图模板
│   │   │   │   ├── Comparison.tsx    # 对比模板
│   │   │   │   ├── Timeline.tsx      # 时间线模板
│   │   │   │   ├── Summary.tsx       # 总结页模板
│   │   │   │   └── EndingSlide.tsx   # 结束页模板
│   │   │   ├── components/           # 可复用视觉组件
│   │   │   │   ├── CaptionOverlay.tsx    # 字幕叠加层
│   │   │   │   ├── WordHighlight.tsx     # 词级高亮（预留）
│   │   │   │   ├── ProgressBar.tsx       # 底部进度条
│   │   │   │   ├── LogoWatermark.tsx     # 水印 Logo
│   │   │   │   ├── SlideBackground.tsx   # 统一背景
│   │   │   │   └── AudioController.tsx   # 音频播放控制
│   │   │   ├── animations/           # 动效预设库
│   │   │   │   ├── presets.ts        # 动效预设注册表
│   │   │   │   ├── fadeIn.ts         # 淡入
│   │   │   │   ├── slideUp.ts        # 从下方滑入
│   │   │   │   ├── slideLeft.ts      # 从左滑入
│   │   │   │   ├── scaleIn.ts        # 缩放入场
│   │   │   │   ├── typewriter.ts     # 打字机效果
│   │   │   │   ├── stepReveal.ts     # 逐步揭示（列表项逐个显示）
│   │   │   │   ├── highlight.ts      # 高亮强调
│   │   │   │   └── wipeReveal.ts     # 擦除揭示
│   │   │   ├── hooks/
│   │   │   │   ├── useSceneTiming.ts     # 根据 scene 的 startFrame/durationFrames 计算动画时序
│   │   │   │   ├── useAudioSync.ts       # 音频同步 hook
│   │   │   │   └── useCaptionDisplay.ts  # 字幕显示 hook（当前句子匹配）
│   │   │   ├── styles/
│   │   │   │   ├── theme.ts          # 主题色板、字体大小、间距常量
│   │   │   │   └── global.css        # 全局样式（非动画样式）
│   │   │   └── utils/
│   │   │       ├── frame-utils.ts    # 帧计算工具
│   │   │       ├── text-layout.ts    # 文本排版工具（中文换行、字数限制）
│   │   │       └── color-utils.ts    # 颜色工具
│   │   └── package.json              # 依赖 remotion、@remotion/media、@remotion/captions 等
│   │
│   ├── providers/                    # Provider 抽象与适配器
│   │   ├── src/
│   │   │   ├── interfaces/           # 接口定义（已在主 PRD 定义）
│   │   │   ├── llm/
│   │   │   │   ├── openai-compatible.ts  # OpenAI-compatible adapter（含 DeepSeek）
│   │   │   │   └── mock.ts           # Mock provider for testing
│   │   │   ├── tts/
│   │   │   │   ├── minimax.ts        # MiniMax TTS adapter
│   │   │   │   └── mock.ts
│   │   │   ├── storage/
│   │   │   │   ├── cloudflare-r2.ts
│   │   │   │   └── mock.ts
│   │   │   └── render/
│   │   │       ├── remotion-worker.ts    # Render Provider：调用 render-worker HTTP API
│   │   │       └── mock.ts
│   │   └── package.json
│   │
│   ├── db/                           # Prisma schema + 数据库访问层
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── client.ts             # Prisma client 单例
│   │       └── repositories/         # 数据访问仓库（按实体拆分）
│   │           ├── project.repo.ts
│   │           ├── storyboard.repo.ts
│   │           ├── scene.repo.ts
│   │           ├── asset.repo.ts
│   │           ├── generation-job.repo.ts
│   │           ├── render-job.repo.ts
│   │           ├── job-event.repo.ts
│   │           └── usage-record.repo.ts
│   │
│   └── shared/                       # 通用类型、错误码、常量
│       ├── src/
│       │   ├── error-codes.ts        # 平台错误码枚举（USER_INPUT_* / LLM_* / TTS_* / RENDER_* 等）
│       │   ├── constants.ts          # fps、比例尺寸、buffer 等常量
│       │   ├── types.ts              # 跨包共享类型
│       │   └── analytics.ts          # 埋点事件常量
│       └── package.json
│
├── package.json                      # workspace root (pnpm workspaces / turborepo)
├── turbo.json                        # Turborepo 任务编排
└── pnpm-workspace.yaml
```

### 1.2 包依赖关系（严格单向）

```
shared (无内部依赖)
  ↑
db (依赖 shared)
  ↑
storyboard (依赖 shared)
  ↑
providers (依赖 shared, storyboard, db)
  ↑
remotion-video (依赖 shared, storyboard)     ← 不依赖 db/providers，保持纯 Remotion
  ↑
apps/web (依赖 shared, storyboard, db, providers, remotion-video[仅预览])
apps/render-worker (依赖 shared, storyboard, remotion-video, providers[storage])
```

### 1.3 边界规则

| 规则编号 | 规则描述 | 违反后果 |
| -- | -- | -- |
| B-001 | `packages/remotion-video` 不得依赖 `packages/db`、`packages/providers` | 破坏 Remotion bundle 的独立性，导致 Worker 无法独立 bundle |
| B-002 | `packages/remotion-video` 不得包含任何服务端渲染逻辑（如 `renderMedia` 调用） | 模板代码被引入 Web 前端时导致构建错误 |
| B-003 | `apps/render-worker` 是唯一允许调用 `@remotion/renderer` 中 `bundle()`、`renderMedia()`、`getCompositions()` 的模块 | 渲染逻辑分散导致并发控制和资源管理失控 |
| B-004 | `apps/web` 只允许引用 `remotion-video` 中的类型定义，不得引用其组件（除非是 Remotion Studio 预览模式） | 将 Remotion 组件打包进 Next.js 客户端 bundle 导致包体积膨胀 |
| B-005 | Storyboard JSON 是 LLM 输出的唯一格式，LLM 不得生成 Remotion/React/JSX 代码 | 安全风险：注入可执行代码 |
| B-006 | 新增模板必须在 `templates/registry.ts` 中注册，并同步更新 `packages/storyboard` 中的 `sceneType` 枚举 | 导致 Storyboard 校验失败或渲染时模板查找失败 |

---

## 2. Remotion 模板体系详细设计

### 2.1 模板注册表

```ts
// packages/remotion-video/src/templates/registry.ts

import type { FC } from "react";
import type { SceneVisual, AnimationPreset } from "@volcano/storyboard";
import { TitleSlide } from "./TitleSlide";
import { ConceptCard } from "./ConceptCard";
import { BulletList } from "./BulletList";
import { ProcessFlow } from "./ProcessFlow";
import { Comparison } from "./Comparison";
import { Timeline } from "./Timeline";
import { Summary } from "./Summary";
import { EndingSlide } from "./EndingSlide";

export interface TemplateComponentProps {
  /** 当前 scene 的视觉数据 */
  visual: SceneVisual;
  /** 当前 scene 在本 composition 中的起始帧（全局帧） */
  startFrame: number;
  /** 当前 scene 的持续帧数 */
  durationFrames: number;
  /** 视频比例 */
  aspectRatio: "16:9" | "9:16" | "1:1";
  /** 动画预设键（从 Storyboard animationJson 解析） */
  animationKey?: string;
  /** 字幕数据（整段 scene 的 captions） */
  captions?: CaptionSegment[];
  /** 模板自定义样式覆盖 */
  styleOverrides?: Record<string, unknown>;
}

export type TemplateComponent = FC<TemplateComponentProps>;

/** scene type → 模板组件映射 */
export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  title: TitleSlide,
  concept: ConceptCard,
  bullet_list: BulletList,
  process: ProcessFlow,
  comparison: Comparison,
  timeline: Timeline,
  summary: Summary,
  ending: EndingSlide,
};

/** 获取模板组件，不存在时回退到 concept 模板 */
export function getTemplateComponent(sceneType: string): TemplateComponent {
  return TEMPLATE_REGISTRY[sceneType] ?? TEMPLATE_REGISTRY.concept;
}

/** 检查模板是否存在 */
export function hasTemplate(sceneType: string): boolean {
  return sceneType in TEMPLATE_REGISTRY;
}
```

### 2.2 模板详细规格

#### 2.2.1 TitleSlide（标题页）

| 属性 | 规格 |
| -- | -- |
| scene type | `title` |
| 适用位置 | 视频第一个 scene |
| 布局结构 | 居中布局：顶部装饰线 + 主标题（1-2 行） + 副标题/来源（可选） + 底部微课标识 |
| 主标题字号 | 48-64px（16:9），36-48px（9:16），40-52px（1:1） |
| 副标题字号 | 24-32px |
| 背景 | 渐变色背景，色值来自 visual.backgroundColor |
| 入场动效 | 装饰线从左滑入（0.3s）→ 主标题淡入+上移（0.5s，easeOutCubic）→ 副标题淡入（0.3s，延迟 0.2s） |
| 视觉元素 | visual.title（主标题）、visual.subtitle（副标题）、visual.source（来源文本） |
| 动画预设 | `title-reveal` |
| 字体 | 主标题 Bold，副标题 Regular |

**边界条件：**
- 主标题超过 20 字时自动缩小字号至 36px
- 副标题为空时隐藏，不保留占位空间
- 视频比例为 9:16 时，标题最大宽度为容器宽度的 85%

#### 2.2.2 ConceptCard（概念卡片）

| 属性 | 规格 |
| -- | -- |
| scene type | `concept` |
| 适用位置 | 核心知识点解释 |
| 布局结构 | 上方概念名称标签 + 中央核心解释（1-3 句） + 下方关键词标签（最多 3 个） |
| 核心解释字号 | 28-36px |
| 背景 | 纯色背景 + 左侧彩色竖线装饰（6px 宽） |
| 入场动效 | 竖线从上向下绘制（0.3s）→ 概念名淡入（0.2s）→ 核心解释逐步显示（打字机效果，按句子节奏）→ 关键词标签逐个 scaleIn（每个 0.2s，间隔 0.15s） |
| 视觉元素 | visual.conceptName、visual.explanation、visual.keywords[]、visual.icon（emoji 或 SVG 名称） |
| 动画预设 | `concept-reveal` |
| 字体 | 概念名 Bold，解释 Regular |

**边界条件：**
- 解释文本超过 80 字时分两段显示，间隔 0.3s
- 关键词超过 3 个时仅显示前 3 个，其余截断
- 关键词单个超过 6 字时截断并加省略号

#### 2.2.3 BulletList（要点列表）

| 属性 | 规格 |
| -- | -- |
| scene type | `bullet_list` |
| 适用位置 | 要点罗列、步骤说明、特征列举 |
| 布局结构 | 顶部标题（可选）+ N 个列表项（每项：前缀图标 + 文本） |
| 列表项字号 | 24-30px |
| 项间距 | 16-24px |
| 背景 | 浅色背景 + 微弱网格纹理 |
| 入场动效 | 标题淡入（0.3s）→ 列表项逐条从左侧滑入（每项 0.3s，间隔 0.25s）。列表项超过 5 条时分页显示（每页 4-5 条） |
| 视觉元素 | visual.title、visual.items[]（每项含 icon、text） |
| 动画预设 | `step-reveal` |
| 列表项前缀图标 | visual.items[].icon（可选："number"数字序号、"bullet"圆点、"check"对勾、"arrow"箭头、"star"星号） |

**边界条件：**
- 列表项为 0 时渲染空状态占位（系统异常，应在前置校验拦截）
- 列表项文本单行超过 40 字时自动换行，行高 1.5
- 9:16 比例下每页最多 4 条；16:9 下每页最多 6 条
- 超过单页容量时自动创建分页，每页额外增加 0.5s 过渡

#### 2.2.4 ProcessFlow（流程图）

| 属性 | 规格 |
| -- | -- |
| scene type | `process` |
| 适用位置 | 流程步骤、因果关系链、操作指南 |
| 布局结构 | 横向/纵向步骤流程：步骤节点（圆形/圆角矩形） + 连接箭头 + 步骤说明文字 |
| 节点大小 | 圆形直径 80-100px，矩形 140×60px |
| 说明字号 | 18-22px（节点下方） |
| 背景 | 浅色背景 |
| 入场动效 | 第一个节点出现（scaleIn 0.3s）→ 箭头绘制（从左向右擦除，0.2s）→ 第二个节点出现（0.3s）... 循环。全部显示后暂停 0.5s 再进入后续动效 |
| 视觉元素 | visual.steps[]（每项含 label、description、icon），visual.direction（"horizontal"/"vertical"） |
| 动画预设 | `process-reveal` |
| 步骤节点样式 | visual.steps[].icon（emoji 或 SVG），visual.steps[].color（可选，节点背景色） |

**边界条件：**
- 横向步骤超过 4 个时自动切换为纵向布局
- 9:16 比例下始终使用纵向布局
- 步骤数 = 0 或 = 1 时回退到 concept 模板
- 步骤 label 超过 8 字时缩小节点内字号至 14px

#### 2.2.5 Comparison（对比模板）

| 属性 | 规格 |
| -- | -- |
| scene type | `comparison` |
| 适用位置 | 两者对比（优劣、前后、A vs B） |
| 布局结构 | 左右两栏（16:9）或上下两栏（9:16），中间分割线。每栏：标题 + N 个描述点 |
| 栏标题字号 | 28-32px |
| 描述字号 | 20-24px |
| 背景 | 左栏浅蓝背景、右栏浅橙背景（可配置），中间 2px 分割线 |
| 入场动效 | 左栏标题+背景从左滑入（0.4s）→ 右栏标题+背景从右滑入（0.4s）→ 左栏描述点逐步显示（stepReveal）→ 右栏描述点逐步显示（stepReveal） |
| 视觉元素 | visual.left（含 title、points[]）、visual.right（含 title、points[]） |
| 动画预设 | `comparison-reveal` |

**边界条件：**
- 其中一栏无内容时，该栏不渲染，另一栏居中
- 单栏 points 超过 4 条时缩小字号至 18px
- 1:1 比例下仍用左右布局，但字号整体缩小 10%

#### 2.2.6 Timeline（时间线模板）

| 属性 | 规格 |
| -- | -- |
| scene type | `timeline` |
| 适用位置 | 历史事件、步骤时间线、发展历程 |
| 布局结构 | 垂直时间线：左侧时间节点（圆点 + 日期/标签） + 右侧事件描述 |
| 日期字号 | 18-20px |
| 描述字号 | 22-26px |
| 背景 | 浅色背景 + 左侧垂直引导线（2px） |
| 入场动效 | 引导线从上向下绘制（0.30s）→ 事件节点逐个 fadeIn + slideLeft（每项 0.35s，间隔 0.3s） |
| 视觉元素 | visual.events[]（每项含 date、title、description） |
| 动画预设 | `timeline-reveal` |

**边界条件：**
- 事件超过 5 个时缩小描述字号至 20px
- 事件描述单条超过 60 字时只显示前 60 字 + "..."
- 事件数为 0 时回退到 concept 模板

#### 2.2.7 Summary（总结页）

| 属性 | 规格 |
| -- | -- |
| scene type | `summary` |
| 适用位置 | 视频倒数第二个 scene（结束页之前） |
| 布局结构 | 顶部 "总结" 标签 + 3-5 个核心要点卡片（每卡片：关键词 + 一句话解释） |
| 卡片布局 | 2 列网格（16:9）、单列（9:16）、2 列（1:1） |
| 关键词字号 | 24-28px Bold |
| 解释字号 | 18-20px |
| 背景 | 纯色背景 |
| 入场动效 | 顶部标签淡入（0.3s）→ 卡片逐个 scaleIn（每卡片 0.3s，间隔 0.2s）→ 所有卡片显示后底部高亮线从左到右（0.5s） |
| 视觉元素 | visual.points[]（每项含 keyword、description） |
| 动画预设 | `summary-reveal` |

**边界条件：**
- 要点少于 3 个时单列居中显示
- 要点超过 5 个时分两页
- 解释文字单条超过 40 字时缩小至 16px

#### 2.2.8 EndingSlide（结束页）

| 属性 | 规格 |
| -- | -- |
| scene type | `ending` |
| 适用位置 | 视频最后一个 scene（始终存在，即使 Storyboard 未显式包含） |
| 布局结构 | 居中：感谢文字 + 平台 Logo + 重新观看提示 |
| 主文字号 | 36-48px |
| 背景 | 品牌色背景（渐变） |
| 入场动效 | 感谢文字 fadeIn + scaleIn（0.6s）→ Logo fadeIn（0.4s，延迟 0.3s） |
| 视觉元素 | 无（模板内置固定内容，不从 Storyboard 读取） |
| 动画预设 | `ending-reveal` |
| 时长 | 固定 3 秒（90 帧 @30fps），不计入 scene 音频时长 |

**边界条件：**
- EndingSlide 始终作为最后一个 scene 被注入，其视觉内容不依赖 Storyboard 数据
- EndingSlide 无对应音频，durationFrames 固定为 90
- 若 Storyboard 最后一个 scene 已为 ending 类型，不再重复注入

### 2.3 动效预设库

所有动效必须使用 Remotion 原生 API（`useCurrentFrame`、`interpolate`、`spring`、`Easing`）实现。禁止使用 CSS transitions、CSS animations、Tailwind animation 类。

```ts
// packages/remotion-video/src/animations/presets.ts

import type { SpringConfig } from "remotion";

export interface AnimationPresetConfig {
  name: string;
  /** 动效函数返回 animated style */
  type: "opacity" | "transform" | "spring" | "clip";
  /** 动效持续时间（帧数），0 表示自动根据 scene 时长计算 */
  durationFrames: number;
  /** spring 配置（仅 type=spring 时使用） */
  springConfig?: SpringConfig;
}

export const ANIMATION_PRESETS: Record<string, AnimationPresetConfig> = {
  "fade-in": {
    name: "淡入",
    type: "opacity",
    durationFrames: 15, // 0.5s @30fps
  },
  "slide-up": {
    name: "从下方滑入",
    type: "transform",
    durationFrames: 18,
  },
  "slide-left": {
    name: "从左滑入",
    type: "transform",
    durationFrames: 18,
  },
  "slide-right": {
    name: "从右滑入",
    type: "transform",
    durationFrames: 18,
  },
  "scale-in": {
    name: "缩放入场",
    type: "spring",
    durationFrames: 0, // spring 忽略此值
    springConfig: { damping: 12, mass: 0.8, stiffness: 100 },
  },
  "typewriter": {
    name: "打字机效果",
    type: "clip",
    durationFrames: 30,
  },
  "step-reveal": {
    name: "逐步揭示",
    type: "opacity",
    durationFrames: 9, // 每项 0.3s
  },
  "highlight": {
    name: "高亮闪烁",
    type: "opacity",
    durationFrames: 20,
  },
  "wipe-reveal": {
    name: "擦除揭示",
    type: "clip",
    durationFrames: 24,
  },
};
```

---

## 3. Remotion Composition 与 Storyboard 映射机制

### 3.1 核心 Composition：MicroCourseVideo

```tsx
// packages/remotion-video/src/compositions/MicroCourseVideo.tsx

import { AbsoluteFill, Sequence, useVideoConfig, Audio } from "remotion";
import type { Storyboard, CaptionSegment } from "@volcano/storyboard";
import { getTemplateComponent } from "../templates/registry";
import { CaptionOverlay } from "../components/CaptionOverlay";
import { SlideBackground } from "../components/SlideBackground";
import { EndingSlide } from "../templates/EndingSlide";

export interface MicroCourseVideoProps {
  /** 完整的 Storyboard 数据 */
  storyboard: Storyboard;
  /** 所有 scene 的音频签名 URL 映射：sceneKey → signedUrl */
  audioUrls: Record<string, string>;
  /** 品牌色（可选覆盖） */
  brandColor?: string;
  /** 是否显示水印 */
  showWatermark?: boolean;
}

export const MicroCourseVideo: React.FC<MicroCourseVideoProps> = ({
  storyboard,
  audioUrls,
  brandColor = "#3B82F6",
  showWatermark = true,
}) => {
  const { fps } = useVideoConfig();

  const scenes = [...storyboard.scenes].sort((a, b) => a.order - b.order);

  // 检查最后一个 scene 是否为 ending，不是则自动追加
  const hasEnding = scenes.length > 0 && scenes[scenes.length - 1].type === "ending";
  const allScenes = hasEnding ? scenes : [...scenes, ENDING_SCENE_PLACEHOLDER];

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {allScenes.map((scene, index) => {
        const TemplateComponent = getTemplateComponent(scene.type);
        const audioUrl = audioUrls[scene.sceneKey];

        return (
          <Sequence
            key={scene.sceneKey}
            from={scene.startFrame ?? 0}
            durationInFrames={scene.durationFrames ?? 90}
            premountFor={2 * fps} // 提前 2s 预挂载
          >
            {/* 背景层 */}
            <SlideBackground
              sceneType={scene.type}
              visual={scene.visualJson}
              brandColor={brandColor}
            />

            {/* 模板内容层 */}
            <TemplateComponent
              visual={scene.visualJson}
              startFrame={scene.startFrame ?? 0}
              durationFrames={scene.durationFrames ?? 90}
              aspectRatio={storyboard.aspectRatio}
              animationKey={scene.animationJson?.preset}
              captions={scene.captionsJson as CaptionSegment[] | undefined}
            />

            {/* 音频层 */}
            {audioUrl && (
              <Audio
                src={audioUrl}
                volume={1}
              />
            )}

            {/* 字幕叠加层 */}
            {scene.captionsJson && (scene.captionsJson as CaptionSegment[]).length > 0 && (
              <CaptionOverlay
                captions={scene.captionsJson as CaptionSegment[]}
                sceneStartFrame={scene.startFrame ?? 0}
                aspectRatio={storyboard.aspectRatio}
              />
            )}
          </Sequence>
        );
      })}

      {/* 全局 Logo 水印 */}
      {showWatermark && <LogoWatermark />}
    </AbsoluteFill>
  );
};
```

### 3.2 calculateMetadata：动态计算视频时长

```tsx
// packages/remotion-video/src/Root.tsx

import { Composition, CalculateMetadataFunction } from "remotion";
import type { Storyboard } from "@volcano/storyboard";
import { MicroCourseVideo, type MicroCourseVideoProps } from "./compositions/MicroCourseVideo";
import { getAudioDuration } from "@remotion/media-utils";

// 视频比例 → 分辨率映射
const RESOLUTION_MAP = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
} as const;

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<MicroCourseVideoProps> = async ({
  props,
  abortSignal,
}) => {
  const { storyboard, audioUrls } = props;
  const scenes = [...storyboard.scenes].sort((a, b) => a.order - b.order);

  // 计算总帧数：基于 storyboard 中已计算的 timeline
  const hasEnding = scenes.length > 0 && scenes[scenes.length - 1].type === "ending";
  const endingFrames = hasEnding ? 0 : 90; // 自动追加 ending 的帧数
  const totalFrames = (storyboard.totalFrames ?? 0) + endingFrames;

  const { width, height } = RESOLUTION_MAP[storyboard.aspectRatio];

  // 验证音频文件可访问（可选：通过 HEAD 请求检查 URL 有效性）
  const audioChecks = await Promise.allSettled(
    Object.entries(audioUrls).map(async ([sceneKey, url]) => {
      const response = await fetch(url, { method: "HEAD", signal: abortSignal });
      if (!response.ok) {
        console.warn(`Audio URL inaccessible for scene ${sceneKey}: HTTP ${response.status}`);
      }
    })
  );

  const inaccessibleScenes = audioChecks.filter(
    (r): r is PromiseRejectedResult => r.status === "rejected"
  );
  if (inaccessibleScenes.length > 0) {
    console.warn(`${inaccessibleScenes.length} audio URLs could not be verified`);
  }

  return {
    durationInFrames: totalFrames,
    width,
    height,
    fps: FPS,
    props,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MicroCourseVideo"
        component={MicroCourseVideo}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          storyboard: DEFAULT_STORYBOARD,
          audioUrls: {},
        }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ScenePreview"
        component={ScenePreview}
        fps={FPS}
        width={640}
        height={360}
        durationInFrames={1}
        defaultProps={{
          scene: DEFAULT_SCENE,
          aspectRatio: "16:9",
        }}
      />
    </>
  );
};

// 注册 Root
import { registerRoot } from "remotion";
registerRoot(RemotionRoot);
```

### 3.3 Storyboard → Composition Props 转换

该转换在 `apps/render-worker` 中执行，将数据库中的 Storyboard JSON 和 Asset URL 映射转换为 `MicroCourseVideoProps`：

```ts
// apps/render-worker/src/renderer.ts（转换逻辑）

import type { Storyboard } from "@volcano/storyboard";
import type { MicroCourseVideoProps } from "@volcano/remotion-video";

function buildCompositionProps(
  storyboard: Storyboard,
  audioAssets: Map<string, string>,   // sceneKey → signedUrl
  renderConfig: { brandColor?: string; showWatermark?: boolean }
): MicroCourseVideoProps {
  return {
    storyboard,
    audioUrls: Object.fromEntries(audioAssets),
    brandColor: renderConfig.brandColor,
    showWatermark: renderConfig.showWatermark ?? true,
  };
}
```

---

## 4. Remotion Worker 详细设计

### 4.1 Worker 架构

```
┌──────────────────────────────────────────────────────────────┐
│                    render-worker (Docker)                     │
│                                                               │
│  ┌─────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│  │ HTTP Server  │──▶│  Renderer Engine  │──▶│ Bundle Cache │  │
│  │ (Fastify)    │   │  (renderMedia)    │   │ (内存/磁盘)   │  │
│  │              │◀──│                   │◀──│              │  │
│  │ POST /render │   │  getCompositions   │   └──────────────┘  │
│  │ GET  /health │   │  renderMedia       │                     │
│  │ GET  /status │   │  renderStill       │   ┌──────────────┐  │
│  └─────────────┘   └──────────────────┘   │ Temp File Mgr │  │
│                                              │ (清理临时文件) │  │
│  ┌─────────────┐   ┌──────────────────┐   └──────────────┘  │
│  │ Font Loader │   │ Resource Monitor │                      │
│  │ (启动时加载) │   │ (CPU/内存/磁盘)  │                      │
│  └─────────────┘   └──────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Worker HTTP API 详细定义

#### 4.2.1 POST /internal/render

**Request：**

```json
{
  "renderJobId": "string (cuid)",
  "storyboard": { /* Storyboard JSON */ },
  "audioUrlMap": {
    "scene_001": "https://r2-signed-url/audio/scene_001.mp3?sign=...",
    "scene_002": "https://r2-signed-url/audio/scene_002.mp3?sign=..."
  },
  "outputKey": "string (R2 key，如 videos/proj_xxx/output.mp4)",
  "thumbnailKey": "string (R2 key，如 thumbnails/proj_xxx/thumb.png)",
  "callbackUrl": "string (可选，渲染完成后回调通知 web 服务)",
  "config": {
    "codec": "h264",
    "jpegQuality": 85,
    "crf": 23,
    "scale": 1,
    "brandColor": "#3B82F6",
    "showWatermark": true,
    "remotionTemplateVersion": "1.0.0"
  }
}
```

**Response (200)：**

```json
{
  "renderJobId": "string",
  "status": "succeeded",
  "videoAssetKey": "string (R2 key)",
  "thumbnailAssetKey": "string (R2 key)",
  "durationMs": 185000,
  "sizeBytes": 15728640,
  "slowestFrames": [
    { "frame": 450, "time": 1.2 },
    { "frame": 1200, "time": 0.9 }
  ]
}
```

**Response (4xx/5xx)：**

```json
{
  "renderJobId": "string",
  "status": "failed",
  "errorCode": "RENDER_CHROMIUM_LAUNCH_FAILED",
  "errorMessage": "Failed to launch Chromium: executable not found at /usr/bin/chromium",
  "errorStack": "..."
}
```

#### 4.2.2 GET /health

**Response (200)：**

```json
{
  "status": "healthy",
  "uptime": 3600,
  "activeRenders": 1,
  "maxConcurrency": 1,
  "remotionVersion": "4.0.476",
  "templateVersion": "1.0.0",
  "fonts": {
    "notoSansSC": "loaded",
    "notoSansSCBold": "loaded"
  },
  "diskFreeBytes": 10737418240,
  "memoryUsageMB": 512
}
```

#### 4.2.3 GET /status/:renderJobId

**Response (200)：**

```json
{
  "renderJobId": "string",
  "status": "rendering",
  "progress": 0.42,
  "renderedFrames": 1260,
  "totalFrames": 3000,
  "startedAt": "2026-06-13T10:00:00Z",
  "estimatedRemainingSec": 120
}
```

### 4.3 Worker 渲染核心流程

```
1. 接收 HTTP 请求
2. 校验内部 token（Authorization: Bearer <INTERNAL_TOKEN>）
3. 校验并发限制（当前活跃渲染数 < maxConcurrency）
4. 创建 renderJobId 对应的临时工作目录
5. 调用 bundle(remotionVideoEntryPoint) 生成 Webpack bundle
   └── 检查 bundle 缓存：若 remotion-video 包未变更且距离上次 bundle < 1h，复用缓存
6. 调用 getCompositions(bundleUrl) 获取 Composition 列表
7. 调用 selectComposition("MicroCourseVideo") 获取 composition 对象
8. 构建 inputProps = buildCompositionProps(storyboard, audioUrlMap, config)
9. 调用 renderMedia({
     serveUrl: bundleUrl,
     composition,
     codec: config.codec ?? "h264",
     outputLocation: tmpOutputPath,
     inputProps,
     jpegQuality: config.jpegQuality ?? 85,
     scale: config.scale ?? 1,
     crf: config.crf ?? 23,
     concurrency: 1,
     disallowParallelEncoding: true,  // 内存受限环境
     timeoutInMilliseconds: 600_000,  // 10 分钟超时
     onProgress: ({ progress, renderedFrames, encodedFrames }) => {
       updateJobProgress(renderJobId, progress, renderedFrames);
     },
     onStart: ({ frameCount }) => {
       logJobStart(renderJobId, frameCount);
     },
     logLevel: "info",
   })
10. 渲染完成，获得 output buffer（或文件路径）
11. 调用 renderStill() 生成缩略图（取第 30 帧）
12. 通过 Storage Provider 上传 MP4 和缩略图到 R2
13. 清理临时文件
14. 若 callbackUrl 存在，POST 回调通知 web 服务
15. 返回成功响应
```

### 4.4 Worker 配置常量

```ts
// apps/render-worker/src/config.ts

export const WORKER_CONFIG = {
  /** 监听端口 */
  port: parseInt(process.env.RENDER_WORKER_PORT ?? "3200"),
  /** 最大并发渲染数 */
  maxConcurrency: parseInt(process.env.RENDER_WORKER_MAX_CONCURRENCY ?? "1"),
  /** 单次渲染超时（ms） */
  renderTimeoutMs: parseInt(process.env.RENDER_WORKER_TIMEOUT_MS ?? "600000"),
  /** 内部 API token */
  internalToken: process.env.INTERNAL_API_TOKEN ?? "",
  /** remotion-video 包的入口文件路径（相对于 monorepo root） */
  remotionEntryPoint: process.env.REMOTION_ENTRY_POINT ?? "../../packages/remotion-video/src/Root.tsx",
  /** bundle 缓存有效期（ms） */
  bundleCacheTtlMs: parseInt(process.env.BUNDLE_CACHE_TTL_MS ?? "3600000"),
  /** Chromium 可执行文件路径 */
  browserExecutable: process.env.BROWSER_EXECUTABLE ?? "/usr/bin/chromium",
  /** 临时文件目录 */
  tempDir: process.env.RENDER_TEMP_DIR ?? "/tmp/remotion-renders",
  /** 字体目录 */
  fontsDir: process.env.RENDER_FONTS_DIR ?? "/app/fonts",
  /** 单帧超时（ms） */
  frameTimeoutMs: parseInt(process.env.FRAME_TIMEOUT_MS ?? "30000"),
  /** 健康检查间隔（ms） */
  healthCheckIntervalMs: 30000,
};
```

### 4.5 Worker Dockerfile

```dockerfile
# apps/render-worker/Dockerfile
FROM node:22-slim

# 安装 Chromium 依赖
RUN apt-get update && apt-get install -y \
  chromium \
  ffmpeg \
  fonts-noto-cjk \
  fonts-noto-cjk-extra \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# 设置 Chromium 路径
ENV BROWSER_EXECUTABLE=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 创建非 root 用户
RUN useradd -m -s /bin/bash remotion && \
    mkdir -p /tmp/remotion-renders && \
    chown -R remotion:remotion /tmp/remotion-renders

WORKDIR /app

# 复制 monorepo 必要部分
COPY --chown=remotion:remotion packages/remotion-video/package.json packages/remotion-video/
COPY --chown=remotion:remotion packages/storyboard/package.json packages/storyboard/
COPY --chown=remotion:remotion packages/shared/package.json packages/shared/
COPY --chown=remotion:remotion apps/render-worker/package.json apps/render-worker/
COPY --chown=remotion:remotion pnpm-workspace.yaml pnpm-lock.yaml ./

# 安装依赖
RUN corepack enable && pnpm install --frozen-lockfile --prod

# 复制源码
COPY --chown=remotion:remotion packages/ packages/
COPY --chown=remotion:remotion apps/render-worker/ apps/render-worker/

# 复制字体文件
COPY --chown=remotion:remotion apps/render-worker/fonts/ /app/fonts/

USER remotion

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3200/health || exit 1

CMD ["node", "--max-old-space-size=4096", "apps/render-worker/dist/index.js"]
```

### 4.6 Worker 健康检查与自愈

| 检查项 | 检查方式 | 不健康阈值 | 自愈动作 |
| -- | -- | -- | -- |
| HTTP 服务可用 | GET /health 返回 200 | 连续 3 次失败 | 容器编排层重启（Docker/K8s restart policy） |
| Chromium 可用 | `chromium --version` 检查 | 进程不存在 | 标记 unhealthy，不接收新任务 |
| FFmpeg 可用 | `ffmpeg -version` 检查 | 进程不存在 | 标记 unhealthy |
| 中文字体可用 | 检查 `/app/fonts/NotoSansSC-Regular.otf` 存在 | 文件缺失 | 标记 unhealthy |
| 磁盘空间 | `df /tmp` 检查 | < 2GB 可用 | 拒绝新渲染任务，清理 /tmp 中超过 1h 的临时文件 |
| 内存使用 | `process.memoryUsage()` 检查 | > 3.5GB (4GB 限制) | 拒绝新渲染任务，等待当前任务完成 |
| 活跃渲染超时 | 检查所有活跃渲染的已运行时间 | > renderTimeoutMs | 强制取消超时渲染，kill Chrome 进程 |

### 4.7 Worker 多实例部署

- 每个 Worker 实例默认并发 1 个渲染任务（`maxConcurrency = 1`）
- 通过容器编排（K8s/Docker Compose）水平扩展多实例
- Web 服务通过轮询或最少连接策略选择空闲 Worker 实例
- Web 服务维护 Worker 实例注册表（心跳检测）

---

## 5. Remotion 渲染管线详细设计

### 5.1 渲染触发流程（从 Inngest Step 到 Worker 完成）

```
Inngest Step: trigger-render
│
├── 1. 创建 RenderJob（status: queued）
│       └── 记录 remotionTemplateVersion、renderConfigHash、storyboardVersionId
│
├── 2. 准备渲染输入数据
│   ├── 读取 StoryboardVersion.storyboardJson
│   ├── 为所有 scene 音频 Asset 生成签名 URL（有效期 1 小时，purpose: "render"）
│   │   └── 签名 URL 在渲染开始前生成，确保覆盖整个渲染耗时
│   ├── 构建 renderConfig = { codec, jpegQuality, scale, brandColor, showWatermark }
│   └── 计算 renderConfigHash = sha256(renderConfig + storyboard contentHash)
│
├── 3. 检查 RenderJob 幂等
│   ├── 查询是否存在 storyboardVersionId + renderConfigHash 相同且 status=succeeded 的 RenderJob
│   ├── 存在 → 跳过渲染，直接复用已有 outputAssetId，状态直接 completed
│   └── 不存在 → 继续
│
├── 4. 选择 Worker 实例
│   ├── 查询 Worker 注册表（或 K8s Service 端点）
│   ├── 按健康状态 + 当前负载选择最空闲 Worker
│   └── 若无可用的 Worker 实例 → 任务 retrying，等待 Worker 恢复
│
├── 5. 发送渲染请求
│   ├── POST <worker-url>/internal/render
│   ├── Headers: Authorization: Bearer <INTERNAL_TOKEN>
│   ├── Body: { renderJobId, storyboard, audioUrlMap, outputKey, thumbnailKey, config }
│   ├── 超时：renderTimeoutMs + 60s（预留网络开销）
│   └── 更新 RenderJob status: rendering, workerId
│
├── 6. Worker 执行渲染（见 4.3）
│
├── 7. Worker 返回结果
│   ├── succeeded:
│   │   ├── 记录 video/thumbnail Asset（lifecycleStatus: active）
│   │   ├── 更新 RenderJob：status=succeeded，outputAssetId，durationMs，sizeBytes
│   │   ├── 更新 Project：status=rendering → completed，finalVideoAssetId
│   │   └── 返回 Inngest step success
│   │
│   └── failed:
│       ├── 判断错误类型
│       │   ├── 可重试（RENDER_CHROMIUM_LAUNCH_FAILED、RENDER_ENCODING_FAILED 首次）
│       │   │   └── RenderJob status: retrying，Inngest step 抛出重试
│       │   └── 不可重试（RENDER_INVALID_STORYBOARD、RENDER_TIMEOUT 第 3 次）
│       │       ├── RenderJob status: failed
│       │       ├── Project status: failed
│       │       └── 记录 errorCode + errorMessage + errorStack
│       └── 返回 Inngest step failure
│
└── 8. 清理
    ├── 触发 Worker 清理该 renderJobId 的临时文件（POST /internal/cleanup/:renderJobId）
    └── 记录 UsageRecord（render_ms、bytes）
```

### 5.2 renderMedia 参数配置表

| 参数 | 值 | 说明 |
| -- | -- | -- |
| `codec` | `"h264"` | 第一版标准 H.264 编码，兼容性最广 |
| `jpegQuality` | `85` | 平衡质量与文件大小 |
| `crf` | `23` | 默认质量（范围 0-51，越小质量越高，18-28 为合理范围） |
| `scale` | `1` | 不缩放，输出分辨率 = Composition 定义分辨率 |
| `imageFormat` | `"jpeg"` | 每帧使用 JPEG 图像格式（默认值，速度最快） |
| `pixelFormat` | `"yuv420p"` | 标准 YUV 4:2:0，兼容所有播放器 |
| `concurrency` | `1` | 单进程渲染，避免 CPU/内存争抢 |
| `disallowParallelEncoding` | `true` | 帧渲染与编码串行，内存友好 |
| `timeoutInMilliseconds` | `600_000` (10 分钟) | 3 分钟微课视频渲染超时上限 |
| `enforceAudioTrack` | `true` | 即使某 scene 无音频也保留音轨 |
| `muted` | `false` | 包含音频 |
| `overwrite` | `true` | 覆盖已有输出文件 |
| `logLevel` | `"info"` | 记录信息级别日志 |
| `offthreadVideoCacheSizeInBytes` | `null` | 不使用外部视频缓存（本场景无视频素材） |
| `chromiumOptions` | `{ disableWebSecurity: false, ignoreCertificateErrors: false }` | 默认安全配置 |

### 5.3 渲染超时策略

| 视频目标时长 | 预计渲染耗时 | renderMedia timeout | 端到端 SLA |
| -- | -- | -- | -- |
| 1 分钟 | 2-4 分钟 | 300,000ms (5 分钟) | P75 ≤ 4 分钟 |
| 3 分钟 | 4-8 分钟 | 600,000ms (10 分钟) | P75 ≤ 8 分钟 |
| 5 分钟 | 6-12 分钟 | 900,000ms (15 分钟) | P75 ≤ 12 分钟 |

- 超时后 Worker 通过 `cancelSignal` 取消渲染，强制终止 Chrome 进程
- 超时渲染最多重试 2 次，第 3 次仍超时标记为 `RENDER_TIMEOUT_FINAL`（不可重试）

### 5.4 缩略图生成

```ts
// 使用 renderStill 生成视频第 30 帧（1 秒处）作为缩略图
import { renderStill } from "@remotion/renderer";

const stillResult = await renderStill({
  serveUrl: bundleUrl,
  composition,
  inputProps,
  output: thumbnailTmpPath,
  frame: 30,            // 1s 处
  scale: 0.25,          // 缩略图缩小到 25%
  imageFormat: "jpeg",
  jpegQuality: 70,
  logLevel: "info",
});
```

---

## 6. 字幕渲染系统

### 6.1 字幕数据模型

```ts
// 与 PRD 中 CaptionSegment 保持一致
export interface CaptionSegment {
  /** 句子文本 */
  text: string;
  /** 句子开始时间（ms，相对于 scene 起始） */
  startMs: number;
  /** 句子结束时间（ms，相对于 scene 起始） */
  endMs: number;
  /** 时间戳（ms，句子中点时刻，MiniMax async 可能为 null） */
  timestampMs: number | null;
  /** 置信度（0-1，TTS 可能返回，默认 1） */
  confidence: number | null;
}
```

### 6.2 字幕组件实现

```tsx
// packages/remotion-video/src/components/CaptionOverlay.tsx

import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import type { CaptionSegment } from "@volcano/storyboard";

interface CaptionOverlayProps {
  captions: CaptionSegment[];
  sceneStartFrame: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  captions,
  sceneStartFrame,
  aspectRatio,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 找到当前应显示的 caption
  const currentTimeMs = (frame / fps) * 1000;
  const activeCaption = captions.find(
    (c) => currentTimeMs >= c.startMs && currentTimeMs <= c.endMs
  );

  if (!activeCaption) return null;

  // 字幕淡入淡出
  const captionLocalStart = (activeCaption.startMs / 1000) * fps;
  const captionLocalEnd = (activeCaption.endMs / 1000) * fps;

  const opacity = interpolate(
    frame,
    [captionLocalStart, captionLocalStart + 3, captionLocalEnd - 3, captionLocalEnd],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // 根据比例计算字幕位置和大小
  const fontSize = aspectRatio === "9:16" ? 28 : 32;

  return (
    <div
      style={{
        position: "absolute",
        bottom: aspectRatio === "9:16" ? 120 : 80,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: aspectRatio === "9:16" ? "85%" : "75%",
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily: "Noto Sans SC, sans-serif",
          fontWeight: 500,
          color: "#FFFFFF",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          padding: "8px 20px",
          borderRadius: 8,
          lineHeight: 1.6,
          display: "inline-block",
          textShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {activeCaption.text}
      </span>
    </div>
  );
};
```

### 6.3 字幕行为规则

| 规则 | 说明 |
| -- | -- |
| C-001 | 字幕始终叠加在视频画面最上层（z-index 最大） |
| C-002 | 字幕显示时机 = TTS 返回的句子级 startMs/endMs |
| C-003 | 相邻字幕之间至少有 50ms 的间隙（无间隙时自动合并） |
| C-004 | 字幕最大宽度 = 容器宽度的 75%（16:9）或 85%（9:16） |
| C-005 | 字幕最多显示 2 行，超过 2 行时按句号/逗号拆分 |
| C-006 | 字幕文本超过 30 字/行时自动换行 |
| C-007 | 字幕入场/离场动效为淡入淡出（各 100ms） |
| C-008 | 无字幕数据的 scene 不渲染字幕层 |
| C-009 | 字幕背景色 `rgba(0,0,0,0.65)`，文字色 `#FFFFFF` |
| C-010 | 字幕不支持用户自定义样式（第一版不做） |

---

## 7. 中文字体方案

### 7.1 字体选择

| 用途 | 字体 | 文件 | 备选 |
| -- | -- | -- | -- |
| 标题 | Noto Sans SC Bold | NotoSansSC-Bold.otf | Source Han Sans SC Bold |
| 正文 | Noto Sans SC Regular | NotoSansSC-Regular.otf | Source Han Sans SC Regular |
| 强调/标签 | Noto Sans SC Light | NotoSansSC-Light.otf | — |
| 等宽（代码） | Noto Sans Mono SC | NotoSansMonoSC-Regular.otf | 第一版不需要，预留 |

### 7.2 字体加载实现

```tsx
// packages/remotion-video/src/fonts.ts

import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 全局标记字体是否已加载
let fontsLoaded = false;

export async function loadChineseFonts(): Promise<void> {
  if (fontsLoaded) return;

  await Promise.all([
    loadFont(staticFile("fonts/NotoSansSC-Bold.otf"), {
      family: "Noto Sans SC",
      weight: "700",
    }),
    loadFont(staticFile("fonts/NotoSansSC-Regular.otf"), {
      family: "Noto Sans SC",
      weight: "400",
    }),
    loadFont(staticFile("fonts/NotoSansSC-Light.otf"), {
      family: "Noto Sans SC",
      weight: "300",
    }),
  ]);

  fontsLoaded = true;
  console.log("Chinese fonts loaded successfully");
}
```

### 7.3 字体加载时机与降级

| 场景 | 加载方式 | 降级策略 |
| -- | -- | -- |
| Worker 渲染 | Docker 镜像预装 Noto CJK 系统字体 + `loadFont()` 双重保障 | Fallback: `"Noto Sans SC", "Microsoft YaHei", "SimHei", sans-serif` |
| Web 前端预览 | `loadFont()` 在 Remotion Studio 启动时加载 | Fallback: 同上 |
| 字体加载失败 | Worker health check 检测字体文件是否存在 | 阻止渲染任务，返回 `RENDER_FONT_LOAD_FAILED` |

### 7.4 字体版权合规

- Noto Sans SC 使用 SIL Open Font License 1.1，允许免费商用
- 字体文件随 Docker 镜像发布，不依赖外部 CDN
- 字体文件存储在 `apps/render-worker/fonts/`，纳入版本控制
- 若后续更换字体，必须确认新字体许可允许嵌入视频和商业使用

---

## 8. Remotion 版本与兼容性管理

### 8.1 版本锁定策略

| 组件 | 锁定方式 | 说明 |
| -- | -- | -- |
| `remotion` | 精确版本（`4.0.476`，不使用 `^`） | 锁定主库版本 |
| `@remotion/renderer` | 与 remotion 同版本 | 必须与 remotion 主库版本严格一致 |
| `@remotion/media` | 与 remotion 同版本 | 同上 |
| `@remotion/captions` | 与 remotion 同版本 | 同上 |
| `@remotion/fonts` | 与 remotion 同版本 | 同上 |
| `@remotion/google-fonts` | 与 remotion 同版本 | 同上 |
| Chromium | 固定版本（通过 Docker 镜像锁定） | 避免 Chromium 版本变更导致渲染差异 |
| FFmpeg | 固定版本 | 同上 |

### 8.2 版本升级检查清单

升级 Remotion 版本前，必须完成以下检查：

1. [ ] 阅读 Remotion 的 CHANGELOG 和 BREAKING CHANGES
2. [ ] 检查所有使用 Remotion API 的代码是否存在 Breaking Change
3. [ ] 在本地环境用 `npx remotion studio` 预览至少 3 种模板的静态帧
4. [ ] 用 `npx remotion render` 渲染 1 分钟、3 分钟测试视频
5. [ ] 对比升级前后渲染输出的文件大小和 PSNR（像素差异 < 1%）
6. [ ] 更新 `apps/render-worker/Dockerfile` 中的基础镜像（如需要）
7. [ ] 更新 `RenderJob.remotionTemplateVersion` 字段值
8. [ ] 灰度发布：新版本 Worker 先处理 10% 流量，观察 30 分钟无异常后全量

### 8.3 Storyboard schemaVersion 兼容矩阵

| Storyboard schemaVersion | Remotion 模板版本 | 兼容性 |
| -- | -- | -- |
| `1.0.0` | `1.0.x` | 完全兼容 |
| `1.1.0` | `1.0.x` | 向前兼容（新字段有默认值） |
| `1.1.0` | `1.1.x` | 完全兼容 |
| `2.0.0` | `1.x.x` | 不兼容！需要升级 Remotion 模板版本 |

渲染前必须校验：
```ts
function checkSchemaCompatibility(storyboardVersion: string, templateVersion: string): boolean {
  const [storyMajor] = storyboardVersion.split(".").map(Number);
  const [templateMajor] = templateVersion.split(".").map(Number);
  return storyMajor === templateMajor;
}
```

---

## 9. Remotion 特有的错误处理

### 9.1 RENDER_* 错误码详细清单

| 错误码 | 触发条件 | 用户提示文案 | 可重试 | 重试策略 |
| -- | -- | -- | -- | -- |
| `RENDER_BUNDLE_FAILED` | Webpack/Rspack bundle 构建失败 | "视频模板编译失败，请稍后重试" | 是 | 立即重试 1 次 |
| `RENDER_COMPOSITION_NOT_FOUND` | bundle 中找不到指定 Composition | "视频模板配置错误，请联系管理员" | 否 | 不可重试，需人工介入 |
| `RENDER_CHROMIUM_LAUNCH_FAILED` | Chromium 启动失败 | "视频渲染引擎异常，正在自动恢复" | 是 | 延迟 30s 重试，最多 2 次 |
| `RENDER_ENCODING_FAILED` | FFmpeg 编码失败 | "视频编码失败，正在重试" | 是 | 立即重试 1 次 |
| `RENDER_ENCODING_RETRIED` | 编码失败第 2 次 | "视频编码再次失败，请重新生成" | 否 | 标记不可重试 |
| `RENDER_INVALID_STORYBOARD` | Storyboard 数据不合法（scene type 不存在、总帧数异常等） | "分镜数据异常，请重新生成分镜" | 否 | 需要重新生成 Storyboard |
| `RENDER_AUDIO_URL_EXPIRED` | 渲染过程中音频签名 URL 过期 | "音频资源已过期，正在自动刷新" | 是 | 刷新签名 URL 后重试 |
| `RENDER_AUDIO_FETCH_FAILED` | 音频文件下载失败（网络/404） | "音频文件加载失败，正在重试" | 是 | 延迟 5s 重试，最多 3 次 |
| `RENDER_TIMEOUT` | 渲染超时 | "视频渲染超时，正在重试" | 是 | 每次超时后 timeout 增加 50%，最多 2 次 |
| `RENDER_TIMEOUT_FINAL` | 渲染超时且超过最大重试次数 | "视频渲染超时，请缩短视频时长后重试" | 否 | 不可重试 |
| `RENDER_FONT_LOAD_FAILED` | 中文字体加载失败 | "字体加载失败，请联系管理员" | 否 | Worker health check 应提前发现 |
| `RENDER_DISK_FULL` | 磁盘空间不足 | "服务器存储空间不足，已通知运维" | 是 | 等待磁盘清理后重试 |
| `RENDER_OUTPUT_UPLOAD_FAILED` | 渲染输出上传 R2 失败 | "视频保存失败，正在重试" | 是 | 延迟 10s 重试，最多 3 次 |
| `RENDER_UNKNOWN_ERROR` | 未分类的渲染错误 | "视频渲染失败，请重试" | 是 | 立即重试 1 次 |

### 9.2 Worker 错误处理流程图

```
渲染请求到达
  │
  ├── 校验 internal token → 失败 → 401 UNAUTHORIZED_INTERNAL（不重试）
  │
  ├── 检查并发限制 → 超限 → 429 TOO_MANY_REQUESTS（web 服务切换到其他 Worker）
  │
  ├── bundle() → 失败 → RENDER_BUNDLE_FAILED（可重试 1 次）
  │
  ├── getCompositions() → 未找到 → RENDER_COMPOSITION_NOT_FOUND（不可重试）
  │
  ├── renderMedia()
  │   ├── Chromium 启动失败 → RENDER_CHROMIUM_LAUNCH_FAILED（重试 2 次）
  │   ├── audio URL 访问失败
  │   │   ├── 403/过期 → RENDER_AUDIO_URL_EXPIRED → 通知 web 刷新 URL 后重试
  │   │   └── 其他 → RENDER_AUDIO_FETCH_FAILED（重试 3 次）
  │   ├── 超时 → RENDER_TIMEOUT/RENDER_TIMEOUT_FINAL
  │   ├── FFmpeg 错误 → RENDER_ENCODING_FAILED
  │   └── 未知错误 → RENDER_UNKNOWN_ERROR
  │
  ├── R2 上传 → 失败 → RENDER_OUTPUT_UPLOAD_FAILED（重试 3 次）
  │
  └── 成功 → 返回结果
```

### 9.3 onProgress 进度上报

```ts
// Worker 内部：将渲染进度写入 Redis/内存，供 GET /status/:renderJobId 查询
const progressStore = new Map<string, RenderProgress>();

// renderMedia 中：
onProgress: ({ progress, renderedFrames, encodedFrames }) => {
  progressStore.set(renderJobId, {
    progress: Math.round(progress * 100) / 100,
    renderedFrames,
    encodedFrames,
    updatedAt: Date.now(),
  });
},

// 同时通过 onStart 获取总帧数：
onStart: ({ frameCount }) => {
  progressStore.set(renderJobId, {
    progress: 0,
    renderedFrames: 0,
    totalFrames: frameCount,
    startedAt: new Date().toISOString(),
  });
},
```

---

## 10. 前置 Storyboard 校验增强（针对 Remotion 渲染）

### 10.1 渲染前置校验规则

在主 PRD 的 "Storyboard 生成" 之后、"Timeline 计算" 之前，增加 Remotion 特定的前置校验：

```ts
// packages/storyboard/src/validation.ts

export interface RemotionValidationResult {
  valid: boolean;
  errors: Array<{ sceneKey: string; field: string; message: string }>;
  warnings: Array<{ sceneKey: string; field: string; message: string }>;
}

export function validateForRemotionRender(storyboard: Storyboard): RemotionValidationResult {
  const errors: RemotionValidationResult["errors"] = [];
  const warnings: RemotionValidationResult["warnings"] = [];

  for (const scene of storyboard.scenes) {
    // Rule 1: 每个 scene 必须有合法的 type
    if (!VALID_SCENE_TYPES.includes(scene.type)) {
      errors.push({
        sceneKey: scene.sceneKey,
        field: "type",
        message: `不支持的 scene type: ${scene.type}，支持的 type: ${VALID_SCENE_TYPES.join(", ")}`,
      });
    }

    // Rule 2: 每个 scene 必须有 startFrame 和 durationFrames
    if (scene.startFrame == null || scene.durationFrames == null || scene.durationFrames <= 0) {
      errors.push({
        sceneKey: scene.sceneKey,
        field: "startFrame/durationFrames",
        message: `scene 缺少有效的 startFrame (${scene.startFrame}) 或 durationFrames (${scene.durationFrames})`,
      });
    }

    // Rule 3: durationFrames 不小于最小阈值（至少 30 帧 = 1 秒）
    if (scene.durationFrames != null && scene.durationFrames < 30) {
      warnings.push({
        sceneKey: scene.sceneKey,
        field: "durationFrames",
        message: `scene 过短 (${scene.durationFrames} 帧 < 30 帧)，可能导致动效无法完整播放`,
      });
    }

    // Rule 4: voiceover text 不能为空（ending 除外）
    if (scene.type !== "ending" && (!scene.voiceoverText || scene.voiceoverText.trim().length === 0)) {
      warnings.push({
        sceneKey: scene.sceneKey,
        field: "voiceoverText",
        message: "旁白文本为空，该 scene 将无音频",
      });
    }

    // Rule 5: visual.template 字段对应关系（v1.0 中 visual 本身不含 template 字段）
    if (scene.visualJson && typeof scene.visualJson !== "object") {
      errors.push({
        sceneKey: scene.sceneKey,
        field: "visualJson",
        message: "visualJson 必须是有效 JSON 对象",
      });
    }
  }

  // Rule 6: scene 顺序必须从 0 开始连续
  const orders = storyboard.scenes.map((s) => s.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i) {
      errors.push({
        sceneKey: "storyboard",
        field: "order",
        message: `scene 顺序不连续：期望 order=${i}，实际最小值=${orders[i]}，将自动重新排序`,
      });
      break;
    }
  }

  // Rule 7: 第一个 scene 的 startFrame 必须为 0
  const firstScene = storyboard.scenes.find((s) => s.order === 0);
  if (firstScene && firstScene.startFrame !== 0) {
    warnings.push({
      sceneKey: firstScene.sceneKey,
      field: "startFrame",
      message: `第一个 scene 的 startFrame 应为 0，实际为 ${firstScene.startFrame}`,
    });
  }

  // Rule 8: 总帧数校验
  const computedTotalFrames = storyboard.scenes.reduce(
    (sum, s) => sum + (s.durationFrames ?? 0), 0
  );
  if (storyboard.totalFrames != null && Math.abs(storyboard.totalFrames - computedTotalFrames) > 3) {
    warnings.push({
      sceneKey: "storyboard",
      field: "totalFrames",
      message: `声明总帧数 (${storyboard.totalFrames}) 与计算总帧数 (${computedTotalFrames}) 不一致`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## 11. 分镜静态预览实现（Remotion 组件复用）

### 11.1 ScenePreview Composition

```tsx
// packages/remotion-video/src/compositions/ScenePreview.tsx

import { AbsoluteFill, useVideoConfig } from "remotion";
import type { Scene, CaptionSegment } from "@volcano/storyboard";
import { getTemplateComponent } from "../templates/registry";
import { SlideBackground } from "../components/SlideBackground";

export interface ScenePreviewProps {
  scene: Scene;
  aspectRatio: "16:9" | "9:16" | "1:1";
}

/**
 * 分镜静态预览 Composition
 * durationInFrames=1（单帧），用于 web 前端在 Storyboard Preview 页面展示
 */
export const ScenePreview: React.FC<ScenePreviewProps> = ({ scene, aspectRatio }) => {
  const TemplateComponent = getTemplateComponent(scene.type);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <SlideBackground
        sceneType={scene.type}
        visual={scene.visualJson}
      />
      <TemplateComponent
        visual={scene.visualJson}
        startFrame={0}
        durationFrames={1}
        aspectRatio={aspectRatio}
        animationKey="none"   // 静态预览不带动效
        captions={undefined}  // 静态预览不显示字幕
      />
    </AbsoluteFill>
  );
};
```

### 11.2 前端预览调用方式

前端 Storyboard Preview 页面通过 Remotion Studio 的 `<Player>` 组件或直接渲染静态帧：

**方案 A（推荐）：使用 Remotion Player 组件（带播放控制）**

```tsx
// apps/web 中，仅在 Storyboard Preview 页面引入
import { Player } from "@remotion/player";
import { ScenePreview } from "@volcano/remotion-video";

<Player
  component={ScenePreview}
  inputProps={{ scene: selectedScene, aspectRatio: project.aspectRatio }}
  durationInFrames={1}
  compositionWidth={640}
  compositionHeight={360}
  fps={30}
  controls={false}
  autoPlay={false}
  loop={false}
/>
```

**方案 B：使用 `<Img>` + Remotion 静态渲染 URL**

对于不引入完整 Remotion Player 的场景，Web 端通过内部 API 生成静态预览图：

```
GET /internal/preview-scene?projectId=xxx&sceneKey=scene_001
→ render-worker 调用 renderStill() 生成单帧 PNG
→ 上传 R2，返回签名 URL
→ 前端 <img src={signedUrl} />
```

第一版建议采用方案 B（性能更优，不增加前端 bundle 体积）。

---

## 12. Remotion 渲染性能优化

### 12.1 渲染性能基准

| 视频时长 | 分辨率 | 目标渲染时间 | 帧数 |
| -- | -- | -- | -- |
| 1 分钟 | 1920×1080 | ≤ 4 分钟 | 1800 |
| 3 分钟 | 1920×1080 | ≤ 8 分钟 | 5400 |
| 5 分钟 | 1920×1080 | ≤ 12 分钟 | 9000 |
| 1 分钟 | 1080×1920 | ≤ 5 分钟 | 1800 |
| 3 分钟 | 1080×1920 | ≤ 10 分钟 | 5400 |

### 12.2 优化措施

| 优化项 | 具体措施 | 预期收益 |
| -- | -- | -- |
| Bundle 缓存 | Worker 缓存 Webpack bundle，remotion-video 包未变更时复用 | 省去 15-30s bundle 时间 |
| 组件纯化 | 模板组件使用 `React.memo`，避免不必要的重渲染 | 每帧节省 5-15ms |
| 图片格式 | `imageFormat: "jpeg"` 而非 png（不需要透明度时） | 每帧编码速度提升 30-50% |
| `forSeamlessAacConcatenation` | 若 TTS 输出 AAC，启用此选项优化音频拼接 | 减少音频转码耗时 10-20s |
| `disallowParallelEncoding` | 在 ≤ 4GB 内存的 Worker 上启用以避免 OOM | 内存占用降低 40-60% |
| `scale` 渐进式渲染 | 调试时可使用 `scale: 0.5`，正式渲染使用 `1` | 调试渲染时间减半 |
| 减少复杂 CSS | 避免 `box-shadow`、`filter: blur()` 等耗性能属性 | 每帧节省 10-30ms |
| 字体子集化 | 中文字体使用子集化（仅包含常用 7000 字），而非完整字体 | 字体加载时间从 3s 降至 0.5s |

### 12.3 启动性能（冷启动）

| 步骤 | 预估耗时 | 累计 |
| -- | -- | -- |
| Docker 容器启动 | 2-3s | 3s |
| Node.js 启动 + 字体加载 | 2-5s | 8s |
| Remotion bundle 构建（首次） | 20-30s | 38s |
| Remotion bundle 构建（缓存命中） | 2-5s | 13s |
| Chromium 启动 | 2-3s | 16s（缓存） |
| 准备开始渲染第一帧 | < 1s | 17s（缓存） |

---

## 13. 异常边界与回滚流程（Remotion 特定）

### 13.1 渲染中断恢复

| 中断点 | 已产生数据 | 恢复策略 |
| -- | -- | -- |
| bundle 构建中 | 无 | 重新 bundle（缓存失效则重新构建） |
| renderMedia 执行到 50% | 临时帧文件（Worker 本地磁盘） | renderMedia 不支持断点续传，必须从头渲染 |
| 渲染完成，上传 R2 前 | 完整 MP4 文件在 Worker 临时目录 | 重试上传（最多 3 次），上传成功后清理本地文件 |
| R2 上传成功，数据库写入前 | R2 中有文件，数据库无 Asset 记录 | 孤儿文件检测：定时任务比对 R2 与 Asset 表 |
| 数据库写入成功，Project 状态更新前 | Asset 存在，Project 状态未更新 | Compensation Job：每 5 分钟检查 succeeded RenderJob 对应的 Project 状态 |

### 13.2 取消渲染

当用户取消项目时：

1. Web 服务调用 Worker `POST /internal/cancel/:renderJobId`
2. Worker 调用 `cancelSignal`（由 `makeCancelSignal()` 创建）终止 renderMedia
3. Worker 清理该 renderJobId 的临时文件
4. Web 服务更新 RenderJob 状态为 `cancelled`
5. 若 Chromium 进程未响应取消信号，5s 后 Worker 强制 `kill` Chrome 进程树

### 13.3 Worker 崩溃恢复

| 崩溃场景 | 检测方式 | 恢复措施 |
| -- | -- | -- |
| Worker 进程崩溃（OOM/异常） | Web 服务心跳检测（每 30s）或渲染请求超时 | Web 服务标记该 Worker 为 unhealthy，将该 RenderJob 标记为 `retrying`，分配到其他 Worker |
| Worker 网络断开 | 渲染请求连接超时 | 同上 |
| Worker 磁盘满 | Worker health check 返回 unhealthy | 容器编排层自动重启 Worker，Web 服务路由到其他 Worker |
| Chromium 僵尸进程 | Worker 定时检查（每 60s） | kill 僵尸 Chrome 进程，若无活跃渲染则重启 Worker |

---

## 14. License 合规方案

### 14.1 Remotion License 评估

| 评估维度 | 结论 | 依据 |
| -- | -- | -- |
| 使用方式 | 平台内嵌 Remotion 作为渲染引擎，用户通过 Web UI 触发渲染 | Remotion 以程序化 API 方式被调用 |
| 使用主体 | 运营平台的公司实体 | 若公司员工 >= 4 人 → 需要 Company License |
| 是否 SaaS | 是（多租户平台，用户生成视频） | 需确认 Remotion Company License 是否覆盖 SaaS 场景 |
| 当前状态 | MVP/内测阶段 | 可在评估期使用 Free License |
| 商业化前必须 | 购买 Remotion Company License 或联系 Remotion 团队确认 | 联系方式：hi@remotion.dev，详情见 remotion.pro |

### 14.2 合规行动项

| 序号 | 行动项 | 优先级 | 责任人 | 截止时间 |
| -- | -- | -- | -- | -- |
| 1 | 确认公司员工数量，判断是否超过 3 人阈值 | P0 | 项目负责人 | 开发启动前 |
| 2 | 联系 hi@remotion.dev 确认 SaaS 平台使用场景的 License 要求 | P0 | 项目负责人 | 开发启动前 |
| 3 | 若需购买，确认 Company License 价格并纳入项目预算 | P0 | 项目负责人 | MVP 发布前 |
| 4 | `renderMedia` 调用时若需传入 `licenseKey`，通过环境变量注入 | P1 | 后端开发 | Worker 开发阶段 |
| 5 | 在代码中保留 `licenseKey` 配置项，支持运行时切换 | P1 | 后端开发 | Worker 开发阶段 |

### 14.3 License Key 配置

```ts
// apps/render-worker/src/renderer.ts

const licenseKey = process.env.REMOTION_LICENSE_KEY;

// renderMedia 调用时：
const result = await renderMedia({
  serveUrl: bundleUrl,
  composition,
  codec: "h264",
  outputLocation: tmpOutputPath,
  inputProps,
  licenseKey,  // 若无 License Key 则使用免费评估模式
  // ...其他参数
});
```

---

## 15. Remotion 特定安全要求

### 15.1 安全边界

| 规则编号 | 规则描述 |
| -- | -- |
| S-001 | LLM 在任何情况下**不得**输出 Remotion/React/JSX/TSX 代码 |
| S-002 | Storyboard JSON 中的 `visualJson` 和 `animationJson` 仅支持预定义字段，不得接受任意键值 |
| S-003 | 音频 URL 仅允许来自本平台 R2 的签名 URL，不接受外部 URL |
| S-004 | Worker 渲染环境**不接入公网**，仅允许访问内网 R2 和 Web 服务回调 |
| S-005 | Worker `/internal/*` 接口必须验证 `Authorization: Bearer <INTERNAL_TOKEN>` |
| S-006 | 禁止将 `inputProps` 中的用户数据输出到 Remotion 日志（日志脱敏） |
| S-007 | 禁止在 Remotion 模板组件中进行任何网络请求（所有数据通过 props 传入） |

### 15.2 Worker 网络安全

```
                        ┌──────────────┐
                        │   公网用户    │
                        └──────┬───────┘
                               │ HTTPS
                        ┌──────▼───────┐
                        │  Next.js Web  │  (公网可达)
                        └──────┬───────┘
                               │ HTTP + Internal Token (内网)
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐ ┌──────▼───────┐ ┌─────▼──────┐
     │ Render Worker │ │ Render Worker│ │ Cloudflare │
     │   (内网)       │ │   (内网)     │ │    R2      │
     └───────────────┘ └──────────────┘ └────────────┘
```

- Worker 不可从公网直接访问
- Worker 仅接受来自 Web 服务的内网 HTTP 请求
- Worker 访问 R2 通过内网或 S3-compatible API
- 渲染素材（音频）通过 R2 签名 URL 拉取（Worker 需访问 R2）

---

## 16. Remotion 相关验收标准（AC）

### 16.1 正常流程

**AC-R-001：Storyboard 正确渲染为 MP4**
Given 一个合法的 Storyboard（3 个 scene，每个 scene 有音频和字幕）
When Worker 执行 renderMedia
Then 输出 MP4 文件，分辨率 = 1920×1080，编码 = H.264，音频采样率 = 44100Hz，所有 scene 按 order 顺序出现

**AC-R-002：Scene type 正确映射模板**
Given Storyboard 包含 title、concept、summary 三种 scene type
When 渲染完成
Then title scene 使用 TitleSlide 模板布局，concept scene 使用 ConceptCard 布局，summary scene 使用 Summary 布局

**AC-R-003：字幕正确显示**
Given Scene 有 3 条句子级 captions（startMs=0, 2000, 5000）
When 播放视频
Then 字幕在对应时间点显示对应文本，相邻字幕无重叠，字幕位于画面底部居中

**AC-R-004：音频与画面同步**
Given Scene 音频时长 = 4500ms，scene durationFrames = 180（含 buffer）
When 播放视频
Then 音频在 scene 开始时刻开始播放，画面与音频同步结束，无提前切断或拖尾

**AC-R-005：缩略图生成**
Given 渲染成功
When 查看缩略图
Then 缩略图为视频第 1 秒的帧，分辨率 = 480×270（25% scale of 1920×1080），JPEG 格式

### 16.2 异常流程

**AC-R-006：Worker 繁忙时排队**
Given Worker 最大并发为 1 且当前有 1 个活跃渲染
When 新的渲染请求到达
Then Web 服务将请求路由到其他空闲 Worker，或返回 429（无可用的 Worker 时任务 retrying）

**AC-R-007：音频签名 URL 过期**
Given 渲染过程中某 scene 的音频 URL 返回 403
When Worker 检测到 HTTP 403
Then Worker 上报 RENDER_AUDIO_URL_EXPIRED，Web 服务刷新签名 URL 后重新下发渲染请求

**AC-R-008：Chromium 启动失败**
Given Worker Docker 镜像中 Chromium 缺失
When Worker 尝试启动渲染
Then Worker 健康检查提前发现并标记 unhealthy，不接收渲染请求

**AC-R-009：模板不支持 Scene Type**
Given Storyboard 包含 type="unknown_type" 的 scene
When Worker 渲染
Then 使用 concept 模板作为回退，渲染日志记录 WARNING

**AC-R-010：Storyboard 缺少 timeline 数据**
Given Storyboard 的 scene 没有 startFrame 或 durationFrames
When 渲染前校验
Then 返回 RENDER_INVALID_STORYBOARD，任务 failed，不进入 renderMedia

### 16.3 性能验收

**AC-R-011：3 分钟视频渲染时间**
Given 3 分钟 Storyboard（10 个 scene，1920×1080，30fps）
When 在新 Worker 上执行冷启动渲染
Then 渲染耗时 ≤ 8 分钟（P75），含 bundle 构建

**AC-R-012：Bundle 缓存命中渲染时间**
Given Worker 已缓存 bundle（remotion-video 包未变更）
When 执行渲染
Then bundle 复用缓存，渲染总耗时减少 15-30s

**AC-R-013：Worker 并发渲染稳定**
Given Worker 执行 10 次连续渲染（每次 1 分钟视频）
When 无重启
Then 所有渲染均成功，内存使用稳定（无持续增长，GC 后回到基线 ± 10%）

### 16.4 兼容性验收

**AC-R-014：三种比例均正确渲染**
Given Storyboard aspectRatio = "16:9" / "9:16" / "1:1"
When 分别渲染
Then 输出分辨率分别为 1920×1080 / 1080×1920 / 1080×1080，内容布局正确

**AC-R-015：中文字体正确显示**
Given 视频包含中文标题和旁白字幕
When 渲染完成
Then 所有中文文字无乱码、无 tofu（缺字方块），字体为 Noto Sans SC

---

## 17. 开发拆分建议（Remotion 相关部分更新）

为配合 Remotion 集成，主 PRD 第 17 节的 Epic 5 需更新为：

### Epic 5：Remotion 视频渲染（原 Timeline + Remotion 渲染合并）

| 编号 | Story | Task | 预估工作量 |
| -- | -- | -- | -- |
| 5.1 | Remotion 项目搭建 | 创建 `packages/remotion-video` 包，安装 Remotion 依赖，配置 `registerRoot`，验证 `npx remotion studio` 可启动 | 后端 1 人日 |
| 5.2 | 模板注册表 | 实现 `registry.ts`，定义 `TemplateComponent` 接口 | 后端 0.5 人日 |
| 5.3 | TitleSlide 模板 | 实现标题页模板组件，含入场动效和响应式布局 | 前端 1 人日 |
| 5.4 | ConceptCard 模板 | 实现概念卡片模板组件，含打字机动效 | 前端 1 人日 |
| 5.5 | BulletList 模板 | 实现要点列表模板组件，含 stepReveal 动效 | 前端 1.5 人日 |
| 5.6 | ProcessFlow 模板 | 实现流程图模板组件，含节点逐步显示动效 | 前端 2 人日 |
| 5.7 | Comparison 模板 | 实现对比模板组件，含双栏滑入动效 | 前端 1.5 人日 |
| 5.8 | Timeline 模板 | 实现时间线模板组件，含引导线绘制动效 | 前端 1.5 人日 |
| 5.9 | Summary 模板 | 实现总结页模板组件，含卡片网格动效 | 前端 1 人日 |
| 5.10 | EndingSlide 模板 | 实现结束页模板组件 | 前端 0.5 人日 |
| 5.11 | 动效预设库 | 实现 8 种动效（fadeIn/slideUp/slideLeft/scaleIn/typewriter/stepReveal/highlight/wipeReveal） | 前端 2 人日 |
| 5.12 | 字幕组件 | 实现 `CaptionOverlay` 组件，含句子匹配和淡入淡出 | 前端 1.5 人日 |
| 5.13 | 背景与主题 | 实现 `SlideBackground`、主题色板、CSS 变量体系 | 前端 0.5 人日 |
| 5.14 | MicroCourseVideo Composition | 实现主 Composition，编排 scene 序列、音频、字幕 | 前端 1 人日 |
| 5.15 | calculateMetadata | 实现动态 duration 计算和音频 URL 校验 | 后端 1 人日 |
| 5.16 | Remotion Worker 基础架构 | 搭建 `apps/render-worker`，HTTP Server（Fastify），健康检查，内部 token 校验 | 后端 2 人日 |
| 5.17 | Worker 渲染引擎 | 实现 bundle + getCompositions + renderMedia 调用，进度上报，错误处理 | 后端 2 人日 |
| 5.18 | Worker Docker 化 | 编写 Dockerfile，安装 Chromium/FFmpeg/中文字体，验证镜像构建 | 后端 1.5 人日 |
| 5.19 | Render Provider 适配器 | 实现 `packages/providers` 中的 `remotion-worker` Render Provider | 后端 1 人日 |
| 5.20 | Inngest render step | 实现 Inngest `trigger-render` step function，Worker 选择、幂等检查、回调处理 | 后端 2 人日 |
| 5.21 | Timeline 计算器 | 实现 `packages/storyboard` 中的 timeline 计算（基于音频 durationMs） | 后端 1 人日 |
| 5.22 | ScenePreview 静态预览 | 实现 `ScenePreview` Composition + renderStill 调用 + 前端预览 API | 后端 1 人日，前端 1 人日 |
| 5.23 | Storyboard 渲染前校验 | 实现 `validateForRemotionRender()` 校验逻辑 | 后端 1 人日 |
| 5.24 | 端到端集成测试 | 完整链路：LLM → Storyboard → TTS → Timeline → Render Worker → MP4 | 测试 3 人日 |

**Epic 5 汇总工作量：**
- 前端：13 人日
- 后端：14 人日
- 测试：3 人日
- **合计：30 人日**

---

## 18. 配置清单（环境变量）

### 18.1 Web 服务（apps/web）

```bash
# Remotion Render Worker 地址列表（逗号分隔）
RENDER_WORKER_URLS=http://render-worker-1:3200,http://render-worker-2:3200

# Worker 内部 API Token
INTERNAL_API_TOKEN=volcano-internal-token-xxx

# Remotion License Key（可选，免费评估期可留空）
REMOTION_LICENSE_KEY=

# 渲染默认配置
RENDER_DEFAULT_CODEC=h264
RENDER_DEFAULT_JPEG_QUALITY=85
RENDER_DEFAULT_CRF=23
RENDER_DEFAULT_SCALE=1
```

### 18.2 Render Worker（apps/render-worker）

```bash
# Worker 端口
RENDER_WORKER_PORT=3200

# 最大并发渲染数
RENDER_WORKER_MAX_CONCURRENCY=1

# 渲染超时（ms）
RENDER_WORKER_TIMEOUT_MS=600000

# 内部 API Token（与 Web 服务共享）
INTERNAL_API_TOKEN=volcano-internal-token-xxx

# Remotion 包入口文件路径
REMOTION_ENTRY_POINT=../../packages/remotion-video/src/Root.tsx

# Bundle 缓存有效期（ms）
BUNDLE_CACHE_TTL_MS=3600000

# Chromium 可执行文件路径
BROWSER_EXECUTABLE=/usr/bin/chromium

# 临时文件目录
RENDER_TEMP_DIR=/tmp/remotion-renders

# 字体目录
RENDER_FONTS_DIR=/app/fonts

# 单帧超时（ms）
FRAME_TIMEOUT_MS=30000

# Remotion License Key
REMOTION_LICENSE_KEY=

# Cloudflare R2 访问凭证（Worker 直接上传渲染结果）
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=volcano-videos
```

---

## 19. 附录：Storyboard Schema 完整定义（以 Remotion 渲染视角）

```ts
// packages/storyboard/src/types.ts

/**
 * Storyboard：LLM 输出的完整分镜结构
 */
export interface Storyboard {
  /** Schema 版本号，用于渲染兼容性判断 */
  schemaVersion: string;
  /** 视频标题 */
  title: string;
  /** 视频比例 */
  aspectRatio: "16:9" | "9:16" | "1:1";
  /** FPS（固定 30） */
  fps: number;
  /** 总帧数（渲染前计算，初始为 null） */
  totalFrames: number | null;
  /** 总时长 ms（渲染前计算，初始为 null） */
  totalDurationMs: number | null;
  /** Scene 列表 */
  scenes: Scene[];
  /** 元数据 */
  metadata?: {
    generatedBy: string;       // LLM provider ID
    generatedAt: string;       // ISO8601 时间戳
    sourceTextHash: string;    // 原始文本 hash
    audienceRole: "student" | "teacher";
    audienceLevel?: string;
  };
}

/**
 * Scene：单个分镜
 */
export interface Scene {
  /** Scene 唯一标识，格式 scene_001 */
  sceneKey: string;
  /** 顺序，从 0 开始连续 */
  order: number;
  /** Scene 类型 */
  type: "title" | "concept" | "bullet_list" | "process" | "comparison" | "timeline" | "summary" | "ending";
  /** 标题（可选） */
  title?: string;
  /** 旁白结构 */
  voiceover: {
    /** 旁白文本 */
    text: string;
    /** 音频 Asset ID（TTS 生成后回填） */
    audioAssetId?: string;
    /** 音频时长 ms（TTS 生成后回填） */
    durationMs?: number;
  };
  /** 视觉内容（模板入参） */
  visual: SceneVisual;
  /** 动画配置（模板入参） */
  animation?: {
    /** 动效预设名称，可选。不填则使用模板默认动效 */
    preset?: string;
    /** 动效自定义参数 */
    params?: Record<string, unknown>;
  };
  /** 时间轴（渲染前计算，初始为 null） */
  timeline?: {
    /** 起始帧（全局） */
    startFrame: number | null;
    /** 持续帧数 */
    durationFrames: number | null;
  };
  /** 字幕（TTS 生成后回填） */
  captions?: CaptionSegment[];
}

/**
 * SceneVisual：scene 的视觉数据，不同类型有不同必填字段
 */
export type SceneVisual =
  | TitleVisual
  | ConceptVisual
  | BulletListVisual
  | ProcessVisual
  | ComparisonVisual
  | TimelineVisual
  | SummaryVisual
  | Record<string, unknown>;  // 扩展预留

export interface TitleVisual {
  title: string;
  subtitle?: string;
  source?: string;
  backgroundColor?: string;
}

export interface ConceptVisual {
  conceptName: string;
  explanation: string;
  keywords?: string[];
  icon?: string;  // emoji 或 SVG 组件名
  accentColor?: string;
}

export interface BulletListVisual {
  title?: string;
  items: Array<{
    icon?: "number" | "bullet" | "check" | "arrow" | "star";
    text: string;
  }>;
}

export interface ProcessVisual {
  direction?: "horizontal" | "vertical";
  steps: Array<{
    label: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
}

export interface ComparisonVisual {
  left: {
    title: string;
    points: string[];
    color?: string;
  };
  right: {
    title: string;
    points: string[];
    color?: string;
  };
}

export interface TimelineVisual {
  events: Array<{
    date: string;
    title: string;
    description?: string;
  }>;
}

export interface SummaryVisual {
  points: Array<{
    keyword: string;
    description: string;
  }>;
}

/**
 * CaptionSegment：句子级字幕段
 */
export interface CaptionSegment {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
}
```

---

## 20. 变更记录

| 版本 | 日期 | 变更说明 |
| -- | -- | -- |
| v1.0.0 | 2026-06-13 | 创建 Remotion 集成补充规格说明书初稿，覆盖：项目架构、8 套模板详细规格、Worker 设计、渲染管线、字幕系统、中文字体方案、版本管理、错误处理、安全要求、验收标准、开发拆分 |
