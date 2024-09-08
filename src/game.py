import pygame
from board import Board

class PlayerAdapter:
    def __init__(self, player):
        self.player = player

    def make_move(self, board):
        return self.player.get_move(board)

class ChessGame:
    def __init__(self, white_player, black_player):
        self.board = Board()
        self.white_player = PlayerAdapter(white_player)
        self.black_player = PlayerAdapter(black_player)
        self.current_player = self.white_player
        self.selected_piece = None

    def play(self):
        pygame.init()
        screen = pygame.display.set_mode((640, 640))
        pygame.display.set_caption("Chess Game")
        clock = pygame.time.Clock()

        running = True
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

            screen.fill((255, 255, 255))
            self.board.draw(screen)

            if self.selected_piece:
                row, col = self.selected_piece
                pygame.draw.rect(screen, (255, 0, 0), (col * 80, row * 80, 80, 80), 3)

            pygame.display.flip()

            current_color = "white" if self.current_player == self.white_player else "black"
            if self.board.is_checkmate(current_color):
                print(f"Checkmate! {('Black' if current_color == 'white' else 'White')} wins!")
                running = False
            elif self.board.is_check(current_color):
                print(f"{current_color.capitalize()} is in check!")

            move = self.current_player.make_move(self.board)
            if move:
                row, col = move
                if self.selected_piece:
                    if self.board.move_piece(self.selected_piece, move):
                        self.selected_piece = None
                        self.current_player = self.black_player if self.current_player == self.white_player else self.white_player
                    else:
                        self.selected_piece = move if self.board.grid[row][col] and self.board.grid[row][col].color == current_color else None
                else:
                    self.selected_piece = move if self.board.grid[row][col] and self.board.grid[row][col].color == current_color else None

            clock.tick(30)

        pygame.quit()

def play_game(white_player, black_player):
    game = ChessGame(white_player, black_player)
    game.play()