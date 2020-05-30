/**
 * @description holds crud operations for the payment entity
 */

import paymentModel from "../models/paymentModel";
import { createTransaction } from "../dao/transactionDao";
import { PaymentWrapper } from "../services/paymentWrapper";

export const initPayment = async(dbProviders, username, paymentKey, productId) => {
  let paymentSession = null;
  const paymentWrapper = new PaymentWrapper(paymentKey);

  try {
    let payment: any = await paymentModel(dbProviders.mongoDbProvider.conn).findOne({key: paymentKey});
    if (payment === null) throw new Error("Payment method can not be found");

    let payload = payment.payload; 
    let external_transaction_id = paymentWrapper.init(payload);
    if (external_transaction_id === null) throw new Error("Payment can not be initiated");

    createTransaction(dbProviders.postgreSqlProvider, paymentKey, username, productId, external_transaction_id);
    paymentSession = paymentWrapper.build(payload, external_transaction_id);
   } catch (error) {
    console.error('> initPayment error: ', error);
    throw error;
   }

   return paymentSession;
}