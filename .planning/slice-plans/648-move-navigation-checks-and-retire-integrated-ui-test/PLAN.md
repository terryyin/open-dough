# Move board, frame and project navigation checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-navigation-checks-and-retire-integrated-ui-test
**Source:** [Board, frame and project navigation](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-navigation-checks-and-retire-integrated-ui-test)
**Source review:** [source review](source-review.md)

## Goal and scope

Move 30 of the 41 `dashboard/tests/navigation/` specs (4,627 lines, 74 of the
107 navigation tests) to Frontend, Backend or E2E homes with every assertion and
product behavior preserved. The source owns scope and exclusions: the other 11
navigation specs, the group's retirement and its Markdown belong to
SEED-334#retire-integrated-ui-test-and-its-documents; no change to
`integratedStateCompletion`, groups, E2E naming or speed/shard targets. No
blocking dependency.

At `4eb4f8e594ee003a2894c28c8ab2600e1c42b835` the interim command lists 140
tests in 61 files: 107 navigation tests in 41 files and 33 Intent CI tests in
20 files that plan 651 owns. Reconcile later conversions by identity rather
than preserving these totals.

## Existing solutions and current decisions

- Placement follows the [dashboard test guide](../../../dashboard/tests/README.md#where-a-check-goes)
  and [Frontend conventions](../../../dashboard/frontend-tests/README.md): real
  production DOM, CSS and interaction against controlled service answers; a
  rule that needs the real server, Git or a synthetic host keeps a Backend
  boundary or representative E2E home. Converted specs keep their Navigation
  folder name (`dashboard/frontend-tests/navigation/`, created by the first
  such spec, and the existing `e2e/navigation/`).
- Reuse `frontendApp.ts` (`openFrontendTakenBacklog`, `frontendServices`),
  `frontendServiceSubstitutes.ts`, `frontendSubstituteAnswers.ts`,
  `holdAuthenticatedReads.ts` and the existing page objects (`boardPage.ts`,
  `accessibleBoard.ts`, `sidePanelWidthPage.ts`, `intentPerspectivePage.ts`,
  `dashboardPage.ts`, `projectKeyboardNavigationJourney.ts`). Extend those
  owners narrowly; add no second app harness or fake GitHub.
- Kept preferences live in the product's `keptPreference.ts` browser storage;
  Frontend cases observe them through real `localStorage` across `page.reload()`
  (premise P1). Refused-storage cases keep their own browser-context setup.
- The interim group stays runnable for its remaining specs: each slice that
  leaves a `dashboard-integrated` shard pattern in `.github/workflows/ci.yml`
  matching no spec updates that declaration (P2), and slice 7 shrinks the shard
  matrix once the last shard would select nothing (P3).
  `dashboard/tests/support/groupRunnerExamples.ts` names
  `navigation/board-paging.spec.ts` as the group's quick case for
  `dashboard/backend-tests/runtime/runner-ownership.spec.ts`; slice 3 repoints
  it to a navigation spec the sibling story still holds.
- Follow Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md). PFE
  found the maintained harnesses above and the conversions delivered by plans
  647 and 651; no ADR conflict or new structure.
- Keep cohesive modules within 250 lines; the largest source spec is 249.

## Outside-in proof ownership and gates

Before removing a spec, inspect its setup and assertions and record each
distinct assertion's destination in this plan: the exact new spec and test,
equivalent existing proof, or a Backend/E2E owner. Include negatives,
accessibility, geometry, focus, keyboard/touch, kept storage, read counts and
held/failed recovery. Split mixed cases across their real boundaries without
supplying the behavior under proof.

For each changed boundary, apply one scratch product break before conversion;
prove its replacement catches that same break and passes when restored, and
record the fault, observation and literal commands/results here. Keep interim
cases until mapped replacements pass.

Local gate: the affected Frontend/Backend/E2E selections, the interim listing
of every `dashboard-integrated` shard (`OPEN_DOUGH_DASHBOARD_INTEGRATED_SPLIT=<i>/<n>
npx playwright test --config dashboard/integrated.playwright.config.ts --list
--reporter=list`), and consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Use `caffeinate -s -i` on awake macOS on AC power; on battery use the
maintained open-lid `caffeinate -i` procedure and inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Check load and memory before expensive runs; default 2 workers unless measured
headroom calls for fewer. No full-suite or timing benchmark is required solely
by this conversion. Default timeouts and retries stay; never `test.slow()`.

