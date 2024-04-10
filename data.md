Parameters included in function stubs include strings: {email, password, nameFirst, nameLast, name, description, oldPassword, newPassword}, and integers: {authUserId, quizId, numSuccessfulLogins, numFailedPasswordsSinceLastLogin, timeCreated, timeLastEdited}.

These were placed in arrays for either user data or quiz data. 

Additional data structures include an array userQuizzes in user data, which lists all quizzes created/owned by the user, and an ownerId number in quiz data, which associates a quiz with its owner without having to search through every user. 

```javascript
let data = {
  users: [
    {
      email: "john.smith@gmail.com",
      password: "password123",
      nameFirst: "John",
      nameLast: "Smith",
      authUserId: 1,
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 123,
      previousPasswords:["oldpassword123", "anotheroldpassword123"],
      userQuizzes: [1, 2, 3],
      sessions: []
    }
  ],
  quizzes: [
    {
      ownerId: 1,
      quizId: 1,
      name: "The John Smith Test",
      description: "Tests general knowledge about John Smith.",
      timeCreated: 1,
      timeLastEdited: 1,
      numQuestions: 1,
      questions: [
        {
          questionId: 123,
          question: "Who is John Smith?",
          duration: 4,
          thumbnailUrl: "http://google.com/some/image/path.jpg",
          points: 5,
          answers: [
            {
              answerId: 678,
              answer: "Nobody knows",
              colour: "red",
              correct: true
            }
          ]
        }
      ],
      duration: 60,
      thumbnailUrl: "http://google.com/some/image/path.jpg"
      quizSessions: [
        {
          state: "LOBBY",
          atQuestion: 1,
          players: [
            {
              "Hayden",
              playerId: 1
            },
            {
              "John",
              playerId: 2
            }
          ],
          quizSessionId: 1, // not returned in get session status
          autoStartNum: 3, // not returned in get session status
          messages: [ // not returned in session status
            {
              messageBody: "this is a message body",
              playerId: 2
              playerName: "John",
              timeSent: 1
            }
          ]
          metadata: { // copied from quiz info, excluding ownerId
            quizId: 1,
            name: "The John Smith Test",
            description: "Tests general knowledge about John Smith.",
            timeCreated: 1,
            timeLastEdited: 1,
            numQuestions: 1,
            questions: [
              {
                questionId: 123,
                question: "Who is John Smith?",
                duration: 4,
                thumbnailUrl: "http://google.com/some/image/path.jpg",
                points: 5,
                answers: [
                  {
                    answerId: 678,
                    answer: "Nobody knows",
                    colour: "red",
                    correct: true
                  }
                ]
                playersCorrectList: [
                  "Hayden", 
                  "John"
                ]
                averageAnswerTime: 45,
                percentCorrect: 100
              }
            ],
            duration: 60,
            thumbnailUrl: "http://google.com/some/image/path.jpg"
          }

        }
      ]
    }
  ],
  deletedQuizzes: [
    {
      ownerId: 1,
      quizId: 1,
      name: "The John Smith Test",
      description: "Tests general knowledge about John Smith.",
      timeCreated: 1,
      timeLastEdited: 1,
      numQuestions: 1,
      questions: [
        {
          questionId: 123,
          question: "Who is John Smith?",
          duration: 4,
          thumbnailUrl: "http://google.com/some/image/path.jpg",
          points: 5,
          answers: [
            {
              answerId: 678,
              answer: "Nobody knows",
              colour: "red",
              correct: true
            }
          ]
        }
      ],
      duration: 60,
      thumbnailUrl: "http://google.com/some/image/path.jpg"
      quizSessions: [
        {
          state: "END",
          atQuestion: 1,
          players: [
            {
              "Hayden",
              playerId: 1
            },
            {
              "John",
              playerId: 2
            }
          ],
          quizSessionId: 1,
          autoStartNum: 3,
          messages: [
            {
              messageBody: "this is a message body",
              playerId: 2
              playerName: "John",
              timeSent: 1
            }
          ]
          metadata: { // copied from quiz info, excluding ownerId
            quizId: 1,
            name: "The John Smith Test",
            description: "Tests general knowledge about John Smith.",
            timeCreated: 1,
            timeLastEdited: 1,
            numQuestions: 1,
            questions: [
              {
                questionId: 123,
                question: "Who is John Smith?",
                duration: 4,
                thumbnailUrl: "http://google.com/some/image/path.jpg",
                points: 5,
                answers: [
                  {
                    answerId: 678,
                    answer: "Nobody knows",
                    colour: "red",
                    correct: true
                  }
                ]
                playersCorrectList: [
                  "Hayden", 
                  "John"
                ]
                averageAnswerTime: 45,
                percentCorrect: 100
              }
            ],
            duration: 60,
            thumbnailUrl: "http://google.com/some/image/path.jpg"
          }

        }
      ]
    }
  ],
}
```
