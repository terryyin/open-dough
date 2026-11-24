# Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
**Source:** [Verify the silent supplier wait in Codex](../../seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)

## Goal and scope

A maintainer gets a keep, revise, or remove recommendation for the silent
supplier wait on Codex from three qualifying watches in different real
executions, or a record of what is missing. The seed defines eligibility,
request-counting exclusions, and the decision rule. Apply
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) by
comparing the measured watches with the historical wait where comparable and
limiting the recommendation to the releases and host conditions observed.

Excluded: acting on a revise or remove recommendation, the Claude Code
sibling story, a staged or paid watch, and maintained trace tooling.
Open Dough 0.3.102 introduced the supplier watch. The Codex long-wait
correction shipped in 0.3.107. Both use the seed's evaluation bars.

The local gate is a repeatable read-only trace check. For long local runs,
use `caffeinate -s -i` on AC power under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Key example | Owner | Observable signal |
| --- | --- | --- |
| Fewer than three qualifying executions | 1 | `## Watches` lists the watches, clear misses, and the shortfall. The new backlog position and resume condition are recorded. The recommendation waits. |
| A bypass or an interval of five minutes or less | 1 | The bypass has route `missed`. Each short interval is recorded as ineligible. |
| Intervals within both bars, including zero requests | 2 | Rows show the allowance, observed requests, and cache share where applicable. If handling succeeded throughout, the recommendation is keep. |
| Excess wakes with correct result handling | 2 | The recommendation is revise and cites the host action and the interval that exceeded the bar. |
| A proven bypass, missed result, or failed continuation | 2 | Once the sample qualifies, the recommendation is remove and cites the failure. |
| Publication during judgment of the previous result | 2 | The next interval starts on the rerun with the same deadline. The row shows whether it caught and handled the publication. |
| Evidence gaps prevent a verdict after the sample qualifies | 2 | The recommendation is inconclusive and names the gap. |

A second reader can recompute any row from its rollout path and the two
timestamps bounding its interval.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Developer requests and command results can be correlated in retained rollouts | Slices 1 and 2 search and interval bounds | On 2026-11-24, `python3 -I` over the known samples in `~/.codex/sessions` recovered the user request from the compressed 2026-11-13 rollout `01a1d22f-e0cd-7032-930d-5a9ff3011a64` at line 2819. In the controlled 2026-11-18 rollouts ending `eb2305d55dcb` and `eb5be690b336`, the parser found the launch at line 16 and the respective publication and deadline outputs at line 19. | The request and both terminal paths are readable on this host. The controlled watches establish the trace shape. |
| Requests can be counted once each with their cached input | Slice 2 measurement | On 2026-11-24, `python3 -I` over rollout `01a1e7c4-7085-7903-83b8-bcfeec6241f9` reproduced 15 distinct `token_usage_record` response IDs between `2026-11-17T08:40:21Z` and `08:57:34Z`, with 6,667,648 cached of 6,670,639 input tokens. | The historical interval is a measurable comparison. Missing meters for a natural watch remain unknown. |
| The release in effect can be attributed | Slice 1 eligibility | `session_meta.cwd` named the project in the 2026-11-18 search. On 2026-11-24, `git log --grep='Open Dough'` in `~/git/pygardon` still returned dated installation commits, including the 0.3.112 update at `3e0a01d85`. Git tags `v0.3.102` and `v0.3.107` identify the two release boundaries. | Use the rollout's project and history at the watch timestamp, or direct version evidence in the rollout. Record the release as unknown when the installation cannot be established. |
| The retained rollouts can be searched as a bounded snapshot | Slice 1 search and repeatability | The two 2026-11-18 searches described below agreed on 767 request and 31 command-name matches. The 2026-11-24 replay read known compressed and plain samples on the same machine. | Repeat on a fresh snapshot when taken and record its coverage. The story handles an empty or incomplete sample by deferring. |

## Ordered slices

### 1. Find the real Codex watches
Type: Behavior
Status: done
Proof: `## Watches` in this plan lists every watch found, each with rollout
path, project, installed release, request timestamp, route (`command` or
`missed`), and each unchanged interval's bounds and eligibility; a second
search with the recorded query returns the same rollouts.

Behavior: the maintainer freezes the available Codex rollouts from
2026-11-16 through the current cutoff, under `~/.codex/sessions` and
`~/.codex/archived_sessions`, for user messages asking a held execution to
watch its supplier and for tool calls running `wait-for-publication.mjs`
with concrete arguments → every watch is listed with its eligibility. For
a bypass, cite the trace events that bound continued waiting on the same
supplier, or mark the duration unknown. With fewer than three eligible
watches from different executions, the section
names what is missing, the story moves below the next eligible backlog
entry, and execution stops there with that resume condition.

### 2. Measure the watches and record the recommendation
Type: Behavior
Status: planned
Proof: each eligible interval's row shows unchanged duration, distinct model
requests inside it, requests allowed (one per started five minutes), cached
share of their summed input when measured, and the publication or deadline
outcome with any missed publication, failed continuation, or developer intervention;
`## Recommendation` follows from those rows by the seed's rule. Recounting
one row from its rollout gives the same numbers. Record missing usage as
unknown and zero counted requests as a cache share that does not apply.

Behavior: after the resume check below confirms three qualifying executions,
the maintainer measures their unchanged intervals and follows each publication
or deadline through the coordinator's next action. Map each terminal result
to its launch, refs, and deadline. Check the dependency agreement as it stood
at the publication to judge the continuation. For a nonqualifying publication,
verify that the rerun reused the returned deadline. Bound the recommendation
by the observed releases and host conditions. Cite the comparable historical wait
and the token difference where supported, and name the host step that woke
the model when the recommendation is revise.

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

The 2026-11-18 execution deferred the story behind the Codex long-wait
correction, which has since shipped. On the next take, repeat slice 1's
search against a fresh snapshot and merge new findings with retained watch
facts, counting each execution once. Begin slice 2 once three executions
qualify. If the shortfall remains, record the new cutoff and shortfall,
surface any clear misses, and defer below the next eligible backlog entry.

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

Refinement was not needed. The two slices keep discovery and deferral
together, then measure and judge the resulting sample. This review found no
remaining slice-specific concern.
