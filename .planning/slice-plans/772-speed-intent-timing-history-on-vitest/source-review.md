# Source-only review

Fresh general-purpose reviewer, launched without conversation inheritance on
2026-11-22 by the plan 772 execution coordinator. Its only input was one file
assembled from the selected story section (Goal, Scope, Key examples,
Evaluation of SEED-413#speed-intent-timing-history-on-vitest), the shared
acceptance its Evaluation applies (SEED-413 "Acceptance shared by the eight
stories") and the correction input its Scope references (this plan's
"Correction of the delivered CI status entry"). No slicing, implementation,
proof or suspected omission was supplied. It read no project files and
changed none.

Unnumbered context the reviewer kept: split history and plan 772; scope limit
to the sibling scope-timing story; the 19-file 184.99 s baseline; the
campaign's one-minute target for the final story; backend/E2E, recovery
timing, renamed-diff and SEED-341 ownership boundaries; the retrospective
origin of the correction and the project-scope provider protecting the
late-trunk half; guidance references (frontend guide, North Star, ADR 0010,
MakeMe and page objects where they clarify).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The correction of the delivered CI status entry is finished before any history case moves — "Correct the delivered CI status page mount ... before any history move" / "these come first" (Scope; Correction) | slice 2 | observed: slices 1–2: all seven correction items delivered (slice 1 commit 4e4e753a2; slice 2 working change) before Slice 3 moves any history case |
| 2 | The page mount renders the production layout ancestors (perspective scroll container with `.scroll-content`) through one production component that both `ConfiguredDashboardContent` and the mount render; at a narrow viewport the Intent panes scroll inside the production scroll container (Scope; Correction; Key examples) | slice 1 | observed: slice 1: dashboard/src/perspectiveScroll.tsx PerspectiveScroll rendered by configuredDashboardContent.tsx and intent-ci-page-mount.ts; intent-ci-status-layout.spec.ts "at a short viewport Intent fills the page body's scroll region without scrolling it, and CI status scrolls inside its pane" (fails with the container scratch-removed, evidence r1-layout-without.log; passes r1-focused.log) |
| 3 | Test code contains no layout class names for the mount — "no class names in test code" (Correction) | slice 1 | observed: slice 1: intent-ci-page-mount.ts and navigation/board-mount.ts render PerspectiveScroll; no board-scroll/intent-scroll/scroll-content literals in either mount |
| 4 | The page entry has no import cycle: per-project notes/review-state maps and hooks live in modules that depend on `pageReads.tsx`, not the reverse (Scope; Correction) | slice 1 | observed: slice 1: pageReads.tsx imports neither storyNotes.ts nor storyReviewStates.ts; they hold per-project values through useHeldOnPage; evidence s1-cycle.log (no cycle back to pageReads.tsx across 130 modules); typecheck s1b-typecheck2.log |
| 5a | The `MachineSessions` stand-in has one owner: the MakeMe adapter gets a step for the throwing variant, or both copies are justified (Scope; Correction) | slice 2 | observed: slice 2: machineSessionsAnswering(answer, refusal) throws the refusal from every session action; navigation/board-mount.ts noSessions builds through it |
| 5b | The Taken `WorkEntry` test data has one owner (`aPublishedWork…taking()` no longer restates `takenListing`) (Correction) | slice 2 | observed: slice 2: takenEntry in Distribution/tests/support/comparedStoryWorkTestData.mjs builds both takenListing and PublishedWorkAtBuilder.taking(); evidence s2-makeme-load.log; consumers intent-ci-status-kept and intent-story-compare in s2-frontend.log |
| 5c | The never-settling promise helper has one owner instead of five separate copies (Correction) | slice 2 | observed: slice 2: unanswered exported once from dashboard/test-support/support/waitUntil.ts; copies removed from the five sites; s2-frontend.log 166 passed, s2-backend.log, s2-typecheck-final.log |
| 6 | The story-notes dialog page drops its `createRoot`/`act` mount and module-scope `IS_REACT_ACT_ENVIRONMENT` stub (Scope; Correction) | slice 2 | observed: slice 2: stories/story-notes-dialog-page.ts mounts through mountComponent with no createRoot/act/IS_REACT_ACT_ENVIRONMENT; story-notes-dialog.spec.ts titles unchanged, passing in s2-frontend.log |
| 7 | The freshness race case positively waits for the current story's answer after each late resolve; with the abort in `useIntentCiJudgment.ts` cleanup removed, a late stale answer replacing the running story's status fails the case (Scope; Correction; Key examples) | slice 2 | observed: slice 2: intent-ci-status-freshness.spec.ts case 3 awaits afterArriving(late) then ci.answers("Running at 70a0001 (Start the story)"); fails with controller.abort() removed (s2-freshness-abort-removed.log, line 239), passes restored (s2-frontend.log) |
| 8 | The `PageReadsOnPage` creation-time binding trap is recorded at the mount's contract; code changes only if a moved case rerenders with new replies (Correction) | slice 1 | observed: slice 1: contract comment above mountIntentCiPage in intent-ci-page-mount.ts; no case rerenders with new replies |
| 9 | Each of the 10 legacy cases in the 5 owned specs has a traceable disposition; each retired case's distinct assertions map to a new owner or named existing equivalent before deletion (Evaluation; Shared acceptance) | slice 6 | |
| 10 | The migrated history cases run on plain Vitest without React `act` wrapping, rendering and acting directly and waiting on the observed result (Evaluation; Shared acceptance) | slice 6 | |
| 11 | The 5 Project CI wall-time Vitest cases (`intent-ci-wall-time-history{,-gaps,-evidence}`) run on the shared mount with `createRoot`, `act` and `IS_REACT_ACT_ENVIRONMENT` retired (Scope; Evaluation) | slice 5 | |
| 12 | Every history case runs against the production Intent page layout, rendering the production owner at its typed production entry with typed sources production also supplies; no test copy of a composition or provider stack, no private pipeline calls (Goal; Shared acceptance) | slice 6 | |
| 13 | Any read added to a production owner goes on a required typed source, never an optional member, context default or defaulted parameter (Shared acceptance) | slice 6 | |
| 14 | Retry, abort, caching and stale-answer proof exercises the actual reader and its typed collaborator; rendering, layout, accessibility and native input use the smallest production owner in headless Chromium (Shared acceptance) | slice 6 | |
| 15 | Done wall-time history reads never reread or perturb live comparison proof; when the Done reference changes or is retried, live comparison proof stays unchanged (Scope; Key examples) | slice 4 | |
| 16a | Changing the Done reference updates the history (Key examples) | slice 4 | |
| 16b | Retrying the Done reference keeps the last history answer until a new one arrives (Key examples) | slice 4 | |
| 17 | For a Done story whose baseline build is missing, pending, outside retention, insufficient, unusable or zero-average, the compact readout states the exact words and cue for each condition (Key examples) | slice 3 | observed: slice 3: dashboard/frontend-tests/intent/intent-ci-compact-readout.spec.ts case "brief statuses name a pending, missing, out-of-retention or insufficient history and keep any usable prior average without a change" (pending, failed/proof-not-retained selected with usable average and no change, missing, insufficient, outside retention, no history) and case "a zero prior average keeps the elapsed change without a percentage…"; discriminated by scratch-breaking "Outside retained history" (s3-report.md) |
| 18 | A stand-in landing build is named as a stand-in in the readout (Key examples) | slice 3 | observed: slice 3: intent-ci-compact-readout.spec.ts case "…a stand-in build names how it stands for the landing": "Later trunk build, includes later changes" and "Reused equivalent first-parent build"; discriminated by scratch-breaking the later stand-in words (s3-report.md) |
| 19 | The Done glance shows what Done CI wall-time history says beside live CI proof (Goal; Scope) | slice 4 | |
| 20a | Project and Done history chart marks keep build/date labels, accessible descriptions and run links (Key examples) | slice 6 | |
| 20b | Project and Done history charts fit a narrow viewport in both light and dark schemes (Key examples) | slice 6 | |
| 20c | Keyboard order runs `Check again` → `Builds and evidence` (Key examples) | slice 5 | |
| 21 | Each history `test-support` module whose last consumer moves is removed, and the shared test-support surface does not grow (Evaluation; Shared acceptance) | slice 6 | |
| 22 | The story reports a before/after timing comparison of its own 5-file selection at two workers, with elapsed time including preparation, counts by engine and destination, remaining slow cases, explicit per-engine runs, promoted E2E runtime, and paired runs under comparable load for noisy results (Shared acceptance; Evaluation) | slice 6 | |
| 23 | Case consolidation is reported: table-driven and loop-generated cases audited, why repeated cases were consolidated or kept; no hidden case registration and no long unrelated assertion chains (Shared acceptance) | slice 6 | |
| 24 | Exact wording, accessibility, viewport and input distinctions, races, and error/retry boundaries are preserved where they are the proof; distinct risks needing separate setup or diagnosis stay separately named (Shared acceptance) | slice 6 | |
