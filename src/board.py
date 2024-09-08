import pygame
from pieces import Pawn, Rook, Knight, Bishop, Queen, King

BOARD_SIZE = 8
SQUARE_SIZE = 80

class Board:
    def __init__(self):
        self.grid = [[None for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.setup_pieces()

    def setup_pieces(self):
        # Set up pawns
        for col in range(BOARD_SIZE):
            self.grid[1][col] = Pawn("black", (1, col))
            self.grid[6][col] = Pawn("white", (6, col))

        # Set up other pieces
        piece_order = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]
        for col, piece_class in enumerate(piece_order):
            self.grid[0][col] = piece_class("black", (0, col))
            self.grid[7][col] = piece_class("white", (7, col))

    def move_piece(self, start, end):
        start_row, start_col = start
        end_row, end_col = end

        piece = self.grid[start_row][start_col]
        if piece and (end_row, end_col) in piece.get_valid_moves(self):
            self.grid[end_row][end_col] = piece
            self.grid[start_row][start_col] = None
            piece.position = (end_row, end_col)
            return True
        return False

    def is_valid_move(self, start, end):
        start_row, start_col = start
        piece = self.grid[start_row][start_col]
        return piece and end in piece.get_valid_moves(self)

    def draw(self, screen):
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                color = (255, 206, 158) if (row + col) % 2 == 0 else (209, 139, 71)
                pygame.draw.rect(screen, color, (col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))
                
                piece = self.grid[row][col]
                if piece:
                    piece.draw(screen)

    def get_king_position(self, color):
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                piece = self.grid[row][col]
                if isinstance(piece, King) and piece.color == color:
                    return (row, col)
        return None

    def is_check(self, color):
        king_pos = self.get_king_position(color)
        if not king_pos:
            return False

        opponent_color = "black" if color == "white" else "white"
        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                piece = self.grid[row][col]
                if piece and piece.color == opponent_color:
                    if king_pos in piece.get_valid_moves(self):
                        return True
        return False

    def is_checkmate(self, color):
        if not self.is_check(color):
            return False

        for row in range(BOARD_SIZE):
            for col in range(BOARD_SIZE):
                piece = self.grid[row][col]
                if piece and piece.color == color:
                    for move in piece.get_valid_moves(self):
                        # Try the move
                        original_pos = piece.position
                        captured_piece = self.grid[move[0]][move[1]]
                        self.move_piece(piece.position, move)

                        # Check if the king is still in check
                        still_in_check = self.is_check(color)

                        # Undo the move
                        self.move_piece(move, original_pos)
                        self.grid[move[0]][move[1]] = captured_piece

                        if not still_in_check:
                            return False
        return True