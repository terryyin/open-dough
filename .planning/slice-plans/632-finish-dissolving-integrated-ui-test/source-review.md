# Source-only review

**Story:** SEED-334#finish-dissolving-integrated-ui-test

**Launch:** Fresh general-purpose reviewer (Cursor Task, no conversation
inheritance). Input was only the selected story's Goal, Scope, key examples,
scope limits, Architecture and Story boundary text from
`.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#finish-dissolving-integrated-ui-test`.
No plan, product files, proof or suspected omissions were supplied. Reviewer
was instructed to read no other project files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers get detailed feedback from Frontend and Backend unit tests for the session, terminal, story and observation surfaces. | slice 8 | |
| 2 | Developers get confidence from representative E2E workflows for the session, terminal, story and observation surfaces. | slice 8 | |
| 3 | This continues the conversion begun by the configuration, launch and session-lifecycle batches. | slice 8 | |
| 4 | Every distinct regression assertion these interim cases provide keeps a home that catches the same regression. | slice 8 | |
| 5a | The `sessions` folder of **Dashboard Integrated UI Test** becomes empty. | slice 3 | |
| 5b | The `terminals` folder of **Dashboard Integrated UI Test** becomes empty. | slice 4 | |
| 5c | The `review` folder of **Dashboard Integrated UI Test** becomes empty. | slice 5 | |
| 5d | The `stories` folder of **Dashboard Integrated UI Test** becomes empty. | slice 7 | |
| 5e | The `observation` folder of **Dashboard Integrated UI Test** becomes empty. | slice 8 | |
| 6a | Convert final reports and workspace retirement out of the interim group. | slice 1 | observed: interim final-report-touch{,-divider} and session-workspace-retirement{,-claude-done,-lifetime} removed; FE/E2E homes under dashboard/frontend-tests/sessions and e2e/sessions |
| 6b | Convert recently done sessions out of the interim group. | slice 2 | |
| 6c | Convert the sessions sidebar out of the interim group. | slice 3 | |
| 6d | Convert terminals out of the interim group. | slice 4 | |
| 6e | Convert story review out of the interim group. | slice 5 | |
| 6f | Convert published-story presentation and progressive done reading out of the interim group. | slice 7 | |
| 6g | Convert published-fact observation out of the interim group. | slice 8 | |
| 7 | Include cases added after the original inventory (e.g. `recently-done-returned-sessions.spec.ts` and `story-review-diff-line-follow-up.spec.ts`). | slice 5 | |
| 8 | The inventory classifies starting candidates, not the complete set of promises. | slice 8 | |
| 9 | Place each assertion at its observable boundary. | slice 8 | |
| 10 | A representative workflow requiring the real page and backend belongs in E2E, preferably an existing journey. | slice 8 | |
| 11 | Detailed UI behavior belongs in Frontend, running the built page or production component with controlled backend answers. | slice 8 | |
| 12 | Detailed backend contracts belong in Backend through their public boundary without a page. | slice 8 | |
| 13 | Split mixed cases by the assertions they actually make. | slice 8 | |
| 14 | Run real code and collaborators inside the selected service, substituting only external service boundaries needed by the case. | slice 8 | |
| 15 | Compare each converted case with its interim assertions, including negative observations such as commands that must not run. | slice 8 | |
| 16 | For representative changed proof boundaries, demonstrate that a scratch break of the same rule is caught before and after conversion. | slice 8 | |
| 17a | Remove the replaced interim specs. | slice 8 | |
| 17b | Remove the replaced interim specs' duration-list rows together with those specs. | slice 8 | |
| 18 | This guards against a cheaper test losing a distinct promise (the previous conversion's completion record documents and repairs one such lost no-native-command assertion). | slice 8 | |
| 19 | A converted batch preserves its complete distinct checks and removes its interim copies. | slice 8 | |
| 20 | The interim runner remains for the Intent and navigation cases owned by the retirement story. | slice 8 | |
| 21a | No Intent conversion. | slice 8 | |
| 21b | No navigation conversion. | slice 8 | |
| 21c | No runner retirement; the retirement story owns them. | slice 8 | |
| 22a | No new browser group target. | slice 8 | |
| 22b | No new speed target. | slice 8 | |
| 22c | No new shard-count target. | slice 8 | |
| 22d | No product behavior change. | slice 8 | |
| 23 | SEED-341 owns later session-test simplification (this story does not take that work). | slice 8 | |
| 24 | No wholesale re-inventory is required before conversion. | slice 1 | observed: converted the five named interim specs without wholesale re-inventory |
| 25 | Align affected cases with existing page-object work rather than preserving competing rewrites. | slice 8 | |
| 26a | Example: a final-report case asserts touch reading and focus, plus passive native behavior and persisted session state. | slice 1 | observed: FE final-report-touch asserts touch/focus; E2E final-report-done-native retains passive native and store/Done |
| 26b | When converted, Frontend observes UI against controlled report/session answers. | slice 1 | observed: dashboard/frontend-tests/sessions/final-report-touch.spec.ts and session-workspace-retirement-held-report.spec.ts use installFrontendFinalReport controlled answers |
| 26c | A representative E2E journey and/or Backend contract retains the persistence and no-native-work assertions. | slice 1 | observed: e2e/sessions/final-report-done-native.spec.ts plus existing backend-tests/sessions/final-report-* and session-workspace-retirement-* retain persistence and no-native-work |
| 26d | No distinct assertion disappears with the interim copy. | slice 1 | observed: assertion disposition maps every distinct interim check to FE or E2E; duration-list rows removed with specs |
| 27a | Example: a Recently done, sidebar, terminal, review or story case has mixed workflow and UI assertions. | slice 8 | |
| 27b | Conversion places each assertion at its real boundary. | slice 8 | |
| 27c | Frontend details no longer start a backend or synthetic native host. | slice 8 | |
| 27d | Integration assertions still exercise the real connecting services. | slice 8 | |
| 28a | A spec absent from the old inventory still exists when its batch is converted. | slice 5 | |
| 28b | Its actual assertions determine placement and preservation. | slice 5 | |
| 28c | Omission from the inventory never permits leaving it behind or deleting its regression protection. | slice 5 | |
| 29a | When this story completes, no product spec remains under `dashboard/tests/{sessions,terminals,review,stories,observation}`. | slice 8 | |
| 29b | When this story completes, the interim runner still runs the remaining Intent and navigation cases. | slice 8 | |
| 30a | Reuse the existing built-app Frontend fixture and service-family substitutes. | slice 1 | observed: reused frontendApp.ts and service-family substitutes; report answers in frontendFinalReportSubstitutes.ts |
| 30b | Reuse the public Backend harness. | slice 1 | observed: existing dashboard/backend-tests/sessions final-report and retirement homes unchanged and reused |
| 30c | Reuse representative E2E journeys. | slice 1 | observed: reused/extended e2e/sessions retirement journeys; added final-report-done-native.spec.ts |
| 31 | Extend substitutes by the service responsibility needed now, keeping one representation rather than creating a new test tier. | slice 1 | observed: extended /__agent-launch/result via frontendFinalReportSubstitutes.ts; no new test tier; support split under 250 lines |
| 32 | Follow ADR 0002, ADR 0008, and ADR 0010 for maintained procedures versus observed proof and regression preservation against the interim baseline. | slice 8 | |
| 33 | The existing North Star remains applicable; this conversion needs no new architectural direction. | slice 8 | |
| 34 | This story keeps the original identity and converts the session, terminal, review, story and observation folders. | slice 8 | |
| 35 | Its sibling retirement story converts the remaining Intent and navigation specs and retires the group. | slice 8 | |
| 36 | Together they keep the whole original outcome; nothing is dropped. | slice 8 | |
