/**
 * @description holds webhook routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { PaymentController } from '../controller/payment.controller';

const subRoutes = {
  root: '/',
  coinbase: '/coinbase',
  stripe: '/stripe',
  paypal: '/paypal',
};

export const router = Router();

router.post( subRoutes.coinbase, async ( req: Request, res: Response ) => {
  // refreshes coinbase transaction history
  const external_transaction_id = req.body.event.data.id;
  const context = res.locals.ctx;

  const paymentController = new PaymentController();

  await paymentController.refreshTransactionHistory(
      context.mongodb_provider,
      context.postgresql_provider,
      context.message_queue_provider,
      req.query.key as string,
      external_transaction_id
  );

  res.status( ResponseCode.OK ).send();
} );

router.post( subRoutes.stripe, async ( req: Request, res: Response ) => {
  // refreshes Stripe transaction history
  const paymentController = new PaymentController();
  const context = res.locals.ctx;

  let constructedEvent = (await paymentController.constructEvent(
    context.mongodb_provider,
    req.query.key as string,
    req.body,
    req.headers['stripe-signature']
  ))

  let event = constructedEvent.data.object

  if ( event?.object === 'payment_intent' ) {
    const external_transaction_id = event.data.object.id;

    await paymentController.refreshTransactionHistory(
        context.mongodb_provider,
        context.postgresql_provider,
        context.message_queue_provider,
        req.query.key as string,
        external_transaction_id
    );
  }

  if(event?.object === "subscription") {
    await paymentController.updateCustomerActivity(context.mongodb_provider, req.query.key as string, event)
  }

  if(event?.object === "invoice") {
    await paymentController.createInvoiceForSubscription(context.mongodb_provider, context.postgresql_provider, req.query.key as string, event)
  }

  if(event?.object === "charge" && event.refunded === true) {

    if(event.refunds?.data?.length > 0 && event.refunds.data[0].status === "succeeded") {
      const customerId = event.customer;
      const createdTime = event.refunds.data[0].created;

      await paymentController.processRefund(context.postgresql_provider, req.query.key as string, customerId, createdTime)
    }
  }

  res.status( ResponseCode.OK ).send();
} );

router.post( subRoutes.paypal, async ( req: Request, res: Response ) => {
  // refreshes PayPal transaction history
  if ( req.body.resource_type === 'checkout-order' ) {
    const external_transaction_id = req.body.resource.id;
    const context = res.locals.ctx;

    const paymentController = new PaymentController();

    await paymentController.refreshTransactionHistory(
        context.mongodb_provider,
        context.postgresql_provider,
        context.message_queue_provider,
        req.query.key as string,
        external_transaction_id
    );
  }

  res.status( ResponseCode.OK ).send();
} );
