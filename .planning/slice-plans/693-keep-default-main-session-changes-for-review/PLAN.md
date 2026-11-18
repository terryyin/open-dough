# Keep Default main ad hoc session changes for review

**Identity:** SEED-379#keep-default-main-session-changes-for-review
**Source:** [Keep Default main ad hoc session changes for review](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#keep-default-main-session-changes-for-review)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

When an ad hoc session that worked in the Default main checkout is marked
done, the dashboard keeps the commits made in that checkout while the session
was open, and **Review changes** on its Recently done entry shows them: one
exact comparison per uninterrupted run, without trunk work pulled in. The
source owns scope, deferred promises and examples. Excluded here: uncommitted
changes, a separate landing capture for default launches, a combined view of
interrupted runs, own-branch sessions, and capture before Done.

## Existing solutions and current decisions

Paths are under `dashboard/`.

- **Reuse the retained pair.** A run is a fixed `{base, revision}` in the
  checkout's common Git repository, kept by references as a landing is
  (`server/launchLandingGit.ts` `pinLanding`, `removeLandingPins`) and read by
  the pair read of `server/storyReviewLanded.ts` (`cat-file -t`, then
  `changedFrom`). Expose that pair read for a session run; add no second
  reader and no fetch.
- **Reuse session admission.** `sessionReviewRequest`
  (`server/storyReviewRequest.ts`) already admits project, host and session.
  A run is chosen by its position among the record's kept runs; file reads
  (`backend-tests/review/ad-hoc-review-file.spec.ts`) name a kept pair.
- **New fact, new home.** The record gains one optional fact for kept session
  commits (the common repository, the kept runs, whether the checkout was
  shared, when it was read) and, for a default launch, the checkout and
  revision it started from. `src/launchRecord.ts` is 244 lines,
  `server/launchRecordStore.ts` 249, `server/doneMarks.ts` 241,
  `server/launchRun.ts` 234 and `src/StoryReviewDiffLines.tsx` 237: schemas
  and capture go in their own modules, and no edited file passes 250 lines.
- **An established Default main session already holds its start**
  (`establishedSession` with role `default-checkout`, `startingRevision`).
  Only a default launch needs the new start; both feed one capture.
- **Capture rule.** From the checkout's `HEAD` log, take entries at or after
  the launch whose kind made a commit there: `commit`, `commit (amend)`,
  `commit (initial)`, `cherry-pick`, `revert`, and a rebase `(pick)` or
  `(continue)` whose subject and author time are those of such an entry. Keep
  the ones that are ancestors of the checkout's `HEAD` at Done: an amended or
  rebased commit survives only in its final form. Pulls, fast-forwards and
  merges make no session commit. A run grows while a session commit's first
  parent is the previous session commit; its pair is the first commit's first
  parent and its last commit. Runs are kept oldest first.
- **Shared checkout.** At capture, another kept record of the same project in
  the same checkout whose launch-to-Done time (or launch to now, while open)
  meets this session's marks the capture shared. A Claude default record
  names no workspace today (`src/establishedPlace.ts`); the retained start
  supplies it.
- **Done owns capture.** Every Done passes `setRecordDoneAt`
  (`server/doneSessionRecord.ts`, `server/doneMarks.ts`); capture follows a
  set Done there, replaces an earlier capture of the same record, and a
  failed read keeps Done and leaves no capture. Clearing Done
  (`server/joinedSockets.ts`) leaves the capture until the next Done.
- **One reflog reader exists** (`usageRevisionAt`,
  `server/historicalUsageStory.ts`) for usage recovery by revision; its
  meaning differs (which revision at a time), so capture gets its own read.
- **Retention.** Explicit deletion removes pins (`server/launchRecordDeletion.ts`);
  a record expiring 30 days after Done removes none today, landing pins
  included. Slice 8 releases a record's pins on both paths through one rule.
- Accepted [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  governs: machine-local evidence supplements the published view and claims
  no unobserved activity, which the shared-checkout note states. No conflict,
  no North Star topic.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The checkout's `HEAD` log separates commits made there from pulled work, keeps amend and rebase rewrites, and takes its times from `GIT_COMMITTER_DATE` | Slices 2–3 capture and their fixtures | 2026-11-18, scratch clone outside the workspace: `git reflog --date=iso-strict --format='%H %gd %gs'` and `git log --first-parent` after commit, ff pull, commit, amend, commit, `pull --rebase`, push | Entries `commit:`, `commit (amend):`, `pull … (pick):`, `pull …: Fast-forward` with the supplied times; creating entries ∩ ancestors of `HEAD` gave the three final commits in two runs; pulled commits never appeared as a creating entry |
| The real Default main checkout logs the same kinds | Same rule on a developer machine | 2026-11-18, `/Users/terryyin/git/open-dough`, `git reflog show HEAD --date=iso -n 400`, read-only | 267 `merge origin/main`, 84 `commit`, 12 `rebase (pick)`, 2 `commit (amend)`, 1 `revert`; `core.logAllRefUpdates=true` |
| A default launch keeps no start, workspace or landing; its review says not captured | Slices 1, 2, 4 | `src/unattachedSession.ts:25-37`, `server/unattachedStart.ts:118`, `server/storyReviewRequest.ts:83-88`; `backend-tests/review/ad-hoc-review-unavailable.spec.ts` case 1 | As stated at `591902853` |
| The server already reads the default checkout's `HEAD` at launch | Slice 1 | `server/defaultCheckoutChanges.ts:51-58` via `unconfirmedStart` (`server/launchStart.ts:105-113`) | Read, not kept |
| A Dough publication from the checkout leaves creating entries there | Key example 5, slice 3 | The publication commits with `git commit` (`Distribution/src/skills/dough-execute-plan/scripts/execution-increment-preparation.mjs:199`) and reconciles with `git rebase --onto` (`owned-suffix-reconciliation.mjs:81`) in its workspace. Proxy: the entries those two Git commands write were observed above (`commit:` and `(pick):` in the scratch clone; `commit:` then `rebase (start)`, `rebase (pick)`, `rebase (finish)` with one subject at 12:49:31–12:50:05 on 2026-11-18 in the real checkout). The rule reads only entry kinds, which Git writes whatever invokes it | Settled by proxy; the publication command itself was not run |

## Outside-in proof ownership and gates

Server behavior is proved in `backend-tests/review/` with
`serverMode: "boundary"`: a real fixture checkout
(`materializeLocalCheckout`), a default ad hoc launch through the fake host
(as `backend-tests/launches/agent-launch-ad-hoc-sessions.spec.ts`), commits
and pulls made with fixed `GIT_COMMITTER_DATE`, Mark as done through the
server (as `backend-tests/sessions/agent-launch-done-prompt.spec.ts`), then
`adHocReview` (`tests/support/adHocReview.ts`). Panel behavior is proved in
`frontend-tests/sessions/` beside `recently-done-ad-hoc-review.spec.ts`, with
`installFrontendStoryReview`. Before authoring a test apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and, for the
Frontend specs,
[dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md):
kept session commits and a checkout history with pulled work are builder
steps on `makeMe.aLaunchRecord` and `makeMe.aRepository`, not spec helpers.

Each Behavior slice proves discrimination once: a scratch break of its rule
fails its new case and the restore passes; record the fault and results here.
Each slice runs its changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/backend.playwright.config.ts <paths>`
(or `dashboard/frontend.playwright.config.ts`; the configured strict
reporter, exit code is the verdict), the existing
`backend-tests/review/ad-hoc-review*.spec.ts`,
`frontend-tests/sessions/recently-done-ad-hoc-review*.spec.ts` and
`backend-tests/sessions/agent-launch-done-*.spec.ts` as readers of the
changed record and review answer, `npm run lint`,
`npm run --silent typecheck:dashboard`, and the consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with `--term` for the review answer kind and the not-captured sentence. Local
gate: `caffeinate -s -i` on awake macOS on AC power; on battery the
maintained open-lid `caffeinate -i` procedure with the sleep log read, under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Default timeouts and retries stay; never `test.slow()`. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

| Promise (source) | Owning slice |
| --- | --- |
| Starting point retained at launch, blank launches included | 1 |
| Key example 1: one commit, plain push, trunk advances; readable after the commit leaves every branch | 2 |
| Key example 2: pulled work interrupts; two runs, neither with the story | 3 |
| Key example 3: amend and rebase kept in final form | 3 |
| Key example 5: lands through Dough from the checkout | 3 (the publication's Git shape) |
| Key example 6: no commits; unreadable log stays not captured | 4 |
| Key example 7: a session done before this story stays not captured | 4 |
| Key example 4: shared-checkout note | 5 (server), 6 (panel) |
| Context names session commits and the two revisions | 6 |
| Comparison switch lists runs oldest first, opens on the first | 7 |
| Kept for the record's lifetime and released with it | 8 |
| Review reads only the saved repository and writes nothing | 2 (HEAD and index unchanged, as `ad-hoc-review.spec.ts`) |

## Ordered slices

Each slice has 15 active minutes excluding command time.

### 1. Keep where a default launch started
Type: Structure
Status: done
Proof: `backend-tests/launches/agent-launch-ad-hoc-sessions.spec.ts` gains
the kept record's checkout and starting revision for a default launch with an
instruction and for a blank one; existing launch and review specs stay green.

A default launch in the Default main checkout keeps that checkout's path and
`HEAD` on its launch record, in a schema module of its own. No review or card
changes. Enables slice 2's capture.

Delivered: the record keeps `defaultStart: { workspace, startingRevision }`
(`src/defaultLaunchStart.ts`, read by `server/defaultLaunchStart.ts`), named
as `establishedSession` names its own. Learnings for later slices:
`defaultStart.workspace` is the project folder's path as configured, so
slices 2 and 5 resolve it before comparing checkouts; `recordedWorkspace` and
`establishedPlace` leave it out; `EstablishedRecordFacts`
(`server/launchRecord.ts`) now also carries a start that establishes nothing
and is renamed in slice 2, where capture reads both starts;
`src/launchRecord.ts` is at 247 lines. The named spec did not exist and was
created at `backend-tests/launches/agent-launch-ad-hoc-sessions.spec.ts`.
Proof: run records `s1-refactor-focused-1`, `s1-refactor-backend-readers-1`,
`s1-refactor-typecheck-1`, `s1-frontend-readers-1`, `s1-e2e-consumers-1` in
the checkout's evidence location.

### 2. Review the commit a Default main session made
Type: Behavior
Status: done
Proof: new `backend-tests/review/ad-hoc-session-commits.spec.ts`. Scratch
break: treat a fast-forward entry as a commit; the case fails on the pulled
file.

Behavior: a default launch commits once in the checkout and pushes → Mark as
done → the session's review answers that commit's comparison (its parent to
it), named as session commits with its launch and Done times and no run
choice. After trunk advances, the checkout is reset to another commit and
the session commit is on no branch, the same answer is read, with the
checkout's `HEAD` and index unchanged. An established Default main session
answers the same way when it holds no landing; one holding a landing keeps
answering its landing. Update `STORY-REVIEW-LANDED-RUNS.md` and
`AGENT-LAUNCH-COMPLETION.md` for the capture at Done.

Delivered: the record keeps `sessionCommits` (`src/sessionCommits.ts`:
the common Git directory, runs, optional `shared`, `readAt`), captured by
`server/sessionCommitsCapture.ts` after a set Done in `server/recordDoneAt.ts`
and pinned under `refs/open-dough/session-commits/<host>/<sessionId>/<n>/`
through `pinPair`/`removePins` (`server/launchLandingGit.ts`); the review
answers kind `session-commits` from `keptSessionRun`
(`server/storyReviewSessionCommits.ts`). Scratch break: a `Fast-forward`
entry accepted as a commit failed the first case on `pulled.txt`
(`s2-refactor-scratch-break-1`, exit 1); restored, `s2-refactor-backend-1`
exit 0. Learnings for later slices: the spec launches in the `origin`
fixture's project checkout, since a launch needs the configured checkout,
and work after the launch is a dated action in
`tests/support/sessionCheckoutWork.ts` (slice 3 extends it for amend and
rebase), while a stored capture is the builder step `keptSessionCommits`;
log times are whole seconds, so fixtures date their work after the launch;
an automatic Done captures when its native Done finishes and a manual Done
captures twice (`server/doneMarks.ts` lines 205 and 234), both settled in
slice 4 with G2 and G5; `src/launchRecord.ts` is at 249 lines.

### 3. Keep each uninterrupted run in its final form
Type: Behavior
Status: done
Proof: cases in `ad-hoc-session-commits.spec.ts` and a run-naming case in
`ad-hoc-review-file.spec.ts`. Scratch break: keep every creating entry
without the ancestor check; the amend case fails on a third run.

Behavior: commit, story landing pulled, commit → two runs, oldest first,
neither holding the story's file; the review opens the first and a named run
answers the second; a file read names a kept run's pair and is refused for
any other pair. Commit, commit amended, both rebased onto pulled trunk, push
→ one run of the two commits as pushed. A commit followed by
`git rebase --onto` fetched trunk and a push, the publication's shape, is
kept as its rebased commit. A commit made before the launch and
rebased during it is not kept.

Delivered: the capture rule needed no change. The `session-commits` answer
carries `commitRuns` (oldest first, each `{commits, subject, committedAt,
baseline, tree}`) and `commitRun` (the position answered); a session subject
takes `run=<position>`, and a file read without a reference is admitted
against the record's kept pairs
(`server/storyReviewHistoricalFileAdmission.ts`). The landed run list was
not reused: its runs carry a key, workflow, remote and target a session's
runs lack. Scratch break: with the ancestor check removed the amend case
failed on three runs (`s3-break`, exit 1); restored, `s3-refactor-backend-3`
exit 0. Learnings for later slices: zero runs still answers not captured
(slice 4 branches on an empty `runs`); the panel reads `commitRuns` and
`commitRun`, asks `run=<position>` and reads files by the selected run's
`baseline` and `tree` (slices 6–7; the landed `runs`/`selectedRun` stay
absent); two runs can share a subject and then differ by time; shared spec
support is in `tests/support/adHocReview.ts` (`establishDefaultMainSession`,
`markAdHocDone`, `adHocSessionFileDiff`) and
`tests/support/sessionCheckoutWork.ts` (`pullPublishedWork` with `how`,
`amendInCheckout`); `ad-hoc-review-file.spec.ts` is at 247 lines.

### 4. Say when a session made no commits
Type: Behavior
Status: done
Proof: cases in `backend-tests/review/ad-hoc-review-unavailable.spec.ts`.
Scratch break: answer the no-commit capture as not captured; the case fails
on its sentence.

Behavior: a session that edited files and committed nothing → Done → “This
session made no commits in the Default main checkout.” A checkout whose log
cannot be read at Done, and a record done without any capture, keep “This
session's changes were not captured.”; Done itself succeeds.

Delivered: a kept capture with no run answers the no-commit sentence
(`keptNoSessionCommits`, `server/storyReviewSessionCommits.ts`); a `HEAD` log
that yields no entry fails the capture as a log that cannot be read; a
reported Done captures when its native continuation starts
(`continueReported`, `server/doneMarks.ts`) and every Done captures once
(`setRecordDoneAt` skips the finishing write). Scratch breaks: the no-commit
capture answered as not captured failed its case on the sentence
(`s4-scratch-break`), and the empty-log rule disabled failed its case on a
kept `{runs: []}` (`s4b-scratch-break`); restored, `s4-refactor-review`
exit 0. Learnings for later slices: both sentences arrive as the review's
unavailable explanation, which slice 6 shows as given; removing only
`.git/logs/HEAD` leaves Git reading the branch's log, so the empty-log
fixture removes `.git/logs`; spec support gained `launchDefaultMainSession`
and `keptAdHocRecord` (`tests/support/adHocReview.ts`); `server/doneMarks.ts`
is at 244 lines.

### 5. Mark a capture from a shared checkout
Type: Behavior
Status: done
Proof: cases in `ad-hoc-session-commits.spec.ts`. Scratch break: ignore
records still open; the open-session case fails.

Behavior: two default launches open in one checkout both commit; either is
marked done → its answer holds the commits made while it was open and is
marked shared, whether the other is done or still open. A session in an
isolated workspace, or one done before this one launched, does not mark it.

Delivered: at Done the capture records `shared`
(`checkoutSharedMeanwhile`, `server/sessionCheckoutShared.ts`): another kept
session of the project names the same resolved checkout by its
`defaultStart` or recorded workspace, launched by this session's Done, and
is open or was done no earlier than this session's launch. The answer
carries `session.shared: true`, absent otherwise. Scratch break: records
still open ignored failed the open-session assertion (`s5-scratch-break`,
exit 1); restored, `s5-refactor-backend` exit 0. Learnings for later slices:
the panel reads `review.session.shared` (slice 6); the builder step
`keptSessionCommits` takes no `shared` yet; `keepLaunchRecords` replaces the
whole store, so stored records are kept before any launch.

### 6. Show session commits in the review panel
Type: Behavior
Status: done
Proof: new `frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts`.
Scratch break: drop the shared sentence; the case fails.

Behavior: Recently done → **Review changes** on a session with one kept run →
the panel's context is headed for session commits, says they were made in the
Default main checkout while the session was open, names the two revisions,
and, when shared, says in its own sentence that the comparison may include
another session's work; the file browser, counts and Close with focus return
behave as for a landing. The no-commit explanation is shown as the review's
explanation. Keep wording consistent with the landed context.

Delivered: `src/StoryReviewSessionCommitsContext.tsx` heads the context
“Session commits”, says “Commits made in the Default main checkout while
the session was open, launched … and done ….”, then “From base to
revision.” and, when shared, “Another session was open in the same checkout
during that time, so the comparison may include that session's work.” The
panel reads a run's files by session, baseline, tree and path, and offers
no notes or follow-up, as for a landed ad hoc review. Scratch break: the
shared sentence's condition inverted failed the shared case on visibility
(`s6-scratch-break`, exit 1); restored, `s6-refactor-frontend-1` exit 0.
Learnings for slice 7: the fixed snapshot view is keyed by completion or
reference, both absent here, so a run switch keys it by the run's tree;
`useStoryReviewSelection` keys runs by a string and asks `run=<key>`, while
session runs are positions; `StoryReview.tsx` (217 lines) shows the switch
only with landed runs or items; `frontendSessionCommitsReview` answers one
run with placeholder facts; the review substitute records each ask's query
(`queriesAsked`); `tests/storyReviewPages.ts` is at 236 lines, so switch
steps need another home.

### 7. Switch between a session's runs
Type: Behavior
Status: done
Proof: case in `recently-done-ad-hoc-session-commits.spec.ts`. Scratch break:
open on the newest run; the case fails.

Behavior: a session with two kept runs opens on the oldest; the Comparison
switch lists the runs oldest first, each named by commit count, last commit's
subject and time; choosing the second shows its files and revisions, Refresh
keeps the choice, and a delayed reply for the first cannot replace it. A
session with one run shows no switch.

Delivered: `SessionRunSwitch` (`src/StoryReviewSessionRuns.tsx`) renders the
landed switch's `ComparisonChoices` (`src/StoryReviewComparison.tsx`) with
one choice per run, labelled “N commit(s) — last subject — time”;
`useStoryReviewSelection` spells a run's position as its run key, so
`run=<position>`, Refresh and the stale-reply guard are the landed ones; the
fixed view is keyed by completion, then reference, then tree; an empty run
says “No changes: these session commits leave no difference.” Scratch
breaks: opening on the last run failed the first-run check
(`s7-scratch-break`), and a new answer always taking the answered run let
the late first-run reply replace the second (`s7b-scratch-break`); restored,
`s7-refactor-frontend-consumers-1` and `s7-refactor-e2e-landed-switch-1`
exit 0. Follow-up for wrap-up: `pages.sessionRuns.refresh()` and
`expectDescription()` (`tests/sessionRunSwitchPages.ts`) act on the Story
review as a whole and belong on `StoryReview` in
`tests/storyReviewPages.ts`, which at 235 lines must first be split by
responsibility (context expectations apart from file browser and diff).

### 8. Release kept commits with the launch record
Type: Behavior
Status: planned
Proof: cases beside the existing record-deletion spec for deletion and for
expiry. Scratch break: skip removal on expiry; the case fails on a remaining
reference.

Behavior: a kept record's run references exist while the record is kept;
deleting the record, or its expiry after retention, removes that record's
references, session runs and landing alike, from the saved repository and
leaves other records' references.

## Concerns and refinement

Refinement was not needed: each slice holds one outcome and proof loop, and
the eight slices are at the limit without exceeding it. This review
identified no remaining slice-specific concern.

## Story obligations

### G1. A default launch in a checkout Git cannot read keeps no start
Reported: slice 1 — "An unreadable checkout keeping no start has no test."
Story clause: "a session whose checkout log cannot be read at Done, keep the not-captured explanation."
Disposition: proved by slice 4: `dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts` "a default launch in a checkout Git cannot read keeps no start, is done, and says its changes were not captured" (the launch answers 200 with no `defaultStart`, Done succeeds, the review says not captured)

### G2. An automatic Done whose native continuation does not finish keeps no capture
Reported: slice 2 — "Capture happens when the reported native Done finishes. If that wait is abandoned, the server closes during it, or the host acknowledges locally, there is no capture until a later Done."
Story clause: "When the session is marked done, by the developer or automatically, its commits are kept with its launch record"
Disposition: proved by slice 4: `dashboard/backend-tests/review/ad-hoc-session-commits-done.spec.ts` "a reported Done whose rename wait a closing server abandons has kept its commits" (a reported Done captures when its native continuation starts, `continueReported` in `server/doneMarks.ts`; `acknowledgeDoneLocally` captures through `setRecordDoneAt`). Inspected remainder: a report recorded while the server is already closing, or a crash between the durable mark and the continuation's start, keeps Done without a capture until the report is redelivered or the session is marked done again, and the review then says not captured, as the story has for a log not read at Done

### G3. File reads of a session-commits pair are not admitted
Reported: slice 2 — "File diff reads for a session-commits pair are not admitted (`storyReviewHistoricalFileAdmission.ts` matches a landing reference only)."
Story clause: "Each uninterrupted run of those commits is one retained comparison, from the commit before the run to its last commit."
Disposition: proved by slice 3: `dashboard/backend-tests/review/ad-hoc-review-file.spec.ts` "a file read naming a kept run's pair of a session's commits is answered, and any other pair or path refused" (kept pair 200 with its diff; another pair and a path outside the pair 409), admitted by `server/storyReviewHistoricalFileAdmission.ts` against the record's kept runs

### G4. The panel shows session commits with worktree wording
Reported: slice 2 — "Until slice 6 the panel receives kind `session-commits` and shows it with worktree wording and no file diffs; these sessions previously said not captured."
Story clause: "The review's context names the comparison as commits made in the Default main checkout while the session was open, with its exact two revisions."
Disposition: proved by slice 6: `dashboard/frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts` unshared case (Session commits heading and context, "1 changed file", the chosen file's diff shown)

### G5. A repeated Done, a cleared Done and a failed read at Done are unobserved
Reported: slice 2 — "Untested Done rules: failed read keeps Done with no capture; a second Done replaces the capture; clearing Done leaves it."
Story clause: "the commits made in that checkout from its launch to Done, read from the checkout's local Git log."
Disposition: proved by slice 4: `dashboard/backend-tests/review/ad-hoc-session-commits-done.spec.ts` "a reopened session keeps its earlier capture until its next Done…" (after reopening the record still holds the first run; the second Done answers both commits from launch) and `dashboard/backend-tests/review/ad-hoc-review-unavailable.spec.ts` unreadable-log cases (Done 200, no capture)

### G6. A root commit among the session's commits fails the whole capture
Reported: slice 2 — "A root commit makes the whole capture fail."
Story clause: "a session whose checkout log cannot be read at Done, keep the not-captured explanation."
Disposition: no user cost "A developer can review what a future ad hoc session working in the shared Default main checkout changed": a root commit needs an orphan history in a checkout that had a HEAD at launch (`defaultLaunchStartFacts` keeps a start only when HEAD resolves), which trunk work in Default main does not make; the failed read keeps Done (`keptWithSessionCommits` in `server/recordDoneAt.ts`) and the review keeps the not-captured explanation.

### G7. File text, follow-up and note context of a session-commits pair are unobserved
Reported: slice 3 — "The file text endpoint for a session-commits pair is not observed; only the diff endpoint is, through the same admission function. Follow-up and note file context for a session-commits pair is not admitted, because that path requires a completion or reference."
Story clause: "The review's context names the comparison as commits made in the Default main checkout while the session was open, with its exact two revisions."
Disposition: proved by slice 6: `dashboard/backend-tests/review/ad-hoc-session-commits-file-text.spec.ts` (a kept pair answers both sides' text, another pair 409) and `dashboard/frontend-tests/sessions/recently-done-ad-hoc-session-commits.spec.ts` (the panel's diff and text reads carry the session, baseline, tree and path with no reference; `expectNoLineFollowUp` and `expectNoNoteActions`: a session subject offers no notes or follow-up, as the landed ad hoc review, `StoryReview.tsx` hides `StoryNotes` for it)

### G8. A session's own merge-resolution commit is not a session commit
Reported: slice 3 — "A session commit that is itself a conflicted-merge resolution (`commit (merge):` log entry) is not treated as a session commit by the rule and is not observed."
Story clause: "Trunk work pulled or merged in is left out, including where it changed another part of a file the session changed."
Disposition: no user cost "with other people's and other sessions' trunk work left out": a merge commit's comparison against its first parent is the trunk work merged in, which the story leaves out, so keeping it would bring that work into the review; the session's commits either side of it are kept as their own runs (`ad-hoc-session-commit-runs.spec.ts` merged-trunk case), and the capture rule in `server/sessionCommitsCapture.ts` reads only the log's entry kinds.

### G9. Run-position refusals and a run whose objects are gone are unobserved
Reported: slice 3 — "The `run` refusals (400 malformed, 404 past the end) are implemented but have no test. Run labels are read from the saved repository at answer time. If any run's objects are gone, the whole answer fails rather than answering unavailable; not observed."
Story clause: "otherwise the Comparison switch lists the runs, oldest first, and the review opens on the first."
Disposition: no user cost "A developer can review what a future ad hoc session working in the shared Default main checkout changed": the panel asks only for positions the answer listed (`commitRuns`), so a refusal is reached only by a hand-written request; every run's two commits are pinned at capture (`pinPair` in `server/sessionCommitsCapture.ts`) and stay until the record is released, so a kept run's objects leave the saved repository only with the record itself.

### G10. Another session with no known checkout does not mark a capture shared
Reported: slice 5 — "Records with no known checkout do not mark a capture: Claude default launches kept before slice 1, and records whose workspace no longer exists on disk. Records dropped by store retention before this session's Done cannot mark it."
Story clause: "When another session was open in the same checkout during that time, the context also says the comparison may include that session's work."
Disposition: no user cost "A developer can review what a future ad hoc session working in the shared Default main checkout changed": the story covers future sessions, and every session launched after slice 1 keeps its checkout (`defaultStart`, or its established or continuation workspace, read by `checkoutSharedMeanwhile` in `server/sessionCheckoutShared.ts`); a record leaves the store only 30 days after its own Done or by deletion, and a workspace missing from disk is not the Default main checkout a capture reads.

### G11. Refresh feedback, an empty run and the panel guide for session commits
Reported: slice 6 — "The Refresh feedback line and the hidden description for session commits are implemented but not observed by a test. A kept run with an empty comparison still shows the landing wording \"No changes: this session's delivered comparison is empty.\" `STORY-REVIEW-LANDED-RUNS.md` was not updated for the panel wording."
Story clause: "The review's context names the comparison as commits made in the Default main checkout while the session was open, with its exact two revisions."
Disposition: proved by slice 7: `dashboard/frontend-tests/sessions/recently-done-ad-hoc-session-runs.spec.ts` (Refresh feedback "Review refreshed: 2 changed files in the kept session commits."; the region's accessible description; the empty-run case "No changes: these session commits leave no difference.") and the session-commits paragraph of `dashboard/STORY-REVIEW-LANDED-RUNS.md`

### G12. A Refresh that answers fewer runs keeps the position, not the run
Reported: slice 7 — "Session run keys are positions, so a Refresh that returns fewer or reordered runs keeps the position, not the run. Cases not written: choosing back to the first run, and a Refresh after which the chosen position no longer exists."
Story clause: "otherwise the Comparison switch lists the runs, oldest first, and the review opens on the first."
Disposition: no user cost "A developer can review what a future ad hoc session working in the shared Default main checkout changed": a record's runs change only when a reopened session is marked done again (`keptWithSessionCommits` in `server/recordDoneAt.ts` replaces the capture at a set Done), and the review is offered on the Done entry in Recently done, so an open panel's runs stay as answered; a position past the end is refused by the server (`keptSessionRun`) and shown through the panel's existing failed-read feedback.
