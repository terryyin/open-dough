# Keep the direction disclosure readable after starting a session on a phone

**Identity:** SEED-135#read-direction-after-phone-session-start
**Source:** [selected story](../../seeds/SEED-135-mobile-dashboard-observed-discrepancies.md#read-direction-after-phone-session-start)

## Goal and scope

A developer on a phone browser who starts a session from the project row and
closes the opened terminal still reads the whole row in ordinary words: the
launch answer in full, the collapsed Near-future direction label, Start
session, and the badge legend help. Expanding and collapsing the direction
with the answer visible, and rotating the phone, keep everything readable and
reachable without sideways scrolling. Tablet and desktop keep their current
row.

Included: the phone presentation of every launch answer shown beside Start
session (success, "Starting a session…" progress, and Launch failed or Launch
uncertain with their explanations), the direction label beside them, the
opened direction beneath the row, and the maintained description of that
behavior in the dashboard documentation. Proof covers the post-launch answer
state at phone viewports in portrait and landscape, with the direction
expanded and collapsed, and at least one problem answer.

Excluded: session-start authority, native launch semantics, the wording and
screen-reader announcement of the answers, when an answer clears (the next
Start session opening and reload, as today), the direction's content and its
collapsed start, the sibling final-report confirmation story in the seed, and
any new touch viewport beyond the story's 390×844, 430×932, and landscape.
Physical iOS keyboards, Safari-specific acceptance, and remote connectivity
stay outside the completed mobile story's accepted boundary.

Assumptions: the story's key examples are the refined seed's; the fake Claude
host used by the existing launch journeys stands in for the native session,
as the completed mobile story's own proof did.

## Current decisions

- Presentation only. The answer keeps its whole text and stays next to Start
  session, the control that produced it; on a phone it may take lines beneath
  Start session where the row cannot hold it beside. It never sits between the
  direction label and the direction's opened text, and it never shortens or
  hides itself to fit.
- The direction label wraps only at its own word boundaries, never within
  letters, and its disclosure keeps its comfortable touch target.
- Tablet and desktop keep the answer beside Start session on the row, with
  the direction and the legend help opposite it; the existing row and
  direction-opens-across-the-row specs stay the proof of that.
- No ADR or North Star topic applies or is needed; the change stays inside the
  dashboard's existing presentation rules.

## Reused paths and decisive premises

PFE: the row already exists as one grid in `dashboard/src/styles.css`
(`.project-actions` and the rules that follow it), with the direction's
disclosure in `dashboard/src/NearFutureDirection.tsx` and the answers in
`dashboard/src/StartSession.tsx` and `dashboard/src/LaunchProblemAnswer.tsx`.
The grid gives the direction's column the width left after the end column's
content, and the success answer has no width bound while the progress and
problem answers are bounded wider than a phone. Repair the existing row; add no
second row component, media-specific duplicate of the direction, or phone-only
answer. Proof reuses the phone and tablet viewports in
`dashboard/tests/touchLaunchPage.ts`, the layout helpers in
`dashboard/tests/pageLayout.ts` (`tapWhereShown`, `expectNoSidewaysScrollIn`,
`expectEveryControlReachable`), the row parts in `dashboard/tests/dashboardParts.ts`
(`directionToggle`, `projectActions`, `adHocStarted`, `preparationHelp`), and
the launch journey with the fake Claude scenarios `launched` and `refused`.

Premise, settled 2026-10-13 in this preparation workspace
(`/Users/terryyin/git/open-dough/.worktrees/keep-the-direction-disclosure-readable-after-sta`
at `05a2db904c599aab1bb6fff32cdacacc1e8a180d`): the symptom reproduces in the
existing automated journey at a phone viewport, and a problem answer shows the
same squeeze. A scratch spec (`dashboard/tests/zz-scratch-direction-squeeze.spec.ts`,
deleted after the run) opened the committed launch journey with
`hasTouch: true`, started a session with typed text, and measured
`.direction summary` and the Backlog heading before and after the answer
appeared:

```sh
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/zz-scratch-direction-squeeze.spec.ts --reporter=list
```

| Viewport and scenario | Direction label before | Direction label after | Backlog heading y |
| --- | --- | --- | --- |
| 390×844, `launched` | 140.6×52.2 | 49.3×469.7 | 711 |
| 390×844, `refused` | 140.6×52.2 | 49.3×469.7 | 711 |
| 768×1024, `launched` | 216.1×44 | 216.1×44 | 249 |

Result: 3 passed, 8.5 s. This reaches the consuming operation (the rendered row
after the answer appears) and records the promised failure of the current
behavior, for the success and the problem answer, while the tablet row stays
intact. It also settles the proof route: the fake-host launch reaches the
"Ad hoc session started" state and the refused state under a touch viewport
without a native process. The terminal's Close control was reached in the same
run. Nothing was committed from the scratch run.

Not a premise: the exact repaired arrangement. The slice chooses it against the
examples; the decisions above bound it.

## Outside-in proof ownership

| Promise | Owning slice and discriminating observation |
| --- | --- |
| At 390×844, 430×932, and 844×390 the success answer reads whole and the direction label reads in whole words beside or above it, the help is reachable, no sideways scrolling, and the Backlog heading follows the row by about the answer's height | 1: a touch spec starts the fake-host session, closes the terminal, and measures label, answer, help, and Backlog heading; it fails on the current CSS (label height 469.7) |
| A Launch failed answer longer than the row reads whole in ordinary words next to Start session and the label still reads in whole words | 1: the same spec with the `refused` scenario |
| Expanding and collapsing the direction with the answer visible keeps the answer readable next to Start session, opens the text beneath the row, and scrolls nothing sideways | 1: the same spec taps the label, checks the opened text and the answer, and collapses |
| Rotation between portrait and landscape with the answer visible keeps every row part readable and reachable | 1: the same spec changes the viewport and repeats the measurements |
| Tablet and desktop keep the answer beside Start session with the direction and help opposite, and the direction opens across the row | 1: existing specs stay green: `agent-launch-ad-hoc.spec.ts` (row order), `agent-launch-ad-hoc-problems.spec.ts`, `direction-disclosure.spec.ts`, `preparation-legend.spec.ts`, `accessible-overview.spec.ts`, `accessible-overview-keyboard.spec.ts`, `frame-overview-look.spec.ts` |
| The maintained documentation describes the phone row with an answer | 1: `dashboard/README.md` Near-future direction paragraph or `dashboard/LAUNCH-TOUCH.md` says where the answer reads on a phone |

## Ordered slices

### 1. A phone reads the launch answer and the direction label as whole words
Type: Behavior
Status: done
Proof: one new touch spec beside `agent-launch-start-session-touch.spec.ts`
runs the `launched` and `refused` scenarios at 390×844, 430×932, and 844×390,
measuring the direction label, the answer, the help, and the Backlog heading,
tapping the direction open and closed, and asserting no sideways scrolling;
written first so it fails on the current row as the premise table shows. Then
`npm run typecheck:dashboard`, `npm run lint`, and the seven existing specs
named above.

Behavior: phone viewport, direction collapsed, no answer shown → the developer
starts a session with typed text and closes the opened terminal, or the launch
is refused → the answer reads whole next to Start session, the direction label
reads "Near-future direction" in whole words with its full-height touch target,
the help is reachable, the page does not scroll sideways, and the Backlog
heading moves down by no more than the answer's height; tapping the label opens
the text beneath the row and the answer stays readable; rotating keeps all of
it. Tablet and desktop rows are unchanged. Update the maintained documentation
in the same slice.

Accepted proof (slice 1, final state after refactoring): the row rules moved
unchanged from `dashboard/src/styles.css` into
`dashboard/src/project-actions.css`, imported after it in
`dashboard/src/main.tsx`. The label's column is `auto` and the row end takes
the rest; where the page shows one column (`@container page (width < 48rem)`,
the threshold in `dashboard/src/dashboard-columns.css`) the answer reads
beneath Start session and the help, as wide as the two. Landscape 844×390
keeps the answer beside Start session.

```sh
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start-session-answer-touch.spec.ts --reporter=list
```

7 passed: `launched` and `refused` at 390×844, 430×932, and 844×390 through
`expectRowReadsWhole` and `expectDirectionOpensBeneath`, each rotated and
back, and the `held` progress answer at 390×844. On the former row rules the
same spec failed 6 of 6 (`label words` received `["Near", "future",
"direction"]`; at 844×390 `refused` the label was 78.28 high against 44.5),
and the `held` test failed the same way. The seven consumer specs named in
the proof table pass with it (35 passed together), `npm run
typecheck:dashboard` exits 0, and `npm test` passes on the final state. The
whole dashboard suite on the final state: 1607 passed, 1 failed.

Failed proof diagnosis: `dashboard/tests/limit-recovery-credit-history.spec.ts`
failed once in that whole-suite run, receiving one extra GitHub request
(`commit-list .planning/slice-plans/091-time-unread/PLAN.md`) after its
recovery mark. It asserts request traffic and measures nothing on the project
action row; it passed in the earlier whole-suite run on the same row rules
(1607 passed) and 20 of 20 alone (`--repeat-each=20`). Disposition: a
load-dependent request-timing race outside this slice's change, left
unrepaired here and reported at completion; this slice's proof does not
depend on it.

Learning: the same squeeze existed at 768×1024 with a problem answer (label
49.75×469.69 on the former rules); the repaired columns keep the label on one
line there too, recorded as G4.

## Story obligations

### G1. Progress answer opened, rotated, and at the other phone viewports
Reported: slice 1 — "With the progress answer showing: opening and closing the direction, and rotation. Those remain covered for `launched` and `refused` only."
Story clause: "This covers the success answer, the “Starting a session…” progress answer, and Launch failed or Launch uncertain answers with their explanations."
Disposition: proved by slice 1: `dashboard/tests/agent-launch-start-session-answer-touch.spec.ts` "390×844 touch, held" observes the progress paragraph through `expectRowReadsWhole`; it is laid out by the same `.project-actions-end > p` rule whose opening, closing, rotation, and other viewports the `launched` and `refused` tests observe.

### G2. Launch uncertain has no phone case of its own
Reported: slice 1 — "Launch uncertain has no case of its own, as agreed."
Story clause: "This covers the success answer, the “Starting a session…” progress answer, and Launch failed or Launch uncertain answers with their explanations."
Disposition: proved by slice 1: Launch uncertain renders through the same `dashboard/src/LaunchProblemAnswer.tsx` paragraph as Launch failed, which the `refused` tests in `dashboard/tests/agent-launch-start-session-answer-touch.spec.ts` observe at every phone viewport.

### G3. Help measured and reachable, not tapped open, with an answer visible
Reported: slice 1 — "The help is measured and checked reachable, not tapped open, with an answer visible."
Story clause: "it does not move the badge legend help out of reach."
Disposition: proved by slice 1: `expectRowReadsWhole` in `dashboard/tests/agent-launch-start-session-answer-touch.spec.ts` asserts the help is at least 44×44 and `expectEveryControlReachable(projectActions)` hit-tests it with each answer visible; opening it is `dashboard/tests/preparation-legend.spec.ts`.

### G4. Tablet problem answer reads narrower beside Start session
Reported: slice 1 — "the label stays on one line (216×40) and the answer reads beside Start session at 282px wide instead of 448px, on three lines. Arrangement is unchanged (answer beside Start session, direction and help opposite); only widths differ."
Story clause: "Tablet and desktop keep their current row: the answer beside Start session, the direction and legend help opposite it, keyboard access, and surrounding work-stage reading."
Disposition: no user cost "without compromising desktop operation": the arrangement the clause names is kept; the only difference is that a tablet problem answer no longer squeezes the label into letters, so it takes more lines beside Start session.

## Review and execution gates

Slice-plan refinement is not needed: one outcome, one proof loop, no
structure prepared beyond the behavior, and every promise is mapped. No
remaining slice-specific concern was identified. Local proof is the new spec
and the named consumer specs, with typecheck and lint; these are the checks CI
runs on the affected surfaces, selected because the change alters a rendered
row that those specs measure. Hosted CI still runs every suite after
publication. Execution follows this project's post-change refactor and delivery
gates when it is authorized; no execution-complete record is written during
preparation.
