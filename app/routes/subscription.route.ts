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

const subRoutes = {
  root: "/",
  me: "/me",
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new subscription session
  let subscriptionSession = await saveSubscription(
    res.locals.ctx.dbProviders,
    res.locals.ctx.currentUser.username,
    req.body.paymentConfigKey,
    req.body.payload
  );
  res.status(ResponseCode.CREATED).json(subscriptionSession);
});

router.get(subRoutes.root, async (req: Request, res: Response) => {
  // Get subscription with subscription id
  let subscriptionSession = await getSubscription(
    res.locals.ctx.dbProviders,
    req.query.subscription_id
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});

router.get(subRoutes.me, async (req: Request, res: Response) => {
  // Get subscription with username
  let subscriptionSession = await getUserSubscriptions(
    res.locals.ctx.dbProviders,
    res.locals.ctx.currentUser.username
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});
