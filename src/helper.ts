import {
  getData,
  UserType,
  QuizType,
  QuestionType,
  SessionState,
  QuizSessionType,
  SessionAction,
  QuestionPlayerAnswersType,
  PlayerAnswerType,
  newState
} from './dataStore';

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

interface playerNameWithScoreAndTime {
  name: string;
  score: number;
  timeToAnswer?: number;
  rank?: number;
}

/**
 *
 * @param sessionId
 * @returns
 */
export const fetchUserFromSessionId = (sessionId: string): UserType | undefined => {
  return getData().users.find(user => user.sessions.some(session => session === sessionId));
};

export const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

export const fetchDeletedQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().deletedQuizzes.find(quiz => quiz.quizId === quizId);
};

export const fetchQuestionFromQuestionId = (quiz: QuizType, questionId: number): QuestionType | undefined => {
  return quiz.questions.find(question => question.questionId === questionId);
};
export const fetchUserfromEmail = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
};

export const fetchQuizFromSessionId = (sessionId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.quizSessionId === sessionId));
};

export const fetchSessionFromSessionId = (sessionId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.quizSessionId === sessionId));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(quizSession => quizSession.quizSessionId === sessionId);
  return session;
};

export const fetchQuizSessionFromPlayerId = (playerId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId)));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(session => session.players.some(player => player.playerId === playerId));
  return session;
};

// generates psudorandom numbers, max 524287 unique Ids
export const hash = (i: number): number => {
  return ((((524287 * i) % 39916801) + 39916801) % 39916801);
};

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
 * it ends in .jpg,.jpeg or .png, and starts with https://
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
 * returns the results of a question, including the questionId, the players
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

// comparator function for getUsersRankedByScore
function cmp (a: playerNameWithScoreAndTime, b: playerNameWithScoreAndTime) {
  if (a.timeToAnswer < b.timeToAnswer) {
    return -1;
  } else if (a.timeToAnswer === b.timeToAnswer) {
    return 0;
  }
  return 1;
}

// comparator function for getUsersRankedByScore
function cmp2 (a: playerNameWithScoreAndTime, b: playerNameWithScoreAndTime) {
  if (a.score > b.score) {
    return -1;
  } else if (a.score === b.score) {
    return 0;
  }
  return 1;
}

/**
 * returns the players in an array containing their rank and score for the given question
 *
 * @param quizSession
 * @param questionPosition
 * @returns {playerNameWithScoreAndTime[]}
 *
*/
export const getUsersRankAndScoreByQuestion = ( quizSession: QuizSessionType, questionPosition: number ): playerNameWithScoreAndTime[] => {
  let players: playerNameWithScoreAndTime[];
  const correctPlayers = getQuestionResults(quizSession, questionPosition).playersCorrectList;
  const playerAnswers = quizSession.playerAnswers[questionPosition - 1];
  for (let player of quizSession.players) {
    if (correctPlayers.find(correctPlayer => correctPlayer === player.playerName)) {
      let playerAnswer: PlayerAnswerType = playerAnswers.answers.find(playerAnswer => playerAnswer.playerId === player.playerId)
      players.push({
        name: player.playerName,
        score: quizSession.metadata.questions[questionPosition - 1].points,
        timeToAnswer: playerAnswer.answerTime
      })
    } else {
      players.push({
        name: player.playerName,
        score: 0
      })
    }
  }
  players.sort(cmp);
  let scalingFactor = 1;
  for (const player of correctPlayers) {
    const playerToIncrement = players.find(user => user.name === player);
    playerToIncrement.score = Math.round(playerToIncrement.score / scalingFactor);
    scalingFactor++;
  }
  players.sort(cmp2);
  let sameRank: number = 1;
  for (const player of players) {
    if (players.indexOf(player) === 0) {
      players[0].rank = 1;
      continue;
    } else {
      let index: number = players.indexOf(player);
      if (players[index].score === players[index - 1].score) {
        players[index].rank = players[index - 1].rank;
        sameRank++;
      } else {
        players[index].rank = players[index - 1].rank + sameRank;
        sameRank = 1;
      }
    }
  }
  return players;
}