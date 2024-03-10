/**
 * Reset the state of the application back to the start.
 */

import { getData, setData } from './dataStore.js';

function clear() {
    setData({
        users: [],
        quizzes: [],
    });
}

export { clear }