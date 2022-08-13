/**
 * @description holds product controller
 */

import { MongoDbProvider, PostgreSqlProvider, ResponseCode } from '@open-template-hub/common';
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
    mongodb_provider: MongoDbProvider,
    postgresql_provider: PostgreSqlProvider,
    product_id: string,
    username: string
  ) => {
    try {
      const receiptData = await ReceiptController.getSuccessfulReceipts(postgresql_provider, username, product_id);
      
      let hasAccess = false;

      if(receiptData?.length > 0) {
        receiptData.forEach((receipt: any) => {
          if(receipt.status === 'SUCCESS') {
            if(receipt.expire_date) {
              const expireDate = new Date(receipt.expire_date * 1000)
              if(expireDate < new Date()) {
                hasAccess = false
              } else {
                hasAccess = true
              }
            } else {
              hasAccess = true;
            }            
          }
        });
      }

      if(hasAccess) {
        const productRepository = await new ProductRepository().initialize(
          mongodb_provider.getConnection()
        );
        const productData = await productRepository.getProductByProductId(product_id);

        return {
          status: ResponseCode.OK,
          data: {
            product_id: productData.product_id,
            name: productData.name,
            description: productData.description,
            payload: productData.payload,
          },
        }
      }
      
      return {
        status: ResponseCode.OK,
        data: {
          product_id: product_id
        }
      }

    } catch(error) {
      console.error( '> getProductDocument error: ', error );
      throw error;
    }
  }

  getAllProducts = async (
    mongodb_provider: MongoDbProvider,
    name?: string,
    offset?: number,
    limit?: number
  ) => {

    if(!offset) {
      offset = 0;
    }

    if(!limit) {
      limit = 20;
    }

    try {
      const productRepository = await new ProductRepository().initialize(
        mongodb_provider.getConnection()
      );

      let productsResponse = await productRepository.getAllProducts( name ?? '', offset, limit );

      productsResponse.meta = productsResponse.meta[0];

      productsResponse.meta.offset = offset
      productsResponse.meta.limit = limit;

      return productsResponse
    } catch(error) {
      console.error( '> getAllProducts error: ', error );
      throw error;
    }
  }

  async updateProduct(
    mongodb_provider: MongoDbProvider,
    productId: string,
    name: string,
    description: string
  ) {
    const productRepository = await new ProductRepository().initialize(
      mongodb_provider.getConnection()
    ); 

    await productRepository.updateProduct(productId, name, description);
  }
}
