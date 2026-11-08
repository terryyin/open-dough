# Reduce the cost of private dashboard test fixtures

**Identity:** SEED-262#reduce-private-fixture-lifecycle-cost

**Source:** [Refined story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reduce-private-fixture-lifecycle-cost)
**Source review:** [source review](source-review.md)

## Goal and scope

Shorten private server setup and teardown for the two attention journeys and
the authenticated-read refusal spec. Keep real Vite preview for attention,
the real HTTP boundary for refusals, private browser and fake-service state,
and the real native runner in the tests that prove it. Build and bundle
production, Git fixture construction, session arrangement, and polling
cadence have their own stories.

## Current decisions

- Pre-edit baseline on execution base `ca63554f51ef7cd82835af32b23dc31bc5d8dcde`
  (2026-11-08, macOS AC, Node 24.21.0, Playwright 1.63.0, workers=2,
  load averages ~9.0–10.5). Matched selection
  `agent-launch-attention\.spec\.ts$` + `authenticated-read-refusal\.spec\.ts$`:
  both runs 24 cases, strict passed. Run 1 wall 16.40s / terminal 15792 ms
  (proof `/tmp/seed262-baseline-3qXP8h/run1-proof.json`); run 2 wall 13.02s /
  terminal 12682 ms (`…/run2-proof.json`). Summed attempt durations 8078 ms
  then 8470 ms. Per-fixture setup/close still to be compared with the
  delivered opt-ins under Slice 2.
- The cost to remove is an unused real Cursor runner. The
  [launch middleware](../../../dashboard/server/launchBoundary.ts) calls
  `ensureCursorRunner` before listening. It already accepts a live runner
  at the address in this HOME. Reuse that path from the test harness, with
  an explicit fixture selection and a fresh owned HOME and loopback listener.
  Use the existing address writer and the mechanism demonstrated by
  [the test runner occupant](../../../dashboard/tests/support/cursorRunnerJourney.ts).
  That occupant deliberately drops all connections for unreachable-runner
  tests. The lighter fixture accepts the startup connection and the ordinary
  handoff-release request on shutdown, and reports unexpected protocol work
  as a fixture failure. Keep the existing real-runner default. Preserve
  production startup and production middleware.
- Tie substitute teardown to the owner in
  [dashboard fixture lifetime](../../../dashboard/tests/support/dashboardFixtureLifetime.ts).
  Stop the dashboard server before releasing the address and listener so its
  closing boundary can finish. Remove the address owned by the substitute
  before removing its HOME. Never put the substitute's worker PID through
  the real runner's stop or exit fallback. Preserve cleanup on partial start
  and after test failure. Keep caller-owned restart machines on the real
  route, with the same private HOME across server lifetimes. Keep each
  GitHub answerer and request owner private.
- The private context and fake listeners were cheap in the observed profile.
  Retain that isolation. A separate private request-owner probe found lower
  teardown latency from signalling a cooperative owner after withdrawing its
  record. It did not establish safe ownership across generations, reused
  PIDs, or an owner still starting. Keep that mechanism out of this change.
