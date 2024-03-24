import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, requestQuestionUpdate, clear, ERROR } from '../wrapper';
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
  const question = requestQuizQuestionCreate(token, quizId, questionBody);
  questionId = question.jsonBody.questionId as number;
});

describe('Testing Question Update', () => {
  describe('Testing success case', () => {
    const updateQuestionBody: QuestionType = {
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
      expect(requestQuestionUpdate(token, quizId, questionId, updateQuestionBody))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      const quizTimeEdited = quizInfo.jsonBody.timeLastEdited;
      expect(requestQuizInfo(token, quizId)).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          ownerId: expect.any(Number),
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
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
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answer: 'Shanks',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answer: 'Blackbeard',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answer: 'God Usopp',
                  colour: expect.any(String),
                  correct: true,
                },
              ],
            },
          ],
          duration: 10,
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizTimeEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizTimeEdited + 1);
    });
  });
  describe('Testing error cases', () => {
    let newQuestionBody: QuestionType;
    beforeEach(() => {
      newQuestionBody = JSON.parse(JSON.stringify(questionBody));
    });
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
      const newQuestion = requestQuizQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(requestQuestionUpdate(token, newQuizId, newQuestionId, questionBody))
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
      newQuestionBody.answers = [];
      newQuestionBody.answers.push({
        answer: 'God Usopp',
        correct: true
      });
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
        },
        {
          answer: 'Garp',
          correct: false
        }
      );
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
          statusCode: 400,
          jsonBody: ERROR
        });
    });

    test('Error 400: duration < 1 || totalDuration > 3 mins', () => {
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
      newQuestionBody.answers[0].answer = 'God Usopp';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
          statusCode: 400,
          jsonBody: ERROR
        });
    });

    test('Error 400: No correct answers', () => {
      newQuestionBody.answers[3].correct = false;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual({
          statusCode: 400,
          jsonBody: ERROR
        });
    });
  });
});
