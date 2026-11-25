Kafka 的主要设计目标是提供一个**可持久化的**、**高吞吐量的**、**容错的**消息传递系统。

Kafka 的设计还强调了分布式的特性，使得它可以在大规模集群中运行，处理大量数据和高并发的请求
# 架构

- Producer：生产者，消息的产生者，是消息的入口
	
- Broker：Broker 是 kafka 一个实例，每个服务器上有一个或多个 kafka 的实例，简单的理解就是一台 kafka 服务器，​​kafka cluster​​ 表示集群
	
- Topic：消息的主题，可以理解为消息队列，kafka的数据就保存在topic。在每个 broker 上都可以创建多个 topic 。
	
- Partition：Topic 的分区，每个 topic 可以有多个分区，分区的作用是做负载，提高 kafka 的吞吐量。同一个 topic 在不同的分区的数据是不重复的，partition 的表现形式就是一个一个的文件夹
	
- Message：每一条发送的消息主体。
	
- Consumer：消费者，即消息的消费方，是消息的出口。
	
- Consumer Group：我们可以将多个消费者组成一个消费者组，在 kafka 的设计中同一个分区的数据只能被消费者组中的某一个消费者消费。同一个消费者组的消费者可以消费同一个 topic 的不同分区的数据，这是为了提高kafka的吞吐量
	
- Zookeeper：kafka 集群依赖 zookeeper 来保存集群的的元信息，来保证系统的可用性

# docker

``` yml
services:
  kafka:
    image: apache/kafka:4.3.1
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      # KRaft 模式核心配置：单节点同时担任 broker 和 controller
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:9093'
      KAFKA_LISTENERS: 'PLAINTEXT://:9092,CONTROLLER://:9093'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    volumes:
      - kafka_data:/var/lib/kafka/data

volumes:
  kafka_data:
```

> 使用 Kafka 的 KRaft 模式，不需要额外部署 ZooKeeper。


## 镜像与容器

``` yaml
image: apache/kafka:4.3.1
container_name: kafka
```

- **`image`**：使用 Apache 官方维护的 Kafka 镜像，版本 `4.3.1`。这是目前较新的稳定版。
    
- **`container_name`**：给容器起个固定的名字叫 `kafka`，方便后续用 `docker logs kafka` 等命令直接操作，而不用查随机生成的 ID。
    
## 端口映射

``` yaml
ports:
  - "9092:9092"
```

- 将容器内部的 `9092` 端口（Kafka 对客户端提供服务的端口）映射到宿主机的 `9092` 端口。这样你本地的 Node.js 程序就能通过 `localhost:9092` 连上它。
    
## KRaft 模式配置

KRaft 模式是让 Kafka 在没有 ZooKeeper 的情况下也能运行。

``` yaml
KAFKA_NODE_ID: 1
```

- 给这个节点一个唯一 ID。在单节点环境下，`1` 就可以了。
    

``` yaml
KAFKA_PROCESS_ROLES: 'broker,controller'
```

- **关键配置**：指定这个节点同时扮演两个角色。
    
    - **`broker`**：负责存储消息、处理生产者和消费者的请求。
        
    - **`controller`**：负责集群管理（比如分区领导者选举）。在 KRaft 模式下，不再需要独立的 ZooKeeper 来承担这个职责。
        

``` yaml
KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:9093'
```

- 定义控制器选举的“投票者”列表。格式是 `节点ID@主机:端口`。
    
- 这里表示：节点 `1` 在 `kafka` 这个主机名（即容器自身）的 `9093` 端口上参与投票。因为只有一个节点，所以它自己就能形成“多数派”。
    

``` yaml
KAFKA_LISTENERS: 'PLAINTEXT://:9092,CONTROLLER://:9093'
```

- 定义 Kafka 要监听哪些网络接口和端口。
    
    - `PLAINTEXT://:9092`：在 `9092` 端口上监听，使用不加密的 PLAINTEXT 协议，供客户端（生产者/消费者）连接。
        
    - `CONTROLLER://:9093`：在 `9093` 端口上监听，专门用于 KRaft 控制器之间的内部通信（虽然这里是单节点，但端口仍需定义）。
        

``` yaml
KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092'
```

- **非常关键**：这是 Kafka **告诉客户端**应该用什么地址来连接它。
    
- 客户端第一次连接后，Kafka 会返回这个地址。对于你宿主机上的 Node.js 程序来说，`localhost:9092` 是正确的。如果这里写成容器内部的 `kafka:9092`，你的本地程序就会因为无法解析 `kafka` 这个主机名而连接失败。
    

``` yaml
KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
```

- 告诉 Kafka，哪个监听器的名字是用于控制器通信的。这里对应上面定义的 `CONTROLLER` 监听器（即 `9093` 端口）。
    

``` yaml
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
```

- 将监听器名称映射到安全协议。这里 `CONTROLLER` 和 `PLAINTEXT` 两个监听器都使用不加密的 `PLAINTEXT` 协议，简化了本地开发环境。
    

``` yaml
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
```

- Kafka 内部会创建一些主题（如 `__consumer_offsets` 用于记录消费者位移，`__transaction_state` 用于事务）。这两个配置指定这些内部主题的副本数为 `1`。
    
- 因为我们是**单节点**集群，副本数只能设为 `1`。如果设为大于 1 的数，Kafka 会因为找不到足够的 broker 来放置副本而报错。

# 基本使用

### Getting Started

```shell
npm install kafkajs
# yarn add kafkajs
```
### Usage

```js
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka1:9092', 'kafka2:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
  // Producing
  await producer.connect()
  await producer.send({
    topic: 'test-topic',
    messages: [
      { value: 'Hello KafkaJS user!' },
    ],
  })

  // Consuming
  await consumer.connect()
  // fromBeginning 为 true 表示从头开始；为 false 表示从最新开始
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      })
    },
  })
}
```

# 进阶使用



