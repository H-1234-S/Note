
如果你之前用过 React Hook Form 或者 Formik，你会发现 TanStack Form 的思路非常超前：它是**类型驱动（Type-safe）** 且**框架无关（Framework agnostic）** 的。这意味着无论你是在 React、Vue、Solid 还是 Svelte 中，逻辑几乎是一样的，而且它对 TypeScript 的支持好到让人惊叹。

---
# 核心知识

## 1. 安装与初始化

在 React 中，我们主要使用 `@tanstack/react-form`。

``` Bash
npm install @tanstack/react-form
```

---

## 2. 创建表单实例 (`useForm`)

这是表单的“大脑”。你需要在这里定义初始值（`defaultValues`）以及提交逻辑（`onSubmit`）。

``` TypeScript
import { useForm } from '@tanstack/react-form'

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
  },
  onSubmit: async ({ value }) => {
    // value 是完全类型安全的
    console.log(value)
  },
})
```

---

## 3. 字段渲染与绑定 (`form.Field`)

TanStack Form 使用渲染属性（Render Props）模式。每个字段都是一个独立的组件，这有助于提高性能（只重新渲染变动的字段）。

**架构设计：** 每一个 `form.Field` 都是**原子化**的。这意味着当你修改 `userName` 时，`email` 和 `address` 的输入框完全不会重新渲染，这在大表单中性能极佳。

### 核心属性：

- **name**: 对应 `defaultValues` 中的键。
    
- **children**: 一个函数，接收 `field` 对象作为参数。
    

``` TypeScript
<form.Field
  name="firstName"
  children={(field) => (
    <div>
      <label htmlFor={field.name}>First Name:</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        // onBlur 发生在用户“离开”输入框的那一刻，而 field.handleBlur 的作用是告诉表单系统：“这个字段已经被用户‘碰过’（Touched）了。”
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )}
/>
```

### field参数

#### 1. `field` 参数从哪里来？

在 React 的 **Render Props** 模式中，`form.Field` 并不是一个普通的组件，它更像是一个**高阶逻辑容器**。

1. **注册过程**：当你定义 `<form.Field name="firstName">` 时，该组件内部会去 `form`（即 `useForm` 返回的实例）中寻找路径为 `firstName` 的状态节点。
    
2. **状态订阅**：`form.Field` 会自动订阅这个特定路径的状态变化。
    
3. **注入注入**：当组件渲染时，它会创建一个包含**该字段当前状态**（如 `value`, `isTouched`）和**控制方法**（如 `handleChange`）的对象。这个对象就是 `field`。
    

---

#### 2. `field` 参数有什么用？

它的核心作用是**连接（Binding）**。

它充当了“底层数据状态”与“上层 UI 控件”之间的桥梁。如果没有 `field`，你需要手动写大量的 `useState`、`useEffect` 和校验逻辑来同步每一个 Input。有了它，你只需要把 `field` 提供的属性“挂载”到原生的 `<input />` 或 UI 框架（如 Ant Design/Mantine）的组件上即可。

---

#### 3. `field` 对象常用属性详解

`field` 对象非常庞大，但我们可以将其分为三大类：**元数据 (Meta)**、**核心状态 (State)** 和 **动作方法 (Methods)**。

#### A. 核心状态 (field.state)

反映了该字段在表单中的实时情况。

- **`field.state.value`**: 当前字段的值（最常用）。
    
- **`field.state.meta.errors`**: 一个数组，包含了该字段当前所有的验证错误信息。
    
- **`field.state.meta.isTouched`**: 布尔值，标识用户是否点击过并离开了该字段（通常用于控制“只有碰过才显示错误”）。
	
	- 执行 `field.handleBlur()`后 `field.state.meta.isTouched` 从 `false` 变为 `true`。
    
- **`field.state.meta.isValidating`**: 布尔值，异步验证（如查重）进行时为 `true`。
    

#### B. 动作方法 (field.handle...)

用于更新表单状态的“方向盘”。

- **`field.handleChange(newValue)`**: 改变字段的值。它会自动触发校验逻辑。
    
