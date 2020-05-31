/**
 * @description holds payment routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { initPayment, verifyPayment, initPaymentWithExternalTransactionId } from '../controllers/PaymentController';

const subRoutes = {
 root: '/',
 verify: '/verify',
 initWithExternalTransactionId: '/init-with-external-transaction-id'
}

const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
 // Create new payment session
 let paymentSession = await initPayment(res.locals.ctx.dbProviders,
  res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.productId, req.body.quantity);
 res.status(ResponseCode.CREATED).send(paymentSession);
});

router.get(subRoutes.verify, async (req: Request, res: Response) => {
  // Verify payment
  let verified = await verifyPayment(res.locals.ctx.dbProviders,
   res.locals.ctx.currentUser.username, req.body.paymentConfigKey, 
   req.body.external_transaction_id, req.body.verification_type);
  res.status(ResponseCode.CREATED).send({verified: verified});
 });

 router.post(subRoutes.initWithExternalTransactionId, async (req: Request, res: Response) => {
  // Init payment with external transaction id
  let paymentSession = await initPaymentWithExternalTransactionId(res.locals.ctx.dbProviders,
   res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.productId, req.body.external_transaction_id);
  res.status(ResponseCode.CREATED).send(paymentSession);
 });

export = router;
