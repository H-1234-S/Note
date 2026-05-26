# Polaris 项目需求与数据流复盘

这份文档用于项目复盘和面试拷打。重点不是逐行解释代码，而是把项目拆成：它解决什么问题、有哪些业务需求、核心数据模型是什么、用户操作后数据如何流动、哪些技术点可以展开讲。

## 1. 项目一句话

Polaris 是一个 AI 驱动的浏览器在线 IDE。用户登录后可以创建项目、导入 GitHub 仓库、在线编辑文件、运行预览项目，并通过 AI 对话让 Agent 读取、创建、修改、删除项目文件。

## 2. 核心用户与使用场景

目标用户是需要在浏览器里开发全栈应用的开发者。

典型场景：

1. 用户登录 Polaris。
2. 新建一个项目，或从 GitHub 导入已有仓库。
3. 在文件树里创建、重命名、删除、打开文件。
4. 在 CodeMirror 编辑器里修改代码。
5. 切到 Preview，通过 WebContainer 安装依赖并运行项目。
6. 在左侧 AI 对话里提需求，让 Agent 自动改代码。
7. 把项目导出为新的 GitHub 仓库。

## 3. 技术栈总览

| 层级 | 技术 | 项目中的职责 |
| --- | --- | --- |
| App 框架 | Next.js App Router | 页面路由、API Route、服务端入口 |
| 登录鉴权 | Clerk | 用户登录、GitHub OAuth Token 获取 |
| 数据库 | Convex | 项目、文件、对话、消息的实时数据存储 |
| 后台任务 | Inngest | AI 消息处理、GitHub 导入、GitHub 导出 |
| AI SDK | Vercel AI SDK + DeepSeek | 代码建议、快速编辑、Agent 回复 |
| Agent 编排 | Inngest Agent Kit | 给 AI 提供文件操作工具并循环执行 |
| 编辑器 | CodeMirror 6 | 在线代码编辑、补全、选区工具、快速编辑 |
| 预览运行时 | WebContainer | 在浏览器里安装依赖、运行 dev server、展示 iframe |
| 状态管理 | Zustand | 编辑器 tabs、active tab、preview tab |
| UI | shadcn/radix/lucide/allotment | 对话、弹窗、分栏、按钮、文件树等 |
| 错误追踪 | Sentry | 前后端和 Inngest 任务错误追踪 |

## 4. 业务需求清单

### 4.1 登录与访问控制

需求：

- 未登录用户只能看到登录页。
- 已登录用户才能进入项目工作台。
- 用户只能访问自己创建或导入的项目。
- 所有 Convex query/mutation 都要校验项目 owner。
- API Route 要用 Clerk 校验当前用户。
- 服务端到 Convex 的内部调用使用 `POLARIS_CONVEX_INTERNAL_KEY` 防止绕过前端直接操作数据库。

核心文件：

- `src/components/providers.tsx`
- `convex/auth.ts`
- `convex/projects.ts`
- `convex/files.ts`
- `convex/conversations.ts`
- `convex/system.ts`

面试说法：

前端通过 `ConvexProviderWithClerk` 把 Clerk 的登录态注入 Convex。普通用户请求走 Convex 的 `verifyAuth` 校验，后台任务和 API Route 走 `system.ts` 的 internal key 校验，区分用户态调用和系统态调用。

### 4.2 项目管理

需求：

- 首页展示最近项目。
- 支持查看所有项目。
- 支持新建项目。
- 支持通过 prompt 创建项目并自动触发 AI 生成。
- 支持项目重命名。
- 支持项目级预览命令配置：`installCommand`、`devCommand`。

核心数据：

- `projects.name`
- `projects.ownerId`
- `projects.updatedAt`
- `projects.settings.installCommand`
- `projects.settings.devCommand`
- `projects.importStatus`
- `projects.exportStatus`
- `projects.exportRepoUrl`

核心文件：

- `src/features/projects/views/projects-view.tsx`
- `src/features/projects/hooks/use-projects.ts`
- `convex/projects.ts`
- `src/app/api/projects/create-with-prompt/route.ts`

### 4.3 文件资源管理器

需求：

- 每个项目有自己的文件树。
- 文件支持层级结构：文件或文件夹都可以有 `parentId`。
- 支持创建文件、创建文件夹、重命名、删除。
- 删除文件夹时要递归删除所有子文件和子文件夹。
- 文件树排序规则：文件夹优先，然后文件，同类型内按名字排序。
- 支持折叠/展开文件夹。
- 支持一键折叠所有文件夹。
- 支持单击文件以预览 tab 打开，双击固定 tab。

核心数据：

