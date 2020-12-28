/**
 * @description holds token util
 */

import { TokenExpiredError, verify } from 'jsonwebtoken';
import { ResponseCode } from '../constant';

export class TokenUtil {
  /**
   * verifies access token
   * @param accessToken access token
   */
  verifyAccessToken = async (accessToken: string) => {
    try {
      return verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    } catch (e) {
      var ex = e as any;
      if (e instanceof TokenExpiredError) {
        ex.responseCode = ResponseCode.UNAUTHORIZED;
      } else {
        ex.responseCode = ResponseCode.FORBIDDEN;
      }
      throw ex;
    }
  };
}
