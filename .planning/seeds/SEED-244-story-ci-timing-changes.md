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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/481-compare-story-ci-timing-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5faa66e66643b882928f2c4c246d55faed375688f63eb58d70ff2f6747f41e5b","plan":"6d7ceee795e98216a98aa4b82e97785f29e9a6758cccd1ce7539fb8573347169"}}
```

**Goal.** A developer reviewing a selected story, especially a done one, can
see on Intent's CI status homepage how CI wall time and each Intent entry's
cumulative test execution time changed from the CI build before the story
started. For Story Branch Mode they can tell the change observed at the final
story-branch build apart from the change observed after integration into trunk.
The result shows timing changes the story's builds observed. It does not claim
the story caused them.

**Scope — required behavior.**

- **Comparison on the homepage.** When a story is selected, Intent's CI status
  homepage shows a timing comparison for it: CI wall time, then one row per CI
  entry in the homepage entry table introduced by
  [SEED-243](../done/SEED-243_improve-intent-home-and-selection-summaries.json).
  Each comparable figure shows its before value, its after value and the signed
  difference: positive means longer, negative means shorter. A selected done
  story gets this comparison where the homepage today only explains that the
  story has no branch to judge. With no story selected, the homepage is
  unchanged.
- **Pre-story baseline.** The story starts at its first published execution
  claim on trunk, the claim commit that `storyPublishedEvidence.ts` and
  `storyCompletedCommits.ts` already recover. The baseline is the newest
  first-parent trunk revision at or before that claim's parent that has a
  completed CI attempt. It is fixed to the story and never moves to whatever
  trunk build is current. When it is an ancestor rather than the claim's
  parent itself, the homepage says how many later revisions before the story
  start had no completed build.
- **Branch result (Story Branch Mode).** For a done story, the final branch
  revision is the story-side parent of the story's newest landing merge on
  trunk. Published evidence already recovers that merge as an owning merge.
  It is the completion itself when the wrap-up landed with the story. It is an
  earlier merge when the story's code landed first and the story completed
  later through direct trunk commits. The branch result is the newest completed
  attempt at that revision. When that revision has no build, the newest
  first-parent ancestor on the branch side with a build is used, provided it is
  not older than the story's start, and it is labelled as an ancestor. For a
  Taken story, the latest completed build of its branch is shown as
  provisional, not final. A Trunk Mode story's branch result is marked not
  applicable.
- **Landed result.** The landed result is the newest completed attempt at the
  story's completion revision on the configured trunk. When that revision has
  no build because only CI-ignored paths changed, as in a Trunk Mode wrap-up
  commit, the newest first-parent ancestor with a build is used, provided it
  is not older than the story's start. It is labelled as an ancestor. A later
  trunk build never stands in. A story not yet completed has no landed result
  yet, and the homepage says so.
- **Build selection.** For each revision, use the newest run and its newest
  completed attempt, whether it passed or failed. Running and cancelled
  attempts give no timing. A failed endpoint's figures are labelled as coming
  from a failed build.
- **Done stories stay tied to their own builds.** The endpoints come from
  published history: the done record, the claims and the landing merge. They
  stay the same after the story branch and agent profile are removed, and
  later trunk commits never replace them.
- **Traceable evidence.** Name each endpoint once: its revision, run and
  attempt, state, a link where available, and whether it is the exact revision
  or a measured ancestor. Keep elapsed CI wall time, the attempt's start to
  completion, distinct from cumulative entry test execution time. Show the
  underlying values beside every difference.
- **Precision.** Comparison durations and differences use whole seconds,
  such as `3 min 20 s` and `+20 s`, so a small change is not rounded away.
  Elsewhere the homepage keeps its existing formatting.
- **Honest gaps.** Each of these has its own explanation, and missing
  evidence is never shown as zero or as no change:
  - no completed build, or a running build;
  - an expired or unavailable proof summary;
  - a summary with no entry durations (summaries made before durations were
    recorded have none);
  - a part whose duration is missing, which leaves the total partial;
  - an entry present at only one endpoint, shown as added or removed with
    no invented difference;
  - an unrecoverable story history, using the published review's existing
    explanations.
  When only one comparison is available, it stays readable and the other
  explains its gap. Wall time comes from the CI run itself, so it can stay
  available after the entry summaries have expired.
- **Observed, not attributed.** The comparison says that each difference
  compares two single builds and does not establish the story as its cause.

**Scope limits and deferred promises.** These are delivery boundaries. They
are not reasons to reject cases the rules above already handle.

- **No variance band.** This story does not add a variance reference, such as
  the spread of nearby trunk builds, or any judgment of significance.
- **No durable copies.** Timing evidence is not copied into done records or
  other stored files, so its availability follows the CI provider's retention.
  This repository keeps proof summaries for 30 days. Run times stay listed
  longer.
- **No other scopes or homes.** Folder and file differences belong to
  [SEED-245](SEED-245-story-intent-summary-differences.md#compare-story-intent-entry-folder-and-file-summaries).
  The comparison is not added to Review changes or story cards.
- **No new CI contract.** The ciAdapter contract is not extended. An adapter
  project compares only builds its existing discovery and proof reads can
  return, and explains the rest.

**Key examples.**

1. **Done Story Branch story.** The baseline build took 3 min of CI wall time,
   the final branch build 3 min 20 s and the landing build 4 min. The homepage
   shows Branch **+20 s** and Landed **+1 min** against the named baseline, and
   names all three builds.
2. **Mixed entry changes.** An entry's cumulative execution time went from
   4 min before the story to 4 min 30 s on the branch and 5 min after landing.
   Its row shows 4 min, then 4 min 30 s **+30 s**, then 5 min **+1 min**. An
   entry that became faster shows a negative difference.
3. **Measured ancestor (SEED-242, observed).** The claim `d85b790e0` and its
   parent changed only `.planning/**`, which CI ignores, so neither has a
   build. The baseline is `d1e1ddff6`, run 42037678817 attempt 1, four
   first-parent revisions before the claim's parent. The homepage marks it as an ancestor
   with 4 later revisions without a build. The final branch build is
   `1cbd59f6d`, run 42053255522. The landing merge is `9cce03246`, run
   42053337271.
4. **Done story after cleanup.** The story branch is gone and newer stories
   have advanced trunk. Selecting the done story still compares its own
   branch and landed builds with its own baseline.
5. **Landed build still running, new entry.** The branch build is complete
   but the landing build is still running. The branch comparison is shown and
   Landed says the build is still running. An entry added by the story shows
   as added, with no invented baseline.
6. **Expired proof.** A done story's summaries have expired after 30 days.
   The CI wall time comparison still shows. The entry rows explain that the
   proof has expired, without showing differences.
7. **Trunk Mode done story.** The completion commit only touched `.planning/`
   and has no build. Landed uses the story's last built trunk revision, marked
   as an ancestor. Branch is marked not applicable.
8. **Code landed before completion (SEED-236, observed).** The story's
   landing merge `4a8129838` failed CI, and the story then completed on trunk
   at `a166534a8`, which passed. Branch uses `9e8075f07` as an ancestor of the
   landing merge's branch side. Landed uses the completion build. Neither is
   replaced by a later trunk build.
9. **Taken story.** The latest completed branch build is shown as provisional.
   Landed says the story has not landed yet.

**Investigation and challenge.** Observed in the preparation workspace at
`8d7e3b652` on 2026-11-05 through `gh api` and published Git history.

- **Endpoints.** Published history already identifies everything needed, even
  after branch cleanup:
  - The done record's first-parent commit is the completion: for SEED-242,
    the landing merge `9cce03246`. Its second parent `1cbd59f6d` is the final
    branch revision.
  - SEED-236 shows the other shape. Its code landed in merge `4a8129838`, and
    it completed later at single-parent `a166534a8` after a CI repair and a
    release on trunk. Its owning merge's branch side, `cec7c2f43`, changed only
    `.planning/` and has no build, so the branch result is `9e8075f07`, one
    revision back. Of the 40 newest done records, 5 completed this way.
  - The claim commit (`d85b790e0` for SEED-242) records `mode` and `branch` in
    the agent profile.
  - `storyReviewPublished.ts` and `storyPublishedEvidence.ts` already walk the
    claims and owning merges to compare a done story's files.
- **No exact baseline build.** CI ignores `.planning/**` and `docs/**`, so
  claim and preparation commits never get a build. An exact baseline build
  will almost never exist, which is why the measured-ancestor rule is required.
  Cancelled runs from concurrency, and failed runs, occur on trunk.
- **Build lookup.** `actions/runs?head_sha=` lists the runs for one revision,
  and `runs/{id}/attempts/{n}` gives each attempt's own start and completion.
  Rerun 41976448705 had a cancelled attempt 1 and a passing attempt 2, each
  with its own `ci-proof-summary-attempt-<n>` artifact. Today's judgment
  reads one page of a branch's commit listing. Comparisons need lookups by
  revision instead.
- **Retention and precision.** Proof summaries are kept for 30 days
  (`.github/actions/ci-proof-summary/action.yml`) and first appeared on
  2026-11-04. Entry `durationMs` appears only in summaries from 2026-11-05
  onward. Run timestamps from 2026-09-06 are still listed. Durations are
  milliseconds and run times are whole seconds, so differences can be shown in
  seconds. The homepage currently rounds to whole minutes.
- **Strongest doubt: noise.** Single-build differences are dominated by runner
  noise. Within about 1.5 hours on `main`, wall time was 281 s, 484 s and
  561 s. `dashboard/tests` cumulative time went 8,083 s → 8,793 s across
  `089d88de7`, which changed one test file. For SEED-242 the observed figures
  were:

  | | Baseline | Branch | Landed |
  | --- | --- | --- | --- |
  | CI wall time | 281 s | 530 s | 561 s |
  | `dashboard/tests` (2,090 → 2,092 tests) | 8,083 s | 8,506 s | 8,868 s |
  | `tests` | 788 s | 970 s | 947 s |
  | `src/skills` | 918 s | 1,056 s | 969 s |

  The story meets its wording but could still mislead a reader who takes
  `+13 min` as the story's cost. It therefore shows the figures as single-build
  observations rather than attributing them. A variance reference is deferred,
  not rejected.

**UI and architecture.** The user is a developer reviewing a selected story
on Intent's homepage. They first see which builds are compared. Then they
read each row's before and after values, read the difference only with its
values beside it, and spot gaps without mistaking them for zero. Sketch, for
agreement on content and not on layout:

```text
CI timing changes for <story>   (observed builds; differences are not attributed to the story)
Baseline d1e1ddff6 · run 42037678817 #1 · passed · ancestor: 4 later revisions without a build
Branch   1cbd59f6d · run 42053255522 #1 · passed · final branch revision
Landed   9cce03246 · run 42053337271 #1 · passed · landing revision

                 Baseline      Branch                Landed
CI wall time     4 min 41 s    8 min 50 s  +4 min 9 s   9 min 21 s  +4 min 40 s
dashboard/tests  2 h 14 min 43 s  2 h 21 min 46 s +7 min 3 s  2 h 27 min 48 s +13 min 5 s
...
```

The interaction choices with architectural consequences:

| Choice | User effect and system consequence |
| --- | --- |
| Derive comparisons on demand (recommended; chosen) | Works for any done story whose CI evidence is still retained, including stories done before this delivery. Entry figures expire with the provider's retention; wall time lasts longer. The comparison is a view rebuilt from published Git history and CI evidence, as [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) requires, and needs no new record. Storing timings at completion instead would survive expiry. But the landing build finishes only after the done record has already landed, so storing would need a second later write. |
| Measured ancestor with labels | Without this, almost no story would have a baseline, because claim commits are never built. Lookups walk first-parent history one revision at a time and stop at the story start. Every figure keeps its exact build identity. |
| Read only when a story is selected | A selected done story costs a few lookups by revision and up to three summary reads. Completed attempts and summaries never change, so they are remembered like today's proof reads. Nothing is polled for done stories. A Taken story's provisional result follows the judged branch's existing re-read triggers. |

The new concept is a story's **CI comparison endpoints**: baseline, branch
result and landed result. Each is a build identity plus how it was selected.
Its endpoint revisions come from the existing published-story evidence used
by `storyReviewPublished.ts`. Its build lookup generalizes `baseCiNearest.ts`'s
nearest-result rule from a branch's listing to a revision's first-parent
ancestors. Proofs come through the existing `intent=ci-proof` read. SEED-245
reuses the same endpoints for folder and file differences, so this concept
must not be specific to the homepage.
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps these
observed CI results distinct from maintained procedures. No conflict with an
Accepted ADR was found, and this design stays in the seed and plan, not in a
new ADR.

**Priority and scope.** Terry requested this as the second queued story,
immediately after SEED-243's Intent UI improvements, on `main` and synchronized
with `origin`. That order does not itself establish a blocking dependency.
