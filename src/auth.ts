import { UserType, getData, setData } from './dataStore';
import validator from 'validator';

interface ErrorObject {
  error: string
}

interface ReturnAuthUserId {
  authUserId: number
}

interface AdminUserDetailsReturn {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
}

/**
 * Register a user with an email, password, and names,
 * then returns their authUserId value.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @returns {{authUserId: number}} authUserId - the user's unique identification number
 */

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string):
 ReturnAuthUserId | ErrorObject {
  const data = getData();

  // Check for duplicate email
  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'User with given email already exists' };
    }
  }
  // Check for invalid email
  if (!validator.isEmail(email)) {
    return { error: 'invalid email' };
  }
  const validChars = createValidCharsArray();
  const minNameLength = 2;
  const maxNameLength = 20;
  const minPassLength = 8;

  // Check for invalid first name
  if (!validator.isWhitelisted(nameFirst, validChars)) {
    return { error: 'Invalid first name' };
  }
  if (nameFirst.length < minNameLength || nameFirst.length > maxNameLength) {
    return { error: 'nameFirst does not satisfy length requirements' };
  }

  // Check for invalid last name
  if (!validator.isWhitelisted(nameLast, validChars)) {
    return { error: 'invalid last name' };
  }
  if (nameLast.length < minNameLength || nameLast.length > maxNameLength) {
    return { error: 'nameLast does not satisfy length requirements' };
  }

  // Check for invalid password
  if (password.length < minPassLength) {
    return { error: 'password is less than 8 characters' };
  }
  if (!hasLetterAndNumber(password)) {
    return { error: 'password must contain at least one letter and at least one number' };
  }

  data.users.push({
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: data.users.length + 1,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    previousPasswords: [],
    userQuizzes: [],
  });
  setData(data);
  return {
    authUserId: data.users.length,
  };
}

/**
 * Creates an array of chars containing only:
 *      - Lowercase letters
 *      - Uppercase letters
 *      - Space, hyphen and apostrophe
 * @returns {Array<string>}
 */

function createValidCharsArray(): string[] {
  const validChars: string[] = [];

  // add lowercase letters
  for (let i = 97; i <= 122; i++) {
    validChars.push(String.fromCharCode(i));
  }

  // add uppercase letters
  for (let i = 65; i <= 90; i++) {
    validChars.push(String.fromCharCode(i));
  }
  validChars.push(' ', '-', '\'');

  return validChars;
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
 * Given a registered user's email and password,
 * returns their authUserId value.
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 *
 * @returns {{authUserId: number}} authUserId - the user's unique identification number
 */
export function adminAuthLogin(email: string, password: string): ReturnAuthUserId | ErrorObject {
  const data = getData();
  const userExists = data.users.find(user => user.email === email);
  if (!userExists) {
    return { error: 'user doesn\'t exist' };
  }
  if (userExists.password !== password) {
    userExists.numFailedPasswordsSinceLastLogin++;
    return { error: 'incorrect password' };
  }
  userExists.numFailedPasswordsSinceLastLogin = 0;
  userExists.numSuccessfulLogins++;
  setData(data);
  return {
    authUserId: userExists.authUserId,
  };
}

/**
 * Given an admin user's authUserId, return details about the user.
 *
 * 'name' is the first and last name concatenated with a single space between them.
 *
 * Note: authUserId seems to be the input number, while the user object contains
 * just 'userId'. They should be mean the same thing though.
 *
 * @param {number} authUserId - unique identifier for user
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

export function adminUserDetails(authUserId: number): AdminUserDetailsReturn | ErrorObject {
  if (typeof authUserId !== 'number') {
    return { error: 'Invalid User ID Provided' };
  }

  const data = getData();
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      return {
        user: {
          userId: user.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
        },
      };
    }
  }

  return {
    error: 'User ID not found',
  };
}

/**
 * Given an admin user's authUserId and a set of properties,
 *  update the properties of this logged in admin user.
 *
 * @param {number} authUserId - unique identifier for user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {} - an empty object
*/
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): ErrorObject | Record<string, never> {
  if (typeof authUserId !== 'number') {
    return { error: 'Invalid ID' };
  }
  if (validator.isEmail(email) === false) {
    return { error: 'Invalid email' };
  }

  // name length check
  if (nameFirst.length < 2) {
    return { error: 'Names should be 2 or more characters' };
  }
  if (nameFirst.length > 20) {
    return { error: 'Names should be 20 or less characters' };
  }
  if (nameLast.length < 2) {
    return { error: 'Names should be 2 or more characters' };
  }
  if (nameLast.length > 20) {
    return { error: 'Names should be 20 or less characters' };
  }

  const validChars = createValidCharsArray();

  // Check name validity
  if (validator.isWhitelisted(nameFirst, validChars) === false) {
    return { error: 'Invalid first name' };
  }
  if (validator.isWhitelisted(nameLast, validChars) === false) {
    return { error: 'Invalid last name' };
  }

  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return { error: 'Email already registered' };
    }
  }

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.email = email;
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      setData(data);
      return {};
    }
  }

  return { error: 'User ID not found' };
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 *
 * @param {number} authUserId - unique identifier for user
 * @param {string} oldPassword - user's old password
 * @param {string} newPassword - user's new password
 *
 * @return {} - an empty object
*/

export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): ErrorObject | Record<string, never> {
  const data = getData();

  // check for valid authUserId
  if (typeof authUserId !== 'number') {
    return { error: 'Invalid ID' };
  }

  // check authUserId exists
  let user: UserType;
  let authUserIdValid = false;
  for (user of data.users) {
    if (user.authUserId === authUserId) {
      authUserIdValid = true;
      break;
    }
  }
  if (authUserIdValid === false) {
    return { error: 'User ID not found' };
  }

  // check oldPassword is correct
  if (oldPassword !== user.password) {
    return { error: 'Old password is not correct' };
  }
  // check oldPassword and newPassword match exactly
  if (oldPassword === newPassword) {
    return { error: 'New password is the same as old password' };
  }

  // check newPassword has not previously been used
  for (const prevPassword of user.previousPasswords) {
    if (prevPassword === newPassword) {
      return { error: 'Password has been used before' };
    }
  }

  // check newPassword is at least 8 characters
  if (newPassword.length < 8) {
    return { error: 'Password is less than 8 characters' };
  }

  // check newPassword is at least 1 letter and 1 number
  if (!hasLetterAndNumber(newPassword)) {
    return { error: 'Password must contain at least one letter and at least one number' };
  }

  // update password if no errors
  user.password = newPassword;
  user.previousPasswords.push(oldPassword);

  setData(data);

  return {};
}
