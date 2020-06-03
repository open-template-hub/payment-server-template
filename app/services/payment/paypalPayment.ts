import { PaymentMethod } from '../../models/paymentMethod';
import { PaymentMethodEnum } from './paymentWrapper';
import paypal from '@paypal/checkout-server-sdk';

export class PayPalPayment implements PaymentMethod {

 init = async (dbConn, paymentConfig, product, quantity) => {

  const paypalClient = this.getPayPalClient(paymentConfig);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody(
   {
    intent: 'CAPTURE',
    application_context: {
     return_url: paymentConfig.payload.success_url,
     cancel_url: paymentConfig.payload.cancel_url,
     locale: 'en-US'
    },
    purchase_units: [{
     amount: {
      currency_code: product.payload.paypal.currency,
      value: (product.payload.paypal.amount * quantity).toString()
     }
    }]
   });

  let order;
  try {
   order = await paypalClient.execute(request);
  } catch (e) {
   throw e;
  }

  return {history: order.result, id: order.result.id};
 }

 build = async (paymentConfig, external_transaction) => {
  return {method: PaymentMethodEnum.PayPal, payload: {id: external_transaction.id}};
 }

 getTransactionHistory = async (paymentConfig, external_transaction_id) => {

  const paypalClient = this.getPayPalClient(paymentConfig);

  let request = new paypal.orders.OrdersGetRequest(external_transaction_id);

  let order;
  try {
   order = await paypalClient.execute(request);
  } catch (e) {
   throw e;
  }

  return order.result;
 }

 receiptStatusUpdate = async (dbConn, paymentConfig, external_transaction_id, updated_transaction_history) => {
  return null;
 }

 getPayPalClient(paymentConfig) {
  let paypalClient;

  if (paymentConfig.payload.env === 'sandbox') {
   paypalClient = new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(
    paymentConfig.payload.client_id, paymentConfig.payload.secret
   ));
  } else if (paymentConfig.payload.env === 'live') {
   paypalClient = new paypal.core.PayPalHttpClient(new paypal.core.LiveEnvironment(
    paymentConfig.payload.client_id, paymentConfig.payload.secret
   ));
  }

  return paypalClient;
 }

 createProduct(amount: number, currency) {
  return {amount, currency};
 }
}
