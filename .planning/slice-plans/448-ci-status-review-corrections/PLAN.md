# Keep CI status unread failures readable and its read contract plain

**Identity:** SEED-219#ci-status-review-corrections
**Source:** [correction story](../../seeds/SEED-219-intent-ci-status-tab.md#ci-status-review-corrections),
a bounded retrospective correction of
SEED-219#intent-ci-status-tab (recoverable as
`56c47e8e:.planning/seeds/SEED-219-intent-ci-status-tab.md#intent-ci-status-tab`
and plan `56c47e8e:.planning/slice-plans/447-intent-ci-status-tab/PLAN.md`). Reviewed commits:
`713d91a6` (slice 1), `aa10a4f0` (slice 2), `609da43b` (slice 3), `3d1f5ae4`
(slice 4), `a5df2c72` (slice 5); `276116fc` (unrelated flaky-test repair in the
same execution) excluded.

## Goal and scope

Intent's CI status never calls the configured trunk "not published": a 404 on
the trunk's history reads **Could not be read** with GitHub's reason. The
Intent doc states the `ciAdapter` story-branch rule as built. The judged branch
has its own read parameter, and the overlapping end-to-end tests are cut with
their surviving coverage named.

Current findings (execution retrospective, 2026-11-02, verified by the
coordinator against `a5df2c72`):

1. `dashboard/server/baseCiGitHubReads.ts` (`isNotFound`, the history read)
   marks any history 404 `unpublished`, including the configured ref, and
   `dashboard/src/IntentCiJudgment.tsx` (`unpublished` branch) then shows only
   "`main` is not published, so it has no CI status." without the reason.
   GitHub answers the same 404 for a missing or inaccessible repository
   (`gh api` probe, 2026-11-02), so a renamed repository or lost access reads
   as an unpublished trunk. Nothing reads as passed.
2. `docs/dashboard-development-intent.md` (CI status paragraph) says a trunk
   run counts for any story branch; on the `ciAdapter` path
   (`dashboard/server/baseCiJudgment.ts`, adapter discover) no trunk results
   are merged, as plan 447's PFE chose. `dashboard/GITHUB-REQUESTS.md` is
   already accurate.
3. `dashboard/server/requestedRead.ts` adds an `intent !== "ci-status"`
   exception to branch-read dispatch, and `dashboard/server/intentCiStatusRead.ts`
   removes `branch` from the shared mixed-parameter refusal: one parameter name
   carries two meanings.
4. `dashboard/tests/intent-ci-status-reads.spec.ts` "a running head shows its
   nearest completed ancestor…" repeats the running → ancestor → Check again →
   Passed journey that `intent-ci-status-story.spec.ts` "a running head…" step
   covers on a story branch (with the run-branch wording); the
   cancelled-then-timed-out Check again round trip in
   `intent-ci-status.spec.ts` tests the one-line completed-state rule
   (`baseCiNearest.ts`) end to end.

Preserved promises: every SEED-219 commitment in
plan 447's source review
(`56c47e8e:.planning/slice-plans/447-intent-ci-status-tab/source-review.md`)
stays observed; a story branch absent on GitHub still says "no longer
published" by name (S2.7); trunk Running with completed ancestor (S3.8) and
Failed for cancelled/timed out (S3.4b) keep an observation; request counts are
unchanged.

Out of scope (human decision, carried to wrap-up): whether `ciAdapter`
projects should also count trunk results of shared commits (story clause
"Results on shared commits" has no adapter condition; plan 447 narrowed it).

## Ordered slices

### 1. A trunk history 404 reads Could not be read with its reason
Type: Behavior
Status: planned
Proof: added step in `dashboard/tests/intent-ci-status-reads.spec.ts`: the
fake origin answers 404 for `main`'s history → heading names `main`, **Could
not be read**, reason contains "404", no "not published"; the unpublished
story-branch step in `intent-ci-status-story-gaps.spec.ts` stays green. Doc
sentence for the adapter rule in `docs/dashboard-development-intent.md`.

### 2. One parameter for the judged branch
Type: Structure
Status: planned
Proof: boundary refusal cases in `intent-ci-status-reads.spec.ts` ("the CI
status read refuses an unsafe branch name…") renamed to the new parameter and
green; `dashboard/tests/boundary/authenticated-*` read specs and all
`intent-ci-status*.spec.ts` green; the `requestedRead.ts` exception and the
mixed-parameter carve-out are gone.

### 3. Cut overlapping CI status end-to-end tests
Type: Structure
Status: planned
Proof: cancelled and timed-out → Failed move to
`tests/support/dashboard-story-branch-ci.test.mjs` (run with
`bash scripts/test.sh <path>`), one Failed E2E check kept; the trunk running
test in `intent-ci-status-reads.spec.ts` removed, with S3.8 and E7a/E7b
coverage named at `intent-ci-status-story.spec.ts` "a running head…"; all
`intent-ci-status*.spec.ts` green.

## Local gates

- Focused proof as listed, with
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`.
- Failing and flaky tests follow this project's policy as written in
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## Current decisions

- The adapter trunk-run question stays with Terry; this correction only makes
  the doc match the built behavior.
