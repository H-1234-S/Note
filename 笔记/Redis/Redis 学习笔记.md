
Redis 是一个以**内存**为主要存储介质的**键值数据库**（Key-Value Store）

Redis 不仅能存储数据，还能在服务端直接完成自增、集合交集、排行榜排序等操作，不需要把所有数据都取回 Node.js 再计算。

```
NX 当键不存在时设置
EX 设置键的过期时间
```
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
## 分布式锁

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

|命令|作用|
|---|---|
|`ZADD`|添加成员并设置分数|
|`ZREM`|删除成员|
|`ZSCORE`|查询成员分数|
|`ZCARD`|获取成员数量|
|`ZINCRBY`|增加成员分数|
|`ZRANK`|查询升序排名，从 0 开始|
|`ZREVRANK`|查询降序排名，从 0 开始|
|`ZRANGE`|按升序获取成员范围|
|`ZREVRANGE`|按降序获取成员范围|
|`ZRANGEBYSCORE`|按分数范围查询（旧式命令）|
|`ZRANGESTORE`|将查询结果存入另一个 ZSet|
|`ZCOUNT`|统计分数区间内的成员数量|
|`ZPOPMIN`|弹出分数最低的成员|
|`ZPOPMAX`|弹出分数最高的成员|
|`ZSCAN`|增量遍历成员|
## 实现排行榜

ZSet 最适合做排行榜这类内容

因为 Set 确保成员唯一；有序索引支持按照分数排序和查询排名

排行榜中，新增或更新成员通常是 \(O(\log N)\) 级别，获取指定排名区间也非常高效。