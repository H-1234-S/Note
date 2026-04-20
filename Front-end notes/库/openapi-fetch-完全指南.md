## 1. 简介

openapi-fetch 是一个轻量级（仅 6kb）、类型安全的 fetch 客户端，专为 OpenAPI 规范设计。

### 核心特点

| 特点 | 描述 |
|------|------|
| **类型安全** | 基于 OpenAPI schema 自动推导类型，无需手动定义 |
| **轻量高效** | 压缩后仅 6kb，执行速度可达 300k ops/s |
| **零运行时依赖** | 仅依赖原生 fetch API |
| **框架无关** | 可用于 React、Vue、Svelte 或原生 JavaScript |

### 对比其他 HTTP 库

| 库 | 大小 | 性能 |
|---|---|---|
| openapi-fetch | 6 kB | 最快 |
| axios | 32 kB | 1.3x 慢 |
| superagent | 55 kB | 6x 慢 |

---

## 2. 安装与配置

### 安装依赖

```bash
npm install openapi-fetch
npm install -D openapi-typescript typescript
```

### 生成 OpenAPI 类型

使用 openapi-typescript 从 OpenAPI schema 生成 TypeScript 类型：

```bash
npx openapi-typescript ./api/openapi.yaml -o ./src/api/types.ts
```

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

> 建议开启 `noUncheckedIndexedAccess`，可以更严格地检查数组访问。

---

## 3. 创建客户端

### 基本用法

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./api/types"; // openapi-typescript 生成的类型

// 创建客户端实例
const client = createClient<paths>({
  baseUrl: "https://api.example.com/v1",
});
```

### 完整配置项

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./api/types";

const client = createClient<paths>({
  baseUrl: "https://api.example.com/v1",

  // 自定义 fetch 函数（可选）
  fetch: customFetchFunction,

  // 自定义 Headers
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-token",
  },

  // 全局查询参数序列化器
  querySerializer: (query) => {
    return new URLSearchParams(query as Record<string, string>).toString();
  },

  // 请求体序列化器
  bodySerializer: (body) => JSON.stringify(body),

  // 路径参数序列化器
  pathSerializer: (pathname, pathParams) => {
    // 替换路径中的 {param} 为实际值
    return pathname.replace(/\{(\w+)\}/g, (_, key) => String(pathParams[key]));
  },
});
```

---

## 4. HTTP 方法

openapi-fetch 支持所有标准 HTTP 方法：

```typescript
const client = createClient<paths>({ baseUrl: "https://api.example.com/v1" });

// GET 请求
const { data, error, response } = await client.GET("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});

// POST 请求
const { data, error } = await client.POST("/users", {
  body: { name: "张三", email: "zhangsan@example.com" },
});

// PUT 请求
const { data, error } = await client.PUT("/users/{user_id}", {
  params: { path: { user_id: "123" } },
  body: { name: "李四" },
});

// DELETE 请求
const { data, error } = await client.DELETE("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});

// PATCH 请求
const { data, error } = await client.PATCH("/users/{user_id}", {
  params: { path: { user_id: "123" } },
  body: { name: "王五" },
});

// OPTIONS 请求
const { data, error } = await client.OPTIONS("/users");

// HEAD 请求
const { data, error, response } = await client.HEAD("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});

// TRACE 请求
const { data, error } = await client.TRACE("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});
```

### 使用通用 request 方法

```typescript
// 通用方法，可以动态指定 HTTP 方法
const { data, error } = await client.request("POST", "/users", {
  body: { name: "张三" },
});
```

---

## 5. 请求参数

### 5.1 路径参数 (Path Parameters)

```typescript
// OpenAPI: GET /users/{user_id}
const { data } = await client.GET("/users/{user_id}", {
  params: {
    path: { user_id: "123" },
  },
});
```

### 5.2 查询参数 (Query Parameters)

```typescript
// OpenAPI: GET /users?page=1&limit=10
const { data } = await client.GET("/users", {
  params: {
    query: {
      page: 1,
      limit: 10,
    },
  },
});

// 数组查询参数
const { data } = await client.GET("/users", {
  params: {
    query: {
      tags: ["admin", "active"], // ?tags=admin&tags=active
    },
  },
});
```

### 5.3 Header 参数

```typescript
const { data } = await client.GET("/users", {
  params: {
    header: {
      Authorization: "Bearer token123",
      "X-Request-ID": "abc-123",
    },
  },
});
```

### 5.4 Cookie 参数

```typescript
const { data } = await client.GET("/users", {
  params: {
    cookie: {
      session_id: "sess_123456",
    },
  },
});
```

### 5.5 参数组合使用

```typescript
const { data } = await client.PUT("/users/{user_id}/posts/{post_id}", {
  params: {
    path: { user_id: "123", post_id: "456" },
    query: { draft: true },
    header: { Authorization: "Bearer token" },
    cookie: { tracking_id: "track_789" },
  },
});
```

