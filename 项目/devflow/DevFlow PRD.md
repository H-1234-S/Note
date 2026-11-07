# DevFlow 产品需求文档（PRD）

> 版本：V1.0  
> 产品名称：DevFlow  
> 产品定位：面向开发者和小型开发团队的轻量级应用交付与运行管理平台  
> 文档状态：初稿  
> 核心技术方向：Next.js + NestJS + PostgreSQL + Redis + RabbitMQ + Docker + Nginx

---

# 1. 产品概述

## 1.1 产品背景

在现代软件开发过程中，开发者通常需要使用多种工具完成应用从开发到上线的整个生命周期：

- GitHub / GitLab：代码仓库管理。
    
- Docker：应用容器化。
    
- Nginx：反向代理和流量管理。
    
- CI/CD：自动化构建和部署。
    
- Prometheus / Grafana：运行指标监控。
    
- 日志平台：应用日志收集与检索。
    
- 告警工具：服务异常通知。
    

这些工具虽然功能成熟，但对于个人开发者和小型团队而言，往往存在以下问题：

1. 工具分散，需要在多个平台之间切换。
    
2. 服务器部署需要掌握 Docker、Nginx、Linux 等知识。
    
3. 部署失败后的问题定位和恢复比较困难。
    
4. 多个项目、多个环境缺少统一管理入口。
    
5. 应用运行状态、日志、监控和告警缺少统一视图。
    
6. 自建 CI/CD 系统存在一定的学习和维护成本。
    

DevFlow 希望将应用构建、部署、运行管理和可观测性整合到一个统一平台中，降低应用交付和运维管理的复杂度。

## 1.2 产品定位

DevFlow 是一个轻量级、自托管优先的应用交付与运行管理平台。

用户可以通过统一的 Web 控制台：

- 连接 GitHub 仓库。
    
- 创建和管理应用。
    
- 配置构建与部署流程。
    
- 将应用部署到自己的 Linux 服务器。
    
- 管理 Docker 容器和应用版本。
    
- 查看构建日志与运行日志。
    
- 查看应用运行指标。
    
- 配置异常告警。
    
- 对部署失败的版本进行回滚。
    

DevFlow 不试图在第一阶段替代 Kubernetes、Jenkins 或完整的云厂商基础设施，而是提供适合个人开发者和小型团队的轻量级交付能力。

## 1.3 产品目标

### 核心目标

1. 降低应用部署和服务器管理的门槛。
    
2. 实现从代码提交到应用上线的自动化流程。
    
3. 提供统一的应用、环境、版本和部署任务管理。
    
4. 提供基础的日志、监控和告警能力。
    
5. 保证部署任务的可靠执行与失败恢复。
    
6. 支持多用户、多组织和多服务器管理。
    

### 非目标

第一阶段暂不实现：

- 完整的 Kubernetes 集群管理。
    
- 自研 Docker 容器运行时。
    
- 完整的云计算资源管理平台。
    
- 通用 CI/CD 工作流编排引擎。
    
- 完整的 APM 商业级分析系统。
    
- 任意语言和任意环境下的无限制代码执行。
    
- 复杂的企业级多云管理。
    

---

# 2. 用户角色与使用场景

## 2.1 用户角色

### 个人开发者

需求：

- 部署自己的 Next.js、NestJS、Node.js 等项目。
    
- 管理多个应用。
    
- 查看部署日志。
    
- 配置域名和 HTTPS。
    
- 查看应用运行状态。
    
- 在部署失败时恢复到之前的版本。
    

### 小型开发团队

需求：

- 创建团队并邀请成员。
    
- 管理团队项目。
    
- 设置成员角色和操作权限。
    
- 多人协作部署应用。
    
- 查看部署操作历史。
    
- 监控团队应用运行情况。
    

### 团队管理员

需求：

- 管理组织成员。
    
- 管理服务器。
    
- 管理项目权限。
    
- 管理环境变量和密钥。
    
- 查看审计日志。
    
- 管理组织资源配额。
    

## 2.2 核心使用场景

场景一：用户首次部署应用。

1. 注册并登录 DevFlow。
    
2. 创建组织。
    
3. 创建项目。
    
4. 连接 GitHub。
    
5. 选择代码仓库和分支。
    
6. 配置构建命令。
    
7. 添加服务器。
    
8. 创建部署环境。
    
9. 点击部署。
    
10. 查看构建和部署日志。
    
11. 部署成功后访问应用。
    

场景二：代码提交后自动部署。

1. 用户配置 GitHub Webhook。
    
2. 用户向指定分支提交代码。
    
3. GitHub 向 DevFlow 发送 Webhook。
    
4. DevFlow 验证 Webhook 签名。
    
5. 创建部署记录。
    
6. 发布部署任务。
    
7. Worker 执行构建和部署。
    
8. 更新部署状态。
    
