import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { getData, setData } from './dataStore';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserPasswordUpdate,
  adminUserPasswordUpdateV2,
  adminUserDetailsUpdate,
  adminAuthLogout,
  adminAuthLogoutV2,
  adminUserDetailsV2,
  adminUserDetailsUpdateV2
} from './auth';
import {
  adminQuizList,
  adminQuizListV2,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizRemoveV2,
  adminQuizInfo,
  adminQuizInfoV2,
  adminQuizNameUpdate,
  adminQuizNameUpdateV2,
  adminQuizDescriptionUpdate,
  adminQuizDescriptionUpdateV2,
  adminQuizQuestionCreate,
  adminQuizQuestionCreateV2,
  adminQuizQuestionUpdate,
  adminQuizQuestionUpdateV2,
  adminQuizQuestionMove,
  adminQuizQuestionMoveV2,
  adminQuizTrashInfo,
  adminQuizRestore,
  adminQuizRestoreV2,
  adminQuizTrashEmpty,
  adminQuizChangeOwner,
  adminQuizChangeOwnerV2,
  adminQuizQuestionDuplicate,
  adminQuizQuestionDuplicateV2,
  adminQuizQuestionDelete,
  adminQuizQuestionDeleteV2,
  adminQuizCreateV2,
  adminQuizThumbnailUpdate,
  adminQuizTrashInfoV2
} from './quiz';
import {
  adminQuizSessionInfo,
  adminQuizSessionStart,
  adminQuizSessionsView,
  adminQuizSessionPlayerJoin,
  adminQuizSessionUpdate,
  adminQuizSessionFinalResults
} from './session';
import {
  playerQuestionAnswer,
  playerQuestionPosition,
  playerQuestionResults,
  playerSendChat,
  playerStatus
} from './player';

import { clear } from './other';
// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// Load + Store functions for persistence
const load = () => {
  if (fs.existsSync('./toohakData.json')) {
    const dataFile = fs.readFileSync('./toohakData.json', { encoding: 'utf8' });
    setData(JSON.parse(dataFile));
  }
};

const save = () => {
  fs.writeFileSync('./toohakData.json', JSON.stringify(getData()));
};

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// adminAuthRegister Route
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminAuthLogin Route
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminAuthLogout Route
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminAuthLogout Route
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.get('token') as string;

  const result = adminAuthLogoutV2(token);
  save();
  res.json(result);
});

// adminUserDetails Route
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  res.json(result);
});

// adminUserDetailsV2 Route
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const result = adminUserDetailsV2(token);
  res.json(result);
});

// adminUserDetailsUpdate Route
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminUserDetailsUpdateV2 Route
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.get('token') as string;
  const result = adminUserDetailsUpdateV2(token, email, nameFirst, nameLast);
  save();
  res.json(result);
});

// adminQuizList Route
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizListV2 Route
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const result = adminQuizListV2(token);
  save();
  res.json(result);
});

// adminQuizCreate route
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const result = adminQuizCreate(token, name, description);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizCreateV2 route
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const { name, description } = req.body;
  const result = adminQuizCreateV2(token, name, description);
  save();
  res.json(result);
});

// adminUserPasswordUpdate Route
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminUserPasswordUpdateV2 Route
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const { oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdateV2(token, oldPassword, newPassword);
  save();
  res.json(result);
});

// adminQuizRemove Route
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRemove(token, quizId);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizRemoveV2 Route
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRemoveV2(token, quizId);
  save();
  res.json(result);
});

// adminQuizTrashInfo Route
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizTrashInfo(token);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizTrashInfoV2  Route
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const result = adminQuizTrashInfoV2(token);
  save();
  res.json(result);
});

// adminQuizRestore Route
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRestore(token, quizId);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizRestoreV2 Route
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRestoreV2(token, quizId);
  save();
  res.json(result);
});

// adminQuizTrashEmpty Route
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIdsString = req.query.quizIds as string;
  const quizIds = JSON.parse(quizIdsString) as number[];
  const result = adminQuizTrashEmpty(token, quizIds);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizInfo Route
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizInfo(token, quizId);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizInfoV2 Route
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizInfoV2(token, quizId);
  save();
  res.json(result);
});

