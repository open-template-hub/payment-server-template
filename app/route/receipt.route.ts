/**
 * @description holds product routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ReceiptController } from '../controller/receipt.controller';
import { Context, ResponseCode } from '@open-template-hub/common';

const subRoutes = {
  root: '/',
};

export const router = Router();

const receiptController = new ReceiptController();

router.get(subRoutes.root, async (req: Request, res: Response) => {
  // gets successful receipts
  const context = res.locals.ctx as Context;

  const successful_receipts = await receiptController.getSuccesfulReceipts(
    context.postgresql_provider,
    context.username,
    req.query.product_id as string
  );

  res
    .status(ResponseCode.OK)
    .json({ successful_receipts: successful_receipts });
});
