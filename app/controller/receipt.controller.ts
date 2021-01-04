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
  getSuccesfulReceipts = async (
    postgresql_provider: PostgreSqlProvider,
    username: string,
    product_id: string
  ) => {
    const receiptRepository = new ReceiptRepository(postgresql_provider);
    return await receiptRepository.getSuccessfulReceiptsWithUsernameAndProductId(
      username,
      product_id
    );
  };
}
