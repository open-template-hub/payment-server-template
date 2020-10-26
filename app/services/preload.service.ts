import { MongoDbProvider } from '../providers/mongo.provider';
import { PostgreSqlProvider } from '../providers/postgre.provider';

export const preload = async (mongoDbProvider: MongoDbProvider, postgreSqlProvider: PostgreSqlProvider) => {
 await postgreSqlProvider.preload();
 await mongoDbProvider.preload();
}