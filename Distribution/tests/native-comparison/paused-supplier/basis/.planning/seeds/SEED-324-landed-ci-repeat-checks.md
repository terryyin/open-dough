---
id: SEED-324
status: active
---

# SEED-324 — Landed CI repeat checks pass under moderately high load

<a id="close-landed-ci-repeat-check-gaps"></a>

### Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-324#close-landed-ci-repeat-check-gaps","dependencies":[{"supplier":{"identity":"SEED-332#answer-fake-gh-reads-in-process","href":"seeds/SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process"},"implementation":"SEED-332 owns the shared fake-GitHub read transport and fixture/staging efficiency work. SEED-324 consumes its published interfaces and retains its own coverage/refactoring implementation and acceptance.","rationale":"Slice 3 repeatedly exhausted default budgets in shared fixture/history work. SEED-332 already owns that receiving repair. Parallel edits would duplicate an active repair; common design and reconciliation alone cannot establish the stable published supplier outcome and its proof.","condition":"SEED-332 completes and publishes its reusable fake-GitHub/fixture efficiency outcome with its required stability evidence and real native CLI controls intact. Integrating that outcome and proving this correction's own stage, race, kept-proof, ancestry and load observations remain SEED-324 work.","state":"waiting"}]}
```

**Goal.** A maintainer who changes automatic CI follow-up, or the support the
landed CI repeat checks share, gets a failing check for each regression those
checks caught before, and finds one owner for each support responsibility.

**Scope.** Bounded correction of the landed CI repeat checks. A failed run
requests one rerun; a queued repeat reads as progress; the checks are filed by
the stage they start from; a landing another dashboard spent sends no rerun.
No new product promise beyond those checks.

Plan: [607-close-landed-ci-repeat-check-gaps](../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md).
