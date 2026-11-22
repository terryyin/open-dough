# Source review: SEED-413#make-launch-proof-orthogonal

Launch: fresh general-purpose sub-agent, no conversation inheritance, on
2026-11-22 before Slice 1 delegation. Input: the story's Goal, Scope, Key
examples and Baseline verbatim from
`.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#make-launch-proof-orthogonal`,
plus the referenced "Acceptance shared by the eight stories" section verbatim.
No plan, product, proof or slice scope was supplied. Instructions: use only
these inputs, read no files, change nothing, number independently observable
promises.

Unnumbered context returned: the one-short-wait reason and campaign share; the
23-spec scope and changeable counts; production narrowing permission; the
recorded baselines (32.04 s, 46.48 s legacy, 36.7 s at load 14, about 2.5 s
fixed, about 11 case-seconds left); proof-method guidance (pure rules at
production logic, readers for retry/abort/caching, E2E for page loads, MakeMe
and page objects, audit table-driven cases first, long import list warning);
case count and runtime as measures with coverage quality deciding; separate
owners for backend/E2E groups, the recovery/late-styling timing follow-up, the
renamed-diff correction and remaining legacy cases.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | The whole launch selection (`npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2`) finishes in about 7–8 s wall including preparation, compared with a paired run of the starting selection under similar load. | slice 6 | |
| P2 | If the target cannot be reached without losing a distinct observation, the work stops and hands the maintainer the measured remaining time and its cause (alternative to P1). | slice 6 | |
| P3 | Distinct launch behavior stays covered: every removed observation or retired case has a named retained case or owner that fails for the same regression, mapped before deletion. | slice 6 | |
| P4 | The existing native, install and backend journeys, and the composed journeys, stay at their current owners. | slice 6 | |
| P5 | Genuine browser conditions keep their proof (viewport, zoom, touch, pointer, native input, focus); exact wording, accessibility and error/retry boundaries are kept where they are the proof. | slice 6 | |
| P6 | Capture and recovery races keep their proof. | slice 6 | |
| P7 | Each launch case is arranged at the smallest production owner through typed inputs, depending only on production code and data that can affect its assertion, rendered through the typed entry and sources production uses. | slice 6 | |
| P8 | No launch test or helper copies a production composition, restates a provider stack, or calls private pipeline functions to make props. | slice 6 | |
| P9 | Any read added to a source is part of a required typed source, never an optional member, context default or defaulted parameter. | slice 6 | |
| P10 | Independent dimensions are exercised in separate cases; combinations stay only where they can change the result. | slice 6 | |
| P11 | Dense layout: refinement and Start session dialogs with every option selected are arranged through production inputs at each viewport where layout differs; one case proves option-to-command mapping, one proves native tab order; geometry cases no longer reselect options or check command text. | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-launch-dialog.spec.ts "with every option selected, Command details list every flag; Host stacks above Model at 320 pixels and sits beside it at 200% zoom…" (one clicked selection, all-flags mapping, stacked at 320, devicePixelRatio 2 + beside at 640x450) and tab-order case "the instruction comes first, tabs in order…"; ad-hoc-start-session-layout.spec.ts merged offered/unavailable cases at 320 and verified 200%; ad-hoc-refinement-touch.spec.ts constrained-height draft case; evidence s1-after-four-2.log (10/10, 16.07 s vs 19.17 s before) |
| P12 | Shared reset: dismissing after selecting model and effort resets the shared dialog model, proved once at the dialog. | slice 2 | observed: dashboard/frontend-tests/launches/launch-model-effort.spec.ts "dismissing with Cancel or Escape resets the chosen model and effort when the dialog opens again" (mountCatalogDialog; fable/max chosen, Cancel then Escape, close(false), reopen shows model "" and effort medium); evidence s2-after.log 12/12 |
| P13 | Each launcher keeps only its own launch and focus-handoff proof; host-specific effort rules are checked without reopening the three launchers. | slice 2 | observed: launch-model-effort.spec.ts "story card execution and refinement close their dialog on dismissal and return focus without starting" and "Start session closes its dialog on dismissal and returns focus without starting" (one launch/focus case per launcher); Cursor effort rule at launchSettingsBlocked in launch-native-effort.spec.ts "Cursor refuses an effort the chosen model does not list…"; backend reread agent-launch-model-boundary.spec.ts:123 passed (s2-backend-effort-proof.json) |
| P14 | An over-limit transcript and an exactly 4,000-character transcript are fed as text to the owner of overflow, editing and discard. | slice 3 | |
| P15 | Native recording remains only for a held reply, late permission, track loss and capture failures, and those cases stay proved. | slice 3 | |
| P16 | Presentation receives its typed status, recovery its typed attempt and read, and note attachment its typed notes; each is proved at that owner. | slice 5 | |
| P17 | One representative mounted keyboard launch-to-focus journey remains. | slice 4 | |
| P18 | The work adds no E2E case; any composed observation added to an existing case has its added time counted. | slice 6 | |
| P19 | A change to the shared frontend runner configuration is backed by a passing whole frontend group run. | slice 6 | |
| P20 | Launch frontend checks use plain Vitest; React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT` are retired from the launch family; cases render, act directly and wait on the observed result. | slice 6 | |
| P21 | Support whose last consumer moves is removed, and the shared test-support surface shrinks. | slice 6 | |
| P22 | A report records before/after wall time including preparation, case counts by engine and destination, remaining slow cases, why repeated cases were consolidated or kept, the actual time and remaining cost. | slice 6 | |
| P23 | The launch family ends with fewer maintained cases, no hidden case registration and no long unrelated assertion chains. | slice 6 | |
