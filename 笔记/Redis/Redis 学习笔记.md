
Redis 是一个以**内存**为主要存储介质的**键值数据库**（Key-Value Store）

Redis 不仅能存储数据，还能在服务端直接完成自增、集合交集、排行榜排序等操作，不需要把所有数据都取回 Node.js 再计算。

```
NX 当键不存在时设置
EX 设置键的过期时间
```

Redis 中是严格区分大小写
# String

String 是 Redis 最基本的数据类型，可以存储文本、数字、**序列化后的 JSON**，甚至二进制数据。

> 但无法使用 `HGET` 获取其中的某一字段；若需要**频繁独立修改对象字段**，可以考虑 Hash；若只需要**整体缓存和读取**，String 通常就足够了。

## 基础命令

| 命令       | 作用        | 示例                |
| -------- | --------- | ----------------- |
| `SET`    | 设置值       | `SET name Tom`    |
| `GET`    | 获取值       | `GET name`        |
| `MSET`   | 批量设置      | `MSET a 1 b 2`    |
| `MGET`   | 批量获取      | `MGET a b`        |
| `SETNX`  | 键不存在时才设置  | `SETNX lock 1`    |
| `EXISTS` | 判断键是否存在   | `EXISTS name`     |
| `DEL`    | 删除键       | `DEL name`        |
| `INCR`   | 原子加一      | `INCR views`      |
| `INCRBY` | 增加指定整数    | `INCRBY views 10` |
| `DECR`   | 原子减一      | `DECR views`      |
| `APPEND` | 追加字符串     | `APPEND name Lee` |
| `STRLEN` | 获取字符串字节长度 | `STRLEN name`     |

## 过期时间

Redis 可以给键设置过期时间，到期后键会失效。

``` redis
SET captcha:1001 836291 EX 300
TTL captcha:1001
GET captcha:1001
```

| 命令                         | 作用               |
| -------------------------- | ---------------- |
| `EXPIRE key seconds`       | 设置秒级过期时间         |
| `PEXPIRE key milliseconds` | 设置毫秒级过期时间        |
| `TTL key`                  | 查看剩余秒数           |
| `PTTL key`                 | 查看剩余毫秒数          |
| `PERSIST key`              | 移除过期时间           |
| `EXPIREAT key timestamp`   | 设置 Unix 秒级绝对过期时间 |
| `SET ... EX ...`           | 设置值并同时指定过期时间     |

`TTL` 的返回值需要特别注意：大于等于 `0`：剩余时间。`-1`：键存在，但没有过期时间。`-2`：键不存在。

验证码就可以用 Redis 实现：**设置验证码时指定有效期**，验证后再删除或采用原子校验与消费方案。
## 原子自增

原子自增就是防竞态的；

假设有一个需求：有两个请求同时给浏览量加一，不能先 GET 再 SET；

``` ts
const value = Number(await redis.get('views'));
await redis.set('views', value + 1);
```

假设值是10，那么两次同时的操作取出来的有可能都是10，最后加一都为11；但是预取结果是12，丢失了一次加一操作。

**正确做法：**

```
SET views 10
INCR views
INCR views
GET views
```

`INCR` 是 Redis 服务端执行的原子命令。多个请求并发执行时，每次自增都会生效。

# Hash

Redis 中的 Hash 可以理解为 JS 中的 Object

## 常用命令

| 命令             | 作用        |
| -------------- | --------- |
| `HSET`         | 设置一个或多个字段 |
| `HGET`         | 获取指定字段    |
| `HMGET`        | 获取多个指定字段  |
| `HGETALL`      | 获取所有字段和值  |
| `HDEL`         | 删除字段      |
| `HEXISTS`      | 判断字段是否存在  |
| `HKEYS`        | 获取所有字段名   |
| `HVALS`        | 获取所有字段值   |
| `HLEN`         | 获取字段数量    |
| `HINCRBY`      | 字段整数自增    |
| `HINCRBYFLOAT` | 字段浮点数自增   |
| `HSETNX`       | 字段不存在时才设置 |

Hash 与 String + JSON 如何选择：Hash 适合频繁读取、修改或者对单个字段处理；String + JSON 适合整体处理

# List

