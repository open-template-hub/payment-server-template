import mongoose from "mongoose";

export class ReceiptStatusDataModel {
    private readonly collectionName: string = "receipt_status";
    private dataSchema: mongoose.Schema;

    constructor() {
        const messageSchema: mongoose.SchemaDefinition = {
            text: { type: String },
            language: { type: String }
        }

        const schema: mongoose.SchemaDefinition = {
            status: { type: String, required: true, unique: true },
            messages: { type: [messageSchema] }
        }

        this.dataSchema = new mongoose.Schema(schema);
    }

    getDataModel = async(conn: mongoose.Connection) => {
        return conn.model(
            this.collectionName,
            this.dataSchema,
            this.collectionName
        );
    };
}