---

## 6. 请求体

### 6.1 JSON 请求体

```typescript
// OpenAPI: POST /users
const { data } = await client.POST("/users", {
  body: {
    name: "张三",
    email: "zhangsan@example.com",
    age: 25,
  },
});
```

### 6.2 FormData 请求体

```typescript
// 发送 FormData
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("name", "my-file.txt");

const { data } = await client.POST("/upload", {
  body: formData,
});
```

### 6.3 自定义 Content-Type

```typescript
// 发送纯文本
const { data } = await client.POST("/logs", {
  body: "这是一条日志信息",
  headers: {
    "Content-Type": "text/plain",
  },
});
```

---

## 7. 响应处理

### 7.1 响应结构

```typescript
const result = await client.GET("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});

// result 包含:
// - data: 成功响应数据（2xx），类型自动推导
// - error: 错误响应数据（4xx/5xx）
// - response: 原生 Response 对象
```

### 7.2 区分成功与错误

```typescript
const { data, error, response } = await client.GET("/users/{user_id}", {
  params: { path: { user_id: "123" } },
});

if (error) {
  // 处理 4xx/5xx 错误
  console.error("错误码:", error.status);
  console.error("错误信息:", error.message);
  return;
}

// data 存在表示请求成功
console.log("用户数据:", data);
```

### 7.3 访问原生 Response 对象

```typescript
const { data, response } = await client.GET("/users", {
  params: { query: { page: 1 } },
});

// 查看响应头
console.log("总记录数:", response.headers.get("X-Total-Count"));

// 查看状态码
console.log("状态码:", response.status);

// 查看响应类型
console.log("Content-Type:", response.headers.get("Content-Type"));
```

### 7.4 处理非 JSON 响应

```typescript
// 获取文本响应
const { data } = await client.GET("/files/{file_id}/content", {
  params: { path: { file_id: "123" } },
  parseAs: "text",
});

// 获取 Blob
const { data: blob } = await client.GET("/images/{image_id}", {
  params: { path: { image_id: "456" } },
  parseAs: "blob",
});

// 获取 ArrayBuffer
const { data: arrayBuffer } = await client.GET("/files/{file_id}/binary", {
  params: { path: { file_id: "789" } },
  parseAs: "arrayBuffer",
});
```

---

## 8. 中间件

### 8.1 创建中间件

```typescript
import type { Middleware } from "openapi-fetch";

// 日志中间件
const loggingMiddleware: Middleware = {
  onRequest: ({ request, schemaPath }) => {
    console.log(`[请求] ${request.method} ${schemaPath}`);
    return request; // 可以返回修改后的 request，或直接返回
  },
  onResponse: ({ request, response }) => {
    console.log(`[响应] ${request.method} ${response.status}`);
    return response;
  },
  onError: ({ request, error }) => {
    console.error(`[错误] ${request.method} ${String(error)}`);
    throw error; // 或返回自定义响应
  },
};
```

### 8.2 注册中间件

```typescript
// 创建客户端
const client = createClient<paths>({ baseUrl: "https://api.example.com" });

// 注册中间件
client.use(loggingMiddleware);
```

### 8.3 取消注册中间件

```typescript
// 移除中间件
client.eject(loggingMiddleware);
```

### 8.4 实际应用中间件示例

#### 认证中间件

```typescript
const authMiddleware: Middleware = {
  onRequest: ({ request }) => {
    const token = getAccessToken(); // 获取 token
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

// 带重试的中间件
const retryMiddleware: Middleware = {
  onError: async ({ request, error, options }) => {
    const response = error as Response;
    if (response.status === 401) {
      // token 过期，刷新 token 后重试
      await refreshToken();
      // 使用默认 fetch 重试
      return fetch(request);
    }
    throw error;
  },
};
```

#### 请求格式化中间件

```typescript
const formatMiddleware: Middleware = {
  onRequest: ({ request, params }) => {
    // 统一添加时间戳
    const url = new URL(request.url);
    url.searchParams.set("_t", Date.now().toString());
    return new Request(url.toString(), request);
  },
};
```

---

## 9. 序列化配置

### 9.1 查询参数序列化

#### 数组序列化样式

```typescript
// form style (默认): tags=admin&tags=active
const { data } = await client.GET("/users", {
  params: { query: { tags: ["admin", "active"] } },
  querySerializer: {
    array: { style: "form", explode: true },
  },
});

// spaceDelimited: tags=admin%20active
const { data } = await client.GET("/users", {
  params: { query: { tags: ["admin", "active"] } },
  querySerializer: {
    array: { style: "spaceDelimited", explode: true },
  },
});

// pipeDelimited: tags=admin|active
const { data } = await client.GET("/users", {
  params: { query: { tags: ["admin", "active"] } },
  querySerializer: {
    array: { style: "pipeDelimited", explode: true },
  },
});
```

