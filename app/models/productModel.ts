/**
 * @description holds product model
 */

import mongoose from 'mongoose';

/**
 * product schema
 */
const schema: mongoose.SchemaDefinition = {
 productId: {type: String, unique: true, required: true, dropDups: true},
 payload: {type: Object}
};

// product collection name
const collectionName: string = 'product';

const productSchema: mongoose.Schema = new mongoose.Schema(schema);

/**
 * creates product model
 * @param conn database connection
 * @returns product model
 */
const productModel = (conn: mongoose.Connection) =>
 conn.model(collectionName, productSchema);

export default productModel;
