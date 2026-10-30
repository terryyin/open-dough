# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-193-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Identity:** SEED-193#optimize-dashboard-test-feedback

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
reopening them. A demonstrated absence of worthwhile improvement, with that
evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md) (journeys vs
boundary; one touch device unless another CSS branch), worker-cached
`publishStoryColumnsJourney` (`dashboard/tests/launchJourney.ts`), and
`test.use({ serverMode: "boundary" })` on `preparationPage` /
`dashboardTest` for HTTP admission. Do not add a second measurement framework.
ADR 0010 requires evidenced worthwhile gain against a stated baseline within
coverage constraints.

Settled in this execution checkout
(`cursor/optimize-dashboard-test-feedback-seed-193` at claim
`7aa54d9cab78872586c59aca08b9de72dd4bca7f` on base
`37c81b5b7392371b65939421da22407370dbfb7b`):

- Ordinary local command is `npm run test:dashboard` (default 8 workers).
- SEED-174, SEED-176, SEED-177, SEED-180, and SEED-191 already closed earlier
  passes; accepted necessary costs in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
  remain preserved; pending candidates were empty at pass start.
- Slice 1 green baseline exists; see Current decisions.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Baseline wall time, executed case count, runner conditions, and dominant-cost family analysis are recorded before experiments | Slice 1 | `/tmp/SEED-193-optimize-dashboard-test-feedback/baseline2-proof.json` and `baseline2-times.tsv` (`durationMs` 640.3s, 1,751 cases, `strictStatus: "passed"`) |
| Story-review HTTP admission variants that need no page UI run at the boundary tier with surviving assertions | Slice 2 | Focused before/after on the admission family with replacement boundary proof established first; three consecutive focused passes |
| Short-phone final-report touch proof uses one height that reaches the asserted wrap/≤480 branch | Slice 3 | Focused before/after on `final-report-touch.spec.ts` with three consecutive passes; surviving short-phone + tablet/desktop cases |
| Full local suite re-run under comparable conditions measures before/after wall time and updates candidate record and timings doc | Slice 4 | Full `npm run test:dashboard` with proof/times records, plus updated `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` |

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` in the owned workspace, ran
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-193-optimize-dashboard-test-feedback/baseline2-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-193-optimize-dashboard-test-feedback/baseline2-times.tsv npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs) after load settled
(start 7.86 / 14.46 / 14.67). Recorded revision `7aa54d9cab78872586c59aca08b9de72dd4bca7f`,
command, runner conditions, load, wall time (`640.74s` real /
`640.3s` `durationMs`), executed case count (`1,751`), and
`terminal.strictStatus: "passed"` (exit 0). An earlier contested run under
higher start load failed one `story-review-touch` case (focused re-run passed
3/3) and is retained only as diagnostics
(`/tmp/SEED-193-optimize-dashboard-test-feedback/baseline-proof.json`,
`durationMs` 623.0s, not a successful baseline). Raw proof and per-spec times
stay outside Git under `/tmp/SEED-193-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record and spec times.
Postcondition — successful baseline facts and dominant-cost family analysis
recorded for later experiments.

### 2. Story-review HTTP admission moves to the boundary tier
Type: Structure
Status: done
Proof: Experiment undone — focused family wall did not improve (`12.6s` →
`12.1–12.5s` over three passes; summed `.tsv` ~55s→~44s). No suite change.
Recorded as rejected experiment / pending design candidate.

Internal change: Specs that exercise review/mark/range/file-text/one-shot
admission only through `page.request` (no UI assertions) — including
`story-review-refusal.spec.ts`, `story-review-commit-admission.spec.ts`,
`story-review-file-text-admission.spec.ts`,
`story-review-one-shot-admission.spec.ts`, and the mark-request admission case
in `story-review-mark.spec.ts` — run under `serverMode: "boundary"` (moved
under `boundary/` when that is the clearest home) so they no longer pay
preview/browser journey cost. Preserve every status/body/workspace-read-only
assertion. Keep UI mark journeys in `story-review-mark.spec.ts`. Measure the
focused family wall and summed attempt/spec time; undo if coverage weakens or
comparable focused wall does not improve.

Hypothesis: these files already document HTTP admission; they currently import
`preparationPage` / page fixtures and therefore start the heavier journey
server. Boundary mode is the project's cheaper tier for server-answer variants
([dashboard tests README](../../../dashboard/tests/README.md)).

### 3. Final-report short-phone touch proof collapses to one height
Type: Structure
Status: done
Proof: Focused `final-report-touch.spec.ts` before/after (three consecutive
passes); surviving short-phone case still asserts multi-line name wrap and
identity through the resize/rotation loop that includes 240 px height; tablet
and desktop cases retained.

