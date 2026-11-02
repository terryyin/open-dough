# Source review: SEED-216#optimization-candidates-tab

Launch: fresh general-purpose subagent (no conversation inheritance) during slice 1
acceptance, 2026-11-02. Input: only the selected story section text (For/why,
Goal, Scope, Scope limits, Key examples, UI, Architecture) from
[the seed](../../seeds/SEED-216-optimization-candidates-tab.md#optimization-candidates-tab);
instructed to read no project files, run nothing, change nothing, and return
numbered commitments with exclusions marked.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers can choose between intent review and optimization candidates without treating the candidates report as navigation in the test-source file browser | slice 1 | observed: dashboard/src/IntentBrowser.tsx (record is its own tabpanel, not in .intent-locations); dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step (no "Test Optimization Candidates" button) |
| 2 | A tab strip sits below the banner and above the Intent page content | slice 1 | observed: dashboard/src/IntentModeTabs.tsx rendered first in Intent main; dashboard/tests/intent-test-optimization-candidates.spec.ts tabs read ["Intent","Optimization Candidates"] |
| 2.1 | The tab strip lets the developer choose Intent | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts step "Intent tab brings back the locations…" intentTab.click → aria-selected true |
| 2.2 | The tab strip lets the developer choose Optimization Candidates | slice 1 | observed: dashboard/tests/intentPerspectivePage.ts chooseOptimizationCandidates asserts aria-selected true, used in dashboard/tests/intent-test-optimization-candidates.spec.ts |
| 2.3 | Intent is the default tab when the developer enters Intent | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step intentTab aria-selected true; dashboard/tests/intent-gherkin-browse.spec.ts and intent-selection-reads.spec.ts Intent aria-selected after switch/remount |
| 3 | The Intent tab keeps the file browser with Purpose and Proof | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step (group toggle, Purpose and Proof prompts visible) |
| 4 | Optimization Candidates shows the existing report across the content area without the file browser | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts after chooseOptimizationCandidates: tabpanel x/width equal Intent's, .intent-locations hidden, Purpose region count 0 |
| 5 | A two-tab control (Intent, Optimization Candidates) is placed under the banner / above Intent content | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts tabs toHaveText ["Intent","Optimization Candidates"] |
| 5.1 | The strip belongs to the Intent perspective only | slice 1 | observed: IntentModeTabs rendered only inside IntentBrowser; dashboard/tests/development-intent-frame*.spec.ts unchanged and passing |
| 5.2 | Development stays as it is | slice 1 | observed: no Development source changed in the diff; dashboard/tests/development-intent-frame*.spec.ts pass unchanged |
| 5.3 | The banner perspective switch stays as it is | slice 1 | observed: PerspectiveSelect / project-select.css unchanged; dashboard/tests/development-intent-frame-keyboard.spec.ts passes unchanged |
| 6 | The locations-column Test Optimization Candidates button is gone | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step button "Test Optimization Candidates" count 0 |
| 6.1 | The locations column holds only Purpose locations | slice 1 | observed: dashboard/src/IntentBrowser.tsx .intent-locations holds only the heading and IntentLocationGroup list |
| 7 | The Optimization Candidates tab shows the existing report using the full Intent content area | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts bounding-box x/width equality with Intent main |
| 7.1 | Same record | slice 1 | observed: IntentCandidatesRecord unchanged except comment; dashboard/tests/intent-test-optimization-candidates.spec.ts expectCandidatesRevision |
| 7.2 | Same sections | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts Ex 1 step pending/accepted groups and every field |
| 7.3 | Same states | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-states.spec.ts absent/empty/mismatched/unreadable on the tab |
| 7.4 | Same location links | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1–6 open links from the tab; dashboard/tests/intent-test-optimization-candidates-case.spec.ts case targets |
| 7.5 | The file browser is absent on this tab | slice 1 | observed: chooseOptimizationCandidates asserts .intent-locations hidden |
| 8 | The Intent tab keeps today's file browser | slice 1 | observed: dashboard/tests/intent-gherkin-browse.spec.ts, intent-code-browse.spec.ts pass |
| 8.1 | With location groups | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts intentGroupToggle "dashboard/tests" visible on entry; intent-gherkin-groups.spec.ts passes |
| 8.2 | With Purpose | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts Purpose region prompt on entry; source visible after selecting a file |
| 8.3 | With Proof | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts Proof region prompt on entry and visible after selecting a file |
| 8.4 | Opening Intent with nothing else selected shows the browse/read layout, not the candidates report | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step record count 0 with Purpose/Proof prompts |
| 9 | Choosing a location link in the report triggers a cross-tab open | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 |
| 9.1 | It switches to the Intent tab | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 intentTab aria-selected true, candidatesTab false, record hidden |
| 9.2 | It opens that file's Purpose (and Proof) as today | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 tree item aria-pressed true, source shown, Proof visible |
| 9.3 | It keeps return-to-entry when choosing Optimization Candidates again | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 chooseOptimizationCandidates → agent-launch-poles entry focused, data-candidates-reads unchanged |
| 10 | exclusion: tab choice on the URL / deep link | slice 1 | observed: no route or URL change in diff; docs/dashboard-development-intent.md states the choice is not on the URL |
| 11 | exclusion: changing the candidates record format | slice 1 | observed: no change to src/testOptimizationCandidates.ts or the record file |
| 12 | exclusion: changing the candidates read API | slice 1 | observed: no server or authenticatedIntentCandidatesRead change in diff |
| 13 | exclusion: changing the report sections | slice 1 | observed: IntentCandidatesRecord.tsx comment-only change |
| 14 | exclusion: banner-level Optimization Candidates perspective | slice 1 | observed: PerspectiveSelect unchanged |
| 15 | exclusion: redesigning Purpose/Proof layout | slice 1 | observed: Purpose/Proof markup moved unchanged inside the Intent tabpanel; intent-gherkin-layout.spec.ts passes unchanged |
| 16 | exclusion: redesigning the banner | slice 1 | observed: no banner source change in diff |
| 17 | On entering Intent the strip shows Intent selected | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step intentTab aria-selected true |
| 17.1 | The file browser and reading layout are available | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step group toggle, Purpose and Proof visible |
| 17.2 | The former Test Optimization Candidates control is absent | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts entering-Intent step button count 0 |
| 18 | Choosing Optimization Candidates fills the Intent content area with the existing candidates content | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts bounding-box equality after chooseOptimizationCandidates |
| 18.1 | The file browser is absent | slice 1 | observed: chooseOptimizationCandidates .intent-locations hidden; dashboard/tests/intent-test-optimization-candidates.spec.ts Purpose region count 0 |
| 19 | Returning to Intent makes browser, Purpose and Proof available again | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts step "Intent tab brings back the locations…" source and Proof visible |
| 20 | From Optimization Candidates, opening a location selects the Intent tab | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 intentTab aria-selected true |
| 20.1 | That file's Purpose (and Proof) show | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 source label and Proof region visible |
| 20.2 | Choosing Optimization Candidates again restores the report focused on that entry | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 returned agent-launch-poles entry |
| 21 | The strip is two peer Intent modes under the banner, not a third perspective | slice 1 | observed: dashboard/src/IntentModeTabs.tsx tablist "Intent reading" inside Intent; docs/dashboard-development-intent.md |
| 22 | Prefer the existing segmented radiogroup treatment for the control's look | slice 1 | observed: dashboard/src/intent-perspective.css .intent-mode-tabs reuses Perspective segmented tokens (accent-filled selected) |
| 22.1 | Prefer the same treatment for keyboard behavior | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts ArrowRight/ArrowLeft move focus and selection between tabs |
| 23 | exclusion: exact pixels are not a delivery promise | slice 1 | observed: no pixel assertions added |
| 24 | Do not put the candidates control back inside the locations column | slice 1 | observed: dashboard/src/IntentBrowser.tsx .intent-locations contains no candidates control |
| 25 | Development and Product intent stay perspectives; Optimization Candidates stays an Intent-local reading mode | slice 1 | observed: IntentMode state local to IntentBrowser; perspective set unchanged |
| 25.1 | Optimization Candidates is not a new perspective | slice 1 | observed: PerspectiveSelect options unchanged |
| 25.2 | Optimization Candidates is not a durable workflow record | slice 1 | observed: tab choice is React useState only |
| 26 | Tab state stays disposable page state | slice 1 | observed: dashboard/src/IntentBrowser.tsx useState mode; dashboard/tests/intent-selection-reads.spec.ts remount resets to Intent |
| 26.1 | Return-entry state stays disposable page state | slice 1 | observed: dashboard/src/IntentBrowser.tsx useState returnEntrySlug |
| 27 | The existing candidates read path is reused | slice 1 | observed: IntentBrowser still renders IntentCandidatesRecord with the same props |
| 27.1 | IntentCandidatesRecord is reused | slice 1 | observed: dashboard/src/IntentBrowser.tsx candidates tabpanel |
| 27.2 | The pinned TEST-OPTIMIZATION-CANDIDATES.md read is reused | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts expectCandidatesRevision at the named revision |
| 28 | exclusion: no server contract added | slice 1 | observed: no dashboard/server change for this story in the diff |
| 29 | Intent content has two chrome modes owned inside Intent | slice 1 | observed: dashboard/src/IntentBrowser.tsx two tabpanels under IntentModeTabs |
| 29.1 | One mode is locations+reading | slice 1 | observed: .intent-browser tabpanel (locations + .intent-reading) |
| 29.2 | The other mode is the full-width report | slice 1 | observed: dashboard/tests/intent-test-optimization-candidates.spec.ts bounding-box equality |
| 29.3 | Intent coordinates selection when a report location opens | slice 1 | observed: IntentBrowser openFromRecord sets selection, return slug and Intent mode; dashboard/tests/intent-test-optimization-candidates-open.spec.ts Ex 1 |
