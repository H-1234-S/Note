# button组件

组件安装：

``` bash
npm shadcn@3.8.5 add button
```

源代码：

``` ts
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```
## 1. cva (Class Variance Authority)

**它是什么？** 一个专门用来**管理 CSS 变体（Variants）** 的库。

**有什么用？** 它解决了“条件判断样式”太乱的问题。在没有它之前，你可能要写一堆复杂的 JS 逻辑来判断按钮该红还是该绿。

- **结构化定义**：让你把“基础样式”、“颜色变体”、“尺寸变体”像写配置表一样写清楚。
    
- **类型安全**：它能自动生成 TypeScript 类型，当你写 `variant="destru..."` 时，编辑器会自动补全。
    
**代码直观感受：**

``` TypeScript
const buttonVariants = cva(
  "base-style", // 所有按钮都有的样式
  {
    variants: {
      color: {
        primary: "bg-blue-500",
        danger: "bg-red-500",
      }
    },
    defaultVariants: { color: "primary" }
  }
)

// 使用时只需要传参数，它帮你拼字符串
buttonVariants({ color: "danger" }) // 返回 "base-style bg-red-500"
```
## 2. cn (Classname Merge Utility)

**它是什么？** 这是 shadcn 自己定义的一个辅助函数（通常在 `lib/utils.ts` 里），它内部组合了两个库：`clsx` 和 `tailwind-merge`。

**有什么用？** 它解决了 **“类名冲突”** 和 **“条件合并”** 的问题。

- **条件合并**：你可以很方便地写 `{ "opacity-50": disabled }`，只有在 `disabled` 为真时才加上这个类。
    
- **解决 Tailwind 冲突 (关键！)**：
    
    - 假设组件内部默认有 `px-4`（左右内边距）。
        
    - 用户在使用组件时传了一个 `className="px-8"`。
        
    - 标准的字符串拼接会变成 `"px-4 px-8"`，CSS 层叠规则有时会导致预测之外的结果。
        
    - **`cn` 函数会自动识别这种冲突**，把旧的 `px-4` 删掉，只留下 `px-8`。
        
## 3. 两者如何配合工作？

在 `Button` 组件的源码里，你会看到它们是这样“双剑合璧”的：

``` TypeScript
<button
  className={cn(
    buttonVariants({ variant, size, className })
  )}
/>
```

1. **`buttonVariants({ variant, size })`**：先根据你选的颜色和大小，生成一串基础的 Tailwind 字符串。
    
2. **`className`**：把你从外部额外传进来的自定义样式拿过来。
    
3. **`cn(...)`**：把上面两拨类名揉在一起。如果你的 `className` 里有跟 `buttonVariants` 冲突的样式，以你的 `className` 为准。
# props

``` ts
{
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }
```

## 1. `className` (样式透传)

- **含义**：允许外部在使用组件时，临时注入额外的 Tailwind 类名。
    
- **作用**：为了灵活性。比如 90% 的按钮都是默认宽度，但某处需要一个 `w-full`（全宽）按钮，你可以这样写：`<Button className="w-full">提交</Button>`。
    
- **底层配合**：它会通过 `cn()` 函数与组件内部定义的 `buttonVariants` 合并，确保外部传入的样式能正确覆盖默认样式。
    
## 2. `variant` & `size` (样式变体)

- **作用**：
    
    - **`variant`**：定义“种类”。如 `default`（主色）、`destructive`（红色/危险）、`outline`（边框线）。
        
    - **`size`**：定义“尺寸”。如 `sm`（小号）、`lg`（大号）、`icon`（正方形图标按钮）。
        
- **默认值**：代码里的 `= "default"` 是默认参数。
    
## 3. `asChild` (元素代理/槽)

- **作用**：**改变组件渲染的实际 DOM 节点，但保留样式。**
    
- **场景举例**：
    
    - 默认：`<Button>点击</Button>` 渲染出来是 `<button>...</button>`。
        
    - 使用 `asChild`：如果你想让一个链接看起来像按钮，你会写：
        
        ``` ts
		<Button asChild>
		    <a href="/login">登录</a>
        </Button>
        ```
        
        此时，页面上**不会**出现 `button` 标签，而是直接渲染一个带有按钮样式的 `<a>` 标签。这避免了在 `button` 内部嵌套 `a` 标签这种非法的 HTML 结构。
## 4. `...props` (属性转发/透传)

- **含义**：收集所有剩余的属性（如 `onClick`, `type`, `disabled`, `id`, `onMouseEnter` 等）。
    
- **作用**：**封装性**。作为一个基础组件，你不可能穷举原生按钮的所有属性。
    
- **效果**：通过在返回的 JSX 中写 `{...props}`，你可以像使用原生 HTML 按钮一样使用这个组件，所有标准属性都会原封不动地传递给底层的 DOM 元素。

