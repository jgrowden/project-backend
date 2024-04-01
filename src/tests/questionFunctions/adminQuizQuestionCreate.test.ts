import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, errorCode, clear } from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let quizId: number;
let questionBody: QuestionType;

beforeEach(() => {
  clear();
  const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
  questionBody = {
    question: 'Question?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
});

describe('Testing /v1/admin/quiz/{quizid}:', () => {
  test('Successful test.', () => {
    const newQuestion = requestQuizQuestionCreate(token, quizId, questionBody);
    expect(newQuestion.jsonBody).toStrictEqual({ questionId: expect.any(Number) });
    expect(requestQuizInfo(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        duration: 3,
        numQuestions: 1,
        questions: [
          {
            questionId: newQuestion.jsonBody.questionId,
            question: 'Question?',
            duration: 3,
            points: 4,
            answers: [
              {
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          }
        ]
      }
    });
  });
  test('Failed test: question is too short.', () => {
    questionBody.question = 'Huh?';
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: question is too long.', () => {
    questionBody.question = 'A monoid is a monad in the category of endofunctors. What are the consequences for Haskell?';
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: there must be between 2 and 6 answers.', () => {
    questionBody.answers = [];
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: question has negative duration.', () => {
    questionBody.duration = -1;
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: total sum of questions is longer than 3 minutes.', () => {
    questionBody.duration = 181;
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: points awarded must be between 1 and 10 inclusive.', () => {
    questionBody.points = 0;
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: points awarded must be between 1 and 10 inclusive.', () => {
    questionBody.points = 11;
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: answer must be between 1 and 30 characters long inclusive.', () => {
    questionBody.answers[0].answer = '';
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: answer must be between 1 and 30 characters long inclusive.', () => {
    questionBody.answers[0].answer = 'The mitochondria is the powerhouse of the cell';
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: answer strings are duplicates.', () => {
    questionBody.answers.push({ answer: 'Answer!', correct: false });
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: No correct answers.', () => {
    questionBody.answers[0].correct = false;
    questionBody.answers[1].correct = false;
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(400));
  });
  test('Failed test: invalid user.', () => {
    token = token + 'a';
    expect(requestQuizQuestionCreate(token, quizId, questionBody)).toStrictEqual(errorCode(401));
  });
  test('Failed test: invalid quiz.', () => {
    expect(requestQuizQuestionCreate(token, quizId + 1, questionBody)).toStrictEqual(errorCode(403));
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizQuestionCreate(otherToken, quizId, questionBody)).toStrictEqual(errorCode(403));
  });
});
