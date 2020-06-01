/**
 * @description holds webhook routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../models/Constant';
import { refreshTransactionHistory } from '../controllers/PaymentController';

const subRoutes = {
 root: '/',
 coinbase: '/coinbase'
}

const router = Router();

router.post(subRoutes.coinbase, async (req: Request, res: Response) => {

 const external_transaction_id = req.body.event.data.id;

 await refreshTransactionHistory(res.locals.ctx.dbProviders, req.query.key, external_transaction_id);

 res.status(ResponseCode.OK).send();
});

export = router;
