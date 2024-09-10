"""
Authors: Kaitlyn Clements
         Taylor Slade
         Sam Muelbach
         Aaditi Chinawalker
         Lizzie Soltis
Assignment: EECS 581 Project 1; Battleship
Program: Battleship.pyBattleship file to identify different classes/objects of the game
Inputs: Players.py, Board.py, Ship.py, User Input
Outputs: Battleship Game, interactive and dependent on User Input
Other Sources: None
Date: 09/04/2024
last modified: 09/09/2024
"""

import random
import os
import time

class Player:
    def __init__(self, name, board):
        self.name = name
        self.board = board

    def take_turn(self, opponent):
        """Allow player to take a turn by firing at opponent's board."""
        print(f"{self.name}'s turn!")
        print("Your board: ")
        self.board.display()
        print("\nOpponent's board: ")
        opponent.board.display(show_ships=False)  

        # Get coordinates for firing
        while True:
            target = input("Enter target coordinates (e.g., A5): ").upper()
            if len(target) >= 2 and target[0] in "ABCDEFGHIJ" and target[1:].isdigit():
                x = int(target[1:]) - 1
                y = ord(target[0]) - ord("A")
                if (
                    0 <= x < 10
                    and 0 <= y < 10
                    and (x, y) not in opponent.board.hits + opponent.board.misses
                ):
                    break
            print("Invalid coordinates, try again.")

        # Fire at opponent's board
        result, ship_sunk = opponent.board.receive_fire(x, y)
        print(f"\n{self.name} fired at {target}: {result}")
        if ship_sunk:
            print(f"{self.name} has sunk a ship!")


class Board:
    def __init__(self, size=10):
        self.size = size
        self.grid = [["~"] * size for _ in range(size)]
        self.ships = []
        self.hits = []
        self.misses = []

    def display(self, show_ships=True):
        """Display the board. If show_ships is False, hide ships and only show hits and misses."""
        print("   " + " ".join([chr(ord("A") + i) for i in range(self.size)]))
        for i in range(self.size):
            row = []
            for j in range(self.size):
                if not show_ships and self.grid[i][j] == "S":
                    row.append("~") 
                else:
                    row.append(self.grid[i][j])
            print(f"{i + 1:2} " + " ".join(row))

    def place_ship(self, ship):
        """Place a ship on the board."""
        for x, y in ship.coordinates:
            self.grid[x][y] = "S"
        self.ships.append(ship)

    def is_valid_position(self, ship):
        """Check if the ship's position is valid on the board."""
        for x, y in ship.coordinates:
            if (
                x < 0
                or x >= self.size
                or y < 0
                or y >= self.size
                or self.grid[x][y] == "S"
            ):
                return False
        return True

    def receive_fire(self, x, y):
        """Handle an incoming shot at (x, y)."""
        ship_sunk = False
        if self.grid[x][y] == "S":
            self.grid[x][y] = "X"
            self.hits.append((x, y))
            for ship in self.ships:
                if (x, y) in ship.coordinates: 
                    if ship.is_sunk(self.hits):
                        ship_sunk = True 
            return "Hit!", ship_sunk
        else:
            self.grid[x][y] = "O"
            self.misses.append((x, y))
            return "Miss!", ship_sunk

    def all_ships_sunk(self):
        """Check if all ships have been sunk."""
        for ship in self.ships:
            if not ship.is_sunk(self.hits):
                return False
        return True

def input_to_index(input_str):
    column = ord(input_str[0].upper()) - ord('A')
    row = int(input_str[1:]) - 1
    return row, column

class Ship:
    def __init__(self, size, orientation, start_x, start_y):
        self.size = size
        self.orientation = orientation
        self.start_x = start_x
        self.start_y = start_y
        self.coordinates = self.generate_coordinates()
    
    def generate_coordinates(self):
        coordinates = []
        if self.orientation == "H":
            for i in range(self.size):
                coordinates.append((self.start_x, self.start_y + i))
        else:  # Vertical orientation
            for i in range(self.size):
                coordinates.append((self.start_x + i, self.start_y))
        return coordinates
        
    def is_sunk(self, hits):
        return all(coord in hits for coord in self.coordinates)
    
def validate_orientation():
    while True:
        ship_orientation = input("Enter orientation (H for horizontal, V for vertical): ").strip().upper()
        if ship_orientation in ['H', 'V']:
            return ship_orientation
        else:
            print("Invalid orientation! Please enter 'H' or 'V'.")

def validate_position():
    while True:
        start_position = input("Enter the starting position (e.g., A1): ").strip().upper()
        if len(start_position) < 2 or len(start_position) > 3:
            print("Invalid position! Position must be a letter (A-J) followed by a number (1-10).")
            continue
        
        column_letter = start_position[0]
        if column_letter < 'A' or column_letter > 'J':
            print("Invalid position! The letter must be between A and J.")
            continue
        
        try:
            row_number = int(start_position[1:])
            if row_number < 1 or row_number > 10:
                print("Invalid position! The number must be between 1 and 10.")
                continue
        except ValueError:
            print("Invalid position! The number must be a valid integer.")
            continue
        
        return start_position
    
def validate_numships():
    while True:
        ship_num = int(input("Enter the number of ships each player will get (minimum of 1, maximum of 5): "))
        if ship_num in [1,2,3,4,5]:
            return ship_num
        else:
            print("Invalid number of ships! Please enter a number between 1 and 5")

def setup_ships(player, num_ships):
    """Set up ships for the player."""
    print(f"{player.name}'s turn to place ships!")
    
    print(f"{player.name}'s current board:")
    player.board.display()

    ship_sizes = list(range(1, num_ships + 1))

    for size in ship_sizes:
        while True:
            ship_orientation = validate_orientation()
            start_position = validate_position()
            start_x, start_y = input_to_index(start_position)
            ship = Ship(size, ship_orientation, start_x, start_y)
            if player.board.is_valid_position(ship):
                player.board.place_ship(ship)
                print(f"{player.name} placed a ship of size {size}.")
                print(f"{player.name}'s board: ")
                player.board.display() 
                break
            else:
                print("Invalid position! Please choose another location")


def play_game(player1, player2):
    """Main game loop."""
    while True:
        player1.take_turn(player2)
        time.sleep(3)
        if player2.board.all_ships_sunk():
            print(f"{player1.name} wins!")
            break
        time.sleep(4)
        clear_screen()

        player2.take_turn(player1)
        time.sleep(3)
        if player1.board.all_ships_sunk():
            print(f"{player2.name} wins!")
            break
        time.sleep(4)
        clear_screen()


def clear_screen():
   os.system('cls' if os.name == 'nt' else 'clear')
