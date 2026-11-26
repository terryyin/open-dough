# Move authenticated-read proofs off the Board's ref read

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#move-authenticated-read-proofs-off-the-board-ref-read)

**Identity:** SEED-430#move-authenticated-read-proofs-off-the-board-ref-read

**Split from:** [SEED-430#open-the-board-from-the-verified-git-trunk](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-the-board-from-the-verified-git-trunk)
on 2026-11-26, as its prerequisite. That story's plan 856 slice 1 switch is
uncommitted in worktree
`/Users/terryyin/git/open-dough/.worktrees/open-the-board-from-the-verified-git-trunk`.
Its server part is kept here as
[board-git-open-server.patch](board-git-open-server.patch) so each slice can
prove its specs under the switch. Delete the patch at wrap-up.

## Goal and scope

Retarget the tests that reach general authenticated-read behavior through
the Board's cold REST `ref` read, so they pass both on trunk and with the
switch applied. Change tests and test support only; product code is
unchanged. The Board open story keeps every case whose promise is the cold
open itself (listed in the seed).

## Current decisions

- The revision check (`&since=<sha>`) is the main surviving trigger. It
  shares the `ref` read's label (`readingRefOf` in
  [readingRequestedRead.ts](../../../dashboard/server/readingRequestedRead.ts))
  and asks `repos/<repo>/git/matching-refs/heads/`
  ([ghRevision.ts](../../../dashboard/server/ghRevision.ts)). A failed
  listing falls back to `commits/main` (`RevisionChecks.check` in
  [revisionChecks.ts](../../../dashboard/server/revisionChecks.ts)), so one
  failed check asks gh twice and records two failures. Specs whose promise
  is the "while reading main of" wording fail a check (`checkedAt`); specs
  that count failures, diagnostics or incidents fail a pinned read
  (`pinnedAt`, `&revision=<sha>&path=…`), which asks gh once and records
  category `content`. Pinned reads also serve specs that need an answer.
- `dashboard/test-support/support/sharedReads.ts` holds one helper per read
  form (`revisionCheck`/`checkedAt`, `pinnedAt`) instead of inline bare
  `?source=` URLs in each spec. Drop the "membership" kind from
  `support/authenticatedReadUrl.ts`.
- Call accounting leaves membership reads (`ref` and its backlog content) out
  in one place: `retainedAnswersJourney.asked`, `revisionReuseCalls`, and
  `originObservation`'s reads-beside-checks.
- E2E recovery cases open the Board first, then fail `main` with
  `answerWith("main", …)` and `passTimeUntilAsked`, so the failure lands on a
  check with the snapshot kept. `publishedTarget` keeps mapping both `ref`
  and `matching-refs` to `main`.
- A spec that also needs a successful cold open under the switch must reach
  a served origin (`expectServedHomesReach`); in e2e the seeded origin opens
  the Board.

## Premises

| Premise | Result | Slice |
| --- | --- | --- |
| A `&since=` read that fails at gh gives the same "while reading main of" message as the cold read | Held: boundary and transient-eligibility specs observe it on trunk and under the patch | Slice 1 |
| A failed check changes only the category and the gh call | False: the listing falls back to `commits/main` (two calls, two failures); counting specs fail a pinned read instead (one call, `content`) | Slice 1 |
| The switch's server patch applies on trunk | `git apply --check` passed on `287488278` | All |

## Outside-in proof

| Promise | Proof owner |
| --- | --- |
| Failure classification, diagnostics and incident records are proved through the revision check or a pinned read | Slice 1 |
| Held gh lifecycle, directed waits, cooldown and the shared request owner are proved without the cold read | Slice 2 |
| Retained-answer, reuse and isolation call accounting leave membership reads out | Slice 3 |
| E2E transient and owner-failure recovery are proved after a failed check | Slice 4 |
| Every retargeted spec passes with the switch applied | Each slice |

Each slice runs its specs twice in the execution checkout: as they stand,
then with `git apply <plan>/board-git-open-server.patch`, which touches only
`dashboard/server`. Reverse it with `git apply -R` before delivery; the
patch is never committed outside this plan.

## Ordered slices

### 1. Prove failure classification through the revision check

Type: Behavior
Status: done

Behavior: Failures, diagnostics and incident records are reached through a
revision check. Add the shared-read helper. Retarget
`authenticated-read-boundary`, `-transient-eligibility`, `-refusal`,
`-diagnostics`, `-diagnostics-bounds`, `-output-bound`, and the four
`authenticated-read-incident-record*` specs in
`dashboard/backend-tests/observation/`. The refusal call count drops by one.

Proof: First observe the premise on one boundary case. Run those specs on
trunk and under the patch. Budget 14 active minutes.

### 2. Prove held gh lifecycle and directed waits without the cold read

Type: Behavior
Status: planned

Behavior: Retarget `authenticated-read-shared-waiters`, `-plugin-hooks`,
`-subprocess-lifecycle` (drop the membership kind; `authenticatedReadUrl.ts` takes `revisionCheck` from `sharedReads.ts`), `-cooldown-reach`,
`-directed-wait` (replace its ref entry with a revision-check entry),
`shared-request-owner` (refuse `matching-refs` and read `&since=`), and
`runtime/fake-gh-in-process`, `-activation`, `-scopes`, `-modes` and
`serving-modes` (a pinned or check read, asserting that read's gh call).

Proof: Run those specs on trunk and under the patch. Budget 14 active
minutes.

### 3. Leave membership reads out of call accounting

Type: Behavior
Status: planned

Behavior: The central filter leaves membership reads out of compared call
lists. Retarget `authenticated-read-retained-answers` (except the logged-out
cold-open case), `-retained-answers-moved`, `-retained-answers-bounded`,
`-revision-reuse-bounds`, and e2e `authenticated-read-retained-answers-reload`.
In `auto-refresh-project-isolation`, `expectOnlyDoughnutAsked` stops counting
the REST `ref`; checks and content still prove isolation.

Proof: Run those specs on trunk and under the patch. Budget 13 active
minutes.

### 4. Prove E2E recovery after a failed check

Type: Behavior
Status: planned

Behavior: Open the Board first, then fail `main`. Retarget
`transient-recovery-lifecycle`, `transient-recovery-currentness`,
`transient-read-recovery`'s lost-connection case, and
`authenticated-read-owner-failures`: its raw read uses `&since=` and its
browser notice comes from the first check after the page opens.

Proof: Run those specs on trunk and under the patch, then run the Dashboard
Backend Test and E2E Test suites on trunk. Budget 14 active minutes.

## Learnings

Slice 1 (2026-11-26): all 11 specs pass on trunk and under the patch.
Later slices that count calls on a failed check expect the listing, then
`commits/main`.

Spec classification comes from the plan 856 slice 1 run logs, under load
with two suites running at once (2026-11-26). Eight backend specs that seemed
to fail there passed in their Vitest part and need no change.

## Local gate

Run focused checks and Dashboard typecheck for each slice. Slice 4 runs both
full Dashboard suites. Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
