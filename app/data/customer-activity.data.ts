import mongoose from 'mongoose';

export class CustomerActivityDataModel {
  private readonly collectionName: string = 'customer_activity';
  private dataSchema: mongoose.Schema;

  constructor() {
    const schema: mongoose.SchemaDefinition = {
      payment_config_key: { type: String, required: true },
      username: { type: String, required: true },
      external_user_id: { type: String },
      subscriptions: { type: Array, default: [] }
    };

    const mongooseSchema = new mongoose.Schema( schema );
    mongooseSchema.index( { payment_config_key: 1, username: 1 }, { unique: true } );

    this.dataSchema = mongooseSchema;
  }

  getDataModel = async ( conn: mongoose.Connection ) => {
    return conn.model(
        this.collectionName,
        this.dataSchema,
        this.collectionName
    );
  };
}
