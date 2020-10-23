/**
 * @description holds transaction history model
 */

import mongoose from 'mongoose';

/**
 * transaction history schema
 */
const schema: mongoose.SchemaDefinition = {
 payment_config_key: {type: String, required: true},
 username: {type: String, required: true},
 external_transaction_id: {type: String, required: true},
 product_id: {type: String, required: true},
 payload: {type: Object}
};

// transaction history collection name
const collectionName: string = 'transaction-history';

const transactionHistorySchema: mongoose.Schema = new mongoose.Schema(schema);

/**
 * creates transaction history model
 * @param conn database connection
 * @returns product model
 */
const TransactionHistoryModel = (conn: mongoose.Connection) =>
 conn.model(collectionName, transactionHistorySchema);

export default TransactionHistoryModel;
