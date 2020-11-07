/**
 * @description holds subscription data model
 */

import mongoose from 'mongoose';

export class SubscriptionDataModel {
  private readonly collectionName: string = 'subscription';
  private dataSchema: mongoose.Schema;

  constructor() {
    /**
     * Provider schema
     */
    const schema: mongoose.SchemaDefinition = {
      subscription_id: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
      },
      key: { type: String, required: true },
      username: { type: String, required: true },
      payload: { type: Object },
    };

    this.dataSchema = new mongoose.Schema(schema);
  }

  /**
   * creates provider model
   * @returns provider model
   */
  getDataModel = async (conn: mongoose.Connection) => {
    return conn.model(
      this.collectionName,
      this.dataSchema,
      this.collectionName
    );
  };
}
