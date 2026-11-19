# Run the Story Notes checks in half their time

**Identity:** SEED-404#run-the-story-notes-checks-in-a-third-of-their-time
**Source:** [Run the Story Notes checks in half their time](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-story-notes-checks-in-a-third-of-their-time)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer runs `npm run test:dashboard:frontend -- stories/story-notes`
with the usual two workers and gets the original eleven answers in at most
half of the baseline command time. Include startup, teardown and any
build added to the invocation. The [100 ms follow-up](../../seeds/SEED-407-run-the-story-notes-checks-at-about-100-ms-per-case.md#run-the-story-notes-checks-at-about-100-ms-per-case)
owns one third, the smaller edit-case mount, distributable config loading
and the roughly 1.1 s target. Other families and whole-suite throughput
belong to the [rollout story](../../seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-other-frontend-families-at-the-mounted-boundary).

## Current decisions

- Time fresh npm processes through exit on one machine at the same revision of Node, with dependencies installed and both caches warmed equally. Alternate original `e8e01643a` and candidate A–B–B–A. Record each wall time, ratio, revision, worker count, load and cache conditions. Each B must take at most half of its paired A. Run at load comparable to the 6–7 of the reference pairs; record and repeat pairs run above about 15. Discard and explain interrupted, failed or incomplete pairs and repeat them under comparable load.
- Give each run a fresh absolute `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` path. Compare all eleven full case titles, counts and outcomes across runner/file moves. Inspect both output streams for act warnings. Individual durations and phase timings explain the result. Only the timed, warning-free green family run establishes the ratio.
- Keep real Chromium and the product interactions that own these assertions. The service fixture may answer a socket. The app still creates its terminal, receives bytes and owns focus and modal state. Keep the delivered [mounted support](../../../dashboard/frontend-tests/README.md#mounted-dashboard-support) contract: the unreachable revision stream, held-answer cleanup and `UnsettledPageError` after 20 settle rounds. Preserve file isolation, normal selectors, and the public command. [Dashboard status delivery](../../NORTH-STAR.md#dashboard-status-delivery), [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)

## What preparation measured

| Consuming operation and profile | Observation on 2026-11-19 | Consequence |
| --- | --- | --- |
| Full command, historical original against mounted socket and causal settling, Node 24.21 on a 16-core Mac, two workers | 10.117 → 4.435 s and 10.491 → 4.958 s. Both sides passed all eleven titles. Four consecutive candidate runs produced no act warning. | The scratch design preserves the family and meets half: 0.44 and 0.47. This is the decisive premise for slice 3. |
| Keyboard-open notes beside a mounted xterm using the provider's real page, scratch at `f731dab6c` | Opening and newly printed text were present, the original screen stayed connected, attachment count was one and focus returned to Notes. | Reuse `installAttachedTerminalSubstitute` and `directedApplication` at the service boundary. |
| Refresh/reopen through the existing mounted spec | Dropping frame waits for all controls reproduced a missing second dialog. Dropping all frame waits also produced an act warning in a green run. Observing the dialog's own queued close inside `act` passed. | Wait for the event that owns completion. Continue to settle timer advances, released reads and mount-driven layout. |
| Full command after the hold-and-settle correction, trunk `62bc35557` against original `e8e01643a`, two A–B–B–A rounds, two workers, load 25–32 | Trunk 25.1/37.6/26.8/14.5 s, all eleven titles, no act warning; original 31.5/15.2 s in complete runs, two runs failed at `page.clock.pauseAt` with “Cannot fast-forward to the past”. Comparable pairs about 0.80 and 0.95. Fastest trunk Vitest phase 8.3 s for ten cases, 30% import. | Trunk alone does not reach half; slices 1 and 2 supply the gain. High load gave noisy ratios, hence the load condition in the gate. |

## Ordered slices

Budget each slice at 15 active minutes, excluding command waits. If a slice
outgrows that budget, record what was learned and revise the remaining
slices before broadening the work.

### 1. Run the attached-terminal case with the rest of Story Notes

Type: Behavior
Status: done

Move the terminal case from the built-app fixture to the existing mounted
board. Arrange its launch with the shared Node builders and install the
existing terminal application on the Vitest provider's page through
`installAttachedTerminalSubstitute` and `directedApplication`. Scope the
attachment and output handle to that case. Keep the original case title.

**Proof.** Through the regular family command, open Notes from the reviewed
card by keyboard, print while notes are open, then close. Observe both lines,
the original connected xterm screen, one attachment and focus on Notes.
Verify the selection runs eleven cases entirely in mounted Chromium.

### 2. Finish each mounted dialog close on its close event

Type: Behavior
Status: done

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

### 3. Prove the half-time gain through the public command

Type: Behavior
Status: done

Keep the supported runtimes, file isolation, selection and CI proof
contract. A developer needs neither a resident process nor a special
environment flag.

**Proof.** Apply the matched family gate above on the finished change.
Check list, title and file:line selection against the original cases, the
mixed-run selection against a built-app consumer and the frontend shard
partition when file names change. A deliberately failing selected assertion
must fail the command and appear in the proof record. Restore it before
final timing. Record both ratios, test counts and elapsed ms per case. If a
comparable pair exceeds half, record the residual cost for the 100 ms
follow-up and report it instead of broadening this story.

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

Slice-plan refinement was unnecessary. Each slice has a distinct
observation. The decisive premise, that these two mechanisms together reach
half, rests on the scratch combination's 0.44 and 0.47 against `e8e01643a`
at load 6.4–7.1 in the table above, measured through the same command,
worker count and Node version slice 3 uses.

## Learnings

- Slice 1: terminal output printed into a mounted page updates React outside input, so `attachedTerminal` prints and reads the terminal inside `actSettled`; without it the family printed two act warnings. Slice 2's settling changes must keep that path warning-free.
- Slice 2: only a dialog the product closes with `dialog.close()` fires `close`; a line-note save unmounts the dialog through `onSaved`, so it settles as ordinary input. Family runs 4–6 took 5.09, 4.52 and 4.51 s (Vitest duration) at load about 9.

- Slice 3: Vitest's static collector names a case from its raw title source, so a looped or `test.each` title cannot be selected by title in the mounted runner; story-notes now names each case. Matched rounds at load 11–13 came out at 0.51–0.54; at load 6.4–8.8 every pair was at most 0.495.

## Story obligations

### G1. Looped story-notes cases cannot be selected by title
Reported: slice 3 — "the two looped cases titled “`${failure}` keeps its draft…” in `story-notes-add.mounted.spec.ts:55` can't be selected by title"
Story clause: "A developer running the story-notes specs gets their answer"
Disposition: proved by slice 3: the spec names each case with a fixed title; through the public command `--list` gives the original eleven titles, `--grep 'keeps its draft'` runs both cases and file:line selects one (slice-3 selection run, exit 0)

### G2. Round 1 pairs exceeded half at load 11–13
Reported: slice 3 — "6 of the 8 timed pairs came in at or under half the baseline time, and the 2 pairs in round 1 did not"
Story clause: "After, in a matched session at comparable load, each run takes at most half of its paired baseline"
Disposition: proved by slice 3: three later A–B–B–A rounds at load 6.4–8.8 gave 0.407, 0.452, 0.419, 0.495, 0.457 and 0.411, all eleven titles green with no act warning in every run (slice-3 timing records s3-b1..b3); round 1 had run at load 11–13

### G3. Looped or template titles in later mounted specs miss title selection
Reported: slice 3 — "a future mounted spec with a looped or template title would again silently miss title selection"
Story clause: "Deferred to the rollout story: the other families and the whole-group minute."
Disposition: excluded "Deferred to the rollout story: the other families and the whole-group minute."
