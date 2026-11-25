# Pass session observation limits as typed values

**Identity:** SEED-413#pass-session-observation-limits-as-typed-values

**Source:** [Session observation limits](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#pass-session-observation-limits-as-typed-values)

## Goal and scope

A correction of [machine-session reads](https://github.com/terryyin/open-dough/blob/0c7ad7e2c6019d0b736e8e04ff4218ee61944e10/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-backend-families-after-browser-reporter) ([plan](https://github.com/terryyin/open-dough/blob/0c7ad7e2c6019d0b736e8e04ff4218ee61944e10/.planning/slice-plans/829-prove-machine-session-reads-through-typed-answers/PLAN.md)),
reviewed at commits `58c8cc033`..`97592f7a9` on
`claude/prove-machine-session-reads-through-typed-backen`. Unit cases set
the machine-session observation's wait and reuse window as typed values.
The production adapter alone reads `DOUGH_SESSIONS_WAIT_MS` and
`DOUGH_SESSIONS_REUSE_MS`. Answers, revisions, sharing and fresh demand
stay unchanged. Cursor held sessions, which read the same reuse variable,
are outside this correction.

## Current findings

- `MachineSessionObservation` reads both limits from the process
  environment at use time (`waitMs` and `reuseMs` through `configuredLimit`
  in `dashboard/server/machineSessionObservation.ts`).
- So `agent-launch-sessions-fresh.spec.ts` stubs
  `DOUGH_SESSIONS_REUSE_MS` with `vi.stubEnv` to hold its observation.
  This conflicts with the project's unit-test seam rule: a handler takes
  the state it reads as typed input, and the wire adapter alone reads
  process-wide configuration.

## Current decisions

- Follow the North Star for [directly testable production
  code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
- The constructor takes the limits beside its read and inputs. The
  production wiring in `dashboard/server/launchBoundary.ts` supplies
  `configuredLimit` values, preserving the 30 s wait and 1 s reuse
  defaults and the started-server overrides
  (`agent-launch-codex-observation-wait.spec.ts`,
  `support/fakeClaude.ts`, `agent-launch-host-switch-fresh.spec.ts`).
- Preserved promises: every assertion in the six machine-session read
  specs and the started-server observation consumers.

## Decisive premises and baseline

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Only the production boundary and three unit specs construct the observation | `grep -rn "new MachineSessionObservation" dashboard` | At `97592f7a9`, 25 November 2026: `launchBoundary.ts` and the encoding, fresh and unchanged specs. |
| Started-server cases set the limits through the environment | Same search for both variable names | At `97592f7a9`: the observation-wait spec, the synthetic Claude support and the host-switch E2E; Cursor held sessions read the reuse variable separately. |

## Ordered slices

### 1. Hold the observation through a typed reuse window

Type: Behavior
Status: done
Estimate: 6–9 active minutes.

Given a fresh-demand case that needs a 60 s reuse window, construct the
observation with that window. Observe the unchanged held answer and the
fresh answer exactly as now, with no environment stub. The adapter
passes the configured limits. Prove the six read specs, then the
started-server observation consumers: wait, sharing, concurrency and
alerts.

## Concern evidence

Slice-plan refinement was unnecessary: one constructor contract and its
four callers form one proof loop. No slice-specific concern remains.

## Verification and delivery

- Local gate uses the maintained [macOS sleep
  guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power and the shared [failure
  policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout. Use MakeMe for backend sources.
- Run `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'backend-tests/sessions/(agent-launch-session-listing|agent-launch-sessions-(encoding|fresh|history|listing|unchanged)|agent-launch-codex-observation-(wait|sharing|concurrency|alerts))\.spec\.ts' --workers=2`,
  Dashboard typecheck and staged lint. Hosted CI runs the groups after
  publication.

## Execution evidence

- Story Branch Mode in `codex/pass-session-observation-limits-as-typed-values`,
  published from claim `a5a980624b66450da07fbe07146fbb750f79e445` on `origin`.
  GitHub Actions `ci.yml` observes the execution branch through coordinator
  `seed-413-limits-1ef52d26` in `/tmp/dough-ci-501/watch-CPI2Ma`.
- Slice 1 passed the ten-spec local gate with 35 Node Vitest cases and eight
  started-server Chromium cases. The fresh-demand case retains the prior
  revision on ordinary demand and sees the updated Codex options under a new
  revision on fresh demand. The started-server cases observed the configured
  wait bound, sharing and expiry, concurrency, and alert continuity.
- `caffeinate -s -i npm run test:e2e -- agent-launch-host-switch-fresh.spec.ts agent-launch-retained-history.spec.ts --workers=1`
  passed three Chromium cases, covering the production reuse override during
  host switching and the revision and gzip behavior of the history reader.
  `npm run typecheck:dashboard` passed. The independent refactor review found
  no edits needed, so the observed proof still applies.
