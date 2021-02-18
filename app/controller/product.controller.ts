/**
 * @description holds product controller
 */

import { MongoDbProvider } from '@open-template-hub/common';
import { ProductRepository } from '../repository/product.repository';
import { PaymentMethodEnum, PaymentWrapper } from '../wrapper/payment.wrapper';

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
}
