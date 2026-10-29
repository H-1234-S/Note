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

