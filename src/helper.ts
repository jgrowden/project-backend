import {
  getData,
  UserType,
  QuizType,
  QuestionType,
  SessionState,
  QuizSessionType,
  SessionAction,
  QuestionPlayerAnswersType,
  PlayerAnswerType
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
export const userWithEmailExists = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
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
  if (session === undefined) return undefined;
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

export const generateNewUserId = (): number => {
  return newId();
};

export const generateNewQuizId = (): number => {
  return newId();
};

export const generateNewPlayerId = (sessionId: number): number => {
  return newId();
};

export const generateNewPlayerName = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const playerName: string[] = [];
  let char;
  for (let i = 0; i < 5; i++) {
    char = letters.charAt(Math.floor(Math.random() * letters.length));
    if (!(playerName.includes(char))) {
      playerName.push(char);
    }
  }
  for (let i = 0; i < 3; i++) {
    char = numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (!(playerName.includes(char))) {
      playerName.push(char);
    }
  }
  return playerName.join('');
};

export const currentTime = (): number => {
  return Math.floor(Date.now() / 1000);
};

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

export const generateNewQuestionId = (): number => {
  return newId();
};

export const generateQuizSessionId = (): number => {
  return newId();
};

export const updateState = (state: SessionState, action: SessionAction): SessionState | undefined => {
  if (state === SessionState.LOBBY) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_COUNTDOWN) {
    if (action === SessionAction.SKIP_COUNTDOWN) {
      return SessionState.QUESTION_OPEN;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_OPEN) {
    if (action === SessionAction.GO_TO_ANSWER) {
      return SessionState.ANSWER_SHOW;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_CLOSE) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.GO_TO_ANSWER) {
      return SessionState.ANSWER_SHOW;
    } else if (action === SessionAction.GO_TO_FINAL_RESULTS) {
      return SessionState.FINAL_RESULTS;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.ANSWER_SHOW) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.GO_TO_FINAL_RESULTS) {
      return SessionState.FINAL_RESULTS;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.FINAL_RESULTS) {
    if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.END) {
    // do nothing;
  }
  return undefined;
};

/**
 * Function returns random colour from an array of colours
 * Pops the returned element from original array
 * @returns string
 */
export const setRandomColour = (colours: string[]): string => {
  const colourIndex = ~~(Math.random() * colours.length);
  const colourToReturn = colours[colourIndex];
  colours.splice(colourIndex, 1);
  return colourToReturn;
};

/**
 * Basic ID generation function
 * Maximum of 6 answer Id's per question
 * Collision highly unlikely
 * @returns {number}
 */
export const setAnswerId = (): number => {
  return newId();
};

export const isValidThumbnail = (thumbnail: string) => {
  if (!/\.(jpg|jpeg|png)$/i.test(thumbnail) || !/^https?:\/\//.test(thumbnail)) {
    return false;
  }
  return true;
};

/**
 * Calculates the average time for players to answer a question
 *
 * @param {QuestionPlayerAnswersType} playerAnswers
 * @returns {number} averageTime
 */
export const calculateQuestionAverageAnswerTime = (playerAnswers: QuestionPlayerAnswersType) => {
  let totalTimeTaken = 0;
  let numAnswers = 0;

  for (const answer of playerAnswers.answers) {
    totalTimeTaken += (answer.answerTime - playerAnswers.questionStartTime);
    numAnswers++;
  }

  let averageTime: number;
  if (numAnswers === 0) {
    averageTime = 0;
  } else {
    averageTime = Math.round(totalTimeTaken / numAnswers);
  }

  return averageTime;
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
  const usersRankedByScore: playerNameWithScoreAndTime[] = [];
  for (const player of quizSession.players) {
    usersRankedByScore.push({ name: player.playerName, score: 0 });
  }

  for (const questionResponses of quizSession.playerAnswers) {
    const playersCorrectList: playerNameWithScoreAndTime[] = [];
    const questionAnswersArray = quizSession.metadata.questions[questionResponses.questionPosition - 1].answers;
    const score = quizSession.metadata.questions[questionResponses.questionPosition - 1].points;

    for (const playerAnswer of questionResponses.answers) {
      let allCorrect = true;

      for (const questionAnswer of questionAnswersArray) {
        const answerFound = playerAnswer.answerIds.find(answerId => answerId === questionAnswer.answerId);
        if (answerFound === undefined && questionAnswer.correct === false) {
          // correct, player did not choose incorrect answer
        } else if (answerFound !== undefined && questionAnswer.correct === false) {
          // incorrect answer was chosen
          allCorrect = false;
        } else if (answerFound === undefined && questionAnswer.correct === true) {
          // incorrect, did not choose the correct answer
          allCorrect = false;
        } else {
          // correct, player chose the correct answer
        }
      }

      // if all answers supplied by the user match the answers of the quiz, their name is saved
      if (allCorrect === true) {
        const playerName = quizSession.players.find(player => player.playerId === playerAnswer.playerId).playerName;
        const timeToAnswer = playerAnswer.answerTime - questionResponses.questionStartTime;
        playersCorrectList.push({ name: playerName, score: score, timeToAnswer: timeToAnswer });
      }
    }

    playersCorrectList.sort(cmp);

    // according to spec, the score a player earns is P/N, where P is the question score and N
    // is the order in which the person submitted the correct answer
    let scalingFactor = 1;
    for (const player of playersCorrectList) {
      const playerToIncrement = usersRankedByScore.find(user => user.name === player.name);
      playerToIncrement.score += Math.round(score / scalingFactor);
      scalingFactor++;
    }
  }

  usersRankedByScore.sort(cmp2);

  return usersRankedByScore;
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
  const questionAnswersArray = quizSession.metadata.questions[questionPosition - 1].answers;
  const playerAnswers = quizSession.playerAnswers[questionPosition - 1];

  // for every player's answers, check that it matches the answers to the question
  for (const playerAnswer of playerAnswers.answers) {
    let allCorrect = true;

    for (const questionAnswer of questionAnswersArray) {
      const answerFound = playerAnswer.answerIds.find(answerId => answerId === questionAnswer.answerId);
      if (answerFound === undefined && questionAnswer.correct === false) {
        // correct, player did not choose incorrect answer
      } else if (answerFound !== undefined && questionAnswer.correct === false) {
        // incorrect answer was chosen
        allCorrect = false;
      } else if (answerFound === undefined && questionAnswer.correct === true) {
        // incorrect, did not choose the correct answer
        allCorrect = false;
      } else {
        // correct, player chose the correct answer
      }
    }

    // if all answers supplied by the user match the answers of the quiz, their name is saved
    if (allCorrect === true) {
      const playerName = quizSession.players.find(player => player.playerId === playerAnswer.playerId).playerName;
      playersCorrectList.push(playerName);
    }
  }

  const numPlayersCorrect = playersCorrectList.length;
  const numPlayers = quizSession.players.length;
  const percentCorrect = Math.round(numPlayersCorrect / numPlayers * 100);

  // sort playersCorrectList in increasing alphabetical order
  playersCorrectList.sort((a, b) => a.localeCompare(b));

  return {
    questionId: quizSession.metadata.questions[questionPosition - 1].questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: calculateQuestionAverageAnswerTime(playerAnswers),
    percentCorrect: percentCorrect
  };
};

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