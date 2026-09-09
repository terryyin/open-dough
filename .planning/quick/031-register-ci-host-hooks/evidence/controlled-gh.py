#!/usr/bin/env python3
import sys, json
if sys.argv[1:3] == ["run", "list"]:
    print(json.dumps([{
        "databaseId": 42,
        "attempt": 1,
        "headSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "headBranch": "main",
        "workflowName": "CI",
        "event": "push",
        "status": "in_progress",
        "conclusion": None,
        "url": "https://github.com/fixture/example/actions/runs/42",
    }]))
else:
    print(json.dumps({
        "jobs": [{"databaseId": 101, "name": "acceptance-4ed6fb00ed2a5823", "conclusion": "failure"}]
    }))
