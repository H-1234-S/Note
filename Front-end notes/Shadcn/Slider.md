# 安装

``` bash
npx shadcn@latest add slider
```

# 基础用法

Slider 最基本的用法是作为一个受控或非受控的数值输入框。默认情况下，它的取值范围是 $0$ 到 $100$。

> **注意：** Slider 的 `defaultValue` 和 `value` 必须是一个**数组**，即使只有一个滑块。

``` ts
import { Slider } from "@/components/ui/slider"

export function SliderDemo() {
  return (
    <Slider 
      defaultValue={[50]} 
      max={100} 
      step={1} 
      className="w-[60%]" 
    />
  )
}
```

# 步长与范围限制 

通过 `min`、`max` 和 `step` 属性，你可以精确控制滑动条的边界和增量。例如，创建一个步长为 $5$ 的音量调节器：

``` ts
<Slider
  defaultValue={[20]}
  min={0}
  max={100}
  step={5}
  className="w-full"
/>
```

# 双滑块范围选择 

如果向 `defaultValue` 传递两个值，组件会自动渲染两个滑块，允许用户选择一个区间（如价格区间）。

``` ts
export function RangeSlider() {
  return (
    <div className="p-4">
      <p className="mb-4">价格范围</p>
      <Slider 
        defaultValue={[20, 80]} 
        max={100} 
        step={1} 
      />
    </div>
  )
}
```