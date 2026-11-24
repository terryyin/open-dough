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
existing follow-ups. Use the dashboard's existing Git access for these slices.
[SEED-428](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)
owns the Review repository cutover, shared fetches, offline review, and reuse
across file reads.

## Existing solution and direction

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative for published progress. Use the configured
  project's existing Git access and its published refs and records. Requests
  identify a configured project and comparison. A missing object, branch, or
  record is a review gap.
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
| Done opens the attributed completion and literal file diff | `npm run --silent test:e2e -- e2e/review/story-review-completed.spec.ts e2e/sessions/recently-done-published-sessions.spec.ts --workers=1 --reporter=list` passed all four cases. The story reopened its original pair after trunk advanced. Session reads used recorded ranges, omitted interleaved work and showed recorded uncertainty. | Slices 1 and 6 make this published evidence the default for the corresponding reader. |
| A first publication receipt retains the actual accepted landing pair | `npm run --silent test:e2e -- e2e/review/story-review-story-branch-landed.spec.ts --workers=1 --reporter=list` passed. Real integration and retirement left the earlier capture and execution landing selectable, including the actual resolution and fixed pair after further trunk movement. | Slice 5 keeps the accepted pair and drops review's dependency on the captured repository. |
| The published UUID bounds subsequent file reads | `npm run --silent test:dashboard:backend -- dashboard/backend-tests/review/published-session-review.spec.ts --workers=1 --reporter=dot` passed all six cases, including a real recorded-pair diff and refusal of a different pair or file. | Slice 6 keeps this ownership through the normal published review and file handlers. |
| Taken claims reach published CI evidence | `npm run --silent test:dashboard:backend -- dashboard/backend-tests/intent/ci-comparison-taken.spec.ts --workers=1 --reporter=dot` passed all three cases. | Slices 2 and 3 establish the new review behavior with real Git origin and keep CI's separate measured-revision assertions. |

Returning an empty `files` list from `publishedSessionReview` in a scratch edit
made the published pair case fail on missing `notes.md` while the five other
cases passed. The edit was reverted.

Start each slice with its smallest failing published example. Recheck test
selection against the execution base.

## Ordered slices

### 1. Open a completed story from published history

Type: Behavior
Status: done
Proof: Open a completed story through the existing Git source on a reader with
no session worktree or launch store. After trunk advances, open the same
published completion and read its literal file diff. Keep targeted backend
cases for interleaved work, mixed merge edits, and exact file admission.

Make published completion the default Done comparison. Reuse existing
attribution and preserve published revision, paths, notes, and Proof context.
Resolve the published input through the current configured Git source.

Accepted proof: the typed `story-review-historical-choice.spec.ts` regression
returned a workspace snapshot before the change and the published completion
after it. The completed-review backend and Chromium gates passed for immutable
literal diff, interleaved and mixed merge attribution, source, notes, Proof,
and explicit landing choices. Dashboard typecheck passed. The independent
refactor required no edits. Run records: `slice-1-report.md` in checkout evidence.

### 2. Read a Taken story's published branch before landing

Type: Behavior
Status: done
Proof: From a real published claim and story branch, open Review changes on a
reader without the writer's worktree. Read the attributable published diff,
including a story-owned merge edit when present.
Push a further change and Refresh. Keep the selected file and show the new head.
Keep exact pair and literal path validation in the typed review handler.

Resolve the recorded branch and Take bound from origin through the current
configured Git source and reuse branch attribution over its published commits.
Preserve the wider published comparison when incoming trunk work makes it
meaningful. Trunk Mode moves to published review in slice 3.

Accepted proof: isolated origin and Chromium verified the owned merge, wider
comparison, push and Refresh. Typed reads pinned the prior published head and
refused unrelated paths and unpublished objects. See `slice-2-report.md`.

### 3. Read a Taken Trunk story's published changes