- `files.projectId`
- `files.parentId`
- `files.name`
- `files.type`
- `files.content`
- `files.storageId`
- `files.updatedAt`

核心文件：

- `convex/files.ts`
- `src/features/projects/hooks/use-files.ts`
- `src/features/projects/components/file-explorer/index.tsx`
- `src/features/projects/components/file-explorer/tree.tsx`

关键实现：

- 根目录查询：`parentId` 为空。
- 子目录查询：按 `projectId + parentId` 查询。
- 文件夹删除：先查询子节点，再递归删除，最后删自己。
- 一键折叠：改变 `collapseKey`，让 React 重新挂载 `Tree` 组件，重置内部 `isOpen` 状态。

### 4.4 编辑器与文件保存

需求：

- 支持多 tab 打开文件。
- 支持预览 tab 和固定 tab。
- 支持关闭 tab、关闭全部 tab、切换 active tab。
- 支持根据文件名加载语言高亮。
- 修改代码后自动保存。
- 二进制文件不能用文本编辑器打开，需要展示提示。

核心文件：

- `src/features/editor/views/editor-view.tsx`
- `src/features/editor/components/code-editor.tsx`
- `src/features/editor/store/use-editor-store.ts`
- `src/features/editor/hooks/use-editor.ts`
- `src/features/projects/hooks/use-files.ts`

数据流：

```text
用户点击文件
  -> useEditor.openFile(projectId, fileId, { pinned })
  -> Zustand 更新 openTabs / activeTabId / previewTabId
  -> EditorView 通过 activeTabId 查询 useFile
  -> CodeEditor 用 activeFile.content 初始化 CodeMirror
  -> 用户输入触发 CodeMirror updateListener
  -> EditorView debounce 1500ms
  -> useUpdateFile 调 Convex mutation
  -> Convex 更新 files.content 和 updatedAt
  -> 订阅该文件/项目文件的 UI 自动刷新
```

面试重点：

这里没有把编辑器内容放到 React state 里逐字更新，而是让 CodeMirror 管自己的编辑状态，只在文档变更时通过回调做防抖保存，降低 React 重渲染压力。

### 4.5 AI 代码补全 Suggestion

需求：

- 用户在编辑器中输入或移动光标后，延迟请求 AI 代码建议。
- 建议以 ghost text 形式显示在光标后。
- 用户按 Tab 接受建议。
- 如果用户继续输入，需要取消上一次请求。
- 如果下文已经有代码或当前语句已经完整，就不返回建议。

核心文件：

- `src/features/editor/extensions/suggestion/index.ts`
- `src/features/editor/extensions/suggestion/fetcher.ts`
- `src/app/api/suggestion/route.ts`

数据流：

```text
CodeMirror docChanged / selectionSet
  -> ViewPlugin 收集上下文
  -> debounce 700ms
  -> POST /api/suggestion
  -> API Route 校验 Clerk 登录
  -> DeepSeek 生成结构化输出 { suggestion }
  -> dispatch setSuggestionEffect
  -> StateField 保存 suggestion
  -> Decoration.widget 渲染 ghost text
  -> Tab 插入 suggestion 并清空状态
```

### 4.6 快速编辑 Quick Edit

需求：

- 用户选中代码后显示选区工具条。
- 可以把选中代码添加到 AI 对话输入框。
- 可以对选中代码执行 Quick Edit。
- Quick Edit 支持用户输入指令。
- 如果指令中包含 URL，会用 Firecrawl 抓取文档作为上下文。
- AI 只返回被选中代码的替换结果。

核心文件：

- `src/features/editor/extensions/selection-tooltip.ts`
- `src/features/editor/extensions/quick-edit/index.ts`
- `src/app/api/quick-edit/route.ts`
- `src/lib/firecrawl.ts`

数据流：

```text
用户选中代码
  -> selectionTooltip 显示 Add to Chat / Quick Edit
  -> 点击 Quick Edit 或 ctrl+K
  -> dispatch showQuickEditEffect(true)
  -> quickEditTooltipField 创建输入框
  -> 用户输入编辑指令并提交
  -> POST /api/quick-edit
  -> API Route 校验登录
  -> 从指令里提取 URL，必要时 Firecrawl 抓文档
  -> DeepSeek 根据 selectedCode + fullCode + instruction 生成 editedCode
  -> CodeMirror dispatch changes 替换选区
  -> 普通编辑保存链路继续把新内容写回 Convex
```

### 4.7 AI 对话与代码 Agent

需求：

