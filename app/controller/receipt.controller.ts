/**
 * @description holds receipt controller
 */

import { MongoDbProvider, PostgreSqlProvider, QueryFilters } from '@open-template-hub/common';
import { ReceiptStatusRepository } from '../repository/receipt-status.repository';
import { ReceiptRepository } from '../repository/receipt.repository';

export class ReceiptController {
  /**
   * gets successful receipts for user
   * @param postgresql_provider postgresql provider
   * @param username username
   * @returns successful receipts
   */
  static async getSuccessfulReceipts(
      postgresql_provider: PostgreSqlProvider,
      payment_config_key: string,
      username: string,
  ) {
    const receiptRepository = new ReceiptRepository( postgresql_provider );
    return receiptRepository.getSuccessfulReceiptsWithUsername(
        payment_config_key,
        username
    );
  }

  static async getReceipts(
      postgresql_provider: PostgreSqlProvider,
      username: string,
      payment_config_key: string,
      is_subscription: boolean,
      start_date?: string,
      end_date?: string,
      production_id?: string,
      status?: string,
      filters?: QueryFilters
  ) {

    let offset = 0;
    let limit = 100;

    if ( filters ) {
      if ( filters.limit && filters.limit < 100 ) {
        limit = filters.limit;
      }

      if ( filters.offset ) {
        offset = filters.offset;
      }
    }

    let receiptRepository = new ReceiptRepository(
        postgresql_provider
    );

    let receipts = await receiptRepository.getAllReceipts(
        username,
        payment_config_key,
        is_subscription,
        { offset, limit },
        start_date,
        end_date,
        production_id,
        status,
    );

    let count = 0;
    if(receipts?.rows.length > 0) {
      count = receipts.rows[0].count
    }

    return { receipts: receipts.rows, offset, limit, count };
  }

  static async getStatusses( mongodb_provider: MongoDbProvider, language: string ) {
    const receiptStatusRepository = await new ReceiptStatusRepository().initialize(
        mongodb_provider.getConnection()
    );

    const defaultLanguage = process.env.DEFAULT_LANGUAGE ?? 'en';

    return receiptStatusRepository.getStatuses( language, defaultLanguage );
  }
}
