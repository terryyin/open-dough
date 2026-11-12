# Source review — SEED-300#express-board-test-intent-through-page-objects

Launch: 2026-11-12, by the execution coordinator (agent dbs-chan) before the first
implementation delegation. A fresh general-purpose reviewer, without conversation
inheritance, fork or resume, received only the story's Goal, Scope, Key examples,
"Audit findings owned by this story" and the seed's "Shared acceptance for each
receiving story", extracted verbatim from
`.planning/seeds/SEED-300-dashboard-test-page-objects.md` at `6d102beae`
(lines 328–485 without the `**Plan:**` link, and lines 178–204). It was told to
read no other project file, change nothing, and return numbered commitments,
qualifications, examples and exclusions without slice ownership or acceptance.
The returned kind is kept in parentheses before each source commitment.

Whole-story commitments are allocated to slice 8, which completes the story; every
slice's delegation still carries them as constraints.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | (commitment) A developer reading Board and published-read tests in Intent can follow the user's navigation. | slice 8 | |
| G2 | (commitment) A developer reading those tests can follow the published facts being read. | slice 8 | |
| G3 | (commitment) A developer reading those tests can follow the independent result. | slice 8 | |
| G4 | (commitment) Shared browser controls have one maintained owner. | slice 8 | |
| G5 | (commitment) Repeated reading observations have one maintained owner. | slice 8 | |
| G6 | (commitment) Changing a control requires one mechanics edit. | slice 8 | |
| G7 | (qualification) The single owner and single edit come "without concealing the causal sequence that makes the test useful." | slice 8 | |
| S1 | (commitment) "Resolve all six allocated findings below." | slice 8 | |
| S2 | (commitment) Also resolve "current same-control or same-sequence sibling callers" in the areas S2.1–S2.6. | slice 8 | |
| S2.1 | (commitment) Area: Board columns and accessible reading. | slice 2 | observed: slice 2 with slice 1: Board column/reading callers migrated — board-scroll, board-paging, board-reading, board-native-reading, accessible-board-keyboard, accessible-board-touch (F1e); dispositions in PLAN slice 2 accepted note |
| S2.2 | (commitment) Area: project/header/destination focus. | slice 3 | observed: slice 3: all 10 C3 specs plus board-kept chooseProject and project-read-isolation focusCanonicalRecord use projectChoice/bannerReading/notificationStoryJourney/storyCardControls owners; remaining non-navigation project-tab sites are O4 |
| S2.3 | (commitment) Area: story inspection and references. | slice 4 | observed: slice 4: all 10 C4 specs, fluent storyCardPages StoryCard, board-height, story-card-inspection, story-dependencies(-touch), agent-launch-start-dependencies, storyDependencyAccessible and publishedFactsAssertions use storyReference.ts/storyCardControls/storyCardSelection owners; remaining same-control callers are O5 |
| S2.4 | (commitment) Area: card evidence. | slice 5 | observed: slice 5: six audited callers, C5 siblings, readiness/queued-plan support, publishedFactsAssertions, start-eligibility and session-attribution use agentCredit.ts/storyCardFacts.ts; remaining credit/badge callers are O6 |
| S2.5 | (commitment) Area: Recently done ranges. | slice 6 | |
| S2.6 | (commitment) Area: published facts, refresh and recovery. | slice 8 | |
| S3 | (commitment) "Reuse existing procedural/component owners." | slice 8 | |
| S3a | (qualification) The reuse includes "their fluent callers where reached." | slice 8 | |
| S4 | (commitment) Keep the facts in S4.1–S4.12 "visible as scenario facts." | slice 8 | |
| S4.1 | (commitment) Concrete column order. | slice 1 | observed: slice 1: board-paging.spec.ts expectView(page, ["Taken"], [...]) explicit lists and region-order toHaveAccessibleName loop; board-clamp expectView per step |
| S4.2 | (commitment) Concrete entry order. | slice 6 | |
| S4.3 | (commitment) Concrete key order. | slice 3 | observed: slice 3: dashboard-header-compact pressProjectListKeys(page, ["ArrowDown","ArrowDown","Escape"]) and [...,"Enter"]; Right/Left loops in project-keyboard-navigation; modified-arrow list in eligibility; Shift+Tab walk in dashboard-header |
| S4.4 | (commitment) Viewport. | slice 1 | observed: slice 1: setViewportSize facts at call sites — board-scroll 1400×420/700×800 loop, board-paging 40rem/54rem, board-clamp 54/80/40rem, board-kept narrow/wide |
| S4.5 | (commitment) Input modality. | slice 2 | observed: slice 2: accessible-board-touch keeps tapWhereShown and rotation sizes at call site; board-reading/board-native-reading pass the literal key to readWithKey(page, "End"\|down\|up) |
| S4.6 | (commitment) Selected story. | slice 4 | observed: slice 4: expectSelected(card) facts stay at call sites in story-card-selection, story-card-inspection, story-reference-navigation and story-destination-repeat-cue |
| S4.7 | (commitment) Focus. | slice 2 | observed: slice 2: board-reading expect(parts(page).board).toBeFocused() after readWithKey("End"); expect(control).toBeFocused() after PageDown; accessible-board-keyboard tabTo(page, inspect) then expect(inspect).toBeFocused() |
| S4.8 | (commitment) Retained reading place. | slice 7 | |
| S4.9 | (commitment) Expected actor counts. | slice 5 | observed: slice 5: backlog-preparing "two preparation assignments…" expect(credit(card(storyA)).agent).toHaveText([first, second]); agent-roster-avatar expectHumanAvatar(member("Akiho-chan"), credited, {width, revision}) |
| S4.10 | (commitment) Expected link counts. | slice 5 | observed: slice 5: storyReadinessRecordGaps canonicalRecord(malformedSources) toHaveCount(1) and Slice plan count 0; queuedPlanNavigation exact canonicalRecord(detail) href |
| S4.11 | (commitment) Expected status counts. | slice 5 | observed: slice 5: story-dependencies expectBadges(card,{shown:[…,"Blocked by 2 dependencies"], absent:["Ready for execution"]}) then "Blocked by 1 dependency" |
| S4.12 | (commitment) Expected slice counts. | slice 5 | observed: slice 5: taken-slice-progress expectSliceBar(card(counted), "1 of 3 slices recorded complete", ["done","planned","planned"]) then "2 of 3…" ["done","done","planned"] |
| S4.13 | (commitment) Malformed-record messages. | slice 5 | observed: slice 5: story-dependencies-malformed literal toContainText("Dependency facts unavailable: …not valid JSON."); taken-slice-progress expectNoSliceCount(card(unreadable), "Plan slices uninterpretable:"); roster gap texts literal |
| S5 | (commitment) "Inspection and selection remain distinct." | slice 4 | observed: slice 4: expectSelected and expectInspected remain separate call-site assertions (story-card-selection emptyArea click → expectSelected; Inspect story → expectInspected) |
| S6 | (commitment) Actions S6.1–S6.4 "stay separately invocable." | slice 4 | observed: slice 4: story-reference-done-cancellation "pointer down stops…": pointerDownOn(ownAction); release(); focus assertions; page.mouse.up() each a separate line |
| S6.1 | (commitment) Pointer-down. | slice 4 | observed: slice 4: storyCardControls.ts pointerDownOn(action) presses down and leaves it down; P2-style fault (mouse.down removed) failed expect(destination).not.toBeFocused() at spec L80; restored byte-for-byte (sha a5d02d12…) |
| S6.2 | (commitment) Held-answer release. | slice 4 | observed: slice 4: done-cancellation scenario calls release() returned by published.hold(farDone.path) between pointerDownOn and mouse.up |
| S6.3 | (commitment) Intermediate focus. | slice 4 | observed: slice 4: done-cancellation expect(destination).not.toBeFocused(); expect(ownAction).toBeFocused() before mouse.up |
| S6.4 | (commitment) Pointer-up. | slice 4 | observed: slice 4: done-cancellation await page.mouse.up() in the scenario, then "Detail for Story A" visible and Hide detail focused |
| S7 | (commitment) Evidence S7.1–S7.7 stays "at the boundary whose causal sequence they prove." | slice 8 | |
| S7.1 | (commitment) Controlled clock steps. | slice 8 | |
| S7.2 | (commitment) Request logs. | slice 8 | |
| S7.3 | (commitment) Pinned revisions. | slice 7 | |
| S7.4 | (commitment) Git evidence. | slice 8 | |
| S7.5 | (commitment) HTTP evidence. | slice 5 | observed: slice 5: request counts, contentPathsRead, avatar reads(...), origin.requests and gh budget assertions stay in the specs, outside agentCredit.ts/storyCardFacts.ts |
| S7.6 | (commitment) Host evidence. | slice 8 | |
| S7.7 | (commitment) Record evidence. | slice 6 | |
| S8 | (commitment) "Shared observations accept independent expectations." | slice 8 | |
| S9 | (commitment) Shared observations "do not obtain expected answers from production." | slice 8 | |
| S10 | (commitment) Shared observations do not obtain expected answers "from the fixture's result." | slice 8 | |
| S11 | (commitment) "Each finding receives an evidence-backed caller disposition." | slice 8 | |
| S12 | (commitment) Each finding receives "a representative before/after against the audit." | slice 8 | |
| S12a | (qualification) The before/after is "reconciled to current source." | slice 8 | |
| S13 | (commitment) "The result worth keeping is clearer actions." | slice 8 | |
| S14 | (commitment) The result worth keeping has clearer outcomes. | slice 8 | |
| S15 | (commitment) The result worth keeping has "fewer mechanics edit sites." | slice 8 | |
| S16 | (qualification) Fewer edit sites must come "at a justified helper cost." | slice 8 | |
| S17 | (commitment) "Every distinct behavior check" is preserved. | slice 8 | |
| S18 | (commitment) Every "existing test tier" is preserved. | slice 8 | |
| S19 | (qualification) "Exact accessibility/DOM/geometry contract observations may remain direct when their independent evidence requires it." | slice 8 | |
| S20 | (qualification) "Merely moving locators is insufficient." | slice 8 | |
| S21 | (commitment) "Use MakeMe for domain data." | slice 8 | |
| S22 | (commitment) Use "observable waits or controlled clocks." | slice 8 | |
| E1 | (exclusion) No new dashboard behavior. | slice 8 | |
| E2 | (exclusion) No whole-suite speed promise. | slice 8 | |
| E3 | (exclusion) No case-count promise. | slice 8 | |
| E4 | (exclusion) No universal fluent conversion. | slice 8 | |
| E5 | (exclusion) No new framework. | slice 8 | |
| E6 | (exclusion) No "wholesale migration of Review, Terminal, session/report, launch, settings or Intent siblings." | slice 8 | |
| E6a | (commitment) "Include their reached shared-control callers" (callers in Review, Terminal, session/report, launch, settings or Intent siblings). | slice 8 | |
| E6b | (qualification) Those included callers keep "their other workflow ownership." | slice 8 | |
| E7 | (qualification) "Necessary test/harness repair follows the project's failing/flaky-test policy." | slice 8 | |
| E8 | (exclusion) "No new product rejection constraint ... is added." | slice 8 | |
| E9 | (exclusion) No "dependency on a sibling story is added." | slice 8 | |
| K1 | (example) Trigger: "A long Board is shown in a wide, paged or covering-panel viewport." | slice 1 | observed: slice 1: board-scroll.spec.ts "the Board alone scrolls with an open Side panel" (1400×420 side-by-side; 700×800 expectCoveringFillsWindow) and board-paging "far down a long Backlog" (40rem paged) |
| K1a | (example) Journey: the reader wheels or pages to a named column, resizes, then returns. | slice 1 | observed: slice 1: board-clamp.spec.ts wheelTo(1500) → showColumn("Recently done") → showColumn("Backlog") → setViewportSize 80rem then 40rem → showColumn |
| K1b | (example) Outcome: the test states the shown column order, usable card room, scroll extent and retained reading position. | slice 1 | observed: slice 1: board-clamp/board-paging expectView order, expectStoryCardsKeepTheirShare, expectAtBoardBottom (exact toBe bottomOf), expect(scrollYOf).toBe(kept); board-scroll scrollYOf toBe(position) after Maximize/Restore |
| K1c | (example) Outcome: "shared Board operations own the browser mechanics." | slice 1 | observed: slice 1: C1 specs use boardReading.ts (wheelBy, pressScrollbarTrack, untilBoardRests, expectAtBoardBottom, expectDocumentStill, expectPagingControlInSight), boardColumnNavigation showColumn/columnPagingControl and sidePanelWidthPage control/panelDivider; no raw scroll/scrollbar/paging-control locators remain in C1 (grep) |
| K2 | (example) Trigger: "A Board or one of its controls has keyboard/touch input." | slice 2 | observed: slice 2: board-reading "body reading keys use native Board scrolling while focused controls and modal…"; board-native-reading "native modified reading keys…"; accessible-board-keyboard/touch |
| K2a | (example) Journey: the reader uses the stated key or gesture, or opens/closes modal help. | slice 2 | observed: slice 2: board-reading End/Home/PageDown/PageUp, help open with End and Escape; board-native-reading Meta+ArrowDown/Up, help dialog, Meta+b; accessible-board-touch taps |
| K2b | (example) Outcome: "named reading operations preserve the actual input, expected focus and scroll result." | slice 2 | observed: slice 2: boardReading.ts readWithKey + expectAtBoardBottom/scrollYOf polls and toBeFocused in board-reading and board-native-reading; in-profile repeat stability of handoff keys is O3 (slice 9) |
| K2c | (example) Outcome: "native document comparison and modal key ownership remain independent proof." | slice 2 | observed: slice 2: board-native-reading ordinary-document comparator expect(scrollY).toBe(end/0) kept direct; modal ownership expect(close).toBeFocused() with unchanged scrollYOf, Escape and Meta+b checks in both specs |
| K3 | (example) Trigger: a reader chooses a project through wide tabs or a compact title, changes perspective, or follows a notification/source destination. | slice 3 | observed: slice 3: dashboard-header (wide tabs projectTab), dashboard-header-compact (compact title keys), project-keyboard-navigation (perspective/project keys), notification-story-navigation and source-navigation destinations |
| K3a | (example) Outcome: "the test names the chosen project and destination, exact key order, sanitized URL and arrival focus." | slice 3 | observed: slice 3: notification-story-navigation expectArrivedAt(notifiedCard) + expectRoute(page,{story: notifiedIdentity}) / {story: null} + expectRoute(page,{project:"retired-project"}); source-navigation explicit origin/path/hash/search and target/rel; compact key arrays |
| K3b | (example) Outcome: "resize or a covering panel keeps the required reading place." | slice 3 | observed: slice 3: dashboard-header-compact "resizing keeps Doughnut" expectProjectChoice + projectTab checked at 1280 then expectCompactProjectSelect at portrait; development-intent-frame-sessions covering expectCovering/expectAddress; development-intent-frame expectPinnedShortBanner/expectBelowBanner |
| K4 | (example) Trigger: "A Done reference is pending." | slice 4 | observed: slice 4: story-reference-done-cancellation serveDoneReferences + published.hold(farDone.path) + followHeldFarReference (pending Done destination) |
| K4a | (example) Journey: the reader presses Inspect story, and "the held answer arrives before pointer release." | slice 4 | observed: slice 4: done-cancellation "pointer down stops…" pointerDownOn(Inspect story) then release() before page.mouse.up() |
| K4b | (example) Outcome: "the destination does not take focus." | slice 4 | observed: slice 4: done-cancellation expect(destination).not.toBeFocused() after release |
| K4c | (example) Outcome: "pointer-up opens the chosen detail and focuses Hide detail." | slice 4 | observed: slice 4: done-cancellation after page.mouse.up(): "Detail for Story A" region visible and Hide detail toBeFocused |
| K4d | (example) Outcome: "A later reference, Tab move or explicit Show latest 10 choice retains its own supersession outcome." | slice 4 | observed: slice 4: done-cancellation "later move or latest-ten choice…" (later reference, explicit Show latest 10) and "Tab away…" each assert their own supersession outcome |
| K4e | (example) Outcome: "Shared reference/card actions do not combine these beats." | slice 4 | observed: slice 4: storyReference.ts owners each do one beat (openDependencies, followReference, retryReference); hold/release/down/up/later choice stay separate scenario calls |
| K5 | (example) Trigger: "Preparation, dependencies, ownership or progress arrives, changes or cannot be read." | slice 5 | observed: slice 5: backlog-preparing (preparation arrives/changes), story-dependencies(-malformed) (dependencies/cannot be read), agent-roster(-avatar)/taken-agent-profile (ownership), taken-slice-progress/branch-progress-reading (progress) |
| K5a | (example) Journey: "the scenario supplies the expected actor, order, status, links, slice counts or malformed text." | slice 5 | observed: slice 5: expected actors, orders, statuses, links, slice counts and malformed texts passed as literals at C5 call sites (see S4.9–S4.13 observations) |
| K5b | (example) Outcome: "shared card/roster readers expose exactly that evidence." | slice 5 | observed: slice 5: credit(holder) parts, expectBadges/badgeLabels, expectSliceBar/expectNoSliceCount, expectHumanAvatar/Initials read exactly the caller-supplied evidence; C5 26/26 |
| K5c | (example) Outcome: the readers do this "without confusing Inspect with Selected story." | slice 5 | observed: slice 5: owners read only Inspect/inspectedDetail; storyReadinessScan keeps its separate selectStory check |
| K5d | (example) Outcome: the readers do this without "hiding gaps." | slice 5 | observed: slice 5: expectNoSliceCount(gap text, no bar, nothing recorded complete) in taken-slice-progress; credit(...).gap reads the assignment gap explicitly; roster gap texts literal |
| K6 | (example) Trigger: "Recently done initially shows ten of 35 mixed entries." | slice 6 | |
| K6a | (example) Journey: the reader "reveals more, returns to the latest range, refreshes or follows a session/reference beyond it." | slice 6 | |
| K6b | (example) Outcome: "shared column actions expose the expected order/count/focus and retained range." | slice 6 | |
| K6c | (example) Outcome: "the scenario still names exactly which records answer, fail or remain unread." | slice 6 | |
| K6d | (example) Outcome: "Showing fewer entries and cancelling a pending jump remain distinguishable outcomes." | slice 6 | |
| K7 | (example) Trigger: "The reader has scrolled to an inspected pinned link while independent facts or a new revision are held." | slice 7 | |
| K7a | (example) Journey: "the test releases or fails named answers and advances its controlled clock." | slice 7 | |
| K7b | (example) Outcome: "retained facts, focus and reading place stay explicit before/after." | slice 7 | |
| K7c | (example) Outcome: "only the answered facts change." | slice 7 | |
| K7d | (example) Outcome: "A reader who wheels away keeps that later choice." | slice 7 | |
| K7e | (example) Outcome: "Recovery/rate-limit cases retain their request counts, schedule, old/new revisions, notices and absence of placeholder churn." | slice 8 | |
| K8 | (example) Trigger: "A maintainer changes a shared control." | slice 8 | |
| K8a | (example) Outcome: "its affected procedural/fluent and cross-family callers use one browser owner." | slice 8 | |
| K8b | (example) Outcome: "per-finding comparison shows readable action/outcome, removed duplicate mechanics and justified helper cost." | slice 8 | |
| K8c | (example) Outcome: "independent expected values and all distinct checks survive." | slice 8 | |
| F1 | (commitment) Finding "Board columns and accessible reading": "Express reading or paging a named column ... through the Board." | slice 1 | observed: slice 1: board-paging.spec.ts columnPagingControl(page, "Taken").focus() + Enter → expectView; showColumn(page, column) in board-clamp; expectPagingControlInSight(page, "Backlog") |
| F1a | (commitment) Express "reaching the next action" through the Board. | slice 2 | observed: slice 2: accessible-board-keyboard tabTo(page, inspect) reaches the next action, expect(inspect).toBeFocused(); exact Tab/Shift+Tab walks stay explicit |
| F1b | (commitment) Express "returning to a kept position through the Board." | slice 1 | observed: slice 1: board-clamp.spec.ts step "showing Backlog again keeps the position" showColumn("Backlog") then expect(scrollYOf).toBe(kept); board-scroll Maximize/Restore keeps position |
| F1c | (commitment) "Preserve the expected order, viewport and input modality in each scenario." | slice 2 | observed: slice 2: viewports, key names and touch taps stay at call sites in board-reading, board-native-reading, accessible-board-keyboard, accessible-board-touch (rotation sizes) |
| F1d | (qualification) Audited problem: Board helpers own some layout and paging actions, while individual specs reconstruct keyboard walks, DOM scroll probes, responsive transitions and covering behavior. | slice 2 | observed: slice 2: keyboard walk (tabTo), key scroll waits (readWithKey), DOM scroll probes (expectDocumentStill/expectAtBoardBottom) and touch reading (expectReadWholeInCard) now owned; exact geometry contracts direct |
| F1e | (qualification) Audited callers: board-scroll.spec.ts#L62, board-paging.spec.ts#L95, board-reading.spec.ts#L53, accessible-board-keyboard.spec.ts#L84, accessible-board-touch.spec.ts#L77 (dashboard/tests/navigation). | slice 2 | observed: slices 1–2: board-scroll, board-paging (slice 1), board-reading, accessible-board-keyboard, accessible-board-touch (slice 2) migrated; accessible-board-scroll kept at HEAD on evidence (40/40 vs 38/40) |
| F2 | (commitment) Finding "Project choice, header and destination focus": "Extend the project choice and frame/navigation helpers for those actions": reaching controls, changing perspective/project, and reading focus or scroll after arrival. | slice 3 | observed: slice 3: projectChoice.ts projectTab/pressProjectListKeys, bannerReading.ts, notificationStoryJourney.ts arrival/focus readers, storyCardControls focusCanonicalRecord, sourceNavigationJourney followLeavingDashboard(selected) |
| F2a | (commitment) Keep the expected key order explicit. | slice 3 | observed: slice 3: pressProjectListKeys key arrays and explicit Right/Left/Shift+Tab/modified-arrow keys at call sites in C3 specs |
| F2b | (commitment) Keep the selected project explicit. | slice 3 | observed: slice 3: projectTab(page,"Doughnut"/"Open Dough") toBeChecked at call sites; followLeavingDashboard(page, link, "Open Dough") caller-supplied project checked by expectProjectChoice |
| F2c | (commitment) Keep the destination explicit. | slice 3 | observed: slice 3: notification-story-navigation notifiedCard/storyDestination with expected identities in expectRoute(page,{story: notifiedIdentity}) / {story: null} at each call site |
| F2d | (commitment) Keep sanitized-link expectations explicit. | slice 3 | observed: slice 3: source-navigation specs keep every origin, pathname, hash and search, target/rel attributes and hostile-scheme text explicit |
| F2e | (qualification) Audited problem: the project keyboard, compact/wide header, development frame, notification and source navigation cases duplicate these actions. | slice 3 | observed: slice 3: removed 28 radio locators, 12 membership literals, 10 story-param reads, banner middles/boxes and other duplicated sequences (PLAN slice 3 accepted note) |
| F2f | (qualification) Audited callers: dashboard-header.spec.ts#L137, dashboard-header-compact.spec.ts#L91, project-keyboard-navigation-eligibility.spec.ts#L59, notification-story-navigation.spec.ts#L107, source-navigation.spec.ts#L130 (dashboard/tests/navigation). | slice 3 | observed: slice 3: dashboard-header L137 expectBannerRow/bannerStops/expectPinnedShortBanner; compact L91 pressProjectListKeys/expectCatalogStories; eligibility L59 projectTab/settings/expectRoute; notification L107 expectRoute{project,story}/expectNoCardFocused; source L130 kept direct (exact target/rel DOM contract) with followLeavingDashboard caller project |
| F3 | (commitment) Finding "Story inspection and references": "Give the story card and Board a shared reference flow." | slice 4 | observed: slice 4: storyReference.ts shared reference flow used by card specs, Board Done references and fluent StoryCard |
| F3a | (commitment) Provide "separate actions for pointer-down and release so a held read can answer between them." | slice 4 | observed: slice 4: storyCardControls.ts pointerDownOn separate from page.mouse.up(); held release() answers between them |
| F3b | (qualification) Audited problem: selection, dependency and reference suites re-find the same card, dependency disclosure, destination and notice. The Done cancellation spec repeats the first half of the pending jump three times and computes pointer/focus operations inline. | slice 4 | observed: slice 4: card re-finds → storyCard (48→9), disclosure summary 26→0, notice 12→0, Done pending jump shared as spec-local followHeldFarReference with serveDoneReferences; inline pointer box computation → pointerDownOn |
| F3c | (qualification) Audited callers: story-card-selection.spec.ts#L118, story-card-dependency-selection.spec.ts#L51, story-reference-navigation.spec.ts#L69, story-reference-done-cancellation.spec.ts#L35, story-reference-done-recovery.spec.ts#L40 (dashboard/tests/navigation). | slice 4 | observed: slice 4: story-card-selection L118 emptyArea/hideDetail/storyCard; dependency-selection L51 openDependencies; reference-navigation L69 followReference/storyReference/canonicalRecord; done-cancellation L35 followHeldFarReference + pointerDownOn; done-recovery L40 referenceNotice/retryReference |
| F4 | (commitment) Finding "Story card evidence": "Extend the existing card/roster helpers to read the visible evidence." | slice 5 | observed: slice 5: new agentCredit.ts and storyCardFacts.ts extend card/roster readers; reuse storyCard, inspectedDetail, hideDetail, canonicalRecord |
| F4a | (commitment) Keep expected ordering explicit. | slice 5 | observed: slice 5: backlog-preparing priority order and badgeLabels before/after; expectSliceBar ordered segment statuses |
| F4b | (commitment) Keep the actor explicit. | slice 5 | observed: slice 5: credit(...).agent toHaveText([first, second]) in backlog-preparing; expectHumanAvatar(member, credited) in agent-roster-avatar |
| F4c | (commitment) Keep links explicit. | slice 5 | observed: slice 5: canonicalRecord counts/hrefs in storyReadinessRecordGaps and queuedPlanNavigation |
| F4d | (commitment) Keep statuses explicit. | slice 5 | observed: slice 5: expectBadges shown/absent label lists in story-readiness and story-dependencies |
| F4e | (commitment) Keep slice counts explicit. | slice 5 | observed: slice 5: expectSliceBar(card, "2 of 3 slices recorded complete", ["done","done","planned"]) in taken-slice-progress |
| F4f | (commitment) Keep malformed-record messages explicit. | slice 5 | observed: slice 5: story-dependencies-malformed literal message; expectNoSliceCount(card, "Plan slices uninterpretable:") |
| F4g | (qualification) Audited problem: preparation, dependencies, readiness, ownership, roster and branch progress tests repeat card subregions, badge classes, avatar and owner lookups, and expansion controls. | slice 5 | observed: slice 5: badge text/classes 91→6, credit classes 60→2, article lookups 49→2, Inspect clicks 32→3, detail regions 26→4, progress classes 20→1 in changed files |
| F4h | (qualification) Audited callers: backlog-preparing.spec.ts#L55, story-readiness.spec.ts#L77, story-dependencies.spec.ts#L57, agent-roster-avatar.spec.ts#L44, taken-slice-progress.spec.ts#L125, branch-progress-reading.spec.ts#L35 (dashboard/tests/stories). | slice 5 | observed: slice 5: backlog-preparing L55 storyCard/badgeLabels/credit; story-readiness L77 expectBadges/chooseProject; story-dependencies L57 inspectedDetail/expectBadges; agent-roster-avatar L44 expectHumanAvatar; taken-slice-progress L125 expectSliceBar; branch-progress-reading L35 scrollYOf/canonicalRecord |
| F5 | (commitment) Finding "Recently done stories": share the column count, latest-range controls, wheel/scroll and collapse focus Board operations "with reference and retained session cases." | slice 6 | |
| F5a | (commitment) Keep "which requests answer." | slice 6 | |
| F5b | (commitment) Keep the "visible entry order." | slice 6 | |
| F5c | (commitment) Keep "the distinction between showing fewer stories and abandoning a pending destination." | slice 6 | |
| F5d | (qualification) Audited problem: progressive loading and reset, refresh and retained-range journeys share some setup but still inline these mechanics. | slice 6 | |
| F5e | (qualification) Audited callers: recently-done-progressive-loading.spec.ts#L81, recently-done-progressive-state.spec.ts#L113, recently-done-progressive-refresh.spec.ts#L113, recently-done-read-latency.spec.ts#L38 (dashboard/tests/stories). | slice 6 | |
| F6 | (commitment) Finding "Published facts, refresh and read recovery": "Extend the existing dashboard and recovery helpers." | slice 8 | |
| F6a | (commitment) With those helpers, the spec can say "what remains visible while the next answer is held." | slice 7 | |
| F6b | (commitment) With those helpers, the spec can say "what appears when it arrives." | slice 7 | |
| F6c | (commitment) "Keep held reads, controlled clock steps, request logs and pinned revisions where the causal order is the proof." | slice 8 | |
| F6d | (qualification) Audited problem: observation tests repeat card/owner/progress selectors, timestamps and notices, and inline browser probes for retained focus, scroll and placeholders. | slice 8 | |
| F6e | (qualification) Audited callers: published-facts-reading.spec.ts#L40, steady-refresh-carry.spec.ts#L43, auto-refresh-recovery.spec.ts#L68, auto-refresh-rate-limit.spec.ts#L107, profile-addition-latency.spec.ts#L100, transient-credit-recovery.spec.ts#L102 (dashboard/tests/observation). | slice 8 | |
| A1 | (commitment) "Each finding has a resolved disposition backed by the affected specs." | slice 8 | |
| A2 | (commitment) "A representative before/after from each feature family shows the user action and expected outcome in domain terms." | slice 8 | |
| A2a | (commitment) In that before/after, "repeated locators and interaction sequences [are] owned by shared helpers." | slice 8 | |
| A3 | (qualification) "Prefer existing procedural helpers and component owners." | slice 8 | |
| A4 | (qualification) The fluent pilot "supplies evidence for shared controls and recurring handoffs." | slice 8 | |
| A4a | (qualification) "Adopt fluent phases where those benefits justify the extra code." | slice 8 | |
| A5 | (commitment) "A shared control edit ... has one maintained selector owner for the affected callers." | slice 8 | |
| A5a | (example) Examples of a shared control edit: "the Story card's Review changes action or the Terminal's input locator." | slice 8 | |
| A6 | (commitment) "A test of the exact name, accessibility contract, or DOM measurement retains its independent expected value." | slice 8 | |
| A7 | (commitment) "Use the audited source as the comparison baseline." | slice 8 | |
| A8 | (commitment) "Weigh call-site clarity, edit sites and helper cost under the definition of improvement" (ADR 0010). | slice 8 | |
| A9 | (commitment) Held-read tests still show "which action happens before the answer." | slice 8 | |
| A9a | (commitment) Held-read tests still show "which user choice supersedes it." | slice 8 | |
| A9b | (commitment) Held-read tests still show "what stays selected after release." | slice 8 | |
| A10 | (commitment) "Touch and keyboard tests still identify the actual input and expected focus." | slice 2 | observed: slice 2: accessible-board-touch tapWhereShown at call site and expected texts; board-reading/native literal keys and toBeFocused expectations; accessible-board-keyboard expectFocusedAndIndicated |
| A11 | (commitment) "Keep Git, HTTP, host and record evidence at the boundary it observes." | slice 8 | |
| A11a | (commitment) Keep, with that evidence, "the assertions that distinguish outcomes." | slice 8 | |
| A12 | (commitment) "Preserve each distinct behavior check." | slice 8 | |
| A12a | (commitment) Preserve "the existing test tiers." | slice 8 | |
| A13 | (commitment) "Use MakeMe for domain data." | slice 8 | |
| A13a | (commitment) Use "the existing causal waits." | slice 8 | |
| A14 | (commitment) "Run the changed specs." | slice 8 | |
| A14a | (commitment) Run "the applicable dashboard gates." | slice 8 | |
| A14b | (qualification) Those runs are "under the project's failing and flaky test policy." | slice 8 | |
