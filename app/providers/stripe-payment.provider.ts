import { PaymentMethod } from "../models/payment-method.model";
import Stripe from "stripe";
import { ProductRepository } from "../repository/product.repository";
import { PaymentMethodEnum } from "../wrappers/payment.wrapper";
import {
  createReceipt,
  getReceiptWithExternalTransactionId,
} from "../repository/receipt.repository";
import { CurrencyCode, ReceiptStatus } from "../util/constant";
import { confirmed_external_transaction_ids } from "../store";

export class StripePayment implements PaymentMethod {
  private readonly SUCCESS_STATUS = "succeeded";

  init = async (dbConn, paymentConfig, product, quantity) => {
    let stripe = new Stripe(
      paymentConfig.payload.secret,
      paymentConfig.payload.config
    );
    const priceId = await this.getPriceId(dbConn, paymentConfig, product);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentConfig.payload.payment_method_types,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: paymentConfig.payload.mode,
      success_url: paymentConfig.payload.success_url,
      cancel_url: paymentConfig.payload.cancel_url,
    });

    const history = await this.getTransactionHistory(
      paymentConfig,
      session.payment_intent
    );
    return {
      history: history,
      id: session.payment_intent,
      session_id: session.id,
    };
  };

  build = async (paymentConfig, external_transaction) => {
    let stripe = new Stripe(
      paymentConfig.payload.secret,
      paymentConfig.payload.config
    );
    const session = await stripe.checkout.sessions.retrieve(
      external_transaction.session_id
    );
    return { method: PaymentMethodEnum.Stripe, payload: session };
  };

  getTransactionHistory = async (paymentConfig, external_transaction_id) => {
    let stripe = new Stripe(
      paymentConfig.payload.secret,
      paymentConfig.payload.config
    );
    const intent = await stripe.paymentIntents.retrieve(
      external_transaction_id
    );
    const isRegression = process.env.REGRESSION || false;

    console.log("Stripe.getTransactionHistory > isRegression: ", isRegression);

    if (
      confirmed_external_transaction_ids.indexOf(
        paymentConfig.payload.method + "_" + external_transaction_id
      ) !== -1 &&
      isRegression
    ) {
      console.log(
        "Stripe.getTransactionHistory > Setting stripe status to success"
      );
      intent.status = this.SUCCESS_STATUS;
    }
    return intent;
  };

  // only for admin usage, test purpose
  confirmPayment = async (paymentConfig, external_transaction_id) => {
    confirmed_external_transaction_ids.push(
      paymentConfig.payload.method + "_" + external_transaction_id
    );
  };

  receiptStatusUpdate = async (
    dbConn: any,
    paymentConfig: any,
    external_transaction_id: any,
    updated_transaction_history: any
  ) => {
    if (
      updated_transaction_history &&
      updated_transaction_history.payload.transaction_history &&
      updated_transaction_history.payload.transaction_history.status ===
        this.SUCCESS_STATUS
    ) {
      let created = await getReceiptWithExternalTransactionId(
        dbConn,
        updated_transaction_history.username,
        external_transaction_id,
        updated_transaction_history.product_id,
        paymentConfig.key
      );

      if (!created) {
        let amount = this.calculateAmount(
          updated_transaction_history.payload.transaction_history
            .amount_received
        );
        let currency_code = await this.currencyCodeMap(
          updated_transaction_history.payload.transaction_history.currency
        );

        await createReceipt(
          dbConn,
          updated_transaction_history.username,
          external_transaction_id,
          updated_transaction_history.product_id,
          paymentConfig.key,
          new Date(),
          amount,
          currency_code,
          ReceiptStatus.SUCCESS
        );
      }
    }
  };

  calculateAmount = (amount) => {
    return amount / 100;
  };

  currencyCodeMap = (currency_code) => {
    if (currency_code === "usd") {
      return CurrencyCode.USD;
    }
    return currency_code;
  };

  createProduct(amount: number, currency) {
    return { amount: Math.round(amount * 100), currency };
  }

  getPriceId = async (dbConn, paymentConfig, product) => {
    let stripe = new Stripe(
      paymentConfig.payload.secret,
      paymentConfig.payload.config
    );
    const stripeProductId = await this.getProductId(paymentConfig, product);
    if (!product.payload.stripe.external_price_id) {
      let price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: product.payload.stripe.amount,
        currency: product.payload.stripe.currency,
      });
      product.payload.stripe.external_price_id = price.id;
      product.payload.stripe.external_product_id = stripeProductId;
      const productRepository = await new ProductRepository().initialize(
        dbConn
      );
      await productRepository.updateProductPayload(
        product.productId,
        "payload.stripe",
        product.payload.stripe
      );
      return price.id;
    } else {
      return product.payload.stripe.external_price_id;
    }
  };

  getProductId = async (paymentConfig, product) => {
    let stripe = new Stripe(
      paymentConfig.payload.secret,
      paymentConfig.payload.config
    );
    if (!product.payload.stripe.external_product_id) {
      let stripeProduct = await stripe.products.create({
        name: product.name,
      });
      return stripeProduct.id;
    } else {
      return product.payload.stripe.external_product_id;
    }
  };
}
