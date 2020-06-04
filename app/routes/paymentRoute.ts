/**
 * @description holds payment routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { initPayment, initPaymentWithExternalTransactionId } from '../controllers/PaymentController';
import { getCurrentUser } from '../services/authService';

const subRoutes = {
 root: '/',
 verify: '/verify',
 initWithExternalTransactionId: '/init-with-external-transaction-id'
}

const router = Router();

router.use('/*', async (req: Request, res: Response, next) => {
 res.locals.ctx.currentUser = await getCurrentUser(req);
 return next();
});

router.post(subRoutes.root, async (req: Request, res: Response) => {
 // Create new payment session
 let paymentSession = await initPayment(res.locals.ctx.dbProviders,
  res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.productId, req.body.quantity);
 res.status(ResponseCode.CREATED).send(paymentSession);
});

router.post(subRoutes.initWithExternalTransactionId, async (req: Request, res: Response) => {
 // Init payment with external transaction id
 let paymentSession = await initPaymentWithExternalTransactionId(res.locals.ctx.dbProviders,
  res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.product_id, req.body.external_transaction_id);
 res.status(ResponseCode.CREATED).send(paymentSession);
});

export = router;
