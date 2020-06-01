import { PaymentMethod } from '../../models/paymentMethod';

export class GooglePayment implements PaymentMethod {
 init = async (dbConn, paymentConfig, product, quantity) => {
  return null;
 }

 build = async (paymentConfig, external_transaction_id) => {
  return null;
 }

 getTransactionHistory = async (dbConn, paymentConfig, external_transaction_id) => {

  return {};
 }

 receiptStatusUpdate(dbConn: any, paymentConfig: any, external_transaction_id: any, updated_transaction_history: any) {
  throw new Error("Method not implemented.");
 }

}
