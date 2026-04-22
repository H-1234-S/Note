
> 一个用于 React 的防抖（debounce） Hook 库

## 快速开始

### 安装

```bash
pnpm add use-debounce
# 或
npm install use-debounce
# 或
yarn add use-debounce
```

### 三个核心 API

```ts
import { useDebounce, useDebouncedCallback } from 'use-debounce';
```

| API | 作用 |
|-----|------|
| `useDebounce` | 对某个值进行防抖，返回防抖后的值 |
| `useDebouncedCallback` | 对函数进行防抖，返回一个防抖后的函数 |

---

## API 详解

### useDebounce - 防抖值

#### 基本用法

对状态值进行防抖，常用于搜索输入框等场景。

```tsx
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

function SearchInput() {
  const [text, setText] = useState('');
  const [value] = useDebounce(text, 500); // 500ms 防抖

  useEffect(() => {
    // 只有当用户停止输入 500ms 后，才会执行搜索
    console.log('搜索:', value);
    // 执行 API 请求等操作
  }, [value]);

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

#### 核心概念

```
用户输入: h e l l o
时间:      ↓ ↓ ↓ ↓ ↓
防抖中:    ████████░░░  (等待 500ms)
防抖完成:              █  (触发)
```

#### 配置选项

```tsx
const [value] = useDebounce(text, {
  wait: 500,           // 防抖延迟时间（毫秒）
  maxWait: 1000,       // 最大等待时间
  leading: false,      // 是否在延迟开始前触发
  trailing: true,      // 是否在延迟结束后触发
});
```

**`trailing` 和 `leading` 组合效果：**

| 配置 | 效果 |
|------|------|
| `trailing: true, leading: false` | 只在结束后执行（默认） |
| `trailing: false, leading: true` | 只在开始时执行 |
| `trailing: true, leading: true` | 开始和结束都执行 |
| `trailing: false, leading: false` | 从不执行（无意义） |

#### 示例：leading 模式

```tsx
// 立即响应，不需要等待输入结束
const [value] = useDebounce(text, {
  wait: 500,
  leading: true,
  trailing: false,
});
```

---

### useDebouncedCallback - 防抖回调

#### 基本用法

对函数进行防抖包装，适用于事件处理函数。

```tsx
import { useDebouncedCallback } from 'use-debounce';

