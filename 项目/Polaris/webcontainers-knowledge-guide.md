# Polaris 项目中的 WebContainers 知识体系

本文按“先理解 WebContainer 是什么，再看 Polaris 怎么接入，最后掌握常用 API 和可改进点”的顺序整理。

当前项目依赖：

```json
"@webcontainer/api": "^1.6.1"
```

相关源码入口：

- `package.json`
- `next.config.ts`
- `src/features/preview/hooks/use-webcontainer.ts`
- `src/features/preview/utils/file-tree.ts`
- `src/features/preview/components/preview-terminal.tsx`
- `src/features/preview/components/preview-settings-popover.tsx`
- `src/features/projects/components/preview-view.tsx`

## 1. WebContainer 解决什么问题

Polaris 是一个在线代码工作台：用户有项目文件树、代码编辑器、AI 修改文件、运行预览、GitHub 导入导出等能力。

如果要在浏览器里预览一个前端项目，传统做法通常是：

```txt
用户文件
  -> 上传到服务器
  -> 服务器 npm install
  -> 服务器 npm run dev
  -> 反向代理到浏览器 iframe
```

WebContainer 的思路不同：它在浏览器里启动一个类 Node.js 的运行时，直接在用户浏览器里安装依赖、执行命令、启动开发服务器，再把预览 URL 提供给 iframe。

在 Polaris 里，它主要负责这一段：

```txt
Convex 中保存的项目文件
  -> 转成 WebContainer 的 FileSystemTree
  -> mount 到浏览器内的文件系统
  -> spawn("npm", ["install"])
  -> spawn("npm", ["run", "dev"])
  -> 监听 server-ready
  -> iframe 显示预览页面
```

所以 WebContainer 在项目里的角色可以概括为：

> 把数据库里的项目文件，变成一个可以在浏览器中运行的临时 Node 项目。

## 2. WebContainer 的运行前提

WebContainer 依赖 `SharedArrayBuffer`，而 `SharedArrayBuffer` 需要页面满足跨源隔离要求。Polaris 在 `next.config.ts` 中设置了响应头：

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};
```

这里有两个关键响应头：

- `Cross-Origin-Embedder-Policy`：控制页面嵌入跨源资源的策略。
- `Cross-Origin-Opener-Policy`：让页面拥有独立的浏览上下文组。

项目里 `WebContainer.boot({ coep: "credentialless" })` 和 `next.config.ts` 的 `COEP: credentialless` 是匹配的。

如果这两个头没有正确配置，常见结果是 WebContainer 启动失败，或者浏览器提示 `SharedArrayBuffer` 不可用。

生产环境还要注意：部署站点需要 HTTPS。`localhost` 开发环境通常可以正常运行，是因为浏览器对本地开发有豁免。

## 3. 项目中的整体预览链路

入口组件是 `PreviewView`：

```tsx
const {
  status,
  previewUrl,
  error,
  restart,
  terminalOutput,
} = useWebContainer({
  projectId,
  enabled: true,
  settings: project?.settings,
});
```

`PreviewView` 做三件事：

- 调用 `useWebContainer` 启动和管理 WebContainer。
- 用 `iframe` 展示 `previewUrl`。
- 用 `PreviewTerminal` 展示安装和启动命令输出。

简化后的结构是：

```tsx
{previewUrl && (
  <iframe
    src={previewUrl}
    className="size-full border-0"
    title="Preview"
  />
)}

<PreviewTerminal output={terminalOutput} />
```

这说明 WebContainer 并不直接渲染 UI。它只负责运行项目、暴露预览地址；真正显示预览的是普通 `iframe`。

## 4. `useWebContainer` 的生命周期

文件：`src/features/preview/hooks/use-webcontainer.ts`

这个 hook 管理完整生命周期：

```txt
idle
  -> booting
  -> installing
  -> running
  -> error
```

对应状态定义：

```ts
const [status, setStatus] = useState<
  "idle" | "booting" | "installing" | "running" | "error"
>("idle");
```

它同时维护：

- `previewUrl`：开发服务器 ready 后得到的 iframe 地址。
- `error`：启动、安装、运行阶段捕获的错误。
- `terminalOutput`：命令行输出字符串。
- `restartKey`：触发 React effect 重新执行。
- `containerRef`：保存当前 WebContainer 实例。
- `hasStartedRef`：防止 React 重渲染导致重复启动。

核心流程如下：

```ts
setStatus("booting");

const container = await getWebContainer();
containerRef.current = container;

