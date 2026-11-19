# Declare completed-story review histories through MakeMe

**Identity:** SEED-353#declare-completed-story-review-histories
**Source:** [Declare completed-story review histories through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-completed-story-review-histories)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reads each completed-story review case from a declared history:
the claim, the takeover or return, the implementation, every merge with its
ordered parents, resolved bytes and author, and the completion revision that
carries the done record. Today a variant name passed to
`completedPublishedStory` replays starts, pushes, merges and backlog CLI runs.
The seed's Scope and Excluded lists bound the work: every consumer of
`completedPublishedStory` migrates. Completions made in launch workspaces or
retained landings stay with their siblings. There is no production change and
no speedup promise.

## Current decisions

- **One owner for completion facts.** `completionRevision` lives in
  `Distribution/tests/support/completion-revision.mjs` and is re-exported
  beside `takeRevision` from `queued-repository.mjs`. Like the claim, it gives
  the facts a real completion commit: the story leaves Taken, the agent's
  profile is removed, and a `makeMe.aDoneRecord` is written. The record has a
  fixed `completedAt`, the developer, the agent and host, and optional Intent
  coverage. A case states an agentless record explicitly. The done catalog
  comes from the shared renderer.
- **Named histories.** The completed-story histories go in one dashboard
  support module, `completedStoryHistory.ts`, as `RepositoryBuilder`
  extensions named by what they show: the ordinary Trunk Mode and Story
  Branch histories, takeover, return, another writer's merges, and the
  story's own merges. They replace the variant strings. A history used by one
  spec stays in that spec.
- **Two composition routes, same facts.**
  - A backend spec whose whole start is the completed story states it through
    `test.use({ originRepository })`, using `describe` blocks where modes
    differ.
  - A fixture that publishes after other setup, such as Intent's trunk and
    the page's earlier claim, appends the same revisions through
    `publishDeclaredTrunk`. That function passes resolved `declaredParents` to
    `commitDeclaredRevision`, which already accepts them, so merges publish
    mid-test.
- **What stays a visible action.** These remain actions or harness inputs, as
  the seed says:
  - a trunk advance or a later story's merge after the review was first read;
  - shallow fetches;
  - merge-driver configuration;
  - the moved `.git` folder;
  - retained captures.
  
  An advance that comes before the first read becomes a declared revision.
  A mid-test later merge that must carry a second parent's tree (the done
  record onto trunk's first-parent path) stays a real Git merge:
  `commitDeclaredRevision` overlays the first parent only. Until wrap-up
  deletes it, `laterBranchMergesTrunkAndFastForwards` owns that Git action and
  `laterDeveloperCarriesDoneRecord` in `completedStoryHistory.ts` is the
  completion-centric wrapper specs call.
- **Conflicts.** A declared conflicted merge is confirmed independently in its
  case: `git merge-tree --write-tree` of its named parents exits 1 on the
  resolved file. A clean merge's parents merge without conflict. This follows
  the delivered pattern in `e2e/review/story-review-commit-renames.spec.ts`.
- **Spec files stay small.** Expected edits are all under the 250-line
  file-size check today. The largest is `story-review-completed-gaps.spec.ts`
  at 242 lines. Shared histories go in the support module, so a spec does not
  grow past the check. When one would, split it by the review promise it
  proves.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A declared Trunk Mode completion gives the review the replay gives. The history is: `queuedReadyRepository`, the shared file, `takeRevision` for Yui, the implementation authored by Yui, another writer's interleaving, and a completion revision with Story A out of Taken, Yui's profile removed and a done record. | Backend boundary review and file endpoints. | Scratch backend spec using `test.use({ originRepository })`, with the assertions of `story-review-completed.spec.ts`'s first case: published, completion equals the named revision, agent `Yui-chan`, `shared.txt` without `other-story.txt`, `+delivered on another machine`, `+story first` without `+other last`. Run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=<tmp> npx playwright test --config dashboard/backend.playwright.config.ts <scratch spec>`. 2026-11-19, at a9f8020b5. Spec reverted. | Passed, 1.2 s. |
