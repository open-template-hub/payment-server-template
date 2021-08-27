/**
 * @description holds Receipt repository
 */

import { ReceiptStatus } from '../constant';

export class ReceiptRepository {
  constructor( private connection: any ) {
  }

  /**
   * gets receipt with external transaction id
   * @param username username
   * @param external_transaction_id external transaction id
   * @param product_id product id
   * @param payment_config_key payment config key
   * @returns receipt
   */
  getReceiptWithExternalTransactionId = async (
      username: string,
      external_transaction_id: string,
      product_id: string,
      payment_config_key: string
  ) => {
    let res;
    try {
      res = await this.connection.query(
          'SELECT * FROM receipts WHERE username = $1 and external_transaction_id = $2 and product_id = $3 and payment_config_key = $4',
          [ username, external_transaction_id, product_id, payment_config_key ]
      );
    } catch ( error ) {
      console.error( '> getReceiptWithExternalTransactionId error: ', error );
      throw error;
    }
    return res.rows[ 0 ];
  };

  /**
   * get user's successful receipts by product id and username
   * @param username username
   * @param product_id product id
   * @returns successful receipts
   */
  getSuccessfulReceiptsWithUsernameAndProductId = async (
      username: string,
      product_id: string
  ) => {
    let res;
    try {
      res = await this.connection.query(
          'SELECT * FROM receipts WHERE username = $1 and product_id = $2 and status = $3',
          [ username, product_id, ReceiptStatus.SUCCESS ]
      );
    } catch ( error ) {
      console.error(
          '> getSuccessfulReceiptsWithUsernameAndProductId error: ',
          error
      );
      throw error;
    }
    return res.rows;
  };

  /**
   * creates a receipt
   * @param receiptObject
   *  username
   *  external_transaction_id external transaction id
   *  product_id product id
   *  payment_config_key payment config key
   *  created_time created time
   *  total_amount total amount
   *  currency_code currency code
   *  status receipt status
   */
  createReceipt = async ( receiptObject: {
        username: string,
        external_transaction_id: string,
        product_id: string,
        payment_config_key: string,
        created_time: Date,
        total_amount: number,
        currency_code: string,
        status: string
      }
  ) => {
    try {
      await this.connection.query(
          'INSERT INTO receipts(username, external_transaction_id, product_id, payment_config_key, created_time, total_amount, currency_code, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            receiptObject.username,
            receiptObject.external_transaction_id,
            receiptObject.product_id,
            receiptObject.payment_config_key,
            receiptObject.created_time,
            receiptObject.total_amount,
            receiptObject.currency_code,
            status,
          ]
      );
    } catch ( error ) {
      console.error( '> createReceipt error: ', error );
      throw error;
    }
  };
}
