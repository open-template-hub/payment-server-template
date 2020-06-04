/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { getAdmin } from '../currentUser';
import { ResponseCode } from '../models/Constant';
import { getSuccesfulReceipts } from '../controllers/ReceiptController';

const subRoutes = {
 root: '/'
}

const router = Router();

router.use('/*', async (req: Request, res: Response, next) => {
 res.locals.ctx.currentUser = await getAdmin(req);
 return next();
});

// this endpoint should be consumed by ADMIN user by Orchestrator
router.get(subRoutes.root, async (req: Request, res: Response) => {
 const successful_receipts = await getSuccesfulReceipts(res.locals.ctx.dbProviders, req.body.username, req.body.product_id);

 res.status(ResponseCode.OK).send({successful_receipts: successful_receipts});
});

export = router;
