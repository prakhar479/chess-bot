# Chess Bot Competition Platform

A modular chess-bot tournament platform with a FastAPI backend, sandboxed bot execution,
round-robin tournament scheduler, and a lightweight web UI for match playback and
leaderboards.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[ci]
python -m chessbot.web.app
```

Visit http://localhost:8000 for the dashboard.

## Bot interface

Bots read a single FEN string on stdin and respond with a legal UCI move on stdout.
See `API.md` for the full protocol and `bots/` for examples.

## Scripts

- `scripts/run_server.sh`: Run the API + UI.
- `scripts/run_tournament.sh`: Example of running a round-robin tournament from the CLI.

## Testing

```bash
pytest
```

## Docker

```bash
docker build -t chess-bot-platform .
docker run -p 8000:8000 chess-bot-platform
```

## Repository layout

- `chessbot/` - Backend services, API, and core match runner.
- `chessbot/static/` - Web UI assets.
- `bots/` - Example bots that implement the interface.
- `chessbot/tests/` - Unit + integration tests.

## Extending

1. Register a new bot with the API.
2. Add custom tournament schedulers in `chessbot/services/scheduler.py`.
3. Replace the in-process store with a database if needed.

See `DESIGN.md` for the architecture and `API.md` for the HTTP API.
