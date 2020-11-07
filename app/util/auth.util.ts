/**
 * @description holds auth service
 */

import { UserRole } from '../enum/user-role.enum';
import { TokenService } from './token.util';

export class AuthService {
  private adminRoles = [UserRole.ADMIN];
  constructor(private readonly tokenService: TokenService) {}

  getCurrentUser = async (req: { headers: { authorization: string } }) => {
    let authToken = '';
    let currentUser = null;

    const authTokenHeader = req.headers.authorization;
    const BEARER = 'Bearer ';

    if (authTokenHeader && authTokenHeader.startsWith(BEARER)) {
      authToken = authTokenHeader.slice(BEARER.length);
      currentUser = await this.tokenService.verifyAccessToken(authToken);
    }

    if (!currentUser) {
      let e: any = new Error('User must be logged in');
      e.responseCode = 403;
      throw e;
    }

    return currentUser;
  };

  isAdmin = (role: UserRole) => {
    if (this.adminRoles.indexOf(role) >= 0) {
      return true;
    } else {
      return false;
    }
  };
}