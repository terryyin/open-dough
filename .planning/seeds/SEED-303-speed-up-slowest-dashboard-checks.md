---
id: SEED-303
status: active
planted: 2026-11-11
scope: story
---

# SEED-303 — Faster feedback from the slowest Dashboard checks

<a id="speed-up-slowest-dashboard-checks"></a>

### Run the slowest Dashboard checks together in under 30 seconds

**Identity:** SEED-303#speed-up-slowest-dashboard-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md","assessment":"not-ready","reasons":["The opt-in request-owner clock contract in refined slice 5 awaits the explicit developer choice reserved by that slice. Independent already-authorized execution in the Taken workspace continues; this assessment creates no execution authority."],"basis":{"document":"359db1b1d9f86cf7e18fb67dea156522b03eaf075fc139740c1dbdb6c3922e99","plan":"a993cba6ed5325e22c3b2f1434dc416e76bc6423566e3f3e912d2ede3e5768fe"}}
```

#### Goal

Dashboard maintainers get the same protection for the behavior in the
[45-check starting selection](../evidence/SEED-303-dashboard-test-timings.md)
in **under 30 seconds of elapsed time** in one timed local command. Run
substantially fewer maintained checks for that protection. Use ordinary test
runners and one Playwright worker. Count startup, shared preparation, test
bodies, teardown, and any replacement proof in the same elapsed measure. The two exploratory local runs total
260.84 seconds across separate invocations. The plan establishes the comparable
single-invocation baseline before using it to claim a saving.

#### Scope

Use the smallest scenario and domain data that distinguish each promised
behavior. Each check should protect one coherent intent. Reuse a broader
check only where its assertion would catch the same plausible regression as
the narrower check. Establish that protection before removing the old proof.
Prefer real public boundaries close to the rule. Keep a browser, Git
repository, native process, or build where it supplies distinct protection.
Reuse shared MakeMe for domain setup and existing provider fixtures for
external inputs.

Drive meaningful transitions through observable signals or controlled time.
Use the production path through each boundary, with no new mocks, internal
stubs, wall-clock sleeps, retries, skips, timeout inflation, or special runner
mode to reach the target. Preserve ordinary CI selection and the protections
of related checks affected by shared fixture changes. Unrelated Dashboard
checks and exploratory testing are outside the improvement scope.

The [slice plan](../slice-plans/580-speed-up-slowest-dashboard-checks/PLAN.md)
owns experiments and their reassessment. It carries forward accepted proof
from the [default-timeout story](SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
where that work overlaps.

#### Key examples

- A published Dashboard revision is selected, main advances, and the real
  preview still serves the selected revision. Failed candidates preserve or
  restore the last working deployment. Rejected, excluded, and retried
  changes follow the correct baseline and the relevant shutdown paths still
  clean up.
- A provider tells the dashboard when to check again. Advancing to just before
  and then to the deadline proves no upstream read before it, recovery at the
  deadline, and the return to steady pacing, including the reset that falls
  beyond the normal cadence.
- A small published board exposes the right Taken owner and detail, with
  missing and malformed assignments distinguished. Representative real touch
  input reaches the intended diff pane and proves reading position survives
  layout changes. Distinct icon, portrait, viewport, and accessibility
  promises keep observable proof.
- A stale Cursor runner preserves existing sessions until a new launch
  replaces it. Resumed and recovered sessions use the right recorded scope,
  and missing or unreadable scope refuses to start a client. A pending Take
  stays protected through stale and unrelated reads and returns its actions
  only after the accepted snapshot is complete.
- One accepted landing crosses real receipt ingestion, collection, and rerun
  admission. Its repeat is requested once, survives restart, and shows the
  correct outcome. Each outcome and threshold still has a check that would
  catch its own regression.
- The replacement selection contains substantially fewer distinct maintained
  checks. Three
  consecutive comparable ordinary runs each pass in under 30 seconds, with a
  recorded mapping from every original promise to passing retained proof.
