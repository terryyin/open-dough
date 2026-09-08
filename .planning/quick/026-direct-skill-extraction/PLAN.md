# Extract a project skill directly into unreleased source

## Source

[SEED-004 Story 9](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-directly-with-guidelines)

## Goal and scope

One supplied on-demand skill becomes a reviewable shared skill directly under
`src/skills/`. Keep generalization and review manual. Publication, client delivery,
and particular Donut extractions remain separate tasks.

## Current decisions

Use [AGENTS.md](../../../AGENTS.md) for skill conventions and representative
behavior review, consistent with [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)'s
everyday authoring guidance. Write the skill and concise recognition together.
Source preservation is checked by comparing contents around the demonstration.
Incomplete context and unusual rules receive manual follow-up.

## Ordered slice

### 1. Receive a reusable source skill from one extraction request

Type: Behavior
Status: planned
Behavior: A maintainer supplies an ordinary project skill → invokes
`extract-guidance` → receives `src/skills/dough-<name>/SKILL.md` and a short
recognition record whose useful behavior can be reviewed immediately.

Rewrite `.agents/skills/extract-guidance/SKILL.md` around that direct workflow.
Delete the displaced candidate/assessment instructions and dedicated extraction
wrappers: `tests/extract-guidance-cursor-native.sh`,
`tests/extract-guidance-claude-native.sh`, `tests/support/extract-guidance-native.sh`,
and `tests/extract-guidance-unresolved-fixture.sh`. Delete the dedicated
unresolved-rule fixture. Keep the small Acme source fixture and make its README
explain the manual example. These changes form one working extraction path.

Proof: In a disposable checkout containing the revised extractor and authoring
guideline, follow the extraction instructions on
`tests/fixtures/extract-guidance/project/.agents/skills/acme-change-readiness/SKILL.md`.
Review the resulting skill and recognition at their source destination. Supply
an adopter convention `TASK-NNN` and proposal `TASK-123`: add CSV export for
report users; risk is excessive export time; rollback signal is an export
exceeding the agreed response-time threshold. Review the resulting readiness
brief for the source's useful fields and human-owned decision. Compare source
contents before and after. This one example covers naming, direct output,
generalization, recognition, preservation, and useful behavior.

Run `npm run lint` and `npm test` once to check the remaining repository content
and checks together. Keep the result in the active plan while work is underway.
On completion, reduce the home story to its goal and scope and update the backlog.

## Readiness

Ready for direct execution. One cohesive edit and one representative proof loop;
aim for a short, roughly five-minute leaf and reassess if the work grows.
The scope and example are settled. Implementation is planned.
