# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-12 against `11d48b956607e3485f5771c59509b111be3626b8`.
Frequency counts distinct executions, not commands, retries, or repairs.
Grouping related symptoms does not establish a shared cause or duplicate an
execution. A repaired individual race does not resolve every suite failure.

## Priority assessment

**Maintenance assessment (2026-11-07):** No new project story. DD-378 is retired after `SEED-229#reduce-remote-sessions-traffic` (`e49035d31:.planning/slice-plans/462-reduce-remote-sessions-traffic/PLAN.md`, 2026-11-04) attributed four full-suite failures to base `e69e74cf7` and repaired all four in the execution ([history](docs/maintainer/project-findings-history.md#dd-378)). DD-412 records `SEED-241#load-intent-without-disruption-or-bulk-source-transfer` (plan 477, 2026-11-05) running the full dashboard suite under `caffeinate -s -i` (2,044 passed, 1 skipped), while its two settling observations remain open. DD-420, DD-421, DD-428, DD-429 and DD-430 moved here from DearDough.md (`8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md`) as repaired dashboard, fake-Cursor harness and server-bundle observations alongside DD-432 and DD-433; the misplaced `SEED-232#reduce-running-cursor-session-requests` occurrence under DD-414 (`2d80ac1fc`, shifted in merge `bd1b1afbd6`) is restored to ODF-367 in DearDough.md. DD-419/DD-432 (local suite admission across focused and container runs) and DD-426/DD-433 (6-minute job caps on slow runners and upload stalls) remain open pending design and budget decisions.

**Maintenance assessment (2026-11-03):** No new project story. DD-376 is retired after 68 post-repair runs without an install failure ([history](docs/maintainer/project-findings-history.md#earlier-reviews)). DD-406's local facet is already repaired in project documentation and awaits a re-profile. DD-411's slow-setup shard breach is runner speed on a story branch, recorded under DD-279 without counting against its allocator criterion. DD-347's third row-pressure exposure keeps it open; its remedy reshapes shared guidance reads and is not selected here. DD-374 and DD-378's responses are on `main` and released in `v0.3.80`; their observations remain open.

**Maintenance assessment (2026-10-25):** Select one new project response: SEED-151#balance-test-shares (since implemented and closed; story recoverable at `8dd20d66:.planning/seeds/SEED-151-test-share-reliability.md#balance-test-shares`), queued at the time, not resolved, for DD-279's renewed allocation failure in plan 350. This demonstrated CI failure outranks the strongest alternative, DD-336's one loaded-run missing-result failure whose cause remains unknown. The browser-restart and mouse-press repairs have no established post-fix recurrence; DD-320 still awaits a qualifying paid replay and is not duplicated. Direction and existing work remain unchanged. No new occurrence is created by this review.

**Maintenance assessment (2026-10-21):** DD-309's measured repository-tooling response first ships in `v0.3.67`; later usage remains unobserved. DD-297's source-directory race was repaired at `059cda6920e0934f4288641d2f4cfa8927d6726b`, while its separate loaded child-start observation remains qualified. The selected response to DD-320's extra paid run and inconclusive replay is implemented at `fba97e9fbb90c4f97909a5e2ab899a0031c58308`: the [maintained pre-launch comparison](tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) advances useful learning before spending another native run; its native outcome remains unobserved. The strongest alternative is the older browser-restart race (DD-296): its concrete failing callers were repaired, and the remaining related exposure has no new observed failure. Preserve that residual and other open findings without another implementation commitment. Existing repaired responses remain historical; incomplete exposure does not establish retirement. No new occurrence is added by this review.

1. **Proof-selection visibility — opt-in verified locally.** [DD-216/DD-243](#dd-216)
   repeats across five executions (plans 217, 261, 263, 264, 297), costing
   extra listings or reruns. [Opt-in selection records](dashboard/tests/README.md)
   now provide same-run selection/attempt evidence through the configured strict
   reporter: the observed focused run selected and passed 24 tests in 21.999
   seconds, retained its JSON record, and removed its passing output directory.
   Choosing a fresh path and reading it remain manual. The general acceptance mistake of overriding that policy remains
   DD-262 in DearDough.md; it is not another project occurrence.
2. **Browser journey stability — open, unqueued.** [DD-278](#dd-278)
   records three CI failures across two executions. Both concrete spec families
   were repaired; plan 293 ran a branch predating the repair, so it is not
   recurrence after the fix. Shared interaction helpers still allow a click
   before all page reads settle. Retain that qualified residual, not a claim
   that the repaired specs still fail.
3. **Suite timing and diagnosis — DD-279 response implemented, hosted outcome unobserved; DD-275 open, unqueued.** [DD-279](#dd-279)
   records two shard deadlines in one execution; a refreshed duration list and
   twelve shares repair those runs, while duration ordering still ages without
   a refresh step. Plan 350 met the same mechanism in the Node suite's share
   budget (one added test file, repaired by refreshing `tests/longest-first`).
   SEED-151#balance-test-shares answers both with one allocator that deals by
   recorded duration and previews the deal before a push; its hosted outcome
   is unobserved. [DD-275](#dd-275) records one separate execution whose
   within-run load was unobserved. These are related diagnostic/margin concerns,
   not one demonstrated cause. The repaired individual timeout DD-280 and
   shell budget breach DD-283 are removed below.
4. **Shell observation reliability — open, unqueued.** [DD-187](#dd-187)
   records one Linux SIGPIPE repair cycle. The named observer was fixed;
   early-exit pipelines remain in two repository test helpers. Those are
   residual risks, not additional observed failures.
5. **Paid native-run permission handoff — low, unqueued.** [DD-161](#dd-161)
   records one execution's two permission round trips. The boundary is the
   host's; no change to released Open Dough behavior is justified by it.

The descendant cache policy and opt-in selection evidence are implemented and
measured below. The selection record helps parallel contributors obtain reliable local
proof. Neither changes published skills, shared workflow rules, or the
dashboard's runtime contract. The existing native-observation queue item and
Taken CI-monitoring story stay unchanged. Earlier suite repairs remain completed;
new or residual causes above are not evidence that every earlier fix failed.

## Dashboard specs can lose a mouse press to a reflow (open, unqueued)

<a id="dd-278"></a>

### DD-278 — Two dashboard specs lost a mouse press to a reflow between press and release, on two CI runs in one day

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-278).

## Dashboard shards run at their time ceiling (response implemented, hosted outcome unobserved)

<a id="dd-279"></a>

### DD-279 — A dashboard shard reached its 320-second deadline after one spec file was added

[Retained findings, response, measured allocation, observation criterion and occurrence evidence](docs/maintainer/project-test-findings.md#dd-279): one allocator deals both suites' shares by recorded duration (`61d16b66`, `34f3192f` and the slice 3 commit of SEED-151#balance-test-shares); the refreshed dashboard list predicts twelve shards within one spec file of each other where the positional deal measured 462.5 to 686.4, and the landed revision's run 40189712361 measured 458.0 to 694.2 with per-shard runner speed ratios 0.74 to 1.18; resolution waits on ten `main` runs with file-set changes and no allocation-owned breach.

## Concurrent dashboard runs lost a run's result file (open, unqueued)

<a id="dd-336"></a>

### DD-336 — `dashboard-concurrent-runs.sh` failed once in a loaded whole-suite run on a missing `.last-run.json`

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-336).

## Focused proof bypasses the project test runner (open, unqueued)

<a id="dd-330"></a>

### DD-330 — Delegated focused proof ran `node --test` directly, so it missed both the runner's Git environment and its quiet-pass rule

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-330).

## Quiet passing checks obscure the selected proof (opt-in verified locally)

<a id="dd-216"></a>

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-216).

**Observed outcome (2026-10-12):** The opt-in
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` path retained the actual selection, attempts
and strict verdict of one 24-test focused invocation without a counting rerun.
The full reporter/capability proof passed in 21.999 seconds; the reporter stayed
silent and its passing output directory was absent. Normal npm and direct
config entry from another directory also retained their own outer selection
across nested runs. [Usage and evidence interpretation](dashboard/tests/README.md)
cover the remaining cost: supply an unused path before invocation, retain it,
then read it alongside the strict command exit. Opt-out runs still have no count
record. This verifies the repository tooling response, not universal adoption
or a change to published proof-acceptance guidance.

<a id="dd-243"></a>

DD-243 remains the same finding; its later occurrences are
[retained with DD-216](docs/maintainer/project-test-findings.md#dd-243).

## Shell observations can invert a result on Linux (open, unqueued)

<a id="dd-187"></a>

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-187).

## Shell formatting can change harness semantics (open, unqueued)

<a id="dd-319"></a>

### DD-319 — The shell formatter turned hyphenated associative-array keys into arithmetic after proof had passed

### Occurrences

- Execution: SEED-010#schedule-proof-after-refactoring / plan 323, first implementation `788d817296adfc0b23a672489619b3ea8bbaf52a`
  - Timestamp: unknown (2026-10-20, before the slice commit at 2026-10-20T11:04:50+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 788d8172; base 0.3.66
  - Evidence: after the refactor pass, `npm run format` rewrote `${obs[extraction-performed]}` in `tests/support/delivery-evidence-scheduling-native-assess.sh` to `${obs[extraction - performed]}`; the next `tests/proof-scheduling-native.sh` run failed with `obs[extraction - performed]: unbound variable`; quoting the keys fixed it and the formatter left them stable.
  - Observed effect: implementation and refactor proof were green before formatting; only the coordinator's post-format rerun exposed the break.
  - Inference: any unquoted hyphenated key in this repository's Bash harness is exposed; a lint rule or harness convention would prevent recurrence. One occurrence.

## Native replays should reproduce what the historical agent knew (response implemented, native outcome unobserved)

<a id="dd-320"></a>

### DD-320 — A replay fixture stated conditions the historical occurrences lacked, so its first paid run could not reach their boundary

### Occurrences

- Execution: SEED-010#schedule-proof-after-refactoring / plan 323, first implementation `788d817296adfc0b23a672489619b3ea8bbaf52a`
  - Timestamp: 2026-10-20 (first native run started 2026-10-20T01:57:21Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 788d8172; base 0.3.66
  - Evidence: plan 323 (`6922dc32:.planning/slice-plans/323-schedule-proof-after-refactoring/PLAN.md`) slice 1 asked for “a fast representative suite with a stated realistic cost”; the fixture's AGENTS.md stated the fourteen-minute cost and a new-stylesheet layout rule; the native coordinator's refactor brief said “Do NOT run `bin/suite.sh` — the whole suite costs ~14 minutes”. Plan 302's brief had estimated the suite at “a few minutes”. Terry then added slice 2 to replay the historical conditions.
  - Observed effect: one extra slice and one extra paid Claude run; the second replay still did not reach the delegated-implementer condition.
  - Inference: qualified. Stating the cost changed what the agent knew, which the historical defect depended on; preparation can compare a replay's inputs with each occurrence's recorded context before the first paid launch.

**Response implemented:** `fba97e9fbb90c4f97909a5e2ab899a0031c58308`. The [maintained pre-launch comparison](tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) names the introduced inputs, actor/delegation differences and historical source limits; credential-free checks preserve the quick fixture's stated cost/layout and the planned fixture's absence of those hints. The native outcome remains unobserved: neither retained run reached implementation delegation and a refactor-time move, and this response runs no new native session. Fixture checks do not resolve the historical finding or change ODF-249's settled disposition.

**Observation (2026-10-22):** [SEED-053#match-historical-replay-inputs](.planning/done/SEED-053_match-historical-replay-inputs.json) completed on 2026-10-21; no story remains queued. Keep the finding open until the next paid proof-scheduling replay prepared with the comparison runs: it supports retirement when its inputs match the recorded occurrence context and the run reaches implementation delegation without an extra corrective slice. No such run has occurred since adoption.

## Paid native-run permission handoff (low priority, unqueued)

<a id="dd-161"></a>

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-161).

<a id="nodes-compile-cache-fills-the-disk-under-the-dashboard-suite-queued-not-resolved"></a>

## Node's compile-cache growth under the dashboard suite (descendant policy verified)

**Outcome:** Implemented and measured in the [retained evaluation](docs/maintainer/project-compile-cache-findings.md#suite-policy-evaluation-2026-10-12). The [test configuration](dashboard/playwright.config.ts)
prevents descendant writes without reclaiming existing shared cache; the
[tests guide](dashboard/tests/README.md) describes the policy. The source of the
historical 134 GB remains unknown.

<a id="dd-287"></a>

### DD-287 — A wide dashboard run failed with ENOSPC while `$TMPDIR/node-compile-cache` held 134 GB

[Retained occurrence and suite-policy evaluation](docs/maintainer/project-compile-cache-findings.md#dd-287).

## A limit-recovery spec counts one extra request under suite load (open, unqueued)

<a id="dd-295"></a>

### DD-295 — `limit-recovery-credit-history.spec.ts` saw an unrelated plan-history request after its recovery mark in one loaded whole-suite run

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-295).

## Specs restart a server on a just-closed port (partly repaired, open, unqueued)

<a id="dd-296"></a>

### DD-296 — A spec that restarted its server on the fixture's closed port failed CI with "Port … is already in use"

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-296).

## Two checks fail only beside other work (open, unqueued)

<a id="dd-297"></a>

### DD-297 — A test writing into the source scripts directory and a five-second child-start poll each failed once in loaded whole-suite runs

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-297).

## Loaded-suite evidence lacks within-run load (open, unqueued)

<a id="dd-275"></a>

### DD-275 — Acceptance runs recorded machine load only at their start and end, so a failure could not be placed against the story's load bound

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-275).

## Observer journeys wait on a judgement that can predate the test's provider change (repaired, unqueued)

<a id="dd-302"></a>

### DD-302 — An integrated-state journey's wait accepted a stale judgement and failed only in CI

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-302).

## Installer declarations sit at the line limit beside a single-entry anchor convention (open, unqueued)

<a id="dd-303"></a>

### DD-303 — Joining `install.sh` lines to stay at 250 broke a test that treats single-entry lines as anchors

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-303).

## A focused local run waits for another worktree's full suite (open, unqueued)

<a id="dd-419"></a>

### DD-419 — Named `scripts/test.sh` runs queued behind another worktree's whole suite

### Occurrences

- Execution: SEED-230#summarize-ci-proof-in-intent (plan 463-summarize-ci-proof-in-intent; first implementation commit `99d0f70e7c503bcafb7cc79d3183277eaec28c96`)
  - Timestamp: unknown (2026-11-04, slice 1 acceptance and implementation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: the coordinator's five-path `bash scripts/test.sh …` started 14:25 and ran only after `scripts/local-test-suite.mjs repository` held for the `reduce-remote-sessions-traffic` worktree's full run released `refs/dough/local-test-suite` (the 600 s tool bound moved it to the background); the slice 1 implementer reported a share run stalled over 30 min because `tests/test-runner-github-requests.sh`, `test-runner-budget.sh` and `test-runner-split.sh` start nested full runners that wait for the same lock.
  - Observed effect: about 15 minutes of idle focused proof and one abandoned share run.
  - Inference: qualified. One-suite admission protects whole-suite timings, but focused and nested fixture runs sharing that slot make focused proof latency depend on unrelated work on the machine.

## Selective formatting during delivery (implemented and measured, released in v0.3.67)

<a id="dd-309"></a>

[DD-309 evidence and measured response](docs/maintainer/project-test-findings.md#dd-309) retain seven distinct executions, their provenance, qualified cost and the implemented formatter's measured selection and output.

## Hosted worker population regression (repaired)

<a id="dd-312"></a>

[DD-312 evidence and same-execution repair](docs/maintainer/project-test-findings.md#dd-312) retain the hosted and local observations. No new implementation story is selected.

## Corpus drafts mis-place the cut after repeated commands (open, unqueued)

<a id="dd-343"></a>

### DD-343 — `native-stream-corpus-add.mjs` drafted `last-start-line` at an earlier identical command

Former local code: DD-339 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.

### Occurrences

- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 3)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: `tests/fixtures/native-streams/cursor/delivery-evidence/drift/narrowed/20261025T125143-579f/expected` drafted `last-start-line: 635` while the last started command is stream line 1050; its last three commands are the same `story-obligations.mjs check`; replay failed "started command 7 of 8 is null"
  - Observed effect: `tests/native-stream-replay.sh` failed until the value was corrected to 1050 by inspection.
  - Inference: the in-turn search for each started command can match an earlier identical line; review catches it only through the replay failure.

## A guidance reference sits at its read-budget row limit (open, unqueued)

<a id="dd-347"></a>

### DD-347 — `source-freshness.md` has under 10 bytes left in the "Before finishing or stopping" read-budget row

### Occurrences

- Execution: SEED-010#source-freshness-for-planless-and-reamended-work (plan 357, first implementation commit cc6d397915db451e64772b3ee70f9cf46d8cbd63)
  - Timestamp: unknown (2026-10-26, slices 1 and 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 9492019d; base 0.3.72
  - Evidence: `src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs` "each row fits one tool result on the smallest supported host" counts all of `references/source-freshness.md` toward the 30000-byte row; slice 1's first wording reached 30159 bytes and was rewritten; slice 2 added the base and after-decision route by tightening unrelated sentences in the same reference (4819 bytes before and after, `f3e0985c`), leaving about 7 bytes
  - Observed effect: wording churn in sentences the slices did not otherwise change, and an agent-reported constraint carried into the next delegation.
  - Inference: qualified. The next change to any reference in that row must first free bytes; the cost of this execution's rewording is not separately measured.
  - Later evidence: the Story Branch integration `45989522` with sibling SEED-010#source-review-record-lifecycle, which grew `references/story-obligations.md` in the same row, failed trunk CI run 40209817350 at 30099 of 30000 bytes although neither side failed alone; the repair tightened `finish-or-stop.md`, `ci-completion-wait.md` and `source-freshness.md` to 29729.
  - Later evidence: SEED-208#trustworthy-ci-completion slice 5 (2026-11-01) added the completion-accounting rule to `ci-monitor.md#await-the-applicable-revision-at-completion` and repair-review wording to `finish-or-stop.md`; the "Before finishing or stopping" row went from 29772 to 29991 bytes after removing one sentence and one clause that the same row already stated elsewhere.

## A full local suite's shell wall includes admission wait (repaired, awaiting a re-profile)

<a id="dd-406"></a>

### DD-406 — Local facet: this repository's one-suite admission made a re-profile's shell walls incomparable

The occurrence (SEED-221#launch-records-poll-waits, plan 448, 2026-11-02) stays
in [DearDough.md](DearDough.md) under DD-406 with its shared facet:
test-optimization measurement guidance names no repository admission or queue
among wall-time distortions. This record keeps the repository-owned facet once:
`scripts/local-test-suite.mjs` (via `dashboard/playwright.config.ts`
`acquireLocalSuite`) holds a second full run until another worktree's suite
finishes, and `tests/local-test-resources.md` did not then say that its shell
wall includes that wait. About 38 minutes of the candidate run's 4,068 s wall
were admission (Playwright reported 29.6 min), and the coordinator spent
several investigation steps before finding the gate.

**Response:** `ad8b1f3afafa91eca1cfd3b36295716f52d90fe6` (2026-11-02, alongside
SEED-221's closure) adds to `tests/local-test-resources.md`: a full run's
shell wall includes any admission wait; compare runs by the runner's own
reported duration. **Observation criterion:** the next full-suite timing
comparison in this repository taken while another worktree's suite may hold
admission uses the runner-reported duration (or checks admission) before
reading a slowdown. No such comparison has been observed since adoption; open,
unqueued.

## Long local dashboard suites can lose proof to Maintenance Sleep

<a id="dd-412"></a>

[DD-412](docs/maintainer/project-test-findings.md#dd-412) records two invalidated
whole-suite runs in one execution and the passing AC-powered retry.
**Response:** `b52c1d3bdad7369fc1042a5f2744e9ebedadecbe` (2026-11-04) adds
[machine sleep on macOS](tests/local-test-resources.md#machine-sleep-on-macos)
and points at it from [AGENTS.md](AGENTS.md#failing-and-flaky-tests).
**Observation criterion:** the next long local run on a macOS laptop follows
that guard, and a sleep-shaped failure is attributed from `pmset -g log`
before it is read as a defect. `SEED-241` (plan 477, 2026-11-05) followed
`caffeinate -s -i` across 2,044 passing tests; the dark-wake and sleep-failure
observations remain open, unqueued.

## Repaired dashboard stream, keep, harness and bundle observations

<a id="dd-420"></a>
<a id="dd-421"></a>
<a id="dd-428"></a>
<a id="dd-429"></a>
<a id="dd-430"></a>

[DD-420, DD-421, DD-428, DD-429 and DD-430](docs/maintainer/project-test-findings.md#dd-420)
retain the repaired revision-stream pace race, paused-clock reopen, kept CI
answer journeys, fake-Cursor attach-PID assertion, and server-bundle static
seam, moved from `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md`.
DD-420 recurred in plan 499 (2026-11-07) on unrelated work; its spec now
holds listings in turn, and the per-open pace start remains in the product.

## Container and host local-suite admission collision (open, unqueued)

<a id="dd-432"></a>

[DD-432](docs/maintainer/project-test-findings.md#dd-432) records a
`scripts/ci-container.sh` run replacing a live host dashboard suite's
`refs/dough/local-test-suite` admission owner across PID namespaces.

## Artifact upload stall at the 6-minute dashboard job cap (open, unqueued)

<a id="dd-433"></a>

[DD-433](docs/maintainer/project-test-findings.md#dd-433) records two passing
dashboard shards cancelled at the 6-minute job cap during slow artifact uploads.

## Review and recovery

[Classification, repaired findings and source recovery](docs/maintainer/project-findings-history.md#review-and-recovery)
remain available in the history record, with the original evidence and dates.

<a id="dd-171"></a>

DD-171's delivered commit-hook typecheck and red/green evidence are
[retained in the review history](docs/maintainer/project-findings-history.md#dd-171).

### Earlier reviews

[Earlier classification and resolution reviews](docs/maintainer/project-findings-history.md#earlier-reviews).

### Earlier moves

[Earlier moves and their Git recovery references](docs/maintainer/project-findings-history.md#earlier-moves).

## Repository authoring and host observations

<a id="dd-363"></a>

### DD-363 — Coordinator source-review hard-breaks fail fresh delivery

[Original evidence and local responsibility](docs/maintainer/project-maintenance-findings.md#dd-363).

<a id="dd-365"></a>

### DD-365 — Commit-specific preparation approval repeats after safe reconciliation

[Original evidence and local responsibility](docs/maintainer/project-maintenance-findings.md#dd-365).

<a id="dd-370"></a>

### DD-370 — New Markdown docs with trailing blank EOF fail staged whitespace

[Original evidence and local responsibility](docs/maintainer/project-maintenance-findings.md#dd-370).

<a id="dd-371"></a>

### DD-371 — Delivery typecheck first catches exactOptionalPropertyTypes after green proof

[Original evidence and local responsibility](docs/maintainer/project-maintenance-findings.md#dd-371).

<a id="dd-374"></a>

### DD-374 — Delegation brief softened the project's failing-test policy to "fix or report"

[Original evidence and local responsibility](docs/maintainer/project-maintenance-findings.md#dd-374).

<a id="dd-378"></a>

DD-378's plan-exclusion response and `SEED-229` retirement evidence are
[retained in the review history](docs/maintainer/project-findings-history.md#dd-378).

## Fixture option defaults need direct proof across file order

<a id="dd-390"></a>

[DD-390's original observation and local responsibility](docs/maintainer/project-test-findings.md#dd-390)
retain the successful option-value probes and their provenance. This observation
selects no new implementation story.

## A degraded runner cancels the node test job without a named result (open, unqueued)

<a id="dd-426"></a>

### DD-426 — `test (1/3)` hit its 6-minute job limit on a slow hosted runner with no test failing

### Occurrences

- Execution: SEED-236#show-ci-adapter-proof (before-cleanup `779d5f96a20dd5ddf671f0eaaf3f3624cefc61cd:.planning/slice-plans/470-show-ci-adapter-proof/PLAN.md`, first implementation commit 64588d69268974f9ff44513239da95ad1bc80b42)
  - Timestamp: 2026-11-05T12:56:05+07:00 (job cancel in run 41976448705)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.84 (installed `.claude/skills`)
  - Evidence: run 41976448705 on main `514a70a54`, job `test (1/3)`: `npm ci` took 17 s against 4 s in run 41974427615; `scripts/test.sh` was interrupted after 5:13 with `ci-mailbox-launch.test.mjs` at 41.0 s (10.7 s in run 41974427615's `test-times-1`), `install-preserves-open-dough-json.sh` at 32.6 s (14.9 s). The same shard took about 3.3 min in the five runs before. The dashboard job counts a suite deadline from job start (`.github/workflows/ci.yml`); the node test job has only `timeout-minutes: 6`.
  - Observed effect: a cancelled job with no named test and no timing artifact; Terry chose one rerun as attribution evidence, which passed (attempt 2).
  - Inference: a suite deadline like the dashboard's would end a slow run with a named, recorded result instead of a silent cancel; whether the budget itself should change is a separate decision.

## Release finalization says "Do not push" while a release slice proves the remote tag (open, unqueued)

<a id="dd-427"></a>

### DD-427 — `release-version` stops at a local tag, but plan 470 slice 5 required `git ls-remote --tags origin v<next>`

### Occurrences

- Execution: SEED-236#show-ci-adapter-proof (before-cleanup `779d5f96a20dd5ddf671f0eaaf3f3624cefc61cd:.planning/slice-plans/470-show-ci-adapter-proof/PLAN.md`, first implementation commit 64588d69268974f9ff44513239da95ad1bc80b42)
  - Timestamp: unknown (2026-11-05, release `bc84cc196` after main CI on `514a70a54`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.84 (installed `.claude/skills`)
  - Evidence: `.agents/skills/release-version/SKILL.md` step 6 "Do not push" and step 7 "do not claim it is Released from a remote source until the tag is available there"; plan 470 slice 5 proof named the remote tag; Terry's checkpoint go-ahead covered "cut the next patch release", so the coordinator pushed `bc84cc196` to main and `v0.3.85`.
  - Observed effect: the push rested on the checkpoint's wording rather than on the release skill; trunk had moved twice before the release (`66fefb7c8`, then `80029afc9`), so the release covered other stories' payload too.
  - Inference: the release skill could name the publication step (trunk push and tag push) for a request that includes publishing, and how to describe interleaved trunk payload in the changelog.

## The local CI container lacks the hosted runner's fonts (open, unqueued)

<a id="dd-435"></a>

### DD-435 — a narrow-width layout check passed on macOS and in `scripts/ci-container.sh` but failed on CI's DejaVu Sans

### Occurrences

- Execution: SEED-243#improve-intent-home-and-selection-summaries (plan 480-improve-intent-home-and-selection-summaries, first implementation commit 0332f824ae60b9741732ba2c83e0db505645a805)
  - Timestamp: unknown (2026-11-05, run 42059477099 attempt 1 on `0332f824a`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.86 (installed `.claude/skills`)
  - Evidence: job `dashboard (9/12)` failed `intent-ci-proof.spec.ts:150` with `sideways: 2`; the repair agent measured a 296.42 px table in a 294.41 px box under DejaVu Sans, 271.98 px on macOS and 252.16 px in the `ci-container.sh` image (Playwright's own fonts); reproduction needed an ad-hoc root container installing `fonts-dejavu-core` (job-local `ci-spec-dejavu.sh`); repair `4ad55b56d`.
  - Observed effect: one CI failure, a stash/repair/restore cycle and about 102k repair-agent tokens; the local CI container could not reproduce it as maintained.
  - Inference: installing the hosted runner's default fonts in the `ci-container.sh` image would let layout-measuring browser checks give the CI result locally.
- Execution: SEED-259#scan-intent-ci-summaries (plan 499-scan-intent-ci-summaries, first implementation commit 0ffcc27cbb64b570e0bc5dbd8ddc9e5bd83dee03)
  - Timestamp: unknown (2026-11-07, run 42379612785 attempt 1 on `d146a05d9`; test results stamped 2026-11-07T14:03Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.88 (installed `.claude/skills`)
  - Evidence: job `dashboard (8/12)` failed the same `intent-ci-proof.spec.ts:150` check with `sideways: 26` after slice 2 added sortable header buttons with an arrow; the 106-test local family gate had passed on macOS. The repair agent reproduced 26 px with DejaVu loaded as `@font-face`, then made the spec force Verdana on the table so macOS reproduces Linux widths (failed 25 px before the CSS fix, passed after); repair `68e5f52b3`. Slices 3 and 5 extended the same Verdana override to the summary zoom checks.
  - Observed effect: a second CI failure of this check, a stash/repair/restore cycle around paused slice 3 work, and about 125k repair-agent tokens.
  - Inference: forcing a wide font inside each layout-measuring spec is a workable local stand-in, but each new narrow-width check must remember it; the fonts in the `ci-container.sh` image remain the general remedy.
