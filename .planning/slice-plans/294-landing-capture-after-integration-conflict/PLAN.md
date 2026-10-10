# A conflicted Story Branch integration still records its landing

**Identity:** SEED-088#landing-capture-after-integration-conflict
**Source:** [correction story](../../seeds/SEED-088-dashboard-story-code-review.md#landing-capture-after-integration-conflict),
written 2026-10-10 by the execution retrospective of
`SEED-088#review-merged-story-branch-changes` (story and plan 292 recoverable at
`1d2de5da4b38eb379caa25da45e9254c42949795`: `.planning/seeds/SEED-088-dashboard-story-code-review.md` and
`.planning/slice-plans/292-landed-story-branch-review/PLAN.md`; commits `3354d72b`, `f86c0dae`, `6207064d`, `08d9ee6e` on
`claude/review-a-story-branch-mode-story-s-changes-after`). Planning only; this
plan grants no Take, execution, or publication.

## Goal and boundaries

The reviewed story requires that “once remote trunk accepts the integrated SHA
the handoff records the pair”. That holds for a clean merge and a fast-forward.
It does not hold when the integration merge conflicts, and a launch that
publishes to trunk again after integrating is refused by its own instruction.
This correction closes those two gaps and removes the residue the review found.

Preserved: everything plan 292 delivered and proved: the capture context of a
claimed launch, the prepare rule (candidate is the workspace `HEAD` and
contains the branch tip), one fixed landing per launch, the `integrate` result
shapes for `published` and `already-accepted`, the review's listing rule and
words, and the one-shot capture and review.

Excluded: Trunk Mode; a second landing per launch.

## Current findings

1. **A conflicted integration has no route to capture.**
   `constructCandidate` (`history-preserving-candidate.mjs`) always detaches at
   fetched trunk and merges again, so a rerun after a hand-resolved merge
   discards the resolution. The agent then pushes the resolved merge by the
   prose under `publish-the-candidate.md#preserve-published-history`, nothing
   was retained before that push, and a later `integrate --landing-context`
   answers `already-accepted` with `landing.state: "unacknowledged"` and a
   missing `landing-current.json`. A plain content conflict also exits 2 with
   Git's stderr, while the guidance says the printed result is `published`,
   `already-accepted` or `preserved`.
2. **A later trunk publication of the same launch is refused.**
   `reportingInstruction.ts` tells the launch to supply `--landing-context` to
   “the installed publication command that lands on trunk”. After the
   integration is recorded, `reserveLandingComparison` refuses any other
   comparison, and `retainLandingComparison` throws before the push. A CI
   repair on trunk or the consumer resolution that
   `story-branch-integration.md` directs after integration meets this.
3. **Two specs prove the removed-worktree gap.**
   `story-review-story-branch-unavailable.spec.ts` drives a real claimed start
   (90 s bound) for facts the rule reads from the record and directory state;
   `story-review-nothing.spec.ts` asserts the same gap on a kept-record
   fixture.
4. **Names and squeezed files.** `dashboard/STORY-REVIEW-ONE-SHOT.md` is
   titled “Landed run review” under a one-shot file name; general helpers the
   story-branch specs import live in `dashboard/tests/support/oneShot*.ts`
   (`git`, `refs`, `capturedPublicationSchema`, `landingGitFault`,
   `retireLaunchWorkspace`, `readReview`, `startPreview`, `slug`); `install.sh`
   folded two comments onto shellcheck directive lines and
   `publish-the-candidate.md` runs one line long, each to stay at 250 lines.

## Current decisions

- **A resolved merge is published by `integrate`, not by hand.** When the
  workspace `HEAD` is a merge of fetched trunk's tip and the published tip,
  `integrate` takes it as the candidate instead of rebuilding it. Considered:
  a separate `--resolved` flag; rejected because the state is observable and a
  flag adds a way to be wrong.
- **A later trunk publication of the launch takes no context.** One fixed
  landing per launch stays; the instruction and handoff say so. Considered:
  letting the receiver ignore a later comparison silently; rejected because a
  silent skip hides a real mismatch.

## Observed premises

Slice 1's rows were observed on 2026-10-10 at `08d9ee6e` in the execution
worktree, in a scratch repository under the job's temporary directory. Slice
2's row was observed on 2026-10-11 at `adbe8755` in this story's preparation
worktree, by a scratch spec removed afterwards. The scripts and receiver files
these rows name are unchanged between the two revisions; no product file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A content conflict makes `integrate` exit 2 without a printed result and leaves the workspace detached with the conflict | Slice 1 | Bare origin; `main` and `story` each change `f.txt`; `node src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs integrate --workspace … --published-tip <B> --branch story --target-ref refs/heads/main` | stderr `Command failed: git merge --no-ff --no-commit <B>`, exit 2, `UU f.txt`, `HEAD` detached |
| A rerun after resolving and committing the merge discards the resolution | Slice 1 | Same repository: resolve, `git commit`, run the same command | Same failure, exit 2, `UU f.txt` again |
| A second comparison after an accepted landing is refused before its push, and the same publication without the context is accepted with the recorded pair kept | Slice 2 | Scratch spec on `claimedLaunchWithStoryCommit` (`dashboard/tests/support/storyBranchIntegration.ts`) against the real receiver: integrate and record; commit `repair.txt` in the workspace and push it to the story branch; run the installed `history-preserving-publication.mjs integrate --workspace … --published-tip <repair> --branch … --target-ref refs/heads/main --landing-context …`, then the same command without `--landing-context`; `npx playwright test --config dashboard/playwright.config.ts <scratch spec>` | With the context: exit 2, no printed result, stderr `This launch already retained a different landing comparison.` followed by a `Retained landing:` path and a `Retry reporting only:` `landing-prepare` command; origin `main` unchanged, workspace clean on its branch. Without it: `published`, `pushCount: 1`, origin `main` contains the repair, the record's `landing` equal to the first pair |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A hand-resolved conflicted integration is published and its pair recorded | Slice 1: node test in `closure-story-integration.test.mjs` on a real conflict (`preserved` with reason and state, then the resolved `HEAD` published with `beforePush` receiving its pair); `story-branch-landing-capture.spec.ts` gains the conflict journey against the real receiver, asserting `landing.state: "recorded"`, base = fetched trunk tip, revision = the resolved merge |
| The launch is told which publication takes the context, and a later trunk publication is not refused | Slice 2: `story-branch-landing-capture.spec.ts` publishes a trunk repair after the recorded integration as the instruction directs and asserts acceptance with the first pair kept; `reportingInputAssertions.ts` asserts the instruction's words |
| The removed-worktree gap keeps its coverage at lower cost | Slice 3: `story-review-nothing.spec.ts` asserts the option text, the Refresh transition and a later opening on the kept-record fixture; the real-start spec is removed |
| The landed-run document and shared helpers carry the general name | Slice 4: typecheck; the story-review, landing and Recently done specs; links from the dashboard documents and planning records resolve |

## Ordered slices

### 1. A resolved conflicted integration is published and recorded
Type: Behavior
Status: planned
Proof: The node test and spec journey above; `closure-story-integration*.test.mjs`
and `closure-story-branch-cleanup.test.mjs` stay green.

Behavior: A claimed launch holds a landing context; the published tip
conflicts with fetched trunk → `integrate` prints `preserved` with its reason
and the conflicted paths, exit 1, workspace left as Git left it → the agent
resolves and commits the merge → `integrate` run again takes that `HEAD` (a
merge of the fetched trunk tip and the published tip) as the candidate,
retains the pair, pushes, and records it. Trunk moving between the two runs
recomputes as a rejected push does today. `publish-the-candidate.md` and
`story-branch-integration.md` state the two steps in place of the manual push.

Safe stopping point: clean integrations behave as today.

### 2. A launch's later trunk publication takes no landing context
Type: Behavior
Status: planned
Proof: The spec above; today's refusal is recorded under Observed premises.

Behavior: A launch's integration is recorded → the same launch publishes a
later trunk commit → the instruction (`reportingInstruction.ts`) and the
handoff (`dough-land/references/dashboard-completion.md#retain-the-launch-landing`)
name the publication that takes the context, the one that first lands the
launch's work, so the later publication is made without it and is accepted;
the recorded pair is unchanged.

Safe stopping point: capture of the first landing is unchanged.

### 3. One spec proves the removed-worktree gap
Type: Structure
Status: planned
Proof: `story-review-nothing.spec.ts` with the moved assertions; the landed
and capture specs stay green.

Internal change: move the unique assertions of
`story-review-story-branch-unavailable.spec.ts` onto the kept-record fixture
and delete that spec. Owned directly by this correction (finding 3).

Safe stopping point: no behavior changes.

### 4. The landed-run document and shared test support are named for any launch
Type: Structure
Status: planned
Proof: typecheck; the specs importing the moved helpers; a search for the old
names and paths returns only one-shot-specific uses.

Internal change: rename `dashboard/STORY-REVIEW-ONE-SHOT.md` with its inbound
links (dashboard documents, spec comments, planning records), move the helpers
finding 4 names into launch-landing support modules, and split `install.sh`'s
declarations and `publish-the-candidate.md` on a cohesive seam so neither sits
at the limit. Owned directly by this correction (finding 4).

Safe stopping point: no behavior changes.
