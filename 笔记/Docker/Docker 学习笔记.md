# Docker

把项目运行所需要的环境和步骤统一起来




# Docker Compose

Docker Compose 本质上是一个**声明式**的编排工具。

不需要写脚本去一步步启动容器，而是通过一个名为 `compose.yaml`（或 `docker-compose.yml`）的文件，描述清楚整个应用由哪些服务组成，以及它们各自的配置

## 作用

只需在项目目录下运行 `docker compose up`，Compose 就会根据配置文件自动创建网络、挂载卷、并按依赖顺序启动所有容器。停止时也只需 `docker compose down`。

Compose 会为你的项目创建一个独立的隔离环境（基于项目名）。意味着可以在同一台机器上跑多套互不干扰的应用环境。

## 语法

Docker Compose 的语法基于 **YAML** 格式，核心结构围绕三个顶层元素展开：`services`（服务）、`networks`（网络）和 `volumes`（数据卷）。

> **核心骨架：**

``` yaml
services:      # 必填：定义应用包含的各个容器
  web:
    # 服务配置写在这里
  db:
    # 另一个服务

networks:      # 可选：自定义网络
  frontend:

volumes:       # 可选：命名数据卷
  db-data:
```

> 每个服务代表一个容器，常用指令如下：

|指令|作用|示例|
|---|---|---|
|`image`|指定使用的镜像|`image: nginx:1.25-alpine`|
|`build`|从 Dockerfile 构建镜像|`build: .` 或 `build: {context: ., dockerfile: Dockerfile.dev}`|
|`ports`|映射主机端口到容器|`"8080:80"`（主机:容器）|
|`volumes`|挂载数据卷或目录|`./html:/usr/share/nginx/html:ro`|
|`environment`|设置环境变量|`- DEBUG=true` 或 `KEY: value`|
|`depends_on`|控制启动顺序|`- db`（简单顺序）或配合 `condition` 使用|
|`command`|覆盖镜像默认命令|`python app.py`|

> **变量替换：**

Compose 支持在 YAML 中使用 `${VAR}` 引用变量，配合项目根目录下的 `.env` 文件使用。

例如 `.env` 中写 `TAG=v1.5`，在 compose 文件中写 `image: "webapp:${TAG}"`，执行 `docker compose up` 时会自动替换为 `webapp:v1.5`。

# Dockerfile

**Dockerfile 是一个文本文件，用来描述如何构建 Docker 镜像（Image）**

其实就是**自动化环境构建**；不用手动一步步敲命令（装系统、装依赖、拷代码、配环境），Dockerfile 把这些步骤固化成文件

> 例如，告诉 Docker：

1. 使用 Node.js 24 作为基础环境。
    
2. 把项目代码复制到容器中。
    
3. 安装项目依赖。
    
4. 编译 TypeScript。
    
5. 启动 NestJS 服务。
    

Docker 就会按照 Dockerfile 中的指令，一步一步构建出一个 Docker Image。

## 示例

> 假设项目结构如下：

```
my-nest-app/
├── src/
│   ├── main.ts
│   └── app.module.ts
├── package.json
├── pnpm-lock.yaml
├── nest-cli.json
├── tsconfig.json
└── Dockerfile
```

正常情况下，你在本地运行项目可能需要：

``` bash
# 安装依赖
pnpm install

# 编译 TypeScript
pnpm build

# 启动项目
pnpm start:prod
```

现在希望 Docker 自动完成这些操作。
## **编写 Dockerfile**

``` Dockerfile
# 1. 指定基础镜像
FROM node:24-alpine

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 复制依赖描述文件
COPY package.json pnpm-lock.yaml ./

# 4. 启用 pnpm
RUN corepack enable

# 5. 安装项目依赖
RUN pnpm install --frozen-lockfile

# 6. 复制剩余项目代码
COPY . .

# 7. 编译 NestJS 项目
RUN pnpm build

# 8. 声明容器对外提供的端口
EXPOSE 3000

# 9. 容器启动时执行的命令
CMD ["node", "dist/main.js"]
```

## 指令详解

**① FROM：指定基础镜像**

