/**
 * @description holds payment model
 */

import mongoose from 'mongoose';

/**
 * payment schema
 */
const schema: mongoose.SchemaDefinition = {
 key: {type: String, unique: true, required: true, dropDups: true},
 payload: {type: Object}
};

// payment collection name
const collectionName: string = 'payment';

const paymentSchema: mongoose.Schema = new mongoose.Schema(schema);

/**
 * creates payment model
 * @param conn database connection
 * @returns payment model
 */
const paymentModel = (conn: mongoose.Connection) =>
 conn.model(collectionName, paymentSchema);

export default paymentModel;
