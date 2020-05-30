import { PaymentMethod } from "../models/paymentMethod";

export class GooglePayment implements PaymentMethod {
  init = async(dbConn, payment, product, quantity) => {
    return null;
  }

  build = async(payment, external_transaction_id) => {
    return null;
  }
}