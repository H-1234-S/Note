
Ky 是由 sindresorhus 开发的轻量级 HTTP 客户端库，基于原生 `fetch API` 构建，提供更便捷的 API 和更强大的功能。

## 1. 安装与基础用法

### 安装

```bash
npm install ky
```

### 基础用法

Ky 提供了与 `fetch` 相似的语法，但更加简洁：

```javascript
import ky from 'ky';

// 基础 GET 请求
const response = await ky('https://example.com/api/users');
const data = await response.json();
```

## 2. HTTP 方法

Ky 为每种 HTTP 方法提供了独立的 API：

```javascript
import ky from 'ky';

// GET 请求
ky.get('https://example.com/api/users');

// POST 请求
ky.post('https://example.com/api/users', { body: { name: '张三' } });

// PUT 请求
ky.put('https://example.com/api/users/1', { body: { name: '李四' } });

// PATCH 请求
ky.patch('https://example.com/api/users/1', { body: { name: '王五' } });

// DELETE 请求
ky.delete('https://example.com/api/users/1');

// HEAD 请求
ky.head('https://example.com/api/users');
```

**API 签名：**
```typescript
ky.get(url, options?)
ky.post(url, options?)
ky.put(url, options?)
ky.patch(url, options?)
ky.delete(url, options?)
ky.head(url, options?)
```

## 3. 请求选项

### method

指定 HTTP 方法（默认为 `GET`）：

```javascript
await ky('https://example.com/api/users', {
  method: 'POST'
});
```

### headers

设置请求头：

```javascript
// 对象方式
await ky('https://example.com/api/users', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  }
});

// Headers 实例方式
const headers = new Headers();
headers.set('Content-Type', 'application/json');
await ky('https://example.com/api/users', { headers });
```

### body

设置请求体，支持多种格式：

```javascript
// JSON 对象（会自动设置 Content-Type: application/json）
await ky.post('https://example.com/api/users', {
  body: { name: '张三', age: 25 }
});

// FormData
const formData = new FormData();
formData.append('name', '张三');
formData.append('avatar', fileInput.files[0]);
await ky.post('https://example.com/api/users', { body: formData });

// 字符串
await ky.post('https://example.com/api/users', {
  body: JSON.stringify({ name: '张三' }),
  headers: { 'Content-Type': 'application/json' }
});

// URLSearchParams
await ky.post('https://example.com/api/users', {
  body: new URLSearchParams({ name: '张三', age: '25' })
});

// Blob / Buffer
await ky.post('https://example.com/api/upload', { body: blobData });
```

### json

便捷的 JSON 请求体设置（会自动序列化并设置 `Content-Type`）：

```javascript
await ky.post('https://example.com/api/users', {
  json: { name: '张三', age: 25 }  // 等同于 body + 自动设置 headers
});
```

### searchParams

添加 URL 查询参数：

```javascript
// 对象方式
await ky.get('https://example.com/api/users', {
  searchParams: { page: 1, limit: 10, sort: 'name' }
});
// 实际请求: https://example.com/api/users?page=1&limit=10&sort=name

// URLSearchParams 方式
await ky.get('https://example.com/api/users', {
  searchParams: new URLSearchParams({ page: '1', limit: '10' })
});

// 数组参数
await ky.get('https://example.com/api/users', {
  searchParams: { tags: ['javascript', 'typescript'] }
});
// 实际请求: https://example.com/api/users?tags=javascript&tags=typescript
```

### prefixUrl

为所有请求添加统一的前缀 URL，便于管理 API 基础路径：

```javascript
const api = ky.create({ prefixUrl: 'https://example.com/api' });

// 请求 https://example.com/api/users
await api.get('users');

// 请求 https://example.com/api/users/123
await api.get('users/123');
```

### throwHttpErrors

控制是否对 HTTP 错误状态码抛出异常（默认为 `true`）：

```javascript
// 默认行为：4xx、5xx 状态码会抛出 HttpError
// const response = await ky.get('https://example.com/api/nonexistent');
// throw new HttpError(response);

// 禁用错误抛出，返回原始响应
await ky.get('https://example.com/api/nonexistent', {
  throwHttpErrors: false
});
```

## 4. 搜索参数（searchParams）

### 基本用法

```javascript
// 简单参数
ky.get('https://example.com/search', {
  searchParams: { q: 'keyword', page: 1 }
});
// https://example.com/search?q=keyword&page=1
```

### 编码处理

```javascript
// 自动编码特殊字符
ky.get('https://example.com/search', {
  searchParams: { q: 'hello world', category: '技术&编程' }
});
// 自动将空格编码为 %20，& 编码为 %26
```

### 数组参数

```javascript
// 同一个键多个值
ky.get('https://example.com/api', {
  searchParams: { tags: ['js', 'ts', 'react'] }
});
// ?tags=js&tags=ts&tags=react
```

## 5. 超时与重试

### timeout

设置请求超时时间（毫秒，默认为 `10000`）：

