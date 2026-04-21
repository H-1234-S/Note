## 1. 简介与核心概念

### 1.1 什么是 TanStack Form

TanStack Form 是一个**高性能**、**类型安全**的 React 表单管理库，专注于解决三个核心问题：

| 问题 | 解决方案 |
|------|----------|
| 性能优化 | 原子化更新架构，每个字段独立订阅 |
| 类型安全 | 完整的 TypeScript 类型推断 |
| 验证复杂 | 支持同步/异步验证，内置 Zod 等集成 |

### 1.2 关键术语

```typescript
// 核心概念解释
useForm          // 创建表单实例的 Hook
form.Field       // 字段组件，采用 Render Props 模式
form.Subscribe   // 状态订阅组件
form.store       // 表单状态存储
field.state      // 单个字段的状态对象
field.handle*    // 字段操作方法集合
```

### 1.3 工作原理图

```
表单渲染流程:
  useForm() → form.store(状态存储) → form.Field(订阅字段) → UI 渲染

字段更新流程:
  用户输入 → field.handleChange() → 更新 store → 触发订阅字段重渲染

提交流程:
  form.handleSubmit() → 验证所有字段 → onSubmit 回调
```

---

## 2. 快速开始

### 2.1 安装

```bash
npm install @tanstack/react-form
# 或
yarn add @tanstack/react-form
# 或
pnpm add @tanstack/react-form
```

### 2.2 基础配置

```typescript
import { useForm } from '@tanstack/react-form'

// 创建表单实例
const form = useForm({
  // 表单初始值
  defaultValues: {
    email: '',
  },
  // 提交处理函数
  onSubmit: async ({ value }) => {
    console.log('提交数据:', value)
  },
})
```

### 2.3 第一个表单

```typescript
import { useForm } from '@tanstack/react-form'

function LoginForm() {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      console.log(value) // { email: '...', password: '...' }
    },
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
        children={(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <input
            type="password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <button type="submit">登录</button>
    </form>
  )
}
```

---

## 3. useForm 详解

### 3.1 配置选项

```typescript
interface UseFormOptions<TFormData> {
  // 必需
  defaultValues: TFormData,        // 表单初始值
  onSubmit: (values: TFormData) => void | Promise<void>,  // 提交处理

  // 可选
  validatorAdapter?: ValidatorAdapter,  // 验证适配器（如 zodValidator）
  validators?: {                    // 验证配置
    onChange?: Validator | Schema,
    onBlur?: Validator | Schema,
    onSubmit?: Validator | Schema,
  },
}
```

### 3.2 返回值详解

```typescript
const form = useForm({
  defaultValues: { name: '' },
  onSubmit: ({ value }) => {},
})

// 状态相关
form.state.values           // 所有字段值 { name: '' }
form.state.isSubmitting     // 是否正在提交
form.state.canSubmit        // 表单是否有效可提交
form.state.isDirty          // 是否有字段被修改
form.state.isValid          // 表单是否通过验证

// 字段操作
form.getFieldValue(name)    // 获取字段值
form.setFieldValue(name, value)  // 设置字段值
form.setFieldMeta(name, meta)    // 设置字段元数据

// 表单操作
form.handleSubmit()         // 触发提交
form.reset()                // 重置表单
form.validateAllFields()     // 验证所有字段
```

---

## 4. form.Field 详解

### 4.1 核心属性

```typescript
interface FieldProps {
  name: string                    // 字段路径（支持嵌套如 user.email）
  validators?: {                 // 验证器
    onChange?: Validator
    onBlur?: Validator
    onSubmit?: Validator
  }
  asyncValidators?: {            // 异步验证器
    onChangeAsync?: AsyncValidator
    onChangeAsyncDebounceMs?: number
  }
  listenTo?: string[]           // 监听其他字段变化
  transform?: (value: any) => any  // 值转换
  mode?: 'array'                 // 数组模式
  children: (field: FieldApi) => ReactNode  // Render Props
}
```

### 4.2 field.state 详解

```typescript
const field = form.Field({ name: 'email', children: ... })

// 状态
field.state.value              // 当前字段值
field.state.meta.errors        // 错误信息数组
field.state.meta.isTouched      // 字段是否失焦过
field.state.meta.isValidating   // 是否正在异步验证
field.state.meta.isPristine     // 字段是否从未修改

// 信息
field.name                     // 字段完整路径
field.form                     // 表单实例引用
```

### 4.3 field.handle 方法

