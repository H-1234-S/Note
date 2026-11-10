
# 数据类型

## 整数类型

- smallint(2 字节)
- integer / int (4 字节)
- bigint (8 字节)

### 精确数值

**`numeric`** 用于存储需要**精确计算**的数值，比如金额。它可以指定精度和标度，例如 `NUMERIC(8,2)` 表示总共 8 位数字，其中小数点后 2 位。

## 字符串类型

- text
- char：定长；char(10) 固定长度 10 字符，不足补空格
- varchar：不定长；varchar(50) 表示最多允许 50 字符

## 布尔类型

Boolean 布尔类型有三种状态，存储占 1 字节；输入时 `true`/`yes`/`on`/`1` 都会被识别为真，`false`/`no`/`off`/`0` 为假。

- `TRUE`：已经验证。
- `FALSE`：尚未验证。
- `NULL`：没有记录该状态，或者状态未知。

实际项目中，如果业务不需要第三种状态，通常应该使用 `NOT NULL`，并设置合理的默认值。

## 日期和时间

| 类型            | 用途                        |
| ------------- | ------------------------- |
| `DATE`        | 日期，例如生日                   |
| `TIMESTAMP`   | 不带时区的日期时间                 |
| `TIMESTAMPTZ` | 带时区语义的时间点，通常用于记录创建时间、更新时间 |

**例如：**

``` sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

`NOW()` 返回当前事务开始时间

## UUID

UUID 是一种 128 位标识符，例如：

`550e8400-e29b-41d4-a716-446655440000`

建表时可以这样使用：

``` sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

它会自动生成 UUID，不需要你在应用中自己拼接随机字符串。

## JSONB

`JSONB` 适合保存字段结构灵活、经常需要按键查询的 JSON 数据。

PG 将 JSON 数据去除空格、换行等冗余信息，转为二进制数据，**这种数据就叫 JSONB 数据**

PG 将 JSONB 里的键值对拆分**生成二进制哈希**，构建**倒排索引**

当 PG 查询某一个键值对时，会将键值对数据转为二进制哈希，然后在 GIN 倒排索引中查找这个哈希值

# SQL 语句















# 索引

## 前提

### 是什么？

可以这么理解：数据库是一本书，索引就是这本书的目录

在技术上，索引是对数据库表中**一列或多列的值**进行**排序**的一种**结构**。

它不改变数据本身，而是额外维护了一份“键值 → 数据物理位置”的映射表。

**示例：**

给 email 字段建立索引

``` sql
CREATE INDEX idx_users_email
ON users (email);
```

索引中保存着类似这样的映射关系：

| email               | 对应记录的位置 |
| ------------------- | ------- |
| alice@example.com   | 记录位置 A  |
| bob@example.com     | 记录位置 B  |
| charlie@example.com | 记录位置 C  |
| david@example.com   | 记录位置 D  |

这里的记录位置是概念上的简化，PostgreSQL 的索引实际上会保存**索引键**以及指向表中**元组的 TID**（Tuple Identifier）

**执行：** 快速定位索引键，获取对应的 TID，然后定位 users 表中的记录；就不再进行全表扫描了

### 作用

索引的核心作用是**加速查询**，尤其是当表很大、而查询只需要返回其中很少几行时，效果最明显。

但索引不是免费的，它有代价：

- **好处**：大幅提升 `SELECT`、`UPDATE`、`DELETE` 中带条件时的定位速度，也能加速表连接。
    
- **代价**：占用额外的磁盘空间；每次插入、更新、删除数据时，数据库都要同步维护索引，增加了写入开销。

所以，索引的本质是一种**用写入性能和存储空间，换取读取速度**的权衡。


## B-tree 索引

B-tree 是 PostgreSQL 默认的索引类型，也是日常业务开发中最常用的索引。

**示例：**

``` sql
CREATE INDEX idx_users_age
ON users USING BTREE (age);

-- 同
CREATE INDEX idx_users_age
ON users (age);

-- 删除索引
DROP INDEX idx_users_age;
```

> **结构：**

B-tree 是平衡的**多路搜索树**，是一个树状结构，每个节点可以包含多个键值，在搜索时根据每一个节点的条件决定下一步

> **判断：**

