/**
 * @description holds Google payment provider
 */

import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';

export class GooglePayment implements PaymentMethod {
  /**
   * initializes google payment provider
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
    return null;
  };

  /**
   * builds payload
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build = async ( paymentConfig: PaymentConfig, external_transaction: any ) => {
    return null;
  };

  /**
   * gets transaction history
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @returns transaction history
   */
  getTransactionHistory = async (
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ) => {
    return {};
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
    // Todo: Implement
  };

  /**
   * creates a product
   * @param amount amount
   * @param currency currency
   */
  createProduct = async ( amount: number, currency: string ) => {
    return {};
  };

  /**
   * confirms payment
   * only for admin usage, test purpose
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  confirmPayment = async (
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ) => {
    // Todo: Implement
  };
}