Before test edits, rerun the installed test-entry selector for the actual
paths: Frontend/E2E select MakeMe and page objects; Backend selects MakeMe.
Each slice gets independent post-change refactoring, focused proof, commit and
delivery under [dough-execute-plan](../../../.agents/skills/dough-execute-plan/SKILL.md),
including CI repair/observation and eventual wrap-up. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link in every delegation and repair handoff.

## Ordered slices

Paths are under `dashboard/tests/navigation/` unless named otherwise. Each slice
has 15 active minutes excluding command time. Plan 647 converted 443–960 lines
per slice in 8.5–14.8 active minutes; these slices hold 516–771 lines.

### 1. Preserve accessible Board keyboard, touch and scroll reading
Type: Behavior
Status: done
Proof: `accessible-board`, `accessible-board-keyboard`, `accessible-board-touch`,
`accessible-board-scroll` (670 lines): keyboard and touch movement, accessible
names and reading, scroll position. Frontend homes unless a rule needs a
synthetic host.

Behavior: a Board with Backlog, Taken and Recently done entries → keyboard,
touch or scroll interaction → the same accessible reading, focus and movement
in the converted cases, with the interim files gone.

Assertion map (interim → Frontend, `dashboard/frontend-tests/navigation/`; every
assertion and step carried over verbatim against `putFrontendPublished` answers):
- `accessible-board.spec.ts` "reflows long published work for a narrow window
  and page zoom" (side-by-side gap ≤ 24, no sideways scroll, stacked
  direction/Backlog/Taken, long text inside cards and detail, direction
  reachable, viewport meta) → `accessible-board.spec.ts`, same name.
- `accessible-board.spec.ts` "keeps empty groups readable in a narrow window"
  → `accessible-board.spec.ts`, same name.
- `accessible-board-keyboard.spec.ts` "is read by keyboard in reading order,
  with visible focus, and Enter follows a link" (tab stops, tabindex counts,
  Tab leaves / Shift+Tab walks back, Inspect story → record link popup URL at
  revision B, Hide detail returns focus) → `accessible-board-keyboard.spec.ts`,
  same name; the hosting provider's page is answered empty by a context route.
- `accessible-board-touch.spec.ts` three touch cases → `accessible-board-touch.spec.ts`,
  same names; Doughnut's empty backlog is a source-scoped route answer, done
  records come through `putFrontendDonePublication`, and "does not start another
  session" observes no non-GET `/__agent-launch` request (was
  `claudeLaunchCalls()`).
- `accessible-board-scroll.spec.ts` "reads a backlog longer than one screen by
  scrolling the Board" → `accessible-board-scroll.spec.ts`, same name.
- `accessible-board-keyboard.spec.ts` "announces reading, the read result, and a
  failure while focus stays where it is" and `accessible-board.spec.ts` "keeps a
  read problem and the retained work reachable in a narrow window" →
  `accessible-board-announcements.spec.ts`, same names. Revision moves use
  recurring checks (`preholdRevisionStreamSlots`), the ref answered at page time
  (the default substitute's fixed `askedAt` lies months after `pausePageClock`'s
  time) and story records published empty (missing records answer as transient
  404s, so detail reads never settle and no `since` check is scheduled). The held
  read at B, the rate-limited check (502) and the 404 backlog at the moved
  revision are route answers; their server wording stays owned by
  `backend-tests/observation/authenticated-read-*` and
  `e2e/observation/read-failure.spec.ts`. `pathsRead(origin)` became the page's
  `path` reads.
- All four interim files are deleted; every `dashboard-integrated` shard lists
  (1/3: 29 tests, 2/3: 37, 3/3: 32; exit 0); no `accessible-*` pattern is
  declared, so `ci.yml` is unchanged.

Scratch break (Frontend boundary): `dashboard/src/StoryCardLaunches.tsx` open-session
reason `<p id={sessionOpenId}>` renamed to `data-scratch` → `env -u NO_COLOR -u FORCE_COLOR
-u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -i npx playwright test --config
frontend.playwright.config.ts frontend-tests/navigation/accessible-board-touch.spec.ts
--grep "disabled Start reason" --reporter=list --workers=1` failed at
`toHaveAccessibleDescription` (received "Not assessed as ready"); restored, the
navigation folder passed 7/7. A first break (card `scroll-margin-top: 0` in
`story-cards.css`) was not caught by the converted scroll case; the original
interim scroll spec, run from a scratch copy of `HEAD` under
`integrated.playwright.config.ts`, also passed under it (1 passed), so no
assertion was lost. Both scratch edits were reverted by editing back
(`git diff dashboard/src` empty) and the scratch copy deleted.

