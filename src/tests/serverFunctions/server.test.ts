import { clear } from '../wrapper';
import { requestHelper } from '../requestHelper';
import HTTPError from 'http-errors';

beforeAll(() => {
  clear();
});
afterEach(() => {
  clear();
});

describe('quizSessionStart', () => {
  test('failed request', () => {
    expect(() => requestHelper('DELETE', `/v2/fakeClear`, {}, {})).toThrow(HTTPError[404]);
  })
});