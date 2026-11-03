# sql api

## sql.identifier()

当使用 Drizzle 的 `sql` 模板标签编写查询时，普通的插值（如 `` sql`WHERE id = ${userId}` ``）会被当作**参数化值**处理，生成占位符（如 `$1`）

> **但是：** 
> 
> 数据库不允许将**表名**或**列名**作为**参数绑定**。如果你直接把动态的表名或列名塞进模板，它不会被正确转义，可能导致 SQL 语法错误或注入风险

`sql.identifier()` 则用于处理表名或列名，例如**加上双引号**，用于正确的转义

``` sql
const tableName = "users";
// 输出类似: SELECT * FROM "users"
sql`SELECT * FROM ${sql.identifier(tableName)}`;
```
### 注意

`sql.identifier()`  只负责“加引号”，不负责“验证内容”；需要配合**白名单/黑名单**使用

``` sql
// 错误示范：直接信任用户输入
sql`ORDER BY ${sql.identifier(req.query.sort)}`;

// 正确做法：白名单验证
const allowed = ['id', 'created_at', 'name'];
if (!allowed.includes(req.query.sort)) throw new Error('Invalid column');
sql`ORDER BY ${sql.identifier(req.query.sort)}`;
```



