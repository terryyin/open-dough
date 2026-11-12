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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md","assessment":"not-ready","reasons":["P1 partly unobserved: F25 failing the held-read case is observed (Intent Coverage at 7bd9f5ccf); F12 failing it is not","P2 unobserved: the proof collection keeps for the completion spec's facts equals keptScopeFileProof for the same facts","P3 unobserved since the SEED-330 merge: the whole Intent comparison passes the sideways-scroll check at 390 px","P4 unobserved: a queued repeat reads as progress on the phone card, and fault F27 fails it","P5 unobserved: a later start-origin revision naming the first as its parent throws Unknown parent on the current tree"],"basis":{"document":"007244e02020e570ef2c7014f0aba87410d36277bf3a47ad7f5fd691f751d4c0","plan":"4d14101eae7e973a67775e8486bc1dda3c3631a639e352f12e7b786a12f26b8c"}}
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
