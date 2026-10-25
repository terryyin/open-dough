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

**Maintenance assessment (2026-10-25):** Select one new project response: [SEED-151#balance-test-shares](.planning/seeds/SEED-151-test-share-reliability.md#balance-test-shares), queued, not resolved, for DD-279's renewed allocation failure in plan 350. This demonstrated CI failure outranks the strongest alternative, DD-336's one loaded-run missing-result failure whose cause remains unknown. The browser-restart and mouse-press repairs have no established post-fix recurrence; DD-320 still awaits a qualifying paid replay and is not duplicated. Direction and existing work remain unchanged. No new occurrence is created by this review.

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
3. **Suite timing and diagnosis — open, unqueued.** [DD-279](#dd-279)
   records two shard deadlines in one execution; a refreshed duration list and
   twelve shares repair those runs, while duration ordering still ages without
   a refresh step. Plan 350 met the same mechanism in the Node suite's share
   budget (one added test file, repaired by refreshing `tests/longest-first`). [DD-275](#dd-275) records one separate execution whose
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

## Dashboard shards run at their time ceiling (open, unqueued)

<a id="dd-279"></a>

### DD-279 — A dashboard shard reached its 320-second deadline after one spec file was added

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-279).

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

## Selective formatting during delivery (implemented and measured, released in v0.3.67)

<a id="dd-309"></a>

[DD-309 evidence and measured response](docs/maintainer/project-test-findings.md#dd-309) retain seven distinct executions, their provenance, qualified cost and the implemented formatter's measured selection and output.

## Hosted worker population regression (repaired)

<a id="dd-312"></a>

[DD-312 evidence and same-execution repair](docs/maintainer/project-test-findings.md#dd-312) retain the hosted and local observations. No new implementation story is selected.

## Corpus drafts mis-place the cut after repeated commands (open, unqueued)

<a id="dd-339"></a>

### DD-339 — `native-stream-corpus-add.mjs` drafted `last-start-line` at an earlier identical command

### Occurrences
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 3)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: `tests/fixtures/native-streams/cursor/delivery-evidence/drift/narrowed/20261025T125143-579f/expected` drafted `last-start-line: 635` while the last started command is stream line 1050; its last three commands are the same `story-obligations.mjs check`; replay failed "started command 7 of 8 is null"
  - Observed effect: `tests/native-stream-replay.sh` failed until the value was corrected to 1050 by inspection.
  - Inference: the in-turn search for each started command can match an earlier identical line; review catches it only through the replay failure.

## Delivery formatting needs the checkout's npm bin on PATH (open, unqueued)

<a id="dd-340"></a>

### DD-340 — `scripts/lint.mjs --fix` found no eslint or prettier when `node_modules/.bin` was not on PATH

### Occurrences
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 2 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: guarded fresh delivery `operation: formatting`, "eslint: not found on PATH. Run npm ci …" in a checkout whose `node_modules/.bin/eslint` existed; the slice 1 delivery (shell and Markdown only) had passed with the same PATH
  - Observed effect: one refused delivery attempt; the retry with `node_modules/.bin` first on PATH succeeded.
  - Inference: `npm run format` supplies that PATH, the direct `node scripts/lint.mjs --fix` operation does not; the preparation file could name `npm run --silent format` or the lint script could resolve local bins.

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
