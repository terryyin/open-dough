# Slice 7 independent refactor

Reviewed the uncommitted slice at `76ff4d6cd6a138205a0d2bb217350166734c410d`
through the installed post-change-refactor checks. The selected Frontend/E2E
sources enable MakeMe and page objects; their helpers follow those consumers.
The activation, visit, column and helper disposition records retain the original
143 observations. Actual whole-app scope, selection, keyboard, focus and scroll
remain with the browser journeys. Java/Purpose continuation and exact colour,
source and target assertions remain visible in their cases.

## Decision and edit

One introduced redundancy warranted an edit: `prepareActivationStory` arranged
Project status through `prepareActivationProject`, then installed another
status route for the story board before opening the browser.

`dashboard/tests/support/frontendIntentActivation.ts` now returns the existing
canonical status controller from `prepareActivationProject` and supplies the
story-board answers through its `answer` operation. The same main/branch answer
map is ready before navigation. No response-family implementation or product
code changed. Both direct callers remain in
`dashboard/frontend-tests/intent/intent-home-activation.spec.ts`; the project
caller ignores the additional return value. No refactor file was renamed,
extracted, split or deleted.

Other checks found no supported additional candidate. The new visit setup
composes existing source/review/CI owners; native selection still owns real
Git/server setup. Distinct Frontend and native setup responsibilities remain
separate. The optional story branch keeps the original default, and the runner
example selects an extant Integrated navigation case. No production subsystem
crossing, disputed restriction or ADR conflict was introduced. ADRs 0001, 0002
and 0008 retain the domain names and state/service boundaries.

Every current changed file was checked for size. All are at most 250 lines;
project-formatted counts include activation 239, column 217, Java 201, Purpose 136,
story support 133, activation support 91 and visit support 40. No size exception
or mechanical split is needed. Formatting and lint remain coordinator-owned.

## Consumer trace and proof selection

Command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term intent-home-activation --term intent-project-visit --term intent-sidebar-toggle --term groupRunnerExamples --term frontendIntentStory --term prepareActivationProject --term prepareActivationStory --term frontendIntentActivation --term serveFrontendCiStatus --term storyBoardCiAnswers`

Raw record: `/tmp/s7-refactor-consumers-final.md`. Per-path dispositions:
`/tmp/s7-refactor-consumers-disposed.md`; all 427 located paths are individually
disposed with no empty cells. The original 426 paths still occur. The additional
`frontendIntentCi.ts` match is excluded precisely: its generic fallback
status/history/comparison setup and callers are unchanged. The actual
`frontendCiStatusAnswers.ts` controller is exercised through the renewed
activation cases. Changed sources, which the script omits from located
consumers, are covered explicitly here and by [slice proof](slice-7-proof.md).

| Boundary and inspected locations | Disposition |
| --- | --- |
| Activation helper and the two direct setup calls in `intent-home-activation.spec.ts` | Run all 3 activation cases; branch/main judgments, selected story/header, file/view retention, actual source/judged/review/file client queries, keyboard/home and pending notice assertions are unchanged. |
| `serveFrontendCiStatus` controller and `storyBoardCiAnswers` | Run through activation 3 with the same exact expected words and query identities. Their family bodies are unchanged; other callers are excluded from this setup-only effect. |
| Visit/selection/sidebar setup and journeys | Reuse final Frontend 22 and guard 8: helper, setup, focus/scroll/geometry, selection/default and keyboard observation locations unchanged by refactor. |
| Java and recorded Gherkin Purpose | Reuse Frontend 22 and final Java 2: exact source/lines/target, grammar states, real perspective/column continuations, scroll and palette expectations unchanged by refactor. |
| Default and Done `frontendIntentStory` callers | Reuse Frontend 22 and matching slice 4/5 proof per original path dispositions. Optional branch implementation and defaults unchanged by refactor. |
| Actual Backend status boundary and runner ownership | Reuse Backend 2: HTTP refusal/acquisition/exact calls and both actual npm/direct-config Integrated selections unchanged. |
| Real branch judgment and independent Project CI readings | Reuse E2E 3: published branch/main histories, exact GitHub calls, refresh and scope continuation unchanged. |

## Terminal verification

The setup edit invalidated only the earlier activation observations; those
three cases were renewed. Literal command:

`caffeinate -s -i env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/s7-refactor-activation.json npm run test:dashboard:frontend -- frontend-tests/intent/intent-home-activation.spec.ts --workers=1`

Terminal exit 0. Record inspected: completed, exact
`dashboard/frontend.playwright.config.ts`, selectedCount 3, runner and strict
passed, three passed attempts; 5.77 seconds. Setup is the helper's same explicit
published source, review and main/branch answers. Observation locations are the
three named cases, including their original header/reading/home/notice checks
and actual client query expectations. No test assertions changed.

`npm run typecheck:dashboard` and `git diff --check` both completed exit 0.
Accepted Frontend 22, guard 8, Java 2, Backend 2 and E2E 3 records were inspected for
their exact configurations, selection counts, completed strict verdicts and
passed attempts. Their retained unaffected boundaries needed no rerun.

Before launch: this awake macOS host was on AC at 100%, 69% free memory, load
3.65/4.45/4.88. No competing owned test command was present; the coordinator
retained proof sequencing. Chose the single affected file, one worker under
`caffeinate -s -i`. No required observation is deferred. Any fresh failure,
contention or broader edit would require reconsidering scope and headroom.

No failure was encountered in this refactor. The
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies as written. No known proof gap or contradiction remains. About
12 active minutes, including read-only review and focused verification.

## REFACTOR COMPLETE
