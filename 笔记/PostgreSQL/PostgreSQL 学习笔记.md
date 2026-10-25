
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


# 事务

