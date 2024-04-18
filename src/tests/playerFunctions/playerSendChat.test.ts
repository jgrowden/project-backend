import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestQuizCreateV2, requestQuizQuestionCreateV2, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestSendChat } from '../wrapper';
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

const questionBody1: QuestionType = {
  question: 'Who is the imposter?',
  duration: 1,
  points: 10,
  answers: [{ answer: 'Red', correct: false }, { answer: 'Blue', correct: false }, { answer: 'Green', correct: false }, { answer: 'Orange', correct: true }],
  thumbnailUrl: 'http://sus.com/sus.jpg'
};

const questionBody2: QuestionType = {
  question: 'Why last vented in electrical?',
  duration: 2,
  points: 6,
  answers: [{ answer: 'Red', correct: true }, { answer: 'Blue', correct: false }, { answer: 'Green', correct: false }, { answer: 'Orange', correct: false }],
  thumbnailUrl: 'http://alsosus.com/sus.jpg'
};

const questionBody3: QuestionType = {
  question: 'How many imposters are left?',
  duration: 10,
  points: 8,
  answers: [{ answer: '1', correct: true }, { answer: '2', correct: false }, { answer: '3', correct: false }, { answer: '4', correct: false }],
  thumbnailUrl: 'http://alsosus.com/sus.jpg'
};

const AUTOSTARTNUM = 10;

describe('playerSendChat testing', () => {
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token1 = user.jsonBody.token as string;

    const quiz1 = requestQuizCreateV2(token1, 'Quiz Name', 'Quiz Description');
    quizId1 = quiz1.jsonBody.quizId as number;

    requestQuizQuestionCreateV2(token1, quizId1, questionBody1)
    requestQuizQuestionCreateV2(token1, quizId1, questionBody2)
    requestQuizQuestionCreateV2(token1, quizId1, questionBody3)
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;
  });

  test('player id does not refer to a valid player', () => {
    expect(() => requestSendChat(player1 + 1, { messageBody: 'hi' })).toThrow(HTTPError[400]);
  });

  test('message too long or short', () => {
    expect(() => requestSendChat(player1, { messageBody: '' })).toThrow(HTTPError[400]);
    expect(() => requestSendChat(player1, { messageBody: '01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' })).toThrow(HTTPError[400]);
  });

  test('successfully send chat', () => {
    player2 = requestQuizSessionPlayerJoin(sessionId1, 'person2').jsonBody.playerId as number;
    player3 = requestQuizSessionPlayerJoin(sessionId1, 'person3').jsonBody.playerId as number;

    requestSendChat(player1, { messageBody: 'hi everyone!' });
    requestSendChat(player2, { messageBody: 'hey player1, how are we all?' });
    requestSendChat(player3, { messageBody: 'fantastic' });
  });
});