```javascript
// 5秒超时
await ky.get('https://example.com/api/slow', {
  timeout: 5000
});

// 禁用超时
await ky.get('https://example.com/api/slow', {
  timeout: false
});

// 30秒超时
await ky.get('https://example.com/api/data', {
  timeout: 30000
});
```

### retry

配置重试策略，支持以下选项：

```javascript
// 启用默认重试（3次，状态码 408、429、502-504 时重试）
await ky.get('https://example.com/api', {
  retry: true
});

// 自定义重试次数
await ky.get('https://example.com/api', {
  retry: { count: 5 }
});

// 完全自定义重试策略
await ky.get('https://example.com/api', {
  retry: {
    count: 3,                          // 最大重试次数
    methods: ['GET', 'POST', 'PUT'],   // 哪些方法可以重试
    statusCodes: [408, 429, 500, 502, 503, 504],  // 哪些状态码可以重试
    delay: (attemptCount) => attemptCount * 1000  // 重试间隔（毫秒），指数退避示例
  }
});

// 指数退避策略
await ky.get('https://example.com/api', {
  retry: {
    count: 3,
    delay: (attemptCount) => Math.pow(2, attemptCount) * 1000  // 1s, 2s, 4s
  }
});
```

### retryAfter

等待指定时间后重试：

```javascript
await ky.get('https://example.com/api', {
  retry: {
    count: 3,
    after: (response, retryCount) => {
      const retryAfter = response.headers.get('Retry-After');
      return retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
    }
  }
});
```

## 6. 错误处理

### HttpError

当 `throwHttpErrors: true`（默认）时，4xx 和 5xx 响应会抛出 `HttpError`：

```javascript
import ky, { HttpError } from 'ky';

try {
  const response = await ky.get('https://example.com/api/nonexistent');
  const data = await response.json();
} catch (error) {
  if (error instanceof HttpError) {
    console.error('HTTP 错误:', error.response.status);
    console.error('状态码:', error.response.status);
    console.error('错误信息:', await error.response.text());
  }
}
```

### TimeoutError

请求超时时抛出 `TimeoutError`：

```javascript
import ky, { TimeoutError } from 'ky';

try {
  await ky.get('https://example.com/api/slow', { timeout: 1000 });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('请求超时');
  }
}
```

### 错误响应内容

```javascript
try {
  await ky.post('https://example.com/api/users', {
    json: { name: '' }
  });
} catch (error) {
  if (error instanceof HttpError) {
    const errorData = await error.response.json();
    console.error('错误详情:', errorData);
  }
}
```

### 禁用错误抛出

```javascript
// throwHttpErrors: false 时，不会抛出异常
const response = await ky.get('https://example.com/api/nonexistent', {
  throwHttpErrors: false
});

if (!response.ok) {
  console.error('请求失败:', response.status);
  const errorBody = await response.text();
  console.error('错误内容:', errorBody);
} else {
  const data = await response.json();
}
```

## 7. Hooks 系统

Ky 提供了强大的 hooks 系统，允许在请求/响应的不同阶段进行拦截和处理。

### 可用 Hooks

| Hook | 触发时机 |
|------|----------|
| `beforeRequest` | 请求发送前 |
| `beforeRetry` | 重试前 |
| `afterResponse` | 收到响应后 |

### beforeRequest

在请求发送前修改请求选项：

```javascript
const api = ky.create({
  hooks: {
    beforeRequest: [
      (request, options) => {
        // 添加认证头
        request.headers.set('Authorization', `Bearer ${getToken()}`);

        // 添加时间戳
        request.headers.set('X-Request-Time', new Date().toISOString());

        // 记录日志
        console.log(`请求: ${request.method} ${request.url}`);
      }
    ]
  }
});
```

**修改请求选项：**

```javascript
const api = ky.create({
  hooks: {
    beforeRequest: [
      (request, options) => {
        // 可以修改 URL
        // request.url = 'https://new-url.com' + request.url;

        // 可以添加头
        request.headers.set('X-Custom-Header', 'value');
      }
    ]
  }
});
```

### beforeRetry

在重试前执行逻辑：

```javascript
const api = ky.create({
  retry: { count: 3 },
  hooks: {
    beforeRetry: [
      (request, options, retryCount) => {
        console.log(`第 ${retryCount} 次重试`);

        // 检查是否需要刷新 token
        if (retryCount === 1 && isTokenExpired()) {
          request.headers.set('Authorization', `Bearer ${refreshToken()}`);
        }

        // 延迟重试
        return new Promise(resolve => setTimeout(resolve, 1000));
      }
    ]
  }
});
```

### afterResponse

在收到响应后处理：

```javascript
const api = ky.create({
  hooks: {
    afterResponse: [
      (request, options, response) => {
        // 处理 401 未授权
        if (response.status === 401) {
          const newToken = refreshToken();
          request.headers.set('Authorization', `Bearer ${newToken}`);
          // 返回 request 将重新发起请求
          return ky(request);
        }

        // 记录响应日志
        console.log(`响应: ${response.status} ${request.url}`);

        // 返回 response 继续正常流程
        return response;
      }
    ]
  }
});
```

