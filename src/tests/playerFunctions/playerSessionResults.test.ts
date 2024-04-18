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

const PLAYER_NAMES = ['person1', 'person2', 'person3'];
const AUTOSTARTNUM = 10;

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

function setupQuizAndSession() {
  const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  const token = user.jsonBody.token as string;

  const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
  const quizId = quiz.jsonBody.quizId as number;

  const questionIds = [
    requestQuizQuestionCreateV2(token, quizId, questionBody1).jsonBody.questionId as number,
    requestQuizQuestionCreateV2(token, quizId, questionBody2).jsonBody.questionId as number,
    requestQuizQuestionCreateV2(token, quizId, questionBody3).jsonBody.questionId as number,
  ];

  const sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;

  const playerIds = PLAYER_NAMES.map((name) => requestQuizSessionPlayerJoin(sessionId, name).jsonBody.playerId as number);

  return { token, quizId, sessionId, questionIds, playerIds };
}

function answerQuestion(playerId: number, questionPosition: number, answerIndex: number) {
  const answers = requestPlayerQuestionPosition(playerId, questionPosition).jsonBody.answers as AnswerType[];
  const answerId = answers[answerIndex].answerId;
  requestQuizSessionPlayerAnswer(playerId, questionPosition, [answerId]);
}

function updateSessionState(token: string, quizId: number, sessionId: number, action: string) {
  requestQuizSessionUpdate(token, quizId, sessionId, action);
}

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('playerSessionResults testing', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let questionIds: number[];
  let playerIds: number[];

  beforeEach(() => {
    const setup = setupQuizAndSession();
    token = setup.token;
    quizId = setup.quizId;
    sessionId = setup.sessionId;
    questionIds = setup.questionIds;
    playerIds = setup.playerIds;

    updateSessionState(token, quizId, sessionId, 'NEXT_QUESTION');
    updateSessionState(token, quizId, sessionId, 'SKIP_COUNTDOWN');
  });

  test('session id does not refer to a valid session within this quiz', () => {
    expect(() => requestSessionResults(playerIds[0] + 1)).toThrow(HTTPError[400]);
  });

  test('session is not in FINAL_RESULTS state', () => {
    expect(() => requestSessionResults(playerIds[0])).toThrow(HTTPError[400]);
  });

  test('successfully get quiz info', () => {
    answerQuestion(playerIds[0], 1, 0);
    answerQuestion(playerIds[1], 1, 3);
    answerQuestion(playerIds[2], 1, 3);

    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'NEXT_QUESTION');
    updateSessionState(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    answerQuestion(playerIds[0], 2, 0);
    answerQuestion(playerIds[2], 2, 0);
    sleepSync(1100);
    answerQuestion(playerIds[1], 2, 0);
    sleepSync(1100);

    expect(requestQuizSessionInfo(token, quizId, sessionId).jsonBody.state).toStrictEqual('QUESTION_CLOSE');
    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'NEXT_QUESTION');
    updateSessionState(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');

    expect(requestSessionResults(playerIds[0])).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          usersRankedByScore: [
            { name: PLAYER_NAMES[1], score: 12 },
            { name: PLAYER_NAMES[2], score: 8 },
            { name: PLAYER_NAMES[0], score: 6 }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [PLAYER_NAMES[1], PLAYER_NAMES[2]],
              averageAnswerTime: expect.any(Number), // should be 0, generalised just in case
              percentCorrect: 67
            },
            {
              questionId: questionIds[1],
              playersCorrectList: [PLAYER_NAMES[0], PLAYER_NAMES[1], PLAYER_NAMES[2]],
              averageAnswerTime: expect.any(Number), // should be 1, generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionIds[2],
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
    answerQuestion(playerIds[2], 1, 3);
    answerQuestion(playerIds[1], 1, 3);
    answerQuestion(playerIds[0], 1, 3);

    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'NEXT_QUESTION');

    // test that state is open after 3 seconds
    sleepSync(3100);
    expect(requestQuizSessionInfo(token, quizId, sessionId).jsonBody.state).toStrictEqual('QUESTION_OPEN');

    answerQuestion(playerIds[0], 2, 0);
    answerQuestion(playerIds[1], 2, 0);
    answerQuestion(playerIds[2], 2, 0);

    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'NEXT_QUESTION');
    updateSessionState(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    answerQuestion(playerIds[2], 3, 0);
    answerQuestion(playerIds[1], 3, 0);
    answerQuestion(playerIds[0], 3, 0);

    updateSessionState(token, quizId, sessionId, 'GO_TO_ANSWER');
    updateSessionState(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');

    expect(requestSessionResults(playerIds[1])).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          usersRankedByScore: [
            { name: PLAYER_NAMES[2], score: 20 },
            { name: PLAYER_NAMES[0], score: 12 },
            { name: PLAYER_NAMES[1], score: 12 }
          ],
          questionResults: [
            {
              questionId: questionIds[0],
              playersCorrectList: [PLAYER_NAMES[0], PLAYER_NAMES[1], PLAYER_NAMES[2]],
              averageAnswerTime: expect.any(Number), // should be 0, generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionIds[1],
              playersCorrectList: [PLAYER_NAMES[0], PLAYER_NAMES[1], PLAYER_NAMES[2]],
              averageAnswerTime: expect.any(Number), // should be 0 , generalised just in case
              percentCorrect: 100
            },
            {
              questionId: questionIds[2],
              playersCorrectList: [PLAYER_NAMES[0], PLAYER_NAMES[1], PLAYER_NAMES[2]],
              averageAnswerTime: expect.any(Number), // should be 0 , generalised just in case
              percentCorrect: 100
            }
          ]
        }
      }
    );
  });
});
