## 1. 核心概念：State、View、Transaction

CodeMirror 6 的核心架构基于三个基本概念：

### State（状态）
- **不可变对象**，表示编辑器的完整状态
- 包含文档内容、选区、光标位置等所有信息
- 每次修改都会创建一个新状态（旧状态保持不变）
- 通过 `state.doc` 访问文档，`state.selection` 访问选区

### View（视图）
- **可变对象**，负责将状态渲染到 DOM
- 持有对 State 的引用，但本身不存储内容
- 负责处理用户交互（键盘、鼠标事件）
- 通过 `view.state` 获取当前状态

### Transaction（事务）
- 描述状态变更的载体
- 包含变更内容、选区调整、效果等信息
- 通过 `view.dispatch()` 提交事务，触发状态更新

```
用户输入 → View 捕获事件 → 创建 Transaction → 提交到 State → 新 State 生成 → View 重渲染
```

---

## 2. 声明式配置 vs 命令式 API

### 命令式 API（传统方式）
```javascript
// 传统方式：手动操作 DOM 和状态
editor.setValue("Hello");
editor.setCursor(10);
editor.getSelection();
```

### 声明式配置（CM6 方式）
```javascript
// CM6：将功能封装为 Extension，通过配置组合
const editor = new EditorView({
  state: EditorState.create({
    doc: "Hello",
    extensions: [
      lineNumbers(),           // 行号
      syntaxHighlighting(defaultHighlightStyle), // 语法高亮
      keymap.of(defaultKeymap), // 快捷键
    ],
  }),
});
```

**优势：**
- 配置即功能，无需手动同步 DOM 和状态
- 扩展可组合、可复用
- 更容易实现复杂功能（撤销历史、多选区等）

---

## 3. 基础组件：EditorView

`EditorView` 是编辑器的核心视图组件。

### 构造函数参数

```typescript
new EditorView({
  state?: EditorState,           // 初始状态（若不提供则需提供 doc）
  doc?: string | TransactionSpec,// 初始文档内容
  parent?: Element,              // 挂载的 DOM 元素
  extensions?: Extension[],      // 扩展列表
  dispatch?: (tr: Transaction) => void, // 自定义 dispatch 处理
})
```

### 常用属性

| 属性          | 类型            | 说明                              |
| ----------- | ------------- | ------------------------------- |
| `state`     | `EditorState` | 当前编辑器状态                         |
| `doc`       | `Doc`         | 文档对象（快捷方式，等于 `state.doc`）       |
| `selection` | `Selection`   | 当前选区（快捷方式，等于 `state.selection`） |

### 常用方法

| 方法                          | 返回值       | 说明           |
| --------------------------- | --------- | ------------ |
| `dispatch(tr: Transaction)` | `void`    | 提交事务，更新状态    |
| `destroy()`                 | `void`    | 销毁编辑器，清理事件监听 |
| `focus()`                   | `void`    | 聚焦编辑器        |
| `hasFocus()`                | `boolean` | 检查是否聚焦       |
| `update(...plugins)`        | `void`    | 批量更新插件       |

### 项目中的用法

```typescript
// src/features/editor/components/code-editor.tsx
const view = new EditorView({
  doc: initialValue,              // 初始文档
  parent: editorRef.current,     // 挂载到 div
  extensions: [
    languageExtension,
    oneDark,
    customTheme,
    customSetup,
    suggestion(fileName),
    keymap.of([indentWithTab]),
    minimap(),
    indentationMarkers(),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ],
});
```

---

## 4. 状态管理：EditorState

`EditorState` 是编辑器的不可变状态对象。

### 创建状态

```typescript
EditorState.create({
  doc?: string | Doc,           // 初始文档内容
  extensions?: Extension[],      // 扩展列表
  selection?: Selection,        // 初始选区
  traps?: Extension traps,      // 陷阱配置
})
```

### 常用属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `doc` | `Doc` | 文档内容 |
| `selection` | `Selection` | 选区信息 |
| `plugins` | `PluginField[]` | 插件状态 |

