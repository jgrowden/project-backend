import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestPlayerQuestionPosition, requestQuizCreateV2, requestQuizQuestionCreateV2, requestSessionResults, requestQuizSessionInfo, requestQuizSessionPlayerAnswer, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestQuizSessionUpdate } from '../wrapper';
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
let sessionId1: number;
let player1: number;
let player2: number;
let player3: number;

let questionBody1: QuestionType = {
  question: 'Who is the imposter?',
  duration: 1,
  points: 10,
  answers: [{ answer: 'Red', correct: false }, { answer: 'Blue', correct: false }, { answer: 'Green', correct: false }, { answer: 'Orange', correct: true }],
  thumbnailUrl: 'http://sus.com/sus.jpg'
};

let questionBody2: QuestionType = {
  question: 'Why last vented in electrical?',
  duration: 2,
  points: 6,
  answers: [
    { answer: 'Red', correct: true }, { answer: 'Blue', correct: false }, { answer: 'Green', correct: false }, { answer: 'Orange', correct: false }],
  thumbnailUrl: 'http://alsosus.com/sus.jpg'
};

let questionBody3: QuestionType = {
  question: 'How many imposters are left?',
  duration: 10,
  points: 8,
  answers: [{ answer: '1', correct: true }, { answer: '2', correct: false }, { answer: '3', correct: false }, { answer: '4', correct: false }],
  thumbnailUrl: 'http://alsosus.com/sus.jpg'
};

let questionId1: number;
let questionId2: number;
let questionId3: number;
const AUTOSTARTNUM = 10;

let question1Answers: AnswerType[];
let question2Answers: AnswerType[];
let question3Answers: AnswerType[];

describe('playerSessionResults testing', () => {
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token1 = user.jsonBody.token as string;

    const quiz1 = requestQuizCreateV2(token1, 'Quiz Name', 'Quiz Description');
    quizId1 = quiz1.jsonBody.quizId as number;

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;
    player2 = requestQuizSessionPlayerJoin(sessionId1, 'person2').jsonBody.playerId as number;
    player3 = requestQuizSessionPlayerJoin(sessionId1, 'person3').jsonBody.playerId as number;

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
  });

  test('session id does not refer to a valid session within this quiz', () => {
    clear();
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token1 = user.jsonBody.token as string;

    const quiz1 = requestQuizCreateV2(token1, 'Quiz Name', 'Quiz Description');
    quizId1 = quiz1.jsonBody.quizId as number;

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token1, quizId1, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token1, quizId1, questionBody3).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;

    player1 = requestQuizSessionPlayerJoin(sessionId1, 'person1').jsonBody.playerId as number;

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');

    expect(() => requestSessionResults(player1 + 1)).toThrow(HTTPError[400]);
  });

  test('session is not in FINAL_RESULTS state', () => {
    expect(() => requestSessionResults(player1)).toThrow(HTTPError[400]);
  });

  test('successfully get quiz info', () => {
    question1Answers = requestPlayerQuestionPosition(player1, 1).jsonBody.answers as AnswerType[];
    const question1Answer1 = question1Answers[0].answerId; // incorrect answer
    const question1Answer4 = question1Answers[3].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player1, 1, [question1Answer1]);
    requestQuizSessionPlayerAnswer(player2, 1, [question1Answer4]);
    requestQuizSessionPlayerAnswer(player3, 1, [question1Answer4]);

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');

    question2Answers = requestPlayerQuestionPosition(player1, 2).jsonBody.answers as AnswerType[];
    const question2Answer1 = question2Answers[0].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player1, 2, [question2Answer1]);
    requestQuizSessionPlayerAnswer(player3, 2, [question2Answer1]);
    sleepSync(1100);
    requestQuizSessionPlayerAnswer(player2, 2, [question2Answer1]);
    sleepSync(1100);

    expect(requestQuizSessionInfo(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual('QUESTION_CLOSE');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');

    expect(requestSessionResults(player1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          usersRankedByScore: [
            {
              name: 'person2',
              score: 12
            },
            {
              name: 'person3',
              score: 8
            },
            {
              name: 'person1',
              score: 6
            }
          ],
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: [
                'person2',
                'person3'
              ],
              averageAnswerTime: expect.any(Number), // should be 0, generalised just in case
              percentCorrect: 67
            },
            {
              questionId: questionId2,
              playersCorrectList: [
                'person1',
                'person2',
                'person3'
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

  test('successfully get quiz info test 2', () => {
    question1Answers = requestPlayerQuestionPosition(player1, 1).jsonBody.answers as AnswerType[];
    const question1Answer4 = question1Answers[3].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player3, 1, [question1Answer4]);
    requestQuizSessionPlayerAnswer(player2, 1, [question1Answer4]);
    requestQuizSessionPlayerAnswer(player1, 1, [question1Answer4]);

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');

    // test that state is open after 3 seconds
    sleepSync(3100);
    expect(requestQuizSessionInfo(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual('QUESTION_OPEN');

    question2Answers = requestPlayerQuestionPosition(player1, 2).jsonBody.answers as AnswerType[];
    const question2Answer1 = question2Answers[0].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player1, 2, [question2Answer1]);
    requestQuizSessionPlayerAnswer(player2, 2, [question2Answer1]);
    requestQuizSessionPlayerAnswer(player3, 2, [question2Answer1]);

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'SKIP_COUNTDOWN');

    question3Answers = requestPlayerQuestionPosition(player1, 3).jsonBody.answers as AnswerType[];
    const question3Answer1 = question3Answers[0].answerId; // correct answer
    requestQuizSessionPlayerAnswer(player3, 3, [question3Answer1]);
    requestQuizSessionPlayerAnswer(player2, 3, [question3Answer1]);
    requestQuizSessionPlayerAnswer(player1, 3, [question3Answer1]);

    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token1, quizId1, sessionId1, 'GO_TO_FINAL_RESULTS');

    expect(requestSessionResults(player2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          usersRankedByScore: [
            {
              name: 'person3',
              score: 20
            },
            {
              name: 'person1', // Based on the spec, this could be either person 1 or 2. only score should matter to order here
              score: 12
            },
            {
              name: 'person2',
              score: 12
            }
          ],
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: [
                'person1',
                'person2',
                'person3'
              ],
              averageAnswerTime: expect.any(Number), // should be 0, generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionId2,
              playersCorrectList: [
                'person1',
                'person2',
                'person3'
              ],
              averageAnswerTime: expect.any(Number), // should be 0 , generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionId3,
              playersCorrectList: [
                'person1',
                'person2',
                'person3'
              ],
              averageAnswerTime: expect.any(Number), // should be 0 , generalised just in case
              percentCorrect: 100
            }
          ]
        }
      }
    );
  });
});
