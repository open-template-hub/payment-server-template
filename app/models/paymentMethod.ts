export interface PaymentMethod {
 init(dbConn, paymentConfig, product, quantity);

 build(paymentConfig, external_transaction_id);
}
