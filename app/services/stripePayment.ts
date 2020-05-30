import { PaymentMethod } from "../models/paymentMethod";

export class StripePayment implements PaymentMethod {
  init = async(payload) => {
    
  }
  build = async(payload, external_transaction_id) => {

  }
}