List 是**按照插入顺序排列**的字符串序列，允许重复元素。

```
// lpush tasks A
// lpush tasks B
// lpush tasks C
tasks = [task:C, task:B, task:A]
```

可以在列表左侧或右侧插入和删除元素。

## 常用命令

| 命令       | 作用               |                       |
| -------- | ---------------- | --------------------- |
| `LPUSH`  | 左侧插入             |                       |
| `RPUSH`  | 右侧插入             |                       |
| `LPOP`   | 左侧弹出             |                       |
| `RPOP`   | 右侧弹出             |                       |
| `LRANGE` | 获取指定区间           | 0 表示第一个元素，-1 表示最后一个元素 |
| `LLEN`   | 获取列表长度           |                       |
| `LINDEX` | 获取指定索引           |                       |
| `LSET`   | 修改指定索引           |                       |
| `LREM`   | 删除匹配元素           |                       |
| `LTRIM`  | 只保留指定区间          |                       |
| `BLPOP`  | 阻塞式左侧弹出          |                       |
| `BRPOP`  | 阻塞式右侧弹出          |                       |
| `LMOVE`  | 将元素从一个列表移动到另一个列表 |                       |

## 栈与队列

栈是后进先出；队列是先进先出

```
// 栈
LPUSH stack A
LPUSH stack B
LPOP stack

// 队列
RPUSH queue A
RPUSH queue B
LPOP queue
```

# Set

Set 是无序且元素唯一的字符串集合。

```
{user:1, user:2, user:3}
```

相当于 JS 中的 Set，去重，不会重复添加

> Set 最值得掌握的地方不只是增删查，而是**去重与集合运算**。

## 常用命令

| 命令            | 作用           |
| ------------- | ------------ |
| `SADD`        | 添加元素         |
| `SREM`        | 删除元素         |
| `SISMEMBER`   | 判断元素是否存在     |
| `SMEMBERS`    | 获取所有元素       |
| `SCARD`       | 获取集合元素数量     |
| `SINTER`      | 求交集          |
| `SUNION`      | 求并集          |
| `SDIFF`       | 求差集          |
| `SINTERSTORE` | 将交集存入新集合     |
| `SUNIONSTORE` | 将并集存入新集合     |
| `SPOP`        | 随机移除并返回元素    |
| `SRANDMEMBER` | 随机获取元素，不一定删除 |
| `SSCAN`       | 增量遍历集合       |

## 实现点赞

```
SADD article:1001:likes user:1
SADD article:1001:likes user:2
SADD article:1001:likes user:1

SCARD article:1001:likes
SISMEMBER article:1001:likes user:1
SREM article:1001:likes user:1
```

执行两次 `SADD` 添加 `user:1`，集合中仍然只有一个 `user:1`。

- `SCARD`：统计点赞人数。
    
- `SISMEMBER`：判断某个用户是否已经点赞。
    
- `SREM`：取消点赞。

## 集合运算

```
SADD user:1:friends A B C D
SADD user:2:friends B C E
```

**共同好友：**

```
SINTER user:1:friends user:2:friends
```

则输出：B、C

# Sorted Set（ZSet）

Sorted Set 是 Redis 中非常重要的一种类型：**每个元素唯一**，并且每个元素都有一个 Score（分数），Redis 根据 Score 维护排序。

与 Set 不同，Sorted Set 支持按分数查询、排名和范围检索。

> **注意：** 相同 Score 的成员仍有确定的排序规则，但业务若要求严格的并列排名、时间优先等规则，需要明确设计。

## 常用命令

| 命令              | 作用              |
| --------------- | --------------- |
| `ZADD`          | 添加成员并设置分数       |
| `ZREM`          | 删除成员            |
| `ZSCORE`        | 查询成员分数          |
| `ZCARD`         | 获取成员数量          |
| `ZINCRBY`       | 增加成员分数          |
| `ZRANK`         | 查询升序排名，从 0 开始   |
| `ZREVRANK`      | 查询降序排名，从 0 开始   |
| `ZRANGE`        | 按升序获取成员范围       |
| `ZREVRANGE`     | 按降序获取成员范围       |
| `ZRANGEBYSCORE` | 按分数范围查询（旧式命令）   |
| `ZRANGESTORE`   | 将查询结果存入另一个 ZSet |
| `ZCOUNT`        | 统计分数区间内的成员数量    |
| `ZPOPMIN`       | 弹出分数最低的成员       |
| `ZPOPMAX`       | 弹出分数最高的成员       |
| `ZSCAN`         | 增量遍历成员          |
## 实现排行榜

