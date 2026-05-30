# database setup

```
项目初始化 -> 配置clerk登录认证 -> 配置convex数据库 -> 使用clerk给convex添加身份验证功能
```
## Canvex

Convex 是一个 **面向文档的数据模型 + 支持关系查询能力的数据库**。文档意味着数据库中的每条记录像json，关系意味着表与表之间可以通过字段关联

canvex最重要的功能是同步，意思是如果表中的数据发生了改变，那么订阅了该表的查询函数自动运行更新应用中的数据

同步功能的流程可以概括为：useQuery查询了某一个数据表示**订阅某个 Query Function 的结果**。那么使用useMutation**导致该Quyer Function的结果发生变化**后，useQuery自动运行，然后React刷新ui

**为什么useMutation运行后，convex知道该运行哪个useQuery？**
每个 query 运行时，**Convex 会记录**它读取过哪些数据。当 mutation 修改数据时，系统拿修改范围和依赖记录一比对，就知道哪些 query 结果可能变了，需要重跑。

# background jobs

## Inngest

inngest是一个**事件驱动的后台任务/工作流编排平台**，只是**协调代码执行任务**，集成了**持久化函数执行**、**事件驱动架构**以及**任务队列**

用于将**耗时、异步、定时、多步骤任务**从前端请求拆解出去，在后台可靠执行。主要解决的是在**serverless环境**下如何可靠执行后台任务，也就是长任务执行、多步骤流程、定时、重试还有异步任务

---

**Serverless**指的是无服务器架构，其实不是没有服务器，只是**无需管理服务器**，开发者只需要关注代码怎么写就好。

**Serverless**通常由两部分构成：

**FaaS (Function as a Service - 函数即服务)**

这是 Serverless 的核心。你编写一段逻辑代码（一个函数），比如“图片缩放”或“处理登录”，然后上传。

- **触发机制：** 代码不会主动运行，而是由**事件驱动**。比如用户上传了照片、收到了 HTTP 请求、或者是定时任务触发。

**BaaS (Backend as a Service - 后端即服务)**

如果你的代码是“大脑”，BaaS 就是“器官”。为了让函数保持轻量，你将非业务逻辑的功能外包给成熟的第三方云服务。

- **常见服务：** 身份认证（Clerk, Auth0）、数据库（Convex, MongoDB Atlas）、存储（S3）、消息队列。

---

工作流程可以概括为：

- inngest.send发送**事件**，发送后并不是立即执行代码

- 而是进入inngest cloud，在inngest cloud里

	- **首先**接收并且**存储事件**，找到哪些**函数监听**这个事件，为**每个 Function 创建 Run 实例**

	- **然后**创建执行任务，向router handle发送请求，请求再下发，执行对应的**任务**，并且把run信息发送过去

- 执行step，同时**inngest cloud跟踪**step状态，失败时重试，完成时记录

	- 到step时，首先检查此 step 是否执行过，如果没有执行过，那么执行callback，保存结果到inngest，返回结果

	- 如果某个步骤失败，inngest会记录，这也是**持久化执行**的原因

```
1. inngest.send(event) 发送事件
2. Cloud 持久化事件并匹配监听函数
3. 为每个函数创建 Run 实例
4. 调度调用 /api/inngest endpoint
5. 按 step.run 分步执行
6. 每一步结果持久化
7. 失败自动重试
8. 从失败步骤恢复，而非重头执行
```

# firecrawl scrape

## firecrawl

firecrawl是一个面向ai的web数据采集平台，它将传统爬虫、网页抓取、站点遍历、动态网页操作这些复杂能力，封装成简单 API，让开发者能快速把互联网内容变成 **LLM 可直接使用的数据**（Markdown / JSON / HTML）。

对于传统爬虫来说，需要请求网页，解析 HTML，处理 JS 渲染页面，登录态，反爬机制，多页面抓取，数据清洗，输出结构化内容，这些firecrawl以及做好了，直接调用api即可使用，是**非常非常非常的方便**

# error tracking

## sentry

sentry可以在**生产环境**下进行了错误跟踪，也是**非常非常非常好用**，可以具体到哪个文件哪一行代码报错，还有错误回放功能，可以看到页面报错的前一段时间，用户做了什么

同时sentry还有一个agents功能，和vercel的ai-sdk集成在一起，可以看到用户使用了哪个模型、消耗了多少token，问了什么问题，模型给出的结果是什么，也是非常非常的好用。

同时inngest还有sentry middleware中间件，可以捕获异常并报告、还可以对每个函数添加追踪。

**运行流程可以概括为：** **首先**Sentry.init注册了全局错误监听，并且与远端sentry服务器连接；**然后**发生错误时，sentry sdk自动捕获错误，运行`Sentry.captureException(error)`，并且收集上下文信息，将context打包为json发送给sentry 服务器。

在不用环境的运行方式也不同，在**浏览器环境**下：监听 `window.onerror`，监听 Promise 错误，记录用户行为（点击、路由）。在**服务器环境**下：捕获接口异常、数据库错误、业务逻辑错误。在**severless/inngest环境**下：哪个 step 出错、输入参数、- 执行路径

```
[代码]
     ↓
[Sentry SDK]
     ↓
[事件收集 + 上下文]
     ↓
[HTTP上报]
     ↓
[Sentry服务端]
     ↓
[错误分析 + UI]
```

# design skills

## shadcn

## frontend-design

# projects

设计project install，包括新建项目、从github导入项目、current proejct、project list

在convex\project文件内，新增create mutation函数

# ide layout


# file explorer

创建了`files table`和`file server function`

**file server function：**
```
getFiles 获取一个项目下所有文件

getFile 获取对应id的文件

getFolderContents 获取一个文件夹里的内容，可以是root下，也可以是文件夹下，结果排序文件夹、文件，每组内按字母顺序排列

createFile 创建文件

createFolder 创建文件夹

renameFile 重命名文件/文件夹

deleteFile 删除文件/文件夹，递归删除所有子元素，判断如果是文件夹，递归调用

updateFile 更新文件/文件夹内容
```

搭建了一下ui，例如创建文件、创建文件夹、关闭所有文件夹按钮

创建文件夹/创建文件，点击后，项目文件夹展开，展示创建文件夹/文件组件，确认后展示tree组件

合上所有文件夹原理（key重置组件状态技巧）：

 *  将collapseKey传递给tree的key，当collapseKey变化时，react会视作为所有tree发生变化

 *  那么将会销毁所有tree组件，然后重新创建tree组件

 *  重新挂载tree组件时，因为isOpne default value 是false

 *  因此会合上所有的tree组件

tree组件，有isOpen 是否打开state；isRenaming 是否正在重命名state；creating 是否在创建state，根据不同的状态渲染不同的component

同时也根据不同的item type 决定展示folder or file

# code editor

## zustand

使用zustand进行 编辑器 状态管理，zustand是一个ts友好的高性能的react state管理库

> 它的核心目标是：用极少的代码，创建一个**全局状态**，所有组件**按需更新**

也是非常非常的好用，用来**管理全局状态**的，不再进行不必要的渲染

在react之外开辟一块空间存储状态，也就是外部存储

**运行流程大致是：** 使用create函数创建store，zustand内部会维护`state和订阅者`，然后返回一个hook；如果组件内部调用了该hook，获取了state，那么就将该组件注册为订阅者；调用**set更新函数**修改state之后，就会通知订阅者，然后react重新渲染。