### 常用方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `toString()` | `string` | 获取文档文本 |
| `sliceString(from, to)` | `string` | 获取指定范围文本 |
| `line(pos)` | `Line` | 获取指定位置的行 |
| `lineAt(pos)` | `Line` | 获取指定位置的行（从任意位置） |
| `lines` | `number` | 总行数 |
| `field(field)` | `any` | 获取状态字段值 |

### Doc 对象

```typescript
// 获取文档内容
state.doc.toString();

// 获取行数
state.doc.lines;

// 获取指定行
state.doc.line(n);  // n 从 1 开始
state.doc.lineAt(pos); // 根据字符位置获取行

// 根据行号获取行的信息
const line = state.doc.line(lineNumber);
line.text     // 行文本
line.from     // 行起始位置
line.to       // 行结束位置
line.number   // 行号
```

---

## 5. 状态字段：StateField

`StateField` 用于在编辑器状态中存储自定义数据。

### 定义语法

```typescript
const myField = StateField.define<T>({
  // 初始化函数，创建字段的初始值
  create() {
    return initialValue;
  },

  // 更新函数，每次事务时调用
  update(value, transaction) {
    // 检查是否有相关的 effects 需要处理
    for (const effect of transaction.effects) {
      if (effect.is(myEffect)) {
        return effect.value; // 返回新值
      }
    }
    return value; // 否则保持原值
  },

  // 可选：提供字段给其他扩展使用
  provide?: (field) => Extension,
})
```

### 参数详解

| 参数 | 类型 | 说明 |
|------|------|------|
| `create()` | `() => T` | 返回字段的初始值 |
| `update(value, transaction)` | `(T, Transaction) => T` | 处理事务更新，返回新值 |
| `provide(field)` | `(Field) => Extension` | 可选，向外提供扩展 |

### Transaction 对象

| 属性 | 类型 | 说明 |
|------|------|------|
| `docChanged` | `boolean` | 文档是否改变 |
| `selectionSet` | `boolean` | 选区是否改变 |
| `effects` | `readonly Effect[]` | 所有效果列表 |
| `state` | `EditorState` | 事务后的新状态 |

### 项目中的用法

```typescript
// src/features/editor/extensions/suggestion/index.ts

// 定义一个用于设置建议文本的效果类型
const setSuggestionEffect = StateEffect.define<string | null>();

// 定义状态字段，存储建议文本
const suggestionState = StateField.define<string | null>({
  // 编辑器初始化时执行一次
  create() {
    return null;
  },
  // 每次用户操作时都会执行
  update(value, transaction) {
    // 如果我们找到 setSuggestionEffect，返回它的新值
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value; // 否则保持当前值不变
  },
});
```

---

## 6. 状态效果：StateEffect

`StateEffect` 是用于在事务中传递状态变更的机制。

### 定义效果

```typescript
// 定义一个效果类型
const setValueEffect = StateEffect.define<string>();

// 创建效果实例
const effect = setValueEffect.of("new value");
```

### 效果方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `of(value)` | `StateEffect<T>` | 创建携带值的效果 |

### 在 dispatch 中使用

```typescript
view.dispatch({
  effects: setSuggestionEffect.of("suggested text"),
});
```

### 在 StateField 中读取

```typescript
update(value, transaction) {
  for (const effect of transaction.effects) {
    if (effect.is(setSuggestionEffect)) {
      return effect.value;
    }
  }
  return value;
}
```

### 判断效果类型

```typescript
// 使用 is() 方法判断效果类型
if (effect.is(myEffect)) {
  // 处理这个效果
}
```

### 项目中的用法

```typescript
// src/features/editor/extensions/quick-edit/index.ts

// 定义一个控制 quick edit 显示的效果
export const showQuickEditEffect = StateEffect.define<boolean>();

// 在快捷键中触发效果
view.dispatch({
  effects: showQuickEditEffect.of(true),
});

// 在 StateField 中监听效果
export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return effect.value;
      }
    }
    return value;
  }
});
```

