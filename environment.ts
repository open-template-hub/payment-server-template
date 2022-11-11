import { DbArgs, EnvArgs, MqArgs, TokenArgs } from '@open-template-hub/common';

export class Environment {
  constructor( private _args: EnvArgs = {} as EnvArgs ) {
    const tokenArgs = {
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
      responseEncryptionSecret: process.env.RESPONSE_ENCRYPTION_SECRET,
    } as TokenArgs;

    const dbArgs = {
      mongoDbConnectionLimit: process.env.MONGODB_CONNECTION_LIMIT,
      mongoDbUri: process.env.MONGODB_URI,

      postgresqlConnectionLimit: process.env.POSTGRESQL_CONNECTION_LIMIT,
      postgresqlUri: process.env.DATABASE_URL,
    } as DbArgs;

    const mqArgs = {
      messageQueueConnectionUrl: process.env.CLOUDAMQP_URL,
      paymentServerMessageQueueChannel:
      process.env.PAYMENT_SERVER_QUEUE_CHANNEL,
      orchestrationServerMessageQueueChannel:
      process.env.ORCHESTRATION_SERVER_QUEUE_CHANNEL,
    } as MqArgs;

    this._args = { tokenArgs, dbArgs, mqArgs } as EnvArgs;
  }

  args = () => {
    return this._args;
  };
}