在本项目内部使用了zustand管理editor状态。

```
tabs也就是editor状态，使用Map创建的对象，有三个属性。

openTabs当前项目中所有已打开的文件 ID 列表，activeTabId当前激活的标签页，previewTabId预览模式的标签页，也就是临时标签页，可以被替换的。

editor store中有五个处理函数。

getTabState获得tabs状态。

openfile处理打开时的state更新，但存在三种打开方式，第一种作为预览打开，替换现有预览或者添加新的预览；第二种作为固定打开，直接添加到openTabs中；第三种是file已经打开，那么只需要激活

closeTab处理关闭当前标签页

closeAllTabs处理关闭所有标签页

setActiveTab设置当前激活的标签页
```

## codemirror

CodeMirror 是一个 **浏览器中的代码编辑器组件**，专门让网页具备像 VS Code 那样的代码输入体验。

codemirror6的设计思路非常前沿，类似于react，采用state 和 view 分离，transaction驱动更新，几乎所有的功能都是通过extension集成

codemirror 维护着自己的状态，比如光标位置、文档内容，但有的时候我们需要自定义额外状态，这时候需要stateField，`stateField.define`就是在开辟一个空间存储我们自定义额外状态

**核心概念：**`immutable state`和`transaction`，将编辑器的状态视为不可变的，每次更改返回新的状态，这与react很类似。`transaction`就是状态变化的“描述对象”，也就是本次操作所产生的信息包，例如：每次用户操作（打字、选中、按键）都会产生一个或多个事务，事物是codemirror最小变更单位

**整个系统的数据流：**
```
用户输入
   ↓
dispatch(transactionSpec)  派发一个事务
   ↓
生成 Transaction
   ↓
旧 State 应用 Transaction
   ↓
生成新 State
   ↓
所有 StateField 更新
   ↓
View diff DOM
   ↓
局部更新页面
```

**codemirror extension的生命周期：**

codemirror 严格区分了state和view，因此生命周期也要分state和view

**初始化与挂载：**
``` 
state：
当编辑器state被创建时，codemirror会首先调用state.field的create函数，返回该字段的初始值
```
``` js
const myStateField = StateField.define({
  create(state) {
    console.log("1. State 挂载：初始化数据");
    return { count: 0, active: false }; // 返回初始状态
  },
  // ...
});
```
```
view：
当state创建完毕并绑定editorState时，编辑器 View 实例挂载到 DOM 上，负责ui的viewPlugin开始挂载
```
``` ts
const myViewPlugin = ViewPlugin.fromClass(class {
  constructor(view:EditorView) {
    console.log("2. View 挂载：可以在这里创建 DOM 节点");
    this.dom = document.createElement("div");
    // 此时可以通过 view.state 读取上面 create 产生的初始状态
  }
});
```

**更新循环：**

任何用户的输入、API 调用或外部事件都会派发一个**事务（Transaction）**，从而触发更新循环。

```
state：
每次调用 view.dispatch(tr) 时，会执行 StateField.update，接收一个oldstate和transaction
```
``` js
update(oldValue, tr) {
    console.log("3. State 更新：事务到来");
    
    // 如果文档没有改变，且没有相关的 Effect，直接返回旧值以优化性能
    if (!tr.docChanged && !tr.effects.length) return oldValue;

    // 否则，计算并返回全新的状态对象 (不可变数据)
    return { ...oldValue, count: oldValue.count + 1 };
  }
```
```
view:
State 更新完毕后，CM6 会将旧 State、新 State 和事务打包成一个 ViewUpdate 对象，传递给所有的 View 插件。
```
``` ts
update(update:ViewUpdate) {
    // 高效判断：只有当我的特定 StateField 发生变化时，才操作 DOM
    if (update.state.field(myStateField) !== update.startState.field(myStateField)) {
       console.log("4. View 更新：发现数据变化，准备更新 DOM 或重绘");
       const newData = update.state.field(myStateField);
       this.dom.textContent = `Count: ${newData.count}`;
    }
  }
```

**销毁与卸载：**
```
view：
ViewPlugin.destroy，清理在 constructor 或 update 中创建的外部资源（如 setTimeout、setInterval、外部事件监听器 window.addEventListener 等）。
```

# ai features

## codemirror

在codemirror中自定义扩展，stateField用来存储插件状态，stateEffect是修改插件状态的命令，viewPlugin是在视图层面更新/操作DOM，facet提供配置

**`StateEffect` 是修改 `StateField` 的标准途径**。

`stateEffect`意思是用来通知`transaction`附带做什么**额外状态**操作。

`StateEffect` 发命令，`StateField` 接命令并更新状态。

```
1. 定义 Effect 类型（静态）
2. 在需要时 dispatch（发送）一个 Effect
3. StateField 的 update 方法监听并处理 Effect，通过transaction.effect
```

**实现幽灵文本插件：**
```
状态管理层：
用 StateField 在编辑器状态中开辟了一块存储空间，通过 StateEffect 来更新这个状态。当 API 返回结果后，用 dispatch 分发效果，状态就更新了。
渲染层：
自定义了一个 WidgetType 组件，它会创建一个半透明的 <span> 元素。然后用 Decoration.widget 把这个组件挂载到光标位置，side: 1 表示在光标之后渲染。
触发层：
用 ViewPlugin 监听编辑器的 update 事件。当文档变化或光标移动时，触发 generatePayload 构建上下文（包括当前代码、光标位置、上下五行等），然后防抖 300ms 后调用 AI 接口。
接受层：
通过 keymap 拦截 Tab 按键。如果有建议，就 dispatch 一个事务：插入文本、移动光标、清空状态
```

**Prompt Design**
```
You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:
1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.
2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.
3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.
Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
</instructions>
```

**执行流程：**
```
用户输入/光标移动后

触发 createDebouncePlugin.update 函数

调用 createDebouncePlugin.triggerSuggestion 函数

如果用户 xxx 时间内没有操作，则发送请求

拿到响应后，dispatch 一个 effect ，也就是改变 setSuggestionEffect 的 value

同时会调用 suggestionState.update 函数，更改 suggestionState 的 value

这时才到 renderPlugin 发生作用，虽然 renderPlugin 在 view 变化时触发，但是做了一些信号操作

当不在请求也就是拿到响应并且 suggestionState 存在时，才会在当前光标位置创建一个 widget decoration

真正的 DOM 由 SuggestionWidget 创建，SuggestionWidget 继承 WidgetType，这是在编辑器中创建 DOM 的标准方法

最后，tab 键接受
```

> **终止请求怎么实现的？**

```
AbortController Web API 用于手动取消一个或多个异步操作（通常用于取消fetch请求）

AbortController 实例，有一个 abort() 方法，负责发出取消信号

AbortSignal 对象：信号源，通过 controller.signal 获取
需要把这个信号传递给想要控制的异步操作（比如 fetch），让它时刻监听取消指令。

```

