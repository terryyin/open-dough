# Read Intent, CI, review and side-panel sessions through one required page entry

**Identity:** SEED-413#speed-intent-timing-history-proof
**Source:** [Read Intent, CI, review and side-panel sessions through one required page entry](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-timing-history-proof)
**Source review:** [source-review.md](source-review.md)
**Split from:** SEED-413#speed-intent-proof-and-timing (recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`, former Slices 4–6) on 2026-11-21 at its delivered Slice 3 boundary
**Split:** Terry authorized splitting at delivered Slice 2 on 2026-11-22; former Slices 3–9 moved to `SEED-413#speed-intent-ci-status-frame-and-timing-history` ([plan 764](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md), Slices 2–8, after a new Slice 1).

## Goal and scope

Dashboard maintainers get Intent, CI, review and side-panel session proof
that reads through the same entry production uses. Production and every case
supply Intent, CI and review reads and the side panel's session calls through
one required typed page entry (`dashboard/src/pageReads.tsx`,
`dashboard/src/sessionServices.ts`). Readers are fixed at creation, with no
optional members, context defaults or defaulted parameters, and the test
supply rejects unsupplied reads. This is the first part of the
[CI status test entry correction](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry).
The remaining page reads, the CI status cases' production page frame and
owning composition, and the timing-history moves belong to
`SEED-413#speed-intent-ci-status-frame-and-timing-history` (`plan 764`).

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- One production provider takes the page's reads as a required typed prop and
  throws when a consumer reads outside it, following the `SessionsSidebar`
  precedent ("The Sessions button is outside the page's PageFrame.").
  `ConfiguredDashboard` supplies the authenticated readers explicitly. Add a
  read only as a required member, never as an optional member, context
  default or defaulted parameter.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under