---

## 7. 视图插件：ViewPlugin

`ViewPlugin` 用于创建与视图交互的插件，可以监听视图更新、执行渲染等。

### 定义语法

```typescript
const myPlugin = ViewPlugin.fromClass(
  class {
    // 构造函数，接收 EditorView 实例
    constructor(view: EditorView) {
      // 初始化
    }

    // 可选：每次视图更新时调用
    update(update: ViewUpdate) {
      // 检查 update.docChanged, update.selectionSet 等
    }

    // 可选：插件销毁时清理
    destroy() {
      // 清理资源
    }
  },
  // 可选：插件提供的扩展
  {
    decorations: (plugin) => plugin.decorations,
  }
);
```

### ViewUpdate 对象

| 属性 | 类型 | 说明 |
|------|------|------|
| `docChanged` | `boolean` | 文档是否改变 |
| `selectionSet` | `boolean` | 选区是否改变 |
| `view` | `EditorView` | 视图引用 |
| `transactions` | `readonly Transaction[]` | 触发此次更新的事务列表 |

### decorations 选项

当插件需要提供装饰时，使用 `decorations` 选项：

```typescript
const myPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      // 返回装饰集合
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  }
);
```

### 项目中的用法

```typescript
// src/features/editor/extensions/suggestion/index.ts

// 创建防抖插件
const createDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        // 监听文档或选区变化
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        // 执行建议逻辑
      }

      destroy() {
        // 清理定时器等资源
      }
    }
  );
};

// 创建渲染插件
const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      const suggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });

      if (update.docChanged || update.selectionSet || suggestionChanged) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      // 构建装饰
    }
  },
  { decorations: (plugin) => plugin.decorations }
);
```

---

## 8. 装饰器：Decoration

`Decoration` 用于在编辑器中创建可视元素，如标记、部件、线条等。

### 装饰类型

#### 8.1 部件装饰（Widget Decoration）

在指定位置插入自定义 DOM 元素：

```typescript
Decoration.widget({
  widget: new SuggestionWidget(text),  // WidgetType 实例
  side: 1,                             // 1=光标后，-1=光标前
  block: false,                         // false=行内，true=块级
})
```

#### 8.2 标记装饰（Mark Decoration）

为文本范围添加样式：

```typescript
Decoration.mark({
  class: "my-highlight",  // CSS 类名
  attributes: {            // 其他 HTML 属性
    title: "highlighted"
  }
})
```

#### 8.3 行装饰（Line Decoration）

为整行添加样式：

```typescript
Decoration.line({
  class: "my-line-class",
  attributes: { role: "button" }
})
```

### DecorationSet

装饰的集合，用于管理一组装饰：

```typescript
// 创建装饰集合
const decorations = Decoration.set([
  decoration1.range(start),
  decoration2.range(start, end),
]);

// 空集合
Decoration.none;
```

### 项目中的用法

```typescript
// src/features/editor/extensions/suggestion/index.ts

// WidgetType：创建自定义 DOM 元素
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";         // 幽灵文字外观
    span.style.pointerEvents = "none";   // 不要干扰点击
    return span;
  }
}

// 构建装饰
build(view: EditorView) {
  const cursor = view.state.selection.main.head;
  return Decoration.set([
    Decoration.widget({
      widget: new SuggestionWidget(suggestion),
      side: 1,  // 在光标之后渲染
    }).range(cursor),
  ]);
}
```

### WidgetType 抽象类

创建自定义 DOM 元素的基类：

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `toDOM()` | `HTMLElement` | 返回要渲染的 DOM 元素 |
| `eq(widget)` | `boolean` | 比较两个 widget 是否相等（用于更新优化） |
| `destroy()` | `void` | 清理资源 |

---

## 9. 快捷键：keymap

`keymap` 用于绑定键盘快捷键到处理函数。

### 基本用法

