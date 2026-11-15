# Long-running slice categories (temporary)

Claude Code and Codex execution evidence from the 30 days ending 2026-11-15.
Both audits distinguish active problem-solving from time spent waiting. The
Claude audit measures implementer sessions and estimates list-price cost. The
Codex audit measures intervals between slice acceptances and counts coordinator
and worker requests. Durations, rates, and costs apply to their own samples.

## Claude Code

- 266 executions ran 929 slice-implementer subagents.
- **Long implementer session:** more than 20 active minutes. The transcript
  classifier excludes idle gaps over 20 minutes and any single gap over
  90 minutes.
- 218 implementer sessions were long (23%). They cost $1,503 at list prices,
  57% of the $2,644 total implementer cost.
- At the median, 62% of a long implementer's active time fell in Bash command
  or background-wait intervals. That bucket includes tests, polling, builds,
  and other commands.
- **Model minutes:** estimated from transcript intervals labeled as model
  activity.
- **Primary category:** the first category that matches, in table order, under
  keyword rules applied to the agent's handback and tool calls. A session can
  match several reasons. Each session contributes once to the table.

| Primary category | Implementer sessions | Median active | Median model min | Cost | Median $/min | What it looks like |
|---|---|---|---|---|---|---|
| Stuck or contended waits | 9 | 50m | 15 | $81 | 0.15 | A Docker lock held by another session, self-matching `pgrep` loops, and usage limits. Stalls of 3h, 9h and 32h fell outside active time. |
| Trunk reconciliation | 7 | 33m | 15 | $58 | 0.20 | Merging trunk into the branch mid-slice, up to 77 conflicted files |
| Flaky test or race diagnosis | 33 | 33m | 16 | $248 | 0.17 | Scroll, re-arm and shutdown races investigated one hypothesis per round. Highest median model time. |
| Proof degraded by machine load | 23 | 37m | 15 | $239 | 0.20 | Suites timed out under competing load. Base/candidate reruns tested whether load caused the failure. |
| Measurement or performance qualification | 41 | 34m | 12 | $286 | 0.15 | Base/candidate pairs, timing baselines, and memory budgets |
| Real-environment or production-scale proof | 25 | 29m | 9 | $109 | 0.11 | Docker/Colima, native Codex journeys, and a 1h 6m archive import |
| Broad sweep or migration | 24 | 26m | 13 | $139 | 0.21 | 437 timeout overrides removed, 53–77 files changed, and test trees moved |
| Coordinator follow-up rounds | 15 | 28m | 14 | $81 | 0.17 | The same implementer resumed for several rounds of review fixes |
| Ordinary slice with slow focused proof | 41 | 28m | 11 | $261 | 0.15 | Normal coding, with a focused Playwright or pytest gate taking about 17 minutes in total |

The retained keyword classification flagged 23 of the 218 for an incomplete,
oversized or false-premise stop, or a human decision.

### Timing and cost signals

- Cost tracks model minutes (correlation 0.83) and turns (0.88) better than
  active wall time (0.75).
- 77 of the 218 long sessions used under 10 estimated model minutes.
- Model minutes across all implementers: median 4.6, 90th percentile 14.4,
  95th percentile 18.8.

| Candidate threshold across all 929 implementer sessions | Sessions flagged | Their cost |
|---|---|---|
| Model time over 10 minutes | 177 | $1,438 |
| Model time over 15 minutes | 85 | $942 |
| Model time over 20 minutes | 39 | $581 |
| Active time over 30 minutes | 117 | $1,055 |
| Active time over 45 minutes | 56 | $681 |

- Recorded cache writes on requests after gaps greater than five minutes cost
  about $8 across the 218 long sessions. This is a cache-write estimate for
  those requests. Polling can incur model costs throughout a wait.

## Codex

- 634 slice intervals across 151 plans had usable Git acceptance timestamps.
  Each runs from the previous acceptance, or execution kickoff for slice 1,
  to the current acceptance. It includes active work and elapsed waits.
- 406 intervals exceeded 15 minutes. The 75 intervals of at least an hour
  used 8.18B processed tokens and 151.2M uncached input plus output, 43% of
  uncached input plus output in the timed cohort. Processed tokens include
  cached input.
- Of those 75 intervals, 58 had a model request during more than three-quarters
  of their elapsed minute buckets. Eleven had a gap of at least 30 minutes
  with no model request. Request timestamps show activity, and the session
  traces and Git records establish its cause where available.
