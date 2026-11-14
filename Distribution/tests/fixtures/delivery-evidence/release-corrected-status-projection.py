"""Controlled status projection; functions retained from pygardon 9fffcee62."""
from datetime import UTC, datetime


def recorded_moment(text):
    return datetime.strptime(text, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=UTC)


def _phase(record: dict) -> str:
    """`finished` once the operation has its outcome; otherwise the stage now
    running, a joined operation's before the record's own, else `running`.
    Records written before stages were recorded at their start have no
    ``stage``."""
    if record["outcome"]:
        return "finished"
    running = [
        entry["stage"]
        for entry in [record, *record["operations"]]
        if entry.get("stage")
    ]
    return running[-1] if running else "running"


def _operation(record: dict) -> dict:
    """What the status shows of a progress record: its own state, its stage
    timeline, its latest capacity measurement and the operations that joined
    it, whose outcomes stay visible when the record's own never arrives. Stage
    details name containers, images, reservations and exit codes only."""
    finished = record["finished"]
    ended = recorded_moment(finished) if finished else datetime.now(UTC)
    stages = record["stages"]
    capacity = record["capacity"]
    return {
        "operation": record["operation"],
        "phase": _phase(record),
        "last_stage": stages[-1]["name"] if stages else None,
        "started": record["started"],
        "finished": finished,
        "elapsed_seconds": round(
            (ended - recorded_moment(record["started"])).total_seconds(), 1
        ),
        "outcome": record["outcome"],
        "error": record["error"],
        "stages": stages,
        "capacity": capacity[-1] if capacity else None,
        "operations": record["operations"],
    }