9. 通知用户部署结果。
    

场景三：部署失败后回滚。

1. 用户发现最新部署版本无法正常运行。
    
2. 用户进入部署历史。
    
3. 选择之前成功的部署版本。
    
4. 点击回滚。
    
5. DevFlow 创建回滚任务。
    
6. 恢复对应版本的镜像和运行配置。
    
7. 执行健康检查。
    
8. 切换流量。
    
9. 回滚完成。
    

---

# 3. 产品整体信息架构

## 3.1 页面结构

```
DevFlow
├── Dashboard
│   ├── Overview
│   ├── Applications
│   ├── Recent Deployments
│   └── System Overview
│
├── Projects
│   ├── Project List
│   ├── Project Detail
│   └── Project Settings
│
├── Applications
│   ├── Application Overview
│   ├── Deployments
│   ├── Build Configuration
│   ├── Environments
│   ├── Environment Variables
│   ├── Domains
│   ├── Logs
│   ├── Metrics
│   └── Settings
│
├── Servers
│   ├── Server List
│   ├── Server Detail
│   ├── Docker Containers
│   ├── Resource Metrics
│   └── Server Settings
│
├── Deployments
│   ├── Deployment History
│   ├── Deployment Detail
│   ├── Build Logs
│   ├── Deployment Logs
│   └── Rollback
│
├── Monitoring
│   ├── Application Metrics
│   ├── Server Metrics
│   ├── Alerts
│   └── Alert Rules
│
├── Organization
│   ├── Members
│   ├── Roles
│   ├── Invitations
│   ├── Audit Logs
│   └── Settings
│
└── Account
    ├── Profile
    ├── Security
    └── Connected Accounts
```

## 3.2 核心业务实体

- Organization：组织。
    
- User：用户。
    
- Project：项目。
    
- Application：应用。
    
- Environment：部署环境。
    
- Server：服务器。
    
- Deployment：部署记录。
    
- Build：构建记录。
    
- Container：容器实例。
    
- Domain：域名。
    
- EnvironmentVariable：环境变量。
    
- Log：日志记录。
    
- Metric：监控指标。
    
- AlertRule：告警规则。
    
- Notification：通知。
    
- AuditLog：审计日志。
    

---

# 4. 功能需求

优先级定义：

- P0：第一版必须完成。
    
- P1：核心版本迭代功能。
    
- P2：后续扩展功能。
    

## 4.1 用户认证与组织管理

## 4.1.1 用户认证

优先级：P0

支持：

- 邮箱注册。
    
- 邮箱登录。
    
- 邮箱验证。
    
- 密码修改。
    
- 密码重置。
    
- JWT Access Token。
    
- Refresh Token。
    
- 用户退出登录。
    

要求：

1. 用户邮箱必须唯一。
    
2. 密码必须安全哈希存储。
    
3. Refresh Token 必须支持轮换和撤销。
    
4. 登录接口需要限流。
    
5. 敏感操作需要重新验证身份。
    

## 4.1.2 组织管理

优先级：P0

支持：

- 创建组织。
    
- 修改组织名称。
    
- 删除组织。
    
- 查看组织成员。
    
- 邀请成员。
    
- 接受邀请。
    
- 移除成员。
    
- 修改成员角色。
    

初始角色：

|角色|权限|
|---|---|
|Owner|组织全部管理权限|
|Admin|组织和项目管理|
|Developer|应用开发、构建、部署|
|Viewer|只读查看|

要求：

- 每个业务资源必须具有明确的组织归属。
    
- 用户只能访问自己所属组织授权范围内的数据。
    
- 组织成员权限必须在服务端进行校验。
    
- 组织删除前必须进行二次确认。
    

## 4.1.3 审计日志

优先级：P1

记录以下操作：

- 用户登录。
    
- 组织创建和删除。
    
- 成员邀请和移除。
    
- 服务器添加和删除。
    
- 应用创建和删除。
    
- 环境变量修改。
    
- 部署和回滚。
    
- 权限修改。
    

每条审计记录至少包含：

- 操作用户。
    
- 操作类型。
    
- 目标资源。
    
- 操作时间。
    
- 操作结果。
    
- 请求 ID。
    
- 必要的操作上下文。
    

敏感信息不得写入审计日志。

---

## 4.2 项目管理

优先级：P0

## 4.2.1 创建项目

用户可以创建项目。

字段：

|字段|类型|说明|
|---|---|---|
|name|string|项目名称|
|description|string|项目描述|
|organizationId|UUID|所属组织|

功能：

- 创建项目。
    
- 修改项目。
    
- 删除项目。
    
- 查看项目详情。
    
- 查看项目关联应用。
    
- 查看项目部署历史。
    

## 4.2.2 项目与应用关系

一个项目可以包含多个应用。

例如：

```
E-commerce
├── Web
├── API
├── Admin
└── Worker
```

