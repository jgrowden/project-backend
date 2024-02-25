Parameters included in function stubs include strings: {email, password, nameFirst, nameLast, name, description, oldPassword, newPassword}, and integers: {authUserId, quizId, numSuccessfulLogins, numFailedPasswordsSinceLastLogin, timeCreated, timeLastEdited}.

These were placed in arrays for either user data or quiz data. 

Additional data structures include an array userQuizzes in user data, which lists all quizzes created/owned by the user, and an ownerId number in quiz data, which associates a quiz with its owner without having to search through every user. 

```javascript
let data = {
    users: [
        user1: {
            email: "john.smith@gmail.com"
            password: "password123"
            nameFirst: "John"
            nameLast: "Smith"
            AuthUserId: 1
            numSuccessfulLogins: 1
            numFailedPasswordsSinceLastLogin: 123
            userQuizzes: [1, 2, 3]
        }
    ]
    quizzes: [
        quiz1: {
            ownerId: 1
            quizId: 1
            name: "The John Smith Test"
            description: "Tests general knowledge about John Smith."
            timeCreated: 1
            timeLastEdited: 1
            // Actual quiz data to be added in later iterations
        }
    ]
}
```
