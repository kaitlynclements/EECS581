"""
Authors: Kaitlyn Clements
         Taylor Slade
         Sam Muelbach
         Aaditi Chinawalker
         Lizzie Soltis
Assignment: EECS 581 Project 1; Battleship
Program: main.py
Description: main file to execute code for Battleship game. 
Inputs: Players.py, Board.py, Ship.py, User Input
Outputs: Battleship Game, interactive and dependent on User Input
Other Sources: None
Date: 09/04/2024
"""

import Battleship
from Battleship import Board
from Battleship import Player
from Battleship import setup_ships
from Battleship import play_game
from Battleship import clear_screen
from Battleship import validate_numships

import time

def main():
    board1 = Board()
    board2 = Board()

    player1 = Player("Player 1", board1)
    player2 = Player("Player 2", board2)

    num_ships = validate_numships()

    setup_ships(player1, num_ships)
    print("All of Player 1's ships are placed!")
    time.sleep(5)
    clear_screen()

    setup_ships(player2, num_ships)
    print("All of Player 2's ships are placed!")
    time.sleep(5)
    clear_screen()

    play_game(player1, player2)


if __name__ == "__main__":
    main()
