"""Greedy capture bot that prioritizes material gains."""
import sys
import chess

PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
    chess.KING: 0,
}


def score_move(board: chess.Board, move: chess.Move) -> int:
    """Score a move based on captured piece value."""
    if board.is_capture(move):
        captured = board.piece_at(move.to_square)
        if captured:
            return PIECE_VALUES.get(captured.piece_type, 0)
    return 0


def main() -> None:
    """Read a FEN and output a greedy capture move."""
    fen = sys.stdin.readline().strip()
    board = chess.Board(fen)
    moves = list(board.legal_moves)
    if not moves:
        print("0000")
        return
    moves.sort(key=lambda mv: score_move(board, mv), reverse=True)
    print(moves[0].uci())


if __name__ == "__main__":
    main()
