import {
  ContextArgs,
  MountArgs,
  MountAssets,
  Route,
  RouteArgs,
  mount as mountApp,
} from '@open-template-hub/common';
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
  export function mount(app: any) {
    const envArgs = new Environment().args();

    const ctxArgs = {
      envArgs,
      providerAvailability: {
        mongo_enabled: true,
        postgre_enabled: true,
        mq_enabled: true,
      },
    } as ContextArgs;

    const assets = {
      mqChannelTag: envArgs.mqArgs?.paymentServerMessageQueueChannel as string,
      queueConsumer: new PaymentQueueConsumer(),
      applicationName: 'PaymentServer',
    } as MountAssets;

    var routes: Array<Route> = [];

    routes.push({ name: subRoutes.monitor, router: monitorRouter });
    routes.push({ name: subRoutes.payment, router: paymentRouter });
    routes.push({ name: subRoutes.product, router: productRouter });
    routes.push({ name: subRoutes.webhook, router: webhookRouter });
    routes.push({ name: subRoutes.receipt, router: receiptRouter });
    routes.push({ name: subRoutes.subscription, router: subscriptionRouter });

    const routeArgs = { routes } as RouteArgs;

    const args = {
      app,
      ctxArgs,
      routeArgs,
      assets,
    } as MountArgs;

    mountApp(args);
  }
}
