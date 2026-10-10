# A Story Branch Mode story's changes stay reviewable after they merge

**Identity:** SEED-088#review-merged-story-branch-changes
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#review-merged-story-branch-changes),
refined 2026-10-10. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A developer reviewing a story executed in Story Branch Mode from the dashboard
can review its combined delivered changes after its branch merged to trunk and
its worktree and branches are retired, in the review the dashboard already
gives a landed one-shot run. The capture that the one-shot landing already
performs at publication becomes the capture of any dashboard-started launch's
trunk landing; wrap-up's Story Branch integration records its pair through it;
the review lists the integration among the story's landed runs.

Preserved: one-shot capture, its receipts, retries and retention; the
workspace review's opening rule (a readable workspace first, otherwise the
newest captured comparison); Mark reviewed hidden on a landed comparison; no
baseline guessed and no substitute files for an uncaptured landing.

Excluded, as the story records: durability beyond launch-record retention or
across machines; an integration run without the launch's landing context;
opening on the landed comparison while an integrated workspace is still
present; Trunk Mode's many landings per launch; back-filling stories landed
before this capability.

## Architecture

The delivered one-shot landing specialised one general fact, a launch's
accepted trunk landing, to its case. This plan generalises it in place rather
than adding a parallel path for Story Branch Mode:

| Specialised today | Becomes |
| --- | --- |
| `completionReporting.ts` writes `landing-context.json` and the capture authority only when `isEstablishedOneShot(established)` | Every established start or preparation naming a trunk target gets both; the one-shot predicate no longer decides capture |
| `verifyLanding` on prepare requires the candidate to be the authority workspace's `HEAD` with its branch checked out | The candidate is the workspace's `HEAD` and contains the launch's branch tip: a one-shot tip, a fast-forwarded tip, or a detached integration merge whose second parent is that tip |
| `publishExecutionIncrement` alone retains and captures through `landingContext`; `publishHistoryPreservingCandidate` has no hook and calls `beforePush` once | Both publishers retain `{candidate, suffixBase}` before every push attempt and capture after acceptance; the integration's base is the fetched trunk tip it merged onto |
| `reviewOneShotRunsOf` lists only one-shot launches; the selector says “Landed one-shot runs” and the context “Landed one-shot run” | The list holds every launch with a captured landing, and a claimed launch whose workspace is gone (its evidence gap); the words are “Landed runs” and “Landed run”, each entry named by workflow, launch time and accepted revision as today |

