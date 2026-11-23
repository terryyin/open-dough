# Correct the proof residue of Intent revision reading and detours

**Identity:** SEED-413#correct-revision-detour-proof-residue
**Source:** [Correct the proof residue of Intent revision reading and detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-revision-detour-proof-residue)
**Source review:** [source-review.md](source-review.md)

## Correction input

SEED-413#speed-intent-revision-and-detour-reading is Done. Recover plan 778 and
its source review at
`3619577173:.planning/slice-plans/778-speed-intent-revision-and-detour-reading/`.
The delivered comparison is `fa264d219..c6dd04645`. Its Intent proof came
from `ea316f671` (revision and pinned-source mount), `388cde76a` (CI activation
and E2E keys), `98b040787` (Candidates reader), `8d94095b8` (reading place),
`9f8184d42` (Recent stories), and `54109973e` (typed recovery reply).
`a96f35847` measured the cohort. Plan heading, queue, process and wrap-up
commits establish provenance. The intervening attention-timeout work belongs
to SEED-341. Findings were rechecked against `eb193439a` on 23 November 2026.

1. **Long bodies obscure the behavior.** The new
   `intent-home-activation-scope.spec.ts:106` has a 100-line body. It sets up
   three read sources and a machine claim, then covers story branch activation,
   project trunk activation, reciprocal focus, and restoration of the story file.
   The Done record's Intent Coverage fault hit the default story CI assertion
   before the test reached activation from Changes. The pre-existing 122-line
   homepage case at `intent-ci-status-homepage.spec.ts:57` was touched by this
   execution and mixes landing, three activation inputs, a Development detour
   and missing configuration. The changed reading-place case at
   `intent-reading-place.spec.ts:161` combines tab detours and a perspective
   detour. Revision apply, planning-only, update boundaries and update outcomes
   now use typed reads and still interleave preparation with their transition
   proof. The three Recent stories cases and six Candidates reader cases are
   already focused. Keep the Candidates backoff and pinned-source recovery
   sequences intact because the observed timing or recovery order is their proof.
