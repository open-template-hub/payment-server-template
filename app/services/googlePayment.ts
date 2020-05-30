import { PaymentMethod } from "../models/paymentMethod";

export class GooglePayment implements PaymentMethod {
  init = async(payload) => {
    
  }
  build = async(payload, external_transaction_id) => {

  }
}