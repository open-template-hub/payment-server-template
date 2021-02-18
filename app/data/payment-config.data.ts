/**
 * @description holds payment config data model
 */

import mongoose from 'mongoose';

export class PaymentConfigDataModel {
  private readonly collectionName: string = 'payment_config';
  private dataSchema: mongoose.Schema;

  constructor() {
    /**
     * Provider schema
     */
    const schema: mongoose.SchemaDefinition = {
      key: { type: String, unique: true, required: true, dropDups: true },
      payload: { type: Object },
    };

    this.dataSchema = new mongoose.Schema( schema );
  }

  /**
   * creates provider model
   * @returns provider model
   */
  getDataModel = async ( conn: mongoose.Connection ) => {
    return conn.model(
        this.collectionName,
        this.dataSchema,
        this.collectionName
    );
  };
}
