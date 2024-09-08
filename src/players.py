import abc
import pygame

class Player(abc.ABC):
    def __init__(self, color):
        self.color = color

    @abc.abstractmethod
    def get_move(self, board):
        pass

class HumanPlayer(Player):
    def get_move(self, board):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return None
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:  # Left mouse button
                        col = event.pos[0] // 80
                        row = event.pos[1] // 80
                        return (row, col)
        return None

class AIPlayer(Player):
    def get_move(self, board):
        # Implement a simple AI strategy (random legal move)
        import random
        while True:
            row, col = random.randint(0, 7), random.randint(0, 7)
            if board.is_valid_move((row, col), (row, col)):
                return (row, col)
    
