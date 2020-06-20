import paymentRouter from './paymentRoute';
import productRouter from './productRoute';
import webhookRouter from './webhookRoute';
import receiptRouter from './receiptRoute';
import { Request, Response } from 'express';
import { handle } from '../services/errorHandler';
import { MongoDbProvider } from '../database/mongoDbProvider';
import { PostgreSqlProvider } from '../database/postgreSqlProvider';
import { EncryptionService } from '../services/encryptionService';

export module Routes {
 export function mount(app) {
  const mongoDbProvider = new MongoDbProvider();
  const postgreSqlProvider = new PostgreSqlProvider();

  postgreSqlProvider.preload();
  mongoDbProvider.preload();

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
  }

  // use this interceptor before routes
  app.use(responseInterceptor);

  // INFO: Keep this method at top at all times
  app.all('/*', async (req: Request, res: Response, next) => {
   try {
    // create context
    let dbProviders = {
     mongoDbProvider: mongoDbProvider,
     postgreSqlProvider: postgreSqlProvider
    }
    res.locals.ctx = {dbProviders};

    next();
   } catch (e) {
    let error = handle(e);
    res.status(error.code).json({message: error.message});
   }
  });

  // TODO: Add your routes here
  app.use('/payment', paymentRouter);
  app.use('/product', productRouter);
  app.use('/webhook', webhookRouter);
  app.use('/receipt', receiptRouter);

  // Use for error handling
  app.use(function (err, req, res, next) {
   let error = handle(err);
   console.log(err);
   res.status(error.code).json({message: error.message});
  });
 }
}

