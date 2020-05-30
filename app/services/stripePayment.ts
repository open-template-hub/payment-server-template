import { PaymentMethod } from "../models/paymentMethod";
import Stripe from 'stripe';
import productModel from "../models/productModel";

export class StripePayment implements PaymentMethod {

  getPriceId = async(dbConn, payment, product) => {
    let stripe = new Stripe(payment.payload.secret, payment.payload.config);
    const stripeProductId = await this.getProductId(payment, product);
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
         payload: product.payload.stripe
        }, {new: true});
      return price.id;
    } else {
      return product.payload.stripe.external_price_id;
    }
  }

  getProductId = async(payment, product) => {
    let stripe = new Stripe(payment.payload.secret, payment.payload.config);
    if(!product.payload.stripe.external_product_id) {
      let stripeProduct = await stripe.products.create({
        name: product.productId
      });
      return stripeProduct.id;
    } else {
      return product.payload.stripe.external_product_id;
    }
  }
  
  init = async(dbConn, payment, product, quantity) => {
    let stripe = new Stripe(payment.payload.secret, payment.payload.config);
    const priceId = await this.getPriceId(dbConn, payment, product);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: payment.payload.payment_method_types,
      line_items: [{
        price: priceId,
        quantity: quantity,
      }],
      mode: payment.payload.mode,
      success_url: payment.payload.success_url,
      cancel_url: payment.payload.cancel_url,
    });
    return session.id;
  }

  build = async(payment, external_transaction_id) => {
    let stripe = new Stripe(payment.payload.secret, payment.payload.config);
    const session = await stripe.checkout.sessions.retrieve(external_transaction_id);
    return session;
  }

}