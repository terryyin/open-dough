# Slice 6 independent post-change refactoring

The new Frontend and surviving Integrated revision openers repeated the same
app entry, jobs-feature selection and Archive source precondition. Existing
`intentRevisionJourney.ts` now owns `openJobsFeature`; both transport-specific
openers call it after their unchanged setup. Publication, paused clock, stream
slot preholding and revision stimuli retain their previous owners. The existing
frontend imports already reach this module for `intentReads` and fixture data;
no additional server lifecycle is invoked by the shared browser operation.
`frontendIntentRevisionAnswers.ts` also stops storing an unused project object
inside each immutable snapshot; source heads and canonical answers are unchanged.

Paths changed by refactoring: `dashboard/tests/intentRevisionJourney.ts`,
`dashboard/tests/support/frontendIntentRevisionJourney.ts`,
`dashboard/tests/support/frontendIntentRevisionAnswers.ts`; companion proof,
consumer and helper-observation records follow those seams. No product file,
subsystem boundary, test body or expected expression changed. No source was
renamed, deleted or split by refactoring. These helpers remain below250 lines.

The read-only checks found no other justified candidate. MakeMe and page-object
selection resolved true for all five maintained specs and the existing
home-activation consumer. ADR0002's whole-product cohesion, ADR0008's published
source/reading distinction and ADR0010's bounded evidence claims remain intact;
no exception or disputed plan restriction was needed.

## Current proof and preserved observations

AST comparison against37fb6a94cbb6 independently matched all118 observing
statements in original order and with identical expected expressions:
notice39, planning-only16, settings-update10, update-boundaries14, outcomes39.
Nine opener invocations still observe Archive source via `openJobsFeature`;
the unchanged scroll helper supplies the tenth measured observation.

The extraction changes setup locations for Frontend9 and the live old opener's
one newer-notice home-activation case, so those were renewed. Exact commands:

```sh
OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/slice6-refactor-frontend-proof.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-revision-notice.spec.ts frontend-tests/intent/intent-revision-planning-only.spec.ts frontend-tests/intent/intent-revision-settings-update.spec.ts frontend-tests/intent/intent-revision-update-boundaries.spec.ts frontend-tests/intent/intent-revision-update-outcomes.spec.ts --workers=1
OPEN_DOUGH_DASHBOARD_INTEGRATED_PROOF_RECORD=/tmp/slice6-refactor-integrated-proof.json caffeinate -s -i npm run test:dashboard:integrated -- tests/intent/intent-home-activation.spec.ts --grep 'with a newer revision waiting behind its notice' --workers=1
npm run typecheck:dashboard
```

All exit0. Both browser records retain the exact configs/paths/case selection,
completed phase, strict passed verdict and one passed attempt per case, with no
retry. Logs: `/tmp/slice6-refactor-frontend.log`,
`/tmp/slice6-refactor-integrated.log`, `/tmp/slice6-refactor-typecheck.log`.
The shared setup is `intentRevisionJourney.ts:62`; the original Archive
expectation is unchanged at line69. Its Frontend caller is
`frontendIntentRevisionJourney.ts:43`; Integrated caller line88. The original
home-activation case opens through that caller, then activates CI status and
observes deselection, one notice, original shown revision and one locations read.
The five assertion maps retain every converted scenario's observations.

Accepted Frontend target-line recovery2 keeps the same independent opener,
controlled answers, `intentReads` implementation and assertions, so its portion
of `/tmp/slice6-final-proof.json` is reused. Backend17's real HTTP/acquisition/
settings/SSE setup and assertions and E2E6's real publication, classified retry,
heads-check+1, project acquisition and visibility setup/assertions are unchanged;
`/tmp/slice6-backend-proof.json` and `/tmp/slice6-e2e-proof.json` are reused.
All records were inspected for exact configuration and selection, completed
strict pass and one passed attempt each. The old/restored notice and same-fault
discrimination retain the identical assertion and browser steps; extraction
changes no setup input or outcome, so that proof is reused as well.

## Consumer trace and resource decision

Installed consumer-trace ran with the three refactor source paths and terms
`openJobsFeature`, `openWithFeatureSelected`,
`installFrontendIntentRevisionAnswers`, `intentReads`. Raw output is
`/tmp/slice6-refactor-consumer-raw.md`; every located path has an explicit
current disposition in `/tmp/slice6-refactor-consumer-dispositions.md`.
The prior728-path and16-path traces were inspected and retain no blank cells;
the current trace supersedes their old-opener/home-activation exclusions.
Local `intentReads` declarations are independent observers rather than imports.
Shared source and answer semantics remain limited to their actual callers.

Before launch, this macOS host had16 logical CPUs, load4.01/4.19/4.01,
70% memory free and AC100%. Unrelated CPU work was inspected and left owned;
no other owned Playwright proof was running. Prior Frontend11 completed in16s.
Sequential one-worker runs under `caffeinate -s -i` retained the full affected
selection; both completed well inside10minutes. No required observation is
deferred; renewed contention or a failure would require reconsideration under
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
`git diff --check` passed; coordinator retains formatter/lint, delivery and CI.
