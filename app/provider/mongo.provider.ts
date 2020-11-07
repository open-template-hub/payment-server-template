/**
 * @description holds providers connection provider
 */

import mongoose, { Connection } from 'mongoose';
import { Builder } from '../util/builder.util';

export class MongoDbProvider {
  // mongoose connection
  private connection: Connection = mongoose.createConnection();
  private builder: Builder = new Builder();
  private poolLimit: number = 1;
  private readonly preloadDataTemplatePath = './assets/sql/preload.data.json';

  preload = async () => {
    this.poolLimit =
      parseInt(<string>process.env.MONGODB_CONNECTION_LIMIT) || (1 as number);

    await this.createConnectionPool();
  };

  createConnectionPool = async () => {
    // close open connections
    await Promise.all(
      mongoose.connections.map(async (connection) => {
        if (connection) {
          await connection.close();
        }
      })
    );

    // create connection pool
    const uri: string = process.env.MONGODB_URI as string;
    this.connection = await mongoose
      .createConnection(uri, {
        bufferCommands: false,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        keepAlive: true,
        poolSize: this.poolLimit,
        socketTimeoutMS: 0,
      })
      .catch((error) => {
        throw error;
      });
  };

  getConnection() {
    return this.connection;
  }
}
