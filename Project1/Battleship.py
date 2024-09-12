"""
Authors: Kaitlyn Clements
         Taylor Slade
         Sam Muehlebach
         Aaditi Chinawalker
         Lizzie Soltis
Assignment: EECS 581 Project 1; Battleship
Program: Battleship.pyBattleship file to identify different classes/objects of the game
Inputs: Players.py, Board.py, Ship.py, User Input
Outputs: Battleship Game, interactive and dependent on User Input
Other Sources: ChatGPT
Date: 09/04/2024
last modified: 09/09/2024
"""

# Import libraries for later use
import random
import os
import time

# Initializes a Player class/object. Each play has their own name and board. 
class Player:
    def __init__(self, name, board):
        self.name = name
        self.board = board

    # Function of a Player
    # Allow player to take a turn by firing at opponent's board
    def take_turn(self, opponent):
        print(f"{self.name}'s turn!")
        print("Your board: ")
        self.board.display()
        # Display current player's board^

        # Display how many times current player's ships have been hit
        print("\nHits on your ships:")
        self.display_hits()

        # Display opponent's board but hide the ships from the view
        print("\nOpponent's board: ")
        opponent.board.display(show_ships=False)  

        # Get coordinates for firing, make sure valid cooardinates
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
            # Ensure target hasn't been fired at before

        # Fire at opponent's board. Print whether the shot was a hit or miss. If a ship is sunk, notify the player. 
        result, ship_sunk = opponent.board.receive_fire(x, y)
        print(f"\n{self.name} fired at {target}: {result}")
        if ship_sunk:
            print(f"{self.name} has sunk a ship!")
    
    # Function of Player
    # Display how many times each ship has been hit; Calculated by comparing coordinates with hits on the board
    def display_hits(self):
        hit_count_by_ship = {}
        for ship in self.board.ships:
            hit_count = 0
            for coord in ship.coordinates:
                if coord in self.board.hits:
                    hit_count += 1
            hit_count_by_ship[tuple(ship.coordinates)] = hit_count

        # Print hit details for each ship
        for ship_coords, hit_count in hit_count_by_ship.items():
            print(f"{ship_coords}: {hit_count} hit(s)")

# Initializes a Board class/object
# Each Board has a grid, ships, hits, misses, and hit count
class Board:
    def __init__(self, size=10):
        self.size = size
        self.grid = [["~"] * size for _ in range(size)]
        self.ships = []
        self.hits = []
        self.misses = []
        self.hit_count = {} #tracking how many times each cell is hit as dictionary

    # Function of a Board
    # Display the board. If show_ships is False, hide ships and only show hits and misses.
    def display(self, show_ships=True):
        print("   " + " ".join([chr(ord("A") + i) for i in range(self.size)]))
        # Display columns A-J ^
        for i in range(self.size):
            row = []
            for j in range(self.size):
                if not show_ships and self.grid[i][j] == "S":
                    row.append("~") # Hide ships if show_ships is False
                elif self.grid[i][j] == "X" and (i,j) in self.hit_count:
                    row.append("X") # Always display X when a ship has been hit
                else:
                    row.append(self.grid[i][j]) # Show the current state of the cell
            print(f"{i + 1:2} " + " ".join(row))
            # Display board row by row, either hiding ships or showing them based on 'show_ships' boolean

    # Function of a Board
    # Place a ship on the board
    def place_ship(self, ship):
        for x, y in ship.coordinates:
            self.grid[x][y] = "S"
        self.ships.append(ship)

    # Function of a Board
    # Check if the ship's position is valid on the board
    def is_valid_position(self, ship):
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
        # Verifies ship's position is within bounds and isn't overlapping with other ships

    # Function of a Board
    # Handle an incoming shot at (x, y)
    def receive_fire(self, x, y):
        ship_sunk = False
        if self.grid[x][y] == "S" or self.grid[x][y].isdigit(): 
            if (x,y) in self.hit_count: #if hit, increment hit counter for spot
                self.hit_count[(x,y)] += 1
            else:
                self.hit_count[(x,y)] = 1
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
        # Process shot at board
        # If ship is hit, record it and check if the ship is sunk
        # Else, record it as a miss

    # Function of a Board
    # Check if all ships have been sunk
    def all_ships_sunk(self):
        for ship in self.ships:
            if not ship.is_sunk(self.hits):
                return False
        return True

