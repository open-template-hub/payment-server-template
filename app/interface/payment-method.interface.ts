/**
 * @description holds payment method interface
 */

import { PaymentConfig } from './payment-config.interface';
import { Product } from './product.interface';

export interface PaymentMethod {
  /**
   * initializes payment method
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param product product
   * @param quantity quantity
   */
  init(
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      quantity: number
  ): Promise<any>;

  /**
   * builds payment method
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build( paymentConfig: PaymentConfig, external_transaction: any ): Promise<any>;

  /**
   * gets transaction history by external transaction id
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  getTransactionHistory(
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ): Promise<any>;

  /**
   * updates receipt status
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @param updated_transaction_history updated transaction history
   */
  receiptStatusUpdate(
      dbConn: any,
      paymentConfig: PaymentConfig,
      external_transaction_id: string,
      updated_transaction_history: any
  ): Promise<void>;

  /**
   * creates a product
   * @param amount product amount
   * @param currency product currency
   */
  createProduct( amount: number, currency: string ): Promise<any>;

  /**
   * confirms payment internally
   * only for test usage
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  confirmPayment(
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ): Promise<void>;
}
