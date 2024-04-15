import HTTPError from 'http-errors';
import {
  clear,
  requestAuthRegister,
  requestPlayerQuestionPosition,
  requestQuestionResults,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionPlayerAnswer,
  requestQuizSessionPlayerJoin,
  requestQuizSessionStart,
  requestQuizSessionUpdate
} from '../wrapper';
import { AnswerType } from '../../dataStore';

beforeAll(() => {
  clear();
});
afterEach(() => {
  clear();
});

let token1: string;
let quizId: number;
let sessionId: number;
let questionId1: number;
let questionId2: number;
let player1: number;
let player2: number;
let player3: number;
const AUTOSTARTNUM = 8;

let question1Answers: AnswerType[];
let question1Answer1: number;
let question1Answer2: number;
// let question1Answer3: number;
// let question1Answer4: number;

let question2Answers: AnswerType[];
// let question2Answer1: number;
// let question2Answer2: number;
let question2Answer3: number;
let question2Answer4: number;

// register admin to create quiz
// create quiz
// create 2 questions
// create session
// register 2 players
// next question
// submit answers
// get answer results

describe('adminQuizPositionResults testing', () => {
  beforeEach(() => {
    token1 = requestAuthRegister('test@test.com', 'Password123', 'First', 'Last').jsonBody.token as string;
    quizId = requestQuizCreateV2(token1, 'First quiz', 'This is the first quiz').jsonBody.quizId as number;

    const questionBody1 = {
      question: 'Who\'s the imposter?',
      duration: 1,
      points: 6,
      answers: [
        {
          answer: 'red',
          correct: true,
        },
        {
          answer: 'blue',
          correct: false,
        },
        {
          answer: 'orange',
          correct: false,
        },
        {
          answer: 'green',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://bigsus.com/imposter.jpg'
    };

    const questionBody2 = {
      question: 'Who last vented in electrical?',
      duration: 1,
      points: 7,
      answers: [
        {
          answer: 'red',
          correct: false,
        },
        {
          answer: 'blue',
          correct: false,
        },
        {
          answer: 'orange',
          correct: true,
        },
        {
          answer: 'green',
          correct: false,
        },
      ],
      thumbnailUrl: 'http://biggersus.com/imposter.jpg'
    };

    expect(() => { questionId1 = requestQuizQuestionCreateV2(token1, quizId, questionBody1).jsonBody.questionId as number; }).not.toThrow(Error);
    expect(() => { questionId2 = requestQuizQuestionCreateV2(token1, quizId, questionBody2).jsonBody.questionId as number; }).not.toThrow(Error);

    expect(() => { sessionId = requestQuizSessionStart(token1, quizId, AUTOSTARTNUM).jsonBody.sessionId as number; }).not.toThrow(Error);

    expect(() => { player1 = requestQuizSessionPlayerJoin(sessionId, 'crewmate').jsonBody.playerId as number; }).not.toThrow(Error);
    expect(() => { player2 = requestQuizSessionPlayerJoin(sessionId, 'engineer').jsonBody.playerId as number; }).not.toThrow(Error);
    expect(() => { player3 = requestQuizSessionPlayerJoin(sessionId, 'crewmate2').jsonBody.playerId as number; }).not.toThrow(Error);

    expect(() => { requestQuizSessionUpdate(token1, quizId, sessionId, 'NEXT_QUESTION'); }).not.toThrow(Error);
    expect(() => { requestQuizSessionUpdate(token1, quizId, sessionId, 'SKIP_COUNTDOWN'); }).not.toThrow(Error);

    expect(() => { question1Answers = requestPlayerQuestionPosition(player1, 1).jsonBody.answers as AnswerType[]; }).not.toThrow(Error);
    question1Answer1 = question1Answers[0].answerId;
    question1Answer2 = question1Answers[1].answerId;
    // question1Answer3 = question1Answers[2].answerId;
    // question1Answer4 = question1Answers[3].answerId;

    expect(() => requestQuizSessionPlayerAnswer(player1, 1, [question1Answer1])).not.toThrow(Error);
    expect(() => requestQuizSessionPlayerAnswer(player2, 1, [question1Answer2])).not.toThrow(Error);
    expect(() => requestQuizSessionPlayerAnswer(player3, 1, [question1Answer1])).not.toThrow(Error);
  });

  test('player ID does not exist', () => {
    requestQuizSessionUpdate(token1, quizId, sessionId, 'GO_TO_ANSWER');
    const uniqueId = player1 * player1 + player2 * player2 + player3 * player3 + player1 + player2 + player3;
    expect(() => requestQuestionResults(uniqueId, 1)).toThrow(HTTPError[400]);
  });

  test('invalid question position', () => {
    requestQuizSessionUpdate(token1, quizId, sessionId, 'GO_TO_ANSWER');
    expect(() => requestQuestionResults(player1, 10)).toThrow(HTTPError[400]);
  });

  test('session is not in ANSWER_SHOW state', () => {
    // put a sleep here?
    expect(() => requestQuizSessionUpdate(token1, quizId, sessionId, 'NEXT_QUESTION'));
    expect(() => requestQuestionResults(player1, 1)).toThrow(HTTPError[400]);
  });

  test('session is not up to this question', () => {
    requestQuizSessionUpdate(token1, quizId, sessionId, 'GO_TO_ANSWER');
    expect(() => requestQuestionResults(player1, 2)).toThrow(HTTPError[400]);
  });

  test('throw error if question position is at 0, should be at 1', () => {
    // should occur as a result of not being in answer_show state
    expect(() => requestQuestionResults(player1, 0)).toThrow(HTTPError[400]);
  });

  test('successfully view quiz question results', () => {
    requestQuizSessionUpdate(token1, quizId, sessionId, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player1, 1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          questionId: questionId1,
          playersCorrectList: [
            'crewmate',
            'crewmate2'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 67
        }
      }
    );

    expect(() => requestQuizSessionUpdate(token1, quizId, sessionId, 'NEXT_QUESTION')).not.toThrow(Error);
    expect(() => requestQuizSessionUpdate(token1, quizId, sessionId, 'SKIP_COUNTDOWN')).not.toThrow(Error);

    expect(() => { question2Answers = requestPlayerQuestionPosition(player1, 2).jsonBody.answers as AnswerType[]; }).not.toThrow(Error);

    // question2Answer1 = question2Answers[0].answerId;
    // question2Answer2 = question2Answers[1].answerId;
    question2Answer3 = question2Answers[2].answerId;
    question2Answer4 = question2Answers[3].answerId;

    expect(() => requestQuizSessionPlayerAnswer(player1, 2, [question2Answer3])).not.toThrow(Error);
    expect(() => requestQuizSessionPlayerAnswer(player2, 2, [question2Answer3, question2Answer4])).not.toThrow(Error);
    expect(() => requestQuizSessionPlayerAnswer(player3, 2, [question2Answer3])).not.toThrow(Error);

    // could put a wait here
    requestQuizSessionUpdate(token1, quizId, sessionId, 'GO_TO_ANSWER');

    expect(requestQuestionResults(player1, 2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          questionId: questionId2,
          playersCorrectList: [
            'crewmate',
            'crewmate2'
          ],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 67
        }
      }
    );
  });
});
