import { UserRole } from "../enums/user-role.enum";
import { MongoDbProvider } from "../providers/mongo.provider";
import { PostgreSqlProvider } from "../providers/postgre.provider";

export interface Context {
  mongoDbProvider: MongoDbProvider;
  postgreSqlProvider: PostgreSqlProvider;
  role: UserRole;
  isAdmin: boolean;
  username: string;
  serviceKey: string;
}