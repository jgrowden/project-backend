// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

export interface UserType {
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  authUserId: number;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  previousPasswords: string[];
  userQuizzes: number[];
  sessions: string[];
}

export interface QuizType {
  ownerId?: number;
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions?: number;
  questions?: QuestionType[];
  duration?: number;
  thumbnailUrl?: string;
  quizSessions?: QuizSessionType[];
}

export interface AnswerType {
  answerId?: number;
  answer: string;
  colour?: string;
  correct: boolean;
}

export interface QuestionType {
  questionId?: number;
  question: string;
  duration: number;
  thumbnailUrl?: string;
  points: number;
  answers: AnswerType[];
  // Below are for use in quiz sessions
  playersCorrectList?: string[];
  averageAnswerTime?: number;
  percentCorrect?: number;
}

export interface QuizSessionType {
  state: string;
  atQuestion: number;
  players: PlayerType[];
  quizSessionId: number;
  autoStartNum: number;
  messages: MessageType[];
  metaData: QuizType;
}

export interface PlayerType {
  playerName: string;
  playerId: number;
}

export interface MessageType {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}
export interface TokenType {
  token: string;
}

export interface DataType {
  users: UserType[];
  quizzes: QuizType[];
  deletedQuizzes: QuizType[];
}

let data: DataType = {
  users: [],
  quizzes: [],
  deletedQuizzes: []
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataType) {
  data = newData;
}