每个应用可以拥有独立的：

- Git 仓库配置。
    
- 构建配置。
    
- 部署环境。
    
- 环境变量。
    
- 域名。
    
- 部署记录。
    

---

## 4.3 应用管理

优先级：P0

## 4.3.1 创建应用

支持创建以下类型的应用：

第一阶段：

- Node.js 应用。
    
- Next.js 应用。
    
- NestJS 应用。
    
- Dockerfile 自定义应用。
    

后续扩展：

- Python 应用。
    
- Go 应用。
    
- 静态网站。
    
- Docker Compose 多容器应用。
    

应用字段：

|字段|类型|说明|
|---|---|---|
|name|string|应用名称|
|projectId|UUID|所属项目|
|sourceType|enum|Git / Dockerfile|
|repositoryUrl|string|仓库地址|
|branch|string|部署分支|
|buildCommand|string|构建命令|
|startCommand|string|启动命令|
|rootDirectory|string|项目根目录|
|dockerfilePath|string|Dockerfile 路径|
|port|integer|容器监听端口|

## 4.3.2 GitHub 仓库集成

优先级：P0

支持：

- 连接 GitHub 账号。
    
- 选择仓库。
    
- 选择分支。
    
- 查看仓库基本信息。
    
- 配置 Webhook。
    
- 接收 Push 事件。
    
- 手动触发部署。
    

安全要求：

- 验证 Webhook 签名。
    
- 防止重复处理相同事件。
    
- GitHub Token 必须加密存储。
    
- 只申请必要的仓库访问权限。
    

## 4.3.3 构建配置

优先级：P0

支持：

- 安装命令。
    
- 构建命令。
    
- 启动命令。
    
- 构建上下文。
    
- Dockerfile 路径。
    
- 构建环境变量。
    
- 构建超时时间。
    

第一阶段采用 Dockerfile 构建。

后续可以支持 Buildpacks。

## 4.3.4 应用删除

删除应用需要：

1. 二次确认。
    
2. 停止关联容器。
    
3. 清理应用代理配置。
    
4. 释放关联资源。
    
5. 保留或按用户选择清理历史部署记录。
    
6. 写入审计日志。
    

---

## 4.4 部署环境管理

优先级：P0

每个应用可以配置多个环境：

- Development。
    
- Staging。
    
- Production。
    

每个环境具有独立的：

- 环境变量。
    
- 部署分支。
    
- 服务器。
    
- 域名。
    
- 容器配置。
    
- 资源限制。
    

示例：

```
Application: NovaBase API

Development
├── Branch: develop
├── Server: dev-server
└── Domain: dev-api.example.com

Staging
├── Branch: staging
├── Server: staging-server
└── Domain: staging-api.example.com

Production
├── Branch: main
├── Server: production-server
└── Domain: api.example.com
```

要求：

- 不同环境的配置必须隔离。
    
- Production 环境的部署可以要求额外权限。
    
- 环境变量修改必须产生审计记录。
    
- 环境变量不得明文返回给前端。
    

---

## 4.5 服务器管理

优先级：P0

## 4.5.1 添加服务器

用户可以添加自己的 Linux 服务器。

第一阶段：

- Ubuntu。
    
- Debian。
    

服务器信息：

|字段|说明|
|---|---|
|name|服务器名称|
|hostname|主机名|
|ipAddress|服务器地址|
|sshPort|SSH 端口|
|operatingSystem|操作系统|
|status|连接状态|
|lastHeartbeatAt|最近心跳时间|

## 4.5.2 服务器连接方式

推荐采用独立 Deployment Agent 架构。

```
DevFlow Control Plane
        |
        | HTTPS / WSS
        |
Deployment Agent
        |
        ├── Docker Engine
        ├── Nginx
        ├── System Metrics
        └── Application Containers
```

Agent 安装在用户服务器上。

Agent 负责：

- 向控制平面注册。
    
- 定期发送心跳。
    
- 上报服务器指标。
    
- 接收经过授权的部署任务。
    
- 执行容器生命周期操作。
    
- 上报执行结果。
    
- 收集容器运行状态。
    

安全要求：

- Agent 必须具有独立身份凭证。
    
- 支持凭证轮换和撤销。
    
- 通信必须使用 TLS。
    
- 任务必须验证组织、服务器和应用归属。
    
- 不允许 API 任意执行未授权 Shell 命令。
    
- Agent 仅开放必要的 Docker 操作能力。
    
- 需要限制容器 CPU、内存和权限。
    

第一阶段可以使用受控 SSH 部署作为过渡，但生产设计应以 Agent 为长期方向。

## 4.5.3 服务器状态

服务器状态：

- Online。
    
- Offline。
    
- Unhealthy。
    
- Maintenance。
    

根据心跳时间和健康检查结果更新状态。

## 4.5.4 Docker 容器管理

支持：

