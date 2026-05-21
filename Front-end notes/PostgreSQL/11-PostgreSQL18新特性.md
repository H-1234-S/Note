# 11. PostgreSQL 18 新特性速览

这一章不是入门必学，但能帮你避开旧教程的盲区。先学前面的基础，再回来读这一章会更顺。

## 当前版本状态

官方 `current` 文档目前指向 PostgreSQL 18，文档标题为 PostgreSQL 18.4 Documentation。PostgreSQL 18 主版本发布日期为 2025-09-25，18.4 小版本发布日期为 2026-05-14。

## uuidv7()

PostgreSQL 18 增加了 `uuidv7()`，可以生成按时间大致有序的 UUID。相比完全随机的 UUID v4，它在一些索引写入场景中更友好。

```sql
CREATE TABLE api_events (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO api_events (event_type)
VALUES ('signup'), ('login');

SELECT id, event_type, created_at
FROM api_events
ORDER BY id;
```

## 虚拟生成列

PostgreSQL 18 支持虚拟生成列，并把它作为生成列默认行为。虚拟生成列在读取时计算，不在写入时存储；如果希望写入时计算并保存结果，可以使用 `STORED`。

```sql
CREATE TABLE contacts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name)
);

INSERT INTO contacts (first_name, last_name)
VALUES ('Ada', 'Lovelace');

SELECT full_name
FROM contacts;
```

显式存储：

```sql
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  price NUMERIC(12, 2) NOT NULL,
  tax_rate NUMERIC(5, 4) NOT NULL,
  price_with_tax NUMERIC(12, 2)
    GENERATED ALWAYS AS (round(price * (1 + tax_rate), 2)) STORED
);
```

## RETURNING 支持 OLD 和 NEW

PostgreSQL 18 允许在 DML 的 `RETURNING` 中显式引用旧值和新值，适合审计、调试和一次性返回变更前后差异。

```sql
CREATE TABLE inventory (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

INSERT INTO inventory (name, stock)
VALUES ('keyboard', 10);

UPDATE inventory
SET stock = stock - 2
WHERE name = 'keyboard'
RETURNING
  old.stock AS before_stock,
  new.stock AS after_stock;
```

## 多列 B-tree 索引 Skip Scan

PostgreSQL 18 支持更多情况下使用多列 B-tree 索引，即使查询没有约束索引的第一列，也可能通过 skip scan 获益。

```sql
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status_created
ON orders (status, created_at);

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE created_at >= now() - interval '1 day';
```

注意：这不是说组合索引顺序不重要了。索引设计仍要围绕最常见、最关键的查询。

## EXPLAIN ANALYZE 默认包含 BUFFERS

PostgreSQL 18 中，`EXPLAIN ANALYZE` 会自动包含 buffer 信息。你仍然可以显式写：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE status = 'paid';
```

## 异步 I/O

PostgreSQL 18 增加异步 I/O 子系统，可改善顺序扫描、bitmap heap scan、VACUUM 等场景的性能。它属于运维和性能调优领域，入门阶段不用急着配置，但要知道新版在 I/O 路径上有重要变化。

相关方向：

```sql
SHOW io_method;
SHOW effective_io_concurrency;
SHOW maintenance_io_concurrency;
```

## pg_upgrade 保留优化器统计信息

升级到 PostgreSQL 18 时，`pg_upgrade` 可以保留优化器统计信息。这能减少升级后因为统计信息缺失导致查询计划不稳定的风险。

升级前仍建议：

- 阅读目标版本发布说明。
- 在测试环境演练升级。
- 保留可恢复备份。
- 观察升级后慢查询和执行计划。

## 数据校验和默认启用

PostgreSQL 18 的 `initdb` 默认启用 data checksums。它有助于发现底层存储损坏，但升级旧集群时要注意新旧集群校验和设置需要匹配。

如果确实需要关闭：

```bash
initdb --no-data-checksums -D /path/to/data
```

## MD5 密码认证弃用

PostgreSQL 18 对 MD5 密码认证给出弃用提醒。新项目优先使用更安全的认证方式，例如 SCRAM。

```sql
SHOW password_encryption;
```

推荐：

```sql
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
```

## 学习建议

- 新手先不要被新特性分散注意力，SQL、建模、事务、索引永远是主线。
- 如果你看的是 PostgreSQL 13、14、15 的教程，语法和理念大多仍可用，但新版能力要对照官方文档补齐。
- 生产升级必须看发布说明，尤其是兼容性变化和认证、备份、复制相关内容。