适合等值查询、范围查询、排序查询、前缀匹配

```sql
-- 范围查询
SELECT *
FROM users
WHERE age BETWEEN 18 AND 30;
-- 排序查询
SELECT *
FROM users
ORDER BY age ASC;
-- 前缀匹配
SELECT *
FROM users
WHERE username LIKE 'ali%';
```

## 哈希索引

Hash 索引主要用于**等值查询**。

它的核心思想是通过哈希函数，**将数据转换成对应的哈希值**，从而帮助定位数据。

``` sql
CREATE INDEX idx_users_email_hash
ON users USING HASH (email);
```

## GIN 索引

GIN 全称：

Generalized Inverted Index，通用倒排索引。

它主要解决一个问题：

当**一个字段中包含多个元素**时，如何快速查找包含某个元素的记录？

### 示例

``` sql
-- 一个文章表
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    tags TEXT[]
);

-- 查询包含后端标签的文章
SELECT *
FROM articles
WHERE tags @> ARRAY['后端'];
```

如果没有 GIN 索引，那么数据库依旧全表扫描，也就是逐条检查标签是否符合条件

> **GIN 如何工作：**

例如：

文章 1：Redis、后端
文章 2：React、前端
文章 3：Nest、后端
文章 4：PostgreSQL、后端

**GIN 索引**

|   |   |
|---|---|
|索引元素|对应文章|
|Redis|文章 1|
|React|文章 2|
|后端|文章 1、3、4|
|前端|文章 2|
|Nest|文章 3|
|PostgreSQL|文章 4|

可以快速定位包含目标元素的记录

> 将多个元素拆分为词元，额外维护一套**词元到字段的映射关系**

**创建 GIN 索引**

``` sql
CREATE INDEX idx_articles_tags
ON articles USING GIN (tags);

-- 查询
SELECT *
FROM articles
WHERE tags @> ARRAY['后端'];
```

GIN 支持的数组操作符包括：

| 操作符  | 含义      |
| ---- | ------- |
| `@>` | 左侧包含右侧  |
| `<@` | 左侧被右侧包含 |
| `&&` | 两个数组有交集 |
| `=`  | 数组相等    |

**例如：**

``` sql
-- 同时包含 Redis 和后端
SELECT *
FROM articles
WHERE tags @> ARRAY['Redis', '后端'];

-- 包含 Redis 或后端中的任意一个
SELECT *
FROM articles
WHERE tags && ARRAY['Redis', '后端'];
```

### GIN 与 JSONB

将每个字段拆分出来，记录每个词元与文本Id的映射关系；之后通过词元反查主键Id做交并集运算
#### 示例

假设有一张商品表：

``` sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    attributes JSONB
);
```

存储的数据：

``` json
{
  "brand": "Apple",
  "color": "black",
  "storage": "256GB"
}
```

现在需要查找品牌为 Apple 的商品：

``` sql
SELECT *
FROM products
WHERE attributes @> '{"brand": "Apple"}';
```

创建 GIN 索引：

``` sql
CREATE INDEX idx_products_attributes
ON products USING GIN (attributes);
```

这样可以帮助 JSONB 包含查询。

还有一种常见的写法：

``` sql
SELECT *
FROM products
WHERE attributes ? 'brand';
```

> 这里 `?` 表示 JSONB 对象是否存在指定键。




GIN 的重要特点：

- 适合数组包含查询。
    
- 适合 JSONB 包含查询。
    
- 适合全文搜索。
    
- 一个字段中的多个元素可以分别建立索引。
    









# SQL 约束

约束是加在表或列上的规则，数据库在插入、更新数据时会自动检查，不满足就报错并拒绝操作。

它的核心目的是**把业务规则下沉到数据库层**，防止脏数据进入表里

| 约束            | 作用                                | 作用层级          |
| ------------- | --------------------------------- | ------------- |
| `PRIMARY KEY` | 唯一标识一行，隐含 `NOT NULL` + `UNIQUE`   | 表级（可单列也可多列组合） |
| `NOT NULL`    | 该列不允许为 `NULL`                     | 列级            |
| `UNIQUE`      | 该列（或列组合）的值不能重复，但允许多个 `NULL`       | 列级或表级         |
| `CHECK`       | 值必须满足指定布尔表达式，如 `CHECK (age >= 0)` | 列级或表级         |
| `DEFAULT`     | 插入时未指定该列，则自动填入默认值                 | 列级            |

