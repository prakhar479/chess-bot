"""Monitoring hooks for metrics and logging."""
from __future__ import annotations

import logging
from dataclasses import dataclass

LOGGER = logging.getLogger("chessbot.monitoring")


@dataclass
class TimingMetric:
    """Timing metric for a named operation."""

    name: str
    duration_s: float
    metadata: dict


def record_timing(name: str, duration_s: float, **metadata: object) -> None:
    """Emit a timing metric via logging."""
    metric = TimingMetric(name=name, duration_s=duration_s, metadata=metadata)
    LOGGER.info("metric", extra={"metric": metric})