ZSet 最适合做排行榜这类内容

因为 Set 确保成员唯一；有序索引支持按照分数排序和查询排名

排行榜中，新增或更新成员通常是 \(O(\log N)\) 级别，获取指定排名区间也非常高效。

# Bitmap

Bitmap（位图）不是独立于 String 的顶层类型，而是 Redis String 上的位操作能力。

它将一个字符串视为连续的二进制位，每一位只能是 `0` 或 `1`。也就是**用二进制位记录状态**

> **例如**，记录用户是否在某一天签到：

```
日期偏移：  0 1 2 3 4 5 6
签到状态：  1 0 1 1 0 1 0
```

第 0、2、3、5 位为 `1`，代表相应日期已经签到。

## 常用命令

| 命令         | 作用                     |
| ---------- | ---------------------- |
| `SETBIT`   | 设置某一位                  |
| `GETBIT`   | 获取某一位                  |
| `BITCOUNT` | 统计值为 1 的位数             |
| `BITOP`    | 对多个位图执行 AND、OR、XOR、NOT |
| `BITPOS`   | 查找第一个指定值的位             |
| `BITFIELD` | 对指定宽度的整数位域执行读写和自增      |
## 实现七天签到

```
SETBIT sign:1001 0 1
SETBIT sign:1001 1 0
SETBIT sign:1001 2 1
SETBIT sign:1001 3 1
SETBIT sign:1001 4 0
SETBIT sign:1001 5 1
SETBIT sign:1001 6 0
```

查看第三天是否签到：

```
GETBIT sign:1001 2
```

结果是 `1`。

统计这段位图中有多少天签到：

```
BITCOUNT sign:1001
```

结果是 `4`。

## 优势与限制

如果用 Set 保存每个签到日期，每次签到都需要保存日期或成员；Bitmap 则可以用一位表示一个状态，在连续编号的场景中非常节省空间。

> 但要注意：

- 偏移量从 `0` 开始。
    
- Bitmap 的空间消耗与**最大偏移量**有关，**而不仅仅取决于值为 `1` 的位数**。
    
- 如果用户 ID 非常稀疏且数值很大，直接将用户 ID 当作偏移量可能浪费空间。
    

# HyperLogLog

有些业务不需要知道所有访问用户是谁，只关心一天内有多少个不同访客，也就是 UV（Unique Visitors）。

假设网站有 1000 万次访问，如果用 Set 保存所有访客 ID，虽然可以准确去重，但需要占用更多内存。

HyperLogLog 使用概率算法来估算不同元素的数量，牺牲少量精度换取很低的内存开销。

> 什么时候用 HyperLogLog，什么时候用 Set？

- 必须知道具体用户列表：Set 或数据库。
    
- 只关心大规模 UV 估算：HyperLogLog。
    
- 需要精确去重计数：选择能够精确维护成员信息的数据结构。

## 常用命令

|命令|作用|
|---|---|
|`PFADD`|添加待统计元素|
|`PFCOUNT`|估算不同元素数量|
|`PFMERGE`|合并多个 HyperLogLog|
## 示例

```
PFADD uv:2026-10-19 user:1 user:2 user:3
PFADD uv:2026-10-19 user:1 user:2 user:4

PFCOUNT uv:2026-10-19
```

结果为 `4`。

上面的数据量很小，结果恰好准确，但 HyperLogLog **本质上是近似统计结构**，**大规模情况下不保证精确结果**。

合并两个日期的统计：

```
PFADD uv:2026-10-18 user:1 user:2
PFADD uv:2026-10-19 user:2 user:3

PFMERGE uv:two-days uv:2026-10-18 uv:2026-10-19
PFCOUNT uv:two-days
```

结果是 `3` 的估算值，因为两个日期中共有三个不同用户。

# GEO

GEO 用于保存经纬度，并支持**距离计算和附近位置查询**。

**注意：** 

