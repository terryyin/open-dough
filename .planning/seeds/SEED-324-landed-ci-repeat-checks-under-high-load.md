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
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-324#close-landed-ci-repeat-check-gaps","dependencies":[{"supplier":{"identity":"SEED-332#answer-fake-gh-reads-in-process","href":"seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process"},"implementation":"SEED-332 owns the shared fake-GitHub read transport and fixture/staging efficiency work. SEED-324 consumes its published interfaces and retains its own coverage/refactoring implementation and acceptance.","rationale":"Slice 3 repeatedly exhausted default budgets in shared fixture/history work. SEED-332 already owns that receiving repair and has composed this correction's offered history and lifetime changes. Parallel edits would duplicate an active repair; common design and reconciliation alone cannot establish the stable published supplier outcome and its proof.","condition":"SEED-332 completes and publishes its reusable fake-GitHub/fixture efficiency outcome with its required stability evidence and real native CLI controls intact. Integrating that outcome and proving this correction's own stage, race, kept-proof, ancestry and load observations remain SEED-324 work.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md","assessment":"not-ready","reasons":["Establish a bounded way to obtain the required natural CPU-load 30–50 acceptance observation before another long execution; quiet diagnostics and passive monitoring left that host premise unverified."],"basis":{"document":"ad738449170f098cd650270870e8c2cdc3956c365a9fb8aceaf850509fdd56e5","plan":"d897e33f403d5fb4c7828d442d296e220fb5f7c52f86e50b18bdcdf4748ea75b"}}
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
**Approved scope extension (Terry, 2026-11-13).** The correction may also
optimize repeated immutable completion/claim-history reads in the existing
product history-read path. Functional behavior, mutable-ref observation,
error/abort handling and every existing test gate remain unchanged. This
permits the bounded product-code change needed by the retained load failure;
it does not authorize a transport redesign or a relaxed acceptance bound.

Plan:
[607-close-landed-ci-repeat-check-gaps](../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md).

**Early return (Terry, 2026-11-14).** Preserve and integrate the partial result,
release this execution's agent, and return this story to the top of the product
backlog for a future execution. This is not story completion. Slices 1–2 are
delivered; slice 3 has retained implementation and isolated proof; slices 4–8
and the final acceptance remain unfinished. The compact plan and its linked
handoff retain current decisions, proof limits and the next operation; the
complete earlier record remains recoverable in Git.

**Supplier boundary.** SEED-332#answer-fake-gh-reads-in-process (philip-chan)
owns the shared fake-GitHub/fixture efficiency and stability work needed before
this correction resumes. This correction consumes its published interfaces and
keeps ownership of its stage coverage, race, kept-proof, ancestry and lifetime
refactoring checks. Its own three-pass family and natural-load/25-second proof
remain required. Quiet supplier diagnostics do not satisfy those observations,
and no open-ended monitoring is part of the next execution.

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
