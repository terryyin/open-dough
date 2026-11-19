# Run the Story Notes checks in a third of their time

**Identity:** SEED-404#run-the-story-notes-checks-in-a-third-of-their-time
**Source:** [Run the story-notes checks in a third of their time](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-story-notes-checks-in-a-third-of-their-time)

## Goal and scope

A developer runs `npm run test:dashboard:frontend -- stories/story-notes`
with the usual two workers and gets the original eleven answers in at most
one third of the baseline command time. Include startup, teardown and any
build added to the invocation. The [100 ms follow-up](../../seeds/SEED-407-run-the-story-notes-checks-at-about-100-ms-per-case.md#run-the-story-notes-checks-at-about-100-ms-per-case)
owns the roughly 1.1 s target. Other families and whole-suite throughput
belong to the [rollout story](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-other-frontend-families-at-the-mounted-boundary).

## Current decisions

- Time fresh npm processes through exit on one machine at the same revision of Node, with dependencies installed and both caches warmed equally. Alternate original `e8e01643a` and candidate A–B–B–A. Record each wall time, ratio, revision, worker count, load and cache conditions. Each B must take at most one third of its paired A. Discard and explain interrupted, failed or incomplete pairs and repeat them under comparable load.
- Give each run a fresh absolute `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` path. Compare all eleven full case titles, counts and outcomes across runner/file moves. Inspect both output streams for act warnings. Individual durations and phase timings explain the result. Only the timed, warning-free green family run establishes the ratio.
- Keep real Chromium and the product interactions that own these assertions. The service fixture may answer a socket. The app still creates its terminal, receives bytes and owns focus and modal state. Keep the delivered [mounted support](../../../dashboard/frontend-tests/README.md#mounted-dashboard-support) contract: the unreachable revision stream, held-answer cleanup and `UnsettledPageError` after 20 settle rounds. Preserve file isolation, normal selectors, and the public command. [Dashboard status delivery](../../NORTH-STAR.md#dashboard-status-delivery), [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)

## What preparation measured

| Consuming operation and profile | Observation on 2026-11-19 | Consequence |
| --- | --- | --- |
| Full command, historical original against mounted socket and causal settling, Node 24.21 on a 16-core Mac, two workers | 10.117 → 4.435 s and 10.491 → 4.958 s. Both sides passed all eleven titles. Four consecutive candidate runs produced no act warning. | The scratch design preserves the family and saves more than half of elapsed time. The remaining gaps to one third are 1.06 s and 1.46 s. |
| Keyboard-open notes beside a mounted xterm using the provider's real page, scratch at `f731dab6c` | Opening and newly printed text were present, the original screen stayed connected, attachment count was one and focus returned to Notes. | Reuse `installAttachedTerminalSubstitute` and `directedApplication` at the service boundary. |
| Refresh/reopen through the existing mounted spec | Dropping frame waits for all controls reproduced a missing second dialog. Dropping all frame waits also produced an act warning in a green run. Observing the dialog's own queued close inside `act` passed. | Wait for the event that owns completion. Continue to settle timer advances, released reads and mount-driven layout. |
| `npm run test:dashboard:frontend -- stories/story-notes-` at `f731dab6c`, five mounted files and ten cases, fresh processes | Baseline Vitest creation took 1.26/1.13 s, title parsing 29/39 ms, test specification execution 8.34/7.16 s and close 40/32 ms. Both runs passed. | Title discovery alone cannot account for the missing second in this profile. |
| Full ordinary family on `f731dab6c`, built-app terminal retained, changing only the configuration loader in a local A–B–B–A | `createVitest` took 1.66/1.89 s with the module runner and 0.81/0.78 s with the native loader and Node 24.21's experimental type transform. All four commands exited successfully. Whole-command times were 13.97/13.31/12.98/17.30 s in execution order. | Configuration loading is measurable. A local runtime flag and times from a different case arrangement establish neither a distributable change nor the combined one-third result. |
| Original eleven cases at `e8e01643a` against the mounted terminal, close event and native config loader together | 17.836 → 9.793 s and 22.905 → 11.642 s. With explicit dependency preoptimization, 30.884 → 14.946 s and 24.535 → 12.043 s. All eight runs passed the same eleven titles without act warnings. Vitest attributed 41–43% to imports in the candidate runs. | Both combinations missed one third. Different host loads prevent ranking the variants across these two comparisons. The import share directs the next experiment. |
| Full command after the hold-and-settle correction, trunk `62bc35557` against original `e8e01643a`, two A–B–B–A rounds, two workers, load 25–32 | Trunk 25.1/37.6/26.8/14.5 s, all eleven titles, no act warning; original 31.5/15.2 s in complete runs, two runs failed at `page.clock.pauseAt` with “Cannot fast-forward to the past”. Comparable pairs about 0.80 and 0.95. Fastest trunk Vitest phase 8.3 s for ten cases, 30% import. | The correction's adaptive settling did not close the gap. The load was too high to rank a new candidate within the 1.06–1.46 s it still needs, so the smaller-mount experiment stays in slice 1. |
| Full scratch family with two isolated files, then with a bundle built on each invocation | Both alternatives missed one third in their own matched runs. Doughnut's reported suite averaged 25 ms across 2,573 mixed cases, with local parallelism and file isolation. | Do not extrapolate a six-case rule test or delete the browser boundary from focus, dialogs or terminal checks. [Family measurements](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-story-notes-checks-in-a-third-of-their-time) and [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts) |

## Ordered slices

Budget each slice at 15 active minutes, excluding command waits. If the runner
change outgrows that budget, record what was learned and revise the remaining
slices before broadening the work.

### 1. Find a proof boundary that closes the measured gap

Type: Behavior
Status: planned

Use the measured socket and close-event candidate in a disposable checkout.
Profile which production modules the edit cases load only because they
mount the whole App. Try the three cases in the edit spec at the smallest
production boundary that still proves their card count, dialog, focus,
context and service-request observations. Start with the real notes-bearing
card or its notes control and service subscription. If an assertion needs
the real card, keep the card. Retain the integrated board in the terminal,
retained-note and refresh journeys. Measure the full selection to learn
whether this change removes enough import and render time when the other
files keep their original boundaries. Loading the native config and
preoptimizing React and xterm alone have already been tried.

**Proof.** Apply the matched family gate above. Record both fractions, the
unmodified title set and warning output. Check that the winning approach
can run through the ordinary command on the project's supported Node range.
If there is no reproducible qualifying route, record the residual cost and
stop before slices 2–4. The one-third promise stays open.

### 2. Run the attached-terminal case with the rest of Story Notes

Type: Behavior
Status: planned

Move the terminal case from the built-app fixture to the existing mounted
board. Arrange its launch with the shared Node builders and install the
existing terminal application on the Vitest provider's page. Scope the
attachment and output handle to that case. Keep the original case title.

**Proof.** Through the regular family command, open Notes from the reviewed
card by keyboard, print while notes are open, then close. Observe both lines,
the original connected xterm screen, one attachment and focus on Notes.
Verify the selection runs eleven cases entirely in mounted Chromium.

### 3. Finish each mounted interaction when its observable effect settles

Type: Behavior
Status: planned

Use the shared mounted input support for ordinary controls. For dialog
close, subscribe to the specific dialog's native close event before issuing
its action and await delivery inside React's `act`. Keep `actSettled`'s
task and frame rounds where layout callbacks, a clock advance or a released
read can still update the page. Preserve `UnsettledPageError` and the
held-answer cleanup.

**Proof.** Run the family three times. Keyboard editing and save keep the
content, service request and focus. Both refused-save paths retain drafts,
stale reads cannot replace a save, and refresh can open the dialog a second
time. All eleven cases must pass with no act warnings. Run the mounted
isolation and phone-board consumers as part of the local gate below.

### 4. Deliver the measured improvement through the public command

Type: Behavior
Status: planned

Apply the proof boundary supported by slice 1, retaining every original
assertion. Keep the supported runtimes, file isolation, selection and CI proof contract.
If it changes config loading, exercise the actual Node fixture graph,
including its TypeScript and top-level awaits. A developer should need
neither a resident process nor a special environment flag.

**Proof.** Repeat the paired acceptance measurement on the finished change.
Check list, title and file:line selection against the original cases, the
mixed-run selection against a built-app consumer and the frontend shard
partition when file names change. A deliberately failing selected assertion
must fail the command and appear in the proof record. Restore it before
final timing. Record both ratios, test counts and elapsed ms per case.

## Local gate and review

Run `npm run test:dashboard:frontend -- mounted-dashboard stories/story-notes board-swipe board-indicators`
because these consumers share input and cleanup. Run `npm run typecheck:dashboard`
and lint changed sources. For changes in shard membership, run
`node --test Distribution/tests/support/browser-group-shards.test.mjs`.
Use the selected MakeMe builders and Dashboard page objects when changing
tests, preserve default timeouts and refactor each increment before its commit.
Carry the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written into each delegation and repair handoff. Start long local runs
fully awake. On AC use `caffeinate -s -i`. On battery, plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

Slice-plan refinement was unnecessary. Each slice has a distinct observation
and the timing experiment precedes any permanent change. The remaining
concern spans slices 1 and 4. The best observed candidate still missed
one third by 1.06–1.46 s. The combined loader experiments missed it too, and
trunk after the hold-and-settle correction still measured about 0.80–0.95.
The timing and assertion checks in slice 1 determine whether a smaller
production mount can close the gap.

## Learnings

## Story obligations
