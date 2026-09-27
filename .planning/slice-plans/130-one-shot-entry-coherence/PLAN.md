# Make one-shot read the same from every entry workflow

## Source

**Identity:** SEED-028#one-shot-entry-coherence

[Correction story](../../seeds/SEED-028-track-ad-hoc-work.md#one-shot-entry-coherence),
from the execution retrospective of
one-shot work (story recoverable at `89836961:.planning/seeds/SEED-028-track-ad-hoc-work.md`)
(plan 112; commits `d0101737`, `6f350f28`, `70f6cde1`, reviewed at `70f6cde1`).

## Findings (current at `70f6cde1`)

1. Entry workflows contradict one-shot. `dough-bug-fixing/SKILL.md:98`
   always passes `--no-replan`, and its Repaired and Explained no-change
   steps (around `:222-233`) close through story wrap-up;
   `dough-test-optimization/SKILL.md:34-37` routes no-change to admission's
   "finish the mission". `references/one-shot.md` says one-shot delivers to
   trunk and nothing remains to wrap up, and it routes `--no-replan` growth to
   the oversized-slice no-replan stop, which leaves evidence in an unclaimed
   workspace without a disposition.
2. Stale no-claim rules. `references/execution-location.md:16-19`, `:34-36`
   and `:61`, `dough-product-backlog/references/record-preparation.md:196`, and
   `references/agent-commits.md:10` still describe unclaimed contextual work on
   "verified current HEAD"; in Story Branch and Trunk Mode the only unclaimed
   start is now one-shot, based on fetched trunk by the start command.
3. Carry race. `execution-start-operation.mjs:56` fetches trunk; the park
   (`:77`, `execution-start-carry.mjs`) resets to that tip; then
   `selectOwnedWorkspace` fetches again and refuses when trunk moved
   (`workspace-publication-select.mjs:69-91`), stopping escalation with
   `setup-failed` and the edits parked.

## Goal and preserved behavior

One outcome: one-shot is coherent from every entry workflow and escalation is
race-safe. Preserve every plan 112 promise and its tests: unlisted and queued
success, the ownership guard, carry recovery and conflict, queued admission
only with `--carry`, and ordinary admission and Take unchanged. Keep files at
or under 250 lines; `dough-bug-fixing/SKILL.md`,
`dough-execute-plan/SKILL.md` and `execution-increment-publication.mjs` are at
the limit, so additions need matching cuts. Excluded: native acceptance
evidence (tracked separately at wrap-up) and consolidating holder readers
across dough-execute-plan and dough-story-refinement.

## Decisive premises

| Premise | Observation (2026-09-27, `70f6cde1`) | Result |
| --- | --- | --- |
| Bug fixing forces `--no-replan` | `dough-bug-fixing/SKILL.md:98` "Pass `--no-replan` and a ten-minute hard limit" | Holds |
| Carry resets to the first fetch, then selection refetches | `execution-start-operation.mjs:56,77-79`; `workspace-publication-select.mjs:69-91` | Holds |
| Admission with `--carry` stops before planning when continuation is not authorized | `admit-accepted-work.md` "Continue into implementation": admission grants no execution authority | Holds; a no-replan stop after admission needs no new mechanism |
| Focused proof runs locally | `node --test src/skills/dough-execute-plan/scripts/one-shot*.test.mjs`: 26 pass, 16.6 s | Holds |

## Ordered slices

### 1. Escalate race-safely and finish one-shot the same way from every entry
Type: Behavior
Status: planned

Behavior: a carried escalation whose trunk advances between the start's fetch
and workspace selection still publishes one claim and restores the edits; a
one-shot bug repair or no-change conclusion, or a one-shot optimization
no-change, follows `one-shot.md` delivery and retirement; a growing one-shot
attempt under `--no-replan` escalates through admission and stops before
planning with the edits restored in the claimed workspace.

Make park, reset and workspace selection use one fetched trunk revision (reset
to the base selection accepts, or let selection accept the parked workspace at
the tip it fetched). In `one-shot.md`, route `--no-replan` growth to escalation
followed by the ordinary admitted stop; in `oversized-slice.md`, keep the one
sentence routing one-shot to it. In bug fixing, keep `--no-replan` and point
repair and no-change closure at one-shot when selected; in test optimization,
point no-change at one-shot's no-change. Replace the stale no-claim rules in
`execution-location.md`, `record-preparation.md` and `agent-commits.md` with the
one-shot start's fetched-trunk base, without restating one-shot rules.

Proof: new case in `one-shot-escalation-recovery.test.mjs` (or a sibling file
by size): a git wrapper or hook pushes an unrelated trunk commit between the
start's fetch and selection; escalation returns accepted, one claim on the new
trunk, restored bytes equal the attempt, ref gone. Run
`node --test src/skills/dough-execute-plan/scripts/one-shot*.test.mjs` and the
admission and startup suites. AGENTS.md behavior walk of bug fixing (repair,
no-change, growth under `--no-replan`) and test optimization (no-change) with
one-shot selected, reporting each step's resulting action; guidance tests that
read the edited Markdown.

Safe stop: the correction is complete.

## Proof coverage

| Finding | Observation |
| --- | --- |
| 1 | Behavior walk of both entry skills with one-shot; `--no-replan` growth reads as escalate-then-stop |
| 2 | Edited sentences name the fetched-trunk one-shot base; guidance tests pass |
| 3 | Trunk-advance race case |