- 查看容器。
    
- 查看容器状态。
    
- 启动容器。
    
- 停止容器。
    
- 重启容器。
    
- 查看容器日志。
    
- 查看容器资源使用情况。
    

所有容器操作必须经过组织权限和服务器归属校验。

---

## 4.6 构建与部署系统

优先级：P0

这是 DevFlow 的核心业务模块。

## 4.6.1 部署流程

```
GitHub Push / Manual Trigger
            |
            v
       Webhook API
            |
            v
     Validate Signature
            |
            v
   Create Deployment Record
            |
            v
      Publish Build Job
            |
            v
        Build Worker
            |
            v
    Clone Repository
            |
            v
    Build Docker Image
            |
            v
     Push / Store Image
            |
            v
       Deploy Worker
            |
            v
      Start Container
            |
            v
       Health Check
            |
            v
       Switch Traffic
            |
            v
       Deployment Success
```

## 4.6.2 部署状态机

```
PENDING
   |
   v
QUEUED
   |
   v
BUILDING
   |
   v
BUILT
   |
   v
DEPLOYING
   |
   v
HEALTH_CHECKING
   |
   v
SUCCEEDED
```

失败路径：

```
BUILDING / DEPLOYING / HEALTH_CHECKING
                    |
                    v
                  FAILED
                    |
          +---------+---------+
          |                   |
          v                   v
       RETRYING             CANCELLED
```

补充状态：

- PENDING：等待处理。
    
- QUEUED：已进入任务队列。
    
- BUILDING：正在构建。
    
- BUILT：镜像构建成功。
    
- DEPLOYING：正在部署。
    
- HEALTH_CHECKING：健康检查中。
    
- SUCCEEDED：部署成功。
    
- FAILED：部署失败。
    
- RETRYING：等待重试。
    
- CANCELLED：任务已取消。
    
- ROLLING_BACK：正在回滚。
    
- ROLLED_BACK：回滚成功。
    

状态更新必须经过合法状态转换校验，不能随意覆盖。

## 4.6.3 部署任务

每次部署创建独立的 Deployment 记录。

至少包含：

- deploymentId。
    
- applicationId。
    
- environmentId。
    
- commitSha。
    
- imageTag。
    
- triggerType。
    
- status。
    
- startedAt。
    
- finishedAt。
    
- duration。
    
- errorMessage。
    
- retryCount。
    

要求：

1. 每次部署必须有唯一 ID。
    
2. 相同 Webhook 事件不得重复创建有效部署任务。
    
3. 每个环境支持部署并发策略。
    
4. 生产环境默认不允许同一应用的部署任务并行执行。
    
5. 用户可以取消尚未执行或允许取消的任务。
    
6. 已经进入不可中断阶段的任务必须定义安全取消行为。
    
7. Worker 必须支持异常退出后的任务恢复。
    
8. 部署结果必须持久化。
    

## 4.6.4 构建镜像

第一阶段：

- Clone Git Repository。
    
- 检出指定 Commit。
    
- 使用 Dockerfile 构建镜像。
    
- 镜像使用 Commit SHA 标记。
    
- 保存构建结果。
    

要求：

- 不允许不同版本共用不可区分的镜像标签。
    
- 构建失败必须保存日志。
    
- 构建任务必须具有超时限制。
    
- 必须限制 CPU、内存和磁盘使用。
    
- 构建环境与控制平面隔离。
    
- 不可信构建脚本不得直接在 API 进程中执行。
    

## 4.6.5 部署应用

部署步骤：

1. 获取构建成功的镜像。
    
2. 生成容器运行配置。
    
3. 创建新容器。
    
4. 注入环境变量。
    
5. 检查容器启动状态。
    
6. 执行健康检查。
    
7. 更新代理配置。
    
8. 切换流量。
    
9. 验证应用可用。
    
10. 清理旧容器。
    

第一阶段采用新容器启动成功后再切换流量的方式。

后续支持：

- 滚动部署。
    
- 蓝绿部署。
    
- 金丝雀发布。
    

## 4.6.6 健康检查

支持：

- HTTP 健康检查。
    
- TCP 端口检查。
    
- 自定义健康检查路径。
    
- 检查超时时间。
    
- 检查重试次数。
    

如果新容器未通过健康检查：

- 不允许切换生产流量。
    
- 标记部署失败。
    
- 清理失败容器。
    
- 保留之前正常运行的版本。
    

## 4.6.7 部署回滚

优先级：P1

用户可以选择历史成功版本进行回滚。

回滚流程：

1. 查询历史成功部署记录。
    
2. 验证镜像是否存在。
    
3. 创建新的回滚任务。
    
4. 启动目标版本容器。
    
5. 执行健康检查。
    
6. 切换流量。
    
7. 记录回滚结果。
    

注意：

回滚应用镜像不等于回滚数据库。

