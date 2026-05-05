# CodeMirror 6 用法指南

> 版本：第六版 | 更新时间：2026-05-05

---

## 目录

1. [概述与核心概念](#1-概述与核心概念)
2. [安装与环境搭建](#2-安装与环境搭建)
3. [基础用法](#3-基础用法)
4. [EditorState 与事务](#4-editortate-与事务)
5. [EditorView 视图](#5-editorview-视图)
6. [ Extensions 扩展系统](#6-extensions-扩展系统)
7. [常用 API 详解](#7-常用-api-详解)
8. [装饰器与高亮](#8-装饰器与高亮)
9. [自动补全](#9-自动补全)
10. [搜索功能](#10-搜索功能)
11. [快捷键绑定](#11-快捷键绑定)
12. [主题系统](#12-主题系统)
13. [语言支持](#13-语言支持)
14. [实战示例](#14-实战示例)
15. [常见问题](#15-常见问题)

---

## 1. 概述与核心概念

### 1.1 什么是 CodeMirror 6

CodeMirror 是一个基于 JavaScript 的代码编辑器组件，最初发布于 2007年。第六版于 2020 年发布，完全重写了架构，采用模块化设计。

**核心设计理念：**
- **不可变状态**：编辑器状态不可变，每次修改都创建新状态
- **单向数据流**：状态 → 视图，单向更新
- **组合式扩展**：通过组合 Extension 来扩展功能

### 1.2 核心包结构

```
@codemirror/state    # 状态管理：EditorState、Transaction
@codemirror/view    # 视图渲染：EditorView、DOM 更新
@codemirror/commands    # 内置命令：光标移动、选择等
@codemirror/language    # 语言支持：语法解析、缩进
@codemirror/autocomplete    # 自动补全
@codemirror/search    # 搜索替换
@codemirror/lint    # 代码检查
@codemirror/lang-javascript    # JavaScript 语言支持
@codemirror/theme-one-dark    # 暗色主题
```

### 1.3 核心概念图解

```
┌─────────────────────────────────────────────────────┐
│                    EditorView                        │
│  (负责将 EditorState 渲染到 DOM，处理用户输入事件)     │
└─────────────────────┬───────────────────────────────┘
                      │ setState()
                      ▼
┌─────────────────────────────────────────────────────┐
│                   EditorState                        │
│  doc      - 文档内容 (Text)                          │
│  selection - 光标和选区 (Selection)                  │
│  plugins  - 插件实例数组                            │
└─────────────────────┬───────────────────────────────┘
                      │ dispatch()
                      ▼
┌─────────────────────────────────────────────────────┐
│                  Transaction                         │
│  changes  - 文档变更集 (ChangeSet)                   │
│  selection - 选区变更                               │
│  effects  - 副作用 (StateEffect)                    │
└─────────────────────────────────────────────────────┘
```

---

## 2. 安装与环境搭建

### 2.1 安装依赖

```bash
npm install codemirror @codemirror/state @codemirror/view
```

### 2.2 完整依赖安装（推荐）

```bash
npm install codemirror @codemirror/basic-setup @codemirror/lang-javascript @codemirror/theme-one-dark
```

### 2.3 CDN 引入（用于快速测试）

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { basicSetup } from 'https://cdn.jsdelivr.net/npm/codemirror@6.62.0/+esm';
    import { EditorView } from 'https://cdn.jsdelivr.net/npm/codemirror@6.62.0/+esm';
  </script>
</head>
<body>
  <div id="editor"></div>
</body>
</html>
```

---

## 3. 基础用法

### 3.1 最简示例

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';

// 创建编辑器
const editor = new EditorView({
  // 初始文档内容
  doc: 'Hello, CodeMirror 6!',
  // 扩展列表
  extensions: [basicSetup],
  // 挂载到哪个 DOM 元素
  parent: document.getElementById('editor')
});
```

```html
<div id="editor"></div>
```

### 3.2 完整基础示例

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';

// 创建带配置的编辑器
const state = EditorState.create({
  doc: '// 在这里编写代码\nconsole.log("Hello World");',
  extensions: [
    basicSetup,
    // 可以添加更多扩展
  ]
});

const editor = new EditorView({
  state,
  parent: document.getElementById('editor')
});
```

### 3.3 basicSetup 包含的功能

`basicSetup` 是一个预配置包，包含以下扩展：

| 功能 | 说明 |
|------|------|
| 行号 | 行号显示 |
| 历史记录 | 撤销/重做 |
| 选区粘贴 | 多选区复制粘贴 |
| 撤销光标 | 撤销时光标位置恢复 |
| 软折行 | 长行自动换行 |
| 缩进 | Tab/Shift+Tab 缩进 |
| 匹配括号 | 括号高亮匹配 |
| 选中高亮 | 选中行高亮显示 |
| 拖拽光标 | 鼠标拖拽创建选区 |
| 编码 | 支持特殊字符输入 |

---

## 4. EditorState 与事务

### 4.1 EditorState 创建

```javascript
import { EditorState } from '@codemirror/state';

// 方式一：使用 create 创建
const state = EditorState.create({
  doc: '初始内容',
  extensions: [/* 扩展列表 */]
});

// 方式二：从现有状态创建新状态
const newState = state.update({
  changes: { from: 0, insert: '新内容' }
}).state;
```

### 4.2 Transaction 事务

每次文档变更都通过 Transaction 表示：

```javascript
// 简单文本替换
const transaction = state.update({
  changes: { from: 0, to: 5, insert: 'Hello' }
});

// 多次变更
const transaction = state.update({
  changes: [
    { from: 0, to: 5, insert: 'Hello' },
    { from: 10, insert: ' World' }
  ]
});

// 带选区变更
const transaction = state.update({
  changes: { from: 0, insert: 'Hello' },
  selection: { anchor: 5 }
});
```

### 4.3 常用变更 API

```javascript
// 获取文档内容
const doc = state.doc.toString();

// 获取光标位置
const cursor = state.selection.main.head;

// 替换指定范围
state.update({
  changes: { from: 0, to: 10, insert: '新文本' }
});

// 在光标位置插入
state.update({
  changes: { from: cursor, insert: '插入文本' }
});

// 删除指定范围
state.update({
  changes: { from: 0, to: 5 }
});

// 替换整行
function replaceLine(state, lineNumber, newContent) {
  const line = state.doc.line(lineNumber);
  return state.update({
    changes: { from: line.from, to: line.to, insert: newContent }
  });
}
```

### 4.4 状态更新流程

```
用户输入 → EditorView 接收事件 → 创建 Transaction
         → EditorState 更新 → 新状态生成
         → EditorView 重新渲染 DOM
```

```javascript
// 手动更新状态
editor.setState(newState);

// 提交一个事务
editor.dispatch(
  state.update({
    changes: { from: 0, insert: 'Hello ' }
  })
);
```

---

## 5. EditorView 视图

### 5.1 EditorView 基础

```javascript
import { EditorView } from '@codemirror/view';

const view = new EditorView({
  state,           // EditorState 实例
  parent,          // 父 DOM 元素
  dispatch,        // 可选：自定义 dispatch 处理
});
```

### 5.2 EditorView 常用属性

```javascript
// 获取当前状态
view.state;

// 获取文档
view.state.doc;

// 获取 DOM 元素
view.dom;           // 编辑器根元素
view.contentDOM;    // 可编辑内容区域

// 判断焦点
view.hasFocus;

// 获取选区信息
view.state.selection;
```

### 5.3 EditorView 常用方法

```javascript
// 销毁编辑器
view.destroy();

// 焦点
view.focus();

// 滚动到指定位置
view.scrollDOM.scrollTop = 100;

// 更新编辑器
view.setState(newState);

// 分发事务
view.dispatch(transaction);

// 获取指定位置的 DOM 元素
view.coordsAtPos(pos);
view.posAtCoords({ x, y });
```

### 5.4 事件监听

```javascript
const view = new EditorView({
  state,
  parent,
  // 监听更新
  updateListener: (update) => {
    if (update.docChanged) {
      console.log('文档已变更:', update.state.doc.toString());
    }
    if (update.selectionSet) {
      console.log('选区已变更');
    }
    if (update.viewportChanged) {
      console.log('视口已变更');
    }
  }
});
```

---

## 6. Extensions 扩展系统

### 6.1 什么是 Extension

Extension 是 CodeMirror 6 的核心概念，是一个可组合的功能单元。

### 6.2 Extension 的类型

```javascript
// 1. 值扩展
import { EditorView, lineNumbers } from '@codemirror/view';
const ext1 = lineNumbers();

// 2. 函数扩展
import { EditorState } from '@codemirror/state';
const ext2 = EditorState.tabSize.of(4);

// 3. 对象扩展
const ext3 = {
  eventHandlers: {
    keydown: (event, view) => {
      console.log('按键:', event.key);
      return false; // 返回 true 阻止默认行为
    }
  }
};
```

### 6.3 常用内置 Extension

```javascript
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

// 视图扩展
lineNumbers()           // 行号
highlightActiveLine()   // 当前行高亮
highlightSpecialChars() // 特殊字符高亮
drawSelection()         // 选区可视化
dropCursor()            // 拖拽光标
EditorView.lineWrapping // 折行

// 状态扩展
EditorState.tabSize.of(2)        // Tab 宽度
EditorState.readOnly.of(true)    // 只读模式
EditorState.lineSeparator.of('\n') // 行分隔符
```

### 6.4 组合扩展

```javascript
// 数组方式
const extensions = [
  lineNumbers(),
  highlightActiveLine(),
  EditorState.tabSize.of(2),
  // ... 更多扩展
];

// 扩展计算函数
import { EditorView } from '@codemirror/view';
const getExtensions = (readOnly) => [
  basicSetup,
  readOnly ? EditorState.readOnly.of(true) : [],
  lineNumbers(),
];
```

### 6.5 动态扩展

```javascript
import { Compartment } from '@codemirror/state';

const compartment = new Compartment();

// 初始状态
const state = EditorState.create({
  extensions: [compartment.of([])]
});

// 动态切换扩展
view.dispatch({
  effects: compartment.reconfigure([lineNumbers()])
});

// 读取当前扩展配置
compartment.get(view.state);
```

### 6.6 常用扩展清单

| 扩展 | 包 | 说明 |
|------|-----|------|
| basicSetup | codemirror | 基础功能合集 |
| lineNumbers | @codemirror/view | 行号显示 |
| highlightActiveLine | @codemirror/view | 当前行高亮 |
| drawSelection | @codemirror/view | 选区绘制 |
| tabSize | @codemirror/state | Tab 宽度 |
| readOnly | @codemirror/state | 只读模式 |
| history | @codemirror/commands | 历史记录 |
| defaultKeymap | @codemirror/commands | 默认快捷键 |

---

## 7. 常用 API 详解

### 7.1 获取与修改文档

```javascript
// 获取文档
const doc = view.state.doc;

// 获取行
const line = view.state.doc.line(1);  // 第 1 行
const line = view.state.doc.lineAt(pos);  // 某位置所在的行

// 行信息
line.text     // 行文本
line.from     // 行起始位置
line.to       // 行结束位置
line.length   // 行长度

// 获取范围文本
const text = view.state.sliceDoc(from, to);

// 搜索文本
const result = view.state.doc.findWordAt(pos);  // 获取光标处单词范围

// 修改文档
view.dispatch({
  changes: { from, to, insert: 'new text' }
});
```

### 7.2 光标与选区

```javascript
// 获取光标位置
const cursor = view.state.selection.main.head;

// 获取选区
const range = view.state.selection.main;
range.from  // 选区起始
range.to    // 选区终点

// 获取所有选区
const ranges = view.state.selection.ranges;

// 设置选区
view.dispatch({
  selection: { anchor: 0, head: 10 }
});

// 设置多个选区
view.dispatch({
  selection: {
    ranges: [
      { anchor: 0, head: 5 },
      { anchor: 10, head: 15 }
    ]
  }
});

// 移动光标
view.dispatch({
  selection: { anchor: 20 }
});

// 全选
import { selectAll } from '@codemirror/commands';
view.dispatch({ effects: selectAll });
```

### 7.3 选区操作命令

```javascript
import {
  selectAll,
  selectLine,
  selectWord,
  selectParent,
  toggleSelection,
  addLineSelection,
  cursorLineStart,
  cursorLineEnd,
  cursorDocStart,
  cursorDocEnd,
} from '@codemirror/commands';

// 全选
toggleSelection(view);

// 选择当前行
selectLine(view);

// 选择当前单词
selectWord(view);

// 选择父节点
selectParent(view);

// 跳转到行首
cursorLineStart(view);

// 跳转到行尾
cursorLineEnd(view);

// 跳转到文档开头
cursorDocStart(view);

// 跳转到文档末尾
cursorDocEnd(view);
```

### 7.4 文本操作

```javascript
// 插入文本（在光标位置）
view.dispatch({
  changes: { from: view.state.selection.main.head, insert: 'text' }
});

// 替换选区文本
view.dispatch({
  changes: {
    from: view.state.selection.main.from,
    to: view.state.selection.main.to,
    insert: 'new text'
  }
});

// 删除文本
view.dispatch({
  changes: { from: 0, to: 10 }
});

// 格式化 JSON
import { indentWithTab } from '@codemirror/commands';
view.dispatch({
  changes: {
    from: 0,
    insert: JSON.stringify(JSON.parse(view.state.doc.toString()), null, 2)
  }
});
```

### 7.5 撤销与重做

```javascript
import { undo, redo, undoSelection, redoSelection } from '@codemirror/commands';

// 撤销
undo(view);

// 重做
redo(view);

// 撤销选区
undoSelection(view);

// 重做选区
redoSelection(view);
```

### 7.6 缩进

```javascript
import { indentSelection, indentLess, indentMore } from '@codemirror/commands';

// 增加缩进
indentMore(view);

// 减少缩进
indentLess(view);

// 自动缩进选区
indentSelection(view);
```

---

## 8. 装饰器与高亮

### 8.1 装饰器概述

装饰器（Decoration）用于高亮、标记文档中的特定范围。

### 8.2 装饰器类型

```javascript
import { Decoration, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

// 1. 标记装饰器 - 不可选中
Decoration.mark({ class: 'error' })

// 2. 部件装饰器 - 可选中，显示自定义 DOM
Decoration.widget({
  widget: new MyWidget(),
  side: 1  // -1 = 行前, 1 = 行后
})

// 3. 行装饰器
Decoration.line({ class: 'highlighted-line' })

// 4. 替换装饰器 - 替换文本显示
Decoration.replace({
  widget: new MyWidget(),
  inclusive: true
})
```

### 8.3 自定义装饰器示例

```javascript
import { Decoration, EditorView, ViewPlugin, MatchDecorator } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/state';

// 定义添加标记的效果
const addHighlight = StateEffect.define();

const highlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    // 应用效果
    for (const effect of tr.effects) {
      if (effect.is(addHighlight)) {
        highlights = highlights.update({
          add: [{ from: effect.value.from, to: effect.value.to, value: Decoration.mark({ class: 'highlight' }) }]
        });
      }
    }
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

// 添加高亮
view.dispatch({
  effects: addHighlight.of({ from: 0, to: 10 })
});
```

### 8.4 高亮语法关键词

```javascript
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// 定义高亮样式
const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#fc9' },
  { tag: tags.string, color: '#9f9' },
  { tag: tags.comment, color: '#666', fontStyle: 'italic' },
  { tag: tags.number, color: '#f99' },
  { tag: tags.function(tags.variableName), color: '#99f' },
]);

// 应用高亮
const extensions = [
  syntaxHighlighting(highlightStyle),
];
```

### 8.5 装饰器实战：搜索高亮

```javascript
import { Decoration, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/state';

// 效果：设置搜索匹配
const setSearchMatch = StateEffect.define();

const searchHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(highlights, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSearchMatch)) {
        const deco = Decoration.mark({ class: 'search-match' });
        highlights = highlights.update({
          add: [{ from: effect.value.from, to: effect.value.to, value: deco }]
        });
      }
    }
    return highlights;
  },
  provide: f => EditorView.decorations.from(f)
});

// 搜索功能
function highlightSearch(view, query) {
  const content = view.state.doc.toString();
  const regex = new RegExp(query, 'gi');
  let match;

  while ((match = regex.exec(content)) !== null) {
    view.dispatch({
      effects: setSearchMatch.of({ from: match.index, to: match.index + match[0].length })
    });
  }
}
```

---

## 9. 自动补全

### 9.1 自动补全基础

```javascript
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';

const extensions = [
  autocompletion(),
  javascript()
];
```

### 9.2 自定义补全源

```javascript
// 本地关键词补全
const localKeywords = [
  { label: 'console', type: 'variable', detail: 'console 对象' },
  { label: 'document', type: 'variable', detail: 'document 对象' },
  { label: 'window', type: 'variable', detail: 'window 对象' },
  { label: 'if', type: 'keyword' },
  { label: 'else', type: 'keyword' },
  { label: 'for', type: 'keyword' },
  { label: 'while', type: 'keyword' },
];

// 自定义补全函数
const myCompletions = (context) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  return {
    from: word.from,
    options: localKeywords,
    validFor: /^\w*$/
  };
};

const extensions = [
  autocompletion({
    override: [myCompletions]
  })
];
```

### 9.3 异步补全

```javascript
const asyncCompletions = async (context) => {
  const word = context.matchBefore(/\w*/);
  if (!word) return null;

  // 模拟 API 请求
  const response = await fetch(`/api/completions?q=${word.text}`);
  const data = await response.json();

  return {
    from: word.from,
    options: data.map(item => ({
      label: item.label,
      type: item.type,
      detail: item.detail,
      apply: item.insert  // 自定义插入文本
    }))
  };
};

const extensions = [
  autocompletion({
    override: [asyncCompletions],
    defaultKeymap: true  // 默认快捷键 Ctrl+Space 触发
  })
];
```

### 9.4 补全项属性

```javascript
{
  label: 'myFunction',      // 显示文本（必需）
  type: 'function',         // 类型：variable, function, keyword, class, module 等
  detail: '详情信息',        // 详细信息
  info: '更多信息链接',     // 点击时显示的信息
  icon: htmlElement,       // 自定义图标
  apply: (view, completion, from, to) => {
    // 自定义插入逻辑
    view.dispatch({
      changes: { from, to, insert: completion.insert }
    });
  },
  boost: 10,               // 优先级，数值越高越靠前
  indent: '→ ',            // 显示缩进信息
  icon: null,              // 禁用图标
  render: (completion, from, to, update) => htmlElement  // 自定义渲染
}
```

### 9.5 补全类型图标

```javascript
const typeIcons = {
  variable: '𝑥',           // 普通变量
  constant: '𝐀',           // 常量
  property: '◦',          // 属性
  function: 'ƒ',           // 函数
  class: '𝐂',             // 类
  type: '𝑇',              // 类型
  enum: '∪',              // 枚举
  module: '𝑀',            // 模块
  keyword: '𝑘',            // 关键字
  string: '"',             // 字符串
  number: '#',             // 数字
  bool: '⊙',              // 布尔值
  array: '[]',             // 数组
  object: '{}',            // 对象
};
```

### 9.6 补全选项配置

```javascript
const extensions = [
  autocompletion({
    override: [myCompletions],
    defaultKeymap: true,           // 启用默认触发快捷键
    activateOnTyping: true,        // 输入时触发
    selectOnOpen: true,             // 打开时选中第一个
    closeOnBlur: true,              // 失去焦点时关闭
    maxRenderedOptions: 100,       // 最大渲染选项数
    updateSyncTime: 100,           // 同步更新间隔
    optionClass: (completions) => '', // 选项样式类
    renderSnippet: (text) => html,  // 自定义片段渲染
    completionKeymap: [             // 自定义快捷键
      { key: 'Enter', run: (view, completion, from, to) => { /* 处理回车 */ } }
    ]
  })
];
```

---

## 10. 搜索功能

### 10.1 基础搜索

```javascript
import { search, openSearchPanel, findNext, findPrevious, replaceNext, replaceAll } from '@codemirror/search';

const extensions = [
  search({ top: true })  // top: true 在顶部显示搜索面板
];
```

### 10.2 打开搜索面板

```javascript
import { openSearchPanel } from '@codemirror/search';

// 打开搜索面板
view.dispatch({
  effects: openSearchPanel.of(null)
});
```

### 10.3 搜索快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+F / Cmd+F | 打开搜索 |
| Ctrl+G / Cmd+G | 查找下一个 |
| Ctrl+Shift+G | 查找上一个 |
| Ctrl+Shift+E | 替换 |
| Ctrl+Shift+R | 全部替换 |

### 10.4 编程式搜索

```javascript
import { searchKeymap, findNext, findPrevious, setSearchQuery, selectNextMatch } from '@codemirror/search';

// 查找下一个
findNext(view);

// 查找上一个
findPrevious(view);

// 设置搜索词
view.dispatch({
  effects: setSearchQuery.of({ search: 'keyword', caseSensitive: false, wholeWord: false })
});
```

### 10.5 自定义搜索扩展

```javascript
import { search, SearchQuery } from '@codemirror/search';

const customSearch = search({
  top: true,
  caseSensitive: false,
  wholeWord: false,
  literal: false,
  regexp: true,        // 支持正则
  multi: true,        // 多选区搜索
  compare: (a, b) => a === b  // 自定义比较
});
```

---

## 11. 快捷键绑定

### 11.1 内置快捷键

```javascript
import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
  history,
} from '@codemirror/commands';

const extensions = [
  history(),           // 需要 history 才能用 Ctrl+Z
  defaultKeymap,      // 默认快捷键
  historyKeymap,      // 历史记录快捷键
  indentWithTab,      // Tab 缩进
];
```

### 11.2 常用快捷键映射

| 快捷键 | 功能 |
|--------|------|
| Ctrl+A / Cmd+A | 全选 |
| Ctrl+Z / Cmd+Z | 撤销 |
| Ctrl+Shift+Z / Cmd+Shift+Z | 重做 |
| Ctrl+D / Cmd+D | 删除当前行 |
| Ctrl+Shift+K | 删除到行尾 |
| Alt+Shift+↑ | 向上复制行 |
| Alt+Shift+↓ | 向下复制行 |
| Ctrl+/ | 注释/取消注释 |
| Alt+↑ | 向上移动行 |
| Alt+↓ | 向下移动行 |
| Tab | 增加缩进 |
| Shift+Tab | 减少缩进 |

### 11.3 自定义快捷键

```javascript
import { keymap } from '@codemirror/view';

// 方式一：普通函数
const myKeymap = keymap.of([
  {
    key: 'Ctrl-Shift-H',
    run: (view) => {
      console.log('Ctrl+Shift+H 按下');
      return true;  // 表示事件已处理
    }
  },
  {
    key: 'Ctrl-S',
    run: (view) => {
      saveContent(view.state.doc.toString());
      return true;
    }
  }
]);

// 方式二：使用命令
import { indentLess, indentMore } from '@codemirror/commands';
const indentKeymap = keymap.of([
  { key: 'Ctrl-[', run: indentLess },
  { key: 'Ctrl-]', run: indentMore }
]);
```

### 11.4 快捷键修饰键

```javascript
// 修饰键组合
const modifiers = [
  { key: 'Ctrl-a', run: ... },           // Ctrl
  { key: 'Alt-b', run: ... },            // Alt/Option
  { key: 'Shift-c', run: ... },          // Shift
  { key: 'Meta-d', run: ... },           // Meta/Command

  // 组合
  { key: 'Ctrl-Alt-d', run: ... },       // Ctrl+Alt
  { key: 'Ctrl-Shift-d', run: ... },     // Ctrl+Shift
  { key: 'Ctrl-Alt-Shift-d', run: ... }, // Ctrl+Alt+Shift

  // 功能键
  { key: 'F5', run: ... },               // F5
  { key: 'Escape', run: ... },           // Esc
  { key: 'Enter', run: ... },            // Enter
  { key: 'Tab', run: ... },              // Tab
  { key: 'Backspace', run: ... },        // 退格
];

// macOS 特定
const macKeymap = keymap.of([
  { key: 'Cmd-s', run: save },           // macOS Command
  { key: 'Ctrl-s', run: save },          // Windows/Linux Ctrl
]);

// 跨平台（自动适配）
keymap.of([
  { key: 'Mod-s', run: save }            // Mod = Ctrl on Windows/Linux, Cmd on macOS
]);
```

---

## 12. 主题系统

### 12.1 使用主题

```javascript
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';

// 应用主题
const extensions = [oneDark];

new EditorView({
  state: EditorState.create({ extensions: [basicSetup, oneDark] }),
  parent: document.getElementById('editor')
});
```

### 12.2 内置主题

| 主题 | 包 |
|------|-----|
| oneDark | @codemirror/theme-one-dark |
| dracula | @codemirror/theme-dracula |
| githubLight | @codemirror/theme-one-dark |
| monokai | @codemirror/theme-monokai |

### 12.3 自定义主题

```javascript
import { EditorView, HighlightStyle } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// 定义主题
const myTheme = EditorView.theme({
  '&': {
    color: '#333',
    backgroundColor: '#f5f5f5'
  },
  '.cm-content': {
    caretColor: '#333',
    fontFamily: 'Monaco, monospace'
  },
  '.cm-cursor': {
    borderLeftColor: '#333'
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: '#d4d4d4'
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f0f0'
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#999',
    border: 'none'
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 16px'
  }
}, { dark: false });  // dark: true/false 适配深色/浅色模式

// 定义语法高亮
const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#708' },
  { tag: tags.string, color: '#05a' },
  { tag: tags.comment, color: '#a50', fontStyle: 'italic' },
  { tag: tags.number, color: '#164' },
  { tag: tags.function(tags.variableName), color: '#06b' }
]);

const extensions = [
  myTheme,
  syntaxHighlighting(myHighlightStyle)
];
```

### 12.4 深色/浅色主题切换

```javascript
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { Compartment } from '@codemirror/state';

const themeCompartment = new Compartment();
const lightTheme = EditorView.theme({ /* 浅色主题 */ });
const darkTheme = EditorView.theme({ /* 深色主题 */ });

const state = EditorState.create({
  extensions: [themeCompartment.of(lightTheme)]
});

const view = new EditorView({ state, parent });

// 切换主题
function toggleTheme() {
  const isDark = themeCompartment.get(view.state) === darkTheme;
  view.dispatch({
    effects: themeCompartment.reconfigure(isDark ? lightTheme : darkTheme)
  });
}
```

---

## 13. 语言支持

### 13.1 支持的语言包

| 语言 | 包 |
|------|-----|
| JavaScript | @codemirror/lang-javascript |
| CSS | @codemirror/lang-css |
| HTML | @codemirror/lang-html |
| JSON | @codemirror/lang-json |
| Python | @codemirror/lang-python |
| Rust | @codemirror/lang-rust |
| Java | @codemirror/lang-java |
| Markdown | @codemirror/lang-markdown |
| YAML | @codemirror/lang-yaml |
| XML | @codemirror/lang-xml |
| SQL | @codemirror/lang-sql |
| PHP | @codemirror/lang-php |

### 13.2 基础语言支持

```javascript
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';

const extensions = [
  basicSetup,
  javascript(),        // JavaScript
  // html(),            // HTML
  // css(),             // CSS
  // json(),            // JSON
  // python(),          // Python
];
```

### 13.3 JavaScript 详细配置

```javascript
import { javascript } from '@codemirror/lang-javascript';

// JavaScript 配置
const jsExtension = javascript({
  jsx: true,           // 支持 JSX
  typescript: true,    // 支持 TypeScript
  stage: 3,            // TC39 提案阶段
  base: 'javascript'   // 'javascript' | 'typescript'
});

// TypeScript 示例
const tsExtension = javascript({ typescript: true });
```

### 13.4 HTML 详细配置

```javascript
import { html } from '@codemirror/lang-html';

const htmlExtension = html({
  autoCloseTags: true,  // 自动闭合标签
  matchClosingTags: true,  // 匹配闭合标签
  highlightTokens: true   // 高亮标签名
});
```

### 13.5 自定义语言支持

```javascript
import { StreamLanguage } from '@codemirror/language';

// 使用流式解析器定义简单语言
const myLanguage = StreamLanguage.define({
  token(stream) {
    // 跳过空白
    if (stream.eatSpace()) return null;

    // 关键字
    if (stream.match(/\b(if|else|for|while|return)\b/)) {
      return 'keyword';
    }

    // 字符串
    if (stream.match(/["']([^"'\\]|\\.)*["']/)) {
      return 'string';
    }

    // 数字
    if (stream.match(/\d+/)) {
      return 'number';
    }

    // 标识符
    if (stream.match(/[a-zA-Z_]\w*/)) {
      return 'variable';
    }

    // 跳过未知字符
    stream.next();
    return null;
  }
});

const extensions = [basicSetup, myLanguage];
```

---

## 14. 实战示例

### 14.1 代码编辑器完整示例

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { search, searchKeymap } from '@codemirror/search';

const editor = new EditorView({
  state: EditorState.create({
    doc: `// JavaScript 代码编辑器示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`,
    extensions: [
      // 基础功能
      basicSetup,

      // 行号
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),

      // 语言支持
      javascript(),

      // 主题
      oneDark,

      // 自动补全
      autocompletion(),
      closeBrackets(),

      // 搜索
      search(),

      // 快捷键
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        indentWithTab
      ])
    ]
  }),
  parent: document.getElementById('editor')
});