**代码示例：**
``` ts
// 1. 创建一个控制器实例
const controller = new AbortController();
const { signal } = controller; // 结构出其中的 signal

// 2. 发起 fetch 请求，并传入 signal
fetch('https://api.example.com/data', { signal })
  .then(response => response.json())
  .then(data => console.log("获取成功:", data))
  .catch(error => {
    // 3. 捕获取消异常
    if (error.name === 'AbortError') {
      console.log('请求已被手动取消！');
    } else {
      console.error('发生了其他网络错误:', error);
    }
  });

// 4. 在需要的时候（例如用户点击了取消按钮，或者页面销毁时）触发取消
// 模拟 500ms 后用户失去了耐心，取消请求
setTimeout(() => {
  controller.abort(); 
}, 500);
```

还可以实现 `一个控制器取消多个fetch请求`、`可以一次性移除一堆事件监听器`

`AbortSignal.timeout()` (超时自动取消)

---

> **实现快速编辑插件：**

在codemirror创建跟随光标移动的悬浮提示时，`codemirror官方`推荐使用`Tooltip`扩展

**快速编辑插件执行过程：**
```
用户按ctrl + k，CodeMirror 遍历 keymap，找到 quickEditKeymap 匹配

选区为空 → return false（不处理）

选区有内容 → view.dispatch(effects: showQuickEditEffect.of(true))

quickEditState.update先执行，更改状态为 effect.value，也就是ture

quickEditTooltipField.update()后执行，调用 createQuickEditTooltip 函数返回 tooltip

当 quickEditTooltipField 变化时，通知 showTooltip 重新渲染，显示悬浮提示框

执行顺序：按注册顺序执行(每次产生transaction时)
1. quickEditState.update() 先运行，发现 showQuickEditEffect → 返回 false
2. quickEditTooltipField.update() 后运行，发现 showQuickEditEffect → 重新创建 tooltip 并返回空数组（因为 isQuickEditActive 变为 false）
```

**注意：**
```
每次 dispatch 一个 transaction 时，会按 StateField 注册顺序执行 update 函数

也就是先执行 quickEditState，更改当前 transaction.state 中 quickEditState 结果

再执行 quickEditTooltipField，quickEditTooltipField 变化时通知 showTooltip 重新渲染 tooltip
```

**Prompt Design**
```
You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>
{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>
```
## cursor

**cursor的架构可以从四个方面理解：**

客户端层：负责监听用户的输入，渲染ui

上下文引擎：负责收集ai需要知道的背景信息

云端网关：负责鉴权和prompt的优化

模型层：根据不同的任务，请求路由到不同的llm

### Chat 的底层原理

> **代码库索引**，也就是cursor是怎么知道项目长什么样的？

- **ast解析**，也就是用 Tree-sitter将项目代码转为ast抽象语法树，提取出变量、类、函数的定义，这样就知道这个方法属于哪个对象或类，这不就js的v8引擎中ast那一部分吗。

- **代码分块**，并不会将整个项目的上下文喂给ai，而是用分块机制，即一个函数、一个类就是一个块。

- **向量化**，代码块通过 Embedding 模型转化为多维向量，存入本地的向量数据库中

	- 什么是Embedding？Embedding就是将一段代码翻译为一串数字/数组，两段功能接近的代码，数字/坐标越接近。

		- **作用：** 解决了传统语义上搜索代码的缺陷，只要功能相同，哪怕语义上每个单词都不一样，坐标也会很接近

	- 什么是向量数据库？整个项目的代码切成了成千上万个小块，并且都算出了它们的“坐标（向量），那么就需要将坐标存起来。

		- **向量数据库的作用：**  专门用来存储这些“长数组”，并且极其擅长做一件事：**计算相似度（通常用“余弦相似度 Cosine Similarity”算法）**。

		- **本地向量数据库：** 通常的做法是在本地建一个 SQLite 数据库，并加上类似 `sqlite-vec` 这样的底层 C 语言扩展，让本地 SQLite 拥有计算向量距离的能力)


> **混合检索**，也就是当提问时，cursor的上下文引擎如何工作的

- **语义检索 ：** 把提问的问题变成向量，去向量数据库里找余弦相似度最高的代码块。

- **字面检索：** 结合传统的关键词搜索（找代码里包含 "login", "user" 的文件）。

- **LSP 集成寻路：** 这是 Cursor 极其聪明的一点。如果提到了 `UserService`，Cursor 会通过 IDE 底层的语言服务器（LSP）直接找到 `UserService` 的定义文件，将其强行加入上下文。

> 其实核心的是**LSP + AST + 向量搜索**，这样就能拿到很准确的信息。

### 实时补全的底层原理

**FIM 机制：** 意思是模型在训练时，给它前几行的代码，给它后几行的代码，让他生成当前行的代码，就是FIM

**Speculative Decoding 投机解码机制：** 它会先用一个极其轻量、速度极快的模型迅速“猜”出一段代码，然后再用稍微聪明一点的模型去“验证”这段代码。如果猜对了，就直接打包推给客户端，**长见识了md，但是为什么这么块？？**

**本地微型上下文：** 为了快，Tab 补全不能去检索整个大项目。它只收集极少量的**强相关上下文**。例如：当前光标附近1000行代码、最近编辑过的几个文件

# conversation system

## ai element

`ai element` 是一个基于 `shadcn/ui` 构建的组件库，内部封装了很多用于构建 ai 原生应用的组件，例如：对话、消息，开箱即用，还与 `vercel ai sdk` 深度集成，不用处理sse、md还有语音输入等，内部已经封装好了，也是**非常非常好用**

`ai sdk` 为 ai 提供交互基础，例如流式传输、多模态、工具调用

`ai element` 为 `ai sdk` 提供了 ui 层

完整流程：

1. **用户输入** AI Elements `PromptInput`

2. **React 钩子** (`useChat`) 将消息发送到您的 API 路由

3. **AI SDK** 通过 AI Gateway 从模型流式传输响应

4. **AI 元素**在 `MessageResponse` 中渲染流式响应

每一层负责其职责：

|层|职责|
|---|---|
|AI 网关|模型访问、缓存、可观察性|
|AI SDK|流媒体、钩子、服务器集成|
|AI 元素|UI 组件、主题定制、无障碍访问|

**示例：**
``` js
"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = (message: { text: string }) => {
    sendMessage({ text: message.text });
  };

  return (
    <div className="h-screen flex flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <MessageResponse key={i}>{part.text}</MessageResponse>
                  ) : null
                )}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <PromptInputProvider>
        <PromptInput onSubmit={handleSubmit} className="p-4">
          <PromptInputBody>
            <PromptInputTextarea placeholder="Type a message..." />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  );
}
```

# ai agent tools

## agentkit

`agentkit`是一个typescript支持的轻量ai框架，是为了构建从单一模型调用到多agent系统的ai应用，本质是对`model+tools`的封装，很多内容都是对model的服务

`agentkit`可以与`inngest`结合

**核心概念：** 

- agent，指的是一个有角色、有系统提示词、可以调用工具的执行单元
- tools，工具，指的是可以让模型安全的调用你的代码，例如可以操作数据库
- network，可以把多agent整合成一个可以工作的系统
- state，可以让agent、tools、router之间共享短期上下文
- router，注意：基于代码的路由，可以更清晰的知道下一步是调用agent还是返回undefined结束router

**AgentKit工作流程：**

1. **初始化输入**
	 当一个任务开始时，系统会接收用户的初始输入，并初始化`Network`的全局`State`
	 
