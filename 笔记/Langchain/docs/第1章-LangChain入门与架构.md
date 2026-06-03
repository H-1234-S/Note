# 第 1 章 LangChain 入门与整体架构

上一章我们了解了 LLM 的基础概念，本章我们将正式进入 LangChain 的世界。

---

## 1. LangChain 是什么？

### 一句话定义

LangChain 是一个用于构建 **LLM 应用**的**开源框架**，提供了一套模块化的组件和标准化的接口。

### LangChain 能做什么？

- 简化与各种 LLM 提供商的交互
- 快速构建 RAG（检索增强生成）应用
- 开发 AI Agent（智能体）
- 管理 Prompt 模板
- 实现多轮对话和记忆
- 构建复杂的工作流

### LangChain 的版本

| 版本 | 说明 |
|------|------|
| LangChain 0.1.x | 稳定版，重构了 API，引入 LCEL |
| LangChain 0.2.x | 继续优化，性能更好 |
| LangChain 0.3.x | 当前主流版本 |
| langchain-core | 核心库，所有包的基础 |

**注意：** LangChain 经历过一次重大重构，0.1 之前的版本 API 与现在差异很大，学习时请确保使用的是较新版本。

---

## 2. LangChain 生态概览

### 核心组件

```mermaid
graph TB
    subgraph "LangChain 核心模块"
        M["Model I/O<br/>模型交互"]
        P["Retrieval<br/>数据检索"]
        C["Chains<br/>链式调用"]
        A["Agents<br/>智能体"]
        Me["Memory<br/>记忆管理"]
        T["Callbacks<br/>回调机制"]
    end

    subgraph "扩展生态"
        Community["LangChain Community<br/>社区集成"]
        LangGraph["LangGraph<br/>状态机/多智能体"]
        LangServe["LangServe<br/>部署服务"]
        LangSmith["LangSmith<br/>调试监控"]
    end

    subgraph "集成层"
        LLMs["LLM Providers<br/>OpenAI/Anthropic/本地模型"]
        VDB["Vector Stores<br/>向量数据库"]
        Tools["External Tools<br/>搜索/API/数据库"]
    end

    M & P & C & A & Me & T --> Community
    Community --> LangGraph
    Community --> LangServe
    Community --> LangSmith
    M --> LLMs
    P --> VDB
    A --> Tools
```

### 各模块职责

| 模块 | 职责 | 关键词 |
|------|------|--------|
| **Model I/O** | 与 LLM 交互 | Prompt 模板、模型封装、输出解析 |
| **Retrieval** | 数据处理和检索 | 文档加载、分割、向量化、向量存储 |
| **Chains** | 组合多个组件 | 顺序执行、并行处理、条件分支 |
| **Agents** | 自主决策和执行 | 工具调用、ReAct、自我推理 |
| **Memory** | 维护对话历史 | 短期记忆、长期记忆 |
| **Callbacks** | 事件监听和日志 | 流式输出、token 统计、错误追踪 |

---

## 3. 安装与环境配置

### Python 版本要求

LangChain 0.3.x 需要 **Python 3.9** 或更高版本。

```bash
# 检查 Python 版本
python --version
# Python 3.11.8
```

### 安装基础包

```bash
# 基础 LangChain 核心
pip install langchain-core

# LangChain 主包
pip install langchain

# OpenAI 集成（最常用）
pip install langchain-openai

# 社区包（包含更多集成）
pip install langchain-community

# Python-dotenv（环境变量管理）
pip install python-dotenv
```

### 环境变量配置

LangChain 需要配置 LLM 提供商的 API Key。建议使用 `.env` 文件管理：

```bash
# .env 文件
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```

```python
# load_env.py
from dotenv import load_dotenv

load_dotenv()  # 自动加载 .env 文件
```

```bash
# 或者在命令行设置
export OPENAI_API_KEY=sk-xxx  # Linux/Mac
set OPENAI_API_KEY=sk-xxx     # Windows CMD
$env:OPENAI_API_KEY="sk-xxx"  # Windows PowerShell
```

---

## 4. Hello World：第一个 LangChain 程序

### 最简示例

```python
# hello_world.py
from langchain_openai import ChatOpenAI

# 创建模型实例
llm = ChatOpenAI(model="gpt-4o")

# 调用模型
response = llm.invoke("你好，介绍一下你自己")
print(response.content)
```

### 带 Prompt 模板

```python
# prompt_template.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# 创建模型
llm = ChatOpenAI(model="gpt-4o")

# 创建 Prompt 模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一位专业的{subject}专家"),
    ("user", "{question}")
])

# 构建 Chain
chain = prompt | llm

# 调用
result = chain.invoke({
    "subject": "Python 编程",
    "question": "什么是装饰器？"
})

print(result.content)
```

### 运行结果

```
装饰器是 Python 中一种强大的语法糖，允许你在不修改原函数的前提下，
动态地扩展函数的功能。装饰器本质上是一个接受函数作为参数的函数，
返回一个新的函数。
```

---

## 5. LangChain 核心概念：LCEL

### 什么是 LCEL？

LCEL（LangChain Expression Language，LangChain 表达式语言）是 LangChain 1.0 引入的核心特性，提供了一种声明式的方式来组合 LangChain 组件。

### 管道操作符 `|`

LCEL 的核心是 `|` 管道操作符，它将多个组件串联起来，形成一个处理管道。

