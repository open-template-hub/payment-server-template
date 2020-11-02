/**
 * @description holds payment routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ErrorMessage, ResponseCode } from "../util/constant";
import {
  confirmPayment,
  initPayment,
  initPaymentWithExternalTransactionId,
} from "../controllers/payment.controller";
import { Context } from "../models/context.model";

const subRoutes = {
  root: "/",
  verify: "/verify",
  initWithExternalTransactionId: "/init-with-external-transaction-id",
  confirm: "/confirm",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new payment session
  const context = res.locals.ctx as Context;

  let paymentSession = await initPayment(
    context.mongodb_provider,
    context.username,
    req.body.payment_config_key,
    req.body.product_id,
    req.body.quantity
  );
  res.status(ResponseCode.CREATED).json(paymentSession);
});

router.post(subRoutes.confirm, async (req: Request, res: Response) => {
  // Create new payment session
  const context = res.locals.ctx as Context;
  if (context.isAdmin) {
    let paymentSession = await confirmPayment(
      context.mongodb_provider,
      req.body.payment_config_key,
      req.body.external_transaction_id
    );

    res.status(ResponseCode.OK).json(paymentSession);
  } else {
    throw new Error(ErrorMessage.FORBIDDEN);
  }
});

router.post(
  subRoutes.initWithExternalTransactionId,
  async (req: Request, res: Response) => {
    // Init payment with external transaction id
    const context = res.locals.ctx as Context;

    let paymentSession = await initPaymentWithExternalTransactionId(
      context.mongodb_provider,
      context.username,
      req.body.payment_config_key,
      req.body.product_id,
      req.body.external_transaction_id
    );
    res.status(ResponseCode.CREATED).json(paymentSession);
  }
);
