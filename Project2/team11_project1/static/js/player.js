// player.js
/**
 * NAME: Battleship - EECS581 Project 2 - player.js
 * DESCRIPTION: Defines the Player and Ship classes, handling player actions,
 *              ship placement, and attack responses for the battleship game.
 * INPUT: Parameters for player actions and attack coordinates.
 * OUTPUT: N/A
 * SOURCES: ChatGPT
 * AUTHORS: Chris Harvey, Sam Muehlebach, Kaitlyn Clements, Lizzie Soltis,
 *          Taylor Slade, Aaditi Chinawalkar
 * DATE CREATED: 9/13/24
 */

class Player { //class representing each player
    constructor(id) {
        this.id = id; //player id (player 1 or 2)
        this.ships = []; // array used to store the ships
        this.shipsLeft = 0; //tracking number of ships not sunken
        this.board = Array.from({ length: 10 }, () => Array(10).fill(0)); // the 10x10 board will be initialized to 0 representing empty board
    }

    // add a ship to the player's fleet
    addShip(length, coordinates) { 
        this.ships.push({ length, coordinates }); //adding ship with length and coordinates
        this.shipsLeft++; //increment number of ships left

        coordinates.forEach(coord => { //marking ships position on board
            const colLetter = coord.match(/[A-J]/i)[0].toUpperCase(); //extract coordinate to uppercase
            const rowStr = coord.match(/\d+/)[0]; //extract number from coordinate
            const col = colLetter.charCodeAt(0) - 65; // convert letters to integer
            const row = parseInt(rowStr) - 1; // convert row number to zero based index
            this.board[row][col] = 1; // set board cell to 1 to show ship is occupying position
        });
    }

    
    receiveAttack(coord) { // method to process attack
        const colLetter = coord.match(/[A-J]/i)[0].toUpperCase(); // convert letter of coordincate to uppercase
        const rowStr = coord.match(/\d+/)[0]; //extract number from coordinate
        const col = colLetter.charCodeAt(0) - 65; // convert letter to corresponding column value
        const row = parseInt(rowStr) - 1; // convert number to zero based row index

        if (this.board[row][col] === 1) { //check if attack hits a ship

            this.board[row][col] = 2; // 2 represents hit
            let sunk = false; // tracking if ship has sunk

            
            this.ships.forEach(ship => { //check if ship is sunk
                if (ship.coordinates.includes(coord)) { // checking if all parts of ship have been hit
                    const allHit = ship.coordinates.every(c => {
                        const cCol = c.match(/[A-J]/i)[0].toUpperCase().charCodeAt(0) - 65;
                        const cRow = parseInt(c.match(/\d+/)[0]) - 1;
                        return this.board[cRow][cCol] === 2;
                    });
                    if (allHit) { //if all parts of ship are hit, mark as sunk
                        sunk = true;
                        this.shipsLeft--; //decrement number of ships left
                        console.log(`Ship of size ${ship.length} sunk at ${coord}!`);
                    }
                }
            });

            return { hit: true, sunk }; //return result of attack
        } else if (this.board[row][col] === 0) { // if attack is miss/hits empty cell
            
            this.board[row][col] = -1; // -1 represents a miss
            return { hit: false, sunk: false };
        } else {
            
            console.log(`Already attacked ${coord}.`); // cell has been attacked already
            return { hit: false, sunk: false }; //return result of attacking a cell that has already been hit
        }
    }

    // Other player-related methods...
}

class Ship { // classs to represent individual ships
    constructor(length, coordinates) {
        this.length = length; //store length of ship 
        this.coordinates = coordinates; // Store the ship's coordinates
        this.hits = 0; // initialize number of hits the ship has taken
        this.sunk = false; //check if ship has sunk
        this.hitCoordinates = []; // Track hit coordinates to avoid double hits
    }

    hit(coord) { 
        // Check if the hit coordinate is part of the ship and hasn't been hit before
        if (this.coordinates.includes(coord) && !this.hitCoordinates.includes(coord)) {
            this.hits++; //increment number of hits on ship
            this.hitCoordinates.push(coord); // Mark this coordinate as hit
            if (this.hits === this.length) { // if number of hits = ships length, mark as sunk
                this.sunk = true; 
            }
            return { hit: true, sunk: this.sunk }; // Return both hit status and sunk status
        }
        return { hit: false, sunk: false }; // Not a hit, return false
    }
}
