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
  // Create new payment session
   let paymentSession = await initPayment(res.locals.ctx.dbProviders,
    res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.productId, req.body.quantity);
   res.status(ResponseCode.CREATED).send(paymentSession);
 });

export = router;
