# Source review: SEED-192#align-intent-story-lens

**Launch:** a fresh general-purpose reviewer with no conversation inheritance,
started by the execution coordinator on 2026-11-03 at the first acceptance
boundary. It read no project files and changed nothing.

**Input:** the verbatim Goal and Scope of
[story 5a](../../seeds/SEED-192-review-product-intent.md#align-intent-story-lens),
with the instruction to return numbered commitments, qualifications, examples
and exclusions, and to give each listed compound item its own id. It received
no plan, return, product or proof.

**Returned notes:** "such as Terry", "even for a story with a review mark" and
"including uncommitted ones" are illustrative or named included cases, not
rejection rules. Commitment 2 is the only exclusion.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story's test changes in Intent gets the selection and comparison story 5 promised | slice 2 | |
| 1.1 | Clicks inside a card's opened disclosure leave the selection alone | slice 1 | observed: dashboard/tests/story-card-dependency-selection.spec.ts steps 1–2 (explanation click leaves unselected card unselected, selected card selected with detail) |
| 1.2 | Intent's link to Review changes shows the same comparison Intent shows, even for a story with a review mark | slice 2 | |
| 2 | This bounded retrospective correction of story 5 adds no new product promise | slice 3 | |
| 3.1 | Exclude opened disclosure content from card selection | slice 1 | observed: dashboard/tests/story-card-dependency-selection.spec.ts steps 1–2 (explanation click leaves unselected card unselected, selected card selected with detail) |
| 3.2 | Open Review changes from Intent on all changes, including uncommitted ones | slice 2 | |
| 3.3 | Describe board selection in the dashboard docs | slice 3 | |
| 3.4 | Describe Intent's folder default in the dashboard docs | slice 3 | |
| 3.5 | Remove the residue the retrospective found in the story's code and tests | slice 3 | |
