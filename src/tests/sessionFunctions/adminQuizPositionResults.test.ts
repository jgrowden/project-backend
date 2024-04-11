import HTTPError from 'http-errors';
import { clear, requestAuthRegister, requestQuestionPositionResults, requestQuizCreateV2, requestQuizQuestionCreateV2, requestQuizSessionStart } from '../wrapper';
import { generateNewPlayerId } from '../../helper';

beforeAll(() => {
  clear();
});
afterEach(() => {
  clear();
});

let token1: string;
let quizId: number;
let sessionId: number;
let questionId: number;
const AUTOSTARTNUM = 8;

describe('adminQuizPositionbResults testing', () => {
  beforeEach(() => {
    token1 = requestAuthRegister('test@test.com', 'Password123', 'First', 'Last').jsonBody.token as string;
    quizId = requestQuizCreateV2(token1, 'First quiz', 'This is the first quiz').jsonBody.quizId as number;

    const questionBody = {
      question: 'Who\'s the imposter?',
      duration: 9,
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

    questionId = requestQuizQuestionCreateV2(token1, quizId, questionBody).jsonBody.questionId as number;

    sessionId = requestQuizSessionStart(token1, quizId, AUTOSTARTNUM).jsonBody.sessionid as number;
  });

  test('player ID does not exist', () => {

  });

  test('invalid question position', () => {

  });

  test('session is not in ANSWER_SHOW state', () => {

  });

  test('session is not up to this question', () => {

  });

  test('throw error if question position is at 0, should be at 1', () => {

  });

  test('successfully view quiz question results', () => {

  });
});