严格来说，`DEFAULT` 和 `NOT NULL` 更常被称为**列约束**

而 `PRIMARY KEY`、`UNIQUE`、`CHECK`、`FOREIGN KEY` 既可以写在列后面，也可以写成表级约束（尤其是多列组合时）。

`FOREIGN KEY` 也是约束家族的重要成员，用于保证一个表中的值在另一个表中存在（引用完整性）。

## 主键

PRIMARY KEY

每张表只能定义一个主键约束，但这个主键可以由多个列组成，称为复合主键。

``` sql
PRIMARY KEY (organization_id, user_id)
```

## 外键

FOREIGN KEY 主要用来保持**引用完整性**

``` sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

其中

``` sql
owner_id UUID NOT NULL REFERENCES users(id)
```

## 删除策略

| 策略            | 行为                  | 常见适用场景        |
| ------------- | ------------------- | ------------- |
| `NO ACTION`   | 如果仍有引用记录，拒绝删除（默认行为） | 不允许轻易删除父记录    |
| `RESTRICT`    | 有引用记录时阻止删除          | 明确禁止删除被引用的记录  |
| `CASCADE`     | 删除用户时自动删除关联项目       | 子记录确实应该随父记录删除 |
| `SET NULL`    | 将关联列设为 `NULL`       | 项目允许没有所有者     |
| `SET DEFAULT` | 将关联列设置为默认值          | 默认值本身符合外键约束   |

**例如：**

``` sql
owner_id UUID NOT NULL
  REFERENCES users(id)
  ON DELETE CASCADE
```

表示当用户被删除时，相关的项目也会自动删除；按照业务来设置删除策略

## 检查约束

``` sql
ALTER TABLE products
ADD CONSTRAINT products_stock_nonnegative
CHECK (stock >= 0);
```

给 `products` 表加一条名为 `products_stock_nonnegative` 的检查约束，要求 `stock` 列的值必须大于等于 0。

任何试图让 `stock` 变成负数的 `INSERT` 或 `UPDATE`，都会被数据库直接拒绝，并报错回滚该语句。

# 数据库事务

数据库事务（Transaction）是一组被数据库**作为一个整体管理**的操作。

> 事务的**核心思想**是：

- 所有操作成功：提交事务，保存结果。
    
- 任意操作失败：回滚事务，撤销本事务尚未提交的修改。

## 示例

``` sql
-- 1. A 的余额减少 100 元
UPDATE accounts
SET balance = balance - 100
WHERE user_id = 'A';

-- 2. B 的余额增加 100 元
UPDATE accounts
SET balance = balance + 100
WHERE user_id = 'B';
```

转账需要执行两个操作；但是存在问题：如果操作 A 成功，操作 B 失败。最终：A 少了 100 元，B 却没有收到钱。

这就是典型的**数据一致性问题**

而使用数据库事务：

``` sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE user_id = 'A';

UPDATE accounts
SET balance = balance + 100
WHERE user_id = 'B';

COMMIT;
```

**注意：** 事务只能回滚它所管理的数据库操作，不能自动撤销已经发送的短信、外部支付请求等副作用。

> 事务是原子性的，但不是原子更新，两个并发事务可能会导致读一样的数据，处理一样的逻辑，但会造成一次**更新丢失**

事务可以解决**数据不一致**问题，但不能解决**更新丢失**(并发两个事务)

要让**先查再改**安全，必须让**查询阶段就锁住目标行**，迫使**并发事务排队**。

``` sql
BEGIN;
SELECT balance FROM accounts WHERE user_id = 'A' FOR UPDATE;
-- 此时其他事务对同一行的 FOR UPDATE 或 UPDATE 会等待
-- 应用计算 newBalance
UPDATE accounts SET balance = 20 WHERE user_id = 'A';
COMMIT;
```

> InnoDB 悲观锁，**排他行锁（X 锁）**，只在事务内生效，事务`COMMIT/ROLLBACK`才释放锁

第一个事务锁住行后，第二个事务在 `SELECT ... FOR UPDATE` 处就会阻塞，直到第一个提交，它才能读到更新后的余额。

**缺点：**

引入了行锁等待和死锁风险，高并发下性能会受影响。

## 数据库的原子更新

**数据库原子更新：** 是指把一次数据修改作为一个不可分割的操作执行，不会让其他事务看到这次操作只完成了一半的中间状态。

> 对于事务导致更新丢失问题，直接在 sql 中更新；应用程序不需要先读取余额，再自己计算并写回。

**示例：**

``` sql
UPDATE accounts
SET balance = balance - 80
WHERE user_id = 'A'
  AND balance >= 80;
