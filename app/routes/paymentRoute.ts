/**
 * @description holds payment routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { initPayment } from '../controllers/PaymentController';

const subRoutes = {
 root: '/'
}

const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new Payment
   let payment = await initPayment(res.locals.ctx.dbProviders, res.locals.ctx.currentUser.username, req.body.paymentKey, req.body.productId);
   res.status(ResponseCode.CREATED).send(payment);
 });

export = router;
