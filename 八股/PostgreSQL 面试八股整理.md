## PostgreSQL 面试八股整理

> 面向后端开发、数据库开发和全栈开发的大厂 PostgreSQL 面试手册。重点不是记住一串参数，而是沿着“SQL 如何执行、事务如何并发、数据如何落盘、故障如何恢复、性能如何定位”这条主线，把 PostgreSQL 的能力边界和生产实践讲清楚。

## 目录

1. PostgreSQL 全景：定位、架构与一次请求
2. 数据类型、表设计与 SQL 基础
3. 事务、ACID 与 MVCC
4. 锁、并发控制与死锁
5. WAL、Checkpoint 与崩溃恢复
6. 索引：B-Tree、Hash、GIN、GiST、BRIN
7. 查询优化器与 EXPLAIN
8. VACUUM、统计信息与膨胀
9. JOIN、聚合、排序与高级 SQL
10. 分区表、约束与大表治理
11. 连接、内存、并发与性能调优
12. 复制、读写分离与高可用
13. 逻辑复制、CDC 与数据迁移
14. 安全、权限与数据库对象
15. 生产监控、故障排查与备份恢复
16. 大厂综合场景题与回答框架
17. 高频命令速查与复习路线
18. 逐章深化补充：前置知识、学习路径与实践题

---

## 0. 知识地图与推荐顺序

PostgreSQL 是一个**进程模型、MVCC、WAL、可扩展类型系统和成本优化器**组成的关系型数据库。它既能承担强一致的 OLTP，也能通过 JSONB、全文检索、分区和扩展能力覆盖一部分搜索、地理信息和分析场景，但它不是所有场景的默认答案。

```text
业务服务 / ORM / psql
          │ SQL、事务、连接池
PostgreSQL Backend Process
          │ parser → analyzer → rewriter → planner → executor
          │
共享内存：shared buffers / WAL buffers / 锁表 / 进程间通信
          │
数据目录：heap table / index / WAL / FSM / VM / catalog
          │
操作系统页缓存、文件系统、磁盘或云存储
```

建议按下面的依赖关系学习：

1. 先理解表、类型、约束和 SQL，知道“正确查询”长什么样。
2. 再理解事务、MVCC 和锁，这是 PostgreSQL 并发模型的核心。
3. 接着理解 WAL、Checkpoint、崩溃恢复，回答“宕机后数据会不会丢”。
4. 再学索引和优化器，回答“为什么走索引、为什么不走、怎样验证”。
5. 最后覆盖 VACUUM、分区、复制、备份、高可用和排障，这些是生产面试的主要追问。

面试回答建议固定使用：**先给结论，再讲机制，再给 SQL 或流程，最后说明边界与监控指标**。例如回答“PostgreSQL 为什么需要 VACUUM”，不能只说“回收空间”，还应说明 MVCC 旧版本、可见性判断、冻结 xid、表膨胀、autovacuum 和索引膨胀之间的关系。

---

## 1. PostgreSQL 全景：定位、架构与一次请求

### 1.1 PostgreSQL 是什么

PostgreSQL 是开源对象关系型数据库，支持标准 SQL、事务、MVCC、复杂查询、窗口函数、CTE、丰富数据类型、扩展、逻辑复制和物理复制。它的价值不只是“一个能执行 SQL 的服务”，还在于：

- **数据正确性**：事务、约束、外键、唯一性、CHECK 和可序列化隔离。
- **复杂查询能力**：JOIN、聚合、窗口函数、递归 CTE、JSONB、全文检索。
- **可扩展性**：自定义类型、函数、操作符、索引访问方法和扩展。
- **可观测性**：`EXPLAIN`、系统目录、统计视图、慢查询和锁视图。

它的典型边界是：连接数非常高但没有连接池、单表写入极端集中、跨地域强同步写入、超大规模键值访问等场景，需要结合架构设计，不能只靠 PostgreSQL 参数解决。

### 1.2 进程模型与连接模型

PostgreSQL 通常采用“主进程 + 多个后台进程 + **每连接一个 backend 进程**”的模型：

| 角色                         | 作用                              |
| -------------------------- | ------------------------------- |
| postmaster / postgres 主进程  | 监听连接、启动和管理后台进程；本身不处理sql，只做调度和守护 |
| backend process            | 处理一个客户端会话的 SQL、事务和执行计划          |
| wal sender/receiver        | 主库发送、备库接收 WAL                   |

主进程会启动一组常驻的后台辅助进程，**例如：**

|进程|作用|
|---|---|
|`checkpointer`|定期执行检查点，把脏页刷盘|
|`background writer`|持续把共享缓冲区中的脏页写回磁盘|
|`wal writer`|把 WAL 日志缓冲写入 WAL 文件|
|`autovacuum launcher`|启动自动清理工作进程|
|`stats collector` / `logical replication launcher` 等|统计、逻辑复制等|

这些进程在数据库运行期间一直存在，是“**共享的基础设施**”。

#### 1.2.1 每连接一个 backend 进程

这是 PostgreSQL 与 MySQL 等数据库的**关键区别**：

- 客户端每建立一个连接，postmaster 就 **fork 一个新进程**（叫 backend 进程）
    
- 这个进程**专门服务这一个连接**，负责解析 SQL、执行查询、返回结果
    
- 连接断开，该进程退出
    

一个连接通常对应一个服务端进程，因此连接数不是越多越好。

连接过多会消耗内存、进程调度和锁管理资源。

> 生产环境常用 `PgBouncer` 等连接池，把大量短连接复用到有限数据库连接上。

### 1.3 一条 SQL 的生命周期

以 `SELECT name FROM users WHERE id = 1;` 为例：

```text
客户端发送 SQL
  → Parse：词法/语法分析，生成语法树
  → Analyze：解析表、列、类型和权限
  → Rewrite：应用视图、规则等重写
  → Plan：生成候选计划并按成本选择
  → Execute：扫描、过滤、连接、聚合、返回结果
  → 事务结束：提交或回滚；需要时写 WAL
```

常见误区：

- `EXPLAIN` 只展示计划，不真正执行；`EXPLAIN ANALYZE` 会执行 SQL，写操作必须谨慎。
- 同一条 SQL 每次都不一定使用同一个计划，表统计信息、参数、数据分布和 prepared statement 都可能影响计划。
- 数据库执行快不等于接口快，网络传输、连接池等待、应用反序列化和锁等待也可能占大头。

### 1.4 Schema、database 与 search_path

一个 PostgreSQL 实例可以有多个 database；一个 database 中可以有多个 schema。

Schema 类似命名空间，表名解析会受 `search_path` 影响：

```sql
CREATE SCHEMA app;
CREATE TABLE app.users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL
);

SET search_path TO app, public;
SELECT * FROM users;       -- 可能解析为 app.users
SELECT * FROM app.users;   -- 推荐在重要 SQL 中明确限定
```

生产实践中通常避免让业务依赖不透明的 `search_path`，防止同名对象遮蔽、权限绕过或迁移环境行为不一致。

> **注意：** `search_path` 并不是强制限定查询范围，如果指定到具体路径，会跳过 `search_path`

### 1.5 高频面试题

| 问题 | 标准回答思路 | 可能追问 |
| --- | --- | --- |
| PostgreSQL 为什么支持复杂查询？ | 优化器、丰富类型、表达式、窗口函数、CTE、扩展和成熟执行器共同提供能力。 | 复杂查询慢了如何定位？ |
| PostgreSQL 是多线程还是多进程？ | 主要是多进程模型，一个连接通常对应一个 backend 进程，后台工作由不同进程承担。 | 为什么连接数不能无限增加？ |
| `EXPLAIN` 和 `EXPLAIN ANALYZE` 区别？ | 前者只生成计划，后者实际执行并记录运行统计；写 SQL 要注意副作用。 | `BUFFERS` 看什么？ |
| Schema 和 database 的区别？ | database 是隔离更强的数据库容器，schema 是其中的命名空间；跨 database 查询不是普通 SQL JOIN 的默认能力。 | 如何跨库同步？ |

---

## 2. 数据类型、表设计与 SQL 基础

### 2.1 常用数据类型选择

| 类型                      | 适用场景              | 注意事项                            |
| ----------------------- | ----------------- | ------------------------------- |
| `smallint/int/bigint`   | 整数 ID、计数          | 预估增长量；主键常用 `bigint`             |
| `numeric(p,s)`          | 金额、精确小数           | 精确但通常比浮点慢，金额不要用 `float`         |
| `real/double precision` | 科学计算、近似值          | 存在舍入误差，不适合账务                    |
| `text/varchar`/`char`   | 文本                | PostgreSQL 中无长度需求时 `text` 通常更自然 |
| `timestamp`             | 不带时区的时间           | 它不保存时区语义                        |
| `timestamptz`           | 绝对时间点             | 内部按 UTC 语义保存，展示受时区影响            |
| `jsonb`                 | 半结构化、需要索引查询的 JSON | 不要把所有关系数据都塞进 JSONB              |
| `uuid`                  | 分布式生成 ID          | 随机 UUID 可能带来索引局部性问题             |
| `bytea`                 | 二进制               | 大文件更适合对象存储，库中保存元数据              |
| `array`                 | 小规模同质列表           | 复杂多值关系优先考虑关联表                   |

### 2.2 `timestamp` 与 `timestamptz`

`timestamp without time zone` 只是一个“墙上时间”，不会自动记录它来自哪个时区

`timestamptz` 表示时间点，输入时会按会话时区转换，**输出时按当前时区展示**：

```sql
SET TIME ZONE 'Asia/Shanghai';
SELECT TIMESTAMP '2026-10-20 10:00:00';
SELECT TIMESTAMPTZ '2026-10-20 10:00:00+08';
```

订单创建时间、支付时间、日志时间一般用 `timestamptz`；

如果业务含义是“门店每天 09:00 开门”，才可能用不带时区的本地时间，并额外保存地区规则。

### 2.3 主键、唯一约束与外键

```sql
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL, 
  order_no text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_orders_order_no UNIQUE (order_no)
);
```

- 主键表达“行的稳定身份”，隐含 `NOT NULL` 和唯一性。
- 唯一约束表达业务唯一性，比应用层“先查再插”可靠。
- 外键保证引用完整性，但会带来写入检查和锁开销；高吞吐场景要结合索引和删除策略设计。
- `CHECK` 约束防止非法状态进入数据库；复杂跨行规则不能只靠普通 `CHECK`，可考虑唯一索引、排他约束、触发器或事务逻辑。

#### 2.3.1 补充

声明一个唯一性约束；**给唯一性约束起名字写法**

``` sql
CONSTRAINT uq_orders_order_no UNIQUE (order_no)
```

数据库会自动为这个唯一约束**创建一个唯一索引**（默认名字 `uq_orders_order_no`），既能保证唯一性，也能加速按 `order_no` 的查询。

**类似于：**

``` sql
order_no text NOT NULL UNIQUE

/* 删除 orders 表中名为 uq_orders_order_no 的约束 */
ALTER TABLE orders DROP CONSTRAINT uq_orders_order_no;
```

---

这一列的值**由数据库自动生成**，底层通过一个**序列（sequence）** 实现，每插入一行自动递增。

``` sql
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

`GENERATED ALWAYS` 表示：**不能手动给这一列插值**

``` sql
-- 报错：cannot insert a non-DEFAULT value into column "id"
INSERT INTO orders (id, user_id, ...) VALUES (100, 1, ...);

