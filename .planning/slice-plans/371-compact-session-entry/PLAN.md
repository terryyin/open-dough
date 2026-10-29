# Compact session entry

**Story:** [SEED-169#compact-session-entry](../../seeds/SEED-169-compact-session-entry.md#compact-session-entry)
**Status:** ready
**Source:** The developer accepted the Compact proposal in this chat and requested implementation.

## Goal and scope

Implement the accepted compact information hierarchy on existing session entries.
Keep existing host behavior, state uncertainty, warnings, recovery, unread reports,
published slice facts and branch qualification. No native host or persistence changes.

## Existing solution and constraints

`SessionEntry`, `LaunchSession`, `sessionRecordActions` and `shownSession` already
own the representation, host capabilities, confirmations and attention state.
Change/modularize these in place; reuse frame controls, Icon/IconButton and theme
tokens. The Sessions sidebar already has a disclosure pattern; reuse its meaning
without replacing that separate compact navigation representation.

Follow ADR 0008 (`docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md`):
session observations and controls do not establish published story state. The
North Star's Meaning and terminology, Evidence/freshness and accessibility topics
retain qualified slice counts, requested-vs-observed model, meaningful uncertainty,
focus and touch access. The approved design changes scan hierarchy, not those facts.

## Slice 1 — Scan and operate a compact session

Type: Behavior
Status: pending

Precondition: A story or local session entry has a retained session record.
Trigger: Read the entry, disclose details or session actions, then use a control.
Postconditions:

- Status, host/requested model, supported main action and attention stay visible.
- Routine technical details start closed, open and close accessibly, with one
  workspace representation and accessible continuation command/copy affordance.
- More session actions holds existing secondary lifecycle controls. Confirmations,
  failures, busy states, keyboard focus and disabled story frames still work.
- Positive execution-readiness scan text yields to an open execution session;
  preparation evidence remains in story inspection and warnings remain visible.
- Shared card/local/Recently done entries remain coherent and responsive, using
  the existing design foundation rather than the proposal's standalone CSS.

Implementation, focused proof, documentation and slice-local cleanup are one loop.
No supplied time budget; this is one cohesive presentation/interaction outcome.

Proof: extend the session browser journey with collapsed-default, keyboard
disclosure/menu, unchanged terminal and done/stop behavior, visible attention and
narrow-width checks; adapt shared journey helpers at the changed disclosure
boundary. Run focused session/recovery/mark-done journeys affected by those
helpers, dashboard typecheck and changed-file lint. Use synthetic hosts only.
Observe the new collapsed-default assertion fail before the implementation and
pass afterward. An initial fixture/command failure stops dependent edits until
its cause is resolved. No paid, private or live host operation is needed.

Consumer trace: `LaunchSession` has `SessionEntry` as its presentation consumer;
SessionEntry is used by StorySessions and the local/Recently done lists. Existing
journeys read launch/session text and click lifecycle controls directly, so those
helpers/assertions must use the new details/actions disclosure while retaining
their original behavioral promises. Search consumers of the moved labels and
controls and run the affected journey family before acceptance.

Setup: locked `npm ci`, then `npm run typecheck:dashboard` in the execution
checkout. The check-only pre-commit hook runs staged lint and typecheck for scripts.

## Preparation review

Refinement not needed: one accepted layout, one cohesive slice and one outside-in
proof loop. No remaining slice-specific design concern. The proof-route premise
is bounded by the initial discriminating fixture observation in Slice 1; no live
host behavior is inferred from the mockup.
