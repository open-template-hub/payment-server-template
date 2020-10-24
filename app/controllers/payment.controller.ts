/**
 * @description holds crud operations for the payment entity
 */

import { PaymentConfigRepository } from "../repository/payment-config.repository";
import { TransactionHistoryRepository } from "../repository/transaction-history.repository";
import { PaymentWrapper } from "../wrappers/payment.wrapper";
import { ProductRepository } from "../repository/product.repository";

export const initPayment = async (
  dbProviders,
  username,
  paymentConfigKey,
  product_id,
  quantity
) => {
  let paymentSession = null;

  try {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
      paymentConfigKey
    );

    if (paymentConfig === null)
      throw new Error("Payment method can not be found");

    const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

    const productRepository = await new ProductRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    let product: any = await productRepository.getProductByProductId(
      product_id
    );
    if (product === null) throw new Error("Product can not be found");

    let external_transaction = await paymentWrapper.init(
      dbProviders.mongoDbProvider.conn,
      paymentConfig,
      product,
      quantity
    );
    if (external_transaction === null)
      throw new Error("Payment can not be initiated");

    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    await transactionHistoryRepository.createTransactionHistory(
      paymentConfigKey,
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
    console.error("> initPayment error: ", error);
    throw error;
  }

  return paymentSession;
};

export const initPaymentWithExternalTransactionId = async (
  dbProviders,
  username,
  paymentConfigKey,
  product_id,
  external_transaction_id
) => {
  try {
    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );
    await transactionHistoryRepository.createTransactionHistory(
      paymentConfigKey,
      username,
      product_id,
      external_transaction_id,
      {}
    );
    return {
      external_transaction_id: external_transaction_id,
    };
  } catch (error) {
    console.error("> initPaymentWithExternalTransactionId error: ", error);
    throw error;
  }
};

export const refreshTransactionHistory = async (
  dbProviders,
  paymentConfigKey,
  external_transaction_id
) => {
  try {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    let paymentConfig: any = paymentConfigRepository.getPaymentConfigByKey(
      paymentConfigKey
    );

    if (paymentConfig === null)
      throw new Error("Payment method can not be found");
    const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

    const transaction_history = await paymentWrapper.getTransactionHistory(
      paymentConfig,
      external_transaction_id
    );

    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
      dbProviders.mongoDbProvider.conn
    );

    const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistory(
      paymentConfig,
      external_transaction_id,
      transaction_history
    );

    await paymentWrapper.receiptStatusUpdate(
      dbProviders.postgreSqlProvider,
      paymentConfig,
      external_transaction_id,
      updated_transaction_history
    );
  } catch (error) {
    console.error("> refreshTransactionHistory error: ", error);
    throw error;
  }
};
