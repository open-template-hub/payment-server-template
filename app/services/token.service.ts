/**
 * @description holds token service
 */

import { TokenExpiredError, verify } from 'jsonwebtoken';
import { ResponseCode } from '../util/constant';

export const verifyAccessToken = async (accessToken) => {
 try {
  return verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
 } catch (e) {
  if (e instanceof TokenExpiredError) {
   e.responseCode = ResponseCode.UNAUTHORIZED;
  } else {
   e.responseCode = ResponseCode.FORBIDDEN;
  }
  throw e;
 }
};
