import { PaymentMethodEnum, PaymentWrapper } from '../wrapper/payment.wrapper';
import { ProductRepository } from '../repository/product.repository';
import { MongoDbProvider } from '../provider/mongo.provider';

/**
 * @description holds crud operations for the product entity
 */

export const createProduct = async (
  mongodb_provider: MongoDbProvider,
  product_id: string,
  name: string,
  description: string,
  amount: number,
  currency: string
) => {
  const stripePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Stripe);
  const coinbasePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Coinbase);
  const googlePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Google);
  const paypalPaymentWrapper = new PaymentWrapper(PaymentMethodEnum.PayPal);

  const payload = {
    stripe: stripePaymentWrapper.createProduct(amount, currency),
    coinbase: coinbasePaymentWrapper.createProduct(amount, currency),
    google: googlePaymentWrapper.createProduct(amount, currency),
    paypal: paypalPaymentWrapper.createProduct(amount, currency),
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
  } catch (error) {
    console.error('> createProductDocument error: ', error);
    throw error;
  }
};

export const deleteProduct = async (
  mongodb_provider: MongoDbProvider,
  product_id: string
) => {
  try {
    const productRepository = await new ProductRepository().initialize(
      mongodb_provider.getConnection()
    );

    return await productRepository.deleteProductDocument(product_id);
  } catch (error) {
    console.error('> createProductDocument error: ', error);
    throw error;
  }
};
