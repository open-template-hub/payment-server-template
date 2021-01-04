/**
 * @description holds payment controller
 */

import { PaymentConfigRepository } from '../repository/payment-config.repository';
import { TransactionHistoryRepository } from '../repository/transaction-history.repository';
import { PaymentWrapper } from '../wrapper/payment.wrapper';
import { ProductRepository } from '../repository/product.repository';
import { MongoDbProvider, PostgreSqlProvider } from '@open-template-hub/common';

export class PaymentController {
  /**
   * initializes a payment
   * @param mongodb_provider mongodb provider
   * @param username username
   * @param payment_config_key payment config key
   * @param product_id product id
   * @param quantity quantity
   * @returns payment session
   */
  initPayment = async (
    mongodb_provider: MongoDbProvider,
    username: string,
    payment_config_key: string,
    product_id: string,
    quantity: number
  ) => {
    let paymentSession = null;

    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
        mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
      );

      if (paymentConfig === null)
        throw new Error('Payment method can not be found');

      const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

      const productRepository = await new ProductRepository().initialize(
        mongodb_provider.getConnection()
      );

      let product: any = await productRepository.getProductByProductId(
        product_id
      );
      if (product === null) throw new Error('Product can not be found');

      let external_transaction = await paymentWrapper.init(
        mongodb_provider.getConnection(),
        paymentConfig,
        product,
        quantity
      );
      if (external_transaction === null)
        throw new Error('Payment can not be initiated');

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
        mongodb_provider.getConnection()
      );

      await transactionHistoryRepository.createTransactionHistory(
        payment_config_key,
        username,
        product_id,
        external_transaction.id,
        external_transaction.history
      );

      /** build method is important because other providers might have special build
       * rather than returning session from init
       * that's why build is attached
       */
      paymentSession = await paymentWrapper.build(
        paymentConfig,
        external_transaction
      );
    } catch (error) {
      console.error('> initPayment error: ', error);
      throw error;
    }

    return paymentSession;
  };

  /**
   * initializes a payment with external transaction id
   * @param mongodb_provider mongodb provider
   * @param username username
   * @param payment_config_key payment config key
   * @param product_id product id
   * @param external_transaction_id external transaction id
   * @returns external transaction id
   */
  initPaymentWithExternalTransactionId = async (
    mongodb_provider: MongoDbProvider,
    username: string,
    payment_config_key: string,
    product_id: string,
    external_transaction_id: string
  ) => {
    try {
      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
        mongodb_provider.getConnection()
      );
      await transactionHistoryRepository.createTransactionHistory(
        payment_config_key,
        username,
        product_id,
        external_transaction_id,
        {}
      );
      return {
        external_transaction_id: external_transaction_id,
      };
    } catch (error) {
      console.error('> initPaymentWithExternalTransactionId error: ', error);
      throw error;
    }
  };

  /**
   * refreshes transaction history
   * @param mongodb_provider mongodb provider
   * @param postgresql_provider postgresql provider
   * @param payment_config_key payment config key
   * @param external_transaction_id external transaction id
   */
  refreshTransactionHistory = async (
    mongodb_provider: MongoDbProvider,
    postgresql_provider: PostgreSqlProvider,
    payment_config_key: string,
    external_transaction_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
        mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
      );

      if (paymentConfig === null)
        throw new Error('Payment method can not be found');
      const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

      const transaction_history = await paymentWrapper.getTransactionHistory(
        paymentConfig,
        external_transaction_id
      );

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
        mongodb_provider.getConnection()
      );

      const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistory(
        paymentConfig,
        external_transaction_id,
        transaction_history
      );

      await paymentWrapper.receiptStatusUpdate(
        postgresql_provider,
        paymentConfig,
        external_transaction_id,
        updated_transaction_history
      );
    } catch (error) {
      console.error('> refreshTransactionHistory error: ', error);
      throw error;
    }
  };

  /**
   * confirms a payment
   * only for admin usage, test purpose
   * @param mongodb_provider mongodb provider
   * @param payment_config_key payment config key
   * @param external_transaction_id external transaction id
   * @returns external transaction id
   */
  confirmPayment = async (
    mongodb_provider: MongoDbProvider,
    payment_config_key: string,
    external_transaction_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
        mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
        payment_config_key
      );

      if (paymentConfig === null)
        throw new Error('Payment method can not be found');
      const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

      await paymentWrapper.confirmPayment(
        paymentConfig,
        external_transaction_id
      );

      return external_transaction_id;
    } catch (error) {
      console.error('> refreshTransactionHistory error: ', error);
      throw error;
    }
  };
}
