---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

<a id="one-shot-work"></a>

### 2. Complete trivial work with --one-shot and track it if it grows

**Identity:** SEED-028#one-shot-work
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Eligibility, escalation signals, applicable entry workflows and existing-claim interactions need refinement; admission dependency is unfinished."],"basis":{"document":"abc16a97beeabbffc2ae8d04e311d8b0d3634671eadfd024ce3592235a572313"}}
```

**Goal:** Developers can explicitly request a genuinely trivial change without
publishing a Taken claim, while work that grows becomes visible through ordinary
story admission before further execution.

**Scope:** Provide `--one-shot` as an explicit option at the applicable work-entry
workflows, using one shared meaning. Attempt one coherent, verifiable result and
publish that result to remote main with ordinary reconciliation and verification.
Successful one-shot work leaves no Taken claim history, seed, temporary plan or
assignment created for that attempt. Its result commit and enduring product
changes remain. This is distinct from planless execution and is not another
branching mode.

When the attempt proves too large or uncertain to finish coherently in one go,
preserve attributable edits and proof, create or reuse its canonical story, and
publish ordinary Taken admission before continuing. Use the first story's
publication, refresh, ownership and closure behavior. Do not first publish an
incomplete result merely to maintain the one-shot label. No forced reset or
reversion of unrelated work is allowed.

Delivering to main does not require modifying the shared default checkout.
Use the ordinary safe workspace and remote-publication contract; attempt safe
local refresh after successful publication. The option does not bypass tests,
required review, publication authority or unresolved architectural decisions.

**Evaluation / key examples:**

- An explicit `--one-shot` request yields one complete, verified small change:
  remote main contains the result and no Taken announcement or spent planning
  artifact was published for the attempt.
- Investigation reveals a larger change or additional coordinated steps:
  publish the ordinary story and Taken claim before continuing, keeping valid
  work and evidence rather than restarting or creating duplicate identities.
- An ordinary Taken story is planless: it stays tracked. `--one-shot` does not
  erase existing claims or their history, and completing quickly alone does not
  silently select the option.

**Depends on:** delivered [shared admission](../../src/skills/dough-execute-plan/references/admit-accepted-work.md)
for safe escalation into ordinary admission. Existing workspace/publication
contracts apply; exclusive access to the default checkout is not required when
an owned workspace can publish safely.

**Safe stopping point:** Trivial requests can finish without tracking ceremony,
and every oversized attempt has an honest tracked continuation. No further
story or completed-work archive is needed.

**Effort hypothesis:** Smaller than shared admission, but with meaningful recovery
and escalation risk; low confidence until eligibility and applicable entry
workflows are refined. S/M/L remains unset because project bands are undefined.

**Open decisions:** Concrete eligibility and escalation signals, applicable entry
workflows, and interaction with pre-existing queued or Taken work. Refine these
before executable planning; do not invent a universal time or file-count limit.

<a id="admission-coherence"></a>

### Correction: Keep admitted work coherent after its first delivery

**Identity:** SEED-028#admission-coherence
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/113-admission-coherence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1ab3a2e250f55a6b3cd5e89ad6d1cbfcbd669a1e1d32fa518f47ee4acb0ccc2b","plan":"7823f948190b98520894a5a24fa21fa2129fe677e7f51ac9a5a89bb4e5907780"}}
```

**Goal:** Developers coordinating admitted work see a Taken entry that links
the plan later attached to it, and maintainers can rely on admission's proof,
tests, and guidance to say what the delivered admission actually does.

**Scope:** A bounded retrospective correction of the delivered
[shared admission](../../src/skills/dough-execute-plan/references/admit-accepted-work.md): link a later-attached plan to its Taken
entry without a second claim or forged readiness; prove admission's untested
reconciliation and refusal paths; scope closure and correction-story tests to
what they prove, add closure evidence for an admitted no-change investigation,
and repair a dashboard fixture shape the backlog now refuses; align admission
guidance and naming; and resolve published and admitted preparation once.
Excluded: whole-seed readiness basis, continuation ownership across sessions,
section-aware seed reconciliation, and plan-directory renames.

**Plan:** [Keep admission coherent](../slice-plans/113-admission-coherence/PLAN.md).

## Ordering and Scope Reduction

Queue these two stories in this order at the original story's current position:
shared admission first, then one-shot execution with escalation. Preserve unrelated
queue order and existing Taken assignments. Admission directly advances the
backlog's shared-progress visibility direction and supplies the second story's
fallback. Drop or defer one-shot first if scope must shrink; admission remains a
complete useful outcome on its own.

The original story keeps its identity and its ordinary-lifecycle outcome. Only
one new story is introduced. Completed-story retention, historical dashboards,
new lifecycle categories and separate per-process tracking implementations remain
outside both stories. Research into qualifying processes is part of refining
the first story, not an additional queued research deliverable.

The agreed name is `--one-shot` (2026-09-26). Architecture direction is recorded
in [Proposed ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md).
Decomposition and backlog placement authorize neither executable planning nor
implementation. Surface the first story when accepted work would bypass shared
tracking; surface the second when tracking overhead overwhelms a trivial request.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