Refactor: `putFrontendBacklog` (in `dashboard/tests/support/frontendServiceState.ts`)
publishes a backlog with no other files; `answerBoardOnPageTime` (new
`dashboard/tests/support/frontendBoardPageTime.ts`) settles record reads and
answers the ref at page time, so later Board revision-move cases (slice 3)
reuse it. Navigation folder 9 passed and typecheck exit 0 after the refactor.

### 2. Preserve Board geometry and kept position
Type: Behavior
Status: done
Proof: `board-clamp`, `board-height`, `board-kept`, `board-scroll` (632 lines):
clamped and kept column position across project switch, reload and wide Board,
former-key recovery, refused storage, height and scroll geometry (P1).

Behavior: a narrow Board moved to Taken → project switch or reload → the same
columns, limited by room; refused storage starts at Backlog without error.

Assertion map (interim → Frontend, `dashboard/frontend-tests/navigation/`; kept
position read and written through the page's real `localStorage` across
`page.reload()`, per P1):
- `board-kept.spec.ts` "the chosen columns stay across a project switch, a
  reload, and a wide Board" → split into `board-kept-position.spec.ts` "the
  chosen Board columns stay across a project switch" (5a; also moved back to
  Backlog, a switch keeps Backlog), "… across a reload" (5b; also Backlog kept
  after a reload) and "… in a wide Board" (5c; every column shown wide, also
  after a reload, Taken again when narrow). Control counts follow the default
  substitute (`Backlog 2 entries`, `Recently done 0 entries`); the selected
  project after a switch is `chooseProject`'s own wait, no longer a separate
  `expectSelectedProject`.
- `board-kept.spec.ts` "a position kept under the former Board key is recovered
  once …" (5d), "an unusable kept position starts at Backlog", "where the browser
  refuses storage …" (own `addInitScript` refusing `localStorage`) →
  `board-kept-position.spec.ts`, same names.
- `board-clamp.spec.ts` long-Backlog clamp case → `board-clamp.spec.ts`, same
  name; `largeBacklog` through `putFrontendBacklog`.
- `board-height.spec.ts` "a hidden long Recently done …" → `board-height.spec.ts`,
  same name; backlog and seed through `putFrontendPublished`, 40 done records
  through `putFrontendDoneRecords`. "done stories arriving in a hidden Recently
  done …" → same name; the default Taken/Backlog (whose story records answer, so
  no unread-detail banner shifts the Board) beside 41 done records, the done
  catalog held by a context route until released (was `heldFactGroups`' held
  GitHub groups, whose now-uncalled `moreDone` variant and
  `publishedFactsDoneRecords.ts` were removed); "Show 10 of 31 older entries"
  and the unchanged Board extent kept.
- `board-scroll.spec.ts` two "the Board alone scrolls with an open Side panel"
  cases → `board-scroll-side-panel.spec.ts`, same names, one test per window;
  roster scroll and classic scrollbar cases → `board-scroll.spec.ts`, same
  names. Review changes opens on the Taken story's kept story-branch launch
  (`installFrontendStoryReview`) instead of a real worktree; the long Board is
  the default backlog plus `largeBacklog`'s list. At 700×800 the one-column
  Board shows Taken to open the review and Backlog to scroll its first card
  (the interim reviewed card was a Backlog card). Roster files come from
  `agentRosterRecords.ts`' now-exported `openDoughFiles`.
- All four interim files deleted; `dashboard-integrated` shards list 1/3: 18
  tests (was 29), 2/3: 37, 3/3: 32, each exit 0; `board-*` still matches seven
  specs, so `ci.yml` is unchanged.

Scratch break (Frontend boundary): `dashboard/src/columnPaging.ts` former key
`"open-dough.dashboardColumns.position"` renamed to `"open-dough.scratch.position"`
→ `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate
-i npx playwright test --config frontend.playwright.config.ts
frontend-tests/navigation/board-kept-position.spec.ts --grep "former Board key"
--reporter=list --workers=1` failed at `expectView`'s `toHaveText` (1 failed);
restored by editing back (`git diff dashboard/src` empty), the spec passed 6/6
and the navigation folder 22/22; typecheck exit 0.

Acceptance note: the interim `board-kept` journey's `expectSelectedProject`
calls after the project switch and reload checked the selected project and its
own stories, not the kept columns. `chooseProject` still asserts the choice;
the selected project kept across reload stays with `development-intent-frame`
(slice 5) and each project's own Board with `project-selection` (slice 7).

