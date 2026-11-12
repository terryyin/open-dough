# Slice 5 consumer trace

The installed `consumer-trace.mjs` ran with the exact paths/terms in [trace input](slice5-trace-input.json). Reconstruct its arguments as `--checkout .`, one `--path` per path, then one `--term` per term. Raw output remains `/tmp/seed300-review-582-slice5-consumer-trace-final.md`.

[Unchanged browser boundaries](slice5-unaffected-browser-consumers.md) and [nonruntime references](slice5-nonruntime-references.md) retain every other listed match and its disposition. Whole cohort commands and actual verdicts are retained in the slice handoff; source compatibility and original failing verdicts are retained separately.

## Reached consumers outside changed paths

| Consumer | Disposition | Inspected reason |
| --- | --- | --- |
| `dashboard/frontend-tests/agent-terminal-touch-select-fit.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/frontend-tests/control-reachability-observation.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/tests/launches/agent-launch-codex-model.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/tests/launches/agent-launch-model-entries.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/launches/agent-launch-start-session-answer-touch.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/launches/agent-launch-start-session-touch.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/tests/navigation/board-height.spec.ts` | reused | pressWhereShown body is identical, moved to existing controlReachability and reexported from pageLayout; measured-position input stays distinct from locator.click; current frame/frontend cohorts renew that unchanged boundary |
| `dashboard/tests/navigation/board-reading.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/navigation/board-session-reading.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/navigation/development-intent-frame-sessions.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/tests/navigation/side-panel-content-replacement.spec.ts` | run | report-entry normal cohort (passed, 6/6 executed, 48.540s), whole existing spec; actual selection/status is in report-entry-proof.json |
| `dashboard/tests/navigation/side-panel-content-switching.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/navigation/story-card-selection.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/recentlyDoneSelectionJourney.ts` | run | shared setup/selection parts; actual open property is exercised by select/select-check and report continuations plus native sidebar reopen and touch continuation |
| `dashboard/tests/recentlyDoneSelectionReport.ts` | run | showReport → Recently done row open with original combined terminal/report regex, then explicit final-report text/aria-current; select, select-development and select-supersede whole scenarios in openings cohort |
| `dashboard/tests/review/story-review-commit-worktree.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-comparison.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-since-trunk.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-since.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-touch.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-trunk-own-changes.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/review/story-review-uncommitted-check-refresh.spec.ts` | run | review normal cohort (passed, 66/66 executed, 561.958s), whole existing spec; actual selection/status is in review-normal-proof.json |
| `dashboard/tests/sessions/agent-launch-session-state-pace.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/sessions/agent-session-cursor-done.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/sessions/agent-session-cursor-stop-several.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/sessions/agent-session-cursor-stop.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/sessions/recently-done-sessions-select-ad-hoc.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-select-check.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-select-development.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-select-supersede.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-select-touch.spec.ts` | run | continuations normal cohort (passed, 25/25 executed, 136.843s), whole existing spec; actual selection/status is in continuations-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-select.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/sessionsSidebarPage.ts` | reused | resize/covering declarations are body-identical after cohesive Frame relocation, with stable Width reexports; current width/Terminal/report/touch/frontend cohorts renew those exact viewport and independent geometry contracts |
| `dashboard/tests/storyCardSessionListing.ts` | reused | existing one-argument opening keeps exact:true, same entry scope and focus/click ownership; added name/exact options preserve that default. Current native/openings full journeys renew the shared control. Other imported screen/identity/input readers are unchanged |
| `dashboard/tests/terminalPages.ts` | run | existing fluent Terminal close → pageLayout click/gone/preparation; content-switching complete review/terminal handoff in review cohort |
| `dashboard/tests/terminals/agent-terminal-cursor-trust-page.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/terminals/agent-terminal-pending-readiness-input.spec.ts` | run | openings normal cohort (passed, 62/62 executed, 417.392s), whole existing spec; actual selection/status is in openings-normal-proof.json |
| `dashboard/tests/terminals/session-terminal-voice-lifecycle.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/terminals/session-terminal-voice-recovery.spec.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/support/adHocTerminalStartup.ts` | reused | existing one-argument opening keeps exact:true, same entry scope and focus/click ownership; added name/exact options preserve that default. Current native/openings full journeys renew the shared control. Other imported screen/identity/input readers are unchanged |
| `dashboard/tests/support/reviewTouchReading.ts` | reused | resize/covering declarations are body-identical after cohesive Frame relocation, with stable Width reexports; current width/Terminal/report/touch/frontend cohorts renew those exact viewport and independent geometry contracts |
| `dashboard/tests/support/startedAdHocSession.ts` | reused | existing closeTerminal/pageLayout Close contract remains exact:true locator.click → panel count0 → Reading preparation absence; the action-only frame delegate adds no wait; current native/review/continuation whole journeys renew that unchanged public boundary |
| `dashboard/tests/support/startedSessionTerminal.ts` | reused | existing one-argument opening keeps exact:true, same entry scope and focus/click ownership; added name/exact options preserve that default. Current native/openings full journeys renew the shared control. Other imported screen/identity/input readers are unchanged |

## Actual cohort status (run is a disposition, not a passed verdict)

| Cohort | Current actual proof |
| --- | --- |
| review | passed, 66/66 executed, 561.958s |
| native | passed, 84/84 executed, 748.855s |
| continuations | passed, 25/25 executed, 136.843s |
| report-entry | passed, 6/6 executed, 48.540s |
| openings | passed, 62/62 executed, 417.392s |


## Changed sources and actual contract reach

The installed trace excludes changed paths. Every changed path is included here. Run dispositions name full current cohorts, with verdicts qualified by their proof JSONs.

| Changed source | Disposition and contract |
| --- | --- |
| `dashboard/tests/configuration/project-hide-sessions.spec.ts` | run: native whole changed spec |
| `dashboard/tests/controlReachability.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/finalReportPages.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/intent/intent-ci-status-side-panel.spec.ts` | run: report-entry whole changed spec |
| `dashboard/tests/intent/intent-done-landed-review-mode.spec.ts` | run: review whole changed spec |
| `dashboard/tests/intent/intent-done-retained-workspace.spec.ts` | run: review whole changed spec |
| `dashboard/tests/intent/intent-done-review-modes.spec.ts` | run: review whole changed spec |
| `dashboard/tests/intent/intent-story-changes-marked.spec.ts` | run: review whole changed spec |
| `dashboard/tests/intent/intent-story-changes.spec.ts` | run: review whole changed spec |
| `dashboard/tests/intent/intent-story-review-return.spec.ts` | run: review whole changed spec |
| `dashboard/tests/launches/agent-launch-ad-hoc-codex.spec.ts` | run: native whole changed spec |
| `dashboard/tests/launches/agent-launch-ad-hoc-instructed.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/launches/agent-launch-codex.spec.ts` | run: native whole changed spec |
| `dashboard/tests/launches/agent-launch-cursor-model.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/launches/agent-launch-start-session-isolated.spec.ts` | run: native whole changed spec |
| `dashboard/tests/launches/codexModelCatalogCases.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/launches/cursor-startup-trust.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/launches/responsive-session-refinement-restart.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/navigation/board-paging-side-panel.spec.ts` | run: review whole changed spec |
| `dashboard/tests/navigation/board-scroll.spec.ts` | run: native whole changed spec |
| `dashboard/tests/navigation/frame-sessions-look.spec.ts` | run: native whole changed spec |
| `dashboard/tests/navigation/side-panel-width-covering.spec.ts` | run: review whole changed spec |
| `dashboard/tests/navigation/side-panel-width-kept.spec.ts` | run: review whole changed spec |
| `dashboard/tests/navigation/side-panel-width.spec.ts` | run: review whole changed spec |
| `dashboard/tests/pageLayout.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/recentlyDoneSessionsSidebarPage.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/review/recently-done-one-shot-review.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-completed.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-mark.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-nothing.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-one-shot-choice-races.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-one-shot-choice.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-one-shot.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-panes.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-refresh.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-story-branch-landed.spec.ts` | run: review whole changed spec |
| `dashboard/tests/review/story-review-tree-collapse.spec.ts` | run: review whole changed spec |
| `dashboard/tests/sessions/agent-completion-attention.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-completion-quiet.spec.ts` | run: report-entry whole changed spec |
| `dashboard/tests/sessions/agent-launch-ad-hoc-sessions.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-launch-codex-observation-workspace.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/agent-launch-done-question-follows.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-launch-story-card-sessions.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/agent-terminal-delete.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done-codex-page.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done-pending.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done-question.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done-reopen.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done-report.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/agent-terminal-done.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/compact-session-entry.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/cursor-runner-helper-survival.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/cursor-runner-replacement.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/cursor-session-scope-continuation.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/final-report-touch-divider.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/final-report-touch.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/recently-done-sessions-sidebar-reopen.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/recently-done-sessions-sidebar.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/session-column-membership.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/session-management-touch.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement-attach.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement-claude.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement-cursor.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement-done.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement-lifetime.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/session-workspace-retirement.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/sessions-sidebar-keyboard.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/sessions/sessions-sidebar-navigation-cases.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/sessions-sidebar-navigation.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessions/sessions-sidebar-stays-as-left.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sidePanelFramePages.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/sidePanelPages.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/sidePanelWidthPage.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/stories/recently-done-progressive-navigation-cursor.spec.ts` | run: native whole changed spec |
| `dashboard/tests/stories/recently-done-progressive-navigation-report.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/stories/recently-done-progressive-navigation.spec.ts` | run: native whole changed spec |
| `dashboard/tests/stories/recently-done-progressive-reset.spec.ts` | run: native whole changed spec |
| `dashboard/tests/stories/recently-done-progressive-state.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/storyCardPages.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/storyReviewPages.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/support/reportTouchJourney.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/support/storyReviewMark.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/support/storyReviewTouchContext.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/terminalScreenPage.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/terminals/agent-launch-ad-hoc-terminal.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-avatar.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/terminals/agent-terminal-codex-page.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/terminals/agent-terminal-cursor-launch-page.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-cursor-page.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-keyboard.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-lifetime.spec.ts` | run: openings whole changed spec |
| `dashboard/tests/terminals/agent-terminal-maximize.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-theme.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-touch-keyboard-fit.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal-touch.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/agent-terminal.spec.ts` | run: native whole changed spec |
| `dashboard/tests/terminals/session-terminal-voice.spec.ts` | run: native whole changed spec |
| `dashboard/tests/sessionEntryAccess.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |
| `dashboard/tests/sidePanelFrame.ts` | run through consumers: current frame/divider/opening/fluent/Terminal/touch owners reached by the review/native/openings/continuation cohorts; no unrelated workflow conversion |

