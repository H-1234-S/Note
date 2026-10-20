
Redis 是一个以**内存**为主要存储介质的**键值数据库**（Key-Value Store）

Redis 不仅能存储数据，还能在服务端直接完成自增、集合交集、排行榜排序等操作，不需要把所有数据都取回 Node.js 再计算。
# String

String 是 Redis 最基本的数据类型，可以存储文本、数字、序列化后的 JSON，甚至二进制数据。

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

