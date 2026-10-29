"""Retain native task boundaries as trial data; never infer CPU time or money."""
import argparse
import datetime as dt
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--log", required=True)
parser.add_argument("--task", required=True)
parser.add_argument("--role", required=True)
parser.add_argument("--phase", type=int, default=1)
parser.add_argument("--out", required=True)
args = parser.parse_args()
launches, returns = [], []
for line_number, line in enumerate(Path(args.log).open(), 1):
    event = json.loads(line)
    payload = event.get("payload", {})
    if payload.get("name") in ("spawn_agent", "followup_task"):
        try:
            invocation = json.loads(payload.get("arguments", "{}"))
        except (TypeError, json.JSONDecodeError):
            continue
        target = str(invocation.get("target", "")).rsplit("/", 1)[-1]
        if invocation.get("task_name") == args.task or target == args.task:
            launches.append((line_number, event["timestamp"]))
    if (payload.get("type") == "agent_message"
            and payload.get("author") == "/root/" + args.task):
        text = "\n".join(item.get("text", "") for item in payload.get("content", []))
        if "Message Type: FINAL_ANSWER" in text:
            returns.append((line_number, event["timestamp"]))
if args.phase < 1 or len(launches) < args.phase:
    raise SystemExit("missing native dispatch for requested phase")
launch = launches[args.phase - 1]
next_line = launches[args.phase][0] if len(launches) > args.phase else float("inf")
phase_returns = [r for r in returns if launch[0] < r[0] < next_line]
if len(phase_returns) != 1:
    raise SystemExit(f"incomplete/ambiguous native phase return: {len(phase_returns)}")
returned = phase_returns[0]
seconds = (dt.datetime.fromisoformat(returned[1].replace("Z", "+00:00"))
           - dt.datetime.fromisoformat(launch[1].replace("Z", "+00:00"))).total_seconds()
if seconds < 0 or returned[0] <= launch[0]:
    raise SystemExit("invalid native event ordering")
record = {"task": args.task, "role": args.role, "dispatch": launch[1],
          "return": returned[1], "elapsed_seconds": seconds,
          "source_log": str(Path(args.log)), "launch_line": launch[0],
          "return_line": returned[0], "basis": "native parent dispatch to native FINAL_ANSWER"}
if args.phase != 1:
    record["phase"] = args.phase
out = Path(args.out)
records = json.loads(out.read_text()) if out.exists() else []
existing = [entry for entry in records if entry["task"] == args.task and entry["role"] == args.role]
if existing and existing != [record]:
    raise SystemExit("refusing to overwrite conflicting timing evidence")
if not existing:
    records.append(record)
    out.write_text(json.dumps(records, indent=2) + "\n")
print(json.dumps(record))
