/**
 * @description holds subscription routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { SubscriptionController } from '../controller/subscription.controller';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();

const subscriptionController = new SubscriptionController();

router.post( subRoutes.root, async ( req: Request, res: Response ) => {
  // Create new subscription session
  const context = res.locals.ctx;

  let subscription_id = await subscriptionController.saveSubscription(
      context.mongodb_provider,
      context.username,
      req.body.payment_config_key,
      req.body.payload
  );
  res.status( ResponseCode.CREATED ).json( { subscription_id } );
} );

router.get( subRoutes.root, async ( req: Request, res: Response ) => {
  // Get subscription with subscription id
  const context = res.locals.ctx;

  let subscriptionSession = await subscriptionController.getSubscription(
      context.mongodb_provider,
      req.query.subscription_id as string
  );
  res.status( ResponseCode.OK ).json( subscriptionSession );
} );

router.get( subRoutes.me, async ( req: Request, res: Response ) => {
  // Get subscription with username
  const context = res.locals.ctx;

  let subscriptionSession = await subscriptionController.getUserSubscriptions(
      context.mongodb_provider,
      context.username
  );
  res.status( ResponseCode.OK ).json( subscriptionSession );
} );
