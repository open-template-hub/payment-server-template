export interface PaymentMethod {
  init(payload);
  build(payload, external_transaction_id);
}