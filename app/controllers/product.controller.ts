import { PaymentMethodEnum, PaymentWrapper } from '../wrappers/payment.wrapper';
import { createProductDocument } from '../repository/product.repository';

/**
 * @description holds crud operations for the product entity
 */

export const createProduct = async (dbProviders, product_id, name, description, amount, currency) => {
 const stripePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Stripe);
 const coinbasePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Coinbase);
 const googlePaymentWrapper = new PaymentWrapper(PaymentMethodEnum.Google);
 const paypalPaymentWrapper = new PaymentWrapper(PaymentMethodEnum.PayPal);

 const payload = {
  stripe: stripePaymentWrapper.createProduct(amount, currency),
  coinbase: coinbasePaymentWrapper.createProduct(amount, currency),
  google: googlePaymentWrapper.createProduct(amount, currency),
  paypal: paypalPaymentWrapper.createProduct(amount, currency)
 };

 return await createProductDocument(dbProviders.mongoDbProvider, product_id, name, description, payload);
}
