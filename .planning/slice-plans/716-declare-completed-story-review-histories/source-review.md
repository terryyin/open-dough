# Source-only review

**Obtained:** 2026-11-19, before first implementation delegation.
**Reviewer:** fresh general-purpose agent (no plan, product, or proof inputs).
**Input:** SEED-353#declare-completed-story-review-histories Goal, Scope, Excluded, Key examples, and Safe stopping point only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Declarative completed-story history replaces variant replay: one declared history in shared `makeMe.aRepository`, materialized by the start origin—not a variant name to `completedPublishedStory`. Declares claim through `takeRevision`, implementation, interleaving writer, takeover and return profiles, each integration and landing merge, and completion as a revision carrying `makeMe.aDoneRecord`. Named revisions replace returned `claim`, `completion` and `branchSide`. Keep deferred, prepared-prefix reuse and each test's private mutable copy. | slice 8 |  |
| 2 | Done-record shape follows the case: carries Intent coverage, or omits agent, host and model, when the case states it. | slice 7 |  |
| 3 | Listed consumers migrate with purpose and assertions kept: backend review `story-review-completed*`, historical-choice and capture-fallback; launches follow-up-file specs and `followUpCompletedFile.ts`; E2E review completed, merge-edits, follow-up, diff-line-follow-up and diff-add-note; Intent consumers; `storyCiComparisonEarlierLanding.ts` and `storyCiComparisonSkippedLandingFixture.ts`; `laterStoryMergesTrunk.ts`. | slice 8 |  |
| 4 | Trunk Mode published review: given declared Trunk Mode history (Yui's claim; implementation of `shared.txt` first line and `[literal]*.txt`; interleaved `other-story.txt` and last-line edit; completion with Yui's done record), review is published with completion `completion` and agent Yui; files list `shared.txt` and `[literal]*.txt` without `other-story.txt`. | slice 1 | observed: story-review-completed.spec.ts trunk/story-branch interleaved: review.completion + review.agent === agentIdentity("Yui").agent; files shared/[literal] without other-story; backend-proof-record-4.json passed |
| 5 | Story Branch Mode: declared trunk-first landing merge authored by Yui gives the same files, and `branchSide` names its second parent. | slice 1 | observed: story-review-completed.spec.ts story-branch interleaved: same files; origin.revision("branch completion") === completion^2; backend-proof-record-4.json passed |
| 6 | Takeover: when Akiho takes over and adds `takeover.txt`, the review lists `takeover.txt` (`+second agent work`) beside Yui's files. | slice 3 | observed: story-review-completed-attribution.spec.ts takeover: files include takeover.txt; file diff +second agent work; backend-proof-record-slice3.json passed |
| 7 | Return: story returned before completion whose declared done record has no agent → review recovers Yui as the unique published execution agent. | slice 3 | observed: story-review-completed-agent-recovery.spec.ts returned: done record without agent; review.agent === Yui-chan; backend-proof-record-slice3.json passed |
| 8 | Another writer's merges: declared merge on trunk resolving `unrelated.txt`, or rewriting the story's line in `shared.txt`, or an octopus of two side branches → attribution and refusal answers stay as today. | slice 4 | observed: attribution+conflicts: declared unrelated/non-owning(both)/octopus/inseparable; merge-tree via declaredParentsConflict; backend-proof-record-slice4b.json 9 passed |
| 9 | Story's own conflicted integration: resolution `resolved story and trunk`; moves `agents/` to `profiles/`, restores `agents/other.json`, renames `checks/before.test.mjs` to `after.test.mjs`, adds `merge-resolution.txt`. Delivered files: `[literal]*.txt`, `checks/after.test.mjs` (renamed), `merge-resolution.txt`, `profiles/only.json` (renamed) and `shared.txt` flagged as including trunk's changes. | slice 5 |  |
| 10 | Conflicted merge stays a real, independently confirmed conflict without the description's renderer; own conflicted integration's declared parents still conflict on `shared.txt`. | slice 5 |  |
| 11 | Missing-repository capture falls back to published history with the declared completion's first parent as its base. | slice 2 | observed: story-review-completed-gaps.spec.ts unusable capture: baseline=origin.revision("interleaving") (declared parent of completion) via keepUnusableCompletedCapture; review published + landing-unavailable; backend-proof-record-slice2.json passed |
| 12 | A shallow checkout or a done record without an agent still gives today's gap answers. | slice 3 | observed: agent-recovery shallow + gaps missing-agent trunk/story-branch: today gap/recovery answers; backend-proof-record-slice3.json passed |
| 13 | Later developer's declared merge carrying the done record onto trunk's first-parent path → completed review still finds Story A's completion. | slice 1 | observed: story-review-completed.spec.ts both modes later-merge: laterDeveloperCarriesDoneRecord then review === delivered; backend-proof-record-4.json passed |
| 14 | Fallback inputs stay visible scenario actions or harness inputs: shallow fetches, merge-driver configuration, the moved `.git` folder, and retained captures that point at a missing repository. | slice 5 |  |
| 15 | Delete `storyReviewMergeDriver.ts`. Retire `story-review-uninterleaved-input.spec.ts` with the helper validation it guards. A refusal the declaration still needs becomes a builder check that runs before any Git. | slice 8 |  |
| 16 | Update the test-data architecture and repository test-data guides. Compare representative construction before and after, under ADR 0010. | slice 8 |  |
| 17 | No production behavior change. | slice 8 |  |
| 18 | Real backlog completion's own outputs, such as an agentless record after a return, stay proved by the backlog completion tests. | slice 3 | observed: product-backlog-complete-credit.test.mjs + profile suite: CLI agentless after return; backlog-credit-slice3.log.run.json exit 0 |
| 19 | The planner adds a backlog-level check where a declared record replaces the only current proof. | slice 3 | observed: product-backlog-complete-credit.test.mjs: complete after return with profile released writes agentless done record (no agent/host/model) |

## Unnumbered source context

- Goal motivation: who claimed, takeover/return, implementation, own vs other merges, which revision publishes the done record; comparisons explain themselves with the review behavior they prove.
- Today's baseline: variant name to `completedPublishedStory` replays out of sight.
- Delivery constraint: extend owners only for demonstrated needs.
- Excluded siblings: `completeBacklogStory`, `commitBacklogCompletion`, `publishCompletedStory` for launch/retained landings; shared `git`, `commitAll`, `writeAt` stay.
- Non-promise: no speedup promise.
- Safe stopping: launch-workspace completions and retained-run recovery stay with siblings; no human decision open.
