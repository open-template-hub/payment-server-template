import mongoose from 'mongoose';

export class CustomerActivityDataModel {
  private readonly collectionName: string = 'customer_activity';
  private dataSchema: mongoose.Schema;

  constructor() {
    const schema: mongoose.SchemaDefinition = {
      payment_config_key: { type: String, required: true },
      username: { type: String, required: true, unique: true },
      external_user_id: { type: String },
      subscriptions: { type: Array, default: [] }
    };

    this.dataSchema = new mongoose.Schema( schema );
  }

  getDataModel = async ( conn: mongoose.Connection ) => {
    return conn.model(
        this.collectionName,
        this.dataSchema,
        this.collectionName
    );
  };
}
