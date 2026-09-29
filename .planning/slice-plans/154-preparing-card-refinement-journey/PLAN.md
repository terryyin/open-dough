# Observe a Preparing-card refinement in one journey

## Source and authority

- **Identity:** SEED-052#preparing-card-refinement-journey.
- **Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#preparing-card-refinement-journey),
  from the execution retrospective of SEED-052#recent-sessions-residue (plan
  151 at
  `1abb3497:.planning/slice-plans/151-recent-sessions-residue/PLAN.md`) on
  2026-09-29.
- **Provenance:** reviewed commits `1de2187a` and `6fa51cb6`, merged to
  `main` in `5bc35521`, after the Take `34ad359b`.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A refinement launched on a Preparing card is observed in one journey: the
settlement journey, which already owns Preparing, the Take, and completion.
The recent-sessions spec keeps what only it observes: entry content, copy,
newest-first order, two launches of one story, and another project's
isolation.

Preserved: story 2's example 5 (a refinement launched on a Preparing card
settles at once and is listed without a Started) and every other launch
observation. Excluded: product code, new launch behavior, and story 3's
removal of the copyable attach command.

## Current findings

1. `agent-launch-settlement.spec.ts`, step "a refinement launched on a story
   already Preparing settles at once", launches that refinement and observes
   the action enabled with "Being prepared", no Refinement Started, one more
   entry, and, through `expectEveryEntry()`, that entry's name and session.
2. `agent-launch-recent-sessions.spec.ts`, step "Preparing keeps every entry,
   and a refinement launched on the Preparing card is listed without a
   Started", publishes the Preparing revision and makes the same launch and
   observations. It is the spec's only use of `settlement.preparing` and of
   `launchListed`'s `settlesAtOnce` argument.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The settlement step observes everything the recent-sessions step does. | Read both steps at `6fa51cb6`. | Confirmed: enabled action, no Started, entry listed with its name and session; only the generic entry content, which other entries already show, is extra in recent-sessions. |
| Nothing else in the recent-sessions spec needs the Preparing revision. | `grep -n "settlesAtOnce\|settlement\." agent-launch-recent-sessions.spec.ts` | Only lines 60, 70, and 163, all serving that step. |

## Slices

### 1. One journey observes a Preparing-card refinement
Type: Structure
Status: done
Proof: the launch specs pass, and example 5 keeps its settlement-journey observation.

Remove the recent-sessions spec's Preparing step, the `settlesAtOnce`
argument it alone uses, and any setup only it needed. If the spec then needs
no settlement revision, open it on the plain launch journey. Update the spec's
header comment, its test name, its launch count, and the
`dashboard/tests/README.md` sentence about which journeys reach Preparing.

Proof: name the surviving assertion for example 5 in the settlement spec. Run
`npm run test:dashboard -- dashboard/tests/agent-launch-settlement.spec.ts dashboard/tests/agent-launch-recent-sessions.spec.ts`
and `npm run typecheck:dashboard`.

Accepted proof: the settlement step "a refinement launched on a story
already Preparing settles at once" (`agent-launch-settlement.spec.ts`)
observes example 5: the action enabled with "Being prepared", no Refinement
Started, one more entry, and `expectEveryEntry()`. `settlement.preparing` is
now shown only at `agent-launch-settlement.spec.ts:140`. Both focused specs
and `npm run typecheck:dashboard` pass.

Learning: the recent-sessions spec still opens on the settlement journey's
queued revision, because only `openSettlementJourney` supplies the Doughnut
project its isolation step needs.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 5 stays observed | 1: settlement step "a refinement launched on a story already Preparing settles at once" |
| One journey per launch concern | 1: no other spec publishes the Preparing revision for this launch |

## Delivery checks

Focused Playwright specs and `npm run typecheck:dashboard`; the fake
`claude` only. Independent post-change refactoring and ordinary managed
delivery.

## Concern review

One Structure slice with a named surviving assertion. No blocking concern was
identified.

## Execution complete

Product advice: no backlog change. The correction adds no feature promise and
leaves the queue's SEED-052 order intact; SEED-052#keep-story-session-links
stays next. The recurring readiness refusal (ODF-116), this time caused by the
parent story's wrap-up rewriting this correction's provenance, is a candidate
for finding triage.
