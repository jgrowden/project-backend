/**
 * Reset the state of the application back to the start.
 */

import { setData, getTimeoutData, setTimeoutData } from './dataStore';

function clear() {
  const data = getTimeoutData();
  for (const thing of data) {
    clearTimeout(thing.timeoutId);
  }
  setTimeoutData([]);

  setData({
    users: [],
    quizzes: [],
    deletedQuizzes: []
  });
  return {};
}

export { clear };
