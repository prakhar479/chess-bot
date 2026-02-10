# API & Bot Interface

## Bot execution protocol

Bots are executables (or scripts) invoked by the match runner. For every move, the
runner spawns the bot process, writes a single-line FEN string to stdin, and expects a
single-line UCI move on stdout.

### Example

```bash
echo "startpos" | python bots/random_bot.py
```

### Required behavior

- Read **one** FEN string from stdin.
- Output **one** UCI move (e.g., `e2e4`, `g7g8q`).
- Exit cleanly within the timeout.

## HTTP API

### `GET /api/health`
Returns API health status.

### `GET /api/bots`
List registered bots.

### `POST /api/bots`
Register a bot.

Payload:
```json
{
  "name": "RandomBot",
  "command": ["python", "bots/random_bot.py"]
}
```

### `POST /api/matches`
Run a single match.

Payload:
```json
{
  "white_bot_id": "uuid",
  "black_bot_id": "uuid",
  "move_timeout_s": 2
}
```

### `GET /api/matches/{match_id}`
Retrieve match details, including PGN and moves.

### `GET /api/leaderboard`
Return computed standings across all matches.

### `POST /api/tournaments`
Run a round-robin tournament.

Payload:
```json
{
  "name": "Spring Invitational",
  "bot_ids": ["uuid", "uuid"],
  "rounds": 2,
  "move_timeout_s": 2
}
```

### `GET /api/tournaments/{tournament_id}`
Get tournament metadata and standings.
