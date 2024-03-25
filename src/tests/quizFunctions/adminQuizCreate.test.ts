import { requestAuthRegister, requestQuizCreate, requestQuizInfo, clear, errorCode } from '../wrapper';

let token: string;

beforeEach(() => {
  clear();
  const { jsonBody } = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  token = jsonBody.token as string;
});

describe('Testing adminQuizCreate:', () => {
  test('Successful test.', () => {
    const returnedQuiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(returnedQuiz).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizId: expect.any(Number) }
    });
    expect(requestQuizInfo(token, returnedQuiz.jsonBody.quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: returnedQuiz.jsonBody.quizId,
        name: 'Quiz Name',
        ownerId: 0,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        duration: 0,
        numQuestions: 0,
        questions: []
      }
    });
  });
  test('Failed test: user does not exist', () => {
    expect(requestQuizCreate(token + 'a', 'Quiz Name', 'Quiz Description')).toStrictEqual(errorCode(401));
  });
  test('Failed test: invalid quiz name characters', () => {
    expect(requestQuizCreate(token, '!nvalid Name', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz name is too short', () => {
    expect(requestQuizCreate(token, 'iq', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz name is too long', () => {
    expect(requestQuizCreate(token, 'A very long quiz name which is far too long', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: duplicate quiz name', () => {
    requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(requestQuizCreate(token, 'Quiz Name', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz description is too long', () => {
    requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(requestQuizCreate(token, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description')).toStrictEqual(errorCode(400));
  });
});
