/**
 * @description holds Paypal payment provider
 */

import { CurrencyCode, ReceiptStatus } from '../constant';
import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';
import { ReceiptRepository } from '../repository/receipt.repository';
import { confirmed_external_transaction_ids } from '../store';
import { PaymentMethodEnum } from '../wrapper/payment.wrapper';

// can not use import because @types/@paypal/checkout-server-sdk not exists
const paypal = require( '@paypal/checkout-server-sdk' );

export class PayPalPayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = 'APPROVED';

  /**
   * initializes paypal payment provider
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param product product
   * @param quantity quantity
   */
  init = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      quantity: number
  ) => {
    const paypalClient = this.getPayPalClient( paymentConfig );

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer( 'return=representation' );
    request.requestBody( {
      intent: 'CAPTURE',
      application_context: {
        return_url: paymentConfig.payload.success_url,
        cancel_url: paymentConfig.payload.cancel_url,
        locale: 'en-US',
      },
      purchase_units: [
        {
          amount: {
            currency_code: product.payload.paypal.currency,
            value: ( product.payload.paypal.amount * quantity ).toString(),
          },
        },
      ],
    } );

    let order;
    order = await paypalClient.execute( request );

    return { history: order.result, id: order.result.id };
  };

  /**
   * builds payload
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build = async ( paymentConfig: PaymentConfig, external_transaction: any ) => {
    return {
      method: PaymentMethodEnum.PayPal,
      payload: { id: external_transaction.id },
    };
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
    const paypalClient = this.getPayPalClient( paymentConfig );

    let request = new paypal.orders.OrdersGetRequest( external_transaction_id );

    let order;
    order = await paypalClient.execute( request );

    const isRegression = process.env.REGRESSION || false;

    console.log(
        'Coinbase.getTransactionHistory > isRegression: ',
        isRegression
    );

    const history = order.result;

    if (
        confirmed_external_transaction_ids.indexOf(
            paymentConfig.payload.method + '_' + external_transaction_id
        ) !== -1 &&
        isRegression
    ) {
      console.log(
          'Coinbase.getTransactionHistory > Setting stripe status to success'
      );
      history.status = this.SUCCESS_STATUS;
    }

    return history;
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
  ) => {
    console.log( 'receiptStatusUpdate: ' );
    if (
        updated_transaction_history &&
        updated_transaction_history.payload.transaction_history &&
        updated_transaction_history.payload.transaction_history.status ===
        this.SUCCESS_STATUS
    ) {
      const receiptRepository = new ReceiptRepository( dbConn );
      let created = await receiptRepository.getReceiptWithExternalTransactionId(
          updated_transaction_history.username,
          external_transaction_id,
          updated_transaction_history.product_id,
          paymentConfig.key
      );

      console.log( 'Created: ', created );
      console.log(
          'purchase_units: ',
          updated_transaction_history.payload.transaction_history.purchase_units
      );
      console.log(
          'length: ',
          updated_transaction_history.payload.transaction_history.purchase_units
              .length
      );
      if (
          !created &&
          updated_transaction_history.payload.transaction_history
              .purchase_units &&
          updated_transaction_history.payload.transaction_history.purchase_units
              .length > 0
      ) {
        let amount: number = 0.0;
        let currency_code: any = undefined;

        await updated_transaction_history.payload.transaction_history.purchase_units.forEach(
            ( purchase_unit: any ) => {
              if ( purchase_unit.amount?.value ) {
                amount += purchase_unit.amount.value;

                if (
                    currency_code &&
                    currency_code !== purchase_unit.amount.currency_code
                ) {
                  console.error(
                      'Two different currency codes in one transaction!'
                  );
                }
                currency_code = this.currencyCodeMap(
                    purchase_unit.amount.currency_code
                );
              }
            }
        );

        await receiptRepository.createReceipt(
            {
              username: updated_transaction_history.username,
              external_transaction_id,
              product_id: updated_transaction_history.product_id,
              payment_config_key: paymentConfig.key,
              created_time: new Date(),
              total_amount: amount,
              currency_code,
              status: ReceiptStatus.SUCCESS
            }
        );
      }
    }
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
   * gets paypal client
   * @param paymentConfig payment config
   * @returns paypal client
   */
  getPayPalClient( paymentConfig: PaymentConfig ) {
    let paypalClient;

    if ( paymentConfig.payload.env === 'sandbox' ) {
      paypalClient = new paypal.core.PayPalHttpClient(
          new paypal.core.SandboxEnvironment(
              paymentConfig.payload.client_id,
              paymentConfig.payload.secret
          )
      );
    } else if ( paymentConfig.payload.env === 'live' ) {
      paypalClient = new paypal.core.PayPalHttpClient(
          new paypal.core.LiveEnvironment(
              paymentConfig.payload.client_id,
              paymentConfig.payload.secret
          )
      );
    }

    return paypalClient;
  }

  /**
   * creates product
   * @param amount amount
   * @param currency currency
   */
  createProduct = async ( amount: number, currency: string ) => {
    return { amount, currency };
  };
}
