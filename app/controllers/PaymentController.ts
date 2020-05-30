/**
 * @description holds crud operations for the payment entity
 */

import paymentConfigModel from '../models/paymentConfigModel';
import { createTransaction } from '../dao/transactionDao';
import { PaymentWrapper } from '../services/paymentWrapper';
import productModel from '../models/productModel';

export const initPayment = async (dbProviders, username, paymentConfigKey, productId, quantity) => {
 let paymentSession = null;

 try {
  let paymentConfig: any = await paymentConfigModel(dbProviders.mongoDbProvider.conn).findOne({key: paymentConfigKey});
  if (paymentConfig === null) throw new Error('Payment method can not be found');

  const paymentWrapper = new PaymentWrapper(paymentConfig.payload.method);

  let product: any = await productModel(dbProviders.mongoDbProvider.conn).findOne({productId: productId});
  if (product === null) throw new Error('Product can not be found');

  let external_transaction_id = await paymentWrapper.init(dbProviders.mongoDbProvider.conn, paymentConfig, product, quantity);
  if (external_transaction_id === null) throw new Error('Payment can not be initiated');

  createTransaction(dbProviders.postgreSqlProvider, paymentConfigKey, username, productId, external_transaction_id);

  /** build method is important because other providers might have special build
   * rather than returning session from init
   * that's why build is attached
   */
  paymentSession = await paymentWrapper.build(paymentConfig, external_transaction_id);
 } catch (error) {
  console.error('> initPayment error: ', error);
  throw error;
 }

 return paymentSession;
}