const fileTree = buildFileTree(files);
await container.mount(fileTree);

container.on("server-ready", (_port, url) => {
  setPreviewUrl(url);
  setStatus("running");
});

setStatus("installing");

const installProcess = await container.spawn("npm", ["install"]);
const installExitCode = await installProcess.exit;

if (installExitCode !== 0) {
  throw new Error("npm install failed");
}

await container.spawn("npm", ["run", "dev"]);
```

这段代码就是 Polaris 预览系统的核心。

## 5. 为什么要用单例 WebContainer

项目顶部定义了单例：

```ts
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
```

获取实例：

```ts
const getWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};
```

这里有两个设计点。

第一，WebContainer 同一时间只能 boot 一个实例。官方类型说明里也明确写了：只能并发 boot 一个实例，销毁后才能重新 boot。

第二，boot 是昂贵操作。把 `bootPromise` 缓存起来，可以避免两个组件或两次 effect 同时触发 `WebContainer.boot()`。

可以把它理解成：

```txt
webcontainerInstance：已经启动好的容器
bootPromise：正在启动中的容器
```

如果没有 `bootPromise`，快速连续点击或 React 严格模式下的重复执行，可能造成重复 boot。

## 6. `WebContainer.boot()` API

基本用法：

```ts
import { WebContainer } from "@webcontainer/api";

const container = await WebContainer.boot({
  coep: "credentialless",
});
```

项目用到的参数：

```ts
coep: "credentialless"
```

`coep` 要和页面响应头里的 `Cross-Origin-Embedder-Policy` 保持一致。常见取值：

- `"require-corp"`：更严格，跨源资源需要显式允许。
- `"credentialless"`：加载无凭证跨源资源，对实际前端应用更宽松。
- `"none"`：通常不推荐，依赖浏览器支持条件。

其他常见参数：

```ts
const container = await WebContainer.boot({
  coep: "credentialless",
  workdirName: "polaris-preview",
  forwardPreviewErrors: "exceptions-only",
});
```

API 解释：

- `workdirName`：设置容器工作目录名称，主要是展示和调试用途。
- `forwardPreviewErrors`：把 iframe 预览页里的错误转发到父页面。可以是 `true`、`false` 或 `"exceptions-only"`。

Polaris 目前没有开启 `forwardPreviewErrors`。如果以后想把预览页面的运行时报错显示到终端或错误面板，可以考虑使用。

## 7. WebContainer 的文件系统模型

WebContainer 不是直接读取本机文件，也不是直接读取 Convex。它需要一个 `FileSystemTree`。

类型大致是：

```ts
interface FileSystemTree {
  [name: string]: DirectoryNode | FileNode | SymlinkNode;
}

interface DirectoryNode {
  directory: FileSystemTree;
}

interface FileNode {
  file: {
    contents: string | Uint8Array;
  };
}

