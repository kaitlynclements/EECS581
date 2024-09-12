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
Other Sources: ChatGPT
Date: 09/04/2024
"""

# Import necessary modules, classes, functions
import Battleship
from Battleship import Board
from Battleship import Player
from Battleship import setup_ships
from Battleship import play_game
from Battleship import clear_screen
from Battleship import validate_numships

# Import time module for delays
import time

# Main function
# Contains overall game flow
def main():
    board1 = Board()
    board2 = Board()
    # Initialize a board for each player

    player1 = Player("Player 1", board1)
    player2 = Player("Player 2", board2)
    # Initialize 2 players for the game

    num_ships = validate_numships()
    # validates the number of ships the players selcted

    setup_ships(player1, num_ships)
    print("All of Player 1's ships are placed!")
    time.sleep(5)
    clear_screen()
    # Let's player 1 setup their ships and then clears their data from the screen

    print("Please switch players!")
    time.sleep(5)
    clear_screen()
    # Clears data and lets players know to switch the computer for the next players turn
    # Prevents users from seeing other's data

    setup_ships(player2, num_ships)
    print("All of Player 2's ships are placed!")
    time.sleep(5)
    clear_screen()
    # Lets player 2 setup their ships and then clears their data from the screen

    print("Please switch players!")
    time.sleep(5)
    clear_screen()
    # Clears data and lets players know to switch the computer for the next players turn
    # Prevents users from seeing other's data

    play_game(player1, player2)
    # begins the game for player1 and player2


if __name__ == "__main__":
    main()
    # call the main function
