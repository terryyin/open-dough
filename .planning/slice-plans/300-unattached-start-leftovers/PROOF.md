# Accepted execution proof

Proof for [the active correction plan](PLAN.md), retained for retrospective and wrap-up.

## Slice 1

Delivered: `2dac32158d73f4775e99776ada25d2f049477472` on
`origin/refs/heads/codex/leave-nothing-behind-after-an-unattached-start`; suffix base
`00039df490c81724ed6d1118b97490eb7e51b9f8`; observation reused the recorded stream.

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

## Slice 2

Delivered: `5eb2d2130ae02b07886f72c0304d15f8624c7616` on the same remote execution
branch; suffix base `2dac32158d73f4775e99776ada25d2f049477472`; observation reused.

The coordinator inspected `launchAttemptStore.ts` successful-write cleanup and
new real-start/store assertions. Only expired keys absent from the actual saved
replacement are removed; refusal, rename failure and restored entries retain
starts. The real held-start journey completes after its wait, then the isolated
clock advances 31 days and `dropExpiredAttempts` exercises actual pruning. Current,
unsettled and other-project controls survive; all Git refs/worktrees remain.
`launch-attempt-retention.spec.ts` exercises refusal byte preservation, restoring
an expired entry, successful pruning and actual late `keepEstablishedSession`
not recreating its key; injected attempt-file rename failure preserves both files.

Implementation proof passed (10 retention/landing/admission cases, 9 admission/
completion consumers), with Node24.21.0 and fresh per-run dashboard assets:

```sh
npm run typecheck:dashboard
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-kept.spec.ts dashboard/tests/launch-attempt-retention.spec.ts dashboard/tests/agent-launch-start-session-landing-retained.spec.ts dashboard/tests/one-shot-landing-recovery-retention.spec.ts dashboard/tests/one-shot-landing-recovery-deletion.spec.ts dashboard/tests/launch-attempt-admission-close.spec.ts --workers=3
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-completion-binding.spec.ts dashboard/tests/agent-completion-attempt-loss.spec.ts --workers=3
```

Refactoring extracted the real-start journey unchanged into
`agent-launch-start-session-retention.spec.ts`. The coordinator inspected its
actual start/late-result setup and both-store/Git observations; store and consumer
boundaries stayed unchanged. The refactor completed; four cases and typecheck passed:

```sh
npm run typecheck:dashboard
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session-kept.spec.ts dashboard/tests/agent-launch-start-session-retention.spec.ts --workers=3
```

## Slice 3

Delivered: `eba960adbf71f072345394b45ce39db25e216f85` on the same remote execution
branch; suffix base `5eb2d2130ae02b07886f72c0304d15f8624c7616`; observation reused.

The coordinator inspected the session schema/producer/fixture cleanup and direct
recovery expectation. Prepared receipt and workspace creation facts are untouched.
Older launch-record and kept-start tests seed only the legacy field and observe
real schema/store reads preserving the session while excluding it. The maintained
path explanation describes compatibility until the installed payload accepts
equivalent paths; source-start tests observe real symlink reuse and prepared facts.

Passed (40 Start-session cases, eight source-start cases, typecheck):

```sh
env -u FORCE_COLOR -u NO_COLOR npm run typecheck:dashboard
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session- --workers=3
env -u FORCE_COLOR -u NO_COLOR node --test src/skills/dough-execute-plan/scripts/established-session-start.test.mjs
```

All fixture consumers ran:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/launch-record-session-rules.spec.ts dashboard/tests/launch-attempt-retention.spec.ts dashboard/tests/execution-start-result.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-ad-hoc-cursor-established.spec.ts --workers=3
```

The batch completed 22 cases without failure; the new older-launch fixture lacked
required recorded `title`. After adding that starting precondition, all eight
record-schema cases passed, retaining the other unchanged consumer proof:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/launch-record-session-rules.spec.ts --workers=3
```

No required native acceptance is claimed; the existing explicit exclusion stands.

Independent refactor result: none — already clean; no edits/tests, accepted proof
unchanged. All changed paths comply with the 250-line limit.

## Slice 4

The coordinator inspected the ownership-preserving test changes and measured
JSON summaries and mutation assertion failures. Eight equivalent Start cases
were removed: request-choice identity data lives in matching rules; blank/collision
slug data in workspace rules; no-establishment defaults in ad-hoc page journeys;
one combined warning/Back/Cancel/Continue journey observes both landing choices.
Default-main landing handoff remains in the automatic-landing page, real unattached
capture remains in the isolated capture journey, with variations in shared landing
suites. Native/layout/lifecycle/worker/SEED-130 purposes remain distinct and intact.

The same selected 31 files, fresh production setup, Node24.21.0, reporter extending
quietReporter and three workers passed before and after. Baseline at `eba960ad`
used the command below with metrics path `baseline.json`; candidate used `after.json`:

```sh
DOUGH_SLICE4_METRICS=/tmp/dough-slice4/after.json /usr/bin/time -p env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-session- dashboard/tests/agent-launch-matching-rules.spec.ts dashboard/tests/launch-workspace.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts dashboard/tests/agent-launch-ad-hoc-cursor-established.spec.ts dashboard/tests/one-shot-landing-capture dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/agent-launch-preparation-store-failure.spec.ts dashboard/tests/agent-launch-second-server-orphan.spec.ts dashboard/tests/agent-launch-own-record-continuation-race.spec.ts dashboard/tests/agent-launch-worker-handoff.spec.ts dashboard/tests/launch-attempt-worker.spec.ts --workers=3 --reporter=/tmp/dough-slice4/timing-reporter.ts
```

| Metric | Before | After |
| --- | --- | --- |
| Cases / Start cases | 87 / 40 | 79 / 32 |
| Aggregate test seconds | 390.161 | 304.146 |
| Playwright run seconds | 139.668 | 118.645 |
| Shell wall seconds | 140.10 | 119.26 |
| Start aggregate seconds | 212.228 | 108.357 |

This single comparable pair observes 86.015 fewer aggregate seconds (22.05%),
without claiming stable-machine speed. Tracked warning/continuation journeys
participated; the slow second-server worker case remains.

Temporary exact source mutations disabled workspace comparison and landing
comparison separately, then blank fallback/numbering. Each failed at the intended
rule assertions (false versus true for cross-choice requests; session versus story;
fix-it-3/fix-it-5 versus fix-it), then exact source bytes were restored. The final
comparison passed against restored production, whose final diff is empty.

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-matching-rules.spec.ts --grep 'ad hoc matching includes' --workers=3
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/launch-workspace.spec.ts --grep 'numbers the slug|makes a plain|Codex shares' --workers=3
npm run typecheck:dashboard
```

Independent refactor consolidated repeated native-call and retained-session
assertions in `support/unattachedLaunchAssertions.ts`, preserving test identities
and observations. The coordinator inspected the helper and both affected specs.
Both page suites and dashboard typecheck passed after extraction:

```sh
env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-ad-hoc.spec.ts dashboard/tests/agent-launch-start-session-existing-changes.spec.ts --workers=3
npm run typecheck:dashboard
```

Matching/slug mutations and other journey proof remain applicable. No new timing
claim was made after refactoring. The refactor independently ran hook-owned lint;
that unnecessary duplicate check did not change files or the acceptance basis.
