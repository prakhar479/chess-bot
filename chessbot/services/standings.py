"""Leaderboard computation helpers."""
from __future__ import annotations

from collections import defaultdict
from typing import Dict, Iterable, List
from uuid import UUID

from chessbot.models import MatchRecord, Standing
from chessbot.services.storage import STORE


RESULT_POINTS = {
    "white": (1.0, 0.0),
    "black": (0.0, 1.0),
    "draw": (0.5, 0.5),
    "forfeit": (1.0, 0.0),
}


def compute_standings(match_ids: Iterable[UUID]) -> List[Standing]:
    """Compute leaderboard standings for the given matches."""
    totals: Dict[UUID, Dict[str, float]] = defaultdict(lambda: {
        "wins": 0,
        "losses": 0,
        "draws": 0,
        "points": 0.0,
    })

    for match_id in match_ids:
        match: MatchRecord = STORE.get_match(match_id)
        white_points, black_points = RESULT_POINTS.get(match.result, (0.0, 0.0))
        totals[match.white_bot_id]["points"] += white_points
        totals[match.black_bot_id]["points"] += black_points

        if match.result == "draw":
            totals[match.white_bot_id]["draws"] += 1
            totals[match.black_bot_id]["draws"] += 1
        elif match.result == "white":
            totals[match.white_bot_id]["wins"] += 1
            totals[match.black_bot_id]["losses"] += 1
        elif match.result == "black":
            totals[match.black_bot_id]["wins"] += 1
            totals[match.white_bot_id]["losses"] += 1
        elif match.result == "forfeit":
            if match.winner == STORE.get_bot(match.white_bot_id).name:
                totals[match.white_bot_id]["wins"] += 1
                totals[match.black_bot_id]["losses"] += 1
            else:
                totals[match.black_bot_id]["wins"] += 1
                totals[match.white_bot_id]["losses"] += 1

    standings: List[Standing] = []
    for bot_id, stats in totals.items():
        bot = STORE.get_bot(bot_id)
        standings.append(
            Standing(
                bot_id=bot_id,
                name=bot.name,
                wins=int(stats["wins"]),
                losses=int(stats["losses"]),
                draws=int(stats["draws"]),
                points=float(stats["points"]),
            )
        )

    standings.sort(key=lambda entry: (-entry.points, entry.name))
    return standings
