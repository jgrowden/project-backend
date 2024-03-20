/* eslint-disable */
import { requestAuthRegister, requestQuizCreate, requestQuestionCreate, clear, ERROR } from '../wrapper';

beforeEach(() => {
  clear();
})

describe('Testing Question Update', () => {
  describe('Testing error cases', () => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    const quiz = requestQuizCreate();
    const quizQuestion = requestQuestionCreate();
    test('Empty or invalid token:', () => {
      expect(requestQuestionUpdate('', ))
    })
  });
})