# Source review

Fresh general-purpose reviewer, no conversation inheritance, launched
2026-11-23 by the execution coordinator. Input: only the seed section's Goal,
Starting evidence, Scope, Key examples and Evaluation for
SEED-413#reach-eight-second-launch-feedback, with the standard source-only
instructions. It read no project files and changed nothing.

Unnumbered context the reviewer kept: the reason (rerun launch proof while
editing); the settled baseline (77 cases / 24 files at 14.20 and 14.71 s;
starting pairs 22.93 and 21.00 s with 71 cases); the effort hypothesis
(22.5–22.9 case-seconds, at least 6.5–6.9 to remove); the measured leads
(refinement refusal and choices, desktop hover and keyboard discovery,
responsive workspace policy); the recoverable evidence source at `107af7aa7`;
the method of comparing simpler focused cases through typed production owners
and touching shared runner preparation only when recoverable; the proof
conditions (comparable awake AC macOS runs, similar load, paired runs); and
the scope limit that native input and geometry stay where the observation
depends on them.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The complete launch selection with two workers finishes in about 7–8 s elapsed including runner preparation; two paired comparisons substantiate the gain and target (Goal; Key example 1; Evaluation; Scope "Measure case, setup, and runner costs") | slice 3 | G1 |
| C2 | The launch selection still yields a complete passing roster and the exact case rosters are reported (Goal; Key example 1; Evaluation) | slice 1 | observed: Slice 1 results: strict runs s1-m2..m4 passed 77 cases in 24 files, roster in evidence s1-roster.txt with Vitest projects |
| C3 | Each relocated assertion and synchronization dependency is mapped to a witness for the same regression (Scope) | slice 3 | observed: Slice 2 and 3 results: every trial was reverted, so no assertion or synchronization dependency was relocated |
| C4 | After a refused refinement submission, reopening shows the previous selection, observed through the production owner (Key example 2) | slice 3 | observed: dashboard/frontend-tests/launches/launch-refinement-options.spec.ts 'Cancel clears the retained choices from a refused refinement': after refusal and reopen kept.a and kept.c toBeChecked (unchanged; Slice 3 results) |
| C5 | Cancel and reopen clears the selection, observed through the production owner (Key example 2) | slice 3 | observed: dashboard/frontend-tests/launches/launch-refinement-options.spec.ts 'Cancel clears the retained choices from a refused refinement': after Cancel and reopen a and c unchecked, none checked (unchanged; Slice 3 results) |
| C6 | Choosing No Approach clears A, retains C and sends only C, observed through the production owner (Key example 2) | slice 3 | observed: dashboard/frontend-tests/launches/launch-refinement-options.spec.ts 'No Approach clears A, keeps C and sends only C on Start': none checked, a unchecked, c checked, start called once with options ["--c"] (unchanged; Slice 3 results) |
| C7 | On a fine-pointer desktop the Start notes appear on hover, observed by Chromium with native input (Key example 3; Scope) | slice 3 | observed: dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts 'noted Starts explain their offers on hover, focus and in the launch dialog' in chromium-desktop, unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C8 | On a fine-pointer desktop the Start notes appear on keyboard focus, observed by Chromium (Key example 3; Scope) | slice 3 | observed: dashboard/frontend-tests/launches/story-card-launch-offers.spec.ts 'noted Starts explain their offers on hover, focus and in the launch dialog' and 'story Starts keep their reading order and visible keyboard focus at narrow and zoomed widths', unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C9 | At 320 CSS px and 200% zoom the relevant launch dialog controls still fit and can be reached, observed by Chromium with real geometry (Key example 3; Scope) | slice 3 | observed: dashboard/frontend-tests/launches/ad-hoc-launch-dialog.spec.ts 'a dense refinement dialog keeps its controls reachable when narrow or zoomed' and dashboard/frontend-tests/launches/ad-hoc-start-session-layout.spec.ts 320 px and zoom cases, unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C10 | The existing composed journeys, including the touch and composed startup journeys, stay in place (Key example 3; Scope) | slice 3 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts and dashboard/frontend-tests/launches/responsive-story-startup.spec.ts composed journeys, unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C11 | The typed creation entry stays in place (Scope) | slice 3 | observed: dashboard/frontend-tests/launches/ad-hoc-creation-entry.spec.ts 'an unresolved creation names its stand-in host and displays the supplied inspection arguments', unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C12 | If the shared runner changes, the full frontend group passes and keeps its pointer assignments (Scope) | slice 2 | observed: not triggered: Slice 2 reverted its only config experiment and changed no runner, config or shared preparation (PLAN.md Slice 2 results; evidence slice-2-report.md) |
| C13 | This timing work adds no end-to-end cases (Scope) | slice 3 | observed: no E2E case added: unchanged: the branch changes only .planning records (git diff e84c8b67b..HEAD --stat) |
| C14 | Alternative to C1: if measured savings leave no credible path to about eight seconds, the remaining gap and a decision go to the maintainer (Evaluation) | slice 3 | observed: maintainer decision after the Slice 3 stop report, recorded in the story's Decision (2026-11-23) bullet and plan Current decisions 'Closure after Slice 3' |
