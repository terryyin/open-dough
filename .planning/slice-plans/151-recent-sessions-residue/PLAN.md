# Keep every unreadable launch store and trim Recent sessions residue

## Source and authority

- **Identity:** SEED-052#recent-sessions-residue.
- **Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#recent-sessions-residue),
  from the execution retrospective of SEED-052#revisit-dashboard-sessions
  ([plan 150](../150-revisit-dashboard-sessions/PLAN.md)) on 2026-09-29.
- **Provenance:** reviewed commits `5933bb91`, `29174888`, `f332b5dd`,
  `ca2586f8`, `ea5aa42b` on `claude/revisit-dashboard-sessions`, after the
  Take `59fb10cd`.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A second unreadable launch store is moved aside without replacing the first
one's copy, so the promise that nothing is silently lost holds. Each launch
concern has one journey or document that owns it.

Preserved: every Recent sessions and Started behavior of story 2 and its
examples 1–8; the store's location, retention, and first
`agent-launches.json.unreadable` name; launch records never change story
facts. Excluded: a "records not yet read" page state (the real listing
answered in about 0.16 s with 469 sessions, so the window is negligible),
host-neutral state vocabulary (story 7), and new launch features.

## Current findings

1. `launchRecordStore.ts:95` renames an unreadable store onto
   `agent-launches.json.unreadable`, replacing an earlier copy, while
   `launchRecordStore.ts:13` and `AGENT-LAUNCH.md:90-92` say nothing is lost.
2. `agent-launch-settlement.spec.ts` (182 lines) and
   `agent-launch-recent-sessions.spec.ts` (206 lines) drive the same
   settlement journey: the same launches, Doughnut switch, reloads, Preparing,
   refinement on the Preparing card, Take, and completion. They differ only in
   asserting Started or entries.
3. `agent-launch-session-settlement.spec.ts:60-99` asserts each entry's state
   label again. `agent-launch-recent-session-states.spec.ts` already owns the
   labels.
4. `dashboard/tests/README.md:26-29` lists only the records spec among the
   specs story 2 added. It omits the session-listing, recent-sessions,
   recent-session-states, and session-settlement specs and the fake's end,
   forget, and failing-listing controls.
5. The North Star's launch row (`docs/dashboard-ux-ui-north-star.md:125`) is
   one 2,741-character cell. It restates settlement rules that
   `dashboard/AGENT-LAUNCH.md` owns, so each launch change edits both. The
   file is at the 250-line limit.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The move overwrites an earlier unreadable copy. | Read `launchRecordStore.ts:94-96`. | Confirmed: an unconditional `rename` onto one name. |
| The two journeys overlap step for step. | Read both specs' `test(` bodies (settlement `:34`, recent sessions `:33`). | Confirmed by the retrospective review; each runs in about 3 s. |
| The labels are owned elsewhere. | `grep -n "Finished\|Session unavailable" agent-launch-session-settlement.spec.ts` | Lines 65 and 73 assert labels; the recent-session-states spec asserts all six. |
| The README omits the new specs. | `grep -n agent-launch dashboard/tests/README.md` | Only lines 26-29, naming the records spec and older specs. |

## Slices

### 1. A second unreadable launch store keeps the first one's copy
Type: Behavior
Status: planned
Proof: records spec seeds an unreadable store twice across two launches.

Behavior: an unreadable store was already moved aside once → the store becomes
unreadable again → the next launch keeps both unreadable copies and answers
its record. Keep the first move's name. Choose a later copy's name (for
example with the move time) and state it in `AGENT-LAUNCH.md` and the store
comment.

Proof: in `agent-launch-records.spec.ts`, after the existing unreadable case's
launch, write unreadable text again, launch, and expect both original texts
in files beside the store and the new record answered. Run
`npm run test:dashboard -- dashboard/tests/agent-launch-records.spec.ts` and
`npm run typecheck:dashboard`.

### 2. One journey per launch concern, and one documented home for launch rules
Type: Structure
Status: planned
Proof: the launch specs pass with no promise losing its observation.

Make the settlement journey the one that walks Preparing, the Take, and
completion. Assert there, at the Take and after completion, that Recent
sessions keeps every entry (story 2 example 3). Reduce the recent-sessions
spec to what only it observes: entry content, copy, newest-first order, two
launches of one story, another project's isolation, and a refinement on a
Preparing card listed without Started. In the session-settlement spec, assert
card actions and the entry count, leaving labels to the recent-session-states
spec. List every launch spec and the fake's controls in
`dashboard/tests/README.md`. Trim the North Star launch row to its wording and
link `AGENT-LAUNCH.md` for the settlement rules.

Proof: before editing, list each promise the three specs observe; after, name
the surviving assertion for each. Run
`npm run test:dashboard -- dashboard/tests/agent-launch-settlement.spec.ts dashboard/tests/agent-launch-recent-sessions.spec.ts dashboard/tests/agent-launch-session-settlement.spec.ts dashboard/tests/agent-launch-recent-session-states.spec.ts`.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Nothing unreadable is silently lost | 1: two unreadable copies kept |
| Story 2 examples keep their observations | 2: promise-to-assertion list before and after |
| Launch rules have one documented home | 2: North Star row links `AGENT-LAUNCH.md` |

## Delivery checks

Focused Playwright specs per slice and `npm run typecheck:dashboard`; the fake
`claude` only. Independent post-change refactoring and ordinary managed
delivery. Keep dashboard wording consistent with the UX North Star.

## Concern review

Slice 1 is one observable outcome with its own proof. Slice 2 moves
assertions and documentation without changing behavior, and its
promise-to-assertion list guards against lost coverage. No blocking concern
was identified.
