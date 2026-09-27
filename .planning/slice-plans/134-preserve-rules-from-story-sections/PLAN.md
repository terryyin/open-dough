# Preserve lasting rules from every record wrap-up deletes

## Source

**Identity:** SEED-004#preserve-rules-from-story-sections

[Correction story](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#preserve-rules-from-story-sections)
from the execution retrospective of "Strengthen architectural review after
using the lightweight guidance" (SEED-004#proudly-found-elsewhere-design; story
and plan `.planning/slice-plans/133-preserve-lasting-rules/PLAN.md` at
`29d0c909`; implementation commit `29d0c909`, Take `848db9fd`).

## Goal and scope

Wrap-up applies the shared preservation rule before deleting any record it
deletes, including the completed story section and a spent seed. The rule keeps
the only list of temporary record kinds; wrap-up links to it without its own
partial list. Excluded: the rule's destinations and stops, deletion mechanics,
new record kinds, wording tests, native host runs.

## Decisive premises

| Premise | Observation (2026-09-27, `29d0c909`) | Result |
| --- | --- | --- |
| Wrap-up's trigger omits story sections and seeds | `src/skills/dough-story-wrap-up/SKILL.md`, Assimilate lasting knowledge: "Before deleting a spent plan, execution context, review, or North Star topic, [preserve its lasting rules]" | Holds |
| The same wrap-up deletes them | Same file, Delete spent history: "its canonical story section when one exists, and its seed only when every remaining section is spent" | Holds |
| The rule's own list differs | `src/skills/dough-slice-planning/references/architectural-thinking.md`, Preserve lasting rules before deletion: "a temporary record, including a North Star topic, spent plan, execution record, or review" | Holds; two divergent lists |
| No test covers this wording | Retrospective grep of `tests/` and `scripts/` for the edited files found only installer copy checks and paid native closure runners | Holds; use the maintainer behavior review |

## Ordered slices

### 1. Wrap-up preserves rules held only in the completed story

Type: Behavior
Status: done

Behavior: a product-wide decision or feature rule written only in the
completed story's section (for example its Architecture field) reaches the
shared rule's ADR or feature-documentation route before wrap-up deletes that
section; a rule already preserved elsewhere adds no copy.

In wrap-up's Assimilate step, trigger the rule for every spent record the
closure deletes, without listing kinds. In the rule's scope sentence, include
the completed story section and seed in its one list.

Proof: walk three cases through ordinary wrap-up using the changed source: a
product-wide decision only in the story's Architecture field (keep it, name the
decision, withhold closure); a feature rule only in the story's key examples
with a feature document (write it there, no ADR); a story whose rules are
already documented (delete without a copy). Record the observations here. Then
`git diff --check` and check changed relative links and anchors. Edit only
`src/skills/`.

Safe stopping point: the one slice leaves the rule complete.

Accepted proof (behavior review walk over the changed source):

- Trigger: wrap-up's Assimilate step now reads "Before this closure deletes
  any spent record, preserve its lasting rules"; Delete spent history deletes
  the canonical story section and a spent seed; the rule's scope sentence lists
  "North Star topic, spent plan, execution record, review, completed story
  section, or spent seed" as its only enumeration.
- Product-wide decision only in the story's Architecture field: the rule's ADR
  bullet keeps the record, names the decision needed, and withholds closure.
- Feature rule only in the story's key examples with a feature document: the
  feature-documentation bullet writes it there with no ADR.
- Rules already documented: "When the rule already has its maintained home"
  deletes the section without a copy.
- `git diff --check` clean; the `preserve-lasting-rules-before-deletion` anchor
  resolves from wrap-up and from architectural-thinking.md. Refactor search
  found no other partial record-kind list in `src/skills/`.

## Current decisions

- One slice; the change is two sentences in the two existing homes.

## Learnings

None beyond the plan; the two-sentence change held.