2. **路由判定**
	 Network 启动后，首先调用 `router` 函数
	 
	- Router 可以访问到当前完整的 `State` 以及历史消息。
	- **代码控制：** 可以使用标准的 `if/else` 或 `switch` 语句进行判断。例如：“如果 `State.data.code` 为空，则调用 `coderAgent`；如果代码已生成但未通过安全审计，则调用 `securityAgent`”
	- **LLM控制：** 将路由权交给一个负责调度的 LLM（如 ReAct 模式）。
	
3. **Agent 执行与工具调用**
	 被 Router 选中的 Agent 开始执行。它会根据自己的 System Prompt 和传入的上下文产生决策：
	 
	 - 如果它认为需要调用工具（如读写数据库、运行沙箱代码），它会触发对应的 `Tool`
	 - 在 Tool 的 handler 函数中，**Agent 拥有对全局 `State` 的读写权限**（通过 `network.state.data`）
	
4. **状态更新**
	 当工具执行完毕或 Agent 输出了阶段性成果，这些数据会被写入 `State`，`State`可以是`NetWork`中所有`Agent`共享短期上下文
	 
5. **循环执行**
	 更新完 `State` 后，Network 会自动进入下一次循环，重新把控制权交给 Router。Router 检查更新后的 `State`，决定是继续让下一个 Agent 顶上，还是认为任务已完成并返回最终结果。

**Tool的生命周期：**

首先将tool注册到createAgent的tools字段

随后执行agent.run()时，agentkit会将prompt、history和tool的description序列化为请求体

模型响应后，agentkit会将模型响应序列化为Message数组

之后agentkit会遍历message数组查看有没有tool_call字段，该字段值为tool的名字

如果存在该字段，则取出对应字段的value，去调用该工具

这里并不是模型调用，模型只是**建议调用**，本质上是agentkit执行

当tool执行完毕后，agenkit会将result封装为tool_result，也就是将结果返回ai

# webcontainers terminal preview

## web api
### SharedArrayBuffer

首先明确一下浏览器中的**进程**和**线程**概念，现在浏览器都是多进程的
```
例如谷歌浏览器，有浏览器进程也就是主进程，负责浏览器页面展示和处理用户交互
渲染进程，负责解析html、css、javascript，浏览器默认为每一个标签页创建一个渲染进程
网络进程，负责发起网络请求，加载所有网络资源
GPU进程，负责3D内容的和页面UI的渲染
插件进程，负责运行插件
```
详细分析一下**渲染进程**，渲染进程是多**线程**的
```
主线程，渲染线程和JS线程共用主进程，因此互斥，负责但不限于渲染线程和JS线程的所有功能，其实渲染线程和JS线程并不是真正的线程，只是将主线程中两个主要的功能拆分出去

	渲染线程，负责渲染页面解析html、css生成dom树和render树
	JS线程，负责运行解析js脚本文件，例如js的v8引擎；注意：渲染线程和JS是互斥的，也就是不能同时执行

事件线程，归属于浏览器而不是v8引擎，负责处理事件循环
计时器线程，负责处理setTimeout和setInterval的计时，因为js是单线程的，如果js线程处于阻塞状态就不能正确计时
异步HTTP请求线程，负责处理XMLHttpRequest和fetch网络请求

注意：当计时器线程和网络线程运行完会将回调函数交给事件线程去排队，等JS线程空闲时再去执行
```
现在也可以解释一下**从输入url到页面展示发生了什么**
```
浏览器进程接收用户输入的url
网络进程向url发起网络请求，下载所需要的资源
之后浏览器进程实例化一个渲染进程负责处理下载后的资源
渲染进程中的渲染线程解析html和css，如果在解析过程中遇到<script>则运行JS线程
JS线程负责解析js脚本文件，如果遇到setTimeout和setInerval则交给计时器线程
如果遇到网络请求则交给网络请求线程
网络请求线程和计时器线程运行结束后将回调函数传给事件线程去排队
之后渲染进程计算出页面像素交给GPU进程渲染UI
```
明确一下 **Web Worker API(浏览器里的多线程方案)** 概念
```
Web Worker是一个独立于渲染进程中主线程之外的后台线程，允许JavaScript脚本文件在后台线程中执行

解决的问题：
Web Worker后台进程线程通常用于处理复杂计算，将结果传回主线程
这样就避免的复杂的JS运算使JS线程执行时间过长，造成页面卡顿

工作机制：
Web Worker 与主线程之间是完全隔离的。它们不能共享内存(除非用SharedArrayBuffer)
唯一的沟通方式就是基于事件的消息传递(数据拷贝)。

主线程创建Worker实例，调用Worker.postMessage发送任务
Worker线程使用onmessage监听主线程发送的任务，主线程也使用onmessage监听Worker执行的结果

注意(限制)：
1. Worker 线程运行的脚本文件，必须与主线程的脚本同源
2. 无法操作 DOM，因为Worker 线程里拿不到 document、window、parent 对象
3. 虽然拿不到 window，但它可以访问 navigator、location，也可以使用 setTimeout、IndexedDB 以及发起 fetch / XMLHttpRequest 网络请求。
   
类别：
Dedicated Worker（专用 Worker）：只能由创建它的那个页面单独使用
Shared Worker（共享 Worker）：可以被多个页面（比如同源的多个标签页、iframe）共享使用。适合用来做多标签页之间的通信或状态共享。
Service Worker（服务 Worker）：它充当了浏览器与网络之间的 代理服务器，可以拦截网络请求、离线缓存资源、处理推送通知。
```
主线程和 Web Worker 之间传递数据主要靠 `postMessage`，它有两种底层机制：

1. **结构化克隆**：把数据复制一份传过去。如果数据量极大（比如几百 MB 的 3D 模型或高清图片），复制操作会极度消耗 CPU 和内存，导致页面卡顿。
    
2. **转移所有权**：不复制，直接把内存控制权移交。但缺点是**原线程就无法再访问这块内存了**。

这样其实并没有真正的实现**多线程计算(比如高画质游戏、音视频实时解码、大语言模型本地运行)**，想要的是Web Worker 必须能够和主线程**同时读写同一块内存**，所以：

**SharedArrayBuffer** 允许开辟一块原始的二进制内存，让多个线程共享

使用方法：**主线程**
``` js
// 1. 创建一个 1024 字节的共享缓冲区
const sab = new SharedArrayBuffer(1024);

// 2. 用 Int32 数组去视图化操作这块内存
const int32Array = new Int32Array(sab);
int32Array[0] = 42; // 在第一个位置写入 42

// 3. 把这个“共享办公桌”的地址发给 Worker
worker.postMessage(sab);
```
**Worker 线程**
``` js
self.onmessage = function (event) {
  // 1. 接收共享缓冲区
  const sab = event.data;
  const int32Array = new Int32Array(sab);
  
  // 2. 直接读取主线程写入的数据
  console.log(int32Array[0]); // 输出 42
  
  // 3. 修改它，主线程也能立刻看到
  int32Array[0] = 99;
};
```

因为是共享内存，所以会有一个经典的并发问题：**数据竞争**，即两个线程**同时修改**同一个内容时怎么办？

为了解决这个问题，JavaScript 引入了 **`Atomics`（原子对象）**，意思是当一个线程在使用 `Atomics` 修改或读取数据时，其他线程必须排队等待

