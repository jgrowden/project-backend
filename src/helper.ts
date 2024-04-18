import {
  getData,
  UserType,
  QuizType,
  QuestionType,
  SessionState,
  QuizSessionType,
  SessionAction,
  newState
} from './dataStore';
import fs from 'fs';

export interface ErrorObject {
  error: string;
  statusCode?: number;
}

export interface ErrorObjectWithCode {
  errorObject: ErrorObject;
  errorCode: number;
}

export interface ErrorString {
  error: string
}

export interface playerNameWithScoreAndTime {
  name: string;
  score: number;
  timeToAnswer?: number;
  rank?: number;
}

// Given a sessionId (token), return the corresponding user if it exists
export const fetchUserFromSessionId = (sessionId: string): UserType | undefined => {
  return getData().users.find(user => user.sessions.some(session => session === sessionId));
};

// Given a quizId, return the corresponding quiz (non-trash) if it exists
export const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

// Given a quizId, return the corresponding quiz (in trash) if it exists
export const fetchDeletedQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().deletedQuizzes.find(quiz => quiz.quizId === quizId);
};

// Given a quiz (non-trash) and a questionId, return the corresponding question if it exists
export const fetchQuestionFromQuestionId = (quiz: QuizType, questionId: number): QuestionType | undefined => {
  return quiz.questions.find(question => question.questionId === questionId);
};

// Given an email, return the corresponding user if it exists
export const fetchUserfromEmail = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
};

// Given a quiz sessionId, return the corresponding quiz if it exists
export const fetchQuizFromSessionId = (sessionId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.quizSessionId === sessionId));
};

// Given a quiz sessionId, return the corresponding quiz session if it exists
export const fetchSessionFromSessionId = (sessionId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.quizSessionId === sessionId));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(quizSession => quizSession.quizSessionId === sessionId);
  return session;
};

// Given a playerId, return the corresponding quiz session that player is in, if it exists
export const fetchQuizSessionFromPlayerId = (playerId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId)));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(session => session.players.some(player => player.playerId === playerId));
  return session;
};

// Generates psudorandom numbers, max 524287 unique Ids
export const hash = (i: number): number => {
  return ((((524287 * i) % 39916801) + 39916801) % 39916801);
};

// Utilises 'hash' to create a unique Id
// 'Id' is incremented upon every call to ensure uniqueness
const newId = (): number => {
  const newUserId = hash(getData().id);
  getData().id++;
  return newUserId;
};

/**
 * Function returns a new id. Currently all parameters of any function are
 * unused.
 * @returns {number}
 */
export const generateNewUserId = (): number => newId();
export const generateNewQuizId = (): number => newId();
export const generateNewPlayerId = (sessionId: number): number => newId();
export const generateNewQuestionId = (): number => newId();
export const generateQuizSessionId = (): number => newId();
export const setAnswerId = (): number => newId();

/**
 * Function generates a new player id. A player id is 5 letters followed by
 * 5 numbers: e.g. "sepkg902".
 * @returns {string}
 */
export const generateNewPlayerName = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const numbers = '0123456789'.split('');
  const playerName = [];
  let char = 0;
  for (let i = 0; i < 5; i++) {
    char = Math.floor(Math.random() * letters.length);
    playerName.push(letters[char]);
    letters.splice(char, 1);
  }
  for (let i = 0; i < 3; i++) {
    char = Math.floor(Math.random() * numbers.length);
    playerName.push(numbers[char]);
    numbers.splice(char, 1);
  }
  return playerName.join('');
};

/**
 * Function returns the current (unix) time in seconds.
 * @returns {number}
 */
export const currentTime = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Function used for iter2 error handling. Returns error object given some
 * error code and error message.
 * @param {string} errorString
 * @param {number} errorCode
 * @returns {ErrorObjectWithCode}
 */
