# Move story destination and card selection checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#retire-integrated-ui-test-and-its-documents
**Source:** [Story destination and card selection](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-integrated-ui-test-and-its-documents)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Move 4 of the 11 remaining `dashboard/tests/navigation/` specs (564 lines, 11
tests) to Frontend homes, or a Backend or E2E home where a rule needs the real
server, with every assertion and product behavior preserved. The source owns
scope and exclusions: the six story-reference specs, `source-navigation`, the
group's retirement and the `dashboard/tests/` Markdown belong to its three
successor stories. No product code change. No blocking dependency.

## Existing solutions and current decisions

- Follow the delivered conversions (`54dfebff2` … `373ff581d`): specs land in
  `dashboard/frontend-tests/navigation/`, take `test` from
  `dashboard/tests/support/frontendApp.ts`, publish through the `put*` helpers
  of `frontendServiceState.ts`, hold reads with `holdAuthenticatedReads.ts`,
  fail them with `frontendAuthenticatedReadControl.ts` and count them with
  `countAuthenticatedReads` / `countProjectReads`. Reuse the page objects
  unchanged (`dashboardPage`, `storyCardControls`, `storyCardSelection`,
  `recentlyDoneColumn`, `agentRosterRecords.expectRoute`, `destinationCue`,
  `sessionNavigationJourney.recordReveals`). Add no second app harness.
- New arrangements go in their own `frontend*.ts` module:
  `frontendServiceState.ts` is 241 lines and `dashboardTest.ts` 243, and no
  edited file may pass 250.
- `notificationStoryJourney.ts` keeps its live page-side names (`storyUrl`,
  `storyDestination`, `expectArrivedAt`); E2E
  `sessions/session-alerts-navigation.spec.ts` still imports it. Slice 2
  removed `expectNoHostActions` and `notifiedCard`, left unused by the
  interim spec's deletion. Its
  server-side `notificationOrigins` stays for that E2E case. The Frontend
  arrangement reuses `projectSelectionProjects.ts` (`sharedStoryIdentity`,
  Doughnut and Open Dough publications) rather than a second copy of the
  shared-identity data.
- "No host action" (`expectNoHostActions`, `claudeLaunchCalls()`,
  `claudeAttaches()`) becomes "the page sent no non-GET `/__agent-launch`
  request and no attach request", as slice 1 of the delivered conversion did.
- `story-card-dependency-selection` needs a dependency revision in Frontend
  answers: a helper that turns `storyDependencyFixture.ts` data
  (`twoDependencies`, pure data) into published answers through
  `putFrontendPublished`. SEED-334#move-story-reference-checks reuses it; build
  only what this spec needs.
- An interim step that an existing maintained case already asserts is dropped
  only when the assertion map names that case and its assertion.
- The interim group keeps its seven other specs and its shard declaration
  (premise P3). `groupRunnerExamples.ts` names `source-navigation` as the
  group's quick case, which stays.
- Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  support the move; no conflict, no North Star topic.

## Outside-in proof ownership and gates

Before removing a spec, inspect its setup and assertions and record each
distinct assertion's destination in this plan: the exact new spec and test,
equivalent existing proof, or a Backend/E2E owner. Include negatives, focus,
keyboard, scroll reveals, reduced motion, history, read counts and held or
failed recovery. Split mixed cases across their real boundaries without
supplying the behavior under proof.

For each changed boundary, apply one scratch product break before conversion;
prove the replacement catches that same break and passes when restored, and
record the fault, observation and literal commands and results here. Keep the
interim case until its mapped replacement passes.

Each slice: rerun the installed test-entry selector for its paths (Frontend
selects MakeMe and page objects), then run the changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts <paths> --reporter=list --workers=2`,
the interim listing of both shards
(`OPEN_DOUGH_DASHBOARD_INTEGRATED_SPLIT=<i>/2 npx playwright test --config dashboard/integrated.playwright.config.ts --list --reporter=list`),
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/ci-browser-groups.test.mjs`,
`npm run lint`, `npm run --silent typecheck:dashboard`, and consumers from the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
of any changed support. Local gate: use `caffeinate -s -i` on awake macOS on
AC power; on battery use the maintained open-lid `caffeinate -i` procedure and
inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Default timeouts and retries stay; never `test.slow()`. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

| Promise (source) | Owning slice |
| --- | --- |
| Key example 1: cold URL arrival with a held revision | 1 |
| Key example 2: absent, unknown and failed destinations; superseding project choice | 2 |
| Key example 3: repeated destination cue | 3 |
| Key example 4: card selection and the Dependencies disclosure | 4 |
| Key example 5: no launch or attach request | 1, 4 (wherever the interim case asserted it) |
| Interim group runnable, shard declaration unchanged | every slice's listing and shard tests |

