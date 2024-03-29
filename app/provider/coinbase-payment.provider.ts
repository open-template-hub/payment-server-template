/**
 * @description holds Coinbase payment provider
 */

import { MongoDbProvider } from '@open-template-hub/common';
import axios from 'axios';
import { CurrencyCode, ReceiptStatus } from '../constant';
import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';
import { ReceiptRepository } from '../repository/receipt.repository';
import { confirmed_external_transaction_ids } from '../store';
import { PaymentMethodEnum } from '../wrapper/payment.wrapper';

export class CoinbasePayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = 'CONFIRMED';

  constructEvent( paymentConfig: PaymentConfig, body: any, signature: any ) {
    throw new Error( 'Method not implemented.' );
  }

  init = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      quantity: number,
      transaction_id: string
  ) => {
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

  /**
   * builds payload
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build = async ( paymentConfig: PaymentConfig, external_transaction: any ) => {
    return {
      method: PaymentMethodEnum.Coinbase,
      payload: { id: external_transaction.history.code },
    };
  };

  /**
   * confirms payment
   * only for admin usage, test purpose
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   */
  confirmPayment = async (
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ) => {
    confirmed_external_transaction_ids.push(
        paymentConfig.payload.method + '_' + external_transaction_id
    );
  };

  /**
   * gets transaction history
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @returns transaction history
   */
  getTransactionHistory = async (
      paymentConfig: PaymentConfig,
      external_transaction_id: string
  ) => {
    const headers = {
      'X-CC-Api-Key': paymentConfig.payload.secret,
      'X-CC-Version': '2018-03-22',
    };

    const response = await axios.get<any>(
        `${ paymentConfig.payload.charge_url }/${ external_transaction_id }`,
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
      history.payments.push( {
        status: this.SUCCESS_STATUS,
      } );
    }

    return history;
  };

  /**
   * updates receipt status
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param external_transaction_id external transaction id
   * @param updated_transaction_history updated transaction history
   */
  receiptStatusUpdate = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      external_transaction_id: string,
      updated_transaction_history: any
  ): Promise<string> => {
    if (
        updated_transaction_history &&
        updated_transaction_history.payload.transaction_history &&
        updated_transaction_history.payload.transaction_history.payments &&
        updated_transaction_history.payload.transaction_history.payments.length >
        0
    ) {
      let confirmed = false;

      await updated_transaction_history.payload.transaction_history.payments.forEach(
          ( payment: any ) => {
            if ( payment.status === this.SUCCESS_STATUS ) {
              confirmed = true;
            }
          }
      );

      if ( confirmed ) {
        const receiptRepository = new ReceiptRepository( dbConn );
        let created = await receiptRepository.getReceiptWithExternalTransactionId(
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

          const success = ReceiptStatus.SUCCESS;

          await receiptRepository.createReceipt( {
                username: updated_transaction_history.username,
                external_transaction_id,
                product_id: updated_transaction_history.product_id,
                payment_config_key: paymentConfig.key,
                created_time: `${ new Date().getTime() }`,
                total_amount: amount,
                currency_code,
                status: success
              }
          );

          return success;
        }
      }
    }

    return '';
  };

  /**
   * gets mapped currency code
   * @param currency_code currency code
   */
  currencyCodeMap = ( currency_code: string ) => {
    if ( currency_code === 'USD' ) {
      return CurrencyCode.USD;
    }
    return currency_code;
  };

  /**
   * creates product
   * @param amount amount
   * @param currency currency
   */
  createProduct = async ( amount: number, currency: string ) => {
    return { amount, currency };
  };

  getSuccessStatus() {
    return this.SUCCESS_STATUS;
  }

  initOneTimePayment( dbConn: any, paymentConfig: PaymentConfig, product: Product, quantity: number, transaction_id: string, origin: string ): Promise<any> {
    throw new Error( 'Method not implemented.' );
  }

  createCustomer( paymentConfig: any, username: string ) {
    throw new Error( 'Method not implemented.' );
  }

  initSubscription( dbConn: any, paymentConfig: PaymentConfig, product: Product, customerId: string, origin: string ) {
    throw new Error( 'Method not implemented.' );
  }

  getModeFromProduct( payload: any ): string {
    throw new Error( 'Method not implemented.' );
  }

  getUsernameByExternalCustomerId( mongodb_provider: MongoDbProvider, payment_config_key: string, externalCustomerId: string ): Promise<string> {
    throw new Error( 'Method not implemented.' );
  }

  createPortalSession( paymentConfig: PaymentConfig, customerId: string, origin: string ) {
    throw new Error( 'Method not implemented.' );
  }
}
