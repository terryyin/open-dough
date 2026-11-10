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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/557-keep-unit-gaps-and-names-visible/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84540cc7a6c1d70b331309d89282028c63e8bec4469971e31e6fae9de9c398ba","plan":"0495a324e61e3ff36fecdc5c42a330de7ec8b9702e014d8315b4b9b049fa0bc9"}}
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
