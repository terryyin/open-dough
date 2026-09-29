# Prove the busy-session rename edge and confirm observer shutdown honestly

## Source and authority

- **Identity:** SEED-052#mark-done-residue.
- **Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#mark-done-residue),
  from the execution retrospective of SEED-052#card-session-residue (plan
  160) on 2026-09-29.
- **Provenance:** reviewed commits `26099a6a`, `4e0b2420`, `f00ced6a`,
  `bb5ee6a1`, `75bdc10d`, and `95fa693c` on `claude/card-session-residue`,
  after the Take `e8d16b3a`; `f5f4dce6` and `d83bb839` merged trunk.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

Maintainers can rely on a test for Mark as done's documented busy-session
rename timeout, trust that a CI completion receipt claims a confirmed
shutdown only when the observer is known gone, and change Mark as done's page
journeys in specs that each own one concern and stay within 250 lines.

Preserved: every Mark as done promise in `dashboard/AGENT-LAUNCH.md` and the
North Star row; SEED-052#reopened-session-returns' reopening behavior; plan
160's ownership split (Recent sessions owns the state matrix plus one card
entry; card specs own card placement, controls, and persistence); the CI
observer's report-once lost-worker behavior and exact-revision completion.
Excluded: new behavior; changing what the page shows when a mark's wait
expires; ADR 0008 (Proposed, and its Launch workflow wording already matches
the product).

## Current findings

1. `dashboard/AGENT-LAUNCH.md:166-170` promises that a busy session's queued
   `/rename` can outlast the wait, leaving the `done-` name only the
   dashboard's, while the session is still stopped. `dashboard/server/doneMarks.ts:69-87`
   implements the deadline loop, but the fake `claude` applies `/rename` at
   once (`dashboard/tests/fixtures/fake-claude:132-139`), so no spec lets the
   wait expire. A mark with no answer (the `catch` in
   `dashboard/src/agentLaunchClient.ts:109`) is observed only through HTTP
   refusals.
2. `awaitMailboxWorkerExit` (`src/skills/dough-execute-plan/scripts/ci-mailbox-worker-process.mjs:224-231`)
   now waits on "unknown" liveness because an exiting worker can show `[node]`,
   but `shutdownConfirmed` (`ci-mailbox-complete.mjs:95-114`) still reports
   `confirmed` for any liveness except "alive". A transient longer than the
   one-second wait reproduces the original false confirmation.
3. `agent-terminal-done.spec.ts:81-163` is one journey (mark from the panel,
   reload, reopen, reload, re-mark from the card) at 246 lines; its first half
   repeats `agent-launch-card-done.spec.ts:100-120`. Plan 160 appended the
   Recent sessions region fallback to `agent-terminal-lifetime.spec.ts:181-196`,
   a lifetime journey. `dashboard/tests/README.md:60-63` describes lifetime and
   done specs without those additions.
4. `agent-launch-card-session-states.spec.ts:222-229` rechecks that a stopped
   session's card Open terminal attaches, which `agent-terminal-boundary.spec.ts:116`
   (attaching a stopped session) and `agent-terminal.spec.ts:104` (a card entry
   opens the panel) own.
5. `MarkSessionDone`'s comment (`dashboard/src/pageSessions.ts:26-29`)
   promises the asking control gets the keyboard back, which the panel's
   `onMarkDone` (`TerminalSplit.tsx:138-140`) deliberately does not do.
6. `expectPinnedGhCalls` (`dashboard/tests/catalogProjectRecords.ts:106-113`)
   tolerates a repeated ref resolution in preview mode too, although only dev
   mode's StrictMode causes it.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| No spec lets the rename wait expire. | `grep -rn doneRenameWaitMs dashboard/tests`; `grep -n rename dashboard/tests/fixtures/fake-claude`. | Only the wait setting (`agent-launch-done.spec.ts:54`, `support/fakeClaude.ts:83,164`); the fake renames on the typed line. |
| `shutdownConfirmed` confirms unknown liveness. | Read `ci-mailbox-complete.mjs:95-114`. | Only "alive" is unconfirmed. |
| The done journey spec is near the ceiling. | `wc -l` on the done, lifetime, and card-session-states specs. | 234, 246, 201, 238. |
| The card attach step duplicates owned proof. | Read `agent-launch-card-session-states.spec.ts:222-229`. | It opens a stopped card session and expects `attached`. |

## Slices

### 1. A busy session's expired rename wait is proven at the boundary
Type: Behavior
Status: done
Proof: the fake `claude` gains a control that leaves a session's typed
`/rename` unapplied; a boundary case marks such a session done with a short
`doneRenameWaitMs` and observes that the POST answers the marked record (which keeps the launch
name; the `done-` name is display-only), the listing keeps the old name, and `calls.jsonl`
holds `["stop", shortId]`. Accepted: `agent-launch-done-stop.spec.ts`
(busy-rename case); full dashboard suite 300 passed. Split `agent-launch-done.spec.ts` along a cohesive
seam first (for example, listing-dependent stops into
`agent-launch-done-stop.spec.ts`) so each file stays within 250 lines.

### 2. A completion receipt confirms shutdown only for a known-gone observer
Type: Behavior
Status: done
Proof: a completion case whose stub worker shows `[node]` for longer than the
exit wait yields `shutdown.status: "unconfirmed"` with a named limitation,
which `references/ci-completion-wait.md` already handles; the existing
transient case still confirms. `node --test src/skills/dough-execute-plan/scripts/ci-mailbox*.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook*.test.mjs`
from the checkout root. Accepted: 106 pass; the new test fails under the old
condition and passes with `liveness !== "dead"`.

### 3. Mark as done's page journeys each own one concern
Type: Structure
Status: planned
Proof: the dashboard suite passes; each removed or moved assertion names its
surviving owner; every changed spec is at most 250 lines.

Split the page reopening out of `agent-terminal-done.spec.ts` as its own test
that starts from a session already marked done; drop the panel-mark steps it
repeats from `agent-launch-card-done.spec.ts`; move the region fallback step
from the lifetime spec into the done spec as its own test; drop the card
attach step in `agent-launch-card-session-states.spec.ts`; update
`dashboard/tests/README.md`. Reword `SessionRequest.control` and
`MarkSessionDone` as where the keyboard may return, and scope the repeated ref
resolution in `expectPinnedGhCalls` to dev mode.

## Proof ownership

| Promise | Owner |
| --- | --- |
| Expired rename wait keeps the local `done-` name and still stops | 1: the done boundary spec |
| Unknown observer identity is not a confirmed shutdown | 2: `ci-mailbox-complete-exit-cases.mjs` |
| Every existing Mark as done, reopen, and card observation | 3: named surviving owners |

## Delivery checks

Run the whole dashboard Playwright suite before each dashboard delivery
(DD-177), `npm run typecheck:dashboard`, and gate commit on `npm run format`.
Run the `dough-post-change-refactor` pass before each commit.

## Concern review

Three slices, each one concern: missing boundary proof, a false shutdown
claim in the CI observer, and page-journey ownership. They touch separate
files except the tests README; any order works. No concern remains.
