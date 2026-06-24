# 技术栈

Shadcn/ui、Tailwind css、React、Next.js、Convex、Inngest、AgentKit、Webcontainer、xterm.js、Sentry、CodeMirror、Firecrawl、Clerk、AI SDK、AI Element、Vercel

---
# 需求分析

## 需求一：Login and registration Feature

**登录注册功能**调用的是 `Clerk` 的 `SignInButton` 和 `SignUpButton` 组件，组件自动处理登录注册功能。

`Convex` 本身并没有身份验证功能，可以通过集成 `Clerk Auth` 服务进行身份验证，这是[官方文档](https://docs.convex.dev/auth/clerk#nextjs)

**整个流程是：**
- 用户通过 `Clerk` 组件输入账号密码登录
- `Clerk` 在前端生成一个加密的 **JWT Token**
- Convex 客户端（`ConvexProviderWithClerk`）会自动把这个 Token 塞进每一次对 Convex 后端的请求里
- **Convex 后端**收到请求后，通过配置好的公钥自动验证 Token 是否合法
- 如果合法，在 Convex 写的数据库操作函数里就能直接读取到 `ctx.auth.currentIdentity()`

## 需求二：File Manager Feature

### File Explorer

新建文件/文件夹、重命名文件/文件夹、删除文件/文件夹、一键合上所有文件夹

`index` 获取 `root` 文件，通过遍历渲染所有 `root` 文件，也就是 `tree` 组件

对于每一个 `tree` 组件，如果是**文件**则正常渲染，如果是**文件夹**则通过递归渲染文件夹

对于**右键触发**使用 `Shadcn/ui` 的 `Context Menu` 组件，该组件自动监控右键触发事件，展示弹窗

对于文件/文件夹缩进，采用层级控制，层级 * 基础像素 = 缩进，文件夹多填充

### File store

**打开文件功能：**
```
用户单击文件，作为预览打开（双击作为固定打开）

zustand 的 openFile 函数获取文件id并进行处理

	作为预览打开
	作为固定打开
	已打开那么只需要激活
	
Tab 组件调用useEditor hook 获取 file 状态并且渲染标签

则导航栏展示该文件标签

内容部分展示，同样的调用useEditor hook 获取 activeId

根据该id请求数据库返回content

content内容传递给 codeEditor 组件，组件渲染文本
```

**关闭文件功能：**
```
用户点击 x 号，调用 useEditorStore hook 的 closeTab 函数，同时传入要关闭文件的 id

在 closeTab 函数里，正常浅拷贝状态，获取要删除元素的数组下标

关闭旧标签打开新标签逻辑：
	如果关闭标签是当前激活标签才进行操作
	如果标签全关闭，那么newActiveTabId = null
	如果关闭最后一个标签，那么激活关闭后的array tab的倒数第一个
	否则激活下一个标签

```
## 需求三：Code Editor Feature

### code editor

code editor 功能采用的是 codemirror6 这个库，codemirror6 是一个浏览器中代码编辑器组件，专门让网页具备 vs code 代码输入体验

codemirror 设计思路类似于 react，采用的是 state 和 view 分离的设计，transaction驱动状态更新，state 更新驱动视图更新。几乎所有的功能都是通过extension集成，并且每个 extension 维护自己的状态

**代码编辑器功能：**
```
在 code-editor 文件里，使用 useEffect 初始化 codemirror，在每次 语言扩展 发生变化时重新运行
	对于第三方库，应该在 DOM 挂载后再初始化

通过 extention 扩展 codemirror 功能
	语法高亮扩展、语言扩展、小地图扩展、主题扩展、快捷键扩展，自定义了幽灵文本扩展、快速编辑扩展、快速工具扩展
	还加载了一些自定义设置
	
用户进行输入，codemirror 派发一个 transaction

oldstate 和 transaction 在 StateField.update 函数中更新生成 newState

所有 StateField 更新

更新完毕后，CM6 会将旧 State、新 State 和事务打包成一个 ViewUpdate 对象，传递给所有的 View 插件

视图进行绘制，代码展示
```
### suggestion

suggestion 功能，也就是代码提示通过自定义 codemirror extention 实现
#### 整体架构

`suggestion(fileName)` 在 `CodeEditor` 里作为扩展注册，返回四个能力：

``` ts
export const suggestion = (fileName: string) => [

suggestionState, // 状态存储

createDebouncePlugin(fileName),

renderPlugin, // 渲染幽灵文字

acceptSuggestionKeymap, // 按 Tab 键接受

];
```

|模块|职责|
|---|---|
|`suggestionState`|存当前建议文本（`string \| null`）|
|`createDebouncePlugin`|监听输入/光标，防抖后发请求|
|`renderPlugin`|在光标后画「幽灵文本」|
|`acceptSuggestionKeymap`|Tab 插入建议并清空状态|

``` mermaid
sequenceDiagram
    participant User
    participant DebouncePlugin
    participant API
    participant StateField
    participant RenderPlugin
    participant DOM

    User->>DebouncePlugin: 输入 / 移动光标
    DebouncePlugin->>DebouncePlugin: 防抖 700ms，abort 旧请求
    DebouncePlugin->>API: POST /api/suggestion
    API-->>DebouncePlugin: { suggestion: "..." }
    DebouncePlugin->>StateField: dispatch(setSuggestionEffect)
    StateField-->>RenderPlugin: suggestionState 更新
    RenderPlugin->>DOM: Widget 装饰（灰色斜体）
    User->>RenderPlugin: Tab
    RenderPlugin->>User: 插入文本，清空建议

```

---

#### 1. 用户输入如何触发请求

`createDebouncePlugin` 是 `ViewPlugin`：文档变化或选区变化时调用 `triggerSuggestion`。

``` ts
update(update: ViewUpdate) {

if (update.docChanged || update.selectionSet) {

this.triggerSuggestion(update.view);

}

}

triggerSuggestion(view: EditorView) {

// ... 清 timer、abort 旧请求 ...

isWaitingForSuggestion = true;

debounceTimer = window.setTimeout(async () => {

const payload = generatePayload(view, fileName);

// ...

const suggestion = await fetcher(payload, currentAbortController.signal);

isWaitingForSuggestion = false;

view.dispatch({

effects: setSuggestionEffect.of(suggestion),

});

}, DEBOUNCE_DELAY);

}
```

要点：

- 700ms 防抖：连续输入会重置 timer，只有停手后才请求。
- AbortController：新输入会 `abort` 上一次请求，避免旧结果覆盖新光标。
- `isWaitingForSuggestion`：请求进行中为 `true`，渲染层会先不显示幽灵文本（见下文）。

---
#### 2. 请求 payload 如何构建

`generatePayload` 从当前 `EditorView` 收集上下文，发给 LLM：

``` ts
const generatePayload = (view: EditorView, fileName: string) => {

const code = view.state.doc.toString();

// ...

const cursorPosition = view.state.selection.main.head;

const currentLine = view.state.doc.lineAt(cursorPosition);

const cursorInLine = cursorPosition - currentLine.from;

// 当前行上方最多 5 行、下方最多 5 行

// textBeforeCursor / textAfterCursor 为当前行光标左右片段

return { fileName, code, currentLine, previousLines, textBeforeCursor, textAfterCursor, nextLines, lineNumber };

}

空文档会直接 `dispatch(null)`，不请求。

`fetcher` 用 Zod 校验后 `POST /api/suggestion`：

const response = await ky

.post("/api/suggestion", {

json: validatedPayload,

signal,

timeout: 10_000,

retry: 0,

})

.json<SuggestionResponse>();

return validatedResponse.suggestion || null;
```

服务端用 DeepSeek + 结构化输出，根据光标上下文生成 `suggestion` 字符串（可能为空，表示无需补全）。

---

#### 3. 建议文本如何写入编辑器状态

不用直接改 `view.state`，而是通过 StateEffect + StateField：

``` ts
const setSuggestionEffect = StateEffect.define<string | null>();

const suggestionState = StateField.define<string | null>({

create() { return null; },

update(value, transaction) {

for (const effect of transaction.effects) {

if (effect.is(setSuggestionEffect)) {

return effect.value;

}

}

return value;

},

});
```

流程：`view.dispatch({ effects: setSuggestionEffect.of(suggestion) })` → `suggestionState.update` 收到 effect → 状态变为 API 返回的字符串或 `null`。

这是 CodeMirror 推荐的做法：状态变更可追踪、可与其他 transaction 组合。

---

#### 4. 幽灵文本如何展示

展示由第二个 `ViewPlugin` — `renderPlugin` 负责，用 Decoration.widget 在光标处插入自定义 DOM，而不是改文档内容。

``` ts
build(view: EditorView) {

if (isWaitingForSuggestion) {

return Decoration.none;

}

const suggestion = view.state.field(suggestionState);

if (!suggestion) {

return Decoration.none;

}

const cursor = view.state.selection.main.head;

return Decoration.set([

Decoration.widget({

widget: new SuggestionWidget(suggestion),

side: 1, // 光标之后

}).range(cursor),

]);

}
```

`update` 在以下情况会 `build` 重建装饰：

- 文档变了（用户继续打字，旧建议可能错位）
- 光标移动
- 收到 `setSuggestionEffect`（新建议到达）

`SuggestionWidget` 继承 `WidgetType`，`toDOM()` 生成灰色斜体、`pointer-events: none` 的 `<span>`，看起来像 GitHub Copilot 的 inline ghost text：

``` ts
class SuggestionWidget extends WidgetType {

toDOM() {

const span = document.createElement("span");

span.textContent = this.text;

span.style.color = "oklch(0.7500 0.0018 264.3 / 0.52)";

span.style.fontStyle = "italic";

span.style.pointerEvents = "none";

return span;

}

}

```
`{ decorations: (plugin) => plugin.decorations }` 把装饰集交给 CodeMirror 绘制层，所以文字会紧跟光标，但不进入 `doc`。

等待期间不显示：`isWaitingForSuggestion === true` 时返回 `Decoration.none`，避免请求未完成时闪旧建议。

---

#### 5. Tab 接受建议

有建议时 Tab 会插入并清空；没有建议则 `return false`，交给默认 Tab 缩进：

``` ts
run: (view) => {

const suggestion = view.state.field(suggestionState);

if (!suggestion) return false;

const cursor = view.state.selection.main.head;

view.dispatch({

changes: { from: cursor, insert: suggestion },

selection: { anchor: cursor + suggestion.length },

effects: setSuggestionEffect.of(null),

});

return true;

},
```

插入是真实文档变更；`setSuggestionEffect.of(null)` 清状态，幽灵文本消失。

---

#### 6. 为何拆成 StateField + 两个 ViewPlugin

文件末尾注释已概括，可再浓缩：

- StateField：只存「当前建议字符串」这类纯数据。
- 防抖插件：副作用（timer、fetch、abort），适合 `ViewPlugin`。
- 渲染插件：根据状态算 `DecorationSet`，也是 `ViewPlugin` 的典型用法。

若全塞进一个插件，请求、状态、DOM 会缠在一起，难测也难维护。

---
## 需求四：Conversation Feature

**数据流动：**
```
用户在 conversation 组件输入，点击提交后/点击暂停后

运行 handleSubmit 函数

	如果当前有正在处理的消息，那么用户实现的是暂停功能
	调用 handleCancel 函数，向 /api/message/cancel 发送请求
	首先触发 inngest 的 messageCancel 事件，取消当前执行的函数
	其次向 convex 发送 updateMessageStatus 请求，并传入 messageId，将状态更改为 cancelled


```

# 优化

## WebContainer

### 热重载

现在的问题是对于后续文件**更新逻辑**是**全量覆盖**

当前只对文件操作，使用writeFile对所有符合条件的文件进行覆盖，即使该文件之前没有更新

```
// 同步文件更改（热重载）
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;
    const filesMap = new Map(files.map((f) => [f._id, f]));
    // 每次 files 变化，把项目里所有符合条件的文件都写一遍到虚拟文件系统中
    for (const file of files) {

      if (file.type !== "file" || file.storageId || !file.content) continue;

  

      const filePath = getFilePath(file, filesMap);

      // 现在的逻辑是全量覆盖，不止覆盖改动后的文件，没有改动的文件也覆盖

      // 实现diff、rm、mkdir，还可以维护上一版本文件内容

      container.fs.writeFile(filePath, file.content);

    }

  }, [files, status]);
```