| A declared Story Branch completion gives the same review. The history is: the story's merge of trunk (parents implementation, interleaving), the completion on the branch side, trunk's advance, and a trunk-first owning landing merge (parents advance, branch side) authored and committed by Yui. | Same as above. | Same scratch spec and command, also asserting that `integration-other.txt` is absent and that trunk's tip author is `Yui-chan`. 2026-11-19, at a9f8020b5. Spec reverted. | Passed, 2.6 s. |
| The real replay's shape is the one being declared. | Seed for the two rows above. | Scratch dump of `completedPublishedStory(origin, mode)` for both modes (graph, authors, name-status, done record, backlog), same command, 2026-11-19. Spec reverted. | Record fields: `schemaVersion`, `identity`, `title`, `completedAt`, `developer`, `agent`, `host`. Taken is emptied and the profile deleted. The commit sequence matches the rows above. |
| Declared conflicted merges are readable as conflicts. | Review merge-tree path. | Cited: the merged-review sibling, closed in e304fd695 (an ancestor of a9f8020b5), proved the conflict check in `story-review-commit-renames.spec.ts` (Intent Coverage Caught). | Settled for that form. The own-merge slice repeats the independent `merge-tree` check per case. |

Unverified remainder: the attribution, foreign-merge and own-merge shapes use
the same materializer facts (`parents`, `author`, `remove`, `agentProfiles`)
that the two observed rows exercise. Each slice's proof observes them.

## Ordered slices

Budget for every slice: 15 active minutes, excluding commands.

### 1. Ordinary completed reviews read a declared completion

Type: Behavior
Status: done

Behavior: a backend completed-review case starts from the declared ordinary
Trunk Mode or Story Branch history → its review answers, file diffs and later
fixed-after-advance checks are unchanged.

- Add `completionRevision` and the ordinary histories.
- Migrate both mode loops of `story-review-completed.spec.ts`. This includes
  the later developer's merge that carries the done record, which replaces
  `laterStoryMergesTrunk.ts`, and the configured-folder case.
- Migrate `story-review-completed-file-admission.spec.ts`.

Proof: those specs pass through the backend command in Local verification.
Accepted (reusable): `completionRevision` + `ordinaryTrunkModeCompletedHistory` /
`ordinaryStoryBranchCompletedHistory` / `ordinaryCompletedReviewHistories`;
`publishDeclaredTrunk` passes `declaredParents`. Backend
`story-review-completed.spec.ts` + `story-review-completed-file-admission.spec.ts`
(7 cases): published completion, agent Yui-chan, file isolation, story-branch
`branch completion` === `completion^2`, later-merge stability via
`laterDeveloperCarriesDoneRecord`, advance-after-read, configured-folder,
file-admission. Also `repository-*.test.mjs` and native-evidence-identity.

### 2. Gap and fallback reviews start from declared completions

Type: Behavior
Status: done

Behavior: a gap or fallback case starts from a declared completion. Its
shallow fetch, unusable retained capture or moved checkout is the visible
action → its gap, fallback and historical-choice answers are unchanged.

- Migrate the plain and Trunk Mode cases of
  `story-review-completed-gaps.spec.ts`, `story-review-historical-choice.spec.ts`
  and `story-review-completed-capture-fallback.spec.ts`.
- Have `keepUnusableCompletedCapture` take the named completion and its
  first parent instead of `rev-parse`.
- The missing-agent cases move with slice 3, and the own-conflict gap case
  with slice 5. Those deferred cases live in
  `story-review-completed-gaps-replay.spec.ts` until those slices.

Proof: those specs pass.
Accepted (reusable): `keepUnusableCompletedCapture` takes named `completion`
and first-parent `baseline` (no `rev-parse`). Ordinary trunk history via
`originRepository`; mid-test onto-tip via `ordinaryTrunkModeCompletionOntoTip`
+ `publishDeclaredTrunk`. Unusable-capture names a retired workspace path so
no readable worktree remains. Backend gaps + historical-choice +
capture-fallback (8) and deferred replay (3) passed.

### 3. Attribution reads declared takeover, return and agentless records

Type: Behavior
Status: done

Behavior: Akiho's declared takeover (the profile swap, then `takeover.txt`),
a declared return (Story A queued first again, its profile removed), return
then takeover, or a done record without agent, host and model → the
attribution and agent-recovery answers stay as they are today.

- Migrate those cases in `story-review-completed-attribution.spec.ts`,
  `story-review-completed-agent-recovery.spec.ts` and
  `story-review-completed-gaps.spec.ts`.
