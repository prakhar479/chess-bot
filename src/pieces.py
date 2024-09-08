import pygame

SQUARE_SIZE = 80

class Piece:
    def __init__(self, color, position):
        self.color = color
        self.position = position

    def get_valid_moves(self, board):
        raise NotImplementedError

    def draw(self, screen):
        raise NotImplementedError

class Pawn(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        direction = -1 if self.color == "white" else 1

        # Move forward
        if 0 <= row + direction < 8 and board.grid[row + direction][col] is None:
            valid_moves.append((row + direction, col))
            # Double move on first turn
            if (self.color == "white" and row == 6) or (self.color == "black" and row == 1):
                if board.grid[row + 2 * direction][col] is None:
                    valid_moves.append((row + 2 * direction, col))

        # Capture diagonally
        for dc in [-1, 1]:
            if 0 <= row + direction < 8 and 0 <= col + dc < 8:
                if board.grid[row + direction][col + dc] and board.grid[row + direction][col + dc].color != self.color:
                    valid_moves.append((row + direction, col + dc))

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.circle(screen, color, (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 2), SQUARE_SIZE // 3)

class Rook(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

        for dr, dc in directions:
            for i in range(1, 8):
                new_row, new_col = row + i * dr, col + i * dc
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    if board.grid[new_row][new_col] is None:
                        valid_moves.append((new_row, new_col))
                    elif board.grid[new_row][new_col].color != self.color:
                        valid_moves.append((new_row, new_col))
                        break
                    else:
                        break
                else:
                    break

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.rect(screen, color, (x + SQUARE_SIZE // 4, y + SQUARE_SIZE // 4, SQUARE_SIZE // 2, SQUARE_SIZE // 2))

class Knight(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        moves = [
            (-2, -1), (-2, 1), (-1, -2), (-1, 2),
            (1, -2), (1, 2), (2, -1), (2, 1)
        ]

        for dr, dc in moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < 8 and 0 <= new_col < 8:
                if board.grid[new_row][new_col] is None or board.grid[new_row][new_col].color != self.color:
                    valid_moves.append((new_row, new_col))

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.polygon(screen, color, [
            (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 4),
            (x + SQUARE_SIZE // 4, y + SQUARE_SIZE // 2),
            (x + 3 * SQUARE_SIZE // 4, y + SQUARE_SIZE // 2)
        ])

class Bishop(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]

        for dr, dc in directions:
            for i in range(1, 8):
                new_row, new_col = row + i * dr, col + i * dc
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    if board.grid[new_row][new_col] is None:
                        valid_moves.append((new_row, new_col))
                    elif board.grid[new_row][new_col].color != self.color:
                        valid_moves.append((new_row, new_col))
                        break
                    else:
                        break
                else:
                    break

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.polygon(screen, color, [
            (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 4),
            (x + SQUARE_SIZE // 4, y + 3 * SQUARE_SIZE // 4),
            (x + 3 * SQUARE_SIZE // 4, y + 3 * SQUARE_SIZE // 4)
        ])

class Queen(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        directions = [
            (0, 1), (1, 0), (0, -1), (-1, 0),
            (1, 1), (1, -1), (-1, 1), (-1, -1)
        ]

        for dr, dc in directions:
            for i in range(1, 8):
                new_row, new_col = row + i * dr, col + i * dc
                if 0 <= new_row < 8 and 0 <= new_col < 8:
                    if board.grid[new_row][new_col] is None:
                        valid_moves.append((new_row, new_col))
                    elif board.grid[new_row][new_col].color != self.color:
                        valid_moves.append((new_row, new_col))
                        break
                    else:
                        break
                else:
                    break

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.circle(screen, color, (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 2), SQUARE_SIZE // 3)
        pygame.draw.polygon(screen, color, [
            (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 4),
            (x + SQUARE_SIZE // 4, y + 3 * SQUARE_SIZE // 4),
            (x + 3 * SQUARE_SIZE // 4, y + 3 * SQUARE_SIZE // 4)
        ])

class King(Piece):
    def get_valid_moves(self, board):
        valid_moves = []
        row, col = self.position
        directions = [
            (0, 1), (1, 0), (0, -1), (-1, 0),
            (1, 1), (1, -1), (-1, 1), (-1, -1)
        ]

        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < 8 and 0 <= new_col < 8:
                if board.grid[new_row][new_col] is None or board.grid[new_row][new_col].color != self.color:
                    valid_moves.append((new_row, new_col))

        return valid_moves

    def draw(self, screen):
        x, y = self.position[1] * SQUARE_SIZE, self.position[0] * SQUARE_SIZE
        color = (255, 255, 255) if self.color == "white" else (0, 0, 0)
        pygame.draw.rect(screen, color, (x + SQUARE_SIZE // 4, y + SQUARE_SIZE // 4, SQUARE_SIZE // 2, SQUARE_SIZE // 2))
        pygame.draw.polygon(screen, color, [
            (x + SQUARE_SIZE // 2, y + SQUARE_SIZE // 8),
            (x + 3 * SQUARE_SIZE // 8, y + SQUARE_SIZE // 4),
            (x + 5 * SQUARE_SIZE // 8, y + SQUARE_SIZE // 4)
        ])