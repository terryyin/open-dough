# Retained agent effort

A read-only report of the tokens, requests and workflow an agent execution
used, read from local Usage history and retained native Codex, Claude and Cursor
transcripts. It calls no provider API and changes nothing.

```sh
node dashboard/server/compareAgentEffort.ts --list
node dashboard/server/compareAgentEffort.ts --task 'EXACT-TASK-ID' --json
node dashboard/server/compareAgentEffort.ts --host claude --family SESSION \
  --from 2026-11-12T00:00:00Z --until 2026-11-15T00:00:00Z
node dashboard/server/compareAgentEffort.ts --host cursor --list
node dashboard/server/compareAgentEffort.ts --comparison comparison.json
```

- `--task` selects one execution with its replies and workers, through shared
  Usage ownership. `--family` selects a whole native session family in a
  half-open `[from, until)` window; Cursor families report the whole retained
  directory because transcripts cannot prove time boundaries.
- `--home`, `--store` and the repeatable `--codex-file`/`--claude-file`/
  `--*-root` flags pin the evidence; use an isolated `--home` for a bounded audit.
- A comparison manifest has `baseline` and `candidate`, each with optional
  `notes` and an `executions` array of `{ "label", "host", ... }` members that
  take the same selection flags without `--`.

Every report states its accounting rule, its gaps and the evidence it read.
Unknown figures stay unknown rather than zero, and per-agent peaks are never
summed. A comparison only describes the difference; it never picks a winner or
claims a cause. Read the retained context before judging it.
