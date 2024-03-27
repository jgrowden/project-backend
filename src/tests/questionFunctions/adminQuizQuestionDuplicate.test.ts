import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, requestQuizQuestionDuplicate, clear, errorCode } from '../wrapper';
import { QuestionType } from '../../dataStore';

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
  const questionBody1: QuestionType = {
    question: 'Question1?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  const questionBody2: QuestionType = {
    question: 'Question2?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  questionId1 = requestQuizQuestionCreate(token, quizId, questionBody1).jsonBody.questionId as number;
  questionId2 = requestQuizQuestionCreate(token, quizId, questionBody2).jsonBody.questionId as number;
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
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        duration: 9,
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
          }
        ]
      }
    });
    expect(requestQuizQuestionDuplicate(token, quizId, questionId2)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        newQuestionId: expect.any(Number)
      }
    });
    expect(requestQuizInfo(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        duration: 12,
        numQuestions: 4,
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
    expect(requestQuizQuestionDuplicate(token, quizId, -1)).toStrictEqual(errorCode(400));
  });
  test('Failed test: Empty token.', () => {
    expect(requestQuizQuestionDuplicate('', quizId, questionId1)).toStrictEqual(errorCode(401));
  });
  test('Failed test: Invalid token.', () => {
    expect(requestQuizQuestionDuplicate(token + '1', quizId, questionId1)).toStrictEqual(errorCode(401));
  });
  test('Failed test: Quiz ID invalid.', () => {
    expect(requestQuizQuestionDuplicate(token, quizId + 1, questionId1)).toStrictEqual(errorCode(403));
  });
  test('Failed test: User does not own the quiz.', () => {
    const newUser = requestAuthRegister('frieren.theslayer@gmail.com', 'ushouldwatchfr1eren', 'Frieren', 'TheSlayer');
    const newToken = newUser.jsonBody.token as string;
    const newQuiz = requestQuizCreate(newToken, 'Quiz Name', 'Quiz Description');
    const newQuizId = newQuiz.jsonBody.quizId as number;
    const newQuestionBody: QuestionType = {
      question: 'new question',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const newQuestionId = requestQuizQuestionCreate(newToken, newQuizId, newQuestionBody).jsonBody.questionId as number;
    expect(requestQuizQuestionDuplicate(token, newQuizId, newQuestionId)).toStrictEqual(errorCode(403));
  });
});
