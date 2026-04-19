import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './index';

// 创建类型安全的 tRPC React Hooks
export const trpc = createTRPCReact<AppRouter>();