- **`field.handleBlur()`**: 标记字段为 "touched" 状态。通常挂载在 input 的 `onBlur` 上。
    
- **`field.validate()`**: 手动触发一次该字段的校验。
    

#### C. 基础信息

- **`field.name`**: 完整的字段路径字符串（如 `users[0].firstName`）。
    
- **`field.form`**: 指向整个表单实例的引用，让你可以跨字段操作（比如在 A 字段里调用 `field.form.reset()`）。


---

## 4. 表单验证 (Validation)

TanStack Form 可以在**字段级别**或**表单级别**进行验证。它支持同步和异步验证。

### 字段级验证

你可以直接在 `Field` 上定义 `validators`。

``` TypeScript
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) => 
      value < 18 ? '必须年满 18 岁' : undefined,
  }}
  children={(field) => (
    <>
      <input 
        type="number"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)} 
      />
      {/* 显示错误信息 */}
      {field.state.meta.errors ? (
        <em style={{ color: 'red' }}>{field.state.meta.errors.join(', ')}</em>
      ) : null}
    </>
  )}
/>
```

---

## 5. 订阅表单状态 (`form.Subscribe`)

如果你需要根据表单的整体状态（如 `canSubmit`, `isSubmitting`）来更新 UI（比如禁用提交按钮），可以使用 `Subscribe` 组件。这能避免整个父组件因为一个输入框的变动而重新渲染。

``` TypeScript
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )}
/>
```

---

## 6. 数组/列表处理 (Field Arrays)

处理动态列表（如社交媒体链接、多个电话号码）非常简单，只需将 `name` 指向数组路径即可。

``` TypeScript
const form = useForm({
  defaultValues: {
    friends: ['张三'] // 初始有一个输入框
  }
})

// JSX 渲染
<form.Field
  name="friends"
  mode="array" // 明确告诉插件这是数组模式
  children={(field) => (
    <div>
      {/* 1. 遍历数组值，渲染多个输入框 */}
      {field.state.value.map((_, i) => (
        <div key={i}>
          {/* 注意：name 必须是 path 格式，例如 "friends[0]", "friends[1]" */}
          <form.Field name={`friends[${i}]`}>
            {(subField) => (
              <input
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          
          {/* 2. 删除功能 */}
          <button type="button" onClick={() => field.removeValue(i)}>删除</button>
        </div>
      ))}
      {/* 3. 添加功能 */}
      <button type="button" onClick={() => field.pushValue('')}>
        添加好友
      </button>
    </div>
  )}
/>
```

---

## 7. 综合示例

将以上碎片整合在一起，就是一个完整的表单：

``` TypeScript
function App() {
  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => alert(JSON.stringify(value)),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => !value.includes('@') ? '邮箱格式不正确' : undefined
        }}
        children={(field) => (
          <div>
            <input 
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && <span>{field.state.meta.errors}</span>}
          </div>
        )}
      />
      
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <button type="submit">{isSubmitting ? '...' : '提交'}</button>
        )}
      />
    </form>
  )
}
```

---

# 进阶知识

掌握了 TanStack Form 的基础渲染和同步验证后，你会发现它真正的威力在于处理**复杂的异步逻辑**、**跨字段依赖**以及**极致的类型安全**。

---

## 1. 外部 Schema 验证 (结合 Zod)

虽然内置的 `validators` 很方便，但在大型项目中，我们通常希望复用业务模型。TanStack Form 对 **Zod**、**Valibot** 或 **Yup** 有着一等公民级别的支持。

**为什么进阶？** 统一管理校验规则，减少重复代码。

``` TypeScript
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

const userSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(8, '密码至少 8 位'),
})

const form = useForm({
  defaultValues: { email: '', password: '' },
  // 使用 zodValidator 适配器
  validatorAdapter: zodValidator(),
  validators: {
    onChange: userSchema, // 表单级实时校验
  },
  onSubmit: ({ value }) => console.log(value),
})
```

---

## 2. 字段依赖校验 (Cross-field Validation)

