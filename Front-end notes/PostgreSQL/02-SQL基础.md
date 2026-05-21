# 02. SQL 基础

## SELECT 的执行思路

SQL 的书写顺序通常是：

```sql
SELECT ...
FROM ...
JOIN ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...
```

逻辑处理顺序更接近：

```text
FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
```

## 过滤

```sql
SELECT *
FROM users
WHERE created_at >= now() - interval '7 days'
  AND email LIKE '%@example.com';
```

## 排序和分页

```sql
SELECT id, email, created_at
FROM users
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;
```

大数据量分页更推荐“游标式分页”：

```sql
SELECT id, email, created_at
FROM users
WHERE (created_at, id) < ('2026-05-01 10:00:00+08', 1000)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

## 聚合

```sql
SELECT date_trunc('day', created_at) AS day, count(*) AS user_count
FROM users
GROUP BY day
ORDER BY day DESC;
```

`WHERE` 过滤分组前的数据，`HAVING` 过滤分组后的结果：

```sql
SELECT customer_id, count(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING count(*) >= 3;
```

## JOIN

```sql
SELECT o.id, u.email, o.total_amount, o.created_at
FROM orders AS o
JOIN users AS u ON u.id = o.user_id
ORDER BY o.created_at DESC;
```

常见 JOIN：

- `INNER JOIN`：只保留两边匹配的行。
- `LEFT JOIN`：保留左表所有行，右表没有匹配则为 `NULL`。
- `FULL JOIN`：保留两边所有行。
- `CROSS JOIN`：笛卡尔积，谨慎使用。

## 子查询

```sql
SELECT *
FROM users
WHERE id IN (
  SELECT user_id
  FROM orders
  WHERE total_amount > 1000
);
```

## CTE

CTE 让复杂查询更清晰：

```sql
WITH paid_orders AS (
  SELECT *
  FROM orders
  WHERE status = 'paid'
),
customer_total AS (
  SELECT user_id, sum(total_amount) AS total_spent
  FROM paid_orders
  GROUP BY user_id
)
SELECT u.email, c.total_spent
FROM customer_total AS c
JOIN users AS u ON u.id = c.user_id
ORDER BY c.total_spent DESC;
```

练习：

1. 查询每个用户的订单数量。
2. 查询最近 30 天消费金额最高的 10 个用户。
3. 查询没有下过订单的用户。

