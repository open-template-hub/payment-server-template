/**
 * @description holds payment method interface
 */

import { MongoDbProvider } from '@open-template-hub/common';
import { PaymentConfig } from './payment-config.interface';
import { Product } from './product.interface';

export interface PaymentMethod {
    /**
     * initializes payment method
     * @param dbConn db connection
     * @param paymentConfig payment config
     * @param product product
     * @param quantity quantity
     */
    initOneTimePayment(
        dbConn: any,
        paymentConfig: PaymentConfig,
        product: Product,
        quantity: number,
        transaction_id: string,
        origin: string
    ): Promise<any>;

    /**
     * builds payment method
     * @param paymentConfig payment config
     * @param external_transaction external transaction
     */
    build( paymentConfig: PaymentConfig, external_transaction: any ): Promise<any>;

    /**
     * gets transaction history by external transaction id
     * @param paymentConfig payment config
     * @param external_transaction_id external transaction id
     */
    getTransactionHistory(
        paymentConfig: PaymentConfig,
        external_transaction_id: string
    ): Promise<any>;

    /**
     * updates receipt status
     * @param dbConn db connection
     * @param paymentConfig payment config
     * @param external_transaction_id external transaction id
     * @param updated_transaction_history updated transaction history
     */
    receiptStatusUpdate(
        dbConn: any,
        paymentConfig: PaymentConfig,
        external_transaction_id: string,
        updated_transaction_history: any
    ): Promise<string>;

    /**
     * creates a product
     * @param amount product amount
     * @param currency product currency
     */
    createProduct( amount: number, currency: string ): Promise<any>;

    /**
     * confirms payment internally
     * only for test usage
     * @param paymentConfig payment config
     * @param external_transaction_id external transaction id
     */
    confirmPayment(
        paymentConfig: PaymentConfig,
        external_transaction_id: string
    ): Promise<void>;

    getSuccessStatus(): string;

    createCustomer(paymentConfig: any, username: string): any;

    initSubscription(
        dbConn: any,
        paymentConfig: PaymentConfig,
        product: Product,
        customerId: string,
        origin: string
    ): any;

    getModeFromProduct(
        payload: any
    ): string;

    getUsernameByExternalCustomerId(
        mongodb_provider: MongoDbProvider,
        externalCustomerId: string
    ): Promise<string>;

    createPortalSession(
        paymentConfig: PaymentConfig,
        customerId: string,
        origin: string
    ): any;

    constructEvent(
        paymentConfig: PaymentConfig,
        body: any,
        signature: any
    ): any;
}