-- 正确：不写 id，让它自动生成
INSERT INTO orders (user_id, order_no, status) VALUES (1, 'NO001', 'pending');
```

如果想手动指定，必须显式写 `OVERRIDING SYSTEM VALUE`：

``` sql
INSERT INTO orders (id, user_id, ...) OVERRIDING SYSTEM VALUE VALUES (100, 1, ...);
```

### 2.4 `NULL` 不是空字符串也不是 0

SQL 使用三值逻辑：`TRUE`、`FALSE`、`UNKNOWN`。

`NULL = NULL` 不是 `TRUE`，而是 `UNKNOWN`：

```sql
SELECT * FROM users WHERE deleted_at = NULL;       -- 错误写法
SELECT * FROM users WHERE deleted_at IS NULL;      -- 正确
SELECT * FROM users WHERE deleted_at IS NOT NULL;
```

`COUNT(*)` 统计行数，`COUNT(column)` 不统计该列为 `NULL` 的行。使用 `COALESCE` 可以提供默认值：

```sql
SELECT user_id, COALESCE(SUM(amount), 0)
FROM payments

-- 按照 user_id 分组，每个 user_id 为一组
GROUP BY user_id;
```

> 返回列表中第一个非 `NULL` 的值

``` sql
COALESCE(a,b,c,...,d)
```

### 2.5 UPSERT：`INSERT ... ON CONFLICT`

这是**有则更新，无则插入**的写法

```sql
INSERT INTO user_settings(user_id, theme, updated_at)
VALUES (42, 'dark', now())

ON CONFLICT (user_id) DO UPDATE
SET theme = EXCLUDED.theme,
    updated_at = EXCLUDED.updated_at;
```

`EXCLUDED` 代表**本次 `INSERT` 原本想插入的那行数据**（即 `VALUES` 里的 `(42, 'dark', now())`）。

`DO UPDATE` 表示**改为更新已有那行**（而不是 `DO NOTHING` 忽略）

UPSERT **依赖唯一约束或唯一索引**，避免了“先 SELECT 判断，再 INSERT/UPDATE”的**竞态**。

若更新条件不满足，可以写 `DO UPDATE ... WHERE ...`，此时可能发生冲突但没有实际更新。

#### 2.5.1 补充

`ON CONFLICT (user_id)` 的意思是：**当插入违反了 `user_id` 上的唯一约束时，不要报错，改为执行后面的动作**。

``` sql
ON CONFLICT (user_id) DO UPDATE
```

> 前提：`user_settings` 表上 `user_id` 必须有 **唯一约束或主键**（比如 `PRIMARY KEY (user_id)` 或 `UNIQUE (user_id)`）
> 否则 `ON CONFLICT (user_id)` 会报错说找不到匹配的唯一约束/索引。

### 2.6 高频 SQL 规范

- 不使用 `SELECT *` 作为长期接口契约，避免列变更增加网络和反序列化成本。
- 分页优先使用基于索引的 Keyset Pagination：

```sql
SELECT id, created_at, title
FROM posts
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

- `OFFSET` 越大通常越慢，因为数据库仍需要扫描并丢弃前面的行。
- 动态 SQL 使用参数化查询，防止 SQL 注入并提高计划复用机会。
- 用 `IS DISTINCT FROM` 做能正确处理 `NULL` 的比较：

```sql
WHERE old_value IS DISTINCT FROM new_value
```

---

## 3. 事务、ACID 与 MVCC

### 3.1 ACID 在 PostgreSQL 中如何落地

| 特性          | PostgreSQL 机制                    |
| ----------- | -------------------------------- |
| Atomicity   | WAL、事务状态、提交/回滚和子事务               |
| Consistency | 约束、触发器、事务隔离和业务规则                 |
| Isolation   | MVCC 快照、锁、隔离级别                   |
| Durability  | WAL 持久化、`fsync`、checkpoint、备份和复制 |

“开启事务”不意味着所有读写都互相阻塞。PostgreSQL 通过 MVCC 让读看到符合快照的数据版本，读写多数情况下可以并发

需要保护同一业务资源时，仍要使用锁或提高隔离级别。

### 3.2 MVCC 的基本思想

PostgreSQL 的 MVCC（多版本并发控制）是一种核心的**并发控制机制**。

**当数据被修改时，不直接覆盖原数据，而是创建一个新版本，同时保留旧版本**。

这样，每个事务或查询都能看到一个属于自己时间点的、一致的“数据快照”，从而避免**读写操作之间的相互阻塞**。

```text
UPDATE id=1
旧版本：(xmin=T10, xmax=T20, value=old)
新版本：(xmin=T20, xmax=..., value=new)
```

不会阻塞**读于写**操作，读操作读取的是**旧数据**
#### 3.2.1 MVCC 价值

它的主要价值体现在解决并发场景下的核心矛盾：**如何让“读”和“写”可以同时高效进行**。

1. **实现“读写不阻塞”**：这是 MVCC 最直接的优点。在传统使用锁的数据库里，**读操作可能会被写操作阻塞**（等待锁释放）。而在 PostgreSQL 的 MVCC 下，读操作（`SELECT`）永远不会阻塞写操作（`INSERT`/`UPDATE`/`DELETE`），写操作也永远不会阻塞读操作。这极大地提升了多用户并发环境下的性能。
    
2. **提供事务隔离性**：通过让每个事务看到独立的**快照**，MVCC 确保了事务不会看到其他并发事务未提交的**中间状态数据**，从而避免了“脏读”等问题，为每个数据库会话提供了可靠的隔离性。
    
3. **减少锁竞争**：它避开了传统数据库系统大量依赖显式锁的方法，将锁竞争降到了最低，使得系统在多用户环境下表现更佳。

#### 3.2.2 如何工作的？

- **数据快照**：当你执行一个查询时，PostgreSQL 会记录下当前数据库的状态。这个查询能看到的数据，就定格在它开始的那一刻。即使其他事务随后修改了数据，你的查询结果也不会受影响。
    
- **行版本与隐藏字段**：在 PostgreSQL 中，`UPDATE` 操作实际上并不会直接修改原数据。它会把旧行标记为“已删除”，然后插入一个全新的行版本。为了区分这些版本，每一行数据都有一些隐藏的系统字段：
    
    - `xmin`：记录**创建**这个行版本的事务 ID。
        
    - `xmax`：记录**删除**（或更新导致旧版本失效）这个行版本的事务 ID。
        
    - 通过比较这些事务 ID 和快照中的信息，PostgreSQL 就能判断出哪些行版本对当前查询是“可见”的。

#### 3.2.3 缺点

旧版本不会立即从物理文件中消失，因此更新和删除会制造 dead tuples，需要 VACUUM 清理或回收空间。

### 3.3 四种隔离级别

PostgreSQL 支持 `Read Committed`、`Repeatable Read`、`Serializable`；SQL 标准的 `Read Uncommitted` 在 PostgreSQL 中按 `Read Committed` 处理：

| 隔离级别 | 快照特点 | 典型现象/代价 |
| --- | --- | --- |
| Read Committed | 每条语句开始时获得快照 | 同一事务两次查询可能看到不同已提交结果 |
| Repeatable Read | 事务开始时获得稳定快照 | 事务内重复读稳定；并发冲突可能在提交/写入时报错 |
| Serializable | 在可串行化语义下执行 | 可能出现 serialization failure，需要重试 |

```sql
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT ...;
COMMIT;
```

Read Committed 不是“没有隔离”。它阻止读到未提交数据，但不能保证一个长事务内多次查询结果一致。Serializable 也不是“绝对不报错”，应用必须捕获 `serialization_failure` 并重试整个事务。

### 3.4 快照与可见性示例

会话 A：

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- 未提交
```

会话 B：

```sql
SELECT balance FROM accounts WHERE id = 1;
```

在普通隔离级别下，会话 B 不会读到 A 的未提交修改，而是**读到旧版本**。

若 B 对该行执行更新，通常会等待 A 提交/回滚，然后根据新的行版本重新判断条件(因为存在**行级锁**)。

### 3.5 事务边界与长事务

应用层事务应尽量短，并且只覆盖必须原子化的操作：

```text
开启事务
  → 校验/锁定必要资源
  → 写入业务数据
  → 写入 outbox 事件
  → 提交
  → 事务外异步投递或消费事件
```

长事务会：

- 保留旧快照，使 VACUUM 无法清理部分 dead tuples；
- 增加锁持有时间和死锁风险；
- 让复制回放、DDL、连接池资源受到影响；
- 在 `idle in transaction` 时尤其危险：业务没有执行 SQL，却仍保持事务快照。

排查：

```sql
SELECT pid, usename, state, xact_start, query_start,
       now() - xact_start AS xact_age, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start;
```

### 3.6 事务异常必须重试什么

通常需要重试整个事务，而不是只重试最后一条 SQL：

- `serialization_failure`：串行化冲突；
- `deadlock_detected`：死锁被检测并取消一个事务；
- 临时网络断开或主备切换导致的连接异常。

重试必须有次数上限、指数退避和幂等设计。已经提交成功但客户端没收到响应时，不能盲目重试非幂等操作，应使用业务唯一号或请求幂等键。

---

## 4. 锁、并发控制与死锁

锁的作用是**防止冲突**

锁的维度：**范围和强度**

### 4.1 锁的分类

PostgreSQL 有**表级锁**、**行级锁**、页级/内部锁、谓词锁和 advisory lock。

常见**表锁模式**包括 `ACCESS SHARE`、`ROW SHARE`、`ROW EXCLUSIVE`、`SHARE`、`SHARE ROW EXCLUSIVE`、`EXCLUSIVE`、`ACCESS EXCLUSIVE`。

`ACCESS EXCLUSIVE` 冲突范围最大，很多 DDL 会持有它。

行锁常见语义：

```sql
SELECT * FROM inventory
WHERE sku = 'A-1'
FOR UPDATE;
```

`FOR UPDATE` 表示锁住选中的行，其他事务对这些行做冲突更新或再次加冲突锁时需要等待。

在当前事务结束后会释放改锁

`FOR NO KEY UPDATE`、`FOR SHARE`、`FOR KEY SHARE` 适用于更细粒度的保护需求。

#### 4.1.1 表级锁

表级锁作用是协调多个事务对**整张表**的**并发访问**；PG 会在执行 SQL 时自动获取相应的表锁，也可以通过 `LOCK TABLE` 显式指定。

`ACCESS SHARE` 作用是在读取改表时，表不会被**删除/修改结构**；每次 `SELECT` 时系统自动添加

`ROW SHARE` 作用是允许其他事务同时读取和写入，但阻止有人对整个表做**排他性操作**。

`ROW EXCLUSIVE` 作用是**锁定修改的行**，允许多个事务**同时写不同行**，但阻止对整张表做需要数据稳定的操作；例如添加索引

``` text
事务A: UPDATE orders SET status='paid' WHERE id=100;  -- 自动加 ROW EXCLUSIVE
事务B: UPDATE orders SET status='paid' WHERE id=200;  -- 也加 ROW EXCLUSIVE

但:

事务A: UPDATE orders SET status='paid' WHERE id=100;  -- ROW EXCLUSIVE
事务B: CREATE INDEX ON orders(status);                 -- 需要 SHARE
```

`SHARE` 作用是在 `CREATE INDEX` 时需要表数据稳定、不被修改

```
事务A: CREATE INDEX ON orders(status);   -- 自动加 SHARE
事务B: UPDATE orders SET status='paid' WHERE id=100;  -- 需要 ROW EXCLUSIVE

