/**
 * @description holds payment wrapper
 */

import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';
import { CoinbasePayment } from '../provider/coinbase-payment.provider';
import { GooglePayment } from '../provider/google-payment.provider';
import { PayPalPayment } from '../provider/paypal-payment.provider';
import { StripePayment } from '../provider/stripe-payment.provider';

export enum PaymentMethodEnum {
  Stripe = 'stripe',
  Coinbase = 'coinbase',
  Google = 'google',
  PayPal = 'paypal',
}

export class PaymentWrapper implements PaymentMethod {
  constructor(method: PaymentMethodEnum | undefined) {
    switch (method) {
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

  /**
   * initializes payment method
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param product product
   * @param quantity quantity
   */
  init = async (
    dbConn: any,
    paymentConfig: PaymentConfig,
    product: Product,
    quantity: number
  ) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.init(
      dbConn,
      paymentConfig,
      product,
      quantity
    );
  };

  /**
   * builds payment method
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build = async (
    paymentConfig: PaymentConfig,
    external_transaction: string
  ) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.build(paymentConfig, external_transaction);
  };

  /**
   * gets transaction history by external transaction id
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  getTransactionHistory = async (
    paymentConfig: PaymentConfig,
    external_transaction_id: string
  ) => {
    if (this.paymentMethod === undefined) return null;
    return await this.paymentMethod.getTransactionHistory(
      paymentConfig,
      external_transaction_id
    );
  };

  /**
   * updates receipt status
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @param updated_transaction_history updated transaction history
   */
  receiptStatusUpdate = async (
    dbConn: any,
    paymentConfig: PaymentConfig,
    external_transaction_id: string,
    updated_transaction_history: any
  ) => {
    if (this.paymentMethod === undefined) return;
    await this.paymentMethod.receiptStatusUpdate(
      dbConn,
      paymentConfig,
      external_transaction_id,
      updated_transaction_history
    );
  };

  /**
   * creates a product
   * @param amount product amount
   * @param currency product currency
   */
  createProduct = async (amount: number, currency: string) => {
    if (this.paymentMethod === undefined) return null;
    return this.paymentMethod.createProduct(amount, currency);
  };

  /**
   * confirms payment internally
   * only for test usage
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  confirmPayment = async (
    paymentConfig: PaymentConfig,
    external_transaction_id: string
  ) => {
    if (this.paymentMethod === undefined) return;
    await this.paymentMethod.confirmPayment(
      paymentConfig,
      external_transaction_id
    );
  };
}