export const returnError = (errorString: string, errorCode?: number): ErrorObjectWithCode => {
  const err: ErrorString = { error: errorString };
  if (errorCode === undefined) {
    errorCode = 400;
  }
  return {
    errorObject: err,
    errorCode: errorCode
  };
};

/**
 * Function used to check whether a given session action is valid for a
 * session state, and returns the next session state if it is valid. Returns
 * undefined if the state and action are invalid.
 * @param {SessionState} state
 * @param {SessionAction} action
 * @returns {SessionState | undefined}
 */
export const updateState = (state: SessionState, action: SessionAction): SessionState | undefined => {
  const entry = newState.find(entry => entry.state === state);
  const subEntry = entry.actions.find(subEntry => subEntry.action === action);
  if (!subEntry) return undefined;
  return subEntry.nextState;
};

/**
 * Function returns a random colour from the array of colours provided
 * @returns {string}, the name of the colour
 */
export const setRandomColour = (colours: string[]): string => {
  const colourIndex = ~~(Math.random() * colours.length);
  const colourToReturn = colours[colourIndex];
  colours.splice(colourIndex, 1);
  return colourToReturn;
};

/**
 * Function checks whether a given string is a valid thumbnail - whether
 * it ends in .jpg,.jpeg or .png (case-insensitive)
 * and starts with https:// or http://
 * @returns {boolean}
 */
export const isValidThumbnail = (thumbnail: string) => {
  if (!/\.(jpg|jpeg|png)$/i.test(thumbnail) || !/^https?:\/\//.test(thumbnail)) {
    return false;
  }
  return true;
};

/**
 * Calculates the score of each user, and returns it in an array of objects containing their
 * name and score.
 *
 * Truthfully, this is an abomination as the data required is stored in different sections of the quiz session object.
 * Here is a breakdown:
 *  - for each question
 *    - find all the players who answered correctly, save into a temporary array
 *    - sort these players by order of increasing time to answer
 *    - save these scores to another array containing each player's total score, using the formula P/N
 *  - sort the final scores array by order of decreasing score
 *
 * @param {QuizSessionType} quizSession
 * @returns {playerNameWithScoreAndTime[]}
 */
export const getUsersRankedByScore = (quizSession: QuizSessionType) => {
  const usersRankedByScore = quizSession.players.map(player => { return { name: player.playerName, score: 0 }; });
  for (const responses of quizSession.playerAnswers) {
    const playersCorrectList: playerNameWithScoreAndTime[] = [];
    const questionAnswers = quizSession.metadata.questions[responses.questionPosition - 1].answers;
    const answerIds = questionAnswers.filter(answer => answer.correct === true).map(answer => answer.answerId);
    const correctAnswers = answerIds.sort().join(',');

    for (const answer of responses.answers) {
      // compare array of correct answers with array of the player's answers (as strings)
      if (correctAnswers === answer.answerIds.sort().join(',')) {
        playersCorrectList.push({
          name: quizSession.players.find(player => player.playerId === answer.playerId).playerName,
          score: quizSession.metadata.questions[responses.questionPosition - 1].points,
          timeToAnswer: answer.answerTime - responses.questionStartTime
        });
      }
    }

    // Update the scores for each player by how quickly they answered the question correctly.
    playersCorrectList.sort((a, b) => a.timeToAnswer - b.timeToAnswer);
    const newArray = playersCorrectList.map((player, index) => {
      return {
        name: player.name,
        score: Math.round(player.score / (index + 1))
      };
    });

    for (const player of newArray) {
      usersRankedByScore.find(user => user.name === player.name).score += player.score;
    }
  }

  return usersRankedByScore.sort((a, b) => b.score - a.score);
};

/**
 * Returns the results of a question, including the questionId, the players
 * who answered correctly, the average answer time and the percent of
 * players who got the correct answer
 *
 * @param quizSession
 * @param questionPosition
 * @returns {
 *  questionId: number,
 *  playersCorrectList: string[],
 *  averageAnswerTime: number,
 *  percentCorrect: number
 * }
 */