### 多个 Hook 组合

```javascript
const api = ky.create({
  hooks: {
    beforeRequest: [
      (request) => { /* 1. 添加认证 */ },
      (request) => { /* 2. 设置请求 ID */ }
    ],
    beforeRetry: [
      (request, options, retryCount) => { /* 重试逻辑 */ },
      (request, options, retryCount) => { /* 清理逻辑 */ }
    ],
    afterResponse: [
      (request, options, response) => { /* 1. 日志记录 */ },
      (request, options, response) => { /* 2. 数据转换 */ }
    ]
  }
});
```

## 8. 实例配置

### ky.create()

创建预配置好的 Ky 实例，便于统一管理 API 配置：

```javascript
// 创建 API 实例
const api = ky.create({
  prefixUrl: 'https://example.com/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  retry: { count: 3 }
});

// 使用实例
await api.get('users');
await api.post('users', { json: { name: '张三' } });
await api.patch('users/1', { json: { name: '李四' } });
await api.delete('users/1');
```

### 默认配置合并

实例配置会与请求选项合并，请求选项优先级更高：

```javascript
const api = ky.create({
  prefixUrl: 'https://example.com/api',
  timeout: 5000,
  headers: { 'X-Default': 'value' }
});

// timeout 会被覆盖为 10000
api.get('users', { timeout: 10000 });

// headers 合并，X-Default 保留，Authorization 被添加
api.get('users', {
  headers: { 'Authorization': 'Bearer token' }
});
```

### 实例继承

```javascript
const api = ky.create({ prefixUrl: 'https://example.com/api' });
const userApi = api.extend({ prefixUrl: 'https://example.com/api/users' });
const adminApi = api.extend({
  prefixUrl: 'https://example.com/api/admin',
  headers: { 'X-Admin': 'true' }
});
```

## 9. 高级用法

### 上传文件

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'my-file');

const response = await ky.post('https://example.com/api/upload', {
  body: formData
});
```

### 下载文件

```javascript
const response = await ky.get('https://example.com/file.pdf');
const blob = await response.blob();

// 创建下载链接
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
URL.revokeObjectURL(url);
```

### 流式响应

```javascript
const response = await ky.get('https://example.com/api/stream');
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('收到数据:', new TextDecoder().decode(value));
}
```

### 并行请求

```javascript
const [users, posts] = await Promise.all([
  ky.get('https://example.com/api/users').then(r => r.json()),
  ky.get('https://example.com/api/posts').then(r => r.json())
]);
```

### 自定义 fetch

使用其他 fetch 实现（如 node-fetch、undici）：

```javascript
import fetch from 'node-fetch';

const api = ky.create({ fetch });
```

### 带进度监控的上传

```javascript
const xhr = new XMLHttpRequest();
const formData = new FormData();
formData.append('file', fileInput.files[0]);

xhr.upload.addEventListener('progress', (event) => {
  const percent = (event.loaded / event.total) * 100;
  console.log(`上传进度: ${percent}%`);
});

xhr.open('POST', 'https://example.com/api/upload');
xhr.send(formData);
```

### 扩展 Ky 实例

为 Ky 添加自定义方法：

```javascript
const api = ky.create({ prefixUrl: 'https://example.com/api' });

// 添加快捷方法
api.getJSON = (url, options) =>
  api.get(url, { ...options, throwHttpErrors: false }).then(r => r.json());

api.postJSON = (url, options) =>
  api.post(url, { ...options, throwHttpErrors: false }).then(r => r.json());

// 使用
const data = await api.getJSON('users');
```

### 与 TypeScript 配合使用

```typescript
import ky, { KyResponse } from 'ky';

interface User {
  id: number;
  name: string;
  email: string;
}

const response: KyResponse = await ky.get('https://example.com/api/users');
const users: User[] = await response.json();
```

---

## 快速参考

### 常用选项速查

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `method` | string | `'GET'` | HTTP 方法 |
| `headers` | object/Headers | `{}` | 请求头 |
| `body` | any | - | 请求体 |
| `json` | object | - | JSON 请求体 |
| `searchParams` | object/URLSearchParams | - | URL 查询参数 |
| `prefixUrl` | string | - | URL 前缀 |
| `timeout` | number | `10000` | 超时（毫秒） |
| `retry` | number/object | `{ count: 3 }` | 重试策略 |
| `throwHttpErrors` | boolean | `true` | 是否抛出 HTTP 错误 |
| `fetch` | function | 全局 fetch | 自定义 fetch 实现 |

### 错误类型

| 错误类型 | 触发条件 |
|----------|----------|
| `HttpError` | HTTP 状态码 4xx/5xx |
| `TimeoutError` | 请求超时 |
| `AbortError` | 请求被取消 |

### 导出项

```javascript
import ky, {
  HttpError,
  TimeoutError,
  AbortError,
  supportedMethods
} from 'ky';
```