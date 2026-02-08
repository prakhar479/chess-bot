"""Round-robin tournament scheduler."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class Pairing:
    """Represents a pairing for a single game."""

    white_id: str
    black_id: str


def round_robin(bot_ids: List[str], rounds: int) -> List[Pairing]:
    """Generate round-robin pairings for the given bots."""
    if len(bot_ids) < 2:
        return []

    ids = bot_ids[:]
    if len(ids) % 2 == 1:
        ids.append("BYE")

    n = len(ids)
    pairings: List[Pairing] = []

    for _round in range(rounds):
        for i in range(n // 2):
            white = ids[i]
            black = ids[n - 1 - i]
            if white != "BYE" and black != "BYE":
                pairings.append(Pairing(white_id=white, black_id=black))
        ids = [ids[0]] + [ids[-1]] + ids[1:-1]

    return pairings