function SearchButton() {
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`搜索: ${term}`);
    // 执行搜索逻辑
  }, 300);

  return <button onClick={() => handleSearch('关键词')}>搜索</button>;
}
```

#### 实战示例：搜索输入框

```tsx
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathname = usePathname();
  const replace = useRouter().replace;

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('query')?.toString()}
    />
  );
}
```

#### 回调返回的额外方法

`useDebouncedCallback` 返回一个数组，第一个元素是防抖后的回调，其他方法在第二个元素中：

```tsx
const [callback, { cancel, flush, pending }] = useDebouncedCallback(
  (value) => {
    console.log('执行:', value);
  },
  500
);
```

| 方法 | 说明 |
|------|------|
| `cancel()` | 取消当前的防抖定时器 |
| `flush()` | 立即执行（不等待延迟结束） |
| `pending` | 当前是否处于等待状态（boolean） |

#### 示例：取消和立即执行

```tsx
function AutoSave() {
  const [text, setText] = useState('');
  const [save, { cancel, flush }] = useDebouncedCallback(
    () => {
      // 保存操作
      console.log('保存:', text);
    },
    1000
  );

  // 输入时触发保存
  useEffect(() => {
    save();
  }, [text, save]);

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={flush}>立即保存</button>
      <button onClick={cancel}>取消</button>
    </div>
  );
}
```

---

## 进阶用法

### 与 useCallback 配合

```tsx
function Component() {
  const [value, setValue] = useState('');

  const debouncedCallback = useDebouncedCallback(
    useCallback((val) => {
      // 你的逻辑
      console.log(val);
    }, []),
    500
  );

  return <input onChange={(e) => debouncedCallback(e.target.value)} />;
}
```

### 防抖对象或数组

```tsx
function FilterComponent() {
  const [filters, setFilters] = useState({ category: '', sort: '' });
  const [debouncedFilters] = useDebounce(filters, 500);

  useEffect(() => {
    // 当 filters 稳定 500ms 后，重新获取数据
    fetchData(debouncedFilters);
  }, [debouncedFilters]);
}
```

### maxWait - 最大等待时间

防止函数被无限延迟执行：

```tsx
const [value] = useDebounce(text, {
  wait: 500,
  maxWait: 2000, // 最多等 2 秒，即使一直有输入
});
```

```
输入: a → b → c → d → e (持续输入)
时间: ████████████████████░░░░
maxWait:         ↑ 2秒后强制触发
```

---

## 实用场景

### 场景 1：搜索输入框

```tsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery).then(setResults);
    }
  }, [debouncedQuery]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* 显示加载状态 */}
      {query !== debouncedQuery && <Spinner />}
    </>
  );
}
```

### 场景 2：窗口调整事件

```tsx
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);
  const [debouncedWidth] = useDebounce(width, 200);

  const handleResize = useDebouncedCallback(() => {
    setWidth(window.innerWidth);
  }, 200);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return <div>窗口宽度: {debouncedWidth}</div>;
}
```

### 场景 3：表单自动保存

```tsx
function AutoSaveForm() {
  const [formData, setFormData] = useState({});
  const [save, { flush, pending }] = useDebouncedCallback(
    () => saveToServer(formData),
    1000
  );

  useEffect(() => {
    save();
  }, [formData, save]);

  return (
    <form>
      {/* 表单字段 */}
      <button type="button" onClick={flush} disabled={pending}>
        {pending ? '保存中...' : '立即保存'}
      </button>
    </form>
  );
}
```

### 场景 4：防抖 vs 节流对比

```tsx
// 防抖 (Debounce) - 等待安静后执行
// 适合: 搜索输入、窗口调整、停止打字后自动保存
const [debouncedValue] = useDebounce(value, 300);

// 节流 (Throttle) - 固定频率执行
// 适合: 滚动事件、按钮防双击、鼠标移动
// use-debounce 库也支持，请查看 useThrottledCallback
import { useThrottledCallback } from 'use-debounce';

const throttledHandler = useThrottledCallback(handler, 100);
```

---

## 常见问题

### Q: 为什么 useDebounce 返回的是数组而不是对象？

```tsx
// 使用数组解构，保持与 useState 一致性
const [value] = useDebounce(text, 500);
// 而不是
// const { value } = useDebounce(text, 500);
```

### Q: 如何在组件卸载时取消防抖？

```tsx
useEffect(() => {
  const [callback] = useDebouncedCallback(fn, 500);

  return () => {
    // useDebouncedCallback 返回的 callback 会在组件卸载时自动取消
  };
}, []);
```

### Q: 如何区分"正在防抖"和"已完成"状态？

```tsx
const [value] = useDebounce(text, 500);

// 直接比较原值和防抖值
const isPending = value !== text;
```

---

## API 参考表

### useDebounce

```ts
useDebounce<T>(value: T, wait?: number): [T]
useDebounce<T>(value: T, options?: DebounceOptions): [T]

interface DebounceOptions {
  wait?: number;        // 延迟时间，默认 300
  maxWait?: number;     // 最大等待时间
  leading?: boolean;    // 是否在延迟前执行
  trailing?: boolean;   // 是否在延迟后执行，默认 true
}
```

### useDebouncedCallback

```ts
useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  wait?: number
): [T, { cancel: () => void; flush: () => void; pending: boolean }]

useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options?: DebounceOptions
): [T, { cancel: () => void; flush: () => void; pending: boolean }]
```

---

## 参考链接

- [npm 仓库](https://www.npmjs.com/package/use-debounce)
- [GitHub 仓库](https://github.com/xnimorz/use-debounce)
- [在线示例](https://codesandbox.io/s/kx75xzyrq7)
