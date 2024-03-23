import { requestAuthRegister, requestQuizCreate, requestQuizDelete, errorCode, clear } from '../wrapper';

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
});

describe('Testing /v1/admin/quiz/{quizid}:', () => {
  test('Successful test.', () => {
    expect(requestQuizDelete(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(requestQuizDelete(token + 'a', quizId)).toStrictEqual(errorCode(401));
  });
  test('Failed test: quiz does not exist.', () => {
    expect(requestQuizDelete(token, quizId + 1)).toStrictEqual(errorCode(403));
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizDelete(otherToken, quizId)).toStrictEqual(errorCode(403));
  });
});
