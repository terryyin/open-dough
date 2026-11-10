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

<a id="no-count-difference-across-gaps"></a>

### Show no count difference across a missing or ambiguous part

**Identity:** SEED-281#no-count-difference-across-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/566-no-count-difference-across-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"97b859b5137f604cee8583b5cb979ba6188ddb0d40f6c916ccf45603f2e78e8c","plan":"e1b3356af6e728be47ff574e67f51d7dbdbe9bfe22bf6e722e80e9b86a944827"}}
```

**Goal.** Developers comparing CI builds in Intent do not read a lost shard as
added or removed tests: a count difference and its cue appear only when the
unit's parts are complete at both compared builds.

**Scope.** Keep the observed count totals, their unit, and each endpoint's
missing or ambiguous part visible. Withhold count-change claims for that unit
when either compared endpoint has such a gap: signed differences, equality
wording such as `no change`, and count cues. Apply the rule to entry, folder,
file and outside rows, the tree's count cues, and overall Counts. A scope not
observed under an incomplete unit is a gap, not evidence of added or removed
tests. This restriction protects the correctness of the comparison; a total
assembled from incomplete evidence cannot establish a change.

Judge Baseline → Branch and Baseline → Landed independently. A complete pair
keeps its difference even when the third endpoint is partial. Other complete
units keep their differences and contribute to the existing agreed count cue.
An incomplete contributing entry prevents an overall count difference for its
unit; do not silently compare only that unit's complete entries. Counts whose
parts are complete remain comparable when durations are not recorded.

Keep existing unit matching, legacy-result handling, measured-zero versus
unreported distinctions, complete-evidence added/removed behavior, build
selection and timing semantics. This increment adds no layout, evidence
collection or refresh workflow. Comparing a subset of matching shards and
attributing a count change to the story are deferred promises, not behaviors
to reject when naturally supported by existing rules.

**Key examples.**

- Baseline counts 1,000 test cases with part 2 of 2 missing; Landed counts
  1,090, complete → open the comparison or drill into a Summary or file Proof
  → both observed totals and Baseline's gap remain readable, without `(+90)`
  or a "more" cue. An ambiguous part has the same effect.
- Both endpoints report 1,000 cases, but either has an ambiguous part → read
  Counts → keep both observations and the gap without `no change` or `(0)`.
- Baseline and Landed have complete case evidence, 1,000 and 1,120; Branch
  reports 1,090 with a missing part → read Counts → Landed retains `(+120)`;
  Branch has no difference. If only Landed is partial, Branch keeps its own
  difference and Landed has none.
- Baseline reports a folder or file whose results are absent from Landed's
  present shard, while another Landed shard is missing → inspect that scope
  → show the unit's missing-part gap rather than `removed`. The reverse
  cannot establish `added` from a partial Baseline either.
- One entry's cases are partial, another entry's cases are complete, and
  test files are complete at both builds → read overall Counts → show the
  observed case totals and their gap without a case difference; preserve the
  test-file difference and let only supported comparisons inform the cue.
- Both builds have complete parts: 1,000 → 1,090 test cases → read Counts →
  retain `(+90)` and its cue, including when neither build recorded timings.

**UI and architecture.** The developer follows the existing story comparison,
Summary and file Proof path. Each affected endpoint explains why its observed
total cannot establish a difference; resolving the evidence gap makes the
ordinary comparison eligible again. No new interaction is needed.

Carry parts completeness through the existing per-unit count interpretation
and overall aggregation, reusing timing's distinction between an observation
and a supported comparison without requiring timing data. Keep this one rule
across views, following the
[Intent workspace direction](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
and [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)'s
distinction between missing/conflicting evidence and a negative result.

**Refinement evidence.** On 2026-11-10 at `7dc1d8956`, a local consuming probe
reproduced signed differences and cues across missing and ambiguous parts at
entry, folder, file, outside and overall scopes, `no change` for equal partial
totals, and `removed` for a scope hidden by a missing shard. Complete untimed
counts still compared. The plan retains the observation and proof ownership.

[Slice plan](../slice-plans/566-no-count-difference-across-gaps/PLAN.md)