// 导出内容
function getValue() {
  return editor.state.doc.toString();
}

// 设置内容
function setValue(code) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: code }
  });
}
```

### 14.2 JSON 编辑器示例

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { linter, lintGutter } from '@codemirror/lint';
import { closeBrackets } from '@codemirror/autocomplete';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

// JSON Linter
const jsonLinter = linter((view) => {
  const diagnostics = [];
  const content = view.state.doc.toString();

  try {
    JSON.parse(content);
  } catch (e) {
    const match = e.message.match(/position (\d+)/);
    const pos = match ? parseInt(match[1]) : 0;
    diagnostics.push({
      from: Math.max(0, pos - 1),
      to: Math.min(view.state.doc.length, pos + 1),
      severity: 'error',
      message: e.message
    });
  }

  return diagnostics;
});

const jsonEditor = new EditorView({
  state: EditorState.create({
    doc: '{\n  "name": "example",\n  "version": "1.0.0"\n}',
    extensions: [
      basicSetup,
      lineNumbers(),
      highlightActiveLine(),
      json(),
      closeBrackets(),
      jsonLinter,
      lintGutter(),
      history()
    ]
  }),
  parent: document.getElementById('json-editor')
});
```

### 14.3 Markdown 编辑器示例

```javascript
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { closeBrackets } from '@codemirror/autocomplete';

const mdEditor = new EditorView({
  state: EditorState.create({
    doc: `# 标题