2. **Two touched frontend specs still use the Playwright harness.**
   `intent-home-activation.spec.ts` kept the pending-revision case in
   `388cde76a`. `intent-read-reuse-story.spec.ts` only had a cross-reference
   changed in `98b040787`. Its actual port is already owned by [plan 763,
   Slice 1](../763-speed-story-changes-notes-and-progress-reading/PLAN.md#1-read-the-selected-storys-changed-tests-from-its-comparison),
   with a Vitest replacement on that execution branch at `796e1197e`.
   Check that owner or its landed successor for the no-read and reuse
   assertions. If ownership changes before execution, reassess there before
   doing any duplicate work. The other three legacy cases from plan 778 were
   outside its implementation diff and still belong to the
   [published observation story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#drive-published-observation-through-page-entry).
3. **Two E2E steps overclaim routing.** The arrow-key URL step in
   `e2e/intent/intent-project-visit-ci.spec.ts` cannot see the project cycling
   risk. Intent mode is absent from the URL and the one project's reselection
   leaves the URL unchanged. The page keyboard listener skips a key already
   prevented by `IntentTabs`. The Recent stories step checks the URL after
   returning to the same story. In Intent, `recentStoriesControl.tsx` reveals
   the story without following a Development route and same-project selection
   returns early. Slice 5 of plan 778 recorded no break check for that step.
4. **Repeated interaction knowledge and shared state.** Activation and
   detour specs duplicate the story-tab click and selected wait. Activation
   and Recent stories rediscover the same navigation buttons, and CI helpers
   have two ways to open folders. All reader instances share the answer memo.
   The six reader cases currently avoid interference through unrelated
   revision literals rather than case isolation.

## Goal and scope

Dashboard maintainers can read each touched Intent unit case at one level of
abstraction and see which regression it catches. The proof keeps its fast
feedback and distinguishes scope, routing, reading restoration, and read
reuse. Touch the unit and E2E proofs below, following the landing owners above.
Keep accepted coverage and existing user behavior. The published observation
story owns the production page shell and the remaining observation-dependent
ports. Runner retirement and cross-project Recent stories routing are separate
work, as are unrelated wait and shared-support cleanup.

## Current decisions

- Keep arrangement, the triggering action and the distinguishing results visible
  at one level in each test body. Use typed fixture builders for noisy setup and
  existing focused operations or direct Vitest role locators for inputs and
  observations. Keep varying inputs and expected values at the call site.
  Share only domain-specific setup or a repeated observation. Avoid nested
  steps, generic workflows, and a helper that hides a whole case. First scope
  each case to one risk. Keep multiple observations when they distinguish that
  one risk. Keep cases literal and preserve independent inputs and timing.
- Follow all three [Architectural North Star topics](../../NORTH-STAR.md).
  [Direct testability](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  uses the existing typed mount and typed read sources without extending the
  test's page-shell composition or Dashboard Test Support.
  [Immediate input](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  keeps direct input, retrying assertions on changed cues, and synchronization
  on actual commits, promises or scroll events.
  [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  uses Vitest with embedded Chromium for the mounted cases and typed request
  spies for read counts. Retire the moved spec's `frontendApp`/route machinery
  and remove obsolete shared support only after its last consumer moves.
  Reuse existing focused operations during cleanup without growing page objects.
  Reserve Playwright for the built-dashboard routing and observation in E2E.
- Reuse `intentStoryCompare().chooseTab` and its locators. Use the next
  behavior-specific cue to wait for the new view, retaining the selected-state
  assertion where selected state is the outcome. Give the navigation buttons
  one semantic locator definition where shared. Make `expandLocationAndFolders`
  idempotent for both homepage and scope callers and remove `openEveryFolder`.
  Preserve existing callers of the story comparison and Recent stories helpers.
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  require proof that is simple, fast, and retains the delivered promises.
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps reading place and selection scoped to the project and story. Retain
  the original [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
  and the existing file-size limit. These slices deliver test changes.
  Production mutations are temporary proof checks in scratch.

## Local gate

On macOS, run on AC with `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default test timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the installed test-entry selection before editing test sources. Use
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` for proof
commands. Every slice runs its focused proof and `git diff --check`. Run
`npm run typecheck:dashboard` and `npm run lint` for the changed TypeScript.

For paths below, run
`npm run --silent test:dashboard:frontend -- <paths> --workers=2`, relative
to `dashboard/frontend-tests/`. Set
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to a fresh, absent path for
each run. Use
`npm run --silent test:e2e -- 'intent/intent-project-visit-ci.spec.ts|intent/intent-ci-status.spec.ts' --workers=2`
for changes to the real journey. Revert each temporary break before delivery.

Before editing, capture the scoped activation, keyboard, homepage, detour
and revision selections and the legacy pending-revision case. Compare each
affected selection after the change on the same host and worker count, with
preparation, runner, case count, elapsed and summed case time. Include the
changed E2E spec separately. Compare the legacy case and its Vitest
replacement by behavior and runner, with frontend proof records for both.
If load obscures the result, alternate comparable before/after runs and
record the spread. Plan 778 Slice 8 measured 29/36 s for the then-current
cohort including preparation, against 41/40 s for the reconstructed
legacy cohort under variable load. Those are historical context. Require
no repeatable slowdown for the focused Vitest selection and keep genuinely
distinct outcomes rather than merging them to meet a case count. Record
the ownership transfer and the measured change in the final slice.

## Decisive premises

The existing mounting routes for scope, detour and revisions ran with their
typed inputs in plan 778, including scroll restoration and lost-scroll fault
detection. Its source review records the exact case observations. The Done
record's branch fault proves the default view only. Slice 2 moves the
distinguishing observation to the activation and checks that trigger.

Scratch observations on 23 November 2026 at `ce3aa906a` in the preparation
worktree used the installed dependencies and headless Chromium on AC.
The local-gate frontend command selected
`intent/intent-home-activation-scope.spec.ts`,
`intent/intent-candidates-reader-reuse.spec.ts` and
`intent/intent-home-activation.spec.ts` with two workers.

| Premise | Consuming operation and result |
| --- | --- |
| Tab keys reach the same bubbling boundary as project navigation | The six keyboard inputs reached the window with `defaultPrevented` true. Removing `IntentTabs`'s `preventDefault` delivered all six with false and failed the new assertion. |
| The Candidates memo can be isolated per case | All six reader cases passed on one base revision with `onTestFinished(forgetAnswers)`. With the reset removed, the absent, another-revision, unreadable and invalid cases failed on their answers or transport observations. |
| A typed publication can reach the pending-revision activation | Offering a newer revision through `mountProjectIntent` showed the notice on the old revision. Activating CI cleared the file, kept one notice with Show latest and made no latest locations read. The scratch Vitest case passed on both runs. |

The intact run passed nine cases in 15.97 s of Vitest-reported duration.
All scratch source edits were reverted. These are feasibility and
discrimination results. Slice timing still uses the paired comparison above.

Both outcomes of the Recent stories routing check are bounded in Slice 4.
The sibling migration's proof owner is evidenced by plan 763 and
`796e1197e`. That branch is preparation evidence of the chosen owner and
entry. Check the published successor before retiring any proof that depends
on its assertions.

## Slices

### 1. Candidates reader cases start with an empty answer memo

Type: Structure
Status: done

Use the production `forgetAnswers` teardown already exercised by
`backend-tests/intent/intent-shared-reads.spec.ts` with
`onTestFinished` in the reader spec. Use one base revision in the six cases
and a second only when testing another revision. Each case keeps its own
transport observations. Present, absent, unreadable, invalid, and the kept
answer must retain their distinct results.

**Proof.** Run `intent/intent-candidates-reader-reuse.spec.ts`. Remove the
reset in scratch and require a shared-revision failure. Retain the original
fixed-answer bypass discrimination for present, absent and kept replies.

**Delivered.** Six cases pass on one revision with `onTestFinished(forgetAnswers)`.
Without the reset, absent, another-revision, unreadable and invalid fail; a
bypassed `fixed` predicate fails present, absent and kept. The backoff
sequence in `intent-candidates-read-recovery.spec.ts` is unchanged.

### 2. CI activation shows the judgment for the scope the reader opens

Type: Structure
Status: done

Shorten case 1 in `intent-home-activation-scope.spec.ts`. Move typed work,
machine claim and read recording into one local arrangement. Start the
story-branch case in Changes and observe its branch judgment after
activating CI comparison. Keep a focused Project Intent case for trunk
judgment and independent file selection. Keep reciprocal focus and the
restored story file in the navigation case, with its review identity and
file revision observations where they distinguish the scopes. Share
navigation locators with `intent-recent-stories-page.ts` and remove both
copies of the story-tab wait where the changed panel supplies the cue.

**Proof.** Run `intent/intent-home-activation-scope.spec.ts`,
`intent/intent-reading-place.spec.ts` and `intent/intent-recent-stories.spec.ts`.
Map the prior checks at lines 145–206 to their focused owners. In scratch
make `ciTargetOf` use main for the Taken story. Require the story-branch
case to fail on the judgment after reactivation from Changes.

**Delivered.** `readStoryChanges()` arranges the claimed story read in
Changes. Three cases own the story-branch judgment after activation from
Changes, Project Intent's main judgment and own selection, and reciprocal
focus with the restored Changes file and review identity. The work-revision
file read moved to the Project Intent case, where the read happens. Scratch
`ciTargetOf` → main fails the story-branch case at its judgment.
`projectIntentLink` and `backToStory` live in `intent-recent-stories-page.ts`;
slice 6 reuses `backToStory` for the homepage spec's inline locator.

### 3. Intent mode keys stay handled before project cycling

Type: Behavior
Status: done

With the CI status file open, send Arrow, Home and End navigation keys.
Observe them on a bubbling window listener with `defaultPrevented` true.
Keep focus and selected mode changes and show the file is still read on
return. Keep direct CI activation from Candidates as its own focused case.
Keep the production built-app mode navigation in
`e2e/intent/intent-ci-status.spec.ts` and prevented-key project eligibility in
`navigation/project-keyboard-navigation-eligibility.spec.ts`.

**Proof.** Run `intent/intent-home-activation-scope.spec.ts` before removing
the E2E arrow-key URL step. Require the handled-key assertion to fail
without `IntentTabs.tsx`'s `preventDefault`. Restore it, remove the redundant
E2E step and its imports and update the unit spec's header. Run the two E2E
specs named in the local gate and the eligibility spec through its existing
unit runner.

**Delivered.** The keyboard and Candidates activation cases moved to
`intent-home-activation-keys.spec.ts`, sharing the browsed-file setup through
`intent-browsed-file-page.ts`. A window keydown listener sees all six keys
prevented; without `IntentTabs`'s `preventDefault` it sees none. The E2E
arrow-key URL step and its imports are gone; both E2E specs and the
eligibility spec pass.

### 4. Recent stories retains only a demonstrated E2E routing check

Type: Behavior
Status: done

From Project Intent, using Recent stories returns to the selected story.
The three mounted cases already own story selection, readable start,
perspective control and unavailable rows. Preserve the E2E journey's
initial `perspective=intent` visit and later real CI reads. Establish whether
the Recent stories step alone also proves routing.

**Proof.** Run `intent/intent-recent-stories.spec.ts` and the real
`intent-project-visit-ci.spec.ts` journey. In scratch send the Intent choice
through Development's `navigation.follow`. Require evidence that the actual
route changed and that the E2E step detects that change. A missing story
frame alone overlaps with the mounted proof. If the step distinguishes
the wrong route, name that risk in its title and assert the URL at that
transition. Otherwise remove the step and its single-use helper and imports.
Record the observed outcome in the Delivered note.

**Delivered.** Scratch-routing the Intent choice through
`navigation.follow` switched the route to the Development perspective. The
E2E step failed only on the missing story frame, before its URL check, and
the mounted return case fails the same way. The step and
`returnFromProjectIntentWithRecentStories` were removed; both E2E specs pass.

### 5. Changes preserves the reading place across a detour and resets it per project

Type: Structure
Status: done

Make `intent-reading-place.spec.ts` show the selected file and its recorded
scroll offset as the input to a detour. Keep tab detours and the Development
round trip focused on their own restoration checks. Keep the project-switch
case focused on a fresh scope with its selection, toggle, folder and scroll
reset. Reuse the arrangement and the existing story controls. Keep the exact
restored file, expanded and deliberately collapsed folders, filter, Purpose
content, scroll offset and zero extra reads where they distinguish restoration.

**Proof.** Run `intent/intent-reading-place.spec.ts`. Match both restoration
and reset observations to the original. Repeat the recorded scroll-loss
fault to show the exact offset remains load-bearing.

**Delivered.** The combined detour case is now a tab-detour case (file and
offset kept, no reads) and a Development round trip (filter, folders, file,
Purpose, offset, no reads); the project reset case is unchanged. The repeated
scroll-loss fault fails the Development case on its offset. Tab detours only
hide the reading pane, so that fault cannot reach the tab case; no fault for
tab-detour scroll was tried.

### 6. CI homepage cases state one transition each

Type: Structure
Status: planned

In `intent-ci-status-homepage.spec.ts`, separate the initial project
homepage, activation from a reading choice, return from Development, and
missing configuration. Express location, folder and file variants with
their current click, Enter and Space input. Keep the same assertion focus
for every variant and reusable setup. Keep CI readable during location load,
failure and Retry in its existing recovery case. Move plumbing out of that
body while retaining the held read, recovery and no additional CI call.
Use one idempotent folder-opening operation in both homepage and activation
cases and retire `openEveryFolder`.

**Proof.** Run `intent/intent-ci-status-homepage.spec.ts` and
`intent/intent-home-activation-scope.spec.ts`. Preserve tab names and
selection, absent return control, checked branch and answer, file column,
expanded tree, missing-configuration explanation and the recovery read
counts. Retain one semantic frame/layout observation with the homepage
owner and compare timing across the focused cases.

### 7. CI home with a pending revision runs in Vitest

Type: Structure
Status: planned

Move `intent-home-activation.spec.ts` from `frontendApp` to the existing
`mountProjectIntent` typed revision entry. Offer the newer work through
the mounted production Intent body. Prove direct CI activation clears the
file selection, leaves the one notice and its Show latest action, keeps
the older revision and makes no new locations read. Use distinct revisions
and count the initial read as well as unintended reads. Keep the real
trunk push, CI judgment and observed-revision notice in
`e2e/intent/intent-project-visit-ci.spec.ts`. The observation story still owns
the production shell and observation-driven cases.

**Proof.** Run `intent/intent-home-activation.spec.ts` and
`intent/intent-revision-notice.spec.ts` and confirm the port is selected by
Vitest alone. Record every removed Playwright assertion's replacement.
Check `frontendIntentRevisionJourney`, `intentRevisionJourney` and read
recording helpers for surviving callers before removing any export. Check
plan 763 Slice 1's disposition for `intent-read-reuse-story.spec.ts` and
cite its proof owner for zero reads on scope browsing, one changed-file diff
and no published text. Its owning execution carries that migration.

### 8. Revision transition cases keep the timing and observations visible

Type: Structure
Status: planned

Simplify the longest changed bodies in `intent-revision-apply.spec.ts`,
`intent-revision-planning-only.spec.ts`,
`intent-revision-update-boundaries.spec.ts` and
`intent-revision-update-outcomes.spec.ts`. Move repeated typed publication
setup and held-reply plumbing out of the cases where it improves the reading.
Keep the transition and its effects visible. Preserve the one notice,
old reading during a pending apply, intermediate revision skipped,
final reading with selection, focus and scroll, planning-only reopen,
abort on project switch with the new project's reading, and failure
then pending and failed retry on reopen. Keep timing-dependent intermediate
observations and release cleanup.

**Proof.** Run the four files above plus the touched notice and source-target
recovery specs. Complete the before/after check in the local gate. Record
the surviving assertion owners, Vitest runner selection, E2E routing result,
last-consumer cleanup and measured cost. Revise any split that adds repeatable
cost without making a distinct regression easier to locate.

## Plan review

Refined the earlier two slices into eight focused proof loops. Reader
isolation, reactivation, key handling, real routing, reading place,
homepage, legacy migration and revision transitions each have their own
observable result and narrow runner selection. Each slice fits the
15-minute active limit by reusing existing typed entries and limiting
test changes to the listed behavior. The cumulative change removes
duplicated interaction knowledge and leaves real routing and observation
with the existing built-dashboard journey.

## Story obligations
