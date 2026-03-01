# React Router

## 基本使用

* 基于createBrowserRouter路由模式


* 新建目录`router`，在目录中新建文件`index.ts`，在文件中引入`React-router`，然后使用`createBrowserRouter`创建路由。

~~~typescript
import { createBrowserRouter } from 'react-router';
import Home from '../pages/Home';
import About from '../pages/About';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/about',
    Component: About,
  },
]);

export default router;
~~~

* 在`App.tsx`文件中引入路由，然后使用`RouterProvider`包裹`App`组件。

~~~typescript
import React from 'react';
import { RouterProvider } from 'react-router';
import router from './router';
const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
~~~

### 路由跳转

* `NavLink`是一个组件，从`react-route`引入，to传递的是跳转的地址

~~~typescript
import { NavLink } from 'react-router';

const Home: React.FC = () => {
  return (
    <div>
      <NavLink to="/about">About</NavLink>
    </div>
  );
};

export default Home;
~~~





## 路由模式

* 在React RouterV7 中，是拥有不同的路由模式，路由模式的选择将直接影响你的整个项目。React Router 提供了四种核心路由创建函数： `createBrowserRouter`、`createHashRouter`、`createMemoryRouter` 和 `createStaticRouter`

### createBrowserRouter

#### 核心特点

- 使用HTML5的history API (pushState, replaceState, popState)
- 浏览器URL比较纯净 (/search, /about, /user/123)
- 需要服务器端支持(nginx, apache,等)否则会刷新404

### createHashRouter

#### 核心特点

- 使用URL的hash部分(#/search, #/about, #/user/123)
- 不需要服务器端支持
- 刷新页面不会丢失

### createMemoryRouter

#### 核心特点

- 使用内存中的路由表
- 刷新页面会丢失状态
- 切换页面路由不显示URL

### createStaticRouter

#### 核心特点

- 专为服务端渲染（SSR）设计
- 在服务器端匹配请求路径，生成静态 HTML
- 需与客户端路由器（如 createBrowserRouter）配合使用


## 路由种类

### 嵌套路由

* 嵌套路由就是在父路由的`children`中嵌套子路由，子路由可以继承父路由的布局，也可以有自己的布局。

~~~typescript
const router = createBrowserRouter([
  {
    path: '/index',
    Component: Layout,
      // 嵌套路由
    children:[
      {
        path:'home',
        Component:Home
      }
    ]
  }
]);
~~~

#### 注意事项

- 子路由不需要增加`/`了直接写子路由的path即可
- 子路由默认是不显示的，需要父路由通过 `Outlet` 组件来显示子路由，相当于**子路由的"插槽"**或**占位符**。
  - 避免组件重复渲染，react-router只渲染子路由

~~~jsx
import { Outlet } from 'react-router';

<div className="dashboard">
  <header>导航栏</header>
  <Sidebar />
  
  {/* Outlet 就是这里 👇 */}
  {/* 子路由会在这个位置显示 */}
  <main>
    <Outlet />	{/* React Router 自动处理子路由切换 */}
  </main>
  
  <footer>页脚</footer>
</div>
~~~

### 布局路由

* 布局路由是一种特殊的嵌套路由，父路由可以省略 `path`，这样不会向 URL 添加额外的路径段：
  * **父路由本身不会被单独访问**，只会渲染子路由。
  * 搭配索引路由使用

~~~url
// 省略父路由的path后
http://localhost:5173/home

http://localhost:5173/index/home
~~~

~~~jsx
const router = createBrowserRouter([
    { 
        // path: '/index', //省略
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ]
    },
]);
~~~

### 索引路由

* 当父路由匹配但子路由没有匹配时，渲染 index 为true对应的组件


* 索引路由使用 `index: true` 来定义，作为父路由的默认子路由：

~~~jsx
const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                index: true, 
                // path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ]
    },
]);
~~~

### 前缀路由

### 动态路由

* 动态路由通过 `:参数名` 语法来定义动态段：

layout/Home/index.tsx

~~~jsx
import { useParams } from "react-router"
const Home = () => {
    let { id } = useParams()
    return (
        <div>
            Home{id}
        </div>
    )
}

export default Home
~~~

router/index.tsx

~~~jsx
import { createBrowserRouter } from 'react-router';
import Layout from '../laout';
import Home from '../laout/Home';
const router = createBrowserRouter([
  {
    path: '/index',
    Component: Layout,
    children:[
      {
        index:true,
        path:'home/:id',
        Component:Home
      }
    ]
  }
]);

