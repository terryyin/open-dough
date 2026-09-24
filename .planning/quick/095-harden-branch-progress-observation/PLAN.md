# Keep branch progress observation robust and give its rules one home

Status: executing.

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/095-harden-branch-progress-observation/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d8c67c0a29ff993a04b9dbb00c19bfba79aa7f4242e1a1e0839e199303214fac"}}
```

## Source and provenance

Execution retrospective of
`SEED-021#follow-published-story-branch` (story 3 of
`.planning/seeds/SEED-021-observe-published-story-progress.md` at before-cleanup
commit `4201097`), plan `.planning/quick/092-follow-published-story-progress/PLAN.md`
at that commit. Reviewed commits on
`claude/092-follow-published-story-progress`: `3f64bc7`, `4c0a387`,
`8c6ca50`, `63294d3`, `1415ecc`; claim `1443c42` is provenance. That story's
promises stand: progress source, labels, gaps, clock rule, and the all-branch
watch are unchanged. This correction changes no card wording.

## Beneficiary and outcome

Terry keeps automatic dashboard refresh when a Taken profile records an
unusual branch name or the observed repository's branch listing cannot be
read, instead of losing trunk freshness for the whole project. Maintainers
change how a story's plan path resolves in one place on the page and run a
suite without a redundant journey.

## Current findings

- **Whole-check coupling (F1).** `product-backlog-agent-profile.mjs`
  (`profileFactsError`) accepts any non-empty branch. `watchedBranchHeads`
  (`dashboard/src/progressSource.ts`) watches every branch route unfiltered.
  `parseRequestedRead` (`dashboard/server/requestedRead.ts`, `isSafeBranchName`
  at the `watch` list) refuses the entire revision check when one watched name
  is unusable, and `revisionCheckSchedule.ts` treats that as `onFailed` on
  every check. Git allows names such as `issue#12`, `feat+x`, or `story/café`;
  one such profile stops trunk-move detection project-wide.
- **Listing failure loses trunk (F2).** `checkHeadsViaGh`
  (`dashboard/server/ghRevision.ts`) is now the only revision check, and
  `RevisionChecks` takes trunk from that listing. Verified on 2026-09-24:
  `matching-refs/heads/` is unpaginated (facebook/react: 975 refs, 376 KB, no
  `Link`), `execGh` caps output at 1 MiB (about 2,700 branches), and
  microsoft/vscode answered `504`. Any failure there now loses trunk freshness,
  which the trunk-only `commits/<ref>` check never did. Today's catalog
  (open-dough 4 refs, Doughnut 85) is unaffected.