#### 对象序列化

```typescript
// form style: filter[name]=john&filter[email]=john@example.com
const { data } = await client.GET("/users", {
  params: {
    query: {
      filter: { name: "john", email: "john@example.com" },
    },
  },
  querySerializer: {
    object: { style: "form", explode: true },
  },
});

// deepObject: filter[name]=john&filter[email]=john@example.com
const { data } = await client.GET("/users", {
  params: {
    query: {
      filter: { name: "john", email: "john@example.com" },
    },
  },
  querySerializer: {
    object: { style: "deepObject", explode: true },
  },
});
```

### 9.2 保留字符配置

```typescript
// allowReserved: true 允许保留字符不被编码
// 保留字符: :/?#[]@!$&'()*+,;=
const { data } = await client.GET("/users", {
  params: {
    query: {
      search: "john:smith", // 包含保留字符
    },
  },
  querySerializer: {
    allowReserved: true,
  },
});
```

### 9.3 自定义序列化器

```typescript
// 自定义查询参数序列化
const client = createClient<paths>({
  baseUrl: "https://api.example.com",
  querySerializer: (query) => {
    // query 是 { parameters: { query: {...} } } 格式
    const params = (query as any).parameters?.query || query;
    return Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
  },
});

// 自定义请求体序列化
const client = createClient<paths>({
  baseUrl: "https://api.example.com",
  bodySerializer: (body) => {
    return JSON.stringify(body);
  },
});
```

---

## 10. 错误处理

### 10.1 基础错误处理

```typescript
const { data, error } = await client.GET("/users/{user_id}", {
  params: { path: { user_id: "nonexistent" } },
});

if (error) {
  // error 包含 4xx/5xx 响应的 body
  switch (error.status) {
    case 400:
      console.error("请求参数错误:", error.data);
      break;
    case 401:
      console.error("未授权，请重新登录");
      break;
    case 404:
      console.error("资源不存在");
      break;
    case 500:
      console.error("服务器内部错误");
      break;
  }
}
```

### 10.2 使用中间件统一错误处理

```typescript
const errorHandlerMiddleware: Middleware = {
  onError: ({ error, options }) => {
    if (error instanceof Response) {
      // 处理 HTTP 错误
      switch (error.status) {
        case 401:
          // 跳转到登录页
          window.location.href = "/login";
          break;
        case 403:
          console.error("没有权限访问此资源");
          break;
        case 503:
          console.error("服务暂不可用，请稍后重试");
          break;
      }
    }
    throw error;
  },
};
```

### 10.3 网络错误处理

```typescript
const { data, error, response } = await client.GET("/users");

// 检查是否是网络错误（response 存在但 data 不存在）
if (response.ok && !data) {
  console.error("响应解析失败");
}

// 检查是否是 fetch 本身的网络错误
if (!response && error) {
  console.error("网络连接失败:", error);
}
```

---

## 11. 高级用法

### 11.1 路径式客户端

```typescript
import { createPathBasedClient } from "openapi-fetch";

// 创建路径式客户端
const client = createPathBasedClient<paths>({
  baseUrl: "https://api.example.com",
});

// 直接通过路径访问所有 HTTP 方法
await client["/users"].GET();
await client["/users"].POST({ body: { name: "张三" } });
await client["/users/{user_id}"].GET({ params: { path: { user_id: "123" } } });
await client["/users/{user_id}"].PUT({
  params: { path: { user_id: "123" } },
  body: { name: "李四" },
});
```

### 11.2 将已有客户端转换为路径式客户端

```typescript
import { wrapAsPathBasedClient } from "openapi-fetch";

const client = createClient<paths>({ baseUrl: "https://api.example.com" });

const pathClient = wrapAsPathBasedClient(client);

// 现在可以这样使用
await pathClient["/users"].GET();
```

### 11.3 自定义 Fetch

```typescript
// 使用自定义 fetch（如 ky、axios 等）
import ky from "ky";

const client = createClient<paths>({
  baseUrl: "https://api.example.com",
  fetch: (input) => {
    return ky(input.url, {
      ...input,
      signal: input.signal,
    });
  },
});
```

### 11.4 覆盖全局配置

```typescript
const client = createClient<paths>({
  baseUrl: "https://api.example.com",
  headers: { "X-Global-Header": "value" },
});

// 单个请求可以覆盖全局配置
const { data } = await client.GET("/special", {
  headers: { "X-Special-Header": "override" },
  params: {
    query: { custom: true },
  },
});
```

### 11.5 工具函数

openapi-fetch 提供了一些可导出的工具函数：

