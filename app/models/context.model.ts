import { UserRole } from '../enums/user-role.enum';
import { MongoDbProvider } from '../providers/mongo.provider';
import { PostgreSqlProvider } from '../providers/postgre.provider';

export interface Context {
  mongodb_provider: MongoDbProvider;
  postgresql_provider: PostgreSqlProvider;
  role: UserRole;
  isAdmin: boolean;
  username: string;
  serviceKey: string;
}