```typescript
keymap.of([
  {
    key: "Mod-k",           // Mod = Ctrl/Cmd
    run: (view) => {
      // 处理逻辑
      return true;           // true = 阻止默认行为
    },
    shift: (view) => { ... } // 可选：Shift + 键的处理
  },
])
```

### 快捷键格式

| 格式 | 说明 |
|------|------|
| `Mod-k` | Ctrl/Cmd + K |
| `Shift-Alt-x` | Shift + Alt + X |
| `Ctrl-Enter` | Ctrl + Enter |
| `F1` | 功能键 |

### run vs shift

- `run`: 按下按键时的处理函数
- `shift`: 按下 Shift+按键时的处理函数

### 返回值

| 返回值 | 含义 |
|--------|------|
| `true` | 已处理，阻止默认行为 |
| `false` | 未处理，让其他处理器处理 |

### 项目中的用法

```typescript
// src/features/editor/extensions/suggestion/index.ts

// 自定义 Tab 快捷键
const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false; // 没有建议？让 Tab 做它正常的事情（缩进）
      }

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion },
        selection: { anchor: cursor + suggestion.length },
        effects: setSuggestionEffect.of(null),
      });
      return true;
    },
  },
]);

// src/features/editor/extensions/custom-setup.ts

// 组合多个快捷键映射
keymap.of([
  ...closeBracketsKeymap,
  ...defaultKeymap,
  ...searchKeymap,
  ...historyKeymap,
  ...foldKeymap,
  ...completionKeymap,
  ...lintKeymap,
]),
```

### 常用快捷键映射

| 映射 | 来源 | 说明 |
|------|------|------|
| `defaultKeymap` | `@codemirror/commands` | 回车、Tab 等默认快捷键 |
| `historyKeymap` | `@codemirror/commands` | 撤销/重做 |
| `searchKeymap` | `@codemirror/search` | 搜索相关 |
| `closeBracketsKeymap` | `@codemirror/autocomplete` | 自动闭合括号 |
| `completionKeymap` | `@codemirror/autocomplete` | 自动完成 |
| `foldKeymap` | `@codemirror/language` | 折叠代码 |
| `lintKeymap` | `@codemirror/lint` | 语法检查 |

---

## 10. 主题系统

### EditorView.theme()

用于定义编辑器的样式：

```typescript
const customTheme = EditorView.theme({
  // 编辑器根元素
  "&": {
    outline: "none !important",
    height: "100%",
  },
  // 内容区域
  ".cm-content": {
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "14px",
  },
  // 滚动条
  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
  // 其他可选选择器
  ".cm-line": { ... },
  ".cm-gutters": { ... },
  ".cm-activeLine": { ... },
}, {
  // 可选：主题的优先级
  theme: "light",
});
```

### 选择器参考

| 选择器 | 说明 |
|--------|------|
| `&` | 编辑器根元素 |
| `.cm-content` | 文本内容区域 |
| `.cm-scroller` | 滚动区域 |
| `.cm-gutters` | 侧边栏（行号等） |
| `.cm-lineNumbers` | 行号 |
| `.cm-activeLine` | 当前行 |
| `.cm-activeLineGutter` | 当前行的侧边栏 |
| `.cm-selectionBackground` | 选区背景 |
| `.cm-cursor` | 光标 |

### 项目中的用法

```typescript
// src/features/editor/extensions/theme.ts
export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "14px",
  },
  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
});
```

### 预置主题

```typescript
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@codemirror/theme-github";

extensions: [
  oneDark,           // 使用暗色主题
  // githubLight,    // 或亮色主题
]
```

---

## 11. 语言支持

### 获取语言扩展

```typescript
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";

const ext = getLanguageExtension("test.tsx");

function getLanguageExtension(filename: string): Extension {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":    return javascript();
    case "jsx":   return javascript({ jsx: true });
    case "ts":    return javascript({ typescript: true });
    case "tsx":   return javascript({ typescript: true, jsx: true });
    case "html":  return html();
    case "css":   return css();
    case "json":  return json();
    case "md":
    case "mdx":   return markdown();
    case "py":    return python();
    default:      return [];
  }
}
```

