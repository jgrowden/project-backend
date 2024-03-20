export { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, clear, ERROR };


let token: string;
let quizId: number;
let question;

beforeEach(() => {
  clear();
  const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
  let question = {
    token: token,
    questionBody: {        
        question: "Question?",
        duration: 3,
        points: 4,
        answers: [{ answer: "Answer!", correct: true }, { answer: "Another Answer!", correct: true }]
        }
    }
});

describe('Testing /v1/admin/quiz/{quizid}:', () => {
  test('Successful test.', () => {
    let time = Math.floor(Date.now() / 1000);
    let newQuestion = requestQuizQuestionCreate(quizId, question);
    expect(newQuestion.jsonBody).toStrictEqual({ questionId: expect.any(Number) });
    expect(requestQuizInfo(quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 1,
        questions: [
            {
                questionId: newQuestion.jsonBody.questionId,
                question: "Question?",
                duration: 3,
                points: 4,
                answers: [{ answer: "Answer!", correct: true }]
            }
        ]
    });
  });
  test('Failed test: question is too short.', () => {
    question.questionBody.question = 'Huh?'
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: question is too long.', () => {
    question.questionBody.question = 'A monoid is a monad in the category of endofunctors. What are the consequences for Haskell?';
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: there must be between 2 and 6 answers.', () => {
    question.questionBody.question;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: question has negative duration.', () => {
    question.questionBody.duration = -1;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: total sum of questions is longer than 3 minutes.', () => {
    question.questionBody.duration = 181;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: points awarded must be between 1 and 10 inclusive.', () => {
    question.questionBody.points = 0;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: points awarded must be between 1 and 10 inclusive.', () => {
    question.questionBody.points = 11;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: answer must be between 1 and 30 characters long inclusive.', () => {
    question.questionBody.answers[0].answer = '';
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: answer must be between 1 and 30 characters long inclusive.', () => {
    question.questionBody.answers[0].answer = 'The mitochondria is the powerhouse of the cell';
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: answer strings are duplicates.', () => {
    question.questionBody.answers.push({ answer: "Answer!", correct: true });
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: No correct answers.', () => {
    question.questionBody.answers[0].correct = false;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: invalid user.', () => {
    question.token = token + 'a';
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    question.token = otherToken;
    expect(requestQuizQuestionCreate(quizId, question)).toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
    });
  });
});
