import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, requestQuizQuestionDuplicate, clear, ERRORANDSTATUS } from '../wrapper';
import { adminQuizQuestionCreateArgument } from '../../quiz';

let token: string;
let quizId: number;
let questionId1: number;
let questionId2: number;


beforeEach(() => {
  clear();
  const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
  const questionBody1: adminQuizQuestionCreateArgument = {
    question: 'Question1?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  const questionBody2: adminQuizQuestionCreateArgument = {
    question: 'Question2?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  questionId1 = requestQuizQuestionCreate(token, quizId, questionBody1).jsonBody.questionId;
  questionId2 = requestQuizQuestionCreate(token, quizId, questionBody2).jsonBody.questionId;
});

describe('Testing /v1/admin/quiz/{quizid}/question/{questionid}/move:', () => {
  test('Successfully duplicating quiz', () => {
    expect(requestQuizQuestionDuplicate(token, quizId, questionId1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        newQuestionId: expect.any(Number)
      }
    });
    expect(requestQuizInfo(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        ownerId: 0,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 3,
        questions: [
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          },
          {
            questionId: expect.any(Number),
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          },
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          }
        ]
      }
    });
    expect(requestQuizQuestionDuplicate(token, quizId, questionId2)).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    expect(requestQuizInfo(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        ownerId: 0,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 3,
        questions: [
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          },
          {
            questionId: expect.any(Number),
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          },
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          },
          {
            questionId: expect.any(Number),
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
          }
        ]
      }
    });
  });
  test('Failed test: question ID does not refer to a valid question within this quiz.', () => {
    expect(requestQuizQuestionDuplicate(token, quizId, -1)).toStrictEqual({
      statusCode: 400,
      jsonBody: ERRORANDSTATUS
    });
  });
  test('Failed test: Empty token.', () => {
    expect(requestQuizQuestionDuplicate('', quizId, questionId1, 0)).toStrictEqual({
      statusCode: 401,
      jsonBody: ERRORANDSTATUS
    });
  });
  test('Failed test: Invalid token.', () => {
    expect(requestQuizQuestionDuplicate(token + '1', quizId, questionId1, 0)).toStrictEqual({
      statusCode: 401,
      jsonBody: ERRORANDSTATUS
    });
  });
  test('Failed test: Quiz ID invalid.', () => {
    expect(requestQuizQuestionDuplicate(token, quizId + 1, questionId1, 0)).toStrictEqual({
      statusCode: 403,
      jsonBody: ERRORANDSTATUS
    });
  });
  test('Failed test: User does not own the quiz.', () => {
    const newUser = requestAuthRegister('frieren.theslayer@gmail.com', 'ushouldwatchfr1eren', 'Frieren', 'TheSlayer');
    const newToken = newUser.jsonBody.token as string;
    const newQuiz = requestQuizCreate(newToken, 'Quiz Name', 'Quiz Description');
    const newQuizId = newQuiz.jsonBody.quizId as number;
    const newQuestionBody: adminQuizQuestionCreateArgument = {
      question: 'new question',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const newQuestionId = requestQuizQuestionCreate(newToken, newQuizId, newQuestionBody).jsonBody.questionId;
    expect(requestQuizQuestionDuplicate(token, newQuizId, newQuestionId, 0)).toStrictEqual({
      statusCode: 403,
      jsonBody: ERRORANDSTATUS
    });
  });
});
