/**
 * NAME: Battleship - EECS581 Project 1 - aiPlayer.js
 * DESCRIPTION: File that defines the AIPlayer class, an extension of the Player class.
 * Handles the AI behavior in the one player mode of the battleship game
 * INPUT: Parameters for various functions
 * OUTPUT: N/A
 * SOURCES: ChatGPT
 * AUTHORS: Chris Harvey, Sam Muehlebach, Kaitlyn Clements, Lizzie Soltis,
 * Taylor Slade, Aaditi Chinawalkar
 * DATE CREASTED: 9/13/24
 */


// Column and row labels defined
const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

//Extension of player class created for AI opponent
class AIPlayer extends Player {
    constructor(id, difficulty) { //identifiers for AI opponent declared
        super(id); //Calls parent class with ID
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.previousShots = new Set(); //New set of shots initialized
        this.hitsStack = []; // For Medium difficulty targeting
    }

    // Randomly place ships on the board, takes in array representing game board
    placeShipsRandomly(shipTypes) {
        shipTypes.forEach(shipLength => { //Each ship length is iterated through
            let placed = false; //variable for declaring if ship is placed
            while (!placed) { //Runs until ship is placed
                const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical'; //Randomally chooses orientation
                const row = Math.floor(Math.random() * 10); //Randomly chooses row number
                const col = Math.floor(Math.random() * 10); //Randomly choose column number
                if (this.canPlaceShip(row, col, shipLength, direction)) { //Checks if spot is within game board and/or avaliable
                    this.placeShip(row, col, shipLength, direction); //Ship is placed
                    placed = true; //Loop broken out of
                    console.log(`AI placed ship of size ${shipLength} at ${colLabels[col]}${rowLabels[row]} ${direction}`);
                    //Console log for debugging purposes
                }
            }
        });
    }

    // Check if a ship can be placed at the given position, takes in row, column, length, and direction as parameters
    canPlaceShip(row, col, length, direction) {
        console.log(`AI checking placement for ship of length ${length} at row ${row}, col ${col}, direction ${direction}`);
        //Console log for debugging purposes
        if (!this.board || !this.board[row]) { //Check if board is initialized
            console.error(`Board is not initialized correctly. row: ${row}`); //Console log for debugging purposes
            return false; //Return false indicating ship cannot be placed
        }
        if (direction === 'horizontal') { //Checks if direction is horizontal
            if (col + length > 10) { //Checks bound of horizontal placement
                console.log("Ship placement out of horizontal bounds");
                return false; //if outside of the bounds, then function returns false
            }
            for (let i = 0; i < length; i++) { //Iterates over each ship cell
                if (this.board[row][col + i] !== 0) { //checks if cell is avaliable
                    console.log(`Cell [${row}][${col + i}] is already occupied`);
                    //Console log for debugging purposes
                    return false; //if cell occupied, false is returned
                }
            }
            return true; //otherwise, ship can be placed
        } else { //If not horizontal, then the ship is vertical
            if (row + length > 10) { //Checks bound of vertical placement
                console.log("Ship placement out of vertical bounds");
                //console log for debugging purposes
                return false; //if outside of the bounds, then function returns false
            }
            for (let i = 0; i < length; i++) { //Iterates over each ship cell
                if (this.board[row + i][col] !== 0) { //checks if cell is avaliable
                    console.log(`Cell [${row + i}][${col}] is already occupied`);
                    //Console log for debugging purposes
                    return false; //if cell occupied, false is returned
                }
            }
            return true; //Otherwise ship can be placed
        }
    }

    // Places a ship on board at inputted location and orientation (direction)
    placeShip(row, col, length, direction) {
        let coordinates = []; //Array for storing ship's coordinates
        if (direction === 'horizontal') { //Checks if orientation is horizontal
            for (let i = 0; i < length; i++) { //Each ship cell is iterated through
                this.board[row][col + i] = 1; // Mark cell as occupied
                const coord = `${colLabels[col + i]}${rowLabels[row]}`; //Coordinates converted to coordinate format (ex. B5)
                coordinates.push(coord); //Coordinates added to array
            }
        } else { // if direction is vertical
            for (let i = 0; i < length; i++) { //Each ship cell is iterated through
                this.board[row + i][col] = 1; // Mark as occupied
                const coord = `${colLabels[col]}${rowLabels[row + i]}`; //Coordinates converted to coordinate format (ex. B5)
                coordinates.push(coord); //Coordinates added to array
            }
        }
        this.addShip(length, coordinates); //Add the ship to player's list of ships along with their coordinates
    }

