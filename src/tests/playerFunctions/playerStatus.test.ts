import HTTPError from 'http-errors';
import { 
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizSessionStart,
  requestQuizQuestionCreate,
  requestQuizSessionAnswer,
  requestQuizSessionPlayerJoin,
  requestPlayerStatus,
  clear
} from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let quizId: number;
let questionId1: number;
let questionId2: number;
let questionId3: number;
let sessionId: number;
let playerId1: number;
let playerId2: number;
const AUTOSTARTNUM = 10;

beforeEach(() => {
  clear();
  token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
  quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
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
  const questionBody3: QuestionType = {
    question: 'Question3?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  questionId1 = requestQuizQuestionCreate(token, quizId, questionBody1).jsonBody.questionId as number;
  questionId2 = requestQuizQuestionCreate(token, quizId, questionBody2).jsonBody.questionId as number;
  questionId3 = requestQuizQuestionCreate(token, quizId, questionBody3).jsonBody.questionId as number;
  sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
  playerId1 = requestQuizSessionPlayerJoin(sessionId, 'marcus').jsonBody.playerId as number;
  playerId2 = requestQuizSessionPlayerJoin(sessionId, 'milk').jsonBody.playerId as number;
});

describe('Testing for GET /v1/player/{playerId}', () => {
  test('Success', () => {
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "LOBBY",
      numQuestions: 3,
      atQuestion: 0,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "LOBBY",
      numQuestions: 3,
      atQuestion: 0,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "QUESTION_COUNTDOWN",
      numQuestions: 3,
      atQuestion: 1,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "QUESTION_COUNTDOWN",
      numQuestions: 3,
      atQuestion: 1,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "QUESTION_OPEN",
      numQuestions: 3,
      atQuestion: 1,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "QUESTION_OPEN",
      numQuestions: 3,
      atQuestion: 1,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'GO_TO_ANSWER');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "ANSWER_SHOW",
      numQuestions: 3,
      atQuestion: 1,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "ANSWER_SHOW",
      numQuestions: 3,
      atQuestion: 1,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "QUESTION_COUNTDOWN",
      numQuestions: 3,
      atQuestion: 2,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "QUESTION_COUNTDOWN",
      numQuestions: 3,
      atQuestion: 2,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    requestQuizSessionAnswer(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionAnswer(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "END",
      numQuestions: 3,
      atQuestion: 0,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "END",
      numQuestions: 3,
      atQuestion: 0,
    });
    requestQuizSessionAnswer(token, quizId, sessionId, 'END');
    expect(requestPlayerStatus(playerId1)).toStrictEqual({
      state: "END",
      numQuestions: 3,
      atQuestion: 0,
    });
    expect(requestPlayerStatus(playerId2)).toStrictEqual({
      state: "END",
      numQuestions: 3,
      atQuestion: 0,
    });
  });
  test('Fail: Player Id does not exist', () => {
    expect(() => requestPlayerStatus(-1)).toThrow(HTTPError[400]);
  });
});
