**生产者：** 产生消息的服务

**消费者：** 等待接收消息的程序

**队列：** 用于存储消息的容器；队列的容量受主机内存和磁盘空间的限制，本质上就是一个大型的消息缓冲区

许多生产者可以将消息发送到同一个队列中，而许多消费者也可以尝试从同一个队列中接收数据。


> **AMQP(高级消息队列协议)** 实现了对于消息的排序，点对点通讯，和发布订阅，保持可靠性、保证安全性。
# 架构

**频道：**

**交换机：**

**队列：**
# 基本使用

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