数据库迁移必须遵循向前兼容原则，避免旧版本代码无法读取新版本数据库结构。

---

## 4.7 实时日志系统

优先级：P1

## 4.7.1 日志类型

支持：

- Build Logs：构建日志。
    
- Deploy Logs：部署日志。
    
- Container Logs：容器运行日志。
    
- Agent Logs：Agent 执行日志。
    

## 4.7.2 日志展示

用户可以：

- 实时查看日志。
    
- 查看历史日志。
    
- 按时间筛选。
    
- 按日志级别筛选。
    
- 搜索关键词。
    
- 下载日志。
    
- 查看错误上下文。
    

日志级别：

- DEBUG。
    
- INFO。
    
- WARN。
    
- ERROR。
    

## 4.7.3 实时传输

推荐使用 SSE 作为第一阶段日志流传输方式。

```
Worker
  |
  v
Log Event
  |
  v
Log Processing
  |
  +----> Persistent Storage
  |
  +----> Redis Pub/Sub
             |
             v
          NestJS SSE
             |
             v
         Dashboard
```

要求：

- 日志必须有来源标识。
    
- 日志必须包含时间戳。
    
- 日志需要关联 deploymentId。
    
- 前端断线后可以重新连接。
    
- 重连后支持根据日志游标补齐遗漏数据。
    
- 日志存储设置保留期限。
    
- 必须限制日志大小和流量，避免资源耗尽。
    

Redis Pub/Sub 只负责实时通知，不作为日志持久化来源。

---

## 4.8 监控系统

优先级：P1

## 4.8.1 服务器监控

采集：

- CPU 使用率。
    
- 内存使用率。
    
- 磁盘使用率。
    
- 网络流量。
    
- 系统负载。
    
- Agent 心跳。
    

## 4.8.2 应用监控

采集：

- 应用运行状态。
    
- 容器 CPU 使用率。
    
- 容器内存使用率。
    
- 容器重启次数。
    
- HTTP 请求量。
    
- HTTP 错误率。
    
- 请求响应时间。
    

## 4.8.3 监控图表

支持：

- 最近 15 分钟。
    
- 最近 1 小时。
    
- 最近 6 小时。
    
- 最近 24 小时。
    
- 最近 7 天。
    

第一阶段可以通过 Prometheus 采集和存储指标，不必自研时间序列数据库。

---

## 4.9 告警系统

优先级：P1

## 4.9.1 告警规则

用户可以创建告警规则。

示例：

|监控项|条件|持续时间|
|---|---|---|
|CPU|大于 80%|5 分钟|
|Memory|大于 90%|3 分钟|
|Disk|大于 85%|5 分钟|
|HTTP 5xx|错误率大于 5%|5 分钟|
|Application|服务不可用|立即|

## 4.9.2 告警状态

- FIRING：告警触发。
    
- RESOLVED：告警恢复。
    
- SILENCED：告警被静默。
    

## 4.9.3 通知渠道

第一阶段：

- 邮件。
    

后续：

- Webhook。
    
- Telegram。
    
- Slack。
    
- 企业微信。
    

## 4.9.4 告警防抖

要求：

- 支持持续时间判断。
    
- 避免同一告警重复通知。
    
- 支持告警恢复通知。
    
- 支持静默时间。
    
- 支持告警聚合。
    

---

## 4.10 域名与 Nginx 管理

优先级：P1

## 4.10.1 域名管理

用户可以：

- 添加自定义域名。
    
- 绑定应用。
    
- 绑定环境。
    
- 查看 DNS 配置要求。
    
- 验证域名所有权。
    
- 删除域名。
    

## 4.10.2 Nginx 配置

DevFlow 根据应用配置生成反向代理配置。

例如：

```
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

要求：

- 配置必须经过语法验证。
    
- 配置变更必须有版本记录。
    
- 配置错误不得覆盖当前有效配置。
    
- 配置更新必须支持安全 reload。
    
- 支持 WebSocket 代理。
    
- 支持 HTTPS。
    

## 4.10.3 HTTPS

后续支持 Let's Encrypt 自动证书申请和续期。

---

# 5. 核心业务流程

## 5.1 自动部署流程

```
flowchart TD
    A[GitHub Push] --> B[Webhook API]
    B --> C{签名验证}
    C -->|失败| D[拒绝请求]
    C -->|成功| E[事件去重]
    E --> F[创建 Deployment]
    F --> G[写入 Outbox]
    G --> H[消息发布器]
    H --> I[RabbitMQ]
    I --> J[Build Worker]
    J --> K{构建成功?}
    K -->|否| L[记录失败]
    K -->|是| M[生成镜像]
    M --> N[Deploy Worker]
    N --> O[启动新容器]
    O --> P{健康检查}
    P -->|失败| Q[清理新容器]
    P -->|成功| R[切换 Nginx 流量]
    R --> S[部署成功]
