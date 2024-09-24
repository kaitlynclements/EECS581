// player.js

class Player {
    constructor(id) {
        this.id = id;
        this.ships = []; // Array to store ships
        this.shipsLeft = 0;
        this.board = Array.from({ length: 10 }, () => Array(10).fill(0)); // 10x10 grid initialized to 0
    }

    // Method to add a ship to the player's fleet
    addShip(length, coordinates) {
        this.ships.push({ length, coordinates });
        this.shipsLeft++;

        // Mark the ship's position on the board
        coordinates.forEach(coord => {
            const colLetter = coord.match(/[A-J]/i)[0].toUpperCase();
            const rowStr = coord.match(/\d+/)[0];
            const col = colLetter.charCodeAt(0) - 65; // Convert 'A'-'J' to 0-9
            const row = parseInt(rowStr) - 1; // Convert '1'-'10' to 0-9
            this.board[row][col] = 1; // 1 represents a ship segment
        });
    }

    // Method to receive an attack
    receiveAttack(coord) {
        // Assuming coord is in format 'A1', 'B5', etc.
        const colLetter = coord.match(/[A-J]/i)[0].toUpperCase();
        const rowStr = coord.match(/\d+/)[0];
        const col = colLetter.charCodeAt(0) - 65; // Convert 'A'-'J' to 0-9
        const row = parseInt(rowStr) - 1; // Convert '1'-'10' to 0-9

        if (this.board[row][col] === 1) {
            // Hit
            this.board[row][col] = 2; // 2 represents a hit
            let sunk = false;

            // Check if the ship is sunk
            this.ships.forEach(ship => {
                if (ship.coordinates.includes(coord)) {
                    const allHit = ship.coordinates.every(c => {
                        const cCol = c.match(/[A-J]/i)[0].toUpperCase().charCodeAt(0) - 65;
                        const cRow = parseInt(c.match(/\d+/)[0]) - 1;
                        return this.board[cRow][cCol] === 2;
                    });
                    if (allHit) {
                        sunk = true;
                        this.shipsLeft--;
                        console.log(`Ship of size ${ship.length} sunk at ${coord}!`);
                    }
                }
            });

            return { hit: true, sunk };
        } else if (this.board[row][col] === 0) {
            // Miss
            this.board[row][col] = -1; // -1 represents a miss
            return { hit: false, sunk: false };
        } else {
            // Already attacked this cell
            console.log(`Already attacked ${coord}.`);
            return { hit: false, sunk: false };
        }
    }

    // Other player-related methods...
}

class Ship {
    constructor(length, coordinates) {
        this.length = length;
        this.coordinates = coordinates; // Store the ship's coordinates (e.g., ['A1', 'A2'])
        this.hits = 0;
        this.sunk = false;
        this.hitCoordinates = []; // Track hit coordinates to avoid double hits
    }

    hit(coord) {
        // Check if the hit coordinate is part of the ship and hasn't been hit before
        if (this.coordinates.includes(coord) && !this.hitCoordinates.includes(coord)) {
            this.hits++;
            this.hitCoordinates.push(coord); // Mark this coordinate as hit
            if (this.hits === this.length) {
                this.sunk = true;
            }
            return { hit: true, sunk: this.sunk }; // Return both hit status and sunk status
        }
        return { hit: false, sunk: false }; // Not a hit, return false
    }
}