### 3. Preserve Board paging and reading
Type: Behavior
Status: done
Proof: `board-paging`, `board-paging-launch-dialog`, `board-paging-sessions-sidebar`,
`board-paging-side-panel`, `board-reading`, `board-native-reading`,
`board-session-reading` (771 lines): paging controls, reduced motion, focus
beside dialogs, sidebar and side panel, native/session reading and non-eager
read counts. Repoint `groupRunnerExamples.ts` to a surviving sibling-story spec
and pass `dashboard/backend-tests/runtime/runner-ownership.spec.ts`; drop the
emptied `board-*` pattern from shard 2 and list every shard.

Behavior: paging the Board beside each panel or reading a native session → the
same column, focus and reads, with no interim `board-*` spec remaining.

Assertion map (interim → Frontend, `dashboard/frontend-tests/navigation/`):
- `board-paging.spec.ts` five narrow-window cases (one-column moves and
  kept leftmost column across widths; keyboard handed to the other control;
  sticky heading and in-sight control down a long Backlog with clamp and kept
  position; reduced motion with no slide; Shift+Tab into a hidden Backlog's
  last card) → `board-paging.spec.ts`, same names; the long Backlog through
  `putFrontendBacklog`.
- `board-paging-side-panel.spec.ts` → `board-paging-side-panel.spec.ts`
  "beside the side panel a 54rem Board shows two columns …": the panel opens
  from the Taken card's observed working session (attached-terminal
  substitute) instead of an ad hoc Start session; the interim last step (a
  Backlog card's started session adds no Recently done count) is held by
  `../sessions/recently-done-active-story-sessions.spec.ts` (active story owns
  its session; Column paging count uses the rendered entries).
- `board-paging-launch-dialog.spec.ts` → same file and name; the Taken card's
  kept execution start comes from the machine answer's `keptStarts` (new
  `aMachineAnswer.keepingStarts(...)`) instead of a refused real launch.
- `board-paging-sessions-sidebar.spec.ts` → same file and name; the chosen
  session is the Ready story's observed working session; reveals recorded by
  `recordReveals`; counts follow the default substitute (`Taken 1 entry`).
- `board-reading.spec.ts` "body reading keys …" and
  `board-native-reading.spec.ts` "native modified reading keys …" →
  `board-reading-keys.spec.ts`, same names.
- `board-reading.spec.ts` "URL and Session entry reveal a tall card's top …"
  (1400×360, 700×800) and `board-session-reading.spec.ts` "the Session entry
  reveals the same story on the Board after Close at 700×{800,900,1600}" →
  `board-session-reading.spec.ts`, same names. The Close case now reveals the
  Ready story in its own project (was a Pygardon story chosen from Open
  Dough); a cross-project Session choice revealing its Board entry stays with
  `../sessions/recently-done-sessions-sidebar-paging.spec.ts`.
- None of the seven interim files held a non-eager read count or held/failed
  recovery assertion, so none moved here.
- All seven interim files deleted; `groupRunnerExamples.ts` names
  `navigation/source-navigation.spec.ts` "source navigation keeps an external
  reference apart from files in this snapshot"; shard `1:` in `ci.yml` drops
  `board-*`. Shards list 1/3: 3 tests, 2/3: 37, 3/3: 32, each exit 0;
  `node --test Distribution/tests/support/ci-browser-groups.test.mjs` 2/2;
  `backend-tests/runtime/runner-ownership.spec.ts` 5/5.

