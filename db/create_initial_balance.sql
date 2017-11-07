insert into balances
(balance, user_id)
Values ($1, $2)
returning *;
