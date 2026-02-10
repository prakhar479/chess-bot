#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
from uuid import uuid4

from chessbot.services.match_runner import BotConfig, MatchConfig, run_match
from chessbot.services.scheduler import round_robin

bots = [
    BotConfig(uuid4(), "Random", ["python", "bots/random_bot.py"]),
    BotConfig(uuid4(), "Greedy", ["python", "bots/greedy_bot.py"]),
]

pairings = round_robin([str(bot.bot_id) for bot in bots], rounds=1)
for pairing in pairings:
    white = next(bot for bot in bots if str(bot.bot_id) == pairing.white_id)
    black = next(bot for bot in bots if str(bot.bot_id) == pairing.black_id)
    result = run_match(white, black, MatchConfig(move_timeout_s=2, max_moves=20))
    print(result.record.result, result.record.moves[:5])
PY
