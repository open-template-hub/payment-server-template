/**
 * @description holds webhook routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import { refreshTransactionHistory } from '../controllers/payment.controller';
import { Context } from '../models/context.model';

const subRoutes = {
  root: '/',
  coinbase: '/coinbase',
  stripe: '/stripe',
  paypal: '/paypal',
};

export const publicRoutes = [
  subRoutes.coinbase,
  subRoutes.stripe,
  subRoutes.paypal,
];

export const router = Router();

router.post(subRoutes.coinbase, async (req: Request, res: Response) => {
  const external_transaction_id = req.body.event.data.id;
  const context = res.locals.ctx as Context;

  await refreshTransactionHistory(
    context.mongodb_provider,
    context.postgresql_provider,
    req.query.key as string,
    external_transaction_id
  );

  res.status(ResponseCode.OK).send();
});

router.post(subRoutes.stripe, async (req: Request, res: Response) => {
  if (
    req &&
    req.body &&
    req.body.data &&
    req.body.data.object &&
    req.body.data.object.object === 'payment_intent'
  ) {
    const external_transaction_id = req.body.data.object.id;
    const context = res.locals.ctx as Context;

    await refreshTransactionHistory(
      context.mongodb_provider,
      context.postgresql_provider,
      req.query.key as string,
      external_transaction_id
    );
  }

  res.status(ResponseCode.OK).send();
});

router.post(subRoutes.paypal, async (req: Request, res: Response) => {
  if (req.body.resource_type === 'checkout-order') {
    const external_transaction_id = req.body.resource.id;
    const context = res.locals.ctx as Context;

    await refreshTransactionHistory(
      context.mongodb_provider,
      context.postgresql_provider,
      req.query.key as string,
      external_transaction_id
    );
  }

  res.status(ResponseCode.OK).send();
});