Type: Behavior
Status: done
Proof: A Taken Trunk story with interleaved foreign commits opens its own
published diff. The Overview and file Proof identify the actual measured build
or its gap. Exercise reading the published comparison at touch width through
the existing journey and preserve file selection and focus on refresh.

Reuse the published claim/attribution for trunk and use the same default review
and file-reading flow as 2. Rehome surviving touch, refresh and file Proof
observations into the published journey. Retire end-to-end assertions that
depended on Taken default opening unpublished Trunk changes.

Accepted proof: published Trunk attribution, exact prior reads, touch Refresh,
measured Proof and Done transition passed. See `slice-3-report.md`.

### 4. Retire the remaining workspace story comparison

Type: Behavior
Status: planned
Proof: Published Taken and Done reviews still open their selected files, and
the old workspace and range entry points offer no unpublished comparison.

Remove the workspace snapshot/range API, raw commit and worktree selection,
uncommitted CI hints and related setup from route admission through rendering.
Retire the dedicated specs. Move independent file and layout observations to
existing published journeys. Preserve launch controls, existing explicit
landing selection and the separate session review read until slices 5 and 6.

### 5. Choose an accepted landing in the published review

Type: Behavior
Status: planned
Proof: Adapt the real Story Branch Land and retirement journey to open a Done
story and choose its exact accepted integration after trunk advances. Read the
shared file's actual merge resolution and associated Proof context. Keep one
typed test for exact pair admission and the unavailable-evidence case.

Prefer published session and completion records. A verified legacy landing
receipt can identify a pair from authorized origin history. Read that pair
through the configured Git source when the evidence identifies it and the
configured target confirms it. Keep the
existing prepare/accept/retry workflow and retain only the state it consumes.
Consolidate Published completion and Landed runs selection into the shared
chooser. Remove fallback readers whose only purpose was local captured review.

### 6. Open a Done session's recorded published changes

Type: Behavior
Status: planned
Proof: Extend the existing cross-machine Recently done journey with a reader
that has no local launch history for the session. Open a UUID with two ranges,
select the second and read its diff. The same UUID opens the same comparison from a local Done
entry with native actions still available. Preserve a verified accepted landing
where its older receipt is the available association. Use typed review and file
handlers over the same configured source, clock and real isolated Git history.

Resolve durable UUIDs and retained accepted evidence into the published chooser
and pair reader. Preserve actual shared attribution uncertainty in a published
record. Replace the local execution-checkout and branch-result review routes
and their user-facing claims with the published outcome or its evidence gap.
Remove local-only proof and comparison keys. No new session records or recovery
methods are needed to read existing published evidence.

### 7. Finish a session without capturing unpublished review data

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

The published pre-execution baseline is
`f5f354ab320dfea79b8c02b10125809e2e06fc2a`. This Story Branch Mode
execution uses `codex/review-published-changes` in the owned
`review-published-changes` worktree, publisher
`dashboard-territory.local-open-dough`, with `origin/main` as the
integration target. Both remote branches contained the accepted Take before
slice 1. GitHub Actions workflow `ci.yml` observes the remote execution
branch through coordinator `yui-review-published-427`, stream
`/tmp/dough-ci-501/watch-ou4lkf` (PID 64952, Codex cell `g20:10`, shell
session 71952).

The ordered slices share one model: a configured project supplies attributable
published endpoints and files for a story or session. Merge attribution and
exact accepted landings account for different published facts. The temporary
workspace reader ends in 4, and all local session review producers
end in 7. Apply the file-size check before edits. The completion E2E and typed
readers keep their existing boundaries; retire large local-only files as units
when their consumers are gone. In any shared oversized view, keep Proof
composition and comparison/file navigation in their existing owner modules,
using the deletion to shed local variants rather than adding wrappers.

After slice 2, the workspace route and controls trace reached 58 files. The
Trunk publication read and retirement need independent proof, so slices 3 and
4 now have separate delivery boundaries. The published comparison model and
story scope are unchanged.
