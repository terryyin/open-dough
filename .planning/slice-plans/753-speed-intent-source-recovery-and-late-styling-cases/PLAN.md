# Bring Intent source recovery and late styling cases under 500 ms

**Identity:** SEED-413#speed-intent-source-recovery-and-late-styling-cases
**Source:** [Bring Intent source recovery and late styling cases under 500 ms](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-recovery-and-late-styling-cases)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

Dashboard maintainers get fast feedback from three cases:
- the two cases in
  `dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts`
  ("…held then released" and "…failed then retried");
- the arrival case in
  `dashboard/frontend-tests/review/story-review-diff-late-styling.spec.ts`
  ("styling that arrives after the diff keeps the reading position, revealed
  context and an open line menu").

Each case passes when its median of three attempts is under 500 ms. On a
loaded machine it passes instead when that median is at most 0.5× the
original case's median from the same paired runs. Every assertion stays.

The page objects these cases drive activate controls in the page: wait for
the control to be visible, yield one task, then click it as an element.
Other specs that use those methods get the same activation. Where a case
waits for its targeted line to be in view, the check compares positions in
the page instead of waiting for browser frames.

**Exclusions.** Production code, `dashboard/test-support/` (these cases mount
with `component-mount/mountComponent.ts`), browser launch flags, and
activation of controls other than the ones named below.

## Outside-in proof

| Promise | Owner | Observation |
| --- | --- | --- |
| Arrival case: median under 500 ms, or ≤ 0.5× in paired runs, with every assertion kept | Slice 2 | Paired medians recorded per case |
| Failed then retried: the same bar | Slice 3 | Paired medians recorded per case |
| Held then released: the same bar | Slice 4 | Paired medians recorded per case |
| Every other spec using the changed page-object methods still passes | Slices 2–4 | Consumer runs listed in each slice |
| The in-view check still fails when the targeted line is out of view | Slice 4 | Scratch discrimination edit |

## Decisive premises

Observed on 21 November 2026 in this worktree at `1112123d3`. Unless a row
says otherwise, runs used
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx vitest run --config dashboard/frontend.vitest.config.mts <specs> --reporter=json --outputFile=<tmp>`,
at one-minute load 8–18. Scratch edits were reverted.

| Premise | Observation | Result |
| --- | --- | --- |
| Provider clicks hold the time | A scratch spec timed a bare button. Run with `--silent=false --reporter=verbose` | `userEvent.click` 137–304 ms; `locator.click` 99–382 ms; `element.click()` 0–1 ms; provider keyboard 2–162 ms |
| Browser flags do not help | The same probe through a scratch config that added `--disable-renderer-backgrounding --disable-background-timer-throttling --disable-backgrounding-occluded-windows`, or `--disable-gpu-vsync --disable-frame-rate-limit` | No change |
| In-page activation keeps the three cases green and speeds them up | A scratch copy of each spec replaced `userEvent.click` and `Locator.click` with: wait visible, `setTimeout(0)`, `element.click()`. Five runs beside the originals in the same invocation | All passed. Medians, original → in-page: arrival 644 → 380 ms; failed 955 → 483 ms; held 868 → 718 ms |
| The task yield is needed | The same, without the yield | Recovery cases failed 3/3: the old source was lost after Show latest. Yields of 0–150 ms all passed 3/3 |
| A geometric in-view check gets the held case there | In-page activation plus a scratch `intent-file-reading-page.ts`. `showsLine` replaced `toBeInViewport()` with a poll: the line's rect intersects the window, clipped by each ancestor whose overflow is not `visible`. Five runs, then five original runs, at load 8–13 | Held 888 → 372 ms (0.42×); failed 849 → 374 ms (0.44×) |
| The Review page-object consumers survive in-page activation | Scratch edit of `reviewDiffPage.ts` (`showPrecedingLines`, `openLineMenu`) and the Intent page objects. One run of the 21 Vitest specs that import `reviewDiffPage`, `intent-candidates-page`, `intent-browser-page`, `intent-revision-notice-page` or `intent-file-reading-page` | 36 of 37 cases passed. Every Review consumer passed |
| The Intent consumers survive immediate Show latest | Same run | **False.** `intent-revision-apply.spec.ts` "newer revisions wait behind one notice, and Show latest keeps the reading…" failed 3/3 with a one-task yield. Either "Updating…" never showed, or the reading never reached the latest text. It also failed 1/2 after a frame wait and passed 2/2 after a 100 ms wait. With `userEvent.click(control, { force: true })` it passed 3/3 (15–147 ms per click). Slice 1 bounds this |

## Current decisions

- Terry chose in-page activation for the shared page-object methods and the
  0.5× paired ratio (21 November 2026).
- Activation stays inside the page objects, with one owner for the shared
  mechanics, as the
  [page-object convention](../../../.agents/skills/dough-page-objects/references/convention.md)
  requires. Add no wrapper under `dashboard/test-support/`.
- Each page-object action waits for a meaningful observable state before it
  activates. A bare delay is not acceptable as readiness.
- SEED-413#speed-intent-ci-comparison-proof (plan 751),
  SEED-413#speed-intent-proof-and-timing (plan 752) and the source-reading
  sibling may change the same Intent page objects. Rebase on fetched trunk
  before each slice and keep the activation owner single.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md), the
  [page-object](../../../.agents/skills/dough-page-objects/SKILL.md) selection,
  and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
  carried by link into every delegation brief and repair handoff.

## Execution context

- Airi-chan, Story Branch Mode, publisher `dashboard-territory.local-open-dough`.
- Owned worktree `.worktrees/bring-intent-source-recovery-and-late-styling-ca`,
  branch `codex/bring-intent-source-recovery-and-late-styling-ca`, integration
  checkout `/Users/terryyin/git/open-dough`, target `origin/main`.
- Starting revision `58b829487ba83a8a0752eabfeb37391e4169a596`, published
  claim and original candidate `c6edbee9e35490086c97f8e6234cf2a4a36e741b`.
- Codex CI observer for the story branch, GitHub Actions `ci.yml`, coordinator
  `codex-79f23eaa-69ef-4bbc-a1c8-02b7e976166e`, directory
  `/tmp/dough-ci-501/watch-x5aq2S`, PID 46551, session 28200, cell g141:13.
- Setup in this worktree passed `npm ci` and `npm run typecheck:dashboard`.
  No explicit change to ordinary plan refinement authority.

## Ordered slices

### 1. Settle why an immediate Show latest fails the newer-revisions case

Type: Structure (early probe)
Status: done

Reproduce the `intent-revision-apply` failure with an in-page Show latest
right after the second revision is offered. Find which state is not yet
settled at that moment. Decide whether a reader can reach it: the Show latest
button is already visible from the first revision, so a reader could press it
just as the second arrives.
- **Test-side.** If the case only lacks a readiness observation, name the
  observable state that `intentRevisionNotice().showLatest()` (and Retry) will
  wait for before activating. Slice 3 uses it.
- **Product race.** If a reader's prompt press loses "Updating…" or the
  latest text, stop slices 3 and 4. Report the reproduction to Terry as a
  product defect, which the story's scope excludes, and ask how the Intent
  activation should proceed. Slice 2 does not depend on this and may continue.

**Proof.** A recorded reproduction of the failure, with the state it depends
on and the verdict. For test-side, a scratch run of `intent-revision-apply`
with the readiness wait passes 3/3 with in-page activation and no delay. All
scratch edits are reverted.

**Observed at `c6edbee9e`.** The original fixture failed at `Updating…` after
a visible control, one task and an element click. A commit witness with the
original fixture failed at the same assertion in both runs. C had committed,
C's locations were requested once, B's were never requested, and there was no
displayed revision during the held read. Keeping the fixture's source stable
and awaiting C's commit made immediate in-page activation pass 3/3 with no
delay and every assertion retained. The dashboard keeps the selected source
in `usePublishedObservation` as work advances. Replacing it only in the
fixture restarts the read for A and clears its shown answer just before C
needs to keep it. The test-side fix is to model the dashboard's stable source
and await the offered commit when the old button is already visible.
Scratch edits were reverted. See checkout Git evidence `s1-report.md` and
its linked patches and run records. Records-only delivery.

### 2. Review diff controls activate in the page

Type: Structure
Status: done

`reviewDiffPage.ts` activates `showPrecedingLines` and `openLineMenu` in the
page, through the single activation owner.

**Proof.** The arrival case passes the bar. Record three paired attempts
against the original in the same runs, with the load. These Vitest consumers
pass: `story-review-diff-late-styling`, `-word-emphasis-decoration`,
`-styled-rendering`, `-token-readability` and `-language-colours`.

**Observed at `e26d57a55` with Slice 2 changes.** Same-run Chromium case
durations on Territory.local at one-minute load 5.46–5.50, original → in-page
in ms: 510.4 → 162.7, 599.0 → 138.1, 785.9 → 186.5. Medians 599.0 → 162.7
(0.272×). The unchanged arrival case kept the line position, all 20 revealed
lines and the same open menu after styling. All six cases in each pair and
all 11 cases across the five consumers passed. The shared `activateButton`
owns visibility, task yield and DOM click. Independent refactor found no
edits. See checkout Git evidence `s2-report.md`.

### 3. Intent source and recovery controls activate in the page

Type: Structure
Status: planned

Slice 1's verdict requires a stable selected source in the mounted Intent
fixture and a commit signal for the newer-revisions case before it uses the
already-visible button. Check the fixture's consumers as well as the cases
using the page objects. The page-object actions wait for their own visible
controls, including the failure's Retry, before yielding one task and
activating in the page:
- `intentCandidates().openSource`;
- `intentRevisionNotice().showLatest` and `retry`;
- `intentBrowser().retryRead`.

**Proof.** The failed-then-retried case passes the bar, recorded as in
slice 2. Every Vitest spec that imports `intent-candidates-page`,
`intent-browser-page` or `intent-revision-notice-page` passes, three runs of
`intent-revision-apply` included.

### 4. The targeted line's in-view check compares positions

Type: Structure
Status: planned

`intent-file-reading-page.ts` `showsLine` checks that the line intersects
the window and every clipping ancestor. It polls positions instead of waiting
on an observer that fires per frame.

**Proof.** The held-then-released case passes the bar, recorded as in
slice 2, and all three cases are recorded together once more. A scratch edit
scrolls the reading pane away from the targeted line before `targets(44)`.
Both the new check and the original `toBeInViewport()` fail on it. Every spec
that imports `intent-file-reading-page` passes.

## Concern evidence

Refinement was not needed. Each slice has one proof loop and four slices fit
the limit. Slice 1 is an early probe: it bounds the one false premise. If it
finds a product race, slices 3–4 stop for Terry's decision. This review found
no other slice-specific concern.

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Run Vitest specs with
  `npx vitest run --config dashboard/frontend.vitest.config.mts <specs>`, then
  `npm run typecheck:dashboard` and `npm run lint`. Keep default timeouts;
  never `test.slow()`.
