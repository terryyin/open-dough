#!/usr/bin/env python3
# Controlled `gh` stand-in for Quick 032 Slice 3's native CI-watch acceptance.
# Unlike Quick 031's evidence/controlled-gh.py (which only handles the
# startup `run list` call and returns a jobs-shaped body for anything else,
# regardless of the fields actually requested), this responds correctly to
# every call the real observer makes: `run list` (startup discovery),
# `run view --json jobs` (failed-job detail), and `run view --json
# attempt,status,conclusion,url` (tracked-run refresh), so the real polling
# state machine in watch-ci-execution.mjs / ci-failures.mjs runs unmodified.
import json
import os
import sys

TOKEN = os.environ.get("CONTROLLED_GH_TOKEN", "acceptance-unknown")
REPO = os.environ.get("CONTROLLED_GH_REPO", "fixture/example")
BRANCH = os.environ.get("CONTROLLED_GH_BRANCH", "main")
MODE = os.environ.get("CONTROLLED_GH_MODE", "failure")
RUN_ID = 42
JOB_ID = 101

args = sys.argv[1:]

if MODE == "unavailable":
    # Simulates a broken bridge (e.g. gh not authenticated/reachable) so the
    # observer's consecutive-error path emits CI_MONITOR_UNAVAILABLE.
    sys.stderr.write("controlled-gh.py: simulated gh failure (unavailable mode)\n")
    sys.exit(1)


def run_summary():
    return {
        "databaseId": RUN_ID,
        "attempt": 1,
        "headSha": "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee0",
        "headBranch": BRANCH,
        "workflowName": "CI",
        "event": "push",
        "status": "completed",
        "conclusion": "failure",
        "url": f"https://github.com/{REPO}/actions/runs/{RUN_ID}",
        "createdAt": "2026-09-09T00:00:00Z",
    }


if args[:2] == ["run", "list"]:
    print(json.dumps([run_summary()]))
elif args[:2] == ["run", "view"] and "--json" in args:
    fields = args[args.index("--json") + 1]
    if "jobs" in fields.split(","):
        print(
            json.dumps(
                {"jobs": [{"databaseId": JOB_ID, "name": TOKEN, "conclusion": "failure"}]}
            )
        )
    else:
        summary = run_summary()
        print(json.dumps({k: summary[k] for k in fields.split(",") if k in summary}))
else:
    sys.stderr.write(f"controlled-gh.py: unhandled invocation: {args!r}\n")
    sys.exit(1)