但

事务A: CREATE INDEX ON orders(status);   -- SHARE
事务B: SELECT * FROM orders WHERE id=100; -- ACCESS SHARE
```

### 4.2 `FOR UPDATE` 与库存扣减

```sql
BEGIN;
SELECT stock
FROM inventory
WHERE sku = 'A-1'
FOR UPDATE;

-- 应用检查 stock > 0 后更新
UPDATE inventory
SET stock = stock - 1
WHERE sku = 'A-1';
COMMIT;
```

更简洁的方式是把条件放进 UPDATE，让数据库原子判断：

```sql
UPDATE inventory
SET stock = stock - 1
WHERE sku = 'A-1' AND stock > 0
RETURNING stock;
```

应用根据 `RETURNING` **是否返回行**判断扣减成功。

高并发下后者通常减少一次往返，但仍要结合订单、幂等和库存超卖规则设计。

### 4.3 死锁是如何产生的

事务 A 先锁行 1，再等待行 2；事务 B 先锁行 2，再等待行 1，**形成环路：**

```text
A 持有 row-1 ──等待──> row-2
B 持有 row-2 ──等待──> row-1
```

PostgreSQL 的**死锁检测器**会发现环路，取消其中一个事务并返回 `deadlock_detected`。预防手段：

- 所有业务以一致顺序访问资源，例如按主键升序加锁；
- 减少事务范围和锁持有时间；
- 为过滤条件提供索引，避免锁等待期间扫描大量数据；
- 对可重试异常实现完整事务重试；
- 使用 `lock_timeout` 防止无限等待，但它不是死锁解决方案。

### 4.4 查看锁等待

找出数据库中谁被阻塞的了；列出所有正在等待锁的会话，以及阻塞它们的会话

```sql
SELECT blocked.pid AS blocked_pid,
       blocked.query AS blocked_query,
       blocking.pid AS blocking_pid,
       blocking.query AS blocking_query,
       now() - blocked.query_start AS blocked_for
FROM pg_stat_activity blocked  --  被阻塞的进程
JOIN pg_stat_activity blocking  --  正在阻塞别人的进程；也就是持有锁
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));
```

查看当前事务和锁：

```sql
SELECT pid, locktype, mode, granted, relation::regclass, page, tuple
FROM pg_locks
ORDER BY granted, pid;
```

#### 4.4.1 补充

`pg_stat_activity` 进程活动视图；为每个服务器进程显示一行，记录其关联的用户会话和查询状态；用于排查数据库问题

可以从中看到进程 ID（`pid`）、当前执行的查询（`query`）、查询开始时间（`query_start`）、连接状态（`state`）等信息。

---

`pg_blocking_pids()` 阻塞关系函数；函数接受一个进程 ID 作为参数，返回一个整数数组，里面包含了所有正在阻塞该指定进程的 PID。

`pg_terminate_backend(blocking_pid)` 终止阻塞者

`ANY` 和**查询结果集**中每一个结果进行比较，有一个满足就返回 `true`

### 4.5 Advisory Lock

Advisory lock 是应用自定义语义的锁，数据库不会理解它保护了什么：

```sql
SELECT pg_advisory_xact_lock(12345); -- 事务结束自动释放
```

适合协调数据库内不存在明确行的任务，例如同一租户的单实例任务。它不会自动保护普通行，必须保证所有参与者都遵守同一把 advisory lock；否则它只是一个没有约束力的约定。

---

## 5. WAL、Checkpoint 与崩溃恢复

### 5.1 WAL 是什么

WAL 核心规则是：**任何对数据文件的修改，都必须先把这个修改操作记录到 WAL 里，然后才能去改真正的数据文件**。

WAL（Write-Ahead Logging，预写式日志）是 PostgreSQL 保证数据安全与性能的核心机制。

因此数据库崩溃后可以通过**重放 WAL**，把数据页**恢复到一致状态**，而不必在每次事务提交时同步写所有数据页。

```text
事务修改
  → 共享缓冲区中的数据页变脏
  → 生成 WAL record
  → WAL writer / commit flush 将 WAL 写入并按策略持久化
  → 提交成功
  → 之后 checkpoint/background writer 再把数据页写回
```

**脏页：** 表示修改了内存中的数据页，但该数据页还没有写入到磁盘中，内存中的页内容与磁盘上的副本不一致，该页就被标记为“脏页”（dirty page）

**为什么会变脏：** PG为了性能，它先把目标页从磁盘读入共享缓冲区（shared buffers），直接在内存里修改

事务提交时 PG 保证的是 WAL 先落盘，而不是脏页写回磁盘

WAL 记录通常是物理或逻辑层面的修改描述，不等价于“保存了每条 SQL 文本”。

> **示例：**

假设你正在操作银行转账，从账户 A 扣 100 元，给账户 B 加 100 元。

- **没有 WAL 时**：数据库需要直接去磁盘上找到 A 和 B 的数据页进行修改。如果在改完 A、还没改 B 的时候突然断电，磁盘上的数据就错乱了（A 少了钱，B 没收到）。
    
- **有 WAL 时**：数据库会先在 WAL 日志里快速写下一条记录：“A 减 100，B 加 100”。只要这条日志成功落盘，即便此时真正的数据文件还没来得及改就断电了，重启后 PostgreSQL 也能照着日志把没做完的活重新干一遍，保证数据不出错。

#### 5.1.1 作用

性能优化

崩溃恢复

### 5.2 `fsync`、`synchronous_commit` 与持久性

`fsync` 和 `synchronous_commit` 是 PostgreSQL 控制“数据到底有多安全”的两个关键参数。

**`fsync` 决定数据库整体有没有“损坏”的风险，而 `synchronous_commit` 决定提交事务时要不要“等”数据落盘。**

- `fsync=on` 是生产环境保证崩溃一致性的基础，关闭可能造成不可恢复的数据损坏风险。
	
- `synchronous_commit=on` 通常要求本地 WAL 达到相应持久化条件后再向客户端确认提交。
	
- `synchronous_commit=off` 可以降低提交延迟，但数据库崩溃时可能丢失最近已向客户端确认的事务；一般是“可接受少量数据丢失”的性能换取。
	
- `full_page_writes` 用于降低部分页写入（如 torn page）造成的恢复问题，通常不应随意关闭。

面试回答不能把“WAL 开启”直接等同于“永不丢数据”。数据丢失窗口还受提交策略、磁盘、复制确认、备份和故障类型影响。

---

`synchronous_commit=off` 数据库把 WAL 记录交给后台，**立刻**返回“成功”，不等落盘


---
### 5.3 Checkpoint

Checkpoint 表示某个时间点之前，所有已提交的数据修改都已经真正**写到了磁盘的数据文件中**。

这样如果数据库崩溃，恢复时就不需要从头重放所有 WAL 日志，只需要从最近的一个检查点开始重放即可

Checkpoint 太频繁：

- 写放大、磁盘 IO 峰值增加；
- 可能造成业务延迟抖动。

Checkpoint 间隔太长：

- WAL 占用增长；
- 崩溃恢复需要重放更多 WAL，恢复时间变长。

现代版本通常使用 `max_wal_size`、`checkpoint_timeout`、`checkpoint_completion_target` 等参数协调吞吐和恢复时间，并观察 checkpoint 写入、WAL 生成速率和磁盘延迟。

#### 5.3.1 工作流程

**Checkpoint 既是一个“动作”（做检查点这件事），也是一个“标记”（检查点记录）**

当（或数据库自动）触发一次 checkpoint 时，后台实际执行的是：

1. **刷写脏页（“写磁盘”的部分）**：把共享内存缓冲区（Shared Buffers）里所有被修改过、但还没写回数据文件的页，逐个写到磁盘上对应的数据文件中。这一步是真正的 I/O 操作。
    
2. **写入检查点记录（“标记”的部分）**：等上面所有脏页都刷完后，在 WAL 日志里写一条特殊记录，意思是“截至此刻，内存里所有脏页都已经落盘了，从这里往后恢复就行”。

### 5.4 崩溃恢复流程

数据库异常退出后：

1. 启动进程定位最近的 checkpoint。
2. 从 checkpoint 记录开始读取 WAL。
3. 重放必要的 WAL，使数据页达到一致状态。
4. 清理未完成事务的影响，恢复到最后一个一致状态。
5. 数据库进入可接受连接的状态。

如果是用户误删、逻辑错误或坏数据，WAL 恢复只能恢复到某个时间点，不能自动告诉你“哪一行误删了”。

这类问题需要基础备份、归档 WAL、PITR 和审计方案。

### 5.5 面试题：WAL 为什么能提升性能

**顺序写代替了随机写：** 随机更新数据页可以延后并合并，而提交时主要保证顺序追加的 WAL 达到持久化条件。

**延迟时间短：** 顺序写通常比大量随机写更高效

**批量与合并：**

**写放大被消除：** WAL 只需要一条精简的记录；不需要将数据页取到磁盘再修改

 WAL 也会增加写入量，索引越多、更新越多、同步复制越严格，WAL 压力越大。

---

## 6. 索引：B-Tree、Hash、GIN、GiST、BRIN

### 6.1 索引的本质与代价

索引是额外的数据结构，用空间、写入成本和维护成本，换取更快的定位或排序。索引不是越多越好：

- INSERT/UPDATE/DELETE 需要维护相关索引；
- 索引占磁盘和缓存，可能挤压热数据；
- 优化器需要在多个索引和计划间选择；
- 低选择性列或极少使用的索引可能不值得保留。

> 索引相当于一本书的目录，用于缩小查找范围，快速定位数据
#### 6.1.1 B+ 树索引

数据以文件的形式存储在磁盘中

文件又由多个数据页组成

给每一个数据页标号，再把每一个数据页中最小序号提取出来，组成索引页

MySQL 采用的就是 B+ 树索引

### 6.2 B-Tree

B-Tree 是默认索引，适合等值、范围、排序和前缀匹配：

```sql
CREATE INDEX idx_orders_user_created
ON orders (user_id, created_at DESC);
```

适合：

```sql
WHERE user_id = 42
WHERE user_id = 42 AND created_at >= now() - interval '7 days'
ORDER BY user_id, created_at DESC
```

联合索引遵循左前缀和排序匹配原则，但不是机械的“必须使用第一列过滤”。优化器会结合选择性、扫描成本和排序成本决定计划。索引列顺序应围绕高频查询、等值条件、范围条件和排序需求设计。

### 6.3 部分索引与表达式索引

部分索引只索引满足谓词的行：

```sql
CREATE INDEX idx_orders_pending
ON orders (created_at)
WHERE status = 'pending';
```

适合“活跃数据远少于全表”的场景。查询条件需要能被优化器证明与谓词匹配，否则可能无法使用。

表达式索引：

```sql
CREATE INDEX idx_users_lower_email ON users (lower(email));
SELECT * FROM users WHERE lower(email) = lower($1);
```

表达式中的函数必须稳定到足以保证索引语义；查询写法也要与索引表达式一致。不要为了每个可能的函数调用都建立索引。

### 6.4 覆盖索引与 `INCLUDE`

```sql
CREATE INDEX idx_orders_user_created_cover
ON orders (user_id, created_at DESC) INCLUDE (status, amount);
```

`INCLUDE` 列主要用于覆盖查询，不参与索引排序和搜索键。满足条件时可能使用 Index Only Scan，但是否真的不访问堆表还取决于 visibility map：如果页面的可见性信息不满足，仍需回表确认。

### 6.5 GIN：多值和全文检索

GIN(Generalized Inverted Index，通用倒排索引)本质上就是**将一行数据拆成多个键**，每个键都指向包含它的行。

GIN 适合数组、JSONB、全文检索等“一个文档对应多个索引键”的场景：

```sql
CREATE INDEX idx_products_attrs ON products USING gin (attrs jsonb_path_ops);
SELECT * FROM products WHERE attrs @> '{"brand":"acme"}';
```

> `@>` 是"左侧 JSONB 是否包含右侧 JSONB"。注意语义是**结构包含**，不是字符串匹配：

GIN 读取可能很快，但写入和索引体积通常更重。高频写表要评估 pending list、批量写入、autovacuum 和查询模式。

[[PostgreSQL 学习笔记#JSONB]]

### 6.6 GiST：范围、空间和相似结构

GiST 是可扩展的通用索引框架，常见于几何对象、范围类型、全文检索等。范围防重叠可以使用排他约束：

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE room_bookings
ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
  room_id WITH =,
  booked_range WITH &&
);
```

