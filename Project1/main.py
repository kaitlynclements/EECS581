"""
Authors: Kaitlyn Clements
         Taylor Slade
         Sam Muelbach
         Aaditi Chinawalker
         Lizzie Solstis
Assignment: EECS 581 Project 1; Battleship
Program: main.py
Description: main file to execute code for Battleship game. 
Inputs: Players.py, Board.py, Ship.py, User Input
Outputs: Battleship Game, interactive and dependent on User Input
Other Sources: None
Date: 09/04/2024
"""

import Battleship


def main():
    # Initialize boards
    board1 = Board()
    board2 = Board()

    # Initialize players
    player1 = Player("Player 1", board1)
    player2 = Player("Player 2", board2)

    # Set up ships for both players
    setup_ships(player1)
    setup_ships(player2)

    # Start the game
    play_game(player1, player2)


if __name__ == "__main__":
    main()
