**生产者：** 产生消息的服务

**消费者：** 等待接收消息的程序

**队列：** 用于存储消息的容器；队列的容量受主机内存和磁盘空间的限制，本质上就是一个大型的消息缓冲区

许多生产者可以将消息发送到同一个队列中，而许多消费者也可以尝试从同一个队列中接收数据。


> **AMQP(高级消息队列协议)** 实现了对于消息的排序，点对点通讯，和发布订阅，保持可靠性、保证安全性。
# 架构

- 消息：在RabbitMQ中，消息是传递的基本单元。它由消息体和可选的属性组成
    
- 生产者Producer：生产者是消息的发送方，它将消息发送到RabbitMQ的交换器（Exchange）中
    
- 交换器Exchange：交换器接收从生产者发送的消息，并根据特定的规则将消息路由到一个或多个队列中
    
- 队列Queue：队列是消息的接收方，它存储了待处理的消息。消费者可以从队列中获取消息并进行处理
    
- 消费者Consumer：消费者是消息的接收方，它从队列中获取消息并进行处理
    
# 基本使用

点对点基本使用，不需要交换机

> **安装：**

``` bash
npm install amqplib
```

> `docker compose`：

``` yml
services:
  rabbitmq:
    image: rabbitmq:4-management
    container_name: rabbitmq
    ports:
      - "5672:5672" # AMQP 协议端口，amqplib 必须连接这个
      - "15672:15672" # 管理后台端口
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
```

运行 `docker compose up` 启动

> **生产者：**

``` js
import express from "express";
import amqplib from "amqplib";

// 初始化 amqplib
const connection = await amqplib.connect("amqp://admin:admin@localhost:5672");
const channel = await connection.createChannel();
const queueName = "task_name";

const app = express();

app.get("/send", (req, res) => {
  const message = req.query.message;

  //发送消息
  channel.sendToQueue(queueName, Buffer.from(message), {
    persistent: true, //持久化消息
  });

  res.send("send message success");
});

app.listen(3000, (error) => {
  console.log("start 3000 producer");
});
```

`persistent` 本质上就是将消息**存储在磁盘中**

> **消费者：**

``` js
import amqplib from "amqplib";
const connection = await amqplib.connect("amqp://admin:admin@localhost:5672");
const channel = await connection.createChannel();
const queueName = "task_name";

//连接队列
await channel.assertQueue(queueName, {
  durable: true, //队列持久化
});

//消息者监听器
channel.consume(queueName, (msg) => {
  console.log(`[x] Received ${msg.content.toString()}`);
  channel.ack(msg); //确认消费该消息
});
```

# 进阶使用

**发布订阅**就是生产者的消息通过交换机写到多个队列，不同的订阅者消费不同的队列，也就是实现了**一对多**

发布订阅的模式分为四种：

1. Direct（直连）模式：把消息放到交换机指定`key`的队列里面。
    
2. Topic（主题）模式： 把消息放到交换机指定`key`的队列里面，额外增加使用"*"匹配一个单词或使用"#"匹配多个单词
    
3. Headers（头部）模式：把消息放到交换机头部属性去匹配队列
    
4. Fanout（广播）模式：把消息放入交换机所有的队列，实现广播
    
