import { PaymentMethod } from '../../models/paymentMethod';
import { PaymentMethodEnum } from './paymentWrapper';
import axios from 'axios';

export class CoinbasePayment implements PaymentMethod {

 init = async (dbConn, paymentConfig, product, quantity) => {

  const charge = {
   name: product.payload.name,
   description: product.payload.description,
   local_price: {
    amount: product.payload.coinbase.amount * quantity,
    currency: product.payload.coinbase.currency
   },
   pricing_type: 'fixed_price',
   redirect_url: paymentConfig.payload.success_url,
   cancel_url: paymentConfig.payload.cancel_url
  };

  const headers = {
   'Content-Type': 'application/json',
   'X-CC-Api-Key': paymentConfig.payload.secret,
   'X-CC-Version': '2018-03-22'
  };

  const response = await axios.post<any>(paymentConfig.payload.charge_url, charge, {headers: headers});

  return {history: response.data.data, id: response.data.data.id};
 }

 build = async (paymentConfig, external_transaction) => {
  return {method: PaymentMethodEnum.Coinbase, payload: {id: external_transaction.history.code}};
 }

 getTransactionHistory = async (dbConn, paymentConfig, external_transaction_id) => {

  const headers = {
   'X-CC-Api-Key': paymentConfig.payload.secret,
   'X-CC-Version': '2018-03-22'
  };

  const response = await axios.get<any>(`${paymentConfig.payload.charge_url}/${external_transaction_id}`, {headers: headers});

  return response.data.data;
 }

 receiptStatusUpdate = async (dbConn, paymentConfig, external_transaction_id, updated_transaction_history) => {
  return null;
 }
}