有时候一个字段的验证取决于另一个字段的值（例如：“确认密码”必须等于“密码”）。

**进阶点：** 利用 `validators` 中的 `listenTo` 属性，当依赖项变化时触发当前字段重新校验。

``` TypeScript
<form.Field
  name="confirmPassword"
  listenTo={['password']} // 监听 password 字段的变化
  validators={{
    onChange: ({ value, fieldApi }) => {
      // 通过 fieldApi 获取整个表单或其他字段的状态
      if (value !== fieldApi.form.getFieldValue('password')) {
        return '两次输入的密码不一致'
      }
      return undefined
    },
  }}
  children={(field) => (
    <input 
      value={field.state.value} 
      onChange={(e) => field.handleChange(e.target.value)} 
      placeholder="确认密码"
    />
  )}
/>
```

---

## 3. 异步验证与防抖 (Async Validation & Debounce)

处理“检查用户名是否已存在”这类需要调用 API 的场景。

**进阶点：** 使用 `onChangeAsync` 并配合 `onChangeAsyncDebounceMs` 避免频繁请求后端。

``` TypeScript
<form.Field
  name="username"
  asyncValidators={{
    onChangeAsyncDebounceMs: 500, // 防抖 500ms
    onChangeAsync: async ({ value }) => {
      const res = await checkUserExists(value)
      return res.exists ? '用户名已被占用' : undefined
    },
  }}
  children={(field) => (
    <div>
      <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
      {/* 异步验证时的加载状态 */}
      {field.state.meta.isValidating && <span>检查中...</span>}
      {field.state.meta.errors && <em>{field.state.meta.errors}</em>}
    </div>
  )}
/>
```

---

## 4. 表单数组的深度操作 (Nested Field Arrays)

在基础用法中我们提到了数组，进阶场景通常涉及**插入、移动和删除**。

**进阶点：** 使用 `field.pushValue`, `field.removeValue`, `field.insertValue` 等内置方法。

``` TypeScript
<form.Field
  name="hobbies"
  mode="array" // 明确指明为数组模式
  children={(field) => (
    <div>
      {field.state.value.map((_, i) => (
        <div key={i}>
          <form.Field name={`hobbies[${i}]`}>
            {(subField) => (
              <input value={subField.state.value} onChange={(e) => subField.handleChange(e.target.value)} />
            )}
          </form.Field>
          <button type="button" onClick={() => field.removeValue(i)}>删除</button>
        </div>
      ))}
      <button type="button" onClick={() => field.pushValue('')}>添加爱好</button>
    </div>
  )}
/>
```

---

## 5. 变换与规范化 (Transforming Values)

有时 UI 层的输入值（如 String）需要转换为 API 层的存储值（如 Number 或 Date）。

**进阶点：** 使用 `transform` 属性。

``` TypeScript
<form.Field
  name="amount"
  // 在存入 state 之前进行转换
  transform={(value) => Number(value)} 
  children={(field) => (
    <input
      type="number"
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

---

## 6. 自定义字段组件封装 (Reusable Fields)

为了代码复用，通常需要将 `form.Field` 封装成通用组件。

**进阶点：** 传递 `form` 实例或使用 `fieldApi` 类型。

``` TypeScript
// 封装一个通用的 InputField
function MyInputField({ name, label, form }: { name: any, label: string, form: any }) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <div>
          <label>{label}</label>
          <input 
            value={field.state.value} 
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)} 
          />
        </div>
      )}
    />
  )
}
```

---

## 7. 获取表单值的类型 (Type Inference)

TanStack Form 的最强项是类型推断。你可以通过 `keyof` 技巧确保你的代码完全类型安全。

``` TypeScript
type FormData = {
  userName: string
  age: number
}

// 在 useForm 中定义类型
const form = useForm<FormData>({
  defaultValues: { userName: '', age: 0 }
})