```typescript
// 更新值并触发验证
field.handleChange(value: any): void

// 标记字段为已触碰
field.handleBlur(): void

// 手动触发验证
field.validate(): Promise<boolean>

// 数组模式特有
field.pushValue(value: any): void
field.removeValue(index: number): void
field.insertValue(index: number, value: any): void
field.moveValue(from: number, to: number): void
```

### 4.4 基础用法

```typescript
<form.Field
  name="username"
  validators={{
    onChange: ({ value }) => (!value ? '用户名不能为空' : undefined),
  }}
  children={(field) => (
    <div>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
/>
```

---

## 5. 表单验证

### 5.1 验证时机

| 时机 | 触发条件 | 适用场景 |
|------|----------|----------|
| `onChange` | 字段值变化时 | 实时校验（如密码强度） |
| `onBlur` | 字段失焦时 | 减少打扰，只在离开时提示 |
| `onSubmit` | 表单提交时 | 最终校验，或跨字段验证 |

### 5.2 onChange - 实时验证

```typescript
<form.Field
  name="age"
  validators={{
    onChange: ({ value }) => {
      if (value < 18) return '必须年满 18 岁'
      return undefined
    },
  }}
  children={(field) => (
    <div>
      <input
        type="number"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
/>
```

### 5.3 onBlur - 失焦验证

```typescript
validators={{
  onBlur: ({ value }) => (!value ? '此字段必填' : undefined),
}}
```

### 5.4 onSubmit - 提交时验证

```typescript
validators={{
  onSubmit: ({ value }) => {
    if (value.password !== value.confirmPassword) {
      return { confirmPassword: '两次密码不一致' }
    }
    return undefined
  },
}}
```

### 5.5 外部 Schema 验证（Zod）

```typescript
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

// 定义验证 Schema
const userSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(8, '密码至少 8 位'),
})

// 使用
const form = useForm({
  defaultValues: { email: '', password: '' },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: userSchema,  // 实时校验
  },
  onSubmit: ({ value }) => console.log(value),
})

// 错误展示
{field.state.meta.errors?.[0]?.message}
```

### 5.6 异步验证与防抖

```typescript
<form.Field
  name="username"
  asyncValidators={{
    onChangeAsyncDebounceMs: 500,  // 防抖 500ms
    onChangeAsync: async ({ value }) => {
      const res = await checkUserExists(value)
      return res.exists ? '用户名已被占用' : undefined
    },
  }}
  children={(field) => (
    <div>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isValidating && <span>检查中...</span>}
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
/>
```

### 5.7 字段依赖验证

当一个字段的验证依赖于另一个字段时，使用 `listenTo`：

```typescript
<form.Field
  name="confirmPassword"
  listenTo={['password']}  // 监听 password 字段变化
  validators={{
    onChange: ({ value, fieldApi }) => {
      if (value !== fieldApi.form.getFieldValue('password')) {
        return '两次输入的密码不一致'
      }
      return undefined
    },
  }}
  children={(field) => (
    <input
      type="password"
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

---

## 6. 数组处理

### 6.1 基础数组字段

```typescript
const form = useForm({
  defaultValues: {
    friends: ['张三'],
  },
})

