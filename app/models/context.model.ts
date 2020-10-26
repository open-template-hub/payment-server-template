import { MongoDbProvider } from "../providers/mongo.provider";
import { PostgreSqlProvider } from "../providers/postgre.provider";

export interface Context {
  mongoDbProvider: MongoDbProvider;
  postgreSqlProvider: PostgreSqlProvider;
  username: string;
  serviceKey: string;
}