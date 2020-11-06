/**
 * @description holds subscription routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../constant';
import {
  getSubscription,
  saveSubscription,
  getUserSubscriptions,
} from '../controllers/subscription.controller';
import { Context } from '../models/context.model';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();

router.post(subRoutes.root, async (req: Request, res: Response) => {
  // Create new subscription session
  const context = res.locals.ctx as Context;

  let subscription_id = await saveSubscription(
    context.mongodb_provider,
    context.username,
    req.body.payment_config_key,
    req.body.payload
  );
  res.status(ResponseCode.CREATED).json({ subscription_id });
});

router.get(subRoutes.root, async (req: Request, res: Response) => {
  // Get subscription with subscription id
  const context = res.locals.ctx as Context;

  let subscriptionSession = await getSubscription(
    context.mongodb_provider,
    req.query.subscription_id as string
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});

router.get(subRoutes.me, async (req: Request, res: Response) => {
  // Get subscription with username
  const context = res.locals.ctx as Context;
  
  let subscriptionSession = await getUserSubscriptions(
    context.mongodb_provider,
    context.username
  );
  res.status(ResponseCode.OK).json(subscriptionSession);
});
