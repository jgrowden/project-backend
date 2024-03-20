import { requestAuthRegister, requestQuizCreate, requestQuizDelete, clear, ERROR } from './wrapper';

let token: string;
let quizId: number;

beforeEach(() => {
    clear();
    const { jsonBody } = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = jsonBody.token as string;
    const { jsonBody } = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = jsonBody.quizId as number;
});

describe('Testing /v1/admin/quiz/{quizid}:', () => {
    test('Successful test.', () => {
        expect(requestQuizDelete(token, quizId)).toStrictEqual({
            statusCode: 200,
            jsonObject: {}
        });
    });
    test('Failed test: user does not exist.', () => {
        expect(requestQuizDelete(token + 'a', quizId)).toStrictEqual({
            statusCode: 400,
            jsonObject: ERROR
        });
    });
    test('Failed test: quiz does not exist.', () => {
        expect(requestQuizDelete(token, quizId + 1)).toStrictEqual({
            statusCode: 400,
            jsonObject: ERROR
        });
    });
    test('Failed test: user provided does not own quiz.', () => {
        const { jsonBody } = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
        let other_token = jsonBody.token as string;
        expect(requestQuizDelete(other_token, quizId)).toStrictEqual({
            statusCode: 400,
            jsonObject: ERROR
        });
    });
});