// adminQuizNameUpdate Route
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;
  const result = adminQuizNameUpdate(token, quizId, name);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizNameUpdateV2 Route
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;
  const result = adminQuizNameUpdateV2(token, quizId, name);
  save();
  res.json(result);
});

// adminQuizDescriptionUpdate Route
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;
  const result = adminQuizDescriptionUpdate(token, quizId, description);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizDescriptionUpdateV2 Route
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const quizId = parseInt(req.params.quizid);
  const { description } = req.body;
  const result = adminQuizDescriptionUpdateV2(token, quizId, description);
  save();
  res.json(result);
});

// adminQuizQuestionCreate Route
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizQuestionCreate(token, quizId, questionBody);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionCreateV2 Route
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const { questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizQuestionCreateV2(token, quizId, questionBody);
  save();
  res.json(result);
});

// adminQuizQuestionTransfer Route
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizChangeOwner(token, quizId, userEmail);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionTransferV2 Route
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.get('token') as string;
  const { userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizChangeOwnerV2(token, quizId, userEmail);
  save();
  res.json(result);
});

// adminQuizQuestionUpdate Route
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  const result = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionUpdateV2 Route
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;
  const result = adminQuizQuestionUpdateV2(token, quizId, questionId, questionBody);
  save();
  res.json(result);
});

// adminQuizQuestionMove Route
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;
  const result = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionMoveV2 Route
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { newPosition } = req.body;
  const result = adminQuizQuestionMoveV2(token, quizId, questionId, newPosition);
  save();
  res.json(result);
});

// adminQuizQuestionDuplicate Route
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token } = req.body;
  const result = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionDuplicateV2 Route
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token = req.header('token') as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizQuestionDuplicateV2(token, quizId, questionId);
  save();
  res.json(result);
});

// adminQuizQuestionDelete Route
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;
  const result = adminQuizQuestionDelete(token, quizId, questionId);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminQuizQuestionDeleteV2 Route
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizQuestionDeleteV2(token, quizId, questionId);
  save();
  res.json(result);
});

// adminQuizThumbnailUpdate Route
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const { imgUrl } = req.body;
  const result = adminQuizThumbnailUpdate(token, quizId, imgUrl);
  save();
  res.json(result);
});

// adminQuizSessionStart Route
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;
  const result = adminQuizSessionStart(token, quizId, autoStartNum);
  save();
  res.json(result);
});

// adminQuizSessionUpdate Route
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const { action } = req.body;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const result = adminQuizSessionUpdate(token, quizId, sessionId, action);
  save();
  res.json(result);
});

// adminQuizSessionInfo Route
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const result = adminQuizSessionInfo(token, quizId, sessionId);
  save();
  res.json(result);
});

// adminQuizSessionsView Route
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizSessionsView(token, quizId);
  save();
  res.json(result);
});

// adminQuizSessionPlayerJoin Route
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const result = adminQuizSessionPlayerJoin(sessionId, name);
  save();
  res.json(result);
});

// adminQuizSessionFinalResults Route
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const token = req.header('token');
  const sessionId = parseInt(req.params.sessionid);
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizSessionFinalResults(token, quizId, sessionId);
  save();
  res.json(result);
});

// playerStatus Route
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const result = playerStatus(playerId);
  save();
  res.json(result);
});

// playerQuestionPosition Route
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const result = playerQuestionPosition(playerId, questionPosition);
  save();
  res.json(result);
});

// playerAnswerSubmit Route
app.put('/v1/player/:playerid/question/:questionposition/answer', (req:Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;
  const result = playerQuestionAnswer(playerId, questionPosition, answerIds);
  save();
  res.json(result);
});

// playerQuestionResults Route
app.get('/v1/player/:playerid/question/:questionposition/results', (req:Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const result = playerQuestionResults(playerId, questionPosition);
  res.json(result);
});

// playerSendChat Route
app.post('/v1/player/:playerid/chat', (req:Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  const result = playerSendChat(playerId, message);
  res.json(result);
});

// clear Route
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  save();
  res.json(result);
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  load();
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  save();
  clear();
  server.close(() => console.log('Shutting down server gracefully.'));
});
