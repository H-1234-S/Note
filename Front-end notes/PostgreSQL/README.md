# PostgreSQL 学习指南（基于 PostgreSQL 18）

> 版本基准：PostgreSQL 18 当前官方文档与 18.4 小版本发布信息。学习时优先阅读官方 `current` 文档，因为小版本会持续修复问题。

## 资料来源

- 官方文档：https://www.postgresql.org/docs/current/
- PostgreSQL 18 文档：https://www.postgresql.org/docs/18/
- PostgreSQL 18 发布说明：https://www.postgresql.org/docs/18/release-18.html
- psql 手册：https://www.postgresql.org/docs/current/app-psql.html
- SQL 命令索引：https://www.postgresql.org/docs/current/sql-commands.html

## 学习路线

1. `00-学习路线.md`：如何安装、怎么练、每阶段学什么。
2. `01-快速上手.md`：连接数据库、创建库表、插入查询。
3. `02-SQL基础.md`：查询、过滤、排序、聚合、JOIN、子查询、CTE。
4. `03-数据建模与约束.md`：类型、主键、外键、唯一约束、检查约束、范式。
5. `04-函数事务与并发.md`：事务、隔离级别、锁、函数、过程。
6. `05-索引与查询优化.md`：B-tree、GIN、GiST、BRIN、EXPLAIN、统计信息。
7. `06-高级SQL能力.md`：窗口函数、JSONB、数组、全文搜索、递归查询。
8. `07-安全权限与多租户.md`：角色、权限、Schema、RLS、审计思路。
9. `08-备份恢复与运维.md`：备份、恢复、VACUUM、WAL、复制、高可用入门。
10. `09-应用开发实践.md`：连接池、迁移、Node.js/Prisma 示例、常见坑。
11. `10-练习项目.md`：一个小型记账系统，从建模到查询优化。
12. `11-PostgreSQL18新特性.md`：PostgreSQL 18 的重要新增能力和迁移注意点。
13. `12-核心原理深入.md`：表、索引、JOIN、EXPLAIN、事务、锁、MVCC、查询优化专题。
14. `examples/accounting.sql`：完整可运行练习 SQL。

## 建议学习方法

- 每章先读概念，再把代码复制到 `psql` 或数据库 GUI 中运行。
- 每学完一章，至少改造一次示例：新增字段、改查询条件、加约束或索引。
- 学优化时不要只背索引类型，一定用 `EXPLAIN (ANALYZE, BUFFERS)` 看真实计划。
- 学运维时要亲手做一次备份和恢复，哪怕只是本地测试库。

## 推荐本地练习环境

Docker 示例：

```bash
docker run --name pg18-study \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=study \
  -p 5432:5432 \
  -d postgres:18
```

连接：

```bash
psql "postgresql://postgres:postgres@localhost:5432/study"
```

如果你已经安装了 PostgreSQL，也可以直接使用本地服务。
