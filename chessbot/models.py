"""Pydantic models for API payloads and responses."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BotCreate(BaseModel):
    """Request payload for registering a bot."""

    name: str = Field(..., min_length=1)
    command: List[str] = Field(..., min_length=1)


class BotRecord(BaseModel):
    """Stored bot metadata."""

    id: UUID
    name: str
    command: List[str]
    created_at: datetime


class MatchCreate(BaseModel):
    """Request payload for running a match."""

    white_bot_id: UUID
    black_bot_id: UUID
    move_timeout_s: float = Field(2.0, gt=0.0, le=30.0)
    max_moves: int = Field(200, gt=1, le=500)


class MatchRecord(BaseModel):
    """Stored match data."""

    id: UUID
    white_bot_id: UUID
    black_bot_id: UUID
    result: str
    winner: Optional[str]
    moves: List[str]
    fen_history: List[str]
    pgn: str
    duration_s: float
    created_at: datetime


class TournamentCreate(BaseModel):
    """Request payload for running a tournament."""

    name: str = Field(..., min_length=1)
    bot_ids: List[UUID] = Field(..., min_length=2)
    rounds: int = Field(1, ge=1, le=10)
    move_timeout_s: float = Field(2.0, gt=0.0, le=30.0)
    max_moves: int = Field(200, gt=1, le=500)


class Standing(BaseModel):
    """Leaderboard entry."""

    bot_id: UUID
    name: str
    wins: int
    losses: int
    draws: int
    points: float


class TournamentRecord(BaseModel):
    """Stored tournament data."""

    id: UUID
    name: str
    bot_ids: List[UUID]
    rounds: int
    move_timeout_s: float
    max_moves: int
    matches: List[UUID]
    standings: List[Standing]
    created_at: datetime
