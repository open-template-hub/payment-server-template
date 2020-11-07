import { MongoDbProvider } from '../provider/mongo.provider';
import { PostgreSqlProvider } from '../provider/postgre.provider';

export const preload = async (
  mongodb_provider: MongoDbProvider,
  postgresql_provider: PostgreSqlProvider
) => {
  await postgresql_provider.preload();
  await mongodb_provider.preload();
};
