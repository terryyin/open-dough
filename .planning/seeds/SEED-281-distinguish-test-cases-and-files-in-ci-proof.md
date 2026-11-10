---
id: SEED-281
status: active
planted: 2026-11-09
scope: story
---

# Distinguish test cases and test files in Intent CI proof

<a id="keep-unit-gaps-and-names-visible"></a>

### Keep each unit's gaps and name visible in Intent CI proof

**Identity:** SEED-281#keep-unit-gaps-and-names-visible
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/557-keep-unit-gaps-and-names-visible/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84540cc7a6c1d70b331309d89282028c63e8bec4469971e31e6fae9de9c398ba","plan":"397a288743b6883b02b4c76083dfc160c634fe6bd6d2999567b30bb527e725e7"}}
```

**Goal.** Developers reading Intent's CI proof and comparisons for a location
that reports both test cases and test files see each unit's missing or
ambiguous parts, and which unit every compared row counts, at every scope. The
correction is bounded to the retrospective findings for
SEED-281#distinguish-test-cases-and-files-in-ci-proof.

**Scope.** Below the entry, a unit whose parts are missing or ambiguous, or
present without a file breakdown, stays at a folder or file scope with its gap
instead of disappearing or reading as unreported. A compared row names its unit
even when no later build measured it (`1 test file → —`, `5 test cases →
removed`, `nothing counted as test files`). Comparison test support serves the
evidence a test arranges, and the duplicate GitHub Actions mixed-unit test is
removed. Whether a count difference may cross a missing part is not decided
here. [Plan](../slice-plans/557-keep-unit-gaps-and-names-visible/PLAN.md)

<a id="no-count-difference-across-gaps"></a>

### Show no count difference across a missing or ambiguous part

**Identity:** SEED-281#no-count-difference-across-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** Developers comparing CI builds in Intent do not read a lost shard as
added or removed tests: a count difference and its cue appear only when the
unit's parts are complete at both compared builds.

**Scope.** Treat a unit with a missing or ambiguous part at either endpoint the
way partial timing is already treated: show both totals with the gap, and no
signed count difference or count cue, in compared rows, the overall Counts
words and the count cue. Complete units keep their differences.

**Key examples.**

- Baseline counts 1,000 test cases with part 2 of 2 missing; Landed counts
  1,090, complete. The row reads both totals with Baseline's gap and no
  `(+90)`, and takes no "more" cue.
- A folder whose results sat in Landed's missing part shows that gap rather
  than `removed`.
- Both builds complete: `1,000 → 1,090 test cases (+90)` with its cue, as now.
