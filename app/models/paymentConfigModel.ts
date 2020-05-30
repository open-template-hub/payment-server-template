/**
 * @description holds payment config model
 */

import mongoose from 'mongoose';

/**
 * payment config schema
 */
const schema: mongoose.SchemaDefinition = {
 key: {type: String, unique: true, required: true, dropDups: true},
 payload: {type: Object}
};

// payment config collection name
const collectionName: string = 'payment-config';

const paymentSchema: mongoose.Schema = new mongoose.Schema(schema);

/**
 * creates payment config model
 * @param conn database connection
 * @returns payment config model
 */
const paymentConfigModel = (conn: mongoose.Connection) =>
 conn.model(collectionName, paymentSchema);

export default paymentConfigModel;
