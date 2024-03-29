/**
 * @description holds Receipt repository
 */

import { ReceiptStatus } from '../constant';
import { ReceiptParams } from '../interface/receipt-params.interface';

export class ReceiptRepository {
  constructor(private connection: any) {}

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
        [username, external_transaction_id, product_id, payment_config_key]
      );
    } catch (error) {
      console.error('> getReceiptWithExternalTransactionId error: ', error);
      throw error;
    }
    return res.rows[0];
  };

  /**
   * get user's successful receipts by product id and username
   * @param username username
   * @param payment_config_key payment_config_key id
   * @returns successful receipts
   */
  getSuccessfulReceiptsWithUsername = async (
    payment_config_key: string,
    username: string
  ) => {
    let res;
    try {
      res = await this.connection.query(
        'SELECT * FROM receipts WHERE username = $1 and payment_config_key = $2 and status = $3',
        [username, payment_config_key, ReceiptStatus.SUCCESS]
      );
    } catch (error) {
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
  createReceipt = async (receiptObject: {
    username: string;
    external_transaction_id: string;
    product_id: string;
    payment_config_key: string;
    created_time: string;
    total_amount: number;
    currency_code: string;
    status: string;
    external_customer_id?: string;
    expire_date?: string;
    priority_order?: number;
  }) => {
    try {
      await this.connection.query(
        'INSERT INTO receipts(username, external_transaction_id, product_id, payment_config_key, created_time, total_amount, currency_code, status, customer_id, expire_date, priority_order) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          receiptObject.username,
          receiptObject.external_transaction_id,
          receiptObject.product_id,
          receiptObject.payment_config_key,
          receiptObject.created_time,
          receiptObject.total_amount,
          receiptObject.currency_code,
          receiptObject.status,
          receiptObject.external_customer_id,
          receiptObject.expire_date,
          receiptObject.priority_order,
        ]
      );
    } catch (error) {
      console.error('> createReceipt error: ', error);
      throw error;
    }
  };

  async changeStatusOfSubscriptionsWithExpireDates(
    payment_config_key: string,
    customer_id: string,
    created_time: string,
    status: string
  ) {
    try {
      await this.connection.query(
        'UPDATE receipts set status = $1 where $2 = payment_config_key and $3 = customer_id and $4 < expire_date',
        [status, payment_config_key, customer_id, created_time]
      );
    } catch (error) {
      console.error(
        '> changeStatusOfSubscriptionsWithExpireDates error: ',
        error
      );
      throw error;
    }
  }

  async getAllReceipts(receiptParams: ReceiptParams) {
    try {
      let whereQuery = 'username = $1 and payment_config_key = $2';

      if (receiptParams.is_subscription) {
        whereQuery += ' and customer_id IS NOT NULL';
      }

      let queryCounter = 3;
      let optionalQueryParams: string[] = [];
      if (receiptParams.start_date) {
        whereQuery += ` and created_time >= $${queryCounter}`;
        optionalQueryParams.push(receiptParams.start_date);
        queryCounter += 1;
      }

      if (receiptParams.end_date) {
        whereQuery += ` and created_time <= $${queryCounter}`;
        optionalQueryParams.push(receiptParams.end_date);
        queryCounter += 1;
      }

      if (receiptParams.product_id) {
        whereQuery += ` and product_id = $${queryCounter}`;
        optionalQueryParams.push(receiptParams.product_id);
        queryCounter += 1;
      }

      if ( receiptParams.status) {
        whereQuery += ` and status = $${queryCounter}`;
        optionalQueryParams.push( receiptParams.status);
        queryCounter += 1;
      }

      return await this.connection.query(
        `SELECT username, payment_config_key, product_id, created_time, total_amount, currency_code, status, expire_date, priority_order, count(*) OVER() as count FROM receipts WHERE ${whereQuery} ORDER BY created_time DESC OFFSET $${queryCounter} LIMIT $${
          queryCounter + 1
        }`,
        [
          receiptParams.username,
          receiptParams.payment_config_key,
          ...optionalQueryParams,
          receiptParams.filters?.offset,
          receiptParams.filters?.limit,
        ]
      );
    } catch (error) {
      console.error('> getAllReceipts error: ', error);
      throw error;
    }
  }
}