Names that say one-shot while describing any launch's landing follow the
concept (`oneShotLandingSchema`, `ReviewOneShotRun`, `reviewOneShotRunsOf`,
`landingRefPrefix`'s `one-shot` path segment stays, since existing pins use
it). Specs that drive one-shot journeys keep their names. A launch keeps one
fixed landing fact; Trunk Mode's list of landings is the sibling story's.
No North Star topic is needed: the direction is a generalisation of built
design, and the dashboard docs the slices update carry it. No Accepted ADR
constrains it; [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
governs the guidance wording in slice 3.

## Current decisions

- **The integration gets a script entry.** Wrap-up's Story Branch integration
  is prose today (`publish-the-candidate.md#preserve-published-history`); only
  tests call `publishHistoryPreservingCandidate`. Pairing a prepare before each
  push with a record after acceptance is mechanical and easy to get wrong by
  hand, so slice 3 exposes the module as `history-preserving-publication.mjs
  integrate` with `--landing-context`, mirroring `deliver`'s flag, and the
  guidance names it. Observer registration, the completion operation and
  retirement stay with their existing steps and take the printed receipt.
  Considered: having the agent run the reporting command's `--operation
  landing-prepare` and `landing` by hand; rejected for the reason above.
- **Which claimed launches are landed runs.** A claimed launch is listed as a
  landed run when it holds a captured landing, or when its workspace is no
  longer available (then as the evidence gap the story's example names). An
  active claimed launch with a readable workspace and no landing is not a
  landed run, so “Landed runs” never lists work that has not landed.
- **Capture authority for a claimed launch** is the same shape as a
  one-shot's: common Git directory of the workspace, workspace, branch,
  identity, remote, `refs/heads/<target>`. The worktree shares the project's
  repository, so the pinned pair survives retirement as it does for one-shot.

## Observed premises

Observed on 2026-10-10 at `b080c2bb` in this worktree; no product file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A detached integration merge's first parent is the fetched trunk tip, that tip is an ancestor of the merge, and the diff between them lists only the story's files | Slices 3, 4 | Scratch repository: trunk `T0`, story commit `B`, trunk `T`; `git checkout --detach T`, `git merge --no-ff B` | Subject `Merge commit '<B>' into HEAD`; `HEAD^1 == T`; `merge-base --is-ancestor T M` and `B M` both true; `git diff --name-only T M` is the story's file alone |
| Today's prepare verification refuses a detached candidate | Slice 3 | `git symbolic-ref --short HEAD` on the detached scratch checkout, the call `verifyLanding` makes under `prepare` | `fatal: ref HEAD is not a symbolic ref`, exit 128, so the prepare throws “not the established one-shot workspace candidate” |
| Capture context is prepared only for one-shot launches | Slice 2 | `reportingContext` in `dashboard/server/completionReporting.ts` gates authority and `landing-context.json` on `isEstablishedOneShot(established)`; `launchRun.ts` passes `establishedFacts(start.handoff.established)` for a claimed start, whose schema carries identity, workspace, branch, remote, target | Read; the claimed start has every field the authority needs |
| The integration publisher has no landing hook | Slice 3 | `publishHistoryPreservingCandidate` in `history-preserving-publication.mjs`: `beforePush` runs only when `attempt === 0`, no `landingContext`, no CLI entry; `publishExecutionIncrement` retains with `retainLandingComparison` and captures with `captureAcceptedLanding` | Read |
| Wrap-up guidance names no script for the integration | Slice 3 | `grep` for `publishHistoryPreservingCandidate` and `history-preserving-publication` outside tests: only the module itself and `closure-story-fast-forward-cases.mjs` | Prose-only step today |
| Skill-level node tests have no landing receiver | Slice 3 | `grep landing` over `one-shot.test.mjs`, `execution-increment-delivery-target.test.mjs`, fixtures | Capture is proven only in Playwright specs against the real receiver (`one-shot-landing-capture*.spec.ts`) |

The record step's verification (`revision` is an ancestor of the fetched
target) holds for an accepted integration by construction; slice 3's spec
observes it.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| One-shot capture and review unchanged under the general names | Slice 1: `one-shot-landing-capture*.spec.ts`, `one-shot-landing-recovery*.spec.ts`, `story-review-one-shot*.spec.ts`, `recently-done-one-shot-review.spec.ts`, dashboard typecheck |
| A claimed Story Branch Mode execution launch carries the landing capture | Slice 2: new spec on the real claimed start asserts the kept record's `reporting.landingContext`, the context file's identity, remote and `refs/heads/main`, the attempt's `landingRepository`, and the instruction's reporting block naming the context; a one-shot launch's block unchanged |
| The integration records base = fetched trunk tip, revision = accepted integrated SHA, before retirement; a detached candidate containing the branch tip is prepared, another is refused | Slice 3: new spec drives `integrate --landing-context` on a real claimed launch after trunk advanced, reads the record's `landing` and pinned refs, then a candidate not at the workspace `HEAD` through `--operation landing-prepare` is refused; node test on the module asserts `beforePush` receives `{candidate, suffixBase}` on each attempt including after a rejected push |
| Trunk changes merged during execution stay out; a fast-forward integration compares from the fetched tip | Slice 3 spec: files listed equal `git diff --name-only T M`, a trunk-only file absent; the fast-forward case in `closure-story-fast-forward-cases.mjs` asserts the retained base |
| The review opens the landed integration from the done card after retirement, lists it with one-shot runs under “Landed runs”, hides Mark reviewed, and keeps the fixed pair after trunk moves | Slice 4: new spec continues slice 3's journey through `worktree-retirement.mjs` and a done record, reads the review answer (`kind: "landed"`, baseline `T`, tree `M`) and the panel's words; the one-shot choice specs updated to the new words |
| A retired claimed launch without capture explains the gap and lists no files | Slice 4 spec with a kept claimed record whose worktree is removed |
| Executing-agent guidance states the general rule and the command | Slice 3: `ci-completion-lifecycle-guidance.test.mjs` and the wrap-up closure tests stay green; wording consumers listed in slice 3 updated |

## Ordered slices

### 1. Landing capture and landed runs are named for any launch
Type: Structure
Status: done
Proof: The one-shot capture, recovery, retention, review and Recently done
specs above stay green; `npm run typecheck:dashboard` clean.

Internal change: rename the shared landing schema, run model and types from
one-shot to the launch's landing (`src/oneShotLanding.ts`,
`src/storyReviewOneShot.ts` and their importers in `server/` and `src/`),
and give `completionReporting.ts` one predicate, “this established context
captures a landing”, in place of the inline `isEstablishedOneShot` test, still
true for one-shot alone. Keep `landingRefPrefix`'s path. Leave user-facing
words for slice 4. Enables slice 2, which widens the predicate.

Safe stopping point: no behavior changes.

Delivered: `launchLandingSchema`/`LaunchLanding` in `src/launchLanding.ts`,
`reviewLandedRunsOf`/`ReviewLandedRun` in `src/storyReviewLandedRun.ts`,
`server/launchLanding{Admission,Git,Record,Reporting,Reservation,Retained}.ts`,
and the predicate `establishedCapturesLanding` in `src/launchRecord.ts`.
Accepted proof: typecheck clean; the named one-shot specs (20 tests) and the
other story-review, agent-completion, launch-boundary, session-refusal,
launch-record and session-result-admission specs (119 tests) green.

Learnings for later slices:

- The predicate is a type guard narrowing to the one-shot variant and gates
  both `completionReporting.ts` and `launchLandingAdmission.ts` (expired-attempt
  landing admission had the same inline test). Slice 2's widening therefore
  widens its return type too, and admits a claimed launch's landing submission.
- Refusal messages shown once claimed launches reach capture still say
  “established one-shot launch's authorized landing” (`launchLandingAdmission.ts`,
  `launchLandingReporting.ts`, `launchLandingReservation.ts`) and “established
  one-shot workspace candidate” (`launchLandingGit.ts`); slice 3 gives them the
  general words with the prepare rule it changes.
- `reviewRunChoice` reads `remote` and `target` from the one-shot-narrowed
  type; slice 4 needs them from the claimed variant.

### 2. A claimed Story Branch Mode launch carries the landing capture
Type: Behavior
Status: done
Proof: New spec `story-branch-landing-context.spec.ts` on the real claimed
start (as `agent-launch-session-refusal.spec.ts` starts one); the one-shot
capture-binding spec for the unchanged one-shot block.

Behavior: The dashboard starts an execution launch for a queued story in
Story Branch Mode (standard tracking) → the start establishes the claim and
workspace → the kept record's `reporting.landingContext` names a file holding
project, host, launch reference, identity, remote and `refs/heads/<target>`;
the attempt holds the capture authority (common Git directory, workspace,
branch); the instruction's reporting block says to supply `--landing-context`
to the installed publication that lands on trunk (`reportingInstruction.ts`
drops “one-shot” from that sentence, and the no-capture sentence applies to
any launch that would land). A one-shot launch's block is unchanged; an ad hoc
launch without instruction still has none.

Consumers: `reportingInputAssertions.ts`, `one-shot-landing-capture-binding.spec.ts`
(wording), `established-start-guidance.test.mjs` if it quotes the block.

Safe stopping point: a claimed launch carries context nothing consumes yet;
publication to the story branch does not touch it.

Delivered: `reportingContext` prepares the context and capture authority for
every established start or preparation and returns them together
(`PreparedReporting`); `launchRun.ts` keeps both on the attempt in one write;
the `establishedCapturesLanding` predicate, now always true, is gone. The
instruction says “For this launch, supply --landing-context <file> to the
installed publication command that lands on trunk”, one sentence for one-shot
and claimed launches alike, so the one-shot block differs by those words.
The dashboard establishes only Story Branch Mode claimed starts
(`executionStart.ts`), so no Trunk Mode launch gains a context. A claimed
refinement preparation gains one as the Architecture row says.
`retainLandingSettlement` leaves the records file untouched when no kept
record is bound to the attempt.
Accepted proof: `story-branch-landing-context.spec.ts`; typecheck; every spec
under `dashboard/tests` in three batches, with
`production-watcher-exclusions.spec.ts:26` failing once in a batch and passing
alone (load average 25–40; it reaches no changed code; suite stability under
load is SEED-123's).

Learnings for later slices:

- The attempt answer now carries `landingRepository` for owned attempts.
- Slice 4's list decides explicitly whether a claimed refinement with a
  captured landing is a landed run; the plan's rule (“every launch with a
  captured landing”) lists it.

### 3. The Story Branch integration records its delivered pair
Type: Behavior
Status: done
Proof: New spec `story-branch-landing-capture.spec.ts`: real claimed launch,
a story commit pushed to its branch, a trunk commit from another writer, then
`node <installed>/dough-execute-plan/scripts/history-preserving-publication.mjs integrate --workspace … --published-tip <B> --branch … --target-ref refs/heads/main --landing-context <file>`
from the machine; assert `classification: "published"`, `landing.state:
"recorded"`, the record's `landing.base` equals the fetched trunk tip before
the push and `landing.revision` the accepted merge, pinned refs present,
`git diff --name-only base revision` equals the story's file alone; then a
`--operation landing-prepare` naming a revision that is not the workspace
`HEAD` is refused. Node test in `closure-story-integration.test.mjs` (or the
fast-forward cases) asserts `beforePush({candidate, suffixBase})` on each
attempt, with `suffixBase` the fetched tracking tip of that attempt, and the
fast-forward case's base.

Behavior: A claimed launch holds a landing context; its final closure tip is
on the remote execution branch; fetched trunk advanced → the coordinator runs
`integrate` with the context → the module merges the tip onto fetched trunk
(fast-forward or merge, through the backlog adapter when touched, as today),
retains `{candidate, suffixBase: fetched trunk tip}` before each push
attempt, re-prepares after a rejected push with the new tip, pushes, and after
acceptance records the pair; the result carries `receipt` and `landing`
(`recorded`, or `unacknowledged` with the retry command, Git acceptance kept).
Without `--landing-context` the module behaves as today. The dashboard's
prepare accepts the candidate because it is the authority workspace's `HEAD`
and contains the launch's branch tip (`verifyLanding` in
`oneShotLandingGit.ts`, renamed in slice 1), and still refuses a candidate
that is not that `HEAD`.

Guidance for the executing agent: `publish-the-candidate.md#preserve-published-history`
and `wrap-up-closure-publication.md#observe-story-branch-integration` name
the `integrate` command and the landing context; `dough-land/references/dashboard-completion.md`'s
“Retain the one-shot landing” becomes the general landing rule (anchor
consumers: `dough-land/SKILL.md`, `publish-the-candidate.md`, `one-shot.md`,
`dough-story-refinement/references/one-shot-refinement.md`);
`dough-story-wrap-up/SKILL.md#integrate-committed-story-branch-mode-closure`
tells the coordinator to pass the supplied context. Guidance tests:
`ci-completion-lifecycle-guidance.test.mjs`, `closure-story-branch-cleanup.test.mjs`,
`closure-story-integration*.test.mjs`.

Safe stopping point: captured landings exist in records; the review does not
list them until slice 4, and no existing view regresses.

Delivered: `publishHistoryPreservingCandidate` takes `landingContext`, retains
`{candidate, suffixBase}` before every push attempt, records the accepted pair,
and returns `landing`; `integrate` is its CLI (exit 1 on `preserved`, 2 on an
error). An `already-accepted` run with a context records the pair retained
before the accepted push, so a rerun after a lost push answer recovers. The
prepare rule is: the candidate is the workspace `HEAD` and contains
`refs/heads/<branch>`. Refusals say “the established launch's authorized
landing” and “the established launch's workspace candidate and commit
comparison”. The guidance heading is “Retain the launch landing”.
The refactor pass split candidate construction into
`history-preserving-candidate.mjs`, moved the wrap-up integration detail to
`dough-story-wrap-up/references/story-branch-integration.md` (both declared in
`install.sh`), shared one flag reader (`flagValues` in `ci-direct-entry.mjs`)
with `deliver`, and put the claimed-launch journey in
`dashboard/tests/support/storyBranchIntegration.ts` for slice 4.
Accepted proof: `story-branch-landing-capture.spec.ts` (recorded pair on a
detached merge after trunk advanced, not-`HEAD` prepare refused, pins, diff
names, rerun `already-accepted`; fast-forward; lost push answer →
`unacknowledged` with the reporting-only retry, then recorded);
`closure-story-integration.test.mjs` and the fast-forward cases for
`beforePush` per attempt; guidance, payload and link checks; the one-shot
capture, recovery and review specs; typecheck.

Learnings for slice 4:

- A claimed record's `landing` has a one-shot's shape, its pins under the same
  prefix, and `landing.repository` is the project's common Git directory.
- After `integrate` the worktree is back on its branch at B while trunk is at
  M; retirement takes the accepted SHA from `receipt.sha`.
- Restarting a preview server on the same port over the same machine directory
  keeps the claimed record, which serves the Refresh-after-trunk-moves case.

### 4. The review shows a landed Story Branch integration
Type: Behavior
Status: done
Proof: New spec `story-review-story-branch-landed.spec.ts` continuing slice
3's journey: retire the worktree and branches with
`dough-land/scripts/worktree-retirement.mjs`, publish a done record for the
identity (as `recently-done-one-shot-review.spec.ts` does), open Recently
done's card → Review changes; assert the answer `kind: "landed"` with
`baseline` = `T`, `tree` = `M`, the files, the heading “Landed run”, the
“Execution launched …” line, the target, both revisions, no Mark reviewed;
Refresh after trunk advances keeps the pair. Same spec, second case: a kept
claimed record whose worktree is removed and that holds no landing → the
review explains the uncaptured comparison and lists no files. The one-shot
choice specs assert “Landed runs”; `story-review-one-shot.spec.ts` asserts
“Landed run”.

Behavior: A story's kept launches include a claimed launch with a captured
landing → Review changes on its active or done card → with no readable
workspace, the review opens on that landing; with a readable workspace it
opens on the workspace and the Comparison switch offers “Landed runs” listing
it beside one-shot runs, newest first, each by workflow, launch time and
accepted revision. A claimed launch is a landed run when it holds a landing or
its workspace is unavailable; a retired one without capture shows the evidence
gap. Words: selector “Landed runs”, context heading “Landed run”
(`StoryReviewComparison.tsx`, `StoryReviewLandedContext.tsx`), consistent in
`dashboard/STORY-REVIEW-ONE-SHOT.md`, `AGENT-LAUNCH-REVIEW.md`,
`AGENT-LAUNCH-HISTORY.md` and `AGENT-LAUNCH-COMPLETION.md`, which also state
the claimed-launch capture and the general prepare rule.

Safe stopping point: the story's outcome is delivered.

Delivered: `reviewLandedRunsOf` lists every one-shot launch and a claimed
launch that holds a landing or whose workspace directory is missing (an
unreadable but present workspace stays with the workspace review). A removed
claimed worktree with no landing now shows the evidence gap in place of “The
worktree is missing”. Refresh of an open workspace review whose workspace has
gone follows the run the answer opened on. Words: “Landed runs”, “Landed
run”, “This run has no captured landing comparison…”, “This story has no
landed run with that identity.” The four dashboard documents state the general
capture, the prepare rule and these words.
Accepted proof: `story-review-story-branch-landed.spec.ts` (done-card review
T→M after a real `integrate` and retirement, with a mid-execution trunk merge:
trunk-only files absent, the shared file's story line against trunk's at T,
both landed runs newest first, the same pair after trunk moved, no Mark
reviewed); `story-review-story-branch-unavailable.spec.ts` (a removed claimed
worktree with no landing shows the gap); the
story-review, Recently done, one-shot landing, panel, overview and
launch-record specs; typecheck.

## Execution complete

Product advice: The landed review now covers a Story Branch Mode story whose
integration merged cleanly or fast-forwarded. The retrospective found the
story's Required clause unmet for a conflicted integration, and wrote
[correction plan 293](../293-landing-capture-after-integration-conflict/PLAN.md)
(story `SEED-088#landing-capture-after-integration-conflict`, unqueued,
recorded not-ready). Recommendations for wrap-up:

- Queue that correction ahead of the sibling stories: contended integrations
  are the landings most worth reviewing, and today they land with the evidence
  gap.
- Decide what a claimed launch whose worktree was removed without landing
  says. It now reads as a landed run with “no captured landing comparison”,
  which cannot tell a story landed before this capability from abandoned
  work. Recommended: one sentence that claims neither, such as “This run's
  workspace is gone and no landing comparison was captured.”
- Observe once, natively, that a Story Wrap Up session started as its own
  dashboard launch receives the execution launch's landing context. The specs
  drive `integrate` with the claimed launch's context directly; which launch a
  separately started wrap-up reports through was not observed.
- The sibling [Trunk Mode story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes)
  can reuse this capture; it needs a list of landings per launch where this
  keeps one.

## Story obligations

### G1. A claimed launch's context has no consumer yet
Reported: slice 2 — "A claimed launch's context is consumed by nothing until slice 3's `integrate`."
Story clause: "Wrap-up's Story Branch trunk integration passes that context through the history-preserving candidate sequence"
Disposition: proved by slice 3: `dashboard/tests/story-branch-landing-capture.spec.ts`, the `integrate --landing-context` run asserting `classification: "published"`, `landing.state: "recorded"` and the kept record's base and revision

### G2. Capture refusals name one-shot to a claimed launch
Reported: slice 2 — "For a claimed launch, today's prepare verification and the refusal messages still say \"one-shot\" (slice 3)."
Story clause: "describes the general rule for the executing agent"
Disposition: proved by slice 3: `dashboard/tests/story-branch-landing-capture.spec.ts`, the not-`HEAD` prepare asserting “This is not the established launch's workspace candidate and commit comparison.”

### G3. A bound claimed record's landing reporting is unasserted
Reported: slice 2 — "Every bound claimed record now gains `landingReporting` (authority and preparations) at binding, and deletion consults it. The suite is green; no new spec asserts it for a claimed record."
Story clause: "Recording happens before retirement and follows the existing capture rules"
Disposition: proved by slice 3: `dashboard/tests/story-branch-landing-capture.spec.ts`, the bound claimed record's `landingReporting` asserted at binding and after landing

### G4. The no-capture sentence reaches a launch with no established context
Reported: slice 2 — "A story launch with a reporting block but no established context (a plain launch, no installed start) now gets the no-capture sentence"
Story clause: "can review that story's combined delivered changes after its branch has merged to trunk"
Disposition: no user cost "can review that story's combined delivered changes after its branch has merged to trunk": such a launch cannot capture either, and the sentence still has the agent explain the evidence gap the review then shows

### G5. A rerun with nothing retained reports an unreadable retained comparison
Reported: slice 3 — "If nothing was ever retained (trunk came to contain the tip by other means), it returns `landing.state: \"unacknowledged\"` with a file-not-found error for `landing-current.json` rather than a distinct state."
Story clause: "The landed review never guesses a baseline or lists substitute files"
Disposition: no user cost "can review that story's combined delivered changes after its branch has merged to trunk": no pair was retained before the accepted push, so nothing can be recorded and the review shows the evidence gap the story keeps for an uncaptured landing

### G6. A rejected then retried push is not driven against the real receiver
Reported: slice 3 — "Not exercised end to end: a rejected-then-retried push against the real receiver."
Story clause: "Recording happens before retirement and follows the existing capture rules"
Disposition: proved by slice 3: `src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs` asserts the pair of each attempt after a rejected push, and the receiver's superseded preparation is the shared path `dashboard/tests/one-shot-landing-recovery.spec.ts` drives

### G7. Dashboard documents still describe one-shot-only capture
Reported: slice 3 — "`dashboard/AGENT-LAUNCH-COMPLETION.md` and its siblings still describe the old prepare rule and one-shot-only capture"
Story clause: "the selector and context wording name both one-shot runs and story-branch integrations with one term per fact"
Disposition: proved by slice 4: `dashboard/STORY-REVIEW-ONE-SHOT.md`, `dashboard/AGENT-LAUNCH-REVIEW.md`, `dashboard/AGENT-LAUNCH-HISTORY.md` and `dashboard/AGENT-LAUNCH-COMPLETION.md` read at delivery; no automated check reads these documents

### G8. One mid-execution trunk merge is driven, not three
Reported: slice 4 — "The story says trunk advanced three times and was merged each time. The spec drives one mid-execution merge plus one further trunk advance before integration."
Story clause: "Trunk advanced three times during that execution and each time was merged"
Disposition: proved by slice 4: `dashboard/tests/story-review-story-branch-landed.spec.ts`, the done-card journey's merged trunk file absent and the shared file's diff against trunk's at T; a further merge adds only ancestors of T, which the fixed pair already excludes

### G9. The fast-forward comparison is not opened in the review panel
Reported: slice 4 — "Example 3 (fast-forward) is not observed in the review panel; it rests on slice 3's record-level proof."
Story clause: "the comparison is from T to B, the same files the workspace review showed before landing"
Disposition: proved by slice 3: `dashboard/tests/story-branch-landing-capture.spec.ts`, the fast-forward case's recorded base T and revision B; the review reads any recorded pair through the path slice 4's spec drives

### G10. The retried record and the review are not joined in one journey
Reported: slice 4 — "Example 7 is not joined end to end."
Story clause: "the review shows the comparison once the retry is acknowledged"
Disposition: proved by slice 3: `dashboard/tests/story-branch-landing-capture.spec.ts`, the reporting-only retry recording base T and revision M; the review reads that record through the path slice 4's spec drives

### G11. A claimed refinement preparation's landing is listed without its own spec
Reported: slice 4 — "A claimed refinement preparation with a captured landing is not separately proved."
Story clause: "The review lists that integration among the story's retained runs"
Disposition: no user cost "A developer reviewing a story executed in Story Branch Mode": the story's execution integration is proved; a refinement preparation's landing reaches the list by the same record fact, and the one-shot refinement in slice 4's spec proves the refinement row's rendering

### G12. Each earlier claimed launch with a gone workspace and no landing is listed as a gap
Reported: slice 4 — "Earlier claimed launches of the same story whose workspace is gone and that hold no landing each appear under \"Landed runs\" as \"No captured comparison\"."
Story clause: "the review explains that this run's delivered comparison"
Disposition: proved by slice 4: `dashboard/tests/story-review-story-branch-unavailable.spec.ts`, the removed claimed worktree with no landing explaining the gap and listing no files; the newest captured run still opens first
