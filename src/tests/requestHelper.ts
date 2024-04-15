import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../config.json';
import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';
const SERVER_URL = `${url}:${port}`;

// Return type of returnHelper() function.
interface RequestHelperReturnType {
  statusCode: number;
  jsonBody?: Record<string, unknown>;
  error?: string;
}

/**
 * Function to streamline HTTP calls to the server.
 * Example usage:
 *  - when putting the token in the body: requestHelper('PUT', '/path', {email, password, token});
 *    - the headers input may be omitted
 *  - when putting the token in the header: requestHelper('PUT', '/path', {email, password}, {token});
 */
//
//
export const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: object = {},
  headers?: IncomingHttpHeaders
): RequestHelperReturnType => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  let res: ReturnType<typeof request>;

  if (headers === undefined) {
    res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  } else {
    res = request(method, SERVER_URL + path, { qs, headers, json, timeout: 20000 });
  }

  const bodyString = res.body.toString();
  let bodyObject: RequestHelperReturnType;
  try {
    // Return if valid JSON, in our own custom format
    bodyObject = {
      jsonBody: JSON.parse(bodyString),
      statusCode: res.statusCode,
    };
  } catch (error) {
    bodyObject = {
      error: `
Server responded with ${res.statusCode}, but body is not JSON!\n\n
GIVEN:\n${bodyString}.\n
REASON:\n${error.message}.\n
HINT:\nDid you res.json(undefined)?`,
      statusCode: res.statusCode,
    };
  }
  // used for iter1 and 2 functions where errors are not thrown
  if (headers === undefined) {
    if ('error' in bodyObject) {
      // Return the error in a custom structure for testing later
      return { statusCode: res.statusCode, error: bodyObject.error };
    }
  } else if (headers !== undefined) {
    // Used for iter3 functions and rewritten iter2 routes where errors are thrown
    // Here, errors are re-thrown. The server already handles thrown errors, so
    // local tests would not detect the thrown errors. re-throwing locally fixes this
    const errorMessage = `[${res.statusCode}] ` + bodyObject.jsonBody?.error || bodyObject.jsonBody || 'No message specified!';
    switch (res.statusCode) {
      case 400: // BAD_REQUEST
        throw HTTPError(res.statusCode, errorMessage);
      case 401: // UNAUTHORIZED
        throw HTTPError(res.statusCode, errorMessage);
      case 403: // FORBIDDEN
        throw HTTPError(res.statusCode, errorMessage);
      case 404: // NOT_FOUND
        throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
      case 500: // INTERNAL_SERVER_ERROR
        throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
      default:
        if (res.statusCode !== 200) {
          throw HTTPError(res.statusCode, errorMessage);
        }
    }
  }

  return bodyObject;
};
