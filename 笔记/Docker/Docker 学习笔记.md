# Docker Compose

Docker Compose 本质上是一个**声明式**的编排工具。

不需要写脚本去一步步启动容器，而是通过一个名为 `compose.yaml`（或 `docker-compose.yml`）的文件，描述清楚整个应用由哪些服务组成，以及它们各自的配置

## 作用

只需在项目目录下运行 `docker compose up`，Compose 就会根据配置文件自动创建网络、挂载卷、并按依赖顺序启动所有容器。停止时也只需 `docker compose down`。

Compose 会为你的项目创建一个独立的隔离环境（基于项目名）。