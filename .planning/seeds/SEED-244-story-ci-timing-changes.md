---
id: SEED-244
status: active
planted: 2026-11-05
planted_during: Terry Yin's request for a second-priority story comparing selected-story CI and Intent-entry timings before execution, on the story branch, and after landing
trigger_when: A developer selects a story, especially a done story, and opens Intent's CI status homepage
scope: story
---

# SEED-244: Compare a story's CI and entry timing changes

<a id="compare-story-ci-timing-changes"></a>

### Compare a story's CI and entry timing changes

**Identity:** SEED-244#compare-story-ci-timing-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer reviewing a selected story, especially
a done story, can see how CI wall time and each Intent entry's test execution
time changed from the CI build before the story started. For Story Branch
Mode, the developer can distinguish the observed change at the final story
branch revision from the observed change after integration into `main`.

**Requested behavior.**

- **Selected-story comparison on Intent home.** Select a story and open
  Intent. Its CI status homepage shows before/after durations and signed
  differences for CI wall time and the test execution time of each Intent
  entry. Display the entry differences alongside the entry summaries in the
  homepage table introduced by
  [the preceding UI story](SEED-243-intent-home-and-selection-summaries.md#improve-intent-home-and-selection-summaries).
- **Pre-story baseline.** Compare against the last relevant CI build before
  the story started. Identify that build and the story-start boundary that
  makes it the baseline. Keep it fixed to the selected story rather than
  using whichever trunk build is current when the developer opens Intent.
- **Story-branch result.** For Story Branch Mode, show the comparison using
  the CI build for the final published commit within the story branch before
  landing. This is the branch result, distinct from the integration build.
  For a story still executing, an available latest branch result may be
  shown as provisional, clearly distinguished from a final result.
- **Landed result.** Also show the comparison using the CI build at the
  story's resulting integration revision on `main` (or the project's
  configured trunk). Compare it with the same pre-story baseline. Present
  branch and landed comparisons separately, for both overall CI wall time
  and per-entry execution time, because integration may change observed
  runtime. For Trunk Mode, show the applicable landed comparison and identify
  the branch-only comparison as not applicable.
- **Done stories remain reviewable.** A done story can show these historical
  comparisons even after its story branch and active agent profile have
  been removed. Resolve the builds from recoverable story execution and
  completion evidence; later trunk changes must not replace the selected
  story's results.
- **Traceable timing evidence.** Name the baseline and result revisions,
  run/attempt identities, and available build links. Preserve the distinction
  between elapsed CI wall time and cumulative entry test execution time.
  Positive changes mean longer execution and negative changes mean shorter
  execution; show the underlying values as well as the difference.
- **Honest gaps.** Missing or expired builds/proof, running builds, absent
  entry timings, and entries added or removed between builds have explicit
  explanations. Show a numerical difference only where the evidence supports
  it; missing evidence is not zero. If only one comparison is available,
  keep it useful while explaining the other gap. Observed build differences
  do not by themselves prove that the story caused every timing change.

**Key examples.**

1. Select a done Story Branch Mode story and open Intent. The pre-story
   build took 3 min of CI wall time; the final branch build took 3 min 20 s;
   the integration build took 4 min. The homepage shows branch **+20 s** and
   landed **+1 min** against the named baseline, with the three builds
   identifiable.
2. For the same story, an entry's cumulative test execution time changed
   from 4 min before the story to 4 min 30 s on the branch and 5 min after
   landing. Its table row shows the separate **+30 s** and **+1 min**
   differences, alongside those durations. Another entry that became faster
   shows a negative difference.
3. The story branch is deleted after landing and newer stories advance
   `main`. Selecting the original done story still compares its own final
   branch and integration builds against its original pre-story build,
   rather than comparing with today's trunk head.
4. The branch build is available but the integration build is still running,
   or its proof has expired. The branch comparison is shown; the landed
   comparison explains why no completed timing difference is available.
   A newly added entry is identified as added, without an invented baseline.
5. Select a Trunk Mode done story. Show its pre-story-to-completion CI and
   entry timing changes, with branch-only comparison marked not applicable.

**Refinement context.** Establish how existing published execution,
completion, and CI evidence identify the story-start boundary, final branch
revision, and integration revision, including after branch cleanup. Settle
build/attempt selection for reruns and revisions that have no CI build;
clearly distinguish a measured ancestor from an exact endpoint build.
Determine how available duration precision supports useful differences such
as seconds when homepage totals are currently rounded to whole minutes.
These are refinement questions, not claims that the evidence is already
retained or that a particular storage solution has been selected.

**Priority and scope.** Terry requested this as the second queued story,
immediately after SEED-243's Intent UI improvements, on `main` and synchronized
with `origin`. That order does not itself establish a blocking dependency.
This captures the comparison outcome for future refinement and implementation.
