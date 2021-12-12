/**
 * @description holds payment controller
 */

import { MongoDbProvider, PostgreSqlProvider } from '@open-template-hub/common';
import mongoose from 'mongoose';
import { PaymentConfigRepository } from '../repository/payment-config.repository';
import { ProductRepository } from '../repository/product.repository';
import { TransactionHistoryRepository } from '../repository/transaction-history.repository';
import { PaymentWrapper } from '../wrapper/payment.wrapper';

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

      if ( paymentConfig === null ) {
        throw new Error( 'Payment method can not be found' );
      }

      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      const productRepository = await new ProductRepository().initialize(
          mongodb_provider.getConnection()
      );

      let product: any = await productRepository.getProductByProductId(
          product_id
      );
      if ( product === null ) {
        throw new Error( 'Product not found' );
      }

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );

      let transaction_history = await transactionHistoryRepository.createTransactionHistory(
          payment_config_key,
          username,
          product_id
      );

      let external_transaction = await paymentWrapper.init(
          mongodb_provider.getConnection(),
          paymentConfig,
          product,
          quantity,
          transaction_history._id
      );

      if ( external_transaction === null ) {
        throw new Error( 'Payment can not be initiated' );
      }

      await transactionHistoryRepository.updateTransactionHistoryWithId(
          transaction_history._id,
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
    } catch ( error ) {
      console.error( '> initPayment error: ', error );
      throw error;
    }

    return paymentSession;
  };

  /**
   * refreshes transaction history with transaction id
   * returns refreshed transaction history
   * @param mongodb_provider
   * @param postgresql_provider
   * @param username
   * @param payment_config_key
   * @param transaction_history_id
   */
  verifyPayment = async (
      mongodb_provider: MongoDbProvider,
      postgresql_provider: PostgreSqlProvider,
      username: string,
      payment_config_key: string,
      transaction_history_id: string
  ) => {
    try {
      const paymentConfigRepository = await new PaymentConfigRepository().initialize(
          mongodb_provider.getConnection()
      );

      let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
          payment_config_key
      );

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );

      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      if ( !mongoose.isValidObjectId( transaction_history_id ) ) {
        throw new Error( 'transaction not found' )
      }

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );

      const transaction_history = await transactionHistoryRepository.findTransactionHistory( transaction_history_id )

      if ( !transaction_history ) {
        throw new Error( 'transaction not found' )
      }

      if ( transaction_history.username !== username ) {
        throw new Error( 'Bad request' );
      }

      // if current status is succeeded, do not check it again from payment provider
      if ( transaction_history.payload.transaction_history.status === paymentWrapper.paymentMethod?.getSuccessStatus() ) {
        return;
      }

      const refreshed_transaction_history = await paymentWrapper.getTransactionHistory(
          paymentConfig,
          transaction_history.external_transaction_id
      );

      const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistoryWithExternalId(
          paymentConfig,
          transaction_history.external_transaction_id,
          refreshed_transaction_history
      );

      await paymentWrapper.receiptStatusUpdate(
          postgresql_provider,
          paymentConfig,
          transaction_history.external_transaction_id,
          updated_transaction_history
      );

      if ( updated_transaction_history.payload.transaction_history.status !== paymentWrapper.paymentMethod?.getSuccessStatus() ) {
        throw new Error( 'Payment not found' )
      }

    } catch ( error ) {
      console.error( '> refreshTransactionHistoryWithTransactionId error: ', error );
      throw error;
    }
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
    } catch ( error ) {
      console.error( '> initPaymentWithExternalTransactionId error: ', error );
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

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );
      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      const transaction_history = await paymentWrapper.getTransactionHistory(
          paymentConfig,
          external_transaction_id
      );

      const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
          mongodb_provider.getConnection()
      );

      const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistoryWithExternalId(
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
    } catch ( error ) {
      console.error( '> refreshTransactionHistory error: ', error );
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

      if ( paymentConfig === null )
        throw new Error( 'Payment method can not be found' );
      const paymentWrapper = new PaymentWrapper( paymentConfig.payload.method );

      await paymentWrapper.confirmPayment(
          paymentConfig,
          external_transaction_id
      );

      return external_transaction_id;
    } catch ( error ) {
      console.error( '> refreshTransactionHistory error: ', error );
      throw error;
    }
  };
}