```
FROM node:24-alpine
```

Docker 镜像可以基于其他镜像构建。这里使用官方提供的 Node.js 24 Alpine 镜像。

它已经包含：

- Linux Alpine 操作系统环境。
    
- Node.js 24。
    
- npm。
    

也就是说，不需要自己在容器里安装 Node.js。

**② WORKDIR：设置工作目录**

```
WORKDIR /app
```

相当于在容器内部执行：

```
mkdir -p /app
cd /app
```

后续 Dockerfile 中的相对路径，默认都以 `/app` 为基础。

**③ COPY：复制文件**

```
COPY package.json pnpm-lock.yaml ./
```

将本地项目中的两个文件复制到容器的 `/app` 目录。

例如：

```
本地项目：
my-nest-app/
├── package.json
└── pnpm-lock.yaml

容器内部：
/app/
├── package.json
└── pnpm-lock.yaml
```

**④ RUN：执行构建命令**

```
RUN corepack enable

RUN pnpm install --frozen-lockfile
```

`RUN` 的作用是：在构建镜像的过程中执行命令。

这里：

- `corepack enable`：启用 Corepack，以便使用 pnpm。
    
- `pnpm install`：安装项目依赖。
    
- `--frozen-lockfile`：严格按照锁文件安装，不允许自动修改锁文件。
    

注意：`RUN` 是构建阶段执行，不是每次启动容器都会执行。

**⑤ COPY：复制剩余代码**

```
COPY . .
```

把本地项目的剩余文件复制到容器的 `/app` 中。

**⑥ RUN：编译项目**

```
RUN pnpm build
```

执行 NestJS 的编译命令，将 TypeScript 编译为 JavaScript。

例如：

```
src/
├── main.ts
└── app.module.ts

编译后：

dist/
├── main.js
└── app.module.js
```

**⑦ EXPOSE：声明端口**

```
EXPOSE 3000
```

表示该容器中的应用预计使用 3000 端口。

注意：它只是声明端口，并不会自动将容器端口映射到宿主机。

**⑧ CMD：指定容器启动命令**

```
CMD ["node", "dist/main.js"]
```

当容器启动时，执行：

```
node dist/main.js
```

这时 NestJS 服务就运行起来了。

## 如何使用 Dockerfile

现在我们已经编写好了 Dockerfile，接下来使用 Docker 构建镜像。

**第一步：构建镜像**

在项目根目录执行：

```
docker build -t my-nest-app .
```

解释一下：

|参数|作用|
|---|---|
|`docker build`|构建镜像|
|`-t my-nest-app`|给镜像命名|
|`.`|指定构建上下文为当前目录|

Docker 会读取当前目录下的 Dockerfile，并按照指令构建镜像。

**第二步：查看镜像**

```
docker images
```

你会看到类似：

```
REPOSITORY    TAG       IMAGE ID
my-nest-app   latest    abc123
```

**第三步：运行容器**

```
docker run -d \
  --name my-nest-container \
  -p 3000:3000 \
  my-nest-app
```

这里有一个非常重要的参数：

```
-p 3000:3000
宿主机端口:容器端口
```

意味着：

```
浏览器
  |
  | localhost:3000
  ↓
宿主机 3000 端口
  |
  ↓
容器 3000 端口
  |
  ↓
NestJS 服务
```

现在访问：

```
http://localhost:3000
```

就可以访问容器中的 NestJS 服务了。

## 注意

**Docker 缓存机制**

为什么 Dockerfile 先复制 `package.json`，再安装依赖，最后才复制源代码？

因为 Docker 构建镜像时会利用缓存。假设只修改了 `src/main.ts`：

```
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build
```

由于依赖文件没有改变，Docker 可以复用之前的依赖安装层，不必重新安装所有依赖。

这可以显著提高构建速度。

**.dockerignore 文件**

类似于 `.gitignore`，用于排除不需要发送到 Docker 构建上下文中的文件。

例如：

```
node_modules
dist
.git
.env
.env.*
```

避免把本地依赖、Git 历史以及敏感环境变量等不必要的内容复制进去。