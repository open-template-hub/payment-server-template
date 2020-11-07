/**
 * @description holds product data model
 */

import mongoose from 'mongoose';

export class ProductDataModel {
  private readonly collectionName: string = 'product';
  private dataSchema: mongoose.Schema;

  constructor() {
    /**
     * Provider schema
     */
    const schema: mongoose.SchemaDefinition = {
      product_id: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
      },
      name: { type: String, required: true },
      description: { type: String, required: true },
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