- 每个项目可以有多个 conversation。
- 默认打开最新 conversation。
- 用户发送消息后，前端要立即看到用户消息和 assistant 的 processing 状态。
- 同一个项目同时只允许一个 AI 消息处理中；新消息会取消旧任务。
- 支持用户手动取消正在处理的消息。
- AI 可以读取项目文件、创建文件、创建文件夹、更新文件、重命名、删除文件、抓取 URL。
- 第一次对话自动生成标题。
- AI 回复完成后更新消息内容和状态。

核心数据：

- `conversations.projectId`
- `conversations.title`
- `conversations.updatedAt`
- `messages.conversationId`
- `messages.projectId`
- `messages.role`
- `messages.content`
- `messages.status`

核心文件：

- `src/features/conversations/components/conversation-sidebar.tsx`
- `src/app/api/messages/route.ts`
- `src/app/api/messages/cancel/route.ts`
- `src/features/conversations/inngest/process-message.ts`
- `src/features/conversations/inngest/tools/*`
- `convex/conversations.ts`
- `convex/system.ts`

发送消息数据流：

```text
用户在 ConversationSidebar 输入消息
  -> POST /api/messages
  -> Clerk 校验登录
  -> 用 internalKey 查询 conversation
  -> 查询当前 project 下 processing messages
  -> 如有旧任务，发送 message/cancel 并把旧消息置为 cancelled
  -> Convex 创建 user message
  -> Convex 创建 assistant message，占位 status=processing
  -> Inngest 发送 message/sent 事件
  -> 前端 useMessages 订阅 messages，立即显示 Thinking...
```

后台 Agent 数据流：

```text
Inngest process-message 收到 message/sent
  -> step: 获取 conversation
  -> step: 获取最近 10 条 messages 作为上下文
  -> 如是默认标题，调用 title-generator 生成标题并写回 Convex
  -> 创建 codingAgent，挂载文件工具
  -> createNetwork 循环执行 Agent
  -> Agent 需要改文件时调用工具
  -> 工具通过 convex system mutation 更新 files
  -> Convex 实时同步，文件树/编辑器/预览都能收到变化
  -> Agent 最终输出文本
  -> updateMessageContent 写入 assistant message，status=completed
```

取消消息数据流：

```text
用户点击停止
  -> POST /api/messages/cancel
  -> 查询 project 下 processing messages
  -> 对每条发送 Inngest message/cancel
  -> updateMessageStatus(messageId, "cancelled")
  -> process-message cancelOn 匹配 messageId 后中断后台任务
```

面试重点：

AI 回复不是直接在请求里同步完成，而是先写入一条 processing 消息，再丢给 Inngest 后台执行。这样 API Route 很快返回，长任务有重试、取消、失败处理和 step 级持久化。

### 4.8 浏览器运行预览

需求：

- 用户可以切换到 Preview 运行当前项目。
- WebContainer 启动后挂载 Convex 中的文件树。
- 默认执行 `npm install` 和 `npm run dev`。
- 支持项目设置自定义 install/dev 命令。
- 展示终端输出。
- dev server ready 后用 iframe 展示预览页面。
- 文件内容变化后同步写入 WebContainer，实现热更新。
- 支持重启容器。

核心文件：

- `src/features/preview/views/preview-view.tsx`
- `src/features/preview/hooks/use-webcontainer.ts`
- `src/features/preview/utils/file-tree.ts`
- `src/features/preview/components/preview-terminal.tsx`
- `src/features/preview/components/preview-settings-popover.tsx`

数据流：

```text
用户进入 Preview
  -> useProject 获取项目 settings
  -> useFiles 订阅项目全部文件
  -> WebContainer.boot
  -> buildFileTree(files)
  -> container.mount(fileTree)
  -> container.spawn(installCommand)
  -> terminalOutput 持续追加安装日志
  -> container.spawn(devCommand)
  -> container.on("server-ready") 获取 previewUrl
  -> iframe src=previewUrl
```

文件热更新数据流：

```text
编辑器保存文件到 Convex
  -> useFiles(projectId) 收到实时更新
  -> useWebContainer 在 running 状态下遍历文本文件
  -> container.fs.writeFile(filePath, file.content)
  -> dev server 自己完成热更新
```

### 4.9 GitHub 导入

需求：

- 用户可以输入 GitHub repo URL 导入项目。
- 需要通过 Clerk 获取用户 GitHub OAuth token。
- 创建一个 importStatus=importing 的项目。
- 后台任务拉取 GitHub tree。
- 先创建文件夹，再创建文件。
- 文本文件写入 `content`。
- 二进制文件上传到 Convex Storage，文件记录保存 `storageId`。
- 导入成功后状态为 completed，失败为 failed。

