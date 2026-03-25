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