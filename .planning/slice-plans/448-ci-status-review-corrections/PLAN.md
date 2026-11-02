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
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Intent's CI status never calls the configured trunk "not published": a 404 on
the trunk's history reads **Could not be read** with GitHub's reason. A
`ciAdapter` project's story branch counts trunk results of shared commits, as a
`ciWorkflow` project's does, and the Intent doc states that rule. The judged branch
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
   already accurate. Amended 2026-11-02: Terry approved adapter parity, so
   slice 4 makes the adapter path count trunk results and the doc follow.
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

Amendment (2026-11-02, Terry, CI status recommendation chat): `ciAdapter`
trunk parity is in scope. For a story branch, also discover the configured
trunk through `ciAdapter`, count only the selected check's results for commits
actually in that branch's history, and name the run's branch honestly (for
example "run on `main`"). Nearer or newer applicable failure or running
results and unreadable evidence are preserved. This replaces the earlier
docs-only adapter restriction; completed slices and their evidence stay.

## Ordered slices

### 1. A trunk history 404 reads Could not be read with its reason
Type: Behavior
Status: done
Proof: added step in `dashboard/tests/intent-ci-status-reads.spec.ts`: the
fake origin answers 404 for `main`'s history → heading names `main`, **Could
not be read**, reason contains "404", no "not published"; the unpublished
story-branch step in `intent-ci-status-story-gaps.spec.ts` stays green. Doc
sentence for the adapter rule in `docs/dashboard-development-intent.md`.
Accepted proof: `intent-ci-status-reads.spec.ts` "CI status that could not be
read names main and the reason…" step "a 404 on main's history is Could not be
read…" (red against the pre-change server and client, green after); all
`intent-ci-status*.spec.ts` (12) and `agent-launch-base-ci*.spec.ts` (13)
green; `tests/support/dashboard-story-branch-ci.test.mjs` and
`npm run typecheck:dashboard` pass. Learning: the rule lives in
`readBranchHistory` (`branch !== source.ref`); `ShownJudgment` also requires a
story, so a red check must revert both.

### 2. One parameter for the judged branch
Type: Structure
Status: done
Proof: boundary refusal cases in `intent-ci-status-reads.spec.ts` ("the CI
status read refuses an unsafe branch name…") renamed to the new parameter and
green; `dashboard/tests/boundary/authenticated-*` read specs and all
`intent-ci-status*.spec.ts` green; the `requestedRead.ts` exception and the
mixed-parameter carve-out are gone.
Accepted proof: the judged branch is the `judged` parameter (parsed field
`judged`; the answer keeps `branch`); `intent-ci-status*.spec.ts` plus all
`boundary/authenticated-*.spec.ts` (229) green, the refusal loop also refusing
`branch=main`; `npm run typecheck:dashboard` passes. Learning: a test that
listens for a request parameter (`intent-ci-status-story.spec.ts` late read)
times out at 90 s, rather than failing an assertion, when the parameter is
renamed.

### 3. Cut overlapping CI status end-to-end tests
Type: Structure
Status: done
Proof: cancelled and timed-out → Failed move to
`tests/support/dashboard-story-branch-ci.test.mjs` (run with
`bash scripts/test.sh <path>`), one Failed E2E check kept; the trunk running
test in `intent-ci-status-reads.spec.ts` removed, with S3.8 and E7a/E7b
coverage named at `intent-ci-status-story.spec.ts` "a running head…"; all
`intent-ci-status*.spec.ts` green.
Accepted proof: `dashboard-story-branch-ci.test.mjs` "a cancelled or timed-out
run is Failed, never passed" (red under both `completedStateOf` mutations,
green after); one cancelled → Failed E2E step kept in `intent-ci-status.spec.ts`;
the trunk running test removed, its ancestor run link now asserted in the
story step; all `intent-ci-status*.spec.ts` (11) green; typecheck passes.

### 4. A ciAdapter story branch counts trunk results of shared commits
Type: Behavior
Status: done
Change: `judgeCommandAdapter` (`dashboard/server/baseCiJudgment.ts`) also
acquires and discovers the configured ref (`source.ref`) for a story branch,
listing the trunk's results first as `judgeGitHubActions` does and naming them
by `source.ref`; the trunk itself keeps one discover. The shared
`judgeNearest` rule (`baseCiNearest.ts`) keeps deciding which results count
(only commits in the judged branch's history) and their order. A failed trunk
discover reads **Could not be read** with its reason, never passed. Replace the
slice 1 doc sentence "with a `ciAdapter`, only the adapter's discover results
for the judged branch count" in `docs/dashboard-development-intent.md` with the
shared rule; update `dashboard/GITHUB-REQUESTS.md` or `LAUNCH-BASE-CI.md` only
if they state the adapter restriction.
Proof:
- unit (`tests/support/dashboard-story-branch-ci.test.mjs`, or the adapter's
  own unit test): an adapter story branch with no own result and a trunk
  passed result at a commit in its history → Passed at that commit,
  `runBranch` `main`; a trunk result for a commit not in its history is not
  counted; a nearer own failed or running result still decides; a failing
  trunk discover → unread with its reason;
- E2E: the ciAdapter case in `intent-ci-status-reads.spec.ts` (or the story
  spec) on a story branch shows "run on `main`", and the adapter still makes
  no `actions-*` GitHub calls (request counts otherwise unchanged);
- all `intent-ci-status*.spec.ts` and `agent-launch-base-ci*.spec.ts` green
  (the launch judges the trunk, so its single discover is unchanged);
- before publishing this last slice, run the full `npm test` and the whole
  dashboard suite on the final state (shared runtime path).
Accepted proof: `judgeBranchCi` reads the history once, and
`judgeCommandAdapter` runs the trunk and story-branch discovers concurrently
(trunk listed first; a failure aborts the other and reads unread with its
reason), so a story branch stays inside the 30 s read wait under the 20 s
adapter timeout. `dashboard-story-branch-ci.test.mjs` adapter tests (E2,
out-of-history exclusion, nearer own failed/running, failing trunk discover,
single trunk discover, concurrency), each red before the change;
`intent-ci-status-reads.spec.ts` ciAdapter trunk + story-board journey ("Passed
at 4774f60 (Add login), run on main", no `actions-*` calls), red with
own-only judging, `--repeat-each=5` stable; all `intent-ci-status*.spec.ts`
and `agent-launch-base-ci*.spec.ts` (24) green; typecheck passes. Learning:
sequential adapter discovers would have doubled the worst case past the read
wait; whether a project's own adapter tolerates two concurrent calls is the
adapter's contract, as with watchers.

## Local gates

- Focused proof as listed, with
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`.
- Failing and flaky tests follow this project's policy as written in
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## CI repairs

- Run 41458179788 (`10f4eec`, dashboard 10/12):
  `system-settings-feedback-maintenance.spec.ts` snapshotted the machine
  directory before the page's published-work read retained its answers under
  `retained-answers/`. The spec now waits with `untilPublishedWorkRead`. The
  CI status change did not cause it. A forced-delay reproduction failed 3/3
  before the fix and passed 5/5 after; the spec passed `--repeat-each=10`.

## Current decisions

- Terry approved `ciAdapter` trunk parity (2026-11-02); slice 4 builds it.
- The older observer timeout (`db511594` / run 41436051947) belongs to a
  separate investigation, not this correction.