核心文件：

- `src/features/projects/components/import-github-dialog.tsx`
- `src/app/api/github/import/route.ts`
- `src/features/projects/inngest/import-github-repo.ts`
- `convex/system.ts`

数据流：

```text
用户提交 GitHub URL
  -> POST /api/github/import
  -> Clerk 校验登录
  -> clerkClient 获取 github OAuth token
  -> parse owner/repo
  -> system.createProject(importStatus=importing)
  -> Inngest 发送 github/import.repo
  -> 后台用 Octokit 获取 git tree
  -> cleanup 项目旧文件
  -> 按路径深度创建 folders
  -> 遍历 blobs
  -> binary: generateUploadUrl -> 上传 Convex Storage -> createBinaryFile
  -> text: createFile(content)
  -> updateImportStatus(completed)
```

### 4.10 GitHub 导出

需求：

- 用户可以把当前项目导出成新的 GitHub 仓库。
- 支持 public/private。
- 支持填写描述。
- 导出期间记录 exportStatus。
- 支持取消导出。
- 导出成功后保存 GitHub 仓库 URL。

核心文件：

- `src/features/projects/components/export-popover.tsx`
- `src/app/api/github/export/route.ts`
- `src/app/api/github/export/cancel/route.ts`
- `src/app/api/github/export/reset/route.ts`
- `src/features/projects/inngest/export-to-github.ts`

数据流：

```text
用户提交导出表单
  -> POST /api/github/export
  -> Clerk 校验登录
  -> 获取 GitHub OAuth token
  -> Inngest 发送 github/export.repo
  -> 后台 updateExportStatus(exporting)
  -> Octokit 创建 GitHub repo(auto_init)
  -> 获取初始 main commit
  -> getProjectFilesWithUrls 读取所有文件和二进制 URL
  -> 递归构建完整路径
  -> 对每个文件 createBlob
  -> createTree
  -> createCommit，parent 指向初始 commit
  -> updateRef heads/main
  -> updateExportStatus(completed, repoUrl)
```

### 4.11 错误处理与状态反馈

需求：

- 用户未登录返回 401/403。
- 缺少服务端 key 返回 500。
- 表单数据用 zod 校验。
- AI / GitHub / 预览等异步任务需要 loading、processing、failed、cancelled 等状态。
- Inngest 任务失败时要把状态写回 Convex。
- Sentry 捕获前端、服务端、Inngest 错误。

核心状态：

- `importStatus`: `importing | completed | failed`
- `exportStatus`: `exporting | completed | failed | cancelled`
- `messages.status`: `processing | completed | cancelled`
- `useWebContainer.status`: `idle | booting | installing | running | error`

## 5. Convex 数据模型

### 5.1 projects

项目表。每条记录代表一个用户项目。

字段：

- `name`: 项目名。
- `ownerId`: Clerk 用户 ID，用于权限隔离。
- `updatedAt`: 最近更新时间。
- `importStatus`: GitHub 导入状态。
- `exportStatus`: GitHub 导出状态。
- `exportRepoUrl`: 导出成功后的仓库地址。
- `settings`: 预览运行设置。

索引：

- `by_owner(ownerId)`: 查询当前用户的项目列表。

### 5.2 files

文件表。文件和文件夹都存在这里，用 `type` 区分。

字段：

- `projectId`: 所属项目。
- `parentId`: 父文件夹，根目录为空。
- `name`: 文件或文件夹名。
- `type`: `file | folder`。
- `content`: 文本文件内容。
- `storageId`: 二进制文件在 Convex Storage 的 ID。
- `updatedAt`: 更新时间。

索引：

- `by_project(projectId)`: 获取项目全部文件。
- `by_parent(parentId)`: 按父节点查。
- `by_project_parent(projectId, parentId)`: 获取某个项目某个目录下的直接子节点。

### 5.3 conversations

对话表。每个项目可以有多轮独立对话。

字段：

- `projectId`: 所属项目。
- `title`: 对话标题。
- `updatedAt`: 最近更新时间。

索引：

- `by_project(projectId)`: 查询项目下全部对话。

### 5.4 messages

消息表。保存用户消息和 AI 回复。

字段：

- `conversationId`: 所属对话。
- `projectId`: 冗余项目 ID，方便按项目查 processing 消息。
- `role`: `user | assistant`。
- `content`: 消息内容。
- `status`: assistant 消息的处理状态。

索引：

- `by_conversation(conversationId)`: 查询对话消息列表。
- `by_project_status(projectId, status)`: 查询某项目正在处理的消息。

## 6. 全局数据流总图