// 这里 'userName' 会有自动补全，写错会报错
<form.Field name="userName" ... />
```

---
### 进阶思维导图

1. **Schema 驱动**：让校验逻辑脱离 UI。
    
2. **异步 & 防抖**：提升后端交互体验。
    
3. **状态细粒度订阅**：利用 `Subscribe` 监控 `isDirty`, `isValid` 等状态，而不是全表单刷新。
    
4. **适配器模式**：通过适配器对接各种校验库。
    

**接下来，你是否想了解如何将 TanStack Form 与 TanStack Query 结合，实现“进入页面自动填充数据 -> 修改 -> 提交刷新缓存”的完整闭环？**

---

# 案例

这个案例将涵盖：**Zod 验证、异步用户名查重、密码二次确认依赖、动态兴趣小组（数组）、以及提交状态处理**。

### 1. 核心代码实现


``` TypeScript
import React from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

// --- 1. 定义数据结构与验证 Schema (进阶：Zod 适配) ---
const userSchema = z.object({
  username: z.string().min(3, '用户名至少3位'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
  // 动态数组基础
  hobbies: z.array(z.string().min(1, '爱好不能为空')).min(1, '至少添加一个爱好'),
})

type UserForm = z.infer<typeof userSchema>

// 模拟 API 检查用户名是否存在 (进阶：异步验证)
const checkUserExists = (name: string) => 
  new Promise((resolve) => setTimeout(() => resolve(name === 'admin'), 800))

export default function AdvancedRegistrationForm() {
  // --- 2. 初始化表单实例 (基础：useForm) ---
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      hobbies: ['编程'],
    } as UserForm,
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 1000))
      console.log('提交成功:', value)
    },
  })

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>用户注册</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      >
        {/* 用户名：演示异步验证与防抖 (进阶) */}
        <form.Field
          name="username"
          asyncValidators={{
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              const isTaken = await checkUserExists(value)
              return isTaken ? '该用户名已被占用' : undefined
            },
          }}
          children={(field) => (
            <div className="field">
              <label>用户名:</label>
              <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              {field.state.meta.isValidating && <small> 检查中...</small>}
              {field.state.meta.errors && <p style={{ color: 'red' }}>{field.state.meta.errors}</p>}
            </div>
          )}
        />

        {/* 密码：基础输入 */}
        <form.Field
          name="password"
          children={(field) => (
            <div className="field">
              <label>密码:</label>
              <input type="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        />

        {/* 确认密码：演示字段依赖 (进阶) */}
        <form.Field
          name="confirmPassword"
          listenTo={['password']} // 核心：监听 password 变化
          validators={{
            onChange: ({ value, fieldApi }) => 
              value !== fieldApi.form.getFieldValue('password') ? '两次密码不一致' : undefined,
          }}
          children={(field) => (
            <div className="field">
              <label>确认密码:</label>
              <input type="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              {field.state.meta.errors && <p style={{ color: 'red' }}>{field.state.meta.errors}</p>}
            </div>
          )}
        />

        {/* 爱好列表：演示字段数组操作 (基础+进阶) */}
        <div className="field">
          <label>兴趣爱好:</label>
          <form.Field
            name="hobbies"
            mode="array"
            children={(field) => (
              <div>
                {field.state.value.map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                    <form.Field name={`hobbies[${i}]`}>
                      {(subField) => (
                        <input value={subField.state.value} onChange={(e) => subField.handleChange(e.target.value)} />
                      )}
                    </form.Field>
                    <button type="button" onClick={() => field.removeValue(i)}>X</button>
                  </div>
                ))}
                <button type="button" onClick={() => field.pushValue('')}>添加爱好</button>
                {field.state.meta.errors && <p style={{ color: 'red' }}>{field.state.meta.errors}</p>}
              </div>
            )}
          />
        </div>

        {/* 提交按钮：演示全局状态订阅 (基础) */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit} style={{ marginTop: '20px' }}>
              {isSubmitting ? '注册中...' : '立即注册'}
            </button>
          )}
        />
      </form>
    </div>
  )
}
```

---

### 2. 设计思路与架构分析

#### A. 为什么使用 `Render Props` (Field 模式)？

TanStack Form 的核心架构是**原子化更新**。

- **传统做法**：整个表单是一个巨大的 `state`，任何输入都会导致整个表单组件重绘。
    
- **本设计**：每一个 `form.Field` 都是一个独立的订阅者。当你在输入“用户名”时，只有用户名的 `input` 组件在重绘，“密码”和“确认密码”组件保持静止。这在处理包含几十个字段的复杂表单时，性能优势巨大。
    

#### B. 为什么将验证逻辑从组件中解耦？

代码中我们使用了 `zodValidator`。

- **架构解耦**：验证逻辑（Schema）可以在前端验证，也可以直接传给后端 API 共用，保证了 **Single Source of Truth（单一事实来源）**。
    
- **维护性**：当你需要修改校验规则（比如密码长度从 6 位改为 8 位），你只需要修改 Schema，而不需要在 UI 代码里到处找逻辑。
    

#### C. 为什么引入 `listenTo`？

在进阶场景中，字段不是孤立的。

- **设计意图**：确认密码字段必须知道密码字段的值。通过 `listenTo`，TanStack Form 建立了一个**响应式依赖图**。当“密码”更新时，它会自动标记“确认密码”为无效并重新触发验证。这避免了手动在 `useEffect` 中同步状态的混乱。
    

#### D. 为什么使用 `form.Subscribe`？

- **性能优化**：我们将“提交按钮”包装在 `Subscribe` 中，并使用 `selector` 只提取 `canSubmit` 状态。这样，只有当表单整体合法性发生变化时，按钮才会重绘，而不会干扰到上方的输入控件。
    

### 3. 如何练习？

1. **基础巩固**：尝试删除 `zodValidator`，改用普通的 `validators` 函数重写验证。
    
2. **进阶挑战**：尝试在 `hobbies` 数组中添加一个“上移/下移”功能，使用 `field.moveValue(from, to)`。
    
3. **结合实战**：尝试在 `onSubmit` 中调用一个真实的 API，并根据 API 返回的错误（如 400）使用 `form.setError` 手动设置字段错误。
    

---

# Context

## createFormHookContexts

生成一组空的 **Context 容器**。它不包含具体的逻辑，只是定义了存放“表单实例”和“字段实例”的框子。

``` ts
import { createFormHookContexts } from "@tanstack/react-form";

