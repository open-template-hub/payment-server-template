/**
 * @description holds payment routes
 */

import { authorizedBy, ResponseCode, UserRole, } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { PaymentController } from '../controller/payment.controller';

const subRoutes = {
  root: '/',
  verify: '/verify',
  initWithExternalTransactionId: '/init-with-external-transaction-id',
  confirm: '/confirm',
  portal: '/portal'
};

export const router = Router();

router.post(
    subRoutes.root,
    authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ),
    async ( req: Request, res: Response ) => {
      // Create new payment session
      const context = res.locals.ctx;

      const paymentController = new PaymentController();

      let paymentSession = await paymentController.initPayment(
          context.mongodb_provider,
          context.username,
          req.body.payment_config_key,
          req.body.product_id,
          req.body.quantity,
          req.query.origin as string
      );
      res.status( ResponseCode.CREATED ).json( paymentSession );
    }
);

router.post(
    subRoutes.verify,
    authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ),
    async ( req: Request, res: Response ) => {
      const context = res.locals.ctx;

      const paymentController = new PaymentController();

      await paymentController.verifyPayment(
          context.mongodb_provider,
          context.postgresql_provider,
          context.message_queue_provider,
          context.username,
          req.body.payment_config_key,
          req.body.transaction_history_id
      );

      res.status( ResponseCode.OK ).send();
    }
);

router.post(
    subRoutes.confirm,
    authorizedBy( [ UserRole.ADMIN ] ),
    async ( req: Request, res: Response ) => {
      // Create new payment session
      const context = res.locals.ctx;

      const paymentController = new PaymentController();

      let external_transaction_id = await paymentController.confirmPayment(
          context.mongodb_provider,
          req.body.payment_config_key,
          req.body.external_transaction_id
      );

      res.status( ResponseCode.OK ).json( { external_transaction_id } );
    }
);

router.post(
    subRoutes.initWithExternalTransactionId,
    authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ),
    async ( req: Request, res: Response ) => {
      // Init payment with external transaction id
      const context = res.locals.ctx;

      const paymentController = new PaymentController();

      let paymentSession =
          await paymentController.initPaymentWithExternalTransactionId(
              context.mongodb_provider,
              context.username,
              req.body.payment_config_key,
              req.body.product_id,
              req.body.external_transaction_id
          );
      res.status( ResponseCode.CREATED ).json( paymentSession );
    }
);

router.post(
    subRoutes.portal,
    authorizedBy( [ UserRole.ADMIN, UserRole.DEFAULT ] ),
    async ( req: Request, res: Response ) => {
      const context = res.locals.ctx;

      const paymentController = new PaymentController();

      let portalSession = await paymentController.createPortalSession(
          context.mongodb_provider,
          context.username,
          req.body.payment_config_key,
          req.body.product_id,
          req.query.origin as string
      );

      res.status( ResponseCode.CREATED ).json( portalSession );
    }
);
