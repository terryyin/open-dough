# Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
**Source:** [Verify the silent supplier wait in Codex](../../seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)

## Goal and scope

A maintainer gets a keep, revise, or remove recommendation for the silent
supplier wait on Codex from three real watches, or a record of what is
missing. The seed's Scope holds the watch definition, the two bars, and the
recommendation rule; its Shared evaluation holds the facts to retain and the
request-counting rule.

Excluded: acting on a revise or remove recommendation, the Claude Code
sibling story, a staged or paid watch, and maintained trace tooling. The
[Codex long-wait correction](https://github.com/terryyin/open-dough/blob/5ecc84b8c26b6352370f5dc0ba790cbb963ab264/.planning/seeds/SEED-399-long-codex-wait-without-model-requests.md#let-a-long-codex-wait-run-without-model-requests)
is separate work and no prerequisite.

This story changes no product code, test, or guidance, so it has no local
test gate. Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Key example | Observable signal |
| --- | --- |
| Fewer than three eligible watches | `## Watches` lists each watch found and names what is missing; the story sits lower in the backlog list; no recommendation is recorded |
| Three eligible watches | `## Watches` has one row per unchanged interval with the retained facts, and `## Recommendation` states keep, revise, remove, or inconclusive with the rule that produced it |
| A watch that bypassed the command | Its row is present with route `missed`, and the recommendation is remove |
| An unchanged interval of five minutes or less | Its row is present and marked not eligible |

A second reader can recompute any row from its rollout path and the two
timestamps bounding its interval.

## Decisive premises

| Premise | Consuming operation | Observation (2026-11-18, `python3 -I` over `~/.codex/sessions` on this machine) | Result |
| --- | --- | --- | --- |
| A developer's watch request can be found in a rollout | Slice 1 search | Rollout `01a1d22f-e0cd-7032-930d-5a9ff3011a64`, line 2818: `response_item` with `payload.type` `message`, `role` `user`, text "you watch it" | Settled. `event_msg` records with `user_message` did not carry it |
| Tool calls and their results carry timestamps and the command text | Slices 1 and 2 interval bounds | Rollout `01a1e7c4-7085-7903-83b8-bcfeec6241f9`: `custom_tool_call` named `exec` holds the command in `payload.input`; its `custom_tool_call_output` and each `function_call` named `wait` are timestamped | Settled |
| Model requests can be counted once each with their cached input | Slice 2 measurement | Same rollout: `token_usage_record` gives `response_id`, `usage.input_tokens`, and `usage.cached_input_tokens`; 15 distinct requests fell inside a 17-minute window | Settled |
| The installed release at the time of a watch can be read | Slice 1 eligibility | `git log --grep='Open Dough'` in `~/git/pygardon` lists dated "Update Open Dough guidance to 0.3.10N" commits; `session_meta.cwd` names the project | Settled for projects updated through those commits. For any other project, record the release as unknown |
| Rollouts from the watch period are still on this machine when the story is taken | Slice 1 search | `~/.codex/sessions/2026/10` and `2026/11` hold 3,390 rollouts today, including all of 15 to 18 November | Settled for today. Slice 1 records the earliest retained rollout date it finds |

## Ordered slices

### 1. Find the real Codex watches
Type: Behavior
Status: done
Proof: `## Watches` in this plan lists every watch found, each with rollout
path, project, installed release, request timestamp, route (`command` or
`missed`), and each unchanged interval's bounds and eligibility; a second
search with the recorded query returns the same rollouts.

Behavior: Codex rollouts since 2026-11-16 exist on this machine → the
maintainer searches them, under `~/.codex/sessions` and
`~/.codex/archived_sessions`, for user messages asking a held execution to
watch its supplier and for tool calls running `wait-for-publication.mjs`
with concrete arguments → every watch is listed with its eligibility. With
fewer than three eligible watches from different executions, the section
names what is missing, the story moves below the next eligible backlog
entry, and execution stops there with that resume condition.

### 2. Measure the watches and record the recommendation
Type: Behavior
Status: planned
Proof: each eligible interval's row shows unchanged duration, distinct model
requests inside it, requests allowed (one per started five minutes), cached
share of their summed input, and the publication or deadline outcome with
any missed publication, failed continuation, or developer intervention;
`## Recommendation` follows from those rows by the seed's rule. Recounting
one row from its rollout gives the same numbers.

Behavior: three eligible watches are listed → the maintainer measures each
unchanged interval and applies the rule → the plan records the Codex
recommendation, with a comparable historical wait and the token difference
when one supports it, and names the host step that woke the model when the
recommendation is revise.

## Watches

The search found **0 eligible Codex watches** and **0 confirmed missed
routes**. Three independent watches are missing, each with an unchanged
interval longer than five minutes on an installed release of Open Dough
0.3.102 or later. There are no per-watch facts or intervals to record.

### Search on 2026-11-18

The window ran from 2026-11-16 00:00 SGT to
2026-11-18 15:25:06.305685 SGT, excluding the cutoff. The search inventoried
`rollout-*.jsonl` and compressed rollouts under `~/.codex/sessions` and
`~/.codex/archived_sessions`. It selected 408 active rollouts by filename
date or modification time, including older sessions that ran into the window.
The earliest retained rollout was dated 2026-05-14. Archived rollouts ranged
from 2026-06-22 to 2026-11-04, with none selected for the window.

For a repeat, freeze the selected paths, their byte lengths, and the cutoff.
Read the JSONL records by timestamp within that window:

- Select `response_item` messages with `payload.role = user`. Match watch,
  monitor, poll, keep an eye, check back, and notification requests, plus
  wait, hold, pause, dependency, supplier and publication language.
  Check brief approvals against the preceding assistant message and
  use the surrounding turn to identify the thing being watched. Strip skill
  and environment envelopes before judging the request. A request can count
  even when the command was bypassed.
- Select `response_item` calls with `payload.type` of `function_call` or
  `custom_tool_call` whose arguments or input mention
  `wait-for-publication.mjs`. Inspect those calls for an actual invocation
  with concrete remote and ref arguments.

Both scans of the frozen snapshot returned the same 767 message matches
in 364 rollouts and 31 command-name references in eight rollouts. The
message matches included 486 in coordinator rollouts. They resolved to
workflow boilerplate, scheduled ticket or upstream-news monitoring,
unrelated waits and notifications, authoring the follow-up, or this
investigation. The command-name references were source reads, searches,
and development or test material. None launched the command.

This result covers the retained files through the cutoff and requests the
query and surrounding turns could identify. Missing rollouts and requests
outside those search terms remain unobserved.

### Deferral and resume

Return this story to the backlog immediately after the Codex long-wait
correction, the next eligible entry at deferral. On the next take, repeat the
search and refresh this record before starting slice 2. Begin measurement
once the evidence includes three qualifying executions. If the shortfall
remains, record the updated evidence and defer again.

## Current decisions

- Bars and recommendation rule are fixed in the seed before any watch is
  read (Terry, 2026-11-18). A watch on an installation that includes the
  Codex long-wait correction is judged against the same bars; record which
  installation each watch ran on.
- Each read is a one-off query kept in the conversation. The plan keeps
  rollout paths and timestamps, never trace contents.

## Execution context

- Aino-chan, Story Branch Mode, `codex/verify-the-silent-supplier-wait-in-codex`.
  Take `a5b5f6dc5cacdac28139c15ba9496187975d2b4a` was accepted on `origin/main`.
- Slice 1 changes planning records only. The reference query, both terminal
  run records, and the candidate disposition report are in this worktree's
  Git evidence directory and the execution conversation.

## Story obligations

## Plan review

Refinement was not needed: two slices, each with one outcome and its own
proof. This review identified no remaining slice-specific concern.
