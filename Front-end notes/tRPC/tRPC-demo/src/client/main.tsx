import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';
import './styles.css';

// ============================================
// 1. 创建 tRPC 客户端
// ============================================
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''; // 浏览器使用相对路径（Vite 代理）
  }
  return 'http://localhost:4000';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000, // 5 秒后重新获取
      retry: 1,        // 失败重试一次
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
    }),
  ],
});

// ============================================
// 2. App 组件
// ============================================
function App() {
  const [userId, setUserId] = useState<string>('1');

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="container">
          <header>
            <h1>tRPC 入门示例</h1>
            <p>体验端到端类型安全的 RPC 调用</p>
          </header>

          <nav>
            <a href="#greeting">欢迎信息</a>
            <a href="#users">用户列表</a>
            <a href="#user-detail">用户详情</a>
            <a href="#create-user">创建用户</a>
            <a href="#admin">管理员功能</a>
          </nav>

          <main>
            <GreetingSection />
            <hr />
            <UsersListSection />
            <hr />
            <UserDetailSection userId={userId} onUserIdChange={setUserId} />
            <hr />
            <CreateUserSection />
            <hr />
            <AdminSection />
          </main>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// ============================================
// 3. 欢迎信息组件
// ============================================
function GreetingSection() {
  const { data, isLoading, error, refetch } = trpc.greeting.useQuery();

  return (
    <section id="greeting">
      <h2>欢迎信息</h2>
      {isLoading && <p className="loading">加载中...</p>}
      {error && <p className="error">错误: {error.message}</p>}
      {data && (
        <div className="card">
          <p><strong>消息:</strong> {data.message}</p>
          <p><strong>时间:</strong> {data.timestamp}</p>
          <button onClick={() => refetch()}>刷新</button>
        </div>
      )}
    </section>
  );
}

// ============================================
// 4. 用户列表组件
// ============================================
function UsersListSection() {
  const { data: users, isLoading, error, refetch } = trpc.getUsers.useQuery();

  return (
    <section id="users">
      <h2>用户列表</h2>
      {isLoading && <p className="loading">加载中...</p>}
      {error && <p className="error">错误: {error.message}</p>}
      {users && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role ${user.role}`}>{user.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => refetch()}>刷新列表</button>
        </div>
      )}
    </section>
  );
}

// ============================================
// 5. 用户详情组件
// ============================================
function UserDetailSection({
  userId,
  onUserIdChange,
}: {
  userId: string;
  onUserIdChange: (id: string) => void;
}) {
  const id = parseInt(userId, 10);

  const { data: user, isLoading, error } = trpc.getUserById.useQuery(
    { id },
    {
      enabled: !isNaN(id) && id > 0, // 只有有效 ID 才发送请求
    }
  );

  const deleteUser = trpc.deleteUser.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getUsers'] });
      alert('用户删除成功！');
    },
    onError: (err) => {
      alert(`删除失败: ${err.message}`);
    },
  });

  return (
    <section id="user-detail">
      <h2>用户详情</h2>
      <div className="input-group">
        <label>
          输入用户 ID:
          <input
            type="number"
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            min="1"
          />
        </label>
      </div>

      {isLoading && <p className="loading">加载中...</p>}
      {error && <p className="error">错误: {error.message}</p>}

      {user && (
        <div className="card">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>姓名:</strong> {user.name}</p>
          <p><strong>邮箱:</strong> {user.email}</p>
          <p><strong>角色:</strong> {user.role}</p>
          <button
            className="danger"
            onClick={() => {
              if (confirm(`确定删除用户 ${user.name} 吗？`)) {
                deleteUser.mutate({ id: user.id });
              }
            }}
          >
            删除此用户
          </button>
        </div>
      )}
    </section>
  );
}

// ============================================
// 6. 创建用户组件
// ============================================
function CreateUserSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createUser = trpc.createUser.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['getUsers'] });
      setForm({ name: '', email: '', role: 'user' });
    },
    onError: (err) => {
      setError(err.message);
      setResult(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(form);
  };

  return (
    <section id="create-user">
      <h2>创建用户（Mutation）</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>
            姓名:
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={1}
              maxLength={50}
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            邮箱:
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            角色:
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as 'admin' | 'user' })
              }
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? '创建中...' : '创建用户'}
        </button>

        {error && <p className="error">{error}</p>}
        {result && (
          <div className="success">
            <p>用户创建成功！</p>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </form>
    </section>
  );
}

// ============================================
// 7. 管理员功能组件
// ============================================
function AdminSection() {
  const { data, isLoading, error, refetch } = trpc.getSecretData.useQuery();

  return (
    <section id="admin">
      <h2>管理员专属功能</h2>
      {isLoading && <p className="loading">加载中...</p>}
      {error && <p className="error">错误: {error.message}</p>}
      {data && (
        <div className="card admin">
          <p><strong>Secret:</strong> {data.secret}</p>
          <p><strong>API Keys:</strong></p>
          <ul>
            {data.apiKeys.map((key, i) => (
              <li key={i}>{key}</li>
            ))}
          </ul>
          <button onClick={() => refetch()}>刷新</button>
        </div>
      )}
    </section>
  );
}

// ============================================
// 8. 渲染应用
// ============================================
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