Redis GEO 适合基础附近查询；复杂道路距离、路线规划、精细地理空间分析通常需要专门的地图服务或空间数据库。

## 常用命令

| 命令          | 作用                 | 提示                        |
| ----------- | ------------------ | ------------------------- |
| `GEOADD`    | 添加或更新位置            | 注意参数顺序是**经度在前**，**纬度在后**。 |
| `GEOPOS`    | 查询成员经纬度            |                           |
| `GEODIST`   | 计算两个成员之间的距离        |                           |
| `GEOSEARCH` | 按圆形或矩形区域查询         |                           |
| `GEOHASH`   | 获取成员对应的 Geohash 编码 |                           |
| `ZREM`      | 删除地理索引中的成员         |                           |

GEO 在 Redis 内部利用 Sorted Set 的相关机制组织数据，所以它与 ZSet 有一定关系，但业务操作上使用 GEO 命令更合适。

# Stream

Redis Stream 是带有消息 ID 的追加式消息流，适合事件记录、任务分发和消费者组等场景。

与 List 相比，Stream 更适合需要消息 ID、消费组和待确认消息管理的业务。

## 常用命令

| 命令                      | 作用           |
| ----------------------- | ------------ |
| `XADD`                  | 添加一条消息       |
| `XRANGE`                | 按 ID 范围查询消息  |
| `XREVRANGE`             | 按 ID 逆序查询消息  |
| `XLEN`                  | 获取消息数量       |
| `XREAD`                 | 从指定位置读取消息    |
| `XGROUP CREATE`         | 创建消费者组       |
| `XREADGROUP`            | 消费者组读取消息     |
| `XACK`                  | 确认消息已处理      |
| `XPENDING`              | 查看待确认消息      |
| `XCLAIM` / `XAUTOCLAIM` | 接管符合条件的待处理消息 |
| `XTRIM`                 | 修剪 Stream 长度 |
## 示例

**创建消息：**
```
XADD orders * orderId 1001 amount 99
```

> `*` 表示由 Redis 自动生成消息 ID。

**读取消息：**

```
XRANGE orders - +
```

> `-` 和 `+` 分别表示最小与最大 ID

**创建消费者组：**

```
// XGROUP CREATE key group id|$ [MKSTREAM] [ENTRIESREAD n]

XGROUP CREATE orders order-workers 0 MKSTREAM
```

> MKSTREAM 表示流不存在时创建空流；0 表示从头消费全部消息；$ 表示只消费新建消息

**消费者组读取消息：**

```
XREADGROUP GROUP order-workers worker-1
  COUNT 10
  BLOCK 5000
  STREAMS orders >
```

**读取并成功处理消息：**

```
XACK orders order-workers id
```
## 与 List 的区别

如果用最简单的 List（`LPUSH` + `BRPOP`）

```
生产者：LPUSH image:queue "{imageId:123}"
消费者：BRPOP image:queue  → 拿到任务 → 处理
```
**`BRPOP` 一弹出，消息就从 List 里没了。** 如果 worker 拿到任务后、还没处理完就崩溃了 —— **这条消息彻底丢了**

> 如果用 Redis Stream

Stream 的核心改进：**消息不会"取出即消失"，而是"处理完并确认后才算完成"。**

> **具体流程：**

**1. 生产者丢消息**

```
XADD image:stream * imageId 123 task "process"
```

**2. 消费者组读取**

先建一个消费者组 `workers`：

```
XGROUP CREATE image:stream workers $ MKSTREAM
```

然后每个 worker 这样读：

```
XREADGROUP GROUP workers worker-1 COUNT 1 BLOCK 5000 STREAMS image:stream >
```

意思是："我是 `workers` 组里的 `worker-1`，给我一条还没被这个组处理过的消息。"

**关键点**：消息读出来后，**并不会从 Stream 里删掉**，而是进入这个组的"待确认列表（PEL）"。

同一组的**其他 worker 不会再拿到这条消息**（组内互斥，天然负载均衡）。

**3. 处理完，发确认（ACK）**

```
XACK image:stream workers 1700000000000-0
```

只有 ACK 之后，这条消息才算"这个组处理完了"。

**4. 崩溃了怎么办？**

