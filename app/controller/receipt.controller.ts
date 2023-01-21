/**
 * @description holds receipt controller
 */

import { MongoDbProvider, PostgreSqlProvider } from '@open-template-hub/common';
import { ReceiptParams } from '../interface/receipt-params.interface';
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
    username: string
  ) {
    const receiptRepository = new ReceiptRepository(postgresql_provider);
    return receiptRepository.getSuccessfulReceiptsWithUsername(
      payment_config_key,
      username
    );
  }

  static async getReceipts(receiptParams: ReceiptParams) {
    let offset = 0;
    let limit = 100;

    if (receiptParams.filters) {
      if (receiptParams.filters.limit && receiptParams.filters.limit < 100) {
        limit = receiptParams.filters.limit;
      }

      if (receiptParams.filters.offset) {
        offset = receiptParams.filters.offset;
      }
    } else {
      receiptParams.filters = {
        limit,
        offset,
      };
    }

    let receiptRepository = new ReceiptRepository(
      receiptParams.postgresql_provider
    );

    let receipts = await receiptRepository.getAllReceipts(receiptParams);

    let count = 0;
    if (receipts?.rows.length > 0) {
      count = receipts.rows[0].count;
    }

    return { receipts: receipts.rows, offset, limit, count };
  }

  static async getStatusses(
    mongodb_provider: MongoDbProvider,
    language: string
  ) {
    const receiptStatusRepository =
      await new ReceiptStatusRepository().initialize(
        mongodb_provider.getConnection()
      );

    const defaultLanguage = process.env.DEFAULT_LANGUAGE ?? 'en';

    return receiptStatusRepository.getStatuses(language, defaultLanguage);
  }
}
