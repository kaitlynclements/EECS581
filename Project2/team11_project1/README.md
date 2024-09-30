
# Battleship Game

This is a Battleship game built using Flask, JavaScript, and CSS. It features two players, ship placement, and a turn-based attack system.

## Installation Instructions

1. **Download the Package**:  
   First, download the project package and `cd` into the directory.

2. **Install Conda**:  
   Install [Conda](https://docs.conda.io/en/latest/miniconda.html) on your machine if it's not already installed.

3. **Initialize Conda**:  
   If this is your first time using Conda, run the following command to initialize it:  
   ```
   conda init
   ```

4. **Activate Environment**:  
   Activate the Flask environment with:  
   ```
   conda activate flask
   ```

5. **Launch the Web App**:  
   Run the following command to launch the web application:  
   ```
   python app.py
   ```

6. **Open the Game in Browser**:  
   Open your web browser and navigate to `http://127.0.0.1:5000/` to start playing the game.

## Playing the Game
Once the web app is running, the game can be accessed in your browser. Two players will take turns placing ships on their respective boards and then attacking each other’s ships.

---

## File Descriptions

### Key Files:
- **`app.py`**: The main Flask application file that serves the web app.
- **`game.js`**: Handles the core game logic, including ship placement and turn-based attacks.
- **`board.js`**: Responsible for setting up the game boards and managing ship placement.
- **`Player.js`**: Manages player-specific actions, like placing ships and endgame verification
- **`aiPlayer.js`**: Handles the AI behavior and functionality in the one player mode
- **`turnSystem.js`**: Controls the turn-based system and switches between players.
- **`styles.css`**: Contains all the CSS for the visual styling of the game.
- sfx, animations, and fireworks are managed by js files of the same name.
---
