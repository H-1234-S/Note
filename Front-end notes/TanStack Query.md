
在现代 Web 开发中，我们经常说“状态”分为两种：**本地状态**（UI 开关、表单输入）和**服务端状态**（数据库里的数据）。

TanStack Query 就是处理后者的“王者”。它不仅仅是一个异步请求库，更是一个强大的**缓存管理器**。

---
# 基础知识
## 1. 核心基础设施：QueryClient 与 Provider

在使用任何功能之前，你需要创建一个“中央仓库”来存储缓存，并将其注入到 React 树中。

``` js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. 创建一个 client 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认配置：比如数据过期时间
      staleTime: 1000 * 60 * 5, // 5 分钟内数据被认为是“新鲜”的
    },
  },
});

function App() {
  return (
    // 2. 使用 Provider 包裹你的应用
    <QueryClientProvider client={queryClient}>
      <YourComponent />
    </QueryClientProvider>
  );
}
```

---

## 2. 核心查询：useQuery (R)

`useQuery` 是最常用的 Hook，用于获取数据（Read）。它有两个核心要素：**Query Key**（缓存的身份证）和 **Query Function**（获取数据的承诺）。

### 代码示例

``` js
import { useQuery } from '@tanstack/react-query';

const fetchUser = async (userId) => {
  const res = await fetch(`https://api.example.com/users/${userId}`);
  if (!res.ok) throw new Error('网络请求错误');
  return res.json();
};

function UserProfile({ userId }) {
  // queryKey 必须是数组，它决定了缓存如何被索引
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', userId], 
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // 只有当 userId 存在时才发起请求（依赖查询）
  });

  if (isLoading) return <div>加载中...</div>;
  if (isError) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => refetch()}>手动刷新</button>
    </div>
  );
}
```

---

## 3. 核心修改：useMutation (CUD)

当你需要创建 (Create)、更新 (Update) 或删除 (Delete) 数据时，应使用 `useMutation`。它不像 `useQuery` 会自动运行，它需要你手动触发。

### 代码示例

``` js
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
      });
    },
    // 成功后的操作：通常是让旧的查询失效，触发自动重拉
    onSuccess: () => {
      // 关键：告诉 Query Client，'todos' 列表的数据过期了，请重新获取
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ text: '学习 TanStack Query' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? '提交中...' : '添加待办'}
    </button>
  );
}
```

---

## 4. 关键概念：StaleTime vs GC Time

这是新手最容易混淆的地方，理解它们能帮你优化 80% 的性能问题。

|**概念**|**含义**|**比喻**|
|---|---|---|
|**StaleTime**|数据保持“新鲜”的时间。在此期间，再次访问不会触发网络请求。|食品的**保质期**，保质期内你可以放心吃。|
|**GC Time** (旧称 CacheTime)|数据不再被使用后，在内存中保留的时间。|垃圾丢进**垃圾桶**后，多久被环卫车运走。|

> **提示：** 默认情况下，`staleTime` 是 **0**。这意味着数据一旦拿到即刻变“旧”，下次组件挂载时，它会先给你看旧数据，同时在后台偷偷发起新请求（即 **SWR 模式**：Stale-While-Revalidate）。

---

## 5. 进阶基础：多级 Query Keys

Query Key 是分层级的。如果你失效了父级 Key，所有子级都会失效。

``` js
// 比如你的 keys 定义如下：
['todos', 'list', { filter: 'all' }]
['todos', 'list', { filter: 'done' }]
['todos', 'detail', 1]

