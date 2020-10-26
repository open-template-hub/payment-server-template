import { PostgreSqlProvider } from "../providers/postgre.provider";
import { getSuccessfulReceiptsWithUsernameAndProductId } from "../repository/receipt.repository";

export const getSuccesfulReceipts = async (
  postgreSqlProvider: PostgreSqlProvider,
  username: string,
  product_id: string
) => {
  return await getSuccessfulReceiptsWithUsernameAndProductId(
    postgreSqlProvider,
    username,
    product_id
  );
};
