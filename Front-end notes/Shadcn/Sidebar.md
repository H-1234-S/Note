# [Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar)
## 结构

一个 `Sidebar` 组件由以下部分组成：

- `SidebarProvider` - 处理可折叠状态。

- `Sidebar` - 侧边栏容器。

- `SidebarHeader` 和 `SidebarFooter` - 粘性定位在侧边栏的顶部和底部。

- `SidebarContent` - 可滚动的内容。

- `SidebarGroup` - `SidebarContent` 内的分区。

- `SidebarTrigger` - `Sidebar` 的触发器。

``` ts
<Sidebar>
  {/* 顶部固定区域 */}
  <SidebarHeader>
    <Logo />
  </SidebarHeader>

  {/* 中间滚动区域 */}
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        {/* 菜单项 */}
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>

  {/* 底部固定区域 */}
  <SidebarFooter>
    <UserMenu />
  </SidebarFooter>
</Sidebar>
```
### SidebarMenu

`SidebarMenu` 组件用于在 `SidebarGroup` 内构建菜单。

![[Pasted image 20260328115001.png]]

``` ts
<SidebarMenu>
  {projects.map((project) => (
    <SidebarMenuItem key={project.name}>
      <SidebarMenuButton asChild>
        <a href={project.url}>
          <project.icon />
          <span>{project.name}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

