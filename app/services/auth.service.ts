/**
 * @description holds context
 */

import { verifyAccessToken } from './token.service';

export const getCurrentUser = async (req) => {
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

 return currentUser;
}

export const getAdmin = async (req) => {
 let authToken = null;
 let currentUser: any = null;

 const authTokenHeader = req.headers.authorization || '';
 const BEARER = 'Bearer ';

 if (authTokenHeader && authTokenHeader.startsWith(BEARER)) {
  authToken = authTokenHeader.slice(BEARER.length);
  currentUser = await verifyAccessToken(authToken);
 }

 if (!currentUser || currentUser.role !== 'ADMIN') {
  let e: any = new Error('Forbidden');
  e.responseCode = 403;
  throw e;
 }

 return currentUser;
}
