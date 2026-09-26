---
id: SEED-044
status: active
planted: 2026-09-26
planted_during: Maintainer review of retrospective finding priorities
trigger_when: A plan's readiness depends on claims about existing code or executable proof
scope: unknown
---

# SEED-044: Start execution from verified planning premises

## Why This Matters

Developers and execution coordinators need a ready plan whose decisive claims
about existing code, fixtures, environment and proof paths hold in the target
project. Discovering an invalid premise during execution causes avoidable scope
changes, failed paid runs, replanning and missing CI evidence. This serves the
low coordination cost and empirical improvement goals of
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Stories

<a id="verify-planning-premises"></a>

### Verify planning premises and proof setup before declaring readiness

**Identity:** SEED-044#verify-planning-premises
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/115-verify-planning-premises/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ee7f9e962144718423468f07d834759eb981368bd52633c515b8fc76886d051b","plan":"44aff2b381110dd52e2d88fefe05c8e7452b5fd61c74ad50a3704e3e31edb9c5"}}
```

**Goal:** An execution coordinator can Take a plan recorded `ready` without
its decisive factual premises proving false during execution. Ready plans stop
causing avoidable owner stops, paid retries, red CI and mid-execution replans,
which unattended parallel execution cannot absorb. This serves low
coordination cost under ADR 0002.

**Scope:** A decisive premise is a factual claim about the target project's
current state that a slice's approach, sizing or proof depends on: existing
code and tests, host or environment state, fixture content, workload data, or
a named proof or measurement command. Premises inherited from the story, such
as "works as today", count the same as those the planner writes.

- Before recording `ready`, planning establishes each decisive premise with the
  smallest safe observation: reading, searching, listing, a read-only host
  query, or one unpaid, side-effect-free local run of the named command. The
  plan records the premise, the literal observation and its result. This
  generalizes slice planning's existing rule for uncertain infrastructure
  assumptions instead of adding a checklist.
- A decisive premise that is cheap to observe but was not observed is a
  `not-ready` reason. Reassessment re-observes the premise behind a blocking
  reason; citing earlier evidence again does not resolve it.
- When only a paid, credentialed, owner-held or state-changing observation can
  establish a premise, planning still observes its cheap parts. The remainder
  becomes an early probe slice whose failure stops dependent work and changes
  the plan. Such a plan may be `ready`. That observation keeps its existing
  authority requirements.
- A readiness replay or premise observation covers the slice's promised
  journey through the next operation that consumes its result, not only the
  seam a concern named.
- The change lives in the existing owners: slice planning and the shared
  readiness criteria, which plan refinement already uses.

Why current guidance missed these cases, observed while refining: `ready`
requires bounded slices, mapped proof and no remaining concern, so a confidently
wrong claim is never a concern. Slice planning limits inspection to what is
needed to find the proof entry point, behavior and dependencies; it verifies
stated assumptions only for infrastructure and storage. Plans that already
carried "planning evidence" sections still missed, and one plan was reassessed
`ready` with its blocking premise unchecked.

Excluded or deferred: measurement representativeness and re-baselining after a
change (ODF-115); inventory or sizing deliberately left for execution to
discover, unless the plan states it as fact; premise checks during story
refinement; planless and one-shot paths; any checklist, state registry,
script or semantic validator, routine full-suite run, or new approval for
ordinary inspection. Planning does not implement the proposed feature.

**Evaluation / key examples:**

- A plan names `strategy_verify.feature` as proof that moved seeding still
  works, but only `live_strategies.feature` runs the seeding script. A search
  for the script's callers finds this, and the plan names the covering proof
  before `ready`.
- A plan says "the hook has no test today" while
  `scripts/test/quality_changed.test` exists. A search finds it, and the plan
  extends that test instead.
- A live proof assumes "diarization works as today" with `sample.wav`. An
  unpaid local diarization run exposes a 44-byte fixture and a broken
  dependency, so the plan corrects both. Gated-model access, which needs the
  owner, becomes an early probe slice with a stop, and the paid transcription
  runs once.
- A non-regression measurement targets a profile without market data. One
  local run shows `Cannot load 'SPY'`, and the plan chooses a usable dataset
  before `ready`.
- A slice promises pull then publish. A replay proving only pull leaves the
  plan `not-ready` until the replay also exercises publish.
- A plan was `not-ready` because its premise needed rechecking. Reassessment
  records `ready` only after observing the premise again.
- A comparable plan with sound premises records its brief observations and
  becomes `ready` with no extra gate and no inspection of claims its approach
  does not depend on.

Assess agent behavior under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md): a native
Claude Code re-planning of two recorded cases from their pre-plan revisions
(Doughnut slice-plans/045 and Pygardon slice-plans/196) plus the sound-premise control.
Codex and Cursor stay pending in a linked native acceptance story, not
inferred from Claude Code.

**Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074),
[ODF-114](../../docs/maintainer/finding-names.md#odf-114), and
[ODF-110](../../docs/maintainer/finding-names.md#odf-110). They retain distinct
identities and mechanisms. Execution evidence stays in the catalog and source
logs. ODF-115's measurement becoming unrepresentative after implementation is
related but is not automatically addressed by a preparation change.

**Priority rationale:** Repeated failed planning premises and the observed scope
changes and proof gaps outrank the two reports of extra sibling-readiness
reassessment. Work-preservation remains first because recovery and cleanup have
already interfered with another execution's state. Delivered CI corrections
need release or relevant-use assessment rather than duplicate implementation.

**Completion:** Record the actual response, implementation commit, first
containing release and effectiveness limits on each addressed finding. Preserve
any cause or occurrence the response does not address. Queueing is not resolution.

**Depends on:** None; consume the existing planning and readiness contracts.
The structural-format validator and sibling-readiness story are separate.

**Safe stopping point:** Decisive, cheaply checkable contradictions are resolved
before execution while valid plans retain a proportionate path to readiness.