export default router;
~~~

* url是localhost/index/home/abc
* abc是所谓的id，原来的url访问不到该页面，动态动态

## 路由传参

* React-router 一共有三种方式进行参数传递，参数传递指的是在路由跳转时，将参数传递给目标路由。

### Query

* Query的方式就是使用 ? 来传递参数，例如：

~~~typescript
#多个参数用 & 连接
/user?name=小满zs&age=18
~~~

#### 跳转方式

~~~typescript
//1. NavLink 跳转
<NavLink  to="/about?id=123">About</NavLink> 
//2. Link 跳转
<Link to="/about?id=123">About</Link> 


import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/about?id=123') //3. useNavigate 跳转
~~~

#### 获取参数

~~~typescript
//1. 获取参数
import { useSearchParams } from 'react-router'
const [searchParams, setSearchParams] = useSearchParams()
console.log(searchParams.get('id')) //获取id参数

//2. 获取参数
import { useLocation } from 'react-router'
const { search } = useLocation()
console.log(search) //获取search参数 ?id=123
~~~

##### useSearchParams

* `useSearchParams` 是一个 React-router 的钩子函数，用于获取当前 URL 的搜索参数，也就是 `?` 后面的参数。
* 获取参数

~~~typescript
import { useSearchParams } from 'react-router'
const [searchParams, setSearchParams] = useSearchParams()
console.log(searchParams.get('id')) //获取id参数
~~~

* 修改参数

~~~typescript
//修改当前 URL 的搜索参数
<button onClick={() => setSearchParams(searchParams => {
    searchParams.set('age','30');
    searchParams.set('name','小满zs');
    return prev;
})}>change</button>
~~~

### Params

* 需要在`createBrowserRouter`中进行配置url

配置url

~~~react
import { createBrowserRouter } from 'react-router';
import Layout from '../laout';
import Home from '../laout/Home';
import About from '../laout/About';
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children:[
      {
        path:'home',
        Component:Home
      },
        {/* 配置url 只有正确格式的url可以访问到about */}
      {
        path:'about/:name/:age',
        Component:About
      }
    ]
  }
]);

export default router;
~~~

#### 跳转方式

~~~react
<NavLink to="/home/xiaoman/18">User</NavLink> //1. NavLink 跳转
<Link to="/home/xiaoman/18">User</Link> //2. Link 跳转

import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/home/xiaoman/18') //3. useNavigate 跳转
~~~

#### 获取参数

~~~typescript
import { useParams } from 'react-router'
const { name } = useParams()
console.log(name) //获取name参数
~~~

##### useParams

* useParams返回一个对象
* **useParams 是只读的！**，不能直接修改对象的属性值


### State

* state传递的参数在url中不显示
* 可以传递**复杂数据类型**

#### 跳转方式

~~~react
<Link to="/user" state={{ name: '小满zs', age: 18 }}>User</Link> //1. Link 跳转
<NavLink to="/user" state={{ name: '小满zs', age: 18 }}>User</NavLink> //2. NavLink 跳转

import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/user', { state: { name: '小满zs', age: 18 } }) //3. useNavigate 跳转
~~~

#### 获取参数

~~~typescript
import { useLocation } from 'react-router'
const { state } = useLocation()
console.log(state) //获取state参数
console.log(state.name) //获取name参数
console.log(state.age) //获取age参数
~~~

##### useLocation

* 返回当前 URL 的 location 对象。

~~~typescript
import { useLocation } from 'react-router'

function SomeComponent() {
  let location = useLocation()
  return <div>{JSON.stringify(location)}</div>
}
~~~

* ​

~~~typescript
// location 对象包含以下属性：
{
  pathname: "/products/123",      // 路径部分
  search: "?color=red&size=large", // 查询参数部分 ?后面的
  hash: "#reviews",               // 锚点部分
  state: { fromHome: true },      // 编程式导航传递的数据 { fromHome: true }
  key: "abc123"                   // 唯一标识
}
~~~

* 类型

~~~typescript
function useLocation(): Location;
// 类型定义
interface Location<State> {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state: State;
}
~~~

## 懒加载

* 懒加载是一种优化技术，用于延迟加载组件，直到需要时才加载。这样可以减少初始加载时间，提高页面性能。
* 在路由对象中添加`lazy属性`实现

