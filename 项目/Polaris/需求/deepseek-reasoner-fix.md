# DeepSeek-v4-pro 多轮调用 reasoning_content 字段缺失问题解决

## 问题描述

在使用 DeepSeek-v4-pro 模型进行多轮对话时，模型的 `reasoning_content`（思维链）字段在后续轮次的请求中丢失。这导致：

- 每次对话只能工作一轮
- 第二轮及后续请求中，模型无法获得上一轮的推理过程
- 多轮工具调用场景下，模型推理能力显著下降

## 根本原因

DeepSeek-v4-pro 是一个 Reasoner 模型，其思维链通过 `reasoning_content` 字段返回。然而：

1. **模型返回的响应中带有思维链**：第一轮请求能正确返回 `reasoning_content`
2. **第二轮请求时思维链丢失**：需要把上一轮的 `reasoning_content` 作为 `reasoning_content` 字段传给下一轮，但这个字段 **不在标准的 `messages` 结构中**
3. **架构时序问题**：
   - 响应中的 `reasoning_content` 是在 `lastResult.raw` 中获取的（此时请求已结束）
   - 下一轮请求发送前，需要将这个值注入到 `messages` 中
   - 原始框架的 `onCall` 钩子在请求发送前触发，但框架本身没有处理 `reasoning_content` 的逻辑

## 解决方案

采用 **Thread-Local 变量 + onCall 钩子注入** 的模式。

### 1. Thread-Local 变量存储

```typescript
// deepseek.ts
let pendingReasoning: string | undefined;

// 导出给 router 调用：从 raw 响应提取 reasoning_content 并存入 thread-local 变量
export const setReasoning: (reasoning: string) => void = (reasoning) => {
  pendingReasoning = reasoning;
};
```

### 2. Router 中提取并存储

```typescript
// process-message.ts - router 函数
const raw = lastResult.raw;
// 从响应中提取 reasoning_content
const reasoning = raw?.choices?.[0]?.message?.reasoning_content;
if (reasoning) {
  setReasoning(reasoning);  // 存入 thread-local 变量
}
```

### 3. onCall 钩子注入到消息

```typescript
// deepseek.ts - deepseekModel 函数
adapter.onCall = (model, body) => {
  // 复制父类 @inngest/ai 的 onCall 行为，设置 body.model
  body.model = (model as any).options.model;

  // 从 thread-local 变量读取 reasoning_content 并注入
  const reasoning = pendingReasoning;
  if (reasoning) {
    const messages = body.messages;
    // 找到最后一个 assistant 消息，将 reasoning_content 注入
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && (msg.tool_calls || msg.content)) {
        msg.reasoning_content = reasoning;
        break;
      }
    }
  }
  // 注入后清除，避免泄露到后续请求
  pendingReasoning = undefined;
};
```

## 关键设计点

1. **时序正确**：
   - `router` 在收到响应后调用 `setReasoning` 存储思维链
   - 下一轮 `onCall` 在请求发送前读取并注入
   - 注入后立即清除，防止跨请求污染

2. **精确定位**：通过倒序遍历消息，找到最后一个 assistant 消息（带有 tool_calls 或 content）注入

3. **OpenAI 兼容接口**：使用 `@inngest/agent-kit` 的 OpenAI 适配器，通过 `onCall` 钩子自定义请求体

## 文件变更

- `src/lib/deepseek.ts` - 新增 `pendingReasoning` 变量和 `setReasoning` 函数，扩展 `deepseekModel` 的 `onCall` 钩子
- `src/features/conversations/inngest/process-message.ts` - 在 router 中提取 `reasoning_content` 并调用 `setReasoning`

## 参考

- [DeepSeek Reasoner API](https://api.deepseek.com/)
- [@inngest/agent-kit](https://www.inngest.com/docs/agents)