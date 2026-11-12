---
id: SEED-324
status: active
planted: 2026-11-12
planted_during: follow-up to SEED-314#speed-up-landed-ci-repeat-checks, whose remaining real journeys and two unowned checks of the same repeat scenario still reach the 30 s default above a load of about 33
trigger_when: Terry asked for this story at the top of the backlog on 2026-11-12
scope: story
---

# SEED-324 — Landed CI repeat checks pass under moderately high load

## Why this matters

The landed CI repeat and follow-up checks moved to kept state with one
receipt journey and pass under the natural load other work puts on the
machine. Their story closed; its record is recoverable as
`854a1ae30:.planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load`
with plan `854a1ae30:.planning/slice-plans/599-pass-landed-ci-repeat-checks-under-high-load/PLAN.md`.
This seed now holds its correction.

<a id="close-landed-ci-repeat-check-gaps"></a>

### Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"364c3d901a98166fcbea1edb5cd4a1012e9a545b4c345741f5fe5839defe2b35","plan":"31d0b555fd8cb1c41fade2ce0653e67c212974be31dd8c9becf5f0093faa020e"}}
```

**Goal.** A maintainer who changes automatic CI follow-up, or the support
the landed CI repeat checks share, gets a failing check for each regression
those checks caught before
the high-load story (`854a1ae30:.planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load`) moved
them to kept state, and finds one owner for each support responsibility.

**Scope.** Bounded retrospective correction of
Make landed CI repeat checks pass under moderately high load (`854a1ae30:.planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load`).
Its checks regain a dashboard check for a second dashboard's spend, a queued
repeat read as progress, and sideways scroll across the whole comparison on a
phone. A check ties the kept scope proof to what collection keeps. Rerun
answering, provider layering, the automatic-repeat spec and start-origin
preparation each get one owner. A later start-origin revision may name the
first revision as its parent. No product behavior changes, and no new product
promise. Every check still passes at load 30–50 within the default timeouts.
Plan:
[607-close-landed-ci-repeat-check-gaps](../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md).

**Key examples.**

- A collecting dashboard has passed its ledger pre-check and is preparing run
  71. Another dashboard's writer saves an accepted request for that landing
  before preparation finishes. Collection sends no rerun and retains that
  request; bypassing either the ledger guard or collection's answer check
  must fail the dashboard check.
- On a 390 px phone, a settled comparison includes both attempts and their
  reference. A published-landing line that scrolls inside itself must fail
  the comparison check even when the three existing part checks pass.
- An accepted request's repeat is queued. Its phone card reads "CI rerun in
  progress" before the same journey reads the finished repeat's warning.
- Collection keeps run 63's case and file evidence, including a zero-duration
  file. The support builder's proof for the same facts equals that kept proof.
- A repository description's later revision names its first revision as a
  parent. Starting its origin preserves that declared ancestry. Moving the
  support owners preserves the existing receipt journey and stage checks.
