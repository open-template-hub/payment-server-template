/**
 * @description holds product controller
 */

import { MongoDbProvider, PostgreSqlProvider } from '@open-template-hub/common';
import { ReceiptStatus } from '../constant';
import { ProductRepository } from '../repository/product.repository';
import { PaymentMethodEnum, PaymentWrapper } from '../wrapper/payment.wrapper';
import { ReceiptController } from './receipt.controller';

export class ProductController {
  /**
   * creates a product
   * @param mongodb_provider mongodb provider
   * @param product_id product id
   * @param name product name
   * @param description product description
   * @param amount product amount
   * @param currency product currency
   * @returns created product
   */
  createProduct = async (
      mongodb_provider: MongoDbProvider,
      product_id: string,
      name: string,
      description: string,
      amount: number,
      currency: string
  ) => {
    const stripePaymentWrapper = new PaymentWrapper( PaymentMethodEnum.Stripe );
    const coinbasePaymentWrapper = new PaymentWrapper(
        PaymentMethodEnum.Coinbase
    );
    const googlePaymentWrapper = new PaymentWrapper( PaymentMethodEnum.Google );
    const paypalPaymentWrapper = new PaymentWrapper( PaymentMethodEnum.PayPal );

    const payload = {
      stripe: await stripePaymentWrapper.createProduct( amount, currency ),
      coinbase: await coinbasePaymentWrapper.createProduct( amount, currency ),
      google: await googlePaymentWrapper.createProduct( amount, currency ),
      paypal: await paypalPaymentWrapper.createProduct( amount, currency ),
    };

    try {
      const productRepository = await new ProductRepository().initialize(
          mongodb_provider.getConnection()
      );

      return await productRepository.createProductDocument(
          product_id,
          name,
          description,
          payload
      );
    } catch ( error ) {
      console.error( '> createProductDocument error: ', error );
      throw error;
    }
  };

  /**
   * deletes a product
   * @param mongodb_provider mongodb provider
   * @param product_id product id
   * @returns deleted product
   */
  deleteProduct = async (
      mongodb_provider: MongoDbProvider,
      product_id: string
  ) => {
    try {
      const productRepository = await new ProductRepository().initialize(
          mongodb_provider.getConnection()
      );

      return await productRepository.deleteProductDocument( product_id );
    } catch ( error ) {
      console.error( '> createProductDocument error: ', error );
      throw error;
    }
  };

  getProduct = async (
      postgresql_provider: PostgreSqlProvider,
      username: string
  ) => {
    try {
      const receiptDatas = await ReceiptController.getSuccessfulReceipts( postgresql_provider, username );

      let subscriptionDatas: any[] = [];
      let premiumDatas: any[] = [];

      receiptDatas.forEach( ( subscriptionObject: any ) => {
        if ( subscriptionObject.status !== ReceiptStatus.SUCCESS ) {
          return;
        }

        if ( subscriptionObject.priority_order !== null && subscriptionObject.expire_date !== null ) {
          const expireDate = new Date( subscriptionObject.expire_date * 1000 );
          if ( expireDate > new Date() ) {
            subscriptionDatas.push( subscriptionObject );
          }
        } else {
          premiumDatas.push( subscriptionObject );
        }
      } );

      if ( subscriptionDatas.length > 0 ) {
        let currentSubscriptionObject = subscriptionDatas[ 0 ];

        subscriptionDatas.forEach( ( subscriptionObject: any ) => {
          if ( subscriptionObject.priority_order > currentSubscriptionObject.priority_order ) {
            currentSubscriptionObject = subscriptionObject;
          }
        } );

        premiumDatas.push( currentSubscriptionObject );
      }

      return premiumDatas;
    } catch ( error ) {
      console.error( '> getProductDocument error: ', error );
      throw error;
    }
  };

  getAllProducts = async (
      mongodb_provider: MongoDbProvider,
      name?: string,
      offset?: number,
      limit?: number
  ) => {

    if ( !offset ) {
      offset = 0;
    }

    if ( !limit ) {
      limit = 20;
    }

    try {
      const productRepository = await new ProductRepository().initialize(
          mongodb_provider.getConnection()
      );

      let productsResponse = await productRepository.getAllProducts( name ?? '', offset, limit );

      productsResponse.meta = productsResponse.meta[ 0 ];

      productsResponse.meta.offset = offset;
      productsResponse.meta.limit = limit;

      return productsResponse;
    } catch ( error ) {
      console.error( '> getAllProducts error: ', error );
      throw error;
    }
  };

  async updateProduct(
      mongodb_provider: MongoDbProvider,
      productId: string,
      name: string,
      description: string
  ) {
    const productRepository = await new ProductRepository().initialize(
        mongodb_provider.getConnection()
    );

    await productRepository.updateProduct( productId, name, description );
  }
}