```

PostgreSQL 会通过**行级并发控制**协调对同一行的并发更新。

在 `READ COMMITTED` 下，如果另一个事务先修改了该行，后续更新会等待，并根据更新后的行重新检查 `WHERE` 条件。

### 行级并发控制

行级并发控制，简单说就是数据库在**行**这个最细粒度上，管理多个用户同时读写数据的一套机制。

**核心：** 让操作不同数据行的事务互不干扰，同时让操作同一数据行的事务有序排队

> PG 行级锁：**只阻塞其他试图修改或锁定同一行的操作，不阻塞普通读取**；处理**写于写**操作

当执行 `UPDATE` 时，PG 会自动对目标行加一个行级排他锁。

如果另一个并发 `UPDATE` 也想改这一行，它就必须等前一个事务提交或回滚。

你之前说的安全写法 `UPDATE ... SET balance = balance - 80 WHERE ... AND balance >= 80`，在 PG 里之所以安全，就是因为第二个 `UPDATE` 会在这个行级锁上**等待**，等第一个改完后，它再基于**新的、已提交的版本**重新评估条件并扣减。

注意：在 `REPEATABLE READ` 或 `SERIALIZABLE` 隔离级别下，如果锁定的行在事务开始后被修改过，`SELECT FOR UPDATE` 会直接报错，而不是等待

### 示例

假设商品库存为 10 件，两个用户同时购买 7 件。

如果使用“先查询库存，再更新”的方式，两个请求都可能读到 10 件，并认为库存充足。

``` sql
UPDATE products
SET stock = stock - 7
WHERE id = 1001
  AND stock >= 7
