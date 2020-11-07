import { PaymentMethod } from '../interface/payment-method.interface';

export class GooglePayment implements PaymentMethod {
  init = async (dbConn, paymentConfig, product, quantity) => {
    return null;
  };

  build = async (paymentConfig, external_transaction) => {
    return null;
  };

  getTransactionHistory = async (paymentConfig, external_transaction_id) => {
    return {};
  };

  receiptStatusUpdate(
    dbConn: any,
    paymentConfig: any,
    external_transaction_id: any,
    updated_transaction_history: any
  ) {
    throw new Error('Method not implemented.');
  }

  createProduct(amount: number, currency) {
    return {};
  }

  // only for admin usage, test purpose
  confirmPayment = async (paymentConfig, external_transaction_id) => {};
}
