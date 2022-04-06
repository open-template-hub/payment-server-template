/**
 * @description holds product routes
 */

import {
  authorizedBy,
  ResponseCode,
  UserRole,
} from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { ReceiptController } from '../controller/receipt.controller';

const subRoutes = {
  root: '/',
};

export const router = Router();

const receiptController = new ReceiptController();

router.get(
  subRoutes.root,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async (req: Request, res: Response) => {
    // gets successful receipts
    const context = res.locals.ctx;

    const successful_receipts = await receiptController.getSuccessfulReceipts(
      context.postgresql_provider,
      context.username,
      req.query.product_id as string
    );

    res
      .status(ResponseCode.OK)
      .json({ successful_receipts: successful_receipts });
  }
);
