import HTTPError from 'http-errors';
import { requestClear, requestAuthRegister, requestQuizCreateV2, requestQuizQuestionCreateV2, requestQuizSessionPlayerJoin, requestQuizSessionStart, requestSendChat, requestViewChats } from '../wrapper';
import { QuestionType } from '../../dataStore';

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

function setupQuizAndSession(numPlayers: number) {
  const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  const token = user.jsonBody.token as string;

  const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
  const quizId = quiz.jsonBody.quizId as number;

  requestQuizQuestionCreateV2(token, quizId, questionBody1);
  requestQuizQuestionCreateV2(token, quizId, questionBody2);
  requestQuizQuestionCreateV2(token, quizId, questionBody3);

  const sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;

  const playerIds = PLAYER_NAMES.slice(0, numPlayers).map((name) => requestQuizSessionPlayerJoin(sessionId, name).jsonBody.playerId as number);

  return { token, quizId, sessionId, playerIds };
}

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('playerViewChats testing', () => {
  let playerIds: number[];

  beforeEach(() => {
    requestClear();
  });

  test('player id does not refer to a valid player', () => {
    const setup = setupQuizAndSession(1); // Only register one player
    playerIds = setup.playerIds;

    expect(() => requestViewChats(playerIds[0] + 1)).toThrow(HTTPError[400]);
  });

  test('successfully view chats', () => {
    const setup = setupQuizAndSession(3); // Register three players
    playerIds = setup.playerIds;

    requestSendChat(playerIds[0], { messageBody: 'hi everyone!' });
    expect(requestViewChats(playerIds[0])).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: playerIds[0],
              playerName: 'person1',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
    requestSendChat(playerIds[1], { messageBody: 'hey player1, how are we all?' });
    expect(requestViewChats(playerIds[1])).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: playerIds[0],
              playerName: 'person1',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'hey player1, how are we all?',
              playerId: playerIds[1],
              playerName: 'person2',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
    requestSendChat(playerIds[2], { messageBody: 'fantastic' });
    expect(requestViewChats(playerIds[2])).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          messages: [
            {
              messageBody: 'hi everyone!',
              playerId: playerIds[0],
              playerName: 'person1',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'hey player1, how are we all?',
              playerId: playerIds[1],
              playerName: 'person2',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'fantastic',
              playerId: playerIds[2],
              playerName: 'person3',
              timeSent: expect.any(Number)
            }
          ],
        }
      }
    );
  });
});
