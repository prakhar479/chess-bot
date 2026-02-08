"""In-memory storage for bots, matches, and tournaments."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List
from uuid import UUID, uuid4

from chessbot.models import BotCreate, BotRecord, MatchRecord, TournamentRecord


@dataclass
class Storage:
    """Simple in-memory storage with UUID keys."""

    bots: Dict[UUID, BotRecord] = field(default_factory=dict)
    matches: Dict[UUID, MatchRecord] = field(default_factory=dict)
    tournaments: Dict[UUID, TournamentRecord] = field(default_factory=dict)

    def create_bot(self, payload: BotCreate) -> BotRecord:
        """Store a new bot record."""
        bot_id = uuid4()
        record = BotRecord(
            id=bot_id,
            name=payload.name,
            command=payload.command,
            created_at=datetime.now(timezone.utc),
        )
        self.bots[bot_id] = record
        return record

    def list_bots(self) -> List[BotRecord]:
        """Return all bots."""
        return list(self.bots.values())

    def get_bot(self, bot_id: UUID) -> BotRecord:
        """Fetch bot by ID."""
        return self.bots[bot_id]

    def save_match(self, record: MatchRecord) -> None:
        """Persist a match record."""
        self.matches[record.id] = record

    def get_match(self, match_id: UUID) -> MatchRecord:
        """Fetch match by ID."""
        return self.matches[match_id]

    def save_tournament(self, record: TournamentRecord) -> None:
        """Persist a tournament record."""
        self.tournaments[record.id] = record

    def get_tournament(self, tournament_id: UUID) -> TournamentRecord:
        """Fetch tournament by ID."""
        return self.tournaments[tournament_id]


STORE = Storage()
