import { errorCode, requestAuthRegister, requestQuizCreate, requestQuizChangeOwner, requestQuizInfo, clear } from '../wrapper';

let User1Token: string;
let User2Token: string;
let quiz1Id: number;

beforeEach(() => {
  clear();
  const user1 = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  User1Token = user1.jsonBody.token as string;
  const user2 = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
  User2Token = user2.jsonBody.token as string;
  const quiz1 = requestQuizCreate(User1Token, 'Quiz Name', 'Quiz Description');
  quiz1Id = quiz1.jsonBody.quizId as number;
});

describe('adminQuizChangeOwner Tests:', () => {
  test('Successful test.', () => {
    expect(requestQuizChangeOwner(quiz1Id, User1Token, 'doffy@gmail.com')).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    expect(requestQuizInfo(User2Token, quiz1Id)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quiz1Id,
        name: 'Quiz Name',
        ownerId: 1,
        duration: 0,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 0,
        questions: []
      }
    });
  });
  test('Failing test: userEmail is not a real user', () => {
    expect(requestQuizChangeOwner(quiz1Id, User1Token, 'president@unswunsociety.org.au')).toStrictEqual(errorCode(400));
  });
  test('Failing test: userEmail is currently logged in', () => {
    expect(requestQuizChangeOwner(quiz1Id, User1Token, 'go.d.usopp@gmail.com')).toStrictEqual(errorCode(400));
  });
  test('Failing test: quiz name is a duplicate of a quiz they currently own', () => {
    requestQuizCreate(User2Token, 'Quiz Name', 'Quiz Description');
    expect(requestQuizChangeOwner(quiz1Id, User1Token, 'doffy@gmail.com')).toStrictEqual(errorCode(400));
  });
  test('Failing test: token is invalid', () => {
    expect(requestQuizChangeOwner(quiz1Id, User1Token + 'a', 'doffy@gmail.com')).toStrictEqual(errorCode(401));
  });
  test('Failing test: quizId is invalid', () => {
    expect(requestQuizChangeOwner(quiz1Id + 1, User1Token, 'doffy@gmail.com')).toStrictEqual(errorCode(403));
  });
  test('Failing test: user does not own quiz', () => {
    requestAuthRegister('president@unswunsociety.org.au', 'Passw0rd', 'No', 'Itsnotme');
    expect(requestQuizChangeOwner(quiz1Id, User2Token, 'president@unswunsociety.org.au')).toStrictEqual(errorCode(403));
  });
});
