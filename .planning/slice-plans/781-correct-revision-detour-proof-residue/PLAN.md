# Correct the proof residue of Intent revision reading and detours

**Identity:** SEED-413#correct-revision-detour-proof-residue
**Source:** [Correct the proof residue of Intent revision reading and detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-revision-detour-proof-residue)

## Correction input

- **Provenance.** This plan follows the execution retrospective of
  SEED-413#speed-intent-revision-and-detour-reading (completed; plan 778 and
  its source review recoverable at
  `3619577173:.planning/slice-plans/778-speed-intent-revision-and-detour-reading/`,
  commits `702d1a213..a96f35847`: `ea316f671`, `388cde76a`, `98b040787`,
  `8d94095b8`, `9f8184d42`, `54109973e`). Each finding below was rechecked
  in code at `a96f35847` on 23 November 2026.
- **Preserved promises.** Every promise and distinguishing assertion of plan
  778's delivered proof stays, as its Delivered notes and source review
  record. The only exceptions are the two E2E steps named in findings 1 and
  2, which assert nothing they can detect. Source-review commitment 14
  ("Keep browser routing assertions in a representative E2E journey") stays
  owned by `e2e/intent/intent-project-visit-ci.spec.ts`: its real Intent
  visit opened at `perspective=intent`, plus the Recent stories step if
  Slice 2's break check shows it detects a reroute.
