/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../util/constant';
import { getSuccesfulReceipts } from '../controllers/receipt.controller';
import { getCurrentUser } from '../services/auth.service';

const subRoutes = {
 root: '/'
}

const router = Router();

router.get(subRoutes.root, async (req: Request, res: Response) => {
 const currentUser: any = await getCurrentUser(req);
 const successful_receipts = await getSuccesfulReceipts(res.locals.ctx.dbProviders, currentUser.username, req.query.product_id);

 res.status(ResponseCode.OK).json({successful_receipts: successful_receipts});
});

export = router;