- **Plan path rebuilt four times on the page (F3).** `recordedPlanOf`
  (`dashboard/src/progressRoute.ts`) repeats
  `resolveBesideFile(snapshotRepositoryPath(canonical), approach.plan)` already
  in `preparationEnrichment.ts`, `workEntryFacts.ts`, and `planAssociation.ts`,
  with a different gap wording ("The recorded plan path could not be
  resolved…" vs "The associated plan path could not be resolved."). The server
  has one owner, `plannedPlanPath` (`reachablePaths.ts`).
- **Redundant and missing tests (F5).**
  `dashboard/tests/story-readiness-slices-heading.spec.ts` builds a real Git
  repository only to show "2 of 5 recorded complete" under `## Slices`; the
  plan-reader unit cases, `branch-slice-progress.spec.ts` (branch plan under
  `## Slices`, detail "6 of 8 recorded complete"), and
  `sliceClockRecords.ts` plans already cover it. The two-owner gap is asserted
  in both `taken-slice-clock.spec.ts` and `branch-slice-progress.spec.ts`.
  `elapsedWords` (`dashboard/src/SliceClock.tsx`) hour and day formats have no
  observation; specs cover 2 to 40 minutes, while story branches often run
  for hours.
- **Residue (F7).** Story 3's wrap-up added the Taken card's progress, labels,
  gaps, and per-load `gh` costs to `dashboard/README.md`; it does not yet state
  the heads listing's size limit. `ghRevision.ts` still calls
  `commits/<ref>` "the one GitHub endpoint that says which commit a ref names".
  `refCheckArgv`, `refChecks`, and `isRefCheck` in
  `dashboard/tests/autoRefreshJourney.ts` now mean the heads listing.
  `elapsedWords` is exported but used only in its file. `requestedRead.ts`
  repeats commit-time parameter validation and messages for the trunk and
  branch paths.

## Scope

Included: an unusable recorded branch becomes that entry's gap and is not
watched; a failed heads listing falls back to the trunk-only check for that
check; one page plan-path resolution; removal of the redundant journey,
consolidation of the two-owner assertion, and hour/day clock coverage; the
README's listing limit, comment, and test-helper naming updates; folding the
repeated commit-time validation.

Excluded: card and detail wording (settled; see Current decisions), a
TypeScript unit runner and moving refusal cases out of E2E, server-side memory of resolved
trunk revisions (F6, pre-existing design), reusing listing heads after a trunk
move, and the moved-branch read-wait notice (F8 hypotheses).

## Preserved promises and constraints

- Every story 3 key example keeps its current observation and wording.
- The read boundary stays an allowlist: the server still refuses an unsafe
  or unrecorded branch in any read or watch request, before any `gh` call.
- Hidden-page and rate-limit behavior of the automatic check are unchanged;
  a rate-limited listing is not a fallback trigger.
- A `304` answer still reads nothing.

## Outside-in proof

| Example | Slice | Observation |
| --- | --- | --- |
| A Taken profile records Story Branch Mode on `story/café`; trunk moves | 1 | `auto-refresh-branches.spec.ts`: that card shows an unusable-branch gap with no branch request, and the trunk move is still read within the check pace |
| The heads listing answers `504`; trunk moves | 1 | `authenticated-read-revision-check.spec.ts`: the check falls back to `commits/<ref>` and reports the new trunk revision; a rate-limited listing still reports the limit |
| Plan path resolves the same for bar, clock, and branch read | 2 | `branch-slice-progress`, `taken-slice-progress`, `taken-slice-clock`, `story-readiness*` stay green; one page caller resolves plan paths |
| A slice has run for 26 hours | 3 | `taken-slice-clock.spec.ts` step shows "1 d 2 h" |
| Suite still proves `## Slices` and the two-owner gap once each | 3 | plan-reader unit cases and `branch-slice-progress.spec.ts` |
| README and helper names match behavior | 4 | doc diff; full `npm run test:dashboard` and typecheck green |

## Current decisions

- **Filter on the page, refuse on the server.** Move `isSafeBranchName` to
  `dashboard/src/authenticatedReadRules.ts`, shared by page and server. The
  page routes an unusable recorded branch to a progress gap and leaves it out
  of `watch`; the server's refusal stays as the boundary's defence.
- **Fallback is per check.** A listing failure other than a rate limit makes
  that check use the trunk-only `commits/<ref>` answer and report no branch
  heads; branch watching resumes on the next successful listing. The README
  records the listing's size limit.
- **One page plan path.** Enrichment records the resolved plan path once on
  `WorkEntry` (for every non-absent plan state); `routeOf`, the clock, and
  preparation read it. One gap wording remains, the existing "The associated
  plan path could not be resolved."
- **Wording is settled.** On 2026-09-24 Terry asked for consistent wording
  without preferring particular words; story 3's closure made the cards,
  detail, seed, and UX/UI North Star say "N of M slices recorded complete"
  and "Current slice started N min ago". Keep those terms; this correction
  changes no wording.

## Execution

Story Branch Mode. Execution checkout `/Users/terryyin/git/open-dough-095`,
branch `claude/095-harden-branch-progress-observation`, started from
`995efb6`; claim `7c629e0` published on `origin/main` (agent Akiho-chan,
publisher `claude-095`). Increments publish to
`origin/claude/095-harden-branch-progress-observation`. CI: GitHub Actions
`ci.yml` ("CI").

## Ordered slices

### 1. Trunk refresh survives unusable branch names and a failed branch listing

Type: Behavior
Status: done
Proof: new steps in `dashboard/tests/auto-refresh-branches.spec.ts` (a
`story/café` Story Branch profile shows its gap, no `branch` request for it,
and a trunk move is read); new cases in
`dashboard/tests/authenticated-read-revision-check.spec.ts` (listing `504`
falls back to `commits/<ref>`; rate-limited listing still reports the limit);
existing `auto-refresh*` and `authenticated-read-refusal` specs green;
`npm run typecheck:dashboard`.

Behavior: a shown snapshot whose profile records an unusable branch, or whose
heads listing fails → the automatic check runs → trunk freshness is still
reported, and only the affected entry shows a gap.
Accepted: `routeOf` (`progressRoute.ts`) turns a recorded branch failing the
shared `isSafeBranchName` (`authenticatedReadRules.ts`) into the gap "The
recorded branch B has a name this dashboard cannot use, so its slice progress
cannot be read. Trunk's copy is not its progress.", so it is never read or
watched. `RevisionChecks.check` falls back to `resolveRevisionViaGh` on any
listing `GhFailure` except a rate limit or an aborted check; the answer then
omits `branches` and the page treats that as no heads moved.
`npm run test:dashboard -- authenticated-read-revision-check` (8 passed;
504 fallback case and the rate-limit-only-lists assertion in
`authenticated-read-revision-check-failures.spec.ts`);
`auto-refresh-unusable-branch.spec.ts` (gap text, no `story/café` in any
`branch`/`watch` parameter, trunk move read at pace);
`npm run test:dashboard -- auto-refresh authenticated-read branch-slice-progress taken-`
(60 passed); `npm run typecheck:dashboard`.

### 2. The page resolves a story's plan path once

Type: Structure
Status: done
Proof: `npm run test:dashboard -- branch-slice-progress taken-slice
story-readiness preparation`, then the full `npm run test:dashboard`; `grep -n
resolveBesideFile dashboard/src` shows one plan-path caller;
`npm run typecheck:dashboard`.

Structure: carry the resolved plan path on `WorkEntry` from enrichment and
remove the rebuilds in `progressRoute.ts`, `preparationEnrichment.ts`,
`workEntryFacts.ts`, and `planAssociation.ts`. Product behavior is unchanged.
Accepted: `recordedPlanPathFor` (`workEntryFacts.ts`) is the page's one
plan-path caller of `resolveBesideFile`; enrichment sets `WorkEntry.planPath`,
read by preparation, slice reading, `routeOf(entry)`, and the clock. The
route's unresolved-path gap now reads "The associated plan path could not be
resolved." (no test asserted the old wording). Full `npm run test:dashboard`
(113 passed); `npm run typecheck:dashboard`.

### 3. The dashboard suite proves each clock format and gap once

Type: Structure
Status: planned
Proof: `npm run test:dashboard -- taken-slice branch-slice-progress
story-readiness`; `node --test
tests/support/product-backlog-plan-reader.test.mjs`.

Structure: delete `story-readiness-slices-heading.spec.ts` and the helpers
only it uses (`expectReadyDetailTwoCompleteUnderSlicesHeading`,
`planReadyTwoDoneSlicesHeadingBody`, the `planBody` parameter if unused);
keep the two-owner gap only in `branch-slice-progress.spec.ts`, adding its
"no running for" assertion there; add a 26-hour step to
`taken-slice-clock.spec.ts` observing "1 d 2 h" (and an hours value on the way).

### 4. Docs and helper names describe the delivered observation

Type: Structure
Status: planned
Proof: full `npm run test:dashboard`; `npm run typecheck:dashboard`; README
diff reviewed against the delivered behavior.

Structure: state the heads listing's size limit and fallback in
`dashboard/README.md`; fix the
`ghRevision.ts` endpoint comment; rename `refCheckArgv`/`refChecks`/
`isRefCheck` to heads-check names; unexport `elapsedWords` unless slice 3's
coverage needs it; fold the repeated commit-time validation in
`requestedRead.ts` into one helper with one set of messages.

## Learnings

- A not-logged-in listing now also asks the ref alone before reporting the
  same message (two `gh` calls); no test asserts the call count there.
- The installed `execution-start.mjs` still lacked the fix for claiming a
  correction whose plan is its canonical home (`b7246d2`); startup ran from
  `src/skills/dough-execute-plan/scripts/` instead.
- The server's `plannedPlanPath` (`reachablePaths.ts`) still repeats the page's
  plan-path rule; merging page and server owners was outside this plan.
- The preparation gap "The recorded plan path does not resolve to a file
  inside the observed repository." remains a separate wording; no test
  observes either unresolved-path gap.