- **Genuine constraints.**
  - The observation story
    ([SEED-413#drive-published-observation-through-page-entry](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#drive-published-observation-through-page-entry))
    owns the four retained legacy cases, their support
    (`frontendIntentRevisionJourney`, `intentRevisionJourney`,
    `frontendIntentReuseAnswers`) and making `mountIntentCiPage`'s page shell a
    production owner (plan 778 obligation G1). This plan does not touch them.
  - No production change. `dashboard/src/IntentTabs.tsx` and
    `dashboard/src/recentStoriesControl.tsx` change only in scratch break
    checks, reverted before delivery.
  - Colocated page objects, the [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
    the 250-line file limit, and the frozen Dashboard Test Support surface
    (it may only shrink).

### Findings

1. **The E2E arrow-key step cannot fail (medium).**
   `intent-project-visit-ci.spec.ts` step "arrow keys choosing Project
   Intent's view keep the page's URL" asserts the URL is unchanged. The Intent
   mode is not in the URL (`dashboardRouteUrl.ts` `buildRouteUrl`), and with
   the one published project a leaked arrow key reselects the same project,
   which `selectProject` ignores. The real risk is that an Intent mode tab's
   Arrow, Home or End key reaches page-wide project cycling. It is guarded
   only by `event.preventDefault()` in `IntentTabs.tsx` (line 54):
   `projectKeyboardNavigation.ts` skips `defaultPrevented` events, and a
   `role=tab` target is not an arrow-operated control. No test fails without
   that call. `e2e/intent/intent-ci-status.spec.ts` already proves the
   built-app keys move between the mode tabs, and
   `navigation/project-keyboard-navigation-eligibility.spec.ts` step
   "already-prevented arrow events keep the selection" proves that prevented
   keys keep the project.
2. **The E2E Recent stories step was never break-checked (low–medium).** Step
   "Recent stories returns from Project Intent to the story, keeping the
   Intent perspective in the URL" asserts `perspective=intent` after
   `returnFromProjectIntentWithRecentStories`
   (`dashboard/test-support/recentStoriesPage.ts`, now exactly 250 lines). In
   Intent, `recentStoriesControl.tsx` `revealInIntent` writes no URL, and with
   one project `onSelectProject` returns early. The step can fail only if
   Intent's choice is routed through Development's `navigation.follow`. Plan
   778 Slice 5 records that it has no break check.
3. **Duplicated page-object code (low).**
   - `chooseStoryTab` (choose plus an `aria-selected` wait) is defined
     identically in `intent-home-activation-scope.spec.ts:87` and
     `intent-reading-place.spec.ts:139`.
   - The selected story's "Project Intent" link and "Back to selected story"
     are declared as module constants in
     `intent-home-activation-scope.spec.ts:74-81`, while
     `intent-recent-stories-page.ts` locates the same controls again.
   - `openEveryFolder` sits beside `expandLocationAndFolders` in
     `intent-ci-homepage-page.ts`. It differs only in tolerating folders that
     are already open.
4. **Order-coupled reader cases (low).** Every reader returned by
   `intentCandidatesReader(get)` shares the module-wide memo in
   `answerMemo.ts`. `intent-candidates-reader-reuse.spec.ts` therefore stays
   correct only because each case reads at its own revision (`c1`…`c7`).
   `forgetAnswers` (`answerMemo.ts:57`) clears that memo, and
   `keptIntentCandidatesAt` reads the same memo. Its only caller is
   `backend-tests/intent/intent-shared-reads.spec.ts`.

## Goal and scope

Dashboard maintainers get Intent proof that fails when its behavior breaks,
and page objects they change in one place.

Included: a Vitest observation that the Intent mode tabs' keys reach the page
already handled; removing the E2E arrow-key step; a break check that decides
whether the E2E Recent stories step stays (retitled) or goes with its helper;
one owner each for the committed story-tab choice, the Project Intent and
back controls, and opening folders; a memo reset between reader cases.

Excluded: the four retained legacy cases and the page shell (observation
story); a cross-project Recent stories choice in Intent, which is unproven at
any layer (legacy also used one project) and needs the banner's real
`onSelect` that G1's page shell provides; the doubled scroll threshold in
`readDeepSpec`; the spent `FrontendServiceState.candidates` member (review
finding 5, not selected for this correction).

## Current decisions

- **The tab contract is observed where production listens.** Case 2 of
  `intent-home-activation-scope.spec.ts` registers a bubbling `window`
  `keydown` listener, as `projectKeyboardNavigation.ts:217` does, for the six
  Arrow, Home and End presses. It asserts that each arrived with
  `defaultPrevented` true and removes the listener afterwards. The
  eligibility spec keeps owning "prevented means no cycling". The spec header
  points at that spec and at `e2e/intent/intent-ci-status.spec.ts` instead of
  the removed E2E step.
- **The Recent stories step stays only if it detects a reroute.** Break
  check: in scratch, `recentStoriesControl.tsx` `choose` takes the
  Development branch (`selection?.select(entry); navigation?.follow(entry)`)
  in Intent too. If the E2E step fails, keep it and retitle it "Recent stories
  from Project Intent keeps the Intent perspective instead of following the
  story to Development". If it stays green, delete the step,
  `returnFromProjectIntentWithRecentStories` and the imports only it used,
  and the E2E header's Recent stories sentence. Record which outcome
  happened in Slice 2's Delivered note.
- **Page-object owners.** `intentStoryCompare()` gains `showTab(name)`
  (click, then wait for `aria-selected="true"`), `openProjectIntent()` and
  `backToStory()`, with the `projectIntentLink` and `backToStoryControl`
  locators the cases still assert focus on. Both specs and
  `intent-recent-stories-page.ts` use them; the existing `chooseTab` stays
  for its other callers. `expandLocationAndFolders` clicks only toggles that
  are `aria-expanded="false"`. `openEveryFolder` is removed and its caller
  uses `expandLocationAndFolders("dashboard/tests")`.
- **Reader cases are independent.** The reader spec resets the memo with
  `onTestFinished(forgetAnswers)` in `transportAnswering`. Cases that read
  one revision share one revision constant, so the reset is load-bearing.
  "Another revision" keeps its two revisions. The "own revisions" comment
  goes.
- Trunk Mode is not required. No slice acts from trunk.

## Local gate

On macOS, run on AC with `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
Run each slice's focused named proof, `npm run typecheck:dashboard` and
`npm run lint`. Retained Playwright outcomes are in the frontend proof
record. Set `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to a fresh path for
each run. E2E runs only for the spec Slice 2 changes and the one that keeps
the built-app key proof.

## Decisive premises

Read at `a96f35847` on 23 November 2026. Scratch runs were refused in this
planning session, so none of the rows below has reached its consuming
operation.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A bubbling `window` listener sees the tab keys handled, and sees them unhandled without `preventDefault` | Slice 2 case 2 under `npm run --silent test:dashboard:frontend -- intent/intent-home-activation-scope.spec.ts --workers=2` | Code: `IntentTabs.tsx:54` calls React's `event.preventDefault()` in the tablist's `onKeyDown`. Production's own window listener (`projectKeyboardNavigation.ts:217`, bubbling) relies on that flag at line 103 | **Open.** Unreached: the scratch listener run with and without `preventDefault` |
| `forgetAnswers` clears what the reader and `keptIntentCandidatesAt` read, so a shared revision needs the reset | Slice 1 reader spec under the same runner | Code: `memoizedAnswer`, `keptAnswer` and `forgetAnswers` all use the one `memo` in `answerMemo.ts` | **Open.** Unreached: the six cases on one shared revision, green with the reset and failing without it |
| The Recent stories step's verdict | Slice 2 E2E break check | Code: `recentStoriesControl.tsx:81-97` | Not decisive. Both outcomes are planned and either one fits the slice |
| The folder helper serves both callers | Slice 1 run of `intent-ci-status-homepage` and `intent-home-activation-scope` | Code: `expandLocationAndFolders` opens the location and its first nested folder; the browsed spec is one folder deep under `dashboard/tests` | Settled by the slice's own run; a failure keeps `openEveryFolder`'s loop inside the one helper |

## Slices

### 1. One owner for story-tab, Project Intent and folder page objects; independent reader cases

Type: Structure
Status: planned

**Structure.** Apply the page-object owners and reader reset from Current
decisions to `intent-story-compare-page.ts`, `intent-ci-homepage-page.ts`,
`intent-home-activation-scope.spec.ts`, `intent-reading-place.spec.ts`,
`intent-recent-stories-page.ts` and `intent-candidates-reader-reuse.spec.ts`.
No case title or assertion changes, except the reader cases' shared
revision. This removes findings 3 and 4.

**Proof.**
```
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/intent-home-activation-scope.spec.ts intent/intent-reading-place.spec.ts intent/intent-recent-stories.spec.ts intent/intent-ci-status-homepage.spec.ts intent/intent-candidates-reader-reuse.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run lint
git grep -n -E "openEveryFolder|async function chooseStoryTab" -- dashboard/frontend-tests   # none
```
In scratch, removing the reset fails at least one shared-revision reader
case, and the plan 778 `fixed` cache bypass still fails three. Revert both.

### 2. Intent mode tab keys are proved handled, and E2E keeps only routing it detects

Type: Behavior
Status: planned

**Behavior.**
- **Pre-condition:** Project Intent with a file read and the CI status tab
  focused.
- **Trigger:** ArrowRight/ArrowLeft, End/Home and ArrowLeft/ArrowRight on the
  mode tabs.
- **Postcondition:** each of the six keydowns reaches the window with
  `defaultPrevented` true, so page-wide project cycling skips it. The view
  and focus move and the file stays read, as today.

Remove the E2E arrow-key step and the home-activation spec's header pointer
to it. Then run the Recent stories break check from Current decisions and
keep (retitled) or remove that step and its helper.

**Proof.**
- In scratch, removing `event.preventDefault()` from `IntentTabs.tsx` fails
  case 2 at the new assertion. Revert it.
- In scratch, routing Intent's Recent stories choice through Development
  decides the E2E step per Current decisions. Revert it.
```
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/intent-home-activation-scope.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:e2e -- 'intent/intent-project-visit-ci.spec.ts|intent/intent-ci-status.spec.ts' --workers=2
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run lint
git grep -n "keep the page's URL" -- e2e dashboard   # none
```

## Plan review

Slice-plan refinement was not needed. Slice 1 is test-support structure with
no assertion change. Slice 2 is the one proof change: it replaces the step
that cannot fail and settles the step that was never checked, both in the
same E2E journey. Slice 1 comes first so that the home-activation spec
(247 lines) shrinks before Slice 2 adds its listener. Each slice is a few
small edits and one focused run, within the 15-minute active limit. Both
slices depend on the two open premises above.

## Story obligations

None recorded.
