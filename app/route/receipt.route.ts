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
  all: '/all',
};

export const router = Router();

router.get(
  subRoutes.root,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async (req: Request, res: Response) => {
    // gets successful receipts
    const context = res.locals.ctx;

    const successful_receipts = await ReceiptController.getSuccessfulReceipts(
      context.postgresql_provider,
      context.username
    );

    res
      .status(ResponseCode.OK)
      .json({ successful_receipts: successful_receipts });
  }
);

router.get(
  subRoutes.all,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async(req: Request, res: Response) => {
    const context = res.locals.ctx;

    const receiptsResponse = await ReceiptController.getReceipts(
      context.postgresql_provider,
      context.username,
      req.query.payment_config_key as string,
      +(req.query.offset as string),
      +(req.query.limit as string),
      (req.query.type as string) === "subscription"
    )

    res.status(ResponseCode.OK)
    .json(receiptsResponse)
  }
)