// 1. 创建 Context 集合
export const { 
  formContext,     // 存储整个表单实例的 Context
  fieldContext,    // 存储单个字段实例的 Context
  useFormContext,  // 基础 Hook：获取表单实例
  useFieldContext  // 基础 Hook：获取字段实例
} = createFormHookContexts();
```

## createFormHook

接收 `createFormHookContexts() `创建的 Context，并返回一套**定制化**的 Hooks 和组件。

``` ts
import { createFormHook } from "@tanstack/react-form";

// 2. 基于 Context 生成具体的 Hook
export const { 
  useAppForm,             // 代替原生的 useForm，它会自动关联 Context
  useTypedAppFormContext, // 带有强类型的 Context Hook
  useField,               // 独立的字段 Hook
  AppForm                 // 自动提供 Provider 的包装组件
} = createFormHook({
  formContext,
  fieldContext,
  // 你甚至可以在这里注入全局的自定义组件（进阶用法）
  fieldComponents: {}, 
  formComponents: {},
});
```

## 使用

**父组件初始化**：

``` ts
function ParentForm() {
  const form = useAppForm({
    defaultValues: { email: "" },
    onSubmit: (val) => console.log(val),
  });

  return (
    // form.AppForm 内部自动处理了 <formContext.Provider value={form}>
    <form.AppForm>
      <h1>注册表单</h1>
      {/* 这里的子组件可以是任意深度的，不需要传 form prop */}
      <DeepNestedInput /> 
    </form.AppForm>
  );
}
```

**子组件调用**：使用生成的 `useTypedAppFormContext`。

``` ts
function DeepNestedInput() {
  // 这里的 form 直接从 Context 拿，类型极其精准
  const form = useTypedAppFormContext();

  return (
    <form.Field
      name="email"
      children={(field) => (
        <input 
          value={field.state.value} 
          onChange={(e) => field.handleChange(e.target.value)} 
        />
      )}
    />
  );
}
```

## 数据流动

例：

**text-to-speech-form.tsx**
``` ts
export const defaultTTSValues: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValues,
});
```


**text-input-panel.tsx**
``` ts
const form = useTypedAppFormContext(ttsFormOptions);

