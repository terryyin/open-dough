# Slice 2 consumer trace and final proof

Trace: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term controlFrontendAuthenticatedRead --term useFrontendRevisionChecks --term readFailure --term advanceRecoveryClock --term limiting`.
Full output with an individual disposition for every listed path: `/tmp/647-slice2-consumer-trace-final.md`.

The change relocates detailed Intent recovery registration and adds test-only controlled authenticated-read failures. Existing production APIs, data, page-object APIs and shared harness values are unchanged. New controls are consumed only by the converted Frontend cases, all nine passed. The existing held-read helper still supplies the original release/failure protocol. `preholdRevisionStreamSlots` in `dashboard/tests/support/revisionStreamSlots.ts` now owns the genuine navigator-lock precondition for dashboardTest, the converted Frontend recovery cases and connection-logo. Actual navigator locks occupy the same slots as dashboardTest’s original fixture, so the product makes its real revision-check requests; no real SSE is claimed.

| Meaningful consumer | Disposition |
| --- | --- |
| Three converted Frontend specs | run: all nine settings/15-30-60-60/hidden/shared/manual/rate/held-source cases passed. |
| E2E intent-read-boundary-recovery | run: real settings/listing classification and real rate-limit/directed wait, exact heads-check delta, retry/UI healing passed in all three cases. |
| Backend authenticated-read-intent-locations[-problems] | run: six real-server classification/admission/refusal cases passed. |
| intent-shared-reads | run: seven supplemental client-contract cases passed with fetch substituted; this is not server/GitHub upstream-count evidence despite its folder. |
| E2E intent-gherkin-unusable | excluded: only current companion comment points to moved Frontend source; scenario/setup/assertions unchanged. |
| Existing page objects, fixtures, holds, clocks and other callers | excluded: contracts/values unchanged; lexical helper references do not import deleted specs or new controls. Individual paths have reasons in full trace. |
| Integrated registration/duration consumers | run: list-only command passed, 214 tests/104 files; only converted three paths and their three timing rows removed. |
| Production/guidance/historical records | excluded: no product behavior or recorded source identity changed; broad lexical matches only. |

Assertion-by-assertion disposition, literal commands and setup/observer locations are in [slice-2-proof.md](slice-2-proof.md), written before deleting originals. No affected consumer lacks proof. No source/review promise was weakened.

Additional PASS: `npm run test:dashboard:integrated -- --list --reporter=line`, `/tmp/647-slice2-integrated-list.log`; all three converted paths absent, remaining registration intact.

CI repair resumed at `13a08cafd240592c7b8832fc7b8b0a9186cd0617`; only productionWatcherMachine changed. All Intent promise/boundary/setup/observation locations remain compatible, so focused proof is reused.

Refactor delivered the coordinator’s cohesive reorganization: navigator-lock
preholding moved into the focused19line `revisionStreamSlots.ts`; dashboardTest
keeps server/GitHub lifecycle and is239lines. The authenticated-read control now
owns only controlled failure answers. All changed files remain below250lines.

Refactor trace: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path dashboard/tests/support/revisionStreamSlots.ts --path dashboard/tests/dashboardTest.ts --path dashboard/tests/support/frontendAuthenticatedReadControl.ts --term preholdRevisionStreamSlots --term holdRevisionStreamSlots --term useFrontendRevisionChecks --term revisionStreamSlotLockNames`.
Full output with every listed consumer’s disposition:
`/tmp/647-slice2-refactor-consumer-trace.md` (421 paths:3 run,303 reused,115 excluded).
Actual default-preheld fixture consumers reuse equivalent-purpose fresh E2E
auto-refresh and Integrated candidate-revision proof; explicit opt-outs reuse
fresh real-stream quiet-minute and seven-page holder-hide transfer proof. Unchanged
expect/clock/type-only imports and no-page boundaries exclude browser installation
for concrete reasons. Exact commands, setup/observations and accepted proof are
recorded in [slice-2-proof.md](slice-2-proof.md#refactor-proof). The coordinator's
covering Frontend run passed with2workers after the initial refactor return.

Private source-setup follow-up trace:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path dashboard/frontend-tests/intent/intent-read-recovery.spec.ts --term putScriptIntentSources`.
`/tmp/647-slice2-private-setup-consumers.md` disposes all three located record references
as excluded from runtime setup. The private helper has only four same-file callers;
fresh proof runs all5 maintained recovery cases, including the distinct malformed
case. It passes and projects to242formatted lines, with every assertion retained.
Other consumers reuse the covering group and earlier unchanged-boundary proof.

Failure policy: [shared policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

PASS after final E2E addition: `npm run typecheck:dashboard`, terminal exit0, `/tmp/647-slice2-typecheck-final.log`.

Coordinator covering PASS: `caffeinate -s -i npm run test:dashboard:frontend -- --workers=2`, terminal exit0, `/tmp/647-slice2-frontend-group.log` and `.exit`. Awake AC host, load7.03/10.40/10.72,44%memory free, no competing Playwright run seen. This covers all unchanged shared-slot and connection-logo consumers. After the private setup consolidation, the five affected recovery cases passed again (literal command above); no other accepted boundary changed.

Delivery source unchanged at pinned trunk `7bb9992277410f6b5c3ba8da0b461c3c61939a84`, base `0f2cfeb0`; named CI/navigation sibling product paths are unchanged. The inherited watcher repair remains published/observed at `13a08caf`.
