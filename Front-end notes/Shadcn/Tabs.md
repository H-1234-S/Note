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