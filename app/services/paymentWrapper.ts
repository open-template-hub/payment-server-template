import { GooglePayment } from "./googlePayment";
import { PaymentMethod } from "../models/paymentMethod";
import { StripePayment } from "./stripePayment";

export class PaymentWrapper implements PaymentMethod {
  constructor(paymentKey) {
    switch(paymentKey) {
      case "GOOGLE":
        this.paymentMethod = new GooglePayment();
      case "STRIPE":
        this.paymentMethod = new StripePayment();
      default:
        this.paymentMethod = undefined;
    }
  }

  paymentMethod: PaymentMethod | undefined;

  init = async(payload) => {
    if (this.paymentMethod === undefined) return null;
    return this.paymentMethod.init(payload);
  }

  build = (payload, external_transaction_id) => {
    if (this.paymentMethod === undefined) return null;
    return this.paymentMethod.build(payload, external_transaction_id);
  }
}