这是一个 **Markdown** 编辑器示例。

## 代码块

\`\`\`javascript
console.log('Hello World');
\`\`\`

## 列表

- 项目一
- 项目二
- 项目三

## 链接

[CodeMirror](https://codemirror.net)
`,
    extensions: [
      basicSetup,
      lineNumbers(),
      markdown({
        codeLanguages: languages  // 支持代码块语法高亮
      }),
      closeBrackets(),
      keymap.of([defaultKeymap, indentWithTab])
    ]
  }),
  parent: document.getElementById('markdown-editor')
});
```

### 14.4 替换文本示例

```javascript
// 替换当前选区或全文替换
function replaceText(view, newText, replaceAll = false) {
  if (replaceAll) {
    // 替换所有
    const content = view.state.doc.toString();
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newText }
    });
  } else {
    // 替换选区
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: newText }
    });
  }
}
```

### 14.5 格式化代码示例

```javascript
// 格式化 JSON
function formatJSON(view) {
  try {
    const content = view.state.doc.toString();
    const parsed = JSON.parse(content);
    const formatted = JSON.stringify(parsed, null, 2);

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted }
    });
  } catch (e) {
    console.error('JSON 格式化失败:', e);
  }
}

// 缩进选区代码
function indentCode(view) {
  const { from, to } = view.state.selection.main;
  const content = view.state.sliceDoc(from, to);
  const lines = content.split('\n');
  const indented = lines.map(line => '  ' + line).join('\n');

  view.dispatch({
    changes: { from, to, insert: indented }
  });
}
```

---

## 15. 常见问题

### 15.1 Q: 如何获取编辑器内容？

```javascript
// 方法一
const content = view.state.doc.toString();

