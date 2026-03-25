# [安装](https://ui.shadcn.com/docs/components/radix/tabs#api-reference)

``` bash
npx shadcn@latest add tabs
```

# 结构

**`Tabs`**: 根组件，用于管理状态（当前选中的 Tab 值）。
    
**`TabsList`**: 容器，用于存放所有的 Tab 触发按钮。
    
**`TabsTrigger`**: 点击后切换内容的按钮。
    
 **`TabsContent`**: 对应每一个 Trigger 的内容面板。

# 基础用法

最简单的 Tabs 实现需要一个 `defaultValue` 来指定初始化时显示的面板。

- **注意**：`TabsTrigger` 的 `value` 必须与对应的 `TabsContent` 的 `value` 完全一致。

``` ts
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppWindowIcon, CodeIcon } from "lucide-react";

export default function Tabspage() {
    return (
        <div className="mt-10 flex items-center justify-center flex-col">
            <Tabs  defaultValue="setting"  className="w-[400px] ">
                <TabsList  className="w-full grid-cols-2 ">
                    <TabsTrigger value="setting"><AppWindowIcon />预览</TabsTrigger>
                    <TabsTrigger value="code"><CodeIcon />代码</TabsTrigger>
                </TabsList>
                <TabsContent value="setting"><h1>appWindow page</h1></TabsContent>
                <TabsContent value="code"><h1>code page</h1></TabsContent>
            </Tabs>
        </div>
    )
}
```

# 受控用法

通过代码逻辑（比如点击外部按钮）来切换 Tab，你可以使用 `value` 和 `onValueChange`。

``` ts
"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ControlledTabs() {
  const [activeTab, setActiveTab] = useState("tab1")

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tab1">第一项</TabsTrigger>
          <TabsTrigger value="tab2">第二项</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">内容 1</TabsContent>
        <TabsContent value="tab2">内容 2</TabsContent>
      </Tabs>
      
      <button onClick={() => setActiveTab("tab2")} className="mt-4">
        点击跳转到第二项
      </button>
    </div>
  )
}
```