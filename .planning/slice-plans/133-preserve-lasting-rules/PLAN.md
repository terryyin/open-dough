# Preserve lasting rules when retiring temporary records

## Source

**Identity:** SEED-004#proudly-found-elsewhere-design

[Story](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#proudly-found-elsewhere-design),
narrowed at the developer's direction on 2026-09-27. This is a planning draft;
implementation is not authorized by its preparation.

## Goal and scope

An agent completing ordinary wrap-up preserves still-needed rules before
deleting temporary direction or planning records. Product-wide architectural
decisions follow the project's ADR process; feature-local behavior and design
use maintained feature documentation. Already-preserved rules need no copy.

Replace ambiguous wording in existing guidance. Add no document format,
mandatory section, review stage, registry, or broad documentation audit. Leave
refinement, consumer proof, file-size policy, and refactoring authority unchanged.
The two internal ADR clarifications accompany this draft for developer review;
their edits are not a runtime dependency for projects using the skills.

## Existing solution and decisive premises

Inspected at `c50d467002f2db87c3b52684f07429322fa5df2a`:

- [Architectural thinking](../../../src/skills/dough-slice-planning/references/architectural-thinking.md)
  already owns North Star retirement, checks remaining stories, and preserves
  context before deletion, but describes its destination as a human-owned
  decision home. Clarify this existing rule rather than create a new reference.
- [Wrap-up](../../../src/skills/dough-story-wrap-up/SKILL.md#assimilate-lasting-knowledge)
  already preserves facts from spent records and links to that retirement rule.
  Keep one preservation/ownership rule and use links at its callers.
- The retained Donut migration example supplies the concrete failure to address;
  its original report is summarized in the story, not independently reverified.
  Do not restore a retired Donut rule or scan another project.
- Source/test searches for `architectural-thinking`, `North Star`, and lasting
  knowledge found these guidance homes, with no dedicated retirement behavior
  test. Existing installer byte-copy checks do not prove this judgment.
  [AGENTS.md](../../../AGENTS.md#behavior-review) supplies the proportionate
  evaluation for this conventional guidance change.

## Outside-in proof

Walk each case through ordinary wrap-up using the changed source and the
project context below. Inspect the resulting edits or stop against the expected
outcome; matching wording or a completion claim is insufficient. The one slice
owns all cases, including its cleanup.

| Project context and trigger | Expected outcome |
| --- | --- |
| A completed topic combines spent rollout order with a still-needed conversion-safety rule; an existing feature document is its appropriate home. Wrap up. | Preserve the rule there before removing the topic and repairing references. Do not create an ADR for a feature-local rule. |
| The only record of a product-wide choice is in a retiring plan; the project requires a human decision before an ADR change. Wrap up. | Preserve the context, identify the required decision, and stop affected closure without accepting an ADR. |
| A rule is already documented, or a retiring record contains only spent order. Wrap up. | Remove eligible temporary material without duplicate documentation or extra approval. A topic needed by an active story stays. |

Also check that an unknown destination or conflicting Accepted decision names
the missing context/conflict and preserves the affected record. These are
boundary variations of the same preservation rule, not separate mechanisms.

Use the maintainer behavior review: confirm invocation, required context, and
the useful result. Record its observations in this plan during execution; do
not add a permanent fixture framework or wording tests. This review is not a
claim of native acceptance on every host. Installation, update, and discovery
mechanisms are unchanged and outside this story's scope.

## Ordered slices

### 1. Retire temporary records without losing lasting rules

Type: Behavior
Status: done

When ordinary closure selects temporary records for removal, keep still-needed
rules in their appropriate maintained home before deleting the last temporary
copy. Reuse an existing durable home; preserve context when a required decision
or destination is unresolved.

Edit the architectural-thinking reference and wrap-up's assimilation section
together. Keep preservation and document ownership in one existing home, link
from its caller, and align the earlier North Star wording with it. Preserve
the existing active-story check, reference repair, and human ADR authority.
Use direct instructions for the agent in its project, not Open Dough's internal
ADR numbers or documentation paths. Replace redundant prose; do not layer a
new checklist on top of the existing procedure.

Proof: the cases above, then `git diff --check` and inspection of changed
relative links. Run any affected maintained checks discovered during editing;
do not substitute installer checks for the behavioral review. Keep edits in
`src/skills/`; do not hand-update installed `.agents/` or `.claude/` copies.
Follow ordinary execution/refactor/delivery gates when execution is authorized.

Safe stopping point: the complete preservation rule works through ordinary
closure, without a later slice needed to make it usable. The change is bounded
to two existing prose homes and one review loop; no numeric slice limit was
found in the project's maintainer guidance.

Accepted proof (behavior review, walked against the changed source):

- One rule now lives in architectural-thinking's `Preserve lasting rules before
  deletion`; wrap-up's Assimilate section and the North Star paragraph link to it.
- Case 1: the feature-local bullet writes the rule into the existing feature
  documentation, no ADR; unchanged retirement text deletes the topic and repairs
  references.
- Case 2: the ADR bullet keeps the retiring record and references, names the
  decision, and withholds closure; humans own ADR acceptance.
- Case 3: an already-preserved rule or spent-only sequencing is deleted without
  a copy or approval; the unchanged active-story check keeps a needed topic.
- Unclear home or conflicting Accepted decision: the boundary paragraph keeps
  the record, names the gap or conflict, and withholds closure.
- Refactor removed wrap-up's "or current Accepted decisions" destination, which
  contradicted human ADR ownership, and moved the tests-do-not-replace-docs guard
  into the rule.
- `git diff --check` clean; changed relative links and anchors resolve;
  `tests/install-all-tools.sh` and `tests/install-repeat-force-public-payload.sh`
  pass (copy checks only). Native closure runners not run (paid, manual only).

## Current decisions

- ADR 0000 owns internal document classification; ADR 0002 references it.
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  owns concise runtime wording and one authoritative home per behavior.
- Keep one story and one slice. Refinement consolidated the proposed
  document-ownership and closure slices because neither supplies the selected
  outcome independently. Splitting by files or writing proof later would add
  handoffs without useful progress.
- No North Star topic is needed for this bounded clarification. No remaining
  slice-specific concern was identified in this planning review. This records
  preparation judgment, not completed behavioral proof or execution permission.
