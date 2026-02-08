"""Tests for the match runner."""
from __future__ import annotations

from uuid import uuid4

from chessbot.services.match_runner import BotConfig, MatchConfig, run_match


def test_run_match_smoke() -> None:
    """Ensure a match can run between two sample bots."""
    white = BotConfig(
        bot_id=uuid4(),
        name="Random",
        command=["python", "bots/random_bot.py"],
    )
    black = BotConfig(
        bot_id=uuid4(),
        name="Greedy",
        command=["python", "bots/greedy_bot.py"],
    )
    result = run_match(white, black, MatchConfig(move_timeout_s=2, max_moves=20))
    assert result.record.moves
    assert result.record.fen_history
