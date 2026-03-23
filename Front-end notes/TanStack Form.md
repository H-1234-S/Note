
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
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </div>
  )}
/>
```

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
<form.Field
  name="users" // 假设 defaultValues 里有 users: ['']
  children={(field) => (
    <div>
      {field.state.value.map((_, i) => (
        <form.Field key={i} name={`users[${i}]`}>
          {(subField) => (
            <input
              value={subField.state.value}
              onChange={(e) => subField.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      ))}
      <button type="button" onClick={() => field.pushValue('')}>添加用户</button>
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

