# Diagnose the refinement dialog touch disclosure

CI run 44923638590, attempt 1, dashboard-frontend shard 2/2 job
136904845268 on story branch revision 12435c6ef5a56c98cdfb3d1010a01925f0194bd0.
The new mounted touch case reached the tap on Refinement options and the
subsequent Explore checkbox never became visible. CI reported 116 passing
and one failing Vitest case. At first notification, other jobs were still
running. The checkout Git evidence directory holds the bounded diagnostic
`ci-44923638590-1.json`.

The case passed in the focused two-worker mounted run on macOS, so diagnostic
work must capture the failure or establish a deterministic reproduction
before accepting a fix. The case and native touch helper were introduced in
Slice 1. The subsequent attachment migration is paused with its one untracked
spec preserved by the managed CI repair stash. Its record is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-M67QFg/record.json`
and the stash OID is `3c3c1155f333ba52d176d86f5799474aa823561d`.

Round 1 begins at zero active minutes. Start from the retained CI failure
and local passing proof. Identify where the native touch differs from the
disclosure's expected click or whether an open select intercepted it. Record
the chosen experiment and bounded stopping count before a repeat.

## Round 1 experiments

The failed CI accessibility tree kept the selected host, model and tracking
choice and showed the options group closed. The failed job ran 117 mounted
cases and reported one failure. The repository's cached Ubuntu image is
reachable through the macOS host's `colima` context. It has Node 24.21.0
and Chromium 158.0.8127.18, matching the lock. It runs on Linux arm64 and
cannot establish GitHub's amd64 architecture behavior. The prior host
preparation passed on macOS.

First hypothesis is that Ubuntu reproduces the closed disclosure without
instrumentation under the same Chromium build. Run the single refinement
touch spec once in the cached device on two workers, with container-local
modules and no concurrent owned test jobs. If it passes, stop natural
repetition and instrument the tap path. Another container on the same
Colima daemon is already running. Host load was 25.12 on 16 logical cores
at the decision. The two-CPU diagnostic uses no competing browser cohort
of its own.

The unmodified Linux baseline passed 1/1. Screenshot from the actual CI
artifact shows the dialog body scrolled with the two-line, still-closed
summary just above its fixed footer. This establishes that the relevant
element exists and ends up in the visible region. It does not establish
where the touch landed before the screenshot.

Second hypothesis is that the native event can target a stale element after
DOM scrolling or that the preceding select popup intercepts activation.
The next run instruments the actual CDP dispatch with its measured DOM
target, coordinates, scroll position and observed pointer, touch and click
events. Run exactly three cases in the same Linux container and browser
configuration, adding browser main-thread throttling for two experiments
to distinguish native input sequencing from a platform-wide inability to
activate the disclosure. No production code changes during this probe.
Revert the temporary probe after collecting its result.

The three focused instrumented Linux cases passed 3/3 at 1×, 3× and 4×
Chromium CPU throttling. All three showed pointerdown, touchstart,
pointerup, touchend and click on the intended summary. The preceding
Host and Model receives were complete and did not intercept a later
gesture in these runs. The summary center was x=195, y=708.09 with a
50.38-pixel-high wrapped summary. The state and geometry match the failed
CI screenshot.

Third experiment tests the distinct possibility of state or scheduling
carried from the failed CI shard's other mounted files. Run the exact 35
Vitest paths in the retained job JSON once on Linux with two workers.
Keep event traces but remove forced renderer throttling. Compare the
original refinement touch case and its observed native events to the
isolated run. Do not run the retained Playwright suite, whose browser
contexts cannot carry onto these mounted files.

The instrumented CI shard replay passed all 117 cases in 35 files. It
produced the same complete event sequence for the disclosure, ruling out a
persistent failure induced by the selected neighbors in that run.

Fourth experiment deliberately queues one additional native body scroll
at the end of the turn in which the helper requests scroll-to-control.
This forces the gap between the helper's synchronous DOM hit check and
its asynchronous CDP touch dispatch without modifying the launch
component or manually delivering an event. The target remains visible.
Run one case, recording the target displacement and the actual native
event receiver. The controlled reproduction succeeds only if the option
stays closed as in CI and the measured native receiver differs from the
center's original DOM hit target. The fixture will remain temporary.

The controlled pre-fix case failed with the same missing Explore checkbox
and closed Refinement options summary. Pointerdown, touchstart, pointerup,
touchend and click all went to a different summary. The intended
summary's top moved from 682.91 to 601.91 between the precomputed
y=708.09 center and native dispatch. Its DOM hit-test precondition had
already passed. This proves that the old helper could touch a different
element after a scroll. The natural CI run has no native event trace, so
the corresponding historical receiver remains unknown. Round 1 paused
at 6.9 active minutes.

## Repair experiment

The helper now checks the target's geometry across consecutive rendered
frames after scrolling, checks the viewport hit point again and observes
the real touch pointer landing. The identical controlled scroll will run
once after repair. It should deliver all native events to the intended
summary and complete the unchanged rotation, restricted-height and
Cancel observations. Then remove all temporary injections and traces
and run both maintained callers on Linux and macOS at two workers.

The identical forced scroll passed after repair. The native point moved
to y=627.09 and every observed event reached the intended options
summary. The options opened, Explore was selected, the choices and
draft survived rotation and narrow height, and Cancel sent nothing.
The temporary diagnostic changes were removed before maintained proof.

The failed hosted branch revision requires a fresh CI run on the repaired
published revision. The hypothesis is that this same mounted case on
GitHub's Linux amd64 runner passes because native input waits for stable
rendered geometry and observes its landing. The stopping count is one
fresh CI attempt. Inspect that attempt's actual signature if it fails.

The two maintained callers passed all five cases on Linux arm64 and all
five on macOS after the diagnostic edits were removed. Vitest reported
5.42 s on Linux and 10.96 s on macOS. Both ran with the locked Chromium
build and two workers. Retained run records and consumer trace are in the
checkout Git evidence directory through
`refinement-touch-ci-implementation.md`.

## Hosted confirmation

Use one automatic CI attempt on the published repair to test the hypothesis
that stable geometry and trusted hit verification also keep the options
disclosure usable in the affected amd64 shard. If that observation fails
again, diagnose the reported hit or disclosure failure before another
attempt. The independent refactor review made no edits.

Both dashboard frontend shards passed on hosted amd64, including the shard
that had failed on the original revision. The overall run was cancelled
when the next published slice superseded it. The repository workflow
cancels older runs on the same ref, and the superseding revision contains
the repair. [Hosted run 44925570234](https://github.com/terryyin/open-dough/actions/runs/44925570234).