### 语言扩展选项

```typescript
// JavaScript/TypeScript
javascript({ jsx?: boolean, typescript?: boolean })
typescript({ jsx?: boolean })  // TypeScript 专用

// HTML
html({ matchClosingTags?: boolean, autoCloseTags?: boolean })

// CSS
css({ selfClosing?: boolean })

// JSON
json()
```

---

## 12. 内置扩展

### 来自 `@codemirror/view`

| 扩展 | 说明 |
|------|------|
| `lineNumbers()` | 显示行号 |
| `highlightActiveLine()` | 高亮当前行 |
| `highlightActiveLineGutter()` | 高亮当前行的行号 |
| `highlightSpecialChars()` | 高亮特殊字符（制表符等） |
| `drawSelection()` | 显示选区 |
| `dropCursor()` | 拖拽时显示光标 |
| `rectangularSelection()` | 矩形选区支持 |
| `crosshairCursor()` | 十字准星光标 |
| `EditorView.updateListener` | 监听更新事件 |
| `keymap.of()` | 快捷键映射 |

### 来自 `@codemirror/language`

| 扩展 | 说明 |
|------|------|
| `syntaxHighlighting(defaultHighlightStyle)` | 语法高亮 |
| `indentOnInput()` | 根据输入自动调整缩进 |
| `bracketMatching()` | 括号匹配 |
| `foldGutter()` | 折叠 gutter |
| `foldKeymap` | 折叠快捷键 |
| `indentUnit` | 缩进单位 |

### 来自 `@codemirror/commands`

| 扩展 | 说明 |
|------|------|
| `defaultKeymap` | 默认快捷键 |
| `history()` | 撤销/重做历史 |
| `historyKeymap` | 历史快捷键 |
| `indentWithTab` | Tab 键缩进 |

### 来自 `@codemirror/autocomplete`

| 扩展 | 说明 |
|------|------|
| `autocompletion()` | 自动完成 |
| `completionKeymap` | 完成快捷键 |
| `closeBrackets()` | 自动闭合括号 |
| `closeBracketsKeymap` | 闭合括号快捷键 |

### 来自 `@codemirror/search`

| 扩展 | 说明 |
|------|------|
| `searchKeymap` | 搜索快捷键 |
| `highlightSelectionMatches()` | 高亮选区匹配 |

### 来自 `@codemirror/lint`

| 扩展 | 说明 |
|------|------|
| `lintKeymap` | 语法检查快捷键 |

### 项目中的完整 setup

```typescript
// src/features/editor/extensions/custom-setup.ts
export const customSetup: Extension = (() => [
  indentUnit.of("    "),          // 4 个空格缩进
  indentOnInput(),                // 输入时调整缩进
  lineNumbers(),                  // 行号
  highlightActiveLineGutter(),    // 高亮当前行号
  highlightSpecialChars(),        // 高亮特殊字符
  history(),                      // 撤销/重做
  foldGutter({                    // 折叠
    markerDOM(open) {
      const icon = document.createElement("div");
      icon.className = "flex items-center justify-center size-4 cursor-pointer pt-0.5";
      icon.innerHTML = open ? foldGutterOpenSvg : foldGutterClosedSvg;
      return icon;
    },
  }),
  drawSelection(),                // 显示选区
  dropCursor(),                   // 拖拽光标
  EditorState.allowMultipleSelections.of(true), // 多选区
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // 语法高亮
  bracketMatching(),              // 括号匹配
  closeBrackets(),                // 自动闭合
  autocompletion(),               // 自动完成
  rectangularSelection(),         // 矩形选区
  crosshairCursor(),              // 十字光标
  highlightActiveLine(),          // 高亮当前行
  highlightSelectionMatches(),    // 高亮匹配
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
])();
```

---

## 13. Tooltip 系统

### Tooltip 结构

