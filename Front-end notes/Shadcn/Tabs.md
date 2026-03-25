# 安装

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BasicTabs() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">账户</TabsTrigger>
        <TabsTrigger value="password">密码</TabsTrigger>
      </TabsList>
      <TabsContent value="account">这里是账户设置的内容。</TabsContent>
      <TabsContent value="password">这里是修改密码的内容。</TabsContent>
    </Tabs>
  )
}
```