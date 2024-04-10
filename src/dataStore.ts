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
  quizSessions?: QuizSessionType[]; // Not needed for Info
  duration?: number;
  thumbnailUrl?: string;
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
  points: number;
  answers: AnswerType[];
  thumbnailUrl?: string;
}

export interface PlayerAnswerType {
  playerName: string;
  answerTimes: number;
  answerIds: number[];
}

export interface QuestionAnswerType {
  playersCorrectList: string[];
  averageAnswerTime: number; // let total = 0; playerAnswers.reduce((total, answer) => total + answer.answerTimes, 0); averageAnswerTime = total / playerAnswers.length;
  questionPosition: number; // the question referred to by atQuestion
  percentCorrect?: number;
  questionStartTime: number;
  playerAnswers: PlayerAnswerType[];
}

export interface QuizSessionType {
  state: string;
  atQuestion: number; // 0-indexed: metadata.questions[0] is the first question 
  players: PlayerType[];
  quizSessionId: number;
  autoStartNum: number;
  messages: MessageType[];
  collectedAnswers: QuestionAnswerType[]; // stores ALL answers in a single array
  metadata: QuizType;
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

export interface TimeoutDataType {
  timeoutId: ReturnType<typeof setTimeout>;
  sesionId: number;
}

let timeoutData: TimeoutDataType[];

export enum SessionState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTIONS_OPEN = 'QUESTIONS_OPEN',
  QUESTIONS_CLOSE = 'QUESTIONS_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum SessionAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

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

export function getTimeoutData() {
  return timeoutData;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataType) {
  data = newData;
}

export function setTimeoutData(newTimeoutData: ReturnType<typeof setTimeout>[]) {
  timeoutData = newTimeoutData;
}