// 如果你执行：
queryClient.invalidateQueries({ queryKey: ['todos', 'list'] })
// 那么所有 'list' 下的缓存都会被刷新，但 'detail' 不受影响。
```

---

## 6. 开发者工具 (Devtools)

我强烈建议你在开发阶段开启内置的 Devtools，它能让你直观地看到缓存里有什么，哪些是 `stale`（旧的），哪些是 `fetching`。
 
``` js
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 在 Provider 内部渲染
<QueryClientProvider client={queryClient}>
  {/* ...你的应用... */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

你好！既然你已经掌握了 `useQuery` 的基本获取和 `useMutation` 的简单提交，那我们就进入“深水区”。

在资深工程师眼中，TanStack Query 不仅仅是“发请求的钩子”，它更是一个**异步状态机**。接下来的进阶内容将围绕：**性能极限优化、复杂交互实现、以及工程化架构**展开。

---
# 进阶知识
## 1. 架构进阶：Query Key 序列化与工厂模式

**痛点：** 基础用法中，我们在组件里随处硬编码 `['users', userId]`。当项目变大，你很难记得哪里用了哪个 Key，导致 `invalidateQueries` 时漏掉或写错。

**进阶方案：** 使用 **Query Key Factory**（查询键工厂）。这能确保 Key 的唯一性和层级结构，方便批量失效。

``` js
// 📁 src/api/query-keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// 使用场景
useQuery({
  queryKey: userKeys.list(searchTag),
  queryFn: () => fetchUsers(searchTag)
});

// 失效所有用户相关的缓存（列表和详情全刷）
queryClient.invalidateQueries({ queryKey: userKeys.all });
// 仅失效列表，不影响正在查看的详情页
queryClient.invalidateQueries({ queryKey: userKeys.lists() });
```

---

## 2. 交互进阶：乐观更新 (Optimistic Updates)

**场景：** 用户点个赞，如果等服务器返回成功再变亮，会有 500ms 的延迟，显得应用很卡。

**方案：** 假设请求会成功，直接改缓存，如果失败了再回滚。

``` js
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateTodo,
  // 1. 触发 mutate 时立即执行
  onMutate: async (newTodo) => {
    // 撤销相关的正在进行的请求（防止覆盖乐观更新）
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] });
    
    // 保存旧值用于回滚
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id]);
    
    // 直接更新缓存（UI 会立刻变）
    queryClient.setQueryData(['todos', newTodo.id], newTodo);
    
    return { previousTodo };
  },
  // 2. 发生错误时回滚
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos', newTodo.id], context.previousTodo);
  },
  // 3. 无论成功失败都刷新，确保最终状态一致
  onSettled: (newTodo) => {
    queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] });
  },
});
```

---

## 3. 性能进阶：数据转换与选择 (select)

**痛点：** API 返回了整个 User 对象（包含 50 个字段），但你的组件只需要 `username`。

**方案：** 使用 `select` 配置。它具有**缓存记忆**功能，只有当 `data` 变化且转换后的结果变化时，组件才会重新渲染。

``` js
const { data: username } = useQuery({
  queryKey: ['user', id],
  queryFn: fetchUser,
  // 仅提取需要的部分，由于 select 的存在，组件不会因为其他字段改变而无效渲染
  select: (user) => user.username.toUpperCase(), 
});
```

---

## 4. 体验进阶：预获取 (Prefetching)

**场景：** 用户鼠标悬停在文章标题上时，提前加载内容；或者在分页时提前加载下一页。

``` js
const prefetchNextPage = async (nextPage) => {
  await queryClient.prefetchQuery({
    queryKey: ['posts', nextPage],
    queryFn: () => fetchPosts(nextPage),
    staleTime: 5000, // 预取的数据 5 秒内有效
  });
};

// 在组件中
<button onMouseEnter={() => prefetchNextPage(currentPage + 1)}>
  下一页
</button>
```

---

## 5. 复杂查询：无限滚动 (useInfiniteQuery)

处理分页列表、瀑布流的核心 Hook。它会自动管理 `pageParams`。

``` js
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: ({ pageParam = 1 }) => fetchProjects(pageParam),
  getNextPageParam: (lastPage, allPages) => {
    // 返回下一页的页码，如果没有更多了返回 undefined
    return lastPage.nextCursor ?? undefined;
  },
  initialPageParam: 1,
});

// 渲染逻辑
return (
  <div>
    {data.pages.map((group, i) => (
      <React.Fragment key={i}>
        {group.data.map(project => <p key={project.id}>{project.name}</p>)}
      </React.Fragment>
    ))}
    <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
      {isFetchingNextPage ? '加载中...' : '加载更多'}
    </button>
  </div>
);
```

---

## 6. 全局感知：QueryCache 与 MutationCache

如果你想在**任何**请求失败时弹出一个通用的 Toast，不需要在每个 `useQuery` 里写 `onError`。在初始化时统一配置：

``` js
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`全局错误捕捉: ${error.message}`);
    },
  }),
});
```

---
### 下一步建议

既然你已经掌握了这些工程化技巧，**你会想了解如何将 TanStack Query 与 Next.js 的 Server Components (RSC) 结合，进行服务器端预注入（Hydration）吗？** 或者是想深入探讨如何处理**高频轮询 (Polling)** 的场景？

---
# 案例

