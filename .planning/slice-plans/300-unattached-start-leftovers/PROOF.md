# Accepted execution proof

Proof for [the active correction plan](PLAN.md), retained for retrospective and wrap-up.

## Slice 1

The coordinator inspected settlement/schema/selection/admission/UI and the actual
real-origin setups and assertions. Native and formatter failures stay definite;
Continue and identical Start resume one original attempt/worktree with its landing
choice, handoff and reporting; success removes the record without publishing.

Initial implementation checks passed (20 cases):

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-kept.spec.ts dashboard/tests/agent-launch-start-session-stops.spec.ts dashboard/tests/agent-launch-start-session-recovery.spec.ts dashboard/tests/agent-launch-matching-rules.spec.ts dashboard/tests/agent-launch-own-record-continuation-race.spec.ts --workers=3
```

Affected consumers passed before refactoring (125 cases); after extracting polling
and settlement and relocating the two refusal cases, 124 passed and one hit the
unrelated inherited 500ms held-start timeout:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session- dashboard/tests/agent-launch-ad-hoc dashboard/tests/agent-launch-continuation.spec.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-preparation-codex-continuation.spec.ts dashboard/tests/agent-launch-worker-handoff.spec.ts dashboard/tests/launch-attempt-worker.spec.ts dashboard/tests/responsive-session-recovery dashboard/tests/responsive-session-reconciliation dashboard/tests/startup-host-words.spec.ts --workers=3
```

The failure artifact's attempt settled `timed-out` at 533ms before native launch.
The relocated refusal journey uses the normal start wait; intentional held-start
journeys keep 500ms. Both relocated refusal cases then passed:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-failed.spec.ts --workers=3
env -u FORCE_COLOR -u NO_COLOR npm run typecheck:dashboard
```

Observation owners: `agent-launch-start-session-failed.spec.ts`, “a native refusal
keeps…” and “a failed established session…” use the real installed start/bare
origin and synthetic native refusal; assertions inspect retained session, failure
wording/marker, definite recovery controls, original session/block/cwd/reporting,
one start/worktree/attempt, consumed record and unchanged origin.
`agent-launch-start-session-stops.spec.ts`, “a formatter failure…” corrupts the
installed formatter, observes zero native calls plus actual kept establishment,
then repairs it and observes successful Continue without a second start/worktree.
Existing refusal-before-establishment, expiry/restart, unconfirmed-input, matching,
worker liveness and own-record continuation proof remains accepted.

The refactor completed with no unresolved gap. Setup uses Node24.21.0 and the
checkout-bound native setup in the plan; every dashboard run builds fresh assets.
Pre-change defect evidence is the unchanged-source preparation probes in
[PREPARATION.md](PREPARATION.md); new regressions were not rerun against old code.
