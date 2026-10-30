# Reduce dashboard test feedback time with measured optimization (top 20%)

**Source:** [Selected story](../../seeds/SEED-195-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Identity:** SEED-195#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments. Seed
investigation from the tests and files that make up the top 20% of suite cost
by recorded duration contribution; follow related families across files and
tiers when they share responsibility or setup with those contributors. Retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with the latest-pass
summary and current candidate state. Preserve accepted necessary costs
(`agent-launch-poles`, `long-integrated-journeys`) unless new evidence supports
reopening them. Leave pending
`story-review-http-admission-boundary-placement` and
`codex-discovered-model-story-workflow-collapse` unless a wall-improving
approach appears. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Thinning accepted necessary-cost journeys
without new evidence. Re-trying the Codex discovered-model workflow collapse
already rejected in SEED-194 for lack of focused wall gain.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) (journeys vs
boundary; one representative journey for page shape; boundary owns variants;
one touch device unless another reaches a distinct CSS branch). Do not add a
second measurement framework. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires evidenced worthwhile gain against a stated baseline within coverage
constraints.

Settled in this execution checkout
(`cursor/optimize-dashboard-test-feedback-seed-195` at claim
`bb8924b803309e101c8a8f5fb7117c0f72c442aa` on base
`52b0a13d881cc2e213856832ec6a3c1b5709f6a4`):

- Ordinary local command is `npm run test:dashboard` (Playwright default local
  workers = half of 16 logical CPUs → 8).
- SEED-174, SEED-176, SEED-177, SEED-180, SEED-191, SEED-193, and SEED-194
  already closed earlier passes; accepted necessary costs and pending
  candidates in `.planning/TEST-OPTIMIZATION-CANDIDATES.md` remain preserved.
- Slice 1 green baseline exists; see Current decisions.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Baseline wall time, executed case count, runner conditions, and top-20% cost family analysis are recorded before experiments | Slice 1 | `/tmp/SEED-195-optimize-dashboard-test-feedback/baseline-proof.json` and `baseline-times.tsv` (`durationMs` 670.0s, 1,746 cases, `strictStatus: "passed"`) |
| Codex retained-retry damage cases keep unique refusal proof without repeating the unrelated Story-B launch on every variant | Slice 2 | Focused before/after on `boundary/agent-launch-preparation-codex-retry.spec.ts` with three consecutive passes; surviving damage refusals; one retained independent-launch check |
| Host start-progress page proof keeps one representative host journey when the other host's readiness/progress path already has cheaper surviving proof | Slice 3 | Focused before/after on `agent-launch-start-phases.spec.ts` (and any replacement boundary/sibling) with three consecutive passes |
| Full local suite re-run under comparable conditions measures before/after wall time and updates candidate record and timings doc | Slice 4 | Full `npm run test:dashboard` with proof/times records, plus updated `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` |

## Ordered slices

