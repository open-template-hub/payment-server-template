/**
 * Error Handler
 */

import { ErrorMessage, ResponseCode } from '../constant';

export const handle = (exception) => {
 let response = {
  code: ResponseCode.BAD_REQUEST,
  message: exception.message
 };

 // Overwrite Response Code and Message here
 if (exception.responseCode) {
  response.code = exception.responseCode;
 }

 switch(exception.message) {
   case ErrorMessage.FORBIDDEN:
      response.code = ResponseCode.FORBIDDEN
      break;
 }

 return response;
}
