export interface PaymentMethod {
  init(dbConn, payment, product, quantity);
  build(payment, external_transaction_id);
}