- Respect [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [the Architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  the browser still reads the published Board and machine-local observations
  through the real local boundaries. The new arrangement changes only one
  native fixture. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  support faster feedback with the same proof and a measured net benefit.
- Use the actual execution base for measurement. The
  [artifact-demand plan](../513-prepare-dashboard-artifacts-on-demand/PLAN.md)
  touches the same fixture entry points, and the
  [prerequisite-state plan](../518-arrange-prerequisite-state/PLAN.md)
  changes the attention and restart specs. Neither supplies a capability this
  work needs. If either has landed, use its current fixture shape and case
  arrangement in both samples.

## Outside-in proof

| Seed promise | Owner | Required observation |
| --- | --- | --- |
| Private HTTP server still refuses or answers through the existing boundary | Slice 1 | The full authenticated-read refusal spec preserves its response and `gh` assertions. The selected fixture has no real Cursor runner and unexpected Cursor protocol work fails after cleanup. |
| Independent cases and runs, with owned cleanup | Slice 1, recheck for preview in Slice 2 | Live fixtures read different revisions for the same repository through real HTTP and private `gh` owners. One closes or fails and retires its listener, address, server, request owner, and scratch state while the other's read still succeeds. Exercise overlap in the same worker and across two strict runner invocations. Existing run-process checks still observe normal, abandoned, and orphan cleanup. |
| Built preview still gives the attention proof | Slice 2 | Both full attention cases preserve their existing counts, native listing loss and recovery, published membership, project switch, reload, and Mark as done. |
| Real runner and restart where they are under proof | Slices 1–2 | The boundary-server and serving-modes checks still see their real runner processes. The card-session-state restart keeps the same machine and real preview. The run-process cases still retire real children. |
| Lower lifecycle cost and worthwhile feedback gain | Slice 2 | Compare repeated strict runs of the same selection and case counts. Measure the fixture from arrangement through listening and from close through resource retirement, including substitute work. Keep the change only with a repeatable saving and a credible improvement in total elapsed time. |

## Decisive premises

Observations in the owned workspace at `235a76487` on 2026-11-08 used macOS on
AC, Node 24.21.0, Playwright 1.63.0 and the ordinary two-worker Chromium
configuration. All scratch edits were reverted.

- The ordinary strict runner passed 13 cases across
  `runtime/serving-modes.spec.ts`, `runtime/boundary-server.spec.ts`,
  `agent-launch-story-card-session-states.spec.ts`, and
  `observation/run-processes.spec.ts`. They observed real runner entries,
  real dev/preview equivalence, the card states through same-machine restart,
  and actual normal, timed-out, and orphan process cleanup. The strict
  transcript ended at 03:57:48 UTC.
- A helper-level profile started and closed three of each private built
  preview and plain HTTP boundary. It observed the distinct runner, the
  real project-configuration response, and removal of the HOME and both
  processes. Preview startup took 261–286 ms, boundary startup 197–215 ms,
  and both closed in 28–32 ms without journey traffic. A warm private
  Chromium context with page and external route guard started in 26–32 ms.
  Fake GitHub startup took up to 3 ms and inactive Codex setup under 1 ms.
  These are component times.
- The matched strict selection below completed all 24 cases on each of
  four runs. A temporary harness substitution used the private
  `occupyRunner` address before startup in the two selected specs. It
  preserved the full browser attention and real HTTP refusal/accepted-read
  assertions. Across these runs preview setup fell from 252–284 ms to
  163–206 ms, and boundary setup from 224–229 ms to 111–139 ms. Strict
  runner duration was 12.17–12.51 s with the real runner and 11.53–11.70 s
  with the substitute. Total close times varied with existing request-owner
  cleanup. A second matched pair used a scratch HTTP listener that recorded
  and failed unexpected protocol work and allowed handoff release. It
  selected the refusal boundary and attention's two-project preview setup.
  All 24 cases passed on each side, with no unexpected Cursor request.
  Preview setup went from 273–287 ms to 167–172 ms, the boundary from
  221 ms to 116 ms, and strict runner duration from 12.78 s to 11.89 s
  (03:59 UTC). These probes used temporary selectors and did not exercise
  the final ownership contract. Repeat with the delivered opt-ins.

## Local gates and comparison

Follow [test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. On a fully awake Mac on AC, run under `caffeinate -s -i`. On
battery, plug in or start fully awake with the lid open under
`caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Run `npm run typecheck:dashboard` and `npm run lint` for changed fixtures
and specs. Use a fresh absolute `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` for each
normal strict run without a reporter override.
[Proof record](../../../dashboard/tests/proof-record.md).

```sh
caffeinate -s -i npm run test:dashboard -- \
  'agent-launch-attention\.spec\.ts$' \
  'authenticated-read-refusal\.spec\.ts$' --workers=2
```

Before edits, record the selection and fixture timings on the execution
base. Repeat on both sides under comparable load, counting executed cases
and actual fixture lifecycles. Report total elapsed time, per-fixture setup
and close, and runner attempt durations. Keep timing thresholds out of test
assertions. Run the real-process selection above after the shared harness
change. Run the shared-request-owner case when the change reaches its
borrowed-owner path. Verify distinct consumers surfaced by the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Hosted dashboard shards and the normal target CI checks remain applicable.

## Slices

### 1. Private HTTP checks omit the unused real runner

**Type:** Behavior

**Status:** done

Add the test-side runner arrangement and its ownership to the existing server
harness. Select it explicitly for the authenticated-read refusal spec. Prove
the refusals before `gh` and the accepted read through `gh` in the complete
spec. Prove absence of the real runner, unexpected protocol diagnostics, and
that success and failure leave no owned resources. Exercise overlapping
private HTTP fixtures and runs through the same harness. Run the existing
real boundary, preview, restart, and process cleanup owners. This leaves a
working HTTP increment and the attention journeys on their original fixture.

### 2. Attention journeys start and close more cheaply

**Type:** Behavior

**Status:** done

Expose the same explicit selection through the page fixture and apply it to
the two attention cases. Keep their private contexts, servers, fake answers,
and existing assertions. Recheck preview ownership, including real restart
where the runner is retained. Compare the matched selection against the
pre-edit baseline and record the gain and its limits. Update the fixture
contract where the opt-in and its boundary need to be understood.

## Preparation review

Slice-plan refinement was unnecessary. The HTTP opt-in proves the shared
mechanism and ownership with a real consumer, and the separate preview
opt-in owns the browser preservation and final comparison. No remaining
slice-specific concern was identified.

## Progress

### Slice 1 accepted proof (reuse while boundaries hold)

- `cursorRunner: "stand-in"` on harness-owned machines; default remains
  `"real"`. Stand-in accepts startup and `/release-handoffs`, records other
  protocol as fixture failure after cleanup, never routes worker PID through
  `stopCursorRunner`.
- Typecheck: `npm run typecheck:dashboard` pass after refactor.
- Strict: `authenticated-read-refusal` + `private-http-stand-in-runner`,
  workers=2, selected 26, `/tmp/seed262-s1-F37XUF/refusal-standin.json`.
- Strict real owners: serving-modes, boundary-server,
  agent-launch-story-card-session-states, run-processes, selected 13,
  `/tmp/seed262-s1-F37XUF/real-owners.json`.
- Post-change refactor: consolidated stand-in withdraw/failure helpers;
  extracted `dashboardServerTypes.ts` and `authenticatedReadRefusalCases.ts`.
  Behavioral proofs reused; typecheck rerun.

### Learnings

- Stand-in address must use the worker PID for `ensureCursorRunner` aliveness,
  so lifetime must never SIGTERM that PID—only remove the owned address and
  close the listener.
- Attention journeys remain on the real runner until Slice 2.

### CI repair disposition (42447021471/1 on bf621efc)

Already-traced: dashboard (2/12) failed because listed-read
`revision=main` expected `onlyPinned` after the slice 1 case extract; product
returns `The pinned revision is not a commit sha.` Restored
`unpinnedRevision` on those cases. Focused proof:
`authenticated-read-refusal` strict passed (22). No broader concept change.
Repair SHA: `572b4f4dab518d35ccbde584aeffd428685d8360`.

### Slice 2 accepted proof

- Page fixture exposes `cursorRunner` (default real); attention selects
  stand-in; `expectCursorRunnerStandIn` / `runnersFor===0`.
- Matched selection 24 strict passed after restore
  (`/tmp/seed262-s2-accept-bLF9wn/matched.json` and resume run).
- Real owners session-states + serving-modes: 7 strict passed.
- Measurement keep: ~100 ms setup saving; ~2 s average wall gain vs
  `/tmp/seed262-baseline-3qXP8h`; fixture contract in
  `dashboard/tests/native-host-fixtures.md`.
- Post-change refactor: shared stand-in expect helper; README under 250.


## Story obligations

### G1. Git fixture construction excluded
Reported: slice 1 — "source review — outside this increment"
Story clause: "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Disposition: excluded "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Commitment: 12.1


### G2. Run-wide build and artifact production excluded
Reported: slice 1 — "source review — outside this increment"
Story clause: "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Disposition: excluded "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Commitment: 12.2

### G3. Workflow prerequisite arrangement excluded
Reported: slice 1 — "source review — outside this increment"
Story clause: "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Disposition: excluded "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Commitment: 12.3

### G4. Polling cadence excluded
Reported: slice 1 — "source review — outside this increment"
Story clause: "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Disposition: excluded "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Commitment: 12.4

### G5. Suite-wide fixture migration excluded
Reported: slice 1 — "source review — outside this increment"
Story clause: "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Disposition: excluded "Git fixture construction, run-wide build and artifact production, workflow prerequisite arrangement, polling cadence, and suite-wide fixture migration are outside this increment."
Commitment: 12.5

### G6. Partial-start cleanup without dedicated crash probe
Reported: slice 1 — "slice 1 — "no dedicated partial-start crash probe (harness still closeOwned() on startOnOwnAddress failure)""
Story clause: "Cleanup retires only what the fixture owns, including after startup or test failure."
Disposition: proved by slice 1: dashboardServer.ts startOnOwnAddress catch awaits closeOwned(); stand-in wired into dashboardFixtureLifetime.release before HOME removal