// 方法二
const content = view.state.sliceDoc(0, view.state.doc.length);

// 方法三
const content = view.getValue();  // 需要 EditorView.prototype.getValue
```

### 15.2 Q: 如何设置只读模式？

```javascript
import { EditorState } from '@codemirror/state';

// 方式一：创建时设置
const state = EditorState.create({
  extensions: [EditorState.readOnly.of(true)]
});

// 方式二：动态切换
const readOnlyCompartment = new Compartment();

view.dispatch({
  effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(true))
});
```

### 15.3 Q: 如何禁用某些默认功能？

```javascript
// 使用 compartment 替换 basicSetup 中的某个扩展
import { lineNumbers } from '@codemirror/view';
import { history } from '@codemirror/commands';

const extensions = [
  // basicSetup 已包含 lineNumbers，可用空数组替换
  // 或者使用 EditorView.lineWrapping 替换换行行为
];
```

### 15.4 Q: 如何自定义光标样式？

```javascript
import { EditorView } from '@codemirror/view';

const customCursor = EditorView.theme({
  '.cm-content': { caretColor: '#ff0000' },
  '.cm-cursor': {
    borderLeftColor: '#ff0000',
    borderLeftWidth: '2px'
  }
});
```

### 15.5 Q: 如何在 React 中使用？

```javascript
import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

