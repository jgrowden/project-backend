import HTTPError from 'http-errors';
import {
    requestAuthRegister,
    requestQuizCreateV2,
    requestQuizQuestionCreateV2,
    requestQuizSessionStart,
    requestQuizSessionAnswer,
    clear
} from '../wrapper';
import {
    SessionAction,
    TokenType,
    getData
} from '../../dataStore';
import {
    adminAuthRegister
} from '../../auth';
import {
    adminQuizCreate,
    adminQuizQuestionCreate,
    AdminQuizCreateReturn
} from '../../quiz';
import {
    adminQuizSessionUpdate,
    adminQuizSessionStart,
    SessionIdType
} from '../../session';

let token: string;
let quizId: number;
let sessionId: number;
const AUTOSTARTNUM = 10;

beforeEach(() => {
    clear();
    token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
    requestQuizQuestionCreateV2(token, quizId, {
        question: 'How tall am I?',
        duration: 5,
        points: 4,
        answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }],
        thumbnailUrl: 'http://example.com/birb.jpg'
      });
    sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
});

describe('Tests for PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
    test('Success', () => {
        let action = 'NEXT_QUESTION';
        expect(requestQuizSessionAnswer(token, quizId, sessionId, action)).toStrictEqual({
            statusCode: 200,
            jsonBody: {}
        });
    });
    test('Fail: empty token', () => {
        expect(() => requestQuizSessionAnswer('', quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
    });
    test('Fail: invalid token', () => {
        expect(() => requestQuizSessionAnswer(token + 'a', quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
    });
    test('Fail: invalid ownership', () => {
        let otherToken = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
        expect(() => requestQuizSessionAnswer(otherToken, quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[403]);
    });
    test('Fail: invalid quizId', () => {
        expect(() => requestQuizSessionAnswer(token, quizId + 1, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[403]);
    });
    test('Fail: invalid sessionId', () => {
        expect(() => requestQuizSessionAnswer(token, quizId, sessionId + 1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    });
    test('Fail: non-existent action', () => {
        expect(() => requestQuizSessionAnswer(token, quizId, sessionId, 'SPAGHETTI')).toThrow(HTTPError[400]);
    });
    test('Fail: invalid action on current state', () => {
        expect(() => requestQuizSessionAnswer(token, quizId, sessionId, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    });
});