```typescript
import {
  serializePrimitiveParam,
  serializeObjectParam,
  serializeArrayParam,
  createQuerySerializer,
  createFinalURL,
  mergeHeaders,
  removeTrailingSlash,
} from "openapi-fetch";

// 序列化基本类型参数
const result = serializePrimitiveParam("name", "john", { allowReserved: false });

// 序列化对象参数
const result = serializeObjectParam("filter", { name: "john" }, {
  style: "form",
  explode: true,
});

// 序列化数组参数
const result = serializeArrayParam("tags", ["admin", "active"], {
  style: "form",
  explode: true,
});

// 创建查询参数序列化器
const querySerializer = createQuerySerializer({
  array: { style: "form", explode: true },
  object: { style: "deepObject", explode: true },
});

// 创建最终 URL
const url = createFinalURL("/users/{user_id}", {
  baseUrl: "https://api.example.com",
  params: {
    path: { user_id: "123" },
    query: { page: 1 },
  },
  querySerializer: (q) => new URLSearchParams(q as any).toString(),
  pathSerializer: (p, pp) => p.replace(/\{(\w+)\}/g, (_, k) => String(pp[k])),
});

// 合并 Headers
const headers = mergeHeaders(
  { "X-Header-1": "value1" },
  { "X-Header-2": "value2" },
  { "X-Header-1": "override" }, // 后面的会覆盖前面的
);

// 移除 URL 末尾斜杠
const cleanUrl = removeTrailingSlash("https://api.example.com/users/");
```

---

## 12. 最佳实践

### 12.1 项目结构

```
src/
├── api/
│   ├── types.ts          # openapi-typescript 生成的类型
│   ├── client.ts         # 客户端配置
│   └── endpoints/        # API 调用封装（可选）
│       ├── users.ts
│       └── posts.ts
├── hooks/                # React/Vue 等框架的 hooks
└── utils/
```

### 12.2 客户端封装示例

```typescript
// api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "./types";

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});

// 可选：封装常用配置
export function createAuthenticatedClient(token: string) {
  return createClient<paths>({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

### 12.3 React Hooks 集成示例

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export function useUsers(page = 1) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await apiClient.GET("/users", {
          params: { query: { page, limit: 20 } },
        });

        if (!cancelled) {
          if (error) {
            setError(error);
          } else {
            setUsers(data?.users || []);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [page]);

  return { users, loading, error };
}
```

### 12.4 类型安全优势

openapi-fetch 的最大优势是类型安全，所有类型都从 OpenAPI schema 自动推导：

```typescript
// 假设 OpenAPI schema 定义了以下端点：
// GET /users/{user_id} -> 返回 User
// POST /users -> 接受 CreateUserRequest

const { data } = await client.GET("/users/{user_id}", {
  params: { path: { user_id: 123 } }, // TypeScript 会检查 user_id 类型
});

// data 的类型是 User | undefined
// error 的类型是 ErrorResponse | undefined

// 尝试传递错误的参数会报错
client.GET("/users/{user_id}", {
  params: { path: { user_id: "not-a-number" } }, // TypeScript 错误！
});
```

---

## 附录：API 速查表

### createClient 选项

| 选项 | 类型 | 描述 |
|------|------|------|
| `baseUrl` | `string` | API 基础 URL |
| `fetch` | `function` | 自定义 fetch 函数 |
| `headers` | `Headers \| object` | 全局请求头 |
| `querySerializer` | `function \| object` | 查询参数序列化器 |
| `bodySerializer` | `function` | 请求体序列化器 |
| `pathSerializer` | `function` | 路径参数序列化器 |

### 请求选项

| 选项 | 类型 | 描述 |
|------|------|------|
| `params.path` | `object` | 路径参数 |
| `params.query` | `object` | 查询参数 |
| `params.header` | `object` | Header 参数 |
| `params.cookie` | `object` | Cookie 参数 |
| `body` | `any` | 请求体 |
| `headers` | `Headers \| object` | 请求头 |
| `parseAs` | `'json' \| 'text' \| 'blob' \| 'arrayBuffer' \| 'stream'` | 响应解析格式 |
| `middleware` | `Middleware[]` | 中间件 |

### HTTP 方法

- `client.GET(path, options)`
- `client.POST(path, options)`
- `client.PUT(path, options)`
- `client.DELETE(path, options)`
- `client.PATCH(path, options)`
- `client.OPTIONS(path, options)`
- `client.HEAD(path, options)`
- `client.TRACE(path, options)`
- `client.request(method, path, options)`

---

## 相关资源

- [openapi-fetch GitHub](https://github.com/openapi-ts/openapi-typescript)
- [openapi-typescript](https://www.npmjs.com/package/openapi-typescript) - 类型生成工具
- [OpenAPI 规范](https://spec.openapis.org/oas/latest.html)
