import { requestAuthRegister, requestQuizCreate, requestQuizInfo, clear, errorCode } from './wrapper';

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
    const requestedInfo = requestQuizInfo(token, quizId);
    expect(requestedInfo).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        ownerId: 0,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 0,
        questions: []
      }
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(requestQuizInfo(token + 'a', quizId)).toStrictEqual(errorCode(401));
  });
  test('Failed test: quiz does not exist.', () => {
    expect(requestQuizInfo(token, quizId + 1)).toStrictEqual(errorCode(403));
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizInfo(otherToken, quizId)).toStrictEqual(errorCode(403));
  });
});