interface SymlinkNode {
  file: {
    symlink: string;
  };
}
```

一个最小项目可以这样表示：

```ts
const files = {
  "package.json": {
    file: {
      contents: JSON.stringify({
        scripts: {
          dev: "vite --host 0.0.0.0",
        },
        dependencies: {
          "@vitejs/plugin-react": "latest",
          vite: "latest",
          react: "latest",
          "react-dom": "latest",
        },
        devDependencies: {},
      }),
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `console.log("hello from webcontainer");`,
        },
      },
    },
  },
};
```

目录节点必须写成：

```ts
{
  directory: {}
}
```

文件节点必须写成：

```ts
{
  file: {
    contents: "..."
  }
}
```

不能直接写：

```ts
{
  "index.js": "console.log(1)"
}
```

## 8. Polaris 如何构造 `FileSystemTree`

文件：`src/features/preview/utils/file-tree.ts`

Polaris 的文件存在 Convex 里，是扁平数组结构。每个文件通过 `parentId` 指向父目录。因此需要先把扁平结构还原成树。

核心函数：

```ts
export const buildFileTree = (files: FileDoc[]): FileSystemTree => {
  const tree: FileSystemTree = {};
  const filesMap = new Map(files.map((f) => [f._id, f]));

  const getPath = (file: FileDoc): string[] => {
    const parts: string[] = [file.name];
    let parentId = file.parentId;

    while (parentId) {
      const parent = filesMap.get(parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      parentId = parent.parentId;
    }

    return parts;
  };

  for (const file of files) {
    const pathParts = getPath(file);
    let current = tree;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;

      if (isLast) {
        if (file.type === "folder") {
          current[part] = { directory: {} };
        } else if (!file.storageId && file.content !== undefined) {
          current[part] = { file: { contents: file.content } };
        }
      } else {
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const node = current[part];
        if ("directory" in node) {
          current = node.directory;
        }
      }
    }
  }

  return tree;
};
```

这段逻辑可以分成三步理解：

第一步，建立 `_id -> file` 映射：

```ts
const filesMap = new Map(files.map((f) => [f._id, f]));
```

有了这个 map，才能从一个文件向上追溯它的父目录。

第二步，把单个文件还原成路径数组：

```ts
// 例如 Button.tsx 的 parentId 指向 components
// components 的 parentId 指向 src
// 最后得到：
["src", "components", "Button.tsx"]
```

第三步，把路径数组写入嵌套对象：

```ts
tree["src"].directory["components"].directory["Button.tsx"] = {
  file: {
    contents: "...",
  },
};
```

注意这一行：

```ts
} else if (!file.storageId && file.content !== undefined) {
```

这表示当前预览只挂载文本内容文件。带 `storageId` 的文件通常表示存储中的二进制或外部文件，当前逻辑会跳过它们。

## 9. `container.mount()` API

项目里这样使用：

```ts
const fileTree = buildFileTree(files);
await container.mount(fileTree);
```

`mount()` 的作用是把 `FileSystemTree` 写入 WebContainer 的虚拟文件系统。

基本 API：

```ts
await container.mount(fileTree);
```

也可以挂载到子目录：

```ts
await container.mount(fileTree, {
  mountPoint: "app",
});
```

如果使用 `mountPoint: "app"`，原本的 `package.json` 会出现在：

```txt
app/package.json
```

此时执行命令也要对应设置 cwd：

```ts
await container.spawn("npm", ["install"], {
  cwd: "app",
});
```

Polaris 目前直接挂载到工作目录根部，所以 `npm install` 和 `npm run dev` 默认就在项目根目录执行。

## 10. `container.spawn()` API

`spawn()` 用来在 WebContainer 里启动进程。它类似 Node 的 `child_process.spawn`，但返回的是 WebContainer 的进程对象。

项目里的安装依赖：

```ts
const installProcess = await container.spawn(installBin, installArgs);
```

项目里的启动开发服务器：

```ts
const devProcess = await container.spawn(devBin, devArgs);
```

最常见写法：

```ts
const process = await container.spawn("npm", ["install"]);
```

带选项：

```ts
const process = await container.spawn("npm", ["run", "dev"], {
  cwd: ".",
  env: {
    NODE_ENV: "development",
  },
  terminal: {
    cols: 80,
    rows: 24,
  },
});
```

重要参数：

- 第一个参数 `command`：命令名，比如 `"npm"`、`"node"`、`"npx"`。
- 第二个参数 `args`：命令参数数组，比如 `["run", "dev"]`。
- `cwd`：进程工作目录，相对 WebContainer 工作目录。
- `env`：环境变量。
- `terminal`：伪终端尺寸，影响命令输出排版。
- `output`：如果设为 `false`，不会产生输出流。

不要把完整命令直接作为第一个参数：

```ts
// 不推荐
await container.spawn("npm install", []);
```

应该拆成：

```ts
await container.spawn("npm", ["install"]);
```

Polaris 当前支持用户在设置面板里输入命令：

```ts
const installCmd = settings?.installCommand || "npm install";
const [installBin, ...installArgs] = installCmd.split(" ");
```

这能处理简单命令，比如：

```txt
npm install
npm run dev
pnpm install
pnpm dev
```

但它不能正确处理复杂 shell 语法，比如：

```txt
npm run dev -- --host 0.0.0.0
node -e "console.log('hello world')"
```

因为简单的 `split(" ")` 不理解引号、转义和 shell 操作符。更稳妥的方式是把命令和参数拆成两个字段，或者使用专门的 shell 参数解析库。

## 11. `WebContainerProcess` 进程对象

`spawn()` 返回 `WebContainerProcess`，常用属性有：

```ts
interface WebContainerProcess {
  exit: Promise<number>;
  input: WritableStream<string>;
  output: ReadableStream<string>;
  kill(): void;
  resize(dimensions: { cols: number; rows: number }): void;
}
```

### 11.1 `exit`

`exit` 是进程退出码 Promise。

项目里安装依赖后会等待退出码：

```ts
const installExitCode = await installProcess.exit;

if (installExitCode !== 0) {
  throw new Error(`${installCmd} failed with code ${installExitCode}`);
}
```

这很重要，因为 `npm install` 是一次性命令。只有安装成功，才应该启动开发服务器。

开发服务器通常不会退出，所以项目没有等待：

```ts
const devProcess = await container.spawn(devBin, devArgs);
```

这是合理的，因为 `npm run dev` 的目标是持续运行。

### 11.2 `output`

`output` 是命令输出流，包含 stdout、stderr，以及子进程输出。

项目里把输出接到 React state：

```ts
installProcess.output.pipeTo(
  new WritableStream({
    write(data) {
      appendOutput(data);
    },
  })
);
```

这段代码的意思是：

```txt
npm install 的终端输出
  -> WritableStream.write(data)
  -> appendOutput(data)
  -> setTerminalOutput
  -> PreviewTerminal 渲染到 xterm
```

一个更完整的抽取版本可以写成：

```ts
const pipeProcessOutput = (
  process: WebContainerProcess,
  onData: (data: string) => void
) => {
  return process.output.pipeTo(
    new WritableStream({
      write(data) {
        onData(data);
      },
    })
  );
};
```

然后：

```ts
const install = await container.spawn("npm", ["install"]);
pipeProcessOutput(install, appendOutput);
const code = await install.exit;
```

### 11.3 `input`

`input` 是写入进程终端的输入流。Polaris 当前终端是只读的：

```ts
disableStdin: true
```

所以项目没有使用 `process.input`。

如果以后要做交互式终端，可以把 xterm 输入接到进程：

```ts
const shell = await container.spawn("jsh", {
  terminal: {
    cols: 80,
    rows: 24,
  },
});

const writer = shell.input.getWriter();

terminal.onData((data) => {
  writer.write(data);
});

shell.output.pipeTo(
  new WritableStream({
    write(data) {
      terminal.write(data);
    },
  })
);
```

### 11.4 `kill()`

`kill()` 用来结束进程：

```ts
devProcess.kill();
```

Polaris 当前重启时调用的是：

```ts
teardownWebContainer();
```

这会销毁整个容器，所以里面的进程也会失效。如果以后只想重启 dev server，而不是整个容器，可以保存 `devProcess`，然后先 `kill()` 再重新 `spawn()`。

### 11.5 `resize()`

`resize()` 用来调整伪终端尺寸：

```ts
process.resize({
  cols: 120,
  rows: 30,
});
```

Polaris 当前只是把输出字符串显示到 xterm，并没有把真实进程终端尺寸和 xterm 尺寸同步。只读日志场景问题不大；交互式终端场景建议同步。

## 12. 监听 `server-ready`

项目里这样监听开发服务器就绪：

```ts
container.on("server-ready", (_port, url) => {
  setPreviewUrl(url);
  setStatus("running");
});
```

API：

```ts
container.on("server-ready", (port, url) => {
  iframe.src = url;
});
```

含义：

- `port`：容器内应用监听的端口，比如 Vite 常见的 `5173`。
- `url`：浏览器可访问的代理 URL。

WebContainer 内部会把容器端口映射成浏览器可访问地址。你不需要手动拼 `localhost:5173`，直接使用 `url` 即可。

在 Polaris 里：

```tsx
{previewUrl && <iframe src={previewUrl} />}
```

这就是预览能显示的原因。

`container.on(...)` 返回一个取消监听函数：

```ts
const unsubscribe = container.on("server-ready", (port, url) => {
  console.log(port, url);
});

unsubscribe();
```

Polaris 当前没有保存这个 unsubscribe。由于重启时会 teardown 整个容器，实际影响有限；但如果以后同一个容器多次挂载、重复启动，建议在 effect cleanup 中取消监听。

## 13. 监听 `port`

除了 `server-ready`，WebContainer 还有 `port` 事件：

```ts
container.on("port", (port, type, url) => {
  console.log(port, type, url);
});
```

参数：

- `port`：端口号。
- `type`：`"open"` 或 `"close"`。
- `url`：端口对应的访问地址。

`server-ready` 更适合“找到主预览地址”。`port` 更适合做调试信息或多服务端口面板，例如同时运行前端 `5173` 和后端 `3000`。

## 14. 监听 `error`

WebContainer 可能产生内部错误，可以监听：

```ts
container.on("error", (error) => {
  console.error(error.message);
});
```

Polaris 当前主要通过 `try/catch` 捕获 boot、mount、spawn 和 install exit code 错误：

```ts
try {
  // boot / mount / install / dev
} catch (error) {
  setError(error instanceof Error ? error.message : "Unknown error");
  setStatus("error");
}
```

这能覆盖大部分启动阶段错误。若要增强诊断，可以再加：

```ts
const unsubscribeError = container.on("error", (error) => {
  appendOutput(`\n[webcontainer] ${error.message}\n`);
  setError(error.message);
  setStatus("error");
});
```

## 15. WebContainer 文件系统 API

WebContainer 实例有一个 `fs`：

```ts
container.fs
```

它的设计接近 Node 的 `fs.promises`，但所有路径都限制在容器工作目录内。

常用 API：

```ts
await container.fs.readFile("package.json", "utf-8");
await container.fs.writeFile("src/App.tsx", code);
await container.fs.readdir("src");
await container.fs.mkdir("src/components", { recursive: true });
await container.fs.rm("src/old.ts", { force: true });
await container.fs.rename("src/a.ts", "src/b.ts");
```

### 15.1 `writeFile`

项目热更新文件时使用：

```ts
container.fs.writeFile(filePath, file.content);
```

它把 Convex 中最新的文件内容写入容器文件系统。开发服务器监听到文件变化后，通常会触发 HMR。

更严谨的写法是等待写入完成，并处理错误：

```ts
await container.fs.writeFile(filePath, file.content);
```

如果批量同步：

```ts
await Promise.all(
  files.map((file) => {
    const filePath = getFilePath(file, filesMap);
    return container.fs.writeFile(filePath, file.content ?? "");
  })
);
```

Polaris 当前在 effect 中没有 `await`，这在多数热更新场景可用，但如果写入失败，错误不容易显示出来。

### 15.2 `readFile`

读取文件：

```ts
const packageJson = await container.fs.readFile("package.json", "utf-8");
```

如果不传编码，返回 `Uint8Array`：

```ts
const bytes = await container.fs.readFile("public/logo.png");
```

### 15.3 `readdir`

读取目录：

```ts
const names = await container.fs.readdir("src");
```

带文件类型：

```ts
const entries = await container.fs.readdir("src", {
  withFileTypes: true,
});

for (const entry of entries) {
  if (entry.isDirectory()) {
    console.log("folder", entry.name);
  }
}
```

### 15.4 `mkdir`

创建目录：

```ts
await container.fs.mkdir("src/components", {
  recursive: true,
});
```

如果写入某个深层文件前目录不存在，需要先创建目录。

### 15.5 `rm`

删除文件或目录：

```ts
await container.fs.rm("src/old.ts", {
  force: true,
});

await container.fs.rm("dist", {
  recursive: true,
  force: true,
});
```

### 15.6 `rename`

重命名或移动：

```ts
await container.fs.rename("src/old.ts", "src/new.ts");
```

### 15.7 `watch`

监听文件变化：

```ts
const watcher = container.fs.watch("src", { recursive: true }, (event, filename) => {
  console.log(event, filename);
});

watcher.close();
```

Polaris 当前是“Convex 文件变化 -> 写入 WebContainer”，没有反向监听“WebContainer 文件变化 -> 写回 Convex”。如果以后支持终端内生成文件并同步回数据库，可以考虑 `watch` 或执行命令后主动 `export()`。

## 16. 文件热更新同步

Polaris 中第二个 effect 负责把文件变更同步进 WebContainer：

```ts
useEffect(() => {
  const container = containerRef.current;
  if (!container || !files || status !== "running") return;

  const filesMap = new Map(files.map((f) => [f._id, f]));

  for (const file of files) {
    if (file.type !== "file" || file.storageId || !file.content) continue;

    const filePath = getFilePath(file, filesMap);
    container.fs.writeFile(filePath, file.content);
  }
}, [files, status]);
```

这段逻辑的目标是：

```txt
用户或 AI 修改 Convex 文件
  -> useFiles(projectId) 实时拿到新 files
  -> effect 触发
  -> container.fs.writeFile
  -> dev server HMR
  -> iframe 更新
```

需要注意一个细节：

```ts
if (file.type !== "file" || file.storageId || !file.content) continue;
```

这里使用 `!file.content` 会跳过空字符串文件。也就是说，如果某个文件内容被清空为 `""`，当前逻辑不会把这个空内容同步到 WebContainer。

更精确的判断可以是：

```ts
if (file.type !== "file" || file.storageId || file.content === undefined) {
  continue;
}
```

这样空文件也能同步。

## 17. 终端输出如何显示到页面

WebContainer 只提供输出流，真正的终端 UI 是 xterm。

文件：`src/features/preview/components/preview-terminal.tsx`

初始化：

```tsx
const terminal = new Terminal({
  convertEol: true,
  disableStdin: true,
  fontSize: 12,
  fontFamily: "monospace",
  theme: { background: "#1f2228" },
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(containerRef.current);
```

增量写入：

```ts
const newData = output.slice(lastLengthRef.current);

if (newData) {
  terminalRef.current.write(newData);
  lastLengthRef.current = output.length;
}
```

为什么要记录 `lastLengthRef`？

因为父组件传进来的 `output` 是完整字符串。如果每次都 `terminal.write(output)`，终端会重复显示旧内容。记录上一次长度后，只写新增部分。

输出被清空时：

```ts
if (output.length < lastLengthRef.current) {
  terminalRef.current.clear();
  lastLengthRef.current = 0;
}
```

这对应 `restart()` 时清空 `terminalOutput` 的场景。

## 18. 预览设置如何影响命令

文件：`src/features/preview/components/preview-settings-popover.tsx`

用户可以配置：

- `installCommand`
- `devCommand`

保存后写入项目设置：

```ts
await updateSettings({
  id: projectId,
  settings: {
    installCommand: value.installCommand || undefined,
    devCommand: value.devCommand || undefined,
  },
});

onSave?.();
```

`PreviewView` 把设置传给 `useWebContainer`：

```tsx
settings: project?.settings
```

`useWebContainer` 使用默认值：

```ts
const installCmd = settings?.installCommand || "npm install";
const devCmd = settings?.devCommand || "npm run dev";
```

这让不同项目可以用不同启动方式，例如：

```txt
npm install
npm run dev
```

或：

```txt
pnpm install
pnpm dev
```

或：

```txt
npm install
npm start
```

## 19. 重启与销毁

项目中销毁容器：

```ts
const teardownWebContainer = () => {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
  bootPromise = null;
};
```

重启：

```ts
const restart = useCallback(() => {
  teardownWebContainer();
  containerRef.current = null;
  hasStartedRef.current = false;
  setStatus("idle");
  setPreviewUrl(null);
  setError(null);
  setRestartKey((k) => k + 1);
}, []);
```

`teardown()` 的含义：

- 销毁当前 WebContainer 实例。
- 释放资源。
- 这个实例上的文件系统、进程等对象都不能继续使用。
- 之后可以再次调用 `WebContainer.boot()` 获取新实例。

为什么重启时要 `setRestartKey((k) => k + 1)`？

因为启动逻辑在 effect 中：

```ts
useEffect(() => {
  // start
}, [enabled, files, restartKey, settings?.devCommand, settings?.installCommand]);
```

改变 `restartKey` 可以明确触发 effect 重新执行。

## 20. `container.export()` API

Polaris 当前没有在预览模块使用 `export()`，但它和项目的“导出”概念很容易混淆，所以单独说明。

WebContainer 的 `export()` 是从容器文件系统中导出文件：

```ts
const tree = await container.export(".", {
  format: "json",
});
```

也可以导出二进制或 zip：

```ts
const zip = await container.export(".", {
  format: "zip",
  excludes: ["node_modules"],
});
```

适用场景：

- 用户在 WebContainer 里运行脚本生成了文件。
- 需要把容器内最新文件同步回数据库。
- 需要下载当前项目快照。

Polaris 目前 GitHub 导出走的是 Convex 中保存的项目文件，而不是 WebContainer `export()`。也就是说，预览容器只是运行环境，不是项目数据源。

## 21. 预览错误转发

WebContainer 支持：

```ts
const container = await WebContainer.boot({
  coep: "credentialless",
  forwardPreviewErrors: true,
});
```

然后监听：

```ts
container.on("preview-message", (message) => {
  console.log(message);
});
```

`preview-message` 可用于接收预览 iframe 中的错误，例如：

- `console.error`
- `unhandledrejection`
- 未捕获异常

一个简单示例：

```ts
const container = await WebContainer.boot({
  coep: "credentialless",
  forwardPreviewErrors: "exceptions-only",
});

container.on("preview-message", (message) => {
  appendOutput(`\n[preview:${message.type}] ${JSON.stringify(message)}\n`);
});
```

如果 Polaris 以后要把运行时报错显示在预览面板中，这个 API 很合适。

## 22. 一个最小 WebContainer 预览示例

下面是一个不依赖 Polaris 数据库的最小示例：

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { WebContainer, type FileSystemTree } from "@webcontainer/api";

const files: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify({
        scripts: {
          dev: "vite --host 0.0.0.0",
        },
        dependencies: {
          "@vitejs/plugin-react": "latest",
          vite: "latest",
          typescript: "latest",
          react: "latest",
          "react-dom": "latest",
        },
        devDependencies: {},
      }),
    },
  },
  "index.html": {
    file: {
      contents: `<div id="root"></div><script type="module" src="/src/main.jsx"></script>`,
    },
  },
  src: {
    directory: {
      "main.jsx": {
        file: {
          contents: `
import React from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <h1>Hello WebContainer</h1>
);
`,
        },
      },
    },
  },
};

export function MiniPreview() {
  const [url, setUrl] = useState<string | null>(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    async function start() {
      const container = await WebContainer.boot({ coep: "credentialless" });

      await container.mount(files);

      const install = await container.spawn("npm", ["install"]);
      install.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          },
        })
      );

      const exitCode = await install.exit;
      if (exitCode !== 0) {
        throw new Error("Install failed");
      }

      container.on("server-ready", (_port, readyUrl) => {
        setUrl(readyUrl);
      });

      await container.spawn("npm", ["run", "dev"]);
    }

    start();
  }, []);

  return url ? <iframe src={url} /> : <div>Starting...</div>;
}
```

把这个示例和 Polaris 对比，会发现 Polaris 只是把固定 `files` 换成了 Convex 中的项目文件，并增加了终端、设置、重启和热更新。

## 23. Polaris 版本的简化伪代码

把项目里的逻辑压缩后是：

```ts
async function startPreview(projectId: Id<"projects">) {
  const files = await loadFilesFromConvex(projectId);
  const tree = buildFileTree(files);

  const container = await getWebContainer();

  await container.mount(tree);

  container.on("server-ready", (port, url) => {
    setPreviewUrl(url);
  });

  const install = await container.spawn("npm", ["install"]);
  install.output.pipeTo(terminalWriter);

  if ((await install.exit) !== 0) {
    throw new Error("Install failed");
  }

  const dev = await container.spawn("npm", ["run", "dev"]);
  dev.output.pipeTo(terminalWriter);
}
```

这就是整个预览系统的主干。

## 24. 常见问题与排查方向

### 24.1 WebContainer boot 失败

优先检查：

- 页面是否是 HTTPS 或 localhost。
- `Cross-Origin-Embedder-Policy` 是否和 `boot({ coep })` 一致。
- `Cross-Origin-Opener-Policy` 是否为 `same-origin`。
- 浏览器是否支持 WebContainer 所需能力。
- 是否有浏览器插件阻止第三方 cookie 或相关资源。

### 24.2 一直停在 Installing

可能原因：

- `npm install` 卡住或下载失败。
- `package.json` 不合法。
- 依赖包不支持 WebContainer 环境。
- 命令被错误拆分。

可以从终端输出里看具体错误。Polaris 已经把 `installProcess.output` 接到了 xterm。

### 24.3 没有预览 URL

可能原因：

- dev server 没有成功监听端口。
- dev 命令不对。
- 框架默认只监听 `localhost`，没有绑定到 `0.0.0.0`。
- 项目缺少 `package.json` 或 `scripts.dev`。

Vite 项目通常建议：

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0"
  }
}
```

### 24.4 文件改了但预览没更新

优先检查：

- Convex 的 `files` 是否真的更新。
- `useFiles(projectId)` 是否返回了新数据。
- 当前 `status` 是否是 `"running"`。
- 文件内容是否为空字符串，当前逻辑会跳过空字符串。
- 文件是否带 `storageId`，当前逻辑会跳过。

### 24.5 重启后输出重复或事件重复

可能是多次注册事件监听没有取消。可以保存 unsubscribe：

```ts
useEffect(() => {
  let unsubscribe: (() => void) | undefined;

  async function start() {
    const container = await getWebContainer();
    unsubscribe = container.on("server-ready", (_port, url) => {
      setPreviewUrl(url);
    });
  }

  start();

  return () => {
    unsubscribe?.();
  };
}, []);
```

## 25. 当前实现值得留意的点

这些不是“必须马上修改”的问题，而是学习项目时值得理解的取舍。

### 25.1 命令解析比较简单

当前代码：

```ts
const [devBin, ...devArgs] = devCmd.split(" ");
```

优点是简单。缺点是不支持复杂引号和 shell 语法。

更产品化的设计可以是：

```ts
{
  installCommand: "npm",
  installArgs: ["install"],
  devCommand: "npm",
  devArgs: ["run", "dev"]
}
```

或者 UI 上分别提供：

```txt
Command: npm
Arguments: run dev
```

### 25.2 文件删除和重命名没有完全同步到容器

当前热更新 effect 只做 `writeFile`：

```ts
container.fs.writeFile(filePath, file.content);
```

如果 Convex 中删除了文件，容器里旧文件可能还存在，直到重启重新 mount。

更完整的同步策略可以是：

- 维护上一轮文件路径集合。
- 本轮不存在的路径执行 `fs.rm`。
- 新增或修改的路径执行 `fs.writeFile`。
- 重命名可以视为删除旧路径 + 写入新路径。

### 25.3 空文件同步会被跳过

当前判断：

```ts
!file.content
```

会跳过 `""`。如果用户把文件清空，容器内仍可能保留旧内容。

更准确：

```ts
file.content === undefined
```

### 25.4 二进制文件会被跳过

`buildFileTree` 和热更新都跳过 `storageId` 文件：

```ts
!file.storageId
```

这意味着图片、字体等二进制资源如果只存在存储系统中，预览时可能缺失。解决方式通常是：

- 从 Convex Storage 拉取二进制内容。
- 转成 `Uint8Array`。
- 用 `{ file: { contents: bytes } }` 挂载。

### 25.5 没有保存 devProcess

当前启动 dev server 后没有保存进程对象：

```ts
const devProcess = await container.spawn(devBin, devArgs);
```

如果以后需要“只重启命令，不销毁整个容器”，可以：

```ts
const devProcessRef = useRef<WebContainerProcess | null>(null);