~~~typescript
import { createBrowserRouter } from 'react-router';
// sleep 是一个函数，它返回一个 Promise 对象。
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // 模拟异步请求
const router = createBrowserRouter([
    {
        Component: Layout,
            {
                path: 'about',
                lazy: async () => {
                    await sleep(2000); // 模拟异步请求
                    const Component = await import('../pages/About'); // 异步导入组件
                    console.log(Component);
                    return {
                        Component: Component.default,
                    }
                }
            },
        ],
    },
]);
~~~

### useNavigation

* `useNavigation` 是一个 React-Router 的钩子，用于获取当前路由的导航状态。

~~~typescript
import { useNavigation } from 'react-router';

const navigation = useNavigation();
~~~

状态navigation.state属性

- `idle` 空闲状态
- `submitting` 提交状态
- `loading` 加载状态


## 路由操作

### Loader

* 路由加载之前，用来获取数据的函数(GET)；配置在router中
* 路由自带的 `useEffect + 请求接口`

~~~typescript
// 路由配置
{
  path: "/user/:id",
  element: <User />,
  loader: async ({ params }) => {
    return fetch(`/api/user/${params.id}`);
  },
}
~~~

* 在 **进入这个路由之前执行**；专门用来 **获取数据**；返回的数据，可以在组件里直接用

~~~typescript
import { useLoaderData } from 'react-router'

const LoaderData = useLoaderData()
~~~



#### 有什么用

1️⃣ 在页面渲染前拿到数据

 ~~~javascript
  // 传统写法
  useEffect(() => {
    fetch("/api/user/1")
      .then(res => res.json())
      .then(setUser);
  }, []);
  // 出现的问题：
  // 页面进来没有数据
 ~~~

2️⃣ 路由和数据强绑定

* 哪个页面需要数据，就在它自己的路由上写 loader

3️⃣ 自动处理 loading 状态

* loader函数 让“跳路由”这件事，自带 loading 状态

4️⃣ loader 能拿到路由信息

```javascript
loader: ({ params, request }) => {
  console.log(params.id);   // 路由参数
  console.log(request.url); // 当前请求地址
}
```

### Action

* `action` 是写在**路由配置里的一个异步函数**，用于处理**表单提交 / 写操作**的函数

~~~typescript
// 路由配置
action:async ({ request }) => {
          const formData = await request.formData() // 获取formdata格式的数据
          const data = Object.fromEntries(formData) // 将键值对格式的数据转成对象
          console.log(data)
          await timer(2000) // 模拟发送post请求
          return {
            message:'提交成功',
            success:true
          } 
        },
~~~

* 组件提交数据

~~~typescript
import { useSubmit } from 'react-router'

const submit = useSubmit();

submit(values,{
    method:'POST',// 默认是formData格式
})
~~~

* action返回结果给对应组件

~~~typescript
import { useActionData } from 'react-router';

const actiondata = useActionData();
// useActionData函数返回的是路由配置里action return的结果
~~~

#### 有什么用

1️⃣ 代替 onSubmit + fetch（核心）

以前你要写：

```typescript
const onSubmit = async (e) => {
  e.preventDefault();
  await fetch("/login", { method: "POST" });
};
```

现在：

```typescript
<Form method="post">
  <button type="submit">登录</button>
</Form>
```

👉 **不写 fetch、不写 onSubmit**

------

2️⃣ 自动拿到 FormData

```typescript
export async function action({ request }) {
  const formData = await request.formData();
}
```

浏览器自动帮你封装好了

------

3️⃣ 自动管理 submitting 状态

```typescript
const navigation = useNavigation();
navigation.state === "submitting";
```

👉 再也不用自己 `useState(loading)`

------

4️⃣ 返回结果给页面用

```typescript
return {
  success: true,
  message: "提交成功"
};
```

页面用：

```typescript
const actionData = useActionData();
```

------

5️⃣ 统一错误 & 重定向

```typescript
throw new Response("未登录", { status: 401 });
```

或：

```typescript
return redirect("/login");
```

#### 状态变换

get 请求会发生的状态

~~~react
idle ->loading -> idle
~~~

post 提交会发生的 状态

~~~react
idle -> submitting ->loading -> idle
~~~

## 路由导航

### Link

* `Link`组件是一个用于导航到其他页面的组件，他会被渲染成一个特殊的`<a>`标签，跟传统a标签不同的是，他`不会刷新页面`，而是会通过router管理路由。

~~~typescript
import { Link } from "react-router";

export default function App() {
  return (
    <Link to="/about">About</Link>
  )
}
~~~

