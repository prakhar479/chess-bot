# Chess Bot Competition Platform Design

## Overview

The platform is a modular chess-bot competition system that accepts external bot
executables, runs round-robin tournaments with strict enforcement of chess rules and
timeouts, and exposes an admin UI and spectator views for match playback and
leaderboards.

## Architecture

```text
+------------------------+        +-----------------------------+
|  Web UI (static JS)    |<------>|  FastAPI Gateway            |
|  - Dashboard           |  HTTP  |  - Bot registry             |
|  - Leaderboards        |        |  - Tournament scheduler     |
|  - Match viewer        |        |  - Match history API         |
+------------------------+        +--------------+--------------+
                                                |
                                                v
                                     +----------+-----------+
                                     | Match Runner Service |
                                     | - Chess rules engine |
                                     | - Bot sandboxing     |
                                     | - Move validation    |
                                     +----------+-----------+
                                                |
                                                v
                                     +----------+-----------+
                                     | Bot Process Sandbox |
                                     | - CPU/memory limits |
                                     | - stdin/stdout API  |
                                     +---------------------+
```

## Subsystems

### API & Web UI
- **FastAPI** serves a JSON API plus static HTML/JS for admins and spectators.
- Endpoints allow registering bots, creating tournaments, triggering matches, and
  viewing match history/leaderboards.

### Match Runner
- Uses `python-chess` to maintain board state.
- Validates every bot move against legal move lists.
- Enforces per-move timeouts and total game limits.
- Records moves, results, and PGN.

### Scheduler
- Generates round-robin pairings, supports configurable number of rounds.
- Runs matches sequentially (safe default) with a hook for parallel scheduling.

### Sandboxing
- Each bot move spawns a short-lived subprocess.
- Uses Linux `resource` limits (CPU time + memory) and a hard timeout to terminate
  misbehaving bots.
- Sanitizes bot output and rejects invalid/illegal moves.

### Observability
- Structured logging for match lifecycle events.
- Timing metrics (move duration, total game duration) stored per match.

## Data Models

### Bot
- `id`: UUID
- `name`: display name
- `command`: executable + args
- `created_at`

### Match
- `id`: UUID
- `white_bot_id`, `black_bot_id`
- `result`: `white`, `black`, `draw`, `forfeit`
- `moves`: list of UCI moves
- `pgn`: full PGN string
- `duration_s`

### Tournament
- `id`: UUID
- `name`
- `bot_ids`
- `rounds`
- `matches`: list of match IDs
- `leaderboard`: calculated standings

## Communication Contracts

### Bot protocol
- Input: single line FEN string (side to move included).
- Output: UCI move (e.g., `e2e4`, `g7g8q`).
- Constraints: must respond within `move_timeout_s`, output must be legal.

### API contracts
- JSON over HTTP.
- Errors use consistent `detail` fields.

## Safety Rules

- **Timeouts**: per-move timeout enforced via subprocess timeout.
- **CPU & memory**: hard caps via `resource.setrlimit`.
- **Move validation**: only legal moves accepted; illegal move == forfeit.
- **Replay**: every move recorded as UCI + resulting FEN.

## Deployment

- `uvicorn` runs the FastAPI app.
- Dockerfile included for production.
- GitHub Actions CI runs unit/integration tests.
