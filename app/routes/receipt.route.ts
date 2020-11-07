/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import { getSuccesfulReceipts } from '../controllers/receipt.controller';
import { Context } from '../models/context.model';

const subRoutes = {
  root: '/',
};

export const router = Router();

router.get(subRoutes.root, async (req: Request, res: Response) => {
  const context = res.locals.ctx as Context;

  const successful_receipts = await getSuccesfulReceipts(
    context.postgresql_provider,
    context.username,
    req.query.product_id as string
  );

  res
    .status(ResponseCode.OK)
    .json({ successful_receipts: successful_receipts });
});
