# TanStack Form v1 完全指南

> **版本信息**：本文档基于 TanStack Form v0.40+ 编写，支持 React、Vue、Angular、Solid、Lit、Svelte 等框架。
>
> **官方仓库**：https://github.com/TanStack/form

---

# 目录

1. [入门基础](#1-入门基础)
   - [1.1 简介与核心优势](#11-简介与核心优势)
   - [1.2 安装](#12-安装)
   - [1.3 第一个表单](#13-第一个表单)
2. [核心概念](#2-核心概念)
   - [2.1 useForm Hook](#21-useform-hook)
   - [2.2 form.Field 字段组件](#22-formfield-字段组件)
   - [2.3 form.Subscribe 状态订阅](#23-formsubscribe-状态订阅)
3. [表单验证](#3-表单验证)
   - [3.1 内置验证器](#31-内置验证器)
   - [3.2 外部 Schema 验证（Zod/Valibot/Yup）](#32-外部-schema-验证zodvalibotyup)
   - [3.3 异步验证与防抖](#33-异步验证与防抖)
   - [3.4 字段依赖验证](#34-字段依赖验证)
4. [数组字段处理](#4-数组字段处理)
   - [4.1 基础数组操作](#41-基础数组操作)
   - [4.2 嵌套数组](#42-嵌套数组)
5. [进阶用法](#5-进阶用法)
   - [5.1 字段转换（Transform）](#51-字段转换transform)
   - [5.2 错误信息处理](#52-错误信息处理)
   - [5.3 表单级别控制](#53-表单级别控制)
6. [Context 与组件解耦](#6-context-与组件解耦)
   - [6.1 createFormHookContexts](#61-createformhookcontexts)
   - [6.2 createFormHook](#62-createformhook)
   - [6.3 formOptions 配置复用](#63-formoptions-配置复用)
7. [状态管理](#7-状态管理)
   - [7.1 useStore 详解](#71-usestore-详解)
   - [7.2 Subscribe vs useStore](#72-subscribe-vs-usestore)
8. [调试与最佳实践](#8-调试与最佳实践)
   - [8.1 调试技巧](#81-调试技巧)
   - [8.2 性能优化](#82-性能优化)
   - [8.3 常见陷阱](#83-常见陷阱)

---

# 1. 入门基础

## 1.1 简介与核心优势

TanStack Form 是一个**Headless**（无头）、**类型安全**的表单状态管理库。它的核心特点：

| 特性 | 说明 |
|------|------|
| **类型安全** | 自动推断表单数据类型，无需手动声明泛型 |
| **框架无关** | 支持 React、Vue、Angular、Solid、Lit、Svelte |
| **性能优异** | 原子化更新，只重渲染变更的字段 |
| **验证灵活** | 支持同步/异步验证，集成 Zod/Valibot/Yup |
| **无渲染依赖** | 不依赖任何 UI 组件，可搭配任意 UI 库 |

### 对比其他表单库

| 特性 | TanStack Form | React Hook Form | Formik |
|------|---------------|-----------------|--------|
| 类型安全 | ⭐⭐⭐ 原生 TS 优先 | ⭐⭐ 需要手动配置 | ⭐ |
| 性能 | ⭐⭐⭐ 原子化更新 | ⭐⭐⭐ | ⭐ |
| 学习曲线 | 中等 | 低 | 较高 |
| 包体积 | 小 | 很小 | 中等 |

---

## 1.2 安装

### React（最常用）

```bash
npm install @tanstack/react-form
```

### 可选的验证适配器

```bash
# Zod（推荐）
npm install @tanstack/zod-form-adapter zod

# Valibot
npm install @tanstack/valibot-form-adapter valibot

# Yup
npm install @tanstack/yup-form-adapter yup
```

### 其他框架

```bash
# Vue
npm install @tanstack/vue-form

# Solid
npm install @tanstack/solid-form

# Angular
npm install @tanstack/angular-form

# Lit
npm install @tanstack/lit-form

# Svelte
npm install @tanstack/svelte-form
```

---

## 1.3 第一个表单

```tsx
import { useForm } from '@tanstack/react-form'

function BasicForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      console.log('提交的值:', value)
      // value 的类型自动推断为 { email: string, password: string }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <div>
            <label>邮箱</label>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div>
            <label>密码</label>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      <button type="submit">提交</button>
    </form>
  )
}
```

---

# 2. 核心概念

## 2.1 useForm Hook

`useForm` 是 TanStack Form 的核心，它返回一个**表单实例**，包含所有表单操作的方法和状态。

### 核心配置项

```tsx
const form = useForm({
  // ✅ 必需：初始值（会自动推断类型）
  defaultValues: {
    firstName: '',
    lastName: '',
    age: 0,
  },

  // ✅ 必需：提交处理器
  onSubmit: async ({ value, formApi }) => {
    // value: 表单数据
    // formApi: 表单 API，可用于手动控制
    console.log(value)
  },

  // ❗ 可选：验证器适配器（使用 Zod/Valibot/Yup 时需要）
  validatorAdapter: zodValidator(),

  // ❗ 可选：表单级验证器
  validators: {
    onSubmit: ({ value }) => /* 返回错误对象或 undefined */,
    onChange: ({ value }) => /* ... */,
    onBlur: ({ value }) => /* ... */,
  },
})
```

### 表单实例属性

#### 状态获取类

| 属性 | 类型 | 描述 |
|------|------|------|
| `form.state.values` | `TFormData` | 当前所有字段值（只读对象） |
| `form.state.isSubmitting` | `boolean` | 是否正在提交 |
| `form.state.canSubmit` | `boolean` | 表单是否有效可提交 |
| `form.state.isDirty` | `boolean` | 表单是否被修改过 |
| `form.state.isTouched` | `boolean` | 是否有字段被触碰过 |
| `form.state.isValid` | `boolean` | 所有字段是否通过验证 |
| `form.state.errors` | `Record<string, any>` | 表单级错误 |

#### 字段操作类

| 方法 | 描述 |
|------|------|
| `form.getFieldValue(name)` | 获取指定路径的值，支持嵌套如 `user.address.city` |
| `form.setFieldValue(name, value)` | 设置字段值 |
| `form.setFieldMeta(name, meta)` | 设置字段元数据（如手动设置错误） |
| `form.validateAllFields()` | 触发表单所有字段验证 |

#### 表单生命周期类

| 方法 | 描述 |
|------|------|
| `form.handleSubmit()` | 触发提交（包含验证） |
| `form.reset()` | 重置为 `defaultValues` |
| `form.validateAllFields()` | 立即校验所有字段 |

---

## 2.2 form.Field 字段组件

TanStack Form 使用 **Render Props** 模式，每个字段是独立的组件，实现原子化更新。

### 基本结构

```tsx
<form.Field
  name="fieldName"  // ✅ 必需：字段路径，支持嵌套如 "user.email"
  children={(field) => (  // ✅ 必需：render prop
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  )}
/>
```

### field 对象详解

#### A. 核心状态 (field.state)

```tsx
field.state.value          // 当前字段值
field.state.meta.errors    // 错误信息数组，如 ['邮箱格式不正确']
field.state.meta.isTouched // 布尔值，用户是否触碰过此字段
field.state.meta.isValidating // 布尔值，是否正在异步验证
field.state.meta.isPristine   // 布尔值，是否从未修改过
```

#### B. 动作方法 (field.handle*)

```tsx
field.handleChange(value)      // 更新值并触发 onChange 验证
field.handleBlur()             // 标记字段为 touched
field.validate()              // 手动触发字段验证
field.getRoot()               // 获取根 field（用于数组字段）
```

#### C. 基础信息

```tsx
field.name   // 字段路径字符串，如 "users[0].firstName"
field.form   // 指向整个表单实例的引用
```

### 高级 Field 配置

```tsx
<form.Field
  name="username"
  mode="array"  // 数组模式（用于字段数组操作）

  // 监听其他字段变化触发重新验证
  listenTo={['password']}

  // 字段级验证器
  validators={{
    onChange: ({ value }) =>
      value.length < 3 ? '用户名至少3位' : undefined,
    onBlur: ({ value }) =>
      !value ? '用户名不能为空' : undefined,
  }}

  // 异步验证器
  asyncValidators={{
    onChangeAsyncDebounceMs: 500,  // 防抖时间
    onChangeAsync: async ({ value }) => {
      const exists = await checkUsername(value)
      return exists ? '用户名已被占用' : undefined
    },
  }}

  // 值转换（存入 state 前）
  transform={(value) => value.trim()}

  children={(field) => <input {...} />}
/>
```

---

## 2.3 form.Subscribe 状态订阅

用于订阅表单状态的组件，避免父组件因局部变化而重新渲染。

### 基本用法

```tsx
// 订阅单个状态
<form.Subscribe
  selector={(state) => state.isSubmitting}
  children={(isSubmitting) => (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )}
/>

// 订阅多个状态（返回数组）
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )}
/>
```

---

# 3. 表单验证

## 3.1 内置验证器

### onChange - 实时验证

```tsx
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
        onChange={(e) => field.handleChange(Number(e.target.value))}
      />
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </>
  )}
/>
```

### onBlur - 失焦验证

```tsx
<form.Field
  name="email"
  validators={{
    onBlur: ({ value }) =>
      !value.includes('@') ? '请输入有效的邮箱' : undefined,
  }}
  children={(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}  // 触发 onBlur 验证
    />
  )}
/>
```

### onSubmit - 提交时验证

```tsx
const form = useForm({
  defaultValues: { name: '' },
  validators: {
    onSubmit: ({ value }) => {
      if (value.name.length < 2) {
        return { name: '姓名至少2个字符' }
      }
      return undefined
    },
  },
  onSubmit: ({ value }) => console.log(value),
})
```

---

## 3.2 外部 Schema 验证（Zod/Valibot/Yup）

### Zod 集成（推荐）

```tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

// 1. 定义 Schema
const userSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(8, '密码至少8位'),
  age: z.number().min(18, '必须年满18岁'),
})

// 2. 在 useForm 中使用
const form = useForm({
  defaultValues: {
    email: '',
    password: '',
    age: 0,
  },
  validatorAdapter: zodValidator(),  // ✅ 启用 Zod 适配器
  validators: {
    onChange: userSchema,  // 实时验证
  },
  onSubmit: ({ value }) => console.log(value),
})

// 3. 在 Field 中显示错误
<form.Field
  name="email"
  children={(field) => (
    <>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>
          {field.state.meta.errors[0].message}
        </span>
      )}
    </>
  )}
/>
```

### Valibot 集成

```tsx
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import * as v from 'valibot'

const userSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})

const form = useForm({
  defaultValues: { email: '', password: '' },
  validatorAdapter: valibotValidator(userSchema),
  onSubmit: ({ value }) => console.log(value),
})
```

### Yup 集成

```tsx
import { yupValidator } from '@tanstack/yup-form-adapter'
import * as yup from 'yup'

const userSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
})

const form = useForm({
  defaultValues: { email: '', password: '' },
  validatorAdapter: yupValidator(userSchema),
  onSubmit: ({ value }) => console.log(value),
})
```

---

## 3.3 异步验证与防抖

### 用户名查重示例

```tsx
const checkUsernameExists = async (username: string) => {
  // 模拟 API 调用
  const response = await fetch(`/api/check-username?username=${username}`)
  const data = await response.json()
  return data.exists
}

<form.Field
  name="username"
  asyncValidators={{
    onChangeAsyncDebounceMs: 500,  // 500ms 防抖
    onChangeAsync: async ({ value }) => {
      if (value.length < 3) return undefined
      const exists = await checkUsernameExists(value)
      return exists ? '用户名已被占用' : undefined
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

---

## 3.4 字段依赖验证

当一个字段的验证依赖于另一个字段时，使用 `listenTo`。

### 确认密码示例

```tsx
<form.Field
  name="confirmPassword"
  listenTo={['password']}  // 监听 password 字段变化
  validators={{
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue('password')
      return value !== password ? '两次输入的密码不一致' : undefined
    },
  }}
  children={(field) => (
    <>
      <input
        type="password"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red' }}>{field.state.meta.errors[0]}</span>
      )}
    </>
  )}
/>
```

### 条件必填示例

```tsx
<form.Field
  name="phone"
  listenTo={['country']}  // 监听国家选择
  validators={{
    onChange: ({ value, fieldApi }) => {
      const country = fieldApi.form.getFieldValue('country')
      if (country === 'CN' && !value) {
        return '中国用户必须填写手机号'
      }
      return undefined
    },
  }}
  children={(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
/>
```

---

# 4. 数组字段处理

## 4.1 基础数组操作

### 初始化数组字段

```tsx
const form = useForm({
  defaultValues: {
    friends: ['张三'],  // 初始一个元素
  },
})
```

### 渲染数组字段

```tsx
<form.Field
  name="friends"
  children={(field) => (
    <div>
      {field.state.value.map((_, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px' }}>
          <form.Field name={`friends[${index}]`}>
            {(subField) => (
              <input
                value={subField.state.value}
                onChange={(e) => subField.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <button type="button" onClick={() => field.removeValue(index)}>
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

### 数组字段可用方法

| 方法 | 描述 |
|------|------|
| `field.pushValue(value)` | 在数组末尾添加元素 |
| `field.removeValue(index)` | 移除指定索引的元素 |
| `field.insertValue(index, value)` | 在指定位置插入元素 |
| `field.replaceValue(index, value)` | 替换指定位置的元素 |
| `field.moveValue(fromIndex, toIndex)` | 移动元素位置 |
| `field.swapValue(indexA, indexB)` | 交换两个元素 |

---

## 4.2 嵌套数组

### 复杂结构示例

```tsx
const form = useForm({
  defaultValues: {
    users: [
      {
        name: '',
        emails: [''],  // 嵌套数组
      },
    ],
  },
})

// 渲染
<form.Field
  name="users"
  children={(field) => (
    <div>
      {field.state.value.map((user, userIndex) => (
        <div key={userIndex} style={{ marginBottom: '16px' }}>
          <form.Field name={`users[${userIndex}].name`}>
            {(nameField) => (
              <input
                placeholder="姓名"
                value={nameField.state.value}
                onChange={(e) => nameField.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div style={{ marginLeft: '20px' }}>
            {user.emails.map((_, emailIndex) => (
              <div key={emailIndex}>
                <form.Field name={`users[${userIndex}].emails[${emailIndex}]`}>
                  {(emailField) => (
                    <input
                      placeholder="邮箱"
                      value={emailField.state.value}
                      onChange={(e) => emailField.handleChange(e.target.value)}
                    />
                  )}
                </form.Field>
                <button
                  type="button"
                  onClick={() =>
                    field.removeValue(userIndex)  // 移除整个用户
                  }
                >
                  删除用户
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                // 插入新邮箱
                const users = [...field.state.value]
                users[userIndex].emails.push('')
                field.setValue(users)
              }}
            >
              添加邮箱
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          field.pushValue({ name: '', emails: [''] })
        }
      >
        添加用户
      </button>
    </div>
  )}
/>
```

---

# 5. 进阶用法

## 5.1 字段转换（Transform）

`transform` 用于在值存入 state 前进行转换。

### 场景 1：自动去除首尾空格

```tsx
<form.Field
  name="username"
  transform={(value) => value.trim()}  // 自动 trim
  children={(field) => (
    <input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

### 场景 2：类型转换

```tsx
<form.Field
  name="age"
  transform={(value) => (value === '' ? 0 : Number(value))}
  children={(field) => (
    <input
      type="number"
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

### 场景 3：日期转换

```tsx
<form.Field
  name="birthDate"
  transform={(value) => (value ? new Date(value) : null)}
  children={(field) => (
    <input
      type="date"
      value={field.state.value?.toISOString().split('T')[0] ?? ''}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
/>
```

---

## 5.2 错误信息处理

### 统一的错误展示组件

```tsx
function FieldError({ field }: { field: any }) {
  return field.state.meta.errors?.length ? (
    <span style={{ color: 'red', fontSize: '12px' }}>
      {field.state.meta.errors.map((error: any, index: number) => (
        <span key={index}>
          {typeof error === 'string' ? error : error?.message || '输入无效'}
          {index < field.state.meta.errors.length - 1 ? ', ' : ''}
        </span>
      ))}
    </span>
  ) : null
}

// 使用
<form.Field
  name="email"
  children={(field) => (
    <>
      <input {...} />
      <FieldError field={field} />
    </>
  )}
/>
```

### 手动设置字段错误

```tsx
// 在 onSubmit 中根据 API 响应设置错误
const form = useForm({
  defaultValues: { email: '' },
  onSubmit: async ({ value, formApi }) => {
    try {
      await submitToAPI(value)
    } catch (error) {
      // 手动设置字段错误
      formApi.setFieldError('email', '该邮箱已被注册')
    }
  },
})
```

---

## 5.3 表单级别控制

### 手动触发完整验证

```tsx
const handleClick = async () => {
  const result = await form.validateAllFields()

  if (result.some((r) => r.hasError)) {
    console.log('有字段验证失败')
    return
  }

  // 所有验证通过，可以提交
  form.handleSubmit()
}
```

### 有条件地重置表单

```tsx
// 带默认值重置
form.reset({
  values: {
    email: 'new@email.com',
    password: '',
  },
})

// 完全重置到初始状态
form.reset()
```

### 获取未修改的原始值

```tsx
// 判断字段是否被修改
const isEmailChanged = form.state.values.email !== form.state.defaults.email

// 获取原始值
const originalEmail = form.state.defaults.email
```

---

# 6. Context 与组件解耦

## 6.1 createFormHookContexts

创建一组 Context 容器，用于深层组件间的表单实例共享。

```tsx
import { createFormHookContexts } from '@tanstack/react-form'

// 创建 Context 集合
export const {
  formContext,        // 存储整个表单实例
  fieldContext,        // 存储单个字段实例
  useFormContext,      // 获取表单实例的 Hook
  useFieldContext,     // 获取字段实例的 Hook
} = createFormHookContexts()
```

---

## 6.2 createFormHook

基于 Context 创建定制化的 Hooks 和组件。

```tsx
import { createFormHook } from '@tanstack/react-form'

// 创建自定义 Hook
export const {
  useAppForm,           // 替代 useForm，自动关联 Context
  useTypedAppFormContext, // 强类型的 Context Hook
  useField,              // 独立字段 Hook
  AppForm,               // 提供 Provider 的包装组件
} = createFormHook({
  formContext,
  fieldContext,
})
```

### 完整使用示例

**父组件：**

```tsx
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

const {
  formContext,
  fieldContext,
  useFormContext,
  useFieldContext,
} = createFormHookContexts()

export const {
  useAppForm,
  useTypedAppFormContext,
  useField,
  AppForm,
} = createFormHook({
  formContext,
  fieldContext,
})

// 定义表单配置
export const loginFormOptions = formOptions({
  defaultValues: {
    email: '',
    password: '',
  },
  validators: {
    onChange: ({ value }) => {
      if (!value.email.includes('@')) return '邮箱格式不正确'
      return undefined
    },
  },
})

// 父组件
function LoginPage() {
  const form = useAppForm({
    ...loginFormOptions,
    onSubmit: async ({ value }) => {
      await login(value)
    },
  })

  return (
    <AppForm>
      <h1>登录</h1>
      <EmailInput />
      <PasswordInput />
      <SubmitButton />
    </AppForm>
  )
}
```

**子组件（任意深度）：**

```tsx
// 子组件 - 无需 prop drilling
function EmailInput() {
  const form = useTypedAppFormContext(loginFormOptions)

  return (
    <form.Field
      name="email"
      children={(field) => (
        <>
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
          <FieldError field={field} />
        </>
      )}
    />
  )
}

// 深层组件
function SubmitButton() {
  const form = useTypedAppFormContext(loginFormOptions)

  return (
    <form.Subscribe
      selector={(s) => s.canSubmit}
      children={(canSubmit) => (
        <button type="submit" disabled={!canSubmit}>
          提交
        </button>
      )}
    />
  )
}
```

---

## 6.3 formOptions 配置复用

`formOptions` 用于将表单配置抽离出来，实现跨组件复用。

### 基础用法

```tsx
import { formOptions } from '@tanstack/react-form'

// 定义可复用的表单配置
export const contactFormOptions = formOptions({
  defaultValues: {
    name: '',
    email: '',
    message: '',
  },
  validators: {
    onChange: ({ value }) => {
      if (value.name.length < 2) return { name: '姓名至少2个字符' }
      return undefined
    },
  },
})
```

### 新建与编辑共用

```tsx
// 配置定义
export const userFormOptions = formOptions({
  defaultValues: {
    name: '',
    email: '',
    bio: '',
  },
})

// 注册页面
function RegisterPage() {
  const form = useAppForm({
    ...userFormOptions,
    onSubmit: async ({ value }) => {
      await register(value)
    },
  })
  return <UserForm form={form} />
}

// 编辑页面（覆盖默认值）
function EditPage({ user }: { user: User }) {
  const form = useAppForm({
    ...userFormOptions,
    defaultValues: user,  // 用已有数据覆盖
    onSubmit: async ({ value }) => {
      await updateUser(value)
    },
  })
  return <UserForm form={form} />
}
```

---

# 7. 状态管理

## 7.1 useStore 详解

`useStore` 用于直接从表单 Store 订阅状态，将外部状态连接到 React 组件。

### 基本语法

```tsx
import { useStore } from '@tanstack/react-form'

const value = useStore(form.store, (s) => s.values.fieldName)
```

### 全量订阅

订阅整个 Store，任何变化都会触发重渲染（仅用于调试）。

```tsx
function FormDebugger() {
  const state = useStore(form.store, (s) => s)

  return (
    <div>
      <pre>{JSON.stringify(state.values, null, 2)}</pre>
      <p>isSubmitting: {state.isSubmitting ? '是' : '否'}</p>
    </div>
  )
}
```

### 精准订阅（推荐）

只订阅关心的特定属性，避免不必要的重渲染。

```tsx
function SubmitButton() {
  const canSubmit = useStore(form.store, (s) => s.canSubmit)
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)

  return (
    <button disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  )
}
```

### 计算属性订阅

在 selector 中进行计算，直接获取结果。

```tsx
function CharacterCount() {
  const charCount = useStore(form.store, (s) => s.values.text.length)
  const isOverLimit = charCount > 1000

  return (
    <span className={isOverLimit ? 'text-red-500' : ''}>
      {charCount} / 1000
    </span>
  )
}
```

### 多重状态订阅

返回一个对象或数组。

```tsx
const { canSubmit, isPristine } = useStore(form.store, (s) => ({
  canSubmit: s.canSubmit,
  isPristine: !s.isDirty,
}))
```

---

## 7.2 Subscribe vs useStore

| 特性 | `form.Subscribe` | `useStore` |
|------|------------------|------------|
| 用法 | JSX 组件 | React Hook |
| 重渲染范围 | 只重渲染 Subscribe 内部 | 整个组件 |
| 适用场景 | 按钮、状态显示 | 需要在组件逻辑中使用状态 |
| 灵活性 | 只能用于 JSX | 可在任意逻辑中使用 |

**选择建议：**
- UI 展示类 → 用 `form.Subscribe`
- 需要在事件处理器中判断 → 用 `useStore`

---

# 8. 调试与最佳实践

## 8.1 调试技巧

### 1. 使用 `form.Subscribe` 监控所有状态

```tsx
function FormDebugger() {
  return (
    <form.Subscribe
      selector={(s) => s}
      children={(state) => (
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(
            {
              values: state.values,
              errors: state.errors,
              isDirty: state.isDirty,
              isSubmitting: state.isSubmitting,
              canSubmit: state.canSubmit,
            },
            null,
            2
          )}
        </pre>
      )}
    />
  )
}
```

### 2. 使用 `onChange` 监听所有变化

```tsx
const form = useForm({
  defaultValues: { name: '' },
  onSubmit: ({ value }) => console.log(value),
})

// 添加调试日志
form.useStore(form.store, (s) => {
  console.log('Form state changed:', s)
  return s.values
})
```

### 3. 使用浏览器扩展

TanStack Form 基于 `@tanstack/store`，可使用 React DevTools 监控状态变化。

---

## 8.2 性能优化

### 1. 使用 `form.Subscribe` 包裹按钮

```tsx
// ❌ 不推荐：整个组件会重渲染
function SubmitButton({ form }: { form: ReturnType<typeof useForm> }) {
  const canSubmit = form.state.canSubmit  // 父组件重渲染时这里也会重渲染
  return <button disabled={!canSubmit}>提交</button>
}

// ✅ 推荐：只有 canSubmit 变化时重渲染
function SubmitButton({ form }: { form: ReturnType<typeof useForm> }) {
  return (
    <form.Subscribe
      selector={(s) => s.canSubmit}
      children={(canSubmit) => <button disabled={!canSubmit}>提交</button>}
    />
  )
}
```

### 2. 避免在 render 中创建对象

```tsx
// ❌ 不推荐
<form.Subscribe
  selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
  children={({ canSubmit, isSubmitting }) => ...}
/>

// ✅ 推荐：返回数组
<form.Subscribe
  selector={(s) => [s.canSubmit, s.isSubmitting]}
  children={([canSubmit, isSubmitting]) => ...}
/>
```

### 3. 使用 `transform` 进行值转换

```tsx
// ❌ 不推荐：在 onChange 中转换
onChange={(e) => field.handleChange(Number(e.target.value))}

// ✅ 推荐：使用 transform
<form.Field
  name="amount"
  transform={(value) => (value === '' ? 0 : Number(value))}
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

## 8.3 常见陷阱

### 1. 忘记 `e.preventDefault()` 和 `e.stopPropagation()`

```tsx
// ❌ 不推荐
<form onSubmit={form.handleSubmit}>

// ✅ 推荐
<form
  onSubmit={(e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }}
>
```

### 2. 忘记 `async/await` 在 `onSubmit` 中

```tsx
// ❌ 不推荐：isSubmitting 不会正确更新
onSubmit: ({ value }) => {
  await saveData(value)  // 缺少 async
}

// ✅ 推荐
onSubmit: async ({ value }) => {
  await saveData(value)
}
```

### 3. 数组字段索引不连续

当删除数组中间元素时，确保使用正确的索引：

```tsx
// ❌ 错误：删除后索引会错乱
{field.state.value.map((_, i) => (
  <form.Field name={`items[${i}]`}>
    ...
  </form.Field>
))}

// ✅ 正确：使用稳定的 key
{field.state.value.map((item, i) => (
  <div key={i}>  {/* 或使用唯一 ID 作为 key */}
    <form.Field name={`items[${i}]`}>
      ...
    </form.Field>
  </div>
))}
```

### 4. 嵌套字段的默认值类型

```tsx
// ❌ 错误：嵌套对象需要有默认值
const form = useForm({
  defaultValues: {
    user: undefined,  // ❗ 报错
  },
})

// ✅ 正确：嵌套对象需要有初始结构
const form = useForm({
  defaultValues: {
    user: {
      name: '',
      profile: {
        age: 0,
      },
    },
  },
})
```

### 5. 在 `onChange` 验证器中返回数组格式错误

```tsx
// ❌ 错误：onChange 验证器应返回字符串或 undefined
validators: {
  onChange: ({ value }) => {
    if (!value) return { field: '不能为空' }  // ❗ 表单级才返回对象
    return undefined
  },
}

// ✅ 正确：onChange 验证器返回字符串或 undefined
validators: {
  onChange: ({ value }) => {
    if (!value) return '不能为空'
    return undefined
  },
}
```

---

# 附录

## 附录 A：完整示例 - 用户注册表单

```tsx
import React from 'react'
import { useForm, formOptions, createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

// 1. 创建 Context
const {
  formContext,
  fieldContext,
  useFormContext,
  useFieldContext,
} = createFormHookContexts()

// 2. 创建自定义 Hook
export const {
  useAppForm,
  useTypedAppFormContext,
  useField,
  AppForm,
} = createFormHook({
  formContext,
  fieldContext,
})

// 3. 定义 Schema
const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3位'),
  email: z.string().email('无效的邮箱'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
  hobbies: z.array(z.string()).min(1, '至少添加一个爱好'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

// 4. 定义表单配置
export const registerFormOptions = formOptions<RegisterFormData>({
  defaultValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    hobbies: ['编程'],
  },
  validators: {
    onChange: registerSchema,
  },
})

// 5. 模拟 API
const checkUsernameExists = async (username: string) => {
  await new Promise((r) => setTimeout(r, 500))
  return username === 'admin'
}

// 6. 表单组件
function RegisterForm() {
  const form = useAppForm({
    ...registerFormOptions,
    onSubmit: async ({ value }) => {
      console.log('注册成功:', value)
      await new Promise((r) => setTimeout(r, 1000))
    },
  })

  return (
    <AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        style={{ maxWidth: '400px', margin: '0 auto' }}
      >
        <h1>用户注册</h1>

        {/* 用户名 - 异步验证 */}
        <form.Field
          name="username"
          asyncValidators={{
            onChangeAsyncDebounceMs: 500,
            onChangeAsync: async ({ value }) => {
              if (value.length < 3) return undefined
              const exists = await checkUsernameExists(value)
              return exists ? '用户名已被占用' : undefined
            },
          }}
          children={(field) => (
            <FieldWrapper label="用户名" field={field}>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FieldWrapper>
          )}
        />

        {/* 邮箱 */}
        <form.Field
          name="email"
          children={(field) => (
            <FieldWrapper label="邮箱" field={field}>
              <input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FieldWrapper>
          )}
        />

        {/* 密码 */}
        <form.Field
          name="password"
          children={(field) => (
            <FieldWrapper label="密码" field={field}>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FieldWrapper>
          )}
        />

        {/* 确认密码 - 依赖验证 */}
        <form.Field
          name="confirmPassword"
          listenTo={['password']}
          children={(field) => (
            <FieldWrapper label="确认密码" field={field}>
              <input
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            </FieldWrapper>
          )}
        />

        {/* 爱好数组 */}
        <div style={{ marginBottom: '16px' }}>
          <label>兴趣爱好</label>
          <form.Field
            name="hobbies"
            children={(field) => (
              <div>
                {field.state.value.map((_, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <form.Field name={`hobbies[${index}]`}>
                      {(subField) => (
                        <input
                          value={subField.state.value}
                          onChange={(e) => subField.handleChange(e.target.value)}
                        />
                      )}
                    </form.Field>
                    <button type="button" onClick={() => field.removeValue(index)}>
                      删除
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => field.pushValue('')}>
                  添加爱好
                </button>
              </div>
            )}
          />
        </div>

        {/* 提交按钮 */}
        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? '注册中...' : '立即注册'}
            </button>
          )}
        />
      </form>
    </AppForm>
  )
}

// 7. 通用字段包装组件
function FieldWrapper({ label, field, children }: { label: string; field: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px' }}>{label}</label>
      {children}
      {field.state.meta.errors?.[0] && (
        <span style={{ color: 'red', fontSize: '12px' }}>
          {typeof field.state.meta.errors[0] === 'string'
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0]?.message}
        </span>
      )}
    </div>
  )
}

export default RegisterForm
```

---

## 附录 B：React Native 使用

```tsx
import { useForm } from '@tanstack/react-form'

function RNForm() {
  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form.Field
      name="email"
      children={(field) => (
        <TextInput
          value={field.state.value}
          onChangeText={field.handleChange}
          onBlur={field.handleBlur}
          placeholder="邮箱"
        />
      )}
    />
  )
}
```

---

## 附录 C：与 TanStack Query 集成

```tsx
import { useForm } from '@tanstack/react-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function EditUserForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  // 获取用户数据
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  // 更新用户
  const mutation = useMutation({
    mutationFn: (data) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })

  const form = useForm({
    defaultValues: user,  // 自动填充现有数据
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="name" children={(field) => (
        <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
      )} />
      <button type="submit">保存</button>
    </form>
  )
}
```

---

## 附录 D：常见问题

### Q1: 为什么不推荐使用 `form.state` 直接在组件中判断？

```tsx
// ❌ 不推荐
<div>{form.state.canSubmit ? '可以提交' : '不能提交'}</div>

// ✅ 推荐
<form.Subscribe selector={(s) => s.canSubmit} children={(canSubmit) => (
  <div>{canSubmit ? '可以提交' : '不能提交'}</div>
)} />
```

### Q2: 如何在表单外部获取值？

```tsx
// 使用 getFieldValue
const email = form.getFieldValue('email')

// 或使用 useStore
const email = useStore(form.store, (s) => s.values.email)
```

### Q3: 如何处理文件上传字段？

```tsx
<form.Field
  name="avatar"
  children={(field) => (
    <input
      type="file"
      onChange={(e) => field.handleChange(e.target.files?.[0])}
    />
  )}
/>
```

---

# 结语

TanStack Form 是一个功能强大、类型安全、性能优异的表单库。通过本文档，你应该能够：

1. ✅ 理解核心概念（useForm、Field、Subscribe）
2. ✅ 掌握验证机制（内置验证、Schema 验证、异步验证）
3. ✅ 处理复杂场景（数组字段、嵌套字段、字段依赖）
4. ✅ 实现组件解耦（Context、formOptions）
5. ✅ 优化性能（精准订阅、避免不必要的重渲染）

**进一步学习资源：**

- 官方文档：https://tanstack.com/form
- GitHub：https://github.com/TanStack/form
- 示例代码：https://github.com/tanstack/form/tree/main/examples

---

*文档最后更新：2026年4月*
