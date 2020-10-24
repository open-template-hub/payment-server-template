import monitorRouter from "./monitor.route";
import paymentRouter from "./payment.route";
import productRouter from "./product.route";
import webhookRouter from "./webhook.route";
import receiptRouter from "./receipt.route";
import subscriptionRouter from './subscription.route';
import { Request, Response } from "express";
import { handle } from "../services/error-handler.service";
import { MongoDbProvider } from "../providers/mongo.provider";
import { PostgreSqlProvider } from "../providers/postgre.provider";
import { EncryptionService } from "../services/encryption.service";

const subRoutes = {
  root: "/",
  monitor: "/monitor",
  payment: "/payment",
  product: "/product",
  webhook: "/webhook",
  receipt: "/receipt",
  subscription: "/subscription",
};

export module Routes {
  export function mount(app) {
    const mongoDbProvider = new MongoDbProvider();
    const postgreSqlProvider = new PostgreSqlProvider();

    postgreSqlProvider
      .preload()
      .then(() => console.log("PostgreSQL preload completed."));
    mongoDbProvider
      .preload()
      .then(() => console.log("MongoDB preload completed."));

    const responseInterceptor = (req, res, next) => {
      var originalSend = res.send;
      const service = new EncryptionService();
      res.send = function () {
        console.log("Starting Encryption: ", new Date());
        let encrypted_arguments = service.encrypt(arguments);
        console.log("Encryption Completed: ", new Date());

        originalSend.apply(res, encrypted_arguments);
      };

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // Monitor router should be called before context creation
    app.use(subRoutes.monitor, monitorRouter);

    // INFO: Keep this method at top at all times
    app.all("/*", async (req: Request, res: Response, next) => {
      try {
        // create context
        let dbProviders = {
          mongoDbProvider: mongoDbProvider,
          postgreSqlProvider: postgreSqlProvider,
        };
        res.locals.ctx = { dbProviders };

        next();
      } catch (e) {
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
