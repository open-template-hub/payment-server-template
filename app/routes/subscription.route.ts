/**
 * @description holds subscription routes
 */

import Router from "express-promise-router";
import { Request, Response } from "express";
import { ResponseCode } from "../util/constant";
import {
  getSubscription,
  saveSubscription,
  getUserSubscriptions,
} from "../controllers/subscription.controller";
import { Context } from "../models/context.model";

const subRoutes = {
  root: "/",
  me: "/me",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new subscription session
  const context = res.locals.ctx as Context;

  let subscriptionSession = await saveSubscription(
    context.mongoDbProvider,
    context.username,
    req.body.paymentConfigKey,
    req.body.payload
  );
  res.status(ResponseCode.CREATED).json(subscriptionSession);
});

router.get(subRoutes.root, async (req: Request, res: Response) => {
  // Get subscription with subscription id
  const context = res.locals.ctx as Context;

  let subscriptionSession = await getSubscription(
    context.mongoDbProvider,
    req.query.subscription_id as string
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});

router.get(subRoutes.me, async (req: Request, res: Response) => {
  // Get subscription with username
  const context = res.locals.ctx as Context;
  
  let subscriptionSession = await getUserSubscriptions(
    context.mongoDbProvider,
    context.username
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});
