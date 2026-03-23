# useForm

管理表单状态、处理提交
## 参数

| **参数名**                   | **类型**                              | **作用**                                    |
| ------------------------- | ----------------------------------- | ----------------------------------------- |
| **`defaultValues`**       | `TData`                             | **必填**。初始化表单的形状和默认值。它决定了后续字段名的类型补全。       |
| **`onSubmit`**            | `(values) => Promise<void> \| void` | **核心**。处理提交逻辑。它会自动处理异步状态（`isSubmitting`）。 |
| **`validators`**          | `FormValidators`                    | **全局校验**。可以定义跨字段的逻辑（如：两次密码是否一致）。          |
| **`validatorAdapter`**    | `ValidatorAdapter`                  | **插件**。如果你想用 **Zod** 或 Yup，需要在这里传入对应的适配器。 |
| **`onBlur` / `onChange`** | `Function`                          | **实时副作用**。当表单任何地方变动时触发，常用于自动保存草稿。         |

## 返回值

返回一个`form`对象

### 核心子组件

- **`form.Field`**: 用于包装具体的输入组件，实现局部刷新。
    
- **`form.Subscribe`**: 订阅全局状态（如：只要 `canSubmit` 变了就通知我）。
    
- **`form.Provider`**: 配合你之前的 Context 配置，将表单实例传给子组件。
    
### 核心方法

- **`form.handleSubmit()`**: 触发表单提交。通常绑定在 `<form onSubmit={...}>` 上。
    
- **`form.reset()`**: 将表单重置回 `defaultValues`。
    
- **`form.setFieldValue(name, val)`**: 编程式修改某个字段的值。
    
### 核心状态 (`form.state`)

- **`state.values`**: 当前所有数据的快照。
    
- **`state.canSubmit`**: 根据所有验证规则判断当前是否允许提交。
    
- **`state.isSubmitting`**: 提交函数是否正在运行。

## 例子

```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import { useForm } from '@tanstack/react-form'

const PeoplePage = () => {
  const form = useForm({
    defaultValues: {
      username: '',
      age: 0,
    },
    onSubmit: ({ value }) => {
      // 对表单数据做一些事情
      alert(JSON.stringify(value, null, 2))
    },
  })

  return (
    <form.Field
      name="age"
      validators={{
        // 我们可以在表单范围验证器和特定于字段的验证器之间进行选择
        onChange: ({ value }) =>
          value > 13 ? undefined : 'Must be 13 or older',
      }}
      children={(field) => (
        <>
          <input
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            type="number"
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
          />
          {!field.state.meta.isValid && (
            <em>{field.state.meta.errors.join(',')}</em>
          )}
        </>
      )}
    />
  )
}
const rootElement = document.getElementById('root')!
ReactDOM.createRoot(rootElement).render(<PeoplePage />)
```