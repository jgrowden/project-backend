// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

interface UserType {
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

interface AnswerType {
  answer: string;
  correct: boolean;
}

interface QuestionType {
  question: string;
  duration: number;
  points: number;
  answers: AnswerType[];
}

interface TokenType {
  sessionId: number;
}

interface QuizType {
  ownerId: number;
  quizId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  questions: QuestionType[];
}

interface DataType {
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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataType) {
  data = newData;
}

export { UserType, AnswerType, QuestionType, TokenType, QuizType, DataType, getData, setData };
