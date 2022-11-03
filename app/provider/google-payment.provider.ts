/**
 * @description holds Google payment provider
 */

import { MongoDbProvider } from '@open-template-hub/common';
import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';

export class GooglePayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = 'succeeded';

  constructEvent(paymentConfig: PaymentConfig, body: any, signature: any) {
    throw new Error('Method not implemented.');
  };

  init = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      quantity: number,
      transaction_id: string,
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
  ): Promise<string> => {
    // Todo: Implement
    return '';
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

  getSuccessStatus() {
    return this.SUCCESS_STATUS
  }

  initOneTimePayment(dbConn: any, paymentConfig: PaymentConfig, product: Product, quantity: number, transaction_id: string, origin: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  
  createCustomer(paymentConfig: any, username: string) {
    throw new Error('Method not implemented.');
  }

  initSubscription(dbConn: any, paymentConfig: PaymentConfig, product: Product, customerId: string, origin: string) {
    throw new Error('Method not implemented.');
  }

  getModeFromProduct(payload: any): string { 
    throw new Error('Method not implemented.');
  }

  getUsernameByExternalCustomerId(mongodb_provider: MongoDbProvider, payment_config_key: string, externalCustomerId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  createPortalSession(paymentConfig: PaymentConfig, customerId: string, origin: string): any {
    throw new Error('Method not implemented.');
  }
}
