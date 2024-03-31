/**
 * Reset the state of the application back to the start.
 */

import { setData } from './dataStore';

function clear() {
  setData({
    users: [],
    quizzes: [],
    deletedQuizzes: []
  });
  return {};
}

export { clear };