function CodeEditor({ initialValue, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const view = new EditorView({
      state: EditorState.create({
        doc: initialValue,
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          // 监听变更
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
              onChange(update.state.doc.toString());
            }
          })
        ]
      }),
      parent: editorRef.current
    });

    return () => view.destroy();
  }, []);

  return <div ref={editorRef} />;
}
```

### 15.6 Q: 如何处理大文件性能问题？

```javascript
import { EditorView } from '@codemirror/view';

// 限制文档最大长度
const MAX_DOC_LENGTH = 1000000;

// 或者使用懒加载/虚拟化
const extensions = [
  EditorView.viewportMagic(10000),  // 只渲染可见区域附近的内容
];
```

### 15.7 Q: 如何添加自定义快捷键？

```javascript
import { keymap } from '@codemirror/view';

// 自定义 Ctrl+S 保存
const saveKeymap = keymap.of([
  {
    key: 'Mod-s',
    run: (view) => {
      const content = view.state.doc.toString();
      localStorage.setItem('saved-code', content);
      return true;
    }
  }
]);

const extensions = [basicSetup, saveKeymap];
```

---

## 附录：常用快捷键参考

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 撤销 | Ctrl+Z | Cmd+Z |
| 重做 | Ctrl+Shift+Z / Ctrl+Y | Cmd+Shift+Z |
| 搜索 | Ctrl+F | Cmd+F |
| 替换 | Ctrl+H | Cmd+Option+F |
| 全选 | Ctrl+A | Cmd+A |
| 复制 | Ctrl+C | Cmd+C |
| 剪切 | Ctrl+X | Cmd+X |
| 粘贴 | Ctrl+V | Cmd+V |
| 删除行 | Ctrl+Shift+K | Cmd+Shift+K |
| 注释 | Ctrl+/ | Cmd+/ |
| 缩进 | Tab | Tab |
| 取消缩进 | Shift+Tab | Shift+Tab |

---

## 参考资源

- 官方文档：https://codemirror.net/docs/
- GitHub：https://github.com/codemirror/codemirror
- 官方论坛：https://discuss.codemirror.net