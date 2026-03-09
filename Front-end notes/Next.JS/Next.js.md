# Next.js 路由基础
## App Router

- Next.js 采用基于文件系统的路由机制，只需创建文件和文件夹，框架就会自动生成对应的路由结构。

- 在 Next.js 中，app 目录下的每个文件夹都代表一个路由段（route segment），并直接映射到 URL 路径
### page

app目录下每个文件夹都应该有page.tsx/page.jsx文件，作为当前路由的页面
### layout与template

layout与template可以看作多个页面共享的ui，例如导航栏、侧边栏、底部等；并把当前文件夹下的page作为children渲染