    // Executes AI's attack based on the inputted difficulty
    generateAttack(opponent) {
        if (this.difficulty === 'easy') { //If difficulty is easy
            return this.randomAttack(); //Random attack executed
        } else if (this.difficulty === 'medium') { //If difficulty is medium
            return this.mediumAttack(); //Medium attack executed
        } else if (this.difficulty === 'hard') { //If difficulty is hard
            return this.hardAttack(opponent); // Hard attack exectued
        }
    }

    // Executes the random attack
    randomAttack() {
        let row, col; //Initializes variables for coordinates
        do {
            row = Math.floor(Math.random() * 10); //Row number randomly selected
            col = Math.floor(Math.random() * 10); //Column number randomly selected
        } while (this.previousShots.has(`${col},${row}`)); //If cell has already been attacked, a new coordinate is generated
        this.previousShots.add(`${col},${row}`); //Selected cell is added to set of previous shots
        console.log(`AI attacks ${colLabels[col]}${rowLabels[row]} (Random)`);
        //Console log for debugging purposes
        return { row, col }; //Attack coordinates returned
    }

    // Executes medium level attack
    mediumAttack() {
        while (this.hitsStack.length > 0) { //Loop runs for as long as there are cells to target
            const lastHit = this.hitsStack.pop(); //Grabs last hit coordinate from stack
            const directions = [ //Adjacent directioons defined for up, down, left, and right
                { row: lastHit.row - 1, col: lastHit.col },
                { row: lastHit.row + 1, col: lastHit.col },
                { row: lastHit.row, col: lastHit.col - 1 },
                { row: lastHit.row, col: lastHit.col + 1 }
            ];

            for (let dir of directions) { //Each direction is iterated through
                if (dir.row >= 0 && dir.row < 10 && dir.col >= 0 && dir.col < 10 &&
                    //Checks if direction is both within bounds and has yet to be attacked
                    !this.previousShots.has(`${dir.col},${dir.row}`)) {
                    this.previousShots.add(`${dir.col},${dir.row}`); //Cell is marked as attack
                    console.log(`AI attacks ${colLabels[dir.col]}${rowLabels[dir.row]} (Targeting)`);
                    //Console log for debugging purposes
                    return dir;
                }
            }
        }
        // If no hits in stack, perform random attack
        return this.randomAttack();
    }

    // Executes hard attack, taking in the opponent's ship coordinates as an input
    hardAttack(opponent) {
        for (let ship of opponent.ships) { //Each ship is iterated through
            for (let coord of ship.coordinates) { //Each ship cell is iterated through
                const matches = coord.match(/^([A-J])(\d+)$/); //Convert to coordinate format
                if (matches) { //Checks if coordinate format is valid
                    const [_, colLetter, rowStr] = matches; //column letter and row number extracted
                    const col = colLetter.charCodeAt(0) - 65; //Column letter converted to an index
                    const row = parseInt(rowStr) - 1; //Row number converted to index
                    if (!this.previousShots.has(`${col},${row}`)) { //Makes sure cell has not been attacked
                        this.previousShots.add(`${col},${row}`); //Marks cell as attacked
                        console.log(`AI attacks ${colLetter}${rowStr} (Hard)`);
                        //Console log for debugging purposes
                        return { row, col }; //Attack coordinates returned
                    }
                } else {
                    console.error(`Invalid coordinate format: ${coord}`); //Console log for debugging purposes
                }
            }
        }
        // Fallback to random attack if all ships have been hit
        return this.randomAttack();
    }

    // Overrides receiveAttack for handling Medium difficulty targeting, takes in coordinates as input
    receiveAttack(coord) {
        const result = super.receiveAttack(coord); //Calls the Player class's recieveAttack method
        if (this.difficulty === 'medium' && result.hit && !result.sunk) { //If difficulty is medium and hit didn't sink ship
            const matches = coord.match(/^([A-J])(\d+)$/); // Checks if format is valid
            if (matches) { //Checks if coordinate format is valid
                const [_, colLetter, rowStr] = matches; //Column letter and row number extracted
                const col = colLetter.charCodeAt(0) - 65; //Column letter converted to index
                const row = parseInt(rowStr) - 1; //Row number converted to index
                this.hitsStack.push({ row, col }); //Hit coordinates added to hit stack
                console.log(`AI added hit at ${coord} to hitsStack`);
                //Console log for debugging purposes
            } else {
                console.error(`Invalid coordinate format in receiveAttack: ${coord}`);
                //Console log for debugging purposes
            }
        }
        return result; //result of attack returned
    }
}
