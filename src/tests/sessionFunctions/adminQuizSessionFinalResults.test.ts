import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestPlayerQuestionPosition, requestQuizCreateV2, requestQuizQuestionCreateV2, requestQuizSessionFinalResults, requestQuizSessionInfo, requestQuizSessionPlayerAnswer, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestQuizSessionUpdate } from '../wrapper';
import { AnswerType, QuestionType } from '../../dataStore';

// Taken from week 8 labs
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // do nothing
  }
}

beforeEach(() => {
  clear();
});
afterEach(() => {
  clear();
});

let quizId1: number;
let token1: string;
let token2: string;
let sessionId1: number;
let player1: number;
let player2: number;
let questionBody1: QuestionType;
let questionBody2: QuestionType;
let questionBody3: QuestionType;
let questionId1: number;
let questionId2: number;
let questionId3: number;
const AUTOSTARTNUM = 10;

let question1Answers: AnswerType[];
let question2Answers: AnswerType[];

describe('adminQuizSessionFinalResults testing', () => {
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    const user2 = requestAuthRegister('test@testmail.com', 'Password123', 'First', 'Last');
    token1 = user.jsonBody.token as string;
    token2 = user2.jsonBody.token as string;

    const quiz1 = requestQuizCreateV2(token1, 'Quiz Name', 'Quiz Description');
    quizId1 = quiz1.jsonBody.quizId as number;

    questionBody1 = {
      question: 'Who is the imposter?',
      duration: 1,
      points: 10,
      answers: [
        {
          answer: 'Red',
          correct: false,
        },
        {
          answer: 'Blue',
          correct: false,
        },
        {
          answer: 'Green',
          correct: false,
        },
        {
          answer: 'Orange',
          correct: true,
        },
      ],
      thumbnailUrl: 'http://sus.com/sus.jpg'
    };

    questionBody2 = {
      question: 'Why last vented in electrical?',
      duration: 2,
      points: 8,
      answers: [
        {
          answer: 'Red',
          correct: true,
        },
        {
          answer: 'Blue',
          correct: false,
        },
        {
          answer: 'Green',
          correct: false,
        },
        {
          answer: 'Orange',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://alsosus.com/sus.jpg'
    };

    questionBody3 = {
      question: 'How many imposters are left?',
      duration: 1,
      points: 6,
      answers: [
        {
          answer: '1',
          correct: true,
        },
        {
          answer: '2',
          correct: false,
        },
        {
          answer: '3',
          correct: false,
        },
        {
          answer: '4',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://alsosus.com/sus.jpg'
    };

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;
    player2 = requestQuizSessionPlayerJoin(sessionId1, 'person2').jsonBody.playerId as number;

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
  });

  test('session id does not refer to a valid session within this quiz', () => {
    expect(() => requestQuizSessionFinalResults(token1, quizId1, sessionId1 + 1)).toThrow(HTTPError[400]);
  });

  test('session is not in FINAL_RESULTS state', () => {
    expect(() => requestQuizSessionFinalResults(token1, quizId1, sessionId1)).toThrow(HTTPError[400]);
  });

  test('token is empty or invalid', () => {
    expect(() => requestQuizSessionFinalResults('', quizId1, sessionId1)).toThrow(HTTPError[401]);
    expect(() => requestQuizSessionFinalResults(token1 + 'aaaaa', quizId1, sessionId1)).toThrow(HTTPError[401]);
  });

  test('valid token is provided, but user is not an owner of this quiz', () => {
    expect(() => requestQuizSessionFinalResults(token2, quizId1, sessionId1)).toThrow(HTTPError[403]);
  });

  test('successfully get quiz info', () => {
    question1Answers = requestPlayerQuestionPosition(player1, 1).jsonBody.answers as AnswerType[];
    const question1Answer1 = question1Answers[0].answerId; // incorrect answer
    const question1Answer4 = question1Answers[3].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player1, 1, [question1Answer1]);
    requestQuizSessionPlayerAnswer(player2, 1, [question1Answer4]);
    sleepSync(1100);

    expect(requestQuizSessionInfo(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual('QUESTION_CLOSE');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');

    question2Answers = requestPlayerQuestionPosition(player1, 2).jsonBody.answers as AnswerType[];
    const question2Answer1 = question2Answers[0].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player1, 2, [question2Answer1]);
    sleepSync(1100);
    requestQuizSessionPlayerAnswer(player2, 2, [question2Answer1]);
    sleepSync(1100);

    expect(requestQuizSessionInfo(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual('QUESTION_CLOSE');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');

    expect(requestQuizSessionFinalResults(token1, quizId1, sessionId1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          usersRankedByScore: [
            {
              name: 'person1',
              score: 8
            },
            {
              name: 'person2',
              score: 14
            }
          ],
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: [
                'person2'
              ],
              averageAnswerTime: expect.any(Number), // should be 0, generalised just in case
              percentCorrect: 50
            },
            {
              questionId: questionId2,
              playersCorrectList: [
                'person1',
                'person2'
              ],
              averageAnswerTime: expect.any(Number), // should be 1, generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionId3,
              playersCorrectList: [],
              averageAnswerTime: 0, // no answers, should be 0
              percentCorrect: 0
            }
          ]
        }
      }
    );
  });
});
