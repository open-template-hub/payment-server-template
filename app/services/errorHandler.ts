/**
 * Error Handler
 */

import { ResponseCode } from "../models/Constant";
import { JsonWebTokenError } from 'jsonwebtoken';

export const handle = (exception) => {
  let response = {
    code: ResponseCode.BAD_REQUEST,
    message: exception.message
  };

  // Overwrite Response Code and Message here
  if (exception.responseCode) {
    response.code = exception.responseCode;
  }

  return response;
}
