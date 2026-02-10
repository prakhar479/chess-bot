"""Sandbox helpers for running untrusted bot processes."""
from __future__ import annotations

import os
import resource
import subprocess
from dataclasses import dataclass
from typing import List


@dataclass
class SandboxResult:
    """Result from running a sandboxed command."""

    stdout: str
    stderr: str
    timed_out: bool
    returncode: int


def _apply_limits(cpu_seconds: int, memory_bytes: int) -> None:
    """Apply CPU and memory limits in the subprocess."""
    resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds))
    resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))


def run_sandboxed(
    command: List[str],
    input_text: str,
    timeout_s: float,
    cpu_seconds: int = 1,
    memory_bytes: int = 256 * 1024 * 1024,
) -> SandboxResult:
    """Run a command in a restricted subprocess."""
    env = {"PATH": os.environ.get("PATH", "")}
    try:
        completed = subprocess.run(
            command,
            input=input_text,
            text=True,
            capture_output=True,
            timeout=timeout_s,
            env=env,
            preexec_fn=lambda: _apply_limits(cpu_seconds, memory_bytes),
        )
        return SandboxResult(
            stdout=completed.stdout.strip(),
            stderr=completed.stderr.strip(),
            timed_out=False,
            returncode=completed.returncode,
        )
    except subprocess.TimeoutExpired as exc:
        return SandboxResult(
            stdout=(exc.stdout or "").strip(),
            stderr=(exc.stderr or "").strip(),
            timed_out=True,
            returncode=-1,
        )
