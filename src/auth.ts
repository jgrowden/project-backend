import { getData, TokenType, UserType } from './dataStore';
import validator from 'validator';
import { nanoid } from 'nanoid';
import { 
  fetchUserFromSessionId, 
  userWithEmailExists, 
  generateNewUserId, 
  returnError, 
  ErrorObject, 
  ErrorObjectWithCode
} from './helper';

interface AdminUserDetailsReturn {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
}

const userNameMinLength = 2;
const userNameMaxLength = 20;
const userPasswordMinLength = 8;

/**
 * Returns true if the given string contains anything but letters,
 * hyphens, spaces, and apostrophes.
 * @param {string}
 * @returns {boolean}
 */
function validName(str: string): boolean {
  return /[^a-zA-Z '-]/.test(str);
}

/**
 * Returns true if the given string contains at least one letter
 * and at least one number. False otherwise.
 * @param {string}
 * @returns {boolean}
 */
function hasLetterAndNumber(str: string): boolean {
  return /[a-zA-Z]/.test(str) && /[0-9]/.test(str);
}

/**
 * Register a user with an email, password, and names,
 * then returns their sessionId value.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @returns {{sessionId: number}} sessionId - the user's unique identification number
 */

export function adminAuthRegister(
  email: string, 
  password: string, 
  nameFirst: string, 
  nameLast: string
): TokenType | ErrorObjectWithCode {

  const data = getData();

  // Check for duplicate email
  const duplicateEmail = userWithEmailExists(email);
  if (duplicateEmail !== undefined) {
    return returnError('User with given email already exists');
  }

  // Check for invalid email
  if (!validator.isEmail(email)) {
    return returnError('invalid email');
  }

  // Check for invalid first name
  if (validName(nameFirst)) {
    return returnError('Invalid first name');
  }

  if (nameFirst.length < userNameMinLength || nameFirst.length > userNameMaxLength) {
    return returnError('nameFirst does not satisfy length requirements');
  }

  // Check for invalid last name
  if (validName(nameLast)) {
    return returnError('invalid last name');
  }

  if (nameLast.length < userNameMinLength || nameLast.length > userNameMaxLength) {
    return returnError('nameLast does not satisfy length requirements');
  }

  // Check for invalid password
  if (password.length < userPasswordMinLength) {
    return returnError('password is less than 8 characters');
  }

  if (!hasLetterAndNumber(password)) {
    return returnError('password must contain at least one letter and at least one number');
  }

  const newUserId = generateNewUserId();
  const sessionId: string = nanoid();
  const sessions: string[] = [sessionId];

  data.users.push({
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: newUserId,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    previousPasswords: [],
    userQuizzes: [],
    sessions: sessions
  });

  return { token: sessionId };
}

/**
 * Given a registered user's email and password,
 * returns their sessionId value.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {{sessionId: string}} sessionId - the user's unique identification string
 */
export function adminAuthLogin(email: string, password: string): TokenType | ErrorObjectWithCode {
  const user = userWithEmailExists(email);
  if (!user) {
    return returnError('user doesn\'t exist');
  }

  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    return returnError('incorrect password');
  }

  const sessionId: string = nanoid();
  user.sessions.push(sessionId);
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  return { token: sessionId };
}

/**
 * Given an admin user's sessionId, log the user out from the session
 *
 * @param {string} sessionId
 * @returns {} - an empty object
 */
export function adminAuthLogout(sessionId: string): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('User ID not found', 401);
  }

  
  user.sessions = user.sessions.filter(sessions => { return sessions !== sessionId; });

  return {};
}

/**
 * Given an admin user's sessionId, return details about the user.
 *
 * 'name' is the first and last name concatenated with a single space between them.
 *
 * Note: sessionId seems to be the input number, while the user object contains
 * just 'userId'. They should be mean the same thing though.
 *
 * @param {number} sessionId - unique identifier for user
 *
 * @return {{
 *      user: {
 *          userId: number,
 *          name: string,
 *          email: string,
 *          numSuccessfulLogins: number,
 *          numFailedPasswordsSinceLastLogin: number
 *      }
 *   }} - an object containing key information about the user queried.
*/

export function adminUserDetails(sessionId: string): AdminUserDetailsReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('User ID not found', 401);
  }

  return {
    user: {
      userId: user.authUserId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * Given an admin user's sessionId and a set of properties,
 *  update the properties of this logged in admin user.
 *
 * @param {number} sessionId - unique identifier for user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {} - an empty object
*/
export function adminUserDetailsUpdate(
  sessionId: string, 
  email: string, 
  nameFirst: string, 
  nameLast: string
): ErrorObjectWithCode | Record<string, never> {

  const userToEdit = fetchUserFromSessionId(sessionId);
  if (!userToEdit) {
    return returnError('User ID not found', 401);
  }

  if (validator.isEmail(email) === false) {
    return returnError('Invalid email');
  }

  // Check for invalid first name
  if (validName(nameFirst)) {
    return returnError('Invalid first name');
  }
  if (nameFirst.length < userNameMinLength || nameFirst.length > userNameMaxLength) {
    return returnError('First name does not satisfy length requirements');
  }

  // Check for invalid last name
  if (validName(nameLast)) {
    return returnError('Invalid last name');
  }
  if (nameLast.length < userNameMinLength || nameLast.length > userNameMaxLength) {
    return returnError('Last name does not satisfy length requirements');
  }

  // get userId from sessionId
  // loop through datastore userIds. if a user has the same email and a different userId, email already registered

  let registered = getData().users.find(user => user.email === email && user.authUserId !== userToEdit.authUserId);
  if (registered !== undefined) {
    return returnError('Email already registered');
  }

  userToEdit.email = email;
  userToEdit.nameFirst = nameFirst;
  userToEdit.nameLast = nameLast;

  return {};
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 *
 * @param {number} sessionId - unique identifier for user
 * @param {string} oldPassword - user's old password
 * @param {string} newPassword - user's new password
 *
 * @return {} - an empty object
*/

export function adminUserPasswordUpdate(
  token: string, 
  oldPassword: string, 
  newPassword: string
): ErrorObjectWithCode | Record<string, never> {
  // check sessionId exists
  const user = fetchUserFromSessionId(token);
  if (!user) {
    returnError('User Id not found', 401);
  }

  // check oldPassword is correct
  if (oldPassword !== user.password) {
    return returnError('Old password is not correct');
  }

  // check oldPassword and newPassword match exactly
  if (oldPassword === newPassword) {
    return returnError('New password is the same as old password');
  }

  // check newPassword has not previously been used
  if (!user.previousPasswords.find(password => password === newPassword)) {
    return returnError('Password has been used before');
  }

  // check newPassword is at least 8 characters
  if (newPassword.length < userPasswordMinLength) {
    return returnError('Password is less than 8 characters');
  }

  // check newPassword is at least 1 letter and 1 number
  if (!hasLetterAndNumber(newPassword)) {
    return returnError('Password must contain at least one letter and at least one number');
  }

  // update password if no errors
  user.password = newPassword;
  user.previousPasswords.push(oldPassword);

  return {};
}
