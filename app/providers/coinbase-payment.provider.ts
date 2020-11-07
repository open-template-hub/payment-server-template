import { PaymentMethod } from '../models/payment-method.model';
import { PaymentMethodEnum } from '../wrappers/payment.wrapper';
import axios from 'axios';
import {
  createReceipt,
  getReceiptWithExternalTransactionId,
} from '../repository/receipt.repository';
import { CurrencyCode, ReceiptStatus } from '../constant';
import { confirmed_external_transaction_ids } from '../store';

export class CoinbasePayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = 'CONFIRMED';

  init = async (dbConn, paymentConfig, product, quantity) => {
    const charge = {
      name: product.name,
      description: product.description,
      local_price: {
        amount: product.payload.coinbase.amount * quantity,
        currency: product.payload.coinbase.currency,
      },
      pricing_type: 'fixed_price',
      redirect_url: paymentConfig.payload.success_url,
      cancel_url: paymentConfig.payload.cancel_url,
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': paymentConfig.payload.secret,
      'X-CC-Version': '2018-03-22',
    };

    const response = await axios.post<any>(
      paymentConfig.payload.charge_url,
      charge,
      { headers: headers }
    );

    return { history: response.data.data, id: response.data.data.id };
  };

  build = async (paymentConfig, external_transaction) => {
    return {
      method: PaymentMethodEnum.Coinbase,
      payload: { id: external_transaction.history.code },
    };
  };

  // only for admin usage, test purpose
  confirmPayment = async (paymentConfig, external_transaction_id) => {
    confirmed_external_transaction_ids.push(
      paymentConfig.payload.method + '_' + external_transaction_id
    );
  };

  getTransactionHistory = async (paymentConfig, external_transaction_id) => {
    const headers = {
      'X-CC-Api-Key': paymentConfig.payload.secret,
      'X-CC-Version': '2018-03-22',
    };

    const response = await axios.get<any>(
      `${paymentConfig.payload.charge_url}/${external_transaction_id}`,
      { headers: headers }
    );

    const isRegression = process.env.REGRESSION || false;

    console.log(
      'Coinbase.getTransactionHistory > isRegression: ',
      isRegression
    );

    const history = response.data.data;

    if (
      confirmed_external_transaction_ids.indexOf(
        paymentConfig.payload.method + '_' + external_transaction_id
      ) !== -1 &&
      isRegression
    ) {
      console.log(
        'Coinbase.getTransactionHistory > Setting stripe status to success'
      );
      history.payments.push({
        status: this.SUCCESS_STATUS,
      });
    }

    return history;
  };

  receiptStatusUpdate = async (
    dbConn,
    paymentConfig,
    external_transaction_id,
    updated_transaction_history
  ) => {
    if (
      updated_transaction_history &&
      updated_transaction_history.payload.transaction_history &&
      updated_transaction_history.payload.transaction_history.payments &&
      updated_transaction_history.payload.transaction_history.payments.length >
        0
    ) {
      let confirmed = false;

      await updated_transaction_history.payload.transaction_history.payments.forEach(
        (payment) => {
          if (payment.status === this.SUCCESS_STATUS) {
            confirmed = true;
          }
        }
      );

      if (confirmed) {
        let created = await getReceiptWithExternalTransactionId(
          dbConn,
          updated_transaction_history.username,
          external_transaction_id,
          updated_transaction_history.product_id,
          paymentConfig.key
        );
        if (
          !created &&
          updated_transaction_history.payload.transaction_history.pricing &&
          updated_transaction_history.payload.transaction_history.pricing.local
        ) {
          let amount: number =
            updated_transaction_history.payload.transaction_history.pricing
              .local.amount;
          let currency_code = this.currencyCodeMap(
            updated_transaction_history.payload.transaction_history.pricing
              .local.currency
          );

          await createReceipt(
            dbConn,
            updated_transaction_history.username,
            external_transaction_id,
            updated_transaction_history.product_id,
            paymentConfig.key,
            new Date(),
            amount,
            currency_code,
            ReceiptStatus.SUCCESS
          );
        }
      }
    }
  };

  currencyCodeMap = (currency_code) => {
    if (currency_code === 'USD') {
      return CurrencyCode.USD;
    }
    return currency_code;
  };

  createProduct(amount: number, currency) {
    return { amount, currency };
  }
}
