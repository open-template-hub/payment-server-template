import { PaymentMethod } from '../models/payment-method.model';
import { CoinbasePayment } from '../providers/coinbase-payment.provider';
import { GooglePayment } from '../providers/google-payment.provider';
import { PayPalPayment } from '../providers/paypal-payment.provider';
import { StripePayment } from '../providers/stripe-payment.provider';

export enum PaymentMethodEnum {
  Stripe = 'stripe',
  Coinbase = 'coinbase',
  Google = 'google',
  PayPal = 'paypal',
}

export class PaymentWrapper implements PaymentMethod {
  constructor(paymentMethod) {
    switch (paymentMethod) {
      case PaymentMethodEnum.Google:
        this.paymentMethod = new GooglePayment();
        break;
      case PaymentMethodEnum.Stripe:
        this.paymentMethod = new StripePayment();
        break;
      case PaymentMethodEnum.Coinbase:
        this.paymentMethod = new CoinbasePayment();
        break;
      case PaymentMethodEnum.PayPal:
        this.paymentMethod = new PayPalPayment();
        break;
      default:
        this.paymentMethod = undefined;
    }
  }

  paymentMethod: PaymentMethod | undefined;

  init = async (dbConn, paymentConfig, product, quantity) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.init(
      dbConn,
      paymentConfig,
      product,
      quantity
    );
  };

  build = async (paymentConfig, external_transaction) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.build(paymentConfig, external_transaction);
  };

  getTransactionHistory = async (paymentConfig, external_transaction_id) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.getTransactionHistory(
      paymentConfig,
      external_transaction_id
    );
  };

  receiptStatusUpdate = async (
    dbConn,
    paymentConfig,
    external_transaction_id,
    updated_transaction_history
  ) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.receiptStatusUpdate(
      dbConn,
      paymentConfig,
      external_transaction_id,
      updated_transaction_history
    );
  };

  createProduct(amount: number, currency) {
    if (this.paymentMethod === undefined) return null;
    return this.paymentMethod.createProduct(amount, currency);
  }

  confirmPayment = async (paymentConfig, external_transaction_id) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.confirmPayment(
      paymentConfig,
      external_transaction_id
    );
  };
}