这比应用层“先查有没有重叠，再插入”更能抵抗并发竞态。

### 6.7 BRIN：物理顺序相关的大表

BRIN 不记录每一行，而记录数据块范围摘要。

因为数据在数据库中是按照时间顺序插入的，那么某一块数据中时间应该是相近的。

适合按时间近似递增写入、物理顺序与查询条件相关的超大表：

```sql
CREATE INDEX idx_events_created_brin
ON events USING brin (created_at);
```

它体积小、维护成本低，但只适合数据相关性较好的列；随机分布数据可能收益很差。可以用 `pg_stats.correlation` 辅助判断。

### 6.8 为什么有索引却不用

常见原因：

- 返回行比例太高，顺序扫描更便宜；
- 条件选择性低；
- 对列做了未匹配的函数或隐式类型转换；
- 统计信息过期，优化器误判基数；
- 表太小，扫描成本低；
- 参数化查询生成了不适合当前参数的 generic plan；
- 排序、回表、随机 IO 的综合成本超过顺序扫描。

不要直接 `SET enable_seqscan = off` 当成修复方案。它只适合诊断“如果强制走索引会怎样”，生产应修正统计信息、SQL、索引或数据分布问题。

---

## 7. 查询优化器与 EXPLAIN

### 7.1 成本优化器在估算什么

优化器根据统计信息估算每个候选计划的：

- 扫描行数（cardinality）；
- CPU 运算成本；
- 随机/顺序 IO 成本；
- 排序、哈希、连接和并行执行成本。

它不是测量真实执行时间，而是根据统计信息和成本参数做选择。因此“计划不符合直觉”常常意味着统计信息或数据相关性与优化器假设不一致。

### 7.2 常用 EXPLAIN

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, SETTINGS)
SELECT o.id, o.amount
FROM orders o
WHERE o.user_id = 42
  AND o.created_at >= now() - interval '30 days';
```

重点关注：

| 字段 | 含义 |
| --- | --- |
| `cost=start..total` | 优化器估算成本，不是毫秒 |
| `rows` | 估算输出行数 |
| `actual time` | 实际运行时间，通常为节点启动/完成时间 |
| `loops` | 节点重复执行次数 |
| `Buffers: shared hit/read` | 缓存命中和从磁盘读取情况 |
| `Rows Removed by Filter` | 扫描后被过滤的行 |
| `Planning Time/Execution Time` | 规划和执行耗时 |

真正要比较的是估算 rows 与 actual rows 的偏差、热点节点、循环次数、回表数量和 IO，而不是看到“Index Scan”就认为一定快。

### 7.3 常见扫描节点

- `Seq Scan`：顺序扫描表，适合小表或返回大量行。
- `Index Scan`：走索引后回表取数据，选择性高时常见。
- `Index Only Scan`：尽量只读索引，依赖覆盖索引和 visibility map。
- `Bitmap Index Scan + Bitmap Heap Scan`：先批量收集 TID，再按数据页访问，适合中等选择性。
- `Tid Scan`：按物理 TID 定位，业务 SQL 中少见。

### 7.4 JOIN 计划

- `Nested Loop`：外表行少、内表有索引时非常有效；外表大时可能灾难性放大。
- `Hash Join`：构建哈希表后匹配，适合等值连接和中等数据量；受 `work_mem` 影响。
- `Merge Join`：两边按连接键有序时高效，可能需要排序。

示例：若计划显示 `Nested Loop` 的外层实际输出 100 万行，内层节点 loops 100 万次，即使单次只需 1 ms 也可能很慢。应先检查连接顺序、过滤是否下推、内层索引和基数估算。

### 7.5 排序、哈希与 `work_mem`

`work_mem` 是**每个操作节点、每个并发执行实例**可能使用的内存，不是整个连接只使用一次。一个查询有多个排序、哈希和并行 worker 时，实际内存可能是参数值的多倍。

判断是否落盘：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM events ORDER BY created_at DESC;
```

若看到 external merge、临时文件或大量 temp read/write，说明排序/哈希可能溢出磁盘。提高 `work_mem` 要限定作用域并评估并发峰值：

```sql
BEGIN;
SET LOCAL work_mem = '128MB';
-- 单个已确认的大查询
...
COMMIT;
```

### 7.6 优化 SQL 的通用流程

1. 记录真实 SQL、参数和线上耗时，不凭感觉改索引。
2. 用 `EXPLAIN (ANALYZE, BUFFERS)` 获取真实计划。
3. 找估算行数与实际行数偏差最大的节点。
4. 检查过滤下推、连接条件、索引、排序和回表。
5. 更新统计信息或调整统计目标，重新执行对比。
6. 在接近生产数据量和并发的环境验证，关注 p95/p99，不只看单次平均时间。

---

## 8. VACUUM、统计信息与膨胀

### 8.1 为什么需要 VACUUM

因为 MVCC 的 UPDATE/DELETE 会留下旧行版本。VACUUM 的主要职责包括：

- 标记 dead tuples 可复用的空间；
- 更新 visibility map 和 free space map；
- 帮助 Index Only Scan 判断页面是否全可见；
- 冻结旧事务 ID，防止 XID wraparound；
- 配合 autovacuum 维护表和索引健康。

普通 VACUUM 通常不把文件缩回操作系统，而是让空间在表内复用。需要物理重写的 `VACUUM FULL` 会持有更强锁、需要额外磁盘空间并造成较大影响，不能当作日常维护。

### 8.2 VACUUM 与 ANALYZE 的区别

- `VACUUM` 处理旧版本、可见性和空间复用。
- `ANALYZE` 采样数据并更新列统计信息，帮助优化器估算选择性和基数。
- `VACUUM ANALYZE` 同时执行二者，但并不意味着每次都必须手动跑。

高频批量导入、批量删除或数据分布突变后，应考虑手动 `ANALYZE` 或调整自动分析策略。

### 8.3 Autovacuum 为什么可能追不上

常见原因：

- 表更新/删除频率高，触发阈值太高；
- autovacuum worker 数量或 cost delay 不适合负载；
- 长事务阻止旧版本清理；
- 大表默认阈值按比例增长，实际需要清理很多行后才触发；
- 磁盘 IO 受限或索引维护成本高。

可以按表设置：

```sql
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.01
);
```

不要盲目把全局 scale factor 调到极小；高频写表可按表定制，并配合监控 dead tuples、最后一次 vacuum/analyze、表大小和长事务。

### 8.4 XID wraparound

事务 ID 是有限宽度的，过旧的事务 ID 需要冻结，否则会出现可见性判断回绕风险。PostgreSQL 会对接近 wraparound 的表提高维护优先级；如果系统进入 wraparound 风险，可能强制阻止新事务。

生产监控至少关注：

```sql
SELECT datname, age(datfrozenxid) AS xid_age
FROM pg_database
ORDER BY xid_age DESC;
```

表级别可结合 `pg_class.relfrozenxid`、`pg_stat_all_tables` 分析。处理此类告警时应立即排查长事务、autovacuum 阻塞和磁盘空间，而不是简单重启。

### 8.5 表膨胀与索引膨胀

膨胀来自频繁更新删除、长事务、autovacuum 不及时、索引页分裂和填充模式。影响包括：

- 扫描更多数据页；
- 缓存命中率下降；
- 备份、VACUUM 和恢复时间增加。

处理要先确认问题：`pg_stat_user_tables`、`pgstattuple`（扩展）、表/索引大小和执行计划。普通 VACUUM 适合回收可复用空间；`REINDEX CONCURRENTLY` 可减少业务阻塞地重建索引；`VACUUM FULL` 或表重写需要安排窗口。

---

## 9. JOIN、聚合、排序与高级 SQL

### 9.1 JOIN 的语义

```sql
SELECT u.id, u.name, o.id AS order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active';
```

`LEFT JOIN` 会保留左表没有匹配的行；如果把右表条件写在 `WHERE` 中，可能把它变成类似 INNER JOIN：

```sql
-- 会过滤掉没有已支付订单的用户
WHERE o.status = 'paid'
```

如果希望保留没有已支付订单的用户，应将条件放到 `ON`：

```sql
LEFT JOIN orders o
  ON o.user_id = u.id AND o.status = 'paid'
```

### 9.2 聚合与窗口函数

聚合会把多行压缩成分组结果；窗口函数保留原始行，并在窗口上计算：

```sql
SELECT user_id,
       order_id,
       amount,
       ROW_NUMBER() OVER (
         PARTITION BY user_id ORDER BY created_at DESC, order_id DESC
       ) AS rn
FROM orders;
```

查询每个用户最新一条订单：

```sql
SELECT *
FROM (
  SELECT o.*, ROW_NUMBER() OVER (
    PARTITION BY user_id ORDER BY created_at DESC, id DESC
  ) AS rn
  FROM orders o
) t
WHERE rn = 1;
```

也可以使用 PostgreSQL 的 `DISTINCT ON`：

```sql
SELECT DISTINCT ON (user_id) *
FROM orders
ORDER BY user_id, created_at DESC, id DESC;
```

`DISTINCT ON` 必须注意 `ORDER BY` 的前缀匹配，适合 PostgreSQL 特有场景；跨数据库可移植性不如窗口函数。

### 9.3 CTE 与递归查询

CTE 提升复杂 SQL 可读性，也可以用于递归树结构：

```sql
WITH RECURSIVE org AS (
  SELECT id, parent_id, name, 0 AS depth
  FROM departments
  WHERE id = 1
  UNION ALL
  SELECT d.id, d.parent_id, d.name, o.depth + 1
  FROM departments d
  JOIN org o ON d.parent_id = o.id
)
SELECT * FROM org ORDER BY depth, id;
```

不要简单认为 CTE 一定会物化或一定会优化展开，具体行为与 PostgreSQL 版本、`MATERIALIZED/NOT MATERIALIZED` 和查询形态有关。需要控制重复计算或稳定执行顺序时再显式指定。

### 9.4 `EXISTS` 与 `IN`

判断是否存在关联数据时，`EXISTS` 通常表达得更清晰，并且找到一条匹配即可停止：

