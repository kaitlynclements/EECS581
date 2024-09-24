// game.js

document.addEventListener("DOMContentLoaded", function () {
    // Define column and row labels
    const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    // Game state variables
    let hasFired = false;
    let isAttackPhase = false;
    let gameMode = 'two-player'; // Default mode
    let aiDifficulty = 'easy'; // Default AI difficulty
    let turn = 1; // 1 for Player 1, 2 for Player 2 or AI

    // Players
    let player1 = new Player(1);
    let player2 = new Player(2); // For two-player mode
    let aiPlayer = null; // For single-player mode

    // Ship placement variables
    let numShips = 0;
    let shipsToPlace = [];
    let currentShipIndex = 0;
    let p2PlaceShips = false;

    // Accessing DOM elements
    const modeSelectionDiv = document.getElementById('mode-selection');
    const aiDifficultyDiv = document.getElementById('ai-difficulty');
    const startGamePrompt = document.getElementById('start-game-prompt');
    const startGameButton = document.getElementById('start-game-button');
    const onePlayerButton = document.getElementById('one-player');
    const twoPlayerButton = document.getElementById('two-player');
    const difficultyButtons = document.querySelectorAll('.difficulty');

    const controlsDiv = document.getElementById('controls');
    const shipConfirmButton = document.getElementById('shipConfirm');
    const shipLengthSelect = document.getElementById('ship-length');
    const shipPlacementStatus = document.getElementById('ship-placement-status');
    const placeShipButton = document.getElementById('place-ship');
    const nextPlayerPlaceShipButton = document.getElementById('next-player-place-ship');
    const startAttackButton = document.getElementById('start-game');

    const scoreboardDiv = document.getElementById('scoreboard');
    const p1HitsSpan = document.getElementById('p1-hits');
    const p1MissSpan = document.getElementById('p1-miss');
    const p1ShipsLeftSpan = document.getElementById('p1-ships-left');
    const p2HitsSpan = document.getElementById('p2-hits');
    const p2MissSpan = document.getElementById('p2-miss');
    const p2ShipsLeftSpan = document.getElementById('p2-ships-left');
    const opponentName = document.getElementById('opponent-name');

    const endTurnButton = document.getElementById('end-turn');
    const passScreen = document.getElementById('pass-screen');
    const passButton = document.getElementById('pass');
    const gameStateLabel = document.getElementById('game-state');

    const winModal = document.getElementById("win-modal");
    const winnerMessage = document.getElementById("winner-message");
    const playAgainButton = document.getElementById("play-again-button");

    let boards = []; // Use 'let' to allow reassignment

    // Function to attach event listeners to boards
    function attachAttackEventListeners() {
        boards.forEach(board => {
            board.addEventListener("click", handleAttackClick);
        });
    }

    // Named function for handling attack clicks
    function handleAttackClick(event) {
        if (!isAttackPhase || hasFired) {
            console.log("Attack phase not active or already fired.");
            return;
        }
        if (!event.target.classList.contains("cell")) {
            console.log("Clicked element is not a cell.");
            return;
        }

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const coord = `${colLabels[col]}${rowLabels[row]}`;

        console.log(`Player ${turn} is attacking ${coord}`);

        if (gameMode === 'two-player') {
            if (turn === 1) {
                // Player 1 attacking Player 2
                processAttack(player2, event.target, 'p2opponent', 'player1');
            } else if (turn === 2) {
                // Player 2 attacking Player 1
                processAttack(player1, event.target, 'p1opponent', 'player2');
            }
            hasFired = true;
            showPassScreen(); // Prompt next player to take their turn
        } else if (gameMode === 'single-player') {
            if (turn === 1) {
                // Player attacking AI
                processAttack(aiPlayer, event.target, 'p1opponent', 'player1');
                hasFired = true;
                showPassScreen(`AI is attacking...`);
                // Automatically switch to AI's turn
                switchTurn();
            }
        }
    }


    // Event Listeners for Mode Selection
    onePlayerButton.addEventListener('click', function () {
        gameMode = 'single-player';
        modeSelectionDiv.style.display = 'none';
        aiDifficultyDiv.style.display = 'block';
        console.log("Selected One Player Mode");
    });

    twoPlayerButton.addEventListener('click', function () {
        gameMode = 'two-player';
        modeSelectionDiv.style.display = 'none';
        startGamePrompt.style.display = 'block';
        console.log("Selected Two Player Mode");
    });

    // Event Listeners for AI Difficulty Selection
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function () {
            aiDifficulty = this.getAttribute('data-level');
            aiDifficultyDiv.style.display = 'none';
            startGamePrompt.style.display = 'block';
            console.log(`Selected AI Difficulty: ${aiDifficulty}`);
        });
    });

    // Event Listener to start the game after mode selection
    startGameButton.addEventListener("click", function () {
        startGamePrompt.style.display = 'none';
        controlsDiv.style.display = 'block';
        gameStateLabel.innerText = "Ship Count";
        console.log("Started Ship Placement");
    });

    // Event Listener to confirm ship placement
    shipConfirmButton.addEventListener("click", function () {
        gameStateLabel.innerText = (gameMode === 'two-player' && p2PlaceShips) ? "Player 2's Turn" : "Player 1's Turn";
        console.log("Confirmed Ship Placement");

        numShips = parseInt(shipLengthSelect.value);
        // Hide ship length selection
        shipConfirmButton.style.display = "none";
        shipLengthSelect.style.display = "none";
        document.getElementById("ship-length-label").style.display = "none";

        // Show coordinate and direction inputs
        document.getElementById("start-coord").style.display = "inline";
        document.getElementById("start-coord-label").style.display = "inline";
        document.getElementById("direction").style.display = "inline";
        document.getElementById("direction-label").style.display = "inline";

        // Show place ship buttons
        placeShipButton.style.display = "inline";
        nextPlayerPlaceShipButton.style.display = "inline";

        // Initialize ships to place (1x1 up to 1xN)
        shipsToPlace = [];
        for (let i = 1; i <= numShips; i++) {
            shipsToPlace.push(i);
        }

        // Reset current ship index
        currentShipIndex = 0;

        // Update ship placement status
        updateShipPlacementStatus();
    });

    // Function to update ship placement status
    function updateShipPlacementStatus() {
        if (currentShipIndex < shipsToPlace.length) {
            shipPlacementStatus.innerText = `Place ship of size ${shipsToPlace[currentShipIndex]}`;
            console.log(`Placing ship of size ${shipsToPlace[currentShipIndex]}`);
        } else {
            shipPlacementStatus.innerText = "All ships placed!";
            nextPlayerPlaceShipButton.disabled = false;
            placeShipButton.disabled = true;
            console.log("All ships placed");

            if (gameMode === 'two-player') {
                if (p2PlaceShips) {
                    startAttackButton.disabled = false;
                }
            } else if (gameMode === 'single-player') {
                // AI places ships automatically and start attack phase
                aiPlayer = new AIPlayer(2, aiDifficulty);
                aiPlayer.placeShipsRandomly(shipsToPlace);
                console.log("AI has placed its ships");
                startAttackPhase();
            }
        }
    }

    // Event Listener for placing ships
    placeShipButton.addEventListener("click", function () {
        const shipLength = shipsToPlace[currentShipIndex];
        const startCoord = document.getElementById("start-coord").value.toUpperCase();
        const direction = document.getElementById("direction").value;

        console.log(`Attempting to place ship of size ${shipLength} at ${startCoord} facing ${direction}`);

        // Validate coordinate input
        const regex = /^([A-J])(10|[1-9])$/;
        if (!regex.test(startCoord)) {
            alert("Invalid coordinate format. Please enter a letter (A-J) followed by a number (1-10).");
            console.log("Invalid coordinate format");
            return;
        }

        const colLetter = startCoord.match(/[A-J]/)[0];
        const rowStr = startCoord.match(/\d+/)[0];
        const col = colLabels.indexOf(colLetter);
        const row = parseInt(rowStr) - 1;

        // Check if the ship fits within the grid
        if (!canPlaceShip(row, col, shipLength, direction)) {
            alert("Ship cannot be placed at this location.");
            console.log("Ship cannot be placed at this location");
            return;
        }

        // Place the ship
        placeShip(row, col, shipLength, direction);
        currentShipIndex++;
        console.log(`Placed ship of size ${shipLength} at ${startCoord} facing ${direction}`);
        updateShipPlacementStatus();
    });

    // Function to check if a ship can be placed on the board
    function canPlaceShip(row, col, length, direction) {
        if (direction === "horizontal") {
            if (col + length > 10) return false;
            for (let i = 0; i < length; i++) {
                const currentCoord = `${colLabels[col + i]}${row + 1}`;
                if (gameMode === 'two-player' && p2PlaceShips) {
                    if (player2.ships.some(ship => ship.coordinates.includes(currentCoord))) {
                        return false;
                    }
                } else {
                    if (player1.ships.some(ship => ship.coordinates.includes(currentCoord))) {
                        return false;
                    }
                }
            }
        } else if (direction === "vertical") {
            if (row + length > 10) return false;
            for (let i = 0; i < length; i++) {
                const currentCoord = `${colLabels[col]}${row + 1 + i}`;
                if (gameMode === 'two-player' && p2PlaceShips) {
                    if (player2.ships.some(ship => ship.coordinates.includes(currentCoord))) {
                        return false;
                    }
                } else {
                    if (player1.ships.some(ship => ship.coordinates.includes(currentCoord))) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Function to place a ship on the board
    function placeShip(row, col, length, direction) {
        let boardId = (gameMode === 'two-player' && p2PlaceShips) ? "p2self" : "p1self";
        const board = document.getElementById(boardId);
        let coordinates = [];

        for (let i = 0; i < length; i++) {
            const currentRow = direction === "horizontal" ? row : row + i;
            const currentCol = direction === "horizontal" ? col + i : col;

            const cell = board.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (cell) {
                cell.classList.add("placed");
            }

            const coord = `${colLabels[currentCol]}${rowLabels[currentRow]}`;
            coordinates.push(coord);
        }

        if (gameMode === 'two-player' && p2PlaceShips) {
            player2.addShip(length, coordinates);
        } else {
            player1.addShip(length, coordinates);
        }
    }

    // Event Listener to switch to Player 2 or handle Single-Player end ship placement
    nextPlayerPlaceShipButton.addEventListener("click", function () {
        if (currentShipIndex >= shipsToPlace.length) {
            if (gameMode === 'two-player') {
                // Switch to Player 2
                p2PlaceShips = true;
                currentShipIndex = 0;
                gameStateLabel.innerText = "Player 2's Turn";
                console.log("Switching to Player 2 for ship placement");

                document.getElementById("p1self").style.display = "none";
                document.getElementById("p1opponent").style.display = "none";

                document.getElementById("p2self").style.display = "grid";
                document.getElementById("p2opponent").style.display = "grid";

                document.getElementById("start-coord").value = "";
                placeShipButton.disabled = false;

                nextPlayerPlaceShipButton.style.display = "none";
                startAttackButton.style.display = "inline";
                updateShipPlacementStatus();
            }
            // In Single-Player mode, AI already placed ships in updateShipPlacementStatus()
        }
    });

    // Event Listener to start the attack phase
    startAttackButton.addEventListener("click", function () {
        turn = 1;
        isAttackPhase = true;
        hidePassScreen(); // Initially hide pass screen
        console.log("Attack Phase Started");

        // Initialize scoreboard
        scoreboardDiv.style.display = "inline";
        endTurnButton.style.display = (gameMode === 'two-player') ? "block" : "none";

        // Set ships left
        p1ShipsLeftSpan.innerText = player1.shipsLeft;
        if (gameMode === 'two-player') {
            p2ShipsLeftSpan.innerText = player2.shipsLeft;
            opponentName.innerText = "Player 2";
            boards = [
                document.getElementById("p1opponent"),
                document.getElementById("p2opponent"),
            ];
        } else if (gameMode === 'single-player') {
            p2ShipsLeftSpan.innerText = aiPlayer.shipsLeft;
            opponentName.innerText = "AI";
            boards = [
                document.getElementById("p1opponent"), // AI's board
            ];
        }

        // Attach event listeners to the assigned boards
        attachAttackEventListeners();

        // Hide controls and adjust board displays
        controlsDiv.style.display = "none";
        if (gameMode === 'two-player') {
            document.getElementById("p2self").style.display = "none";
            document.getElementById("p2opponent").style.display = "none";
            document.getElementById("p1self").style.display = "grid";
            document.getElementById("p1opponent").style.display = "grid";
        } else if (gameMode === 'single-player') {
            document.getElementById("p2self").style.display = "none";
            document.getElementById("p2opponent").style.display = "none";
            document.getElementById("p1self").style.display = "grid";
            document.getElementById("p1opponent").style.display = "grid";
        }

        gameStateLabel.innerText = "Player 1's Turn";
    });

    // Event Listener for swapping turns
    endTurnButton.addEventListener("click", function () {
        if (!hasFired) {
            alert("You haven't fired your shot yet!");
            console.log("Player tried to end turn without firing");
            return;
        }
        switchTurn();
        hasFired = false;
    });

    // Function to switch turns
    function switchTurn() {
        if (gameMode === 'two-player') {
            if (turn === 1) {
                turn = 2;
                gameStateLabel.innerText = "Player 2's Turn";
                showPassScreen(`Pass to Player 2`);
                console.log("Switched turn to Player 2");
            } else {
                turn = 1;
                gameStateLabel.innerText = "Player 1's Turn";
                showPassScreen(`Pass to Player 1`);
                console.log("Switched turn to Player 1");
            }
        } else if (gameMode === 'single-player') {
            if (turn === 1) {
                turn = 2; // AI's turn
                gameStateLabel.innerText = "AI's Turn";
                showPassScreen(`AI is attacking...`);
                console.log("AI's Turn");
                aiTakeTurn();
            } else {
                turn = 1; // Player's turn
                gameStateLabel.innerText = "Player 1's Turn";
                showPassScreen(`Pass to Player 1`);
                console.log("Player's Turn");
            }
        }
    }

    // Function to show the pass screen with a message
    function showPassScreen(message) {
        if (message) {
            passScreen.children[0].innerText = message;
        }
        passScreen.style.display = 'flex';
    }

    // Function to hide the pass screen
    function hidePassScreen() {
        passScreen.style.display = 'none';
    }

    // Function to process an attack
    function processAttack(targetPlayer, cell, targetId, attackerId) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const coord = `${colLabels[col]}${rowLabels[row]}`;

        console.log(`Processing attack on ${coord} by ${attackerId}`);

        // Ensure the targetPlayer and its receiveAttack method exist
        if (!targetPlayer || typeof targetPlayer.receiveAttack !== 'function') {
            console.error(`Invalid target player or receiveAttack function not defined.`);
            return;
        }

        let hitResult = targetPlayer.receiveAttack(coord);
        if (!hitResult) {
            console.error(`receiveAttack did not return a valid result for ${coord}.`);
            return;
        }

        if (hitResult.hit) {
            cell.classList.add("hit");
            const opponentSelfBoard = document.getElementById(`${targetId}`);
            if (opponentSelfBoard) {
                const targetCell = opponentSelfBoard.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (targetCell) {
                    targetCell.classList.add("hit-self");
                } else {
                    console.error(`Target cell not found: row ${row}, col ${col}`);
                }
            } else {
                console.error(`Opponent's self board not found: ID ${targetId}`);
            }

            console.log(`${attackerId} hit at ${coord}`);

            if (hitResult.sunk) {
                // Remove the following line to prevent double decrementing
                // targetPlayer.shipsLeft--;

                // Correctly update the ships-left count in the scoreboard
                const shipsLeftId = targetPlayer.id === 1 ? 'p1-ships-left' : 'p2-ships-left';
                const shipsLeftElement = document.getElementById(`${shipsLeftId}`);
                if (shipsLeftElement) {
                    shipsLeftElement.innerText = targetPlayer.shipsLeft;
                } else {
                    console.error(`Ships-left element not found: ID ${shipsLeftId}`);
                }

                console.log(`${attackerId} sunk a ship at ${coord}`);
                checkWin();
            }

            if (attackerId === 'player1') {
                p1HitsSpan.innerText = parseInt(p1HitsSpan.innerText) + 1;
            } else if (attackerId === 'AI') {
                p2HitsSpan.innerText = parseInt(p2HitsSpan.innerText) + 1;
            }
        } else {
            cell.classList.add("miss");
            const opponentSelfBoard = document.getElementById(`${targetId}`);
            if (opponentSelfBoard) {
                const targetCell = opponentSelfBoard.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (targetCell) {
                    targetCell.classList.add("miss-self");
                } else {
                    console.error(`Target cell not found: row ${row}, col ${col}`);
                }
            } else {
                console.error(`Opponent's self board not found: ID ${targetId}`);
            }

            console.log(`${attackerId} missed at ${coord}`);

            if (attackerId === 'player1') {
                p1MissSpan.innerText = parseInt(p1MissSpan.innerText) + 1;
            } else if (attackerId === 'AI') {
                p2MissSpan.innerText = parseInt(p2MissSpan.innerText) + 1;
            }
        }
    }


   // Function to handle AI's turn
    function aiTakeTurn() {
        if (!aiPlayer) {
            console.error("AI player is not initialized.");
            hidePassScreen();
            return;
        }

        // AI generates attack based on difficulty
        let attackCoords = aiPlayer.generateAttack(player1);

        console.log(`AI is attacking ${colLabels[attackCoords.col]}${rowLabels[attackCoords.row]}`);

        // Simulate attack delay
        setTimeout(() => {
            let row = attackCoords.row;
            let col = attackCoords.col;
            let coord = `${colLabels[col]}${rowLabels[row]}`;
            let cell = document.getElementById("p1self").querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

            if (!cell) {
                console.error(`Cell not found: row ${row}, col ${col}`);
                hidePassScreen();
                return;
            }

            // Process AI's attack using processAttack
            processAttack(player1, cell, 'p1opponent', 'AI');

            // Update game state
            gameStateLabel.innerText = "Player 1's Turn";
            hidePassScreen();

            // Reset hasFired to allow Player 1 to attack again
            hasFired = false;

            // Reset turn back to Player 1
            turn = 1;
        }, 1000); // 1-second delay for better UX
    }


    // Function to check win condition
    function checkWin() {
        if (gameMode === 'two-player') {
            if (player2.shipsLeft === 0) {
                declareWinner('Player 1');
            } else if (player1.shipsLeft === 0) {
                declareWinner('Player 2');
            }
        } else if (gameMode === 'single-player') {
            if (aiPlayer && aiPlayer.shipsLeft === 0) {
                declareWinner('Player');
            } else if (player1.shipsLeft === 0) {
                declareWinner('AI');
            }
        }
    }

        f// Function to hide all game boards
    function hideAllBoards() {
        const boardIds = ["p1self", "p1opponent", "p2self", "p2opponent"];
        boardIds.forEach(id => {
            const board = document.getElementById(id);
            if (board) {
                board.style.display = "none";
            } else {
                console.error(`Board element not found: ID ${id}`);
            }
        });
    }

    // Function to hide the scoreboard and game state label
    function hideUIElements() {
        const scoreboard = document.getElementById("scoreboard");
        const gameState = document.getElementById("game-state");

        if (scoreboard) {
            scoreboard.style.display = "none";
        } else {
            console.error("Scoreboard element not found: ID 'scoreboard'");
        }

        if (gameState) {
            gameState.style.display = "none";
        } else {
            console.error("Game state element not found: ID 'game-state'");
        }
    }


    // Function to declare the winner
    function declareWinner(winner) {
        // Play sounds and animations
        // Example:
        // startFireworks();
        // playVictorySound();
    
        console.log(`${winner} wins the game!`);
    
        // Hide all game boards
        hideAllBoards();
    
        // Hide the scoreboard and game state label
        hideUIElements();
    
        // Show the winner modal
        showWinnerModal(winner);
    }
    // Winner screen
    function showWinnerModal(winner) {
        winnerMessage.innerText = `${winner} WINS!`;
        winModal.style.display = "flex";  // Show the modal
    }

    playAgainButton.addEventListener("click", function () {
        location.reload();  // Refresh the page to start over
    });

    // Function to handle pass button
    passButton.addEventListener('click', function () {
        passScreen.style.display = 'none';
        if (gameMode === 'two-player') {
            // No additional action needed; the next player can take their turn
            console.log("Pass to next player");
        }
    });

    // Placeholder functions for animations and sounds
    function playRandomHitSound() {
        // Implement your hit sound logic here
        // Example:
        // const hitSound = new Audio('/static/sounds/hit.mp3');
        // hitSound.play();
    }

    function playRandomMissSound() {
        // Implement your miss sound logic here
        // Example:
        // const missSound = new Audio('/static/sounds/miss.mp3');
        // missSound.play();
    }

    // Function to start the attack phase (called after AI places ships)
    function startAttackPhase() {
        turn = 1;
        isAttackPhase = true;
        hidePassScreen(); // Initially hide pass screen
        console.log("Attack Phase Started");
    
        // Initialize scoreboard
        scoreboardDiv.style.display = "inline";
        endTurnButton.style.display = (gameMode === 'two-player') ? "block" : "none";
    
        // Set ships left
        p1ShipsLeftSpan.innerText = player1.shipsLeft;
        if (gameMode === 'two-player') {
            p2ShipsLeftSpan.innerText = player2.shipsLeft;
            opponentName.innerText = "Player 2";
            boards = [
                document.getElementById("p1opponent"),
                document.getElementById("p2opponent"),
            ];
        } else if (gameMode === 'single-player') {
            p2ShipsLeftSpan.innerText = aiPlayer.shipsLeft;
            opponentName.innerText = "AI";
            boards = [
                document.getElementById("p1opponent"), // AI's board
            ];
        }
    
        // Attach event listeners to the assigned boards
        attachAttackEventListeners();
    
        // Hide controls and adjust board displays
        controlsDiv.style.display = "none";
        if (gameMode === 'two-player') {
            document.getElementById("p2self").style.display = "none";
            document.getElementById("p2opponent").style.display = "none";
            document.getElementById("p1self").style.display = "grid";
            document.getElementById("p1opponent").style.display = "grid";
        } else if (gameMode === 'single-player') {
            document.getElementById("p2self").style.display = "none";
            document.getElementById("p2opponent").style.display = "none";
            document.getElementById("p1self").style.display = "grid";
            document.getElementById("p1opponent").style.display = "grid";
        }
    
        gameStateLabel.innerText = "Player 1's Turn";
    }
});
