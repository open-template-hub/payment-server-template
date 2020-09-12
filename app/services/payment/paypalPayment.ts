import { PaymentMethod } from '../../models/paymentMethod';
import { PaymentMethodEnum } from './paymentWrapper';
import paypal from '@paypal/checkout-server-sdk';
import { createReceipt, getReceiptWithExternalTransactionId } from '../../dao/receiptDao';
import { CurrencyCode, ReceiptStatus } from '../../util/constant';

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
  order = await paypalClient.execute(request);

  return {history: order.result, id: order.result.id};
 }

 build = async (paymentConfig, external_transaction) => {
  return {method: PaymentMethodEnum.PayPal, payload: {id: external_transaction.id}};
 }

 getTransactionHistory = async (paymentConfig, external_transaction_id) => {

  const paypalClient = this.getPayPalClient(paymentConfig);

  let request = new paypal.orders.OrdersGetRequest(external_transaction_id);

  let order;
  order = await paypalClient.execute(request);

  return order.result;
 }

 receiptStatusUpdate = async (dbConn, paymentConfig, external_transaction_id, updated_transaction_history) => {
  if (updated_transaction_history && updated_transaction_history.payload.transaction_history
   && updated_transaction_history.payload.transaction_history.status === 'APPROVED') {
   let created = await getReceiptWithExternalTransactionId(dbConn, updated_transaction_history.username,
    external_transaction_id, updated_transaction_history.product_id, paymentConfig.key);
   if (!created && updated_transaction_history.payload.transaction_history.purchase_units &&
    updated_transaction_history.payload.transaction_history.purchase_units.length > 0) {
    let amount: number = 0.00;
    let currency_code = undefined;

    await updated_transaction_history.payload.transaction_history.purchase_units.forEach(purchase_unit => {
     if (purchase_unit.amount?.value) {
      amount += purchase_unit.amount.value;

      if (currency_code && currency_code !== purchase_unit.amount.currency_code) {
       console.error('Two different currency codes in one transaction!');
      }
      currency_code = this.currencyCodeMap(purchase_unit.amount.currency_code);
     }
    });

    await createReceipt(dbConn, updated_transaction_history.username,
     external_transaction_id, updated_transaction_history.product_id,
     paymentConfig.key, new Date(), amount, currency_code, ReceiptStatus.SUCCESS);
   }
  }
 }

 currencyCodeMap = (currency_code) => {
  if (currency_code === 'USD') {
   return CurrencyCode.USD;
  }
  return currency_code;
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