常用的 `Atomics` 方法有：

- `Atomics.store()` / `Atomics.load()`：安全地写入和读取。
    
- `Atomics.add()` / `Atomics.sub()`：安全地进行加减法。
    
- `Atomics.wait()` / `Atomics.notify()`：让线程睡眠和唤醒。比如 Worker 发现数据还没准备好，就先 `wait`（挂起）；主线程把数据写好了，调用 `notify` 唤醒 Worker 

**注意：**

如果想在网页里使用 `SharedArrayBuffer`时，需要设置两个 HTTP 响应头来实现网站的**跨源隔离**：
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

Cross-Origin-Opener-Policy：same-origin
Cross-Origin-Embedder-Policy：credentialless
```

- [`Cross-Origin-Opener-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy) 设置为 `same-origin`（来保护你的源站点免受攻击）
- [`Cross-Origin-Embedder-Policy`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy) 设置为 `require-corp` 或 `credentialless`（保护受害者免受你的源站点的影响）
### [WebAssembly](https://developer.mozilla.org/zh-CN/docs/WebAssembly/Guides/Concepts)

WebAssembly 是一种运行在现代 Web 浏览器中的新型代码，不仅提供新的性能特性，同时还在性能方面有着巨大提升，可以以接近本地速度的方式运行多种语言编写的代码

原先 Web浏览器只能运行 JavaScript代码，但一些好用的库是用 c++、c、rust写的，比如 node是用c++写的，我如果想让node在web浏览器上运行怎么办？可以将其编译为WebAssembly，通过调用 JS API 加载其代码

### [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

Service worker 本质上充当 Web 应用程序、浏览器与网络（可用时）之间的代理服务器。

这个 API 旨在创建有效的离线体验，它会**拦截网络请求**并根据网络是否可用来采取适当的动作、更新来自服务器的资源。
### ReadableStream

类似于一个数据源，用于发送数据

Fetch 返回的 `body` 本质上就是一个 `ReadableStream`
### WritableStream

`WritableStream` 是 Web Streams API 里的“**可写流**”接口：它把“往某个目标持续写入数据”这件事抽象成一个标准对象，这个目标通常叫 **sink**。它自带 **背压（backpressure）** 和 **队列** 机制，所以适合处理一边产生、一边写入的数据。

入口是 `getWriter()`，它会返回一个 `WritableStreamDefaultWriter`。这个 writer 负责真正写入数据，常用的方法有 `write()`、`close()`、`abort()`；另外还有 `ready`、`closed` 这些 Promise/状态属性，可以用来判断是否还在背压中、或者流是否已经关闭。

``` js
const stream = new WritableStream({
  write(chunk) {
    console.log("收到数据:", chunk);
  },
  close() {
    console.log("写入完成");
  },
  abort(err) {
    console.error("写入中止:", err);
  }
});

const writer = stream.getWriter();

await writer.write("hello");
await writer.write(" world");
await writer.close();
```

`write()` 会把 chunk 交给底层 sink 处理，并返回一个 Promise；`close()` 会在把前面的 chunk 都处理完之后关闭流；`abort()` 则会直接把流切到错误状态，并丢弃队列里还没处理的写入。
## webcontainers

`webcontainer` 提供了一种浏览器内`node`环境，可以在浏览器内执行node应用和对应命令
### 核心概念

**虚拟文件系统**

webcontainer在浏览器内存中维护了一个**完全虚拟的文件系统**。

- **挂载 (Mounting)：** 你可以将一个包含文件结构、代码内容的 JavaScript 对象直接“挂载”到 WebContainer 中。
    
- **实时同步：** 浏览器中的代码编辑器（如 Monaco Editor）对文件的修改，会直接映射到这个虚拟文件系统中，供内部的 Node.js 读取。

**进程管理**

WebContainer 允许你在浏览器里**创建和管理进程**。

- 它提供了一个类似 Node.js `child_process.spawn` 的 API，也就是`webcontainerInstance.spawn()` 方法
    
- 你可以执行 `npm install`、`npm run dev` 甚至是运行 `node index.js`。
    
- 这些命令不是发给远程服务器执行的，而是由浏览器中的 JavaScript 引擎直接解释并执行。

	- Node.js核心被WebContainer编译成WebAssembly搬到浏览器上，浏览器的 **V8 引擎**直接去跑这个工具

> `webcontainer`在底层用到了`web worker`，一种浏览器的多线程方案，开辟了独立的工作线程

例如：
- 运行一个 `npm install`，它就启动一个“下载与解压”的虚拟进程。
    
- 运行 `npm run dev`，它就启动一个“持续监听代码并编译”的虚拟进程。

---
**WebAssembly 化的 Node.js 核心**

Node.js 本身是用 C++ 和 JavaScript 编写的，无法直接在浏览器中运行。

- StackBlitz 团队将 Node.js 核心及其依赖的工具链编译成了 **WebAssembly (Wasm)**。
    
- 当你启动 WebContainer 时，浏览器会加载这些 Wasm 模块。这意味着，你的浏览器实际上是在运行一个由 Wasm 驱动的、高度定制的 Node.js 运行时

---
**虚拟网络栈与 Service Worker**

由于浏览器沙盒的安全限制，Wasm 进程无法直接监听电脑的物理端口（比如 `localhost:3000`），它是怎么让 `iframe` 成功访问到网页的呢？

WebContainer 引入了**虚拟网络栈**来解决这个问题：

- **网络虚拟化：** 当你在 WebContainer 里启动一个 Express 或 Vite 服务器并监听 `3000` 端口时，它只是在浏览器内存中标记了这个端口。

	- 标记该端口用于当service worker拦截到请求后，知道应该把该请求往哪里转发
	
	- 当 Wasm Node.js 进程往这个登记表里写下 `{ port: 3000, ... }` 的那一瞬间，WebContainer 的内核就会立刻捕捉到这个动作。它会做两件事：
	
		1. **生成虚拟 URL：** 基于这个端口号，在内存中生成一个专属的虚拟预览网址。

		2. **发出通知：** 触发 `webcontainerInstance.on('server-ready', (port, url) => { ... })` 事件。
	
	- 模拟真实的 TCP/IP 握手行为，因为node底层一些服务会检查端口号存不存在

- **Service Worker 桥梁：** WebContainer 会注册一个 Service Worker。当你的预览组件（如 `iframe`）请求页面时，Service Worker 会拦截请求，并在内存中找到对应的虚拟 Node.js 进程，将渲染好的页面数据返回。整个过程完全不需要经过真实的物理网络。

JS运行到`iframe`标签时，会向src属性的url发送请求，正常流程是进行DNS解析找到IP+Port，但是问题是该url是WebContainers返回，因此Service Worker 拦截请求到WebContainers本地服务

WebContainers 在浏览器里跑一个 **虚拟化的 TCP 网络栈**，并把它映射到 **Service Worker** 上，所以可以在浏览器里直接起 HTTP 服务，并返回一个 preview URL 

---
### 运行流程

**可以按下面五步来理解：**
```
boot()
  ↓
mount(files)
  ↓
spawn('npm', ['install'])
  ↓
spawn('npm', ['run', 'dev'])
  ↓
server-ready(port, url)
  ↓
iframe.src = url
```

#### **初始化**