## Ordered slices

Paths are under `dashboard/tests/navigation/` unless named otherwise. Each
slice has 15 active minutes excluding command time.

### 1. Arrive at a story from its URL
Type: Behavior
Status: done
Proof: `notification-story-navigation` tests "cold story URL waits…",
"reload, direct open, and history…", "a target in a hidden column…" and
"opening the roster…" in
`dashboard/frontend-tests/navigation/story-url-destination.spec.ts`, on a new
Frontend arrangement of Doughnut and Open Dough sharing `SEED-777#shared-story`
with twelve stories queued ahead. Scratch break: reveal before the named
project's revision answers; the cold-arrival case fails on it.

Behavior: a story URL opened cold, reloaded, reached through Back or Forward,
or naming a hidden column → the page waits for the named project, then the
card holds the keyboard in view with the route kept; a project choice clears
the target; reduced motion scrolls with `behavior: auto`.

Assertion map (interim → `frontend-tests/navigation/story-url-destination.spec.ts`,
same test names; arrangement `tests/support/frontendStoryUrlDestination.ts`):

- Cold URL: project choice Doughnut; revision requested
  (`target.requests > 1` → Doughnut's reads held, `held() > 0`); no reveal;
  card absent; Open Dough not read (`other.requests` → `countProjectReads(open-dough) = 0`);
  after release arrived (focused, in view); Open Dough's telling absent;
  route `story` kept; no hash; Tab keeps keyboard within the card; no
  "Reading preparation…"; Inspect expands and no further reveal. All in
  "cold story URL waits…" (three steps).
- Reload/history: focused; destination cue with motion; not selected; cue
  ends; reload arrives; Open Dough choice shows its card and clears `story`;
  Back refocuses with cue and keeps `story`; Forward shows Open Dough and
  clears it. All in "reload, direct open, and history…" (page clock paused).
- Hidden column: 650×750, reduced motion; arrived; `.board-row`
  `data-hidden="1 3"`; reveal `{ behavior: "auto" }`. In "a target in a hidden
  column…".
- Roster: card focused; roster button opens "Agent roster" and clears
  `story`; Back keeps the card in view, restores `story`, keyboard within. In
  "opening the roster…" (Open Dough alone, Akiho executing the Taken story;
  the interim Pygardon and unlistable profiles were incidental).
- No host action (`claudeLaunchCalls`, `claudeAttaches`, Claude `resume`,
  Codex thread/turn calls; all reached only through the page's launch or
  attach requests) → `recordHostRequests` equals `[]` (no non-GET
  `/__agent-launch*`, no `/__agent-terminal*` request or WebSocket) at the end
  of each of the four tests. Server-side launch effects stay with E2E
  `sessions/session-alerts-navigation.spec.ts` and the launch Backend cases.

Scratch break (P5): `dashboard/src/StoryDestination.tsx`, first line of the
`useLayoutEffect`: `if (enabled && knownProject && !listed) document.body.scrollIntoView();`
(scroll before the named project's revision answers). `node .claude/skills/dough-execute-plan/scripts/slice-clock.mjs run … -- env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-url-destination.spec.ts -g "cold story URL" --reporter=list --workers=2`:
exit 1, `expect(await revealsOf(page)).toEqual([])` received one reveal.
Product restored from a copy (`git status` clean for `dashboard/src`); the
full spec then: 4 passed (4.7 s), exit 0.

Refactor: `recordHostRequests` moved to `tests/support/frontendHostRequests.ts`
and `holdProjectReads` to `tests/holdAuthenticatedReads.ts` (also used by
`project-keyboard-navigation-focus.spec.ts`), ready for slices 2 and 4; the
roster case reuses `takenStory`/`takenIdentity` from `agentRosterRecords.ts`.
Both specs 5 passed after it. Learning for slice 4: `publishRosterStory`
duplicates `stories/agent-roster-collection.spec.ts` `openRoster` setup (Open
Dough with one agent executing its Taken story); fold them together when slice
4 or a later change next touches roster setup.

### 2. Explain a story destination that cannot be shown
Type: Behavior
Status: done
Proof: the other four `notification-story-navigation` tests ("an unknown
project…", "an absent story is distinct from failed reading…", "a project
choice supersedes a pending story destination…", "ordinary project replacement
in settings…") in
`dashboard/frontend-tests/navigation/story-url-destination-unavailable.spec.ts`,
then delete the interim spec. Failed reads are route answers through
`controlFrontendAuthenticatedRead`; the settings removal reuses the journey of
`configuration/system-settings-project-management-touch.spec.ts`. Scratch
break: show the absent wording for a failed read; the distinction case fails.

Behavior: an unknown project, an absent story, a failed read or a superseding
choice → its own explanation with the identity kept, "Retry story destination"
or "Show project stories" recovering, and no late reveal.

Assertion map (interim → `frontend-tests/navigation/story-url-destination-unavailable.spec.ts`,
same test names; arrangement `answerSharedStoryProjects`; interim
`otherTitle`/`notifiedCard` → `openDoughSharedTitle`/`doughnutSharedTitle` cards):

- Unknown: "Project retired-project is not configured"; identity kept; route
  `project=retired-project`; no card focused; "Show project stories" removes
  the region, clears `story`, shows Open Dough's card. In "an unknown project…".
- Absent vs failed: SEED-404#gone → "is not listed in Doughnut's published
  work", identity shown, no card focused (plus: no Retry offered). Failed read
  (interim `answerWith("main", noConnection)`) →
  `controlFrontendAuthenticatedRead(source=doughnut).unreachable()`: "could not
  be read", not "is not listed", identity kept, no card focused. `pass()` then
  "Retry story destination" → Doughnut's card focused, region gone. In "an
  absent story is distinct…" (three steps).
- Superseding choice: Doughnut's reads held (`target.requests > 1` →
  `held() > 0`); choose Open Dough → its card visible; release; choice stays
  Open Dough; `story` cleared; `revealsOf` `[]` (no late reveal); Doughnut's
  card absent. In "a project choice supersedes…".
- Settings removal: arrival focused; System settings → Remove project
  Doughnut → confirm dialog hidden; `story` cleared; Back to dashboard →
  remaining project chosen (interim Pygardon, its first remaining project →
  Open Dough here, the only one left); no region; `story` cleared. In "ordinary
  project replacement…", on `installFrontendSettingsSubstitutes` with Open
  Dough and Doughnut configured, the journey of
  `configuration/system-settings-project-management-touch.spec.ts`. That the
  server rewrites the file is E2E `configuration/project-remove.spec.ts`.
- No host action (`expectNoHostActions`) → `recordHostRequests` equals `[]` at
  the end of each of the four tests.

Scratch break (P5): `dashboard/src/StoryDestination.tsx`, `status === "failed"`
rendered the absent wording (`"failed" && false` branch; `absent || failed`
shows "is not listed"). `node .claude/skills/dough-execute-plan/scripts/slice-clock.mjs run … -- env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-url-destination-unavailable.spec.ts -g "an absent story is distinct" --reporter=list --workers=2`:
exit 1 in step "an unread Doughnut is a failed read…", expected "could not be
read", received "Story SEED-777#shared-story is not listed in Doughnut's
published work.". Restored from a copy (`git status` shows no `dashboard/src`
change); both story URL specs then 8 passed (6.2 s), exit 0. Interim spec
deleted; `notificationStoryJourney.ts` unchanged, its `expectNoHostActions`
and `notifiedCard` now without a consumer.

### 3. Cue a repeated story destination
Type: Behavior
Status: done
Proof: `story-destination-repeat-cue` in
`dashboard/frontend-tests/navigation/story-destination-repeat-cue.spec.ts` on
`frontendStoryReviewOpen.ts` (`keepTakenReviewLaunch`,
`openFrontendStoryReview`) with `destinationCue.ts` unchanged; delete the
interim spec. Scratch break: skip the cue when the destination is unchanged;
the case fails.

Behavior: the selected, inspected and reviewed destination asked for again by
Back from Intent or Settings → the cue runs again; selection, detail and the
review heading stay.

Assertion map (interim → `frontend-tests/navigation/story-destination-repeat-cue.spec.ts`,
same test name; arrangement `keepTakenReviewLaunch` + `installFrontendStoryReview`
and a cold `storyUrl("open-dough", takenIdentity)` — `openFrontendStoryReview`
opens `/` first, so it cannot express the URL arrival; interim committed
origin, story worktree and `keepLaunchRecords` → the substitute Taken Story A
with its kept story-branch launch; 1920×900 so the open review leaves the Taken
card uncovered):

- Arrival: card focused; destination cue with motion; cue ends (page clock
  paused).
- Review: Review changes → review heading (level 2) is the Taken story's title.
- Inspect → selected, inspected, in viewport.
- Per ask-again (Back from Intent: Intent radio checked, card gone, Back;
  System settings → Back to dashboard): route keeps `story`; card focused;
  destination cue with motion (6a); selected, inspected, review heading
  unchanged (6b); cue ends; still selected. Same loop as the interim.
- No host action: the interim asserted none, so no `recordHostRequests` check
  is added (commitment 8 not applicable here).

Scratch break (P5): `dashboard/src/pageEntries.ts` `revealStory` cued only when
the identity differed from the last cued one (`if (identity !== lastCued) cueDestination(card); lastCued = identity;`).
`node .claude/skills/dough-execute-plan/scripts/slice-clock.mjs run … -- env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-destination-repeat-cue.spec.ts --reporter=list --workers=2`:
exit 1 at spec line 72 (first ask-again, Back from Intent),
`expectDestinationCue` `toHaveClass(/\bstory-card-destination-cue\b/)`
received "story-card story-card-selected". Restored from a copy (`git diff
--stat dashboard/src` empty); the spec then 1 passed (3.5 s), exit 0. Interim
spec deleted; no support left without a consumer (`destinationCue.ts`,
`storyReviewWorktree.ts`, `launchStore.ts`, `reviewRead.ts` and the rest keep
other importers).

### 4. Select a story card without opening it
Type: Behavior
Status: planned
Proof: `story-card-selection` and `story-card-dependency-selection` in
`dashboard/frontend-tests/navigation/story-card-selection.spec.ts` and
`story-card-dependency-selection.spec.ts`, on `frontendRecentlyDoneSelection.ts`,
`frontendCardSessions.ts`, `putFrontendDoneRecords` and the new dependency
answers helper; delete both interim specs. A step already asserted by
`frontend-tests/sessions/recently-done-sessions-select*.spec.ts` or
`intent/intent-project-visit-selection.spec.ts` is mapped to that case instead
of copied. Scratch breaks: select the card on Inspect; toggle selection from
the Dependencies disclosure. Each fails its case.

Behavior: an empty-area click on an active or Recently done card → selection
toggles and detail stays as it was; Inspect, a disabled Start, a session
entry, the Dependencies disclosure and its explanation → selection unchanged;
selection survives a visit to Intent.

## Decisive premises and observations

Observed in this workspace at `87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`,
2026-11-18, AC power, load 5–12, after `node scripts/setup-native.mjs npm` and
`browser`.

| Premise and consuming operation | Result and remainder |
| --- | --- |
| P1. The four interim specs pass before conversion (every slice's baseline). | `npx playwright test --config dashboard/integrated.playwright.config.ts navigation/notification-story-navigation.spec.ts navigation/story-destination-repeat-cue.spec.ts navigation/story-card-selection.spec.ts navigation/story-card-dependency-selection.spec.ts --reporter=list --workers=2`: 11 passed (16.9 s). |
| P2. The Frontend homes the slices extend run here (slices 1, 2, 4). | `npx playwright test --config dashboard/frontend.playwright.config.ts navigation/project-selection.spec.ts sessions/recently-done-sessions-select configuration/system-settings-project-management-touch.spec.ts --reporter=list --workers=2`: 15 passed (14.4 s). The shared-identity arrangement, held revision and dependency answers are new; slices 1 and 4 build them first, and a case they cannot express keeps a Backend or E2E home under the proof rule above. |
| P3. Removing the four specs leaves both shards selecting specs and the shard checks green (every slice). | With the four specs moved aside: shard 1/2 lists 3 tests in 1 file, shard 2/2 lists 19 tests in 6 files; `bash scripts/test.sh Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/ci-browser-groups.test.mjs` exit 0. Specs restored. |
| P4. Shared support survives the deletions (slices 2–4). | `grep` importers: `notificationStoryJourney.ts`, `storyDependencyFixture.ts` and `destinationCue.ts` are imported by E2E specs or the seven remaining interim specs; none becomes unused here. Execution's consumer trace rechecks after each deletion. |
| P5. Each replacement discriminates (every slice). | Not observable before the replacements exist: each slice's paired scratch break above settles it and records the result here. Slice 1: an early `document.body.scrollIntoView()` in `useStoryDestination` before Doughnut's revision answers fails "cold story URL waits…" (exit 1, one reveal recorded); restored, the spec passes 4/4 (record under slice 1). Slice 2: the absent wording for a failed read fails "an absent story is distinct…" (exit 1, "is not listed" received); restored, 8/8 pass (record under slice 2). Slice 3: cueing only a changed identity in `revealStory` fails the repeat-cue case at the first ask-again (exit 1, no cue class); restored, 1/1 passes (record under slice 3). |

Refinement: not needed; four slices with one proof loop each, no cumulative
design beyond the two small arrangements named above.

Remaining slice-specific concerns: none identified in this review.