```sql
SELECT u.*
FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.status = 'paid'
);
```

`NOT IN` 遇到子查询返回 `NULL` 可能产生反直觉结果，反连接更稳妥：

```sql
SELECT u.*
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM blacklist b WHERE b.user_id = u.id
);
```

---

## 10. 分区表、约束与大表治理

### 10.1 为什么需要分区

分区把逻辑大表拆成多个物理分区，收益包括：

- 分区裁剪减少扫描范围；
- 按时间归档和删除更简单；
- 不同分区可使用不同存储和维护策略；
- 降低单次 VACUUM、索引维护和备份管理压力。

分区不是自动性能优化。分区键、查询条件、分区数量和写入热点设计不当，可能带来规划开销、跨分区扫描、全局唯一性限制和运维复杂度。

### 10.2 RANGE 分区示例

```sql
CREATE TABLE events (
  id bigint NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL
) PARTITION BY RANGE (occurred_at);

CREATE TABLE events_2026_10 PARTITION OF events
FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE events_default PARTITION OF events DEFAULT;
```

时间范围采用左闭右开，避免边界重复。生产中要提前创建未来分区并监控 default 分区，否则新数据落入 default 后，后续创建目标分区可能需要先迁移数据。

### 10.3 分区裁剪与索引

```sql
SELECT count(*)
FROM events
WHERE occurred_at >= '2026-10-01'
  AND occurred_at <  '2026-11-01';
```

如果条件可被优化器识别，计划中只访问目标分区。对每个分区建立本地索引是常见方案；跨分区唯一约束通常需要分区键参与，若业务要求全局唯一，必须额外设计全局序列/ID 服务或其他约束机制。

### 10.4 分区、分表、分库的区别

| 方式 | 解决的问题 | 复杂度 |
| --- | --- | --- |
| 分区 | 单库内大表管理、裁剪、归档 | 中 |
| 分表 | 应用或中间层拆成多张表 | 高，SQL/路由复杂 |
| 分库 | 跨实例扩容、隔离租户/业务 | 更高，事务和查询受限 |

优先从单库分区和合理索引开始，只有单实例容量、写入或隔离需求真正超过边界时再分库分片。

---

## 11. 连接、内存、并发与性能调优

### 11.1 连接池

数据库连接不是轻量协程。高并发服务若每个请求都直接创建连接，会出现连接风暴。连接池要设置：

- 最大连接数和每个服务的配额；
- 获取连接超时；
- 空闲连接回收；
- 事务状态重置，例如 `DISCARD ALL` 或池化模式对应的清理；
- 与数据库 `max_connections`、副本数、后台维护连接预留相匹配。

连接池不能掩盖慢 SQL。池中连接全被长查询占满时，应用表现为“数据库连接超时”，根因仍可能是锁、IO、计划或事务设计。

### 11.2 内存参数的边界

- `shared_buffers` 是 PostgreSQL 自己管理的共享缓存，不是越大越好，还要给 OS 页缓存、连接和后台进程留空间。
- `work_mem` 按执行节点/并发实例消耗，不能按“总内存除连接数”简单估算。
- `maintenance_work_mem` 影响 VACUUM、CREATE INDEX 等维护操作，autovacuum 还涉及单独的 worker 使用。
- `effective_cache_size` 是给优化器的缓存可用量估计，不是实际分配的内存。

### 11.3 并行查询

PostgreSQL 可为大表扫描、聚合、部分连接使用并行 worker。是否并行取决于成本、SQL 类型、表大小、参数和并行度限制。并行不是免费加速：

- worker 启动和协调有开销；
- 并行 worker 消耗 CPU、内存和连接资源；
- 小查询可能因并行反而变慢；
- 写操作和某些函数/扩展可能不适合并行。

应通过 `EXPLAIN` 观察 `Gather/Gather Merge`，结合 CPU 利用率和 p95 验证，不要只提高 `max_parallel_workers`。

### 11.4 延迟排查四象限

接口变慢时先区分：

```text
连接池等待？ → pg_stat_activity 看 active/idle、应用池指标
锁等待？     → pg_blocking_pids、pg_locks、wait_event
CPU/计划？    → EXPLAIN ANALYZE、CPU、rows 估算偏差
IO/存储？     → BUFFERS、temp 文件、WAL、磁盘延迟
```

SQL 本身的 `Execution Time` 不包含所有应用端等待，因此要关联 trace、连接池、数据库等待事件和宿主机指标。

---

## 12. 复制、读写分离与高可用

### 12.1 物理流复制

物理复制从主库发送 WAL，备库接收并回放，通常要求主备数据库大版本兼容、数据目录级别一致。备库可以用于只读查询、备份和故障切换。

```text
Primary
  └─ WAL sender → network → WAL receiver
                              └─ startup/replay → standby data files
```

物理复制复制的是数据库页面变化语义，不是单条 SQL，因此可以保持较完整的物理一致性，但通常不能跨大版本直接复制。

### 12.2 异步与同步复制

- 异步复制：主库提交不等待备库确认，延迟低；主库故障时可能丢失尚未到达备库的 WAL。
- 同步复制：提交等待一个或多个同步备库达到确认条件，数据丢失风险更低，但受网络和备库性能影响。

同步复制也要明确确认的是“收到 WAL”“写入 WAL”还是“回放完成”，不同配置对应不同 RPO/RTO。高可用设计必须把业务能接受的数据丢失窗口说清楚。

### 12.3 读写分离的一致性陷阱

主库刚写入后立即读备库，可能由于复制延迟读不到刚提交的数据。解决思路：

- 写后短时间强制读主库；
- 根据 LSN 等待备库追上目标位置；
- 对强一致读取建立路由标记；
- 对最终一致页面接受短暂旧数据。

不能把“SELECT 都发备库”当作读写分离的完整方案。还要处理事务、会话粘滞、故障切换、备库只读错误和连接池路由。

### 12.4 高可用组件与脑裂

PostgreSQL 自身提供复制原语，但自动选主、健康检查、VIP/DNS、fencing、配置管理和客户端路由通常需要 Patroni、repmgr、云厂商服务或自研控制面。关键是防止两个节点同时认为自己是主库，即脑裂。切换前要确认旧主已隔离或 fencing，不能只修改一个 DNS 记录。

### 12.5 复制监控

主库：

```sql
SELECT application_name, client_addr, state, sync_state,
       write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
```

备库：

```sql
SELECT pg_is_in_recovery(),
       pg_last_wal_receive_lsn(),
       pg_last_wal_replay_lsn(),
       now() - pg_last_xact_replay_timestamp() AS replay_delay;
```

还要监控 replication slot 的 WAL 保留量。slot 长期不消费会让主库 WAL 持续增长，最终打满磁盘。

---

## 13. 逻辑复制、CDC 与数据迁移

### 13.1 逻辑复制是什么

逻辑复制基于发布者/订阅者，发送表级别的行变更语义，允许选择表、过滤对象，并支持跨大版本迁移等场景：

```sql
CREATE PUBLICATION app_pub FOR TABLE users, orders;
-- 订阅端创建 subscription，连接到发布端
```

它通常不复制所有 DDL、序列状态、用户权限和数据库级对象，迁移方案必须单独处理 schema、sequence、扩展和大对象。

### 13.2 CDC 的可靠性问题

CDC 消费者要考虑：

- 位点保存与重复消费；
- 事务边界和提交顺序；
- schema 变更兼容；
- 大事务导致延迟和内存压力；
- 下游失败时 WAL/slot 保留增长；
- “数据库已提交但消息未发送”的一致性。

Outbox 模式是常见方案：业务数据和事件写入同一个数据库事务，再由 CDC 或后台任务投递消息：

```sql
BEGIN;
INSERT INTO orders(...);
INSERT INTO outbox_events(event_id, aggregate_id, payload)
VALUES ($1, $2, $3);
COMMIT;
```

这不是 exactly-once 的万能保证，下游仍要用事件 ID 幂等处理。

---

## 14. 安全、权限与数据库对象

### 14.1 角色与最小权限

PostgreSQL 使用 role 统一表示用户和角色：

```sql
CREATE ROLE app_reader NOLOGIN;
CREATE ROLE app_user LOGIN PASSWORD 'use-secret-manager';
GRANT app_reader TO app_user;
GRANT CONNECT ON DATABASE appdb TO app_user;
GRANT USAGE ON SCHEMA app TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_reader;
```

生产应用账户不应拥有超级用户、任意建库、任意扩展和全库 DDL 权限。迁移账户和运行时账户分离，密码放在密钥系统中，定期轮换。

### 14.2 默认权限与行级安全

默认权限用于约束未来创建的对象：

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA app
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
```

RLS（Row-Level Security）可让不同租户只看到自己的行：

```sql
ALTER TABLE tenant_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_orders
USING (tenant_id = current_setting('app.tenant_id')::bigint);
```

RLS 设计要验证连接池中的 session 参数是否正确清理，避免租户上下文串线；同时关注策略对查询计划和索引使用的影响。

### 14.3 SQL 注入与参数化

不要拼接用户输入：

```js
// 错误：`SELECT * FROM users WHERE id = ${id}`
// 正确：使用驱动提供的参数绑定：SELECT ... WHERE id = $1
```

表名、列名不能简单用值参数绑定，需要白名单映射并使用驱动的 identifier 转义能力。数据库权限是最后一道防线，不替代应用层参数化。

---

## 15. 生产监控、故障排查与备份恢复

### 15.1 关键系统视图

当前连接、查询和等待：

```sql
SELECT pid, usename, application_name, client_addr, state,
       wait_event_type, wait_event, xact_start, query_start, query
FROM pg_stat_activity
WHERE pid <> pg_backend_pid();
```

表访问和死元组：

```sql
SELECT relname, seq_scan, idx_scan, n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum, last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

索引使用和扫描：

```sql
SELECT relname, indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

配合 `pg_stat_statements` 关注总耗时、平均耗时、调用次数、共享块读写、临时块和 WAL；不要只按单次耗时排序，高频中等慢 SQL 可能贡献更多总耗时。

### 15.2 慢查询排查清单

1. 确认慢的是数据库执行、锁等待、连接池等待还是网络。
2. 拿到真实 SQL 和绑定参数，避免只看 ORM 模板。
3. 使用 `EXPLAIN (ANALYZE, BUFFERS)`，注意写操作副作用。
4. 比较 estimated rows 与 actual rows，检查统计信息。
5. 检查索引、过滤下推、JOIN 顺序、排序/哈希是否落盘。
6. 检查长事务、锁等待、IO、CPU、WAL 和 autovacuum 竞争。
7. 修改后在近似生产数据和并发下验证，并保留回滚方案。

### 15.3 备份类型与 PITR

- 逻辑备份：`pg_dump/pg_restore`，粒度灵活，适合对象迁移和小中型库；大库恢复速度和一致性窗口需评估。
- 物理基础备份：复制数据库集群目录，适合快速恢复和搭建备库。
- WAL 归档 + 基础备份：支持 PITR（Point-in-Time Recovery），可恢复到某个时间点。

PITR 的基本链路：

```text
基础备份 + 连续归档 WAL
        → 恢复基础备份
        → 按顺序重放 WAL
        → 在目标时间点停止恢复