devProcessRef.current?.kill();
devProcessRef.current = await container.spawn("npm", ["run", "dev"]);
```

## 26. API 速查表

| API | 项目是否使用 | 作用 |
| --- | --- | --- |
| `WebContainer.boot(options)` | 是 | 启动浏览器内 Node 运行时 |
| `container.mount(tree)` | 是 | 把项目文件挂载进容器文件系统 |
| `container.spawn(command, args)` | 是 | 执行命令，例如 `npm install` |
| `process.output` | 是 | 读取命令终端输出 |
| `process.exit` | 是 | 等待进程退出码 |
| `process.kill()` | 间接相关 | 杀掉进程，当前项目用 teardown 销毁整体 |
| `container.on("server-ready")` | 是 | 获取可用于 iframe 的预览 URL |
| `container.on("port")` | 否 | 监听端口打开和关闭 |
| `container.on("error")` | 否 | 监听 WebContainer 内部错误 |
| `container.on("preview-message")` | 否 | 接收预览 iframe 中的错误消息 |
| `container.fs.writeFile` | 是 | 热更新文件内容 |
| `container.fs.readFile` | 否 | 读取容器文件 |
| `container.fs.readdir` | 否 | 读取目录 |
| `container.fs.mkdir` | 否 | 创建目录 |
| `container.fs.rm` | 否 | 删除文件或目录 |
| `container.fs.rename` | 否 | 重命名或移动 |
| `container.fs.watch` | 否 | 监听容器内文件变化 |
| `container.export(path)` | 否 | 导出容器文件系统快照 |
| `container.teardown()` | 是 | 销毁容器并释放资源 |

## 27. 学习这块代码的推荐顺序

建议按这个顺序读：

1. 先看 `next.config.ts`，理解 WebContainer 为什么需要 COEP/COOP。
2. 看 `src/features/projects/components/preview-view.tsx`，理解 UI 怎么消费 `previewUrl`、`status`、`terminalOutput`。
3. 看 `src/features/preview/hooks/use-webcontainer.ts`，理解 boot、mount、install、dev、server-ready。
4. 看 `src/features/preview/utils/file-tree.ts`，理解 Convex 扁平文件如何变成 WebContainer 文件树。
5. 看 `src/features/preview/components/preview-terminal.tsx`，理解命令输出如何进入 xterm。
6. 看 `src/features/preview/components/preview-settings-popover.tsx`，理解不同项目如何配置安装和启动命令。

读完这六个文件，Polaris 的预览系统主线基本就通了。

## 28. 一句话总结

Polaris 中的 WebContainer 并不是一个“预览组件”，而是一套浏览器内运行环境。项目把 Convex 中的文件转换成 `FileSystemTree` 挂载进去，用 `spawn()` 执行安装和启动命令，用 `server-ready` 拿到预览 URL，再交给 iframe 展示；编辑器或 AI 修改文件后，再通过 `container.fs.writeFile()` 把变化同步进容器，形成在线代码工作台的实时预览体验。