假设 `worker-1` 拿到消息、还没 ACK 就崩了。这条消息会一直躺在 `workers` 组的 PEL 里，状态是"已投递未确认"。

别的 worker（或重启后的 worker-1）可以用：

```
XPENDING image:stream workers        # 查看有哪些"卡住"的待确认消息
XCLAIM image:stream workers worker-2 60000 1700000000000-0
                                     # 把这条超时60秒还没确认的消息，转给我处理
```

这样，**崩溃 worker 手里的任务会被别人接手，不会丢**。

# 补充






# 通用命令






# Redis 复制

**Redis 复制**意思是允许一台 Redis 服务器（主节点）的数据，自动、持续地同步到其他 Redis 服务器（从节点）上。

Redis 复制是一种**单向**的数据同步机制。

数据只能从**主节点**流向**从节点**，一个主节点可以挂多个从节点，但从节点通常只能有一个主节点

## 为什么

因为单台 Redis 服务器时，会面临两个核心问题：**单点故障**和**性能瓶颈**。

- **单点故障**：服务器宕机，数据就丢了，服务也断了。
    
- **性能瓶颈**：单台服务器的读能力有限，无法应对高并发读请求。
    
## 作用

1. **数据冗余（热备份）**：从节点是主节点数据的实时备份，避免了单机磁盘损坏导致的数据彻底丢失。
    
2. **读写分离，提升性能**：主节点负责处理写操作（增删改），从节点负责处理读操作。通过增加从节点，可以线性扩展读吞吐量，分担主节点压力。
    
3. **高可用的基石**：你之前问的**哨兵**，正是建立在复制之上的。哨兵之所以能自动切换，前提是有一个从节点已经拥有几乎完整的数据，可以随时“上位”成为新主节点。
    
4. **故障恢复**：当主节点故障时，从节点可以继续提供读服务（如果配合哨兵，则可以接管写服务），缩短服务不可用的时间。

## 使用

> `docker-compose.yaml` 文件

``` yaml
version: '3.8'

services:
  redis-master:
    image: redis:7-alpine
    container_name: redis-master
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes

  redis-slave1:
    image: redis:7-alpine
    container_name: redis-slave1
    ports:
      - "6380:6379"
    command: redis-server --replicaof redis-master 6379 --appendonly yes
    depends_on:
      - redis-master

  redis-slave2:
    image: redis:7-alpine
    container_name: redis-slave2
    ports:
      - "6381:6379"
    command: redis-server --replicaof redis-master 6379 --appendonly yes
    depends_on:
      - redis-master
```

从节点的 `command` 中使用了 `--replicaof redis-master 6379`。

这里的 `redis-master` 是 Compose 中定义的服务名，Docker 内部网络会自动把它解析到主节点的容器 IP，无需手动写死 IP 地址。

> **验证：**

``` bash
# 查看主节点复制状态
docker exec -it redis-master redis-cli
127.0.0.1:6379> info replication
```

``` bash
# 查看从节点状态
docker exec -it redis-slave1 redis-cli
127.0.0.1:6379> info replication
```

# Redis 哨兵

Redis 哨兵（Sentinel）是 Redis 官方提供的**高可用性解决方案**。

是一套独立的监控系统，专门用来解决主从架构中“主节点挂了需要人工手动切换”的痛点，实现故障的自动发现与转移。

## 作用

哨兵节点是特殊的 Redis 进程，不存储数据，主要承担四项核心职责：

1. **监控**：哨兵会以每秒一次的频率，向所有主节点、从节点以及其他哨兵节点发送 `PING` 命令，检测它们是否存活。
    
2. **自动故障转移**：这是最核心的功能。当主节点被判定为故障后，哨兵会自动从从节点中选出一个新的主节点，并让其他从节点改为复制新主节点。
    
3. **通知**：哨兵可以将故障转移的结果（例如新的主节点地址）通过发布订阅机制发送给客户端或运维系统，让应用能及时切换连接目标。
    
4. **配置提供者**：客户端启动时，可以连接哨兵来查询当前谁是主节点，而无需在代码里硬编码主节点的 IP 地址。

## 使用

使用哨兵的前提是**已经搭好了 Redis 主从复制**。

哨兵通常以集群方式部署，为了避免单点误判，**建议至少部署 3 个哨兵节点**（奇数个）。

