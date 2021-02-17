/**
 * @description holds transaction history data model
 */

import mongoose from 'mongoose';

export class TransactionHistoryDataModel {
  private readonly collectionName: string = 'transaction_history';
  private dataSchema: mongoose.Schema;

  constructor() {
    /**
     * Provider schema
     */
    const schema: mongoose.SchemaDefinition = {
      payment_config_key: { type: String, required: true },
      username: { type: String, required: true },
      external_transaction_id: { type: String, required: true },
      product_id: { type: String, required: true },
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
