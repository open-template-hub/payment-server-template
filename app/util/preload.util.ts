import { MongoDbProvider } from '../provider/mongo.provider';
import { PostgreSqlProvider } from '../provider/postgre.provider';

export class PreloadUtil {
  /**
   * preloads db providers
   * @param mongodb_provider mongodb provider
   * @param postgresql_provider postgresql provider
   */
  preload = async (
    mongodb_provider: MongoDbProvider,
    postgresql_provider: PostgreSqlProvider
  ) => {
    await postgresql_provider.preload();
    await mongodb_provider.preload();
  };
}
