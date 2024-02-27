import { clear } from '../other.js'
import {getData, setData } from '../dataStore.js'
import { adminAuthRegister } from '../auth.js'

function test1() {
    clear();
    const userId = adminAuthRegister('go.d.usopp@gmail.com', 'sogeking', 'God', 'Usopp');
    const data = getData();
    console.log(data.users);
    console.log("Expected: email: go.d.usopp@gmail.com, password: sogeking, nameFirst: God, nameLast: Usopp");
    console.assert(userId === data.users.length);
    console.log("Test 1 Passed")
}

function test2() {
    clear();
    const userId1 = adminAuthRegister('go.d.usopp@gmail.com', 'sogeking', 'God', 'Usopp');
    const userId2 = adminAuthRegister('tonytony.chopper@gmail.com', 'racoon_dog', 'Tony Tony', 'Chopper');
    console.log(data.users[1]);
    console.log("Expected: email: tonytony.chopper@gmail.com, password: racoon_dog, nameFirst: Tony Tony, nameLast: Chopper");
    console.log(userId1, userId2);
    console.log("Test 2 Passed")
}