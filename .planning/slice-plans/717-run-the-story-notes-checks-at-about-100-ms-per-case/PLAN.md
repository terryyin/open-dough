# Run the Story Notes checks at about 100 ms per case

**Identity:** SEED-407#run-the-story-notes-checks-at-about-100-ms-per-case
**Source:** [Run the Story Notes checks at about 100 ms per case](../../seeds/SEED-407-run-the-story-notes-checks-at-about-100-ms-per-case.md#run-the-story-notes-checks-at-about-100-ms-per-case)

## Goal and scope

Bring the eleven Story Notes cases' reported durations from about 3.7 s to
about 1.1 s summed, and show the invocation's fixed startup beside that sum,
reducing it where a change is cheap. The seed owns the two numbers, the
eleven behaviors, the real-browser boundary and the scope limits: no warm
runner, no whole-command wall-time target and no rollout beyond Story Notes.

Every measurement uses [measure.sh](measure.sh), which times one fresh
`npm run test:dashboard:frontend` invocation at the default two workers and
sums the durations the run prints:

- Case time: `bash .planning/slice-plans/717-run-the-story-notes-checks-at-about-100-ms-per-case/measure.sh stories/story-notes`
- Fixed startup: the same script with
  `stories/story-notes-add --grep 'cannot reach'`; `elapsed` less `sum`.

A comparison is three before and after pairs, alternated, each with its
load. A time a change moves outside a case's reported duration is added back.

## Decisive premises

Observed on 2026-11-19 at `47cf696e5`, Node 24.21.0, two workers, load 5–8.
Scratch timers in `mountedActInput.ts`, `mountedDashboard.ts` and
`mountedStoryNotesBoard.ts` were run through the ordinary command and
reverted.

| Operation | Observed result and remaining question |
| --- | --- |
| `measure.sh stories/story-notes` | Three runs: `cases=11 failed=0`, `sum` 3440–4504 ms, `elapsed` 4.22–5.00 s, at load 4.7–8.0. |
| `measure.sh stories/story-notes-add --grep 'cannot reach'` | Two runs: `cases=1`, `sum` 219–238 ms, `elapsed` 2.12–2.36 s, so fixed startup is 1.9–2.1 s. Listing alone took 1.0 s; creating Vitest takes 0.70–0.80 s of it. |
| Where a case's time goes | Mounting costs 27–50 ms inside `act`. Assertions, `findElement`, the arranging command and the viewport change cost under 20 ms a case together. The time is in the three rows below. |
| A frame round in `actSettled` | One `requestAnimationFrame` round took 8–115 ms, 1–5 rounds a case, 1.3–1.4 s of the family's sum. Six idle frames after a mount measured, for example, `61,114,127,54,7,104` ms and `8,11,11,23,22,22` ms. One worker gave the same range. A scratch spec measured twelve frames on the empty phone-sized page before any mount: mostly 80–120 ms, as after the mount and with animations and transitions off (`document.getAnimations()` was empty). `--disable-gpu` gave a steady 100 ms. Backgrounding and timer-throttling switches, `--enable-gpu --use-angle=metal` and `--disable-frame-rate-limit` did not shorten them. The browser delivers this page about ten frames a second whatever it shows. What sets that rate is unobserved: slice 1 finds it. |
| Input that closes the dialog (`closing`) | Cases with no close spent 13–17 ms in all their input. Cases that close the dialog spent 75–280 ms, about 50–100 ms a close. Whether the close event waits on the same slow frame is unobserved: slice 2 owns it after slice 1's remeasure. |
| The attached-terminal case | 445–483 ms inside its five framed actions (attach and prints), beyond its 270–370 ms of frame rounds. Cause unobserved: slice 3 owns it. |
| File count and isolation | One scratch file with all eleven cases left each case's time unchanged. No slice merges files. |
| Consumers of the settle helpers and Vitest configuration | `mountedActInput.ts` serves the six Story Notes specs, `test-harness/mounted-dashboard.mounted.spec.ts`, which proves `UnsettledPageError`, and `phone-board-mount/phoneBoard.ts` for `navigation/`. `frontend.vitest.config.mts` serves every mounted spec. `dashboardBrowserArgs` is shared with every Playwright browser group. |

## Ordered slices

### 1. A settled frame arrives promptly

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a mounted Story Notes case settles a mount or a clock advance →
its frame round returns in about one frame → the case reads the same
settled page and its reported duration drops by the frame wait.

This is the early probe. Page content, viewport, animations and the launch
options in the premise row are ruled out. Find what holds the tester page
at about ten frames a second: its focus and visibility as the browser sees
them, the headless shell against full headless Chromium, and the provider's
page and context options. Fix the rate where it is set, in the Vitest
configuration's own provider options, leaving `dashboardBrowserArgs` to the
Playwright groups. If the rate cannot be changed, settle with a frame round
only where a mounted action needs a layout observer, and say so in the
helper. `actSettled` keeps settling inside `act` until a final round changes
nothing.

Proof: three alternated pairs of the case-time measurement show the lower
sum; all eleven cases pass; `test-harness/` and `navigation/` pass with the
change, and the full `npm run test:dashboard:frontend` passes once, since
the configuration serves every mounted spec.

If no cause is found within the budget, stop and replan: slices 2 and 3
assume frames no longer dominate.

### 2. Closing Story notes costs no wait

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a case closes the Story notes dialog → the input finishes on the
dialog's native `close` event without a frame-length wait → focus returns to
the opener as before.

Remeasure after slice 1 with a scratch timer on `closing`. When a close
already costs under 20 ms, record that and mark the slice done with no
change. Otherwise remove the wait at its cause and keep `closing` finishing
on the `close` event inside `act`.

Proof: the case-time pairs show the lower sum; the eleven cases pass,
including the opener-focus cues in the add, terminal and edit cases;
`test-harness/` passes.

### 3. The attached-terminal case prints without real-time waits

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: Story notes opens beside an attached terminal → the terminal stays
mounted and connected and shows output printed while notes are open → the
case's reported duration is near the other cases'.

Time the case's attach and print actions with a scratch timer, and remove
the real-time wait at its cause in `mountedSessionTerminal.ts` or the
attached-terminal substitute. The case keeps its assertions: the original
screen stays connected, one attachment, both outputs shown, opener focused.

Proof: the case-time pairs show the lower duration for this case;
`stories/story-notes-terminal` and `terminals/` pass.

### 4. Fixed startup is measured and cut where cheap

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a developer starts a one-case invocation → it reaches its case
sooner, or the report shows where the remaining startup goes.

Split the one-case invocation into npm and runner start, creating Vitest,
title parsing, browser launch, import and the case. Try the cheap changes the
split points at, starting with creating Vitest (0.70–0.80 s) and the
import phase. Keep a change only when three alternated pairs of the
fixed-startup measurement show its gain; drop it otherwise. Selection by
path, `--grep` and `--list` behave as before.

Proof: the pairs for each kept change; `test-harness/` and the full
`npm run test:dashboard:frontend` pass once when the runner or configuration
changed; `npm run lint` passes.

### 5. The family's two numbers are reported

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: the delivered family runs in repeated fresh invocations → the
report gives the case count, each case's duration, their sum, the fixed
startup, the whole command's elapsed time and the load.

Run five case-time and five fixed-startup measurements on the delivered
revision, and three alternated pairs against `47cf696e5` in a second
worktree. Update
[Mounted dashboard support](../../../dashboard/frontend-tests/README.md#mounted-dashboard-support)
where slices 1–3 changed what a mounted case may rely on. Record the
figures in this plan's execution-complete record. A sum that stays above
about 1.1 s is reported with each remaining case's largest cost, as a story
obligation for Terry's decision.

Proof: the recorded figures; eleven cases pass in every run; dashboard
typecheck and `npm run lint` pass.

## Promise mapping

| Seed promise | Slice |
| --- | --- |
| Case durations sum to about 1.1 s | 1, 2, 3; judged in 5 |
| Fixed startup reported before and after, reduced where cheap | 4; reported in 5 |
| Count, durations, sum, startup, elapsed and load reported; matched pairs under load | 5 |
| Eleven behaviors and denominator kept; real browser | every slice's passing eleven cases; no slice changes an assertion |
| Time moved outside a case is added back | 5 |

## Current decisions

- No slice mounts a smaller production boundary or merges spec files:
  mounting costs 27–50 ms, file count showed no gain, and frame time does
  not follow the page.
- Scratch timers are removed before each commit.

## Plan review

Slice-plan refinement was not needed: each slice has one outcome and its own
measurement. One concern is bounded by slice 1, the early probe: the cause
of the ten-frames-a-second rate is unobserved, and slices 2 and 3 are sized on frames no
longer dominating. Whether the three cuts reach 1.1 s is the story's
measured result, reported in slice 5.

## Local verification

Use the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and default test timeouts. Run the full frontend group on awake macOS on AC
with `caffeinate -s -i`; on battery follow the
[open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Compare times in alternated pairs and record the load with each.
