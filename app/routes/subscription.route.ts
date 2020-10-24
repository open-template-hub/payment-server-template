/**
 * @description holds subscription routes
 */

import Router from 'express-promise-router';
import { Request, Response } from 'express';
import { ResponseCode } from '../util/constant';
import { getCurrentUser } from '../services/auth.service';
import { getSubscription, saveSubscription, getUserSubscriptions } from '../controllers/subscription.controller';

const subRoutes = {
 root: '/',
 me: '/me'
}

const router = Router();

router.use('/*', async (req: Request, res: Response, next) => {
 res.locals.ctx.currentUser = await getCurrentUser(req);
 return next();
});

router.post(subRoutes.root, async (req: Request, res: Response) => {
 // Create new subscription session
 let subscriptionSession = await saveSubscription(res.locals.ctx.dbProviders,
  res.locals.ctx.currentUser.username, req.body.paymentConfigKey, req.body.payload);
 res.status(ResponseCode.CREATED).json(subscriptionSession);
});

router.get(subRoutes.root, async (req: Request, res: Response) => {
 // Get subscription with subscription id
 let subscriptionSession = await getSubscription(res.locals.ctx.dbProviders, req.query.subscription_id);
 res.status(ResponseCode.CREATED).json(subscriptionSession);
});

router.get(subRoutes.me, async (req: Request, res: Response) => {
  // Get subscription with username
  let subscriptionSession = await getUserSubscriptions(res.locals.ctx.dbProviders, res.locals.ctx.currentUser.username);
  res.status(ResponseCode.CREATED).json(subscriptionSession);
 });

export = router;
