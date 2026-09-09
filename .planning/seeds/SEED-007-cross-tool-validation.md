---
id: SEED-007
status: active
planted: 2026-09-07
planted_during: Story 7 refinement follow-up on repeated native validation
trigger_when: Finish the standalone client release
scope: small
---

# SEED-007: Complete a real standalone update in Claude Code

## Goal

Resolve the concrete remaining question in the standalone client workflow with
one useful update and subsequent skill use. Use an ordinary Claude Code session
and manual review of the result.

<a id="accept-standalone-client-workflow"></a>

### 3. Use the standalone updater in Claude Code

**Status:** Done (2026-09-09, Quick 032 Slice 2). A real native Claude Code
session (`bash tests/dough-adr-awareness-claude-delivery-to-use.sh --native`,
Claude Code 2.1.266) ran an ordinary, non-forced update from its recorded
`SOURCE`, then a fresh session used the installed `dough-adr-awareness` skill
to enumerate a real fixture authority conflict and stop for human precedence
without changing any client file. The earlier "denied Bash" launch is
superseded: this run used `--dangerously-skip-permissions` against an
entirely local, disposable fixture, which is the project's already-
established pattern for this exact native check (see the sibling
Codex/Cursor `dough-adr-awareness-*-delivery-to-use.sh` tests). Evidence:
`.planning/quick/032-refuse-managed-hook-command-variants/evidence/claude-update-use/`.
**Candidate:** `6682816a2385d96066883b5e4dc073b28e4b3d4f`; choose the current
release candidate with SEED-001 Story 7 when starting work.
**Goal:** The maintainer can run the ordinary updater and use its result in Claude Code.
**Scope:** Start an ordinary permitted session on a disposable client, update
from its remembered source, and use the installed ADR guidance on one concrete
task. Fix a reproduced product defect or resolve the session setup manually.
**Evaluation:** The client contains the expected release and the installed skill
produces an actionable result using the client's decision context. A short result
in the active release work is sufficient.
**Effort:** S, low confidence; session permissions determine the first step.
**Depends on:** A runnable Claude Code session and the selected candidate.

## Current release inputs

Codex has an observed ordinary update and ADR conflict result. Cursor has an
observed ordinary update and subsequent use. Review changed functionality against
these useful outcomes when selecting the candidate. Use the established skill
layout conventions for all three tools.