```typescript
const tooltip: Tooltip = {
  pos: number,           // tooltip 定位位置（字符偏移）
  above?: boolean,        // 是否在上方显示（默认在下方）
  strictSide?: boolean,   // 是否严格在一侧
  create(): DOMElement,   // 创建 DOM 元素
};
```

### showTooltip

用于显示 tooltip 的插件：

```typescript
import { showTooltip } from "@codemirror/view";

// 在 StateField 的 provide 中使用
provide: (field) => showTooltip.computeN(
  [field],
  (state) => state.field(field),
),
```

### 创建 Tooltip 字段

```typescript
const myTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createTooltip(state);
  },

  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createTooltip(transaction.state);
    }
    return tooltips;
  },

  provide: (field) => showTooltip.computeN(
    [field],
    (state) => state.field(field),
  ),
});
```

### 项目中的用法

```typescript
// src/features/editor/extensions/selection-tooltip.ts

const createTooltipForSelection = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) {
    return [];
  }

  return [
    {
      pos: selection.to,       // 在选区结束位置显示
      above: false,            // 下方显示
      strictSide: false,       // 允许在边缘溢出
      create() {
        const dom = document.createElement("div");

        const addToChatButton = document.createElement("button");
        addToChatButton.textContent = "Add to Chat";

        const quickEditButton = document.createElement("button");
        quickEditButton.textContent = "Quick Edit";

        dom.appendChild(addToChatButton);
        dom.appendChild(quickEditButton);

        return { dom };
      },
    },
  ];
};
```

---

## 14. 项目实战案例

### 案例一：完整的编辑器组件

```typescript
// src/features/editor/components/code-editor.tsx

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

import { minimap } from "../extensions/minimap";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestion";

interface Props {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ fileName, initialValue = "", onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // 根据文件名获取语言扩展
  const languageExtension = useMemo(() => {
    return getLanguageExtension(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建 EditorView
    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        languageExtension,      // 语言支持
        oneDark,                // 暗色主题
        customTheme,            // 自定义主题
        customSetup,            // 基础功能配置
        suggestion(fileName),   // AI 建议功能
        keymap.of([indentWithTab]), // Tab 缩进
        minimap(),              // 小地图
        indentationMarkers(),  // 缩进标记
        // 监听内容变化
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;

    // 清理
    return () => {
      view.destroy();
    };
  }, [languageExtension]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
```

### 案例二：AI 建议系统

**需求**：在用户输入时，显示 AI 续写建议，按 Tab 接受建议。

**实现思路**：
1. 使用 `ViewPlugin` 监听输入，触发 AI 请求
2. 使用 `StateField` 存储建议内容
3. 使用 `StateEffect` 更新建议
4. 使用 `Decoration.widget` 渲染幽灵文字

```typescript
// src/features/editor/extensions/suggestion/index.ts

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

const setSuggestionEffect = StateEffect.define<string | null>();

// 状态字段：存储 AI 建议
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

// 幽灵文字部件
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4";
    span.style.pointerEvents = "none";
    return span;
  }
}

// 防抖插件：输入时触发 AI 请求
const createDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      async triggerSuggestion(view: EditorView) {
        // 获取上下文信息
        const code = view.state.doc.toString();
        const cursorPosition = view.state.selection.main.head;
        const currentLine = view.state.doc.lineAt(cursorPosition);

        // 调用 AI API
        const suggestion = await fetcher({ code, cursorPosition, currentLine });

        // 更新状态
        view.dispatch({
          effects: setSuggestionEffect.of(suggestion),
        });
      }
    }
  );
};

// 渲染插件：显示幽灵文字
const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      const suggestionChanged = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setSuggestionEffect))
      );

      if (update.docChanged || update.selectionSet || suggestionChanged) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) return Decoration.none;

      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1,
        }).range(cursor),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations }
);

// Tab 键接受建议
const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
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
  },
]);

export const suggestion = (fileName: string) => [
  suggestionState,
  createDebouncePlugin(fileName),
  renderPlugin,
  acceptSuggestionKeymap,
];
```

### 案例三：Quick Edit 功能

