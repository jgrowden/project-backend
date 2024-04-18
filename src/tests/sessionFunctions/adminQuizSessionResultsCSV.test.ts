import HTTPError from 'http-errors';
import { 
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizSessionStart,
  requestQuizQuestionCreate,
  requestQuizSessionUpdate,
  requestQuizSessionPlayerJoin,
  requestQuizSessionResultsCSV,
  clear,
  requestQuizInfo,requestQuizSessionInfo,
  requestCSV
} from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let anotherToken: string;
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
  anotherToken = requestAuthRegister('bestMother420@gmail.com', 'iamreallytall420', 'alyssa', 'iscrazyhelpme').jsonBody.token as string;
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

describe('Testing for GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', () => {
  test('Success', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');
    console.log(requestQuizInfo(token, quizId));
    console.log(requestQuizSessionInfo(token, quizId, sessionId));
    expect(requestQuizSessionResultsCSV(token, quizId, sessionId)).toStrictEqual({
      statusCode: 200,
      jsonBody: { url: expect.any(String)}
    });
    console.log(requestCSV(`csv_results_${sessionId}.csv`));
  });
  test('Fail: session is not in FINAL_RESULTS state', () => {
    expect(() => requestQuizSessionResultsCSV(token, quizId, sessionId)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(() => requestQuizSessionResultsCSV(token, quizId, sessionId)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(() => requestQuizSessionResultsCSV(token, quizId, sessionId)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    expect(() => requestQuizSessionResultsCSV(token, quizId, sessionId)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'END');
    expect(() => requestQuizSessionResultsCSV(token, quizId, sessionId)).toThrow(HTTPError[400]);
  });
  test('Fail: Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(() => requestQuizSessionResultsCSV(token + 'a', quizId, sessionId)).toThrow(HTTPError[401]);
  });
  test('Fail: invalid quizId is provided', () => {
    expect(() => requestQuizSessionResultsCSV(token, quizId + 1, sessionId)).toThrow(HTTPError[403]);
  });
  test('Fail: Valid token is provided, but user is not an owner of this quiz', () => {
    expect(() => requestQuizSessionResultsCSV(anotherToken, quizId, sessionId)).toThrow(HTTPError[403]);
  });  
  test('Fail: session Id is not a valid session Id for this quiz', () => {
    expect(() => requestQuizSessionResultsCSV(token, quizId, -1)).toThrow(HTTPError[400]);
  });
});