```

## 5.2 部署失败恢复

系统必须考虑：

- Worker 意外退出。
    
- RabbitMQ 短暂不可用。
    
- Docker 构建失败。
    
- 容器启动失败。
    
- 健康检查超时。
    
- Nginx 配置失败。
    
- 服务器离线。
    
- 网络连接中断。
    

要求：

1. 任务失败必须留下可追踪记录。
    
2. 可重试错误与不可重试错误需要区分。
    
3. 重试采用指数退避策略。
    
4. 重试次数必须有上限。
    
5. 超过上限进入死信或人工处理流程。
    
6. 任务恢复不得造成重复部署。
    
7. 任务执行需要支持幂等性。
    
8. 必须记录每一步的执行结果。
    

---

# 6. 数据库设计初步规划

数据库使用 PostgreSQL，ORM 第一阶段采用 Drizzle ORM。

核心数据表：

|表名|作用|
|---|---|
|users|用户|
|organizations|组织|
|organization_members|组织成员|
|organization_invitations|成员邀请|
|projects|项目|
|applications|应用|
|environments|部署环境|
|servers|服务器|
|server_credentials|服务器凭证|
|deployments|部署记录|
|deployment_steps|部署步骤|
|builds|构建记录|
|containers|容器实例|
|domains|域名|
|environment_variables|环境变量|
|webhooks|Webhook 配置|
|webhook_events|Webhook 事件去重|
|outbox_events|Outbox 事件|
|alert_rules|告警规则|
|alert_events|告警事件|
|notifications|通知|
|audit_logs|审计日志|

## 6.1 关键关系

```
Organization
    |
    +---- Organization Members
    |
    +---- Projects
              |
              +---- Applications
                        |
                        +---- Environments
                        |         |
                        |         +---- Deployments
                        |         |
                        |         +---- Domains
                        |         |
                        |         +---- Environment Variables
                        |
                        +---- Builds

Organization
    |
    +---- Servers
              |
              +---- Containers
              |
              +---- Metrics
```

## 6.2 数据设计原则

- 主键优先使用 UUID。
    
- 业务表必须明确组织归属。
    
- 外键约束保证引用完整性。
    
- 高频查询字段建立合适索引。
    
- 部署历史和审计记录需要考虑数据保留。
    
- 重要状态变更使用事务。
    
- 不在数据库中明文保存密码、Token 和私钥。
    
- 环境变量采用加密存储。
    
- 不允许仅依赖前端进行租户隔离。
    

---

# 7. 技术架构要求

## 7.1 技术栈

### 前端

- Next.js App Router。
    
- React。
    
- TypeScript。
    
- Tailwind CSS。
    
- shadcn/ui。
    
- TanStack Query。
    

### 后端

- NestJS。
    
- TypeScript。
    
- Drizzle ORM。
    
- PostgreSQL。
    
- Redis。
    
- RabbitMQ。
    

### 基础设施

- Docker。
    
- Docker Compose。
    
- Nginx。
    
- Linux。
    
- Prometheus。
    
- OpenTelemetry。
    
- Grafana。
    

### 工程化

- pnpm Monorepo。
    
- Turborepo。
    
- GitHub Actions。
    
- Vitest。
    
- Supertest。
    
- Testcontainers。
    

## 7.2 第一阶段架构

采用模块化单体架构。

```
apps/
├── web/
├── api/
└── worker/

packages/
├── shared/
├── database/
├── config/
└── logger/

