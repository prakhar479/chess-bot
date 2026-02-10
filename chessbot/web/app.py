"""FastAPI application for the chess bot platform."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import UUID, uuid4

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from chessbot.models import (
    BotCreate,
    BotRecord,
    MatchCreate,
    MatchRecord,
    Standing,
    TournamentCreate,
    TournamentRecord,
)
from chessbot.services.match_runner import BotConfig, MatchConfig, run_match
from chessbot.services.scheduler import round_robin
from chessbot.services.standings import compute_standings
from chessbot.services.storage import STORE

LOGGER = logging.getLogger(__name__)

APP = FastAPI(
    title="Chess Bot Competition Platform",
    description="A modular chess-bot tournament platform with sandboxed bot execution and web UI",
    version="1.0.0",
)

# Add CORS middleware for API endpoint access
APP.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).resolve().parents[1] / "static"

APP.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@APP.get("/")
def index() -> FileResponse:
    """Serve the main dashboard."""
    return FileResponse(STATIC_DIR / "index.html")


@APP.get("/admin")
def admin_panel() -> FileResponse:
    """Serve the admin panel."""
    return FileResponse(STATIC_DIR / "admin.html")


@APP.get("/tournaments/{tournament_id}")
def tournament_view(tournament_id: str) -> FileResponse:
    """Serve the tournament details page."""
    return FileResponse(STATIC_DIR / "tournaments.html")


@APP.get("/matches/{match_id}")
def match_view(match_id: str) -> FileResponse:
    """Serve the match viewer page."""
    return FileResponse(STATIC_DIR / "match.html")


@APP.get("/api/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


@APP.get("/api/bots", response_model=list[BotRecord])
def list_bots() -> list[BotRecord]:
    """List all registered bots."""
    return STORE.list_bots()


@APP.post("/api/bots", response_model=BotRecord)
def create_bot(payload: BotCreate) -> BotRecord:
    """Register a new bot."""
    return STORE.create_bot(payload)


@APP.post("/api/matches", response_model=MatchRecord)
def create_match(payload: MatchCreate) -> MatchRecord:
    """Run a single match and store the result."""
    try:
        white_bot = STORE.get_bot(payload.white_bot_id)
        black_bot = STORE.get_bot(payload.black_bot_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Bot not found") from exc

    result = run_match(
        white=BotConfig(
            bot_id=white_bot.id,
            name=white_bot.name,
            command=white_bot.command,
        ),
        black=BotConfig(
            bot_id=black_bot.id,
            name=black_bot.name,
            command=black_bot.command,
        ),
        config=MatchConfig(
            move_timeout_s=payload.move_timeout_s,
            max_moves=payload.max_moves,
        ),
    )
    STORE.save_match(result.record)
    return result.record


@APP.get("/api/matches/{match_id}", response_model=MatchRecord)
def get_match(match_id: UUID) -> MatchRecord:
    """Return match details by ID."""
    try:
        return STORE.get_match(match_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Match not found") from exc


@APP.get("/api/leaderboard", response_model=list[Standing])
def get_leaderboard() -> list[Standing]:
    """Return computed standings across all matches."""
    if not STORE.matches:
        return []
    return compute_standings(STORE.matches.keys())


@APP.post("/api/tournaments", response_model=TournamentRecord)
def create_tournament(payload: TournamentCreate, background: BackgroundTasks) -> TournamentRecord:
    """Create a tournament and schedule matches in the background."""
    for bot_id in payload.bot_ids:
        if bot_id not in STORE.bots:
            raise HTTPException(status_code=404, detail=f"Bot {bot_id} not found")

    tournament_id = uuid4()
    record = TournamentRecord(
        id=tournament_id,
        name=payload.name,
        bot_ids=payload.bot_ids,
        rounds=payload.rounds,
        move_timeout_s=payload.move_timeout_s,
        max_moves=payload.max_moves,
        matches=[],
        standings=[],
        created_at=datetime.now(timezone.utc),
    )
    STORE.save_tournament(record)
    background.add_task(_run_tournament, record.id)
    return record


@APP.get("/api/tournaments", response_model=list[TournamentRecord])
def list_tournaments() -> list[TournamentRecord]:
    """List all tournaments."""
    return list(STORE.tournaments.values())


@APP.get("/api/tournaments/{tournament_id}", response_model=TournamentRecord)
def get_tournament(tournament_id: UUID) -> TournamentRecord:
    """Return tournament details."""
    try:
        return STORE.get_tournament(tournament_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Tournament not found") from exc


@APP.get("/api/matches", response_model=list[MatchRecord])
def list_matches(limit: int = 100, offset: int = 0) -> list[MatchRecord]:
    """List all matches with pagination."""
    matches = list(STORE.matches.values())
    # Sort by creation date (newest first)
    matches.sort(key=lambda m: m.created_at, reverse=True)
    return matches[offset : offset + limit]


def _run_tournament(tournament_id: UUID) -> None:
    """Background runner for tournaments."""
    tournament = STORE.get_tournament(tournament_id)
    pairings = round_robin([str(bot_id) for bot_id in tournament.bot_ids], tournament.rounds)

    for pairing in pairings:
        white_bot = STORE.get_bot(UUID(pairing.white_id))
        black_bot = STORE.get_bot(UUID(pairing.black_id))
        result = run_match(
            white=BotConfig(
                bot_id=white_bot.id,
                name=white_bot.name,
                command=white_bot.command,
            ),
            black=BotConfig(
                bot_id=black_bot.id,
                name=black_bot.name,
                command=black_bot.command,
            ),
            config=MatchConfig(
                move_timeout_s=tournament.move_timeout_s,
                max_moves=tournament.max_moves,
            ),
        )
        STORE.save_match(result.record)
        tournament.matches.append(result.record.id)

    tournament.standings = compute_standings(tournament.matches)
    STORE.save_tournament(tournament)


def custom_openapi():
    """Customize OpenAPI schema."""
    if APP.openapi_schema:
        return APP.openapi_schema
    
    openapi_schema = get_openapi(
        title="Chess Bot Platform API",
        version="1.0.0",
        description="""
        A robust chess-bot tournament platform API with:
        - Bot registration and management
        - Single match execution with sandboxed execution
        - Round-robin tournament scheduling
        - Match history and leaderboard tracking
        
        All bots are executed in isolated processes with strict resource limits.
        """,
        routes=APP.routes,
    )
    
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    
    APP.openapi_schema = openapi_schema
    return APP.openapi_schema


APP.openapi = custom_openapi


def main() -> None:
    """Entrypoint for running the app with python -m chessbot.web.app."""
    import uvicorn

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    LOGGER.info("Starting Chess Bot Platform")
    LOGGER.info("Visit http://localhost:8000 for the dashboard")
    LOGGER.info("API docs available at http://localhost:8000/docs")
    
    uvicorn.run("chessbot.web.app:APP", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    main()
