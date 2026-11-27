# Share the completion reporting arrangement in Node Vitest

**Identity:** SEED-413#share-completion-reporting-arrangement

**Source:** [Share the completion reporting arrangement in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#share-completion-reporting-arrangement)

## Source and provenance

A bounded Structure correction from the "Execution complete" product advice
of plan 870, _Prove session completion reporting in Node Vitest_
(`SEED-413#prove-session-completion-reporting-on-vitest`). Wrap-up deletes
that plan; read it at commit `9e1e7d150`:
`git show 9e1e7d150:.planning/slice-plans/870-prove-session-completion-reporting-on-vitest/PLAN.md`.
The advice recommended allowing a shared arrangement built only from
production operations, adding one small Structure correction to
`installedPublisher.ts`, and dropping `submitCompletion`'s second origin check.

## Goal and scope

Developers changing completion reporting read and extend the four Node
completion specs without repeating one arrangement, and the HTTP completion
path checks the origin headers once. Scope is the four specs
`dashboard/backend-tests/sessions/agent-completion-{identity,refusals,quiet-recovery,later-reports}.spec.ts`,
`dashboard/backend-tests/support/installedPublisher.ts`,
`dashboard/server/completionReporting.ts`,
`dashboard/server/completionAdmission.ts` and, if the loopback check moves,
`dashboard/server/localOrigin.ts`. Product behavior is unchanged. The
landing path's same shape (`submitLanding` runs `verifyLocalOrigin` and
`admitLandingRequest` checks origin again for the bridge) and the held-push
polls advised by plan 870 are outside this correction.

## Current findings

Read at `9e1e7d150`.

- Each of the four specs composes the same arrangement, about 120–150 lines
  in total: a private `HOME` under a temporary root with
  `vi.stubEnv("HOME", …)` and cleanup, `mountProjectConfiguration("production")`,
  the installed Codex reporting scripts through
  `installPublisherScripts(installedSkillPath("codex", …, "dough-execute-plan", "scripts"))`,
  and a kept launch: a MakeMe accepted attempt, `reportingContext`,
  `keepAttempt({ ...accepted, reporting })`, a MakeMe launch record
  `reportingThrough(reporting)`, `bindRecord("open-dough", record)` and
  `reportingInvocation(reporting.command)`. The identity spec's
  `privateWorkspace` and `keptLaunch` (lines 40–118) are the fullest form.
- `submitCompletion` (`completionReporting.ts` line 125) runs
  `verifyLocalOrigin(req)`, which refuses a non-loopback socket and then runs
  `verifySameOrigin` on the headers. It then calls `admitCompletionRequest`
  (`completionAdmission.ts` line 46), which checks the method and runs
  `verifySameOrigin` on the same headers again.
- `installedPublisher.ts` is 241 lines. The other bridge exports
  (`reportInstalled`, `reportingInvocation`, `installPublisherScripts`) have
  22 callers outside the file, all in backend session specs.

## Current decisions

- Terry decided on 27 November 2026 that plan 870's "add zero test-support
  wrappers" allows one shared arrangement built only from production
  operations. `installedPublisher.ts` is 241 lines, so the file-size rule
  calls for a split by responsibility. The completion-reporting part of the
  bridge (`reportInstalled`, `reportingInvocation` and the new
  domain-named arrangement) moves into one cohesive support module beside
  it, which the four specs import. The publisher part stays. Add no server,
  request or boundary wrapper. Compose records with
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md); a case keeps
  visible the values it observes.
- Keep `admitCompletionRequest`'s `verifySameOrigin`: the Node specs and the
  in-process bridge reach the origin check only there. On the HTTP path keep
  `verifyLocalOrigin`'s loopback socket refusal and check the origin headers
  once, for example by exporting the socket check from `localOrigin.ts` for
  `submitCompletion`. A cross-site non-POST request answers 403 today
  because the origin check runs first; keep that order, for example by
  checking the origin before the method in `admitCompletionRequest`.
- Follow the North Star on
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).

## Preserved promises

- Product behavior is unchanged, including each refusal status and its order
  on the HTTP completion endpoint and the loopback socket refusal.
- Every existing case keeps its observations; no case is removed or merged.
- The origin check inside `admitCompletionRequest` stays. Evidence: the
  Intent Coverage check at `9e1e7d150` skipped that `verifySameOrigin` and
  `agent-completion-refusals.spec.ts` line 114 (the cross-site case, 403)
  caught it.
- Every touched file stays at or under 250 lines.
- Keep default test timeouts. Apply the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure and repair handoff.

## Decisive premises

