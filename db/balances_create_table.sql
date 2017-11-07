CREATE TABLE IF NOT EXISTS balances (
    id SERIAL PRIMARY KEY,
    balance VARCHAR(180),
    user_id int,
    FOREIGN KEY (user_id) REFERENCEs users(id)
)