Scratch break (Frontend boundary): `dashboard/src/columnPaging.ts` stopped
listening for `focusin` (`for (const asked of [showHolding])`) →
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate
-i npx playwright test --config frontend.playwright.config.ts
frontend-tests/navigation/board-paging.spec.ts --grep "tabbing backwards"
--reporter=list --workers=1` failed at `expectView`'s `toHaveText` (control
still `Backlog 16 entries`); restored by editing back (`git diff dashboard/src`
empty); `frontend-tests/navigation/` then passed 37/37 with `--workers=2`;
typecheck exit 0.

Acceptance note: the interim side-panel journey's last step (a session started
from a Backlog card adds no Recently done count and the view stays) is owned by
`frontend-tests/sessions/recently-done-active-story-sessions.spec.ts` (an active
story owns its session; the paging count uses rendered entries) together with
the converted side-panel case's view assertions once the session panel opens.
The cross-project Close reading is owned by
`frontend-tests/sessions/recently-done-sessions-sidebar-paging.spec.ts`
(choosing Pygardon reveals its entry in view).

### 4. Preserve side-panel width
Type: Behavior
Status: planned
Proof: `side-panel-width`, `side-panel-width-kept`, `side-panel-width-covering`
(655 lines): divider-chosen width kept across reload within current room,
imposed widths and Maximize never replacing it, half-room starts for refused or
unusable storage, covering below the split query and recovery on a wide window.
Drop the emptied `side-*` pattern from shard 3 and list every shard.

Behavior: a chosen panel width → reload, narrower room or Maximize → the
recovered or imposed width as today, in Frontend cases.

### 5. Preserve the Development and Intent frame
Type: Behavior
Status: planned
Proof: `development-intent-frame`, `development-intent-frame-keyboard`,
`development-intent-frame-sessions` (516 lines): perspective default and
persistence across project change, Back/Forward/reload and System settings,
unconfigured Intent wording, perspective keys and sessions placement.

Behavior: switching perspective or project, or navigating history → the frame
keeps the selected perspective and project as today.

### 6. Preserve the dashboard header and frame looks
Type: Behavior
Status: planned
Proof: `dashboard-header`, `dashboard-header-compact`, `frame-board-look`,
`frame-launch-look`, `frame-sessions-look` (758 lines): one journey per banner
container branch, row below the banner, empty columns and failed reads in the
frame's look, whole text in a narrow window.

Behavior: each banner width branch and frame look → the same geometry,
readability and wording in Frontend cases.

### 7. Preserve project selection and keyboard navigation
Type: Behavior
Status: planned
Proof: `project-selection`, `project-keyboard-navigation`,
`project-keyboard-navigation-eligibility`, `project-keyboard-navigation-focus`
(625 lines): selection, page-wide arrow cycling, protected contexts and
modified keys leaving the project unchanged, focus across switches and held
previous reads isolated. Then list the interim command: none of the 30 files
remains. Shrink the `dashboard-integrated` shard matrix and declarations so
every shard selects remaining specs (P3), and pass the group-declaration
checks (`Distribution/tests/support/ci-browser-groups.test.mjs`) and
`runner-ownership.spec.ts`.

Behavior: arrow keys and project choice → the eligible project selected with
focus kept; the interim group still runs its remaining specs in every
declared shard.

## Decisive premises and observations

| Premise | Consuming operation | Observation (revision `4eb4f8e594ee003a2894c28c8ab2600e1c42b835`, 2026-11-17, owned workspace) | Result |
| --- | --- | --- | --- |
| P1. A Frontend case observes a kept Board position through real browser storage across reload. | Slices 2–4 Frontend cases. | Scratch `dashboard/frontend-tests/scratch/kept-columns-probe.spec.ts` (`openFrontendTakenBacklog`, 54 rem window, `showColumn(page, "Recently done")`, `expectView` before and after `page.reload()`), run with `env -u NO_COLOR -u FORCE_COLOR caffeinate -i npx playwright test --config dashboard/frontend.playwright.config.ts frontend-tests/scratch/kept-columns-probe.spec.ts --reporter=list --workers=1`; then the same with `keep()` in `dashboard/src/keptPreference.ts` not writing storage. | Passed (6.0 s); with the scratch break failed at the post-reload `expectView`; both scratch edits reverted. |
| P2. A `dashboard-integrated` shard pattern matching no spec refuses every shard. | Slices 3 and 4 shard declarations. | Moved `source-navigation.spec.ts` aside, then `OPEN_DOUGH_DASHBOARD_INTEGRATED_SPLIT=4/4 npx playwright test --config dashboard/integrated.playwright.config.ts --list`. | Exit 1: `pattern dashboard/tests/navigation/source-* of share 2 matches no check.`; file restored. |
| P3. With this story's 30 files gone and the emptied patterns dropped, the last shard selects nothing and fails. | Slice 7 shard matrix. | Moved the 30 files aside, removed `board-*` from shard 2 and `side-*` from shard 3 in a scratch `ci.yml`, listed shards 1–4 with `--reporter=list`. | Shards 1–3 listed 33/3/30 tests; shard 4 exit 1 `Error: No tests found`; files and `ci.yml` restored. |
| P4. Baseline selection. | Reconciliation in slice 7. | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/integrated.playwright.config.ts --list --reporter=list`. | `Total: 140 tests in 61 files`; 107 navigation, 33 Intent. |

## Concern evidence

Slice-plan refinement was not needed: slices follow spec families within
plan 647's measured per-slice range, and no slice holds an independent second
outcome. This review found no remaining slice-specific concern.
