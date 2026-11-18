# State only what the checkout's log shows in a session's review

**Identity:** SEED-379#state-only-what-the-checkout-log-shows
**Source:** [State only what the checkout's log shows in a session's review](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#state-only-what-the-checkout-log-shows)
**Source review:** [Source-only commitments](source-review.md)

## Goal and scope

A bounded correction of the session-commits review delivered by
Keep Default main ad hoc session changes for review (`6d9e4c3988b0ab41b5c07aa577976f29e6bca451:.planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md` (section `keep-default-main-session-changes-for-review`); its plan at
`6d9e4c3988b0ab41b5c07aa577976f29e6bca451:.planning/slice-plans/693-keep-default-main-session-changes-for-review/PLAN.md`):
the review holds the session's commits up to the Done it names, leaves merged
trunk work out, keeps the not-captured explanation wherever the checkout's
log does not settle what the session committed, describes itself in session
words, and leaves no residue in its references, tests and guides. It adds no
promise to that story and keeps its scope limits and deferred promises.

Provenance: the retrospective of plan 693's execution, commits `5cdf62a89`,
`e8e8d330f`, `aea269148`, `5218e202f`, `e46bab826`, `78152f9b7`, `bb05dcf79`
and `27664feb3` on `claude/keep-default-main-ad-hoc-session-changes-for-rev`,
reviewed at `27664feb3`.

## Findings this correction owns

Paths are under `dashboard/`.

1. **A later reported Done keeps the earlier capture.** A session reports
   quietly, commits again and reports again: the record's Done moves to the
   second receipt while its kept run is still the first commit, so the review
   names the later Done without the later commit, and `shared` is stale
   (`server/completionDelivery.ts` re-marks an automatically done record;
   `continueReported` in `server/doneMarks.ts`).
2. **An amended merge commit is kept as a session commit.** After a pull that
   merges, `git commit --amend` logs `commit (amend):` for a commit with two
   parents; the capture accepts it and the run then holds the merged trunk
   work (`server/sessionCommitsCapture.ts`, `committing`, `runsOf`).
3. **A commit the rule does not recognise reads as no commit.** A continued
   cherry-pick logs `commit (cherry-pick):`, an autosquash `rebase (fixup):`
   or `rebase (squash):`; none is accepted. Session commits that are not
   ancestors of `HEAD` at Done are dropped, and zero runs answers “This
   session made no commits in the Default main checkout.”
4. **Guides state superseded behavior.** `AGENT-LAUNCH-COMPLETION.md` still
   says an automatic Done whose rename wait is abandoned keeps no capture;
   `STORY-REVIEW-LANDED-RUNS.md` says only that a session without a landing
   was not captured, omitting the no-commit sentence and the kept-commits
   unavailable explanations.
5. **A session's unavailable review is described as a landed run.**
   `src/StoryReviewContext.tsx` gives every `landing-unavailable` review the
   landed-run description; the feedback says “kept session commits” where
   the description says “this session's fixed commits”.
6. **Review-level actions sit on the run-switch page object.**
   `tests/sessionRunSwitchPages.ts` holds `refresh()` and
   `expectDescription()`; `tests/storyReviewPages.ts` (235 lines) has no room.
7. **Overlapping and inward-looking cases.** The no-commit case of
   `frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts`
   repeats `recently-done-ad-hoc-review-gaps.spec.ts`; the last case of
   `backend-tests/review/ad-hoc-session-commit-runs.spec.ts` asserts the
   stored `runs` instead of the review; `kept-commits-release.spec.ts`
   releases only references it placed by hand; launch, commit and Done are
   spec-level helpers (`tests/support/adHocReview.ts`,
   `tests/support/sessionCheckoutWork.ts`, raw `git(...)` in specs).
8. **References outlive the capture that named them.** A second Done whose
   read fails removes the record's `sessionCommits` and leaves its earlier
   references, which `releaseRecordPins` then skips
   (`server/recordDoneAt.ts`, `server/launchRecordPins.ts`).
   `commit (initial)` is accepted and always fails at its parent read.

## Preserved promises and current decisions

- Every promise, scope limit and deferred promise of the reviewed story
  stands, with its proof in `backend-tests/review/ad-hoc-session-commit*.spec.ts`,
  `ad-hoc-review*.spec.ts`, `kept-commits-release.spec.ts` and
  `frontend-tests/sessions/recently-done-ad-hoc-session-*.spec.ts`.
- Done owns capture; a failed read keeps Done and leaves no capture; the
  review reads only the saved repository; capture's only write is its
  references. Accepted
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  governs: machine-local evidence claims no unobserved activity. No North Star
  topic applies.
- **One placing rule, not more recognisers.** The capture places every log
  entry since the launch that wrote a commit: a session commit (a commit,
  amend, cherry-pick or revert made there, or a rebase step's replay of one,
  matched by author time and subject as today); a merge (a second parent),
  never a session commit; a replay of a commit authored before the launch,
  not the session's. An entry it cannot place, or session commits none of
  which is an ancestor of `HEAD` at Done, fails the capture, which the
  existing failed-read path answers as not captured. Slices 2–4 extend this
  one rule in `server/sessionCommitsCapture.ts` (149 lines); a second module
  takes the placing if the file would pass 250.
- **A capture belongs to the Done it was read for.** Slice 1 gives
  `sessionCommits.readAt` its reader: a durable Done later than the kept
  capture's read is captured again. `defaultStart.startingRevision` stays
  unread by product code: the reviewed story promises the starting point is
  retained at launch, and this correction adds no use for it.
- **One word for the kept comparison.** A session's review says “kept”
  (“kept session commits”) in its description, feedback and guides; “fixed”
  stays the landed comparison's word.
- **Left as it is:** which checkout a record names keeps its three readers
  (`defaultMainStart`, `checkoutOf`, `recordedWorkspace` in
  `src/establishedPlace.ts`). They answer different questions (the Default
  main start of a capture, any session's checkout for the shared mark, the
  workspace a card and the replacement-writer block show), and plan 693
  slice 1 kept `defaultStart` out of `recordedWorkspace` so those two would
  not change.
- File sizes: no edited file passes 250 lines (`src/launchRecord.ts` 249,
  `server/doneMarks.ts` 244, `tests/storyReviewPages.ts` 235,
  `backend-tests/review/kept-commits-release.spec.ts` 243). New cases that
  do not fit go in a sibling spec named for the behavior.

## Decisive premises

All observed 2026-11-18 at `27664feb3`. The product observations ran as
scratch specs in this checkout, removed afterwards, the backend ones with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/backend.playwright.config.ts <scratch spec>`;
the Git observations ran in scratch repositories outside the workspace with
Git 2.50.1, the Git the capture runs.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A second quiet report is accepted on an automatically done record and moves its Done without a new capture | Slice 1 | `launchedAdHoc`, commit, `session.report({message: ""})`, commit, report again; record and review read 3 s after the Done moved | Done moved from the first receipt to the second; `sessionCommits.runs` and the review's `tree` stayed the first commit; `doneProblem` read “Native done mark is pending” then. Why the continuation did not capture is slice 1's first diagnosis |
| An amended merge is kept and brings merged work in | Slice 2 | `establishDefaultMainSession`, commit, `pullPublishedWork(…, {how: "merge"})`, `amendInCheckout`, Done, review | One run of 3 commits whose files hold `story.txt` beside `first.txt` and `amended.txt`. Git: `commit (amend):` on a commit with two parents |
| A continued cherry-pick and an autosquash write entries the capture does not accept, with the rewritten commit's author time and subject | Slice 3 | Scratch repository: conflicted `cherry-pick` then `--continue`; `commit --fixup`/`squash!` then `rebase -i --autosquash`; `git log -g --format='%gs \| %at %s'` | `commit (cherry-pick): <subject>`; `rebase (fixup): target` and `rebase (squash): target`, each with the target's author time and subject, so the existing replay match places them once their kinds are read |
| A session commit left on another branch answers the no-commit sentence | Slice 4 | `establishDefaultMainSession`, `git checkout -b side`, commit, `git checkout main`, Done, review | `{"kind":"landing-unavailable","explanation":"This session made no commits in the Default main checkout."}` |
| A second Done whose read fails leaves the earlier references and no capture | Slice 5 | `launchDefaultMainSession`, commit, Done, reopen by attaching, `.git/logs` moved away, Done again; `git for-each-ref refs/open-dough/session-commits/` | Record without `sessionCommits`; both `…/0/base` and `…/0/revision` still listed |
| The landed-run description is given to a session's unavailable review | Slice 7 | The no-commit case of `frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts` with a scratch `expectDescription("Read-only: this landed run's fixed delivered change from its captured base to its accepted revision.")`, run with the frontend config and `-g "made no commits"`, then restored | Exit 0: the session's no-commit review is described by the landed-run sentence (`reviewDescription`, `src/StoryReviewContext.tsx`) |

## Outside-in proof ownership and gates

Server behavior is proved at the boundary server in `backend-tests/review/`
(`serverMode: "boundary"`), with the fixtures the reviewed specs use: a
default launch or a session established in the project's Default main
checkout, dated checkout work
(`tests/support/sessionCheckoutWork.ts`), Done through the server, then
`adHocReview`. Panel behavior is proved in `frontend-tests/sessions/` with
`installFrontendStoryReview`. Before authoring or changing a test apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and, for the
Frontend specs and page objects,
[dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md),
with the [dashboard test guide](../../../dashboard/tests/README.md).

Each Behavior slice proves discrimination once: a scratch break of its rule
fails its new case and the restore passes; record the fault and results
here. Each Structure slice proves preserved behavior at its named specs.
Each slice runs its changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/backend.playwright.config.ts <paths>`
(or `dashboard/frontend.playwright.config.ts`; the configured strict
reporter, exit code is the verdict), `npm run lint`,
`npm run --silent typecheck:dashboard`, and the consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Slices that change capture or Done also run
`backend-tests/review/ad-hoc-session-commit*.spec.ts`,
`backend-tests/review/ad-hoc-review*.spec.ts` and
`backend-tests/sessions/agent-launch-done-*.spec.ts`, because every Done of
a Default main session reaches the capture. Local gate: `caffeinate -s -i`
on awake macOS on AC power; on battery the maintained open-lid
`caffeinate -i` procedure with the sleep log read, under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Default timeouts and retries stay; never `test.slow()`. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

| Finding | Owning slice |
| --- | --- |
| 1, and the `AGENT-LAUNCH-COMPLETION.md` sentence of 4 | 1 |
| 2 | 2 |
| 3: recognised kinds | 3 |
| 3: not captured instead of no commits; `commit (initial)` of 8; the stored-`runs` assertion of 7 | 4 |
| 8: references; the hand-placed release of 7 | 5 |
| 6 | 6 |
| 5; the `STORY-REVIEW-LANDED-RUNS.md` part of 4; the repeated frontend case of 7 | 7 |
| 7: spec-level launch, commit and Done | 8 |

## Ordered slices

Each slice has 15 active minutes excluding command time.

### 1. Keep the commits made up to a later reported Done
Type: Behavior
Status: done
Proof: case in `backend-tests/review/ad-hoc-session-commits-done.spec.ts`
(110 lines). Scratch break: capture a reported Done only when the record
holds no capture; the case fails on the missing second commit.

Behavior: a default launch commits and reports quietly, commits again and
reports quietly again → **Review changes** answers both commits up to the
second Done, with the shared mark read for that Done. A report redelivered
for the same Done reads nothing again. Diagnose first why the second
continuation does not capture (premise row 1), then make a durable Done
later than the kept capture's `readAt` capture again. Update
`AGENT-LAUNCH-COMPLETION.md` with the delivered rule for a reported Done.

Finding: an earlier native rename could suppress the later continuation,
and an already confirmed rename could make it ineligible. Capture admission
now follows the current automatic Done and the time its previous capture was
read. A failed attempt keeps its Done time without keeping a comparison.
Reads for the same session are serialized, and the store rechecks Done before
replacing its comparison. The guide on the claimed base already said that
capture survives an abandoned rename wait. Its delivered update explains
later quiet Done and same-delivery retry.

Proof: both later quiet-report cases failed on the first tree with the
planned scratch guard (exit 1). The restored backend review, Done and
completion specs passed, including the same-delivery retry after restart.
Manual Done, retained-review and quiet-report E2E consumers, plus dashboard
typecheck, passed. Commands, selected observations and consumer dispositions
are in `slice-1-return.md` and `slice-1-consumer-trace.md` in this checkout's
Git evidence directory. Close and late reported Done were rechecked in the
Done and quiet-rename specs after the formatter repair. Delivery gates the
slice on full lint and the commit hook's staged checks.

### 2. Leave a merge commit out of a session's runs
Type: Behavior
Status: done
Proof: case in `backend-tests/review/ad-hoc-session-commit-runs.spec.ts`
(210 lines). Scratch break: place a two-parent commit by its entry kind
alone; the case fails on the merged file.

Behavior: a session commits, a pull merges trunk work, and the session
amends the merge commit, then commits again → Done → the runs hold the
session's commits either side of the merge and neither holds the merged
file or the amended merge. The placing rule reads each written commit's
parents.

Proof: with the parent filter disabled, the amended-merge case returned
the merged and amended files in the first run (exit 1). After restoration,
the amended-merge, ordinary merge, pulled-landing, rewrite, Done and review
cases in the selected 18 backend specs passed. Dashboard typecheck passed.
Run and file observations, terminal records and consumer dispositions are
in `slice-2-return.md` and `slice-2-consumer-trace.md` in the Git evidence
directory.

### 3. Keep continued cherry-picks and autosquashed commits
Type: Behavior
Status: done
Proof: cases in a sibling spec
`backend-tests/review/ad-hoc-session-commit-rewrites.spec.ts`, with a
continued cherry-pick and an autosquash added to
`tests/support/sessionCheckoutWork.ts` (92 lines). Scratch break: read
`rebase (fixup)` as no session commit; the fixup case fails on the missing
commit.

Behavior: a session cherry-picks a commit with a conflict and continues →
Done → the picked commit is in its run. A session commits, commits a fixup
of it and autosquashes → Done → one run holding the commit in its squashed
form, with the fixup's change.

Proof: the deliberate omission of the fixup replay kind caused its real
Git and HTTP case to return an unavailable review (exit 1). After
restoration, the continued cherry-pick kept its conflict resolution and
both autosquash cases kept both files in one rewritten commit. All 20
selected backend specs and dashboard typecheck passed. Exact run records
and dispositions are in `slice-3-return.md` and `slice-3-consumer-trace.md`
in the Git evidence directory.

### 4. Say not captured when the log does not settle the session's commits
Type: Behavior
Status: done
Proof: cases in `backend-tests/review/ad-hoc-review-unavailable.spec.ts`
(200 lines) and the changed last case of `ad-hoc-session-commit-runs.spec.ts`.
Scratch break: let an unplaced entry fall out silently; the reworded-commit
case fails on the no-commit sentence.

Behavior: a session commits on another branch and returns the checkout to
trunk → Done → “This session's changes were not captured.” A session
commits and rewords that commit in a rebase → Done → not captured. A
commit made before the session and rebased during it → the review answers
“This session made no commits in the Default main checkout.”, asserted on
the review. `commit (initial)` leaves the accepted kinds, so a root commit
is an entry the rule cannot place.

Also settle G1 at review admission. A new Done whose capture is held or
unavailable must not present the previous Done's runs or no-commit result
under the new time. Prove at the HTTP review boundary that a held later read
gives the not-captured explanation until the current capture can answer.
Apply the same evidence rule to run and file-pair admission.

Proof: the old discard policy returned no commits for the lone reword and
the side-branch-only case, and a comparison for the partial reword. The
scratch bypass of Done admission exposed both older capture types while
Git was held. Both scratch runs failed their intended assertions (exit 1).
After restoration and correction of the fixture's capture timestamp, 24
selected backend specs, the three frontend consumers and dashboard
typecheck passed. `slice-4-return.md` and `slice-4-consumer-trace.md` retain
the commands, HTTP observations and dispositions in the Git evidence directory.

### 5. Release every reference a session's record kept
Type: Behavior
Status: done
Proof: cases in a sibling spec
`backend-tests/review/kept-commits-release-after-done.spec.ts`. Scratch
break: release only when the record holds `sessionCommits`; the failed
second read case fails on the remaining references.

Behavior: a default launch commits and is marked done, then its record is
deleted → the references that Done created are gone from the saved
repository. A session is done, reopened, and done again while its log
cannot be read → its earlier references are gone and the review says not
captured; deleting that record leaves none under its prefix. Release works
by the record's prefix in the repository its start names, whatever capture
the record holds.

Proof: gating release on a present capture left both earlier refs after
the unreadable-log Done (exit 1). With cleanup restored and the existing
legacy landing fallback preserved, 38 backend specs, nine E2E consumers
and dashboard typecheck passed. The real Done test compares the full ref
set, and the mixed-record tests cover preservation of neighboring refs.
Exact commands and dispositions are in `slice-5-return.md` and
`slice-5-consumer-trace.md` in the Git evidence directory.
The real Git alias case failed before comparing canonical repository paths.
The two release specs, reopened-Done spec and typecheck passed after that
correction.

### 6. Put the review's own actions on the Story review page object
Type: Structure
Status: done
Proof: `frontend-tests/sessions/recently-done-ad-hoc-session-*.spec.ts`,
`recently-done-ad-hoc-review*.spec.ts` and the frontend specs the consumer
trace lists for `tests/storyReviewPages.ts` stay green.

`tests/storyReviewPages.ts` is split by responsibility: context
expectations apart from the file browser and diff. `refresh()` and
`expectDescription()` move from `tests/sessionRunSwitchPages.ts` to
`StoryReview`. No product change. Removes the weakness that a review-level
action is reached through the run switch, and enables slice 7's description
case.

The review-toolbar story landed during execution. Use the merged state at
`82b6ed50e`, where `storyReviewPages.ts` is 250 lines and the run switch
opens review details through the shared control owner. Preserve details
visibility and all held-read observations when relocating review actions.

Proof: four Recently done frontend specs and both reached Side panel E2E
specs passed from the merged checkout, with the original held-response
assertions, exact run labels and reader focus. Dashboard typecheck passed.
`slice-6-return.md` and `slice-6-consumer-trace.md` retain exact commands,
consumer dispositions and observations, including the still-applicable
real Git run proofs.

### 7. Describe a session's unavailable review as a session's
Type: Behavior
Status: done
Proof: the no-commit case of
`frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts`,
repurposed. Scratch break: describe every unavailable review as a landed
run; the case fails on the description.

Behavior: Recently done → **Review changes** on a session that made no
commits → the panel's description names this session's kept commits, not a
landed run, beside its explanation; a session with a kept run is described
in the same words (“kept”). The explanation's display stays proved by
`recently-done-ad-hoc-review-gaps.spec.ts`. `STORY-REVIEW-LANDED-RUNS.md`
states the no-commit sentence and the kept-commits unavailable explanations.

The toolbar landed during execution and consumes the same comparison family.
Recently done intentionally projects private landing data out of the entry.
The review answer therefore carries an optional `comparison: "session-commits"`
on unavailable session commits. The accessible description and toolbar use
that value. Saved landing gaps keep their existing response and wording.

Proof: bypassing the unavailable-session family caused the selected
description assertion to read as a landed run (exit 1). Restored proof
passed six frontend specs, seven backend specs, two landed E2E specs and
dashboard typecheck. The saved landing and both unavailable session
producers have exact boundary observations. `slice-7-return.md` and
`slice-7-consumers-settled.md` retain the commands and consumer trace.
The independent test refactor kept the marker assertion at its producers.
The four affected backend specs passed again.

### 8. Drive a session's work in the checkout through one support owner
Type: Structure
Status: done
Proof: `backend-tests/review/ad-hoc-session-commit*.spec.ts`,
`ad-hoc-review*.spec.ts` and `kept-commits-release*.spec.ts` stay green
with unchanged case names, inputs and assertions.

Launching or establishing a session in the Default main checkout, its dated
work there and its Done are spread over `tests/support/adHocReview.ts`,
`tests/support/sessionCheckoutWork.ts` and raw `git(...)` in specs
(`ad-hoc-session-commits.spec.ts` imports six support modules). One
domain-named driver of a session's work in its checkout owns them, with
stored facts as MakeMe builder steps under
[test data architecture](../../../Distribution/tests/README.md#test-data-architecture).
No product change.

Proof: one Default main fixture owns the dated actions in nine specs.
The case audit preserved all 40 case title declarations and 119 assertion
statements. The 13 planned backend specs, the prompted/blank launch-start
spec and dashboard typecheck passed. Exact proof and consumer dispositions
are in `slice-8-return.md` and `slice-8-consumer-trace.md`.
The independent refactor reused the driver's checkout edit and unified
the retained-record fixture's origin. Three affected backend specs,
typecheck and the unchanged-case audit passed again.

## Story obligations

### G1. A later Done can show the previous Done's capture while its read is pending
Reported: slice 1 — "The Done write keeps the earlier capture while the new read is pending. Review admission can put the later Done time beside the old comparison or its no-commit answer. The two dashboard processes that share the store can defer the new read when the same-session lock wait expires."
Story clause: "the review holds the session's commits up to the Done it names"
Disposition: proved by slice 4: dashboard/backend-tests/review/ad-hoc-session-commits-pending-done.spec.ts observes both prior capture forms withheld while Git is held, historical file and text refusal, and the later comparison after release.

### G2. Two directory names can identify one kept repository
Reported: slice 5 — "Comparing saved common-directory path strings can delete the newly captured pair when the previous path still aliases the same Git repository."
Story clause: "the review holds the session's commits up to the Done it names"
Disposition: proved by slice 5: dashboard/backend-tests/review/kept-commits-release-after-done.spec.ts observes the newly kept pair after a real Git directory move leaves the previous path as an alias.

## Execution context

- Hibiki-chan, Story Branch Mode, `codex/state-only-what-the-checkout-s-log-shows-in-a-se`.
  Publisher `dashboard-territory.local-open-dough`. Take
  `730571d29023631e33ef8bb8da3260fa6eb1fcd7` was accepted on `origin/main`
  and published to the execution branch. Starting revision
  `e80a106962a3fed8820b0b2c50c5c053d0e9155d`.
- Execution checkout `/Users/terryyin/git/open-dough/.worktrees/state-only-what-the-checkout-s-log-shows-in-a-se`.
  Integration checkout `/Users/terryyin/git/open-dough`. Locked install,
  dashboard typecheck and native Chromium prerequisites succeeded in the execution checkout.
  Replanning retains existing authority.
- GitHub Actions `ci.yml` (`CI`), repository `terryyin/open-dough`, execution branch
  above. Codex observer `hibiki-seed-379-1ad3583f`, mailbox
  `/tmp/dough-ci-501/watch-iasTzS`, PID 79402, session 16076, cell `g39:11`.
- Before slice 6 the story branch merged `origin/main` at `b34318530` through
  the backlog merge adapter. The review toolbar and details accepted at
  `7900ff735` now supply the frontend starting point. Published story
  commits are preserved. The merge is included with slice 6's candidate.

## Concerns and refinement

Refinement was not needed: each slice holds one outcome and proof loop, the
placing rule is one model that slices 2–4 extend, and the eight slices are
at the limit without exceeding it. This review identified no remaining
slice-specific concern.
