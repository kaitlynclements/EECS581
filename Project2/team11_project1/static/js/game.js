// game.js
// sources: chatgpt

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

    // Initialize special shot usage flags
    player1.specialShotUsed = false; //when true, special shot is not available and has already been used
    player2.specialShotUsed = false; //when false, special shot should be available for use

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

    let boards = []; // To be assigned based on mode

    // Access the Special Shot button
    const specialShotButton = document.getElementById('special-shot');

    // Add event listener to the Special Shot button
    specialShotButton.addEventListener("click", handleSpecialShot);

    // Function to attach event listeners to boards
    function attachAttackEventListeners() {
        boards.forEach(board => {
            board.removeEventListener("click", handleAttackClick); // Prevent multiple listeners
            board.addEventListener("click", handleAttackClick);
        });
    }

    // function for handling attack clicks on cells
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
        const coord = `${colLabels[col]}${rowLabels[row]}`; // Corrected template literal

        console.log(`Player ${turn} is attacking ${coord}`); // Corrected template literal

        if (gameMode === 'two-player') {
            if (turn === 1) {
                // Player 1 attacking Player 2
                processAttack(player2, event.target, 'p2self', 'player1');
            } else if (turn === 2) {
                // Player 2 attacking Player 1
                processAttack(player1, event.target, 'p1self', 'player2');
            }
            hasFired = true;
        } else if (gameMode === 'single-player') {
            if (turn === 1) {
                // Player attacking AI
                processAttack(aiPlayer, event.target, 'p1opponent', 'player1');
                hasFired = true;
                showPassScreen("AI is attacking...");
                // Automatically switch to AI's turn
                switchTurn();
            }
        }
    }

    // Event Listeners for Mode Selection
    onePlayerButton.addEventListener('click', function () { //if one player mode is selected
        gameMode = 'single-player';
        modeSelectionDiv.style.display = 'none';
        aiDifficultyDiv.style.display = 'block';
        console.log("Selected One Player Mode");
    });

    twoPlayerButton.addEventListener('click', function () { //if two player mode is selected
        gameMode = 'two-player';
        modeSelectionDiv.style.display = 'none';
        startGamePrompt.style.display = 'block';
        console.log("Selected Two Player Mode");
    });

    // Event Listeners for AI difficulty selection
    difficultyButtons.forEach(button => {
        button.addEventListener('click', function () {
            aiDifficulty = this.getAttribute('data-level');
            aiDifficultyDiv.style.display = 'none';
            startGamePrompt.style.display = 'block';
            console.log(`Selected AI Difficulty: ${aiDifficulty}`); // Corrected template literal
        });
    });

    // Event listener to start the game after mode selection
    startGameButton.addEventListener("click", function () {
        startGamePrompt.style.display = 'none';
        controlsDiv.style.display = 'block';
        gameStateLabel.innerText = "Ship Count";
        console.log("Started Ship Placement");
        initializeShipPlacement(); // Initialize ship placement based on mode
    });

    // Function to initialize ship placement
    function initializeShipPlacement() {
        if (gameMode === 'two-player') {
            document.getElementById("p1self").style.display = "grid"; // Show Player 1's board
            document.getElementById("p2self").style.display = "none"; // Hide Player 2's board initially
            disableBoardInteractivity(document.getElementById("p2self"));
        } else if (gameMode === 'single-player') {
            document.getElementById("p1self").style.display = "grid"; // Show Player's own board
            document.getElementById("p1opponent").style.display = "none"; // Hide AI's board
            disableBoardInteractivity(document.getElementById("p1opponent"));
        }
    }

    // Event Listener to confirm ship placement
    shipConfirmButton.addEventListener("click", function () {
        gameStateLabel.innerText = (gameMode === 'two-player' && p2PlaceShips) ? "Player 2's Turn" : "Player 1's Turn";
        console.log("Confirmed Ship Placement");

        numShips = parseInt(shipLengthSelect.value);
        if (isNaN(numShips) || numShips <= 0) {
            alert("Please enter a valid number of ships.");
            console.log("Invalid number of ships");
            return;
        }

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
            shipPlacementStatus.innerText = `Place ship of size ${shipsToPlace[currentShipIndex]}`; // Corrected template literal
            console.log(`Placing ship of size ${shipsToPlace[currentShipIndex]}`); // Corrected template literal
        } else {
            shipPlacementStatus.innerText = "All ships placed!";
            nextPlayerPlaceShipButton.disabled = false;
            placeShipButton.disabled = true;
            console.log("All ships placed!");

            if (gameMode === 'two-player') {
                if (p2PlaceShips) {
                    startAttackButton.disabled = false;
                }
            } else if (gameMode === 'single-player') {
                // AI will place ships automatically and thens attack phase starts
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

        console.log(`Attempting to place ship of size ${shipLength} at ${startCoord} facing ${direction}`); // Corrected template literal

        // Validate coordinate input (ensures it is between A-J and 1-10 and formatted correctly)
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

        // Check if the ship fits within the grid, if they do not it sends an alert to the console that placement is invalid
        if (!canPlaceShip(row, col, shipLength, direction)) {
            alert("Ship cannot be placed at this location.");
            console.log("Ship cannot be placed at this location");
            return;
        }

        // Place the ship
        placeShip(row, col, shipLength, direction);
        currentShipIndex++;
        console.log(`Placed ship of size ${shipLength} at ${startCoord} facing ${direction}`); // Corrected template literal
        updateShipPlacementStatus();
    });

    // Function to check if a ship can be placed on the board
    function canPlaceShip(row, col, length, direction) {
        if (direction === "horizontal") {
            if (col + length > 10) return false;
            for (let i = 0; i < length; i++) {
                const currentCoord = `${colLabels[col + i]}${row + 1}`; // Corrected template literal
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
                const currentCoord = `${colLabels[col]}${row + 1 + i}`; // Corrected template literal
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

            // Ensure within bounds
            if (currentRow >= 10 || currentCol >= 10) {
                console.error(`Attempted to place ship out of bounds at row ${currentRow}, col ${currentCol}`); // Corrected template literal
                continue;
            }

            const cell = board.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`); // Corrected template literal and quotes
            if (cell) {
                cell.classList.add("placed");
            } else {
                console.error(`Cell not found: row ${currentRow}, col ${currentCol}`); // Corrected template literal
            }

            const coord = `${colLabels[currentCol]}${rowLabels[currentRow]}`; // Corrected template literal
            coordinates.push(coord);
        }

        // Store the ship's coordinates in the player's ship array
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

                // Show both boards
                document.getElementById("p1self").style.display = "grid";       // Player 1's own board (Blue), non-interactive
                document.getElementById("p2self").style.display = "grid";       // Player 2's own board (Red), interactive

                // Hide opponent views
                document.getElementById("p1opponent").style.display = "none";  // Player 1's opponent view (Blue)
                document.getElementById("p2opponent").style.display = "none";  // Player 2's opponent view (Red)

                // Disable interactivity on Player 1's board
                disableBoardInteractivity(document.getElementById("p1self"));

                // Enable interactivity on Player 2's board
                enableBoardInteractivity(document.getElementById("p2self"));

                // Reset input fields
                document.getElementById("start-coord").value = "";
                placeShipButton.disabled = false;

                // Hide 'Next Player' button and show 'Start Attack' button
                nextPlayerPlaceShipButton.style.display = "none";
                startAttackButton.style.display = "inline";
                updateShipPlacementStatus();
            }
            // In Single-Player mode, AI already placed ships in updateShipPlacementStatus()
        }
    });

    // Function to disable interactivity on a board
    function disableBoardInteractivity(board) {
        board.classList.add("non-interactive");
        const cells = board.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.style.pointerEvents = "none";
            cell.style.cursor = "default";
        });
    }

    // Function to enable interactivity on a board
    function enableBoardInteractivity(board) {
        board.classList.remove("non-interactive");
        const cells = board.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.style.pointerEvents = "auto";
            cell.style.cursor = "pointer";
        });
    }

    // Event Listener to start the attack phase
    startAttackButton.addEventListener("click", function () {
        isAttackPhase = true;
        startAttackPhase();
    });

    // Function to start the attack phase
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
                document.getElementById("p2opponent"), // Player 1's opponent view (Player 2's board)
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

        // Hide controls
        controlsDiv.style.display = "none";

        if (gameMode === 'two-player') {
            // **Player 1's Turn: Own Board on Left, Opponent's Board on Right**
            document.getElementById("p1self").style.display = "grid";          // Player 1's own board (Blue)
            document.getElementById("p2opponent").style.display = "grid";     // Player 2's opponent view (Red)

            document.getElementById("p2self").style.display = "none";          // Hide Player 2's own board
            document.getElementById("p1opponent").style.display = "none";     // Hide Player 1's opponent view

            // Ensure interactivity
            enableBoardInteractivity(document.getElementById("p2opponent"));
            disableBoardInteractivity(document.getElementById("p1self"));
        } else if (gameMode === 'single-player') {
            // **Player's Turn: Own Board on Left, AI's Board on Right**
            document.getElementById("p1self").style.display = "grid";          // Player's own board (Blue)
            document.getElementById("p1opponent").style.display = "grid";     // AI's board (Red)

            document.getElementById("p2self").style.display = "none";          // Hide Player 2's own board
            document.getElementById("p2opponent").style.display = "none";     // Hide Player 2's opponent view

            // Ensure interactivity
            enableBoardInteractivity(document.getElementById("p1opponent"));
            disableBoardInteractivity(document.getElementById("p1self"));
        }

        gameStateLabel.innerText = "Player 1's Turn";

        // Update the Special Shot button's state
        updateSpecialShotButton();
    }

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
                // Switching to Player 2's turn
                turn = 2;
                gameStateLabel.innerText = "Player 2's Turn";
                showPassScreen("Pass to Player 2.");
                console.log("Switched turn to Player 2");

                // Display both boards: Player 2's own board on Left, Player 1's opponent view on Right
                document.getElementById("p2self").style.display = "grid";          // Player 2's own board (Red)
                document.getElementById("p1opponent").style.display = "grid";     // Player 1's opponent view (Blue)

                document.getElementById("p1self").style.display = "none";          // Hide Player 1's own board
                document.getElementById("p2opponent").style.display = "none";     // Hide Player 2's opponent view

                // Assign boards array to p1opponent (Player 2 attacks Player 1's board)
                boards = [document.getElementById("p1opponent")];

                // Ensure interactivity
                enableBoardInteractivity(document.getElementById("p1opponent"));
                disableBoardInteractivity(document.getElementById("p2self"));
            } else {
                // Switching back to Player 1's turn
                turn = 1;
                gameStateLabel.innerText = "Player 1's Turn";
                showPassScreen("Pass to Player 1.");
                console.log("Switched turn to Player 1");

                // Display both boards: Player 1's own board on Left, Player 2's opponent view on Right
                document.getElementById("p1self").style.display = "grid";          // Player 1's own board (Blue)
                document.getElementById("p2opponent").style.display = "grid";     // Player 2's opponent view (Red)

                document.getElementById("p2self").style.display = "none";          // Hide Player 2's own board
                document.getElementById("p1opponent").style.display = "none";     // Hide Player 1's opponent view

                // Assign boards array to p2opponent (Player 1 attacks Player 2's board)
                boards = [document.getElementById("p2opponent")];

                // Ensure interactivity
                enableBoardInteractivity(document.getElementById("p2opponent"));
                disableBoardInteractivity(document.getElementById("p1self"));
            }

            // Re-attach event listeners to the active opponent's board
            attachAttackEventListeners();

            // Update the Special Shot button's state
            updateSpecialShotButton();
        } else if (gameMode === 'single-player') {
            if (turn === 1) {
                // Switching to AI's turn
                turn = 2; // AI's turn
                gameStateLabel.innerText = "AI's Turn";
                showPassScreen("AI is attacking...");
                console.log("AI's Turn");
                aiTakeTurn();
            } else {
                // Switching back to Player's turn
                turn = 1; // Player's turn
                gameStateLabel.innerText = "Player 1's Turn";
                showPassScreen("Pass to Player 1.");
                console.log("Player's Turn");
            }

            // Update the Special Shot button's state
            updateSpecialShotButton();
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
        const coord = `${colLabels[col]}${rowLabels[row]}`; // Corrected template literal

        console.log(`Processing attack on ${coord} by ${attackerId}`); // Corrected template literal

        // Ensure the targetPlayer and its receiveAttack method exist
        if (!targetPlayer || typeof targetPlayer.receiveAttack !== 'function') {
            console.error("Invalid target player or receiveAttack function not defined.");
            return;
        }

        let hitResult = targetPlayer.receiveAttack(coord);
        if (!hitResult) {
            console.error(`receiveAttack did not return a valid result for ${coord}.`); // Corrected template literal
            return;
        }

        if (hitResult.hit) {
            cell.classList.add("hit");
            const opponentSelfBoard = document.getElementById(targetId);
            if (opponentSelfBoard) {
                const targetCell = opponentSelfBoard.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`); // Corrected template literal and quotes
                if (targetCell) {
                    targetCell.classList.add("hit-self");
                } else {
                    console.error(`Target cell not found: row ${row}, col ${col}`); // Corrected template literal
                }
            } else {
                console.error(`Opponent's self board not found: ID ${targetId}`); // Corrected template literal
            }

            console.log(`${attackerId} hit at ${coord}`); // Corrected template literal

            if (hitResult.sunk) {
                // Correctly update the ships-left count in the scoreboard
                const shipsLeftId = targetPlayer.id === 1 ? 'p1-ships-left' : 'p2-ships-left';
                const shipsLeftElement = document.getElementById(shipsLeftId);
                if (shipsLeftElement) {
                    shipsLeftElement.innerText = targetPlayer.shipsLeft;
                } else {
                    console.error(`Ships-left element not found: ID ${shipsLeftId}`); // Corrected template literal
                }

                console.log(`${attackerId} sunk a ship at ${coord}`); // Corrected template literal
                checkWin();
            }

            if (attackerId === 'player1') {
                p1HitsSpan.innerText = parseInt(p1HitsSpan.innerText) + 1;
            } else if (attackerId === 'player2') {
                p2HitsSpan.innerText = parseInt(p2HitsSpan.innerText) + 1;
            } else if (attackerId === 'AI') {
                p2HitsSpan.innerText = parseInt(p2HitsSpan.innerText) + 1;
            }
        } else {
            cell.classList.add("miss");
            const opponentSelfBoard = document.getElementById(targetId);
            if (opponentSelfBoard) {
                const targetCell = opponentSelfBoard.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`); // Corrected template literal and quotes
                if (targetCell) {
                    targetCell.classList.add("miss-self");
                } else {
                    console.error(`Target cell not found: row ${row}, col ${col}`); // Corrected template literal
                }
            } else {
                console.error(`Opponent's self board not found: ID ${targetId}`); // Corrected template literal
            }

            console.log(`${attackerId} missed at ${coord}`); // Corrected template literal

            if (attackerId === 'player1') {
                p1MissSpan.innerText = parseInt(p1MissSpan.innerText) + 1;
            } else if (attackerId === 'player2') {
                p2MissSpan.innerText = parseInt(p2MissSpan.innerText) + 1;
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

        console.log(`AI is attacking ${colLabels[attackCoords.col]}${rowLabels[attackCoords.row]}`); // Corrected template literal

        // Simulate attack delay
        setTimeout(() => {
            let row = attackCoords.row;
            let col = attackCoords.col;
            let coord = `${colLabels[col]}${rowLabels[row]}`; // Corrected template literal
            let cell = document.getElementById("p1self").querySelector(`.cell[data-row="${row}"][data-col="${col}"]`); // Corrected template literal and quotes

            if (!cell) {
                console.error(`Cell not found: row ${row}, col ${col}`); // Corrected template literal
                hidePassScreen();
                return;
            }

            // Process AI's attack using processAttack
            processAttack(player1, cell, 'p1self', 'AI');

            // Update game state
            gameStateLabel.innerText = "Player 1's Turn";
            hidePassScreen();

            // Reset hasFired to allow Player 1 to attack again
            hasFired = false;

            // Reset turn back to Player 1
            turn = 1;

            // Update the Special Shot button's state
            updateSpecialShotButton();
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

    // Function to hide all game boards
    function hideAllBoards() {
        const boardIds = ["p1self", "p1opponent", "p2self", "p2opponent"];
        boardIds.forEach(id => {
            const board = document.getElementById(id);
            if (board) {
                board.style.display = "none";
            } else {
                console.error(`Board element not found: ID ${id}`); // Corrected template literal
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

        console.log(`${winner} wins the game!`); // Corrected template literal

        // Hide all game boards
        hideAllBoards();

        // Hide the scoreboard and game state label
        hideUIElements();

        // Show the winner modal
        showWinnerModal(winner);
    }

    // Winner screen
    function showWinnerModal(winner) {
        winnerMessage.innerText = `${winner} WINS!`; // Corrected template literal
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

    function playHitAnimation(targetCell) {
        // Implement your hit animation here
        // Example:
        // targetCell.classList.add('hit-animation');
    }

    function playMissAnimation(targetCell) {
        // Implement your miss animation here
        // Example:
        // targetCell.classList.add('miss-animation');
    }

    function playSunkSound() {
        // Implement your sunk ship sound here
    }

    function startFireworks() {
        // Implement your fireworks animation here
    }

    // Function to handle the Special Shot
    // Function to handle the Special Shot
    function handleSpecialShot() {
        let currentPlayer = (turn === 1) ? player1 : player2;

        // Check if the special shot has already been used
        if (currentPlayer.specialShotUsed) {
            alert("You have already used your Special Shot.");
            return;
        }

        // Prompt for the center coordinate
        let centerCoord = prompt("Enter the center coordinate for your Special Shot (e.g., E5):");
        if (centerCoord === null) {
            // User cancelled the prompt
            return;
        }
        centerCoord = centerCoord.trim().toUpperCase();

        // Validate coordinate format
        const regex = /^([A-J])(10|[1-9])$/;
        if (!regex.test(centerCoord)) {
            alert("Invalid coordinate format. Please enter a letter (A-J) followed by a number (1-10).");
            handleSpecialShot(); // Retry
            return;
        }

        // Parse coordinate
        const colLetter = centerCoord.match(/[A-J]/)[0];
        const rowStr = centerCoord.match(/\d+/)[0];
        const col = colLabels.indexOf(colLetter);
        const row = parseInt(rowStr) - 1;

        // Define the 3x3 grid coordinates
        let shotCoords = [];
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                shotCoords.push({ row: r, col: c });
            }
        }

        // Validate all coordinates are within the board
        let allValid = true;
        for (let coord of shotCoords) {
            if (coord.row < 0 || coord.row > 9 || coord.col < 0 || coord.col > 9) {
                allValid = false;
                break;
            }
        }

        if (!allValid) {
            alert("Invalid coordinates for Special Shot. All 3x3 cells must be within the board.");
            handleSpecialShot(); // Retry
            return;
        }

        // Process each attack in the 3x3 grid
        let targetPlayer = (turn === 1) ? player2 : player1;
        let targetId = (turn === 1) ? 'p2self' : 'p1self';
        let attackerId = (turn === 1) ? 'player1' : 'player2';

        shotCoords.forEach(coord => {
            let cell = document.getElementById(targetId).querySelector(`.cell[data-row="${coord.row}"][data-col="${coord.col}"]`);
            if (cell && !cell.classList.contains("hit") && !cell.classList.contains("miss")) {
                processAttack(targetPlayer, cell, targetId, attackerId);
            }
        });

        // Mark the special shot as used
        currentPlayer.specialShotUsed = true;

        // Disable the Special Shot button
        specialShotButton.disabled = true;

        // Allow the player to end their turn
        hasFired = true;
    }


    // Function to update the Special Shot button's state
    function updateSpecialShotButton() {
        if (!isAttackPhase) {
            specialShotButton.style.display = 'none';
            return;
        }
        specialShotButton.style.display = 'inline-block';
        let currentPlayer = (turn === 1) ? player1 : player2;
        specialShotButton.disabled = currentPlayer.specialShotUsed;
    }
});