### 1. Ordinary local dashboard baseline and top-20% costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` in the owned workspace, ran
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-195-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-195-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Start load
`5.86 / 5.38 / 8.73`; end load `19.94 / 22.37 / 18.81`. Recorded revision
`bb8924b803309e101c8a8f5fb7117c0f72c442aa`, wall time (`670.51s` real /
`670.0s` `durationMs`), executed case count (`1,746` passed, `0` skipped),
and `terminal.strictStatus: "passed"`. Summed attempt durations ≈ `4,882.2s`;
summed `.tsv` (including hooks) `5,141.0s`. Top 20% by file cost: 23 files /
20.3% of summed `.tsv` (`production-watcher-*`,
`boundary/agent-launch-preparation-codex-retry`, poles/attention,
`agent-launch-codex-model`, responsive-session and cursor-session-scope
families, `story-review-touch`, `agent-launch-done-question`,
`agent-launch-second-server-orphan`, `boundary/run-processes`,
`agent-launch-start-phases`, and siblings). Top 20% by case attempt cost: 53
cases / 20.1%. Dominant removable-looking costs outside accepted necessary
costs: (1) ten Codex retained-retry damage boundary cases each ending with the
same unrelated Story-B launch (~56.2s file / ~16.1s focused wall); (2)
duplicate Claude/Codex host start-progress journeys in
`agent-launch-start-phases.spec.ts` (~28.9s file / ~10.3s focused) while
Codex start/readiness already has sibling journey proof; (3) pending
Codex model workflow collapse left untouched after SEED-194 rejection.
Accepted poles and long integrated journeys remain at the top of the `.tsv`
and are not experiment targets. `story-review-touch` keeps phone and tablet
per dashboard guidance (tablet side-by-side review body). Raw proof and
per-spec times stay outside Git under
`/tmp/SEED-195-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record and spec times.
Postcondition — successful baseline facts and top-20% family analysis recorded
for later experiments.

### 2. Codex retained-retry damage matrix drops repeated independent-launch proof
Type: Structure
Status: planned
Proof: Focused before/after on
`boundary/agent-launch-preparation-codex-retry.spec.ts` with three consecutive
passes each; all remaining damage refusals still pass; exactly one case retains
the unrelated Story-B independent launch; journey
`agent-launch-preparation-codex-retry.spec.ts` still passes.

Internal change: Keep every distinct damage refusal. Move the shared
“other queued story still launches without replacing retained preparation”
assertion so only one representative damage case runs it (expected: `workspace`).
Remove that trailing independent launch from the other nine cases.

Hypothesis: the independent Story-B launch is repeated proof of one behavior
already shown once; removing nine copies should cut focused wall and suite
file cost in the top-20% band without losing unique damage protection.
Measure and retain only if focused wall improves over three passes.

### 3. Host start-progress page proof collapses to one representative host
Type: Structure
Status: planned
Proof: Focused before/after on `agent-launch-start-phases.spec.ts` with three
consecutive passes; surviving host journey plus the kept-store case; sibling
Codex start/readiness proof (`agent-launch-start-codex.spec.ts` and/or
preparation-phases) still covers the dropped host's distinguishing message
path, or a cheap boundary replacement is added before removal.

Internal change: Keep one host's initiating/observing page journey (expected:
`claude`) and the store “kept, never running” case. Drop the duplicate host
page journey only when surviving proof already owns that host's readiness
wording on the native/page path.

Hypothesis: dashboard guidance wants one representative page journey; host
argv/message variants belong with cheaper sibling or boundary proof. Measure
and retain only if focused wall improves.

### 4. Full local suite re-profile and candidate record update
Type: Behavior
Status: planned
Proof: Full `npm run test:dashboard` under comparable conditions with proof
and times records; `.planning/TEST-OPTIMIZATION-CANDIDATES.md` Latest pass
replaced; `docs/maintainer/dashboard-test-timings.md` SEED-195 section added;
rejected experiments and remaining candidates recorded.

Behavior: Pre-condition — retained or rejected experiment outcomes recorded.
Trigger — re-run the ordinary local command and write the candidate/timings
summary.
Postcondition — before/after wall time and case counts reported; candidate
record current.

## Current decisions

- Baseline revision `bb8924b803309e101c8a8f5fb7117c0f72c442aa`: `durationMs`
  669950.655 (~670.0s), outer wall 670.51s, 1,746 passed / 0 skipped,
  `strictStatus: "passed"`, default 8 workers, start load
  `5.86 / 5.38 / 8.73`.
- Investigation scope is the top 20% cost band by summed attempt and `.tsv`
  contribution, following related families; accepted necessary costs are not
  experiment targets.
- Experiment order: Codex damage independent-launch dedupe (highest open
  top-20% file cost), then start-phases host collapse, then full re-profile.
- Do not reopen `codex-discovered-model-story-workflow-collapse` or
  `story-review-http-admission-boundary-placement` without a new wall-improving
  approach.
- Do not drop `story-review-touch` tablet while dashboard guidance cites it for
  the side-by-side review body.

## Learnings

None yet beyond Slice 1 baseline and top-20% ranking.
