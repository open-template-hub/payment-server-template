import {
  context,
  DebugLogUtil,
  EncryptionUtil,
  ErrorHandlerUtil,
  MessageQueueProvider,
  MongoDbProvider,
  PostgreSqlProvider,
  PreloadUtil,
} from '@open-template-hub/common';
import { NextFunction, Request, Response } from 'express';
import { Environment } from '../../environment';
import { PaymentQueueConsumer } from '../consumer/payment-queue.consumer';
import { router as monitorRouter } from './monitor.route';
import { router as paymentRouter } from './payment.route';
import { router as productRouter } from './product.route';
import { router as receiptRouter } from './receipt.route';
import { router as subscriptionRouter } from './subscription.route';
import { router as webhookRouter } from './webhook.route';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  payment: '/payment',
  product: '/product',
  webhook: '/webhook',
  receipt: '/receipt',
  subscription: '/subscription',
};

export namespace Routes {
  var mongodb_provider: MongoDbProvider;
  var message_queue_provider: MessageQueueProvider;
  var environment: Environment;
  const debugLogUtil = new DebugLogUtil();
  var postgresql_provider: PostgreSqlProvider;
  let errorHandlerUtil: ErrorHandlerUtil;

  export function mount(app: any) {
    const preloadUtil = new PreloadUtil();
    environment = new Environment();
    errorHandlerUtil = new ErrorHandlerUtil(debugLogUtil, environment.args());
    mongodb_provider = new MongoDbProvider(environment.args());
    postgresql_provider = new PostgreSqlProvider(
      environment.args(),
      'PaymentServer'
    );

    message_queue_provider = new MessageQueueProvider(environment.args());

    const channelTag = new Environment().args().mqArgs
      ?.paymentServerMessageQueueChannel as string;
    message_queue_provider.getChannel(channelTag).then((channel: any) => {
      const paymentQueueConsumer = new PaymentQueueConsumer(channel);
      message_queue_provider.consume(
        channel,
        channelTag,
        paymentQueueConsumer.onMessage,
        1
      );
    });

    preloadUtil
      .preload(mongodb_provider, postgresql_provider)
      .then(() => console.log('DB preloads are completed.'));

    const responseInterceptor = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      var originalSend = res.send;
      const encryptionUtil = new EncryptionUtil(environment.args());
      res.send = function () {
        console.log('Starting Encryption: ', new Date());
        let encrypted_arguments = encryptionUtil.encrypt(arguments);
        console.log('Encryption Completed: ', new Date());

        originalSend.apply(res, encrypted_arguments as any);
      } as any;

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // Monitor router should be called before context creation
    app.use(subRoutes.monitor, monitorRouter);

    // INFO: Keep this method at top at all times
    app.all('/*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        // create context
        res.locals.ctx = await context(
          req,
          environment.args(),
          mongodb_provider,
          postgresql_provider
        );

        next();
      } catch (e) {
        console.log('error: ', e);
        let error = errorHandlerUtil.handle(e);
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
    app.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      let error = errorHandlerUtil.handle(err);
      console.log(err);
      res.status(error.code).json({ message: error.message });
    });
  }
}
