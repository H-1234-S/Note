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

### 
## 需求四：Conversation Feature