```

备份是否可靠必须通过定期恢复演练证明。只看“备份任务成功”不够，还要验证恢复时长、备份可读性、权限、扩展、序列和业务验收。

### 15.4 故障场景回答模板

**磁盘快满**：先确认数据目录、WAL、归档、临时文件还是日志占用；保护系统可用性，停止非必要写入或扩容；检查 replication slot、长事务、失败归档；清理必须可回溯，不能直接删除数据库目录文件。

**数据库连接打满**：区分真实活跃查询、锁等待、idle in transaction、连接池泄漏和短连接风暴；先止血限流/终止明确异常会话，再修复连接池、超时和慢 SQL。

**主库延迟/备库落后**：比较 WAL 生成、发送、接收、回放各阶段，检查网络、备库 IO、长查询阻塞回放和 slot；不要只看一个 replay timestamp。

**表突然变慢**：先看计划是否变化、统计信息、表膨胀、缓存命中、锁和磁盘延迟；不要一上来重启或强制索引。

---

## 16. 大厂综合场景题与回答框架

### 16.1 设计一个高并发扣库存接口

推荐回答顺序：

1. 用数据库约束和原子更新保证不超卖：

```sql
UPDATE inventory
SET stock = stock - $1, version = version + 1
WHERE sku = $2 AND stock >= $1
RETURNING stock, version;
```

2. 用请求号/订单号建立唯一约束实现幂等。
3. 库存扣减、订单和 outbox 事件放进同一事务。
4. 冲突异常、序列化失败和死锁按策略重试。
5. 热点 SKU 若单行锁成为瓶颈，再评估库存分桶、预扣减、队列化和最终一致性方案。
6. 监控锁等待、更新冲突、事务耗时、库存不一致和补偿任务。

### 16.2 设计订单查询与分页

- 订单号精确查询使用唯一索引。
- 用户订单列表建立 `(user_id, created_at DESC, id DESC)` 联合索引。
- 使用 Keyset Pagination，不使用大 OFFSET。
- 游标中携带上页最后的 `(created_at, id)`，排序字段必须有稳定的唯一 tie-breaker。
- 读写分离时，对刚下单用户保持读主或等待复制位点。

### 16.3 为什么线上出现大量 dead tuples

先解释 MVCC：更新删除制造旧版本；再按证据排查：

- 是否有长事务或 `idle in transaction`；
- autovacuum 是否触发、是否被锁或 IO 拖慢；
- 表是否高频更新，阈值是否过大；
- 大事务是否一次修改过多行；
- 是否需要按表设置参数或分区归档。

最后选择普通 VACUUM、调整 autovacuum、终止异常长事务、索引重建或窗口期表重写，而不是默认执行 `VACUUM FULL`。

### 16.4 PostgreSQL 与 Redis 如何配合

- PostgreSQL 是订单、余额、权限等权威数据源。
- Redis 适合缓存、计数、短期状态和热点读取。
- Cache Aside 下先读缓存，未命中读库并回填；更新时先提交数据库，再删除/失效缓存。
- 热点、穿透、雪崩、双写不一致要有过期、随机抖动、空值缓存、消息补偿和监控。
- 不能因为 Redis 读快就绕过 PostgreSQL 的约束和事务；关键状态最终必须可审计、可恢复。

### 16.5 如何回答“PostgreSQL 和 MySQL 怎么选”

不要回答成绝对优劣，按约束比较：

| 维度 | PostgreSQL 常见优势 | 需要评估 |
| --- | --- | --- |
| SQL 能力 | 复杂查询、窗口、类型、扩展丰富 | 团队学习和运维经验 |
| 一致性 | 强大的 MVCC、约束、隔离语义 | 长事务和 VACUUM 治理 |
| 半结构化 | JSONB、数组、范围、全文 | 仍要保持数据模型清晰 |
| 生态 | 云服务、扩展和工具成熟 | 与现有中间件兼容性 |
| 运维 | 备份、复制、监控工具完善 | 高可用方案需完整设计 |

最终依据查询模型、数据规模、SLA、团队能力、云平台和迁移成本做决定。

---

## 17. 高频命令速查与复习路线

### 17.1 连接与对象

```sql
\l                         -- psql 列出数据库
\c appdb                   -- 切换数据库
\dt app.*                  -- 查看表
\d+ app.orders             -- 查看表结构和存储信息
\du                        -- 查看角色
SELECT version();
SHOW server_version;
SHOW ALL;
```

### 17.2 事务与诊断

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';
COMMIT;

EXPLAIN (ANALYZE, BUFFERS, SETTINGS) ...;
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_locks;
SELECT pg_blocking_pids(<pid>);
```

### 17.3 DDL 与维护

```sql
CREATE INDEX CONCURRENTLY idx_name ON table_name (column_name);
REINDEX INDEX CONCURRENTLY idx_name;
VACUUM (ANALYZE, VERBOSE) table_name;
ANALYZE table_name;
```

`CREATE INDEX CONCURRENTLY` 和 `REINDEX CONCURRENTLY` 可以降低对写入的阻塞，但会执行更久、产生更多资源消耗，且不能放在普通事务块中。生产执行前要确认失败清理、磁盘空间和锁影响。

### 17.4 建议复习顺序

1. 能解释一次 SQL 从连接到执行计划的完整链路。
2. 能用自己的话讲清 MVCC、Read Committed、Repeatable Read 和 Serializable。
3. 能说明 WAL、checkpoint、崩溃恢复与备份的关系。
4. 能独立阅读 `EXPLAIN ANALYZE`，定位行数估算、索引、JOIN、排序和 IO 问题。
5. 能解释 VACUUM、autovacuum、膨胀和 XID wraparound。
6. 能设计索引、Keyset 分页、库存扣减和 outbox。
7. 能说清物理复制、同步/异步、读写分离延迟、slot 和故障切换。
8. 最后结合真实业务练习：连接打满、锁等待、慢查询、磁盘打满和主备延迟。

### 17.5 面试总结句

如果只能记住一条主线，可以这样总结 PostgreSQL：

> PostgreSQL 用 MVCC 解决读写并发，用锁和隔离级别表达更强的业务保护，用 WAL 保证崩溃恢复和复制基础，用成本优化器选择执行计划，用索引、VACUUM、统计信息和分区治理性能；生产可用性则依赖连接池、监控、备份恢复、复制、高可用和应用层幂等共同完成。

---

## 18. 逐章深化补充：前置知识、学习路径与实践题

> 本章是对前面每一章的二次讲解。每节先回答“新人需要先懂什么”，再回答“为什么要学它”，然后给出一个可以自己运行或推演的例子，最后列出面试中容易被追问的边界。建议不要只背结论，而是先建立最小实验，再观察 PostgreSQL 的行为。

### 18.0 对第 0 章的补充：如何使用这份八股学习

#### 前置知识：区分“知道名词”和“能够解释”

新人第一次接触数据库，容易把知识点学成名词清单：知道 MVCC、WAL、B-Tree、VACUUM，却无法解释它们为什么存在、互相如何影响。真正适合面试和工作的学习方式，是为每个概念准备四个答案：

1. 它解决了什么问题？
2. 它通过什么机制解决？
3. 一个最小 SQL 示例是什么？
4. 它的代价、边界和排查方式是什么？

例如“索引”不能只回答“提高查询速度”，还要回答它会增加写放大和存储，选择性低时可能不如顺序扫描，并且需要通过 `EXPLAIN` 验证。这样的回答才有工程含量。

#### 推荐的实践环境

准备一个可以反复销毁的 PostgreSQL 实例，建立 `users、orders、inventory、jobs` 四张小表。每学习一章都做一个可观察实验：

```text
建表/造数据 → 执行 SQL → EXPLAIN 或系统视图观察
→ 改变一个变量 → 比较结果 → 写下原因和边界
```

不要一开始使用线上数据或生产参数做实验；先用小数据建立因果关系，再用接近生产的数据量验证结论。面试中的“为什么”通常来自这种对照实验。

#### 三层复习法

- **入门层**：能说清概念和一个简单例子。
- **进阶层**：能解释两个概念之间的因果链，例如 MVCC 为什么带来 VACUUM。
- **生产层**：能说明监控指标、故障症状、止血动作和长期修复。

每章末尾可以用一句话自测：**如果这个机制失效，线上会看到什么？我用什么命令证明？**

---

### 18.1 对第 1 章的补充：先建立数据库分层心智模型

#### 前置知识：操作系统、网络和编译器的三层概念

新人经常把 PostgreSQL 理解成“收到 SQL 后查表”。实际上，一次查询至少跨越三类知识：

1. **网络层**：客户端通过 TCP 连接发送协议消息。连接建立、连接池等待和网络 RTT 都会影响接口延迟。
2. **操作系统层**：PostgreSQL 使用进程、共享内存、文件、页缓存和磁盘 IO。数据库参数不能脱离 CPU、内存和磁盘单独讨论。
3. **编译器/执行器层**：SQL 先被解析成结构，再由优化器选择执行计划，最后由执行器逐节点执行。

为什么要先学这些？因为“SQL 慢”可能根本不是 SQL 逻辑慢：可能是连接池没有连接、等待行锁、磁盘页不在缓存、计划估算错误，或者结果集太大导致网络传输慢。分层以后，排查才不会只盯着 SQL 文本。

#### 建议实验：区分连接、规划和执行耗时

```sql
EXPLAIN (ANALYZE, BUFFERS, TIMING, SUMMARY)
SELECT 1;

SELECT pid, state, wait_event_type, wait_event,
       query_start, now() - query_start AS elapsed, query
FROM pg_stat_activity
WHERE pid = pg_backend_pid();
```

第一条用于观察一个极小查询的规划/执行开销；第二条用于熟悉“会话状态”和“等待事件”。以后看到 `active` 不要直接等同于“正在消耗 CPU”，它也可能正在等待锁或 IO。

#### 新人容易混淆的三个概念

- **实例/集群**：一组 PostgreSQL 服务进程和一个数据目录。
- **database**：同一实例中的逻辑数据库，普通 SQL 不会像同库 schema 那样自由跨库 JOIN。
- **schema/table**：database 内的命名空间和数据对象。

#### 进阶追问

如果面试官问“为什么连接池能提升性能”，应答：连接池减少 TCP/TLS 建连、认证和 backend 进程创建成本，同时限制并发连接总量；但池过大仍会让数据库争抢 CPU、内存和锁，池大小要由数据库可承受并发和业务查询耗时共同决定。

---

### 18.2 对第 2 章的补充：先理解关系模型，再做表设计

#### 前置知识：实体、属性、关系与函数依赖

表设计不是把接口 JSON 原样保存。先问三个问题：

- 哪些东西是稳定实体，例如用户、订单、商品？
- 哪些字段描述实体，哪些字段描述实体之间的关系？
- 哪些值必须唯一、非空、可引用、可追踪历史？

规范化的核心是减少重复和更新异常。例如把 `order_id、user_name、product_name` 每次都存进订单明细，会造成用户名修改时历史行不一致。反过来，过度拆表又会增加 JOIN 和查询复杂度。因此大厂面试中更好的回答不是“永远三范式”，而是：权威数据保持清晰和一致，读模型或报表可以有意识地冗余，并通过事务或异步重建保证可解释性。

#### 为什么类型选择会影响正确性和性能

类型不仅决定存储大小，还决定比较规则、索引行为、隐式转换和应用序列化：

