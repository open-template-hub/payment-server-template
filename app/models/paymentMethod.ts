export interface PaymentMethod {
  init(dbConn, payment, product, quantity);
  build(payment, product, external_transaction_id);
}