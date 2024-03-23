/* eslint-disable */
import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuestionCreate, requestQuestionDelete, clear, ERRORANDSTATUS } from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let quizId: number;
let questionId: number;
const questionBody: QuestionType = {
  question: 'Who\'s the strongest?',
  duration: 5,
  points: 6,
  answers: [
    {
      answer: 'Luffy',
      correct: false,
    },
    {
      answer: 'Shanks',
      correct: false,
    },
    {
      answer: 'Blackbeard',
      correct: false,
    },
    {
      answer: 'God Usopp',
      correct: true,
    },
  ],
};
beforeEach(() => {
  clear();
  const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
  const question = requestQuestionCreate(token, quizId, questionBody);
  questionId = question.jsonBody.questionId as number;
});

describe('Testing Question Delete', () => {
    describe('Testing error cases', () => {
        test('Error 401: Empty or invalid token', () => {
            expect(requestQuestionDelete('', quizId, questionId)).toStrictEqual({
              statusCode: 401,
              jsonBody: ERRORANDSTATUS
            });
            expect(requestQuestionDelete(token + '1', quizId, questionId)).toStrictEqual({
              statusCode: 401,
              jsonBody: ERRORANDSTATUS
            });
        });
        test('Error 403: Valid token, invalid quizId', () => {
            expect(requestQuestionDelete(token, quizId + 1, questionId, questionBody)).toStrictEqual({
              statusCode: 403,
              jsonBody: ERRORANDSTATUS
            });
            // Testing with valid quizId that the user does NOT own
            const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            const newToken = newUser.jsonBody.token as string;
            const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
            const newQuizId = newQuiz.jsonBody.quizId as number;
            const newQuestion = requestQuestionCreate(newToken, newQuizId);
            const newQuestionId = newQuestion.jsonBody.questionId as number;
            expect(requestQuestionDelete(token, newQuizId, newQuestionId))
              .toStrictEqual({
              statusCode: 403,
              jsonBody: ERRORANDSTATUS
            });
          });
        test('Error 400: Valid token, valid quizId, invalid questionId', () => {
            expect(requestQuestionDelete(token, quizId, questionId + 1))
                .toStrictEqual({
                statusCode: 400,
                jsonBody: ERRORANDSTATUS
            });
        });
    });
    describe('Testing success case', () => {
        test('Succesful question deletion', () => {
            expect(requestQuestionDelete(token, quizId, questionId))
                .toStrictEqual({
                statusCode: 200,
                jsonBody: {}
            });
            expect(requestQuizInfo(token, quizId)).toStrictEqual({
                statusCode: 200,
                jsonBody: {
                    quizId: quizId,
                    name: 'Quiz Name',
                    timeCreated: expect.any(Number),
                    timeLastEdited: expect.any(Number),
                    description: "Quiz Description",
                    numQuestions: 0,
                    questions: [],
                    duration: 0,
                }
            });
        });
    });
});