export const getQuestionResults = (quizSession: QuizSessionType, questionPosition: number) => {
  const playersCorrectList: string[] = [];
  const questionAnswers = quizSession.metadata.questions[questionPosition - 1].answers;
  const playerAnswers = quizSession.playerAnswers[questionPosition - 1];
  const answerIds = questionAnswers.filter(answer => answer.correct === true).map(answer => answer.answerId);
  const correctAnswers = answerIds.sort().join(',');

  // find everyone who got the question right
  for (const answer of playerAnswers.answers) {
    // compare array of correct answers with array of the player's answers (as strings)
    if (correctAnswers === answer.answerIds.sort().join(',')) {
      playersCorrectList.push(quizSession.players.find(player => player.playerId === answer.playerId).playerName);
    }
  }

  // calculate average time taken
  const totalTime = playerAnswers.answers.reduce((total, answer) => total + answer.answerTime - playerAnswers.questionStartTime, 0);
  let averageTime = 0;
  if (playerAnswers.answers.length !== 0) {
    averageTime = Math.round(totalTime / playerAnswers.answers.length);
  }

  return {
    questionId: quizSession.metadata.questions[questionPosition - 1].questionId,
    playersCorrectList: playersCorrectList.sort((a, b) => a.localeCompare(b)),
    averageAnswerTime: averageTime,
    percentCorrect: Math.round(playersCorrectList.length / quizSession.players.length * 100)
  };
};

/**
 * Creates the CSV for the results of a session. Returns the path of the
 * created CSV file.
 *
 * playerCsvData is a data struct that holds temporary information.
 *
 * @param sessionId
 * @returns {
*  url: string
* }
*/

interface playerCsvData {
  name: string;
  results?: number[];
  rank?: number;
  score?: number;
}

export const writeResultsCSV = (sessionId: number) => {
  const session = fetchSessionFromSessionId(sessionId);

  const headers = ['player'];
  const playerInfo: playerCsvData[] = session.players.map(player => {
    return { name: player.playerName, results: [] };
  });

  // for each question
  for (let i = 0; i < session.playerAnswers.length; i++) {
    headers.push(`question${i + 1}score`, `question${i + 1}rank`);

    // what players got it right?
    const playersCorrectList: playerNameWithScoreAndTime[] = [];
    const correctAnswers = session.metadata.questions[i].answers
      .filter(answer => answer.correct === true).map(answer => answer.answerId).sort().join(',');
    const responses = session.playerAnswers[i];

    for (const answer of responses.answers) {
      if (correctAnswers === answer.answerIds.sort().join(',')) {
        playersCorrectList.push({
          name: session.players.find(player => player.playerId === answer.playerId).playerName,
          score: session.metadata.questions[i].points,
          timeToAnswer: answer.answerTime - responses.questionStartTime,
          rank: 0
        });
      }
    }

    // rank the players who got the question right
    playersCorrectList.sort((a, b) => a.timeToAnswer - b.timeToAnswer);
    for (let j = 0; j < playersCorrectList.length; j++) {
      if (j !== 0 && playersCorrectList[j].timeToAnswer === playersCorrectList[j - 1].timeToAnswer) {
        playersCorrectList[j].rank = playersCorrectList[j - 1].rank;
      } else {
        playersCorrectList[j].rank = j + 1;
      }
    }

    playerInfo.forEach(player => {
      const thatPlayer = playersCorrectList.find(correctPlayer => correctPlayer.name === player.name);
      if (!thatPlayer) {
        player.results.push(0, 0);
      } else {
        player.results.push(thatPlayer.score, thatPlayer.rank);
      }
    });
  }

  playerInfo.sort((a, b) => a.name.localeCompare(b.name));
  const url = `csv_results_${sessionId}.csv`;
  fs.writeFileSync(`./${url}`, headers.join(',') + '\n' + playerInfo.map(player => player.name + ',' + player.results.join(',')).join('\n'));

  return { url: url };
};
