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

用于将**耗时、异步、定时、多步骤任务**从前端请求拆解出去，在后台可靠执行。主要解决的是在**serverless环境**下如何可靠执行后台任务，也就是长任务执行、多步骤流程、定时、重试还有异步任务可靠执行

工作流程可以概括为：

- inngest.send发送事件，发送后并不是立即执行代码

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

> 它的核心目标是：用极少的代码，创建一个全局状态，所有组件按需更新

也是非常非常的好用，用来**管理全局状态**的，不再进行不必要的渲染

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

codemirror 维护着自己的状态，比如光标位置、文档内容，但有的时候我们需要自定义额外状态，这时候需要stateFile