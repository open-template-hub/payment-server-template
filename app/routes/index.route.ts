import {
  router as productRouter,
  adminRoutes as productAdminRoutes,
} from './product.route';
import {
  router as webhookRouter,
  publicRoutes as webhookPublicRoutes,
} from './webhook.route';
import { router as receiptRouter } from './receipt.route';
import {
  router as paymentRouter,
  adminRoutes as paymentAdminRoutes,
} from './payment.route';
import {
  router as monitorRouter,
  publicRoutes as monitorPublicRoutes,
} from './monitor.route';
import { preload } from '../util/preload.util';
import { router as subscriptionRouter } from './subscription.route';
import { Request, Response } from 'express';
import { handle } from '../util/error-handler.util';
import { MongoDbProvider } from '../providers/mongo.provider';
import { PostgreSqlProvider } from '../providers/postgre.provider';
import { EncryptionService } from '../util/encryption.util';
import { context } from '../context';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  payment: '/payment',
  product: '/product',
  webhook: '/webhook',
  receipt: '/receipt',
  subscription: '/subscription',
};

export module Routes {
  const mongodb_provider = new MongoDbProvider();
  const postgresql_provider = new PostgreSqlProvider();
  var publicRoutes: string[] = [];
  var adminRoutes: string[] = [];

  function populateRoutes(mainRoute, subRoutes) {
    var populated = Array<string>();
    for (var i = 0; i < subRoutes.length; i++) {
      const s = subRoutes[i];
      populated.push(mainRoute + (s === '/' ? '' : s));
    }

    return populated;
  }

  export function mount(app) {
    preload(mongodb_provider, postgresql_provider).then(() =>
      console.log('DB preloads are completed.')
    );

    publicRoutes = [
      ...populateRoutes(subRoutes.monitor, monitorPublicRoutes),
      ...populateRoutes(subRoutes.webhook, webhookPublicRoutes),
    ];
    console.log('Public Routes: ', publicRoutes);

    adminRoutes = [
      ...populateRoutes(subRoutes.product, productAdminRoutes),
      ...populateRoutes(subRoutes.payment, paymentAdminRoutes),
    ];
    console.log('Admin Routes: ', adminRoutes);

    const responseInterceptor = (req, res, next) => {
      var originalSend = res.send;
      const service = new EncryptionService();
      res.send = function () {
        console.log('Starting Encryption: ', new Date());
        let encrypted_arguments = service.encrypt(arguments);
        console.log('Encryption Completed: ', new Date());

        originalSend.apply(res, encrypted_arguments);
      };

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // Monitor router should be called before context creation
    app.use(subRoutes.monitor, monitorRouter);

    // INFO: Keep this method at top at all times
    app.all('/*', async (req: Request, res: Response, next) => {
      try {
        // create context
        res.locals.ctx = await context(
          req,
          mongodb_provider,
          postgresql_provider,
          publicRoutes,
          adminRoutes
        );

        next();
      } catch (e) {
        console.log('error: ', e);
        let error = handle(e);
        res.status(error.code).json({ message: error.message });
      }
    });

    // INFO: Add your routes here
    app.use(subRoutes.payment, paymentRouter);
    app.use(subRoutes.product, productRouter);
    app.use(subRoutes.webhook, webhookRouter);
    app.use(subRoutes.receipt, receiptRouter);
    app.use(subRoutes.subscription, subscriptionRouter);

    // Use for error handling
    app.use(function (err, req, res, next) {
      let error = handle(err);
      console.log(err);
      res.status(error.code).json({ message: error.message });
    });
  }
}
