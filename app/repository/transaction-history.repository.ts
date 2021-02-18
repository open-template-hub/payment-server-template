/**
 * @description holds Transaction History repository
 */

import { TransactionHistoryDataModel } from '../data/transaction-history.data';
import { PaymentConfig } from '../interface/payment-config.interface';

export class TransactionHistoryRepository {
  private dataModel: any = null;

  /**
   * initializes transaction history repostiory
   * @param connection connection
   * @returns transaction history repository
   */
  initialize = async ( connection: any ) => {
    this.dataModel = await new TransactionHistoryDataModel().getDataModel(
        connection
    );
    return this;
  };

  /**
   * creates transaction history
   * @param payment_config_key payment config key
   * @param username username
   * @param product_id product id
   * @param external_transaction_id external transaction id
   * @param transaction_history transaction history
   */
  createTransactionHistory = async (
      payment_config_key: string,
      username: string,
      product_id: string,
      external_transaction_id: string,
      transaction_history: any
  ) => {
    try {
      await this.dataModel.create( {
        payment_config_key,
        username,
        product_id,
        external_transaction_id,
        payload: { transaction_history },
      } );
    } catch ( error ) {
      console.error( '> createTransactionHistory error: ', error );
      throw error;
    }
  };

  /**
   * updates transaction history
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @param transaction_history transaction history
   * @returns updated transaction history
   */
  updateTransactionHistory = async (
      paymentConfig: PaymentConfig,
      external_transaction_id: string,
      transaction_history: any
  ) => {
    try {
      return await this.dataModel.findOneAndUpdate(
          { payment_config_key: paymentConfig.key, external_transaction_id },
          { 'payload.transaction_history': transaction_history },
          { new: true }
      );
    } catch ( error ) {
      console.error( '> updateTransactionHistory error: ', error );
      throw error;
    }
  };
}
