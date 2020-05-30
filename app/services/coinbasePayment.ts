import { PaymentMethod } from '../models/paymentMethod';
import { PaymentMethodEnum } from './paymentWrapper';
import axios from 'axios';

export class CoinbasePayment implements PaymentMethod {

 init = async (dbConn, paymentConfig, product, quantity) => {

  const url = 'https://api.commerce.coinbase.com/charges';

  const charge = {
   name: product.payload.name,
   description: product.payload.description,
   local_price: {
    amount: product.payload.coinbase.amount * quantity,
    currency: product.payload.coinbase.currency
   },
   pricing_type: "fixed_price",
   redirect_url: paymentConfig.payload.success_url,
   cancel_url: paymentConfig.payload.cancel_url
  };

  const headers = {
   'Content-Type': 'application/json',
   'X-CC-Api-Key': paymentConfig.payload.secret,
   'X-CC-Version': '2018-03-22'
  };

  const response = await axios.post<any>(url, charge, {headers: headers});

  return response.data.data.code;
 }

 build = async (paymentConfig, external_transaction_id) => {
  return {method: PaymentMethodEnum.Coinbase, payload: {id : external_transaction_id}};
 }

}