```sql
CREATE TABLE money_demo (
  id bigint PRIMARY KEY,
  amount_numeric numeric(18, 2) NOT NULL,
  amount_float double precision NOT NULL
);

SELECT 0.1::numeric + 0.2::numeric;  -- 精确十进制语义
SELECT 0.1::double precision + 0.2::double precision; -- 近似值
```

金额使用 `numeric` 或最小货币单位的整数；时间点使用 `timestamptz`；状态用受约束的枚举/文本，而不是让应用随意写入任意字符串。类型越明确，数据库越能在入口处拒绝错误数据。

#### 设计表的循序渐进模板

1. 先写业务不变量：订单号唯一、金额非负、订单必须属于用户。
2. 再决定主键和外部业务号是否分离。
3. 为查询路径设计必要索引，而不是先给每一列建索引。
4. 用约束表达能由数据库判断的规则。
5. 明确删除语义：软删、级联删、禁止删还是归档。
6. 最后再决定是否 JSONB、分区或冗余字段。

#### 高频追问：外键要不要用

答案取决于数据一致性、写入规模和团队治理能力。外键能防止孤儿数据，但会在父子表变更时增加检查和锁。不能简单说“大厂都不用外键”或“一定要用外键”，应说明权威数据边界、删除策略、索引和压测结果。

---

### 18.3 对第 3 章的补充：从并发异常理解 MVCC

#### 前置知识：四种经典并发异常

先理解抽象问题，再理解 PostgreSQL 的实现：

| 异常 | 含义 |
| --- | --- |
| 脏读 | 读到其他事务未提交的数据 |
| 不可重复读 | 同一事务两次读取同一行结果不同 |
| 幻读 | 同一条件两次查询，第二次多出/少了满足条件的行 |
| 丢失更新 | 两个事务基于旧值写入，后写覆盖先写 |

隔离级别是在这些异常之间做取舍。MVCC 解决的是“读写如何看到版本”的问题，不是自动解决所有业务竞态；例如库存扣减仍需原子 UPDATE 或行锁。

#### 两个会话的最小实验

会话 A：

```sql
BEGIN;
UPDATE accounts SET balance = balance + 100 WHERE id = 1;
-- 不提交
```

会话 B：

```sql
BEGIN;
SELECT balance FROM accounts WHERE id = 1;
-- 读不到 A 未提交的 +100
COMMIT;
```

然后让 A 提交，再在 B 中重复查询。Read Committed 下第二条语句可能看到新值；Repeatable Read 下事务快照保持稳定。这个实验比背隔离级别定义更容易建立直觉。

#### 为什么 MVCC 必然需要 VACUUM

更新不直接擦掉旧版本，是为了让仍在使用旧快照的事务继续读取。旧快照结束后，旧版本才有机会被清理；VACUUM 负责把这些空间标记为可复用，并处理冻结。由此得到一条完整链路：

```text
并发读写 → 保留旧版本 → dead tuple 增多 → VACUUM 清理/复用
```

如果把 MVCC 和 VACUUM 分开背，面试时容易只讲一半。

#### 长事务为什么危险

长事务不一定持续执行 SQL，但它可能保持旧快照。数据库为了保证它的可见性，不能清理某些旧版本。应用层常见原因是开启事务后等待网络请求、用户输入或消息队列，正确做法是把外部 IO 放在事务外。

---

### 18.4 对第 4 章的补充：先区分锁保护的对象

#### 前置知识：互斥、共享和等待图

锁的本质是多个并发执行者对共享资源的访问协调。学习时先画等待图：节点是事务，边是“等待谁释放资源”。出现环就可能死锁。

行锁保护某些行的并发修改；表锁保护表级操作；advisory lock 保护应用定义的业务键；MVCC 快照则主要控制读看到哪些版本。它们不是同一种东西，不能用“数据库有 MVCC，所以没有锁”概括。

#### 行锁不等于锁住查询条件

```sql
SELECT * FROM orders
WHERE user_id = 42
FOR UPDATE;
```

这通常锁住当前选中的行，而不是数据库中未来可能插入、满足 `user_id = 42` 的所有行。若业务规则是“同一用户最多一个未完成订单”，应使用唯一/部分唯一索引，或在更高隔离级别配合谓词保护，而不是误以为一次 `FOR UPDATE` 锁住了整个条件集合。

#### 锁设计的新人口诀

1. 事务越短越好。
2. 所有路径按同一顺序加锁。
3. 锁前先过滤，过滤字段尽量有索引。
4. 失败时释放事务，不要把连接带回池中保持 aborted 状态。
5. 锁等待要可观测，必要时设置合理的 `lock_timeout`。

#### 更安全的队列消费示例

```sql
WITH picked AS (
  SELECT id
  FROM jobs
  WHERE status = 'ready'
  ORDER BY id
  FOR UPDATE SKIP LOCKED
  LIMIT 10
)
UPDATE jobs j
SET status = 'running', started_at = now()
FROM picked
WHERE j.id = picked.id
RETURNING j.*;
```

`SKIP LOCKED` 适合多个 worker 抢任务，避免一个被锁任务阻塞所有消费者；但它可能导致暂时跳过旧任务，因此需要重试、超时回收和死信治理。

---

### 18.5 对第 5 章的补充：从“数据页”和“持久化”理解 WAL

#### 前置知识：内存修改不等于磁盘落盘

数据库为了性能不会每次更新都同步写入最终数据文件。数据页可能先位于共享缓冲区和操作系统页缓存中。崩溃时，如果只有数据页没有日志，数据库无法知道一次写入是否完整；如果先写 WAL，就能通过日志恢复。

#### 事务提交的三个问题

被问“提交成功后数据一定不丢吗”，要反问三个条件：

1. 提交确认前 WAL 是否已经达到所需持久化层级？
2. 是否有同步备库确认，主库单机损坏时能否保留？
3. 是否有基础备份和 WAL 归档，误操作时能否 PITR？

这就是为什么 ACID 的 Durability 不等于灾备。WAL 解决崩溃恢复基础，复制和备份解决节点损坏、误操作和灾难恢复。

#### WAL 增长的推理路径

WAL 增长异常时不要只看“写入量大”：

```text
业务更新/索引维护/批量导入
          ↓
WAL 生成速率上升
          ↓
归档慢？备库慢？slot 未消费？checkpoint 参数不合适？
          ↓
WAL 目录增长或归档堆积
```

需要分别检查归档失败、复制槽、备库回放、磁盘和生成 WAL 的 SQL。直接删除 WAL 文件会破坏恢复和复制，属于高风险错误操作。

---

### 18.6 对第 6 章的补充：先学“选择性”和“访问路径”

#### 前置知识：为什么索引不是加速器按钮

索引加速的是“缩小候选集合”或“提供有序访问”。如果查询要返回表中 80% 的行，先读索引再随机回表可能比顺序读整张表更慢。关键概念是**选择性**：条件筛掉的行越多，索引越可能有价值。

#### 从查询反推联合索引

假设高频查询是：

```sql
SELECT id, status, created_at
FROM orders
WHERE tenant_id = $1
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 50;
```

可以尝试：

```sql
CREATE INDEX idx_orders_tenant_status_created
ON orders (tenant_id, status, created_at DESC)
INCLUDE (id);
```

但不能只背“等值列在前、范围列在后”。还要观察租户大小、状态分布、是否需要回表、写入成本以及查询是否真的高频。索引设计是实验问题，不是口诀问题。

#### 隐式转换为何会伤害索引

如果 `user_id` 是 bigint，却把字符串列或不匹配类型传入，优化器可能需要对列做转换，导致索引表达式无法直接匹配。应用驱动应传正确类型；遇到慢 SQL 用 `EXPLAIN` 验证，不要凭 SQL 字面猜测。

#### 索引维护清单

- 是否有真实查询使用？看 `pg_stat_user_indexes`。
- 是否造成大量写放大？看 WAL、写入延迟和索引大小。
- 是否重复或被更宽的联合索引覆盖？
- 是否需要 `CONCURRENTLY` 创建/重建？
- 是否有长事务阻止索引维护完成？

---

### 18.7 对第 7 章的补充：学会读计划，而不是背节点名称

#### 前置知识：基数估算是优化器的核心

优化器最关心“这一步会输出多少行”。例如外表实际 100 行而估算 1 行，优化器可能选择 Nested Loop；如果实际是 100 万行，Nested Loop 可能放大为灾难。读计划时第一步不是看有没有索引，而是找估算值与实际值差距最大的节点。

#### 建议按四个问题读 EXPLAIN

1. 从最底层开始，数据从哪里来？顺序扫描、索引扫描还是分区扫描？
2. 每个节点估算多少行、实际多少行？
3. 哪些节点重复执行很多次，`loops` 是否放大成本？
4. 时间花在 CPU、磁盘、临时文件还是等待上？

```sql
EXPLAIN (ANALYZE, BUFFERS, WAL, SETTINGS)
SELECT ...;
```

`ANALYZE` 会真实执行。对 `UPDATE/DELETE` 要在事务中实验并回滚，且注意序列、外部函数、触发器等副作用并不一定都能简单回滚到你想要的状态。

#### 为什么“强制走索引”不是优化

```sql
SET LOCAL enable_seqscan = off;
```

这只能作为诊断手段：它可以告诉你“如果走索引，计划和耗时如何”，但不应作为长期配置。真正问题通常是统计信息、数据分布、索引设计、类型转换或成本参数。

#### 参数化查询的追问

prepared statement 可能使用 custom plan 或 generic plan。若不同参数的数据分布差异很大，一个通用计划可能对某些参数很差。遇到 ORM 慢查询，要把真实参数、prepare 行为和计划缓存一起纳入排查。

---

### 18.8 对第 8 章的补充：把 VACUUM 看成 MVCC 的垃圾回收

#### 前置知识：空间回收有三层含义

1. **逻辑可见性**：旧行版本对新事务不可见。
2. **表内复用**：VACUUM 标记空间，后续 INSERT/UPDATE 可以复用。
3. **操作系统缩容**：物理文件真正变小，通常需要表重写或 `VACUUM FULL`。

新人常说“VACUUM 回收空间”，但没有说明是哪一层。普通 VACUUM 主要解决前两层，不承诺文件大小下降。

#### 为什么更新频繁的表更需要关注填充因子

如果更新经常改变索引列或行大小，新的版本可能无法留在原页面，增加索引维护和随机访问。对特定高更新表，可以评估 `fillfactor`，给页面预留空间，但这会增加表体积，必须基于真实写入模式验证。

#### 实战观察表的健康度

