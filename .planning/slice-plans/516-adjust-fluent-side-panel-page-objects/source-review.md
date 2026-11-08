# Source review

Launched 2026-11-08 by the coordinator of SEED-268#adjust-fluent-side-panel-page-objects: a fresh general-purpose agent, no conversation inheritance, given only the story text (seed lines 19–118 without its state block, in the job tmp directory as `source.md`), told to read no other file, change nothing, and return numbered commitments. The extraction ended one line early, so the reviewer flagged item 24c as cut off; the coordinator added its source text in brackets. Slice allocation is the coordinator's.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A dashboard test maintainer can add a page object or a hand-off between page objects in the Side panel pilot by editing the destination's own module and the phase's page-object set | slice 1 | observed: slice 1 probe: new hand-off touched finalReportPages.ts + one spec phase only; type-check and spec passed |
| 1a | ...without growing a module that holds the base, the Side panel and its contents together (now `dashboard/tests/sidePanelContentPages.ts`, 246 of the 250-line refactor limit) | slice 1 | observed: dashboard/tests/fluentPageObject.ts 41, sidePanelFramePages.ts 98, storyReviewPages.ts 121, finalReportPages.ts 19 lines; sidePanelContentPages.ts removed |
| 2 | Readers see what each negative assertion expects at the call site | slice 2 | observed: switching spec nine sites read expectNotSelected/expectNotInspected/expectNotShownInTerminal |
| 3 | The landed evidence lets `SEED-268#conclude-fluent-side-panel-pilot` compare the revised design with the pilot | slice 2 | observed: PLAN.md Revised design evaluation: journeys, probe, controlled failure, sizes vs baseline, locator owner |
| 4a | Each page object reaches the object the reader is at next through the current phase's own page-object set (`SidePanelPages`), not by constructing another module's class | slice 1 | observed: storyCardPages.ts/terminalPages.ts/sidePanelFramePages.ts hand-offs return this.pages.<object>; only new outside the SidePanelPages class is Board.storyCard (same module) |
| 4b | Hand-offs keep returning that object, so specs keep their chains | slice 1 | observed: both pilot specs unchanged; step tree identical to baseline (session id masked), 3 passed |
| 4c.1 | Any object can now reach the Board | slice 1 | observed: fluentPageObject.ts protected pages: SidePanelPages exposes board, sidePanel, terminal, sessionsSidebar to every object |
| 4c.2 | ...the Side panel | slice 1 | observed: fluentPageObject.ts protected pages: SidePanelPages exposes board, sidePanel, terminal, sessionsSidebar to every object |
| 4c.3 | ...the Terminal | slice 1 | observed: fluentPageObject.ts protected pages: SidePanelPages exposes board, sidePanel, terminal, sessionsSidebar to every object |
| 4c.4 | ...the Sessions sidebar | slice 1 | observed: fluentPageObject.ts protected pages: SidePanelPages exposes board, sidePanel, terminal, sessionsSidebar to every object |
| 5a.1 | The shared base has its own module | slice 1 | observed: dashboard/tests/fluentPageObject.ts |
| 5a.2 | The Side panel frame has its own module | slice 1 | observed: dashboard/tests/sidePanelFramePages.ts |
| 5a.3 | Each content object (Story review, Final report) has its own module | slice 1 | observed: dashboard/tests/storyReviewPages.ts and dashboard/tests/finalReportPages.ts |
| 5b | Page-object modules depend on the base at run time and on the set only as a type | slice 1 | observed: page-object modules import PageObject at run time; SidePanelPages only via import type in fluentPageObject.ts and storyCardPages.ts |
| 5c | Only the set's construction knows every class | slice 1 | observed: sidePanelPages.ts class SidePanelPages is the only module importing every class |
| 6a.1 | `expectNotSelected()` replaces `expectSelected(false)` (Story card) | slice 2 | observed: storyCardPages.ts StoryCard.expectNotSelected(); switching spec 7 sites |
| 6a.2 | `expectNotInspected()` replaces `expectInspected(false)` | slice 2 | observed: storyCardPages.ts StoryCard.expectNotInspected(); switching spec 1 site |
| 6a.3 | `expectNotShownInTerminal()` replaces `expectShownInTerminal(false)` | slice 2 | observed: storyCardPages.ts StoryCard.expectNotShownInTerminal(); switching spec 1 site |
| 6b | The positive operations take no boolean | slice 2 | observed: storyCardPages.ts expectSelected(), expectInspected(), expectShownInTerminal() take no argument |
| 7.1 | Keep the phase runner (`support/cueSheet.ts`) | slice 2 | observed: support/cueSheet.ts unchanged (git diff 42b2cc193..) |
| 7.2 | Keep every cue name and order | slice 2 | observed: JSON step tree identical to base after session-id mask, after slices 1 and 2 |
| 7.3 | Keep one locator owner per shared control | slice 2 | observed: PLAN.md Revised design evaluation: "Review changes" only at storyCardPages.ts:47 |
| 7.4 | Keep the MakeMe facts at the call site | slice 2 | observed: spec diffs touch only the nine negative call sites; MakeMe arrangements unchanged |
| 7.5 | Keep the browser, transport and native observations between phases | slice 2 | observed: spec diffs touch only the nine negative call sites; between-phase observations unchanged |
| 8 | Update the "Fluent phases" section of `dashboard/tests/writing-journeys.md` to the revised ownership | slice 1 | observed: dashboard/tests/writing-journeys.md Fluent phases section names new modules and set hand-offs |
| 9 | Limit changes to the pilot's two specs, its page-object modules and that section | slice 2 | observed: branch diff: pilot specs, pilot page-object modules, writing-journeys.md Fluent phases, plan records |
| 10a | Shared helpers keep their signatures | slice 2 | observed: storyCardSelection.ts and cueSheet.ts unchanged |
| 10b | `storyCardSelection.ts`'s boolean `expectSelected` and `expectInspected` (used by 29 test files) stay as they are and are called by the named page-object operations | slice 2 | observed: storyCardSelection.ts unchanged; StoryCard named operations call expectSelected/expectInspected with true/false |
| 11.1 | Not in scope: page objects for other journeys | slice 2 | observed: no other journey's page objects or new routes; probe reverted; step tree unchanged |
| 11.2 | Not in scope: new journey behavior | slice 2 | observed: no other journey's page objects or new routes; probe reverted; step tree unchanged |
| 11.3 | Not in scope: a route a spec does not use | slice 2 | observed: no other journey's page objects or new routes; probe reverted; step tree unchanged |
| 11.4 | Wider adoption stays with the conclusion story | slice 2 | observed: no other journey's page objects or new routes; probe reverted; step tree unchanged |
| 12a | Module dependencies point one way: spec → `sidePanelPages.ts` (phase and set construction) → each page-object module → the base | slice 1 | observed: imports: specs -> sidePanelPages.ts -> page-object modules -> fluentPageObject.ts |
| 12b | A page-object module names another page object only through the set's type (erased by TypeScript), so splitting modules adds no run-time import cycle | slice 1 | observed: fluentPageObject.ts back-reference is import type only; typecheck:dashboard and Playwright run pass |
| 12c | Today's cycle holds them in one module: the base's `sidePanel` getter constructs `SidePanel`, which extends the base and constructs `StoryReview`/`FinalReport`, whose `close()` returns `this.sidePanel` (context) | slice 1 | observed: cycle removed: SidePanel in sidePanelFramePages.ts, content close() uses base sidePanel getter typed from the set |
| 13 | Keep the page objects' ubiquitous-language names (Side panel, Story review, Final report) | slice 1 | observed: classes SidePanel, StoryReview, FinalReport kept |
| 14 | The evaluation is prospective under the definition of improvement (ADR 0010); its baseline is the pilot's measured state, set before the run | slice 2 | observed: PLAN.md Revised design evaluation compares against the seed's pre-set baseline at 77741589a |
| 15 | Hand-off through the set: `board.storyCard("Story A").reviewChanges().expectStory("Story A")`. `reviewChanges()` returns the phase's `storyReview` from its set, and the cues keep the same order and names | slice 1 | observed: storyCardPages.ts reviewChanges() returns this.pages.storyReview; step tree identical |
| 16 | Back from content: `sidePanel.storyReview.close().expectItems(0)`. `close()` returns the phase's Side panel, from a content module that does not import the Side panel module at run time | slice 1 | observed: replacement spec close().expectItems(0) runs (step tree: Story review: Close, Side panel: shows 0 items); storyReviewPages.ts has no Side panel import |
| 17 | Named negative: the switching journey checks that Story B is not Selected. The spec reads `board.storyCard("Story B").expectNotSelected()`, and the cue is still named `Story card "Story B": not selected` | slice 2 | observed: switching spec board.storyCard("Story B").expectNotSelected(); cue Story card "Story B": not selected in step tree |
| 18a | Extension probe: a scratch change gives the Final report a hand-off to the Board, used by one phase. It edits only the Final report's module and that phase, type-checks, and the journey passes | slice 1 | observed: probe: FinalReport get board() + one phase .board.storyCard("Story B").expectShown(); type-check passed, replacement spec 2 passed |
| 18b | The probe is reverted | slice 1 | observed: probe edits removed; step tree identical after revert |
| 18c | The modules the probe touched are recorded | slice 1 | observed: probe touched finalReportPages.ts and side-panel-content-replacement.spec.ts; to be written in Revised design evaluation (slice 2) |
| 19 | Baseline (pilot at `77741589a`): runner + page objects 709 lines (`sidePanelContentPages.ts` 246, `storyCardPages.ts` 161, `sidePanelPages.ts` 139, `terminalPages.ts` 96, `support/cueSheet.ts` 65); specs 250 (replacement) and 239 (switching); 9 boolean negative calls in the switching spec; one owner of the `Review changes` locator (`StoryCard`) | slice 2 | observed: PLAN.md Revised design evaluation Sizes table baseline column |
| 20a | On the revised design, pass and record the journey: review, another story's review, and final report replacement, including the held response race and panel controls | slice 2 | observed: PLAN.md Revised design evaluation Journeys row 1: replacement spec test passed 5.3 s |
| 20b | Pass and record the journey: review and final report retention across Board and Intent, including the selected file and Intent's separate comparison | slice 2 | observed: PLAN.md Revised design evaluation Journeys row 2: retention test passed 4.1 s |
| 20c | Pass and record the journey: review and Terminal replacement beside the Board, including reattachment of the same session | slice 2 | observed: PLAN.md Revised design evaluation Journeys row 3: switching spec test passed 4.4 s |
| 21a | Run the dashboard type-check | slice 2 | observed: npm run --silent typecheck:dashboard passed |
| 21b | Run the dashboard lint | slice 2 | observed: npm run --silent lint passed |
| 21c | Run the specs of any other consumer of a changed module | slice 2 | observed: consumer trace: only the two pilot specs use StoryCard/changed modules; both ran |
| 22a | A controlled assertion failure still names the phase and step | slice 2 | observed: PLAN.md Revised design evaluation Controlled failure: report names test › phase › cue (Story review: of Story Z) |
| 22b | ...reports the expected and received values | slice 2 | observed: PLAN.md Revised design evaluation Controlled failure: Expected "Story Z" Received "Story A" |
| 22c | ...stops later cues | slice 2 | observed: PLAN.md Revised design evaluation Controlled failure: JSON step tree ends at the failing cue |
| 22d | Restore the assertion and confirm the journey passes | slice 2 | observed: PLAN.md Revised design evaluation Controlled failure: restored spec 2 passed |
| 23a | Record the revised module and spec sizes against the baseline | slice 2 | observed: PLAN.md Revised design evaluation Sizes table |
| 23b | Record that no module is over 250 lines | slice 2 | observed: PLAN.md Revised design evaluation Sizes: none above 250, largest 173 |
| 23c | Record the extension probe's touched modules | slice 2 | observed: PLAN.md Revised design evaluation Extension probe: finalReportPages.ts and replacement spec |
| 23d | Record whether the shared `Review changes` locator still has one owner in the pilot | slice 2 | observed: PLAN.md Revised design evaluation Review changes locator: one owner, StoryCard |
| 24a | Follow the test automation rules (AGENTS.md#test-automation) | slice 2 | observed: no sleeps, no test.slow(), default timeouts, no new test data |
| 24b | Follow the failing and flaky test policy (AGENTS.md#failing-and-flaky-tests) | slice 2 | observed: no failing or flaky runs besides the controlled failure |
| 24c | [Reviewer input was cut off after "and"; the source's third item is the macOS test gate (tests/local-test-resources.md#machine-sleep-on-macos)] | slice 2 | observed: only ~12 s focused runs; Local gates reserve caffeinate for longer runs |