当你在网页上打开一个支持 WebContainer 的项目时：

1. **加载 Wasm 镜像：** 浏览器向 StackBlitz 的 CDN 请求 WebContainer 的核心资产，主要是被编译成 **WebAssembly (Wasm)** 的 Node.js 运行时环境，以及定制的二进制工具链。
    
2. **启动沙盒环境：** 浏览器在后台启动一个独立的 **Web Worker**，Wasm文件在后台进程中运行
    
3. **加载核心：** Wasm 文件在 Web Worker 中被实例化。此时，一个完全运行在浏览器内存里、拥有独立 CPU 执行环境的 **Node.js 运行时**成功创建

---
#### **挂载文件**

WebContainer初始化之后，相当于创建了一个"虚拟机"，里面没有任何代码文件。

1. **创建虚拟硬盘：** WebContainer 在内存中开辟一块空间，初始化为一个虚拟的文件系统（支持根目录 `/`、`node_modules` 等结构）。
    
2. **挂载文件 ：** 前端应用将保存在云端或编辑器里的代码（通常是一个包含文件名和内容的 JSON 对象）打包，通过 API 传递给容器。
    
3. **写入内存：** 虚拟文件系统接收数据，把这些文件写入“虚拟硬盘”中。此时， `package.json`、`index.js` 就各就各位了。

---
#### **执行命令**

代码准备好了，所以我们需要将代码跑起来，也就是执行命令。

 步骤 A：执行 `npm install`

1. 调用 `spawn('npm', ['install'])`。
    
2. WebContainer 启动一个新进程，Wasm 化的 npm 开始工作。
    
3. **下载依赖：** 它直接利用浏览器的 `fetch` 发起真实的外部网络请求，去 npm 官方镜像源把依赖包拉下来。
    
4. **解压写入：** 下载的压缩包在浏览器本地被解压，并密密麻麻地写入到刚才建立的**虚拟文件系统**的 `/node_modules` 目录下。
    

 步骤 B：执行 `npm run dev` (以 Vite 为例)

1. 依赖装好后，你调用 `spawn('npm', ['run', 'dev'])`。
    
2. 虚拟 Node.js 进程读取 `/node_modules/vite` 的代码并开始执行。
    
3. **代码编译：** Vite 开始扫描虚拟文件系统里的代码，进行打包和编译。整个编译计算完全消耗你当前这台电脑的 CPU 性能。

---
#### **网络捕获与页面渲染**

```
[ 1. Vite 启动 ] ───> 执行 app.listen(3000)
[ 2. 内存登记 ] ───> 登记表写入 { port: 3000, handler } 
[ 3. 触发事件 ] ───> 触发 'server-ready'，传出虚拟 URL 
[ 4. 绑定视图 ] ───> 外层收到 URL，赋值给 <iframe src="url"> 
[ 5. 流量拦截 ] ───> iframe 发起请求 -> Service Worker 拦截 -> 转发给 Wasm 
[ 6. 最终呈现 ] ───> Wasm 现场吐出 HTML -> iframe 渲染
```

- **端口标记：** Vite 编译完成后，在代码里执行 `listen(3000)`。WebContainer 拦截此操作，并在内部的 **JavaScript 登记表**中记录下 3000 端口已被 Vite 进程占用。
    
- **发出就绪信号：** 登记成功后，WebContainer 向外层的宿主页面抛出 `server-ready` 事件，并附带一个虚拟的预览 URL。
    
- **iframe 承接：** 外层宿主页面监听到这个事件，把虚拟 URL 填入 `<iframe src="..."/>`。
    
- **Service Worker 拦截与响应：** `iframe` 加载该 URL 产生请求，**Service Worker** 在中间一把截住，转头去登记表找到 Vite 进程。Vite 进程把编译好的前端 HTML/JS 传回给 Service Worker，Service Worker 包装后喂给 `iframe`。

---
### 架构设计

#### 难题一：怎么突破“套娃”带来的性能地狱？（CPU与执行设计）

**传统的思路：** Node.js = V8 引擎（执行 JS） + Libuv（处理异步 I/O） + C++ 核心代码。 如果要把完整的 Node.js 搬进浏览器，最直白的设计就是把这一坨全部编译成 WebAssembly (Wasm)。但这意味着你会在**浏览器自带的 V8 引擎**之上，用 Wasm 再跑一个**定制的 V8 引擎**去跑用户的 JS 代码。这就是臭名昭著的“套娃”，不仅体积高达几十上百 MB，性能也会卡到令人发指。

**WebContainer 的天才设计：** **“去其糟粕，借鸡生蛋”**。

1. 架构师做了一个极其大胆的决定：**把 Node.js 源码里的 V8 引擎彻底剥离、扔掉！**
    
2. 他们把剩下的 Libuv 和 Node.js C++ 核心部分通过 **WASI**（WebAssembly 系统接口，一种让 Wasm 能跟操作系统对话的标准）编译成 Wasm 模块。
    
3. 当用户运行 JS 代码时，WebContainer 会把这个代码**直接交给浏览器原生的 V8 引擎**去跑。
    

**结果：** 下载体积从上百 MB 缩减到几 MB，代码执行速度几乎达到了原生电脑的 100%。

#### 难题二：怎么在纯异步的浏览器里，跑同步的文件读取？（I/O与线程设计）

**致命的冲突：** 在前端开发中，有大量的 npm 包和 Node.js 脚本极度依赖同步文件操作（比如 fs.readFileSync()）。同步意味着“代码执行到这里必须死等文件返回，不准往下走”。 但是，现代浏览器为了防止网页卡死，所有的文件/存储 API（比如 IndexedDB）**全部都是异步的**（必须用 async/await 或回调）。你绝对不可能在一个纯异步的底层基础之上，盖出一座允许同步阻塞的建筑。

**WebContainer 的天才设计：** **基于 SharedArrayBuffer 的线程挂起机制**。 为了解决这个死结，WebContainer 在架构中引入了极为高级的多线程通信设计：

1. **主线程**负责渲染网页界面（如编辑器、终端）。
    
2. 开辟一个 **Web Worker（后台线程）**，把 Node.js 的 Wasm 运行时扔进去跑。
    
3. 两个线程之间共享一块内存，叫做 **SharedArrayBuffer**。
    
4. 当 Wasm 线程调用 fs.readFileSync()（同步读文件）时，内核会利用浏览器底层的 Atomics.wait() 特性，**强行把这个后台后台线程“冻结/挂起”**。
    
5. 与此同时，负责文件管理的线程去异步读取数据，读完后把数据塞进那块共享内存，然后发射信号唤醒 Wasm 线程。Wasm 线程醒来，拿到数据，完美骗过了 Node.js。
    

**结果：** 既完美支持了 Node.js 庞大的同步生态，又确保了你的浏览器主界面依然丝滑、绝不卡死。

#### 难题三：怎么在没有网络权限的沙盒里监听端口？（网络设计）

**沙盒的铁律：** 浏览器的安全沙盒是绝对不允许网页代码去监听你电脑的物理端口（如 3000、8080）并建立 TCP 服务器的。

**WebContainer 的天才设计：** **虚拟网络网格 + Service Worker 流量劫持**。 架构师根本没有去尝试突破浏览器的底层安全限制，而是选择在浏览器内部“手写”了一套完全闭环的虚拟局域网。

