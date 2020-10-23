import { getSuccessfulReceiptsWithUsernameAndProductId } from '../repository/receipt.repository';

export const getSuccesfulReceipts = async (dbProviders, username, product_id) => {
 return await getSuccessfulReceiptsWithUsernameAndProductId(dbProviders.postgreSqlProvider, username, product_id);
}
