/**
 * @description holds crud operations for the payment entity
 */

import paymentConfigModel from '../models/paymentConfigModel';
import { createTransactionHistory, updateTransactionHistory } from '../dao/transactionHistoryDao';
import { PaymentWrapper } from '../services/payment/paymentWrapper';
import productModel from '../models/productModel';

export const initPayment = async (dbProviders, username, paymentConfigKey, productId, quantity) => {
 let paymentSession = null;

 try {
  let paymentConfig: any = await paymentConfigModel(dbProviders.mongoDbProvider.conn).findOne({key: paymentConfigKey});
  if (paymentConfig === null) throw new Error('Payment method can not be found');

  const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

  let product: any = await productModel(dbProviders.mongoDbProvider.conn).findOne({productId: productId});
  if (product === null) throw new Error('Product can not be found');

  let external_transaction = await paymentWrapper.init(dbProviders.mongoDbProvider.conn, paymentConfig, product, quantity);
  if (external_transaction === null) throw new Error('Payment can not be initiated');

  await createTransactionHistory(dbProviders.mongoDbProvider, paymentConfigKey, username, productId, external_transaction.id, external_transaction.history);

  /** build method is important because other providers might have special build
   * rather than returning session from init
   * that's why build is attached
   */
  paymentSession = await paymentWrapper.build(paymentConfig, external_transaction);
 } catch (error) {
  console.error('> initPayment error: ', error);
  throw error;
 }

 return paymentSession;
}

export const initPaymentWithExternalTransactionId = async (dbProviders, username, paymentConfigKey, productId, external_transaction_id) => {
 let paymentSession = {
  external_transaction_id: null
 };

 try {
  await createTransactionHistory(dbProviders.postgreSqlProvider, paymentConfigKey, username, productId, external_transaction_id, {});
  paymentSession = {
   external_transaction_id: external_transaction_id
  };
 } catch (error) {
  console.error('> initPaymentWithExternalTransactionId error: ', error);
  throw error;
 }

 return paymentSession;
}

// INFO: Refreshing transaction history only, do not update receipt here, do not call this function from routes directly since it always updates against payment methods!
export const refreshTransactionHistory = async (dbProviders, paymentConfigKey, external_transaction_id) => {
 try {
  let paymentConfig: any = await paymentConfigModel(dbProviders.mongoDbProvider.conn).findOne({key: paymentConfigKey});
  if (paymentConfig === null) throw new Error('Payment method can not be found');
  const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

  const transaction_history = await paymentWrapper.getTransactionHistory(paymentConfig, external_transaction_id);
  const updated_transaction_history = await updateTransactionHistory(dbProviders.mongoDbProvider.conn, paymentConfig, external_transaction_id, transaction_history);

  await paymentWrapper.receiptStatusUpdate(dbProviders.mongoDbProvider.conn, paymentConfig, external_transaction_id, updated_transaction_history);

 } catch (error) {
  console.error('> refreshTransactionHistory error: ', error);
  throw error;
 }
}
