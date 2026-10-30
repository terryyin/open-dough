# Reduce dashboard test feedback time with measured optimization

**Source:** [Selected story](../../seeds/SEED-191-optimize-dashboard-test-feedback.md#optimize-dashboard-test-feedback)
**Source review:** [source-review.md](source-review.md)
**Identity:** SEED-191#optimize-dashboard-test-feedback

## Goal and scope

Shorten the wait for trustworthy local dashboard test results while preserving
behavioral coverage and confidence. Run measured optimization against the
ordinary local command `npm run test:dashboard`, covering browser journeys,
boundary tests, and shared setup. Profile before choosing experiments; retain
only changes supported by comparable wall-time measurements under like runner
conditions. Follow dashboard test guidance when simplifying tests or moving
proof between tiers. Establish replacement proof before removing or narrowing
cases. Update `.planning/TEST-OPTIMIZATION-CANDIDATES.md` with the latest-pass
summary and current candidate state, including removing transferred obligations
whose receiving story has closed with its work done. A demonstrated absence of
worthwhile improvement, with that evidence recorded, satisfies the story.

**Exclusions:** Product behavior changes for faster tests. Non-dashboard suites.
Claims of speedup from fewer cases or lines alone, from focused timings without
a comparable full local re-run, or from CI-only allocation changes that leave
the selected local wait unchanged. Reopening accepted necessary costs
(`agent-launch-poles`, `long-integrated-journeys`) without new evidence.

## Existing solutions and decisive premises

PFE: reuse [dough-test-optimization](../../../src/skills/dough-test-optimization/SKILL.md)
for baseline → family investigation → hypothesize/measure/retain-or-undo →
re-profile. Reuse `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`
([proof record](../../../dashboard/tests/proof-record.md)). Reuse
[dashboard test guidance](../../../dashboard/tests/README.md), worker-cached
read-only Git origins (`dashboard/tests/launchJourney.ts`,
`src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs`), and
the existing `doneRenameWaitMs` / `DOUGH_DONE_RENAME_WAIT_MS` testability seam
(`dashboard/tests/support/fakeClaude.ts`,
`dashboard/server/hosts/claude/rename.ts`). Do not add a second measurement
framework. ADR 0010 requires evidenced worthwhile gain against a stated baseline
within coverage constraints.

Settled in this execution checkout (`cursor/dough-test-optimization-dashboard-test`
at claim `7225da81df32e6fc59debf9b2943f3166335c9f5` on base
`7c2f83c20766ff3535deda1713e6c0947c158bc6`):

- Ordinary local command is `npm run test:dashboard`.
- SEED-174, SEED-176, SEED-177, and SEED-180 already closed earlier passes;
  accepted necessary costs in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
  remain preserved, and SEED-180 (`2cb0dade`,
  `.planning/done/SEED-180_optimize-dashboard-touch-viewport-tests.json`) closed
  the `touch-viewport-matrices` transferred obligation.
- Slice 1 green baseline exists; see Current decisions.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Baseline wall time, executed case count, runner conditions, and dominant-cost family analysis are recorded before experiments | Slice 1 | `/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-proof.json` and `baseline-times.tsv` (`durationMs` 950.8s, 1,751 cases, `strictStatus: "passed"`) |
| Shared read-only `StoryColumnsJourney` origin and non-subject Claude done-rename waits in shared cleanup reduce repeated setup/wait cost without weakening coverage | Slice 2 | Focused before/after measurements on representative `publishStoryColumnsJourney` and `closeOpenSessions`/done-wait families, with all cases passing (`strictStatus: "passed"`) |
| Voice dictation upstream error variants are proved at the boundary and non-settings voice journeys seed credentials directly while preserving UI settings and recovery proof | Slice 3 | Focused before/after measurements on the voice family (`boundary/session-instruction-voice-boundary.spec.ts` and `session-instruction-voice*.spec.ts`) with replacement boundary proof established first and three consecutive focused passes |
| Full local suite re-run under comparable conditions measures before/after wall time and updates `.planning/TEST-OPTIMIZATION-CANDIDATES.md` and `docs/maintainer/dashboard-test-timings.md` | Slice 4 | Full `npm run test:dashboard` with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`, plus updated candidate record and timings doc |

## Ordered slices

### 1. Ordinary local dashboard baseline and dominant costs are recorded
Type: Behavior
Status: done
Proof: After `npm ci` and `npm run typecheck:dashboard`, ran
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
once under default local workers (8 of 16 logical CPUs). Recorded revision,
command, runner conditions, load, wall time (`951.4s` wall / `950.8s`
`durationMs`), executed case count (`1,751`), and `terminal.strictStatus: "passed"`
(exit 0). Raw proof and per-spec times stay outside Git under
`/tmp/SEED-191-optimize-dashboard-test-feedback/`.

Behavior: Pre-condition — owned workspace ready to run the dashboard suite.
Trigger — execute the ordinary local command with a proof record and spec times.
Postcondition — successful baseline facts and dominant-cost family analysis
recorded for later experiments.

### 2. Read-only story-columns origin is shared per worker and non-subject Claude done-rename waits are bounded
Type: Structure
Status: done
Proof: Focused Family A (`publishStoryColumnsJourney`, `--workers=1`, 4 specs, 15 cases): `durationMs` fell from **51,755.8 ms** (**51.8 s**, summed `.tsv` **46.2 s**) to **38,671.3 ms** / **41,203.9 ms** / **38,505.3 ms** (**38.5–41.2 s**, summed `.tsv` **34.4–36.8 s**) over 3 consecutive passes (`strictStatus: "passed"`). Focused Family B (non-subject `doneRenameWaitMs: 100`, default 8 workers, 15 specs, 83 cases): `durationMs` fell from **48,826.0 ms** (**48.8 s**, summed `.tsv` **272.3 s**) to **22,620.2 ms** / **22,766.4 ms** / **21,463.3 ms** (**21.5–22.8 s**, summed `.tsv` **101.8–109.0 s**) over 3 consecutive passes (`strictStatus: "passed"`). `npm run typecheck:dashboard` passed. `boundary/agent-launch-done-rename-wait.spec.ts` and production defaults remain unchanged. Raw proofs under `/tmp/SEED-191-optimize-dashboard-test-feedback/slice2-*`.

Internal change: Eliminate 36 of 44 per-file `publishStoryColumnsJourney()`
rebuilds in an 8-worker suite run (615.0s of `beforeAll` hook time in baseline)
and ~30 five-second `waitForIdle` timeouts in `closeOpenSessions` / setup
`markDone` (~150s in baseline), enabling the suite re-profile in slice 4.

### 3. Voice dictation upstream error variants move to the boundary and non-settings journeys seed credentials directly
Type: Structure
Status: done
Proof: Focused Voice family (7 specs): first extended `dashboard/tests/boundary/session-instruction-voice-boundary.spec.ts` to assert exact status and `{ error }` payloads for all 8 upstream provider failure variants (`401`, `403`, `429`, `500`, `200` empty, `200` malformed, `200` oversized, and socket disconnect) plus `bytes > 0` (`3,841.9 ms`, `strictStatus: "passed"`); then removed the 6 redundant per-status browser journeys in `dashboard/tests/session-instruction-voice-provider-failures.spec.ts` while retaining the explicit refusal-retry-start journey (`bytes > 0`, `recovered`, retry, `typedStart`) and the `deadline` journey, and seeded saved OpenAI credentials directly via `seedVoiceKey` across non-settings voice specs while keeping `saveVoiceKey(page)` and the missing-key settings round-trip in `session-instruction-voice.spec.ts`. Three consecutive focused passes: `durationMs` fell from **16,059.8 ms** (**16.1 s**, summed `.tsv` **65.9 s**, 26 cases) to **13,187.8 ms** / **13,114.4 ms** / **13,086.6 ms** (**13.1–13.2 s**, summed `.tsv` **45.0–45.6 s**, 20 cases), with `session-instruction-voice-provider-failures.spec.ts` dropping from **21.1 s** to **5.5–5.8 s** (`strictStatus: "passed"`). Raw proofs under `/tmp/SEED-191-optimize-dashboard-test-feedback/slice3-*`.

Internal change: Replace 6 repeated browser journeys and 14 incidental System
settings UI round-trips with boundary coverage and direct credential seeding,
enabling the suite re-profile in slice 4.

### 4. Selected local suite confirms the measured outcome and updates the candidate record
Type: Behavior
Status: planned
Proof: Re-run
`env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-191-optimize-dashboard-test-feedback/after-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-191-optimize-dashboard-test-feedback/after-times.tsv npm run test:dashboard`
under default 8 workers and comparable load. Compare wall time and executed case
count (including replacement boundary assertions); update
`docs/maintainer/dashboard-test-timings.md` and
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` (`## Latest pass`, removing the
completed `touch-viewport-matrices` transferred obligation, and preserving
`## Accepted necessary costs` and remaining candidates).

Behavior: Pre-condition — slices 2 and 3 verified on their focused families.
Trigger — run the full local dashboard suite under comparable conditions and
record the outcome. Postcondition — measured before/after comparison and updated
candidate record are committed.

## Current decisions

### Slice 1 baseline (successful)

- **Revision:** `7225da81df32e6fc59debf9b2943f3166335c9f5` (admit on
  `7c2f83c20766ff3535deda1713e6c0947c158bc6`).
- **Command:**
  `env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-times.tsv npm run test:dashboard`
- **Host:** 16 logical CPUs, 48 GiB RAM; Playwright default local workers = 8.
- **Load:** start averages `9.93 / 11.35 / 10.54`; end averages
  `56.08 / 54.43 / 39.26`.
- **Wall:** `951.39 s`; `terminal.durationMs` `950,751.06 ms` (`950.75 s`).
- **Selection:** `selectedCount` **1,751**; attempts **1,751** (`1,751` passed,
  `0` skipped, `0` failed).
- **Terminal:** `runnerStatus`/`strictStatus` **passed**, command exit **0**.
- **Raw proof:** `/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-proof.json`
  and `/tmp/SEED-191-optimize-dashboard-test-feedback/baseline-times.tsv`.

### Dominant-cost shape and family analysis (from the green baseline)

- Summed test attempt durations: **6,508.3 s**; summed spec durations (attempts
  plus `beforeAll`/`afterAll` hooks): **7,283.5 s** (**775.2 s** of shared hook
  time).
- **Family 1 — `publishStoryColumnsJourney()` shared hook overhead:** 44 spec
  files call `publishStoryColumnsJourney()` in `test.beforeAll`, accounting for
  **1,031.7 s** of spec time (**416.7 s** in test attempts and **615.0 s** in
  `beforeAll`/`afterAll` hooks). Unlike `launchJourney` (`publishLaunchJourney()`),
  which is published once per worker in `support/pageTest.ts`,
  `publishStoryColumnsJourney()` rebuilds the identical read-only 4-commit bare
  origin 44 times per suite run. Caching it once per worker in
  `dashboard/tests/launchJourney.ts` (cleaning up on worker exit) eliminates 36
  of 44 builds in an 8-worker run with zero coverage change.
- **Family 2 — Non-subject Claude 5s done-rename wait in `closeOpenSessions` and
  setup `markDone`:** `renameInClaudeCode` waits 5,000ms (`defaultRenameWaitMs.manual`)
  polling `waitForIdle` whenever `markDone` is called on a `busy`/`waiting`
  synthetic Claude session. While `boundary/agent-launch-done-rename-wait.spec.ts`
  tests that wait and several journey specs already set
  `DOUGH_DONE_RENAME_WAIT_MS: "300"`, 8 boundary specs using
  `closeOpenSessions(server)` (`boundary/agent-launch-session-listing.spec.ts`
  34.5s, `boundary/agent-launch-delete.spec.ts` 28.3s,
  `boundary/agent-launch-options-boundary.spec.ts` 18.5s,
  `boundary/agent-launch-model-boundary.spec.ts` 18.4s,
  `boundary/agent-launch-done-refusal.spec.ts` 14.3s,
  `boundary/agent-terminal-reopen.spec.ts` 14.2s,
  `boundary/agent-launch-options-groups.spec.ts` 14.0s,
  `boundary/agent-launch-boundary.spec.ts` 13.5s — **155.7 s** total) and 6
  other non-rename-wait specs (`boundary/agent-launch-open-session.spec.ts`,
  `boundary/session-alerts-unread-report.spec.ts`, `support/sessionAlerts.ts`,
  `support/feedbackMaintenanceServer.ts`, `sessions-sidebar-reading.spec.ts`,
  `compact-session-entry.spec.ts`) pay ~150s of 5-second polling timeouts.
- **Family 3 — Voice dictation (`session-instruction-voice*`, 84.1 s total):**
  `session-instruction-voice-provider-failures.spec.ts` (32.6s, 8 cases) runs 6
  separate full browser journeys (~24.4s) that only vary upstream OpenAI HTTP
  status/body (`401`, `429`, `500`, `200` empty, `200` malformed, socket error)
  already owned by `/__instruction-transcription` at the server boundary, while
  case 7 (`explicit retry after refusal...`) already proves browser recovery,
  retry, and `typedStart`. Additionally, 5 non-settings voice journey specs
  perform 14 UI round-trips through System settings (`saveVoiceKey(page)`) to
  write `.open-dough/dashboard/credentials/openai.json`, which
  `session-instruction-voice.spec.ts` already proves through the UI.

## Learnings

## Story obligations

## Plan concern review

Slice 1 completed with a successful baseline. Slices 2–4 are bounded, proof-mapped,
and ready for execution. No blocking plan concern remains.
