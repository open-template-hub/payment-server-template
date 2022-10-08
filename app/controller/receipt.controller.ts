/**
 * @description holds receipt controller
 */

import { PostgreSqlProvider } from '@open-template-hub/common';
import { ReceiptRepository } from '../repository/receipt.repository';

export class ReceiptController {
  /**
   * gets successful receipts for user
   * @param postgresql_provider postgresql provider
   * @param username username
   * @param product_id product id
   * @returns successful receipts
   */
   static async getSuccessfulReceipts(
      postgresql_provider: PostgreSqlProvider,
      username: string,
  ) {
    const receiptRepository = new ReceiptRepository( postgresql_provider );
    return receiptRepository.getSuccessfulReceiptsWithUsername(
        username
    );
  }

  static async getReceipts(
    postgresql_provider: PostgreSqlProvider,
    username: string,
    payment_config_key: string,
    offset: number,
    limit: number,
    is_subscription: boolean,
    start_date?: string,
    end_date?: string,
    production_id?: string
  ) {

    if(limit > 100) {
      limit = 100
    }

    let receiptRepository = new ReceiptRepository(
      postgresql_provider
    )

    let receipts = await receiptRepository.getAllReceipts(
                            username, 
                            payment_config_key,
                            offset,
                            limit,
                            is_subscription,
                            start_date,
                            end_date,
                            production_id
                          );

    return { receipts: receipts.rows, offset, limit }
  }
}
