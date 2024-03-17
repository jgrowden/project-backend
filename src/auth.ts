import { UserType, getData, setData } from './dataStore';
import validator from 'validator';

interface ErrorObject {
  error: string;
};

interface ReturnAuthUserId {
  authUserId: number;
};

interface AdminUserDetailsReturn {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
};

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
  return /[^a-zA-Z \-\']/.test(str);
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
  let duplicateEmail = data.users.find(user => user.email === email);
  if (duplicateEmail !== undefined) {
    return { error: 'User with given email already exists' };
  }

  // Check for invalid email
  if (!validator.isEmail(email)) {
    return { error: 'invalid email' };
  }

  // Check for invalid first name
  if (validName(nameFirst)) {
    return { error: 'Invalid first name' };
  }

  if (nameFirst.length < userNameMinLength || nameFirst.length > userNameMaxLength) {
    return { error: 'nameFirst does not satisfy length requirements' };
  }

  // Check for invalid last name
  if (validName(nameLast)) {
    return { error: 'invalid last name' };
  }

  if (nameLast.length < userNameMinLength || nameLast.length > userNameMaxLength) {
    return { error: 'nameLast does not satisfy length requirements' };
  }

  // Check for invalid password
  if (password.length < userPasswordMinLength) {
    return { error: 'password is less than 8 characters' };
  }

  if (!hasLetterAndNumber(password)) {
    return { error: 'password must contain at least one letter and at least one number' };
  }

  let newUserId = 0;
  const userIds = data.users.map(user => user.authUserId);
  while (userIds.includes(newUserId)) {
    newUserId++;
  }

  data.users.push({
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    authUserId: newUserId,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    previousPasswords: [],
    userQuizzes: []
  });

  return { authUserId: newUserId };
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
  const data = getData();

  const user = data.users.find(user => user.authUserId === authUserId);
  if (!user) {
    return { error: 'User ID not found' };
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
  if (validator.isEmail(email) === false) {
    return { error: 'Invalid email' };
  }

  // Check for invalid first name
  if (validName(nameFirst)) {
    return { error: 'Invalid first name' };
  }
  if (nameFirst.length < userNameMinLength || nameFirst.length > userNameMaxLength) {
    return { error: 'nameFirst does not satisfy length requirements' };
  }

  // Check for invalid last name
  if (validName(nameLast)) {
    return { error: 'invalid last name' };
  }
  if (nameLast.length < userNameMinLength || nameLast.length > userNameMaxLength) {
    return { error: 'nameLast does not satisfy length requirements' };
  }

  const data = getData();

  const duplicateEmail = data.users.find(user => user.email === email);
  if (duplicateEmail !== undefined) {
    return { error: 'Email already registered' };
  }

  const user = data.users.find(user => user.authUserId === authUserId);
  if (!user) {
    return { error: 'User ID not found' };
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  return {};
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

  // check authUserId exists
  const user = data.users.find(user => user.authUserId === authUserId);
  if (!user) {
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
  if (newPassword.length < userPasswordMinLength) {
    return { error: 'Password is less than 8 characters' };
  }

  // check newPassword is at least 1 letter and 1 number
  if (!hasLetterAndNumber(newPassword)) {
    return { error: 'Password must contain at least one letter and at least one number' };
  }

  // update password if no errors
  user.password = newPassword;
  user.previousPasswords.push(oldPassword);

  return {};
}
