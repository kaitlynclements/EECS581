/**
 * NAME: TurnSystem.js 
 * DESCRIPTION: This program controls switching turns in the game of battleship with the additon of AI special shot
 * SOURCES: chatgpt 
 */

let turn = 1; //integer used to track what players turn it is
let p1 = new Player(1)  //Player with id 1
let p2 = new Player(2) //Player with id 2


function nextTurn() { //function switching to the next player
    if(turn == 1) {//change to p2's turn
        turn = 2;//turn tracker now shows p2
        document.getElementById("p1self").style.display = "none";//hide p1's boards
        document.getElementById("p1opponent").style.display = "none";

        document.getElementById("p2self").style.display = "grid";//reveal p2's boards
        document.getElementById("p2opponent").style.display = "grid";

        document.getElementById("game-state").innerText = "Player 2's Turn";//top of page now says it's p2's turn
    } else {//change to p1's turn
        turn = 1;//turn tracker to p1
        document.getElementById("p1self").style.display = "grid";//unhide p1's boards
        document.getElementById("p1opponent").style.display = "grid";

        document.getElementById("p2self").style.display = "none";//hide p2's boards
        document.getElementById("p2opponent").style.display = "none";

        document.getElementById("game-state").innerText = "Player 1's Turn";//top of page now says its p1's turn
    }

    return turn
}