```sql
SELECT relname, n_live_tup, n_dead_tup,
       round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)
         AS dead_ratio,
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

这个比例只是线索，不是完整膨胀率。需要结合表实际大小、长事务、autovacuum 日志和查询性能判断。

#### 新人最容易做错的操作

看到表大就执行 `VACUUM FULL`。它会重写表并需要强锁和额外空间，线上可能导致长时间不可用。正确流程是先确认膨胀来源，再选择调参、普通 VACUUM、分批删除、分区归档、`REINDEX CONCURRENTLY` 或窗口期重写。

---

### 18.9 对第 9 章的补充：先理解关系代数，再优化 JOIN

#### 前置知识：JOIN 是组合，不是“查两张表”

两个集合的 JOIN 可能产生笛卡尔组合，连接条件决定组合规模。假设用户 10 万行、订单 1000 万行，如果先形成大量组合再过滤，成本会很高；如果先过滤活跃用户和时间范围，再连接，候选集合会小很多。

#### 让过滤尽早发生，但要保持语义

```sql
WITH recent_orders AS (
  SELECT user_id, amount
  FROM orders
  WHERE created_at >= now() - interval '30 days'
)
SELECT u.id, sum(o.amount)
FROM users u
JOIN recent_orders o ON o.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id;
```

优化器通常会自行下推过滤，但复杂表达式、函数、外连接和安全边界可能影响下推。写 SQL 时先表达清晰语义，再用执行计划确认。

#### 聚合前后行数很重要

如果订单明细很多但最终只需要按用户汇总，可以先聚合订单再与用户连接，减少 JOIN 输入；但如果还需要明细级字段，就不能强行提前聚合。优化本质是减少中间结果，而不是把 SQL 写得更短。

#### 窗口函数的内存意识

窗口分区、排序可能需要大量内存和临时文件。对“每个用户最新一条”这类查询，应比较窗口函数、`DISTINCT ON`、LATERAL 子查询和合适索引的计划，不要只按个人习惯选写法。

---

### 18.10 对第 10 章的补充：分区是生命周期治理工具

#### 前置知识：大表问题通常不只是查询慢

大表还会带来备份慢、VACUUM 久、索引重建困难、删除历史数据产生大量 WAL、锁持有时间长等问题。分区最有价值的地方，往往是把数据生命周期变成“创建新分区、卸载旧分区”，而不是每次对整张表执行大 DELETE。

#### 分区键必须来自访问路径和生命周期

选择分区键至少考虑：

- 高频查询是否带分区键，能否触发裁剪；
- 数据是否按该键自然增长；
- 是否按该键归档、删除或迁移；
- 热点是否集中在单个分区；
- 唯一约束是否能接受分区键必须参与。

#### 分区维护的自动化

生产需要一个分区管理任务：

```text
提前创建未来分区
→ 监控 default 分区是否接收异常数据
→ 到期冻结/归档旧分区
→ 验证分区边界和索引
→ 删除或转移归档分区
```

如果没有自动创建未来分区，月初切换时可能因没有匹配分区而写入失败；如果没有 default 分区，错误会尽早暴露，但业务可能直接中断。两者取舍必须配合告警和演练。

#### 分区数量不是越多越好

分区太多会增加规划、缓存目录、维护和连接初始化成本。按天分区还是按月分区，应基于数据量、查询窗口、保留周期和维护时长测算。

---

### 18.11 对第 11 章的补充：性能优化先做容量模型

#### 前置知识：吞吐、并发、延迟不是同一个指标

- 吞吐：单位时间完成多少请求/事务。
- 并发：同时处于执行或等待状态的请求数。
- 延迟：单个请求从开始到结束的时间，通常看 p50/p95/p99。

根据 Little's Law，稳定系统中大致有 `并发数 = 吞吐 × 平均响应时间`。慢 SQL 会占住连接，连接池为维持吞吐会积累更多等待，最终表现为连接打满和长尾延迟。因此“加大连接池”可能把问题放大。

#### 连接池大小如何推导

先观察数据库 CPU 核数、查询平均耗时、IO 等待、锁等待和业务峰值，再为每个服务分配连接预算，并保留管理、复制和故障处理连接。不要让每个服务都把 `max_connections` 当成自己的配额。

#### `work_mem` 的危险

假设一个查询同时有 3 个排序，4 个并行 worker，`work_mem=64MB`，最坏内存需求可能远高于 64MB。正确做法是先定位落盘节点，再在会话级/事务级提高，并用压测验证峰值并发下的总内存。

#### 性能优化的优先级

```text
修复错误查询/锁等待
→ 减少返回和中间结果
→ 正确索引与统计信息
→ 连接池与事务边界
→ 内存/并行参数
→ 存储与硬件扩容
```

不要在 SQL 还产生笛卡尔积、事务长期不提交时先讨论硬件参数。

---

### 18.12 对第 12 章的补充：高可用要用 RPO/RTO 描述

#### 前置知识：RPO、RTO、故障域

- RPO：最多能接受丢失多少时间的数据。
- RTO：故障后多长时间恢复服务。
- 故障域：进程、磁盘、机器、可用区、地域等不同故障范围。

异步复制可能在机器故障时丢失少量最近事务，但切换延迟较低；同步复制降低 RPO，却引入网络和备库可用性对写入的影响。没有 RPO/RTO，就无法判断哪种高可用方案合适。

#### 读写分离的正确心智模型

读副本不是“免费的只读数据库”，它有复制延迟、回放冲突和容量成本。刚写后读、读自己的写、事务中读都可能要求主库或一致性等待。应用路由层必须清楚哪些 API 允许最终一致，哪些必须强一致。

#### 故障切换的四步

```text
发现故障 → 确认旧主不可继续写 → 提升候选备库 → 更新客户端路由
```

其中第二步是防脑裂的关键。只依靠心跳超时而没有 fencing，网络分区时两个节点可能都认为自己是主。

#### 复制槽的前置知识

slot 用于保证消费者不会错过 WAL；代价是消费者不前进时 WAL 不能回收。必须监控 slot 造成的 WAL 保留量，并为异常消费者设置处理和删除策略。

---

### 18.13 对第 13 章的补充：CDC 首先是事务语义问题

#### 前置知识：日志、位点、顺序和幂等

CDC 不只是“把数据库变化推到 MQ”。你需要回答：

- 一个事务中的多条变更，消费者看到什么顺序？
- 消费失败后从哪里重放？
- 重放会不会重复？
- schema 变更如何兼容旧消费者？
- 下游已经处理但位点未提交怎么办？

因此 CDC 通常是“至少一次 + 下游幂等”，而不是默认 exactly-once。

#### Outbox 为什么可靠

业务表和 outbox 表在同一事务中提交，避免“订单成功但消息没写入”或“消息发出但订单回滚”。之后由 CDC/worker 投递，消费者用 `event_id` 去重：

```sql
CREATE UNIQUE INDEX uq_consumer_event ON consumed_events(event_id);
```

消费处理与去重记录也应放在同一事务中，才能保证重复消息不会重复产生业务副作用。

#### 迁移的分阶段策略

```text
全量快照 → 记录增量位点 → 持续消费增量 → 校验新旧库 → 短暂切流
```

校验不能只比较行数，还要抽样校验主键、金额、状态、时间和聚合结果。迁移前必须列出不自动复制的序列、权限、扩展、触发器和 DDL。

---

### 18.14 对第 14 章的补充：权限是数据库边界的一部分

#### 前置知识：身份认证、授权、审计

认证回答“你是谁”；授权回答“你能做什么”；审计回答“谁在什么时候做了什么”。只设置密码而不给角色分层，无法应对应用账户泄露、误操作和内部权限审查。

#### 推荐角色分层

```text
登录角色（LOGIN）
  → 运行时角色（读写业务表）
  → 迁移角色（DDL/索引）
  → 只读分析角色
  → 管理角色（受控使用）
```

应用运行时不应使用超级用户。把 schema、表、序列、函数的权限分别配置，并用默认权限覆盖未来对象。迁移权限最好通过发布流程临时授予，而不是永久放给应用。

#### RLS 与连接池的坑

如果租户 ID 放在 session setting 中，连接归还池前必须清理；否则下一个租户可能继承上一个会话上下文。事务池化和会话池化的行为不同，RLS 设计必须结合连接池模式验证。

---

### 18.15 对第 15 章的补充：监控必须能回答“现在发生了什么”

#### 前置知识：四类可观测性

- 指标：连接数、QPS、延迟、WAL、缓存、dead tuples、复制延迟。
- 日志：慢查询、锁等待、checkpoint、归档失败、autovacuum。
- Trace：请求从应用到数据库的完整耗时和 SQL 标签。
- 诊断快照：`pg_stat_activity`、`pg_locks`、`pg_stat_statements`。

单看平均 CPU 无法回答“为什么 p99 变慢”；单看慢查询也无法区分锁等待和执行时间。可观测性要能把应用请求、数据库会话、查询指纹和机器资源关联起来。

#### 事故排查的时间线方法

```text
故障开始时间
→ 应用 p99/错误率
→ 数据库连接/锁/查询变化
→ CPU/IO/WAL/复制/磁盘变化
→ 最近发布、DDL、数据导入或流量变化
→ 止血、验证、根因、长期修复
```

先建立时间线，避免看到某个相关指标就误判根因。

#### 备份恢复演练必须量化

至少记录：备份大小、生成时间、恢复到可连接所需时间、恢复到业务可用所需时间、丢失数据窗口、人工步骤和失败点。只有恢复演练通过，备份才算有效。

---

### 18.16 对第 16 章的补充：用“约束 + 事务 + 可观测性”回答场景题

#### 场景题通用四步

1. **不变量**：业务绝不能违反什么，例如库存不能为负、订单号不能重复。
2. **数据库保证**：用唯一约束、CHECK、原子 UPDATE、锁和隔离级别防止竞态。
3. **应用保证**：幂等键、超时、重试、补偿、消息去重和状态机。
4. **运营保证**：指标、告警、审计、对账、恢复和人工兜底。

只说“加锁”通常不够，因为锁解决并发冲突，不解决重复请求、客户端超时重试、消息重复和跨系统一致性。

#### 订单状态机示例

```text
pending → paid → shipped → completed
    └────────→ cancelled
```

数据库可以用 CHECK 限制状态集合，但状态迁移是否合法通常需要应用状态机、事务锁和审计表共同保证。每次迁移保存 `from_status、to_status、operator、request_id`，才能在事故中解释发生了什么。

#### 评估方案的维度

面试官追问“吞吐不够怎么办”时，按顺序评估：单行热点、锁等待、索引写放大、事务时长、连接池、WAL/IO、分区、缓存、队列化和分片。每一步都要说明牺牲了什么：一致性、实时性、可运维性还是实现复杂度。

---

### 18.17 对第 17 章的补充：命令背后要有判断能力

#### 前置知识：命令的作用域和副作用

```sql
SET LOCAL statement_timeout = '5s';
```

只影响当前事务；而数据库级参数、会话参数、系统配置文件的作用域不同。执行任何维护命令前，先确认：是否真实执行、是否持锁、是否生成大量 WAL、是否需要额外磁盘、失败后如何恢复。

#### 建立个人排障手册

建议按症状而不是按 SQL 命令分类：

```text
连接打满：pg_stat_activity + 连接池指标 + 长事务
锁等待：pg_blocking_pids + pg_locks + 事务顺序
慢查询：pg_stat_statements + EXPLAIN BUFFERS
磁盘增长：表/索引/WAL/归档/临时文件/slot
复制延迟：sender/receiver/replay 各阶段
```

每个命令都记录“看什么、正常是什么、异常下一步查什么”。这样新人才能从复制命令升级为诊断能力。

#### 最终学习顺序

建议分三轮：

1. **第一轮建立地图**：读懂第 0、1、2、3、5 章，能画出 SQL、事务和 WAL 链路。
2. **第二轮解决性能**：学习第 4、6、7、8、9、10、11 章，自己造数据并阅读执行计划。
3. **第三轮面向生产**：学习第 12～16 章，练习主备延迟、锁等待、备份恢复和综合设计题。

每学完一章，都用“我如何证明它”的方式复习：用两个会话验证隔离，用 `EXPLAIN` 验证索引，用系统视图验证锁和复制，用恢复演练验证备份。能观察、解释、验证，才算真正掌握。

