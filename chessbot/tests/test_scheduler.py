"""Tests for the round-robin scheduler."""
from chessbot.services.scheduler import round_robin


def test_round_robin_pairings() -> None:
    """Round robin should create pairings without BYEs for even bots."""
    pairings = round_robin(["a", "b", "c", "d"], rounds=1)
    assert len(pairings) == 2
    assert {pairings[0].white_id, pairings[0].black_id} != {
        pairings[1].white_id,
        pairings[1].black_id,
    }