# Function not belonging to a class
# Converts all user input into board incdices
def input_to_index(input_str):
    column = ord(input_str[0].upper()) - ord('A')
    row = int(input_str[1:]) - 1
    return row, column

# Initializes a Ship class/object
# Each Ship has a size, orientation, starting coordinates (x and y), and remaining coordinates 
class Ship:
    def __init__(self, size, orientation, start_x, start_y):
        self.size = size
        self.orientation = orientation
        self.start_x = start_x
        self.start_y = start_y
        self.coordinates = self.generate_coordinates()
    
    # Function of a Ship
    # Generate the coordinates of the ship based on its size and orientation (horizontal or vertical)
    def generate_coordinates(self):
        coordinates = []
        if self.orientation == "H":
            for i in range(self.size):
                coordinates.append((self.start_x, self.start_y + i))
        else:  # Vertical orientation
            for i in range(self.size):
                coordinates.append((self.start_x + i, self.start_y))
        return coordinates
        
    # Function of a Ship
    # Check is all of a ship's coordinates have been marked as a hit, if so then the ship has been sunk
    def is_sunk(self, hits):
        return all(coord in hits for coord in self.coordinates)

# Not a function belonging to a class
# Validate the input for ship orientation (H or V)   
def validate_orientation():
    while True:
        ship_orientation = input("Enter orientation (H for horizontal, V for vertical): ").strip().upper()
        if ship_orientation in ['H', 'V']:
            return ship_orientation
        else:
            print("Invalid orientation! Please enter 'H' or 'V'.")

# Not a function belonging to a class
# Validate the position input, ensuring format is correct (A-J and 1-10)
def validate_position():
    while True:
        start_position = input("Enter the starting position (e.g., A1): ").strip().upper()
        if len(start_position) < 2 or len(start_position) > 3:
            print("Invalid position! Position must be a letter (A-J) followed by a number (1-10).")
            continue
            # Validates start position
        
        column_letter = start_position[0]
        if column_letter < 'A' or column_letter > 'J':
            print("Invalid position! The letter must be between A and J.")
            continue
            # Validates the column letter is between A-J
        
        try:
            row_number = int(start_position[1:])
            if row_number < 1 or row_number > 10:
                print("Invalid position! The number must be between 1 and 10.")
                continue
                # Validates the row number is between 1-10
        except ValueError:
            print("Invalid position! The number must be a valid integer.")
            continue
            # Raise an error if invalid coordinates are provided. 
        
        return start_position # Starts the process over again 
    
# Not a function belonging to a class
# Validate the number of ships each player will have, ensure input is between 1-5
def validate_numships():
    while True:
        ship_num = int(input("Enter the number of ships each player will get (minimum of 1, maximum of 5): "))
        if ship_num in [1,2,3,4,5]:
            return ship_num
        else:
            print("Invalid number of ships! Please enter a number between 1 and 5")

# Not a function belonging to a class
# Sets up ships on player's board
# User is notified to place their ships by providing orientation and position
def setup_ships(player, num_ships):
    print(f"{player.name}'s turn to place ships!")
    
    print(f"{player.name}'s current board:")
    player.board.display()

    ship_sizes = list(range(1, num_ships + 1))

    # Iterate through ship_sizes for valid input and placement without overlapping
    # If a valid position is found, the ship is placed abd the loop continues
    # Else the player is asked to try again 
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


# Function not belonging to a class
# Main game loop
# Both players take turns playing the game. The game ends when one player's ships are all sunk. 
def play_game(player1, player2):
    while True:
        player1.take_turn(player2)
        time.sleep(3)
        if player2.board.all_ships_sunk():
            print(f"{player1.name} wins!")
            break
        time.sleep(4)
        clear_screen()

        print("Please switch players!") # Notify user to give computer to next player
        time.sleep(5) # hold blank screen for 5 seconds for players to switch computer without one player seeing anothers data
        clear_screen()

        player2.take_turn(player1)
        time.sleep(3)
        if player1.board.all_ships_sunk():
            print(f"{player2.name} wins!")
            break
        time.sleep(4)
        clear_screen()

        print("Please switch players!") # Notify user to give computer to next player
        time.sleep(5) # hold blank screen for 5 seconds for players to switch computer without one player seeing anothers data
        clear_screen()

# Function not belonging to a class
# Clear screen for cleaner experience and to delete previous players data from the screen to hide it from next player. 
def clear_screen():
   os.system('cls' if os.name == 'nt' else 'clear')
