// aiPlayer.js

// Define column and row labels (same as in game.js)
const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

class AIPlayer extends Player {
    constructor(id, difficulty) {
        super(id);
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.previousShots = new Set();
        this.hitsStack = []; // For Medium difficulty targeting
    }

    // Randomly place ships on the board
    placeShipsRandomly(shipTypes) {
        shipTypes.forEach(shipLength => {
            let placed = false;
            while (!placed) {
                const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                if (this.canPlaceShip(row, col, shipLength, direction)) {
                    this.placeShip(row, col, shipLength, direction);
                    placed = true;
                    console.log(`AI placed ship of size ${shipLength} at ${colLabels[col]}${rowLabels[row]} ${direction}`);
                }
            }
        });
    }

    // Check if a ship can be placed at the given position
    canPlaceShip(row, col, length, direction) {
        console.log(`AI checking placement for ship of length ${length} at row ${row}, col ${col}, direction ${direction}`);
        if (!this.board || !this.board[row]) {
            console.error(`Board is not initialized correctly. row: ${row}`);
            return false;
        }
        if (direction === 'horizontal') {
            if (col + length > 10) {
                console.log("Ship placement out of horizontal bounds");
                return false;
            }
            for (let i = 0; i < length; i++) {
                if (this.board[row][col + i] !== 0) {
                    console.log(`Cell [${row}][${col + i}] is already occupied`);
                    return false;
                }
            }
            return true;
        } else { // vertical
            if (row + length > 10) {
                console.log("Ship placement out of vertical bounds");
                return false;
            }
            for (let i = 0; i < length; i++) {
                if (this.board[row + i][col] !== 0) {
                    console.log(`Cell [${row + i}][${col}] is already occupied`);
                    return false;
                }
            }
            return true;
        }
    }

    // Place ship on the board and update ship coordinates
    placeShip(row, col, length, direction) {
        let coordinates = [];
        if (direction === 'horizontal') {
            for (let i = 0; i < length; i++) {
                this.board[row][col + i] = 1; // Mark as occupied
                const coord = `${colLabels[col + i]}${rowLabels[row]}`;
                coordinates.push(coord);
            }
        } else { // vertical
            for (let i = 0; i < length; i++) {
                this.board[row + i][col] = 1; // Mark as occupied
                const coord = `${colLabels[col]}${rowLabels[row + i]}`;
                coordinates.push(coord);
            }
        }
        this.addShip(length, coordinates);
    }

    // Generate AI's attack based on difficulty
    generateAttack(opponent) {
        if (this.difficulty === 'easy') {
            return this.randomAttack();
        } else if (this.difficulty === 'medium') {
            return this.mediumAttack();
        } else if (this.difficulty === 'hard') {
            return this.hardAttack(opponent); // Pass the opponent for hard difficulty
        }
    }

    // Easy: Random attack
    randomAttack() {
        let row, col;
        do {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * 10);
        } while (this.previousShots.has(`${col},${row}`));
        this.previousShots.add(`${col},${row}`);
        console.log(`AI attacks ${colLabels[col]}${rowLabels[row]} (Random)`);
        return { row, col };
    }

    // Medium: Targeting logic after a hit
    mediumAttack() {
        while (this.hitsStack.length > 0) {
            const lastHit = this.hitsStack.pop();
            const directions = [
                { row: lastHit.row - 1, col: lastHit.col },
                { row: lastHit.row + 1, col: lastHit.col },
                { row: lastHit.row, col: lastHit.col - 1 },
                { row: lastHit.row, col: lastHit.col + 1 }
            ];

            for (let dir of directions) {
                if (dir.row >= 0 && dir.row < 10 && dir.col >= 0 && dir.col < 10 &&
                    !this.previousShots.has(`${dir.col},${dir.row}`)) {
                    this.previousShots.add(`${dir.col},${dir.row}`);
                    console.log(`AI attacks ${colLabels[dir.col]}${rowLabels[dir.row]} (Targeting)`);
                    return dir;
                }
            }
        }
        // If no hits in stack, perform random attack
        return this.randomAttack();
    }

    // Hard: Always hits (knows player's ship positions)
    hardAttack(opponent) {
        for (let ship of opponent.ships) {
            for (let coord of ship.coordinates) {
                const matches = coord.match(/^([A-J])(\d+)$/);
                if (matches) {
                    const [_, colLetter, rowStr] = matches;
                    const col = colLetter.charCodeAt(0) - 65;
                    const row = parseInt(rowStr) - 1;
                    if (!this.previousShots.has(`${col},${row}`)) {
                        this.previousShots.add(`${col},${row}`);
                        console.log(`AI attacks ${colLetter}${rowStr} (Hard)`);
                        return { row, col };
                    }
                } else {
                    console.error(`Invalid coordinate format: ${coord}`);
                }
            }
        }
        // Fallback to random attack if all ships have been hit
        return this.randomAttack();
    }

    // Override receiveAttack to handle Medium difficulty targeting
    receiveAttack(coord) {
        const result = super.receiveAttack(coord);
        if (this.difficulty === 'medium' && result.hit && !result.sunk) {
            const matches = coord.match(/^([A-J])(\d+)$/);
            if (matches) {
                const [_, colLetter, rowStr] = matches;
                const col = colLetter.charCodeAt(0) - 65;
                const row = parseInt(rowStr) - 1;
                this.hitsStack.push({ row, col });
                console.log(`AI added hit at ${coord} to hitsStack`);
            } else {
                console.error(`Invalid coordinate format in receiveAttack: ${coord}`);
            }
        }
        return result;
    }
}
