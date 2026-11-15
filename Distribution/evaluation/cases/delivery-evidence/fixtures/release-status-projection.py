"""Controlled status projection; functions retained from pygardon 403d1fb1b."""
from datetime import UTC, datetime


def recorded_moment(text):
    return datetime.strptime(text, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=UTC)


def _operation(record: dict) -> dict:
    """What the status shows of a progress record."""
    finished = record["finished"]
    ended = recorded_moment(finished) if finished else datetime.now(UTC)
    stages = record["stages"]
    return {
        "operation": record["operation"],
        "phase": "finished" if record["outcome"] else "running",
        "last_stage": stages[-1]["name"] if stages else None,
        "started": record["started"],
        "finished": finished,
        "elapsed_seconds": round(
            (ended - recorded_moment(record["started"])).total_seconds(), 1
        ),
        "outcome": record["outcome"],
        "error": record["error"],
    }
