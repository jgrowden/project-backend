import { requestClear } from '../wrapper';
import { requestHelper } from '../requestHelper';
import HTTPError from 'http-errors';

beforeAll(() => {
  requestClear();
});
afterEach(() => {
  requestClear();
});

describe('quizSessionStart', () => {
  test('failed request', () => {
    expect(() => requestHelper('DELETE', '/v2/fakerequestClear', {}, {})).toThrow(HTTPError[404]);
  });
});
