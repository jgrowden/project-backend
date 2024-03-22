/* eslint-disable */
import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuestionCreate, requestQuestionUpdate, clear, ERROR } from '../wrapper';
import { AdminQuizQuestionBody, AdminQuizAnswerBody } from '../../quiz';

let token: string;
let quizId: number;
let questionId: number;
const questionBody: AdminQuizQuestionBody = {
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

describe('Testing Question Update', () => {
  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuestionUpdate('', quizId, questionId, questionBody)).toStrictEqual({
        statusCode: 401,
        jsonBody: ERROR
      });
      expect(requestQuestionUpdate(token + '1', quizId, questionId, questionBody)).toStrictEqual({
        statusCode: 401,
        jsonBody: ERROR
      });
    });
    
    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuestionUpdate(token, quizId + 1, questionId, questionBody)).toStrictEqual({
        statusCode: 403,
        jsonBody: ERROR
      });
      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      const newQuestion = requestQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(requestionQuestionUpdate(token, newQuizId, newQuestionId, questionBody))
        .toStrictEqual({
        statusCode: 403,
        jsonBody: ERROR
      });
    });
    test('Error 400: Invalid questionId', () => {
      expect(requestQuestionUpdate(token, quizId, questionId + 1, questionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });

    let newQuestionBody = JSON.parse(JSON.stringify(questionBody));
    test('Error 400: Invalid question string', () => {
       newQuestionBody.question = 'Who?';
       expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
         .toStrictEqual({
         statusCode: 400,
         jsonBody: ERROR
       });
       newQuestionBody.question = 'whooooooooooooooooooooooooooooooooooooooooooooooooo';
       expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
         .toStrictEqual({
         statusCode: 400,
         jsonBody: ERROR
       });
    });
    test('Error 400: answers < 2 || answers > 6', () => {
      newQuestionBody.question = questionBody.question;
      newQuestionBody.answers = [{
        answer: 'God Usopp',
        correct: true,
      }];
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.answers.push(
        {
          answer: 'Mihawk',
          correct: false,
        },
        {
          answer: 'Roger',
          correct: false,
        }
      );
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
    test('Error 400: duration < 0 || totalDuration > 3 mins', () => { 
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.duration = -1;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
      newQuestionBody.duration = 181;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
    test('Error 400: points < 1 || points > 10', () => {
      newQuestionBody.duration = questionBody.duration;
      newQuestionBody.points = 0;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
      newQuestionBody.points = 11;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
    test('Error 400: Question contains answer string with length < 1 || > 30', () => {
      newQuestionBody.points = questionBody.points;
      newQuestionBody.answers[0].answer = '';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
      newQuestionBody.answers[0].answer = 'answerrrrrrrrrrrrrrrrrrrrrrrrrr';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
    test('Error 400: Duplicate answer strings', () => {
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.answers[0].answer = 'God Usopp';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
    test('Error 400: No correct answers', () => {
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.answers[3].correct = false;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERROR
      });
    });
  });

  describe('Testing success case', () => {
    const newQuestionBody: AdminQuizQuestionBody = {
      question: 'Who has the longest nose?',
      duration: 5,
      points: 9,
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
    test('Successful question update:', () => {
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(requestQuizInfo(token, quizId)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: "Quiz Description",
          numQuestions: 1,
          questions: [
            {
              questionId: questionId,
              question: 'Who has the longest nose?',
              duration: 5,
              points: 9,
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
            },
          ],
          duration: 5,
        }
      });
    });
  });

})