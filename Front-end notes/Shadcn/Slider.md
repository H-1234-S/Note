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

# 受控组件

使用 `value` 和 `onValueChange` 实时获取滑块的值。 

``` ts
"use client"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

export function ControlledSlider() {
  const [values, setValues] = useState([30])

  return (
    <div className="space-y-4">
      <Slider
        value={values}
        onValueChange={(value) => setValues(value)}
        max={100}
        step={1}
      />
      <p>当前数值：{values[0]}</p>
    </div>
  )
}
```

# 禁用




# 属性

|**属性**|**类型**|**默认值**|**说明**|
|---|---|---|---|
|`defaultValue`|`number[]`|`[0]`|初始值，数组长度决定滑块个数|
|`value`|`number[]`|-|受控状态下的值|
|`onValueChange`|`(value: number[]) => void`|-|值改变时的回调函数|
|`min`|`number`|`0`|最小值|
|`max`|`number`|`100`|最大值|
|`step`|`number`|`1`|步长|
|`minStepsBetweenThumbs`|`number`|`0`|两个滑块之间的最小步长间隔|
