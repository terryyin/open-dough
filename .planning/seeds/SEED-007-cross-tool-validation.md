---
id: SEED-007
status: active
planted: 2026-09-07
planted_during: Story 7 refinement follow-up on repeated native validation
trigger_when: Improve existing tests under ADR 0005; reconsider stories before revisiting old plans
scope: Representative integration checks, shared behavior checks, and minimal evidence retention
---

# SEED-007: Deliver trustworthy cross-tool acceptance with fewer native runs

## Outcome and boundaries

Follow [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Use representative skills to qualify shared integration mechanisms on Codex,
Cursor, and Claude Code. Reuse that per-tool evidence for similar skills; add
integration cases only for different mechanisms or invalidated evidence.
Keep skill behavior checks separate. Do not test general vendor skill behavior
or require every product scenario on every tool.

Extend existing tests and keep useful deterministic coverage. Test shared logic
once and adapter differences separately. Retain completed evidence with its
original scope; do not certify it by copying or relabeling it. Keep missing
native evidence pending per tool. Internal tooling is not installed in clients.

Do not build an offline reassessment interface, dependency graph, review workflow,
judge model, evidence database, or new test platform. Review saved artifacts and
record applicability manually. Preserve genuine client adoption/use outcomes.
The earlier [migration assessment](../research/adr-0005-migration-assessment.md)
and [research](../research/cross-tool-validation.md) are background, not additional
acceptance criteria.

## Stories

<a id="select-and-retain-native-checks"></a>

### 1. Run one needed native check without replaying or losing the others

**Status:** Complete for cheap checks. Spent plans 20 and 22 were dropped after
acceptance. Story 3 owns outstanding native evidence per tool.
**Type:** Test tooling.
Cheap checks live in `tests/` and `tests/README.md`.

**Scope:** Keep implemented context selection, retention, execution bounds,
launch-failure handling, and stream completeness. Add one combined native
update→fresh-use journey through each existing delivery wrapper. Use inspected
bootstrap and a real newer tagged fixture, then a fresh session on that updated
target. Keep both stages in one retained attempt. Use the existing
`delivery/updated-use` selector; do not implement separate update/refusal selectors.

**Acceptance:**

- Listing and selection launch only the requested implemented check. Unsupported
  selections fail before setup and remain clearly identified as unavailable.
- Retain candidate, runtime, relevant inputs, raw output/events, responses,
  execution status/reason, and decisive state observations after scratch cleanup.
  Keep failures and earlier attempts; report the result path.
- Keep completed timeout, launch-failure, and stream-completeness checks. Reuse
  shared supervision for delivery; do not repeat its failure matrix per stage.
- Run update then fresh use on the same verified installation, without native
  legacy refusal. Failed update starts no use. Retain each stage's evidence and
  preservation observations; a final payload alone does not prove the transition.
- Prove shared journey behavior once with real local installer fixtures and
  substitutes. Check routing, runtime identity, and stream differences per tool.

**Excluded:** Separate delivery-stage execution, dependency attempt IDs,
automated reassessment/reuse, prompt/assessment repair, native runs, skill or
installer changes, client adoption, and releases.

**Completion:** Spent plans 20 and 22 pass their cheap checks in `tests/`.
Story 3 owns outstanding native evidence per tool.

<a id="trust-native-verdicts"></a>

### 2. Detect native behavior failures instead of rewarding the expected words

**Status:** Complete for cheap checks. Spent plan 21 was dropped after
acceptance. Story 3 owns outstanding native evidence per tool.
**Type:** Test migration.
**Dependency:** Story 1's retained context and combined journey evidence.

**Scope:** Remove coaching and incidental wording assertions from existing ADR
context and delivery checks. Define shared expectations for clear ADR use,
unresolved authority, legacy refusal, and update followed by fresh use. Keep
small automated activation/state checks; document prose expectations for review
when reliable automation would require a semantic parser.

**Acceptance:**

- Clear/conflicting ADR fixtures receive the same ordinary task request. Update
  and fresh-use prompts do not reveal expected conclusions or facts to repeat.
- Require complete execution, supported activation of the installed copy,
  intended behavior, and observed state for a pass. Self-report, an attempted
  read/call, or a completion marker alone cannot establish activation.
- Preserve exact payload/version and protected-state checks. Keep legacy refusal
  as a shared product check, without a new refusal integration matrix.
- Test shared behavior and counterexamples once. Test only decoding differences
  per tool. Equivalent instruction/response phrasing must not fail incidental
  text assertions; quotations, negations, and contradictory advice cannot pass
  merely by containing expected words.
- Keep definite failures nonpassing and uncertain prose/events inconclusive.
  Record later review with reasons and evidence without overwriting the original
  result. A documented review is sufficient.

**Excluded:** General language grading, per-case/per-tool counterexample
matrices, offline assessment commands, reviewer workflow, runner redesign, new
native mechanisms/cases, skill/installer changes, native runs, and releases.

**Completion:** Shared checks and small adapter tests pass. Actual
native evidence remains with Story 3; coached historical results gain no new claim.

<a id="accept-standalone-client-workflow"></a>

### 3. Establish that the standalone client candidate works in all three tools

**Status:** Quick 023 executed 2026-09-08 against candidate
`6682816a2385d96066883b5e4dc073b28e4b3d4f`. Native acceptance **not accepted**:
Codex pending, Cursor pass, Claude Code fail. Public `v0.2.1` is not this
candidate.
**Plan:** [Quick 023 — accept one standalone client candidate](../quick/023-accept-standalone-client/PLAN.md).
**Type:** Native acceptance.
**Dependencies:** Stories 1–2's completed cheap checks and one named candidate
from the reconsidered [standalone updater story](SEED-001-install-and-update-open-dough.md#standalone-client-update).
Publication and old-plan reconciliation are not prerequisites.

**Goal:** The maintainer can decide whether that candidate's standalone client
workflow is ready for release on Codex, Cursor, and Claude Code, using the
smallest sufficient set of native observations and justified reused evidence.

**Scope:**

- Review saved evidence against the named candidate first. Record which
  requirements it still proves and why; run only the unresolved checks.
- Use `dough-adr-awareness` as the representative installed skill for the
  existing native skill destinations. Cover discovery, invocation/application,
  and useful ADR-guided behavior with the Open Dough source unavailable.
  Automatic application needs separate proof only where promised and not
  already covered. Reuse integration proof for the same mechanism on that tool;
  it does not prove another skill's behavior.
- Where update evidence is missing, use one combined update→fresh-use journey
  per affected tool: update from an identified older installation to the
  candidate, then use the resulting skill in a fresh session. Include observed
  installation integrity and preservation of unrelated guidance, project
  context, and other tool roots. Let this journey also satisfy installed-use
  requirements wherever it provides the necessary proof; do not add a duplicate
  installed-use run by default. Local tagged fixtures are sufficient.
- Check the candidate's skill behavior separately from integration coverage.
  Define shared expectations once. Add a native behavior case only for a named
  unresolved product risk; keep deterministic policy/error variants in CI.
- Use existing runners and a short evidence/reuse record. Retain candidate,
  tool/runtime, relevant inputs, loading evidence, decisive outcomes, and reasons
  for later judgments. Failures and inconclusive results remain visible.

**Key examples:**

- A tool's saved installed-use proof still applies after candidate review →
  record the unchanged mechanism and relevant inputs → reuse that proof without
  repeating the native run; updater changes still need their own evidence.
- A tool lacks applicable update proof → update an older fixture and start a
  fresh session on the same target → the candidate is installed, the installed
  ADR skill guides the task without the source checkout, and unrelated content
  remains intact. This one journey can close several requirements.
- An update fails, or the fresh session merely claims to have loaded the skill →
  review the retained observations → acceptance stays pending for the affected
  requirements; neither exit 0 nor expected words establish success.

**Completion:** Each affected requirement has native evidence or justified reuse
for Codex, Cursor, and Claude Code, covering discovery, invocation/application,
intended behavior, and affected installation/update/coexistence. Shared behavior
cases need not run on every tool. Before release, confirm the candidate still
matches the relevant tested inputs; revalidate only invalidated requirements.

**Evidence starting points — not candidate acceptance:**

[Quick 014](../quick/014-prove-codex-adr-use/EVIDENCE.md) retains native loading,
clear/conflicting ADR behavior, and preservation observations for all three
tools, with candidate hashes and runtime versions. Review applicability rather
than treating those historical results as fresh proof.

| Platform | Integration evidence | Skill behavior evidence |
| --- | --- | --- |
| Codex | Quick 023 `delivery/updated-use` incomplete (`20260908T030033-43e0`); ordinary no-URL update not credited. Quick 014 explicit/automatic use is historical for unchanged skill SHA only. | Use unrun on this journey. Quick 014 clear/conflict remains historical. |
| Cursor | Quick 023 `delivery/updated-use` pass (`20260908T030715-5dbe`): ordinary no-URL update, real transition, preservation. | Same journey: catalog vs ARC-12 conflict stop; installed skill loaded in a fresh session. |
| Claude Code | Quick 023 `delivery/updated-use` fail (`20260908T031111-5393`): payload compare failed; streams not retained. Quick 014 Skill calls are historical for unchanged skill SHA only. | Use unrun on this journey. |

**Boundary / open dependency:** Quick 023 executed against candidate
`6682816a2385d96066883b5e4dc073b28e4b3d4f` and did **not** accept it. Codex
pending, Cursor pass, Claude Code fail. This story does not claim overall
native acceptance or authorize publication.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps native
proof here. This story does not implement the updater, publish or self-adopt a
release, change Donut, reconcile old plans, or add test infrastructure. Force,
refusal, and other variants are not a default native matrix. Quick 019 and
historical research add no hidden criteria. [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md)
preserves human decision ownership; [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
forbids automatic version choice; [ADR 0004](../../docs/adrs/0004-client-installation-and-update.md)
remains Proposed. No ADR change or exception is needed.

<a id="separate-native-acceptance"></a>

### 4. Reconcile retained plans after reconsidering their stories

**Status:** Deferred until underlying stories are reconsidered.
**Type:** Planning migration.

**Scope:** Reconsider SEED-001 Story 7, SEED-004 Stories 5–8, and SEED-006
Stories 3–4. Retire obsolete plans; update only retained plans. Keep useful client
outcomes and completed evidence. Do not recreate a per-skill integration matrix.
This story does not block Stories 1–3. Spent plans 20, 22, and 21 were dropped
after their cheap checks landed in `tests/`.

**Acceptance:**

- Separate implementation completion from pending native acceptance. Link each
  retained requirement to an acceptance story or applicable reusable evidence.
- Reuse integration proof for the same mechanism and tool. Give different
  mechanisms and unresolved skill behavior their own bounded checks.
- Preserve actual Donut/client adoption and postpublication use. Candidate
  acceptance does not depend on a future released installation.
- Do not credit future extracted guidance with another skill's behavioral proof.
  Keep missing per-tool evidence visible without duplicating acceptance matrices
  in every plan.

**Completion:** Updated retained stories/plans and evidence links. No native run
is required for this planning work.

## Order and completion

Spent plans 20, 22, and 21 delivered Stories 1–2 cheap checks and were dropped.
Story 3 owns outstanding native evidence per tool.

Quick 023 executed against candidate `6682816a2385d96066883b5e4dc073b28e4b3d4f`
and did not accept it. Keep Story 3 until Codex and Claude Code have credited
native update→use or a later named candidate replaces it. Do Story 4 last after
reconsidering its underlying stories. Keep this seed until the scoped migration
and native acceptance work is complete. Research options and removed plan leaves
are not hidden completion requirements.
