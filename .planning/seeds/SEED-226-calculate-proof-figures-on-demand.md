---
id: SEED-226
status: active
planted: 2026-11-03
planted_during: Terry Yin's follow-up on deferring expensive proof calculations
trigger_when: A developer opens or drills into an Intent proof summary
scope: story
---

# SEED-226: Calculate expensive proof figures on demand

## Selected Stories

<a id="calculate-proof-figures-on-demand"></a>

### Calculate expensive proof figures on demand

**Identity:** SEED-226#calculate-proof-figures-on-demand
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can browse Intent and see the summary they opened
without waiting for proof rankings or child summaries they have yet to
request. When they open those details, the figures reflect the selected
scope and the last successful proof at the pinned published revision.

**Scope.** Keep the browser work for expensive proof proportional to what
the developer is viewing. Identify which figures are needed immediately
and which can wait for the corresponding detail to open, including the
slowest-scenarios ranking and child proof figures. Reuse the existing
single derivation and retain parsed scenario rows for unchanged file
contents while the selection is in use. Incorporate new file arrivals
without parsing earlier files again. Defer work for a closed detail or
abandoned selection. Preserve coverage, evidence identity, ranking order,
and drill-down to the scenario. Generation of new proof remains explicit.

**Examples.**

- Browse the Intent tree and open a location summary with the slowest
  scenarios and child details closed. The tree and basic summary respond
  without calculating those unopened figures.
- Open the slowest-scenarios detail as files arrive. A ranking can be
  shown as Partial with its actual coverage. A complete whole-folder
  ranking accounts for every scenario in that folder, including later
  arrivals that displace an earlier result. An unread file keeps the
  result Partial.
- Open a child detail, then return to the parent or reopen the same
  detail. Reuse unchanged parsed rows. A file that changes or evidence
  from a different revision must never supply figures for the wrong
  selection. Late work from a departed selection does not update the
  current one.

**Evaluation.** Compare browser interaction latency and long tasks on
Doughnut's 94-file Intent summary with staged and warm file arrivals.
Use an observable calculation or performance trace to verify that unopened
details cause no ranking or child-figure work and that an additional file
does not trigger re-parsing of unchanged contents. Verify accurate partial
and complete results and existing drill-down behavior. Carry the
[Failing and flaky tests policy](../../AGENTS.md#failing-and-flaky-tests)
into any plan or repair handoff.

**Related work.** [SEED-225](SEED-225-restore-dashboard-responsiveness.md#deferred-proposals)
owns dashboard-wide responsiveness, safe GitHub recovery, and deferring
published proof reads until a selection needs them. This story owns
deferral and reuse of the browser calculations after source data becomes
available. Coordinate the shared Intent performance measurements and
parsed-row reuse with SEED-225. The calculations can be evaluated with
staged inputs independently of the read-path changes, so there is no
blocking prerequisite.
