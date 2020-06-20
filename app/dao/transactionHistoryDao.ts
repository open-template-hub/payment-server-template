import transactionHistoryModel from '../models/transactionHistoryModel';

export const createTransactionHistory = async (db, payment_config_key, username, product_id, external_transaction_id, transaction_history) => {
 try {
  await transactionHistoryModel(db.conn).create(
   {
    payment_config_key,
    username,
    product_id,
    external_transaction_id,
    payload: {transaction_history}
   }
  );
 } catch (error) {
  console.error('> createTransactionHistory error: ', error);
  throw error;
 }
}

export const updateTransactionHistory = async (dbConn, paymentConfig, external_transaction_id, transaction_history) => {
 try {
  return await transactionHistoryModel(dbConn).findOneAndUpdate(
   {payment_config_key: paymentConfig.key, external_transaction_id},
   {'payload.transaction_history': transaction_history},
   {new: true}
  );
 } catch (error) {
  console.error('> updateTransactionHistory error: ', error);
  throw error;
 }
}
