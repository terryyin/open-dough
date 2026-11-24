# Review published changes

**Source:** [Review published changes](../../seeds/SEED-427-review-published-changes.md#review-published-changes)
**Identity:** SEED-427#review-published-changes

## Goal and scope

Open published story and session comparisons directly from Review changes and
Intent. The selected comparison supplies the file list, diff, source and Proof
context. Switch comparisons only when there is a meaningful published choice.
The seed owns the examples, removals and follow-up boundaries. Session startup,
Done, workspace protection, authorized publication, landing and recovery retain
their workflow owners. Session selection inside a story, combining ranges,
expired-session recovery and new file or bookmark navigation belong to their
existing follow-ups.

## Existing solution and direction

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  names a dashboard-managed bare Review repository and makes origin authoritative
  for published progress. Reuse the bounded Git fetch and process handling in
  [gitTargetFetch.ts](../../../dashboard/server/gitTargetFetch.ts). Use the
  configured project's repository identity and ref, with authenticated Git for
  GitHub and the existing Git URL substitution in isolated fixtures. A request
  identifies a configured project and comparison, never a filesystem path or
  arbitrary ref to fetch. Initialize and refresh per project without writing in
  the execution checkout. A missing object, branch or record is a review gap.
- [Taken CI endpoints](../../../dashboard/server/takenStoryEndpoints.ts) already
  read the published claim, recorded mode and branch, Take parent and origin tip.
  Reuse the endpoint and attribution logic with the Git source supplied by the
  caller. Keep adapter discovery and measured builds with CI. Reuse the published
  completion and session readers, exact comparison/file admission and pair diff
  in [storyReviewPublished.ts](../../../dashboard/server/storyReviewPublished.ts),
  [publishedSessionReview.ts](../../../dashboard/server/publishedSessionReview.ts)
  and [retainedReviewPair.ts](../../../dashboard/server/retainedReviewPair.ts).
  Carry one typed comparison for reading and selecting files. Map it directly
  across the boundary as required by [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
- [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  keeps a whole-story default, published alternatives, truthful merge attribution,
  and a consistent selection across file navigation and Proof. Keep existing
  file-reading and follow-up controls. Collapse comparison menus and remove the
  worktree status, commit selection, uncommitted switch and associated CI hints.
- Follow the [Architectural North Star](../../NORTH-STAR.md). Under **Make
  production code directly testable instead of growing test support**, exercise
  typed handlers with real isolated Git and delete dead support. Under **Act as
  soon as the page allows**, use reader actions and retry their outcomes. Under
  **Plain Vitest for unit tests; Playwright only for E2E**, retain browser
  journeys in E2E and consolidate changed unit proof in plain Vitest (Node for
  handlers, Browser Mode for views). Reuse ReviewChanges page objects in E2E.

## Decisive premises and preparation observations

Observed on 2026-11-24 at `785e2da6ea0db3ec43aba08d8688e47b46c5bdee`
in the owned preparation checkout. Node 24.21.0, Git 2.50.1, Chromium from
the installed Playwright profile. All E2E observations use the existing
isolated Git origin and dashboard fixture.

| Consuming operation | Observation and result | Execution coverage |
| --- | --- | --- |
| Done opens the attributed completion and literal file diff | `npm run --silent test:e2e -- e2e/review/story-review-completed.spec.ts e2e/sessions/recently-done-published-sessions.spec.ts --workers=1 --reporter=list` passed all four cases. The story reopened its original pair after trunk advanced. Session reads used recorded ranges, omitted interleaved work and showed recorded uncertainty. | Slices 1 and 5 extend the same journeys to a reader without an execution checkout. |
| A first publication receipt retains the actual accepted landing pair | `npm run --silent test:e2e -- e2e/review/story-review-story-branch-landed.spec.ts --workers=1 --reporter=list` passed. Real integration and retirement left the earlier capture and execution landing selectable, including the actual resolution and fixed pair after further trunk movement. | Slice 4 keeps the accepted pair and drops review's dependency on the captured repository. |
| The published UUID bounds subsequent file reads | `npm run --silent test:dashboard:backend -- dashboard/backend-tests/review/published-session-review.spec.ts --workers=1 --reporter=dot` passed all six cases, including a real recorded-pair diff and refusal of a different pair or file. | Slice 5 keeps this ownership through the normal published review and file handlers. |
| Taken claims reach published CI evidence | `npm run --silent test:dashboard:backend -- dashboard/backend-tests/intent/ci-comparison-taken.spec.ts --workers=1 --reporter=dot` passed all three cases. | Slices 2 and 3 establish the new review behavior with real Git origin and keep CI's separate measured-revision assertions. |
| A GitHub project can be fetched into a fresh bare repository independently of its execution checkout | `git init --bare` in a disposable directory, then `GIT_TERMINAL_PROMPT=0 git -C <bare> -c credential.helper= -c 'credential.helper=!gh auth git-credential' fetch --quiet --no-tags https://github.com/terryyin/open-dough.git '+refs/heads/main:refs/remotes/origin/main'` fetched `53cdf454bf7cadbc643a7c283fc8e57488e292f8`. `rev-parse` confirmed a bare repo and the fetched revision. `git diff` read the backlog delta at that revision. Scratch repository removed. | Slice 1 exercises the new dashboard reader's connection to the same Git boundary, with fixture origin substitution. |

Returning an empty `files` list from `publishedSessionReview` in a scratch edit
made the published pair case fail on missing `notes.md` while the five other
cases passed. The edit was reverted.

The new checkout-independent routes and session cleanup are slice outcomes.
Start each with its smallest failing retained example. Validate the first
dashboard fetch through the repo-specific runner fixture before moving more
readers. Recheck test selection against the execution base.

## Outside-in proof and ordered slices

### 1. Open a completed story from published history

Type: Behavior
Status: planned
Proof: Extend the completed-story E2E opening and literal file diff after trunk
advances so the reader's execution checkout and launch store are absent. Keep
targeted completed-review backend cases for interleaved work and mixed merge
edits. Use the configured project source and accepted completion history over
a real isolated bare origin. Refuse a file outside the selected published pair.

Move completion and its file admission to the Review repository. Put bounded,
concurrent first fetch and retry at the shared Git boundary. Reuse existing
completion attribution and preserve published revision, paths, notes and Proof
context. Remove the completion reader's worktree and launch assumptions now.
Later slices move active and session reviews to the same repository.

### 2. Read a Taken story's published branch before landing

Type: Behavior
Status: planned
Proof: From a real published claim and story branch, open Review changes with a
pushed file, a local-only commit and a dirty edit on the writer's machine. Show
the attributed published diff, including a story-owned merge edit when present.
Push a further change and Refresh. Keep the selected file and show the new head.
Keep exact pair and literal path validation in the typed review handler.

Resolve the recorded branch and Take bound from origin and reuse branch
attribution over its published commits. Move the story branch reader off the
dashboard's worktree path. Preserve the wider published comparison when incoming
trunk work makes it meaningful. Trunk Mode still uses the old reader until 3.

### 3. Read a Taken Trunk story and remove the workspace comparison

Type: Behavior
Status: planned
Proof: A Taken Trunk story with interleaved foreign commits opens its own
published diff. The Overview and file Proof identify the actual measured build
or its gap. Exercise reading the published comparison at touch width through
the existing journey and preserve file selection and focus on refresh.

Reuse the published claim/attribution for trunk and use the same default review
and file-reading flow as 2. Remove the workspace snapshot/range API, raw commit
and worktree selection, uncommitted CI message and setup, from route admission
through rendering. Retire their dedicated specs outright. Keep meaningful
published choices in the shared chooser, including the landing from 4. Move
any surviving layout or file proof onto a published comparison in existing
specs, with each distinct assertion owned once.

### 4. Choose an accepted landing in the published review

Type: Behavior
Status: planned
Proof: Adapt the real Story Branch Land and retirement journey to open a Done
story and choose its exact accepted integration after trunk advances. Read the
shared file's actual merge resolution and associated Proof context. Keep one
typed test for exact pair admission and the unavailable-evidence case.

Prefer published session and completion records. A verified legacy landing
receipt can identify a pair from authorized origin history, with no diff read
from the receipt's local repository. Use a published landing only when the
evidence identifies it and the configured target confirms it. Keep the
existing prepare/accept/retry workflow and retain only the state it consumes.
Consolidate Published completion and Landed runs selection into the shared
chooser. Remove fallback readers whose only purpose was local captured review.

### 5. Open a Done session's recorded published changes

Type: Behavior
Status: planned
Proof: Extend the existing cross-machine Recently done journey with a reader
without an execution checkout. Open a UUID with two ranges, select the second
and read its diff. The same UUID opens the same comparison from a local Done
entry with native actions still available. Preserve a verified accepted landing
where its older receipt is the available association. Use typed review and file
handlers over the same configured source, clock and real isolated Git history.

Resolve durable UUIDs and retained accepted evidence into the published chooser
and pair reader. Preserve actual shared attribution uncertainty in a published
record. Replace the local execution-checkout and branch-result review routes
and their user-facing claims with the published outcome or its evidence gap.
Remove local-only proof and comparison keys. No new session records or recovery
methods are needed to read existing published evidence.

### 6. Finish a session without capturing unpublished review data

Type: Behavior
Status: planned
Proof: Replay an actual Done or quiet-report journey and a real landing with
its receipt and recovery. A completed session shows its normal Done state and
native actions, and genuinely accepted changes stay reviewable. Keep the proof
of workflow outcome, preserve the working tree and unpublished branch, and
remove the cases asserting reflog, snapshot or pin capture for local review.

Trace default launch, branch entry, Done, supersession and deletion through
`defaultLaunchStart`, `doneCapture`, `sessionCommitsCapture`, `sessionBranchCapture`
and launch pins. Delete producers, persisted review-only fields and pin writes
whose only readers were removed. Keep candidate and accepted delivery evidence
needed by the publication and manual landing workflows. Existing launch records
still load and their independently used fields still work. Use the existing
cleanup owner for old internal review refs when it owns them. Preserve local
branches and worktrees. Delete obsolete review docs, examples and remaining
fixtures with their owners. Recheck the published comparison proof in SEED-321
and plan 611, and scrub retired assumptions in the SEED-420
example. Preserve outstanding published promises and useful historical evidence.

## Verification and delivery

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  and project test rules. Before changing tests, apply `dough-makeme` and
  `dough-page-objects` selection and preserve the default timeouts. Run the
  focused mapped unit and E2E proof, dashboard typecheck, post-change refactoring
  and staged lint. Run every affected consumer along the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
  including no-result strings, shared class names, exact query forms, status
  consumers, CI hints, fixtures and launch/Done/landing/publication checks.
  Local gate: on AC run long checks under `caffeinate -s -i`; on battery start
  fully awake with the lid open under `caffeinate -i` and read the sleep log per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Record the published pre-execution baseline SHA. Compare `git diff --numstat`
  and tracked file totals for the affected product, spec, test-support and
  documentation paths against that SHA, including new and deleted paths. Count
  executable cases from equivalent Playwright and Vitest collection on each side
  for the affected review and Done/landing specs, including deleted specs at the
  baseline. Account for which retained case carries each distinct promise. Report
  the deltas and any net growth, with no replacement spec for a retired path.
- Hosted CI follows the normal delivery workflow. Changes collapsing obsolete
  runner selections or shard patterns keep the current group and shard ownership.

## Current decisions and plan review

The ordered slices share one model: a configured project supplies attributable
published endpoints and files for a story or session. Merge attribution and
exact accepted landings account for different published facts. The temporary
workspace route for Trunk Mode ends in 3, and all local session review producers
end in 6. Apply the file-size check before edits. The completion E2E and typed
readers keep their existing boundaries; retire large local-only files as units
when their consumers are gone. In any shared oversized view, keep Proof
composition and comparison/file navigation in their existing owner modules,
using the deletion to shed local variants rather than adding wrappers.

Slice-plan refinement was not needed. Each slice migrates one reading or
completion boundary and owns its proof and associated deletion. No remaining
slice-specific concern was identified.
