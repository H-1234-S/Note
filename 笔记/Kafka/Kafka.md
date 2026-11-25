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


