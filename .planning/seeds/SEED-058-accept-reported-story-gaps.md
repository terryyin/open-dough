---
id: SEED-058
status: active
planted: 2026-09-30
planted_during: Authorized three-project retrospective-findings runbook
trigger_when: A slice reports a story contradiction or changes its fixture to avoid the real example
scope: unknown
---

# SEED-058: Accept slices without losing the story promise

## Why This Matters

Developers can receive a completed story whose own hand-back reports that it loses something the story promised to preserve. Four distinct executions support this problem: a reproduced stash-loss path, a published newline loss, a dropped searched parameter, and a fixture changed to avoid the real EPUB shape. The fixture case was caught before acceptance; no actual stash data loss was reported. The response should prevent the contradiction from becoming accepted delivery or a filed learning.

## Story Decomposition

<a id="accept-reported-story-gaps"></a>

### Check reported gaps against the story before accepting a slice

**Identity:** SEED-058#accept-reported-story-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/175-accept-reported-story-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e4eb640bd0d49626361e70960cee1d05d7a59ff47a6199f21d7d627d3e6dbed4","plan":"49879d04324812d1721f987a1abe2fd8cb4a32ee26f21c334db38ee2a770bec9"}}
```

- **Goal:** A developer who receives a completed story, and the coordinating
  agent that decides slice by slice whether work can proceed or close, can rely
  on the story's goal and key examples being what acceptance was checked
  against. A gap the implementer reports, or a fixture change that turns the
  proof green, is tested against that goal before the slice is accepted, so a
  contradiction cannot ride into delivery under a Learnings note or an
  out-of-scope label.
- **Scope:**
  - **A reported gap is checked against the story.** When a return names a gap,
    loss or limitation (its "Gaps", "untested" or "not carried" entries), the
    coordinator reads it against the selected story's goal, key examples and
    stated exclusions at proof acceptance. Outcomes: the gap contradicts the
    goal or a key example, so the required behavior returns to implementation
    in the same slice; the story explicitly defers it, so the owner decides
    whether that deferral still stands, and only that path stops; or the gap is
    outside the goal, so acceptance proceeds and the observation is kept only
    when it changes remaining work.
  - **Story silence is not a deferral.** A loss that contradicts the goal or a
    key example returns for correction even when the story never lists it as a
    promise or exclusion (Terry's decision, 2026-09-30). Only an explicit
    deferral in the story can turn it into an owner scope decision. Writing the
    gap under Learnings or calling it out of scope does not accept it.
  - **A fixture change is checked against the real example.** When the return
    moves, reshapes or simplifies a fixture or setup so that a failing scenario
    passes, the coordinator checks the story's key example in its real shape
    (the real file or input the example names), not only the changed scenario.
    A green result on a fixture the example does not describe is not
    acceptance of the example.
  - **Accepted limitations cannot authorize loss of the only saved work.** A
    reported gap whose consequence is losing the user's only copy of paused or
    saved work is examined for that consequence before it is accepted as an
    untested limit. It is not accepted merely because the plan named guidance
    for a neighbouring case.
  - **Healthy acceptance is unchanged.** A harmless gap outside the goal still
    permits acceptance. Sufficient unchanged proof needs no new run, and the
    return's layout is not retried or resent.
  - **Not included:** a blanket full-suite run, an approval step, a
    report-resend or a per-slice accounting of every gap; changes to the return
    contract's layout; changes to how plans record learnings; the separately
    completed native assessor correction; judging host claims other than through
    the project's existing native-acceptance rules.
- **Key examples** (each from a retrospective in a project that used Open Dough;
  occurrence evidence stays in the finding catalog and its linked records):
  - **Searched parameter dropped** (ODF-185, pygardon, plan
    280-search-candidate-order-intent, slice 1): the story preserves the chosen
    search configuration. The hand-back says the `benchmark_weight` gene (0.3)
    "is not carried by `compose_tfdc_live_strategy`". Acceptance filed it under
    plan Learnings and finished the story; the connected proof passed without
    seeing the loss, and a correction story (plan 284) followed → the
    contradiction of the preservation goal returns for correction in the slice.
  - **Trailing newline lost** (ODF-139, doughnut, SEED-046#story-5, plan
    006-web-edit-changes-only-edit, slice 2): the story is a rich edit that
    changes only what was edited. The hand-back says "Example 1's trailing
    newline is lost"; the plan recorded it as "outside this story's promises"
    and the example test kept pinning `"My First\n\nLast"`. The defect reached
    the published story branch, and a correction story and plan were needed →
    it returns for correction, and a test that pins the defect is not proof of
    the example. The key example had hidden the effect because the edited line
    was also the last line.
  - **Fixture moved out of the failing shape** (ODF-196, doughnut,
    SEED-059#story-1, plan 049-epub-land-and-track-chosen-place, slice 4): the
    hand-back moved a cover into an already-supported shape, went green and said
    no product change was needed, but named the gap "a cover in a spine file
    that no entry targets gets no block". The coordinator checked the real Alice
    EPUB, whose `wrap0000.xhtml` is first in the spine and untargeted, and it
    still failed → the example is checked on the real book and returns for an
    extractor change. The implementer naming the gap is what made the check
    possible, so a named gap is the input, not the fault.
  - **Untested limit hid a data-loss path** (ODF-138, open-dough,
    SEED-008#truthful-repair-restore, plan 115): the slice 1 return said Step 5
    "gives no specific guidance for `none`" and the coordinator recorded it as an
    untested limit. A staged change conflicting in the index made `restore`
    report `applied: "none"` with `paths: []`, and the guided `drop --record`
    removed the only copy of the paused work. Slice 2 shipped guidance ending
    every conflict with a drop; follow-up SEED-008#unapplied-restore-kept
    repaired it. No actual stash data loss was reported; the retrospective
    reproduced the path → the limit is examined for its consequence before it
    is accepted.
  - **Harmless gap** (boundary): a return notes an observation the story neither
    promises nor excludes and that costs the user nothing (for example a cosmetic
    difference in an unrelated path) → accepted, with no extra run.
  - **Explicit deferral** (boundary): a gap falls within something the story
    lists as deferred → the owner is asked whether the deferral still stands;
    unrelated slices continue.
- **Evaluation:** Replay the retained Search parameter-drop and newline-loss
  hand-backs against their preservation goals, plus the EPUB fixture
  substitution against the real separate-spine-cover example. Each must return
  the required behavior or surface a human-owned scope conflict. A harmless gap
  outside the goal must still permit acceptance, and sufficient unchanged proof
  must need no new run. Include the reproduced restore-applied-none consequence
  when checking that accepted limitations cannot authorize loss of the only saved
  work. Judge any host claims with the project's existing native-acceptance
  rules.
- **Open questions:** None blocking. Proposed, not decided: the check applies at
  slice proof acceptance only; a gap first noticed after acceptance is a
  retrospective matter, as it is today. The caller that reads the goal is the
  coordinator, which already holds the story, so no new input is required.
- **Supporting findings:** [ODF-138](../../docs/maintainer/finding-names.md#odf-138), [ODF-139](../../docs/maintainer/finding-names.md#odf-139), [ODF-185](../../docs/maintainer/finding-names.md#odf-185), [ODF-196](../../docs/maintainer/finding-names.md#odf-196). Occurrence evidence stays in the catalog and its linked source records.
- **Completion criterion:** Record the actual response, implementation commit, first containing release (or release pending), and proof limits on every supporting finding in `docs/maintainer/finding-names.md`. Delivery and queueing alone do not mark the finding resolved; a watch starts only from verified relevant use.
- **Depends on:** None established; the two selected responses address separate acceptance and planning decisions and can deliver independently.
- **Safe stopping point:** This response preserves current authorization, story ownership and proof boundaries if other process work is cancelled.
- **Effort hypothesis:** Small: one acceptance rule at proof acceptance, exercised by the four retained cases. Planning confirms.

## When to Surface

Selected by the owner-authorized runbook on 2026-09-30; queued for later refinement.

## Breadcrumbs

- [Retrospective findings runbook](../../docs/maintainer/retrospective-findings-runbook.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
