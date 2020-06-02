/**
 * @description holds webhook routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { refreshTransactionHistory } from '../controllers/PaymentController';

const subRoutes = {
 root: '/',
 coinbase: '/coinbase',
 stripe: '/stripe',
 paypal: '/paypal'
}

const router = Router();

router.post(subRoutes.coinbase, async (req: Request, res: Response) => {

 const external_transaction_id = req.body.event.data.id;

 await refreshTransactionHistory(res.locals.ctx.dbProviders, req.query.key, external_transaction_id);

 res.status(ResponseCode.OK).send();
});

router.post(subRoutes.stripe, async (req: Request, res: Response) => {

 if (req && req.body && req.body.data && req.body.data.object && req.body.data.object.object === 'payment_intent') {
  const external_transaction_id = req.body.data.object.id;
  await refreshTransactionHistory(res.locals.ctx.dbProviders, req.query.key, external_transaction_id);
 }

 res.status(ResponseCode.OK).send();
});

router.post(subRoutes.paypal, async (req: Request, res: Response) => {

 console.log(req.body);

 if (req.body.resource?.id) {
  const external_transaction_id = req.body.resource.id;
  await refreshTransactionHistory(res.locals.ctx.dbProviders, req.query.key, external_transaction_id);
 }

 res.status(ResponseCode.OK).send();
});

export = router;
