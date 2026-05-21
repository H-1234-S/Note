# 06. 高级 SQL 能力

## 窗口函数

窗口函数在不折叠行的情况下做统计。

```sql
SELECT
  user_id,
  id AS order_id,
  total_amount,
  row_number() OVER (
    PARTITION BY user_id
    ORDER BY created_at DESC
  ) AS order_rank
FROM orders;
```

查询每个用户最近一笔订单：

```sql
WITH ranked AS (
  SELECT
    *,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC
    ) AS rn
  FROM orders
)
SELECT *
FROM ranked
WHERE rn = 1;
```

## JSONB

```sql
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO events (payload)
VALUES ('{"type": "signup", "user": {"id": 1, "plan": "pro"}}');
```

查询：

```sql
SELECT payload ->> 'type' AS event_type
FROM events
WHERE payload @> '{"type": "signup"}';
```

读取嵌套字段：

```sql
SELECT payload #>> '{user,plan}' AS plan
FROM events;
```

## 数组

```sql
CREATE TABLE articles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

INSERT INTO articles (title, tags)
VALUES ('PostgreSQL Indexes', ARRAY['postgresql', 'database']);

SELECT *
FROM articles
WHERE tags @> ARRAY['postgresql'];
```

## 全文搜索

```sql
CREATE TABLE documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || body)
  ) STORED
);

CREATE INDEX idx_documents_search
ON documents
USING gin (search_vector);

SELECT title
FROM documents
WHERE search_vector @@ plainto_tsquery('english', 'database index');
```

## 递归查询

适合树形结构：

```sql
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT REFERENCES categories(id),
  name TEXT NOT NULL
);

WITH RECURSIVE category_tree AS (
  SELECT id, parent_id, name, 1 AS depth
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT c.id, c.parent_id, c.name, t.depth + 1
  FROM categories AS c
  JOIN category_tree AS t ON t.id = c.parent_id
)
SELECT *
FROM category_tree
ORDER BY depth, id;
```

## UPSERT

```sql
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email)
DO UPDATE SET name = EXCLUDED.name
RETURNING *;
```

练习：

1. 用窗口函数做用户消费排行榜。
2. 用 JSONB 保存事件日志并按事件类型查询。
3. 用递归 CTE 查询分类树。

