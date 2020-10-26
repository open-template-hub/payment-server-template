/**
 * @description holds payment routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ResponseCode } from "../util/constant";
import {
  initPayment,
  initPaymentWithExternalTransactionId,
} from "../controllers/payment.controller";
import { Context } from "../models/context.model";

const subRoutes = {
  root: "/",
  verify: "/verify",
  initWithExternalTransactionId: "/init-with-external-transaction-id",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new payment session
  const context = res.locals.ctx as Context;

  let paymentSession = await initPayment(
    context.mongoDbProvider,
    context.username,
    req.body.paymentConfigKey,
    req.body.productId,
    req.body.quantity
  );
  res.status(ResponseCode.CREATED).json(paymentSession);
});

router.post(
  subRoutes.initWithExternalTransactionId,
  async (req: Request, res: Response) => {
    // Init payment with external transaction id
    const context = res.locals.ctx as Context;

    let paymentSession = await initPaymentWithExternalTransactionId(
      context.mongoDbProvider,
      context.username,
      req.body.paymentConfigKey,
      req.body.product_id,
      req.body.external_transaction_id
    );
    res.status(ResponseCode.CREATED).json(paymentSession);
  }
);
