import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestQuizCreateV2, requestQuizQuestionCreateV2, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestSendChat, requestViewChats } from '../wrapper';
import { QuestionType } from '../../dataStore';

beforeEach(() => {
  clear();
});
afterEach(() => {
  clear();
});

let quizId1: number;
let token1: string;
let sessionId1: number;
let player1: number;
let player2: number;
let player3: number;
let questionBody1: QuestionType;
let questionBody2: QuestionType;
let questionBody3: QuestionType;
const AUTOSTARTNUM = 10;

describe('playerViewChats testing', () => {
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token1 = user.jsonBody.token as string;

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
      points: 6,
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
      duration: 10,
      points: 8,
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

    requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;
    player2 = requestQuizSessionPlayerJoin(sessionId1, 'person2').jsonBody.playerId as number;
    player3 = requestQuizSessionPlayerJoin(sessionId1, 'person3').jsonBody.playerId as number;
  });

  test('player id does not refer to a valid player', () => {
    clear();
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token1 = user.jsonBody.token as string;

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
      points: 6,
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
      duration: 10,
      points: 8,
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

    requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;

    expect(() => requestViewChats(player1 + 1)).toThrow(HTTPError[400]);
  });

  test('successfully view chats', () => {
    requestSendChat(player1, 'hi everyone!');
    expect(requestViewChats(player1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: player1,
              playerName: 'person1',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
    requestSendChat(player2, 'hey player1, how are we all?');
    expect(requestViewChats(player2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: player1,
              playerName: 'person1',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'hey player1, how are we all?',
              playerId: player2,
              playerName: 'person2',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
    requestSendChat(player3, 'fantastic');
    expect(requestViewChats(player3)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: player1,
              playerName: 'person1',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'hey player1, how are we all?',
              playerId: player2,
              playerName: 'person2',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'fantastic',
              playerId: player3,
              playerName: 'person3',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
  });
});