```python
# 简单 Chain
prompt | model | output_parser
```

```mermaid
flowchart LR
    A[输入] --> B[Prompt]
    B --> C[Model]
    C --> D[Output Parser]
    D --> E[输出]
```

### 为什么用 LCEL？

| 特性 | 说明 |
|------|------|
| **声明式** | 你描述"做什么"而不是"怎么做" |
| **可组合** | 轻松组合多个组件 |
| **内置优化** | 自动处理并行、流式、批处理 |
| **统一接口** | 所有 LCEL 对象都实现了 Runnable 接口 |

---

## 6. Chat Model vs LLM

### 两种模型类型

LangChain 支持两种模型类型：

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **LLM** | 文本输入，文本输出 | 文本补全、写作 |
| **Chat Model** | 对话格式输入，对话格式输出 | 对话、问答 |

### 代码对比

```python
from langchain_openai import ChatOpenAI, OpenAI

# Chat Model（推荐）
chat_model = ChatOpenAI(model="gpt-4o")
chat_response = chat_model.invoke("你好")
print(type(chat_response))
# <class 'langchain_core.messages.AIMessage'>

# LLM
llm = OpenAI(model="gpt-3.5-turbo-instruct")
llm_response = llm.invoke("你好")
print(type(llm_response))
# <class 'langchain_core.messages.GenericMessage'>
```

### Message 类型

Chat Model 使用特殊的消息类型：

```python
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# 消息示例
messages = [
    SystemMessage(content="你是一个有帮助的助手"),      # 系统消息
    HumanMessage(content="今天天气如何？"),              # 用户消息
    AIMessage(content="今天天气晴朗，温度 25 度"),       # AI 回复
    HumanMessage(content="适合出门吗？"),               # 用户追问
]
```

---

## 7. LangChain 项目结构

### 推荐的目录结构

```
my_langchain_project/
├── .env                    # 环境变量（不提交到 git）
├── .gitignore
├── requirements.txt
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── chains/          # Chain 相关代码
│       │   ├── __init__.py
│       │   └── basic_chain.py
│       ├── prompts/         # Prompt 模板
│       │   ├── __init__.py
│       │   └── templates.py
│       ├── agents/          # Agent 相关代码
│       │   ├── __init__.py
│       │   └── my_agent.py
│       └── utils/           # 工具函数
│           ├── __init__.py
│           └── helpers.py
├── tests/                  # 测试
│   └── test_chains.py
└── notebooks/              # Jupyter notebooks
    └── exploration.ipynb
```

### 一个完整示例

```python
# src/my_project/chains/basic_chain.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def create_translation_chain():
    """创建一个翻译 Chain"""

    # 1. 定义 Prompt 模板
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一位专业的翻译专家，将以下文本翻译成{target_language}"),
        ("user", "{text}")
    ])

    # 2. 创建模型
    model = ChatOpenAI(model="gpt-4o")

    # 3. 创建输出解析器
    parser = StrOutputParser()

    # 4. 组合 Chain
    chain = prompt | model | parser

    return chain

# 使用
if __name__ == "__main__":
    chain = create_translation_chain()
    result = chain.invoke({
        "target_language": "英文",
        "text": "今天天气真好！"
    })
    print(result)
    # "The weather is really nice today!"
```

---

## 8. 常见错误与排查

### 1. API Key 未设置

```python
# 错误
AuthenticationError: Incorrect API key provided

# 解决
import os
os.environ["OPENAI_API_KEY"] = "your-api-key"
# 或创建 .env 文件
```

### 2. 模型名称错误

```python
# 错误
InvalidRequestError: Model not found

# 解决 - 使用正确的模型名
llm = ChatOpenAI(model="gpt-4o")        # ✅ 正确
llm = ChatOpenAI(model="gpt-4o-mini")   # ✅ 正确
llm = ChatOpenAI(model="gpt-5")         # ❌ 不存在
```

### 3. 网络问题

```python
# 在中国可能需要设置代理
import os
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7890"
os.environ["HTTP_PROXY"] = "http://127.0.0.1:7890"
```

### 4. 包版本不兼容

```bash
# 查看安装的版本
pip show langchain langchain-core langchain-openai

# 确保版本兼容
pip install langchain>=0.3.0 langchain-core>=0.3.0 langchain-openai>=0.2.0
```

---

## 9. 本章小结

本章内容总结：

```mermaid
flowchart TD
    A[LangChain 入门] --> B[生态概览]
    B --> C[安装配置]
    C --> D[Hello World]
    D --> E[LCEL 表达式]
    E --> F[Chat vs LLM]
    F --> G[项目结构]
    G --> H[常见错误]
```

**核心要点：**

1. **LangChain** 是构建 LLM 应用的框架，提供模块化组件
2. **LCEL** 是组合组件的核心语言，使用 `|` 管道操作符
3. **Chat Model** 接收消息列表，**LLM** 接收纯文本
4. **环境配置** 需要设置 API Key，建议使用 `.env` 文件
5. **Message 类型** 包括 SystemMessage、HumanMessage、AIMessage

---

**下一章预告：** 下一章我们将深入学习 **Model I/O** 组件，包括：
- 如何更好地使用 Prompt 模板
- 如何解析模型输出
- 如何实现 Few-shot Learning
- 各种输出解析器的用法