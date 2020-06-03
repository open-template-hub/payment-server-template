import { PaymentMethodEnum, PaymentWrapper } from '../services/payment/paymentWrapper';
import { v4 } from 'uuid';
import { createProductDocument } from '../dao/productDao';

/**
 * @description holds crud operations for the product entity
 */

export const createProduct = async (dbProviders, name, description, amount, currency) => {
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

 return await createProductDocument(dbProviders.mongoDbProvider, await v4(), name, description, payload);
}