infrastructure/
├── docker/
├── nginx/
├── prometheus/
└── grafana/
```

说明：

- web：管理控制台。
    
- api：NestJS 业务 API。
    
- worker：异步任务消费者。
    
- shared：共享类型、常量和 DTO。
    
- database：数据库 Schema、迁移和连接。
    
- infrastructure：基础设施配置。
    

API 与 Worker 可以共享业务模块，但必须明确运行职责。

## 7.3 基础设施职责

### PostgreSQL

负责：

- 用户与组织。
    
- 项目与应用。
    
- 部署记录。
    
- 服务器信息。
    
- 环境配置。
    
- 任务状态。
    
- 审计记录。
    

### Redis

负责：

- 缓存。
    
- 分布式锁。
    
- API 限流。
    
- 临时状态。
    
- 实时日志事件分发。
    

Redis 不作为关键业务数据的唯一持久化来源。

### RabbitMQ

负责：

- 构建任务。
    
- 部署任务。
    
- 日志处理任务。
    
- 告警通知任务。
    
- 异步事件处理。
    

必须实现：

- Publisher Confirms。
    
- Consumer Acknowledgements。
    
- 重试策略。
    
- Dead Letter Exchange。
    
- 消费幂等。
    
- 消息持久化。
    

### Nginx

负责：

- API 反向代理。
    
- Web 应用代理。
    
- HTTPS。
    
- 应用流量转发。
    
- WebSocket / SSE 代理。
    
- 部署版本切换。
    

### Docker

负责：

- 应用构建。
    
- 镜像管理。
    
- 容器运行。
    
- 资源限制。
    
- 网络隔离。
    

---

# 8. 非功能需求

## 8.1 安全性

- 所有 API 必须进行身份认证和权限校验。
    
- 多租户资源必须进行组织归属验证。
    
- 密码使用安全哈希算法。
    
- Token 和密钥加密存储。
    
- Webhook 必须验证签名。
    
- 对登录和高风险接口进行限流。
    
- 所有敏感操作记录审计日志。
    
- 防止命令注入和路径穿越。
    
- 构建环境必须隔离。
    
- 限制 Docker 容器权限和资源。
    
- Agent 必须支持身份验证、授权和凭证撤销。
    

## 8.2 可靠性

- 部署任务必须持久化。
    
- Worker 支持异常退出和恢复。
    
- 消息消费必须具有幂等性。
    
- 关键事件采用 Outbox Pattern。
    
- 关键操作必须有超时控制。
    
- 失败任务支持重试。
    
- 部署失败不能影响当前正常运行的版本。
    
- Nginx 配置切换必须具备回滚能力。
    

## 8.3 性能

第一阶段建议目标：

- 常规 API P95 响应时间小于 300ms（不包含构建、部署等长任务）。
    
- Dashboard 常规查询 P95 小于 500ms。
    
- 日志实时展示延迟目标小于 2 秒。
    
- 系统支持多个并发部署任务。
    
- 所有长时间操作采用异步任务执行。
    
- 大量日志必须支持批量处理。
    

以上是开发目标，需要通过实际压测验证，不是已经实现的性能承诺。

## 8.4 可观测性

系统自身也需要监控：

- API 请求量。
    
- API 响应时间。
    
- HTTP 错误率。
    
- PostgreSQL 连接池。
    
- Redis 状态。
    
- RabbitMQ 消息积压。
    
- Worker 执行情况。
    
- 任务失败率。
    
- Agent 在线率。
    

每次请求和任务需要尽可能关联：

- Request ID。
    
- Trace ID。
    
- Deployment ID。
    
- Organization ID。
    

---

# 9. 版本迭代规划

采用渐进式开发，优先完成可运行、可验证的产品闭环。

## V1.0：基础应用部署平台

目标：用户能够通过 DevFlow 将 GitHub 项目部署到自己的 Linux 服务器。

功能：

- 用户注册与登录。
    
- 组织管理。
    
- 成员与基础 RBAC。
    
- 项目管理。
    
- 应用管理。
    
- GitHub 仓库连接。
    
- Dockerfile 构建。
    
- 服务器添加。
    
- 基础部署任务。
    
- Docker 容器管理。
    
- 部署历史。
    
- 基础构建日志。
    
- Docker Compose 部署。
    
- Nginx 反向代理。
    

验收标准：

1. 用户可以创建组织和项目。
    
2. 用户可以连接 GitHub 仓库。
    
3. 用户可以选择分支并发起部署。
    
4. 系统可以构建 Docker 镜像。
    
5. 系统可以启动目标容器。
    
6. 用户可以访问部署后的应用。
    
7. 用户可以查看部署日志和结果。
    
8. 用户可以停止和重启应用。
    

## V1.5：自动化部署与可靠任务系统

目标：实现稳定的异步构建和部署。

功能：

- GitHub Webhook。
    
- 自动部署。
    
- RabbitMQ。
    
- Redis。
    
- Worker。
    
- Outbox Pattern。
    
- 消息幂等。
    
- 失败重试。
    
- 死信队列。
    
- 任务取消。
    
- 任务恢复。
    
- 部署状态机。
    
- 部署并发控制。
    

验收标准：

1. Push 事件可以自动触发部署。
    
2. 重复 Webhook 不会重复创建有效任务。
    
3. Worker 重启后任务可以恢复或进入明确的失败状态。
    
4. 消息重复消费不会产生重复部署副作用。
    
5. 失败任务按照规则重试。
    
6. 超过重试上限的任务能够被人工检查和处理。
    

## V2.0：应用运行管理

目标：提供完整的应用运行管理能力。

功能：

- 多环境管理。
    
- 环境变量管理。
    
- 自定义域名。
    
- HTTPS。
    
- 应用健康检查。
    
- 部署回滚。
    
- 实时容器日志。
    
- 服务器指标。
    
- 应用运行指标。
    
- 邮件告警。
    
- 审计日志。
    

验收标准：

1. 一个应用可以管理多个环境。
    
2. 不同环境的配置相互隔离。
    
3. 用户可以绑定自定义域名。
    
4. 用户可以查看服务器与应用指标。
    
5. 用户可以回滚至历史成功版本。
    
6. 应用异常能够触发告警。
    

## V3.0：多服务器与高级部署

目标：支持更加复杂的生产部署场景。

功能：

- Deployment Agent。
    
- 多服务器管理。
    
- 服务器健康检查。
    
- 滚动部署。
    
- 蓝绿部署。
    
- 部署流量切换。
    
- 资源配额。
    
- 服务器调度。
    
- 多实例部署。
    

## V4.0：平台化与可观测性

目标：将 DevFlow 演进成完整的轻量级开发交付平台。

功能：

- Prometheus 指标采集。
    
- OpenTelemetry。
    
- 分布式链路追踪。
    
- 日志检索。
    
- 告警规则引擎。
    
- 告警聚合与静默。
    
- Webhook 通知。
    
- 使用量统计。
    
- 组织资源配额。
    
- API Key。
    
- 开放 API。
    
- CLI 工具。
    

---

# 10. 测试要求

## 10.1 单元测试

覆盖：

- 认证服务。
    
- RBAC 权限。
    
- 项目管理。
    
- 应用管理。
    
- 部署状态转换。
    
- 任务重试策略。
    
- 环境变量加密。
    
- 告警规则判断。
    

## 10.2 集成测试

覆盖：

- PostgreSQL 事务。
    
- Redis 锁。
    
- RabbitMQ 消息发布与消费。
    
- Webhook 签名验证。
    
- Docker 构建和运行。
    
- Nginx 配置验证。
    

## 10.3 E2E 测试

至少覆盖：

1. 用户注册和登录。
    
2. 创建组织。
    
3. 创建项目。
    
4. 创建应用。
    
5. 连接仓库。
    
6. 触发部署。
    
7. 构建成功。
    
8. 应用启动。
    
9. 健康检查。
    
10. 部署失败。
    
11. 历史版本回滚。
    

## 10.4 故障测试

必须验证：

- Worker 意外退出。
    
- RabbitMQ 不可用。
    
- Redis 不可用。
    
- PostgreSQL 短暂断开。
    
- Docker 构建失败。
    
- 容器启动失败。
    
- 健康检查失败。
    
- Nginx 配置验证失败。
    
- Agent 离线。
    

---

# 11. 产品成功指标

第一阶段重点观察：

|指标|目标|
|---|---|
|部署成功率|持续监控并逐步提升|
|部署任务重复执行率|关键副作用不重复|
|部署失败恢复能力|有明确恢复或人工处理路径|
|部署日志完整性|每个任务均可追踪|
|应用可用性|能通过健康检查验证|
|用户部署完成率|用户能够独立完成首次部署|
|资源使用情况|能识别异常资源消耗|

这些指标需要在实际使用和压测后确定具体数值。

---

# 12. 第一阶段开发边界

为了避免项目范围失控，第一阶段必须严格控制范围。

## 必须实现

- 用户认证。
    
- 组织管理。
    
- RBAC。
    
- 项目管理。
    
- 应用管理。
    
- GitHub 仓库连接。
    
- Dockerfile 构建。
    
- Linux 服务器部署。
    
- Docker 容器管理。
    
- 部署记录。
    
- 构建日志。
    
- Nginx 反向代理。
    

## 暂缓实现

- Kubernetes。
    
- 多云资源管理。
    
- 蓝绿部署。
    
- 金丝雀发布。
    
- 完整 APM。
    
- 复杂告警规则引擎。
    
- AI 自动修复。
    
- 商业计费系统。
    
- 大规模微服务拆分。
    

## 第一阶段最终验收目标

用户能够完成以下完整流程：

```
注册 DevFlow
    ↓