> **核心配置：**

``` conf
# sentinel.conf
# 监控名为 mymaster 的主节点，IP 为 127.0.0.1，端口 6379
# 最后的数字 2 是 quorum（法定票数），表示至少需要 2 个哨兵认为主节点挂了，才算“客观下线”
sentinel monitor mymaster 127.0.0.1 6379 2

# 判定主观下线的超时时间（毫秒），即多久没响应 PING 就认为可能挂了
sentinel down-after-milliseconds mymaster 30000

# 故障转移超时时间
sentinel failover-timeout mymaster 180000

# 故障转移时，最多允许多少个从节点同时向新主节点发起同步
sentinel parallel-syncs mymaster 1
```

每个哨兵节点都需要一个配置文件（如 `sentinel.conf`）

> **启动与验证：**

使用 `redis-sentinel` 命令或 `redis-server` 加 `--sentinel` 参数启动。启动后，可以通过哨兵端口（默认 26379）进行查询验证：[](https://raw.githubusercontent.com/dunwu/db-tutorial/master/docs/12.%E6%95%B0%E6%8D%AE%E5%BA%93/05.KV%E6%95%B0%E6%8D%AE%E5%BA%93/01.Redis/06.Redis%E5%93%A8%E5%85%B5.md#1)
``` bash
redis-cli -p 26379
> sentinel masters              # 查看监控的主节点状态
> sentinel get-master-addr-by-name mymaster  # 获取当前主节点的 IP 和端口
```

> **客户端连接：**

在代码中，不要直接连接 Redis 的 6379 端口，而应该配置**哨兵节点的地址列表**。

客户端（如 Jedis、Lettuce）会向哨兵询问当前主节点地址，并在收到故障转移通知后自动重连新的主节点。

# Redis 集群

Redis 集群（Redis Cluster）是 Redis 官方提供的**分布式解决方案**。

可以理解为：当单台 Redis 服务器无法容纳你的数据，或者无法承受所有写入压力时，将数据自动“拆散”并分散到多台机器上存储和处理的一套机制。

> 其实就是为了解决**一台机器装不下**和**一台机器写不过来

## 作用

- **数据分片：** 这是集群最核心的功能。它将你的整个数据集自动切分成多份，分散到多个主节点上。这样，总存储容量和总写入吞吐量理论上可以随着节点数量的增加而线性增长。
	
- **内置高可用**：集群模式自身就包含了故障转移能力。**每个主节点都可以配备从节点**，当某个主节点宕机时，集群会自动将其对应的从节点提升为新的主节点，整个过程无需像哨兵那样额外部署一套监控系统。

## 原理

Redis 集群的实现依赖两个关键设计：**哈希槽**和**节点通信**。

> **哈希槽：**

Redis 没有直接对服务器数量取模，而是引入了“哈希槽”的概念。整个集群共有 **16384 个哈希槽**。集群中的每个主节点负责处理其中一部分槽位

当你要存取一个键（Key）时，Redis 会先计算 `CRC16(key) % 16384`，得到这个键对应的槽位号，然后直接去负责该槽位的节点上进行操作。

> **节点通信：**


## Docker 配置

### 总线端口

每个 Redis 集群节点其实开了**两个端口**：

|端口类型|作用|例子|
|---|---|---|
|**服务端口**（client port）|给客户端读写数据用的|7001|
|**总线端口**（bus port）|节点之间互相通信用的（握手、 gossip 协议、故障检测）|17001（=7001+10000）|

> 总线端口 = 服务端口 + 10000，这是 Redis 写死的规则。

Docker 容器默认是隔离的网络。在 `docker run -p 7001:7001` 时，只把**服务端口**映射出来了，但**总线端口 17001 还锁在容器里**，外部（其他节点）根本连不进来。

``` bash
docker run -p 7001:7001 -p 17001:17001 ...
#                         ^^^^^^^^^^^^^^^ 这个必须也映射！
```

因此两个端口都需要映射

### 对外通告 IP

Redis 集群有个特性叫 **MOVED 重定向**

**示例：** 客户端连到节点 A，要读一个 key，但这个 key 其实存在节点 B 上。节点 A 会返回节点 **B 的对外通告 IP**

Docker 容器内部有自己的 IP（比如 `172.17.0.5`），这个 IP **只有 Docker 内部网络能访问**，宿主机外面的客户端根本连不上。

因此需要给每个节点明确配置**外部能访问到的地址**：

``` conf
# redis.conf 里
cluster-announce-ip 192.168.1.100   # 宿主机 IP（或容器固定 IP）
cluster-announce-port 7001
cluster-announce-bus-port 17001
```
## 使用

#### 1. 创建自定义网络

为了让容器拥有固定 IP，避免重启后 IP 变动导致集群崩溃，首先创建一个指定子网的桥接网络：

``` bash
docker network create --subnet=172.28.0.0/16 redis-cluster-net
```

> **Why？**

Docker 默认的 `bridge` 网络有个限制：**容器 IP 是动态分配的**，容器一重启，IP 可能就变了

比如从 `172.17.0.5` 变成 `172.17.0.8`

而 Redis 集群里，每个节点都**记死了其他节点的 IP**（通过 `cluster-announce-ip` 和 cluster 配置）。

如果某个节点重启后 IP 变了就连不上了，可能触发故障转移。

#### 2. 编写 Docker Compose 文件

以下 `docker-compose.yml` 定义了 6 个节点，分别映射到宿主机的 7001-7006 端口。

**注意**：`cluster-announce-ip` 需填写你**宿主机**的局域网 IP（例如 `192.168.1.100`），或者是容器在自定义网络中的固定 IP。

如果是本地开发且客户端也在宿主机，填宿主机 IP 最方便。

``` yaml
version: '3.8'
services:
  redis-7001:
    image: redis:7.2
    container_name: redis-7001
    command: redis-server --port 7001 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.11 --cluster-announce-port 7001 --cluster-announce-bus-port 17001
    ports:
      - "7001:7001"
      - "17001:17001"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.11
  redis-7002:
    image: redis:7.2
    container_name: redis-7002
    command: redis-server --port 7002 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.12 --cluster-announce-port 7002 --cluster-announce-bus-port 17002
    ports:
      - "7002:7002"
      - "17002:17002"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.12
  redis-7003:
    image: redis:7.2
    container_name: redis-7003
    command: redis-server --port 7003 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.13 --cluster-announce-port 7003 --cluster-announce-bus-port 17003
    ports:
      - "7003:7003"
      - "17003:17003"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.13
  redis-7004:
    image: redis:7.2
    container_name: redis-7004
    command: redis-server --port 7004 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.14 --cluster-announce-port 7004 --cluster-announce-bus-port 17004
    ports:
      - "7004:7004"
      - "17004:17004"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.14
  redis-7005:
    image: redis:7.2
    container_name: redis-7005
    command: redis-server --port 7005 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.15 --cluster-announce-port 7005 --cluster-announce-bus-port 17005
    ports:
      - "7005:7005"
      - "17005:17005"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.15
  redis-7006:
    image: redis:7.2
    container_name: redis-7006
    command: redis-server --port 7006 --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-announce-ip 172.28.0.16 --cluster-announce-port 7006 --cluster-announce-bus-port 17006
    ports:
      - "7006:7006"
      - "17006:17006"
    networks:
      redis-cluster-net:
        ipv4_address: 172.28.0.16
networks:
  redis-cluster-net:
    external: true

```
#### 3. 启动并创建集群

**启动容器：**

``` bash
docker-compose up -d
```

**创建集群：**  

进入任意一个容器（如 redis-7001），执行 `redis-cli --cluster create` 命令。这里使用容器内的 IP 进行握手，确保集群内部通信正常：

``` bash
docker exec -it redis-7001 redis-cli --cluster create \
  172.28.0.11:7001 172.28.0.12:7002 172.28.0.13:7003 \
  172.28.0.14:7004 172.28.0.15:7005 172.28.0.16:7006 \
  --cluster-replicas 1
```

#### 4. 验证与使用

**查看集群状态：**

``` bash
docker exec -it redis-7001 redis-cli -p 7001 cluster info
docker exec -it redis-7001 redis-cli -p 7001 cluster nodes
```

## 缺点

- **多键操作受限**：因为数据被分散了，像 `MGET`、事务、Lua 脚本这类涉及多个键的操作，如果这些键不在同一个槽位，就会报错。解决办法是在设计键名时，用 `{}` 把需要一起操作的键“绑”到同一个槽，例如 `{user:1000}.name` 和 `{user:1000}.age`。

# Gossiping 协议

Redis Cluster 使用 gossiping 来确定整个集群的健康状况。

# Redis 分布式锁

## 锁

> 锁是用来**协调多个执行者**对同一资源的访问，让同一时刻只有获得锁的执行者可以进入受保护的业务区间。

**例如：**

用户有 100 余额，请求 A 和请求 B 同时执行，扣款 80，**如果不存在锁**，则可能都执行成功，但是实际业务应该只成功一笔

这就是并发问题：并发请求操作同一份共享数据，可能会导致业务跟实际结果不一致

**如何解决：**

- 请求 A 获取锁，**允许访问核心业务**
- 请求 B 发现锁已被占用，等待或直接失败
- A 完成业务，则释放该锁
- B 尝试获取锁，重新读取余额

**注意：**

如果只是一个数据库事务能够原子完成的操作，数据库事务、条件更新和约束往往更直接。

例如使用 `UPDATE ... WHERE balance >= 80` 并检查影响行数。

## Redis 分布式锁

利用 Redis 的原子操作，**让多个独立进程竞争同一个锁**，并通过锁的过期时间和持有者标识等机制管理锁的生命周期。

> **示例：**

``` redis
SET lock:order:123 token-A NX PX 30000
```

`SET ... NX` 只有当锁不存在时才创建；该命令是一个**原子命令**，判断和创建是一个整体操作

`PX xxx` 设置过期时间；防止**某一进程崩溃但锁仍存在**，这就是死锁问题

锁的值**必须是唯一的：** 

  假设 A 获取了锁，但超过 30 秒仍然未执行完毕
  但是锁过期了
  B 获取同一把锁，此时 A 执行完毕删除该锁，则会把 B 持有的锁删除

正确的做法是：释放锁时，只有当前锁的值与自己持有的 token 一致，才允许删除。

``` lua
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
```

Lua 脚本在 Redis 内部**原子执行比较和删除**，不会出现竞争窗口

> **实现：**

``` ts
import { randomUUID } from "node:crypto";
import { createClient } from "redis";
  
const redis = createClient({
  url: "redis://localhost:6379",
});
  
redis.on("error", (err) => {
  console.error("Redis error:", err);
});
  
await redis.connect();

// 获取锁方法，返回 boolean
async function acquireLock(
  lockKey: string,
  token: string,
  ttlMs = 30_000,
): Promise<boolean> {
  const result = await redis.set(lockKey, token, {
    NX: true,
    PX: ttlMs,
  });
  
  return result === "OK";
}

// token 唯一，防止时间过期后删除请求 B 的锁
const token = randomUUID();
  
const acquired = await acquireLock("lock:order:123", token, 30_000);
  
if (acquired) {
  console.log("获取锁成功");
} else {
  console.log("获取锁失败");
}
  
const RELEASE_LOCK_SCRIPT = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  end
  
  return 0
`;
  
async function releaseLock(lockKey: string, token: string): Promise<boolean> {
  const result = await redis.eval(RELEASE_LOCK_SCRIPT, {
    keys: [lockKey],
    arguments: [token],
  });
  
  return result === 1;
}
  
async function payOrder(orderId: string) {
  const lockKey = `lock:order:${orderId}`;
  const token = randomUUID();
  
  const acquired = await acquireLock(lockKey, token);
  
  if (!acquired) {
    throw new Error("订单正在处理中，请稍后重试");
  }
  
  try {
    // 这里执行受保护的业务逻辑
    // 例如检查订单状态、执行扣款流程等
    // await processPayment(orderId);
  } finally {
    // 无论业务成功还是抛出异常，都尝试释放自己的锁
    await releaseLock(lockKey, token);
  }
}
```

**问题：**

- 业务执行时间超过 TTL
- Redis 主从切换导致锁失效

**应用：**

1. 防止重复处理订单
2. 秒杀与库存处理
3. 定时任务防重
4. 防止缓存击穿
# Lua 脚本