export const createTransaction = async (db, paymentConfigKey, username, productId, external_transaction_id) => {
 try {
  await db.query('INSERT INTO transactions(payment_key, username, external_transaction_id, product_id, status) VALUES($1, $2, $3, $4, $5)',
   [paymentConfigKey, username, external_transaction_id, productId, 'NEW']);
 } catch (e) {
  throw e;
 }
}

export const getTransaction = async (db, username, paymentConfigKey, external_transaction_id) => {
  let res;
  try {
   res = await db.query('SELECT external_transaction_id FROM transactions WHERE payment_key = $1 and external_transaction_id = $2 and username = $3', 
   [paymentConfigKey, external_transaction_id, username]);
  } catch (e) {
   throw e;
  }

  return res.rows[0];
 }