- Each agent-recovery precondition reads the declared record.
- Confirm that the backlog completion tests prove the CLI writes an
  agentless record after a return
  (`Distribution/tests/support/product-backlog-complete-profile.test.mjs`
  and its siblings). If none does, add that check there.

Proof: those specs pass, and so does the backlog completion check, run with
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <file>`.
Accepted (reusable): declared takeover / return / return-then-takeover /
missing-agent histories; agent-recovery reads declared agentless done
record; review recovers Yui-chan. Backlog credit test proves CLI
agentless-after-return (profile released before complete). `completedStoryHistory.ts`
at 248 — next foreign-merge shapes need a cohesive split or reorganization
before exceeding 250.

### 4. Another writer's merges are declared on trunk

Type: Behavior
Status: done

Behavior: another writer's declared merges on trunk → the attribution and
refusal answers are unchanged. The merges are:

- the conflict resolution on `unrelated.txt`;
- the non-owning resolution of `shared.txt`, in both modes;
- the octopus merge of two side branches;
- the inseparable rewrite of the story's line.

Migrate those cases in `story-review-completed-attribution.spec.ts` and
`story-review-completed-conflicts.spec.ts`. Each conflicted resolution is
confirmed independently with `merge-tree`.

Proof: those specs pass.
Accepted (reusable): `completedForeignMergeHistory.ts` + shared
`completedStoryThroughInterleaving.ts`; `declaredParentsConflict` in
`storyReviewTrunk.ts`. Unrelated / non-owning (both modes) / foreign octopus /
inseparable declared; merge-tree confirms conflicted parents.

### 5. The story's own integrations are declared merges

Type: Behavior
Status: done

Behavior: the story's own declared merges → the delivered file lists,
renames, trunk flags and driver reads are unchanged. The merges are:

- the conflicted integration with its merge edits (moved `agents/`,
  restored `agents/other.json`, the renamed check, `merge-resolution.txt`);
- a plain merge edit;
- an own octopus;
- a conflicted completion landing.

- Migrate `story-review-completed-conflicts.spec.ts` (own cases),
  `story-review-completed-merge-tree.spec.ts`,
  `story-review-completed-driver.spec.ts` (its printing driver stays the
  visible configuration), the own-conflict case of
  `story-review-completed-gaps.spec.ts`, and
  `e2e/review/story-review-completed-merge-edits.spec.ts`.
- Delete `storyReviewMergeDriver.ts`.

Proof: those backend specs and the E2E spec pass. `merge-tree` confirms each
conflict.
Accepted (reusable): `completedOwnMergeHistory.ts` with `freshYuiCompletion`
for Recently done's 30-day window; landing overlays `remove` trunk-only paths
so the tip matches merge-tree. Own-conflict / plain merge-edit / own octopus /
completion-conflict declared; driver config stays a visible harness action;
`storyReviewMergeDriver.ts` deleted.

### 6. Follow-up and review journeys read declared completions

Type: Behavior
Status: done

Behavior: a follow-up or review journey's completed story is declared, with
its `change` and `integrate` edits as revision files → the journeys' pages
and follow-up admissions are unchanged.

- Migrate `followUpCompletedFile.ts` and both
  `dashboard/backend-tests/launches/agent-launch-follow-up-file*.spec.ts`.
- Migrate the E2E `story-review-completed`, `story-review-follow-up`,
  `story-review-diff-line-follow-up` and `story-review-diff-add-note` specs.

Proof: those backend and E2E specs pass.
Accepted (reusable): `completedFollowUpHistory.ts` (rename / ordinary /
expand-context) with shared `freshYuiCompletion` for Recently done; backend
launches 9 + E2E journeys 6 passed. Retained snapshot still uses a visible
`agentWorktree`.

### 7. Intent's completed stories publish declared completions

Type: Behavior
Status: done

Behavior: Intent fixtures append the declared completion, with Intent
coverage where stated, through `publishDeclaredTrunk`, now with parents →
the Intent cases' done, provenance, comparison and follow-up answers are
unchanged.

- Migrate `intentCompletedStory.ts`, `retainedIntentCompletion.ts` (its
  retained landing records stay), `ciFollowUpScenario.ts`,
  `storyCiComparisonDoneFixture.ts`, `intentSummaryStoryComparisonFixture.ts`,
  the E2E intent specs that call the helper directly,
  `storyCiComparisonEarlierLanding.ts` and
  `storyCiComparisonSkippedLandingFixture.ts`.
- Run every spec those fixtures serve: `grep -rl` the fixture names under
  `dashboard/` and `e2e/`.

Proof: those backend, frontend and E2E specs pass.
Accepted (reusable): `intentCompletedHistory.ts` (`intentTrunkCompletionOntoTip`,
`retainedDeclaredStoryWorkspace`) plus onto-tip Story Branch helpers;
`landStoryBranchOntoTip` for landing overlays; Intent coverage via
`freshYuiCompletion({ intentCoverage })`. Consumer-trace ok; backend intent 308,
frontend CI comparison 7, E2E consumers 32 passed. Retained landings stay
`keepLaunchRecord` + `agentWorktree`.

Learnings: after `capturedChoice`, `git pull --ff-only` before
`publishDeclaredTrunk`; summary rename keeps
`summaryComparisonChangeRevision.remove` so trunk-first overlay does not
restore retired paths; keep Intent helpers in `intentCompletedHistory.ts`
rather than growing ordinary history modules past 250 lines.

### 8. Retire the replay helpers and document the declared completion

Type: Behavior
Status: done

Behavior: a developer reads the guides → they show how to declare a
completed story, and the replay helpers are gone.

- Delete `completedPublishedStory.ts`, `completedStoryInput.ts`,
  `completedStoryMerges.ts`, `laterStoryMergesTrunk.ts` and
  `story-review-uninterleaved-input.spec.ts`. Any refusal still needed
  becomes a builder check before Git.
- Remove `publishCompletedStoryLanding`'s Story Branch path and
  `advanceCompletedTrunk` if no consumer remains. `completeBacklogStory`,
  `commitBacklogCompletion` and `publishCompletedStory` stay for the siblings'
  families.
- Update `Distribution/tests/repository-test-data.md` (its completion
  paragraph) and `test-data-architecture.md`.
- Record a before and after comparison of two representative cases under
  ADR 0010: the ordinary Story Branch case and the own-conflict case. Compare
  construction lines, hidden steps and focused runtime, as a relative
  measurement under load.

Proof: `grep -rn` finds no importer of the deleted modules. Lint and the
dashboard typecheck pass. The whole `review/` and `launches/` backend
groups, and the E2E `review/` and `intent/` groups, pass.
Accepted (reusable): replay modules deleted; mid-test helpers in
`completedStoryVisibleActions.ts` (`advanceCompletedTrunk`,
`keepUnusableCompletedCapture`, `laterDeveloperCarriesDoneRecord`); guides
updated; ADR 0010 comparison in evidence. Grep clean; lint + typecheck;
backend review 186 + launches 389; E2E review 72 + intent 103. Launch/session
siblings keep `publishCompletedStory` Story Branch path.

Learnings: uninterleaved refusal not rebuilt (API gone); visible mid-test
actions stay outside declared-history modules; Story Branch CLI landing path
remains for retained launch completions.

## Concern review

Refinement was not needed. Each slice owns one family of declared shapes and
one proof loop, ordered so that each shape is built before the slices that
reuse it. Slice 8 is the only cleanup, and it depends on every consumer
having moved. No slice-specific concern remains. Slice 7's run list is
discovered by `grep`, not enumerated here, because it covers many fixture
consumers. That is a mechanical step, not an open premise.

## Local verification

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts.

- **Backend specs:** `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=<tmp> npx playwright test --config dashboard/backend.playwright.config.ts <paths>`.
- **E2E specs:** the same command with `--config e2e/playwright.config.ts` and
  `OPEN_DOUGH_E2E_PROOF_RECORD`.
- **Node checks:** `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <paths>`.
- **Lint and typecheck:** `npm run lint` and `npm run typecheck:dashboard`.

The `Distribution/tests/support` builder change is loaded by distributed and
native consumers. Run its repository builder tests,
`Distribution/tests/support/repository-*.test.mjs`, and the native
import-closure check
(`Distribution/evaluation/tests/native-harness/native-evidence-identity.sh`)
in slice 1, and again whenever it changes.

Run long local gates on awake macOS on AC with `caffeinate -s -i`. On battery,
follow the
[open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
