import { PostgreSqlProvider } from "../providers/postgre.provider";
import { getSuccessfulReceiptsWithUsernameAndProductId } from "../repository/receipt.repository";

export const getSuccesfulReceipts = async (
  postgresql_provider: PostgreSqlProvider,
  username: string,
  product_id: string
) => {
  return await getSuccessfulReceiptsWithUsernameAndProductId(
    postgresql_provider,
    username,
    product_id
  );
};
