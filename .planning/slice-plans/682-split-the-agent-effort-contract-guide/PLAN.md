# Split the agent-effort contract guide

**Source:** [correction story](../../seeds/SEED-345-session-token-efficiency.md#split-the-agent-effort-contract-guide)
**Identity:** SEED-345#split-the-agent-effort-contract-guide

## Provenance and finding

Retrospective of SEED-345#test-agent-effort-through-its-output-contract
(execution commits `849f72ca`, `c5020987`, `948160cb`, `3ba88d70` on
`claude/test-agent-effort-through-its-output-contract`). That story made
`dashboard/AGENT-EFFORT.md` the maintained JSON/readable output contract.
At `3ba88d70` the file is 253 lines (145 at the Take `30d3acfff`), above the
250-line limit in the
[file-size check](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
Each slice's refactor pass checked code files only, so the growth went
unnoticed.

## Goal and scope

Split the guide along its existing seam: the three output-contract sections
(`## Selection contract`, `## Single-report contract`, `## Comparison contract`)
move into one guide beside it, for example `dashboard/AGENT-EFFORT-OUTPUT.md`.
`AGENT-EFFORT.md` keeps the command usage, historical sample boundaries,
explicit comparison groups and definitions, and links to the new guide.
Repoint every citation of the moved anchors. At `3ba88d70` these are the source
comments in `dashboard/server/agentEffortCatalog.ts`,
`agentEffortSingleReport.ts`, `agentEffortSingleReportFacts.ts` and
`agentEffortComparisonReport.ts`, and the test readers
`dashboard/tests/usage-history/agentEffort{Selection,Cost,Compare}.ts`.
`Distribution/evaluation/comparison.md` links the guide itself and keeps
working.

**Preserved promises and constraints:** every documented public name, shape,
unit, coverage value, refusal and comparison rule stays word for word. No
product, CLI, output or test behavior changes. Both guides stay within 250
lines.

## Proof and local gates

Documentation and comments only. Proof:

- `wc -l` on both guides shows at most 250 lines each.
- `git grep -n "AGENT-EFFORT.md#"` finds no citation of a moved anchor.
- The moved sections match the originals word for word, compared with `diff`.
- `npm run lint` passes on the changed sources.

No test run is required: no executable code changes.

## Ordered slices

### 1. A maintainer finds the output contract in its own guide
Type: Structure
Status: planned
Proof: the checks above.

Structure: move the three contract sections into the new guide, link it from
`AGENT-EFFORT.md`, and repoint the anchor citations.

## Current decisions and preparation assessment

- Refinement was not needed: one Structure slice with mechanical proof.
- Remaining slice-specific concerns: none identified in this review.
