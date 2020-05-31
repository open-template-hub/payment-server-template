/**
 * @description holds payment routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { initPayment, verifyPayment } from '../controllers/PaymentController';

const subRoutes = {
 root: '/',
 verify: '/verify'
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

export = router;
