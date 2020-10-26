/**
 * @description holds crud operations for the payment entity
 */

import { PaymentConfigRepository } from "../repository/payment-config.repository";
import { TransactionHistoryRepository } from "../repository/transaction-history.repository";
import { PaymentWrapper } from "../wrappers/payment.wrapper";
import { ProductRepository } from "../repository/product.repository";
import { MongoDbProvider } from "../providers/mongo.provider";
import { PostgreSqlProvider } from "../providers/postgre.provider";

export const initPayment = async (
  mongoDbProvider: MongoDbProvider,
  username: string,
  paymentConfigKey: string,
  product_id: string,
  quantity: number
) => {
  let paymentSession = null;

  try {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongoDbProvider.getConnection()
    );

    let paymentConfig: any = await paymentConfigRepository.getPaymentConfigByKey(
      paymentConfigKey
    );

    if (paymentConfig === null)
      throw new Error("Payment method can not be found");

    const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

    const productRepository = await new ProductRepository().initialize(
      mongoDbProvider.getConnection()
    );

    let product: any = await productRepository.getProductByProductId(
      product_id
    );
    if (product === null) throw new Error("Product can not be found");

    let external_transaction = await paymentWrapper.init(
      mongoDbProvider.getConnection(),
      paymentConfig,
      product,
      quantity
    );
    if (external_transaction === null)
      throw new Error("Payment can not be initiated");

    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
      mongoDbProvider.getConnection()
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
  mongoDbProvider: MongoDbProvider,
  username: string,
  paymentConfigKey: string,
  product_id: string,
  external_transaction_id: string
) => {
  try {
    const transactionHistoryRepository = await new TransactionHistoryRepository().initialize(
      mongoDbProvider.getConnection()
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
  mongoDbProvider: MongoDbProvider,
  postgreSqlProvider: PostgreSqlProvider,
  paymentConfigKey: string,
  external_transaction_id: string
) => {
  try {
    const paymentConfigRepository = await new PaymentConfigRepository().initialize(
      mongoDbProvider.getConnection()
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
      mongoDbProvider.getConnection()
    );

    const updated_transaction_history = await transactionHistoryRepository.updateTransactionHistory(
      paymentConfig,
      external_transaction_id,
      transaction_history
    );

    await paymentWrapper.receiptStatusUpdate(
      postgreSqlProvider,
      paymentConfig,
      external_transaction_id,
      updated_transaction_history
    );
  } catch (error) {
    console.error("> refreshTransactionHistory error: ", error);
    throw error;
  }
};
