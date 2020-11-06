/**
 * @description holds context
 */

import { AuthService } from "./services/auth.service";
import { MongoDbProvider } from "./providers/mongo.provider";
import { Context } from "./models/context.model";
import { PostgreSqlProvider } from "./providers/postgre.provider";
import { TokenService } from "./services/token.service";
import { UserRole } from "./enums/user-role.enum";
import { ErrorMessage } from "./constant";

export const context = async (
  req: any,
  mongodb_provider: MongoDbProvider,
  postgresql_provider: PostgreSqlProvider,
  publicPaths: string[],
  adminPaths: string[]
) => {
  const tokenService = new TokenService();
  const authService = new AuthService(tokenService);

  let currentUser: any;
  let publicPath = false;
  let adminPath = false;

  publicPaths.forEach(p => {
    if (req.path === p) {
      publicPath = true;
      return;
    }
  });

  adminPaths.forEach(p => {
    if (req.path === p) {
      adminPath = true;
      return;
    }
  });

  if (!publicPath) {
    currentUser = await authService.getCurrentUser(req);
  }

  const serviceKey = req.body.key;

  const role = currentUser ? (currentUser.role as UserRole) : ("" as UserRole);
  const isAdmin = authService.isAdmin(role);

  if (adminPath && !isAdmin) {
    throw new Error(ErrorMessage.FORBIDDEN);
  }

  return {
    mongodb_provider,
    postgresql_provider,
    username: currentUser ? currentUser.username : "",
    role,
    isAdmin,
    serviceKey,
  } as Context;
};
