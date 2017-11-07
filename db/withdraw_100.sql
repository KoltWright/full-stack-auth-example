UPDATE balances
set balance = $1
where user_id = $2
returning balance;
