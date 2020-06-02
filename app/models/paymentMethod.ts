export interface PaymentMethod {
 init(dbConn, paymentConfig, product, quantity);

 build(paymentConfig, external_transaction);

 getTransactionHistory(paymentConfig, external_transaction_id);

 receiptStatusUpdate(dbConn, paymentConfig, external_transaction_id, updated_transaction_history);
}
