/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * "name" is the first and last name concatenated with a single space between them.
 * 
 * authUserId seems to be the input number, while the user object contains just 'userId'.
 * They should be mean the same thing though.
 * 
 * @param {number} authUserId 
 * @return {{
*      user: {
    *          userId: number, 
    *          name: string,
    *          email: string, 
    *          numSuccessfulLogins: number, 
    *          numFailedPasswordsSinceLastLogin: number
    *      }
    *  }}
    */
   function adminUserDetails(authUserId) {
   
       return {
           user: {
               userId: 1,
               name: 'Hayden Smith',
               email: 'hayden.smith@unsw.edu.au',
               numSuccessfulLogins: 3,
               numFailedPasswordsSinceLastLogin: 1,
           },
       }
   }