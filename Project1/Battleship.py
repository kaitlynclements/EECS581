"""
Authors: Kaitlyn Clements
         Taylor Slade
         Sam Muelbach
         Aaditi Chinawalker
         Lizzie Solstis
Assignment: EECS 581 Project 1; Battleship
Program: Battleship.pyBattleship file to identify different classes/objects of the game
Inputs: Players.py, Board.py, Ship.py, User Input
Outputs: Battleship Game, interactive and dependent on User Input
Other Sources: None
Date: 09/04/2024
"""


class Player:
    def __init__(self, name, board):
        self.name = name
        self.board = board

    def take_turn(self, opponent):
        """Allow player to take a turn by firing at opponent's board."""
        print(f"{self.name}'s turn!")
        opponent.board.display()

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
        result = opponent.board.receive_fire(x, y)
        print(f"{self.name} fired at {target}: {result}")


class Board:
    def __init__(self, size=10):
        self.size = size
        self.grid = [["~"] * size for _ in range(size)]
        self.ships = []
        self.hits = []
        self.misses = []

    def display(self):
        # display board with column labels
        rint("  " + " ".join([chr(ord("A") + i) for i in range(self.size)]))
        for i in range(self.size):
            print(f"{i + 1:2} " + " ".join(self.grid[i]))

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
        if self.grid[x][y] == "S":
            self.grid[x][y] = "X"
            self.hits.append((x, y))
            return "Hit!"
        else:
            self.grid[x][y] = "O"
            self.misses.append((x, y))
            return "Miss!"

    def all_ships_sunk(self):
        """Check if all ships have been sunk."""
        for ship in self.ships:
            if not ship.is_sunk(self.hits):
                return False
        return True


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


def setup_ships(player):
    """Set up ships for the player."""
    ship_sizes = [1, 2, 3, 4, 5]
    for size in ship_sizes:
        while True:
            orientation = random.choice(["H", "V"])
            if orientation == "H":
                start_x = random.randint(0, 9)
                start_y = random.randint(0, 9 - size)
            else:
                start_x = random.randint(0, 9 - size)
                start_y = random.randint(0, 9)

            ship = Ship(size, orientation, start_x, start_y)
            if player.board.is_valid_position(ship):
                player.board.place_ship(ship)
                print(f"{player.name} placed a ship of size {size}.")
                break


def play_game(player1, player2):
    """Main game loop."""
    while True:
        player1.take_turn(player2)
        if player2.board.all_ships_sunk():
            print(f"{player1.name} wins!")
            break

        player2.take_turn(player1)
        if player1.board.all_ships_sunk():
            print(f"{player2.name} wins!")
            break
