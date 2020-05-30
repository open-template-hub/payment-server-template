/**
 * @description holds database connection provider
 */

import mongoose from 'mongoose';

export class MongoDbProvider {
  // mongoose connection
  conn: mongoose.Connection | null = null;

  /**
   * creates database connection
   * @returns mongodb connection
   */
  preload = async() => {
    // connection uri
    const uri: string = process.env.MONGODB_URI as string;

    if (this.conn == null) {
      this.conn = await mongoose.createConnection(uri, {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
      });
    }
  };

}