- The timed cohort requires a completed slice. The paused-supplier example
  below comes from a separate unfinished execution.

## Shared categories and decisions

Use the action the evidence calls for. One slice can move through several of
these categories.

| Reason | Evidence across the audits | Decision |
|---|---|---|
| Implementation or refactoring expands | Claude's broad sweeps included migrations across dozens of files. Codex's review page-object slice took 3h 8m across shared test ownership and several proof groups. [Open Dough SEED-300, slice 5](https://github.com/terryyin/open-dough/commit/67bb91d54) | Check active work after 10–15 minutes. Look for independent outcomes or proof loops, then split at a boundary that can be proved on its own. |
| A known proof run is progressing | Claude saw both ordinary slow focused tests and production-scale runs. During 45 minutes covering two full Codex local suites, 25 requests used 17.2K uncached input plus output. [Open Dough SEED-261, slice 9](https://github.com/terryyin/open-dough/commit/fc8cff0e1) | Give the named test, CI job, or deployment its own deadline and one observer. Wake on a result, failure, or overdue evidence. |
| A measurement needs longer compute or repeated trials | Claude saw base/candidate timing and memory comparisons. A scheduled eight-hour Codex-observed search produced its comparison. The run window also saw 483 model requests and 102M processed tokens. [Pygardon overnight search](https://github.com/terryyin/pygardon/commit/edbec5ff6) | Set the decision criterion and trial budget up front. Give compute and monitoring separate budgets. |
| Failed proof exposes a defect, race, or false premise | Claude saw repeated race diagnosis. A Codex import hit two distinct limits, heap and serialization, then moved persistence to a later slice. [Open Dough SEED-358, slice 5](https://github.com/terryyin/open-dough/commit/b67a93327) | Count diagnosis as active work. Retry to test a concrete explanation. Split newly discovered work when it has its own outcome. |
| Required proof conditions are unavailable | Claude saw load-related timeouts. Codex's dashboard timeout slice mixed real repairs with missing AC power and repeated searches for a valid machine-load window. [Open Dough SEED-287, slice 13](https://github.com/terryyin/open-dough/commit/47e99704c) | Record the required condition and yield. Resume when it holds or when an authorized equivalent proof route is available. |
| A developer decision or action is pending | Doughnut's Codex schema-retirement slice had a 7h 28m gap without a request while fresh sign-in confirmation was outstanding. [Doughnut SEED-073, slice 15](https://github.com/nerds-odd-e/doughnut/commit/5bd5b3b89) | Ask for the exact decision or observation. Resume on the answer. |
| A supplier outcome is pending | Pygardon's Codex ranking slice had a 10h 50m gap without requests and resumed after both suppliers landed. [Pygardon ranking, slice 2](https://github.com/terryyin/pygardon/commit/43addc552) | Record the required supplier outcome and resume on its publication. A paused supplier calls for a stop and a resume condition. |
| Work is stuck or observation is looping | Claude saw lock contention, self-matching process checks and usage limits. In Codex SEED-324, empty waits, timeouts and clock checks on a paused supplier preceded requests that used 71.7M processed tokens. [SEED-324 audit](../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines) | Make one bounded liveness check. Continue observing with a known owner and deadline, or stop with a recovery condition. |
| Trunk changes or review returns reopen work | Claude measured trunk reconciliation and coordinator follow-up rounds separately. One Codex slice had both a supplier integration and a source amendment before it could publish. [Open Dough SEED-285, slice 1](https://github.com/terryyin/open-dough/commit/d41306055) | Track reconciliation and review rounds separately for diagnosis. Keep their active effort cumulative while they serve the same unresolved outcome. Recheck only affected proof. |

Trial a 10–15 minute checkpoint for active work. Continue with new evidence
toward one outcome and a bounded next action. Give a live wait its own
evidence deadline. When neither can advance the outcome, apply
[early stop or split](../Distribution/src/skills/dough-execute-plan/references/finish-or-stop.md#stop-or-split-before-more-work).

## Source data

- Claude Code scripts and implementer dossier:
  `/private/tmp/claude-501/-Users-terryyin-git-open-dough/0c2773f1-a8a5-46d3-a4f8-4a7ca5b3fad2/scratchpad/lr/`
- Codex acceptance intervals and long-interval telemetry:
  `/tmp/od_long_base.json` and `/tmp/od_long_telemetry.jsonl`.
