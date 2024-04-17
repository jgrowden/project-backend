import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestQuizCreateV2, requestQuizQuestionCreateV2, requestSessionResults, requestQuizSessionInfo, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestSendChat } from '../wrapper';
import { QuestionType, MessageType } from '../../dataStore';

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
let questionId1: number;
let questionId2: number;
let questionId3: number;
let message1: MessageType;
let message2: MessageType;
let message3: MessageType;
const AUTOSTARTNUM = 10;

describe('playerSendChat testing', () => {
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

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
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

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;
    
    expect(() => requestSendChat(player1 + 1, "hi")).toThrow(HTTPError[400]);
  });

  test('message too long or short', () => {
    expect(() => requestSendChat(player1, "")).toThrow(HTTPError[400]);
    expect(() => requestSendChat(player1, "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890")).toThrow(HTTPError[400]);
  });

  test('successfully send chat', () => {
    requestSendChat(player1, "hi everyone!");
    requestSendChat(player2, "hey player1, how are we all?");
    requestSendChat(player3, "fantastic");
  });
});
