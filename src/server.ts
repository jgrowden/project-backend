import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { getData, setData } from './dataStore';

import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserPasswordUpdate, adminUserDetailsUpdate } from './auth';
import { adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizQuestionCreate, adminQuizQuestionUpdate } from './quiz';

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
  fs.writeFileSync('./tooHakData.json', JSON.stringify(getData()));
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
  if ('error' in result) {
    return res.status(400).json(result);
  }
  save();
  res.json(result);
});

// adminAuthLogin Route
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  save();
  res.json(result);
});

// adminUserDetails Route
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  save();
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

// adminQuizList Route
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  save();
  res.json(result);
});

// adminQuizCreate route
app.post('/v1/admin/quiz/create', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const result = adminQuizCreate(token, name, description);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  save();
  res.json(result);
});

// adminUserPasswordUpdate Route
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdate(token.token, oldPassword, newPassword);
  if ('error' in result) {
    return res.status(result.statusCode).json(result);
  }
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

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, question } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizQuestionCreate(token, quizId, question);
  if ('errorCode' in result) {
    return res.status(result.errorCode).json(result.errorObject);
  }
  res.json(result);
});

// adminQuizQuestionUpdate Route
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  const result = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);
  if ('error' in result) {
    return res.status(result.statusCode).json(result);
  }
  save();
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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  load();
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  save();
  server.close(() => console.log('Shutting down server gracefully.'));
});