创建组织
    ↓
创建项目
    ↓
连接 GitHub
    ↓
创建应用
    ↓
配置 Dockerfile
    ↓
添加 Linux 服务器
    ↓
发起部署
    ↓
构建 Docker 镜像
    ↓
启动应用容器
    ↓
配置 Nginx
    ↓
访问应用
    ↓
查看部署日志
    ↓
管理容器
```

**V1.0 的核心不是技术栈数量，而是完整打通从代码仓库到真实服务器应用运行的链路。**

---

# 13. 项目设计原则

1. 优先保证业务闭环，不为了技术复杂度强行引入组件。
    
2. 第一阶段采用模块化单体，后续根据业务边界演进。
    
3. 所有长时间操作采用异步任务。
    
4. 关键任务状态必须持久化。
    
5. 消息队列必须考虑重复投递和消费失败。
    
6. 部署操作必须可追踪、可恢复。
    
7. 任何涉及用户代码执行的环节都必须进行安全隔离。
    
8. 所有组织资源必须经过服务端权限校验。
    
9. 基础设施操作必须具有明确的超时、重试和错误处理策略。
    
10. 每个重要功能都需要对应测试和可验证的验收标准。
    

**最终产品愿景：让开发者可以在一个平台上完成应用的构建、部署、运行管理和问题定位。**