<form.Field
  name="friends"
  mode="array"
  children={(field) => (
    <div>
      {field.state.value.map((_, i) => (
        <div key={i}>
          <form.Field name={`friends[${i}]`}>
            {(subField) => (
              <input
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <button type="button" onClick={() => field.removeValue(i)}>
            删除
          </button>
        </div>
      ))}
      <button type="button" onClick={() => field.pushValue('')}>
        添加好友
      </button>
    </div>
  )}
/>
```

### 6.2 数组操作方法

| 方法 | 描述 |
|------|------|
| `field.pushValue(value)` | 追加新元素 |
| `field.removeValue(index)` | 删除指定索引元素 |
| `field.insertValue(index, value)` | 在指定位置插入 |
| `field.moveValue(from, to)` | 移动元素位置 |

### 6.3 嵌套数组

```typescript
const form = useForm({
  defaultValues: {
    users: [{ name: '', emails: ['test@example.com'] }],
  },
})

<form.Field
  name="users"
  mode="array"
  children={(field) => (
    <div>
      {field.state.value.map((user, userIndex) => (
        <div key={userIndex}>
          <form.Field name={`users[${userIndex}].name`}>
            {(subField) => (
              <input
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          {/* 二维数组：emails */}
          <form.Field name={`users[${userIndex}].emails`} mode="array">
            {(emailsField) => (
              <div>
                {emailsField.state.value.map((_, emailIndex) => (
                  <form.Field
                    key={emailIndex}
                    name={`users[${userIndex}].emails[${emailIndex}]`}
                  >
                    {(emailField) => (
                      <input
                        value={emailField.state.value}
                        onChange={(e) => emailField.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                ))}
                <button
                  type="button"
                  onClick={() => emailsField.pushValue('')}
                >
                  添加邮箱
                </button>
              </div>
            )}
          </form.Field>
        </div>
      ))}
      <button
        type="button"
        onClick={() => field.pushValue({ name: '', emails: [''] })}
      >
        添加用户
      </button>
    </div>
  )}
/>
```

---

## 7. Context 模式

当表单和字段不在同一组件时，使用 Context 模式避免层层传递 props。

### 7.1 创建 Context

```typescript
import { createFormHookContexts, createFormHook } from '@tanstack/react-form'

// 1. 创建 Context 容器
export const { formContext, fieldContext, useFormContext, useFieldContext } =
  createFormHookContexts()

// 2. 生成自定义 Hook
export const { useAppForm, useTypedAppFormContext, AppForm } = createFormHook({
  formContext,
  fieldContext,
})
```

### 7.2 父组件使用

```typescript
function ParentForm() {
  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => console.log(value),
  })

  return (
    <form.AppForm>
      <h1>登录</h1>
      <DeepNestedInput />
    </form.AppForm>
  )
}
```

### 7.3 子组件使用

```typescript
function DeepNestedInput() {
  // 从 Context 获取表单实例，类型精准
  const form = useTypedAppFormContext()

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
  )
}
```

### 7.4 formOptions 复用配置

```typescript
import { formOptions } from '@tanstack/react-form'

// 1. 定义表单配置（可复用）
export const loginFormOptions = formOptions({
  defaultValues: {
    email: '',
    password: '',
  },
})

// 2. 父组件使用
function LoginPage() {
  const form = useAppForm(loginFormOptions)
  return <form.AppForm>{/* ... */}</form.AppForm>
}

// 3. 子组件获取（传入相同配置以获得类型提示）
function SubmitButton() {
  const form = useTypedAppFormContext(loginFormOptions)
  return <button onClick={() => form.handleSubmit()}>提交</button>
}
```

---

## 8. 状态订阅

### 8.1 useStore 基础

```typescript
import { useStore } from '@tanstack/react-form'

// 语法：useStore(store, selector)
const isSubmitting = useStore(form.store, (s) => s.isSubmitting)
```

### 8.2 精准订阅（推荐）

只订阅需要的状态，避免不必要的重渲染：

```typescript
function SubmitButton() {
  const form = useTypedAppFormContext()
  const canSubmit = useStore(form.store, (s) => s.canSubmit)
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)

  return (
    <button type="submit" disabled={!canSubmit}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )
}
```

### 8.3 计算属性订阅

```typescript
function CharacterCount() {
  const form = useTypedAppFormContext()
  const textLength = useStore(form.store, (s) => s.values.text?.length ?? 0)

  return <span>{textLength} / 1000</span>
}
```

### 8.4 多重状态订阅

```typescript
const { canSubmit, isDirty, isSubmitting } = useStore(
  form.store,
  (s) => ({
    canSubmit: s.canSubmit,
    isDirty: s.isDirty,
    isSubmitting: s.isSubmitting,
  })
)
```

### 8.5 form.Subscribe 组件

将订阅逻辑内联在 JSX 中：

```typescript
<form.Subscribe
  selector={(s) => [s.canSubmit, s.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )}
/>
```

---

## 9. 进阶特性

### 9.1 值转换 (Transform)

在 UI 值和存储值之间进行转换：

```typescript
<form.Field
  name="amount"
  transform={(value) => Number(value)}  // 输入字符串转数字
  children={(field) => (
    <input
      type="number"
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

### 9.2 自定义字段封装

```typescript
interface InputFieldProps {
  name: string
  label: string
  type?: string
}

function InputField({ name, label, type = 'text' }: InputFieldProps) {
  return (
    <form.Field
      name={name}
      children={(field) => (
        <div>
          <label htmlFor={field.name}>{label}</label>
          <input
            id={field.name}
            type={type}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
          {field.state.meta.errors?.[0] && (
            <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
          )}
        </div>
      )}
    />
  )
}

// 使用
<InputField name="email" label="邮箱" />
<InputField name="password" label="密码" type="password" />
```

### 9.3 类型推断

```typescript
import { useForm } from '@tanstack/react-form'

// 定义数据类型
interface UserForm {
  userName: string
  age: number
  email: string
}

const form = useForm<UserForm>({
  defaultValues: {
    userName: '',
    age: 0,
    email: '',
  },
})

// field.name 会有类型提示和校验
<form.Field
  name="userName"  // 自动推断为 string 类型
  children={(field) => (
    <input
      value={field.state.value}  // 类型安全
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

### 9.4 手动设置错误

```typescript
// 在提交处理中手动设置错误
onSubmit: async ({ value, form }) => {
  try {
    await api.submit(value)
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      form.setFieldError('email', '该邮箱已被注册')
    }
  }
}
```

---

## 10. 完整案例

一个包含所有核心特性的用户注册表单：

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

// --- 1. 定义验证 Schema ---
const userSchema = z
  .object({
    username: z.string().min(3, '用户名至少 3 位'),
    password: z.string().min(6, '密码至少 6 位'),
    confirmPassword: z.string(),
    hobbies: z.array(z.string().min(1, '爱好不能为空')).min(1, '至少添加一个爱好'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  })

type UserForm = z.infer<typeof userSchema>

// --- 2. 模拟异步验证 ---
const checkUserExists = (name: string) =>
  new Promise((resolve) => setTimeout(() => resolve(name === 'admin'), 800))

// --- 3. 表单组件 ---
export default function RegistrationForm() {
  const form = useForm<UserForm>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      hobbies: ['编程'],
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      await new Promise((r) => setTimeout(r, 1000))
      console.log('提交成功:', value)
    },
  })

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>用户注册</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        {/* 用户名：异步验证 + 防抖 */}
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
            <div style={{ marginBottom: '16px' }}>
              <label>用户名:</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ width: '100%' }}
              />
              {field.state.meta.isValidating && <small> 检查中...</small>}
              {field.state.meta.errors?.[0] && (
                <p style={{ color: 'red', margin: '4px 0' }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        />

        {/* 密码 */}
        <form.Field
          name="password"
          children={(field) => (
            <div style={{ marginBottom: '16px' }}>
              <label>密码:</label>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}
        />

        {/* 确认密码：字段依赖验证 */}
        <form.Field
          name="confirmPassword"
          listenTo={['password']}
          children={(field) => (
            <div style={{ marginBottom: '16px' }}>
              <label>确认密码:</label>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ width: '100%' }}
              />
              {field.state.meta.errors?.[0] && (
                <p style={{ color: 'red', margin: '4px 0' }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        />

        {/* 爱好列表：数组操作 */}
        <form.Field
          name="hobbies"
          mode="array"
          children={(field) => (
            <div style={{ marginBottom: '16px' }}>
              <label>兴趣爱好:</label>
              {field.state.value.map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <form.Field name={`hobbies[${i}]`}>
                    {(subField) => (
                      <input
                        value={subField.state.value}
                        onChange={(e) => subField.handleChange(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    )}
                  </form.Field>
                  <button type="button" onClick={() => field.removeValue(i)}>
                    删除
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => field.pushValue('')}>
                添加爱好
              </button>
              {field.state.meta.errors?.[0] && (
                <p style={{ color: 'red', margin: '4px 0' }}>
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        />

        {/* 提交按钮：状态订阅 */}
        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              style={{ marginTop: '16px', padding: '8px 16px' }}
            >
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

## 附录：常见问题

### Q: 字段依赖验证的 listenTo 是什么原理？

`listenTo` 用于建立字段间的响应式依赖图。当被监听的字段值变化时，当前字段会自动重新验证。

```typescript
// 确认密码依赖密码字段
<form.Field
  name="confirmPassword"
  listenTo={['password']}  // 监听 password 变化
  validators={{
    onChange: ({ value, fieldApi }) =>
      value !== fieldApi.form.getFieldValue('password')
        ? '密码不一致'
        : undefined,
  }}
/>
```

### Q: 为什么使用 Render Props 模式？

Render Props 模式使得每个字段成为独立的订阅单元，只有该字段的状态变化时才会重渲染，避免了父组件重渲染导致的性能问题。

### Q: 如何选择验证时机？

- **onChange**: 需要实时反馈的场景（如密码强度检测）
- **onBlur**: 减少频繁打扰，只在用户离开时提示
- **onSubmit**: 复杂校验或需要读取多个字段值的场景

### Q: Context 模式和直接传递 form 实例如何选择？

| 方式 | 适用场景 |
|------|----------|
| 直接传递 | 表单和字段在同一组件 |
| Context 模式 | 表单和字段在不同组件，需要深层传递 |

---

> 文档版本: TanStack Form v1
>
> 最后更新: 2026-04-21
