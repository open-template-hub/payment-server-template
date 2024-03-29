/**
 * @description holds Stripe payment provider
 */

import { MongoDbProvider } from '@open-template-hub/common';
import Stripe from 'stripe';
import { CurrencyCode, ReceiptStatus } from '../constant';
import { PaymentConfig } from '../interface/payment-config.interface';
import { PaymentMethod } from '../interface/payment-method.interface';
import { Product } from '../interface/product.interface';
import { CustomerActivityRepository } from '../repository/customer-activity.repository';
import { ProductRepository } from '../repository/product.repository';
import { ReceiptRepository } from '../repository/receipt.repository';
import { confirmed_external_transaction_ids } from '../store';
import { PaymentMethodEnum } from '../wrapper/payment.wrapper';

export class StripePayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = 'succeeded';

  /**
   * initializes stripe payment provider
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param product product
   * @param quantity quantity
   */
  initOneTimePayment = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      quantity: number,
      transaction_id: string,
      origin: string
  ) => {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );

    const successUrl = origin + '/callback/stripe?status=success';
    const cancelUrl = origin + '/callback/stripe?status=cancel';

    const priceId = await this.getPriceId( dbConn, paymentConfig, product );
    const session = await stripe.checkout.sessions.create( {
      payment_method_types: paymentConfig.payload.payment_method_types,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: product.payload?.stripe?.mode,
      success_url: successUrl + `&id=${ product.product_id }` + `&transaction_id=${ transaction_id }&mode=payment`,
      cancel_url: cancelUrl + `&id=${ product.product_id }&mode=payment`
    } );

    let history: any = undefined;

    if ( session.payment_intent ) {
      history = await this.getTransactionHistory(
          paymentConfig,
          session.payment_intent as string
      );
    }

    return {
      history: history,
      id: session.payment_intent,
      session_id: session.id,
    };
  };

  initSubscription = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product,
      customerId: string,
      origin: string
  ) => {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );

    const successUrl = origin + '/callback/stripe?status=success&mode=subscription';
    const cancelUrl = origin + '/callback/stripe?status=cancel&mode=subscription';

    const priceId = await this.getPriceId( dbConn, paymentConfig, product );
    const session = await stripe.checkout.sessions.create( {
      payment_method_types: paymentConfig.payload.payment_method_types,
      line_items: [
        {
          price: priceId,
          quantity: 1
        },
      ],
      mode: 'subscription',
      success_url: successUrl + `&id=${ product.product_id }`,
      cancel_url: cancelUrl + `&id=${ product.product_id }`,
      customer: customerId
    } );

    return {
      session_id: session.id
    };
  };

  async createPortalSession(
      paymentConfig: PaymentConfig,
      customerId: string,
      origin: string
  ) {
    const returnUrl = origin + '/callback/stripe?status=success&mode=subscription';

    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );

    const portalSession = await stripe.billingPortal.sessions.create( {
      customer: customerId,
      return_url: returnUrl
    } );

    return { url: portalSession.url };
  }

  async createCustomer(
      paymentConfig: PaymentConfig,
      username: string
  ) {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );

    const customerObject = {
      name: username
    };

    return stripe.customers.create( customerObject );
  }

  /**
   * builds payload
   * @param paymentConfig payment config
   * @param external_transaction external transaction
   */
  build = async ( paymentConfig: PaymentConfig, external_transaction: any ) => {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );
    const session = await stripe.checkout.sessions.retrieve(
        external_transaction.session_id
    );
    return { method: PaymentMethodEnum.Stripe, payload: session };
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
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );
    const intent = await stripe.paymentIntents.retrieve(
        external_transaction_id
    );
    const isRegression = process.env.REGRESSION || false;

    console.log( 'Stripe.getTransactionHistory > isRegression: ', isRegression );

    if (
        confirmed_external_transaction_ids.indexOf(
            paymentConfig.payload.method + '_' + external_transaction_id
        ) !== -1 &&
        isRegression
    ) {
      console.log(
          'Stripe.getTransactionHistory > Setting stripe status to success'
      );
      intent.status = this.SUCCESS_STATUS;
    }
    return intent;
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
  ): Promise<string> => {

    if ( updated_transaction_history?.payload?.transaction_history?.status === this.SUCCESS_STATUS ) {

      const receiptRepository = new ReceiptRepository( dbConn );
      let created = await receiptRepository.getReceiptWithExternalTransactionId(
          updated_transaction_history.username,
          external_transaction_id,
          updated_transaction_history.product_id,
          paymentConfig.key
      );

      if ( !created ) {
        let amount = this.calculateAmount(
            updated_transaction_history.payload.transaction_history
                .amount_received
        );
        let currency_code = this.currencyCodeMap(
            updated_transaction_history.payload.transaction_history.currency
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
          status: ReceiptStatus.SUCCESS
        } );

        return success;
      }
    }

    return '';
  };

  async getUsernameByExternalCustomerId( mongodb_provider: MongoDbProvider, payment_config_key: string, externalCustomerId: string ): Promise<string> {
    const customerActivityRepository = await new CustomerActivityRepository().initialize(
        mongodb_provider.getConnection()
    );
    const customerActivity = await customerActivityRepository.getCustomerActivityByExternalStripeCustomerId(
        payment_config_key,
        externalCustomerId
    );

    return customerActivity?.username;
  }

  /**
   * calculates amount
   * @param amount amount
   * @returns calculated amount
   */
  calculateAmount = ( amount: number ) => {
    return amount / 100;
  };

  /**
   * gets mapped currency code
   * @param currency_code currency code
   */
  currencyCodeMap = ( currency_code: string ) => {
    if ( currency_code === 'usd' ) {
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
    return { amount: Math.round( amount * 100 ), currency };
  };

  /**
   * gets created price id and updates product payload
   * @param dbConn db connection
   * @param paymentConfig payment config
   * @param product product
   * @returns price id
   */
  getPriceId = async (
      dbConn: any,
      paymentConfig: PaymentConfig,
      product: Product
  ) => {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );
    const stripeProductId = await this.getProductId( paymentConfig, product );
    if ( !product.payload.stripe.external_price_id ) {
      console.log(
          '> StripePayment:: getPriceId:: Product payload: ',
          product.payload
      );
      let price = await stripe.prices.create( {
        product: stripeProductId,
        unit_amount: product.payload.stripe.amount,
        currency: product.payload.stripe.currency,
      } );
      product.payload.stripe.external_price_id = price.id;
      product.payload.stripe.external_product_id = stripeProductId;
      const productRepository = await new ProductRepository().initialize(
          dbConn
      );
      await productRepository.updateProductPayload(
          product.product_id,
          'payload.stripe',
          product.payload.stripe
      );
      return price.id;
    } else {
      return product.payload.stripe.external_price_id;
    }
  };

  /**
   * gets created product or create if not exists
   * @param paymentConfig payment config
   * @param product product
   */
  getProductId = async ( paymentConfig: PaymentConfig, product: Product ) => {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );
    if ( !product.payload.stripe.external_product_id ) {
      let stripeProduct = await stripe.products.create( {
        name: product.name,
      } );
      return stripeProduct.id;
    } else {
      return product.payload.stripe.external_product_id;
    }
  };

  getSuccessStatus() {
    return this.SUCCESS_STATUS;
  }

  getModeFromProduct( payload: any ): string {
    return payload.stripe.mode;
  }

  constructEvent(
      paymentConfig: PaymentConfig,
      body: any,
      signature: string
  ): any {
    let stripe = new Stripe(
        paymentConfig.payload.secret,
        paymentConfig.payload.config
    );

    let event: any;

    if ( paymentConfig.payload.webhook_secret ) {
      event = stripe.webhooks.constructEvent(
          body,
          signature,
          paymentConfig.payload.webhook_secret
      );
    } else {
      event = body;
    }

    return event;
  }
}