Internal change: `final-report-touch.spec.ts` currently runs the same full
short-phone body at heights `320` and `240` (~18s + ~27s in the green
baseline). Per touch guidance, keep one short-phone device that reaches the
asserted wrap / ≤480 branch (prefer `240`, the tighter height already visited
inside both resize loops). Drop the redundant height matrix case. Undo if the
surviving case no longer proves wrap or if focused wall does not improve.

Hypothesis: SEED-180 already collapsed other touch matrices; `final-report-touch`
was outside that family and still doubles short-phone cost without a distinct
CSS branch.

### 4. Full local suite is re-profiled and candidates are recorded
Type: Behavior
Status: planned
Proof: Comparable full `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES` after
retained experiments; update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and
`docs/maintainer/dashboard-test-timings.md`; report before/after wall time and
case counts, retained proof, rejected experiments, and remaining candidates.


Behavior: Pre-condition — slices 2–3 decided (retain or undo). Trigger — re-run
the ordinary local command under comparable conditions and write the candidate
record. Postcondition — measured gain, no demonstrated gain, or incomplete
measurement is reported with evidence; accepted necessary costs preserved
unless newly evidenced.

**Checkpoint before extending beyond slices 2–3:** If focused gains from slices
2–3 cannot plausibly move full-suite wall (for example both undone, or combined
focused saving is noise relative to ~640s wall under unlike load), record that
decisive checkpoint in Current decisions and stop for the developer rather than
inventing further families in-plan. Independently valuable remaining candidates
may still be listed in the candidate record without further experiments.

## Current decisions

- **Slice 4 full-suite re-profile (pending delivery):** before
  `7aa54d9c`/`baseline2` `durationMs` **640.3s**, 1,751 cases, start load
  7.86/14.46/14.67 → end 21.98/21.57/19.16; after `f279f582` `durationMs`
  **622.8s**, 1,750 cases, start load 5.55/6.27/9.76 → end 17.76/16.77/14.27;
  both `strictStatus: "passed"`. `final-report-touch` times **51.4s → 23.0s**.
- **Slice 3 focused gain (delivered):** `final-report-touch.spec.ts`
  before `34.3–34.6s` / 4 cases; after keeping 320 only `25.1–25.2s` / 3 cases
  (three passes). Keeping 240 alone left wall ≈34s.
- **Slice 2 experiment rejected (2026-10-30):** moving HTTP-only
  story-review admission specs to `serverMode: "boundary"` did not improve
  focused family wall (`12.6s` → `12.1–12.5s` over three passes; summed `.tsv`
  ~55s→~44s). Changes undone; no coverage change. Remains a pending design
  candidate without a measured local-wall claim.

- **Baseline (Slice 1):** Green local baseline at revision
  `7aa54d9cab78872586c59aca08b9de72dd4bca7f`: `durationMs` **640.3s**, outer
  wall **640.74s**, **1,751** cases, 0 skipped, `strictStatus: "passed"`,
  8 default workers, `NO_COLOR` unset, start load 7.86 / 14.46 / 14.67 → end
  21.98 / 21.57 / 19.16. Evidence under
  `/tmp/SEED-193-optimize-dashboard-test-feedback/baseline2-*`.
- **Dominant-cost shape (excluding accepted necessary costs):**
  - `story-review*` journeys: **44** files / **95** cases / **~580s** summed
    attempt time (largest aggregate).
  - `responsive-session*`: **11** files / **28** cases / **~235s**.
  - Codex launch/preparation family: **~142s** times sum; boundary
    `agent-launch-preparation-codex-retry` alone **~63s** for 10 damage
    variants (already boundary; deferred unless slices 2–3 under-deliver).
  - `final-report-touch` short-phone matrix: **~45.5s** attempt sum for two
    near-identical heights (`320`/`240`).
  - HTTP-only story-review admission specs still on the journey tier:
    refusal / commit / file-text / one-shot admission plus mark-request
    admission (~**25s** attempt sum combined in baseline).
- **Preserved accepted costs:** do not thin `agent-launch-poles` or
  `long-integrated-journeys` without new evidence.
- **First failed suite run** (`baseline-proof.json`, 623s, 1 failure in
  `story-review-touch`) is not a successful baseline; focused touch re-run
  passed 3/3 under lower contention.

## Learnings

- Slice 2 admission→boundary move: summed spec time fell without focused-wall
  gain under default workers; undo per plan. HTTP admission placement remains a
  pending design candidate without a measured local-wall claim.
- Slice 3: drop the slower short-phone height (240), keep 320 — the resize loop
  still visits 240, and 320 was already the cheaper critical-path case when both
  ran in parallel.

- High concurrent suite load can flake `story-review-touch` close-to-count; do
  not treat a failed full-suite run as baseline. Prefer settled start load and
  record load averages with every comparison.