RETURNING stock;
```

添加约束，进一步防止非法库存：

``` sql
ALTER TABLE products
ADD CONSTRAINT products_stock_nonnegative
CHECK (stock >= 0);
```

## 特性 ACID

**原子性：** 一个事务中的操作要么全部成功，要么全部回滚，不能只完成一部分。

**一致性：** 事务成功后，数据库仍满足定义好的约束和业务不变量。

**隔离性：** 多个并发事务同时执行时，数据库按照相应的隔离级别控制它们之间的相互影响。

**持久性：** 事务成功提交后，数据库会按照其持久性配置保护提交结果，使其在规定的故障模型下能够保留。

## 为什么需要隔离性

事务解决了“一组操作部分成功”的问题，但**多个事务**同时操作相同的数据时，仍然需要考虑**并发行为**。

**隔离性**就是解决多个并发事务情况下出现的问题

**示例：**

如果并发两个事务；读取余额、判断余额是否足够、计算新余额、更新数据库；**并发两个事务**情况下可能都会成功，但会**丢失一次更新**

在 `PostgreSQL` 的 `READ COMMITTED` 隔离级别下，事务中的多条 `SQL` 并不会自动组成一个不可被其他事务干扰的整体执行过程。

| 隔离级别               | 大致特点                               |
| ------------------ | ---------------------------------- |
| `READ UNCOMMITTED` | 在 PostgreSQL 中等同于 `READ COMMITTED` |
| `READ COMMITTED`   | 每条语句读取开始时可见的已提交数据                  |
| `REPEATABLE READ`  | 同一事务内的查询保持一致的快照；并发写入冲突可能导致事务失败     |
| `SERIALIZABLE`     | 检测可能导致不可串行化结果的并发执行，必要时中止事务，应用需要重试  |
# Schema

PostgreSQL 中，一个 Database 下可以再划分多个 Schema（模式）

Schema 是表、序列、视图、函数等对象的组织容器，相当于数据库里的 "文件夹"。

``` sql
CREATE SCHEMA IF NOT EXISTS "proj_9f3a1c02"
```

## Public Schema

`public schema`（公共模式）是 PostgreSQL 数据库中的一个**默认模式（Schema）**

当创建表时，如果没有指定具体的模式，那么系统就会自动放到 Public Schema 中

# 数据库元数据

元数据指的是数据库自己维护的一些数据，用于描述数据库结构的数据

> **例如：**

有哪些库、哪些表、每张表有哪些列、每列什么类型、有哪些约束（主键、外键）

元数据存在数据库内部的**系统表 / 系统目录（system catalog）** 里，可以像查普通表一样去查它们。

## information_schema

`information_schema` 是 **SQL 标准**规定的一套**只读视图**的集合，专门用来暴露元数据。

它本身是一个特殊的 schema（可以理解成一个"库"），里面全是视图，比如：

- `information_schema.tables` —— 所有表的信息
    
- `information_schema.columns` —— 所有列的信息
    
- `information_schema.table_constraints` —— 所有约束的信息
    
- `information_schema.key_column_usage` —— 约束/键 与 列的对应关系

# 数据库角色

PostgreSQL 数据库里的角色是**用户身份** + **权限**的集合

> **角色是集群级的**—— 它不属于某个数据库，而是整个 PostgreSQL 实例（集群）全局存在，`pg_roles` 系统视图能看到全部角色。

每个数据库连接**必然以某个角色登录**，之后所有操作都以这个角色名义执行。

**但是：**

- `session_user`：**连接时**指定的角色，会话内不变。
	
- `current_user` / `current_role`：**当前生效**的角色，可以被 `SET ROLE` 临时改变。
	
- RLS 策略**只看 current_role**，不看 session_user。

角色就是连接后是谁，决定了能动什么；而 `SET LOCAL ROLE` 就是**在事务内临时换一个身份**。

> **示例：**

``` sql
CREATE ROLE "proj_9f3a1c02_usr" NOLOGIN
```

`NOLOGIN` 表示不能登录数据库；`NOINHERIT` 表示**不继承**
## 注意

PostgreSQL 默认给 `PUBLIC`（所有角色的集合）授予 `public` schema 的 `USAGE`，这意味着任何角色都能看到 public 里的表。

``` sql
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
```

这一步就是撤销默认的权限；对于我之前的项目，只给项目角色访问自己 Schema 的权限


# 权限管理

## `GRANT ALL ON ALL TABLES` 

批量授权操作

作用是将指定模式下**当前已经存在**的所有表的全部权限（如 SELECT, INSERT, UPDATE, DELETE 等），一次性授予给某个用户或角色

**缺点：**

它只对执行命令那一刻已经存在的表生效。如果之后在该模式下新建了表，该用户默认是**没有**权限访问新表的，除非再次手动执行授权

**示例：**

``` sql
GRANT ALL ON ALL TABLES IN SCHEMA ${schemaIdent} TO ${roleIdent}

GRANT ALL ON ALL SEQUENCES IN SCHEMA ${schemaIdent} TO ${roleIdent}
```

## `ALTER DEFAULT PRIVILEGES`

配置**未来对象的默认权限**

提前设定好规则，让**以后**创建的对象自动带上指定的权限。

它可以针对特定模式（`IN SCHEMA`）或特定角色（`FOR ROLE`）来设定。

``` sql
ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaIdent} GRANT ALL ON TABLES TO ${roleIdent}

ALTER DEFAULT PRIVILEGES IN SCHEMA ${schemaIdent} GRANT ALL ON SEQUENCES TO ${roleIdent}
```

**具体讲解：**

``` sql
ALTER DEFAULT PRIVILEGES   -- ① 动词：修改"默认权限"配置
  IN SCHEMA "proj_9f3a1c02"     -- ② 作用域：只针对该 schema 内新建的对象
  GRANT ALL ON TABLES           -- ③④ 对象类型 + 授权动作
  TO "proj_9f3a1c02_usr";       -- ⑤ 受益者：项目角色
```


# RSL

权限其实有两层颗粒度

第一层是表级/列级，决定能不能看到这个表/这个列

RSL 行级安全策略，决定能看到的是表里的**哪些行**