the [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selections, and
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and check
representative E2E history consumers when shared contracts change.

## Decisive premises and proof

- At `f5237fab7` on 21 November 2026: production `ConfiguredDashboard`
  provides none of `IntentCiReadSourceOnPage`, `IntentReadSourceOnPage` or
  `ReviewSourceOnPage`, and their defaults serve production. 8 production
  modules read them. 9 test files under `dashboard/frontend-tests/` provide
  them. `PageFrame` takes typed `sessions` (a `MachineSessions` pick) and
  `stories`. `aPublishedWork` has no step that adds a Taken story.
  `SessionsSidebar.tsx` already throws when a consumer sits outside its
  provider ("The Sessions button is outside the page's PageFrame."), the
  precedent for a required page entry.
- Scratch mount at `ebd6cc201` on 21 November 2026 (Vitest Browser Mode,
  `frontend.vitest.config.mts`): real `PageFrame` inside `ProjectsOnPage` and
  `LaunchesOnPage`, with the Side panel case's MakeMe sessions and global
  `fetch`/`WebSocket` recorded. Mounting made no call. Showing the Taken
  story's final report fetched `/__agent-launch/result?source=open-dough&host=claude&session=f-session`.
  Showing the ad hoc session's terminal fetched `/__host-status`, opened
  `ws://…/__agent-terminal?source=open-dough&session=…&host=claude`, and
  called `launches.rereadSessions`. Without `LaunchesOnPage`, `Terminal`
  throws "A launch control is shown outside the page's launches." The
  scratch spec was deleted.

| Promise | Owning proof |
| --- | --- |
| Production and every case supply Intent, CI and review reads through one required typed entry. Readers are fixed at creation, with no optional members, defaulted parameters or test-only reselection. | Slice 1 (`npm run typecheck:dashboard`, the CI status and comparison families, one representative Intent E2E journey). |
| The final-report, host-status and terminal-attach calls go through the required typed page entry that production supplies. | Slice 2 (typecheck, full frontend group, representative session E2E journeys). |

## Slices

**Split at delivered Slice 2.** Former Slices 3–9 moved on 22 November 2026 to
`SEED-413#speed-intent-ci-status-frame-and-timing-history`
([plan 764](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md)):
former Slice 3 (frame mount) is its Slice 2, former Slice 4 (status evidence
and cue contrast) its Slice 3, and former Slices 5–9 (timing history) its
Slices 4–8. Its new Slice 1 moves the story notes, CI follow-up and
review-state reads behind this entry.

### 1. Intent, CI and review reads enter through one required typed page entry

Type: Structure
Status: done

Replace the three default-valued contexts (`IntentCiReadSourceOnPage`,
`IntentReadSourceOnPage`, `ReviewSourceOnPage`) with one production provider.
It takes the page's reads as a required typed prop and throws when a consumer
reads outside it, following the `SessionsSidebar` precedent. `ConfiguredDashboard`
supplies the authenticated readers explicitly. Make every CI read member
required (`readHistory` included) and drop its fallback. Each reading owner
(`ciProofReading`, `ciComparisonProofs`, `ciComparisonReading`) takes its
reader when created, not per call: remove the defaulted parameters and the
reader-identity reselection rule. Move every test provider of the three
contexts to the new entry, comparison family included, with no change to its
assertions.

**Proof.** `npm run typecheck:dashboard` passes. The 7 CI status and
cue-contrast files and the CI comparison family's Vitest files pass unchanged
in their assertions. One representative Intent CI E2E journey passes,
proving that production supplies the authenticated readers. `grep` finds no
default-valued read context, optional read member or defaulted reader
parameter in `dashboard/src`.

**Accepted (21 November 2026).** `dashboard/src/pageReads.tsx` is the entry
(`PageReads`, `PageReadsOnPage`, `useIntentReads`/`useIntentCiReads`/
`useReviewReads`, `authenticatedPageReads`). Cases supply reads through
`pageReadsSupplying` in `dashboard/test-support/component-mount/unreadPageReads.ts`;
unsupplied reads reject. `readCachedFile` also lost its defaulted reader.
Proof: typecheck, full `npm run --silent test:dashboard:frontend` (Vitest 100
files / 306 tests plus legacy Playwright), backend `ci-comparison-client*` and
`intent-shared-reads`, E2E `intent-ci-status` and `story-review-commits`.
Learning for Slices 5–9: the legacy timing-history specs mount through
`dashboard/test-support/comparison-mount/entry.tsx`, which now supplies
`authenticatedPageReads` against its real test servers; it stays until its
last consumer moves. The full frontend group also exposed a flake: a
settings touch helper switched off the context's touch emulation for later
spec files (`board-indicators` lost its coarse pointer). It was fixed in
`system-settings-browser.ts`.

### 2. Side-panel service calls enter through the typed page entry

Type: Structure
Status: done

Decided (Terry, 21 November 2026, option (a)): put the panels' three untyped
service calls behind the Slice 1 typed page entry. `ConfiguredDashboard`
supplies their authenticated implementations and each case supplies typed
replies, keeping the real frame:
- the final-report read (`FinalReport.tsx`, `fetch` of
  `/__agent-launch/result`);
- the host-status read (`hostStatusReads.ts`, `/__host-status`, reached when
  the terminal shows);
- the terminal attach (`attachTerminal` in `attachedTerminal.ts`, used by
  `useAttachedTerminal.ts`, a WebSocket to `/__agent-terminal`).

`PageReads` gains a required `sessions` member (`dashboard/src/sessionServices.ts`:
`readFinalReport`, `readHostStatus`, `openTerminal`) that
`authenticatedPageReads` supplies; `pageReadsSupplying` rejects unsupplied
session calls. The two legacy mounts that Slice 3 replaces supply it until
then.

**Proof.** `npm run typecheck:dashboard` passes; the full frontend group
passes; representative E2E journeys for the final report, the attached
terminal and its host status pass, proving production supplies the
authenticated services.

**Accepted (22 November 2026).** `attachTerminal` takes the opened
`TerminalSocket`; the client `terminalUrl` is gone. Proof: typecheck, full
frontend group (Vitest 102 files / 314 tests plus legacy Playwright), E2E
`agent-terminal-done-report`, `sessions-sidebar-host-status`,
`agent-launch-ad-hoc-terminal`, `agent-terminal-keyboard` and
`intent-ci-status`. Learning for Slice 3: Slice 3 should record each case's
`fetch` and `WebSocket` calls and show none outside its typed replies. Under
load 15–20 the full frontend group took about 24 minutes wall time.

**Trunk reconciliation (22 November 2026).** Merging `c64549aac`
(SEED-420#choose-story-comparison-in-intent) brought two board mounts that
provided the removed contexts. `board-frame-mount.ts` renders the real
`ConfiguredDashboard`, whose built-in authenticated reads would have hidden
the case's Intent reads, so `ConfiguredDashboard` now takes its reads as a
required `reads` prop and `App` supplies `authenticatedPageReads`.
`board-mount.ts` supplies its review reads through `PageReadsOnPage`.

## Plan review

Amended on 21 November 2026 by the execution retrospective of
SEED-413#speed-intent-proof-and-timing. Slices 1–3 correct its test entry
ahead of the history moves, the former Slices 1–5 are now 4–8, and their
decisions no longer extend the corrected seam with optional defaulted
readers or restated provider stacks. Eight slices is the plan limit.
Refinement was not needed: each correction slice keeps one boundary (the
production read entry, the page-frame mount, the evidence mount).
Slice 2's entry is settled: Terry chose option (a) on 21 November 2026, and
the scratch mount (see the premises) named the three untyped calls it moves.
Slice 3 may need a production extraction to make the CI status owner stand
alone; that extraction is bounded to the slice's own owner. No remaining
concern blocks readiness.

Refined in execution on 22 November 2026: Slice 2 stopped at 9 of 15 active
minutes because its premise failed. The side-panel case also observes the
Taken story cards (`Board`) and the Development/Intent switch, which sit
outside `PageFrame` plus the Intent body, so the mount boundary needs one
extracted Board/Intent production component. The plan's own rule ("extract
it in production") covers that extraction. Former Slice 2 split into Slice 2
(service calls behind the entry, nearly complete) and Slice 3 (frame mount),
renumbering former Slices 3–8 to 4–9. Nine slices stays within the
in-execution limit for splitting the slice in progress.

Narrowed at delivered Slice 2 on Terry's authorization on 22 November 2026
(`dough-resplit-story` `#split-at-a-delivered-slice-boundary`). Former Slice 3
stopped at 10.7 of 15 active minutes on a failed premise: the production
Board fetches story notes, CI follow-up and review states outside the typed
entry. Slices 1–2 are `done` with independent proof. Former Slices 3–9 (the
CI status frame and evidence mounts and the 31-case / 19-file timing-history
moves) moved to `764-speed-intent-ci-status-frame-and-timing-history/PLAN.md`
as Slices 2–8, after a new Slice 1 that moves those three reads behind the
entry.


## Story obligations

### G1. Trunk board mounts reached the real readers (discovered in the execution retrospective)
Reported: slice 2 — "slice 2 — "After merging c64549aac, board-frame-mount.ts and board-mount.ts supplied authenticatedPageReads, so their cases reached the real Intent, CI and review readers when they supplied none.""
Story clause: "Cases supply reads through `pageReadsSupplying`, which rejects unsupplied reads"
Disposition: proved by slice 2: dashboard/frontend-tests/navigation/board-frame-mount.ts and board-mount.ts now pass pageReadsSupplying with only their supplied reads plus explicit authenticatedSessionServices; the 28 specs that use them pass (evidence retro-board-mounts-2, 62 tests), and no test mount except the legacy comparison-mount entry and the whole-App mount supplies authenticated reads
Commitment: N6
