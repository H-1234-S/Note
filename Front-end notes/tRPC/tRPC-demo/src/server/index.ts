import express from 'express';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';

// ============================================
// 1. 数据模拟（实际项目中替换为数据库）
// ============================================
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const users: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'user' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'user' },
];

// ============================================
// 2. 初始化 tRPC
// ============================================
const t = initTRPC.create();

// ============================================
// 3. Context（上下文）
// ============================================
export const createContext = () => ({});

type Context = ReturnType<typeof createContext>;

// ============================================
// 4. 中间件示例
// ============================================
const isAdmin = t.middleware(({ ctx, next }) => {
  // 模拟从 header 获取用户角色
  const isAdmin = Math.random() > 0.5; // 随机模拟，实际从 session/JWT 获取

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '需要管理员权限',
    });
  }

  return next({
    ctx: {
      isAdmin: true,
    },
  });
});

const adminProcedure = t.procedure.use(isAdmin);

// ============================================
// 5. 定义 Router（路由）
// ============================================
const appRouter = t.router({
  // ----- 公开 Query -----
  greeting: t.procedure.query(() => {
    return {
      message: '欢迎使用 tRPC！',
      timestamp: new Date().toISOString(),
    };
  }),

  // 获取所有用户
  getUsers: t.procedure.query(() => {
    return users;
  }),

  // 根据 ID 获取用户（带输入验证）
  getUserById: t.procedure
    .input(
      z.object({
        id: z.number().int().positive('ID 必须是正整数'),
      })
    )
    .query(({ input }) => {
      const user = users.find((u) => u.id === input.id);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `用户 ID ${input.id} 不存在`,
        });
      }

      return user;
    }),

  // ----- 需要管理员权限的 Procedure -----
  getSecretData: adminProcedure.query(() => {
    return {
      secret: '这是管理员专属数据',
      apiKeys: ['key1', 'key2', 'key3'],
    };
  }),

  // ----- Mutation -----
  createUser: t.procedure
    .input(
      z.object({
        name: z.string().min(1, '姓名不能为空').max(50),
        email: z.string().email('邮箱格式不正确'),
        role: z.enum(['admin', 'user']).default('user'),
      })
    )
    .mutation(({ input }) => {
      const newUser: User = {
        id: users.length + 1,
        ...input,
      };
      users.push(newUser);
      return newUser;
    }),

  // 更新用户
  updateUser: t.procedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(({ input }) => {
      const userIndex = users.findIndex((u) => u.id === input.id);

      if (userIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `用户 ID ${input.id} 不存在`,
        });
      }

      users[userIndex] = { ...users[userIndex], ...input };
      return users[userIndex];
    }),

  // 删除用户
  deleteUser: t.procedure
    .input(
      z.object({
        id: z.number().int().positive(),
      })
    )
    .mutation(({ input }) => {
      const userIndex = users.findIndex((u) => u.id === input.id);

      if (userIndex === -1) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `用户 ID ${input.id} 不存在`,
        });
      }

      const deleted = users.splice(userIndex, 1)[0];
      return { success: true, deleted };
    }),
});

// ============================================
// 6. 导出类型（供客户端使用）
// ============================================
export type AppRouter = typeof appRouter;

// ============================================
// 7. 创建 Express 应用
// ============================================
const app = express();

app.use(express.json());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// 健康检查端点
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`✅ tRPC 服务端运行在: http://localhost:${PORT}`);
  console.log(`   - tRPC 端点: http://localhost:${PORT}/trpc`);
  console.log(`   - 健康检查: http://localhost:${PORT}/health`);
});