#### 参数

- `to`：要导航到的路径

~~~typescript
<Link to="/about">About</Link>
~~~

- `replace`：replace 属性是一个布尔值，表示是否替换当前路径，如果为`true`，则导航不会在浏览器历史记录中创建新的条目，而是替换当前条目。
- `state`：要传递给目标页面的状态；state属性是一个对象，用于传递参数给目标页面。

~~~typescript
<Link state={{ from: "home" }} to="/about">About</Link>
~~~

- `relative`：相对于当前路径的导航方式
- `reloadDocument`：是否重新加载页面，如果加入这个跟默认的a链接没有区别

~~~typescript
<Link reloadDocument to="/about">About</Link>
~~~

- `preventScrollReset`：是否阻止滚动位置重置

~~~typescript
<Link preventScrollReset to="/about">About</Link>
~~~

- `viewTransition`：是否启用视图过渡，自动增加页面跳转的动画效果。

### NavLink

* 带有附加属性的包装器[`<Link>`](https://reactrouter.com/api/components/Link)，用于设置活动状态和待处理状态的样式。
* **NavLink 是 Link 的增强版，专门为导航菜单设计，能自动感知"当前激活状态"。**

~~~typescript
// className
<NavLink
  to="/messages"
  className={({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "active" : ""
  }
>
  Messages
</NavLink>

// style
<NavLink
  to="/messages"
  style={({ isActive, isPending }) => {
    return {
      fontWeight: isActive ? "bold" : "",
      color: isPending ? "red" : "black",
    }
  )}
/>

// children
<NavLink to="/tasks">
  {({ isActive, isPending }) => (
    <span className={isActive ? "active" : ""}>Tasks</span>
  )}
</NavLink>
~~~

* Navlink会经历以下三种状态的改变，但是link不会

  * `active`：激活状态(当前路由和to属性匹配)
  * `pending`：等待状态(loader有数据需要加载)
  * `transitioning`：过渡状态(通过viewTransition属性触发)

  ​


### useNavigate

* 编程式导航，通过改变url来匹配路由

~~~typescript
import { useNavigate } from 'react-router';

const navigate = useNavigate();
~~~

#### Navigate

~~~typescript
import { Navigate } from 'react-router'
// 返回一个组件

<Navigate to={"/"} />
~~~



#### 执行过程

~~~typescript
navigate('/home')
// 调用navigate后，react router接受到导航请求
// 解析目标路径/home，遍历路由配置(createBrowserRouter)，查找匹配路径规则
~~~

~~~typescript
// 匹配到父路由 path: '/' 和子路由 path: 'home'
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children:[
      {
        path:'home',
        Component:Home,
      },
      {
        path:'about',
        Component:About
      }
    ]
  }
]);
~~~

## 边界处理

### 404页面

* 404页面指的是当React-router路由匹配不到时，显示的页面



~~~typescript
const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
            },
            {
                path: 'about',
                Component: About,
            },
        ],
    },
    {
        path: '*', //通配符，当路由匹配不到时，显示404页面  
        Component: NotFound, //404页面组件
    },
]);
~~~

### 错误处理

* ErrorBoundary是用于捕获路由loader或action的错误，并进行处理。
* 如果loader或action抛出错误，会调用ErrorBoundary组件。

~~~typescript
import NotFound from '../layout/404'; // 404页面组件
import Error from '../layout/error'; // 错误处理组件
const router = createBrowserRouter([
    {
        path: '/index',
        Component: Layout,
        children: [
            {
                path: 'home',
                Component: Home,
                ErrorBoundary: Error, //如果组件抛出错误，会调用ErrorBoundary组件
            },
            {
                path: 'about',
                loader: async () => {
                    //throw new Response('Not Found', { status: 404, statusText: 'Not Found' }); 可以返回Response对象
                    //也可以返回json等等
                    throw {
                        message: 'Not Found',
                        status: 404,
                        statusText: 'Not Found',
                        data: '132131',
                    }
                },
                Component: About,
                ErrorBoundary: Error, //如果loader或action抛出错误，会调用ErrorBoundary组件
            },
        ],
    },
    {
        path: '*', 
        Component: NotFound,
    },
]);
~~~

* 并且返回的错误信息可以通过一个hooks获取到

~~~typescript
import { useRouteError } from 'react-router'

export default function Error() {
    const error = useRouteError()
    return <div>{error.message}</div>
}
~~~


















