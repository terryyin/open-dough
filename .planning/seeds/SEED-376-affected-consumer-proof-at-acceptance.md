---
id: SEED-376
status: active
planted: 2026-11-15
planted_during: Shared retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-376 — See affected consumer proof before accepting a slice

## Why this matters

Developers need to tell whether a slice exercised the consumers affected by
its change before they rely on a passing proof result. The existing consumer
trace has found affected surfaces, yet some remained untested until CI.

## Stories

<a id="show-affected-consumer-proof-at-acceptance"></a>

### See affected consumer proof before accepting a slice

**Identity:** SEED-376#show-affected-consumer-proof-at-acceptance

Show the coordinator which affected consumer and proof type are still
unverified at acceptance. Carry the actual check or a supported disposition
through the existing trace and acceptance records. Keep the cost visible
and preserve proof that already applies.

[ODF-150](../../docs/maintainer/findings/ODF-150.md) records late failures
after an overload narrowed an untouched caller's lint condition, a new
output crossed re-exported CI history readers, and a new status card affected
whole-page layout. Evaluate against retained examples from SEED-331, SEED-364
and SEED-372, plus the SEED-358 control that ran its five traced consumer
families before acceptance. Compare missed checks and added review work.
Keep the response to those proof boundaries and the existing acceptance
workflow. Record the delivered response and its first containing release
at ODF-150 when each becomes known.
