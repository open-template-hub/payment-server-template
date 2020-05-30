export const createTransaction = async(db, paymentKey, username, productId, external_transaction_id) => {
  try {
    await db.query('INSERT INTO transactions(payment_key, username, external_transaction_id, product_id, status) VALUES($1, $2, $3, $4, $5)', 
    [paymentKey, username, external_transaction_id, productId, "NEW"]);
   } catch (e) {
    throw e;
   }
}