```text
Clerk
  -> 登录态
  -> Next Provider
  -> ConvexProviderWithClerk
  -> Convex query/mutation 自动带身份

普通 UI 操作
  -> React Client Component
  -> custom hooks(useQuery/useMutation)
  -> Convex query/mutation
  -> Convex DB
  -> 实时订阅刷新 UI

长任务操作
  -> React Client Component
  -> Next API Route
  -> Clerk auth + zod validate
  -> Inngest event
  -> Inngest function steps
  -> Convex system query/mutation
  -> Convex DB
  -> 实时订阅刷新 UI

编辑器操作
  -> CodeMirror internal state
  -> debounce/onChange
  -> Convex updateFile
  -> 文件订阅刷新
  -> WebContainer 同步写入文件系统
  -> iframe 热更新
```

## 7. 面试高频追问

### 为什么用 Convex？

因为项目大量依赖实时数据：文件树、消息列表、项目状态、导入导出状态都需要在后台任务写入后自动刷新。Convex 的 `useQuery` 订阅 query 结果，mutation 修改相关数据后，订阅会自动重跑，减少手写轮询和缓存失效逻辑。

### 为什么不用普通 API 直接处理 AI 请求？

AI Agent 可能需要多轮工具调用、读写文件、抓网页、失败重试、取消任务。同步 API Route 容易超时，也不好恢复。Inngest 把长任务拆成 step，事件先持久化，失败可以重试，也可以通过 `cancelOn` 中断指定任务。

### 为什么 messages 里冗余 `projectId`？

主要为了快速查某个项目下正在处理的 assistant 消息。取消旧任务和发送新消息前，都需要按 `projectId + status` 查 processing 消息。如果只存 `conversationId`，就要先查项目下所有 conversation，再查消息，复杂度更高。

### 文件树为什么用 `parentId`，而不是直接存 path？

`parentId` 更适合树结构的增删改查：移动、重命名父文件夹时，不需要批量改所有子路径。导入导出时需要完整路径，可以临时通过父链递归计算。

### 为什么区分 `content` 和 `storageId`？

文本文件可以直接存在数据库字段里，方便编辑器读取和 AI 修改。图片、字体、wasm 等二进制文件不适合放 JSON 文本字段，所以上传到 Convex Storage，只在 files 表里保存 `storageId`。

### WebContainer 的文件从哪里来？

从 Convex 的 `files` 表来。`useFiles(projectId)` 拿到项目全部文件，`buildFileTree` 转成 WebContainer 需要的嵌套文件树，然后 `container.mount(fileTree)` 挂载。

### AI 是怎么真正改代码的？

AI Agent 不是直接访问本地文件系统，而是通过 Inngest tools 调用 Convex system mutations。例如 `update-file` 工具拿到 fileId 和 content 后调用 `api.system.updateFile`，最终修改 `files.content`。前端订阅到文件变化后自动刷新编辑器和预览。

### 为什么编辑器 tabs 用 Zustand？

tabs 是纯前端交互状态，不需要持久化到数据库，也会被多个编辑器组件共享。Zustand 比把状态层层传 props 更轻，同时只让使用相关状态的组件更新。

### 为什么 CodeMirror 补全用 StateField / ViewPlugin？

CodeMirror 6 的核心是不可变 `EditorState` 和 `Transaction`。补全文本属于编辑器内部 UI 状态，使用 `StateField` 保存 suggestion，用 `Decoration.widget` 渲染 ghost text；请求、防抖和取消这类副作用更适合放在 `ViewPlugin`。

### GitHub 导入为什么先创建文件夹？

文件记录只有 `parentId`，创建子文件时必须知道父文件夹的 Convex ID。所以导入时先把 GitHub tree 里的文件夹按路径深度排序，先创建浅层父目录，再创建深层子目录和文件。

### GitHub 导出为什么要 createBlob -> createTree -> createCommit -> updateRef？

这是 Git 底层对象模型。文件内容先变成 blob，多文件路径组合成 tree，再基于 tree 创建 commit，最后把分支引用 `heads/main` 指向这个 commit。

## 8. 可以继续完善的点

- 文件移动功能：目前有创建、重命名、删除，但没有拖拽移动。
- 协同编辑：目前是单用户实时刷新，没有多人光标和冲突处理。
- 大文件优化：文本内容存在数据库字段里，超大文件需要分片或限制。
- Agent 权限边界：可以增加工具级权限确认，比如删除多个文件前要求用户确认。
- 预览增量同步：当前 running 后遍历文本文件写入，后续可以只同步变更文件。
- 消息流式输出：目前 assistant 最终一次性写入内容，可以改成 token 级增量更新。
