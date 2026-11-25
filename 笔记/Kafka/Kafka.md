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
