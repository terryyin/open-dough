# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-194-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-194#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments; retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with the latest-pass
summary and current candidate state. Preserve accepted necessary costs
(`agent-launch-poles`, `long-integrated-journeys`) unless new evidence supports
reopening them. Leave pending
`story-review-http-admission-boundary-placement` unless a wall-improving
approach appears. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Re-trying the same story-review HTTP
admission boundary move already rejected in SEED-193 for lack of wall gain.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) (journeys vs
boundary; one representative journey for page shape; boundary owns variants),
worker-cached `publishStoryColumnsJourney`, and existing model boundaries
(`boundary/agent-launch-model-boundary.spec.ts`,
`boundary/agent-launch-codex-model-boundary.spec.ts`). Do not add a second
measurement framework. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires evidenced worthwhile gain against a stated baseline within coverage
constraints.

Settled in this execution checkout
(`cursor/optimize-dashboard-test-feedback-seed-194` at claim
`02ddad60e3694cd7986ef443876cc9d8a6bcc3a3` on base
`94f23e01c7522075990e0bbf8c0aad9590be05e0`):

- Ordinary local command is `npm run test:dashboard` (Playwright default local
  workers = half of 16 logical CPUs → 8).
- SEED-174, SEED-176, SEED-177, SEED-180, SEED-191, and SEED-193 already closed
  earlier passes; accepted necessary costs and the pending story-review HTTP
  admission candidate in `.planning/TEST-OPTIMIZATION-CANDIDATES.md` remain
  preserved.
- Slice 1 green baseline exists; see Current decisions.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Baseline wall time, executed case count, runner conditions, and dominant-cost family analysis are recorded before experiments | Slice 1 | `/tmp/SEED-194-optimize-dashboard-test-feedback/baseline-proof.json` and `baseline-times.tsv` (`durationMs` 679.6s, 1,750 cases, `strictStatus: "passed"`) |
| Claude launch-dialog model UI keeps one representative journey per distinct behavior; kind-matrix argv variants rely on the existing boundary | Slice 2 | Focused before/after on `agent-launch-model.spec.ts` with three consecutive passes; surviving UI cases; boundary model argv proof unchanged |
| Codex discovered-model page proof keeps one story workflow plus ad-hoc when those journeys are equivalent; workflow variants rely on the existing boundary | Slice 3 | Focused before/after on the `agent-launch-codex-model` family (including imported case files) with three consecutive passes; surviving journeys; boundary model/effort proof unchanged |
| Full local suite re-run under comparable conditions measures before/after wall time and updates candidate record and timings doc | Slice 4 | Full `npm run test:dashboard` with proof/times records, plus updated `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` |

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` in the owned workspace, ran
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-194-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-194-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Start load
`6.53 / 5.26 / 5.15`; end load `43.44 / 35.64 / 22.34`. Recorded revision
`02ddad60e3694cd7986ef443876cc9d8a6bcc3a3`, wall time (`680.10s` real /
`679.6s` `durationMs`), executed case count (`1,750` passed, `0` skipped),
and `terminal.strictStatus: "passed"` (suite exit 0; the outer shell then
failed on zsh's read-only `status` variable while writing meta — suite proof
is authoritative). Summed attempt durations ≈ `4,958.5s`; summed `.tsv`
(including hooks) `5,207.2s`. Dominant removable-looking cost outside accepted
necessary costs: Claude/Codex launch-dialog model kind/workflow matrices still
on the journey tier while boundaries already own argv/creation variants.
Accepted poles and long integrated journeys remain at the top of the `.tsv`
and are not experiment targets. Raw proof and per-spec times stay outside Git
under `/tmp/SEED-194-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record and spec times.
Postcondition — successful baseline facts and dominant-cost family analysis
recorded for later experiments.

### 2. Claude launch-dialog model kind matrix collapses to representative journeys
Type: Structure
Status: done
Proof: Focused `agent-launch-model.spec.ts` before **13.3–16.4s / 11 cases** →
after **10.0–11.7s / 7 cases** over three consecutive passes each; boundary
`agent-launch-model-boundary.spec.ts` passed. Retained refinement
offers-Model+Opus (layout), session Default-without-`--model`, Cancel/Escape
dismiss across kinds, reopen Default, Tab order, and refused launch. Dropped
redundant execution/session offers-Model and refinement/execution Default
matrix cases. Evidence under `/tmp/SEED-194-optimize-dashboard-test-feedback/slice2/`.