| Premise | Consuming operation and result |
| --- | --- |
| 1. The Node consumer selection runs green before the change | At `9e1e7d150` on 27 November 2026, Node 24.21.0, one worker, `caffeinate -s -i`, load 7.6–10.5: `npm run test:dashboard:backend -- '(sessions/agent-completion-(identity\|refusals\|quiet-recovery\|later-reports)\|launches/agent-launch-refusal)\.spec\.ts$' --workers=1` passed 41 Node cases (11 completion, 30 launch refusal) in 3.69 s. |
| 2. The Node specs own the admission origin check | The Intent Coverage break at `9e1e7d150` (see Preserved promises) was caught by `agent-completion-refusals.spec.ts:114`. |
| 3. No automated case observes the HTTP-only checks | At `9e1e7d150`, the completion endpoint `/__agent-launch/completion` is reached over HTTP only by `e2e/sessions/agent-completion-{quiet,execution,cursor}.spec.ts` through `reportedLaunch.ts` and `completionRecovery.ts`, all same-origin POSTs from loopback. No case covers the loopback socket refusal or the order of 403 and 405 on this endpoint, so the slice keeps them as they are in the code, and the review checks them. |
| 4. The retained HTTP journeys pass on the current code | Plan 870's slice 8 final run at `9e1e7d150`'s parent candidate passed the retained E2E journeys, including `agent-completion-quiet`, 11 Chromium cases with zero retries. |

## Ordered slices

### 1. Compose the completion reporting arrangement once and check the HTTP origin once

Type: Structure
Status: done
Estimate: 12–15 active minutes.

Proof: Move the completion-reporting part of the bridge into one cohesive
support module beside `installedPublisher.ts`, and add one domain-named
export there that composes
the private HOME, production configuration, installed Codex reporting scripts
and a kept Codex reporting launch from the production operations listed in
Current findings, and use it in the four specs in place of their local
arrangement. Narrow `submitCompletion` so the HTTP path keeps the loopback
socket refusal and checks the origin headers once, in
`admitCompletionRequest`, with origin before method. The Node selection of
premise 1 passes with the same 41 cases, `npm run typecheck:dashboard`
passes, and the retained E2E journeys that post completions over HTTP pass.
Every touched file is at or under 250 lines.

Accepted proof (27 November 2026, Node 24.21.0, one worker, `caffeinate -s -i`):
the premise-1 selection passed 41 cases; the other importers of the moved
exports (`agent-completion-{binding,early-recovery,quiet-rename}`,
`admitted-session-{no-change,shared-checkout}-completion`,
`declared-{worktree,blank-launch}-publication`, `ad-hoc-session-comparisons`)
passed 16, and after the refactor pass the seven `installedReporting.ts`
importers passed 19 and the `Reporter` users 4; the E2E selection passed 6
Chromium cases with zero retries (premise 4's 11 counted plan 870's wider
retained set); `npm run typecheck:dashboard` passed.

Learnings: `admitCompletionRequest` takes the body as a lazy read so the
HTTP order stays socket 403, origin 403, 405, then body 400/413, schema 400
and project 404; reading the body first would answer a cross-site POST with a
bad body 400. The completion-reporting bridge now lives in
`dashboard/backend-tests/support/installedReporting.ts` (`reportingHome`,
`keptReportingLaunch`, `reportInstalled`, `reportingInvocation`). The refactor
pass named the landing path's same double origin check
(`launchLandingReporting.ts` `submitLanding`) as a follow-up for wrap-up.

## Execution complete

Product advice: no change. The correction delivered its outcome without
changing behavior. For wrap-up: the seed's Scope still says the arrangement
is an export of `installedPublisher.ts` with no new support file, which the
27 November plan decision superseded; and the landing path's double origin
check (`submitLanding` plus `admitLandingRequest`) is a low-impact
redundancy that this correction left out of scope, which can take the same
`verifyLoopbackSocket` correction if it is ever worth the cost.

## Proof ownership and local gate

| Observable proof | Owner |
| --- | --- |
| Completion delivery, refusals with the earlier message kept, recovery and later reports | `dashboard/backend-tests/sessions/agent-completion-{identity,refusals,quiet-recovery,later-reports}.spec.ts` (11 cases) |
| Admission origin check | `agent-completion-refusals.spec.ts` cross-site case |
| Launch boundary refusals through the production `answer` | `dashboard/backend-tests/launches/agent-launch-refusal.spec.ts` (30 cases) |
| HTTP completion acceptance through `submitCompletion` | `e2e/sessions/agent-completion-{quiet,execution,cursor}.spec.ts` |
| Changed typed contracts | `npm run typecheck:dashboard` |

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR npm run test:dashboard:backend -- '(sessions/agent-completion-(identity|refusals|quiet-recovery|later-reports)|launches/agent-launch-refusal)\.spec\.ts$' --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR npm run test:e2e -- 'e2e/sessions/agent-completion-(quiet|execution|cursor)\.spec\.ts$' --workers=1
npm run typecheck:dashboard
```

Also run every other spec that imports a changed `installedPublisher.ts`
export (`agent-completion-{binding,early-recovery}` and
`admitted-session-no-change-completion`). Use awake macOS on AC under
`caffeinate -s -i` for long local checks per [AGENTS.md](../../../AGENTS.md).

## Plan review

One Structure slice serves the correction's whole outcome: removing a
repeated arrangement and a duplicated check, with behavior pinned by the
existing cases. Open concern: `installedPublisher.ts` is 241 lines, so a
shared arrangement of the size the specs repeat cannot fit there within the
250-line limit. Resolved at wrap-up of plan 870: the file-size rule's split
by responsibility moves the completion-reporting part of the bridge into
one cohesive support module beside it. That module removes more spec lines
than it adds and introduces no new wrapper.
