---
id: SEED-055
status: active
planted: 2026-09-29
planted_during: Maintainer request to group project retrospective findings and queue the two highest priorities
trigger_when: A paid native run or a local time projection gives a verdict that differs from what the host or CI then shows
scope: unknown
---

# SEED-055: Trust this repository's own proof

## Why This Matters

Maintainers and executing agents decide whether Open Dough work is done from
evidence this repository produces: native acceptance verdicts
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)) and the
CI time budget in `tests/time-budget`. The
[project findings](../../ProjectFindings.md#priority-assessment) show both
repeatedly disagreeing with what the host or CI then showed. The cost is paid
native reruns, verdicts settled by reading transcripts, and agent time spent on
projections that came out wrong.

## Story Decomposition

<a id="reassess-native-test-architecture"></a>

### Reassess the native test architecture so its files are cohesive and short

**Identity:** SEED-055#reassess-native-test-architecture
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer who reads and changes this repository's native
acceptance tests finds them organized around cohesive responsibilities, with
no file over the 250-line bound. The first known case is
`tests/support/story-branch-closure-native-assess.sh` (266 lines); the
refinement finds the others.

**Scope:** This is not a simple split. Cutting the over-long files into
pieces would satisfy the bound and leave the design as it is. The story
reassesses the native test architecture as a whole: what each assessor,
support script, and suite owns, where responsibilities overlap or leak, and
how the pieces depend on one another. It then designs a more reasonable,
elegant, and cohesive solution. The length problem is addressed as a side
effect of that design, not as its aim. Refinement fixes the observable
outcome, the files in scope, and the proof that current verdicts do not
change.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
