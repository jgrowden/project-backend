import { requestAuthRegister, requestQuizCreate, requestQuizInfo, clear, ERROR } from './wrapper';

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
    let time = Math.floor(Date.now() / 1000);
    let requestedInfo = requestQuizInfo(token, quizId);
    expect(requestedInfo).toStrictEqual({
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        questions: []
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(requestQuizInfo(token + 'a', quizId)).toStrictEqual({
      statusCode: 400,
      jsonBody: ERROR
    });
  });
  test('Failed test: quiz does not exist.', () => {
    expect(requestQuizInfo(token, quizId + 1)).toStrictEqual({
      statusCode: 400,
      jsonBody: ERROR
    });
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizInfo(otherToken, quizId)).toStrictEqual({
      statusCode: 400,
      jsonBody: ERROR
    });
  });
});
