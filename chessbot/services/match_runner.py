"""Match execution with chess rules enforcement."""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4

import chess
import chess.pgn

from chessbot.models import MatchRecord
from chessbot.services.monitoring import record_timing
from chessbot.services.sandbox import run_sandboxed

LOGGER = logging.getLogger(__name__)


@dataclass
class MatchConfig:
    """Config values for running a match."""

    move_timeout_s: float
    max_moves: int


@dataclass
class BotConfig:
    """Bot configuration for a match."""

    bot_id: UUID
    name: str
    command: List[str]


@dataclass
class MatchResult:
    """Result values from a completed match."""

    record: MatchRecord


def _select_bot(turn: chess.Color, white: BotConfig, black: BotConfig) -> BotConfig:
    """Select the bot for the current turn."""
    return white if turn == chess.WHITE else black


def run_match(white: BotConfig, black: BotConfig, config: MatchConfig) -> MatchResult:
    """Run a single match and return a stored match record."""
    board = chess.Board()
    move_history: List[str] = []
    fen_history: List[str] = [board.fen()]
    match_id = uuid4()
    start_time = time.time()

    winner: Optional[str] = None
    result = "draw"

    for _ply in range(config.max_moves):
        bot = _select_bot(board.turn, white, black)
        fen = board.fen()
        LOGGER.info("Requesting move", extra={"bot": bot.name, "fen": fen})

        move_start = time.monotonic()
        sandbox_result = run_sandboxed(
            bot.command,
            input_text=f"{fen}\n",
            timeout_s=config.move_timeout_s,
        )
        record_timing("bot_move", time.monotonic() - move_start, bot=bot.name)

        if sandbox_result.timed_out:
            winner = black.name if board.turn == chess.WHITE else white.name
            result = "forfeit"
            break

        move_text = sandbox_result.stdout.strip()
        if not move_text:
            winner = black.name if board.turn == chess.WHITE else white.name
            result = "forfeit"
            break

        try:
            move = chess.Move.from_uci(move_text)
        except ValueError:
            winner = black.name if board.turn == chess.WHITE else white.name
            result = "forfeit"
            break

        if move not in board.legal_moves:
            winner = black.name if board.turn == chess.WHITE else white.name
            result = "forfeit"
            break

        board.push(move)
        move_history.append(move.uci())
        fen_history.append(board.fen())

        if board.is_checkmate():
            winner = bot.name
            result = "white" if board.turn == chess.BLACK else "black"
            break
        if board.is_stalemate() or board.is_insufficient_material() or board.is_fivefold_repetition():
            result = "draw"
            break

    duration_s = time.time() - start_time

    pgn_game = chess.pgn.Game.from_board(board)
    pgn_text = str(pgn_game)

    record = MatchRecord(
        id=match_id,
        white_bot_id=white.bot_id,
        black_bot_id=black.bot_id,
        result=result,
        winner=winner,
        moves=move_history,
        fen_history=fen_history,
        pgn=pgn_text,
        duration_s=duration_s,
        created_at=datetime.fromtimestamp(start_time, tz=timezone.utc),
    )
    return MatchResult(record=record)
