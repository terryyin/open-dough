# Source review — SEED-157#check-stalled-delegated-verification

**Launch:** Fresh general-purpose reviewer (no conversation inheritance).
**Input:** Story Goal, Scope, Constraints, Deferred promises, Key examples,
Evaluation, and Completion only — no plan, return, product, or proof.
**Reviewer agent:** `3a4343d2-0829-4e30-8e2c-6824b3a6814e`

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A coordinator waiting on delegated verification notices a possible stall and returns a bounded diagnosis, safe recovery, or explicit unfinished handoff before an unexplained wait consumes applicable CI observation coverage or requires the developer to ask for status. | slice 1 | observed: `src/skills/dough-execute-plan/references/overdue-delegated-verification.md#check-an-overdue-delegated-verification` + await routing in `delegation.md`; guided rehearsal stalled/healthy cases in ODF-369 Delivered response |
| 2 | Extend the shared execution guidance at the coordinator/command-owner handoff. | slice 1 | observed: overdue rule linked from `#await-delegated-results-without-empty-calls` in source `delegation.md` |
| 3.1 | Decide when to inspect using the command’s expected proof window | slice 1 | observed: overdue trigger on expected proof window exceeded |
| 3.2 | Decide when to inspect using the existing project runner bound | slice 1 | observed: expensive-proof expectedness reuse + no universal duration; unknown duration → bounded next observation (no invented timeout) |
| 3.3 | Decide when to inspect using last meaningful progress | slice 1 | observed: retain last meaningful progress; fresh progress keeps owner; stall needs process/progress evidence |
| 3.4 | Decide when to inspect using remaining applicable observer coverage | slice 1 | observed: trigger when remaining applicable CI observation coverage calls for a check |
| 4 | An expectation is a reason to check, not a new command timeout. | slice 1 | observed: “reason to inspect, not a new command timeout and not an automatic interrupt or failure” |
| 5 | When duration, process state, or observer coverage is unknown: retain that uncertainty and choose a bounded next observation rather than waiting indefinitely. | slice 1 | observed: unknown → retain uncertainty + bounded next observation |
| 6.1 | Distinguish active expensive verification | slice 1 | observed: expensive-proof reuse + yielded/fresh-progress path under verification ownership |
| 6.2 | Distinguish work still queued | slice 1 | observed: Queued observation bullet |
| 6.3 | Distinguish a yielded command with a supported continuation handle | slice 1 | observed: Yielded with a supported continuation bullet |
| 6.4 | Distinguish a suspected non-yielding or stuck process | slice 1 | observed: Suspected non-yielding or stuck bullet |
| 7.1 | Keep command with existing execution evidence | slice 1 | observed: retain command identity |
| 7.2 | Keep actor with existing execution evidence | slice 1 | observed: retain owning actor |
| 7.3 | Keep host/checkout with existing execution evidence | slice 1 | observed: retain host/checkout |
| 7.4 | Keep process or handle with existing execution evidence | slice 1 | observed: retain process or supported continuation handle |
| 7.5 | Keep last progress with existing execution evidence | slice 1 | observed: retain last meaningful progress |
| 7.6 | Keep applicable CI identity/coverage with existing execution evidence | slice 1 | observed: retain applicable CI observer identity and coverage |
| 8 | For healthy work: follow the supported continuation and keep its real terminal result. | slice 1 | observed: Yielded path + guided healthy rehearsal to terminal DONE |
| 9.1 | For stalled or inaccessible work: recover only within established command/process ownership | slice 1 | observed: Suspected stall recover-within-ownership; guided owned INT→KILL; unrelated processes left alone |
| 9.2 | Or hand back the exact unfinished proof and its recovery owner | slice 1 | observed: hand back exact unfinished proof with recovery owner; Inaccessible bullet |
| 10 | Account truthfully for an observer that has ended; command recovery does not manufacture restored CI coverage. | slice 1 | observed: lost coverage + outstanding local proof separately; no manufactured coverage |
| 11 | No fabricated terminal result or completion. | slice 1 | observed: progress alone is not completion; no fabricated results in constraints of section |
| 12 | No killing or restarting unowned work. | slice 1 | observed: inspect/recover only identified owned command; leave unrelated processes; no unowned termination |
| 13 | No restart solely because a healthy run is slow. | slice 1 | observed: do not restart/duplicate solely because it outlasted the expected window |
| 14.1 | Use existing process controls, runner bounds, and CI lifecycle rather than imposing a universal test duration | slice 1 | observed: no universal duration; CI monitoring lifecycle retained |
| 14.2 | Rather than building a second process supervisor | slice 1 | observed: do not invent a second process supervisor; do not repurpose CI worker liveness |
| 15 | These limits come from the retained ODF-369 responsibility split and evaluation, not from the number of examples below. | slice 1 | observed: ODF-369 Delivered response cites responsibility split; runtime guidance free of ODF codes (ADR 0006) |
| 16.1 | Deferred: Pygardon’s fake-sleep repair (project-local) | slice 1 | observed: not implemented here; ODF-369 keeps local response separate |
| 16.2 | Deferred: separate test-runner containment story (project-local) | slice 1 | observed: not implemented here |
| 16.3 | No new host adapter | slice 1 | observed: shared guidance only; no host adapter added |
| 16.4 | No persistent liveness registry | slice 1 | observed: no registry added |
| 16.5 | No observer replacement policy | slice 1 | observed: existing CI lifecycle; no observer restart invented |
| 16.6 | No broad test-performance optimization | slice 1 | observed: not in change |
| 17 | This preparation does not authorize implementation or a release. | slice 1 | observed: release not authorized (ODF-369 unreleased); implementation authorized by Take/execution start, not by preparation text alone |
| 18 | Example 1 — stall vs remaining CI coverage journey | slice 1 | observed: guidance + guided stalled rehearsal (check without human status; retain evidence; bounded recovery before coverage window) |
| 19 | Example 2 — healthy long run with yield journey | slice 1 | observed: Yielded bullet + guided healthy rehearsal continued to terminal without duplicate |
| 20 | Example 3 — queued, not started journey | slice 1 | observed: Queued bullet; do not classify absent process as stuck |
| 21 | Example 4 — stuck but controls unavailable journey | slice 1 | observed: Inaccessible bullet; unfinished handoff names missing observation, known state, recovery owner |
| 22 | Example 5 — observer budget ended journey | slice 1 | observed: CI budget ended / CI_MONITOR_UNAVAILABLE → lost coverage and outstanding local proof separately |
| 23.1 | Reconstruct DD-371 with a controlled stuck verification | slice 1 | observed: guided stalled busy-spin rehearsal recorded in ODF-369 |
| 23.2 | Reconstruct DD-371 with a healthy long-running comparison | slice 1 | observed: guided healthy progressing child rehearsal in ODF-369 |
| 24.1 | Record time to the first useful diagnosis | slice 1 | observed: ODF-369 ~3 s first useful check |
| 24.2 | Record added liveness-check effort | slice 1 | observed: ODF-369 2 useful inspections vs no-check baseline |
| 24.3 | Record human status requests | slice 1 | observed: ODF-369 0 human status requests |
| 24.4 | Record delay avoided against the stated baseline | slice 1 | observed: ODF-369 bounded comparison only (not DD-371 speedup prediction) |
| 25 | Keep reconstructed, guided, and ordinary-use evidence separate. | slice 1 | observed: ODF-369 labels guided rehearsal; ordinary-use request separate; not resolved |
| 26 | The historical 32-hour wait is context, not a measured new speedup. | slice 1 | observed: ODF-369 limits; scaled fixtures only |
| 27 | Walk the queued, unavailable-control, and ended-observer boundaries. | slice 1 | observed: guidance bullets + ODF-369 walk of queued/inaccessible/ended-observer |
| 28 | The useful result is timely evidence and an owned next action without sacrificing valid proof or unrelated processes. | slice 1 | observed: guided diagnosis inside observation window; healthy terminal kept; sentinel ownership retry |
| 29.1 | At ODF-369 retain the actual response revisions | slice 1 | observed: ODF-369 Response revisions (SHA after delivery) |
| 29.2 | Retain first containing release when it exists | slice 1 | observed: Containing release: none yet (unreleased) |
| 29.3 | Retain proof/limits | slice 1 | observed: ODF-369 Guided controlled rehearsal + Limits |
| 29.4 | Retain a checkable ordinary-use observation request | slice 1 | observed: ODF-369 First ordinary-use criterion / request |
| 30 | Mark an unreleased response truthfully until a release contains it. | slice 1 | observed: unreleased fact in ODF-369 |
| 31 | Queueing or delivering guidance is not resolution or evidence of sustained improvement. | slice 1 | observed: Follow-up and Limits: not resolved; ordinary-use not started |