<form.Field name="text">
          {(field) => (
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="开始输入或粘贴文本..."
              className="absolute inset-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-6 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word focus-visible:ring-0"
              maxLength={TEXT_MAX_LENGTH}
              disabled={isSubmitting}
            />
          )}
        </form.Field>
```

当调用 `useAppForm` 时，TanStack Form 在内存中创建了一个 **Store（状态库）**。

Context 里的流动不是单向的，而是一个闭环：

- 用户在 `Textarea` 输入内容 $\rightarrow$ 触发 `field.handleChange` $\rightarrow$ 该方法通过 Context 找到顶层的 `form` 实例 $\rightarrow$ 修改 Store 里的 `text` 值。

- Store 里的值变了 $\rightarrow$ Context 发出信号 $\rightarrow$ **只有**订阅了 `text` 路径的 `form.Field` 收到通知 $\rightarrow$ 触发局部重新渲染 $\rightarrow$ `Textarea` 显示新值。

---

# formOptions

在基础用法中，我们直接把配置写在 `useForm` 里；而在进阶开发中，我们使用 `formOptions` 将**逻辑配置**与 **UI 组件**彻底解耦。

## 基础定义与类型锁定

这是最常见的用法，目的是为了让表单的配置在多个组件之间共享，并保持**强类型提示**。

``` TypeScript
import { formOptions } from '@tanstack/react-form'

// 1. 定义一份通用的表单配置（蓝图）
export const loginFormOptions = formOptions({
  defaultValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  // 你甚至可以在蓝图里预设好基础验证
  validators: {
    onChange: ({ value }) => {
      if (value.password.length < 6) return '密码太短了'
      return undefined
    },
  },
})
```

**为什么这么做？**

现在，无论你在哪个页面使用这个 `loginFormOptions`，TypeScript 都会自动知道这个表单有且仅有这三个字段，且类型分别是 `string`, `string`, `boolean`。

---

## 跨组件复用（新建与编辑）

假设你有一个“用户信息表单”，在“用户注册”页面需要它，在“修改资料”页面也需要它。

### 第一步：抽离配置 (`userFormConfig.ts`)


``` TypeScript
export const userFormOptions = formOptions({
  defaultValues: {
    name: '',
    bio: '',
  }
})
```

### 第二步：在“注册页面”使用


``` TypeScript
function RegisterPage() {
  const form = useAppForm({
    ...userFormOptions, // 直接展开配置
    onSubmit: async ({ value }) => {
      // 执行注册逻辑
    },
  })
  // ... 渲染表单
}
```

### 第三步：在“编辑页面”使用（覆盖默认值）


``` TypeScript
function EditProfilePage({ userData }) {
  const form = useAppForm({
    ...userFormOptions, 
    defaultValues: userData, // 用已有的用户信息覆盖初始的空值
    onSubmit: async ({ value }) => {
      // 执行更新逻辑
    },
  })
  // ... 渲染表单
}
```

---

## 配合 Context 实现“深层注入”

这是你之前代码中用到的模式，也是 `formOptions` 最强大的地方。

当你在子组件中想要获取表单实例时，`formOptions` 充当了**类型导航员**。

``` TypeScript
// 在深层子组件中
function SubmitButton() {
  // 关键：传入 userFormOptions 
  // 这样 form 实例就会自动获得 name 和 bio 的类型补全
  const form = useTypedAppFormContext(userFormOptions); 

  return (
    <button onClick={() => form.handleSubmit()}>
      提交 {form.getFieldValue('name')} 的资料
    </button>
  )
}
```

---