**需求**：选中代码后，按 ⌘K 打开编辑输入框，AI 根据指令修改选中文本。

**实现思路**：
1. 使用 `StateField` 跟踪 quick edit 激活状态
2. 使用 `Tooltip` 显示编辑表单
3. 选中文本时显示 tooltip，未选中文本则隐藏

```typescript
// src/features/editor/extensions/quick-edit/index.ts

import { Tooltip, showTooltip, keymap, EditorView } from "@codemirror/view";
import { StateField, EditorState, StateEffect } from "@codemirror/state";

// 效果：控制 quick edit 显示/隐藏
export const showQuickEditEffect = StateEffect.define<boolean>();

// 状态：是否激活
export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return effect.value;
      }
    }
    // 选区为空时自动关闭
    if (transaction.selection) {
      const selection = transaction.state.selection.main;
      if (selection.empty) {
        return false;
      }
    }
    return value;
  }
});

// 创建 Tooltip
const createQuickEditTooltip = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) return [];
  if (!state.field(quickEditState)) return [];

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        const form = document.createElement("form");

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Edit selected code";

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit";

        form.onsubmit = async (e) => {
          e.preventDefault();
          // 调用 AI API 修改代码
          const editedCode = await fetcher({
            selectedCode: state.sliceString(selection.from, selection.to),
            fullCode: state.doc.toString(),
            instruction: input.value,
          });

          if (editedCode) {
            editorView.dispatch({
              changes: { from: selection.from, to: selection.to, insert: editedCode },
              effects: showQuickEditEffect.of(false),
            });
          }
        };

        form.appendChild(input);
        form.appendChild(submitButton);
        dom.appendChild(form);

        return { dom };
      },
    },
  ];
};

// Tooltip 字段
const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createQuickEditTooltip(state);
  },
  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createQuickEditTooltip(transaction.state);
    }
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return createQuickEditTooltip(transaction.state);
      }
    }
    return tooltips;
  },
  provide: (field) => showTooltip.computeN([field], (state) => state.field(field)),
});

// 快捷键：⌘K 打开 quick edit
const quickEditKeymap = keymap.of([
  {
    key: "Mod-k",
    run: (view) => {
      const selection = view.state.selection.main;
      if (selection.empty) return false;

      view.dispatch({
        effects: showQuickEditEffect.of(true),
      });
      return true;
    },
  },
]);

export const quickEdit = (fileName: string) => [
  quickEditState,
  quickEditTooltipField,
  quickEditKeymap,
];
```

---

## 附录：常用 API 速查表

### EditorView

```typescript
view.dispatch({
  changes: { from, to, insert },     // 文本变更
  selection: { anchor },             // 选区变更
  effects: [],                       // 状态效果
})

view.state.field(myStateField)       // 获取状态字段
view.state.selection.main.head        // 获取光标位置
view.state.doc.toString()            // 获取文档内容
```

### EditorState

```typescript
EditorState.create({
  doc: "initial content",
  extensions: [ext1, ext2],
})

state.doc.line(n)                    // 获取第 n 行
state.doc.lineAt(pos)                // 获取包含 pos 的行
state.doc.lines                      // 总行数
```

### StateField

```typescript
StateField.define({
  create() { return initialValue },
  update(value, transaction) { return newValue },
  provide?: (field) => extension,
})
```

### StateEffect

```typescript
const myEffect = StateEffect.define<T>();
view.dispatch({ effects: myEffect.of(newValue) });
```

### ViewPlugin

```typescript
ViewPlugin.fromClass(
  class {
    constructor(view) { }
    update(update) { }
    destroy() { }
  },
  { decorations: (p) => p.decos }
)
```

### Decoration

```typescript
Decoration.mark({ class: "my-class" }).range(from, to)
Decoration.widget({ widget: myWidget, side: 1 }).range(pos)
Decoration.set([dec1, dec2])
Decoration.none
```

### keymap

```typescript
keymap.of([
  { key: "Mod-k", run: (view) => { return true } }
])
```