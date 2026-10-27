
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

**例如：**

``` sql
metadata JSONB
```

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

### 删除策略

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

事务是原子性的，但不是原子更新，两个并发事务可能会导致读一样的数据，处理一样的逻辑，但会造成一次**更新丢失**

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
## 数据库的原子更新


**数据库原子更新：** 是指把一次数据修改作为一个不可分割的操作执行，不会让其他事务看到这次操作只完成了一半的中间状态。