- 当 Node.js 进程以为自己调用了操作系统的 Socket 监听本地端口时，其实只是在 WebContainer 维护的一个 JavaScript 对象（路由表）上注册了一个**回调函数**。
    
- 它们利用 **Service Worker**（一种可以拦截当前网站所有网络请求的浏览器接线员）作为网关。
    
- 当 预览窗口发出请求时，Service Worker 拦截它，查表，直接把请求以内存对象的形式传给 Node.js 进程。
    

**结果：** 整个网络层纯粹是在内存里互相传对象（IPC 通信），压根没走物理网卡，安全且极其高效。

---
## xterm

`xterm.js` 是一个运行在浏览器里的终端模拟器组件，用于渲染终端组件、解析 ANSI/VT escape sequences

### 核心概念

**核心对象：`Terminal` 实例**

这是整个库的入口和大脑。你所有的配置、事件监听和生命周期管理都是围绕它展开的。

- **配置项（Options）：** 在创建实例时，你可以定义终端的外观和行为，比如字体、主题颜色、光标样式（闪烁、方块）、回滚限制（`scrollback`，即最多保留多少行历史记录）等。
    
- **挂载（DOM Mounting）：** `Terminal` 实例化后，它只是一个存在于内存中的 JavaScript 对象。你需要调用 `term.open(element)` 方法，把它真正的“画”到 HTML 页面中的某个 DOM 节点上。
    
---
**两个数据流向：`onData` 与 `write`**

**终端的输入和输出是完全解耦（分离）的。**

```
                  +-------------------------+
                  |    xterm.js Terminal    |
                  +-------------------------+
                     /                   \
    用户敲击键盘     /                      \    渲染到屏幕上
   (触发事件)      /                         \   (主动调用方法)
                 v                           v
          [ term.onData ]               [ term.write ]
                 |                         ^
                 | 1. 发送输入数据           | 2. 返回结果/回显
                 v                         |
        +-------------------------------------+
        |       后端服务 (WebSocket/PTY)       |
        +-------------------------------------+
```

**属性一：** `term.onData(callback)` —— 捕获用户输入

当用户在终端窗口里敲击键盘（或者粘贴文本）时，会触发这个事件。

> **核心概念：** 此时，**屏幕上什么都不会显示**。`onData` 只是把用户敲击的字符（比如 `a`、`b`、`c` 或者是 `Enter`、`Ctrl+C` 的转义字符）打包交给你。你的职责是通过网络（如 WebSocket）把这些数据发送给后端的伪终端（PTY）。

**属性二：** `term.write(data)` —— 向终端输出内容

这是把数据“画”到终端屏幕上的唯一方法。

> **核心概念：** 只有当你调用 `term.write()` 时，终端屏幕才会刷新。当后端服务器执行了命令，把结果（包含文本和 ANSI 颜色代码）传回前端时，你调用 `term.write(后端数据)`，用户才能在屏幕上看到自己刚刚打的字以及命令执行的结果（这个过程叫**回显**）。

---
**插件系统（Addons）**

为了保持核心库的轻量和高性能，`xterm.js` 采用了**微内核架构**。核心库只负责最基础的终端渲染和状态管理，其他高级功能全部以插件形式存在。

使用插件的固定范式是：实例化插件 -> 调用 `term.loadAddon(addon)`。最常用的核心插件有：

- **`addon-attach`：** 官方提供的粘合剂。它能自动把你创建的 WebSocket 连接和 `xterm.js` 绑定起来，自动帮你处理 `onData` 发送和 `write` 写入，不需要你手动写网络通信代码。
    
- **`addon-fit`：** 响应式布局神器。标准的终端是按“行数和列数”（比如 80x24）来计算大小的，而网页是按像素（px）计算的。这个插件可以自动测量父级 HTML 容器的像素大小，并将其转化为最优的终端行列数（`term.resize(cols, rows)`）。
    
- **`addon-webgl` / `addon-canvas`：** 渲染加速器。默认情况下 `xterm.js` 用 DOM 渲染，加载这些插件后可以切换为 Canvas 或 WebGL 渲染，让上万行日志的滚动丝滑流畅。
    

---
**缓冲区：`Active` 与 `Alt` Buffer**

在真正的 Linux 终端里，你输入 `ls` 看到的是列表，但当你打开 `vim` 或 `nano` 时，整个屏幕会变成编辑界面，退出 `vim` 后，之前的终端列表又完好无损地回来了。

`xterm.js` 内部通过两个缓冲区完美模拟了这一行为：

- **正常缓冲区（Normal Buffer）：** 默认状态。支持滚动条，保存历史记录。你执行 `cat`、`ls` 等命令时，数据都留在这里。
    
- **备用缓冲区（Alternative Buffer）：** 当运行全屏应用（如 `vim`、`htop`、`less`）时激活。它**没有滚动条**，只有一屏的高度。一旦退出这些应用，`xterm.js` 会自动切回 Normal Buffer，恢复之前被盖住的屏幕内容。

---
### 运行流程

因为xtermjs只是一个前端渲染器，终端命令在后端服务器上执行，xtermjs只负责把用户输入传给后端，后端响应后xtermjs渲染

**初始化流程**

当在网页上打开一个包含终端的页面时，前端代码会依次执行以下步骤：

```
1. 实例化 (New) ---> 2. 挂载 (Open) ---> 3. 装插件 (Load) ---> 4. 连后端 (Connect)
```

1. 在 JavaScript 中执行 `const term = new Terminal()`。此时它只是内存中的一个对象，拥有了自己的配置（如字体、颜色）。
    
2. 执行 `term.open(document.getElementById('terminal-container'))`。`xterm.js` 开始在你的 HTML 容器里创建 DOM 节点，并初始化 Canvas（或 WebGL）画布。
    
3. 引入 `addon-fit` 插件，测量外层大盒子的像素宽度和高度，自动计算出当前能容纳多少行、多少列（比如 `120 列 x 35 行`），并调用 `term.resize(120, 35)`。
    
4.  前端通过 `new WebSocket()` 连接后端的 Node.js 或 Go 服务。连接成功后，**后端会立刻在服务器上启动一个真正的 Shell 进程（如 Bash）**，并把刚才计算好的 `120x35` 行列数同步给这个 Bash 进程。
    
---

**交互生命周期（用户敲击键盘到屏幕显示）**

我们以用户在网页终端里输入 `ls` 并按下回车（Enter）为例，看看两边的数据是如何流转的。这个过程分为 **“上行（发送请求）”** 和 **“下行（渲染返回）”**。

**用户敲键盘**

- 用户按键，用户在网页上敲击了键盘上的 `l` 键。
    
- `xterm.js` 内部的键盘监听器抓到了这个动作，并触发 `term.onData(data => { ... })` 回调函数。此时参数 `data` 里的内容就是字符 `"l"`。
    
- 前端代码（或 `addon-attach` 插件）通过 WebSocket 将这个 `"l"` 实时发送给后端服务器。
    

> **注意：**  此时此刻，网页屏幕上**依然是黑漆漆一片**，什么都没有显示！`xterm.js` 不会自动把你敲的字显示在屏幕上。

**后端处理**

- 后端服务器收到 WebSocket 传来的 `"l"`，直接通过 PTY（伪终端接口）写入到正在运行的 Bash 进程中。
    
