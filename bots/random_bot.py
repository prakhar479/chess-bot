"""Random-move chess bot for the platform."""
import random
import sys

import chess


def main() -> None:
    """Read a FEN and output a random legal move."""
    fen = sys.stdin.readline().strip()
    board = chess.Board(fen)
    moves = list(board.legal_moves)
    if not moves:
        print("0000")
        return
    print(random.choice(moves).uci())


if __name__ == "__main__":
    main()
