
TanStack Form 是一个**高性能**、**类型安全**的 React 表单管理库，采用原子化更新架构。

# 1. 快速开始

## 1.1 安装

```bash
npm install @tanstack/react-form
```

## 1.2 最小示例

```typescript
import { useForm } from '@tanstack/react-form'

function App() {
  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value) // { email: '...' }
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
      <button type="submit">提交</button>
    </form>
  )
}
```

---

# 2. 核心概念

## 2.1 原子化更新架构

TanStack Form 的核心理念：**每个字段独立订阅**。

- 修改 `username` 字段时，只有 `username` 的输入框重渲染

- `password` 和 `email` 输入框**不会**重新渲染

- 这在包含几十个字段的复杂表单中性能优势巨大

## 2.2 Render Props 模式

`form.Field` 使用 Render Props 模式，将字段状态和控制方法通过 children 函数传递。

## 2.3 两大数据存储

| 存储位置 | 说明 |
|---------|------|
| `form.state` | 表单级别的整体状态 |
| `field.state` | 单个字段的状态 |

---

# 3. 基础用法

## 3.1 创建表单实例 (`useForm`)

```typescript
import { useForm } from '@tanstack/react-form'

const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
    age: 0,
  },
  onSubmit: async ({ value }) => {
    // value 是完全类型安全的
    console.log('表单值:', value)
  },
})
```

### form 实例常用属性

#### 状态获取类

| 属性 | 类型 | 描述 |
|------|------|------|
| `form.state.values` | `object` | 所有字段的当前值 |
| `form.state.isSubmitting` | `boolean` | 是否正在提交 |
| `form.state.canSubmit` | `boolean` | 表单是否有效可提交 |
| `form.state.isDirty` | `boolean` | 是否有字段被修改过 |
| `form.state.isValid` | `boolean` | 表单是否通过验证 |

#### 字段操作类

| 方法 | 描述 |
|------|------|
| `form.getFieldValue(name)` | 获取指定字段值（支持嵌套路径） |
| `form.setFieldValue(name, value)` | 设置指定字段值 |
| `form.setFieldMeta(name, meta)` | 设置字段元数据 |

#### 表单生命周期类

| 方法 | 描述 |
|------|------|
| `form.handleSubmit()` | 触发提交（含验证） |
| `form.reset()` | 重置为 defaultValues |
| `form.validateAllFields()` | 触发全表单验证 |

## 3.2 字段绑定 (`form.Field`)

### 基础用法

```typescript
<form.Field
  name="firstName"
  children={(field) => (
    <div>
      <label htmlFor={field.name}>名:</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && field.state.meta.errors && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
/>
```

### field.state 常用属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `field.state.value` | `any` | 当前字段值 |
| `field.state.meta.errors` | `string[]` | 验证错误信息数组 |
| `field.state.meta.isTouched` | `boolean` | 字段是否失焦过 |
| `field.state.meta.isValidating` | `boolean` | 是否正在异步验证 |
| `field.state.meta.isPristine` | `boolean` | 字段是否从未修改过 |

### field.handle 方法

| 方法 | 描述 |
|------|------|
| `field.handleChange(value)` | 更新值并触发验证 |
| `field.handleBlur()` | 标记字段为 touched |
| `field.validate()` | 手动触发验证 |

---

# 4. 表单验证

## 4.1 内置验证器

### onChange - 实时验证

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

### onBlur - 失焦验证

```typescript
validators={{
  onBlur: ({ value }) => (!value ? '此字段必填' : undefined),
}}
```

### onSubmit - 提交时验证

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

## 4.2 外部 Schema 验证（Zod）

```typescript
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-form-adapter'

const userSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(8, '密码至少 8 位'),
})

const form = useForm({
  defaultValues: { email: '', password: '' },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: userSchema,
  },
  onSubmit: ({ value }) => console.log(value),
})

// 错误信息展示
{
  field.state.meta.errors?.[0]?.message
}
```

## 4.3 异步验证（防抖）

```typescript
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

## 4.4 字段依赖验证

当一个字段的验证依赖于另一个字段时，使用 `listenTo`：

```typescript
<form.Field
  name="confirmPassword"
  listenTo={['password']} // 监听 password 字段变化
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

# 5. 数组处理

## 5.1 基础数组字段

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

## 5.2 数组操作方法

| 方法 | 描述 |
|------|------|
| `field.pushValue(value)` | 追加新元素 |
| `field.removeValue(index)` | 删除指定索引元素 |
| `field.insertValue(index, value)` | 在指定位置插入 |
| `field.moveValue(from, to)` | 移动元素位置 |

## 5.3 嵌套数组

```typescript
const form = useForm({
  defaultValues: {
    users: [{ name: '', emails: ['test@example.com'] }],
  },
})

// 渲染嵌套数组
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
      <button type="button" onClick={() => field.pushValue({ name: '', emails: [''] })}>
        添加用户
      </button>
    </div>
  )}
/>
```

---

# 6. 进阶特性

## 6.1 值转换 (Transform)

在 UI 值和存储值之间进行转换：

```typescript
<form.Field
  name="amount"
  transform={(value) => Number(value)} // 输入字符串转数字
  children={(field) => (
    <input
      type="number"
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

## 6.2 自定义字段封装

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

## 6.3 类型推断

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
  name="userName" // 自动推断为 string 类型
  children={(field) => (
    <input
      value={field.state.value} // 类型安全
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

## 6.4 手动设置错误

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

# 7. Context 模式

当表单和字段不在同一组件时，使用 Context 模式避免层层传递 props。

## 7.1 创建 Context

```typescript
import { createFormHookContexts, createFormHook } from '@tanstack/react-form'

// 1. 创建 Context 容器
export const {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
} = createFormHookContexts();

// 2. 生成自定义 Hook
export const {
  useAppForm,
  useTypedAppFormContext,
} = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});
```

## 7.2 父组件使用

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

## 7.3 子组件使用

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

## 7.4 formOptions 复用配置

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

# 8. 状态订阅

## 8.1 useStore 基础

```typescript
import { useStore } from '@tanstack/react-form'

// 语法：useStore(store, selector)
const isSubmitting = useStore(form.store, (s) => s.isSubmitting)
```

## 8.2 精准订阅（推荐）

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

## 8.3 计算属性订阅

```typescript
function CharacterCount() {
  const form = useTypedAppFormContext()
  const textLength = useStore(form.store, (s) => s.values.text?.length ?? 0)

  return <span>{textLength} / 1000</span>
}
```

## 8.4 多重状态订阅

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

## 8.5 form.Subscribe 组件

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

# 9. 完整案例

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
