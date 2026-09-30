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
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** The maintainer who reads and changes this repository's native
acceptance tests finds every native family (git-publication, delivery-evidence,
story-branch and trunk closure, ci-completion, execution-worktree-prep,
product-backlog, and the shared native harness) built from the same few
cohesive layers, with each responsibility owned in one place and no native
file over the 250-line bound. The first known case is
`tests/support/story-branch-closure-native-assess.sh` (266 lines, the only
native file over the bound today); the design, not that file, is the outcome.

**Scope:** This is not a simple split. Cutting the over-long file into pieces
would satisfy the bound and leave the design as it is. The story reassesses
the native test architecture as a whole, across all families: what each
fixture, run, observe, assess, and counterexample script and each suite owns,
where responsibilities overlap or leak between families and the shared harness
(for example the completion observation and response-reading helpers), and how
the pieces depend on one another. It then moves the families onto one cohesive
layering and removes the duplicated patterns it finds, so each concern ends
with a single owner. The length problem is a side effect of that design.

- **Preserved:** every native entry point keeps its command line and
  retained-results contract, and every current assessor verdict and
  counterexample expectation stays as it is. A counterexample whose expected
  verdict would have to change stops the work and goes to the maintainer.
- **Not committed:** no new native cases, no change to what a native run checks
  (ADR 0005 stands), no paid native runs (they stay manual-only), and no
  change to non-native suites or `tests/README.md`.
- **Size:** the reach is wide by choice. Execution may split it at a safe
  boundary, family by family, once the shared layering exists.

**Key examples:**

- The 266-line story-branch-closure assessor holds run observation and its
  counterexamples together; after the change each has one owner, both under
  the bound, and the closure suite gives the same verdicts.
- Two families read the same kind of completion or response field with their
  own helper; after the change one shared owner serves both, and the families
  keep only what is specific to their journey.
- A new native family added later follows the shared layering without copying
  another family's scripts.
- The free assessor counterexample suites, the stream replay corpus, and the
  runner checks pass unchanged: that, not a paid native run, proves the
  verdicts did not change.

## Breadcrumbs

- Maintainer request on 2026-09-29: move project-specific findings out of
  DearDough.md, remove resolved ones, group the rest, and queue the two
  highest-priority groups as the top backlog stories linked to their findings.
  A same-day re-check replaced a local-versus-CI story whose findings were
  low impact or matched published ODF-003.
- [Project findings](../../ProjectFindings.md), [Product backlog](../PRODUCT-BACKLOG.md).