Internal change: Collapsed the kind matrix as hypothesized; boundary argv
coverage unchanged.

Hypothesis: dashboard guidance puts page-shape once on the journey tier and
server-answer / argv variants on the boundary; the kind matrix repeats the
same dialog shape while the boundary already asserts `--model` / no-model
across story and ad-hoc requests. **Supported** by focused wall improvement.

### 3. Codex discovered-model story workflows collapse to one page journey
Type: Structure
Status: done
Proof: Experiment **undone** — focused family wall did not improve
(`10.2–12.1s` / 13 cases → `11.0–11.6s` / 12 cases over three passes each;
boundary still passed). Dropping the redundant `refinement` story workflow
removed ~6s of attempt time but did not shorten comparable focused wall under
default workers (catalog/effort siblings dominate). No suite change retained.
Evidence under `/tmp/SEED-194-optimize-dashboard-test-feedback/slice3/`.

Internal change: Temporarily kept `execution` + `ad-hoc` only; restored the
three-workflow matrix after measurement.

Hypothesis: execution and refinement share the same dialog and native-creation
page path. **Rejected for wall gain** under like focused conditions; pending
only if a different approach appears.

### 4. Full local suite re-profile and candidate record update
Type: Behavior
Status: done
Proof: Full suite at `276ef912c2c49083acc8a85a766ab2a5d33ec677`:
`durationMs` **657.2s** (657.90s wall), **1,746** cases, 0 skipped,
`strictStatus: "passed"`, summed attempts **4,797.1s**, summed `.tsv`
**5,064.9s**, start load 8.70 / 14.82 / 17.30 → end 30.23 / 26.65 / 23.62.
Baseline comparison: **679.6s / 1,750** → **657.2s / 1,746** (−22.4s wall,
−4 kind-matrix cases). Updated
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` and
`docs/maintainer/dashboard-test-timings.md`. Evidence under
`/tmp/SEED-194-optimize-dashboard-test-feedback/after-*`.

Behavior: Pre-condition — retained experiments delivered (or none retained).
Trigger — re-run the ordinary local command under like conditions.
Postcondition — before/after wall time and case counts reported; candidates
updated; rejected experiments named.

## Current decisions

- Green baseline: revision `02ddad60e3694cd7986ef443876cc9d8a6bcc3a3`,
  `durationMs` 679.6s, 1,750 cases, start load 6.53 / 5.26 / 5.15, default 8
  workers, `NO_COLOR`/`FORCE_COLOR` unset. Evidence:
  `/tmp/SEED-194-optimize-dashboard-test-feedback/baseline-proof.json`.
- Slice 2 retained: Claude model kind matrix collapsed; focused wall
  **13.3–16.4s → 10.0–11.7s** (11 → 7 cases). Full-suite effect still owed to
  slice 4.
- Slice 3 rejected: Codex story-workflow collapse showed no focused wall
  gain; change undone.
- Do not reopen accepted necessary costs (`agent-launch-poles`,
  `long-integrated-journeys`) without new evidence.
- Do not retry SEED-193's story-review HTTP admission boundary move unless a
  different wall-improving approach appears.
- Experiment loop: hypothesize → focused baseline → smallest change → verify →
  measure → retain or undo → reassess before the next dependent experiment.
  A decisive checkpoint that remaining experiments cannot close a supplied
  target gap is recorded here before another dependent experiment is
  dispatched. No numeric wall target was supplied for this pass.

## Learnings

- Claude launch-dialog model kind matrix was redundant with
  `boundary/agent-launch-model-boundary.spec.ts` for argv variants; one
  offers-Model layout journey plus one Default journey retained the page
  proof at lower focused cost.
- Dropping one of two near-identical Codex story workflows did not move
  focused family wall while longer catalog/effort siblings still run; fewer
  cases alone is not a wall claim.
