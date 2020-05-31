import { PaymentMethod } from '../models/paymentMethod';

export class GooglePayment implements PaymentMethod {
 init = async (dbConn, paymentConfig, product, quantity) => {
  return null;
 }

 build = async (paymentConfig, external_transaction_id) => {
  return null;
 }

 check = async (paymentConfig, external_transaction_id) => {
  return false;
 }
}
