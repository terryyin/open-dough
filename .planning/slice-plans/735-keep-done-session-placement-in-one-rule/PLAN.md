# Keep Done session placement in one rule and its proof cohesive

**Identity:** SEED-419#keep-done-session-placement-in-one-rule
**Source:** [Keep Done session placement in one rule and its proof cohesive](../../seeds/SEED-419-correct-done-session-history-structure.md#keep-done-session-placement-in-one-rule)
**Source review:** [source-only review](source-review.md)

## Provenance

This is a retrospective correction of the completed
`SEED-414#review-done-sessions-on-open-story-cards` (plan 728, removed at
wrap-up). Reviewed commits: `4f7b65f0c` (placement and disclosure),
`fb448cfb9` (E2E retargeting repair), `a7f578415` (scan emphasis),
`758e195d3` (scan-proof repair), landed in `ee5ed8957`. The developer accepted
refactoring forward over a revert on 2026-11-20.

## Goal and scope

Maintainers change where the Board shows a Done session by editing one
placement rule and the tests that own it. Every delivered behavior stays:
an unfinished Backlog or Taken card holds its own story's Done sessions in a
collapsed **Done** disclosure; otherwise a listed published done card holds
them; otherwise they stand alone in Recently done; Recently done counts its
rendered top-level entries; sidebar navigation reveals a nested entry; scan
emphasis leads with title and progress and emphasizes the current session.

Excluded: any change to visible behavior, wording, session retention, ad hoc
follow-up grouping, review semantics, and the wider Playwright-to-Vitest
renovation that SEED-413 owns. Specs this correction does not touch stay on
their current runner.

## Current findings

1. **Shotgun E2E edits with no protection.** `fb448cfb9` retargeted about 25
   E2E specs from `parts(page).recentlyDone…` to
   `doneSessionsOnCard(card)` / `doneSessionsOnUnfinishedCard(page, title)`.
   Specs whose subject is not placement (rename failure, attention message,
   Cursor Done, retirement) still name where a Done entry lives, so the next
   placement change repeats the edit. `dashboardParts.ts` holds four
   overlapping helpers for it.
2. **New Playwright frontend spec.** `dashboard/frontend-tests/stories/story-card-scan-emphasis.spec.ts`
   imports Playwright through `frontendApp.ts`, against the
   [Architectural North Star](../../NORTH-STAR.md) "Plain Vitest for unit
   tests; Playwright only for E2E" and plan 728's own gate. It asserts
   `toMatch(/rgb/)` and compares a text colour with another element's
   background. The open-session wash also moved into E2E through
   `expectSessionEntrySetOff(…, "--accent-soft")` in
   `e2e/sessions/agent-launch-story-card-sessions.spec.ts`.
3. **Setup-heavy disclosure test from a wide production input.**
   `StoryCardDoneSessions` takes all of `MachineSessions`, `sourceId` and
   `project`, selects its own sessions and builds `SessionFollowUp`. Its spec
   hand-casts `LaunchWithState`, stubs a nine-member `PageSessions`, casts
   `{ launched } as MachineSessions`, and queries the DOM directly; its third
   case tests the pure `newestFirst` inside the component spec.
4. **Placement written twice.** The card selects with `storyDoneSessionsOf`;
   Recently done separately skips the same sessions through `heldByUnfinished`
   and an optional `unfinishedIdentities = []` parameter threaded through
   `useRecentlyDone`. Drift would show a session twice or nowhere and miscount
   Recently done.

## Current decisions

- `columnSessionsOf` (`dashboard/src/columnSessions.ts`) is already the Board's
  one session-placement seam from published membership and saved Done
  (ADR 0008, durable project state versus local operational state). Extend it
  to place Done sessions: the unfinished card's own Done sessions, keyed by
  identity, and the remaining Done sessions Recently done lists. Recently done
  receives only those remaining sessions, so `newestFirst` and
  `useRecentlyDone` lose `unfinishedIdentities` and `heldByUnfinished`. A
  historical done card for an unfinished identity then finds no own sessions
  naturally, and its closed ad hoc follow-ups keep their current home.
- The card receives its placed Done sessions from the Board through
  `Columns` → `StoryCard`. `StoryCardDoneSessions` takes `sessions`,
  `storyCardAssignments` and a follow-up render slot that `StoryCard` fills
  with `SessionFollowUp`; `storyDoneSessionsOf` goes away.
- New or rewritten frontend proof uses Vitest Browser Mode with
  `mountComponent` or the mounted dashboard harness, page objects beside the
  specs, and page-loadable MakeMe builders, per
  [Dashboard Frontend Test](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
- E2E specs read a Done session through one page-object call that finds it
  at its Board home, opening a collapsed Done disclosure when needed. Only
  specs whose subject is placement keep naming a location:
  `agent-launch-story-card-done`, `recently-done-returned-sessions`,
  `agent-launch-done-listing` and the Recently done count in
  `agent-launch-codex`.
- Keep `sessionNavigation.ts` opening the disclosure on a reveal; it is the
  delivered sidebar-reveal behavior and remains proven by
  `recently-done-returned-sessions`.

## Decisive premises

| Premise | Observation |
| --- | --- |
| `columnSessionsOf` is the only Board placement of project sessions, called once from `Board.tsx`, and `useRecentlyDone` is fed `sessions.done` from it. | Read at `56df0c4b5`: `git grep columnSessionsOf` lists only `Board.tsx`; `Board.tsx` passes `sessions.done` and `unfinishedIdentities` to `useRecentlyDone`. |
| Launch-record and session-state builders load in the browser for Vitest Browser Mode. | `npx esbuild Distribution/tests/support/launchTestData.mjs --bundle --platform=browser` and the same for `launchObservationTestData.mjs` resolved with no Node import at `56df0c4b5`; `launchMakeMe.mjs` does not (`node:os`, `node:path`), so page cases register only the browser-loadable builders in `pageMakeMe.mjs`. |
| The mounted dashboard can show an arranged Taken story with plan progress and open plus Done sessions. | `mountAnsweredDashboard({ answers })` takes `MountedServiceAnswers` built in Node from a `FrontendServiceState` by a browser command (`test-support/support/mountedDashboardCommands.ts`); the scan spec's arrangement already produces that state through `putFrontendPublished` and `answerMachine`. |
| The affected suites pass before the change. | CI completion succeeded on `758e195d3` (SEED-414's final revision); the 20 later trunk commits up to `56df0c4b5` touch none of the files named in the slices. |

## Ordered slices

### 1. One Board rule places every Done session

Type: Structure
Status: done

Move Done-session placement into `columnSessionsOf` and feed both homes from
it, as Current decisions describe. Remove `heldByUnfinished`,
`unfinishedIdentities` from `newestFirst` and `useRecentlyDone`, and
`storyDoneSessionsOf`. Thread the placed sessions to the card. Enables
slice 2's narrower disclosure input.

**Proof.** A new Vitest spec beside the session listing specs proves the rule
on typed records built with page-loadable MakeMe: an unfinished card's own
Done sessions are held by it and absent from the Recently done input; a
historical done card for that identity holds none of them; a completed
story's sessions reach its done card; unrelated sessions stand alone; a
different project's launch with the same identity stays standalone; open
sessions keep their current placement. Delete the `newestFirst` case from
`story-card-done-disclosure.spec.ts`. Run that spec,
`recently-done-active-story-sessions`, `recently-done-story-sessions`,
`recently-done-follow-up-membership`, `recently-done-sessions-select-development`
and E2E `agent-launch-story-card-done`, `recently-done-returned-sessions`,
`agent-launch-done-listing`.

**Accepted proof (slice 1).** `board-done-session-placement.spec.ts` (seven
cases, one per placement result) and `story-card-done-disclosure.spec.ts`:
`npm run test:dashboard:frontend -- board-done-session-placement story-card-done-disclosure`,
9 passed. Retained frontend `recently-done-active-story-sessions`,
`recently-done-story-sessions`, `recently-done-follow-up-membership`,
`recently-done-sessions-select-development` (8 passed) and E2E
`agent-launch-story-card-done`, `recently-done-returned-sessions`,
`agent-launch-done-listing`, `launches/agent-launch-codex`,
`responsive-session-start` (5 passed), plus typecheck and lint.

**Learnings (slice 1).** The Board places over `launches.launched` and gates
the column and Recently done readings on `launches.records`, so a card shows
its Done history before the first sessions read answers, as it shows its open
sessions. The browser-loadable `aLaunchRecord`, `aSessionState` and
`anObservedLaunch` are now in `pageMakeMe.mjs` for slice 2. Retained
Playwright frontend specs run only when named by path; their pass evidence is
the `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` JSON.

### 2. The Done disclosure renders the sessions it is given

Type: Structure
Status: planned

`StoryCardDoneSessions` takes `sessions`, `storyCardAssignments` and a
follow-up slot; `StoryCard` supplies `SessionFollowUp`. Rewrite
`story-card-done-disclosure.spec.ts` to mount the disclosure with records
from page-loadable MakeMe (register the launch-record and session-state
builders in `pageMakeMe.mjs` if absent) and a small page object beside the
spec for the disclosure, its rows and its summary. Supply `SessionsOnPage`
through one typed test-support value rather than an inline stub. Keep its two
behavior cases: collapsed count of two, newest-first rows when expanded, focus
kept on the summary when collapsed; and no disclosure without Done sessions.

**Proof.** The rewritten spec passes with no `as` casts of domain records or
`MachineSessions` and no direct `querySelector`; slice 1's specs and E2E
`agent-launch-story-card-done` still pass.

### 3. Scan emphasis is proven in a mounted Vitest board

Type: Structure
Status: planned

Replace `dashboard/frontend-tests/stories/story-card-scan-emphasis.spec.ts`
with a Vitest Browser Mode spec on the mounted dashboard harness, arranged
through a browser command from the same Taken story, plan progress, open and
Done sessions. Keep its observations: title and compact progress lead, then
current session, Done disclosure and inspection group in order; the open
session carries the `--accent-soft` wash while the Done summary and Inspect
stay quieter, compared against their own resolved tokens; Open terminal, Done
and Inspect take focus in turn; at 360 px the same facts stay visible and the
meta line fits. Move the open-session wash check out of
`e2e/sessions/agent-launch-story-card-sessions.spec.ts` into this spec and
return `expectSessionEntrySetOff` to its single raised-surface reading if no
other caller needs the parameter.

**Proof.** The new spec passes and the Playwright scan spec is deleted;
`agent-launch-story-card-sessions`, `taken-slice-progress`,
`story-card-selection` and `recently-done-review-cue` still pass.

### 4. E2E journeys read a Done session wherever the Board places it

Type: Structure
Status: planned

Add one page-object reading in Dashboard Test Support that returns a session's
Done entry at its Board home, by session text, opening a collapsed card
disclosure when the entry is inside one. Retarget every E2E spec and support
module that used `doneSessionsOnCard`, `doneSessionsOnUnfinishedCard` or
`unfinishedStoryCard` for a non-placement purpose, including
`continuationPage.ts`. Keep the placement-subject specs listed in Current
decisions on explicit locations. Remove helpers that no caller still needs.

**Proof.** `git grep` shows the location-specific helpers used only by
placement-subject specs. Run every retargeted E2E spec plus the
placement-subject specs; all pass.

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection before test edits. Keep default timeouts; never use `test.slow()`.
- On AC power, run tests under `caffeinate -s -i`, as described in
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
  with Homebrew Bash 5 and `NO_COLOR`, `FORCE_COLOR` and
  `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset.
- Run focused frontend specs with `npm run test:dashboard:frontend -- <specs>`
  and E2E specs with `npm run test:e2e -- <spec paths> --project=chromium --workers=2`.
  Run `npm run typecheck:dashboard` and `npm run lint` for each slice.
  Slice 4 also runs the whole `e2e/sessions/` group once, because the
  retargeted reading is shared by that group's journeys and plan 728's
  consumer-trace miss came from that group.

## Plan review

Slice-plan refinement was not needed: each slice changes one concept
(placement rule, disclosure input, scan proof runner, E2E reading) with its
own focused proof, and later slices depend only on earlier delivered
structure. No remaining slice-specific concern was found.
