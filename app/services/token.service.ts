/**
 * @description holds token service
 */

import { verify } from 'jsonwebtoken';

export class TokenService {
  verifyAccessToken = async (accessToken: string) => {
    const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET as string;
    return verify(accessToken, accessTokenSecret);
  };
}
