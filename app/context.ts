/**
 * @description holds context
 */

import { getConnection } from './database/Provider';
import { verifyAccessToken } from './services/TokenService';

export const context = async (req) => {
 const dbConn = await getConnection();
 let authToken = null;
 let currentUser = null;

 const authTokenHeader = req.headers.authorization || '';
 const BEARER = 'Bearer ';

 if (authTokenHeader && authTokenHeader.startsWith(BEARER)) {
  authToken = authTokenHeader.slice(BEARER.length);
  currentUser = await verifyAccessToken(authToken);
 }

 if (!currentUser) {
  let e: any = new Error('User must be logged in');
  e.responseCode = 403;
  throw e;
 }

 return {dbConn, currentUser};
}
