import { getSuccessfulReceiptsWithUsernameAndProductId } from "../dao/receiptDao";

export const getSuccesfulReceipts = async(dbProviders, username, product_id) => {
  return await getSuccessfulReceiptsWithUsernameAndProductId(dbProviders.postgreSqlProvider, username, product_id);
}