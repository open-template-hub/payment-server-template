import { GooglePayment } from "./googlePayment";
import { PaymentMethod } from "../models/paymentMethod";
import { StripePayment } from "./stripePayment";

export class PaymentWrapper implements PaymentMethod {
  constructor(paymentConfigKey) {
    switch(paymentConfigKey) {
      case "GOOGLE":
      case "GOOGLE_LOCAL":
        this.paymentMethod = new GooglePayment();
        break;
      case "STRIPE":
      case "STRIPE_LOCAL":
        this.paymentMethod = new StripePayment();
        break;
      default:
        this.paymentMethod = undefined;
    }
  }

  paymentMethod: PaymentMethod | undefined;

  init = async(dbConn, paymentConfig, product, quantity) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.init(dbConn, paymentConfig, product, quantity);
  }

  build = async(paymentConfig, external_transaction_id) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.build(paymentConfig, external_transaction_id);
  }
}
