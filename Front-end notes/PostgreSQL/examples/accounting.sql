DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  UNIQUE (user_id, name, kind)
);

CREATE TABLE transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  category_id BIGINT NOT NULL REFERENCES categories(id),
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_time
ON transactions (user_id, occurred_at DESC, id DESC);

CREATE INDEX idx_transactions_account_time
ON transactions (account_id, occurred_at DESC);

CREATE INDEX idx_transactions_category_time
ON transactions (category_id, occurred_at DESC);

CREATE INDEX idx_transactions_metadata_gin
ON transactions
USING gin (metadata);

INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice');

INSERT INTO accounts (user_id, name, balance)
VALUES
  (1, '现金', 500.00),
  (1, '银行卡', 3000.00);

INSERT INTO categories (user_id, name, kind)
VALUES
  (1, '工资', 'income'),
  (1, '餐饮', 'expense'),
  (1, '交通', 'expense');

BEGIN;

INSERT INTO transactions (
  user_id,
  account_id,
  category_id,
  kind,
  amount,
  note,
  metadata,
  occurred_at
)
VALUES
  (1, 2, 1, 'income', 12000.00, '五月工资', '{"channel": "bank"}', '2026-05-01 09:00:00+08'),
  (1, 1, 2, 'expense', 35.50, '午餐', '{"merchant": "canteen"}', '2026-05-02 12:20:00+08'),
  (1, 1, 3, 'expense', 4.00, '地铁', '{"city": "shanghai"}', '2026-05-02 08:30:00+08');

UPDATE accounts
SET balance = balance + 12000.00
WHERE id = 2;

UPDATE accounts
SET balance = balance - 39.50
WHERE id = 1;

COMMIT;

SELECT
  date_trunc('month', occurred_at) AS month,
  sum(amount) FILTER (WHERE kind = 'income') AS income,
  sum(amount) FILTER (WHERE kind = 'expense') AS expense,
  coalesce(sum(amount) FILTER (WHERE kind = 'income'), 0)
    - coalesce(sum(amount) FILTER (WHERE kind = 'expense'), 0) AS net
FROM transactions
WHERE user_id = 1
GROUP BY month
ORDER BY month DESC;

SELECT
  t.id,
  a.name AS account_name,
  c.name AS category_name,
  t.kind,
  t.amount,
  t.note,
  t.metadata,
  t.occurred_at
FROM transactions AS t
JOIN accounts AS a ON a.id = t.account_id
JOIN categories AS c ON c.id = t.category_id
WHERE t.user_id = 1
ORDER BY t.occurred_at DESC, t.id DESC
LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM transactions
WHERE user_id = 1
ORDER BY occurred_at DESC, id DESC
LIMIT 20;
