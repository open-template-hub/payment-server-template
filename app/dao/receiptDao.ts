export const getReceiptWithExternalTransactionId = async (db, username, external_transaction_id, product_id, payment_config_key) => {
  let res;
  try {
    res = await db.query('SELECT * FROM receipts WHERE username = $1 and external_transaction_id = $2 and product_id = $3 and payment_config_key = $4',
     [username, external_transaction_id, product_id, payment_config_key]);
   } catch (e) {
    throw e;
   }
  return res.rows[0];
}

export const getReceiptsWithUsernameAndProductId = async (db, username, product_id) => {
  let res;
  try {
    res = await db.query('SELECT * FROM receipts WHERE username = $1 and product_id = $2',
     [username, product_id]);
   } catch (e) {
    throw e;
   }
  return res.rows;
}


export const createReceipt = async (db, username, external_transaction_id, product_id, payment_config_key, created_date, status) => {
  try {
    await db.query('INSERT INTO receipts(username, external_transaction_id, product_id, payment_config_key, created_date, status) VALUES($1, $2, $3, $4, $5, $6)',
     [username, external_transaction_id, product_id, payment_config_key, created_date, status]);
   } catch (e) {
    throw e;
   }
}
 