- Bash 进程收到 `"l"` 后，意识到用户正在输入命令。为了让用户知道自己输入成功了，Bash 会执行“回显（Echo）”机制：它把 `"l"` 字符原封不动地吐出来，扔给 PTY。
    

 **屏幕渲染**

- 后端服务器从 PTY 中抓取到 Bash 吐出来的 `"l"` 字符，再次通过 WebSocket 发送回浏览器前端。
    
- 前端收到数据后，调用 `term.write("l")`。
    
- `xterm.js` 的渲染引擎（Canvas/WebGL）在当前光标所在的位置，用像素点画出一个高亮的字符 `l`，并把光标往后移动一格。
    

**如果按下的是回车（Enter）呢？**

当你在输入完 `ls` 后按下回车，流程完全一样，只是数据更丰富了：

1. `term.onData` 捕获到回车符（`\r`），通过网络发给后端。
    
2. 后端 Bash 收到回车，开始**真正执行** `ls` 命令。
    
3. `ls` 命令找出了当前目录下的文件（比如 `src/` 和 `package.json`），并把它们连带 ANSI 颜色代码（告诉前端 `src/` 是蓝色，`package.json` 是白色）一起吐给后端。
    
4. 后端把这一大串带有颜色编码的文本流发给前端。
    
5. 前端执行 `term.write(这一大串数据)`。
    
6. `xterm.js` 完美解析颜色代码，在网页上换行，并刷出一行蓝色的 `src/` 和一行白色的 `package.json`

---
### 架构设计

**架构总览：**
```
+-------------------------------------------------------------+
|                     应用层 (Your Web App)                   
+-------------------------------------------------------------+
                            |
+-------------------------------------------------------------+
|     外围扩展层 (Addons)                                     
|  [addon-fit]   [addon-attach]   [addon-webgl]  [addon-search] 
+-------------------------------------------------------------+
                            |
+-------------------------------------------------------------+
|     API / 控制层 (Xterm.js Core - Terminal)                 
|  - 配置管理 (Options)         - 事件总线 (EventEmitter)       
+-------------------------------------------------------------+
         /                                           \
        v                                             v
+-----------------------+                   +-----------------------+
|  数据与解析层 (Parser)  |                   |  高性能渲染层 (Render)  
|  - ANSI/VT100 解析器   |                   |  - DOM Renderer (降级) 
|  - 缓冲区管理 (Buffer)  |                  |  - Canvas Renderer    
|  - 选择区管理 (Selection)                  |  - WebGL Renderer (插件)
+-----------------------+                   +-----------------------+
```

**核心分层详解:**

**API / 控制层（Terminal 核心）**

这是暴露给开发者的核心外观（Facade 模式）。

- **职责：** 负责整个终端的生命周期管理（`open`、`dispose`、`resize`）。
    
- **解耦设计：** 内部实现了一个强类型、轻量级的**事件总线（EventEmitter）**。无论是键盘输入（`onData`）、窗口大小变动（`onResize`）还是滚动事件（`onScroll`），全部通过事件订阅的方式向外解耦，核心从不主动关心外界的网络状态或业务逻辑。
    

**数据与解析层**

这是 `xterm.js` 技术含量极高的一层，它处理的是终端的“空间”与“语义”。

- **ANSI / VT 标准解析器（Parser）：** 终端接收到的数据不是纯文本，而是夹杂着大量控制符的流（例如 `\x1b[31mHello` 表示将“Hello”染成红色）。解析器采用状态机设计，高效地将这串字节流翻译成内部的**数据指令**。
    
- **双缓冲区管理（Buffer）：** 正如前面提到的，内部维护着 `NormalBuffer` 和 `AltBuffer`。数据被解析后，会转换成**行（Line）和单元格（Cell）模型**存储在当前的 Buffer 中。
    
- **循环链表（Circular List）存储：** 为了防止长期运行导致内存暴涨，历史缓冲区采用了循环链表。当日志超过配置的 `scrollback`（如 1000 行）时，最旧的一行会被自动从头部丢弃，新的一行从尾部加入，确保内存恒定。
    

**高性能渲染层（Renderer）**

终端可能面临一秒钟刷新几万字的高频场景，常规的 DOM 操作会导致严重的浏览器掉帧（Jank）。为此，`xterm.js` 设计了**可插拔的渲染管道**：

1. **DOM Renderer：** 最基础的渲染器。使用纯 HTML 标签绘制，兼容性最好，但性能最差。目前仅作为最后的保底降级方案。
    
2. **Canvas Renderer（默认）：** 将整个终端屏幕视为一个画布，通过像素点绘制文字。它避免了数万个 DOM 节点的开销，性能有了质的飞跃。
    
3. **WebGL Renderer（高级）：** 通过 GPU 硬件加速渲染。它将字体打包成“纹理贴图（Atlas）”，利用显卡并行计算能力直接将字符推向屏幕，即便在超大分辨率、高频滚屏下也能保持 60 帧满帧运行。
    

**外围扩展层（Addon 插件机制）**

这是 `xterm.js` 架构中最精妙的**微内核（Microkernel）设计**。官方坚持“非必要不加入核心”的原则。

核心库只留出了一个统一的接口：

TypeScript

```
export interface IAddon {
  activate(terminal: Terminal): void;
  dispose(): void;
}
```

任何额外的功能，只要实现这个接口，就能直接挂载到 `Terminal` 实例上。例如：

- 想连 WebSocket？装 `addon-attach`。
    
- 想自适应窗口？装 `addon-fit`。
    
- 想在终端里支持鼠标选中 URL 跳转？装 `addon-web-links`。
    
- 想在终端里支持 `Ctrl + F` 搜索？装 `addon-search`。 这种设计保证了核心库的纯粹、小巧和极高的维护性。
    

 架构设计的三大智慧

- **完全的读写分离：** 输入是输入（`onData` 走网络），输出是输出（`write` 走渲染），中间由后端的 PTY 进程做闭环。这种极简的单向数据流设计，让前后端彻底解耦。
    
- **按需渲染（Dirty Grid 机制）：** 渲染器不会每时每刻都在重绘全屏。它内部维护了一个“脏矩形区域（Dirty Rows）”，只有被状态机标记为“内容已改变”的行，在下一帧请求（`requestAnimationFrame`）到来时才会触发局部重绘，极大地节省了 CPU 算力。
    
- **面向字符而非面向字符串：** 终端的本质是二维网格（Grid）。`xterm.js` 底层数据结构紧紧围绕 `[行, 列]` 的单元格展开，每个单元格精准存储字符的内容、前景色、背景色、下划线等样式属性。
---
# github import export

## Octokit

Octokit 是 GitHub 官方出品的、专门用来调用 GitHub API 的 SDK，它把 REST API 封装成方法调用

因为 import/export 功能涉及到很多 github rest api 的调用，如果不使用该 skd 需要手动维护封装

**Token哪里获得：**
```
API Route 通过 Clerk 读取用户绑定的 GitHub OAuth token

然后通过 Inngest 事件传给后台任务

初始化octokit：const octokit = new Octokit({ auth: githubToken })
```

**import 使用的方法：**
``` js
octokit.rest.git.getTree
// 

octokit.rest.git.getBlob
```
## github import


