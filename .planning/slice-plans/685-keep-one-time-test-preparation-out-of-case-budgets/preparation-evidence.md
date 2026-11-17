# Preparation evidence and executable routes

Baseline: `baaf914daaec3376fa5ed303920eb83488b37910`, 2026-11-17,
owned worktree `keep-one-time-browser-test-preparation-out-of-ca` on macOS,
Node 24.21.0. No product/test implementation remains in this preparation.

## Conditions and current observations

Before bounded proof: AC power, load 7.00/7.99/8.27, 61% memory free; ordinary
OS and other agents' work visible, no owned competing test run. Named commands
were sequenced with one worker and `caffeinate -s -i`. Later load 8.66 and
then 5.57; no burners were started. These are lower-load route and premise
observations, not acceptance at load 30–50 and not a speed comparison.

The initial boundary command failed before behavior: local node_modules was
absent, so serverBundle's mkdtemp under that directory got ENOENT. `npm ci
--ignore-scripts` installed the locked dependencies. The changed-condition
rerun below passed all three cases; the failure is not waived. Plain Node
strip-only imports also refused a transitive TypeScript parameter property;
the copy observation uses the actual Playwright backend loader, and the
separate artifact-cost observation uses explicit transform-types.

Every group run requested its own unique external proof-record JSON and the
existing artifact trace through environment variables, without replacing the
strict reporter. Records in `/tmp/seed-340-preparation-observations/` supplied
completed/passed strict verdicts and attempts; the bounded excerpts below are
the retained evidence, not a dependency on those disposable paths.

| Command (each prefixed `caffeinate -s -i`) | Observed result |
| --- | --- |
| `npm run --silent test:dashboard:backend -- review/story-review-state-admission.spec.ts --workers=1 --trace=on` | 3/3, 5.726 s runner; cases 820/631/614 ms. Bundle preparation 451 ms, zero app requests. |
| `npm run --silent test:e2e -- intent/intent-ci-comparison-retry.spec.ts --workers=1 --trace=on` | 2/2, 12.636 s runner; cases 5214/2666 ms. App 2512 ms, bundle 107 ms, then queued Claude origin 515 ms. Full retry and shallow/unshallow tails complete. |
| `npm run --silent test:dashboard:frontend -- intent/intent-done-source-selection.spec.ts --workers=1` | 1/1, 6.787 s runner, 4518 ms case. App 1797 ms; no server-bundle or origin requests. Held comparison and locations, old-source absence and final Story B source observed. |
| `npm run --silent test:e2e -- sessions/session-alerts-navigation.spec.ts --workers=1` | 2/2 dev/preview, 9.712 s runner, 4346/3739 ms cases. Preview app 1474 ms, bundle 114 ms. Actual serving URL navigation and no further host action observed. |
| `npm run --silent test:dashboard:backend -- terminals/agent-terminal-codex.spec.ts --workers=1` | 3/3, 5.511 s runner, 2052/475/1187 ms cases. Bundle 202 ms and zero app requests; native resume/transport/detach, missing target and done intent assertions retained. |
| `npm run --silent test:dashboard:integrated -- navigation/story-reference-identity.spec.ts --workers=1` | 2/2, 6.737 s runner, 2120/2551 ms cases. Queued description's added dependency revision supports recorded identity navigation and project-specific references. |
| `npm run --silent test:dashboard:backend -- runtime/preparation-origin-copy-probe.spec.ts --workers=1` | Scratch 1/1, 2.743 s runner, 2023 ms case. Complete real-CLI history, two independent copies, matching graph/refs/merge endpoint, fsck and local remote rewriting; a push to one copy leaves source/peer unchanged. |

The [copy probe source](origin-copy-probe.spec.ts.txt) is retained for recovery:
copy it to `dashboard/backend-tests/runtime/preparation-origin-copy-probe.spec.ts`,
run its command in the owned execution checkout, and remove it before delivery.
It deliberately changes its process-local queued snapshot only within that
single scratch test. Final runtime code must instead bind a history-specific
snapshot; sharing that queued slot with unrelated tests would be incorrect.
The probe does not prove the final worker wiring or replace full retry proof.

Two queued layouts were also acquired concurrently through the actual
`startRunArtifacts(new Map(startOriginArtifacts()))` owner and
`requestRunArtifact(startOriginArtifactKey(host, "queued"))`, then teardown
was awaited. Command form: `caffeinate -s -i node
--experimental-transform-types --input-type=module`, importing current
`runArtifacts.ts` and `startOriginPreparation.ts`. Claude 1609 ms, Codex
1668 ms, combined 1672 ms. This observes both artifact keys and bounded
lower-load elapsed cost. Loader differences supply no Playwright timing
claim; case-budget proof must use the group runner.

## Recoverable prior evidence

- Common worker correction, controlled 31-second app preparation red/green,
  five custom profiles and exact hosted acceptance:
  `git show fbfaa116b961a445cc606fd05363bf75f6ecad5f:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/ci-repair.md`.
  On the current common path, the diff since that revision is only a
  launchJourney comment; dashboardTest and preparationPage are unchanged.
- Known proof gap: [SEED-391 completion report](../../done/SEED-391_redo-the-effort-story-under-the-test-focus-guidance.json).
  At fbfaa116b, common boundary preparation was faulted to request app
  unconditionally. Review-state admission still passed while artifact tracing
  recorded a real 1.993-second app build. Baseline/restored were green with
  zero app requests. The new infrastructure assertion must discriminate this
  same effect without modifying review-state product assertions.
- Loaded retry diagnosis:
  `git show 309dacb410f71134bc1ff76b668bed907d541f4d:.planning/slice-plans/651-move-intent-ci-proof-comparison-and-candidate-checks/diagnosis-comparison-retry-e2e-timeout.md`.
  Natural load about 27–35, two default-budget failures; diagnostic lifted
  timeout observed 32.9/33.0 s, including about 9.5 s real-Git arrangement.
  Diagnostic timeout changes were removed and are no repair authority.
  Current spec, storyCiComparisonDoneFixture and completedPublishedStory
  have no diff from that revision. Source reading preserves every comparison,
  upstream accounting and reselection beat, not only the failing response.

## Execution selections

Request a new absolute `<prefix>_PROOF_RECORD` and
`OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE` path for each invocation. Keep the strict
reporter; use the maintained commands and unchanged default timeout. Cold
producer gates must synchronize by an observed request/release and test-clock
boundary, not sleep. Add consumer fixtures to the existing artifact proof
subprocess harness and run new infrastructure proof through Backend Test.

Initial named selections (expand from actual changed-effect consumer trace):

```sh
npm run --silent test:dashboard:backend -- runtime/test-preparation-budget.spec.ts runtime/dashboard-artifact-demand.spec.ts review/story-review-state-admission.spec.ts --workers=1
npm run --silent test:e2e -- navigation/side-panel-content-replacement.spec.ts intent/intent-ci-comparison-retry.spec.ts intent/intent-done-default-answer-selection.spec.ts --workers=1
npm run --silent test:dashboard:integrated -- navigation/story-reference-identity.spec.ts --workers=1
npm run --silent test:dashboard:frontend -- intent/intent-done-source-selection.spec.ts --workers=1
npm run --silent test:e2e -- sessions/agent-launch-story-card-session-states.spec.ts sessions/session-alerts-navigation.spec.ts terminals/agent-terminal-lifetime.spec.ts terminals/agent-terminal-touch-composer.spec.ts --workers=1
npm run --silent test:dashboard:backend -- terminals/agent-terminal-codex.spec.ts --workers=1
npm run typecheck:dashboard
```

For first-case and no-unused-artifact assertions, use fresh inner/outer runs
with one selected profile, not a combined dev/preview trace. Include both hosts,
repository overrides, each preparationPage group setup, frontend app-only, and
the common boundary readiness path. Gate real preparation, observe completion
outside case time, and preserve run-owned cleanup/failure propagation. New
runtime cases assert outcomes, not fixture registration text or hardcoded
worker counts. MakeMe selects true for all these test roots; pageObjects is
true in E2E, Integrated and Frontend and off in Backend. Recheck new paths.

For the explicit loaded acceptance, rerun the whole side-panel, Done-source
and retry journeys as fresh first cases at natural one-minute load 30–50.
Record power, load before/after, concurrency, case and total elapsed, cold
artifact/worker boundaries and remaining 30-second headroom. Retain every
independent assertion. No current lower-load observation settles that promise.
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and [resource/sleep rules](../../../Distribution/tests/local-test-resources.md)
through terminal outcomes; unavailable required load leaves this proof owed.
