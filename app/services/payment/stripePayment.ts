import { PaymentMethod } from '../../models/paymentMethod';
import Stripe from 'stripe';
import productModel from '../../models/productModel';
import { PaymentMethodEnum } from './paymentWrapper';

export class StripePayment implements PaymentMethod {

 getPriceId = async (dbConn, paymentConfig, product) => {
  let stripe = new Stripe(paymentConfig.payload.secret, paymentConfig.payload.config);
  const stripeProductId = await this.getProductId(paymentConfig, product);
  if (!product.payload.stripe.external_price_id) {
   let price = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: product.payload.stripe.amount,
    currency: product.payload.stripe.currency,
   });
   product.payload.stripe.external_price_id = price.id;
   product.payload.stripe.external_product_id = stripeProductId;
   await productModel(dbConn).findOneAndUpdate({productId: product.productId},
    {
     'payload.stripe': product.payload.stripe
    }, {new: true});
   return price.id;
  } else {
   return product.payload.stripe.external_price_id;
  }
 }

 getProductId = async (paymentConfig, product) => {
  let stripe = new Stripe(paymentConfig.payload.secret, paymentConfig.payload.config);
  if (!product.payload.stripe.external_product_id) {
   let stripeProduct = await stripe.products.create({
    name: product.productId
   });
   return stripeProduct.id;
  } else {
   return product.payload.stripe.external_product_id;
  }
 }

 init = async (dbConn, paymentConfig, product, quantity) => {
  let stripe = new Stripe(paymentConfig.payload.secret, paymentConfig.payload.config);
  const priceId = await this.getPriceId(dbConn, paymentConfig, product);
  const session = await stripe.checkout.sessions.create({
   payment_method_types: paymentConfig.payload.payment_method_types,
   line_items: [{
    price: priceId,
    quantity: quantity,
   }],
   mode: paymentConfig.payload.mode,
   success_url: paymentConfig.payload.success_url,
   cancel_url: paymentConfig.payload.cancel_url,
  });

  const history = await this.getTransactionHistory(paymentConfig, session.payment_intent);
  return {history: history, id: session.payment_intent, session_id: session.id};
 }

 build = async (paymentConfig, external_transaction) => {
  let stripe = new Stripe(paymentConfig.payload.secret, paymentConfig.payload.config);
  const session = await stripe.checkout.sessions.retrieve(external_transaction.session_id);
  return {method: PaymentMethodEnum.Stripe, payload: session};
 }

 getTransactionHistory = async (paymentConfig, external_transaction_id) => {
  let stripe = new Stripe(paymentConfig.payload.secret, paymentConfig.payload.config);
  const intent = await stripe.paymentIntents.retrieve(external_transaction_id);
  return intent;
 }

 receiptStatusUpdate(dbConn: any, paymentConfig: any, external_transaction_id: any, updated_transaction_history: any) {
  return null;
 }

}