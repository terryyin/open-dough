---
id: SEED-248
status: active
planted: 2026-11-06
planted_during: Terry Yin's clarification of the three-build proof comparison after a done story showed an unsafe merge-attribution warning
trigger_when: A developer selects a completed story in Intent whose integration included merge edits
scope: story
---

# SEED-248: Compare story proof through merge resolutions

## Request and evidence

Terry reported this message on Intent's homepage after selecting a done story:

> Published execution history contains merge resolutions affecting this story's files whose changes cannot be attributed safely.

On 2026-11-06 he confirmed the intended comparison: retain proof for the build
before execution, the final branch build before merging, and the build of the
merge into `main`. Compare both result builds with the same pre-story baseline,
including when merge resolutions change the integrated result.

The initial SEED-244 story, recoverable at commit `a4d47c2d8` in
`.planning/seeds/SEED-244-story-ci-timing-changes.md`, explicitly requested the
final branch and integration builds separately because integration may change
observed runtime. Refinement at `c1140decd` introduced both shared unavailable
explanations with Review changes and use of the completion build for the landed
result. Implementation at `ab08121d1` carried those choices into the comparison.

The current [published endpoint lookup](../../dashboard/server/storyPublishedEndpoints.ts)
requires [completed-story code attribution](../../dashboard/server/storyCompletedCommits.ts)
before returning the revisions for
[CI comparison](../../dashboard/server/intentCiComparisonResolve.ts). An
attribution refusal therefore suppresses the entire proof comparison before
build lookup, even when the required revisions and CI results are recoverable.
The landed slot also targets the completion revision, which can be later than
the code's integration merge. The reported story identity and offending merge
were not supplied; the investigation established the shared rejection path,
not a reproduction of that particular history.

## Story

<a id="compare-story-proof-through-merge-resolutions"></a>

### Compare story proof through merge resolutions

**Identity:** SEED-248#compare-story-proof-through-merge-resolutions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing a completed story's observed results and
runtime cost in Intent, including the changes introduced during integration.

**Goal:** Selecting a done Story Branch Mode story shows three independently
identified CI proofs and both comparisons against the same pre-story baseline,
even when merge edits prevent an exclusive attribution of the story's code diff.

**Required behavior:**

- **Baseline A:** Use the last relevant completed CI build before the story's
  first published execution claim. Keep the story-start boundary and measured
  build fixed to this story.
- **Branch B:** Use the build for the final published story-branch revision
  immediately before its integration into the configured trunk (`main` here),
  recovered from the story-side parent of the landing merge.
- **Landed C:** Use the build at that integration merge on trunk, including its
  merge-resolution edits. A later commit that marks the story done, repairs CI,
  or advances unrelated work must not replace the merge build. Keep a failed
  merge build identifiable as failed. Preserve the applicable existing Trunk
  Mode comparison, where there is no branch-side build.
- Show each available proof's observed results, counts and durations at the
  existing comparison scopes: the homepage and entry, folder and file
  comparisons. Show B versus A and C versus A separately, including the measured
  values and signed differences wherever supported by that proof.
- Identify each build by revision, run/attempt, state and available link. Keep
  CI wall time distinct from cumulative test execution time, retain useful
  duration precision, and label any supported measured-ancestor fallback with
  the actual measured revision. A fallback must not silently turn B into C or
  substitute a later completion build for C.
- Recover build identities independently of the ability to assign individual
  code edits exclusively to this story. A merge-resolution attribution warning
  in Review changes must not suppress otherwise recoverable CI proof or either
  valid proof comparison. Keep source-diff attribution truthful where it remains
  ambiguous.
- Treat a missing or ambiguous build identity, missing build, running attempt,
  expired summary and partial proof as explicit gaps in the affected endpoint
  or figure. Keep other recoverable proofs and comparisons readable. Missing
  proof never becomes zero or no change.
- Keep the comparisons tied to published history after branch/profile cleanup
  and later trunk advances. Frame their differences as observations between
  builds; they do not establish that the story caused every difference.

**Key examples / evaluation:**

1. **Merge resolutions with three proofs.** A baseline build takes 180 s, the
   final branch build 200 s, and the integration merge build 240 s. The merge
   includes resolved edits that prevent safe code attribution. Selecting the
   done story still names all three builds and shows B versus A as +20 s and
   C versus A as +60 s. Its entry proof rows retain both comparisons.
2. **The reported refusal path.** Published history includes another merge
   whose resolution edits touch a file changed by the selected story, triggering
   the quoted attribution warning. When A, B and C can be recovered, Intent
   still shows their proof comparisons. Any source-diff limitation is explained
   separately without preventing proof lookup.
3. **Completion after integration.** The branch merges at M with proof, then
   the story is marked done at D with different proof. Landed names M and uses
   M's figures, including a failed result when applicable. Neither D nor a
   later trunk build replaces it; B remains M's story-side parent build.
4. **One unavailable proof.** A and B are readable while C is running or its
   summary has expired. B versus A remains readable. C explains its own gap;
   an available run's wall time remains usable even if its summary is gone.
5. **Summary consumers.** For an entry, folder or file with retained proof at
   all three builds, its comparison uses the same A, B and C as the homepage,
   including count changes and signed execution-time differences supported by
   those summaries. A code-attribution refusal alone does not remove the proof
   comparison.
6. **Cleanup and missing identities.** Delete the story branch and agent
   profile and advance trunk: the same three historical builds remain selected.
   If only one endpoint identity is genuinely unrecoverable, explain that gap
   and retain any other independently established proof and comparison.

**Scope boundaries:** Correct endpoint recovery, proof availability and their
existing consumers. No new proof generation, stored timing copies, CI-provider
contract, causal performance claim or new file-tab design is required. This
story does not relax source-diff attribution requirements or change the
no-story-selected CI judgment. Shared consumers do not establish a blocking
dependency on another queued story.

**Preparation:** Capture this correction as the first queued story on Terry's
instruction. Implementation planning and execution remain later work.

## References

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current Intent behavior](../../docs/dashboard-development-intent.md).
- [Completed original comparison story](../done/SEED-244_compare-story-ci-timing-changes.json).
- [Completed summary comparison story](../done/SEED-245_compare-story-intent-entry-folder-and-file-summaries.json).
- [Current comparison journeys](../../dashboard/tests/intent-ci-comparison.spec.ts).
- [ADR 0008: Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md): derive the view from published Git and CI evidence, with explicit gaps.
- [AGENTS.md: Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests) applies as written to implementation planning, delegation and repair handoffs.
