import { PaymentMethod } from "../models/paymentMethod";
import Stripe from 'stripe';

export class StripePayment implements PaymentMethod {
  
  init = async(payload) => {
    let stripe = new Stripe(payload.secret, payload.config);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: payload.payment_method_types,
      mode: payload.mode,
      customer: payload.customer,
      success_url: payload.success_url,
      cancel_url: payload.cancel_url,
    });
    return session.id;
  }

  build = async(payload, external_transaction_id) => {
    let stripe = new Stripe(payload.secret, payload.config);
    const session = await stripe.checkout.sessions.retrieve(external_transaction_id);
    return session;
  }

}