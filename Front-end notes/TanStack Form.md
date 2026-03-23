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

### 数据是怎么流动的

#### 1. 初始状态：从大脑到表单 (Initial State)

数据流始于 `useForm` 的配置：

- 你定义的 `defaultValues: { age: 0 }` 被存入 TanStack Form 的**外部状态存储（Store）** 中。
    
- `<form.Field name="age">` 就像一个“侦察兵”，它根据 `name` 属性，从 Store 中精准地把 `0` 拿出来，并通过 `field.state.value` 传递给子组件。
    

---

#### 2. 用户输入：从 UI 到逻辑层 (UI → Field Instance)

当你在 `<input />` 中输入数字（比如输入 `15`）时：

1. **触发事件**：`onChange` 事件被激活。
    
2. **数据提取**：`e.target.valueAsNumber` 将字符串转换为数字 `15`。
    
3. **调用指令**：执行 `field.handleChange(15)`。这是**数据回流**的第一步。
    

---

#### 3. 校验风暴：逻辑层处理 (Validation & Update)

一旦 `field.handleChange(15)` 被调用，TanStack Form 内部会立即执行以下逻辑：

1. **执行校验器**：运行你在 `validators.onChange` 中定义的匿名函数。
    
    - 输入 `10`？函数返回 `'Must be 13 or older'`。
        
    - 输入 `15`？函数返回 `undefined`。
        
2. **同步元数据（Meta）**：
    
    - 校验结果被存入 `field.state.meta.errors`。
        
    - `field.state.meta.isValid` 状态根据结果自动变为 `true` 或 `false`。
        
3. **更新 Store**：全局 Store 中的 `age` 正式变为 `15`。
    

---

#### 4. 视图重绘：从逻辑层回到 UI (Store → UI)

这是 TanStack Form 性能优越的秘诀：

- 由于 Store 更新了，它会通知订阅了 `age` 字段的 `<form.Field>` 组件。
    
- **局部渲染**：只有这个 `<form.Field>` 内部的 `children` 函数会重新运行。
    
- **UI 更新**：
    
    - `<input />` 的 `value` 拿到最新的 `15`。
        
    - `<em>` 标签根据最新的 `meta.errors` 决定显示还是消失。
        

---

#### 5. 提交：最终汇聚 (Form Submission)

当你（通过按钮或其他方式）触发 `form.handleSubmit()` 时：

1. **全量验证**：TanStack Form 会最后检查一遍所有字段的 `isValid`。
    
2. **数据打包**：将所有字段的最新值汇总成一个对象（即 `value`）。
    
3. **执行回调**：将打包好的数据传给你在 `useForm` 里定义的 `onSubmit` 函数。