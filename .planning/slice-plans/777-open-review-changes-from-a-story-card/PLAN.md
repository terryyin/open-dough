# Open Review changes on a Story card in Intent

**Source:** [Open Review changes on a Story card in Intent](../../seeds/SEED-420-unified-intent-review.md#open-review-changes-from-a-story-card)
**Identity:** SEED-420#open-review-changes-from-a-story-card
**Source review:** [Source-only review carried forward from plan 761](source-review.md)

## Execution context

- Publisher `dashboard-territory.local-open-dough`, agent `Maria-chan`, Story
  Branch Mode, remote `origin`, integration target `main`.
- Execution checkout `open-dough/.worktrees/open-review-changes-on-a-story-card-in-intent`,
  branch `codex/open-review-changes-on-a-story-card-in-intent`. Starting revision
  `804be7996757ded7d4cacf0a3230c21c3a544e2d`. Claim accepted on trunk and the
  execution branch at `0f9df4dccc363dde681f6cbae2969b68120a93a0`.
- Checkout setup passed with `npm ci` and `npm run typecheck:dashboard`.
  Execution keeps routine in-scope plan refinement authority.
- Codex observer for `terryyin/open-dough` on the execution branch, workflow
  `ci.yml` (CI), coordinator `maria-chan-seed-420-card`, directory
  `/tmp/dough-ci-501/watch-tfd2pT`, PID `56058`, session `13505`, cell `g247:20`.
  The established trunk claim predates execution-branch observation.

## Goal and scope

Developers open a story's diff from its card, alongside CI comparison and
Intent coverage, while the current Side panel content stays visible. The
same card offer rules apply on the Board and in Recently done. The card
opens the default comparison. Done uses the published completion and
continues to offer captured runs. Session entries continue to open their
own reviews in the Side panel.

The card opening follows [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
and [Accepted ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
The Selected story, tab, and reading place are page state. The existing
route handles the perspective and browser history. The in-flight reading
already delivered by SEED-420#route-review-changes-to-intent is protected
by its existing proof. Session selection, bookmark scope, file filtering,
and reloadable review links remain later stories.

## Outside-in proof

| Example | Proof owner and observed result |
| --- | --- |
| Taken card with terminal showing | Slice 7. Selected story's Changes has keyboard focus, terminal stays mounted, and one browser Back shows Development with the card highlighted. Slice 8 checks the first changed file's actual diff. |
| Previously viewed Project Intent or Intent coverage | Slice 7. Reopen the same story from its card, assert Changes with the kept file and the default comparison. A final report for another story stays visible. The Development choice returns to the newly selected card. |
| Select a story and use the banner to enter Intent | Slice 7. A new selection starts on CI comparison. Choosing Changes gives the same default comparison and changed files as the card action. |
| Backlog or Taken workspace eligibility and absent workspace | Slice 7. Exercise kept launch, kept preparation and locally found claim inputs through the card. Assert the offer, or its absence when there is no local source. |
| Ambiguous worktrees or an empty comparison | Slice 3. The header explains the cause without showing a story diff. Slice 7 replays both through the action. Slice 8 checks that no file is automatically selected. |
| Done card with later edits in its retained workspace | Slice 4 preserves and extends the historical proof. Slice 7 uses the card on the Board and in Recently done and verifies the completion, available landed runs, and the card's review state. |
| Workspace comparison with published commits subtracted or kept by older Git | Slice 1. The visible branch, worktree, baseline and its qualifier describe the actual comparison, in compact and expanded form. The landed and published cases identify their own facts. |
| A retained ad hoc or published session entry | Slices 6 and 7. The review still opens in the Side panel. Its subject, comparison controls, and keyboard return remain usable across perspective changes. |

## Current decisions

- Keep one story comparison through
  [useStoryReviewSelection](../../../dashboard/src/useStoryReviewSelection.ts)
  and [useStoryComparison](../../../dashboard/src/useStoryComparison.ts).
  [storyComparisonOffered](../../../dashboard/src/storyReviewWorkspace.ts)
  already governs the card and the Intent lens. Reuse the shared Git reads,
  comparison selectors, file tree and diff components. Intent already
  reads historical Done changes and provides Notes in its header.
- The card changes the Selected story and uses the existing dashboard
  perspective navigation. Intent applies the one-time request to its scope,
  tab and file-reading owners. Key the request to its source and story so a
  delayed answer cannot act on a subsequent selection. The Side panel owns
  session review and never receives the card request. Keep session anchoring
  and the backend's story identity and historical reads available to Intent.
- Intent's displayed tree puts configured locations in their configured
  order, followed by outside paths. Reuse
  [reviewFileOrder](../../../dashboard/src/reviewFileTree.ts) for the order
  within each tree. Use the overlay's displayed path for a moved file.
  Opening a card review uses this order only when it needs to pick a file.
  Route, tree and revision never become competing owners of the selected file.
- Keep the change narrowly on existing owners. PageFrame (244 lines)
  continues to mount the Side panel, and delegates the card-arrival context
  to the existing page providers. IntentPerspective (235 lines) coordinates
  showing the story, and the tab and focus rule belongs with the existing
  tab owner. IntentBrowser (237 lines) already owns the selected file and
  reveal operation. Extract a cohesive opening or navigation helper beside
  that owner when needed. IntentFileReading (249 lines) stays responsible
  for Purpose and Proof. Compose the file controls beside the shared diff
  header without expanding that file past the
  [file-size gate](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
  The story comparison selection owns its default; keep CI and coverage
  describing the whole story when another comparison is viewed.

## Decisive premises

Baselines ran in this preparation worktree at `cc97d41bd` using Node 24.21.0
and the maintained two-worker Chromium runners on macOS AC power.

| Existing premise and consuming operation | Observation at the baseline |
| --- | --- |
| Selecting a story and entering Intent can drive the same workspace comparison, including commit range, uncommitted choice, refresh, and retry | The six mounted `intent-story-compare-*.spec.ts` files exercised the comparison switches, selected commit and run responses, in-flight reading, and unavailable choices through the visible header, file tree and diff. The real Git `intent-story-changes.spec.ts` fixture observed matching card and Intent file diffs. |
| Done's Intent read can preserve published completion and its file and line actions even while a readable workspace remains | `intent-done-retained-workspace.spec.ts` checked the historical endpoint, original diff, and exclusion of the later edit. `intent-story-completed.spec.ts` observed the completed comparison. `intent-story-follow-up.spec.ts` observed file and line context through the actual follow-up dialog and terminal. The [earlier discrimination check](../../done/SEED-420_open-review-in-intent.json) additionally caught a scratch removal of the historical read in the retained-workspace fixture. |
| Current card review takes over the Side panel, and ordinary navigation preserves an already-open panel | `side-panel-content-switching.spec.ts` and `side-panel-content-replacement.spec.ts` reached the terminal, different review subjects and final report, and read the retained panel after changing perspective. `story-review-action.spec.ts` activated the card by keyboard after Inspect and Notes and observed the legacy panel. These are the before-change observations for slice 7. |
| Ambiguous local claims reach a real review response without selecting a worktree | `story-review-trunk-worktree-ambiguity.spec.ts` exercised actual Git worktrees. The review named both paths and listed no changes. Intent currently offers its published tree after an unavailable comparison. Slice 3 gives this ambiguity its own Changes explanation with no file list. |
| Session review has independent entry points | `recently-done-ad-hoc-review.spec.ts` opened the retained local session. `recently-done-published-sessions.spec.ts` operated actual published session ranges and observed diffs and the shared-checkout explanation. |
| File ordering and first-file presentation use the displayed review tree | `intent-story-changes.spec.ts` exercised the Intent overlay and actual file diffs, including unchanged source. Legacy file ordering and movement are exercised by `story-review-file-moves.spec.ts`. Slices 5 and 8 extend those observable routes for Intent movement and card arrival. |

Run prefixes were `caffeinate -s -i npm run --silent test:e2e -- --workers=2`
and `caffeinate -s -i npm run --silent test:dashboard:frontend -- --workers=2`
with explicit spec paths. The focused E2E run selected 14 tests across the
Intent, navigation, ambiguity, and published-session specs above. The frontend
run selected 16 tests across the six compare specs, `story-review-action.spec.ts`,
`story-review-note-context.spec.ts`, and `recently-done-ad-hoc-review.spec.ts`.
Both recorded strict passes. A second E2E run with `e2e/review`,
`e2e/intent/intent-story-changes-moves.spec.ts`,
`e2e/intent/intent-story-completed-source.spec.ts`, and
`e2e/intent/intent-summary-story-comparison-renamed.spec.ts` recorded a
strict pass for all 76 selected tests. That run observed the existing
file-order movement, note and follow-up context, layout controls and
empty-comparison messages that the slices transfer. Slices 7 and 8 establish
failing observations for their new card arrival before changing the product.

## Slices

### 1. Intent identifies the branch, baseline, worktree and captured result

Type: Behavior
Status: done

A developer reading a workspace, landed run or published completion in
Intent opens the comparison detail and sees the facts of the comparison
shown. Reuse [ReviewContext](../../../dashboard/src/StoryReviewContext.tsx)
and the workspace baseline formatter. Cover both a baseline that subtracts
two published commits and one that retains them because of the local Git
capability. Keep the distinction for whether uncommitted changes are
included and the chosen commit range heading.

**Proof.** Mounted Intent comparison cases for both Trunk Mode baselines
and the full baseline disclosure, plus Done landed and published completion
facts. Keep the existing compare specs green and update the context wording
assertions in `e2e/intent/intent-story-completed.spec.ts` and other traced
Intent readers in this slice.

**Observed.** `intent-story-compare-context.spec.ts` reads the worktree and
branch in the comparison disclosure, checks both compact and expanded
baselines, and distinguishes the subtraction and older-Git cases.
`intent-story-compare-done.spec.ts` names the selected captured run's workflow,
time, target and revisions. The real-Git `intent-story-changes.spec.ts` and
`intent-story-completed.spec.ts` read the workspace and published comparison
respectively. The focused frontend run passed 18 mounted tests and the
selected Playwright specs. The 10 selected E2E specs and Dashboard typecheck
passed. Run records and the consumer trace are in the checkout's Git evidence
directory under `s1-front-final`, `s1-e2e`, `s1-typecheck`, and
`s1-consumer-trace.md`. The trace follows the shared context and older-Git
cue into the legacy panel, and the renamed comparison facts into Intent's
header, uncommitted and commit reads, gap recovery, and historical reading.
Independent refactoring scoped the context styles away from the commit heading.
The six mounted cases and selected Playwright layout cases passed again in
`s1-refactor-front`.

Slice 1 published at `e8466f474e4437fa6cbca0cc68f81b727f8d6cc0` on the
execution branch. CI run `45088764753` attempt 1 surfaced one missed consumer
of the old completion wording in
`e2e/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts`. The
focused repair uses the shared reader to assert the full historical baseline
and exact completion, both distinct from current trunk. The entire session
journey passed in `s1-ci-repair-e2e`.
The repair published at `30080c3849ae0dac93a95607e3709aeab3848eed` and
was registered on the same execution-branch observer.

### 2. Commit and trunk comparison journeys exercise Intent

Type: Structure
Status: done

Prepare the comparison part of the review page object for the switch in
slice 7. Use existing Intent page objects for the selected-story surface and
keep the session review surface with its own placements. An interim story
opening may select the card and enter Intent through the banner; slice 7
replaces that opener. The card's existing behavior is preserved here.

**Proof.** Preserve selected commit identity, stale response rejection,
refresh, renamed paths, trunk integration, own changes and older Git.
Migrate the seven `story-review-commit*.spec.ts` files and the
`story-review-trunk-own-{changes,flagged,older-git}.spec.ts` cases whose
promises lack equivalent Intent proof. Cite the actual observing assertion
for any reuse, including the six mounted compare specs.

**Observed.** The focused run passed 28 E2E cases across 12 specs, including
the actual Git comparison journeys and the Side panel touch and session
refresh consumers of shared test support. Dashboard typecheck passed. The
recorded observations cover first-parent commit rows and selected range
headings, stale response rejection with the later diff intact, refreshed and
vanished endpoints, real integration and rename diffs, and both Trunk Mode
baselines. The unchanged mounted commit case checks the exact range SHA
endpoints and diff across view switches. The commands, traces and complete
assertion map are in `s2-implementation.md`, `s2-e2e-final`, `s2-typecheck`
and `s2-consumer-trace.md` in Git evidence. The two existing empty-commit
panel cases continue to run while the receiving Intent observations are open.
Independent refactoring reused the shared Refresh response reader. The
older-Git refresh journey passed again in `s2-refactor-e2e-final`.
Slice 2 published at `c2c1d43934247ef30cb8310dbfc2a71a8f66fc93`.
The newer push superseded the repair-only CI attempt `45089980862`.

### 3. Intent explains workspace results while refreshing

Type: Behavior
Status: done

A comparison is empty, the committed-only workspace comparison has no
commits, or more than one worktree holds the local claim. Its Changes view
explains the cause without drawing a diff. When several worktrees claim
the story, name their paths and leave the file list empty. Refresh leaves
the last readable comparison visible until the current answer arrives, then
reports the resulting changed-file count or the specific gap. Reuse the
existing comparison and shared feedback where the subject and rule agree.

**Proof.** Port `story-review-{nothing,refresh,uncommitted-check,uncommitted-check-refresh,trunk-worktree,trunk-worktree-ambiguity,context-line}.spec.ts`
and the workspace scenarios in `story-review.spec.ts` via the interim
Intent opener. Keep the real competing-worktree, committed-only, empty,
renamed and in-flight responses observable. Move assertions about panel
details or focus return to the session journeys in slice 6 when they read
panel behavior.

**Observed in Intent.** All 31 selected E2E cases passed after correcting the
held-response fixture to preserve the request origin. The real Git Refresh
journey checks the old file list and diff during the pending snapshot, then
checks the new rows, baseline and diff after settlement with focus on
Refresh. Real competing claims name both paths and leave the browser absent
even when Project Intent has a published tree. The commit and older-Git
cases verify the settled counts and distinct empty or unreadable reasons.
Selected mounted/frontend, backend boundary and Dashboard typecheck passed.
The recorded commands and trace are in Git evidence under `s3-e2e-final`,
`s3-frontend`, `s3-backend`, `s3-typecheck` and `s3-consumer-trace.md`.

The retained 63-file panel journey passed at the default timeout after
competing local workloads drained. The one-shot choices journey still
timed out at Close before checking focus return on a controlled run at the
default. Its three native launches and full browser assertions passed with
the 60-second allowance scoped to that individual test. The capacity evidence,
commands, and retained traces are in `s3-implementation.md`.

Independent refactoring made Refresh and Retry use the same comparison
scope key as the selected result. The 11 mounted cases, selected frontend
gap journey, five real-Git journeys and Dashboard typecheck passed again.
See `s3-refactor.md` and its command records in Git evidence.
Slice 3 published at `8991db356fd9c8e4bfc1733a53f61902c0d070d2`.

### 4. Intent explains landed and completed story comparisons

Type: Behavior
Status: done

Use Intent's historical reads for published completions, captured runs, merge
edits, and file and line follow-ups. A valid empty captured run shows its
empty outcome. An unavailable historical run keeps its available context and
explains the gap with an empty file area. The comparison controls remain
available. While a new run is pending, keep the previously readable
comparison. Reuse the shared historical outcome and run context. Retained
session entries continue to use the Side panel.

If historical location attribution is unavailable while a captured comparison
is readable, show its changed files outside the configured locations. Read
them at the captured tree and keep the explanation of the location gap.

The port exposed missing historical outcome text and a published-tree
fallback when the selected captured run was unavailable. Correct those cases
within the same historical proof loop. Workspace and commit-range readers
keep the fallback where their established behavior calls for it.

**Proof.** Trace and port `story-review-{landed,story-branch-landed,completed,completed-merge-edits,follow-up,one-shot,one-shot-choice,one-shot-choice-races,one-shot-choice-refresh,one-shot-unavailable}.spec.ts`
where the subject is a story. Preserve the story/standalone distinction in
`recently-done-one-shot-review.spec.ts`. Observe the same outcomes through
`e2e/intent/intent-story-completed{,-source}.spec.ts`,
`intent-done-retained-workspace.spec.ts` and
`intent-story-follow-up.spec.ts`. Record the original and receiving
assertion when an existing Intent journey covers the same promise. File
and line Follow up must still carry the comparison, path and line when
present, and open the existing dialog. The captured-run journeys also
observe the empty outcome and the unavailable reason with its retained
launch facts and no substitute file list.
The Recently done one-shot journeys also exercise a readable capture whose
published completion cannot establish a historical location basis.

**Observed.** The focused E2E groups passed 21 core, six native one-shot, and
14 receiving cases. They read the exact Story Branch capture before and after
retirement, the fixed CLI completion across trunk changes, the three
historical gaps, and exact file and old-line follow-up context. Both
Recently done cases read an independently valid capture at its own tree with
all eight changed rows and three exact file diffs while the historical
location explanation remains. The genuine standalone session action still
opens the Side panel and returns focus. Mounted and selected browser frontend
checks and final Dashboard typecheck passed. See `s4-implementation.md`,
`s4-consumer-trace.md` and its linked run records.
Independent refactoring removed the unused Story card return from the
captured review test helper. The three focused historical cases and
Dashboard typecheck passed again in `s4-refactor.md`.
Slice 4 published at `f2b5e3856e9e9e7cfe1e8d2f5593bf077e4be57e`.

### 5. Previous file and Next file work in Intent Changes

Type: Behavior
Status: done

With a changed file open, Previous file and Next file move through changed
files in displayed tree order, reveal the destination and keep the keyboard
on the activating control. At the ends the existing focusable disabled
controls explain the limit. Reuse
[FileMoves](../../../dashboard/src/StoryReviewFileMoves.tsx) with the
ordered Intent overlay, including outside files. Keep existing file and
line note actions on the shared diff reader.

**Proof.** Move `story-review-file-moves.spec.ts` for movement and revealing
an offscreen row. Move or map story-purpose observations for
`story-review-{tree,tree-collapse,line-counts,diff-add-note,diff-context,diff-line-follow-up}.spec.ts`,
`intent-story-changes-moves.spec.ts`, and
`intent-summary-story-comparison-renamed.spec.ts`. Observe immutable note
context and the shared diff's syntax, content and focus through the Intent
file reader. Use `dashboard/frontend-tests/intent/intent-story-notes.spec.ts`
for header Notes and focus return. Slice 8 uses the same order for arrival.

**Observed.** `story-review-file-moves.spec.ts` checks both focusable ends,
keyboard retention, nested folder reopening and an offscreen destination
with stable document scroll. `intent-story-changes-moves.spec.ts` walks a
renamed change in displayed order across two configured locations and the
outside group. The mounted Notes action and real immutable file and line
notes keep their comparison, path, side and line. The final six reveal
cases, one real TSX syntax case, four comparison moves, 21 mounted tests,
selected browser frontend and typecheck passed. The implementation report
maps the prior assertions and focused retests in `s5-implementation.md` and
`s5-consumer-trace.md`.
Independent refactoring shared the browser reveal between movement and
the established open path. Six focused E2E, three frontend cases and
Dashboard typecheck passed again. See `s5-refactor.md`.
Slice 5 published at `7227ee7204f05c8ce3fd88b8e96da2d597e9e553`.
CI run `45098800346` attempt 1 exposed a signal-registration race in
native setup. The [diagnosis](diagnosis-native-setup-sigint.md) records the
deterministic failing launch and the corrected SIGINT/SIGTERM and process
group termination proof. Slice 6 was paused for the repair.

### 6. Side panel mechanics are proven with session entries

Type: Structure
Status: planned

Before slice 7 changes the card action, move the panel-specific consumers
to actual session review fixtures. The Side panel keeps its frame, divider,
details disclosure, keyboard return, responsive sizing, and one-content
replacement. Keep narrow/touch cases that read story files in Intent or
move the frame-specific part to a session. Keep mount/provider stand-ins
aligned with the session request. Trace request-only comparison properties
before removal in slice 7. Server query options used by Intent are outside
that removal.

**Proof.** Update the two `side-panel-content-{replacement,switching}.spec.ts`
journeys and frame portions of `story-review-{panes,touch}.spec.ts`. In
`dashboard/frontend-tests/review`, use session variants for the divider,
toolbar, focus and touch cases. Move story-only details, notes and
uncommitted cases only where slices 1–5 name their receiving Intent proof.
Re-run the published and retained ad hoc session reviews, including the
side-panel checks after perspective navigation.

### 7. Review changes on a Story card opens that story's Changes

Type: Behavior
Status: planned

Press the action on the Board or in Recently done. Intent shows the
Selected story's default comparison and focuses Changes as one history
entry. It retains the story's file selection, leaves the terminal or final
report mounted, and returns to the selected card on Back or Development.
Cover a second press after a visit to Project Intent or Intent coverage.
The banner still opens on CI comparison for a newly selected story. Leave
Done review state on its card. Slice 8 removes the interim need to choose a
file manually when the story has no kept file.

Move the story action off the Side panel provider. Narrow the Side panel
request to session subjects, retire only former story-panel request fields
and reconcile paths with no remaining consumer, and keep shared reading
contracts. Keep the default decision with its existing comparison owner.
Update the stale story-review sentence in the Board interaction text.
Replace the interim story review page-object root with the real card action
and update any direct card readers outside `e2e/review`.

**Proof.** Real browser journeys for the terminal, final report, Back,
Development, the two repeat starts, the default comparison and the Done
placements. Use `story-review-action.spec.ts` for eligibility and keyboard
order and the retained workspace fixture to prove the new opening uses the
published completion. Run `e2e/review`, the affected Intent and navigation
readers, and both session entry routes. Trace the removed symbols and the
former panel provider stand-ins before acceptance.

### 8. A fresh story review opens its first changed file

Type: Behavior
Status: planned

With no file selected for the story, the card arrival waits for the
default comparison, selects the first changed file in displayed tree order
and shows its Purpose diff. It reveals the row even when its location or
folder was collapsed. When a file is already selected, keep it. A pending
or unavailable comparison cannot pick a file from a previous story. A
comparison with no changed file leaves file selection empty.

**Proof.** Extend the card-opening journey from slice 7 with two locations,
an outside file, and a fixture where tree order differs from the input
path order. Assert the focused Changes tab, selected tree row and actual
diff text. Replay with a kept file, a delayed response from a previous
selection, and an empty result. Run the directly affected reading and
navigation specs, including the card journeys through
`e2e/review`, and the comparison or Purpose readers reached by the change.

## Plan refinement and gates

Slice-plan refinement realigned the inherited plan in place. Eight slices
preserve the earlier comparison proof, bring the existing review journeys
over in focused groups, and keep the history and first-file transitions in
their own proof loops. The interim test opener is removed in slice 7. The
temporary manual file choice on fresh arrival ends in slice 8.

At each change, run the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
over the actual effects and retain the results with the slice. Include
direct card selectors, review response stubs, page-object methods, and
exact context and status assertions. Group historical planning and generic
documentation matches outside the affected runtime. Preserve a consumer's
assertion until its replacement proves the same result.

Before changing tests apply the [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
and [page object](../../../.agents/skills/dough-page-objects/SKILL.md)
selection in AGENTS.md. Use two workers and default timeouts, with explicit
paths for the slice's readers. On macOS run on an awake machine on AC
using `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and run `npm run typecheck:dashboard` for production and test-support type
changes. Run the whole review E2E directory for slices 7 and 8 because the
card opening and arrival reach every story review journey.

## Story obligations

### G1. Refresh announces the settled range and workspace results
Reported: slice 2 — "Commit refresh still needs the settled counts 1, 2, 1 and 4, 4 with a separate pending diff cue where held. Older Git refresh still needs the count 2 against the retained baseline."
Story clause: "Refresh"
Disposition: proved by slice 3: story-review-commit-refresh.spec.ts verifies counts 1, 2, 1 and 4, 4 with a separate pending file cue in both held cases. story-review-trunk-own-older-git.spec.ts verifies the count 2 and retained baseline message.

### G2. Empty comparisons and unreadable selected ranges name their cause
Reported: slice 2 — "The empty workspace after all commits reach trunk needs the retained baseline reason. The clean merge and plain empty commit still prove their empty reason through the panel. The older Git unreadable range must keep the selected range identifiable alongside its diagnostic."
Story clause: "An empty or unavailable comparison shows its explanation"
Disposition: proved by slice 3: story-review-commits.spec.ts and story-review-commit-trunk.spec.ts verify the empty explanations. story-review-commit-ranges.spec.ts checks the named selected range and unreadable explanation. story-review-trunk-own-older-git.spec.ts names the matching retained baseline after publication.

### G3. Flagged file rows retain counts and a visible comparison qualifier
Reported: slice 2 — "The flagged Git cases prove accessible row names and the selected Purpose heading. The former row also displayed its qualifier and counts (+1 −1 and +2 −2)."
Story clause: "File and line actions on a diff keep their comparison context."
Disposition: proved by slice 5: story-review-trunk-own-flagged.spec.ts reads the row qualifier and +1 −1 and +2 −2 before checking actual Git diff lines. story-review-commit-renames.spec.ts observes it at the renamed destination.

### G4. An empty session review has no file toggle
Reported: slice 2 — "The empty legacy story-panel tests still assert there is no files toggle. Preserve the panel-specific assertion with a session fixture when moving the empty story outcomes to Intent."
Story clause: "still opens the Side panel review."
Disposition: receiving slice 6

### G5. Use the real Story card action in the Intent review journeys
Reported: slice 2 — "The Intent story review page object currently selects the card, enters Intent by the banner, then opens Changes."
Story clause: "**Review changes** on an eligible Backlog, Taken, or Done Story card opens"
Disposition: interim until slices 3, 4, 5, 6, 7

### G6. Committed-only file rows keep their line totals and description
Reported: slice 3 — "The Intent comparison proves exact committed and uncommitted diff lines. The former row showed +2 −0 and +1 −0 and described '1 line added, 0 lines removed'."
Story clause: "File and line actions on a diff keep their comparison context."
Disposition: proved by slice 5: story-review-uncommitted-check.spec.ts toggles committed-only and observes +2 −0, +1 −0, the exact accessible description and the actual diff lines.

### G7. Session review retains its persistent panel status and keyboard return
Reported: slice 3 — "The legacy workspace journeys observed the read-only description, toolbar position, keyboard return and a status area fixed between context and body during browser scroll. These are Side panel observations."
Story clause: "still opens the Side panel review."
Disposition: receiving slice 6

### G8. Historical review explains missing captured landing information
Reported: slice 3 — "Two missing-captured-landing journeys in story-review-nothing.spec.ts still open the story through the legacy review. Carry the available and unavailable comparisons to their historical readers."
Story clause: "landed runs, published completion"
Disposition: proved by slice 4: story-review-nothing.spec.ts checks both missing-capture workspace cases through Intent, including the live-to-retired refresh transition, exact explanation, available run context and absence of a substitute diff.

### G9. A historical comparison names an empty or unavailable outcome
Reported: slice 4 — "Intent omits the empty captured-run message and supplies the published file tree for an unavailable chosen run."
Story clause: "An empty or unavailable comparison shows its explanation"
Disposition: proved by slice 4: story-review-one-shot-unavailable.spec.ts checks the actual empty capture and missing object or repository messages. intent-story-compare-gaps.spec.ts verifies the captured gap has no substitute tree and ordinary range recovery remains available.

### G10. A readable capture keeps its changed files through a location gap
Reported: slice 4 — "The chosen Landed runs comparison names its exact captured revisions but the browser suppresses its eight changed files because the default historical location revision is unavailable."
Story clause: "landed runs, published completion"
Disposition: proved by slice 4: both recently-done-one-shot-review.spec.ts journeys observe the genuine captured pair, separate historical location explanation, eight outside rows and exact historical diff contents.

### G11. The retired capture retains its line description and file movement
Reported: slice 4 — "The retired capture's Intent journey reads the actual binary diff and the capture wire proves each file delta. Its former first row was described as '2 lines added, 0 lines removed' and Next file moved to the binary row."
Story clause: "File and line actions on a diff keep their comparison context."
Disposition: proved by slice 5: story-review-one-shot.spec.ts reads the fixed capture after retirement, asserts the exact added-row description, moves by keyboard to the binary row and reads its diff.

### G12. A narrow session review retains divider and covering behavior
Reported: slice 4 — "The former one-shot race used the Side panel divider, tested the 420px covering layout, a browser above the diff and Close focus. The new story race tests Intent at 420px and the underlying panel assertions still need genuine session fixtures."
Story clause: "still opens the Side panel review."
Disposition: receiving slice 6