## Scope, matching, input and unchanged-boundary evidence

- Frame action audit: sweep-actions.json retains61actual original raw action mappings, including panel scope, exactness and click/shown-pointer/touch/keyboard input. G5 retains review-scoped partial-name divider lookup and focus.
- Opening action audits: open-action-audit.json retains54additional Terminal sites/35paths plus39independent observations; report-action-audit.json retains25actual Final-report getter sites/13paths plus7independent observations. The earlier8width/maximize sites use original exact:false. Recently done open keeps its row filter and /^(Open terminal|Read final report)$/ regex through pure sessionEntryAccessControl; Terminal and FinalReport facade exports preserve matching defaults and add no waits. Locator.click chains/options and focus/Enter/touch remain unchanged.
- Quiet completion reorganization: caller retains reportText via the exact former region/CSS query in finalReportText, literal Done., native before/after read evidence and receipt facts. Its original conditional-click/text/toPass sequence moves to existing FinalReport owner only; no other opening acquires a wait. The already-oversized spec260 becomes250, FinalReport19 becomes44, and its original individual StoryBranch60s timeout is unchanged.
- Pure declarations: inspection.json proves13moved/retained bodies identical; pressWhereShown and4covering operations keep stable reexports. Existing showPageWithTaken body matches the removed local Cursor helper exactly, including its independent Taken-count observation.
- Actual transitive routes: reopenStoryReview → comparison/trunk-own-changes/since-trunk/since/uncommitted-check-refresh/commit-worktree in review; codexModelCatalogCases → agent-launch-codex-model in continuations; storyReviewTouchContext → full4phone/tablet retention cases in review; sidePanelPages/storyCardPages →2content-replacement+content-switching; Recently done open →native sidebar+openings selection/report/pending-readiness+touch continuation.
- Remaining raw controls are actual Preparation/settings dialogs, unrelated Sessions dividers or independent Side panel/Open terminal name/visibility/count/focus assertions. Open/Close action ownership does not replace the independent expected accessible contract.
- Earlier accepted slice2/3/4 finding evidence is reused for unchanged review entry/comparison/tree/context/Refresh query and wait boundaries only. The pane generic Refresh bypass is explicitly repaired through reviewRefresh exact:true with unchanged click/waits, and full panes/G2/touch are renewed currently.
