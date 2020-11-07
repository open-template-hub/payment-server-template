import { TransactionHistoryDataModel } from '../data/transaction-history.data';

export class TransactionHistoryRepository {
  private dataModel: any = null;

  initialize = async (connection: any) => {
    this.dataModel = await new TransactionHistoryDataModel().getDataModel(
      connection
    );
    return this;
  };

  createTransactionHistory = async (
    payment_config_key,
    username,
    product_id,
    external_transaction_id,
    transaction_history
  ) => {
    try {
      await this.dataModel.create({
        payment_config_key,
        username,
        product_id,
        external_transaction_id,
        payload: { transaction_history },
      });
    } catch (error) {
      console.error('> createTransactionHistory error: ', error);
      throw error;
    }
  };

  updateTransactionHistory = async (
    paymentConfig,
    external_transaction_id,
    transaction_history
  ) => {
    try {
      return await this.dataModel.findOneAndUpdate(
        { payment_config_key: paymentConfig.key, external_transaction_id },
        { 'payload.transaction_history': transaction_history },
        { new: true }
      );
    } catch (error) {
      console.error('> updateTransactionHistory error: ', error);
      throw error;
    }
  };
}
